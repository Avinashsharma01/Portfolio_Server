# Chapter 02: Execution Context & Call Stack

> **How JavaScript Tracks and Executes Your Code**

---

## 🎯 What You'll Learn

- What an Execution Context is and why it matters
- The three types of Execution Contexts
- How the Call Stack manages function execution
- Variable Environment and Lexical Environment
- The creation and execution phases
- Why `this` behaves the way it does

---

## 📖 The Mental Model

When JavaScript runs your code, it needs to keep track of:
- Where am I in the code?
- What variables exist right now?
- What is `this` referring to?
- Where did I come from? (to return there later)

The **Execution Context** answers all these questions.

---

## 🎭 What is an Execution Context?

An **Execution Context** is an abstract container that holds all the information needed to execute a piece of code.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXECUTION CONTEXT                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                     VARIABLE ENVIRONMENT                             │  │
│   │   Stores: let, const, var declarations, function declarations       │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                     LEXICAL ENVIRONMENT                              │  │
│   │   Stores: Local variables + Reference to outer environment (Scope)  │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                     THIS BINDING                                     │  │
│   │   What 'this' refers to in this context                             │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Types of Execution Contexts

### 1. Global Execution Context (GEC)

Created when your JavaScript file starts running. There's only ONE global context.

```javascript
// This code runs in the Global Execution Context

const appName = "MyApp";
let version = "1.0.0";

function startApp() {
  console.log(`Starting ${appName}`);
}
```

**Global Execution Context contains:**
```
┌─────────────────────────────────────────────────────────────────┐
│                GLOBAL EXECUTION CONTEXT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Variable Environment:                                         │
│   ┌───────────────────────────────────────────────────────────┐│
│   │  appName: "MyApp"                                         ││
│   │  version: "1.0.0"                                         ││
│   │  startApp: function() {...}                               ││
│   └───────────────────────────────────────────────────────────┘│
│                                                                 │
│   Lexical Environment:                                          │
│   ┌───────────────────────────────────────────────────────────┐│
│   │  Reference to outer: null (there's nothing outside global)││
│   └───────────────────────────────────────────────────────────┘│
│                                                                 │
│   This Binding:                                                 │
│   ┌───────────────────────────────────────────────────────────┐│
│   │  this = window (browser) or global (Node.js)              ││
│   └───────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Function Execution Context (FEC)

Created every time a function is **called** (not when it's defined!).

```javascript
function greet(name) {
  const greeting = "Hello";
  return `${greeting}, ${name}!`;
}

greet("Alice");  // Creates a new Function Execution Context
greet("Bob");    // Creates ANOTHER new Function Execution Context
```

**Each function call gets its own context:**
```
┌─────────────────────────────────────────────────────────────────┐
│            FUNCTION EXECUTION CONTEXT (greet)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Variable Environment:                                         │
│   ┌───────────────────────────────────────────────────────────┐│
│   │  name: "Alice"  (parameter)                               ││
│   │  greeting: "Hello"                                        ││
│   └───────────────────────────────────────────────────────────┘│
│                                                                 │
│   Lexical Environment:                                          │
│   ┌───────────────────────────────────────────────────────────┐│
│   │  Reference to outer: Global Execution Context             ││
│   └───────────────────────────────────────────────────────────┘│
│                                                                 │
│   This Binding:                                                 │
│   ┌───────────────────────────────────────────────────────────┐│
│   │  this = window (non-strict) or undefined (strict mode)    ││
│   └───────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Eval Execution Context

Created when code runs inside `eval()`. Rarely used and generally avoided.

```javascript
eval("const x = 10;");  // Creates its own execution context
```

---

## 📚 The Call Stack

The **Call Stack** is a LIFO (Last In, First Out) data structure that keeps track of Execution Contexts.

### How the Call Stack Works

```javascript
function first() {
  console.log("First function");
  second();
  console.log("Back to first");
}

function second() {
  console.log("Second function");
  third();
  console.log("Back to second");
}

function third() {
  console.log("Third function");
}

first();
```

**Output:**
```
First function
Second function
Third function
Back to second
Back to first
```

