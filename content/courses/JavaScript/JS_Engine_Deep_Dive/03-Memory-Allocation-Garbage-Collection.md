# Chapter 03: Memory Allocation & Garbage Collection

> **How JavaScript Manages Memory Behind the Scenes**

---

## 🎯 What You'll Learn

- How JavaScript allocates memory for different data types
- The difference between Stack and Heap memory
- How garbage collection works (Mark-and-Sweep algorithm)
- Common memory leaks and how to prevent them
- Memory profiling basics

---

## 📖 Why Memory Management Matters

Unlike C/C++ where you manually allocate and free memory, JavaScript handles this automatically. But understanding it helps you:
- Write more performant code
- Avoid memory leaks
- Debug memory issues
- Understand why some code patterns are faster

---

## 🏗️ Memory Layout: Stack vs Heap

JavaScript uses two types of memory:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        JAVASCRIPT MEMORY MODEL                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────┐    ┌─────────────────────────────────┐   │
│   │         STACK               │    │            HEAP                  │   │
│   │  (Fast, Ordered, Small)     │    │   (Slower, Unordered, Large)    │   │
│   │                             │    │                                  │   │
│   │  • Primitive values         │    │  • Objects                       │   │
│   │  • Function call frames     │    │  • Arrays                        │   │
│   │  • References to heap       │    │  • Functions                     │   │
│   │                             │    │  • Closures                      │   │
│   │  Fixed size per item        │    │  Dynamic size                    │   │
│   │  Automatic cleanup          │    │  Garbage collected               │   │
│   │  LIFO structure             │    │  Random access                   │   │
│   │                             │    │                                  │   │
│   └─────────────────────────────┘    └─────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Primitive Types: Stack Allocation

Primitives are stored directly on the stack:

```javascript
// Each primitive gets its own stack memory
let num = 42;           // 8 bytes on stack
let str = "hello";      // Reference on stack, string in heap (optimized)
let bool = true;        // 4 bytes on stack
let nothing = null;     // Special value on stack
let notDefined;         // undefined on stack
let big = 9007199254740991n; // BigInt (special handling)
let sym = Symbol('id'); // Symbol (unique identifier)
```

**Stack Memory Visualization:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STACK MEMORY                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Stack grows ↓                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │  Address    │  Variable    │  Value                                  │ │
│   ├─────────────┼──────────────┼─────────────────────────────────────────┤ │
│   │  0x1000     │  num         │  42                                     │ │
│   │  0x1008     │  str         │  0x5000 (reference to heap)             │ │
│   │  0x1010     │  bool        │  1 (true)                               │ │
│   │  0x1018     │  nothing     │  null                                   │ │
│   │  0x1020     │  notDefined  │  undefined                              │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   Note: Actual sizes and addresses vary by engine implementation            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Primitive Copying: Value Copy

```javascript
let a = 10;
let b = a;    // b gets a COPY of the value

a = 20;       // Changing a doesn't affect b

console.log(a);  // 20
console.log(b);  // 10 (still has original copy)
```

**Memory during copy:**

```
Before b = a:              After b = a:               After a = 20:
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ Stack            │      │ Stack            │      │ Stack            │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ a: 10            │      │ a: 10            │      │ a: 20            │
│                  │      │ b: 10 (copied)   │      │ b: 10 (unchanged)│
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

---

## 🏗️ Reference Types: Heap Allocation

Objects, arrays, and functions are stored in the Heap:

```javascript
// Object allocated in Heap
const user = {
  name: "Alice",
  age: 30
};

// Array allocated in Heap
const numbers = [1, 2, 3, 4, 5];

// Function allocated in Heap
function greet() {
  return "Hello!";
}
```

**Stack + Heap Memory Visualization:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STACK AND HEAP RELATIONSHIP                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   STACK                                    HEAP                             │
│   ┌─────────────────────┐                 ┌─────────────────────────────┐  │
│   │                     │                 │                             │  │
│   │ user: 0x5000  ──────┼────────────────▶│ 0x5000: {                   │  │
│   │                     │                 │           name: "Alice",    │  │
│   │                     │                 │           age: 30           │  │
│   │                     │                 │         }                   │  │
│   │                     │                 │                             │  │
│   │ numbers: 0x6000 ────┼────────────────▶│ 0x6000: [1, 2, 3, 4, 5]    │  │
│   │                     │                 │                             │  │
│   │                     │                 │                             │  │
│   │ greet: 0x7000 ──────┼────────────────▶│ 0x7000: function() {...}   │  │
│   │                     │                 │                             │  │
│   └─────────────────────┘                 └─────────────────────────────┘  │
│                                                                             │
│   Stack stores REFERENCES (memory addresses)                                │
│   Heap stores the actual DATA                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Reference Copying: Address Copy

```javascript
const original = { name: "Alice" };
const copy = original;    // copy gets the REFERENCE, not the object

