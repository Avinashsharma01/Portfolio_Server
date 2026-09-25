# Phase 09 — Database Fundamentals

## Table of Contents

- [Why Databases?](#why-databases)
- [SQL vs NoSQL](#sql-vs-nosql)
- [MongoDB — NoSQL Document Database](#mongodb--nosql-document-database)
- [Mongoose — MongoDB ODM](#mongoose--mongodb-odm)
- [Schema Design](#schema-design)
- [CRUD Operations with Mongoose](#crud-operations-with-mongoose)
- [Querying Data](#querying-data)
- [Mongoose Middleware (Hooks)](#mongoose-middleware-hooks)
- [Relationships & Population](#relationships--population)
- [Indexing](#indexing)
- [PostgreSQL — Relational Database](#postgresql--relational-database)
- [Connecting Express to PostgreSQL](#connecting-express-to-postgresql)
- [Database Best Practices](#database-best-practices)
- [Key Takeaways](#key-takeaways)

---

## Why Databases?

Without a database, data lives only in memory — it's lost when the server restarts.

```
WITHOUT DATABASE:
Server starts → Data in memory → Server restarts → DATA GONE ❌

WITH DATABASE:
Server starts → Data in database → Server restarts → Data still there ✅
```

### Types of Data Storage

```
In-Memory (variables)     → Fastest, temporary, lost on restart
File System (JSON files)  → Persistent, slow, no query capability
Database (MongoDB, SQL)   → Persistent, fast, queryable, scalable ✅
```

---

## SQL vs NoSQL

### SQL (Relational Databases)

Data is stored in **tables** with **rows** and **columns**. Strict schema.

```
Users Table:
┌────┬──────────┬──────────────────────┬─────────┐
│ id │ name     │ email                │ age     │
├────┼──────────┼──────────────────────┼─────────┤
│ 1  │ Avinash  │ avinash@example.com  │ 25      │
│ 2  │ John     │ john@example.com     │ 30      │
└────┴──────────┴──────────────────────┴─────────┘

Every row MUST have the same columns. Adding a new column affects ALL rows.
```

Examples: PostgreSQL, MySQL, SQLite, Microsoft SQL Server

### NoSQL (Non-Relational Databases)

Data is stored in **documents** (JSON-like objects). Flexible schema.

```
Users Collection:
{
    "_id": "64a1b2c3d4e5f6",
    "name": "Avinash",
    "email": "avinash@example.com",
    "age": 25,
    "hobbies": ["coding", "reading"]       ← Array field
}

{
    "_id": "64a1b2c3d4e5f7",
    "name": "John",
    "email": "john@example.com"
    // No age field! That's fine in NoSQL  ← Flexible schema
}
```

Examples: MongoDB, CouchDB, DynamoDB, Firebase Firestore

### Comparison Table

| Feature | SQL (PostgreSQL) | NoSQL (MongoDB) |
|---------|-----------------|-----------------|
| **Structure** | Tables, rows, columns | Collections, documents |
| **Schema** | Strict (must define columns) | Flexible (any shape) |
| **Query Language** | SQL | MongoDB Query Language |
| **Relationships** | JOINs (built-in, powerful) | References or embedding |
| **Scaling** | Vertical (bigger server) | Horizontal (more servers) |
| **ACID** | Full support | Limited support |
| **Best For** | Complex relationships, transactions | Rapid development, flexible data |
| **Learning Curve** | Medium | Lower |

### When to Use What

```
Use SQL (PostgreSQL) when:
├── Data has complex relationships (users, orders, products)
├── Data integrity is critical (banking, healthcare)
├── You need complex queries with JOINs
└── Schema is well-defined and unlikely to change

Use NoSQL (MongoDB) when:
├── Schema changes frequently (startups, prototyping)
├── You need horizontal scaling
├── Data is document-oriented (blogs, CMS, catalogs)
└── Speed of development is priority
```

---

## MongoDB — NoSQL Document Database

### Terminology Mapping

```
SQL Term        →  MongoDB Term
Database        →  Database
Table           →  Collection
Row             →  Document
Column          →  Field
Primary Key     →  _id (auto-generated ObjectId)
JOIN            →  $lookup / populate
```

### Install MongoDB

```bash
# Option 1: Install locally
# Download from mongodb.com

# Option 2: Use MongoDB Atlas (free cloud database)
# Sign up at mongodb.com/atlas
# Create a free cluster
# Get connection string

# Option 3: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Connect from Node.js (Native Driver)

```bash
npm install mongodb
```

```javascript
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function main() {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("myapp");
    const users = db.collection("users");

    // Insert
    await users.insertOne({ name: "Avinash", email: "avinash@example.com" });

    // Find
    const allUsers = await users.find({}).toArray();
    console.log(allUsers);

    await client.close();
}

main();
```

---

## Mongoose — MongoDB ODM

**Mongoose** is an Object Document Mapper (ODM). It provides:
- Schema definition (structure for your documents)
- Validation
- Type casting
- Query building
- Middleware (hooks)

```bash
npm install mongoose
```

### Connect with Mongoose

```javascript
// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
```

```javascript
// app.js
const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
app.use(express.json());

// Connect to database
connectDB();

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

## Schema Design

### Defining a Schema

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    // Basic types
    name: String,                    // Short for { type: String }
    email: String,
    age: Number,
    isActive: Boolean,
    createdAt: Date,

    // With validation
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, "Must be at least 3 characters"],
        maxlength: [30, "Must be at most 30 characters"],
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    role: {
        type: String,
        enum: ["user", "admin", "moderator"],
        default: "user",
    },

    // Nested object
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
    },

    // Array of strings
    hobbies: [String],

    // Array of objects
    socialLinks: [{
        platform: String,
        url: String,
    }],

    // Reference to another model
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    }],
}, {
    timestamps: true,  // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
```

### Schema Types Reference

| Type | Example |
|------|---------|
| `String` | `"Hello"` |
| `Number` | `42`, `3.14` |
| `Boolean` | `true`, `false` |
| `Date` | `new Date()` |
| `Buffer` | Binary data |
| `ObjectId` | `mongoose.Schema.Types.ObjectId` |
| `Array` | `[String]`, `[{ name: String }]` |
| `Map` | `new Map()` |
| `Mixed` | Any type (⚠️ use sparingly) |

### Validation Options

```javascript
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,     // Must be provided
        trim: true,         // Remove whitespace
        minlength: 2,       // Minimum string length
        maxlength: 100,     // Maximum string length
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"],
        max: [100000, "Price too high"],
    },
    category: {
        type: String,
        enum: {
            values: ["electronics", "clothing", "books"],
            message: "{VALUE} is not a valid category",
        },
    },
    sku: {
        type: String,
        validate: {
            validator: function(v) {
                return /^[A-Z]{3}-\d{4}$/.test(v);
            },
            message: props => `${props.value} is not a valid SKU (format: ABC-1234)`,
        },
    },
});
```

### Virtual Properties

Virtuals are computed properties that don't get stored in the database.

```javascript
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
});

// Virtual property
userSchema.virtual("fullName").get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Now user.fullName works, but it's not stored in DB
const user = await User.findById(id);
console.log(user.fullName); // "Avinash Kumar"
```

### Instance Methods

```javascript
userSchema.methods.isAdmin = function() {
    return this.role === "admin";
};

userSchema.methods.getPublicProfile = function() {
    const { password, __v, ...profile } = this.toObject();
    return profile;
};

// Usage
const user = await User.findById(id);
console.log(user.isAdmin());       // true or false
console.log(user.getPublicProfile()); // user without password
```

### Static Methods

```javascript
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.getAdmins = function() {
    return this.find({ role: "admin" });
};

// Usage
const user = await User.findByEmail("avinash@example.com");
const admins = await User.getAdmins();
```

---

## CRUD Operations with Mongoose

### Create

```javascript
// Method 1: create()
const user = await User.create({
    name: "Avinash",
    email: "avinash@example.com",
    age: 25,
});

// Method 2: new + save()
const user = new User({ name: "Avinash", email: "avinash@example.com" });
await user.save();

// Method 3: insertMany()
const users = await User.insertMany([
    { name: "User A", email: "a@example.com" },
    { name: "User B", email: "b@example.com" },
]);
```

### Read

```javascript
// Find all
const allUsers = await User.find();

// Find with conditions
const admins = await User.find({ role: "admin" });

// Find one
const user = await User.findOne({ email: "avinash@example.com" });

// Find by ID
const user = await User.findById("64a1b2c3d4e5f6");

// Select specific fields
const user = await User.findById(id).select("name email -_id");

// Exclude fields
const user = await User.findById(id).select("-password -__v");
```

### Update

```javascript
// findByIdAndUpdate (returns OLD document by default)
const user = await User.findByIdAndUpdate(
    id,
    { name: "New Name" },
    { new: true, runValidators: true } // new: true returns the updated document
);

// findOneAndUpdate
const user = await User.findOneAndUpdate(
    { email: "old@example.com" },
    { email: "new@example.com" },
    { new: true, runValidators: true }
);

// updateOne (doesn't return the document)
await User.updateOne({ _id: id }, { $set: { isActive: true } });

// updateMany
await User.updateMany({ isActive: false }, { $set: { isActive: true } });
```

### Delete

```javascript
// findByIdAndDelete
const user = await User.findByIdAndDelete(id);

// findOneAndDelete
const user = await User.findOneAndDelete({ email: "test@example.com" });

// deleteOne
await User.deleteOne({ _id: id });

// deleteMany
await User.deleteMany({ isActive: false });
```

---

## Querying Data

### MongoDB Query Operators

```javascript
// Comparison
const results = await Product.find({
    price: { $gt: 100 },        // Greater than
    price: { $gte: 100 },       // Greater than or equal
    price: { $lt: 50 },         // Less than
    price: { $lte: 50 },        // Less than or equal
    price: { $ne: 0 },          // Not equal
    category: { $in: ["electronics", "books"] },    // In array
    category: { $nin: ["clothing"] },               // Not in array
});

// Logical
const results = await Product.find({
    $and: [{ price: { $gte: 10 } }, { price: { $lte: 100 } }],
    $or: [{ category: "electronics" }, { category: "books" }],
    $not: { price: { $gt: 100 } },
});

// Element
const results = await User.find({
    age: { $exists: true },      // Field exists
    role: { $type: "string" },   // Field type
});

// Regex
const results = await User.find({
    name: { $regex: /avinash/i }, // Case-insensitive search
});
```

### Method Chaining

```javascript
const users = await User.find({ role: "user" })
    .select("name email age")       // Select fields
    .sort({ createdAt: -1 })        // Sort (descending)
    .skip(20)                       // Skip first 20
    .limit(10)                      // Take only 10
    .lean();                        // Return plain JS objects (faster)
```

### Aggregation Pipeline

For complex data processing:

```javascript
// Get average age by role
const stats = await User.aggregate([
    { $match: { isActive: true } },                    // Filter
    { $group: {
        _id: "$role",                                  // Group by role
        count: { $sum: 1 },                           // Count
        avgAge: { $avg: "$age" },                     // Average
        minAge: { $min: "$age" },                     // Min
        maxAge: { $max: "$age" },                     // Max
    }},
    { $sort: { avgAge: -1 } },                        // Sort
]);
// Result: [{ _id: "admin", count: 5, avgAge: 32.4, ... }, ...]
```

---

## Mongoose Middleware (Hooks)

Middleware runs at specific points in the lifecycle.

### Pre Middleware

```javascript
// Hash password before saving
const bcrypt = require("bcryptjs");

userSchema.pre("save", async function(next) {
    // Only hash if password was modified
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Set slug before saving
postSchema.pre("save", function(next) {
    this.slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    next();
});
```

### Post Middleware

```javascript
// Log after saving
userSchema.post("save", function(doc) {
    console.log(`User ${doc.name} was saved`);
});

// Remove related data after deleting a user
userSchema.post("findOneAndDelete", async function(doc) {
    if (doc) {
        await Post.deleteMany({ author: doc._id });
        await Comment.deleteMany({ author: doc._id });
    }
});
```

### Query Middleware

```javascript
// Auto-exclude inactive users from all queries
userSchema.pre(/^find/, function(next) {
    this.find({ isActive: { $ne: false } });
    next();
});

// Populate author on all find queries
postSchema.pre(/^find/, function(next) {
    this.populate("author", "name avatar");
    next();
});
```

---

## Relationships & Population

### Approach 1: Embedding (Denormalization)

Store related data directly inside the document.

```javascript
// Embedded comments within a post
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    comments: [{
        text: String,
        author: String,
        createdAt: { type: Date, default: Date.now },
    }],
});

// Good for: Small, bounded data that's always accessed together
// Bad for: Large arrays, data accessed independently
```

### Approach 2: Referencing (Normalization)

Store references (IDs) and use `populate()` to load related data.

```javascript
// Post references User
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }],
});

// Comment references both Post and User
const commentSchema = new mongoose.Schema({
    text: String,
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// Populate to get full data
const post = await Post.findById(id)
    .populate("author", "name email")        // Get author's name and email
    .populate({
        path: "comments",
        populate: { path: "author", select: "name" }, // Nested populate
    });
```

### When to Embed vs Reference

```
EMBED when:
├── 1:Few relationship (max ~100 items)
├── Data is always accessed together
├── Data doesn't change often
└── Example: User → addresses, Post → tags

REFERENCE when:
├── 1:Many or Many:Many relationship
├── Data is accessed independently
├── Data changes frequently
├── Array might grow unbounded
└── Example: User → posts, Post → comments
```

---

## Indexing

Indexes speed up queries dramatically.

```javascript
// In schema definition
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },    // Unique index
    name: { type: String, index: true },      // Regular index
    createdAt: { type: Date, index: true },
});

