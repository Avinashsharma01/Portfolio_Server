# Phase 3: Mongoose Basics

## 📖 Table of Contents

1. [What is Mongoose?](#what-is-mongoose)
2. [Mongoose vs Native MongoDB Driver](#mongoose-vs-native-mongodb-driver)
3. [Installation and Setup](#installation-and-setup)
4. [Connection Management](#connection-management)
5. [Basic Mongoose Concepts](#basic-mongoose-concepts)
6. [First Mongoose Application](#first-mongoose-application)
7. [Error Handling](#error-handling)

## What is Mongoose?

**Mongoose** is an Object Document Mapping (ODM) library for MongoDB and Node.js. It provides a straight-forward, schema-based solution to model your application data with built-in type casting, validation, query building, and business logic hooks.

### Key Features of Mongoose

-   **Schema-based modeling** - Define the structure of your documents
-   **Built-in type casting** - Automatic data type conversion
-   **Validation** - Built-in and custom validation rules
-   **Middleware** - Pre and post hooks for operations
-   **Query building** - Chainable query interface
-   **Population** - Reference other documents easily
-   **Connection management** - Handle database connections efficiently

### Why Use Mongoose?

```javascript
// Without Mongoose (Native MongoDB Driver)
const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");
await client.connect();
const db = client.db("myapp");
const users = db.collection("users");

// Manual validation and type checking
const userData = {
    name: req.body.name,
    email: req.body.email,
    age: parseInt(req.body.age),
    createdAt: new Date(),
};

// No built-in validation
if (!userData.name || !userData.email) {
    throw new Error("Name and email are required");
}

await users.insertOne(userData);

// With Mongoose
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, min: 0 },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Automatic validation and type casting
const user = new User({
    name: req.body.name,
    email: req.body.email,
    age: req.body.age, // Automatically converted to Number
});

await user.save(); // Validation happens automatically
```

## Mongoose vs Native MongoDB Driver

### Comparison Table

| Feature            | Native MongoDB Driver | Mongoose                            |
| ------------------ | --------------------- | ----------------------------------- |
| **Learning Curve** | Steeper               | Easier for beginners                |
| **Performance**    | Faster (direct)       | Slightly slower (abstraction layer) |
| **Type Safety**    | Manual                | Built-in                            |
| **Validation**     | Manual                | Built-in + Custom                   |
| **Schema**         | Schema-less           | Schema-based                        |
| **Middleware**     | None                  | Pre/Post hooks                      |
| **Population**     | Manual $lookup        | Built-in populate()                 |
| **Query Building** | Object-based          | Chainable methods                   |
| **Bundle Size**    | Smaller               | Larger                              |

### When to Use Each

**Use Native MongoDB Driver when:**

-   Maximum performance is critical
-   You need full control over queries
-   Working with dynamic schemas
-   Building microservices with minimal dependencies
-   Working with legacy systems

**Use Mongoose when:**

-   Rapid application development
-   Team has varying MongoDB experience levels
-   Need built-in validation and type casting
-   Want schema enforcement
-   Building complex applications with relationships

## Installation and Setup

### Installing Mongoose

```powershell
# Install Mongoose
npm install mongoose

# Install additional useful packages
npm install dotenv

# Development dependencies
npm install -D @types/mongoose  # If using TypeScript
```

### Project Structure Setup

```powershell
# Create directories
mkdir models
mkdir routes
mkdir controllers
mkdir middleware
mkdir config
mkdir utils

# Create files
New-Item -ItemType File -Path "config\database.js"
New-Item -ItemType File -Path "models\User.js"
New-Item -ItemType File -Path "app.js"
New-Item -ItemType File -Path ".env"
```

### Environment Configuration

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/myapp
MONGODB_URI_TEST=mongodb://localhost:27017/myapp_test
NODE_ENV=development
PORT=3000

# For MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myapp?retryWrites=true&w=majority
```

## Connection Management

### Basic Connection

```javascript
// config/database.js
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

### Advanced Connection Configuration

```javascript
// config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Connection options
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            bufferCommands: false, // Disable mongoose buffering
            bufferMaxEntries: 0, // Disable mongoose buffering
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Connection event handlers
        mongoose.connection.on("connected", () => {
            console.log("Mongoose connected to MongoDB");
        });

        mongoose.connection.on("error", (err) => {
            console.error("Mongoose connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("Mongoose disconnected from MongoDB");
        });

        // Handle application termination
        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            console.log(
                "MongoDB connection closed due to application termination"
            );
            process.exit(0);
        });
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

### Multiple Database Connections

```javascript
// config/databases.js
const mongoose = require("mongoose");

// Primary database connection
const primaryDB = mongoose.createConnection(process.env.MONGODB_URI_PRIMARY);

// Analytics database connection
const analyticsDB = mongoose.createConnection(
    process.env.MONGODB_URI_ANALYTICS
);

// Logging database connection
const logsDB = mongoose.createConnection(process.env.MONGODB_URI_LOGS);

module.exports = {
    primaryDB,
    analyticsDB,
    logsDB,
};
```

### Connection States

```javascript
// Check connection state
const connectionStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
};

console.log(
    "Connection state:",
    connectionStates[mongoose.connection.readyState]
);

// Wait for connection to be ready
const waitForConnection = () => {
    return new Promise((resolve, reject) => {
        if (mongoose.connection.readyState === 1) {
            resolve();
        } else {
            mongoose.connection.on("connected", resolve);
            mongoose.connection.on("error", reject);
        }
    });
};
```

## Basic Mongoose Concepts

### Schema

A **Schema** defines the structure of documents within a collection.

```javascript
// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    // Basic types
    name: String,
    email: String,
    age: Number,
    isActive: Boolean,

    // With options
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    // Array of strings
    hobbies: [String],

    // Embedded document
    profile: {
        firstName: String,
        lastName: String,
        bio: { type: String, maxLength: 500 },
        avatar: String,
    },

    // Array of embedded documents
    addresses: [
        {
            type: { type: String, enum: ["home", "work", "other"] },
            street: String,
            city: String,
            zipCode: String,
            isPrimary: { type: Boolean, default: false },
        },
    ],

    // Dates
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    // Reference to another document
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
});

module.exports = mongoose.model("User", userSchema);
```

### Model

A **Model** is a compiled version of a Schema. It's a constructor function that creates documents.

```javascript
// Create model from schema
const User = mongoose.model("User", userSchema);

// Models are constructor functions
const user = new User({
    name: "John Doe",
    email: "john@example.com",
});

// Save to database
await user.save();
```

### Document

A **Document** is an instance of a Model. It represents a single record in MongoDB.

```javascript
// Create a new document
const user = new User({
    username: "john_doe",
    email: "john@example.com",
    age: 30,
});

// Document methods
console.log(user.isNew); // true (not saved yet)
console.log(user._id); // ObjectId (auto-generated)
console.log(user.toObject()); // Plain JavaScript object
console.log(user.toJSON()); // JSON representation

// Save the document
await user.save();
console.log(user.isNew); // false (now saved)
```

### Schema Types

```javascript
const mongoose = require("mongoose");
const { Schema } = mongoose;

const exampleSchema = new Schema({
    // Basic types
    stringField: String,
    numberField: Number,
    dateField: Date,
    booleanField: Boolean,
    arrayField: Array,
    objectField: Object,

    // Mongoose specific types
    objectIdField: Schema.Types.ObjectId,
    mixedField: Schema.Types.Mixed,
    bufferField: Buffer,

    // Decimal128 for precise decimal numbers
    priceField: Schema.Types.Decimal128,

    // Map type for key-value pairs
    metadataField: {
        type: Map,
        of: String,
    },

    // Array of specific type
    tagsField: [String],
    numbersField: [Number],

    // Array of embedded documents
    commentsField: [
        {
            author: String,
            content: String,
            createdAt: { type: Date, default: Date.now },
        },
    ],
});
```

## First Mongoose Application

### Complete Example

```javascript
// app.js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

// User Schema and Model
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minLength: [3, "Username must be at least 3 characters"],
            maxLength: [20, "Username cannot exceed 20 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        age: {
            type: Number,
            min: [0, "Age cannot be negative"],
            max: [120, "Age cannot exceed 120"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

const User = mongoose.model("User", userSchema);

// Routes

// GET /users - Get all users
app.get("/users", async (req, res) => {
    try {
        const users = await User.find({ isActive: true })
            .select("-__v") // Exclude version key
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message,
        });
    }
});

// GET /users/:id - Get user by ID
app.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
            error: error.message,
        });
    }
});

