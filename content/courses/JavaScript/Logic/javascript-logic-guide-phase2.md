# JavaScript Logic Guide - Phase 2

## Table of Contents

7. [Loops & Iteration](#loops--iteration)
8. [Asynchronous JavaScript](#asynchronous-javascript)
9. [Error Handling](#error-handling)
10. [Regular Expressions](#regular-expressions)
11. [ES6+ Features](#es6-features)
12. [Advanced Problem Solving](#advanced-problem-solving)

---

## Loops & Iteration

### Traditional Loops

```javascript
// 1. for loop
console.log("=== Basic for loop ===");
for (let i = 0; i < 5; i++) {
    console.log(`Iteration ${i}`);
}

// Common patterns
// Reverse iteration
for (let i = 4; i >= 0; i--) {
    console.log(`Reverse: ${i}`);
}

// Step by 2
for (let i = 0; i < 10; i += 2) {
    console.log(`Even: ${i}`);
}

// 2. while loop
console.log("=== while loop ===");
let count = 0;
while (count < 3) {
    console.log(`Count: ${count}`);
    count++;
}

// 3. do-while loop (executes at least once)
console.log("=== do-while loop ===");
let num = 0;
do {
    console.log(`Number: ${num}`);
    num++;
} while (num < 3);

// 4. for...in loop (for object properties)
const person = { name: "John", age: 30, city: "New York" };
console.log("=== for...in loop ===");
for (const key in person) {
    if (person.hasOwnProperty(key)) {
        // Good practice
        console.log(`${key}: ${person[key]}`);
    }
}

// 5. for...of loop (for iterable objects)
const fruits = ["apple", "banana", "orange"];
console.log("=== for...of loop ===");
for (const fruit of fruits) {
    console.log(fruit);
}

// for...of with index
for (const [index, fruit] of fruits.entries()) {
    console.log(`${index}: ${fruit}`);
}

// for...of with strings
for (const char of "hello") {
    console.log(char);
}
```

### Loop Control and Performance

```javascript
// Break and continue
console.log("=== Break and Continue ===");
for (let i = 0; i < 10; i++) {
    if (i === 3) {
        continue; // Skip this iteration
    }
    if (i === 7) {
        break; // Exit the loop
    }
    console.log(i); // 0, 1, 2, 4, 5, 6
}

// Labeled statements (rarely used, but good to know)
outer: for (let i = 0; i < 3; i++) {
    inner: for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) {
            break outer; // Breaks out of outer loop
        }
        console.log(`i: ${i}, j: ${j}`);
    }
}

// Performance considerations
const largeArray = new Array(1000000).fill(0).map((_, i) => i);

// Efficient loop patterns
console.time("cached length");
for (let i = 0, len = largeArray.length; i < len; i++) {
    // Cache array length for better performance
    // Process largeArray[i]
}
console.timeEnd("cached length");

console.time("reverse loop");
for (let i = largeArray.length - 1; i >= 0; i--) {
    // Reverse loops can be slightly faster
    // Process largeArray[i]
}
console.timeEnd("reverse loop");

// When to use each loop type
const examples = {
    // Use for: when you need index and specific iteration control
    findFirstEven: function (numbers) {
        for (let i = 0; i < numbers.length; i++) {
            if (numbers[i] % 2 === 0) {
                return { value: numbers[i], index: i };
            }
        }
        return null;
    },

    // Use for...of: when you need values but not indices
    sumArray: function (numbers) {
        let sum = 0;
        for (const num of numbers) {
            sum += num;
        }
        return sum;
    },

    // Use for...in: when working with object properties
    printObjectProps: function (obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                console.log(`${key}: ${obj[key]}`);
            }
        }
    },

    // Use forEach: when you need array methods chaining
    processItems: function (items) {
        items
            .filter((item) => item.active)
            .forEach((item) => console.log(item.name));
    },
};
```

### Advanced Iteration Patterns

```javascript
// Generator functions for custom iteration
function* numberGenerator(start, end, step = 1) {
    for (let i = start; i <= end; i += step) {
        yield i;
    }
}

const gen = numberGenerator(1, 10, 2);
for (const num of gen) {
    console.log(num); // 1, 3, 5, 7, 9
}

// Infinite generator with controls
function* fibonacci() {
    let [a, b] = [0, 1];
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}

const fib = fibonacci();
console.log(fib.next().value); // 0
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2

// Iterator pattern implementation
function createIterator(array) {
    let index = 0;

    return {
        next() {
            if (index < array.length) {
                return { value: array[index++], done: false };
            } else {
                return { done: true };
            }
        },

        [Symbol.iterator]() {
            return this;
        },
    };
}

const iterator = createIterator([1, 2, 3]);
for (const value of iterator) {
    console.log(value); // 1, 2, 3
}

// Functional iteration alternatives
const numbers = [1, 2, 3, 4, 5];

// Traditional loop
let doubled = [];
for (let i = 0; i < numbers.length; i++) {
    doubled.push(numbers[i] * 2);
}

// Functional approach
const doubledFunctional = numbers.map((x) => x * 2);

// Reduce for complex transformations
const stats = numbers.reduce(
    (acc, num) => {
        acc.sum += num;
        acc.count++;
        acc.average = acc.sum / acc.count;
        if (num > acc.max) acc.max = num;
        if (num < acc.min) acc.min = num;
        return acc;
    },
    { sum: 0, count: 0, average: 0, max: -Infinity, min: Infinity }
);

console.log(stats); // { sum: 15, count: 5, average: 3, max: 5, min: 1 }
```

---

## Asynchronous JavaScript

### Callbacks and Callback Hell

```javascript
// Basic callback pattern
function fetchData(callback) {
    setTimeout(() => {
        const data = { id: 1, name: "John" };
        callback(null, data); // Node.js style: error first
    }, 1000);
}

function fetchUserPosts(userId, callback) {
    setTimeout(() => {
        const posts = [
            { id: 1, title: "Post 1" },
            { id: 2, title: "Post 2" },
        ];
        callback(null, posts);
    }, 800);
}

function fetchPostComments(postId, callback) {
    setTimeout(() => {
        const comments = ["Great post!", "Thanks for sharing"];
        callback(null, comments);
    }, 600);
}

// Callback Hell example
fetchData((err, user) => {
    if (err) {
        console.error("Error fetching user:", err);
        return;
    }

    fetchUserPosts(user.id, (err, posts) => {
        if (err) {
            console.error("Error fetching posts:", err);
            return;
        }

        fetchPostComments(posts[0].id, (err, comments) => {
            if (err) {
                console.error("Error fetching comments:", err);
                return;
            }

            console.log("User:", user);
            console.log("Posts:", posts);
            console.log("Comments:", comments);
        });
    });
});

// Better callback pattern with error handling
function safeCallback(callback) {
    return function (err, data) {
        if (typeof callback === "function") {
            callback(err, data);
        }
    };
}

// Callback composition to avoid nesting
function handleUser(err, user) {
    if (err) return console.error("User error:", err);

    fetchUserPosts(user.id, handlePosts);

    function handlePosts(err, posts) {
        if (err) return console.error("Posts error:", err);

        fetchPostComments(posts[0].id, handleComments);

        function handleComments(err, comments) {
            if (err) return console.error("Comments error:", err);

            console.log({ user, posts, comments });
        }
    }
}

fetchData(handleUser);
```

### Promises

```javascript
// Creating promises
function fetchDataPromise() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const success = Math.random() > 0.2; // 80% success rate

            if (success) {
                resolve({ id: 1, name: "John" });
            } else {
                reject(new Error("Failed to fetch data"));
            }
        }, 1000);
    });
}

function fetchUserPostsPromise(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 1, title: "Post 1" },
                { id: 2, title: "Post 2" },
            ]);
        }, 800);
    });
}

function fetchPostCommentsPromise(postId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(["Great post!", "Thanks for sharing"]);
        }, 600);
    });
}

// Promise chaining
fetchDataPromise()
    .then((user) => {
        console.log("User fetched:", user);
        return fetchUserPostsPromise(user.id);
    })
    .then((posts) => {
        console.log("Posts fetched:", posts);
        return fetchPostCommentsPromise(posts[0].id);
    })
    .then((comments) => {
        console.log("Comments fetched:", comments);
    })
    .catch((error) => {
        console.error("Error in chain:", error.message);
    })
    .finally(() => {
        console.log("Promise chain completed");
    });

// Promise.all - parallel execution
Promise.all([
    fetchDataPromise(),
    fetchUserPostsPromise(1),
    fetchPostCommentsPromise(1),
])
    .then(([user, posts, comments]) => {
        console.log("All data fetched:", { user, posts, comments });
    })
    .catch((error) => {
        console.error("One or more promises failed:", error);
    });

// Promise.allSettled - get all results regardless of success/failure
Promise.allSettled([
    fetchDataPromise(),
    Promise.reject(new Error("This will fail")),
    fetchUserPostsPromise(1),
]).then((results) => {
    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            console.log(`Promise ${index} succeeded:`, result.value);
        } else {
            console.log(`Promise ${index} failed:`, result.reason.message);
        }
    });
});

// Promise.race - first to complete wins
Promise.race([
    fetchDataPromise(),
    new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 500)
    ),
])
    .then((result) => console.log("Race winner:", result))
    .catch((error) => console.log("Race failed:", error.message));

// Promise.any - first successful promise
Promise.any([
    Promise.reject(new Error("First fails")),
    fetchDataPromise(),
    Promise.reject(new Error("Third fails")),
])
    .then((result) => console.log("First success:", result))
    .catch((error) => console.log("All failed:", error));

// Creating resolved/rejected promises
const immediateResolve = Promise.resolve("Immediate value");
const immediateReject = Promise.reject(new Error("Immediate error"));

// Promise utility functions
function delay(ms, value) {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function timeout(promise, ms) {
    return Promise.race([
        promise,
        delay(ms).then(() => Promise.reject(new Error("Timeout"))),
    ]);
}

function retry(promiseFactory, maxAttempts = 3) {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        function attempt() {
            attempts++;
            promiseFactory()
                .then(resolve)
                .catch((error) => {
                    if (attempts < maxAttempts) {
                        console.log(`Attempt ${attempts} failed, retrying...`);
                        setTimeout(attempt, 1000 * attempts); // Exponential backoff
                    } else {
                        reject(error);
                    }
                });
        }

        attempt();
    });
}

// Usage
retry(() => fetchDataPromise(), 3)
    .then((result) => console.log("Retry succeeded:", result))
    .catch((error) => console.log("All retries failed:", error));
```

### Async/Await

```javascript
// Basic async/await
async function fetchUserData() {
    try {
        const user = await fetchDataPromise();
        console.log("User:", user);

        const posts = await fetchUserPostsPromise(user.id);
        console.log("Posts:", posts);

        const comments = await fetchPostCommentsPromise(posts[0].id);
        console.log("Comments:", comments);

        return { user, posts, comments };
    } catch (error) {
        console.error("Error:", error.message);
        throw error; // Re-throw if needed
    }
}

// Parallel execution with async/await
async function fetchAllDataParallel() {
    try {
        // Start all promises simultaneously
        const userPromise = fetchDataPromise();
        const postsPromise = fetchUserPostsPromise(1);
        const commentsPromise = fetchPostCommentsPromise(1);

        // Wait for all to complete
        const [user, posts, comments] = await Promise.all([
            userPromise,
            postsPromise,
            commentsPromise,
        ]);

        return { user, posts, comments };
    } catch (error) {
        console.error("Parallel fetch error:", error);
        throw error;
    }
}

// Sequential vs Parallel comparison
async function compareSequentialVsParallel() {
    console.log("Starting sequential execution...");
    console.time("sequential");
    await fetchUserData();
    console.timeEnd("sequential");

    console.log("Starting parallel execution...");
    console.time("parallel");
    await fetchAllDataParallel();
    console.timeEnd("parallel");
}

// Error handling patterns
async function robustAsyncFunction() {
    let user = null;
    let posts = [];
    let comments = [];

    try {
        user = await fetchDataPromise();
    } catch (error) {
        console.warn("Failed to fetch user, using default");
        user = { id: 0, name: "Guest" };
    }

    try {
        posts = await fetchUserPostsPromise(user.id);
    } catch (error) {
        console.warn("Failed to fetch posts:", error.message);
        // Continue with empty posts array
    }

    if (posts.length > 0) {
        try {
            comments = await fetchPostCommentsPromise(posts[0].id);
        } catch (error) {
            console.warn("Failed to fetch comments:", error.message);
            // Continue with empty comments array
        }
    }

    return { user, posts, comments };
}

// Async iteration
async function* asyncGenerator() {
    for (let i = 0; i < 5; i++) {
        await delay(500, i);
        yield i;
    }
}

async function consumeAsyncGenerator() {
    for await (const value of asyncGenerator()) {
        console.log("Generated:", value);
    }
}

// Promise queue for rate limiting
class PromiseQueue {
    constructor(concurrency = 3) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    async add(promiseFactory) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                promiseFactory,
                resolve,
                reject,
            });
            this.process();
        });
    }

    async process() {
        if (this.running >= this.concurrency || this.queue.length === 0) {
            return;
        }

        this.running++;
        const { promiseFactory, resolve, reject } = this.queue.shift();

        try {
            const result = await promiseFactory();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.running--;
            this.process();
        }
    }
}

// Usage
async function demonstrateQueue() {
    const queue = new PromiseQueue(2); // Max 2 concurrent operations

    const urls = [
        "https://jsonplaceholder.typicode.com/posts/1",
        "https://jsonplaceholder.typicode.com/posts/2",
        "https://jsonplaceholder.typicode.com/posts/3",
        "https://jsonplaceholder.typicode.com/posts/4",
        "https://jsonplaceholder.typicode.com/posts/5",
    ];

    const results = await Promise.all(
        urls.map((url) =>
            queue.add(() =>
                fetch(url)
                    .then((r) => r.json())
                    .catch((e) => ({ error: e.message }))
            )
        )
    );

    console.log("Queue results:", results);
}
```

### Advanced Async Patterns

```javascript
// AbortController for cancellation
async function cancellableOperation() {
    const controller = new AbortController();
    const { signal } = controller;

    // Cancel after 3 seconds
    setTimeout(() => controller.abort(), 3000);

    try {
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/posts",
            {
                signal,
            }
        );

        if (signal.aborted) {
            throw new Error("Operation was cancelled");
        }

        return await response.json();
    } catch (error) {
        if (error.name === "AbortError") {
            console.log("Request was cancelled");
        } else {
            console.error("Request failed:", error);
        }
        throw error;
    }
}

// Async memoization
function asyncMemoize(fn) {
    const cache = new Map();

    return async function (...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            console.log("Cache hit for:", key);
            return cache.get(key);
        }

        console.log("Computing for:", key);
        const promise = fn.apply(this, args);
        cache.set(key, promise);

        try {
            const result = await promise;
            return result;
        } catch (error) {
            cache.delete(key); // Remove failed promises from cache
            throw error;
        }
    };
}

const memoizedFetch = asyncMemoize(async (url) => {
    const response = await fetch(url);
    return response.json();
});

// Async pipeline
function asyncPipe(...functions) {
    return async function (input) {
        let result = input;
        for (const fn of functions) {
            result = await fn(result);
        }
        return result;
    };
}

// Example pipeline functions
const addDelay = async (data) => {
    await delay(100);
    return data;
};

const transform = async (data) => ({
    ...data,
    processed: true,
    timestamp: Date.now(),
});

const validate = async (data) => {
    if (!data.processed) {
        throw new Error("Data not processed");
    }
    return data;
};

const pipeline = asyncPipe(addDelay, transform, validate);

// Usage
pipeline({ id: 1, name: "Test" })
    .then((result) => console.log("Pipeline result:", result))
    .catch((error) => console.error("Pipeline error:", error));

// Debounced async function
function asyncDebounce(fn, delay) {
    let timeoutId;
    let lastPromise;

    return function (...args) {
        return new Promise((resolve, reject) => {
            clearTimeout(timeoutId);

            timeoutId = setTimeout(async () => {
                try {
                    const result = await fn.apply(this, args);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    };
}

// Example: debounced search
const debouncedSearch = asyncDebounce(async (query) => {
    console.log("Searching for:", query);
    await delay(500); // Simulate API call
    return [`Result 1 for ${query}`, `Result 2 for ${query}`];
}, 300);

// Multiple rapid calls will only execute the last one
debouncedSearch("test1");
debouncedSearch("test2");
debouncedSearch("test3").then(console.log); // Only this executes
```

---

## Error Handling

### Try-Catch-Finally

```javascript
// Basic error handling
function riskyOperation() {
    const random = Math.random();
    if (random < 0.5) {
        throw new Error("Operation failed!");
    }
    return "Success!";
}

try {
    const result = riskyOperation();
    console.log("Result:", result);
} catch (error) {
    console.error("Caught error:", error.message);
} finally {
    console.log("This always runs");
}

// Nested try-catch
function complexOperation() {
    try {
        // Outer operation
        console.log("Starting complex operation...");

        try {
            // Inner operation that might fail
            const data = JSON.parse('{"invalid": json}'); // This will throw
            return data;
        } catch (parseError) {
            console.log("JSON parse failed, using default data");
            return { default: true };
        }
    } catch (outerError) {
        console.error("Outer operation failed:", outerError);
        throw outerError; // Re-throw
    } finally {
        console.log("Cleaning up complex operation");
    }
}

// Error types and custom errors
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
    }
}

class NetworkError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = "NetworkError";
        this.statusCode = statusCode;
    }
}

function validateUser(user) {
    if (!user.name) {
        throw new ValidationError("Name is required", "name");
    }
    if (!user.email || !user.email.includes("@")) {
        throw new ValidationError("Valid email is required", "email");
    }
    if (user.age < 0 || user.age > 150) {
        throw new ValidationError("Age must be between 0 and 150", "age");
    }
    return true;
}

// Specific error handling
function handleUserValidation(user) {
    try {
        validateUser(user);
        console.log("User is valid");
    } catch (error) {
        if (error instanceof ValidationError) {
            console.error(
                `Validation failed for ${error.field}: ${error.message}`
            );
        } else if (error instanceof NetworkError) {
            console.error(
                `Network error (${error.statusCode}): ${error.message}`
            );
        } else {
            console.error("Unexpected error:", error);
        }
    }
}

// Test different error scenarios
handleUserValidation({}); // ValidationError: name
handleUserValidation({ name: "John", email: "invalid" }); // ValidationError: email
handleUserValidation({ name: "John", email: "john@example.com", age: 200 }); // ValidationError: age
handleUserValidation({ name: "John", email: "john@example.com", age: 30 }); // Valid
```

### Async Error Handling

```javascript
// Async/await error handling
async function fetchUserWithErrorHandling(userId) {
    try {
        const response = await fetch(
            `https://jsonplaceholder.typicode.com/users/${userId}`
        );

        if (!response.ok) {
            throw new NetworkError(
                `Failed to fetch user: ${response.statusText}`,
                response.status
            );
        }

        const user = await response.json();

        // Validate the response
        if (!user.id || !user.name) {
            throw new ValidationError("Invalid user data received");
        }

        return user;
    } catch (error) {
        if (error instanceof NetworkError) {
            console.error("Network issue:", error.message);
            // Maybe return cached data or default user
            return { id: userId, name: "Unknown User", cached: true };
        } else if (error instanceof ValidationError) {
            console.error("Data validation failed:", error.message);
            throw error; // Re-throw validation errors
        } else {
            console.error("Unexpected error:", error);
            throw new Error("Failed to fetch user data");
        }
    }
}

// Promise error handling
function promiseErrorHandling() {
    fetchDataPromise()
        .then((data) => {
            console.log("Data received:", data);
            return processData(data);
        })
        .then((processedData) => {
            console.log("Data processed:", processedData);
        })
        .catch((error) => {
            // This catches errors from any step in the chain
            console.error("Promise chain error:", error);
        });
}

// Unhandled promise rejection handling
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // Application specific logging, throwing an error, or other logic here
});

// Error boundaries simulation (React-like pattern)
function errorBoundary(fn) {
    return function (...args) {
        try {
            const result = fn.apply(this, args);

            // Handle promise rejections
            if (result && typeof result.catch === "function") {
                return result.catch((error) => {
                    console.error("Error boundary caught async error:", error);
                    return { error: true, message: error.message };
                });
            }

            return result;
        } catch (error) {
            console.error("Error boundary caught sync error:", error);
            return { error: true, message: error.message };
        }
    };
}

// Usage
const safeRiskyOperation = errorBoundary(riskyOperation);
const safeAsyncOperation = errorBoundary(fetchUserWithErrorHandling);

console.log(safeRiskyOperation()); // Either success or error object
safeAsyncOperation(1).then(console.log); // Either user data or error object
```

### Error Recovery and Retry Mechanisms

```javascript
// Exponential backoff retry
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === maxRetries) {
                break; // Last attempt failed
            }

            const delay = baseDelay * Math.pow(2, attempt);
            console.log(
                `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw new Error(
        `All ${maxRetries + 1} attempts failed. Last error: ${
            lastError.message
        }`
    );
}

// Circuit breaker pattern
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    }

    async execute(fn) {
        if (this.state === "OPEN") {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = "HALF_OPEN";
            } else {
                throw new Error("Circuit breaker is OPEN");
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        this.state = "CLOSED";
    }

    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.threshold) {
            this.state = "OPEN";
        }
    }
}

// Usage
const circuitBreaker = new CircuitBreaker(3, 5000); // 3 failures, 5s timeout

async function unreliableService() {
    if (Math.random() < 0.7) {
        // 70% failure rate
        throw new Error("Service unavailable");
    }
    return "Service response";
}

// Test circuit breaker
async function testCircuitBreaker() {
    for (let i = 0; i < 10; i++) {
        try {
            const result = await circuitBreaker.execute(unreliableService);
            console.log(`Call ${i + 1}: ${result}`);
        } catch (error) {
            console.log(`Call ${i + 1}: ${error.message}`);
        }

        await delay(1000); // Wait between calls
    }
}

// Error aggregation
class ErrorCollector {
    constructor() {
        this.errors = [];
    }

    add(error, context = {}) {
        this.errors.push({
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context,
        });
    }

    hasErrors() {
        return this.errors.length > 0;
    }

    getErrors() {
        return [...this.errors];
    }

    clear() {
        this.errors = [];
    }

    report() {
        if (this.hasErrors()) {
            console.log("Error Report:");
            this.errors.forEach((errorInfo, index) => {
                console.log(
                    `${index + 1}. ${errorInfo.error} at ${errorInfo.timestamp}`
                );
                if (Object.keys(errorInfo.context).length > 0) {
                    console.log("   Context:", errorInfo.context);
                }
            });
        }
    }
}

// Graceful degradation example
async function robustDataFetcher(userId) {
    const errorCollector = new ErrorCollector();
    let userData = null;
    let userPosts = [];
    let userComments = [];

    // Try to fetch user data
    try {
        userData = await fetchUserWithErrorHandling(userId);
    } catch (error) {
        errorCollector.add(error, { operation: "fetchUser", userId });
        userData = { id: userId, name: "Unknown User", fallback: true };
    }

    // Try to fetch user posts
    try {
        userPosts = await fetchUserPostsPromise(userId);
    } catch (error) {
        errorCollector.add(error, { operation: "fetchPosts", userId });
        // Continue with empty posts
    }

    // Try to fetch comments if we have posts
    if (userPosts.length > 0) {
        try {
            userComments = await fetchPostCommentsPromise(userPosts[0].id);
        } catch (error) {
            errorCollector.add(error, {
                operation: "fetchComments",
                postId: userPosts[0].id,
            });
            // Continue with empty comments
        }
    }

    // Report any errors but still return data
    if (errorCollector.hasErrors()) {
        console.warn("Some operations failed:");
        errorCollector.report();
    }

    return {
        user: userData,
        posts: userPosts,
        comments: userComments,
        hasErrors: errorCollector.hasErrors(),
        errors: errorCollector.getErrors(),
    };
}
```

---

**This concludes Phase 2 of the JavaScript Logic guide. The next phase will cover Regular Expressions, ES6+ Features, Advanced Problem Solving patterns, and interview-specific coding challenges.**
