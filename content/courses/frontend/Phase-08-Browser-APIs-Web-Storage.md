# Phase 08 — Browser APIs & Web Storage

## Table of Contents

- [What Are Browser APIs?](#what-are-browser-apis)
- [Fetch API — Making HTTP Requests](#fetch-api--making-http-requests)
- [LocalStorage & SessionStorage](#localstorage--sessionstorage)
- [IndexedDB](#indexeddb)
- [Geolocation API](#geolocation-api)
- [Clipboard API](#clipboard-api)
- [Notification API](#notification-api)
- [Web Workers](#web-workers)
- [History API & Client-Side Routing](#history-api--client-side-routing)
- [URL & URLSearchParams](#url--urlsearchparams)
- [FormData API](#formdata-api)
- [Performance API](#performance-api)
- [Key Takeaways](#key-takeaways)

---

## What Are Browser APIs?

Browser APIs are **built-in features** that the browser exposes to JavaScript. They let you do things that JavaScript alone can't do — make network requests, store data, access the camera, read the clipboard, etc.

```
BROWSER APIs:
├── Fetch API          → HTTP requests
├── Web Storage        → localStorage, sessionStorage
├── IndexedDB          → Client-side database
├── Geolocation        → User's location
├── Clipboard          → Copy/paste
├── Notifications      → System notifications
├── Web Workers        → Background threads
├── History API        → Browser navigation
├── Canvas API         → 2D/3D graphics
├── Web Audio API      → Audio processing
├── MediaStream API    → Camera/microphone
├── Service Workers    → Offline support, caching
├── WebSocket API      → Real-time communication
└── Performance API    → Measuring performance
```

### APIs vs Libraries

| Aspect | Browser API | Library (e.g., axios) |
|--------|------------|----------------------|
| **Installation** | Built in — no install needed | Must install via npm |
| **Size** | Zero bytes (already in browser) | Adds to bundle size |
| **Updates** | Updated with browser | Updated by library maintainers |
| **Cross-browser** | May have differences | Usually handles differences for you |

---

## Fetch API — Making HTTP Requests

The Fetch API is the **modern replacement** for XMLHttpRequest (XHR).

### Basic GET Request

```javascript
// Simple fetch
const response = await fetch("https://api.example.com/users");
const users = await response.json();
console.log(users);
```

### Handling Responses

```javascript
async function fetchUsers() {
    try {
        const response = await fetch("https://api.example.com/users");

        // fetch doesn't throw on HTTP errors (404, 500)!
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        // Network errors (offline, DNS failure) DO throw
        console.error("Fetch failed:", error.message);
    }
}
```

### POST Request

```javascript
async function createUser(userData) {
    const response = await fetch("https://api.example.com/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status}`);
    }

    return response.json();
}

await createUser({ name: "Alice", email: "alice@example.com" });
```

### All HTTP Methods

```javascript
// GET
await fetch("/api/users");

// POST
await fetch("/api/users", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });

// PUT (full update)
await fetch("/api/users/1", { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });

// PATCH (partial update)
await fetch("/api/users/1", { method: "PATCH", body: JSON.stringify({ name: "New Name" }), headers: { "Content-Type": "application/json" } });

// DELETE
await fetch("/api/users/1", { method: "DELETE" });
```

### Sending with Auth Token

```javascript
const token = localStorage.getItem("token");

const response = await fetch("/api/profile", {
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    }
});
```

### Aborting a Fetch (Cancel Request)

```javascript
const controller = new AbortController();

// Start the fetch
const fetchPromise = fetch("/api/slow-endpoint", {
    signal: controller.signal
});

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
    const response = await fetchPromise;
    const data = await response.json();
} catch (error) {
    if (error.name === "AbortError") {
        console.log("Request was cancelled");
    }
}
```

### Reusable Fetch Wrapper

```javascript
async function api(endpoint, options = {}) {
    const { method = "GET", body, headers = {} } = options;

    const config = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers
        }
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`https://api.example.com${endpoint}`, config);

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message || `HTTP ${response.status}`);
    }

    return response.json();
}

// Usage
const users = await api("/users");
const newUser = await api("/users", { method: "POST", body: { name: "Alice" } });
```

---

## LocalStorage & SessionStorage

Both store key-value pairs in the browser. The difference is **lifetime**:

| Feature | localStorage | sessionStorage |
|---------|-------------|---------------|
| **Persists** | Forever (until cleared) | Until tab is closed |
| **Shared** | Across all tabs (same origin) | Only in current tab |
| **Size** | ~5-10 MB | ~5-10 MB |
| **Scope** | Same protocol + domain + port | Same tab only |

### Basic Usage

```javascript
// SET
localStorage.setItem("theme", "dark");
sessionStorage.setItem("tempData", "123");

// GET
const theme = localStorage.getItem("theme");     // "dark"
const temp = sessionStorage.getItem("tempData");  // "123"

// REMOVE one item
localStorage.removeItem("theme");

// CLEAR everything
localStorage.clear();
```

### Storing Objects (JSON)

```javascript
// ❌ Objects are converted to "[object Object]"
localStorage.setItem("user", { name: "Alice" });  // "[object Object]"

// ✅ Serialize with JSON
const user = { name: "Alice", age: 25, preferences: { theme: "dark" } };

// Save
localStorage.setItem("user", JSON.stringify(user));

// Load
const savedUser = JSON.parse(localStorage.getItem("user"));
console.log(savedUser.name); // "Alice"
```

### Safe Storage Helper

```javascript
const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    remove(key) {
        localStorage.removeItem(key);
    }
};

// Usage
storage.set("settings", { theme: "dark", fontSize: 16 });
const settings = storage.get("settings", { theme: "light", fontSize: 14 });
```

### Storage Events (Cross-Tab Communication)

```javascript
// Listen for changes made by OTHER tabs
window.addEventListener("storage", (event) => {
    console.log(`Key: ${event.key}`);
    console.log(`Old value: ${event.oldValue}`);
    console.log(`New value: ${event.newValue}`);

    if (event.key === "theme") {
        applyTheme(event.newValue);
    }
});
```

### When to Use What

```
localStorage:
├── User preferences (theme, language, font size)
├── Shopping cart (persists across sessions)
├── Auth tokens (though httpOnly cookies are more secure)
└── Cached data (recently viewed items)

sessionStorage:
├── Form data backup (in case of accidental navigation)
├── Tab-specific state (wizard step, scroll position)
├── One-time session data
└── Temporary search filters

DON'T STORE:
├── Sensitive data (passwords, SSN, credit cards)
├── Large datasets (use IndexedDB)
└── Critical state (can be cleared by user)
```

---

## IndexedDB

IndexedDB is a **full client-side database** for storing large amounts of structured data.

```
localStorage:  Key-value strings, ~5MB, synchronous
IndexedDB:     Full database, ~unlimited, asynchronous, supports indexes
```

### Basic Usage with a Wrapper

```javascript
function openDB(name, version = 1) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("notes")) {
                const store = db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
                store.createIndex("title", "title", { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function addNote(note) {
    const db = await openDB("myApp");
    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");
    store.add(note);
}

async function getAllNotes() {
    const db = await openDB("myApp");
    return new Promise((resolve) => {
        const tx = db.transaction("notes", "readonly");
        const store = tx.objectStore("notes");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
    });
}

// Usage
await addNote({ title: "My Note", content: "Hello!", created: Date.now() });
const notes = await getAllNotes();
```

> **Tip:** Use a library like **idb** for a cleaner Promises-based IndexedDB API.

---

## Geolocation API

```javascript
// Check if available
if ("geolocation" in navigator) {
    // Get current position
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`Lat: ${latitude}, Lng: ${longitude}`);
            console.log(`Accuracy: ${accuracy} meters`);
        },
        (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    console.log("User denied location access");
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.log("Location unavailable");
                    break;
                case error.TIMEOUT:
                    console.log("Request timed out");
                    break;
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}
```

### Watch Position (Continuous Tracking)

```javascript
const watchId = navigator.geolocation.watchPosition(
    (position) => {
        updateMapMarker(position.coords.latitude, position.coords.longitude);
    },
    (error) => console.error(error),
    { enableHighAccuracy: true }
);

// Stop watching
navigator.geolocation.clearWatch(watchId);
```

---

## Clipboard API

```javascript
// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log("Copied!");
    } catch (err) {
        console.error("Failed to copy:", err);
    }
}

// Read from clipboard
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        console.log("Pasted:", text);
        return text;
    } catch (err) {
        console.error("Failed to read clipboard:", err);
    }
}

