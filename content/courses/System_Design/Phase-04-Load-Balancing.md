# Phase 04 — Load Balancing

## Table of Contents

- [What Is a Load Balancer?](#what-is-a-load-balancer)
- [Why We Need Load Balancing](#why-we-need-load-balancing)
- [Where Load Balancers Sit](#where-load-balancers-sit)
- [Load Balancing Algorithms](#load-balancing-algorithms)
- [Layer 4 vs Layer 7 Load Balancing](#layer-4-vs-layer-7-load-balancing)
- [Health Checks](#health-checks)
- [High Availability for Load Balancers](#high-availability-for-load-balancers)
- [Reverse Proxy vs Load Balancer](#reverse-proxy-vs-load-balancer)
- [Global Server Load Balancing (GSLB)](#global-server-load-balancing-gslb)
- [Load Balancing in Practice](#load-balancing-in-practice)
- [Key Takeaways](#key-takeaways)
- [Practice Exercises](#practice-exercises)

---

## What Is a Load Balancer?

A load balancer is a device or software that **distributes incoming network traffic** across multiple servers to ensure no single server gets overwhelmed.

```
Without Load Balancer:                 With Load Balancer:

     All traffic                         Traffic distributed
         │                                    │
         ▼                              ┌─────▼─────┐
    ┌─────────┐                         │   Load    │
    │ Server  │ ← Overwhelmed!          │ Balancer  │
    │  😰     │ ← Crashes!             └──┬──┬──┬──┘
    └─────────┘                            │  │  │
                                     ┌─────┘  │  └─────┐
                                     ▼        ▼        ▼
                                ┌────────┐┌────────┐┌────────┐
                                │Server 1││Server 2││Server 3│
                                │  😊   ││  😊   ││  😊   │
                                └────────┘└────────┘└────────┘
                                   33%       33%       33%
```

### Real-World Analogy

Think of a **bank with multiple tellers**:

| Bank | System |
|------|--------|
| Customers entering the bank | Incoming requests |
| The person directing you to a free teller | Load balancer |
| Bank tellers | Servers |
| The queue line | Request queue |

Without direction, everyone would crowd the first teller while others sit idle.

---

## Why We Need Load Balancing

### Problem 1: Uneven Traffic Distribution

```
Without LB:
Server A: ████████████████████ 95% CPU (about to crash)
Server B: ██                    10% CPU (mostly idle)
Server C: ███                   15% CPU (mostly idle)

With LB:
Server A: ████████████          55% CPU
Server B: ████████████          55% CPU
Server C: ████████████          55% CPU
```

### Problem 2: Single Point of Failure

```
Without LB:
Server dies → 💥 ENTIRE SERVICE DOWN

With LB:
Server 2 dies → LB stops sending traffic to it
                Servers 1 and 3 handle the load
                Users don't even notice
```

### Benefits Summary

| Benefit | How |
|---------|-----|
| **Even distribution** | Spreads requests across all servers |
| **High availability** | Routes around failed servers |
| **Flexibility** | Add/remove servers without downtime |
| **Performance** | No single server is a bottleneck |
| **Security** | Hides internal server IPs from the internet |
| **SSL termination** | Handles encryption/decryption, offloading from servers |

---

## Where Load Balancers Sit

In a real system, there are multiple layers where load balancing is needed:

```
┌──────────┐
│  Users   │
└────┬─────┘
     │
     ▼
┌──────────────────────────────┐
│  Layer 1: DNS Load Balancing │  ← Routes to nearest data center
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Layer 2: Edge / CDN         │  ← Serves static content
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Layer 3: External LB        │  ← Distributes across web servers
│  (Public-facing)             │
└──────────────┬───────────────┘
               │
        ┌──────┼──────┐
        ▼      ▼      ▼
    ┌──────┐┌──────┐┌──────┐
    │Web 1 ││Web 2 ││Web 3 │
    └──┬───┘└──┬───┘└──┬───┘
       │       │       │
       ▼       ▼       ▼
┌──────────────────────────────┐
│  Layer 4: Internal LB        │  ← Distributes across app/API servers
│  (Between services)         │
└──────────────┬───────────────┘
               │
        ┌──────┼──────┐
        ▼      ▼      ▼
    ┌──────┐┌──────┐┌──────┐
    │API 1 ││API 2 ││API 3 │
    └──┬───┘└──┬───┘└──┬───┘
       │       │       │
       ▼       ▼       ▼
┌──────────────────────────────┐
│  Layer 5: Database LB        │  ← Routes reads to replicas
│  (Read replica routing)     │
└──────────────────────────────┘
```

---

## Load Balancing Algorithms

The algorithm determines **how** the load balancer decides which server gets the next request.

### 1. Round Robin

The simplest algorithm — requests go to servers in order, one by one.

```
Request 1 → Server A
Request 2 → Server B
Request 3 → Server C
Request 4 → Server A  (back to start)
Request 5 → Server B
Request 6 → Server C
...
```

| Pros | Cons |
|------|------|
| Simplest to implement | Ignores server capacity differences |
| Even distribution | Ignores current server load |
| Works well with identical servers | Long requests can pile up on one server |

### 2. Weighted Round Robin

Like round robin, but **heavier servers get more requests**.

```
Server A (weight: 3) — gets 3 out of every 6 requests
Server B (weight: 2) — gets 2 out of every 6 requests
Server C (weight: 1) — gets 1 out of every 6 requests

Request 1 → Server A
Request 2 → Server A
Request 3 → Server A
Request 4 → Server B
Request 5 → Server B
Request 6 → Server C
(repeat)
```

**Use when:** servers have different capacities (e.g., new powerful server alongside older ones).

### 3. Least Connections

Send the request to the server with the **fewest active connections**.

```
Current state:
Server A: 12 active connections
Server B: 8 active connections   ← Next request goes here
Server C: 15 active connections

After:
Server A: 12 active connections
Server B: 9 active connections   ← Got the new request
Server C: 15 active connections
```

| Pros | Cons |
|------|------|
| Adapts to varying request durations | Slightly more overhead (tracking connections) |
| Better for long-lived connections | New server gets flooded initially (0 connections) |

**Best for:** WebSocket connections, long-running requests, or when request processing times vary significantly.

### 4. Weighted Least Connections

Combines least connections with weights — accounts for both **server capacity** and **current load**.

### 5. IP Hash

Uses the client's IP address to **deterministically** route them to the same server.

```
hash("192.168.1.100") % 3 = 1 → Server B (always)
hash("10.0.0.50") % 3 = 0     → Server A (always)
hash("172.16.0.1") % 3 = 2    → Server C (always)
```

| Pros | Cons |
|------|------|
| Same client always hits same server | Uneven distribution possible |
| Good for stateful applications | Rehashing problem when servers change |
| Useful when session affinity is needed | Can't handle NAT well (many users share one IP) |

### 6. Least Response Time

Send the request to the server with the **fastest response time AND fewest connections**.

```
Server A: avg 45ms, 10 connections
Server B: avg 30ms, 8 connections   ← Next request goes here
Server C: avg 60ms, 12 connections
```

**Best for:** when you want to optimize for end-user latency.

### 7. Random

Just pick a random server. Surprisingly effective with enough servers.

```
Request 1 → Server C (random)
Request 2 → Server A (random)
Request 3 → Server A (random)
Request 4 → Server B (random)
```

### 8. Consistent Hashing

Maps both servers and requests to a hash ring. Each request goes to the nearest server clockwise. We'll cover this in depth in Phase 11.

```
         Server A
           │
    ───────●───────
   /       │       \
  ●                 ●
Server D           Server B
  \                /
   ────────●──────
           │
        Server C

Request hash lands between B and C → goes to C
If C is removed → traffic goes to D (minimal redistribution)
```

### Algorithm Comparison

| Algorithm | Best For | Overhead |
|-----------|----------|----------|
| Round Robin | Identical servers, simple setup | Minimal |
| Weighted Round Robin | Servers with different capacities | Low |
| Least Connections | Varying request durations | Medium |
| IP Hash | Session affinity, caching | Low |
| Least Response Time | Latency-sensitive applications | Medium |
| Consistent Hashing | Cache servers, distributed databases | Medium |

---

## Layer 4 vs Layer 7 Load Balancing

Load balancers can operate at different levels of the network stack. This is a crucial architectural decision.

### Layer 4 (Transport Layer)

Routes based on **IP addresses and TCP/UDP ports** — doesn't inspect the actual content.

```
Layer 4 Load Balancer:

Incoming: TCP connection to 10.0.0.1:443
LB sees:  Source IP, Destination IP, Source Port, Destination Port
LB decides: Forward entire TCP connection to Server B

┌────────────┐     ┌────────────┐     ┌────────────┐
│   Client   │────►│   L4 LB    │────►│  Server B  │
│            │     │            │     │            │
│            │◄────│  (TCP/UDP  │◄────│            │
│            │     │   level)   │     │            │
└────────────┘     └────────────┘     └────────────┘

LB doesn't know: URL path, HTTP headers, cookies, body content
```

### Layer 7 (Application Layer)

Routes based on the **actual HTTP content** — URLs, headers, cookies, request body.

```
Layer 7 Load Balancer:

Incoming: POST /api/users with header Authorization: Bearer xyz

LB sees: URL path, HTTP method, headers, cookies, body
LB decides based on rules:
  - /api/*     → API server pool
  - /images/*  → Static file server pool
  - /admin/*   → Admin server pool

┌────────────┐     ┌────────────┐     ┌────────────┐
│   Client   │────►│   L7 LB    │────►│  API Pool  │
│            │     │            │     └────────────┘
│            │     │  (HTTP     │     ┌────────────┐
│            │     │   level)   │────►│Static Pool │
│            │     │            │     └────────────┘
│            │     │ Inspects   │     ┌────────────┐
│            │◄────│ content    │────►│Admin Pool  │
└────────────┘     └────────────┘     └────────────┘
```

### Comparison

| Feature | Layer 4 | Layer 7 |
|---------|---------|---------|
| **Routes based on** | IP + Port | URL, headers, cookies, content |
| **Performance** | Faster (less processing) | Slower (parses HTTP) |
| **Flexibility** | Basic routing only | Content-based routing, A/B testing |
| **SSL termination** | Pass-through or terminate | Terminate and re-encrypt |
| **Caching** | Cannot cache | Can cache responses |
| **WebSocket support** | Pass-through | Can inspect and route |
| **Use case** | High-throughput, simple routing | Microservices, path-based routing |

### Layer 7 Routing Examples

```
Content-based routing rules:

Rule 1: Path-based
  /api/v1/*  → API v1 servers
  /api/v2/*  → API v2 servers (canary deployment)

Rule 2: Header-based
  User-Agent contains "Mobile" → Mobile-optimized servers
  User-Agent contains "Bot"    → Bot handling servers

Rule 3: Cookie-based
  Cookie "beta=true" → Beta feature servers

Rule 4: Method-based
  GET  requests → Read-optimized servers
  POST requests → Write-optimized servers
```

---

## Health Checks

Load balancers need to know which servers are **healthy** and can accept traffic.

### Types of Health Checks

```
1. Active Health Checks (LB probes servers):
   
   Load Balancer                    Server
        │                              │
        │── GET /health ──────────────►│
        │                              │
        │◄── 200 OK ──────────────────│  ✓ Healthy
        │                              │
        │── GET /health ──────────────►│
        │                              │
        │◄── 503 Service Unavailable ─│  ✗ Unhealthy
        │                              │
        │── GET /health ──────────────►│
        │                              │
        │◄── (timeout, no response) ──│  ✗ Dead
        │                              │

2. Passive Health Checks (LB observes real traffic):
   
   If Server returns 5xx errors > 50% in last 30 seconds → Mark unhealthy
   If Server response time > 5 seconds consistently → Mark slow
```

### Health Check Configuration

```
Health Check Parameters:
├── Endpoint:    GET /health
├── Interval:    Every 10 seconds
├── Timeout:     5 seconds (if no response, consider failed)
├── Threshold:   3 consecutive failures → mark unhealthy
├── Recovery:    2 consecutive successes → mark healthy again
└── Check Type:  HTTP 200 OK (not just TCP connection)
```

### Health Endpoint Best Practices

```javascript
// Simple health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Deep health check (checks dependencies)
app.get('/health/deep', async (req, res) => {
    const checks = {
        database: await checkDatabase(),   // Can we query the DB?
        redis: await checkRedis(),         // Is Redis reachable?
        disk: checkDiskSpace(),            // Enough disk space?
        memory: checkMemoryUsage(),        // Not running out of RAM?
    };
    
    const allHealthy = Object.values(checks).every(c => c.healthy);
    
    res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'healthy' : 'degraded',
        checks
    });
});
```

### Server Lifecycle with Health Checks

```
Server starts
    │
    ▼
┌──────────────┐     Health check passes
│  Starting    │────────────────────────────►┌──────────────┐
│  (not in LB) │                             │   Healthy    │
└──────────────┘                             │  (in LB)     │
                                             └──────┬───────┘
                                                    │
                                            3 failures│
                                                    ▼
                                             ┌──────────────┐
                                             │  Unhealthy   │
                                             │(removed from │
                                             │    LB)       │
                                             └──────┬───────┘
                                                    │
                                            2 successes│
                                                    ▼
                                             ┌──────────────┐
                                             │   Healthy    │
                                             │  (back in LB)│
                                             └──────────────┘
```

---

## High Availability for Load Balancers

The load balancer itself can become a **single point of failure**. How do we solve this?

### Active-Passive (Failover)

```
┌─────────────────┐     ┌─────────────────┐
│  Active LB      │     │  Passive LB     │
│  (handles all   │     │  (standby,      │
│   traffic)      │     │   monitors      │
│                 │◄───►│   active LB)    │
│   IP: 10.0.0.1 │     │                 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │  Active LB dies?      │
         │                       │
         ▼                       ▼
    Traffic stops          Passive takes over
                           Gets the virtual IP 10.0.0.1
                           (Floating IP / VIP)
```

### Active-Active

```
┌─────────────────┐     ┌─────────────────┐
│    LB  1        │     │    LB  2        │
│  (handles 50%   │     │  (handles 50%   │
│   traffic)      │     │   traffic)      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   Servers   │
              └─────────────┘

If LB 1 dies → LB 2 handles all traffic (already warm)
Better resource utilization than active-passive
```

### Virtual IP (VIP) / Floating IP

```
DNS: api.myapp.com → 203.0.113.10 (Virtual IP)

The Virtual IP is not tied to a physical machine.
It "floats" between LB 1 and LB 2.

Normal:   VIP → LB 1 (active)
Failover: VIP → LB 2 (was passive, now active)

Users always connect to the same IP — they don't know the LB changed.
```

---

## Reverse Proxy vs Load Balancer

These terms are often confused but serve different (sometimes overlapping) purposes.

### Reverse Proxy

A reverse proxy sits in front of servers and **forwards client requests to them**. It's a single server, not necessarily distributing load.

```
Client ──► Reverse Proxy ──► Server

Functions:
├── SSL termination (handle HTTPS)
├── Compression (gzip responses)
├── Caching (serve cached responses)
├── Security (hide server details, filter requests)
├── Rate limiting
└── URL rewriting
```

### Load Balancer

A load balancer specifically **distributes traffic** across multiple servers.

```
Client ──► Load Balancer ──► Server 1
                         ──► Server 2
                         ──► Server 3
```

### Overlap

```
Modern load balancers (like Nginx, HAProxy) do BOTH:

Client ──► Nginx (Reverse Proxy + Load Balancer)
           ├── SSL termination     (reverse proxy function)
           ├── Caching             (reverse proxy function)
           ├── Rate limiting       (reverse proxy function)
           └── Distributes to:     (load balancer function)
               ├── Server 1
               ├── Server 2
               └── Server 3
```

| Feature | Reverse Proxy | Load Balancer |
|---------|--------------|---------------|
| **Primary purpose** | Sit in front of servers | Distribute traffic |
| **Number of backends** | One or more | Multiple (required) |
| **SSL termination** | Yes | Yes |
| **Caching** | Yes | Sometimes |
| **Health checks** | Optional | Essential |
| **Algorithms** | N/A | Round Robin, Least Conn, etc. |

---

## Global Server Load Balancing (GSLB)

GSLB distributes traffic across **multiple data centers** worldwide, typically using DNS.

```
User in India                        User in US
     │                                    │
     ▼                                    ▼
┌────────────────────────────────────────────────────┐
│              Global Load Balancer (DNS)             │
│                                                     │
│  User in India? → Mumbai DC IP                      │
│  User in US?    → Virginia DC IP                    │
│  User in EU?    → Frankfurt DC IP                   │
└──────────┬───────────────────────┬─────────────────┘
           │                       │
           ▼                       ▼
    ┌──────────────┐        ┌──────────────┐
    │  Mumbai DC   │        │ Virginia DC  │
    │  ┌────────┐  │        │  ┌────────┐  │
    │  │Local LB│  │        │  │Local LB│  │
    │  └───┬────┘  │        │  └───┬────┘  │
    │  ┌───┼────┐  │        │  ┌───┼────┐  │
    │  │S1 │ S2 │  │        │  │S1 │ S2 │  │
    │  └───┴────┘  │        │  └───┴────┘  │
    └──────────────┘        └──────────────┘
```

### GSLB Strategies

| Strategy | How It Works | Use When |
|----------|-------------|----------|
| **Geo-proximity** | Route to nearest data center | Minimize latency for global users |
| **Latency-based** | Route to DC with lowest measured latency | When proximity ≠ lowest latency |
| **Failover** | Route to backup DC if primary is down | Disaster recovery |
| **Weighted** | Send percentage of traffic to each DC | Gradual migration, A/B testing |

---

## Load Balancing in Practice

### Popular Load Balancers

| Tool | Type | Best For |
|------|------|----------|
| **Nginx** | Software L7 (also L4) | Web servers, reverse proxy, most common |
| **HAProxy** | Software L4/L7 | High-performance TCP/HTTP load balancing |
| **AWS ALB** | Cloud L7 | AWS applications, path-based routing |
| **AWS NLB** | Cloud L4 | Ultra-high performance, static IPs |
| **AWS ELB** | Cloud L4 | Legacy, simple TCP load balancing |
| **Google Cloud LB** | Cloud L4/L7 | GCP applications, global LB |
| **Cloudflare** | Edge/CDN | DDoS protection + global load balancing |
| **Envoy** | Software L7 | Microservices, service mesh (sidecar proxy) |
| **Traefik** | Software L7 | Container/Kubernetes environments |

### Basic Nginx Load Balancer Configuration

```nginx
# /etc/nginx/nginx.conf

http {
    # Define the pool of backend servers
    upstream api_servers {
        # Load balancing algorithm (default: round robin)
        least_conn;  # Use least connections instead
        
        server 10.0.1.1:3000 weight=3;  # More powerful server
        server 10.0.1.2:3000 weight=2;
        server 10.0.1.3:3000 weight=1;
        server 10.0.1.4:3000 backup;    # Only used if others are down
    }

    server {
        listen 80;
        server_name api.myapp.com;

        location / {
            proxy_pass http://api_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://api_servers;
        }
    }
}
```

---

## Key Takeaways

1. **Load balancers distribute traffic** across multiple servers, improving availability and performance
2. **Multiple layers** of load balancing exist: DNS → Edge/CDN → External LB → Internal LB → DB routing
3. Key algorithms: **Round Robin** (simple), **Least Connections** (adaptive), **IP Hash** (sticky), **Consistent Hashing** (distributed caches)
4. **Layer 4 LB** routes by IP/port (fast, simple); **Layer 7 LB** routes by HTTP content (flexible, smart)
5. **Health checks** (active + passive) are essential — automatically remove unhealthy servers
6. **LB high availability** requires Active-Passive or Active-Active setups with floating IPs
7. A **reverse proxy** provides caching, SSL, and security; a **load balancer** distributes traffic — modern tools do both
8. **GSLB** distributes traffic globally using DNS-based geo/latency routing
9. **Nginx** and **HAProxy** are the most popular software load balancers

---

## Practice Exercises

1. **Algorithm Selection:**
   - You have 3 servers: one with 32GB RAM, one with 16GB, one with 8GB.
   - Which load balancing algorithm would you use? Why?
   - What happens if the 32GB server goes down?

2. **Layer 4 vs Layer 7:**
   - Your app has these endpoints: `/api/users`, `/api/orders`, `/static/images/*`, `/admin/*`
   - Would you use L4 or L7 load balancing?
   - Write the routing rules you'd configure.

3. **Health Check Design:**
   - Design a health check endpoint for a service that depends on PostgreSQL, Redis, and an external payment API.
   - What should the health check verify?
   - Should the payment API check affect the health status?

4. **High Availability:**
   - Draw an architecture where the load balancer itself is highly available.
   - What happens if both load balancers fail simultaneously?
   - How would you prevent this?

---

**Next:** [Phase 05 — Caching — Strategies, Eviction & Invalidation →](Phase-05-Caching-Strategies.md)
