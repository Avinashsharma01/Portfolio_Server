# Chapter 10: async/await Deep Dive

> **Understanding async/await as Syntactic Sugar Over Promises**

---

## 🎯 What You'll Learn

- What async/await actually is (not magic!)
- How async functions transform into Promise-based code
- The mechanics of `await` and when code pauses
- Error handling with async/await
- Common patterns and pitfalls
- Performance considerations

---

## 📖 The Core Insight

**async/await is NOT a new concurrency model.** It's syntactic sugar that makes Promise-based code look synchronous.

```javascript
// These two are EQUIVALENT:

// Promise version
function fetchUserData(id) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
    .then(user => {
      console.log(user);
      return user;
    });
}

// async/await version
async function fetchUserData(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  console.log(user);
  return user;
}
```

Both use Promises under the hood. `await` doesn't block the thread—it just looks like it does!

---

## ⚙️ How async Functions Work

### The async Keyword

When you add `async` to a function:

```javascript
async function greet() {
  return "Hello";
}

// Is transformed to:
function greet() {
  return Promise.resolve("Hello");
}
```

**Every async function returns a Promise!**

```javascript
async function example() {
  return 42;
}

const result = example();
console.log(result);  // Promise { <fulfilled>: 42 }
console.log(result instanceof Promise);  // true

result.then(value => console.log(value));  // 42
```

### What About Throwing?

```javascript
async function failing() {
  throw new Error("Oops");
}

// Is transformed to:
function failing() {
  return Promise.reject(new Error("Oops"));
}

failing().catch(err => console.log(err.message));  // "Oops"
```

---

## ⏸️ How await Works

### The Transformation

```javascript
async function example() {
  console.log("1");
  const result = await somePromise;
  console.log("2");
  return result;
}
```

**What the engine sees:**

```javascript
function example() {
  return new Promise((resolve, reject) => {
    console.log("1");  // Runs synchronously
    
    somePromise
      .then(result => {
        console.log("2");  // Runs as microtask
        resolve(result);
      })
      .catch(reject);
  });
}
```

### Visual Breakdown

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AWAIT TRANSFORMATION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   async function getData() {                                                │
│     console.log("A");        // SYNC                                        │
│     const x = await fetch(); // SPLIT POINT                                 │
│     console.log("B");        // AFTER AWAIT (microtask)                    │
│     return x;                // AFTER AWAIT (microtask)                    │
│   }                                                                         │
│                                                                             │
│   ════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│   Transformed to (conceptually):                                            │
│                                                                             │
│   function getData() {                                                      │
│     console.log("A");        // ← SYNC                                     │
│                                                                             │
│     return fetch().then(x => {   // ← Everything after await               │
│       console.log("B");          //   goes into .then()                    │
│       return x;                                                             │
│     });                                                                     │
│   }                                                                         │
│                                                                             │
│   The await SPLITS the function into:                                       │
│   • BEFORE await → runs synchronously                                       │
│   • AFTER await → runs as microtask when Promise resolves                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Execution Order Deep Dive

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');
async1();
console.log('script end');
```

**Output:**
```
script start
async1 start
async2
script end
async1 end
```

**Step-by-step:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXECUTION TRACE                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   STEP 1: console.log('script start')                                       │
│   ├── Synchronous                                                           │
│   └── Output: "script start"                                               │
│                                                                             │
│   STEP 2: async1() called                                                   │
│   ├── console.log('async1 start') → Output: "async1 start"                │
│   │                                                                         │
│   ├── await async2()                                                        │
│   │   └── async2() called                                                   │
│   │       └── console.log('async2') → Output: "async2"                     │
│   │       └── async2 returns Promise.resolve(undefined)                     │
│   │                                                                         │
│   └── PAUSE HERE! await suspends async1                                    │
│       └── Remainder of async1 → Microtask Queue                            │
│                                                                             │
│   STEP 3: console.log('script end')                                         │
│   ├── Synchronous (async1 is paused, not blocking)                         │
│   └── Output: "script end"                                                 │
│                                                                             │
│   STEP 4: Script finishes, check Microtask Queue                            │
│   ├── async1's continuation runs                                            │
│   └── console.log('async1 end') → Output: "async1 end"                    │
│                                                                             │
│   KEY INSIGHT: Code AFTER await runs as a microtask!                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ❌ Error Handling

### try/catch with async/await

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Failed to fetch:', error.message);
    throw error;  // Re-throw if you want caller to handle it
  }
}
```

### How try/catch Transforms

