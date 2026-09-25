# JavaScript Comprehensive Guide - Part 6: Modern APIs & Best Practices

## Table of Contents - Part 6

1. [Modern DOM APIs](#modern-dom-apis)
2. [ResizeObserver API](#resizeobserver-api)
3. [PerformanceObserver API](#performanceobserver-api)
4. [Advanced Web Components](#advanced-web-components)
5. [Browser Compatibility](#browser-compatibility)
6. [Best Practices](#best-practices)

---

## Modern DOM APIs

### 1. ResizeObserver API

```javascript
// ResizeObserver utilities
class ResizeObserverManager {
    constructor() {
        this.observers = new Map();
    }

    // Create resize observer
    observe(elements, callback, options = {}) {
        const {
            box = "content-box", // content-box, border-box, device-pixel-content-box
            debounce = 0,
        } = options;

        let debounceTimer;

        const observer = new ResizeObserver((entries) => {
            if (debounce > 0) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.handleResize(entries, callback);
                }, debounce);
            } else {
                this.handleResize(entries, callback);
            }
        });

        const elementsArray = Array.isArray(elements) ? elements : [elements];
        elementsArray.forEach((element) => {
            observer.observe(element, { box });
        });

        const id = Date.now() + Math.random();
        this.observers.set(id, observer);

        return { id, observer };
    }

    handleResize(entries, callback) {
        const resizeData = entries.map((entry) => ({
            element: entry.target,
            contentRect: entry.contentRect,
            borderBoxSize: entry.borderBoxSize,
            contentBoxSize: entry.contentBoxSize,
            devicePixelContentBoxSize: entry.devicePixelContentBoxSize,
        }));

        callback(resizeData);
    }

    // Responsive components
    static setupResponsiveComponent(element, breakpoints) {
        const observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                const width = entry.contentRect.width;

                // Remove all breakpoint classes
                Object.keys(breakpoints).forEach((breakpoint) => {
                    element.classList.remove(`${breakpoint}-size`);
                });

                // Add appropriate breakpoint class
                for (const [breakpoint, minWidth] of Object.entries(
                    breakpoints
                )) {
                    if (width >= minWidth) {
                        element.classList.add(`${breakpoint}-size`);
                    }
                }
            });
        });

        observer.observe(element);
        return observer;
    }

    // Auto-scaling text
    static setupAutoScalingText(element, options = {}) {
        const { minFontSize = 12, maxFontSize = 48, unit = "px" } = options;

        const observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                const { width, height } = entry.contentRect;
                const textLength = element.textContent.length;

                // Calculate font size based on container size and text length
                let fontSize = Math.min((width / textLength) * 2, height * 0.8);
                fontSize = Math.max(
                    minFontSize,
                    Math.min(maxFontSize, fontSize)
                );

                element.style.fontSize = `${fontSize}${unit}`;
            });
        });

        observer.observe(element);
        return observer;
    }

    // Grid auto-fit
    static setupAutoFitGrid(container, options = {}) {
        const {
            minItemWidth = 200,
            gap = 16,
            itemSelector = ".grid-item",
        } = options;

        const observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                const { width } = entry.contentRect;
                const columns = Math.floor(
                    (width + gap) / (minItemWidth + gap)
                );

                container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
                container.style.gap = `${gap}px`;
            });
        });

        observer.observe(container);
        return observer;
    }

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
const resizeManager = new ResizeObserverManager();

// Responsive component
ResizeObserverManager.setupResponsiveComponent(
    document.querySelector(".responsive-card"),
    {
        small: 0,
        medium: 400,
        large: 600,
    }
);

// Auto-scaling text
ResizeObserverManager.setupAutoScalingText(
    document.querySelector(".auto-scale-text"),
    { minFontSize: 16, maxFontSize: 72 }
);
```

### 2. PerformanceObserver API

```javascript
// Performance monitoring utilities
class PerformanceMonitor {
    constructor() {
        this.observers = new Map();
        this.metrics = new Map();
        this.setupPerformanceObservers();
    }

    setupPerformanceObservers() {
        // Observe paint metrics
        this.observePaintMetrics();

        // Observe layout shift
        this.observeLayoutShift();

        // Observe largest contentful paint
        this.observeLargestContentfulPaint();

        // Observe first input delay
        this.observeFirstInputDelay();

        // Observe navigation timing
        this.observeNavigationTiming();

        // Observe resource timing
        this.observeResourceTiming();
    }

    observePaintMetrics() {
        if (!("PerformanceObserver" in window)) return;

        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                this.recordMetric(entry.name, entry.startTime);

                if (entry.name === "first-contentful-paint") {
                    this.onFirstContentfulPaint(entry.startTime);
                }
            });
        });

        observer.observe({ entryTypes: ["paint"] });
        this.observers.set("paint", observer);
    }

    observeLayoutShift() {
        if (!("PerformanceObserver" in window)) return;

        let cumulativeScore = 0;

        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (!entry.hadRecentInput) {
                    cumulativeScore += entry.value;
                }
            });

            this.recordMetric("cumulative-layout-shift", cumulativeScore);
        });

        observer.observe({ entryTypes: ["layout-shift"] });
        this.observers.set("layout-shift", observer);
    }

    observeLargestContentfulPaint() {
        if (!("PerformanceObserver" in window)) return;

        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];

            this.recordMetric("largest-contentful-paint", lastEntry.startTime);
            this.onLargestContentfulPaint(
                lastEntry.startTime,
                lastEntry.element
            );
        });

        observer.observe({ entryTypes: ["largest-contentful-paint"] });
        this.observers.set("lcp", observer);
    }

    observeFirstInputDelay() {
        if (!("PerformanceObserver" in window)) return;

        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                const delay = entry.processingStart - entry.startTime;
                this.recordMetric("first-input-delay", delay);
                this.onFirstInputDelay(delay);
            });
        });

        observer.observe({ entryTypes: ["first-input"] });
        this.observers.set("fid", observer);
    }

    observeNavigationTiming() {
        if (!("PerformanceObserver" in window)) return;

        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                const metrics = {
                    "dns-lookup":
                        entry.domainLookupEnd - entry.domainLookupStart,
                    "tcp-connect": entry.connectEnd - entry.connectStart,
                    "request-response": entry.responseEnd - entry.requestStart,
                    "dom-processing": entry.domComplete - entry.domLoading,
                    "total-load-time": entry.loadEventEnd - entry.fetchStart,
                };

                Object.entries(metrics).forEach(([name, value]) => {
                    this.recordMetric(name, value);
                });
            });
        });

        observer.observe({ entryTypes: ["navigation"] });
        this.observers.set("navigation", observer);
    }

    observeResourceTiming() {
        if (!("PerformanceObserver" in window)) return;

        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                const resourceData = {
                    name: entry.name,
                    type: this.getResourceType(entry.name),
                    duration: entry.duration,
                    size: entry.transferSize,
                    cached: entry.transferSize === 0,
                };

                this.onResourceLoad(resourceData);
            });
        });

        observer.observe({ entryTypes: ["resource"] });
        this.observers.set("resource", observer);
    }

    getResourceType(url) {
        if (url.includes(".js")) return "script";
        if (url.includes(".css")) return "stylesheet";
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return "image";
        if (url.includes(".woff")) return "font";
        return "other";
    }

    recordMetric(name, value) {
        this.metrics.set(name, {
            value,
            timestamp: Date.now(),
        });

        // Send to analytics
        this.sendMetric(name, value);
    }

    sendMetric(name, value) {
        // Send to analytics service
        console.log(`Metric: ${name} = ${value.toFixed(2)}ms`);

        // Example: Send to Google Analytics
        if (typeof gtag !== "undefined") {
            gtag("event", "performance_metric", {
                metric_name: name,
                metric_value: Math.round(value),
                custom_map: { metric_id: name },
            });
        }
    }

    onFirstContentfulPaint(time) {
        console.log(`First Contentful Paint: ${time.toFixed(2)}ms`);

        if (time > 2000) {
            console.warn("Slow First Contentful Paint detected");
        }
    }

    onLargestContentfulPaint(time, element) {
        console.log(`Largest Contentful Paint: ${time.toFixed(2)}ms`, element);

        if (time > 2500) {
            console.warn("Slow Largest Contentful Paint detected");
        }
    }

    onFirstInputDelay(delay) {
        console.log(`First Input Delay: ${delay.toFixed(2)}ms`);

        if (delay > 100) {
            console.warn("High First Input Delay detected");
        }
    }

    onResourceLoad(resource) {
        if (resource.duration > 1000) {
            console.warn(
                `Slow resource load: ${
                    resource.name
                } (${resource.duration.toFixed(2)}ms)`
            );
        }
    }

    // Get performance summary
    getPerformanceSummary() {
        return {
            paintMetrics: {
                fcp: this.metrics.get("first-contentful-paint")?.value,
                lcp: this.metrics.get("largest-contentful-paint")?.value,
            },
            interactionMetrics: {
                fid: this.metrics.get("first-input-delay")?.value,
                cls: this.metrics.get("cumulative-layout-shift")?.value,
            },
            navigationMetrics: {
                dnsLookup: this.metrics.get("dns-lookup")?.value,
                tcpConnect: this.metrics.get("tcp-connect")?.value,
                requestResponse: this.metrics.get("request-response")?.value,
                domProcessing: this.metrics.get("dom-processing")?.value,
                totalLoadTime: this.metrics.get("total-load-time")?.value,
            },
        };
    }

    // Custom performance marks and measures
    mark(name) {
        performance.mark(name);
    }

    measure(name, startMark, endMark) {
        performance.measure(name, startMark, endMark);

        const measure = performance.getEntriesByName(name, "measure")[0];
        this.recordMetric(name, measure.duration);

        return measure.duration;
    }

    // Measure function execution time
    measureFunction(func, name) {
        return (...args) => {
            const startMark = `${name}-start`;
            const endMark = `${name}-end`;

            this.mark(startMark);
            const result = func.apply(this, args);
            this.mark(endMark);

            this.measure(name, startMark, endMark);

            return result;
        };
    }

    // Measure async function execution time
    measureAsyncFunction(func, name) {
        return async (...args) => {
            const startMark = `${name}-start`;
            const endMark = `${name}-end`;

            this.mark(startMark);
            const result = await func.apply(this, args);
            this.mark(endMark);

            this.measure(name, startMark, endMark);

            return result;
        };
    }

    disconnect() {
        this.observers.forEach((observer) => observer.disconnect());
        this.observers.clear();
    }
}

// Usage
const performanceMonitor = new PerformanceMonitor();

// Measure function performance
const optimizedFunction = performanceMonitor.measureFunction(
    function expensiveOperation() {
        // Some expensive operation
        for (let i = 0; i < 1000000; i++) {
            Math.random();
        }
    },
    "expensive-operation"
);

// Measure async function performance
const optimizedAsyncFunction = performanceMonitor.measureAsyncFunction(
    async function fetchData() {
        const response = await fetch("/api/data");
        return response.json();
    },
    "fetch-data"
);
```

### 3. Other Modern APIs

```javascript
// Additional modern DOM APIs
class ModernDOMAPIs {
    // Clipboard API
    static async writeToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback for older browsers
            return this.fallbackCopyToClipboard(text);
        }
    }

    static async readFromClipboard() {
        try {
            return await navigator.clipboard.readText();
        } catch (error) {
            console.error("Failed to read from clipboard:", error);
            return null;
        }
    }

    static fallbackCopyToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand("copy");
            document.body.removeChild(textArea);
            return successful;
        } catch (error) {
            document.body.removeChild(textArea);
            return false;
        }
    }

    // Web Share API
    static async shareContent(data) {
        if (navigator.share) {
            try {
                await navigator.share(data);
                return true;
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Error sharing:", error);
                }
                return false;
            }
        } else {
            // Fallback: copy to clipboard
            const shareText = `${data.title}\n${data.text}\n${data.url}`;
            return this.writeToClipboard(shareText);
        }
    }

    // Page Visibility API
    static setupVisibilityHandling(callbacks) {
        const { onVisible, onHidden } = callbacks;

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                onVisible?.();
            } else {
                onHidden?.();
            }
        });

        // Initial state
        if (document.visibilityState === "visible") {
            onVisible?.();
        } else {
            onHidden?.();
        }
    }

    // Fullscreen API
    static async enterFullscreen(element = document.documentElement) {
        try {
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen();
            }
            return true;
        } catch (error) {
            console.error("Failed to enter fullscreen:", error);
            return false;
        }
    }

    static async exitFullscreen() {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }
            return true;
        } catch (error) {
            console.error("Failed to exit fullscreen:", error);
            return false;
        }
    }

    static isFullscreen() {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        );
    }

    // Screen Wake Lock API
    static async requestWakeLock() {
        try {
            if ("wakeLock" in navigator) {
                const wakeLock = await navigator.wakeLock.request("screen");
                return wakeLock;
            }
        } catch (error) {
            console.error("Failed to request wake lock:", error);
        }
        return null;
    }

    // Web Locks API
    static async withLock(name, callback, options = {}) {
        if ("locks" in navigator) {
            return navigator.locks.request(name, options, callback);
        } else {
            // Fallback without locking
            return callback();
        }
    }

    // Idle Detection API
    static async setupIdleDetection(threshold = 60000) {
        try {
            if ("IdleDetector" in window) {
                const idleDetector = new IdleDetector();
                idleDetector.addEventListener("change", () => {
                    console.log(`User state: ${idleDetector.userState}`);
                    console.log(`Screen state: ${idleDetector.screenState}`);
                });

                await idleDetector.start({ threshold });
                return idleDetector;
            }
        } catch (error) {
            console.error("Failed to setup idle detection:", error);
        }
        return null;
    }
}

// Usage examples
ModernDOMAPIs.setupVisibilityHandling({
    onVisible: () => {
        console.log("Page is visible - resume animations");
        // Resume timers, animations, etc.
    },
    onHidden: () => {
        console.log("Page is hidden - pause animations");
        // Pause timers, animations, etc.
    },
});

// Share button
document.getElementById("share-btn")?.addEventListener("click", async () => {
    const success = await ModernDOMAPIs.shareContent({
        title: "Amazing Article",
        text: "Check out this amazing article!",
        url: window.location.href,
    });

    if (success) {
        console.log("Content shared successfully");
    }
});

// Copy to clipboard
document.getElementById("copy-btn")?.addEventListener("click", async () => {
    const success = await ModernDOMAPIs.writeToClipboard("Text to copy");
    if (success) {
        console.log("Text copied to clipboard");
    }
});
```

---

## Advanced Web Components

### 1. Component Communication

```javascript
// Advanced Web Component patterns
class ComponentCommunication {
    // Event-based communication
    static createEventBus() {
        const eventTarget = new EventTarget();

        return {
            emit(eventName, data) {
                eventTarget.dispatchEvent(
                    new CustomEvent(eventName, {
                        detail: data,
                    })
                );
            },

            on(eventName, callback) {
                eventTarget.addEventListener(eventName, callback);
            },

            off(eventName, callback) {
                eventTarget.removeEventListener(eventName, callback);
            },

            once(eventName, callback) {
                eventTarget.addEventListener(eventName, callback, {
                    once: true,
                });
            },
        };
    }

    // State management for components
    static createStore(initialState = {}) {
        let state = { ...initialState };
        const subscribers = new Set();

        return {
            getState() {
                return { ...state };
            },

            setState(newState) {
                const oldState = { ...state };
                state = { ...state, ...newState };

                subscribers.forEach((callback) => {
                    callback(state, oldState);
                });
            },

            subscribe(callback) {
                subscribers.add(callback);

                return () => {
                    subscribers.delete(callback);
                };
            },

            dispatch(action) {
                if (typeof action === "function") {
                    action(this.setState.bind(this), this.getState.bind(this));
                } else {
                    this.setState(action);
                }
            },
        };
    }

    // Component registry
    static createComponentRegistry() {
        const components = new Map();

        return {
            register(name, componentClass) {
                components.set(name, componentClass);

                if (customElements.get(name)) {
                    console.warn(`Component ${name} is already registered`);
                    return;
                }

                customElements.define(name, componentClass);
            },

            get(name) {
                return components.get(name);
            },

            has(name) {
                return components.has(name);
            },

            create(name, attributes = {}) {
                const ComponentClass = components.get(name);
                if (!ComponentClass) {
                    throw new Error(`Component ${name} not found`);
                }

                const element = document.createElement(name);
                Object.entries(attributes).forEach(([key, value]) => {
                    element.setAttribute(key, value);
                });

                return element;
            },
        };
    }
}

// Example: Advanced component with state management
class TodoList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // Create local store
        this.store = ComponentCommunication.createStore({
            items: [],
            filter: "all",
        });

        // Subscribe to state changes
        this.unsubscribe = this.store.subscribe((state, oldState) => {
            this.render(state);
        });

        this.setupTemplate();
        this.setupEventListeners();
    }

    connectedCallback() {
        this.render(this.store.getState());
    }

    disconnectedCallback() {
        this.unsubscribe();
    }

    setupTemplate() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    max-width: 400px;
                    margin: 0 auto;
                    font-family: Arial, sans-serif;
                }
                
                .todo-header {
                    margin-bottom: 20px;
                }
                
                .todo-input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                
                .todo-filters {
                    margin: 10px 0;
                    text-align: center;
                }
                
                .filter-btn {
                    margin: 0 5px;
                    padding: 5px 10px;
                    border: 1px solid #ddd;
                    background: white;
                    cursor: pointer;
                }
                
                .filter-btn.active {
                    background: #007bff;
                    color: white;
                }
                
                .todo-item {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                }
                
                .todo-item.completed {
                    text-decoration: line-through;
                    opacity: 0.6;
                }
                
                .todo-checkbox {
                    margin-right: 10px;
                }
                
                .todo-text {
                    flex-grow: 1;
                }
                
                .todo-delete {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    cursor: pointer;
                    border-radius: 3px;
                }
            </style>
            
            <div class="todo-header">
                <input type="text" class="todo-input" placeholder="Add a new todo...">
            </div>
            
            <div class="todo-filters">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="active">Active</button>
                <button class="filter-btn" data-filter="completed">Completed</button>
            </div>
            
            <div class="todo-list"></div>
        `;
    }

    setupEventListeners() {
        const input = this.shadowRoot.querySelector(".todo-input");
        const filters = this.shadowRoot.querySelector(".todo-filters");
        const list = this.shadowRoot.querySelector(".todo-list");

        // Add todo
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && input.value.trim()) {
                this.addTodo(input.value.trim());
                input.value = "";
            }
        });

        // Filter todos
        filters.addEventListener("click", (e) => {
            if (e.target.classList.contains("filter-btn")) {
                this.setFilter(e.target.dataset.filter);
            }
        });

        // Todo item actions
        list.addEventListener("change", (e) => {
            if (e.target.classList.contains("todo-checkbox")) {
                const id = parseInt(e.target.dataset.id);
                this.toggleTodo(id);
            }
        });

        list.addEventListener("click", (e) => {
            if (e.target.classList.contains("todo-delete")) {
                const id = parseInt(e.target.dataset.id);
                this.deleteTodo(id);
            }
        });
    }

    addTodo(text) {
        this.store.dispatch((setState, getState) => {
            const { items } = getState();
            const newItem = {
                id: Date.now(),
                text,
                completed: false,
            };

            setState({ items: [...items, newItem] });
        });
    }

    toggleTodo(id) {
        this.store.dispatch((setState, getState) => {
            const { items } = getState();
            const updatedItems = items.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            );

            setState({ items: updatedItems });
        });
    }

    deleteTodo(id) {
        this.store.dispatch((setState, getState) => {
            const { items } = getState();
            const filteredItems = items.filter((item) => item.id !== id);

            setState({ items: filteredItems });
        });
    }

    setFilter(filter) {
        this.store.setState({ filter });
    }

    render(state) {
        const { items, filter } = state;

        // Update filter buttons
        const filterBtns = this.shadowRoot.querySelectorAll(".filter-btn");
        filterBtns.forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.filter === filter);
        });

        // Filter items
        let filteredItems = items;
        if (filter === "active") {
            filteredItems = items.filter((item) => !item.completed);
        } else if (filter === "completed") {
            filteredItems = items.filter((item) => item.completed);
        }

        // Render items
        const list = this.shadowRoot.querySelector(".todo-list");
        list.innerHTML = filteredItems
            .map(
                (item) => `
            <div class="todo-item ${item.completed ? "completed" : ""}">
                <input type="checkbox" class="todo-checkbox" 
                       data-id="${item.id}" ${item.completed ? "checked" : ""}>
                <span class="todo-text">${item.text}</span>
                <button class="todo-delete" data-id="${item.id}">Delete</button>
            </div>
        `
            )
            .join("");
    }
}

