# Chapter 06: Event Loop Internals

> **The Heart of Asynchronous JavaScript**

---

## 🎯 What You'll Learn

- What the Event Loop is and why it exists
- How the Event Loop algorithm works step by step
- The relationship between Call Stack, Task Queue, and Event Loop
- How to predict the execution order of asynchronous code
- Common Event Loop interview questions explained

---

## 📖 The Big Picture

The Event Loop is the mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE JAVASCRIPT RUNTIME                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                     JAVASCRIPT ENGINE                                │  │
│   │  ┌────────────────────────┐  ┌────────────────────────────────────┐ │  │
│   │  │      CALL STACK        │  │          MEMORY HEAP               │ │  │
│   │  │                        │  │                                    │ │  │
│   │  │  Where code executes   │  │   Where objects are stored         │ │  │
│   │  │  (one thing at a time) │  │                                    │ │  │
│   │  └────────────────────────┘  └────────────────────────────────────┘ │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                         │                                                   │
│                         │ Communicates via Event Loop                       │
│                         ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                     BROWSER / NODE.js ENVIRONMENT                    │  │
│   │                                                                      │  │
│   │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │  │
│   │  │   WEB APIs   │  │  CALLBACK    │  │       EVENT LOOP          │ │  │
│   │  │              │  │  QUEUE       │  │                           │ │  │
│   │  │  • setTimeout│  │  (Task Queue)│  │  ┌───────────────────┐   │ │  │
│   │  │  • fetch     │  │              │  │  │  Continuously     │   │ │  │
│   │  │  • DOM       │  │              │  │  │  checks:          │   │ │  │
│   │  │  • Events    │  │              │  │  │                   │   │ │  │
│   │  │              │  │              │  │  │  Is stack empty?  │   │ │  │
│   │  └──────────────┘  └──────────────┘  │  │  Is queue empty?  │   │ │  │
│   │                                       │  └───────────────────┘   │ │  │
│   │  ┌────────────────────────────────────────────────────────────┐ │ │  │
│   │  │           MICROTASK QUEUE                                   │ │ │  │
│   │  │  (Promises, queueMicrotask)                                 │ │ │  │
│   │  └────────────────────────────────────────────────────────────┘ │ │  │
│   │                                       └───────────────────────────┘ │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 The Event Loop Algorithm

Here's what the Event Loop does, continuously:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EVENT LOOP ALGORITHM                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   while (true) {                                                            │
│                                                                             │
│       // 1. Execute all synchronous code                                    │
│       while (callStack.isNotEmpty()) {                                      │
│           execute(callStack.pop());                                         │
│       }                                                                     │
│                                                                             │
│       // 2. Execute ALL microtasks                                          │
│       while (microtaskQueue.isNotEmpty()) {                                 │
│           execute(microtaskQueue.dequeue());                                │
│           // If microtask adds more microtasks, those run too!              │
│       }                                                                     │
│                                                                             │
│       // 3. Render (if browser & needed)                                    │
│       if (needsRender) {                                                    │
│           render();                                                         │
│       }                                                                     │
│                                                                             │
│       // 4. Execute ONE macrotask (if any)                                  │
│       if (macrotaskQueue.isNotEmpty()) {                                    │
│           execute(macrotaskQueue.dequeue());                                │
│       }                                                                     │
│                                                                             │
│       // 5. Go back to step 1                                               │
│   }                                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key insight**: The loop processes ALL microtasks before moving to the next macrotask.

---

## 📚 Step-by-Step Example

Let's trace through this code:

```javascript
console.log('1. Script start');

setTimeout(function() {
  console.log('2. setTimeout');
}, 0);

Promise.resolve().then(function() {
  console.log('3. Promise 1');
}).then(function() {
  console.log('4. Promise 2');
});

console.log('5. Script end');
```

**Output:**
```
1. Script start
5. Script end
3. Promise 1
4. Promise 2
2. setTimeout
```

