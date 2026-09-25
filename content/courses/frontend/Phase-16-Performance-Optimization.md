# Phase 16 — Performance Optimization

## Table of Contents

- [Why Performance Matters](#why-performance-matters)
- [Core Web Vitals](#core-web-vitals)
- [Measuring Performance](#measuring-performance)
- [React Rendering — How It Works](#react-rendering--how-it-works)
- [Preventing Unnecessary Re-renders](#preventing-unnecessary-re-renders)
- [Code Splitting & Lazy Loading](#code-splitting--lazy-loading)
- [Image Optimization](#image-optimization)
- [List Virtualization](#list-virtualization)
- [Bundle Size Optimization](#bundle-size-optimization)
- [Network Performance](#network-performance)
- [Web Workers](#web-workers)
- [Performance Checklist](#performance-checklist)
- [Key Takeaways](#key-takeaways)

---

## Why Performance Matters

```
SLOW SITE:
├── 53% of users leave if page takes > 3 seconds to load
├── Every 100ms delay → 1% drop in revenue (Amazon)
├── Google ranks fast sites higher (Core Web Vitals)
├── Bad UX → users don't come back
└── Higher bounce rate, lower engagement

FAST SITE:
├── Better user experience
├── Higher conversion rates
├── Better SEO ranking
├── Lower bounce rate
└── More engagement
```

---

## Core Web Vitals

Google's metrics for measuring real-world user experience:

```
┌─────────────┬───────────────────────────────┬──────────┬──────────┐
│ Metric      │ What It Measures              │ Good     │ Poor     │
├─────────────┼───────────────────────────────┼──────────┼──────────┤
│ LCP         │ Largest Contentful Paint      │ < 2.5s   │ > 4.0s   │
│             │ (time to see main content)    │          │          │
├─────────────┼───────────────────────────────┼──────────┼──────────┤
│ INP         │ Interaction to Next Paint     │ < 200ms  │ > 500ms  │
│             │ (response to user input)      │          │          │
├─────────────┼───────────────────────────────┼──────────┼──────────┤
│ CLS         │ Cumulative Layout Shift       │ < 0.1    │ > 0.25   │
│             │ (visual stability)            │          │          │
└─────────────┴───────────────────────────────┴──────────┴──────────┘
```

### What Causes Poor Scores

```
POOR LCP:
├── Large unoptimized images
├── Render-blocking CSS/JS
├── Slow server response
└── Client-side rendering without SSR

POOR INP:
├── Long JavaScript tasks (> 50ms)
├── Heavy re-renders
├── Synchronous operations on main thread
└── Unoptimized event handlers

POOR CLS:
├── Images without width/height
├── Dynamically injected content
├── Web fonts causing text shift (FOUT)
└── Ads/embeds without reserved space
```

---

## Measuring Performance

### Browser DevTools

```
Chrome DevTools:
├── Performance tab → Record → Interact → Stop → Analyze
├── Lighthouse tab  → Generate report (scores + recommendations)
├── Network tab     → Check file sizes, loading waterfall
└── Coverage tab    → Find unused CSS/JS
```

### React DevTools Profiler

```
1. Install React DevTools browser extension
2. Open DevTools → ⚛️ Profiler tab
3. Click "Record" → interact with your app → "Stop"
4. Shows:
   ├── Which components rendered
   ├── How long each render took
   ├── WHY each component rendered
   └── Flame chart of render hierarchy
```

### Web Vitals in Code

```jsx
// Track Core Web Vitals
import { onLCP, onINP, onCLS } from "web-vitals";

onLCP(console.log);    // Largest Contentful Paint
onINP(console.log);    // Interaction to Next Paint
onCLS(console.log);    // Cumulative Layout Shift
```

---

## React Rendering — How It Works

```
RENDER PHASE (Pure, no side effects):
1. State or props change
2. React calls your component function
3. Component returns JSX (virtual DOM)
4. React compares new virtual DOM with previous (diffing)

COMMIT PHASE (Touches the DOM):
5. React applies minimal changes to real DOM
6. useEffect/useLayoutEffect run

KEY INSIGHT:
"Rendering" = calling your function
"Rendering" ≠ updating the DOM

A component can render without the DOM changing (if output is same)
```

### What Triggers a Re-render?

```
1. setState() called                → component re-renders
2. Parent re-renders                → ALL children re-render
3. Context value changes            → ALL consumers re-render
4. Custom hook state changes        → component using it re-renders

DOES NOT trigger re-render:
├── useRef.current changes
├── Variables outside React
└── Props changes (only if parent re-renders)
```

---

## Preventing Unnecessary Re-renders

### React.memo — Skip Re-render If Props Haven't Changed

```jsx
import { memo } from "react";

// Without memo: re-renders every time parent renders
// With memo: only re-renders if props change
const ProductCard = memo(function ProductCard({ product }) {
    console.log(`Rendering ${product.name}`);  // check when it renders
    return (
        <div className="card">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
        </div>
    );
});

function ProductList({ products }) {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div>
            {/* Typing here re-renders ProductList */}
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

            {/* Without memo: ALL ProductCards re-render on every keystroke */}
            {/* With memo: ProductCards DON'T re-render (same props) */}
            {products.map(p => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    );
}
```

### useMemo + useCallback with memo

```jsx
const ExpensiveChild = memo(function ExpensiveChild({ items, onSelect }) {
    return (
        <ul>
            {items.map(item => (
                <li key={item.id} onClick={() => onSelect(item.id)}>
                    {item.name}
                </li>
            ))}
        </ul>
    );
});

function Parent() {
    const [query, setQuery] = useState("");
    const [data, setData] = useState([]);

    // ✅ Memoize derived data
    const filteredItems = useMemo(() =>
        data.filter(item => item.name.includes(query)),
        [data, query]
    );

    // ✅ Memoize callback
    const handleSelect = useCallback((id) => {
        console.log("Selected:", id);
    }, []);

    return (
        <div>
            <input value={query} onChange={e => setQuery(e.target.value)} />
            <ExpensiveChild items={filteredItems} onSelect={handleSelect} />
        </div>
    );
}
```

### When NOT to Optimize

```
❌ Don't use memo/useMemo/useCallback:
├── For simple components (overhead > benefit)
├── When props change every render anyway
├── When you haven't measured a problem
├── For components that render fast already
└── "Premature optimization is the root of all evil"

✅ Use when:
├── Component renders often with same props
├── Component is expensive (large list, heavy calculation)
├── React Profiler shows unnecessary re-renders
├── You've measured a real performance issue
```

---

## Code Splitting & Lazy Loading

### React.lazy + Suspense

```jsx
import { lazy, Suspense } from "react";

// Components are loaded ON DEMAND (separate JS chunk)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function App() {
    return (
        <Suspense fallback={<div className="loading">Loading...</div>}>
            <Routes>
                <Route path="/" element={<Home />} />           {/* always loaded */}
                <Route path="/dashboard" element={<Dashboard />} /> {/* loaded when visited */}
                <Route path="/settings" element={<Settings />} />   {/* loaded when visited */}
                <Route path="/admin" element={<AdminPanel />} />    {/* loaded when visited */}
            </Routes>
        </Suspense>
    );
}
```

### How It Works

```
WITHOUT code splitting:
├── bundle.js (500KB) — ALL pages loaded upfront
└── User waits for everything to download

WITH code splitting:
├── bundle.js (100KB) — core app + home page
├── dashboard.chunk.js (80KB) — loaded when visiting /dashboard
├── settings.chunk.js (50KB) — loaded when visiting /settings
└── admin.chunk.js (120KB) — loaded when visiting /admin
    User only downloads what they need!
```

### Lazy Loading Components

```jsx
// Heavy component loaded only when needed
const HeavyChart = lazy(() => import("./components/HeavyChart"));

function Dashboard() {
    const [showChart, setShowChart] = useState(false);

    return (
        <div>
            <button onClick={() => setShowChart(true)}>Show Analytics</button>

            {showChart && (
                <Suspense fallback={<p>Loading chart...</p>}>
                    <HeavyChart />
                </Suspense>
            )}
        </div>
    );
}
```

---

## Image Optimization

### Responsive Images

```html
<!-- Serve different sizes based on screen width -->
<img
    srcset="
        /images/hero-400w.webp 400w,
        /images/hero-800w.webp 800w,
        /images/hero-1200w.webp 1200w
    "
    sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
    src="/images/hero-800w.webp"
    alt="Hero image"
    width="1200"
    height="600"
    loading="lazy"
/>
```

### Lazy Loading Images

```html
<!-- Native lazy loading — images load when near viewport -->
<img src="photo.jpg" alt="Photo" loading="lazy" width="400" height="300" />

<!-- Eager loading for above-the-fold images -->
<img src="hero.jpg" alt="Hero" loading="eager" width="1200" height="600" />
```

### Always Set Width and Height

```html
<!-- ✅ Prevents CLS (Cumulative Layout Shift) -->
<img src="photo.jpg" alt="Photo" width="400" height="300" />

<!-- ❌ No dimensions = layout shift when image loads -->
<img src="photo.jpg" alt="Photo" />
```

### Modern Image Formats

```
FORMAT COMPARISON:
├── JPEG   → Photos, good quality, no transparency
├── PNG    → Screenshots, transparency, lossless
├── WebP   → 25-35% smaller than JPEG/PNG, wide support
├── AVIF   → 50% smaller than JPEG, growing support
└── SVG    → Icons, logos, scalable, tiny file size
```

```html
<!-- <picture> with fallback -->
<picture>
    <source srcset="image.avif" type="image/avif" />
    <source srcset="image.webp" type="image/webp" />
    <img src="image.jpg" alt="Fallback" width="800" height="600" />
</picture>
```

---

## List Virtualization

When rendering large lists (1000+ items), only render what's **visible in the viewport**.

```bash
npm install @tanstack/react-virtual
```

```jsx
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

function VirtualList({ items }) {
    const parentRef = useRef(null);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50,   // estimated row height in px
    });

    return (
        <div
            ref={parentRef}
            style={{ height: "500px", overflow: "auto" }}
        >
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    position: "relative"
                }}
            >
                {virtualizer.getVirtualItems().map(virtualRow => (
                    <div
                        key={virtualRow.key}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`
                        }}
                    >
                        {items[virtualRow.index].name}
                    </div>
                ))}
            </div>
        </div>
    );
}
```

```
WITHOUT VIRTUALIZATION:
10,000 items → 10,000 DOM nodes → slow rendering, high memory

WITH VIRTUALIZATION:
10,000 items → ~20 DOM nodes (visible ones) → fast, low memory
Items outside viewport are NOT rendered
```

---

## Bundle Size Optimization

### Analyze Bundle

```bash
# Vite
npx vite-bundle-visualizer

# Shows treemap of what's in your bundle
```

### Tree Shaking — Import Only What You Need

```javascript
// ❌ BAD: imports entire library
import _ from "lodash";              // 71KB gzipped!
_.debounce(fn, 300);

// ✅ GOOD: import just the function
import debounce from "lodash/debounce";  // 1KB gzipped

// ✅ BETTER: write your own
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
```

### Dynamic Imports

```javascript
// ❌ Always loaded
import { processData } from "./heavyProcessor";

// ✅ Loaded only when needed
async function handleProcess() {
    const { processData } = await import("./heavyProcessor");
    processData(data);
}
```

### Common Bundle Size Savings

```
REPLACE                          WITH                    SAVE
─────────────────────────────────────────────────────────────
moment.js (67KB gz)         →  date-fns (tree-shakeable)  ~60KB
lodash (72KB gz)            →  lodash-es or native JS     ~70KB
axios (14KB gz)             →  fetch (built-in)           ~14KB
react-icons (all)           →  @react-icons/all-files     varies
```

---

## Network Performance

### Preloading Critical Resources

```html
<head>
    <!-- Preload critical assets -->
    <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/hero-image.webp" as="image" />

    <!-- Prefetch next page (likely navigation) -->
    <link rel="prefetch" href="/dashboard.js" />

    <!-- Preconnect to API domain -->
    <link rel="preconnect" href="https://api.example.com" />
    <link rel="dns-prefetch" href="https://api.example.com" />
</head>
```

### Caching with Service Worker

```javascript
// Basic caching strategy
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request);
        })
    );
});
```

---

## Web Workers

Move heavy computation **off the main thread** so UI stays responsive.

```javascript
// worker.js
self.onmessage = function (e) {
    const { data } = e;

    // Heavy computation here — doesn't block UI
    const result = processLargeDataset(data);

    self.postMessage(result);
};

