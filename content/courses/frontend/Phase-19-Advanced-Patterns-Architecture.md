# Phase 19 — Advanced Patterns & Architecture

## Table of Contents

- [Component Design Patterns](#component-design-patterns)
- [Compound Components](#compound-components)
- [Render Props](#render-props)
- [Higher-Order Components (HOCs)](#higher-order-components-hocs)
- [Custom Hook Patterns](#custom-hook-patterns)
- [State Machines with useReducer](#state-machines-with-usereducer)
- [Error Boundaries](#error-boundaries)
- [Project Architecture](#project-architecture)
- [Feature-Based Structure](#feature-based-structure)
- [Separation of Concerns](#separation-of-concerns)
- [Key Takeaways](#key-takeaways)

---

## Component Design Patterns

```
EVOLUTION OF REACT PATTERNS:
├── Mixins (deprecated)         → don't use
├── Higher-Order Components     → wrapping components
├── Render Props               → passing render logic via props
├── Custom Hooks (current)     → share logic, compose behavior
└── Compound Components        → flexible, composable UI
```

---

## Compound Components

Compound components **work together** to form a complete UI — like `<select>` and `<option>`.

### The Problem

```jsx
// ❌ Too many props — inflexible
<Accordion
    items={[
        { title: "Section 1", content: <p>Content 1</p>, icon: "📁" },
        { title: "Section 2", content: <p>Content 2</p>, disabled: true }
    ]}
    allowMultiple={true}
    defaultOpen={[0]}
/>
// What if you need custom layout? What if you need a divider between items?
```

### The Solution — Compound Components

```jsx
// ✅ Flexible and composable
<Accordion defaultOpen={[0]}>
    <Accordion.Item>
        <Accordion.Trigger>📁 Section 1</Accordion.Trigger>
        <Accordion.Content>
            <p>Content 1</p>
        </Accordion.Content>
    </Accordion.Item>

    <Accordion.Item disabled>
        <Accordion.Trigger>Section 2</Accordion.Trigger>
        <Accordion.Content>
            <p>Content 2</p>
        </Accordion.Content>
    </Accordion.Item>
</Accordion>
```

### Implementation with Context

```jsx
import { createContext, useContext, useState } from "react";

// Context shared between compound parts
const AccordionContext = createContext();
const ItemContext = createContext();

function Accordion({ children, defaultOpen = [] }) {
    const [openItems, setOpenItems] = useState(new Set(defaultOpen));

    function toggle(index) {
        setOpenItems(prev => {
            const next = new Set(prev);
            next.has(index) ? next.delete(index) : next.add(index);
            return next;
        });
    }

    return (
        <AccordionContext.Provider value={{ openItems, toggle }}>
            <div className="accordion">{children}</div>
        </AccordionContext.Provider>
    );
}

function Item({ children, disabled = false }) {
    const index = useAccordionIndex();

    return (
        <ItemContext.Provider value={{ index, disabled }}>
            <div className="accordion-item">{children}</div>
        </ItemContext.Provider>
    );
}

function Trigger({ children }) {
    const { openItems, toggle } = useContext(AccordionContext);
    const { index, disabled } = useContext(ItemContext);

    return (
        <button
            className="accordion-trigger"
            onClick={() => !disabled && toggle(index)}
            aria-expanded={openItems.has(index)}
            disabled={disabled}
        >
            {children}
            <span>{openItems.has(index) ? "▼" : "▶"}</span>
        </button>
    );
}

function Content({ children }) {
    const { openItems } = useContext(AccordionContext);
    const { index } = useContext(ItemContext);

    if (!openItems.has(index)) return null;

    return <div className="accordion-content">{children}</div>;
}

// Attach sub-components
Accordion.Item = Item;
Accordion.Trigger = Trigger;
Accordion.Content = Content;

export default Accordion;
```

---

## Render Props

Pass a **function as a prop** that tells the component what to render.

```jsx
// The component provides data/behavior, you control rendering
function MouseTracker({ render }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        function handleMove(e) {
            setPosition({ x: e.clientX, y: e.clientY });
        }
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    return render(position);
}

// Usage — YOU decide how to render
<MouseTracker render={({ x, y }) => (
    <div>Mouse is at ({x}, {y})</div>
)} />

<MouseTracker render={({ x, y }) => (
    <div style={{ position: "absolute", left: x, top: y }}>
        🎯 Following cursor
    </div>
)} />
```

> **In modern React, custom hooks usually replace render props** — but the pattern is still useful for components that need to share rendering control.

### Modern Equivalent: Custom Hook

```jsx
// Same logic, as a hook
function useMousePosition() {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        function handleMove(e) {
            setPosition({ x: e.clientX, y: e.clientY });
        }
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    return position;
}

// Usage
function CursorFollower() {
    const { x, y } = useMousePosition();
    return <div>Mouse: ({x}, {y})</div>;
}
```

---

## Higher-Order Components (HOCs)

A HOC is a function that **takes a component and returns a new component** with additional behavior.

```jsx
// HOC that adds authentication check
function withAuth(WrappedComponent) {
    return function AuthenticatedComponent(props) {
        const { user } = useAuth();

        if (!user) {
            return <Navigate to="/login" />;
        }

        return <WrappedComponent {...props} user={user} />;
    };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);
const ProtectedSettings = withAuth(Settings);

// In routes
<Route path="/dashboard" element={<ProtectedDashboard />} />
```

### HOC with Loading State

```jsx
function withLoading(WrappedComponent) {
    return function WithLoadingComponent({ isLoading, ...props }) {
        if (isLoading) return <Spinner />;
        return <WrappedComponent {...props} />;
    };
}

const UserListWithLoading = withLoading(UserList);

// Usage
<UserListWithLoading isLoading={loading} users={users} />
```

### When to Use Each Pattern

```
CUSTOM HOOKS (preferred):
├── Share stateful logic between components
├── No JSX rendering concern
├── Most flexible, most composable
└── Examples: useFetch, useAuth, useLocalStorage

COMPOUND COMPONENTS:
├── Related components that share implicit state
├── Flexible composition API
└── Examples: Accordion, Tabs, Menu, Select

RENDER PROPS:
├── When a component controls WHEN to render children
├── When children need data from the parent
└── Examples: Tooltip position, virtualized list items

HOC:
├── Cross-cutting concerns (auth, logging, analytics)
├── Legacy pattern — prefer hooks in new code
└── Examples: withRouter (React Router v5), connect (Redux)
```

---

## Custom Hook Patterns

### useMediaQuery

```jsx
function useMediaQuery(query) {
    const [matches, setMatches] = useState(
        () => window.matchMedia(query).matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        function handler(e) { setMatches(e.matches); }
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, [query]);

    return matches;
}

// Usage
function Layout() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

### useOnClickOutside

```jsx
function useOnClickOutside(ref, handler) {
    useEffect(() => {
        function listener(event) {
            if (!ref.current || ref.current.contains(event.target)) return;
            handler(event);
        }

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}

// Usage
function Dropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useOnClickOutside(ref, () => setIsOpen(false));

    return (
        <div ref={ref}>
            <button onClick={() => setIsOpen(!isOpen)}>Menu</button>
            {isOpen && <ul className="dropdown">...</ul>}
        </div>
    );
}
```

### usePrevious

```jsx
function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

// Usage — compare current and previous values
function Counter() {
    const [count, setCount] = useState(0);
    const prevCount = usePrevious(count);

    return (
        <p>
            Current: {count}, Previous: {prevCount}
            {count > prevCount ? " (increased)" : count < prevCount ? " (decreased)" : ""}
        </p>
    );
}
```

### useDebounce

```jsx
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// Usage
function SearchPage() {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500);

    // Only fetch when debounced value changes (not on every keystroke)
    const { data } = useFetch(
        debouncedQuery ? `/api/search?q=${debouncedQuery}` : null
    );

    return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

---

## State Machines with useReducer

Model complex state transitions as explicit states and events.

```jsx
// Explicit states prevent impossible states
const STATES = {
    idle: { on: { FETCH: "loading" } },
    loading: { on: { SUCCESS: "success", FAILURE: "error" } },
    success: { on: { FETCH: "loading" } },
    error: { on: { RETRY: "loading" } }
};

function fetchReducer(state, action) {
    const transition = STATES[state.status]?.on[action.type];

    if (!transition) return state;  // invalid transition — ignore

    switch (action.type) {
        case "FETCH":
            return { status: "loading", data: null, error: null };
        case "SUCCESS":
            return { status: "success", data: action.payload, error: null };
        case "FAILURE":
            return { status: "error", data: null, error: action.payload };
        case "RETRY":
            return { status: "loading", data: null, error: null };
        default:
            return state;
    }
}

function DataFetcher({ url }) {
    const [state, dispatch] = useReducer(fetchReducer, {
        status: "idle",
        data: null,
        error: null
    });

    useEffect(() => {
        dispatch({ type: "FETCH" });

        fetch(url)
            .then(res => res.json())
            .then(data => dispatch({ type: "SUCCESS", payload: data }))
            .catch(err => dispatch({ type: "FAILURE", payload: err.message }));
    }, [url]);

    switch (state.status) {
        case "idle": return null;
        case "loading": return <Spinner />;
        case "success": return <DataDisplay data={state.data} />;
        case "error": return (
            <div>
                <p>Error: {state.error}</p>
                <button onClick={() => dispatch({ type: "RETRY" })}>Retry</button>
            </div>
        );
    }
}
```

### Why State Machines?

```
WITHOUT STATE MACHINE:
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [data, setData] = useState(null);
// Can be loading AND error at the same time — impossible state!

WITH STATE MACHINE:
status: "idle" | "loading" | "success" | "error"
// Only ONE state at a time — impossible states are impossible
```

---

## Error Boundaries

Catch JavaScript errors in components and display a fallback UI.

```jsx
import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log to error reporting service
        console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="error-boundary">
                    <h2>Something went wrong</h2>
                    <p>{this.state.error?.message}</p>
                    <button onClick={() => this.setState({ hasError: false })}>
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Usage — wrap sections of your app
function App() {
    return (
        <ErrorBoundary>
            <Header />
            <ErrorBoundary fallback={<p>Widget failed to load</p>}>
                <Dashboard />
            </ErrorBoundary>
            <Footer />
        </ErrorBoundary>
    );
}
```

> **Error boundaries only catch errors during rendering, lifecycle methods, and constructors.** They don't catch errors in event handlers, async code, or server-side rendering.

---

## Project Architecture

### Small Project (1-5 pages)

```
src/
├── components/
│   ├── Button.jsx
│   ├── Card.jsx
│   └── Navbar.jsx
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   └── Contact.jsx
├── hooks/
│   └── useFetch.js
├── utils/
│   └── format.js
├── App.jsx
└── main.jsx
```

### Medium Project (5-20 pages)

```
src/
├── components/         ← Shared/reusable components
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Modal.jsx
│   └── layout/
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── Sidebar.jsx
├── pages/              ← Route components
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   └── Settings.jsx
├── hooks/              ← Shared hooks
├── api/                ← API layer
├── context/            ← React Context providers
├── types/              ← TypeScript types
├── utils/              ← Pure utility functions
├── constants/          ← App-wide constants
├── styles/             ← Global styles
├── App.jsx
└── main.jsx
```

---

## Feature-Based Structure

For large apps (20+ pages), organize by **feature**, not file type.

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── api/
│   │   │   └── auth.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── types.ts
│   │   └── index.ts        ← Public API (barrel file)
│   │
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductDetail.tsx
│   │   ├── hooks/
│   │   │   └── useProducts.ts
│   │   ├── api/
│   │   │   └── products.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── cart/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       └── index.ts
│
├── shared/               ← Cross-feature shared code
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
│
├── App.tsx
└── main.tsx
```

### Barrel Files

```typescript
// features/auth/index.ts — public API of this feature
export { LoginForm } from "./components/LoginForm";
export { SignUpForm } from "./components/SignUpForm";
export { ProtectedRoute } from "./components/ProtectedRoute";
export { useAuth } from "./hooks/useAuth";
export { AuthProvider } from "./context/AuthContext";
export type { User, AuthState } from "./types";

// Other features import from the barrel:
import { useAuth, ProtectedRoute } from "@/features/auth";
// NOT from deep paths like "@/features/auth/hooks/useAuth"
```

---

## Separation of Concerns

### Separate Logic from UI

```jsx
// ❌ Business logic mixed with rendering
function ProductList() {
    const [products, setProducts] = useState([]);
    const [sort, setSort] = useState("name");
    const [filter, setFilter] = useState("");

    useEffect(() => {
        fetch("/api/products").then(r => r.json()).then(setProducts);
    }, []);

    const filteredProducts = products
        .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => { /* sorting logic */ });

    return (/* rendering */);
}
```

```jsx
// ✅ Logic in custom hook, UI in component
function useProducts() {
    const [products, setProducts] = useState([]);
    const [sort, setSort] = useState("name");
    const [filter, setFilter] = useState("");

    useEffect(() => {
        fetch("/api/products").then(r => r.json()).then(setProducts);
    }, []);

    const filteredProducts = useMemo(() =>
        products
            .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
            .sort((a, b) => { /* sorting logic */ }),
        [products, filter, sort]
    );

    return { products: filteredProducts, sort, setSort, filter, setFilter };
}

// Component is now purely presentational
function ProductList() {
    const { products, sort, setSort, filter, setFilter } = useProducts();

    return (/* rendering only */);
}
```

### Container / Presentational Pattern

```
CONTAINER (Smart)          PRESENTATIONAL (Dumb)
├── Fetches data           ├── Receives data via props
├── Manages state          ├── No state (or local UI state only)
├── Contains logic         ├── Renders UI only
└── Passes data to UI      └── Reusable across contexts
```

---

## Key Takeaways

1. **Custom hooks are the primary way to share logic** — prefer over HOCs and render props
2. **Compound components** give users flexible composition — like building with LEGO
3. **State machines** prevent impossible states — `status: "loading" | "success" | "error"`
4. **Error boundaries** catch render errors — wrap sections of your app with fallbacks
5. **Feature-based file structure** scales better than type-based for large apps
6. **Barrel files** define the public API of each feature — import from `index.ts`
7. **Separate logic from UI** — custom hooks for logic, components for rendering
8. **Use render props** when the parent needs to control what the child renders
9. **HOCs are legacy** — still work, but custom hooks are more flexible
10. **Don't over-engineer** — start simple, add patterns only when complexity demands it

---

## Practice Exercises

1. **Build compound Tabs** — `<Tabs>`, `<Tabs.List>`, `<Tabs.Tab>`, `<Tabs.Panel>` with keyboard navigation
2. **Create a `useForm` custom hook** — handles values, errors, touched, validation, submit
3. **Implement a state machine** for a multi-step checkout: cart → shipping → payment → confirmation
4. **Add error boundaries** to an existing app — wrap route sections with different fallback UIs
5. **Refactor a project** from type-based to feature-based structure — create barrel files for each feature

---

**Previous:** [← Phase 18 — TypeScript for Frontend](Phase-18-TypeScript-Frontend.md)
**Next:** [Phase 20 — Deployment & CI/CD →](Phase-20-Deployment-CICD.md)
