# 🌐 JAVASCRIPT WEB APIs - COMPREHENSIVE GUIDE

## Table of Contents
1. [Introduction to Web APIs](#introduction-to-web-apis)
2. [DOM API](#dom-api)
3. [Fetch API](#fetch-api)
4. [Storage API (localStorage & sessionStorage)](#storage-api)
5. [Geolocation API](#geolocation-api)
6. [Canvas API](#canvas-api)
7. [Web Audio API](#web-audio-api)
8. [History API](#history-api)
9. [Notification API](#notification-api)
10. [File API](#file-api)
11. [Drag and Drop API](#drag-and-drop-api)
12. [Web Workers API](#web-workers-api)
13. [Intersection Observer API](#intersection-observer-api)
14. [Mutation Observer API](#mutation-observer-api)
15. [Clipboard API](#clipboard-api)
16. [Page Visibility API](#page-visibility-api)
17. [Battery Status API](#battery-status-api)
18. [Vibration API](#vibration-api)
19. [Screen Orientation API](#screen-orientation-api)
20. [Performance API](#performance-api)

---

## Introduction to Web APIs

**Web APIs** are interfaces provided by browsers that allow JavaScript to interact with the browser environment, hardware, and external services. They extend JavaScript's capabilities beyond the core language.

### What are Web APIs?
- Provided by browsers (not part of JavaScript language itself)
- Enable interaction with browser features and device hardware
- Allow asynchronous operations
- Follow web standards (W3C, WHATWG)

### Categories of Web APIs
1. **DOM Manipulation** - Document, Element
2. **Network** - Fetch, XMLHttpRequest, WebSocket
3. **Storage** - localStorage, sessionStorage, IndexedDB
4. **Media** - Canvas, WebGL, Web Audio, WebRTC
5. **Device** - Geolocation, Battery, Vibration
6. **Background** - Web Workers, Service Workers
7. **User Interface** - Notification, Clipboard, Drag and Drop

---

## 1. DOM API

The **Document Object Model (DOM)** API allows you to interact with and manipulate HTML/XML documents.

### DOM Tree Structure
```
Document
  └── html (documentElement)
      ├── head
      │   ├── title
      │   └── meta
      └── body
          ├── div
          │   ├── h1
          │   └── p
          └── script
```

### Selecting Elements

```javascript
// By ID
const element = document.getElementById('myId');

// By Class Name (returns HTMLCollection)
const elements = document.getElementsByClassName('myClass');

// By Tag Name (returns HTMLCollection)
const paragraphs = document.getElementsByTagName('p');

// Query Selector (returns first match)
const firstDiv = document.querySelector('.container');
const firstButton = document.querySelector('button[type="submit"]');

// Query Selector All (returns NodeList)
const allDivs = document.querySelectorAll('.container');
const allLinks = document.querySelectorAll('a[href^="https"]');
```

### Creating and Modifying Elements

```javascript
// Creating Elements
const newDiv = document.createElement('div');
const newText = document.createTextNode('Hello World');
const newComment = document.createComment('This is a comment');

// Setting Content
newDiv.textContent = 'Plain text content';
newDiv.innerHTML = '<strong>HTML content</strong>';

// Modifying Attributes
newDiv.setAttribute('class', 'container');
newDiv.setAttribute('data-id', '123');
newDiv.getAttribute('class'); // 'container'
newDiv.removeAttribute('data-id');

// Using className and classList
newDiv.className = 'box active'; // Sets entire class string
newDiv.classList.add('highlight'); // Adds a class
newDiv.classList.remove('active'); // Removes a class
newDiv.classList.toggle('visible'); // Toggles a class
newDiv.classList.contains('box'); // true
newDiv.classList.replace('box', 'container'); // Replaces class

// Modifying Styles
newDiv.style.backgroundColor = 'blue';
newDiv.style.padding = '20px';
newDiv.style.cssText = 'color: red; font-size: 16px;';

// Getting computed styles
const styles = window.getComputedStyle(newDiv);
console.log(styles.backgroundColor);
```

### Adding/Removing Elements

```javascript
// Appending Elements
const parent = document.getElementById('parent');
const child = document.createElement('div');

parent.appendChild(child); // Adds at the end
parent.insertBefore(child, parent.firstChild); // Adds before reference
parent.append(child, 'text', anotherElement); // Can add multiple nodes
parent.prepend(child); // Adds at the beginning

// Modern Methods
child.before(newElement); // Insert before child
child.after(newElement); // Insert after child
child.replaceWith(newElement); // Replace child

// Removing Elements
parent.removeChild(child); // Old way
child.remove(); // Modern way

// Cloning Elements
const clone = child.cloneNode(true); // true = deep clone (includes children)
const shallowClone = child.cloneNode(false);
```

### Traversing the DOM

```javascript
const element = document.querySelector('.item');

// Parent Navigation
element.parentNode; // Parent (including text nodes)
element.parentElement; // Parent element
element.closest('.container'); // Nearest ancestor matching selector

// Child Navigation
element.childNodes; // All child nodes (including text)
element.children; // Only element children
element.firstChild; // First child node
element.firstElementChild; // First child element
element.lastChild; // Last child node
element.lastElementChild; // Last child element
element.hasChildNodes(); // Boolean

// Sibling Navigation
element.nextSibling; // Next sibling node
element.nextElementSibling; // Next sibling element
element.previousSibling; // Previous sibling node
element.previousElementSibling; // Previous sibling element
```

### Event Handling

```javascript
// Adding Event Listeners
const button = document.querySelector('button');

// Method 1: addEventListener (recommended)
button.addEventListener('click', function(event) {
  console.log('Button clicked!');
  console.log(event.target); // Element that triggered event
});

// Method 2: Event handler property
button.onclick = function(event) {
  console.log('Clicked');
};

// Event with options
button.addEventListener('click', handleClick, {
  once: true,      // Remove listener after first call
  passive: true,   // Won't call preventDefault()
  capture: false   // Use bubbling phase (not capture)
});

// Removing Event Listeners
function handleClick(e) {
  console.log('Clicked');
}
button.addEventListener('click', handleClick);
button.removeEventListener('click', handleClick);

// Event Object Properties
button.addEventListener('click', function(event) {
  event.type;              // 'click'
  event.target;            // Element that triggered event
  event.currentTarget;     // Element with listener attached
  event.timeStamp;         // Time event occurred
  event.preventDefault();  // Prevent default behavior
  event.stopPropagation(); // Stop event bubbling
  event.stopImmediatePropagation(); // Stop other listeners on same element
});
```

### Common DOM Events

```javascript
// Mouse Events
element.addEventListener('click', handler);
element.addEventListener('dblclick', handler);
element.addEventListener('mousedown', handler);
element.addEventListener('mouseup', handler);
element.addEventListener('mousemove', handler);
element.addEventListener('mouseenter', handler);
element.addEventListener('mouseleave', handler);
element.addEventListener('mouseover', handler);
element.addEventListener('mouseout', handler);
element.addEventListener('contextmenu', handler); // Right click

// Keyboard Events
element.addEventListener('keydown', (e) => {
  console.log(e.key);      // 'a', 'Enter', 'ArrowUp'
  console.log(e.code);     // 'KeyA', 'Enter', 'ArrowUp'
  console.log(e.keyCode);  // Numeric code (deprecated)
  console.log(e.ctrlKey);  // true if Ctrl pressed
  console.log(e.shiftKey); // true if Shift pressed
  console.log(e.altKey);   // true if Alt pressed
});
element.addEventListener('keyup', handler);
element.addEventListener('keypress', handler); // Deprecated

// Form Events
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent form submission
});
input.addEventListener('focus', handler);
input.addEventListener('blur', handler);
input.addEventListener('change', handler);
input.addEventListener('input', handler); // Every keystroke

// Window Events
window.addEventListener('load', handler);    // All resources loaded
window.addEventListener('DOMContentLoaded', handler); // DOM ready
window.addEventListener('resize', handler);
window.addEventListener('scroll', handler);
window.addEventListener('beforeunload', handler);

// Touch Events (mobile)
element.addEventListener('touchstart', handler);
element.addEventListener('touchmove', handler);
element.addEventListener('touchend', handler);
```

### Event Delegation

```javascript
// Instead of adding listeners to many elements
// Add one listener to parent and check event.target

const list = document.querySelector('ul');

list.addEventListener('click', function(e) {
  if (e.target.tagName === 'LI') {
    console.log('List item clicked:', e.target.textContent);
    e.target.classList.toggle('completed');
  }
});

// Works for dynamically added elements too!
const newItem = document.createElement('li');
newItem.textContent = 'New Item';
list.appendChild(newItem); // Will work with delegation
```

### Practical DOM Examples

```javascript
// Example 1: Todo List
function createTodoList() {
  const container = document.createElement('div');
  container.className = 'todo-container';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Add todo...';
  
  const button = document.createElement('button');
  button.textContent = 'Add';
  
  const list = document.createElement('ul');
  
  button.addEventListener('click', () => {
    if (input.value.trim()) {
      const li = document.createElement('li');
      li.textContent = input.value;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => li.remove());
      
      li.appendChild(deleteBtn);
      list.appendChild(li);
      input.value = '';
    }
  });
  
  container.append(input, button, list);
  document.body.appendChild(container);
}

// Example 2: Dynamic Table
function createTable(data) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  
  // Create header
  const headerRow = document.createElement('tr');
  Object.keys(data[0]).forEach(key => {
    const th = document.createElement('th');
    th.textContent = key;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  
  // Create rows
  data.forEach(item => {
    const row = document.createElement('tr');
    Object.values(item).forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  
  table.append(thead, tbody);
  return table;
}

// Usage
const data = [
  { name: 'John', age: 30, city: 'New York' },
  { name: 'Jane', age: 25, city: 'London' }
];
document.body.appendChild(createTable(data));

// Example 3: Modal Dialog
function createModal(content) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.onclick = () => overlay.remove();
  
  modal.innerHTML = content;
  modal.prepend(closeBtn);
  overlay.appendChild(modal);
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  
  document.body.appendChild(overlay);
}
```

---

## 2. Fetch API

The **Fetch API** provides a modern interface for making HTTP requests to servers.

### Basic Fetch Syntax

```javascript
// Basic GET request
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Using async/await (recommended)
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Response Object

```javascript
async function checkResponse() {
  const response = await fetch('https://api.example.com/data');
  
  // Response properties
  console.log(response.ok);         // true if status 200-299
  console.log(response.status);     // 200, 404, 500, etc.
  console.log(response.statusText); // 'OK', 'Not Found', etc.
  console.log(response.headers);    // Headers object
  console.log(response.url);        // Final URL (after redirects)
  console.log(response.redirected); // true if redirected
  console.log(response.type);       // 'basic', 'cors', 'opaque'
  
  // Response methods for parsing body
  const json = await response.json();     // Parse as JSON
  const text = await response.text();     // Parse as text
  const blob = await response.blob();     // Parse as Blob
  const buffer = await response.arrayBuffer(); // Parse as ArrayBuffer
  const form = await response.formData(); // Parse as FormData
  
  // Clone response (body can only be read once)
  const clone = response.clone();
}
```

### Request Options

```javascript
// Full fetch options
const options = {
  method: 'POST',           // GET, POST, PUT, DELETE, PATCH
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123',
    'Accept': 'application/json'
  },
  body: JSON.stringify({    // Request body (POST, PUT, PATCH)
    name: 'John',
    email: 'john@example.com'
  }),
  mode: 'cors',             // cors, no-cors, same-origin
  credentials: 'include',   // include, same-origin, omit
  cache: 'no-cache',        // default, no-cache, reload, force-cache
  redirect: 'follow',       // follow, error, manual
  referrerPolicy: 'no-referrer', // no-referrer, origin, etc.
  signal: abortController.signal // For aborting requests
};

fetch('https://api.example.com/users', options)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### HTTP Methods

```javascript
// GET Request
async function getUsers() {
  const response = await fetch('https://api.example.com/users');
  const users = await response.json();
  return users;
}

// POST Request
async function createUser(userData) {
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  const newUser = await response.json();
  return newUser;
}

// PUT Request (full update)
async function updateUser(userId, userData) {
  const response = await fetch(`https://api.example.com/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return response.json();
}

// PATCH Request (partial update)
async function patchUser(userId, updates) {
  const response = await fetch(`https://api.example.com/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  return response.json();
}

// DELETE Request
async function deleteUser(userId) {
  const response = await fetch(`https://api.example.com/users/${userId}`, {
    method: 'DELETE'
  });
  return response.ok;
}
```

### Error Handling

```javascript
// Proper error handling
async function fetchWithErrorHandling(url) {
  try {
    const response = await fetch(url);
    
    // Check if response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError') {
      console.error('Network error:', error);
    } else {
      console.error('Fetch error:', error);
    }
    throw error;
  }
}

// Handle specific status codes
async function handleStatuses(url) {
  const response = await fetch(url);
  
  switch (response.status) {
    case 200:
      return await response.json();
    case 404:
      throw new Error('Resource not found');
    case 401:
      throw new Error('Unauthorized');
    case 500:
      throw new Error('Server error');
    default:
      throw new Error(`Unexpected status: ${response.status}`);
  }
}
```

### Aborting Requests

```javascript
// Using AbortController
const controller = new AbortController();
const signal = controller.signal;

// Start fetch with signal
fetch('https://api.example.com/data', { signal })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('Fetch aborted');
    } else {
      console.error('Error:', error);
    }
  });

// Abort the request
controller.abort();

// Timeout example
function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const signal = controller.signal;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, { signal })
    .then(response => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch(error => {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    });
}
```

### Headers API

```javascript
// Creating headers
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', 'Bearer token123');

// Or use object
const headers2 = new Headers({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer token123'
});

// Headers methods
headers.has('Content-Type');      // true
headers.get('Content-Type');      // 'application/json'
headers.set('Content-Type', 'text/html'); // Update
headers.delete('Authorization');  // Remove

// Iterate headers
for (const [key, value] of headers) {
  console.log(`${key}: ${value}`);
}

// Use in fetch
fetch(url, { headers });
```

### Sending Different Data Types

```javascript
// JSON data
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' })
});

// Form data
const formData = new FormData();
formData.append('name', 'John');
formData.append('email', 'john@example.com');
formData.append('file', fileInput.files[0]);

fetch(url, {
  method: 'POST',
  body: formData // No Content-Type header needed
});

// URL-encoded data
const params = new URLSearchParams();
params.append('name', 'John');
params.append('email', 'john@example.com');

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params
});

// Blob data
const blob = new Blob(['Hello World'], { type: 'text/plain' });
fetch(url, {
  method: 'POST',
  body: blob
});

// ArrayBuffer
const buffer = new ArrayBuffer(8);
fetch(url, {
  method: 'POST',
  body: buffer
});
```

### Practical Fetch Examples

```javascript
// Example 1: Fetch with loading state
class DataFetcher {
  constructor() {
    this.loading = false;
    this.error = null;
    this.data = null;
  }
  
  async fetch(url) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.data = await response.json();
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
    
    return this.data;
  }
}

// Example 2: Retry mechanism
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (i === retries - 1) {
        throw new Error(`Failed after ${retries} retries`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}

// Example 3: Parallel requests
async function fetchMultiple(urls) {
  try {
    const promises = urls.map(url => fetch(url).then(r => r.json()));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('One or more requests failed:', error);
  }
}

// Usage
const urls = [
  'https://api.example.com/users',
  'https://api.example.com/posts',
  'https://api.example.com/comments'
];
const [users, posts, comments] = await fetchMultiple(urls);

// Example 4: API wrapper class
class API {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }
  
  setAuth(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    };
    
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }
  
  get(endpoint) {
    return this.request(endpoint);
  }
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Usage
const api = new API('https://api.example.com');
api.setAuth('your-token');

const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'John' });
```

---

## 3. Storage API (localStorage & sessionStorage)

**Web Storage API** provides mechanisms for storing key-value pairs in the browser.

### Differences: localStorage vs sessionStorage

| Feature | localStorage | sessionStorage |
|---------|-------------|----------------|
| Lifetime | Persistent (no expiration) | Tab/window session only |
| Scope | Shared across all tabs/windows | Limited to single tab |
| Size Limit | ~5-10MB | ~5-10MB |
| Cleared When | Manual deletion or browser cache clear | Tab/window closes |

### Basic Operations

```javascript
// Setting items (values must be strings)
localStorage.setItem('username', 'John');
localStorage.setItem('userId', '123');

// Getting items
const username = localStorage.getItem('username'); // 'John'
const userId = localStorage.getItem('userId');     // '123'

// Removing items
localStorage.removeItem('username');

// Clearing all items
localStorage.clear();

// Check if key exists
if (localStorage.getItem('username') !== null) {
  console.log('Username exists');
}

// Get number of items
const itemCount = localStorage.length;

// Get key by index
const firstKey = localStorage.key(0);
```

### Storing Complex Data

```javascript
// Storing objects (must stringify)
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
};

// Save
localStorage.setItem('user', JSON.stringify(user));

// Retrieve
const savedUser = JSON.parse(localStorage.getItem('user'));

// Storing arrays
const todos = ['Task 1', 'Task 2', 'Task 3'];
localStorage.setItem('todos', JSON.stringify(todos));
const savedTodos = JSON.parse(localStorage.getItem('todos'));

// Helper functions
const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Parse error:', e);
      return defaultValue;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  }
};

// Usage
storage.set('user', { name: 'John' });
const user = storage.get('user');
```

### Storage Events

```javascript
// Listen for storage changes (in other tabs/windows)
window.addEventListener('storage', (event) => {
  console.log('Storage changed:');
  console.log('Key:', event.key);           // Changed key
  console.log('Old Value:', event.oldValue); // Previous value
  console.log('New Value:', event.newValue); // New value
  console.log('URL:', event.url);           // URL where change occurred
  console.log('Storage:', event.storageArea); // localStorage or sessionStorage
});

// Note: storage event only fires in OTHER tabs/windows
// Not in the tab that made the change
```

### Storage Quota Management

```javascript
// Check storage quota (if supported)
if ('storage' in navigator && 'estimate' in navigator.storage) {
  navigator.storage.estimate().then(estimate => {
    const percentUsed = (estimate.usage / estimate.quota) * 100;
    console.log(`Using ${estimate.usage} of ${estimate.quota} bytes (${percentUsed.toFixed(2)}%)`);
  });
}

// Handle quota exceeded errors
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded');
      // Handle: clear old data, notify user, etc.
    }
    return false;
  }
}
```

### Practical Storage Examples

```javascript
// Example 1: Theme Preference
class ThemeManager {
  constructor() {
    this.key = 'theme';
    this.loadTheme();
  }
  
