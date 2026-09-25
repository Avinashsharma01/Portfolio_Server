# Phase 11 — React State Management & Hooks

## Table of Contents

- [React Hooks Overview](#react-hooks-overview)
- [useState — In Depth](#usestate--in-depth)
- [useReducer — Complex State Logic](#usereducer--complex-state-logic)
- [useRef — Persistent References](#useref--persistent-references)
- [useMemo — Expensive Calculations](#usememo--expensive-calculations)
- [useCallback — Stable Function References](#usecallback--stable-function-references)
- [useContext — Sharing State Globally](#usecontext--sharing-state-globally)
- [Custom Hooks — Reusable Logic](#custom-hooks--reusable-logic)
- [State Management Patterns](#state-management-patterns)
- [Rules of Hooks](#rules-of-hooks)
- [Key Takeaways](#key-takeaways)

---

## React Hooks Overview

Hooks were introduced in React 16.8. They let you use state and other React features in function components.

```
HOOKS YOU'LL USE MOST:
├── useState      → Simple state (counters, toggles, form inputs)
├── useEffect     → Side effects (API calls, subscriptions) [Phase 10]
├── useRef        → DOM access, persistent values without re-render
├── useContext    → Share state without prop drilling
├── useReducer   → Complex state with actions
├── useMemo      → Cache expensive calculations
├── useCallback  → Cache function references
└── Custom Hooks → Reuse stateful logic across components
```

---

## useState — In Depth

### Lazy Initialization

```jsx
// ❌ This runs EVERY render — wasteful if expensive
const [todos, setTodos] = useState(JSON.parse(localStorage.getItem("todos")) || []);

// ✅ Pass a function — only runs on FIRST render
const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
});
```

### Batched Updates

```jsx
function handleClick() {
    // React 18+ batches ALL state updates (even in async code)
    setCount(c => c + 1);
    setFlag(f => !f);
    setName("Alice");
    // React does ONE re-render for all three, not three re-renders
}
```

### Derived State (Don't Put Everything in State)

```jsx
// ❌ Storing calculated data in state
const [items, setItems] = useState([...]);
const [filteredItems, setFilteredItems] = useState([...]);  // REDUNDANT

// ✅ Derive it during render
const [items, setItems] = useState([...]);
const [filter, setFilter] = useState("");

// This recalculates every render — usually fine
const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
);
```

> **Rule: If you can calculate it from existing state or props, don't put it in state.**

---

## useReducer — Complex State Logic

When state logic is complex — multiple related values, or the next state depends on the previous state — `useReducer` is cleaner than multiple `useState` calls.

### Syntax

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

### Todo Example

```jsx
import { useReducer } from "react";

const initialState = {
    todos: [],
    filter: "all"  // "all" | "active" | "completed"
};

function todoReducer(state, action) {
    switch (action.type) {
        case "ADD_TODO":
            return {
                ...state,
                todos: [
                    ...state.todos,
                    { id: Date.now(), text: action.payload, completed: false }
                ]
            };

        case "TOGGLE_TODO":
            return {
                ...state,
                todos: state.todos.map(todo =>
                    todo.id === action.payload
                        ? { ...todo, completed: !todo.completed }
                        : todo
                )
            };

        case "DELETE_TODO":
            return {
                ...state,
                todos: state.todos.filter(todo => todo.id !== action.payload)
            };

        case "SET_FILTER":
            return { ...state, filter: action.payload };

        default:
            return state;
    }
}

function TodoApp() {
    const [state, dispatch] = useReducer(todoReducer, initialState);

    const filteredTodos = state.todos.filter(todo => {
        if (state.filter === "active") return !todo.completed;
        if (state.filter === "completed") return todo.completed;
        return true;
    });

    function handleAdd(e) {
        e.preventDefault();
        const text = e.target.elements.todo.value.trim();
        if (text) {
            dispatch({ type: "ADD_TODO", payload: text });
            e.target.reset();
        }
    }

    return (
        <div>
            <form onSubmit={handleAdd}>
                <input name="todo" placeholder="What needs to be done?" />
                <button type="submit">Add</button>
            </form>

            <div>
                {["all", "active", "completed"].map(f => (
                    <button key={f} onClick={() => dispatch({ type: "SET_FILTER", payload: f })}>
                        {f}
                    </button>
                ))}
            </div>

            <ul>
                {filteredTodos.map(todo => (
                    <li key={todo.id}>
                        <span
                            onClick={() => dispatch({ type: "TOGGLE_TODO", payload: todo.id })}
                            style={{ textDecoration: todo.completed ? "line-through" : "none" }}
                        >
                            {todo.text}
                        </span>
                        <button onClick={() => dispatch({ type: "DELETE_TODO", payload: todo.id })}>
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

### useState vs useReducer

| Scenario | Use |
|----------|-----|
| Simple toggle, counter, form input | `useState` |
| Multiple related state values | `useReducer` |
| Next state depends on previous state | `useReducer` |
| Complex update logic | `useReducer` |
| State shared across many handlers | `useReducer` |

---

## useRef — Persistent References

`useRef` gives you a **mutable reference that persists across renders** without causing re-renders when changed.

### Two Main Uses

#### 1. Accessing DOM Elements

```jsx
import { useRef } from "react";

function SearchBar() {
    const inputRef = useRef(null);

    function handleFocus() {
        inputRef.current.focus();  // directly access the DOM element
    }

    return (
        <div>
            <input ref={inputRef} placeholder="Search..." />
            <button onClick={handleFocus}>Focus Input</button>
        </div>
    );
}
```

#### 2. Storing Values Without Re-rendering

```jsx
function StopWatch() {
    const [time, setTime] = useState(0);
    const intervalRef = useRef(null);

    function start() {
        if (intervalRef.current) return; // already running
        intervalRef.current = setInterval(() => {
            setTime(t => t + 1);
        }, 1000);
    }

    function stop() {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }

    function reset() {
        stop();
        setTime(0);
    }

    return (
        <div>
            <p>{time}s</p>
            <button onClick={start}>Start</button>
            <button onClick={stop}>Stop</button>
            <button onClick={reset}>Reset</button>
        </div>
    );
}
```

### useRef vs useState

```
useState:
├── Changing it triggers a re-render
├── Value is available on next render
└── Use for: UI data (what the user sees)

useRef:
├── Changing it does NOT trigger a re-render
├── Value is available IMMEDIATELY
└── Use for: DOM refs, timers, previous values, instance variables
```

---

## useMemo — Expensive Calculations

`useMemo` caches the result of a computation and only recalculates when dependencies change.

```jsx
import { useMemo } from "react";

function ProductList({ products, sortBy }) {
    // Only re-sort when products or sortBy changes
    const sortedProducts = useMemo(() => {
        console.log("Sorting products...");  // check when it runs
        return [...products].sort((a, b) => {
            if (sortBy === "price") return a.price - b.price;
            if (sortBy === "name") return a.name.localeCompare(b.name);
            return 0;
        });
    }, [products, sortBy]);

    return (
        <ul>
            {sortedProducts.map(p => (
                <li key={p.id}>{p.name} — ${p.price}</li>
            ))}
        </ul>
    );
}
```

### When to Use useMemo

```
✅ Use when:
├── Filtering/sorting large arrays (1000+ items)
├── Complex calculations (recursive, nested loops)
├── Creating objects passed to memoized children
└── You've measured a performance problem

❌ Don't use when:
├── Simple operations (addition, string concat)
├── Small arrays (under 100 items)
├── You haven't measured a performance issue
└── Just to "be safe" — it has its own overhead
```

---

## useCallback — Stable Function References

`useCallback` caches a function reference to prevent unnecessary re-renders in child components.

```jsx
import { useCallback, memo } from "react";

// memo() prevents re-render if props haven't changed
const ExpensiveList = memo(function ExpensiveList({ items, onItemClick }) {
    console.log("ExpensiveList rendered");
    return (
        <ul>
            {items.map(item => (
                <li key={item.id} onClick={() => onItemClick(item.id)}>
                    {item.name}
                </li>
            ))}
        </ul>
    );
});

function App() {
    const [query, setQuery] = useState("");
    const [items, setItems] = useState([/*...*/]);

    // Without useCallback: new function every render → ExpensiveList re-renders
    // With useCallback: same function reference → ExpensiveList skips re-render
    const handleItemClick = useCallback((id) => {
        console.log("Clicked:", id);
    }, []);  // no dependencies = stable forever

    return (
        <div>
            <input value={query} onChange={e => setQuery(e.target.value)} />
            <ExpensiveList items={items} onItemClick={handleItemClick} />
        </div>
    );
}
```

### useMemo vs useCallback

```jsx
// useMemo caches a VALUE
const sortedList = useMemo(() => sort(list), [list]);

// useCallback caches a FUNCTION
const handleClick = useCallback(() => { doSomething(); }, []);

// useCallback is actually just useMemo for functions:
const handleClick = useMemo(() => () => { doSomething(); }, []);
```

---

## useContext — Sharing State Globally

Context solves **prop drilling** — passing data through many levels of components.

### The Prop Drilling Problem

```
App (has theme)
└── Layout (passes theme ↓)
    └── Sidebar (passes theme ↓)
        └── NavItem (passes theme ↓)
            └── Icon (finally uses theme!)

Every intermediate component must pass theme even if it doesn't use it.
```

### Step 1: Create Context

```jsx
// ThemeContext.jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");

    function toggleTheme() {
        setTheme(prev => prev === "light" ? "dark" : "light");
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom hook for convenience
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
```

### Step 2: Wrap Your App

```jsx
// main.jsx
import { ThemeProvider } from "./ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <ThemeProvider>
        <App />
    </ThemeProvider>
);
```

### Step 3: Use Anywhere

```jsx
// Any component — no prop drilling!
function NavItem({ label }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={`nav-item ${theme}`}>
            {label}
            <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
    );
}
```

### When to Use Context vs Props

| Scenario | Use |
|----------|-----|
| Data used by 1-2 levels | Props |
| Data used by many nested components | Context |
| Theme, auth, locale | Context |
| Component-specific data | Props |
| Frequently changing data (every keystroke) | Props or state management library |

---

## Custom Hooks — Reusable Logic

Custom hooks let you **extract and reuse stateful logic** across components. They're just functions that use other hooks.

### useLocalStorage

```jsx
function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

// Usage
function App() {
    const [name, setName] = useLocalStorage("username", "");
    return <input value={name} onChange={e => setName(e.target.value)} />;
}
```

### useFetch

```jsx
function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(url, { signal: controller.signal });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchData();

        return () => controller.abort();
    }, [url]);

    return { data, loading, error };
}

// Usage
function UserList() {
    const { data: users, loading, error } = useFetch("/api/users");

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <ul>
            {users.map(u => <li key={u.id}>{u.name}</li>)}
        </ul>
    );
}
```

### useToggle

```jsx
function useToggle(initial = false) {
    const [value, setValue] = useState(initial);
    const toggle = useCallback(() => setValue(v => !v), []);
    return [value, toggle];
}

// Usage
function Accordion({ title, children }) {
    const [isOpen, toggleOpen] = useToggle(false);

    return (
        <div>
            <button onClick={toggleOpen}>{title} {isOpen ? "▼" : "▶"}</button>
            {isOpen && <div>{children}</div>}
        </div>
    );
}
```

### useWindowSize

```jsx
function useWindowSize() {
    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        function handleResize() {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return size;
}

// Usage
function Layout() {
    const { width } = useWindowSize();
    return width < 768 ? <MobileNav /> : <DesktopNav />;
}
```

---

## State Management Patterns

```
WHEN TO USE WHAT:

useState / useReducer
├── Local component state
├── Form inputs, toggles, counters
└── State used by ONE component (or parent + children)

useContext
├── Global state used by many components
├── Theme, auth, locale, feature flags
└── ⚠️ Not great for frequently changing state (causes re-renders)

External Libraries (Zustand, Redux Toolkit, Jotai)
├── Complex global state
├── Frequently updated state (avoids Context re-render issue)
├── State that needs middleware (logging, persistence, devtools)
└── Large apps with many developers

URL (React Router)
├── State that should survive page refresh
├── Filters, search queries, pagination
└── State that should be shareable via link
```

---

## Rules of Hooks

```
1. Only call hooks at the TOP LEVEL
   ❌ Inside if statements
   ❌ Inside loops
   ❌ Inside nested functions
   ✅ At the top of your component

2. Only call hooks from REACT FUNCTIONS
   ✅ Function components
   ✅ Custom hooks
   ❌ Regular JavaScript functions
   ❌ Class components

// ❌ BAD — conditional hook
function Profile({ user }) {
    if (user) {
        const [name, setName] = useState(user.name);  // BREAKS
    }
}

// ✅ GOOD — hook always called, condition inside
function Profile({ user }) {
    const [name, setName] = useState(user?.name || "");

    if (!user) return null;
    return <h1>{name}</h1>;
}
```

---

## Key Takeaways

1. **useState** for simple state — use functional updates when new state depends on previous
2. **useReducer** for complex state with multiple actions — centralizes update logic
3. **useRef** for DOM access and values that shouldn't trigger re-renders
4. **useMemo** caches computed values — only use for measurably expensive operations
5. **useCallback** caches function references — pair with `React.memo()` for optimization
6. **useContext** eliminates prop drilling — create Provider + custom hook pattern
7. **Custom hooks** extract reusable logic — always prefix with `use`
8. **Don't over-optimize** — useMemo/useCallback have overhead, measure before adding
9. **Derive state during render** instead of storing calculated values in state
10. **Follow the Rules of Hooks** — always call at top level, never conditionally

---

## Practice Exercises

1. **Build a dark/light theme toggle** using useContext — persist choice in localStorage
2. **Create `useDebounce` hook** — delay updating a search query until user stops typing for 500ms
3. **Build a shopping cart** with useReducer — add items, change quantity, remove items, calculate total
4. **Create `useOnClickOutside` hook** — close a dropdown when clicking outside of it
5. **Build a multi-step form** — manage step navigation and form data with useReducer

---

**Previous:** [← Phase 10 — React Fundamentals](Phase-10-React-Fundamentals.md)
**Next:** [Phase 12 — React Router & Navigation →](Phase-12-React-Router-Navigation.md)
