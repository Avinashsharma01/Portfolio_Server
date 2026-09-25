# JavaScript Comprehensive Guide - Part 5: Advanced DOM & Performance

## Table of Contents - Part 5

1. [Advanced DOM Techniques](#advanced-dom-techniques)
2. [DOM Performance Optimization](#dom-performance-optimization)
3. [Virtual DOM Concepts](#virtual-dom-concepts)
4. [Intersection Observer API](#intersection-observer-api)
5. [Mutation Observer API](#mutation-observer-api)
6. [Web Components Basics](#web-components-basics)

---

## Advanced DOM Techniques

### 1. Document Fragments and Batch Operations

```javascript
// Advanced DOM manipulation techniques
class AdvancedDOM {
    // Efficient bulk operations using DocumentFragment
    static createBulkElements(items, createElementFn) {
        const fragment = document.createDocumentFragment();

        items.forEach((item) => {
            const element = createElementFn(item);
            fragment.appendChild(element);
        });

        return fragment;
    }

    // Template cloning for performance
    static createFromTemplate(templateId, data, count = 1) {
        const template = document.getElementById(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const clone = template.content.cloneNode(true);

            // Replace placeholders
            if (data) {
                this.replacePlaceholders(clone, data);
            }

            fragment.appendChild(clone);
        }

        return fragment;
    }

    static replacePlaceholders(node, data) {
        const walker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        let currentNode;
        while ((currentNode = walker.nextNode())) {
            if (currentNode.nodeType === Node.TEXT_NODE) {
                currentNode.textContent = currentNode.textContent.replace(
                    /\{\{(\w+)\}\}/g,
                    (match, key) => data[key] || match
                );
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                // Replace in attributes
                Array.from(currentNode.attributes).forEach((attr) => {
                    attr.value = attr.value.replace(
                        /\{\{(\w+)\}\}/g,
                        (match, key) => data[key] || match
                    );
                });
            }
        }
    }

    // Range API for precise selections
    static createRangeSelection(
        startElement,
        startOffset,
        endElement,
        endOffset
    ) {
        const range = document.createRange();
        range.setStart(startElement, startOffset);
        range.setEnd(endElement, endOffset);
        return range;
    }

    static insertElementAtRange(range, element) {
        range.deleteContents();
        range.insertNode(element);
        range.selectNodeContents(element);
        range.collapse(false);
    }

    // Shadow DOM manipulation
    static createShadowElement(hostElement, template) {
        const shadow = hostElement.attachShadow({ mode: "open" });

        if (typeof template === "string") {
            shadow.innerHTML = template;
        } else {
            shadow.appendChild(template.cloneNode(true));
        }

        return shadow;
    }

    // Content projection (slots)
    static setupContentProjection(shadowRoot, slotMap) {
        Object.entries(slotMap).forEach(([slotName, content]) => {
            const slot = shadowRoot.querySelector(`slot[name="${slotName}"]`);
            if (slot && content) {
                const slotContent = document.createElement("div");
                slotContent.slot = slotName;
                slotContent.appendChild(content);
                slot.parentElement.appendChild(slotContent);
            }
        });
    }
}

// Example usage
const items = [
    { name: "Item 1", price: "$10" },
    { name: "Item 2", price: "$20" },
    { name: "Item 3", price: "$30" },
];

const createItemElement = (item) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<h3>${item.name}</h3><p>${item.price}</p>`;
    return div;
};

const fragment = AdvancedDOM.createBulkElements(items, createItemElement);
document.getElementById("container").appendChild(fragment);
```

### 2. Custom Element Utilities

```javascript
// Custom element creation utilities
class CustomElementBuilder {
    constructor(tagName) {
        this.tagName = tagName;
        this.template = "";
        this.styles = "";
        this.properties = new Map();
        this.methods = new Map();
        this.lifecycle = new Map();
        this.observers = new Map();
    }

    setTemplate(template) {
        this.template = template;
        return this;
    }

    setStyles(styles) {
        this.styles = styles;
        return this;
    }

    addProperty(name, options = {}) {
        this.properties.set(name, {
            type: options.type || String,
            default: options.default,
            reflect: options.reflect || false,
            notify: options.notify || false,
            observer: options.observer,
        });
        return this;
    }

    addMethod(name, method) {
        this.methods.set(name, method);
        return this;
    }

    setLifecycleCallback(name, callback) {
        this.lifecycle.set(name, callback);
        return this;
    }

    addAttributeObserver(attribute, callback) {
        this.observers.set(attribute, callback);
        return this;
    }

    build() {
        const builder = this;

        class CustomElement extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: "open" });

                // Create template
                const template = document.createElement("template");
                template.innerHTML = `
                    <style>${builder.styles}</style>
                    ${builder.template}
                `;

                this.shadowRoot.appendChild(template.content.cloneNode(true));

                // Initialize properties
                builder.properties.forEach((config, name) => {
                    this.initProperty(name, config);
                });

                // Add methods
                builder.methods.forEach((method, name) => {
                    this[name] = method.bind(this);
                });

                // Call constructor lifecycle
                const constructorCallback =
                    builder.lifecycle.get("constructor");
                if (constructorCallback) {
                    constructorCallback.call(this);
                }
            }

            static get observedAttributes() {
                return Array.from(builder.properties.keys());
            }

            connectedCallback() {
                const callback = builder.lifecycle.get("connected");
                if (callback) {
                    callback.call(this);
                }
            }

            disconnectedCallback() {
                const callback = builder.lifecycle.get("disconnected");
                if (callback) {
                    callback.call(this);
                }
            }

            attributeChangedCallback(name, oldValue, newValue) {
                const observer = builder.observers.get(name);
                if (observer) {
                    observer.call(this, oldValue, newValue);
                }

                const propConfig = builder.properties.get(name);
                if (propConfig && propConfig.observer) {
                    propConfig.observer.call(this, oldValue, newValue);
                }
            }

            initProperty(name, config) {
                const privateName = `_${name}`;
                this[privateName] = config.default;

                Object.defineProperty(this, name, {
                    get() {
                        return this[privateName];
                    },
                    set(value) {
                        const oldValue = this[privateName];
                        this[privateName] = this.convertType(
                            value,
                            config.type
                        );

                        if (config.reflect) {
                            this.setAttribute(name, this[privateName]);
                        }

                        if (config.notify) {
                            this.dispatchEvent(
                                new CustomEvent(`${name}-changed`, {
                                    detail: {
                                        oldValue,
                                        newValue: this[privateName],
                                    },
                                })
                            );
                        }

                        if (config.observer) {
                            config.observer.call(
                                this,
                                oldValue,
                                this[privateName]
                            );
                        }
                    },
                });
            }

            convertType(value, type) {
                switch (type) {
                    case Boolean:
                        return (
                            value === "" || value === "true" || value === true
                        );
                    case Number:
                        return Number(value);
                    case Array:
                        return Array.isArray(value)
                            ? value
                            : JSON.parse(value || "[]");
                    case Object:
                        return typeof value === "object"
                            ? value
                            : JSON.parse(value || "{}");
                    default:
                        return String(value);
                }
            }
        }

        customElements.define(this.tagName, CustomElement);
        return CustomElement;
    }
}

// Example: Creating a custom button component
const CustomButton = new CustomElementBuilder("custom-button")
    .setTemplate(
        `
        <button class="btn">
            <slot></slot>
        </button>
    `
    )
    .setStyles(
        `
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .btn:hover {
            opacity: 0.8;
        }
        
        :host([variant="primary"]) .btn {
            background-color: #007bff;
            color: white;
        }
        
        :host([variant="secondary"]) .btn {
            background-color: #6c757d;
            color: white;
        }
        
        :host([disabled]) .btn {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `
    )
    .addProperty("variant", { type: String, default: "primary", reflect: true })
    .addProperty("disabled", { type: Boolean, default: false, reflect: true })
    .addMethod("click", function () {
        if (!this.disabled) {
            this.dispatchEvent(
                new CustomEvent("custom-click", {
                    bubbles: true,
                    detail: { variant: this.variant },
                })
            );
        }
    })
    .setLifecycleCallback("connected", function () {
        this.shadowRoot
            .querySelector(".btn")
            .addEventListener("click", this.click);
    })
    .build();
```

---

## DOM Performance Optimization

### 1. Efficient DOM Updates

```javascript
// Performance optimization techniques
class DOMPerformance {
    // Batch DOM operations
    static batchUpdates(operations) {
        // Force layout calculation before batching
        document.body.offsetHeight;

        // Use requestAnimationFrame for smooth updates
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                operations.forEach((operation) => operation());
                resolve();
            });
        });
    }

    // Virtualization for large lists
    static createVirtualList(container, items, itemHeight, renderItem) {
        const containerHeight = container.clientHeight;
        const visibleItems = Math.ceil(containerHeight / itemHeight) + 2; // Buffer

        let scrollTop = 0;
        let startIndex = 0;

        const virtualList = {
            items,
            visibleItems,
            itemHeight,
            totalHeight: items.length * itemHeight,

            render() {
                const endIndex = Math.min(
                    startIndex + visibleItems,
                    items.length
                );
                const offsetY = startIndex * itemHeight;

                // Clear container
                container.innerHTML = "";

                // Create spacer for scroll position
                const spacer = document.createElement("div");
                spacer.style.height = `${this.totalHeight}px`;
                spacer.style.position = "relative";
                container.appendChild(spacer);

                // Render visible items
                const fragment = document.createDocumentFragment();
                for (let i = startIndex; i < endIndex; i++) {
                    const item = items[i];
                    const element = renderItem(item, i);
                    element.style.position = "absolute";
                    element.style.top = `${
                        offsetY + (i - startIndex) * itemHeight
                    }px`;
                    element.style.width = "100%";
                    element.style.height = `${itemHeight}px`;
                    fragment.appendChild(element);
                }

                spacer.appendChild(fragment);
            },

            handleScroll(event) {
                scrollTop = event.target.scrollTop;
                const newStartIndex = Math.floor(scrollTop / itemHeight);

                if (newStartIndex !== startIndex) {
                    startIndex = newStartIndex;
                    this.render();
                }
            },

            updateItems(newItems) {
                this.items = newItems;
                this.totalHeight = newItems.length * itemHeight;
                startIndex = 0;
                scrollTop = 0;
                this.render();
            },
        };

        container.addEventListener(
            "scroll",
            virtualList.handleScroll.bind(virtualList)
        );
        virtualList.render();

        return virtualList;
    }

    // Lazy loading images
    static setupLazyLoading(selector = "img[data-src]") {
        const images = document.querySelectorAll(selector);

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove("lazy");
                    observer.unobserve(img);
                }
            });
        });

        images.forEach((img) => {
            img.classList.add("lazy");
            imageObserver.observe(img);
        });

        return imageObserver;
    }

    // Efficient style updates
    static updateStyles(element, styles) {
        // Batch style updates
        const originalDisplay = element.style.display;
        element.style.display = "none";

        Object.assign(element.style, styles);

        element.style.display = originalDisplay;
    }

    // Debounced resize handler
    static createResizeHandler(callback, delay = 250) {
        let resizeTimer;

        return function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                callback();
            }, delay);
        };
    }

    // Memory leak prevention
    static createElementPool(createElement, resetElement) {
        const pool = [];

        return {
            acquire() {
                if (pool.length > 0) {
                    const element = pool.pop();
                    resetElement(element);
                    return element;
                } else {
                    return createElement();
                }
            },

            release(element) {
                pool.push(element);
            },

            clear() {
                pool.length = 0;
            },
        };
    }

    // Performance monitoring
    static measureDOMOperation(operation, name) {
        performance.mark(`${name}-start`);

        const result = operation();

        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);

        const measure = performance.getEntriesByName(name)[0];
        console.log(`${name} took ${measure.duration.toFixed(2)}ms`);

        return result;
    }

    // CSS containment for performance
    static applyContainment(element, containment = "layout style paint") {
        element.style.contain = containment;
    }

    // Efficient event delegation
    static createEventDelegator(container) {
        const handlers = new Map();

        container.addEventListener("click", (event) => {
            let element = event.target;

            while (element && element !== container) {
                const selector = element.dataset.action;
                if (selector && handlers.has(selector)) {
                    const handler = handlers.get(selector);
                    handler(event, element);
                    break;
                }
                element = element.parentElement;
            }
        });

        return {
            register(selector, handler) {
                handlers.set(selector, handler);
            },

            unregister(selector) {
                handlers.delete(selector);
            },
        };
    }
}