// Register component
customElements.define("todo-list", TodoList);
```

---

## Browser Compatibility

### 1. Feature Detection and Polyfills

```javascript
// Feature detection and polyfill utilities
class BrowserCompatibility {
    // Feature detection
    static detectFeatures() {
        return {
            // Web Components
            customElements: 'customElements' in window,
            shadowDOM: 'attachShadow' in Element.prototype,
            templates: 'content' in document.createElement('template'),

            // Modern APIs
            intersectionObserver: 'IntersectionObserver' in window,
            mutationObserver: 'MutationObserver' in window,
            resizeObserver: 'ResizeObserver' in window,
            performanceObserver: 'PerformanceObserver' in window,

            // ES6+ Features
            es6Classes: (() => {
                try {
                    eval('class Test {}');
                    return true;
                } catch (e) {
                    return false;
                }
            })(),
            arrow functions: (() => {
                try {
                    eval('() => {}');
                    return true;
                } catch (e) {
                    return false;
                }
            })(),
            promises: 'Promise' in window,
            asyncAwait: (() => {
                try {
                    eval('(async () => {})');
                    return true;
                } catch (e) {
                    return false;
                }
            })(),

            // Storage
            localStorage: 'localStorage' in window,
            sessionStorage: 'sessionStorage' in window,
            indexedDB: 'indexedDB' in window,

            // Network
            fetch: 'fetch' in window,
            serviceWorker: 'serviceWorker' in navigator,
            webRTC: 'RTCPeerConnection' in window,

            // Media
            getUserMedia: 'getUserMedia' in navigator.mediaDevices,
            webGL: (() => {
                try {
                    const canvas = document.createElement('canvas');
                    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                } catch (e) {
                    return false;
                }
            })(),

            // Touch
            touchEvents: 'ontouchstart' in window,
            pointerEvents: 'onpointerdown' in window
        };
    }

