# Chapter 08: Promises Lifecycle

> **Understanding How Promises Work Internally**

---

## 🎯 What You'll Learn

- What a Promise actually is (internal structure)
- The three states and state transitions
- How `.then()`, `.catch()`, and `.finally()` work
- Promise chaining mechanics
- Common patterns and anti-patterns
- Creating Promises from scratch

---

## 📖 What is a Promise?

A Promise is an **object** representing the eventual completion (or failure) of an asynchronous operation and its resulting value.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROMISE INTERNAL STRUCTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   const promise = new Promise((resolve, reject) => { ... });                │
│                                                                             │
│   Internally, a Promise object contains:                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                                                                     │  │
│   │   [[PromiseState]]:  "pending" | "fulfilled" | "rejected"          │  │
│   │                                                                     │  │
│   │   [[PromiseResult]]:  undefined | resolved value | rejection reason │  │
│   │                                                                     │  │
│   │   [[PromiseFulfillReactions]]:  [ list of .then() callbacks ]      │  │
│   │                                                                     │  │
│   │   [[PromiseRejectReactions]]:   [ list of .catch() callbacks ]     │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   These are INTERNAL slots - you can't access them directly                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 The Three States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROMISE STATE MACHINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         ┌─────────────────┐                                 │
│                         │                 │                                 │
│                         │    PENDING      │                                 │
│                         │                 │                                 │
│                         │  Initial state  │                                 │
│                         │  Operation in   │                                 │
│                         │  progress       │                                 │
│                         │                 │                                 │
│                         └────────┬────────┘                                 │
│                                  │                                          │
│                    ┌─────────────┴─────────────┐                            │
│                    │                           │                            │
│             resolve(value)              reject(reason)                      │
│                    │                           │                            │
│                    ▼                           ▼                            │
│         ┌─────────────────┐         ┌─────────────────┐                    │
│         │                 │         │                 │                    │
│         │   FULFILLED     │         │   REJECTED      │                    │
│         │                 │         │                 │                    │
│         │  Operation      │         │  Operation      │                    │
│         │  succeeded      │         │  failed         │                    │
│         │                 │         │                 │                    │
│         │  value = result │         │  reason = error │                    │
│         │                 │         │                 │                    │
│         └─────────────────┘         └─────────────────┘                    │
│                                                                             │
│   IMPORTANT: Once settled (fulfilled/rejected), state CANNOT change!        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### State Transitions in Code

```javascript
// PENDING → FULFILLED
const fulfilled = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Success!");  // State: pending → fulfilled
  }, 1000);
});

// PENDING → REJECTED
const rejected = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error("Failed!"));  // State: pending → rejected
  }, 1000);
});

// IMMEDIATELY FULFILLED
const immediate = Promise.resolve("Already done");  // Starts fulfilled

// IMMEDIATELY REJECTED
const failed = Promise.reject(new Error("Already failed"));  // Starts rejected
```

### State is Immutable Once Settled

```javascript
const promise = new Promise((resolve, reject) => {
  resolve("First");   // State changes to fulfilled
  resolve("Second");  // IGNORED - already settled
  reject("Error");    // IGNORED - already settled
});

promise.then(value => console.log(value));  // "First"
```

---

## 🔗 The .then() Method

`.then()` registers callbacks for when the Promise settles.

```javascript
promise.then(onFulfilled, onRejected);
```

### Internal Mechanics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HOW .then() WORKS INTERNALLY                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   const promise = fetch('/api/data');                                       │
│   const nextPromise = promise.then(handleSuccess, handleError);             │
│                                                                             │
│   What happens:                                                             │
│                                                                             │
│   1. .then() creates a NEW Promise (nextPromise)                           │
│                                                                             │
│   2. If promise is PENDING:                                                 │
│      ┌─────────────────────────────────────────────────────────────────┐   │
│      │  Callbacks stored in promise's internal reaction lists          │   │
│      │  [[PromiseFulfillReactions]].push(handleSuccess)                │   │
│      │  [[PromiseRejectReactions]].push(handleError)                   │   │
│      │  They'll run later when promise settles                         │   │
│      └─────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   3. If promise is already FULFILLED:                                       │
│      ┌─────────────────────────────────────────────────────────────────┐   │
│      │  handleSuccess is scheduled as a MICROTASK                      │   │
│      │  queueMicrotask(() => handleSuccess(promise.[[PromiseResult]])) │   │
│      └─────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   4. If promise is already REJECTED:                                        │
│      ┌─────────────────────────────────────────────────────────────────┐   │
│      │  handleError is scheduled as a MICROTASK                        │   │
│      │  queueMicrotask(() => handleError(promise.[[PromiseResult]]))   │   │
│      └─────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   5. nextPromise is resolved/rejected based on callback return value       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Callback is Always Async

