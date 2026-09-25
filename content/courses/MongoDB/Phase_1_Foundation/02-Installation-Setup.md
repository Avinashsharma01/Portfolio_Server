# Phase 1: Installation and Setup

## 📖 Table of Contents

1. [MongoDB Installation](#mongodb-installation)
2. [MongoDB Compass (GUI)](#mongodb-compass-gui)
3. [Node.js and npm Setup](#nodejs-and-npm-setup)
4. [MongoDB Shell (mongosh)](#mongodb-shell-mongosh)
5. [Environment Configuration](#environment-configuration)
6. [Testing Your Installation](#testing-your-installation)

## MongoDB Installation

### Windows Installation

#### Method 1: MongoDB Community Server (Recommended)

1. **Download MongoDB**

    - Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
    - Select: Windows, MSI package
    - Download the latest stable version

2. **Install MongoDB**

    ```powershell
    # Run the downloaded .msi file as Administrator
    # Choose "Complete" installation
    # Install MongoDB as a Service (recommended)
    ```

3. **Verify Installation**

    ```powershell
    # Check if MongoDB service is running
    Get-Service -Name MongoDB

    # Or check the installation directory
    ls "C:\Program Files\MongoDB\Server\7.0\bin"
    ```

#### Method 2: Using Chocolatey

```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install MongoDB
choco install mongodb

# Start MongoDB service
net start MongoDB
```

#### Method 3: Using MongoDB Atlas (Cloud)

```javascript
// For cloud-based MongoDB (no local installation required)
// Sign up at https://www.mongodb.com/atlas
// Create a free cluster
// Get connection string for your application
```

### macOS Installation

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

### Linux (Ubuntu) Installation

```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

## MongoDB Compass (GUI)

MongoDB Compass is a graphical user interface for MongoDB that makes it easy to explore and manipulate your data.

### Installation

1. **Download Compass**

    - Visit [MongoDB Compass Download](https://www.mongodb.com/products/compass)
    - Select your operating system
    - Download and install

2. **Connect to MongoDB**

    ```
    Default connection string: mongodb://localhost:27017
    ```

3. **Compass Features**
    - Visual query builder
    - Real-time performance metrics
    - Schema analysis
    - Index management
    - Document CRUD operations

### Compass Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│ MongoDB Compass                                              │
├─────────────────────────────────────────────────────────────┤
│ Connection: localhost:27017                                  │
├─────────────────────────────────────────────────────────────┤
│ Databases:          │ Collections:      │ Documents:        │
│ ├── admin           │ ├── users         │ { _id: ...,       │
│ ├── config          │ ├── products      │   name: "John",   │
│ ├── local           │ └── orders        │   age: 30 }       │
│ └── myapp           │                   │                   │
└─────────────────────────────────────────────────────────────┘
```

## Node.js and npm Setup

### Install Node.js

#### Windows

```powershell
# Download from https://nodejs.org/
# Run the installer and follow the setup wizard

# Verify installation
node --version
npm --version
```

#### Using Package Managers

```powershell
# Windows (using Chocolatey)
choco install nodejs

# macOS (using Homebrew)
brew install node

# Linux (using apt)
sudo apt-get install nodejs npm
```

### Initialize a New Project

```powershell
# Create project directory
mkdir mongodb-tutorial
cd mongodb-tutorial

# Initialize npm project
npm init -y

# Create basic project structure
mkdir src
mkdir models
mkdir routes
mkdir config

# Create main files
New-Item -ItemType File -Path "src\app.js"
New-Item -ItemType File -Path "config\database.js"
New-Item -ItemType File -Path ".env"
```

### Install Required Packages

```powershell
# Core dependencies
npm install mongoose express dotenv

# Development dependencies
npm install -D nodemon

# Optional but useful packages
npm install cors helmet morgan bcryptjs jsonwebtoken
```

### Package.json Configuration

```json
{
    "name": "mongodb-tutorial",
    "version": "1.0.0",
    "description": "MongoDB and Mongoose tutorial project",
    "main": "src/app.js",
    "scripts": {
        "start": "node src/app.js",
        "dev": "nodemon src/app.js",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "dependencies": {
        "mongoose": "^7.5.0",
        "express": "^4.18.2",
        "dotenv": "^16.3.1"
    },
    "devDependencies": {
        "nodemon": "^3.0.1"
    }
}
```

## MongoDB Shell (mongosh)

The MongoDB Shell is an interactive JavaScript interface to MongoDB.

### Installation

```powershell
# mongosh is included with MongoDB Community Server
# Or install separately
npm install -g mongosh

# Verify installation
mongosh --version
```

### Connecting to MongoDB

```powershell
# Connect to local MongoDB instance
mongosh

# Connect with specific connection string
mongosh "mongodb://localhost:27017"

# Connect to MongoDB Atlas
mongosh "mongodb+srv://username:password@cluster.mongodb.net/database"
```

### Basic Shell Commands

```javascript
// Show current database
db

// Show all databases
show dbs

// Switch to a database (creates if doesn't exist)
use myapp

// Show collections in current database
show collections

// Show current database statistics
db.stats()

// Exit the shell
exit
```

### Shell Configuration

```javascript
// Create .mongoshrc.js in your home directory for custom configurations
// ~/.mongoshrc.js (macOS/Linux) or %USERPROFILE%\.mongoshrc.js (Windows)

// Custom prompt
prompt = function() {
    return db + " > ";
}

// Helper functions
function switchToTestDB() {
    use testdb;
    print("Switched to test database");
}

// Custom greeting
print("Welcome to MongoDB Shell!");
```

## Environment Configuration

### Create .env File

```bash
# .env file
MONGODB_URI=mongodb://localhost:27017/myapp
PORT=3000
NODE_ENV=development

# For MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myapp
```

### Database Configuration File

```javascript
// config/database.js
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

### Basic Express App Setup

```javascript
// src/app.js
const express = require("express");
const connectDB = require("../config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", (req, res) => {
    res.json({ message: "MongoDB Tutorial API is running!" });
});

// Health check route
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        mongodb:
            mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

## Testing Your Installation

### Test 1: MongoDB Service

```powershell
# Check if MongoDB is running
Get-Service -Name MongoDB

# Alternative check
netstat -an | findstr 27017
```

### Test 2: MongoDB Shell Connection

```javascript
// Open mongosh and run:
mongosh

// In the shell:
db.runCommand({ hello: 1 })
// Should return server information

// Create a test document
use testdb
db.test.insertOne({ message: "Hello MongoDB!" })
db.test.find()
```

### Test 3: Node.js Connection

```javascript
// test-connection.js
const mongoose = require("mongoose");

const testConnection = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/test", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("✅ MongoDB connection successful!");

        // Test basic operation
        const TestSchema = new mongoose.Schema({ name: String });
        const Test = mongoose.model("Test", TestSchema);

        const doc = new Test({ name: "Test Document" });
        await doc.save();

        console.log("✅ Document saved successfully!");

        const found = await Test.findOne({ name: "Test Document" });
        console.log("✅ Document retrieved:", found);
    } catch (error) {
        console.error("❌ Connection error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

testConnection();
```

### Test 4: Run the Test

```powershell
# Run the connection test
node test-connection.js

# Expected output:
# ✅ MongoDB connection successful!
# ✅ Document saved successfully!
# ✅ Document retrieved: { _id: ..., name: 'Test Document', __v: 0 }
```

## Common Installation Issues and Solutions

### Issue 1: MongoDB Service Won't Start

```powershell
# Solution 1: Check if port 27017 is in use
netstat -ano | findstr 27017

# Solution 2: Start service manually
net start MongoDB

# Solution 3: Check MongoDB log files
Get-Content "C:\Program Files\MongoDB\Server\7.0\log\mongod.log" -Tail 20
```

### Issue 2: Permission Denied

```powershell
# Run PowerShell as Administrator
# Or change data directory permissions
icacls "C:\data\db" /grant Users:F
```

### Issue 3: Connection Refused

```javascript
// Check connection string
mongodb://localhost:27017  // ✅ Correct
mongodb://localhost:270127 // ❌ Wrong port

// Check if MongoDB is running
// Use MongoDB Compass to test connection
```

### Issue 4: Mongoose Connection Errors

```javascript
// Common solutions:
const mongoose = require("mongoose");

// Add connection options
mongoose.connect("mongodb://localhost:27017/myapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s
    socketTimeoutMS: 45000, // Close sockets after 45s
});

// Handle connection events
mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("Disconnected from MongoDB");
});
```

## 🎯 Verification Checklist

Before proceeding to the next phase, ensure:

-   [ ] MongoDB is installed and running
-   [ ] MongoDB Compass is installed and can connect
-   [ ] Node.js and npm are installed
-   [ ] mongosh can connect to your MongoDB instance
-   [ ] Basic Express app with Mongoose connection works
-   [ ] You can create and query documents using mongosh
-   [ ] Environment variables are properly configured

## 📁 Project Structure

After setup, your project should look like:

```
mongodb-tutorial/
├── src/
│   └── app.js
├── config/
│   └── database.js
├── models/
├── routes/
├── .env
├── .gitignore
├── package.json
└── test-connection.js
```

---

## 🔄 Next Steps

Once your environment is set up:

1. Test all connections thoroughly
2. Familiarize yourself with MongoDB Compass
3. Practice basic shell commands
4. Move to **03-Database-Collections.md** to learn about MongoDB data organization

---

_Continue to Phase 2: Core Concepts_
