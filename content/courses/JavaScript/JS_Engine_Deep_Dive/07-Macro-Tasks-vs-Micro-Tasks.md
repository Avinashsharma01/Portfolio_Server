# Chapter 07: Macro Tasks vs Micro Tasks

> **Understanding Task Prioritization in JavaScript**

---

## 🎯 What You'll Learn

- What Macro Tasks and Micro Tasks are
- Complete list of Macro Tasks and Micro Tasks
- Why the distinction matters
- How task prioritization affects your code
- Practical implications for application design

---

## 📖 The Two Task Queues

JavaScript's Event Loop manages two types of task queues:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TWO TYPES OF TASKS                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌───────────────────────────────────┐  ┌───────────────────────────────┐ │
│   │         MACROTASKS                │  │         MICROTASKS            │ │
│   │         (Task Queue)              │  │         (Job Queue)           │ │
│   │                                   │  │                               │ │
│   │  • setTimeout                     │  │  • Promise.then/catch/finally│ │
│   │  • setInterval                    │  │  • queueMicrotask            │ │
│   │  • setImmediate (Node.js)         │  │  • MutationObserver          │ │
│   │  • requestAnimationFrame          │  │  • process.nextTick (Node)   │ │
│   │  • I/O operations                 │  │                               │ │
│   │  • UI rendering events            │  │                               │ │
│   │  • MessageChannel                 │  │                               │ │
│   │                                   │  │                               │ │
│   │  ┌─────────────────────────────┐ │  │  ┌─────────────────────────┐  │ │
│   │  │ Execute ONE per iteration  │ │  │  │ Execute ALL before next │  │ │
│   │  └─────────────────────────────┘ │  │  │ macrotask               │  │ │
│   │                                   │  │  └─────────────────────────┘  │ │
│   └───────────────────────────────────┘  └───────────────────────────────┘ │
│                                                                             │
│   PRIORITY: Microtasks ALWAYS run before the next Macrotask                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Complete Reference

### Macrotasks (Tasks)

| API | Environment | When it's queued |
|-----|-------------|------------------|
| `setTimeout` | Browser, Node.js | After specified delay |
| `setInterval` | Browser, Node.js | Repeatedly after interval |
| `setImmediate` | Node.js only | After I/O callbacks |
| `requestAnimationFrame` | Browser only | Before next repaint |
| `I/O operations` | Both | When I/O completes |
| `UI rendering` | Browser only | When DOM needs update |
| `MessageChannel` | Both | When message posted |
| `postMessage` | Browser | When message received |
| Script loading | Browser | When script executes |

### Microtasks (Jobs)

| API | Environment | When it's queued |
|-----|-------------|------------------|
| `Promise.then/catch/finally` | Both | When promise resolves/rejects |
| `queueMicrotask` | Both | Immediately |
| `MutationObserver` | Browser | When DOM mutation observed |
| `process.nextTick` | Node.js only | Before any microtask* |

*Note: `process.nextTick` technically runs before other microtasks in Node.js

---

## 🔍 The Execution Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TASK EXECUTION MODEL                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Script starts (itself a macrotask)                                        │
│   │                                                                         │
│   ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    Execute Synchronous Code                          │  │
│   │                                                                      │  │
│   │  • Any microtasks created go to Microtask Queue                     │  │
│   │  • Any macrotasks created go to Macrotask Queue                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│   │                                                                         │
│   ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    CHECKPOINT: Microtask Queue                       │  │
│   │                                                                      │  │
│   │  while (microtaskQueue.length > 0) {                                │  │
│   │      const task = microtaskQueue.shift();                            │  │
│   │      execute(task);                                                  │  │
│   │      // New microtasks? They run in THIS same checkpoint!           │  │
│   │  }                                                                   │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│   │                                                                         │
│   ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    Render (if needed, browser only)                  │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│   │                                                                         │
│   ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    Execute ONE Macrotask                             │  │
│   │                                                                      │  │
│   │  if (macrotaskQueue.length > 0) {                                   │  │
│   │      const task = macrotaskQueue.shift();                            │  │
│   │      execute(task);                                                  │  │
│   │  }                                                                   │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│   │                                                                         │
│   └──────────────────────────── Loop back to Microtask Checkpoint         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Examples to Build Intuition