copy.name = "Bob";        // Modifying through copy...

console.log(original.name);  // "Bob" (original also changed!)
console.log(copy.name);      // "Bob"
```

**Memory during reference copy:**

```
Before copy = original:          After copy = original:
                                 
STACK           HEAP             STACK           HEAP
┌────────────┐  ┌──────────┐    ┌────────────┐  ┌──────────┐
│original:   │  │          │    │original:   │  │          │
│ 0x5000 ────┼──▶ "Alice"  │    │ 0x5000 ────┼──▶ "Alice"  │
│            │  │          │    │copy:       │  │          │
│            │  │          │    │ 0x5000 ────┼──┘          │
└────────────┘  └──────────┘    └────────────┘             
                                 Both point to SAME object!

After copy.name = "Bob":

STACK           HEAP
┌────────────┐  ┌──────────┐
│original:   │  │          │
│ 0x5000 ────┼──▶ "Bob"    │  ← Changed via copy reference
│copy:       │  │          │
│ 0x5000 ────┼──┘          │
└────────────┘  
```

### Creating True Copies

```javascript
// Shallow copy (one level deep)
const original = { name: "Alice", scores: [1, 2, 3] };

const shallowCopy = { ...original };
// or: Object.assign({}, original);

shallowCopy.name = "Bob";           // ✅ Doesn't affect original
shallowCopy.scores.push(4);         // ❌ DOES affect original!

console.log(original.scores);  // [1, 2, 3, 4] - Oops!

// Deep copy (all levels)
const deepCopy = JSON.parse(JSON.stringify(original));
// or: structuredClone(original);  // Modern method

deepCopy.scores.push(5);            // ✅ Doesn't affect original
```

---

## 🗑️ Garbage Collection

### What is Garbage Collection?

Garbage Collection (GC) is the automatic process of finding and freeing memory that's no longer needed.

```javascript
function createUser() {
  const user = { name: "Alice" };  // Object allocated
  return user.name;                 // Only the string is returned
}                                   // 'user' object is now unreachable

const name = createUser();
// At some point, GC will free the memory used by { name: "Alice" }
```

### The Mark-and-Sweep Algorithm

This is the primary GC algorithm used in modern JavaScript engines.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MARK-AND-SWEEP ALGORITHM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PHASE 1: MARK                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   Starting from "roots" (global object, call stack), traverse all           │
│   reachable objects and mark them as "alive"                                │
│                                                                             │
│   ROOTS                    HEAP                                             │
│   ┌──────────┐            ┌─────────────────────────────────────────┐      │
│   │ global   │────────────▶│ obj1: { x: 10 }        ✓ MARKED       │      │
│   │          │            │    │                                    │      │
│   │ stack    │            │    └──▶ obj2: { y: 20 } ✓ MARKED       │      │
│   │  │       │            │                                         │      │
│   │  └───────┼────────────▶│ obj3: { z: 30 }        ✓ MARKED       │      │
│   │          │            │                                         │      │
│   └──────────┘            │ obj4: { a: 40 }        ✗ NOT MARKED    │      │
│                           │                         (unreachable)   │      │
│                           │ obj5: { b: 50 }        ✗ NOT MARKED    │      │
│                           │         ↑                               │      │
│                           │         └── only referenced by obj4     │      │
│                           └─────────────────────────────────────────┘      │
│                                                                             │
│   PHASE 2: SWEEP                                                            │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   Scan the heap and FREE memory for unmarked objects                        │
│                                                                             │
│                           ┌─────────────────────────────────────────┐      │
│                           │ obj1: { x: 10 }        ✓ KEPT          │      │
│                           │    │                                    │      │
│                           │    └──▶ obj2: { y: 20 } ✓ KEPT         │      │
│                           │                                         │      │
│                           │ obj3: { z: 30 }        ✓ KEPT          │      │
│                           │                                         │      │
│                           │ [FREE MEMORY]          ← obj4 freed     │      │
│                           │                                         │      │
│                           │ [FREE MEMORY]          ← obj5 freed     │      │
│                           └─────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Code Example: Reachability

```javascript
// Example showing object reachability