  loadTheme() {
    const savedTheme = localStorage.getItem(this.key) || 'light';
    this.applyTheme(savedTheme);
  }
  
  applyTheme(theme) {
    document.body.className = theme;
    localStorage.setItem(this.key, theme);
  }
  
  toggle() {
    const current = localStorage.getItem(this.key) || 'light';
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }
}

const themeManager = new ThemeManager();

// Example 2: Form Auto-save
class FormAutoSave {
  constructor(formId, storageKey) {
    this.form = document.getElementById(formId);
    this.storageKey = storageKey;
    this.init();
  }
  
  init() {
    // Load saved data
    this.load();
    
    // Save on input
    this.form.addEventListener('input', () => this.save());
    
    // Clear on submit
    this.form.addEventListener('submit', () => this.clear());
  }
  
  save() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  load() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(key => {
        const input = this.form.elements[key];
        if (input) input.value = data[key];
      });
    }
  }
  
  clear() {
    localStorage.removeItem(this.storageKey);
  }
}

// Usage
const autoSave = new FormAutoSave('myForm', 'form-backup');

// Example 3: Recently Viewed Items
class RecentlyViewed {
  constructor(maxItems = 10) {
    this.key = 'recently-viewed';
    this.maxItems = maxItems;
  }
  
  add(item) {
    let items = this.getAll();
    
    // Remove if already exists
    items = items.filter(i => i.id !== item.id);
    
    // Add to beginning
    items.unshift(item);
    
    // Limit size
    if (items.length > this.maxItems) {
      items = items.slice(0, this.maxItems);
    }
    
    localStorage.setItem(this.key, JSON.stringify(items));
  }
  
