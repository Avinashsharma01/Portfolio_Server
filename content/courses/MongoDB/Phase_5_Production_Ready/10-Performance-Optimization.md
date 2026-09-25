# Phase 5: Performance Optimization

## 📖 Table of Contents

1. [Indexing Strategies](#indexing-strategies)
2. [Query Optimization](#query-optimization)
3. [Connection Management](#connection-management)
4. [Caching Strategies](#caching-strategies)
5. [Memory Management](#memory-management)
6. [Monitoring and Profiling](#monitoring-and-profiling)

## Indexing Strategies

### Understanding Indexes

```javascript
// Basic index creation
const userSchema = new mongoose.Schema({
    email: { type: String, index: true },
    username: { type: String, unique: true },
    firstName: String,
    lastName: String,
    age: Number,
    location: {
        type: { type: String, enum: ["Point"] },
        coordinates: [Number],
    },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
});

// Index types and creation
userSchema.index({ email: 1 }); // Ascending single field
userSchema.index({ lastName: 1, firstName: 1 }); // Compound index
userSchema.index({ username: 1 }, { unique: true }); // Unique index
userSchema.index({ tags: 1 }); // Array index
userSchema.index({ location: "2dsphere" }); // Geospatial index
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // TTL index
userSchema.index({ firstName: "text", lastName: "text" }); // Text index
```

### Compound Index Optimization

```javascript
const orderSchema = new mongoose.Schema({
    customerId: mongoose.Schema.Types.ObjectId,
    status: String,
    orderDate: Date,
    amount: Number,
    shippingAddress: {
        city: String,
        state: String,
        country: String,
    },
});

// Optimized compound indexes for common queries
orderSchema.index({ customerId: 1, status: 1, orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ "shippingAddress.country": 1, "shippingAddress.state": 1 });

// Query patterns that benefit from these indexes:

// 1. Customer's orders by status
const customerOrders = await Order.find({
    customerId: userId,
    status: "shipped",
}).sort({ orderDate: -1 });

// 2. Recent orders by status
const recentOrders = await Order.find({
    status: "pending",
})
    .sort({ orderDate: -1 })
    .limit(10);

// 3. Orders by location
const locationOrders = await Order.find({
    "shippingAddress.country": "US",
    "shippingAddress.state": "CA",
});
```

### Index Performance Analysis

```javascript
// Analyze query performance
const analyzeQuery = async (model, query, options = {}) => {
    console.log("Query:", JSON.stringify(query));
    console.log("Options:", JSON.stringify(options));

    // Get execution stats
    const explain = await model
        .find(query, null, options)
        .explain("executionStats");

    console.log("Execution Stats:");
    console.log(
        "- Documents examined:",
        explain.executionStats.totalDocsExamined
    );
    console.log(
        "- Documents returned:",
        explain.executionStats.totalDocsReturned
    );
    console.log(
        "- Execution time:",
        explain.executionStats.executionTimeMillis + "ms"
    );
    console.log(
        "- Index used:",
        explain.executionStats.executionStages.indexName || "COLLSCAN"
    );

    // Calculate efficiency
    const efficiency =
        explain.executionStats.totalDocsReturned /
        explain.executionStats.totalDocsExamined;
    console.log("- Query efficiency:", (efficiency * 100).toFixed(2) + "%");

    return explain;
};

// Usage example
await analyzeQuery(User, { age: { $gte: 18, $lte: 65 } });
```

### Partial and Sparse Indexes

```javascript
const userSchema = new mongoose.Schema({
    email: String,
    socialSecurityNumber: String,
    isActive: Boolean,
    deletedAt: Date,
});

// Partial index - only index documents that match condition
userSchema.index(
    { email: 1 },
    {
        partialFilterExpression: { isActive: true },
        name: "active_users_email",
    }
);

// Sparse index - only index documents that have the field
userSchema.index(
    { socialSecurityNumber: 1 },
    {
        sparse: true,
        unique: true,
        name: "sparse_ssn",
    }
);

// TTL index for soft deletes
userSchema.index(
    { deletedAt: 1 },
    {
        expireAfterSeconds: 2592000, // 30 days
        partialFilterExpression: { deletedAt: { $exists: true } },
    }
);
```

## Query Optimization

### Efficient Query Patterns

```javascript
// Bad: Multiple separate queries
const getUserWithPosts = async (userId) => {
    const user = await User.findById(userId);
    const posts = await Post.find({ author: userId });
    return { user, posts };
};

// Good: Use population
const getUserWithPosts = async (userId) => {
    return await User.findById(userId).populate("posts");
};

// Better: Use aggregation for complex data
const getUserWithStats = async (userId) => {
    return await User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "author",
                as: "posts",
            },
        },
        {
            $addFields: {
                postCount: { $size: "$posts" },
                avgPostLength: { $avg: "$posts.content.length" },
            },
        },
    ]);
};
```

### Pagination Optimization

```javascript
// Bad: Skip/limit pagination (slow for large offsets)
const getPosts = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return await Post.find().skip(skip).limit(limit).sort({ createdAt: -1 });
};

// Good: Cursor-based pagination
const getPostsCursor = async (lastId = null, limit = 10) => {
    const query = lastId ? { _id: { $lt: lastId } } : {};

    return await Post.find(query).limit(limit).sort({ _id: -1 });
};

// Advanced: Range-based pagination with compound cursor
const getPostsAdvanced = async (
    lastCreatedAt = null,
    lastId = null,
    limit = 10
) => {
    let query = {};

    if (lastCreatedAt && lastId) {
        query = {
            $or: [
                { createdAt: { $lt: lastCreatedAt } },
                {
                    createdAt: lastCreatedAt,
                    _id: { $lt: lastId },
                },
            ],
        };
    }

    return await Post.find(query).limit(limit).sort({ createdAt: -1, _id: -1 });
};
```

### Projection Optimization

```javascript
// Bad: Return all fields
const getUsers = async () => {
    return await User.find();
};

// Good: Project only needed fields
const getUserList = async () => {
    return await User.find({}, "firstName lastName email");
};

// Advanced: Dynamic projections
const getUsersWithProjection = async (fields = []) => {
    const projection =
        fields.length > 0 ? fields.join(" ") : "firstName lastName email";

    return await User.find({}, projection);
};

// Exclude sensitive fields
const getPublicUserProfile = async (userId) => {
    return await User.findById(userId, "-password -socialSecurityNumber -__v");
};
```

### Aggregation Pipeline Optimization

```javascript
// Optimized aggregation pipeline
const getOrderAnalytics = async (startDate, endDate) => {
    return await Order.aggregate([
        // Match first (uses index)
        {
            $match: {
                orderDate: { $gte: startDate, $lte: endDate },
                status: { $in: ["completed", "shipped"] },
            },
        },

        // Limit early in pipeline
        { $limit: 10000 },

        // Project to reduce document size
        {
            $project: {
                customerId: 1,
                amount: 1,
                orderDate: 1,
                "items.productId": 1,
                "items.quantity": 1,
            },
        },

        // Group and calculate
        {
            $group: {
                _id: "$customerId",
                totalAmount: { $sum: "$amount" },
                orderCount: { $sum: 1 },
                avgOrderValue: { $avg: "$amount" },
                firstOrder: { $min: "$orderDate" },
                lastOrder: { $max: "$orderDate" },
            },
        },

        // Sort after grouping
        { $sort: { totalAmount: -1 } },

        // Final limit
        { $limit: 100 },
    ]);
};
```

## Connection Management

### Connection Pool Optimization

```javascript
// Optimized connection configuration
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Connection pool settings
            maxPoolSize: 10, // Maximum connections in pool
            minPoolSize: 5, // Minimum connections in pool
            maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
            serverSelectionTimeoutMS: 5000, // How long to try selecting a server
            socketTimeoutMS: 45000, // How long to wait for a response
            family: 4, // Use IPv4, skip trying IPv6

            // Buffering settings
            bufferMaxEntries: 0, // Disable buffering
            bufferCommands: false, // Disable command buffering

            // Read/Write concerns
            readPreference: "primary",
            readConcern: { level: "local" },
            writeConcern: { w: "majority", j: true, wtimeout: 30000 },
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Monitor connection events
        mongoose.connection.on("connected", () => {
            console.log("Mongoose connected to MongoDB");
        });

        mongoose.connection.on("error", (err) => {
            console.error("Mongoose connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("Mongoose disconnected");
        });

        // Graceful shutdown
        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            process.exit(0);
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

### Multiple Database Connections

```javascript
const mongoose = require("mongoose");

// Primary database for main application data
const primaryDB = mongoose.createConnection(process.env.PRIMARY_MONGODB_URI, {
    maxPoolSize: 20,
    minPoolSize: 5,
});

// Analytics database for reporting and analytics
const analyticsDB = mongoose.createConnection(
    process.env.ANALYTICS_MONGODB_URI,
    {
        maxPoolSize: 5,
        minPoolSize: 2,
        readPreference: "secondary", // Read from secondary for analytics
    }
);

// Session store database
const sessionDB = mongoose.createConnection(process.env.SESSION_MONGODB_URI, {
    maxPoolSize: 3,
    minPoolSize: 1,
});

// Models on different connections
const User = primaryDB.model("User", userSchema);
const Order = primaryDB.model("Order", orderSchema);
const Analytics = analyticsDB.model("Analytics", analyticsSchema);
const Session = sessionDB.model("Session", sessionSchema);

module.exports = {
    primaryDB,
    analyticsDB,
    sessionDB,
    User,
    Order,
    Analytics,
    Session,
};
```

## Caching Strategies

### Query Result Caching

```javascript
const Redis = require("redis");
const redis = Redis.createClient();

// Cache wrapper for Mongoose queries
const cacheQuery = (duration = 300) => {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;

        descriptor.value = async function (...args) {
            // Generate cache key
            const cacheKey = `query:${
                this.modelName
            }:${propertyName}:${JSON.stringify(args)}`;

            // Try to get from cache
            const cached = await redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }

            // Execute query
            const result = await method.apply(this, args);

            // Cache result
            await redis.setex(cacheKey, duration, JSON.stringify(result));

            return result;
        };
    };
};

// Usage with decorator
class UserService {
    @cacheQuery(600) // Cache for 10 minutes
    static async findActiveUsers() {
        return await User.find({ isActive: true }, "firstName lastName email");
    }

    @cacheQuery(1800) // Cache for 30 minutes
    static async getUserStats(userId) {
        return await User.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "customerId",
                    as: "orders",
                },
            },
            {
                $addFields: {
                    totalOrders: { $size: "$orders" },
                    totalSpent: { $sum: "$orders.amount" },
                },
            },
        ]);
    }
}
```

### Mongoose Cache Plugin

```javascript
// Custom caching plugin
const cachePlugin = function (schema, options) {
    const { duration = 300, keyGenerator } = options;

    // Add cache methods to schema
    schema.statics.findCached = async function (
        query,
        projection,
        options = {}
    ) {
        const key = keyGenerator
            ? keyGenerator(query, projection, options)
            : `${this.modelName}:${JSON.stringify(query)}`;

        // Try cache first
        const cached = await redis.get(key);
        if (cached) {
            return JSON.parse(cached);
        }

        // Execute query
        const result = await this.find(query, projection, options);

        // Cache result
        await redis.setex(key, duration, JSON.stringify(result));

        return result;
    };

    // Invalidate cache on write operations
    schema.post(
        ["save", "remove", "updateOne", "deleteOne"],
        async function () {
            const pattern = `${this.constructor.modelName}:*`;
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(keys);
            }
        }
    );
};