    // Load polyfills conditionally
    static async loadPolyfills() {
        const features = this.detectFeatures();
        const polyfills = [];

        // Web Components polyfills
        if (!features.customElements || !features.shadowDOM) {
            polyfills.push(this.loadScript('https://unpkg.com/@webcomponents/webcomponentsjs@2.6.0/webcomponents-bundle.js'));
        }

        // Intersection Observer polyfill
        if (!features.intersectionObserver) {
            polyfills.push(this.loadScript('https://unpkg.com/intersection-observer@0.12.0/intersection-observer.js'));
        }

        // ResizeObserver polyfill
        if (!features.resizeObserver) {
            polyfills.push(this.loadScript('https://unpkg.com/resize-observer-polyfill@1.5.1/dist/ResizeObserver.global.js'));
        }

        // Fetch polyfill
        if (!features.fetch) {
            polyfills.push(this.loadScript('https://unpkg.com/whatwg-fetch@3.6.2/dist/fetch.umd.js'));
        }

        // Promise polyfill
        if (!features.promises) {
            polyfills.push(this.loadScript('https://unpkg.com/es6-promise@4.2.8/dist/es6-promise.auto.min.js'));
        }

        await Promise.all(polyfills);
    }

    static loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Browser-specific fixes
    static applyBrowserFixes() {
        // Fix for Safari's lack of smooth scrolling
        if (this.isSafari() && !CSS.supports('scroll-behavior', 'smooth')) {
            this.applySmoothScrollPolyfill();
        }

        // Fix for IE's lack of closest method
        if (!Element.prototype.closest) {
            this.applyClosestPolyfill();
        }

        // Fix for IE's lack of remove method
        if (!Element.prototype.remove) {
            this.applyRemovePolyfill();
        }
    }