  getAll() {
    const items = localStorage.getItem(this.key);
    return items ? JSON.parse(items) : [];
  }
  
  clear() {
    localStorage.removeItem(this.key);
  }
}

// Usage
const recentlyViewed = new RecentlyViewed(5);
recentlyViewed.add({ id: 1, name: 'Product A', url: '/products/1' });

// Example 4: Settings Manager
class Settings {
  constructor(defaults = {}) {
    this.key = 'app-settings';
    this.defaults = defaults;
  }
  
  get(key) {
    const settings = this.getAll();
    return settings[key] !== undefined ? settings[key] : this.defaults[key];
  }
  
  getAll() {
    const saved = localStorage.getItem(this.key);
    return saved ? { ...this.defaults, ...JSON.parse(saved) } : this.defaults;
  }
  
  set(key, value) {
    const settings = this.getAll();
    settings[key] = value;
    localStorage.setItem(this.key, JSON.stringify(settings));
  }
  
  update(newSettings) {
    const settings = this.getAll();
    const updated = { ...settings, ...newSettings };
    localStorage.setItem(this.key, JSON.stringify(updated));
  }
  
  reset() {
    localStorage.setItem(this.key, JSON.stringify(this.defaults));
  }
  
  clear() {
    localStorage.removeItem(this.key);
  }
}