**Let's trace why:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXECUTION TRACE                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   INITIAL STATE:                                                            │
│   Call Stack: [script]                                                      │
│   Microtask Queue: []                                                       │
│   Macrotask Queue: []                                                       │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   STEP 1: console.log('1. Script start')                                    │
│   ┌─────────────────┐                                                       │
│   │  console.log    │   Output: "1. Script start"                          │
│   ├─────────────────┤                                                       │
│   │     script      │                                                       │
│   └─────────────────┘                                                       │
│   Microtask Queue: []                                                       │
│   Macrotask Queue: []                                                       │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   STEP 2: setTimeout(..., 0)                                                │
│   ┌─────────────────┐                                                       │
│   │   setTimeout    │   → Registers callback with Web API                  │
│   ├─────────────────┤   → After 0ms, callback goes to Macrotask Queue      │
│   │     script      │                                                       │
│   └─────────────────┘                                                       │
│   Microtask Queue: []                                                       │
│   Macrotask Queue: [setTimeout callback]  ← Added here                     │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   STEP 3: Promise.resolve().then(...)                                       │
│   ┌─────────────────┐                                                       │
│   │Promise.resolve  │   → Returns resolved Promise                         │
│   │    .then()      │   → Callback goes to Microtask Queue                 │
│   ├─────────────────┤                                                       │
│   │     script      │                                                       │
│   └─────────────────┘                                                       │
│   Microtask Queue: [Promise 1 callback]  ← Added here                      │
│   Macrotask Queue: [setTimeout callback]                                   │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   STEP 4: console.log('5. Script end')                                      │
│   ┌─────────────────┐                                                       │
│   │  console.log    │   Output: "5. Script end"                            │
│   ├─────────────────┤                                                       │
│   │     script      │                                                       │
│   └─────────────────┘                                                       │
│   Microtask Queue: [Promise 1 callback]                                    │
│   Macrotask Queue: [setTimeout callback]                                   │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   STEP 5: Script finishes, Call Stack empty                                 │
│   ┌─────────────────┐                                                       │
│   │     (empty)     │   → Event Loop checks: Microtasks first!             │
│   └─────────────────┘                                                       │
│   Microtask Queue: [Promise 1 callback]  ← Process this first             │
│   Macrotask Queue: [setTimeout callback]                                   │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   STEP 6: Run Promise 1 callback                                            │
│   ┌─────────────────┐                                                       │
│   │Promise 1 cb     │   Output: "3. Promise 1"                             │
│   └─────────────────┘   → .then() adds Promise 2 to Microtask Queue        │
│   Microtask Queue: [Promise 2 callback]  ← New microtask added!            │
│   Macrotask Queue: [setTimeout callback]                                   │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   STEP 7: Run Promise 2 callback (still processing microtasks!)             │
│   ┌─────────────────┐                                                       │
│   │Promise 2 cb     │   Output: "4. Promise 2"                             │
│   └─────────────────┘                                                       │
│   Microtask Queue: []  ← Empty, can move to macrotasks                     │
│   Macrotask Queue: [setTimeout callback]                                   │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   STEP 8: Run setTimeout callback                                           │
│   ┌─────────────────┐                                                       │
│   │setTimeout cb    │   Output: "2. setTimeout"                            │
│   └─────────────────┘                                                       │
│   Microtask Queue: []                                                       │
│   Macrotask Queue: []  ← Empty, one iteration complete                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 The Event Loop Visualized

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EVENT LOOP VISUALIZATION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                           ┌─────────────────┐                               │
│                           │   CALL STACK    │                               │
│                           │   ┌─────────┐   │                               │
│                           │   │ func()  │   │                               │
│                           │   ├─────────┤   │                               │
│                           │   │ global  │   │                               │
│                           │   └─────────┘   │                               │
│                           └────────┬────────┘                               │
│                                    │                                        │
│                                    │ When empty                             │
│                                    ▼                                        │
│      ┌─────────────────────────────────────────────────────────────┐       │
│      │                       EVENT LOOP                             │       │
│      │  ╔═════════════════════════════════════════════════════════╗│       │
│      │  ║  1. Is Call Stack empty?                                ║│       │
│      │  ║     NO  → Wait                                          ║│       │
│      │  ║     YES → Continue                                      ║│       │
│      │  ║                                                         ║│       │
│      │  ║  2. Any Microtasks?                                     ║│       │
│      │  ║     YES → Execute ALL of them                           ║│       │
│      │  ║     NO  → Continue                                      ║│       │
│      │  ║                                                         ║│       │
│      │  ║  3. Render (browser only, if needed)                    ║│       │
│      │  ║                                                         ║│       │
│      │  ║  4. Any Macrotasks?                                     ║│       │
│      │  ║     YES → Execute ONE, go back to step 1                ║│       │
│      │  ║     NO  → Wait for tasks, go back to step 1             ║│       │
│      │  ╚═════════════════════════════════════════════════════════╝│       │
│      └─────────────────────────────────────────────────────────────┘       │
│                   ▲                              ▲                          │
│                   │                              │                          │
│          ┌────────┴────────┐            ┌───────┴────────┐                 │
│          │ MICROTASK QUEUE │            │ MACROTASK QUEUE│                 │
│          │                 │            │  (Task Queue)  │                 │
│          │ • Promise.then  │            │                │                 │
│          │ • queueMicro    │            │ • setTimeout   │                 │
│          │ • MutationObs   │            │ • setInterval  │                 │
│          │                 │            │ • I/O          │                 │
│          │                 │            │ • UI rendering │                 │
│          └─────────────────┘            └────────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 Complex Example: Nested Async