// POST /users - Create new user
app.post("/users", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message
            );
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors,
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Username or email already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message,
        });
    }
});

// PUT /users/:id - Update user
app.put("/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return updated document
            runValidators: true, // Run schema validation
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message
            );
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors,
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message,
        });
    }
});

// DELETE /users/:id - Delete user (soft delete)
app.delete("/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error.message,
        });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        mongodb:
            mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        timestamp: new Date().toISOString(),
    });
});

// Start server
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer().catch(console.error);

module.exports = app;
```

### Testing the Application

```javascript
// test-api.js
const axios = require("axios");

const API_BASE = "http://localhost:3000";

const testAPI = async () => {
    try {
        // Test health check
        console.log("Testing health check...");
        const health = await axios.get(`${API_BASE}/health`);
        console.log("Health:", health.data);

        // Create a user
        console.log("\nCreating user...");
        const newUser = await axios.post(`${API_BASE}/users`, {
            username: "testuser",
            email: "test@example.com",
            age: 25,
        });
        console.log("Created user:", newUser.data);

        const userId = newUser.data.data._id;

        // Get all users
        console.log("\nGetting all users...");
        const allUsers = await axios.get(`${API_BASE}/users`);
        console.log("All users:", allUsers.data);

        // Get user by ID
        console.log("\nGetting user by ID...");
        const userById = await axios.get(`${API_BASE}/users/${userId}`);
        console.log("User by ID:", userById.data);

        // Update user
        console.log("\nUpdating user...");
        const updatedUser = await axios.put(`${API_BASE}/users/${userId}`, {
            age: 26,
        });
        console.log("Updated user:", updatedUser.data);

        // Delete user
        console.log("\nDeleting user...");
        const deletedUser = await axios.delete(`${API_BASE}/users/${userId}`);
        console.log("Deleted user:", deletedUser.data);
    } catch (error) {
        console.error("Test failed:", error.response?.data || error.message);
    }
};