### Example 1: Basic Priority

```javascript
console.log('1. Script start');

// Macrotask
setTimeout(() => console.log('2. setTimeout'), 0);

// Microtask
Promise.resolve().then(() => console.log('3. Promise'));

// Microtask
queueMicrotask(() => console.log('4. queueMicrotask'));

console.log('5. Script end');
```

**Output:**
```
1. Script start
5. Script end
3. Promise
4. queueMicrotask
2. setTimeout
```

**Explanation:**
```
┌─────────────────────────────────────────────────────────────────┐
│  1. Sync: "1. Script start"                                     │
│  2. setTimeout → Macrotask Queue                               │
│  3. Promise.then → Microtask Queue                             │
│  4. queueMicrotask → Microtask Queue                           │
│  5. Sync: "5. Script end"                                       │
│  6. Process Microtasks: "3. Promise", "4. queueMicrotask"      │
│  7. Process Macrotask: "2. setTimeout"                         │
└─────────────────────────────────────────────────────────────────┘
```

### Example 2: Microtasks Adding Microtasks

```javascript
console.log('1. Start');

Promise.resolve().then(() => {
  console.log('2. Promise 1');
  Promise.resolve().then(() => {
    console.log('3. Promise 2 (nested)');
  });
});

setTimeout(() => console.log('4. setTimeout'), 0);

console.log('5. End');
```

**Output:**
```
1. Start
5. End
2. Promise 1
3. Promise 2 (nested)
4. setTimeout
```

**Key insight**: The nested Promise (3) runs BEFORE setTimeout (4) because microtasks created during microtask processing are processed in the same checkpoint.

```
┌─────────────────────────────────────────────────────────────────┐
│  Microtask Checkpoint:                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. Run Promise 1 → "2. Promise 1"                      │   │
│  │     (adds Promise 2 to queue)                           │   │
│  │                                                          │   │
│  │  2. Queue not empty! Run Promise 2 → "3. Promise 2..."  │   │
│  │                                                          │   │
│  │  3. Queue empty, checkpoint complete                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  NOW we can run the macrotask (setTimeout)                      │
└─────────────────────────────────────────────────────────────────┘
```

### Example 3: Multiple Macrotasks

```javascript
console.log('1. Start');

setTimeout(() => {
  console.log('2. setTimeout 1');
  Promise.resolve().then(() => console.log('3. Promise in timeout 1'));
}, 0);

setTimeout(() => {
  console.log('4. setTimeout 2');
  Promise.resolve().then(() => console.log('5. Promise in timeout 2'));
}, 0);

console.log('6. End');
```

**Output:**
```
1. Start
6. End
2. setTimeout 1
3. Promise in timeout 1
4. setTimeout 2
5. Promise in timeout 2
```

**Trace:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MACROTASK BY MACROTASK                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Iteration 1:                                                              │
│   ├── Sync: "1. Start", "6. End"                                           │
│   ├── Microtask checkpoint: (empty)                                        │
│   └── Macrotask: None yet processed                                         │
│                                                                             │
│   Iteration 2:                                                              │
│   ├── Macrotask: setTimeout 1 → "2. setTimeout 1"                          │
│   │   (adds Promise to microtask queue)                                    │
│   └── Microtask checkpoint: "3. Promise in timeout 1"                      │
│                                                                             │
│   Iteration 3:                                                              │
│   ├── Macrotask: setTimeout 2 → "4. setTimeout 2"                          │
│   │   (adds Promise to microtask queue)                                    │
│   └── Microtask checkpoint: "5. Promise in timeout 2"                      │
│                                                                             │
│   Each macrotask gets its own microtask checkpoint!                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ The Microtask Starvation Problem

Microtasks can starve macrotasks (and rendering):

