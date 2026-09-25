# Phase 07 — Request-Response Cycle Deep Dive

## Table of Contents

- [The Complete Lifecycle](#the-complete-lifecycle)
- [Request Processing Pipeline](#request-processing-pipeline)
- [Request Body Parsing In Depth](#request-body-parsing-in-depth)
- [Response Methods Complete Reference](#response-methods-complete-reference)
- [Content Negotiation](#content-negotiation)
- [Caching with ETags & Conditional Requests](#caching-with-etags--conditional-requests)
- [Compression](#compression)
- [Pagination Patterns](#pagination-patterns)
- [Filtering, Sorting & Searching](#filtering-sorting--searching)
- [Statelessness & Why It Matters](#statelessness--why-it-matters)
- [Key Takeaways](#key-takeaways)

---

## The Complete Lifecycle

Every HTTP interaction follows this exact sequence:

```
CLIENT                                         SERVER
  │                                              │
  │ 1. DNS Lookup (domain → IP)                  │
  │ 2. TCP Handshake (SYN → SYN-ACK → ACK)      │
  │ 3. TLS Handshake (if HTTPS)                  │
  │                                              │
  │──── HTTP REQUEST ──────────────────────────►  │
  │  (method, URL, headers, body)                │
  │                                              │
  │                   4. Express receives request │
  │                   5. Runs middleware chain     │
  │                   6. Matches route             │
  │                   7. Executes route handler    │
  │                   8. Queries database           │
  │                   9. Builds response            │
  │                                              │
  │  ◄─────────────── HTTP RESPONSE ─────────────│
  │  (status, headers, body)                     │
  │                                              │
  │ 10. Client processes response                 │
  │ 11. Connection kept alive or closed           │
```

### Inside Express (Steps 4-9 Detailed)

```
Request arrives at Express
    │
    ▼
┌──────────────────────────┐
│ 1. express.json()        │ Parse the request body
├──────────────────────────┤
│ 2. cors()                │ Check CORS headers
├──────────────────────────┤
│ 3. helmet()              │ Add security headers
├──────────────────────────┤
│ 4. morgan()              │ Log the request
├──────────────────────────┤
│ 5. authenticate()        │ Verify JWT token
├──────────────────────────┤
│ 6. Route matching        │ Find the right handler
├──────────────────────────┤
│ 7. Route Middleware      │ Route-specific middleware
├──────────────────────────┤
│ 8. Controller            │ Business logic
├──────────────────────────┤
│ 9. res.json()            │ Send response
├──────────────────────────┤
│ 10. Error Handler        │ If anything threw an error
└──────────────────────────┘
```

---

## Request Processing Pipeline

### How Express Parses a Request

When a request arrives, Express creates `req` and `res` objects and populates them:

```javascript
app.post("/api/users?role=admin", (req, res) => {
    // Express automatically parses these from the raw HTTP request:

    // From the request line
    req.method;      // "POST"
    req.url;         // "/api/users?role=admin"
    req.path;        // "/api/users"
    req.protocol;    // "http" or "https"
    req.httpVersion; // "1.1"

    // From route definition
    req.params;      // {} (would be { id: "42" } for /api/users/:id)
    req.route;       // Route object with path, methods, stack

    // From query string (parsed automatically)
    req.query;       // { role: "admin" }

    // From headers
    req.headers;     // { "content-type": "application/json", ... }
    req.hostname;    // "localhost"
    req.ip;          // "::1" or "127.0.0.1"

    // From body (requires express.json() middleware)
    req.body;        // { name: "Avinash" }

    // From cookies (requires cookie-parser middleware)
    req.cookies;     // { session: "abc123" }

    // Computed properties
    req.secure;      // true if HTTPS
    req.fresh;       // true if client cache is still valid
    req.stale;       // opposite of fresh
    req.xhr;         // true if X-Requested-With: XMLHttpRequest
    req.originalUrl; // Original URL before any rewrites
});
```

### Request Properties Flow

```
URL: POST https://api.example.com:3000/api/v1/users/42?fields=name,email

req.protocol    → "https"
req.hostname    → "api.example.com"
req.path        → "/api/v1/users/42"
req.params.id   → "42"           (from route /api/v1/users/:id)
req.query       → { fields: "name,email" }
req.method      → "POST"
req.baseUrl     → "/api/v1/users" (from router mount point)
req.originalUrl → "/api/v1/users/42?fields=name,email"
```

---

## Request Body Parsing In Depth

### JSON Body

```javascript
// Enable JSON parsing
app.use(express.json({
    limit: "10kb",           // Max body size
    strict: true,            // Only parse arrays & objects (not primitives)
    type: "application/json", // Content-Type to parse
}));

// Client sends:
// POST /api/users
// Content-Type: application/json
// {"name": "Avinash", "age": 25}

app.post("/api/users", (req, res) => {
    console.log(req.body);       // { name: "Avinash", age: 25 }
    console.log(typeof req.body); // "object"
});
```

### URL-Encoded Body (HTML Forms)

```javascript
app.use(express.urlencoded({
    extended: true,  // Use 'qs' library for complex objects
    limit: "10kb",
}));

// Client sends (HTML form):
// POST /submit
// Content-Type: application/x-www-form-urlencoded
// name=Avinash&email=a%40test.com&hobbies[0]=coding&hobbies[1]=reading

app.post("/submit", (req, res) => {
    console.log(req.body);
    // With extended: true →
    // { name: "Avinash", email: "a@test.com", hobbies: ["coding", "reading"] }

    // With extended: false → 
    // Flat objects only, no nested parsing
});
```

### Raw & Text Bodies

```javascript
// Parse raw binary data
app.use(express.raw({ type: "application/octet-stream" }));

// Parse plain text
app.use(express.text({ type: "text/plain" }));

app.post("/webhook", express.raw({ type: "*/*" }), (req, res) => {
    console.log(req.body); // Buffer
    console.log(req.body.toString()); // String
});
```

### What Happens Without Body Parsing?

```javascript
// Without express.json()
app.post("/api/users", (req, res) => {
    console.log(req.body); // undefined!
});
```

---

## Response Methods Complete Reference

### Sending Data

```javascript
// ===== res.json() — Send JSON (most common for APIs) =====
res.json({ name: "Avinash", age: 25 });
// Sets Content-Type: application/json
// Automatically converts objects to JSON string

// ===== res.send() — Smart send (auto-detects type) =====
res.send("Hello");          // Content-Type: text/html
res.send({ name: "John" }); // Content-Type: application/json
res.send(Buffer.from("Hi")); // Content-Type: application/octet-stream

// ===== res.sendStatus() — Status code with default message =====
res.sendStatus(200); // Sends "OK"
res.sendStatus(201); // Sends "Created"
res.sendStatus(404); // Sends "Not Found"
res.sendStatus(500); // Sends "Internal Server Error"

// ===== res.end() — End response without data =====
res.status(204).end(); // No content
```

### Status & Headers

```javascript
// Set status code
res.status(201);
res.status(404);

// Set headers
res.set("X-Total-Count", "100");
res.set("Cache-Control", "no-cache");
res.set({
    "X-Header-1": "value1",
    "X-Header-2": "value2",
});

// Append to existing header
res.append("Set-Cookie", "name=value");

// Get a header that was already set
res.get("Content-Type");

// Remove a header
res.removeHeader("X-Powered-By");

// Chain everything
res.status(201)
   .set("Location", "/api/users/42")
   .json({ id: 42, name: "Avinash" });
```

### Files & Downloads

```javascript
// Send a file
res.sendFile(path.join(__dirname, "public", "index.html"));

// Send file as download
res.download("/path/to/report.pdf", "monthly-report.pdf");

// Send file with options
res.sendFile("index.html", {
    root: path.join(__dirname, "public"),
    headers: {
        "X-Timestamp": Date.now(),
    },
});
```

### Redirects

```javascript
res.redirect("/new-url");           // 302 (temporary)
res.redirect(301, "/permanent-url"); // 301 (permanent)
res.redirect("back");               // Go back to referrer
res.redirect("https://google.com"); // External redirect
```

### Cookies

```javascript
// Set cookie
res.cookie("name", "value", {
    maxAge: 3600000,     // 1 hour
    httpOnly: true,      // Not accessible via JavaScript
    secure: true,        // HTTPS only
    sameSite: "strict",  // CSRF protection
    path: "/",           // Cookie path
    domain: ".example.com",
});

// Clear cookie
res.clearCookie("name", { path: "/" });
```

---

## Content Negotiation

Your API can return different formats based on what the client asks for.

```javascript
app.get("/api/users", (req, res) => {
    const users = [{ id: 1, name: "Avinash" }];

    // Check what the client wants
    res.format({
        "application/json": () => {
            res.json(users);
        },
        "text/html": () => {
            const html = users.map(u => `<li>${u.name}</li>`).join("");
            res.send(`<ul>${html}</ul>`);
        },
        "text/plain": () => {
            const text = users.map(u => u.name).join("\n");
            res.type("text").send(text);
        },
        default: () => {
            res.status(406).json({ error: "Not Acceptable" });
        },
    });
});
```

The client specifies with the `Accept` header:
```
Accept: application/json   → Gets JSON
Accept: text/html          → Gets HTML
Accept: text/plain         → Gets plain text
Accept: application/xml    → Gets 406 Not Acceptable
```

---

## Caching with ETags & Conditional Requests

Caching reduces server load and speeds up responses.

### How ETags Work

```
First request:
Client: GET /api/users
Server: 200 OK
        ETag: "abc123"
        [data]

Second request:
Client: GET /api/users
        If-None-Match: "abc123"    ← "Has data changed since this version?"
Server: 304 Not Modified           ← "Nope, use your cached version"
        (no body sent — saves bandwidth!)

After data changes:
Client: GET /api/users
        If-None-Match: "abc123"
Server: 200 OK                    ← "Yes, here's the new data"
        ETag: "def456"            ← New version
        [new data]
```

### Express ETag Configuration

```javascript
// Express generates ETags automatically for responses
// You can configure the behavior:

// Disable ETags
app.set("etag", false);

// Use weak ETags (default)
app.set("etag", "weak");

// Use strong ETags
app.set("etag", "strong");

// Custom ETag function
app.set("etag", (body, encoding) => {
    return generateCustomHash(body);
});
```

### Cache-Control Headers

```javascript
app.get("/api/users", (req, res) => {
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(users);
});

app.get("/api/profile", authenticate, (req, res) => {
    res.set("Cache-Control", "private, no-cache"); // Don't cache private data
    res.json(req.user);
});

app.get("/api/config", (req, res) => {
    res.set("Cache-Control", "public, max-age=86400, immutable"); // Cache for 24h
    res.json(config);
});
```

### Cache-Control Directives

| Directive | Meaning |
|-----------|---------|
| `public` | Can be cached by anyone (CDN, browser) |
| `private` | Only cached by the browser (not CDN) |
| `no-cache` | Must revalidate with server before using cache |
| `no-store` | Never cache this response |
| `max-age=300` | Cache is valid for 300 seconds |
| `immutable` | Content will never change (don't revalidate) |

---

## Compression

Compress responses to reduce bandwidth.

```bash
npm install compression
```

```javascript
const compression = require("compression");

// Compress all responses
app.use(compression());

// With options
app.use(compression({
    level: 6,                // Compression level (0-9, default 6)
    threshold: 1024,         // Only compress responses > 1KB
    filter: (req, res) => {  // Custom filter
        if (req.headers["x-no-compression"]) {
            return false;
        }
        return compression.filter(req, res);
    },
}));
```

### How It Works

```
Without compression:
Response body: 50KB → Client receives 50KB

With compression (gzip):
Response body: 50KB → Compressed to ~8KB → Client decompresses → 50KB
Savings: 84%!

The client tells the server what compression it supports:
Accept-Encoding: gzip, deflate, br

The server responds with:
Content-Encoding: gzip
```

---

## Pagination Patterns

Never return all records at once — use pagination.

### Offset-Based Pagination (Page Numbers)

```javascript
app.get("/api/users", async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(),
    ]);

    res.json({
        data: users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
        },
    });
});

// GET /api/users?page=2&limit=20
```

### Cursor-Based Pagination (Better for Large Datasets)

```javascript
app.get("/api/users", async (req, res) => {
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const cursor = req.query.cursor; // Last item's ID from previous page

    const query = cursor
        ? { _id: { $gt: cursor } } // Get items after the cursor
        : {};

    const users = await User.find(query)
        .sort({ _id: 1 })
        .limit(limit + 1); // Fetch one extra to check if there's a next page

    const hasMore = users.length > limit;
    if (hasMore) users.pop(); // Remove the extra item

    res.json({
        data: users,
        pagination: {
            nextCursor: hasMore ? users[users.length - 1]._id : null,
            hasMore,
        },
    });
});

// GET /api/users?cursor=60f1234567890&limit=20
```

### Offset vs Cursor Pagination

| Feature | Offset | Cursor |
|---------|--------|--------|
| Jump to any page | ✅ Yes | ❌ No |
| Consistent with new data | ❌ Can skip/duplicate | ✅ Always consistent |
| Performance on large data | ❌ Slow (skip is expensive) | ✅ Fast |
| Best for | Small datasets, UIs with page numbers | Large datasets, infinite scroll |

---

## Filtering, Sorting & Searching

### Filtering

```javascript
app.get("/api/products", async (req, res) => {
    const filter = {};

    // Simple filters
    if (req.query.category) filter.category = req.query.category;
    if (req.query.inStock) filter.inStock = req.query.inStock === "true";

    // Range filters
    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    const products = await Product.find(filter);
    res.json(products);
});

// GET /api/products?category=electronics&minPrice=100&maxPrice=500&inStock=true
```

### Sorting

```javascript
app.get("/api/products", async (req, res) => {
    // sort=price       → ascending
    // sort=-price      → descending
    // sort=price,-name → price ascending, then name descending

    let sortObj = {};

    if (req.query.sort) {
        const sortFields = req.query.sort.split(",");
        sortFields.forEach(field => {
            if (field.startsWith("-")) {
                sortObj[field.substring(1)] = -1; // Descending
            } else {
                sortObj[field] = 1; // Ascending
            }
        });
    } else {
        sortObj = { createdAt: -1 }; // Default sort
    }

    const products = await Product.find().sort(sortObj);
    res.json(products);
});

// GET /api/products?sort=-price,name
```

### Field Selection

```javascript
app.get("/api/users", async (req, res) => {
    // fields=name,email → only return name and email
    let projection = {};

    if (req.query.fields) {
        const fields = req.query.fields.split(",");
        fields.forEach(field => {
            projection[field.trim()] = 1;
        });
    }

    const users = await User.find({}, projection);
    res.json(users);
});

// GET /api/users?fields=name,email,avatar
```

### Full-Text Search

```javascript
app.get("/api/products/search", async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: "Search query required" });
    }

    // MongoDB text search (requires a text index)
    const products = await Product.find(
        { $text: { $search: q } },
        { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    res.json(products);
});

// GET /api/products/search?q=wireless headphones
```

### Advanced Query Builder

```javascript
class QueryBuilder {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit", "fields", "q"];
        excludedFields.forEach(field => delete queryObj[field]);

        // Handle operators: price[gte]=100 → { price: { $gte: 100 } }
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt|ne|in)\b/g,
            match => `$${match}`
        );

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt");
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v");
        }
        return this;
    }

    paginate() {
        const page = parseInt(this.queryString.page) || 1;
        const limit = parseInt(this.queryString.limit) || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

// Usage
app.get("/api/products", async (req, res) => {
    const builder = new QueryBuilder(Product.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const products = await builder.query;
    res.json(products);
});

// GET /api/products?price[gte]=100&price[lte]=500&sort=-price&fields=name,price&page=2&limit=10
```

---

## Statelessness & Why It Matters

### HTTP is Stateless

> Each request is **completely independent**. The server doesn't remember previous requests.

```
Request 1: GET /api/users    ← Server has no memory of this
Request 2: GET /api/users/1  ← Server doesn't know Request 1 happened
Request 3: POST /api/users   ← Completely independent
```

### Why Statelessness is Good

1. **Scalability** — Any server can handle any request (no session memory needed)
2. **Reliability** — Server crashes don't lose client state
3. **Simplicity** — Each request is self-contained
4. **Cacheability** — Stateless responses are easier to cache

### How to Maintain State in a Stateless Protocol

Since HTTP is stateless, we need mechanisms to "remember" users:

| Mechanism | How It Works | Best For |
|-----------|-------------|----------|
| **JWT Tokens** | Token sent with each request (in header) | APIs, mobile apps |
| **Session Cookies** | Server stores session, cookie maps to it | Traditional web apps |
| **API Keys** | Static key sent with each request | Server-to-server |
| **OAuth Tokens** | Access token from auth provider | Third-party auth |

```javascript
// JWT approach: Client sends token with EVERY request
app.get("/api/profile", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const user = verifyToken(token); // Decode user from token
    res.json(user);
});
// Each request is self-contained — token contains all the info needed
```

---

## Key Takeaways

1. **The request-response cycle** is a pipeline: middleware → route matching → handler → response
2. **`express.json()`** parses JSON bodies; without it, `req.body` is undefined
3. **`res.json()`** is the primary way to send API responses
4. **ETags and Cache-Control** reduce server load and bandwidth
5. **Compression** can reduce response sizes by 70-90%
6. **Use pagination** for list endpoints — never return all records
7. **Cursor-based pagination** is better than offset for large datasets
8. **HTTP is stateless** — use JWT tokens or sessions to maintain user state
9. **Content negotiation** lets one endpoint serve JSON, HTML, or other formats

---

## Practice Exercises

1. **Query builder:** Build a reusable query builder for filtering, sorting, and pagination
2. **ETag demo:** Create an endpoint that supports conditional requests with ETags
3. **Content negotiation:** Build an endpoint that returns JSON, HTML, or CSV based on the Accept header
4. **Pagination API:** Implement both offset and cursor pagination for a list endpoint
5. **Search endpoint:** Create a product search with filters (category, price range, rating)

---

**Previous:** [← Phase 06 — Routing Advanced](Phase-06-Routing-Advanced.md)

**Next:** [Phase 08 — REST API Design →](Phase-08-REST-API-Design.md)