// Run tests
testAPI();
```

## Error Handling

### Common Mongoose Errors

```javascript
// Error handling utility
const handleMongooseError = (error) => {
    if (error.name === "ValidationError") {
        // Validation errors
        const errors = Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
            value: err.value,
        }));

        return {
            type: "validation",
            message: "Validation failed",
            errors: errors,
        };
    }

    if (error.name === "CastError") {
        // Invalid ObjectId or type casting error
        return {
            type: "cast",
            message: `Invalid ${error.path}: ${error.value}`,
            field: error.path,
        };
    }

    if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        return {
            type: "duplicate",
            message: `${field} already exists`,
            field: field,
        };
    }

    if (error.name === "DocumentNotFoundError") {
        // Document not found
        return {
            type: "not_found",
            message: "Document not found",
        };
    }

    // Generic server error
    return {
        type: "server",
        message: "Internal server error",
        originalError: error.message,
    };
};

// Usage in route handler
app.post("/users", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        const errorInfo = handleMongooseError(error);

        const statusCode =
            {
                validation: 400,
                cast: 400,
                duplicate: 409,
                not_found: 404,
                server: 500,
            }[errorInfo.type] || 500;

        res.status(statusCode).json({
            success: false,
            error: errorInfo,
        });
    }
});
```

### Connection Error Handling

```javascript
// config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Connection options with error handling
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
            // Attempt to reconnect
            setTimeout(() => {
                console.log("Attempting to reconnect to MongoDB...");
                mongoose.connect(process.env.MONGODB_URI);
            }, 5000);
        });

        mongoose.connection.on("reconnected", () => {
            console.log("MongoDB reconnected");
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);

        // Retry logic
        if (process.env.NODE_ENV !== "test") {
            console.log("Retrying connection in 5 seconds...");
            setTimeout(() => connectDB(), 5000);
        } else {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
```

## 🎯 Practice Exercises

### Exercise 1: Basic CRUD with Mongoose

Create a simple blog system with:

1. Post model with title, content, author, and timestamps
2. Basic CRUD API endpoints
3. Proper error handling
4. Input validation

### Exercise 2: Schema Design

Design schemas for:

1. User with profile information and preferences
2. Product with variants and categories
3. Order with items and shipping information

### Exercise 3: Connection Management

Implement:

1. Connection retry logic
2. Graceful shutdown handling
3. Connection monitoring
4. Multiple database connections

## 🔧 Best Practices

### Schema Design

1. **Use appropriate data types** for each field
2. **Add validation rules** at the schema level
3. **Set default values** where appropriate
4. **Use indexes** for frequently queried fields
5. **Keep schemas focused** and avoid over-nesting

### Connection Management

1. **Reuse connections** - don't create multiple connections unnecessarily
2. **Handle connection events** properly
3. **Implement retry logic** for production environments
4. **Close connections** gracefully on application shutdown
5. **Monitor connection health** regularly

### Error Handling

1. **Catch and handle** all Mongoose errors appropriately
2. **Provide meaningful error messages** to clients
3. **Log errors** for debugging and monitoring
4. **Use proper HTTP status codes**
5. **Don't expose sensitive error details** in production

---

## 🔄 Next Steps

After mastering Mongoose basics:

1. Practice building complete CRUD applications
2. Experiment with different schema designs
3. Learn about validation and middleware
4. Move to **06-Schema-Models.md** to dive deeper into schemas and models

---

_Continue to Phase 3: Schema and Models_
