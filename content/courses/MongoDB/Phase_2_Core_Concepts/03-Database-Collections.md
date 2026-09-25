# Phase 2: Databases and Collections

## 📖 Table of Contents

1. [Understanding Databases](#understanding-databases)
2. [Working with Collections](#working-with-collections)
3. [Document Structure](#document-structure)
4. [Database Operations](#database-operations)
5. [Collection Operations](#collection-operations)
6. [Practical Examples](#practical-examples)

## Understanding Databases

A **database** in MongoDB is a container for collections. It's similar to a schema in traditional SQL databases but more flexible.

### Database Characteristics

-   **Dynamic Creation**: Databases are created automatically when you first store data
-   **Case Sensitive**: `MyApp` and `myapp` are different databases
-   **Naming Rules**: Use lowercase, no spaces, limited special characters
-   **Storage**: Each database has its own set of files on disk

### Database Naming Conventions

```javascript
// ✅ Good database names
myapp
ecommerce_store
user_management
blog_2024

// ❌ Avoid these
MyApp           // Mixed case
my app          // Spaces
my-app@2024     // Special characters
admin           // Reserved name
config          // Reserved name
local           // Reserved name
```

### Working with Databases

#### Using MongoDB Shell (mongosh)

```javascript
// Show all databases
show dbs

// Current database
db

// Switch to database (creates if doesn't exist)
use myapp

// Database won't appear in 'show dbs' until it has data
db.users.insertOne({name: "John"})

// Now check again
show dbs

// Drop a database (be careful!)
use testdb
db.dropDatabase()
```

#### Database Information

```javascript
// Get database statistics
db.stats()

// Sample output:
{
  "db": "myapp",
  "collections": 3,
  "views": 0,
  "objects": 150,
  "avgObjSize": 245.6,
  "dataSize": 36840,
  "storageSize": 98304,
  "indexes": 3,
  "indexSize": 98304
}

// Get database name
db.getName()

// List all collections in current database
db.listCollections()
```

## Working with Collections

A **collection** is a group of MongoDB documents. It's the equivalent of a table in relational databases, but without a predefined schema.

### Collection Characteristics

-   **Schema-less**: Documents in a collection can have different structures
-   **Dynamic Creation**: Collections are created when you insert the first document
-   **Indexing**: Support indexes for performance optimization
-   **Flexible**: Can contain any BSON document type

### Collection Naming Conventions

```javascript
// ✅ Good collection names
users
products
blog_posts
order_items
user_sessions

// ❌ Avoid these
Users           // Capital letters (use lowercase)
user-profiles   // Hyphens (use underscores)
user profiles   // Spaces
system.users    // System prefix (reserved)
```

### Creating Collections

#### Implicit Creation (Recommended)

```javascript
// Collection is created when you insert first document
use ecommerce
db.products.insertOne({
  name: "Laptop",
  price: 999.99,
  brand: "TechCorp"
})

// Collection 'products' is now created
show collections
```

#### Explicit Creation

```javascript
// Create collection explicitly
db.createCollection("users");

// Create with options
db.createCollection("orders", {
    capped: true, // Fixed size collection
    size: 100000, // Size in bytes
    max: 1000, // Maximum number of documents
    validator: {
        // Document validation
        $jsonSchema: {
            bsonType: "object",
            required: ["email", "name"],
            properties: {
                email: {
                    bsonType: "string",
                    description: "must be a string and is required",
                },
            },
        },
    },
});
```

### Collection Operations

```javascript
// List all collections
show collections
// or
db.listCollections()

// Get collection statistics
db.users.stats()

// Rename a collection
db.old_name.renameCollection("new_name")

// Drop a collection
db.users.drop()

// Check if collection exists
db.listCollections({name: "users"}).hasNext()
```

## Document Structure

Documents are the basic unit of data in MongoDB, stored in BSON format.

### Document Characteristics

-   **Flexible Schema**: Each document can have different fields
-   **Rich Data Types**: Supports various BSON data types
-   **Nested Structure**: Can contain embedded documents and arrays
-   **Size Limit**: Maximum document size is 16MB

### Document Structure Example

```javascript
// User document with various data types
{
  _id: ObjectId("64a1234567890abcdef12345"),

  // Basic fields
  username: "john_doe",
  email: "john@example.com",
  age: 30,
  isActive: true,

  // Embedded document
  profile: {
    firstName: "John",
    lastName: "Doe",
    bio: "Software developer passionate about technology",
    avatar: "https://example.com/avatar.jpg"
  },

  // Array of strings
  hobbies: ["coding", "reading", "gaming"],

  // Array of embedded documents
  addresses: [
    {
      type: "home",
      street: "123 Main St",
      city: "New York",
      zipCode: "10001",
      isPrimary: true
    },
    {
      type: "work",
      street: "456 Office Blvd",
      city: "New York",
      zipCode: "10002",
      isPrimary: false
    }
  ],

  // Date fields
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-08-11T14:22:00Z"),
  lastLogin: ISODate("2024-08-11T09:15:00Z"),

  // Numeric fields
  loginCount: NumberInt(45),
  balance: NumberDecimal("1250.75"),

  // Null and undefined
  middleName: null,

  // Binary data
  profileHash: BinData(0, "aGVsbG8gd29ybGQ="),

  // Reference to another document
  companyId: ObjectId("64a9876543210fedcba09876")
}
```

### The \_id Field

Every MongoDB document must have an `_id` field that serves as the primary key.

```javascript
// Auto-generated ObjectId (default)
{
  _id: ObjectId("64a1234567890abcdef12345"),
  name: "John"
}

// Custom _id
{
  _id: "user_001",
  name: "John"
}

// Numeric _id
{
  _id: 12345,
  name: "John"
}

// Compound _id
{
  _id: {
    userId: "john_doe",
    type: "profile"
  },
  name: "John"
}
```

### ObjectId Structure

```javascript
// ObjectId breakdown
ObjectId("64a1234567890abcdef12345");
//        |---------|----------|----
//        timestamp  random     inc

// Extract timestamp from ObjectId
ObjectId("64a1234567890abcdef12345").getTimestamp();
// Returns: ISODate("2023-07-02T10:30:13Z")

// Generate ObjectId for specific time
ObjectId.fromDate(new Date("2024-01-01"));
```

## Database Operations

### Database Administration

```javascript
// Current database info
db;

// Database statistics (detailed)
db.stats();

// Database size information
db.stats().dataSize; // Data size in bytes
db.stats().storageSize; // Storage size in bytes
db.stats().indexSize; // Index size in bytes

// Server status
db.serverStatus();

// Database version
db.version();

// Current operations
db.currentOp();

// Repair database (use with caution)
db.repairDatabase();
```

### Database Security

```javascript
// Create user for database
use myapp
db.createUser({
  user: "appUser",
  pwd: "securePassword123",
  roles: [
    { role: "readWrite", db: "myapp" },
    { role: "read", db: "reports" }
  ]
})

// List users in current database
db.getUsers()

// Update user
db.updateUser("appUser", {
  roles: [
    { role: "readWrite", db: "myapp" },
    { role: "dbAdmin", db: "myapp" }
  ]
})

// Drop user
db.dropUser("appUser")
```

### Database Backup and Restore

```bash
# Backup single database
mongodump --db myapp --out ./backup

# Restore database
mongorestore --db myapp ./backup/myapp

# Backup with authentication
mongodump --host localhost --port 27017 --username user --password pass --db myapp
```

## Collection Operations

### Collection Management

```javascript
// Create collection with validation
db.createCollection("products", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "price", "category"],
            properties: {
                name: {
                    bsonType: "string",
                    description:
                        "Product name is required and must be a string",
                },
                price: {
                    bsonType: "number",
                    minimum: 0,
                    description: "Price must be a positive number",
                },
                category: {
                    bsonType: "string",
                    enum: ["electronics", "clothing", "books", "sports"],
                    description: "Category must be one of the enum values",
                },
            },
        },
    },
});
```

### Collection Indexing

```javascript
// Create index on single field
db.users.createIndex({ email: 1 }); // Ascending
db.users.createIndex({ createdAt: -1 }); // Descending

// Create compound index
db.users.createIndex({
    lastName: 1,
    firstName: 1,
});

// Create text index for search
db.products.createIndex({
    name: "text",
    description: "text",
});

// Create unique index
db.users.createIndex({ email: 1 }, { unique: true });

// List all indexes
db.users.getIndexes();

// Drop index
db.users.dropIndex("email_1");
```

### Collection Statistics

```javascript
// Collection statistics
db.users.stats()

// Sample output:
{
  "ns": "myapp.users",
  "size": 12500,
  "count": 50,
  "avgObjSize": 250,
  "storageSize": 20480,
  "capped": false,
  "nindexes": 3,
  "totalIndexSize": 6144
}

// Count documents
db.users.countDocuments()
db.users.countDocuments({ isActive: true })

// Estimated count (faster for large collections)
db.users.estimatedDocumentCount()
```

## Practical Examples

### E-commerce Database Structure

```javascript
// Switch to ecommerce database
use ecommerce

// Users collection
db.users.insertMany([
  {
    _id: ObjectId(),
    username: "john_doe",
    email: "john@example.com",
    password: "$2b$10$...", // hashed password
    profile: {
      firstName: "John",
      lastName: "Doe",
      phone: "+1-555-123-4567"
    },
    addresses: [
      {
        type: "shipping",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        isDefault: true
      }
    ],
    createdAt: new Date(),
    isActive: true
  }
])

// Products collection
db.products.insertMany([
  {
    _id: ObjectId(),
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    category: "electronics",
    subcategory: "audio",
    brand: "TechCorp",
    specifications: {
      bluetooth: "5.0",
      batteryLife: "30 hours",
      weight: "250g"
    },
    images: [
      "https://example.com/headphones-1.jpg",
      "https://example.com/headphones-2.jpg"
    ],
    stock: 150,
    tags: ["wireless", "bluetooth", "noise-cancelling"],
    createdAt: new Date(),
    isActive: true
  }
])

// Orders collection
db.orders.insertMany([
  {
    _id: ObjectId(),
    orderNumber: "ORD-2024-001",
    userId: ObjectId("64a1234567890abcdef12345"),
    items: [
      {
        productId: ObjectId("64a1234567890abcdef12346"),
        name: "Wireless Headphones",
        price: 199.99,
        quantity: 1,
        subtotal: 199.99
      }
    ],
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    payment: {
      method: "credit_card",
      cardLast4: "1234",
      transactionId: "txn_abc123"
    },
    totals: {
      subtotal: 199.99,
      tax: 16.00,
      shipping: 9.99,
      total: 225.98
    },
    status: "pending",
    createdAt: new Date()
  }
])
```

### Blog Database Structure

```javascript
// Switch to blog database
use blog

// Authors collection
db.authors.insertOne({
  _id: ObjectId(),
  username: "jane_writer",
  email: "jane@blog.com",
  profile: {
    firstName: "Jane",
    lastName: "Writer",
    bio: "Passionate about technology and writing",
    avatar: "https://blog.com/avatars/jane.jpg",
    website: "https://janewriter.com"
  },
  social: {
    twitter: "@janewriter",
    linkedin: "janewriter"
  },
  stats: {
    postsCount: 0,
    followersCount: 0
  },
  joinDate: new Date(),
  isActive: true
})

// Posts collection
db.posts.insertOne({
  _id: ObjectId(),
  title: "Getting Started with MongoDB",
  slug: "getting-started-with-mongodb",
  content: "MongoDB is a powerful NoSQL database...",
  excerpt: "Learn the basics of MongoDB in this comprehensive guide",
  authorId: ObjectId("64a1234567890abcdef12345"),
  category: "database",
  tags: ["mongodb", "nosql", "database", "tutorial"],
  status: "published",
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  stats: {
    views: 0,
    likes: 0,
    comments: 0
  },
  seo: {
    metaTitle: "Getting Started with MongoDB - Complete Guide",
    metaDescription: "Learn MongoDB from basics to advanced concepts",
    keywords: ["mongodb", "database", "nosql"]
  }
})

// Comments collection
db.comments.insertOne({
  _id: ObjectId(),
  postId: ObjectId("64a1234567890abcdef12346"),
  authorName: "John Reader",
  authorEmail: "john@example.com",
  content: "Great article! Very helpful for beginners.",
  parentId: null, // null for top-level comments
  status: "approved",
  createdAt: new Date(),
  likes: 0
})
```

### Querying Examples

```javascript
// Find all active users
db.users.find({ isActive: true });

// Find products in specific category
db.products.find({ category: "electronics" });

// Find orders with specific status
db.orders.find({ status: "pending" });

// Find posts by specific author
db.posts.find({
    authorId: ObjectId("64a1234567890abcdef12345"),
});

// Count documents in collection
db.users.countDocuments({ isActive: true });

// Find one document
db.products.findOne({ name: "Wireless Headphones" });
```

## 🎯 Practice Exercises

### Exercise 1: Database Setup

Create a library management system with:

-   Database: `library`
-   Collections: `books`, `authors`, `members`, `loans`

### Exercise 2: Document Design

Design documents for each collection with appropriate fields and data types.

### Exercise 3: Sample Data

Insert sample data into each collection (at least 3 documents per collection).

### Exercise 4: Basic Queries

Write queries to:

-   Find all available books
-   Find books by a specific author
-   Find overdue loans
-   Count total members

## 🔧 Best Practices

### Database Design

1. **Use descriptive names** for databases and collections
2. **Keep database names short** but meaningful
3. **Group related collections** in the same database
4. **Consider data access patterns** when designing

### Document Design

1. **Embed vs Reference**: Embed related data that's frequently accessed together
2. **Avoid deep nesting**: Keep nesting levels reasonable (max 3-4 levels)
3. **Use appropriate data types**: Choose the right BSON type for each field
4. **Plan for growth**: Consider how documents might evolve

### Collection Organization

1. **Use singular names** for collections (user vs users)
2. **Create indexes** for frequently queried fields
3. **Set up validation** for critical collections
4. **Monitor collection statistics** regularly

---

## 🔄 Next Steps

After mastering databases and collections:

1. Practice creating different database structures
2. Experiment with various document designs
3. Learn about indexes and their impact on performance
4. Move to **04-CRUD-Operations.md** to learn data manipulation

---

_Continue to Phase 2: CRUD Operations_