**Visual Stack Evolution:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CALL STACK EVOLUTION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Step 1: Program starts                                                    │
│   ┌─────────────────┐                                                       │
│   │  Global Context │  ← Base of the stack (always present)                │
│   └─────────────────┘                                                       │
│                                                                             │
│   Step 2: first() is called                                                 │
│   ┌─────────────────┐                                                       │
│   │   first()       │  ← Pushed onto stack                                 │
│   ├─────────────────┤                                                       │
│   │  Global Context │                                                       │
│   └─────────────────┘                                                       │
│                                                                             │
│   Step 3: first() calls second()                                            │
│   ┌─────────────────┐                                                       │
│   │   second()      │  ← Pushed onto stack                                 │
│   ├─────────────────┤                                                       │
│   │   first()       │  ← Paused, waiting for second() to return            │
│   ├─────────────────┤                                                       │
│   │  Global Context │                                                       │
│   └─────────────────┘                                                       │
│                                                                             │
│   Step 4: second() calls third()                                            │
│   ┌─────────────────┐                                                       │
│   │   third()       │  ← Currently executing                               │
│   ├─────────────────┤                                                       │
│   │   second()      │  ← Paused                                            │
│   ├─────────────────┤                                                       │
│   │   first()       │  ← Paused                                            │
│   ├─────────────────┤                                                       │
│   │  Global Context │                                                       │
│   └─────────────────┘                                                       │
│                                                                             │
│   Step 5: third() completes and returns                                     │
│   ┌─────────────────┐                                                       │
│   │   second()      │  ← Resumes execution (third popped off)              │
│   ├─────────────────┤                                                       │
│   │   first()       │                                                       │
│   ├─────────────────┤                                                       │
│   │  Global Context │                                                       │
│   └─────────────────┘                                                       │
│                                                                             │
│   Step 6: second() completes and returns                                    │
│   ┌─────────────────┐                                                       │
│   │   first()       │  ← Resumes execution (second popped off)             │
│   ├─────────────────┤                                                       │
│   │  Global Context │                                                       │
│   └─────────────────┘                                                       │
│                                                                             │
│   Step 7: first() completes                                                 │
│   ┌─────────────────┐                                                       │
│   │  Global Context │  ← Back to just global (first popped off)            │
│   └─────────────────┘                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 The Two Phases of Execution Context

Every Execution Context goes through TWO phases:

### Phase 1: Creation Phase

```javascript
console.log(name);    // undefined (not ReferenceError!)
console.log(greet);   // function greet() {...}
console.log(age);     // ReferenceError: Cannot access 'age' before initialization

var name = "Alice";
let age = 25;

function greet() {
  return "Hello!";
}
```

**What happens during Creation Phase:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CREATION PHASE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. Create the Variable Environment                                        │
│                                                                             │
│   2. Scan for declarations (NOT assignments):                               │
│                                                                             │
│      ┌─────────────────────────────────────────────────────────────────┐   │
│      │  var declarations:                                               │   │
│      │    → Create variable in memory                                   │   │
│      │    → Initialize with undefined                                   │   │
│      │    → name: undefined  ✓                                         │   │
│      └─────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│      ┌─────────────────────────────────────────────────────────────────┐   │
│      │  let/const declarations:                                         │   │
│      │    → Create variable in memory                                   │   │
│      │    → DO NOT initialize (Temporal Dead Zone)                      │   │
│      │    → age: <uninitialized>  ✓                                    │   │
│      └─────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│      ┌─────────────────────────────────────────────────────────────────┐   │
│      │  function declarations:                                          │   │
│      │    → Create function in memory                                   │   │
│      │    → Initialize with entire function definition                  │   │
│      │    → greet: function() {...}  ✓                                 │   │
│      └─────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   3. Determine 'this' binding                                               │
│                                                                             │
│   4. Set up Scope Chain (Lexical Environment)                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 2: Execution Phase

Now the code runs line by line, and values are assigned.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXECUTION PHASE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Line 1: console.log(name)                                                 │
│           → Look up 'name' in Variable Environment                          │
│           → Found: undefined                                                │
│           → Output: undefined                                               │
│                                                                             │
│   Line 2: console.log(greet)                                                │
│           → Look up 'greet' in Variable Environment                         │
│           → Found: function greet() {...}                                   │
│           → Output: [Function: greet]                                       │
│                                                                             │
│   Line 3: console.log(age)                                                  │
│           → Look up 'age' in Variable Environment                           │
│           → Found: <uninitialized> (in TDZ)                                │
│           → ReferenceError!                                                 │
│                                                                             │
│   (If we removed line 3, execution would continue:)                         │
│                                                                             │
│   Line 4: var name = "Alice"                                                │
│           → Assign "Alice" to name                                          │
│           → name: "Alice"                                                   │
│                                                                             │
│   Line 5: let age = 25                                                      │
│           → Initialize and assign 25 to age                                 │
│           → age: 25  (now accessible!)                                      │
│                                                                             │
│   Line 6-8: function greet()                                                │
│           → Already processed in creation phase, skip                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚧 Temporal Dead Zone (TDZ)

