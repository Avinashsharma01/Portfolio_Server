# Phase 03 — Express.js Fundamentals

## Table of Contents

- [What is Express.js?](#what-is-expressjs)
- [Setting Up Express](#setting-up-express)
- [The Express Application Object](#the-express-application-object)
- [Routing Basics](#routing-basics)
- [Request Object (req)](#request-object-req)
- [Response Object (res)](#response-object-res)
- [Serving Static Files](#serving-static-files)
- [Template Engines (EJS)](#template-engines-ejs)
- [Express Application Structure](#express-application-structure)
- [nodemon for Development](#nodemon-for-development)
- [First Complete Express App](#first-complete-express-app)
- [Key Takeaways](#key-takeaways)

---

## What is Express.js?

Express is a **minimal, flexible web framework for Node.js**. It provides a thin layer on top of Node's built-in `http` module, making it much easier to build web servers and APIs.

### What Express Gives You (That Raw Node Doesn't)

| Feature | Raw Node.js | Express.js |
|---------|------------|------------|
| Routing | Manual if/else chains | `app.get("/path", handler)` |
| Middleware | Build from scratch | `app.use(middleware)` |
| Body parsing | Manual stream collection | `express.json()` |
| Static files | Manual file serving | `express.static("public")` |
| Error handling | Manual try/catch everywhere | Centralized error middleware |
| Request helpers | Raw headers object | `req.params`, `req.query`, `req.body` |
| Response helpers | `res.end()` only | `res.json()`, `res.send()`, `res.status()` |

### Express vs Other Frameworks

| Framework | Language | Style |
|-----------|----------|-------|
| **Express** | Node.js | Minimal, unopinionated |
| **Fastify** | Node.js | Performance-focused |
| **Koa** | Node.js | Modern, by Express creators |
| **NestJS** | Node.js/TypeScript | Full-featured, opinionated (like Angular) |
| **Django** | Python | Full-featured, batteries included |
| **Flask** | Python | Minimal, like Express |
| **Spring Boot** | Java | Enterprise-grade |

---

## Setting Up Express

### Step 1: Create a Project

```bash
mkdir my-express-app
cd my-express-app
npm init -y
```

### Step 2: Install Express

```bash
npm install express
```

### Step 3: Create Your Server

**index.js:**
```javascript
const express = require("express");
const app = express();
const PORT = 3000;

// Your first route
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```

### Step 4: Run It

```bash
node index.js
```

Open `http://localhost:3000` in your browser — you'll see "Hello World!".

---

## The Express Application Object

When you call `express()`, you get an **application object**. This is the central piece of your server.

```javascript
const express = require("express");
const app = express(); // ← This is your application object
```

### Key Methods on `app`

```javascript
// ===== ROUTING METHODS =====
app.get("/path", handler);     // Handle GET requests
app.post("/path", handler);    // Handle POST requests
app.put("/path", handler);     // Handle PUT requests
app.patch("/path", handler);   // Handle PATCH requests
app.delete("/path", handler);  // Handle DELETE requests
app.all("/path", handler);     // Handle ALL HTTP methods

// ===== MIDDLEWARE =====
app.use(middleware);           // Apply middleware to ALL routes
app.use("/path", middleware);  // Apply middleware to specific path

// ===== SETTINGS =====
app.set("view engine", "ejs"); // Set app settings
app.get("env");                // Get app settings

// ===== LISTENING =====
app.listen(3000, callback);    // Start listening for requests
```

---

## Routing Basics

Routing determines **how your server responds to different URLs and HTTP methods**.

```javascript
const express = require("express");
const app = express();

// ===== GET — Retrieve data =====
app.get("/", (req, res) => {
    res.send("Home page");
});

app.get("/about", (req, res) => {
    res.send("About page");
});

// ===== POST — Create data =====
app.post("/api/users", (req, res) => {
    res.json({ message: "User created" });
});

// ===== PUT — Update entire resource =====
app.put("/api/users/:id", (req, res) => {
    res.json({ message: `User ${req.params.id} updated` });
});

// ===== PATCH — Update partial resource =====
app.patch("/api/users/:id", (req, res) => {
    res.json({ message: `User ${req.params.id} partially updated` });
});

// ===== DELETE — Remove data =====
app.delete("/api/users/:id", (req, res) => {
    res.json({ message: `User ${req.params.id} deleted` });
});
```

### Route Parameters

Dynamic segments in the URL, prefixed with `:`.

```javascript
// Single parameter
app.get("/users/:id", (req, res) => {
    console.log(req.params.id);  // "42" when visiting /users/42
    res.send(`User ID: ${req.params.id}`);
});

// Multiple parameters
app.get("/users/:userId/posts/:postId", (req, res) => {
    console.log(req.params.userId);  // "5"
    console.log(req.params.postId);  // "12"
    res.send(`User ${req.params.userId}, Post ${req.params.postId}`);
});
```

### Query Strings

Key-value pairs in the URL after `?`.

```javascript
// URL: /search?q=nodejs&page=2&limit=10
app.get("/search", (req, res) => {
    console.log(req.query.q);      // "nodejs"
    console.log(req.query.page);   // "2" (string!)
    console.log(req.query.limit);  // "10" (string!)

    // Always parse numbers from query strings
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    res.json({ search: req.query.q, page, limit });
});
```

### Difference: Params vs Query

```
/users/42          ← Route Param  (req.params.id = "42")
/users?id=42       ← Query String (req.query.id = "42")

Use params for: required, identifying values (user ID, post slug)
Use query for: optional, filtering values (page, sort, search)
```

---

## Request Object (req)

The `req` object represents the **incoming HTTP request**. Express enhances it with useful properties.

```javascript
app.post("/api/users", (req, res) => {
    // ===== URL & PATH =====
    req.url;           // "/api/users?active=true"
    req.path;          // "/api/users"
    req.originalUrl;   // "/api/users?active=true" (before any rewrite)
    req.baseUrl;       // Base URL of the router
    req.hostname;      // "localhost" or "example.com"
    req.protocol;      // "http" or "https"
    req.method;        // "POST"

    // ===== PARAMETERS =====
    req.params;        // { id: "42" } — route parameters
    req.query;         // { active: "true" } — query string
    req.body;          // { name: "Avinash" } — request body (needs middleware)

    // ===== HEADERS =====
    req.headers;       // All headers as an object
    req.get("Content-Type");  // Get specific header
    req.get("Authorization"); // "Bearer token123..."

    // ===== REQUEST INFO =====
    req.ip;            // Client's IP address
    req.secure;        // true if HTTPS
    req.fresh;         // true if response is fresh (caching)
    req.xhr;           // true if AJAX request (X-Requested-With header)
});
```

### Parsing Request Body

Express doesn't parse the body by default. You need middleware:

```javascript
// Parse JSON bodies (for API requests)
app.use(express.json());

// Parse URL-encoded bodies (for HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Now req.body is available
app.post("/api/users", (req, res) => {
    console.log(req.body);  // { name: "Avinash", email: "a@test.com" }
    res.json({ received: req.body });
});
```

---

## Response Object (res)

The `res` object represents the **outgoing HTTP response**. Express gives you many helper methods.

```javascript
app.get("/demo", (req, res) => {
    // ===== SENDING RESPONSES =====

    // Send a string
    res.send("Hello World");

    // Send JSON (most common for APIs)
    res.json({ message: "Hello", data: [1, 2, 3] });

    // Send with status code
    res.status(201).json({ message: "Created" });

    // Send status only (no body)
    res.sendStatus(204); // 204 No Content

    // ===== SETTING HEADERS =====
    res.set("X-Custom-Header", "my-value");
    res.set({
        "X-Header-1": "value1",
        "X-Header-2": "value2",
    });

    // ===== COOKIES =====
    res.cookie("token", "abc123", { httpOnly: true, maxAge: 3600000 });
    res.clearCookie("token");

    // ===== REDIRECTS =====
    res.redirect("/new-url");          // 302 redirect (temporary)
    res.redirect(301, "/new-url");     // 301 redirect (permanent)

    // ===== FILE RESPONSES =====
    res.sendFile("/absolute/path/to/file.pdf");
    res.download("/path/to/file.pdf", "custom-name.pdf");

    // ===== RENDER TEMPLATE =====
    res.render("index", { title: "Home", user: "Avinash" });
});
```

### Important Rule: One Response Per Request

```javascript
// ❌ WRONG — Can't send two responses
app.get("/bad", (req, res) => {
    res.json({ message: "First" });
    res.json({ message: "Second" }); // Error: Cannot set headers after sent
});

// ✅ RIGHT — Use if/else or return
app.get("/good", (req, res) => {
    if (someCondition) {
        return res.json({ message: "Case A" });
    }
    res.json({ message: "Case B" });
});
```

### Method Chaining

```javascript
res.status(201)
   .set("X-Created-By", "Avinash")
   .json({ message: "User created", id: 42 });
```

---

## Serving Static Files

Serve files (HTML, CSS, images, JS) directly without writing route handlers.

```javascript
const path = require("path");

// Serve all files in the "public" folder
app.use(express.static("public"));

// With a URL prefix
app.use("/static", express.static("public"));
// Files will be accessible at /static/style.css instead of /style.css

// Using absolute path (recommended)
app.use(express.static(path.join(__dirname, "public")));
```

### Folder Structure

```
project/
├── public/
│   ├── css/
│   │   └── style.css       → http://localhost:3000/css/style.css
│   ├── js/
│   │   └── main.js         → http://localhost:3000/js/main.js
│   ├── images/
│   │   └── logo.png        → http://localhost:3000/images/logo.png
│   └── index.html          → http://localhost:3000/index.html
├── index.js
└── package.json
```

---

## Template Engines (EJS)

For serving dynamic HTML pages (server-side rendering).

### Setup

```bash
npm install ejs
```

```javascript
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
```

### Creating a Template

**views/index.ejs:**
```html
<!DOCTYPE html>
<html>
<head>
    <title><%= title %></title>
</head>
<body>
    <h1>Welcome, <%= username %>!</h1>

    <% if (isAdmin) { %>
        <p>You have admin access.</p>
    <% } %>

    <h2>Your Posts:</h2>
    <ul>
        <% posts.forEach(post => { %>
            <li><%= post.title %></li>
        <% }); %>
    </ul>
</body>
</html>
```

### Rendering the Template

```javascript
app.get("/", (req, res) => {
    res.render("index", {
        title: "Home Page",
        username: "Avinash",
        isAdmin: true,
        posts: [
            { title: "First Post" },
            { title: "Second Post" },
        ],
    });
});
```

### EJS Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `<%= %>` | Output escaped HTML | `<%= user.name %>` |
| `<%- %>` | Output unescaped HTML | `<%- htmlContent %>` |
| `<% %>` | Execute JS (no output) | `<% if (x) { %>` |
| `<%# %>` | Comment (not in output) | `<%# This is hidden %>` |

> **Note:** For APIs, you'll mostly use `res.json()`. Templates are for server-rendered web pages.

---

## Express Application Structure

As your app grows, organize it properly.

### Basic Structure (Small Apps)

```
project/
├── node_modules/
├── public/
│   └── css/
├── views/
│   └── index.ejs
├── .env
├── .gitignore
├── index.js           ← Everything in one file
├── package.json
└── package-lock.json
```

### Professional Structure (Real Apps)

```
project/
├── src/
│   ├── config/
│   │   └── db.js              ← Database connection
│   ├── controllers/
│   │   ├── authController.js  ← Auth logic
│   │   └── userController.js  ← User logic
│   ├── middleware/
│   │   ├── auth.js            ← Auth middleware
│   │   └── errorHandler.js    ← Error handling
│   ├── models/
│   │   └── User.js            ← Database models
│   ├── routes/
│   │   ├── authRoutes.js      ← Auth routes
│   │   └── userRoutes.js      ← User routes
│   ├── utils/
│   │   └── helpers.js         ← Utility functions
│   └── app.js                 ← Express app setup
├── public/
├── .env
├── .gitignore
├── server.js                  ← Entry point (just starts server)
├── package.json
└── package-lock.json
```

### Example: Separating Routes

**src/routes/userRoutes.js:**
```javascript
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({ users: [] });
});

router.get("/:id", (req, res) => {
    res.json({ user: { id: req.params.id } });
});

router.post("/", (req, res) => {
    res.status(201).json({ message: "User created" });
});

module.exports = router;
```

**src/app.js:**
```javascript
const express = require("express");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes); // Mount user routes

module.exports = app;
```

**server.js:**
```javascript
const app = require("./src/app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

## nodemon for Development

**nodemon** automatically restarts your server when you change files.

### Install

```bash
npm install nodemon --save-dev
```

### Configure in package.json

```json
{
    "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js"
    }
}
```

### Run

```bash
npm run dev
```

Now when you save a file, the server automatically restarts.

---

## First Complete Express App

Let's build a complete "Task Manager" API:

```javascript
const express = require("express");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// In-memory data store
let tasks = [
    { id: 1, title: "Learn Express", completed: false },
    { id: 2, title: "Build an API", completed: false },
];
let nextId = 3;

// GET all tasks
app.get("/api/tasks", (req, res) => {
    // Support filtering by completed status
    const { completed } = req.query;

    if (completed !== undefined) {
        const filtered = tasks.filter(
            (t) => t.completed === (completed === "true")
        );
        return res.json(filtered);
    }

    res.json(tasks);
});

// GET single task
app.get("/api/tasks/:id", (req, res) => {
    const task = tasks.find((t) => t.id === parseInt(req.params.id));

    if (!task) {
        return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
});

// POST create task
app.post("/api/tasks", (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    const newTask = {
        id: nextId++,
        title,
        completed: false,
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT update task (full replacement)
app.put("/api/tasks/:id", (req, res) => {
    const task = tasks.find((t) => t.id === parseInt(req.params.id));

    if (!task) {
        return res.status(404).json({ error: "Task not found" });
    }

    const { title, completed } = req.body;
    task.title = title || task.title;
    task.completed = completed !== undefined ? completed : task.completed;

    res.json(task);
});

// DELETE task
app.delete("/api/tasks/:id", (req, res) => {
    const index = tasks.findIndex((t) => t.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({ error: "Task not found" });
    }

    tasks.splice(index, 1);
    res.status(204).send(); // No content
});

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Task Manager API running at http://localhost:${PORT}`);
});
```

### Testing with curl

```bash
# Get all tasks
curl http://localhost:3000/api/tasks

# Get one task
curl http://localhost:3000/api/tasks/1

# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task"}'

# Update a task
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete a task
curl -X DELETE http://localhost:3000/api/tasks/1

# Filter completed tasks
curl http://localhost:3000/api/tasks?completed=true
```

---

## Key Takeaways

1. **Express = minimal framework** that adds routing, middleware, and helpers to Node's http module
2. **`app.get()`, `.post()`, `.put()`, `.delete()`** handle different HTTP methods
3. **`req.params`** = route parameters (`:id`), **`req.query`** = query strings (`?key=value`), **`req.body`** = request body
4. **`res.json()`** sends JSON responses, **`res.status()`** sets the status code
5. **Always return after sending a response** to prevent double-response errors
6. **`express.json()`** middleware is required to parse JSON request bodies
7. **Organize code** into routes, controllers, and middleware as your app grows
8. **Use nodemon** during development for auto-restart

---

## Practice Exercises

1. **Book Library API:** Create CRUD endpoints for books (title, author, year, genre)
2. **Add search:** Add a `GET /api/books/search?q=keyword` that searches by title or author
3. **Separate routes:** Move routes to a `routes/bookRoutes.js` file using `express.Router()`
4. **Static page:** Add a `public/index.html` page that displays the API documentation
5. **Template rendering:** Use EJS to render a page that lists all books

---

**Previous:** [← Phase 02 — Node.js Fundamentals](Phase-02-NodeJS-Fundamentals.md)

**Next:** [Phase 04 — HTTP Deep Dive →](Phase-04-HTTP-Deep-Dive.md)
