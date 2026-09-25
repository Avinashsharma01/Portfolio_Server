# Phase 4: Document Relationships

## 📖 Table of Contents

1. [Understanding Relationships in MongoDB](#understanding-relationships-in-mongodb)
2. [Embedded Documents vs References](#embedded-documents-vs-references)
3. [One-to-One Relationships](#one-to-one-relationships)
4. [One-to-Many Relationships](#one-to-many-relationships)
5. [Many-to-Many Relationships](#many-to-many-relationships)
6. [Population in Mongoose](#population-in-mongoose)
7. [Advanced Relationship Patterns](#advanced-relationship-patterns)
8. [Relationship Performance Optimization](#relationship-performance-optimization)

## Understanding Relationships in MongoDB

Unlike SQL databases, MongoDB doesn't have built-in foreign keys or joins. Instead, you model relationships using two main approaches:

### 1. Embedded Documents (Denormalization)

Store related data within the same document.

### 2. References (Normalization)

Store references to documents in other collections.

### Decision Framework

```javascript
// Use EMBEDDED documents when:
// - Data is frequently accessed together
// - Related data doesn't change often
// - Related data is not large
// - 1:1 or 1:few relationships

// Use REFERENCES when:
// - Related data is large
// - Related data changes frequently
// - Many-to-many relationships
// - Data is accessed independently
// - Need to avoid document size limits (16MB)
```

## Embedded Documents vs References

### Embedded Documents Pattern

```javascript
// User with embedded profile and addresses
const userSchema = new mongoose.Schema({
    username: String,
    email: String,

    // Embedded single document
    profile: {
        firstName: String,
        lastName: String,
        bio: String,
        avatar: String,
        birthDate: Date,
        preferences: {
            theme: String,
            language: String,
            notifications: {
                email: Boolean,
                sms: Boolean,
                push: Boolean,
            },
        },
    },

    // Embedded array of documents
    addresses: [
        {
            type: { type: String, enum: ["home", "work", "other"] },
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: { type: String, default: "USA" },
            isPrimary: { type: Boolean, default: false },
        },
    ],

    // Embedded array for simple data
    hobbies: [String],
    skills: [
        {
            name: String,
            level: {
                type: String,
                enum: ["beginner", "intermediate", "advanced", "expert"],
            },
            yearsOfExperience: Number,
        },
    ],
});

// Benefits: Single query to get all user data
const user = await User.findById(userId);
console.log(user.profile.firstName);
console.log(user.addresses[0].city);
console.log(user.skills);

// Working with embedded documents
user.profile.firstName = "John";
user.addresses[0].isPrimary = true;
user.skills.push({ name: "MongoDB", level: "advanced", yearsOfExperience: 3 });
await user.save();
```

### References Pattern

```javascript
// Separate schemas with references
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
});

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String,
    birthDate: Date,
});

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: { type: String, enum: ["home", "work", "other"] },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    isPrimary: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);
const Profile = mongoose.model("Profile", profileSchema);
const Address = mongoose.model("Address", addressSchema);

// Benefits: Normalized data, flexible queries
const user = await User.findById(userId).populate("profileId");
const addresses = await Address.find({ userId: userId });
```

### Hybrid Approach

```javascript
// Combine both patterns for optimal performance
const blogPostSchema = new mongoose.Schema({
    title: String,
    content: String,

    // Reference to author
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Embedded author summary for performance
    authorSummary: {
        username: String,
        avatar: String,
        displayName: String,
    },

    // Embedded comments for frequently accessed data
    comments: [
        {
            author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            authorName: String, // Denormalized for performance
            content: String,
            createdAt: { type: Date, default: Date.now },

            // Nested replies (limited depth)
            replies: [
                {
                    author: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    authorName: String,
                    content: String,
                    createdAt: { type: Date, default: Date.now },
                },
            ],
        },
    ],

    // References for data that changes frequently
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],

    // Embedded metadata
    meta: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
    },

    publishedAt: Date,
    updatedAt: Date,
});
```

## One-to-One Relationships

### Embedded One-to-One

```javascript
// User profile embedded in user document
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },

    // Embedded profile (1:1)
    profile: {
        firstName: String,
        lastName: String,
        bio: String,
        avatar: String,
        birthDate: Date,
        phone: String,
        website: String,
        socialMedia: {
            twitter: String,
            linkedin: String,
            github: String,
        },
    },

    // Embedded settings (1:1)
    settings: {
        theme: { type: String, enum: ["light", "dark"], default: "light" },
        language: { type: String, default: "en" },
        timezone: String,
        privacy: {
            profileVisible: { type: Boolean, default: true },
            emailVisible: { type: Boolean, default: false },
            phoneVisible: { type: Boolean, default: false },
        },
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            push: { type: Boolean, default: true },
            marketing: { type: Boolean, default: false },
        },
    },
});

// Usage
const user = new User({
    username: "john_doe",
    email: "john@example.com",
    profile: {
        firstName: "John",
        lastName: "Doe",
        bio: "Software developer passionate about technology",
    },
    settings: {
        theme: "dark",
        privacy: {
            profileVisible: true,
            emailVisible: false,
        },
    },
});

await user.save();

// Updating embedded documents
user.profile.bio = "Updated bio";
user.settings.theme = "light";
await user.save();
```

### Referenced One-to-One

```javascript
// When profile data is large or accessed separately
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" },
});

const userProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    firstName: String,
    lastName: String,
    bio: { type: String, maxLength: 2000 },
    avatar: String,
    resume: String, // Large document
    portfolio: [String], // Array of URLs
    experience: [
        {
            company: String,
            position: String,
            startDate: Date,
            endDate: Date,
            description: String,
        },
    ],
    education: [
        {
            institution: String,
            degree: String,
            field: String,
            graduationYear: Number,
        },
    ],
});

const User = mongoose.model("User", userSchema);
const UserProfile = mongoose.model("UserProfile", userProfileSchema);

// Creating related documents
const createUserWithProfile = async (userData, profileData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = new User(userData);
        await user.save({ session });

        const profile = new UserProfile({
            userId: user._id,
            ...profileData,
        });
        await profile.save({ session });

        user.profileId = profile._id;
        await user.save({ session });

        await session.commitTransaction();
        return user;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// Querying with population
const getUserWithProfile = async (userId) => {
    return await User.findById(userId).populate("profileId");
};
```

## One-to-Many Relationships

### Parent References (Child documents store parent ID)

```javascript
// Blog posts belonging to a user
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    bio: String,
});

const postSchema = new mongoose.Schema({
    title: String,
    content: String,

    // Reference to parent (user)
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    publishedAt: { type: Date, default: Date.now },
    tags: [String],
    status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "draft",
    },
});

// Add index for efficient queries
postSchema.index({ author: 1, publishedAt: -1 });

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

// Creating posts
const createPost = async (authorId, postData) => {
    const post = new Post({
        ...postData,
        author: authorId,
    });
    return await post.save();
};

// Finding posts by author
const getPostsByAuthor = async (authorId, limit = 10) => {
    return await Post.find({ author: authorId })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .populate("author", "username email");
};

// Finding author with their posts
const getAuthorWithPosts = async (authorId) => {
    const [author, posts] = await Promise.all([
        User.findById(authorId),
        Post.find({ author: authorId }).sort({ publishedAt: -1 }),
    ]);

    return { ...author.toObject(), posts };
};
```

### Child References (Parent stores array of child IDs)

```javascript
// When you need to limit the number of children
const userSchema = new mongoose.Schema({
    username: String,
    email: String,

    // Array of references to posts
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    // Array of references to favorite posts
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    publishedAt: Date,
});

// Limit array size to prevent unbounded growth
userSchema.path("posts").validate(function (posts) {
    return posts.length <= 100; // Max 100 posts per user
}, "User cannot have more than 100 posts");

// Adding a post
const addPostToUser = async (userId, postData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Create the post
        const post = new Post({
            ...postData,
            author: userId,
        });
        await post.save({ session });

        // Add post ID to user's posts array
        await User.findByIdAndUpdate(
            userId,
            { $push: { posts: post._id } },
            { session }
        );

        await session.commitTransaction();
        return post;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// Getting user with posts
const getUserWithPosts = async (userId) => {
    return await User.findById(userId).populate({
        path: "posts",
        options: { sort: { publishedAt: -1 } },
    });
};
```

### Embedded One-to-Many

```javascript
// When children are small and always accessed with parent
const blogPostSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Embedded comments
    comments: [
        {
            author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            authorName: String, // Denormalized for performance
            content: { type: String, required: true, maxLength: 1000 },
            createdAt: { type: Date, default: Date.now },

            // Nested replies (limited to 1 level)
            replies: [
                {
                    author: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    authorName: String,
                    content: { type: String, required: true, maxLength: 500 },
                    createdAt: { type: Date, default: Date.now },
                },
            ],
        },
    ],

    // Embedded tags
    tags: [
        {
            name: { type: String, required: true },
            color: { type: String, default: "#007bff" },
        },
    ],

    publishedAt: Date,
});

// Limit embedded array size
blogPostSchema.path("comments").validate(function (comments) {
    return comments.length <= 100;
}, "Post cannot have more than 100 comments");

// Working with embedded documents
const addComment = async (postId, commentData) => {
    const post = await BlogPost.findById(postId);
    post.comments.push(commentData);
    return await post.save();
};

const addReply = async (postId, commentId, replyData) => {
    const post = await BlogPost.findById(postId);
    const comment = post.comments.id(commentId);
    comment.replies.push(replyData);
    return await post.save();
};

// Querying embedded documents
const getPostsWithRecentComments = async () => {
    return await BlogPost.find({
        "comments.createdAt": {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
    }).populate("comments.author", "username avatar");
};
```

## Many-to-Many Relationships

### References with Arrays

```javascript
// Students and Courses relationship
const studentSchema = new mongoose.Schema({
    name: String,
    email: String,

    // Array of course references
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
});

const courseSchema = new mongoose.Schema({
    title: String,
    description: String,
    instructor: String,

    // Array of student references
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
        },
    ],
});

const Student = mongoose.model("Student", studentSchema);
const Course = mongoose.model("Course", courseSchema);

// Enrolling a student in a course
const enrollStudent = async (studentId, courseId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Add course to student's enrolled courses
        await Student.findByIdAndUpdate(
            studentId,
            { $addToSet: { enrolledCourses: courseId } },
            { session }
        );

        // Add student to course's enrolled students
        await Course.findByIdAndUpdate(
            courseId,
            { $addToSet: { enrolledStudents: studentId } },
            { session }
        );

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// Unenrolling a student
const unenrollStudent = async (studentId, courseId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await Student.findByIdAndUpdate(
            studentId,
            { $pull: { enrolledCourses: courseId } },
            { session }
        );

        await Course.findByIdAndUpdate(
            courseId,
            { $pull: { enrolledStudents: studentId } },
            { session }
        );

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
```

### Junction Collection Pattern

```javascript
// For complex many-to-many with additional metadata
const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    major: String,
});

const courseSchema = new mongoose.Schema({
    title: String,
    description: String,
    credits: Number,
    instructor: String,
});

// Junction collection for enrollment with metadata
const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },

    // Additional metadata
    enrolledAt: { type: Date, default: Date.now },
    grade: { type: String, enum: ["A", "B", "C", "D", "F"] },
    status: {
        type: String,
        enum: ["enrolled", "completed", "dropped"],
        default: "enrolled",
    },
    finalScore: Number,
    attendance: { type: Number, min: 0, max: 100 },
});

// Compound index to ensure unique enrollment
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);
const Course = mongoose.model("Course", courseSchema);
const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

// Enrolling with metadata
const enrollStudentWithDetails = async (studentId, courseId, metadata = {}) => {
    const enrollment = new Enrollment({
        student: studentId,
        course: courseId,
        ...metadata,
    });

    return await enrollment.save();
};

// Getting student's courses with enrollment details
const getStudentCoursesWithDetails = async (studentId) => {
    return await Enrollment.find({ student: studentId })
        .populate("course")
        .populate("student", "name email");
};

// Getting course enrollment statistics
const getCourseStats = async (courseId) => {
    const stats = await Enrollment.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(courseId) } },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                avgScore: { $avg: "$finalScore" },
                avgAttendance: { $avg: "$attendance" },
            },
        },
    ]);

    return stats;
};
```

### Many-to-Many with Categories/Tags

```javascript
// Posts and Tags relationship
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // References to tags
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],

    publishedAt: Date,
});

const tagSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    color: { type: String, default: "#007bff" },

    // Optional: Keep count for performance
    postCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
});

// Index for efficient tag queries
tagSchema.index({ name: "text" });
postSchema.index({ tags: 1, publishedAt: -1 });

const Post = mongoose.model("Post", postSchema);
const Tag = mongoose.model("Tag", tagSchema);

// Add tags to post
const addTagsToPost = async (postId, tagNames) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find or create tags
        const tagPromises = tagNames.map(async (tagName) => {
            const slug = tagName.toLowerCase().replace(/\s+/g, "-");

            let tag = await Tag.findOne({ slug });
            if (!tag) {
                tag = new Tag({ name: tagName, slug });
                await tag.save({ session });
            }
            return tag._id;
        });

        const tagIds = await Promise.all(tagPromises);

        // Update post with tags
        await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { tags: { $each: tagIds } } },
            { session }
        );

        // Update tag post counts
        await Tag.updateMany(
            { _id: { $in: tagIds } },
            { $inc: { postCount: 1 } },
            { session }
        );

        await session.commitTransaction();
        return tagIds;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// Get posts by tag
const getPostsByTag = async (tagSlug, page = 1, limit = 10) => {
    const tag = await Tag.findOne({ slug: tagSlug });
    if (!tag) return { posts: [], tag: null };

    const posts = await Post.find({ tags: tag._id })
        .populate("author", "username avatar")
        .populate("tags", "name slug color")
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { posts, tag };
};

// Get popular tags
const getPopularTags = async (limit = 20) => {
    return await Tag.find()
        .sort({ postCount: -1 })
        .limit(limit)
        .select("name slug postCount color");
};
```

## Population in Mongoose

### Basic Population

```javascript
// Basic population
const post = await Post.findById(postId).populate("author");
console.log(post.author.username); // Access populated field

// Multiple field population
const post = await Post.findById(postId).populate("author").populate("tags");

// Population with field selection
const post = await Post.findById(postId)
    .populate("author", "username email avatar")
    .populate("tags", "name color");

// Population with conditions
const posts = await Post.find().populate({
    path: "author",
    match: { isActive: true },
    select: "username email",
});
```

### Advanced Population

```javascript
// Nested population
const posts = await Post.find().populate({
    path: "comments",
    populate: {
        path: "author",
        select: "username avatar",
    },
});

// Population with sorting and limiting
const user = await User.findById(userId).populate({
    path: "posts",
    options: {
        sort: { publishedAt: -1 },
        limit: 5,
    },
});

// Conditional population
const posts = await Post.find().populate({
    path: "author",
    match: { role: { $in: ["author", "admin"] } },
    select: "username role avatar",
});

// Population with aggregation-like operations
const postsWithAuthorStats = await Post.find().populate({
    path: "author",
    select: "username",
    options: {
        transform: function (doc) {
            return {
                ...doc.toObject(),
                postCount: 42, // This would come from separate query
            };
        },
    },
});
```

### Virtual Population

```javascript
// Virtual population for one-to-many relationships
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
});

// Virtual field for user's posts
userSchema.virtual("posts", {
    ref: "Post",
    localField: "_id",
    foreignField: "author",
    justOne: false,
});

// Virtual field for post count
userSchema.virtual("postCount", {
    ref: "Post",
    localField: "_id",
    foreignField: "author",
    count: true,
});

// Enable virtuals in JSON output
userSchema.set("toJSON", { virtuals: true });

// Usage
const user = await User.findById(userId)
    .populate("posts")
    .populate("postCount");

console.log(user.posts); // Array of posts
console.log(user.postCount); // Number of posts
```

### Population Performance Optimization

```javascript
// Efficient population with projection
const getPostsWithAuthors = async (page = 1, limit = 10) => {
    return await Post.find()
        .select("title content publishedAt author") // Only select needed fields
        .populate("author", "username avatar") // Only populate needed author fields
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(); // Return plain objects for better performance
};

// Manual population for complex scenarios
const getPostsWithAuthorStats = async () => {
    const posts = await Post.find()
        .select("title content author publishedAt")
        .lean();

    const authorIds = [...new Set(posts.map((post) => post.author))];

    // Get authors with additional stats
    const authors = await User.aggregate([
        { $match: { _id: { $in: authorIds } } },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "author",
                as: "authorPosts",
            },
        },
        {
            $project: {
                username: 1,
                avatar: 1,
                postCount: { $size: "$authorPosts" },
                lastPostDate: { $max: "$authorPosts.publishedAt" },
            },
        },
    ]);

    // Create author lookup map
    const authorMap = authors.reduce((map, author) => {
        map[author._id] = author;
        return map;
    }, {});

    // Attach author data to posts
    return posts.map((post) => ({
        ...post,
        author: authorMap[post.author],
    }));
};
```

## Advanced Relationship Patterns

### Polymorphic Relationships

```javascript
// Comments that can belong to different types of documents
const commentSchema = new mongoose.Schema({
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Polymorphic reference
    commentableId: { type: mongoose.Schema.Types.ObjectId, required: true },
    commentableType: {
        type: String,
        required: true,
        enum: ["Post", "Video", "Photo"],
    },

    createdAt: { type: Date, default: Date.now },
});

// Virtual for polymorphic population
commentSchema.virtual("commentable", {
    refPath: "commentableType",
    localField: "commentableId",
    foreignField: "_id",
    justOne: true,
});

const Comment = mongoose.model("Comment", commentSchema);

// Usage
const comments = await Comment.find()
    .populate("commentable")
    .populate("author", "username avatar");

// Helper methods for specific types
commentSchema.statics.findByCommentable = function (
    commentableId,
    commentableType
) {
    return this.find({
        commentableId,
        commentableType,
    }).populate("author", "username avatar");
};
```

### Tree Structures (Hierarchical Data)

```javascript
// Category tree structure
const categorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    description: String,

    // Parent reference
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    // Path for efficient queries (materialized path pattern)
    path: String,

    // Level in hierarchy
    level: { type: Number, default: 0 },

    // Order within siblings
    order: { type: Number, default: 0 },
});

// Index for efficient tree queries
categorySchema.index({ path: 1 });
categorySchema.index({ parent: 1, order: 1 });

// Pre-save middleware to maintain path and level
categorySchema.pre("save", async function (next) {
    if (this.parent) {
        const parent = await this.constructor.findById(this.parent);
        this.path = `${parent.path}/${this._id}`;
        this.level = parent.level + 1;
    } else {
        this.path = `/${this._id}`;
        this.level = 0;
    }
    next();
});

// Instance methods for tree operations
categorySchema.methods.getChildren = function () {
    return this.constructor.find({ parent: this._id }).sort({ order: 1 });
};

categorySchema.methods.getDescendants = function () {
    return this.constructor
        .find({
            path: new RegExp(`^${this.path}/`),
        })
        .sort({ path: 1 });
};

categorySchema.methods.getAncestors = function () {
    const ancestorIds = this.path.split("/").slice(1, -1);
    return this.constructor
        .find({
            _id: { $in: ancestorIds },
        })
        .sort({ level: 1 });
};

const Category = mongoose.model("Category", categorySchema);

// Building category tree
const buildCategoryTree = async () => {
    const categories = await Category.find().sort({ path: 1 });

    const categoryMap = {};
    const rootCategories = [];

    categories.forEach((category) => {
        categoryMap[category._id] = {
            ...category.toObject(),
            children: [],
        };
    });

    categories.forEach((category) => {
        if (category.parent) {
            categoryMap[category.parent].children.push(
                categoryMap[category._id]
            );
        } else {
            rootCategories.push(categoryMap[category._id]);
        }
    });

    return rootCategories;
};
```

### Denormalization Patterns

```javascript
// Order with denormalized product data
const orderSchema = new mongoose.Schema({
    orderNumber: String,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Denormalized customer data (snapshot at time of order)
    customerSnapshot: {
        name: String,
        email: String,
        shippingAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
        },
    },

    items: [
        {
            // Reference to current product
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

            // Denormalized product data (snapshot at time of order)
            productSnapshot: {
                name: String,
                description: String,
                sku: String,
                price: Number,
                category: String,
            },

            quantity: Number,
            unitPrice: Number, // Price at time of order
            totalPrice: Number,
        },
    ],

    subtotal: Number,
    tax: Number,
    shipping: Number,
    total: Number,

    status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending",
    },

    createdAt: { type: Date, default: Date.now },
});

// Pre-save middleware to create snapshots
orderSchema.pre("save", async function (next) {
    if (this.isNew) {
        // Create customer snapshot
        const customer = await mongoose.model("User").findById(this.customer);
        this.customerSnapshot = {
            name: customer.profile.firstName + " " + customer.profile.lastName,
            email: customer.email,
            shippingAddress: customer.addresses.find((addr) => addr.isPrimary),
        };

        // Create product snapshots
        for (let item of this.items) {
            const product = await mongoose
                .model("Product")
                .findById(item.product);
            item.productSnapshot = {
                name: product.name,
                description: product.description,
                sku: product.sku,
                price: product.price,
                category: product.category,
            };
            item.unitPrice = product.price;
            item.totalPrice = item.quantity * item.unitPrice;
        }

        // Calculate totals
        this.subtotal = this.items.reduce(
            (sum, item) => sum + item.totalPrice,
            0
        );
        this.total = this.subtotal + this.tax + this.shipping;
    }

    next();
});
```

## Relationship Performance Optimization

### Indexing for Relationships

```javascript
// Compound indexes for common query patterns
userSchema.index({ email: 1 }); // Unique user lookup
postSchema.index({ author: 1, publishedAt: -1 }); // User's posts by date
postSchema.index({ tags: 1, publishedAt: -1 }); // Posts by tag and date
commentSchema.index({ commentableId: 1, commentableType: 1 }); // Polymorphic queries

// Sparse indexes for optional references
postSchema.index({ category: 1 }, { sparse: true });

// Text indexes for search across relationships
postSchema.index({
    title: "text",
    content: "text",
    "author.username": "text",
});
```

### Efficient Relationship Queries

```javascript
// Batch loading to avoid N+1 queries
const getPostsWithAuthors = async (postIds) => {
    // Single query to get all posts
    const posts = await Post.find({ _id: { $in: postIds } }).lean();

    // Single query to get all authors
    const authorIds = [...new Set(posts.map((post) => post.author))];
    const authors = await User.find({ _id: { $in: authorIds } })
        .select("username avatar")
        .lean();

    // Create lookup map
    const authorMap = authors.reduce((map, author) => {
        map[author._id] = author;
        return map;
    }, {});

    // Attach authors to posts
    return posts.map((post) => ({
        ...post,
        author: authorMap[post.author],
    }));
};

// Use aggregation for complex relationship queries
const getAuthorStatsWithPosts = async () => {
    return await User.aggregate([
        { $match: { isActive: true } },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "author",
                as: "posts",
                pipeline: [
                    { $match: { status: "published" } },
                    { $sort: { publishedAt: -1 } },
                    { $limit: 5 },
                ],
            },
        },
        {
            $addFields: {
                totalPosts: { $size: "$posts" },
                lastPostDate: { $max: "$posts.publishedAt" },
            },
        },
        {
            $sort: { totalPosts: -1 },
        },
    ]);
};
```

### Caching Relationship Data

```javascript
// Cache frequently accessed relationship data
const Redis = require("redis");
const redis = Redis.createClient();

const getCachedUserWithPosts = async (userId) => {
    const cacheKey = `user:${userId}:with_posts`;

    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    // If not in cache, fetch from database
    const user = await User.findById(userId)
        .populate({
            path: "posts",
            options: { sort: { publishedAt: -1 }, limit: 10 },
        })
        .lean();

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(user));

    return user;
};

// Invalidate cache when relationships change
postSchema.post("save", async function (doc) {
    const cacheKey = `user:${doc.author}:with_posts`;
    await redis.del(cacheKey);
});
```

## 🎯 Practice Exercises

### Exercise 1: Social Media Platform

Design schemas for:

1. Users with profiles and settings
2. Posts with comments and likes
3. Follow/friendship relationships
4. Groups and memberships

### Exercise 2: E-learning Platform

Create relationships for:

1. Students, instructors, and courses
2. Course modules and lessons
3. Assignments and submissions
4. Progress tracking

### Exercise 3: E-commerce System

Model relationships for:

1. Products, categories, and variants
2. Orders with line items
3. Shopping carts
4. Reviews and ratings

## 🔧 Best Practices

### Schema Design

1. **Understand access patterns** before choosing embedded vs referenced
2. **Consider document size limits** (16MB per document)
3. **Use indexes** for frequently queried relationship fields
4. **Denormalize carefully** - balance performance vs consistency
5. **Plan for growth** - consider how relationships will scale

### Performance

1. **Avoid deep population chains** - use aggregation instead
2. **Use lean queries** when you don't need Mongoose features
3. **Implement proper indexing** for relationship queries
4. **Cache frequently accessed data**
5. **Use batch operations** to avoid N+1 query problems

### Data Integrity

1. **Use transactions** for operations affecting multiple documents
2. **Implement proper validation** for relationship fields
3. **Handle cascade operations** carefully (deletions, updates)
4. **Consider eventual consistency** in denormalized data
5. **Monitor and clean up** orphaned references

---

## 🔄 Next Steps

After mastering document relationships:

1. Practice designing complex relationship patterns
2. Experiment with different population strategies
3. Learn about data validation and middleware
4. Move to **09-Validation-Middleware.md** for production-ready features

---

_Continue to Phase 5: Production Ready_
