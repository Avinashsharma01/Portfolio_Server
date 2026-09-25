# JavaScript Logic - Complete Interview & Development Guide

## Table of Contents

1. [Fundamentals & Data Types](#fundamentals--data-types)
2. [Variables & Scope](#variables--scope)
3. [Functions & Closures](#functions--closures)
4. [Arrays & Array Methods](#arrays--array-methods)
5. [Objects & Object Manipulation](#objects--object-manipulation)
6. [Control Flow & Conditionals](#control-flow--conditionals)

---

## Fundamentals & Data Types

### Primitive Data Types

```javascript
// 1. Number
let age = 25;
let price = 99.99;
let infinity = Infinity;
let notANumber = NaN;

console.log(typeof age); // "number"
console.log(Number.isInteger(age)); // true
console.log(Number.isNaN(notANumber)); // true

// Number conversions
console.log(+"123"); // 123 (string to number)
console.log(parseInt("123.45")); // 123
console.log(parseFloat("123.45")); // 123.45
console.log(Number("123")); // 123

// 2. String
let name = "John";
let message = "Hello World";
let template = `Welcome ${name}!`;

// String methods (commonly asked in interviews)
console.log(name.length); // 4
console.log(name.toUpperCase()); // "JOHN"
console.log(name.charAt(0)); // "J"
console.log(name.indexOf("o")); // 1
console.log(name.slice(1, 3)); // "oh"
console.log(name.substring(1, 3)); // "oh"
console.log(name.split("")); // ["J", "o", "h", "n"]

// 3. Boolean
let isActive = true;
let isComplete = false;

// Truthy and Falsy values (VERY important for interviews)
const truthyValues = [true, 1, "hello", [], {}, function () {}];
const falsyValues = [false, 0, "", null, undefined, NaN];

// Testing truthy/falsy
function isTruthy(value) {
    return !!value; // Double negation converts to boolean
}

console.log(isTruthy(0)); // false
console.log(isTruthy("")); // false
console.log(isTruthy([])); // true (empty array is truthy!)
console.log(isTruthy({})); // true (empty object is truthy!)

// 4. Undefined vs Null
let undefinedVar;
let nullVar = null;

console.log(typeof undefinedVar); // "undefined"
console.log(typeof nullVar); // "object" (this is a known quirk!)
console.log(undefinedVar == null); // true (loose equality)
console.log(undefinedVar === null); // false (strict equality)

// 5. Symbol (ES6)
const sym1 = Symbol("description");
const sym2 = Symbol("description");
console.log(sym1 === sym2); // false (symbols are always unique)

// 6. BigInt (ES2020)
const bigNumber = 9007199254740991n;
const anotherBigNumber = BigInt(9007199254740991);
console.log(typeof bigNumber); // "bigint"
```

### Type Coercion (Critical for Interviews)

```javascript
// Implicit Type Coercion Examples
console.log("5" + 3); // "53" (string concatenation)
console.log("5" - 3); // 2 (numeric subtraction)
console.log("5" * 3); // 15 (numeric multiplication)
console.log("5" / 3); // 1.6666... (numeric division)

console.log(true + 1); // 2 (true becomes 1)
console.log(false + 1); // 1 (false becomes 0)
console.log("" + 1); // "1" (empty string + number = string)
console.log(+""); // 0 (unary + converts empty string to 0)

// Comparison quirks
console.log(0 == false); // true
console.log("" == false); // true
console.log(null == undefined); // true
console.log("0" == false); // true
console.log([] == false); // true
console.log({} == false); // false

// Array to primitive conversion
console.log([1, 2] + [3, 4]); // "1,23,4" (arrays become strings)
console.log([] + {}); // "[object Object]"
console.log({} + []); // "[object Object]" or 0 (depends on context)

// Practical coercion function
function toNumber(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        if (value === "") return 0;
        if (value.trim() === "") return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    }
    if (typeof value === "boolean") return value ? 1 : 0;
    if (value === null) return 0;
    if (value === undefined) return NaN;
    return NaN;
}

// Test cases
console.log(toNumber("123")); // 123
console.log(toNumber("  ")); // 0
console.log(toNumber(true)); // 1
console.log(toNumber(null)); // 0
console.log(toNumber(undefined)); // NaN
```

---

## Variables & Scope

### Variable Declarations

```javascript
// 1. var (function-scoped, hoisted)
console.log(hoistedVar); // undefined (not error due to hoisting)
var hoistedVar = "I'm hoisted!";

function varExample() {
    console.log(functionScoped); // undefined
    if (true) {
        var functionScoped = "I'm function scoped";
        var functionScoped = "I can be redeclared"; // No error
    }
    console.log(functionScoped); // "I can be redeclared"
}
varExample();

// 2. let (block-scoped, temporal dead zone)
// console.log(temporalDeadZone); // ReferenceError
let temporalDeadZone = "I'm in temporal dead zone until this line";

function letExample() {
    let blockScoped = "outer";

    if (true) {
        let blockScoped = "inner"; // Different variable
        console.log(blockScoped); // "inner"
    }

    console.log(blockScoped); // "outer"

    // let blockScoped = "error"; // SyntaxError: redeclaration
}
letExample();

// 3. const (block-scoped, must be initialized, temporal dead zone)
const CONSTANT = "I can't be reassigned";
// CONSTANT = "error"; // TypeError

// But objects and arrays can be mutated
const obj = { name: "John" };
obj.name = "Jane"; // This is allowed
obj.age = 30; // This is allowed
console.log(obj); // { name: "Jane", age: 30 }

const arr = [1, 2, 3];
arr.push(4); // This is allowed
console.log(arr); // [1, 2, 3, 4]

// To make objects truly immutable
const frozenObj = Object.freeze({ name: "John" });
// frozenObj.name = "Jane"; // Silently fails in non-strict mode, throws in strict
```

### Scope and Closures (Very Important for Interviews)

```javascript
// Lexical Scope
function outerFunction(x) {
    // Outer scope

    function innerFunction(y) {
        // Inner scope has access to outer scope
        console.log(x + y); // Can access 'x' from outer scope
    }

    return innerFunction;
}

const addFive = outerFunction(5);
addFive(3); // 8

// Closure Examples
function createCounter() {
    let count = 0;

    return {
        increment: () => ++count,
        decrement: () => --count,
        getValue: () => count,
    };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getValue()); // 2
// console.log(count); // ReferenceError - count is private

// Module Pattern with Closure
const bankAccount = (function (initialBalance) {
    let balance = initialBalance;

    return {
        deposit(amount) {
            if (amount > 0) {
                balance += amount;
                return balance;
            }
            throw new Error("Amount must be positive");
        },

        withdraw(amount) {
            if (amount > 0 && amount <= balance) {
                balance -= amount;
                return balance;
            }
            throw new Error("Invalid withdrawal amount");
        },

        getBalance() {
            return balance;
        },
    };
})(100); // IIFE with initial balance

console.log(bankAccount.getBalance()); // 100
console.log(bankAccount.deposit(50)); // 150
console.log(bankAccount.withdraw(30)); // 120

// Common Interview Question: Loop with Closure
// Problem: All buttons alert "3"
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log("var loop:", i), 100); // 3, 3, 3
}

// Solution 1: Use let
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log("let loop:", i), 200); // 0, 1, 2
}

// Solution 2: Use closure
for (var i = 0; i < 3; i++) {
    (function (index) {
        setTimeout(() => console.log("closure loop:", index), 300); // 0, 1, 2
    })(i);
}

// Solution 3: Bind
for (var i = 0; i < 3; i++) {
    setTimeout(console.log.bind(null, "bind loop:", i), 400); // 0, 1, 2
}
```

---

## Functions & Closures

### Function Declarations vs Expressions

```javascript
// Function Declaration (hoisted)
console.log(declaredFunction()); // "I'm hoisted!"

function declaredFunction() {
    return "I'm hoisted!";
}

// Function Expression (not hoisted)
// console.log(expressedFunction()); // TypeError: expressedFunction is not a function

var expressedFunction = function () {
    return "I'm not hoisted!";
};

// Named Function Expression
const namedExpression = function myFunction() {
    // 'myFunction' is only available inside this function
    return "Named expression";
};

// Arrow Functions (ES6)
const arrowFunction = () => "I'm an arrow function";
const arrowWithParam = (x) => x * 2;
const arrowWithMultipleParams = (x, y) => x + y;
const arrowWithBlock = (x) => {
    const result = x * 2;
    return result;
};

// Arrow functions and 'this' binding
function TraditionalFunction() {
    this.value = 42;

    // Traditional function has its own 'this'
    setTimeout(function () {
        console.log("Traditional 'this':", this.value); // undefined (global context)
    }, 100);

    // Arrow function inherits 'this' from parent scope
    setTimeout(() => {
        console.log("Arrow 'this':", this.value); // 42
    }, 200);
}

new TraditionalFunction();
```

### Advanced Function Concepts

```javascript
// Higher-Order Functions
function higherOrderFunction(callback) {
    return callback("Hello from higher-order function!");
}

function processMessage(message) {
    return message.toUpperCase();
}

console.log(higherOrderFunction(processMessage));

// Function that returns a function
function multiplier(factor) {
    return function (number) {
        return number * factor;
    };
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// Currying
function curry(func) {
    return function curried(...args) {
        if (args.length >= func.length) {
            return func.apply(this, args);
        } else {
            return function (...nextArgs) {
                return curried.apply(this, args.concat(nextArgs));
            };
        }
    };
}

function add(a, b, c) {
    return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6

// Partial Application
function partial(func, ...presetArgs) {
    return function (...laterArgs) {
        return func(...presetArgs, ...laterArgs);
    };
}

const addTen = partial(add, 10);
console.log(addTen(5, 5)); // 20

// Memoization (Caching function results)
function memoize(func) {
    const cache = {};

    return function (...args) {
        const key = JSON.stringify(args);

        if (key in cache) {
            console.log("Cache hit!");
            return cache[key];
        }

        console.log("Computing...");
        const result = func.apply(this, args);
        cache[key] = result;
        return result;
    };
}

const expensiveFunction = memoize(function (n) {
    let result = 0;
    for (let i = 0; i < n; i++) {
        result += i;
    }
    return result;
});

console.log(expensiveFunction(1000)); // Computing... 499500
console.log(expensiveFunction(1000)); // Cache hit! 499500

// Function Composition
const compose =
    (...functions) =>
    (value) =>
        functions.reduceRight((acc, func) => func(acc), value);

const pipe =
    (...functions) =>
    (value) =>
        functions.reduce((acc, func) => func(acc), value);

const addOne = (x) => x + 1;
const double = (x) => x * 2;
const square = (x) => x * x;

const composed = compose(square, double, addOne);
const piped = pipe(addOne, double, square);

console.log(composed(3)); // square(double(addOne(3))) = square(double(4)) = square(8) = 64
console.log(piped(3)); // square(double(addOne(3))) = square(double(4)) = square(8) = 64
```

### Function Methods: call, apply, bind

```javascript
const person = {
    name: "John",
    age: 30,
};

const anotherPerson = {
    name: "Jane",
    age: 25,
};

function introduce(greeting, punctuation) {
    return `${greeting}, I'm ${this.name} and I'm ${this.age} years old${punctuation}`;
}

// call() - invokes function with specific 'this' and arguments
console.log(introduce.call(person, "Hello", "!"));
// "Hello, I'm John and I'm 30 years old!"

console.log(introduce.call(anotherPerson, "Hi", "."));
// "Hi, I'm Jane and I'm 25 years old."

// apply() - same as call but takes array of arguments
console.log(introduce.apply(person, ["Greetings", "..."]));
// "Greetings, I'm John and I'm 30 years old..."

// bind() - returns new function with bound 'this'
const boundIntroduce = introduce.bind(person);
console.log(boundIntroduce("Hey", "!!"));
// "Hey, I'm John and I'm 30 years old!!"

// Partial binding
const boundWithGreeting = introduce.bind(person, "Good morning");
console.log(boundWithGreeting("!"));
// "Good morning, I'm John and I'm 30 years old!"

// Practical example: Event handlers
class Button {
    constructor(element) {
        this.element = element;
        this.clickCount = 0;

        // Without bind, 'this' would refer to the button element
        this.element.addEventListener("click", this.handleClick.bind(this));
    }

    handleClick(event) {
        this.clickCount++;
        console.log(`Button clicked ${this.clickCount} times`);
    }
}

// Borrowing methods
const obj1 = {
    name: "Object 1",
    greet() {
        return `Hello from ${this.name}`;
    },
};

const obj2 = {
    name: "Object 2",
};

// Borrow greet method from obj1
console.log(obj1.greet.call(obj2)); // "Hello from Object 2"
```

---

## Arrays & Array Methods

### Basic Array Operations

```javascript
// Array Creation
const arr1 = [1, 2, 3, 4, 5];
const arr2 = new Array(5); // Creates array with 5 empty slots
const arr3 = Array.of(1, 2, 3); // [1, 2, 3]
const arr4 = Array.from("hello"); // ["h", "e", "l", "l", "o"]
const arr5 = Array.from({ length: 3 }, (_, i) => i); // [0, 1, 2]

// Array Properties and Basic Methods
console.log(arr1.length); // 5
console.log(Array.isArray(arr1)); // true

// Mutating methods (modify original array)
const fruits = ["apple", "banana"];

// Adding elements
fruits.push("orange"); // Adds to end, returns new length
fruits.unshift("grape"); // Adds to beginning, returns new length
console.log(fruits); // ["grape", "apple", "banana", "orange"]

// Removing elements
const lastFruit = fruits.pop(); // Removes from end, returns removed element
const firstFruit = fruits.shift(); // Removes from beginning, returns removed element
console.log(fruits); // ["apple", "banana"]
console.log(lastFruit, firstFruit); // "orange" "grape"

// Splice - adds/removes elements at any position
const numbers = [1, 2, 3, 4, 5];
const removed = numbers.splice(2, 2, "a", "b"); // Start at index 2, remove 2 elements, add "a", "b"
console.log(numbers); // [1, 2, "a", "b", 5]
console.log(removed); // [3, 4]

// Non-mutating methods (return new array)
const originalArray = [1, 2, 3, 4, 5];

// Slice - extracts section of array
const sliced = originalArray.slice(1, 4); // [2, 3, 4]
console.log(originalArray); // [1, 2, 3, 4, 5] (unchanged)

// Concat - joins arrays
const arr6 = [1, 2];
const arr7 = [3, 4];
const concatenated = arr6.concat(arr7, [5, 6]); // [1, 2, 3, 4, 5, 6]

// Spread operator (ES6) - modern way to concat
const spread = [...arr6, ...arr7, 5, 6]; // [1, 2, 3, 4, 5, 6]
```

### Array Iteration Methods (Very Important for Interviews)

```javascript
const numbers = [1, 2, 3, 4, 5];
const people = [
    { name: "John", age: 30, city: "New York" },
    { name: "Jane", age: 25, city: "London" },
    { name: "Bob", age: 35, city: "Paris" },
    { name: "Alice", age: 28, city: "New York" },
];

// 1. forEach - executes function for each element
numbers.forEach((num, index, array) => {
    console.log(`Index ${index}: ${num}`);
});

// 2. map - creates new array with transformed elements
const doubled = numbers.map((num) => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

const names = people.map((person) => person.name);
console.log(names); // ["John", "Jane", "Bob", "Alice"]

// 3. filter - creates new array with elements that pass test
const evens = numbers.filter((num) => num % 2 === 0);
console.log(evens); // [2, 4]

const adults = people.filter((person) => person.age >= 30);
console.log(adults); // [John, Bob]

// 4. find - returns first element that passes test
const firstAdult = people.find((person) => person.age >= 30);
console.log(firstAdult); // { name: "John", age: 30, city: "New York" }

// 5. findIndex - returns index of first element that passes test
const firstAdultIndex = people.findIndex((person) => person.age >= 30);
console.log(firstAdultIndex); // 0

// 6. some - tests if at least one element passes test
const hasAdults = people.some((person) => person.age >= 30);
console.log(hasAdults); // true

// 7. every - tests if all elements pass test
const allAdults = people.every((person) => person.age >= 18);
console.log(allAdults); // true

// 8. reduce - reduces array to single value
const sum = numbers.reduce((accumulator, current) => accumulator + current, 0);
console.log(sum); // 15

// More complex reduce examples
const totalAge = people.reduce((sum, person) => sum + person.age, 0);
console.log(totalAge); // 118

// Group people by city
const peopleByCity = people.reduce((acc, person) => {
    if (!acc[person.city]) {
        acc[person.city] = [];
    }
    acc[person.city].push(person);
    return acc;
}, {});
console.log(peopleByCity);
// {
//   "New York": [John, Alice],
//   "London": [Jane],
//   "Paris": [Bob]
// }

// 9. reduceRight - same as reduce but from right to left
const reversedString = ["a", "b", "c", "d"].reduceRight(
    (acc, char) => acc + char,
    ""
);
console.log(reversedString); // "dcba"
```

### Advanced Array Techniques

```javascript
// Chaining array methods
const result = people
    .filter((person) => person.age >= 25)
    .map((person) => ({
        ...person,
        ageGroup: person.age >= 30 ? "adult" : "young",
    }))
    .sort((a, b) => a.age - b.age);

console.log(result);

// Flattening arrays
const nested = [
    [1, 2],
    [3, 4],
    [5, 6],
];

// flat() method (ES2019)
const flattened = nested.flat();
console.log(flattened); // [1, 2, 3, 4, 5, 6]

// Deep flattening
const deepNested = [1, [2, [3, [4, 5]]]];
const deepFlattened = deepNested.flat(Infinity);
console.log(deepFlattened); // [1, 2, 3, 4, 5]

// flatMap() - map then flat
const sentences = ["hello world", "how are you"];
const words = sentences.flatMap((sentence) => sentence.split(" "));
console.log(words); // ["hello", "world", "how", "are", "you"]

// Manual flatten implementation
function flatten(arr) {
    return arr.reduce((acc, val) => {
        if (Array.isArray(val)) {
            return acc.concat(flatten(val));
        }
        return acc.concat(val);
    }, []);
}

// Array-like objects to arrays
function convertToArray() {
    // arguments is array-like but not array
    const argsArray = Array.from(arguments);
    // or using spread: [...arguments]
    return argsArray;
}

console.log(convertToArray(1, 2, 3, 4)); // [1, 2, 3, 4]

// Remove duplicates
const duplicates = [1, 2, 2, 3, 3, 3, 4, 5, 5];

// Using Set
const unique1 = [...new Set(duplicates)];

// Using filter + indexOf
const unique2 = duplicates.filter(
    (item, index) => duplicates.indexOf(item) === index
);

// Using reduce
const unique3 = duplicates.reduce((acc, current) => {
    if (!acc.includes(current)) {
        acc.push(current);
    }
    return acc;
}, []);

console.log(unique1, unique2, unique3); // All: [1, 2, 3, 4, 5]

// Array intersection, union, difference
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [3, 4, 5, 6, 7];

const intersection = arr1.filter((x) => arr2.includes(x)); // [3, 4, 5]
const union = [...new Set([...arr1, ...arr2])]; // [1, 2, 3, 4, 5, 6, 7]
const difference = arr1.filter((x) => !arr2.includes(x)); // [1, 2]

// Sorting arrays
const unsorted = [3, 1, 4, 1, 5, 9, 2, 6, 5];

// Numbers (default sort is lexicographic)
console.log(unsorted.sort()); // [1, 1, 2, 3, 4, 5, 5, 6, 9] - works for single digits
console.log([10, 2, 1, 20].sort()); // [1, 10, 2, 20] - wrong for multi-digit

// Correct numeric sort
console.log([10, 2, 1, 20].sort((a, b) => a - b)); // [1, 2, 10, 20]
console.log([10, 2, 1, 20].sort((a, b) => b - a)); // [20, 10, 2, 1] descending

// Sort objects
const sortedByAge = people.sort((a, b) => a.age - b.age);
const sortedByName = people.sort((a, b) => a.name.localeCompare(b.name));
```

---

## Objects & Object Manipulation

### Object Creation and Properties

```javascript
// Object creation methods
const obj1 = {}; // Object literal
const obj2 = new Object(); // Constructor
const obj3 = Object.create(null); // No prototype
const obj4 = Object.create(Object.prototype); // Same as {}

// Object with properties
const person = {
    name: "John",
    age: 30,
    city: "New York",

    // Method
    greet() {
        return `Hello, I'm ${this.name}`;
    },

    // Getter
    get fullInfo() {
        return `${this.name}, ${this.age}, ${this.city}`;
    },

    // Setter
    set fullName(value) {
        [this.firstName, this.lastName] = value.split(" ");
    },
};

// Property access
console.log(person.name); // Dot notation
console.log(person["age"]); // Bracket notation
console.log(person["city"]); // Useful for dynamic properties

const propName = "name";
console.log(person[propName]); // "John"

// Dynamic property names (ES6)
const dynamicKey = "hobby";
const personWithDynamicProp = {
    name: "Jane",
    [dynamicKey]: "reading", // Computed property name
    [`${dynamicKey}Level`]: "advanced",
};

console.log(personWithDynamicProp); // { name: "Jane", hobby: "reading", hobbyLevel: "advanced" }
```

### Object Methods and Property Descriptors

```javascript
// Object.keys, Object.values, Object.entries
const user = {
    id: 1,
    name: "John",
    email: "john@example.com",
    active: true,
};

console.log(Object.keys(user)); // ["id", "name", "email", "active"]
console.log(Object.values(user)); // [1, "John", "john@example.com", true]
console.log(Object.entries(user)); // [["id", 1], ["name", "John"], ...]

// Convert back from entries
const reconstructed = Object.fromEntries(Object.entries(user));
console.log(reconstructed); // Same as original user object

// Property descriptors
Object.defineProperty(user, "password", {
    value: "secret123",
    writable: false, // Cannot be changed
    enumerable: false, // Won't show in for...in or Object.keys
    configurable: false, // Cannot be deleted or reconfigured
});

console.log(user.password); // "secret123"
user.password = "newpassword"; // Silently fails (throws in strict mode)
console.log(user.password); // Still "secret123"
console.log(Object.keys(user)); // password not included

// Multiple properties at once
Object.defineProperties(user, {
    createdAt: {
        value: new Date(),
        writable: false,
        enumerable: true,
    },
    version: {
        value: 1,
        writable: true,
        enumerable: false,
    },
});

// Get property descriptor
console.log(Object.getOwnPropertyDescriptor(user, "name"));
// { value: "John", writable: true, enumerable: true, configurable: true }

// Check if property exists
console.log("name" in user); // true
console.log(user.hasOwnProperty("name")); // true
console.log(user.hasOwnProperty("toString")); // false (inherited)

// Object.assign - shallow copy/merge
const defaults = { theme: "light", lang: "en" };
const userPrefs = { theme: "dark" };
const settings = Object.assign({}, defaults, userPrefs);
console.log(settings); // { theme: "dark", lang: "en" }

// Spread operator (ES6) - modern alternative
const settingsSpread = { ...defaults, ...userPrefs };
console.log(settingsSpread); // { theme: "dark", lang: "en" }
```

### Object Cloning and Comparison

```javascript
// Shallow vs Deep cloning
const original = {
    name: "John",
    age: 30,
    address: {
        street: "123 Main St",
        city: "New York",
    },
    hobbies: ["reading", "gaming"],
};

// Shallow copy methods
const shallow1 = Object.assign({}, original);
const shallow2 = { ...original };

// Modify nested object
shallow1.address.city = "Boston";
console.log(original.address.city); // "Boston" - original is affected!

// Deep cloning methods
// 1. JSON method (limitations: no functions, dates become strings, etc.)
const deep1 = JSON.parse(JSON.stringify(original));

// 2. Custom deep clone function
function deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
        return obj.map((item) => deepClone(item));
    }

    if (typeof obj === "object") {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
}

const deep2 = deepClone(original);
deep2.address.city = "Chicago";
console.log(original.address.city); // Still "Boston" - not affected

// Object comparison
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, b: 2 };
const obj3 = obj1;

console.log(obj1 === obj2); // false (different references)
console.log(obj1 === obj3); // true (same reference)

// Deep equality function
function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;

    if (obj1 == null || obj2 == null) return false;

    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 !== "object") return obj1 === obj2;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
}

