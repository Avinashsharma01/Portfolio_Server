# Phase 10 — Authentication & Authorization

## Table of Contents

- [Authentication vs Authorization](#authentication-vs-authorization)
- [How Authentication Works on the Web](#how-authentication-works-on-the-web)
- [Password Hashing](#password-hashing)
- [Session-Based Authentication](#session-based-authentication)
- [Token-Based Authentication (JWT)](#token-based-authentication-jwt)
- [Building JWT Auth from Scratch](#building-jwt-auth-from-scratch)
- [Refresh Tokens](#refresh-tokens)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [OAuth 2.0 & Social Login](#oauth-20--social-login)
- [Passport.js](#passportjs)
- [Security Best Practices for Auth](#security-best-practices-for-auth)
- [Key Takeaways](#key-takeaways)

---

## Authentication vs Authorization

```
AUTHENTICATION (AuthN)           AUTHORIZATION (AuthZ)
"Who are you?"                   "What can you do?"
├── Login with email/password    ├── Can this user delete posts?
├── Verify identity              ├── Can this user access admin panel?
└── Proves: "I am Avinash"      └── Proves: "Avinash is an admin"

ORDER: Authentication FIRST → Authorization SECOND
You must know WHO someone is before deciding WHAT they can do.
```

### Real-World Analogy

```
Authentication = Showing your ID at the door
Authorization  = The bouncer checking if your name is on the VIP list
```

---

## How Authentication Works on the Web

### The Problem

HTTP is **stateless** — each request is independent. The server doesn't remember who you are.

### Two Solutions

```
1. SESSION-BASED AUTH (Stateful)
   ├── Server stores session data
   ├── Client gets a session ID cookie
   ├── Every request sends the cookie
   └── Server looks up session → knows who you are

2. TOKEN-BASED AUTH (Stateless)
   ├── Server creates a signed token (JWT)
   ├── Client stores the token
   ├── Every request sends the token in headers
   └── Server verifies the token → knows who you are
```

---

## Password Hashing

**NEVER store passwords in plain text.** Always hash them.

### What is Hashing?

```
Hashing is a ONE-WAY function:
"password123" → "$2b$10$XY3k..." → CANNOT reverse back to "password123"

Two properties:
1. Same input always gives same output
2. Cannot reverse the output to get the input
```

### Using bcrypt

```bash
npm install bcryptjs
```

```javascript
const bcrypt = require("bcryptjs");

// Hash a password
const hashPassword = async (plainPassword) => {
    const salt = await bcrypt.genSalt(10);  // 10 rounds of salting
    const hashed = await bcrypt.hash(plainPassword, salt);
    return hashed;
};

// Verify a password
const verifyPassword = async (plainPassword, hashedPassword) => {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch; // true or false
};
```

### What is a Salt?

```
WITHOUT SALT:
"password123" → always hashes to "abc123..."
If two users have "password123", they have the SAME hash.
Attacker can use rainbow tables to crack them.

WITH SALT (random string added):
"password123" + "random_salt_1" → "xyz789..."
"password123" + "random_salt_2" → "def456..."
Same password, DIFFERENT hashes. Rainbow tables won't work.

bcrypt handles salting automatically.
```

---

## Session-Based Authentication

### How Sessions Work

```
1. Client sends login credentials
   POST /login { email, password }

2. Server verifies credentials, creates session
   Session stored in server memory/database
   Session ID sent to client as a cookie

3. Client automatically sends cookie with every request
   Cookie: connect.sid=s%3Aabc123...

4. Server reads cookie, looks up session, knows who you are

5. On logout, server destroys the session
```

### Implementation with express-session

```bash
npm install express-session connect-mongo
```

```javascript
const session = require("express-session");
const MongoStore = require("connect-mongo");

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,                // Can't access from JavaScript
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "strict",            // CSRF protection
    },
}));
```

```javascript
// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // Store user info in session
    req.session.userId = user._id;
    req.session.role = user.role;

    res.json({ success: true, user: { name: user.name, email: user.email } });
});

// Protected route middleware
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
};

// Protected route
app.get("/profile", isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId).select("-password");
    res.json({ success: true, data: user });
});

// Logout
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Logged out" });
    });
});
```

### When to Use Sessions

```
✅ Good for:
├── Server-rendered apps (EJS, Pug)
├── Monolithic applications
├── When you need to revoke access instantly
└── When server-side state management is fine

❌ Not ideal for:
├── REST APIs consumed by mobile apps
├── Microservices (shared sessions are complex)
├── Serverless environments
└── When you need cross-domain auth
```

---

## Token-Based Authentication (JWT)

### What is JWT?

**JWT** (JSON Web Token) is a self-contained token that carries user information.

```
JWT Structure (3 parts separated by dots):

eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
|_____HEADER_____|  |________PAYLOAD________|  |__________SIGNATURE__________|

HEADER:  Algorithm & token type     { "alg": "HS256", "typ": "JWT" }
PAYLOAD: Data (claims)              { "userId": "123", "role": "admin" }
SIGNATURE: Verification             HMAC-SHA256(header + payload, secret)
```

### How JWT Auth Works

```
1. Client sends login credentials
   POST /login { email, password }

2. Server verifies credentials, creates JWT
   JWT = sign({ userId, role }, SECRET)
   Server sends JWT to client

3. Client stores JWT (localStorage, cookie, or memory)
   Client sends JWT in Authorization header with every request
   Authorization: Bearer eyJhbGciOiJ...

4. Server verifies JWT signature
   If valid → extract user info → process request
   If invalid/expired → reject with 401

5. No server-side storage needed (stateless!)
```

---

## Building JWT Auth from Scratch

```bash
npm install jsonwebtoken bcryptjs
```

### User Model

```javascript
// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

### JWT Helper Functions

```javascript
// utils/jwt.js
const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};

const verifyToken = (token, secret) => {
    return jwt.verify(token, secret);
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
```

### Auth Controller

```javascript
// controllers/authController.js
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
    }

    // Create user (password hashed by pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Send refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
        success: true,
        data: { user: { id: user._id, name: user.name, email: user.email } },
        accessToken,
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
        success: true,
        data: { user: { id: user._id, name: user.name, email: user.email } },
        accessToken,
    });
};

exports.logout = (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out" });
};
```

### Auth Middleware

```javascript
// middleware/auth.js
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ error: "Not authorized, no token" });
    }

    try {
        const decoded = verifyToken(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select("-password");

        if (!req.user) {
            return res.status(401).json({ error: "User no longer exists" });
        }

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        return res.status(401).json({ error: "Not authorized, invalid token" });
    }
};

module.exports = { protect };
```

### Routes

```javascript
// routes/authRoutes.js
const router = require("express").Router();
const { register, login, logout } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
```

```javascript
// routes/userRoutes.js
const router = require("express").Router();
const { protect } = require("../middleware/auth");

router.get("/profile", protect, async (req, res) => {
    res.json({ success: true, data: req.user });
});

module.exports = router;
```

---

## Refresh Tokens

Access tokens expire quickly (15 min). Refresh tokens allow getting new access tokens without re-logging in.

```
Access Token:  Short-lived (15 min), sent with every request
Refresh Token: Long-lived (7 days), sent only to /refresh endpoint, stored as httpOnly cookie

FLOW:
1. Login → Get access token + refresh token
2. Use access token for API calls
3. Access token expires → 401 error
4. Client sends refresh token to /refresh
5. Server verifies refresh token → issues new access token
6. Continue using new access token
```

```javascript
// Refresh endpoint
exports.refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token" });
    }

    try {
        const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const newAccessToken = generateAccessToken(user._id);
        res.json({ success: true, accessToken: newAccessToken });
    } catch (error) {
        res.clearCookie("refreshToken");
        return res.status(401).json({ error: "Invalid refresh token" });
    }
};
```

---

## Role-Based Access Control (RBAC)

### Authorize Middleware

```javascript
// middleware/auth.js

// Check if user has required role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
```

### Using in Routes

```javascript
const { protect, authorize } = require("../middleware/auth");

// Any authenticated user
router.get("/profile", protect, getProfile);

// Only admin
router.get("/admin/dashboard", protect, authorize("admin"), getDashboard);

// Admin or moderator
router.delete("/posts/:id", protect, authorize("admin", "moderator"), deletePost);

// Only the user themselves (resource-based auth)
router.put("/users/:id", protect, async (req, res, next) => {
    if (req.user._id.toString() !== req.params.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Not authorized to update this user" });
    }
    next();
}, updateUser);
```

### Permission-Based (Advanced)

```javascript
const permissions = {
    admin: ["read", "write", "delete", "manage_users"],
    moderator: ["read", "write", "delete"],
    user: ["read", "write"],
    guest: ["read"],
};

const hasPermission = (permission) => {
    return (req, res, next) => {
        const userPermissions = permissions[req.user.role] || [];
        if (!userPermissions.includes(permission)) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    };
};

// Usage
router.delete("/posts/:id", protect, hasPermission("delete"), deletePost);
router.get("/admin/users", protect, hasPermission("manage_users"), getAllUsers);
```

---

## OAuth 2.0 & Social Login

### How OAuth 2.0 Works

```
1. User clicks "Login with Google"
2. User is redirected to Google's login page
3. User logs in with Google
4. Google redirects back to YOUR app with an authorization code
5. Your server exchanges code for access token from Google
6. Your server uses token to get user info from Google
7. Your server creates/finds user in YOUR database
8. Your server creates a JWT for the user

YOUR APP ←→ GOOGLE (or GitHub, Facebook, etc.)
You never see the user's Google password!
```

### OAuth 2.0 Flow Diagram

```
┌─────────┐     ┌─────────────┐     ┌──────────┐
│  Client  │     │  Your Server │     │  Google  │
│ (Browser)│     │  (Express)   │     │  (OAuth) │
└────┬─────┘     └──────┬───────┘     └────┬─────┘
     │  Click "Login     │                  │
     │  with Google"     │                  │
     ├──────────────────►│                  │
     │                   │  Redirect to     │
     │◄──────────────────┤  Google login    │
     │                   │                  │
     ├──────────────────────────────────────►
     │                   │  User logs in    │
     │◄─────────────────────────────────────┤
     │  Redirect with    │                  │
     │  auth code        │                  │
     ├──────────────────►│                  │
     │                   │  Exchange code   │
     │                   │  for token       │
     │                   ├─────────────────►│
     │                   │◄─────────────────┤
     │                   │  Access token    │
     │                   │                  │
     │                   │  Get user info   │
     │                   ├─────────────────►│
     │                   │◄─────────────────┤
     │                   │  { name, email } │
     │  JWT token        │                  │
     │◄──────────────────┤                  │
     │                   │                  │
```

---

## Passport.js

**Passport.js** is authentication middleware for Node.js with 500+ strategies.

```bash
npm install passport passport-local passport-jwt passport-google-oauth20
```

### Local Strategy (Email/Password)

```javascript
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

passport.use(new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password",
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email }).select("+password");
            if (!user) return done(null, false, { message: "Invalid credentials" });

            const isMatch = await user.comparePassword(password);
            if (!isMatch) return done(null, false, { message: "Invalid credentials" });

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));
```

### JWT Strategy

```javascript
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
        try {
            const user = await User.findById(payload.userId);
            if (!user) return done(null, false);
            done(null, user);
        } catch (error) {
            done(error, false);
        }
    }
));
```

### Google OAuth Strategy

```javascript
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find or create user
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0]?.value,
                });
            }

            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }
));

