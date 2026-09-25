# Phase 20 — Scaling & Advanced Patterns

## Table of Contents

- [Scaling Basics](#scaling-basics)
- [Vertical vs Horizontal Scaling](#vertical-vs-horizontal-scaling)
- [Node.js Cluster Module](#nodejs-cluster-module)
- [Load Balancing](#load-balancing)
- [Stateless Architecture](#stateless-architecture)
- [Database Scaling](#database-scaling)
- [Rate Limiting at Scale](#rate-limiting-at-scale)
- [Design Patterns for Backend](#design-patterns-for-backend)
- [Repository Pattern](#repository-pattern)
- [Service Layer Pattern](#service-layer-pattern)
- [Strategy Pattern](#strategy-pattern)
- [Observer Pattern (EventEmitter)](#observer-pattern-eventemitter)
- [Dependency Injection](#dependency-injection)
- [CQRS Pattern](#cqrs-pattern)
- [Advanced Project Structure](#advanced-project-structure)
- [Key Takeaways](#key-takeaways)

---

## Scaling Basics

```
Why scale?
├── More users → More requests → Server can't handle
├── Database becomes the bottleneck
├── Response times increase
├── Server crashes under load
└── Business growth demands reliability

Scaling Strategy:
1. Optimize code first (fix N+1 queries, add indexes, caching)
2. Scale vertically (bigger server)
3. Scale horizontally (more servers)
4. Distribute workload (queues, CDN, caching layers)
```

---

## Vertical vs Horizontal Scaling

```
VERTICAL SCALING (Scale Up):
┌──────────┐         ┌──────────────┐
│  2 CPU   │   →→→   │    8 CPU     │
│  4GB RAM │         │   32GB RAM   │
│  Server  │         │   Server     │
└──────────┘         └──────────────┘
Pros: Simple, no code changes
Cons: Has a ceiling, expensive, single point of failure

HORIZONTAL SCALING (Scale Out):
┌──────────┐         ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│  Server  │   →→→   │ Srv1 │ │ Srv2 │ │ Srv3 │ │ Srv4 │
└──────────┘         └──────┘ └──────┘ └──────┘ └──────┘
                         ↑ Load Balancer distributes traffic ↑
Pros: No ceiling, fault tolerant, cost effective
Cons: Requires stateless design, more complexity
```

---

## Node.js Cluster Module

Node.js is single-threaded. Clustering creates multiple worker processes to use all CPU cores.

```javascript
// cluster.js
const cluster = require("cluster");
const os = require("os");

if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    console.log(`Primary process ${process.pid} — forking ${numCPUs} workers`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Replace crashed workers
    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
        cluster.fork();
    });
} else {
    // Workers share the same port
    const app = require("./app");
    app.listen(3000, () => {
        console.log(`Worker ${process.pid} started`);
    });
}
```

```
Output:
Primary process 1234 — forking 4 workers
Worker 1235 started
Worker 1236 started
Worker 1237 started
Worker 1238 started

Each worker handles requests independently.
If Worker 1236 crashes → Primary forks a new worker immediately.
```

> **In practice, use PM2 instead of manual clustering.** PM2 handles this with `pm2 start app.js -i max`.

---

## Load Balancing

### Load Balancing Strategies

```
Round Robin:
Request 1 → Server A
Request 2 → Server B
Request 3 → Server C
Request 4 → Server A (cycle repeats)
Simple, even distribution

Least Connections:
Send to whichever server has fewest active connections.
Better when requests have varying processing times.

IP Hash:
Same client IP always goes to same server.
Useful when you need sticky sessions (not recommended for APIs).

Weighted:
Server A (8 CPU) gets 4x the traffic of Server B (2 CPU).
Based on server capacity.
```

### Nginx Load Balancer

```nginx
upstream api_servers {
    least_conn;
    server 10.0.0.1:3000 weight=3;  # More powerful server
    server 10.0.0.2:3000 weight=1;
    server 10.0.0.3:3000 weight=1;
    server 10.0.0.4:3000 backup;     # Only used if others are down
}

server {
    listen 80;
    location / {
        proxy_pass http://api_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Stateless Architecture

For horizontal scaling, your app **must be stateless** — no request depends on being handled by the same server.

```
STATEFUL (Cannot scale horizontally):
├── Sessions stored in server memory
├── File uploads saved to local disk
├── In-memory cache (node-cache)
└── If user hits different server → data is lost

STATELESS (Can scale horizontally):
├── Sessions in Redis (shared across servers)
├── Files in S3/cloud storage (accessible from anywhere)
├── Cache in Redis (shared)
├── JWTs for auth (no server-side session)
└── Any server can handle any request
```

### Making Your App Stateless

```javascript
// ❌ Stateful: In-memory session
const sessions = {}; // Lost if this server restarts

// ✅ Stateless: Redis session store
const session = require("express-session");
const RedisStore = require("connect-redis").default;

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// ❌ Stateful: Local file storage
app.post("/upload", upload.single("file"), (req, res) => {
    // File saved to ./uploads/ on ONE server
    res.json({ path: req.file.path });
});

// ✅ Stateless: Cloud storage
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
app.post("/upload", upload.single("file"), async (req, res) => {
    await s3.send(new PutObjectCommand({
        Bucket: "my-bucket",
        Key: `uploads/${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
    }));
    res.json({ url: `https://my-bucket.s3.amazonaws.com/uploads/...` });
});
```

---

## Database Scaling

### Read Replicas

```
Write operations → Primary DB
Read operations → Replica 1, Replica 2, Replica 3

Most apps are read-heavy (90% reads, 10% writes).
Replicas handle the read load.
```

### MongoDB Replica Set

```javascript
// Connection string with read preference
mongoose.connect("mongodb://primary:27017,replica1:27017,replica2:27017/myapp", {
    replicaSet: "rs0",
    readPreference: "secondaryPreferred", // Read from replicas when possible
});
```

### Database Sharding

```
Sharding = Split data across multiple databases

Shard 1: Users A-M
Shard 2: Users N-Z

Each shard holds a portion of the data.
Queries are routed to the correct shard.
```

### Connection Pooling

```javascript
// MongoDB — Mongoose pool
mongoose.connect(uri, {
    maxPoolSize: 50,      // Max 50 concurrent connections
    minPoolSize: 10,      // Keep 10 connections ready
});

// PostgreSQL — pg pool
const { Pool } = require("pg");
const pool = new Pool({
    max: 20,              // Max 20 connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
```

---

## Rate Limiting at Scale

### Redis-Based Rate Limiting

```javascript
// Works across multiple server instances
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");

const limiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/", limiter);
```

### Tiered Rate Limiting

```javascript
// Different limits for different endpoints
const authLimiter = rateLimit({
    store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
    windowMs: 15 * 60 * 1000,
    max: 5,          // Only 5 login attempts per 15 min
    message: "Too many login attempts. Try again later.",
});

const apiLimiter = rateLimit({
    store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
    windowMs: 60 * 1000,
    max: 60,         // 60 requests per minute
});

app.use("/api/auth/login", authLimiter);
app.use("/api/", apiLimiter);
```

---

## Design Patterns for Backend

---

## Repository Pattern

Abstracts database access — controllers don't know about database specifics.

```javascript
// repositories/userRepository.js
const User = require("../models/User");

class UserRepository {
    async findById(id) {
        return User.findById(id).select("-password").lean();
    }

    async findByEmail(email) {
        return User.findOne({ email }).lean();
    }

    async findAll(filter = {}, options = {}) {
        const { page = 1, limit = 10, sort = "-createdAt" } = options;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            User.countDocuments(filter),
        ]);

        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }

    async create(userData) {
        return User.create(userData);
    }

    async updateById(id, data) {
        return User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .select("-password")
            .lean();
    }

    async deleteById(id) {
        return User.findByIdAndDelete(id);
    }
}

module.exports = new UserRepository();
```

```javascript
// Usage in controller — no database code here
const userRepository = require("../repositories/userRepository");

const getUsers = async (req, res) => {
    const result = await userRepository.findAll(
        {},
        { page: req.query.page, limit: req.query.limit }
    );
    res.json({ success: true, ...result });
};
```

> **Benefit:** If you switch from MongoDB to PostgreSQL, you only change the repository — controllers don't change.

---

## Service Layer Pattern

Business logic lives in services, not controllers.

```javascript
// services/orderService.js
const orderRepository = require("../repositories/orderRepository");
const productRepository = require("../repositories/productRepository");
const emailQueue = require("../queues/emailQueue");

class OrderService {
    async createOrder(userId, items) {
        // 1. Validate products exist and have stock
        for (const item of items) {
            const product = await productRepository.findById(item.productId);
            if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for ${product.name}`, 400);
            }
        }

        // 2. Calculate total
        let total = 0;
        for (const item of items) {
            const product = await productRepository.findById(item.productId);
            total += product.price * item.quantity;
        }

        // 3. Create order
        const order = await orderRepository.create({
            userId,
            items,
            total,
            status: "pending",
        });

        // 4. Decrement stock
        for (const item of items) {
            await productRepository.decrementStock(item.productId, item.quantity);
        }

        // 5. Send confirmation email (async)
        await emailQueue.add("order-confirmation", { userId, orderId: order._id });

        return order;
    }

    async cancelOrder(orderId, userId) {
        const order = await orderRepository.findById(orderId);
        if (!order) throw new AppError("Order not found", 404);
        if (order.userId.toString() !== userId) throw new AppError("Unauthorized", 403);
        if (order.status !== "pending") throw new AppError("Cannot cancel this order", 400);

        // Restore stock
        for (const item of order.items) {
            await productRepository.incrementStock(item.productId, item.quantity);
        }

        return orderRepository.updateById(orderId, { status: "cancelled" });
    }
}

module.exports = new OrderService();
```

```javascript
// Controller is thin — just handles HTTP
const orderService = require("../services/orderService");

const createOrder = async (req, res) => {
    const order = await orderService.createOrder(req.user._id, req.body.items);
    res.status(201).json({ success: true, data: order });
};
```

```
Architecture layers:
Controller → Service → Repository → Database
     ↑           ↑          ↑
  HTTP logic  Business   Data access
              logic       logic
```

---

## Strategy Pattern

Choose different algorithms/behaviors at runtime.

```javascript
// strategies/paymentStrategies.js
class StripePayment {
    async process(amount, currency, paymentDetails) {
        // Stripe-specific logic
        const charge = await stripe.charges.create({
            amount: amount * 100,
            currency,
            source: paymentDetails.token,
        });
        return { provider: "stripe", transactionId: charge.id };
    }
}

class PayPalPayment {
    async process(amount, currency, paymentDetails) {
        // PayPal-specific logic
        const order = await paypal.createOrder({ amount, currency });
        return { provider: "paypal", transactionId: order.id };
    }
}

class RazorpayPayment {
    async process(amount, currency, paymentDetails) {
        // Razorpay-specific logic
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency,
        });
        return { provider: "razorpay", transactionId: order.id };
    }
}

// Factory to get strategy
const strategies = {
    stripe: new StripePayment(),
    paypal: new PayPalPayment(),
    razorpay: new RazorpayPayment(),
};

const getPaymentStrategy = (provider) => {
    const strategy = strategies[provider];
    if (!strategy) throw new Error(`Unknown payment provider: ${provider}`);
    return strategy;
};

module.exports = { getPaymentStrategy };
```

```javascript
// Usage
const { getPaymentStrategy } = require("../strategies/paymentStrategies");

const processPayment = async (req, res) => {
    const { provider, amount, currency, paymentDetails } = req.body;

    const strategy = getPaymentStrategy(provider);
    const result = await strategy.process(amount, currency, paymentDetails);

    res.json({ success: true, data: result });
};
```

---

## Observer Pattern (EventEmitter)

Decouple side effects from core business logic.

```javascript
// events/appEvents.js
const EventEmitter = require("events");

class AppEventEmitter extends EventEmitter {}

const appEvents = new AppEventEmitter();
module.exports = appEvents;
```

```javascript
// events/listeners/userListeners.js
const appEvents = require("../appEvents");
const emailQueue = require("../../queues/emailQueue");
const analyticsService = require("../../services/analyticsService");

// Register listeners
appEvents.on("user:registered", async (user) => {
    // Send welcome email
    await emailQueue.add("welcome-email", {
        to: user.email,
        name: user.name,
    });
});

appEvents.on("user:registered", async (user) => {
    // Track analytics
    await analyticsService.track("user_signup", {
        userId: user._id,
        source: user.source,
    });
});

appEvents.on("user:passwordReset", async (user, resetToken) => {
    await emailQueue.add("password-reset", {
        to: user.email,
        resetUrl: `https://myapp.com/reset/${resetToken}`,
    });
});
```

```javascript
// Usage in service — just emit events, don't handle side effects
const appEvents = require("../events/appEvents");

class UserService {
    async register(userData) {
        const user = await User.create(userData);

        // Emit event — listeners handle the rest
        appEvents.emit("user:registered", user);

        return user;
    }
}
```

---

## Dependency Injection

Pass dependencies instead of importing them directly — makes testing easier.

```javascript
// Without DI (hard to test)
const User = require("../models/User");
const emailService = require("../services/emailService");

class UserService {
    async register(data) {
        const user = await User.create(data);     // Hard-coded dependency
        await emailService.send(user.email);       // Hard-coded dependency
        return user;
    }
}

// With DI (easy to test)
class UserService {
    constructor({ userRepository, emailService }) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    async register(data) {
        const user = await this.userRepository.create(data);
        await this.emailService.send(user.email);
        return user;
    }
}

// Production
const userService = new UserService({
    userRepository: require("../repositories/userRepository"),
    emailService: require("../services/emailService"),
});

// Testing
const userService = new UserService({
    userRepository: { create: jest.fn().mockResolvedValue(mockUser) },
    emailService: { send: jest.fn().mockResolvedValue(true) },
});
```

---

## CQRS Pattern

Command Query Responsibility Segregation — separate read and write operations.

```
TRADITIONAL:
Same model for reading AND writing
User.find() ← Read
User.create() ← Write

CQRS:
Read Model (optimized for queries)         Write Model (optimized for commands)
├── Denormalized data                      ├── Normalized data
├── Pre-computed aggregations              ├── Validation rules
├── Fast queries                           ├── Business logic
└── Can use different database             └── Event sourcing

When to use:
├── Read and write patterns are very different
├── Read-heavy applications
├── Complex domain with many aggregations
└── Need to scale reads independently
```

```javascript
// Simple CQRS example

// Write side — handle commands
class OrderCommandService {
    async createOrder(data) {
        const order = await Order.create(data);
        // Publish event to update read model
        await eventBus.publish("order:created", order);
        return order;
    }
}

// Read side — optimized for queries
class OrderQueryService {
    async getOrderSummary(userId) {
        // Uses a pre-computed read model (denormalized)
        return OrderSummary.findOne({ userId }).lean();
    }

    async getDashboardStats() {
        // Uses pre-aggregated stats
        return DashboardStats.findOne({ date: today() }).lean();
    }
}

// Event handler — updates read models when write happens
eventBus.subscribe("order:created", async (order) => {
    // Update order summary for the user
    await OrderSummary.findOneAndUpdate(
        { userId: order.userId },
        { $inc: { totalOrders: 1, totalSpent: order.total } },
        { upsert: true }
    );
    // Update dashboard stats
    await DashboardStats.findOneAndUpdate(
        { date: today() },
        { $inc: { ordersToday: 1, revenueToday: order.total } },
        { upsert: true }
    );
});
```

---

## Advanced Project Structure

```
src/
├── config/
│   ├── index.js            ← Environment config
│   ├── database.js          ← DB connection
│   ├── redis.js             ← Redis connection
│   └── logger.js            ← Winston logger
│
├── api/
│   ├── v1/
│   │   ├── users/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.model.js
│   │   │   ├── user.routes.js
│   │   │   ├── user.validation.js
│   │   │   └── user.test.js
│   │   ├── orders/
│   │   │   ├── order.controller.js
│   │   │   ├── order.service.js
│   │   │   ├── order.repository.js
│   │   │   ├── order.model.js
│   │   │   ├── order.routes.js
│   │   │   └── order.validation.js
│   │   └── auth/
│   │       ├── auth.controller.js
│   │       ├── auth.service.js
│   │       └── auth.routes.js
│   └── v2/                  ← API versioning
│
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   ├── validate.js
│   └── cache.js
│
├── events/
│   ├── eventBus.js
│   └── listeners/
│       ├── userListeners.js
│       └── orderListeners.js
│
├── queues/
│   ├── emailQueue.js
│   └── imageQueue.js
│
├── workers/
│   ├── emailWorker.js
│   └── imageWorker.js
│
├── shared/
│   ├── errors/
│   │   └── AppError.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── ApiResponse.js
│   │   └── pagination.js
│   └── constants.js
│
├── app.js                    ← Express app setup
└── server.js                 ← Server entry point
```

> **Key principle:** Group by feature (users/, orders/), not by type. Each feature folder is self-contained with its own controller, service, repository, model, routes, and tests.

---

## Key Takeaways

1. **Optimize before scaling** — fix N+1 queries, add indexes, add caching first
2. **Scale horizontally** by making your app stateless (sessions in Redis, files in S3)
3. **Node.js clustering** or PM2 cluster mode uses all CPU cores
4. **Load balancers** distribute traffic across multiple servers
5. **Repository pattern** abstracts database access — easy to switch databases
6. **Service layer** holds business logic — controllers stay thin
7. **Strategy pattern** lets you swap algorithms (payment providers, notification channels)
8. **Observer pattern** (EventEmitter) decouples side effects from core logic
9. **Dependency injection** makes code testable by passing dependencies
10. **Group by feature** in project structure — not by type (controllers/, models/)

---

## Practice Exercises

1. **Clustering:** Implement Node.js clustering and verify all CPU cores are used
2. **Stateless app:** Move sessions to Redis, uploads to S3 (or local simulation)
3. **Repository pattern:** Refactor an Express app to use the repository pattern
4. **Service layer:** Extract business logic from controllers into service classes
5. **Event-driven:** Use EventEmitter to handle registration side effects
6. **Advanced structure:** Reorganize a project into feature-based folder structure

---

## Congratulations! 🎉

You've completed the entire **Backend Development Learning Guide**. You now have a solid understanding of:

- How the internet and HTTP work
- Node.js and Express.js fundamentals
- REST API design and implementation
- Databases (MongoDB, PostgreSQL)
- Authentication and authorization
- Security, testing, and error handling
- Caching, WebSockets, and background jobs
- Microservices, deployment, and scaling patterns

**Keep building, keep learning, and keep shipping!**

---

**Previous:** [← Phase 19 — Deployment & DevOps](Phase-19-Deployment-DevOps.md)

**Back to:** [README — Complete Roadmap](README.md)
