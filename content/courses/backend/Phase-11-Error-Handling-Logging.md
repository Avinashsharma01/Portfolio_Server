# Phase 11 — Error Handling & Logging

## Table of Contents

- [Why Error Handling Matters](#why-error-handling-matters)
- [Types of Errors](#types-of-errors)
- [Express Error Handling](#express-error-handling)
- [Custom Error Classes](#custom-error-classes)
- [Async Error Handling](#async-error-handling)
- [Centralized Error Handler](#centralized-error-handler)
- [Validation Errors](#validation-errors)
- [Unhandled Errors](#unhandled-errors)
- [Logging Fundamentals](#logging-fundamentals)
- [Winston Logger](#winston-logger)
- [Morgan — HTTP Request Logging](#morgan--http-request-logging)
- [Structured Logging](#structured-logging)
- [Production Error & Logging Strategy](#production-error--logging-strategy)
- [Key Takeaways](#key-takeaways)

---

## Why Error Handling Matters

```
WITHOUT proper error handling:
├── Server crashes on unhandled errors
├── Users see ugly stack traces
├── Security info leaked in error messages
├── Hard to debug (no logs, no context)
└── Ruins user experience

WITH proper error handling:
├── Server stays running
├── Users see friendly error messages
├── Stack traces are logged, not exposed
├── Errors are categorized and trackable
└── Production issues are diagnosed quickly
```

---

## Types of Errors

### Operational Errors (Expected)

Errors you can anticipate and handle gracefully:

```
├── Invalid user input (validation)
├── Database connection failure
├── Third-party API timeout
├── File not found
├── Authentication failure
├── Rate limiting
└── Resource not found (404)
```

### Programming Errors (Bugs)

Errors caused by developer mistakes:

```
├── TypeError: Cannot read property of undefined
├── ReferenceError: variable is not defined
├── Syntax errors
├── Logic errors
├── Forgetting to await a Promise
└── Using wrong data type
```

### Key Difference

```
Operational errors  → Handle gracefully, respond with proper status codes
Programming errors  → Fix the bug! These should not happen in production
```

---

## Express Error Handling

### Default Behavior

By default, Express sends a 500 error with the stack trace — **terrible for production**.

```javascript
app.get("/error", (req, res) => {
    throw new Error("Something broke!");
    // Express sends: 500 with full stack trace (development)
    // This is NOT production-safe
});
```

### Error-Handling Middleware

Express error middleware has **4 parameters**: `(err, req, res, next)`

```javascript
// Must have exactly 4 parameters — that's how Express identifies it
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});
```

### Order Matters

```javascript
// 1. Regular middleware & routes
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// 2. 404 handler (after all routes)
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// 3. Error handler (LAST — catches all errors)
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        error: err.message || "Internal server error",
    });
});
```

---

## Custom Error Classes

### AppError Base Class

```javascript
// utils/AppError.js
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
```

### Specific Error Types

```javascript
// errors/NotFoundError.js
class NotFoundError extends AppError {
    constructor(resource = "Resource") {
        super(`${resource} not found`, 404);
    }
}

// errors/ValidationError.js
class ValidationError extends AppError {
    constructor(errors) {
        super("Validation failed", 422);
        this.errors = errors;
    }
}

// errors/UnauthorizedError.js
class UnauthorizedError extends AppError {
    constructor(message = "Authentication required") {
        super(message, 401);
    }
}

// errors/ForbiddenError.js
class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}

// errors/ConflictError.js
class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(message, 409);
    }
}
```

### Usage in Controllers

```javascript
const AppError = require("../utils/AppError");
const NotFoundError = require("../errors/NotFoundError");

exports.getUser = async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError("User");
    res.json({ success: true, data: user });
};

exports.createUser = async (req, res, next) => {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) throw new ConflictError("Email already registered");
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
};
```

---

## Async Error Handling

### The Problem

```javascript
// ❌ Async errors are NOT caught by Express automatically
app.get("/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id); // If this throws, server crashes
    res.json(user);
});
```

### Solution 1: Try-Catch (Verbose)

```javascript
// Works but repetitive
app.get("/users/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) throw new NotFoundError("User");
        res.json({ success: true, data: user });
    } catch (error) {
        next(error); // Pass to error handler
    }
});
```

### Solution 2: asyncHandler Wrapper (Recommended)

```javascript
// middleware/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

```javascript
// Now controllers are clean — no try-catch needed
const asyncHandler = require("../middleware/asyncHandler");

app.get("/users/:id", asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError("User");
    res.json({ success: true, data: user });
}));

// Any error thrown is automatically caught and passed to next(error)
```

### Solution 3: express-async-errors (Automatic)

```bash
npm install express-async-errors
```

```javascript
// Just require it at the top of your app — done!
require("express-async-errors");

// Now ALL async route handlers automatically catch errors
app.get("/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError("User");
    res.json({ success: true, data: user });
});
```

---

## Centralized Error Handler

### Production-Ready Error Handler

```javascript
// middleware/errorHandler.js
const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
    // Default values
    let error = { ...err, message: err.message, stack: err.stack };

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = new AppError(`Duplicate value for '${field}'`, 409);
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(e => e.message);
        error = new AppError(`Validation failed: ${messages.join(", ")}`, 422);
        error.details = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message,
            value: e.value,
        }));
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        error = new AppError("Invalid token", 401);
    }
    if (err.name === "TokenExpiredError") {
        error = new AppError("Token expired", 401);
    }

    // Log the error
    if (error.statusCode >= 500 || !error.isOperational) {
        console.error("ERROR:", {
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });
    }

    // Send response
    const statusCode = error.statusCode || 500;
    const response = {
        success: false,
        error: {
            message: error.isOperational ? error.message : "Internal server error",
            ...(error.details && { details: error.details }),
            ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
        },
    };

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
```

---

## Validation Errors

### Using express-validator

```bash
npm install express-validator
```

```javascript
const { body, validationResult } = require("express-validator");

// Validation rules
const validateUser = [
    body("name").trim().notEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
    body("email").isEmail().withMessage("Valid email is required")
        .normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must contain uppercase, lowercase, and number"),
    body("age").optional().isInt({ min: 0, max: 150 }).withMessage("Age must be 0-150"),
];

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            error: {
                message: "Validation failed",
                details: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg,
                    value: err.value,
                })),
            },
        });
    }
    next();
};

