# Phase 5: Validation and Middleware

## 📖 Table of Contents

1. [Schema Validation Overview](#schema-validation-overview)
2. [Built-in Validators](#built-in-validators)
3. [Custom Validators](#custom-validators)
4. [Async Validators](#async-validators)
5. [Validation Messages](#validation-messages)
6. [Pre and Post Middleware](#pre-and-post-middleware)
7. [Error Handling](#error-handling)
8. [Real-world Validation Examples](#real-world-validation-examples)

## Schema Validation Overview

Mongoose provides robust validation capabilities that run before saving documents to the database. Validation helps ensure data integrity and consistency.

### Validation Flow

```javascript
// Validation occurs in this order:
// 1. Pre-validate middleware
// 2. Built-in validators
// 3. Custom validators
// 4. Post-validate middleware
// 5. Pre-save middleware (if validation passes)

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: "Invalid email format",
        },
    },
});

// Validation is triggered on:
// - save()
// - create()
// - findOneAndUpdate() with runValidators: true
// - updateOne/updateMany with runValidators: true
```

### Validation Configuration

```javascript
// Global validation settings
mongoose.set("runValidators", true); // Run validators on update operations

// Schema-level validation settings
const userSchema = new mongoose.Schema(
    {
        name: String,
    },
    {
        validateBeforeSave: true, // Run validation before save (default: true)
        runValidators: true, // Run validators on update operations
    }
);

// Document-level validation control
const user = new User({ name: "John" });
await user.save({ validateBeforeSave: false }); // Skip validation

// Update with validation
await User.updateOne(
    { _id: userId },
    { email: "newemail@example.com" },
    { runValidators: true }
);
```

## Built-in Validators

### String Validators

```javascript
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        minLength: [3, "Username must be at least 3 characters"],
        maxLength: [20, "Username cannot exceed 20 characters"],
        trim: true, // Remove whitespace
        lowercase: true, // Convert to lowercase
        match: [
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores",
        ],
        enum: {
            values: ["admin", "user", "moderator"],
            message: "{VALUE} is not a valid role",
        },
    },

    email: {
        type: String,
        required: true,
        unique: true, // Database-level constraint
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
        type: String,
        required: true,
        minLength: [8, "Password must be at least 8 characters"],
        maxLength: [128, "Password too long"],
        validate: {
            validator: function (password) {
                // At least one uppercase, one lowercase, one number, one special char
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
                    password
                );
            },
            message:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
    },

    role: {
        type: String,
        enum: {
            values: ["user", "admin", "moderator"],
            message: "Role must be either user, admin, or moderator",
        },
        default: "user",
    },
});
```

### Number Validators

```javascript
const productSchema = new mongoose.Schema({
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
        max: [10000, "Price cannot exceed $10,000"],
        validate: {
            validator: function (price) {
                // Price should have at most 2 decimal places
                return /^\d+(\.\d{1,2})?$/.test(price.toString());
            },
            message: "Price can have at most 2 decimal places",
        },
    },

    quantity: {
        type: Number,
        required: true,
        min: [0, "Quantity cannot be negative"],
        validate: {
            validator: Number.isInteger,
            message: "Quantity must be an integer",
        },
    },

    rating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"],
        validate: {
            validator: function (rating) {
                // Rating should be in increments of 0.5
                return rating % 0.5 === 0;
            },
            message: "Rating must be in increments of 0.5",
        },
    },

    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
        validate: {
            validator: function (discount) {
                // Discount percentage validation
                return discount >= 0 && discount <= 100;
            },
            message: "Discount must be between 0 and 100 percent",
        },
    },
});
```

### Date Validators

```javascript
const eventSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: [true, "Start date is required"],
        validate: {
            validator: function (date) {
                return date > new Date();
            },
            message: "Start date must be in the future",
        },
    },

    endDate: {
        type: Date,
        required: [true, "End date is required"],
        validate: {
            validator: function (date) {
                // End date must be after start date
                return this.startDate && date > this.startDate;
            },
            message: "End date must be after start date",
        },
    },

    registrationDeadline: {
        type: Date,
        validate: {
            validator: function (date) {
                // Registration deadline must be before start date
                return !date || (this.startDate && date < this.startDate);
            },
            message: "Registration deadline must be before start date",
        },
    },

    birthDate: {
        type: Date,
        validate: {
            validator: function (date) {
                const age =
                    (new Date() - date) / (365.25 * 24 * 60 * 60 * 1000);
                return age >= 13 && age <= 120;
            },
            message: "Age must be between 13 and 120 years",
        },
    },
});
```

### Array Validators

```javascript
const blogPostSchema = new mongoose.Schema({
    tags: {
        type: [String],
        validate: {
            validator: function (tags) {
                return tags && tags.length > 0 && tags.length <= 10;
            },
            message: "Post must have between 1 and 10 tags",
        },
    },

    categories: {
        type: [String],
        validate: [
            {
                validator: function (categories) {
                    return categories.length <= 3;
                },
                message: "Post cannot have more than 3 categories",
            },
            {
                validator: function (categories) {
                    // No duplicate categories
                    return categories.length === new Set(categories).size;
                },
                message: "Categories must be unique",
            },
        ],
    },

    collaborators: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            role: {
                type: String,
                enum: ["author", "editor", "reviewer"],
                required: true,
            },
        },
    ],

    // Validate embedded documents array
    comments: {
        type: [
            {
                author: { type: String, required: true },
                content: {
                    type: String,
                    required: true,
                    maxLength: [500, "Comment cannot exceed 500 characters"],
                },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        validate: {
            validator: function (comments) {
                return comments.length <= 100;
            },
            message: "Post cannot have more than 100 comments",
        },
    },
});
```

## Custom Validators

### Synchronous Custom Validators

```javascript
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        validate: [
            {
                validator: function (username) {
                    // Username cannot contain profanity
                    const profanityList = ["badword1", "badword2", "badword3"];
                    return !profanityList.some((word) =>
                        username.toLowerCase().includes(word.toLowerCase())
                    );
                },
                message: "Username contains inappropriate content",
            },
            {
                validator: function (username) {
                    // Username must start with a letter
                    return /^[a-zA-Z]/.test(username);
                },
                message: "Username must start with a letter",
            },
        ],
    },

    phoneNumber: {
        type: String,
        validate: {
            validator: function (phone) {
                if (!phone) return true; // Optional field

                // Validate phone number format (US format)
                const phoneRegex =
                    /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
                return phoneRegex.test(phone);
            },
            message: "Please enter a valid phone number",
        },
    },

    socialSecurityNumber: {
        type: String,
        validate: {
            validator: function (ssn) {
                if (!ssn) return true;

                // Basic SSN format validation
                const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
                if (!ssnRegex.test(ssn)) return false;

                // Remove dashes for further validation
                const cleanSSN = ssn.replace(/-/g, "");

                // Invalid SSN patterns
                const invalidPatterns = [
                    "000000000",
                    "111111111",
                    "222222222",
                    "333333333",
                    "444444444",
                    "555555555",
                    "666666666",
                    "777777777",
                    "888888888",
                    "999999999",
                ];

                return !invalidPatterns.includes(cleanSSN);
            },
            message: "Please enter a valid Social Security Number",
        },
    },
});
```

### Conditional Validators

```javascript
const orderSchema = new mongoose.Schema({
    orderType: {
        type: String,
        enum: ["standard", "express", "overnight"],
        required: true,
    },

    shippingAddress: {
        type: String,
        required: function () {
            // Shipping address required for express and overnight orders
            return (
                this.orderType === "express" || this.orderType === "overnight"
            );
        },
        validate: {
            validator: function (address) {
                // If shipping address is provided, it must be complete
                if (!address) return true;
                return address.length >= 10;
            },
            message: "Shipping address must be at least 10 characters",
        },
    },

    expediteFee: {
        type: Number,
        required: function () {
            return this.orderType !== "standard";
        },
        min: function () {
            return this.orderType === "overnight" ? 25 : 10;
        },
        validate: {
            validator: function (fee) {
                if (this.orderType === "standard") {
                    return fee === undefined || fee === 0;
                }
                return fee > 0;
            },
            message: "Expedite fee is required for non-standard orders",
        },
    },

    paymentMethod: {
        type: String,
        enum: ["credit_card", "paypal", "bank_transfer", "cash_on_delivery"],
        required: true,
        validate: {
            validator: function (method) {
                // Cash on delivery not available for overnight orders
                if (
                    this.orderType === "overnight" &&
                    method === "cash_on_delivery"
                ) {
                    return false;
                }
                return true;
            },
            message: "Cash on delivery is not available for overnight orders",
        },
    },
});
```

### Cross-field Validation

```javascript
const userRegistrationSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true,
        minLength: 8,
    },

    confirmPassword: {
        type: String,
        required: true,
        validate: {
            validator: function (confirmPassword) {
                return this.password === confirmPassword;
            },
            message: "Passwords do not match",
        },
    },

    birthDate: {
        type: Date,
        required: true,
    },

    parentEmail: {
        type: String,
        required: function () {
            // Parent email required for users under 13
            if (!this.birthDate) return false;
            const age =
                (new Date() - this.birthDate) / (365.25 * 24 * 60 * 60 * 1000);
            return age < 13;
        },
        validate: {
            validator: function (email) {
                if (!email) return true;
                return /^\S+@\S+\.\S+$/.test(email);
            },
            message: "Please enter a valid parent email",
        },
    },

    termsAccepted: {
        type: Boolean,
        required: true,
        validate: {
            validator: function (accepted) {
                return accepted === true;
            },
            message: "You must accept the terms and conditions",
        },
    },

    marketingConsent: {
        type: Boolean,
        default: false,
        validate: {
            validator: function (consent) {
                // Marketing consent validation based on region
                if (this.region === "EU" && consent === undefined) {
                    return false; // GDPR requires explicit consent
                }
                return true;
            },
            message:
                "Marketing consent must be explicitly provided for EU users",
        },
    },
});

// Remove confirmPassword before saving
userRegistrationSchema.pre("save", function (next) {
    this.confirmPassword = undefined;
    next();
});
```

## Async Validators

### Database Uniqueness Validation

```javascript
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        validate: {
            validator: async function (username) {
                // Check if username is unique (case-insensitive)
                const existingUser = await this.constructor.findOne({
                    username: new RegExp(`^${username}$`, "i"),
                    _id: { $ne: this._id }, // Exclude current document for updates
                });
                return !existingUser;
            },
            message: "Username is already taken",
        },
    },

    email: {
        type: String,
        required: true,
        validate: [
            {
                validator: function (email) {
                    return /^\S+@\S+\.\S+$/.test(email);
                },
                message: "Please enter a valid email",
            },
            {
                validator: async function (email) {
                    const existingUser = await this.constructor.findOne({
                        email: email.toLowerCase(),
                        _id: { $ne: this._id },
                    });
                    return !existingUser;
                },
                message: "Email is already registered",
            },
        ],
    },

    socialSecurityNumber: {
        type: String,
        validate: {
            validator: async function (ssn) {
                if (!ssn) return true;

                // Check against external fraud database (simulated)
                try {
                    const isFraudulent = await checkFraudDatabase(ssn);
                    return !isFraudulent;
                } catch (error) {
                    console.error("Fraud check failed:", error);
                    return true; // Allow if external service fails
                }
            },
            message: "Social Security Number flagged for fraud",
        },
    },
});

// Simulated external service
async function checkFraudDatabase(ssn) {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate fraud check (randomly return false for demo)
    return Math.random() < 0.05; // 5% chance of being flagged
}
```

### External API Validation

```javascript
const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    zipCode: {
        type: String,
        required: true,
        validate: {
            validator: async function (zipCode) {
                try {
                    // Validate zip code with external API
                    const response = await fetch(
                        `https://api.zippopotam.us/us/${zipCode}`
                    );
                    return response.ok;
                } catch (error) {
                    console.error("Zip code validation failed:", error);
                    return true; // Allow if API is down
                }
            },
            message: "Invalid zip code",
        },
    },

    country: {
        type: String,
        required: true,
        validate: {
            validator: async function (countryCode) {
                try {
                    // Validate country code against REST Countries API
                    const response = await fetch(
                        `https://restcountries.com/v3.1/alpha/${countryCode}`
                    );
                    return response.ok;
                } catch (error) {
                    return true; // Allow if API is down
                }
            },
            message: "Invalid country code",
        },
    },
});
```

### Business Logic Validation

```javascript
const bookingSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
    },

    checkInDate: {
        type: Date,
        required: true,
    },

    checkOutDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (checkOut) {
                return checkOut > this.checkInDate;
            },
            message: "Check-out date must be after check-in date",
        },
    },

    guests: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: async function (guestCount) {
                // Check room capacity
                const room = await mongoose.model("Room").findById(this.roomId);
                return room && guestCount <= room.maxOccupancy;
            },
            message: "Number of guests exceeds room capacity",
        },
    },
});

