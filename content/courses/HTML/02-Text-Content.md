# Phase 2: Text and Content Elements

## 🎯 What You'll Learn

-   Advanced text formatting techniques
-   Different types of lists (ordered, unordered, nested)
-   Block vs inline elements
-   Semantic meaning of content tags
-   Text organization and structure

---

## 📖 Table of Contents

1. [Advanced Text Formatting](#advanced-text-formatting)
2. [Lists in HTML](#lists-in-html)
3. [Block vs Inline Elements](#block-vs-inline-elements)
4. [Quotes and Citations](#quotes-and-citations)
5. [Code and Preformatted Text](#code-and-preformatted-text)
6. [Practical Examples](#practical-examples)
7. [Exercises](#exercises)

---

## Advanced Text Formatting

### Text Emphasis and Importance

```html
<!-- Semantic emphasis -->
<em>Emphasized text (usually italic)</em>
<strong>Strong importance (usually bold)</strong>
<mark>Highlighted text</mark>

<!-- Visual formatting (less semantic) -->
<i>Italic text</i>
<b>Bold text</b>
<u>Underlined text</u>

<!-- Other formatting -->
<small>Fine print or legal text</small>
<sub>Subscript H₂O</sub>
<sup>Superscript E=mc²</sup>
<del>Deleted text</del>
<ins>Inserted text</ins>
```

### Abbreviations and Definitions

```html
<abbr title="HyperText Markup Language">HTML</abbr> <dfn>HTML</dfn> is the
standard markup language for web pages.

<!-- Keyboard input and sample output -->
<kbd>Ctrl + C</kbd> to copy
<samp>Command executed successfully</samp>
<var>x</var> = 10
```

### Address and Contact Information

```html
<address>
    Written by <a href="mailto:john@example.com">John Doe</a><br />
    Visit us at:<br />
    Example.com<br />
    Box 564, Disneyland<br />
    USA
</address>
```

---

## Lists in HTML

### 1. Unordered Lists (Bullet Points)

```html
<ul>
    <li>First item</li>
    <li>Second item</li>
    <li>Third item</li>
</ul>
```

### 2. Ordered Lists (Numbered)

```html
<ol>
    <li>First step</li>
    <li>Second step</li>
    <li>Third step</li>
</ol>
```

### 3. Ordered List Attributes

```html
<!-- Start from different number -->
<ol start="5">
    <li>Fifth item</li>
    <li>Sixth item</li>
</ol>

<!-- Different numbering types -->
<ol type="A">
    <li>Item A</li>
    <li>Item B</li>
</ol>

<ol type="I">
    <li>Item I</li>
    <li>Item II</li>
</ol>

<!-- Reversed order -->
<ol reversed>
    <li>Last item (3)</li>
    <li>Second item (2)</li>
    <li>First item (1)</li>
</ol>
```

### 4. Nested Lists

```html
<ul>
    <li>
        Main topic 1
        <ul>
            <li>Subtopic 1.1</li>
            <li>
                Subtopic 1.2
                <ul>
                    <li>Sub-subtopic 1.2.1</li>
                    <li>Sub-subtopic 1.2.2</li>
                </ul>
            </li>
        </ul>
    </li>
    <li>Main topic 2</li>
</ul>
```

### 5. Description Lists

```html
<dl>
    <dt>HTML</dt>
    <dd>HyperText Markup Language</dd>

    <dt>CSS</dt>
    <dd>Cascading Style Sheets</dd>

    <dt>JavaScript</dt>
    <dd>Programming language for web interactivity</dd>
    <dd>Also known as JS</dd>
</dl>
```

---

## Block vs Inline Elements

### Block Elements

-   Take up the full width available
-   Start on a new line
-   Can contain other block and inline elements

```html
<!-- Block elements -->
<div>This is a div (generic block container)</div>
<p>This is a paragraph</p>
<h1>This is a heading</h1>
<ul>
    <li>List item</li>
</ul>
<blockquote>This is a blockquote</blockquote>
```

### Inline Elements

-   Only take up necessary width
-   Don't start on a new line
-   Can only contain other inline elements

```html
<!-- Inline elements -->
<span>This is a span (generic inline container)</span>
<a href="#">This is a link</a>
<strong>Strong text</strong>
<em>Emphasized text</em>
<code>Code snippet</code>
```

### Example: Block vs Inline

```html
<p>
    This is a paragraph with <strong>inline bold text</strong> and
    <em>inline italic text</em> that flows naturally.
</p>

<div>This div will take the full width</div>
<div>This div will be on a new line</div>

<span>This span</span> <span>and this span</span> will be on the same line.
```

---

## Quotes and Citations

### 1. Blockquotes (Long Quotes)

```html
<blockquote cite="https://example.com/source">
    <p>The best way to predict the future is to invent it.</p>
    <footer>— <cite>Alan Kay</cite></footer>
</blockquote>
```

### 2. Inline Quotes

```html
<p>As Einstein said, <q>Imagination is more important than knowledge.</q></p>
```

### 3. Citations

```html
<p>I learned this from <cite>The HTML Handbook</cite> by Jane Doe.</p>
```

---

## Code and Preformatted Text

### 1. Inline Code

```html
<p>Use the <code>&lt;p&gt;</code> tag for paragraphs.</p>
<p>The <code>console.log()</code> function prints to the console.</p>
```

### 2. Code Blocks

```html
<pre><code>
function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("World"));
</code></pre>
```

### 3. Preformatted Text

```html
<pre>
This text will preserve
    all spaces
        and line breaks
exactly as written.
</pre>
```

### 4. Sample Output

```html
<p>When you run the command, you'll see:</p>
<samp> $ npm install Installing packages... Done! </samp>
```

---

## Practical Examples

### Example 1: Blog Post Structure

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My Blog Post</title>
    </head>
    <body>
        <h1>Getting Started with HTML</h1>

        <p>Published on <time datetime="2024-01-15">January 15, 2024</time></p>

        <p>
            <strong>HTML</strong> (<abbr title="HyperText Markup Language"
                >HTML</abbr
            >) is the foundation of web development. In this post, we'll
            explore:
        </p>

        <ol>
            <li>Basic HTML structure</li>
            <li>Essential tags</li>
            <li>Best practices</li>
        </ol>

        <h2>What is HTML?</h2>
        <p>
            HTML is a <em>markup language</em> that defines the structure and
            content of web pages.
        </p>

        <blockquote>
            <p>HTML is the language of the web.</p>
            <footer>— <cite>Web Development Fundamentals</cite></footer>
        </blockquote>

        <h3>Key Features</h3>
        <ul>
            <li>Easy to learn</li>
            <li>Platform independent</li>
            <li>Widely supported</li>
        </ul>
    </body>
</html>
```

### Example 2: Recipe Page

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Chocolate Chip Cookies Recipe</title>
    </head>
    <body>
        <h1>Grandma's Chocolate Chip Cookies</h1>

        <p><em>Prep time:</em> 15 minutes | <em>Bake time:</em> 12 minutes</p>

        <h2>Ingredients</h2>
        <ul>
            <li>2¼ cups all-purpose flour</li>
            <li>1 cup butter, softened</li>
            <li>¾ cup brown sugar</li>
            <li>½ cup white sugar</li>
            <li>2 large eggs</li>
            <li>2 cups chocolate chips</li>
        </ul>

        <h2>Instructions</h2>
        <ol>
            <li>Preheat oven to <strong>375°F</strong></li>
            <li>Mix dry ingredients in a large bowl</li>
            <li>Cream butter and sugars together</li>
            <li>Add eggs one at a time</li>
            <li>Gradually blend in flour mixture</li>
            <li>Stir in chocolate chips</li>
            <li>Bake for <strong>9-11 minutes</strong></li>
        </ol>

        <p><small>Recipe serves 24 cookies</small></p>
    </body>
</html>
```

---

## Exercises

### Exercise 1: Personal Bio

Create a personal biography page with:

-   Your name as the main heading
-   A paragraph about yourself using various text formatting tags
-   An unordered list of your hobbies
-   An ordered list of your career goals
-   Use at least 3 abbreviations with proper `<abbr>` tags

### Exercise 2: Book Review

Create a book review page including:

-   Book title and author
-   A blockquote with your favorite passage
-   Description list of book details (genre, pages, published date)
-   Nested lists for pros and cons
-   Use proper semantic tags for emphasis

### Exercise 3: Technical Tutorial

Write a mini tutorial about something you know:

-   Use multiple heading levels
-   Include code examples with `<code>` tags
-   Add a glossary using description lists
-   Use preformatted text for code blocks
-   Include proper citations

### Exercise 4: Recipe Collection

Create a page with 2-3 simple recipes:

-   Each recipe in its own section
-   Ingredient lists (unordered)
-   Step-by-step instructions (ordered)
-   Use time elements for cooking times
-   Include serving information

---

## 🎯 Key Takeaways

1. **Semantic meaning matters** - Use `<strong>` and `<em>` for importance, not just visual styling
2. **Lists organize information** - Choose the right list type for your content
3. **Block vs inline** affects layout and what elements can contain
4. **Quotes and citations** add credibility and proper attribution
5. **Code formatting** helps distinguish technical content

---

## 🚀 Next Phase Preview

In **Phase 3: Links and Media**, you'll learn:

-   Creating hyperlinks (internal and external)
-   Working with images
-   Embedding audio and video
-   File paths and URLs

---

## 📝 Quick Reference

### List Types:

-   `<ul>`: Unordered list (bullets)
-   `<ol>`: Ordered list (numbers)
-   `<dl>`: Description list (terms and definitions)

### Text Semantics:

-   `<strong>`: Important (bold)
-   `<em>`: Emphasis (italic)
-   `<mark>`: Highlighted
-   `<code>`: Code snippets
-   `<abbr>`: Abbreviations

### Block vs Inline:

-   **Block**: `<div>`, `<p>`, `<h1>-<h6>`, `<ul>`, `<ol>`, `<blockquote>`
-   **Inline**: `<span>`, `<a>`, `<strong>`, `<em>`, `<code>`

**Ready for Phase 3?** You've mastered text and content structure!