```javascript
// Even with immediately resolved Promises, callbacks run asynchronously
const resolved = Promise.resolve("Immediate");

console.log("1. Before .then()");

resolved.then(value => {
  console.log("3. Inside .then():", value);
});

console.log("2. After .then()");

// Output:
// 1. Before .then()
// 2. After .then()
// 3. Inside .then(): Immediate
```

---

## ⛓️ Promise Chaining

Each `.then()` returns a NEW Promise, enabling chaining:

```javascript
fetch('/api/user')
  .then(response => response.json())     // Returns Promise
  .then(user => fetch(`/api/posts/${user.id}`))  // Returns Promise
  .then(response => response.json())     // Returns Promise
  .then(posts => console.log(posts))     // Returns Promise (resolved with undefined)
  .catch(error => console.error(error)); // Catches any error in the chain
```

### Chain Mechanics Visualized

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROMISE CHAIN MECHANICS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   fetch('/api/user')                                                        │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────┐                                                               │
│   │Promise 1│ ──.then(response => response.json())──▶ ┌─────────┐          │
│   └─────────┘                                         │Promise 2│          │
│                                                       └────┬────┘          │
│                                                            │               │
│   Promise 2 resolves to what response.json() returns       │               │
│   (which is another Promise that resolves to parsed JSON)  │               │
│                                                            ▼               │
│                          .then(user => fetch(...)) ──▶ ┌─────────┐         │
│                                                        │Promise 3│         │
│                                                        └────┬────┘         │
│                                                             │              │
│   Promise 3 resolves when the inner fetch resolves         │               │
│                                                             ▼              │
│                          .then(response => ...) ──▶ ┌─────────┐           │
│                                                     │Promise 4│           │
│                                                     └────┬────┘           │
│                                                          │                │
│                                                          ▼                │
│                                                       ... and so on       │
│                                                                             │
│   KEY INSIGHT: Each .then() waits for the RETURNED value to resolve        │
│   If you return a Promise, the chain waits for that Promise                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What the Callback Returns Matters

```javascript
Promise.resolve(1)
  .then(x => x + 1)           // Returns number 2
  .then(x => {                // Receives 2
    console.log(x);           // 2
    // No return = returns undefined
  })
  .then(x => {
    console.log(x);           // undefined
    return Promise.resolve(10);  // Returns a Promise
  })
  .then(x => {
    console.log(x);           // 10 (waited for Promise to resolve)
    throw new Error("Oops");  // Throws = Promise rejects
  })
  .then(x => {
    console.log("Never runs");  // Skipped due to rejection
  })
  .catch(err => {
    console.log(err.message);   // "Oops"
    return "Recovered";         // Catch can return value
  })
  .then(x => {
    console.log(x);             // "Recovered"
  });
```

---

## ❌ Error Handling

### .catch() is Just .then(null, onRejected)

```javascript
promise.catch(handleError);
// Is exactly the same as:
promise.then(null, handleError);
```

### Error Propagation

```javascript
Promise.reject(new Error("Initial error"))
  .then(x => console.log("1:", x))   // Skipped
  .then(x => console.log("2:", x))   // Skipped
  .then(x => console.log("3:", x))   // Skipped
  .catch(err => {
    console.log("Caught:", err.message);  // "Caught: Initial error"
    // Error is now handled, chain continues normally
  })
  .then(x => console.log("4: Continues"));  // "4: Continues"
```

