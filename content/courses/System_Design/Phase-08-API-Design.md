# Phase 08 — API Design — REST, GraphQL & gRPC

## Table of Contents

- [Why API Design Matters](#why-api-design-matters)
- [REST API Design](#rest-api-design)
- [REST Best Practices](#rest-best-practices)
- [API Versioning](#api-versioning)
- [Pagination](#pagination)
- [GraphQL](#graphql)
- [gRPC — High-Performance RPC](#grpc--high-performance-rpc)
- [REST vs GraphQL vs gRPC](#rest-vs-graphql-vs-grpc)
- [API Gateway](#api-gateway)
- [API Rate Limiting & Authentication](#api-rate-limiting--authentication)
- [Idempotency in API Design](#idempotency-in-api-design)
- [Key Takeaways](#key-takeaways)
- [Practice Exercises](#practice-exercises)

---

## Why API Design Matters

APIs are the **contracts** between services. In a microservices architecture, every service communicates via APIs. A poorly designed API creates problems that cascade across the entire system.

```
┌──────────┐   API    ┌──────────┐   API    ┌──────────┐
│ Frontend │◄────────►│  User    │◄────────►│ Payment  │
│  Client  │          │ Service  │          │ Service  │
└──────────┘          └──────────┘          └──────────┘
                           │ API
                           ▼
                      ┌──────────┐
                      │ Database │
                      └──────────┘

Every arrow is an API contract.
Bad API design = bad developer experience = slow development = bugs
```

---

## REST API Design

REST (Representational State Transfer) is the **most common** API style for web services.

### Core Principles

```
1. Resources:    Everything is a resource (user, order, product)
2. URLs:         Resources identified by URLs (/users/123)
3. HTTP Methods: Actions on resources (GET, POST, PUT, DELETE)
4. Stateless:    Each request contains all needed info
5. Representations: Resources sent as JSON (or XML)
```

### RESTful URL Design

```
Good URLs (Resource-based):          Bad URLs (Action-based):
──────────────────────────           ────────────────────────
GET    /users                        GET  /getUsers
GET    /users/123                    GET  /getUserById?id=123
POST   /users                        POST /createUser
PUT    /users/123                    POST /updateUser
DELETE /users/123                    POST /deleteUser
GET    /users/123/orders             GET  /getUserOrders?userId=123
GET    /users/123/orders/456         GET  /getOrder?userId=123&orderId=456
```

### HTTP Methods Mapped to CRUD

| Method | CRUD | URL | Action | Response |
|--------|------|-----|--------|----------|
| `GET` | Read | `/users` | List all users | `200 OK` + array |
| `GET` | Read | `/users/123` | Get single user | `200 OK` + object |
| `POST` | Create | `/users` | Create new user | `201 Created` + new object |
| `PUT` | Replace | `/users/123` | Replace entire user | `200 OK` + updated object |
| `PATCH` | Update | `/users/123` | Update partial user | `200 OK` + updated object |
| `DELETE` | Delete | `/users/123` | Delete user | `204 No Content` |

### REST Response Format

```json
// Success Response
{
    "status": "success",
    "data": {
        "id": 123,
        "name": "Avinash",
        "email": "avinash@mail.com"
    }
}

// Error Response
{
    "status": "error",
    "error": {
        "code": "USER_NOT_FOUND",
        "message": "User with id 123 does not exist",
        "details": "Check the user ID and try again"
    }
}

// List Response with Pagination
{
    "status": "success",
    "data": [
        { "id": 1, "name": "Avinash" },
        { "id": 2, "name": "Priya" }
    ],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 150,
        "total_pages": 8
    }
}
```

---

## REST Best Practices

### 1. Use Nouns, Not Verbs

```
✓ GET    /articles          (get all articles)
✓ POST   /articles          (create article)
✗ GET    /getArticles       (verb in URL)
✗ POST   /createArticle     (verb in URL)
```

### 2. Use Plural Nouns

```
✓ /users/123
✗ /user/123

✓ /orders/456/items
✗ /order/456/item
```

### 3. Use Proper Status Codes

```
Success:
├── 200 OK              → Request succeeded (GET, PUT, PATCH)
├── 201 Created         → New resource created (POST)
├── 204 No Content      → Success with no body (DELETE)

Client Error:
├── 400 Bad Request     → Invalid request data
├── 401 Unauthorized    → Not authenticated
├── 403 Forbidden       → Authenticated but not authorized
├── 404 Not Found       → Resource doesn't exist
├── 409 Conflict        → Resource conflict (duplicate email)
├── 422 Unprocessable   → Valid syntax but invalid data
├── 429 Too Many Requests → Rate limited

Server Error:
├── 500 Internal Server Error → Bug in server
├── 502 Bad Gateway          → Upstream server failed
├── 503 Service Unavailable  → Server overloaded
```

### 4. Filtering, Sorting, Searching

```
Filtering:
GET /products?category=electronics&price_min=1000&price_max=50000

Sorting:
GET /products?sort=price&order=asc
GET /products?sort=-created_at       (prefix - for descending)

Searching:
GET /products?search=iphone+15
GET /users?q=avinash

Combined:
GET /products?category=electronics&sort=-price&page=2&per_page=20
```

### 5. Nested Resources

```
User's orders:          GET /users/123/orders
Order's items:          GET /users/123/orders/456/items
Specific item:          GET /orders/456/items/789

Limit nesting to 2-3 levels:
✓ /users/123/orders
✗ /users/123/orders/456/items/789/reviews  (too deep — flatten it)

Better: GET /items/789/reviews
```

---

## API Versioning

APIs evolve. You need to update them without breaking existing clients.

### Versioning Strategies

```
1. URL Path Versioning (Most Common):
   GET /v1/users/123
   GET /v2/users/123

2. Header Versioning:
   GET /users/123
   Accept: application/vnd.myapi.v2+json

3. Query Parameter:
   GET /users/123?version=2
```

| Strategy | Pros | Cons |
|----------|------|------|
| **URL Path** (/v1/) | Explicit, easy to understand, cacheable | URL changes |
| **Header** | Clean URLs | Hidden, harder to test/debug |
| **Query Param** | Easy to add | Can be forgotten, caching issues |

> **Recommendation:** Use URL path versioning (`/v1/`, `/v2/`). It's the industry standard and easiest for developers.

---

## Pagination

When a collection has millions of items, you **must** paginate.

### 1. Offset-Based Pagination

```
GET /users?page=3&per_page=20

SQL: SELECT * FROM users LIMIT 20 OFFSET 40;

Page 1: items 1-20    (OFFSET 0)
Page 2: items 21-40   (OFFSET 20)
Page 3: items 41-60   (OFFSET 40)
```

| Pros | Cons |
|------|------|
| Simple to implement | **Slow for deep pages** (OFFSET 1M = scan 1M rows) |
| User can jump to any page | Inconsistent if data is inserted/deleted between pages |
| Total count available | Performance degrades linearly with page number |

### 2. Cursor-Based Pagination (Recommended for Scale)

```
GET /users?cursor=eyJpZCI6MTAwfQ&limit=20

Response:
{
    "data": [...20 users...],
    "cursor": {
        "next": "eyJpZCI6MTIwfQ",    // Encoded: {"id": 120}
        "has_more": true
    }
}

SQL: SELECT * FROM users WHERE id > 100 ORDER BY id LIMIT 20;
```

| Pros | Cons |
|------|------|
| **Consistent performance** regardless of page depth | Can't jump to arbitrary page |
| Handles insertions/deletions correctly | More complex to implement |
| Great for infinite scroll | Need a stable sort column |

### 3. Keyset Pagination

Similar to cursor but uses the actual column values.

```
GET /users?after_id=100&limit=20

SQL: SELECT * FROM users WHERE id > 100 ORDER BY id LIMIT 20;

Last item has id=120, next request:
GET /users?after_id=120&limit=20
```

### When to Use What

```
Offset pagination:  Traditional page-based UIs (page 1, 2, 3...)
                    < 100K total records
                    
Cursor pagination:  Infinite scroll (mobile feeds, timelines)
                    Real-time data (new items being added)
                    Large datasets (millions of records)
```

---

## GraphQL

GraphQL is a **query language for APIs** created by Facebook. The client specifies exactly what data it needs.

### The Problem GraphQL Solves

```
REST Over-fetching:
GET /users/123
Returns: { id, name, email, bio, avatar, address, phone, preferences, ... }
Client only needed: { name, avatar }
→ Wasted bandwidth!

REST Under-fetching:
Need: User name + their posts + each post's comments
Request 1: GET /users/123           → { name: "Avinash" }
Request 2: GET /users/123/posts     → [{ id: 1 }, { id: 2 }]
Request 3: GET /posts/1/comments    → [...]
Request 4: GET /posts/2/comments    → [...]
→ 4 requests! Slow on mobile!

GraphQL Solution:
One request gets exactly what you need:
POST /graphql
{
    query {
        user(id: 123) {
            name
            avatar
            posts {
                title
                comments {
                    text
                    author { name }
                }
            }
        }
    }
}
→ Single request, exact data needed!
```

### GraphQL Schema

```graphql
type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
}

type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
}

type Query {
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    post(id: ID!): Post
}

type Mutation {
    createUser(name: String!, email: String!): User!
    createPost(title: String!, content: String!, authorId: ID!): Post!
}
```

### GraphQL Pros & Cons

| Pros | Cons |
|------|------|
| Client gets exactly the data it needs | Complex server implementation |
| Single endpoint (/graphql) | Caching is harder (all POST requests) |
| Strongly typed schema | N+1 query problem without DataLoader |
| Great for mobile (bandwidth savings) | Can allow expensive nested queries |
| Self-documenting (schema introspection) | Learning curve for teams |
| Versioning not needed (additive changes) | Rate limiting is complex |

---

## gRPC — High-Performance RPC

gRPC is a **high-performance Remote Procedure Call** framework by Google. It uses Protocol Buffers (protobuf) for serialization and HTTP/2 for transport.

### How gRPC Works

```
REST:                                   gRPC:
Client sends JSON over HTTP/1.1         Client calls function over HTTP/2

POST /api/users                         userService.GetUser(userId: 123)
Content-Type: application/json          
{"name": "Avinash"}                     Serialized as binary (protobuf)
                                        Much smaller and faster

Response:                               Response:
{"id": 123, "name": "Avinash"}         User { id: 123, name: "Avinash" }
(JSON text — ~50 bytes)                 (Binary — ~15 bytes)
```

### Protocol Buffer Definition

```protobuf
// user.proto
syntax = "proto3";

service UserService {
    rpc GetUser (GetUserRequest) returns (User);
    rpc ListUsers (ListUsersRequest) returns (stream User);  // Server streaming
    rpc CreateUser (User) returns (User);
}

message GetUserRequest {
    int32 id = 1;
}

message User {
    int32 id = 1;
    string name = 2;
    string email = 3;
}
```

### gRPC Communication Patterns

```
1. Unary RPC (request-response):
   Client ── Request ──► Server
   Client ◄── Response ── Server

2. Server Streaming:
   Client ── Request ──► Server
   Client ◄── Data 1 ─── Server
   Client ◄── Data 2 ─── Server
   Client ◄── Data 3 ─── Server

3. Client Streaming:
   Client ── Data 1 ──► Server
   Client ── Data 2 ──► Server
   Client ── Data 3 ──► Server
   Client ◄── Response ── Server

4. Bidirectional Streaming:
   Client ◄══ Data ══► Server
   (Both send and receive simultaneously)
```

### gRPC Pros & Cons

| Pros | Cons |
|------|------|
| 7-10x faster than REST/JSON | Not human-readable (binary) |
| Strong typing via protobuf | Harder to debug (can't use curl) |
| HTTP/2 multiplexing | Limited browser support |
| Streaming support built-in | Steeper learning curve |
| Code generation in any language | Not great for public APIs |
| Bidirectional communication | Requires protobuf compilation step |

---

## REST vs GraphQL vs gRPC

```
                    REST              GraphQL          gRPC
                    ────              ───────          ────
Protocol            HTTP/1.1          HTTP/1.1         HTTP/2
Data Format         JSON              JSON             Protobuf (binary)
Type System         None (OpenAPI)    Strong (Schema)  Strong (Proto)
Speed               Moderate          Moderate         Fast
Browser Support     Full              Full             Limited
Streaming           No (SSE/WS)       Subscriptions    Built-in
Caching             Easy (HTTP)       Complex          Custom
Learning Curve      Low               Medium           High
```

### When to Use What

```
REST:
├── Public APIs (developer-facing)
├── Simple CRUD operations
├── Web applications
├── When caching is important
└── When simplicity matters

GraphQL:
├── Mobile apps (bandwidth optimization)
├── Complex data with many relationships
├── Multiple client types (web, mobile, TV) needing different data
├── Rapid frontend iteration
└── When clients need flexibility

gRPC:
├── Microservice-to-microservice communication
├── High-performance internal APIs
├── Real-time streaming (IoT, live data)
├── Polyglot environments (services in different languages)
└── When low latency is critical
```

### Real-World Usage

| Company | External API | Internal APIs |
|---------|-------------|---------------|
| **Netflix** | REST | gRPC (between microservices) |
| **Uber** | REST | gRPC + Thrift |
| **GitHub** | REST + GraphQL | Internal services |
| **Facebook** | GraphQL | Thrift (internal RPC) |
| **Google** | REST + gRPC | gRPC |
| **Shopify** | REST + GraphQL | REST + GraphQL |

---

## API Gateway

An API gateway is a **single entry point** for all client requests, routing them to the appropriate backend service.

```
Without API Gateway:                   With API Gateway:

Client must know                       Client talks to ONE endpoint
every service URL:                     
                                       ┌──────────────────┐
┌────────┐──► User Service             │   API Gateway    │
│ Client │──► Order Service      ──►   │                  │
│        │──► Payment Service          │ /users → User Svc│
│        │──► Notification Svc         │ /orders → Order  │
└────────┘                             │ /pay → Payment   │
                                       └──────────────────┘
```

### API Gateway Responsibilities

```
┌────────────────────────────────────────────────┐
│                 API Gateway                     │
├────────────────────────────────────────────────┤
│ 1. Request Routing      → Route to correct service │
│ 2. Authentication       → Verify JWT/API keys     │
│ 3. Rate Limiting        → Prevent abuse           │
│ 4. Load Balancing       → Distribute requests     │
│ 5. Response Caching     → Cache common responses  │
│ 6. Request/Response     → Transform data formats  │
│    Transformation                                  │
│ 7. SSL Termination      → Handle HTTPS            │
│ 8. Logging & Monitoring → Track all API calls     │
│ 9. Circuit Breaking     → Prevent cascade failures│
│10. API Versioning       → Route v1/v2 traffic     │
└────────────────────────────────────────────────┘
```

### Popular API Gateways

| Gateway | Type | Best For |
|---------|------|----------|
| **Kong** | Open source | General purpose, plugin ecosystem |
| **AWS API Gateway** | Cloud | AWS applications |
| **Nginx** | Open source | High performance, reverse proxy |
| **Envoy** | Open source | Microservices, service mesh |
| **Traefik** | Open source | Kubernetes/container environments |

---

## API Rate Limiting & Authentication

### Rate Limiting

```
Rate Limit: 100 requests per minute per user

Request  1 at 10:00:00 → ✓ Allowed (1/100)
Request  2 at 10:00:01 → ✓ Allowed (2/100)
...
Request 100 at 10:00:45 → ✓ Allowed (100/100)
Request 101 at 10:00:50 → ✗ 429 Too Many Requests
                           Retry-After: 10

Headers in response:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1695412860   (Unix timestamp when limit resets)
```

### Authentication Methods

| Method | How It Works | Best For |
|--------|-------------|----------|
| **API Key** | Static key in header/query | Public APIs, simple auth |
| **JWT** | Signed token with claims | Stateless auth, microservices |
| **OAuth 2.0** | Third-party authorization | "Login with Google" |
| **mTLS** | Mutual certificate auth | Service-to-service |

---

## Idempotency in API Design

Idempotency ensures that making the **same request multiple times** produces the **same result**.

```
Idempotent (safe to retry):
GET  /users/123       → Always returns same user
PUT  /users/123       → Always sets user to same state
DELETE /users/123     → Always results in user being deleted

NOT Idempotent (dangerous to retry):
POST /orders          → Creates a new order EACH TIME!
POST /payments        → Charges payment EACH TIME!

Problem:
  Client sends POST /payments → Network timeout (did it succeed?)
  Client retries POST /payments → DOUBLE CHARGE! 😱
```

### Idempotency Key Pattern

```
Client generates a unique key for each operation:

POST /payments
Idempotency-Key: "abc-123-def-456"
{ "amount": 1000, "to": "merchant_xyz" }

Server checks:
1. Have I seen key "abc-123-def-456" before?
   - No → Process payment, store key + result
   - Yes → Return stored result (don't process again)

Client retries (same key):
POST /payments
Idempotency-Key: "abc-123-def-456"  ← Same key!
{ "amount": 1000, "to": "merchant_xyz" }

Server: "I've seen this key → return previous result"
→ No double charge! ✓
```

---

## Key Takeaways

1. **REST** is the standard for web APIs — use resource-based URLs, proper HTTP methods, and status codes
2. Follow REST best practices: **plural nouns, versioning, filtering/sorting, pagination, consistent error format**
3. Use **cursor-based pagination** for large datasets and infinite scroll; offset-based for traditional pages
4. **GraphQL** lets clients request exactly the data they need — great for mobile and complex data graphs
5. **gRPC** uses protobuf + HTTP/2 for high-performance service-to-service communication
6. Choose: **REST** for public APIs, **GraphQL** for flexible client queries, **gRPC** for internal microservices
7. An **API gateway** is the single entry point — handles routing, auth, rate limiting, and caching
8. **Idempotency keys** prevent double-processing on retries — critical for payments and order creation

---

## Practice Exercises

1. **REST API Design:**
   - Design the REST API for a blog platform (users, posts, comments, categories, likes).
   - Define the URLs, methods, request/response bodies, and status codes.
   - How would you handle: "Get the top 10 most liked posts in the 'technology' category from the last 7 days"?

2. **Pagination Choice:**
   - You're building an API for a social media feed. Should you use offset or cursor pagination?
   - The feed has millions of items, new items are added every second.
   - Design the pagination API.

3. **API Gateway Design:**
   - You have 5 microservices: Users, Products, Orders, Payments, Notifications.
   - Design the API gateway routing rules.
   - How would you handle authentication at the gateway level?

4. **Protocol Selection:**
   - You're building a system with: mobile app (client), API gateway, 5 microservices, real-time notifications.
   - Which protocol would you use for each communication path?
   - Mobile → Gateway: ?
   - Gateway → Services: ?
   - Services → Services: ?
   - Server → Mobile (notifications): ?

---

**Next:** [Phase 09 — Message Queues & Asynchronous Processing →](Phase-09-Message-Queues.md)
