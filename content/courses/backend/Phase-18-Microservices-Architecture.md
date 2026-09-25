# Phase 18 — Microservices Architecture

## Table of Contents

- [Monolith vs Microservices](#monolith-vs-microservices)
- [When to Use Microservices](#when-to-use-microservices)
- [Microservice Design Principles](#microservice-design-principles)
- [Inter-Service Communication](#inter-service-communication)
- [API Gateway](#api-gateway)
- [Service Discovery](#service-discovery)
- [Event-Driven Architecture](#event-driven-architecture)
- [Data Management in Microservices](#data-management-in-microservices)
- [Building a Microservice with Express](#building-a-microservice-with-express)
- [Docker & Microservices](#docker--microservices)
- [Common Patterns](#common-patterns)
- [Challenges & Solutions](#challenges--solutions)
- [Key Takeaways](#key-takeaways)

---

## Monolith vs Microservices

### Monolithic Architecture

```
┌───────────────────────────────────────┐
│            MONOLITH SERVER            │
│                                       │
│  ┌─────────┐ ┌──────┐ ┌───────────┐  │
│  │  Users   │ │Orders│ │  Products │  │
│  │ Service  │ │  Svc │ │  Service  │  │
│  └────┬─────┘ └──┬───┘ └─────┬─────┘  │
│       │          │            │        │
│  ┌────┴──────────┴────────────┴─────┐  │
│  │        SHARED DATABASE           │  │
│  └──────────────────────────────────┘  │
└───────────────────────────────────────┘
One codebase, one deployment, one database
```

### Microservices Architecture

```
┌──────────┐   ┌──────────┐   ┌──────────┐
│  User    │   │  Order   │   │ Product  │
│ Service  │   │ Service  │   │ Service  │
│ (Port    │   │ (Port    │   │ (Port    │
│  3001)   │   │  3002)   │   │  3003)   │
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │
┌────┴────┐   ┌────┴────┐   ┌────┴────┐
│ Users   │   │ Orders  │   │Products │
│   DB    │   │   DB    │   │   DB    │
└─────────┘   └─────────┘   └─────────┘
Separate codebases, separate deployments, separate databases
```

### Comparison

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| **Deployment** | Deploy entire app | Deploy services independently |
| **Scaling** | Scale entire app | Scale specific services |
| **Tech Stack** | One language/framework | Different per service |
| **Database** | Shared database | Database per service |
| **Team** | One team, one codebase | Small autonomous teams |
| **Complexity** | Simple initially | Distributed system complexity |
| **Debugging** | Easy (single process) | Hard (distributed tracing) |
| **Failure** | Whole app goes down | Only one service goes down |
| **Best for** | Small-mid projects, MVPs | Large, complex, scaling apps |

---

## When to Use Microservices

```
Use Monolith when:
├── Starting a new project / MVP
├── Small team (< 5 developers)
├── Simple domain
├── Don't need independent scaling
└── You want fast development

Use Microservices when:
├── Large, complex application
├── Multiple independent teams
├── Need to scale parts independently
├── Different parts need different tech stacks
├── High availability requirements
└── The monolith has become unmanageable

Common Mistake:
"Start with microservices" → Overengineering for small projects
Better approach: Start monolith → Break out services when needed
```

---

## Microservice Design Principles

### 1. Single Responsibility

Each service owns one business domain.

```
✅ Good:               ❌ Bad:
User Service           User & Order Service
├── Register           ├── Register
├── Login              ├── Login
├── Update Profile     ├── Create Order
└── Delete Account     ├── Track Order
                       └── Update Profile
```

### 2. Database Per Service

```
✅ Good:
User Service → User DB (MongoDB)
Order Service → Order DB (PostgreSQL)
Product Service → Product DB (MongoDB)

❌ Bad:
User Service ──→
Order Service ──→ SHARED DATABASE
Product Service ──→

Why? Shared DB creates tight coupling.
Changing one table could break another service.
```

### 3. API First

Define clear interfaces between services.

```
User Service API:
GET    /users/:id        → Get user by ID
POST   /users            → Create user
PUT    /users/:id        → Update user
DELETE /users/:id        → Delete user

This is the ONLY way other services interact with User data.
```

### 4. Independently Deployable

```
Deploy User Service v2.1 ← Only this changes
Order Service v1.3       ← Not affected
Product Service v3.0     ← Not affected
```

---

## Inter-Service Communication

### Synchronous (HTTP/REST)

```javascript
// Order Service calls User Service via HTTP
const axios = require("axios");

const getUserById = async (userId) => {
    try {
        const response = await axios.get(
            `${process.env.USER_SERVICE_URL}/users/${userId}`,
            { timeout: 5000 }
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error("User not found");
        }
        throw new Error("User service unavailable");
    }
};

// Usage in order controller
const createOrder = async (req, res) => {
    // Verify user exists (call User Service)
    const user = await getUserById(req.body.userId);

    // Create order
    const order = await Order.create({
        userId: user._id,
        items: req.body.items,
        total: req.body.total,
    });

    res.status(201).json({ success: true, data: order });
};
```

### Asynchronous (Message Queue)

```javascript
// Order Service publishes event
const { redisClient } = require("../config/redis");

const createOrder = async (req, res) => {
    const order = await Order.create(req.body);

    // Publish event (don't wait for other services)
    await redisClient.publish("order:created", JSON.stringify({
        orderId: order._id,
        userId: order.userId,
        total: order.total,
        items: order.items,
    }));

    res.status(201).json({ success: true, data: order });
};

// Notification Service subscribes to event
const subscriber = redisClient.duplicate();
await subscriber.connect();

await subscriber.subscribe("order:created", (message) => {
    const order = JSON.parse(message);
    // Send email, push notification, etc.
    sendOrderConfirmation(order.userId, order.orderId);
});
```

### Sync vs Async Communication

```
Synchronous (HTTP):
├── Request/Response pattern
├── Simple to implement
├── Creates coupling (caller waits)
├── If called service is down → caller fails
└── Use for: queries, real-time needed data

Asynchronous (Events/Messages):
├── Fire and forget
├── Services are decoupled
├── If consumer is down → messages queue up
├── Eventually consistent
└── Use for: notifications, data sync, side effects
```

---

## API Gateway

The API Gateway is the single entry point for all clients.

```
WITHOUT GATEWAY:
Client → User Service    (port 3001)
Client → Order Service   (port 3002)
Client → Product Service (port 3003)
Problem: Client knows about every service, CORS issues, no centralized auth

WITH GATEWAY:
                    ┌──→ User Service
Client → API       │
         Gateway ───┼──→ Order Service
         (3000)     │
                    └──→ Product Service
Gateway handles: routing, auth, rate limiting, logging
```

### Simple API Gateway with Express

```javascript
// gateway/server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");

const app = express();

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Auth middleware (verify JWT before proxying)
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
};

// Route to services
app.use("/api/users", createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: { "^/api/users": "/users" },
}));

app.use("/api/orders", authenticate, createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL || "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: { "^/api/orders": "/orders" },
}));

app.use("/api/products", createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL || "http://localhost:3003",
    changeOrigin: true,
    pathRewrite: { "^/api/products": "/products" },
}));

app.listen(3000, () => console.log("API Gateway on port 3000"));
```

---

## Service Discovery

How do services find each other?

```
Static Configuration (Simple):
USER_SERVICE_URL=http://user-service:3001
ORDER_SERVICE_URL=http://order-service:3002

Docker Compose DNS (Common):
Services use container names as hostnames

Consul / etcd (Advanced):
├── Services register themselves
├── Other services query the registry
└── Handles dynamic scaling
```

---

## Event-Driven Architecture

### Event Bus Pattern

```javascript
// shared/eventBus.js
const { createClient } = require("redis");

class EventBus {
    constructor() {
        this.publisher = createClient({ url: process.env.REDIS_URL });
        this.subscriber = createClient({ url: process.env.REDIS_URL });
    }

    async connect() {
        await this.publisher.connect();
        await this.subscriber.connect();
    }

    async publish(event, data) {
        await this.publisher.publish(event, JSON.stringify({
            event,
            data,
            timestamp: new Date().toISOString(),
            source: process.env.SERVICE_NAME,
        }));
    }

    async subscribe(event, handler) {
        await this.subscriber.subscribe(event, (message) => {
            const parsed = JSON.parse(message);
            handler(parsed.data, parsed);
        });
    }
}

module.exports = new EventBus();
```

### Event Flow Example

```
User registers:
1. User Service → publishes "user:created"
2. Email Service ← subscribes → sends welcome email
3. Analytics Service ← subscribes → tracks signup metric
4. Notification Service ← subscribes → sends push notification

Order created:
1. Order Service → publishes "order:created"
2. Inventory Service ← subscribes → decrements stock
3. Payment Service ← subscribes → processes payment
4. Email Service ← subscribes → sends order confirmation
```

---

## Data Management in Microservices

### The Challenge

```
Monolith: JOIN users WITH orders → Easy!
Microservices: User data in Service A, Order data in Service B → Can't JOIN!
```

### Solutions

**1. API Composition**

```javascript
// API Gateway or BFF aggregates data from multiple services
const getOrderWithUser = async (orderId) => {
    // Call Order Service
    const order = await axios.get(`${ORDER_URL}/orders/${orderId}`);

    // Call User Service
    const user = await axios.get(`${USER_URL}/users/${order.data.userId}`);

    return {
        ...order.data,
        user: user.data,
    };
};
```

**2. Data Duplication (Denormalization)**

```javascript
// Order Service stores a copy of essential user data
const orderSchema = new mongoose.Schema({
    userId: String,
    userName: String,      // Duplicated from User Service
    userEmail: String,     // Duplicated from User Service
    items: [{ name: String, price: Number, quantity: Number }],
    total: Number,
});

// Keep in sync via events
eventBus.subscribe("user:updated", async (userData) => {
    await Order.updateMany(
        { userId: userData._id },
        { userName: userData.name, userEmail: userData.email }
    );
});
```

**3. Saga Pattern (Distributed Transactions)**

```
Order Saga — multi-step transaction across services:

Step 1: Order Service → Create order (pending)
Step 2: Payment Service → Charge payment
Step 3: Inventory Service → Reserve items
Step 4: Order Service → Confirm order (completed)

If Step 3 fails:
← Payment Service → Refund payment (compensating action)
← Order Service → Cancel order (compensating action)
```

---

## Building a Microservice with Express

### Service Template

```
user-service/
├── src/
│   ├── controllers/
│   │   └── userController.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── userRoutes.js
│   ├── services/
│   │   └── userService.js
│   ├── events/
│   │   ├── publishers.js
│   │   └── subscribers.js
│   └── app.js
├── Dockerfile
├── package.json
└── .env
```

```javascript
// user-service/src/app.js
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const eventBus = require("./events/eventBus");

const app = express();
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.json({
        service: "user-service",
        status: "ok",
        uptime: process.uptime(),
    });
});

app.use("/users", userRoutes);

const start = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await eventBus.connect();

    // Subscribe to events from other services
    await eventBus.subscribe("order:created", async (data) => {
        console.log(`User ${data.userId} created order ${data.orderId}`);
        // Update user's order count, last order date, etc.
    });

    app.listen(process.env.PORT || 3001, () => {
        console.log(`User Service running on port ${process.env.PORT || 3001}`);
    });
};

start();
```

---

## Docker & Microservices

### Docker Compose for Local Development

```yaml
# docker-compose.yml
version: "3.8"

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - USER_SERVICE_URL=http://user-service:3001
      - ORDER_SERVICE_URL=http://order-service:3002
      - PRODUCT_SERVICE_URL=http://product-service:3003
    depends_on:
      - user-service
      - order-service
      - product-service

  user-service:
    build: ./user-service
    ports:
      - "3001:3001"
    environment:
      - MONGO_URI=mongodb://mongo-users:27017/users
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo-users
      - redis

  order-service:
    build: ./order-service
    ports:
      - "3002:3002"
    environment:
      - MONGO_URI=mongodb://mongo-orders:27017/orders
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo-orders
      - redis

  product-service:
    build: ./product-service
    ports:
      - "3003:3003"
    environment:
      - MONGO_URI=mongodb://mongo-products:27017/products
    depends_on:
      - mongo-products

  mongo-users:
    image: mongo:7
    volumes:
      - mongo-users-data:/data/db

  mongo-orders:
    image: mongo:7
    volumes:
      - mongo-orders-data:/data/db

  mongo-products:
    image: mongo:7
    volumes:
      - mongo-products-data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo-users-data:
  mongo-orders-data:
  mongo-products-data:
```

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f user-service

# Scale a service
docker-compose up -d --scale order-service=3
```

---

## Common Patterns

### Circuit Breaker

Prevents cascading failures when a service is down.

```javascript
class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 30000;
        this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.lastFailureTime = null;
    }

    async execute(fn) {
        if (this.state === "OPEN") {
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                this.state = "HALF_OPEN";
            } else {
                throw new Error("Circuit breaker is OPEN — service unavailable");
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        this.state = "CLOSED";
    }

    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.failureThreshold) {
            this.state = "OPEN";
            console.warn("Circuit breaker OPENED — too many failures");
        }
    }
}

// Usage
const userServiceBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 10000 });

const getUser = async (userId) => {
    return userServiceBreaker.execute(async () => {
        const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}`, { timeout: 3000 });
        return response.data;
    });
};
```

### Health Checks

```javascript
// Every service exposes /health
app.get("/health", async (req, res) => {
    const checks = {
        service: process.env.SERVICE_NAME,
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        dependencies: {},
    };

    // Check database
    try {
        await mongoose.connection.db.admin().ping();
        checks.dependencies.database = "ok";
    } catch {
        checks.dependencies.database = "error";
        checks.status = "degraded";
    }

    // Check Redis
    try {
        await redisClient.ping();
        checks.dependencies.redis = "ok";
    } catch {
        checks.dependencies.redis = "error";
        checks.status = "degraded";
    }

    const statusCode = checks.status === "ok" ? 200 : 503;
    res.status(statusCode).json(checks);
});
```

---

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **Data consistency** | Saga pattern, eventual consistency, events |
| **Service communication** | HTTP for queries, events for side effects |
| **Debugging across services** | Distributed tracing (correlation IDs) |
| **Testing** | Contract testing, integration tests per service |
| **Deployment complexity** | Docker Compose (dev), Kubernetes (prod) |
| **Network failures** | Circuit breaker, retries, timeouts |
| **Service discovery** | Docker DNS, Consul, environment variables |
| **Monitoring** | Centralized logging, health checks, metrics |

---

## Key Takeaways

1. **Start with a monolith** — only break into microservices when you have a reason
2. **Each service owns its data** — no shared databases
3. **Use HTTP for synchronous queries**, events for asynchronous side effects
4. **API Gateway** is the single entry point — handles auth, routing, rate limiting
5. **Events decouple services** — services don't need to know about each other
6. **Circuit breakers** prevent cascading failures
7. **Health checks** let you monitor service status
8. **Docker Compose** makes local microservice development manageable
9. **Sagas handle distributed transactions** — with compensating actions for rollback
10. **Microservices trade simplicity for scalability** — understand the tradeoffs

---

## Practice Exercises

1. **Split a monolith:** Take a monolithic Express app and extract one service
2. **Service communication:** Build two services that communicate via HTTP and events
3. **API Gateway:** Create a gateway that routes requests to multiple services
4. **Event bus:** Implement pub/sub communication with Redis
5. **Circuit breaker:** Add circuit breaker for inter-service HTTP calls
6. **Docker Compose:** Containerize 3 services + databases and run them together

---

**Previous:** [← Phase 17 — Task Queues & Background Jobs](Phase-17-Task-Queues-Background-Jobs.md)

**Next:** [Phase 19 — Deployment & DevOps →](Phase-19-Deployment-DevOps.md)
