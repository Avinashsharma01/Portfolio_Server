# Phase 03 — Horizontal vs Vertical Scaling

## Table of Contents

- [What Is Scaling?](#what-is-scaling)
- [Vertical Scaling (Scale Up)](#vertical-scaling-scale-up)
- [Horizontal Scaling (Scale Out)](#horizontal-scaling-scale-out)
- [Vertical vs Horizontal — Side by Side](#vertical-vs-horizontal--side-by-side)
- [Stateless vs Stateful Architecture](#stateless-vs-stateful-architecture)
- [Session Management in Scaled Systems](#session-management-in-scaled-systems)
- [Database Scaling Preview](#database-scaling-preview)
- [Auto-Scaling](#auto-scaling)
- [Capacity Planning & Back-of-the-Envelope Math](#capacity-planning--back-of-the-envelope-math)
- [Key Takeaways](#key-takeaways)
- [Practice Exercises](#practice-exercises)

---

## What Is Scaling?

Scaling is the ability to handle **increased load** by adding resources to your system. When more users arrive, your system needs more capacity.

```
Load increases → System must handle it

Option 1: Make the existing machine BIGGER     → Vertical Scaling
Option 2: Add MORE machines                    → Horizontal Scaling
```

### What Is "Load"?

Load means different things for different systems:

| System | Load Metric |
|--------|-------------|
| Web server | Requests per second (RPS) |
| Database | Queries per second, read/write ratio |
| Chat app | Concurrent connections |
| Video platform | Concurrent video streams, storage growth |
| E-commerce | Orders per minute (especially during sales) |

---

## Vertical Scaling (Scale Up)

Vertical scaling means making your **existing server more powerful** — add more CPU, RAM, disk, or network bandwidth.

```
Before:                          After Vertical Scaling:
┌──────────────┐                 ┌──────────────────────┐
│   Server     │                 │      Server          │
│              │                 │                      │
│  4 CPU cores │    Scale Up     │  32 CPU cores        │
│  16 GB RAM   │  ──────────►   │  256 GB RAM          │
│  500 GB SSD  │                 │  4 TB NVMe SSD       │
│              │                 │                      │
│  Handles:    │                 │  Handles:            │
│  500 req/s   │                 │  5,000 req/s         │
└──────────────┘                 └──────────────────────┘
```

### Pros of Vertical Scaling

| Advantage | Explanation |
|-----------|-------------|
| **Simple** | No code changes needed — just upgrade hardware |
| **No distributed complexity** | Single server, no network issues between nodes |
| **Strong consistency** | All data is on one machine, no sync problems |
| **Low latency between components** | Everything communicates via memory, not network |

### Cons of Vertical Scaling

| Disadvantage | Explanation |
|-------------|-------------|
| **Hard limit** | The biggest server on AWS has 448 vCPUs, 24 TB RAM — that's the ceiling |
| **Single point of failure** | If the server dies, everything goes down |
| **Expensive** | Doubling resources often costs more than 2x |
| **Downtime for upgrades** | Usually requires restarting the server |

### Cost of Vertical Scaling (Diminishing Returns)

```
Performance vs Cost (Vertical):

Cost ($)
│
│                                          ╱ (diminishing returns)
│                                        ╱
│                                      ╱
│                                   ╱
│                               ╱
│                           ╱
│                      ╱
│                 ╱
│           ╱
│      ╱
│ ╱
└──────────────────────────────────────── Performance

Going from 4 cores → 8 cores might double performance for 1.5x cost
Going from 64 cores → 128 cores might add 30% performance for 3x cost
```

---

## Horizontal Scaling (Scale Out)

Horizontal scaling means adding **more machines** to distribute the load.

```
Before:                          After Horizontal Scaling:
┌──────────────┐                 ┌──────────────┐
│   Server     │                 │   Server 1   │  ← Each handles
│  4 CPU cores │    Scale Out    │  4 CPU cores  │     portion of traffic
│  16 GB RAM   │  ──────────►   ├──────────────┤
│  500 req/s   │                 │   Server 2   │
└──────────────┘                 │  4 CPU cores  │
                                 ├──────────────┤
                                 │   Server 3   │
                                 │  4 CPU cores  │
                                 └──────────────┘
                                   Total: ~1,500 req/s
```

### Pros of Horizontal Scaling

| Advantage | Explanation |
|-----------|-------------|
| **No hard ceiling** | Just keep adding servers (theoretically unlimited) |
| **Fault tolerant** | If one server dies, others keep serving |
| **Cost efficient** | Commodity hardware is cheap |
| **Zero-downtime upgrades** | Update servers one at a time (rolling deploys) |

### Cons of Horizontal Scaling

| Disadvantage | Explanation |
|-------------|-------------|
| **Complexity** | Need load balancers, service discovery, distributed coordination |
| **Data consistency** | Keeping data in sync across servers is hard |
| **Network overhead** | Servers communicate over network (slower than local memory) |
| **Stateless requirement** | Application servers ideally need to be stateless |

---

## Vertical vs Horizontal — Side by Side

```
                Vertical Scaling              Horizontal Scaling
                (Scale Up)                    (Scale Out)
                ┌─────────────────┐           ┌───────┐┌───────┐┌───────┐
                │                 │           │       ││       ││       │
                │   BIG SERVER    │    vs      │ Small ││ Small ││ Small │
                │                 │           │Server ││Server ││Server │
                │                 │           │       ││       ││       │
                └─────────────────┘           └───────┘└───────┘└───────┘
```

| Factor | Vertical | Horizontal |
|--------|----------|-----------|
| **Cost model** | Expensive, diminishing returns | Linear cost scaling |
| **Complexity** | Low | High |
| **Failure impact** | Total outage | Partial degradation |
| **Max capacity** | Limited by hardware | Virtually unlimited |
| **Data consistency** | Easy (single machine) | Challenging (distributed) |
| **Downtime for scaling** | Usually required | Zero downtime possible |
| **Best for** | Databases, early-stage apps | Web servers, stateless services |

### Real-World Examples

| Company | Scaling Strategy |
|---------|-----------------|
| **Early-stage startup** | Start vertical (one big server) — it's simpler |
| **Netflix** | Horizontal — thousands of microservices instances on AWS |
| **Stack Overflow** | Primarily vertical — runs on ~9 servers with powerful hardware |
| **Google** | Horizontal — millions of commodity servers |
| **WhatsApp** | Vertical first (Erlang on powerful machines), then horizontal |

> **Real-world systems use BOTH.** You might vertically scale your database while horizontally scaling your web servers.

---

## Stateless vs Stateful Architecture

To horizontally scale, your application servers should ideally be **stateless**. This is one of the most important concepts in system design.

### Stateful Server

A stateful server **remembers information** about the client between requests.

```
Stateful Architecture (PROBLEM):

┌────────┐     ┌───────────────────────────┐
│ User A │────►│ Server 1                  │
│        │     │ session: {user: "A", ...} │  ← Server 1 stores User A's session
└────────┘     └───────────────────────────┘

┌────────┐     ┌───────────────────────────┐
│ User B │────►│ Server 2                  │
│        │     │ session: {user: "B", ...} │  ← Server 2 stores User B's session
└────────┘     └───────────────────────────┘

PROBLEM: If Server 1 dies, User A loses their session (logged out!)
PROBLEM: If User A's request goes to Server 2, their session isn't there!
```

### Stateless Server

A stateless server **doesn't store any client state**. Every request contains all the information needed to process it.

```
Stateless Architecture (SOLUTION):

┌────────┐     ┌─────────────────┐     ┌──────────────────────┐
│ User A │────►│  Load Balancer  │────►│ Server 1 (no state)  │
│        │     │                 │     ├──────────────────────┤
└────────┘     │                 │────►│ Server 2 (no state)  │
               │                 │     ├──────────────────────┤
┌────────┐     │                 │────►│ Server 3 (no state)  │
│ User B │────►│                 │     └──────────────────────┘
└────────┘     └─────────────────┘              │
                                                │ All servers read/write to
                                                ▼
                                    ┌──────────────────────┐
                                    │   Shared State Store │
                                    │   (Redis / Database) │
                                    │                      │
                                    │  session_A: {...}    │
                                    │  session_B: {...}    │
                                    └──────────────────────┘

Any server can handle any request — sessions are in shared storage
If Server 2 dies, Users A and B continue unaffected
```

### Why Stateless Matters

```
Stateful servers:
├── Can't freely route requests to any server
├── Need "sticky sessions" (bind user to specific server)
├── Lose state when server restarts
├── Hard to auto-scale (new servers don't have state)
└── Server failure = user session lost

Stateless servers:
├── Any request can go to any server
├── Easy to add/remove servers
├── No data loss on server restart
├── Auto-scaling works seamlessly
└── Server failure is invisible to users
```

---

## Session Management in Scaled Systems

When you have multiple servers, where do you store user sessions?

### Option 1: Sticky Sessions

```
Load Balancer uses cookie/IP to ALWAYS route User A to Server 1

User A ──────► Load Balancer ──────► Server 1 (ALWAYS)
User B ──────► Load Balancer ──────► Server 2 (ALWAYS)
```

| Pros | Cons |
|------|------|
| Simple to implement | Uneven load distribution |
| No shared state store needed | Server failure = session lost |
| | Can't do rolling deployments easily |

### Option 2: External Session Store (Recommended)

```
All servers share sessions via Redis:

Server 1 ──┐
Server 2 ──┼──► Redis Cluster (sessions)
Server 3 ──┘

Any server can serve any user's request
```

| Pros | Cons |
|------|------|
| True stateless servers | Extra infrastructure (Redis) |
| Even load distribution | Slight latency for session reads |
| Server failure is seamless | Redis becomes a dependency |

### Option 3: Client-Side State (JWT)

```
Server creates a signed JWT token → sends to client
Client sends JWT with every request → any server can verify it

No server-side session storage at all!
```

| Pros | Cons |
|------|------|
| Zero server-side state | Can't revoke tokens easily |
| Scales infinitely | Token size increases with claims |
| No session store dependency | Sensitive data shouldn't be in JWT |

> **Industry standard:** Use **JWT for authentication** (stateless) + **Redis for session data** that needs server-side storage (shopping cart, preferences).

---

## Database Scaling Preview

While we'll cover database scaling in depth in Phase 7, here's how it fits into the scaling picture:

```
App Server Scaling:                  Database Scaling:
(Relatively Easy)                    (Much Harder)

Add more app servers               ┌─ Read Replicas
behind a load balancer              │  (handle read traffic)
                                     │
                                     ├─ Caching Layer
                                     │  (Redis — reduce DB queries)
                                     │
                                     ├─ Vertical Scaling
                                     │  (bigger DB server)
                                     │
                                     ├─ Sharding
                                     │  (split data across DB servers)
                                     │
                                     └─ Database Proxy
                                        (connection pooling)
```

> **Key insight:** Scaling application servers is relatively easy (stateless + horizontal). Scaling databases is the **hard part** of system design because data has state.

---

## Auto-Scaling

Auto-scaling automatically adjusts the number of servers based on current demand.

```
Traffic Pattern:
                    ╱╲
                   ╱  ╲
                  ╱    ╲              ╱╲
                 ╱      ╲            ╱  ╲
                ╱        ╲          ╱    ╲
───────────────╱          ╲────────╱      ╲──────────
              6am         6pm    Next Day

Auto-Scaling Response:
Servers: 2   4   8   10  8   4    2   4   8   4    2

Instead of keeping 10 servers 24/7, you scale with demand
Cost savings: ~60% compared to fixed capacity
```

### Auto-Scaling Metrics

| Metric | Scale Up When | Scale Down When |
|--------|--------------|----------------|
| **CPU Utilization** | > 70% average | < 30% average |
| **Memory Usage** | > 80% | < 40% |
| **Request Count** | > 1000 req/s per server | < 200 req/s per server |
| **Queue Length** | > 100 messages pending | < 10 messages pending |
| **Response Time** | p95 > 500ms | p95 < 100ms |

### Auto-Scaling Strategies

```
1. Reactive Auto-Scaling:
   Monitor metrics → threshold crossed → add/remove servers
   Delay: 2-5 minutes to spin up new servers

2. Predictive Auto-Scaling:
   Analyze historical patterns → predict future load → pre-scale
   Example: E-commerce adds servers before Black Friday

3. Scheduled Auto-Scaling:
   Set rules based on time: "10 servers during 9am-5pm, 3 servers overnight"
```

### Scaling Policies

```
Scale-Up Policy:
  IF avg CPU > 70% for 3 minutes
  THEN add 2 servers
  WAIT 5 minutes before next scaling action (cooldown)

Scale-Down Policy:
  IF avg CPU < 30% for 10 minutes
  THEN remove 1 server
  WAIT 10 minutes before next scaling action (cooldown)
  MINIMUM servers: 2 (always keep at least 2 for availability)
```

> **Cooldown periods** are critical — without them, the system would thrash between scaling up and down.

---

## Capacity Planning & Back-of-the-Envelope Math

System design interviews often require **quick estimations**. Here's how to think about capacity.

### Step-by-Step Estimation Framework

```
1. Estimate daily active users (DAU)
2. Estimate actions per user per day
3. Calculate requests per second (RPS)
4. Estimate storage needs
5. Estimate bandwidth needs
6. Determine number of servers needed
```

### Example: Estimating for a Social Media App

```
Given:
- 10 million DAU
- Each user makes ~20 requests/day (views feed, posts, likes)
- Peak traffic is 3x average

Step 1: Average RPS
  10M users × 20 requests = 200M requests/day
  200M / 86,400 seconds = ~2,300 RPS (average)

Step 2: Peak RPS
  2,300 × 3 = ~7,000 RPS (peak)

Step 3: Server Capacity
  If each server handles 500 RPS:
  7,000 / 500 = 14 servers needed (at peak)
  Add 30% buffer: ~18 servers

Step 4: Storage
  Average post size: 1 KB text + 500 KB image = ~500 KB
  If 1% of users post daily: 100K posts/day
  100K × 500 KB = 50 GB/day
  50 GB × 365 = ~18 TB/year

Step 5: Bandwidth
  Read-heavy (100:1 read/write ratio):
  200M reads × 500 KB average = 100 TB/day outbound
  100 TB / 86,400 = ~1.2 GB/s outbound bandwidth
```

### Useful Numbers for Estimation

```
Time:
  1 day   = 86,400 seconds  ≈ 100,000 seconds (for quick math)
  1 month = 2.5 million seconds
  1 year  = 30 million seconds

Storage:
  1 char  = 1 byte (ASCII) or 2 bytes (UTF-8 extended)
  1 tweet = ~500 bytes (280 chars + metadata)
  1 photo = 500 KB - 2 MB (compressed JPEG)
  1 min video (720p) = ~50 MB

Throughput:
  A good web server handles 500-1000 requests/second
  A database server handles 5,000-10,000 queries/second
  Redis handles 100,000+ operations/second
```

---

## Key Takeaways

1. **Vertical scaling** (bigger machine) is simple but has a ceiling; **horizontal scaling** (more machines) is complex but virtually unlimited
2. Real-world systems use **both** — vertical for databases, horizontal for app servers
3. **Stateless servers** are essential for horizontal scaling — store state in shared external stores
4. Session management options: **sticky sessions** (simple), **Redis** (recommended), **JWT** (for auth)
5. **Auto-scaling** adjusts capacity based on demand, saving costs (reactive, predictive, or scheduled)
6. **Database scaling is the hard part** — app server scaling is relatively straightforward
7. **Back-of-the-envelope math** is essential for capacity planning and system design interviews
8. **Cooldown periods** in auto-scaling prevent thrashing between scale-up and scale-down

---

## Practice Exercises

1. **Scaling Decision:**
   - You have an e-commerce site that gets 100 req/s normally but 10,000 req/s during flash sales.
   - Would you use vertical or horizontal scaling? Why?
   - How would you set up auto-scaling for this pattern?

2. **Stateless Conversion:**
   - Your Express app stores sessions in `req.session` (in-memory on each server).
   - You need to scale to 5 servers. How would you make it stateless?
   - Write pseudocode for storing sessions in Redis.

3. **Capacity Estimation:**
   - You're building a photo-sharing app with 5M DAU.
   - Each user views 50 photos/day and uploads 2 photos/day.
   - Average photo size: 1 MB.
   - Calculate: RPS, daily storage growth, bandwidth, number of servers needed.

4. **Cost Comparison:**
   - Research pricing for a single 96-core server vs twelve 8-core servers on AWS.
   - Which is more cost-effective for running a web application?
   - When might the expensive single server be the better choice?

---

**Next:** [Phase 04 — Load Balancing →](Phase-04-Load-Balancing.md)