function processLargeDataset(data) {
    // ... expensive operation
    return data.map(item => ({ ...item, processed: true }));
}
```

```jsx
// Component
function DataProcessor() {
    const [result, setResult] = useState(null);

    function handleProcess(data) {
        const worker = new Worker(new URL("./worker.js", import.meta.url));

        worker.onmessage = (e) => {
            setResult(e.data);
            worker.terminate();
        };

        worker.postMessage(data);
    }

    return (
        <div>
            <button onClick={() => handleProcess(largeDataset)}>Process</button>
            {result && <ResultDisplay data={result} />}
        </div>
    );
}
```

---

## Performance Checklist

```
LOADING:
✅ Code split routes with React.lazy
✅ Lazy load images (loading="lazy")
✅ Set width/height on images (prevent CLS)
✅ Use WebP/AVIF image formats
✅ Preload critical fonts and images
✅ Preconnect to API domains

RENDERING:
✅ Use React.memo for expensive components
✅ Memoize expensive calculations with useMemo
✅ Stabilize callbacks with useCallback
✅ Virtualize long lists (1000+ items)
✅ Debounce expensive event handlers (search, resize)

BUNDLE:
✅ Analyze bundle size (vite-bundle-visualizer)
✅ Tree-shake imports (import only what you need)
✅ Dynamic import heavy libraries
✅ Replace heavy libraries with lighter alternatives