// Compound index
userSchema.index({ firstName: 1, lastName: 1 });

// Text index (for full-text search)
postSchema.index({ title: "text", content: "text" });

// TTL index (auto-delete after time)
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 }); // Delete after 1 hour
```

```javascript
// Use text index for search
const results = await Post.find(
    { $text: { $search: "node express tutorial" } },
    { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } });
```

---

## PostgreSQL — Relational Database

### SQL Basics for Node.js Developers

```sql
-- Create a table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER CHECK (age >= 0),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert
INSERT INTO users (name, email, age) VALUES ('Avinash', 'avinash@example.com', 25);

-- Select
SELECT * FROM users;
SELECT name, email FROM users WHERE role = 'admin';
SELECT * FROM users ORDER BY created_at DESC LIMIT 10 OFFSET 20;

-- Update
UPDATE users SET name = 'New Name' WHERE id = 1;

-- Delete
DELETE FROM users WHERE id = 1;

-- Relationships (JOIN)
SELECT users.name, posts.title
FROM users
JOIN posts ON users.id = posts.author_id
WHERE users.id = 1;
```

---

## Connecting Express to PostgreSQL

### Option 1: pg (Node-Postgres)

```bash
npm install pg
```

```javascript
const { Pool } = require("pg");

const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "myapp",
    user: "postgres",
    password: process.env.DB_PASSWORD,
});