// Usage in routes
router.post("/users", validateUser, validate, createUser);
```

### Using Joi

```bash
npm install joi
```

```javascript
const Joi = require("joi");

const userSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    age: Joi.number().integer().min(0).max(150).optional(),
    role: Joi.string().valid("user", "admin").default("user"),
});

// Validation middleware factory
const validateBody = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(422).json({
            success: false,
            error: {
                message: "Validation failed",
                details: error.details.map(d => ({
                    field: d.path.join("."),
                    message: d.message,
                })),
            },
        });
    }
    req.body = value; // Use validated & sanitized values
    next();
};

// Usage
router.post("/users", validateBody(userSchema), createUser);
```

---

## Unhandled Errors

### Global Error Catchers

```javascript
// Catch unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("UNHANDLED REJECTION:", reason);
    // Close server gracefully, then exit
    server.close(() => {
        process.exit(1);
    });
});

// Catch uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("UNCAUGHT EXCEPTION:", error);
    // Must exit — app is in undefined state
    process.exit(1);
});
```

### Graceful Shutdown

```javascript
const server = app.listen(3000, () => {
    console.log("Server running on port 3000");
});

// Handle SIGTERM (sent by process managers like PM2, Docker)
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
        mongoose.connection.close(false, () => {
            console.log("MongoDB connection closed.");
            process.exit(0);
        });
    });
});
```

---

## Logging Fundamentals

### Why Logging?

```
console.log("User logged in")          → No context, no levels, not persistent
Logger.info("User logged in", { ... }) → Structured, leveled, saved to files

Logs help you:
├── Debug issues in production
├── Monitor application health
├── Track user activities
├── Satisfy audit/compliance requirements
└── Set up alerts for critical errors
```

### Log Levels

```
Level     │ When to Use                        │ Example
──────────┼────────────────────────────────────┼──────────────────────
error     │ Something broke, needs attention   │ "Database connection failed"
warn      │ Something unexpected but handled   │ "Rate limit nearly exceeded"
info      │ Notable events in normal flow      │ "User registered"
http      │ HTTP request details               │ "GET /api/users 200 54ms"
debug     │ Detailed debugging info            │ "Query: { role: 'admin' }"

In PRODUCTION: log error, warn, info
In DEVELOPMENT: log everything (including debug)
```

---

## Winston Logger

**Winston** is the most popular logging library for Node.js.

```bash
npm install winston
```

### Basic Setup

```javascript
// utils/logger.js
const winston = require("winston");

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: "my-api" },
    transports: [
        // Write errors to error.log
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: "logs/combined.log",
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});

// In development, also log to console with colors
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

module.exports = logger;
```

### Usage

```javascript
const logger = require("./utils/logger");

// Different log levels
logger.error("Database connection failed", { host: "localhost", port: 27017 });
logger.warn("Rate limit approaching", { ip: "192.168.1.1", remaining: 3 });
logger.info("User registered", { userId: "64a1b2c3", email: "user@example.com" });
logger.debug("Query executed", { collection: "users", filter: { role: "admin" } });
```

### Log File Output

```json
// logs/combined.log
{"level":"info","message":"User registered","userId":"64a1b2c3","email":"user@example.com","service":"my-api","timestamp":"2024-01-15 10:30:00"}
{"level":"error","message":"Database connection failed","host":"localhost","port":27017,"service":"my-api","timestamp":"2024-01-15 10:30:05","stack":"Error: connect ECONNREFUSED..."}
```

---

## Morgan — HTTP Request Logging

**Morgan** logs every HTTP request automatically.

```bash
npm install morgan
```

```javascript
const morgan = require("morgan");
const logger = require("./utils/logger");

