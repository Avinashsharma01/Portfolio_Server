# Phase 08 — REST API Design & Best Practices

## Table of Contents

- [What is REST?](#what-is-rest)
- [REST Principles](#rest-principles)
- [Designing RESTful Endpoints](#designing-restful-endpoints)
- [Request & Response Conventions](#request--response-conventions)
- [Error Response Standards](#error-response-standards)
- [HATEOAS](#hateoas)
- [API Documentation](#api-documentation)
- [Building a Complete REST API](#building-a-complete-rest-api)
- [REST vs GraphQL vs gRPC](#rest-vs-graphql-vs-grpc)
- [Key Takeaways](#key-takeaways)

---

## What is REST?

**REST** (Representational State Transfer) is an **architectural style** for designing networked applications. It was defined by Roy Fielding in 2000.

REST is **not a protocol** — it's a set of constraints/guidelines for building APIs.

### RESTful vs REST-like

- **RESTful** = Strictly follows all REST principles
- **REST-like** = Follows most principles (what most APIs actually are)
- **REST API** = An API that uses REST principles over HTTP

---

## REST Principles

### 1. Client-Server Separation

```
CLIENT (React, Mobile App)     SERVER (Express API)
├── Handles UI                 ├── Handles data & logic
├── Makes requests             ├── Processes requests
└── Renders responses          └── Sends responses

They are INDEPENDENT. The server doesn't know or care about the UI.
The client doesn't know how the server stores data.
```

### 2. Statelessness

Each request must contain **all information** needed to process it. The server doesn't store client state between requests.

```javascript
// ❌ Stateful — server remembers the user
let currentUser = null;
app.post("/login", (req, res) => { currentUser = req.body.user; });
app.get("/profile", (req, res) => { res.json(currentUser); }); // What if 2 users?

// ✅ Stateless — client sends identity with every request
app.get("/profile", (req, res) => {
    const token = req.headers.authorization; // Client sends this every time
    const user = verifyToken(token);
    res.json(user);
});
```

### 3. Uniform Interface

All resources are accessed through a **consistent, predictable** interface.

```
GET    /api/users       → Get all users
GET    /api/users/42    → Get user 42
POST   /api/users       → Create a user
PUT    /api/users/42    → Replace user 42
PATCH  /api/users/42    → Update user 42
DELETE /api/users/42    → Delete user 42
```

### 4. Resource-Based

Everything is a **resource** identified by a **URI** (URL).

```
/api/users          → Users resource (collection)
/api/users/42       → User 42 resource (single item)
/api/posts          → Posts resource
/api/users/42/posts → Posts belonging to user 42
```

### 5. Layered System

The client doesn't know if it's talking directly to the server or through intermediaries (load balancers, CDNs, proxies).

### 6. Cacheable

Responses should indicate whether they can be cached.

---

## Designing RESTful Endpoints

### Resource Naming Rules

```
1. Use NOUNS, not verbs
   ✅ GET /api/users
   ❌ GET /api/getUsers

2. Use PLURAL nouns
   ✅ /api/users
   ❌ /api/user

3. Use lowercase and hyphens
   ✅ /api/user-profiles
   ❌ /api/UserProfiles
   ❌ /api/user_profiles

4. Represent hierarchy with nesting
   ✅ /api/users/42/orders
   ❌ /api/getUserOrders/42

5. Don't include file extensions
   ✅ /api/users
   ❌ /api/users.json
```

### Standard CRUD Endpoints

```
Resource: Users

GET    /api/users              → List all users
POST   /api/users              → Create a new user
GET    /api/users/:id          → Get a specific user
PUT    /api/users/:id          → Replace a user
PATCH  /api/users/:id          → Update part of a user
DELETE /api/users/:id          → Delete a user
```

### Non-CRUD Actions

Sometimes you need actions that don't fit CRUD:

```
POST /api/users/:id/activate        → Activate a user
POST /api/users/:id/deactivate      → Deactivate a user
POST /api/orders/:id/cancel         → Cancel an order
POST /api/posts/:id/publish         → Publish a post
POST /api/emails/send               → Send an email

Use POST for actions since they change state.
```

### Relationships

```
GET /api/users/:userId/posts         → Get user's posts
GET /api/users/:userId/posts/:postId → Get specific post by user
POST /api/posts/:postId/comments     → Add comment to post
GET /api/posts/:postId/comments      → Get post's comments
```

### Filtering, Sorting, Pagination via Query Params

```
GET /api/users?role=admin                    → Filter by role
GET /api/users?sort=-createdAt               → Sort descending by date
GET /api/users?page=2&limit=20               → Pagination
GET /api/users?fields=name,email             → Select fields
GET /api/users?q=avinash                     → Search
GET /api/users?role=admin&sort=name&page=1   → Combine
```

---

## Request & Response Conventions

### Standard Response Envelope

Use a consistent response format across your entire API:

```javascript
// Success response
{
    "success": true,
    "data": {
        "id": 42,
        "name": "Avinash",
        "email": "avinash@example.com"
    },
    "message": "User retrieved successfully"
}

// List response with pagination
{
    "success": true,
    "data": [
        { "id": 1, "name": "Avinash" },
        { "id": 2, "name": "John" }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 45,
        "totalPages": 5
    }
}

// Error response
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Validation failed",
        "details": [
            { "field": "email", "message": "Email is required" },
            { "field": "name", "message": "Name must be at least 2 characters" }
        ]
    }
}
```

### Response Helper Functions

```javascript
// utils/apiResponse.js
class ApiResponse {
    static success(res, data, message = "Success", statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            data,
            message,
        });
    }

    static created(res, data, message = "Created successfully") {
        return res.status(201).json({
            success: true,
            data,
            message,
        });
    }

    static noContent(res) {
        return res.status(204).send();
    }

    static error(res, message, statusCode = 500, details = null) {
        return res.status(statusCode).json({
            success: false,
            error: {
                message,
                ...(details && { details }),
            },
        });
    }
}

// Usage in controllers
const getUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return ApiResponse.error(res, "User not found", 404);
    return ApiResponse.success(res, user);
};
```

### HTTP Methods & Status Code Mappings

| Operation | Method | Success Code | Body? |
|-----------|--------|-------------|-------|
| Get all | GET | 200 | Yes — array of items |
| Get one | GET | 200 | Yes — single item |
| Create | POST | 201 | Yes — created item |
| Update (full) | PUT | 200 | Yes — updated item |
| Update (partial) | PATCH | 200 | Yes — updated item |
| Delete | DELETE | 204 | No |
| Not found | Any | 404 | Yes — error message |
| Bad request | Any | 400 | Yes — validation errors |

---

## Error Response Standards

### Consistent Error Format

```javascript
// Error response structure
{
    "success": false,
    "error": {
        "code": "RESOURCE_NOT_FOUND",       // Machine-readable
        "message": "User with ID 42 not found", // Human-readable
        "status": 404,
        "timestamp": "2024-01-15T10:30:00Z",
        "path": "/api/users/42",
        "details": []                        // Additional info
    }
}
```

### Validation Errors

```javascript
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Request validation failed",
        "status": 422,
        "details": [
            {
                "field": "email",
                "message": "Must be a valid email address",
                "value": "not-an-email"
            },
            {
                "field": "password",
                "message": "Must be at least 8 characters",
                "value": "123"
            }
        ]
    }
}
```

### Error Codes

```javascript
// Define standard error codes
const ErrorCodes = {
    VALIDATION_ERROR: { status: 422, message: "Validation failed" },
    NOT_FOUND: { status: 404, message: "Resource not found" },
    UNAUTHORIZED: { status: 401, message: "Authentication required" },
    FORBIDDEN: { status: 403, message: "Insufficient permissions" },
    CONFLICT: { status: 409, message: "Resource conflict" },
    RATE_LIMITED: { status: 429, message: "Too many requests" },
    INTERNAL_ERROR: { status: 500, message: "Internal server error" },
};
```

---

## HATEOAS

**HATEOAS** (Hypermedia As The Engine Of Application State) means the API response includes **links** to related actions.

```javascript
// Without HATEOAS
{
    "id": 42,
    "name": "Avinash",
    "email": "avinash@example.com"
}

// With HATEOAS
{
    "id": 42,
    "name": "Avinash",
    "email": "avinash@example.com",
    "links": {
        "self": "/api/users/42",
        "posts": "/api/users/42/posts",
        "update": "/api/users/42",
        "delete": "/api/users/42",
        "avatar": "/api/users/42/avatar"
    }
}
```

```javascript
// List with HATEOAS
{
    "data": [...],
    "pagination": {
        "page": 2,
        "totalPages": 5,
        "links": {
            "self": "/api/users?page=2",
            "first": "/api/users?page=1",
            "prev": "/api/users?page=1",
            "next": "/api/users?page=3",
            "last": "/api/users?page=5"
        }
    }
}
```

> HATEOAS is the most "pure REST" principle but is rarely implemented in practice. Know it exists, but don't stress about it.

---

## API Documentation

Good APIs need good documentation. Use OpenAPI/Swagger.

```bash
npm install swagger-jsdoc swagger-ui-express
```

```javascript
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My API",
            version: "1.0.0",
            description: "A complete REST API",
        },
        servers: [
            { url: "http://localhost:3000", description: "Development" },
        ],
    },
    apis: ["./src/routes/*.js"], // Files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### Documenting Routes with JSDoc

```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get("/", getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 */
router.post("/", createUser);
```

Visit `http://localhost:3000/api-docs` to see the interactive documentation.

---

## Building a Complete REST API

Here's a production-quality REST API structure:

### Project Structure

```
src/
├── config/
│   ├── db.js
│   └── env.js
├── controllers/
│   ├── userController.js
│   └── postController.js
├── middleware/
│   ├── asyncHandler.js
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── models/
│   ├── User.js
│   └── Post.js
├── routes/
│   ├── index.js
│   ├── userRoutes.js
│   └── postRoutes.js
├── utils/
│   ├── ApiError.js
│   └── ApiResponse.js
├── validators/
│   ├── userValidator.js
│   └── postValidator.js
└── app.js
```

### ApiError Utility

```javascript
// utils/ApiError.js
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
    }

    static badRequest(msg, details) { return new ApiError(400, msg, details); }
    static unauthorized(msg) { return new ApiError(401, msg || "Unauthorized"); }
    static forbidden(msg) { return new ApiError(403, msg || "Forbidden"); }
    static notFound(msg) { return new ApiError(404, msg || "Not found"); }
    static conflict(msg) { return new ApiError(409, msg || "Conflict"); }
}

module.exports = ApiError;
```

### Error Handler Middleware

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : "Internal server error";

    // Log the error (use a proper logger in production)
    if (!err.isOperational) {
        console.error("UNEXPECTED ERROR:", err);
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(err.details && { details: err.details }),
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        },
    });
};

module.exports = errorHandler;
```

### Controller Example

```javascript
// controllers/userController.js
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

exports.getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find().skip(skip).limit(limit).select("-password"),
        User.countDocuments(),
    ]);

    res.json({
        success: true,
        data: users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
};

exports.getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) throw ApiError.notFound("User not found");
    res.json({ success: true, data: user });
};

exports.createUser = async (req, res) => {
    const user = await User.create(req.body);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ success: true, data: userObj });
};

exports.updateUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).select("-password");
    if (!user) throw ApiError.notFound("User not found");
    res.json({ success: true, data: user });
};

exports.deleteUser = async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw ApiError.notFound("User not found");
    res.status(204).send();
};
```

---

## REST vs GraphQL vs gRPC

| Feature | REST | GraphQL | gRPC |
|---------|------|---------|------|
| **Protocol** | HTTP | HTTP | HTTP/2 |
| **Data Format** | JSON | JSON | Protocol Buffers (binary) |
| **Endpoints** | Many (one per resource) | One (`/graphql`) | Service methods |
| **Over-fetching** | Common problem | ✅ Client picks fields | ✅ Defined in proto |
| **Under-fetching** | Multiple requests needed | ✅ One request | ✅ One call |
| **Learning Curve** | Low | Medium | High |
| **Best For** | Simple CRUD APIs | Complex data needs | Microservices |
| **Caching** | Easy (HTTP caching) | Complex | Complex |
| **Real-time** | Needs WebSocket | Subscriptions built-in | Streaming built-in |

### When to Use What

```
REST     → Most web APIs, simple CRUD, public APIs
GraphQL  → Complex frontends needing flexible data, multiple resources per view
gRPC     → Microservice-to-microservice communication, performance-critical
```

---

## Key Takeaways

1. **REST is an architectural style**, not a protocol — it's guidelines for designing APIs
2. **Use nouns, not verbs** in URLs — the HTTP method IS the verb
3. **Consistent response format** across all endpoints (success, data, error, pagination)
4. **Status codes matter** — use the right one for each situation
5. **Validate input thoroughly** and return clear validation errors
6. **Document your API** with Swagger/OpenAPI
7. **Version your API** from the start (`/api/v1/`)
8. **REST is the most common** API style — learn it well before exploring GraphQL or gRPC

---

## Practice Exercises

1. **Design an API:** Design RESTful endpoints for an e-commerce app (products, orders, reviews, users)
2. **Build a REST API:** Implement a complete blog API with users, posts, comments, and likes
3. **API documentation:** Add Swagger documentation to your API
4. **Error handling:** Implement consistent error responses with error codes
5. **Response helper:** Create a reusable `ApiResponse` utility class

---

**Previous:** [← Phase 07 — Request-Response Cycle](Phase-07-Request-Response-Cycle.md)

**Next:** [Phase 09 — Database Fundamentals →](Phase-09-Database-Fundamentals.md)
