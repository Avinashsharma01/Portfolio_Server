# Phase 3: Links and Media

## 🎯 What You'll Learn

-   Creating hyperlinks (internal and external)
-   Understanding file paths and URLs
-   Working with images and image optimization
-   Embedding audio and video content
-   Creating image maps and multimedia galleries

---

## 📖 Table of Contents

1. [Hyperlinks](#hyperlinks)
2. [File Paths and URLs](#file-paths-and-urls)
3. [Working with Images](#working-with-images)
4. [Audio and Video](#audio-and-video)
5. [Advanced Link Techniques](#advanced-link-techniques)
6. [Practical Examples](#practical-examples)
7. [Exercises](#exercises)

---

## Hyperlinks

### 1. Basic Link Syntax

```html
<a href="destination">Link text</a>
```

### 2. External Links

```html
<!-- Link to another website -->
<a href="https://www.google.com">Visit Google</a>
<a href="https://github.com">GitHub</a>

<!-- Open in new tab/window -->
<a href="https://www.google.com" target="_blank">Open Google in new tab</a>

<!-- Add relationship information -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
    External Link
</a>
```

### 3. Internal Links (Same Website)

```html
<!-- Link to another page -->
<a href="about.html">About Page</a>
<a href="contact.html">Contact Us</a>

<!-- Link to sections within the same page -->
<a href="#section1">Go to Section 1</a>
<a href="#top">Back to Top</a>

<!-- Link to specific section on another page -->
<a href="about.html#team">Our Team Section</a>
```

### 4. Email and Phone Links

```html
<!-- Email links -->
<a href="mailto:someone@example.com">Send Email</a>
<a href="mailto:contact@company.com?subject=Hello&body=Hi there!">
    Email with Subject and Body
</a>

<!-- Phone links -->
<a href="tel:+1234567890">Call Us: (123) 456-7890</a>
<a href="sms:+1234567890">Send SMS</a>
```

### 5. Download Links

```html
<!-- Download a file -->
<a href="document.pdf" download>Download PDF</a>
<a href="image.jpg" download="my-image.jpg">Download Image</a>
```

---

## File Paths and URLs

### 1. Absolute vs Relative Paths

#### Absolute URLs (Complete web addresses)

```html
<a href="https://www.example.com/page.html">Absolute URL</a>
<img src="https://www.example.com/images/photo.jpg" alt="Photo" />
```

#### Relative Paths (Relative to current file)

```html
<!-- Same folder -->
<a href="page2.html">Page 2</a>
<img src="image.jpg" alt="Image" />

<!-- Subfolder -->
<a href="pages/about.html">About</a>
<img src="images/photo.jpg" alt="Photo" />

<!-- Parent folder -->
<a href="../index.html">Home</a>
<img src="../images/logo.png" alt="Logo" />

<!-- Root of website -->
<a href="/home.html">Home</a>
<img src="/assets/banner.jpg" alt="Banner" />
```

### 2. Common File Structure

```
website/
├── index.html
├── about.html
├── contact.html
├── images/
│   ├── logo.png
│   ├── banner.jpg
│   └── gallery/
│       ├── photo1.jpg
│       └── photo2.jpg
├── pages/
│   ├── services.html
│   └── portfolio.html
└── assets/
    ├── styles.css
    └── script.js
```

### 3. Anchor Links (Page Sections)

```html
<!-- Create anchors -->
<h2 id="section1">Section 1</h2>
<h2 id="section2">Section 2</h2>
<h2 id="section3">Section 3</h2>

<!-- Link to anchors -->
<nav>
    <a href="#section1">Go to Section 1</a>
    <a href="#section2">Go to Section 2</a>
    <a href="#section3">Go to Section 3</a>
</nav>
```

---

## Working with Images

### 1. Basic Image Syntax

```html
<img src="image.jpg" alt="Description of image" />
```

### 2. Image Attributes

```html
<img
    src="photo.jpg"
    alt="A beautiful sunset over the ocean"
    title="Sunset Photo"
    width="300"
    height="200"
/>
```

### 3. Responsive Images

```html
<!-- Responsive image (scales with container) -->
<img src="photo.jpg" alt="Photo" style="max-width: 100%; height: auto;" />

<!-- Different images for different screen sizes -->
<picture>
    <source media="(max-width: 799px)" srcset="small-image.jpg" />
    <source media="(min-width: 800px)" srcset="large-image.jpg" />
    <img src="default-image.jpg" alt="Responsive image" />
</picture>
```

### 4. Image as Link

```html
<a href="gallery.html">
    <img src="thumbnail.jpg" alt="View Gallery" />
</a>

<!-- Image link to larger version -->
<a href="large-photo.jpg">
    <img src="thumbnail.jpg" alt="Click to enlarge" />
</a>
```

### 5. Figure and Figcaption

```html
<figure>
    <img src="chart.png" alt="Sales data for 2024" />
    <figcaption>Sales performance chart for 2024</figcaption>
</figure>

<figure>
    <img src="artwork.jpg" alt="Modern abstract painting" />
    <figcaption>
        <strong>"Digital Dreams"</strong> by Jane Artist (2024)
    </figcaption>
</figure>
```

---

## Audio and Video

### 1. Audio Element

```html
<!-- Basic audio -->
<audio controls>
    <source src="audio.mp3" type="audio/mpeg" />
    <source src="audio.ogg" type="audio/ogg" />
    Your browser does not support the audio element.
</audio>

<!-- Audio with autoplay (use carefully) -->
<audio controls autoplay loop>
    <source src="background-music.mp3" type="audio/mpeg" />
</audio>
```

### 2. Video Element

```html
<!-- Basic video -->
<video controls width="400" height="300">
    <source src="video.mp4" type="video/mp4" />
    <source src="video.webm" type="video/webm" />
    Your browser does not support the video element.
</video>

<!-- Video with poster image -->
<video controls width="600" height="400" poster="video-thumbnail.jpg">
    <source src="presentation.mp4" type="video/mp4" />
    <p>
        Your browser doesn't support video.
        <a href="presentation.mp4">Download the video</a> instead.
    </p>
</video>
```

### 3. Audio/Video Attributes

```html
<video
    controls
    width="500"
    height="300"
    autoplay
    loop
    muted
    poster="thumbnail.jpg"
>
    <source src="video.mp4" type="video/mp4" />
</video>

<!-- Common attributes:
- controls: Show playback controls
- autoplay: Start playing automatically (often blocked by browsers)
- loop: Repeat when finished
- muted: Start muted (required for autoplay in many browsers)
- poster: Thumbnail image before playing
- preload: none, metadata, or auto
-->
```

### 4. Embedded Content (YouTube, etc.)

```html
<!-- YouTube embed -->
<iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="YouTube video player"
    frameborder="0"
    allowfullscreen
>
</iframe>

<!-- Responsive iframe -->
<div style="position: relative; padding-bottom: 56.25%; height: 0;">
    <iframe
        src="https://www.youtube.com/embed/VIDEO_ID"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        frameborder="0"
        allowfullscreen
    >
    </iframe>
</div>
```

---

## Advanced Link Techniques

### 1. Link States with Title Attributes

```html
<a href="about.html" title="Learn more about our company">About Us</a>
<a href="contact.html" title="Get in touch with us">Contact</a>
```

### 2. Navigation Menus

```html
<nav>
    <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="services.html">Services</a></li>
        <li><a href="contact.html">Contact</a></li>
    </ul>
</nav>
```

### 3. Breadcrumb Navigation

```html
<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/category/">Category</a></li>
        <li><a href="/category/subcategory/">Subcategory</a></li>
        <li aria-current="page">Current Page</li>
    </ol>
</nav>
```

### 4. Image Maps (Clickable Areas)

```html
<img src="world-map.jpg" alt="World Map" usemap="#worldmap" />

<map name="worldmap">
    <area
        shape="rect"
        coords="0,0,100,100"
        href="north-america.html"
        alt="North America"
    />
    <area shape="circle" coords="200,150,50" href="europe.html" alt="Europe" />
    <area
        shape="poly"
        coords="300,200,400,250,350,300"
        href="asia.html"
        alt="Asia"
    />
</map>
```

---

## Practical Examples

### Example 1: Photo Gallery

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Photo Gallery</title>
    </head>
    <body>
        <h1>My Photo Gallery</h1>

        <nav>
            <a href="#nature">Nature</a> | <a href="#city">City</a> |
            <a href="#people">People</a>
        </nav>

        <section id="nature">
            <h2>Nature Photos</h2>
            <figure>
                <a href="images/large/sunset.jpg">
                    <img
                        src="images/thumbs/sunset.jpg"
                        alt="Beautiful sunset"
                    />
                </a>
                <figcaption>Golden Hour Sunset</figcaption>
            </figure>

            <figure>
                <a href="images/large/forest.jpg">
                    <img src="images/thumbs/forest.jpg" alt="Dense forest" />
                </a>
                <figcaption>Morning in the Forest</figcaption>
            </figure>
        </section>

        <section id="city">
            <h2>City Photos</h2>
            <figure>
                <a href="images/large/skyline.jpg">
                    <img src="images/thumbs/skyline.jpg" alt="City skyline" />
                </a>
                <figcaption>Downtown Skyline at Night</figcaption>
            </figure>
        </section>

        <a href="#top">Back to Top</a>
    </body>
</html>
```

### Example 2: Media Portfolio

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Media Portfolio</title>
    </head>
    <body>
        <h1>My Creative Portfolio</h1>

        <section>
            <h2>Photography</h2>
            <figure>
                <img src="portfolio/photo1.jpg" alt="Portrait photography" />
                <figcaption>Portrait Series - "Urban Life"</figcaption>
            </figure>
        </section>

        <section>
            <h2>Video Work</h2>
            <figure>
                <video controls width="600" poster="video-poster.jpg">
                    <source src="portfolio/demo-reel.mp4" type="video/mp4" />
                    <source src="portfolio/demo-reel.webm" type="video/webm" />
                    <p>
                        Your browser doesn't support video.
                        <a href="portfolio/demo-reel.mp4">Download the video</a
                        >.
                    </p>
                </video>
                <figcaption>Demo Reel 2024</figcaption>
            </figure>
        </section>

        <section>
            <h2>Audio Projects</h2>
            <figure>
                <audio controls>
                    <source src="portfolio/soundtrack.mp3" type="audio/mpeg" />
                    <source src="portfolio/soundtrack.ogg" type="audio/ogg" />
                    Your browser does not support audio.
                </audio>
                <figcaption>Original Soundtrack - "Digital Dreams"</figcaption>
            </figure>
        </section>

        <footer>
            <p>
                Contact me:
                <a href="mailto:artist@example.com">artist@example.com</a>
            </p>
            <p>Phone: <a href="tel:+1234567890">(123) 456-7890</a></p>
        </footer>
    </body>
</html>
```

---

## Exercises

### Exercise 1: Personal Website Navigation

Create a multi-page website with:

-   Home page with navigation to other pages
-   About page with link back to home
-   Gallery page with thumbnail images linking to full size
-   Contact page with email and phone links
-   Use proper relative paths

### Exercise 2: Media-Rich Article

Create an article page including:

-   Images with proper alt text and captions
-   An embedded video or audio file
-   Links to external sources
-   Internal navigation to different sections
-   Download links for resources

### Exercise 3: Photo Album

Build a photo album with:

-   Multiple categories/sections
-   Thumbnail images linking to larger versions
-   Navigation between sections
-   Proper figure and figcaption elements
-   Back to top links

### Exercise 4: Resource Directory

Create a resource page with:

-   Links to external websites (opening in new tabs)
-   Download links for files
-   Email contact links
-   Phone number links
-   Organize with lists and proper navigation

---

## 🎯 Key Takeaways

1. **Always include alt text** for images for accessibility
2. **Use relative paths** when linking within your site
3. **Provide multiple formats** for audio/video compatibility
4. **Be careful with autoplay** - it's often blocked or annoying
5. **Test all links** to ensure they work correctly
6. **Use semantic elements** like `<figure>` and `<nav>` for better structure

---

## 🚀 Next Phase Preview

In **Phase 4: Tables and Forms**, you'll learn:

-   Creating data tables with proper structure
-   Building interactive forms
-   Form validation and input types
-   Accessibility in tables and forms

---

## 📝 Quick Reference

### Link Types:

```html
<a href="page.html">Internal link</a>
<a href="https://site.com">External link</a>
<a href="#section">Anchor link</a>
<a href="mailto:email@domain.com">Email link</a>
<a href="tel:+1234567890">Phone link</a>
<a href="file.pdf" download>Download link</a>
```

### Media Elements:

```html
<img src="image.jpg" alt="Description" />
<audio controls><source src="audio.mp3" /></audio>
<video controls><source src="video.mp4" /></video>
<figure>
    <img />
    <figcaption>Caption</figcaption>
</figure>
```

### File Paths:

-   **Same folder**: `file.html`
-   **Subfolder**: `folder/file.html`
-   **Parent folder**: `../file.html`
-   **Root**: `/file.html`

**Ready for Phase 4?** You've mastered links and media!
