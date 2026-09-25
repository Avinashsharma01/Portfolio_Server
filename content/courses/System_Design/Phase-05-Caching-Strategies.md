# Phase 05 — Caching — Strategies, Eviction & Invalidation

## Table of Contents

- [What Is Caching?](#what-is-caching)
- [Why Caching Is Critical](#why-caching-is-critical)
- [Where to Cache — The Caching Layers](#where-to-cache--the-caching-layers)
- [Cache Write Strategies](#cache-write-strategies)
- [Cache Eviction Policies](#cache-eviction-policies)
- [Cache Invalidation — The Hard Problem](#cache-invalidation--the-hard-problem)
- [Distributed Caching](#distributed-caching)
- [Cache Stampede / Thundering Herd](#cache-stampede--thundering-herd)
- [Redis & Memcached — Cache Technologies](#redis--memcached--cache-technologies)
- [CDN Caching](#cdn-caching)
- [Caching Best Practices](#caching-best-practices)
- [Key Takeaways](#key-takeaways)
- [Practice Exercises](#practice-exercises)

---

## What Is Caching?

Caching is storing a **copy of frequently accessed data** in a faster storage layer so future requests can be served quicker.

```
Without Cache:                        With Cache:

Client → Server → Database            Client → Server → Cache (HIT!) → Response
         (every request hits DB)                     ↓ (MISS)
         Response time: ~100ms                   Database
                                                 Response time: ~5ms (cache hit)
```

### Real-World Analogy

Think of your **desk vs a library**:

| Library | System |
|---------|--------|
| Library shelves | Database (huge, organized, but slow to find books) |
| Your desk | Cache (small, but the books you use most are right there) |
| Walking to the library | Database query (~100ms) |
| Grabbing a book from your desk | Cache lookup (~1ms) |

You can't fit the entire library on your desk, so you keep only the **most useful books** there.

---

## Why Caching Is Critical

### The Speed Difference

```
Storage Layer         Access Time       Relative Speed
──────────────────    ──────────────    ───────────────
L1 CPU Cache          ~1 ns             1x
L2 CPU Cache          ~4 ns             4x
RAM (Memory)          ~100 ns           100x
SSD                   ~16,000 ns        16,000x
Redis (Network)       ~500,000 ns       500,000x
Database Query        ~5,000,000 ns     5,000,000x
Cross-Internet API    ~150,000,000 ns   150,000,000x
```

### Impact on System Performance

```
Scenario: E-commerce product page
  - 10,000 requests/second for popular products
  - Database can handle 5,000 queries/second

Without Cache:
  10,000 req/s → Database (5,000 max) → 💥 Database overwhelmed!

With Cache (90% hit rate):
  10,000 req/s → 9,000 served from cache → 1,000 hit database ✓
  Database load reduced by 90%!
```

### Cache Hit Ratio

```
Cache Hit Ratio = Cache Hits / (Cache Hits + Cache Misses) × 100%

Hit:  Data found in cache → serve immediately (~1ms)
Miss: Data not in cache → query database → store in cache → serve (~100ms)

Target hit ratios:
├── 80-90%: Good for most applications
├── 95%+:  Excellent — database barely touched
├── 99%+:  Outstanding — only cold starts miss
└── < 70%: Cache isn't effective, re-evaluate strategy
```

---

## Where to Cache — The Caching Layers

Caching can happen at **every layer** of your system:

```
┌──────────────────────────────────────────────────────┐
│                    CACHING LAYERS                     │
├──────────────────────────────────────────────────────┤
│                                                       │
│  1. Browser Cache                                     │
│     └── CSS, JS, images cached locally                │
│                                                       │
│  2. CDN Cache                                         │
│     └── Static assets cached at edge locations        │
│                                                       │
│  3. API Gateway / Reverse Proxy Cache                 │
│     └── Nginx caches full API responses               │
│                                                       │
│  4. Application-Level Cache                           │
│     └── In-memory cache (Node.js Map, local cache)    │
│                                                       │
│  5. Distributed Cache                                 │
│     └── Redis / Memcached (shared across servers)     │
│                                                       │
│  6. Database Cache                                    │
│     └── Query cache, buffer pool, result cache        │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Layer Details

| Layer | What's Cached | TTL | Hit Speed |
|-------|--------------|-----|-----------|
| **Browser** | Static files, API responses (via headers) | Minutes to months | Instant (0ms) |
| **CDN** | Images, videos, static pages | Hours to days | ~5-50ms |
| **Reverse Proxy** | Full HTTP responses | Seconds to minutes | ~1-5ms |
| **Application** | Computed results, hot data | Seconds to minutes | < 1ms (local RAM) |
| **Distributed (Redis)** | Sessions, DB query results, computed data | Minutes to hours | ~1-5ms (network) |
| **Database** | Query results, buffer pool | Varies | ~1-10ms |

---

## Cache Write Strategies

When data changes, you need a strategy for updating both the database and the cache. This is where things get interesting.

### 1. Cache-Aside (Lazy Loading)

The **most common** strategy. Application manages cache and database separately.

```
READ:
┌──────┐   1. Check cache    ┌───────┐
│ App  │──────────────────►│ Cache  │
│      │◄─────────────────│        │ HIT → return data
│      │   2. Cache miss   └───────┘
│      │                    
│      │   3. Query DB     ┌──────┐
│      │──────────────────►│  DB  │
│      │◄─────────────────│      │
│      │   4. Store in cache└──────┘
│      │──────────────────►┌───────┐
│      │                   │ Cache │
└──────┘                   └───────┘

WRITE:
┌──────┐   1. Write to DB   ┌──────┐
│ App  │──────────────────►│  DB  │
│      │   2. Delete cache  ┌───────┐
│      │──────────────────►│ Cache │ (invalidate)
└──────┘                   └───────┘
```

| Pros | Cons |
|------|------|
| Only cache data that's actually requested | Cache miss = slower response |
| Cache failure doesn't break writes | Data can become stale between write and invalidation |
| Simple to implement | Two separate calls (cache + DB) |

```javascript
// Cache-Aside pattern in Node.js
async function getUser(userId) {
    // 1. Check cache
    const cached = await redis.get(`user:${userId}`);
    if (cached) return JSON.parse(cached); // Cache HIT

    // 2. Cache miss — query database
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    // 3. Store in cache with TTL
    await redis.setex(`user:${userId}`, 3600, JSON.stringify(user)); // 1 hour TTL

    return user;
}

async function updateUser(userId, data) {
    // 1. Update database
    await db.query('UPDATE users SET ... WHERE id = ?', [userId]);

    // 2. Invalidate cache
    await redis.del(`user:${userId}`);
}
```

### 2. Write-Through

Every write goes to **both** the cache and database simultaneously.

```
WRITE:
┌──────┐   1. Write to cache   ┌───────┐   2. Write to DB   ┌──────┐
│ App  │──────────────────────►│ Cache │───────────────────►│  DB  │
└──────┘                       └───────┘                    └──────┘

READ:
┌──────┐   Always from cache   ┌───────┐
│ App  │◄─────────────────────│ Cache │  (always has latest data)
└──────┘                       └───────┘
```

| Pros | Cons |
|------|------|
| Cache always has latest data | Write latency increases (write to both) |
| Reads are always fast (always hit) | Cache may store rarely-read data |
| Data consistency guaranteed | More complex implementation |

### 3. Write-Behind (Write-Back)

Writes go to cache **immediately**, then database is updated **asynchronously**.

```
WRITE:
┌──────┐   1. Write to cache   ┌───────┐
│ App  │──────────────────────►│ Cache │  ← Returns immediately!
└──────┘                       └───┬───┘
                                   │
                            2. Async write (batch/delayed)
                                   │
                                   ▼
                               ┌──────┐
                               │  DB  │
                               └──────┘
```

| Pros | Cons |
|------|------|
| Fastest write performance | Risk of data loss if cache crashes before DB write |
| Reduces DB write load (batching) | Complex — need to handle failures |
| Good for write-heavy workloads | Eventual consistency between cache and DB |

### 4. Read-Through

Similar to cache-aside, but the **cache itself** is responsible for loading data from the database on a miss.

```
READ:
┌──────┐   1. Read from cache   ┌───────┐   2. Miss → Cache loads from DB   ┌──────┐
│ App  │──────────────────────►│ Cache │─────────────────────────────────►│  DB  │
│      │◄─────────────────────│       │◄────────────────────────────────│      │
└──────┘   3. Return data      └───────┘   4. Data loaded & cached        └──────┘
```

### Strategy Comparison

| Strategy | Read Speed | Write Speed | Consistency | Data Loss Risk | Best For |
|----------|-----------|-------------|-------------|---------------|----------|
| **Cache-Aside** | Fast (hit) / Slow (miss) | Fast | Eventual | Low | General purpose |
| **Write-Through** | Always fast | Slow | Strong | None | Read-heavy, consistency needed |
| **Write-Behind** | Always fast | Very fast | Eventual | Medium | Write-heavy workloads |
| **Read-Through** | Fast (hit) / Slow (miss) | N/A | Eventual | Low | Simplified cache-aside |

---

## Cache Eviction Policies

The cache has **limited space**. When it's full, what gets removed to make room for new data?

### LRU — Least Recently Used

Remove the data that **hasn't been accessed** for the longest time.

```
Cache (max 4 items):

Access: A B C D     → Cache: [D, C, B, A]
Access: E           → Cache: [E, D, C, B]  ← A evicted (least recently used)
Access: C           → Cache: [C, E, D, B]  ← C moves to front (recently used)
Access: F           → Cache: [F, C, E, D]  ← B evicted
```

> **Most popular** eviction policy. Works well for most workloads because recently accessed data is likely to be accessed again.

### LFU — Least Frequently Used

Remove the data that has been accessed the **fewest total times**.

```
Cache with access counts:
A (accessed 100 times)
B (accessed 5 times)    ← LFU would evict this
C (accessed 50 times)
D (accessed 75 times)
```

| Pros | Cons |
|------|------|
| Keeps popular items in cache | Old popular items may never get evicted |
| Good for stable access patterns | Doesn't adapt to changing patterns |

### FIFO — First In, First Out

Remove the **oldest** item in the cache, regardless of usage.

```
Cache (max 3):
Add A → [A]
Add B → [A, B]
Add C → [A, B, C]
Add D → [B, C, D]    ← A removed (first in)
```

### Random Replacement

Remove a **random** item. Simple and surprisingly effective.

### TTL — Time to Live

Data **expires** after a set time, regardless of access patterns.

```
redis.setex("user:123", 3600, userData);  // Expires after 1 hour

Time 0:00  → Data stored
Time 0:30  → Data accessed → returned
Time 1:00  → Data expired → automatically removed
Time 1:01  → Data accessed → MISS → fetch from DB again
```

### Eviction Policy Comparison

| Policy | Best For | Weakness |
|--------|----------|----------|
| **LRU** | General purpose, most workloads | Doesn't consider frequency |
| **LFU** | Stable, predictable access patterns | Slow to adapt to new patterns |
| **FIFO** | Simple workloads | Ignores access patterns entirely |
| **Random** | When no clear pattern exists | Unpredictable |
| **TTL** | Data that must be fresh | May evict frequently used data |

> **Recommendation:** Use **LRU + TTL** together. LRU handles capacity, TTL handles freshness.

---

## Cache Invalidation — The Hard Problem

> *"There are only two hard things in Computer Science: cache invalidation and naming things."* — Phil Karlton

Cache invalidation is deciding **when and how to remove or update stale data** from the cache.

### The Staleness Problem

```
Time 0:  DB has user.name = "Avinash"
         Cache has user.name = "Avinash"  ✓ Consistent

Time 1:  DB updated: user.name = "Avinash Sharma"
         Cache still has: user.name = "Avinash"  ✗ STALE!

Time 2:  User reads from cache → gets "Avinash" (WRONG!)
```

### Invalidation Strategies

#### 1. TTL-Based Invalidation

Set an expiration time. Accept staleness within that window.

```
Cache TTL = 60 seconds

Write: Update DB → Data might be stale for up to 60 seconds
After 60s: Cache expires → next read fetches fresh data from DB
```

**Acceptable for:** Product catalog (prices don't change every second), blog posts, analytics.

**Not acceptable for:** Bank balances, inventory counts, real-time data.

#### 2. Event-Based Invalidation

When data changes, **actively delete** the cached copy.

```
User updates profile → DB updated → Publish event → Cache invalidated

┌──────┐ write ┌──────┐ event  ┌───────────┐ delete ┌───────┐
│ App  │──────►│  DB  │───────►│ Event Bus │───────►│ Cache │
└──────┘       └──────┘        └───────────┘        └───────┘
```

#### 3. Version-Based Invalidation

Use version numbers or hashes to detect stale data.

```
Cache Key: "user:123:v5"

When user is updated:
  Version increments to v6
  Next read looks for "user:123:v6" → miss → fetches fresh data
  Old "user:123:v5" eventually expires via TTL
```

### Delete vs Update Cache?

```
When data changes, should you:

Option A: DELETE the cache key (recommended)
  └── Next read will fetch from DB and populate cache
  └── Simple, safe, no race conditions

Option B: UPDATE the cache with new value
  └── Risks race condition:
      Thread 1: Reads old value from DB
      Thread 2: Updates DB
      Thread 2: Updates cache with new value
      Thread 1: Updates cache with OLD value (stale!)
```

> **Best practice:** Always **delete** the cache key on writes, never update it directly.

---

## Distributed Caching

When you have multiple application servers, you need a **shared cache** they can all access.

### Local Cache vs Distributed Cache

```
Local Cache (each server has its own):
┌─────────────────┐  ┌─────────────────┐
│   Server 1      │  │   Server 2      │
│ ┌─────────────┐ │  │ ┌─────────────┐ │
│ │ Local Cache │ │  │ │ Local Cache │ │
│ │ user:123=A  │ │  │ │ user:123=B  │ │  ← INCONSISTENT!
│ └─────────────┘ │  │ └─────────────┘ │
└─────────────────┘  └─────────────────┘

Distributed Cache (shared):
┌─────────────────┐  ┌─────────────────┐
│   Server 1      │  │   Server 2      │
└────────┬────────┘  └────────┬────────┘
         │                     │
         └──────────┬──────────┘
                    │
              ┌─────▼──────┐
              │   Redis    │
              │ user:123=A │  ← Single source of truth
              └────────────┘
```

### Distributed Cache Sharding

For very large caches, even Redis needs to be distributed:

```
Cache Cluster (3 Redis nodes):

Hash function determines which node stores the key:

hash("user:123") % 3 = 0 → Redis Node 0
hash("user:456") % 3 = 1 → Redis Node 1
hash("user:789") % 3 = 2 → Redis Node 2

┌──────────┐  ┌──────────┐  ┌──────────┐
│  Node 0  │  │  Node 1  │  │  Node 2  │
│ user:123 │  │ user:456 │  │ user:789 │
│ user:222 │  │ user:555 │  │ user:888 │
└──────────┘  └──────────┘  └──────────┘
```

> We'll cover **consistent hashing** (a better approach to cache sharding) in Phase 11.

---

## Cache Stampede / Thundering Herd

One of the most dangerous cache problems: when a popular cache key **expires** and hundreds of requests simultaneously hit the database.

### The Problem

```
Time 0: Cache key "trending_posts" expires
Time 0: 1000 requests arrive simultaneously
All 1000: Cache MISS → All 1000 query the database!

┌────────┐  miss  ┌───────┐
│Req 1   │───────►│ Cache │──── Miss!
│Req 2   │───────►│       │──── Miss!     ┌──────────┐
│Req 3   │───────►│       │──── Miss! ───►│ Database │ ← 1000 identical
│  ...   │───────►│       │──── Miss! ───►│   💥     │   queries!
│Req 1000│───────►│       │──── Miss!     └──────────┘
└────────┘        └───────┘
```

### Solutions

#### 1. Locking (Mutex)

Only **one request** fetches from DB; others wait for the cache to be repopulated.

```
Request 1: Cache miss → Acquire lock → Query DB → Update cache → Release lock
Request 2: Cache miss → Lock taken → WAIT → Cache populated → Read from cache
Request 3: Cache miss → Lock taken → WAIT → Cache populated → Read from cache
```

#### 2. Pre-computation (Warming)

Refresh cache **before** it expires.

```
Cache TTL: 60 seconds
Background job: Refresh cache every 50 seconds

The cache never actually expires — it's always fresh
```

#### 3. Stale-While-Revalidate

Serve **stale data** while fetching fresh data in the background.

```
Request arrives → Cache expired BUT:
  1. Return stale data immediately (fast!)
  2. Trigger background refresh
  3. Next request gets fresh data
```

---

## Redis & Memcached — Cache Technologies

### Redis

Redis is an **in-memory data store** that supports rich data structures.

```
Redis Data Types:
├── Strings    → "user:123" = "Avinash"
├── Hashes     → "user:123" = { name: "Avinash", age: 25 }
├── Lists      → "recent_posts" = [post3, post2, post1]
├── Sets       → "user:123:followers" = {user456, user789}
├── Sorted Sets → "leaderboard" = {(user1, 100), (user2, 85)}
├── Streams    → Event streaming (like Kafka lite)
└── Pub/Sub    → Real-time message broadcasting
```

### Memcached

Memcached is a simpler, **pure key-value** in-memory cache.

### Redis vs Memcached

| Feature | Redis | Memcached |
|---------|-------|-----------|
| **Data structures** | Strings, hashes, lists, sets, sorted sets | Strings only |
| **Persistence** | Yes (RDB snapshots, AOF log) | No (memory only) |
| **Replication** | Built-in primary-replica | No |
| **Clustering** | Redis Cluster (built-in sharding) | Client-side sharding |
| **Pub/Sub** | Yes | No |
| **Lua scripting** | Yes | No |
| **Max value size** | 512 MB | 1 MB |
| **Multi-threaded** | Mostly single-threaded (6.0+ has I/O threads) | Multi-threaded |
| **Best for** | Feature-rich caching, sessions, queues | Simple, high-throughput caching |

> **Recommendation:** Use **Redis** unless you have a specific reason to use Memcached. Redis is more versatile and widely used.

---

## CDN Caching

CDN caching is covered in detail in Phase 12, but here's the essentials:

```
Without CDN:
User in India → Request travels to server in US → 200ms+ latency

With CDN:
User in India → Edge server in Mumbai has cached copy → 20ms latency

┌──────┐      ┌───────────┐      ┌──────────────┐
│ User │─────►│ CDN Edge  │ HIT  │              │
│India │◄─────│ (Mumbai)  │──────│  No need to  │
└──────┘ 20ms └───────────┘      │  hit origin  │
                    │             └──────────────┘
                    │ MISS
                    ▼
              ┌──────────┐
              │ Origin   │
              │ (US)     │
              └──────────┘
```

---

## Caching Best Practices

### 1. Cache the Right Data

```
GOOD to cache:                    BAD to cache:
├── Frequently read data          ├── Rapidly changing data
├── Expensive to compute          ├── Rarely accessed data
├── Rarely changes                ├── Very large objects
├── Same for many users           ├── Security-sensitive data
└── Read-heavy workloads          └── Data that must be real-time
```

### 2. Set Appropriate TTLs

```
Data Type                    Recommended TTL
─────────────────────────    ───────────────
Static assets (CSS, JS)      1 year (with cache busting)
User profile                 1 hour
Product catalog              15 minutes
Search results               5 minutes
Stock prices                 10 seconds
Chat messages                Don't cache
Bank balance                 Don't cache
```

### 3. Cache Key Design

```
Good cache keys:
├── "user:{userId}"                    → user:12345
├── "product:{productId}:details"      → product:67890:details
├── "feed:{userId}:page:{pageNum}"     → feed:12345:page:1
└── "search:{query}:sort:{sortBy}"     → search:iphone:sort:price

Bad cache keys:
├── "data"                 → Too generic
├── "user_data_for_avinash" → Not systematic
└── A very long key        → Wastes memory
```

---

## Key Takeaways

1. **Caching stores frequently accessed data** in faster storage — RAM is 50,000x faster than a database query
2. Cache at **every layer**: browser, CDN, reverse proxy, application, distributed cache (Redis), database
3. **Cache-Aside** is the most common strategy: check cache → miss → query DB → store in cache
4. **Write-Through** ensures consistency; **Write-Behind** maximizes write performance
5. **LRU + TTL** is the recommended eviction strategy for most use cases
6. **Cache invalidation is hard** — prefer deleting cache keys on writes over updating them
7. **Cache stampede** (thundering herd) is dangerous — solve with locking, pre-computation, or stale-while-revalidate
8. **Redis** is the industry standard for distributed caching — use it unless you have a reason not to
9. Design **systematic cache keys** and set **appropriate TTLs** based on data freshness requirements

---

## Practice Exercises

1. **Caching Strategy Selection:**
   - You're building a news website. Articles are read 1000x more than they're written.
   - Which cache write strategy would you use? Why?
   - What TTL would you set for article content vs trending article list?

2. **Cache Stampede Prevention:**
   - Your most popular product page gets 5,000 views/second.
   - The cache key for this page expires every 5 minutes.
   - Design a solution to prevent a stampede when it expires.

3. **Cache Key Design:**
   - Design the cache key structure for an e-commerce site with:
     - Product details
     - Product reviews (paginated)
     - User's shopping cart
     - Search results (query + filters + sort + page)
   - What TTL would you set for each?

4. **Redis Implementation:**
   - Write pseudocode for a leaderboard using Redis Sorted Sets.
   - How would you get the top 10 players?
   - How would you get a specific player's rank?

---

**Next:** [Phase 06 — Database Fundamentals — SQL vs NoSQL →](Phase-06-Database-Fundamentals.md)