// Routes
app.get("/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/api/auth/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const token = generateAccessToken(req.user._id);
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    }
);
```

---

## Security Best Practices for Auth

### 1. Password Requirements

```javascript
const passwordSchema = {
    type: String,
    required: true,
    minlength: 8,
    validate: {
        validator: function(v) {
            // At least: 1 uppercase, 1 lowercase, 1 number
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
        },
        message: "Password must have uppercase, lowercase, and a number",
    },
};
```

### 2. Rate Limit Login Attempts

```javascript
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                    // 5 attempts
    message: { error: "Too many login attempts, try again in 15 minutes" },
    standardHeaders: true,
});

app.post("/api/auth/login", loginLimiter, login);
```

### 3. Token Storage

```
WHERE TO STORE TOKENS:

httpOnly Cookie (RECOMMENDED for web apps):
├── ✅ Cannot be accessed by JavaScript (XSS safe)
├── ✅ Automatically sent with requests
├── ⚠️ Needs CSRF protection
└── Best for: Server-rendered apps, same-domain APIs

In-Memory (JavaScript variable):
├── ✅ Most secure against XSS and CSRF
├── ❌ Lost on page refresh
└── Best for: SPAs with refresh token in httpOnly cookie

localStorage / sessionStorage:
├── ⚠️ Accessible by JavaScript (XSS risk)
├── ✅ Persists across sessions (localStorage)
└── Best for: Quick prototyping only
```

### 4. Password Reset Flow

```javascript
const crypto = require("crypto");