// Example: Virtual list usage
const container = document.getElementById("list-container");
const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
}));

const virtualList = DOMPerformance.createVirtualList(
    container,
    items,
    50, // Item height
    (item, index) => {
        const div = document.createElement("div");
        div.textContent = item.name;
        div.className = "list-item";
        return div;
    }
);
```

### 2. Layout and Reflow Optimization

```javascript
// Layout optimization techniques
class LayoutOptimizer {
    // Avoid layout thrashing
    static readThenWrite(elements, readCallback, writeCallback) {
        // Read phase
        const readings = elements.map((element) => readCallback(element));

        // Write phase
        elements.forEach((element, index) => {
            writeCallback(element, readings[index]);
        });
    }

    // Batch geometry readings
    static batchGeometryReads(elements) {
        return elements.map((element) => ({
            element,
            rect: element.getBoundingClientRect(),
            computedStyle: window.getComputedStyle(element),
            scrollTop: element.scrollTop,
            scrollLeft: element.scrollLeft,
        }));
    }

    // CSS class management for performance
    static batchClassChanges(changes) {
        // Group by operation type
        const additions = [];
        const removals = [];
        const toggles = [];

        changes.forEach((change) => {
            switch (change.type) {
                case "add":
                    additions.push(change);
                    break;
                case "remove":
                    removals.push(change);
                    break;
                case "toggle":
                    toggles.push(change);
                    break;
            }
        });

        // Apply in batches
        requestAnimationFrame(() => {
            removals.forEach(({ element, className }) => {
                element.classList.remove(className);
            });

            additions.forEach(({ element, className }) => {
                element.classList.add(className);
            });

            toggles.forEach(({ element, className, force }) => {
                element.classList.toggle(className, force);
            });
        });
    }

