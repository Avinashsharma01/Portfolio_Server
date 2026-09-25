# Advanced TypeScript Patterns for Backend Development

## Table of Contents

1. [Generic Patterns](#generics)
2. [Utility Types](#utility-types)
3. [Advanced Express Patterns](#express)
4. [Database Patterns](#database)
5. [Error Handling](#errors)
6. [Dependency Injection](#di)
7. [API Design Patterns](#api)
8. [Performance Optimization](#performance)

---

## Generic Patterns {#generics}

### 1. **Generic API Response Wrapper**

```typescript
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
}

class ResponseBuilder {
    static success<T>(data: T, message = "Success"): ApiResponse<T> {
        return {
            success: true,
            message,
            data,
        };
    }

    static error(message: string, errors?: string[]): ApiResponse<null> {
        return {
            success: false,
            message,
            errors,
        };
    }
}

// Usage
app.get("/users/:id", async (req, res) => {
    try {
        const user = await UserService.findById(req.params.id);
        res.json(ResponseBuilder.success(user));
    } catch (error) {
        res.status(500).json(ResponseBuilder.error("User not found"));
    }
});
```

### 2. **Generic Repository Pattern**

```typescript
interface BaseEntity {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Repository<T extends BaseEntity> {
    findById(id: string): Promise<T | null>;
    findAll(filter?: Partial<T>): Promise<T[]>;
    create(data: Omit<T, "_id" | "createdAt" | "updatedAt">): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}

class MongoRepository<T extends BaseEntity> implements Repository<T> {
    constructor(private model: mongoose.Model<T>) {}

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }

    async findAll(filter: Partial<T> = {}): Promise<T[]> {
        return await this.model.find(filter);
    }

    async create(data: Omit<T, "_id" | "createdAt" | "updatedAt">): Promise<T> {
        const entity = new this.model(data);
        return await entity.save();
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id);
        return !!result;
    }
}
```

### 3. **Generic Service Layer**

```typescript
abstract class BaseService<T extends BaseEntity> {
    constructor(protected repository: Repository<T>) {}

    async findById(id: string): Promise<T> {
        const entity = await this.repository.findById(id);
        if (!entity) {
            throw new NotFoundError(`Entity with id ${id} not found`);
        }
        return entity;
    }

    async findAll(filter?: Partial<T>): Promise<T[]> {
        return await this.repository.findAll(filter);
    }

    async create(data: Omit<T, "_id" | "createdAt" | "updatedAt">): Promise<T> {
        await this.validateCreate(data);
        return await this.repository.create(data);
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        await this.validateUpdate(id, data);
        const updated = await this.repository.update(id, data);
        if (!updated) {
            throw new NotFoundError(`Entity with id ${id} not found`);
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new NotFoundError(`Entity with id ${id} not found`);
        }
    }

    protected abstract validateCreate(
        data: Omit<T, "_id" | "createdAt" | "updatedAt">
    ): Promise<void>;
    protected abstract validateUpdate(
        id: string,
        data: Partial<T>
    ): Promise<void>;
}
```

---

## Utility Types {#utility-types}

### 1. **Request/Response Type Helpers**

```typescript
// Extract common patterns
type RequestHandler<
    P = {}, // Params
    R = any, // Response
    B = any, // Body
    Q = {} // Query
> = (
    req: Request<P, R, B, Q>,
    res: Response<R>,
    next: NextFunction
) => Promise<void> | void;

// Specific handlers
type GetUserHandler = RequestHandler<
    { id: string }, // Params
    UserResponse | ErrorResponse, // Response
    never, // Body
    never // Query
>;

type CreateUserHandler = RequestHandler<
    {}, // Params
    UserResponse | ErrorResponse, // Response
    CreateUserRequest, // Body
    never // Query
>;

type GetUsersHandler = RequestHandler<
    {}, // Params
    UserResponse[] | ErrorResponse, // Response
    never, // Body
    { page?: string; limit?: string } // Query
>;
```

### 2. **Data Transformation Types**

```typescript
// Create safe public user type
interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}

// Safe public version without sensitive fields
type PublicUser = Omit<User, "password">;

// User creation type
type CreateUserData = Pick<User, "name" | "email" | "password" | "role">;

// User update type (all optional except id)
type UpdateUserData = Partial<Pick<User, "name" | "email" | "role">>;

// Login credentials
type LoginCredentials = Pick<User, "email" | "password">;
```

### 3. **Database Query Types**

```typescript
// Generic pagination
interface PaginationQuery {
    page?: string;
    limit?: string;
    sort?: string;
    order?: "asc" | "desc";
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Search and filter types
type UserFilters = Partial<Pick<User, "role">> & {
    search?: string;
    createdAfter?: Date;
    createdBefore?: Date;
};

type SortableUserFields = keyof Pick<
    User,
    "name" | "email" | "createdAt" | "updatedAt"
>;
```

---

## Advanced Express Patterns {#express}

### 1. **Typed Route Handlers**

```typescript
interface RouteHandler<T = any> {
    path: string;
    method: "get" | "post" | "put" | "delete" | "patch";
    middleware?: RequestHandler[];
    handler: RequestHandler<any, T>;
    validation?: {
        body?: any;
        params?: any;
        query?: any;
    };
}

class TypedRouter {
    private routes: RouteHandler[] = [];

    get<R>(
        path: string,
        handler: RequestHandler<any, R>,
        middleware?: RequestHandler[]
    ): this {
        this.routes.push({ path, method: "get", handler, middleware });
        return this;
    }

    post<R, B>(
        path: string,
        handler: RequestHandler<any, R, B>,
        middleware?: RequestHandler[]
    ): this {
        this.routes.push({ path, method: "post", handler, middleware });
        return this;
    }

    build(): Router {
        const router = Router();

        this.routes.forEach((route) => {
            const middleware = route.middleware || [];
            router[route.method](route.path, ...middleware, route.handler);
        });

        return router;
    }
}

// Usage
const userRouter = new TypedRouter()
    .get<PublicUser>("/users/:id", getUserHandler, [authMiddleware])
    .post<PublicUser, CreateUserData>("/users", createUserHandler, [
        adminMiddleware,
    ])
    .build();
```

### 2. **Type-Safe Middleware Factory**

```typescript
interface MiddlewareOptions<T = any> {
    required?: boolean;
    transform?: (value: any) => T;
    validate?: (value: T) => boolean | string;
}

function createValidationMiddleware<T>(
    field: string,
    options: MiddlewareOptions<T> = {}
) {
    return (req: Request, res: Response, next: NextFunction) => {
        const value = req.body[field];

        if (options.required && (value === undefined || value === null)) {
            return res.status(400).json({
                error: `Field '${field}' is required`,
            });
        }

        if (value !== undefined && options.validate) {
            const validation = options.validate(value);
            if (validation !== true) {
                return res.status(400).json({
                    error:
                        typeof validation === "string"
                            ? validation
                            : `Invalid ${field}`,
                });
            }
        }

        if (options.transform && value !== undefined) {
            req.body[field] = options.transform(value);
        }

        next();
    };
}

// Usage
const validateEmail = createValidationMiddleware("email", {
    required: true,
    validate: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
});

const validateAge = createValidationMiddleware("age", {
    transform: (value: string) => parseInt(value, 10),
    validate: (age: number) => age >= 18 && age <= 120,
});
```

### 3. **Advanced Error Handling**

```typescript
abstract class AppError extends Error {
    abstract statusCode: number;
    abstract isOperational: boolean;

    constructor(message: string, public context?: Record<string, any>) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    statusCode = 400;
    isOperational = true;

    constructor(message: string, public fields?: Record<string, string>) {
        super(message, { fields });
    }
}

class NotFoundError extends AppError {
    statusCode = 404;
    isOperational = true;

    constructor(resource: string, id?: string) {
        super(`${resource}${id ? ` with id ${id}` : ""} not found`);
    }
}

class AuthenticationError extends AppError {
    statusCode = 401;
    isOperational = true;

    constructor(message = "Authentication failed") {
        super(message);
    }
}

// Global error handler
const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            ...(error.context && { context: error.context }),
        });
    }

    // Log unexpected errors
    console.error("Unexpected error:", error);

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
```

---

## Database Patterns {#database}

### 1. **Advanced Mongoose Patterns**

```typescript
// Schema with instance and static methods
interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;

    // Instance methods
    comparePassword(password: string): Promise<boolean>;
    generateAuthToken(): string;
    toPublicJSON(): PublicUser;
}

interface IUserModel extends Model<IUser> {
    // Static methods
    findByEmail(email: string): Promise<IUser | null>;
    findByRole(role: UserRole): Promise<IUser[]>;
    createWithHashedPassword(userData: CreateUserData): Promise<IUser>;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            validate: {
                validator: (email: string) =>
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
                message: "Invalid email format",
            },
        },
        password: { type: String, required: true, minlength: 8 },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Instance methods
userSchema.methods.comparePassword = async function (
    password: string
): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = function (): string {
    return jwt.sign(
        { id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    );
};

userSchema.methods.toPublicJSON = function (): PublicUser {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

// Static methods
userSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByRole = function (role: UserRole) {
    return this.find({ role });
};

userSchema.statics.createWithHashedPassword = async function (
    userData: CreateUserData
) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    return this.create({
        ...userData,
        password: hashedPassword,
    });
};

// Pre-save middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export default mongoose.model<IUser, IUserModel>("User", userSchema);
```

### 2. **Query Builder Pattern**

```typescript
class QueryBuilder<T> {
    private query: mongoose.Query<T[], T>;

    constructor(private model: mongoose.Model<T>) {
        this.query = model.find();
    }

    filter(conditions: Partial<T>): this {
        this.query = this.query.find(conditions);
        return this;
    }

    search(fields: (keyof T)[], term: string): this {
        if (term) {
            const searchConditions = fields.map((field) => ({
                [field]: { $regex: term, $options: "i" },
            }));
            this.query = this.query.or(searchConditions);
        }
        return this;
    }

    sort(field: keyof T, order: "asc" | "desc" = "asc"): this {
        const sortOrder = order === "asc" ? 1 : -1;
        this.query = this.query.sort({ [field]: sortOrder });
        return this;
    }

    paginate(page: number, limit: number): this {
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    populate(path: string | string[]): this {
        this.query = this.query.populate(path);
        return this;
    }

    async execute(): Promise<T[]> {
        return await this.query.exec();
    }

    async executeWithCount(): Promise<{ data: T[]; total: number }> {
        const [data, total] = await Promise.all([
            this.query.exec(),
            this.model.countDocuments(this.query.getFilter()),
        ]);
        return { data, total };
    }
}

// Usage
const users = await new QueryBuilder(User)
    .filter({ role: UserRole.USER })
    .search(["name", "email"], "john")
    .sort("createdAt", "desc")
    .paginate(1, 10)
    .execute();
```

### 3. **Transaction Patterns**

```typescript
class TransactionManager {
    private session: mongoose.ClientSession | null = null;

    async startTransaction(): Promise<void> {
        this.session = await mongoose.startSession();
        this.session.startTransaction();
    }

    async commitTransaction(): Promise<void> {
        if (this.session) {
            await this.session.commitTransaction();
            this.session.endSession();
            this.session = null;
        }
    }

    async abortTransaction(): Promise<void> {
        if (this.session) {
            await this.session.abortTransaction();
            this.session.endSession();
            this.session = null;
        }
    }

    getSession(): mongoose.ClientSession | null {
        return this.session;
    }

    async withTransaction<T>(
        operation: (session: mongoose.ClientSession) => Promise<T>
    ): Promise<T> {
        await this.startTransaction();
        try {
            const result = await operation(this.session!);
            await this.commitTransaction();
            return result;
        } catch (error) {
            await this.abortTransaction();
            throw error;
        }
    }
}

// Usage
class UserService {
    private transactionManager = new TransactionManager();

    async createUserWithProfile(
        userData: CreateUserData,
        profileData: any
    ): Promise<IUser> {
        return await this.transactionManager.withTransaction(
            async (session) => {
                // Create user
                const user = await User.create([userData], { session });

                // Create profile
                await Profile.create(
                    [{ ...profileData, userId: user[0]._id }],
                    { session }
                );

                return user[0];
            }
        );
    }
}
```

---

Continue reading: [TypeScript Best Practices](./TYPESCRIPT_BEST_PRACTICES.md)
