# Tailwind CSS Complete Guide - Phase 4: Responsive Design & Utilities

## Prerequisites

Complete Phase 1-3 before proceeding.

---

## Advanced Responsive Design

### Mobile-First Approach

Tailwind uses a mobile-first breakpoint system. Classes apply from mobile up to the specified breakpoint.

```html
<!-- This text is small on mobile, medium on tablet, large on desktop -->
<h1 class="text-lg md:text-2xl lg:text-4xl">Responsive Heading</h1>

<!-- This div is full width on mobile, half width on tablet and up -->
<div class="w-full md:w-1/2">Responsive width</div>

<!-- Hidden on mobile, visible on tablet and up -->
<div class="hidden md:block">Desktop navigation</div>

<!-- Visible on mobile only -->
<div class="block md:hidden">Mobile menu button</div>
```

### Breakpoint Reference

| Breakpoint | Min Width | Example Usage    |
| ---------- | --------- | ---------------- |
| `sm`       | 640px     | `sm:text-lg`     |
| `md`       | 768px     | `md:flex`        |
| `lg`       | 1024px    | `lg:grid-cols-3` |
| `xl`       | 1280px    | `xl:max-w-6xl`   |
| `2xl`      | 1536px    | `2xl:text-8xl`   |

### Responsive Layout Examples

**Responsive Navigation:**

```html
<nav class="bg-white shadow-lg">
    <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <div class="flex-shrink-0">
                <img class="h-8 w-auto" src="logo.svg" alt="Logo" />
            </div>

            <!-- Desktop Navigation -->
            <div class="hidden md:block">
                <div class="ml-10 flex items-baseline space-x-4">
                    <a
                        href="#"
                        class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >Home</a
                    >
                    <a
                        href="#"
                        class="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >About</a
                    >
                    <a
                        href="#"
                        class="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >Services</a
                    >
                    <a
                        href="#"
                        class="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >Contact</a
                    >
                </div>
            </div>

            <!-- Mobile menu button -->
            <div class="md:hidden">
                <button
                    class="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                >
                    <svg
                        class="h-6 w-6"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div class="md:hidden">
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <a
                    href="#"
                    class="text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                    >Home</a
                >
                <a
                    href="#"
                    class="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                    >About</a
                >
                <a
                    href="#"
                    class="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                    >Services</a
                >
                <a
                    href="#"
                    class="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                    >Contact</a
                >
            </div>
        </div>
    </div>
</nav>
```

**Responsive Grid Layout:**

```html
<!-- Articles Grid -->
<div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
>
    <article class="bg-white rounded-lg shadow-md overflow-hidden">
        <img
            src="article1.jpg"
            alt="Article"
            class="w-full h-48 object-cover"
        />
        <div class="p-4 lg:p-6">
            <h3 class="text-lg lg:text-xl font-bold mb-2">Article Title</h3>
            <p class="text-gray-600 text-sm lg:text-base">Article excerpt...</p>
        </div>
    </article>
    <!-- Repeat for more articles -->
</div>
```

**Responsive Hero Section:**

```html
<section class="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
    <div class="container mx-auto px-4 py-12 md:py-20 lg:py-32">
        <div class="flex flex-col lg:flex-row items-center">
            <!-- Content -->
            <div
                class="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0 text-center lg:text-left"
            >
                <h1
                    class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6"
                >
                    Build Amazing Websites
                </h1>
                <p
                    class="text-lg md:text-xl lg:text-2xl mb-6 lg:mb-8 text-blue-100"
                >
                    Create beautiful, responsive designs with our powerful tools
                    and components.
                </p>
                <div
                    class="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
                >
                    <button
                        class="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                    >
                        Get Started
                    </button>
                    <button
                        class="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-colors"
                    >
                        Learn More
                    </button>
                </div>
            </div>

            <!-- Image/Visual -->
            <div class="lg:w-1/2">
                <div class="relative">
                    <img
                        src="hero-image.jpg"
                        alt="Hero"
                        class="w-full max-w-md mx-auto lg:max-w-none rounded-lg shadow-2xl"
                    />
                </div>
            </div>
        </div>
    </div>
</section>
```