console.log(deepEqual(obj1, obj2)); // true
console.log(deepEqual({ a: 1 }, { a: 1, b: 2 })); // false
```

### Prototypes and Inheritance

```javascript
// Constructor function pattern
function Person(name, age) {
    this.name = name;
    this.age = age;
}

Person.prototype.greet = function () {
    return `Hello, I'm ${this.name}`;
};

Person.prototype.getAgeGroup = function () {
    return this.age >= 18 ? "adult" : "minor";
};

const john = new Person("John", 30);
console.log(john.greet()); // "Hello, I'm John"
console.log(john.getAgeGroup()); // "adult"

// ES6 Class syntax (syntactic sugar over prototypes)
class ModernPerson {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    greet() {
        return `Hello, I'm ${this.name}`;
    }

    static getSpecies() {
        return "Homo sapiens";
    }

    get ageGroup() {
        return this.age >= 18 ? "adult" : "minor";
    }

    set fullName(value) {
        [this.firstName, this.lastName] = value.split(" ");
    }
}

// Inheritance
class Employee extends ModernPerson {
    constructor(name, age, position) {
        super(name, age); // Call parent constructor
        this.position = position;
    }

    greet() {
        return `${super.greet()}, I work as a ${this.position}`;
    }

    work() {
        return `${this.name} is working as a ${this.position}`;
    }
}