let user = { name: "Alice" };   // Object is reachable via 'user'
let admin = user;               // Now reachable via both 'user' and 'admin'

user = null;                    // Still reachable via 'admin'
admin = null;                   // NOW unreachable → eligible for GC

// The { name: "Alice" } object will be garbage collected
```

---

## 🔄 V8's Generational Garbage Collection

V8 (Chrome/Node.js) uses a more sophisticated approach based on the **generational hypothesis**: most objects die young.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      V8 GENERATIONAL GARBAGE COLLECTION                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   HEAP MEMORY                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                                                                     │  │
│   │   YOUNG GENERATION (New Space)                                      │  │
│   │   ┌─────────────────────────────────────────────────────────────┐  │  │
│   │   │                                                             │  │  │
│   │   │   ┌──────────────────┐    ┌──────────────────┐             │  │  │
│   │   │   │   FROM SPACE     │    │    TO SPACE      │             │  │  │
│   │   │   │                  │    │   (empty for     │             │  │  │
│   │   │   │   New objects    │    │    copying)      │             │  │  │
│   │   │   │   allocated here │    │                  │             │  │  │
│   │   │   │                  │    │                  │             │  │  │
│   │   │   └──────────────────┘    └──────────────────┘             │  │  │
│   │   │                                                             │  │  │
│   │   │   • Small (1-8 MB)                                          │  │  │
│   │   │   • Fast allocation (bump pointer)                          │  │  │
│   │   │   • Frequent GC (Scavenger)                                 │  │  │
│   │   │   • Objects surviving 2 GCs → promoted to Old Generation    │  │  │
│   │   └─────────────────────────────────────────────────────────────┘  │  │
│   │                              │                                      │  │
│   │                              │ Promotion                            │  │
│   │                              ▼                                      │  │
│   │   OLD GENERATION (Old Space)                                        │  │
│   │   ┌─────────────────────────────────────────────────────────────┐  │  │
│   │   │                                                             │  │  │
│   │   │   Long-lived objects:                                       │  │  │
│   │   │   • Objects that survived multiple GC cycles                │  │  │
│   │   │   • Global objects                                          │  │  │
│   │   │   • Cached data                                             │  │  │
│   │   │                                                             │  │  │
│   │   │   • Large (hundreds of MB)                                  │  │  │
│   │   │   • Less frequent GC (Mark-Sweep-Compact)                   │  │  │
│   │   │   • More expensive to collect                               │  │  │
│   │   │                                                             │  │  │
│   │   └─────────────────────────────────────────────────────────────┘  │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Scavenger GC (Young Generation)

```javascript
function processData() {
  // These temporary objects go to Young Generation
  const temp1 = { data: "processing..." };
  const temp2 = [1, 2, 3, 4, 5];
  const temp3 = { intermediate: temp1.data + " done" };
  
  return temp3.intermediate;
  // temp1, temp2, temp3 die immediately after function returns
  // Scavenger GC efficiently cleans them up
}

for (let i = 0; i < 1000; i++) {
  processData();  // Each call creates and destroys temporary objects
}
```

### Why Two Generations?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GENERATIONAL HYPOTHESIS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Object Survival Rate                                                      │
│   │                                                                         │
│   │█████████████████████████████████████████████                           │
│   │████████████████████████                     Most objects die young     │
│   │███████████████                                                         │
│   │██████████                                                              │
│   │███████                                                                 │
│   │█████                                                                   │
│   │████                                                                    │
│   │███   Long-lived objects                                                │
│   │██    (modules, caches, globals)                                        │
│   │█                                                                       │
│   └──────────────────────────────────────────────────────────▶ Time       │
│                                                                             │
│   Implication: Optimize for short-lived objects (most common case)         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💾 Memory Leaks

A memory leak occurs when memory that's no longer needed can't be garbage collected because it's still reachable.

### Common Memory Leak Patterns

#### 1. Global Variables

```javascript
// ❌ MEMORY LEAK: Accidental global
function processData() {
  // 'result' is created as global (missing 'let/const')
  result = { largeData: new Array(1000000) };
}