```javascript
console.log('1. Start');

setTimeout(() => {
  console.log('2. Timeout 1');
  Promise.resolve().then(() => {
    console.log('3. Promise inside Timeout');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4. Promise 1');
  setTimeout(() => {
    console.log('5. Timeout inside Promise');
  }, 0);
});

setTimeout(() => {
  console.log('6. Timeout 2');
}, 0);

console.log('7. End');
```

**Output:**
```
1. Start
7. End
4. Promise 1
2. Timeout 1
3. Promise inside Timeout
6. Timeout 2
5. Timeout inside Promise
```

**Trace through:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NESTED ASYNC TRACE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Phase 1: Synchronous execution                                            │
│   ─────────────────────────────────────────────────────────────────────     │
│   • console.log('1. Start')              → Output: "1. Start"              │
│   • setTimeout(...) [Timeout 1]          → Macrotask Queue                 │
│   • Promise.resolve().then(...)          → Microtask Queue                 │
│   • setTimeout(...) [Timeout 2]          → Macrotask Queue                 │
│   • console.log('7. End')                → Output: "7. End"                │
│                                                                             │
│   State after sync:                                                         │
│   Microtask Queue: [Promise 1]                                             │
│   Macrotask Queue: [Timeout 1, Timeout 2]                                  │
│                                                                             │
│   Phase 2: Process Microtasks                                               │
│   ─────────────────────────────────────────────────────────────────────     │
│   • Run Promise 1                        → Output: "4. Promise 1"          │
│     (This adds Timeout inside Promise to Macrotask Queue)                   │
│                                                                             │
│   State after microtasks:                                                   │
│   Microtask Queue: []                                                       │
│   Macrotask Queue: [Timeout 1, Timeout 2, Timeout inside Promise]          │
│                                                                             │
│   Phase 3: Process ONE Macrotask (Timeout 1)                                │
│   ─────────────────────────────────────────────────────────────────────     │
│   • Run Timeout 1                        → Output: "2. Timeout 1"          │
│     (This adds Promise inside Timeout to Microtask Queue)                   │
│                                                                             │
│   State:                                                                    │
│   Microtask Queue: [Promise inside Timeout]                                │
│   Macrotask Queue: [Timeout 2, Timeout inside Promise]                     │
│                                                                             │
│   Phase 4: Process Microtasks (before next macrotask!)                      │
│   ─────────────────────────────────────────────────────────────────────     │
│   • Run Promise inside Timeout           → Output: "3. Promise inside..."  │
│                                                                             │
│   Phase 5: Process ONE Macrotask (Timeout 2)                                │
│   ─────────────────────────────────────────────────────────────────────     │
│   • Run Timeout 2                        → Output: "6. Timeout 2"          │
│                                                                             │
│   Phase 6: Check Microtasks (none)                                          │
│                                                                             │
│   Phase 7: Process ONE Macrotask (Timeout inside Promise)                   │
│   ─────────────────────────────────────────────────────────────────────     │
│   • Run Timeout inside Promise           → Output: "5. Timeout inside..."  │
│                                                                             │
│   DONE!                                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⏱️ Why setTimeout(fn, 0) Isn't Immediate

