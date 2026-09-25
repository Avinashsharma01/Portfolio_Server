# Phase 02 — Networks, Protocols & Client-Server Architecture

## Table of Contents

- [Why Networking Matters for System Design](#why-networking-matters-for-system-design)
- [DNS — The Internet's Phone Book](#dns--the-internets-phone-book)
- [TCP vs UDP — Reliable vs Fast](#tcp-vs-udp--reliable-vs-fast)
- [HTTP Deep Dive for System Design](#http-deep-dive-for-system-design)
- [HTTP/1.1 vs HTTP/2 vs HTTP/3](#http11-vs-http2-vs-http3)
- [WebSockets — Persistent Bidirectional Communication](#websockets--persistent-bidirectional-communication)
- [Long Polling vs WebSockets vs Server-Sent Events](#long-polling-vs-websockets-vs-server-sent-events)
- [Network Latency & Bandwidth](#network-latency--bandwidth)
- [Data Centers & Regions](#data-centers--regions)
- [Key Takeaways](#key-takeaways)
- [Practice Exercises](#practice-exercises)

---

## Why Networking Matters for System Design

Every system design problem involves **services talking to each other over a network**. Understanding networking helps you:

- Estimate latency between components
- Choose the right communication protocol
- Design for network failures
- Optimize data transfer

```
┌─────────┐     Network      ┌──────────┐     Network      ┌──────────┐
│  Client  │ ◄──────────────► │  Server  │ ◄──────────────► │ Database │
└─────────┘    ~50-200ms      └──────────┘     ~1-5ms       └──────────┘
                (Internet)                   (Same DC)
```

> **Rule of thumb:** A network call within the same data center takes ~0.5-5ms. A network call across the internet takes ~50-200ms. This difference fundamentally shapes system design.

---

## DNS — The Internet's Phone Book

DNS converts human-readable domain names to IP addresses. In system design, DNS is also used for **traffic management**.

### Basic DNS Flow

```
User types: www.myapp.com
      │
      ▼
┌─────────────┐    "What's the IP?"    ┌─────────────┐
│   Browser    │ ─────────────────────► │ DNS Resolver │
│              │                        │  (ISP/Cloud) │
│              │ ◄───────────────────── │              │
│              │    "93.184.216.34"     └──────┬───────┘
└──────┬──────┘                                │
       │                                       │ (Recursive lookup)
       │  HTTP request to 93.184.216.34        │
       ▼                                ┌──────▼───────┐
┌─────────────┐                         │ Root → TLD → │
│   Server    │                         │ Authoritative │
└─────────────┘                         └──────────────┘
```

### DNS in System Design

DNS isn't just for name resolution — it's a powerful tool for traffic management:

| DNS Feature | System Design Use |
|-------------|------------------|
| **Round Robin DNS** | Distribute traffic across multiple server IPs |
| **Geo DNS** | Route users to the nearest data center |
| **Weighted DNS** | Send 90% of traffic to new servers, 10% to old (blue-green deploy) |
| **Failover DNS** | Automatically route to backup server if primary is down |
| **TTL (Time to Live)** | Control how long DNS responses are cached |

### DNS Load Balancing Example

```
DNS Query: api.myapp.com

Response (Round Robin):
  Request 1 → 10.0.1.1  (Server A — US-East)
  Request 2 → 10.0.1.2  (Server B — US-West)
  Request 3 → 10.0.1.3  (Server C — EU-West)
  Request 4 → 10.0.1.1  (Back to Server A)

Response (Geo-based):
  User in India      → 10.0.3.1  (Mumbai DC)
  User in US         → 10.0.1.1  (Virginia DC)
  User in Europe     → 10.0.2.1  (Frankfurt DC)
```

### DNS Caching Layers

```
Browser Cache (seconds-minutes)
      │ miss
      ▼
OS Cache (minutes)
      │ miss
      ▼
Router Cache (minutes-hours)
      │ miss
      ▼
ISP DNS Resolver Cache (hours)
      │ miss
      ▼
Recursive DNS Lookup (Root → TLD → Authoritative)
```

> **TTL Trade-off:** Low TTL (30s) = faster failover but more DNS queries. High TTL (3600s) = fewer queries but slow failover. Most production systems use **60-300 seconds**.

---

## TCP vs UDP — Reliable vs Fast

### TCP (Transmission Control Protocol)

TCP guarantees **reliable, ordered delivery** of data. It's used for almost all web communication.

```
TCP Three-Way Handshake:

Client                          Server
  │                                │
  │──── SYN ─────────────────────►│  "I want to connect"
  │                                │
  │◄──── SYN-ACK ────────────────│  "OK, acknowledged"
  │                                │
  │──── ACK ─────────────────────►│  "Great, let's talk"
  │                                │
  │◄════ DATA TRANSFER ══════════►│  Connection established
  │                                │
  │──── FIN ─────────────────────►│  "I'm done"
  │◄──── FIN-ACK ────────────────│  "OK, goodbye"
```

### UDP (User Datagram Protocol)

UDP sends data without establishing a connection. **No guarantee of delivery or order.**

```
UDP Communication:

Client                          Server
  │                                │
  │──── Data Packet 1 ──────────►│  (May or may not arrive)
  │──── Data Packet 2 ──────────►│  (May arrive before Packet 1)
  │──── Data Packet 3 ──────────►│  (May be lost entirely)
  │                                │
  No handshake, no acknowledgment, no ordering
```

### When to Use What

| Protocol | Use When | Examples |
|----------|----------|---------|
| **TCP** | Data must arrive completely and in order | HTTP, database queries, file transfer, email |
| **UDP** | Speed matters more than completeness | Video streaming, online gaming, DNS lookups, VoIP |

### System Design Implications

```
Chat Application (WhatsApp):
  └── Messages: TCP (every message must arrive)
  └── Voice Call: UDP (slight packet loss is OK, low latency is critical)
  └── Video Call: UDP (frame loss acceptable, real-time matters)

Video Streaming (YouTube):
  └── Video metadata/comments: TCP (must be accurate)
  └── Video stream: TCP (with buffering) or QUIC (HTTP/3 over UDP)

Online Game (Fortnite):
  └── Player position updates: UDP (speed > reliability)
  └── Chat messages: TCP (must arrive)
  └── Purchase transactions: TCP (must be reliable)
```

---

## HTTP Deep Dive for System Design

HTTP is the backbone of web communication. Understanding its nuances is critical for system design.

### HTTP Methods in System Design

| Method | Idempotent? | Safe? | Use Case |
|--------|------------|-------|----------|
| `GET` | Yes | Yes | Read data — can be cached, retried safely |
| `POST` | No | No | Create data — retrying may create duplicates |
| `PUT` | Yes | No | Replace data — retrying gives same result |
| `PATCH` | No | No | Partial update — may not be idempotent |
| `DELETE` | Yes | No | Delete data — retrying same deletion is OK |

> **Idempotent** = calling it multiple times has the same effect as calling it once. This matters hugely for **retry logic** and **failure handling** in distributed systems.

### HTTP Status Codes You Must Know

```
2xx — Success
├── 200 OK              → Standard success
├── 201 Created         → New resource created (POST)
├── 204 No Content      → Success but no response body (DELETE)

3xx — Redirection
├── 301 Moved Permanently  → URL changed forever (SEO important)
├── 302 Found              → Temporary redirect
├── 304 Not Modified       → Use cached version

4xx — Client Error
├── 400 Bad Request     → Malformed request
├── 401 Unauthorized    → Not authenticated
├── 403 Forbidden       → Authenticated but not authorized
├── 404 Not Found       → Resource doesn't exist
├── 429 Too Many Requests → Rate limited

5xx — Server Error
├── 500 Internal Server Error → Bug in server code
├── 502 Bad Gateway          → Upstream server failed
├── 503 Service Unavailable  → Server overloaded or in maintenance
├── 504 Gateway Timeout      → Upstream server too slow
```

### HTTP Headers for System Design

| Header | Purpose | System Design Impact |
|--------|---------|---------------------|
| `Cache-Control` | Tells browser/CDN how to cache | Reduces server load |
| `Content-Type` | Data format (JSON, HTML, etc.) | API contract |
| `Authorization` | Auth credentials (Bearer token) | Security |
| `X-Request-ID` | Unique ID for request tracing | Debugging distributed systems |
| `Retry-After` | When to retry after 429/503 | Rate limiting |
| `ETag` | Resource version for caching | Conditional requests |

---

## HTTP/1.1 vs HTTP/2 vs HTTP/3

The evolution of HTTP has major system design implications.

### Comparison

```
HTTP/1.1 (1997):
┌────────┐     ┌────────┐     ┌────────┐
│ Req 1  │────►│ Res 1  │     │        │     One request at a time
│ Req 2  │     │        │────►│ Res 2  │     per connection
│ Req 3  │     │        │     │        │────►│ Res 3  │
└────────┘     └────────┘     └────────┘     └────────┘

HTTP/2 (2015):
┌────────┐     ┌────────┐
│ Req 1 ─┼─────┼─► Res 1│     Multiple requests
│ Req 2 ─┼─────┼─► Res 2│     multiplexed on ONE
│ Req 3 ─┼─────┼─► Res 3│     TCP connection
└────────┘     └────────┘

HTTP/3 (2022):
┌────────┐     ┌────────┐
│ Req 1 ─┼─────┼─► Res 1│     Uses QUIC (UDP-based)
│ Req 2 ─┼─────┼─► Res 2│     No head-of-line blocking
│ Req 3 ─┼─────┼─► Res 3│     Faster connection setup
└────────┘     └────────┘
```

| Feature | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---------|----------|--------|--------|
| **Transport** | TCP | TCP | QUIC (UDP) |
| **Multiplexing** | No (one req per connection) | Yes | Yes |
| **Header compression** | No | HPACK | QPACK |
| **Connection setup** | TCP + TLS (3 round trips) | TCP + TLS (2-3 RTT) | 1 round trip (0-RTT possible) |
| **Head-of-line blocking** | Yes (per connection) | Yes (at TCP level) | No |
| **Server push** | No | Yes | Deprecated |

### System Design Impact

- **HTTP/2** reduces latency for services making many parallel requests (e.g., microservices)
- **HTTP/3** is ideal for mobile users (handles network switching better)
- **gRPC** uses HTTP/2 by default — great for service-to-service communication
- Most CDNs now support HTTP/3 for faster content delivery

---

## WebSockets — Persistent Bidirectional Communication

Regular HTTP is **request-response** — the client asks, the server answers. WebSockets allow **both sides to send data anytime**.

```
HTTP (Request-Response):
Client: "Any new messages?" → Server: "No"
Client: "Any new messages?" → Server: "No"
Client: "Any new messages?" → Server: "Yes, here's one"
Client: "Any new messages?" → Server: "No"
(Wasteful polling — server does work even when there's nothing new)

WebSocket (Persistent Connection):
Client ◄══════════════════════► Server
         (Connection stays open)
Server: "Hey, you got a new message!"
Server: "Another one!"
Client: "I'm typing..."
(Both sides send data whenever they want)
```

### WebSocket Handshake

```
1. Client sends HTTP request with Upgrade header:
   GET /chat HTTP/1.1
   Upgrade: websocket
   Connection: Upgrade

2. Server responds with 101 Switching Protocols:
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade

3. Connection "upgrades" from HTTP to WebSocket
   Both sides can now send data frames freely
```

### When to Use WebSockets

| Use Case | Why WebSockets |
|----------|---------------|
| Chat applications | Messages should appear instantly |
| Live notifications | Server pushes updates immediately |
| Collaborative editing | Multiple users edit same document |
| Live sports scores | Real-time score updates |
| Stock tickers | Prices update every millisecond |
| Online gaming | Low latency bidirectional data |

---

## Long Polling vs WebSockets vs Server-Sent Events

Three approaches for real-time data. Choosing the right one is a common system design decision.

### Comparison

```
Long Polling:
Client ──── Request ────► Server
       (waits... 30s...)
Client ◄─── Response ──── Server (data available OR timeout)
Client ──── Request ────► Server  (immediately reconnects)
       (waits... 15s...)
Client ◄─── Response ──── Server

Server-Sent Events (SSE):
Client ──── Request ────► Server
Client ◄─── Event 1  ──── Server
Client ◄─── Event 2  ──── Server    (One-way: server → client)
Client ◄─── Event 3  ──── Server
       (Connection stays open)

WebSockets:
Client ◄═══════════════► Server
       Msg from server ►
       ◄ Msg from client           (Two-way: both can send anytime)
       Msg from server ►
       (Connection stays open)
```

| Feature | Long Polling | SSE | WebSockets |
|---------|-------------|-----|------------|
| **Direction** | Client → Server → Client | Server → Client | Bidirectional |
| **Protocol** | HTTP | HTTP | WS (upgrade from HTTP) |
| **Connection** | New connection per response | Persistent | Persistent |
| **Complexity** | Low | Low | Medium |
| **Scalability** | Poor (many connections) | Good | Good (but stateful) |
| **Browser support** | Universal | Good (no IE) | Universal |
| **Use case** | Simple notifications | Live feeds, dashboards | Chat, gaming, collaboration |

### System Design Recommendation

```
"Do I need real-time updates?"
├── No → Regular HTTP (polling every few minutes is fine)
├── Yes
│   ├── "Server → Client only?"
│   │   ├── Yes → Server-Sent Events (SSE)
│   │   │        (Notifications, live feeds, dashboards)
│   │   └── No → WebSockets
│   │            (Chat, gaming, collaboration)
│   └── "Can I accept slight delay?"
│       └── Yes → Long Polling (simpler to implement)
```

---

## Network Latency & Bandwidth

Understanding latency numbers is essential for back-of-the-envelope calculations.

### Latency Numbers Every Engineer Should Know

```
Operation                                          Time
─────────────────────────────────────────────────────────
L1 cache reference                                 0.5 ns
L2 cache reference                                   7 ns
Main memory (RAM) reference                        100 ns
SSD random read                                 16,000 ns  (16 μs)
HDD random read                              2,000,000 ns  (2 ms)
Send 1 KB over 1 Gbps network                    10,000 ns  (10 μs)
Read 1 MB sequentially from memory               250,000 ns  (250 μs)
Read 1 MB sequentially from SSD               1,000,000 ns  (1 ms)
Round trip within same data center               500,000 ns  (0.5 ms)
Read 1 MB sequentially from HDD               5,000,000 ns  (5 ms)
Round trip: California → Netherlands         150,000,000 ns  (150 ms)
```

### Implications for System Design

```
Same Machine:
  Memory access:    100 ns     ← This is why caching works
  SSD read:      16,000 ns     ← 160x slower than memory

Same Data Center:
  Network call:  500,000 ns    ← 5,000x slower than memory
                                  This is why you minimize network calls

Cross-Internet:
  API call:  150,000,000 ns    ← 1,500,000x slower than memory
                                  This is why CDNs exist
```

### Bandwidth vs Latency

```
Bandwidth = How much data you can send (highway width)
Latency   = How long it takes to arrive (highway length)

High bandwidth + high latency = Shipping container on a cargo ship
Low bandwidth + low latency   = Text message

For system design:
├── Latency-sensitive: Chat, gaming, trading → Optimize for low latency
├── Bandwidth-sensitive: Video streaming, backups → Optimize for throughput
└── Both: Large file uploads → CDN + chunked transfer
```

---

## Data Centers & Regions

Large systems are deployed across **multiple data centers** in different **regions** worldwide.

### Data Center Architecture

```
┌────────────────────── DATA CENTER ──────────────────────┐
│                                                          │
│  ┌──── Rack 1 ────┐  ┌──── Rack 2 ────┐  ┌── Rack N ──┐│
│  │ ┌────────────┐ │  │ ┌────────────┐ │  │            ││
│  │ │  Server 1  │ │  │ │  Server 5  │ │  │    ...     ││
│  │ ├────────────┤ │  │ ├────────────┤ │  │            ││
│  │ │  Server 2  │ │  │ │  Server 6  │ │  │            ││
│  │ ├────────────┤ │  │ ├────────────┤ │  │            ││
│  │ │  Server 3  │ │  │ │  Server 7  │ │  │            ││
│  │ ├────────────┤ │  │ ├────────────┤ │  │            ││
│  │ │  Server 4  │ │  │ │  Server 8  │ │  │            ││
│  │ └────────────┘ │  │ └────────────┘ │  │            ││
│  └───────────────┘  └───────────────┘  └────────────┘│
│                                                          │
│  ┌─── Network ───┐  ┌─── Storage ───┐  ┌── Power ────┐ │
│  │  Switches     │  │  SAN / NAS    │  │  UPS        │ │
│  │  Routers      │  │  SSD Arrays   │  │  Generators │ │
│  └───────────────┘  └──────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Multi-Region Deployment

```
                    ┌───── US-East (Virginia) ─────┐
                    │  App Servers + DB Primary     │
                    └──────────────┬────────────────┘
                                   │ replication
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
┌───────▼──────────┐    ┌─────────▼──────────┐    ┌──────────▼─────────┐
│ EU-West (Ireland)│    │ US-West (Oregon)    │    │ AP-South (Mumbai)  │
│ App + DB Replica │    │ App + DB Replica    │    │ App + DB Replica   │
└──────────────────┘    └────────────────────┘    └────────────────────┘
```

### Why Multi-Region?

| Reason | Explanation |
|--------|-------------|
| **Lower latency** | Users connect to nearest data center |
| **Disaster recovery** | If one region goes down, others serve traffic |
| **Data sovereignty** | Some countries require data to stay within borders (GDPR) |
| **Higher availability** | Eliminates single points of failure |

### Trade-offs of Multi-Region

```
Challenge 1: Data Consistency
  └── If a user writes in US-East, how quickly does the EU-West replica see it?
  └── Strong consistency = higher latency
  └── Eventual consistency = possible stale reads

Challenge 2: Cost
  └── Running in 3 regions ≈ 3x the cost

Challenge 3: Complexity
  └── Deployment, monitoring, debugging all become harder
  └── Clock synchronization across regions
```

---

## Key Takeaways

1. **DNS** is not just name resolution — it's used for load balancing, geo-routing, and failover in system design
2. **TCP** guarantees delivery (web traffic); **UDP** prioritizes speed (streaming, gaming)
3. **Idempotency** of HTTP methods matters for retry logic in distributed systems
4. **HTTP/2** enables multiplexing (great for microservices); **HTTP/3** uses UDP for faster mobile connections
5. **WebSockets** enable real-time bidirectional communication — essential for chat, gaming, and live updates
6. Choose **SSE** for server-to-client streams, **WebSockets** for bidirectional, **long polling** for simplicity
7. **Latency numbers** guide design decisions — memory is 1,500,000x faster than a cross-internet call
8. **Multi-region deployment** reduces latency and improves availability but adds complexity and cost

---

## Practice Exercises

1. **Protocol Selection:**
   - You're designing a multiplayer game. Which protocol (TCP/UDP) would you use for:
     - Player movements?
     - Chat messages?
     - Leaderboard updates?
     - In-game purchases?
   - Justify each choice.

2. **Real-Time Architecture:**
   - You're building a live dashboard showing server metrics. The dashboard displays:
     - CPU usage (updates every second)
     - Error logs (appear as they happen)
     - Daily summary (updates once a day)
   - Which real-time technique would you use for each?

3. **Latency Calculation:**
   - A user in Mumbai makes an API call to a server in Virginia.
   - The server queries a database (same data center), processes data, and returns a response.
   - Estimate the total round-trip time. What could you do to reduce it?

4. **Multi-Region Design:**
   - You're building an e-commerce site with users in India, US, and Europe.
   - Should you deploy to multiple regions? What are the trade-offs?
   - How would you handle the case where a user in India buys the last item in stock?

---

**Next:** [Phase 03 — Horizontal vs Vertical Scaling →](Phase-03-Scaling-Fundamentals.md)