processData();
// 'result' now exists globally and can't be GC'd
```

```javascript
// ✅ FIX: Use proper variable declaration
function processData() {
  const result = { largeData: new Array(1000000) };
  return result.largeData.length;
}
// 'result' is local and can be GC'd after function returns
```

#### 2. Forgotten Timers

```javascript
// ❌ MEMORY LEAK: Timer keeping reference alive
let hugeData = loadHugeData();

setInterval(() => {
  // This closure keeps 'hugeData' alive forever
  console.log(hugeData.length);
}, 1000);

hugeData = null;  // Doesn't help! Timer closure still references it
```

```javascript
// ✅ FIX: Clear the timer when done
let hugeData = loadHugeData();

const timerId = setInterval(() => {
  console.log(hugeData.length);
}, 1000);

// When done:
clearInterval(timerId);
hugeData = null;  // Now it can be GC'd
```

#### 3. Forgotten Event Listeners

```javascript
// ❌ MEMORY LEAK: Event listener keeps reference
class Component {
  constructor() {
    this.data = new Array(1000000);
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  handleResize() {
    console.log(this.data.length);
  }
  
  // Component destroyed but listener remains!
}

let component = new Component();
component = null;  // data can't be GC'd - event listener still references it
```

```javascript
// ✅ FIX: Remove event listener when done
class Component {
  constructor() {
    this.data = new Array(1000000);
    this.boundHandler = this.handleResize.bind(this);
    window.addEventListener('resize', this.boundHandler);
  }
  
  handleResize() {
    console.log(this.data.length);
  }
  
  destroy() {
    window.removeEventListener('resize', this.boundHandler);
  }
}

let component = new Component();
component.destroy();  // Clean up listener first
component = null;     // Now data can be GC'd
```

#### 4. Closures Holding References

```javascript
// ❌ MEMORY LEAK: Closure holds unnecessary reference
function createHandler() {
  const hugeData = new Array(1000000).fill('x');
  
  return function handler() {
    // Even if we don't use hugeData, the closure captures it
    console.log("Handler called");
  };
}

const handler = createHandler();
// hugeData is captured by closure, can't be GC'd
```

```javascript
// ✅ FIX: Only capture what you need
function createHandler() {
  const hugeData = new Array(1000000).fill('x');
  const summary = hugeData.length;  // Extract what you need
  
  return function handler() {
    console.log(`Handler called, data had ${summary} items`);
  };
}
// hugeData can now be GC'd, only 'summary' is captured
```

#### 5. Detached DOM Nodes

```javascript
// ❌ MEMORY LEAK: Detached DOM reference
let elements = [];

function addElement() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  elements.push(div);  // Keeping reference in array
}

function removeElement() {
  const div = elements[0];
  document.body.removeChild(div);  // Removed from DOM...
  // But still in 'elements' array! Can't be GC'd
}
```

```javascript
// ✅ FIX: Clean up references
function removeElement() {
  const div = elements.shift();  // Remove from array too
  document.body.removeChild(div);
  // Now can be GC'd
}
```

---

## 📊 Memory Visualization Example

```javascript
// Let's trace memory through this code

function createUsers() {
  const users = [];
  
  for (let i = 0; i < 3; i++) {
    users.push({
      id: i,
      name: `User ${i}`,
      data: new Array(100).fill(i)
    });
  }
  
  return users;
}

let activeUsers = createUsers();
let admin = activeUsers[0];

