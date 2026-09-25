# Phase 04 — JavaScript & The DOM

## Table of Contents

- [JavaScript in the Browser](#javascript-in-the-browser)
- [Selecting DOM Elements](#selecting-dom-elements)
- [Modifying Elements](#modifying-elements)
- [Creating & Removing Elements](#creating--removing-elements)
- [Event Handling](#event-handling)
- [Event Propagation — Bubbling & Capturing](#event-propagation--bubbling--capturing)
- [Event Delegation](#event-delegation)
- [DOM Traversal](#dom-traversal)
- [Working with Classes & Styles](#working-with-classes--styles)
- [Forms & User Input](#forms--user-input)
- [Timers & Intervals](#timers--intervals)
- [Scroll & Intersection Observer](#scroll--intersection-observer)
- [Key Takeaways](#key-takeaways)

---

## JavaScript in the Browser

JavaScript in the browser has access to things that JavaScript on a server (Node.js) doesn't:

```
BROWSER JAVASCRIPT:                 NODE.JS JAVASCRIPT:
├── document (DOM)                  ├── fs (file system)
├── window (global object)         ├── http (create servers)
├── navigator (browser info)       ├── process (system info)
├── localStorage / sessionStorage  ├── require / module
├── fetch (HTTP requests)          ├── Buffer
├── alert / confirm / prompt       ├── __dirname / __filename
└── addEventListener (events)      └── npm packages
```

### Where to Put Your JavaScript

```html
<!-- ❌ In the <head> — blocks HTML parsing -->
<head>
    <script src="app.js"></script>
</head>

<!-- ✅ At the end of <body> — HTML is already parsed -->
<body>
    <!-- all your HTML -->
    <script src="app.js"></script>
</body>

<!-- ✅ BEST: defer in <head> — downloads in parallel, runs after parsing -->
<head>
    <script src="app.js" defer></script>
</head>
```

### The `window` Object

`window` is the **global object** in the browser. Everything lives on it:

```javascript
// These are the same
window.document === document       // true
window.alert === alert             // true
window.console === console         // true
window.location === location       // true

// Useful window properties
window.innerWidth     // viewport width
window.innerHeight    // viewport height
window.scrollY        // current scroll position
window.location.href  // current URL
window.navigator.userAgent  // browser info
```

---

## Selecting DOM Elements

### Modern Selectors (USE THESE)

```javascript
// Select ONE element (first match)
const title = document.querySelector("h1");
const intro = document.querySelector(".intro");
const header = document.querySelector("#header");
const emailInput = document.querySelector('input[type="email"]');

// Select ALL matching elements (returns NodeList)
const paragraphs = document.querySelectorAll("p");
const buttons = document.querySelectorAll(".btn");
const listItems = document.querySelectorAll("ul > li");

// Loop through NodeList
paragraphs.forEach(p => {
    console.log(p.textContent);
});
```

### Legacy Selectors (Know Them, Prefer Modern)

```javascript
// By ID (fastest, but querySelector is fine)
const header = document.getElementById("header");

// By class name (returns HTMLCollection, NOT NodeList)
const items = document.getElementsByClassName("item");

// By tag name
const divs = document.getElementsByTagName("div");
```

### NodeList vs HTMLCollection

| Feature | NodeList | HTMLCollection |
|---------|----------|---------------|
| **From** | `querySelectorAll` | `getElementsBy*` |
| **forEach** | ✅ Yes | ❌ No |
| **Live updates** | ❌ No (static snapshot) | ✅ Yes (reflects DOM changes) |
| **Convert to array** | `[...nodeList]` | `[...htmlCollection]` |

> **Always use `querySelector` and `querySelectorAll`.** They're powerful, consistent, and use CSS selector syntax.

---

## Modifying Elements

### Text Content

```javascript
const heading = document.querySelector("h1");

// Get text (no HTML tags)
console.log(heading.textContent);    // "Hello World"

// Set text (safe — doesn't parse HTML)
heading.textContent = "New Title";

// innerHTML — parses HTML (DANGEROUS with user input!)
heading.innerHTML = "<em>New</em> Title";
```

### ⚠️ innerHTML Security Warning

```javascript
// ❌ NEVER do this with user input — XSS attack vector
const userInput = '<img src=x onerror="alert(document.cookie)">';
element.innerHTML = userInput;   // EXECUTES the malicious script!

// ✅ Use textContent for user-provided data
element.textContent = userInput; // Displays as plain text, safe
```

### Attributes

```javascript
const link = document.querySelector("a");

// Get attribute
link.getAttribute("href");          // "https://example.com"

// Set attribute
link.setAttribute("href", "https://new-url.com");
link.setAttribute("target", "_blank");

// Remove attribute
link.removeAttribute("target");

// Check if attribute exists
link.hasAttribute("target");        // false

// Direct properties (some attributes have direct access)
link.href;                          // full URL
link.id;                            // id attribute
link.className;                     // class attribute (string)
```

### Data Attributes

```html
<div id="user" data-user-id="42" data-role="admin"></div>
```

```javascript
const user = document.querySelector("#user");

// Read data attributes
user.dataset.userId;    // "42"
user.dataset.role;      // "admin"

// Set data attributes
user.dataset.status = "active";
// Now: <div data-user-id="42" data-role="admin" data-status="active">
```

---

## Creating & Removing Elements

### Creating Elements

```javascript
// Create an element
const card = document.createElement("div");
card.className = "card";
card.textContent = "New Card";

// Add to the page
document.body.appendChild(card);                    // at the end
document.body.prepend(card);                        // at the beginning
document.body.insertBefore(card, referenceElement); // before specific element

// Modern insertion methods
const container = document.querySelector(".container");
container.append(card);                  // at end (can take strings too)
container.prepend(card);                 // at beginning
container.before(card);                  // before container itself
container.after(card);                   // after container itself

// Insert at specific position
container.insertAdjacentHTML("beforeend", '<div class="card">HTML string</div>');
// Positions: "beforebegin" | "afterbegin" | "beforeend" | "afterend"
```

### Removing Elements

```javascript
// Modern way
const element = document.querySelector(".old-element");
element.remove();

// Legacy way (remove child from parent)
const parent = document.querySelector(".parent");
const child = document.querySelector(".child");
parent.removeChild(child);
```

### Cloning Elements

```javascript
const original = document.querySelector(".card");

// Shallow clone (element only, no children)
const shallowClone = original.cloneNode(false);

// Deep clone (element + all children)
const deepClone = original.cloneNode(true);

document.body.appendChild(deepClone);
```

### Building a List Dynamically

```javascript
const fruits = ["Apple", "Banana", "Cherry", "Date"];

const ul = document.createElement("ul");

fruits.forEach(fruit => {
    const li = document.createElement("li");
    li.textContent = fruit;
    ul.appendChild(li);
});

document.body.appendChild(ul);
```

### Performance: Document Fragment

When adding many elements, use a **DocumentFragment** to avoid multiple reflows:

```javascript
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
    const li = document.createElement("li");
    li.textContent = `Item ${i + 1}`;
    fragment.appendChild(li);  // no reflow yet
}

document.querySelector("ul").appendChild(fragment);  // ONE reflow
```

---

## Event Handling

### Adding Event Listeners

```javascript
const button = document.querySelector(".btn");

// addEventListener (PREFERRED — can add multiple listeners)
button.addEventListener("click", function(event) {
    console.log("Button clicked!");
    console.log(event.target);        // the element that was clicked
    console.log(event.type);          // "click"
});

// Arrow function
button.addEventListener("click", (e) => {
    console.log("Clicked!", e);
});

// Named function (can be removed later)
function handleClick(e) {
    console.log("Clicked!");
}
button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick);
```

### Common Events

| Event | Fires When |
|-------|-----------|
| `click` | Element is clicked |
| `dblclick` | Element is double-clicked |
| `mouseenter` / `mouseleave` | Mouse enters/leaves element |
| `mousemove` | Mouse moves over element |
| `keydown` / `keyup` | Key is pressed/released |
| `keypress` | Key produces a character (deprecated) |
| `input` | Input value changes (real-time) |
| `change` | Input value changes (on blur) |
| `submit` | Form is submitted |
| `focus` / `blur` | Element gains/loses focus |
| `scroll` | Element is scrolled |
| `resize` | Window is resized |
| `load` | Page/resource finishes loading |
| `DOMContentLoaded` | HTML is parsed (before images load) |

### The Event Object

```javascript
document.addEventListener("click", (event) => {
    // Target info
    event.target;           // element that triggered the event
    event.currentTarget;    // element the listener is on
    event.type;             // "click"

    // Mouse info
    event.clientX;          // X position in viewport
    event.clientY;          // Y position in viewport
    event.pageX;            // X position in page (including scroll)
    event.pageY;            // Y position in page

    // Keyboard info (for keydown/keyup)
    event.key;              // "Enter", "a", "Escape"
    event.code;             // "KeyA", "Enter", "Space"
    event.ctrlKey;          // true if Ctrl was held
    event.shiftKey;         // true if Shift was held

    // Control
    event.preventDefault();  // stop default behavior (form submit, link navigation)
    event.stopPropagation(); // stop event from bubbling up
});
```

---

## Event Propagation — Bubbling & Capturing

When you click an element, the event travels through the DOM in three phases:

```
Phase 1: CAPTURING (top → down)
┌──────────────────────────────┐
│ document                     │
│  ┌────────────────────────┐  │  ← event travels DOWN
│  │ <html>                 │  │
│  │  ┌──────────────────┐  │  │
│  │  │ <body>           │  │  │
│  │  │  ┌────────────┐  │  │  │
│  │  │  │ <div>      │  │  │  │
│  │  │  │  ┌──────┐  │  │  │  │
│  │  │  │  │ <btn>│  │  │  │  │  ← TARGET (Phase 2)
│  │  │  │  └──────┘  │  │  │  │
│  │  │  └────────────┘  │  │  │
│  │  └──────────────────┘  │  │  ← event travels UP
│  └────────────────────────┘  │
└──────────────────────────────┘
Phase 3: BUBBLING (bottom → up)
```

### Example

```html
<div class="outer">
    <div class="inner">
        <button>Click Me</button>
    </div>
</div>
```

```javascript
document.querySelector(".outer").addEventListener("click", () => {
    console.log("Outer clicked");
});

document.querySelector(".inner").addEventListener("click", () => {
    console.log("Inner clicked");
});

document.querySelector("button").addEventListener("click", () => {
    console.log("Button clicked");
});

// Click the button → Output:
// "Button clicked"   (target)
// "Inner clicked"    (bubbles up)
// "Outer clicked"    (bubbles up)
```

### Stopping Propagation

```javascript
document.querySelector("button").addEventListener("click", (e) => {
    e.stopPropagation();  // event stops here — doesn't bubble up
    console.log("Button clicked — event stopped");
});
```

---

## Event Delegation

Instead of adding event listeners to every child element, add **one listener to the parent** and check which child was clicked.

```javascript
// ❌ BAD — one listener per button (100 buttons = 100 listeners)
document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", handleClick);
});

// ✅ GOOD — one listener on the parent
document.querySelector(".button-container").addEventListener("click", (e) => {
    if (e.target.matches(".btn")) {
        handleClick(e);
    }
});
```

### Why Event Delegation?

1. **Performance** — fewer event listeners = less memory
2. **Dynamic elements** — works for elements added AFTER the listener was created
3. **Cleaner code** — one listener instead of many

### Real-World Example: Todo List

```javascript
const todoList = document.querySelector("#todo-list");

// Works for existing AND future list items
todoList.addEventListener("click", (e) => {
    // Delete button clicked
    if (e.target.matches(".delete-btn")) {
        e.target.closest("li").remove();
    }

    // Checkbox clicked
    if (e.target.matches('input[type="checkbox"]')) {
        e.target.closest("li").classList.toggle("completed");
    }
});
```

---

## DOM Traversal

Navigate between DOM nodes:

```javascript
const item = document.querySelector(".item");

// Parent
item.parentElement;
item.closest(".container");    // nearest ancestor matching selector

// Children
item.children;                 // HTMLCollection of child elements
item.firstElementChild;
item.lastElementChild;
item.childElementCount;

// Siblings
item.nextElementSibling;
item.previousElementSibling;
```

### `closest()` — Most Useful Traversal Method

```javascript
// Find the nearest ancestor (or self) that matches
const button = document.querySelector(".delete-btn");
const card = button.closest(".card");    // walks UP the tree
const section = button.closest("section");
```

---

## Working with Classes & Styles

### classList API

```javascript
const element = document.querySelector(".box");

// Add classes
element.classList.add("active");
element.classList.add("primary", "large");

// Remove classes
element.classList.remove("active");

// Toggle (add if missing, remove if present)
element.classList.toggle("active");

// Toggle with condition
element.classList.toggle("active", isActive);  // add if true, remove if false

// Check if class exists
element.classList.contains("active");  // true or false

// Replace a class
element.classList.replace("old-class", "new-class");
```

### Inline Styles

```javascript
// Set styles
element.style.backgroundColor = "red";
element.style.fontSize = "1.5rem";
element.style.display = "none";

// Get computed styles (what's actually rendered)
const styles = getComputedStyle(element);
console.log(styles.fontSize);      // "16px"
console.log(styles.color);         // "rgb(51, 51, 51)"
```

> **Prefer `classList` over `style`.** Define classes in CSS, toggle them with JavaScript.

---

## Forms & User Input

### Handling Form Submission

```javascript
const form = document.querySelector("#login-form");

form.addEventListener("submit", (e) => {
    e.preventDefault();  // stop page reload

    // Get form data
    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");

    console.log({ email, password });

    // Or access inputs directly
    const emailInput = form.querySelector("#email");
    console.log(emailInput.value);
});
```

### Real-Time Input Validation

```javascript
const emailInput = document.querySelector("#email");

// 'input' fires on every keystroke
emailInput.addEventListener("input", (e) => {
    const value = e.target.value;
    const errorMsg = document.querySelector(".email-error");

    if (!value.includes("@")) {
        errorMsg.textContent = "Please enter a valid email";
        emailInput.classList.add("invalid");
    } else {
        errorMsg.textContent = "";
        emailInput.classList.remove("invalid");
    }
});
```

### Keyboard Events

```javascript
document.addEventListener("keydown", (e) => {
    // ESC to close modal
    if (e.key === "Escape") {
        closeModal();
    }

    // Ctrl+S to save
    if (e.ctrlKey && e.key === "s") {
        e.preventDefault();  // stop browser's save dialog
        saveDocument();
    }

    // Arrow key navigation
    if (e.key === "ArrowDown") {
        navigateDown();
    }
});
```

---

## Timers & Intervals

### setTimeout — Run Once After Delay

```javascript
// Run once after 2 seconds
const timerId = setTimeout(() => {
    console.log("This runs after 2 seconds");
}, 2000);

// Cancel before it runs
clearTimeout(timerId);
```

### setInterval — Run Repeatedly

```javascript
// Run every second
let count = 0;
const intervalId = setInterval(() => {
    count++;
    console.log(`Count: ${count}`);

    if (count >= 10) {
        clearInterval(intervalId);  // stop when count reaches 10
    }
}, 1000);
```

### Debounce — Wait Until User Stops

```javascript
function debounce(fn, delay) {
    let timerId;
    return function(...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Search as user types (but wait 300ms after they stop)
const searchInput = document.querySelector("#search");
searchInput.addEventListener("input", debounce((e) => {
    fetchSearchResults(e.target.value);
}, 300));
```

### Throttle — Run At Most Once Per Interval

```javascript
function throttle(fn, interval) {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= interval) {
            lastTime = now;
            fn.apply(this, args);
        }
    };
}

// Track scroll position (at most every 100ms)
window.addEventListener("scroll", throttle(() => {
    console.log("Scroll position:", window.scrollY);
}, 100));
```

---

## Scroll & Intersection Observer

### Scroll Events

```javascript
// Detect when user scrolls near bottom
window.addEventListener("scroll", () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= documentHeight - 100) {
        loadMoreContent();  // infinite scroll
    }
});

// Smooth scroll to a section
document.querySelector("#section-2").scrollIntoView({
    behavior: "smooth",
    block: "start"
});
```

### Intersection Observer — Better Than Scroll Events

```javascript
// Detect when elements enter/leave the viewport
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Optional: stop observing after first intersection
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,   // trigger when 10% visible
    rootMargin: "0px"  // offset from viewport edge
});

// Observe elements
document.querySelectorAll(".animate-on-scroll").forEach(el => {
    observer.observe(el);
});
```

### Lazy Loading Images

```javascript
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;  // load the real image
            img.classList.add("loaded");
            imageObserver.unobserve(img);
        }
    });
});

document.querySelectorAll("img[data-src]").forEach(img => {
    imageObserver.observe(img);
});
```

```html
<!-- HTML: Use data-src instead of src -->
<img data-src="large-photo.jpg" alt="Lazy loaded photo" src="placeholder.jpg">
```

> **Modern alternative:** Use `<img loading="lazy">` — native browser lazy loading. No JS needed.

---

## Key Takeaways

1. **Use `querySelector` and `querySelectorAll`** — they use CSS selectors and are the modern standard
2. **Use `textContent` over `innerHTML`** — it's safer against XSS attacks
3. **Always use `addEventListener`** — not inline `onclick` attributes
4. **Events bubble up** — click on a child triggers listeners on all ancestors
5. **Event delegation is powerful** — one parent listener handles all children
6. **Use `closest()` for traversal** — it finds the nearest ancestor matching a selector
7. **Prefer `classList` over `style`** — keep styling in CSS, toggle classes with JS
8. **`preventDefault()`** stops default behavior (form submit, link navigation)
9. **Debounce input events, throttle scroll events** — essential for performance
10. **Intersection Observer** replaces most scroll-based detection — more performant and cleaner

---

## Practice Exercises

1. **Build an interactive todo list** — add items, mark complete, delete items using event delegation
2. **Create a modal** — open/close with buttons, close with ESC key and clicking outside
3. **Build an image gallery** with lazy loading using Intersection Observer
4. **Create a live search filter** — filter a list of items as the user types (with debounce)
5. **Build a dark mode toggle** — switch classes on `<body>` and persist the choice in `localStorage`

---

**Previous:** [← Phase 03 — CSS Fundamentals](Phase-03-CSS-Fundamentals.md)
**Next:** [Phase 05 — Responsive Design & Layouts →](Phase-05-Responsive-Design-Layouts.md)