// Apply plugin
userSchema.plugin(cachePlugin, {
    duration: 600,
    keyGenerator: (query, projection) => `user:${JSON.stringify(query)}`,
});
```

### Application-Level Caching

```javascript
const NodeCache = require("node-cache");

// Create cache instances for different data types
const userCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const productCache = new NodeCache({ stdTTL: 1800, checkperiod: 300 });
const configCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Cache service
class CacheService {
    static async getUser(userId) {
        const cacheKey = `user:${userId}`;

        // Try cache first
        let user = userCache.get(cacheKey);
        if (user) {
            return user;
        }

        // Get from database
        user = await User.findById(userId, "-password");
        if (user) {
            userCache.set(cacheKey, user);
        }

        return user;
    }

    static async getPopularProducts(limit = 10) {
        const cacheKey = `popular:${limit}`;

        let products = productCache.get(cacheKey);
        if (products) {
            return products;
        }

        products = await Product.find({ isActive: true })
            .sort({ popularity: -1 })
            .limit(limit);

        productCache.set(cacheKey, products);
        return products;
    }

    static invalidateUser(userId) {
        userCache.del(`user:${userId}`);
    }

    static invalidateProducts() {
        productCache.flushAll();
    }
}
```

## Memory Management

### Lean Queries

```javascript
// Regular query returns Mongoose documents (heavy)
const users = await User.find({ isActive: true });