activeUsers = null;  // What gets GC'd?
```

**Memory State Analysis:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MEMORY STATE ANALYSIS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   INITIAL STATE (after createUsers returns):                                │
│                                                                             │
│   STACK                           HEAP                                      │
│   ┌──────────────────┐           ┌────────────────────────────────────┐   │
│   │ activeUsers: ────┼──────────▶│ ARRAY [                            │   │
│   │                  │           │   0: ─────▶ { id:0, name:"User 0", │   │
│   │ admin: ──────────┼───────┐   │              data: [0,0,0...] }    │   │
│   │                  │       │   │   1: ─────▶ { id:1, name:"User 1", │   │
│   └──────────────────┘       │   │              data: [1,1,1...] }    │   │
│                              │   │   2: ─────▶ { id:2, name:"User 2", │   │
│                              │   │              data: [2,2,2...] }    │   │
│                              │   │ ]                                  │   │
│                              │   │                                    │   │
│                              └───┼───┐ (admin points to same object)  │   │
│                                  │   │                                │   │
│                                  └───┴────────────────────────────────┘   │
│                                                                             │
│                                                                             │
│   AFTER activeUsers = null:                                                 │
│                                                                             │
│   STACK                           HEAP                                      │
│   ┌──────────────────┐           ┌────────────────────────────────────┐   │
│   │ activeUsers: null│           │ ARRAY [           ← UNREACHABLE    │   │
│   │                  │           │   0: ─────▶ { id:0, ... }          │   │
│   │ admin: ──────────┼───────────┼───────────▶ ↑ STILL REACHABLE!    │   │
│   │                  │           │   1: ─────▶ { id:1, ... }          │   │
│   └──────────────────┘           │              ↑ UNREACHABLE         │   │
│                                  │   2: ─────▶ { id:2, ... }          │   │
│                                  │              ↑ UNREACHABLE         │   │
│                                  │ ]                                  │   │
│                                  └────────────────────────────────────┘   │
│                                                                             │
│   WHAT GETS GC'd:                                                           │
│   ✅ The array itself                                                       │
│   ✅ User objects at index 1 and 2                                          │
│   ❌ User object at index 0 (still referenced by 'admin')                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ WeakMap and WeakSet

These special collections hold "weak" references that don't prevent garbage collection.

```javascript
// Regular Map - prevents GC
const cache = new Map();

let user = { name: "Alice" };
cache.set(user, "cached data");

user = null;
// { name: "Alice" } is STILL in cache, can't be GC'd

// WeakMap - allows GC
const weakCache = new WeakMap();

let user2 = { name: "Bob" };
weakCache.set(user2, "cached data");

user2 = null;
// { name: "Bob" } can now be GC'd!
// Entry automatically removed from WeakMap
```

**Use Case: Associating Data with Objects**

```javascript
// Track metadata without preventing GC
const metadata = new WeakMap();

class Component {
  constructor(id) {
    this.id = id;
    metadata.set(this, {
      createdAt: Date.now(),
      renderCount: 0
    });
  }
  
  render() {
    const meta = metadata.get(this);
    meta.renderCount++;
    console.log(`Rendering component ${this.id}`);
  }
}

let comp = new Component(1);
comp.render();
comp.render();

comp = null;
// Component AND its metadata can both be GC'd
// No manual cleanup needed!
```

---

## 📊 Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                MEMORY MANAGEMENT SUMMARY                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   MEMORY TYPES:                                                             │
│   ├── Stack: Primitives, references, call frames                            │
│   └── Heap: Objects, arrays, functions, closures                            │
│                                                                             │
│   COPYING BEHAVIOR:                                                         │
│   ├── Primitives: Value is copied (independent)                             │
│   └── References: Address is copied (shared)                                │
│                                                                             │
│   GARBAGE COLLECTION:                                                       │
│   ├── Automatic (no manual free())                                          │
│   ├── Mark-and-Sweep algorithm                                              │
│   ├── Generational (Young + Old generations)                                │
│   └── Reachability determines what's collected                              │
│                                                                             │
│   COMMON MEMORY LEAKS:                                                      │
│   ├── Accidental globals                                                    │
│   ├── Forgotten timers/intervals                                            │
│   ├── Forgotten event listeners                                             │
│   ├── Closure capturing unnecessary data                                    │
│   └── Detached DOM references                                               │
│                                                                             │
│   WEAK REFERENCES:                                                          │
│   ├── WeakMap: Keys are weakly held                                         │
│   └── WeakSet: Values are weakly held                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Key Takeaways

1. **Primitives live on the stack**, references point to objects on the heap
2. **Copying references creates aliases**, not independent copies
3. **GC frees unreachable objects** - if you can't access it, it gets cleaned
4. **V8 uses generational GC** - optimized for short-lived objects
5. **Memory leaks = reachable but useless data** - clean up your references
6. **WeakMap/WeakSet** for associating data without preventing GC

---

## ➡️ Next Chapter

Now that you understand memory, let's explore two special values that often confuse developers: `undefined` and `null`.

**[Continue to Chapter 04: undefined vs null Internals →](./04-Undefined-vs-Null-Internals.md)**
