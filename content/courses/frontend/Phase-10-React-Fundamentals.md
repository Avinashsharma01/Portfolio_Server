# Phase 10 — React Fundamentals

## Table of Contents

- [What is React?](#what-is-react)
- [Why React?](#why-react)
- [Creating a React Project](#creating-a-react-project)
- [JSX — JavaScript XML](#jsx--javascript-xml)
- [Components](#components)
- [Props — Passing Data Down](#props--passing-data-down)
- [Rendering Lists](#rendering-lists)
- [Conditional Rendering](#conditional-rendering)
- [Handling Events](#handling-events)
- [State with useState](#state-with-usestate)
- [Component Lifecycle with useEffect](#component-lifecycle-with-useeffect)
- [Thinking in React](#thinking-in-react)
- [Key Takeaways](#key-takeaways)

---

## What is React?

React is a **JavaScript library for building user interfaces**. It was created by Facebook (Meta) and is the **most popular frontend framework/library** in the world.

### The Core Idea

```
TRADITIONAL WEB:
├── HTML defines structure
├── CSS defines styles
├── JS directly manipulates the DOM
└── Everything is separate — hard to maintain

REACT:
├── Components combine structure + style + logic
├── Each component is a self-contained UI piece
├── React handles DOM updates for you
└── Declarative — you describe WHAT, React figures out HOW
```

### Imperative vs Declarative

```javascript
// IMPERATIVE (Vanilla JS): You tell the browser STEP BY STEP
const list = document.createElement("ul");
users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user.name;
    list.appendChild(li);
});
document.body.appendChild(list);

// DECLARATIVE (React): You describe WHAT the UI should look like
function UserList({ users }) {
    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    );
}
```

> **Declarative is easier to reason about.** You describe the end state, React figures out the DOM operations.

---

## Why React?

| Feature | What It Means |
|---------|--------------|
| **Component-based** | Build reusable, self-contained UI pieces |
| **Virtual DOM** | React calculates minimal DOM updates — fast rendering |
| **Declarative** | Describe what UI looks like, not how to update it |
| **Unidirectional data flow** | Data flows down (parent → child), making bugs easier to trace |
| **Massive ecosystem** | React Router, Redux, Next.js, thousands of libraries |
| **Job market** | Most in-demand frontend skill |

### React vs Other Frameworks

| Feature | React | Vue | Angular | Svelte |
|---------|-------|-----|---------|--------|
| **Type** | Library | Framework | Framework | Compiler |
| **Learning curve** | Medium | Low | High | Low |
| **Bundle size** | Medium | Small | Large | Tiny |
| **State management** | External (Redux, Zustand) | Built-in | Built-in | Built-in |
| **Language** | JSX | Templates + JS | TypeScript | Svelte syntax |
| **Company** | Meta | Independent | Google | Independent |

---

## Creating a React Project

```bash
# Create with Vite (RECOMMENDED)
npm create vite@latest my-react-app -- --template react

# Navigate and install
cd my-react-app
npm install
npm run dev
```

### Project Structure

```
my-react-app/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/         ← Images, fonts, etc.
│   ├── App.jsx         ← Root component
│   ├── App.css         ← Root component styles
│   ├── main.jsx        ← Entry point (renders App into DOM)
│   └── index.css       ← Global styles
├── index.html          ← Shell HTML (React mounts here)
├── package.json
└── vite.config.js
```

### main.jsx — The Entry Point

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My React App</title>
</head>
<body>
    <div id="root"></div>  <!-- React renders EVERYTHING inside this div -->
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

---

## JSX — JavaScript XML

JSX lets you write **HTML-like syntax inside JavaScript**. It's not HTML — it's syntactic sugar for `React.createElement()`.

### Basic JSX

```jsx
// JSX
const element = <h1>Hello, World!</h1>;

// What it compiles to:
const element = React.createElement("h1", null, "Hello, World!");
```

### JSX Rules

```jsx
// 1. Must return ONE root element (use <> fragment if needed)
// ❌ Two root elements
return (
    <h1>Title</h1>
    <p>Content</p>
);

// ✅ Wrapped in a fragment
return (
    <>
        <h1>Title</h1>
        <p>Content</p>
    </>
);

// 2. All tags must be closed
<img src="photo.jpg" />    // self-closing
<br />                      // self-closing
<div></div>                 // explicit close

// 3. className instead of class
<div className="container">...</div>

// 4. htmlFor instead of for
<label htmlFor="email">Email</label>

// 5. camelCase for HTML attributes
<button onClick={handleClick}>Click</button>  // not onclick
<input onChange={handleChange} />              // not onchange
<div tabIndex={0}>...</div>                    // not tabindex

// 6. style is an object, not a string
<div style={{ backgroundColor: "red", fontSize: "16px" }}>...</div>
```

### Expressions in JSX

```jsx
const name = "Alice";
const isLoggedIn = true;

return (
    <div>
        {/* Variables */}
        <h1>Hello, {name}!</h1>

        {/* Expressions */}
        <p>2 + 2 = {2 + 2}</p>

        {/* Function calls */}
        <p>Name: {name.toUpperCase()}</p>

        {/* Ternary */}
        <p>{isLoggedIn ? "Welcome back!" : "Please log in"}</p>

        {/* This is a JSX comment */}
    </div>
);
```

> **You can put any JavaScript expression inside `{}`** — but NOT statements (no `if`, `for`, `while` inside JSX).

---

## Components

Components are **reusable, self-contained pieces of UI**. Think of them as custom HTML elements.

### Function Components

```jsx
// Simple component
function Greeting() {
    return <h1>Hello, World!</h1>;
}

// Arrow function component
const Greeting = () => {
    return <h1>Hello, World!</h1>;
};

// Using a component
function App() {
    return (
        <div>
            <Greeting />
            <Greeting />
            <Greeting />
        </div>
    );
}
```

### Component Rules

```
1. Component names MUST start with CAPITAL letter
   ✅ <Greeting />    → React treats as component
   ❌ <greeting />    → React treats as HTML element

2. Components must return JSX (or null)
   ✅ return <div>Hello</div>;
   ✅ return null;  (renders nothing)

3. One component per file (recommended)
   Header.jsx → export default function Header() { }
   Footer.jsx → export default function Footer() { }
```

### Component Composition

```jsx
function Header() {
    return <header><h1>My Site</h1></header>;
}

function Sidebar() {
    return <aside><p>Sidebar content</p></aside>;
}

function MainContent() {
    return <main><p>Main content here</p></main>;
}

function Footer() {
    return <footer><p>© 2025</p></footer>;
}

// Compose them together
function App() {
    return (
        <div className="app">
            <Header />
            <div className="layout">
                <Sidebar />
                <MainContent />
            </div>
            <Footer />
        </div>
    );
}
```

---

## Props — Passing Data Down

Props are how you pass data from a **parent component to a child component**.

### Basic Props

```jsx
// Parent passes data via attributes
function App() {
    return (
        <div>
            <UserCard name="Alice" role="Developer" avatar="/alice.jpg" />
            <UserCard name="Bob" role="Designer" avatar="/bob.jpg" />
        </div>
    );
}

// Child receives data via props parameter
function UserCard({ name, role, avatar }) {
    return (
        <div className="user-card">
            <img src={avatar} alt={name} />
            <h2>{name}</h2>
            <p>{role}</p>
        </div>
    );
}
```

### Default Props

```jsx
function Button({ text = "Click Me", variant = "primary", size = "medium" }) {
    return (
        <button className={`btn btn-${variant} btn-${size}`}>
            {text}
        </button>
    );
}

// Usage
<Button />                          // Uses all defaults
<Button text="Submit" />            // Custom text, default variant/size
<Button variant="danger" />         // Custom variant
```

### Children Prop

```jsx
// children = whatever is between the opening and closing tags
function Card({ title, children }) {
    return (
        <div className="card">
            <h2>{title}</h2>
            <div className="card-body">
                {children}
            </div>
        </div>
    );
}

// Usage — anything between <Card>...</Card> becomes children
<Card title="Welcome">
    <p>This is the card content.</p>
    <button>Action</button>
</Card>
```

### Props Are Read-Only

```jsx
// ❌ NEVER modify props
function BadComponent({ name }) {
    name = "Modified";  // DON'T DO THIS
    return <h1>{name}</h1>;
}

// Props flow ONE way: parent → child
// If a child needs to communicate back → use callback props
```

---

## Rendering Lists

```jsx
const users = [
    { id: 1, name: "Alice", role: "Developer" },
    { id: 2, name: "Bob", role: "Designer" },
    { id: 3, name: "Charlie", role: "Manager" }
];

function UserList() {
    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>
                    {user.name} — {user.role}
                </li>
            ))}
        </ul>
    );
}
```

### The `key` Prop

```jsx
// ✅ Use unique, stable IDs from your data
{users.map(user => <UserCard key={user.id} user={user} />)}

// ❌ Don't use array index as key (causes bugs with reordering)
{users.map((user, index) => <UserCard key={index} user={user} />)}

// ❌ Don't use random values (forces re-render every time)
{users.map(user => <UserCard key={Math.random()} user={user} />)}
```

### Why Keys Matter

```
WITHOUT KEYS (or with index keys):
React can't tell which item changed
→ Re-renders ALL list items
→ Input state gets mixed up when items are reordered

WITH UNIQUE KEYS:
React knows exactly which item changed
→ Only re-renders the changed item
→ Component state stays with the correct item
```

---

## Conditional Rendering

### Ternary Operator

```jsx
function Dashboard({ isLoggedIn }) {
    return (
        <div>
            {isLoggedIn ? <UserDashboard /> : <LoginForm />}
        </div>
    );
}
```

### Logical AND (`&&`)

```jsx
function Notifications({ count }) {
    return (
        <div>
            <h1>Dashboard</h1>
            {count > 0 && <span className="badge">{count}</span>}
        </div>
    );
}
```

### ⚠️ Gotcha with `&&` and Numbers

```jsx
// ❌ If count is 0, React renders "0" (falsy but not null/undefined)
{count && <span>{count} notifications</span>}  // renders "0"

// ✅ Explicitly check
{count > 0 && <span>{count} notifications</span>}
```

### Early Return

```jsx
function UserProfile({ user }) {
    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
        </div>
    );
}
```

### Rendering Different Components

```jsx
function Alert({ type, message }) {
    const styles = {
        success: { background: "#d4edda", color: "#155724" },
        error: { background: "#f8d7da", color: "#721c24" },
        warning: { background: "#fff3cd", color: "#856404" }
    };

    return (
        <div style={styles[type]} className="alert">
            {message}
        </div>
    );
}
```

---

## Handling Events

### Basic Events

```jsx
function Button() {
    function handleClick() {
        console.log("Button clicked!");
    }

    return <button onClick={handleClick}>Click Me</button>;
}
```

### Passing Data to Event Handlers

```jsx
function TodoList({ todos }) {
    function handleDelete(todoId) {
        console.log("Delete todo:", todoId);
    }

    return (
        <ul>
            {todos.map(todo => (
                <li key={todo.id}>
                    {todo.text}
                    {/* Wrap in arrow function to pass arguments */}
                    <button onClick={() => handleDelete(todo.id)}>
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    );
}
```

### Event Object

```jsx
function Form() {
    function handleSubmit(event) {
        event.preventDefault();  // stop page reload
        console.log("Form submitted!");
    }

    function handleChange(event) {
        console.log("Input value:", event.target.value);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" onChange={handleChange} />
            <button type="submit">Submit</button>
        </form>
    );
}
```

### Callback Props (Child → Parent Communication)

```jsx
// Parent
function App() {
    function handleAddItem(item) {
        console.log("New item:", item);
    }

    return <AddItemForm onAddItem={handleAddItem} />;
}

// Child calls the callback prop
function AddItemForm({ onAddItem }) {
    function handleSubmit(e) {
        e.preventDefault();
        const item = e.target.elements.item.value;
        onAddItem(item);   // communicate back to parent
        e.target.reset();
    }

    return (
        <form onSubmit={handleSubmit}>
            <input name="item" placeholder="New item..." />
            <button type="submit">Add</button>
        </form>
    );
}
```

---

## State with useState

State is **data that changes over time** and causes the component to **re-render** when updated.

### Basic useState

```jsx
import { useState } from "react";

function Counter() {
    const [count, setCount] = useState(0);
    //     ↑       ↑              ↑
    //   value   setter     initial value

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(count - 1)}>Decrement</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
}
```

### Functional Updates (When New State Depends on Previous)

```jsx
// ❌ Can be stale if multiple updates happen quickly
setCount(count + 1);

// ✅ Functional update — always gets the latest value
setCount(prevCount => prevCount + 1);
```

### State with Objects

```jsx
const [user, setUser] = useState({ name: "Alice", age: 25 });

// ❌ NEVER mutate directly
user.name = "Bob";  // React won't re-render!

// ✅ Create a new object (spread + override)
setUser({ ...user, name: "Bob" });
setUser(prev => ({ ...prev, name: "Bob" }));
```

### State with Arrays

```jsx
const [todos, setTodos] = useState([
    { id: 1, text: "Learn React", done: false }
]);

// Add item
setTodos([...todos, { id: Date.now(), text: "New Todo", done: false }]);

// Remove item
setTodos(todos.filter(todo => todo.id !== idToRemove));

// Update item
setTodos(todos.map(todo =>
    todo.id === idToUpdate ? { ...todo, done: !todo.done } : todo
));
```

### Multiple State Variables

```jsx
function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await loginUser({ email, password });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <p className="error">{error}</p>}
            <input value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
            </button>
        </form>
    );
}
```

---

## Component Lifecycle with useEffect

`useEffect` lets you run **side effects** — things that happen outside of rendering (API calls, subscriptions, timers, DOM manipulation).

### Basic useEffect

```jsx
import { useState, useEffect } from "react";

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            const response = await fetch(`/api/users/${userId}`);
            const data = await response.json();
            setUser(data);
            setLoading(false);
        }

        fetchUser();
    }, [userId]);  // re-run when userId changes

    if (loading) return <p>Loading...</p>;
    if (!user) return <p>User not found</p>;

    return (
        <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
        </div>
    );
}
```

### Dependency Array

```jsx
// Runs ONCE on mount (empty array)
useEffect(() => {
    console.log("Component mounted");
}, []);

// Runs when count changes
useEffect(() => {
    document.title = `Count: ${count}`;
}, [count]);

// Runs on EVERY render (no array — avoid this usually)
useEffect(() => {
    console.log("Every render");
});
```

### Cleanup Function

```jsx
// Cleanup runs before effect re-runs AND on unmount
useEffect(() => {
    const handleResize = () => {
        setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup: remove the event listener
    return () => {
        window.removeEventListener("resize", handleResize);
    };
}, []);

// Timer cleanup
useEffect(() => {
    const interval = setInterval(() => {
        setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
}, []);
```

### Common useEffect Patterns

```
useEffect(() => { ... }, []);         Mount: fetch initial data
useEffect(() => { ... }, [id]);       Update: re-fetch when ID changes
useEffect(() => { return () => {}; }, []);  Cleanup: remove listeners, cancel timers
```

---

## Thinking in React

React development follows a mental model:

```
1. BREAK THE UI INTO COMPONENTS
   ┌─────────────────────────────────┐
   │ App                             │
   │  ├── Header                     │
   │  ├── SearchBar                  │
   │  ├── ProductList                │
   │  │    ├── ProductCard           │
   │  │    ├── ProductCard           │
   │  │    └── ProductCard           │
   │  └── Footer                     │
   └─────────────────────────────────┘

2. IDENTIFY THE STATE
   What data changes?
   ├── searchQuery (what user typed)
   ├── products (from API)
   ├── isLoading (fetching?)
   └── filter (category selection)

3. WHERE SHOULD STATE LIVE?
   State goes in the LOWEST common ancestor
   ├── searchQuery → SearchBar (only used there)
   ├── products → App (shared by SearchBar filter + ProductList)
   └── isLoading → App (affects multiple components)

4. DATA FLOWS DOWN, EVENTS FLOW UP
   App passes products → ProductList → ProductCard (props)
   ProductCard fires onAddToCart → App updates cart (callback)
```

### The Component Hierarchy

```jsx
function App() {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <SearchBar query={searchQuery} onSearch={setSearchQuery} />
            <ProductList products={filteredProducts} />
        </div>
    );
}

function SearchBar({ query, onSearch }) {
    return (
        <input
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search products..."
        />
    );
}

function ProductList({ products }) {
    return (
        <div className="grid">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}

function ProductCard({ product }) {
    return (
        <div className="card">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
        </div>
    );
}
```

---

## Key Takeaways

1. **React is declarative** — describe what the UI looks like, React handles DOM updates
2. **Components are reusable UI pieces** — one component per file, name starts with capital letter
3. **JSX is not HTML** — use `className`, `htmlFor`, camelCase events, close all tags
4. **Props pass data down** (parent → child) — they are read-only
5. **State (`useState`) is data that changes** — updating state triggers re-render
6. **Always create new objects/arrays** when updating state — never mutate directly
7. **`useEffect` handles side effects** — API calls, subscriptions, timers
8. **Always include a cleanup function** in useEffect when adding listeners/timers
9. **Keys in lists must be unique and stable** — use IDs from data, not array index
10. **Think in React** — break UI into components, identify state, determine where state lives

---

## Practice Exercises

1. **Build a counter** with increment, decrement, and reset buttons using useState
2. **Create a todo app** — add, toggle complete, and delete items
3. **Build a user search** — fetch users from `https://jsonplaceholder.typicode.com/users` and filter by name
4. **Create a tabbed interface** — switch between Tab 1, Tab 2, Tab 3 content
5. **Build a timer/stopwatch** — start, stop, reset using useEffect and setInterval

---

**Previous:** [← Phase 09 — Build Tools & Module Bundlers](Phase-09-Build-Tools-Module-Bundlers.md)
**Next:** [Phase 11 — React State Management & Hooks →](Phase-11-React-State-Hooks.md)
