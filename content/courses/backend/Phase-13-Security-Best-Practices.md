# Phase 13 — Security Best Practices

## Table of Contents

- [Why Security Matters](#why-security-matters)
- [OWASP Top 10](#owasp-top-10)
- [Injection Attacks](#injection-attacks)
- [Cross-Site Scripting (XSS)](#cross-site-scripting-xss)
- [Cross-Site Request Forgery (CSRF)](#cross-site-request-forgery-csrf)
- [CORS (Cross-Origin Resource Sharing)](#cors-cross-origin-resource-sharing)
- [Helmet — Security Headers](#helmet--security-headers)
- [Rate Limiting](#rate-limiting)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [Data Exposure](#data-exposure)
- [Dependency Security](#dependency-security)
- [HTTPS & TLS](#https--tls)
- [Security Checklist](#security-checklist)
- [Key Takeaways](#key-takeaways)

---

## Why Security Matters

```
A single vulnerability can lead to:
├── Data breach (user data stolen)
├── Financial loss (fines, lawsuits)
├── Reputation damage (trust destroyed)
├── Service disruption (DDoS, ransomware)
└── Legal consequences (GDPR, HIPAA violations)

Security is NOT optional. It's a fundamental requirement.
```

---

## OWASP Top 10

The **OWASP Top 10** is the most important list of web application security risks.

| # | Risk | Description |
|---|------|-------------|
| 1 | **Broken Access Control** | Users accessing things they shouldn't |
| 2 | **Cryptographic Failures** | Weak encryption, exposed sensitive data |
| 3 | **Injection** | SQL injection, NoSQL injection, command injection |
| 4 | **Insecure Design** | Missing security controls in design |
| 5 | **Security Misconfiguration** | Default configs, unnecessary features enabled |
| 6 | **Vulnerable Components** | Using libraries with known vulnerabilities |
| 7 | **Auth Failures** | Broken authentication, weak passwords |
| 8 | **Data Integrity Failures** | Untrusted data, insecure deserialization |
| 9 | **Logging Failures** | Not logging security events |
| 10 | **SSRF** | Server making requests to unintended locations |

---

## Injection Attacks

### SQL Injection

```javascript
// ❌ VULNERABLE — user input directly in SQL
app.get("/users", async (req, res) => {
    const query = `SELECT * FROM users WHERE name = '${req.query.name}'`;
    // If name = "'; DROP TABLE users; --" → TABLE DELETED!
    const result = await pool.query(query);
    res.json(result.rows);
});

// ✅ SAFE — parameterized queries
app.get("/users", async (req, res) => {
    const query = "SELECT * FROM users WHERE name = $1";
    const result = await pool.query(query, [req.query.name]);
    res.json(result.rows);
});
```

### NoSQL Injection

```javascript
// ❌ VULNERABLE — user input as query object
app.post("/login", async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
        password: req.body.password,
    });
    // If password = { "$gt": "" } → matches any password!
});

// ✅ SAFE — validate and sanitize input types
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize()); // Removes $ and . from user input

// Also validate types manually:
app.post("/login", async (req, res) => {
    if (typeof req.body.email !== "string" || typeof req.body.password !== "string") {
        return res.status(400).json({ error: "Invalid input" });
    }
    // ... proceed safely
});
```

### Command Injection

```javascript
// ❌ VULNERABLE — user input in shell command
const { exec } = require("child_process");
app.get("/ping", (req, res) => {
    exec(`ping ${req.query.host}`, (error, stdout) => {
        res.send(stdout);
    });
    // If host = "google.com; rm -rf /" → DISASTER!
});

// ✅ SAFE — use execFile with arguments array
const { execFile } = require("child_process");
app.get("/ping", (req, res) => {
    execFile("ping", ["-c", "4", req.query.host], (error, stdout) => {
        res.send(stdout);
    });
    // Arguments are escaped automatically
});

// Even better: validate input
const isValidHostname = (host) => /^[a-zA-Z0-9.-]+$/.test(host);
```

---

## Cross-Site Scripting (XSS)

XSS attacks inject malicious JavaScript into pages viewed by other users.

### Types of XSS

```
Stored XSS:    Malicious script saved in database, served to all users
Reflected XSS: Script in URL, reflected back in response
DOM-based XSS: Script manipulates the DOM in the browser
```

### Prevention

```javascript
// 1. Sanitize user input
const xss = require("xss");

app.post("/api/posts", async (req, res) => {
    const post = await Post.create({
        title: xss(req.body.title),      // Strips HTML/JS
        content: xss(req.body.content),
    });
    res.status(201).json(post);
});

// 2. Use Helmet for Content-Security-Policy
const helmet = require("helmet");
app.use(helmet()); // Sets CSP and other security headers

// 3. Escape output in templates (EJS auto-escapes with <%= %>)
// ✅ Safe: <%= user.name %>  (escaped)
// ❌ Unsafe: <%- user.name %> (raw — only use for trusted HTML)

// 4. Set httpOnly cookies (JavaScript can't access)
res.cookie("token", jwt, { httpOnly: true });
```

---

## Cross-Site Request Forgery (CSRF)

CSRF tricks a logged-in user's browser into making unwanted requests.

```
1. User is logged into your-bank.com (has session cookie)
2. User visits evil-site.com
3. Evil site has: <img src="https://your-bank.com/transfer?to=hacker&amount=10000">
4. Browser sends request WITH the user's cookies → Money transferred!
```

### Prevention

```bash
npm install csurf
```

```javascript
// For server-rendered apps (sessions + cookies)
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Include CSRF token in forms
app.get("/form", (req, res) => {
    res.render("form", { csrfToken: req.csrfToken() });
});

// In your EJS template:
// <input type="hidden" name="_csrf" value="<%= csrfToken %>">
```

```javascript
// For SPAs with JWT in Authorization header:
// CSRF is not a concern because:
// - Authorization header is NOT sent automatically by the browser
// - Only your JavaScript code sets it explicitly
// - Evil sites can't add Authorization headers to cross-origin requests
```

### SameSite Cookies

```javascript
// Modern CSRF protection: SameSite cookie attribute
res.cookie("sessionId", value, {
    httpOnly: true,
    secure: true,
    sameSite: "strict", // Cookie only sent for same-site requests
    // "lax"  — sent for top-level navigation (default)
    // "none" — sent for all requests (requires secure: true)
});
```

---

## CORS (Cross-Origin Resource Sharing)

### What is CORS?

```
Same Origin:    https://example.com →  https://example.com/api  ✅ Allowed
Cross Origin:   https://frontend.com → https://api.backend.com  ❌ Blocked by browser

CORS is a browser security feature that blocks cross-origin requests
unless the server explicitly allows them.
```

### Configuring CORS

```bash
npm install cors
```

```javascript
const cors = require("cors");

// ❌ Allow all origins (fine for dev, dangerous for prod)
app.use(cors());

// ✅ Restrict to specific origins
app.use(cors({
    origin: ["https://myapp.com", "https://admin.myapp.com"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,     // Allow cookies
    maxAge: 86400,         // Cache preflight for 24 hours
}));

// Dynamic origin (check against allowed list)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
```

### Per-Route CORS

```javascript
// Only allow CORS on specific routes
app.get("/api/public", cors(), publicHandler);
app.post("/api/private", privateHandler); // No CORS — same-origin only
```

---

## Helmet — Security Headers

**Helmet** sets various HTTP security headers.

```bash
npm install helmet
```

```javascript
const helmet = require("helmet");
app.use(helmet());
```

### What Helmet Sets

| Header | What it Does |
|--------|-------------|
| `Content-Security-Policy` | Prevents XSS by controlling resource loading |
| `X-Content-Type-Options` | Prevents MIME type sniffing |
| `X-Frame-Options` | Prevents clickjacking (iframe embedding) |
| `Strict-Transport-Security` | Forces HTTPS |
| `X-XSS-Protection` | Legacy XSS protection |
| `Referrer-Policy` | Controls referrer information |
| `X-DNS-Prefetch-Control` | Controls DNS prefetching |
| `X-Permitted-Cross-Domain-Policies` | Controls Adobe Flash/PDF cross-domain |

### Custom Configuration

```javascript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "*.amazonaws.com"],
        },
    },
    crossOriginEmbedderPolicy: false, // Disable if serving images from CDN
}));
```

---

## Rate Limiting

Prevent abuse and brute force attacks.

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require("express-rate-limit");

// Global rate limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requests per windowMs
    message: {
        error: "Too many requests, please try again later",
    },
    standardHeaders: true,     // Return rate limit info in headers
    legacyHeaders: false,
});

app.use("/api", globalLimiter);

// Strict limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,                    // Only 5 login attempts per 15 min
    message: { error: "Too many login attempts" },
    skipSuccessfulRequests: true, // Don't count successful logins
});

app.use("/api/auth/login", authLimiter);

// Account creation limiter
const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 3,                     // 3 accounts per hour per IP
    message: { error: "Too many accounts created" },
});

app.use("/api/auth/register", createAccountLimiter);
```

### Advanced: Redis-Based Rate Limiting

```bash
npm install rate-limit-redis ioredis
```

```javascript
const RedisStore = require("rate-limit-redis").default;
const Redis = require("ioredis");

const redisClient = new Redis(process.env.REDIS_URL);

const limiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
    windowMs: 15 * 60 * 1000,
    max: 100,
});
```

---

## Input Validation & Sanitization

### Golden Rule

```
NEVER trust user input. ALWAYS validate and sanitize.

Validation = Is this the right FORMAT? (type, length, pattern)
Sanitization = CLEAN the input (trim, escape, remove dangerous characters)
```

### Comprehensive Validation

```javascript
const { body, param, query } = require("express-validator");

const userValidation = {
    create: [
        body("name")
            .trim()
            .notEmpty().withMessage("Name is required")
            .isLength({ min: 2, max: 50 }).withMessage("Name: 2-50 chars")
            .escape(), // Escape HTML entities

        body("email")
            .isEmail().withMessage("Invalid email")
            .normalizeEmail(),

        body("password")
            .isLength({ min: 8 }).withMessage("Min 8 characters")
            .matches(/[A-Z]/).withMessage("Need uppercase letter")
            .matches(/[a-z]/).withMessage("Need lowercase letter")
            .matches(/\d/).withMessage("Need a number"),

        body("age")
            .optional()
            .isInt({ min: 13, max: 150 }).withMessage("Age: 13-150"),

        body("website")
            .optional()
            .isURL({ protocols: ["http", "https"], require_protocol: true })
            .withMessage("Must be a valid URL"),
    ],

    getById: [
        param("id").isMongoId().withMessage("Invalid user ID"),
    ],

    list: [
        query("page").optional().isInt({ min: 1 }).toInt(),
        query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
        query("sort").optional().isIn(["name", "-name", "createdAt", "-createdAt"]),
    ],
};
```

### Sanitize MongoDB Queries

```bash
npm install express-mongo-sanitize
```

```javascript
const mongoSanitize = require("express-mongo-sanitize");

// Remove any keys starting with $ or containing .
app.use(mongoSanitize());

// With replacement instead of removal
app.use(mongoSanitize({ replaceWith: "_" }));
```

### Sanitize HTML

```bash
npm install xss
```

```javascript
const xss = require("xss");

// Sanitize rich text content
const cleanContent = xss(req.body.content, {
    whiteList: {
        p: [], b: [], i: [], u: [],
        a: ["href", "title", "target"],
        img: ["src", "alt"],
        h1: [], h2: [], h3: [],
        ul: [], ol: [], li: [],
        br: [],
    },
    stripIgnoreTag: true,
});
```

---

## Data Exposure

### Never Expose Sensitive Data

```javascript
// ❌ Exposes everything including password
app.get("/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user); // { name, email, password, __v, ... }
});

// ✅ Explicitly select safe fields
app.get("/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id).select("name email avatar");
    res.json(user);
});

// ✅ Or use toJSON transform in the model
userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});
```

### Hide Error Details in Production

```javascript
// Development: full details
// Production: generic message