// Query function
const query = async (text, params) => {
    const result = await pool.query(text, params);
    return result.rows;
};

// Usage in routes
app.get("/api/users", async (req, res) => {
    const users = await query("SELECT id, name, email FROM users");
    res.json({ success: true, data: users });
});

app.get("/api/users/:id", async (req, res) => {
    const users = await query(
        "SELECT id, name, email FROM users WHERE id = $1",  // $1 = parameterized (prevents SQL injection)
        [req.params.id]
    );
    if (users.length === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: users[0] });
});

app.post("/api/users", async (req, res) => {
    const { name, email, age } = req.body;
    const users = await query(
        "INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *",
        [name, email, age]
    );
    res.status(201).json({ success: true, data: users[0] });
});
```

### Option 2: Prisma ORM (Modern, Type-safe)

```bash
npm install prisma @prisma/client
npx prisma init
```

```prisma
// prisma/schema.prisma
datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

generator client {
    provider = "prisma-client-js"
}

model User {
    id        Int      @id @default(autoincrement())
    name      String
    email     String   @unique
    posts     Post[]
    createdAt DateTime @default(now())
}

model Post {
    id        Int      @id @default(autoincrement())
    title     String
    content   String
    author    User     @relation(fields: [authorId], references: [id])
    authorId  Int
    createdAt DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name init   # Create tables
npx prisma generate                  # Generate client
```

```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
    data: { name: "Avinash", email: "avinash@example.com" },
});