```javascript
// async/await version
async function example() {
  try {
    const result = await mightFail();
    return result;
  } catch (error) {
    console.log("Caught:", error);
  }
}

// Promise equivalent
function example() {
  return mightFail()
    .then(result => result)
    .catch(error => {
      console.log("Caught:", error);
    });
}
```

### Error Propagation

```javascript
async function level1() {
  throw new Error("Oops");
}

async function level2() {
  await level1();  // Error propagates up
}

async function level3() {
  try {
    await level2();
  } catch (error) {
    console.log("Caught at level3:", error.message);
  }
}

level3();  // "Caught at level3: Oops"
```

### Common Mistake: Unhandled Promise Rejections

```javascript
// ❌ BAD: Unhandled rejection
async function fetchData() {
  const data = await fetch('/api/data');  // Might fail
  return data.json();
}

fetchData();  // If this fails, we get an unhandled rejection

// ✅ GOOD: Handle the error
fetchData()
  .catch(error => console.error("Failed:", error));

// ✅ OR: Use try/catch at the call site
async function main() {
  try {
    await fetchData();
  } catch (error) {
    console.error("Failed:", error);
  }
}
```

---

## 🔀 Sequential vs Parallel Execution

### Sequential (One After Another)

```javascript
async function sequential() {
  const user = await fetchUser(1);    // Wait for this...
  const posts = await fetchPosts(1);  // Then this...
  const comments = await fetchComments(1);  // Then this...
  
  return { user, posts, comments };
}

// Timeline:
// |--user--|--posts--|--comments--|
// Total: sum of all times
```

### Parallel (All at Once)

```javascript
async function parallel() {
  // Start all requests simultaneously
  const userPromise = fetchUser(1);
  const postsPromise = fetchPosts(1);
  const commentsPromise = fetchComments(1);
  
  // Wait for all to complete
  const [user, posts, comments] = await Promise.all([
    userPromise,
    postsPromise,
    commentsPromise
  ]);
  
  return { user, posts, comments };
}

// Timeline:
// |--user--|
// |--posts--|
// |--comments--|
// Total: max of all times
```

**Visual Comparison:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SEQUENTIAL vs PARALLEL                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SEQUENTIAL (await one by one):                                            │
│                                                                             │
│   Time ───────────────────────────────────────────────────────────▶         │
│   │ fetchUser ████████ │ fetchPosts ████████ │ fetchComments ████ │        │
│   0s                  2s                    4s                   6s         │
│                                                                             │
│   Total: 6 seconds                                                          │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   PARALLEL (Promise.all):                                                   │
│                                                                             │
│   Time ───────────────────────────────────────────────────────────▶         │
│   │ fetchUser ████████                                            │         │
│   │ fetchPosts ████████                                           │         │
│   │ fetchComments ████                                            │         │
│   0s                  2s                                                    │
│                                                                             │
│   Total: 2 seconds (longest request)                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### When to Use Which

```javascript
// Use SEQUENTIAL when:
// - Second request depends on first result
async function getPostsForUser(userId) {
  const user = await fetchUser(userId);       // Need user first
  const posts = await fetchPosts(user.blogId); // Uses user's blogId
  return posts;
}

// Use PARALLEL when:
// - Requests are independent
async function getDashboardData(userId) {
  const [user, notifications, settings] = await Promise.all([
    fetchUser(userId),
    fetchNotifications(userId),
    fetchSettings(userId)
  ]);
  return { user, notifications, settings };
}
```

---

## 🔄 Async Iteration

### for await...of

```javascript
// Async generator
async function* generateNumbers() {
  for (let i = 1; i <= 3; i++) {
    await delay(1000);
    yield i;
  }
}

// Consume with for await...of
async function consumeNumbers() {
  for await (const num of generateNumbers()) {
    console.log(num);  // 1, then 2, then 3 (1 second apart)
  }
}
```

### Processing Streams

```javascript
async function readStream(stream) {
  const reader = stream.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      console.log('Received chunk:', value);
    }
  } finally {
    reader.releaseLock();
  }
}
```

---

## ⚠️ Common Pitfalls

### Pitfall 1: await in a Loop (Sequential when you want Parallel)

```javascript
// ❌ BAD: Sequential processing
async function processItems(items) {
  const results = [];
  for (const item of items) {
    const result = await processItem(item);  // Waits for each!
    results.push(result);
  }
  return results;
}

// ✅ GOOD: Parallel processing
async function processItems(items) {
  const promises = items.map(item => processItem(item));
  return Promise.all(promises);
}
```