    // Transform-based positioning for better performance
    static setTransformPosition(element, x, y, z = 0) {
        element.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    }

    // Will-change optimization
    static optimizeForAnimation(element, properties = "transform") {
        element.style.willChange = properties;

        // Clean up after animation
        const cleanup = () => {
            element.style.willChange = "auto";
        };

        return cleanup;
    }

    // Layout boundaries
    static createLayoutBoundary(element) {
        element.style.contain = "layout";
        element.style.position = "relative";
        element.style.zIndex = "0";
    }

    // Efficient DOM measurements
    static createMeasurementCache() {
        const cache = new Map();

        return {
            measure(element, property) {
                const key = `${element}_${property}`;

                if (cache.has(key)) {
                    return cache.get(key);
                }

                let value;
                switch (property) {
                    case "width":
                        value = element.offsetWidth;
                        break;
                    case "height":
                        value = element.offsetHeight;
                        break;
                    case "rect":
                        value = element.getBoundingClientRect();
                        break;
                    default:
                        value = element[property];
                }

                cache.set(key, value);
                return value;
            },

            invalidate(element) {
                for (let key of cache.keys()) {
                    if (key.startsWith(element.toString())) {
                        cache.delete(key);
                    }
                }
            },

            clear() {
                cache.clear();
            },
        };
    }

