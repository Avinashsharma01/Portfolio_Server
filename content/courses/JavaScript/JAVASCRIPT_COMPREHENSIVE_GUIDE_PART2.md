# JavaScript Comprehensive Guide - Part 2: Asynchronous JavaScript

## Table of Contents - Part 2

1. [Introduction to Asynchronous JavaScript](#introduction-to-asynchronous-javascript)
2. [Event Loop and Call Stack](#event-loop-and-call-stack)
3. [Callbacks and Callback Hell](#callbacks-and-callback-hell)
4. [Promises Deep Dive](#promises-deep-dive)
5. [Async/Await Mastery](#asyncawait-mastery)
6. [Error Handling in Async Code](#error-handling-in-async-code)
7. [Fetch API and HTTP Requests](#fetch-api-and-http-requests)
8. [Concurrent Programming Patterns](#concurrent-programming-patterns)

---

## Introduction to Asynchronous JavaScript

Asynchronous programming is crucial for building responsive applications. Whether you're handling user interactions in the browser or processing requests on the server, understanding async JavaScript is essential.

### Why Asynchronous Programming?

-   **Non-blocking Operations**: Keep the UI responsive
-   **Better Performance**: Handle multiple operations simultaneously
-   **Real-world Applications**: APIs, file operations, timers
-   **Modern JavaScript**: Foundation for modern frameworks and libraries

---

## Event Loop and Call Stack

### 1. Understanding the Event Loop

```javascript
// Demonstration of event loop behavior
console.log("1"); // Synchronous

setTimeout(() => {
    console.log("2"); // Macro task
}, 0);

Promise.resolve().then(() => {
    console.log("3"); // Micro task
});

console.log("4"); // Synchronous

// Output: 1, 4, 3, 2
```

### 2. Call Stack, Web APIs, and Task Queue

```javascript
// Call stack visualization example
function first() {
    console.log("First function start");
    second();
    console.log("First function end");
}

function second() {
    console.log("Second function start");
    setTimeout(() => {
        console.log("Timeout callback");
    }, 0);
    console.log("Second function end");
}

first();

/*
Call Stack Execution:
1. first() → Call Stack
2. console.log('First function start') → Call Stack → Execute → Pop
3. second() → Call Stack
4. console.log('Second function start') → Call Stack → Execute → Pop
5. setTimeout() → Call Stack → Web API → Pop
6. console.log('Second function end') → Call Stack → Execute → Pop
7. second() pops from Call Stack
8. console.log('First function end') → Call Stack → Execute → Pop
9. first() pops from Call Stack
10. Timeout callback → Task Queue → Call Stack (when empty)
*/
```

### 3. Microtasks vs Macrotasks

```javascript
// Understanding task priorities
console.log("Script start");

setTimeout(() => console.log("setTimeout 1"), 0);
setTimeout(() => console.log("setTimeout 2"), 0);

Promise.resolve()
    .then(() => console.log("Promise 1"))
    .then(() => console.log("Promise 2"));

Promise.resolve().then(() => {
    console.log("Promise 3");
    setTimeout(() => console.log("setTimeout 3"), 0);
});

console.log("Script end");

/*
Output:
Script start
Script end
Promise 1
Promise 2
Promise 3
setTimeout 1
setTimeout 2
setTimeout 3
*/
```

---

## Callbacks and Callback Hell

### 1. Basic Callbacks

```javascript
// Simple callback example
function fetchData(callback) {
    setTimeout(() => {
        const data = { id: 1, name: "John", email: "john@example.com" };
        callback(null, data); // Node.js convention: error first
    }, 1000);
}

function handleData(error, data) {
    if (error) {
        console.error("Error:", error);
        return;
    }
    console.log("Received data:", data);
}

fetchData(handleData);
```

### 2. Callback Hell Problem

```javascript
// Callback hell example
function getUserById(id, callback) {
    setTimeout(() => {
        callback(null, { id, name: `User ${id}` });
    }, 100);
}

function getPostsByUserId(userId, callback) {
    setTimeout(() => {
        callback(null, [
            { id: 1, title: "Post 1", userId },
            { id: 2, title: "Post 2", userId },
        ]);
    }, 100);
}

function getCommentsByPostId(postId, callback) {
    setTimeout(() => {
        callback(null, [
            { id: 1, text: "Comment 1", postId },
            { id: 2, text: "Comment 2", postId },
        ]);
    }, 100);
}

// Nested callbacks (Pyramid of Doom)
getUserById(1, (err, user) => {
    if (err) return console.error(err);

    getPostsByUserId(user.id, (err, posts) => {
        if (err) return console.error(err);

        getCommentsByPostId(posts[0].id, (err, comments) => {
            if (err) return console.error(err);

            console.log("User:", user);
            console.log("Posts:", posts);
            console.log("Comments:", comments);
        });
    });
});
```

### 3. Callback Solutions

```javascript
// Solution 1: Named functions
function handleComments(err, comments, user, posts) {
    if (err) return console.error(err);
    console.log("User:", user);
    console.log("Posts:", posts);
    console.log("Comments:", comments);
}

function handlePosts(err, posts, user) {
    if (err) return console.error(err);
    getCommentsByPostId(posts[0].id, (err, comments) => {
        handleComments(err, comments, user, posts);
    });
}

function handleUser(err, user) {
    if (err) return console.error(err);
    getPostsByUserId(user.id, (err, posts) => {
        handlePosts(err, posts, user);
    });
}

getUserById(1, handleUser);

// Solution 2: Modular approach
const dataProcessor = {
    async processUserData(userId) {
        try {
            const user = await this.promisifyGetUser(userId);
            const posts = await this.promisifyGetPosts(user.id);
            const comments = await this.promisifyGetComments(posts[0].id);

            return { user, posts, comments };
        } catch (error) {
            throw new Error(`Data processing failed: ${error.message}`);
        }
    },

    promisifyGetUser(id) {
        return new Promise((resolve, reject) => {
            getUserById(id, (err, user) => {
                if (err) reject(err);
                else resolve(user);
            });
        });
    },

    promisifyGetPosts(userId) {
        return new Promise((resolve, reject) => {
            getPostsByUserId(userId, (err, posts) => {
                if (err) reject(err);
                else resolve(posts);
            });
        });
    },

    promisifyGetComments(postId) {
        return new Promise((resolve, reject) => {
            getCommentsByPostId(postId, (err, comments) => {
                if (err) reject(err);
                else resolve(comments);
            });
        });
    },
};
```

---

## Promises Deep Dive

### 1. Promise Fundamentals

```javascript
// Creating promises
const simplePromise = new Promise((resolve, reject) => {
    const success = Math.random() > 0.5;

    setTimeout(() => {
        if (success) {
            resolve({ message: "Operation successful!", data: [1, 2, 3] });
        } else {
            reject(new Error("Operation failed!"));
        }
    }, 1000);
});

// Promise states and handling
simplePromise
    .then((result) => {
        console.log("Success:", result);
        return result.data; // This value is passed to the next .then()
    })
    .then((data) => {
        console.log("Data:", data);
        return data.map((x) => x * 2); // Transform the data
    })
    .then((transformedData) => {
        console.log("Transformed:", transformedData);
    })
    .catch((error) => {
        console.error("Error:", error.message);
    })
    .finally(() => {
        console.log("Promise chain completed");
    });
```

### 2. Promise Chaining and Transformation

```javascript
// Real-world example: User authentication flow
class AuthService {
    static validateCredentials(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username === "admin" && password === "password") {
                    resolve({ username, role: "admin" });
                } else {
                    reject(new Error("Invalid credentials"));
                }
            }, 500);
        });
    }

    static generateToken(user) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const token = `jwt_${user.username}_${Date.now()}`;
                resolve({ ...user, token });
            }, 200);
        });
    }

    static fetchUserProfile(userWithToken) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const profile = {
                    ...userWithToken,
                    id: 1,
                    email: `${userWithToken.username}@example.com`,
                    lastLogin: new Date(),
                };
                resolve(profile);
            }, 300);
        });
    }

    // Chaining promises for complete login flow
    static login(username, password) {
        return this.validateCredentials(username, password)
            .then((user) => this.generateToken(user))
            .then((userWithToken) => this.fetchUserProfile(userWithToken))
            .then((fullProfile) => {
                console.log("Login successful:", fullProfile);
                return fullProfile;
            })
            .catch((error) => {
                console.error("Login failed:", error.message);
                throw error; // Re-throw for caller to handle
            });
    }
}

// Usage
AuthService.login("admin", "password")
    .then((profile) => {
        console.log("Welcome,", profile.username);
    })
    .catch((error) => {
        console.log("Please try again");
    });
```

### 3. Promise Utilities

```javascript
// Promise.all() - Wait for all promises
const fetchMultipleUsers = async () => {
    const userIds = [1, 2, 3, 4, 5];

    const userPromises = userIds.map((id) =>
        fetch(`/api/users/${id}`).then((res) => res.json())
    );

    try {
        const users = await Promise.all(userPromises);
        console.log("All users fetched:", users);
        return users;
    } catch (error) {
        console.error("Failed to fetch one or more users:", error);
        throw error;
    }
};

// Promise.allSettled() - Get results regardless of success/failure
const fetchUsersWithFallback = async () => {
    const userIds = [1, 2, 999, 4, 5]; // 999 will fail

    const userPromises = userIds.map((id) =>
        fetch(`/api/users/${id}`).then((res) => {
            if (!res.ok) throw new Error(`User ${id} not found`);
            return res.json();
        })
    );

    const results = await Promise.allSettled(userPromises);

    const successfulUsers = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

    const failedRequests = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason.message);

    console.log("Successful users:", successfulUsers);
    console.log("Failed requests:", failedRequests);

    return successfulUsers;
};

// Promise.race() - First promise to resolve/reject wins
const timeoutPromise = (ms) =>
    new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), ms)
    );

const fetchWithTimeout = (url, timeout = 5000) => {
    return Promise.race([fetch(url), timeoutPromise(timeout)]);
};

// Promise.any() - First successful promise wins
const fetchFromMultipleSources = (data) => {
    const sources = [
        fetch("/api/primary/data"),
        fetch("/api/secondary/data"),
        fetch("/api/backup/data"),
    ];

    return Promise.any(sources)
        .then((response) => response.json())
        .catch((error) => {
            console.error("All sources failed:", error);
            throw new Error("Data unavailable from all sources");
        });
};
```

### 4. Custom Promise Utilities

```javascript
// Promisify utility for callback-based functions
function promisify(fn) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    };
}

// Usage with Node.js fs module
const fs = require("fs");
const readFileAsync = promisify(fs.readFile);

readFileAsync("file.txt", "utf8")
    .then((content) => console.log(content))
    .catch((error) => console.error(error));

// Delay utility
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry utility
async function retry(fn, maxAttempts = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) {
                throw new Error(
                    `Failed after ${maxAttempts} attempts: ${error.message}`
                );
            }

            console.log(
                `Attempt ${attempt} failed, retrying in ${delayMs}ms...`
            );
            await delay(delayMs);
        }
    }
}

// Usage
const unreliableApiCall = () => {
    return fetch("/api/unreliable-endpoint").then((response) => {
        if (!response.ok) throw new Error("API call failed");
        return response.json();
    });
};

retry(unreliableApiCall, 3, 2000)
    .then((data) => console.log("Success:", data))
    .catch((error) => console.error("Final failure:", error));
```

---

## Async/Await Mastery

### 1. Basic Async/Await

```javascript
// Converting promise chains to async/await
async function loginUser(username, password) {
    try {
        const user = await AuthService.validateCredentials(username, password);
        const userWithToken = await AuthService.generateToken(user);
        const fullProfile = await AuthService.fetchUserProfile(userWithToken);

        console.log("Login successful:", fullProfile);
        return fullProfile;
    } catch (error) {
        console.error("Login failed:", error.message);
        throw error;
    }
}

// Multiple independent async operations
async function fetchDashboardData(userId) {
    try {
        // These can run in parallel
        const [user, posts, notifications, analytics] = await Promise.all([
            fetchUser(userId),
            fetchUserPosts(userId),
            fetchNotifications(userId),
            fetchAnalytics(userId),
        ]);

        return {
            user,
            posts,
            notifications,
            analytics,
            loadedAt: new Date(),
        };
    } catch (error) {
        console.error("Failed to load dashboard:", error);
        throw error;
    }
}
```

### 2. Advanced Async Patterns

```javascript
// Sequential vs Parallel execution
class DataProcessor {
    // Sequential execution (slower but order-dependent)
    static async processDataSequentially(items) {
        const results = [];

        for (const item of items) {
            try {
                const processed = await this.processItem(item);
                results.push(processed);
            } catch (error) {
                console.error(`Failed to process item ${item.id}:`, error);
                results.push({ error: error.message, item });
            }
        }

        return results;
    }

    // Parallel execution (faster but all-or-nothing)
    static async processDataParallel(items) {
        const processingPromises = items.map((item) => this.processItem(item));

        try {
            return await Promise.all(processingPromises);
        } catch (error) {
            console.error("Batch processing failed:", error);
            throw error;
        }
    }

    // Parallel with individual error handling
    static async processDataParallelWithFallback(items) {
        const processingPromises = items.map(async (item) => {
            try {
                return await this.processItem(item);
            } catch (error) {
                return { error: error.message, item };
            }
        });

        return await Promise.all(processingPromises);
    }

    // Controlled concurrency
    static async processDataWithConcurrencyLimit(items, limit = 3) {
        const results = [];

        for (let i = 0; i < items.length; i += limit) {
            const batch = items.slice(i, i + limit);
            const batchPromises = batch.map((item) => this.processItem(item));

            try {
                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);
            } catch (error) {
                console.error(
                    `Batch ${Math.floor(i / limit) + 1} failed:`,
                    error
                );
                // Handle batch failure
            }
        }

        return results;
    }

    static async processItem(item) {
        // Simulate processing time
        await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 1000)
        );

        if (Math.random() < 0.1) {
            // 10% failure rate
            throw new Error(`Processing failed for item ${item.id}`);
        }

        return {
            ...item,
            processed: true,
            processedAt: new Date(),
        };
    }
}
```

### 3. Async Iteration

```javascript
// Async generators
async function* fetchPaginatedData(baseUrl) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        try {
            const response = await fetch(`${baseUrl}?page=${page}&limit=10`);
            const data = await response.json();

            if (data.items.length === 0) {
                hasMore = false;
            } else {
                yield data.items;
                page++;
                hasMore = data.hasNext;
            }
        } catch (error) {
            console.error(`Failed to fetch page ${page}:`, error);
            break;
        }
    }
}

// Using async iteration
async function processAllData() {
    try {
        for await (const batch of fetchPaginatedData("/api/users")) {
            console.log(`Processing batch of ${batch.length} users`);

            // Process each batch
            for (const user of batch) {
                await processUser(user);
            }

            // Add delay between batches to avoid overwhelming the server
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.log("All data processed successfully");
    } catch (error) {
        console.error("Error processing data:", error);
    }
}

// Async map with concurrency control
async function asyncMap(array, asyncFn, concurrency = 3) {
    const results = [];
    const executing = [];

    for (const item of array) {
        const promise = asyncFn(item).then((result) => {
            executing.splice(executing.indexOf(promise), 1);
            return result;
        });

        results.push(promise);
        executing.push(promise);

        if (executing.length >= concurrency) {
            await Promise.race(executing);
        }
    }

    return Promise.all(results);
}

// Usage
const urls = [
    "/api/data/1",
    "/api/data/2",
    "/api/data/3",
    "/api/data/4",
    "/api/data/5",
];

const fetchUrl = async (url) => {
    const response = await fetch(url);
    return response.json();
};

asyncMap(urls, fetchUrl, 2) // Max 2 concurrent requests
    .then((results) => console.log("All fetched:", results))
    .catch((error) => console.error("Error:", error));
```

---

## Error Handling in Async Code

### 1. Try-Catch with Async/Await

```javascript
// Comprehensive error handling
async function robustDataFetcher(userId) {
    const errors = [];
    const warnings = [];

    try {
        // Primary data (required)
        let user;
        try {
            user = await fetchUser(userId);
        } catch (error) {
            throw new Error(`Failed to fetch user: ${error.message}`);
        }

        // Secondary data (optional with fallbacks)
        let posts = [];
        try {
            posts = await fetchUserPosts(userId);
        } catch (error) {
            warnings.push(`Could not fetch posts: ${error.message}`);
            posts = []; // Fallback to empty array
        }

        // Analytics (optional)
        let analytics = null;
        try {
            analytics = await fetchAnalytics(userId);
        } catch (error) {
            warnings.push(`Analytics unavailable: ${error.message}`);
        }

        return {
            user,
            posts,
            analytics,
            warnings,
            success: true,
        };
    } catch (error) {
        return {
            error: error.message,
            warnings,
            success: false,
        };
    }
}

// Using the robust fetcher
async function loadUserDashboard(userId) {
    const result = await robustDataFetcher(userId);

    if (!result.success) {
        showErrorMessage(result.error);
        return;
    }

    if (result.warnings.length > 0) {
        showWarnings(result.warnings);
    }

    renderDashboard(result);
}
```

### 2. Custom Error Classes

```javascript
// Custom error classes for better error handling
class APIError extends Error {
    constructor(message, statusCode, endpoint) {
        super(message);
        this.name = "APIError";
        this.statusCode = statusCode;
        this.endpoint = endpoint;
    }
}

class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
    }
}

class NetworkError extends Error {
    constructor(message, url) {
        super(message);
        this.name = "NetworkError";
        this.url = url;
    }
}

// Enhanced fetch with custom errors
async function enhancedFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new APIError(
                `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                url
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof APIError) {
            throw error; // Re-throw API errors
        }

        // Network or other errors
        throw new NetworkError(`Network request failed: ${error.message}`, url);
    }
}

// Centralized error handler
function handleError(error, context = "") {
    console.error(`Error in ${context}:`, error);

    switch (error.constructor) {
        case APIError:
            if (error.statusCode === 401) {
                redirectToLogin();
            } else if (error.statusCode === 403) {
                showAccessDeniedMessage();
            } else {
                showErrorMessage(`API Error: ${error.message}`);
            }
            break;

        case ValidationError:
            highlightField(error.field);
            showValidationError(error.message);
            break;

        case NetworkError:
            showNetworkErrorMessage();
            break;

        default:
            showGenericErrorMessage();
            break;
    }
}

// Usage with proper error handling
async function saveUserData(userData) {
    try {
        // Validate data first
        if (!userData.email) {
            throw new ValidationError("Email is required", "email");
        }

        // Save to API
        const result = await enhancedFetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        showSuccessMessage("User saved successfully");
        return result;
    } catch (error) {
        handleError(error, "saveUserData");
        throw error; // Re-throw for caller
    }
}
```

### 3. Error Recovery Patterns

```javascript
// Circuit breaker pattern for resilient API calls
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    }

    async call(fn) {
        if (this.state === "OPEN") {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = "HALF_OPEN";
            } else {
                throw new Error("Circuit breaker is OPEN");
            }
        }

        try {
            const result = await fn();
            this.reset();
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }

    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.threshold) {
            this.state = "OPEN";
        }
    }

    reset() {
        this.failureCount = 0;
        this.state = "CLOSED";
        this.lastFailureTime = null;
    }
}

// Usage
const apiCircuitBreaker = new CircuitBreaker(3, 30000);

async function resilientApiCall(url) {
    try {
        return await apiCircuitBreaker.call(() => enhancedFetch(url));
    } catch (error) {
        console.error("API call failed:", error.message);

        // Fallback to cached data or default values
        return getCachedData(url) || getDefaultData();
    }
}
```

---

This concludes Part 2 of the JavaScript Comprehensive Guide. We've covered the essential asynchronous programming concepts that are fundamental to modern JavaScript development.

**What's coming in the next parts:**

-   Part 3: DOM Manipulation and Browser APIs
-   Part 4: Node.js and Backend Concepts
-   Part 5: Modern JavaScript Features and Best Practices

**Key Takeaways from Part 2:**

1. **Event Loop**: Understanding how JavaScript handles async operations
2. **Promises**: Modern approach to handling async operations
3. **Async/Await**: Cleaner syntax for promise-based code
4. **Error Handling**: Robust patterns for managing failures
5. **Concurrency**: Controlling parallel operations effectively

Ready for Part 3? Let me know when you want to continue!
