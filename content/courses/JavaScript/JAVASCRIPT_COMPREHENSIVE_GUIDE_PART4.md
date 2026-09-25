# JavaScript Comprehensive Guide - Part 4: Forms & BOM

## Table of Contents - Part 4

1. [Forms and Input Handling](#forms-and-input-handling)
2. [Form Validation](#form-validation)
3. [BOM (Browser Object Model)](#bom-browser-object-model)
4. [Window Object](#window-object)
5. [Location and History](#location-and-history)
6. [Storage APIs](#storage-apis)
7. [Timers and Scheduling](#timers-and-scheduling)

---

## Forms and Input Handling

### 1. Form Element Access and Manipulation

```javascript
// Form and input handling
class FormHandler {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.setupFormHandling();
    }

    setupFormHandling() {
        if (!this.form) return;

        this.form.addEventListener("submit", this.handleSubmit.bind(this));
        this.form.addEventListener("reset", this.handleReset.bind(this));
        this.form.addEventListener("change", this.handleChange.bind(this));
        this.form.addEventListener("input", this.handleInput.bind(this));
    }

    // Get form data in various formats
    getFormData() {
        const formData = new FormData(this.form);

        // As FormData object
        const formDataObj = formData;

        // As plain object
        const plainObject = {};
        for (let [key, value] of formData.entries()) {
            if (plainObject[key]) {
                // Handle multiple values (checkboxes, multiple selects)
                if (Array.isArray(plainObject[key])) {
                    plainObject[key].push(value);
                } else {
                    plainObject[key] = [plainObject[key], value];
                }
            } else {
                plainObject[key] = value;
            }
        }

        // As URLSearchParams
        const urlParams = new URLSearchParams(formData);

        // As JSON string
        const jsonString = JSON.stringify(plainObject);

        return {
            formData: formDataObj,
            object: plainObject,
            urlParams: urlParams,
            json: jsonString,
            queryString: urlParams.toString(),
        };
    }

    // Set form data
    setFormData(data) {
        Object.entries(data).forEach(([name, value]) => {
            const elements = this.form.elements[name];

            if (!elements) return;

            if (elements.type === "radio") {
                // Radio buttons
                const radio = this.form.querySelector(
                    `input[name="${name}"][value="${value}"]`
                );
                if (radio) radio.checked = true;
            } else if (elements.type === "checkbox") {
                // Single checkbox
                elements.checked = Boolean(value);
            } else if (elements.length > 1) {
                // Multiple elements with same name (checkbox group)
                const values = Array.isArray(value) ? value : [value];
                Array.from(elements).forEach((element) => {
                    if (element.type === "checkbox") {
                        element.checked = values.includes(element.value);
                    }
                });
            } else {
                // Regular input, textarea, select
                elements.value = value;
            }
        });
    }

    handleSubmit(event) {
        event.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        const data = this.getFormData();
        console.log("Form submitted:", data);

        // Send to server
        this.submitToServer(data.formData);
    }

    handleReset(event) {
        console.log("Form reset");
        this.clearErrors();
    }

    handleChange(event) {
        const { target } = event;
        console.log(`Field ${target.name} changed:`, target.value);

        // Validate field on change
        this.validateField(target);
    }

    handleInput(event) {
        const { target } = event;

        // Real-time validation for certain fields
        if (target.type === "email" || target.name === "username") {
            this.validateField(target);
        }
    }

    async submitToServer(formData) {
        try {
            const response = await fetch(this.form.action || "/submit", {
                method: this.form.method || "POST",
                body: formData,
            });

            if (response.ok) {
                this.showSuccess("Form submitted successfully!");
                this.form.reset();
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        } catch (error) {
            this.showError(`Submission failed: ${error.message}`);
        }
    }

    showSuccess(message) {
        this.showMessage(message, "success");
    }

    showError(message) {
        this.showMessage(message, "error");
    }

    showMessage(message, type) {
        const messageEl = document.createElement("div");
        messageEl.className = `form-message form-message--${type}`;
        messageEl.textContent = message;

        this.form.insertBefore(messageEl, this.form.firstChild);

        setTimeout(() => messageEl.remove(), 5000);
    }
}
```

### 2. Input Types and Handling

```javascript
// Specialized input handlers
class InputHandlers {
    // File input handling
    static setupFileInput(inputSelector) {
        const input = document.querySelector(inputSelector);

        input.addEventListener("change", (event) => {
            const files = Array.from(event.target.files);

            files.forEach((file) => {
                console.log("File selected:", {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: new Date(file.lastModified),
                });

                // Validate file
                if (this.validateFile(file)) {
                    this.previewFile(file);
                }
            });
        });

        // Drag and drop support
        const dropArea = input.closest(".file-drop-area");
        if (dropArea) {
            this.setupFileDragDrop(dropArea, input);
        }
    }

    static validateFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/pdf",
        ];

        if (file.size > maxSize) {
            alert("File too large. Maximum size is 5MB.");
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type. Please select an image or PDF.");
            return false;
        }

        return true;
    }

    static previewFile(file) {
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.querySelector("#file-preview");
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    }

    static setupFileDragDrop(dropArea, input) {
        ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ["dragenter", "dragover"].forEach((eventName) => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add("drag-over");
            });
        });

        ["dragleave", "drop"].forEach((eventName) => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove("drag-over");
            });
        });

        dropArea.addEventListener("drop", (e) => {
            const files = e.dataTransfer.files;
            input.files = files;
            input.dispatchEvent(new Event("change"));
        });
    }

    // Number input with custom controls
    static setupNumberInput(inputSelector) {
        const input = document.querySelector(inputSelector);
        const container = input.parentElement;

        // Create custom controls
        const decreaseBtn = document.createElement("button");
        decreaseBtn.textContent = "-";
        decreaseBtn.type = "button";
        decreaseBtn.className = "number-control decrease";

        const increaseBtn = document.createElement("button");
        increaseBtn.textContent = "+";
        increaseBtn.type = "button";
        increaseBtn.className = "number-control increase";

        container.insertBefore(decreaseBtn, input);
        container.appendChild(increaseBtn);

        const step = parseFloat(input.step) || 1;
        const min = parseFloat(input.min) || -Infinity;
        const max = parseFloat(input.max) || Infinity;

        decreaseBtn.addEventListener("click", () => {
            const currentValue = parseFloat(input.value) || 0;
            const newValue = Math.max(min, currentValue - step);
            input.value = newValue;
            input.dispatchEvent(new Event("input"));
        });

        increaseBtn.addEventListener("click", () => {
            const currentValue = parseFloat(input.value) || 0;
            const newValue = Math.min(max, currentValue + step);
            input.value = newValue;
            input.dispatchEvent(new Event("input"));
        });
    }

    // Search input with autocomplete
    static setupSearchInput(inputSelector, dataSource) {
        const input = document.querySelector(inputSelector);
        const resultsContainer = document.createElement("div");
        resultsContainer.className = "search-results";
        input.parentElement.appendChild(resultsContainer);

        let debounceTimer;

        input.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.performSearch(
                    e.target.value,
                    dataSource,
                    resultsContainer
                );
            }, 300);
        });

        // Hide results when clicking outside
        document.addEventListener("click", (e) => {
            if (
                !input.contains(e.target) &&
                !resultsContainer.contains(e.target)
            ) {
                resultsContainer.style.display = "none";
            }
        });
    }

    static async performSearch(query, dataSource, resultsContainer) {
        if (query.length < 2) {
            resultsContainer.style.display = "none";
            return;
        }

        try {
            const results =
                typeof dataSource === "function"
                    ? await dataSource(query)
                    : dataSource.filter((item) =>
                          item.toLowerCase().includes(query.toLowerCase())
                      );

            this.displaySearchResults(results, resultsContainer);
        } catch (error) {
            console.error("Search error:", error);
        }
    }

    static displaySearchResults(results, container) {
        container.innerHTML = "";

        if (results.length === 0) {
            container.innerHTML =
                '<div class="search-result">No results found</div>';
        } else {
            results.slice(0, 10).forEach((result) => {
                const resultEl = document.createElement("div");
                resultEl.className = "search-result";
                resultEl.textContent = result;
                resultEl.addEventListener("click", () => {
                    const input = container.previousElementSibling;
                    input.value = result;
                    container.style.display = "none";
                    input.dispatchEvent(new Event("input"));
                });
                container.appendChild(resultEl);
            });
        }

        container.style.display = "block";
    }

    // Password input with strength indicator
    static setupPasswordInput(inputSelector) {
        const input = document.querySelector(inputSelector);
        const strengthIndicator = document.createElement("div");
        strengthIndicator.className = "password-strength";
        input.parentElement.appendChild(strengthIndicator);

        input.addEventListener("input", (e) => {
            const strength = this.calculatePasswordStrength(e.target.value);
            this.displayPasswordStrength(strength, strengthIndicator);
        });
    }

    static calculatePasswordStrength(password) {
        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const levels = [
            "Very Weak",
            "Weak",
            "Fair",
            "Good",
            "Strong",
            "Very Strong",
        ];
        return {
            score: score,
            level: levels[score] || "Very Weak",
            percentage: Math.min(100, (score / 6) * 100),
        };
    }

    static displayPasswordStrength(strength, indicator) {
        indicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${strength.percentage}%"></div>
            </div>
            <span class="strength-text">${strength.level}</span>
        `;

        indicator.className = `password-strength strength-${strength.score}`;
    }
}
```

---

## Form Validation

### 1. Client-Side Validation

```javascript
// Comprehensive form validation
class FormValidator {
    constructor(form) {
        this.form = form;
        this.rules = new Map();
        this.errors = new Map();
        this.setupValidation();
    }

    // Add validation rules
    addRule(fieldName, rule) {
        if (!this.rules.has(fieldName)) {
            this.rules.set(fieldName, []);
        }
        this.rules.get(fieldName).push(rule);
        return this;
    }

    // Built-in validation rules
    static rules = {
        required: (value) => ({
            valid: value.trim() !== "",
            message: "This field is required",
        }),

        email: (value) => ({
            valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: "Please enter a valid email address",
        }),

        minLength: (min) => (value) => ({
            valid: value.length >= min,
            message: `Must be at least ${min} characters long`,
        }),

        maxLength: (max) => (value) => ({
            valid: value.length <= max,
            message: `Must be no more than ${max} characters long`,
        }),

        pattern: (regex, message) => (value) => ({
            valid: regex.test(value),
            message: message || "Invalid format",
        }),

        numeric: (value) => ({
            valid: /^\d+$/.test(value),
            message: "Must contain only numbers",
        }),

        phone: (value) => ({
            valid:
                /^[\d\s\-\+\(\)]+$/.test(value) &&
                value.replace(/\D/g, "").length >= 10,
            message: "Please enter a valid phone number",
        }),

        url: (value) => ({
            valid: /^https?:\/\/.+/.test(value),
            message: "Please enter a valid URL",
        }),

        match: (fieldName) => (value, form) => {
            const matchField = form.elements[fieldName];
            return {
                valid: value === matchField.value,
                message: `Must match ${fieldName}`,
            };
        },

        custom: (validator, message) => (value, form) => ({
            valid: validator(value, form),
            message: message,
        }),
    };

    setupValidation() {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.onValidSubmit();
            }
        });

        // Real-time validation
        this.form.addEventListener(
            "blur",
            (e) => {
                if (e.target.matches("input, textarea, select")) {
                    this.validateField(e.target);
                }
            },
            true
        );

        this.form.addEventListener("input", (e) => {
            if (e.target.matches("input, textarea")) {
                // Clear errors on input
                this.clearFieldError(e.target);
            }
        });
    }

    validateForm() {
        this.errors.clear();
        let isValid = true;

        // Validate all fields with rules
        for (let [fieldName, rules] of this.rules.entries()) {
            const field = this.form.elements[fieldName];
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        }

        // HTML5 validation
        if (!this.form.checkValidity()) {
            isValid = false;
            this.handleHTML5Validation();
        }

        return isValid;
    }

    validateField(field) {
        const fieldName = field.name;
        const rules = this.rules.get(fieldName) || [];
        const value = field.value;

        for (let rule of rules) {
            const result = rule(value, this.form);
            if (!result.valid) {
                this.setFieldError(field, result.message);
                return false;
            }
        }

        this.clearFieldError(field);
        return true;
    }

    handleHTML5Validation() {
        const invalidFields = this.form.querySelectorAll(":invalid");
        invalidFields.forEach((field) => {
            const message = field.validationMessage || "Invalid input";
            this.setFieldError(field, message);
        });
    }

    setFieldError(field, message) {
        this.errors.set(field.name, message);

        // Add error class
        field.classList.add("error");

        // Show error message
        this.showFieldError(field, message);

        // ARIA accessibility
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-describedby", `${field.name}-error`);
    }

    clearFieldError(field) {
        this.errors.delete(field.name);

        // Remove error class
        field.classList.remove("error");

        // Hide error message
        this.hideFieldError(field);

        // ARIA accessibility
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
    }

    showFieldError(field, message) {
        let errorEl = document.getElementById(`${field.name}-error`);

        if (!errorEl) {
            errorEl = document.createElement("div");
            errorEl.id = `${field.name}-error`;
            errorEl.className = "field-error";
            errorEl.setAttribute("role", "alert");
            field.parentElement.appendChild(errorEl);
        }

        errorEl.textContent = message;
        errorEl.style.display = "block";
    }

    hideFieldError(field) {
        const errorEl = document.getElementById(`${field.name}-error`);
        if (errorEl) {
            errorEl.style.display = "none";
        }
    }

    onValidSubmit() {
        // Override this method to handle valid form submission
        console.log("Form is valid, submitting...");

        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        // Submit to server
        this.submitForm(data);
    }

    async submitForm(data) {
        try {
            const response = await fetch(this.form.action || "/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                this.showSuccessMessage("Form submitted successfully!");
                this.form.reset();
            } else {
                const errorData = await response.json();
                this.handleServerErrors(errorData.errors);
            }
        } catch (error) {
            this.showErrorMessage("Network error. Please try again.");
        }
    }

    handleServerErrors(errors) {
        Object.entries(errors).forEach(([fieldName, message]) => {
            const field = this.form.elements[fieldName];
            if (field) {
                this.setFieldError(field, message);
            }
        });
    }

    showSuccessMessage(message) {
        this.showMessage(message, "success");
    }

    showErrorMessage(message) {
        this.showMessage(message, "error");
    }

    showMessage(message, type) {
        const messageEl = document.createElement("div");
        messageEl.className = `form-message form-message--${type}`;
        messageEl.textContent = message;
        messageEl.setAttribute("role", "alert");

        this.form.insertBefore(messageEl, this.form.firstChild);

        setTimeout(() => messageEl.remove(), 5000);
    }
}

// Usage example
const validator = new FormValidator(
    document.querySelector("#registration-form")
);

validator
    .addRule("username", FormValidator.rules.required)
    .addRule("username", FormValidator.rules.minLength(3))
    .addRule("username", FormValidator.rules.maxLength(20))
    .addRule("email", FormValidator.rules.required)
    .addRule("email", FormValidator.rules.email)
    .addRule("password", FormValidator.rules.required)
    .addRule("password", FormValidator.rules.minLength(8))
    .addRule("confirmPassword", FormValidator.rules.required)
    .addRule("confirmPassword", FormValidator.rules.match("password"))
    .addRule("phone", FormValidator.rules.phone)
    .addRule("website", FormValidator.rules.url);
```

---

## BOM (Browser Object Model)

### 1. Window Object Fundamentals

```javascript
// Window object exploration
class WindowManager {
    static getWindowInfo() {
        return {
            // Window dimensions
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight,

            // Screen dimensions
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,

            // Scroll position
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            pageXOffset: window.pageXOffset, // Legacy
            pageYOffset: window.pageYOffset, // Legacy

            // Device information
            devicePixelRatio: window.devicePixelRatio,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth,

            // Browser information
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
        };
    }

    // Window manipulation
    static manipulateWindow() {
        // Open new window
        const newWindow = window.open(
            "https://example.com",
            "exampleWindow",
            "width=800,height=600,scrollbars=yes,resizable=yes"
        );

        // Check if popup was blocked
        if (!newWindow || newWindow.closed) {
            console.log("Popup was blocked");
            return;
        }

        // Manipulate new window
        setTimeout(() => {
            newWindow.resizeTo(1000, 700);
            newWindow.moveTo(100, 100);
            newWindow.focus();
        }, 1000);

        // Close window after 5 seconds
        setTimeout(() => {
            newWindow.close();
        }, 5000);

        // Current window manipulation
        window.resizeBy(50, 50);
        window.moveBy(10, 10);

        return newWindow;
    }

    // Scroll management
    static setupScrollManagement() {
        // Smooth scrolling
        const scrollToTop = () => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth",
            });
        };

        const scrollToElement = (selector) => {
            const element = document.querySelector(selector);
            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "nearest",
                });
            }
        };

        // Scroll event handling
        let scrollTimeout;
        window.addEventListener("scroll", () => {
            // Throttle scroll events
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 16); // ~60fps
        });

        return { scrollToTop, scrollToElement };
    }

    static handleScroll() {
        const scrollPercent =
            (window.scrollY /
                (document.body.scrollHeight - window.innerHeight)) *
            100;

        // Update scroll indicator
        const indicator = document.querySelector("#scroll-indicator");
        if (indicator) {
            indicator.style.width = `${scrollPercent}%`;
        }

        // Show/hide back to top button
        const backToTop = document.querySelector("#back-to-top");
        if (backToTop) {
            backToTop.style.display = window.scrollY > 300 ? "block" : "none";
        }
    }

    // Resize handling
    static setupResizeHandling() {
        let resizeTimeout;

        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    static handleResize() {
        const { innerWidth, innerHeight } = window;

        console.log("Window resized:", { innerWidth, innerHeight });

        // Responsive behavior
        if (innerWidth < 768) {
            document.body.classList.add("mobile");
            document.body.classList.remove("desktop");
        } else {
            document.body.classList.add("desktop");
            document.body.classList.remove("mobile");
        }

        // Trigger custom resize event
        window.dispatchEvent(
            new CustomEvent("customResize", {
                detail: { width: innerWidth, height: innerHeight },
            })
        );
    }

    // Focus and visibility
    static setupFocusHandling() {
        window.addEventListener("focus", () => {
            console.log("Window gained focus");
            document.title = "Application - Active";
        });

        window.addEventListener("blur", () => {
            console.log("Window lost focus");
            document.title = "Application - Inactive";
        });

        // Page visibility API
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                console.log("Page became visible");
                this.onPageVisible();
            } else {
                console.log("Page became hidden");
                this.onPageHidden();
            }
        });
    }

    static onPageVisible() {
        // Resume animations, refresh data, etc.
        document.title = document.title.replace(" (Inactive)", "");
    }

    static onPageHidden() {
        // Pause animations, save data, etc.
        if (!document.title.includes("(Inactive)")) {
            document.title += " (Inactive)";
        }
    }
}
```

---

## Location and History

### 1. URL and Navigation Management

```javascript
// Location and history management
class NavigationManager {
    constructor() {
        this.setupHistoryHandling();
        this.setupURLWatching();
    }