// Validate room availability
bookingSchema.pre("save", async function (next) {
    try {
        // Check for conflicting bookings
        const conflictingBooking = await this.constructor.findOne({
            roomId: this.roomId,
            _id: { $ne: this._id },
            $or: [
                {
                    checkInDate: { $lte: this.checkInDate },
                    checkOutDate: { $gt: this.checkInDate },
                },
                {
                    checkInDate: { $lt: this.checkOutDate },
                    checkOutDate: { $gte: this.checkOutDate },
                },
                {
                    checkInDate: { $gte: this.checkInDate },
                    checkOutDate: { $lte: this.checkOutDate },
                },
            ],
        });

        if (conflictingBooking) {
            const error = new Error(
                "Room is not available for the selected dates"
            );
            error.name = "ValidationError";
            return next(error);
        }

        next();
    } catch (error) {
        next(error);
    }
});
```

## Validation Messages

### Custom Error Messages

```javascript
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        minLength: [
            3,
            "Username must be at least {MINLENGTH} characters, got {VALUE}",
        ],
        maxLength: [20, "Username cannot exceed {MAXLENGTH} characters"],
        match: [
            /^[a-zA-Z0-9_]+$/,
            'Username "{VALUE}" contains invalid characters',
        ],
        validate: {
            validator: function (v) {
                return v !== "admin";
            },
            message: (props) => `${props.value} is a reserved username`,
        },
    },

    age: {
        type: Number,
        min: [0, "Age cannot be negative"],
        max: [150, "Age cannot exceed 150 years"],
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not a valid age",
        },
    },
});
```

### Dynamic Error Messages

```javascript
const productSchema = new mongoose.Schema({
    price: {
        type: Number,
        required: true,
        validate: {
            validator: function (price) {
                return price > 0;
            },
            message: function (props) {
                return `Price ${props.value} is invalid. Price must be greater than 0.`;
            },
        },
    },

    category: {
        type: String,
        required: true,
        validate: {
            validator: async function (category) {
                const validCategories = await mongoose
                    .model("Category")
                    .find({}, "name");
                return validCategories.some((cat) => cat.name === category);
            },
            message: function (props) {
                return `"${props.value}" is not a valid category`;
            },
        },
    },
});
```

### Internationalized Error Messages

```javascript
const createLocalizedMessages = (language = "en") => {
    const messages = {
        en: {
            required: "{PATH} is required",
            min: "{PATH} must be at least {MIN}",
            max: "{PATH} cannot exceed {MAX}",
            minLength: "{PATH} must be at least {MINLENGTH} characters",
            maxLength: "{PATH} cannot exceed {MAXLENGTH} characters",
            enum: '"{VALUE}" is not a valid {PATH}',
            unique: "{PATH} must be unique",
        },
        es: {
            required: "{PATH} es requerido",
            min: "{PATH} debe ser al menos {MIN}",
            max: "{PATH} no puede exceder {MAX}",
            minLength: "{PATH} debe tener al menos {MINLENGTH} caracteres",
            maxLength: "{PATH} no puede exceder {MAXLENGTH} caracteres",
            enum: '"{VALUE}" no es un {PATH} válido',
            unique: "{PATH} debe ser único",
        },
        fr: {
            required: "{PATH} est requis",
            min: "{PATH} doit être au moins {MIN}",
            max: "{PATH} ne peut pas dépasser {MAX}",
            minLength: "{PATH} doit avoir au moins {MINLENGTH} caractères",
            maxLength: "{PATH} ne peut pas dépasser {MAXLENGTH} caractères",
            enum: '"{VALUE}" n\'est pas un {PATH} valide',
            unique: "{PATH} doit être unique",
        },
    };

    return messages[language] || messages.en;
};

