# Chapter 09: Web APIs & Browser Interaction

> **How the Browser and JavaScript Engine Work Together**

---

## 🎯 What You'll Learn

- What Web APIs are and where they live
- How Web APIs interact with JavaScript
- The complete flow of async operations
- Specific Web APIs: setTimeout, fetch, DOM events, etc.
- The relationship between JavaScript runtime and browser APIs

---

## 📖 JavaScript Engine vs Browser

The JavaScript engine (like V8) only understands JavaScript. Features like `setTimeout`, `fetch`, `DOM`, and `localStorage` are NOT part of JavaScript - they're **Web APIs** provided by the browser.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BROWSER ARCHITECTURE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                        BROWSER                                       │  │
│   │                                                                      │  │
│   │   ┌──────────────────────────────────────────────────────────────┐  │  │
│   │   │              JAVASCRIPT ENGINE (V8)                          │  │  │
│   │   │                                                              │  │  │
│   │   │   ┌─────────────────┐    ┌─────────────────────────────┐   │  │  │
│   │   │   │   CALL STACK    │    │        MEMORY HEAP          │   │  │  │
│   │   │   │                 │    │                             │   │  │  │
│   │   │   │  Pure JS only   │    │   Objects, closures, etc.  │   │  │  │
│   │   │   └─────────────────┘    └─────────────────────────────┘   │  │  │
│   │   │                                                              │  │  │
│   │   │   Understands: variables, functions, objects, loops, etc.   │  │  │
│   │   │   Does NOT understand: setTimeout, fetch, document, etc.    │  │  │
│   │   │                                                              │  │  │
│   │   └──────────────────────────────────────────────────────────────┘  │  │
│   │                               │                                      │  │
│   │                               │ Calls Web APIs via bindings          │  │
│   │                               ▼                                      │  │
│   │   ┌──────────────────────────────────────────────────────────────┐  │  │
│   │   │                       WEB APIs                                │  │  │
│   │   │                   (Written in C++)                            │  │  │
│   │   │                                                               │  │  │
│   │   │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │  │  │
│   │   │   │  Timer  │ │ Fetch   │ │   DOM   │ │  LocalStorage   │   │  │  │
│   │   │   │  APIs   │ │  API    │ │  APIs   │ │      API        │   │  │  │
│   │   │   └─────────┘ └─────────┘ └─────────┘ └─────────────────┘   │  │  │
│   │   │                                                               │  │  │
│   │   │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │  │  │
│   │   │   │ Console │ │ Canvas  │ │WebSocket│ │ Geolocation     │   │  │  │
│   │   │   │   API   │ │  API    │ │   API   │ │      API        │   │  │  │
│   │   │   └─────────┘ └─────────┘ └─────────┘ └─────────────────┘   │  │  │
│   │   │                                                               │  │  │
│   │   └───────────────────────────────┬──────────────────────────────┘  │  │
│   │                                   │                                  │  │
│   │                                   │ When async work completes        │  │
│   │                                   ▼                                  │  │
│   │   ┌──────────────────────────────────────────────────────────────┐  │  │
│   │   │              CALLBACK / TASK QUEUES                          │  │  │
│   │   │   ┌─────────────────────────────────────────────────────┐   │  │  │
│   │   │   │ Macrotask Queue: [setTimeout cb, I/O cb, ...]       │   │  │  │
│   │   │   └─────────────────────────────────────────────────────┘   │  │  │
│   │   │   ┌─────────────────────────────────────────────────────┐   │  │  │
│   │   │   │ Microtask Queue: [Promise cb, mutation cb, ...]     │   │  │  │
│   │   │   └─────────────────────────────────────────────────────┘   │  │  │
│   │   └──────────────────────────────────────────────────────────────┘  │  │
│   │                                   │                                  │  │
│   │                           EVENT LOOP                                │  │
│   │                                   │                                  │  │
│   │                                   └────────────▶ Back to Call Stack │  │
│   │                                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⏰ Timer APIs: setTimeout & setInterval

### How setTimeout Works

```javascript
console.log("1. Start");

setTimeout(() => {
  console.log("3. Timeout callback");
}, 1000);

console.log("2. End");
```