```javascript
setTimeout(() => console.log('timeout'), 0);
console.log('direct');

// Output:
// direct
// timeout
```

Even with 0ms delay, the callback:
1. Goes to Web API (timer)
2. After 0ms, moves to Macrotask Queue
3. Waits for Call Stack to be empty
4. Waits for all Microtasks to complete
5. THEN executes

**Minimum delay:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SETTIMEOUT MINIMUM DELAY                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Browser behavior:                                                         │
│   • setTimeout(fn, 0) actually has ~4ms minimum delay                       │
│   • Nested setTimeout (5+ levels) enforces 4ms minimum                      │
│                                                                             │
│   setTimeout(() => {               // ~4ms delay                            │
│     setTimeout(() => {             // ~4ms delay                            │
│       setTimeout(() => {           // ~4ms delay                            │
│         setTimeout(() => {         // ~4ms delay                            │
│           setTimeout(() => {       // ~4ms delay (5th level)                │
│             // Now forced 4ms minimum                                       │
│           }, 0);                                                            │
│         }, 0);                                                              │
│       }, 0);                                                                │
│     }, 0);                                                                  │
│   }, 0);                                                                    │
│                                                                             │
│   This is a browser specification to prevent CPU spinning.                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 The Rendering Pipeline

In browsers, rendering happens between Event Loop iterations:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BROWSER RENDERING IN EVENT LOOP                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   One iteration of the Event Loop:                                          │
│                                                                             │
│   ┌─────────────────┐                                                       │
│   │  1. Run ONE     │                                                       │
│   │     Macrotask   │                                                       │
│   └────────┬────────┘                                                       │
│            │                                                                │
│            ▼                                                                │
│   ┌─────────────────┐                                                       │
│   │  2. Run ALL     │                                                       │
│   │     Microtasks  │                                                       │
│   └────────┬────────┘                                                       │
│            │                                                                │
│            ▼                                                                │
│   ┌─────────────────────────────────────────────────┐                       │
│   │  3. RENDER (if ~16ms passed since last render)  │                       │
│   │                                                  │                       │
│   │   a. Calculate styles                            │                       │
│   │   b. Layout (reflow)                             │                       │
│   │   c. Paint                                       │                       │
│   │   d. Composite                                   │                       │
│   │                                                  │                       │
│   │   requestAnimationFrame callbacks run here!     │                       │
│   └────────┬────────────────────────────────────────┘                       │
│            │                                                                │
│            ▼                                                                │
│   ┌─────────────────┐                                                       │
│   │  4. Repeat      │                                                       │
│   └─────────────────┘                                                       │
│                                                                             │
│   Target: 60fps = render every ~16.67ms                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why this matters:**

```javascript
// Bad: Multiple reflows
function badAnimation() {
  for (let i = 0; i < 100; i++) {
    element.style.left = i + 'px';
    // Forces recalculation each iteration
    console.log(element.offsetWidth);  // Forces reflow!
  }
}

// Good: Batch updates, use requestAnimationFrame
function goodAnimation() {
  let i = 0;
  function step() {
    if (i < 100) {
      element.style.left = i + 'px';
      i++;
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}
```

---

## 🔗 requestAnimationFrame vs setTimeout

```javascript
// setTimeout - Not synced with browser refresh
function animateWithTimeout() {
  element.style.transform = 'translateX(10px)';
  setTimeout(animateWithTimeout, 16);  // Approximate 60fps
}

// requestAnimationFrame - Synced with browser refresh
function animateWithRAF() {
  element.style.transform = 'translateX(10px)';
  requestAnimationFrame(animateWithRAF);  // Exactly on frame boundary
}
```