    // Animation frame scheduler
    static createScheduler() {
        const tasks = [];
        let isScheduled = false;

        const flush = () => {
            isScheduled = false;
            const currentTasks = tasks.splice(0);

            currentTasks.forEach((task) => {
                try {
                    task();
                } catch (error) {
                    console.error("Scheduler task error:", error);
                }
            });
        };

        return {
            schedule(task) {
                tasks.push(task);

                if (!isScheduled) {
                    isScheduled = true;
                    requestAnimationFrame(flush);
                }
            },

            cancel(task) {
                const index = tasks.indexOf(task);
                if (index !== -1) {
                    tasks.splice(index, 1);
                }
            },
        };
    }
}
```

---

## Virtual DOM Concepts

### 1. Simple Virtual DOM Implementation

```javascript
// Basic Virtual DOM implementation
class VirtualDOM {
    static createElement(type, props = {}, ...children) {
        return {
            type,
            props: { ...props, children: children.flat() },
            children,
        };
    }

    static render(vdom, container) {
        const dom = this.createDOMElement(vdom);
        container.appendChild(dom);
        return dom;
    }

    static createDOMElement(vdom) {
        if (typeof vdom === "string" || typeof vdom === "number") {
            return document.createTextNode(vdom);
        }

        const element = document.createElement(vdom.type);

        // Set properties
        Object.entries(vdom.props).forEach(([key, value]) => {
            if (key === "children") return;

            if (key.startsWith("on") && typeof value === "function") {
                // Event listener
                const event = key.slice(2).toLowerCase();
                element.addEventListener(event, value);
            } else if (key === "className") {
                element.className = value;
            } else if (key === "style" && typeof value === "object") {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });

        // Append children
        vdom.children.forEach((child) => {
            element.appendChild(this.createDOMElement(child));
        });

        return element;
    }

    static diff(oldVdom, newVdom) {
        if (!oldVdom) {
            return { type: "CREATE", newVdom };
        }

        if (!newVdom) {
            return { type: "REMOVE" };
        }

        if (
            typeof oldVdom !== typeof newVdom ||
            (typeof oldVdom === "string" && oldVdom !== newVdom) ||
            oldVdom.type !== newVdom.type
        ) {
            return { type: "REPLACE", newVdom };
        }

        if (typeof newVdom === "object") {
            const propPatches = this.diffProps(oldVdom.props, newVdom.props);
            const childPatches = this.diffChildren(
                oldVdom.children,
                newVdom.children
            );

            if (propPatches.length || childPatches.length) {
                return {
                    type: "UPDATE",
                    propPatches,
                    childPatches,
                };
            }
        }

        return null;
    }

    static diffProps(oldProps, newProps) {
        const patches = [];

        // Check for changed/new props
        Object.entries(newProps).forEach(([key, value]) => {
            if (key === "children") return;

            if (oldProps[key] !== value) {
                patches.push({ type: "SET_PROP", key, value });
            }
        });

        // Check for removed props
        Object.keys(oldProps).forEach((key) => {
            if (key === "children") return;

            if (!(key in newProps)) {
                patches.push({ type: "REMOVE_PROP", key });
            }
        });

        return patches;
    }

    static diffChildren(oldChildren, newChildren) {
        const patches = [];
        const length = Math.max(oldChildren.length, newChildren.length);

        for (let i = 0; i < length; i++) {
            const patch = this.diff(oldChildren[i], newChildren[i]);
            if (patch) {
                patches.push({ index: i, patch });
            }
        }

        return patches;
    }

    static patch(parent, patches, index = 0) {
        if (!patches) return;

        const element = parent.childNodes[index];

        switch (patches.type) {
            case "CREATE":
                parent.appendChild(this.createDOMElement(patches.newVdom));
                break;

            case "REMOVE":
                parent.removeChild(element);
                break;

            case "REPLACE":
                parent.replaceChild(
                    this.createDOMElement(patches.newVdom),
                    element
                );
                break;

            case "UPDATE":
                this.patchProps(element, patches.propPatches);
                patches.childPatches.forEach((childPatch) => {
                    this.patch(element, childPatch.patch, childPatch.index);
                });
                break;
        }
    }

    static patchProps(element, propPatches) {
        propPatches.forEach((patch) => {
            switch (patch.type) {
                case "SET_PROP":
                    if (patch.key.startsWith("on")) {
                        // Event listener
                        const event = patch.key.slice(2).toLowerCase();
                        element.addEventListener(event, patch.value);
                    } else if (patch.key === "className") {
                        element.className = patch.value;
                    } else if (patch.key === "style") {
                        Object.assign(element.style, patch.value);
                    } else {
                        element.setAttribute(patch.key, patch.value);
                    }
                    break;

                case "REMOVE_PROP":
                    element.removeAttribute(patch.key);
                    break;
            }
        });
    }
}

// Component system
class Component {
    constructor(props = {}) {
        this.props = props;
        this.state = {};
        this.vdom = null;
        this.dom = null;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.update();
    }

    render() {
        // Override in subclasses
        return VirtualDOM.createElement("div", {}, "Component");
    }

    mount(container) {
        this.vdom = this.render();
        this.dom = VirtualDOM.render(this.vdom, container);
        return this.dom;
    }