const errorHandler = (err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        error: err.isOperational ? err.message : "Internal server error",
        // Only show stack in development
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
```

### Environment Variables

```bash
# .env — NEVER commit this file
JWT_SECRET=your-super-secret-key
DB_PASSWORD=your-database-password
AWS_SECRET_ACCESS_KEY=your-aws-key
```

```bash
# .gitignore
.env
.env.local
.env.production
```

---

## Dependency Security

### Audit Dependencies

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Force fix (may include breaking changes)
npm audit fix --force
```

### Keep Dependencies Updated

```bash
# Check outdated packages
npm outdated

# Update to latest minor/patch versions
npm update

# Use tools for major updates
npx npm-check-updates -u  # Updates package.json
npm install               # Installs updated versions
```

### Lock File

```
Always commit package-lock.json
├── Ensures everyone installs exact same versions
├── Prevents supply chain attacks
└── Makes builds reproducible
```

---

## HTTPS & TLS

### Why HTTPS?

```
HTTP:  Data sent in PLAIN TEXT → Anyone can intercept
HTTPS: Data ENCRYPTED with TLS → Only sender and receiver can read

HTTPS provides:
├── Encryption — data can't be read by middlemen
├── Authentication — proves server identity
└── Integrity — data can't be tampered with
```

### Force HTTPS in Production

```javascript
// Redirect HTTP to HTTPS (behind a reverse proxy)
app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https" && process.env.NODE_ENV === "production") {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// Trust proxy (if behind nginx, load balancer)
app.set("trust proxy", 1);
```

---

## Security Checklist

```
INPUT:
☐ Validate all user input (type, length, format)
☐ Sanitize input (escape HTML, strip dangerous chars)
☐ Use parameterized queries (prevent SQL/NoSQL injection)
☐ Never use eval() or Function() with user input

AUTHENTICATION:
☐ Hash passwords with bcrypt (10+ rounds)
☐ Implement rate limiting on auth endpoints
☐ Use secure session/token management
☐ Enforce strong passwords

HEADERS & TRANSPORT:
☐ Use Helmet for security headers
☐ Configure CORS properly
☐ Use HTTPS everywhere
☐ Set secure, httpOnly, sameSite on cookies

DATA:
☐ Never expose passwords, tokens, or keys
☐ Use environment variables for secrets
☐ Limit response data to what's needed
☐ Encrypt sensitive data at rest

DEPENDENCIES:
☐ Run npm audit regularly
☐ Keep packages updated
☐ Commit package-lock.json
☐ Review dependencies before installing

MONITORING:
☐ Log security events (failed logins, etc.)
☐ Set up alerts for suspicious activity
☐ Monitor for DDoS/abuse patterns
☐ Have an incident response plan
```

---

## Key Takeaways

1. **Never trust user input** — validate and sanitize everything
2. **Parameterized queries** prevent injection attacks
3. **Helmet** adds essential security headers with one line
4. **CORS** should whitelist specific origins in production
5. **Rate limiting** prevents brute force and abuse
6. **XSS prevention** = sanitize input + CSP headers + httpOnly cookies
7. **CSRF protection** = SameSite cookies + CSRF tokens (for cookie-based auth)
8. **Never expose sensitive data** in responses or error messages
9. **Keep dependencies updated** and audit regularly
10. **Security is defense in depth** — multiple layers, not one silver bullet

---

## Practice Exercises

1. **Security audit:** Review an existing Express app for security vulnerabilities
2. **Helmet + CORS:** Configure Helmet and CORS for a production API
3. **Rate limiting:** Implement rate limiting with different limits per endpoint
4. **Input validation:** Add comprehensive validation to all endpoints using Joi or express-validator
5. **Injection prevention:** Test and prevent SQL/NoSQL injection in your app
6. **Security headers:** Inspect your API's headers with securityheaders.com

---

**Previous:** [← Phase 12 — File Uploads & Streams](Phase-12-File-Uploads-Streams.md)

**Next:** [Phase 14 — Testing Backend →](Phase-14-Testing-Backend.md)