// Usage
const settings = new Settings({
  theme: 'light',
  language: 'en',
  notifications: true
});

settings.set('theme', 'dark');
console.log(settings.get('theme')); // 'dark'
settings.update({ theme: 'light', language: 'es' });
```

### Session Storage Examples

```javascript
// Session storage (same API as localStorage)
// But data is cleared when tab/window closes

// Shopping cart for current session
const cart = {
  add(item) {
    const items = this.getItems();
    items.push(item);
    sessionStorage.setItem('cart', JSON.stringify(items));
  },
  
  getItems() {
    const items = sessionStorage.getItem('cart');
    return items ? JSON.parse(items) : [];
  },
  
  clear() {
    sessionStorage.removeItem('cart');
  }
};

// Form state across page navigation (within same session)
// Save before leaving page
window.addEventListener('beforeunload', () => {
  const formData = {
    step: 2,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value
  };
  sessionStorage.setItem('checkout-state', JSON.stringify(formData));
});

// Restore on page load
window.addEventListener('load', () => {
  const saved = sessionStorage.getItem('checkout-state');
  if (saved) {
    const data = JSON.parse(saved);
    // Restore form state
  }
});
```

---

## 4. Geolocation API

The **Geolocation API** allows you to get the user's geographical location.

### Getting Current Position

```javascript
// Check if geolocation is supported
if ('geolocation' in navigator) {
  console.log('Geolocation is available');
} else {
  console.log('Geolocation is not supported');
}

// Get current position (one-time)
navigator.geolocation.getCurrentPosition(
  // Success callback
  (position) => {
    console.log('Latitude:', position.coords.latitude);
    console.log('Longitude:', position.coords.longitude);
    console.log('Accuracy:', position.coords.accuracy, 'meters');
    console.log('Altitude:', position.coords.altitude);
    console.log('Altitude Accuracy:', position.coords.altitudeAccuracy);
    console.log('Heading:', position.coords.heading); // Direction of travel
    console.log('Speed:', position.coords.speed);     // m/s
    console.log('Timestamp:', position.timestamp);
  },
  // Error callback
  (error) => {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        console.error('User denied geolocation');
        break;
      case error.POSITION_UNAVAILABLE:
        console.error('Position unavailable');
        break;
      case error.TIMEOUT:
        console.error('Request timeout');
        break;
      default:
        console.error('Unknown error');
    }
  },
  // Options
  {
    enableHighAccuracy: true,  // Use GPS if available
    timeout: 5000,             // Max time to wait (ms)
    maximumAge: 0              // Max age of cached position (ms)
  }
);
```

### Watching Position (Continuous Tracking)

```javascript
// Watch position (continuous updates)
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    console.log('New position:', position.coords.latitude, position.coords.longitude);
    updateMapMarker(position.coords);
  },
  (error) => {
    console.error('Watch error:', error);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
);

// Stop watching
navigator.geolocation.clearWatch(watchId);
```

### Practical Geolocation Examples

```javascript
// Example 1: Get location with Promise wrapper
function getPosition(options = {}) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

// Usage with async/await
async function showLocation() {
  try {
    const position = await getPosition({
      enableHighAccuracy: true,
      timeout: 5000
    });
    
    const { latitude, longitude } = position.coords;
    console.log(`Location: ${latitude}, ${longitude}`);
  } catch (error) {
    console.error('Error getting location:', error.message);
  }
}

// Example 2: Distance Calculator
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance; // km
}

// Find nearest store
async function findNearestStore(stores) {
  const position = await getPosition();
  const { latitude, longitude } = position.coords;
  
  let nearest = null;
  let minDistance = Infinity;
  
  stores.forEach(store => {
    const distance = calculateDistance(
      latitude, longitude,
      store.lat, store.lon
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = store;
    }
  });
  
  return { store: nearest, distance: minDistance };
}

// Example 3: Location Tracker
class LocationTracker {
  constructor() {
    this.watchId = null;
    this.positions = [];
  }
  
  start(onUpdate, onError) {
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.positions.push({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp
        });
        
        if (onUpdate) onUpdate(position);
      },
      (error) => {
        if (onError) onError(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0
      }
    );
  }
  
  stop() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
  
  getPath() {
    return this.positions;
  }
  
  getTotalDistance() {
    let total = 0;
    for (let i = 1; i < this.positions.length; i++) {
      const prev = this.positions[i - 1];
      const curr = this.positions[i];
      total += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    }
    return total;
  }
  
  clear() {
    this.positions = [];
  }
}

// Usage
const tracker = new LocationTracker();
tracker.start(
  (position) => console.log('New position:', position.coords),
  (error) => console.error('Error:', error)
);

// Later...
tracker.stop();
console.log('Total distance:', tracker.getTotalDistance(), 'km');

// Example 4: Reverse Geocoding (coordinates to address)
async function reverseGeocode(lat, lon) {
  // Using OpenStreetMap Nominatim (free)
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.display_name;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Get current address
async function getCurrentAddress() {
  const position = await getPosition();
  const { latitude, longitude } = position.coords;
  const address = await reverseGeocode(latitude, longitude);
  console.log('Current address:', address);
}

// Example 5: Geofencing
class Geofence {
  constructor(centerLat, centerLon, radiusKm) {
    this.center = { lat: centerLat, lon: centerLon };
    this.radius = radiusKm;
    this.watchId = null;
  }
  
  isInside(lat, lon) {
    const distance = calculateDistance(
      this.center.lat, this.center.lon,
      lat, lon
    );
    return distance <= this.radius;
  }
  
  watch(onEnter, onExit) {
    let wasInside = false;
    
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const isInside = this.isInside(latitude, longitude);
        
        if (isInside && !wasInside) {
          onEnter(position);
        } else if (!isInside && wasInside) {
          onExit(position);
        }
        
        wasInside = isInside;
      },
      (error) => console.error('Geofence error:', error),
      { enableHighAccuracy: true }
    );
  }
  
  stop() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }
}

// Usage
const fence = new Geofence(40.7128, -74.0060, 1); // 1km radius around NYC
fence.watch(
  (pos) => console.log('Entered geofence!', pos),
  (pos) => console.log('Left geofence!', pos)
);
```

---

## 5. Canvas API

The **Canvas API** provides a way to draw 2D graphics using JavaScript.

### Basic Canvas Setup

```html
<canvas id="myCanvas" width="800" height="600"></canvas>
```

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Get canvas dimensions
console.log(canvas.width, canvas.height);

// Resize canvas
canvas.width = 1000;
canvas.height = 800;

// Clear canvas
ctx.clearRect(0, 0, canvas.width, canvas.height);
```

