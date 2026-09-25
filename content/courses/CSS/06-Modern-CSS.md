# Phase 6: Modern CSS Features

## Table of Contents

1. [CSS Container Queries](#css-container-queries)
2. [CSS Cascade Layers](#css-cascade-layers)
3. [CSS Subgrid](#css-subgrid)
4. [Modern CSS Functions](#modern-css-functions)
5. [New Selectors](#new-selectors)
6. [CSS Houdini](#css-houdini)

---

## CSS Container Queries

Responsive design based on container size, not viewport size.

### Basic Container Queries

```css
/* Define a container */
.card-container {
    container-type: inline-size;
    container-name: card;
}

/* Query the container */
@container card (min-width: 400px) {
    .card {
        display: flex;
        flex-direction: row;
    }

    .card__image {
        flex: 0 0 200px;
    }

    .card__content {
        flex: 1;
        padding-left: 1rem;
    }
}

@container card (max-width: 399px) {
    .card {
        display: block;
    }

    .card__image {
        width: 100%;
        margin-bottom: 1rem;
    }
}
```

### Container Types

```css
/* Size-based queries */
.size-container {
    container-type: size; /* Both dimensions */
    container-type: inline-size; /* Width only */
    container-type: block-size; /* Height only */
}

/* Style-based queries */
.style-container {
    container-type: style; /* For future style queries */
}

/* Combined */
.combined-container {
    container-type: size style;
}
```

### Practical Example: Responsive Components

```html
<div class="widget-container">
    <div class="widget">
        <h3 class="widget__title">Weather</h3>
        <div class="widget__content">
            <div class="weather-display">
                <span class="temperature">24°C</span>
                <span class="condition">Sunny</span>
            </div>
        </div>
    </div>
</div>
```

```css
.widget-container {
    container-type: inline-size;
    container-name: widget;
    width: 100%;
    max-width: 400px;
}

.widget {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Small widget layout */
@container widget (max-width: 200px) {
    .widget__title {
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
    }

    .weather-display {
        text-align: center;
    }

    .temperature {
        display: block;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .condition {
        font-size: 0.75rem;
        color: #666;
    }
}

/* Large widget layout */
@container widget (min-width: 300px) {
    .widget {
        padding: 1.5rem;
    }

    .weather-display {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .temperature {
        font-size: 2rem;
        font-weight: bold;
        color: #007bff;
    }

    .condition {
        font-size: 1rem;
        background: #f8f9fa;
        padding: 0.5rem 1rem;
        border-radius: 20px;
    }
}
```

---

## CSS Cascade Layers

Control specificity and cascade order explicitly.

### Creating Layers

```css
/* Define layer order */
@layer reset, base, components, utilities;

/* Reset layer */
@layer reset {
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
}

/* Base layer */
@layer base {
    body {
        font-family: system-ui, sans-serif;
        line-height: 1.6;
        color: #333;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin-bottom: 0.5em;
    }
}

/* Components layer */
@layer components {
    .button {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
    }
}

/* Utilities layer */
@layer utilities {
    .text-center {
        text-align: center;
    }
    .margin-0 {
        margin: 0;
    }
    .padding-large {
        padding: 2rem;
    }
}
```

### Nested Layers

```css
@layer framework {
    @layer reset, base, components;

    @layer reset {
        /* Framework reset styles */
    }

    @layer base {
        /* Framework base styles */
    }

    @layer components {
        /* Framework components */
    }
}

@layer theme {
    /* Theme overrides */
    .button {
        background: #28a745; /* Override framework button */
    }
}
```

### Layer Benefits

```css
/* Before layers: Specificity wars */
.button {
    background: blue;
}
.header .button {
    background: red;
} /* Higher specificity wins */

/* With layers: Explicit control */
@layer base, theme;

@layer base {
    .header .nav .menu .button {
        /* High specificity */
        background: blue;
    }
}

@layer theme {
    .button {
        /* Low specificity but later layer wins */
        background: red;
    }
}
```

---

## CSS Subgrid

Inherit grid tracks from parent grid.

### Basic Subgrid

```css
.main-grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 1rem;
}

.subgrid-item {
    grid-column: span 2;
    display: grid;
    grid-template-columns: subgrid; /* Inherit parent columns */
    gap: inherit; /* Inherit parent gap */
}
```

### Practical Example: Card Grid Alignment

```html
<div class="product-grid">
    <div class="product-row">
        <div class="product-card">
            <img src="product1.jpg" alt="Product 1" />
            <h3>Short Title</h3>
            <p>Brief description</p>
            <button>Buy Now</button>
        </div>
        <div class="product-card">
            <img src="product2.jpg" alt="Product 2" />
            <h3>Much Longer Product Title Here</h3>
            <p>Longer description that takes more space</p>
            <button>Buy Now</button>
        </div>
        <div class="product-card">
            <img src="product3.jpg" alt="Product 3" />
            <h3>Medium Title</h3>
            <p>Standard description length</p>
            <button>Buy Now</button>
        </div>
    </div>
</div>
```

```css
.product-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.product-row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    gap: inherit;
}

.product-card {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
}

.product-card h3 {
    margin: 1rem 0 0.5rem;
}

.product-card p {
    color: #666;
    line-height: 1.5;
}

.product-card button {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
```

---

## Modern CSS Functions

New functions for calculations and transformations.

### Mathematical Functions

```css
.container {
    /* Clamp: min, preferred, max */
    font-size: clamp(1rem, 2.5vw, 2rem);
    width: clamp(300px, 50%, 800px);

    /* Min/Max for responsive design */
    padding: max(1rem, 3vw);
    margin: min(2rem, 5vh);

    /* Calculations */
    height: calc(100vh - 4rem);
    width: calc(100% - 2 * 1rem);
}
```

### Color Functions

```css
.color-examples {
    /* Relative colors (future) */
    --primary: #007bff;
    --primary-light: color-mix(in oklch, var(--primary) 80%, white);
    --primary-dark: color-mix(in oklch, var(--primary) 80%, black);

    /* Color contrast */
    background: var(--primary);
    color: color-contrast(var(--primary) vs white, black);
}
```

### Trigonometric Functions

```css
.trig-animations {
    /* Circular motion */
    transform: translateX(calc(cos(var(--angle)) * 100px)) translateY(
            calc(sin(var(--angle)) * 100px)
        );

    /* Wave effects */
    clip-path: polygon(
        0% calc(50% + sin(0deg) * 20%),
        25% calc(50% + sin(90deg) * 20%),
        50% calc(50% + sin(180deg) * 20%),
        75% calc(50% + sin(270deg) * 20%),
        100% calc(50% + sin(360deg) * 20%)
    );
}
```

### Container Query Units

```css
.container-units {
    /* Container-based units */
    font-size: 5cqw; /* 5% of container width */
    height: 50cqh; /* 50% of container height */
    margin: 2cqi; /* 2% of container inline size */
    padding: 1cqb; /* 1% of container block size */

    /* Minimum container dimension */
    border-radius: 2cqmin;

    /* Maximum container dimension */
    box-shadow: 0 0 1cqmax rgba(0, 0, 0, 0.1);
}
```

---

## New Selectors

Modern selectors for better targeting.

### :has() Selector

```css
/* Parent selector based on children */
.card:has(img) {
    padding-top: 0;
}

.form:has(input:invalid) {
    border-color: red;
}

.article:has(> .featured-image) {
    grid-column: span 2;
}

/* Complex combinations */
.sidebar:has(.widget:nth-child(n + 4)) {
    grid-template-rows: repeat(auto-fit, minmax(200px, 1fr));
}
```

### :is() and :where()

```css
/* :is() - Normal specificity */
:is(h1, h2, h3, h4, h5, h6) {
    margin-top: 0;
    line-height: 1.2;
}

:is(.card, .widget):hover {
    transform: translateY(-2px);
}

/* :where() - Zero specificity */
:where(h1, h2, h3, h4, h5, h6) {
    color: #333; /* Easy to override */
}

:where(.button, .btn, input[type="submit"]) {
    cursor: pointer;
}
```

### Logical Properties Selectors

```css
/* Direction-aware selectors */
.text[dir="rtl"] {
    text-align: start; /* Right in RTL */
}

.navigation:dir(ltr) .nav-item:not(:last-child) {
    margin-inline-end: 1rem;
}

.navigation:dir(rtl) .nav-item:not(:last-child) {
    margin-inline-start: 1rem;
}
```

---

## CSS Houdini

Low-level CSS APIs for custom styling.

### Custom Paint API

```javascript
// paint-worklet.js
class CirclesPaint {
    paint(ctx, size, properties) {
        const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"];

        for (let i = 0; i < 50; i++) {
            const x = Math.random() * size.width;
            const y = Math.random() * size.height;
            const radius = Math.random() * 20 + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.3;
            ctx.fill();
        }
    }
}

registerPaint("circles", CirclesPaint);
```

```css
/* Register and use the paint worklet */
.decorative-background {
    background: paint(circles);
    height: 300px;
}
```

### Custom Properties API

```javascript
// Register custom property
CSS.registerProperty({
    name: "--rotation",
    syntax: "<angle>",
    initialValue: "0deg",
    inherits: false,
});
```

```css
.animated-element {
    --rotation: 0deg;
    transform: rotate(var(--rotation));
    transition: --rotation 0.3s ease;
}

.animated-element:hover {
    --rotation: 180deg;
}
```

### Layout API (Future)

```javascript
// custom-layout.js
class MasonryLayout {
    static get inputProperties() {
        return ["--columns", "--gap"];
    }

    layout(children, edges, constraints, styleMap) {
        const columns = parseInt(styleMap.get("--columns").toString()) || 3;
        const gap = parseInt(styleMap.get("--gap").toString()) || 20;

        // Custom layout logic here
        // Return fragments with positions
    }
}

registerLayout("masonry", MasonryLayout);
```

```css
.masonry-container {
    display: layout(masonry);
    --columns: 3;
    --gap: 20px;
}
```

---

## Practical Modern CSS Examples

### Responsive Typography

```css
.responsive-text {
    /* Fluid typography */
    font-size: clamp(1.125rem, 1rem + 2vw, 3rem);
    line-height: clamp(1.4, 1.2 + 0.5vw, 1.8);

    /* Container-based scaling */
    container-type: inline-size;
}

@container (min-width: 400px) {
    .responsive-text {
        font-size: clamp(1.25rem, 1.125rem + 2cqw, 3.5rem);
    }
}
```

### Dynamic Color Schemes

```css
:root {
    /* Base colors */
    --hue: 220;
    --saturation: 70%;
    --lightness: 50%;

    /* Generated palette */
    --primary: hsl(var(--hue), var(--saturation), var(--lightness));
    --primary-light: hsl(
        var(--hue),
        var(--saturation),
        calc(var(--lightness) + 20%)
    );
    --primary-dark: hsl(
        var(--hue),
        var(--saturation),
        calc(var(--lightness) - 20%)
    );
    --complementary: hsl(
        calc(var(--hue) + 180),
        var(--saturation),
        var(--lightness)
    );
}

.theme-blue {
    --hue: 220;
}
.theme-green {
    --hue: 120;
}
.theme-purple {
    --hue: 280;
}
```

### Advanced Grid Layouts

```css
.advanced-grid {
    display: grid;
    grid-template-columns: repeat(
        auto-fit,
        minmax(clamp(250px, 30%, 400px), 1fr)
    );
    gap: clamp(1rem, 3vw, 2rem);
    container-type: inline-size;
}

@container (min-width: 800px) {
    .advanced-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
}

/* Subgrid for aligned content */
.grid-item {
    display: grid;
    grid-template-rows: auto 1fr auto;
}

.grid-section {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
}
```

---

## Browser Support and Progressive Enhancement

### Feature Detection

```css
/* Container queries fallback */
.responsive-component {
    /* Mobile-first base styles */
    display: block;
}

@supports (container-type: inline-size) {
    .responsive-component {
        container-type: inline-size;
    }

    @container (min-width: 400px) {
        .responsive-component {
            display: flex;
        }
    }
}

/* Cascade layers fallback */
@supports (rule: @layer) {
    @layer base, components, utilities;
}
```

### Progressive Enhancement Strategy

```css
/* Base experience */
.enhanced-component {
    background: linear-gradient(45deg, #007bff, #28a745);
    padding: 2rem;
    border-radius: 8px;
}

/* Enhanced with Houdini */
@supports (background: paint(circles)) {
    .enhanced-component {
        background: paint(circles);
    }
}

/* Enhanced with container queries */
@supports (container-type: inline-size) {
    .enhanced-component {
        container-type: inline-size;
    }

    @container (min-width: 300px) {
        .enhanced-component {
            padding: clamp(1rem, 5cqw, 3rem);
        }
    }
}
```

---

## Future CSS Features

### CSS Nesting (Stable)

```css
.card {
    background: white;
    border-radius: 8px;
    padding: 1rem;

    & .title {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
    }

    & .content {
        color: #666;

        & p {
            margin-bottom: 1rem;
        }
    }

    &:hover {
        transform: translateY(-2px);
    }
}
```

### Anchor Positioning

```css
.tooltip {
    position: absolute;
    anchor-name: --tooltip-anchor;
    left: anchor(right);
    top: anchor(top);
    margin-left: 10px;
}

.trigger:hover + .tooltip {
    anchor-reference: --tooltip-anchor;
}
```

---

## Conclusion

**🎉 Congratulations on completing all 6 phases of CSS!**

You've journeyed from basic CSS concepts to cutting-edge modern features. You now have:

-   **Solid Fundamentals**: Syntax, selectors, and core concepts
-   **Layout Mastery**: Box model, positioning, Flexbox, and Grid
-   **Modern Techniques**: Advanced styling and animations
-   **Professional Skills**: Architecture and best practices
-   **Future-Ready Knowledge**: Latest CSS features and APIs

### Next Steps:

1. **Practice**: Build real projects using these concepts
2. **Stay Updated**: Follow CSS Working Group specifications
3. **Experiment**: Try new features as they become available
4. **Share**: Teach others and contribute to the community

Keep pushing the boundaries of what's possible with CSS!
