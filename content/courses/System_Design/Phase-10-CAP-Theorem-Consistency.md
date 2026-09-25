# Phase 10 — CAP Theorem & Consistency Models

## Table of Contents

- [The CAP Theorem](#the-cap-theorem)
- [Understanding Each Property](#understanding-each-property)
- [CAP Trade-offs in Practice](#cap-trade-offs-in-practice)
- [PACELC Theorem — Beyond CAP](#pacelc-theorem--beyond-cap)
- [Consistency Models](#consistency-models)
- [Strong Consistency](#strong-consistency)
- [Eventual Consistency](#eventual-consistency)
- [Causal Consistency](#causal-consistency)
- [Read Your Own Writes](#read-your-own-writes)
- [Conflict Resolution Strategies](#conflict-resolution-strategies)
- [Real-World Consistency Choices](#real-world-consistency-choices)
- [Key Takeaways](#key-takeaways)
- [Practice Exercises](#practice-exercises)

---

## The CAP Theorem

The CAP theorem states that a distributed system can provide **at most two** of three guarantees simultaneously:

```
                    Consistency (C)
                         ╱╲
                        ╱  ╲
                       ╱    ╲
                      ╱  CP  ╲
                     ╱        ╲
                    ╱    CA    ╲
                   ╱            ╲
  Availability (A) ────────────── Partition Tolerance (P)
                        AP

You can have CP, AP, or CA — but NOT all three.

In a distributed system, network partitions WILL happen,
so the real choice is between CP and AP:

Network partition occurs → Do you sacrifice Consistency or Availability?
```

---

## Understanding Each Property

### Consistency (C)

Every read receives the **most recent write** or an error. All nodes see the same data at the same time.

```
Consistent system:
  Write: "balance = 500" → Primary node
  
  Immediately after:
  Read from Node A → balance = 500 ✓
  Read from Node B → balance = 500 ✓
  Read from Node C → balance = 500 ✓
  
  All nodes return the same, latest value.
```

### Availability (A)

Every request receives a **non-error response**, even if it might not be the most recent data.

```
Available system:
  Server A is up → responds ✓
  Server B is up → responds ✓
  Server C is down → 
    System still responds via A or B ✓
    
  Every functioning node MUST respond to every request.
  No request is ever rejected (unless the node itself is down).
```

### Partition Tolerance (P)

The system continues to operate despite **network partitions** (communication failures between nodes).

```
Network Partition:
┌──────────┐         ╳         ┌──────────┐
│  Node A  │ ── network ──── │  Node B  │
│  Node C  │    broken!       │  Node D  │
└──────────┘                   └──────────┘

Nodes A,C can talk to each other but NOT to B,D.
Partition-tolerant system continues working on both sides.
```

---

## CAP Trade-offs in Practice

### CP Systems (Consistency + Partition Tolerance)

When a partition occurs, the system **becomes unavailable** for the inconsistent nodes to maintain consistency.

```
Network partition occurs:
┌──────────┐         ╳         ┌──────────┐
│ Primary  │    partition      │ Replica  │
│(has data)│                   │(stale)   │
└──────────┘                   └──────────┘

CP choice: Replica REJECTS requests until partition heals.
"I'd rather give you an error than wrong data."

Examples: HBase, MongoDB (default), Redis (with cluster), ZooKeeper
Use when: Banking, inventory, any system where wrong data is catastrophic
```

### AP Systems (Availability + Partition Tolerance)

When a partition occurs, the system **stays available** but may return stale data.

```
Network partition occurs:
┌──────────┐         ╳         ┌──────────┐
│  Node A  │    partition      │  Node B  │
│ data=100 │                   │ data=95  │ ← stale!
└──────────┘                   └──────────┘

AP choice: Node B still responds with data=95 (stale but available).
"I'd rather give you slightly old data than no data."

When partition heals: Nodes sync up and resolve conflicts.

Examples: Cassandra, DynamoDB, CouchDB, DNS
Use when: Social media, product catalog, analytics
```

### CA Systems (Consistency + Availability)

Theoretically possible, but **only in a single-node system** (no distribution). In practice, network partitions always happen in distributed systems, so CA doesn't exist.

```
CA = Single database on one server
     Consistent ✓ (one copy of data)
     Available ✓ (server responds if running)
     Partition tolerant ✗ (one server = no partitions, but also no fault tolerance)

Example: A single PostgreSQL instance (not distributed)
```

---

## PACELC Theorem — Beyond CAP

CAP only describes behavior **during** a partition. PACELC extends this to also describe behavior during **normal operation**.

```
PACELC:
IF there is a Partition (P):
    Choose between Availability (A) and Consistency (C)
ELSE (E) during normal operation:
    Choose between Latency (L) and Consistency (C)

Full form: PAC / ELC

Examples:
├── PA/EL: Dynamo, Cassandra
│   → During partition: Choose Availability
│   → Normal operation: Choose Latency (fast but eventually consistent)
│
├── PC/EC: Google Spanner, VoltDB
│   → During partition: Choose Consistency
│   → Normal operation: Choose Consistency (slower but always correct)
│
├── PA/EC: MongoDB (default)
│   → During partition: Choose Availability
│   → Normal operation: Choose Consistency (fast reads from primary)
│
└── PC/EL: (rare — consistent during partition, fast normally)
```

---

## Consistency Models

There's a spectrum between strong and eventual consistency.

```
Strongest                                                    Weakest
───────────────────────────────────────────────────────────────────
Linearizable → Sequential → Causal → Read-your-writes → Eventual

More consistent = Slower, more coordination needed
Less consistent = Faster, more available, simpler
```

---

## Strong Consistency

Every read returns the **absolute latest write** across all nodes. Behaves as if there's one copy of the data.

```
Timeline with Strong Consistency:

Client A writes: x = 5          (at time T1)
Client B reads:  x = ?          (at time T2, where T2 > T1)
Result:          x = 5          ← GUARANTEED to see the latest write

How it's achieved:
1. Write goes to primary
2. Primary synchronously replicates to majority of nodes
3. Only then returns success to client
4. Reads go to primary (or majority quorum)

Cost: Every write waits for replication → Higher latency
```

### Quorum-Based Consistency

```
Quorum Formula: W + R > N

N = Total number of replicas
W = Number of nodes that must acknowledge a WRITE
R = Number of nodes that must respond to a READ

Example: N=3 replicas
├── W=2, R=2: Strong consistency (2+2 > 3)
│   Write waits for 2 nodes → Read checks 2 nodes → Overlap guaranteed
│
├── W=1, R=3: Strong consistency (1+3 > 3)
│   Fast writes, slow reads
│
├── W=3, R=1: Strong consistency (3+1 > 3)
│   Slow writes, fast reads
│
├── W=1, R=1: NO strong consistency (1+1 < 3)
│   Fast but may read stale data

Visual:
N=3 nodes: [Node 1] [Node 2] [Node 3]
W=2: Write to Node 1 ✓, Node 2 ✓  (success!)
R=2: Read from Node 2 (has write), Node 3 (may not)
     → At least ONE read node has the latest write (overlap!)
```

---

## Eventual Consistency

If no new writes occur, all replicas will **eventually** converge to the same value. The window of inconsistency is typically milliseconds to seconds.

```
Timeline with Eventual Consistency:

T=0ms:    Client writes: x = 5 (to Node A)
          Node A: x = 5 ✓
          Node B: x = 3 (stale)
          Node C: x = 3 (stale)

T=5ms:    Async replication in progress...
          Node A: x = 5
          Node B: x = 5 ✓ (updated)
          Node C: x = 3 (still propagating)

T=10ms:   All caught up
          Node A: x = 5
          Node B: x = 5
          Node C: x = 5 ✓ (all consistent now)

During T=0 to T=10: Reads from B or C may return stale data
After T=10: All reads return consistent data
```

### When Eventual Consistency Is OK

```
OK:
├── Social media likes (off by a few for a moment)
├── Product reviews display
├── User activity feeds
├── Search results
├── Analytics dashboards
├── View counts
└── Recommendations

NOT OK:
├── Bank account balances
├── Inventory for last-item scenarios
├── Distributed locks
├── Leader election
└── Any financial transaction
```

---

## Causal Consistency

Maintains order between **causally related** events. Events that are NOT causally related can be seen in different orders.

```
Causal Relationship:
  1. Avinash posts: "Should I learn Rust?" (Post A)
  2. Priya replies: "Yes, definitely!" (Comment B, caused by Post A)
  
  Causal guarantee: Everyone sees Post A before Comment B
  (It would be weird to see a reply before the original post)

Non-causal (independent):
  1. Avinash posts: "Should I learn Rust?"
  2. Rahul posts: "Beautiful sunset today!" (completely unrelated)
  
  No causal guarantee needed — these can appear in any order
```

### Implementation with Vector Clocks

```
Vector Clock: Each node maintains a counter for every node in the system

Node A: [A:1, B:0, C:0]  → "I've done 1 operation"
Node B: [A:0, B:1, C:0]  → "I've done 1 operation"

A sends message to B:
B updates: [A:1, B:2, C:0]  → "I've seen A's op 1, and done 2 of my own"

Compare: [A:1, B:2, C:0] vs [A:2, B:1, C:0]
Neither dominates → CONCURRENT (conflict needs resolution)
```

---

## Read Your Own Writes

A guarantee that when a user writes data, their **subsequent reads** will see that write (even if other users see stale data).

```
Without Read-Your-Writes:
Avinash updates name to "Avinash Sharma"
  → Write goes to Primary ✓
Avinash refreshes page
  → Read goes to Replica (replication lag!) 
  → Sees: "Avinash" ← OLD NAME! Frustrating!

With Read-Your-Writes:
Avinash updates name to "Avinash Sharma"
  → Write goes to Primary ✓
Avinash refreshes page
  → Read is routed to Primary (for this user)
  → Sees: "Avinash Sharma" ✓

Implementation strategies:
1. Read from primary for the user who just wrote (for X seconds)
2. Track write timestamp, only read from replicas caught up past that timestamp
3. Read from the same replica that received the write
```

---

## Conflict Resolution Strategies

When two nodes accept conflicting writes during a partition, how do you resolve it?

### 1. Last Write Wins (LWW)

```
Node A receives: name = "Avinash" at T=100
Node B receives: name = "Avi"     at T=101

Resolution: T=101 > T=100 → "Avi" wins

Problem: Requires synchronized clocks across nodes
Problem: Silently discards one write (data loss!)
Used by: Cassandra (default), DynamoDB
```

### 2. Application-Level Resolution

```
Node A: name = "Avinash"
Node B: name = "Avi"

Store BOTH versions → Present conflict to the application or user

Example: Google Docs — shows conflict and lets user choose
Example: Git — merge conflicts require human resolution
```

### 3. CRDTs (Conflict-free Replicated Data Types)

```
CRDTs are data structures that can be merged automatically
without conflicts. The merge operation is:
  - Commutative: A ⊕ B = B ⊕ A
  - Associative: (A ⊕ B) ⊕ C = A ⊕ (B ⊕ C)
  - Idempotent: A ⊕ A = A

Examples:
├── G-Counter: Increment-only counter
│   Node A: count_A = 5
│   Node B: count_B = 3
│   Merged: total = 5 + 3 = 8 (no conflict!)
│
├── OR-Set: Add/remove set with observed-remove
│   Node A: adds "apple"
│   Node B: adds "banana"
│   Merged: {"apple", "banana"} (no conflict!)

Used by: Redis (CRDT counters), Riak, collaborative editing tools
```

---

## Real-World Consistency Choices

| System | Consistency Model | Why |
|--------|------------------|-----|
| **Google Spanner** | Strong (linearizable) | Global transactions for financial data |
| **Amazon DynamoDB** | Eventual (default), Strong (optional) | Tunable per query |
| **Cassandra** | Tunable (quorum configurable) | Flexible per use case |
| **MongoDB** | Strong (default single-doc), Eventual (reads from secondary) | Configurable read preference |
| **Redis** | Eventual (async replication) | Speed over consistency |
| **CockroachDB** | Strong (serializable) | Distributed SQL with strong guarantees |
| **Apache ZooKeeper** | Strong (linearizable) | Configuration, leader election |

---

## Key Takeaways

1. **CAP Theorem**: In a distributed system, choose 2 of 3: Consistency, Availability, Partition Tolerance. Since partitions are inevitable, the real choice is **CP vs AP**
2. **CP systems** sacrifice availability during partitions (banking, inventory)
3. **AP systems** sacrifice consistency during partitions (social media, caching)
4. **PACELC** extends CAP to also consider latency vs consistency during normal operation
5. **Strong consistency** (linearizable) ensures all reads see the latest write — achieved via quorum (W + R > N)
6. **Eventual consistency** is faster and more available — data converges eventually (typically milliseconds)
7. **Causal consistency** preserves order of related events — good for social media, comments
8. **Read-your-own-writes** ensures a user sees their own updates — critical for UX
9. Conflict resolution: **Last Write Wins** (simple, data loss risk), **App-level** (complex, safe), **CRDTs** (automatic, elegant)

---

## Practice Exercises

1. **CAP Classification:**
   - Classify each scenario as needing CP or AP:
     - (a) Online banking system
     - (b) Twitter-like social media feed
     - (c) DNS (Domain Name System)
     - (d) Airline reservation system
     - (e) Analytics dashboard
   - For each, explain why.

2. **Quorum Design:**
   - You have 5 replicas. You need strong consistency.
   - What values of W and R would you choose?
   - If you want fast writes, what W and R?
   - If you want fast reads, what W and R?

3. **Conflict Resolution:**
   - Two users simultaneously edit the same document:
     - User A changes title to "Guide v2"
     - User B changes title to "Updated Guide"
   - How would you resolve this with: LWW? App-level? CRDTs?

4. **Consistency for E-commerce:**
   - You're building an e-commerce site with 1M DAU.
   - What consistency model would you use for:
     - Product catalog?
     - Inventory count?
     - Shopping cart?
     - Order placement?
   - Justify each choice.

---

**Next:** [Phase 11 — Distributed Systems Fundamentals →](Phase-11-Distributed-Systems-Fundamentals.md)