### Drawing Shapes

```javascript
// Rectangle
ctx.fillStyle = 'blue';
ctx.fillRect(50, 50, 200, 100); // x, y, width, height

ctx.strokeStyle = 'red';
ctx.lineWidth = 3;
ctx.strokeRect(300, 50, 200, 100);

// Clear rectangle (transparent)
ctx.clearRect(60, 60, 50, 50);

// Paths
ctx.beginPath();
ctx.moveTo(100, 200);
ctx.lineTo(200, 300);
ctx.lineTo(50, 300);
ctx.closePath(); // Connect back to start
ctx.fillStyle = 'green';
ctx.fill();
ctx.stroke();

// Circle
ctx.beginPath();
ctx.arc(400, 250, 50, 0, Math.PI * 2); // x, y, radius, startAngle, endAngle
ctx.fillStyle = 'orange';
ctx.fill();

// Arc (partial circle)
ctx.beginPath();
ctx.arc(500, 250, 50, 0, Math.PI); // Half circle
ctx.stroke();

// Ellipse
ctx.beginPath();
ctx.ellipse(600, 250, 75, 50, 0, 0, Math.PI * 2); // x, y, radiusX, radiusY, rotation, start, end
ctx.stroke();

// Rounded rectangle (custom function)
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

roundRect(ctx, 100, 400, 150, 100, 10);
ctx.fillStyle = 'purple';
ctx.fill();
```

### Lines and Curves

```javascript
// Line
ctx.beginPath();
ctx.moveTo(50, 50);
ctx.lineTo(200, 200);
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;
ctx.stroke();

// Line cap styles
ctx.lineCap = 'butt';   // Default
ctx.lineCap = 'round';  // Rounded ends
ctx.lineCap = 'square'; // Square ends

// Line join styles
ctx.lineJoin = 'miter'; // Default
ctx.lineJoin = 'round'; // Rounded corners
ctx.lineJoin = 'bevel'; // Beveled corners

// Dashed lines
ctx.setLineDash([10, 5]); // [dash length, gap length]
ctx.lineDashOffset = 0;

// Quadratic curve
ctx.beginPath();
ctx.moveTo(50, 300);
ctx.quadraticCurveTo(150, 200, 250, 300); // control point, end point
ctx.stroke();

// Bezier curve
ctx.beginPath();
ctx.moveTo(50, 400);
ctx.bezierCurveTo(100, 300, 200, 500, 250, 400); // 2 control points, end point
ctx.stroke();
```

### Text

```javascript
// Fill text
ctx.font = '30px Arial';
ctx.fillStyle = 'black';
ctx.fillText('Hello Canvas!', 100, 100);

// Stroke text (outline)
ctx.strokeStyle = 'blue';
ctx.strokeText('Outlined Text', 100, 150);

// Font properties
ctx.font = 'italic bold 24px Georgia';
ctx.textAlign = 'left';   // left, right, center, start, end
ctx.textBaseline = 'top'; // top, middle, bottom, alphabetic, hanging

// Text with max width
ctx.fillText('Constrained Text', 100, 200, 150); // max width 150px

// Measure text
const metrics = ctx.measureText('Hello');
console.log('Text width:', metrics.width);
```

### Colors and Styles

```javascript
// Solid colors
ctx.fillStyle = 'red';
ctx.fillStyle = '#FF0000';
ctx.fillStyle = 'rgb(255, 0, 0)';
ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // With transparency

// Linear gradient
const linearGrad = ctx.createLinearGradient(0, 0, 200, 0); // x1, y1, x2, y2
linearGrad.addColorStop(0, 'red');
linearGrad.addColorStop(0.5, 'yellow');
linearGrad.addColorStop(1, 'blue');
ctx.fillStyle = linearGrad;
ctx.fillRect(50, 50, 200, 100);

// Radial gradient
const radialGrad = ctx.createRadialGradient(300, 100, 10, 300, 100, 100);
radialGrad.addColorStop(0, 'white');
radialGrad.addColorStop(1, 'blue');
ctx.fillStyle = radialGrad;
ctx.fillRect(200, 50, 200, 100);

// Pattern
const img = new Image();
img.src = 'pattern.png';
img.onload = function() {
  const pattern = ctx.createPattern(img, 'repeat'); // repeat, repeat-x, repeat-y, no-repeat
  ctx.fillStyle = pattern;
  ctx.fillRect(50, 200, 300, 200);
};

// Shadows
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 5;
ctx.shadowOffsetY = 5;
ctx.fillRect(100, 300, 150, 100);

// Transparency
ctx.globalAlpha = 0.5; // 0 (transparent) to 1 (opaque)
ctx.fillRect(200, 300, 150, 100);
ctx.globalAlpha = 1; // Reset
```

### Images

```javascript
// Draw image
const img = new Image();
img.src = 'photo.jpg';

img.onload = function() {
  // Draw full image
  ctx.drawImage(img, 0, 0);
  
  // Draw with size
  ctx.drawImage(img, 0, 0, 300, 200);
  
  // Draw cropped and positioned
  // drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  ctx.drawImage(img, 100, 100, 200, 200, 0, 0, 400, 400);
};

// Get image data
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
console.log(imageData.data); // Uint8ClampedArray [r, g, b, a, r, g, b, a, ...]

// Modify pixels
for (let i = 0; i < imageData.data.length; i += 4) {
  imageData.data[i] = 255;     // Red
  imageData.data[i + 1] = 0;   // Green
  imageData.data[i + 2] = 0;   // Blue
  imageData.data[i + 3] = 255; // Alpha
}

// Put modified data back
ctx.putImageData(imageData, 0, 0);

// Create image data
const newImageData = ctx.createImageData(100, 100);
```

### Transformations

```javascript
// Save current state
ctx.save();

// Translate (move origin)
ctx.translate(100, 100);
ctx.fillRect(0, 0, 50, 50); // Actually draws at (100, 100)

// Rotate (in radians)
ctx.rotate(Math.PI / 4); // 45 degrees
ctx.fillRect(0, 0, 50, 50);

// Scale
ctx.scale(2, 2); // Double size
ctx.fillRect(0, 0, 50, 50);

// Transform matrix
ctx.transform(a, b, c, d, e, f);
// a: horizontal scaling
// b: horizontal skewing
// c: vertical skewing
// d: vertical scaling
// e: horizontal translation
// f: vertical translation

// Reset transform
ctx.setTransform(1, 0, 0, 1, 0, 0);

// Restore previous state
ctx.restore();
```

### Compositing

```javascript
// Global composite operations
ctx.globalCompositeOperation = 'source-over';    // Default (new over old)
ctx.globalCompositeOperation = 'destination-over'; // Old over new
ctx.globalCompositeOperation = 'source-in';      // New where overlapping
ctx.globalCompositeOperation = 'destination-in';  // Old where overlapping
ctx.globalCompositeOperation = 'source-out';     // New where not overlapping
ctx.globalCompositeOperation = 'destination-out'; // Old where not overlapping
ctx.globalCompositeOperation = 'source-atop';    // New on top of old
ctx.globalCompositeOperation = 'destination-atop';// Old on top of new
ctx.globalCompositeOperation = 'lighter';        // Sum of both
ctx.globalCompositeOperation = 'copy';           // Only new
ctx.globalCompositeOperation = 'xor';            // XOR of both
ctx.globalCompositeOperation = 'multiply';       // Multiply blend
ctx.globalCompositeOperation = 'screen';         // Screen blend
ctx.globalCompositeOperation = 'overlay';        // Overlay blend
```

