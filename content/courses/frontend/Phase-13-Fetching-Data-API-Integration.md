# Phase 13 — Fetching Data & API Integration

## Table of Contents

- [How Frontend Talks to Backend](#how-frontend-talks-to-backend)
- [Fetch API in React](#fetch-api-in-react)
- [Loading, Error, and Empty States](#loading-error-and-empty-states)
- [Reusable Fetch Hook](#reusable-fetch-hook)
- [Abort Controller — Cancelling Requests](#abort-controller--cancelling-requests)
- [POST, PUT, DELETE — Mutations](#post-put-delete--mutations)
- [Optimistic Updates](#optimistic-updates)
- [Polling and Real-Time Data](#polling-and-real-time-data)
- [Axios vs Fetch](#axios-vs-fetch)
- [React Query (TanStack Query)](#react-query-tanstack-query)
- [API Layer Architecture](#api-layer-architecture)
- [Key Takeaways](#key-takeaways)

---

## How Frontend Talks to Backend

```
FRONTEND (React)          BACKEND (Express/Django/etc.)
┌──────────────┐          ┌──────────────┐
│   Component  │  ──────► │  /api/users  │
│              │  HTTP     │              │
│   useState() │  ◄────── │  JSON        │
│   render UI  │  Response │  Database    │
└──────────────┘          └──────────────┘

1. React component mounts
2. useEffect fires a fetch() request
3. Backend processes request, queries database
4. Backend returns JSON response
5. React stores data in state
6. Component re-renders with data
```

---

## Fetch API in React

### Basic Pattern: Fetch in useEffect

```jsx
import { useState, useEffect } from "react";

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch("https://jsonplaceholder.typicode.com/users");

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);  // Empty array = fetch once on mount

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>{user.name} — {user.email}</li>
            ))}
        </ul>
    );
}
```

### ⚠️ Common Mistakes

```jsx
// ❌ Making useEffect async directly
useEffect(async () => {       // React doesn't support this
    const data = await fetch(...);
}, []);

// ✅ Define async function INSIDE useEffect
useEffect(() => {
    async function fetchData() {
        const data = await fetch(...);
    }
    fetchData();
}, []);

// ❌ Not checking response.ok
const response = await fetch(url);
const data = await response.json();  // 404/500 still returns response!

// ✅ Check response status
const response = await fetch(url);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
```

---

## Loading, Error, and Empty States

Every data-fetching component needs **three states**:

```jsx
function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("/api/products")
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => setProducts(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    // 1. LOADING state
    if (loading) {
        return (
            <div className="loading">
                <div className="spinner" />
                <p>Loading products...</p>
            </div>
        );
    }

    // 2. ERROR state
    if (error) {
        return (
            <div className="error">
                <p>Failed to load products: {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    // 3. EMPTY state
    if (products.length === 0) {
        return (
            <div className="empty">
                <p>No products found.</p>
            </div>
        );
    }

    // 4. SUCCESS state
    return (
        <div className="product-grid">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
```

### Skeleton Loading

```jsx
function ProductSkeleton() {
    return (
        <div className="product-card skeleton">
            <div className="skeleton-image" />
            <div className="skeleton-text" />
            <div className="skeleton-text short" />
        </div>
    );
}

function ProductList() {
    // ...
    if (loading) {
        return (
            <div className="product-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                ))}
            </div>
        );
    }
    // ...
}
```

```css
.skeleton {
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

.skeleton-image {
    width: 100%;
    height: 200px;
    background: #e0e0e0;
    border-radius: 8px;
}

.skeleton-text {
    height: 16px;
    background: #e0e0e0;
    border-radius: 4px;
    margin-top: 12px;
}

.skeleton-text.short {
    width: 60%;
}
```

---

## Reusable Fetch Hook

```jsx
import { useState, useEffect } from "react";

function useFetch(url, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const json = await response.json();
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

// Usage — clean and simple!
function UserList() {
    const { data: users, loading, error } = useFetch("/api/users");

    if (loading) return <Spinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!users?.length) return <EmptyState />;

    return (
        <ul>
            {users.map(user => <li key={user.id}>{user.name}</li>)}
        </ul>
    );
}
```

---

## Abort Controller — Cancelling Requests

### Why Cancel Requests?

```
PROBLEM: Race condition

1. User navigates to /users/1 → fetch starts
2. User quickly navigates to /users/2 → new fetch starts
3. Response for /users/2 arrives first → renders user 2 ✅
4. Response for /users/1 arrives later → OVERWRITES with user 1 ❌

SOLUTION: Cancel the old request when a new one starts
```

### Implementation

```jsx
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchUser() {
            try {
                const res = await fetch(`/api/users/${userId}`, {
                    signal: controller.signal
                });
                const data = await res.json();
                setUser(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Fetch failed:", err);
                }
                // AbortError = we cancelled it intentionally, ignore
            }
        }

        fetchUser();

        // Cleanup: abort the request if userId changes or component unmounts
        return () => controller.abort();
    }, [userId]);

    return user ? <h1>{user.name}</h1> : <p>Loading...</p>;
}
```

---

## POST, PUT, DELETE — Mutations

### Creating Data (POST)

```jsx
function CreatePostForm() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, body })
            });

            if (!response.ok) throw new Error("Failed to create post");

            const newPost = await response.json();
            console.log("Created:", newPost);

            // Reset form
            setTitle("");
            setBody("");
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Title"
                required
            />
            <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Body"
                required
            />
            <button disabled={submitting}>
                {submitting ? "Creating..." : "Create Post"}
            </button>
        </form>
    );
}
```

### Updating Data (PUT/PATCH)

```jsx
async function updateUser(userId, updates) {
    const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error("Update failed");
    return response.json();
}

// In component
async function handleSave() {
    try {
        const updated = await updateUser(user.id, { name: newName });
        setUser(updated);           // update local state with response
    } catch (err) {
        setError(err.message);
    }
}
```

### Deleting Data (DELETE)

```jsx
function TodoItem({ todo, onDelete }) {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        setDeleting(true);
        try {
            const response = await fetch(`/api/todos/${todo.id}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Delete failed");

            onDelete(todo.id);  // tell parent to remove from list
        } catch (err) {
            alert(err.message);
            setDeleting(false);
        }
    }

    return (
        <li>
            {todo.text}
            <button onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
            </button>
        </li>
    );
}
```

---

## Optimistic Updates

Update the UI **immediately** before the server confirms, then rollback if it fails.

```jsx
function TodoList() {
    const [todos, setTodos] = useState([]);

    async function handleToggle(todoId) {
        // 1. Save current state (for rollback)
        const previousTodos = [...todos];

        // 2. Optimistically update UI
        setTodos(todos.map(todo =>
            todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        ));

        // 3. Make API call
        try {
            const response = await fetch(`/api/todos/${todoId}/toggle`, {
                method: "PATCH"
            });
            if (!response.ok) throw new Error("Update failed");
        } catch (err) {
            // 4. Rollback if it fails
            setTodos(previousTodos);
            alert("Failed to update, reverted.");
        }
    }

    return (
        <ul>
            {todos.map(todo => (
                <li key={todo.id} onClick={() => handleToggle(todo.id)}>
                    {todo.completed ? "✅" : "⬜"} {todo.text}
                </li>
            ))}
        </ul>
    );
}
```

---

## Polling and Real-Time Data

### Polling (Fetch on Interval)

```jsx
function LiveDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        async function fetchStats() {
            const res = await fetch("/api/dashboard/stats");
            const data = await res.json();
            setStats(data);
        }

        // Fetch immediately
        fetchStats();

        // Then fetch every 30 seconds
        const interval = setInterval(fetchStats, 30000);

        return () => clearInterval(interval);
    }, []);

    return stats ? <StatsDisplay data={stats} /> : <Spinner />;
}
```

### Custom usePoll Hook

```jsx
function usePoll(url, intervalMs = 5000) {
    const [data, setData] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        async function poll() {
            try {
                const res = await fetch(url, { signal: controller.signal });
                const json = await res.json();
                setData(json);
            } catch (err) {
                if (err.name !== "AbortError") console.error(err);
            }
        }

        poll();
        const interval = setInterval(poll, intervalMs);

        return () => {
            clearInterval(interval);
            controller.abort();
        };
    }, [url, intervalMs]);

    return data;
}

// Usage
function NotificationBadge() {
    const data = usePoll("/api/notifications/count", 10000);
    return data?.count > 0 ? <span className="badge">{data.count}</span> : null;
}
```

---

## Axios vs Fetch

```bash
npm install axios
```

| Feature | Fetch | Axios |
|---------|-------|-------|
| **Built-in** | ✅ Yes | ❌ Needs install |
| **JSON auto-parse** | ❌ Need `.json()` | ✅ `response.data` |
| **Error on 4xx/5xx** | ❌ Need to check `.ok` | ✅ Throws automatically |
| **Request cancel** | AbortController | CancelToken / AbortController |
| **Interceptors** | ❌ No | ✅ Yes |
| **Timeout** | ❌ Manual | ✅ `timeout` option |
| **Progress** | ❌ Complex | ✅ `onUploadProgress` |

### Axios Example

```jsx
import axios from "axios";

// Create configured instance
const api = axios.create({
    baseURL: "https://api.example.com",
    timeout: 10000,
    headers: { "Content-Type": "application/json" }
});

// Interceptor — attach auth token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor — handle 401 globally
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Usage
async function getUsers() {
    const { data } = await api.get("/users");
    return data;
}

async function createUser(userData) {
    const { data } = await api.post("/users", userData);
    return data;
}
```

---

## React Query (TanStack Query)

React Query handles caching, background refetching, stale data, pagination, and more — replacing most manual fetch logic.

```bash
npm install @tanstack/react-query
```

### Setup

```jsx
// main.jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
);
```

### Fetching Data (useQuery)

```jsx
import { useQuery } from "@tanstack/react-query";

function UserList() {
    const { data: users, isLoading, error } = useQuery({
        queryKey: ["users"],            // unique cache key
        queryFn: () =>                  // function that returns a promise
            fetch("/api/users").then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
    });

    if (isLoading) return <Spinner />;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <ul>
            {users.map(user => <li key={user.id}>{user.name}</li>)}
        </ul>
    );
}
```

### Mutations (useMutation)

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreateUserForm() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (newUser) =>
            fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            }).then(res => res.json()),

        onSuccess: () => {
            // Invalidate the users cache = triggers refetch
            queryClient.invalidateQueries({ queryKey: ["users"] });
        }
    });

    function handleSubmit(e) {
        e.preventDefault();
        mutation.mutate({ name: "Alice", email: "alice@example.com" });
    }

    return (
        <form onSubmit={handleSubmit}>
            <button disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create User"}
            </button>
        </form>
    );
}
```

### Why React Query?

```
WITHOUT React Query:
├── Manual loading/error state
├── No caching — refetch on every mount
├── No background refetch
├── Manual cache invalidation
├── Race conditions
└── Lots of useEffect boilerplate

WITH React Query:
├── Automatic loading/error/success states
├── Smart caching — same data used by multiple components
├── Background refetch when tab gains focus
├── Easy cache invalidation on mutations
├── Built-in race condition handling
└── DevTools for debugging
```

---

## API Layer Architecture

Separate your API calls from your components.

### File Structure

```
src/
├── api/
│   ├── client.js        ← Configured fetch/axios instance
│   ├── users.js         ← User-related API calls
│   ├── products.js      ← Product-related API calls
│   └── auth.js          ← Auth-related API calls
├── hooks/
│   ├── useUsers.js      ← Custom hook wrapping API
│   └── useProducts.js
└── pages/
    └── UserList.jsx
```

### API Client

```javascript
// api/client.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function apiClient(endpoint, { method = "GET", body, headers = {} } = {}) {
    const config = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers
        }
    };

    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) return null;

    return response.json();
}

export default apiClient;
```

### API Module

```javascript
// api/users.js
import apiClient from "./client";

export function getUsers() {
    return apiClient("/users");
}

export function getUser(id) {
    return apiClient(`/users/${id}`);
}

export function createUser(data) {
    return apiClient("/users", { method: "POST", body: data });
}

export function updateUser(id, data) {
    return apiClient(`/users/${id}`, { method: "PATCH", body: data });
}

export function deleteUser(id) {
    return apiClient(`/users/${id}`, { method: "DELETE" });
}
```

### Usage in Components

```jsx
import { getUsers } from "../api/users";

function UserList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getUsers().then(setUsers).catch(console.error);
    }, []);

    return (/* ... */);
}
```

---

## Key Takeaways

1. **Always handle loading, error, and empty states** — users need feedback
2. **Define async functions inside useEffect**, not as the useEffect callback
3. **Check `response.ok`** — fetch doesn't throw on 4xx/5xx status codes
4. **Use AbortController** to cancel requests on unmount or dependency change
5. **Separate API calls from components** — create an API layer (`api/client.js`)
6. **Optimistic updates** improve perceived performance — update UI before server confirms
7. **React Query** eliminates most data-fetching boilerplate — use it for medium-to-large apps
8. **Skeleton loaders** feel faster than spinners — they show layout structure
9. **Don't store fetched data in multiple states** — derive when possible
10. **Use environment variables** (`VITE_API_URL`) for API base URLs — never hardcode

---

## Practice Exercises

1. **Build a user directory** — fetch from JSONPlaceholder, show loading skeleton, handle errors
2. **Create a CRUD app** — create, read, update, delete posts with proper loading/error states
3. **Implement search with debounce** — fetch results as user types, cancel previous requests
4. **Add optimistic delete** — remove item from UI immediately, rollback if API fails
5. **Set up React Query** — convert a useState/useEffect fetch to useQuery and useMutation

---

**Previous:** [← Phase 12 — React Router & Navigation](Phase-12-React-Router-Navigation.md)
**Next:** [Phase 14 — Forms, Validation & User Input →](Phase-14-Forms-Validation-User-Input.md)