    static isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    static isIE() {
        return /MSIE|Trident/.test(navigator.userAgent);
    }

    static applySmoothScrollPolyfill() {
        // Simple smooth scroll polyfill
        const originalScrollTo = window.scrollTo;

        window.scrollTo = function(options) {
            if (typeof options === 'object' && options.behavior === 'smooth') {
                this.smoothScrollTo(options.left || 0, options.top || 0);
            } else {
                originalScrollTo.apply(this, arguments);
            }
        };

        window.smoothScrollTo = function(x, y) {
            const startX = window.pageXOffset;
            const startY = window.pageYOffset;
            const deltaX = x - startX;
            const deltaY = y - startY;
            const duration = 500;
            const startTime = Date.now();

            function scroll() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;

                window.scrollTo(
                    startX + deltaX * easeProgress,
                    startY + deltaY * easeProgress
                );

                if (progress < 1) {
                    requestAnimationFrame(scroll);
                }
            }

            requestAnimationFrame(scroll);
        };
    }

    static applyClosestPolyfill() {
        Element.prototype.closest = function(selector) {
            let element = this;

            while (element && element.nodeType === 1) {
                if (element.matches(selector)) {
                    return element;
                }
                element = element.parentElement;
            }

            return null;
        };
    }

    static applyRemovePolyfill() {
        Element.prototype.remove = function() {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        };
    }

    // Progressive enhancement helper
    static enhance(selector, enhancementFn, fallbackFn) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            try {
                enhancementFn(element);
            } catch (error) {
                console.warn('Enhancement failed, falling back:', error);
                if (fallbackFn) {
                    fallbackFn(element);
                }
            }
        });
    }
}