### Practical Canvas Examples

```javascript
// Example 1: Drawing App
class DrawingApp {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.color = 'black';
    this.lineWidth = 2;
    
    this.init();
  }
  
  init() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDrawing = true;
      [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isDrawing) return;
      this.draw(e.offsetX, e.offsetY);
    });
    
    this.canvas.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.isDrawing = false;
    });
  }
  
  draw(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();
    
    [this.lastX, this.lastY] = [x, y];
  }
  
  setColor(color) {
    this.color = color;
  }
  
  setLineWidth(width) {
    this.lineWidth = width;
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  save() {
    const dataURL = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = dataURL;
    link.click();
  }
}

// Usage
const app = new DrawingApp('myCanvas');
app.setColor('red');
app.setLineWidth(5);

// Example 2: Particle System
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.radius = Math.random() * 3 + 1;
    this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    this.life = 1;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // Gravity
    this.life -= 0.01;
  }
  
  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  
  isDead() {
    return this.life <= 0;
  }
}

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
  }
  
  emit(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y));
    }
  }
  
  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles = this.particles.filter(p => {
      p.update();
      p.draw(this.ctx);
      return !p.isDead();
    });
  }
  
  start() {
    const animate = () => {
      this.update();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Usage
const particleSystem = new ParticleSystem(canvas);
particleSystem.start();

canvas.addEventListener('click', (e) => {
  particleSystem.emit(e.offsetX, e.offsetY, 20);
});

// Example 3: Chart/Graph
function drawBarChart(ctx, data, options = {}) {
  const {
    x = 50,
    y = 50,
    width = 500,
    height = 300,
    barColor = 'steelblue',
    labelColor = 'black'
  } = options;
  
  const barWidth = width / data.length;
  const maxValue = Math.max(...data.map(d => d.value));
  
  // Draw bars
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * height;
    const barX = x + index * barWidth;
    const barY = y + height - barHeight;
    
    // Bar
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barWidth - 5, barHeight);
    
    // Label
    ctx.fillStyle = labelColor;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(item.label, barX + barWidth / 2, y + height + 20);
    
    // Value
    ctx.fillText(item.value, barX + barWidth / 2, barY - 5);
  });
  
  // Y-axis
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.strokeStyle = 'black';
  ctx.stroke();
}

// Usage
const chartData = [
  { label: 'Jan', value: 65 },
  { label: 'Feb', value: 59 },
  { label: 'Mar', value: 80 },
  { label: 'Apr', value: 81 },
  { label: 'May', value: 56 }
];

drawBarChart(ctx, chartData);

// Example 4: Image Filter
function applyFilter(ctx, filter) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  
  switch(filter) {
    case 'grayscale':
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
      }
      break;
      
    case 'invert':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      break;
      
    case 'sepia':
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      }
      break;
      
    case 'brightness':
      const adjustment = 50;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + adjustment);
        data[i + 1] = Math.min(255, data[i + 1] + adjustment);
        data[i + 2] = Math.min(255, data[i + 2] + adjustment);
      }
      break;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// Usage
applyFilter(ctx, 'grayscale');
```

---

## 6. Web Audio API

The **Web Audio API** provides powerful audio processing and synthesis capabilities.

### Audio Context

```javascript
// Create audio context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Audio context properties
console.log(audioCtx.state);           // 'suspended', 'running', 'closed'
console.log(audioCtx.sampleRate);      // 44100, 48000, etc.
console.log(audioCtx.currentTime);     // Current time in seconds
console.log(audioCtx.destination);     // Output destination

// Resume audio context (required after user interaction)
audioCtx.resume();

// Suspend audio context
audioCtx.suspend();

// Close audio context
audioCtx.close();
```

### Playing Audio Files

```javascript
// Load and play audio file
async function playAudio(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start(0);
  
  return source;
}

// Usage
playAudio('song.mp3');

// With HTML Audio Element
const audio = new Audio('song.mp3');
const source = audioCtx.createMediaElementSource(audio);
source.connect(audioCtx.destination);
audio.play();
```

### Oscillator (Sound Generation)

```javascript
// Create oscillator
const oscillator = audioCtx.createOscillator();

// Oscillator types
oscillator.type = 'sine';     // Smooth tone
oscillator.type = 'square';   // Harsh tone
oscillator.type = 'sawtooth'; // Buzzy tone
oscillator.type = 'triangle'; // Mellow tone

// Set frequency
oscillator.frequency.value = 440; // A4 note (Hz)

// Connect to output
oscillator.connect(audioCtx.destination);

// Start and stop
oscillator.start(audioCtx.currentTime);
oscillator.stop(audioCtx.currentTime + 2); // Play for 2 seconds

// Frequency sweep
oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
oscillator.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 2);
```

### Gain (Volume Control)

```javascript
// Create gain node
const gainNode = audioCtx.createGain();

// Set volume (0 to 1, or higher for amplification)
gainNode.gain.value = 0.5;

// Connect: source -> gain -> destination
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);

// Fade in
gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 2);

// Fade out
gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2);
```

### Filters

```javascript
// Create filter
const filter = audioCtx.createBiquadFilter();

// Filter types
filter.type = 'lowpass';    // Allow low frequencies
filter.type = 'highpass';   // Allow high frequencies
filter.type = 'bandpass';   // Allow specific band
filter.type = 'lowshelf';   // Boost/cut low frequencies
filter.type = 'highshelf';  // Boost/cut high frequencies
filter.type = 'peaking';    // Boost/cut specific frequency
filter.type = 'notch';      // Remove specific frequency
filter.type = 'allpass';    // Phase shift

// Filter parameters
filter.frequency.value = 1000; // Cutoff/center frequency (Hz)
filter.Q.value = 1;            // Quality factor (resonance)
filter.gain.value = 0;         // Gain in dB

// Connect: source -> filter -> destination
oscillator.connect(filter);
filter.connect(audioCtx.destination);
```

### Practical Audio Examples

