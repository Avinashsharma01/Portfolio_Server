# Phase 02 — HTML Fundamentals

## Table of Contents

- [What is HTML?](#what-is-html)
- [HTML Document Structure](#html-document-structure)
- [Elements, Tags & Attributes](#elements-tags--attributes)
- [Text Content Elements](#text-content-elements)
- [Links & Navigation](#links--navigation)
- [Images & Media](#images--media)
- [Lists](#lists)
- [Tables](#tables)
- [Forms & Input Elements](#forms--input-elements)
- [Semantic HTML](#semantic-html)
- [HTML5 APIs & Attributes](#html5-apis--attributes)
- [Head Section Deep Dive](#head-section-deep-dive)
- [Common Mistakes](#common-mistakes)
- [Key Takeaways](#key-takeaways)

---

## What is HTML?

HTML (**HyperText Markup Language**) is the **standard language for creating web pages**. It defines the **structure and content** of a page — what things ARE, not how they look.

Think of building a house:

| Building a House | Building a Web Page |
|-----------------|-------------------|
| **Blueprints** (structure) | **HTML** (structure) |
| **Interior design** (appearance) | **CSS** (styling) |
| **Electrical system** (functionality) | **JavaScript** (interactivity) |

HTML is the **blueprint** — it defines rooms, walls, doors, and windows. CSS decorates them. JavaScript makes them interactive.

### HTML is NOT a Programming Language

> HTML is a **markup language**. It describes structure, not logic. There are no variables, loops, or conditions in HTML.

---

## HTML Document Structure

Every HTML page follows this basic structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
</body>
</html>
```

### What Each Part Does

| Element | Purpose |
|---------|---------|
| `<!DOCTYPE html>` | Tells the browser "this is HTML5" |
| `<html lang="en">` | Root element, `lang` helps screen readers and SEO |
| `<head>` | Metadata — not visible on the page |
| `<meta charset="UTF-8">` | Character encoding (supports all languages/emojis) |
| `<meta name="viewport">` | Makes the page responsive on mobile |
| `<title>` | Browser tab title + search engine title |
| `<body>` | Everything visible on the page goes here |

### The `DOCTYPE` Evolution

```
HTML 4.01:  <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
             "http://www.w3.org/TR/html4/loose.dtd">

XHTML 1.0:  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
             "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

HTML5:      <!DOCTYPE html>
```

> HTML5 made everything simpler. Always use `<!DOCTYPE html>`.

---

## Elements, Tags & Attributes

### Anatomy of an HTML Element

```
Opening Tag    Content    Closing Tag
     │            │            │
     ▼            ▼            ▼
    <p>    Hello, World!     </p>
    └──────────────────────────┘
           Complete Element
```

### Void Elements (Self-Closing)

Some elements don't have content or closing tags:

```html
<br>         <!-- Line break -->
<hr>         <!-- Horizontal rule -->
<img>        <!-- Image -->
<input>      <!-- Form input -->
<meta>       <!-- Metadata -->
<link>       <!-- External resource link -->
```

### Attributes

Attributes provide **extra information** about elements:

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
    Visit Example
</a>
```

| Part | What It Is |
|------|-----------|
| `href` | The URL to link to |
| `target="_blank"` | Open in a new tab |
| `rel="noopener noreferrer"` | Security — prevents the new page from accessing your page |

### Global Attributes (Work on Any Element)

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `id` | Unique identifier | `<div id="header">` |
| `class` | CSS class(es) | `<p class="intro highlight">` |
| `style` | Inline CSS | `<p style="color: red;">` |
| `title` | Tooltip on hover | `<abbr title="HyperText">HT</abbr>` |
| `data-*` | Custom data | `<div data-user-id="123">` |
| `hidden` | Hides the element | `<p hidden>Secret</p>` |
| `tabindex` | Keyboard focus order | `<div tabindex="0">` |
| `lang` | Language of content | `<p lang="es">Hola</p>` |

---

## Text Content Elements

### Headings

HTML has **six heading levels**. They create a document outline — like a book's table of contents.

```html
<h1>Main Title</h1>        <!-- Only ONE per page -->
<h2>Section</h2>            <!-- Main sections -->
<h3>Subsection</h3>         <!-- Subsections -->
<h4>Sub-subsection</h4>     <!-- Deeper nesting -->
<h5>Detail</h5>             <!-- Rare -->
<h6>Fine Detail</h6>        <!-- Very rare -->
```

> **Rule:** Don't skip heading levels. Go from `<h1>` → `<h2>` → `<h3>`, not `<h1>` → `<h4>`.

### Paragraphs and Text Formatting

```html
<p>This is a paragraph. Browsers add space above and below paragraphs.</p>

<strong>Important text</strong>     <!-- Semantic: strong importance -->
<b>Bold text</b>                    <!-- Visual only: bold -->

<em>Emphasized text</em>            <!-- Semantic: stress emphasis -->
<i>Italic text</i>                  <!-- Visual only: italic -->

<mark>Highlighted text</mark>       <!-- Yellow highlight -->
<small>Fine print</small>           <!-- Smaller text -->
<del>Deleted text</del>             <!-- Strikethrough -->
<ins>Inserted text</ins>            <!-- Underlined -->
<sub>H<sub>2</sub>O</sub>          <!-- Subscript -->
<sup>E=mc<sup>2</sup></sup>        <!-- Superscript -->
```

### `<strong>` vs `<b>` and `<em>` vs `<i>`

| Element | Meaning | Screen Reader |
|---------|---------|---------------|
| `<strong>` | **Semantically** important | Reads with emphasis |
| `<b>` | Visually bold, no special meaning | Reads normally |
| `<em>` | **Semantically** emphasized | Changes intonation |
| `<i>` | Visually italic, no special meaning | Reads normally |

> **Always prefer semantic tags** (`<strong>`, `<em>`) over visual tags (`<b>`, `<i>`).

### Block vs Inline Elements

```
BLOCK ELEMENTS (take full width, start on new line):
├── <div>, <p>, <h1>-<h6>
├── <ul>, <ol>, <li>
├── <section>, <article>, <nav>
├── <header>, <footer>, <main>
└── <form>, <table>, <blockquote>

INLINE ELEMENTS (take only needed width, stay in flow):
├── <span>, <a>, <strong>, <em>
├── <img>, <input>, <button>
├── <code>, <br>, <label>
└── <abbr>, <cite>, <mark>
```

---

## Links & Navigation

### Basic Link

```html
<a href="https://example.com">Visit Example</a>
```

### Types of Links

```html
<!-- External link (full URL) -->
<a href="https://google.com">Google</a>

<!-- Internal link (relative path) -->
<a href="/about.html">About Us</a>
<a href="../contact.html">Contact</a>

<!-- Page anchor (jump to section) -->
<a href="#section-2">Jump to Section 2</a>
<h2 id="section-2">Section 2</h2>

<!-- Email link -->
<a href="mailto:hello@example.com">Email Us</a>

<!-- Phone link -->
<a href="tel:+1234567890">Call Us</a>

<!-- Download link -->
<a href="/files/resume.pdf" download>Download Resume</a>

<!-- Open in new tab (always add rel for security) -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
    External Site
</a>
```

> **Security:** Always use `rel="noopener noreferrer"` with `target="_blank"` to prevent the linked page from accessing `window.opener`.

---

## Images & Media

### Images

```html
<!-- Basic image -->
<img src="photo.jpg" alt="A sunset over the ocean" width="800" height="600">

<!-- Always include alt text for accessibility -->
<!-- alt="" for decorative images (screen readers skip them) -->
<img src="decoration.svg" alt="">
```

### The `alt` Attribute

| Image Type | alt Text |
|-----------|----------|
| **Informative** | Describe what the image shows: `alt="Chart showing 50% growth"` |
| **Functional** (link/button) | Describe the action: `alt="Search"` |
| **Decorative** | Empty alt: `alt=""` |
| **Complex** (charts/graphs) | Short alt + longer description nearby |

### Responsive Images

```html
<!-- Different sizes for different screens -->
<img
    src="photo-800.jpg"
    srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
    sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
    alt="A responsive photo"
>

<!-- Modern formats with fallback -->
<picture>
    <source srcset="photo.avif" type="image/avif">
    <source srcset="photo.webp" type="image/webp">
    <img src="photo.jpg" alt="A photo with format fallback">
</picture>
```

### Video & Audio

```html
<!-- Video -->
<video controls width="640" height="360" poster="thumbnail.jpg">
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
    Your browser does not support video.
</video>

<!-- Audio -->
<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
    <source src="audio.ogg" type="audio/ogg">
    Your browser does not support audio.
</audio>
```

---

## Lists

### Unordered List (bullets)

```html
<ul>
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
</ul>
```

### Ordered List (numbers)

```html
<ol>
    <li>Learn HTML</li>
    <li>Learn CSS</li>
    <li>Learn JavaScript</li>
</ol>

<!-- Start from a different number -->
<ol start="5" reversed>
    <li>Fifth item</li>
    <li>Fourth item</li>
</ol>
```

### Definition List

```html
<dl>
    <dt>HTML</dt>
    <dd>HyperText Markup Language — defines page structure</dd>

    <dt>CSS</dt>
    <dd>Cascading Style Sheets — defines page appearance</dd>
</dl>
```

### Nested Lists

```html
<ul>
    <li>Frontend
        <ul>
            <li>HTML</li>
            <li>CSS</li>
            <li>JavaScript</li>
        </ul>
    </li>
    <li>Backend
        <ul>
            <li>Node.js</li>
            <li>Express</li>
        </ul>
    </li>
</ul>
```

---

## Tables

Tables are for **tabular data** — not for layout (that's CSS's job).

```html
<table>
    <caption>Student Grades</caption>
    <thead>
        <tr>
            <th scope="col">Name</th>
            <th scope="col">Subject</th>
            <th scope="col">Grade</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Alice</td>
            <td>Math</td>
            <td>A</td>
        </tr>
        <tr>
            <td>Bob</td>
            <td>Science</td>
            <td>B+</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="2">Average</td>
            <td>A-</td>
        </tr>
    </tfoot>
</table>
```

### Table Accessibility

| Element/Attribute | Purpose |
|-------------------|---------|
| `<caption>` | Describes the table (visible title) |
| `<th>` | Header cell (bold, centered by default) |
| `scope="col"` | This header applies to the column |
| `scope="row"` | This header applies to the row |
| `colspan` / `rowspan` | Cell spans multiple columns/rows |

---

## Forms & Input Elements

Forms are how users **send data** to the server.

### Basic Form

```html
<form action="/submit" method="POST">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>

    <button type="submit">Submit</button>
</form>
```

### Input Types

| Type | What It Renders | Validation |
|------|----------------|------------|
| `text` | Single-line text box | None |
| `email` | Text box | Must be email format |
| `password` | Masked text | None |
| `number` | Number spinner | Must be numeric |
| `tel` | Text box (mobile shows numpad) | None |
| `url` | Text box | Must be URL format |
| `date` | Date picker | Must be valid date |
| `time` | Time picker | Must be valid time |
| `color` | Color picker | Returns hex color |
| `range` | Slider | Between min and max |
| `file` | File upload button | File type filter |
| `checkbox` | Check box | Boolean |
| `radio` | Radio button | One of group |
| `hidden` | Not visible | For sending data |
| `search` | Search box with clear button | None |

### Other Form Elements

```html
<!-- Textarea (multi-line text) -->
<textarea name="message" rows="4" cols="50" placeholder="Type your message..."></textarea>

<!-- Select dropdown -->
<select name="country">
    <option value="">Select a country</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="in">India</option>
</select>

<!-- Fieldset (group related inputs) -->
<fieldset>
    <legend>Shipping Address</legend>
    <label for="street">Street:</label>
    <input type="text" id="street" name="street">
    <!-- More fields... -->
</fieldset>
```

### Form Validation Attributes

```html
<input type="text" required>                    <!-- Must fill -->
<input type="text" minlength="3" maxlength="50">  <!-- Length limits -->
<input type="number" min="1" max="100">         <!-- Value range -->
<input type="text" pattern="[A-Za-z]{3,}">      <!-- Regex pattern -->
<input type="email" placeholder="you@example.com"> <!-- Placeholder hint -->
```

> **Always pair `<label>` with `<input>` using `for`/`id`.** It makes forms accessible and clicking the label focuses the input.

---

## Semantic HTML

Semantic elements describe their **meaning**, not their appearance.

### Non-Semantic vs Semantic

```html
<!-- ❌ Non-semantic — divs don't convey meaning -->
<div id="header">
    <div class="nav">...</div>
</div>
<div id="main">
    <div class="article">...</div>
    <div class="sidebar">...</div>
</div>
<div id="footer">...</div>

<!-- ✅ Semantic — elements describe their purpose -->
<header>
    <nav>...</nav>
</header>
<main>
    <article>...</article>
    <aside>...</aside>
</main>
<footer>...</footer>
```

### Semantic Elements

```
┌─────────────────────────────────────────┐
│  <header>                               │
│    <nav> Navigation links </nav>        │
├─────────────────────────────────────────┤
│  <main>                                 │
│    ┌──────────────────┐  ┌───────────┐  │
│    │  <article>       │  │  <aside>  │  │
│    │    <section>     │  │  Sidebar  │  │
│    │    </section>    │  │  content  │  │
│    │    <section>     │  │           │  │
│    │    </section>    │  │           │  │
│    │  </article>      │  │           │  │
│    └──────────────────┘  └───────────┘  │
├─────────────────────────────────────────┤
│  <footer>                               │
│    Copyright, links                     │
└─────────────────────────────────────────┘
```

| Element | When To Use |
|---------|------------|
| `<header>` | Introductory content, logo, nav |
| `<nav>` | Navigation links |
| `<main>` | Primary content (ONE per page) |
| `<article>` | Self-contained content (blog post, news story) |
| `<section>` | Thematic grouping with a heading |
| `<aside>` | Related but tangential content (sidebar) |
| `<footer>` | Footer content, copyright, links |
| `<figure>` | Self-contained media with caption |
| `<figcaption>` | Caption for `<figure>` |
| `<time>` | Machine-readable date/time |
| `<address>` | Contact information |

### Why Semantic HTML Matters

1. **Accessibility** — screen readers use semantic tags to navigate
2. **SEO** — search engines understand the page structure better
3. **Maintainability** — code is easier to read and understand
4. **Default styling** — semantic elements come with useful defaults

---

## HTML5 APIs & Attributes

### Data Attributes

Store custom data on any element:

```html
<button data-action="delete" data-item-id="42">Delete</button>
```

```javascript
const button = document.querySelector("button");
console.log(button.dataset.action);   // "delete"
console.log(button.dataset.itemId);   // "42" (camelCase conversion)
```

### Content Editable

```html
<div contenteditable="true">
    Click me and start typing! This content is editable.
</div>
```

### Details & Summary (Built-in Accordion)

```html
<details>
    <summary>Click to expand</summary>
    <p>This content is hidden until the user clicks the summary.</p>
</details>
```

### Dialog (Built-in Modal)

```html
<dialog id="myDialog">
    <h2>Confirm Action</h2>
    <p>Are you sure you want to delete this item?</p>
    <button onclick="document.getElementById('myDialog').close()">Cancel</button>
    <button onclick="confirmDelete()">Delete</button>
</dialog>

<button onclick="document.getElementById('myDialog').showModal()">
    Open Dialog
</button>
```

---

## Head Section Deep Dive

The `<head>` contains metadata and resource links:

```html
<head>
    <!-- Character encoding -->
    <meta charset="UTF-8">

    <!-- Responsive design -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- SEO -->
    <meta name="description" content="Learn HTML from scratch">
    <meta name="keywords" content="HTML, web development, tutorial">

    <!-- Social sharing (Open Graph) -->
    <meta property="og:title" content="HTML Tutorial">
    <meta property="og:description" content="Complete guide to HTML">
    <meta property="og:image" content="https://example.com/thumbnail.jpg">
    <meta property="og:url" content="https://example.com/html-tutorial">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">

    <!-- Favicon -->
    <link rel="icon" href="favicon.ico" type="image/x-icon">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="styles.css">

    <!-- Preload critical resources -->
    <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

    <!-- Page title -->
    <title>Page Title — Site Name</title>
</head>
```

---

## Common Mistakes

```html
<!-- ❌ Missing alt on images -->
<img src="photo.jpg">

<!-- ✅ Always include alt -->
<img src="photo.jpg" alt="Team photo at the office">


<!-- ❌ Using <br> for spacing -->
<p>Line 1</p>
<br><br><br>
<p>Line 2</p>

<!-- ✅ Use CSS margin/padding -->
<p style="margin-bottom: 2rem;">Line 1</p>
<p>Line 2</p>


<!-- ❌ Using tables for layout -->
<table>
    <tr><td>Sidebar</td><td>Main Content</td></tr>
</table>

<!-- ✅ Use CSS Flexbox/Grid -->
<div style="display: flex;">
    <aside>Sidebar</aside>
    <main>Main Content</main>
</div>


<!-- ❌ Multiple <h1> tags -->
<h1>Title</h1>
<h1>Another Title</h1>

<!-- ✅ One <h1> per page -->
<h1>Main Title</h1>
<h2>Section Title</h2>


<!-- ❌ Missing label for inputs -->
<input type="text" placeholder="Name">

<!-- ✅ Always pair label with input -->
<label for="name">Name:</label>
<input type="text" id="name" name="name" placeholder="Your name">
```

---

## Key Takeaways

1. **HTML defines structure, not appearance** — use CSS for styling
2. **Every page needs** `<!DOCTYPE html>`, `<html>`, `<head>`, and `<body>`
3. **Use semantic elements** (`<header>`, `<main>`, `<article>`, `<nav>`) over generic `<div>`
4. **Always add `alt` text** to images for accessibility
5. **Pair every `<label>` with its `<input>`** using `for`/`id` attributes
6. **Use `<strong>` and `<em>`** instead of `<b>` and `<i>` — semantics matter
7. **Forms need proper `name` attributes** — that's what gets sent to the server
8. **Don't skip heading levels** — go `h1` → `h2` → `h3` in order
9. **Use `<table>` for data only** — never for page layout
10. **The `<head>` section** controls SEO, social sharing, and resource loading

---

## Practice Exercises

1. **Build a personal profile page** with your name, photo, bio, and links
2. **Create a form** with text, email, password, select, checkbox, and submit button
3. **Build a blog post page** using all semantic elements (`<article>`, `<section>`, `<aside>`, `<time>`)
4. **Make a responsive image gallery** using `<picture>` and `srcset`
5. **Inspect five popular websites** with DevTools — look at their semantic HTML structure

---

**Previous:** [← Phase 01 — How The Browser Works](Phase-01-How-The-Browser-Works.md)
**Next:** [Phase 03 — CSS Fundamentals →](Phase-03-CSS-Fundamentals.md)
