# Tailwind CSS Complete Guide - Phase 1: Getting Started

## Table of Contents - Complete Course

-   **Phase 1: Getting Started** (Current)
-   Phase 2: Core Concepts & Layout
-   Phase 3: Styling Components
-   Phase 4: Responsive Design & Utilities
-   Phase 5: Advanced Features & Customization

---

## What is Tailwind CSS?

Tailwind CSS is a utility-first CSS framework that works by scanning all of your HTML files, JavaScript components, and any other templates for class names, generating the corresponding styles and then writing them to a static CSS file.

**Key Benefits:**

-   ⚡ Fast development with utility classes
-   🎨 Consistent design system
-   📦 Small bundle size (only includes used classes)
-   🔧 Highly customizable
-   📱 Mobile-first responsive design
-   🚀 Zero runtime overhead

---

## Installation Methods

### Method 1: Using Vite (Recommended)

#### Step 1: Create Your Project

```bash
npm create vite@latest my-tailwind-project
cd my-tailwind-project
```

#### Step 2: Install Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

#### Step 3: Configure Vite Plugin

Create or update `vite.config.js`:

```javascript
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [tailwindcss()],
});
```

#### Step 4: Import Tailwind CSS

Add to your main CSS file (e.g., `src/style.css`):

```css
@import "tailwindcss";
```

#### Step 5: Start Development Server

```bash
npm run dev
```

### Method 2: Using PostCSS

#### Step 1: Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### Step 2: Configure Template Paths

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
        extend: {},
    },
    plugins: [],
};
```

#### Step 3: Add Tailwind Directives

Add to your main CSS file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Method 3: Tailwind CLI

#### Step 1: Install Tailwind CSS

```bash
npm install -D tailwindcss
npx tailwindcss init
```

#### Step 2: Configure Template Paths

Same as Method 2.

#### Step 3: Start Build Process

```bash
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
```

### Method 4: Play CDN (For Testing Only)

Add to your HTML `<head>`:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

⚠️ **Note:** Don't use CDN in production as it includes the entire framework.

---

## Your First Tailwind CSS Page

Create an `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My First Tailwind Page</title>
        <link href="/src/style.css" rel="stylesheet" />
    </head>
    <body>
        <!-- Container with padding and background -->
        <div class="bg-gray-100 min-h-screen p-8">
            <!-- Main heading -->
            <h1 class="text-4xl font-bold text-center text-blue-600 mb-8">
                Welcome to Tailwind CSS!
            </h1>

            <!-- Card component -->
            <div
                class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden"
            >
                <div class="p-6">
                    <h2 class="text-xl font-semibold text-gray-800 mb-2">
                        Getting Started
                    </h2>
                    <p class="text-gray-600 text-sm mb-4">
                        This is your first Tailwind CSS component. Notice how
                        we're using utility classes to style everything.
                    </p>
                    <button
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Learn More
                    </button>
                </div>
            </div>

            <!-- Features grid -->
            <div
                class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-bold text-purple-600 mb-2">
                        Utility-First
                    </h3>
                    <p class="text-gray-600 text-sm">
                        Build complex components from a constrained set of
                        primitive utilities.
                    </p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-bold text-green-600 mb-2">
                        Responsive
                    </h3>
                    <p class="text-gray-600 text-sm">
                        Every utility class can be applied at different
                        breakpoints.
                    </p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-bold text-red-600 mb-2">
                        Customizable
                    </h3>
                    <p class="text-gray-600 text-sm">
                        Customize your design system with your own design
                        tokens.
                    </p>
                </div>
            </div>
        </div>
    </body>
</html>
```

---

## Understanding Utility Classes

Tailwind's utility classes follow a predictable pattern:

### Class Structure

```
{property}-{value}
{property}-{modifier}-{value}
{responsive-prefix}:{property}-{value}
```

### Basic Examples:

#### Text Styling

```html
<!-- Font size -->
<p class="text-xs">Extra small text</p>
<p class="text-sm">Small text</p>
<p class="text-base">Base text</p>
<p class="text-lg">Large text</p>
<p class="text-xl">Extra large text</p>
<p class="text-2xl">2x large text</p>

<!-- Font weight -->
<p class="font-thin">Thin text</p>
<p class="font-normal">Normal text</p>
<p class="font-bold">Bold text</p>

<!-- Text color -->
<p class="text-red-500">Red text</p>
<p class="text-blue-600">Blue text</p>
<p class="text-gray-800">Dark gray text</p>
```

#### Spacing (Padding & Margin)

```html
<!-- Padding -->
<div class="p-4">Padding on all sides</div>
<div class="px-4 py-2">Horizontal & vertical padding</div>
<div class="pt-4 pr-2 pb-4 pl-2">Individual sides</div>

