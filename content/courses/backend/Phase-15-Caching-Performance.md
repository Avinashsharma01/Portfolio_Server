# Phase 15 — Caching & Performance

## Table of Contents

- [Why Caching?](#why-caching)
- [Caching Strategies](#caching-strategies)
- [In-Memory Caching](#in-memory-caching)
- [Redis — Distributed Cache](#redis--distributed-cache)
- [HTTP Caching](#http-caching)
- [Database Query Optimization](#database-query-optimization)
- [Response Compression](#response-compression)
- [Performance Monitoring](#performance-monitoring)
- [Common Performance Patterns](#common-performance-patterns)
- [Key Takeaways](#key-takeaways)

---

## Why Caching?

```
WITHOUT CACHING:
Client → Server → Database → Compute Result → Response
Every request: ~200ms (database query = bottleneck)
1000 users asking same thing = 1000 DB queries

WITH CACHING:
First request:  Client → Server → Database → Cache → Response     (~200ms)
Next requests:  Client → Server → Cache → Response                  (~5ms)
1000 users asking same thing = 1 DB query + 999 cache hits
```

### When to Cache

| Cache ✅ | Don't Cache ❌ |
|----------|---------------|
| Data that rarely changes | User-specific real-time data |
| Expensive computations | Frequently mutated data |
| API responses from third parties | Security-sensitive data |
| Database query results | Data that MUST be fresh |
| Static configuration | One-time lookups |

---

## Caching Strategies

```
Cache-Aside (Lazy Loading):
1. Check cache
2. If miss → fetch from DB → store in cache → return
3. If hit → return from cache
Best for: Read-heavy workloads

Write-Through:
1. Write to cache AND database simultaneously
2. Read always from cache
Best for: Data that's read right after writing

Write-Behind (Write-Back):
1. Write to cache immediately
2. Asynchronously write to database later
Best for: High write throughput (risk of data loss)

Cache Invalidation:
├── Time-based (TTL): Data expires after X seconds
├── Event-based: Clear cache when data changes
└── Manual: Explicitly clear cache
```

---

## In-Memory Caching

### Using node-cache

```bash
npm install node-cache
```

```javascript
// cache/memoryCache.js
const NodeCache = require("node-cache");

// TTL = 300 seconds (5 min), check expired keys every 60s
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

module.exports = cache;
```

```javascript
// middleware/cacheMiddleware.js
const cache = require("../cache/memoryCache");

const cacheMiddleware = (ttl = 300) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET") return next();

        const key = req.originalUrl;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            console.log(`Cache HIT: ${key}`);
            return res.json(cachedResponse);
        }

        // Override res.json to cache the response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            cache.set(key, body, ttl);
            console.log(`Cache MISS: ${key} — cached for ${ttl}s`);
            return originalJson(body);
        };

        next();
    };
};

module.exports = cacheMiddleware;
```

```javascript
// Usage in routes
const cacheMiddleware = require("../middleware/cacheMiddleware");
const cache = require("../cache/memoryCache");

// Cache product list for 5 minutes
router.get("/", cacheMiddleware(300), productController.getAll);

// Cache single product for 10 minutes
router.get("/:id", cacheMiddleware(600), productController.getById);

// Invalidate cache when product is updated
router.put("/:id", async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Clear specific cache
    cache.del(`/api/products/${req.params.id}`);
    // Clear list cache too
    cache.del("/api/products");

    res.json({ success: true, data: product });
});
```

### Limitations of In-Memory Cache

```
In-memory cache limitations:
├── Lost on server restart
├── Not shared between multiple server instances
├── Limited by server RAM
├── Not suitable for distributed systems
└── Use Redis for production applications
```

---

## Redis — Distributed Cache

Redis is an in-memory data store used as cache, message broker, and more.

### Setup

```bash
npm install redis
```

```javascript
// config/redis.js
const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("Redis connected"));

const connectRedis = async () => {
    await redisClient.connect();
};

module.exports = { redisClient, connectRedis };
```

### Redis Basic Operations

```javascript
const { redisClient } = require("../config/redis");

// SET — Store a value
await redisClient.set("key", "value");
await redisClient.set("key", "value", { EX: 3600 }); // Expires in 1 hour

// GET — Retrieve a value
const value = await redisClient.get("key"); // "value" or null

// DEL — Delete a key
await redisClient.del("key");

// EXISTS — Check if key exists
const exists = await redisClient.exists("key"); // 1 or 0

// EXPIRE — Set TTL on existing key
await redisClient.expire("key", 600); // 10 minutes

// TTL — Check remaining time
const ttl = await redisClient.ttl("key"); // seconds remaining

// Store objects (must serialize)
await redisClient.set("user:1", JSON.stringify({ name: "Avinash", age: 25 }), { EX: 3600 });
const user = JSON.parse(await redisClient.get("user:1"));
```

### Redis Hash (for objects)

```javascript
// HSET — Store object fields
await redisClient.hSet("user:1", { name: "Avinash", email: "avi@test.com", role: "admin" });

// HGET — Get one field
const name = await redisClient.hGet("user:1", "name"); // "Avinash"

// HGETALL — Get all fields
const user = await redisClient.hGetAll("user:1");
// { name: "Avinash", email: "avi@test.com", role: "admin" }

// HDEL — Delete a field
await redisClient.hDel("user:1", "role");
```

### Redis Cache Middleware

```javascript
// middleware/redisCacheMiddleware.js
const { redisClient } = require("../config/redis");

const redisCache = (ttl = 300) => {
    return async (req, res, next) => {
        if (req.method !== "GET") return next();

        const key = `cache:${req.originalUrl}`;

        try {
            const cached = await redisClient.get(key);
            if (cached) {
                console.log(`Redis Cache HIT: ${key}`);
                return res.json(JSON.parse(cached));
            }
        } catch (err) {
            console.error("Redis cache error:", err);
            // If Redis fails, continue without cache
        }

        const originalJson = res.json.bind(res);
        res.json = async (body) => {
            try {
                await redisClient.set(key, JSON.stringify(body), { EX: ttl });
                console.log(`Redis Cache MISS: ${key} — cached for ${ttl}s`);
            } catch (err) {
                console.error("Redis set error:", err);
            }
            return originalJson(body);
        };

        next();
    };
};

module.exports = redisCache;
```

### Cache Invalidation Helper

```javascript
// utils/cacheInvalidator.js
const { redisClient } = require("../config/redis");

const invalidateCache = async (patterns) => {
    for (const pattern of patterns) {
        // Use SCAN to find matching keys (safe for production)
        let cursor = 0;
        do {
            const result = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
            cursor = result.cursor;
            if (result.keys.length > 0) {
                await redisClient.del(result.keys);
            }
        } while (cursor !== 0);
    }
};

module.exports = invalidateCache;
```

```javascript
// Usage in controller
const invalidateCache = require("../utils/cacheInvalidator");

const updateProduct = async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Invalidate related caches
    await invalidateCache([
        `cache:/api/products/${req.params.id}`,
        "cache:/api/products*",
    ]);

    res.json({ success: true, data: product });
};
```

---

## HTTP Caching

### Cache-Control Headers

```javascript
// Static assets — cache for 1 year
app.use("/static", express.static("public", {
    maxAge: "365d",
    immutable: true,
}));

// API response — cache for 5 minutes
app.get("/api/products", (req, res) => {
    res.set("Cache-Control", "public, max-age=300");
    res.json(products);
});

// Private data — don't cache publicly
app.get("/api/profile", auth, (req, res) => {
    res.set("Cache-Control", "private, no-cache");
    res.json(user);
});

// Never cache
app.get("/api/realtime-data", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json(data);
});
```

### ETag for Conditional Requests

```javascript
const crypto = require("crypto");

app.get("/api/products/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);

    // Generate ETag from content
    const etag = crypto.createHash("md5").update(JSON.stringify(product)).digest("hex");

    // Check if client has current version
    if (req.headers["if-none-match"] === etag) {
        return res.status(304).end(); // Not Modified
    }

    res.set("ETag", etag);
    res.json(product);
});
```

---

## Database Query Optimization

### Indexes

```javascript
// MongoDB — Create indexes for frequently queried fields
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, index: true },
    username: { type: String, index: true },
    createdAt: { type: Date, default: Date.now },
});

// Compound index
userSchema.index({ role: 1, createdAt: -1 });

// Text index for search
userSchema.index({ name: "text", bio: "text" });
```

### Select Only Needed Fields

```javascript
// BAD: Returns all fields
const users = await User.find();

// GOOD: Return only what's needed
const users = await User.find().select("name email role");

// Exclude large fields
const users = await User.find().select("-password -refreshToken -__v");
```

### Lean Queries

```javascript
// Regular query: Returns full Mongoose documents (with methods, change tracking)
const users = await User.find(); // Heavy objects

// Lean query: Returns plain JavaScript objects (much faster)
const users = await User.find().lean(); // ~3x faster for read-only
```

### Populate Only What's Needed

```javascript
// BAD: Populate everything
const post = await Post.find().populate("author");

// GOOD: Select specific fields from populated doc
const post = await Post.find().populate("author", "name avatar");
```

### Pagination

```javascript
// Always paginate large collections
const page = parseInt(req.query.page) || 1;
const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Cap at 100
const skip = (page - 1) * limit;

const [data, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
]);
```

---

## Response Compression

```bash
npm install compression
```

```javascript
const compression = require("compression");

// Compress all responses > 1KB
app.use(compression({
    level: 6,             // Compression level (1-9, 6 is default)
    threshold: 1024,      // Only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers["x-no-compression"]) {
            return false;
        }
        return compression.filter(req, res);
    },
}));
```

```
Before compression:  200KB JSON response
After compression:   ~30KB (85% reduction)
```

---

## Performance Monitoring

### Request Duration Logging

```javascript
// middleware/responseTime.js
const responseTime = (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;

        const status = res.statusCode;
        const method = req.method;
        const url = req.originalUrl;

        // Log slow requests
        if (durationMs > 1000) {
            console.warn(`⚠️ SLOW REQUEST: ${method} ${url} — ${durationMs.toFixed(2)}ms [${status}]`);
        }
    });

    next();
};
```

### Memory Monitoring

```javascript
app.get("/api/health", (req, res) => {
    const memoryUsage = process.memoryUsage();

    res.json({
        status: "ok",
        uptime: process.uptime(),
        memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        },
        timestamp: new Date().toISOString(),
    });
});
```

---

## Common Performance Patterns

### 1. Batch Operations

```javascript
// BAD: Insert one by one (N database calls)
for (const item of items) {
    await Product.create(item);
}

// GOOD: Insert all at once (1 database call)
await Product.insertMany(items);
```

### 2. Parallel Queries

```javascript
// BAD: Sequential (300ms + 200ms + 100ms = 600ms)
const users = await User.find();
const products = await Product.find();
const orders = await Order.find();

// GOOD: Parallel (max(300, 200, 100) = 300ms)
const [users, products, orders] = await Promise.all([
    User.find().lean(),
    Product.find().lean(),
    Order.find().lean(),
]);
```

### 3. Connection Pooling

```javascript
// MongoDB — Mongoose handles pooling automatically
mongoose.connect(uri, {
    maxPoolSize: 10,       // Max concurrent connections (default: 100)
    minPoolSize: 2,        // Keep at least 2 connections ready
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
});
```

### 4. Avoid N+1 Queries

```javascript
// BAD: N+1 problem (1 query for posts + N queries for authors)
const posts = await Post.find();
for (const post of posts) {
    post.author = await User.findById(post.authorId);
}

// GOOD: Use populate (2 queries total)
const posts = await Post.find().populate("author", "name avatar");
```

---

## Key Takeaways

1. **Cache read-heavy, rarely-changing data** — don't cache everything blindly
2. **In-memory cache (node-cache)** for single-server, **Redis** for distributed
3. **Always set TTL** on cached data to prevent stale responses
4. **Invalidate cache on writes** — stale data is worse than no cache
5. **Use database indexes** on frequently queried fields
6. **Select only needed fields** and use `.lean()` for read-only queries
7. **Always paginate** large collections — never return unbounded results
8. **Use Promise.all** for independent async operations
9. **Compress responses** with the `compression` middleware
10. **Monitor performance** — log slow requests, track memory usage

---

## Practice Exercises

1. **In-memory cache:** Add caching middleware to an existing Express API
2. **Redis setup:** Install Redis, connect from Node.js, implement cache-aside pattern
3. **Cache invalidation:** Invalidate product cache when product is created/updated/deleted
4. **Database optimization:** Add indexes, use lean queries, implement pagination
5. **Performance audit:** Find and fix N+1 queries in an existing codebase
6. **Health endpoint:** Create `/health` with uptime, memory, and response time stats

---

**Previous:** [← Phase 14 — Testing Backend](Phase-14-Testing-Backend.md)

**Next:** [Phase 16 — WebSockets & Real-Time →](Phase-16-WebSockets-Realtime.md)
