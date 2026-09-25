# Phase 2: Box Model & Layout Basics

## Table of Contents

1. [The CSS Box Model](#the-css-box-model)
2. [Understanding Display Property](#understanding-display-property)
3. [Positioning Elements](#positioning-elements)
4. [Float and Clear](#float-and-clear)
5. [Document Flow](#document-flow)
6. [Width and Height](#width-and-height)
7. [Overflow Property](#overflow-property)
8. [Practical Layout Examples](#practical-layout-examples)
9. [Practice Projects](#practice-projects)

---

## The CSS Box Model

Every HTML element is essentially a rectangular box. The CSS Box Model describes how these boxes are structured.

### Box Model Components

```
┌─────────────────────────────────────┐
│              MARGIN                 │
│  ┌─────────────────────────────┐    │
│  │           BORDER            │    │
│  │  ┌─────────────────────┐    │    │
│  │  │       PADDING       │    │    │
│  │  │  ┌─────────────┐    │    │    │
│  │  │  │   CONTENT   │    │    │    │
│  │  │  └─────────────┘    │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 1. Content

The actual content of the element (text, images, etc.).

```css
.content-box {
    width: 200px; /* Content width */
    height: 100px; /* Content height */
}
```

### 2. Padding

Space between content and border (inside the element).

```css
.padding-examples {
    padding: 20px; /* All sides */
    padding: 10px 20px; /* Vertical | Horizontal */
    padding: 10px 15px 20px 25px; /* Top | Right | Bottom | Left */

    /* Individual sides */
    padding-top: 10px;
    padding-right: 15px;
    padding-bottom: 20px;
    padding-left: 25px;
}
```

### 3. Border

The border around the element.

```css
.border-examples {
    border: 2px solid black; /* Width | Style | Color */
    border-width: 1px 2px 3px 4px; /* Top | Right | Bottom | Left */
    border-style: solid dashed dotted double;
    border-color: red green blue yellow;

    /* Individual sides */
    border-top: 1px solid red;
    border-right: 2px dashed green;
    border-bottom: 3px dotted blue;
    border-left: 4px double yellow;
}
```

### 4. Margin

Space outside the border (between elements).

```css
.margin-examples {
    margin: 20px; /* All sides */
    margin: 10px 20px; /* Vertical | Horizontal */
    margin: 10px 15px 20px 25px; /* Top | Right | Bottom | Left */

    /* Individual sides */
    margin-top: 10px;
    margin-right: 15px;
    margin-bottom: 20px;
    margin-left: 25px;

    /* Auto margins for centering */
    margin: 0 auto; /* Center horizontally */
}
```

### Box-Sizing Property

Controls how the total width and height are calculated.

```css
/* Default behavior (content-box) */
.content-box {
    box-sizing: content-box;
    width: 200px;
    padding: 20px;
    border: 5px solid black;
    /* Total width: 200px + 40px + 10px = 250px */
}

/* Border-box includes padding and border in width */
.border-box {
    box-sizing: border-box;
    width: 200px;
    padding: 20px;
    border: 5px solid black;
    /* Total width: 200px (content adjusts automatically) */
}

/* Apply to all elements (common practice) */
* {
    box-sizing: border-box;
}
```

### Complete Box Model Example

```css
.box-model-demo {
    width: 300px;
    height: 200px;
    padding: 20px;
    border: 5px solid #333;
    margin: 30px;
    background-color: lightblue;
    box-sizing: border-box;
}
```

```html
<div class="box-model-demo">This div demonstrates the complete box model.</div>
```

---

## Understanding Display Property

The `display` property controls how elements are rendered and how they interact with other elements.

### Block Elements

Take up the full width available and start on a new line.

```css
.block-element {
    display: block;
    width: 100%; /* Default for block elements */
    margin: 10px 0; /* Vertical margins work */
    padding: 20px;
    background-color: lightblue;
}
```

**Examples**: `<div>`, `<h1>-<h6>`, `<p>`, `<section>`, `<article>`

### Inline Elements

Take only the space they need and don't start on a new line.

```css
.inline-element {
    display: inline;
    /* width and height have no effect */
    /* vertical margins/padding may not work as expected */
    padding: 5px 10px; /* Only horizontal padding/margin work properly */
    background-color: yellow;
}
```

**Examples**: `<span>`, `<a>`, `<strong>`, `<em>`, `<img>`

### Inline-Block Elements

Combination of inline and block properties.

```css
.inline-block-element {
    display: inline-block;
    width: 150px; /* Width and height work */
    height: 100px;
    padding: 20px; /* All padding/margin work */
    margin: 10px;
    background-color: lightgreen;
    vertical-align: top; /* Control vertical alignment */
}
```

### None

Completely removes the element from the document flow.

```css
.hidden-element {
    display: none; /* Element is not rendered at all */
}

/* Alternative: visibility hidden (takes up space but invisible) */
.invisible-element {
    visibility: hidden;
}
```

### Display Property Comparison

```html
<div class="block">Block Element</div>
<span class="inline">Inline</span>
<span class="inline">Inline</span>
<div class="inline-block">Inline-Block</div>
<div class="inline-block">Inline-Block</div>
```

```css
.block {
    display: block;
    background-color: lightblue;
    padding: 10px;
    margin: 5px 0;
}

.inline {
    display: inline;
    background-color: yellow;
    padding: 5px;
    margin: 10px; /* Vertical margin won't work */
}

.inline-block {
    display: inline-block;
    background-color: lightgreen;
    width: 100px;
    height: 50px;
    padding: 10px;
    margin: 5px;
}
```

---

## Positioning Elements

The `position` property controls how elements are positioned in the document.

### 1. Static (Default)

Elements follow normal document flow.

```css
.static-element {
    position: static;
    /* top, right, bottom, left have no effect */
}
```

### 2. Relative

Positioned relative to its normal position.

```css
.relative-element {
    position: relative;
    top: 20px; /* Move 20px down from normal position */
    left: 30px; /* Move 30px right from normal position */
    background-color: lightblue;
}
```

### 3. Absolute

Positioned relative to nearest positioned ancestor.

```css
.container {
    position: relative; /* Establishes positioning context */
    width: 400px;
    height: 300px;
    background-color: lightgray;
}

.absolute-element {
    position: absolute;
    top: 50px; /* 50px from top of container */
    right: 20px; /* 20px from right of container */
    width: 100px;
    height: 80px;
    background-color: red;
}
```

### 4. Fixed

Positioned relative to the viewport (stays in place when scrolling).

```css
.fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: navy;
    color: white;
    z-index: 1000; /* Ensure it stays on top */
}

.fixed-sidebar {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 200px;
    height: 300px;
    background-color: lightblue;
}
```

### 5. Sticky

Switches between relative and fixed based on scroll position.

```css
.sticky-nav {
    position: sticky;
    top: 0; /* Sticks when 0px from top of viewport */
    background-color: white;
    border-bottom: 1px solid #ccc;
    padding: 10px;
    z-index: 100;
}
```

### Z-Index

Controls stacking order of positioned elements.

```css
.layer-1 {
    position: absolute;
    z-index: 1;
    background-color: red;
}

.layer-2 {
    position: absolute;
    z-index: 2; /* Appears above layer-1 */
    background-color: blue;
}

.layer-3 {
    position: absolute;
    z-index: 3; /* Appears above both */
    background-color: green;
}
```

### Positioning Example: Card with Badge

```html
<div class="card">
    <div class="badge">New</div>
    <img src="product.jpg" alt="Product" />
    <h3>Product Title</h3>
    <p>Product description...</p>
</div>
```

```css
.card {
    position: relative;
    width: 300px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin: 20px;
}

.badge {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: red;
    color: white;
    padding: 5px 10px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: bold;
}
```

---

## Float and Clear

Float was traditionally used for layouts but is now mainly used for text wrapping around images.

### Float Property

```css
.float-left {
    float: left;
    width: 200px;
    height: 150px;
    background-color: lightblue;
    margin: 0 20px 20px 0;
}

.float-right {
    float: right;
    width: 200px;
    height: 150px;
    background-color: lightgreen;
    margin: 0 0 20px 20px;
}
```

```html
<div class="article">
    <img src="image.jpg" class="float-left" alt="Article image" />
    <p>
        This text will wrap around the floated image. Lorem ipsum dolor sit
        amet, consectetur adipiscing elit...
    </p>
</div>
```

### Clear Property

Stops elements from wrapping around floated elements.

```css
.clear-left {
    clear: left; /* Clear left floats */
}

.clear-right {
    clear: right; /* Clear right floats */
}

.clear-both {
    clear: both; /* Clear all floats */
}
```

### Clearfix Technique

Prevent parent collapse when all children are floated.

```css
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}

/* Alternative modern clearfix */
.clearfix {
    overflow: auto;
}
```

```html
<div class="container clearfix">
    <div class="float-left">Left content</div>
    <div class="float-right">Right content</div>
</div>
```

---

## Document Flow

Understanding how elements flow in the document is crucial for layout.

### Normal Flow

Elements stack vertically (block) or horizontally (inline).

```css
.normal-flow {
    /* Block elements stack vertically */
    display: block;
    margin-bottom: 10px;
}

.inline-flow {
    /* Inline elements flow horizontally */
    display: inline;
    margin-right: 10px;
}
```

### Out of Flow

Positioned (absolute, fixed) and floated elements are removed from normal flow.

```css
.out-of-flow {
    position: absolute; /* Removed from normal flow */
    top: 50px;
    left: 100px;
}
```

### Stacking Context

Created by certain CSS properties that affect element layering.

```css
.stacking-context {
    position: relative; /* Creates stacking context */
    z-index: 1;
    opacity: 0.9; /* Also creates stacking context */
    transform: scale(1); /* Also creates stacking context */
}
```

---

## Width and Height

### Setting Dimensions

```css
.dimensions {
    width: 300px; /* Fixed width */
    height: 200px; /* Fixed height */
    min-width: 200px; /* Minimum width */
    max-width: 500px; /* Maximum width */
    min-height: 100px; /* Minimum height */
    max-height: 400px; /* Maximum height */
}
```

### Percentage Dimensions

```css
.percentage-width {
    width: 50%; /* 50% of parent width */
    height: 100vh; /* 100% of viewport height */
}
```

### Auto Dimensions

```css
.auto-dimensions {
    width: auto; /* Default - fits content */
    height: auto; /* Default - fits content */
    margin: 0 auto; /* Center horizontally */
}
```

### Viewport Units

```css
.viewport-units {
    width: 100vw; /* 100% of viewport width */
    height: 100vh; /* 100% of viewport height */
    width: 50vmin; /* 50% of smaller viewport dimension */
    width: 50vmax; /* 50% of larger viewport dimension */
}
```

---

## Overflow Property

Controls what happens when content overflows its container.

### Overflow Values

```css
.overflow-visible {
    overflow: visible; /* Default - content shows outside */
    width: 200px;
    height: 100px;
}

.overflow-hidden {
    overflow: hidden; /* Hide overflowing content */
    width: 200px;
    height: 100px;
}

.overflow-scroll {
    overflow: scroll; /* Always show scrollbars */
    width: 200px;
    height: 100px;
}

.overflow-auto {
    overflow: auto; /* Scrollbars only when needed */
    width: 200px;
    height: 100px;
}
```

### Directional Overflow

```css
.overflow-x-y {
    overflow-x: hidden; /* Hide horizontal overflow */
    overflow-y: scroll; /* Scroll vertical overflow */
    width: 200px;
    height: 100px;
}
```

### Text Overflow

```css
.text-overflow {
    width: 200px;
    white-space: nowrap; /* Prevent line wrapping */
    overflow: hidden; /* Hide overflow */
    text-overflow: ellipsis; /* Show ... for cut text */
}
```

---

## Practical Layout Examples

### 1. Centered Container

```css
.container {
    max-width: 1200px;
    margin: 0 auto; /* Center horizontally */
    padding: 0 20px; /* Side padding for mobile */
}
```

### 2. Two-Column Layout (Float)

```html
<div class="container clearfix">
    <div class="sidebar">Sidebar</div>
    <div class="main-content">Main Content</div>
</div>
```

```css
.container {
    max-width: 1000px;
    margin: 0 auto;
}

.sidebar {
    float: left;
    width: 30%;
    background-color: lightgray;
    padding: 20px;
    box-sizing: border-box;
}

.main-content {
    float: right;
    width: 70%;
    background-color: white;
    padding: 20px;
    box-sizing: border-box;
}

.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
```

### 3. Sticky Header Layout

```html
<header class="header">Header</header>
<main class="main">
    <div class="content">Main Content</div>
</main>
<footer class="footer">Footer</footer>
```

```css
body {
    margin: 0;
    padding: 0;
}

.header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: navy;
    color: white;
    padding: 0 20px;
    box-sizing: border-box;
    z-index: 1000;
}

.main {
    margin-top: 60px; /* Account for fixed header */
    min-height: calc(100vh - 120px); /* Full height minus header and footer */
    padding: 20px;
}

.footer {
    height: 60px;
    background-color: #333;
    color: white;
    padding: 20px;
    box-sizing: border-box;
}
```

### 4. Modal Overlay

```html
<div class="modal-overlay">
    <div class="modal">
        <h2>Modal Title</h2>
        <p>Modal content goes here...</p>
        <button class="close-btn">Close</button>
    </div>
</div>
```

```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.modal {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
}

.close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
}
```

---

## Practice Projects

### Project 1: Simple Blog Layout

Create a blog layout with:

-   Fixed header with navigation
-   Main content area (70% width)
-   Sidebar (30% width)
-   Sticky footer

### Project 2: Card Gallery

Create a responsive card gallery:

-   Cards with fixed width and auto height
-   Proper spacing between cards
-   Hover effects using positioning

### Project 3: Dashboard Layout

Build a dashboard with:

-   Fixed sidebar navigation
-   Header with breadcrumbs
-   Main content area with widgets
-   Responsive design considerations

### Project 4: Image Gallery with Overlays

Create an image gallery where:

-   Images have overlay text on hover
-   Uses absolute positioning for overlays
-   Implements proper z-index management

---

## Common Layout Pitfalls and Solutions

### 1. Margin Collapsing

Adjacent vertical margins collapse to the larger value.

```css
/* Problem */
.box1 {
    margin-bottom: 20px;
}
.box2 {
    margin-top: 30px;
}
/* Result: 30px gap, not 50px */

/* Solution: Use padding or border */
.box1 {
    margin-bottom: 20px;
    border-bottom: 1px transparent solid;
}
```

### 2. Containing Floats

Parent doesn't contain floated children.

```css
/* Solution: Clearfix */
.parent::after {
    content: "";
    display: table;
    clear: both;
}
```

### 3. Absolute Positioning Context

Element positioned relative to wrong ancestor.

```css
/* Solution: Create positioning context */
.parent {
    position: relative; /* Creates positioning context */
}

.child {
    position: absolute;
    top: 10px; /* Now relative to .parent */
}
```

---

## Next Steps

You've mastered the fundamentals of CSS layout! In **Phase 3: Modern Layout Systems**, you'll learn:

-   Flexbox for one-dimensional layouts
-   CSS Grid for two-dimensional layouts
-   Responsive design principles
-   Modern layout techniques

These modern methods will replace many of the float-based techniques you learned here, but understanding the box model and positioning remains crucial.

---

**🎉 Congratulations on completing Phase 2!**

Practice building different layouts using the techniques you've learned. The box model and positioning concepts you've mastered here form the foundation for all CSS layout work.
