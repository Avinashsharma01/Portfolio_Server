# Phase 1: MongoDB Basics

## 📖 Table of Contents

1. [What is MongoDB?](#what-is-mongodb)
2. [NoSQL vs SQL](#nosql-vs-sql)
3. [Key Concepts](#key-concepts)
4. [JSON vs BSON](#json-vs-bson)
5. [MongoDB Terminology](#mongodb-terminology)
6. [Advantages and Disadvantages](#advantages-and-disadvantages)

## What is MongoDB?

MongoDB is a **document-oriented NoSQL database** that stores data in flexible, JSON-like documents. It's designed to handle large volumes of data and provide high performance, high availability, and easy scalability.

### Key Features:

-   **Document-Oriented**: Stores data in documents (similar to JSON objects)
-   **Schema-less**: No predefined structure required
-   **Scalable**: Built for horizontal scaling
-   **High Performance**: Fast read/write operations
-   **Rich Query Language**: Supports complex queries and aggregations

## NoSQL vs SQL

### Traditional SQL Databases

```sql
-- Rigid table structure
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100),
    age INT
);

INSERT INTO users VALUES (1, 'John Doe', 'john@email.com', 30);
```

### MongoDB (NoSQL)

```javascript
// Flexible document structure
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@email.com",
  age: 30,
  hobbies: ["reading", "gaming"],  // Arrays allowed
  address: {                       // Nested objects allowed
    street: "123 Main St",
    city: "New York"
  }
}
```

### Comparison Table

| Aspect             | SQL                      | MongoDB                   |
| ------------------ | ------------------------ | ------------------------- |
| **Data Model**     | Tables with rows/columns | Documents in collections  |
| **Schema**         | Fixed schema             | Dynamic schema            |
| **Relationships**  | Foreign keys, JOINs      | Embedded docs, references |
| **Scalability**    | Vertical (scale up)      | Horizontal (scale out)    |
| **Transactions**   | ACID compliant           | ACID with limitations     |
| **Query Language** | SQL                      | MongoDB Query Language    |

## Key Concepts

### 1. Database

A container for collections. Similar to a database in SQL systems.

```javascript
// Example databases
-ecommerce - blog - user_management;
```

### 2. Collection

A group of documents. Similar to a table in SQL, but without a fixed schema.

```javascript
// Example collections in ecommerce database
-users - products - orders - reviews;
```

### 3. Document

A single record in a collection. Similar to a row in SQL, but can contain nested data.

```javascript
// Example user document
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  username: "john_doe",
  email: "john@example.com",
  profile: {
    firstName: "John",
    lastName: "Doe",
    age: 30
  },
  preferences: ["tech", "sports"],
  createdAt: ISODate("2024-01-15T10:30:00Z")
}
```

### 4. Field

A key-value pair within a document. Similar to a column in SQL.

```javascript
{
  name: "John",     // field: name, value: "John"
  age: 30,          // field: age, value: 30
  active: true      // field: active, value: true
}
```

## JSON vs BSON

### JSON (JavaScript Object Notation)

-   Human-readable text format
-   Limited data types (string, number, boolean, null, object, array)
-   Used for data exchange

```json
{
    "name": "John",
    "age": 30,
    "active": true,
    "hobbies": ["reading", "coding"]
}
```

### BSON (Binary JSON)

-   Binary representation of JSON
-   Additional data types (ObjectId, Date, Binary, etc.)
-   More efficient storage and faster parsing
-   What MongoDB actually stores internally

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John",
  age: NumberInt(30),
  birthDate: ISODate("1994-05-15"),
  profilePic: BinData(0, "...")
}
```

### BSON Data Types

| Type         | Description               | Example                 |
| ------------ | ------------------------- | ----------------------- |
| **ObjectId** | Unique identifier         | `ObjectId("...")`       |
| **String**   | Text data                 | `"Hello World"`         |
| **Number**   | Integer or floating point | `42`, `3.14`            |
| **Boolean**  | True/false                | `true`, `false`         |
| **Date**     | Date and time             | `ISODate("2024-01-15")` |
| **Array**    | List of values            | `[1, 2, 3]`             |
| **Object**   | Nested document           | `{name: "John"}`        |
| **Null**     | Null value                | `null`                  |
| **Binary**   | Binary data               | `BinData(...)`          |

## MongoDB Terminology

### SQL vs MongoDB Terms

| SQL Term    | MongoDB Term | Description              |
| ----------- | ------------ | ------------------------ |
| Database    | Database     | Container for data       |
| Table       | Collection   | Group of records         |
| Row         | Document     | Single record            |
| Column      | Field        | Data attribute           |
| Primary Key | \_id         | Unique identifier        |
| Index       | Index        | Performance optimization |
| Join        | $lookup      | Combining data           |
| Foreign Key | Reference    | Relationship pointer     |

### Important MongoDB Terms

-   **\_id**: Every document has a unique `_id` field (auto-generated if not provided)
-   **ObjectId**: Default type for `_id` field, contains timestamp
-   **Replica Set**: Group of MongoDB servers maintaining same data
-   **Sharding**: Horizontal partitioning of data
-   **GridFS**: File storage system for large files
-   **Aggregation**: Data processing pipeline

## Advantages and Disadvantages

### ✅ Advantages

1. **Flexible Schema**

    ```javascript
    // Documents can have different structures
    { name: "John", age: 30 }
    { name: "Jane", age: 25, city: "NYC", hobbies: ["reading"] }
    ```

2. **Rich Data Types**

    ```javascript
    {
      text: "String",
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      object: { nested: "data" },
      date: new Date(),
      binary: BinData(...)
    }
    ```

3. **High Performance**

    - Fast read/write operations
    - Efficient indexing
    - Memory-mapped files

4. **Horizontal Scalability**

    - Sharding support
    - Automatic load balancing
    - Easy to add new servers

5. **Developer Friendly**
    - JSON-like documents match application objects
    - Rich query language
    - Excellent driver support

### ❌ Disadvantages

1. **Memory Usage**

    - Higher memory consumption
    - BSON overhead

2. **Data Consistency**

    - Eventual consistency in some scenarios
    - Limited transaction support (improving)

3. **Join Operations**

    - No native joins (use `$lookup`)
    - Complex relationships can be challenging

4. **Learning Curve**

    - Different from traditional SQL
    - New concepts to learn

5. **Maturity**
    - Newer than traditional RDBMS
    - Some enterprise features still evolving

## 🎯 Practice Exercises

### Exercise 1: Identify Document Structure

Given this user profile, identify the fields, data types, and nested structures:

```javascript
{
  _id: ObjectId("64a1234567890abcdef12345"),
  username: "alice_wonder",
  email: "alice@wonderland.com",
  profile: {
    firstName: "Alice",
    lastName: "Wonder",
    age: 28,
    bio: "Adventure seeker and tea enthusiast"
  },
  preferences: {
    theme: "dark",
    notifications: true,
    language: "en"
  },
  tags: ["adventurer", "reader", "tea-lover"],
  joinDate: ISODate("2024-01-15T10:30:00Z"),
  lastLogin: ISODate("2024-08-11T14:22:00Z"),
  isActive: true
}
```

### Exercise 2: Design Documents

Design MongoDB documents for:

1. A blog post with author, title, content, tags, and comments
2. An e-commerce product with categories, variants, and reviews
3. A social media post with likes, shares, and nested comments

---

## 🔄 Next Steps

After completing this phase:

1. Review the concepts above
2. Complete the practice exercises
3. Move to **02-Installation-Setup.md** to set up your development environment

## 📚 Additional Resources

-   [MongoDB Official Documentation](https://docs.mongodb.com/)
-   [BSON Specification](http://bsonspec.org/)
-   [NoSQL Database Comparison](https://db-engines.com/en/ranking)

---

_Continue to Phase 2: Installation and Setup_
