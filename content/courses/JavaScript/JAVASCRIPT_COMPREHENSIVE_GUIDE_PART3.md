# JavaScript Comprehensive Guide - Part 3: DOM & BOM Mastery

## Table of Contents - Part 3

1. [Introduction to DOM and BOM](#introduction-to-dom-and-bom)
2. [DOM Fundamentals](#dom-fundamentals)
3. [Element Selection and Traversal](#element-selection-and-traversal)
4. [DOM Manipulation](#dom-manipulation)
5. [Event Handling Deep Dive](#event-handling-deep-dive)
6. [Forms and Input Handling](#forms-and-input-handling)
7. [BOM (Browser Object Model)](#bom-browser-object-model)
8. [Advanced DOM Techniques](#advanced-dom-techniques)
9. [Performance Optimization](#performance-optimization)
10. [Modern DOM APIs](#modern-dom-apis)

---

## Introduction to DOM and BOM

The DOM (Document Object Model) and BOM (Browser Object Model) are essential for frontend JavaScript development. They provide the interface between JavaScript and the web browser, allowing you to create interactive and dynamic web applications.

### What You'll Learn

-   **DOM Manipulation**: Create, modify, and delete HTML elements
-   **Event Handling**: Respond to user interactions
-   **Browser APIs**: Work with browser features and capabilities
-   **Performance**: Optimize DOM operations for better user experience
-   **Modern Techniques**: Latest DOM APIs and best practices

---

## DOM Fundamentals

### 1. Understanding the DOM Tree

```html
<!DOCTYPE html>
<html>
    <head>
        <title>DOM Example</title>
    </head>
    <body>
        <header>
            <h1 id="main-title">Welcome</h1>
            <nav class="navigation">
                <ul>
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                </ul>
            </nav>
        </header>
        <main>
            <section class="content">
                <p>This is a paragraph.</p>
            </section>
        </main>
    </body>
</html>
```

```javascript
// Understanding DOM node types
function exploreDOM() {
    // Document node (nodeType: 9)
    console.log("Document:", document.nodeType); // 9

    // Element nodes (nodeType: 1)
    const header = document.querySelector("header");
    console.log("Header element:", header.nodeType); // 1

    // Text nodes (nodeType: 3)
    const title = document.getElementById("main-title");
    console.log("Title text:", title.firstChild.nodeType); // 3

    // Comment nodes (nodeType: 8)
    // <!-- This is a comment --> would be nodeType 8

    // Document fragment (nodeType: 11)
    const fragment = document.createDocumentFragment();
    console.log("Fragment:", fragment.nodeType); // 11
}

// DOM tree traversal
function traverseDOM(element) {
    // Parent relationships
    console.log("Parent:", element.parentNode);
    console.log("Parent element:", element.parentElement);

    // Child relationships
    console.log("Child nodes:", element.childNodes); // Includes text nodes
    console.log("Children:", element.children); // Only element nodes
    console.log("First child:", element.firstChild);
    console.log("First element child:", element.firstElementChild);
    console.log("Last child:", element.lastChild);
    console.log("Last element child:", element.lastElementChild);

    // Sibling relationships
    console.log("Next sibling:", element.nextSibling);
    console.log("Next element sibling:", element.nextElementSibling);
    console.log("Previous sibling:", element.previousSibling);
    console.log("Previous element sibling:", element.previousElementSibling);
}
```

### 2. Document Object Properties and Methods

```javascript
// Document information
const documentInfo = {
    // Basic properties
    title: document.title,
    url: document.URL,
    domain: document.domain,
    referrer: document.referrer,
    lastModified: document.lastModified,
    readyState: document.readyState, // loading, interactive, complete

    // Document structure
    documentElement: document.documentElement, // <html>
    head: document.head,
    body: document.body,

    // Forms and images
    forms: document.forms,
    images: document.images,
    links: document.links,

    // Character set and compatibility
    characterSet: document.characterSet,
    compatMode: document.compatMode,

    // Cookie and storage
    cookie: document.cookie,
};

// Document ready states
function handleDocumentReady() {
    if (document.readyState === "loading") {
        // Document is still loading
        document.addEventListener("DOMContentLoaded", () => {
            console.log("DOM fully loaded and parsed");
            initializeApp();
        });
    } else if (document.readyState === "interactive") {
        // DOM is loaded but resources might still be loading
        console.log("DOM loaded, resources loading");
        initializeApp();
    } else if (document.readyState === "complete") {
        // Everything is loaded
        console.log("Page fully loaded");
        initializeApp();
    }
}

// Alternative approach using different events
window.addEventListener("load", () => {
    console.log("All resources loaded (images, stylesheets, etc.)");
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded and parsed");
});
```

---

## Element Selection and Traversal

### 1. Modern Selection Methods

```javascript
// querySelector and querySelectorAll (CSS selectors)
class DOMSelector {
    // Single element selection
    static selectSingle() {
        // By ID
        const titleById = document.getElementById("main-title");
        const titleByQuery = document.querySelector("#main-title");

        // By class
        const firstNav = document.querySelector(".navigation");

        // By attribute
        const homeLink = document.querySelector('[href="#home"]');

        // Complex selectors
        const firstListItem = document.querySelector("nav ul li:first-child");
        const lastParagraph = document.querySelector("section p:last-of-type");

        return {
            titleById,
            titleByQuery,
            firstNav,
            homeLink,
            firstListItem,
            lastParagraph,
        };
    }

    // Multiple element selection
    static selectMultiple() {
        // All elements with class
        const allNavItems = document.querySelectorAll(".nav-item");

        // All elements by tag
        const allParagraphs = document.querySelectorAll("p");

        // Complex selections
        const allLinks = document.querySelectorAll('a[href^="#"]'); // Links starting with #
        const evenListItems = document.querySelectorAll("li:nth-child(even)");

        // Convert NodeList to Array for array methods
        const linksArray = Array.from(allLinks);
        const linksSpread = [...allLinks];

        return {
            allNavItems,
            allParagraphs,
            allLinks,
            evenListItems,
            linksArray,
            linksSpread,
        };
    }

    // Legacy methods (still useful in some cases)
    static legacySelection() {
        // By tag name
        const allDivs = document.getElementsByTagName("div");

        // By class name
        const navElements = document.getElementsByClassName("navigation");

        // By name attribute (mainly for forms)
        const namedElements = document.getElementsByName("username");

        // Note: These return HTMLCollections (live collections)
        return {
            allDivs,
            navElements,
            namedElements,
        };
    }
}

// Advanced selection with context
class ContextualSelector {
    static selectWithContext() {
        const navigation = document.querySelector(".navigation");

        // Search within a specific element
        const navLinks = navigation.querySelectorAll("a");
        const firstNavLink = navigation.querySelector("a");

        // Parent-child relationships
        const parentSection = document.querySelector("p").closest("section");
        const childInputs = document
            .querySelector("form")
            .querySelectorAll("input");

        return {
            navLinks,
            firstNavLink,
            parentSection,
            childInputs,
        };
    }

    // Filtering and finding elements
    static filterElements() {
        const allLinks = document.querySelectorAll("a");

        // Filter using array methods
        const externalLinks = Array.from(allLinks).filter(
            (link) =>
                link.href.startsWith("http") &&
                !link.href.includes(location.hostname)
        );

        const internalLinks = Array.from(allLinks).filter(
            (link) =>
                link.href.startsWith("#") ||
                link.href.includes(location.hostname)
        );

        // Find specific elements
        const homeLink = Array.from(allLinks).find(
            (link) => link.textContent.trim().toLowerCase() === "home"
        );

        return {
            externalLinks,
            internalLinks,
            homeLink,
        };
    }
}
```

### 2. Element Traversal Utilities

```javascript
// Utility functions for DOM traversal
class DOMTraversal {
    // Get all siblings of an element
    static getSiblings(element) {
        const siblings = [];
        let sibling = element.parentNode.firstElementChild;

        while (sibling) {
            if (sibling !== element) {
                siblings.push(sibling);
            }
            sibling = sibling.nextElementSibling;
        }

        return siblings;
    }

    // Get siblings before the element
    static getPreviousSiblings(element) {
        const siblings = [];
        let sibling = element.previousElementSibling;

        while (sibling) {
            siblings.unshift(sibling); // Add to beginning
            sibling = sibling.previousElementSibling;
        }

        return siblings;
    }

    // Get siblings after the element
    static getNextSiblings(element) {
        const siblings = [];
        let sibling = element.nextElementSibling;

        while (sibling) {
            siblings.push(sibling);
            sibling = sibling.nextElementSibling;
        }

        return siblings;
    }

    // Get all ancestors up to a specific element or document
    static getAncestors(element, stopElement = document) {
        const ancestors = [];
        let parent = element.parentElement;

        while (parent && parent !== stopElement) {
            ancestors.push(parent);
            parent = parent.parentElement;
        }

        return ancestors;
    }

    // Get all descendants of an element
    static getDescendants(element) {
        const descendants = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        let node;
        while ((node = walker.nextNode())) {
            if (node !== element) {
                descendants.push(node);
            }
        }

        return descendants;
    }

    // Find closest ancestor matching a selector
    static findAncestor(element, selector) {
        return element.closest(selector);
    }

    // Check if element matches selector
    static matches(element, selector) {
        return element.matches(selector);
    }

    // Get element's position in parent
    static getElementIndex(element) {
        return Array.from(element.parentNode.children).indexOf(element);
    }
}

// Usage examples
function demonstrateTraversal() {
    const listItem = document.querySelector("li");

    console.log("Siblings:", DOMTraversal.getSiblings(listItem));
    console.log(
        "Previous siblings:",
        DOMTraversal.getPreviousSiblings(listItem)
    );
    console.log("Next siblings:", DOMTraversal.getNextSiblings(listItem));
    console.log("Ancestors:", DOMTraversal.getAncestors(listItem));
    console.log("Element index:", DOMTraversal.getElementIndex(listItem));

    // Check if element matches criteria
    const isNavItem = DOMTraversal.matches(listItem, ".nav-item");
    const parentNav = DOMTraversal.findAncestor(listItem, "nav");
}
```

---

## DOM Manipulation

### 1. Creating and Modifying Elements

```javascript
// Element creation and configuration
class ElementFactory {
    // Basic element creation
    static createElement(tagName, options = {}) {
        const element = document.createElement(tagName);

        // Set attributes
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }

        // Set properties
        if (options.properties) {
            Object.assign(element, options.properties);
        }

        // Set text content
        if (options.textContent) {
            element.textContent = options.textContent;
        }

        // Set HTML content
        if (options.innerHTML) {
            element.innerHTML = options.innerHTML;
        }

        // Add classes
        if (options.classes) {
            element.classList.add(...options.classes);
        }

        // Set styles
        if (options.styles) {
            Object.assign(element.style, options.styles);
        }

        // Add event listeners
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }

        return element;
    }

    // Create complex structures
    static createCard(data) {
        const card = this.createElement("div", {
            classes: ["card"],
            attributes: { "data-id": data.id },
        });

        const header = this.createElement("div", {
            classes: ["card-header"],
            innerHTML: `<h3>${data.title}</h3>`,
        });

        const body = this.createElement("div", {
            classes: ["card-body"],
            innerHTML: `<p>${data.description}</p>`,
        });

        const footer = this.createElement("div", {
            classes: ["card-footer"],
        });

        const button = this.createElement("button", {
            textContent: "Learn More",
            classes: ["btn", "btn-primary"],
            events: {
                click: () => this.handleCardClick(data),
            },
        });

        footer.appendChild(button);
        card.appendChild(header);
        card.appendChild(body);
        card.appendChild(footer);

        return card;
    }

    static handleCardClick(data) {
        console.log("Card clicked:", data);
    }

    // Create list with items
    static createList(items, options = {}) {
        const listType = options.ordered ? "ol" : "ul";
        const list = this.createElement(listType, {
            classes: options.classes || ["list"],
        });

        items.forEach((item) => {
            const listItem = this.createElement("li", {
                textContent: typeof item === "string" ? item : item.text,
                classes: options.itemClasses || ["list-item"],
            });

            if (typeof item === "object" && item.link) {
                const link = this.createElement("a", {
                    textContent: item.text,
                    attributes: { href: item.link },
                });
                listItem.innerHTML = "";
                listItem.appendChild(link);
            }

            list.appendChild(listItem);
        });

        return list;
    }
}

// Text and content manipulation
class ContentManipulator {
    // Safe HTML insertion
    static setHTML(element, html) {
        // Basic sanitization (in production, use a proper sanitizer like DOMPurify)
        const sanitized = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/javascript:/gi, "")
            .replace(/on\w+\s*=/gi, "");

        element.innerHTML = sanitized;
    }

    // Text manipulation
    static manipulateText(element) {
        // Get and set text content
        const originalText = element.textContent;
        element.textContent = "New text content";

        // Get and set inner text (respects styling)
        const visibleText = element.innerText;
        element.innerText = "Visible text only";

        // Append text
        element.textContent += " - appended text";

        // Insert text at specific position
        const textNode = document.createTextNode(" inserted text");
        element.insertBefore(textNode, element.firstChild);

        return originalText;
    }

    // Template-based content creation
    static createFromTemplate(templateId, data) {
        const template = document.getElementById(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }

        const clone = template.content.cloneNode(true);

        // Replace placeholders
        const walker = document.createTreeWalker(
            clone,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while ((node = walker.nextNode())) {
            node.textContent = node.textContent.replace(
                /\{\{(\w+)\}\}/g,
                (match, key) => {
                    return data[key] || match;
                }
            );
        }

        return clone;
    }
}
```

### 2. Inserting and Removing Elements

```javascript
// DOM insertion methods
class DOMInsertion {
    // Modern insertion methods
    static insertElements() {
        const container = document.querySelector("#container");
        const newElement = ElementFactory.createElement("div", {
            textContent: "New element",
            classes: ["new-item"],
        });

        // Insert at the end
        container.append(newElement);

        // Insert at the beginning
        container.prepend(newElement.cloneNode(true));

        // Insert before/after an element
        const referenceElement = container.querySelector(".reference");
        referenceElement.before(newElement.cloneNode(true));
        referenceElement.after(newElement.cloneNode(true));

        // Replace an element
        const oldElement = container.querySelector(".old-item");
        if (oldElement) {
            oldElement.replaceWith(newElement.cloneNode(true));
        }
    }

    // Legacy insertion methods (still useful)
    static legacyInsertion() {
        const container = document.querySelector("#container");
        const newElement = ElementFactory.createElement("div", {
            textContent: "Legacy inserted",
            classes: ["legacy-item"],
        });

        // appendChild
        container.appendChild(newElement);

        // insertBefore
        const firstChild = container.firstElementChild;
        if (firstChild) {
            container.insertBefore(newElement.cloneNode(true), firstChild);
        }

        // replaceChild
        const oldChild = container.querySelector(".old-child");
        if (oldChild) {
            container.replaceChild(newElement.cloneNode(true), oldChild);
        }
    }

    // Advanced insertion with positioning
    static insertWithPosition(targetElement, htmlString, position) {
        /*
        Positions:
        - 'beforebegin': Before the element
        - 'afterbegin': Inside the element, before its first child
        - 'beforeend': Inside the element, after its last child
        - 'afterend': After the element
        */

        targetElement.insertAdjacentHTML(position, htmlString);

        // Also works with elements and text
        const newElement = ElementFactory.createElement("span", {
            textContent: "Adjacent element",
        });
        targetElement.insertAdjacentElement(position, newElement);
        targetElement.insertAdjacentText(position, "Adjacent text");
    }

    // Batch insertion for performance
    static batchInsert(container, elements) {
        // Using DocumentFragment for efficient batch insertion
        const fragment = document.createDocumentFragment();

        elements.forEach((elementData) => {
            const element = ElementFactory.createElement("div", elementData);
            fragment.appendChild(element);
        });

        container.appendChild(fragment);
    }
}

// Element removal
class DOMRemoval {
    // Modern removal methods
    static removeElements() {
        const element = document.querySelector(".to-remove");

        // Remove element (modern)
        element?.remove();

        // Clear all children
        const container = document.querySelector("#container");
        container.replaceChildren(); // Modern way

        // Alternative: clear innerHTML (less safe)
        // container.innerHTML = '';
    }

    // Legacy removal
    static legacyRemoval() {
        const element = document.querySelector(".to-remove");

        // Remove child (legacy)
        if (element?.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    // Conditional removal
    static removeConditionally(selector, condition) {
        const elements = document.querySelectorAll(selector);

        elements.forEach((element) => {
            if (condition(element)) {
                element.remove();
            }
        });
    }

    // Safe removal with cleanup
    static safeRemove(element) {
        // Remove event listeners (if using non-delegated events)
        const clone = element.cloneNode(true);

        // Clear any intervals/timeouts stored on element
        if (element._intervals) {
            element._intervals.forEach((id) => clearInterval(id));
        }

        if (element._timeouts) {
            element._timeouts.forEach((id) => clearTimeout(id));
        }

        // Remove from DOM
        element.remove();

        return clone; // Return clone if needed for restoration
    }
}

// Example: Dynamic list management
class DynamicList {
    constructor(container) {
        this.container = container;
        this.items = [];
        this.render();
    }

    addItem(text) {
        const item = {
            id: Date.now(),
            text: text,
            timestamp: new Date(),
        };

        this.items.push(item);
        this.renderItem(item);
    }

    removeItem(id) {
        this.items = this.items.filter((item) => item.id !== id);
        const element = this.container.querySelector(`[data-id="${id}"]`);
        element?.remove();
    }

    renderItem(item) {
        const listItem = ElementFactory.createElement("li", {
            attributes: { "data-id": item.id },
            classes: ["list-item"],
            innerHTML: `
                <span class="item-text">${item.text}</span>
                <span class="item-time">${item.timestamp.toLocaleTimeString()}</span>
                <button class="remove-btn">Remove</button>
            `,
        });

        // Add remove functionality
        const removeBtn = listItem.querySelector(".remove-btn");
        removeBtn.addEventListener("click", () => this.removeItem(item.id));

        this.container.appendChild(listItem);
    }

    render() {
        this.container.innerHTML = "";
        this.items.forEach((item) => this.renderItem(item));
    }

    clear() {
        this.items = [];
        this.container.replaceChildren();
    }
}
```

### 3. Attribute and Property Manipulation

```javascript
// Attribute and property management
class AttributeManager {
    // Working with attributes
    static manageAttributes(element) {
        // Set single attribute
        element.setAttribute("data-id", "123");
        element.setAttribute("aria-label", "Close button");
        element.setAttribute("role", "button");

        // Get attribute
        const id = element.getAttribute("data-id");
        const label = element.getAttribute("aria-label");

        // Check if attribute exists
        const hasId = element.hasAttribute("data-id");
        const hasTitle = element.hasAttribute("title");

        // Remove attribute
        element.removeAttribute("data-old");

        // Toggle attribute
        this.toggleAttribute(element, "aria-expanded");

        return { id, label, hasId, hasTitle };
    }

    // Custom toggle attribute (for older browsers)
    static toggleAttribute(element, attributeName, force) {
        if (element.toggleAttribute) {
            return element.toggleAttribute(attributeName, force);
        }

        // Fallback for older browsers
        const hasAttribute = element.hasAttribute(attributeName);

        if (force === undefined) {
            force = !hasAttribute;
        }

        if (force) {
            element.setAttribute(attributeName, "");
        } else {
            element.removeAttribute(attributeName);
        }

        return force;
    }

    // Working with data attributes
    static manageDataAttributes(element) {
        // Set data attributes
        element.dataset.userId = "123";
        element.dataset.userRole = "admin";
        element.dataset.lastLogin = new Date().toISOString();

        // Get data attributes
        const userId = element.dataset.userId;
        const userRole = element.dataset.userRole;

        // Data attributes are automatically converted to camelCase
        element.setAttribute("data-user-name", "John Doe");
        const userName = element.dataset.userName; // 'John Doe'

        // Delete data attribute
        delete element.dataset.oldData;

        // Get all data attributes
        const allData = { ...element.dataset };

        return { userId, userRole, userName, allData };
    }

    // Working with properties vs attributes
    static propertiesVsAttributes(input) {
        // Properties are live, attributes are static

        // Set initial value via attribute
        input.setAttribute("value", "initial");

        // User types "hello" in the input
        // input.value = 'hello' (property changes)
        // input.getAttribute('value') still returns 'initial'

        console.log("Property value:", input.value); // Current value
        console.log("Attribute value:", input.getAttribute("value")); // Initial value

        // Other examples
        input.checked = true; // Property
        input.setAttribute("checked", ""); // Attribute

        // Properties take precedence for current state
        return {
            currentValue: input.value,
            initialValue: input.getAttribute("value"),
            isChecked: input.checked,
            hasCheckedAttr: input.hasAttribute("checked"),
        };
    }

    // Bulk attribute management
    static setBulkAttributes(element, attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                element.removeAttribute(key);
            } else {
                element.setAttribute(key, value);
            }
        });
    }

    // Attribute observer pattern
    static createAttributeObserver(element, callback) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes") {
                    callback({
                        element: mutation.target,
                        attributeName: mutation.attributeName,
                        oldValue: mutation.oldValue,
                        newValue: mutation.target.getAttribute(
                            mutation.attributeName
                        ),
                    });
                }
            });
        });

        observer.observe(element, {
            attributes: true,
            attributeOldValue: true,
        });

        return observer;
    }
}

// CSS class management
class ClassManager {
    // Modern class manipulation
    static manageClasses(element) {
        // Add classes
        element.classList.add("active", "highlighted");

        // Remove classes
        element.classList.remove("inactive", "hidden");

        // Toggle class
        const isActive = element.classList.toggle("active");

        // Toggle with force parameter
        element.classList.toggle("visible", true); // Force add
        element.classList.toggle("hidden", false); // Force remove

        // Check if class exists
        const hasActive = element.classList.contains("active");

        // Replace class
        element.classList.replace("old-theme", "new-theme");

        return { isActive, hasActive };
    }

    // Conditional class management
    static setConditionalClasses(element, conditions) {
        Object.entries(conditions).forEach(([className, condition]) => {
            element.classList.toggle(className, Boolean(condition));
        });
    }

    // Class list utilities
    static getClassList(element) {
        return {
            classes: Array.from(element.classList),
            count: element.classList.length,
            string: element.className,
        };
    }

    // Theme management example
    static setTheme(element, theme) {
        // Remove all theme classes
        const themeClasses = Array.from(element.classList).filter((cls) =>
            cls.startsWith("theme-")
        );

        element.classList.remove(...themeClasses);

        // Add new theme
        element.classList.add(`theme-${theme}`);
    }
}

// Style manipulation
class StyleManager {
    // Inline styles
    static manageInlineStyles(element) {
        // Set individual styles
        element.style.color = "red";
        element.style.backgroundColor = "yellow";
        element.style.fontSize = "16px";

        // Set multiple styles
        Object.assign(element.style, {
            margin: "10px",
            padding: "20px",
            border: "1px solid black",
        });

        // Get computed styles
        const computedStyles = window.getComputedStyle(element);
        const fontSize = computedStyles.fontSize;
        const color = computedStyles.color;

        // CSS custom properties (CSS variables)
        element.style.setProperty("--main-color", "#007bff");
        element.style.setProperty("--padding", "15px");

        const mainColor = element.style.getPropertyValue("--main-color");

        // Remove styles
        element.style.removeProperty("color");

        return { fontSize, color, mainColor };
    }

    // CSS text manipulation
    static setCSSText(element, cssText) {
        element.style.cssText = cssText;
    }

    // Style utilities
    static getElementDimensions(element) {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);

        return {
            // Bounding box
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,

            // Client dimensions (content + padding)
            clientWidth: element.clientWidth,
            clientHeight: element.clientHeight,

            // Offset dimensions (content + padding + border)
            offsetWidth: element.offsetWidth,
            offsetHeight: element.offsetHeight,

            // Scroll dimensions
            scrollWidth: element.scrollWidth,
            scrollHeight: element.scrollHeight,

            // Computed styles
            marginTop: computedStyle.marginTop,
            paddingLeft: computedStyle.paddingLeft,
            borderWidth: computedStyle.borderWidth,
        };
    }

    // Responsive style management
    static applyResponsiveStyles(element, breakpoints) {
        const width = window.innerWidth;

        // Remove all responsive classes
        Object.keys(breakpoints).forEach((breakpoint) => {
            element.classList.remove(`${breakpoint}-active`);
        });

        // Apply appropriate breakpoint
        for (const [breakpoint, minWidth] of Object.entries(breakpoints)) {
            if (width >= minWidth) {
                element.classList.add(`${breakpoint}-active`);
            }
        }
    }
}
```

---

## Event Handling Deep Dive

### 1. Event Fundamentals

```javascript
// Modern event handling
class EventManager {
    constructor() {
        this.listeners = new Map();
        this.setupGlobalHandlers();
    }

    // Basic event handling
    static basicEventHandling() {
        const button = document.querySelector("#my-button");

        // Modern addEventListener
        button.addEventListener("click", function (event) {
            console.log("Button clicked!");
            console.log("Event type:", event.type);
            console.log("Target element:", event.target);
            console.log("Current target:", event.currentTarget);
            console.log("Timestamp:", event.timeStamp);
        });

        // Arrow function (loses 'this' binding)
        button.addEventListener("click", (event) => {
            console.log("Arrow function handler");
        });

        // Function with options
        button.addEventListener("click", handleClick, {
            once: true, // Remove after first execution
            passive: true, // Never calls preventDefault()
            capture: false, // Handle in bubbling phase
        });

        function handleClick(event) {
            console.log("Handler with options");
        }

        // Remove event listener
        button.removeEventListener("click", handleClick);
    }

    // Event object properties and methods
    static exploreEventObject(event) {
        // Prevent default behavior
        event.preventDefault();

        // Stop event propagation
        event.stopPropagation();

        // Stop immediate propagation (prevents other listeners on same element)
        event.stopImmediatePropagation();

        // Event properties
        const eventInfo = {
            type: event.type,
            target: event.target,
            currentTarget: event.currentTarget,
            relatedTarget: event.relatedTarget, // For mouseover/mouseout
            timeStamp: event.timeStamp,
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            defaultPrevented: event.defaultPrevented,
            eventPhase: event.eventPhase, // 1: capturing, 2: at target, 3: bubbling
            isTrusted: event.isTrusted, // True for user-generated events
        };

        return eventInfo;
    }

    // Event delegation
    static setupEventDelegation() {
        const container = document.querySelector("#container");

        // Handle clicks on any button within container
        container.addEventListener("click", (event) => {
            // Check if clicked element matches our criteria
            if (event.target.matches("button.delete-btn")) {
                this.handleDelete(event);
            } else if (event.target.matches("button.edit-btn")) {
                this.handleEdit(event);
            } else if (event.target.closest(".card")) {
                this.handleCardClick(event);
            }
        });

        // More specific delegation
        container.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-action]");
            if (button) {
                const action = button.dataset.action;
                this.executeAction(action, button, event);
            }
        });
    }

    static handleDelete(event) {
        const item = event.target.closest(".list-item");
        if (confirm("Are you sure you want to delete this item?")) {
            item.remove();
        }
    }

    static handleEdit(event) {
        const item = event.target.closest(".list-item");
        // Implementation for edit functionality
    }

    static handleCardClick(event) {
        const card = event.target.closest(".card");
        card.classList.toggle("expanded");
    }

    static executeAction(action, button, event) {
        const actions = {
            delete: () => this.handleDelete(event),
            edit: () => this.handleEdit(event),
            save: () => this.handleSave(event),
            cancel: () => this.handleCancel(event),
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    // Custom event creation and dispatch
    static createCustomEvents() {
        // Create simple custom event
        const customEvent = new Event("myCustomEvent", {
            bubbles: true,
            cancelable: true,
        });

        // Create custom event with data
        const dataEvent = new CustomEvent("userData", {
            detail: {
                userId: 123,
                userName: "John Doe",
                timestamp: new Date(),
            },
            bubbles: true,
        });

        // Dispatch events
        const element = document.querySelector("#target");
        element.dispatchEvent(customEvent);
        element.dispatchEvent(dataEvent);

        // Listen for custom events
        element.addEventListener("userData", (event) => {
            console.log("User data received:", event.detail);
        });
    }

    setupGlobalHandlers() {
        // Global error handling
        window.addEventListener("error", (event) => {
            console.error("Global error:", event.error);
            console.error("File:", event.filename);
            console.error("Line:", event.lineno);
        });

        // Unhandled promise rejections
        window.addEventListener("unhandledrejection", (event) => {
            console.error("Unhandled promise rejection:", event.reason);
            event.preventDefault(); // Prevent logging to console
        });

        // Page visibility changes
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                console.log("Page became visible");
            } else {
                console.log("Page became hidden");
            }
        });
    }
}
```

### 2. Mouse and Keyboard Events

```javascript
// Mouse event handling
class MouseEventHandler {
    static setupMouseEvents() {
        const element = document.querySelector("#interactive-element");

        // Basic mouse events
        element.addEventListener("click", this.handleClick.bind(this));
        element.addEventListener("dblclick", this.handleDoubleClick.bind(this));
        element.addEventListener("mousedown", this.handleMouseDown.bind(this));
        element.addEventListener("mouseup", this.handleMouseUp.bind(this));
        element.addEventListener("mousemove", this.handleMouseMove.bind(this));
        element.addEventListener(
            "mouseenter",
            this.handleMouseEnter.bind(this)
        );
        element.addEventListener(
            "mouseleave",
            this.handleMouseLeave.bind(this)
        );
        element.addEventListener("mouseover", this.handleMouseOver.bind(this));
        element.addEventListener("mouseout", this.handleMouseOut.bind(this));

        // Context menu (right click)
        element.addEventListener(
            "contextmenu",
            this.handleContextMenu.bind(this)
        );

        // Wheel events
        element.addEventListener("wheel", this.handleWheel.bind(this));
    }

    static handleClick(event) {
        console.log("Click details:", {
            x: event.clientX,
            y: event.clientY,
            screenX: event.screenX,
            screenY: event.screenY,
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            pageX: event.pageX,
            pageY: event.pageY,
            button: event.button, // 0: left, 1: middle, 2: right
            buttons: event.buttons, // Bitmask of pressed buttons
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
        });
    }

    static handleDoubleClick(event) {
        console.log("Double click detected");
        event.preventDefault(); // Prevent text selection
    }

    static handleMouseMove(event) {
        // Throttle mouse move events for performance
        clearTimeout(this.mouseMoveTimeout);
        this.mouseMoveTimeout = setTimeout(() => {
            this.updateMousePosition(event.clientX, event.clientY);
        }, 16); // ~60fps
    }

    static updateMousePosition(x, y) {
        const indicator = document.querySelector("#mouse-indicator");
        if (indicator) {
            indicator.style.left = `${x}px`;
            indicator.style.top = `${y}px`;
        }
    }

    static handleContextMenu(event) {
        event.preventDefault(); // Prevent default context menu
        this.showCustomContextMenu(event.clientX, event.clientY);
    }

    static showCustomContextMenu(x, y) {
        const menu = document.querySelector("#custom-context-menu");
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.display = "block";

        // Hide menu when clicking elsewhere
        document.addEventListener(
            "click",
            () => {
                menu.style.display = "none";
            },
            { once: true }
        );
    }

    static handleWheel(event) {
        console.log("Wheel event:", {
            deltaX: event.deltaX,
            deltaY: event.deltaY,
            deltaZ: event.deltaZ,
            deltaMode: event.deltaMode, // 0: pixels, 1: lines, 2: pages
        });

        // Prevent page scroll in specific area
        event.preventDefault();
    }

    // Drag and drop implementation
    static setupDragAndDrop() {
        const draggable = document.querySelector(".draggable");
        const dropZone = document.querySelector(".drop-zone");

        // Make element draggable
        draggable.draggable = true;

        // Drag events on draggable element
        draggable.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", draggable.id);
            event.dataTransfer.effectAllowed = "move";
            draggable.classList.add("dragging");
        });

        draggable.addEventListener("dragend", (event) => {
            draggable.classList.remove("dragging");
        });

        // Drop events on drop zone
        dropZone.addEventListener("dragover", (event) => {
            event.preventDefault(); // Allow drop
            event.dataTransfer.dropEffect = "move";
            dropZone.classList.add("drag-over");
        });

        dropZone.addEventListener("dragleave", (event) => {
            dropZone.classList.remove("drag-over");
        });

        dropZone.addEventListener("drop", (event) => {
            event.preventDefault();
            const id = event.dataTransfer.getData("text/plain");
            const element = document.getElementById(id);

            dropZone.appendChild(element);
            dropZone.classList.remove("drag-over");
        });
    }
}

// Keyboard event handling
class KeyboardEventHandler {
    constructor() {
        this.pressedKeys = new Set();
        this.shortcuts = new Map();
        this.setupKeyboardEvents();
    }

    setupKeyboardEvents() {
        // Global keyboard events
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
        document.addEventListener("keypress", this.handleKeyPress.bind(this));
    }

    handleKeyDown(event) {
        this.pressedKeys.add(event.code);

        const keyInfo = {
            key: event.key, // The character or description
            code: event.code, // Physical key code
            keyCode: event.keyCode, // Deprecated but still used
            which: event.which, // Deprecated
            location: event.location, // Key location for modifier keys
            repeat: event.repeat, // True if key is being held
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
        };

        console.log("Key down:", keyInfo);

        // Handle keyboard shortcuts
        this.handleShortcuts(event);

        // Handle special keys
        this.handleSpecialKeys(event);
    }

    handleKeyUp(event) {
        this.pressedKeys.delete(event.code);
        console.log("Key up:", event.key);
    }

    handleKeyPress(event) {
        // Only fires for printable characters
        console.log("Key press:", event.key);
    }

    handleShortcuts(event) {
        const shortcutKey = this.getShortcutKey(event);
        const handler = this.shortcuts.get(shortcutKey);

        if (handler) {
            event.preventDefault();
            handler(event);
        }
    }

    getShortcutKey(event) {
        const modifiers = [];
        if (event.ctrlKey) modifiers.push("ctrl");
        if (event.shiftKey) modifiers.push("shift");
        if (event.altKey) modifiers.push("alt");
        if (event.metaKey) modifiers.push("meta");

        return [...modifiers, event.code.toLowerCase()].join("+");
    }

    registerShortcut(shortcut, handler) {
        this.shortcuts.set(shortcut.toLowerCase(), handler);
    }

    handleSpecialKeys(event) {
        switch (event.code) {
            case "Escape":
                this.closeModals();
                break;
            case "Enter":
                if (event.target.matches(".submit-on-enter")) {
                    this.submitForm(event.target.closest("form"));
                }
                break;
            case "Tab":
                if (event.shiftKey) {
                    console.log("Shift+Tab - moving backward");
                } else {
                    console.log("Tab - moving forward");
                }
                break;
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
                this.handleNavigation(event);
                break;
        }
    }

    closeModals() {
        document.querySelectorAll(".modal.open").forEach((modal) => {
            modal.classList.remove("open");
        });
    }

    submitForm(form) {
        if (form) {
            form.requestSubmit();
        }
    }

    handleNavigation(event) {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const currentIndex = Array.from(focusableElements).indexOf(
            document.activeElement
        );
        let nextIndex;

        switch (event.code) {
            case "ArrowUp":
            case "ArrowLeft":
                nextIndex =
                    currentIndex > 0
                        ? currentIndex - 1
                        : focusableElements.length - 1;
                break;
            case "ArrowDown":
            case "ArrowRight":
                nextIndex =
                    currentIndex < focusableElements.length - 1
                        ? currentIndex + 1
                        : 0;
                break;
        }

        if (nextIndex !== undefined) {
            event.preventDefault();
            focusableElements[nextIndex].focus();
        }
    }

    // Check if specific key combinations are pressed
    isPressed(...keys) {
        return keys.every((key) => this.pressedKeys.has(key));
    }

    // Gaming-style key handling
    setupGameControls() {
        const gameLoop = () => {
            if (this.isPressed("KeyW", "ArrowUp")) {
                console.log("Moving up");
            }
            if (this.isPressed("KeyS", "ArrowDown")) {
                console.log("Moving down");
            }
            if (this.isPressed("KeyA", "ArrowLeft")) {
                console.log("Moving left");
            }
            if (this.isPressed("KeyD", "ArrowRight")) {
                console.log("Moving right");
            }
            if (this.isPressed("Space")) {
                console.log("Jumping");
            }

            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }
}

// Usage example
const keyboardHandler = new KeyboardEventHandler();

// Register shortcuts
keyboardHandler.registerShortcut("ctrl+s", (event) => {
    console.log("Save shortcut pressed");
    // Implement save functionality
});

keyboardHandler.registerShortcut("ctrl+z", (event) => {
    console.log("Undo shortcut pressed");
    // Implement undo functionality
});

keyboardHandler.registerShortcut("ctrl+shift+z", (event) => {
    console.log("Redo shortcut pressed");
    // Implement redo functionality
});
```

### 3. Touch Events and Mobile Support

```javascript
// Touch event handling for mobile devices
class TouchEventHandler {
    constructor() {
        this.touchStartPos = {};
        this.touchThreshold = 50; // Minimum distance for swipe
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        const element = document.querySelector("#touch-area");

        // Basic touch events
        element.addEventListener(
            "touchstart",
            this.handleTouchStart.bind(this),
            { passive: false }
        );
        element.addEventListener("touchmove", this.handleTouchMove.bind(this), {
            passive: false,
        });
        element.addEventListener("touchend", this.handleTouchEnd.bind(this), {
            passive: false,
        });
        element.addEventListener(
            "touchcancel",
            this.handleTouchCancel.bind(this)
        );

        // Gesture events (iOS Safari)
        element.addEventListener(
            "gesturestart",
            this.handleGestureStart.bind(this)
        );
        element.addEventListener(
            "gesturechange",
            this.handleGestureChange.bind(this)
        );
        element.addEventListener(
            "gestureend",
            this.handleGestureEnd.bind(this)
        );
    }

    handleTouchStart(event) {
        const touch = event.touches[0];
        this.touchStartPos = {
            x: touch.clientX,
            y: touch.clientY,
            timestamp: Date.now(),
        };

        console.log("Touch start:", {
            touches: event.touches.length,
            x: touch.clientX,
            y: touch.clientY,
            identifier: touch.identifier,
        });

        // Prevent default if needed (be careful with passive: false)
        if (this.shouldPreventDefault(event)) {
            event.preventDefault();
        }
    }

    handleTouchMove(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - this.touchStartPos.x;
            const deltaY = touch.clientY - this.touchStartPos.y;

            console.log("Touch move:", { deltaX, deltaY });

            // Implement custom scrolling or dragging
            this.handleDrag(deltaX, deltaY);
        }
    }

    handleTouchEnd(event) {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartPos.x;
        const deltaY = touch.clientY - this.touchStartPos.y;
        const duration = Date.now() - this.touchStartPos.timestamp;

        console.log("Touch end:", { deltaX, deltaY, duration });

        // Detect swipe gestures
        this.detectSwipe(deltaX, deltaY, duration);

        // Detect tap vs long press
        if (duration < 200 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            this.handleTap(touch);
        }
    }

    handleTouchCancel(event) {
        console.log("Touch cancelled");
        this.resetTouchState();
    }

    detectSwipe(deltaX, deltaY, duration) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > this.touchThreshold || absY > this.touchThreshold) {
            if (absX > absY) {
                // Horizontal swipe
                if (deltaX > 0) {
                    this.handleSwipe("right");
                } else {
                    this.handleSwipe("left");
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    this.handleSwipe("down");
                } else {
                    this.handleSwipe("up");
                }
            }
        }
    }

    handleSwipe(direction) {
        console.log(`Swipe ${direction} detected`);

        // Custom swipe handling
        const swipeHandlers = {
            left: () => this.navigateNext(),
            right: () => this.navigatePrevious(),
            up: () => this.scrollUp(),
            down: () => this.scrollDown(),
        };

        if (swipeHandlers[direction]) {
            swipeHandlers[direction]();
        }
    }

    handleTap(touch) {
        console.log("Tap detected at:", touch.clientX, touch.clientY);

        // Create custom tap event
        const tapEvent = new CustomEvent("tap", {
            detail: {
                x: touch.clientX,
                y: touch.clientY,
            },
        });

        touch.target.dispatchEvent(tapEvent);
    }

    handleDrag(deltaX, deltaY) {
        // Implement custom drag behavior
        const element = document.querySelector("#draggable-touch");
        if (element) {
            element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }
    }

    // Multi-touch handling
    handleMultiTouch(event) {
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];

            // Calculate distance between touches (for pinch/zoom)
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
            );

            // Calculate center point
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;

            console.log("Multi-touch:", { distance, centerX, centerY });

            if (!this.initialPinchDistance) {
                this.initialPinchDistance = distance;
            } else {
                const scale = distance / this.initialPinchDistance;
                this.handlePinchZoom(scale, centerX, centerY);
            }
        }
    }

    handlePinchZoom(scale, centerX, centerY) {
        const element = document.querySelector("#zoomable");
        if (element) {
            element.style.transform = `scale(${scale})`;
            element.style.transformOrigin = `${centerX}px ${centerY}px`;
        }
    }

    // Gesture events (iOS Safari)
    handleGestureStart(event) {
        event.preventDefault();
        console.log("Gesture start");
    }

    handleGestureChange(event) {
        event.preventDefault();
        const element = event.target;

        // Apply rotation and scale
        element.style.transform = `scale(${event.scale}) rotate(${event.rotation}deg)`;

        console.log("Gesture change:", {
            scale: event.scale,
            rotation: event.rotation,
        });
    }

    handleGestureEnd(event) {
        console.log("Gesture end");
    }

    shouldPreventDefault(event) {
        // Only prevent default for specific scenarios
        const target = event.target;
        return (
            target.classList.contains("prevent-scroll") ||
            target.closest(".custom-scrollable")
        );
    }

    resetTouchState() {
        this.touchStartPos = {};
        this.initialPinchDistance = null;
    }

    // Navigation methods
    navigateNext() {
        console.log("Navigate to next");
    }

    navigatePrevious() {
        console.log("Navigate to previous");
    }

    scrollUp() {
        console.log("Scroll up");
    }

    scrollDown() {
        console.log("Scroll down");
    }
}

// Pointer Events (unified mouse, touch, pen input)
class PointerEventHandler {
    constructor() {
        this.activePointers = new Map();
        this.setupPointerEvents();
    }

    setupPointerEvents() {
        const element = document.querySelector("#pointer-area");

        element.addEventListener(
            "pointerdown",
            this.handlePointerDown.bind(this)
        );
        element.addEventListener(
            "pointermove",
            this.handlePointerMove.bind(this)
        );
        element.addEventListener("pointerup", this.handlePointerUp.bind(this));
        element.addEventListener(
            "pointercancel",
            this.handlePointerCancel.bind(this)
        );
        element.addEventListener(
            "pointerenter",
            this.handlePointerEnter.bind(this)
        );
        element.addEventListener(
            "pointerleave",
            this.handlePointerLeave.bind(this)
        );
    }

    handlePointerDown(event) {
        // Capture the pointer
        event.target.setPointerCapture(event.pointerId);

        this.activePointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
            pointerType: event.pointerType, // mouse, pen, touch
            pressure: event.pressure,
            timestamp: Date.now(),
        });

        console.log("Pointer down:", {
            id: event.pointerId,
            type: event.pointerType,
            pressure: event.pressure,
            x: event.clientX,
            y: event.clientY,
        });
    }

    handlePointerMove(event) {
        if (this.activePointers.has(event.pointerId)) {
            const startPos = this.activePointers.get(event.pointerId);
            const deltaX = event.clientX - startPos.x;
            const deltaY = event.clientY - startPos.y;

            console.log("Pointer move:", {
                id: event.pointerId,
                deltaX,
                deltaY,
                pressure: event.pressure,
            });

            // Handle different pointer types differently
            switch (event.pointerType) {
                case "mouse":
                    this.handleMouseMove(event, deltaX, deltaY);
                    break;
                case "touch":
                    this.handleTouchMove(event, deltaX, deltaY);
                    break;
                case "pen":
                    this.handlePenMove(event, deltaX, deltaY);
                    break;
            }
        }
    }

    handlePointerUp(event) {
        // Release pointer capture
        event.target.releasePointerCapture(event.pointerId);

        this.activePointers.delete(event.pointerId);

        console.log("Pointer up:", event.pointerId);
    }

    handlePointerCancel(event) {
        this.activePointers.delete(event.pointerId);
        console.log("Pointer cancelled:", event.pointerId);
    }

    handleMouseMove(event, deltaX, deltaY) {
        // Mouse-specific handling
    }

    handleTouchMove(event, deltaX, deltaY) {
        // Touch-specific handling
    }

    handlePenMove(event, deltaX, deltaY) {
        // Pen-specific handling (pressure sensitivity, tilt, etc.)
        console.log("Pen pressure:", event.pressure);
        console.log("Pen tilt:", event.tiltX, event.tiltY);
    }
}

// Initialize touch handlers
new TouchEventHandler();
new PointerEventHandler();
```

---

## Next Steps

This concludes Part 3 of the JavaScript Comprehensive Guide, covering DOM fundamentals, element selection, manipulation, and comprehensive event handling.

**What's coming in the next parts:**

-   **Part 4**: Forms and Input Handling, BOM (Browser Object Model)
-   **Part 5**: Advanced DOM Techniques, Performance Optimization
-   **Part 6**: Modern DOM APIs, Web Components, and Best Practices

**Key Takeaways from Part 3:**

1. **DOM Tree Understanding**: How to navigate and understand the document structure
2. **Element Selection**: Modern querySelector methods vs legacy approaches
3. **DOM Manipulation**: Creating, modifying, and removing elements efficiently
4. **Event Handling**: Comprehensive event management including delegation and custom events
5. **Touch and Mobile**: Handling touch events and mobile-specific interactions

**Practice Recommendations:**

1. Build interactive components using event delegation
2. Create drag-and-drop interfaces
3. Implement keyboard navigation
4. Build mobile-friendly touch interfaces
5. Practice performance optimization techniques

Ready for Part 4? Let's continue with Forms and BOM!