The TDZ is the period between entering a scope and the point where a `let`/`const` variable is initialized.

```javascript
{
  // TDZ for 'x' starts here
  
  console.log(x);  // ReferenceError: Cannot access 'x' before initialization
  
  let x = 10;      // TDZ for 'x' ends here
  
  console.log(x);  // 10
}
```

**Visual TDZ:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TEMPORAL DEAD ZONE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   {                                                                         │
│       │  ┌─────────────────────────────────────────────────────────────┐   │
│       │  │                    TEMPORAL DEAD ZONE                       │   │
│       │  │              Variable 'x' exists in memory                  │   │
│       │  │              but accessing it throws error                  │   │
│       │  │                                                             │   │
│       │  │   console.log(x);  // ❌ ReferenceError                    │   │
│       │  │   typeof x;        // ❌ ReferenceError                    │   │
│       │  │                                                             │   │
│       │  └─────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       └────── let x = 10;  // ✅ TDZ ends - x is now accessible            │
│                                                                             │
│              console.log(x);  // ✅ 10                                      │
│   }                                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Scope Chain and Lexical Environment

When JavaScript can't find a variable in the current context, it looks up the **scope chain**.

```javascript
const globalVar = "I'm global";

function outer() {
  const outerVar = "I'm in outer";
  
  function inner() {
    const innerVar = "I'm in inner";
    
    console.log(innerVar);   // Found in inner's scope
    console.log(outerVar);   // Found in outer's scope (via chain)
    console.log(globalVar);  // Found in global scope (via chain)
  }
  
  inner();
}

outer();
```

**Scope Chain Visualization:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SCOPE CHAIN                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   When inside inner(), looking for a variable:                              │
│                                                                             │
│   ┌─────────────────────────────────┐                                       │
│   │     inner() Execution Context   │                                       │
│   │     innerVar: "I'm in inner"    │  ← Look here first                   │
│   │     outer: [reference to outer] │                                       │
│   └─────────────┬───────────────────┘                                       │
│                 │                                                           │
│                 │  Not found? Go up the chain                               │
│                 ▼                                                           │
│   ┌─────────────────────────────────┐                                       │
│   │     outer() Execution Context   │                                       │
│   │     outerVar: "I'm in outer"    │  ← Look here second                  │
│   │     outer: [reference to global]│                                       │
│   └─────────────┬───────────────────┘                                       │
│                 │                                                           │
│                 │  Not found? Go up the chain                               │
│                 ▼                                                           │
│   ┌─────────────────────────────────┐                                       │
│   │     Global Execution Context    │                                       │
│   │     globalVar: "I'm global"     │  ← Look here last                    │
│   │     outer: [reference to null]  │                                       │
│   └─────────────────────────────────┘                                       │
│                                                                             │
│   If not found in global → ReferenceError                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Important**: The scope chain is determined by WHERE a function is WRITTEN (lexical/static scoping), not where it's called!

```javascript
const x = 10;

function foo() {
  console.log(x);  // Where is x looked up?
}

function bar() {
  const x = 20;
  foo();  // Calling foo from inside bar
}

bar();  // Output: 10 (NOT 20!)
```

Why? Because `foo`'s outer lexical environment is the global scope (where it was defined), not `bar`'s scope (where it was called).

---

## 🎯 Understanding `this` Binding

The `this` keyword is determined during the Creation Phase.

### Rules for `this` Binding