**The Complete Flow:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    setTimeout FLOW                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   STEP 1: JavaScript calls setTimeout                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Call Stack:                                                         │  │
│   │  ┌───────────────────────────┐                                      │  │
│   │  │ setTimeout(callback, 1000)│  ← JS calls Web API                  │  │
│   │  ├───────────────────────────┤                                      │  │
│   │  │ Global                    │                                      │  │
│   │  └───────────────────────────┘                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                          │                                                  │
│                          ▼                                                  │
│   STEP 2: Browser's Timer API takes over                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Timer API (C++ code in browser):                                    │  │
│   │  ┌───────────────────────────────────────────────────────────────┐  │  │
│   │  │  • Stores the callback function                                │  │  │
│   │  │  • Starts a timer for 1000ms                                   │  │  │
│   │  │  • Returns a timer ID to JavaScript                            │  │  │
│   │  │  • This runs on a DIFFERENT THREAD (not blocking JS!)          │  │  │
│   │  └───────────────────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                          │                                                  │
│   Meanwhile, JS continues│running...                                       │
│                          │                                                  │
│   STEP 3: After 1000ms, Timer API is done                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Timer API:                                                          │  │
│   │  ┌───────────────────────────────────────────────────────────────┐  │  │
│   │  │  Timer expired!                                                │  │  │
│   │  │  → Move callback to Macrotask Queue                            │  │  │
│   │  └───────────────────────────────────────────────────────────────┘  │  │
│   │                                                                      │  │
│   │  Macrotask Queue: [timeout callback]                                │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                          │                                                  │
│   STEP 4: Event Loop moves callback to Call Stack                          │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Event Loop:                                                         │  │
│   │  ┌───────────────────────────────────────────────────────────────┐  │  │
│   │  │  1. Check: Is Call Stack empty?  ✓                             │  │  │
│   │  │  2. Check: Any microtasks?       ✗                             │  │  │
│   │  │  3. Take one macrotask from queue                              │  │  │
│   │  │  4. Push callback onto Call Stack                              │  │  │
│   │  └───────────────────────────────────────────────────────────────┘  │  │
│   │                                                                      │  │
│   │  Call Stack:                                                         │  │
│   │  ┌───────────────────────────┐                                      │  │
│   │  │ callback()                │  ← NOW it runs!                      │  │
│   │  └───────────────────────────┘                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### setTimeout Isn't Guaranteed Timing

```javascript
// The 1000ms is a MINIMUM, not a guarantee

setTimeout(() => {
  console.log("Should run after 1000ms");
}, 1000);

// If synchronous code takes 3 seconds:
for (let i = 0; i < 3000000000; i++) {
  // Heavy computation
}

// The timeout callback will run after ~3000ms + 1000ms
// Because JS must finish the sync code first
```

### clearTimeout & clearInterval

```javascript
// setTimeout returns a timer ID
const timerId = setTimeout(() => {
  console.log("This won't run");
}, 1000);

// Cancel before it fires
clearTimeout(timerId);

// Same for setInterval
const intervalId = setInterval(() => {
  console.log("Tick");
}, 1000);

// Cancel after some time
setTimeout(() => clearInterval(intervalId), 5000);
```

---

## 🌐 Fetch API

The Fetch API handles HTTP requests.

```javascript
console.log("1. Before fetch");

fetch('https://api.example.com/users')
  .then(response => {
    console.log("3. Got response");
    return response.json();
  })
  .then(data => {
    console.log("4. Parsed data:", data);
  })
  .catch(error => {
    console.log("Error:", error);
  });

console.log("2. After fetch");

// Output order: 1, 2, 3, 4
```