<!-- Margin -->
<div class="m-4">Margin on all sides</div>
<div class="mx-auto">Centered with auto horizontal margin</div>
<div class="mt-8 mb-4">Top and bottom margin</div>
```

#### Background Colors

```html
<div class="bg-red-500">Red background</div>
<div class="bg-blue-100">Light blue background</div>
<div class="bg-gray-900">Dark gray background</div>
```

#### Width and Height

```html
<div class="w-32 h-32">Fixed width & height</div>
<div class="w-full h-screen">Full width & screen height</div>
<div class="w-1/2 h-64">Half width, fixed height</div>
```

---

## Color System

Tailwind includes a comprehensive color palette with shades from 50 (lightest) to 950 (darkest):

### Gray Scale

```html
<div class="bg-gray-50">Very light gray</div>
<div class="bg-gray-100">Light gray</div>
<div class="bg-gray-200">Lighter gray</div>
<div class="bg-gray-300">Light gray</div>
<div class="bg-gray-400">Medium light gray</div>
<div class="bg-gray-500">Medium gray</div>
<div class="bg-gray-600">Medium dark gray</div>
<div class="bg-gray-700">Dark gray</div>
<div class="bg-gray-800">Darker gray</div>
<div class="bg-gray-900">Very dark gray</div>
<div class="bg-gray-950">Darkest gray</div>
```

### Primary Colors

Each color comes in the same shade range (50-950):

-   `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`

```html
<!-- Examples with blue -->
<div class="bg-blue-50 text-blue-900">
    Light blue background, dark blue text
</div>
<div class="bg-blue-500 text-white">Medium blue background, white text</div>
<div class="bg-blue-900 text-blue-100">
    Dark blue background, light blue text
</div>
```

---

## Spacing Scale

Tailwind uses a consistent spacing scale based on `0.25rem` (4px) increments:

| Class  | Value     | Pixels  |
| ------ | --------- | ------- |
| `p-0`  | `0`       | `0px`   |
| `p-1`  | `0.25rem` | `4px`   |
| `p-2`  | `0.5rem`  | `8px`   |
| `p-3`  | `0.75rem` | `12px`  |
| `p-4`  | `1rem`    | `16px`  |
| `p-5`  | `1.25rem` | `20px`  |
| `p-6`  | `1.5rem`  | `24px`  |
| `p-8`  | `2rem`    | `32px`  |
| `p-10` | `2.5rem`  | `40px`  |
| `p-12` | `3rem`    | `48px`  |
| `p-16` | `4rem`    | `64px`  |
| `p-20` | `5rem`    | `80px`  |
| `p-24` | `6rem`    | `96px`  |
| `p-32` | `8rem`    | `128px` |

---

## Practice Exercises

### Exercise 1: Create a Simple Card

```html
<div class="bg-white rounded-lg shadow-md p-6 max-w-sm">
    <h3 class="text-xl font-bold text-gray-800 mb-2">Card Title</h3>
    <p class="text-gray-600 mb-4">This is a simple card description.</p>
    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Action
    </button>
</div>
```

### Exercise 2: Create a Navigation Bar

```html
<nav class="bg-gray-800 text-white p-4">
    <div class="flex justify-between items-center">
        <div class="text-xl font-bold">Brand</div>
        <div class="space-x-4">
            <a href="#" class="hover:text-gray-300">Home</a>
            <a href="#" class="hover:text-gray-300">About</a>
            <a href="#" class="hover:text-gray-300">Contact</a>
        </div>
    </div>
</nav>
```

### Exercise 3: Create a Profile Card

```html
<div class="bg-white rounded-lg shadow-lg p-6 max-w-md">
    <div class="flex items-center mb-4">
        <div class="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
        <div>
            <h3 class="text-lg font-bold text-gray-800">John Doe</h3>
            <p class="text-gray-600">Web Developer</p>
        </div>
    </div>
    <p class="text-gray-600 text-sm mb-4">
        Passionate developer with 5 years of experience in web technologies.
    </p>
    <div class="flex space-x-2">
        <button class="bg-blue-500 text-white px-4 py-2 rounded text-sm flex-1">
            Follow
        </button>
        <button
            class="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm flex-1"
        >
            Message
        </button>
    </div>
</div>
```

---

## Common Gotchas for Beginners

1. **Class Order Doesn't Matter**: Unlike CSS, Tailwind class order in HTML doesn't affect specificity.

2. **Mobile-First**: Responsive prefixes apply from that breakpoint and up.

    ```html
    <!-- This text is small on mobile, large on medium screens and up -->
    <p class="text-sm md:text-lg">Responsive text</p>
    ```

3. **Hover States**: Use the `hover:` prefix for hover effects.

    ```html
    <button class="bg-blue-500 hover:bg-blue-700">Hover me</button>
    ```

4. **Focus States**: Use the `focus:` prefix for focus effects.
    ```html
    <input class="border focus:border-blue-500 focus:outline-none" />
    ```

---

## Next Steps

You've completed Phase 1! You should now understand:

-   ✅ How to install and set up Tailwind CSS
-   ✅ Basic utility class patterns
-   ✅ Color and spacing systems
-   ✅ How to create simple components

**Ready for Phase 2?** We'll cover:

-   Layout systems (Flexbox, Grid, Positioning)
-   Container and responsive design
-   Typography and spacing in depth
-   Box model utilities

---

## Quick Reference

### Most Common Classes

```html
<!-- Layout -->
<div class="flex justify-center items-center">
    <div class="grid grid-cols-3 gap-4">
        <div class="absolute top-0 right-0">
            <!-- Sizing -->
            <div class="w-full h-screen">
                <div class="max-w-md mx-auto">
                    <!-- Colors -->
                    <div class="bg-blue-500 text-white">
                        <div class="border border-gray-300">
                            <!-- Spacing -->
                            <div class="p-4 m-2">
                                <div class="px-6 py-3">
                                    <!-- Typography -->
                                    <h1 class="text-2xl font-bold">
                                        <p class="text-gray-600 text-sm"></p>
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

Continue to **Phase 2: Core Concepts & Layout** when you're ready!
