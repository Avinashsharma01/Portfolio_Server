# TypeScript for Backend Development - Complete Guide

## Table of Contents

1. [Introduction to TypeScript](#introduction)
2. [Why TypeScript for Backend?](#why-typescript)
3. [Setting Up TypeScript Backend Project](#setup)
4. [TypeScript Fundamentals for Backend](#fundamentals)
5. [Converting JavaScript to TypeScript](#conversion)
6. [Advanced Backend TypeScript Patterns](#advanced)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Introduction to TypeScript {#introduction}

TypeScript is a superset of JavaScript that adds static type definitions. It compiles to plain JavaScript and runs anywhere JavaScript runs.

### Key Benefits:

-   **Type Safety**: Catch errors at compile time
-   **Better IDE Support**: Enhanced autocomplete and refactoring
-   **Self-Documenting Code**: Types serve as documentation
-   **Easier Refactoring**: Safe large-scale code changes
-   **Modern JavaScript Features**: Use latest JS features with compatibility

---

## Why TypeScript for Backend? {#why-typescript}

### 1. **Runtime Error Prevention**

```typescript
// TypeScript catches this error at compile time
function getUserById(id: string): User {
    return users.find((user) => user.id === id); // Error: might return undefined
}

// Correct version
function getUserById(id: string): User | undefined {
    return users.find((user) => user.id === id);
}
```

### 2. **API Contract Definition**

```typescript
interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}

interface UserResponse {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}
```

### 3. **Database Model Safety**

```typescript
interface User extends Document {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
```

---

## Setting Up TypeScript Backend Project {#setup}

### 1. **Initialize New Project**

```bash
mkdir my-backend-app
cd my-backend-app
npm init -y
```

### 2. **Install TypeScript Dependencies**

```bash
# TypeScript and Node types
npm install -D typescript @types/node

# Development tools
npm install -D nodemon ts-node

# Framework types (example with Express)
npm install express
npm install -D @types/express
```

### 3. **Create tsconfig.json**

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "node",
        "rootDir": "./src",
        "outDir": "./dist",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true,
        "allowJs": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
}
```

### 4. **Setup Scripts in package.json**

```json
{
    "scripts": {
        "build": "tsc",
        "start": "node dist/server.js",
        "dev": "nodemon --exec ts-node src/server.ts",
        "watch": "tsc --watch"
    }
}
```

---

## TypeScript Fundamentals for Backend {#fundamentals}

### 1. **Basic Types**

```typescript
// Primitive types
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;
let data: any = { foo: "bar" }; // Avoid 'any' when possible

// Arrays
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// Objects
let user: { name: string; age: number } = {
    name: "John",
    age: 30,
};
```

### 2. **Interfaces**

```typescript
// User interface
interface User {
    id: string;
    name: string;
    email: string;
    age?: number; // Optional property
    readonly createdAt: Date; // Read-only property
}

// Function interface
interface UserService {
    createUser(userData: Omit<User, "id" | "createdAt">): Promise<User>;
    getUserById(id: string): Promise<User | null>;
    updateUser(id: string, updates: Partial<User>): Promise<User>;
    deleteUser(id: string): Promise<boolean>;
}
```

### 3. **Types vs Interfaces**

```typescript
// Type alias
type Status = "pending" | "approved" | "rejected";
type UserWithStatus = User & { status: Status };

// Interface (can be extended)
interface BaseUser {
    name: string;
    email: string;
}

interface AdminUser extends BaseUser {
    permissions: string[];
    role: "admin";
}
```

### 4. **Generics**

```typescript
// Generic function
function createResponse<T>(data: T, message: string) {
    return {
        success: true,
        message,
        data,
    };
}

// Generic interface
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Usage
const userResponse: ApiResponse<User> = createResponse(user, "User created");
```

### 5. **Enums**

```typescript
enum UserRole {
    ADMIN = "admin",
    USER = "user",
    MODERATOR = "moderator",
}

enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500,
}
```

---

## Express.js with TypeScript

### 1. **Basic Server Setup**

```typescript
import express, { Request, Response, NextFunction } from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello TypeScript!" });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

### 2. **Typed Request/Response**

```typescript
interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}

interface UserResponse {
    id: string;
    name: string;
    email: string;
}

app.post(
    "/users",
    (
        req: Request<{}, UserResponse, CreateUserRequest>,
        res: Response<UserResponse>
    ) => {
        const { name, email, password } = req.body;

        // Create user logic
        const user: UserResponse = {
            id: generateId(),
            name,
            email,
        };

        res.status(201).json(user);
    }
);
```

### 3. **Custom Request Types**

```typescript
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Verify token and attach user
    req.user = verifyToken(token);
    next();
};
```

---

Continue reading the next sections in the following files:

-   [Converting JavaScript to TypeScript Guide](./JS_TO_TS_CONVERSION_GUIDE.md)
-   [Advanced TypeScript Patterns](./ADVANCED_TYPESCRIPT_PATTERNS.md)
-   [Best Practices and Troubleshooting](./TYPESCRIPT_BEST_PRACTICES.md)
