# Phase 6: Advanced HTML

## 🎯 What You'll Learn

-   HTML5 APIs and advanced features
-   Canvas element for graphics and animations
-   SVG for scalable vector graphics
-   Web components and custom elements
-   Modern HTML techniques and emerging standards

---

## 📖 Table of Contents

1. [HTML5 APIs](#html5-apis)
2. [Canvas Element](#canvas-element)
3. [SVG Graphics](#svg-graphics)
4. [Web Components](#web-components)
5. [Advanced Form Features](#advanced-form-features)
6. [Performance and Optimization](#performance-and-optimization)
7. [Practical Examples](#practical-examples)
8. [Exercises](#exercises)

---

## HTML5 APIs

### 1. Geolocation API

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Geolocation Demo</title>
    </head>
    <body>
        <h1>Location Finder</h1>
        <button onclick="getLocation()">Get My Location</button>
        <div id="location-info"></div>

        <script>
            function getLocation() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        showPosition,
                        showError
                    );
                } else {
                    document.getElementById("location-info").innerHTML =
                        "Geolocation is not supported by this browser.";
                }
            }

            function showPosition(position) {
                document.getElementById("location-info").innerHTML =
                    "Latitude: " +
                    position.coords.latitude +
                    "<br>Longitude: " +
                    position.coords.longitude;
            }

            function showError(error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        document.getElementById("location-info").innerHTML =
                            "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        document.getElementById("location-info").innerHTML =
                            "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        document.getElementById("location-info").innerHTML =
                            "The request to get user location timed out.";
                        break;
                    default:
                        document.getElementById("location-info").innerHTML =
                            "An unknown error occurred.";
                }
            }
        </script>
    </body>
</html>
```

### 2. Local Storage

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Local Storage Demo</title>
    </head>
    <body>
        <h1>Local Storage Example</h1>

        <form id="user-form">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" />

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" />

            <button type="submit">Save Data</button>
            <button type="button" onclick="loadData()">Load Data</button>
            <button type="button" onclick="clearData()">Clear Data</button>
        </form>

        <div id="stored-data"></div>

        <script>
            // Save data to localStorage
            document
                .getElementById("user-form")
                .addEventListener("submit", function (e) {
                    e.preventDefault();

                    const username = document.getElementById("username").value;
                    const email = document.getElementById("email").value;

                    localStorage.setItem("username", username);
                    localStorage.setItem("email", email);

                    alert("Data saved!");
                });

            // Load data from localStorage
            function loadData() {
                const username = localStorage.getItem("username");
                const email = localStorage.getItem("email");

                if (username && email) {
                    document.getElementById("stored-data").innerHTML =
                        "<h3>Stored Data:</h3>" +
                        "<p>Username: " +
                        username +
                        "</p>" +
                        "<p>Email: " +
                        email +
                        "</p>";
                } else {
                    document.getElementById("stored-data").innerHTML =
                        "<p>No data found in storage.</p>";
                }
            }

            // Clear localStorage
            function clearData() {
                localStorage.removeItem("username");
                localStorage.removeItem("email");
                document.getElementById("stored-data").innerHTML = "";
                alert("Data cleared!");
            }

            // Load data on page load
            window.onload = loadData;
        </script>
    </body>
</html>
```

### 3. Drag and Drop API

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Drag and Drop Demo</title>
        <style>
            .drag-container {
                display: flex;
                gap: 20px;
                margin: 20px 0;
            }

            .drop-zone {
                width: 200px;
                height: 200px;
                border: 2px dashed #ccc;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f9f9f9;
            }

            .drop-zone.dragover {
                border-color: #007bff;
                background-color: #e7f3ff;
            }

            .draggable-item {
                width: 100px;
                height: 100px;
                background-color: #007bff;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: move;
                border-radius: 4px;
                margin: 10px;
            }
        </style>
    </head>
    <body>
        <h1>Drag and Drop Demo</h1>

        <div class="draggable-item" draggable="true" id="item1">Item 1</div>
        <div class="draggable-item" draggable="true" id="item2">Item 2</div>

        <div class="drag-container">
            <div class="drop-zone" id="zone1">
                <p>Drop Zone 1</p>
            </div>
            <div class="drop-zone" id="zone2">
                <p>Drop Zone 2</p>
            </div>
        </div>

        <script>
            // Drag event handlers
            document.querySelectorAll(".draggable-item").forEach((item) => {
                item.addEventListener("dragstart", function (e) {
                    e.dataTransfer.setData("text/plain", e.target.id);
                    e.target.style.opacity = "0.5";
                });

                item.addEventListener("dragend", function (e) {
                    e.target.style.opacity = "1";
                });
            });

            // Drop zone event handlers
            document.querySelectorAll(".drop-zone").forEach((zone) => {
                zone.addEventListener("dragover", function (e) {
                    e.preventDefault();
                    zone.classList.add("dragover");
                });

                zone.addEventListener("dragleave", function (e) {
                    zone.classList.remove("dragover");
                });

                zone.addEventListener("drop", function (e) {
                    e.preventDefault();
                    zone.classList.remove("dragover");

                    const itemId = e.dataTransfer.getData("text/plain");
                    const item = document.getElementById(itemId);

                    zone.appendChild(item);
                    zone.innerHTML = "";
                    zone.appendChild(item);
                });
            });
        </script>
    </body>
</html>
```

---

## Canvas Element

### 1. Basic Canvas Setup

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Canvas Basics</title>
        <style>
            canvas {
                border: 1px solid #000;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <h1>Canvas Drawing</h1>

        <canvas id="myCanvas" width="400" height="300">
            Your browser does not support the canvas element.
        </canvas>

        <div>
            <button onclick="drawShapes()">Draw Shapes</button>
            <button onclick="clearCanvas()">Clear Canvas</button>
        </div>

        <script>
            const canvas = document.getElementById("myCanvas");
            const ctx = canvas.getContext("2d");

            function drawShapes() {
                // Draw rectangle
                ctx.fillStyle = "#FF0000";
                ctx.fillRect(50, 50, 100, 75);

                // Draw circle
                ctx.beginPath();
                ctx.arc(250, 100, 50, 0, 2 * Math.PI);
                ctx.fillStyle = "#00FF00";
                ctx.fill();

                // Draw line
                ctx.beginPath();
                ctx.moveTo(50, 200);
                ctx.lineTo(350, 250);
                ctx.strokeStyle = "#0000FF";
                ctx.lineWidth = 3;
                ctx.stroke();

                // Draw text
                ctx.font = "20px Arial";
                ctx.fillStyle = "#000000";
                ctx.fillText("Canvas Graphics!", 50, 280);
            }

            function clearCanvas() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        </script>
    </body>
</html>
```

### 2. Interactive Canvas

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Interactive Canvas</title>
        <style>
            canvas {
                border: 2px solid #333;
                cursor: crosshair;
            }
            .controls {
                margin: 10px 0;
            }
            .controls button,
            .controls input {
                margin: 5px;
            }
        </style>
    </head>
    <body>
        <h1>Drawing Canvas</h1>

        <div class="controls">
            <label for="color">Color:</label>
            <input type="color" id="color" value="#000000" />

            <label for="size">Brush Size:</label>
            <input type="range" id="size" min="1" max="20" value="5" />

            <button onclick="clearCanvas()">Clear</button>
        </div>

        <canvas id="drawingCanvas" width="600" height="400">
            Your browser does not support canvas.
        </canvas>

        <script>
            const canvas = document.getElementById("drawingCanvas");
            const ctx = canvas.getContext("2d");
            let isDrawing = false;

            // Mouse events
            canvas.addEventListener("mousedown", startDrawing);
            canvas.addEventListener("mousemove", draw);
            canvas.addEventListener("mouseup", stopDrawing);
            canvas.addEventListener("mouseout", stopDrawing);

            function startDrawing(e) {
                isDrawing = true;
                draw(e);
            }

            function draw(e) {
                if (!isDrawing) return;

                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                ctx.lineWidth = document.getElementById("size").value;
                ctx.lineCap = "round";
                ctx.strokeStyle = document.getElementById("color").value;

                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
            }

            function stopDrawing() {
                if (isDrawing) {
                    isDrawing = false;
                    ctx.beginPath();
                }
            }

            function clearCanvas() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        </script>
    </body>
</html>
```

---

## SVG Graphics

### 1. Basic SVG Elements

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>SVG Graphics</title>
        <style>
            svg {
                border: 1px solid #ccc;
                margin: 10px;
            }
        </style>
    </head>
    <body>
        <h1>SVG Examples</h1>

        <!-- Basic shapes -->
        <svg width="300" height="200">
            <!-- Rectangle -->
            <rect
                x="10"
                y="10"
                width="100"
                height="60"
                fill="red"
                stroke="black"
                stroke-width="2"
            />

            <!-- Circle -->
            <circle
                cx="200"
                cy="50"
                r="40"
                fill="blue"
                stroke="green"
                stroke-width="3"
            />

            <!-- Line -->
            <line
                x1="10"
                y1="100"
                x2="250"
                y2="150"
                stroke="purple"
                stroke-width="4"
            />

            <!-- Polygon -->
            <polygon
                points="50,150 100,120 150,150 125,180 75,180"
                fill="orange"
                stroke="brown"
                stroke-width="2"
            />
        </svg>

        <!-- Interactive SVG -->
        <svg width="300" height="200" id="interactive-svg">
            <circle
                id="moving-circle"
                cx="50"
                cy="100"
                r="20"
                fill="red"
                style="cursor: pointer;"
            >
                <animate
                    attributeName="cx"
                    values="50;250;50"
                    dur="3s"
                    repeatCount="indefinite"
                />
            </circle>

            <text x="10" y="30" font-family="Arial" font-size="16" fill="black">
                Click the moving circle!
            </text>
        </svg>

        <script>
            document
                .getElementById("moving-circle")
                .addEventListener("click", function () {
                    this.setAttribute(
                        "fill",
                        this.getAttribute("fill") === "red" ? "blue" : "red"
                    );
                });
        </script>
    </body>
</html>
```

### 2. SVG Paths and Complex Graphics

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Advanced SVG</title>
    </head>
    <body>
        <h1>Advanced SVG Graphics</h1>

        <!-- Logo design with SVG -->
        <svg width="200" height="200" viewBox="0 0 200 200">
            <defs>
                <linearGradient
                    id="logoGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                >
                    <stop offset="0%" style="stop-color:#ff6b6b" />
                    <stop offset="100%" style="stop-color:#4ecdc4" />
                </linearGradient>
            </defs>

            <!-- Background circle -->
            <circle cx="100" cy="100" r="90" fill="url(#logoGradient)" />

            <!-- Star shape using path -->
            <path
                d="M100,30 L115,70 L155,70 L125,95 L135,135 L100,110 L65,135 L75,95 L45,70 L85,70 Z"
                fill="white"
                stroke="#333"
                stroke-width="2"
            />

            <!-- Text -->
            <text
                x="100"
                y="170"
                text-anchor="middle"
                font-family="Arial, sans-serif"
                font-size="14"
                font-weight="bold"
                fill="white"
            >
                STAR LOGO
            </text>
        </svg>

        <!-- Chart example -->
        <h2>SVG Chart</h2>
        <svg width="400" height="300" viewBox="0 0 400 300">
            <!-- Chart background -->
            <rect width="400" height="300" fill="#f8f9fa" stroke="#dee2e6" />

            <!-- Chart bars -->
            <rect x="50" y="200" width="40" height="80" fill="#007bff" />
            <rect x="120" y="150" width="40" height="130" fill="#28a745" />
            <rect x="190" y="180" width="40" height="100" fill="#ffc107" />
            <rect x="260" y="120" width="40" height="160" fill="#dc3545" />

            <!-- Labels -->
            <text x="70" y="295" text-anchor="middle" font-size="12">Q1</text>
            <text x="140" y="295" text-anchor="middle" font-size="12">Q2</text>
            <text x="210" y="295" text-anchor="middle" font-size="12">Q3</text>
            <text x="280" y="295" text-anchor="middle" font-size="12">Q4</text>

            <!-- Title -->
            <text
                x="200"
                y="30"
                text-anchor="middle"
                font-size="16"
                font-weight="bold"
            >
                Quarterly Sales Report
            </text>
        </svg>
    </body>
</html>
```

---

## Web Components

### 1. Custom Elements

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Web Components</title>
        <style>
            user-card {
                display: block;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 20px;
                margin: 10px 0;
                max-width: 300px;
            }
        </style>
    </head>
    <body>
        <h1>Custom Web Components</h1>

        <!-- Custom element usage -->
        <user-card
            name="John Doe"
            email="john@example.com"
            role="Developer"
        ></user-card>
        <user-card
            name="Jane Smith"
            email="jane@example.com"
            role="Designer"
        ></user-card>

        <script>
            class UserCard extends HTMLElement {
                constructor() {
                    super();

                    // Create shadow DOM
                    this.attachShadow({ mode: "open" });

                    // Component HTML
                    this.shadowRoot.innerHTML = `
                    <style>
                        :host {
                            display: block;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 10px 0;
                            max-width: 300px;
                            font-family: Arial, sans-serif;
                        }
                        
                        .avatar {
                            width: 60px;
                            height: 60px;
                            border-radius: 50%;
                            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 20px;
                            margin-bottom: 10px;
                        }
                        
                        .name {
                            font-size: 18px;
                            font-weight: bold;
                            margin-bottom: 5px;
                        }
                        
                        .email {
                            color: #666;
                            margin-bottom: 5px;
                        }
                        
                        .role {
                            background: #007bff;
                            color: white;
                            padding: 2px 8px;
                            border-radius: 12px;
                            font-size: 12px;
                            display: inline-block;
                        }
                    </style>
                    
                    <div class="avatar">
                        <span id="initials"></span>
                    </div>
                    <div class="name" id="name"></div>
                    <div class="email" id="email"></div>
                    <div class="role" id="role"></div>
                `;
                }

                connectedCallback() {
                    this.updateCard();
                }

                static get observedAttributes() {
                    return ["name", "email", "role"];
                }

                attributeChangedCallback() {
                    this.updateCard();
                }

                updateCard() {
                    const name = this.getAttribute("name") || "Unknown";
                    const email = this.getAttribute("email") || "";
                    const role = this.getAttribute("role") || "";

                    this.shadowRoot.getElementById("name").textContent = name;
                    this.shadowRoot.getElementById("email").textContent = email;
                    this.shadowRoot.getElementById("role").textContent = role;

                    // Generate initials
                    const initials = name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase();
                    this.shadowRoot.getElementById("initials").textContent =
                        initials;
                }
            }

            // Register the custom element
            customElements.define("user-card", UserCard);
        </script>
    </body>
</html>
```

---

## Advanced Form Features

### 1. Form Validation and Custom Elements

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Advanced Forms</title>
        <style>
            .form-container {
                max-width: 500px;
                margin: 0 auto;
                padding: 20px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }

            input,
            select,
            textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
            }

            input:invalid {
                border-color: #dc3545;
            }

            input:valid {
                border-color: #28a745;
            }

            .error-message {
                color: #dc3545;
                font-size: 14px;
                margin-top: 5px;
            }

            .submit-btn {
                background: #007bff;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
            }

            .submit-btn:hover {
                background: #0056b3;
            }

            .submit-btn:disabled {
                background: #6c757d;
                cursor: not-allowed;
            }
        </style>
    </head>
    <body>
        <div class="form-container">
            <h1>Advanced Registration Form</h1>

            <form id="registration-form" novalidate>
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        minlength="3"
                        maxlength="20"
                        pattern="^[a-zA-Z0-9_]+$"
                        title="Username must be 3-20 characters, letters, numbers, and underscores only"
                    />
                    <div class="error-message" id="username-error"></div>
                </div>

                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                    <div class="error-message" id="email-error"></div>
                </div>

                <div class="form-group">
                    <label for="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        minlength="8"
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                        title="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
                    />
                    <div class="error-message" id="password-error"></div>
                </div>

                <div class="form-group">
                    <label for="confirm-password">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirm-password"
                        name="confirm-password"
                        required
                    />
                    <div
                        class="error-message"
                        id="confirm-password-error"
                    ></div>
                </div>

                <div class="form-group">
                    <label for="birthdate">Birth Date:</label>
                    <input
                        type="date"
                        id="birthdate"
                        name="birthdate"
                        required
                    />
                    <div class="error-message" id="birthdate-error"></div>
                </div>

                <div class="form-group">
                    <label for="country">Country:</label>
                    <select id="country" name="country" required>
                        <option value="">Select a country</option>
                        <option value="us">United States</option>
                        <option value="ca">Canada</option>
                        <option value="uk">United Kingdom</option>
                        <option value="au">Australia</option>
                    </select>
                    <div class="error-message" id="country-error"></div>
                </div>

                <div class="form-group">
                    <label>
                        <input
                            type="checkbox"
                            id="terms"
                            name="terms"
                            required
                        />
                        I agree to the Terms and Conditions
                    </label>
                    <div class="error-message" id="terms-error"></div>
                </div>

                <button type="submit" class="submit-btn" id="submit-btn">
                    Register
                </button>
            </form>
        </div>

        <script>
            const form = document.getElementById("registration-form");
            const inputs = form.querySelectorAll("input, select");

            // Real-time validation
            inputs.forEach((input) => {
                input.addEventListener("blur", () => validateField(input));
                input.addEventListener("input", () => clearError(input));
            });

            // Form submission
            form.addEventListener("submit", function (e) {
                e.preventDefault();

                let isValid = true;
                inputs.forEach((input) => {
                    if (!validateField(input)) {
                        isValid = false;
                    }
                });

                // Additional validation
                if (!validatePasswordMatch()) {
                    isValid = false;
                }

                if (!validateAge()) {
                    isValid = false;
                }

                if (isValid) {
                    alert("Registration successful!");
                    // In real application, submit form data here
                }
            });

            function validateField(field) {
                const errorElement = document.getElementById(
                    field.id + "-error"
                );

                if (!field.checkValidity()) {
                    showError(field, errorElement, field.validationMessage);
                    return false;
                }

                clearError(field);
                return true;
            }

            function validatePasswordMatch() {
                const password = document.getElementById("password");
                const confirmPassword =
                    document.getElementById("confirm-password");
                const errorElement = document.getElementById(
                    "confirm-password-error"
                );

                if (password.value !== confirmPassword.value) {
                    showError(
                        confirmPassword,
                        errorElement,
                        "Passwords do not match"
                    );
                    return false;
                }

                clearError(confirmPassword);
                return true;
            }

            function validateAge() {
                const birthdate = document.getElementById("birthdate");
                const errorElement = document.getElementById("birthdate-error");
                const today = new Date();
                const birth = new Date(birthdate.value);
                const age = today.getFullYear() - birth.getFullYear();

                if (age < 18) {
                    showError(
                        birthdate,
                        errorElement,
                        "You must be at least 18 years old"
                    );
                    return false;
                }

                clearError(birthdate);
                return true;
            }

            function showError(field, errorElement, message) {
                field.style.borderColor = "#dc3545";
                errorElement.textContent = message;
            }

            function clearError(field) {
                field.style.borderColor = "#ddd";
                const errorElement = document.getElementById(
                    field.id + "-error"
                );
                errorElement.textContent = "";
            }
        </script>
    </body>
</html>
```

---

## Performance and Optimization

### 1. Lazy Loading Images

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Lazy Loading Demo</title>
        <style>
            .image-container {
                margin: 20px 0;
            }

            .lazy-image {
                width: 100%;
                max-width: 600px;
                height: 300px;
                object-fit: cover;
                transition: opacity 0.3s;
            }

            .lazy-image[data-src] {
                opacity: 0.3;
                background: #f0f0f0;
            }

            .content-spacer {
                height: 500px;
                background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
                margin: 20px 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
        </style>
    </head>
    <body>
        <h1>Lazy Loading Images</h1>
        <p>Scroll down to see images load as they come into view.</p>

        <div class="content-spacer">Scroll down for more content</div>

        <div class="image-container">
            <img
                class="lazy-image"
                data-src="https://picsum.photos/600/300?random=1"
                alt="Random image 1"
            />
        </div>

        <div class="content-spacer">More content here</div>

        <div class="image-container">
            <img
                class="lazy-image"
                data-src="https://picsum.photos/600/300?random=2"
                alt="Random image 2"
            />
        </div>

        <div class="content-spacer">Even more content</div>

        <div class="image-container">
            <img
                class="lazy-image"
                data-src="https://picsum.photos/600/300?random=3"
                alt="Random image 3"
            />
        </div>

        <script>
            // Intersection Observer for lazy loading
            const imageObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute("data-src");
                            img.style.opacity = "1";
                            observer.unobserve(img);
                        }
                    });
                }
            );

            // Observe all lazy images
            document
                .querySelectorAll(".lazy-image[data-src]")
                .forEach((img) => {
                    imageObserver.observe(img);
                });
        </script>
    </body>
</html>
```

---

## Exercises

### Exercise 1: Interactive Dashboard

Create a dashboard using Canvas and SVG that includes:

-   Real-time data visualization
-   Interactive charts
-   Canvas-based drawing tools
-   Local storage for user preferences

### Exercise 2: Web Component Library

Build a set of reusable web components:

-   Custom button component
-   Modal dialog component
-   Progress bar component
-   Card component with various layouts

### Exercise 3: Advanced Form Builder

Create a dynamic form builder with:

-   Drag and drop form elements
-   Real-time validation
-   Local storage for form data
-   Export functionality

### Exercise 4: Media Management App

Build a media management application featuring:

-   File upload with drag and drop
-   Canvas-based image editing
-   SVG icons and graphics
-   Geolocation for photo metadata

---

## 🎯 Key Takeaways

1. **HTML5 APIs** provide powerful native functionality
2. **Canvas** is perfect for dynamic graphics and games
3. **SVG** excels at scalable vector graphics and icons
4. **Web Components** enable reusable, encapsulated UI elements
5. **Performance optimization** is crucial for user experience

---

## 🚀 Next Phase Preview

In **Phase 7: Best Practices and Performance**, you'll learn:

-   HTML validation and debugging
-   SEO optimization techniques
-   Accessibility best practices
-   Performance monitoring and optimization
-   Modern development workflows

---

## 📝 Quick Reference

### HTML5 APIs:

-   **Geolocation**: `navigator.geolocation.getCurrentPosition()`
-   **Local Storage**: `localStorage.setItem()` / `localStorage.getItem()`
-   **Drag & Drop**: `draggable="true"` + event handlers

### Canvas:

```javascript
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.fillRect(x, y, width, height);
```

### SVG:

```html
<svg width="100" height="100">
    <circle cx="50" cy="50" r="25" fill="blue" />
</svg>
```

### Web Components:

```javascript
class CustomElement extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        /* setup */
    }
}
customElements.define("custom-element", CustomElement);
```

**Ready for Phase 7?** You've mastered advanced HTML!