// Lean query returns plain JavaScript objects (lighter)
const users = await User.find({ isActive: true }).lean();

// Lean with specific fields
const users = await User.find(
    { isActive: true },
    "firstName lastName email"
).lean();

// For large datasets, always use lean
const processLargeDataset = async () => {
    const cursor = User.find({ createdAt: { $gte: startDate } })
        .lean()
        .cursor();

    for (
        let doc = await cursor.next();
        doc != null;
        doc = await cursor.next()
    ) {
        await processDocument(doc);
    }
};
```

### Streaming Large Results

```javascript
const fs = require("fs");
const { Transform } = require("stream");

// Stream large datasets to avoid memory issues
const exportUsers = async () => {
    const writeStream = fs.createWriteStream("users.json");

    // Transform stream to convert documents to JSON
    const transformStream = new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            this.push(JSON.stringify(chunk) + "\n");
            callback();
        },
    });

    // Create cursor for streaming
    const cursor = User.find({}).lean().cursor();

    // Pipe through transform to file
    cursor.pipe(transformStream).pipe(writeStream);

    return new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
    });
};

// Batch processing with streaming
const processBatches = async (batchSize = 1000) => {
    const cursor = User.find({}).lean().cursor();
    let batch = [];

    for (
        let doc = await cursor.next();
        doc != null;
        doc = await cursor.next()
    ) {
        batch.push(doc);

        if (batch.length === batchSize) {
            await processBatch(batch);
            batch = []; // Clear batch to free memory
        }
    }

    // Process remaining documents
    if (batch.length > 0) {
        await processBatch(batch);
    }
};
```

## Monitoring and Profiling

### Query Performance Monitoring

```javascript
// Query performance monitoring middleware
const queryMonitor = (schema) => {
    const operations = [
        "find",
        "findOne",
        "findOneAndUpdate",
        "updateOne",
        "deleteOne",
    ];

    operations.forEach((op) => {
        schema.pre(op, function () {
            this._startTime = Date.now();
        });

        schema.post(op, function (result) {
            const duration = Date.now() - this._startTime;

            if (duration > 1000) {
                // Log slow queries (>1s)
                console.warn(`Slow query detected: ${op}`, {
                    model: this.model.modelName,
                    query: this.getQuery(),
                    duration: `${duration}ms`,
                    options: this.getOptions(),
                });
            }
        });
    });
};

