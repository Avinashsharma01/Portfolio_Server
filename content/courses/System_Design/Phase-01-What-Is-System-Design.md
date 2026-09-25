# Phase 01 — What Is System Design & Why It Matters

## Table of Contents

- [What Is System Design?](#what-is-system-design)
- [Why System Design Matters](#why-system-design-matters)
- [Functional vs Non-Functional Requirements](#functional-vs-non-functional-requirements)
- [Key Characteristics of a Good System](#key-characteristics-of-a-good-system)
- [Single Server Architecture](#single-server-architecture)
- [When Things Break — The Need for Design](#when-things-break--the-need-for-design)
- [System Design in Interviews](#system-design-in-interviews)
- [Thinking Like an Architect](#thinking-like-an-architect)
- [Key Takeaways](#key-takeaways)
- [Practice Exercises](#practice-exercises)

---

## What Is System Design?

System design is the process of defining the **architecture, components, modules, interfaces, and data flow** of a system to satisfy specified requirements.

Think of it like designing a city:

- **Building a small house** = writing a simple script
- **Designing a city** = system design (roads, electricity, water, sewage, traffic, hospitals — all need to work together)

```
Small App (1 user):                    Large System (millions of users):

┌──────────┐                          ┌──────────┐   ┌──────────┐
│  Browser  │                          │   CDN    │   │   CDN    │
└─────┬─────┘                          └────┬─────┘   └────┬─────┘
      │                                     │              │
┌─────▼─────┐                          ┌────▼──────────────▼────┐
│  Server   │                          │     Load Balancer      │
└─────┬─────┘                          └────┬──────────────┬────┘
      │                                     │              │
┌─────▼─────┐                          ┌────▼─────┐  ┌────▼─────┐
│ Database  │                          │ Server 1 │  │ Server 2 │
└───────────┘                          └────┬─────┘  └────┬─────┘
                                            │              │
                                       ┌────▼──────────────▼────┐
                                       │    Database Cluster     │
                                       │  ┌──────┐  ┌──────┐   │
                                       │  │Primary│  │Replica│   │
                                       │  └──────┘  └──────┘   │
                                       └────────────────────────┘
```

### The Core Question

System design answers one fundamental question:

> **How do I build a system that works reliably, efficiently, and at scale — even when things go wrong?**

---

## Why System Design Matters

### 1. Scale Changes Everything

Code that works for 100 users **will break** at 1 million users. System design teaches you how to handle that growth.

| Users | What Works |
|-------|-----------|
| 1–100 | Single server, SQLite, no caching |
| 1,000–10,000 | Proper database, basic caching, one server |
| 100,000+ | Load balancer, multiple servers, Redis cache |
| 1,000,000+ | Database sharding, CDN, message queues, microservices |
| 10,000,000+ | Custom infrastructure, edge computing, multi-region deployment |

### 2. Real Companies Face Real Problems

Every major tech company has faced and solved system design challenges:

| Company | Challenge | Solution |
|---------|-----------|----------|
| **Netflix** | Stream video to 200M+ users worldwide | CDN (Open Connect), microservices, chaos engineering |
| **Twitter** | Deliver tweets to millions of followers instantly | Fan-out on write, in-memory timeline cache |
| **WhatsApp** | Handle 100B+ messages per day | Erlang servers, minimal overhead, efficient protocols |
| **Instagram** | Store and serve billions of photos | Sharded PostgreSQL, CDN, lazy loading |
| **Uber** | Match riders and drivers in real-time | Geospatial indexing, real-time pub/sub, cell-based architecture |

### 3. Career Growth

```
Junior Developer          Senior Developer          Staff/Principal Engineer
─────────────────         ─────────────────         ──────────────────────
"Make it work"            "Make it work well"       "Make it work at scale"
                                                    
Write features      →    Design components     →    Design entire systems
Follow patterns      →    Choose patterns       →    Create patterns
Use databases        →    Optimize queries      →    Design data architecture
```

System design is what separates a **coder** from an **engineer**.

---

## Functional vs Non-Functional Requirements

Every system has two types of requirements. Understanding the difference is critical.

### Functional Requirements (FR)

**What** the system should do. The features.

Examples for a URL shortener:
- Users can submit a long URL and get a short URL
- When someone visits the short URL, they are redirected to the original
- Users can see click analytics for their URLs
- Short URLs expire after a configurable time

### Non-Functional Requirements (NFR)

**How well** the system should do it. The quality attributes.

| NFR | Meaning | Example |
|-----|---------|---------|
| **Scalability** | Handle growing load | Support 100M URLs without degradation |
| **Availability** | Stay up and running | 99.99% uptime (< 52 min downtime/year) |
| **Latency** | Respond quickly | URL redirect in < 50ms |
| **Durability** | Don't lose data | Zero data loss even during server failures |
| **Consistency** | Show correct data | A newly created short URL works immediately |
| **Security** | Protect from attacks | Prevent malicious URL injection |

### The Availability Table — "Nines"

This is a universal language in system design:

```
Availability %    Downtime per Year     Downtime per Month    Downtime per Day
──────────────    ─────────────────     ──────────────────    ────────────────
99%   (two 9s)    3.65 days             7.31 hours            14.40 minutes
99.9% (three 9s)  8.77 hours            43.83 minutes         1.44 minutes
99.99% (four 9s)  52.60 minutes         4.38 minutes          8.64 seconds
99.999% (five 9s) 5.26 minutes          26.30 seconds         864 milliseconds
```

> Most systems aim for **99.9% to 99.99%** availability. Five 9s is extremely expensive and only critical systems (payment processing, emergency services) need it.

### Real-World Example

Let's say you're designing **Instagram's photo upload system**:

| Type | Requirement |
|------|------------|
| **FR** | Users can upload photos with captions |
| **FR** | Photos appear in followers' feeds |
| **FR** | Users can like and comment on photos |
| **NFR** | Upload should complete in < 3 seconds |
| **NFR** | Photos should never be lost once uploaded (high durability) |
| **NFR** | System handles 500 photo uploads per second |
| **NFR** | Photos are visible worldwide with low latency |

---

## Key Characteristics of a Good System

There are several fundamental properties every well-designed system should have. These come up in every design discussion.

### 1. Scalability

The ability to handle **increased load** without degrading performance.

```
                     ┌─────────────────────────┐
                     │      SCALABILITY         │
                     └────────────┬────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
              ┌─────▼──────┐              ┌─────▼──────┐
              │  VERTICAL  │              │ HORIZONTAL │
              │ (Scale Up) │              │(Scale Out) │
              └────────────┘              └────────────┘
              Bigger machine              More machines
              More RAM/CPU                Add servers
              Has a ceiling               Virtually unlimited
```

### 2. Reliability

The system continues to work correctly even when **things go wrong** (hardware faults, software bugs, human errors).

```
Reliability = System works correctly even when components fail

What can go wrong:
├── Hardware failures    → Hard disk crash, server dies, network cable cut
├── Software failures    → Bug in code, memory leak, dependency failure
├── Human errors         → Wrong config deployed, accidental deletion
└── External failures    → Third-party API down, DNS outage, power failure
```

### 3. Availability

The system is **operational and accessible** when users need it.

> **Reliability vs Availability:** A system can be available (responding to requests) but not reliable (returning wrong data). Reliability implies availability, but not vice versa.

### 4. Maintainability

How easy it is to **operate, modify, and extend** the system over time.

- **Operability** — Easy for ops teams to monitor and manage
- **Simplicity** — Easy for new engineers to understand
- **Evolvability** — Easy to make changes and add features

### 5. Performance

How fast the system responds to requests and processes data.

| Metric | What It Measures | Good Target |
|--------|-----------------|-------------|
| **Latency** | Time to process one request | < 100ms for APIs |
| **Throughput** | Requests processed per second | Depends on system |
| **p50 / p99** | 50th / 99th percentile latency | p99 < 500ms |

### Percentile Latency Explained

```
If you have 100 requests and sort them by response time:

Fastest ████████████████████████████████████████████████░░ Slowest
        ▲                                           ▲    ▲
       p50                                         p95  p99
    (median)                                            
    50ms                                          200ms  1.2s

p50 = 50ms  → 50% of requests are faster than 50ms
p95 = 200ms → 95% of requests are faster than 200ms
p99 = 1.2s  → 99% of requests are faster than 1.2s (1% are slower)
```

> **Why p99 matters:** If 1% of your users experience 1.2s latency and you have 10 million users, that's **100,000 users** having a terrible experience.

---

## Single Server Architecture

Before we learn to scale, let's understand the simplest possible system — everything on **one server**.

```
┌──────────────────────────────────────────────────────┐
│                   SINGLE SERVER                       │
│                                                       │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│   │  Web App   │  │    API     │  │  Database  │    │
│   │  (React)   │  │ (Express)  │  │ (MongoDB)  │    │
│   └────────────┘  └────────────┘  └────────────┘    │
│                                                       │
│   RAM: 16GB    CPU: 4 cores    Disk: 500GB SSD       │
└──────────────────────────────────────────────────────┘
```

### What happens when a user visits your site:

```
1. User types yoursite.com in browser
2. Browser asks DNS for IP address → gets 93.184.216.34
3. Browser sends HTTP request to 93.184.216.34:80
4. Your server receives the request
5. Express processes it → queries MongoDB → builds response
6. Server sends back HTML/JSON
7. Browser renders the page
```

### When does this break?

| Situation | Problem |
|-----------|---------|
| Traffic spike | Server runs out of RAM/CPU → requests time out |
| Server crash | **Entire site goes down** — no redundancy |
| Database grows | Disk fills up, queries become slow |
| Global users | Users far from server experience high latency |
| Deployment | Restarting the server = downtime |

This is why we need system design — to evolve beyond a single server.

---

## When Things Break — The Need for Design

### The Twitter Scaling Story

In 2007, Twitter was a single Rails app with one MySQL database. When it started growing:

```
2007: ~5,000 tweets/day     → Single server works fine
2008: ~300,000 tweets/day   → Database overloaded, "Fail Whale" appears constantly
2009: ~2.5M tweets/day      → Had to completely re-architect:
                                → Separated read/write paths
                                → Introduced caching layer (Memcached)
                                → Moved to eventual consistency
                                → Built custom timeline service

2024: ~500M tweets/day      → Thousands of microservices, custom infrastructure
```

### The Key Lesson

> **You don't need a perfect design on day one. But you need to understand WHEN and HOW to evolve your architecture as you grow.**

### Common Scaling Milestones

```
Stage 1: Single Server
         └── Everything on one machine

Stage 2: Separate Database
         └── App server + dedicated DB server

Stage 3: Add Caching
         └── Redis/Memcached to reduce DB load

Stage 4: Load Balancer + Multiple Servers
         └── Horizontal scaling of app servers

Stage 5: Database Replication
         └── Primary + read replicas

Stage 6: CDN
         └── Static assets served from edge locations

Stage 7: Database Sharding
         └── Split data across multiple DB servers

Stage 8: Microservices + Message Queues
         └── Break monolith, async processing

Stage 9: Multi-Region Deployment
         └── Serve users from closest data center
```

---

## System Design in Interviews

System design interviews are a critical part of hiring at top tech companies. Here's what to expect:

### What Interviewers Look For

| Skill | What They Evaluate |
|-------|-------------------|
| **Requirements gathering** | Do you ask clarifying questions before jumping in? |
| **High-level design** | Can you sketch the core architecture? |
| **Component deep dive** | Can you explain WHY you chose specific components? |
| **Trade-off analysis** | Do you understand the pros/cons of each decision? |
| **Scalability thinking** | Can you evolve the design from 1K to 1B users? |
| **Knowledge breadth** | Do you know about databases, caching, queues, etc.? |

### Common Interview Questions

- Design a URL shortener (like bit.ly)
- Design a chat application (like WhatsApp)
- Design a social media feed (like Twitter/Instagram)
- Design a video streaming platform (like YouTube/Netflix)
- Design a ride-sharing service (like Uber)
- Design a notification system
- Design a web crawler
- Design an online file storage system (like Google Drive)

> We'll solve several of these in Phases 17–19 of this course.

---

## Thinking Like an Architect

The biggest mindset shift in system design is moving from **"how do I code this?"** to **"how should this system be structured?"**

### Developer Mindset vs Architect Mindset

| Developer Thinks | Architect Thinks |
|-----------------|-----------------|
| "How do I write this function?" | "Which service should own this logic?" |
| "This query returns the right data" | "Can this query handle 10,000 req/s?" |
| "I'll store it in the database" | "SQL or NoSQL? How many reads vs writes?" |
| "I'll add a retry if it fails" | "What's the failure domain? What about cascading failures?" |
| "Let me add a cache" | "What's the cache invalidation strategy?" |
| "The API returns JSON" | "REST, GraphQL, or gRPC? What are the trade-offs?" |

### The Trade-Off Mindset

**Every design decision is a trade-off.** There is no "perfect" solution.

```
Consistency ←──────────────────→ Availability
    (Strong consistency means          (High availability means
     some requests may fail)            data may be slightly stale)

Latency ←──────────────────────→ Throughput
    (Processing requests fast          (Processing many requests
     may limit total capacity)          may increase per-request time)

Simplicity ←───────────────────→ Flexibility
    (Simple systems are easier         (Flexible systems handle more
     to maintain but less capable)      cases but are more complex)

Cost ←─────────────────────────→ Performance
    (Better performance                (Lower cost usually means
     usually costs more)                accepting lower performance)
```

> **"There are no right answers in system design — only trade-offs. The best architects can articulate WHY they made each trade-off."**

---

## Key Takeaways

1. **System design** is the process of defining architecture and components to satisfy requirements at scale
2. Every system has **functional requirements** (what it does) and **non-functional requirements** (how well it does it)
3. The five key characteristics are: **scalability, reliability, availability, maintainability, performance**
4. **Availability is measured in "nines"** — 99.99% = ~52 minutes downtime per year
5. **Percentile latency** (p50, p95, p99) matters more than average latency
6. A **single server architecture** works for small apps but breaks under load
7. Systems evolve through predictable **scaling stages** as traffic grows
8. **Every design decision is a trade-off** — there are no perfect solutions
9. System design interviews test your ability to **think at scale and articulate trade-offs**

---

## Practice Exercises

1. **Requirements Gathering Practice:**
   - Pick any app you use daily (Spotify, Uber, Gmail)
   - List 5 functional requirements and 5 non-functional requirements
   - Estimate the availability level they need (how many 9s?)

2. **Back-of-the-Envelope Estimation:**
   - If Twitter has 500 million tweets per day, how many tweets per second is that?
   - If each tweet is ~280 characters (560 bytes), how much storage do they need per day?
   - If they keep tweets for 5 years, how much total storage?

3. **Trade-Off Discussion:**
   - Your e-commerce site's product page loads in 2 seconds. A manager wants it under 500ms.
   - List 3 possible approaches, and the trade-off of each
   - Which would you try first and why?

4. **Single Server Limits:**
   - You have a Node.js app on a single server (4 cores, 16GB RAM, 1TB disk)
   - What's the first bottleneck you'd hit as traffic increases? CPU? RAM? Disk? Network?
   - How would you identify the bottleneck?

---

**Next:** [Phase 02 — Networks, Protocols & Client-Server Architecture →](Phase-02-Networks-Protocols-Client-Server.md)