    update() {
        const newVdom = this.render();
        const patches = VirtualDOM.diff(this.vdom, newVdom);

        if (patches) {
            VirtualDOM.patch(
                this.dom.parentNode,
                patches,
                Array.from(this.dom.parentNode.childNodes).indexOf(this.dom)
            );
        }

        this.vdom = newVdom;
    }
}

// Example component
class Counter extends Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
    }

    render() {
        return VirtualDOM.createElement(
            "div",
            { className: "counter" },
            VirtualDOM.createElement("h2", {}, `Count: ${this.state.count}`),
            VirtualDOM.createElement(
                "button",
                {
                    onClick: () =>
                        this.setState({ count: this.state.count + 1 }),
                },
                "Increment"
            ),
            VirtualDOM.createElement(
                "button",
                {
                    onClick: () =>
                        this.setState({ count: this.state.count - 1 }),
                },
                "Decrement"
            )
        );
    }
}
```

---

## Intersection Observer API

### 1. Advanced Intersection Observer Usage

```javascript
// Intersection Observer utilities
class IntersectionObserverManager {
    constructor() {
        this.observers = new Map();
    }

    // Create observer with options
    createObserver(callback, options = {}) {
        const defaultOptions = {
            root: null,
            rootMargin: "0px",
            threshold: [0, 0.1, 0.5, 1.0],
        };

        const observerOptions = { ...defaultOptions, ...options };
        const observer = new IntersectionObserver(callback, observerOptions);

        const id = Date.now() + Math.random();
        this.observers.set(id, observer);

        return { id, observer };
    }

    // Lazy loading implementation
    static setupLazyLoading(options = {}) {
        const {
            selector = "[data-lazy]",
            rootMargin = "50px",
            threshold = 0.1,
            loadingClass = "loading",
            loadedClass = "loaded",
            errorClass = "error",
        } = options;

        const elements = document.querySelectorAll(selector);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.loadElement(entry.target, {
                            loadingClass,
                            loadedClass,
                            errorClass,
                        });
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin, threshold }
        );

        elements.forEach((element) => observer.observe(element));

        return observer;
    }

    static async loadElement(element, classes) {
        const { loadingClass, loadedClass, errorClass } = classes;

        element.classList.add(loadingClass);

        try {
            if (element.tagName === "IMG") {
                await this.loadImage(element);
            } else if (element.dataset.lazyContent) {
                await this.loadContent(element);
            } else if (element.dataset.lazyScript) {
                await this.loadScript(element);
            }

            element.classList.remove(loadingClass);
            element.classList.add(loadedClass);
        } catch (error) {
            element.classList.remove(loadingClass);
            element.classList.add(errorClass);
            console.error("Lazy loading failed:", error);
        }
    }

    static loadImage(img) {
        return new Promise((resolve, reject) => {
            const src = img.dataset.src || img.dataset.lazy;
            if (!src) {
                reject(new Error("No source specified"));
                return;
            }

            const image = new Image();
            image.onload = () => {
                img.src = src;
                resolve();
            };
            image.onerror = reject;
            image.src = src;
        });
    }

    static async loadContent(element) {
        const url = element.dataset.lazyContent;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const content = await response.text();
        element.innerHTML = content;
    }

    static loadScript(element) {
        return new Promise((resolve, reject) => {
            const src = element.dataset.lazyScript;
            const script = document.createElement("script");

            script.onload = resolve;
            script.onerror = reject;
            script.src = src;

            document.head.appendChild(script);
        });
    }

    // Infinite scroll implementation
    static setupInfiniteScroll(options = {}) {
        const {
            container = document.documentElement,
            loadMore,
            threshold = 0.1,
            rootMargin = "100px",
        } = options;

        let isLoading = false;

        // Create sentinel element
        const sentinel = document.createElement("div");
        sentinel.className = "infinite-scroll-sentinel";
        container.appendChild(sentinel);

        const observer = new IntersectionObserver(
            async (entries) => {
                const entry = entries[0];

                if (entry.isIntersecting && !isLoading && loadMore) {
                    isLoading = true;

                    try {
                        const hasMore = await loadMore();
                        if (!hasMore) {
                            observer.unobserve(sentinel);
                            sentinel.remove();
                        }
                    } catch (error) {
                        console.error("Load more failed:", error);
                    } finally {
                        isLoading = false;
                    }
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(sentinel);

        return {
            observer,
            destroy() {
                observer.disconnect();
                sentinel.remove();
            },
        };
    }

    // Visibility tracking
    static trackVisibility(elements, callback, options = {}) {
        const defaultOptions = {
            threshold: [0, 0.25, 0.5, 0.75, 1.0],
            rootMargin: "0px",
        };

        const observerOptions = { ...defaultOptions, ...options };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                callback({
                    element: entry.target,
                    isVisible: entry.isIntersecting,
                    visibilityRatio: entry.intersectionRatio,
                    boundingRect: entry.boundingClientRect,
                    intersectionRect: entry.intersectionRect,
                });
            });
        }, observerOptions);

        elements.forEach((element) => observer.observe(element));

        return observer;
    }

    // Sticky positioning detection
    static detectStickyPosition(element, callback) {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const isStuck = entry.intersectionRatio < 1;
                callback(isStuck, entry);
            },
            { threshold: [1] }
        );

        observer.observe(element);
        return observer;
    }

    // Cleanup all observers
    destroy() {
        this.observers.forEach((observer) => observer.disconnect());
        this.observers.clear();
    }
}