---

## Interactive States

### Hover States

```html
<div class="space-y-4">
    <!-- Hover background color -->
    <button
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
    >
        Hover me
    </button>

    <!-- Hover text color -->
    <a href="#" class="text-blue-500 hover:text-blue-700 hover:underline">
        Hover link
    </a>

    <!-- Hover scale -->
    <div
        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
    >
        <h3 class="text-lg font-bold">Hover to scale</h3>
    </div>

    <!-- Hover border -->
    <div
        class="border-2 border-gray-300 hover:border-blue-500 p-4 rounded-lg transition-colors"
    >
        Hover border effect
    </div>

    <!-- Complex hover effects -->
    <div
        class="group bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg text-white cursor-pointer overflow-hidden relative"
    >
        <div
            class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"
        ></div>
        <h3 class="text-lg font-bold mb-2 relative z-10">Group hover effect</h3>
        <p class="relative z-10">The overlay appears on hover</p>
    </div>
</div>
```

### Focus States

```html
<div class="space-y-4 max-w-md">
    <!-- Input focus -->
    <input
        type="text"
        placeholder="Focus me"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />

    <!-- Button focus -->
    <button
        class="bg-blue-500 text-white px-6 py-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:ring-opacity-75"
    >
        Focus me with Tab
    </button>

    <!-- Custom focus outline -->
    <a
        href="#"
        class="inline-block bg-green-500 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
    >
        Custom focus ring
    </a>
</div>
```

### Active States

```html
<div class="flex space-x-4">
    <button
        class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
    >
        Click me
    </button>

    <button
        class="bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700 px-6 py-2 rounded-lg transition-colors"
    >
        Press and hold
    </button>
</div>
```

### Disabled States

```html
<div class="space-y-4">
    <button
        class="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled
    >
        Disabled button
    </button>

    <input
        type="text"
        placeholder="Disabled input"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
        disabled
    />

    <div
        class="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg opacity-60 cursor-not-allowed"
    >
        Disabled div
    </div>
</div>
```

### Group Hover Effects

```html
<div
    class="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer"
>
    <div class="flex items-center mb-4">
        <div
            class="w-12 h-12 bg-blue-500 group-hover:bg-blue-600 rounded-lg mr-4 transition-colors"
        ></div>
        <h3
            class="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors"
        >
            Hover the card
        </h3>
    </div>
    <p class="text-gray-600">
        Multiple elements change when you hover this card.
    </p>
    <div
        class="mt-4 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all"
    >
        <button class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
            Hidden button appears
        </button>
    </div>
</div>
```

---

## Transitions and Animations

### Basic Transitions

```html
<div class="space-y-4">
    <!-- Default transition -->
    <button
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
    >
        Default transition
    </button>

    <!-- Custom duration -->
    <button
        class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-300"
    >
        300ms transition
    </button>

    <!-- Specific properties -->
    <button
        class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
    >
        Color transition only
    </button>

    <!-- Multiple properties -->
    <button
        class="bg-red-500 hover:bg-red-600 hover:scale-105 text-white px-6 py-2 rounded-lg transition-all duration-300"
    >
        Multiple transitions
    </button>
</div>
```

### Transform Transitions

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Scale on hover -->
    <div
        class="bg-white p-6 rounded-lg shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer"
    >
        <h3 class="text-lg font-bold mb-2">Scale Effect</h3>
        <p class="text-gray-600">Hover to scale up</p>
    </div>

    <!-- Rotate on hover -->
    <div
        class="bg-white p-6 rounded-lg shadow-md hover:rotate-3 transition-transform duration-300 cursor-pointer"
    >
        <h3 class="text-lg font-bold mb-2">Rotate Effect</h3>
        <p class="text-gray-600">Hover to rotate</p>
    </div>

    <!-- Translate on hover -->
    <div
        class="bg-white p-6 rounded-lg shadow-md hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
    >
        <h3 class="text-lg font-bold mb-2">Lift Effect</h3>
        <p class="text-gray-600">Hover to lift up</p>
    </div>