```javascript
// ⚠️ DANGER: This blocks everything!
function recursiveMicrotask() {
  Promise.resolve().then(() => {
    console.log('Microtask');
    recursiveMicrotask();  // Adds another microtask
  });
}

recursiveMicrotask();

setTimeout(() => {
  console.log('This will NEVER run!');
}, 0);

// Output: "Microtask" forever
// setTimeout and rendering are blocked!
```

**Why this happens:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MICROTASK STARVATION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Event Loop:                                                               │
│   │                                                                         │
│   ├── Check microtask queue                                                │
│   │   └── Run microtask (adds new microtask)                               │
│   │                                                                         │
│   ├── Check microtask queue (not empty!)                                   │
│   │   └── Run microtask (adds new microtask)                               │
│   │                                                                         │
│   ├── Check microtask queue (not empty!)                                   │
│   │   └── Run microtask (adds new microtask)                               │
│   │                                                                         │
│   └── ... forever ...                                                       │
│                                                                             │
│   The Event Loop NEVER gets to:                                             │
│   ❌ Process macrotasks (setTimeout)                                        │
│   ❌ Render the UI                                                          │
│   ❌ Handle user input                                                      │
│                                                                             │
│   PAGE BECOMES UNRESPONSIVE!                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Solution**: Use macrotasks for recursive async work:

```javascript
// ✅ Safe: Uses macrotask for recursion
function safeRecursion() {
  setTimeout(() => {
    console.log('Task');
    safeRecursion();
  }, 0);
}

// Allows other macrotasks and rendering between iterations
```

---

## 🎯 When to Use Each

### Use Microtasks When:

```javascript
// 1. You need code to run ASAP after current sync code
queueMicrotask(() => {
  // Runs before any timers or I/O
  updateInternalState();
});

// 2. You're working with Promises (automatic)
fetchData().then(data => {
  // This is a microtask
  processData(data);
});

// 3. You need to batch DOM reads
queueMicrotask(() => {
  // All sync DOM writes are done
  // Now safe to read measurements
  const height = element.offsetHeight;
});
```

### Use Macrotasks When:

```javascript
// 1. You want to yield to the browser (allow rendering)
setTimeout(() => {
  // Browser had a chance to render
  heavyComputation();
}, 0);

// 2. You need to run after I/O or user events
element.addEventListener('click', () => {
  // This is a macrotask
  handleClick();
});

// 3. You need regular intervals
setInterval(() => {
  updateClock();
}, 1000);

// 4. You want to schedule for the next frame
requestAnimationFrame(() => {
  // Runs before next paint
  animate();
});
```

---

## 🔬 Node.js Specifics

Node.js has additional nuances:

```javascript
// process.nextTick - runs BEFORE other microtasks
process.nextTick(() => console.log('1. nextTick'));

// Promise - regular microtask
Promise.resolve().then(() => console.log('2. Promise'));

// setImmediate - runs in "check" phase (after I/O)
setImmediate(() => console.log('3. setImmediate'));

// setTimeout - runs in "timers" phase
setTimeout(() => console.log('4. setTimeout'), 0);

// Output (typical):
// 1. nextTick
// 2. Promise
// 4. setTimeout OR 3. setImmediate (order can vary)
// 3. setImmediate OR 4. setTimeout
```

