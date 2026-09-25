# Phase 03 — CSS Fundamentals

## Table of Contents

- [What is CSS?](#what-is-css)
- [How to Add CSS](#how-to-add-css)
- [Selectors](#selectors)
- [The Cascade — How CSS Makes Decisions](#the-cascade--how-css-makes-decisions)
- [The Box Model](#the-box-model)
- [Colors & Backgrounds](#colors--backgrounds)
- [Typography](#typography)
- [Units — px, em, rem, %, vh/vw](#units--px-em-rem--vhvw)
- [Display Property](#display-property)
- [Positioning](#positioning)
- [Flexbox](#flexbox)
- [CSS Grid](#css-grid)
- [Transitions & Animations](#transitions--animations)
- [CSS Variables (Custom Properties)](#css-variables-custom-properties)
- [Key Takeaways](#key-takeaways)

---

## What is CSS?

CSS (**Cascading Style Sheets**) controls the **visual presentation** of HTML elements — colors, fonts, spacing, layout, animations, and responsiveness.

```
HTML = WHAT is on the page (structure)
CSS  = HOW it looks (presentation)
JS   = WHAT it does (behavior)
```

### Without CSS vs With CSS

```
WITHOUT CSS:                         WITH CSS:
┌─────────────────────────┐          ┌─────────────────────────┐
│ My Website              │          │  ┌───────────────────┐  │
│                         │          │  │   My Website      │  │
│ Welcome to my site.     │          │  │   ─────────────── │  │
│                         │          │  │   Welcome to my   │  │
│ About Contact           │          │  │   beautiful site  │  │
│                         │          │  └───────────────────┘  │
│ Footer text             │          │  [ About ] [ Contact ]  │
└─────────────────────────┘          │  ─────────────────────  │
                                     │  © 2025 Footer          │
Plain, ugly, default styles          └─────────────────────────┘
                                     Styled, professional, branded
```

---

## How to Add CSS

### Three Methods

```html
<!-- 1. INLINE — on a single element (avoid this) -->
<p style="color: red; font-size: 18px;">Hello</p>

<!-- 2. INTERNAL — in the <head> (for single-page styles) -->
<head>
    <style>
        p { color: red; }
    </style>
</head>

<!-- 3. EXTERNAL — separate .css file (BEST practice) -->
<head>
    <link rel="stylesheet" href="styles.css">
</head>
```

| Method | When To Use |
|--------|------------|
| **Inline** | Almost never — only for dynamic JS-set styles |
| **Internal** | Quick prototypes, email templates |
| **External** | Always — separates concerns, cacheable, reusable |

> **Rule:** Use external stylesheets. One `styles.css` file beats scattered inline styles everywhere.

---

## Selectors

Selectors determine **which elements** your CSS rules apply to.

### Basic Selectors

```css
/* Element selector — all <p> elements */
p {
    color: blue;
}

/* Class selector — elements with class="intro" */
.intro {
    font-size: 1.2rem;
}

/* ID selector — the ONE element with id="header" */
#header {
    background: #333;
}

/* Universal selector — ALL elements */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```

### Combinator Selectors

```css
/* Descendant — any <p> inside <article>, at any depth */
article p {
    line-height: 1.8;
}

/* Child — only direct <li> children of <ul> */
ul > li {
    list-style: none;
}

/* Adjacent sibling — <p> immediately after <h2> */
h2 + p {
    font-size: 1.1rem;
}

/* General sibling — all <p> that are siblings after <h2> */
h2 ~ p {
    color: #555;
}
```

### Attribute Selectors

```css
/* Has attribute */
[disabled] {
    opacity: 0.5;
}

/* Exact value */
[type="email"] {
    border-color: blue;
}

/* Starts with */
[href^="https"] {
    color: green;
}

/* Ends with */
[href$=".pdf"] {
    color: red;
}

/* Contains */
[class*="btn"] {
    cursor: pointer;
}
```

### Pseudo-Classes

```css
/* User interaction */
a:hover { color: red; }
a:active { color: darkred; }
a:focus { outline: 2px solid blue; }
a:visited { color: purple; }

/* Form states */
input:focus { border-color: blue; }
input:disabled { background: #eee; }
input:checked { accent-color: green; }
input:required { border-left: 3px solid red; }
input:valid { border-color: green; }
input:invalid { border-color: red; }

/* Structural */
li:first-child { font-weight: bold; }
li:last-child { border-bottom: none; }
li:nth-child(2n) { background: #f5f5f5; }  /* even items */
li:nth-child(odd) { background: white; }      /* odd items */
p:not(.intro) { font-size: 1rem; }
```

### Pseudo-Elements

```css
/* Before and after content */
.quote::before {
    content: "❝ ";
    color: #ccc;
}

.quote::after {
    content: " ❞";
    color: #ccc;
}

/* First line / first letter */
p::first-line {
    font-weight: bold;
}

p::first-letter {
    font-size: 2em;
    float: left;
}

/* Text selection highlight */
::selection {
    background: yellow;
    color: black;
}

/* Placeholder text */
input::placeholder {
    color: #999;
    font-style: italic;
}
```

---

## The Cascade — How CSS Makes Decisions

When multiple rules target the same element, CSS uses a **cascade** to decide which wins.

### Three Factors (in order of priority):

```
1. IMPORTANCE
   !important > normal rules
   (Avoid !important — it makes debugging a nightmare)

2. SPECIFICITY
   Inline style (1000) > ID (100) > Class (10) > Element (1)

3. SOURCE ORDER
   Later rules override earlier ones (if specificity is equal)
```

### Specificity Scoring

```
Selector                          Score
────────────────────────────────────────
p                                 0,0,0,1
.intro                            0,0,1,0
#header                           0,1,0,0
style="..."                       1,0,0,0

p.intro                           0,0,1,1
#header .nav a                    0,1,1,1
#header .nav a:hover              0,1,2,1

/* Higher score wins */
```

### Example

```css
p { color: blue; }           /* Specificity: 0,0,0,1 */
.intro { color: green; }     /* Specificity: 0,0,1,0 — WINS */
```

```html
<p class="intro">What color am I?</p>
<!-- Answer: GREEN (class beats element) -->
```

### Inheritance

Some CSS properties are **inherited** by child elements, others are not:

```
INHERITED (flow down to children):
├── color
├── font-family, font-size, font-weight
├── line-height
├── text-align
├── visibility
└── cursor

NOT INHERITED:
├── margin, padding
├── border
├── background
├── width, height
├── display
├── position
└── overflow
```

---

## The Box Model

**Every HTML element is a rectangular box.** The box model defines how space is calculated.

```
┌─────────────────────────────────────────────┐
│                  MARGIN                     │
│   ┌─────────────────────────────────────┐   │
│   │             BORDER                  │   │
│   │   ┌─────────────────────────────┐   │   │
│   │   │          PADDING            │   │   │
│   │   │   ┌─────────────────────┐   │   │   │
│   │   │   │                     │   │   │   │
│   │   │   │      CONTENT        │   │   │   │
│   │   │   │   (width × height)  │   │   │   │
│   │   │   │                     │   │   │   │
│   │   │   └─────────────────────┘   │   │   │
│   │   │                             │   │   │
│   │   └─────────────────────────────┘   │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### `content-box` vs `border-box`

```css
/* DEFAULT: content-box */
.box {
    width: 200px;
    padding: 20px;
    border: 5px solid black;
}
/* Total width = 200 + 20 + 20 + 5 + 5 = 250px — CONFUSING */

/* BETTER: border-box */
.box {
    box-sizing: border-box;
    width: 200px;
    padding: 20px;
    border: 5px solid black;
}
/* Total width = 200px — padding and border are INSIDE — INTUITIVE */
```

### The Universal Reset

```css
/* Apply border-box to everything — do this in EVERY project */
*,
*::before,
*::after {
    box-sizing: border-box;
}
```

> **Always use `box-sizing: border-box`.** It's the single most useful CSS reset.

---

## Colors & Backgrounds

### Color Formats

```css
/* Named colors */
color: red;
color: cornflowerblue;

/* Hex */
color: #ff0000;       /* red */
color: #f00;          /* shorthand red */
color: #ff000080;     /* red with 50% opacity */

/* RGB / RGBA */
color: rgb(255, 0, 0);
color: rgba(255, 0, 0, 0.5);   /* 50% opacity */

/* HSL / HSLA — most intuitive for humans */
color: hsl(0, 100%, 50%);      /* red */
color: hsl(120, 100%, 50%);    /* green */
color: hsl(240, 100%, 50%);    /* blue */
color: hsla(0, 100%, 50%, 0.5); /* 50% opacity red */
```

> **HSL is the best** for working with colors. H = hue (0-360°), S = saturation (0-100%), L = lightness (0-100%).

### Backgrounds

```css
/* Solid color */
background-color: #f5f5f5;

/* Image */
background-image: url("bg.jpg");
background-size: cover;        /* fill container */
background-position: center;
background-repeat: no-repeat;

/* Gradient */
background: linear-gradient(to right, #667eea, #764ba2);
background: radial-gradient(circle, #667eea, #764ba2);

/* Shorthand */
background: #f5f5f5 url("bg.jpg") no-repeat center / cover;
```

---

## Typography

```css
/* Font family — always provide fallbacks */
font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;

/* Font size */
font-size: 16px;    /* absolute */
font-size: 1rem;    /* relative to root (PREFERRED) */
font-size: 1.2em;   /* relative to parent */

/* Font weight */
font-weight: 400;   /* normal */
font-weight: 700;   /* bold */

/* Line height */
line-height: 1.6;   /* unitless — 1.6 × font-size */

/* Letter and word spacing */
letter-spacing: 0.05em;
word-spacing: 0.1em;

/* Text transform */
text-transform: uppercase;
text-transform: capitalize;
text-transform: lowercase;

/* Text decoration */
text-decoration: none;           /* remove underline */
text-decoration: underline wavy red;

/* Text alignment */
text-align: left;
text-align: center;
text-align: right;
text-align: justify;
```

### Loading Web Fonts

```css
/* Google Fonts — add to HTML <head> or @import in CSS */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

/* Self-hosted fonts — better performance */
@font-face {
    font-family: "CustomFont";
    src: url("fonts/custom.woff2") format("woff2"),
         url("fonts/custom.woff") format("woff");
    font-weight: 400;
    font-display: swap;  /* shows fallback font until custom loads */
}
```

---

## Units — px, em, rem, %, vh/vw

| Unit | Relative To | Best For |
|------|-------------|----------|
| `px` | Nothing (absolute) | Borders, shadows, fine detail |
| `em` | Parent's font-size | Component-level scaling |
| `rem` | Root (`<html>`) font-size | Font sizes, spacing (MOST USED) |
| `%` | Parent element | Widths, heights |
| `vw` | Viewport width | Full-width sections |
| `vh` | Viewport height | Full-height hero sections |
| `ch` | Width of "0" character | Max line length |
| `fr` | Fraction of available space | CSS Grid columns/rows |

### rem vs em

```css
/* rem — predictable, based on root (html) font size */
html { font-size: 16px; }
h1 { font-size: 2rem; }     /* Always 32px */
p { font-size: 1rem; }       /* Always 16px */

/* em — compounds with nesting (can be confusing) */
.parent { font-size: 20px; }
.child { font-size: 1.5em; }  /* 30px (1.5 × 20) */
.grandchild { font-size: 1.5em; }  /* 45px (1.5 × 30) — compounds! */
```

> **Use `rem` for most things.** Use `em` only when you want scaling relative to the parent.

---

## Display Property

```css
/* Block — takes full width, stacks vertically */
display: block;

/* Inline — takes content width, flows horizontally */
display: inline;

/* Inline-block — inline flow + block sizing (width/height work) */
display: inline-block;

/* None — completely removed from layout and accessibility */
display: none;

/* Flex — one-dimensional layout (row OR column) */
display: flex;

/* Grid — two-dimensional layout (rows AND columns) */
display: grid;
```

### `display: none` vs `visibility: hidden`

| Property | Element Space | Accessible | Events |
|----------|--------------|------------|--------|
| `display: none` | Removed | No | No |
| `visibility: hidden` | Preserved | No | No |
| `opacity: 0` | Preserved | Yes | Yes |

---

## Positioning

```css
/* Static — default, normal document flow */
position: static;

/* Relative — offset from normal position (space preserved) */
position: relative;
top: 10px;
left: 20px;

/* Absolute — removed from flow, positioned relative to nearest
   positioned ancestor (or viewport if none) */
position: absolute;
top: 0;
right: 0;

/* Fixed — removed from flow, positioned relative to viewport
   (stays put when scrolling) */
position: fixed;
bottom: 20px;
right: 20px;

/* Sticky — switches between relative and fixed at a scroll threshold */
position: sticky;
top: 0;   /* sticks when top reaches 0 */
```

### Common Positioning Patterns

```css
/* Center an absolute element */
.centered {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* Fixed back-to-top button */
.back-to-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
}

/* Sticky navigation */
.navbar {
    position: sticky;
    top: 0;
    z-index: 100;
}
```

### z-index

```
z-index controls stacking order (higher = on top)
Only works on positioned elements (not static)

z-index: 9999  ← on top
z-index: 100
z-index: 10
z-index: 1
z-index: 0     ← default
z-index: -1    ← behind
```

---

## Flexbox

Flexbox is a **one-dimensional** layout system — it handles either a row OR a column.

### Container Properties

```css
.container {
    display: flex;

    /* Direction */
    flex-direction: row;           /* default: left to right */
    flex-direction: row-reverse;   /* right to left */
    flex-direction: column;        /* top to bottom */
    flex-direction: column-reverse;

    /* Wrapping */
    flex-wrap: nowrap;    /* default: squeeze into one line */
    flex-wrap: wrap;      /* wrap to next line */

    /* Main axis alignment (horizontal for row) */
    justify-content: flex-start;    /* default */
    justify-content: center;
    justify-content: flex-end;
    justify-content: space-between; /* equal space between items */
    justify-content: space-around;  /* equal space around items */
    justify-content: space-evenly;  /* truly equal spacing */

    /* Cross axis alignment (vertical for row) */
    align-items: stretch;   /* default: fill container height */
    align-items: flex-start;
    align-items: center;
    align-items: flex-end;
    align-items: baseline;  /* align text baselines */

    /* Gap between items */
    gap: 1rem;
}
```

### Item Properties

```css
.item {
    /* Grow to fill available space */
    flex-grow: 1;    /* item grows proportionally */

    /* Shrink when space is tight */
    flex-shrink: 0;  /* don't shrink this item */

    /* Base size before growing/shrinking */
    flex-basis: 200px;

    /* Shorthand */
    flex: 1;           /* grow: 1, shrink: 1, basis: 0% */
    flex: 0 0 200px;   /* don't grow, don't shrink, stay 200px */

    /* Override align-items for this item */
    align-self: center;

    /* Order (default: 0) */
    order: -1;   /* move to front */
}
```

### Common Flexbox Patterns

```css
/* Center anything */
.center-everything {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Navigation bar */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Equal-width columns */
.columns {
    display: flex;
    gap: 1rem;
}
.columns > * {
    flex: 1;
}

/* Push last item to the right */
.spacer {
    display: flex;
    gap: 1rem;
}
.spacer > :last-child {
    margin-left: auto;
}
```

---

## CSS Grid

Grid is a **two-dimensional** layout system — it handles rows AND columns simultaneously.

### Container Properties

```css
.grid {
    display: grid;

    /* Define columns */
    grid-template-columns: 200px 1fr 200px;        /* fixed-flexible-fixed */
    grid-template-columns: repeat(3, 1fr);          /* 3 equal columns */
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* responsive! */

    /* Define rows */
    grid-template-rows: auto 1fr auto;

    /* Gap */
    gap: 1rem;
    row-gap: 1rem;
    column-gap: 2rem;

    /* Align all items */
    justify-items: start | center | end | stretch;  /* horizontal */
    align-items: start | center | end | stretch;     /* vertical */

    /* Align the entire grid */
    justify-content: center;
    align-content: center;
}
```

### Item Properties

```css
.item {
    /* Span multiple columns/rows */
    grid-column: 1 / 3;      /* start at line 1, end at line 3 */
    grid-column: span 2;      /* span 2 columns */
    grid-row: 1 / 3;

    /* Named areas */
    grid-area: header;
}
```

### Grid Template Areas

```css
.layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
        "header  header"
        "sidebar main"
        "footer  footer";
    min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

### Flexbox vs Grid

| Feature | Flexbox | Grid |
|---------|---------|------|
| **Dimensions** | 1D (row OR column) | 2D (rows AND columns) |
| **Best for** | Components, alignment | Page layouts, complex grids |
| **Content-based** | Sizes based on content | Sizes based on container |
| **Use when** | Aligning items in a line | Building overall structure |

> **Use Grid for layout, Flexbox for alignment.** They work great together.

---

## Transitions & Animations

### Transitions

Smooth changes between states:

```css
.button {
    background: #3498db;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    /* Transition */
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.button:hover {
    background: #2980b9;
    transform: translateY(-2px);
}
```

### Transition Properties

```css
/* Longhand */
transition-property: background-color, transform;
transition-duration: 0.3s;
transition-timing-function: ease;
transition-delay: 0s;

/* Shorthand */
transition: property duration timing-function delay;
transition: all 0.3s ease 0s;
```

### Timing Functions

```
ease        — slow start, fast middle, slow end (DEFAULT)
linear      — constant speed
ease-in     — slow start
ease-out    — slow end
ease-in-out — slow start and end
cubic-bezier(0.68, -0.55, 0.27, 1.55) — custom bounce
```

### Keyframe Animations

```css
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.element {
    animation: fadeIn 0.5s ease forwards;
}

/* Multi-step animation */
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.pulse {
    animation: pulse 2s ease-in-out infinite;
}
```

### Animation Properties

```css
animation-name: fadeIn;
animation-duration: 0.5s;
animation-timing-function: ease;
animation-delay: 0s;
animation-iteration-count: 1;       /* or infinite */
animation-direction: normal;         /* or reverse, alternate */
animation-fill-mode: forwards;       /* keep final state */
animation-play-state: running;       /* or paused */
```

> **Performance:** Only animate `transform` and `opacity` — they use the GPU and don't trigger reflow.

---

## CSS Variables (Custom Properties)

```css
/* Define variables on :root (available everywhere) */
:root {
    --color-primary: #3498db;
    --color-secondary: #2ecc71;
    --color-text: #333;
    --font-body: "Inter", sans-serif;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 2rem;
    --border-radius: 8px;
}

/* Use variables */
.button {
    background: var(--color-primary);
    color: white;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius);
    font-family: var(--font-body);
}

/* Fallback value */
.card {
    background: var(--color-card-bg, white);  /* white if variable doesn't exist */
}

/* Override for dark mode */
@media (prefers-color-scheme: dark) {
    :root {
        --color-primary: #5dade2;
        --color-text: #eee;
    }
}
```

> CSS variables are **live** — changing them updates all elements that use them. This makes theming trivial.

---

## Key Takeaways

1. **Use external stylesheets** — keep CSS separate from HTML
2. **Specificity determines which styles win** — ID > Class > Element
3. **Always use `box-sizing: border-box`** — it makes sizing predictable
4. **Use `rem` for font sizes and spacing** — it scales consistently
5. **Flexbox for 1D layouts** (navbars, card rows), **Grid for 2D layouts** (page structure)
6. **HSL is the best color format** — intuitive for adjusting colors
7. **Only animate `transform` and `opacity`** — they're GPU-accelerated
8. **CSS variables enable theming** — define colors, spacing, fonts in one place
9. **Cascade order matters** — later rules win when specificity is equal
10. **Inheritance flows down** — `color` and `font` are inherited, `margin` and `padding` are not

---

## Practice Exercises

1. **Style the profile page** from Phase 02 — add colors, fonts, spacing, and a layout
2. **Build a responsive card grid** using CSS Grid with `auto-fit` and `minmax()`
3. **Create a sticky navigation bar** with Flexbox
4. **Implement a dark/light theme toggle** using CSS variables
5. **Build a button component** with hover transitions and focus states

---

**Previous:** [← Phase 02 — HTML Fundamentals](Phase-02-HTML-Fundamentals.md)
**Next:** [Phase 04 — JavaScript & The DOM →](Phase-04-JavaScript-And-The-DOM.md)
