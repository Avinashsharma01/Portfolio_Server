# Phase 17 — Accessibility (a11y)

## Table of Contents

- [Why Accessibility?](#why-accessibility)
- [How Screen Readers Work](#how-screen-readers-work)
- [Semantic HTML — The Foundation](#semantic-html--the-foundation)
- [ARIA — When HTML Isn't Enough](#aria--when-html-isnt-enough)
- [Keyboard Navigation](#keyboard-navigation)
- [Focus Management](#focus-management)
- [Color and Contrast](#color-and-contrast)
- [Images and Media](#images-and-media)
- [Forms and Error Handling](#forms-and-error-handling)
- [Accessible Components](#accessible-components)
- [Testing Accessibility](#testing-accessibility)
- [Key Takeaways](#key-takeaways)

---

## Why Accessibility?

```
WHO BENEFITS:
├── 15% of world population has some form of disability
├── Blind/low vision users → screen readers
├── Motor impairments    → keyboard-only navigation
├── Deaf/hard of hearing → captions, transcripts
├── Cognitive disabilities → clear layout, simple language
├── Temporary injuries   → broken arm, eye surgery
├── Situational          → bright sunlight, noisy room, one hand full
└── Everyone ages into disability eventually
```

### Legal Requirements

- **ADA** (USA) — websites of public entities must be accessible
- **WCAG 2.1** — international standard (Level A, AA, AAA)
- **EAA** (EU) — European Accessibility Act (2025)
- Lawsuits are increasing — over 4,000 accessibility lawsuits filed annually in the US

### Business Impact

```
ACCESSIBLE SITES:
├── Larger audience (15%+ of population)
├── Better SEO (semantic HTML helps search engines)
├── Better UX for ALL users (not just disabled)
├── Legal compliance
└── Demonstrates social responsibility
```

---

## How Screen Readers Work

```
VISUAL USER:
Sees the page → scans layout → reads content → clicks buttons

SCREEN READER USER:
Hears the page announced → navigates by headings/landmarks → 
activates elements with keyboard

WHAT THE SCREEN READER ANNOUNCES:
<button>Submit</button>
→ "Submit, button"

<img src="cat.jpg" alt="Orange cat sleeping on a couch">
→ "Orange cat sleeping on a couch, image"

<a href="/about">Learn more</a>
→ "Learn more, link"

<input type="email" id="email">
<label for="email">Email address</label>
→ "Email address, edit text"

<div onclick="submit()">Submit</div>
→ ... (NOTHING — screen reader doesn't know it's interactive)
```

### Common Screen Readers

| Screen Reader | Platform | Cost |
|--------------|----------|------|
| **NVDA** | Windows | Free |
| **JAWS** | Windows | $1,000+ |
| **VoiceOver** | macOS/iOS | Built-in |
| **TalkBack** | Android | Built-in |

---

## Semantic HTML — The Foundation

Semantic HTML gives meaning to content. Screen readers use HTML elements to understand the page structure.

### Use the Right Element

```html
<!-- ❌ DIV SOUP — no meaning -->
<div class="header">
    <div class="nav">
        <div class="link" onclick="goHome()">Home</div>
    </div>
</div>
<div class="main">
    <div class="title">Welcome</div>
    <div class="text">Content here</div>
</div>

<!-- ✅ SEMANTIC — meaningful -->
<header>
    <nav>
        <a href="/">Home</a>
    </nav>
</header>
<main>
    <h1>Welcome</h1>
    <p>Content here</p>
</main>
```

### Landmark Elements

```html
<header>       → Site header (logo, nav)
<nav>          → Navigation menu
<main>         → Primary content (one per page)
<aside>        → Sidebar, complementary content
<footer>       → Site footer
<section>      → Thematic grouping of content
<article>      → Self-contained content (blog post, card)
```

Screen reader users can jump between landmarks:

```
"Banner" (header)
"Navigation" (nav)
"Main" (main)
"Complementary" (aside)
"Content Info" (footer)
```

### Heading Hierarchy

```html
<!-- ✅ Logical heading order -->
<h1>Page Title</h1>           <!-- One per page -->
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>
    <h3>Subsection 2.1</h3>

<!-- ❌ Skipping levels -->
<h1>Title</h1>
<h4>Section</h4>              <!-- Skipped h2, h3 -->

<!-- ❌ Using headings for styling -->
<h3>This looks like the right size</h3>  <!-- Wrong! Use CSS -->
```

### Interactive Elements

```html
<!-- BUTTONS: for actions -->
<button onclick="save()">Save</button>         <!-- ✅ -->
<div onclick="save()">Save</div>               <!-- ❌ -->

<!-- LINKS: for navigation -->
<a href="/about">About Us</a>                  <!-- ✅ -->
<span onclick="goToAbout()">About Us</span>    <!-- ❌ -->

<!-- Rule: Use <button> for actions, <a> for navigation -->
```

---

## ARIA — When HTML Isn't Enough

ARIA (Accessible Rich Internet Applications) adds accessibility info **when native HTML can't express it**. 

> **First rule of ARIA: Don't use ARIA if native HTML works.**

### Common ARIA Attributes

```html
<!-- aria-label: Invisible label for screen readers -->
<button aria-label="Close dialog">✕</button>
<!-- Announces: "Close dialog, button" -->

<!-- aria-labelledby: Label using another element's text -->
<h2 id="cart-title">Shopping Cart</h2>
<section aria-labelledby="cart-title">
    <!-- Announces: "Shopping Cart, region" -->
</section>

<!-- aria-describedby: Additional description -->
<input type="password" aria-describedby="password-help" />
<p id="password-help">Must be at least 8 characters</p>

<!-- aria-hidden: Hide from screen readers -->
<span aria-hidden="true">🎉</span>  <!-- Decorative, don't announce -->

<!-- aria-live: Announce dynamic content changes -->
<div aria-live="polite">3 items in cart</div>
<!-- When text changes, screen reader announces the new content -->

<!-- aria-expanded: Toggle state -->
<button aria-expanded="false" aria-controls="menu">Menu</button>
<ul id="menu" hidden>...</ul>
```

### ARIA Roles

```html
<!-- For custom components that don't have native HTML equivalents -->
<div role="alert">Error: Invalid email</div>
<div role="dialog" aria-labelledby="dialog-title">...</div>
<div role="tablist">
    <button role="tab" aria-selected="true">Tab 1</button>
    <button role="tab" aria-selected="false">Tab 2</button>
</div>

<!-- ⚠️ Don't override native roles -->
<button role="link">Click</button>  <!-- ❌ Confusing -->
```

### aria-live for Dynamic Content

```jsx
function SearchResults({ results }) {
    return (
        <div>
            {/* Screen reader announces result count when it changes */}
            <div aria-live="polite" className="sr-only">
                {results.length} results found
            </div>

            <ul>
                {results.map(r => <li key={r.id}>{r.name}</li>)}
            </ul>
        </div>
    );
}
```

### Visually Hidden (Screen Reader Only)

```css
/* Content visible to screen readers but not visually */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

```html
<button>
    <span aria-hidden="true">✕</span>
    <span class="sr-only">Close dialog</span>
</button>
```

---

## Keyboard Navigation

All interactive content must be accessible via keyboard.

### Essential Keys

```
Tab        → Move to next interactive element
Shift+Tab  → Move to previous interactive element
Enter      → Activate button/link
Space      → Activate button, check checkbox
Escape     → Close modal/dropdown
Arrow keys → Navigate within widgets (tabs, menus, radio groups)
```

### Focus Order

```html
<!-- Focus follows DOM order — make sure it's logical -->
<header>...</header>
<nav>...</nav>
<main>
    <form>
        <input />      <!-- Tab 1 -->
        <input />      <!-- Tab 2 -->
        <button />     <!-- Tab 3 -->
    </form>
</main>

<!-- tabIndex values -->
<div tabindex="0">Focusable in normal order</div>
<div tabindex="-1">Focusable by script only (not Tab)</div>
<!-- tabindex="1+" → AVOID — forces unnatural tab order -->
```

### Skip Navigation Link

```html
<!-- First element on page — lets keyboard users skip to content -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<nav><!-- Long navigation --></nav>

<main id="main-content">
    <!-- Main content -->
</main>
```

```css
.skip-link {
    position: absolute;
    left: -9999px;
    top: auto;
    z-index: 999;
}

.skip-link:focus {
    left: 10px;
    top: 10px;
    padding: 8px 16px;
    background: #000;
    color: #fff;
}
```

---

## Focus Management

### Focus Visible

```css
/* Don't remove ALL focus outlines */
/* ❌ */
*:focus { outline: none; }

/* ✅ Style focus for keyboard users, hide for mouse users */
:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

/* Remove focus for mouse clicks (browser handles this with :focus-visible) */
button:focus:not(:focus-visible) {
    outline: none;
}
```

### Focus Trap (Modals)

```jsx
// When a modal opens, focus should be TRAPPED inside it
// Tab and Shift+Tab should cycle only through modal elements

import { useEffect, useRef } from "react";

function Modal({ isOpen, onClose, children }) {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Save current focus
            previousFocusRef.current = document.activeElement;

            // Focus the modal
            modalRef.current?.focus();

            // Trap focus inside modal
            function handleKeyDown(e) {
                if (e.key === "Escape") {
                    onClose();
                    return;
                }

                if (e.key === "Tab") {
                    const focusable = modalRef.current.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];

                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }

            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        } else {
            // Restore focus when modal closes
            previousFocusRef.current?.focus();
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                tabIndex={-1}
                onClick={e => e.stopPropagation()}
            >
                <h2 id="modal-title">Dialog Title</h2>
                {children}
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
```

---

## Color and Contrast

### Contrast Requirements (WCAG AA)

```
NORMAL TEXT (< 24px):
├── Minimum contrast ratio: 4.5:1

LARGE TEXT (≥ 24px or bold ≥ 18.66px):
├── Minimum contrast ratio: 3:1

UI COMPONENTS (buttons, inputs, icons):
├── Minimum contrast ratio: 3:1

TOOLS:
├── WebAIM Contrast Checker (webaim.org/resources/contrastchecker)
├── Chrome DevTools → Inspect element → color picker shows ratio
└── Lighthouse audits contrast automatically
```

### Don't Rely on Color Alone

```html
<!-- ❌ Color only — colorblind users can't tell -->
<span style="color: red;">Error</span>
<span style="color: green;">Success</span>

<!-- ✅ Color + text/icon -->
<span style="color: red;">❌ Error: Invalid email</span>
<span style="color: green;">✅ Success: Account created</span>
```

---

## Images and Media

### Alt Text

```html
<!-- INFORMATIVE image — describe what it shows -->
<img src="chart.png" alt="Sales increased 25% from Q1 to Q3 2024" />

<!-- DECORATIVE image — empty alt (screen reader skips it) -->
<img src="decorative-border.png" alt="" />

<!-- FUNCTIONAL image — describe the action -->
<a href="/home">
    <img src="logo.svg" alt="Company Name — go to homepage" />
</a>

<!-- COMPLEX image — detailed description -->
<figure>
    <img src="data-chart.png" alt="Quarterly revenue chart" />
    <figcaption>
        Revenue grew from $1.2M in Q1 to $1.8M in Q4...
    </figcaption>
</figure>
```

### Video and Audio

```html
<!-- Captions for hearing-impaired users -->
<video controls>
    <source src="tutorial.mp4" type="video/mp4" />
    <track kind="captions" src="captions-en.vtt" srclang="en" label="English" default />
    <track kind="captions" src="captions-es.vtt" srclang="es" label="Spanish" />
</video>

<!-- Audio with transcript -->
<audio controls>
    <source src="podcast.mp3" type="audio/mpeg" />
</audio>
<details>
    <summary>Read Transcript</summary>
    <p>Full transcript text here...</p>
</details>
```

---

## Forms and Error Handling

```jsx
function AccessibleForm() {
    const [errors, setErrors] = useState({});

    return (
        <form noValidate onSubmit={handleSubmit}>
            {/* Error summary at top — announced on submit */}
            {Object.keys(errors).length > 0 && (
                <div role="alert" className="error-summary">
                    <h2>Please fix the following errors:</h2>
                    <ul>
                        {Object.entries(errors).map(([field, message]) => (
                            <li key={field}>
                                <a href={`#${field}`}>{message}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Input with proper labeling */}
            <div>
                <label htmlFor="email">
                    Email address <span aria-hidden="true">*</span>
                </label>
                <input
                    id="email"
                    type="email"
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : "email-hint"}
                />
                <span id="email-hint" className="hint">
                    We'll never share your email
                </span>
                {errors.email && (
                    <span id="email-error" role="alert" className="error">
                        {errors.email}
                    </span>
                )}
            </div>

            <button type="submit">Submit</button>
        </form>
    );
}
```

### Required Field Indicators

```html
<!-- Screen readers need more than just a visual asterisk -->
<label for="name">
    Full Name <span aria-hidden="true">*</span>
    <span class="sr-only">(required)</span>
</label>
<!-- OR simply use aria-required -->
<input id="name" aria-required="true" />
```

---

## Accessible Components

### Toggle Button

```jsx
function ToggleButton({ label, pressed, onToggle }) {
    return (
        <button
            aria-pressed={pressed}
            onClick={onToggle}
            className={pressed ? "toggle active" : "toggle"}
        >
            {label}
        </button>
    );
}
// Announces: "Dark Mode, toggle button, pressed" or "not pressed"
```

### Accordion

```jsx
function Accordion({ items }) {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div>
            {items.map((item, index) => (
                <div key={index}>
                    <h3>
                        <button
                            aria-expanded={openIndex === index}
                            aria-controls={`panel-${index}`}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        >
                            {item.title}
                        </button>
                    </h3>
                    <div
                        id={`panel-${index}`}
                        role="region"
                        aria-labelledby={`heading-${index}`}
                        hidden={openIndex !== index}
                    >
                        {item.content}
                    </div>
                </div>
            ))}
        </div>
    );
}
```

### Tabs

```jsx
function Tabs({ tabs }) {
    const [activeIndex, setActiveIndex] = useState(0);

    function handleKeyDown(e, index) {
        if (e.key === "ArrowRight") {
            setActiveIndex((index + 1) % tabs.length);
        } else if (e.key === "ArrowLeft") {
            setActiveIndex((index - 1 + tabs.length) % tabs.length);
        }
    }

    return (
        <div>
            <div role="tablist">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        role="tab"
                        aria-selected={activeIndex === index}
                        aria-controls={`tabpanel-${index}`}
                        tabIndex={activeIndex === index ? 0 : -1}
                        onClick={() => setActiveIndex(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {tabs.map((tab, index) => (
                <div
                    key={index}
                    role="tabpanel"
                    id={`tabpanel-${index}`}
                    hidden={activeIndex !== index}
                    tabIndex={0}
                >
                    {tab.content}
                </div>
            ))}
        </div>
    );
}
```

---

## Testing Accessibility

### Automated Tools

```bash
# ESLint plugin — catches issues while coding
npm install -D eslint-plugin-jsx-a11y
```

```javascript
// eslint.config.js
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
    {
        plugins: { "jsx-a11y": jsxA11y },
        rules: {
            "jsx-a11y/alt-text": "error",
            "jsx-a11y/anchor-is-valid": "error",
            "jsx-a11y/click-events-have-key-events": "error",
            "jsx-a11y/no-static-element-interactions": "error",
            "jsx-a11y/label-has-associated-control": "error"
        }
    }
];
```

```bash
# axe-core in tests
npm install -D @axe-core/react
```

```jsx
// In development — logs a11y issues to console
import React from "react";
import ReactDOM from "react-dom/client";

if (process.env.NODE_ENV !== "production") {
    import("@axe-core/react").then(axe => {
        axe.default(React, ReactDOM, 1000);
    });
}
```

### Manual Testing Checklist

```
KEYBOARD:
✅ Tab through entire page — can you reach everything?
✅ Activate buttons with Enter and Space
✅ Open/close dropdowns with Enter, close with Escape
✅ Focus indicator visible on every interactive element

SCREEN READER:
✅ Test with NVDA (Windows) or VoiceOver (Mac)
✅ Can you understand the page structure from headings?
✅ Are images announced with meaningful alt text?
✅ Do forms announce labels and errors?

VISUAL:
✅ Zoom to 200% — is content still usable?
✅ Check contrast ratios (4.5:1 minimum)
✅ Does content make sense without color?
✅ Is text resizable? (no fixed px for font-size)
```

---

## Key Takeaways

1. **Use semantic HTML first** — `<button>`, `<a>`, `<nav>`, `<main>` provide accessibility for free
2. **Every image needs alt text** — descriptive for informative, empty (`alt=""`) for decorative
3. **All interactive elements must be keyboard accessible** — tab, enter, escape, arrows
4. **Don't remove focus outlines** — style `:focus-visible` instead
5. **ARIA is a supplement**, not a replacement for semantic HTML — first rule: don't use ARIA if HTML works
6. **Color alone is not enough** — use icons, text, or patterns alongside color
7. **Modals need focus trapping** — tab cycles through modal, escape closes it
8. **Forms need labels, error messages, and aria attributes** — `htmlFor`, `aria-invalid`, `role="alert"`
9. **Test with a real screen reader** — nothing replaces hearing your page announced
10. **Accessibility benefits everyone** — curb cuts, captions, keyboard nav help all users

---

## Practice Exercises

1. **Audit a page with Lighthouse** — fix all accessibility issues to score 100
2. **Navigate your app with keyboard only** — fix any elements you can't reach or activate
3. **Build an accessible modal** — focus trap, Escape to close, restore focus on close
4. **Build accessible tabs** — arrow key navigation, proper ARIA roles and states
5. **Test your app with a screen reader** (NVDA or VoiceOver) — fix anything confusing

---

**Previous:** [← Phase 16 — Performance Optimization](Phase-16-Performance-Optimization.md)
**Next:** [Phase 18 — TypeScript for Frontend →](Phase-18-TypeScript-Frontend.md)