```javascript
// Rule 1: Default Binding (standalone function call)
function showThis() {
  console.log(this);
}
showThis();  // window (non-strict) or undefined (strict)

// Rule 2: Implicit Binding (method call)
const obj = {
  name: "Object",
  showThis: function() {
    console.log(this);
  }
};
obj.showThis();  // obj

// Rule 3: Explicit Binding (call, apply, bind)
function greet() {
  console.log(this.name);
}
const person = { name: "Alice" };
greet.call(person);   // "Alice"
greet.apply(person);  // "Alice"
const boundGreet = greet.bind(person);
boundGreet();         // "Alice"

// Rule 4: new Binding (constructor call)
function Person(name) {
  this.name = name;
}
const p = new Person("Bob");  // this = new empty object
console.log(p.name);  // "Bob"

// Rule 5: Arrow Functions (inherit from enclosing scope)
const obj2 = {
  name: "Arrow Object",
  regularMethod: function() {
    const arrowFunc = () => {
      console.log(this.name);  // Inherits 'this' from regularMethod
    };
    arrowFunc();
  }
};
obj2.regularMethod();  // "Arrow Object"
```

**`this` Binding Priority (highest to lowest):**

```
┌─────────────────────────────────────────────────────────────────┐
│                    THIS BINDING PRIORITY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. new keyword         → new object                           │
│   2. call/apply/bind     → specified object                     │
│   3. Method call (obj.fn)→ obj                                  │
│   4. Default             → global/undefined                     │
│                                                                 │
│   * Arrow functions: IGNORE all above, use lexical this         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💥 Stack Overflow

The Call Stack has a limited size. Too many nested calls = Stack Overflow.

```javascript
function recursive() {
  recursive();  // Calls itself infinitely
}

recursive();  // RangeError: Maximum call stack size exceeded
```

**What happens:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    STACK OVERFLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐                                           │
│   │   recursive()   │  ← Stack frame #10,000+                  │
│   ├─────────────────┤                                           │
│   │   recursive()   │                                           │
│   ├─────────────────┤                                           │
│   │   recursive()   │                                           │
│   ├─────────────────┤                                           │
│   │      ...        │  ← Thousands more frames                 │
│   ├─────────────────┤                                           │
│   │   recursive()   │                                           │
│   ├─────────────────┤                                           │
│   │  Global Context │                                           │
│   └─────────────────┘                                           │
│                                                                 │
│   💥 STACK LIMIT REACHED → RangeError                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Complete Example: Tracing Execution

```javascript
var a = 1;
let b = 2;
const c = 3;

function multiply(x, y) {
  var result = x * y;
  return result;
}

function calculate() {
  let sum = a + b + c;
  let product = multiply(a, b);
  return sum + product;
}