    // Location object exploration
    static getLocationInfo() {
        return {
            href: location.href, // Full URL
            protocol: location.protocol, // http: or https:
            hostname: location.hostname, // domain.com
            host: location.host, // domain.com:8080
            port: location.port, // 8080
            pathname: location.pathname, // /path/to/page
            search: location.search, // ?param=value
            hash: location.hash, // #section
            origin: location.origin, // https://domain.com:8080
        };
    }

    // URL manipulation
    static navigateTo(url, replace = false) {
        if (replace) {
            location.replace(url);
        } else {
            location.assign(url);
        }
    }

    static reload(forceReload = false) {
        location.reload(forceReload);
    }

    // URL parameters handling
    static getURLParams() {
        const params = new URLSearchParams(location.search);
        const paramObject = {};

        for (let [key, value] of params.entries()) {
            if (paramObject[key]) {
                // Handle multiple values
                if (Array.isArray(paramObject[key])) {
                    paramObject[key].push(value);
                } else {
                    paramObject[key] = [paramObject[key], value];
                }
            } else {
                paramObject[key] = value;
            }
        }

        return paramObject;
    }

    static setURLParams(params, replace = false) {
        const url = new URL(location.href);

        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                url.searchParams.delete(key);
            } else if (Array.isArray(value)) {
                url.searchParams.delete(key);
                value.forEach((v) => url.searchParams.append(key, v));
            } else {
                url.searchParams.set(key, value);
            }
        });

        if (replace) {
            history.replaceState(null, "", url.toString());
        } else {
            history.pushState(null, "", url.toString());
        }
    }

    // History API
    static pushState(data, title, url) {
        history.pushState(data, title, url);
        this.onStateChange(data, title, url);
    }

    static replaceState(data, title, url) {
        history.replaceState(data, title, url);
        this.onStateChange(data, title, url);
    }

    static goBack() {
        history.back();
    }

    static goForward() {
        history.forward();
    }

    static go(delta) {
        history.go(delta); // -1 for back, 1 for forward, etc.
    }

    setupHistoryHandling() {
        window.addEventListener("popstate", (event) => {
            console.log("History state changed:", event.state);
            this.handlePopState(event);
        });
    }

    handlePopState(event) {
        const state = event.state;
        const url = location.href;

        // Handle different page states
        if (state && state.page) {
            this.loadPage(state.page, state.data);
        } else {
            // Handle initial page load or external navigation
            this.loadPageFromURL(url);
        }
    }

    static onStateChange(data, title, url) {
        console.log("State changed:", { data, title, url });

        // Update page title
        if (title) {
            document.title = title;
        }

        // Trigger custom event
        window.dispatchEvent(
            new CustomEvent("statechange", {
                detail: { data, title, url },
            })
        );
    }

    // Single Page Application routing
    setupSPARouting() {
        const routes = new Map();

        // Define routes
        routes.set("/", () => this.loadPage("home"));
        routes.set("/about", () => this.loadPage("about"));
        routes.set("/contact", () => this.loadPage("contact"));
        routes.set("/user/:id", (params) => this.loadPage("user", params));

        // Route matching
        const matchRoute = (path) => {
            for (let [pattern, handler] of routes.entries()) {
                const params = this.matchPattern(pattern, path);
                if (params !== null) {
                    return { handler, params };
                }
            }
            return null;
        };

        // Handle route changes
        const handleRoute = () => {
            const path = location.pathname;
            const match = matchRoute(path);

            if (match) {
                match.handler(match.params);
            } else {
                this.loadPage("404");
            }
        };

        // Listen for navigation
        window.addEventListener("popstate", handleRoute);

        // Handle initial load
        handleRoute();

        // Intercept link clicks
        document.addEventListener("click", (e) => {
            if (e.target.matches('a[href^="/"]')) {
                e.preventDefault();
                const href = e.target.getAttribute("href");
                history.pushState(null, "", href);
                handleRoute();
            }
        });
    }

    matchPattern(pattern, path) {
        const patternParts = pattern.split("/");
        const pathParts = path.split("/");

        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params = {};

        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];

            if (patternPart.startsWith(":")) {
                // Parameter
                const paramName = patternPart.slice(1);
                params[paramName] = pathPart;
            } else if (patternPart !== pathPart) {
                // Mismatch
                return null;
            }
        }

        return params;
    }

    loadPage(pageName, data = {}) {
        console.log(`Loading page: ${pageName}`, data);

        // Implement page loading logic
        const content = document.querySelector("#content");
        if (content) {
            content.innerHTML = `<h1>Page: ${pageName}</h1>`;

            if (Object.keys(data).length > 0) {
                content.innerHTML += `<p>Data: ${JSON.stringify(data)}</p>`;
            }
        }
    }

    loadPageFromURL(url) {
        const path = new URL(url).pathname;
        this.loadPage(path.slice(1) || "home");
    }

    setupURLWatching() {
        // Watch for URL changes without page reload
        let currentURL = location.href;

        setInterval(() => {
            if (location.href !== currentURL) {
                currentURL = location.href;
                this.onURLChange(currentURL);
            }
        }, 100);
    }

    onURLChange(newURL) {
        console.log("URL changed to:", newURL);

        // Trigger custom event
        window.dispatchEvent(
            new CustomEvent("urlchange", {
                detail: { url: newURL },
            })
        );
    }
}
```

---

## Storage APIs

### 1. Local Storage and Session Storage

```javascript
// Storage management
class StorageManager {
    // Local Storage operations
    static localStorage = {
        set(key, value) {
            try {
                const serialized = JSON.stringify({
                    value: value,
                    timestamp: Date.now(),
                    type: typeof value,
                });
                localStorage.setItem(key, serialized);
                return true;
            } catch (error) {
                console.error("Failed to save to localStorage:", error);
                return false;
            }
        },

        get(key) {
            try {
                const item = localStorage.getItem(key);
                if (!item) return null;

                const parsed = JSON.parse(item);
                return parsed.value;
            } catch (error) {
                console.error("Failed to read from localStorage:", error);
                return null;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error("Failed to remove from localStorage:", error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error("Failed to clear localStorage:", error);
                return false;
            }
        },

        getAll() {
            const items = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                items[key] = this.get(key);
            }
            return items;
        },

        getKeys() {
            return Object.keys(localStorage);
        },

        exists(key) {
            return localStorage.getItem(key) !== null;
        },

        size() {
            return localStorage.length;
        },
    };