// Copy button implementation
document.querySelector(".copy-btn").addEventListener("click", () => {
    const code = document.querySelector(".code-block").textContent;
    copyToClipboard(code);
});
```

---

## Notification API

```javascript
// Request permission
async function requestNotificationPermission() {
    const permission = await Notification.requestPermission();
    return permission === "granted";
}

// Show notification
function showNotification(title, options = {}) {
    if (Notification.permission === "granted") {
        const notification = new Notification(title, {
            body: options.body || "",
            icon: options.icon || "/icon.png",
            tag: options.tag || "default"
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }
}

// Usage
if (await requestNotificationPermission()) {
    showNotification("New Message", {
        body: "You have a new message from Alice"
    });
}
```

---

## Web Workers

Web Workers run JavaScript in a **background thread**, keeping the main thread (UI) responsive.

```
MAIN THREAD:                    WEB WORKER:
├── DOM manipulation            ├── Heavy computation
├── Event handling              ├── Data processing
├── UI rendering                ├── Image manipulation
├── User interaction            ├── Complex calculations
└── Must stay responsive        └── Can take as long as needed

They communicate via messages (postMessage / onmessage)
```

### Creating a Web Worker

**worker.js:**
```javascript
// This runs in a separate thread
self.onmessage = function(event) {
    const { numbers } = event.data;

    // Heavy computation that would freeze the UI
    const result = numbers.reduce((sum, n) => {
        // Simulate heavy work
        for (let i = 0; i < 1000000; i++) {}
        return sum + n;
    }, 0);

    // Send result back to main thread
    self.postMessage({ result });
};
```

**main.js:**
```javascript
const worker = new Worker("worker.js");

// Send data to worker
worker.postMessage({ numbers: [1, 2, 3, 4, 5] });

// Receive result from worker
worker.onmessage = function(event) {
    console.log("Result:", event.data.result);
};

// Handle errors
worker.onerror = function(error) {
    console.error("Worker error:", error.message);
};

// Terminate worker when done
worker.terminate();
```

---

## History API & Client-Side Routing

The History API lets you **change the URL without reloading the page** — this is how SPAs (Single Page Applications) work.

```javascript
// Push a new URL (adds to browser history)
history.pushState({ page: "about" }, "", "/about");

// Replace current URL (doesn't add to history)
history.replaceState({ page: "home" }, "", "/home");

// Go back/forward
history.back();
history.forward();
history.go(-2);  // go back 2 pages

// Listen for back/forward button clicks
window.addEventListener("popstate", (event) => {
    console.log("Navigated to:", location.pathname);
    console.log("State:", event.state);
    renderPage(location.pathname);
});
```

### Mini SPA Router

```javascript
const routes = {
    "/": () => renderHome(),
    "/about": () => renderAbout(),
    "/contact": () => renderContact()
};

function navigate(path) {
    history.pushState(null, "", path);
    const routeHandler = routes[path] || routes["/"];
    routeHandler();
}

// Handle link clicks
document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-route]");
    if (link) {
        e.preventDefault();
        navigate(link.getAttribute("href"));
    }
});

