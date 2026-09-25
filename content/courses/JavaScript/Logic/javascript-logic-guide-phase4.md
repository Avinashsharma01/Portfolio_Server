# JavaScript Logic Guide - Phase 4 (Final)

## Table of Contents

13. [Data Structures Implementation](#data-structures-implementation)
14. [Performance & Optimization](#performance--optimization)
15. [Interview Coding Patterns](#interview-coding-patterns)
16. [System Design Concepts](#system-design-concepts)
17. [Testing Patterns](#testing-patterns)
18. [Production-Ready Code](#production-ready-code)

---

## Data Structures Implementation

### Stack and Queue

```javascript
// Stack Implementation
class Stack {
    constructor() {
        this.items = [];
        this.count = 0;
    }

    push(item) {
        this.items[this.count] = item;
        this.count++;
        return this.count;
    }

    pop() {
        if (this.count === 0) return undefined;
        this.count--;
        const item = this.items[this.count];
        delete this.items[this.count];
        return item;
    }

    peek() {
        return this.items[this.count - 1];
    }

    isEmpty() {
        return this.count === 0;
    }

    size() {
        return this.count;
    }

    clear() {
        this.items = [];
        this.count = 0;
    }
}

// Stack applications
function balancedParentheses(str) {
    const stack = new Stack();
    const opening = "({[";
    const closing = ")}]";
    const pairs = { ")": "(", "}": "{", "]": "[" };

    for (const char of str) {
        if (opening.includes(char)) {
            stack.push(char);
        } else if (closing.includes(char)) {
            if (stack.isEmpty() || stack.pop() !== pairs[char]) {
                return false;
            }
        }
    }

    return stack.isEmpty();
}

function evaluatePostfix(expression) {
    const stack = new Stack();
    const tokens = expression.split(" ");
    const operators = ["+", "-", "*", "/"];

    for (const token of tokens) {
        if (operators.includes(token)) {
            const b = stack.pop();
            const a = stack.pop();

            switch (token) {
                case "+":
                    stack.push(a + b);
                    break;
                case "-":
                    stack.push(a - b);
                    break;
                case "*":
                    stack.push(a * b);
                    break;
                case "/":
                    stack.push(a / b);
                    break;
            }
        } else {
            stack.push(parseFloat(token));
        }
    }

    return stack.pop();
}

// Queue Implementation
class Queue {
    constructor() {
        this.items = {};
        this.front = 0;
        this.rear = 0;
    }

    enqueue(item) {
        this.items[this.rear] = item;
        this.rear++;
        return this.size();
    }

    dequeue() {
        if (this.isEmpty()) return undefined;

        const item = this.items[this.front];
        delete this.items[this.front];
        this.front++;
        return item;
    }

    peek() {
        return this.items[this.front];
    }

    isEmpty() {
        return this.rear - this.front === 0;
    }

    size() {
        return this.rear - this.front;
    }

    clear() {
        this.items = {};
        this.front = 0;
        this.rear = 0;
    }
}

// Priority Queue
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(item, priority) {
        const queueItem = { item, priority };
        let added = false;

        for (let i = 0; i < this.items.length; i++) {
            if (queueItem.priority < this.items[i].priority) {
                this.items.splice(i, 0, queueItem);
                added = true;
                break;
            }
        }

        if (!added) {
            this.items.push(queueItem);
        }
    }

    dequeue() {
        return this.items.shift()?.item;
    }

    front() {
        return this.items[0]?.item;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }
}

// Deque (Double-ended queue)
class Deque {
    constructor() {
        this.items = {};
        this.front = 0;
        this.rear = 0;
    }

    addFront(item) {
        this.front--;
        this.items[this.front] = item;
    }

    addRear(item) {
        this.items[this.rear] = item;
        this.rear++;
    }

    removeFront() {
        if (this.isEmpty()) return undefined;
        const item = this.items[this.front];
        delete this.items[this.front];
        this.front++;
        return item;
    }

    removeRear() {
        if (this.isEmpty()) return undefined;
        this.rear--;
        const item = this.items[this.rear];
        delete this.items[this.rear];
        return item;
    }

    peekFront() {
        return this.items[this.front];
    }

    peekRear() {
        return this.items[this.rear - 1];
    }

    isEmpty() {
        return this.rear - this.front === 0;
    }

    size() {
        return this.rear - this.front;
    }
}
```

### Linked Lists

```javascript
// Node class
class ListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// Singly Linked List
class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    append(data) {
        const newNode = new ListNode(data);

        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.size++;
    }

    prepend(data) {
        const newNode = new ListNode(data);
        newNode.next = this.head;
        this.head = newNode;
        this.size++;
    }

    insert(index, data) {
        if (index < 0 || index > this.size) {
            throw new Error("Index out of bounds");
        }

        if (index === 0) {
            this.prepend(data);
            return;
        }

        const newNode = new ListNode(data);
        let current = this.head;

        for (let i = 0; i < index - 1; i++) {
            current = current.next;
        }

        newNode.next = current.next;
        current.next = newNode;
        this.size++;
    }

    remove(index) {
        if (index < 0 || index >= this.size) {
            throw new Error("Index out of bounds");
        }

        if (index === 0) {
            this.head = this.head.next;
            this.size--;
            return;
        }

        let current = this.head;
        for (let i = 0; i < index - 1; i++) {
            current = current.next;
        }

        current.next = current.next.next;
        this.size--;
    }

    find(data) {
        let current = this.head;
        let index = 0;

        while (current) {
            if (current.data === data) {
                return index;
            }
            current = current.next;
            index++;
        }

        return -1;
    }

    reverse() {
        let prev = null;
        let current = this.head;

        while (current) {
            const next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }

        this.head = prev;
    }

    toArray() {
        const result = [];
        let current = this.head;

        while (current) {
            result.push(current.data);
            current = current.next;
        }

        return result;
    }

    // Detect cycle (Floyd's algorithm)
    hasCycle() {
        if (!this.head || !this.head.next) return false;

        let slow = this.head;
        let fast = this.head.next;

        while (fast && fast.next) {
            if (slow === fast) return true;
            slow = slow.next;
            fast = fast.next.next;
        }

        return false;
    }

    // Find middle element
    findMiddle() {
        if (!this.head) return null;

        let slow = this.head;
        let fast = this.head;

        while (fast.next && fast.next.next) {
            slow = slow.next;
            fast = fast.next.next;
        }

        return slow.data;
    }
}

// Doubly Linked List
class DoublyListNode {
    constructor(data) {
        this.data = data;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    append(data) {
        const newNode = new DoublyListNode(data);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }

        this.size++;
    }

    prepend(data) {
        const newNode = new DoublyListNode(data);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }

        this.size++;
    }

    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }

        this.size--;
    }
}
```

### Trees and Graphs

```javascript
// Binary Tree Node
class TreeNode {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

// Binary Search Tree
class BST {
    constructor() {
        this.root = null;
    }

    insert(data) {
        const newNode = new TreeNode(data);

        if (!this.root) {
            this.root = newNode;
            return;
        }

        let current = this.root;
        while (true) {
            if (data < current.data) {
                if (!current.left) {
                    current.left = newNode;
                    break;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    break;
                }
                current = current.right;
            }
        }
    }

    search(data) {
        let current = this.root;

        while (current) {
            if (data === current.data) {
                return true;
            } else if (data < current.data) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return false;
    }

    // Tree traversals
    inOrder(node = this.root, result = []) {
        if (node) {
            this.inOrder(node.left, result);
            result.push(node.data);
            this.inOrder(node.right, result);
        }
        return result;
    }

    preOrder(node = this.root, result = []) {
        if (node) {
            result.push(node.data);
            this.preOrder(node.left, result);
            this.preOrder(node.right, result);
        }
        return result;
    }

    postOrder(node = this.root, result = []) {
        if (node) {
            this.postOrder(node.left, result);
            this.postOrder(node.right, result);
            result.push(node.data);
        }
        return result;
    }

    levelOrder() {
        if (!this.root) return [];

        const result = [];
        const queue = [this.root];

        while (queue.length > 0) {
            const node = queue.shift();
            result.push(node.data);

            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }

        return result;
    }

    // Find height
    height(node = this.root) {
        if (!node) return -1;
        return 1 + Math.max(this.height(node.left), this.height(node.right));
    }

    // Validate BST
    isValidBST(node = this.root, min = -Infinity, max = Infinity) {
        if (!node) return true;

        if (node.data <= min || node.data >= max) {
            return false;
        }

        return (
            this.isValidBST(node.left, min, node.data) &&
            this.isValidBST(node.right, node.data, max)
        );
    }
}

// Trie (Prefix Tree)
class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let current = this.root;

        for (const char of word) {
            if (!current.children[char]) {
                current.children[char] = new TrieNode();
            }
            current = current.children[char];
        }

        current.isEndOfWord = true;
    }

    search(word) {
        let current = this.root;

        for (const char of word) {
            if (!current.children[char]) {
                return false;
            }
            current = current.children[char];
        }

        return current.isEndOfWord;
    }

    startsWith(prefix) {
        let current = this.root;

        for (const char of prefix) {
            if (!current.children[char]) {
                return false;
            }
            current = current.children[char];
        }

        return true;
    }

    getAllWordsWithPrefix(prefix) {
        const result = [];
        let current = this.root;

        // Navigate to prefix
        for (const char of prefix) {
            if (!current.children[char]) {
                return result;
            }
            current = current.children[char];
        }

        // DFS to find all words
        function dfs(node, currentWord) {
            if (node.isEndOfWord) {
                result.push(currentWord);
            }

            for (const char in node.children) {
                dfs(node.children[char], currentWord + char);
            }
        }

        dfs(current, prefix);
        return result;
    }
}

// Graph implementation
class Graph {
    constructor() {
        this.adjacencyList = {};
    }

    addVertex(vertex) {
        if (!this.adjacencyList[vertex]) {
            this.adjacencyList[vertex] = [];
        }
    }

    addEdge(vertex1, vertex2) {
        this.adjacencyList[vertex1].push(vertex2);
        this.adjacencyList[vertex2].push(vertex1); // Undirected graph
    }

    removeEdge(vertex1, vertex2) {
        this.adjacencyList[vertex1] = this.adjacencyList[vertex1].filter(
            (v) => v !== vertex2
        );
        this.adjacencyList[vertex2] = this.adjacencyList[vertex2].filter(
            (v) => v !== vertex1
        );
    }

    removeVertex(vertex) {
        while (this.adjacencyList[vertex].length) {
            const adjacentVertex = this.adjacencyList[vertex].pop();
            this.removeEdge(vertex, adjacentVertex);
        }
        delete this.adjacencyList[vertex];
    }

    dfsRecursive(start) {
        const result = [];
        const visited = {};

        const dfs = (vertex) => {
            if (!vertex) return null;

            visited[vertex] = true;
            result.push(vertex);

            this.adjacencyList[vertex].forEach((neighbor) => {
                if (!visited[neighbor]) {
                    return dfs(neighbor);
                }
            });
        };

        dfs(start);
        return result;
    }

    dfsIterative(start) {
        const stack = [start];
        const result = [];
        const visited = {};

        visited[start] = true;

        while (stack.length) {
            const currentVertex = stack.pop();
            result.push(currentVertex);

            this.adjacencyList[currentVertex].forEach((neighbor) => {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    stack.push(neighbor);
                }
            });
        }

        return result;
    }

    bfs(start) {
        const queue = [start];
        const result = [];
        const visited = {};

        visited[start] = true;

        while (queue.length) {
            const currentVertex = queue.shift();
            result.push(currentVertex);

            this.adjacencyList[currentVertex].forEach((neighbor) => {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.push(neighbor);
                }
            });
        }

        return result;
    }

    // Shortest path (unweighted)
    shortestPath(start, end) {
        const queue = [start];
        const visited = { [start]: true };
        const previous = {};

        while (queue.length) {
            const currentVertex = queue.shift();

            if (currentVertex === end) {
                // Reconstruct path
                const path = [];
                let current = end;

                while (current !== undefined) {
                    path.unshift(current);
                    current = previous[current];
                }

                return path;
            }

            this.adjacencyList[currentVertex].forEach((neighbor) => {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    previous[neighbor] = currentVertex;
                    queue.push(neighbor);
                }
            });
        }

        return null; // No path found
    }
}
```

### Hash Table Implementation

```javascript
// Simple Hash Table
class HashTable {
    constructor(size = 53) {
        this.keyMap = new Array(size);
    }

    _hash(key) {
        let total = 0;
        const WEIRD_PRIME = 31;

        for (let i = 0; i < Math.min(key.length, 100); i++) {
            const char = key[i];
            const value = char.charCodeAt(0) - 96;
            total = (total * WEIRD_PRIME + value) % this.keyMap.length;
        }

        return total;
    }

    set(key, value) {
        const index = this._hash(key);

        if (!this.keyMap[index]) {
            this.keyMap[index] = [];
        }

        // Check if key already exists
        const existingPair = this.keyMap[index].find((pair) => pair[0] === key);
        if (existingPair) {
            existingPair[1] = value; // Update existing value
        } else {
            this.keyMap[index].push([key, value]);
        }
    }

    get(key) {
        const index = this._hash(key);

        if (this.keyMap[index]) {
            const pair = this.keyMap[index].find((pair) => pair[0] === key);
            return pair ? pair[1] : undefined;
        }

        return undefined;
    }

    keys() {
        const keysArr = [];

        for (let i = 0; i < this.keyMap.length; i++) {
            if (this.keyMap[i]) {
                for (let j = 0; j < this.keyMap[i].length; j++) {
                    keysArr.push(this.keyMap[i][j][0]);
                }
            }
        }

        return keysArr;
    }

    values() {
        const valuesArr = [];

        for (let i = 0; i < this.keyMap.length; i++) {
            if (this.keyMap[i]) {
                for (let j = 0; j < this.keyMap[i].length; j++) {
                    const value = this.keyMap[i][j][1];
                    if (!valuesArr.includes(value)) {
                        valuesArr.push(value);
                    }
                }
            }
        }

        return valuesArr;
    }

    remove(key) {
        const index = this._hash(key);

        if (this.keyMap[index]) {
            const pairIndex = this.keyMap[index].findIndex(
                (pair) => pair[0] === key
            );
            if (pairIndex !== -1) {
                return this.keyMap[index].splice(pairIndex, 1)[0];
            }
        }

        return undefined;
    }
}

// LRU Cache using Hash Table + Doubly Linked List
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();

        // Create dummy head and tail nodes
        this.head = { key: 0, value: 0, prev: null, next: null };
        this.tail = { key: 0, value: 0, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }

    popTail() {
        const lastNode = this.tail.prev;
        this.removeNode(lastNode);
        return lastNode;
    }

    get(key) {
        const node = this.cache.get(key);

        if (node) {
            // Move to head (most recently used)
            this.moveToHead(node);
            return node.value;
        }

        return -1;
    }

    put(key, value) {
        const node = this.cache.get(key);

        if (node) {
            // Update existing node
            node.value = value;
            this.moveToHead(node);
        } else {
            const newNode = { key, value, prev: null, next: null };

            if (this.cache.size >= this.capacity) {
                // Remove least recently used
                const tail = this.popTail();
                this.cache.delete(tail.key);
            }

            this.cache.set(key, newNode);
            this.addToHead(newNode);
        }
    }
}
```

---

## Performance & Optimization

### Time and Space Complexity Analysis

```javascript
// Big O Examples
const performanceExamples = {
    // O(1) - Constant time
    constantTime: function (arr) {
        return arr[0]; // Always takes same time regardless of array size
    },

    // O(log n) - Logarithmic time
    binarySearch: function (arr, target) {
        let left = 0;
        let right = arr.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (arr[mid] === target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }

        return -1;
    },

    // O(n) - Linear time
    linearSearch: function (arr, target) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === target) return i;
        }
        return -1;
    },

    // O(n log n) - Linearithmic time
    mergeSort: function (arr) {
        if (arr.length <= 1) return arr;

        const mid = Math.floor(arr.length / 2);
        const left = this.mergeSort(arr.slice(0, mid));
        const right = this.mergeSort(arr.slice(mid));

        return this.merge(left, right);
    },

    merge: function (left, right) {
        const result = [];
        let i = 0,
            j = 0;

        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                result.push(left[i++]);
            } else {
                result.push(right[j++]);
            }
        }

        return result.concat(left.slice(i)).concat(right.slice(j));
    },

    // O(n²) - Quadratic time
    bubbleSort: function (arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
            }
        }
        return arr;
    },

    // O(2^n) - Exponential time (inefficient)
    fibonacciNaive: function (n) {
        if (n <= 1) return n;
        return this.fibonacciNaive(n - 1) + this.fibonacciNaive(n - 2);
    },

    // Optimized to O(n) with memoization
    fibonacciMemo: function (n, memo = {}) {
        if (n in memo) return memo[n];
        if (n <= 1) return n;

        memo[n] =
            this.fibonacciMemo(n - 1, memo) + this.fibonacciMemo(n - 2, memo);
        return memo[n];
    },
};

// Performance measurement utilities
class PerformanceAnalyzer {
    static measure(fn, ...args) {
        const start = performance.now();
        const result = fn(...args);
        const end = performance.now();

        return {
            result,
            executionTime: end - start,
            memoryUsage: this.getMemoryUsage(),
        };
    }

    static getMemoryUsage() {
        if (typeof process !== "undefined" && process.memoryUsage) {
            return process.memoryUsage();
        }
        return null;
    }

    static compare(functions, input) {
        const results = {};

        for (const [name, fn] of Object.entries(functions)) {
            results[name] = this.measure(fn, input);
        }

        return results;
    }

    static benchmark(fn, input, iterations = 1000) {
        const times = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            fn(input);
            const end = performance.now();
            times.push(end - start);
        }

        times.sort((a, b) => a - b);

        return {
            min: times[0],
            max: times[times.length - 1],
            median: times[Math.floor(times.length / 2)],
            average: times.reduce((sum, time) => sum + time, 0) / times.length,
            p95: times[Math.floor(times.length * 0.95)],
            p99: times[Math.floor(times.length * 0.99)],
        };
    }
}
```

### Memory Management and Optimization

```javascript
// Memory management best practices
class MemoryOptimizer {
    // Object pooling to reduce garbage collection
    static createObjectPool(createFn, resetFn, initialSize = 10) {
        const pool = [];

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            pool.push(createFn());
        }

        return {
            get() {
                return pool.length > 0 ? pool.pop() : createFn();
            },

            release(obj) {
                resetFn(obj);
                pool.push(obj);
            },

            size() {
                return pool.length;
            },
        };
    }

    // Weak references to prevent memory leaks
    static createWeakCache() {
        const cache = new WeakMap();

        return {
            set(key, value) {
                cache.set(key, value);
            },

            get(key) {
                return cache.get(key);
            },

            has(key) {
                return cache.has(key);
            },
        };
    }

    // Lazy evaluation for performance
    static lazy(fn) {
        let cached = false;
        let result;

        return function (...args) {
            if (!cached) {
                result = fn.apply(this, args);
                cached = true;
            }
            return result;
        };
    }

    // Debouncing for performance
    static debounce(fn, delay) {
        let timeoutId;

        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // Throttling for performance
    static throttle(fn, limit) {
        let inThrottle;

        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }
}

// Example: Object pool for frequently created objects
const vectorPool = MemoryOptimizer.createObjectPool(
    () => ({ x: 0, y: 0 }), // Create function
    (vector) => {
        vector.x = 0;
        vector.y = 0;
    }, // Reset function
    50 // Initial pool size
);

// Usage
function performCalculations() {
    const vectors = [];

    // Get objects from pool instead of creating new ones
    for (let i = 0; i < 100; i++) {
        const vector = vectorPool.get();
        vector.x = Math.random() * 100;
        vector.y = Math.random() * 100;
        vectors.push(vector);
    }

    // Process vectors...

    // Return objects to pool
    vectors.forEach((vector) => vectorPool.release(vector));
}

// Algorithm optimization techniques
class AlgorithmOptimizer {
    // Memoization for expensive recursive functions
    static memoize(fn) {
        const cache = new Map();

        return function (...args) {
            const key = JSON.stringify(args);

            if (cache.has(key)) {
                return cache.get(key);
            }

            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }

    // Tail call optimization simulation
    static trampoline(fn) {
        return function (...args) {
            let result = fn.apply(this, args);

            while (typeof result === "function") {
                result = result();
            }

            return result;
        };
    }

    // Example: Optimized tail-recursive factorial
    static factorial(n, acc = 1) {
        if (n <= 1) return acc;

        return () => AlgorithmOptimizer.factorial(n - 1, n * acc);
    }

    // Binary search optimization with early termination
    static optimizedBinarySearch(arr, target, compareFn = (a, b) => a - b) {
        let left = 0;
        let right = arr.length - 1;

        while (left <= right) {
            const mid = left + Math.floor((right - left) / 2);
            const comparison = compareFn(arr[mid], target);

            if (comparison === 0) return mid;
            if (comparison < 0) left = mid + 1;
            else right = mid - 1;
        }

        return -1;
    }

    // Efficient array operations
    static fastArrayOperations = {
        // Remove element without creating new array
        removeAtIndex(arr, index) {
            arr[index] = arr[arr.length - 1];
            arr.pop();
            return arr;
        },

        // Shuffle array in place (Fisher-Yates)
        shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        },

        // Partition array in place
        partition(arr, predicate) {
            let writeIndex = 0;

            for (let readIndex = 0; readIndex < arr.length; readIndex++) {
                if (predicate(arr[readIndex])) {
                    [arr[writeIndex], arr[readIndex]] = [
                        arr[readIndex],
                        arr[writeIndex],
                    ];
                    writeIndex++;
                }
            }

            return writeIndex; // Index where partition ends
        },
    };
}

// Web-specific performance optimizations
class WebPerformanceOptimizer {
    // Efficient DOM manipulation
    static batchDOMUpdates(updates) {
        // Use DocumentFragment for multiple DOM insertions
        const fragment = document.createDocumentFragment();

        updates.forEach((update) => {
            if (update.type === "create") {
                const element = document.createElement(update.tag);
                if (update.textContent)
                    element.textContent = update.textContent;
                if (update.attributes) {
                    Object.entries(update.attributes).forEach(
                        ([key, value]) => {
                            element.setAttribute(key, value);
                        }
                    );
                }
                fragment.appendChild(element);
            }
        });

        return fragment;
    }

    // Lazy loading with Intersection Observer
    static createLazyLoader(callback, options = {}) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        callback(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: "50px",
                threshold: 0.1,
                ...options,
            }
        );

        return {
            observe: (element) => observer.observe(element),
            unobserve: (element) => observer.unobserve(element),
            disconnect: () => observer.disconnect(),
        };
    }

    // Virtual scrolling for large lists
    static createVirtualScroller(container, itemHeight, renderItem) {
        const state = {
            scrollTop: 0,
            containerHeight: container.clientHeight,
            totalItems: 0,
            items: [],
        };

        function update() {
            const visibleStart = Math.floor(state.scrollTop / itemHeight);
            const visibleEnd = Math.min(
                visibleStart + Math.ceil(state.containerHeight / itemHeight),
                state.totalItems
            );

            container.innerHTML = "";
            container.style.height = `${state.totalItems * itemHeight}px`;
            container.style.paddingTop = `${visibleStart * itemHeight}px`;

            for (let i = visibleStart; i < visibleEnd; i++) {
                const item = renderItem(state.items[i], i);
                container.appendChild(item);
            }
        }

        container.addEventListener("scroll", () => {
            state.scrollTop = container.scrollTop;
            update();
        });

        return {
            setItems(items) {
                state.items = items;
                state.totalItems = items.length;
                update();
            },
        };
    }
}
```

---

## Interview Coding Patterns

### Common Interview Problems and Solutions

```javascript
// 1. Array Problems
const arrayProblems = {
    // Maximum Subarray (Kadane's Algorithm)
    maxSubArray(nums) {
        let maxSoFar = nums[0];
        let maxEndingHere = nums[0];

        for (let i = 1; i < nums.length; i++) {
            maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
            maxSoFar = Math.max(maxSoFar, maxEndingHere);
        }

        return maxSoFar;
    },

    // Two Sum
    twoSum(nums, target) {
        const map = new Map();

        for (let i = 0; i < nums.length; i++) {
            const complement = target - nums[i];
            if (map.has(complement)) {
                return [map.get(complement), i];
            }
            map.set(nums[i], i);
        }

        return [];
    },

    // Product of Array Except Self
    productExceptSelf(nums) {
        const result = new Array(nums.length);

        // Left pass
        result[0] = 1;
        for (let i = 1; i < nums.length; i++) {
            result[i] = result[i - 1] * nums[i - 1];
        }

        // Right pass
        let right = 1;
        for (let i = nums.length - 1; i >= 0; i--) {
            result[i] *= right;
            right *= nums[i];
        }

        return result;
    },

    // Container With Most Water
    maxArea(height) {
        let left = 0;
        let right = height.length - 1;
        let maxArea = 0;

        while (left < right) {
            const area = Math.min(height[left], height[right]) * (right - left);
            maxArea = Math.max(maxArea, area);

            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }

        return maxArea;
    },

    // Rotate Array
    rotate(nums, k) {
        k = k % nums.length;

        function reverse(start, end) {
            while (start < end) {
                [nums[start], nums[end]] = [nums[end], nums[start]];
                start++;
                end--;
            }
        }

        reverse(0, nums.length - 1);
        reverse(0, k - 1);
        reverse(k, nums.length - 1);

        return nums;
    },
};

// 2. String Problems
const stringProblems = {
    // Valid Anagram
    isAnagram(s, t) {
        if (s.length !== t.length) return false;

        const charCount = {};

        for (const char of s) {
            charCount[char] = (charCount[char] || 0) + 1;
        }

        for (const char of t) {
            if (!charCount[char]) return false;
            charCount[char]--;
        }

        return true;
    },

    // Longest Palindromic Substring
    longestPalindrome(s) {
        if (s.length < 2) return s;

        let start = 0;
        let maxLen = 1;

        function expandAroundCenter(left, right) {
            while (left >= 0 && right < s.length && s[left] === s[right]) {
                const currentLen = right - left + 1;
                if (currentLen > maxLen) {
                    start = left;
                    maxLen = currentLen;
                }
                left--;
                right++;
            }
        }

        for (let i = 0; i < s.length; i++) {
            expandAroundCenter(i, i); // Odd length palindromes
            expandAroundCenter(i, i + 1); // Even length palindromes
        }

        return s.substring(start, start + maxLen);
    },

    // Valid Parentheses
    isValid(s) {
        const stack = [];
        const pairs = { ")": "(", "}": "{", "]": "[" };

        for (const char of s) {
            if ("({[".includes(char)) {
                stack.push(char);
            } else if (")}]".includes(char)) {
                if (stack.length === 0 || stack.pop() !== pairs[char]) {
                    return false;
                }
            }
        }

        return stack.length === 0;
    },

    // Group Anagrams
    groupAnagrams(strs) {
        const groups = {};

        for (const str of strs) {
            const key = str.split("").sort().join("");
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(str);
        }

        return Object.values(groups);
    },
};

// 3. Linked List Problems
const linkedListProblems = {
    // Reverse Linked List
    reverseList(head) {
        let prev = null;
        let current = head;

        while (current) {
            const next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }

        return prev;
    },

    // Merge Two Sorted Lists
    mergeTwoLists(l1, l2) {
        const dummy = { next: null };
        let current = dummy;

        while (l1 && l2) {
            if (l1.val <= l2.val) {
                current.next = l1;
                l1 = l1.next;
            } else {
                current.next = l2;
                l2 = l2.next;
            }
            current = current.next;
        }

        current.next = l1 || l2;
        return dummy.next;
    },

    // Detect Cycle
    hasCycle(head) {
        if (!head || !head.next) return false;

        let slow = head;
        let fast = head.next;

        while (fast && fast.next) {
            if (slow === fast) return true;
            slow = slow.next;
            fast = fast.next.next;
        }

        return false;
    },

    // Remove Nth Node From End
    removeNthFromEnd(head, n) {
        const dummy = { next: head };
        let fast = dummy;
        let slow = dummy;

        // Move fast pointer n+1 steps ahead
        for (let i = 0; i <= n; i++) {
            fast = fast.next;
        }

        // Move both pointers until fast reaches the end
        while (fast) {
            fast = fast.next;
            slow = slow.next;
        }

        // Remove the nth node
        slow.next = slow.next.next;
        return dummy.next;
    },
};

// 4. Tree Problems
const treeProblems = {
    // Maximum Depth of Binary Tree
    maxDepth(root) {
        if (!root) return 0;
        return (
            1 + Math.max(this.maxDepth(root.left), this.maxDepth(root.right))
        );
    },

    // Validate Binary Search Tree
    isValidBST(root, min = -Infinity, max = Infinity) {
        if (!root) return true;

        if (root.val <= min || root.val >= max) {
            return false;
        }

        return (
            this.isValidBST(root.left, min, root.val) &&
            this.isValidBST(root.right, root.val, max)
        );
    },

    // Lowest Common Ancestor
    lowestCommonAncestor(root, p, q) {
        if (!root || root === p || root === q) {
            return root;
        }

        const left = this.lowestCommonAncestor(root.left, p, q);
        const right = this.lowestCommonAncestor(root.right, p, q);

        if (left && right) return root;
        return left || right;
    },

    // Level Order Traversal
    levelOrder(root) {
        if (!root) return [];

        const result = [];
        const queue = [root];

        while (queue.length > 0) {
            const levelSize = queue.length;
            const currentLevel = [];

            for (let i = 0; i < levelSize; i++) {
                const node = queue.shift();
                currentLevel.push(node.val);

                if (node.left) queue.push(node.left);
                if (node.right) queue.push(node.right);
            }

            result.push(currentLevel);
        }

        return result;
    },
};

// 5. Dynamic Programming Problems
const dpProblems = {
    // Climbing Stairs
    climbStairs(n) {
        if (n <= 2) return n;

        let prev2 = 1;
        let prev1 = 2;

        for (let i = 3; i <= n; i++) {
            const current = prev1 + prev2;
            prev2 = prev1;
            prev1 = current;
        }

        return prev1;
    },

    // House Robber
    rob(nums) {
        if (nums.length === 0) return 0;
        if (nums.length === 1) return nums[0];

        let prev2 = 0;
        let prev1 = nums[0];

        for (let i = 1; i < nums.length; i++) {
            const current = Math.max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = current;
        }

        return prev1;
    },

    // Longest Increasing Subsequence
    lengthOfLIS(nums) {
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
    },

    // Coin Change
    coinChange(coins, amount) {
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
    },
};
```

### Problem-Solving Framework

```javascript
// Systematic approach to solving coding problems
class ProblemSolver {
    static solve(problem) {
        console.log("=== Problem Solving Framework ===");

        // Step 1: Understand the problem
        console.log("1. Understanding the problem:");
        console.log("   - What is the input?");
        console.log("   - What is the expected output?");
        console.log("   - What are the constraints?");
        console.log("   - Are there edge cases?");

        // Step 2: Examples and test cases
        console.log("\n2. Examples and test cases:");
        console.log("   - Work through simple examples");
        console.log("   - Consider edge cases");
        console.log("   - Think about invalid inputs");

        // Step 3: Break down the problem
        console.log("\n3. Break down the problem:");
        console.log("   - Identify subproblems");
        console.log("   - Think about data structures needed");
        console.log("   - Consider algorithms that might help");

        // Step 4: Pseudocode
        console.log("\n4. Write pseudocode:");
        console.log("   - Outline the solution step by step");
        console.log("   - Don't worry about syntax");
        console.log("   - Focus on logic and flow");

        // Step 5: Code
        console.log("\n5. Implement the solution:");
        console.log("   - Start with a working solution");
        console.log("   - Test with examples");
        console.log("   - Handle edge cases");

        // Step 6: Optimize
        console.log("\n6. Optimize:");
        console.log("   - Analyze time and space complexity");
        console.log("   - Look for optimization opportunities");
        console.log("   - Consider trade-offs");

        return this.commonPatterns();
    }

    static commonPatterns() {
        return {
            twoPointers: {
                description: "Use two pointers to traverse data structure",
                when: "Array/string problems, palindromes, two sum variants",
                template: `
                function twoPointerPattern(arr) {
                    let left = 0;
                    let right = arr.length - 1;
                    
                    while (left < right) {
                        // Process current window
                        // Move pointers based on condition
                        if (condition) {
                            left++;
                        } else {
                            right--;
                        }
                    }
                }
                `,
            },

            slidingWindow: {
                description: "Maintain a window that slides through data",
                when: "Substring problems, maximum/minimum subarray",
                template: `
                function slidingWindowPattern(arr, k) {
                    let windowSum = 0;
                    let maxSum = 0;
                    
                    // Initial window
                    for (let i = 0; i < k; i++) {
                        windowSum += arr[i];
                    }
                    maxSum = windowSum;
                    
                    // Slide window
                    for (let i = k; i < arr.length; i++) {
                        windowSum = windowSum - arr[i - k] + arr[i];
                        maxSum = Math.max(maxSum, windowSum);
                    }
                    
                    return maxSum;
                }
                `,
            },

            fastSlowPointers: {
                description: "Two pointers moving at different speeds",
                when: "Cycle detection, finding middle element",
                template: `
                function fastSlowPattern(head) {
                    let slow = head;
                    let fast = head;
                    
                    while (fast && fast.next) {
                        slow = slow.next;
                        fast = fast.next.next;
                        
                        if (slow === fast) {
                            return true; // Cycle detected
                        }
                    }
                    
                    return false;
                }
                `,
            },

            mergeIntervals: {
                description: "Sort intervals and merge overlapping ones",
                when: "Interval problems, scheduling conflicts",
                template: `
                function mergeIntervals(intervals) {
                    intervals.sort((a, b) => a[0] - b[0]);
                    const merged = [intervals[0]];
                    
                    for (let i = 1; i < intervals.length; i++) {
                        const current = intervals[i];
                        const lastMerged = merged[merged.length - 1];
                        
                        if (current[0] <= lastMerged[1]) {
                            lastMerged[1] = Math.max(lastMerged[1], current[1]);
                        } else {
                            merged.push(current);
                        }
                    }
                    
                    return merged;
                }
                `,
            },

            topKElements: {
                description: "Find top K elements using heap or sorting",
                when: "K largest/smallest elements, frequency problems",
                template: `
                function topKElements(arr, k) {
                    const count = {};
                    const heap = [];
                    
                    // Count frequency
                    for (const num of arr) {
                        count[num] = (count[num] || 0) + 1;
                    }
                    
                    // Use heap to find top K
                    for (const [num, freq] of Object.entries(count)) {
                        heap.push([freq, num]);
                        if (heap.length > k) {
                            heap.sort((a, b) => a[0] - b[0]);
                            heap.shift();
                        }
                    }
                    
                    return heap.map(item => item[1]);
                }
                `,
            },
        };
    }

    static timeComplexityGuide() {
        return {
            "O(1)": {
                description: "Constant time",
                examples: [
                    "Array access",
                    "Hash table operations",
                    "Stack push/pop",
                ],
                code: "arr[index]",
            },
            "O(log n)": {
                description: "Logarithmic time",
                examples: ["Binary search", "Balanced tree operations"],
                code: "binarySearch(sortedArray, target)",
            },
            "O(n)": {
                description: "Linear time",
                examples: ["Single loop", "Linear search", "Array traversal"],
                code: "for (let i = 0; i < n; i++) { ... }",
            },
            "O(n log n)": {
                description: "Linearithmic time",
                examples: ["Merge sort", "Quick sort", "Heap sort"],
                code: "mergeSort(array)",
            },
            "O(n²)": {
                description: "Quadratic time",
                examples: ["Nested loops", "Bubble sort", "Selection sort"],
                code: "for (i) { for (j) { ... } }",
            },
            "O(2^n)": {
                description: "Exponential time",
                examples: ["Recursive fibonacci", "Subset generation"],
                code: "fibonacci(n-1) + fibonacci(n-2)",
            },
        };
    }
}

// Interview-specific tips and strategies
class InterviewStrategy {
    static tips() {
        return {
            beforeCoding: [
                "Ask clarifying questions",
                "Discuss edge cases",
                "Agree on input/output format",
                "Talk through approach before coding",
                "Consider time/space constraints",
            ],

            whileCoding: [
                "Think out loud",
                "Write clean, readable code",
                "Use meaningful variable names",
                "Handle edge cases",
                "Test with examples as you go",
            ],

            afterCoding: [
                "Walk through your solution",
                "Test with edge cases",
                "Discuss time/space complexity",
                "Suggest optimizations",
                "Consider alternative approaches",
            ],

            commonMistakes: [
                "Not asking questions",
                "Jumping to code too quickly",
                "Not considering edge cases",
                "Writing overly complex solutions",
                "Not testing the solution",
            ],
        };
    }

    static practiceSchedule() {
        return {
            week1: {
                focus: "Arrays and Strings",
                problems: [
                    "Two Sum",
                    "Valid Anagram",
                    "Contains Duplicate",
                    "Maximum Subarray",
                    "Product of Array Except Self",
                ],
            },
            week2: {
                focus: "Linked Lists and Stacks/Queues",
                problems: [
                    "Reverse Linked List",
                    "Merge Two Sorted Lists",
                    "Valid Parentheses",
                    "Implement Queue using Stacks",
                ],
            },
            week3: {
                focus: "Trees and Graphs",
                problems: [
                    "Maximum Depth of Binary Tree",
                    "Validate BST",
                    "Number of Islands",
                    "Course Schedule",
                ],
            },
            week4: {
                focus: "Dynamic Programming",
                problems: [
                    "Climbing Stairs",
                    "House Robber",
                    "Longest Increasing Subsequence",
                    "Coin Change",
                ],
            },
        };
    }
}
```

---

**This concludes the complete JavaScript Logic Guide! You now have a comprehensive resource covering everything from basic fundamentals to advanced interview patterns, performance optimization, and production-ready code techniques. This guide will serve you well for both interview preparation and real-world development.**

### Quick Navigation Summary:

-   **Phase 1**: Fundamentals, Variables, Functions, Arrays, Objects, Control Flow
-   **Phase 2**: Loops, Async JavaScript, Error Handling, Regular Expressions
-   **Phase 3**: ES6+ Features, Advanced Problem Solving, String Algorithms
-   **Phase 4**: Data Structures, Performance, Interview Patterns, Production Code

Each phase builds upon the previous one, taking you from beginner to advanced JavaScript developer with a strong foundation in computer science concepts and problem-solving skills.
