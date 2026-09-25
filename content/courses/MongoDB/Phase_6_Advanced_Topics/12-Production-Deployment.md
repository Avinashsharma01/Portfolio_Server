# Phase 5: Production Deployment

## 📖 Table of Contents

1. [Production Environment Setup](#production-environment-setup)
2. [Database Configuration](#database-configuration)
3. [Monitoring & Logging](#monitoring--logging)
4. [Backup & Recovery](#backup--recovery)
5. [Scaling Strategies](#scaling-strategies)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Maintenance & Updates](#maintenance--updates)

## Production Environment Setup

### Environment Configuration

```javascript
// config/production.js
const productionConfig = {
    // Database settings
    database: {
        uri: process.env.MONGODB_URI,
        options: {
            maxPoolSize: 20,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,

            // Production-specific settings
            readPreference: "primaryPreferred",
            readConcern: { level: "majority" },
            writeConcern: {
                w: "majority",
                j: true,
                wtimeout: 30000,
            },

            // Retry settings
            retryWrites: true,
            retryReads: true,

            // Compression
            compressors: ["zlib", "snappy"],
        },
    },

    // Server settings
    server: {
        port: process.env.PORT || 3000,
        host: "0.0.0.0",
        keepAliveTimeout: 65000,
        headersTimeout: 66000,
    },

    // Security settings
    security: {
        jwtSecret: process.env.JWT_SECRET,
        encryptionKey: process.env.ENCRYPTION_KEY,
        rateLimiting: {
            windowMs: 15 * 60 * 1000,
            max: 1000,
        },
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(",") || false,
            credentials: true,
        },
    },

    // Logging
    logging: {
        level: "info",
        format: "json",
        destinations: ["console", "file", "elasticsearch"],
    },

    // Caching
    cache: {
        redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            db: 0,
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            maxMemoryPolicy: "allkeys-lru",
        },
    },

    // Monitoring
    monitoring: {
        metrics: {
            enabled: true,
            port: 9090,
            path: "/metrics",
        },
        healthCheck: {
            enabled: true,
            path: "/health",
            interval: 30000,
        },
    },
};

module.exports = productionConfig;
```

### Application Bootstrap

```javascript
// app.js - Production-ready application setup
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cors = require("cors");
const config = require("./config/production");

class Application {
    constructor() {
        this.app = express();
        this.setupDatabase();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.setupGracefulShutdown();
    }

    async setupDatabase() {
        try {
            await mongoose.connect(
                config.database.uri,
                config.database.options
            );
            console.log("Database connected successfully");

            // Setup database event listeners
            mongoose.connection.on("error", (err) => {
                console.error("Database error:", err);
            });

            mongoose.connection.on("disconnected", () => {
                console.warn("Database disconnected");
            });

            mongoose.connection.on("reconnected", () => {
                console.info("Database reconnected");
            });
        } catch (error) {
            console.error("Database connection failed:", error);
            process.exit(1);
        }
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(
            helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        styleSrc: ["'self'", "'unsafe-inline'"],
                        scriptSrc: ["'self'"],
                        imgSrc: ["'self'", "data:", "https:"],
                    },
                },
                hsts: {
                    maxAge: 31536000,
                    includeSubDomains: true,
                    preload: true,
                },
            })
        );

        // CORS
        this.app.use(cors(config.security.cors));

        // Compression
        this.app.use(
            compression({
                level: 6,
                threshold: 1024,
                filter: (req, res) => {
                    if (req.headers["x-no-compression"]) {
                        return false;
                    }
                    return compression.filter(req, res);
                },
            })
        );

        // Request parsing
        this.app.use(
            express.json({
                limit: "10mb",
                verify: (req, res, buf) => {
                    req.rawBody = buf;
                },
            })
        );
        this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

        // Request logging
        this.app.use(
            morgan("combined", {
                skip: (req, res) => res.statusCode < 400,
            })
        );

        // Health check endpoint
        this.app.get("/health", this.healthCheck.bind(this));
        this.app.get("/metrics", this.metrics.bind(this));
    }

    async healthCheck(req, res) {
        const health = {
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks: {},
        };

        // Database health
        try {
            await mongoose.connection.db.admin().ping();
            health.checks.database = { status: "ok" };
        } catch (error) {
            health.checks.database = {
                status: "error",
                message: error.message,
            };
            health.status = "error";
        }

        // Memory usage
        const memory = process.memoryUsage();
        health.checks.memory = {
            status: memory.heapUsed < memory.heapTotal * 0.9 ? "ok" : "warning",
            usage: {
                rss: memory.rss,
                heapTotal: memory.heapTotal,
                heapUsed: memory.heapUsed,
                external: memory.external,
            },
        };

        res.status(health.status === "ok" ? 200 : 503).json(health);
    }

    async metrics(req, res) {
        // Prometheus-style metrics
        const metrics = [];

        // Application metrics
        metrics.push(`app_uptime_seconds ${process.uptime()}`);
        metrics.push(
            `app_memory_usage_bytes ${process.memoryUsage().heapUsed}`
        );

        // Database metrics
        const dbStats = await mongoose.connection.db.stats();
        metrics.push(`db_collections_total ${dbStats.collections}`);
        metrics.push(`db_data_size_bytes ${dbStats.dataSize}`);
        metrics.push(`db_storage_size_bytes ${dbStats.storageSize}`);

        res.set("Content-Type", "text/plain");
        res.send(metrics.join("\n"));
    }

    setupErrorHandling() {
        // 404 handler
        this.app.use("*", (req, res) => {
            res.status(404).json({
                success: false,
                message: "Route not found",
            });
        });

        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error("Global error handler:", error);

            // Don't expose error details in production
            const isDevelopment = process.env.NODE_ENV === "development";

            res.status(error.status || 500).json({
                success: false,
                message: isDevelopment
                    ? error.message
                    : "Internal server error",
                ...(isDevelopment && { stack: error.stack }),
            });
        });

        // Uncaught exception handler
        process.on("uncaughtException", (error) => {
            console.error("Uncaught Exception:", error);
            this.gracefulShutdown("SIGTERM");
        });

        // Unhandled rejection handler
        process.on("unhandledRejection", (reason, promise) => {
            console.error(
                "Unhandled Rejection at:",
                promise,
                "reason:",
                reason
            );
            this.gracefulShutdown("SIGTERM");
        });
    }

    setupGracefulShutdown() {
        const signals = ["SIGTERM", "SIGINT", "SIGUSR2"];

        signals.forEach((signal) => {
            process.on(signal, () => this.gracefulShutdown(signal));
        });
    }

    async gracefulShutdown(signal) {
        console.log(`Received ${signal}, starting graceful shutdown...`);

        // Close server
        this.server.close(() => {
            console.log("HTTP server closed");
        });

        // Close database connection
        try {
            await mongoose.connection.close();
            console.log("Database connection closed");
        } catch (error) {
            console.error("Error closing database:", error);
        }

        // Exit process
        process.exit(0);
    }

    start() {
        this.server = this.app.listen(
            config.server.port,
            config.server.host,
            () => {
                console.log(
                    `Server running on ${config.server.host}:${config.server.port}`
                );
            }
        );

        // Server timeout settings
        this.server.keepAliveTimeout = config.server.keepAliveTimeout;
        this.server.headersTimeout = config.server.headersTimeout;
    }
}

// Start application
const app = new Application();
app.start();
```

## Database Configuration

### Replica Set Setup

```javascript
// replica-set-config.js
const replicaSetConfig = {
    _id: "myReplicaSet",
    members: [
        {
            _id: 0,
            host: "mongodb-primary:27017",
            priority: 2,
            tags: { role: "primary" },
        },
        {
            _id: 1,
            host: "mongodb-secondary-1:27017",
            priority: 1,
            tags: { role: "secondary" },
        },
        {
            _id: 2,
            host: "mongodb-secondary-2:27017",
            priority: 1,
            tags: { role: "secondary" },
        },
        {
            _id: 3,
            host: "mongodb-arbiter:27017",
            arbiterOnly: true,
        },
    ],
    settings: {
        electionTimeoutMillis: 10000,
        heartbeatIntervalMillis: 2000,
        heartbeatTimeoutSecs: 10,
        catchUpTimeoutMillis: 60000,
    },
};

// Initialize replica set
// rs.initiate(replicaSetConfig)
```

### Sharding Configuration

```javascript
// sharding-config.js
const shardingConfig = {
    // Config server replica set
    configServers: {
        _id: "configReplSet",
        configsvr: true,
        members: [
            { _id: 0, host: "config-1:27017" },
            { _id: 1, host: "config-2:27017" },
            { _id: 2, host: "config-3:27017" },
        ],
    },

    // Shard configurations
    shards: [
        {
            _id: "shard01",
            host: "shard01/shard01-a:27017,shard01-b:27017,shard01-c:27017",
        },
        {
            _id: "shard02",
            host: "shard02/shard02-a:27017,shard02-b:27017,shard02-c:27017",
        },
    ],

    // Mongos configuration
    mongos: ["mongos-1:27017", "mongos-2:27017"],
};

// Shard key strategies
const shardKeyStrategies = {
    // User collection - shard by user ID
    users: {
        shardKey: { _id: 1 },
        reason: "Even distribution, good for user-specific queries",
    },

    // Orders collection - compound shard key
    orders: {
        shardKey: { customerId: 1, orderDate: 1 },
        reason: "Groups related orders together, enables range queries",
    },

    // Time-series data - shard by time
    analytics: {
        shardKey: { timestamp: 1, deviceId: 1 },
        reason: "Good for time-based queries and data aging",
    },
};
```

### Database Optimization

```javascript
// Database maintenance scripts
class DatabaseMaintenance {
    static async optimizeIndexes() {
        const collections = await mongoose.connection.db
            .listCollections()
            .toArray();

        for (const collection of collections) {
            const collectionName = collection.name;
            const coll = mongoose.connection.db.collection(collectionName);

            // Get index statistics
            const indexStats = await coll
                .aggregate([{ $indexStats: {} }])
                .toArray();

            // Identify unused indexes
            const unusedIndexes = indexStats.filter(
                (stat) => stat.accesses.ops === 0 && stat.name !== "_id_" // Don't remove _id index
            );

            console.log(`Collection ${collectionName}:`);
            console.log(`- Total indexes: ${indexStats.length}`);
            console.log(`- Unused indexes: ${unusedIndexes.length}`);

            // Drop unused indexes (be careful in production!)
            for (const index of unusedIndexes) {
                console.log(`Dropping unused index: ${index.name}`);
                // await coll.dropIndex(index.name);
            }
        }
    }

    static async analyzeCollectionStats() {
        const collections = await mongoose.connection.db
            .listCollections()
            .toArray();
        const stats = [];

        for (const collection of collections) {
            const collectionName = collection.name;
            const collStats = await mongoose.connection.db.stats();

            stats.push({
                name: collectionName,
                size: collStats.dataSize,
                indexSize: collStats.indexSize,
                avgObjSize: collStats.avgObjSize,
                count: collStats.count,
            });
        }

        return stats.sort((a, b) => b.size - a.size);
    }

    static async setupMaintenanceJobs() {
        const cron = require("node-cron");

        // Daily index optimization
        cron.schedule("0 2 * * *", async () => {
            console.log("Running daily index optimization...");
            await this.optimizeIndexes();
        });

        // Weekly collection stats
        cron.schedule("0 3 * * 0", async () => {
            console.log("Generating weekly collection statistics...");
            const stats = await this.analyzeCollectionStats();
            console.log("Collection statistics:", stats);
        });

        // Monthly compact (for self-managed instances)
        cron.schedule("0 1 1 * *", async () => {
            console.log("Running monthly database compact...");
            // Only for self-managed MongoDB instances
            // await mongoose.connection.db.runCommand({ compact: 'collection_name' });
        });
    }
}
```

## Monitoring & Logging

### Application Monitoring

```javascript
const prom = require("prom-client");

// Prometheus metrics
const httpRequestDuration = new prom.Histogram({
    name: "http_request_duration_ms",
    help: "Duration of HTTP requests in ms",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 5, 15, 50, 100, 500],
});

const httpRequestsTotal = new prom.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
});

const databaseConnections = new prom.Gauge({
    name: "database_connections_active",
    help: "Number of active database connections",
});

const databaseQueryDuration = new prom.Histogram({
    name: "database_query_duration_ms",
    help: "Duration of database queries in ms",
    labelNames: ["operation", "collection"],
});

// Metrics middleware
const metricsMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        const route = req.route?.path || req.path;

        httpRequestDuration
            .labels(req.method, route, res.statusCode)
            .observe(duration);

        httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
    });

    next();
};

// Database monitoring
const monitorDatabase = () => {
    setInterval(() => {
        // Update connection count
        const connections =
            mongoose.connection.readyState === 1
                ? mongoose.connection.db.serverConfig.connections().length
                : 0;
        databaseConnections.set(connections);
    }, 5000);
};

// Custom monitoring service
class MonitoringService {
    constructor() {
        this.alerts = [];
        this.thresholds = {
            responseTime: 1000,
            errorRate: 0.05,
            memoryUsage: 0.85,
            cpuUsage: 0.8,
        };
    }

    checkHealth() {
        const metrics = this.gatherMetrics();
        const alerts = this.evaluateAlerts(metrics);

        if (alerts.length > 0) {
            this.sendAlerts(alerts);
        }

        return { metrics, alerts };
    }

    gatherMetrics() {
        const memory = process.memoryUsage();

        return {
            memory: {
                heapUsed: memory.heapUsed,
                heapTotal: memory.heapTotal,
                usage: memory.heapUsed / memory.heapTotal,
            },
            uptime: process.uptime(),
            pid: process.pid,
            timestamp: new Date(),
        };
    }

    evaluateAlerts(metrics) {
        const alerts = [];

        if (metrics.memory.usage > this.thresholds.memoryUsage) {
            alerts.push({
                type: "memory",
                severity: "warning",
                message: `Memory usage is ${(
                    metrics.memory.usage * 100
                ).toFixed(1)}%`,
                threshold: this.thresholds.memoryUsage * 100,
            });
        }

        return alerts;
    }

    async sendAlerts(alerts) {
        for (const alert of alerts) {
            console.warn("ALERT:", alert);

            // Send to external monitoring service
            // await this.sendToSlack(alert);
            // await this.sendToEmail(alert);
        }
    }
}
```

### Structured Logging

```javascript
const winston = require("winston");
const { ElasticsearchTransport } = require("winston-elasticsearch");

// Configure Winston logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: {
        service: "api-server",
        version: process.env.APP_VERSION,
        environment: process.env.NODE_ENV,
    },
    transports: [
        // Console output
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),

        // File output
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
        }),

        new winston.transports.File({
            filename: "logs/combined.log",
            maxsize: 10 * 1024 * 1024,
            maxFiles: 10,
        }),

        // Elasticsearch output
        new ElasticsearchTransport({
            level: "info",
            clientOpts: {
                node: process.env.ELASTICSEARCH_URL,
                auth: {
                    username: process.env.ELASTICSEARCH_USERNAME,
                    password: process.env.ELASTICSEARCH_PASSWORD,
                },
            },
            index: "api-logs",
        }),
    ],
});

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    logger.info("HTTP Request", {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        userId: req.user?.id,
        requestId: req.id,
    });

    // Log response
    res.on("finish", () => {
        const duration = Date.now() - start;

        logger.info("HTTP Response", {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
            requestId: req.id,
        });
    });

    next();
};

module.exports = { logger, requestLogger };
```

## Backup & Recovery

### Automated Backup System

```javascript
const { spawn } = require("child_process");
const AWS = require("aws-sdk");
const cron = require("node-cron");

class BackupService {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        });

        this.bucketName = process.env.BACKUP_BUCKET;
        this.retentionDays = 30;
    }

    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupName = `mongodb-backup-${timestamp}`;
        const backupPath = `/tmp/${backupName}`;

        try {
            console.log(`Creating backup: ${backupName}`);

            // Create mongodump
            await this.runMongoDump(backupPath);

            // Compress backup
            const compressedPath = await this.compressBackup(backupPath);

            // Upload to S3
            await this.uploadToS3(compressedPath, backupName);

            // Cleanup local files
            await this.cleanup([backupPath, compressedPath]);

            // Update backup metadata
            await this.updateBackupMetadata(backupName);

            console.log(`Backup completed: ${backupName}`);

            return {
                success: true,
                backupName,
                size: await this.getFileSize(compressedPath),
            };
        } catch (error) {
            console.error("Backup failed:", error);
            throw error;
        }
    }

    runMongoDump(outputPath) {
        return new Promise((resolve, reject) => {
            const args = [
                "--uri",
                process.env.MONGODB_URI,
                "--out",
                outputPath,
                "--gzip",
            ];

            const mongodump = spawn("mongodump", args);

            mongodump.on("error", reject);
            mongodump.on("close", (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`mongodump exited with code ${code}`));
                }
            });
        });
    }

    async compressBackup(backupPath) {
        const compressedPath = `${backupPath}.tar.gz`;

        return new Promise((resolve, reject) => {
            const tar = spawn("tar", [
                "-czf",
                compressedPath,
                "-C",
                backupPath,
                ".",
            ]);

            tar.on("error", reject);
            tar.on("close", (code) => {
                if (code === 0) {
                    resolve(compressedPath);
                } else {
                    reject(new Error(`tar exited with code ${code}`));
                }
            });
        });
    }

    async uploadToS3(filePath, backupName) {
        const fs = require("fs");
        const fileStream = fs.createReadStream(filePath);

        const uploadParams = {
            Bucket: this.bucketName,
            Key: `backups/${backupName}.tar.gz`,
            Body: fileStream,
            StorageClass: "STANDARD_IA", // Cheaper storage for backups
            ServerSideEncryption: "AES256",
        };

        return this.s3.upload(uploadParams).promise();
    }

    async restoreFromBackup(backupName) {
        const downloadPath = `/tmp/restore-${Date.now()}`;
        const extractPath = `/tmp/extract-${Date.now()}`;

        try {
            console.log(`Starting restore from backup: ${backupName}`);

            // Download from S3
            await this.downloadFromS3(backupName, downloadPath);

            // Extract backup
            await this.extractBackup(downloadPath, extractPath);

            // Run mongorestore
            await this.runMongoRestore(extractPath);

            // Cleanup
            await this.cleanup([downloadPath, extractPath]);

            console.log(`Restore completed from backup: ${backupName}`);

            return { success: true };
        } catch (error) {
            console.error("Restore failed:", error);
            throw error;
        }
    }

    setupScheduledBackups() {
        // Daily backups at 2 AM
        cron.schedule("0 2 * * *", async () => {
            try {
                await this.createBackup();
                await this.cleanupOldBackups();
            } catch (error) {
                console.error("Scheduled backup failed:", error);
            }
        });

        // Weekly full backup on Sundays at 1 AM
        cron.schedule("0 1 * * 0", async () => {
            try {
                await this.createFullBackup();
            } catch (error) {
                console.error("Weekly backup failed:", error);
            }
        });
    }

    async cleanupOldBackups() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

        const listParams = {
            Bucket: this.bucketName,
            Prefix: "backups/",
        };

        const objects = await this.s3.listObjectsV2(listParams).promise();

        const oldObjects = objects.Contents.filter(
            (obj) => obj.LastModified < cutoffDate
        );

        if (oldObjects.length > 0) {
            const deleteParams = {
                Bucket: this.bucketName,
                Delete: {
                    Objects: oldObjects.map((obj) => ({ Key: obj.Key })),
                },
            };

            await this.s3.deleteObjects(deleteParams).promise();
            console.log(`Cleaned up ${oldObjects.length} old backups`);
        }
    }
}

// Initialize backup service
const backupService = new BackupService();
backupService.setupScheduledBackups();
```

## Scaling Strategies

### Horizontal Scaling with Load Balancer

```javascript
// load-balancer-config.js
const loadBalancerConfig = {
    nginx: `
    upstream api_servers {
        least_conn;
        server api-1:3000 max_fails=3 fail_timeout=30s;
        server api-2:3000 max_fails=3 fail_timeout=30s;
        server api-3:3000 max_fails=3 fail_timeout=30s;
        server api-4:3000 backup; # Backup server
    }
    
    server {
        listen 80;
        server_name api.example.com;
        
        location / {
            proxy_pass http://api_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Health checks
            proxy_connect_timeout 5s;
            proxy_send_timeout 10s;
            proxy_read_timeout 30s;
            
            # Connection pooling
            proxy_http_version 1.1;
            proxy_set_header Connection "";
        }
        
        location /health {
            access_log off;
            return 200 "healthy\\n";
            add_header Content-Type text/plain;
        }
    }
  `,
};

// Auto-scaling configuration
const autoScalingConfig = {
    kubernetes: {
        apiVersion: "apps/v1",
        kind: "HorizontalPodAutoscaler",
        metadata: {
            name: "api-hpa",
        },
        spec: {
            scaleTargetRef: {
                apiVersion: "apps/v1",
                kind: "Deployment",
                name: "api-deployment",
            },
            minReplicas: 2,
            maxReplicas: 10,
            metrics: [
                {
                    type: "Resource",
                    resource: {
                        name: "cpu",
                        target: {
                            type: "Utilization",
                            averageUtilization: 70,
                        },
                    },
                },
                {
                    type: "Resource",
                    resource: {
                        name: "memory",
                        target: {
                            type: "Utilization",
                            averageUtilization: 80,
                        },
                    },
                },
            ],
        },
    },
};
```

### Database Read Replicas

```javascript
// read-replica-setup.js
class DatabaseService {
    constructor() {
        // Primary connection for writes
        this.primary = mongoose.createConnection(
            process.env.MONGODB_PRIMARY_URI,
            {
                readPreference: "primary",
                maxPoolSize: 20,
            }
        );

        // Read replica connections
        this.readReplicas = [
            mongoose.createConnection(process.env.MONGODB_REPLICA_1_URI, {
                readPreference: "secondary",
                maxPoolSize: 10,
            }),
            mongoose.createConnection(process.env.MONGODB_REPLICA_2_URI, {
                readPreference: "secondary",
                maxPoolSize: 10,
            }),
        ];

        this.currentReplicaIndex = 0;
    }

    getPrimaryConnection() {
        return this.primary;
    }

    getReadConnection() {
        // Round-robin load balancing
        const connection = this.readReplicas[this.currentReplicaIndex];
        this.currentReplicaIndex =
            (this.currentReplicaIndex + 1) % this.readReplicas.length;
        return connection;
    }

    // Read operations use read replicas
    async findUsers(query, options = {}) {
        const connection = this.getReadConnection();
        const User = connection.model("User", userSchema);
        return await User.find(query, null, options);
    }

    // Write operations use primary
    async createUser(userData) {
        const connection = this.getPrimaryConnection();
        const User = connection.model("User", userSchema);
        return await User.create(userData);
    }
}
```

## CI/CD Pipeline

### GitHub Actions Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
    push:
        branches: [main]

env:
    NODE_VERSION: "18"
    MONGODB_URI: ${{ secrets.MONGODB_URI }}

jobs:
    test:
        runs-on: ubuntu-latest

        services:
            mongodb:
                image: mongo:7
                env:
                    MONGO_INITDB_ROOT_USERNAME: root
                    MONGO_INITDB_ROOT_PASSWORD: password
                ports:
                    - 27017:27017
                options: >-
                    --health-cmd "mongosh --eval 'db.runCommand({ping: 1})'"
                    --health-interval 10s
                    --health-timeout 5s
                    --health-retries 5

        steps:
            - uses: actions/checkout@v3

            - name: Setup Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: ${{ env.NODE_VERSION }}
                  cache: "npm"

            - name: Install dependencies
              run: npm ci

            - name: Run linting
              run: npm run lint

            - name: Run tests
              run: npm test
              env:
                  MONGODB_URI: mongodb://root:password@localhost:27017/test?authSource=admin

            - name: Run security audit
              run: npm audit --audit-level high

    build:
        needs: test
        runs-on: ubuntu-latest

        steps:
            - uses: actions/checkout@v3

            - name: Setup Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: ${{ env.NODE_VERSION }}
                  cache: "npm"

            - name: Install dependencies
              run: npm ci --only=production

            - name: Build Docker image
              run: |
                  docker build -t ${{ secrets.DOCKER_REGISTRY }}/api:${{ github.sha }} .
                  docker tag ${{ secrets.DOCKER_REGISTRY }}/api:${{ github.sha }} ${{ secrets.DOCKER_REGISTRY }}/api:latest

            - name: Push to registry
              run: |
                  echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
                  docker push ${{ secrets.DOCKER_REGISTRY }}/api:${{ github.sha }}
                  docker push ${{ secrets.DOCKER_REGISTRY }}/api:latest

    deploy:
        needs: build
        runs-on: ubuntu-latest

        steps:
            - name: Deploy to staging
              run: |
                  kubectl set image deployment/api-deployment api=${{ secrets.DOCKER_REGISTRY }}/api:${{ github.sha }}
                  kubectl rollout status deployment/api-deployment

            - name: Run smoke tests
              run: |
                  curl -f https://staging-api.example.com/health || exit 1

            - name: Deploy to production
              if: success()
              run: |
                  kubectl set image deployment/api-deployment api=${{ secrets.DOCKER_REGISTRY }}/api:${{ github.sha }} --namespace=production
                  kubectl rollout status deployment/api-deployment --namespace=production
```

### Deployment Scripts

```javascript
// scripts/deploy.js
const { execSync } = require("child_process");

class DeploymentManager {
    constructor() {
        this.environment = process.env.ENVIRONMENT || "staging";
        this.version = process.env.VERSION || "latest";
    }

    async deploy() {
        console.log(`Deploying version ${this.version} to ${this.environment}`);

        try {
            // Pre-deployment checks
            await this.preDeploymentChecks();

            // Database migrations
            await this.runMigrations();

            // Deploy application
            await this.deployApplication();

            // Post-deployment verification
            await this.postDeploymentChecks();

            console.log("Deployment completed successfully");
        } catch (error) {
            console.error("Deployment failed:", error);
            await this.rollback();
            throw error;
        }
    }

    async preDeploymentChecks() {
        console.log("Running pre-deployment checks...");

        // Check database connectivity
        const mongoose = require("mongoose");
        await mongoose.connect(process.env.MONGODB_URI);
        await mongoose.connection.close();

        // Check external services
        await this.checkExternalServices();

        // Validate configuration
        this.validateConfiguration();
    }

    async runMigrations() {
        console.log("Running database migrations...");

        const migrations = require("./migrations");
        await migrations.up();
    }

    async deployApplication() {
        console.log("Deploying application...");

        if (this.environment === "kubernetes") {
            execSync(
                `kubectl set image deployment/api api=myregistry/api:${this.version}`
            );
            execSync("kubectl rollout status deployment/api");
        } else {
            // Docker Compose deployment
            execSync(`docker-compose up -d --scale api=3`);
        }
    }

    async postDeploymentChecks() {
        console.log("Running post-deployment checks...");

        // Health check
        const response = await fetch(`${process.env.APP_URL}/health`);
        if (!response.ok) {
            throw new Error("Health check failed");
        }

        // Smoke tests
        await this.runSmokeTests();
    }

    async rollback() {
        console.log("Rolling back deployment...");

        if (this.environment === "kubernetes") {
            execSync("kubectl rollout undo deployment/api");
        } else {
            execSync("docker-compose down && docker-compose up -d");
        }
    }
}

// Run deployment
if (require.main === module) {
    const deployment = new DeploymentManager();
    deployment.deploy().catch(process.exit);
}
```

---

## 🚀 Production Checklist

### Pre-Deployment

-   [ ] Environment variables configured
-   [ ] Database connections tested
-   [ ] Security settings configured
-   [ ] SSL certificates installed
-   [ ] Monitoring tools set up
-   [ ] Backup strategy implemented
-   [ ] Load testing completed

### Post-Deployment

-   [ ] Health checks passing
-   [ ] Monitoring dashboards configured
-   [ ] Alerts configured
-   [ ] Backup verification
-   [ ] Performance metrics baseline
-   [ ] Security scan completed
-   [ ] Documentation updated

### Ongoing Maintenance

-   [ ] Regular backups verified
-   [ ] Security updates applied
-   [ ] Performance monitoring
-   [ ] Capacity planning
-   [ ] Incident response procedures
-   [ ] Disaster recovery testing

---

_🎉 Congratulations! You've completed the comprehensive MongoDB and Mongoose documentation series._
