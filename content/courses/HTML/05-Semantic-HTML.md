# Phase 5: Semantic HTML

## 🎯 What You'll Learn

-   HTML5 semantic elements and their proper usage
-   Document structure and accessibility principles
-   SEO-friendly markup techniques
-   Modern HTML best practices
-   Creating meaningful and well-structured web pages

---

## 📖 Table of Contents

1. [Introduction to Semantic HTML](#introduction-to-semantic-html)
2. [Document Structure Elements](#document-structure-elements)
3. [Content Sectioning Elements](#content-sectioning-elements)
4. [Text-Level Semantic Elements](#text-level-semantic-elements)
5. [Accessibility and ARIA](#accessibility-and-aria)
6. [SEO and Semantic Markup](#seo-and-semantic-markup)
7. [Practical Examples](#practical-examples)
8. [Exercises](#exercises)

---

## Introduction to Semantic HTML

### What is Semantic HTML?

Semantic HTML uses HTML elements according to their **meaning** rather than their appearance. It describes the content's purpose and structure, making it more accessible and SEO-friendly.

### Benefits of Semantic HTML:

-   **Accessibility**: Screen readers can better understand content
-   **SEO**: Search engines can better index your content
-   **Maintainability**: Code is easier to read and maintain
-   **Future-proof**: Content adapts better to new technologies
-   **Performance**: Cleaner, more efficient code

### Semantic vs Non-Semantic

```html
<!-- Non-semantic (avoid this) -->
<div class="header">
    <div class="nav">
        <div class="nav-item">Home</div>
        <div class="nav-item">About</div>
    </div>
</div>
<div class="content">
    <div class="article">
        <div class="title">Article Title</div>
        <div class="text">Article content...</div>
    </div>
</div>

<!-- Semantic (preferred) -->
<header>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </nav>
</header>
<main>
    <article>
        <h1>Article Title</h1>
        <p>Article content...</p>
    </article>
</main>
```

---

## Document Structure Elements

### 1. `<header>` Element

Contains introductory content, typically navigation, logos, or headings.

```html
<!-- Page header -->
<header>
    <img src="logo.png" alt="Company Logo" />
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
    </nav>
</header>

<!-- Article header -->
<article>
    <header>
        <h1>Article Title</h1>
        <p>
            By <strong>Author Name</strong> on
            <time datetime="2024-01-15">January 15, 2024</time>
        </p>
    </header>
    <p>Article content...</p>
</article>
```

### 2. `<nav>` Element

Represents navigation links for the current document or other documents.

```html
<!-- Main navigation -->
<nav aria-label="Main navigation">
    <ul>
        <li><a href="/" aria-current="page">Home</a></li>
        <li><a href="/products">Products</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
    </ul>
</nav>

<!-- Breadcrumb navigation -->
<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/products">Products</a></li>
        <li aria-current="page">Laptops</li>
    </ol>
</nav>

<!-- Table of contents -->
<nav aria-label="Table of contents">
    <h2>Contents</h2>
    <ol>
        <li><a href="#introduction">Introduction</a></li>
        <li><a href="#methods">Methods</a></li>
        <li><a href="#results">Results</a></li>
    </ol>
</nav>
```

### 3. `<main>` Element

Represents the dominant content of the document. Only one `<main>` per page.

```html
<body>
    <header>Site header</header>
    <nav>Navigation</nav>

    <main>
        <h1>Main Content Area</h1>
        <p>This is the primary content of the page.</p>
        <article>
            <h2>Article Title</h2>
            <p>Article content...</p>
        </article>
    </main>

    <aside>Sidebar</aside>
    <footer>Site footer</footer>
</body>
```

### 4. `<aside>` Element

Contains content that is tangentially related to the main content.

```html
<!-- Page sidebar -->
<aside>
    <h2>Related Articles</h2>
    <ul>
        <li><a href="/article1">First Related Article</a></li>
        <li><a href="/article2">Second Related Article</a></li>
    </ul>
</aside>

<!-- Article sidebar -->
<article>
    <h1>Main Article</h1>
    <p>Article content...</p>

    <aside>
        <h3>Quick Fact</h3>
        <p>This is additional information related to the article.</p>
    </aside>
</article>
```

### 5. `<footer>` Element

Contains information about its nearest ancestor sectioning content.

```html
<!-- Page footer -->
<footer>
    <p>&copy; 2024 Company Name. All rights reserved.</p>
    <nav>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
    </nav>
</footer>

<!-- Article footer -->
<article>
    <header>
        <h1>Article Title</h1>
    </header>
    <p>Article content...</p>
    <footer>
        <p>Published: <time datetime="2024-01-15">January 15, 2024</time></p>
        <p>
            Tags: <a href="/tag/html">HTML</a>,
            <a href="/tag/web">Web Development</a>
        </p>
    </footer>
</article>
```

---

## Content Sectioning Elements

### 1. `<section>` Element

Represents a thematic grouping of content with a heading.

```html
<main>
    <section>
        <h2>Our Services</h2>
        <p>Description of services...</p>

        <section>
            <h3>Web Design</h3>
            <p>Web design details...</p>
        </section>

        <section>
            <h3>Web Development</h3>
            <p>Development details...</p>
        </section>
    </section>

    <section>
        <h2>About Us</h2>
        <p>Company information...</p>
    </section>
</main>
```

### 2. `<article>` Element

Represents a complete, independent piece of content.

```html
<!-- Blog post -->
<article>
    <header>
        <h1>How to Learn HTML</h1>
        <p>By <a href="/author/jane">Jane Doe</a></p>
        <time datetime="2024-01-15">January 15, 2024</time>
    </header>

    <p>HTML is the foundation of web development...</p>

    <section>
        <h2>Getting Started</h2>
        <p>To begin learning HTML...</p>
    </section>

    <footer>
        <p>Filed under: <a href="/category/web-dev">Web Development</a></p>
    </footer>
</article>

<!-- Product listing -->
<section>
    <h2>Featured Products</h2>

    <article>
        <h3>Laptop Pro</h3>
        <img src="laptop.jpg" alt="Laptop Pro" />
        <p>High-performance laptop for professionals.</p>
        <p>Price: $1,299</p>
    </article>

    <article>
        <h3>Tablet Max</h3>
        <img src="tablet.jpg" alt="Tablet Max" />
        <p>Versatile tablet for creativity and productivity.</p>
        <p>Price: $599</p>
    </article>
</section>
```

### 3. When to Use Section vs Article

**Use `<article>` when:**

-   Content makes sense on its own
-   Could be distributed independently
-   Examples: blog posts, news articles, product cards, comments

**Use `<section>` when:**

-   Content is part of a larger whole
-   Represents a thematic grouping
-   Examples: chapters, tabs, grouped content areas

```html
<!-- Article with sections -->
<article>
    <header>
        <h1>Complete Guide to Gardening</h1>
    </header>

    <section>
        <h2>Planning Your Garden</h2>
        <p>First step is planning...</p>
    </section>

    <section>
        <h2>Choosing Plants</h2>
        <p>Select appropriate plants...</p>
    </section>

    <section>
        <h2>Maintenance Tips</h2>
        <p>Keep your garden healthy...</p>
    </section>
</article>
```

---

## Text-Level Semantic Elements

### 1. Time and Dates

```html
<!-- Specific date -->
<p>Published on <time datetime="2024-01-15">January 15, 2024</time></p>

<!-- Date with time -->
<p>
    Event starts at
    <time datetime="2024-01-15T19:00">7:00 PM on January 15th</time>
</p>

<!-- Duration -->
<p>The meeting lasted <time datetime="PT2H">2 hours</time></p>

<!-- Relative time -->
<p>
    Posted
    <time datetime="2024-01-10" title="January 10, 2024">5 days ago</time>
</p>
```

### 2. Contact Information

```html
<address>
    <p>Contact information for the article author:</p>
    <p>
        <strong>Jane Doe</strong><br />
        Email: <a href="mailto:jane@example.com">jane@example.com</a><br />
        Phone: <a href="tel:+1234567890">(123) 456-7890</a><br />
        Website: <a href="https://janedoe.com">janedoe.com</a>
    </p>
</address>
```

### 3. Definitions and Abbreviations

```html
<p>
    <dfn>HTML</dfn> (HyperText Markup Language) is the standard markup language
    for creating web pages.
</p>

<p>
    The <abbr title="World Wide Web Consortium">W3C</abbr> maintains the HTML
    specification.
</p>

<p>
    We use <abbr title="Cascading Style Sheets">CSS</abbr> for styling and
    <abbr title="JavaScript">JS</abbr> for interactivity.
</p>
```

### 4. Code and Technical Content

```html
<p>To create a paragraph, use the <code>&lt;p&gt;</code> element.</p>

<p>The variable <var>x</var> represents the horizontal position.</p>

<p>Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy the selected text.</p>

<p>The output was: <samp>Process completed successfully</samp></p>
```

---

## Accessibility and ARIA

### 1. ARIA Landmarks

```html
<body>
    <header role="banner">
        <nav role="navigation" aria-label="Main navigation">
            <!-- Navigation content -->
        </nav>
    </header>

    <main role="main">
        <!-- Main content -->
    </main>

    <aside role="complementary" aria-label="Sidebar">
        <!-- Sidebar content -->
    </aside>

    <footer role="contentinfo">
        <!-- Footer content -->
    </footer>
</body>
```

### 2. ARIA Labels and Descriptions

```html
<!-- Label for form sections -->
<section aria-labelledby="contact-heading">
    <h2 id="contact-heading">Contact Information</h2>
    <!-- Form content -->
</section>

<!-- Description for complex content -->
<img src="chart.png" alt="Sales chart" aria-describedby="chart-desc" />
<p id="chart-desc">
    The chart shows a 25% increase in sales from Q1 to Q2, with the highest
    growth in the mobile category.
</p>

<!-- Current page indication -->
<nav>
    <a href="/">Home</a>
    <a href="/about" aria-current="page">About</a>
    <a href="/contact">Contact</a>
</nav>
```

### 3. Skip Links

```html
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <header>
        <nav>
            <!-- Navigation -->
        </nav>
    </header>

    <main id="main-content">
        <!-- Main content -->
    </main>
</body>
```

---

## SEO and Semantic Markup

### 1. Structured Data with HTML

```html
<article itemscope itemtype="https://schema.org/Article">
    <header>
        <h1 itemprop="headline">How to Bake Perfect Cookies</h1>
        <p>By <span itemprop="author">Jane Baker</span></p>
        <time itemprop="datePublished" datetime="2024-01-15"
            >January 15, 2024</time
        >
    </header>

    <div itemprop="articleBody">
        <p>Baking perfect cookies requires...</p>
    </div>
</article>
```

### 2. Proper Heading Hierarchy

```html
<body>
    <header>
        <h1>Site Name</h1>
        <!-- Only one h1 per page -->
    </header>

    <main>
        <article>
            <header>
                <h2>Article Title</h2>
                <!-- Or h1 if main content -->
            </header>

            <section>
                <h3>Section Heading</h3>

                <h4>Subsection Heading</h4>
                <p>Content...</p>

                <h4>Another Subsection</h4>
                <p>Content...</p>
            </section>

            <section>
                <h3>Another Section</h3>
                <p>Content...</p>
            </section>
        </article>
    </main>
</body>
```

---

## Practical Examples

### Example 1: Complete Blog Post Page

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Understanding Semantic HTML - Web Dev Blog</title>
        <meta
            name="description"
            content="Learn how to use semantic HTML elements to create accessible and SEO-friendly web pages."
        />
    </head>
    <body>
        <a href="#main-content" class="skip-link">Skip to main content</a>

        <header role="banner">
            <h1>Web Dev Blog</h1>
            <nav role="navigation" aria-label="Main navigation">
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/tutorials">Tutorials</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </nav>
        </header>

        <nav aria-label="Breadcrumb">
            <ol>
                <li><a href="/">Home</a></li>
                <li><a href="/tutorials">Tutorials</a></li>
                <li aria-current="page">Understanding Semantic HTML</li>
            </ol>
        </nav>

        <main id="main-content" role="main">
            <article itemscope itemtype="https://schema.org/Article">
                <header>
                    <h1 itemprop="headline">Understanding Semantic HTML</h1>
                    <p>
                        By <span itemprop="author">Sarah Johnson</span> |
                        Published:
                        <time itemprop="datePublished" datetime="2024-01-15"
                            >January 15, 2024</time
                        >
                        | Reading time:
                        <span itemprop="timeRequired">5 minutes</span>
                    </p>
                </header>

                <div itemprop="articleBody">
                    <p>
                        Semantic HTML is the foundation of accessible and
                        SEO-friendly web development...
                    </p>

                    <section>
                        <h2>What is Semantic HTML?</h2>
                        <p>
                            Semantic HTML uses elements according to their
                            meaning...
                        </p>
                    </section>

                    <section>
                        <h2>Benefits of Semantic Markup</h2>
                        <ul>
                            <li>Improved accessibility</li>
                            <li>Better SEO performance</li>
                            <li>Cleaner, more maintainable code</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Common Semantic Elements</h2>
                        <p>The most important semantic elements include...</p>

                        <aside>
                            <h3>Quick Tip</h3>
                            <p>
                                Always use headings in hierarchical order to
                                maintain document structure.
                            </p>
                        </aside>
                    </section>
                </div>

                <footer>
                    <p>
                        Tags: <a href="/tag/html" rel="tag">HTML</a>,
                        <a href="/tag/accessibility" rel="tag">Accessibility</a
                        >,
                        <a href="/tag/seo" rel="tag">SEO</a>
                    </p>
                    <p>
                        Share this article:
                        <a href="#" aria-label="Share on Twitter">Twitter</a>
                        <a href="#" aria-label="Share on Facebook">Facebook</a>
                    </p>
                </footer>
            </article>

            <section aria-labelledby="related-heading">
                <h2 id="related-heading">Related Articles</h2>
                <article>
                    <h3><a href="/html-forms">HTML Forms Best Practices</a></h3>
                    <p>
                        Learn how to create accessible and user-friendly
                        forms...
                    </p>
                    <time datetime="2024-01-10">January 10, 2024</time>
                </article>
                <article>
                    <h3><a href="/css-layouts">Modern CSS Layouts</a></h3>
                    <p>Explore flexbox and grid for responsive layouts...</p>
                    <time datetime="2024-01-08">January 8, 2024</time>
                </article>
            </section>
        </main>

        <aside role="complementary" aria-labelledby="sidebar-heading">
            <h2 id="sidebar-heading">About the Author</h2>
            <img src="author.jpg" alt="Sarah Johnson" />
            <p>Sarah is a front-end developer with 8 years of experience...</p>

            <section>
                <h3>Newsletter</h3>
                <p>Get weekly web development tips delivered to your inbox.</p>
                <form>
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                    <button type="submit">Subscribe</button>
                </form>
            </section>
        </aside>

        <footer role="contentinfo">
            <p>&copy; 2024 Web Dev Blog. All rights reserved.</p>
            <nav aria-label="Footer navigation">
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms of Service</a>
                <a href="/sitemap">Sitemap</a>
            </nav>

            <address>
                <p>
                    Contact us:
                    <a href="mailto:contact@webdevblog.com"
                        >contact@webdevblog.com</a
                    >
                </p>
            </address>
        </footer>
    </body>
</html>
```

### Example 2: E-commerce Product Page

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Premium Laptop - TechStore</title>
    </head>
    <body>
        <header>
            <h1>TechStore</h1>
            <nav aria-label="Main navigation">
                <ul>
                    <li><a href="/">Home</a></li>
                    <li>
                        <a href="/products" aria-current="page">Products</a>
                    </li>
                    <li><a href="/support">Support</a></li>
                </ul>
            </nav>
        </header>

        <nav aria-label="Breadcrumb">
            <ol>
                <li><a href="/">Home</a></li>
                <li><a href="/products">Products</a></li>
                <li><a href="/products/laptops">Laptops</a></li>
                <li aria-current="page">Premium Laptop Pro</li>
            </ol>
        </nav>

        <main>
            <article itemscope itemtype="https://schema.org/Product">
                <header>
                    <h1 itemprop="name">Premium Laptop Pro</h1>
                </header>

                <section>
                    <img
                        itemprop="image"
                        src="laptop-main.jpg"
                        alt="Premium Laptop Pro - Front view"
                    />

                    <div
                        itemprop="offers"
                        itemscope
                        itemtype="https://schema.org/Offer"
                    >
                        <p>Price: <span itemprop="price">$1,299.99</span></p>
                        <p>
                            Availability:
                            <span itemprop="availability">In Stock</span>
                        </p>
                    </div>
                </section>

                <section>
                    <h2>Product Description</h2>
                    <div itemprop="description">
                        <p>
                            Experience ultimate performance with our Premium
                            Laptop Pro...
                        </p>
                    </div>
                </section>

                <section>
                    <h2>Specifications</h2>
                    <dl>
                        <dt>Processor</dt>
                        <dd>Intel Core i7-12700H</dd>

                        <dt>Memory</dt>
                        <dd>16GB DDR4</dd>

                        <dt>Storage</dt>
                        <dd>512GB NVMe SSD</dd>

                        <dt>Display</dt>
                        <dd>15.6" 4K OLED</dd>
                    </dl>
                </section>

                <section>
                    <h2>Customer Reviews</h2>
                    <article>
                        <header>
                            <h3>Excellent performance!</h3>
                            <p>
                                By John D. |
                                <time datetime="2024-01-10"
                                    >January 10, 2024</time
                                >
                            </p>
                        </header>
                        <p>This laptop exceeded my expectations...</p>
                    </article>
                </section>
            </article>
        </main>

        <aside>
            <section>
                <h2>Related Products</h2>
                <article>
                    <h3>Laptop Accessories</h3>
                    <p>Enhance your laptop experience...</p>
                </article>
            </section>
        </aside>

        <footer>
            <p>&copy; 2024 TechStore. All rights reserved.</p>
        </footer>
    </body>
</html>
```

---

## Exercises

### Exercise 1: News Website Layout

Create a news website homepage with:

-   Proper document structure using semantic elements
-   Multiple article previews
-   Navigation with breadcrumbs
-   Sidebar with related content
-   Proper heading hierarchy

### Exercise 2: Portfolio Website

Build a personal portfolio with:

-   About section using appropriate semantic markup
-   Project showcase using articles
-   Contact information with address element
-   Navigation between different sections
-   Proper time elements for project dates

### Exercise 3: Restaurant Website

Design a restaurant website including:

-   Menu sections with proper structure
-   Location and contact information
-   Event listings with time elements
-   Customer testimonials as articles
-   Reservation form with semantic markup

### Exercise 4: Documentation Site

Create a technical documentation page with:

-   Table of contents navigation
-   Multiple sections with proper nesting
-   Code examples with appropriate elements
-   Glossary using definition lists
-   Author information and publication dates

---

## 🎯 Key Takeaways

1. **Use semantic elements** for their meaning, not appearance
2. **Only one `<main>` element** per page
3. **Proper heading hierarchy** improves accessibility and SEO
4. **ARIA attributes** enhance accessibility when semantic HTML isn't enough
5. **Structured data** helps search engines understand your content
6. **Test with screen readers** to ensure accessibility

---

## 🚀 Next Phase Preview

In **Phase 6: Advanced HTML**, you'll learn:

-   HTML5 APIs and advanced features
-   Canvas and SVG for graphics
-   Web components and custom elements
-   Modern HTML techniques and emerging standards

---

## 📝 Quick Reference

### Document Structure:

```html
<header>
    <!-- Page/section header -->
    <nav>
        <!-- Navigation links -->
        <main>
            <!-- Main content (one per page) -->
            <section>
                <!-- Thematic grouping -->
                <article>
                    <!-- Independent content -->
                    <aside>
                        <!-- Tangentially related content -->
                        <footer><!-- Page/section footer --></footer>
                    </aside>
                </article>
            </section>
        </main>
    </nav>
</header>
```

### Content Elements:

```html
<time datetime="2024-01-15">
    <!-- Dates and times -->
    <address>
        <!-- Contact information -->
        <abbr title="Full form">
            <!-- Abbreviations -->
            <dfn>
                <!-- Definitions -->
                <code> <!-- Code snippets --></code></dfn
            ></abbr
        >
    </address></time
>
```

### Accessibility:

-   Use proper heading hierarchy (h1-h6)
-   Include ARIA labels when needed
-   Provide skip links for navigation
-   Use semantic elements over generic divs

**Ready for Phase 6?** You've mastered semantic HTML!