</div>
```

### Easing Functions

```html
<div class="space-y-4">
    <button
        class="bg-blue-500 hover:bg-blue-600 hover:scale-110 text-white px-6 py-2 rounded-lg transition-all duration-300 ease-linear"
    >
        Linear easing
    </button>

    <button
        class="bg-green-500 hover:bg-green-600 hover:scale-110 text-white px-6 py-2 rounded-lg transition-all duration-300 ease-in"
    >
        Ease in
    </button>

    <button
        class="bg-purple-500 hover:bg-purple-600 hover:scale-110 text-white px-6 py-2 rounded-lg transition-all duration-300 ease-out"
    >
        Ease out
    </button>

    <button
        class="bg-red-500 hover:bg-red-600 hover:scale-110 text-white px-6 py-2 rounded-lg transition-all duration-300 ease-in-out"
    >
        Ease in-out
    </button>
</div>
```

### CSS Animations

```html
<div class="space-y-8">
    <!-- Spin animation -->
    <div class="flex items-center space-x-4">
        <div class="w-8 h-8 bg-blue-500 rounded-full animate-spin"></div>
        <span>Spinning loader</span>
    </div>

    <!-- Ping animation -->
    <div class="flex items-center space-x-4">
        <div class="relative">
            <div class="w-4 h-4 bg-green-500 rounded-full"></div>
            <div
                class="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping"
            ></div>
        </div>
        <span>Notification indicator</span>
    </div>

    <!-- Pulse animation -->
    <div class="flex items-center space-x-4">
        <div class="w-8 h-8 bg-purple-500 rounded-full animate-pulse"></div>
        <span>Pulsing element</span>
    </div>

    <!-- Bounce animation -->
    <div class="flex items-center space-x-4">
        <div class="w-8 h-8 bg-red-500 rounded-full animate-bounce"></div>
        <span>Bouncing ball</span>
    </div>
</div>
```

### Loading States

```html
<div class="space-y-6">
    <!-- Loading button -->
    <button
        class="bg-blue-500 text-white px-6 py-2 rounded-lg opacity-75 cursor-not-allowed flex items-center"
        disabled
    >
        <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
            ></circle>
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
        Loading...
    </button>

    <!-- Skeleton loading -->
    <div class="bg-white p-6 rounded-lg shadow">
        <div class="animate-pulse">
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div class="flex-1">
                    <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div class="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
            </div>
            <div class="space-y-2">
                <div class="h-3 bg-gray-300 rounded w-full"></div>
                <div class="h-3 bg-gray-300 rounded w-5/6"></div>
                <div class="h-3 bg-gray-300 rounded w-4/5"></div>
            </div>
        </div>
    </div>
</div>
```

---

## Dark Mode

### Dark Mode Classes

```html
<!-- Toggle between light and dark -->
<div
    class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-lg"
>
    <h2 class="text-2xl font-bold mb-4">Dark Mode Example</h2>
    <p class="text-gray-600 dark:text-gray-300 mb-4">
        This content adapts to light and dark modes.
    </p>
    <button
        class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
    >
        Button
    </button>
</div>
```

### Setting Up Dark Mode

Add to your `tailwind.config.js`:

```javascript
module.exports = {
    darkMode: "class", // or 'media' for system preference
    // ... rest of config
};
```

Add dark mode toggle to your HTML:

```html
<button
    onclick="toggleDarkMode()"
    class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg"
>
    Toggle Dark Mode
</button>

<script>
    function toggleDarkMode() {
        document.documentElement.classList.toggle("dark");
    }

    // Check for saved theme preference or prefer-scheme
    const darkMode =
        localStorage.getItem("darkMode") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light");

    if (darkMode === "dark") {
        document.documentElement.classList.add("dark");
    }
</script>
```

### Dark Mode Examples

**Card Component:**

```html
<div
    class="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