// Read
const users = await prisma.user.findMany({
    include: { posts: true },  // Include related posts
});

// Update
const user = await prisma.user.update({
    where: { id: 1 },
    data: { name: "New Name" },
});

// Delete
await prisma.user.delete({ where: { id: 1 } });
```

---

## Database Best Practices

### 1. Always Use Environment Variables for Credentials

```javascript
// ✅ Good
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ❌ Never hardcode credentials
const pool = new Pool({ password: "my-secret-password" });
```

### 2. Use Connection Pooling

```javascript
// ✅ Pool (reuses connections — efficient)
const pool = new Pool({ max: 20 });

// ❌ Creating new connections per request (slow, leaks)
```

### 3. Handle Connection Errors

```javascript
mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected, attempting reconnect...");
});
```

### 4. Use Transactions for Multi-Step Operations

```javascript
// Mongoose transaction
const session = await mongoose.startSession();
session.startTransaction();

try {
    const user = await User.create([{ name: "Avinash" }], { session });
    await Account.create([{ userId: user[0]._id, balance: 0 }], { session });
    await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();
    throw error;
} finally {
    session.endSession();
}
```

### 5. Validate at Multiple Levels

```
Client-side validation    → Quick feedback (can be bypassed)
API-level validation      → Middleware checks (express-validator)
Database-level validation → Schema constraints (last line of defense)
```

### 6. Seed & Migrate

```javascript
// seeds/seed.js — Populate database with initial data
const seedDB = async () => {
    await User.deleteMany({});
    await User.insertMany([
        { name: "Admin", email: "admin@example.com", role: "admin" },
        { name: "User", email: "user@example.com", role: "user" },
    ]);
    console.log("Database seeded!");
};
```

---

## Key Takeaways

1. **SQL is structured** (tables), **NoSQL is flexible** (documents)
2. **MongoDB + Mongoose** is the most common combo for Node.js
3. **Schemas define structure**, even in "schema-less" MongoDB
4. **Validation, middleware, virtuals** make Mongoose powerful
5. **Embed for small, related data** — reference for large, independent data
6. **Indexes make queries fast** but slow down writes — use wisely
7. **Parameterized queries prevent SQL injection** — NEVER concatenate user input into SQL
8. **Connection pooling is essential** for production
9. **Transactions ensure data consistency** across multiple operations
10. **PostgreSQL** is excellent when you need strict relationships and ACID compliance

---

## Practice Exercises

1. **Set up MongoDB:** Connect an Express app to MongoDB Atlas with Mongoose
2. **User model:** Create a User schema with validation, virtuals, and instance methods
3. **CRUD API:** Build a full CRUD API for a "Product" resource with Mongoose
4. **Relationships:** Create Post and Comment models with references and populate
5. **Aggregation:** Write an aggregation pipeline to get stats (count, average) by category
6. **PostgreSQL:** Set up PostgreSQL and build the same CRUD API with `pg` or Prisma

---

**Previous:** [← Phase 08 — REST API Design](Phase-08-REST-API-Design.md)

**Next:** [Phase 10 — Authentication & Authorization →](Phase-10-Authentication-Authorization.md)