// Generate reset token
exports.forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        // Don't reveal if email exists
        return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email with reset link (pseudocode)
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail(user.email, "Password Reset", `Reset your password: ${resetURL}`);

    res.json({ message: "If the email exists, a reset link has been sent" });
};

// Reset password
exports.resetPassword = async (req, res) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
};
```

### 5. Security Checklist

```
✅ Hash passwords with bcrypt (10+ rounds)
✅ Use HTTPS in production
✅ Set httpOnly and secure flags on cookies
✅ Implement rate limiting on auth endpoints
✅ Use short-lived access tokens (15 min)
✅ Store refresh tokens in httpOnly cookies
✅ Invalidate tokens on password change
✅ Don't reveal if an email is registered (forgot password)
✅ Implement account lockout after failed attempts
✅ Use CSRF tokens for cookie-based auth
✅ Validate and sanitize all inputs
✅ Log authentication events (login, failed login, password changes)
```

---

## Key Takeaways

1. **Authentication = Who are you?** Authorization = What can you do?
2. **Never store plain text passwords** — always hash with bcrypt
3. **Sessions are stateful**, JWT is stateless — choose based on your architecture
4. **JWT = Header.Payload.Signature** — the signature prevents tampering
5. **Access tokens should be short-lived** (15 min), refresh tokens longer (7 days)
6. **Store tokens in httpOnly cookies** when possible
7. **RBAC** lets you control access based on user roles
8. **OAuth 2.0** lets users log in with Google, GitHub, etc. without sharing passwords
9. **Rate limit login endpoints** to prevent brute force attacks
10. **Security is layers** — no single measure is enough

---

## Practice Exercises

1. **Basic auth:** Build register/login/logout with email & password using JWT
2. **Protected routes:** Create middleware that protects routes and verifies JWT
3. **Refresh tokens:** Implement refresh token rotation
4. **RBAC:** Add admin, moderator, and user roles with different permissions
5. **Google OAuth:** Set up "Login with Google" using Passport.js
6. **Password reset:** Build forgot password and reset password flows with email

---

**Previous:** [← Phase 09 — Database Fundamentals](Phase-09-Database-Fundamentals.md)

**Next:** [Phase 11 — Error Handling & Logging →](Phase-11-Error-Handling-Logging.md)