>
    <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Dark Mode Card
    </h3>
    <p class="text-gray-600 dark:text-gray-300 mb-4">
        This card looks great in both light and dark modes.
    </p>
    <button
        class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
    >
        Action Button
    </button>
</div>
```

**Navigation:**

```html
<nav
    class="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700"
>
    <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
            <div class="text-xl font-bold text-gray-900 dark:text-gray-100">
                Brand
            </div>
            <div class="flex space-x-4">
                <a
                    href="#"
                    class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    Home
                </a>
                <a
                    href="#"
                    class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    About
                </a>
                <a
                    href="#"
                    class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    Contact
                </a>
            </div>
        </div>
    </div>
</nav>
```

---

## Advanced Utility Combinations

### Combining Multiple States

```html
<!-- Complex button with multiple states -->
<button
    class="
    bg-blue-500 hover:bg-blue-600 active:bg-blue-700 
    focus:outline-none focus:ring-4 focus:ring-blue-200 
    disabled:opacity-50 disabled:cursor-not-allowed
    dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-300
    text-white font-medium px-6 py-3 rounded-lg
    transition-all duration-200 ease-in-out
    transform hover:scale-105 active:scale-95
"
>
    Advanced Button
</button>
```

### Responsive State Combinations

```html
<!-- Different hover effects at different screen sizes -->
<div
    class="
    bg-white hover:bg-gray-50 
    md:hover:bg-blue-50 md:hover:border-blue-300
    lg:hover:shadow-lg lg:hover:scale-105
    p-6 rounded-lg border border-gray-200
    transition-all duration-300
    cursor-pointer
"
>
    <h3 class="text-lg font-bold mb-2">Responsive Interactions</h3>
    <p class="text-gray-600">
        Different hover effects on different screen sizes
    </p>
</div>
```

### Complex Layouts with States

```html
<div
    class="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-shadow"
>
    <!-- Image with overlay -->
    <div class="relative">
        <img src="image.jpg" alt="Product" class="w-full h-64 object-cover" />
        <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"
        ></div>

        <!-- Overlay content -->
        <div
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
            <button
                class="bg-white text-gray-800 px-4 py-2 rounded-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            >
                Quick View
            </button>
        </div>
    </div>

    <!-- Content -->
    <div class="p-6">
        <h3
            class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors"
        >
            Product Name
        </h3>
        <p class="text-gray-600 mt-1">Product description</p>
        <div class="mt-4 flex items-center justify-between">
            <span class="text-2xl font-bold text-gray-900">$99</span>
            <button
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
                Add to Cart
            </button>
        </div>
    </div>
</div>
```

---

## Performance Optimizations

### Purging Unused CSS

Tailwind automatically removes unused styles in production. Configure in `tailwind.config.js`:

```javascript
module.exports = {
    content: [
        "./src/**/*.{html,js,jsx,ts,tsx,vue,svelte}",
        "./pages/**/*.{html,js,jsx,ts,tsx,vue,svelte}",
        "./components/**/*.{html,js,jsx,ts,tsx,vue,svelte}",
    ],
    // ... rest of config
};
```

### JIT (Just-In-Time) Mode

JIT mode generates styles on-demand (enabled by default in Tailwind v3+):

```javascript
module.exports = {
    mode: "jit", // Not needed in v3+
    // ... rest of config
};
```

### Custom Values

Use arbitrary values for one-off designs:

```html
<!-- Arbitrary values -->
<div class="bg-[#1da1f2] text-[14px] p-[17px]">Custom values</div>

<!-- Arbitrary properties -->
<div class="[mask-type:luminance] [tab-size:4]">Arbitrary CSS properties</div>

<!-- Complex arbitrary values -->
<div class="bg-[url('/hero-pattern.svg')] bg-[length:200px_100px]">
    Custom background
