# Phase 1: CSS Basics

## Table of Contents

1. [What is CSS?](#what-is-css)
2. [CSS Syntax](#css-syntax)
3. [Adding CSS to HTML](#adding-css-to-html)
4. [CSS Selectors](#css-selectors)
5. [Colors in CSS](#colors-in-css)
6. [Text and Fonts](#text-and-fonts)
7. [CSS Units](#css-units)
8. [Basic Properties](#basic-properties)
9. [Practice Exercises](#practice-exercises)

---

## What is CSS?

**CSS (Cascading Style Sheets)** is a stylesheet language used to describe how HTML elements should be displayed. It controls the visual presentation of web pages.

### Key Benefits:

-   **Separation of Content and Presentation**: HTML for structure, CSS for styling
-   **Reusability**: One CSS file can style multiple HTML pages
-   **Maintainability**: Easy to update styles across entire websites
-   **Performance**: External CSS files can be cached by browsers

---

## CSS Syntax

CSS consists of **rules** that define how elements should look.

### Basic Structure:

```css
selector {
    property: value;
    property: value;
}
```

### Example:

```css
h1 {
    color: blue;
    font-size: 24px;
    text-align: center;
}
```

### Components Explained:

-   **Selector** (`h1`): Targets which HTML elements to style
-   **Declaration Block** (`{}`): Contains all styling rules
-   **Property** (`color`): The aspect you want to change
-   **Value** (`blue`): How you want to change it
-   **Declaration** (`color: blue;`): Property + value + semicolon

---

## Adding CSS to HTML

There are three ways to add CSS to HTML:

### 1. Inline CSS

Applied directly to HTML elements using the `style` attribute.

```html
<h1 style="color: red; font-size: 32px;">Hello World</h1>
<p style="color: blue;">This is a paragraph.</p>
```

**Use Case**: Quick styling for single elements
**Pros**: High specificity, immediate application
**Cons**: Not reusable, harder to maintain

### 2. Internal CSS

CSS placed within `<style>` tags in the HTML document's `<head>`.

```html
<!DOCTYPE html>
<html>
    <head>
        <style>
            h1 {
                color: green;
                text-align: center;
            }
            p {
                color: navy;
                font-family: Arial, sans-serif;
            }
        </style>
    </head>
    <body>
        <h1>Welcome</h1>
        <p>This is styled with internal CSS.</p>
    </body>
</html>
```

**Use Case**: Single-page styling
**Pros**: No external files needed
**Cons**: Not reusable across pages

### 3. External CSS (Recommended)

CSS in separate `.css` files, linked to HTML.

**styles.css:**

```css
h1 {
    color: purple;
    font-size: 28px;
}

p {
    color: darkgreen;
    line-height: 1.6;
}
```

**index.html:**

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="styles.css" />
    </head>
    <body>
        <h1>My Website</h1>
        <p>Styled with external CSS!</p>
    </body>
</html>
```

**Use Case**: Multi-page websites
**Pros**: Reusable, maintainable, cacheable
**Cons**: Additional HTTP request

---

## CSS Selectors

Selectors determine which HTML elements receive styling.

### 1. Element Selectors

Target elements by their tag name.

```css
h1 {
    color: red;
}
p {
    font-size: 16px;
}
div {
    background-color: yellow;
}
```

### 2. Class Selectors

Target elements with specific class attributes (use `.`).

**HTML:**

```html
<p class="highlight">Important text</p>
<div class="container">Content here</div>
```

**CSS:**

```css
.highlight {
    background-color: yellow;
    font-weight: bold;
}

.container {
    max-width: 800px;
    margin: 0 auto;
}
```

### 3. ID Selectors

Target elements with specific ID attributes (use `#`).

**HTML:**

```html
<header id="main-header">Site Header</header>
<section id="about">About section</section>
```

**CSS:**

```css
#main-header {
    background-color: navy;
    color: white;
    padding: 20px;
}

#about {
    margin: 50px 0;
}
```

### 4. Universal Selector

Targets all elements (use `*`).

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```

### 5. Descendant Selectors

Target elements inside other elements.

**HTML:**

```html
<div class="article">
    <h2>Article Title</h2>
    <p>Article content with <strong>bold text</strong>.</p>
</div>
```

**CSS:**

```css
.article h2 {
    color: darkblue;
    margin-bottom: 10px;
}

.article p strong {
    color: red;
}
```

### 6. Multiple Selectors

Apply same styles to multiple elements (use `,`).

```css
h1,
h2,
h3 {
    font-family: "Arial", sans-serif;
    color: #333;
}

.button,
.btn,
input[type="submit"] {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
}
```

---

## Colors in CSS

### 1. Named Colors

CSS has 140 predefined color names.

```css
.red-text {
    color: red;
}
.blue-bg {
    background-color: blue;
}
.green-border {
    border-color: green;
}
```

### 2. Hexadecimal Colors

6-digit codes representing RGB values.

```css
.hex-color {
    color: #ff0000; /* Red */
    background: #00ff00; /* Green */
    border-color: #0000ff; /* Blue */
}

/* 3-digit shorthand */
.short-hex {
    color: #f00; /* Same as #FF0000 */
    background: #0f0; /* Same as #00FF00 */
}
```

### 3. RGB Colors

Specify red, green, blue values (0-255).

```css
.rgb-colors {
    color: rgb(255, 0, 0); /* Red */
    background: rgb(0, 255, 0); /* Green */
    border-color: rgb(0, 0, 255); /* Blue */
}
```

### 4. RGBA Colors

RGB with alpha (transparency) channel (0-1).

```css
.rgba-colors {
    background: rgba(255, 0, 0, 0.5); /* 50% transparent red */
    color: rgba(0, 0, 0, 0.8); /* 80% opaque black */
}
```

### 5. HSL Colors

Hue (0-360), Saturation (0-100%), Lightness (0-100%).

```css
.hsl-colors {
    color: hsl(0, 100%, 50%); /* Red */
    background: hsl(120, 100%, 50%); /* Green */
}
```

### 6. HSLA Colors

HSL with alpha transparency.

```css
.hsla-colors {
    background: hsla(240, 100%, 50%, 0.3); /* 30% transparent blue */
}
```

---

## Text and Fonts

### Font Properties

#### 1. font-family

Specifies which font to use.

```css
.serif-font {
    font-family: "Times New Roman", Times, serif;
}

.sans-serif-font {
    font-family: Arial, Helvetica, sans-serif;
}

.monospace-font {
    font-family: "Courier New", Courier, monospace;
}

/* Web fonts */
.custom-font {
    font-family: "Open Sans", sans-serif;
}
```

#### 2. font-size

Controls text size.

```css
.small-text {
    font-size: 12px;
}
.normal-text {
    font-size: 16px;
}
.large-text {
    font-size: 24px;
}
.huge-text {
    font-size: 48px;
}
```

#### 3. font-weight

Controls text thickness.

```css
.light {
    font-weight: 300;
}
.normal {
    font-weight: 400;
} /* or font-weight: normal; */
.bold {
    font-weight: 700;
} /* or font-weight: bold; */
.extra-bold {
    font-weight: 900;
}
```

#### 4. font-style

Controls text slant.

```css
.normal {
    font-style: normal;
}
.italic {
    font-style: italic;
}
.oblique {
    font-style: oblique;
}
```

### Text Properties

#### 1. color

Sets text color.

```css
.red-text {
    color: red;
}
.blue-text {
    color: #0066cc;
}
.gray-text {
    color: rgb(128, 128, 128);
}
```

#### 2. text-align

Controls horizontal text alignment.

```css
.left {
    text-align: left;
}
.center {
    text-align: center;
}
.right {
    text-align: right;
}
.justify {
    text-align: justify;
}
```

#### 3. text-decoration

Adds lines to text.

```css
.underline {
    text-decoration: underline;
}
.overline {
    text-decoration: overline;
}
.line-through {
    text-decoration: line-through;
}
.no-decoration {
    text-decoration: none;
} /* Remove default link underline */
```

#### 4. text-transform

Changes text case.

```css
.uppercase {
    text-transform: uppercase;
}
.lowercase {
    text-transform: lowercase;
}
.capitalize {
    text-transform: capitalize;
}
```

#### 5. line-height

Controls space between lines.

```css
.tight-lines {
    line-height: 1.2;
}
.normal-lines {
    line-height: 1.5;
}
.loose-lines {
    line-height: 2;
}
```

#### 6. letter-spacing

Controls space between characters.

```css
.tight-letters {
    letter-spacing: -1px;
}
.normal-letters {
    letter-spacing: normal;
}
.spaced-letters {
    letter-spacing: 2px;
}
```

---

## CSS Units

### Absolute Units

Fixed size regardless of other elements.

```css
.absolute-units {
    width: 300px; /* Pixels */
    height: 2in; /* Inches */
    margin: 1cm; /* Centimeters */
    padding: 10mm; /* Millimeters */
    font-size: 12pt; /* Points */
}
```

### Relative Units

Size relative to other elements.

```css
.relative-units {
    width: 50%; /* Percentage of parent */
    font-size: 1.2em; /* 1.2x parent font size */
    margin: 2rem; /* 2x root font size */
    height: 50vh; /* 50% of viewport height */
    width: 80vw; /* 80% of viewport width */
}
```

#### Common Relative Units:

-   **%**: Percentage of parent element
-   **em**: Relative to element's font size
-   **rem**: Relative to root element's font size
-   **vh**: Viewport height (1vh = 1% of viewport height)
-   **vw**: Viewport width (1vw = 1% of viewport width)

---

## Basic Properties

### Background Properties

```css
.background-examples {
    background-color: lightblue;
    background-image: url("image.jpg");
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    /* Shorthand */
    background: lightblue url("image.jpg") no-repeat center/cover;
}
```

### Border Properties

```css
.border-examples {
    border-width: 2px;
    border-style: solid;
    border-color: red;

    /* Shorthand */
    border: 2px solid red;

    /* Individual sides */
    border-top: 1px solid black;
    border-right: 2px dashed blue;
    border-bottom: 3px dotted green;
    border-left: 4px double purple;

    /* Border radius for rounded corners */
    border-radius: 10px;
}
```

### Spacing Properties

```css
.spacing-examples {
    /* Margin (outside spacing) */
    margin: 20px; /* All sides */
    margin: 10px 20px; /* Top/bottom, left/right */
    margin: 10px 15px 20px 25px; /* Top, right, bottom, left */

    /* Padding (inside spacing) */
    padding: 15px; /* All sides */
    padding: 10px 20px; /* Top/bottom, left/right */
    padding: 5px 10px 15px 20px; /* Top, right, bottom, left */

    /* Individual sides */
    margin-top: 10px;
    padding-left: 20px;
}
```

### Display Properties

```css
.display-examples {
    display: block; /* Takes full width, starts new line */
    display: inline; /* Takes only needed width, no line break */
    display: inline-block; /* Inline but can have width/height */
    display: none; /* Element not displayed */
}
```

---

## Practice Exercises

### Exercise 1: Basic Styling

Create an HTML page with:

-   A heading with blue color and center alignment
-   A paragraph with green text and Arial font
-   A div with yellow background and red border

```html
<!DOCTYPE html>
<html>
    <head>
        <style>
            /* Your CSS here */
        </style>
    </head>
    <body>
        <h1>Welcome to My Site</h1>
        <p>This is a sample paragraph.</p>
        <div>This is a highlighted section.</div>
    </body>
</html>
```

### Exercise 2: Text Styling

Style a poem with:

-   Title: 24px, bold, centered
-   Stanzas: 16px, line-height 1.6
-   Author: italic, right-aligned, gray color

### Exercise 3: Color Schemes

Create three versions of a button using:

1. Named colors
2. Hex colors
3. RGB/RGBA colors

### Exercise 4: Selectors Practice

Create a page with navigation menu and style using:

-   Element selectors for basic styling
-   Class selectors for specific components
-   ID selectors for unique elements

---

## Next Steps

Once you're comfortable with these basics, move on to **Phase 2: Box Model & Layout** where you'll learn about:

-   The CSS Box Model
-   Positioning elements
-   Creating layouts with floats
-   Understanding document flow

---

**🎉 Congratulations on completing Phase 1!**

Remember: Practice makes perfect. Try building a simple webpage using only the concepts from this phase before moving forward.