// Handle back/forward
window.addEventListener("popstate", () => {
    const routeHandler = routes[location.pathname] || routes["/"];
    routeHandler();
});
```

---

## URL & URLSearchParams

### URL Object

```javascript
const url = new URL("https://example.com/search?q=javascript&page=2#results");

url.protocol;   // "https:"
url.hostname;   // "example.com"
url.pathname;   // "/search"
url.search;     // "?q=javascript&page=2"
url.hash;       // "#results"
url.origin;     // "https://example.com"
```

### URLSearchParams

```javascript
// Parse query string
const params = new URLSearchParams("?q=javascript&page=2&sort=date");

params.get("q");           // "javascript"
params.get("page");        // "2"
params.has("sort");        // true

// Modify params
params.set("page", "3");
params.append("filter", "recent");
params.delete("sort");

params.toString();         // "q=javascript&page=3&filter=recent"

// Iterate
for (const [key, value] of params) {
    console.log(`${key}: ${value}`);
}

// Build a URL with params
const url = new URL("https://api.example.com/search");
url.searchParams.set("q", "hello world");
url.searchParams.set("limit", "10");
console.log(url.toString());
// "https://api.example.com/search?q=hello+world&limit=10"
```

---

## FormData API

FormData provides a way to send form data, including **file uploads**:

```javascript
const form = document.querySelector("#upload-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);  // automatically collects all inputs

    // Add extra data
    formData.append("timestamp", Date.now());

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
        // Don't set Content-Type — browser sets it with boundary automatically
    });

    const result = await response.json();
    console.log("Upload result:", result);
});
```

### Building FormData Manually

```javascript
const formData = new FormData();
formData.append("name", "Alice");
formData.append("avatar", fileInput.files[0]);  // file upload