// Development — colorful, concise
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
    // Output: GET /api/users 200 54.321 ms - 423
}

// Production — stream to Winston
const morganStream = {
    write: (message) => logger.http(message.trim()),
};

app.use(morgan(
    ":remote-addr :method :url :status :res[content-length] - :response-time ms",
    { stream: morganStream }
));
```

### Custom Morgan Tokens

```javascript
// Add request ID to logs
morgan.token("request-id", (req) => req.id);

app.use(morgan(
    ":request-id :method :url :status :response-time ms",
    { stream: morganStream }
));
```

---

## Structured Logging

### Request Context Logging

```javascript
// middleware/requestLogger.js
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
    // Assign unique request ID
    req.id = req.headers["x-request-id"] || uuidv4();
    res.setHeader("X-Request-ID", req.id);

    // Create child logger with request context
    req.logger = logger.child({
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
    });

    // Log request start
    req.logger.info("Request received");

    // Log response on finish
    const startTime = Date.now();
    res.on("finish", () => {
        req.logger.info("Request completed", {
            statusCode: res.statusCode,
            duration: `${Date.now() - startTime}ms`,
        });
    });

    next();
};
```

### Usage in Controllers

```javascript
exports.getUser = asyncHandler(async (req, res) => {
    req.logger.debug("Fetching user", { userId: req.params.id });

    const user = await User.findById(req.params.id);
    if (!user) {
        req.logger.warn("User not found", { userId: req.params.id });
        throw new NotFoundError("User");
    }

    req.logger.info("User retrieved successfully");
    res.json({ success: true, data: user });
});
```

### Log Output

```json
{"level":"info","message":"Request received","requestId":"abc-123","method":"GET","url":"/api/users/42","ip":"::1","timestamp":"2024-01-15 10:30:00"}
{"level":"debug","message":"Fetching user","requestId":"abc-123","userId":"42","timestamp":"2024-01-15 10:30:00"}
{"level":"info","message":"User retrieved successfully","requestId":"abc-123","timestamp":"2024-01-15 10:30:01"}
{"level":"info","message":"Request completed","requestId":"abc-123","statusCode":200,"duration":"45ms","timestamp":"2024-01-15 10:30:01"}
```

---

## Production Error & Logging Strategy

### Complete Error & Logging Setup

```javascript
// app.js — putting it all together
require("express-async-errors");
const express = require("express");
const morgan = require("morgan");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");

const app = express();

// 1. Request parsing
app.use(express.json());

// 2. Request logging
app.use(requestLogger);
app.use(morgan("combined", { stream: { write: (msg) => logger.http(msg.trim()) } }));

// 3. Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// 4. 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: { message: `Route ${req.originalUrl} not found` },
    });
});

// 5. Centralized error handler
app.use(errorHandler);

// 6. Start server
const server = app.listen(3000, () => logger.info("Server started on port 3000"));

// 7. Global error catchers
process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection:", reason);
    server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    process.exit(1);
});
```

### What to Log and What NOT to Log

```
✅ DO LOG:
├── Request details (method, URL, status, duration)
├── Business events (user registered, order placed)
├── Errors with context (what failed and why)
├── System events (server started, DB connected)
└── Performance metrics (slow queries, high memory)

❌ DON'T LOG:
├── Passwords or tokens
├── Full credit card numbers
├── Personal sensitive data (SSN, etc.)
├── Request bodies with sensitive data
└── High-volume data that creates noise
```

---

## Key Takeaways

1. **Operational errors are expected** and handled gracefully; programming errors are bugs to fix
2. **Custom error classes** make error handling consistent and clean
3. **asyncHandler or express-async-errors** removes try-catch repetition
4. **Centralized error handler** processes all errors in one place
5. **Validate input** at the API boundary — return 422 with specific field errors
6. **Winston** for structured logging with levels and file rotation
7. **Morgan** for automatic HTTP request logging
8. **Request IDs** correlate all logs for a single request
9. **Never expose stack traces** in production
10. **Don't log sensitive data** (passwords, tokens, credit cards)

---

## Practice Exercises

1. **Custom errors:** Create AppError and specific error classes (NotFoundError, ValidationError)
2. **Error handler:** Build a centralized error handler that handles Mongoose, JWT, and custom errors
3. **Async handling:** Set up express-async-errors and verify errors are caught
4. **Winston:** Configure Winston with file transports and log rotation
5. **Request logging:** Add request IDs and structured logging to an API
6. **Validation:** Implement input validation with Joi or express-validator

---

**Previous:** [← Phase 10 — Authentication & Authorization](Phase-10-Authentication-Authorization.md)

**Next:** [Phase 12 — File Uploads & Streams →](Phase-12-File-Uploads-Streams.md)
