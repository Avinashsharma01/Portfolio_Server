# Phase 1: HTML Fundamentals

## 🎯 What You'll Learn

-   What is HTML and how it works
-   Basic HTML document structure
-   Essential HTML tags
-   How to create your first webpage

---

## 📖 Table of Contents

1. [What is HTML?](#what-is-html)
2. [HTML Document Structure](#html-document-structure)
3. [Essential HTML Tags](#essential-html-tags)
4. [Creating Your First Webpage](#creating-your-first-webpage)
5. [Exercises](#exercises)

---

## What is HTML?

**HTML** stands for **HyperText Markup Language**. It's the standard language used to create web pages.

### Key Concepts:

-   **HyperText**: Text that contains links to other texts
-   **Markup**: A way of annotating text to indicate how it should be structured or displayed
-   **Language**: A set of rules and syntax for creating web content

### How HTML Works:

1. You write HTML code in a text file
2. Save the file with `.html` extension
3. Open it in a web browser
4. Browser interprets the HTML and displays the webpage

---

## HTML Document Structure

Every HTML document follows a basic structure:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Page Title</title>
    </head>
    <body>
        <!-- Your content goes here -->
    </body>
</html>
```

### Breaking It Down:

#### 1. `<!DOCTYPE html>`

-   Declares the document type
-   Tells the browser this is an HTML5 document
-   Must be the first line

#### 2. `<html>` Element

-   Root element of the page
-   Contains all other elements
-   `lang="en"` specifies the language (English)

#### 3. `<head>` Section

-   Contains metadata about the document
-   Not visible to users
-   Includes title, styles, scripts, etc.

#### 4. `<meta>` Tags

-   `charset="UTF-8"`: Character encoding
-   `viewport`: Controls page scaling on mobile devices

#### 5. `<title>` Element

-   Sets the page title (appears in browser tab)
-   Important for SEO

#### 6. `<body>` Section

-   Contains all visible content
-   Everything users see on the webpage

---

## Essential HTML Tags

### 1. HTML Tags Syntax

```html
<tagname>content</tagname>
```

-   **Opening tag**: `<tagname>`
-   **Content**: The text or other elements
-   **Closing tag**: `</tagname>`

### 2. Self-Closing Tags

Some tags don't need closing tags:

```html
<img src="image.jpg" alt="Description" />
<br />
<hr />
<meta charset="UTF-8" />
```

### 3. Basic Text Tags

#### Headings (h1-h6)

```html
<h1>Main Heading</h1>
<h2>Section Heading</h2>
<h3>Subsection Heading</h3>
<h4>Minor Heading</h4>
<h5>Small Heading</h5>
<h6>Smallest Heading</h6>
```

#### Paragraphs

```html
<p>This is a paragraph of text.</p>
<p>This is another paragraph.</p>
```

#### Line Breaks and Horizontal Rules

```html
<p>First line<br />Second line</p>
<hr />
<p>Text after horizontal rule</p>
```

### 4. Text Formatting Tags

```html
<strong>Bold/Important text</strong>
<em>Italic/Emphasized text</em>
<u>Underlined text</u>
<mark>Highlighted text</mark>
<small>Small text</small>
<del>Deleted text</del>
<ins>Inserted text</ins>
```

### 5. Comments

```html
<!-- This is a comment and won't be displayed -->
<p>This will be displayed</p>
```

---

## Creating Your First Webpage

Let's create a simple webpage step by step:

### Step 1: Create the File

1. Open a text editor (Notepad, VS Code, etc.)
2. Save as `my-first-page.html`

### Step 2: Add the HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My First Webpage</title>
    </head>
    <body>
        <h1>Welcome to My First Webpage!</h1>
        <p>This is my first paragraph in HTML.</p>
        <p>I'm learning <strong>HTML</strong> and it's <em>awesome</em>!</p>
    </body>
</html>
```

### Step 3: View in Browser

1. Save the file
2. Double-click to open in your default browser
3. Or right-click → "Open with" → Choose browser

---

## Exercises

### Exercise 1: Basic Page

Create an HTML page with:

-   A title "About Me"
-   A main heading with your name
-   3 paragraphs about yourself
-   Use at least 3 different text formatting tags

### Exercise 2: Content Structure

Create a page about your favorite hobby with:

-   A descriptive title
-   Multiple heading levels (h1, h2, h3)
-   Several paragraphs
-   Use comments to organize your code

### Exercise 3: Experiment

Try these variations:

-   Change the language attribute to your native language
-   Add different types of text formatting
-   Create a page with multiple sections using headings

---

## 🎯 Key Takeaways

1. **HTML is markup language** for creating web pages
2. **Every HTML document** needs the basic structure (DOCTYPE, html, head, body)
3. **Tags come in pairs** (opening and closing) with content between
4. **Headings (h1-h6)** create hierarchy and structure
5. **Always include** proper metadata in the head section

---

## 🚀 Next Phase Preview

In **Phase 2: Text and Content Elements**, you'll learn:

-   Advanced text formatting
-   Different types of lists
-   Block vs inline elements
-   Semantic meaning of tags

---

## 📝 Quick Reference

### Basic Structure Template:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Title Here</title>
    </head>
    <body>
        <!-- Your content here -->
    </body>
</html>
```

### Essential Tags:

-   `<h1>` to `<h6>`: Headings
-   `<p>`: Paragraphs
-   `<strong>`: Important text
-   `<em>`: Emphasized text
-   `<br>`: Line break
-   `<hr>`: Horizontal rule
-   `<!-- -->`: Comments

**Ready for Phase 2?** You've mastered the fundamentals!