```javascript
// Example 1: Play a musical note
function playNote(frequency, duration, type = 'sine') {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.value = frequency;
  
  // ADSR envelope
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
  gain.gain.exponentialRampToValueAtTime(0.1, now + 0.1); // Decay
  gain.gain.setValueAtTime(0.1, now + duration - 0.1); // Sustain
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start(now);
  osc.stop(now + duration);
}

// Play C major scale
const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
notes.forEach((freq, i) => {
  setTimeout(() => playNote(freq, 0.5), i * 500);
});

// Example 2: Simple Synthesizer
class Synth {
  constructor() {
    this.oscillators = {};
  }
  
  noteOn(frequency) {
    if (this.oscillators[frequency]) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.value = frequency;
    
    gain.gain.value = 0.3;
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    
    this.oscillators[frequency] = { osc, gain };
  }
  
  noteOff(frequency) {
    const nodes = this.oscillators[frequency];
    if (!nodes) return;
    
    const now = audioCtx.currentTime;
    nodes.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    nodes.osc.stop(now + 0.1);
    
    delete this.oscillators[frequency];
  }
}

// Usage with keyboard
const synth = new Synth();
const keyMap = {
  'a': 261.63, // C
  's': 293.66, // D
  'd': 329.63, // E
  'f': 349.23, // F
  'g': 392.00, // G
  'h': 440.00, // A
  'j': 493.88, // B
  'k': 523.25  // C
};

document.addEventListener('keydown', (e) => {
  const freq = keyMap[e.key];
  if (freq) synth.noteOn(freq);
});

document.addEventListener('keyup', (e) => {
  const freq = keyMap[e.key];
  if (freq) synth.noteOff(freq);
});

// Example 3: Audio Visualizer
class AudioVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.analyser = audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
  }
  
  connect(source) {
    source.connect(this.analyser);
    this.analyser.connect(audioCtx.destination);
  }
  
  drawWaveform() {
    const draw = () => {
      requestAnimationFrame(draw);
      
      this.analyser.getByteTimeDomainData(this.dataArray);
      
      this.ctx.fillStyle = 'rgb(200, 200, 200)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = 'rgb(0, 0, 0)';
      this.ctx.beginPath();
      
      const sliceWidth = this.canvas.width / this.bufferLength;
      let x = 0;
      
      for (let i = 0; i < this.bufferLength; i++) {
        const v = this.dataArray[i] / 128.0;
        const y = v * this.canvas.height / 2;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
      this.ctx.stroke();
    };
    draw();
  }
  
  drawFrequency() {
    const draw = () => {
      requestAnimationFrame(draw);
      
      this.analyser.getByteFrequencyData(this.dataArray);
      
      this.ctx.fillStyle = 'rgb(0, 0, 0)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < this.bufferLength; i++) {
        const barHeight = this.dataArray[i] / 255 * this.canvas.height;
        
        const hue = i / this.bufferLength * 360;
        this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    draw();
  }
}

// Usage
const audio = new Audio('song.mp3');
const source = audioCtx.createMediaElementSource(audio);
const visualizer = new AudioVisualizer('canvas');
visualizer.connect(source);
visualizer.drawFrequency();
audio.play();

// Example 4: Sound Effects
class SoundEffects {
  static beep(frequency = 800, duration = 0.1) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.frequency.value = frequency;
    gain.gain.value = 0.1;
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    osc.stop(now + duration);
  }
  
  static explosion() {
    const duration = 0.5;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    
    const now = audioCtx.currentTime;
    
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + duration);
    
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + duration);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + duration);
  }
  
  static coin() {
    const frequencies = [988, 1319];
    const duration = 0.1;
    
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.frequency.value = freq;
        gain.gain.value = 0.2;
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;
        osc.start(now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        osc.stop(now + duration);
      }, i * 100);
    });
  }
}

// Usage
SoundEffects.beep();
SoundEffects.explosion();
SoundEffects.coin();
```

---

## 7. History API

The **History API** allows manipulation of the browser session history.

### Basic History Navigation

```javascript
// Go back
window.history.back();

// Go forward
window.history.forward();

// Go to specific point in history
window.history.go(-1);  // Back 1 page
window.history.go(2);   // Forward 2 pages
window.history.go(0);   // Reload current page

// Get number of entries
console.log(window.history.length);
```

### State Management

```javascript
// Add new history entry
history.pushState(state, title, url);

// Example:
history.pushState(
  { page: 1, data: 'some data' },  // State object
  'Page 1',                         // Title (usually ignored)
  '/page1'                          // URL
);

// Replace current history entry
history.replaceState(
  { page: 1, updated: true },
  'Page 1 Updated',
  '/page1-updated'
);

// Get current state
console.log(history.state);
```

### PopState Event

```javascript
// Listen for back/forward navigation
window.addEventListener('popstate', (event) => {
  console.log('State:', event.state);
  console.log('URL:', location.pathname);
  
  // Handle state change
  if (event.state) {
    loadPage(event.state);
  }
});
```

### Practical History API Examples

```javascript
// Example 1: Single Page Application (SPA) Router
class Router {
  constructor(routes) {
    this.routes = routes;
    this.init();
  }
  
  init() {
    // Handle navigation
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        this.navigateTo(href);
      }
    });
    
    // Handle back/forward
    window.addEventListener('popstate', () => {
      this.loadRoute(location.pathname);
    });
    
    // Load initial route
    this.loadRoute(location.pathname);
  }
  
  navigateTo(url) {
    history.pushState(null, null, url);
    this.loadRoute(url);
  }
  
  loadRoute(path) {
    const route = this.routes[path] || this.routes['/404'];
    if (route) {
      document.getElementById('app').innerHTML = route();
    }
  }
}

// Usage
const router = new Router({
  '/': () => '<h1>Home</h1><p>Welcome!</p>',
  '/about': () => '<h1>About</h1><p>About page</p>',
  '/contact': () => '<h1>Contact</h1><p>Contact page</p>',
  '/404': () => '<h1>404</h1><p>Page not found</p>'
});

// HTML:
// <a href="/" data-link>Home</a>
// <a href="/about" data-link>About</a>

// Example 2: Pagination with History
class PaginationWithHistory {
  constructor(items, itemsPerPage = 10) {
    this.items = items;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = this.getPageFromURL() || 1;
    this.init();
  }
  
  getPageFromURL() {
    const params = new URLSearchParams(location.search);
    return parseInt(params.get('page')) || 1;
  }
  
  init() {
    window.addEventListener('popstate', () => {
      this.currentPage = this.getPageFromURL();
      this.render();
    });
    
    this.render();
  }
  
  goToPage(page) {
    this.currentPage = page;
    history.pushState(
      { page },
      `Page ${page}`,
      `?page=${page}`
    );
    this.render();
  }
  
  render() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const pageItems = this.items.slice(start, end);
    
    console.log(`Page ${this.currentPage}:`, pageItems);
    // Render items to DOM
  }
}

// Example 3: Form Wizard with History
class FormWizard {
  constructor(steps) {
    this.steps = steps;
    this.currentStep = history.state?.step || 0;
    this.formData = history.state?.data || {};
    this.init();
  }
  
  init() {
    window.addEventListener('popstate', (e) => {
      if (e.state) {
        this.currentStep = e.state.step;
        this.formData = e.state.data;
        this.render();
      }
    });
    
    // Save initial state
    if (!history.state) {
      history.replaceState(
        { step: this.currentStep, data: this.formData },
        '',
        location.href
      );
    }
    
    this.render();
  }
  
  next(data) {
    this.formData = { ...this.formData, ...data };
    this.currentStep++;
    
    history.pushState(
      { step: this.currentStep, data: this.formData },
      `Step ${this.currentStep + 1}`,
      `?step=${this.currentStep + 1}`
    );
    
    this.render();
  }
  
  prev() {
    history.back();
  }
  
  render() {
    const step = this.steps[this.currentStep];
    console.log(`Current Step: ${this.currentStep + 1}/${this.steps.length}`);
    console.log('Form Data:', this.formData);
    // Render step to DOM
  }
}

// Usage
const wizard = new FormWizard([
  { title: 'Personal Info', fields: ['name', 'email'] },
  { title: 'Address', fields: ['street', 'city'] },
  { title: 'Payment', fields: ['card'] }
]);

// Example 4: Modal with History
function openModalWithHistory(modalId, modalData) {
  // Save current state if not already saved
  if (!history.state?.modal) {
    history.replaceState(
      { modal: null },
      '',
      location.href
    );
  }
  
  // Add modal state
  history.pushState(
    { modal: modalId, data: modalData },
    'Modal',
    `#${modalId}`
  );
  
  showModal(modalId, modalData);
}