const employee = new Employee("Jane", 28, "Developer");
console.log(employee.greet()); // "Hello, I'm Jane, I work as a Developer"
console.log(employee.work()); // "Jane is working as a Developer"

// Prototype chain checking
console.log(employee instanceof Employee); // true
console.log(employee instanceof ModernPerson); // true
console.log(employee instanceof Object); // true

console.log(Employee.prototype.isPrototypeOf(employee)); // true
console.log(ModernPerson.prototype.isPrototypeOf(employee)); // true

// Object.create for prototype-based inheritance
const personPrototype = {
    greet() {
        return `Hello, I'm ${this.name}`;
    },
};

const anotherPerson = Object.create(personPrototype);
anotherPerson.name = "Bob";
console.log(anotherPerson.greet()); // "Hello, I'm Bob"
```

---

## Control Flow & Conditionals

### If Statements and Ternary Operators

```javascript
// Basic if-else
const age = 20;

if (age >= 18) {
    console.log("You are an adult");
} else {
    console.log("You are a minor");
}

// Multiple conditions
const score = 85;

if (score >= 90) {
    console.log("Grade A");
} else if (score >= 80) {
    console.log("Grade B");
} else if (score >= 70) {
    console.log("Grade C");
} else if (score >= 60) {
    console.log("Grade D");
} else {
    console.log("Grade F");
}