    // Session Storage operations (same interface as localStorage)
    static sessionStorage = {
        set(key, value) {
            try {
                const serialized = JSON.stringify({
                    value: value,
                    timestamp: Date.now(),
                    type: typeof value,
                });
                sessionStorage.setItem(key, serialized);
                return true;
            } catch (error) {
                console.error("Failed to save to sessionStorage:", error);
                return false;
            }
        },

        get(key) {
            try {
                const item = sessionStorage.getItem(key);
                if (!item) return null;

                const parsed = JSON.parse(item);
                return parsed.value;
            } catch (error) {
                console.error("Failed to read from sessionStorage:", error);
                return null;
            }
        },

        remove(key) {
            sessionStorage.removeItem(key);
        },

        clear() {
            sessionStorage.clear();
        },

        getAll() {
            const items = {};
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                items[key] = this.get(key);
            }
            return items;
        },
    };

    // Advanced storage with expiration
    static createExpiringStorage(storage) {
        return {
            set(key, value, expirationMinutes = null) {
                const item = {
                    value: value,
                    timestamp: Date.now(),
                    expiration: expirationMinutes
                        ? Date.now() + expirationMinutes * 60 * 1000
                        : null,
                };

                try {
                    storage.setItem(key, JSON.stringify(item));
                    return true;
                } catch (error) {
                    console.error("Storage error:", error);
                    return false;
                }
            },

            get(key) {
                try {
                    const item = storage.getItem(key);
                    if (!item) return null;

                    const parsed = JSON.parse(item);

                    // Check expiration
                    if (parsed.expiration && Date.now() > parsed.expiration) {
                        storage.removeItem(key);
                        return null;
                    }

                    return parsed.value;
                } catch (error) {
                    console.error("Storage error:", error);
                    return null;
                }
            },

            remove(key) {
                storage.removeItem(key);
            },

            clear() {
                storage.clear();
            },

            cleanup() {
                // Remove expired items
                const keysToRemove = [];

                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    const item = storage.getItem(key);

                    try {
                        const parsed = JSON.parse(item);
                        if (
                            parsed.expiration &&
                            Date.now() > parsed.expiration
                        ) {
                            keysToRemove.push(key);
                        }
                    } catch (error) {
                        // Invalid JSON, remove it
                        keysToRemove.push(key);
                    }
                }

                keysToRemove.forEach((key) => storage.removeItem(key));
                return keysToRemove.length;
            },
        };
    }

    // Storage event handling
    static setupStorageEvents() {
        window.addEventListener("storage", (event) => {
            console.log("Storage changed:", {
                key: event.key,
                oldValue: event.oldValue,
                newValue: event.newValue,
                url: event.url,
                storageArea:
                    event.storageArea === localStorage
                        ? "localStorage"
                        : "sessionStorage",
            });

            // Handle specific key changes
            if (event.key === "user-preferences") {
                this.handleUserPreferencesChange(event.newValue);
            }
        });
    }

    static handleUserPreferencesChange(newValue) {
        try {
            const preferences = JSON.parse(newValue);
            this.applyUserPreferences(preferences);
        } catch (error) {
            console.error("Failed to parse user preferences:", error);
        }
    }

    static applyUserPreferences(preferences) {
        // Apply theme, language, etc.
        if (preferences.theme) {
            document.body.className = `theme-${preferences.theme}`;
        }

        if (preferences.language) {
            document.documentElement.lang = preferences.language;
        }
    }

    // Storage quota management
    static async getStorageQuota() {
        if ("storage" in navigator && "estimate" in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                return {
                    quota: estimate.quota,
                    usage: estimate.usage,
                    available: estimate.quota - estimate.usage,
                    percentage: (estimate.usage / estimate.quota) * 100,
                };
            } catch (error) {
                console.error("Failed to get storage estimate:", error);
                return null;
            }
        }
        return null;
    }

    static isStorageAvailable(type) {
        try {
            const storage = window[type];
            const testKey = "__storage_test__";
            storage.setItem(testKey, "test");
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Usage examples
const expiringLocal = StorageManager.createExpiringStorage(localStorage);
const expiringSession = StorageManager.createExpiringStorage(sessionStorage);

// Store data with 30-minute expiration
expiringLocal.set("user-session", { userId: 123, token: "abc" }, 30);

// Store data without expiration
expiringLocal.set("user-preferences", { theme: "dark", language: "en" });

// Clean up expired items
setInterval(() => {
    const removed = expiringLocal.cleanup();
    if (removed > 0) {
        console.log(`Cleaned up ${removed} expired items`);
    }
}, 60000); // Check every minute
```

---

## Timers and Scheduling

### 1. Timer Management

```javascript
// Timer and scheduling utilities
class TimerManager {
    constructor() {
        this.timers = new Map();
        this.intervals = new Map();
        this.animationFrames = new Map();
    }

    // Enhanced setTimeout
    setTimeout(callback, delay, ...args) {
        const id = setTimeout(() => {
            this.timers.delete(id);
            callback(...args);
        }, delay);

        this.timers.set(id, {
            type: "timeout",
            callback,
            delay,
            args,
            created: Date.now(),
        });

        return id;
    }

    // Enhanced setInterval
    setInterval(callback, interval, ...args) {
        const id = setInterval(() => {
            callback(...args);
        }, interval);

        this.intervals.set(id, {
            type: "interval",
            callback,
            interval,
            args,
            created: Date.now(),
        });

        return id;
    }

    // Clear timeout
    clearTimeout(id) {
        clearTimeout(id);
        this.timers.delete(id);
    }

    // Clear interval
    clearInterval(id) {
        clearInterval(id);
        this.intervals.delete(id);
    }

    // Clear all timers
    clearAll() {
        // Clear timeouts
        for (let id of this.timers.keys()) {
            clearTimeout(id);
        }
        this.timers.clear();

        // Clear intervals
        for (let id of this.intervals.keys()) {
            clearInterval(id);
        }
        this.intervals.clear();

        // Clear animation frames
        for (let id of this.animationFrames.keys()) {
            cancelAnimationFrame(id);
        }
        this.animationFrames.clear();
    }

    // Debounced function
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

    // Throttled function
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

    // Animation frame with cleanup
    requestAnimationFrame(callback) {
        const id = requestAnimationFrame((timestamp) => {
            this.animationFrames.delete(id);
            callback(timestamp);
        });

        this.animationFrames.set(id, {
            type: "animationFrame",
            callback,
            created: Date.now(),
        });

        return id;
    }

    cancelAnimationFrame(id) {
        cancelAnimationFrame(id);
        this.animationFrames.delete(id);
    }

    // Scheduled tasks
    scheduleTask(callback, delay, repeat = false) {
        const task = {
            id: Date.now() + Math.random(),
            callback,
            delay,
            repeat,
            nextRun: Date.now() + delay,
            created: Date.now(),
        };

        if (repeat) {
            const id = this.setInterval(() => {
                callback();
            }, delay);
            task.intervalId = id;
        } else {
            const id = this.setTimeout(() => {
                callback();
            }, delay);
            task.timeoutId = id;
        }

        return task.id;
    }

    // High-resolution timer
    static createStopwatch() {
        let startTime;
        let endTime;
        let running = false;

        return {
            start() {
                if (running) return false;
                startTime = performance.now();
                running = true;
                return true;
            },

            stop() {
                if (!running) return null;
                endTime = performance.now();
                running = false;
                return endTime - startTime;
            },

            lap() {
                if (!running) return null;
                return performance.now() - startTime;
            },

            reset() {
                startTime = undefined;
                endTime = undefined;
                running = false;
            },

            isRunning() {
                return running;
            },
        };
    }

    // Performance timing
    static async measurePerformance(func, iterations = 1) {
        const times = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await func();
            const end = performance.now();
            times.push(end - start);
        }

        const total = times.reduce((sum, time) => sum + time, 0);
        const average = total / iterations;
        const min = Math.min(...times);
        const max = Math.max(...times);

        return {
            total,
            average,
            min,
            max,
            times,
            iterations,
        };
    }

    // Get timer statistics
    getStats() {
        return {
            activeTimeouts: this.timers.size,
            activeIntervals: this.intervals.size,
            activeAnimationFrames: this.animationFrames.size,
            total:
                this.timers.size +
                this.intervals.size +
                this.animationFrames.size,
        };
    }
}

// Usage examples
const timerManager = new TimerManager();

// Debounced search
const debouncedSearch = TimerManager.debounce((query) => {
    console.log("Searching for:", query);
    // Perform search
}, 300);

// Throttled scroll handler
const throttledScroll = TimerManager.throttle(() => {
    console.log("Scroll event handled");
}, 100);

// Stopwatch usage
const stopwatch = TimerManager.createStopwatch();
stopwatch.start();
// ... some operation
const lapTime = stopwatch.lap();
// ... more operations
const totalTime = stopwatch.stop();

// Performance measurement
TimerManager.measurePerformance(async () => {
    // Some expensive operation
    await new Promise((resolve) => setTimeout(resolve, 100));
}, 5).then((stats) => {
    console.log("Performance stats:", stats);
});
```

---

## Next Steps

This concludes Part 4 of the JavaScript Comprehensive Guide, covering Forms, BOM, and essential browser APIs.

**What's coming in the next parts:**

-   **Part 5**: Advanced DOM Techniques, Performance Optimization
-   **Part 6**: Modern DOM APIs, Web Components, and Best Practices

**Key Takeaways from Part 4:**

1. **Form Handling**: Comprehensive form management and validation
2. **BOM Mastery**: Browser object model and window manipulation
3. **Navigation**: URL management and single-page application routing
4. **Storage**: Local and session storage with advanced features
5. **Timers**: Efficient timer management and performance measurement

Ready for Part 5? Let's continue with advanced techniques!
