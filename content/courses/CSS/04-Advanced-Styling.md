# Phase 4: Advanced Styling

## Table of Contents

1. [CSS Pseudo-classes](#css-pseudo-classes)
2. [CSS Pseudo-elements](#css-pseudo-elements)
3. [CSS Transitions](#css-transitions)
4. [CSS Animations](#css-animations)
5. [CSS Custom Properties](#css-custom-properties)
6. [Advanced Selectors](#advanced-selectors)

---

## CSS Pseudo-classes

Pseudo-classes select elements based on their state or position.

### Interactive States

```css
/* Link states */
a:link {
    color: blue;
}
a:visited {
    color: purple;
}
a:hover {
    color: red;
}
a:active {
    color: orange;
}
a:focus {
    outline: 2px solid blue;
}

/* Button states */
button:hover {
    background-color: #007bff;
    transform: translateY(-2px);
}

button:active {
    transform: translateY(0);
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

### Form States

```css
/* Input states */
input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

input:valid {
    border-color: green;
}

input:invalid {
    border-color: red;
}

input:required {
    border-left: 3px solid orange;
}

/* Checkbox and radio */
input[type="checkbox"]:checked + label {
    font-weight: bold;
    color: green;
}
```

### Structural Pseudo-classes

```css
/* First and last child */
li:first-child {
    font-weight: bold;
}

li:last-child {
    border-bottom: none;
}

/* Nth child patterns */
tr:nth-child(odd) {
    background-color: #f9f9f9;
}

tr:nth-child(even) {
    background-color: white;
}

tr:nth-child(3n) {
    background-color: lightblue; /* Every 3rd row */
}

/* Advanced nth patterns */
.item:nth-child(3n + 1) {
    margin-left: 0; /* 1st, 4th, 7th items */
}
```

### Practical Examples

```html
<nav class="navbar">
    <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#contact">Contact</a></li>
    </ul>
</nav>
```

```css
.navbar ul {
    display: flex;
    list-style: none;
    padding: 0;
}

.navbar li:not(:last-child) {
    margin-right: 2rem;
}

.navbar a {
    text-decoration: none;
    color: #333;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.navbar a:hover {
    background-color: #007bff;
    color: white;
}
```

---

## CSS Pseudo-elements

Pseudo-elements create virtual elements that don't exist in HTML.

### ::before and ::after

```css
/* Adding decorative elements */
.quote {
    position: relative;
    font-style: italic;
    padding: 1rem 2rem;
}

.quote::before {
    content: "" ";
    font-size: 3rem;
    position: absolute;
    left: 0;
    top: -0.5rem;
    color: #007bff;
}

.quote::after {
    content: " "";
    font-size: 3rem;
    position: absolute;
    right: 0;
    bottom: -1rem;
    color: #007bff;
}
```

### Creating Icons and Shapes

```css
/* CSS-only hamburger menu */
.hamburger {
    width: 30px;
    height: 20px;
    position: relative;
    cursor: pointer;
}

.hamburger::before,
.hamburger::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: #333;
    transition: all 0.3s ease;
}

.hamburger::before {
    top: 0;
}

.hamburger::after {
    bottom: 0;
}

.hamburger.active::before {
    transform: rotate(45deg);
    top: 9px;
}

.hamburger.active::after {
    transform: rotate(-45deg);
    bottom: 9px;
}
```

### Text Styling

```css
/* First letter styling */
.article::first-letter {
    font-size: 3rem;
    font-weight: bold;
    float: left;
    line-height: 1;
    margin-right: 0.5rem;
}

/* First line styling */
.intro::first-line {
    font-weight: bold;
    color: #007bff;
}

/* Selection styling */
::selection {
    background-color: #007bff;
    color: white;
}
```

---

## CSS Transitions

Smooth animations between states.

### Basic Transitions

```css
.button {
    background-color: #007bff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    /* Transition all properties */
    transition: all 0.3s ease;
}

.button:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

### Specific Property Transitions

```css
.card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    /* Multiple property transitions */
    transition: transform 0.3s ease, box-shadow 0.3s ease,
        background-color 0.2s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    background-color: #f8f9fa;
}
```

### Transition Timing Functions

```css
.timing-examples {
    transition-duration: 0.5s;
}

.ease {
    transition-timing-function: ease;
}
.ease-in {
    transition-timing-function: ease-in;
}
.ease-out {
    transition-timing-function: ease-out;
}
.ease-in-out {
    transition-timing-function: ease-in-out;
}
.linear {
    transition-timing-function: linear;
}

/* Custom cubic-bezier */
.custom-timing {
    transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

---

## CSS Animations

Complex keyframe animations.

### Basic Keyframe Animation

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

.fade-in {
    animation: fadeIn 0.6s ease-out;
}
```

### Multi-step Animations

```css
@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.7;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.pulse {
    animation: pulse 2s infinite;
}
```

### Loading Animations

```css
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-20px);
    }
    60% {
        transform: translateY(-10px);
    }
}

.bounce {
    animation: bounce 2s infinite;
}
```

### Animation Properties

```css
.animation-example {
    animation-name: slideIn;
    animation-duration: 1s;
    animation-timing-function: ease-in-out;
    animation-delay: 0.5s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-fill-mode: forwards;
    animation-play-state: running;

    /* Shorthand */
    animation: slideIn 1s ease-in-out 0.5s infinite alternate forwards;
}
```

---

## CSS Custom Properties

CSS Variables for dynamic styling.

### Defining Variables

```css
:root {
    /* Color palette */
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;

    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 3rem;

    /* Typography */
    --font-family-primary: "Helvetica Neue", Arial, sans-serif;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### Using Variables

```css
.button {
    background-color: var(--primary-color);
    color: white;
    padding: var(--spacing-sm) var(--spacing-md);
    font-family: var(--font-family-primary);
    border-radius: 4px;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s ease;
}

.button:hover {
    box-shadow: var(--shadow-md);
}

.button--secondary {
    background-color: var(--secondary-color);
}

.button--success {
    background-color: var(--success-color);
}
```

### Dynamic Theming

```css
/* Light theme (default) */
:root {
    --bg-color: white;
    --text-color: #333;
    --border-color: #ddd;
}

/* Dark theme */
[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #f0f0f0;
    --border-color: #444;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    border-color: var(--border-color);
    transition: all 0.3s ease;
}
```

### Component-Scoped Variables

```css
.card {
    --card-padding: 1.5rem;
    --card-border-radius: 8px;
    --card-shadow: var(--shadow-md);

    padding: var(--card-padding);
    border-radius: var(--card-border-radius);
    box-shadow: var(--card-shadow);
}

.card--compact {
    --card-padding: 1rem;
}

.card--rounded {
    --card-border-radius: 16px;
}
```

---

## Advanced Selectors

Powerful targeting techniques.

### Attribute Selectors

```css
/* Exact match */
input[type="email"] {
    border-color: blue;
}

/* Contains word */
div[class~="highlight"] {
    background-color: yellow;
}

/* Starts with */
a[href^="https"] {
    color: green;
}

/* Ends with */
a[href$=".pdf"] {
    color: red;
}

/* Contains substring */
img[alt*="logo"] {
    max-width: 200px;
}

/* Case insensitive */
input[type="text" i] {
    text-transform: uppercase;
}
```

### Combinators

```css
/* Adjacent sibling */
h2 + p {
    margin-top: 0;
    font-weight: bold;
}

/* General sibling */
h2 ~ p {
    color: #666;
}

/* Child combinator */
.nav > li {
    display: inline-block;
}

/* Descendant combinator */
.card p {
    margin-bottom: 1rem;
}
```

### Advanced Pseudo-selectors

```css
/* Not selector */
li:not(.active) {
    opacity: 0.7;
}

/* Has selector (future) */
.card:has(img) {
    padding-top: 0;
}

/* Where selector */
:where(h1, h2, h3) {
    margin-top: 0;
}

/* Is selector */
:is(h1, h2, h3):hover {
    color: var(--primary-color);
}
```

### Practical Examples

```html
<form class="contact-form">
    <div class="form-group">
        <label for="name">Name *</label>
        <input type="text" id="name" required />
    </div>
    <div class="form-group">
        <label for="email">Email *</label>
        <input type="email" id="email" required />
    </div>
    <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message"></textarea>
    </div>
    <button type="submit">Send Message</button>
</form>
```

```css
.contact-form {
    --form-spacing: 1.5rem;
    --border-radius: 4px;
    --focus-color: var(--primary-color);
}

.form-group {
    margin-bottom: var(--form-spacing);
}

.form-group:last-child {
    margin-bottom: 0;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

/* Required field indicator */
label[for] input:required {
    border-left: 3px solid var(--warning-color);
}

input,
textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-family: inherit;
    transition: all 0.3s ease;
}

/* Focus states */
input:focus,
textarea:focus {
    outline: none;
    border-color: var(--focus-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Validation states */
input:valid {
    border-color: var(--success-color);
}

input:invalid:not(:placeholder-shown) {
    border-color: var(--danger-color);
}

/* Submit button */
button[type="submit"] {
    background: var(--primary-color);
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
}

button[type="submit"]:hover {
    background: #0056b3;
    transform: translateY(-2px);
}

button[type="submit"]:active {
    transform: translateY(0);
}
```

---

## Next Steps

You've mastered advanced CSS styling techniques! In **Phase 5: CSS Architecture**, you'll learn:

-   CSS Methodologies (BEM, OOCSS, SMACSS)
-   CSS Preprocessors (Sass, Less)
-   CSS-in-JS concepts
-   Performance optimization
-   Maintainable CSS practices

---

**🎉 Congratulations on completing Phase 4!**

You now have powerful tools for creating interactive, animated, and dynamic user interfaces.
