# Phase 5: Security Best Practices

## 📖 Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Data Validation & Sanitization](#data-validation--sanitization)
3. [Encryption & Hashing](#encryption--hashing)
4. [Connection Security](#connection-security)
5. [Input Validation](#input-validation)
6. [Rate Limiting & DoS Protection](#rate-limiting--dos-protection)
7. [Audit Logging](#audit-logging)
8. [Security Headers](#security-headers)

## Authentication & Authorization

### JWT Authentication Implementation

```javascript
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// User schema with security features
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        select: false, // Don't include in queries by default
    },
    role: {
        type: String,
        enum: ["user", "admin", "moderator"],
        default: "user",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: Date,
    refreshTokens: [
        {
            token: String,
            createdAt: { type: Date, default: Date.now },
            expiresAt: Date,
            userAgent: String,
            ipAddress: String,
        },
    ],
    twoFactorSecret: String,
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    lastLogin: Date,
    passwordChangedAt: Date,
});

// Password hashing middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        this.passwordChangedAt = new Date();
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT tokens
userSchema.methods.generateTokens = function () {
    const accessToken = jwt.sign(
        {
            userId: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

// Check if account is locked
userSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
    const maxAttempts = 5;
    const lockTime = 30 * 60 * 1000; // 30 minutes

    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 },
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
        updates.$set = { lockUntil: Date.now() + lockTime };
    }

    return this.updateOne(updates);
};

const User = mongoose.model("User", userSchema);
```

### Role-Based Access Control (RBAC)

```javascript
// Permission system
const permissions = {
    // User permissions
    "user:read": ["user", "admin", "moderator"],
    "user:update": ["user", "admin"],
    "user:delete": ["admin"],

    // Post permissions
    "post:create": ["user", "admin", "moderator"],
    "post:read": ["user", "admin", "moderator"],
    "post:update": ["admin", "moderator"],
    "post:delete": ["admin"],

    // Admin permissions
    "admin:users": ["admin"],
    "admin:system": ["admin"],
};

// Authorization middleware
const authorize = (permission) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        if (
            !permissions[permission] ||
            !permissions[permission].includes(userRole)
        ) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions",
            });
        }

        next();
    };
};

// Resource-based authorization
const authorizeResource = (resourceType) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id;
            const userId = req.user.userId;
            const userRole = req.user.role;

            // Admins can access everything
            if (userRole === "admin") {
                return next();
            }

            // Check resource ownership
            let resource;
            switch (resourceType) {
                case "post":
                    resource = await Post.findById(resourceId);
                    if (resource && resource.author.toString() === userId) {
                        return next();
                    }
                    break;
                case "user":
                    if (resourceId === userId) {
                        return next();
                    }
                    break;
            }

            return res.status(403).json({
                success: false,
                message: "Access denied to this resource",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Authorization check failed",
            });
        }
    };
};

// Usage in routes
app.get("/api/users", authenticate, authorize("user:read"), getUsers);
app.delete(
    "/api/users/:id",
    authenticate,
    authorize("user:delete"),
    deleteUser
);
app.put("/api/posts/:id", authenticate, authorizeResource("post"), updatePost);
```

### Two-Factor Authentication

```javascript
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

// Enable 2FA for user
const enable2FA = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `MyApp (${req.user.email})`,
            issuer: "MyApp",
        });

        // Save secret to user (temporarily)
        await User.findByIdAndUpdate(userId, {
            twoFactorSecret: secret.base32,
        });

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        res.json({
            success: true,
            secret: secret.base32,
            qrCode: qrCodeUrl,
            manualEntryKey: secret.base32,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to enable 2FA",
        });
    }
};

// Verify 2FA token
const verify2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user.twoFactorSecret) {
            return res.status(400).json({
                success: false,
                message: "2FA not set up for this user",
            });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: token,
            window: 1, // Allow 1 time step of tolerance
        });

        if (verified) {
            // Enable 2FA for user
            await User.findByIdAndUpdate(userId, {
                twoFactorEnabled: true,
            });

            res.json({
                success: true,
                message: "2FA enabled successfully",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid 2FA token",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to verify 2FA token",
        });
    }
};

// Middleware to check 2FA
const require2FA = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);

        if (user.twoFactorEnabled && !req.user.twoFactorVerified) {
            return res.status(403).json({
                success: false,
                message: "2FA verification required",
                require2FA: true,
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Authentication check failed",
        });
    }
};
```

## Data Validation & Sanitization

### Input Sanitization

```javascript
const validator = require("validator");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss");

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Remove any keys that start with $ or contain .
    req.body = mongoSanitize.sanitize(req.body);
    req.query = mongoSanitize.sanitize(req.query);
    req.params = mongoSanitize.sanitize(req.params);

    // Sanitize string inputs
    const sanitizeObject = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === "string") {
                obj[key] = xss(obj[key]);
                obj[key] = validator.escape(obj[key]);
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
                sanitizeObject(obj[key]);
            }
        }
    };

    sanitizeObject(req.body);

    next();
};

// Custom validation functions
const secureValidators = {
    email: (email) => {
        return (
            validator.isEmail(email) &&
            email.length <= 254 &&
            !email.includes("<") &&
            !email.includes(">")
        );
    },

    password: (password) => {
        return (
            password.length >= 8 &&
            password.length <= 128 &&
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
                password
            )
        );
    },

    username: (username) => {
        return (
            /^[a-zA-Z0-9_]{3,20}$/.test(username) &&
            !["admin", "root", "system"].includes(username.toLowerCase())
        );
    },

    url: (url) => {
        return validator.isURL(url, {
            protocols: ["http", "https"],
            require_protocol: true,
            host_whitelist: ["example.com", "trusted-domain.com"],
        });
    },
};
```

### SQL Injection Prevention

```javascript
// Although MongoDB doesn't use SQL, NoSQL injection is still possible
// Use these practices to prevent NoSQL injection:

// 1. Always use parameterized queries
const findUserByEmail = async (email) => {
    // BAD: String concatenation
    // const query = `{ "email": "${email}" }`;

    // GOOD: Parameterized query
    return await User.findOne({ email: email });
};

// 2. Validate input types
const getUserById = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID format",
        });
    }

    try {
        const user = await User.findById(id);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
};

// 3. Use strict schemas
const strictUserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            validate: {
                validator: secureValidators.email,
                message: "Invalid email format",
            },
        },
        age: {
            type: Number,
            min: 0,
            max: 150,
            validate: {
                validator: Number.isInteger,
                message: "Age must be an integer",
            },
        },
    },
    {
        strict: true, // Reject unknown fields
        strictQuery: true, // Apply strict mode to queries
    }
);
```

## Encryption & Hashing

### Field-Level Encryption

```javascript
const crypto = require("crypto");

// Encryption utility
class FieldEncryption {
    constructor(algorithm = "aes-256-gcm") {
        this.algorithm = algorithm;
        this.secretKey = crypto.scryptSync(
            process.env.ENCRYPTION_KEY,
            "salt",
            32
        );
    }

    encrypt(text) {
        if (!text) return text;

        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipher(this.algorithm, this.secretKey, {
            iv,
        });

        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        const authTag = cipher.getAuthTag();

        return {
            encrypted,
            iv: iv.toString("hex"),
            authTag: authTag.toString("hex"),
        };
    }

    decrypt(encryptedData) {
        if (!encryptedData || typeof encryptedData !== "object") {
            return encryptedData;
        }

        const { encrypted, iv, authTag } = encryptedData;
        const decipher = crypto.createDecipher(this.algorithm, this.secretKey, {
            iv: Buffer.from(iv, "hex"),
        });

        decipher.setAuthTag(Buffer.from(authTag, "hex"));

        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    }
}

const fieldEncryption = new FieldEncryption();

// Schema with encrypted fields
const patientSchema = new mongoose.Schema({
    name: String,
    email: String,

    // Encrypted sensitive data
    socialSecurityNumber: {
        type: mongoose.Schema.Types.Mixed,
        set: function (value) {
            return fieldEncryption.encrypt(value);
        },
        get: function (value) {
            return fieldEncryption.decrypt(value);
        },
    },

    medicalHistory: {
        type: mongoose.Schema.Types.Mixed,
        set: function (value) {
            return fieldEncryption.encrypt(JSON.stringify(value));
        },
        get: function (value) {
            const decrypted = fieldEncryption.decrypt(value);
            return decrypted ? JSON.parse(decrypted) : null;
        },
    },
});
```

### Password Security

```javascript
const argon2 = require("argon2");
const zxcvbn = require("zxcvbn");

// Advanced password hashing with Argon2
const hashPassword = async (password) => {
    try {
        return await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16, // 64 MB
            timeCost: 3,
            parallelism: 1,
        });
    } catch (error) {
        throw new Error("Password hashing failed");
    }
};

// Password strength validation
const validatePasswordStrength = (password) => {
    const result = zxcvbn(password);

    return {
        score: result.score, // 0-4
        isStrong: result.score >= 3,
        feedback: result.feedback,
        crackTime:
            result.crack_times_display.offline_slow_hashing_1e4_per_second,
    };
};

// Password policy enforcement
const passwordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    preventCommon: true,
    preventPersonalInfo: true,
};

const enforcePasswordPolicy = (password, userInfo = {}) => {
    const errors = [];

    if (password.length < passwordPolicy.minLength) {
        errors.push(
            `Password must be at least ${passwordPolicy.minLength} characters`
        );
    }

    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    if (
        passwordPolicy.requireSymbols &&
        !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
        errors.push("Password must contain at least one special character");
    }

    // Check against common passwords
    if (passwordPolicy.preventCommon) {
        const strength = validatePasswordStrength(password);
        if (strength.score < 2) {
            errors.push("Password is too common or predictable");
        }
    }

    // Check against personal information
    if (passwordPolicy.preventPersonalInfo && userInfo) {
        const personalInfo = [
            userInfo.firstName,
            userInfo.lastName,
            userInfo.email?.split("@")[0],
            userInfo.username,
        ].filter(Boolean);

        for (const info of personalInfo) {
            if (password.toLowerCase().includes(info.toLowerCase())) {
                errors.push("Password cannot contain personal information");
                break;
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
```

## Connection Security

### TLS/SSL Configuration

```javascript
// Secure MongoDB connection
const connectSecurely = async () => {
    const options = {
        // SSL/TLS configuration
        ssl: true,
        sslValidate: true,
        sslCA: fs.readFileSync("./certs/ca-cert.pem"),
        sslCert: fs.readFileSync("./certs/client-cert.pem"),
        sslKey: fs.readFileSync("./certs/client-key.pem"),

        // Authentication
        authSource: "admin",
        authMechanism: "SCRAM-SHA-256",

        // Network security
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 5,

        // Additional security options
        readPreference: "primary",
        readConcern: { level: "majority" },
        writeConcern: { w: "majority", j: true },
    };

    try {
        await mongoose.connect(process.env.MONGODB_SECURE_URI, options);
        console.log("Secure MongoDB connection established");
    } catch (error) {
        console.error("Secure connection failed:", error);
        process.exit(1);
    }
};

// IP whitelist for database access
const allowedIPs = ["192.168.1.0/24", "10.0.0.0/8", process.env.SERVER_IP];

const isIPAllowed = (ip) => {
    return allowedIPs.some((allowedRange) => {
        if (allowedRange.includes("/")) {
            // CIDR notation
            const [range, bits] = allowedRange.split("/");
            const mask = ~(2 ** (32 - bits) - 1);
            return (ipToInt(ip) & mask) === (ipToInt(range) & mask);
        } else {
            // Exact IP match
            return ip === allowedRange;
        }
    });
};

const ipToInt = (ip) => {
    return (
        ip
            .split(".")
            .reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0
    );
};
```

### Environment Security

```javascript
// Secure environment configuration
const secureConfig = {
    // Use strong secrets
    generateSecrets: () => {
        return {
            JWT_ACCESS_SECRET: crypto.randomBytes(64).toString("hex"),
            JWT_REFRESH_SECRET: crypto.randomBytes(64).toString("hex"),
            ENCRYPTION_KEY: crypto.randomBytes(32).toString("hex"),
            SESSION_SECRET: crypto.randomBytes(64).toString("hex"),
        };
    },

    // Validate required environment variables
    validateEnv: () => {
        const required = [
            "MONGODB_URI",
            "JWT_ACCESS_SECRET",
            "JWT_REFRESH_SECRET",
            "ENCRYPTION_KEY",
        ];

        const missing = required.filter((key) => !process.env[key]);

        if (missing.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missing.join(", ")}`
            );
        }

        // Validate secret strength
        const secrets = [
            "JWT_ACCESS_SECRET",
            "JWT_REFRESH_SECRET",
            "ENCRYPTION_KEY",
        ];

        secrets.forEach((secret) => {
            const value = process.env[secret];
            if (value.length < 32) {
                throw new Error(
                    `${secret} must be at least 32 characters long`
                );
            }
        });
    },
};
```

## Rate Limiting & DoS Protection

### Express Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

// General rate limiting
const generalLimiter = rateLimit({
    store: new MongoStore({
        uri: process.env.MONGODB_URI,
        collectionName: "rate_limits",
        expireTimeMs: 15 * 60 * 1000, // 15 minutes
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: "Too many requests from this IP, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    skipSuccessfulRequests: true,
    message: {
        error: "Too many login attempts, please try again later",
    },
});

// API rate limiting with different tiers
const createAPILimiter = (requestsPerHour) => {
    return rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: requestsPerHour,
        keyGenerator: (req) => {
            // Use API key or user ID for authenticated requests
            return req.user?.userId || req.headers["x-api-key"] || req.ip;
        },
        handler: (req, res) => {
            res.status(429).json({
                error: "API rate limit exceeded",
                retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
            });
        },
    });
};

// Usage in routes
app.use("/api/", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/premium/", createAPILimiter(10000)); // Premium users
app.use("/api/basic/", createAPILimiter(1000)); // Basic users
```

### Advanced DoS Protection

```javascript
const slowDown = require("express-slow-down");
const helmet = require("helmet");

// Gradual response delay
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests at full speed
    delayMs: 500, // Add 500ms delay per request after delayAfter
    maxDelayMs: 20000, // Max delay of 20 seconds
    skipSuccessfulRequests: true,
});

// Request size limiting
const requestSizeLimiter = (req, res, next) => {
    const maxSize = 1024 * 1024; // 1MB

    if (req.headers["content-length"] > maxSize) {
        return res.status(413).json({
            error: "Request entity too large",
        });
    }

    next();
};

// Connection limiting
const connectionLimiter = (() => {
    const connections = new Map();
    const maxConnections = 10;

    return (req, res, next) => {
        const ip = req.ip;
        const current = connections.get(ip) || 0;

        if (current >= maxConnections) {
            return res.status(429).json({
                error: "Too many concurrent connections",
            });
        }

        connections.set(ip, current + 1);

        res.on("finish", () => {
            const count = connections.get(ip) - 1;
            if (count <= 0) {
                connections.delete(ip);
            } else {
                connections.set(ip, count);
            }
        });

        next();
    };
})();

// Security headers
app.use(
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
```

## Audit Logging

### Comprehensive Audit System

```javascript
const auditSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            "user.login",
            "user.logout",
            "user.create",
            "user.update",
            "user.delete",
            "data.read",
            "data.create",
            "data.update",
            "data.delete",
            "admin.action",
            "security.violation",
        ],
    },
    resource: {
        type: String, // e.g., 'User', 'Post', 'Order'
        required: true,
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now,
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
    },
    success: {
        type: Boolean,
        default: true,
    },
    errorMessage: String,
});

// Index for efficient querying
auditSchema.index({ userId: 1, timestamp: -1 });
auditSchema.index({ action: 1, timestamp: -1 });
auditSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model("AuditLog", auditSchema);

// Audit logging service
class AuditLogger {
    static async log({
        userId,
        action,
        resource,
        resourceId,
        details = {},
        req,
        success = true,
        severity = "medium",
        errorMessage,
    }) {
        try {
            const auditEntry = new AuditLog({
                userId,
                action,
                resource,
                resourceId,
                details,
                ipAddress: req?.ip || req?.connection?.remoteAddress,
                userAgent: req?.headers["user-agent"],
                success,
                severity,
                errorMessage,
            });

            await auditEntry.save();
        } catch (error) {
            console.error("Audit logging failed:", error);
            // Don't throw - audit failure shouldn't break the application
        }
    }

    static async logSecurityViolation({
        userId,
        violation,
        details,
        req,
        severity = "high",
    }) {
        await this.log({
            userId,
            action: "security.violation",
            resource: "Security",
            details: { violation, ...details },
            req,
            success: false,
            severity,
        });

        // Send alert for high/critical violations
        if (severity === "high" || severity === "critical") {
            await this.sendSecurityAlert(violation, details, req);
        }
    }

    static async sendSecurityAlert(violation, details, req) {
        // Implementation for alerting system
        console.warn("SECURITY ALERT:", {
            violation,
            details,
            ip: req?.ip,
            userAgent: req?.headers["user-agent"],
            timestamp: new Date(),
        });
    }
}
```

### Audit Middleware

```javascript
// Automatic audit logging middleware
const auditMiddleware = (action, resource) => {
    return async (req, res, next) => {
        const originalSend = res.send;

        res.send = function (data) {
            // Log the action after response
            setImmediate(async () => {
                try {
                    const success = res.statusCode < 400;
                    const resourceId = req.params.id || req.body._id;

                    await AuditLogger.log({
                        userId: req.user?.userId,
                        action: `${resource.toLowerCase()}.${action}`,
                        resource,
                        resourceId,
                        details: {
                            statusCode: res.statusCode,
                            method: req.method,
                            url: req.originalUrl,
                            body: action !== "read" ? req.body : undefined,
                        },
                        req,
                        success,
                        errorMessage: success ? undefined : data?.message,
                    });
                } catch (error) {
                    console.error("Audit middleware error:", error);
                }
            });

            originalSend.call(this, data);
        };

        next();
    };
};

// Usage in routes
app.post(
    "/api/users",
    authenticate,
    auditMiddleware("create", "User"),
    createUser
);

app.put(
    "/api/users/:id",
    authenticate,
    auditMiddleware("update", "User"),
    updateUser
);

app.delete(
    "/api/users/:id",
    authenticate,
    authorize("user:delete"),
    auditMiddleware("delete", "User"),
    deleteUser
);
```

---

## 🔒 Security Checklist

### Authentication

-   [ ] Implement strong password policies
-   [ ] Use secure password hashing (bcrypt/Argon2)
-   [ ] Implement account lockout after failed attempts
-   [ ] Use JWT with short expiration times
-   [ ] Implement refresh token rotation
-   [ ] Add two-factor authentication
-   [ ] Log all authentication events

### Authorization

-   [ ] Implement role-based access control
-   [ ] Use resource-level permissions
-   [ ] Validate authorization on every request
-   [ ] Implement principle of least privilege
-   [ ] Audit permission changes

### Data Protection

-   [ ] Encrypt sensitive data at rest
-   [ ] Use TLS for data in transit
-   [ ] Implement field-level encryption
-   [ ] Sanitize all user inputs
-   [ ] Validate data types and formats
-   [ ] Use parameterized queries

### Infrastructure

-   [ ] Use strong secrets and rotate them regularly
-   [ ] Implement rate limiting
-   [ ] Set up monitoring and alerting
-   [ ] Use security headers
-   [ ] Implement audit logging
-   [ ] Regular security updates

---

_Continue to 12-Production-Deployment.md for deployment strategies_