// Initialize compatibility
BrowserCompatibility.loadPolyfills().then(() => {
    BrowserCompatibility.applyBrowserFixes();
    console.log('Browser compatibility initialized');
});
```

---

## Best Practices

### 1. Performance Best Practices

```javascript
// DOM Performance Best Practices
class DOMBestPractices {
    // Efficient DOM queries
    static cacheSelectors(selectors) {
        const cache = {};

        Object.entries(selectors).forEach(([key, selector]) => {
            cache[key] = document.querySelector(selector);
        });

        return cache;
    }

    // Batch DOM operations
    static batchOperations(operations) {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                operations.forEach((operation) => operation());
                resolve();
            });
        });
    }

    // Minimize reflows and repaints
    static optimizeStyles(element, styles) {
        // Use transform instead of changing layout properties
        if (styles.x !== undefined || styles.y !== undefined) {
            const x = styles.x || 0;
            const y = styles.y || 0;
            element.style.transform = `translate(${x}px, ${y}px)`;
            delete styles.x;
            delete styles.y;
        }

        // Batch style changes
        Object.assign(element.style, styles);
    }

    // Use CSS containment
    static applyContainment(element, types = ["layout", "style"]) {
        element.style.contain = types.join(" ");
    }

    // Efficient event handling
    static setupEfficientEvents(container, eventMap) {
        // Use event delegation
        container.addEventListener("click", (event) => {
            for (const [selector, handler] of Object.entries(eventMap)) {
                if (event.target.matches(selector)) {
                    handler(event);
                    break;
                }
            }
        });
    }

    // Memory leak prevention
    static createCleanupManager() {
        const resources = new Set();

        return {
            addCleanup(cleanupFn) {
                resources.add(cleanupFn);
            },

            cleanup() {
                resources.forEach((fn) => {
                    try {
                        fn();
                    } catch (error) {
                        console.error("Cleanup error:", error);
                    }
                });
                resources.clear();
            },
        };
    }

    // Debounce and throttle utilities
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    // Accessibility best practices
    static enhanceAccessibility(element) {
        // Ensure focusable elements have proper ARIA attributes
        if (element.matches('button, [role="button"]')) {
            if (
                !element.hasAttribute("aria-label") &&
                !element.textContent.trim()
            ) {
                console.warn("Button element missing accessible name");
            }
        }

        // Add skip links for navigation
        if (element.matches("nav")) {
            const skipLink = document.createElement("a");
            skipLink.href = "#main-content";
            skipLink.textContent = "Skip to main content";
            skipLink.className = "skip-link";
            element.insertBefore(skipLink, element.firstChild);
        }

        // Ensure proper heading hierarchy
        if (element.matches("h1, h2, h3, h4, h5, h6")) {
            const level = parseInt(element.tagName[1]);
            const previousHeading = element.previousElementSibling?.matches(
                "h1, h2, h3, h4, h5, h6"
            );

            if (previousHeading) {
                const prevLevel = parseInt(
                    element.previousElementSibling.tagName[1]
                );
                if (level > prevLevel + 1) {
                    console.warn("Heading hierarchy skip detected");
                }
            }
        }
    }

    // Security best practices
    static sanitizeHTML(html) {
        const div = document.createElement("div");
        div.textContent = html;
        return div.innerHTML;
    }

    static createSecureElement(tagName, attributes = {}, textContent = "") {
        const element = document.createElement(tagName);

        // Sanitize attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key.startsWith("on")) {
                console.warn("Event handler attributes not allowed");
                return;
            }

            if (key === "src" || key === "href") {
                if (!this.isSecureURL(value)) {
                    console.warn("Potentially unsafe URL detected");
                    return;
                }
            }

            element.setAttribute(key, value);
        });

        // Sanitize text content
        element.textContent = textContent;

        return element;
    }

    static isSecureURL(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return (
                urlObj.protocol === "https:" ||
                urlObj.protocol === "http:" ||
                urlObj.protocol === "mailto:" ||
                urlObj.protocol === "tel:"
            );
        } catch {
            return false;
        }
    }
}

