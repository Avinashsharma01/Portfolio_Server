# Phase 5: CSS Architecture & Best Practices

## Table of Contents

1. [CSS Methodologies](#css-methodologies)
2. [BEM (Block Element Modifier)](#bem-block-element-modifier)
3. [OOCSS (Object-Oriented CSS)](#oocss-object-oriented-css)
4. [CSS Preprocessors](#css-preprocessors)
5. [Performance Optimization](#performance-optimization)
6. [Maintainable CSS Practices](#maintainable-css-practices)

---

## CSS Methodologies

Structured approaches to writing scalable and maintainable CSS.

### Why Use Methodologies?

```css
/* Bad: Unclear and hard to maintain */
.header .nav ul li a.active {
    color: red;
}

.sidebar-widget-title {
    font-size: 18px;
}

.btn-primary-large {
    padding: 15px;
}

/* Good: Clear methodology */
.navigation__link--active {
    color: red;
}

.widget__title {
    font-size: 18px;
}

.button--primary {
    padding: 15px;
}
```

### Common Problems Solved

-   **Naming conflicts**: Consistent naming conventions
-   **Specificity wars**: Predictable specificity
-   **Code reuse**: Modular components
-   **Maintenance**: Clear structure and organization

---

## BEM (Block Element Modifier)

The most popular CSS methodology for component-based development.

### BEM Structure

```
Block__Element--Modifier
```

-   **Block**: Independent component
-   **Element**: Part of a block
-   **Modifier**: Variation of block or element

### Block Examples

```css
/* Card block */
.card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Button block */
.button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    font-family: inherit;
}

/* Navigation block */
.navigation {
    display: flex;
    align-items: center;
    padding: 1rem 0;
}
```

### Element Examples

```css
/* Card elements */
.card__header {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
}

.card__title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.card__content {
    margin-bottom: 1rem;
}

.card__footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
}

/* Navigation elements */
.navigation__list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
}

.navigation__item {
    margin-right: 2rem;
}

.navigation__link {
    color: #333;
    text-decoration: none;
    font-weight: 500;
}
```

### Modifier Examples

```css
/* Button modifiers */
.button--primary {
    background-color: #007bff;
    color: white;
}

.button--secondary {
    background-color: #6c757d;
    color: white;
}

.button--large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
}

.button--small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

/* Card modifiers */
.card--featured {
    border: 2px solid #007bff;
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.15);
}

.card--compact {
    padding: 1rem;
}

/* Navigation modifiers */
.navigation__link--active {
    color: #007bff;
    font-weight: 600;
}
```

### Complete BEM Example

```html
<div class="product-card product-card--featured">
    <div class="product-card__image">
        <img src="product.jpg" alt="Product" />
        <div class="product-card__badge product-card__badge--sale">Sale</div>
    </div>
    <div class="product-card__content">
        <h3 class="product-card__title">Product Name</h3>
        <p class="product-card__description">Product description here...</p>
        <div class="product-card__price">
            <span class="product-card__price-current">$29.99</span>
            <span
                class="product-card__price-original product-card__price-original--crossed"
                >$39.99</span
            >
        </div>
    </div>
    <div class="product-card__actions">
        <button class="button button--primary button--full-width">
            Add to Cart
        </button>
    </div>
</div>
```

```css
/* Block */
.product-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

/* Block modifier */
.product-card--featured {
    border: 2px solid #007bff;
    transform: scale(1.02);
}

/* Elements */
.product-card__image {
    position: relative;
    overflow: hidden;
}

.product-card__badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.product-card__badge--sale {
    background-color: #dc3545;
    color: white;
}

.product-card__content {
    padding: 1.5rem;
}

.product-card__title {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
}

.product-card__description {
    margin: 0 0 1rem;
    color: #666;
    line-height: 1.5;
}

.product-card__price {
    margin-bottom: 1rem;
}

.product-card__price-current {
    font-size: 1.25rem;
    font-weight: 600;
    color: #007bff;
}

.product-card__price-original {
    margin-left: 0.5rem;
    color: #999;
}

.product-card__price-original--crossed {
    text-decoration: line-through;
}

.product-card__actions {
    padding: 0 1.5rem 1.5rem;
}

/* Button component */
.button--full-width {
    width: 100%;
}
```

---

## OOCSS (Object-Oriented CSS)

Separating structure from skin and container from content.

### Structure vs Skin

```css
/* Structure (layout and positioning) */
.button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border: 1px solid transparent;
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

/* Skin (visual appearance) */
.button-primary {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
}

.button-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
    color: white;
}

.button-outline {
    background-color: transparent;
    border-color: #007bff;
    color: #007bff;
}
```

### Container vs Content

```css
/* Bad: Content depends on container */
.sidebar h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
}

.footer h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
}

/* Good: Reusable content objects */
.heading-secondary {
    font-size: 1.2rem;
    margin-bottom: 1rem;
}

.heading-tertiary {
    font-size: 1rem;
    margin-bottom: 0.5rem;
}
```

### Media Object Pattern

```css
.media {
    display: flex;
    align-items: flex-start;
}

.media__object {
    flex-shrink: 0;
    margin-right: 1rem;
}

.media__body {
    flex: 1;
}

.media__title {
    margin: 0 0 0.5rem;
}

.media__text {
    margin: 0;
}
```

```html
<div class="media">
    <img src="avatar.jpg" class="media__object" alt="User" />
    <div class="media__body">
        <h4 class="media__title">John Doe</h4>
        <p class="media__text">
            This is a comment using the media object pattern.
        </p>
    </div>
</div>
```

---

## CSS Preprocessors

Tools that extend CSS with variables, nesting, and functions.

### Sass/SCSS Features

#### Variables

```scss
// Variables
$primary-color: #007bff;
$secondary-color: #6c757d;
$font-size-base: 1rem;
$spacing-unit: 1rem;

// Usage
.button {
    background-color: $primary-color;
    font-size: $font-size-base;
    padding: $spacing-unit * 0.75 $spacing-unit * 1.5;
}
```

#### Nesting

```scss
.navigation {
    display: flex;
    padding: 1rem 0;

    &__list {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    &__item {
        margin-right: 2rem;

        &:last-child {
            margin-right: 0;
        }
    }

    &__link {
        color: #333;
        text-decoration: none;

        &:hover {
            color: $primary-color;
        }

        &--active {
            color: $primary-color;
            font-weight: 600;
        }
    }
}
```

#### Mixins

```scss
// Define mixin
@mixin button-style($bg-color, $text-color: white, $border-radius: 4px) {
    background-color: $bg-color;
    color: $text-color;
    border-radius: $border-radius;
    padding: 0.75rem 1.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background-color: darken($bg-color, 10%);
    }
}

// Use mixin
.button-primary {
    @include button-style($primary-color);
}

.button-secondary {
    @include button-style($secondary-color);
}
```

#### Functions

```scss
// Custom functions
@function rem($pixels) {
    @return #{$pixels / 16}rem;
}

@function shade($color, $percentage) {
    @return mix(black, $color, $percentage);
}

// Usage
.title {
    font-size: rem(24); // 1.5rem
    color: shade($primary-color, 20%);
}
```

---

## Performance Optimization

### CSS Organization

```css
/* 1. Reset/Normalize */
*,
*::before,
*::after {
    box-sizing: border-box;
}

/* 2. Variables */
:root {
    --primary-color: #007bff;
    --font-family: "Helvetica Neue", Arial, sans-serif;
}

/* 3. Base styles */
body {
    font-family: var(--font-family);
    line-height: 1.6;
}

/* 4. Layout components */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* 5. UI components */
.button {
    /* ... */
}
.card {
    /* ... */
}

/* 6. Utilities */
.text-center {
    text-align: center;
}
.margin-bottom-large {
    margin-bottom: 2rem;
}
```

### Efficient Selectors

```css
/* Avoid over-qualified selectors */
/* Bad */
div.container div.row div.col-12 p.text {
    color: #333;
}

/* Good */
.text {
    color: #333;
}

/* Avoid deep nesting */
/* Bad */
.header .nav .menu .item .link:hover {
    color: red;
}

/* Good */
.nav__link:hover {
    color: red;
}
```

### Critical CSS

```html
<!-- Inline critical CSS -->
<style>
    /* Above-the-fold styles */
    .header {
        /* ... */
    }
    .hero {
        /* ... */
    }
    .navigation {
        /* ... */
    }
</style>

<!-- Load non-critical CSS asynchronously -->
<link
    rel="preload"
    href="styles.css"
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
/>
```

### CSS Minification

```css
/* Development */
.button {
    background-color: #007bff;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
}

/* Production (minified) */
.button {
    background-color: #007bff;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
}
```

---

## Maintainable CSS Practices

### File Organization

```
styles/
├── abstracts/
│   ├── _variables.scss
│   ├── _mixins.scss
│   └── _functions.scss
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _utilities.scss
├── components/
│   ├── _buttons.scss
│   ├── _cards.scss
│   ├── _forms.scss
│   └── _navigation.scss
├── layout/
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _grid.scss
│   └── _sidebar.scss
├── pages/
│   ├── _home.scss
│   ├── _about.scss
│   └── _contact.scss
└── main.scss
```

### Naming Conventions

```css
/* Use descriptive names */
.navigation-primary {
    /* Not .nav1 */
}
.button-call-to-action {
    /* Not .btn-cta */
}
.product-card-featured {
    /* Not .pc-feat */
}

/* Use consistent patterns */
.component__element--modifier .block__element--modifier .object-property--value;
```

### Documentation

```css
/**
 * Button Component
 * 
 * A flexible button component with multiple variants.
 * 
 * @example
 * <button class="button button--primary">Primary Button</button>
 * <button class="button button--secondary">Secondary Button</button>
 */
.button {
    /* Base button styles */
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

/**
 * Primary button variant
 * Used for main call-to-action elements
 */
.button--primary {
    background-color: var(--primary-color);
    color: white;
}
```

### Code Reviews

```css
/* Good practices to check */
✅ Consistent naming convention
✅ No magic numbers (use variables)
✅ Reusable components
✅ Appropriate specificity
✅ Cross-browser compatibility
✅ Performance considerations

/* Anti-patterns to avoid */
❌ !important usage
❌ Over-qualified selectors
❌ Hard-coded values
❌ Browser-specific code without fallbacks
❌ Unused CSS
```

### Testing CSS

```css
/* Use CSS Lint rules */
/* stylelint configuration example */
{
  "rules": {
    "block-no-empty": true,
    "color-no-invalid-hex": true,
    "declaration-colon-space-after": "always",
    "declaration-colon-space-before": "never",
    "function-comma-space-after": "always",
    "max-nesting-depth": 3,
    "selector-max-id": 0
  }
}
```

---

## Next Steps

You've mastered CSS architecture and best practices! In **Phase 6: Modern CSS Features**, you'll learn:

-   CSS Container Queries
-   CSS Subgrid
-   CSS Cascade Layers
-   New CSS Functions
-   Future CSS Features

---

**🎉 Congratulations on completing Phase 5!**

You now have the knowledge to write scalable, maintainable CSS for large projects and teams.
