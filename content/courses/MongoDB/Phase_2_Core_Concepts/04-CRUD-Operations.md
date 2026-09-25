# Phase 2: CRUD Operations

## 📖 Table of Contents

1. [Introduction to CRUD](#introduction-to-crud)
2. [Create Operations](#create-operations)
3. [Read Operations](#read-operations)
4. [Update Operations](#update-operations)
5. [Delete Operations](#delete-operations)
6. [Advanced Query Techniques](#advanced-query-techniques)
7. [Practical Examples](#practical-examples)

## Introduction to CRUD

CRUD stands for **Create, Read, Update, Delete** - the four basic operations you can perform on data in any database system.

### MongoDB CRUD Operations Overview

| Operation  | MongoDB Method                                | SQL Equivalent |
| ---------- | --------------------------------------------- | -------------- |
| **Create** | `insertOne()`, `insertMany()`                 | `INSERT`       |
| **Read**   | `find()`, `findOne()`                         | `SELECT`       |
| **Update** | `updateOne()`, `updateMany()`, `replaceOne()` | `UPDATE`       |
| **Delete** | `deleteOne()`, `deleteMany()`                 | `DELETE`       |

### Return Values and Error Handling

```javascript
// All CRUD operations return acknowledgment objects
{
  acknowledged: true,    // Operation was acknowledged by MongoDB
  insertedId: ObjectId("..."), // For insert operations
  matchedCount: 1,       // Number of documents matched
  modifiedCount: 1,      // Number of documents modified
  deletedCount: 1        // Number of documents deleted
}
```

## Create Operations

### insertOne() - Insert Single Document

```javascript
// Basic insertion
const result = db.users.insertOne({
  username: "alice_wonder",
  email: "alice@example.com",
  age: 28,
  createdAt: new Date()
});

console.log(result);
// Output:
{
  acknowledged: true,
  insertedId: ObjectId("64a1234567890abcdef12345")
}

// Insert with custom _id
db.products.insertOne({
  _id: "PROD-001",
  name: "Wireless Mouse",
  price: 29.99,
  category: "electronics"
});
```

### insertMany() - Insert Multiple Documents

```javascript
// Insert multiple documents
const users = [
  {
    username: "bob_builder",
    email: "bob@example.com",
    age: 35,
    hobbies: ["construction", "DIY"]
  },
  {
    username: "carol_singer",
    email: "carol@example.com",
    age: 24,
    hobbies: ["music", "dancing"]
  },
  {
    username: "david_cook",
    email: "david@example.com",
    age: 31,
    hobbies: ["cooking", "travel"]
  }
];

const result = db.users.insertMany(users);

console.log(result);
// Output:
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId("64a1234567890abcdef12346"),
    '1': ObjectId("64a1234567890abcdef12347"),
    '2': ObjectId("64a1234567890abcdef12348")
  }
}
```

### Insert Options

```javascript
// Insert with options
db.users.insertOne(
    {
        username: "eve_explorer",
        email: "eve@example.com",
    },
    {
        writeConcern: { w: "majority", j: true },
        bypassDocumentValidation: false,
    }
);

// Ordered vs Unordered insertMany
db.users.insertMany(
    [
        { username: "user1", email: "user1@example.com" },
        { username: "user2", email: "user2@example.com" },
        { _id: "duplicate", username: "user3" }, // This might fail
        { username: "user4", email: "user4@example.com" },
    ],
    {
        ordered: false, // Continue inserting even if one fails
    }
);
```

### Handling Insert Errors

```javascript
try {
    // Attempt to insert duplicate _id
    db.users.insertOne({
        _id: ObjectId("64a1234567890abcdef12345"), // Already exists
        username: "duplicate_user",
    });
} catch (error) {
    if (error.code === 11000) {
        console.log("Duplicate key error:", error.message);
    }
}
```

## Read Operations

### find() - Query Multiple Documents

```javascript
// Find all documents
db.users.find();

// Find with filter
db.users.find({ age: { $gte: 25 } });

// Find with multiple conditions
db.users.find({
    age: { $gte: 25, $lte: 35 },
    hobbies: "cooking",
});

// Find with projection (select specific fields)
db.users.find(
    { age: { $gte: 25 } },
    { username: 1, email: 1, _id: 0 } // Include username & email, exclude _id
);
```

### findOne() - Query Single Document

```javascript
// Find first matching document
const user = db.users.findOne({ username: "alice_wonder" });

// Find by _id
const userById = db.users.findOne({
    _id: ObjectId("64a1234567890abcdef12345"),
});

// Find with projection
const userProfile = db.users.findOne(
    { username: "alice_wonder" },
    { username: 1, email: 1, profile: 1 }
);
```

### Query Operators

#### Comparison Operators

```javascript
// $eq (equal)
db.users.find({ age: { $eq: 28 } });
// Equivalent to:
db.users.find({ age: 28 });

// $ne (not equal)
db.users.find({ age: { $ne: 28 } });

// $gt (greater than)
db.users.find({ age: { $gt: 25 } });

// $gte (greater than or equal)
db.users.find({ age: { $gte: 25 } });

// $lt (less than)
db.users.find({ age: { $lt: 30 } });

// $lte (less than or equal)
db.users.find({ age: { $lte: 30 } });

// $in (in array)
db.users.find({ age: { $in: [25, 28, 30] } });

// $nin (not in array)
db.users.find({ age: { $nin: [25, 28, 30] } });
```

#### Logical Operators

```javascript
// $and
db.users.find({
    $and: [{ age: { $gte: 25 } }, { age: { $lte: 35 } }],
});

// $or
db.users.find({
    $or: [{ age: { $lt: 25 } }, { age: { $gt: 35 } }],
});

// $not
db.users.find({
    age: { $not: { $gte: 30 } },
});

// $nor (not or)
db.users.find({
    $nor: [{ age: { $lt: 25 } }, { username: "alice_wonder" }],
});
```

#### Element Operators

```javascript
// $exists (field exists)
db.users.find({ profile: { $exists: true } });

// $type (field type)
db.users.find({ age: { $type: "number" } });
db.users.find({ age: { $type: 16 } }); // 16 = 32-bit integer

// $size (array size)
db.users.find({ hobbies: { $size: 2 } });
```

#### Array Operators

```javascript
// $all (contains all elements)
db.users.find({
    hobbies: { $all: ["cooking", "travel"] },
});

// $elemMatch (element matches condition)
db.orders.find({
    items: {
        $elemMatch: {
            price: { $gte: 100 },
            quantity: { $gte: 2 },
        },
    },
});

// Array element access
db.users.find({ "hobbies.0": "cooking" }); // First element
```

#### Regular Expressions

```javascript
// Case-sensitive search
db.users.find({ username: /^alice/ });

// Case-insensitive search
db.users.find({ username: /^alice/i });

// Contains pattern
db.users.find({ email: /@example\.com$/ });

// Using $regex operator
db.users.find({
    username: {
        $regex: "alice",
        $options: "i",
    },
});
```

### Sorting and Limiting

```javascript
// Sort by age (ascending)
db.users.find().sort({ age: 1 });

// Sort by age (descending)
db.users.find().sort({ age: -1 });

// Sort by multiple fields
db.users.find().sort({ age: -1, username: 1 });

// Limit results
db.users.find().limit(5);

// Skip documents (pagination)
db.users.find().skip(10).limit(5);

// Combine sort, skip, and limit
db.users
    .find({ age: { $gte: 25 } })
    .sort({ createdAt: -1 })
    .skip(0)
    .limit(10);
```

### Counting Documents

```javascript
// Count all documents
db.users.countDocuments();

// Count with filter
db.users.countDocuments({ age: { $gte: 25 } });

// Estimated count (faster for large collections)
db.users.estimatedDocumentCount();
```

## Update Operations

### updateOne() - Update Single Document

```javascript
// Update first matching document
const result = db.users.updateOne(
  { username: "alice_wonder" },           // Filter
  { $set: { age: 29, lastUpdated: new Date() } }  // Update
);

console.log(result);
// Output:
{
  acknowledged: true,
  matchedCount: 1,
  modifiedCount: 1
}

// Update with upsert (insert if not found)
db.users.updateOne(
  { username: "new_user" },
  { $set: { email: "new@example.com", age: 25 } },
  { upsert: true }
);
```

### updateMany() - Update Multiple Documents

```javascript
// Update all matching documents
const result = db.users.updateMany(
  { age: { $lt: 25 } },                   // Filter
  { $set: { category: "young_adult" } }   // Update
);

console.log(result);
// Output:
{
  acknowledged: true,
  matchedCount: 3,
  modifiedCount: 3
}
```

### replaceOne() - Replace Entire Document

```javascript
// Replace entire document (except _id)
db.users.replaceOne(
    { username: "alice_wonder" },
    {
        username: "alice_wonder",
        email: "alice.wonder@newdomain.com",
        age: 29,
        profile: {
            firstName: "Alice",
            lastName: "Wonder",
            bio: "Updated bio",
        },
        updatedAt: new Date(),
    }
);
```

### Update Operators

#### Field Update Operators

```javascript
// $set - Set field value
db.users.updateOne(
    { username: "alice_wonder" },
    { $set: { age: 29, "profile.bio": "New bio" } }
);

// $unset - Remove field
db.users.updateOne({ username: "alice_wonder" }, { $unset: { category: "" } });

// $inc - Increment numeric value
db.users.updateOne(
    { username: "alice_wonder" },
    { $inc: { age: 1, loginCount: 1 } }
);

// $mul - Multiply numeric value
db.products.updateOne(
    { _id: "PROD-001" },
    { $mul: { price: 1.1 } } // 10% price increase
);

// $rename - Rename field
db.users.updateOne(
    { username: "alice_wonder" },
    { $rename: { "profile.bio": "profile.description" } }
);

// $min - Set to minimum value
db.products.updateOne(
    { _id: "PROD-001" },
    { $min: { price: 25.99 } } // Only update if current price > 25.99
);

// $max - Set to maximum value
db.users.updateOne(
    { username: "alice_wonder" },
    { $max: { highScore: 1500 } } // Only update if current score < 1500
);

// $currentDate - Set current date
db.users.updateOne(
    { username: "alice_wonder" },
    {
        $currentDate: {
            lastModified: true,
            "profile.lastUpdated": { $type: "timestamp" },
        },
    }
);
```

#### Array Update Operators

```javascript
// $push - Add element to array
db.users.updateOne(
    { username: "alice_wonder" },
    { $push: { hobbies: "photography" } }
);

// $push with multiple elements
db.users.updateOne(
    { username: "alice_wonder" },
    { $push: { hobbies: { $each: ["yoga", "meditation"] } } }
);

// $push with sorting and limiting
db.users.updateOne(
    { username: "alice_wonder" },
    {
        $push: {
            scores: {
                $each: [85, 92, 78],
                $sort: -1, // Sort descending
                $slice: 5, // Keep only top 5 scores
            },
        },
    }
);

// $addToSet - Add unique element to array
db.users.updateOne(
    { username: "alice_wonder" },
    { $addToSet: { hobbies: "reading" } } // Only adds if not already present
);

// $pop - Remove first or last element
db.users.updateOne(
    { username: "alice_wonder" },
    { $pop: { hobbies: 1 } } // Remove last element (use -1 for first)
);

// $pull - Remove elements matching condition
db.users.updateOne(
    { username: "alice_wonder" },
    { $pull: { hobbies: "photography" } }
);

// $pullAll - Remove multiple specific elements
db.users.updateOne(
    { username: "alice_wonder" },
    { $pullAll: { hobbies: ["yoga", "meditation"] } }
);

// $ positional operator - Update specific array element
db.users.updateOne(
    { username: "alice_wonder", "addresses.type": "home" },
    { $set: { "addresses.$.street": "456 New Street" } }
);

// $[] - Update all array elements
db.users.updateOne(
    { username: "alice_wonder" },
    { $set: { "addresses.$[].country": "USA" } }
);

// $[<identifier>] - Update array elements matching condition
db.users.updateOne(
    { username: "alice_wonder" },
    { $set: { "addresses.$[addr].verified": true } },
    { arrayFilters: [{ "addr.type": "home" }] }
);
```

### Update with Array Filters

```javascript
// Update nested array elements
db.students.updateOne(
    { _id: 1 },
    { $set: { "grades.$[elem].score": 100 } },
    { arrayFilters: [{ "elem.subject": "math" }] }
);

// Multiple array filters
db.students.updateMany(
    {},
    { $set: { "grades.$[grade].curved": true } },
    {
        arrayFilters: [
            {
                $and: [
                    { "grade.score": { $gte: 85 } },
                    { "grade.subject": { $in: ["math", "science"] } },
                ],
            },
        ],
    }
);
```

## Delete Operations

### deleteOne() - Delete Single Document

```javascript
// Delete first matching document
const result = db.users.deleteOne({ username: "alice_wonder" });

console.log(result);
// Output:
{
  acknowledged: true,
  deletedCount: 1
}

// Delete by _id
db.users.deleteOne({ _id: ObjectId("64a1234567890abcdef12345") });
```

### deleteMany() - Delete Multiple Documents

```javascript
// Delete all matching documents
const result = db.users.deleteMany({ age: { $lt: 18 } });

console.log(result);
// Output:
{
  acknowledged: true,
  deletedCount: 3
}

// Delete all documents (be careful!)
db.tempData.deleteMany({});
```

### findOneAndDelete()

```javascript
// Find and delete document, return deleted document
const deletedUser = db.users.findOneAndDelete(
    { username: "alice_wonder" },
    {
        sort: { createdAt: 1 }, // Delete oldest if multiple matches
        projection: { password: 0 }, // Exclude password from returned document
    }
);

console.log(deletedUser);
// Returns the deleted document or null if not found
```

## Advanced Query Techniques

### Query Performance

```javascript
// Use explain() to analyze query performance
db.users.find({ age: { $gte: 25 } }).explain("executionStats");

// Create indexes for better performance
db.users.createIndex({ age: 1 });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
```

### Compound Queries

```javascript
// Complex filter conditions
db.users.find({
    $and: [
        { age: { $gte: 25, $lte: 35 } },
        {
            $or: [{ hobbies: "cooking" }, { hobbies: "travel" }],
        },
        { isActive: true },
        { "profile.firstName": { $exists: true } },
    ],
});
```

### Nested Document Queries

```javascript
// Query nested documents
db.users.find({ "profile.firstName": "Alice" });

// Query array of nested documents
db.users.find({ "addresses.city": "New York" });

// Use dot notation for deep nesting
db.users.find({ "profile.preferences.theme": "dark" });
```

### Text Search

```javascript
// Create text index
db.articles.createIndex({
    title: "text",
    content: "text",
});

// Perform text search
db.articles.find({ $text: { $search: "mongodb tutorial" } });

// Text search with score
db.articles
    .find(
        { $text: { $search: "mongodb tutorial" } },
        { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } });
```

### Geospatial Queries

```javascript
// Create 2dsphere index for geospatial data
db.places.createIndex({ location: "2dsphere" });

// Find places near a point
db.places.find({
    location: {
        $near: {
            $geometry: {
                type: "Point",
                coordinates: [-73.9857, 40.7484], // [longitude, latitude]
            },
            $maxDistance: 1000, // meters
        },
    },
});

// Find places within a polygon
db.places.find({
    location: {
        $geoWithin: {
            $geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [-74.0, 40.7],
                        [-74.0, 40.8],
                        [-73.9, 40.8],
                        [-73.9, 40.7],
                        [-74.0, 40.7],
                    ],
                ],
            },
        },
    },
});
```

## Practical Examples

### User Management System

```javascript
// Create users
db.users.insertMany([
    {
        username: "admin",
        email: "admin@company.com",
        role: "administrator",
        permissions: ["read", "write", "delete", "admin"],
        profile: {
            firstName: "Admin",
            lastName: "User",
            department: "IT",
        },
        createdAt: new Date(),
        isActive: true,
    },
    {
        username: "john_dev",
        email: "john@company.com",
        role: "developer",
        permissions: ["read", "write"],
        profile: {
            firstName: "John",
            lastName: "Developer",
            department: "Engineering",
        },
        createdAt: new Date(),
        isActive: true,
    },
]);

// Update user permissions
db.users.updateOne(
    { username: "john_dev" },
    {
        $addToSet: { permissions: "deploy" },
        $set: { lastUpdated: new Date() },
    }
);

// Find users by role
db.users.find({ role: "developer" });

// Deactivate user
db.users.updateOne(
    { username: "john_dev" },
    {
        $set: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedBy: "admin",
        },
    }
);

// Delete inactive users older than 1 year
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

db.users.deleteMany({
    isActive: false,
    deactivatedAt: { $lt: oneYearAgo },
});
```

### Blog Post Management

```javascript
// Create blog posts
db.posts.insertMany([
    {
        title: "Getting Started with MongoDB",
        slug: "getting-started-mongodb",
        content: "MongoDB is a powerful NoSQL database...",
        author: {
            id: ObjectId("64a1234567890abcdef12345"),
            username: "jane_writer",
            name: "Jane Writer",
        },
        tags: ["mongodb", "database", "tutorial"],
        category: "technology",
        status: "published",
        publishedAt: new Date(),
        stats: {
            views: 0,
            likes: 0,
            comments: 0,
        },
        seo: {
            metaTitle: "Getting Started with MongoDB",
            metaDescription: "Learn MongoDB basics",
            keywords: ["mongodb", "nosql", "database"],
        },
    },
]);

// Update post statistics
db.posts.updateOne(
    { slug: "getting-started-mongodb" },
    {
        $inc: { "stats.views": 1 },
        $set: { lastViewed: new Date() },
    }
);

// Find popular posts
db.posts
    .find({ "stats.views": { $gte: 1000 } })
    .sort({ "stats.views": -1 })
    .limit(10);

// Search posts by tags
db.posts.find({ tags: { $in: ["mongodb", "database"] } });

// Update all posts by author
db.posts.updateMany(
    { "author.username": "jane_writer" },
    { $set: { "author.verified": true } }
);
```

### E-commerce Product Catalog

```javascript
// Add products with variants
db.products.insertOne({
    name: "Premium T-Shirt",
    description: "High-quality cotton t-shirt",
    category: "clothing",
    brand: "FashionCorp",
    basePrice: 29.99,
    variants: [
        {
            sku: "TSHIRT-001-S-RED",
            size: "S",
            color: "Red",
            price: 29.99,
            stock: 50,
        },
        {
            sku: "TSHIRT-001-M-RED",
            size: "M",
            color: "Red",
            price: 29.99,
            stock: 75,
        },
        {
            sku: "TSHIRT-001-L-BLUE",
            size: "L",
            color: "Blue",
            price: 32.99,
            stock: 30,
        },
    ],
    tags: ["cotton", "casual", "premium"],
    isActive: true,
    createdAt: new Date(),
});

// Update stock for specific variant
db.products.updateOne(
    { "variants.sku": "TSHIRT-001-S-RED" },
    { $inc: { "variants.$.stock": -1 } }
);

// Find products with low stock
db.products.find({
    variants: {
        $elemMatch: {
            stock: { $lt: 10 },
            price: { $lt: 50 },
        },
    },
});

// Apply discount to category
db.products.updateMany(
    { category: "clothing" },
    {
        $mul: { basePrice: 0.9 }, // 10% discount
        $set: {
            discountApplied: true,
            discountDate: new Date(),
        },
    }
);
```

## 🎯 Practice Exercises

### Exercise 1: User Registration System

Create a user registration system with the following operations:

1. Insert new users with validation
2. Find users by email or username
3. Update user profiles
4. Deactivate users instead of deleting

### Exercise 2: Inventory Management

Build an inventory system that can:

1. Add new products with multiple variants
2. Update stock levels
3. Find products by category and price range
4. Track product movements (in/out)

### Exercise 3: Blog Comments System

Implement a comment system with:

1. Nested comments (replies)
2. Comment moderation (approve/reject)
3. User engagement tracking (likes)
4. Spam prevention

## 🔧 Performance Tips

### Query Optimization

1. **Use indexes** for frequently queried fields
2. **Limit returned fields** using projection
3. **Use sort() with limit()** for top-N queries
4. **Avoid $where** operator when possible

### Update Optimization

1. **Use specific operators** ($set, $inc) instead of replacing entire documents
2. **Update multiple fields** in single operation
3. **Use upsert** when appropriate
4. **Batch updates** with updateMany() when possible

### General Best Practices

1. **Design queries first**, then schema
2. **Use appropriate data types**
3. **Monitor query performance** with explain()
4. **Handle errors gracefully**

---

## 🔄 Next Steps

After mastering CRUD operations:

1. Practice with real-world scenarios
2. Learn about query performance and indexing
3. Explore aggregation framework
4. Move to **05-Mongoose-Basics.md** to learn about ODM

---

_Continue to Phase 3: Mongoose Introduction_
