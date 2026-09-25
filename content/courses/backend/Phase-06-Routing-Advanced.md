# Phase 06 — Routing Advanced Patterns

## Table of Contents

- [Express Router](#express-router)
- [Route Organization](#route-organization)
- [Route Parameters — Advanced](#route-parameters--advanced)
- [Route Handlers & Chaining](#route-handlers--chaining)
- [Nested Routes](#nested-routes)
- [Route Grouping & Prefixing](#route-grouping--prefixing)
- [Controller Pattern (MVC)](#controller-pattern-mvc)
- [API Versioning](#api-versioning)
- [Route Best Practices](#route-best-practices)
- [Key Takeaways](#key-takeaways)

---

## Express Router

`express.Router()` creates a **mini-application** that handles routes independently. Think of it as a modular route handler.

```javascript
const express = require("express");
const router = express.Router();

// Define routes on the router
router.get("/", (req, res) => {
    res.json({ users: [] });
});

router.get("/:id", (req, res) => {
    res.json({ user: { id: req.params.id } });
});

router.post("/", (req, res) => {
    res.status(201).json({ message: "Created" });
});

// Export the router
module.exports = router;
```

### Mounting the Router

```javascript
// app.js
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

app.use(express.json());

// Mount routers with path prefixes
app.use("/api/users", userRoutes);  // /api/users, /api/users/:id, etc.
app.use("/api/posts", postRoutes);  // /api/posts, /api/posts/:id, etc.
```

When you visit `/api/users/42`:
- Express matches the prefix `/api/users` → uses `userRoutes`
- The router sees `/:id` → `req.params.id` = `"42"`

---

## Route Organization

### Folder Structure

```
src/
├── routes/
│   ├── index.js           ← Central route aggregator
│   ├── userRoutes.js
│   ├── postRoutes.js
│   ├── authRoutes.js
│   └── commentRoutes.js
├── controllers/
│   ├── userController.js
│   ├── postController.js
│   ├── authController.js
│   └── commentController.js
├── middleware/
│   ├── auth.js
│   └── validate.js
└── app.js
```

### Central Route Aggregator

**routes/index.js:**
```javascript
const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const postRoutes = require("./postRoutes");
const authRoutes = require("./authRoutes");

router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/auth", authRoutes);

module.exports = router;
```

**app.js:**
```javascript
const routes = require("./routes");
app.use("/api", routes); // All routes under /api
```

Now all routes are clean:
- `/api/users` → userRoutes
- `/api/posts` → postRoutes
- `/api/auth` → authRoutes

---

## Route Parameters — Advanced

### Optional Parameters

```javascript
// :format is optional (the ? makes it optional)
router.get("/users/:id/:format?", (req, res) => {
    const { id, format } = req.params;

    // /users/42       → format is undefined
    // /users/42/json  → format is "json"
    // /users/42/xml   → format is "xml"

    if (format === "xml") {
        res.type("xml").send(`<user><id>${id}</id></user>`);
    } else {
        res.json({ id });
    }
});
```

### Parameter Validation with `router.param()`

`router.param()` lets you run logic whenever a specific parameter appears in any route.

```javascript
const router = express.Router();

// This runs for ANY route that has :userId
router.param("userId", (req, res, next, id) => {
    // Validate the parameter
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Optionally, fetch the resource and attach it
    const user = users.find(u => u.id === parseInt(id));
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Attach to request
    next();
});

// Now req.user is available in all these routes
router.get("/:userId", (req, res) => {
    res.json(req.user); // Already fetched by param middleware
});

router.put("/:userId", (req, res) => {
    Object.assign(req.user, req.body);
    res.json(req.user);
});

router.delete("/:userId", (req, res) => {
    // req.user is already validated and fetched
    users.splice(users.indexOf(req.user), 1);
    res.status(204).send();
});
```

### Regex Constraints on Parameters

```javascript
// Only match numeric IDs
router.get("/:id(\\d+)", (req, res) => {
    // /123 → matches
    // /abc → does NOT match (falls through to next route or 404)
    res.json({ id: parseInt(req.params.id) });
});

// Only match specific slugs
router.get("/:slug([a-z-]+)", (req, res) => {
    // /my-post-title → matches
    // /123 → does NOT match
    res.json({ slug: req.params.slug });
});
```

---

## Route Handlers & Chaining

### Multiple Handlers per Route

You can pass multiple handler functions to a single route:

```javascript
function validateId(req, res, next) {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ error: "ID must be a number" });
    }
    next();
}

function findUser(req, res, next) {
    req.user = users.find(u => u.id === parseInt(req.params.id));
    if (!req.user) {
        return res.status(404).json({ error: "User not found" });
    }
    next();
}

// Chain handlers: validateId → findUser → response
router.get("/:id", validateId, findUser, (req, res) => {
    res.json(req.user);
});
```

### `app.route()` — Chain Methods for Same Path

```javascript
app.route("/api/users")
    .get((req, res) => {
        res.json({ users: [] });
    })
    .post((req, res) => {
        res.status(201).json({ message: "Created" });
    });

app.route("/api/users/:id")
    .get((req, res) => {
        res.json({ user: {} });
    })
    .put((req, res) => {
        res.json({ message: "Updated" });
    })
    .delete((req, res) => {
        res.status(204).send();
    });
```

---

## Nested Routes

### Resource Nesting

When resources have parent-child relationships:

```
Users have Posts
Posts have Comments

/api/users/:userId/posts           → All posts by a user
/api/users/:userId/posts/:postId   → Specific post by a user
/api/posts/:postId/comments        → All comments on a post
```

### Implementation

**routes/userRoutes.js:**
```javascript
const express = require("express");
const router = express.Router();
const postRoutes = require("./postRoutes");

// Regular user routes
router.get("/", getAllUsers);
router.get("/:userId", getUser);
router.post("/", createUser);

// Nest post routes under users
// /api/users/:userId/posts → handled by postRoutes
router.use("/:userId/posts", postRoutes);

module.exports = router;
```

**routes/postRoutes.js:**
```javascript
const express = require("express");
// mergeParams: true → allows access to params from parent router
const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
    // req.params.userId is available because of mergeParams!
    const userPosts = posts.filter(
        p => p.userId === parseInt(req.params.userId)
    );
    res.json(userPosts);
});

router.get("/:postId", (req, res) => {
    const { userId, postId } = req.params;
    // Both params available
    res.json({ userId, postId });
});

router.post("/", (req, res) => {
    const post = {
        id: nextId++,
        userId: parseInt(req.params.userId),
        ...req.body,
    };
    posts.push(post);
    res.status(201).json(post);
});

module.exports = router;
```

> **Key:** `mergeParams: true` is required on the child router to access parent route parameters.

### When to Nest vs Not

```
✅ Nest when the child resource is strongly tied to the parent:
   /users/:userId/posts       (user's posts)
   /orders/:orderId/items     (order's items)

❌ Don't nest more than 2 levels deep:
   /users/:userId/posts/:postId/comments/:commentId/likes  ← Too deep!
   
Better: /comments/:commentId/likes
```

---

## Route Grouping & Prefixing

### Group Routes by Feature

```javascript
// Auth routes — no authentication needed
const publicRoutes = express.Router();
publicRoutes.post("/register", register);
publicRoutes.post("/login", login);
publicRoutes.post("/forgot-password", forgotPassword);

// Protected routes — authentication required
const protectedRoutes = express.Router();
protectedRoutes.use(authenticate); // Apply auth to all routes in this group
protectedRoutes.get("/profile", getProfile);
protectedRoutes.put("/profile", updateProfile);
protectedRoutes.get("/dashboard", getDashboard);

// Admin routes — admin role required
const adminRoutes = express.Router();
adminRoutes.use(authenticate);
adminRoutes.use(authorize("admin"));
adminRoutes.get("/users", listAllUsers);
adminRoutes.delete("/users/:id", deleteUser);
adminRoutes.get("/analytics", getAnalytics);

// Mount all groups
app.use("/api", publicRoutes);
app.use("/api", protectedRoutes);
app.use("/api/admin", adminRoutes);
```

---

## Controller Pattern (MVC)

Separate route definitions from business logic using controllers.

### Why Controllers?

```
Routes  → Define WHAT URLs your app responds to
Controllers → Define HOW to handle those requests
Models → Define WHERE data comes from
```

### Controller Example

**controllers/userController.js:**
```javascript
// Each function handles one route action

const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort = "name" } = req.query;

        const users = await User.find()
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments();

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        next(err);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const createUser = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
```

**routes/userRoutes.js** (clean and thin):
```javascript
const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

router.route("/")
    .get(getAllUsers)
    .post(authenticate, createUser);

router.route("/:id")
    .get(getUserById)
    .put(authenticate, updateUser)
    .delete(authenticate, authorize("admin"), deleteUser);

module.exports = router;
```

---

## API Versioning

As your API evolves, you need to support multiple versions without breaking existing clients.

### Strategy 1: URL Path Versioning (Most Common)

```
/api/v1/users
/api/v2/users
```

```javascript
const v1UserRoutes = require("./routes/v1/userRoutes");
const v2UserRoutes = require("./routes/v2/userRoutes");

app.use("/api/v1/users", v1UserRoutes);
app.use("/api/v2/users", v2UserRoutes);
```

**Folder structure:**
```
routes/
├── v1/
│   ├── userRoutes.js
│   └── postRoutes.js
├── v2/
│   ├── userRoutes.js  ← New version with changes
│   └── postRoutes.js
```

### Strategy 2: Header Versioning

```javascript
app.use("/api/users", (req, res, next) => {
    const version = req.headers["api-version"] || "1";

    if (version === "2") {
        return v2Handler(req, res, next);
    }
    return v1Handler(req, res, next);
});
```

### Strategy 3: Query Parameter

```
/api/users?version=2
```

> **Recommendation:** Use URL path versioning (`/api/v1/`) — it's the clearest and most widely used.

---

## Route Best Practices

### 1. Use Plural Nouns for Resources

```
✅ /api/users          (plural)
❌ /api/user           (singular)

✅ /api/posts
❌ /api/post

✅ /api/categories
❌ /api/category
```

### 2. Use HTTP Methods, Not Verbs in URLs

```
✅ GET    /api/users        (get all users)
✅ POST   /api/users        (create user)
✅ DELETE  /api/users/:id    (delete user)

❌ GET    /api/getUsers
❌ POST   /api/createUser
❌ DELETE  /api/deleteUser/:id
```

### 3. Use Nesting for Relationships

```
✅ GET /api/users/:userId/posts    (user's posts)
❌ GET /api/getUserPosts/:userId
```

### 4. Use Query Params for Filtering, Sorting, Pagination

```
GET /api/users?role=admin&sort=-createdAt&page=2&limit=20
```

### 5. 404 Handler for Unknown Routes

```javascript
// After all route definitions
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
});
```

### 6. Consistent Response Format

```javascript
// Always return the same shape
{
    "success": true,
    "data": { ... },
    "message": "Users retrieved successfully"
}

// For errors
{
    "success": false,
    "error": "User not found",
    "message": "No user with ID 42 exists"
}
```

---

## Key Takeaways

1. **`express.Router()`** creates modular, mountable route handlers
2. **Separate routes from controllers** — routes define URLs, controllers define logic
3. **`router.param()`** runs automatically for matching parameters
4. **`mergeParams: true`** enables nested routers to access parent params
5. **Use `app.route()`** to chain methods for the same path
6. **Don't nest routes more than 2 levels deep**
7. **Use URL path versioning** (`/api/v1/`) for API versioning
8. **Follow REST conventions:** plural nouns, HTTP methods, query params for filtering

---

## Practice Exercises

1. **Modular routes:** Reorganize the Task Manager app into separate route files with controllers
2. **Nested routes:** Add comments to posts — `POST /api/posts/:postId/comments`
3. **API versioning:** Create v1 and v2 of a user API where v2 returns different fields
4. **Route param middleware:** Use `router.param()` to validate and fetch resources
5. **Route grouping:** Create public routes (no auth) and protected routes (with auth) using separate routers

---

**Previous:** [← Phase 05 — Middleware In Depth](Phase-05-Middleware-In-Depth.md)

**Next:** [Phase 07 — Request-Response Cycle →](Phase-07-Request-Response-Cycle.md)