let finalResult = calculate();
console.log(finalResult);  // 8
```

**Step-by-Step Execution:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE EXECUTION TRACE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ═══════════════════════════════════════════════════════════════════════════ │
│ PHASE 1: GLOBAL CONTEXT CREATION                                            │
│ ═══════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│   Call Stack:                    Variable Environment:                      │
│   ┌─────────────────┐            ┌──────────────────────────────────┐      │
│   │  Global Context │            │ a: undefined                      │      │
│   └─────────────────┘            │ b: <uninitialized>                │      │
│                                  │ c: <uninitialized>                │      │
│                                  │ multiply: function() {...}        │      │
│                                  │ calculate: function() {...}       │      │
│                                  │ finalResult: <uninitialized>      │      │
│                                  └──────────────────────────────────┘      │
│                                                                             │
│ ═══════════════════════════════════════════════════════════════════════════ │
│ PHASE 2: GLOBAL CONTEXT EXECUTION                                           │
│ ═══════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│   Line 1: var a = 1      →  a: 1                                           │
│   Line 2: let b = 2      →  b: 2  (exits TDZ)                              │
│   Line 3: const c = 3    →  c: 3  (exits TDZ)                              │
│   Lines 5-8, 10-14: Functions already created, skip                         │
│   Line 16: let finalResult = calculate()  →  CALL calculate()              │
│                                                                             │
│ ═══════════════════════════════════════════════════════════════════════════ │
│ PHASE 3: CALCULATE() CONTEXT CREATION & EXECUTION                           │
│ ═══════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│   Call Stack:                    calculate() Environment:                   │
│   ┌─────────────────┐            ┌──────────────────────────────────┐      │
│   │   calculate()   │            │ sum: <uninitialized>              │      │
│   ├─────────────────┤            │ product: <uninitialized>          │      │
│   │  Global Context │            │ Outer: Global Context             │      │
│   └─────────────────┘            └──────────────────────────────────┘      │
│                                                                             │
│   Line 11: let sum = a + b + c                                              │
│            → Look up a (found in global: 1)                                 │
│            → Look up b (found in global: 2)                                 │
│            → Look up c (found in global: 3)                                 │
│            → sum = 1 + 2 + 3 = 6                                           │
│                                                                             │
│   Line 12: let product = multiply(a, b)  →  CALL multiply(1, 2)            │
│                                                                             │
│ ═══════════════════════════════════════════════════════════════════════════ │
│ PHASE 4: MULTIPLY() CONTEXT CREATION & EXECUTION                            │
│ ═══════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│   Call Stack:                    multiply() Environment:                    │
│   ┌─────────────────┐            ┌──────────────────────────────────┐      │
│   │   multiply()    │            │ x: 1 (argument)                   │      │
│   ├─────────────────┤            │ y: 2 (argument)                   │      │
│   │   calculate()   │            │ result: undefined (var hoisted)   │      │
│   ├─────────────────┤            │ Outer: Global Context             │      │
│   │  Global Context │            └──────────────────────────────────┘      │
│   └─────────────────┘                                                       │
│                                                                             │
│   Line 6: var result = x * y  →  result = 1 * 2 = 2                        │
│   Line 7: return result       →  return 2                                   │
│                                                                             │
│   → multiply() pops off stack, returns 2 to calculate()                    │
│                                                                             │
│ ═══════════════════════════════════════════════════════════════════════════ │
│ PHASE 5: BACK TO CALCULATE()                                                │
│ ═══════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│   Call Stack:                    calculate() Environment:                   │
│   ┌─────────────────┐            ┌──────────────────────────────────┐      │
│   │   calculate()   │            │ sum: 6                            │      │
│   ├─────────────────┤            │ product: 2 (from multiply)        │      │
│   │  Global Context │            └──────────────────────────────────┘      │
│   └─────────────────┘                                                       │
│                                                                             │
│   Line 13: return sum + product  →  return 6 + 2 = 8                       │
│                                                                             │
│   → calculate() pops off stack, returns 8 to global                        │
│                                                                             │
│ ═══════════════════════════════════════════════════════════════════════════ │
│ PHASE 6: BACK TO GLOBAL, FINISH                                             │
│ ═══════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│   Call Stack:                    Global Environment:                        │
│   ┌─────────────────┐            ┌──────────────────────────────────┐      │
│   │  Global Context │            │ a: 1                              │      │
│   └─────────────────┘            │ b: 2                              │      │
│                                  │ c: 3                              │      │
│                                  │ multiply: function() {...}        │      │
│                                  │ calculate: function() {...}       │      │
│                                  │ finalResult: 8                    │      │
│                                  └──────────────────────────────────┘      │
│                                                                             │
│   Line 17: console.log(finalResult)  →  Output: 8                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  EXECUTION CONTEXT & CALL STACK SUMMARY                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   EXECUTION CONTEXT CONTAINS:                                               │
│   ├── Variable Environment (stores variables)                               │
│   ├── Lexical Environment (scope chain reference)                           │
│   └── This Binding (what 'this' refers to)                                  │
│                                                                             │
│   TWO PHASES:                                                               │
│   1. Creation Phase                                                         │
│      ├── var → undefined                                                    │
│      ├── let/const → uninitialized (TDZ)                                   │
│      └── function → entire function                                         │
│                                                                             │
│   2. Execution Phase                                                        │
│      └── Code runs line by line, values assigned                            │
│                                                                             │
│   CALL STACK:                                                               │
│   ├── LIFO structure                                                        │
│   ├── Tracks function calls                                                 │
│   ├── Push on call, pop on return                                           │
│   └── Overflow if too deep                                                  │
│                                                                             │
│   SCOPE CHAIN:                                                              │
│   ├── Determined by WHERE code is written (lexical)                         │
│   ├── Looks up chain until found                                            │
│   └── ReferenceError if not found anywhere                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Key Takeaways

1. **Every function call creates a new Execution Context**
2. **Creation Phase happens BEFORE execution** - this is hoisting
3. **let/const have TDZ**, var doesn't
4. **Scope is lexical** - determined by where code is written
5. **`this` is determined by how a function is called**, except arrow functions
6. **The Call Stack is finite** - watch out for infinite recursion

---

## ➡️ Next Chapter

Now that you understand how JavaScript tracks execution, let's dive into **how memory is allocated and cleaned up**.

**[Continue to Chapter 03: Memory Allocation & Garbage Collection →](./03-Memory-Allocation-Garbage-Collection.md)**