// Ternary operator
const status = age >= 18 ? "adult" : "minor";
const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F";

// Logical operators for control flow
const user = { name: "John", isActive: true, role: "admin" };

// Logical AND for conditional execution
user.isActive && console.log("User is active");

// Logical OR for default values
const displayName = user.displayName || user.name || "Anonymous";

// Nullish coalescing operator (ES2020)
const username = user.username ?? "guest"; // Only null or undefined trigger default

// Short-circuit evaluation
function expensiveOperation() {
    console.log("Expensive operation executed");
    return true;
}

// Only executes if first condition is true
true && expensiveOperation(); // Executes
false && expensiveOperation(); // Doesn't execute

// Guard clauses pattern
function processUser(user) {
    // Early returns instead of nested if statements
    if (!user) {
        throw new Error("User is required");
    }

    if (!user.isActive) {
        return { error: "User is not active" };
    }

    if (!user.permissions || user.permissions.length === 0) {
        return { error: "User has no permissions" };
    }

    // Main logic here
    return { success: true, data: user };
}
```

### Switch Statements

```javascript
// Basic switch
function getDayType(day) {
    switch (day.toLowerCase()) {
        case "monday":
        case "tuesday":
        case "wednesday":
        case "thursday":
        case "friday":
            return "weekday";
        case "saturday":
        case "sunday":
            return "weekend";
        default:
            return "invalid day";
    }
}

