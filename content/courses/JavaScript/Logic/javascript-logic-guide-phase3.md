# JavaScript Logic Guide - Phase 3

## Table of Contents

10. [Regular Expressions](#regular-expressions)
11. [ES6+ Features](#es6-features)
12. [Advanced Problem Solving](#advanced-problem-solving)
13. [Data Structures & Algorithms](#data-structures--algorithms)
14. [Performance & Optimization](#performance--optimization)
15. [Interview Coding Patterns](#interview-coding-patterns)

---

## Regular Expressions

### RegEx Fundamentals

```javascript
// Creating regular expressions
const regex1 = /pattern/flags;
const regex2 = new RegExp('pattern', 'flags');

// Common flags
const caseInsensitive = /hello/i; // i = case insensitive
const global = /test/g; // g = global (find all matches)
const multiline = /^start/m; // m = multiline
const dotAll = /./s; // s = dot matches newlines
const unicode = /\u{1F600}/u; // u = unicode
const sticky = /pattern/y; // y = sticky

// Basic patterns
const digitPattern = /\d/; // Matches any digit
const wordPattern = /\w/; // Matches word characters
const spacePattern = /\s/; // Matches whitespace

// Character classes
const vowels = /[aeiou]/i;
const consonants = /[^aeiou]/i; // ^ inside [] means NOT
const range = /[a-z]/; // Range of characters
const numbers = /[0-9]/; // Same as \d
const alphanumeric = /[a-zA-Z0-9]/; // Same as \w

// Quantifiers
const optional = /colou?r/; // u is optional (color or colour)
const oneOrMore = /go+d/; // One or more o's (god, good, goood)
const zeroOrMore = /go*d/; // Zero or more o's (gd, god, good)
const exact = /go{2}d/; // Exactly 2 o's (good)
const range = /go{2,4}d/; // 2 to 4 o's (good, goood, gooood)
const atLeast = /go{2,}d/; // At least 2 o's

// Anchors
const startsWith = /^Hello/; // Start of string
const endsWith = /world$/; // End of string
const wholeLine = /^Hello world$/; // Entire string
const wordBoundary = /\bword\b/; // Whole word only

// Groups and capturing
const capture = /(hello) (world)/; // Capture groups
const nonCapture = /(?:hello) (world)/; // Non-capturing group
const namedCapture = /(?<greeting>hello) (?<target>world)/; // Named groups

// Lookahead and lookbehind
const positiveLookahead = /hello(?= world)/; // hello followed by world
const negativeLookahead = /hello(?! world)/; // hello NOT followed by world
const positiveLookbehind = /(?<=hello )world/; // world preceded by hello
const negativeLookbehind = /(?<!hello )world/; // world NOT preceded by hello
```

### RegEx Methods and Applications

```javascript
// String methods with regex
const text = "The phone number is 123-456-7890 and email is john@example.com";

// test() - returns boolean
const phoneRegex = /\d{3}-\d{3}-\d{4}/;
console.log(phoneRegex.test(text)); // true

// match() - returns match details
const emailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
const emailMatch = text.match(emailRegex);
console.log(emailMatch);
// [
//   'john@example.com',
//   'john',
//   'example.com',
//   index: 44,
//   input: '...',
//   groups: undefined
// ]

// matchAll() - returns iterator of all matches
const globalEmailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const multipleEmails = "Contact john@example.com or jane@company.org for help";
const allMatches = [...multipleEmails.matchAll(globalEmailRegex)];
console.log(allMatches);

// search() - returns index of first match
console.log(text.search(phoneRegex)); // Returns index of phone number

// replace() - replace matches
const cleanedText = text.replace(/\d{3}-\d{3}-\d{4}/, "[PHONE REDACTED]");
console.log(cleanedText);

// split() - split using regex
const csv = "name,email,phone\nJohn,john@example.com,123-456-7890";
const rows = csv.split(/\n/);
const columns = rows[1].split(/,/);
console.log(columns);

// Advanced replace with function
const sensitiveText =
    "My SSN is 123-45-6789 and credit card is 4532-1234-5678-9012";
const redacted = sensitiveText.replace(/\d{3}-\d{2}-\d{4}/g, (match) => {
    return "XXX-XX-" + match.slice(-4);
});
console.log(redacted);

// Named capture groups in replace
const dateString = "Today is 2023-12-25";
const reformatted = dateString.replace(
    /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
    "$<month>/$<day>/$<year>"
);
console.log(reformatted); // "Today is 12/25/2023"
```

### Common RegEx Patterns for Development

```javascript
// Validation patterns
const validationPatterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\+?[\d\s\-\(\)]{10,}$/,
    url: /^https?:\/\/([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    ipAddress:
        /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    creditCard: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/,
    ssn: /^\d{3}-?\d{2}-?\d{4}$/,
    zipCode: /^\d{5}(-\d{4})?$/,
    strongPassword:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    username: /^[a-zA-Z0-9_]{3,20}$/,
};

// Validation function
function validate(input, pattern) {
    return validationPatterns[pattern]?.test(input) || false;
}

// Test validations
console.log(validate("john@example.com", "email")); // true
console.log(validate("123-456-7890", "phone")); // true
console.log(validate("Password123!", "strongPassword")); // true

// Text processing patterns
const textProcessors = {
    // Extract URLs from text
    extractUrls: (text) => {
        const urlRegex =
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
        return text.match(urlRegex) || [];
    },

    // Extract hashtags
    extractHashtags: (text) => {
        const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
        return text.match(hashtagRegex) || [];
    },

    // Extract mentions
    extractMentions: (text) => {
        const mentionRegex = /@([a-zA-Z0-9_]+)/g;
        return text.match(mentionRegex) || [];
    },

    // Clean HTML tags
    stripHtml: (html) => {
        return html.replace(/<[^>]*>/g, "");
    },

    // Convert camelCase to kebab-case
    camelToKebab: (str) => {
        return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    },

    // Convert kebab-case to camelCase
    kebabToCamel: (str) => {
        return str.replace(/-([a-z])/g, (match, letter) =>
            letter.toUpperCase()
        );
    },

    // Extract numbers from string
    extractNumbers: (text) => {
        const numberRegex = /\d+\.?\d*/g;
        return text.match(numberRegex)?.map(Number) || [];
    },
};

// Test text processors
const sampleText =
    "Check out https://example.com! #coding #javascript @john_doe";
console.log("URLs:", textProcessors.extractUrls(sampleText));
console.log("Hashtags:", textProcessors.extractHashtags(sampleText));
console.log("Mentions:", textProcessors.extractMentions(sampleText));

// Advanced regex patterns
const advancedPatterns = {
    // Match balanced parentheses (limited depth)
    balancedParens: /\(([^()]|(\([^()]*\)))*\)/g,

    // Match JSON-like structures (simplified)
    jsonPattern: /\{[^{}]*\}/g,

    // Match CSS selectors
    cssSelector: /[.#]?[a-zA-Z][a-zA-Z0-9_-]*(\[[^\]]*\])?(::[a-zA-Z-]+)?/g,

    // Match SQL injection attempts (basic)
    sqlInjection:
        /(union|select|insert|update|delete|drop|create|alter|exec|execute)\s/i,

    // Match version numbers
    version: /v?(\d+)\.(\d+)\.(\d+)(-[a-zA-Z0-9]+)?/,

    // Match time formats
    time24: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    time12: /^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/,
};

// Security-focused regex
function sanitizeInput(input) {
    const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
        /javascript:/gi, // JavaScript protocol
        /on\w+\s*=/gi, // Event handlers
        /data:text\/html/gi, // Data URLs
        /vbscript:/gi, // VBScript protocol
    ];

    let sanitized = input;
    dangerousPatterns.forEach((pattern) => {
        sanitized = sanitized.replace(pattern, "");
    });

    return sanitized;
}

// Performance consideration for regex
function createOptimizedRegex() {
    // Avoid catastrophic backtracking
    const inefficient = /^(a+)+b$/; // Can cause exponential time
    const efficient = /^a+b$/; // Linear time

    // Use non-capturing groups when possible
    const withCapturing = /(hello) (world)/;
    const withoutCapturing = /(?:hello) (?:world)/; // Faster

    // Anchor patterns when possible
    const unanchored = /\d{3}-\d{3}-\d{4}/; // Searches entire string
    const anchored = /^\d{3}-\d{3}-\d{4}$/; // Stops after checking format

    return { efficient, withoutCapturing, anchored };
}
```

---

## ES6+ Features

### Destructuring and Spread/Rest

```javascript
// Array destructuring
const numbers = [1, 2, 3, 4, 5];
const [first, second, ...rest] = numbers;
console.log(first, second, rest); // 1, 2, [3, 4, 5]

// Skipping elements
const [, , third, , fifth] = numbers;
console.log(third, fifth); // 3, 5

// Default values
const [a = 10, b = 20, c = 30] = [1, 2];
console.log(a, b, c); // 1, 2, 30

// Swapping variables
let x = 1,
    y = 2;
[x, y] = [y, x];
console.log(x, y); // 2, 1

// Object destructuring
const person = {
    name: "John",
    age: 30,
    city: "New York",
    country: "USA",
    hobbies: ["reading", "gaming"],
};

const { name, age, ...otherDetails } = person;
console.log(name, age, otherDetails);

// Renaming during destructuring
const { name: fullName, age: years } = person;
console.log(fullName, years); // John, 30

// Nested destructuring
const user = {
    id: 1,
    profile: {
        name: "Jane",
        contact: {
            email: "jane@example.com",
            phone: "123-456-7890",
        },
    },
    settings: {
        theme: "dark",
        notifications: true,
    },
};

const {
    profile: {
        name: userName,
        contact: { email },
    },
    settings: { theme = "light" },
} = user;

console.log(userName, email, theme); // Jane, jane@example.com, dark

// Function parameter destructuring
function greetUser({ name, age = 25, city = "Unknown" }) {
    return `Hello ${name}, age ${age}, from ${city}`;
}

console.log(greetUser({ name: "Bob", city: "Boston" }));

// Array destructuring in function parameters
function calculateStats([min, max, ...values]) {
    const sum = values.reduce((a, b) => a + b, 0);
    return { min, max, average: sum / values.length };
}

console.log(calculateStats([0, 100, 80, 90, 85]));

// Spread operator
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// Copying arrays
const original = [1, 2, 3];
const copy = [...original]; // Shallow copy

// Function calls with spread
function sum(a, b, c) {
    return a + b + c;
}
console.log(sum(...arr1)); // 6

// Object spread
const defaults = { theme: "light", fontSize: 14 };
const userPrefs = { theme: "dark", showSidebar: true };
const finalSettings = { ...defaults, ...userPrefs };
console.log(finalSettings); // { theme: "dark", fontSize: 14, showSidebar: true }

// Rest parameters
function collectArgs(first, ...remaining) {
    console.log("First:", first);
    console.log("Remaining:", remaining);
}

collectArgs(1, 2, 3, 4, 5); // First: 1, Remaining: [2, 3, 4, 5]

// Advanced destructuring patterns
function processApiResponse({
    data: { users = [] } = {},
    meta: { total = 0, page = 1 } = {},
} = {}) {
    return { users, total, page };
}

// Works even with incomplete data
console.log(processApiResponse({})); // { users: [], total: 0, page: 1 }
console.log(processApiResponse({ data: { users: ["John"] } }));
```

### Template Literals and Symbols

```javascript
// Template literals
const name = "John";
const age = 30;
const city = "New York";

// Basic interpolation
const greeting = `Hello, my name is ${name} and I'm ${age} years old.`;

// Multi-line strings
const multiLine = `
    This is a
    multi-line string
    that preserves formatting
`;

// Expression evaluation
const math = `2 + 3 = ${2 + 3}`;
const conditional = `You are ${age >= 18 ? "an adult" : "a minor"}`;

// Function calls in templates
function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

const price = `The price is ${formatCurrency(29.99)}`;

// Tagged template literals
function highlight(strings, ...values) {
    return strings.reduce((result, string, i) => {
        const value = values[i] ? `<mark>${values[i]}</mark>` : "";
        return result + string + value;
    }, "");
}

const highlighted = highlight`Hello ${name}, you are ${age} years old!`;
console.log(highlighted);

// SQL template (be careful with security!)
function sql(strings, ...values) {
    // This is a simplified example - use proper SQL libraries in production
    let query = "";
    strings.forEach((string, i) => {
        query += string;
        if (values[i] !== undefined) {
            // In real implementation, properly escape/parameterize values
            query += `'${values[i]}'`;
        }
    });
    return query;
}

const userId = 123;
const query = sql`SELECT * FROM users WHERE id = ${userId}`;

// Symbols
const sym1 = Symbol();
const sym2 = Symbol("description");
const sym3 = Symbol.for("global-symbol"); // Global symbol registry
const sym4 = Symbol.for("global-symbol"); // Same as sym3

console.log(sym1 === sym2); // false
console.log(sym3 === sym4); // true

// Symbols as object keys
const SECRET_KEY = Symbol("secret");
const user = {
    name: "John",
    [SECRET_KEY]: "confidential data",
};

console.log(user.name); // "John"
console.log(user[SECRET_KEY]); // "confidential data"
console.log(Object.keys(user)); // ["name"] - symbol keys are hidden

// Well-known symbols
const customIterable = {
    data: [1, 2, 3],
    [Symbol.iterator]() {
        let index = 0;
        const data = this.data;
        return {
            next() {
                if (index < data.length) {
                    return { value: data[index++], done: false };
                } else {
                    return { done: true };
                }
            },
        };
    },
};

for (const value of customIterable) {
    console.log(value); // 1, 2, 3
}

// Symbol.toPrimitive
const obj = {
    value: 100,
    [Symbol.toPrimitive](hint) {
        switch (hint) {
            case "number":
                return this.value;
            case "string":
                return `Value: ${this.value}`;
            default:
                return this.value;
        }
    },
};

console.log(+obj); // 100 (number)
console.log(`${obj}`); // "Value: 100" (string)
console.log(obj + 50); // 150 (default)
```

### Sets, Maps, and WeakSets/WeakMaps

```javascript
// Set - unique values
const numbers = new Set([1, 2, 3, 3, 4, 4, 5]);
console.log(numbers); // Set { 1, 2, 3, 4, 5 }

// Set methods
numbers.add(6);
numbers.add(3); // Duplicate ignored
console.log(numbers.has(3)); // true
console.log(numbers.size); // 6
numbers.delete(2);
console.log(numbers); // Set { 1, 3, 4, 5, 6 }

// Set iteration
for (const num of numbers) {
    console.log(num);
}

numbers.forEach((num) => console.log(num));

// Array from Set (remove duplicates)
const array = [1, 2, 2, 3, 3, 3, 4];
const uniqueArray = [...new Set(array)];

// Set operations
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([3, 4, 5, 6]);

// Union
const union = new Set([...set1, ...set2]); // {1, 2, 3, 4, 5, 6}

// Intersection
const intersection = new Set([...set1].filter((x) => set2.has(x))); // {3, 4}

// Difference
const difference = new Set([...set1].filter((x) => !set2.has(x))); // {1, 2}

// Map - key-value pairs with any type as key
const map = new Map();

// Setting values
map.set("string", "value1");
map.set(42, "value2");
map.set(true, "value3");
map.set({}, "value4");

// Getting values
console.log(map.get("string")); // 'value1'
console.log(map.get(42)); // 'value2'
console.log(map.has(true)); // true
console.log(map.size); // 4

// Map from array of pairs
const map2 = new Map([
    ["name", "John"],
    ["age", 30],
    ["city", "New York"],
]);

// Map iteration
for (const [key, value] of map2) {
    console.log(`${key}: ${value}`);
}

map2.forEach((value, key) => {
    console.log(`${key}: ${value}`);
});

// Map vs Object
const objAsMap = Object.create(null); // No prototype
objAsMap["key1"] = "value1";

const actualMap = new Map();
actualMap.set("key1", "value1");

// Maps preserve insertion order, objects don't guarantee it (except for strings)
// Maps can have any type as key, objects only strings/symbols
// Maps have size property, objects need Object.keys(obj).length

// WeakSet - weak references, only objects
const weakSet = new WeakSet();
let obj1 = {};
let obj2 = {};

weakSet.add(obj1);
weakSet.add(obj2);

console.log(weakSet.has(obj1)); // true

// When obj1 is garbage collected, it's automatically removed from WeakSet
obj1 = null; // Remove reference

// WeakMap - weak references for keys
const weakMap = new WeakMap();
let keyObj = {};

weakMap.set(keyObj, "some value");
console.log(weakMap.get(keyObj)); // 'some value'

// Practical use cases
class User {
    constructor(name) {
        this.name = name;
    }
}

// Private data using WeakMap
const privateData = new WeakMap();

class BankAccount {
    constructor(owner, initialBalance) {
        this.owner = owner;
        privateData.set(this, { balance: initialBalance });
    }

    deposit(amount) {
        const data = privateData.get(this);
        data.balance += amount;
        return data.balance;
    }

    withdraw(amount) {
        const data = privateData.get(this);
        if (data.balance >= amount) {
            data.balance -= amount;
            return data.balance;
        }
        throw new Error("Insufficient funds");
    }

    getBalance() {
        return privateData.get(this).balance;
    }
}

const account = new BankAccount("John", 1000);
console.log(account.getBalance()); // 1000
account.deposit(500);
console.log(account.getBalance()); // 1500

// Cache using Map
class Cache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key) {
        if (this.cache.has(key)) {
            // Move to end (LRU behavior)
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return null;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }
}
```

### Proxies and Reflect

```javascript
// Basic Proxy
const target = {
    name: "John",
    age: 30,
};

const handler = {
    get(target, property) {
        console.log(`Getting ${property}`);
        return target[property];
    },

    set(target, property, value) {
        console.log(`Setting ${property} to ${value}`);
        target[property] = value;
        return true;
    },
};

const proxy = new Proxy(target, handler);
console.log(proxy.name); // Logs: "Getting name", then "John"
proxy.age = 31; // Logs: "Setting age to 31"

// Validation Proxy
function createValidatedUser(userData) {
    const validations = {
        name: (value) => typeof value === "string" && value.length > 0,
        age: (value) => typeof value === "number" && value >= 0 && value <= 150,
        email: (value) => typeof value === "string" && value.includes("@"),
    };

    return new Proxy(userData, {
        set(target, property, value) {
            if (validations[property] && !validations[property](value)) {
                throw new Error(`Invalid value for ${property}: ${value}`);
            }
            target[property] = value;
            return true;
        },
    });
}

const user = createValidatedUser({});
user.name = "John"; // OK
user.age = 30; // OK
// user.age = -5; // Error: Invalid value for age: -5

// Default Values Proxy
function withDefaults(target, defaults) {
    return new Proxy(target, {
        get(target, property) {
            return property in target ? target[property] : defaults[property];
        },
    });
}

const config = withDefaults(
    {},
    {
        theme: "light",
        language: "en",
        debugMode: false,
    }
);

console.log(config.theme); // 'light' (from defaults)
config.theme = "dark";
console.log(config.theme); // 'dark' (from target)

// Array-like object with Proxy
function createSmartArray() {
    const data = [];

    return new Proxy(data, {
        get(target, property) {
            if (property === "last") {
                return target[target.length - 1];
            }
            if (property === "first") {
                return target[0];
            }
            if (property === "random") {
                return target[Math.floor(Math.random() * target.length)];
            }
            return Reflect.get(target, property);
        },

        set(target, property, value) {
            if (property === "last") {
                target[target.length - 1] = value;
                return true;
            }
            if (property === "first") {
                target[0] = value;
                return true;
            }
            return Reflect.set(target, property, value);
        },
    });
}

const smartArray = createSmartArray();
smartArray.push(1, 2, 3, 4, 5);
console.log(smartArray.first); // 1
console.log(smartArray.last); // 5
console.log(smartArray.random); // Random element
smartArray.last = 10;
console.log(smartArray); // [1, 2, 3, 4, 10]

// Function interception
function createLoggingFunction(fn, name) {
    return new Proxy(fn, {
        apply(target, thisArg, argumentsList) {
            console.log(`Calling ${name} with args:`, argumentsList);
            const result = Reflect.apply(target, thisArg, argumentsList);
            console.log(`${name} returned:`, result);
            return result;
        },
    });
}

const add = createLoggingFunction((a, b) => a + b, "add");
add(5, 3); // Logs call and result

// Reflect API (companion to Proxy)
const obj = { x: 1, y: 2 };

// Instead of direct property access
console.log(obj.x); // Direct access
console.log(Reflect.get(obj, "x")); // Reflect API

// Reflect provides more control and better error handling
try {
    Object.defineProperty(obj, "z", { value: 3, configurable: false });
    Object.defineProperty(obj, "z", { value: 4 }); // Throws error
} catch (e) {
    console.log("Error with Object.defineProperty");
}

// Reflect returns boolean instead of throwing
const success = Reflect.defineProperty(obj, "z", { value: 4 });
console.log("Define property success:", success); // false

// Reflect methods
const reflectExample = {
    name: "test",
    getValue() {
        return this.name;
    },
};

console.log(Reflect.has(reflectExample, "name")); // true
console.log(Reflect.ownKeys(reflectExample)); // ['name', 'getValue']
console.log(Reflect.apply(reflectExample.getValue, reflectExample, [])); // 'test'

// Revocable Proxy
const revocableProxy = Proxy.revocable(target, {
    get(target, property) {
        return `Accessed: ${target[property]}`;
    },
});

console.log(revocableProxy.proxy.name); // "Accessed: John"
revocableProxy.revoke(); // Revoke the proxy
// console.log(revocableProxy.proxy.name); // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

---

## Advanced Problem Solving

### Common Algorithm Patterns

```javascript
// 1. Two Pointers Pattern
function twoSum(arr, target) {
    const map = new Map();

    for (let i = 0; i < arr.length; i++) {
        const complement = target - arr[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(arr[i], i);
    }

    return [];
}

function threeSum(nums) {
    const result = [];
    nums.sort((a, b) => a - b);

    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue; // Skip duplicates

        let left = i + 1;
        let right = nums.length - 1;

        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];

            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }

    return result;
}

// 2. Sliding Window Pattern
function maxSubarraySum(arr, k) {
    if (arr.length < k) return null;

    let maxSum = 0;
    let windowSum = 0;

    // Calculate sum of first window
    for (let i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    maxSum = windowSum;

    // Slide the window
    for (let i = k; i < arr.length; i++) {
        windowSum = windowSum - arr[i - k] + arr[i];
        maxSum = Math.max(maxSum, windowSum);
    }

    return maxSum;
}

function longestSubstringWithoutRepeating(s) {
    const seen = new Set();
    let left = 0;
    let maxLength = 0;

    for (let right = 0; right < s.length; right++) {
        while (seen.has(s[right])) {
            seen.delete(s[left]);
            left++;
        }
        seen.add(s[right]);
        maxLength = Math.max(maxLength, right - left + 1);
    }

    return maxLength;
}

// 3. Binary Search Pattern
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}

function findFirstBadVersion(n, isBadVersion) {
    let left = 1;
    let right = n;

    while (left < right) {
        const mid = Math.floor((left + right) / 2);

        if (isBadVersion(mid)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }

    return left;
}

// 4. Dynamic Programming Patterns
function fibonacci(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 2) return 1;

    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
    return memo[n];
}

function coinChange(coins, amount) {
    const dp = Array(amount + 1).fill(Infinity);
    dp[0] = 0;

    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }

    return dp[amount] === Infinity ? -1 : dp[amount];
}

function longestIncreasingSubsequence(nums) {
    if (nums.length === 0) return 0;

    const dp = Array(nums.length).fill(1);

    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }

    return Math.max(...dp);
}

// 5. Backtracking Pattern
function permutations(nums) {
    const result = [];
    const current = [];
    const used = new Array(nums.length).fill(false);

    function backtrack() {
        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }

        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;

            current.push(nums[i]);
            used[i] = true;
            backtrack();
            current.pop();
            used[i] = false;
        }
    }

    backtrack();
    return result;
}

function combinations(n, k) {
    const result = [];
    const current = [];

    function backtrack(start) {
        if (current.length === k) {
            result.push([...current]);
            return;
        }

        for (let i = start; i <= n; i++) {
            current.push(i);
            backtrack(i + 1);
            current.pop();
        }
    }

    backtrack(1);
    return result;
}

// 6. Graph Algorithms
function bfs(graph, start) {
    const visited = new Set();
    const queue = [start];
    const result = [];

    visited.add(start);

    while (queue.length > 0) {
        const node = queue.shift();
        result.push(node);

        for (const neighbor of graph[node] || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return result;
}

function dfs(graph, start, visited = new Set(), result = []) {
    visited.add(start);
    result.push(start);

    for (const neighbor of graph[start] || []) {
        if (!visited.has(neighbor)) {
            dfs(graph, neighbor, visited, result);
        }
    }

    return result;
}

function hasPath(graph, start, end) {
    if (start === end) return true;

    const visited = new Set();
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
        const node = queue.shift();

        for (const neighbor of graph[node] || []) {
            if (neighbor === end) return true;

            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return false;
}
```

### String Manipulation Algorithms

```javascript
// 1. Palindrome Problems
function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");
    let left = 0;
    let right = cleaned.length - 1;

    while (left < right) {
        if (cleaned[left] !== cleaned[right]) {
            return false;
        }
        left++;
        right--;
    }

    return true;
}

function longestPalindrome(s) {
    if (s.length < 2) return s;

    let start = 0;
    let maxLength = 1;

    function expandAroundCenter(left, right) {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            const currentLength = right - left + 1;
            if (currentLength > maxLength) {
                start = left;
                maxLength = currentLength;
            }
            left--;
            right++;
        }
    }

    for (let i = 0; i < s.length; i++) {
        expandAroundCenter(i, i); // Odd length palindromes
        expandAroundCenter(i, i + 1); // Even length palindromes
    }

    return s.substring(start, start + maxLength);
}

// 2. Pattern Matching
function naivePatternSearch(text, pattern) {
    const matches = [];

    for (let i = 0; i <= text.length - pattern.length; i++) {
        let j = 0;
        while (j < pattern.length && text[i + j] === pattern[j]) {
            j++;
        }
        if (j === pattern.length) {
            matches.push(i);
        }
    }

    return matches;
}

// KMP Algorithm
function kmpPatternSearch(text, pattern) {
    function buildLPS(pattern) {
        const lps = new Array(pattern.length).fill(0);
        let len = 0;
        let i = 1;

        while (i < pattern.length) {
            if (pattern[i] === pattern[len]) {
                len++;
                lps[i] = len;
                i++;
            } else {
                if (len !== 0) {
                    len = lps[len - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }

        return lps;
    }

    const lps = buildLPS(pattern);
    const matches = [];
    let i = 0; // text index
    let j = 0; // pattern index

    while (i < text.length) {
        if (pattern[j] === text[i]) {
            i++;
            j++;
        }

        if (j === pattern.length) {
            matches.push(i - j);
            j = lps[j - 1];
        } else if (i < text.length && pattern[j] !== text[i]) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }

    return matches;
}

// 3. String Transformations
function editDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1)
        .fill()
        .map(() => Array(n + 1).fill(0));

    // Initialize base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] =
                    1 +
                    Math.min(
                        dp[i - 1][j], // deletion
                        dp[i][j - 1], // insertion
                        dp[i - 1][j - 1] // substitution
                    );
            }
        }
    }

    return dp[m][n];
}

function longestCommonSubsequence(text1, text2) {
    const m = text1.length;
    const n = text2.length;
    const dp = Array(m + 1)
        .fill()
        .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp[m][n];
}

// 4. Anagram Problems
function isAnagram(s, t) {
    if (s.length !== t.length) return false;

    const count = {};

    for (const char of s) {
        count[char] = (count[char] || 0) + 1;
    }

    for (const char of t) {
        if (!count[char]) return false;
        count[char]--;
    }

    return true;
}

function groupAnagrams(strs) {
    const groups = {};

    for (const str of strs) {
        const key = str.split("").sort().join("");
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(str);
    }

    return Object.values(groups);
}
```

---

**This concludes Phase 3 of the JavaScript Logic guide. The final phase will cover Data Structures implementation, Performance Optimization, and specific Interview Coding Patterns with real examples.**
