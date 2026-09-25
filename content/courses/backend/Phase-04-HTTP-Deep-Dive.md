# Phase 04 — HTTP Deep Dive: Methods, Headers, Status Codes

## Table of Contents

- [HTTP Message Format](#http-message-format)
- [HTTP Methods (Verbs)](#http-methods-verbs)
- [HTTP Status Codes](#http-status-codes)
- [HTTP Headers](#http-headers)
- [Content Types & MIME Types](#content-types--mime-types)
- [Cookies](#cookies)
- [HTTP Versions](#http-versions)
- [CORS (Cross-Origin Resource Sharing)](#cors-cross-origin-resource-sharing)
- [Key Takeaways](#key-takeaways)

---

## HTTP Message Format

Every HTTP communication has two messages: a **request** and a **response**.

### Request Structure

```
POST /api/users HTTP/1.1                    ← Request Line
Host: example.com                           ← Headers
Content-Type: application/json              ←
Authorization: Bearer eyJhbGciOi...         ←
Content-Length: 42                           ←
                                            ← Empty line (separates headers from body)
{"name": "Avinash", "email": "a@test.com"}  ← Body (optional)
```

### Response Structure

```
HTTP/1.1 201 Created                        ← Status Line
Content-Type: application/json              ← Headers
Set-Cookie: session=abc123                  ←
X-Request-Id: req_123456                    ←
                                            ← Empty line
{"id": 1, "name": "Avinash"}               ← Body
```

### In Express

```javascript
app.post("/api/users", (req, res) => {
    // REQUEST info
    console.log(req.method);                  // "POST"
    console.log(req.path);                    // "/api/users"
    console.log(req.httpVersion);             // "1.1"
    console.log(req.headers["content-type"]); // "application/json"
    console.log(req.body);                    // { name: "Avinash", ... }

    // RESPONSE
    res.status(201)                           // Status code
       .set("X-Request-Id", "req_123456")     // Custom header
       .json({ id: 1, name: req.body.name }); // Body
});
```

---

## HTTP Methods (Verbs)

HTTP methods tell the server **what action to perform**.

### The Main Methods

| Method | Purpose | Has Body? | Idempotent? | Safe? |
|--------|---------|-----------|-------------|-------|
| **GET** | Retrieve data | No | Yes | Yes |
| **POST** | Create new resource | Yes | No | No |
| **PUT** | Replace entire resource | Yes | Yes | No |
| **PATCH** | Update part of resource | Yes | No | No |
| **DELETE** | Remove resource | Optional | Yes | No |
| **HEAD** | Same as GET but no body | No | Yes | Yes |
| **OPTIONS** | Check what methods are allowed | No | Yes | Yes |

### What "Idempotent" Means

> **Idempotent** = Making the same request multiple times has the SAME effect as making it once.

```
GET /users/1     → Returns user 1 (same every time) ✅ Idempotent
DELETE /users/1  → Deletes user 1 (already deleted? Same result) ✅ Idempotent
POST /users      → Creates a NEW user each time ❌ NOT Idempotent
```

### What "Safe" Means

> **Safe** = The request doesn't modify anything on the server.

GET and HEAD are safe — they just read data.

### Each Method in Detail

#### GET — Read Data

```javascript
// Get all users
app.get("/api/users", (req, res) => {
    res.json(users);
});

// Get one user
app.get("/api/users/:id", (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
});
```

Rules for GET:
- Never modify data with GET
- Use query params for filtering: `GET /users?role=admin&active=true`
- Response should be cacheable

#### POST — Create Data

```javascript
app.post("/api/users", (req, res) => {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
        return res.status(400).json({ error: "Name and email required" });
    }

    const newUser = { id: nextId++, name, email };
    users.push(newUser);

    // Return 201 Created with the created resource
    res.status(201).json(newUser);
});
```

Rules for POST:
- Always return `201 Created` on success
- Include the created resource in the response
- Set `Location` header pointing to the new resource

#### PUT — Replace Resource

```javascript
app.put("/api/users/:id", (req, res) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Not found" });

    // PUT replaces the ENTIRE resource
    users[index] = {
        id: parseInt(req.params.id),
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    res.json(users[index]);
});
```

Rules for PUT:
- Client must send the COMPLETE resource
- Missing fields should be set to default/null
- If resource doesn't exist, some APIs create it (201), others return 404

#### PATCH — Partial Update

```javascript
app.patch("/api/users/:id", (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: "Not found" });

    // PATCH only updates provided fields
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;

    res.json(user);
});
```

#### PUT vs PATCH

```
PUT /users/1       { name: "Avinash", email: "a@test.com", role: "admin" }
                   → Replaces entire user. If you omit "role", it becomes undefined.

PATCH /users/1     { name: "Avinash" }
                   → Only updates name. Email and role stay the same.
```

#### DELETE — Remove Resource

```javascript
app.delete("/api/users/:id", (req, res) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Not found" });

    users.splice(index, 1);

    // Option 1: No content (most common)
    res.status(204).send();

    // Option 2: Return the deleted resource
    // res.json({ message: "Deleted", user: deletedUser });
});
```

---

## HTTP Status Codes

Status codes tell the client **what happened** with their request.

### The 5 Categories

```
1xx — Informational (rare, mostly internal)
2xx — Success ✅
3xx — Redirection ↗️
4xx — Client Error (YOUR fault) ❌
5xx — Server Error (SERVER's fault) 💥
```

### 2xx — Success Codes

| Code | Name | When to Use |
|------|------|-------------|
| **200** | OK | Standard success (GET, PUT, PATCH) |
| **201** | Created | Resource was created (POST) |
| **204** | No Content | Success but nothing to return (DELETE) |
| **202** | Accepted | Request accepted, processing later (async tasks) |

```javascript
// 200 — GET success
app.get("/api/users", (req, res) => {
    res.status(200).json(users); // 200 is default, so .status(200) is optional
});

// 201 — Created
app.post("/api/users", (req, res) => {
    const user = createUser(req.body);
    res.status(201).json(user);
});

// 204 — Deleted, nothing to return
app.delete("/api/users/:id", (req, res) => {
    deleteUser(req.params.id);
    res.status(204).send();
});
```

### 3xx — Redirection Codes

| Code | Name | When to Use |
|------|------|-------------|
| **301** | Moved Permanently | Resource permanently moved (SEO-friendly) |
| **302** | Found | Temporary redirect |
| **304** | Not Modified | Cached version is still valid |
| **307** | Temporary Redirect | Like 302 but preserves HTTP method |
| **308** | Permanent Redirect | Like 301 but preserves HTTP method |

```javascript
// Permanent redirect
app.get("/old-page", (req, res) => {
    res.redirect(301, "/new-page");
});

// Temporary redirect
app.get("/maintenance", (req, res) => {
    res.redirect(302, "/coming-soon");
});
```

### 4xx — Client Error Codes

| Code | Name | When to Use |
|------|------|-------------|
| **400** | Bad Request | Invalid data sent by client |
| **401** | Unauthorized | Not authenticated (who are you?) |
| **403** | Forbidden | Authenticated but not allowed (you can't do this) |
| **404** | Not Found | Resource doesn't exist |
| **405** | Method Not Allowed | Wrong HTTP method for this route |
| **409** | Conflict | Conflicting data (e.g., duplicate email) |
| **422** | Unprocessable Entity | Data format OK, but values invalid |
| **429** | Too Many Requests | Rate limit exceeded |

```javascript
// 400 — Bad request
app.post("/api/users", (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ error: "Email is required" });
    }
});

// 401 — Not authenticated
app.get("/api/profile", (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: "Authentication required" });
    }
});

// 403 — Not authorized
app.delete("/api/users/:id", (req, res) => {
    if (currentUser.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
});

// 404 — Not found
app.get("/api/users/:id", (req, res) => {
    const user = findUser(req.params.id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
});

// 409 — Conflict
app.post("/api/users", (req, res) => {
    if (emailExists(req.body.email)) {
        return res.status(409).json({ error: "Email already registered" });
    }
});

// 429 — Rate limited
// (Usually handled by rate limiter middleware)
```

### 401 vs 403 — The Key Difference

```
401 Unauthorized = "I don't know who you are. Please log in."
                   (No credentials provided, or credentials are invalid)

403 Forbidden    = "I know who you are, but you're not allowed to do this."
                   (Valid credentials, but insufficient permissions)
```

### 5xx — Server Error Codes

| Code | Name | When to Use |
|------|------|-------------|
| **500** | Internal Server Error | Unhandled server error (bug in your code) |
| **502** | Bad Gateway | Proxy got invalid response from upstream |
| **503** | Service Unavailable | Server temporarily down (maintenance) |
| **504** | Gateway Timeout | Upstream server took too long |

```javascript
// 500 — Something went wrong in your code
app.get("/api/data", async (req, res) => {
    try {
        const data = await fetchFromDatabase();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
```

---

## HTTP Headers

Headers are **metadata** sent with requests and responses.

### Common Request Headers

| Header | Purpose | Example |
|--------|---------|---------|
| `Host` | Which server to connect to | `example.com` |
| `Content-Type` | Format of request body | `application/json` |
| `Authorization` | Authentication credentials | `Bearer eyJhbG...` |
| `Accept` | What formats client wants | `application/json` |
| `User-Agent` | Client software info | `Mozilla/5.0...` |
| `Cookie` | Send cookies to server | `session=abc123` |
| `Accept-Language` | Preferred language | `en-US,en;q=0.9` |
| `Accept-Encoding` | Supported compression | `gzip, deflate, br` |
| `Cache-Control` | Caching directives | `no-cache` |
| `If-None-Match` | Conditional request (ETag) | `"abc123"` |
| `Origin` | Request origin (CORS) | `http://localhost:3000` |
| `Referer` | Previous page URL | `https://google.com` |

### Common Response Headers

| Header | Purpose | Example |
|--------|---------|---------|
| `Content-Type` | Format of response body | `application/json; charset=utf-8` |
| `Content-Length` | Body size in bytes | `1234` |
| `Set-Cookie` | Send cookie to client | `token=abc; HttpOnly` |
| `Cache-Control` | How to cache this response | `max-age=3600` |
| `ETag` | Version identifier for caching | `"abc123"` |
| `Location` | Redirect URL | `/api/users/42` |
| `Access-Control-Allow-Origin` | CORS allowed origin | `*` or `http://localhost:3000` |
| `X-RateLimit-Remaining` | Rate limit status | `99` |
| `X-Request-Id` | Unique request identifier | `req_abc123` |

### Working with Headers in Express

```javascript
app.get("/api/data", (req, res) => {
    // ===== READING REQUEST HEADERS =====
    const contentType = req.get("Content-Type");
    const authHeader = req.get("Authorization");
    const userAgent = req.get("User-Agent");
    const allHeaders = req.headers; // Object with all headers

    // ===== SETTING RESPONSE HEADERS =====
    // Single header
    res.set("X-Custom-Header", "my-value");
    res.set("X-Request-Id", `req_${Date.now()}`);

    // Multiple headers at once
    res.set({
        "Cache-Control": "no-cache, no-store",
        "X-Powered-By": "Express",
    });

    // Remove a header
    res.removeHeader("X-Powered-By");

    res.json({ message: "Headers demo" });
});
```

### Custom Headers

Convention: prefix custom headers with `X-`:

```javascript
res.set("X-Total-Count", String(totalUsers));
res.set("X-Request-Id", generateId());
res.set("X-Response-Time", `${Date.now() - startTime}ms`);
```

---

## Content Types & MIME Types

The `Content-Type` header tells the receiver **how to interpret the body**.

### Common MIME Types

| MIME Type | What It Is | Used For |
|-----------|-----------|----------|
| `application/json` | JSON data | APIs (most common) |
| `text/html` | HTML page | Web pages |
| `text/plain` | Plain text | Simple text responses |
| `text/css` | CSS stylesheet | Stylesheets |
| `text/javascript` | JavaScript | Script files |
| `application/xml` | XML data | Legacy APIs, SOAP |
| `multipart/form-data` | File upload | Form with file inputs |
| `application/x-www-form-urlencoded` | Form data | HTML form submissions |
| `application/octet-stream` | Binary data | File downloads |
| `image/png` | PNG image | Images |
| `image/jpeg` | JPEG image | Images |
| `application/pdf` | PDF document | Documents |

### Content-Type in Express

```javascript
// JSON response (Express sets Content-Type automatically)
res.json({ name: "Avinash" });
// Content-Type: application/json; charset=utf-8

// HTML response
res.send("<h1>Hello</h1>");
// Content-Type: text/html; charset=utf-8

// Plain text
res.type("text").send("Hello");
// Content-Type: text/plain; charset=utf-8

// Force specific content type
res.type("application/xml").send("<user><name>Avinash</name></user>");
```

### Parsing Different Content Types

```javascript
// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (from HTML forms)
app.use(express.urlencoded({ extended: true }));

// For file uploads, you need multer (covered in Phase 12)
```

---

## Cookies

Cookies are small pieces of data stored in the browser and **sent with every request** to the same domain.

### How Cookies Work

```
1. Server sends a cookie in the response:
   Set-Cookie: session_id=abc123; HttpOnly; Secure; Max-Age=3600

2. Browser stores the cookie

3. Browser sends the cookie with EVERY subsequent request to that domain:
   Cookie: session_id=abc123
```

### Cookie Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `HttpOnly` | Can't be accessed by JavaScript (prevents XSS) | Essential for security |
| `Secure` | Only sent over HTTPS | Essential for production |
| `SameSite` | CSRF protection | `Strict`, `Lax`, or `None` |
| `Max-Age` | How long the cookie lives (seconds) | `3600` = 1 hour |
| `Expires` | Specific expiration date | `Thu, 01 Jan 2025` |
| `Domain` | Which domain receives the cookie | `.example.com` |
| `Path` | Which path receives the cookie | `/api` |

### Cookies in Express

```bash
npm install cookie-parser
```

```javascript
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// SET a cookie
app.post("/login", (req, res) => {
    res.cookie("session_id", "abc123", {
        httpOnly: true,   // Can't be accessed by JavaScript
        secure: true,     // Only sent over HTTPS
        sameSite: "strict", // CSRF protection
        maxAge: 3600000,  // 1 hour in milliseconds
    });
    res.json({ message: "Logged in" });
});

// READ a cookie
app.get("/profile", (req, res) => {
    const sessionId = req.cookies.session_id;
    console.log(sessionId); // "abc123"
    res.json({ session: sessionId });
});

// DELETE a cookie
app.post("/logout", (req, res) => {
    res.clearCookie("session_id");
    res.json({ message: "Logged out" });
});
```

---

## HTTP Versions

### HTTP/1.0

- One request per TCP connection
- Connection closed after each response
- Very slow for modern websites

### HTTP/1.1 (Most Common Today)

```
Improvements over 1.0:
- Keep-alive connections (reuse TCP connection for multiple requests)
- Pipelining (send multiple requests without waiting)
- Chunked transfer encoding
- Host header (multiple websites on one IP)
- Caching headers (ETag, If-None-Match)
```

### HTTP/2

```
Improvements over 1.1:
- Multiplexing (multiple requests/responses over ONE connection simultaneously)
- Header compression (HPACK)
- Server push (server can send resources before client asks)
- Binary protocol (faster parsing than text-based HTTP/1.1)
- Stream prioritization
```

### HTTP/3

```
Improvements over 2:
- Uses QUIC instead of TCP (built on UDP)
- Faster connection establishment
- Better handling of packet loss
- Built-in encryption (TLS 1.3)
```

### What You Need to Know

As a backend developer:
- Your Express app handles HTTP/1.1 by default
- HTTP/2 and HTTP/3 are typically handled by a **reverse proxy** (Nginx, Cloudflare)
- You don't need to change your code for different HTTP versions

---

## CORS (Cross-Origin Resource Sharing)

### The Problem

Browsers block requests from one origin to another origin by default (Same-Origin Policy).

```
Frontend: http://localhost:3000  (React app)
Backend:  http://localhost:5000  (Express API)

These are DIFFERENT origins → Browser blocks the request!
```

### What is an "Origin"?

```
Origin = Protocol + Domain + Port

http://localhost:3000   → Origin: http://localhost:3000
https://example.com     → Origin: https://example.com
https://api.example.com → Origin: https://api.example.com  (different subdomain = different origin)
```

### How CORS Works

1. Browser sends a **preflight request** (OPTIONS) before the actual request
2. Server responds with CORS headers saying what's allowed
3. If allowed, browser sends the actual request

```
┌──────────┐                      ┌──────────┐
│  BROWSER │ ── OPTIONS /api ───► │  SERVER  │  Preflight: "Can I make this request?"
│          │ ◄── CORS Headers ──  │          │  Response: "Yes, here are the rules"
│          │                      │          │
│          │ ── GET /api/users ─► │          │  Actual request
│          │ ◄── Data ──────────  │          │  Actual response
└──────────┘                      └──────────┘
```

### Setting Up CORS in Express

```bash
npm install cors
```

```javascript
const cors = require("cors");

// Allow ALL origins (development only!)
app.use(cors());

// Allow specific origin(s) (production)
app.use(cors({
    origin: "https://myfrontend.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,               // Allow cookies
    maxAge: 86400,                    // Cache preflight for 24 hours
}));

// Multiple origins
app.use(cors({
    origin: ["https://app.example.com", "https://admin.example.com"],
}));

// Dynamic origin
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = ["https://app.example.com", "https://admin.example.com"];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
}));
```

### CORS Headers Explained

| Header | Purpose |
|--------|---------|
| `Access-Control-Allow-Origin` | Which origins can access the API |
| `Access-Control-Allow-Methods` | Which HTTP methods are allowed |
| `Access-Control-Allow-Headers` | Which request headers are allowed |
| `Access-Control-Allow-Credentials` | Whether cookies can be sent |
| `Access-Control-Max-Age` | How long to cache preflight results |
| `Access-Control-Expose-Headers` | Which response headers the client can read |

---

## Key Takeaways

1. **HTTP Methods** define the action: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)
2. **Idempotent** means repeating the request has the same effect — GET, PUT, DELETE are idempotent
3. **Status Codes** communicate outcomes: 2xx success, 4xx client error, 5xx server error
4. **Headers** carry metadata — Content-Type, Authorization, Cache-Control are the most important
5. **Use 401** for "not logged in", **403** for "not permitted"
6. **Content-Type** tells the receiver how to parse the body — `application/json` for APIs
7. **Cookies** are automatically sent with every request — use HttpOnly + Secure + SameSite
8. **CORS** is a browser security feature — configure it on your server to allow cross-origin requests

---

## Practice Exercises

1. **Header inspector:** Create a middleware that logs all incoming request headers
2. **Content negotiation:** Create a route that returns JSON or HTML based on the `Accept` header
3. **Cookie counter:** Create a page visit counter using cookies
4. **CORS config:** Set up a frontend (even simple HTML) on a different port and configure CORS
5. **Status code quiz:** Create an endpoint that returns different status codes based on query parameters

---

**Previous:** [← Phase 03 — Express.js Fundamentals](Phase-03-ExpressJS-Fundamentals.md)

**Next:** [Phase 05 — Middleware In Depth →](Phase-05-Middleware-In-Depth.md)