**Where rAF runs:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    requestAnimationFrame TIMING                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Time →                                                                    │
│   ├────────┼────────┼────────┼────────┼────────┤                           │
│   0ms      16ms     32ms     48ms     64ms     80ms                         │
│                                                                             │
│   rAF runs RIGHT BEFORE each paint:                                         │
│   │  ↓     │  ↓     │  ↓     │  ↓     │  ↓                                 │
│   │ rAF    │ rAF    │ rAF    │ rAF    │ rAF                                │
│   │ Paint  │ Paint  │ Paint  │ Paint  │ Paint                              │
│   │        │        │        │        │                                     │
│   └────────┴────────┴────────┴────────┴────────┘                           │
│                                                                             │
│   Benefits:                                                                 │
│   • Synchronized with display refresh                                       │
│   • Automatically paused in background tabs                                 │
│   • Optimal for visual changes                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Interview Question: Predict the Output

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

setTimeout(function() {
  console.log('setTimeout');
}, 0);

async1();

new Promise(function(resolve) {
  console.log('promise1');
  resolve();
}).then(function() {
  console.log('promise2');
});

console.log('script end');
```

**Output:**
```
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```

**Why?**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTERVIEW QUESTION BREAKDOWN                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. console.log('script start')     → Sync: Output "script start"         │
│                                                                             │
│   2. setTimeout(..., 0)              → Macrotask Queue: [setTimeout]       │
│                                                                             │
│   3. async1()                                                               │
│      │                                                                      │
│      ├── console.log('async1 start') → Sync: Output "async1 start"        │
│      │                                                                      │
│      ├── await async2()                                                     │
│      │   │                                                                  │
│      │   └── console.log('async2')   → Sync: Output "async2"              │
│      │                                                                      │
│      └── (rest of async1 becomes microtask)                                 │
│          Microtask Queue: [rest of async1]                                  │
│                                                                             │
│   4. new Promise(...)                                                       │
│      │                                                                      │
│      ├── console.log('promise1')     → Sync: Output "promise1"            │
│      │   (Promise executor runs synchronously!)                             │
│      │                                                                      │
│      └── .then(...) → Microtask Queue: [rest of async1, promise2]         │
│                                                                             │
│   5. console.log('script end')       → Sync: Output "script end"          │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│   Sync phase done. Now process Microtask Queue:                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   6. rest of async1                  → Output "async1 end"                 │
│   7. promise2 callback               → Output "promise2"                   │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│   Microtasks done. Process Macrotask Queue:                                 │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   8. setTimeout callback             → Output "setTimeout"                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EVENT LOOP SUMMARY                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   THE EVENT LOOP:                                                           │
│   ├── Continuously running loop                                             │
│   ├── Checks if Call Stack is empty                                         │
│   ├── Processes ALL Microtasks                                              │
│   ├── Renders (browser, ~60fps)                                             │
│   └── Processes ONE Macrotask                                               │
│                                                                             │
│   EXECUTION ORDER:                                                          │
│   1. Synchronous code (entire script)                                       │
│   2. ALL Microtasks (Promises, queueMicrotask)                             │
│   3. ONE Macrotask (setTimeout, I/O)                                       │
│   4. ALL Microtasks again                                                   │
│   5. Repeat from step 3                                                     │
│                                                                             │
│   KEY INSIGHT:                                                              │
│   Microtasks ALWAYS run before the next Macrotask                           │
│                                                                             │
│   BROWSER-SPECIFIC:                                                         │
│   ├── Rendering happens between Event Loop iterations                       │
│   ├── requestAnimationFrame runs before paint                               │
│   └── UI stays responsive because of this cycle                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Key Takeaways

1. **Event Loop** is the coordinator between Call Stack and Task Queues
2. **Microtasks have priority** over Macrotasks
3. **All Microtasks** run before the next Macrotask
4. **Rendering** happens between Event Loop iterations (~60fps target)
5. **setTimeout(fn, 0)** still waits for sync code + microtasks
6. **requestAnimationFrame** is synchronized with browser refresh

---

## ➡️ Next Chapter

We've mentioned Macro Tasks and Micro Tasks. Let's dive deeper into what these are and when to use each.

**[Continue to Chapter 07: Macro Tasks vs Micro Tasks →](./07-Macro-Tasks-vs-Micro-Tasks.md)**
