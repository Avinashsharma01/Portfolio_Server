# Phase 3: Modern Layout Systems

## Table of Contents

1. [Introduction to Modern Layout](#introduction-to-modern-layout)
2. [Flexbox (Flexible Box Layout)](#flexbox-flexible-box-layout)
3. [CSS Grid Layout](#css-grid-layout)
4. [Responsive Design Principles](#responsive-design-principles)
5. [Combining Flexbox and Grid](#combining-flexbox-and-grid)
6. [Modern Layout Patterns](#modern-layout-patterns)
7. [Browser Support and Fallbacks](#browser-support-and-fallbacks)
8. [Real-World Projects](#real-world-projects)

---

## Introduction to Modern Layout

Modern CSS provides powerful layout systems that solve many problems that were difficult with older techniques:

-   **Flexbox**: Perfect for one-dimensional layouts (rows or columns)
-   **CSS Grid**: Ideal for two-dimensional layouts (rows and columns)
-   **Responsive Design**: Layouts that adapt to different screen sizes

### Why Modern Layout?

```css
/* Old way: Complex float-based layout */
.old-layout {
    float: left;
    width: 33.33%;
    margin-right: -100%;
    /* Complex clearing and positioning... */
}

/* Modern way: Simple flexbox */
.modern-layout {
    display: flex;
    gap: 20px;
}

.modern-layout > div {
    flex: 1; /* Equal width columns */
}
```

---

## Flexbox (Flexible Box Layout)

Flexbox is designed for distributing space and aligning items in a single dimension.

### Basic Flexbox Concepts

#### Flex Container and Items

```html
<div class="flex-container">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
</div>
```

```css
.flex-container {
    display: flex; /* or inline-flex */
}

.flex-item {
    /* Flex items automatically become flexible */
    background-color: lightblue;
    padding: 20px;
    margin: 5px;
}
```

### Flex Container Properties

#### 1. flex-direction

Controls the main axis direction.

```css
.flex-row {
    display: flex;
    flex-direction: row; /* Default: left to right */
}

.flex-row-reverse {
    display: flex;
    flex-direction: row-reverse; /* Right to left */
}

.flex-column {
    display: flex;
    flex-direction: column; /* Top to bottom */
}

.flex-column-reverse {
    display: flex;
    flex-direction: column-reverse; /* Bottom to top */
}
```

#### 2. justify-content

Aligns items along the main axis.

```css
.justify-start {
    display: flex;
    justify-content: flex-start; /* Default: start of container */
}

.justify-end {
    display: flex;
    justify-content: flex-end; /* End of container */
}

.justify-center {
    display: flex;
    justify-content: center; /* Center of container */
}

.justify-between {
    display: flex;
    justify-content: space-between; /* Equal space between items */
}

.justify-around {
    display: flex;
    justify-content: space-around; /* Equal space around items */
}

.justify-evenly {
    display: flex;
    justify-content: space-evenly; /* Equal space everywhere */
}
```

#### 3. align-items

Aligns items along the cross axis.

```css
.align-start {
    display: flex;
    align-items: flex-start; /* Start of cross axis */
    height: 200px;
}

.align-end {
    display: flex;
    align-items: flex-end; /* End of cross axis */
    height: 200px;
}

.align-center {
    display: flex;
    align-items: center; /* Center of cross axis */
    height: 200px;
}

.align-stretch {
    display: flex;
    align-items: stretch; /* Default: stretch to fill */
    height: 200px;
}

.align-baseline {
    display: flex;
    align-items: baseline; /* Align text baselines */
    height: 200px;
}
```

#### 4. flex-wrap

Controls whether items wrap to new lines.

```css
.no-wrap {
    display: flex;
    flex-wrap: nowrap; /* Default: no wrapping */
}

.wrap {
    display: flex;
    flex-wrap: wrap; /* Wrap to new lines */
}

.wrap-reverse {
    display: flex;
    flex-wrap: wrap-reverse; /* Wrap in reverse order */
}

/* Shorthand for flex-direction and flex-wrap */
.flex-flow {
    display: flex;
    flex-flow: row wrap; /* flex-direction flex-wrap */
}
```

#### 5. align-content

Aligns wrapped lines.

```css
.content-center {
    display: flex;
    flex-wrap: wrap;
    align-content: center; /* Center wrapped lines */
    height: 400px;
}

.content-between {
    display: flex;
    flex-wrap: wrap;
    align-content: space-between; /* Space between lines */
    height: 400px;
}
```

#### 6. gap

Space between flex items.

```css
.flex-gap {
    display: flex;
    gap: 20px; /* 20px gap between all items */
    row-gap: 15px; /* 15px gap between rows */
    column-gap: 25px; /* 25px gap between columns */
}
```

### Flex Item Properties

#### 1. flex-grow

How much an item should grow.

```css
.flex-item-1 {
    flex-grow: 1; /* Takes 1 part of available space */
}

.flex-item-2 {
    flex-grow: 2; /* Takes 2 parts of available space */
}

.flex-item-3 {
    flex-grow: 1; /* Takes 1 part of available space */
}
/* Result: Item 2 is twice as wide as items 1 and 3 */
```

#### 2. flex-shrink

How much an item should shrink.

```css
.no-shrink {
    flex-shrink: 0; /* Won't shrink below its content size */
}

.normal-shrink {
    flex-shrink: 1; /* Default: can shrink */
}

.high-shrink {
    flex-shrink: 2; /* Shrinks twice as fast as normal */
}
```

#### 3. flex-basis

Initial size before growing/shrinking.

```css
.flex-basis {
    flex-basis: 200px; /* Start at 200px width */
    flex-basis: 30%; /* Start at 30% of container */
    flex-basis: auto; /* Default: based on content */
    flex-basis: 0; /* Start at 0, rely on flex-grow */
}
```

#### 4. flex Shorthand

```css
.flex-shorthand {
    flex: 1; /* flex-grow: 1, flex-shrink: 1, flex-basis: 0 */
    flex: 2 1 200px; /* grow: 2, shrink: 1, basis: 200px */
    flex: none; /* flex-grow: 0, flex-shrink: 0, flex-basis: auto */
    flex: auto; /* flex-grow: 1, flex-shrink: 1, flex-basis: auto */
}
```

#### 5. align-self

Override align-items for individual items.

```css
.flex-container {
    display: flex;
    align-items: center;
    height: 200px;
}

.align-self-start {
    align-self: flex-start; /* Override to align at start */
}

.align-self-end {
    align-self: flex-end; /* Override to align at end */
}
```

#### 6. order

Change visual order without changing HTML.

```css
.first {
    order: 3; /* Appears third */
}

.second {
    order: 1; /* Appears first */
}

.third {
    order: 2; /* Appears second */
}
```

### Practical Flexbox Examples

#### 1. Perfect Centering

```css
.perfect-center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
```

```html
<div class="perfect-center">
    <div>Perfectly centered content!</div>
</div>
```

#### 2. Navigation Bar

```html
<nav class="navbar">
    <div class="logo">Logo</div>
    <ul class="nav-links">
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
    </ul>
    <div class="nav-actions">
        <button>Login</button>
        <button>Sign Up</button>
    </div>
</nav>
```

```css
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #333;
    color: white;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
    margin: 0;
    padding: 0;
}

.nav-links a {
    color: white;
    text-decoration: none;
}

.nav-actions {
    display: flex;
    gap: 1rem;
}
```

#### 3. Card Layout

```html
<div class="card-container">
    <div class="card">Card 1</div>
    <div class="card">Card 2 with more content</div>
    <div class="card">Card 3</div>
</div>
```

```css
.card-container {
    display: flex;
    gap: 20px;
    padding: 20px;
}

.card {
    flex: 1; /* Equal width */
    padding: 20px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

#### 4. Sidebar Layout

```html
<div class="layout">
    <aside class="sidebar">Sidebar</aside>
    <main class="content">Main Content</main>
</div>
```

```css
.layout {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    flex: 0 0 250px; /* No grow, no shrink, 250px width */
    background-color: #f5f5f5;
    padding: 20px;
}

.content {
    flex: 1; /* Take remaining space */
    padding: 20px;
}
```

#### 5. Responsive Flexbox

```css
.responsive-flex {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.flex-item {
    flex: 1 1 300px; /* Grow, shrink, minimum 300px */
    padding: 20px;
    background-color: lightblue;
}

/* On small screens, items stack vertically */
@media (max-width: 768px) {
    .flex-item {
        flex: 1 1 100%; /* Full width on mobile */
    }
}
```

---

## CSS Grid Layout

CSS Grid is a powerful two-dimensional layout system for complex layouts.

### Basic Grid Concepts

#### Grid Container and Items

```html
<div class="grid-container">
    <div class="grid-item">1</div>
    <div class="grid-item">2</div>
    <div class="grid-item">3</div>
    <div class="grid-item">4</div>
    <div class="grid-item">5</div>
    <div class="grid-item">6</div>
</div>
```

```css
.grid-container {
    display: grid;
    grid-template-columns: 200px 200px 200px; /* 3 columns, 200px each */
    grid-template-rows: 150px 150px; /* 2 rows, 150px each */
    gap: 20px;
}

.grid-item {
    background-color: lightblue;
    padding: 20px;
    text-align: center;
}
```

### Grid Container Properties

#### 1. grid-template-columns & grid-template-rows

```css
/* Fixed sizes */
.grid-fixed {
    display: grid;
    grid-template-columns: 200px 300px 200px;
    grid-template-rows: 150px 200px;
}

/* Flexible units */
.grid-flexible {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr; /* Fractional units */
    grid-template-rows: 100px auto; /* Fixed and auto */
}

/* Mixed units */
.grid-mixed {
    display: grid;
    grid-template-columns: 200px 1fr 100px; /* Fixed, flexible, fixed */
    grid-template-rows: auto 1fr auto; /* Header, content, footer */
}

/* Repeat function */
.grid-repeat {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 equal columns */
    grid-template-columns: repeat(
        auto-fit,
        minmax(250px, 1fr)
    ); /* Responsive */
}
```

#### 2. grid-template-areas

Named grid areas for intuitive layouts.

```css
.grid-layout {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
        "header header header"
        "sidebar content ads"
        "footer footer footer";
    gap: 20px;
    min-height: 100vh;
}

.header {
    grid-area: header;
}
.sidebar {
    grid-area: sidebar;
}
.content {
    grid-area: content;
}
.ads {
    grid-area: ads;
}
.footer {
    grid-area: footer;
}
```

#### 3. gap (grid-gap)

```css
.grid-gap {
    display: grid;
    gap: 20px; /* Same for rows and columns */
    row-gap: 15px; /* Gap between rows */
    column-gap: 25px; /* Gap between columns */
}
```

#### 4. justify-items & align-items

Align items within their grid cells.

```css
.grid-align {
    display: grid;
    grid-template-columns: repeat(3, 150px);
    grid-template-rows: repeat(2, 100px);

    justify-items: center; /* Horizontal alignment */
    align-items: center; /* Vertical alignment */

    /* Combined shorthand */
    place-items: center center; /* align-items justify-items */
}
```

#### 5. justify-content & align-content

Align the entire grid within the container.

```css
.grid-content {
    display: grid;
    grid-template-columns: repeat(3, 150px);
    grid-template-rows: repeat(2, 100px);
    width: 800px;
    height: 400px;

    justify-content: center; /* Horizontal alignment of grid */
    align-content: center; /* Vertical alignment of grid */

    /* Combined shorthand */
    place-content: center center; /* align-content justify-content */
}
```

### Grid Item Properties

#### 1. Grid Line Positioning

```css
.grid-item-1 {
    grid-column-start: 1;
    grid-column-end: 3; /* Span columns 1-2 */
    grid-row-start: 1;
    grid-row-end: 2;
}

/* Shorthand */
.grid-item-2 {
    grid-column: 1 / 3; /* Start / End */
    grid-row: 2 / 4;
}

/* Span syntax */
.grid-item-3 {
    grid-column: 1 / span 2; /* Start at 1, span 2 columns */
    grid-row: span 2; /* Span 2 rows from current position */
}
```

#### 2. Grid Area Shorthand

```css
.grid-item-area {
    grid-area: 1 / 1 / 3 / 3; /* row-start / col-start / row-end / col-end */
    grid-area: header; /* Named area */
}
```

#### 3. Individual Alignment

```css
.grid-item-align {
    justify-self: start; /* Horizontal alignment in cell */
    align-self: end; /* Vertical alignment in cell */

    /* Combined shorthand */
    place-self: end start; /* align-self justify-self */
}
```

### Advanced Grid Features

#### 1. Implicit Grid

```css
.implicit-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    /* No explicit rows defined */

    grid-auto-rows: 150px; /* Height for implicit rows */
    grid-auto-columns: 200px; /* Width for implicit columns */
    grid-auto-flow: row; /* How items flow: row, column, dense */
}
```

#### 2. Minmax Function

```css
.grid-minmax {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    /* Columns: minimum 250px, maximum 1fr, auto-fit as many as possible */

    grid-template-rows: repeat(3, minmax(100px, auto));
    /* Rows: minimum 100px, expand to fit content */
}
```

#### 3. Auto-fit vs Auto-fill

```css
/* Auto-fit: Stretches items to fill container */
.auto-fit {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* Auto-fill: Maintains item size, creates empty columns if needed */
.auto-fill {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
```

### Practical Grid Examples

#### 1. Blog Layout

```html
<div class="blog-layout">
    <header class="header">Blog Header</header>
    <nav class="nav">Navigation</nav>
    <main class="main">
        <article>Article 1</article>
        <article>Article 2</article>
    </main>
    <aside class="sidebar">Sidebar</aside>
    <footer class="footer">Footer</footer>
</div>
```

```css
.blog-layout {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
        "header header header"
        "nav nav nav"
        "sidebar main ads"
        "footer footer footer";
    gap: 20px;
    min-height: 100vh;
}

.header {
    grid-area: header;
    background: #333;
    color: white;
    padding: 1rem;
}
.nav {
    grid-area: nav;
    background: #666;
    color: white;
    padding: 0.5rem;
}
.main {
    grid-area: main;
    background: white;
    padding: 1rem;
}
.sidebar {
    grid-area: sidebar;
    background: #f5f5f5;
    padding: 1rem;
}
.footer {
    grid-area: footer;
    background: #333;
    color: white;
    padding: 1rem;
}
```

#### 2. Photo Gallery

```html
<div class="photo-gallery">
    <div class="photo large">1</div>
    <div class="photo">2</div>
    <div class="photo">3</div>
    <div class="photo wide">4</div>
    <div class="photo">5</div>
    <div class="photo tall">6</div>
    <div class="photo">7</div>
    <div class="photo">8</div>
</div>
```

```css
.photo-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-auto-rows: 200px;
    gap: 15px;
    padding: 20px;
}

.photo {
    background-color: #ddd;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
}

.large {
    grid-column: span 2;
    grid-row: span 2;
}

.wide {
    grid-column: span 2;
}

.tall {
    grid-row: span 2;
}
```

#### 3. Dashboard Layout

```html
<div class="dashboard">
    <header class="dashboard-header">Dashboard</header>
    <nav class="dashboard-nav">Navigation</nav>
    <div class="widget widget-1">Widget 1</div>
    <div class="widget widget-2">Widget 2</div>
    <div class="widget widget-3">Widget 3</div>
    <div class="widget widget-4">Widget 4</div>
    <div class="widget widget-5">Widget 5</div>
</div>
```

```css
.dashboard {
    display: grid;
    grid-template-columns: 200px repeat(4, 1fr);
    grid-template-rows: 60px repeat(3, 200px);
    gap: 20px;
    height: 100vh;
    padding: 20px;
}

.dashboard-header {
    grid-column: 1 / -1; /* Span all columns */
    background: #333;
    color: white;
    padding: 1rem;
}

.dashboard-nav {
    grid-row: 2 / -1; /* Span all remaining rows */
    background: #f5f5f5;
    padding: 1rem;
}

.widget {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
}

.widget-1 {
    grid-column: span 2;
}
.widget-2 {
    grid-column: span 2;
}
.widget-3 {
    grid-column: span 1;
}
.widget-4 {
    grid-column: span 2;
}
.widget-5 {
    grid-column: span 1;
    grid-row: span 2;
}
```

---

## Responsive Design Principles

### Mobile-First Approach

```css
/* Base styles for mobile */
.container {
    padding: 1rem;
}

.grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
}

/* Tablet styles */
@media (min-width: 768px) {
    .container {
        padding: 2rem;
    }

    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop styles */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }

    .grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### Responsive Flexbox Navigation

```css
.nav {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

@media (min-width: 768px) {
    .nav {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .nav-links {
        flex-direction: row;
        gap: 2rem;
    }
}
```

### Responsive Grid

```css
.responsive-grid {
    display: grid;
    gap: 1rem;

    /* Mobile: 1 column */
    grid-template-columns: 1fr;
}

@media (min-width: 600px) {
    .responsive-grid {
        /* Tablet: 2 columns */
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 900px) {
    .responsive-grid {
        /* Desktop: 3 columns */
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Auto-responsive grid */
.auto-responsive-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}
```

---

## Combining Flexbox and Grid

### When to Use What

-   **Flexbox**: One-dimensional layouts, component-level layouts
-   **Grid**: Two-dimensional layouts, page-level layouts

### Grid for Page, Flexbox for Components

```html
<div class="page-layout">
    <header class="header">
        <nav class="nav">
            <div class="logo">Logo</div>
            <ul class="nav-links">
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main class="main">
        <div class="card-grid">
            <div class="card">
                <img src="image1.jpg" alt="Card 1" />
                <div class="card-content">
                    <h3>Card Title</h3>
                    <p>Card description</p>
                    <div class="card-actions">
                        <button>Read More</button>
                        <button>Share</button>
                    </div>
                </div>
            </div>
            <!-- More cards... -->
        </div>
    </main>

    <footer class="footer">Footer</footer>
</div>
```

```css
/* Grid for page layout */
.page-layout {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
}

/* Flexbox for navigation */
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
}

/* Grid for card layout */
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem;
}

/* Flexbox for card structure */
.card {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}

.card-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-actions {
    display: flex;
    gap: 1rem;
    margin-top: auto;
}
```

---

## Modern Layout Patterns

### 1. The Holy Grail Layout

```css
.holy-grail {
    display: grid;
    grid-template-areas:
        "header header header"
        "nav main aside"
        "footer footer footer";
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
}

.header {
    grid-area: header;
}
.nav {
    grid-area: nav;
}
.main {
    grid-area: main;
}
.aside {
    grid-area: aside;
}
.footer {
    grid-area: footer;
}
```

### 2. Pancake Stack

```css
.pancake-stack {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.header,
.footer {
    flex: none;
}

.main {
    flex: 1;
}
```

### 3. Sidebar Says

```css
.sidebar-layout {
    display: flex;
    gap: 1rem;
}

.sidebar {
    flex: 0 0 250px;
}

.content {
    flex: 1;
    min-width: 0; /* Prevent overflow */
}
```

### 4. RAM (Repeat, Auto, Minmax)

```css
.ram-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}
```

### 5. Line Up

```css
.line-up {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.line-up > * {
    flex: 1 1 150px;
    margin: 0.5rem;
}
```

---

## Browser Support and Fallbacks

### Feature Queries

```css
/* Fallback for older browsers */
.grid-fallback {
    display: block;
}

.grid-fallback .item {
    width: 33.33%;
    float: left;
    padding: 1rem;
    box-sizing: border-box;
}

/* Modern grid for supporting browsers */
@supports (display: grid) {
    .grid-fallback {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
    }

    .grid-fallback .item {
        width: auto;
        float: none;
        padding: 0;
    }
}
```

### Progressive Enhancement

```css
/* Base layout that works everywhere */
.card {
    margin-bottom: 2rem;
    padding: 1rem;
    border: 1px solid #ddd;
}

/* Enhanced with flexbox */
@supports (display: flex) {
    .card-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .card {
        flex: 1 1 300px;
        margin-bottom: 0;
    }
}

/* Further enhanced with grid */
@supports (display: grid) {
    .card-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
}
```

---

## Real-World Projects

### Project 1: Magazine Layout

Create a magazine-style layout with:

-   Hero article spanning multiple columns
-   Sidebar with related articles
-   Advertisement placements
-   Responsive design

### Project 2: E-commerce Product Grid

Build a product listing page:

-   Responsive product grid
-   Filter sidebar
-   Product cards with consistent height
-   Loading states and pagination

### Project 3: Dashboard Interface

Create a admin dashboard:

-   Flexible widget layout
-   Resizable panels
-   Navigation sidebar
-   Responsive design for mobile

### Project 4: Modern Portfolio

Build a portfolio website:

-   Hero section with centered content
-   Project gallery with varied sizes
-   About section with timeline
-   Contact form with proper alignment

---

## Next Steps

Congratulations on mastering modern layout systems! In **Phase 4: Advanced Styling**, you'll learn:

-   CSS Pseudo-classes and Pseudo-elements
-   Transitions and Animations
-   CSS Custom Properties (Variables)
-   Advanced Selectors
-   CSS Functions and Calculations

These modern layout techniques form the foundation of contemporary web design. Practice building complex layouts combining Grid and Flexbox to become proficient in modern CSS development.

---

**🎉 Congratulations on completing Phase 3!**

You now have the tools to create any layout imaginable. The combination of Flexbox and Grid gives you unprecedented control over your designs.
