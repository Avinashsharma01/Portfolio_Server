# Phase 12 — React Router & Navigation

## Table of Contents

- [What is Client-Side Routing?](#what-is-client-side-routing)
- [Setting Up React Router](#setting-up-react-router)
- [Basic Routes](#basic-routes)
- [Navigation — Link and NavLink](#navigation--link-and-navlink)
- [Dynamic Routes & URL Parameters](#dynamic-routes--url-parameters)
- [Nested Routes & Layouts](#nested-routes--layouts)
- [Programmatic Navigation](#programmatic-navigation)
- [Search Params (Query Strings)](#search-params-query-strings)
- [Protected Routes](#protected-routes)
- [Error Handling & 404 Pages](#error-handling--404-pages)
- [Data Loading with Loaders](#data-loading-with-loaders)
- [Key Takeaways](#key-takeaways)

---

## What is Client-Side Routing?

In traditional websites, every page is a separate HTML file. The browser makes a full request to the server, which returns a new page.

In React (Single-Page Applications), **one HTML file loads once**, and JavaScript handles page transitions by swapping components in and out.

```
TRADITIONAL (Multi-Page):
User clicks link
→ Browser sends request to server
→ Server returns NEW HTML page
→ Browser reloads everything (flash of white)

REACT SPA (Client-Side Routing):
User clicks link
→ JavaScript intercepts the click
→ URL changes (via History API)
→ React swaps the component (no reload)
→ Instant transition
```

---

## Setting Up React Router

```bash
npm install react-router-dom
```

React Router v6.4+ introduced a data router API. We'll cover both the basic and data router approaches.

### Basic Setup

```jsx
// main.jsx
import { BrowserRouter } from "react-router-dom";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
```

---

## Basic Routes

```jsx
import { Routes, Route } from "react-router-dom";

// Page components
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
    return (
        <div>
            <nav>{/* navigation links */}</nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>
        </div>
    );
}
```

### How It Works

```
URL: /           → Renders <Home />
URL: /about      → Renders <About />
URL: /contact    → Renders <Contact />

The <Routes> component looks at the URL and renders
the matching <Route>'s element.
```

### File Structure

```
src/
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   ├── ProductList.jsx
│   ├── ProductDetail.jsx
│   └── NotFound.jsx
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── Layout.jsx
├── App.jsx
└── main.jsx
```

---

## Navigation — Link and NavLink

### Link (Replaces `<a>` Tags)

```jsx
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            {/* ✅ Use Link — no page reload */}
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>

            {/* ❌ Don't use <a> for internal links — causes full reload */}
            <a href="/about">About</a>
        </nav>
    );
}
```

### NavLink (Active State)

```jsx
import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <NavLink
                to="/"
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
                Home
            </NavLink>

            <NavLink
                to="/about"
                style={({ isActive }) => ({
                    fontWeight: isActive ? "bold" : "normal",
                    color: isActive ? "#3b82f6" : "#333"
                })}
            >
                About
            </NavLink>
        </nav>
    );
}
```

```css
/* Or use CSS — NavLink adds "active" class by default */
.nav-link.active {
    color: #3b82f6;
    border-bottom: 2px solid #3b82f6;
}
```

---

## Dynamic Routes & URL Parameters

### Route with Parameter

```jsx
<Routes>
    <Route path="/products" element={<ProductList />} />
    <Route path="/products/:productId" element={<ProductDetail />} />
    <Route path="/users/:userId/posts/:postId" element={<PostDetail />} />
</Routes>
```

### Reading Parameters with useParams

```jsx
import { useParams } from "react-router-dom";

function ProductDetail() {
    const { productId } = useParams();

    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetch(`/api/products/${productId}`)
            .then(res => res.json())
            .then(data => setProduct(data));
    }, [productId]);

    if (!product) return <p>Loading...</p>;

    return (
        <div>
            <h1>{product.name}</h1>
            <p>${product.price}</p>
        </div>
    );
}
```

### Linking to Dynamic Routes

```jsx
function ProductList({ products }) {
    return (
        <ul>
            {products.map(product => (
                <li key={product.id}>
                    <Link to={`/products/${product.id}`}>
                        {product.name}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
```

---

## Nested Routes & Layouts

Nested routes let you create persistent layouts where only part of the page changes.

### Layout with Outlet

```jsx
import { Outlet } from "react-router-dom";

function Layout() {
    return (
        <div className="app">
            <Navbar />
            <main>
                <Outlet />  {/* Child routes render HERE */}
            </main>
            <Footer />
        </div>
    );
}
```

### Route Configuration

```jsx
function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* These render inside <Outlet /> */}
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="products" element={<ProductList />} />
                <Route path="products/:id" element={<ProductDetail />} />
            </Route>
        </Routes>
    );
}
```

### How Nesting Works

```
URL: /about

Renders:
┌────────────────────────────┐
│ <Layout>                   │
│   <Navbar />               │  ← Always visible
│   <main>                   │
│     <About />              │  ← Changes based on URL
│   </main>                  │
│   <Footer />               │  ← Always visible
│ </Layout>                  │
└────────────────────────────┘
```

### Dashboard Nested Layout

```jsx
<Routes>
    <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
        </Route>
    </Route>
</Routes>

function DashboardLayout() {
    return (
        <div className="dashboard">
            <aside>
                <NavLink to="/dashboard">Overview</NavLink>
                <NavLink to="/dashboard/settings">Settings</NavLink>
                <NavLink to="/dashboard/profile">Profile</NavLink>
            </aside>
            <section>
                <Outlet />
            </section>
        </div>
    );
}
```

---

## Programmatic Navigation

### useNavigate

```jsx
import { useNavigate } from "react-router-dom";

function LoginForm() {
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        const success = await login(email, password);

        if (success) {
            navigate("/dashboard");         // go to dashboard
            // navigate("/dashboard", { replace: true });  // replace history entry
        }
    }

    return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### Navigation Methods

```jsx
const navigate = useNavigate();

navigate("/about");                    // push new entry
navigate("/about", { replace: true }); // replace current entry
navigate(-1);                          // go back
navigate(-2);                          // go back 2 steps
navigate(1);                           // go forward
```

### Passing State via Navigation

```jsx
// Send state
navigate("/checkout", {
    state: { from: "/cart", items: cartItems }
});

// Receive state in the target component
import { useLocation } from "react-router-dom";

function Checkout() {
    const location = useLocation();
    const { from, items } = location.state || {};

    return <div>You came from: {from}</div>;
}
```

---

## Search Params (Query Strings)

```
URL: /products?category=electronics&sort=price&page=2
                 ↑ search params (query string)
```

### useSearchParams

```jsx
import { useSearchParams } from "react-router-dom";

function ProductList() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Read params
    const category = searchParams.get("category") || "all";
    const sort = searchParams.get("sort") || "name";
    const page = Number(searchParams.get("page")) || 1;

    // Set params (replaces all params)
    function handleCategoryChange(newCategory) {
        setSearchParams({ category: newCategory, sort, page: 1 });
    }

    // Update one param (preserve others)
    function handleSortChange(newSort) {
        setSearchParams(prev => {
            prev.set("sort", newSort);
            return prev;
        });
    }

    // Delete a param
    function handleClearFilter() {
        setSearchParams(prev => {
            prev.delete("category");
            return prev;
        });
    }

    return (
        <div>
            <select value={category} onChange={e => handleCategoryChange(e.target.value)}>
                <option value="all">All</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
            </select>

            <select value={sort} onChange={e => handleSortChange(e.target.value)}>
                <option value="name">Name</option>
                <option value="price">Price</option>
            </select>
        </div>
    );
}
```

> **Search params survive page refresh** and can be shared via URL — perfect for filters, search, and pagination.

---

## Protected Routes

### Auth Context Setup

```jsx
// AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    function login(userData) { setUser(userData); }
    function logout() { setUser(null); }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
```

### ProtectedRoute Component

```jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // Redirect to login, save where user came from
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
```

### Using Protected Routes

```jsx
<Routes>
    <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route path="dashboard" element={
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        } />

        <Route path="settings" element={
            <ProtectedRoute>
                <Settings />
            </ProtectedRoute>
        } />
    </Route>
</Routes>
```

### Redirect After Login

```jsx
function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Where did the user come from?
    const from = location.state?.from?.pathname || "/dashboard";

    async function handleSubmit(e) {
        e.preventDefault();
        await login({ name: "Alice" });
        navigate(from, { replace: true });  // Go back to where they were trying to go
    }

    return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

## Error Handling & 404 Pages

### Catch-All Route (404)

```jsx
<Routes>
    <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />

        {/* Catch-all — must be LAST */}
        <Route path="*" element={<NotFound />} />
    </Route>
</Routes>

function NotFound() {
    return (
        <div className="not-found">
            <h1>404</h1>
            <p>Page not found</p>
            <Link to="/">Go Home</Link>
        </div>
    );
}
```

### Error Boundary with React Router

```jsx
import { useRouteError } from "react-router-dom";

function ErrorPage() {
    const error = useRouteError();

    return (
        <div>
            <h1>Oops!</h1>
            <p>Something went wrong.</p>
            <p>{error?.message || "Unknown error"}</p>
            <Link to="/">Go Home</Link>
        </div>
    );
}

// In route config (data router)
const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <Home /> },
            { path: "about", element: <About /> }
        ]
    }
]);
```

---

## Data Loading with Loaders

React Router v6.4+ supports **loaders** — functions that fetch data before the component renders.

### Setup with createBrowserRouter

```jsx
// main.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            {
                path: "products",
                element: <ProductList />,
                loader: async () => {
                    const res = await fetch("/api/products");
                    if (!res.ok) throw new Error("Failed to load products");
                    return res.json();
                }
            },
            {
                path: "products/:id",
                element: <ProductDetail />,
                loader: async ({ params }) => {
                    const res = await fetch(`/api/products/${params.id}`);
                    if (!res.ok) throw new Error("Product not found");
                    return res.json();
                }
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);
```

### Using Loader Data

```jsx
import { useLoaderData } from "react-router-dom";

function ProductList() {
    const products = useLoaderData();

    return (
        <ul>
            {products.map(p => (
                <li key={p.id}>
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                </li>
            ))}
        </ul>
    );
}
```

> **Loaders start fetching as soon as the user navigates** — no loading spinner, no useEffect. The data is ready when the component renders.

---

## Key Takeaways

1. **React Router enables client-side routing** — no full page reloads, instant transitions
2. **Use `<Link>` and `<NavLink>`** instead of `<a>` tags for internal navigation
3. **`useParams`** reads URL parameters like `/products/:id`
4. **Nested routes with `<Outlet>`** create persistent layouts
5. **`useNavigate`** enables programmatic navigation after form submissions or actions
6. **`useSearchParams`** manages query strings — great for filters, search, pagination
7. **Protected routes** check auth status and redirect to login if needed
8. **Always include a `path="*"` catch-all** route for 404 pages
9. **Loaders (v6.4+)** fetch data before rendering — eliminates loading states
10. **Keep route state in the URL** when it should survive refresh or be shareable

---

## Practice Exercises

1. **Build a multi-page app** with Home, About, Contact pages and persistent navbar with active link styling
2. **Create a product catalog** — list page → detail page using dynamic routes and useParams
3. **Add search and filter** using useSearchParams — category dropdown and search input reflected in URL
4. **Implement protected routes** — login page, protected dashboard, redirect after login
5. **Build a dashboard layout** with nested routes — sidebar navigation, overview/settings/profile sub-pages

---

**Previous:** [← Phase 11 — React State Management & Hooks](Phase-11-React-State-Hooks.md)
**Next:** [Phase 13 — Fetching Data & API Integration →](Phase-13-Fetching-Data-API-Integration.md)