const createUserSchema = (language = "en") => {
    const messages = createLocalizedMessages(language);

    return new mongoose.Schema({
        username: {
            type: String,
            required: [true, messages.required.replace("{PATH}", "Username")],
            minLength: [
                3,
                messages.minLength
                    .replace("{PATH}", "Username")
                    .replace("{MINLENGTH}", "3"),
            ],
            unique: true,
        },

        age: {
            type: Number,
            min: [
                0,
                messages.min.replace("{PATH}", "Age").replace("{MIN}", "0"),
            ],
            max: [
                150,
                messages.max.replace("{PATH}", "Age").replace("{MAX}", "150"),
            ],
        },
    });
};
```

## Pre and Post Middleware

### Pre-Save Middleware

```javascript
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    profile: {
        firstName: String,
        lastName: String,
    },
    slug: String,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
});

// Password hashing
const bcrypt = require("bcryptjs");

userSchema.pre("save", async function (next) {
    // Only hash password if it has been modified
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Generate slug from username
userSchema.pre("save", function (next) {
    if (this.isModified("username")) {
        this.slug = this.username
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
    next();
});

// Normalize email
userSchema.pre("save", function (next) {
    if (this.email) {
        this.email = this.email.toLowerCase().trim();
    }
    next();
});

// Audit trail
userSchema.pre("save", function (next) {
    const now = new Date();

    if (this.isNew) {
        this.createdAt = now;
    }
    this.updatedAt = now;

    next();
});

// Business logic validation
userSchema.pre("save", async function (next) {
    try {
        // Reset login attempts if lock has expired
        if (this.lockUntil && this.lockUntil < Date.now()) {
            this.loginAttempts = 0;
            this.lockUntil = undefined;
        }

        next();
    } catch (error) {
        next(error);
    }
});
```

### Pre-Update Middleware

```javascript
// Pre-update middleware for findOneAndUpdate, updateOne, updateMany
userSchema.pre(
    ["findOneAndUpdate", "updateOne", "updateMany"],
    function (next) {
        // Update the updatedAt field
        this.set({ updatedAt: new Date() });

        // Hash password if being updated
        const update = this.getUpdate();
        if (update.password) {
            const salt = bcrypt.genSaltSync(12);
            update.password = bcrypt.hashSync(update.password, salt);
        }

        next();
    }
);

// Prevent certain fields from being updated
userSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
    const update = this.getUpdate();

    // Prevent updating createdAt
    if (update.createdAt || (update.$set && update.$set.createdAt)) {
        const error = new Error("Cannot update createdAt field");
        return next(error);
    }

    // Prevent updating username after account creation
    if (update.username || (update.$set && update.$set.username)) {
        const error = new Error("Username cannot be changed");
        return next(error);
    }

    next();
});
```

### Pre-Remove Middleware

```javascript
userSchema.pre("remove", async function (next) {
    try {
        // Clean up related data before removing user
        await mongoose.model("Post").deleteMany({ author: this._id });
        await mongoose.model("Comment").deleteMany({ user: this._id });
        await mongoose.model("Session").deleteMany({ userId: this._id });

        // Log user removal for audit
        await mongoose.model("AuditLog").create({
            action: "user_deleted",
            userId: this._id,
            timestamp: new Date(),
            metadata: {
                username: this.username,
                email: this.email,
            },
        });

        next();
    } catch (error) {
        next(error);
    }
});

// Soft delete instead of hard delete
userSchema.pre("remove", function (next) {
    // Instead of actually removing, mark as deleted
    this.isDeleted = true;
    this.deletedAt = new Date();

    // Save instead of remove
    this.save()
        .then(() => next())
        .catch(next);
});
```

### Post Middleware

```javascript
// Post-save middleware
userSchema.post("save", function (doc, next) {
    console.log(`User ${doc.username} has been saved`);

    // Send welcome email for new users
    if (doc.isNew) {
        // Queue welcome email
        emailQueue.add("welcome-email", {
            userId: doc._id,
            email: doc.email,
            username: doc.username,
        });
    }

    next();
});

// Post-save error handling
userSchema.post("save", function (error, doc, next) {
    if (error.name === "MongoError" && error.code === 11000) {
        // Handle duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        const customError = new Error(`${field} already exists`);
        customError.name = "ValidationError";
        next(customError);
    } else {
        next(error);
    }
});

// Post-init middleware (document loaded from DB)
userSchema.post("init", function (doc) {
    // Cache frequently accessed computed values
    if (doc.profile && doc.profile.firstName && doc.profile.lastName) {
        doc._fullName = `${doc.profile.firstName} ${doc.profile.lastName}`;
    }
});

// Post-validate middleware
userSchema.post("validate", function (doc) {
    console.log(`Validation passed for user: ${doc.username}`);
});

// Post-remove middleware
userSchema.post("remove", function (doc) {
    console.log(`User ${doc.username} has been removed`);

    // Notify admin of user removal
    notificationService.notify("admin", {
        type: "user_removed",
        message: `User ${doc.username} has been removed from the system`,
        timestamp: new Date(),
    });
});
```

### Middleware Error Handling

```javascript
// Parallel middleware (runs in parallel)
userSchema.pre("save", true, function (next, done) {
    // This middleware runs in parallel
    next(); // Call next() immediately

    // Do async work
    setTimeout(() => {
        console.log("Parallel middleware completed");
        done(); // Call done() when finished
    }, 100);
});

// Error handling in middleware
userSchema.pre("save", async function (next) {
    try {
        // Potentially failing operation
        await externalService.validateUser(this);
        next();
    } catch (error) {
        // Transform external errors
        const validationError = new Error("External validation failed");
        validationError.name = "ValidationError";
        next(validationError);
    }
});

// Conditional middleware
userSchema.pre("save", function (next) {
    // Only run for new documents
    if (!this.isNew) return next();

    // New user setup logic
    this.memberSince = new Date();
    this.status = "active";

    next();
});
```

## Error Handling

### Validation Error Processing

```javascript
const handleValidationError = (error) => {
    if (error.name === "ValidationError") {
        const errors = {};

        for (const field in error.errors) {
            const err = error.errors[field];

            errors[field] = {
                message: err.message,
                kind: err.kind,
                value: err.value,
                path: err.path,
            };
        }

        return {
            type: "validation",
            message: "Validation failed",
            errors: errors,
        };
    }

    return null;
};

// Usage in Express route
app.post("/users", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (error) {
        const validationError = handleValidationError(error);

        if (validationError) {
            return res.status(400).json({
                success: false,
                ...validationError,
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
```

### Custom Error Classes

```javascript
class ValidationError extends Error {
    constructor(message, field, value) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
        this.value = value;
    }
}

class BusinessRuleError extends Error {
    constructor(message, rule) {
        super(message);
        this.name = "BusinessRuleError";
        this.rule = rule;
    }
}

// Usage in validators
userSchema.path("email").validate(async function (email) {
    const existingUser = await this.constructor.findOne({
        email,
        _id: { $ne: this._id },
    });

    if (existingUser) {
        throw new ValidationError("Email already exists", "email", email);
    }

    return true;
});

// Global error handler
const errorHandler = (error, req, res, next) => {
    console.error(error);

    if (error.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            type: "validation",
            message: error.message,
            field: error.field,
            value: error.value,
        });
    }

    if (error.name === "BusinessRuleError") {
        return res.status(422).json({
            success: false,
            type: "business_rule",
            message: error.message,
            rule: error.rule,
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
```

## Real-world Validation Examples

### E-commerce Order Validation

```javascript
const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
        validate: {
            validator: async function (customerId) {
                const customer = await mongoose
                    .model("Customer")
                    .findById(customerId);
                return customer && customer.isActive;
            },
            message: "Customer not found or inactive",
        },
    },

    items: {
        type: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, "Quantity must be at least 1"],
                    validate: {
                        validator: Number.isInteger,
                        message: "Quantity must be an integer",
                    },
                },
                price: {
                    type: Number,
                    required: true,
                    min: [0, "Price cannot be negative"],
                },
            },
        ],
        required: true,
        validate: [
            {
                validator: function (items) {
                    return items && items.length > 0;
                },
                message: "Order must have at least one item",
            },
            {
                validator: function (items) {
                    return items.length <= 50;
                },
                message: "Order cannot have more than 50 items",
            },
        ],
    },

    shippingAddress: {
        street: { type: String, required: true, minLength: 5 },
        city: { type: String, required: true, minLength: 2 },
        state: { type: String, required: true, minLength: 2 },
        zipCode: {
            type: String,
            required: true,
            match: [/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"],
        },
        country: {
            type: String,
            required: true,
            enum: ["US", "CA", "MX"],
        },
    },

    paymentMethod: {
        type: {
            type: String,
            enum: ["credit_card", "debit_card", "paypal", "apple_pay"],
            required: true,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            validate: {
                validator: function (details) {
                    const type = this.paymentMethod.type;

                    if (type === "credit_card" || type === "debit_card") {
                        return (
                            details.last4 &&
                            details.expiryMonth &&
                            details.expiryYear
                        );
                    }

                    if (type === "paypal") {
                        return details.paypalEmail;
                    }

                    if (type === "apple_pay") {
                        return details.deviceId;
                    }

                    return false;
                },
                message: "Invalid payment method details",
            },
        },
    },

    total: {
        type: Number,
        required: true,
        min: [0.01, "Order total must be at least $0.01"],
    },
});

// Validate stock availability
orderSchema.pre("save", async function (next) {
    try {
        for (const item of this.items) {
            const product = await mongoose
                .model("Product")
                .findById(item.productId);

            if (!product) {
                return next(new Error(`Product ${item.productId} not found`));
            }

            if (!product.isActive) {
                return next(
                    new Error(`Product ${product.name} is no longer available`)
                );
            }

            if (product.stock < item.quantity) {
                return next(
                    new Error(`Insufficient stock for ${product.name}`)
                );
            }

            // Validate price hasn't changed significantly
            const priceDifference =
                Math.abs(product.price - item.price) / product.price;
            if (priceDifference > 0.05) {
                // 5% tolerance
                return next(new Error(`Price for ${product.name} has changed`));
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Validate order total
orderSchema.pre("save", function (next) {
    const calculatedTotal = this.items.reduce((sum, item) => {
        return sum + item.quantity * item.price;
    }, 0);

    // Add tax and shipping (simplified)
    const tax = calculatedTotal * 0.08;
    const shipping = calculatedTotal > 50 ? 0 : 9.99;
    const expectedTotal = calculatedTotal + tax + shipping;

    if (Math.abs(this.total - expectedTotal) > 0.01) {
        return next(new Error("Order total does not match calculated total"));
    }

    next();
});
```

### User Profile Validation

```javascript
const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },

    personalInfo: {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minLength: [1, "First name is required"],
            maxLength: [50, "First name too long"],
            match: [
                /^[a-zA-Z\s'-]+$/,
                "First name contains invalid characters",
            ],
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            minLength: [1, "Last name is required"],
            maxLength: [50, "Last name too long"],
            match: [/^[a-zA-Z\s'-]+$/, "Last name contains invalid characters"],
        },

        birthDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (date) {
                    const age =
                        (new Date() - date) / (365.25 * 24 * 60 * 60 * 1000);
                    return age >= 13 && age <= 120;
                },
                message: "Age must be between 13 and 120 years",
            },
        },

        phoneNumber: {
            type: String,
            validate: {
                validator: function (phone) {
                    if (!phone) return true;
                    return (
                        /^\+?[\d\s\-\(\)]+$/.test(phone) &&
                        phone.replace(/\D/g, "").length >= 10
                    );
                },
                message: "Please enter a valid phone number",
            },
        },
    },

    address: {
        street: {
            type: String,
            required: function () {
                return this.profileComplete;
            },
            minLength: [5, "Street address too short"],
        },

        city: {
            type: String,
            required: function () {
                return this.profileComplete;
            },
            minLength: [2, "City name too short"],
        },

        state: {
            type: String,
            required: function () {
                return this.profileComplete && this.address.country === "US";
            },
            validate: {
                validator: function (state) {
                    if (this.address.country !== "US") return true;

                    const usStates = [
                        "AL",
                        "AK",
                        "AZ",
                        "AR",
                        "CA",
                        "CO",
                        "CT",
                        "DE",
                        "FL",
                        "GA",
                        "HI",
                        "ID",
                        "IL",
                        "IN",
                        "IA",
                        "KS",
                        "KY",
                        "LA",
                        "ME",
                        "MD",
                        "MA",
                        "MI",
                        "MN",
                        "MS",
                        "MO",
                        "MT",
                        "NE",
                        "NV",
                        "NH",
                        "NJ",
                        "NM",
                        "NY",
                        "NC",
                        "ND",
                        "OH",
                        "OK",
                        "OR",
                        "PA",
                        "RI",
                        "SC",
                        "SD",
                        "TN",
                        "TX",
                        "UT",
                        "VT",
                        "VA",
                        "WA",
                        "WV",
                        "WI",
                        "WY",
                    ];

                    return usStates.includes(state);
                },
                message: "Invalid US state code",
            },
        },

        country: {
            type: String,
            required: function () {
                return this.profileComplete;
            },
            enum: {
                values: ["US", "CA", "MX", "UK", "DE", "FR", "JP", "AU"],
                message: "Country not supported",
            },
        },

        zipCode: {
            type: String,
            required: function () {
                return this.profileComplete;
            },
            validate: {
                validator: function (zip) {
                    const country = this.address.country;

                    if (country === "US") {
                        return /^\d{5}(-\d{4})?$/.test(zip);
                    } else if (country === "CA") {
                        return /^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(zip);
                    } else if (country === "UK") {
                        return /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/.test(zip);
                    }

                    return true; // Allow other formats for other countries
                },
                message: "Invalid postal code format",
            },
        },
    },

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

        language: {
            type: String,
            enum: ["en", "es", "fr", "de", "ja"],
            default: "en",
        },

        timezone: {
            type: String,
            validate: {
                validator: function (tz) {
                    if (!tz) return true;

                    try {
                        Intl.DateTimeFormat(undefined, { timeZone: tz });
                        return true;
                    } catch (error) {
                        return false;
                    }
                },
                message: "Invalid timezone",
            },
        },
    },

    profileComplete: {
        type: Boolean,
        default: false,
    },
});

// Auto-calculate profile completeness
userProfileSchema.pre("save", function (next) {
    const requiredFields = [
        "personalInfo.firstName",
        "personalInfo.lastName",
        "personalInfo.birthDate",
        "address.street",
        "address.city",
        "address.country",
        "address.zipCode",
    ];

    const isComplete = requiredFields.every((field) => {
        const value = field
            .split(".")
            .reduce((obj, key) => obj && obj[key], this);
        return value !== undefined && value !== null && value !== "";
    });

    this.profileComplete = isComplete;
    next();
});
```

## 🎯 Practice Exercises

### Exercise 1: Advanced User Validation

Create a comprehensive user validation system with:

1. Custom async validators for uniqueness
2. Password strength validation
3. Cross-field validation (password confirmation)
4. Conditional validation based on user type
5. Custom error messages

### Exercise 2: Order Processing Validation

Build an order validation system with:

1. Stock availability checking
2. Price validation against current prices
3. Shipping method validation
4. Payment method validation
5. Business rule validation

### Exercise 3: Content Management Validation

Create validation for a CMS with:

1. Content type-specific validation
2. File upload validation
3. Publishing workflow validation
4. SEO metadata validation
5. Content approval workflow

## 🔧 Best Practices

### Validation Design

1. **Validate at schema level** - Use Mongoose validators as first line of defense
2. **Keep validators focused** - One validator per concern
3. **Use meaningful error messages** - Help users understand what went wrong
4. **Validate early and often** - Don't wait until save to validate
5. **Handle async validators carefully** - Consider performance implications

### Performance

1. **Optimize async validators** - Cache results when possible
2. **Use indexes for uniqueness** - Don't rely only on validation
3. **Limit validation complexity** - Complex logic might belong in middleware
4. **Batch validation operations** - Avoid N+1 queries in validators
5. **Consider validation caching** - For expensive validations

### Error Handling

1. **Provide clear error messages** - Include field name and reason
2. **Use appropriate HTTP status codes** - 400 for validation, 422 for business rules
3. **Log validation failures** - For monitoring and debugging
4. **Handle partial failures gracefully** - In bulk operations
5. **Sanitize error messages** - Don't expose sensitive information

---

## 🔄 Next Steps

After mastering validation and middleware:

1. Practice building complex validation systems
2. Experiment with custom validators and middleware
3. Learn about performance optimization techniques
4. Move to **10-Performance-Optimization.md** for production optimization

---

_Continue to Phase 5: Performance Optimization_