function closeModal() {
  history.back();
}

window.addEventListener('popstate', (e) => {
  if (e.state?.modal) {
    showModal(e.state.modal, e.state.data);
  } else {
    hideAllModals();
  }
});

// Usage
openModalWithHistory('user-modal', { userId: 123 });
```

---

## 8. Notification API

The **Notification API** allows web pages to display system notifications to the user.

### Basic Notifications

```javascript
// Check if supported
if ('Notification' in window) {
  console.log('Notifications are supported');
}

// Check permission status
console.log(Notification.permission);
// 'default' - user hasn't been asked yet
// 'granted' - user allowed notifications
// 'denied' - user blocked notifications

// Request permission
Notification.requestPermission().then(permission => {
  console.log('Permission:', permission);
  if (permission === 'granted') {
    // Can show notifications
  }
});

// Show notification
if (Notification.permission === 'granted') {
  new Notification('Hello!');
}
```

### Notification Options

```javascript
const options = {
  body: 'This is the notification body text',
  icon: '/icon.png',
  badge: '/badge.png',           // Small icon
  image: '/image.jpg',           // Large image
  tag: 'unique-id',              // Identifier (replaces old notification with same tag)
  data: { customData: 'value' }, // Custom data
  requireInteraction: false,     // Stay until closed
  silent: false,                 // No sound
  vibrate: [200, 100, 200],     // Vibration pattern (mobile)
  dir: 'auto',                   // Text direction: ltr, rtl, auto
  lang: 'en-US',                 // Language code
  timestamp: Date.now(),         // Timestamp
  actions: [                     // Action buttons (requires service worker)
    { action: 'yes', title: 'Yes', icon: '/yes.png' },
    { action: 'no', title: 'No', icon: '/no.png' }
  ]
};

const notification = new Notification('Title', options);
```

### Notification Events

```javascript
const notification = new Notification('Hello!', {
  body: 'This is a test',
  icon: '/icon.png'
});

// When notification is shown
notification.onshow = function() {
  console.log('Notification shown');
};

// When notification is clicked
notification.onclick = function(event) {
  console.log('Notification clicked');
  window.focus();
  notification.close();
};

// When notification is closed
notification.onclose = function() {
  console.log('Notification closed');
};

// When notification error occurs
notification.onerror = function() {
  console.error('Notification error');
};

// Manually close notification
setTimeout(() => {
  notification.close();
}, 5000);
```

### Practical Notification Examples

```javascript
// Example 1: Notification Manager
class NotificationManager {
  constructor() {
    this.permission = Notification.permission;
  }
  
  async requestPermission() {
    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }
    return this.permission === 'granted';
  }
  
  async show(title, options = {}) {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.log('Notification permission denied');
      return null;
    }
    
    const notification = new Notification(title, options);
    
    // Auto-close after duration
    if (options.duration) {
      setTimeout(() => notification.close(), options.duration);
    }
    
    return notification;
  }
  
  async showWithAction(title, message, onClick) {
    const notification = await this.show(title, {
      body: message,
      icon: '/icon.png'
    });
    
    if (notification) {
      notification.onclick = () => {
        onClick();
        notification.close();
      };
    }
  }
}

// Usage
const notificationManager = new NotificationManager();

notificationManager.show('Hello!', {
  body: 'This is a test notification',
  icon: '/icon.png',
  duration: 5000
});

notificationManager.showWithAction(
  'New Message',
  'You have a new message!',
  () => {
    window.focus();
    // Navigate to messages
  }
);

// Example 2: Notification for Web Application Events
class AppNotifications {
  static async newMessage(from, message) {
    const notification = new Notification(`New message from ${from}`, {
      body: message.substring(0, 100),
      icon: '/message-icon.png',
      tag: 'message',
      requireInteraction: true
    });
    
    notification.onclick = function() {
      window.focus();
      // Open chat
      openChat(from);
      this.close();
    };
  }
  
  static async taskComplete(taskName) {
    new Notification('Task Completed', {
      body: `${taskName} has been completed!`,
      icon: '/success-icon.png',
      tag: 'task-complete'
    });
  }
  
  static async error(errorMessage) {
    new Notification('Error', {
      body: errorMessage,
      icon: '/error-icon.png',
      tag: 'error',
      requireInteraction: true
    });
  }
  
  static async reminder(title, message, time) {
    const delay = time - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        const notification = new Notification(title, {
          body: message,
          icon: '/reminder-icon.png',
          vibrate: [200, 100, 200],
          requireInteraction: true
        });
        
        notification.onclick = function() {
          window.focus();
          this.close();
        };
      }, delay);
    }
  }
}

// Usage
AppNotifications.newMessage('John', 'Hey, how are you?');
AppNotifications.taskComplete('Data Export');
AppNotifications.error('Failed to save changes');
AppNotifications.reminder(
  'Meeting',
  'Team meeting in 5 minutes',
  Date.now() + 5 * 60 * 1000
);

// Example 3: Notification Queue
class NotificationQueue {
  constructor(maxConcurrent = 1) {
    this.queue = [];
    this.active = 0;
    this.maxConcurrent = maxConcurrent;
  }
  
  async add(title, options = {}) {
    return new Promise((resolve) => {
      this.queue.push({ title, options, resolve });
      this.process();
    });
  }
  
  async process() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    this.active++;
    const { title, options, resolve } = this.queue.shift();
    
    const notification = new Notification(title, options);
    
    const cleanup = () => {
      this.active--;
      resolve(notification);
      this.process(); // Process next
    };
    
    notification.onclose = cleanup;
    notification.onerror = cleanup;
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }
}

// Usage
const queue = new NotificationQueue(1);
queue.add('Notification 1', { body: 'First' });
queue.add('Notification 2', { body: 'Second' });
queue.add('Notification 3', { body: 'Third' });
```

---

**Continue to Part 2 for more Web APIs including:**
- File API
- Drag and Drop API
- Web Workers API
- Intersection Observer API
- Mutation Observer API
- Clipboard API
- Page Visibility API
- Battery Status API
- Vibration API
- Screen Orientation API
- Performance API

This document covers the most essential and commonly used Web APIs. Each API section includes practical examples and real-world use cases to help you understand how to implement them in your applications.
