# TypeScript Best Practices & Troubleshooting Guide

## Table of Contents

1. [Code Organization](#organization)
2. [Type Safety Best Practices](#type-safety)
3. [Performance Optimization](#performance)
4. [Common Issues & Solutions](#troubleshooting)
5. [Development Tools Setup](#tools)
6. [Production Deployment](#deployment)
7. [Testing Strategies](#testing)
8. [Security Considerations](#security)

---

## Code Organization {#organization}

### 1. **Project Structure**

```
src/
├── config/           # Configuration files
│   ├── database.ts
│   ├── environment.ts
│   └── logger.ts
├── controllers/      # Route handlers
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   └── index.ts
├── middleware/       # Express middleware
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   └── index.ts
├── models/          # Database models
│   ├── user.model.ts
│   ├── post.model.ts
│   └── index.ts
├── routes/          # Route definitions
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   └── index.ts
├── services/        # Business logic
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── email.service.ts
│   └── index.ts
├── types/           # Type definitions
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── api.types.ts
│   └── index.ts
├── utils/           # Utility functions
│   ├── validation.ts
│   ├── encryption.ts
│   ├── helpers.ts
│   └── index.ts
├── tests/           # Test files
│   ├── __mocks__/
│   ├── controllers/
│   ├── services/
│   └── utils/
└── app.ts           # Main application file
```

### 2. **Module Exports Strategy**

```typescript
// types/index.ts - Central type exports
export * from "./auth.types";
export * from "./user.types";
export * from "./api.types";

// services/index.ts - Service exports
export { AuthService } from "./auth.service";
export { UserService } from "./user.service";
export { EmailService } from "./email.service";

// controllers/index.ts - Controller exports
export { AuthController } from "./auth.controller";
export { UserController } from "./user.controller";

// Clean imports in main files
import { AuthService, UserService } from "../services";
import { AuthController, UserController } from "../controllers";
```

### 3. **Configuration Management**

```typescript
// config/environment.ts
interface Environment {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    MONGO_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    EMAIL_SERVICE: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    REDIS_URL?: string;
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
}

class ConfigService {
    private static instance: ConfigService;
    private config: Environment;

    private constructor() {
        this.config = this.validateConfig();
    }

    static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    private validateConfig(): Environment {
        const config = {
            NODE_ENV: process.env.NODE_ENV || "development",
            PORT: parseInt(process.env.PORT || "3000", 10),
            MONGO_URL: process.env.MONGO_URL,
            JWT_SECRET: process.env.JWT_SECRET,
            JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
            EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
            EMAIL_USER: process.env.EMAIL_USER,
            EMAIL_PASS: process.env.EMAIL_PASS,
            REDIS_URL: process.env.REDIS_URL,
            LOG_LEVEL: (process.env.LOG_LEVEL as any) || "info",
        } as Environment;

        // Validate required fields
        const required = [
            "MONGO_URL",
            "JWT_SECRET",
            "EMAIL_USER",
            "EMAIL_PASS",
        ];
        const missing = required.filter(
            (key) => !config[key as keyof Environment]
        );

        if (missing.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missing.join(", ")}`
            );
        }

        return config;
    }

    get<K extends keyof Environment>(key: K): Environment[K] {
        return this.config[key];
    }

    getAll(): Environment {
        return { ...this.config };
    }
}

export const config = ConfigService.getInstance();
```

---

## Type Safety Best Practices {#type-safety}

### 1. **Strict TypeScript Configuration**

```json
// tsconfig.json - Production ready
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "node",
        "lib": ["ES2020"],
        "rootDir": "./src",
        "outDir": "./dist",
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "strictFunctionTypes": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "noUncheckedIndexedAccess": true,
        "exactOptionalPropertyTypes": true,
        "noImplicitOverride": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "skipLibCheck": true,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "removeComments": true,
        "importHelpers": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

### 2. **Type Guards and Assertions**

```typescript
// Type guards for runtime validation
function isString(value: unknown): value is string {
    return typeof value === "string";
}

function isValidEmail(email: unknown): email is string {
    return isString(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isUserRole(role: unknown): role is UserRole {
    return isString(role) && Object.values(UserRole).includes(role as UserRole);
}

// Generic validation function
function validateRequired<T>(
    value: unknown,
    validator: (val: unknown) => val is T,
    fieldName: string
): T {
    if (value === null || value === undefined) {
        throw new ValidationError(`${fieldName} is required`);
    }

    if (!validator(value)) {
        throw new ValidationError(`${fieldName} is invalid`);
    }

    return value;
}

// Usage in controllers
export const updateUser = async (req: Request, res: Response) => {
    const { name, email, role } = req.body;

    // Type-safe validation
    const validatedData: Partial<IUser> = {};

    if (name !== undefined) {
        validatedData.name = validateRequired(name, isString, "name");
    }

    if (email !== undefined) {
        validatedData.email = validateRequired(email, isValidEmail, "email");
    }

    if (role !== undefined) {
        validatedData.role = validateRequired(role, isUserRole, "role");
    }

    const updatedUser = await UserService.update(req.params.id, validatedData);
    res.json(ResponseBuilder.success(updatedUser.toPublicJSON()));
};
```

### 3. **Advanced Error Typing**

```typescript
// Discriminated union for different error types
type AppErrorType =
    | { type: "VALIDATION"; field: string; message: string }
    | { type: "NOT_FOUND"; resource: string; id?: string }
    | { type: "AUTHENTICATION"; message: string }
    | { type: "AUTHORIZATION"; required: string; current: string }
    | { type: "RATE_LIMIT"; retryAfter: number }
    | { type: "INTERNAL"; message: string; stack?: string };

class TypedError extends Error {
    constructor(
        public errorType: AppErrorType,
        public statusCode: number = 500,
        public isOperational: boolean = true
    ) {
        super(TypedError.getMessageFromType(errorType));
        Error.captureStackTrace(this, this.constructor);
    }

    private static getMessageFromType(errorType: AppErrorType): string {
        switch (errorType.type) {
            case "VALIDATION":
                return `Validation error: ${errorType.message}`;
            case "NOT_FOUND":
                return `${errorType.resource}${
                    errorType.id ? ` with id ${errorType.id}` : ""
                } not found`;
            case "AUTHENTICATION":
                return errorType.message;
            case "AUTHORIZATION":
                return `Access denied. Required: ${errorType.required}, Current: ${errorType.current}`;
            case "RATE_LIMIT":
                return `Too many requests. Retry after ${errorType.retryAfter} seconds`;
            case "INTERNAL":
                return errorType.message;
        }
    }

    toJSON() {
        return {
            type: this.errorType.type,
            message: this.message,
            statusCode: this.statusCode,
            isOperational: this.isOperational,
            details: this.errorType,
        };
    }
}

// Usage
throw new TypedError(
    { type: "VALIDATION", field: "email", message: "Invalid email format" },
    400
);

throw new TypedError({ type: "NOT_FOUND", resource: "User", id: userId }, 404);
```

### 4. **Branded Types for IDs**

```typescript
// Prevent ID mix-ups with branded types
type Brand<T, U> = T & { __brand: U };

type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;
type CommentId = Brand<string, "CommentId">;

// Type-safe ID creation
function createUserId(id: string): UserId {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError("Invalid user ID format");
    }
    return id as UserId;
}

function createPostId(id: string): PostId {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError("Invalid post ID format");
    }
    return id as PostId;
}

// Service methods with branded types
class UserService {
    static async findById(id: UserId): Promise<IUser | null> {
        return await User.findById(id);
    }

    static async deleteUser(id: UserId): Promise<void> {
        await User.findByIdAndDelete(id);
    }
}

class PostService {
    static async getPostsByUser(userId: UserId): Promise<IPost[]> {
        return await Post.find({ author: userId });
    }
}

// This will cause a TypeScript error - prevents mixing up IDs
// const user = await UserService.findById(postId); // Error!
```

---

## Performance Optimization {#performance}

### 1. **Efficient Database Queries**

```typescript
class OptimizedUserService {
    // Use projection to limit returned fields
    static async getPublicUsers(
        page: number = 1,
        limit: number = 10
    ): Promise<PublicUser[]> {
        return await User.find({}, "name email role createdAt") // Only select needed fields
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean() // Return plain objects instead of Mongoose documents
            .exec();
    }

    // Use aggregation for complex queries
    static async getUserStats(): Promise<{
        totalUsers: number;
        usersByRole: Record<string, number>;
    }> {
        const [stats] = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    usersByRole: {
                        $push: {
                            role: "$role",
                            count: 1,
                        },
                    },
                },
            },
            {
                $project: {
                    totalUsers: 1,
                    usersByRole: {
                        $arrayToObject: {
                            $map: {
                                input: "$usersByRole",
                                as: "item",
                                in: {
                                    k: "$$item.role",
                                    v: "$$item.count",
                                },
                            },
                        },
                    },
                },
            },
        ]);

        return stats || { totalUsers: 0, usersByRole: {} };
    }

    // Batch operations
    static async updateMultipleUsers(
        updates: Array<{ id: UserId; data: Partial<IUser> }>
    ): Promise<void> {
        const bulkOps = updates.map((update) => ({
            updateOne: {
                filter: { _id: update.id },
                update: { $set: update.data },
                upsert: false,
            },
        }));

        await User.bulkWrite(bulkOps);
    }
}
```

### 2. **Caching Strategy**

```typescript
interface CacheService {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    flush(): Promise<void>;
}

class RedisCacheService implements CacheService {
    constructor(private redis: RedisClient) {}

    async get<T>(key: string): Promise<T | null> {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
    }

    async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
        await this.redis.setex(key, ttl, JSON.stringify(value));
    }

    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async flush(): Promise<void> {
        await this.redis.flushall();
    }
}

// Cached service wrapper
function withCache<T extends any[], R>(
    cacheKey: (...args: T) => string,
    ttl: number = 3600
) {
    return function (
        target: any,
        propertyName: string,
        descriptor: PropertyDescriptor
    ) {
        const method = descriptor.value;

        descriptor.value = async function (...args: T): Promise<R> {
            const key = cacheKey(...args);

            // Try to get from cache
            const cached = await cacheService.get<R>(key);
            if (cached) {
                return cached;
            }

            // Execute original method
            const result = await method.apply(this, args);

            // Cache the result
            await cacheService.set(key, result, ttl);

            return result;
        };
    };
}

// Usage
class UserService {
    @withCache(
        (id: string) => `user:${id}`,
        3600 // 1 hour TTL
    )
    static async findById(id: UserId): Promise<IUser | null> {
        return await User.findById(id);
    }
}
```

### 3. **Request/Response Optimization**

```typescript
// Response compression middleware
import compression from "compression";
import { Request, Response, NextFunction } from "express";

const compressionMiddleware = compression({
    filter: (req: Request, res: Response) => {
        if (req.headers["x-no-compression"]) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024,
});

// Response time tracking
const responseTimeMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        res.setHeader("X-Response-Time", `${duration}ms`);

        // Log slow requests
        if (duration > 1000) {
            console.warn(
                `Slow request: ${req.method} ${req.path} took ${duration}ms`
            );
        }
    });

    next();
};

// Request size limiting
import { json, urlencoded } from "express";

const requestLimitingMiddleware = [
    json({ limit: "10mb" }),
    urlencoded({ limit: "10mb", extended: true }),
];
```

---

## Common Issues & Solutions {#troubleshooting}

### 1. **Module Resolution Issues**

```typescript
// Issue: Can't resolve module imports
// Solution: Use path mapping in tsconfig.json

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/controllers/*": ["controllers/*"],
      "@/services/*": ["services/*"],
      "@/models/*": ["models/*"],
      "@/types/*": ["types/*"],
      "@/utils/*": ["utils/*"]
    }
  }
}

// Usage
import { UserService } from '@/services';
import { IUser } from '@/models';
import { ApiResponse } from '@/types';
```

### 2. **ES Modules vs CommonJS**

```typescript
// Issue: Mixed module systems
// Solution: Consistent ES modules configuration

// package.json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "nodemon --exec \"node --loader ts-node/esm\" src/server.ts"
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "ts-node": {
    "esm": true
  }
}

// Import with .js extensions for compiled output
import User from './models/user.js';
import { AuthService } from './services/auth.service.js';
```

### 3. **Environment Variable Typing**

```typescript
// Issue: process.env values are always string | undefined
// Solution: Create typed environment service

// types/environment.d.ts
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production" | "test";
            PORT: string;
            MONGO_URL: string;
            JWT_SECRET: string;
            JWT_EXPIRES_IN: string;
            EMAIL_USER: string;
            EMAIL_PASS: string;
        }
    }
}

export {};

// utils/env.ts
function getEnvVar(name: keyof NodeJS.ProcessEnv): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not set`);
    }
    return value;
}

function getEnvVarAsNumber(name: keyof NodeJS.ProcessEnv): number {
    const value = getEnvVar(name);
    const number = parseInt(value, 10);
    if (isNaN(number)) {
        throw new Error(`Environment variable ${name} is not a valid number`);
    }
    return number;
}

// Usage
const jwtSecret = getEnvVar("JWT_SECRET"); // string
const port = getEnvVarAsNumber("PORT"); // number
```

### 4. **Mongoose TypeScript Issues**

```typescript
// Issue: Mongoose model typing conflicts
// Solution: Proper interface extensions

import mongoose, { Document, Model } from "mongoose";

// Document interface
interface IUserDoc extends Document {
    name: string;
    email: string;
    password: string;
    comparePassword(password: string): Promise<boolean>;
}

// Model interface for static methods
interface IUserModel extends Model<IUserDoc> {
    findByEmail(email: string): Promise<IUserDoc | null>;
}

// Schema definition
const userSchema = new mongoose.Schema<IUserDoc>({
    name: String,
    email: String,
    password: String,
});

// Add methods
userSchema.methods.comparePassword = async function (password: string) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email });
};

// Export typed model
export default mongoose.model<IUserDoc, IUserModel>("User", userSchema);
```

---

## Development Tools Setup {#tools}

### 1. **ESLint Configuration**

```javascript
// .eslintrc.js
module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "@typescript-eslint/recommended",
        "@typescript-eslint/recommended-requiring-type-checking",
    ],
    rules: {
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/prefer-nullish-coalescing": "error",
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/await-thenable": "error",
    },
    env: {
        node: true,
        es6: true,
    },
};
```

### 2. **Prettier Configuration**

```javascript
// .prettierrc.js
module.exports = {
    semi: true,
    trailingComma: "es5",
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    bracketSpacing: true,
    arrowParens: "avoid",
};
```

### 3. **Husky + Lint-staged**

```json
// package.json
{
    "husky": {
        "hooks": {
            "pre-commit": "lint-staged",
            "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
        }
    },
    "lint-staged": {
        "*.{ts,tsx}": ["eslint --fix", "prettier --write", "git add"]
    }
}
```

### 4. **VS Code Configuration**

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}

// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

---

Continue reading: [Security and Deployment Guide](./SECURITY_DEPLOYMENT.md)