**How Fetch Works:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FETCH API FLOW                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   fetch('https://api.example.com/users')                                    │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  FETCH API (Browser's Network Layer)                                 │  │
│   │                                                                      │  │
│   │  1. Creates HTTP request                                             │  │
│   │  2. Returns a PENDING Promise immediately to JS                      │  │
│   │  3. Sends request over network (on a different thread)              │  │
│   │  4. Waits for response...                                           │  │
│   │                                                                      │  │
│   │  ┌─────────────────────────────────────────────────────────────┐    │  │
│   │  │                    NETWORK THREAD                            │    │  │
│   │  │                                                              │    │  │
│   │  │   [DNS lookup] → [TCP connection] → [Send request]          │    │  │
│   │  │              → [Wait for response] → [Receive data]         │    │  │
│   │  │                                                              │    │  │
│   │  └─────────────────────────────────────────────────────────────┘    │  │
│   │                                                                      │  │
│   └──────────────────────────────┬──────────────────────────────────────┘  │
│                                  │                                          │
│   When response arrives:         │                                          │
│                                  ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  1. Resolve the pending Promise with Response object                │  │
│   │  2. .then() callback goes to MICROTASK Queue                       │  │
│   │  3. Event Loop picks it up when Call Stack is empty                │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Fetch vs XMLHttpRequest

```javascript
// Old way: XMLHttpRequest (callback-based)
const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(JSON.parse(xhr.responseText));
  }
};
xhr.open('GET', 'https://api.example.com/users');
xhr.send();

// Modern way: Fetch (Promise-based)
fetch('https://api.example.com/users')
  .then(response => response.json())
  .then(data => console.log(data));

// With async/await
async function getData() {
  const response = await fetch('https://api.example.com/users');
  const data = await response.json();
  console.log(data);
}
```

---

## 🖱️ DOM Event Handling

### How Events Work

```javascript
const button = document.getElementById('myButton');

button.addEventListener('click', function(event) {
  console.log('Button clicked!');
});
```

**Event Flow:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DOM EVENT FLOW                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   addEventListener('click', callback)                                       │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  DOM API (Browser)                                                   │  │
│   │                                                                      │  │
│   │  1. Stores callback in element's event listener list               │  │
│   │  2. Browser monitors for click events on that element              │  │
│   │                                                                      │  │
│   │  ┌───────────────────────────────────────────────────────────────┐ │  │
│   │  │  Element Internal Structure:                                   │ │  │
│   │  │  {                                                             │ │  │
│   │  │    eventListeners: {                                           │ │  │
│   │  │      'click': [callback1, callback2, ...],                    │ │  │
│   │  │      'mouseover': [...],                                       │ │  │
│   │  │    }                                                           │ │  │
│   │  │  }                                                             │ │  │
│   │  └───────────────────────────────────────────────────────────────┘ │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   When user clicks:                                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  1. Browser detects click (OS → Browser rendering engine)          │  │
│   │  2. Creates Event object with click details                         │  │
│   │  3. Finds all matching event listeners                              │  │
│   │  4. Queues each callback as a MACROTASK                            │  │
│   │  5. Event Loop eventually runs them                                 │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   NOTE: Event handler execution is a macrotask, but Promises                │
│   created inside handlers follow normal microtask rules                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Event Propagation: Capturing & Bubbling

```javascript
// Events propagate through the DOM tree
document.body.addEventListener('click', () => console.log('Body'));
document.getElementById('parent').addEventListener('click', () => console.log('Parent'));
document.getElementById('child').addEventListener('click', () => console.log('Child'));

// Click on child:
// Child
// Parent
// Body
// (Bubbling: child → parent → body)
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EVENT PROPAGATION                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Click on innermost element:                                               │
│                                                                             │
│   Phase 1: CAPTURING (window → target)                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  window                                                              │  │
│   │    │                                                                 │  │
│   │    ▼                                                                 │  │
│   │  document                                                            │  │
│   │    │                                                                 │  │
│   │    ▼                                                                 │  │
│   │  body                                                                │  │
│   │    │                                                                 │  │
│   │    ▼                                                                 │  │
│   │  parent                                                              │  │
│   │    │                                                                 │  │
│   │    ▼                                                                 │  │
│   │  child (TARGET)                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   Phase 2: TARGET                                                           │
│   Event reaches the target element                                          │
│                                                                             │
│   Phase 3: BUBBLING (target → window)                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  child (TARGET)                                                      │  │
│   │    │                                                                 │  │
│   │    ▼                                                                 │  │
│   │  parent                                                              │  │
│   │    │                                                                 │  │
│   │    ▼                                                                 │  │
│   │  body                                                                │  │
│   │    │                                                                 │  │
│   │    ▼                                                                 │  │
│   │  document                                                            │  │
│   │    │                                                                 │  │
│   │    ▼                                                                 │  │
│   │  window                                                              │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   Default: Listeners fire during BUBBLING phase                             │
│   To listen during CAPTURING: { capture: true }                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💾 Storage APIs

### localStorage and sessionStorage

```javascript
// These are SYNCHRONOUS operations (unusual for Web APIs!)

// Store data
localStorage.setItem('user', JSON.stringify({ name: 'Alice' }));

// Retrieve data
const user = JSON.parse(localStorage.getItem('user'));

// Remove data
localStorage.removeItem('user');

// Clear all
localStorage.clear();
```

**Warning**: Storage operations are synchronous and can block the main thread for large data!

### IndexedDB (Asynchronous Storage)

```javascript
// IndexedDB is asynchronous
const request = indexedDB.open('MyDatabase', 1);

request.onsuccess = function(event) {
  const db = event.target.result;
  // Use the database
};

request.onerror = function(event) {
  console.error('Database error');
};
```

---

## 📹 requestAnimationFrame

Special API for smooth animations:

```javascript
function animate() {
  // Update animation state
  element.style.transform = `translateX(${position}px)`;
  position += 1;
  
  // Schedule next frame
  requestAnimationFrame(animate);
}

// Start animation
requestAnimationFrame(animate);
```

**Where rAF fits:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    requestAnimationFrame TIMING                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Event Loop iteration:                                                     │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  1. Execute macrotask                                                │  │
│   │  2. Execute all microtasks                                           │  │
│   │  3. Render (if needed):                                              │  │
│   │     ├── Run requestAnimationFrame callbacks  ← HERE!                │  │
│   │     ├── Calculate styles                                             │  │
│   │     ├── Layout                                                       │  │
│   │     └── Paint                                                        │  │
│   │  4. Next iteration                                                   │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   rAF runs RIGHT BEFORE the browser paints                                  │
│   Perfect for visual updates!                                               │
│                                                                             │
│   Timing: ~60fps = ~16.67ms per frame                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧵 Web Workers

Run JavaScript in a separate thread:

```javascript
// main.js
const worker = new Worker('worker.js');

worker.postMessage({ data: 'Hello Worker' });

worker.onmessage = function(event) {
  console.log('Received from worker:', event.data);
};

// worker.js
self.onmessage = function(event) {
  console.log('Received in worker:', event.data);
  
  // Heavy computation here (doesn't block main thread!)
  const result = heavyComputation(event.data);
  
  self.postMessage(result);
};
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WEB WORKERS                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────┐    ┌─────────────────────────────┐       │
│   │       MAIN THREAD           │    │      WORKER THREAD          │       │
│   │                             │    │                             │       │
│   │   JavaScript Engine         │    │   JavaScript Engine         │       │
│   │   ┌───────────────────┐    │    │   ┌───────────────────┐    │       │
│   │   │   Call Stack      │    │    │   │   Call Stack      │    │       │
│   │   └───────────────────┘    │    │   └───────────────────┘    │       │
│   │                             │    │                             │       │
│   │   DOM access ✓              │    │   DOM access ✗             │       │
│   │   UI interaction ✓          │    │   UI interaction ✗         │       │
│   │                             │    │   Pure computation ✓       │       │
│   │                             │    │                             │       │
│   └──────────────┬──────────────┘    └──────────────┬──────────────┘       │
│                  │                                   │                      │
│                  │   postMessage()                   │                      │
│                  │ ◀──────────────────────────────▶ │                      │
│                  │                                   │                      │
│                  │   Communication via messages      │                      │
│                  │   (serialized data, no shared     │                      │
│                  │    memory by default)             │                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 WebSocket API

Real-time bidirectional communication:

```javascript
const socket = new WebSocket('wss://example.com/socket');

socket.onopen = function() {
  console.log('Connected');
  socket.send('Hello Server!');
};

socket.onmessage = function(event) {
  console.log('Received:', event.data);
};

socket.onclose = function() {
  console.log('Disconnected');
};
```

---

## 🔔 Notifications & Permissions APIs

```javascript
// Request permission
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    new Notification('Hello!', {
      body: 'This is a notification',
      icon: '/icon.png'
    });
  }
});
```

---

## 📊 Summary: Web APIs Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WEB APIs SUMMARY                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   TIMING APIs:                                                              │
│   ├── setTimeout/setInterval  → Schedule code (macrotask)                   │
│   ├── requestAnimationFrame   → Before next paint (special)                │
│   └── requestIdleCallback     → When browser is idle                       │
│                                                                             │
│   NETWORK APIs:                                                             │
│   ├── fetch                   → HTTP requests (Promise-based)               │
│   ├── XMLHttpRequest          → HTTP requests (callback-based)              │
│   └── WebSocket               → Real-time bidirectional                     │
│                                                                             │
│   DOM APIs:                                                                 │
│   ├── document.*              → Document manipulation                       │
│   ├── element.*               → Element manipulation                        │
│   └── Event handling          → User interaction                           │
│                                                                             │
│   STORAGE APIs:                                                             │
│   ├── localStorage            → Persistent, sync                            │
│   ├── sessionStorage          → Session-only, sync                          │
│   └── IndexedDB               → Large data, async                           │
│                                                                             │
│   THREADING:                                                                │
│   ├── Web Workers             → Background threads                          │
│   ├── Service Workers         → Offline/caching                             │
│   └── SharedArrayBuffer       → Shared memory                               │
│                                                                             │
│   OTHER:                                                                    │
│   ├── Geolocation             → User location                               │
│   ├── Canvas/WebGL            → Graphics                                    │
│   ├── Web Audio               → Audio processing                            │
│   └── Notifications           → System notifications                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Key Takeaways

1. **Web APIs are NOT JavaScript** - they're browser features accessible from JS
2. **Async Web APIs** work on separate threads, don't block JS
3. **Callbacks go to queues** when async operations complete
4. **Event Loop** coordinates between JS engine and Web APIs
5. **Different APIs → different queues** (micro vs macro)
6. **Web Workers** let you run JS on actual separate threads

---

## ➡️ Next Chapter

Now let's explore async/await - the modern way to work with asynchronous code.

**[Continue to Chapter 10: async/await Deep Dive →](./10-Async-Await-Deep-Dive.md)**