</div>
```

---

## Practice Exercises

### Exercise 1: Responsive Dashboard

```html
<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Header -->
    <header
        class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
        <div class="px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <h1
                    class="text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                    Dashboard
                </h1>
                <button
                    class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-sm"
                >
                    Toggle Dark Mode
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div
                class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Total Users
                        </p>
                        <p
                            class="text-2xl font-bold text-gray-900 dark:text-gray-100"
                        >
                            1,234
                        </p>
                    </div>
                    <div class="w-8 h-8 bg-blue-500 rounded-lg"></div>
                </div>
            </div>

            <div
                class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Revenue
                        </p>
                        <p
                            class="text-2xl font-bold text-gray-900 dark:text-gray-100"
                        >
                            $12,345
                        </p>
                    </div>
                    <div class="w-8 h-8 bg-green-500 rounded-lg"></div>
                </div>
            </div>

            <div
                class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Orders
                        </p>
                        <p
                            class="text-2xl font-bold text-gray-900 dark:text-gray-100"
                        >
                            567
                        </p>
                    </div>
                    <div class="w-8 h-8 bg-yellow-500 rounded-lg"></div>
                </div>
            </div>

            <div
                class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Growth
                        </p>
                        <p
                            class="text-2xl font-bold text-gray-900 dark:text-gray-100"
                        >
                            23%
                        </p>
                    </div>
                    <div class="w-8 h-8 bg-purple-500 rounded-lg"></div>
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3
                    class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
                >
                    Sales Chart
                </h3>
                <div
                    class="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center"
                >
                    <span class="text-gray-500 dark:text-gray-400"
                        >Chart placeholder</span
                    >
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3
                    class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
                >
                    User Activity
                </h3>
                <div
                    class="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center"
                >
                    <span class="text-gray-500 dark:text-gray-400"
                        >Chart placeholder</span
                    >
                </div>
            </div>
        </div>
    </main>
</div>
```

### Exercise 2: Animated Product Card

```html
<div
    class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden max-w-sm mx-auto"
>
    <!-- Image Section -->
    <div class="relative overflow-hidden">
        <img
            src="product-image.jpg"
            alt="Product"
            class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
        />

        <!-- Gradient Overlay -->
        <div
            class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>

        <!-- Quick Actions -->
        <div
            class="absolute top-4 right-4 space-y-2 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"
        >
            <button
                class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
            >
                <svg
                    class="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                </svg>
            </button>
            <button
                class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
            >
                <svg
                    class="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                </svg>
            </button>
        </div>

        <!-- Sale Badge -->
        <div
            class="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
        >
            -20%
        </div>
    </div>

    <!-- Content Section -->
    <div class="p-6">
        <div class="flex items-start justify-between mb-2">
            <h3
                class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors"
            >
                Premium Headphones
            </h3>
            <div class="flex items-center">
                <svg
                    class="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    ></path>
                </svg>
                <span class="text-sm text-gray-600 ml-1">4.8</span>
            </div>
        </div>

        <p class="text-gray-600 text-sm mb-4 line-clamp-2">
            High-quality wireless headphones with noise cancellation and premium
            sound quality.
        </p>

        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
                <span class="text-2xl font-bold text-gray-900">$199</span>
                <span class="text-lg text-gray-500 line-through">$249</span>
            </div>
            <div class="flex items-center space-x-1">
                <span
                    class="w-4 h-4 bg-black rounded-full border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                ></span>
                <span
                    class="w-4 h-4 bg-white rounded-full border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                ></span>
                <span
                    class="w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                ></span>
            </div>
        </div>

        <!-- Add to Cart Button -->
        <button
            class="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
            Add to Cart
        </button>
    </div>

    <!-- Hover Effect Overlay -->
    <div
        class="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    ></div>
</div>
```

---

## Next Steps

You've completed Phase 4! You should now understand:

-   ✅ Advanced responsive design patterns
-   ✅ Interactive states (hover, focus, active, disabled)
-   ✅ Transitions and animations
-   ✅ Dark mode implementation
-   ✅ Complex utility combinations
-   ✅ Performance optimizations

**Ready for Phase 5?** We'll cover:

-   Customizing Tailwind configuration
-   Creating custom components
-   Plugin system and extensions
-   Advanced theming
-   Best practices and production tips

Continue to **Phase 5: Advanced Features & Customization** when you're ready!