// Apply to schemas
userSchema.plugin(queryMonitor);
orderSchema.plugin(queryMonitor);
```

### Performance Metrics

```javascript
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            queries: new Map(),
            connections: 0,
            memoryUsage: [],
        };

        this.startMonitoring();
    }

    startMonitoring() {
        // Monitor memory usage
        setInterval(() => {
            const usage = process.memoryUsage();
            this.metrics.memoryUsage.push({
                timestamp: new Date(),
                rss: usage.rss,
                heapUsed: usage.heapUsed,
                heapTotal: usage.heapTotal,
            });

            // Keep only last 100 measurements
            if (this.metrics.memoryUsage.length > 100) {
                this.metrics.memoryUsage.shift();
            }
        }, 30000); // Every 30 seconds

        // Monitor database connections
        mongoose.connection.on("connected", () => {
            this.metrics.connections++;
        });

        mongoose.connection.on("disconnected", () => {
            this.metrics.connections--;
        });
    }

    recordQuery(operation, duration, model) {
        const key = `${model}:${operation}`;

        if (!this.metrics.queries.has(key)) {
            this.metrics.queries.set(key, {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                maxTime: 0,
            });
        }

        const metric = this.metrics.queries.get(key);
        metric.count++;
        metric.totalTime += duration;
        metric.avgTime = metric.totalTime / metric.count;
        metric.maxTime = Math.max(metric.maxTime, duration);
    }

    getReport() {
        return {
            queries: Object.fromEntries(this.metrics.queries),
            memoryUsage: this.metrics.memoryUsage.slice(-10), // Last 10 measurements
            connections: this.metrics.connections,
        };
    }
}

const monitor = new PerformanceMonitor();
```

### Database Profiling

```javascript
// Enable MongoDB profiling
const enableProfiling = async () => {
    const db = mongoose.connection.db;

    // Set profiling level (0=off, 1=slow ops, 2=all ops)
    await db.admin().command({
        profile: 1,
        slowms: 100, // Profile operations slower than 100ms
    });

    console.log("MongoDB profiling enabled");
};

// Get profiling data
const getProfilingData = async () => {
    const db = mongoose.connection.db;

    const profile = await db
        .collection("system.profile")
        .find({})
        .sort({ ts: -1 })
        .limit(10)
        .toArray();

    return profile.map((op) => ({
        operation: op.command,
        duration: op.millis,
        timestamp: op.ts,
        namespace: op.ns,
    }));
};
```

---

## 🎯 Best Practices Summary

### Indexing

1. **Create indexes for query patterns** - Index fields used in find, sort, and aggregation
2. **Use compound indexes wisely** - Order fields by equality, sort, range
3. **Monitor index usage** - Remove unused indexes
4. **Consider index size** - Indexes consume memory and storage

### Query Optimization

1. **Use projections** - Only fetch needed fields
2. **Limit result sets** - Use cursor-based pagination for large datasets
3. **Optimize aggregations** - Match early, project to reduce size
4. **Use lean queries** - For read-only operations

### Caching

1. **Cache at multiple levels** - Application, query result, and computed data
2. **Set appropriate TTL** - Balance freshness with performance
3. **Invalidate strategically** - Clear cache when data changes
4. **Monitor cache hit rates** - Adjust strategy based on metrics

---

_Continue to 11-Security-Best-Practices.md for production security_