// Usage examples
const observerManager = new IntersectionObserverManager();

// Lazy loading setup
IntersectionObserverManager.setupLazyLoading({
    selector: "img[data-src]",
    rootMargin: "100px",
});

// Infinite scroll setup
const infiniteScroll = IntersectionObserverManager.setupInfiniteScroll({
    loadMore: async () => {
        // Load more content
        const response = await fetch("/api/more-content");
        const data = await response.json();

        // Append new content
        data.items.forEach((item) => {
            const element = createItemElement(item);
            document.getElementById("content").appendChild(element);
        });

        return data.hasMore;
    },
});

// Visibility tracking
IntersectionObserverManager.trackVisibility(
    document.querySelectorAll(".track-visibility"),
    (data) => {
        console.log("Visibility changed:", data);

        if (data.isVisible && data.visibilityRatio > 0.5) {
            // Element is mostly visible
            data.element.classList.add("in-view");
        } else {
            data.element.classList.remove("in-view");
        }
    }
);
```

---

## Mutation Observer API

### 1. DOM Change Monitoring

```javascript
// Mutation Observer utilities
class MutationObserverManager {
    constructor() {
        this.observers = new Map();
    }

    // Create observer with callback
    createObserver(target, callback, options = {}) {
        const defaultOptions = {
            childList: true,
            attributes: false,
            attributeOldValue: false,
            characterData: false,
            characterDataOldValue: false,
            subtree: false,
        };

        const observerOptions = { ...defaultOptions, ...options };

        const observer = new MutationObserver((mutations) => {
            const processedMutations = this.processMutations(mutations);
            callback(processedMutations, observer);
        });

        observer.observe(target, observerOptions);

        const id = Date.now() + Math.random();
        this.observers.set(id, observer);

        return { id, observer };
    }

    processMutations(mutations) {
        return mutations.map((mutation) => ({
            type: mutation.type,
            target: mutation.target,
            addedNodes: Array.from(mutation.addedNodes),
            removedNodes: Array.from(mutation.removedNodes),
            attributeName: mutation.attributeName,
            attributeNamespace: mutation.attributeNamespace,
            oldValue: mutation.oldValue,
        }));
    }

    // Track specific attribute changes
    static watchAttribute(element, attributeName, callback) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === attributeName
                ) {
                    callback({
                        element: mutation.target,
                        attributeName: mutation.attributeName,
                        oldValue: mutation.oldValue,
                        newValue: mutation.target.getAttribute(attributeName),
                    });
                }
            });
        });

        observer.observe(element, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: [attributeName],
        });

        return observer;
    }

    // Watch for new elements matching selector
    static watchForElements(selector, callback, root = document.body) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the node itself matches
                        if (node.matches(selector)) {
                            callback(node, "added");
                        }

                        // Check descendants
                        const descendants = node.querySelectorAll(selector);
                        descendants.forEach((descendant) => {
                            callback(descendant, "added");
                        });
                    }
                });

                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches(selector)) {
                            callback(node, "removed");
                        }

                        const descendants = node.querySelectorAll(selector);
                        descendants.forEach((descendant) => {
                            callback(descendant, "removed");
                        });
                    }
                });
            });
        });

        observer.observe(root, {
            childList: true,
            subtree: true,
        });

        return observer;
    }

    // Auto-initialize components
    static setupAutoInit(componentMap, root = document.body) {
        const initializeComponent = (element, type) => {
            const ComponentClass = componentMap[element.dataset.component];
            if (ComponentClass && !element._componentInstance) {
                element._componentInstance = new ComponentClass(element);
            }
        };

        // Initialize existing components
        Object.keys(componentMap).forEach((componentName) => {
            const elements = root.querySelectorAll(
                `[data-component="${componentName}"]`
            );
            elements.forEach((element) =>
                initializeComponent(element, "existing")
            );
        });

        // Watch for new components
        return this.watchForElements(
            "[data-component]",
            (element, type) => {
                if (type === "added") {
                    initializeComponent(element, "added");
                } else if (type === "removed" && element._componentInstance) {
                    element._componentInstance.destroy?.();
                    element._componentInstance = null;
                }
            },
            root
        );
    }

    // Content change detection
    static watchContentChanges(element, callback, options = {}) {
        const {
            debounce = 100,
            includeAttributes = false,
            includeCharacterData = true,
        } = options;

        let debounceTimer;

        const observer = new MutationObserver((mutations) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const changes = {
                    contentChanged: false,
                    attributesChanged: false,
                    structureChanged: false,
                };

                mutations.forEach((mutation) => {
                    switch (mutation.type) {
                        case "childList":
                            changes.structureChanged = true;
                            break;
                        case "attributes":
                            changes.attributesChanged = true;
                            break;
                        case "characterData":
                            changes.contentChanged = true;
                            break;
                    }
                });

                callback(changes, mutations);
            }, debounce);
        });

        observer.observe(element, {
            childList: true,
            subtree: true,
            attributes: includeAttributes,
            attributeOldValue: includeAttributes,
            characterData: includeCharacterData,
            characterDataOldValue: includeCharacterData,
        });

        return observer;
    }

    // Form validation observer
    static setupFormValidation(form) {
        const observer = new MutationObserver((mutations) => {
            let shouldValidate = false;

            mutations.forEach((mutation) => {
                if (
                    mutation.type === "attributes" &&
                    (mutation.attributeName === "value" ||
                        mutation.attributeName === "checked")
                ) {
                    shouldValidate = true;
                }
            });

            if (shouldValidate) {
                this.validateForm(form);
            }
        });

        observer.observe(form, {
            attributes: true,
            subtree: true,
            attributeFilter: ["value", "checked"],
        });

        return observer;
    }

    static validateForm(form) {
        const inputs = form.querySelectorAll("input, textarea, select");
        let isValid = true;

        inputs.forEach((input) => {
            const valid = input.checkValidity();
            input.classList.toggle("invalid", !valid);
            if (!valid) isValid = false;
        });

        form.classList.toggle("form-valid", isValid);

        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) {
            submitButton.disabled = !isValid;
        }
    }

    // Cleanup all observers
    disconnect(id) {
        if (id && this.observers.has(id)) {
            this.observers.get(id).disconnect();
            this.observers.delete(id);
        } else {
            this.observers.forEach((observer) => observer.disconnect());
            this.observers.clear();
        }
    }
}

