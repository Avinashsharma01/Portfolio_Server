# Phase 06 — CSS Architecture & Modern CSS

## Table of Contents

- [Why CSS Architecture Matters](#why-css-architecture-matters)
- [CSS Methodologies — BEM](#css-methodologies--bem)
- [CSS Modules](#css-modules)
- [CSS-in-JS Overview](#css-in-js-overview)
- [Utility-First CSS (Tailwind Concepts)](#utility-first-css-tailwind-concepts)
- [CSS Reset & Normalize](#css-reset--normalize)
- [Modern CSS Features](#modern-css-features)
- [Logical Properties](#logical-properties)
- [CSS Nesting](#css-nesting)
- [Layers & @layer](#layers--layer)
- [Organizing CSS Files](#organizing-css-files)
- [Key Takeaways](#key-takeaways)

---

## Why CSS Architecture Matters

On small projects, CSS seems easy. On large projects, it becomes a nightmare without structure:

```
SMALL PROJECT:
styles.css (200 lines) → Easy to manage

LARGE PROJECT WITHOUT ARCHITECTURE:
styles.css (5,000 lines)
├── Specificity wars (!important everywhere)
├── Dead CSS (afraid to delete anything)
├── Unintended side effects (changing one thing breaks another)
├── Duplicate styles (same button styled in 3 places)
└── No one knows what does what

LARGE PROJECT WITH ARCHITECTURE:
components/
├── Button.module.css (50 lines)
├── Card.module.css (40 lines)
├── Navbar.module.css (60 lines)
└── Modal.module.css (45 lines)
├── Scoped styles (can't leak)
├── Easy to find and modify
├── Safe to delete
└── No conflicts
```

### The Problems Architecture Solves

| Problem | Cause | Solution |
|---------|-------|----------|
| **Naming collisions** | Two `.title` classes in different components | BEM, CSS Modules, CSS-in-JS |
| **Specificity wars** | Overriding with `!important` chains | Flat selectors, consistent methodology |
| **Dead CSS** | Unused styles that no one dares remove | Component-scoped CSS |
| **Global side effects** | Changing `.card` affects cards everywhere | Scoped/modular CSS |
| **Duplication** | Same button styles in multiple files | Design tokens, utility classes |

---

## CSS Methodologies — BEM

**BEM** (Block, Element, Modifier) is the most popular CSS naming convention.

### The Pattern

```
.block {}              → The standalone component
.block__element {}     → A part of the component
.block--modifier {}    → A variation of the component
```

### Example

```html
<article class="card card--featured">
    <img class="card__image" src="photo.jpg" alt="Photo">
    <div class="card__body">
        <h2 class="card__title">Card Title</h2>
        <p class="card__text">Description text here.</p>
        <button class="card__button card__button--primary">Read More</button>
    </div>
</article>
```

```css
/* Block */
.card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}

/* Elements (parts of the card) */
.card__image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.card__body {
    padding: 1.5rem;
}

.card__title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
}

.card__text {
    color: #666;
}

.card__button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
}

/* Modifiers (variations) */
.card--featured {
    border-color: gold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card__button--primary {
    background: #3498db;
    color: white;
    border-color: #3498db;
}
```

### BEM Benefits

- **Flat specificity** — all selectors are single class names (0,0,1,0)
- **Self-documenting** — class names reveal the component structure
- **No conflicts** — `.card__title` won't clash with `.hero__title`
- **Easy to find** — search for `.card` to find all card-related styles

### BEM in Practice

```
DO:
.search-form {}
.search-form__input {}
.search-form__button {}
.search-form__button--disabled {}

DON'T:
.search-form__input__icon {}     ← Never nest elements in BEM names
.search-form .input {}            ← Avoid descendant selectors
#search-form {}                    ← Avoid IDs for styling
```

---

## CSS Modules

CSS Modules **automatically generate unique class names**, making styles local by default. They're built into most modern build tools (Vite, webpack, Next.js).

### How It Works

```
Button.module.css → .button → .Button_button_x7f3k (auto-generated unique class)
Card.module.css   → .button → .Card_button_a2b9z   (different unique class!)
```

### Usage

**Button.module.css:**
```css
.button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.primary {
    background: #3498db;
    color: white;
}

.secondary {
    background: transparent;
    border: 2px solid #3498db;
    color: #3498db;
}

.large {
    padding: 1rem 2rem;
    font-size: 1.2rem;
}
```

**Button.jsx (React):**
```jsx
import styles from "./Button.module.css";

function Button({ variant = "primary", size, children }) {
    const classNames = [
        styles.button,
        styles[variant],
        size === "large" ? styles.large : ""
    ].join(" ");

    return <button className={classNames}>{children}</button>;
}
```

### CSS Modules vs BEM

| Feature | BEM | CSS Modules |
|---------|-----|-------------|
| **Scoping** | Manual (naming convention) | Automatic (build tool generates unique classes) |
| **Learning curve** | Low | Low |
| **Build tool required** | No | Yes |
| **Dead CSS detection** | Manual | Build tool warns about unused imports |
| **Best for** | Any project | React/Vue/component frameworks |

---

## CSS-in-JS Overview

CSS-in-JS writes styles directly in JavaScript. The most popular libraries are **styled-components** and **Emotion**.

### styled-components Example

```jsx
import styled from "styled-components";

const Button = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.primary ? "#3498db" : "white"};
    color: ${props => props.primary ? "white" : "#3498db"};
    border: 2px solid #3498db;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;

    &:hover {
        opacity: 0.9;
    }
`;

// Usage
<Button primary>Click Me</Button>
<Button>Secondary</Button>
```

### CSS-in-JS Pros & Cons

| Pros | Cons |
|------|------|
| ✅ Truly scoped (no conflicts) | ❌ Runtime cost (generates CSS at runtime) |
| ✅ Dynamic styles based on props | ❌ Larger bundle size |
| ✅ Dead CSS elimination automatic | ❌ Not compatible with server components |
| ✅ Great developer experience | ❌ Vendor lock-in |

> **Trend Note:** The React ecosystem is moving **away** from CSS-in-JS runtime libraries toward CSS Modules and utility CSS. Server Components don't support runtime CSS-in-JS.

---

## Utility-First CSS (Tailwind Concepts)

Utility-first CSS uses small, single-purpose classes instead of writing custom CSS:

### The Concept

```html
<!-- Traditional CSS -->
<button class="primary-button">Click</button>

<!-- Utility-first CSS -->
<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
    Click
</button>
```

### Common Utility Patterns

```css
/* Spacing */
.p-4  { padding: 1rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.gap-4 { gap: 1rem; }

/* Layout */
.flex { display: flex; }
.grid { display: grid; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }

/* Typography */
.text-lg { font-size: 1.125rem; }
.font-bold { font-weight: 700; }
.text-gray-600 { color: #4b5563; }

/* Responsive (prefix with breakpoint) */
.md:flex-row { } /* applies at medium screens and up */
.lg:grid-cols-3 { }
```

### When to Use What

| Approach | Best For |
|----------|----------|
| **BEM** | Teams without build tools, simple projects |
| **CSS Modules** | React/Vue components, medium-large projects |
| **Utility CSS (Tailwind)** | Rapid prototyping, design-system-driven projects |
| **CSS-in-JS** | Dynamic themes, highly interactive UIs |

---

## CSS Reset & Normalize

### CSS Reset (Zero Everything)

```css
/* Modern CSS Reset by Andy Bell */
*,
*::before,
*::after {
    box-sizing: border-box;
}

* {
    margin: 0;
    padding: 0;
}

html {
    -moz-text-size-adjust: none;
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
}

body {
    min-height: 100vh;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
}

img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
}

input, button, textarea, select {
    font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
    overflow-wrap: break-word;
}
```

### Why Reset?

Different browsers have different default styles. A reset ensures consistent starting point:

```
WITHOUT RESET:
Chrome <h1> = 32px, 0.67em margin
Firefox <h1> = 32px, 0.67em margin
Safari <h1> = 32px, 0.67em margin (mostly same, but small differences exist)

WITH RESET:
All browsers: <h1> starts with your defined styles
```

---

## Modern CSS Features

### `:is()` and `:where()` Selectors

```css
/* ❌ Without :is() — repetitive */
article h1,
article h2,
article h3,
section h1,
section h2,
section h3 {
    color: #333;
}

/* ✅ With :is() — clean */
:is(article, section) :is(h1, h2, h3) {
    color: #333;
}

/* :where() — same but ZERO specificity */
:where(article, section) :is(h1, h2, h3) {
    color: #333;
    /* Easy to override because :where has 0 specificity */
}
```

### `:has()` — The Parent Selector

```css
/* Style a card differently if it contains an image */
.card:has(img) {
    grid-template-rows: 200px 1fr;
}

/* Style a form group when its input is invalid */
.form-group:has(input:invalid) {
    border-color: red;
}

/* Style a page if a dark-mode checkbox is checked */
html:has(#dark-mode:checked) {
    --bg: #1a1a1a;
    --text: #eee;
}
```

### `color-mix()`

```css
/* Mix two colors */
.button:hover {
    background: color-mix(in srgb, var(--color-primary) 80%, black);
    /* Darkens primary color by mixing with 20% black */
}

.button:active {
    background: color-mix(in srgb, var(--color-primary) 70%, black);
}
```

### Subgrid

```css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

/* Child inherits parent's grid lines */
.card {
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 3;  /* card spans 3 rows aligned with siblings */
}
```

---

## Logical Properties

Logical properties work with **writing direction** instead of physical direction. They support left-to-right AND right-to-left languages:

```css
/* Physical (left-to-right only) */
margin-left: 1rem;
margin-right: 1rem;
padding-top: 1rem;
padding-bottom: 1rem;
border-left: 2px solid blue;
text-align: left;

/* Logical (works in any writing direction) */
margin-inline-start: 1rem;
margin-inline-end: 1rem;
padding-block-start: 1rem;
padding-block-end: 1rem;
border-inline-start: 2px solid blue;
text-align: start;

/* Shorthand */
margin-inline: 1rem;      /* left + right */
padding-block: 1rem;       /* top + bottom */
```

### Mapping

| Physical | Logical (for LTR) | Axis |
|----------|-------------------|------|
| `left` / `right` | `inline-start` / `inline-end` | Inline (text direction) |
| `top` / `bottom` | `block-start` / `block-end` | Block (vertical) |
| `width` | `inline-size` | Inline |
| `height` | `block-size` | Block |

---

## CSS Nesting

Native CSS nesting is now supported in browsers — no preprocessor needed:

```css
/* Nested CSS (native — no Sass required!) */
.card {
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;

    /* Nested element */
    & .card-title {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
    }

    & .card-text {
        color: #666;
    }

    /* Nested pseudo-class */
    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    /* Nested media query */
    @media (min-width: 768px) {
        display: flex;
        gap: 1rem;
    }
}
```

---

## Layers & @layer

`@layer` controls the **cascade order** of your CSS, regardless of source order or specificity:

```css
/* Define layer order (first = lowest priority, last = highest) */
@layer reset, base, components, utilities;

/* Reset layer — lowest priority */
@layer reset {
    * { margin: 0; padding: 0; box-sizing: border-box; }
}

/* Base layer */
@layer base {
    body { font-family: system-ui; color: #333; }
    a { color: #3498db; }
}

/* Components */
@layer components {
    .card { border: 1px solid #ddd; padding: 1rem; }
    .button { padding: 0.5rem 1rem; }
}

/* Utilities — highest priority (always wins) */
@layer utilities {
    .hidden { display: none; }
    .text-center { text-align: center; }
}
```

> Styles in later layers always beat styles in earlier layers, regardless of specificity. This eliminates specificity wars.

---

## Organizing CSS Files

### Recommended Structure for Medium Projects

```
styles/
├── reset.css          ← CSS reset / normalize
├── variables.css      ← Design tokens (colors, spacing, fonts)
├── base.css           ← Global element styles (body, headings, links)
├── components/        ← Component-specific styles
│   ├── Button.css
│   ├── Card.css
│   ├── Navbar.css
│   ├── Modal.css
│   └── Form.css
├── layouts/           ← Page layout styles
│   ├── Header.css
│   ├── Sidebar.css
│   └── Footer.css
├── pages/             ← Page-specific overrides
│   ├── home.css
│   └── about.css
└── utilities.css      ← Utility classes (.hidden, .sr-only, .text-center)
```

### Design Tokens (Variables File)

```css
/* variables.css */
:root {
    /* Colors */
    --color-primary: hsl(210, 100%, 56%);
    --color-secondary: hsl(145, 63%, 49%);
    --color-danger: hsl(0, 78%, 62%);
    --color-text: hsl(0, 0%, 20%);
    --color-text-light: hsl(0, 0%, 46%);
    --color-bg: hsl(0, 0%, 100%);
    --color-surface: hsl(0, 0%, 97%);
    --color-border: hsl(0, 0%, 87%);

    /* Typography */
    --font-body: "Inter", system-ui, sans-serif;
    --font-heading: "Inter", system-ui, sans-serif;
    --font-mono: "JetBrains Mono", monospace;

    /* Spacing scale */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;

    /* Border radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);

    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 300ms ease;
}
```

---

## Key Takeaways

1. **CSS architecture prevents specificity wars** — choose BEM, CSS Modules, or utility CSS
2. **BEM is great for any project** — `.block__element--modifier` naming is clear and flat
3. **CSS Modules auto-scope styles** — perfect for component frameworks like React
4. **Utility CSS (Tailwind)** speeds up development but can clutter HTML
5. **CSS-in-JS is losing popularity** — prefer CSS Modules for new projects
6. **Always use a CSS reset** — ensures consistent cross-browser starting point
7. **`:has()` is the parent selector** CSS has been waiting for — game changer
8. **`@layer` controls cascade order** — eliminates specificity issues at scale
9. **CSS nesting is now native** — no preprocessor needed for basic nesting
10. **Design tokens (CSS variables)** in a central file keep your design consistent

---

## Practice Exercises

1. **Refactor a project to BEM** — take an existing CSS file and rename classes using BEM
2. **Convert a component to CSS Modules** — create a Button and Card with `.module.css`
3. **Build a design system** — create a `variables.css` with colors, spacing, typography, and shadows
4. **Use `:has()` creatively** — style a parent based on input state, checkbox state, or child content
5. **Implement `@layer`** — organize a stylesheet into reset, base, components, and utilities layers

---

**Previous:** [← Phase 05 — Responsive Design & Layouts](Phase-05-Responsive-Design-Layouts.md)
**Next:** [Phase 07 — JavaScript ES6+ Deep Dive →](Phase-07-JavaScript-ES6-Deep-Dive.md)