### Pitfall 2: forEach Doesn't Work with await

```javascript
// ❌ BAD: forEach doesn't wait
async function processItems(items) {
  items.forEach(async (item) => {
    await processItem(item);  // These run in parallel, uncontrolled!
  });
  console.log('Done');  // This runs immediately, not after processing!
}

// ✅ GOOD: Use for...of or Promise.all
async function processItems(items) {
  for (const item of items) {
    await processItem(item);  // Sequential
  }
  console.log('Done');
}

// OR for parallel:
async function processItems(items) {
  await Promise.all(items.map(async (item) => {
    await processItem(item);
  }));
  console.log('Done');
}
```

### Pitfall 3: Not Awaiting a Promise

```javascript
// ❌ BAD: Missing await
async function example() {
  const dataPromise = fetchData();  // Returns Promise, not data!
  console.log(dataPromise);  // Promise { <pending> }
  
  // Trying to use it as if it's resolved
  console.log(dataPromise.name);  // undefined!
}

// ✅ GOOD: Await the Promise
async function example() {
  const data = await fetchData();  // Now it's the actual data
  console.log(data.name);  // Works!
}
```

### Pitfall 4: Return vs Return Await

```javascript
// These are subtly different in try/catch!

async function returnPromise() {
  try {
    return fetchData();  // Returns the Promise directly
  } catch (error) {
    // This catch will NOT catch errors from fetchData!
    console.log("Won't catch");
  }
}

async function returnAwaitPromise() {
  try {
    return await fetchData();  // Awaits, THEN returns
  } catch (error) {
    // This catch WILL catch errors from fetchData
    console.log("Will catch:", error);
  }
}
```

---

## 🎯 Patterns and Best Practices

### Pattern 1: Async IIFE

```javascript
// Top-level await (modern environments) or use IIFE

// Modern (ES2022+, modules):
const data = await fetchData();

// Older environments:
(async () => {
  const data = await fetchData();
  console.log(data);
})();
```

### Pattern 2: Retry Logic

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`Attempt ${attempt} failed, retrying...`);
      await delay(1000 * attempt);  // Exponential backoff
    }
  }
}
```

### Pattern 3: Timeout

```javascript
function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
}

async function fetchWithTimeout(url, ms = 5000) {
  return Promise.race([
    fetch(url),
    timeout(ms)
  ]);
}
```

### Pattern 4: Concurrent Limit

```javascript
async function processWithLimit(items, limit, processor) {
  const results = [];
  const executing = [];
  
  for (const item of items) {
    const promise = processor(item).then(result => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });
    
    results.push(promise);
    executing.push(promise);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

// Process 100 items, max 5 concurrent
await processWithLimit(items, 5, async (item) => {
  return await processItem(item);
});
```

---

## 📊 Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ASYNC/AWAIT SUMMARY                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ASYNC FUNCTION:                                                           │
│   ├── Always returns a Promise                                              │
│   ├── return value → Promise.resolve(value)                                │
│   └── throw error → Promise.reject(error)                                  │
│                                                                             │
│   AWAIT:                                                                    │
│   ├── Can only be used inside async functions (or top-level modules)       │
│   ├── Pauses function execution until Promise resolves                     │
│   ├── Code after await runs as a MICROTASK                                 │
│   └── Doesn't actually block the thread                                    │
│                                                                             │
│   TRANSFORMATION:                                                           │
│   ├── Code before await → synchronous                                       │
│   ├── await expression → like .then()                                      │
│   └── Code after await → inside .then() callback                           │
│                                                                             │
│   ERROR HANDLING:                                                           │
│   ├── Use try/catch around await                                           │
│   ├── Errors propagate up like synchronous code                            │
│   └── Unhandled rejections if not caught                                   │
│                                                                             │
│   PARALLEL vs SEQUENTIAL:                                                   │
│   ├── Sequential: await one after another                                   │
│   ├── Parallel: Promise.all() with multiple awaits                         │
│   └── Choose based on dependencies                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Key Takeaways

1. **async/await is syntactic sugar** over Promises—same mechanism underneath
2. **async functions always return Promises** even if you return a plain value
3. **await splits the function** into sync (before) and microtask (after)
4. **Use try/catch** for error handling with await
5. **Watch for sequential vs parallel** - don't accidentally make things slow
6. **forEach doesn't work with await** - use for...of or Promise.all + map

---

## ➡️ Next Chapter

Now let's bring everything together and see how all these pieces work as one unified system.

**[Continue to Chapter 11: Everything Connected →](./11-Everything-Connected.md)**
