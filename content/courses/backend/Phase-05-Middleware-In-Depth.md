# Phase 05 — Middleware In Depth

## Table of Contents

- [What is Middleware?](#what-is-middleware)
- [How Middleware Works](#how-middleware-works)
- [Types of Middleware](#types-of-middleware)
- [Built-in Middleware](#built-in-middleware)
- [Custom Middleware](#custom-middleware)
- [Third-Party Middleware](#third-party-middleware)
- [Error-Handling Middleware](#error-handling-middleware)
- [Middleware Execution Order](#middleware-execution-order)
- [Real-World Middleware Patterns](#real-world-middleware-patterns)
- [Key Takeaways](#key-takeaways)

---

## What is Middleware?

Middleware is a **function that runs between the request coming in and the response going out**. It has access to the request object (`req`), the response object (`res`), and the `next` function.

### The Analogy

Think of middleware as **security checkpoints at an airport**:

```
Passenger (Request)
    │
    ▼
┌───────────────┐
│ Ticket Check  │  ← Middleware 1: Validate the request
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ ID Verification│  ← Middleware 2: Check authentication
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Security Scan │  ← Middleware 3: Check for threats
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Boarding Gate │  ← Route Handler: Final destination
└───────────────┘
```

Each checkpoint can:
1. **Let you through** → call `next()`
2. **Stop you** → send a response (don't call `next()`)
3. **Modify your info** → attach data to `req`

---

## How Middleware Works

### Basic Middleware Signature

```javascript
function myMiddleware(req, res, next) {
    // Do something with req/res
    console.log("Middleware executed!");

    // Pass control to the next middleware/route handler
    next();
}
```

### The Three Parameters

| Parameter | Purpose |
|-----------|---------|
| `req` | The incoming request object (read data, add properties) |
| `res` | The outgoing response object (can send response to stop the chain) |
| `next` | A function — call it to pass control to the NEXT middleware |

### If You DON'T Call `next()`

The request **hangs forever** (or until the client times out). You must either:
- Call `next()` to continue, OR
- Send a response (`res.json()`, `res.send()`, etc.)

```javascript
// ❌ BAD — Request will hang
app.use((req, res, next) => {
    console.log("I received a request");
    // Forgot to call next() or send a response!
});

// ✅ GOOD — Passes control forward
app.use((req, res, next) => {
    console.log("I received a request");
    next();
});

// ✅ GOOD — Sends a response (stops the chain)
app.use((req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: "No token" });
    }
    next();
});
```

---

## Types of Middleware

### 1. Application-Level Middleware

Applied to the entire app or specific paths using `app.use()`.

```javascript
// Applied to ALL routes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Applied to a specific path prefix
app.use("/api", (req, res, next) => {
    console.log("API request received");
    next();
});
```

### 2. Router-Level Middleware

Applied to a specific router using `router.use()`.

```javascript
const router = express.Router();

router.use((req, res, next) => {
    console.log("User router middleware");
    next();
});

router.get("/", getUsers);
router.post("/", createUser);

app.use("/api/users", router);
```

### 3. Built-in Middleware

Middleware that comes with Express.

### 4. Third-Party Middleware

Middleware from npm packages.

### 5. Error-Handling Middleware

Special middleware with 4 parameters: `(err, req, res, next)`.

---

## Built-in Middleware

Express includes three built-in middleware functions:

### `express.json()`

Parses incoming JSON request bodies.

```javascript
app.use(express.json());
// Now req.body is available for JSON requests

app.post("/api/users", (req, res) => {
    console.log(req.body); // { name: "Avinash", email: "a@test.com" }
    res.json(req.body);
});

// Options
app.use(express.json({
    limit: "10kb",      // Max body size (prevent huge payloads)
    strict: true,       // Only accept arrays and objects
    type: "application/json", // Content-Type to parse
}));
```

### `express.urlencoded()`

Parses URL-encoded bodies (from HTML forms).

```javascript
app.use(express.urlencoded({ extended: true }));

// When a form submits: name=Avinash&email=a@test.com
app.post("/submit-form", (req, res) => {
    console.log(req.body); // { name: "Avinash", email: "a@test.com" }
});

// extended: true  → Uses 'qs' library (supports nested objects)
// extended: false → Uses 'querystring' (flat objects only)
```

### `express.static()`

Serves static files (HTML, CSS, images, JS).

```javascript
app.use(express.static("public"));
// Files in /public are served at the root URL
// public/style.css → http://localhost:3000/style.css

app.use("/assets", express.static("public"));
// public/style.css → http://localhost:3000/assets/style.css
```

---

## Custom Middleware

This is where the real power lies. You can create middleware for anything.

### Logger Middleware

```javascript
function logger(req, res, next) {
    const start = Date.now();

    // This runs AFTER the response is sent
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
        );
    });

    next();
}

app.use(logger);
// Output: GET /api/users 200 15ms
```

### Request ID Middleware

```javascript
const crypto = require("crypto");

function requestId(req, res, next) {
    req.id = crypto.randomUUID();
    res.set("X-Request-Id", req.id);
    next();
}

app.use(requestId);

app.get("/api/users", (req, res) => {
    console.log(`Request ID: ${req.id}`);
    res.json({ requestId: req.id, users: [] });
});
```

### Validate Body Middleware

```javascript
function validateBody(requiredFields) {
    return (req, res, next) => {
        const missing = requiredFields.filter(field => !req.body[field]);

        if (missing.length > 0) {
            return res.status(400).json({
                error: "Missing required fields",
                missing,
            });
        }

        next();
    };
}

// Usage
app.post("/api/users",
    validateBody(["name", "email"]),
    (req, res) => {
        // Only reaches here if name and email are present
        res.status(201).json({ message: "User created" });
    }
);
```

### Auth Middleware

```javascript
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        // Verify token (we'll cover JWT in Phase 10)
        const decoded = verifyToken(token);
        req.user = decoded; // Attach user info to request
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

// Protect specific routes
app.get("/api/profile", authenticate, (req, res) => {
    res.json({ user: req.user });
});

// Protect all routes under a path
app.use("/api/admin", authenticate);
```

### Role-Based Authorization Middleware

```javascript
function authorize(...roles) {
    return (req, res, next) => {
        // req.user is set by authenticate middleware
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }

        next();
    };
}

// Usage — chain multiple middleware
app.delete("/api/users/:id",
    authenticate,                      // First: verify token
    authorize("admin"),                // Then: check role
    (req, res) => {
        // Only admins reach here
        res.json({ message: "User deleted" });
    }
);
```

### Rate Limiter Middleware (Simple Version)

```javascript
function rateLimiter(windowMs, maxRequests) {
    const requests = new Map();

    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get request timestamps for this IP
        const timestamps = requests.get(ip) || [];

        // Filter to only timestamps within the window
        const recentTimestamps = timestamps.filter(t => t > windowStart);

        if (recentTimestamps.length >= maxRequests) {
            return res.status(429).json({
                error: "Too many requests. Try again later.",
            });
        }

        recentTimestamps.push(now);
        requests.set(ip, recentTimestamps);

        next();
    };
}

// Allow 100 requests per 15 minutes
app.use("/api", rateLimiter(15 * 60 * 1000, 100));
```

---

## Third-Party Middleware

Popular npm middleware packages:

### morgan — HTTP Request Logger

```bash
npm install morgan
```

```javascript
const morgan = require("morgan");

// Predefined formats
app.use(morgan("dev"));       // :method :url :status :response-time ms
app.use(morgan("combined"));  // Apache-style logs (for production)
app.use(morgan("tiny"));      // Minimal output

// Output: GET /api/users 200 5.123 ms - 256
```

### helmet — Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require("helmet");

app.use(helmet());
// Adds security headers:
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// Strict-Transport-Security: max-age=...
// X-XSS-Protection: 0
// Content-Security-Policy: ...
```

### compression — Gzip Compression

```bash
npm install compression
```

```javascript
const compression = require("compression");

app.use(compression());
// Compresses response bodies for all requests
// Can reduce response size by 70-90%
```

### express-rate-limit — Production Rate Limiter

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requests per window
    message: { error: "Too many requests" },
    standardHeaders: true,     // Send rate limit info in headers
});

app.use("/api", limiter);
```

### Typical Middleware Stack (Production App)

```javascript
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Request logging
app.use(morgan("dev"));

// Compression
app.use(compression());

// Rate limiting
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static("public"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Error handler (MUST be last)
app.use(errorHandler);
```

---

## Error-Handling Middleware

Error-handling middleware has **4 parameters** — that's how Express knows it's an error handler.

```javascript
// Regular middleware: (req, res, next) — 3 params
// Error middleware:   (err, req, res, next) — 4 params
```

### Basic Error Handler

```javascript
function errorHandler(err, req, res, next) {
    console.error(err.stack);

    res.status(err.status || 500).json({
        error: {
            message: err.message || "Internal Server Error",
        },
    });
}

// MUST be registered AFTER all routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use(errorHandler); // ← Last
```

### Throwing Errors to the Error Handler

```javascript
// Using next(err) — passes error to error handler
app.get("/api/users/:id", (req, res, next) => {
    try {
        const user = getUserById(req.params.id);
        if (!user) {
            const error = new Error("User not found");
            error.status = 404;
            return next(error); // ← Pass to error handler
        }
        res.json(user);
    } catch (err) {
        next(err); // ← Pass unexpected errors too
    }
});
```

### Custom Error Class

```javascript
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Expected error (not a bug)
    }
}

// Usage
app.get("/api/users/:id", (req, res, next) => {
    const user = getUserById(req.params.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    res.json(user);
});

// Error handler
function errorHandler(err, req, res, next) {
    if (err.isOperational) {
        // Expected error — send message to client
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    // Unexpected error (bug) — don't leak details
    console.error("UNEXPECTED ERROR:", err);
    res.status(500).json({
        error: "Something went wrong",
    });
}
```

### Async Error Handling

Express doesn't catch errors in async functions by default. You need a wrapper:

```javascript
// ❌ This will crash the server if the DB call fails
app.get("/api/users", async (req, res) => {
    const users = await User.find(); // If this throws, Express won't catch it
    res.json(users);
});

// ✅ Option 1: Try-catch in every route
app.get("/api/users", async (req, res, next) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        next(err);
    }
});

// ✅ Option 2: Async wrapper function (DRY)
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Now you don't need try-catch in every route
app.get("/api/users", asyncHandler(async (req, res) => {
    const users = await User.find();
    res.json(users);
}));

app.get("/api/users/:id", asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError("User not found", 404);
    res.json(user);
}));
```

> **Note:** Express 5 (currently in beta) will natively catch async errors. Until then, use the wrapper.

---

## Middleware Execution Order

Middleware runs **in the order it's registered**. Order matters!

```javascript
// These run in order: 1 → 2 → 3 → route handler

app.use(middleware1);  // Runs first
app.use(middleware2);  // Runs second
app.use(middleware3);  // Runs third

app.get("/", (req, res) => {
    res.send("Done!"); // Runs last
});
```

### Visualization

```
Request ──► middleware1 ──► middleware2 ──► middleware3 ──► Route Handler
                │               │               │               │
                ▼               ▼               ▼               ▼
            next()          next()          next()          res.json()
```

### Common Mistake: Wrong Order

```javascript
// ❌ WRONG — Routes before body parser
app.post("/api/users", (req, res) => {
    console.log(req.body); // undefined! Body hasn't been parsed yet
});
app.use(express.json()); // Too late!

// ✅ RIGHT — Body parser before routes
app.use(express.json()); // Parse body first
app.post("/api/users", (req, res) => {
    console.log(req.body); // { name: "Avinash" } ✅
});
```

### Route-Specific Middleware

```javascript
// Middleware only for this route (not global)
app.get("/api/admin", authenticate, authorize("admin"), (req, res) => {
    res.json({ message: "Admin panel" });
});

// Multiple middleware as an array
const adminMiddleware = [authenticate, authorize("admin")];
app.get("/api/admin", adminMiddleware, (req, res) => {
    res.json({ message: "Admin panel" });
});
```

---

## Real-World Middleware Patterns

### Request Timing

```javascript
app.use((req, res, next) => {
    req.startTime = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - req.startTime;
        console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
    });

    next();
});
```

### API Key Validation

```javascript
function validateApiKey(req, res, next) {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
        return res.status(401).json({ error: "API key required" });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({ error: "Invalid API key" });
    }

    next();
}

app.use("/api/v1", validateApiKey);
```

### Request Sanitization

```javascript
function sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === "object") {
        for (const key in req.body) {
            if (typeof req.body[key] === "string") {
                req.body[key] = req.body[key].trim();
            }
        }
    }
    next();
}

app.use(sanitizeBody);
```

### Attach Database Connection

```javascript
function attachDb(req, res, next) {
    req.db = databaseConnection;
    next();
}

app.use(attachDb);

app.get("/api/users", async (req, res) => {
    const users = await req.db.collection("users").find().toArray();
    res.json(users);
});
```

---

## Key Takeaways

1. **Middleware** = function with `(req, res, next)` that runs between request and response
2. **Always call `next()`** or send a response — otherwise the request hangs
3. **Order matters** — middleware runs top to bottom in the order registered
4. **Built-in**: `express.json()`, `express.urlencoded()`, `express.static()`
5. **Error middleware** has 4 params: `(err, req, res, next)` — register it LAST
6. **Async errors** need special handling — use `asyncHandler` wrapper or try-catch
7. **Middleware can modify `req`** — attach user info, request ID, timestamps
8. **Stack your middleware** wisely: security → logging → parsing → routes → errors

---

## Practice Exercises

1. **Logger middleware:** Log method, URL, status code, and response time for every request
2. **Auth middleware:** Create a simple token checker that blocks unauthenticated requests
3. **Validation middleware factory:** Create a function that returns middleware to validate specific body fields
4. **Error handling:** Implement `AppError` class and centralized error handler
5. **Middleware chain:** Build an app with 5+ middleware functions and trace the execution order using `console.log`

---

**Previous:** [← Phase 04 — HTTP Deep Dive](Phase-04-HTTP-Deep-Dive.md)

**Next:** [Phase 06 — Routing Advanced Patterns →](Phase-06-Routing-Advanced.md)
