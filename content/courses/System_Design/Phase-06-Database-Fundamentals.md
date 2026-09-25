# Phase 06 — Database Fundamentals — SQL vs NoSQL

## Table of Contents

- [Why Databases Matter in System Design](#why-databases-matter-in-system-design)
- [Relational Databases (SQL)](#relational-databases-sql)
- [NoSQL Databases](#nosql-databases)
- [SQL vs NoSQL — The Complete Comparison](#sql-vs-nosql--the-complete-comparison)
- [ACID vs BASE](#acid-vs-base)
- [Indexing — Making Queries Fast](#indexing--making-queries-fast)
- [Denormalization](#denormalization)
- [Connection Pooling](#connection-pooling)
- [Choosing the Right Database](#choosing-the-right-database)
- [Database Per Service Pattern](#database-per-service-pattern)
- [Key Takeaways](#key-takeaways)
- [Practice Exercises](#practice-exercises)

---

## Why Databases Matter in System Design

The database is often the **bottleneck** and the **most critical component** of any system. Choosing the wrong database or designing it poorly can make everything else irrelevant.

```
                    System Performance Bottleneck

App Servers                            Database
(Easy to scale)                        (Hard to scale)

Add more servers ✓                     Add more databases? 🤔
Stateless ✓                            Stateful (has data!) 😰
Restart = no data loss ✓               Restart = potential data loss 😱
Horizontal scaling = easy ✓            Horizontal scaling = complex 😓
```

### The Key Questions

When designing a system, you MUST answer these database questions:

1. **What type of data** am I storing? (structured, semi-structured, unstructured)
2. **How much data?** (GBs, TBs, PBs)
3. **Read vs Write ratio?** (read-heavy, write-heavy, balanced)
4. **Consistency requirements?** (strong consistency vs eventual consistency)
5. **Query patterns?** (simple lookups, complex joins, full-text search, analytics)
6. **Scale expectations?** (thousands vs millions vs billions of records)

---

## Relational Databases (SQL)

Relational databases store data in **tables with rows and columns**, linked by **relationships** (foreign keys).

### How Relational Data Looks

```
users table:
┌────┬──────────┬──────────────────┬─────────────┐
│ id │ name     │ email            │ created_at  │
├────┼──────────┼──────────────────┼─────────────┤
│ 1  │ Avinash  │ avinash@mail.com │ 2024-01-15  │
│ 2  │ Priya    │ priya@mail.com   │ 2024-02-20  │
│ 3  │ Rahul    │ rahul@mail.com   │ 2024-03-10  │
└────┴──────────┴──────────────────┴─────────────┘

orders table:
┌────┬─────────┬──────────┬────────┐
│ id │ user_id │ product  │ amount │
├────┼─────────┼──────────┼────────┤
│ 1  │ 1       │ Laptop   │ 75000  │
│ 2  │ 1       │ Mouse    │ 500    │
│ 3  │ 2       │ Keyboard │ 2000   │
└────┴─────────┴──────────┴────────┘

Relationship: orders.user_id → users.id (Foreign Key)

Query: "Get all orders for Avinash"
SELECT * FROM orders 
JOIN users ON orders.user_id = users.id 
WHERE users.name = 'Avinash';
```

### Key Properties of Relational Databases

```
1. Schema-enforced    → Every row must follow the defined structure
2. ACID transactions  → Data integrity is guaranteed
3. Normalization      → No data duplication (each fact stored once)
4. Relationships      → Tables linked via foreign keys
5. SQL                → Powerful, standardized query language
6. Joins              → Combine data from multiple tables
```

### Popular Relational Databases

| Database | Best For | Max Scale |
|----------|----------|-----------|
| **PostgreSQL** | Feature-rich, complex queries, extensions | ~TBs per node |
| **MySQL** | Web applications, read-heavy workloads | ~TBs per node |
| **Amazon Aurora** | Cloud-native PostgreSQL/MySQL (auto-scaling) | 128 TB |
| **Google Spanner** | Global distribution with strong consistency | Virtually unlimited |
| **CockroachDB** | Distributed SQL, survives region failures | Virtually unlimited |
| **SQLite** | Embedded, mobile, small apps | ~281 TB (theoretical) |

### When to Use SQL

```
Use SQL when:
├── Data has clear relationships (users, orders, products)
├── You need ACID transactions (banking, e-commerce)
├── Data structure is well-defined and unlikely to change frequently
├── You need complex queries with JOINs and aggregations
├── Data integrity is critical (no duplicates, no inconsistencies)
└── Your team is familiar with SQL
```

---

## NoSQL Databases

NoSQL (Not Only SQL) databases are designed for **flexibility, scalability, and specific data models**.

### Types of NoSQL Databases

```
NoSQL Database Types:

1. Document Store         → MongoDB, CouchDB
   {"name": "Avinash", "orders": [{...}]}

2. Key-Value Store        → Redis, DynamoDB, Riak
   "user:123" → "{name: Avinash, ...}"

3. Wide-Column Store      → Cassandra, HBase, ScyllaDB
   Row key → Column families with dynamic columns

4. Graph Database         → Neo4j, Amazon Neptune
   (Avinash)──[FOLLOWS]──►(Priya)
```

### 1. Document Databases (MongoDB, CouchDB)

Store data as **JSON-like documents**. Each document can have a different structure.

```
// MongoDB document — flexible schema
{
    "_id": "user_123",
    "name": "Avinash",
    "email": "avinash@mail.com",
    "address": {                    // Nested object
        "city": "Bangalore",
        "state": "Karnataka"
    },
    "orders": [                     // Embedded array
        { "product": "Laptop", "amount": 75000 },
        { "product": "Mouse", "amount": 500 }
    ],
    "preferences": {                // Flexible — other users may not have this
        "theme": "dark",
        "language": "en"
    }
}
```

| Pros | Cons |
|------|------|
| Flexible schema | No ACID transactions across documents (usually) |
| Natural JSON mapping | Data duplication (denormalized) |
| Easy horizontal scaling | Complex queries across documents are hard |
| Great for hierarchical data | Joins are not native |

**Best for:** Content management, user profiles, product catalogs, real-time analytics.

### 2. Key-Value Databases (Redis, DynamoDB)

The simplest NoSQL model — just a **key mapped to a value**.

```
Key                     Value
──────────────────      ─────────────────────────
"session:abc123"        {"userId": 1, "role": "admin"}
"user:123:cart"         ["product_1", "product_2"]
"rate_limit:ip:1.2.3"  42
"config:feature_flags"  {"darkMode": true, "beta": false}
```

**Best for:** Caching, sessions, rate limiting, leaderboards, simple lookups.

### 3. Wide-Column Databases (Cassandra, HBase)

Data stored in **rows and column families**, but each row can have different columns.

```
Cassandra data model:

Row Key: "user:123"
┌──────────────┬──────────────────────────────────────────────────┐
│ Column Family│ name:Avinash │ email:a@mail.com │ age:25        │
├──────────────┼──────────────────────────────────────────────────┤
│ Column Family│ post:1:text  │ post:1:likes:42  │ post:2:text   │
└──────────────┴──────────────────────────────────────────────────┘

Row Key: "user:456"
┌──────────────┬──────────────────────────────────────────────┐
│ Column Family│ name:Priya │ email:p@mail.com │ phone:91xxx  │  ← Different columns!
└──────────────┴──────────────────────────────────────────────┘
```

**Best for:** Time-series data, IoT sensor data, large-scale event logging, write-heavy workloads.

### 4. Graph Databases (Neo4j, Neptune)

Store data as **nodes and edges** (relationships), optimized for traversing connections.

```
Graph structure:

(Avinash)──[FOLLOWS]──►(Priya)
    │                      │
[LIKES]               [FOLLOWS]
    │                      │
    ▼                      ▼
(Post: "System         (Rahul)
 Design Guide")           │
    ▲                  [WORKS_AT]
    │                      │
[COMMENTED_ON]             ▼
    │                  (Google)
(Rahul)

Query: "Find friends of friends who work at Google"
MATCH (me)-[:FOLLOWS]->()-[:FOLLOWS]->(fof)-[:WORKS_AT]->(Google)
WHERE me.name = 'Avinash'
RETURN fof
```

**Best for:** Social networks, recommendation engines, fraud detection, knowledge graphs.

---

## SQL vs NoSQL — The Complete Comparison

| Factor | SQL (Relational) | NoSQL |
|--------|-----------------|-------|
| **Data Model** | Tables with fixed schema | Flexible (documents, key-value, graph) |
| **Schema** | Rigid, predefined | Dynamic, schema-less |
| **Query Language** | SQL (standardized) | Varies by database |
| **Transactions** | Full ACID | Usually eventual consistency |
| **Relationships** | JOINs (powerful) | Denormalization (embed data) |
| **Scaling** | Primarily vertical | Designed for horizontal |
| **Consistency** | Strong consistency | Eventual consistency (usually) |
| **Best for** | Complex queries, relationships | Simple queries at massive scale |

### The Decision Tree

```
"What kind of data do I have?"
│
├── Structured with clear relationships?
│   └── SQL (PostgreSQL, MySQL)
│
├── Semi-structured, varies by record?
│   └── Document DB (MongoDB)
│
├── Simple key → value lookups?
│   └── Key-Value (Redis, DynamoDB)
│
├── Time-series / event data?
│   └── Wide-Column (Cassandra) or Time-series DB (InfluxDB)
│
├── Highly connected data (networks, graphs)?
│   └── Graph DB (Neo4j)
│
└── Full-text search?
    └── Search Engine (Elasticsearch)
```

---

## ACID vs BASE

### ACID (SQL Databases)

```
A — Atomicity:     All or nothing (transaction fully completes or fully rolls back)
C — Consistency:   Database always moves from one valid state to another
I — Isolation:     Concurrent transactions don't interfere with each other
D — Durability:    Committed data survives crashes (written to disk)

Example: Bank Transfer
  BEGIN TRANSACTION
    Deduct $100 from Account A
    Add $100 to Account B
  COMMIT

  If either step fails → BOTH steps are rolled back
  Money is never lost or duplicated
```

### BASE (NoSQL Databases)

```
BA — Basically Available:  System guarantees availability (may return stale data)
S  — Soft state:           State may change over time without input (due to replication)
E  — Eventual consistency: System will eventually become consistent

Example: Social Media Like Count
  User likes a post:
  Server 1: like_count = 100
  Server 2: like_count = 99   ← Stale! (hasn't received the update yet)
  
  After a few seconds:
  Server 1: like_count = 100
  Server 2: like_count = 100  ← Eventually consistent ✓
  
  This is acceptable for likes — not for bank balances!
```

### When to Choose What

```
ACID (Strong Consistency):           BASE (Eventual Consistency):
├── Banking / Financial transactions ├── Social media feeds
├── E-commerce orders                ├── Like/view counts
├── Inventory management             ├── Analytics / metrics
├── Healthcare records               ├── Content delivery
├── Booking systems                  ├── Search indexes
└── Any data loss = catastrophic     └── Slight staleness is OK
```

---

## Indexing — Making Queries Fast

An index is a **data structure** that speeds up data retrieval, like the index in the back of a book.

### Without vs With Index

```
Without Index (Full Table Scan):
  Query: SELECT * FROM users WHERE email = 'avinash@mail.com'
  
  Database scans ALL rows: Row 1 → Row 2 → ... → Row 1,000,000
  Time: O(n) = slow!

With Index on email column:
  Database looks up index: email → row location
  
  B-Tree Index:
       ┌───────────┐
       │   M       │
       └──┬────┬───┘
          │    │
    ┌─────▼──┐ ┌──▼──────┐
    │ A-L   │ │  N-Z    │
    └──┬────┘ └──┬──────┘
       │         │
  ┌────▼───┐  ┌──▼─────┐
  │avinash@│  │priya@  │
  │→ Row 1 │  │→ Row 2 │
  └────────┘  └────────┘
  
  Time: O(log n) = fast!
```

### Types of Indexes

| Index Type | How It Works | Best For |
|-----------|-------------|----------|
| **B-Tree** | Balanced tree, sorted data | Range queries, sorting, equality |
| **Hash** | Hash map of values | Exact match lookups only |
| **Composite** | Index on multiple columns | Queries filtering on multiple fields |
| **Full-Text** | Inverted index of words | Text search ("find posts containing 'system design'") |
| **Geospatial** | R-Tree / spatial indexing | Location queries ("find restaurants within 5km") |

### Index Trade-offs

```
Benefit:  READS are faster (dramatically)
Cost:     WRITES are slower (index must be updated)
Cost:     Extra storage space for the index

Read-heavy app (95% reads):  → Add many indexes ✓
Write-heavy app (95% writes): → Minimize indexes (each write updates all indexes)
```

> **Rule of thumb:** Index columns that appear in `WHERE`, `JOIN`, `ORDER BY`, and `GROUP BY` clauses.

---

## Denormalization

Normalization (SQL) eliminates data duplication. Denormalization **intentionally duplicates data** for read performance.

### Normalized (No Duplication)

```
users table:
│ id │ name    │
│ 1  │ Avinash │

posts table:
│ id │ user_id │ content        │
│ 1  │ 1       │ "Hello World"  │

To get post with user name:
SELECT posts.content, users.name 
FROM posts JOIN users ON posts.user_id = users.id
← Requires a JOIN (expensive at scale)
```

### Denormalized (Duplicated for Speed)

```
posts table:
│ id │ user_id │ user_name │ content       │
│ 1  │ 1       │ Avinash   │ "Hello World" │
                  ▲
                  └── Duplicated! But no JOIN needed

SELECT content, user_name FROM posts WHERE id = 1
← Single table read (fast!)
```

### Trade-offs

| | Normalized | Denormalized |
|--|-----------|-------------|
| **Read speed** | Slower (JOINs) | Faster (single read) |
| **Write speed** | Faster (single update) | Slower (update multiple copies) |
| **Storage** | Less | More (duplicated data) |
| **Consistency** | Easy (one source of truth) | Hard (must update all copies) |
| **Best for** | Write-heavy, consistency-critical | Read-heavy, latency-critical |

> **In system design:** NoSQL databases are inherently denormalized. Even SQL databases denormalize at scale for read performance.

---

## Connection Pooling

Opening a database connection is **expensive** (~20-50ms). Connection pooling **reuses connections**.

```
Without Pool:
Request 1 → Open connection → Query → Close connection → (20ms overhead)
Request 2 → Open connection → Query → Close connection → (20ms overhead)
Request 3 → Open connection → Query → Close connection → (20ms overhead)
1000 req/s = 1000 connections opened/closed per second!

With Pool:
App starts → Create pool of 20 connections

Request 1 → Borrow connection → Query → Return to pool → (0ms overhead)
Request 2 → Borrow connection → Query → Return to pool → (0ms overhead)
Request 3 → Borrow connection → Query → Return to pool → (0ms overhead)
1000 req/s = Only 20 connections, reused continuously!
```

### Pool Configuration

```
Pool Settings:
├── Min connections:  5   (always keep 5 ready)
├── Max connections: 20   (never exceed 20)
├── Idle timeout:    30s  (close connections idle for 30s)
├── Acquire timeout: 5s   (wait max 5s for a free connection)
└── Max lifetime:    1h   (recycle connections after 1 hour)

Database limit: 100 max connections
5 app servers × 20 pool size = 100 total connections ← Perfect fit
```

---

## Choosing the Right Database

### Decision Framework

```
Step 1: What's the data model?
  ├── Tabular with relationships → SQL
  ├── JSON documents → MongoDB
  ├── Simple key-value → Redis / DynamoDB
  ├── Graph relationships → Neo4j
  └── Time-series → InfluxDB / TimescaleDB

Step 2: What's the scale?
  ├── < 1TB → Almost any database works
  ├── 1-10 TB → Well-tuned SQL or NoSQL
  └── 10+ TB → Purpose-built distributed DB

Step 3: Read/Write ratio?
  ├── Read-heavy → SQL with read replicas + caching
  ├── Write-heavy → Cassandra, DynamoDB, or write-optimized DB
  └── Balanced → PostgreSQL or MongoDB

Step 4: Consistency requirements?
  ├── Strong → SQL (PostgreSQL, MySQL), Spanner
  └── Eventual → Cassandra, DynamoDB, MongoDB
```

### Real-World Database Choices

| Company | Use Case | Database Choice | Why |
|---------|----------|----------------|-----|
| Instagram | User data, photos | PostgreSQL (sharded) | ACID transactions, mature ecosystem |
| Netflix | User profiles | Cassandra | Write-heavy, globally distributed |
| Twitter | Tweets, timeline | Manhattan (custom) | Massive scale, real-time |
| Uber | Trip data | Google Spanner | Global consistency, geo-distributed |
| Airbnb | Listings, bookings | MySQL + Redis | Relational data + caching |
| LinkedIn | Social graph | Espresso (custom) | Graph queries at scale |

---

## Database Per Service Pattern

In microservices, each service should own its **own database**. This is called the Database Per Service pattern.

```
Monolith (Shared Database):
┌─────────────────────────────────────┐
│         Monolith Application        │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ Users  │ │ Orders │ │Payment │  │
│  │ Module │ │ Module │ │ Module │  │
│  └───┬────┘ └───┬────┘ └───┬────┘  │
│      └──────────┼──────────┘        │
│                 │                    │
│          ┌──────▼──────┐            │
│          │  Shared DB  │            │
│          └─────────────┘            │
└─────────────────────────────────────┘

Microservices (Database Per Service):
┌──────────┐   ┌──────────┐   ┌──────────┐
│  Users   │   │  Orders  │   │ Payment  │
│ Service  │   │ Service  │   │ Service  │
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │
┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
│PostgreSQL│  │ MongoDB  │  │PostgreSQL│
│ (Users)  │  │ (Orders) │  │(Payments)│
└──────────┘  └──────────┘  └──────────┘
```

> Each service can even use a **different type** of database — pick the best tool for each job.

---

## Key Takeaways

1. The **database is the hardest component to scale** — choose wisely from the start
2. **SQL databases** excel at structured data, relationships, ACID transactions, and complex queries
3. **NoSQL databases** come in four types: document, key-value, wide-column, and graph
4. **ACID** guarantees data integrity (banking); **BASE** prioritizes availability (social media)
5. **Indexes** dramatically speed up reads but slow down writes — index columns used in WHERE/JOIN/ORDER BY
6. **Denormalization** duplicates data for read performance — used heavily at scale and in NoSQL
7. **Connection pooling** is essential — reuse connections instead of opening/closing for each query
8. Choose your database based on **data model, scale, read/write ratio, and consistency requirements**
9. In microservices, use the **database per service** pattern — each service owns its data

---

## Practice Exercises

1. **Database Selection:**
   - You're building an e-commerce platform. Choose databases for:
     - Product catalog (millions of products with varying attributes)
     - Shopping cart
     - Order history
     - Product recommendations ("customers who bought X also bought Y")
   - Justify each choice.

2. **Indexing Strategy:**
   - You have a `users` table with 50 million rows and these columns: `id, name, email, country, created_at, last_login`
   - Common queries: find by email, find by country + created_at range, find recently active users
   - Design the indexing strategy. What indexes would you create?

3. **Normalization Decision:**
   - Your social media app shows a user's name on every post they create.
   - Would you normalize (JOIN users and posts) or denormalize (store name in posts table)?
   - What happens when a user changes their name?

4. **ACID vs BASE:**
   - For each scenario, decide if you need ACID or if BASE is acceptable:
     - Transferring money between bank accounts
     - Updating a user's profile picture
     - Recording page view analytics
     - Processing a flight ticket booking

---

**Next:** [Phase 07 — Database Scaling — Sharding, Replication & Partitioning →](Phase-07-Database-Scaling.md)