**Node.js Event Loop Phases:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NODE.JS EVENT LOOP PHASES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────┐         │
│   │                        timers                                 │         │
│   │                 setTimeout, setInterval                       │         │
│   └─────────────────────────────┬────────────────────────────────┘         │
│                                 │                                           │
│   ┌─────────────────────────────┴────────────────────────────────┐         │
│   │                        pending callbacks                       │         │
│   │                  I/O callbacks deferred                        │         │
│   └─────────────────────────────┬────────────────────────────────┘         │
│                                 │                                           │
│   ┌─────────────────────────────┴────────────────────────────────┐         │
│   │                        idle, prepare                          │         │
│   │                    (internal use only)                        │         │
│   └─────────────────────────────┬────────────────────────────────┘         │
│                                 │                                           │
│   ┌─────────────────────────────┴────────────────────────────────┐         │
│   │                          poll                                 │         │
│   │              retrieve new I/O events                          │         │
│   └─────────────────────────────┬────────────────────────────────┘         │
│                                 │                                           │
│   ┌─────────────────────────────┴────────────────────────────────┐         │
│   │                         check                                 │         │
│   │                     setImmediate                              │         │
│   └─────────────────────────────┬────────────────────────────────┘         │
│                                 │                                           │
│   ┌─────────────────────────────┴────────────────────────────────┐         │
│   │                     close callbacks                           │         │
│   │                  socket.on('close')                           │         │
│   └──────────────────────────────────────────────────────────────┘         │
│                                                                             │
│   Between EACH phase: process.nextTick queue, then microtask queue         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Practical Example: DOM Batching

```javascript
// Bad: Multiple reflows
function badUpdate() {
  element.style.width = '100px';   // Write
  console.log(element.offsetWidth);  // Read (forces reflow)
  element.style.height = '100px';  // Write
  console.log(element.offsetHeight); // Read (forces reflow again!)
}

// Good: Batch writes, then read with microtask
function goodUpdate() {
  // Sync: All writes
  element.style.width = '100px';
  element.style.height = '100px';
  
  // Microtask: All reads (after all writes in sync code)
  queueMicrotask(() => {
    console.log(element.offsetWidth);  // One reflow
    console.log(element.offsetHeight); // No additional reflow
  });
}
```

---

## 🧪 Test Your Understanding

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve()
  .then(() => {
    console.log('3');
    setTimeout(() => console.log('4'), 0);
  })
  .then(() => console.log('5'));

Promise.resolve().then(() => console.log('6'));

console.log('7');
```

**Predict the output before looking at the answer!**

<details>
<summary>Click to see answer</summary>

```
1
7
3
6
5
2
4
```

**Explanation:**
1. Sync: `1`, `7`
2. Microtask checkpoint: `3`, `6`, `5` (in order of queueing, Promise chains)
   - Note: `4` is a setTimeout, goes to macrotask queue
3. Macrotask: `2`
4. Macrotask: `4`

</details>

---

## 📊 Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                MACRO TASKS vs MICRO TASKS SUMMARY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   MACROTASKS:                                                               │
│   ├── setTimeout, setInterval, setImmediate (Node)                          │
│   ├── I/O callbacks, UI rendering events                                    │
│   ├── requestAnimationFrame                                                 │
│   ├── One per Event Loop iteration                                          │
│   └── Use when you need to yield to browser/runtime                         │
│                                                                             │
│   MICROTASKS:                                                               │
│   ├── Promise.then/catch/finally                                            │
│   ├── queueMicrotask, MutationObserver                                      │
│   ├── process.nextTick (Node.js, highest priority)                          │
│   ├── ALL processed before next macrotask                                   │
│   └── Use for immediate async that shouldn't yield                          │
│                                                                             │
│   PRIORITY ORDER:                                                           │
│   1. Synchronous code                                                       │
│   2. process.nextTick (Node.js only)                                        │
│   3. Microtasks (Promises, queueMicrotask)                                  │
│   4. Macrotasks (one at a time)                                             │
│                                                                             │
│   DANGER:                                                                   │
│   Recursive microtasks can starve macrotasks and rendering!                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Key Takeaways

1. **Microtasks run first** - all of them, before any macrotask
2. **New microtasks during microtask processing** run in the same checkpoint
3. **Macrotasks run one at a time** with microtask checkpoint between each
4. **Avoid infinite microtask recursion** - it blocks everything
5. **Use macrotasks to yield** to the browser for rendering
6. **Node.js has extra complexity** with phases and process.nextTick

---

## ➡️ Next Chapter

Now that you understand the task system, let's dive deep into Promises - the most important microtask source.

**[Continue to Chapter 08: Promises Lifecycle →](./08-Promises-Lifecycle.md)**