// Usage examples
const selectors = DOMBestPractices.cacheSelectors({
    header: "header",
    nav: "nav",
    main: "main",
    footer: "footer",
});

// Batch operations
DOMBestPractices.batchOperations([
    () => (selectors.header.style.height = "80px"),
    () => (selectors.nav.style.backgroundColor = "blue"),
    () => (selectors.main.style.minHeight = "calc(100vh - 160px)"),
]);

// Setup efficient events
DOMBestPractices.setupEfficientEvents(document.body, {
    ".button": (e) => console.log("Button clicked"),
    ".link": (e) => console.log("Link clicked"),
    ".card": (e) => console.log("Card clicked"),
});

// Cleanup manager
const cleanup = DOMBestPractices.createCleanupManager();

const interval = setInterval(() => console.log("Running"), 1000);
cleanup.addCleanup(() => clearInterval(interval));

// Clean up when needed
window.addEventListener("beforeunload", () => {
    cleanup.cleanup();
});
```

---

## Final Summary

This completes the comprehensive 6-part JavaScript DOM & BOM guide covering:

**Part 3**: DOM Fundamentals, Selection, Manipulation, Events
**Part 4**: Forms, BOM, Storage, Timers  
**Part 5**: Advanced DOM, Performance, Observers, Web Components
**Part 6**: Modern APIs, Advanced Components, Compatibility, Best Practices

**Key Takeaways:**

1. **Modern APIs**: ResizeObserver, PerformanceObserver, Clipboard, Share APIs
2. **Advanced Components**: State management, communication patterns
3. **Compatibility**: Feature detection, polyfills, progressive enhancement
4. **Best Practices**: Performance optimization, accessibility, security

**Next Steps:**

-   Practice building interactive components
-   Implement performance monitoring
-   Create reusable web components
-   Focus on accessibility and security

The DOM & BOM mastery journey is complete! 🎉