// Switch with complex expressions
function getShippingCost(weight, destination) {
    switch (true) {
        case weight <= 1:
            return 5;
        case weight <= 5:
            return 10;
        case weight <= 10:
            return 15;
        case destination === "international":
            return weight * 3;
        default:
            return weight * 2;
    }
}

// Object-based alternative to switch (often more readable)
const dayTypeMap = {
    monday: "weekday",
    tuesday: "weekday",
    wednesday: "weekday",
    thursday: "weekday",
    friday: "weekday",
    saturday: "weekend",
    sunday: "weekend",
};

function getDayTypeModern(day) {
    return dayTypeMap[day.toLowerCase()] || "invalid day";
}

// Function map for complex logic
const operationMap = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => (b !== 0 ? a / b : "Cannot divide by zero"),
    power: (a, b) => Math.pow(a, b),
};

function calculate(operation, a, b) {
    const fn = operationMap[operation];
    return fn ? fn(a, b) : "Invalid operation";
}

console.log(calculate("add", 5, 3)); // 8
console.log(calculate("power", 2, 3)); // 8
console.log(calculate("invalid", 1, 2)); // "Invalid operation"
```

---

**This concludes Phase 1 of the JavaScript Logic guide. The next phase will cover Loops & Iteration, Asynchronous JavaScript, Error Handling, and more advanced topics.**