NETWORK:
✅ Cache API responses (React Query staleTime)
✅ Use CDN for static assets
✅ Compress assets (gzip/brotli)
✅ Minimize HTTP requests
```

---

## Key Takeaways

1. **Measure before optimizing** — use Lighthouse, React Profiler, bundle analyzer
2. **Core Web Vitals (LCP, INP, CLS)** directly impact SEO and user experience
3. **Code split by route** with `React.lazy` — users only download what they visit
4. **`React.memo`** prevents re-renders when props haven't changed
5. **`useMemo` and `useCallback`** complement `React.memo` — stabilize props
6. **Lazy load images** with `loading="lazy"` — always set `width`/`height`
7. **Virtualize large lists** — only render visible items (TanStack Virtual)
8. **Import specifically**, not everything — `import debounce from "lodash/debounce"`
9. **Use modern image formats** (WebP/AVIF) — 25-50% smaller than JPEG/PNG
10. **Don't optimize everything** — premature optimization adds complexity without benefit

---

## Practice Exercises

1. **Audit your app with Lighthouse** — achieve score > 90 on Performance
2. **Add code splitting** — lazy load 3+ routes, show Suspense fallback
3. **Optimize a list** — render 10,000 items using TanStack Virtual
4. **Analyze and reduce bundle size** — use vite-bundle-visualizer, find and remove bloat
5. **Optimize images** — convert to WebP, add responsive srcset, lazy load below-the-fold images

---

**Previous:** [← Phase 15 — Testing Frontend Applications](Phase-15-Testing-Frontend.md)
**Next:** [Phase 17 — Accessibility (a11y) →](Phase-17-Accessibility.md)
