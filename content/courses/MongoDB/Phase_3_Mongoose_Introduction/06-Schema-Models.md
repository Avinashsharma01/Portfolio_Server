# Phase 3: Schema and Models

## 📖 Table of Contents

1. [Schema Deep Dive](#schema-deep-dive)
2. [Schema Types and Options](#schema-types-and-options)
3. [Schema Methods and Statics](#schema-methods-and-statics)
4. [Virtual Properties](#virtual-properties)
5. [Schema Middleware (Hooks)](#schema-middleware-hooks)
6. [Model Methods](#model-methods)
7. [Advanced Schema Features](#advanced-schema-features)
8. [Schema Organization](#schema-organization)

## Schema Deep Dive

A **Schema** in Mongoose defines the structure, data types, validation rules, and behavior of documents in a MongoDB collection.

### Basic Schema Structure

```javascript
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Basic schema definition
const userSchema = new Schema(
    {
        // Field definitions
        name: String,
        email: String,
        age: Number,
    },
    {
        // Schema options
        timestamps: true,
        collection: "users",
    }
);

// Create model from schema
const User = mongoose.model("User", userSchema);
```

### Schema Definition Patterns

```javascript
// Pattern 1: Simple type definition
const simpleSchema = new Schema({
    name: String,
    age: Number,
    isActive: Boolean,
});

// Pattern 2: Object with type and options
const detailedSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        min: 0,
        max: 120,
    },
});

// Pattern 3: Mixed patterns
const mixedSchema = new Schema({
    title: String, // Simple
    description: {
        // Detailed
        type: String,
        maxLength: 500,
        default: "",
    },
    tags: [String], // Array simple
    metadata: {
        // Embedded document
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
    },
});
```

## Schema Types and Options

### Basic Schema Types

```javascript
const mongoose = require("mongoose");
const { Schema } = mongoose;

const allTypesSchema = new Schema({
    // String type
    stringField: {
        type: String,
        required: [true, "String field is required"],
        minLength: [3, "Must be at least 3 characters"],
        maxLength: [50, "Cannot exceed 50 characters"],
        trim: true, // Remove whitespace
        lowercase: true, // Convert to lowercase
        uppercase: false, // Convert to uppercase
        match: [/^[a-zA-Z]+$/, "Only letters allowed"],
        enum: ["small", "medium", "large"], // Allowed values
        default: "medium",
    },

    // Number type
    numberField: {
        type: Number,
        required: true,
        min: [0, "Cannot be negative"],
        max: [1000, "Cannot exceed 1000"],
        validate: {
            validator: function (v) {
                return v % 2 === 0; // Must be even
            },
            message: "Number must be even",
        },
    },

    // Date type
    dateField: {
        type: Date,
        default: Date.now,
        min: new Date("2020-01-01"),
        max: new Date("2030-12-31"),
    },

    // Boolean type
    booleanField: {
        type: Boolean,
        default: false,
        required: true,
    },

    // Array types
    stringArray: [String],
    numberArray: [Number],
    mixedArray: [Schema.Types.Mixed],

    // ObjectId type (references)
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to User model
        required: true,
    },

    // Buffer type (for binary data)
    bufferField: {
        type: Buffer,
        required: false,
    },

    // Mixed type (any type)
    mixedField: {
        type: Schema.Types.Mixed,
        default: {},
    },

    // Decimal128 type (for precise decimals)
    priceField: {
        type: Schema.Types.Decimal128,
        required: true,
        validate: {
            validator: function (v) {
                return v > 0;
            },
            message: "Price must be positive",
        },
    },

    // Map type (key-value pairs)
    mapField: {
        type: Map,
        of: String, // Values must be strings
        default: new Map(),
    },
});
```

### Embedded Documents

```javascript
// Address as embedded document
const userSchema = new Schema({
    name: String,
    email: String,

    // Single embedded document
    profile: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        bio: { type: String, maxLength: 500 },
        avatar: String,
        socialMedia: {
            twitter: String,
            linkedin: String,
            github: String,
        },
    },

    // Array of embedded documents
    addresses: [
        {
            type: {
                type: String,
                enum: ["home", "work", "other"],
                required: true,
            },
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: String,
            zipCode: { type: String, required: true },
            country: { type: String, default: "USA" },
            isPrimary: { type: Boolean, default: false },
        },
    ],

    // Complex nested structure
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            push: { type: Boolean, default: true },
        },
        privacy: {
            profileVisible: { type: Boolean, default: true },
            showEmail: { type: Boolean, default: false },
            showPhone: { type: Boolean, default: false },
        },
        theme: {
            colorScheme: {
                type: String,
                enum: ["light", "dark", "auto"],
                default: "light",
            },
            language: {
                type: String,
                enum: ["en", "es", "fr", "de"],
                default: "en",
            },
        },
    },
});
```

### Schema Options

```javascript
const userSchema = new Schema(
    {
        name: String,
        email: String,
    },
    {
        // Automatically add createdAt and updatedAt fields
        timestamps: true,

        // Custom timestamp field names
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },

        // Collection name (optional, defaults to plural model name)
        collection: "app_users",

        // Disable _id field (not recommended)
        _id: false,

        // Auto-increment version key (__v)
        versionKey: false, // or custom name: 'version'

        // Strict mode - only allow fields defined in schema
        strict: true, // true (default), false, or 'throw'

        // Strict query mode
        strictQuery: true,

        // Transform output when converting to JSON
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.__v;
                return ret;
            },
            virtuals: true, // Include virtual properties
        },

        // Transform output when converting to Object
        toObject: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret._id;
                return ret;
            },
        },

        // Minimize empty objects
        minimize: false, // Keep empty objects

        // Type casting
        typecast: true, // Enable automatic type casting

        // Schema validation on update
        runValidators: true,

        // Use ES6 Maps for Mixed types
        useNestedStrict: true,

        // Optimize for bulk operations
        optimisticConcurrency: true,

        // Select fields by default
        selectPopulatedPaths: false,

        // Skip version check on save
        skipVersioning: { tags: true },
    }
);
```

## Schema Methods and Statics

### Instance Methods

Instance methods are available on individual documents.

```javascript
const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    dateOfBirth: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
});

// Instance method - available on document instances
userSchema.methods.getFullName = function () {
    return `${this.firstName} ${this.lastName}`;
};

userSchema.methods.getAge = function () {
    if (!this.dateOfBirth) return null;
    const ageDifMs = Date.now() - this.dateOfBirth.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

userSchema.methods.isAccountLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // If this is the 5th attempt and account isn't locked, lock it
    if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked()) {
        updates.$set = {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
        };
    }

    return this.updateOne(updates);
};

// Async instance method
userSchema.methods.sendWelcomeEmail = async function () {
    // Simulate email sending
    console.log(`Sending welcome email to ${this.email}`);
    return { sent: true, email: this.email };
};

const User = mongoose.model("User", userSchema);

// Using instance methods
const user = new User({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    dateOfBirth: new Date("1990-05-15"),
});

console.log(user.getFullName()); // "John Doe"
console.log(user.getAge()); // 34 (current year - 1990)
```

### Static Methods

Static methods are available on the Model itself.

```javascript
// Static methods - available on the Model
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function () {
    return this.find({ isActive: true, lockUntil: { $exists: false } });
};

userSchema.statics.findByAge = function (minAge, maxAge) {
    const now = new Date();
    const maxDate = new Date(
        now.getFullYear() - minAge,
        now.getMonth(),
        now.getDate()
    );
    const minDate = new Date(
        now.getFullYear() - maxAge,
        now.getMonth(),
        now.getDate()
    );

    return this.find({
        dateOfBirth: {
            $gte: minDate,
            $lte: maxDate,
        },
    });
};

userSchema.statics.createWithDefaults = function (userData) {
    const defaultData = {
        isActive: true,
        loginAttempts: 0,
        createdAt: new Date(),
    };

    return this.create({ ...defaultData, ...userData });
};

// Async static method
userSchema.statics.getUserStats = async function () {
    const [totalUsers, activeUsers, lockedUsers] = await Promise.all([
        this.countDocuments(),
        this.countDocuments({ isActive: true }),
        this.countDocuments({ lockUntil: { $exists: true, $gt: new Date() } }),
    ]);

    return {
        total: totalUsers,
        active: activeUsers,
        locked: lockedUsers,
        inactive: totalUsers - activeUsers,
    };
};

// Using static methods
const users = await User.findActiveUsers();
const user = await User.findByEmail("john@example.com");
const youngAdults = await User.findByAge(18, 30);
const stats = await User.getUserStats();
```

### Query Helpers

Query helpers let you extend mongoose's query builder.

```javascript
// Query helpers
userSchema.query.byEmail = function (email) {
    return this.where({ email: email.toLowerCase() });
};

userSchema.query.isActive = function () {
    return this.where({ isActive: true });
};

userSchema.query.isLocked = function () {
    return this.where({
        lockUntil: { $exists: true, $gt: new Date() },
    });
};

userSchema.query.youngerThan = function (age) {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - age);
    return this.where({ dateOfBirth: { $gt: cutoffDate } });
};

// Using query helpers (chainable)
const activeUsersWithEmail = await User.find()
    .isActive()
    .byEmail("john@example.com");

const youngActiveUsers = await User.find()
    .isActive()
    .youngerThan(30)
    .sort({ createdAt: -1 })
    .limit(10);
```

## Virtual Properties

Virtuals are document properties that don't get stored in MongoDB but can be computed from other properties.

### Basic Virtuals

```javascript
const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    dateOfBirth: Date,
});

// Virtual for full name
userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
userSchema.virtual("age").get(function () {
    if (!this.dateOfBirth) return null;
    const ageDifMs = Date.now() - this.dateOfBirth.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
});

// Virtual for email domain
userSchema.virtual("emailDomain").get(function () {
    return this.email ? this.email.split("@")[1] : null;
});

// Virtual with setter
userSchema.virtual("fullName").set(function (v) {
    const parts = v.split(" ");
    this.firstName = parts[0];
    this.lastName = parts.slice(1).join(" ");
});

// Make sure virtuals are included in JSON output
userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);

const user = new User({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    dateOfBirth: new Date("1990-05-15"),
});

console.log(user.fullName); // "John Doe"
console.log(user.age); // 34
console.log(user.emailDomain); // "example.com"

// Using virtual setter
user.fullName = "Jane Smith";
console.log(user.firstName); // "Jane"
console.log(user.lastName); // "Smith"
```

### Virtual Populate

Virtual populate lets you populate a field that isn't stored in the document.

```javascript
// User schema
const userSchema = new Schema({
    name: String,
    email: String,
});

// Virtual populate for user's posts
userSchema.virtual("posts", {
    ref: "Post", // Model to populate from
    localField: "_id", // Field in User
    foreignField: "author", // Field in Post
    justOne: false, // Return array (not single doc)
});

// Virtual populate with count
userSchema.virtual("postCount", {
    ref: "Post",
    localField: "_id",
    foreignField: "author",
    count: true, // Return count instead of documents
});

// Post schema
const postSchema = new Schema({
    title: String,
    content: String,
    author: { type: Schema.Types.ObjectId, ref: "User" },
    publishedAt: Date,
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

// Using virtual populate
const user = await User.findById(userId).populate("posts");
console.log(user.posts); // Array of user's posts

const userWithCount = await User.findById(userId).populate("postCount");
console.log(userWithCount.postCount); // Number of posts
```

### Advanced Virtuals

```javascript
const orderSchema = new Schema({
    items: [
        {
            product: String,
            quantity: Number,
            price: Number,
        },
    ],
    tax: Number,
    shipping: Number,
    discount: Number,
});

// Virtual for subtotal
orderSchema.virtual("subtotal").get(function () {
    return this.items.reduce((sum, item) => {
        return sum + item.quantity * item.price;
    }, 0);
});

// Virtual for total with complex calculation
orderSchema.virtual("total").get(function () {
    const subtotal = this.subtotal;
    const taxAmount = subtotal * (this.tax || 0);
    const shippingAmount = this.shipping || 0;
    const discountAmount = this.discount || 0;

    return subtotal + taxAmount + shippingAmount - discountAmount;
});

// Virtual for formatted total
orderSchema.virtual("formattedTotal").get(function () {
    return `$${this.total.toFixed(2)}`;
});

// Virtual for item count
orderSchema.virtual("itemCount").get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});
```

## Schema Middleware (Hooks)

Middleware (hooks) are functions that run during specific operations. They come in two types: pre and post.

### Pre Middleware

Pre middleware runs before the operation.

```javascript
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
    username: String,
    email: String,
    password: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
});

// Pre-save middleware
userSchema.pre("save", async function (next) {
    // Only hash password if it has been modified
    if (!this.isModified("password")) return next();

    try {
        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware for email normalization
userSchema.pre("save", function (next) {
    if (this.email) {
        this.email = this.email.toLowerCase().trim();
    }
    next();
});

// Pre-validate middleware
userSchema.pre("validate", function (next) {
    // Custom validation logic
    if (this.username && this.username.length < 3) {
        this.invalidate("username", "Username must be at least 3 characters");
    }
    next();
});

// Pre-remove middleware
userSchema.pre("remove", async function (next) {
    try {
        // Clean up related data before removing user
        await mongoose.model("Post").deleteMany({ author: this._id });
        await mongoose.model("Comment").deleteMany({ user: this._id });
        console.log(`Cleaned up data for user ${this._id}`);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-findOneAndUpdate middleware
userSchema.pre("findOneAndUpdate", function (next) {
    // Update the updatedAt field
    this.set({ updatedAt: new Date() });
    next();
});
```

### Post Middleware

Post middleware runs after the operation.

```javascript
// Post-save middleware
userSchema.post("save", function (doc, next) {
    console.log(`User ${doc.username} has been saved`);

    // Send welcome email for new users
    if (doc.isNew) {
        // Simulate sending welcome email
        console.log(`Sending welcome email to ${doc.email}`);
    }

    next();
});

// Post-save error handling
userSchema.post("save", function (error, doc, next) {
    if (error.name === "MongoError" && error.code === 11000) {
        next(new Error("Username or email already exists"));
    } else {
        next(error);
    }
});

// Post-findOneAndUpdate middleware
userSchema.post("findOneAndUpdate", function (doc) {
    if (doc) {
        console.log(`User ${doc.username} has been updated`);
    }
});

// Post-remove middleware
userSchema.post("remove", function (doc) {
    console.log(`User ${doc.username} has been removed`);

    // Log user removal for audit trail
    mongoose.model("AuditLog").create({
        action: "user_removed",
        userId: doc._id,
        timestamp: new Date(),
        details: { username: doc.username, email: doc.email },
    });
});

// Post-init middleware (after document is loaded from DB)
userSchema.post("init", function (doc) {
    console.log(`User ${doc.username} loaded from database`);
});
```

### Middleware for Different Operations

```javascript
// Multiple operations
userSchema.pre(["find", "findOne", "findOneAndUpdate"], function () {
    // Only return active users by default
    this.where({ isActive: { $ne: false } });
});

// Update operations
userSchema.pre(["updateOne", "updateMany", "findOneAndUpdate"], function () {
    this.set({ updatedAt: new Date() });
});

// Aggregation middleware
userSchema.pre("aggregate", function () {
    // Add match stage to only include active users
    this.pipeline().unshift({ $match: { isActive: { $ne: false } } });
});
```

### Error Handling in Middleware

```javascript
// Async middleware with proper error handling
userSchema.pre("save", async function (next) {
    try {
        // Check if username is unique (custom validation)
        if (this.isModified("username")) {
            const existingUser = await this.constructor.findOne({
                username: this.username,
                _id: { $ne: this._id },
            });

            if (existingUser) {
                const error = new Error("Username already taken");
                error.status = 400;
                return next(error);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Parallel middleware (runs in parallel)
userSchema.pre("save", true, function (next, done) {
    // This middleware runs in parallel
    // Call next() immediately, then call done() when finished
    next();

    // Do some async work
    setTimeout(() => {
        console.log("Parallel middleware completed");
        done();
    }, 100);
});
```

## Model Methods

### Basic Model Operations

```javascript
const User = mongoose.model("User", userSchema);

// Create operations
const user = new User({ name: "John", email: "john@example.com" });
await user.save();

// Static create method
const user2 = await User.create({ name: "Jane", email: "jane@example.com" });

// Bulk create
const users = await User.create([
    { name: "Bob", email: "bob@example.com" },
    { name: "Alice", email: "alice@example.com" },
]);

// Find operations
const allUsers = await User.find();
const activeUsers = await User.find({ isActive: true });
const user = await User.findById(userId);
const user = await User.findOne({ email: "john@example.com" });

// Update operations
await User.updateOne({ _id: userId }, { name: "John Updated" });
await User.updateMany({ isActive: false }, { archived: true });

const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name: "John Updated" },
    { new: true, runValidators: true }
);

// Delete operations
await User.deleteOne({ _id: userId });
await User.deleteMany({ isActive: false });

const deletedUser = await User.findByIdAndDelete(userId);
```

### Advanced Model Methods

```javascript
// Count documents
const userCount = await User.countDocuments();
const activeUserCount = await User.countDocuments({ isActive: true });

// Distinct values
const uniqueEmails = await User.distinct("email");
const uniqueDomains = await User.distinct("emailDomain");

// Exists check
const userExists = await User.exists({ email: "john@example.com" });

// Aggregation
const userStats = await User.aggregate([
    { $match: { isActive: true } },
    {
        $group: {
            _id: "$role",
            count: { $sum: 1 },
            avgAge: { $avg: "$age" },
        },
    },
]);

// Bulk operations
const bulkOps = [
    {
        updateOne: {
            filter: { email: "john@example.com" },
            update: { $set: { lastLogin: new Date() } },
        },
    },
    {
        deleteOne: {
            filter: {
                isActive: false,
                createdAt: { $lt: new Date("2020-01-01") },
            },
        },
    },
];

const result = await User.bulkWrite(bulkOps);
```

## Advanced Schema Features

### Schema Inheritance

```javascript
// Base schema
const baseSchema = new Schema(
    {
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
    },
    { discriminatorKey: "type" }
);

// Base model
const BaseModel = mongoose.model("Base", baseSchema);

// User discriminator
const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
});

// Product discriminator
const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: String,
});

const User = BaseModel.discriminator("User", userSchema);
const Product = BaseModel.discriminator("Product", productSchema);

// Usage
const user = new User({ username: "john", email: "john@example.com" });
const product = new Product({ name: "Laptop", price: 999.99 });
```

### Schema Plugins

```javascript
// Custom plugin
function timestampPlugin(schema, options) {
    schema.add({
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    });

    schema.pre("save", function (next) {
        if (!this.isNew) {
            this.updatedAt = Date.now();
        }
        next();
    });

    if (options && options.index) {
        schema.index({ createdAt: 1 });
        schema.index({ updatedAt: 1 });
    }
}

// Apply plugin to schema
userSchema.plugin(timestampPlugin, { index: true });

// Popular plugins
const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoosePaginate = require("mongoose-paginate-v2");

// Auto-increment plugin
userSchema.plugin(mongooseAutoIncrement.plugin, {
    model: "User",
    field: "userId",
    startAt: 1000,
});

// Pagination plugin
userSchema.plugin(mongoosePaginate);

// Usage with pagination
const options = {
    page: 1,
    limit: 10,
    sort: { createdAt: -1 },
};

const result = await User.paginate({ isActive: true }, options);
console.log(result.docs); // Documents
console.log(result.totalPages); // Total pages
console.log(result.hasNextPage); // Has next page
```

### Custom Schema Types

```javascript
// Custom schema type for email
function Email(key, options) {
    mongoose.SchemaType.call(this, key, options, "Email");
}

Email.prototype = Object.create(mongoose.SchemaType.prototype);

Email.prototype.cast = function (val) {
    if (!val || typeof val !== "string") {
        throw new Error("Email must be a string");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
        throw new Error("Invalid email format");
    }

    return val.toLowerCase();
};

// Add to mongoose
mongoose.Schema.Types.Email = Email;

// Use custom type
const userSchema = new Schema({
    email: { type: mongoose.Schema.Types.Email, required: true },
});
```

## Schema Organization

### Modular Schema Design

```javascript
// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, minLength: 6 },
        profile: {
            firstName: String,
            lastName: String,
            avatar: String,
            bio: { type: String, maxLength: 500 },
        },
        role: {
            type: String,
            enum: ["user", "moderator", "admin"],
            default: "user",
        },
        isActive: { type: Boolean, default: true },
        lastLogin: Date,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ "profile.firstName": 1, "profile.lastName": 1 });

// Virtuals
userSchema.virtual("fullName").get(function () {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim();
});

// Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
};

// Statics
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model("User", userSchema);
```

### Schema Factory Pattern

```javascript
// utils/schemaFactory.js
const mongoose = require("mongoose");

class SchemaFactory {
    static createBaseSchema(additionalFields = {}, options = {}) {
        const baseFields = {
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },
            isActive: { type: Boolean, default: true },
            ...additionalFields,
        };

        const defaultOptions = {
            timestamps: false, // We handle this manually
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
            ...options,
        };

        const schema = new mongoose.Schema(baseFields, defaultOptions);

        // Add common middleware
        schema.pre("save", function (next) {
            if (!this.isNew) {
                this.updatedAt = Date.now();
            }
            next();
        });

        return schema;
    }

    static addTimestamps(schema) {
        schema.add({
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },
        });

        schema.pre("save", function (next) {
            if (!this.isNew) {
                this.updatedAt = Date.now();
            }
            next();
        });

        return schema;
    }

    static addSoftDelete(schema) {
        schema.add({
            isDeleted: { type: Boolean, default: false },
            deletedAt: Date,
        });

        schema.methods.softDelete = function () {
            this.isDeleted = true;
            this.deletedAt = new Date();
            return this.save();
        };

        schema.pre(/^find/, function () {
            this.where({ isDeleted: { $ne: true } });
        });

        return schema;
    }
}

module.exports = SchemaFactory;

// Usage
const SchemaFactory = require("../utils/schemaFactory");

const productSchema = SchemaFactory.createBaseSchema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: String,
});

SchemaFactory.addSoftDelete(productSchema);

module.exports = mongoose.model("Product", productSchema);
```

## 🎯 Practice Exercises

### Exercise 1: Advanced User Schema

Create a comprehensive user schema with:

1. Personal information with validation
2. Multiple contact methods (email, phone, social media)
3. User preferences and settings
4. Account security features (login attempts, lockout)
5. Virtual properties for computed values

### Exercise 2: E-commerce Product Schema

Design a product schema with:

1. Product variants (size, color, etc.)
2. Pricing with discounts and taxes
3. Inventory tracking
4. Review and rating system
5. SEO metadata

### Exercise 3: Blog System Schema

Create schemas for:

1. Authors with profiles and social links
2. Posts with categories, tags, and content
3. Comments with threading capability
4. Proper relationships between entities

## 🔧 Best Practices

### Schema Design

1. **Plan your schema** based on query patterns
2. **Use appropriate data types** for each field
3. **Add validation** at the schema level
4. **Consider indexing** for frequently queried fields
5. **Keep schemas focused** and avoid over-nesting

### Performance

1. **Use lean queries** when you don't need full documents
2. **Select only needed fields** with projection
3. **Create proper indexes** for your queries
4. **Avoid deep population** chains
5. **Use virtual populate** for one-to-many relationships

### Maintainability

1. **Organize schemas** in separate files
2. **Use consistent naming** conventions
3. **Document complex business logic** in comments
4. **Create reusable schema components**
5. **Version your schemas** for migrations

---

## 🔄 Next Steps

After mastering schemas and models:

1. Practice creating complex schema relationships
2. Experiment with middleware and virtual properties
3. Learn about query optimization and indexing
4. Move to **07-Queries-Filtering.md** to explore advanced querying techniques

---

_Continue to Phase 4: Advanced Operations_
