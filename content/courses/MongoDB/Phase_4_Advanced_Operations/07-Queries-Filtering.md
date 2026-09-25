# Phase 4: Advanced Queries and Filtering

## 📖 Table of Contents

1. [Query Optimization](#query-optimization)
2. [Advanced Query Operators](#advanced-query-operators)
3. [Aggregation Pipeline Basics](#aggregation-pipeline-basics)
4. [Text Search](#text-search)
5. [Geospatial Queries](#geospatial-queries)
6. [Query Performance](#query-performance)
7. [Indexing Strategies](#indexing-strategies)
8. [Complex Query Examples](#complex-query-examples)

## Query Optimization

### Understanding Query Execution

```javascript
// Use explain() to understand query performance
const User = require("./models/User");

// Basic explain
const explainResult = await User.find({ age: { $gte: 25 } }).explain();

// Detailed execution stats
const executionStats = await User.find({ age: { $gte: 25 } }).explain(
    "executionStats"
);

console.log(executionStats.executionStats);
// Output includes:
// - totalDocsExamined: documents scanned
// - totalDocsReturned: documents returned
// - executionTimeMillis: query execution time
// - indexesUsed: which indexes were used

// Query planner details
const queryPlanner = await User.find({ age: { $gte: 25 } }).explain(
    "queryPlanner"
);
```

### Query Building Patterns

```javascript
// Method chaining for readable queries
const getActiveAdultUsers = async (page = 1, limit = 10) => {
    return await User.find({
        isActive: true,
        age: { $gte: 18 },
    })
        .select("username email profile.firstName profile.lastName age")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(); // Returns plain JavaScript objects for better performance
};

// Query builder pattern
const buildUserQuery = (filters = {}) => {
    let query = User.find();

    // Dynamic filtering
    if (filters.age) {
        if (filters.age.min) query = query.where("age").gte(filters.age.min);
        if (filters.age.max) query = query.where("age").lte(filters.age.max);
    }

    if (filters.role) {
        query = query.where("role").in(filters.role);
    }

    if (filters.isActive !== undefined) {
        query = query.where("isActive").equals(filters.isActive);
    }

    if (filters.search) {
        query = query.where({
            $or: [
                { username: new RegExp(filters.search, "i") },
                { email: new RegExp(filters.search, "i") },
                { "profile.firstName": new RegExp(filters.search, "i") },
                { "profile.lastName": new RegExp(filters.search, "i") },
            ],
        });
    }

    return query;
};

// Usage
const users = await buildUserQuery({
    age: { min: 18, max: 65 },
    role: ["user", "moderator"],
    isActive: true,
    search: "john",
})
    .sort({ createdAt: -1 })
    .limit(20);
```

### Lean Queries and Projections

```javascript
// Lean queries - return plain JavaScript objects
const leanUsers = await User.find({ isActive: true })
    .lean()
    .select("username email createdAt");

// Projection with inclusion
const usersWithSpecificFields = await User.find({})
    .select("username email profile.firstName profile.lastName")
    .lean();

// Projection with exclusion
const usersWithoutSensitiveData = await User.find({})
    .select("-password -__v -resetToken")
    .lean();

// Complex projections
const userProfiles = await User.find({ isActive: true })
    .select({
        username: 1,
        email: 1,
        "profile.firstName": 1,
        "profile.lastName": 1,
        "profile.avatar": 1,
        createdAt: 1,
    })
    .lean();

// Conditional projections
const getUserProjection = (includePrivate = false) => {
    const baseProjection = "username email profile.firstName profile.lastName";
    return includePrivate
        ? `${baseProjection} profile.phone profile.address`
        : baseProjection;
};
```

## Advanced Query Operators

### Array Query Operators

```javascript
// Sample data structure
const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: String,
        tags: [String],
        scores: [Number],
        courses: [
            {
                name: String,
                grade: Number,
                completed: Boolean,
            },
        ],
        preferences: {
            languages: [String],
            topics: [String],
        },
    })
);

// $all - array contains all specified elements
const usersWithAllTags = await User.find({
    tags: { $all: ["javascript", "mongodb"] },
});

// $in - field value is in specified array
const usersWithSpecificTags = await User.find({
    tags: { $in: ["react", "vue", "angular"] },
});

// $nin - field value is not in specified array
const usersWithoutTags = await User.find({
    tags: { $nin: ["beginner", "outdated"] },
});

// $size - array has specific length
const usersWithExactlyThreeTags = await User.find({
    tags: { $size: 3 },
});

// $elemMatch - array element matches condition
const usersWithHighGrades = await User.find({
    courses: {
        $elemMatch: {
            grade: { $gte: 90 },
            completed: true,
        },
    },
});

// Array element queries with dot notation
const usersWithSpecificCourse = await User.find({
    "courses.name": "Advanced MongoDB",
    "courses.completed": true,
});

// Multiple array conditions
const advancedUsers = await User.find({
    $and: [
        { scores: { $elemMatch: { $gte: 80 } } },
        { "courses.grade": { $gte: 85 } },
        { tags: { $all: ["advanced", "expert"] } },
    ],
});
```

### Logical and Comparison Operators

```javascript
// Complex logical operations
const complexUserQuery = await User.find({
    $and: [
        {
            $or: [{ age: { $gte: 18, $lte: 25 } }, { role: "admin" }],
        },
        {
            $or: [
                { "profile.country": "USA" },
                { "profile.country": "Canada" },
            ],
        },
        {
            isActive: true,
        },
    ],
});

// $nor - not or (none of the conditions are true)
const excludedUsers = await User.find({
    $nor: [{ isActive: false }, { role: "banned" }, { age: { $lt: 13 } }],
});

// $exists - field exists or doesn't exist
const usersWithProfiles = await User.find({
    "profile.bio": { $exists: true, $ne: "" },
});

const usersWithoutPhone = await User.find({
    "profile.phone": { $exists: false },
});

// $type - field has specific type
const usersWithNumericAge = await User.find({
    age: { $type: "number" },
});

// $regex - regular expression matching
const usersWithGmailEmails = await User.find({
    email: { $regex: /@gmail\.com$/i },
});

// $where - JavaScript expression (use sparingly)
const usersWithCustomCondition = await User.find({
    $where: function () {
        return (
            this.scores.length > 0 &&
            this.scores.reduce((a, b) => a + b) / this.scores.length > 75
        );
    },
});
```

### Date and Range Queries

```javascript
// Date range queries
const now = new Date();
const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

// Users created in the last week
const recentUsers = await User.find({
    createdAt: { $gte: oneWeekAgo },
});

// Users created between specific dates
const usersInDateRange = await User.find({
    createdAt: {
        $gte: oneMonthAgo,
        $lte: oneWeekAgo,
    },
});

// Users created on a specific day
const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);
const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

const usersCreatedToday = await User.find({
    createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
    },
});

// Extract date parts in queries
const usersByYear = await User.aggregate([
    {
        $project: {
            username: 1,
            email: 1,
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            dayOfWeek: { $dayOfWeek: "$createdAt" },
        },
    },
    {
        $match: {
            year: 2024,
            month: { $in: [1, 2, 3] }, // Q1
        },
    },
]);
```

## Aggregation Pipeline Basics

### Introduction to Aggregation

Aggregation operations process data records and return computed results.

```javascript
// Basic aggregation pipeline
const userStats = await User.aggregate([
    // Stage 1: Match active users
    { $match: { isActive: true } },

    // Stage 2: Group by role and count
    {
        $group: {
            _id: "$role",
            count: { $sum: 1 },
            avgAge: { $avg: "$age" },
            minAge: { $min: "$age" },
            maxAge: { $max: "$age" },
        },
    },

    // Stage 3: Sort by count (descending)
    { $sort: { count: -1 } },

    // Stage 4: Limit results
    { $limit: 5 },
]);

// Result:
// [
//   { _id: 'user', count: 1500, avgAge: 28.5, minAge: 18, maxAge: 65 },
//   { _id: 'moderator', count: 50, avgAge: 32.1, minAge: 25, maxAge: 45 },
//   { _id: 'admin', count: 10, avgAge: 35.8, minAge: 30, maxAge: 50 }
// ]
```

### Common Aggregation Stages

```javascript
// $project - reshape documents
const userProfiles = await User.aggregate([
    {
        $project: {
            fullName: {
                $concat: ["$profile.firstName", " ", "$profile.lastName"],
            },
            email: 1,
            ageGroup: {
                $switch: {
                    branches: [
                        { case: { $lt: ["$age", 18] }, then: "minor" },
                        { case: { $lt: ["$age", 30] }, then: "young-adult" },
                        { case: { $lt: ["$age", 50] }, then: "adult" },
                        { case: { $gte: ["$age", 50] }, then: "senior" },
                    ],
                    default: "unknown",
                },
            },
            accountAge: {
                $divide: [
                    { $subtract: [new Date(), "$createdAt"] },
                    1000 * 60 * 60 * 24, // Convert to days
                ],
            },
        },
    },
]);

// $lookup - join with other collections
const Post = mongoose.model(
    "Post",
    new mongoose.Schema({
        title: String,
        content: String,
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        publishedAt: Date,
    })
);

const usersWithPostCounts = await User.aggregate([
    {
        $lookup: {
            from: "posts",
            localField: "_id",
            foreignField: "author",
            as: "posts",
        },
    },
    {
        $project: {
            username: 1,
            email: 1,
            postCount: { $size: "$posts" },
            lastPost: { $max: "$posts.publishedAt" },
        },
    },
    {
        $match: {
            postCount: { $gt: 0 },
        },
    },
]);

// $unwind - deconstruct arrays
const userTags = await User.aggregate([
    { $match: { tags: { $exists: true, $ne: [] } } },
    { $unwind: "$tags" },
    {
        $group: {
            _id: "$tags",
            count: { $sum: 1 },
            users: { $push: "$username" },
        },
    },
    { $sort: { count: -1 } },
]);

// $addFields - add computed fields
const enhancedUsers = await User.aggregate([
    {
        $addFields: {
            fullName: {
                $concat: ["$profile.firstName", " ", "$profile.lastName"],
            },
            isVip: {
                $and: [
                    { $gte: ["$age", 25] },
                    { $eq: ["$role", "premium"] },
                    { $gte: [{ $size: { $ifNull: ["$orders", []] } }, 5] },
                ],
            },
        },
    },
]);
```

### Advanced Aggregation Operations

```javascript
// Complex aggregation with multiple stages
const userAnalytics = await User.aggregate([
    // Stage 1: Match active users from last year
    {
        $match: {
            isActive: true,
            createdAt: { $gte: new Date(new Date().getFullYear() - 1, 0, 1) },
        },
    },

    // Stage 2: Add computed fields
    {
        $addFields: {
            ageGroup: {
                $switch: {
                    branches: [
                        { case: { $lt: ["$age", 25] }, then: "18-24" },
                        { case: { $lt: ["$age", 35] }, then: "25-34" },
                        { case: { $lt: ["$age", 45] }, then: "35-44" },
                        { case: { $gte: ["$age", 45] }, then: "45+" },
                    ],
                    default: "unknown",
                },
            },
            monthJoined: { $month: "$createdAt" },
            yearJoined: { $year: "$createdAt" },
        },
    },

    // Stage 3: Group by age group and month
    {
        $group: {
            _id: {
                ageGroup: "$ageGroup",
                month: "$monthJoined",
                year: "$yearJoined",
            },
            count: { $sum: 1 },
            avgAge: { $avg: "$age" },
            roles: { $addToSet: "$role" },
        },
    },

    // Stage 4: Sort by year, month, and age group
    {
        $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.ageGroup": 1,
        },
    },

    // Stage 5: Reshape final output
    {
        $project: {
            _id: 0,
            period: {
                $concat: [
                    { $toString: "$_id.year" },
                    "-",
                    { $toString: "$_id.month" },
                ],
            },
            ageGroup: "$_id.ageGroup",
            userCount: "$count",
            averageAge: { $round: ["$avgAge", 1] },
            roles: 1,
        },
    },
]);

// Aggregation with conditional logic
const userSegmentation = await User.aggregate([
    {
        $addFields: {
            segment: {
                $cond: {
                    if: { $gte: ["$loginCount", 50] },
                    then: "power-user",
                    else: {
                        $cond: {
                            if: { $gte: ["$loginCount", 10] },
                            then: "regular-user",
                            else: "casual-user",
                        },
                    },
                },
            },
        },
    },
    {
        $group: {
            _id: "$segment",
            count: { $sum: 1 },
            avgLoginCount: { $avg: "$loginCount" },
            totalRevenue: { $sum: { $ifNull: ["$totalSpent", 0] } },
        },
    },
]);
```

### Aggregation with Facets

```javascript
// Multi-faceted aggregation
const dashboardData = await User.aggregate([
    {
        $facet: {
            // Facet 1: User statistics by role
            roleStats: [
                {
                    $group: {
                        _id: "$role",
                        count: { $sum: 1 },
                        avgAge: { $avg: "$age" },
                    },
                },
            ],

            // Facet 2: Registration trends
            registrationTrends: [
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ],

            // Facet 3: Age distribution
            ageDistribution: [
                {
                    $bucket: {
                        groupBy: "$age",
                        boundaries: [0, 18, 25, 35, 45, 65, 100],
                        default: "other",
                        output: {
                            count: { $sum: 1 },
                            averageAge: { $avg: "$age" },
                        },
                    },
                },
            ],

            // Facet 4: Activity metrics
            activityMetrics: [
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        activeUsers: {
                            $sum: {
                                $cond: [{ $eq: ["$isActive", true] }, 1, 0],
                            },
                        },
                        avgLoginCount: { $avg: "$loginCount" },
                    },
                },
            ],
        },
    },
]);
```

## Text Search

### Setting Up Text Search

```javascript
// Create text index
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    tags: [String],
    author: String,
    publishedAt: Date,
});

// Create text index on multiple fields
postSchema.index(
    {
        title: "text",
        content: "text",
        tags: "text",
    },
    {
        weights: {
            title: 10, // Title is most important
            tags: 5, // Tags are moderately important
            content: 1, // Content has default weight
        },
        name: "post_text_index",
    }
);

const Post = mongoose.model("Post", postSchema);

// Alternative: Create index programmatically
await Post.createIndexes([
    {
        title: "text",
        content: "text",
        author: "text",
    },
]);
```

### Basic Text Search

```javascript
// Simple text search
const searchResults = await Post.find({
    $text: { $search: "mongodb tutorial" },
});

// Text search with score
const searchWithScore = await Post.find(
    { $text: { $search: "mongodb tutorial" } },
    { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } });

// Phrase search (exact phrase)
const phraseSearch = await Post.find({
    $text: { $search: '"advanced mongodb"' },
});

// Exclude terms (use minus sign)
const excludeSearch = await Post.find({
    $text: { $search: "mongodb -beginner" },
});

// Case insensitive search with language
const languageSearch = await Post.find({
    $text: {
        $search: "database optimization",
        $language: "english",
        $caseSensitive: false,
        $diacriticSensitive: false,
    },
});
```

### Advanced Text Search

```javascript
// Text search with additional filters
const advancedSearch = async (searchTerm, filters = {}) => {
    let query = {
        $text: { $search: searchTerm },
    };

    // Add additional filters
    if (filters.author) {
        query.author = filters.author;
    }

    if (filters.publishedAfter) {
        query.publishedAt = { $gte: filters.publishedAfter };
    }

    if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
    }

    return await Post.find(query, {
        score: { $meta: "textScore" },
    })
        .sort({ score: { $meta: "textScore" } })
        .limit(filters.limit || 20);
};

// Usage
const results = await advancedSearch("database performance", {
    author: "john_doe",
    publishedAfter: new Date("2024-01-01"),
    tags: ["tutorial", "advanced"],
    limit: 10,
});

// Text search aggregation
const textSearchAggregation = await Post.aggregate([
    {
        $match: {
            $text: { $search: "mongodb performance" },
        },
    },
    {
        $addFields: {
            score: { $meta: "textScore" },
        },
    },
    {
        $match: {
            score: { $gte: 1.0 }, // Minimum relevance score
        },
    },
    {
        $group: {
            _id: "$author",
            posts: { $push: "$$ROOT" },
            avgScore: { $avg: "$score" },
            totalPosts: { $sum: 1 },
        },
    },
    {
        $sort: { avgScore: -1 },
    },
]);
```

### Search with Auto-complete

```javascript
// Auto-complete using regex (for smaller datasets)
const autoComplete = async (searchTerm, limit = 10) => {
    const regex = new RegExp(`^${searchTerm}`, "i");

    return await Post.find({
        $or: [{ title: regex }, { tags: regex }],
    })
        .select("title tags")
        .limit(limit)
        .lean();
};

// Auto-complete using aggregation (for larger datasets)
const advancedAutoComplete = async (searchTerm, limit = 10) => {
    return await Post.aggregate([
        {
            $match: {
                $or: [
                    { title: new RegExp(searchTerm, "i") },
                    { tags: new RegExp(searchTerm, "i") },
                ],
            },
        },
        {
            $project: {
                title: 1,
                tags: 1,
                relevance: {
                    $add: [
                        {
                            $cond: [
                                {
                                    $regexMatch: {
                                        input: "$title",
                                        regex: searchTerm,
                                        options: "i",
                                    },
                                },
                                10,
                                0,
                            ],
                        },
                        {
                            $size: {
                                $filter: {
                                    input: "$tags",
                                    cond: {
                                        $regexMatch: {
                                            input: "$$this",
                                            regex: searchTerm,
                                            options: "i",
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        },
        { $sort: { relevance: -1 } },
        { $limit: limit },
    ]);
};
```

## Geospatial Queries

### Setting Up Geospatial Data

```javascript
// Location schema with GeoJSON
const locationSchema = new mongoose.Schema({
    name: String,
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
    },
    category: String,
    rating: Number,
});

// Create 2dsphere index for geospatial queries
locationSchema.index({ location: "2dsphere" });

const Location = mongoose.model("Location", locationSchema);

// Sample data insertion
await Location.create([
    {
        name: "Central Park",
        location: {
            type: "Point",
            coordinates: [-73.965355, 40.782865], // [lng, lat]
        },
        address: {
            city: "New York",
            state: "NY",
            country: "USA",
        },
        category: "park",
    },
    {
        name: "Times Square",
        location: {
            type: "Point",
            coordinates: [-73.98513, 40.758896],
        },
        address: {
            city: "New York",
            state: "NY",
            country: "USA",
        },
        category: "landmark",
    },
]);
```

### Proximity Queries

```javascript
// Find locations near a point
const findNearbyLocations = async (longitude, latitude, maxDistance = 1000) => {
    return await Location.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                $maxDistance: maxDistance, // meters
            },
        },
    });
};

// Find locations within a circle
const findLocationsInCircle = async (centerLng, centerLat, radiusInMeters) => {
    return await Location.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [centerLng, centerLat],
                    radiusInMeters / 6378100, // Earth's radius in meters
                ],
            },
        },
    });
};

// Find locations within a polygon
const findLocationsInPolygon = async (polygonCoordinates) => {
    return await Location.find({
        location: {
            $geoWithin: {
                $geometry: {
                    type: "Polygon",
                    coordinates: [polygonCoordinates], // Array of [lng, lat] pairs
                },
            },
        },
    });
};

// Usage examples
const nearbyRestaurants = await findNearbyLocations(-73.98513, 40.758896, 500);

const manhattanBounds = [
    [-74.047185, 40.679648], // Southwest
    [-73.906004, 40.679648], // Southeast
    [-73.906004, 40.882214], // Northeast
    [-74.047185, 40.882214], // Northwest
    [-74.047185, 40.679648], // Close the polygon
];

const locationsInManhattan = await findLocationsInPolygon(manhattanBounds);
```

### Advanced Geospatial Aggregation

```javascript
// Aggregation with geospatial operations
const nearbyLocationStats = await Location.aggregate([
    {
        $geoNear: {
            near: {
                type: "Point",
                coordinates: [-73.98513, 40.758896], // Times Square
            },
            distanceField: "distance",
            maxDistance: 2000, // 2km radius
            spherical: true,
            distanceMultiplier: 0.001, // Convert to kilometers
        },
    },
    {
        $group: {
            _id: "$category",
            count: { $sum: 1 },
            avgDistance: { $avg: "$distance" },
            avgRating: { $avg: "$rating" },
            locations: {
                $push: {
                    name: "$name",
                    distance: "$distance",
                    rating: "$rating",
                },
            },
        },
    },
    {
        $sort: { count: -1 },
    },
]);

// Find closest locations by category
const findClosestByCategory = async (lng, lat, categories = []) => {
    const pipeline = [
        {
            $geoNear: {
                near: { type: "Point", coordinates: [lng, lat] },
                distanceField: "distance",
                spherical: true,
                distanceMultiplier: 0.001,
            },
        },
    ];

    if (categories.length > 0) {
        pipeline.push({
            $match: { category: { $in: categories } },
        });
    }

    pipeline.push(
        {
            $group: {
                _id: "$category",
                closest: { $first: "$$ROOT" },
            },
        },
        {
            $replaceRoot: { newRoot: "$closest" },
        },
        {
            $sort: { distance: 1 },
        }
    );

    return await Location.aggregate(pipeline);
};
```

## Query Performance

### Performance Monitoring

```javascript
// Query performance monitoring
class QueryMonitor {
    static async executeWithTiming(queryPromise, queryName) {
        const startTime = Date.now();

        try {
            const result = await queryPromise;
            const endTime = Date.now();
            const duration = endTime - startTime;

            console.log(`Query "${queryName}" completed in ${duration}ms`);

            if (duration > 1000) {
                console.warn(
                    `Slow query detected: ${queryName} took ${duration}ms`
                );
            }

            return result;
        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            console.error(
                `Query "${queryName}" failed after ${duration}ms:`,
                error.message
            );
            throw error;
        }
    }

    static async analyzeQuery(model, query, options = {}) {
        const explanation = await model.find(query).explain("executionStats");
        const stats = explanation.executionStats;

        const analysis = {
            totalDocsExamined: stats.totalDocsExamined,
            totalDocsReturned: stats.totalDocsReturned,
            executionTimeMillis: stats.executionTimeMillis,
            indexesUsed: stats.indexesUsed || [],
            efficiency: stats.totalDocsReturned / stats.totalDocsExamined,
            needsIndex: stats.totalDocsExamined > stats.totalDocsReturned * 10,
        };

        console.log("Query Analysis:", analysis);
        return analysis;
    }
}

// Usage
const users = await QueryMonitor.executeWithTiming(
    User.find({ age: { $gte: 25 } }).limit(50),
    "Find adult users"
);

await QueryMonitor.analyzeQuery(User, { age: { $gte: 25 } });
```

### Query Optimization Techniques

```javascript
// Optimization technique 1: Use indexes effectively
const optimizedUserQuery = async (filters) => {
    // Ensure compound index exists: { isActive: 1, role: 1, age: 1, createdAt: -1 }
    return await User.find({
        isActive: true, // Most selective first
        role: filters.role, // Exact match
        age: { $gte: filters.minAge }, // Range query last
    })
        .sort({ createdAt: -1 }) // Sort by indexed field
        .limit(filters.limit || 20)
        .lean(); // Return plain objects
};

// Optimization technique 2: Use aggregation for complex queries
const getUsersWithPostStats = async () => {
    return await User.aggregate([
        { $match: { isActive: true } }, // Filter early
        {
            $lookup: {
                from: "posts",
                let: { userId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$author", "$$userId"] } } },
                    { $count: "count" },
                ],
                as: "postStats",
            },
        },
        {
            $addFields: {
                postCount: {
                    $ifNull: [{ $arrayElemAt: ["$postStats.count", 0] }, 0],
                },
            },
        },
        { $project: { postStats: 0 } }, // Remove temporary field
    ]);
};

// Optimization technique 3: Batch operations
const batchUpdateUsers = async (updates) => {
    const bulkOps = updates.map((update) => ({
        updateOne: {
            filter: { _id: update.id },
            update: { $set: update.data },
        },
    }));

    return await User.bulkWrite(bulkOps, { ordered: false });
};

// Optimization technique 4: Efficient pagination
const efficientPagination = async (lastId = null, limit = 20) => {
    const query = lastId ? { _id: { $gt: lastId } } : {};

    return await User.find(query).sort({ _id: 1 }).limit(limit).lean();
};
```

## Indexing Strategies

### Index Types and Usage

```javascript
// Single field indexes
await User.createIndex({ email: 1 }); // Ascending
await User.createIndex({ createdAt: -1 }); // Descending

// Compound indexes (order matters!)
await User.createIndex({
    isActive: 1, // Most selective first
    role: 1, // Then exact matches
    age: 1, // Then ranges
    createdAt: -1, // Finally sorts
});

// Text indexes
await Post.createIndex(
    {
        title: "text",
        content: "text",
    },
    {
        weights: { title: 10, content: 1 },
    }
);

// Geospatial indexes
await Location.createIndex({ location: "2dsphere" });

// Partial indexes (index subset of documents)
await User.createIndex(
    { email: 1 },
    {
        partialFilterExpression: {
            isActive: true,
            email: { $exists: true },
        },
    }
);

// Sparse indexes (exclude null/missing values)
await User.createIndex({ "profile.phone": 1 }, { sparse: true });

// TTL indexes (automatic document expiration)
await Session.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 3600 } // 1 hour
);

// Unique indexes
await User.createIndex({ username: 1 }, { unique: true });
```

### Index Management

```javascript
// List all indexes
const indexes = await User.collection.getIndexes();
console.log(indexes);

// Drop specific index
await User.collection.dropIndex("email_1");

// Drop all indexes except _id
await User.collection.dropIndexes();

// Index usage statistics
const indexStats = await User.collection
    .aggregate([{ $indexStats: {} }])
    .toArray();

// Check if indexes are being used
const explainOutput = await User.find({
    email: "john@example.com",
}).explain("executionStats");

console.log("Winning plan:", explainOutput.queryPlanner.winningPlan);
console.log("Index used:", explainOutput.executionStats.indexesUsed);
```

## Complex Query Examples

### E-commerce Product Search

```javascript
const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  brand: String,
  tags: [String],
  rating: { average: Number, count: Number },
  inStock: Boolean,
  variants: [{
    color: String,
    size: String,
    price: Number,
    stock: Number
  }],
  createdAt: Date
});

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, price: 1, rating.average: -1 });

const Product = mongoose.model('Product', ProductSchema);

const advancedProductSearch = async (searchParams) => {
  const {
    query,
    category,
    minPrice,
    maxPrice,
    brands,
    minRating,
    inStock,
    sortBy = 'relevance',
    page = 1,
    limit = 20
  } = searchParams;

  let pipeline = [];

  // Text search stage
  if (query) {
    pipeline.push({
      $match: {
        $text: { $search: query }
      }
    });

    pipeline.push({
      $addFields: {
        textScore: { $meta: 'textScore' }
      }
    });
  }

  // Filter stage
  const matchConditions = {};

  if (category) matchConditions.category = category;
  if (minPrice || maxPrice) {
    matchConditions.price = {};
    if (minPrice) matchConditions.price.$gte = minPrice;
    if (maxPrice) matchConditions.price.$lte = maxPrice;
  }
  if (brands && brands.length > 0) matchConditions.brand = { $in: brands };
  if (minRating) matchConditions['rating.average'] = { $gte: minRating };
  if (inStock !== undefined) matchConditions.inStock = inStock;

  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }

  // Sorting
  let sortStage = {};
  switch (sortBy) {
    case 'price_low':
      sortStage = { price: 1 };
      break;
    case 'price_high':
      sortStage = { price: -1 };
      break;
    case 'rating':
      sortStage = { 'rating.average': -1, 'rating.count': -1 };
      break;
    case 'newest':
      sortStage = { createdAt: -1 };
      break;
    default: // relevance
      sortStage = query ? { textScore: -1, 'rating.average': -1 } : { 'rating.average': -1 };
  }

  pipeline.push({ $sort: sortStage });

  // Pagination
  pipeline.push({ $skip: (page - 1) * limit });
  pipeline.push({ $limit: limit });

  // Execute search
  const results = await Product.aggregate(pipeline);

  // Get total count for pagination
  const totalCountPipeline = pipeline.slice(0, -2); // Remove skip and limit
  totalCountPipeline.push({ $count: 'total' });
  const totalCountResult = await Product.aggregate(totalCountPipeline);
  const totalCount = totalCountResult[0]?.total || 0;

  return {
    products: results,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalProducts: totalCount,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1
    }
  };
};

// Usage
const searchResults = await advancedProductSearch({
  query: 'wireless headphones',
  category: 'electronics',
  minPrice: 50,
  maxPrice: 200,
  brands: ['Sony', 'Bose', 'Apple'],
  minRating: 4.0,
  inStock: true,
  sortBy: 'rating',
  page: 1,
  limit: 12
});
```

### Analytics Dashboard Queries

```javascript
const getDashboardAnalytics = async (dateRange) => {
    const { startDate, endDate } = dateRange;

    // Run multiple aggregations in parallel
    const [userStats, orderStats, productStats, revenueByCategory] =
        await Promise.all([
            // User statistics
            User.aggregate([
                {
                    $facet: {
                        totalUsers: [{ $count: "count" }],
                        activeUsers: [
                            { $match: { isActive: true } },
                            { $count: "count" },
                        ],
                        newUsers: [
                            {
                                $match: {
                                    createdAt: {
                                        $gte: startDate,
                                        $lte: endDate,
                                    },
                                },
                            },
                            { $count: "count" },
                        ],
                        usersByRole: [
                            { $group: { _id: "$role", count: { $sum: 1 } } },
                        ],
                    },
                },
            ]),

            // Order statistics
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $facet: {
                        totalOrders: [{ $count: "count" }],
                        ordersByStatus: [
                            { $group: { _id: "$status", count: { $sum: 1 } } },
                        ],
                        dailyOrders: [
                            {
                                $group: {
                                    _id: {
                                        $dateToString: {
                                            format: "%Y-%m-%d",
                                            date: "$createdAt",
                                        },
                                    },
                                    count: { $sum: 1 },
                                    revenue: { $sum: "$total" },
                                },
                            },
                            { $sort: { _id: 1 } },
                        ],
                    },
                },
            ]),

            // Product performance
            Product.aggregate([
                {
                    $lookup: {
                        from: "orders",
                        let: { productId: "$_id" },
                        pipeline: [
                            { $unwind: "$items" },
                            {
                                $match: {
                                    $expr: {
                                        $eq: [
                                            "$items.productId",
                                            "$$productId",
                                        ],
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: "$$productId",
                                    totalSold: { $sum: "$items.quantity" },
                                    revenue: {
                                        $sum: {
                                            $multiply: [
                                                "$items.quantity",
                                                "$items.price",
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                        as: "sales",
                    },
                },
                {
                    $addFields: {
                        totalSold: {
                            $ifNull: [
                                { $arrayElemAt: ["$sales.totalSold", 0] },
                                0,
                            ],
                        },
                        revenue: {
                            $ifNull: [
                                { $arrayElemAt: ["$sales.revenue", 0] },
                                0,
                            ],
                        },
                    },
                },
                {
                    $sort: { totalSold: -1 },
                },
                {
                    $limit: 10,
                },
            ]),

            // Revenue by category
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                        status: "completed",
                    },
                },
                { $unwind: "$items" },
                {
                    $lookup: {
                        from: "products",
                        localField: "items.productId",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                { $unwind: "$product" },
                {
                    $group: {
                        _id: "$product.category",
                        revenue: {
                            $sum: {
                                $multiply: ["$items.quantity", "$items.price"],
                            },
                        },
                        itemsSold: { $sum: "$items.quantity" },
                    },
                },
                { $sort: { revenue: -1 } },
            ]),
        ]);

    return {
        users: userStats[0],
        orders: orderStats[0],
        topProducts: productStats,
        revenueByCategory,
    };
};
```

## 🎯 Practice Exercises

### Exercise 1: Advanced User Search

Build a user search system with:

1. Text search across multiple fields
2. Filters for age range, role, location
3. Sorting options (relevance, date, name)
4. Efficient pagination
5. Performance monitoring

### Exercise 2: Analytics Queries

Create analytics queries for:

1. User engagement metrics
2. Sales performance by time period
3. Product popularity trends
4. Geographic distribution analysis

### Exercise 3: Geospatial Application

Build a location-based service with:

1. Find nearby locations
2. Location clustering
3. Route optimization
4. Boundary-based searches

## 🔧 Performance Best Practices

### Query Optimization

1. **Use indexes effectively** - Create indexes for frequently queried fields
2. **Filter early** - Apply selective filters first in aggregation pipelines
3. **Limit results** - Always use limit() for large datasets
4. **Use lean()** - Return plain objects when you don't need Mongoose features
5. **Monitor performance** - Use explain() to analyze query execution

### Aggregation Optimization

1. **Match early** - Use $match as early as possible
2. **Project late** - Use $project at the end to reshape data
3. **Limit pipeline stages** - Keep pipelines as short as possible
4. **Use $facet wisely** - For multiple analytics in single query
5. **Index pipeline fields** - Ensure pipeline fields are indexed

---

## 🔄 Next Steps

After mastering advanced queries:

1. Practice building complex search systems
2. Experiment with aggregation pipelines
3. Learn about query optimization techniques
4. Move to **08-Relationships.md** to explore document relationships

---

_Continue to Phase 4: Document Relationships_
