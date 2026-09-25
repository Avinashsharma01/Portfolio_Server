# Phase 07 — Database Scaling — Sharding, Replication & Partitioning

## Table of Contents

- [Why Database Scaling Is Hard](#why-database-scaling-is-hard)
- [Read Replicas — Scaling Reads](#read-replicas--scaling-reads)
- [Partitioning — Splitting Tables](#partitioning--splitting-tables)
- [Sharding — Distributing Data Across Databases](#sharding--distributing-data-across-databases)
- [Sharding Strategies](#sharding-strategies)
- [Consistent Hashing for Sharding](#consistent-hashing-for-sharding)
- [Problems with Sharding](#problems-with-sharding)
- [Replication Models](#replication-models)
- [Database Proxy & Connection Management](#database-proxy--connection-management)
- [Real-World Scaling Patterns](#real-world-scaling-patterns)
- [Key Takeaways](#key-takeaways)
- [Practice Exercises](#practice-exercises)

---

## Why Database Scaling Is Hard

Application servers are **stateless** — you can add and remove them freely. Databases are **stateful** — they hold irreplaceable data.

```
Scaling App Servers:                 Scaling Databases:
"Just add more servers"              "But the data..."

┌────────┐ ┌────────┐ ┌────────┐    Where does each row go?
│Server 1│ │Server 2│ │Server 3│    How do we keep copies in sync?
└────────┘ └────────┘ └────────┘    What about cross-shard queries?
   ← Easy to add/remove              What about transactions?
   ← No state to worry about         What about rebalancing?
                                      ← Every decision has trade-offs
```

### The Scaling Ladder

```
Stage 1: Optimize queries + add indexes          (0 - 100K users)
Stage 2: Add caching layer (Redis)                (100K - 500K users)
Stage 3: Vertical scaling (bigger DB server)      (500K - 2M users)
Stage 4: Read replicas                            (2M - 10M users)
Stage 5: Partitioning                             (10M - 50M users)
Stage 6: Sharding                                 (50M+ users)
```

---

## Read Replicas — Scaling Reads

Most applications are **read-heavy** (90-99% reads). Read replicas handle read traffic while the primary handles writes.

```
┌──────────────────────┐
│  Load Balancer       │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌────────┐
│  App   │   │  App   │
│Server 1│   │Server 2│
└───┬──┬─┘   └───┬──┬─┘
    │  │          │  │
    │  │  writes  │  │ reads
    │  │          │  │
    │  ▼          │  ▼
    │ ┌────────┐  │ ┌────────────┐
    │ │Primary │  │ │  Replica 1 │ ◄── Async replication
    └►│ (Write)│──┼─│  (Read)    │
      └────────┘  │ └────────────┘
          │       │ ┌────────────┐
          └───────┼─│  Replica 2 │ ◄── Async replication
                  └►│  (Read)    │
                    └────────────┘
```

### How Replication Works

```
1. Client writes to PRIMARY
2. Primary logs the change (Write-Ahead Log / Binary Log)
3. Replicas receive the log and apply changes

Timeline:
T=0ms:   Write arrives at Primary → stored ✓
T=0ms:   Primary sends log to replicas
T=5-50ms: Replica 1 applies the change ✓
T=10-100ms: Replica 2 applies the change ✓

During this delay: Replicas may return STALE data!
This is called "Replication Lag"
```

### Replication Lag Problem

```
T=0:  User updates profile name to "Avinash Sharma"
      Primary: name = "Avinash Sharma" ✓
      Replica: name = "Avinash"        ← Still old!

T=0:  User refreshes page (reads from replica)
      Sees: "Avinash"                  ← WHERE'S MY UPDATE?!

T=50ms: Replica catches up
      Replica: name = "Avinash Sharma" ✓

Solutions:
├── Read-after-write consistency: Route the writing user's reads to primary
├── Monotonic reads: Always route same user to same replica
└── Bounded staleness: Guarantee replicas are at most X seconds behind
```

---

## Partitioning — Splitting Tables

Partitioning splits a **single table** into smaller pieces on the **same database server**.

### Horizontal Partitioning (Row-Based)

Split rows across partitions based on a column value.

```
Original users table (10M rows):
┌────────────────────────────────────┐
│  id  │  name   │  country  │ ...  │
│  1   │  Alice  │  US       │ ...  │
│  2   │  Bob    │  India    │ ...  │
│ ...  │  ...    │  ...      │ ...  │
│ 10M  │  Zara   │  UK       │ ...  │
└────────────────────────────────────┘

After Horizontal Partitioning by country:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Partition: US    │  │ Partition: India │  │ Partition: EU   │
│ (3M rows)        │  │ (4M rows)        │  │ (3M rows)       │
│ id │ name │ ...  │  │ id │ name │ ...  │  │ id │ name │ ... │
│ 1  │Alice │      │  │ 2  │ Bob  │      │  │ 5  │ Eva  │     │
│ 3  │Carol │      │  │ 7  │ Dev  │      │  │ 8  │ Hans │     │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Benefit: Query "SELECT * FROM users WHERE country = 'India'"
         Only scans 4M rows instead of 10M (partition pruning)
```

### Vertical Partitioning (Column-Based)

Split columns across different tables/stores.

```
Original users table:
┌──────────────────────────────────────────────────┐
│ id │ name │ email │ bio (5KB) │ avatar (500KB)   │
└──────────────────────────────────────────────────┘

After Vertical Partitioning:
┌──────────────────────┐  ┌───────────────────────────┐
│ users_core           │  │ users_media               │
│ id │ name │ email    │  │ id │ bio (5KB) │ avatar    │
│ (Frequently accessed)│  │ (Rarely accessed, large)  │
└──────────────────────┘  └───────────────────────────┘

Benefit: Core queries are fast (small rows)
         Media loaded only when needed
```

---

## Sharding — Distributing Data Across Databases

Sharding is horizontal partitioning **across multiple database servers**. Each server (shard) holds a subset of the data.

```
Single Database:                    Sharded Database:
┌──────────────────┐               ┌──────────┐ ┌──────────┐ ┌──────────┐
│  All 100M rows   │               │ Shard 1  │ │ Shard 2  │ │ Shard 3  │
│  (one machine)   │    ───►       │ 33M rows │ │ 33M rows │ │ 33M rows │
│  Slow at scale   │               │ Users    │ │ Users    │ │ Users    │
└──────────────────┘               │  A-H     │ │  I-Q     │ │  R-Z     │
                                   └──────────┘ └──────────┘ └──────────┘
                                     Server 1    Server 2     Server 3
```

### How the Application Routes to the Right Shard

```
Application needs to find user "Avinash":

1. Determine shard: shard_key = "Avinash"
   hash("Avinash") % 3 = 0 → Shard 1

2. Connect to Shard 1 and query

┌──────┐   "Find Avinash"   ┌──────────────┐   query    ┌──────────┐
│ App  │────────────────────►│ Shard Router │──────────►│ Shard 1  │
│      │                     │              │           │ (A-H)    │
│      │◄───────────────────│              │◄──────────│          │
└──────┘   result            └──────────────┘   result   └──────────┘
```

---

## Sharding Strategies

### 1. Range-Based Sharding

Divide data by ranges of the shard key.

```
Shard Key: user_id (integer)

Shard 1: user_id 1 - 1,000,000
Shard 2: user_id 1,000,001 - 2,000,000
Shard 3: user_id 2,000,001 - 3,000,000
```

| Pros | Cons |
|------|------|
| Simple to implement | **Hotspots** — new users all go to the latest shard |
| Range queries are efficient | Uneven distribution over time |
| Easy to understand | Need rebalancing as shards fill up |

### 2. Hash-Based Sharding

Use a hash function on the shard key to determine the shard.

```
shard_number = hash(shard_key) % number_of_shards

hash("Avinash") % 3 = 0 → Shard 0
hash("Priya")   % 3 = 1 → Shard 1
hash("Rahul")   % 3 = 2 → Shard 2
hash("Dev")     % 3 = 0 → Shard 0
```

| Pros | Cons |
|------|------|
| Even data distribution | Range queries span ALL shards |
| No hotspots | Adding/removing shards requires rehashing |
| Simple hash function | Reshuffling data is expensive |

### 3. Directory-Based Sharding

A **lookup table** tells you which shard holds each piece of data.

```
Lookup Table:
┌────────────┬───────┐
│ Shard Key  │ Shard │
├────────────┼───────┤
│ user_1     │   1   │
│ user_2     │   2   │
│ user_3     │   1   │
│ user_4     │   3   │
└────────────┴───────┘

Application → Check lookup table → Route to correct shard
```

| Pros | Cons |
|------|------|
| Flexible — can move data between shards | Lookup table is a single point of failure |
| Handles uneven data well | Extra latency for every query (lookup first) |

### 4. Geo-Based Sharding

Shard by geographic region.

```
Shard: India    → Users in India, orders from India
Shard: US       → Users in US, orders from US
Shard: Europe   → Users in Europe, orders from Europe
```

**Best for:** Data sovereignty (GDPR), reducing latency for regional users.

### Strategy Comparison

| Strategy | Distribution | Range Queries | Resharding Ease |
|----------|-------------|---------------|-----------------|
| Range | Uneven (hotspots) | Efficient | Moderate |
| Hash | Even | Expensive | Hard |
| Directory | Flexible | Depends | Easy |
| Geo | By region | Within region only | Moderate |

---

## Consistent Hashing for Sharding

Regular hash-based sharding has a **resharding problem**: when you add or remove a shard, most keys get reassigned.

```
Problem with simple hash:
  hash(key) % 3  →  Shard 0, 1, or 2
  
  Add a 4th shard:
  hash(key) % 4  →  Most keys move to different shards!
  
  75% of data must be moved! 💥
```

### Consistent Hashing Solution

```
Imagine a circular ring (0 to 2^32):

              0
         ╱    │    ╲
       S1     │     S2        S1, S2, S3 = Shard positions on ring
      ╱       │       ╲
    ╱         │         ╲
   │          │          │
   │     ●K1  │   ●K2   │    K1, K2, K3 = Key positions on ring
    ╲         │         ╱
      ╲       │       ╱      Each key goes to the NEXT shard
        S3    │     ╱        clockwise on the ring
         ╲    │   ╱
              0

K1 → goes to S1 (next clockwise)
K2 → goes to S3 (next clockwise)

Adding S4 between S2 and S3:
Only keys between S2 and S4 move (from S3 to S4)
Other keys are unaffected! (~1/n keys move, not all)
```

### Virtual Nodes

To ensure even distribution, each physical shard has multiple **virtual nodes** on the ring.

```
Physical Shard A → Virtual nodes: A1, A2, A3 (3 positions on ring)
Physical Shard B → Virtual nodes: B1, B2, B3
Physical Shard C → Virtual nodes: C1, C2, C3

Ring: ... A1 ... B2 ... C1 ... A3 ... B1 ... C3 ... A2 ... B3 ... C2 ...

More virtual nodes = more even distribution
Typical: 100-200 virtual nodes per physical shard
```

---

## Problems with Sharding

Sharding solves capacity issues but introduces significant complexity.

### 1. Cross-Shard Queries

```
Problem: "Get all orders for user Avinash AND user Priya"

If Avinash is on Shard 1 and Priya is on Shard 3:
  → Must query BOTH shards and merge results
  → No database-level JOIN possible
  → Application must handle merging
```

### 2. Cross-Shard Transactions

```
Problem: Transfer money from User A (Shard 1) to User B (Shard 2)

Single DB:  BEGIN → debit A → credit B → COMMIT (easy!)
Sharded:    Two different databases — can't do a single transaction!

Solutions:
├── Two-Phase Commit (2PC) — Complex, slow, but consistent
├── Saga Pattern — Series of local transactions with compensation
└── Eventual consistency — Accept temporary inconsistency
```

### 3. Hotspots

```
Problem: Celebrity user has 100M followers
         All their data is on one shard
         That shard gets hammered while others are idle

Solutions:
├── Split the hot shard further
├── Cache hot data aggressively
├── Use dedicated shard for celebrities
└── Add read replicas for hot shards
```

### 4. Resharding

```
Problem: Shard 2 is full, need to add Shard 4

With hash sharding:
  hash(key) % 3 → hash(key) % 4
  Most data must move! Expensive downtime.

With consistent hashing:
  Only ~25% of data moves (from neighboring shards)
  Much better, but still requires careful orchestration
```

### 5. Choosing the Right Shard Key

```
Good Shard Key:                    Bad Shard Key:
├── High cardinality               ├── Low cardinality (country → uneven)
│   (user_id — millions of values) │   (gender → only 2-3 values)
├── Even distribution              ├── Monotonically increasing
│   (data spreads evenly)          │   (auto-increment → all to last shard)
├── Commonly used in queries       ├── Rarely queried field
│   (most queries filter by this)  │   (forces cross-shard queries)
└── Doesn't change                 └── Mutable field
    (once set, stays the same)         (moving data between shards)
```

---

## Replication Models

### Synchronous Replication

```
Client writes → Primary → Waits for ALL replicas to confirm → Returns success

Timeline:
T=0:    Write to Primary ✓
T=5ms:  Replica 1 confirms ✓
T=50ms: Replica 2 confirms ✓ (slow network)
T=50ms: Return success to client

Pros: Strong consistency (all replicas have latest data)
Cons: Slow (waits for slowest replica), single slow replica blocks everything
```

### Asynchronous Replication

```
Client writes → Primary → Returns success immediately → Replicas catch up later

Timeline:
T=0:    Write to Primary ✓ → Return success immediately
T=5ms:  Replica 1 catches up ✓
T=50ms: Replica 2 catches up ✓

Pros: Fast writes, primary not blocked by slow replicas
Cons: Data loss risk if primary crashes before replication
```

### Semi-Synchronous Replication

```
Client writes → Primary → Waits for AT LEAST 1 replica → Returns success

Timeline:
T=0:    Write to Primary ✓
T=5ms:  Replica 1 confirms ✓ → Return success (don't wait for Replica 2)
T=50ms: Replica 2 catches up eventually

Pros: Good balance — at least 1 copy guaranteed, fast enough
Cons: Slightly slower than async, but much safer
```

| Model | Consistency | Write Speed | Data Safety |
|-------|-------------|-------------|-------------|
| Synchronous | Strong | Slow | Highest |
| Asynchronous | Eventual | Fast | Risk of loss |
| Semi-Synchronous | Moderate | Moderate | Good |

---

## Database Proxy & Connection Management

A database proxy sits between your application and database, handling routing, pooling, and failover.

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  App 1   │  │  App 2   │  │  App 3   │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
            ┌──────▼──────┐
            │  DB Proxy   │  ← Handles routing, pooling, failover
            │  (ProxySQL  │
            │   / PgBouncer│
            │   / Vitess)  │
            └──┬──────┬───┘
               │      │
          ┌────▼──┐ ┌─▼──────────┐
          │Primary│ │  Replicas  │
          │(Write)│ │  (Read)    │
          └───────┘ └────────────┘

Proxy handles:
├── Write queries → Primary
├── Read queries → Replicas (round robin)
├── Connection pooling (reduce DB connections)
├── Automatic failover (promote replica if primary dies)
└── Query caching
```

---

## Real-World Scaling Patterns

### Instagram's Database Architecture

```
Phase 1: Single PostgreSQL
Phase 2: PostgreSQL + Read Replicas
Phase 3: Sharded PostgreSQL (by user_id)
         - Custom Django middleware for shard routing
         - Each shard: Primary + 2 Read Replicas
         - 12+ shards at scale

Key decisions:
├── Stayed with PostgreSQL (didn't switch to NoSQL)
├── Shard key: user_id (most queries are user-centric)
├── Denormalized heavily (fewer cross-shard queries)
└── pgbouncer for connection pooling
```

### Pinterest's Scaling Journey

```
Phase 1: Single MySQL + Memcached
Phase 2: MySQL Primary-Replica
Phase 3: Sharded MySQL
         - Shard by user_id
         - Lookup table for pin_id → shard mapping
         - Each shard is a MySQL server with replicas

Key insight: "Use boring technology" — MySQL sharding was simple
             and predictable, no fancy distributed DB needed
```

---

## Key Takeaways

1. **Database scaling is the hardest part** of system design — data is stateful
2. **Read replicas** scale read traffic — most apps are 90%+ reads
3. **Replication lag** causes stale reads — solve with read-after-write consistency for the writing user
4. **Partitioning** splits tables within one server (horizontal = rows, vertical = columns)
5. **Sharding** distributes data across multiple database servers — the ultimate scaling tool
6. Sharding strategies: **Range** (simple, hotspots), **Hash** (even, no range queries), **Directory** (flexible, extra lookup)
7. **Consistent hashing** minimizes data movement when adding/removing shards
8. Sharding challenges: **cross-shard queries, transactions, hotspots, resharding, shard key selection**
9. **Semi-synchronous replication** balances consistency and performance
10. **Database proxies** (ProxySQL, PgBouncer, Vitess) handle routing, pooling, and failover

---

## Practice Exercises

1. **Sharding Key Selection:**
   - You're building an e-commerce database with tables: users, products, orders, reviews.
   - What shard key would you use for each table?
   - How would you handle "get all orders for product X" if orders are sharded by user_id?

2. **Consistent Hashing:**
   - You have 4 cache servers and 1000 keys distributed via consistent hashing.
   - Server 3 crashes. How many keys need to move? To which server?
   - You add Server 5. How many keys move?

3. **Replication Design:**
   - Your app has a 95:5 read-to-write ratio with 10,000 queries/second.
   - Design a replication setup (how many replicas? sync or async?).
   - How would you handle the case where a user writes and immediately reads?

4. **Cross-Shard Query:**
   - Users are sharded by user_id across 10 shards.
   - A query needs: "Find all users who signed up in the last 7 days."
   - How would you implement this? What are the performance implications?

---

**Next:** [Phase 08 — API Design — REST, GraphQL & gRPC →](Phase-08-API-Design.md)