// Inspect FormData
for (const [key, value] of formData) {
    console.log(`${key}: ${value}`);
}
```

---

## Performance API

```javascript
// Measure how long something takes
performance.mark("start-fetch");

const data = await fetch("/api/data");
await data.json();

performance.mark("end-fetch");
performance.measure("fetch-duration", "start-fetch", "end-fetch");

const measure = performance.getEntriesByName("fetch-duration")[0];
console.log(`Fetch took ${measure.duration.toFixed(2)}ms`);

// Get page load metrics
window.addEventListener("load", () => {
    const timing = performance.getEntriesByType("navigation")[0];
    console.log(`DOM Content Loaded: ${timing.domContentLoadedEventEnd}ms`);
    console.log(`Full page load: ${timing.loadEventEnd}ms`);
    console.log(`DNS lookup: ${timing.domainLookupEnd - timing.domainLookupStart}ms`);
});

// Resource timing (how long each file took to load)
const resources = performance.getEntriesByType("resource");
resources.forEach(r => {
    console.log(`${r.name}: ${r.duration.toFixed(2)}ms`);
});
```

---

## Key Takeaways

1. **Fetch API** is the modern way to make HTTP requests — always check `response.ok`
2. **localStorage** persists forever, **sessionStorage** dies with the tab
3. **Always `JSON.stringify/parse`** when storing objects in Web Storage
4. **IndexedDB** is for large, structured data storage (offline apps, caching)
5. **AbortController** cancels fetch requests — essential for React cleanup
6. **Web Workers** run heavy code without freezing the UI
7. **History API** enables SPA routing — `pushState` changes URL without reload
8. **URLSearchParams** is the clean way to work with query strings
9. **FormData** handles file uploads — don't set Content-Type manually
10. **Performance API** measures real user metrics — use it to find bottlenecks

---

## Practice Exercises

1. **Build a weather app** using Fetch to call a public weather API and display results
2. **Create a notes app** that persists notes to localStorage with full CRUD operations
3. **Build a "Copy to Clipboard" button** for code blocks
4. **Implement infinite scroll** using Fetch + scroll detection
5. **Build a theme switcher** that saves the user's choice to localStorage and responds to `storage` events across tabs

---

**Previous:** [← Phase 07 — JavaScript ES6+ Deep Dive](Phase-07-JavaScript-ES6-Deep-Dive.md)
**Next:** [Phase 09 — Build Tools & Module Bundlers →](Phase-09-Build-Tools-Module-Bundlers.md)