// Usage examples
const mutationManager = new MutationObserverManager();

// Watch for theme changes
MutationObserverManager.watchAttribute(
    document.body,
    "data-theme",
    (change) => {
        console.log("Theme changed:", change.oldValue, "->", change.newValue);
        applyTheme(change.newValue);
    }
);

// Auto-initialize components
const componentMap = {
    dropdown: DropdownComponent,
    modal: ModalComponent,
    tooltip: TooltipComponent,
};

MutationObserverManager.setupAutoInit(componentMap);

// Watch content changes
MutationObserverManager.watchContentChanges(
    document.getElementById("content"),
    (changes) => {
        if (changes.structureChanged) {
            console.log("DOM structure changed");
            updateTableOfContents();
        }
    }
);
```

---

## Web Components Basics

### 1. Custom Elements

```javascript
// Web Components utilities
class WebComponentHelper {
    // Base class for custom elements
    static createBaseElement() {
        return class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: "open" });
                this._connected = false;
                this._props = new Map();
                this._eventListeners = new Map();
            }

            static get observedAttributes() {
                return [];
            }

            connectedCallback() {
                if (!this._connected) {
                    this.render();
                    this.setupEventListeners();
                    this._connected = true;
                }
            }

            disconnectedCallback() {
                this.cleanup();
                this._connected = false;
            }

            attributeChangedCallback(name, oldValue, newValue) {
                if (oldValue !== newValue) {
                    this.handleAttributeChange(name, oldValue, newValue);
                }
            }

            // Property management
            defineProperty(name, options = {}) {
                const {
                    type = String,
                    default: defaultValue,
                    reflect = false,
                    attribute = name.toLowerCase(),
                } = options;

                this._props.set(name, {
                    type,
                    defaultValue,
                    reflect,
                    attribute,
                });

                Object.defineProperty(this, name, {
                    get() {
                        return this.getAttribute(attribute) !== null
                            ? this.convertAttributeValue(
                                  this.getAttribute(attribute),
                                  type
                              )
                            : defaultValue;
                    },
                    set(value) {
                        const oldValue = this[name];
                        if (reflect) {
                            if (value === null || value === undefined) {
                                this.removeAttribute(attribute);
                            } else {
                                this.setAttribute(attribute, value);
                            }
                        }
                        this.propertyChanged(name, oldValue, value);
                    },
                });
            }

            convertAttributeValue(value, type) {
                switch (type) {
                    case Boolean:
                        return value !== null;
                    case Number:
                        return Number(value);
                    case Array:
                        try {
                            return JSON.parse(value);
                        } catch {
                            return [];
                        }
                    case Object:
                        try {
                            return JSON.parse(value);
                        } catch {
                            return {};
                        }
                    default:
                        return value;
                }
            }

            // Event management
            addEventListener(type, listener, options) {
                super.addEventListener(type, listener, options);

                if (!this._eventListeners.has(type)) {
                    this._eventListeners.set(type, []);
                }
                this._eventListeners.get(type).push({ listener, options });
            }

            removeEventListener(type, listener, options) {
                super.removeEventListener(type, listener, options);

                if (this._eventListeners.has(type)) {
                    const listeners = this._eventListeners.get(type);
                    const index = listeners.findIndex(
                        (l) => l.listener === listener
                    );
                    if (index !== -1) {
                        listeners.splice(index, 1);
                    }
                }
            }

            // Template and styling
            setTemplate(template) {
                this.shadowRoot.innerHTML = template;
            }

            setStyles(styles) {
                const styleElement = document.createElement("style");
                styleElement.textContent = styles;
                this.shadowRoot.appendChild(styleElement);
            }

            // Abstract methods (override in subclasses)
            render() {
                // Override to define component template
            }

            setupEventListeners() {
                // Override to setup event listeners
            }

            cleanup() {
                // Override to cleanup resources
            }

            handleAttributeChange(name, oldValue, newValue) {
                // Override to handle attribute changes
            }

            propertyChanged(name, oldValue, newValue) {
                // Override to handle property changes
            }

            // Utility methods
            $(selector) {
                return this.shadowRoot.querySelector(selector);
            }

            $$(selector) {
                return this.shadowRoot.querySelectorAll(selector);
            }

            emit(eventName, detail = {}) {
                const event = new CustomEvent(eventName, {
                    detail,
                    bubbles: true,
                    cancelable: true,
                });
                this.dispatchEvent(event);
                return event;
            }
        };
    }

    // Define a custom element
    static define(tagName, elementClass, options = {}) {
        if (customElements.get(tagName)) {
            console.warn(`Custom element ${tagName} is already defined`);
            return;
        }

        customElements.define(tagName, elementClass, options);
    }

    // Create element with lifecycle callbacks
    static createElement(tagName, lifecycle = {}) {
        const BaseElement = this.createBaseElement();

        class CustomElement extends BaseElement {
            constructor() {
                super();
                if (lifecycle.constructor) {
                    lifecycle.constructor.call(this);
                }
            }

            connectedCallback() {
                super.connectedCallback();
                if (lifecycle.connected) {
                    lifecycle.connected.call(this);
                }
            }

            disconnectedCallback() {
                super.disconnectedCallback();
                if (lifecycle.disconnected) {
                    lifecycle.disconnected.call(this);
                }
            }

            attributeChangedCallback(name, oldValue, newValue) {
                super.attributeChangedCallback(name, oldValue, newValue);
                if (lifecycle.attributeChanged) {
                    lifecycle.attributeChanged.call(
                        this,
                        name,
                        oldValue,
                        newValue
                    );
                }
            }

            render() {
                if (lifecycle.render) {
                    lifecycle.render.call(this);
                }
            }
        }

        if (lifecycle.observedAttributes) {
            CustomElement.observedAttributes = lifecycle.observedAttributes;
        }

        return CustomElement;
    }
}

