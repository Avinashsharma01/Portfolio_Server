# Phase 05 — Responsive Design & Layouts

## Table of Contents

- [What is Responsive Design?](#what-is-responsive-design)
- [The Viewport Meta Tag](#the-viewport-meta-tag)
- [Mobile-First vs Desktop-First](#mobile-first-vs-desktop-first)
- [Media Queries](#media-queries)
- [Responsive Typography](#responsive-typography)
- [Responsive Images](#responsive-images)
- [Flexbox Layouts in Practice](#flexbox-layouts-in-practice)
- [CSS Grid Layouts in Practice](#css-grid-layouts-in-practice)
- [Common Layout Patterns](#common-layout-patterns)
- [Container Queries](#container-queries)
- [Key Takeaways](#key-takeaways)

---

## What is Responsive Design?

Responsive design means your website **adapts to any screen size** — phone, tablet, laptop, or ultrawide monitor. One codebase, infinite screen sizes.

```
WITHOUT RESPONSIVE DESIGN:
┌───────┐  ┌───────────────┐  ┌─────────────────────────┐
│ Phone │  │    Tablet     │  │       Desktop           │
│       │  │               │  │                         │
│ Tiny  │  │  Stretched    │  │  Content looks fine     │
│ text  │  │  awkwardly    │  │  but designed only      │
│ can't │  │  unreadable   │  │  for this size          │
│ read  │  │               │  │                         │
└───────┘  └───────────────┘  └─────────────────────────┘

WITH RESPONSIVE DESIGN:
┌───────┐  ┌───────────────┐  ┌─────────────────────────┐
│ Phone │  │    Tablet     │  │       Desktop           │
│       │  │               │  │                         │
│ Stack │  │ 2-column      │  │  3-column layout        │
│ every │  │ layout,       │  │  Full nav bar,          │
│ thing │  │ adapted nav   │  │  hero section,          │
│ vert. │  │               │  │  sidebar                │
└───────┘  └───────────────┘  └─────────────────────────┘
```

### Three Core Principles

1. **Fluid grids** — use percentages and `fr` units, not fixed pixels
2. **Flexible media** — images and videos scale with their container
3. **Media queries** — apply different CSS at different screen widths

---

## The Viewport Meta Tag

This tag is **required** for responsive design to work on mobile:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

| Attribute | What It Does |
|-----------|-------------|
| `width=device-width` | Uses the device's actual width (not a zoomed-out desktop view) |
| `initial-scale=1.0` | Sets the initial zoom level to 100% |

### Without vs With the Viewport Tag

```
WITHOUT viewport meta tag:
Phone renders page at ~980px wide (desktop width)
→ Everything is tiny → User must pinch-zoom

WITH viewport meta tag:
Phone renders page at ~375px wide (actual phone width)
→ Content is readable → CSS media queries work correctly
```

> **Always include this tag.** Without it, your responsive CSS won't work on mobile devices.

---

## Mobile-First vs Desktop-First

### Mobile-First (RECOMMENDED)

Write base styles for mobile, then add styles for larger screens:

```css
/* Base styles — mobile (small screens) */
.container {
    padding: 1rem;
}

.grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
    .grid {
        flex-direction: row;
        flex-wrap: wrap;
    }
    .grid > * {
        flex: 1 1 45%;
    }
}

/* Desktop and up */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }
    .grid > * {
        flex: 1 1 30%;
    }
}
```

### Desktop-First

Write base styles for desktop, then override for smaller screens:

```css
/* Base styles — desktop */
.grid {
    display: flex;
    gap: 2rem;
}
.grid > * {
    flex: 1 1 30%;
}

/* Tablet and down */
@media (max-width: 1023px) {
    .grid > * {
        flex: 1 1 45%;
    }
}

/* Mobile */
@media (max-width: 767px) {
    .grid {
        flex-direction: column;
    }
}
```

### Why Mobile-First is Better

| Aspect | Mobile-First | Desktop-First |
|--------|-------------|---------------|
| **Progressive Enhancement** | ✅ Adds complexity as screen grows | ❌ Strips complexity for small screens |
| **Performance** | ✅ Mobile loads only mobile CSS | ❌ Mobile downloads desktop CSS too |
| **Simplicity** | ✅ Start simple, add features | ❌ Start complex, override features |
| **Modern trend** | ✅ Most traffic is mobile | ❌ Legacy approach |

---

## Media Queries

### Syntax

```css
@media (condition) {
    /* Styles that apply when condition is true */
}
```

### Common Breakpoints

```css
/* Mobile first breakpoints */
/* No media query needed — base styles ARE the mobile styles */

/* Small tablets */
@media (min-width: 640px) { }

/* Tablets */
@media (min-width: 768px) { }

/* Small desktops / laptops */
@media (min-width: 1024px) { }

/* Large desktops */
@media (min-width: 1280px) { }

/* Extra large screens */
@media (min-width: 1536px) { }
```

### Media Query Features

```css
/* Width */
@media (min-width: 768px) { }
@media (max-width: 767px) { }
@media (min-width: 768px) and (max-width: 1023px) { }

/* Orientation */
@media (orientation: portrait) { }
@media (orientation: landscape) { }

/* Hover capability (touchscreen vs mouse) */
@media (hover: hover) {
    /* Device has a mouse — show hover effects */
    .card:hover { transform: translateY(-4px); }
}

@media (hover: none) {
    /* Touchscreen — no hover, use tap effects */
}

/* Prefers reduced motion (accessibility) */
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}

/* Dark mode preference */
@media (prefers-color-scheme: dark) {
    :root {
        --bg: #1a1a1a;
        --text: #eee;
    }
}

@media (prefers-color-scheme: light) {
    :root {
        --bg: #fff;
        --text: #333;
    }
}
```

### Media Query Range Syntax (Modern)

```css
/* Old syntax */
@media (min-width: 768px) and (max-width: 1023px) { }

/* New range syntax (supported in modern browsers) */
@media (768px <= width < 1024px) { }
@media (width >= 1024px) { }
```

---

## Responsive Typography

### Fluid Typography with `clamp()`

```css
/* clamp(minimum, preferred, maximum) */
h1 {
    font-size: clamp(1.5rem, 4vw, 3rem);
    /* Minimum: 1.5rem (24px)
       Scales with viewport: 4vw
       Maximum: 3rem (48px) */
}

body {
    font-size: clamp(1rem, 1vw + 0.75rem, 1.25rem);
}
```

### Responsive Type Scale

```css
:root {
    --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
    --step-1: clamp(1.125rem, 1.05rem + 0.4vw, 1.35rem);
    --step-2: clamp(1.266rem, 1.15rem + 0.6vw, 1.62rem);
    --step-3: clamp(1.424rem, 1.25rem + 0.9vw, 1.944rem);
    --step-4: clamp(1.602rem, 1.35rem + 1.25vw, 2.333rem);
}

body { font-size: var(--step-0); }
h4 { font-size: var(--step-1); }
h3 { font-size: var(--step-2); }
h2 { font-size: var(--step-3); }
h1 { font-size: var(--step-4); }
```

### Maximum Line Length

```css
/* Optimal reading width: 45-75 characters per line */
p, li {
    max-width: 65ch;  /* ch = width of the "0" character */
}

.article-content {
    max-width: 70ch;
    margin: 0 auto;
    padding: 0 1rem;
}
```

---

## Responsive Images

### Fluid Images (Basic)

```css
/* Make all images responsive by default */
img {
    max-width: 100%;   /* never wider than container */
    height: auto;       /* maintain aspect ratio */
    display: block;     /* remove bottom gap */
}
```

### Responsive Images with `srcset`

```html
<!-- Browser picks the best image based on screen size and resolution -->
<img
    src="hero-800.jpg"
    srcset="hero-400.jpg 400w,
            hero-800.jpg 800w,
            hero-1200.jpg 1200w,
            hero-1600.jpg 1600w"
    sizes="(max-width: 600px) 100vw,
           (max-width: 1200px) 50vw,
           33vw"
    alt="Hero image"
>
```

### Art Direction with `<picture>`

```html
<!-- Different images for different screens (not just different sizes) -->
<picture>
    <!-- Portrait crop for mobile -->
    <source media="(max-width: 767px)" srcset="hero-portrait.jpg">
    <!-- Square crop for tablet -->
    <source media="(max-width: 1023px)" srcset="hero-square.jpg">
    <!-- Landscape for desktop -->
    <img src="hero-landscape.jpg" alt="Hero image">
</picture>
```

### Responsive Background Images

```css
.hero {
    background-image: url("hero-mobile.jpg");
    background-size: cover;
    background-position: center;
}

@media (min-width: 768px) {
    .hero {
        background-image: url("hero-desktop.jpg");
    }
}

/* Modern: use image-set for resolution switching */
.hero {
    background-image: image-set(
        url("hero-1x.jpg") 1x,
        url("hero-2x.jpg") 2x
    );
}
```

### Responsive Video

```css
/* Responsive video container (16:9 aspect ratio) */
.video-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;  /* modern approach */
}

.video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
```

---

## Flexbox Layouts in Practice

### Responsive Navigation

```css
.navbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
}

.nav-links {
    display: flex;
    gap: 1rem;
    list-style: none;
}

/* Mobile: stack nav below logo */
@media (max-width: 767px) {
    .navbar {
        flex-direction: column;
        gap: 1rem;
    }

    .nav-links {
        flex-direction: column;
        width: 100%;
        text-align: center;
    }
}
```

### Card Layout That Wraps

```css
.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.card {
    flex: 1 1 300px;   /* grow, shrink, minimum 300px before wrapping */
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
}
```

### Holy Grail Layout with Flexbox

```css
.page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.page-header { padding: 1rem; }
.page-footer { padding: 1rem; }

.page-body {
    display: flex;
    flex: 1;
    gap: 1rem;
    padding: 1rem;
}

.page-main { flex: 1; }
.page-sidebar { flex: 0 0 250px; }

@media (max-width: 767px) {
    .page-body {
        flex-direction: column;
    }
    .page-sidebar {
        flex-basis: auto;
    }
}
```

---

## CSS Grid Layouts in Practice

### Auto-Fit Responsive Grid (No Media Queries!)

```css
/* Cards automatically wrap to next row when they can't fit */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}
```

### `auto-fit` vs `auto-fill`

```css
/* auto-fit: stretches items to fill empty space */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
/* 3 items in a wide row → items stretch to fill */

/* auto-fill: preserves empty column tracks */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
/* 3 items in a wide row → empty space remains */
```

> **Use `auto-fit` for most cases** — it stretches items to fill available space.

### Full Page Layout with Grid

```css
.page {
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
        "header header"
        "sidebar main"
        "footer footer";
    min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }

/* Mobile: stack everything */
@media (max-width: 767px) {
    .page {
        grid-template-columns: 1fr;
        grid-template-areas:
            "header"
            "main"
            "sidebar"
            "footer";
    }
}
```

### Magazine / Blog Layout

```css
.blog-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

/* Featured post spans 2 columns and 2 rows */
.post-featured {
    grid-column: span 2;
    grid-row: span 2;
}

@media (max-width: 768px) {
    .blog-grid {
        grid-template-columns: 1fr;
    }
    .post-featured {
        grid-column: span 1;
        grid-row: span 1;
    }
}
```

---

## Common Layout Patterns

### The Stack (Vertical Rhythm)

```css
/* Add consistent vertical spacing between siblings */
.stack > * + * {
    margin-top: 1.5rem;
}

/* Or use gap (modern) */
.stack {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
```

### The Sidebar Layout

```css
/* Sidebar + main content that wraps on small screens */
.with-sidebar {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.sidebar {
    flex: 1 1 250px;  /* sidebar wants 250px, can shrink */
}

.main-content {
    flex: 999 1 0%;   /* main grows to fill ALL remaining space */
    min-width: 60%;   /* if main can't get 60%, sidebar wraps below */
}
```

### The Center (Max-Width Container)

```css
.container {
    width: min(100% - 2rem, 1200px);
    margin-inline: auto;
}

/* Or the classic way */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}
```

### Pancake Stack (Header + Full Content + Footer)

```css
.pancake {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
}
```

---

## Container Queries

Container queries let you style elements based on their **parent container size** instead of the viewport.

```css
/* Define a containment context */
.card-container {
    container-type: inline-size;
    container-name: card;
}

/* Style based on container width (not viewport!) */
@container card (min-width: 400px) {
    .card {
        display: flex;
        gap: 1rem;
    }

    .card-image {
        width: 40%;
    }
}

@container card (min-width: 700px) {
    .card {
        padding: 2rem;
    }

    .card-title {
        font-size: 1.5rem;
    }
}
```

### Why Container Queries Matter

```
WITHOUT container queries:
├── Card in a sidebar (narrow) → media query says "desktop" → wrong layout
├── Same card in main content (wide) → media query says "desktop" → correct
└── You can't make one component adapt to its own context

WITH container queries:
├── Card in sidebar → container is narrow → stacks vertically ✅
├── Card in main → container is wide → displays horizontally ✅
└── Component adapts to WHERE it's placed, not just screen size
```

> Container queries are the future of responsive components. They make truly reusable components possible.

---

## Key Takeaways

1. **Always include the viewport meta tag** — responsive CSS won't work without it
2. **Mobile-first is the standard** — use `min-width` media queries
3. **Use `clamp()` for fluid typography** — no media queries needed for font sizes
4. **`auto-fit` + `minmax()` on Grid** creates responsive layouts without media queries
5. **Fluid images:** `max-width: 100%; height: auto;` on all images
6. **Use `srcset` and `sizes`** for performance — serve appropriately sized images
7. **Respect user preferences** — `prefers-reduced-motion`, `prefers-color-scheme`
8. **Container queries** make components responsive to their container, not the viewport
9. **Set `max-width: 65ch`** on text content for optimal reading width
10. **Test on real devices** — emulators are good, but real phones reveal real problems

---

## Practice Exercises

1. **Build a responsive portfolio page** — hero section, about, projects grid, contact form
2. **Create a responsive navigation** — horizontal on desktop, hamburger menu on mobile
3. **Build a dashboard layout** with CSS Grid — sidebar, header, main content, and widgets
4. **Implement fluid typography** using `clamp()` for all headings and body text
5. **Create a card component** that adapts with container queries — stacked on narrow, horizontal on wide

---

**Previous:** [← Phase 04 — JavaScript & The DOM](Phase-04-JavaScript-And-The-DOM.md)
**Next:** [Phase 06 — CSS Architecture & Modern CSS →](Phase-06-CSS-Architecture-Modern-CSS.md)
