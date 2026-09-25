# Phase 11 — Distributed Systems Fundamentals

## Table of Contents

- [What Is a Distributed System?](#what-is-a-distributed-system)
- [Challenges of Distributed Systems](#challenges-of-distributed-systems)
- [Consistent Hashing](#consistent-hashing)
- [Leader Election](#leader-election)
- [Consensus Algorithms](#consensus-algorithms)
- [Distributed Locking](#distributed-locking)
- [Clock Synchronization](#clock-synchronization)
- [Gossip Protocol](#gossip-protocol)
- [Heartbeat & Failure Detection](#heartbeat--failure-detection)
- [Data Replication Strategies](#data-replication-strategies)
- [Split Brain Problem](#split-brain-problem)
- [Key Takeaways](#key-takeaways)
- [Practice Exercises](#practice-exercises)

---

## What Is a Distributed System?

A distributed system is a collection of **independent computers** that appears to its users as a **single coherent system**.

```
Single System:                       Distributed System:
┌──────────────┐                    ┌──────┐ ┌──────┐ ┌──────┐
│   One Big    │                    │Node 1│ │Node 2│ │Node 3│
│   Computer   │      →            └──┬───┘ └──┬───┘ └──┬───┘
│              │                      │        │        │
│  Everything  │                      └────────┼────────┘
│  runs here   │                           Network
└──────────────┘                    
                                    Appears as ONE system to users
```

### Why Distribute?

| Reason | Explanation |
|--------|-------------|
| **Scalability** | No single machine can handle billions of users |
| **Reliability** | If one node fails, others continue |
| **Geography** | Serve users from nearby data centers |
| **Cost** | Many cheap machines < one supercomputer |

---

## Challenges of Distributed Systems

### The Eight Fallacies of Distributed Computing

```
Things developers WRONGLY assume:

1. The network is reliable          ← Packets get lost, connections drop
2. Latency is zero                  ← Every call takes time
3. Bandwidth is infinite            ← Data transfer has limits
4. The network is secure            ← Anyone can intercept traffic
5. Topology doesn't change          ← Servers come and go
6. There is one administrator       ← Multiple teams manage parts
7. Transport cost is zero           ← Data transfer costs money
8. The network is homogeneous       ← Different hardware, OSes, protocols
```

### Core Challenges

```
1. Partial Failures
   Some components fail while others work.
   "Node 3 is down — is my data lost?"

2. No Global Clock
   Clocks on different machines drift.
   "Node A says it's 10:00:00.000, Node B says 10:00:00.045"

3. Network Partitions
   Communication between nodes can break.
   "Nodes A and B can talk, but not to C"

4. Ordering of Events
   No global ordering of events across nodes.
   "Did message X happen before or after message Y?"

5. Concurrency
   Multiple nodes can modify the same data simultaneously.
   "Nodes A and B both incremented the counter — what's the result?"
```

---

## Consistent Hashing

Consistent hashing solves the **rehashing problem** when adding or removing nodes from a distributed system.

### The Problem with Simple Hashing

```
Simple hash: server = hash(key) % N

With 3 servers:
  hash("user_1") % 3 = 0 → Server 0
  hash("user_2") % 3 = 1 → Server 1
  hash("user_3") % 3 = 2 → Server 2

Add a 4th server (N becomes 4):
  hash("user_1") % 4 = 1 → Server 1 (MOVED!)
  hash("user_2") % 4 = 2 → Server 2 (MOVED!)
  hash("user_3") % 4 = 3 → Server 3 (MOVED!)

Almost ALL keys get reassigned! 
For a cache cluster, this means nearly 100% cache miss → Database overwhelmed!
```

### Consistent Hashing — The Solution

```
1. Arrange hash space as a RING (0 to 2^32 - 1):

                     0
                ╱         ╲
              ╱             ╲
            S1               S2      ← Servers placed on ring
           ╱                   ╲        using hash(server_ip)
          │                     │
          │    ●k1      ●k2    │    ← Keys placed on ring
           ╲                   ╱        using hash(key)
            ╲               ╱
              S3          ╱
                ╲       ╱
                     0

2. Each key goes to the FIRST server clockwise:
   k1 → S1 (first server clockwise from k1)
   k2 → S3 (first server clockwise from k2)

3. Adding server S4 between S2 and S3:
   Only keys between S2 and S4 move (from S3 to S4)
   All other keys stay on the same server!
   
   Only ~1/N keys move (not all keys!)
```

### Virtual Nodes

```
Problem: With few servers, distribution can be uneven.

Solution: Map each physical server to MULTIPLE points on the ring.

Physical Server A → Virtual nodes: A-1, A-2, A-3, A-4, A-5
Physical Server B → Virtual nodes: B-1, B-2, B-3, B-4, B-5
Physical Server C → Virtual nodes: C-1, C-2, C-3, C-4, C-5

Ring: ...A-1...B-2...C-1...A-3...B-1...C-3...A-2...B-3...C-2...

More virtual nodes = more even distribution
Typical: 100-200 virtual nodes per physical server

Used by: DynamoDB, Cassandra, Memcached, CDN routing
```

---

## Leader Election

In many distributed systems, **one node** needs to be the leader (primary/master) that coordinates work.

```
Why need a leader?
├── Only one node should write to the database (primary)
├── Only one node should run a scheduled task
├── Only one node should coordinate a distributed transaction
└── Avoid conflicts from concurrent operations
```

### How Leader Election Works

```
Step 1: All nodes start as FOLLOWERS
  [Node A: follower]  [Node B: follower]  [Node C: follower]

Step 2: A node notices there's no leader → starts election
  [Node A: CANDIDATE]  [Node B: follower]  [Node C: follower]

Step 3: Candidate asks others for votes
  Node A → "Vote for me!" → Node B: "OK" ✓
  Node A → "Vote for me!" → Node C: "OK" ✓

Step 4: Majority votes received → becomes LEADER
  [Node A: LEADER]  [Node B: follower]  [Node C: follower]

Step 5: Leader sends heartbeats to prove it's alive
  Node A → heartbeat → Node B ✓
  Node A → heartbeat → Node C ✓

Step 6: If heartbeats stop → new election triggered
```

### Leader Election Tools

| Tool | Mechanism | Used By |
|------|-----------|---------|
| **ZooKeeper** | Ephemeral nodes + watches | Kafka, HBase, Hadoop |
| **etcd** | Raft consensus | Kubernetes |
| **Consul** | Raft consensus | Service discovery |
| **Redis** | Redlock algorithm | Distributed locks |

---

## Consensus Algorithms

Consensus algorithms allow distributed nodes to **agree on a single value** even if some nodes fail.

### The Raft Algorithm

Raft is designed to be **understandable** (unlike its predecessor, Paxos).

```
Raft Node States:
┌──────────┐    timeout      ┌───────────┐    majority    ┌──────────┐
│ FOLLOWER │──────────────►│ CANDIDATE │──────votes────►│  LEADER  │
│          │◄─────────────│           │                │          │
│          │  higher term  │           │                │          │
└──────────┘               └───────────┘                └──────────┘
      ▲                                                      │
      └──────────────── steps down (higher term) ────────────┘

Raft Process:
1. Leader Heartbeats:
   Leader sends heartbeats every 150ms
   Followers reset election timeout on heartbeat

2. Election:
   Follower hasn't received heartbeat → becomes Candidate
   Requests votes from all nodes
   Majority votes → becomes Leader

3. Log Replication:
   Client sends write to Leader
   Leader appends to its log
   Leader replicates to followers
   Majority acknowledge → Leader commits
   Leader notifies client: "Write committed!"
```

### Paxos (Brief Overview)

```
Paxos roles:
├── Proposer: Proposes a value
├── Acceptor: Votes on proposed values
└── Learner: Learns the agreed-upon value

Two phases:
Phase 1 (Prepare):
  Proposer → Acceptors: "Will you consider proposal #N?"
  Acceptors → Proposer: "Yes" or "No, I've seen a higher #"

Phase 2 (Accept):
  Proposer → Acceptors: "Accept value V with proposal #N"
  Acceptors → Proposer: "Accepted" (if still valid)
  
Majority accepts → Value is chosen

Paxos guarantees safety but NOT liveness (can deadlock in theory).
In practice, a leader is elected to avoid competing proposals.
```

---

## Distributed Locking

When multiple services need to access a **shared resource**, only one should access it at a time.

```
Problem without distributed lock:
  Service A: Read inventory = 1
  Service B: Read inventory = 1
  Service A: inventory > 0? Yes → Sell item → inventory = 0
  Service B: inventory > 0? Yes → Sell item → inventory = -1 ← OVERSOLD!

With distributed lock:
  Service A: Acquire lock("inventory_item_1") → Got it!
  Service B: Acquire lock("inventory_item_1") → BLOCKED (A has it)
  Service A: Read inventory = 1 → Sell → inventory = 0 → Release lock
  Service B: Acquire lock → Got it! Read inventory = 0 → Can't sell → Release lock ✓
```

### Redis-Based Distributed Lock (Redlock)

```javascript
// Acquiring a lock
async function acquireLock(lockKey, ttl) {
    const lockValue = generateUniqueId(); // UUID
    
    // SET key value NX PX ttl
    // NX = only if key doesn't exist
    // PX = expire after ttl milliseconds
    const acquired = await redis.set(lockKey, lockValue, 'NX', 'PX', ttl);
    
    return acquired ? lockValue : null;
}

// Releasing a lock (only if we own it)
async function releaseLock(lockKey, lockValue) {
    // Use Lua script for atomicity
    const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
    `;
    await redis.eval(script, 1, lockKey, lockValue);
}
```

### Lock Safety Issues

```
Problem: Lock holder dies without releasing:
  Service A acquires lock → Crashes!
  Lock is held forever → DEADLOCK

Solution: TTL (Time to Live)
  Lock automatically expires after 30 seconds
  If A crashes, lock is released after 30s

New Problem: Service A is slow (not dead), lock expires, B gets lock
  T=0:   A acquires lock (TTL=30s)
  T=29s: A is still processing (long GC pause)
  T=30s: Lock expires! B acquires lock!
  T=31s: A finishes processing, writes data → CONFLICT with B!

Solution: Fencing tokens
  Each lock acquisition gets an incrementing token number
  A gets token #33, B gets token #34
  Resource only accepts writes with token ≥ last seen token
  A's write with token #33 is rejected (resource saw #34 from B)
```

---

## Clock Synchronization

Distributed systems can't rely on clocks being perfectly synchronized.

```
Problem:
  Node A clock: 10:00:00.000
  Node B clock: 10:00:00.045  ← 45ms ahead!
  
  Event on A at A's 10:00:00.100
  Event on B at B's 10:00:00.120
  
  Did A's event happen first? 
  A's real time: 10:00:00.100
  B's real time: 10:00:00.075 (120 - 45ms drift)
  
  B's event actually happened FIRST, but timestamps say otherwise!
```

### Solutions

#### 1. NTP (Network Time Protocol)

```
Synchronizes clocks via time servers.
Accuracy: ~1-50ms (good enough for most uses, NOT for ordering events)
```

#### 2. Logical Clocks (Lamport Timestamps)

```
Each node maintains a counter:
  Rule 1: Before sending/receiving, increment counter
  Rule 2: When receiving a message, counter = max(local, received) + 1

Node A (counter=0)         Node B (counter=0)
  Event: A=1                 
  Send msg ──────────────► Receive: B = max(0,1)+1 = 2
                            Event: B=3
  Receive ◄────────────── Send msg
  A = max(1,3)+1 = 4

Guarantees: If A happened before B, then A.timestamp < B.timestamp
Does NOT guarantee: If A.timestamp < B.timestamp, then A happened before B
```

#### 3. Google TrueTime

```
Google's TrueTime API returns an INTERVAL, not a point:
  TrueTime.now() = [earliest, latest]
  
  The real time is GUARANTEED to be within this interval.
  Interval is typically ~7ms wide.

  Used by Google Spanner for globally ordered transactions:
  If commit timestamp of T1 < commit timestamp of T2,
  then T1 actually happened before T2 (globally!)
  
  How: Wait until the earliest possible time of T2 is past
       the latest possible time of T1 ("commit-wait")
```

---

## Gossip Protocol

Gossip protocol is a **peer-to-peer** communication method where nodes randomly share information, similar to how rumors spread.

```
Gossip Propagation:

Round 1: Node A knows something new
  A tells B (random choice)
  
Round 2: A and B each tell 1 random node
  A tells D, B tells C
  
Round 3: A, B, C, D each tell 1 random node
  Now most nodes know!

         Round 1    Round 2    Round 3    Round 4
Nodes:    1 → 2     2 → 4     4 → 8     8 → 16
         (exponential spread — very fast!)

With N nodes, all nodes know within O(log N) rounds
```

### Where Gossip Is Used

| Use Case | Example |
|----------|---------|
| **Failure detection** | Nodes gossip about who's alive/dead (Cassandra) |
| **Membership** | Nodes learn about new members joining/leaving |
| **Data dissemination** | Spread configuration updates across cluster |
| **Aggregate computation** | Compute cluster-wide averages/counts |

---

## Heartbeat & Failure Detection

### Heartbeat Mechanism

```
Every node periodically sends "I'm alive" messages:

Node A ──♥──♥──♥──♥──♥──♥──♥──♥──♥──♥── (healthy)
Node B ──♥──♥──♥──♥──╳                    (missed heartbeats)
Node C ──♥──♥──♥──♥──♥──♥──♥──♥──♥──♥── (healthy)

After X missed heartbeats → Node B is suspected dead
After Y more missed → Node B is declared dead

Parameters:
├── Heartbeat interval: 1-5 seconds
├── Timeout: 3-5 missed heartbeats
└── False positive window: Higher timeout = fewer false positives
                           but slower detection
```

### Phi Accrual Failure Detector

```
Instead of binary "alive/dead", calculates a SUSPICION LEVEL (phi):

phi = 0-3:   Probably alive
phi = 3-6:   Suspicious
phi = 6-8:   Probably dead
phi > 8:     Almost certainly dead

Adapts based on historical heartbeat intervals:
If Node B usually sends heartbeats every 1.2s (with some variance),
and 5 seconds pass without a heartbeat → high phi → likely dead

Used by: Cassandra, Akka
```

---

## Data Replication Strategies

### Single-Leader Replication

```
┌──────────┐    ────►    ┌──────────┐
│  Leader   │  replicate  │ Follower │
│  (write)  │    ────►    │  (read)  │
│           │             │          │
└──────────┘    ────►    ┌──────────┐
                          │ Follower │
                          │  (read)  │
                          └──────────┘

All writes go to Leader → Leader replicates to Followers
Reads can go to any node (Leader or Follower)
Simple, widely used (MySQL, PostgreSQL, MongoDB default)
```

### Multi-Leader Replication

```
┌──────────┐   replicate  ┌──────────┐
│ Leader A │◄────────────►│ Leader B │
│ (Region  │              │ (Region  │
│  US-East)│              │  EU-West)│
└──────────┘              └──────────┘

Both can accept writes → Must handle conflicts!
Used for: Multi-datacenter deployments
Used by: CouchDB, Dynamo-style databases
```

### Leaderless Replication

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Node A  │  │  Node B  │  │  Node C  │
│  (R+W)   │  │  (R+W)   │  │  (R+W)   │
└──────────┘  └──────────┘  └──────────┘

Any node can accept reads AND writes
Consistency achieved via quorum: W + R > N

Used by: Cassandra, DynamoDB, Riak
```

---

## Split Brain Problem

Split brain occurs when a network partition causes **two nodes to both think they're the leader**.

```
Before partition:
[Leader A] ──heartbeat──► [Follower B] [Follower C]

Network partition:
[Leader A] ──── ╳ ────── [Follower B] [Follower C]
                              │
                    B doesn't hear from A
                    B thinks A is dead
                    B becomes Leader!

Now TWO leaders:
[Leader A]                [Leader B] [Follower C]

Both accept writes → DATA DIVERGES → INCONSISTENCY!
```

### Solutions

```
1. Quorum (Majority):
   Only a partition with MAJORITY of nodes can elect a leader.
   3 nodes: need 2 to elect. 5 nodes: need 3 to elect.
   
   [A] vs [B, C] → B,C have majority → B becomes leader ✓
   A cannot serve as leader (only 1/3 nodes)

2. Fencing (STONITH — Shoot The Other Node In The Head):
   When new leader is elected, the old leader is forcefully shut down.
   Ensures only one leader is EVER active.

3. Epoch Numbers / Terms:
   Each leader election increments a global counter.
   Nodes reject requests from a leader with a lower epoch.
   
   Leader A: epoch=5
   Leader B: epoch=6 (newer)
   Node C gets request from A (epoch=5) → REJECTED
   Node C gets request from B (epoch=6) → ACCEPTED ✓
```

---

## Key Takeaways

1. **Distributed systems** make groups of computers appear as one — for scalability, reliability, and geography
2. Never assume the network is reliable, latency is zero, or clocks are synchronized
3. **Consistent hashing** maps keys to nodes on a ring — adding/removing nodes only moves ~1/N keys
4. **Leader election** ensures one node coordinates — use ZooKeeper, etcd, or Raft
5. **Raft** is the go-to consensus algorithm — leader-based, replicated log, majority quorum
6. **Distributed locks** prevent concurrent access — use Redis/Redlock with TTL and fencing tokens
7. **Logical clocks** (Lamport) and **TrueTime** solve ordering without synchronized physical clocks
8. **Gossip protocol** spreads information exponentially — reaches all nodes in O(log N) rounds
9. **Heartbeats** detect failures — tune the timeout trade-off between speed and false positives
10. **Split brain** is when two leaders exist — solve with quorum, fencing, or epoch numbers

---

## Practice Exercises

1. **Consistent Hashing Implementation:**
   - You have 4 cache servers and add a 5th.
   - With simple modular hashing (key % N), what percentage of keys move?
   - With consistent hashing (and 200 virtual nodes), approximately how many move?

2. **Leader Election Scenario:**
   - You have 5 nodes in a Raft cluster. The leader (Node 1) goes down.
   - Describe the election process step by step.
   - What happens if Nodes 2 and 3 both start elections at the same time?

3. **Distributed Lock Design:**
   - Design a distributed lock system for an e-commerce checkout.
   - How would you handle: lock holder crashes? Lock expires during processing?
   - What TTL would you set for a lock on a payment operation?

4. **Failure Detection:**
   - Your system has 100 nodes. Heartbeat interval is 2 seconds.
   - How would you configure failure detection to detect failures within 10 seconds while minimizing false positives?
   - What happens during a network partition that splits nodes 50/50?

---

**Next:** [Phase 12 — CDNs & Edge Computing →](Phase-12-CDN-Edge-Computing.md)