// Example: Creating a card component
class CardComponent extends WebComponentHelper.createBaseElement() {
    static get observedAttributes() {
        return ["title", "image", "href"];
    }

    constructor() {
        super();
        this.defineProperty("title", { type: String, reflect: true });
        this.defineProperty("image", { type: String, reflect: true });
        this.defineProperty("href", { type: String, reflect: true });
    }

    render() {
        this.setStyles(`
            :host {
                display: block;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s;
            }
            
            :host(:hover) {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            
            .card-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
            }
            
            .card-content {
                padding: 16px;
            }
            
            .card-title {
                margin: 0 0 8px 0;
                font-size: 1.25rem;
                font-weight: bold;
            }
            
            .card-link {
                color: #007bff;
                text-decoration: none;
            }
        `);

        this.setTemplate(`
            <div class="card">
                ${
                    this.image
                        ? `<img class="card-image" src="${this.image}" alt="${this.title}">`
                        : ""
                }
                <div class="card-content">
                    <h3 class="card-title">${this.title || "Card Title"}</h3>
                    <slot></slot>
                    ${
                        this.href
                            ? `<a class="card-link" href="${this.href}">Learn More</a>`
                            : ""
                    }
                </div>
            </div>
        `);
    }

    setupEventListeners() {
        const link = this.$(".card-link");
        if (link) {
            link.addEventListener("click", (e) => {
                this.emit("card-link-click", { href: this.href });
            });
        }

        this.addEventListener("click", () => {
            this.emit("card-click", { title: this.title });
        });
    }

    handleAttributeChange(name, oldValue, newValue) {
        if (this._connected) {
            this.render();
        }
    }
}

// Register the component
WebComponentHelper.define("custom-card", CardComponent);

// Example: Simple button component using utility
const SimpleButton = WebComponentHelper.createElement("simple-button", {
    observedAttributes: ["variant", "disabled"],

    constructor() {
        this.defineProperty("variant", {
            type: String,
            default: "primary",
            reflect: true,
        });
        this.defineProperty("disabled", {
            type: Boolean,
            default: false,
            reflect: true,
        });
    },

    render() {
        this.setStyles(`
            button {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
            }
            
            :host([variant="primary"]) button {
                background: #007bff;
                color: white;
            }
            
            :host([variant="secondary"]) button {
                background: #6c757d;
                color: white;
            }
            
            :host([disabled]) button {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `);

        this.setTemplate(`
            <button>
                <slot></slot>
            </button>
        `);
    },

    connected() {
        this.$("button").addEventListener("click", (e) => {
            if (this.disabled) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            this.emit("button-click");
        });
    },
});

WebComponentHelper.define("simple-button", SimpleButton);
```

---

## Next Steps

This concludes Part 5 of the JavaScript Comprehensive Guide, covering Advanced DOM Techniques and Performance Optimization.

**What's coming in Part 6:**

-   Modern DOM APIs (ResizeObserver, PerformanceObserver)
-   Advanced Web Components
-   Best Practices and Patterns
-   Browser Compatibility and Polyfills

**Key Takeaways from Part 5:**

1. **Advanced DOM**: DocumentFragment, Range API, Shadow DOM
2. **Performance**: Virtual DOM concepts, efficient updates, lazy loading
3. **Observers**: Intersection and Mutation Observers for reactive programming
4. **Web Components**: Custom elements with lifecycle management

Ready for Part 6 to complete the series!
