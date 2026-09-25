# Phase 14 — Testing Backend

## Table of Contents

- [Why Testing?](#why-testing)
- [Types of Tests](#types-of-tests)
- [Testing Pyramid](#testing-pyramid)
- [Jest — Testing Framework](#jest--testing-framework)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Supertest — API Testing](#supertest--api-testing)
- [Test Database Strategy](#test-database-strategy)
- [Mocking](#mocking)
- [Test Organization](#test-organization)
- [TDD (Test-Driven Development)](#tdd-test-driven-development)
- [Code Coverage](#code-coverage)
- [Key Takeaways](#key-takeaways)

---

## Why Testing?

```
WITHOUT TESTS:
├── "I think it works" → Deploys to production → Users find bugs
├── Change one thing → Something else breaks → You don't know until production
├── Refactoring is scary → Code rots → Technical debt grows
└── Team members break each other's code unknowingly

WITH TESTS:
├── Confidence that code works correctly
├── Catch bugs before they reach production
├── Refactor safely (tests catch regressions)
├── Documentation of expected behavior
└── CI/CD pipelines can verify automatically
```

---

## Types of Tests

```
Unit Tests:
├── Test individual functions or modules in isolation
├── Fast, many of them (hundreds)
├── Example: Does calculateTotal() return correct sum?

Integration Tests:
├── Test how modules work together
├── Medium speed, moderate count
├── Example: Does POST /api/users create a user in the database?

End-to-End (E2E) Tests:
├── Test the entire application flow
├── Slow, few of them
├── Example: User signs up, logs in, creates a post, sees it on the feed
```

---

## Testing Pyramid

```
        /\
       /  \      E2E Tests (few)
      /    \     ─ Full user flows
     /──────\    ─ Slow, expensive
    /        \
   / Integr.  \  Integration Tests (some)
  /   Tests    \ ─ API endpoints with DB
 /──────────────\─ Medium speed
/                \
/   Unit Tests    \ Unit Tests (many)
/──────────────────\─ Individual functions
                    ─ Fast, cheap

More tests at the bottom, fewer at the top.
```

---

## Jest — Testing Framework

Jest is the most popular JavaScript testing framework.

```bash
npm install --save-dev jest
```

```json
// package.json
{
    "scripts": {
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage"
    }
}
```

### Jest Basics

```javascript
// math.js
function add(a, b) { return a + b; }
function multiply(a, b) { return a * b; }
function divide(a, b) {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
}

module.exports = { add, multiply, divide };
```

```javascript
// math.test.js
const { add, multiply, divide } = require("./math");

// describe groups related tests
describe("Math functions", () => {

    // test (or it) defines a single test
    test("add should add two numbers", () => {
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
        expect(add(0, 0)).toBe(0);
    });

    test("multiply should multiply two numbers", () => {
        expect(multiply(3, 4)).toBe(12);
        expect(multiply(-2, 3)).toBe(-6);
    });

    test("divide should divide two numbers", () => {
        expect(divide(10, 2)).toBe(5);
        expect(divide(7, 2)).toBe(3.5);
    });

    test("divide should throw on division by zero", () => {
        expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
    });
});
```

### Common Matchers

```javascript
// Exact equality
expect(value).toBe(5);              // === comparison
expect(value).toEqual({ a: 1 });    // Deep comparison (objects/arrays)

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3, 1);  // Floating point

// Strings
expect(value).toMatch(/regex/);
expect(value).toContain("substring");

// Arrays
expect(array).toContain("item");
expect(array).toHaveLength(3);

// Objects
expect(obj).toHaveProperty("key");
expect(obj).toHaveProperty("key", "value");
expect(obj).toMatchObject({ name: "Avinash" }); // Partial match

// Exceptions
expect(() => func()).toThrow();
expect(() => func()).toThrow("error message");
expect(() => func()).toThrow(TypeError);

// Negation
expect(value).not.toBe(5);
expect(array).not.toContain("item");

// Async
await expect(asyncFunc()).resolves.toBe("result");
await expect(asyncFunc()).rejects.toThrow("error");
```

### Setup & Teardown

```javascript
describe("Database tests", () => {
    // Run ONCE before all tests in this describe block
    beforeAll(async () => {
        await connectDatabase();
    });

    // Run ONCE after all tests
    afterAll(async () => {
        await disconnectDatabase();
    });

    // Run before EACH test
    beforeEach(async () => {
        await clearDatabase();
    });

    // Run after EACH test
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test 1", () => { /* ... */ });
    test("test 2", () => { /* ... */ });
});
```

---

## Unit Testing

### Testing a Utility Function

```javascript
// utils/slugify.js
const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-");
};

module.exports = slugify;
```

```javascript
// utils/slugify.test.js
const slugify = require("./slugify");

describe("slugify", () => {
    test("converts to lowercase", () => {
        expect(slugify("Hello World")).toBe("hello-world");
    });

    test("replaces spaces with hyphens", () => {
        expect(slugify("my blog post")).toBe("my-blog-post");
    });

    test("removes special characters", () => {
        expect(slugify("hello! world@#$")).toBe("hello-world");
    });

    test("handles multiple spaces", () => {
        expect(slugify("hello   world")).toBe("hello-world");
    });

    test("trims whitespace", () => {
        expect(slugify("  hello world  ")).toBe("hello-world");
    });

    test("handles empty string", () => {
        expect(slugify("")).toBe("");
    });
});
```

### Testing a Service/Business Logic

```javascript
// services/priceService.js
const calculateDiscount = (price, discountPercent) => {
    if (price < 0) throw new Error("Price cannot be negative");
    if (discountPercent < 0 || discountPercent > 100) {
        throw new Error("Discount must be between 0 and 100");
    }
    const discount = price * (discountPercent / 100);
    return Math.round((price - discount) * 100) / 100;
};

module.exports = { calculateDiscount };
```

```javascript
// services/priceService.test.js
const { calculateDiscount } = require("./priceService");

describe("calculateDiscount", () => {
    test("applies 10% discount correctly", () => {
        expect(calculateDiscount(100, 10)).toBe(90);
    });

    test("applies 50% discount", () => {
        expect(calculateDiscount(200, 50)).toBe(100);
    });

    test("0% discount returns original price", () => {
        expect(calculateDiscount(100, 0)).toBe(100);
    });

    test("100% discount returns 0", () => {
        expect(calculateDiscount(100, 100)).toBe(0);
    });

    test("handles decimal prices", () => {
        expect(calculateDiscount(19.99, 15)).toBe(16.99);
    });

    test("throws on negative price", () => {
        expect(() => calculateDiscount(-100, 10)).toThrow("Price cannot be negative");
    });

    test("throws on invalid discount", () => {
        expect(() => calculateDiscount(100, 150)).toThrow("Discount must be between 0 and 100");
        expect(() => calculateDiscount(100, -10)).toThrow("Discount must be between 0 and 100");
    });
});
```

---

## Integration Testing

### Testing with a Real Database

```javascript
// tests/integration/user.test.js
const mongoose = require("mongoose");
const User = require("../../models/User");

// Use a separate test database
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe("User Model", () => {
    test("should create a user successfully", async () => {
        const userData = { name: "Avinash", email: "avinash@example.com", password: "Password123" };
        const user = await User.create(userData);

        expect(user._id).toBeDefined();
        expect(user.name).toBe("Avinash");
        expect(user.email).toBe("avinash@example.com");
        expect(user.password).not.toBe("Password123"); // Should be hashed
    });

    test("should require email", async () => {
        await expect(User.create({ name: "Test" })).rejects.toThrow();
    });

    test("should not allow duplicate emails", async () => {
        await User.create({ name: "A", email: "test@test.com", password: "Password123" });
        await expect(
            User.create({ name: "B", email: "test@test.com", password: "Password123" })
        ).rejects.toThrow();
    });
});
```

---

## Supertest — API Testing

**Supertest** lets you make HTTP requests to your Express app without starting the server.

```bash
npm install --save-dev supertest
```

### Setup

```javascript
// app.js — export the app (don't call listen here for tests)
const express = require("express");
const app = express();

app.use(express.json());
app.use("/api/users", require("./routes/userRoutes"));
// ... other routes and middleware

module.exports = app;
```

```javascript
// server.js — start the server (only here)
const app = require("./app");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### API Tests

```javascript
// tests/api/users.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const User = require("../../models/User");

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe("POST /api/users", () => {
    test("should create a new user", async () => {
        const res = await request(app)
            .post("/api/users")
            .send({ name: "Avinash", email: "avinash@example.com", password: "Password123" })
            .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Avinash");
        expect(res.body.data.email).toBe("avinash@example.com");
        expect(res.body.data.password).toBeUndefined(); // Should not expose
    });

    test("should return 422 for invalid data", async () => {
        const res = await request(app)
            .post("/api/users")
            .send({ name: "" }) // Missing required fields
            .expect(422);

        expect(res.body.success).toBe(false);
        expect(res.body.error.details).toBeDefined();
    });

    test("should return 409 for duplicate email", async () => {
        await User.create({ name: "A", email: "dup@test.com", password: "Password123" });

        await request(app)
            .post("/api/users")
            .send({ name: "B", email: "dup@test.com", password: "Password123" })
            .expect(409);
    });
});

describe("GET /api/users", () => {
    test("should return all users", async () => {
        await User.create([
            { name: "User 1", email: "u1@test.com", password: "Password123" },
            { name: "User 2", email: "u2@test.com", password: "Password123" },
        ]);

        const res = await request(app)
            .get("/api/users")
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(2);
    });

    test("should support pagination", async () => {
        // Create 15 users
        const users = Array.from({ length: 15 }, (_, i) => ({
            name: `User ${i}`,
            email: `user${i}@test.com`,
            password: "Password123",
        }));
        await User.insertMany(users);

        const res = await request(app)
            .get("/api/users?page=2&limit=10")
            .expect(200);

        expect(res.body.data).toHaveLength(5); // 15 - 10 = 5
        expect(res.body.pagination.totalPages).toBe(2);
    });
});

describe("GET /api/users/:id", () => {
    test("should return a user by id", async () => {
        const user = await User.create({
            name: "Avinash",
            email: "avi@test.com",
            password: "Password123",
        });

        const res = await request(app)
            .get(`/api/users/${user._id}`)
            .expect(200);

        expect(res.body.data.name).toBe("Avinash");
    });

    test("should return 404 for non-existent user", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
            .get(`/api/users/${fakeId}`)
            .expect(404);
    });
});
```

### Testing Protected Routes

```javascript
describe("Protected Routes", () => {
    let token;
    let userId;

    beforeEach(async () => {
        // Register and get token
        const res = await request(app)
            .post("/api/auth/register")
            .send({ name: "Test", email: "test@test.com", password: "Password123" });

        token = res.body.accessToken;
        userId = res.body.data.user.id;
    });

    test("should access profile with valid token", async () => {
        const res = await request(app)
            .get("/api/users/profile")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(res.body.data.name).toBe("Test");
    });

    test("should reject without token", async () => {
        await request(app)
            .get("/api/users/profile")
            .expect(401);
    });

    test("should reject with invalid token", async () => {
        await request(app)
            .get("/api/users/profile")
            .set("Authorization", "Bearer invalid-token")
            .expect(401);
    });
});
```

---

## Test Database Strategy

### In-Memory MongoDB

```bash
npm install --save-dev mongodb-memory-server
```

```javascript
// tests/setup.js
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});
```

```javascript
// jest.config.js
module.exports = {
    testEnvironment: "node",
    setupFilesAfterSetup: ["./tests/setup.js"],
    testMatch: ["**/*.test.js"],
    testTimeout: 10000,
};
```

---

## Mocking

### What is Mocking?

```
Mocking = Replace real dependencies with fake ones
Why? To test in isolation, avoid side effects, control behavior

Mock when:
├── Calling external APIs (don't make real HTTP calls)
├── Sending emails (don't send real emails in tests)
├── Database operations (when unit testing)
├── Date/time (control "now" for consistent results)
└── File system operations
```

### Mocking Functions

```javascript
// Jest mock functions
const mockFn = jest.fn();

mockFn("hello");
mockFn("world");

expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith("hello");
expect(mockFn).toHaveBeenLastCalledWith("world");
```

### Mocking Return Values

```javascript
const mockFn = jest.fn()
    .mockReturnValueOnce(10)
    .mockReturnValueOnce(20)
    .mockReturnValue(0);

console.log(mockFn()); // 10
console.log(mockFn()); // 20
console.log(mockFn()); // 0 (default after once values used)
```

### Mocking Modules

```javascript
// Mock the email service
jest.mock("../services/emailService");
const emailService = require("../services/emailService");

emailService.sendEmail.mockResolvedValue({ success: true });

test("register should send welcome email", async () => {
    await request(app)
        .post("/api/auth/register")
        .send({ name: "Test", email: "test@test.com", password: "Password123" });

    expect(emailService.sendEmail).toHaveBeenCalledWith(
        "test@test.com",
        "Welcome!",
        expect.any(String)
    );
});
```

### Spying on Methods

```javascript
// Spy on existing method without replacing it
const spy = jest.spyOn(User, "findById");

await getUser(req, res);

expect(spy).toHaveBeenCalledWith("some-id");
spy.mockRestore(); // Restore original implementation
```

---

## Test Organization

### Folder Structure

```
project/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── tests/
│   ├── unit/
│   │   ├── utils/
│   │   │   └── slugify.test.js
│   │   └── services/
│   │       └── priceService.test.js
│   ├── integration/
│   │   ├── models/
│   │   │   └── user.test.js
│   │   └── api/
│   │       ├── auth.test.js
│   │       └── users.test.js
│   ├── fixtures/
│   │   └── users.js          ← Test data
│   └── setup.js              ← Global test setup
├── jest.config.js
└── package.json
```

### Test Fixtures (Sample Data)

```javascript
// tests/fixtures/users.js
const validUser = {
    name: "Test User",
    email: "test@example.com",
    password: "Password123",
    role: "user",
};

const adminUser = {
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin123",
    role: "admin",
};

const invalidUsers = {
    missingName: { email: "test@test.com", password: "Password123" },
    invalidEmail: { name: "Test", email: "not-an-email", password: "Password123" },
    shortPassword: { name: "Test", email: "test@test.com", password: "123" },
};

module.exports = { validUser, adminUser, invalidUsers };
```

### Naming Conventions

```javascript
// Good test names describe WHAT and WHEN
describe("UserController", () => {
    describe("createUser", () => {
        test("should create a user when valid data is provided", () => {});
        test("should return 422 when email is missing", () => {});
        test("should return 409 when email already exists", () => {});
        test("should hash the password before saving", () => {});
    });

    describe("getUser", () => {
        test("should return user when valid ID is provided", () => {});
        test("should return 404 when user does not exist", () => {});
        test("should not include password in response", () => {});
    });
});
```

---

## TDD (Test-Driven Development)

### The TDD Cycle

```
1. RED:   Write a failing test (test what you want the code to do)
2. GREEN: Write minimum code to make the test pass
3. REFACTOR: Clean up the code (tests should still pass)
4. REPEAT
```

### TDD Example

```javascript
// Step 1: RED — Write failing test
test("should calculate total with tax", () => {
    expect(calculateTotal(100, 0.1)).toBe(110);
});
// ❌ FAILS — calculateTotal doesn't exist yet

// Step 2: GREEN — Write minimum code
const calculateTotal = (subtotal, taxRate) => {
    return subtotal + (subtotal * taxRate);
};
// ✅ PASSES

// Step 3: Write another failing test
test("should handle zero tax", () => {
    expect(calculateTotal(100, 0)).toBe(100);
});
// ✅ Already passes — move on

// Step 4: Another failing test
test("should round to 2 decimal places", () => {
    expect(calculateTotal(19.99, 0.0825)).toBe(21.64);
});
// ❌ FAILS — returns 21.639175

// Step 5: Update code
const calculateTotal = (subtotal, taxRate) => {
    return Math.round((subtotal + subtotal * taxRate) * 100) / 100;
};
// ✅ PASSES
```

---

## Code Coverage

```bash
# Run tests with coverage report
npx jest --coverage
```

```
Output:
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   87.5  |   75.0   |  100.0  |   87.5  |
 math.js            |  100.0  |  100.0   |  100.0  |  100.0  |
 userController.js  |   80.0  |   66.7   |  100.0  |   80.0  |
--------------------|---------|----------|---------|---------|
```

### Coverage Thresholds

```javascript
// jest.config.js
module.exports = {
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    collectCoverageFrom: [
        "src/**/*.js",
        "!src/server.js", // Exclude entry point
    ],
};
```

> **Note:** Aim for 80%+ coverage, but don't chase 100%. Focus on testing critical business logic, not every getter/setter.

---

## Key Takeaways

1. **Unit tests are fast and many** — test individual functions in isolation
2. **Integration tests verify modules together** — API endpoints with real DB
3. **Supertest** makes HTTP testing easy without starting the server
4. **Separate app.js from server.js** so tests can import the app without listening
5. **Use in-memory database** (mongodb-memory-server) for fast, isolated tests
6. **Mock external services** (email, payment, third-party APIs)
7. **Test the happy path AND error cases** (invalid input, not found, unauthorized)
8. **Use beforeEach to clean data** between tests for isolation
9. **TDD: Red → Green → Refactor** — write the test first
10. **80%+ coverage** is a good target — focus on business logic

---

## Practice Exercises

1. **Unit tests:** Write tests for a utility module (slugify, password validator, price calculator)
2. **API tests:** Test all CRUD endpoints for a resource with Supertest
3. **Auth tests:** Test register, login, protected routes, and invalid tokens
4. **Mock tests:** Mock an email service and verify it's called during registration
5. **TDD:** Build a new feature using TDD (write test first, then implement)
6. **Coverage:** Configure coverage thresholds and achieve 80%+

---

**Previous:** [← Phase 13 — Security Best Practices](Phase-13-Security-Best-Practices.md)

**Next:** [Phase 15 — Caching & Performance →](Phase-15-Caching-Performance.md)
