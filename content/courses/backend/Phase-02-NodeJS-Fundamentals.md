# Phase 02 — Node.js Fundamentals

## Table of Contents

- [What is Node.js?](#what-is-nodejs)
- [Node.js Architecture](#nodejs-architecture)
- [The Event Loop](#the-event-loop)
- [Modules System](#modules-system)
- [CommonJS vs ES Modules](#commonjs-vs-es-modules)
- [Built-in Modules](#built-in-modules)
- [npm — Node Package Manager](#npm--node-package-manager)
- [package.json Deep Dive](#packagejson-deep-dive)
- [Creating an HTTP Server (Without Express)](#creating-an-http-server-without-express)
- [Asynchronous Patterns](#asynchronous-patterns)
- [Buffers & Streams](#buffers--streams)
- [Environment Variables](#environment-variables)
- [Key Takeaways](#key-takeaways)

---

## What is Node.js?

Node.js is a **JavaScript runtime built on Chrome's V8 engine**. It lets you run JavaScript **outside the browser** — on servers, command lines, and IoT devices.

### Before Node.js

```
JavaScript could ONLY run in the browser.
Backend was written in PHP, Java, Ruby, Python, etc.
```

### After Node.js (2009)

```
JavaScript can now run on the server too.
One language for frontend AND backend = Full Stack JavaScript.
```

### Key Facts About Node.js

| Feature | Detail |
|---------|--------|
| **Engine** | V8 (same engine Chrome uses) |
| **Language** | JavaScript |
| **I/O Model** | Non-blocking, asynchronous |
| **Threading** | Single-threaded (but uses thread pool internally) |
| **Package Manager** | npm (largest package registry in the world) |
| **Created By** | Ryan Dahl, 2009 |

### What Node.js is NOT

- ❌ A programming language (it's a runtime)
- ❌ A framework (Express is a framework that runs ON Node.js)
- ❌ Multi-threaded by default (it's single-threaded with async I/O)
- ❌ Good for heavy CPU-bound tasks (it's optimized for I/O)

---

## Node.js Architecture

```
┌──────────────────────────────────────────────┐
│              YOUR JAVASCRIPT CODE             │
├──────────────────────────────────────────────┤
│              NODE.js BINDINGS                 │
│         (C++ bridge between JS and OS)        │
├────────────────────┬─────────────────────────┤
│     V8 ENGINE      │       LIBUV             │
│  (Compiles JS to   │  (Event Loop,           │
│   machine code)    │   Async I/O,            │
│                    │   Thread Pool)           │
├────────────────────┴─────────────────────────┤
│              OPERATING SYSTEM                 │
│     (File System, Network, Processes)         │
└──────────────────────────────────────────────┘
```

### V8 Engine

- Written in C++
- Compiles JavaScript directly to machine code (no interpreter)
- Extremely fast
- Same engine that runs JS in Google Chrome

### libuv

- Written in C
- Provides the **event loop** and **asynchronous I/O**
- Manages a **thread pool** (4 threads by default) for heavy operations
- Handles: file system, DNS, network, child processes

---

## The Event Loop

This is the **heart of Node.js**. Understanding it is crucial.

### The Problem It Solves

In traditional servers (like Apache + PHP):

```
Request 1 comes in → Thread 1 handles it → Waits for DB → Responds
Request 2 comes in → Thread 2 handles it → Waits for DB → Responds
Request 3 comes in → Thread 3 handles it → Waits for DB → Responds
...
Request 1001 → No threads available → REQUEST BLOCKED!
```

In Node.js:

```
Request 1 comes in → Start DB query → Don't wait → Move on
Request 2 comes in → Start DB query → Don't wait → Move on
Request 3 comes in → Start DB query → Don't wait → Move on
...
DB query 1 finishes → Callback fires → Send response 1
DB query 2 finishes → Callback fires → Send response 2
```

**Node.js never waits. It delegates and moves on.**

### Event Loop Phases

```
   ┌───────────────────────────┐
┌─►│         TIMERS            │  setTimeout, setInterval callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │     PENDING CALLBACKS     │  I/O callbacks deferred to next loop
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │       IDLE, PREPARE       │  Internal use only
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │          POLL             │  Retrieve new I/O events
│  │  (most callbacks run here)│  Execute I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │          CHECK            │  setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │     CLOSE CALLBACKS       │  socket.on('close', ...)
│  └─────────────┬─────────────┘
└─────────────────┘
```

### Example: Understanding Async Execution Order

```javascript
console.log("1 - Start");

setTimeout(() => {
    console.log("2 - setTimeout (0ms)");
}, 0);

setImmediate(() => {
    console.log("3 - setImmediate");
});

process.nextTick(() => {
    console.log("4 - process.nextTick");
});

Promise.resolve().then(() => {
    console.log("5 - Promise.then");
});

console.log("6 - End");

// Output:
// 1 - Start
// 6 - End
// 4 - process.nextTick    (microtask - runs first)
// 5 - Promise.then        (microtask - runs second)
// 2 - setTimeout (0ms)    (timer phase)
// 3 - setImmediate        (check phase)
```

### Key Rule

> **Microtasks** (`process.nextTick`, `Promise.then`) run **between** every phase of the event loop. They have highest priority after synchronous code.

---

## Modules System

Node.js uses modules to organize code. Every file is a **module**.

### Why Modules?

- **Encapsulation** — each file has its own scope
- **Reusability** — import and use code across files
- **Maintainability** — smaller, focused files are easier to manage

### Creating and Using Modules

**math.js** (exporting):
```javascript
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

// Export functions so other files can use them
module.exports = { add, subtract };
```

**app.js** (importing):
```javascript
const { add, subtract } = require("./math");

console.log(add(5, 3));       // 8
console.log(subtract(10, 4)); // 6
```

### Module Wrapper Function

Node.js wraps every module in a function before executing it:

```javascript
(function (exports, require, module, __filename, __dirname) {
    // Your module code actually lives here
    
    console.log(__filename); // Full path to this file
    console.log(__dirname);  // Directory of this file
});
```

This is why:
- Variables in one file don't leak to another
- `require`, `module`, `exports`, `__filename`, `__dirname` are available in every file
- They're NOT global — they're passed as function parameters

---

## CommonJS vs ES Modules

Node.js supports two module systems:

### CommonJS (CJS) — The Original

```javascript
// Exporting
module.exports = { add, subtract };
// or
exports.add = add;

// Importing
const math = require("./math");
const { add } = require("./math");
```

### ES Modules (ESM) — The Modern Way

```javascript
// Exporting
export function add(a, b) { return a + b; }
export default function subtract(a, b) { return a - b; }

// Importing
import subtract, { add } from "./math.js";
```

### How to Enable ES Modules

**Option 1:** Use `.mjs` file extension
```
math.mjs
app.mjs
```

**Option 2:** Add `"type": "module"` to package.json
```json
{
    "type": "module"
}
```

### Comparison

| Feature | CommonJS | ES Modules |
|---------|----------|------------|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| File Extension | `.js` | `.mjs` or `.js` with type:module |
| Top-level await | ❌ Not supported | ✅ Supported |
| Default in Node | ✅ Yes | Needs configuration |
| Used in browsers | ❌ No | ✅ Yes |

> **For this guide, we'll use CommonJS** (`require` / `module.exports`) as it's still the most common in Node.js backend code. Both work fine.

---

## Built-in Modules

Node.js comes with many useful modules. No installation needed.

### `path` — File Path Utilities

```javascript
const path = require("path");

// Join paths safely (handles / vs \ across OS)
const filePath = path.join(__dirname, "data", "users.json");
// → /home/user/project/data/users.json

// Get file extension
path.extname("photo.png");     // ".png"

// Get file name
path.basename("/home/user/photo.png");  // "photo.png"

// Get directory
path.dirname("/home/user/photo.png");   // "/home/user"

// Resolve to absolute path
path.resolve("src", "index.js"); // /home/user/project/src/index.js
```

### `fs` — File System

```javascript
const fs = require("fs");

// ===== SYNCHRONOUS (Blocking) =====
const data = fs.readFileSync("file.txt", "utf8");
console.log(data);

// ===== ASYNCHRONOUS with Callback =====
fs.readFile("file.txt", "utf8", (err, data) => {
    if (err) throw err;
    console.log(data);
});

// ===== ASYNCHRONOUS with Promises (Recommended) =====
const fsPromises = require("fs").promises;

async function readFile() {
    const data = await fsPromises.readFile("file.txt", "utf8");
    console.log(data);
}

// Write a file
await fsPromises.writeFile("output.txt", "Hello World");

// Append to a file
await fsPromises.appendFile("log.txt", "New log entry\n");

// Check if file exists
await fsPromises.access("file.txt"); // throws if doesn't exist

// Create directory
await fsPromises.mkdir("new-folder", { recursive: true });

// Read directory contents
const files = await fsPromises.readdir("./src");

// Delete file
await fsPromises.unlink("temp.txt");
```

### `os` — Operating System Info

```javascript
const os = require("os");

os.platform();    // "win32", "linux", "darwin"
os.arch();        // "x64", "arm64"
os.cpus();        // Array of CPU cores
os.totalmem();    // Total RAM in bytes
os.freemem();     // Free RAM in bytes
os.homedir();     // User's home directory
os.hostname();    // Computer name
os.tmpdir();      // Temp directory path
```

### `events` — Event Emitter

```javascript
const EventEmitter = require("events");

const emitter = new EventEmitter();

// Register a listener
emitter.on("userCreated", (user) => {
    console.log(`Welcome email sent to ${user.email}`);
});

emitter.on("userCreated", (user) => {
    console.log(`Analytics tracked for ${user.name}`);
});

// Emit the event
emitter.emit("userCreated", { name: "Avinash", email: "avinash@example.com" });

// Output:
// Welcome email sent to avinash@example.com
// Analytics tracked for Avinash
```

### `crypto` — Cryptography

```javascript
const crypto = require("crypto");

// Generate a random token
const token = crypto.randomBytes(32).toString("hex");

// Hash a password (simple example - use bcrypt in production)
const hash = crypto.createHash("sha256").update("password123").digest("hex");

// Generate UUID
const uuid = crypto.randomUUID();
```

### `url` — URL Parsing

```javascript
const url = require("url");

const myUrl = new URL("https://example.com/api/users?page=2&limit=10#section");

myUrl.hostname;     // "example.com"
myUrl.pathname;     // "/api/users"
myUrl.search;       // "?page=2&limit=10"
myUrl.searchParams.get("page");  // "2"
myUrl.hash;         // "#section"
myUrl.protocol;     // "https:"
```

---

## npm — Node Package Manager

npm is the package manager for Node.js. It lets you install and manage third-party packages.

### Essential npm Commands

```bash
# Initialize a new project
npm init              # Interactive prompts
npm init -y           # Accept all defaults

# Install packages
npm install express             # Install as dependency
npm install nodemon --save-dev  # Install as dev dependency
npm install -g pm2              # Install globally

# Shorthand
npm i express          # Same as npm install express

# Remove packages
npm uninstall express

# Update packages
npm update             # Update all packages
npm update express     # Update specific package

# View installed packages
npm list               # All dependencies (tree view)
npm list --depth=0     # Only top-level dependencies

# Run scripts
npm start              # Runs "start" script from package.json
npm run dev            # Runs "dev" script
npm test               # Runs "test" script

# Check for vulnerabilities
npm audit
npm audit fix
```

### node_modules

When you `npm install`, packages are downloaded to the `node_modules` folder.

```
project/
├── node_modules/      ← Downloaded packages (NEVER commit to git)
├── package.json       ← Your project's manifest
├── package-lock.json  ← Exact versions of all packages (DO commit)
└── index.js
```

**ALWAYS add `node_modules` to `.gitignore`:**

```
# .gitignore
node_modules/
```

---

## package.json Deep Dive

This is the **most important file** in any Node.js project.

```json
{
    "name": "my-backend-app",
    "version": "1.0.0",
    "description": "A backend learning project",
    "main": "index.js",
    "scripts": {
        "start": "node index.js",
        "dev": "nodemon index.js",
        "test": "jest"
    },
    "dependencies": {
        "express": "^4.18.2",
        "mongoose": "^7.6.3"
    },
    "devDependencies": {
        "nodemon": "^3.0.1",
        "jest": "^29.7.0"
    },
    "engines": {
        "node": ">=18.0.0"
    }
}
```

### Understanding Version Numbers (Semver)

```
^4.18.2
 │ │  │
 │ │  └── PATCH (bug fixes) — safe to update
 │ └───── MINOR (new features, backward compatible) — safe to update
 └─────── MAJOR (breaking changes) — careful!

^ = Allow minor + patch updates (^4.18.2 → 4.x.x)
~ = Allow only patch updates    (~4.18.2 → 4.18.x)
  = Exact version               (4.18.2 → only 4.18.2)
```

### Scripts

```json
"scripts": {
    "start": "node index.js",          // npm start (production)
    "dev": "nodemon index.js",         // npm run dev (development)
    "test": "jest --coverage",         // npm test
    "build": "tsc",                    // npm run build
    "lint": "eslint .",                // npm run lint
    "seed": "node scripts/seed.js"     // npm run seed
}
```

---

## Creating an HTTP Server (Without Express)

Before using Express, understand what Node.js gives you natively:

```javascript
const http = require("http");

// Create a server
const server = http.createServer((req, res) => {
    // req = incoming request object
    // res = outgoing response object

    console.log(`${req.method} ${req.url}`);

    // Set response headers
    res.setHeader("Content-Type", "application/json");

    // Route handling (manual)
    if (req.method === "GET" && req.url === "/") {
        res.statusCode = 200;
        res.end(JSON.stringify({ message: "Hello World" }));
    } else if (req.method === "GET" && req.url === "/api/users") {
        res.statusCode = 200;
        res.end(JSON.stringify({ users: ["Avinash", "John", "Jane"] }));
    } else if (req.method === "POST" && req.url === "/api/users") {
        let body = "";

        // Collect the body data
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        // When all data is received
        req.on("end", () => {
            const user = JSON.parse(body);
            res.statusCode = 201;
            res.end(JSON.stringify({ message: "User created", user }));
        });
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Not Found" }));
    }
});

// Start listening
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```

### Why This is Painful

- Manual routing with if/else
- Manual body parsing
- No middleware support
- No built-in error handling
- Gets messy fast

**This is exactly why Express.js was created.** It adds a powerful layer on top of this.

---

## Asynchronous Patterns

Node.js is ALL about async. You need to master these three patterns.

### 1. Callbacks (Old Way)

```javascript
const fs = require("fs");

fs.readFile("file.txt", "utf8", (err, data) => {
    if (err) {
        console.error("Error:", err.message);
        return;
    }
    console.log(data);
});
```

**Problem: Callback Hell**
```javascript
fs.readFile("file1.txt", "utf8", (err, data1) => {
    fs.readFile("file2.txt", "utf8", (err, data2) => {
        fs.readFile("file3.txt", "utf8", (err, data3) => {
            // This is callback hell — deeply nested, hard to read
        });
    });
});
```

### 2. Promises (Better)

```javascript
const fsPromises = require("fs").promises;

fsPromises
    .readFile("file1.txt", "utf8")
    .then((data1) => {
        console.log(data1);
        return fsPromises.readFile("file2.txt", "utf8");
    })
    .then((data2) => {
        console.log(data2);
    })
    .catch((err) => {
        console.error("Error:", err.message);
    });
```

### 3. Async/Await (Best — Use This)

```javascript
const fsPromises = require("fs").promises;

async function readFiles() {
    try {
        const data1 = await fsPromises.readFile("file1.txt", "utf8");
        const data2 = await fsPromises.readFile("file2.txt", "utf8");
        const data3 = await fsPromises.readFile("file3.txt", "utf8");

        console.log(data1, data2, data3);
    } catch (err) {
        console.error("Error:", err.message);
    }
}

readFiles();
```

### Running Async Operations in Parallel

```javascript
// SEQUENTIAL — Slow (one after another)
const user = await getUser(id);      // 200ms
const posts = await getPosts(id);    // 300ms
const comments = await getComments(id); // 150ms
// Total: 650ms

// PARALLEL — Fast (all at once)
const [user, posts, comments] = await Promise.all([
    getUser(id),       // 200ms  ┐
    getPosts(id),      // 300ms  ├── All run at the same time
    getComments(id),   // 150ms  ┘
]);
// Total: 300ms (time of the slowest)
```

---

## Buffers & Streams

### Buffers

A **Buffer** is a temporary storage for binary data. When Node reads a file or receives network data, it stores it in a Buffer.

```javascript
// Create a buffer
const buf = Buffer.from("Hello World");
console.log(buf);          // <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64>
console.log(buf.toString()); // "Hello World"
console.log(buf.length);    // 11 (bytes)

// Allocate buffer of specific size
const buf2 = Buffer.alloc(10); // 10 bytes, filled with zeros

// Compare buffers
const buf3 = Buffer.from("ABC");
const buf4 = Buffer.from("ABC");
console.log(buf3.equals(buf4)); // true
```

### Streams

Streams let you process data **piece by piece** instead of loading it all into memory at once. Essential for large files, video streaming, etc.

```javascript
const fs = require("fs");

// ===== READABLE STREAM =====
const readStream = fs.createReadStream("large-file.txt", {
    encoding: "utf8",
    highWaterMark: 64 * 1024, // Read 64KB at a time
});

readStream.on("data", (chunk) => {
    console.log(`Received ${chunk.length} bytes`);
});

readStream.on("end", () => {
    console.log("Done reading");
});

readStream.on("error", (err) => {
    console.error("Error:", err.message);
});

// ===== WRITABLE STREAM =====
const writeStream = fs.createWriteStream("output.txt");

writeStream.write("First line\n");
writeStream.write("Second line\n");
writeStream.end("Last line\n"); // Signals we're done

writeStream.on("finish", () => {
    console.log("Done writing");
});

// ===== PIPE (Connect readable to writable) =====
const readStream2 = fs.createReadStream("input.txt");
const writeStream2 = fs.createWriteStream("copy.txt");

readStream2.pipe(writeStream2); // Copies file efficiently
```

### Why Streams Matter

```
WITHOUT Streams:
1. Read entire 2GB file into memory → 💥 Out of memory
2. Process it
3. Write entire output

WITH Streams:
1. Read 64KB chunk
2. Process it
3. Write 64KB chunk
4. Repeat until done → ✅ Uses only 64KB memory
```

---

## Environment Variables

**Never hardcode** sensitive data (passwords, API keys, ports). Use environment variables.

### Using the `dotenv` Package

```bash
npm install dotenv
```

**.env file** (NEVER commit this to git):
```
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=my-super-secret-key-change-this
API_KEY=abc123def456
NODE_ENV=development
```

**.gitignore:**
```
.env
node_modules/
```

**Using in your code:**
```javascript
require("dotenv").config(); // Load .env file — do this FIRST

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

console.log(`Running in ${process.env.NODE_ENV} mode`);
```

### Common Environment Variables

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `development`, `production`, `test` |
| `PORT` | Server port |
| `DATABASE_URL` | Database connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `API_KEY` | Third-party API keys |
| `CORS_ORIGIN` | Allowed CORS origins |

---

## Key Takeaways

1. **Node.js = JavaScript runtime** built on V8 + libuv
2. **Single-threaded + event loop** = handles thousands of concurrent connections
3. **Non-blocking I/O** — Node never waits for slow operations
4. **Modules** keep code organized — one file = one module
5. **npm** manages packages — `package.json` is your project manifest
6. **Always use async/await** for asynchronous operations
7. **Streams** handle large data without blowing up memory
8. **Environment variables** keep secrets safe — never hardcode them
9. **Understanding the raw HTTP module** helps you appreciate Express

---

## Practice Exercises

1. **Create a file reader:** Read a JSON file, parse it, modify a value, write it back
2. **Event system:** Create a custom event emitter for a "task manager" — emit events for taskCreated, taskCompleted
3. **Raw HTTP server:** Build a simple API with 3 routes using only the `http` module
4. **Stream copy:** Copy a large file using streams and measure the time taken
5. **Environment config:** Set up a project with dotenv and access variables

---

**Previous:** [← Phase 01 — How The Internet Works](Phase-01-How-The-Internet-Works.md)

**Next:** [Phase 03 — Express.js Fundamentals →](Phase-03-ExpressJS-Fundamentals.md)