**Error Flow:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ERROR PROPAGATION                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Promise.reject(error)                                                     │
│        │                                                                    │
│        │ (rejected)                                                         │
│        ▼                                                                    │
│   .then(success)  ──────────────▶  SKIPPED (no reject handler)             │
│        │                                                                    │
│        │ (still rejected)                                                   │
│        ▼                                                                    │
│   .then(success)  ──────────────▶  SKIPPED (no reject handler)             │
│        │                                                                    │
│        │ (still rejected)                                                   │
│        ▼                                                                    │
│   .catch(handleError)  ──────────▶  HANDLES ERROR                          │
│        │                                                                    │
│        │ (now fulfilled, with catch's return value)                         │
│        ▼                                                                    │
│   .then(success)  ──────────────▶  RUNS NORMALLY                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Re-throwing Errors

```javascript
Promise.reject(new Error("Original"))
  .catch(err => {
    console.log("Logged:", err.message);
    throw err;  // Re-throw to continue rejection
  })
  .then(() => console.log("Won't run"))
  .catch(err => {
    console.log("Second catch:", err.message);
  });

// Output:
// Logged: Original
// Second catch: Original
```

---

## 🏁 .finally()

`.finally()` runs regardless of outcome, doesn't receive a value, and passes through the result:

```javascript
Promise.resolve("Success")
  .finally(() => {
    console.log("Cleanup");  // Runs
    // Return value is IGNORED (unless it's a rejection)
  })
  .then(value => console.log(value));  // "Success" (passed through)

Promise.reject(new Error("Failed"))
  .finally(() => {
    console.log("Cleanup");  // Still runs!
  })
  .catch(err => console.log(err.message));  // "Failed" (passed through)
```

---

## 🛠️ Creating Promises

### The Promise Constructor

```javascript
const promise = new Promise((resolve, reject) => {
  // This function (executor) runs SYNCHRONOUSLY!
  
  console.log("Executor runs immediately");
  
  // Async operation
  setTimeout(() => {
    const success = Math.random() > 0.5;
    
    if (success) {
      resolve("It worked!");
    } else {
      reject(new Error("It failed!"));
    }
  }, 1000);
});

console.log("After Promise creation");

// Output:
// Executor runs immediately
// After Promise creation
// (after 1 second) either success or failure
```

### The Executor is Synchronous!

```javascript
console.log("1");

new Promise((resolve) => {
  console.log("2");  // Runs synchronously!
  resolve();
});

console.log("3");

// Output:
// 1
// 2
// 3
```

### Promise.resolve() and Promise.reject()

```javascript
// Create pre-resolved Promise
const resolved = Promise.resolve(42);
// Equivalent to:
// new Promise(resolve => resolve(42))

// Create pre-rejected Promise
const rejected = Promise.reject(new Error("Nope"));
// Equivalent to:
// new Promise((_, reject) => reject(new Error("Nope")))

// Special: Passing a Promise to Promise.resolve
const original = new Promise(r => setTimeout(() => r(10), 1000));
const wrapped = Promise.resolve(original);
console.log(wrapped === original);  // true! Not wrapped, returns same Promise
```

---

## 🔀 Promise Static Methods

### Promise.all()

Waits for ALL promises to fulfill (or ANY to reject):

```javascript
const promises = [
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
];

Promise.all(promises)
  .then(([users, posts, comments]) => {
    // All three completed successfully
    console.log(users, posts, comments);
  })
  .catch(error => {
    // ANY failure rejects the whole thing
    console.error("One failed:", error);
  });
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Promise.all() BEHAVIOR                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Promise.all([p1, p2, p3])                                                │
│                                                                             │
│   CASE 1: All fulfill                                                       │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                                │
│   │ p1: ✓    │  │ p2: ✓    │  │ p3: ✓    │                                │
│   └──────────┘  └──────────┘  └──────────┘                                │
│          └──────────┴──────────┴──────────▶ FULFILLS with [r1, r2, r3]    │
│                                                                             │
│   CASE 2: Any rejects                                                       │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                                │
│   │ p1: ✓    │  │ p2: ✗    │  │ p3: ...  │                                │
│   └──────────┘  └──────────┘  └──────────┘                                │
│                      │                                                     │
│                      └────────────────────▶ REJECTS with p2's error       │
│                                              (p1's result lost, p3 ignored)│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Promise.allSettled()

Waits for ALL promises to settle (no short-circuit on rejection):

```javascript
const promises = [
  Promise.resolve("Success"),
  Promise.reject(new Error("Failed")),
  Promise.resolve("Another success")
];

Promise.allSettled(promises).then(results => {
  console.log(results);
  // [
  //   { status: "fulfilled", value: "Success" },
  //   { status: "rejected", reason: Error("Failed") },
  //   { status: "fulfilled", value: "Another success" }
  // ]
});
```

### Promise.race()

Returns when FIRST promise settles (wins or fails):

```javascript
const timeout = new Promise((_, reject) => {
  setTimeout(() => reject(new Error("Timeout")), 5000);
});

const fetchData = fetch('/api/data');

Promise.race([fetchData, timeout])
  .then(response => console.log("Got data"))
  .catch(error => console.log(error.message));  // "Timeout" if fetch takes > 5s
```

### Promise.any()

Returns when FIRST promise FULFILLS (ignores rejections until all fail):

```javascript
const promises = [
  fetch('https://server1.com/api'),  // Might fail
  fetch('https://server2.com/api'),  // Might fail
  fetch('https://server3.com/api')   // Might succeed
];

Promise.any(promises)
  .then(firstSuccess => console.log("Got from:", firstSuccess))
  .catch(errors => {
    // Only if ALL fail - errors is AggregateError
    console.log("All failed:", errors.errors);
  });
```

---

## ⚠️ Common Anti-Patterns

### Anti-Pattern 1: Nested Promises

```javascript
// ❌ BAD: Nested promises (callback hell returns!)
getUserId()
  .then(id => {
    getUser(id).then(user => {
      getPosts(user).then(posts => {
        console.log(posts);
      });
    });
  });

// ✅ GOOD: Flat chain
getUserId()
  .then(id => getUser(id))
  .then(user => getPosts(user))
  .then(posts => console.log(posts));
```

### Anti-Pattern 2: Forgetting to Return

```javascript
// ❌ BAD: Missing return
Promise.resolve(1)
  .then(x => {
    fetch('/api');  // Returns Promise, but not returned!
  })
  .then(result => {
    console.log(result);  // undefined (not the fetch result)
  });

// ✅ GOOD: Return the Promise
Promise.resolve(1)
  .then(x => {
    return fetch('/api');  // Return the Promise
  })
  .then(result => {
    console.log(result);  // Fetch Response
  });
```

### Anti-Pattern 3: The Explicit Promise Constructor Anti-Pattern

```javascript
// ❌ BAD: Wrapping existing Promise in new Promise
function getData() {
  return new Promise((resolve, reject) => {
    fetch('/api/data')
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
}

// ✅ GOOD: Just return the Promise
function getData() {
  return fetch('/api/data');
}
```

### Anti-Pattern 4: Not Handling Errors

```javascript
// ❌ BAD: Unhandled rejection
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data));
// If this fails, you get an "Unhandled Promise Rejection"

// ✅ GOOD: Handle errors
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Request failed:", error));
```

---

## 📊 Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROMISES SUMMARY                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   STATES:                                                                   │
│   ├── pending   → Initial state, operation in progress                     │
│   ├── fulfilled → Operation succeeded, has a value                          │
│   └── rejected  → Operation failed, has a reason                           │
│                                                                             │
│   METHODS:                                                                  │
│   ├── .then(onFulfilled, onRejected) → Handle success/failure              │
│   ├── .catch(onRejected)             → Handle failure (.then(null, fn))    │
│   └── .finally(onFinally)            → Run regardless, pass through result │
│                                                                             │
│   STATIC METHODS:                                                           │
│   ├── Promise.resolve(value)   → Create fulfilled Promise                  │
│   ├── Promise.reject(reason)   → Create rejected Promise                   │
│   ├── Promise.all([...])       → All must fulfill, first reject fails     │
│   ├── Promise.allSettled([...])→ Wait for all to settle                   │
│   ├── Promise.race([...])      → First to settle wins                      │
│   └── Promise.any([...])       → First to fulfill wins                     │
│                                                                             │
│   KEY INSIGHTS:                                                             │
│   ├── Executor runs synchronously                                           │
│   ├── .then() callbacks run as microtasks                                  │
│   ├── .then() always returns a new Promise                                 │
│   ├── Return value of callback becomes next Promise's value               │
│   └── Errors propagate until caught                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Key Takeaways

1. **Promises are objects** with internal state and reaction lists
2. **State is immutable** once settled (fulfilled or rejected)
3. **Callbacks are always async** (microtasks), even for resolved Promises
4. **Chaining works** by returning new Promises from each .then()
5. **Errors propagate** through the chain until caught
6. **Return matters** - forgot to return = lost Promise value

---

## ➡️ Next Chapter

Now let's explore how the browser provides Web APIs that work with JavaScript's async model.

**[Continue to Chapter 09: Web APIs & Browser Interaction →](./09-Web-APIs-Browser-Interaction.md)**
