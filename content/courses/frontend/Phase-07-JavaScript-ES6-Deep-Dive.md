# Phase 07 — JavaScript ES6+ Deep Dive

## Table of Contents

- [Why ES6+ Matters](#why-es6-matters)
- [Let, Const & Block Scoping](#let-const--block-scoping)
- [Arrow Functions](#arrow-functions)
- [Template Literals](#template-literals)
- [Destructuring](#destructuring)
- [Spread & Rest Operators](#spread--rest-operators)
- [Modules — import & export](#modules--import--export)
- [Promises & Async/Await](#promises--asyncawait)
- [Array Methods That Replace Loops](#array-methods-that-replace-loops)
- [Optional Chaining & Nullish Coalescing](#optional-chaining--nullish-coalescing)
- [Map, Set, WeakMap, WeakSet](#map-set-weakmap-weakset)
- [Symbols & Iterators](#symbols--iterators)
- [Proxy & Reflect](#proxy--reflect)
- [Key Takeaways](#key-takeaways)

---

## Why ES6+ Matters

ES6 (ECMAScript 2015) was the **biggest update** to JavaScript in its history. Every modern framework (React, Vue, Angular) requires ES6+ knowledge.

```
ES5 (2009):             ES6+ (2015 onwards):
├── var                 ├── let, const
├── function() {}       ├── () => {}
├── string concat       ├── template literals
├── callbacks           ├── Promises, async/await
├── for loops           ├── map, filter, reduce
├── no modules          ├── import/export
└── prototype chains    └── class syntax
```

> **All modern JavaScript IS ES6+.** If you're writing `var` and callback pyramids, you're writing outdated code.

---

## Let, Const & Block Scoping

### var vs let vs const

```javascript
// var — function-scoped, hoisted, can be redeclared (AVOID)
var x = 1;
var x = 2;       // no error — leads to bugs

// let — block-scoped, not hoisted in usable form, can be reassigned
let y = 1;
y = 2;            // fine — reassignment
// let y = 3;     // ❌ Error — can't redeclare in same scope

// const — block-scoped, can't be reassigned (USE BY DEFAULT)
const z = 1;
// z = 2;         // ❌ Error — can't reassign

// BUT: const objects/arrays CAN be mutated
const user = { name: "Alice" };
user.name = "Bob";    // ✅ Fine — mutating the object, not reassigning
// user = {};         // ❌ Error — can't reassign the variable
```

### Block Scoping

```javascript
// var leaks out of blocks
if (true) {
    var leaked = "I leaked!";
}
console.log(leaked);  // "I leaked!" — BAD

// let/const stay inside their block
if (true) {
    let contained = "I'm safe";
    const alsoSafe = "Me too";
}
// console.log(contained);  // ❌ ReferenceError
```

> **Rule:** Use `const` by default. Use `let` only when you need to reassign. Never use `var`.

---

## Arrow Functions

### Syntax

```javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => {
    return a + b;
};

// Shorthand: implicit return (single expression)
const add = (a, b) => a + b;

// Single parameter: no parentheses needed
const double = x => x * 2;

// No parameters: empty parens required
const greet = () => "Hello!";

// Returning an object: wrap in parentheses
const makeUser = (name) => ({ name, role: "user" });
```

### Arrow Functions & `this`

Arrow functions do NOT have their own `this` — they inherit `this` from the enclosing scope:

```javascript
// Traditional function: this = whoever calls it
const timer = {
    seconds: 0,
    start: function() {
        setInterval(function() {
            this.seconds++;          // ❌ `this` is NOT the timer object
            console.log(this.seconds); // NaN
        }, 1000);
    }
};

// Arrow function: this = enclosing scope (the timer object)
const timer = {
    seconds: 0,
    start: function() {
        setInterval(() => {
            this.seconds++;          // ✅ `this` IS the timer object
            console.log(this.seconds); // 1, 2, 3...
        }, 1000);
    }
};
```

### When NOT to Use Arrow Functions

```javascript
// ❌ Object methods (need their own `this`)
const obj = {
    name: "Alice",
    greet: () => console.log(this.name)  // `this` is NOT obj
};

// ✅ Use regular function for methods
const obj = {
    name: "Alice",
    greet() { console.log(this.name); }  // `this` IS obj
};

// ❌ Event handlers that need `this` to be the element
button.addEventListener("click", () => {
    console.log(this);  // `this` is NOT the button
});

// ✅ Regular function
button.addEventListener("click", function() {
    console.log(this);  // `this` IS the button
});
```

---

## Template Literals

### Basic Usage

```javascript
const name = "Alice";
const age = 25;

// ❌ String concatenation
const msg = "Hello, " + name + "! You are " + age + " years old.";

// ✅ Template literal
const msg = `Hello, ${name}! You are ${age} years old.`;
```

### Multi-line Strings

```javascript
// ❌ Old way
const html = "<div>\n" +
             "  <h1>Title</h1>\n" +
             "  <p>Content</p>\n" +
             "</div>";

// ✅ Template literal
const html = `
    <div>
        <h1>Title</h1>
        <p>Content</p>
    </div>
`;
```

### Expressions Inside `${}`

```javascript
const price = 19.99;
const quantity = 3;

const receipt = `
    Total: $${(price * quantity).toFixed(2)}
    Discount: ${quantity >= 3 ? "10% off!" : "No discount"}
    Items: ${["Widget", "Gadget", "Gizmo"].join(", ")}
`;
```

### Tagged Templates

```javascript
function highlight(strings, ...values) {
    return strings.reduce((result, str, i) => {
        const value = values[i] ? `<mark>${values[i]}</mark>` : "";
        return result + str + value;
    }, "");
}

const name = "Alice";
const role = "admin";
const html = highlight`User ${name} has ${role} access`;
// "User <mark>Alice</mark> has <mark>admin</mark> access"
```

---

## Destructuring

### Object Destructuring

```javascript
const user = { name: "Alice", age: 25, role: "developer", city: "NYC" };

// ❌ Old way
const name = user.name;
const age = user.age;

// ✅ Destructuring
const { name, age, role } = user;

// Rename variables
const { name: userName, role: userRole } = user;

// Default values
const { name, country = "Unknown" } = user;

// Nested destructuring
const response = {
    data: {
        user: { name: "Alice", email: "alice@example.com" }
    },
    status: 200
};

const { data: { user: { name, email } }, status } = response;
```

### Array Destructuring

```javascript
const colors = ["red", "green", "blue", "yellow"];

// By position
const [first, second] = colors;  // "red", "green"

// Skip elements
const [, , third] = colors;     // "blue"

// Rest of array
const [head, ...tail] = colors;  // "red", ["green", "blue", "yellow"]

// Swap variables
let a = 1, b = 2;
[a, b] = [b, a];  // a = 2, b = 1 — no temp variable needed!
```

### Function Parameter Destructuring

```javascript
// ❌ Without destructuring
function createUser(options) {
    const name = options.name;
    const email = options.email;
    const role = options.role || "user";
}

// ✅ With destructuring + defaults
function createUser({ name, email, role = "user" }) {
    console.log(`${name} (${email}) — ${role}`);
}

createUser({ name: "Alice", email: "alice@example.com" });
```

---

## Spread & Rest Operators

Both use `...` but in different contexts:

### Spread — Expands Elements

```javascript
// Arrays
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];       // [1, 2, 3, 4, 5, 6]
const copy = [...arr1];                     // shallow copy

// Objects
const defaults = { theme: "light", lang: "en" };
const userPrefs = { theme: "dark" };
const settings = { ...defaults, ...userPrefs };
// { theme: "dark", lang: "en" } — later spread wins

// Function arguments
const numbers = [3, 1, 4, 1, 5, 9];
Math.max(...numbers);  // 9
```

### Rest — Collects Elements

```javascript
// In function parameters
function sum(...numbers) {
    return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4);  // 10

// In destructuring
const { name, ...rest } = { name: "Alice", age: 25, city: "NYC" };
// name = "Alice", rest = { age: 25, city: "NYC" }

const [first, ...remaining] = [1, 2, 3, 4, 5];
// first = 1, remaining = [2, 3, 4, 5]
```

### Common Patterns

```javascript
// Immutable array operations
const addItem = (arr, item) => [...arr, item];
const removeItem = (arr, index) => [...arr.slice(0, index), ...arr.slice(index + 1)];
const updateItem = (arr, index, newItem) =>
    arr.map((item, i) => i === index ? newItem : item);

// Immutable object update
const updateUser = (user, updates) => ({ ...user, ...updates });
const updatedUser = updateUser(user, { name: "Bob", age: 30 });
```

---

## Modules — import & export

### Named Exports

```javascript
// math.js — named exports
export const PI = 3.14159;

export function add(a, b) {
    return a + b;
}

export function multiply(a, b) {
    return a * b;
}
```

```javascript
// app.js — named imports
import { add, multiply, PI } from "./math.js";

// Rename on import
import { add as sum } from "./math.js";

// Import everything
import * as math from "./math.js";
math.add(1, 2);
math.PI;
```

### Default Export

```javascript
// User.js — ONE default export per file
export default class User {
    constructor(name) {
        this.name = name;
    }
}
```

```javascript
// app.js — no curly braces for default imports
import User from "./User.js";  // name doesn't have to match
import MyUser from "./User.js"; // this also works
```

### Mixed Exports

```javascript
// api.js
export default function fetchData(url) { /* ... */ }
export const BASE_URL = "https://api.example.com";
export const TIMEOUT = 5000;
```

```javascript
// app.js
import fetchData, { BASE_URL, TIMEOUT } from "./api.js";
```

### Re-exports (Barrel Files)

```javascript
// components/index.js — re-export everything from one file
export { default as Button } from "./Button.js";
export { default as Card } from "./Card.js";
export { default as Modal } from "./Modal.js";
```

```javascript
// app.js — clean imports
import { Button, Card, Modal } from "./components";
```

---

## Promises & Async/Await

### The Problem: Callback Hell

```javascript
// ❌ Nested callbacks — "pyramid of doom"
getUser(userId, (user) => {
    getPosts(user.id, (posts) => {
        getComments(posts[0].id, (comments) => {
            console.log(comments);
        });
    });
});
```

### Promises

```javascript
// ✅ Promises — flat chain
getUser(userId)
    .then(user => getPosts(user.id))
    .then(posts => getComments(posts[0].id))
    .then(comments => console.log(comments))
    .catch(error => console.error("Error:", error));
```

### Creating a Promise

```javascript
function fetchUserData(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId > 0) {
                resolve({ id: userId, name: "Alice" });
            } else {
                reject(new Error("Invalid user ID"));
            }
        }, 1000);
    });
}
```

### Async/Await — The Best Way

```javascript
// ✅ async/await — reads like synchronous code
async function loadUserDashboard(userId) {
    try {
        const user = await getUser(userId);
        const posts = await getPosts(user.id);
        const comments = await getComments(posts[0].id);
        console.log({ user, posts, comments });
    } catch (error) {
        console.error("Failed to load dashboard:", error);
    }
}
```

### Parallel Execution

```javascript
// ❌ Sequential — slow (waits for each one)
const users = await fetchUsers();
const posts = await fetchPosts();
const comments = await fetchComments();
// Total time: users + posts + comments

// ✅ Parallel — fast (runs all at once)
const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
]);
// Total time: max(users, posts, comments)

// Promise.allSettled — doesn't fail if one rejects
const results = await Promise.allSettled([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
]);
// results: [{ status: "fulfilled", value: ... }, { status: "rejected", reason: ... }]
```

---

## Array Methods That Replace Loops

### map — Transform Every Item

```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);  // [2, 4, 6, 8, 10]

const users = [{ name: "Alice" }, { name: "Bob" }];
const names = users.map(user => user.name);  // ["Alice", "Bob"]
```

### filter — Keep Items That Pass a Test

```javascript
const numbers = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter(n => n % 2 === 0);  // [2, 4, 6]

const users = [
    { name: "Alice", active: true },
    { name: "Bob", active: false },
    { name: "Charlie", active: true }
];
const activeUsers = users.filter(user => user.active);
```

### reduce — Combine Into Single Value

```javascript
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((total, n) => total + n, 0);  // 15

// Group by category
const items = [
    { name: "Apple", category: "fruit" },
    { name: "Carrot", category: "vegetable" },
    { name: "Banana", category: "fruit" }
];

const grouped = items.reduce((groups, item) => {
    const key = item.category;
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
}, {});
// { fruit: [{...}, {...}], vegetable: [{...}] }
```

### find & findIndex

```javascript
const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" }
];

const bob = users.find(u => u.name === "Bob");      // { id: 2, name: "Bob" }
const bobIndex = users.findIndex(u => u.name === "Bob");  // 1
```

### some & every

```javascript
const ages = [18, 25, 30, 16, 22];

ages.some(age => age < 18);   // true (at least one)
ages.every(age => age >= 18); // false (not all)
```

### flat & flatMap

```javascript
const nested = [[1, 2], [3, 4], [5, 6]];
nested.flat();  // [1, 2, 3, 4, 5, 6]

// flatMap = map + flat(1)
const sentences = ["Hello World", "How are you"];
sentences.flatMap(s => s.split(" "));  // ["Hello", "World", "How", "are", "you"]
```

### Chaining

```javascript
const result = users
    .filter(user => user.active)
    .map(user => user.name)
    .sort()
    .join(", ");
```

---

## Optional Chaining & Nullish Coalescing

### Optional Chaining (`?.`)

```javascript
const user = {
    name: "Alice",
    address: {
        street: "123 Main St"
    }
};

// ❌ Without optional chaining
const zip = user && user.address && user.address.zip;

// ✅ With optional chaining
const zip = user?.address?.zip;  // undefined (no error!)

// Works with methods
const upperName = user?.name?.toUpperCase();  // "ALICE"

// Works with arrays
const firstItem = arr?.[0];

// Works with function calls
const result = obj?.method?.();
```

### Nullish Coalescing (`??`)

```javascript
// || treats 0, "", false as falsy — not always what you want
const count = 0;
const display = count || "No items";    // "No items" — WRONG! 0 is valid

// ?? only treats null/undefined as nullish
const display = count ?? "No items";    // 0 — CORRECT!

const name = "" ?? "Anonymous";         // "" (empty string is NOT nullish)
const name = null ?? "Anonymous";       // "Anonymous"
const name = undefined ?? "Anonymous";  // "Anonymous"
```

### Combination

```javascript
const userName = response?.data?.user?.name ?? "Anonymous";
const port = config?.server?.port ?? 3000;
```

---

## Map, Set, WeakMap, WeakSet

### Map — Key-Value Store (Any Key Type)

```javascript
const map = new Map();

// Any type as key (objects, functions, numbers)
map.set("name", "Alice");
map.set(42, "The Answer");
map.set(true, "Yes");

const userObj = { id: 1 };
map.set(userObj, "User data");

map.get("name");     // "Alice"
map.get(42);         // "The Answer"
map.has("name");     // true
map.size;            // 4
map.delete(42);
map.clear();

// Iteration
for (const [key, value] of map) {
    console.log(`${key}: ${value}`);
}
```

### Set — Unique Values Only

```javascript
const set = new Set([1, 2, 3, 3, 3]);  // {1, 2, 3}

set.add(4);
set.has(3);    // true
set.delete(2);
set.size;      // 3

// Remove duplicates from array
const unique = [...new Set([1, 2, 2, 3, 3, 3])];  // [1, 2, 3]
```

### Map vs Object

| Feature | Map | Object |
|---------|-----|--------|
| **Key types** | Any (objects, functions, etc.) | Strings and Symbols only |
| **Order** | Insertion order guaranteed | Mostly ordered (strings alphabetical) |
| **Size** | `map.size` | `Object.keys(obj).length` |
| **Iteration** | `for...of`, `.forEach()` | `Object.entries()` |
| **Performance** | Better for frequent add/remove | Better for static lookup |

---

## Symbols & Iterators

### Symbols — Unique Identifiers

```javascript
const id = Symbol("id");
const anotherId = Symbol("id");

id === anotherId;  // false — every Symbol is unique

// Use as object keys (won't collide with string keys)
const user = {
    name: "Alice",
    [id]: 42  // Symbol key — hidden from normal iteration
};

user[id];  // 42
Object.keys(user);  // ["name"] — Symbols are not enumerable
```

### Iterators — Custom Iteration

```javascript
const range = {
    from: 1,
    to: 5,

    [Symbol.iterator]() {
        let current = this.from;
        const last = this.to;

        return {
            next() {
                return current <= last
                    ? { value: current++, done: false }
                    : { done: true };
            }
        };
    }
};

for (const num of range) {
    console.log(num);  // 1, 2, 3, 4, 5
}

[...range];  // [1, 2, 3, 4, 5]
```

---

## Proxy & Reflect

Proxy lets you intercept and customize operations on objects:

```javascript
const user = { name: "Alice", age: 25 };

const proxy = new Proxy(user, {
    get(target, prop) {
        console.log(`Getting ${prop}`);
        return Reflect.get(target, prop);
    },

    set(target, prop, value) {
        if (prop === "age" && typeof value !== "number") {
            throw new TypeError("Age must be a number");
        }
        return Reflect.set(target, prop, value);
    }
});

proxy.name;       // logs "Getting name", returns "Alice"
proxy.age = 30;   // works
// proxy.age = "old"; // ❌ TypeError: Age must be a number
```

### Real-World Use: Reactive Data (How Vue.js Works)

```javascript
function reactive(obj, onChange) {
    return new Proxy(obj, {
        set(target, prop, value) {
            const result = Reflect.set(target, prop, value);
            onChange(prop, value);  // trigger re-render
            return result;
        }
    });
}

const state = reactive({ count: 0 }, (prop, value) => {
    console.log(`${prop} changed to ${value}`);
    // Re-render UI here
});

state.count = 5;  // "count changed to 5"
```

---

## Key Takeaways

1. **Use `const` by default, `let` when needed, never `var`**
2. **Arrow functions** are shorter but don't have their own `this`
3. **Template literals** replace string concatenation — use backticks and `${}`
4. **Destructuring** extracts values from objects and arrays cleanly
5. **Spread** copies/merges arrays and objects immutably
6. **`import`/`export`** are the modern module system — use them everywhere
7. **`async`/`await`** makes async code readable — always use `try`/`catch`
8. **`map`, `filter`, `reduce`** replace most `for` loops — learn to chain them
9. **Optional chaining (`?.`)** prevents "cannot read property of undefined" errors
10. **Nullish coalescing (`??`)** is better than `||` for default values when `0`, `""`, `false` are valid

---

## Practice Exercises

1. **Refactor a callback-based function** to use async/await with proper error handling
2. **Build a data processing pipeline** using chained array methods (filter, map, reduce)
3. **Create a module system** — split a project into separate files with import/export
4. **Build a reactive state object** using Proxy that logs every change
5. **Write a utility library** using ES6+ (destructuring, spread, arrow functions, template literals)

---

**Previous:** [← Phase 06 — CSS Architecture & Modern CSS](Phase-06-CSS-Architecture-Modern-CSS.md)
**Next:** [Phase 08 — Browser APIs & Web Storage →](Phase-08-Browser-APIs-Web-Storage.md)
