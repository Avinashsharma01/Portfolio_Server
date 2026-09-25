# Tailwind CSS Complete Guide - Phase 2: Core Concepts & Layout

## Prerequisites

Complete Phase 1: Getting Started before proceeding.

---

## Layout Systems

### 1. Flexbox Layout

Flexbox is one of the most powerful layout tools in Tailwind CSS.

#### Basic Flex Container

```html
<!-- Create a flex container -->
<div class="flex">
    <div class="bg-red-500 p-4">Item 1</div>
    <div class="bg-blue-500 p-4">Item 2</div>
    <div class="bg-green-500 p-4">Item 3</div>
</div>
```

#### Flex Direction

```html
<!-- Row (default) -->
<div class="flex flex-row">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</div>

<!-- Column -->
<div class="flex flex-col">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</div>

<!-- Reverse -->
<div class="flex flex-row-reverse">
    <div>3</div>
    <div>2</div>
    <div>1</div>
</div>

<div class="flex flex-col-reverse">
    <div>3</div>
    <div>2</div>
    <div>1</div>
</div>
```

#### Justify Content (Horizontal Alignment)

```html
<!-- Start (default) -->
<div class="flex justify-start">
    <div>Item</div>
    <div>Item</div>
</div>

<!-- Center -->
<div class="flex justify-center">
    <div>Item</div>
    <div>Item</div>
</div>

<!-- End -->
<div class="flex justify-end">
    <div>Item</div>
    <div>Item</div>
</div>

<!-- Space between -->
<div class="flex justify-between">
    <div>Item</div>
    <div>Item</div>
    <div>Item</div>
</div>

<!-- Space around -->
<div class="flex justify-around">
    <div>Item</div>
    <div>Item</div>
    <div>Item</div>
</div>

<!-- Space evenly -->
<div class="flex justify-evenly">
    <div>Item</div>
    <div>Item</div>
    <div>Item</div>
</div>
```

#### Align Items (Vertical Alignment)

```html
<!-- Stretch (default) -->
<div class="flex items-stretch h-32">
    <div class="bg-red-500">Item 1</div>
    <div class="bg-blue-500">Item 2</div>
</div>

<!-- Start -->
<div class="flex items-start h-32">
    <div class="bg-red-500 h-8">Item 1</div>
    <div class="bg-blue-500 h-12">Item 2</div>
</div>

<!-- Center -->
<div class="flex items-center h-32">
    <div class="bg-red-500 h-8">Item 1</div>
    <div class="bg-blue-500 h-12">Item 2</div>
</div>

<!-- End -->
<div class="flex items-end h-32">
    <div class="bg-red-500 h-8">Item 1</div>
    <div class="bg-blue-500 h-12">Item 2</div>
</div>

<!-- Baseline -->
<div class="flex items-baseline h-32">
    <div class="bg-red-500 text-lg">Item 1</div>
    <div class="bg-blue-500 text-3xl">Item 2</div>
</div>
```

#### Flex Wrap

```html
<!-- No wrap (default) -->
<div class="flex flex-nowrap">
    <div class="w-64 bg-red-500">Wide item</div>
    <div class="w-64 bg-blue-500">Wide item</div>
    <div class="w-64 bg-green-500">Wide item</div>
</div>

<!-- Wrap -->
<div class="flex flex-wrap">
    <div class="w-64 bg-red-500">Wide item</div>
    <div class="w-64 bg-blue-500">Wide item</div>
    <div class="w-64 bg-green-500">Wide item</div>
</div>

<!-- Wrap reverse -->
<div class="flex flex-wrap-reverse">
    <div class="w-64 bg-red-500">Wide item</div>
    <div class="w-64 bg-blue-500">Wide item</div>
    <div class="w-64 bg-green-500">Wide item</div>
</div>
```

#### Flex Item Properties

```html
<div class="flex">
    <!-- Flex grow: takes up remaining space -->
    <div class="flex-1 bg-red-500">Grows</div>
    <div class="bg-blue-500">Fixed</div>

    <!-- Flex shrink: prevents shrinking -->
    <div class="flex-shrink-0 w-32 bg-green-500">No shrink</div>

    <!-- Flex none: doesn't grow or shrink -->
    <div class="flex-none w-32 bg-yellow-500">Fixed size</div>
</div>
```

#### Practical Flex Examples

**Navigation Bar:**

```html
<nav class="flex justify-between items-center bg-gray-800 text-white p-4">
    <div class="text-xl font-bold">Logo</div>
    <div class="flex space-x-6">
        <a href="#" class="hover:text-gray-300">Home</a>
        <a href="#" class="hover:text-gray-300">About</a>
        <a href="#" class="hover:text-gray-300">Services</a>
        <a href="#" class="hover:text-gray-300">Contact</a>
    </div>
    <button class="bg-blue-500 px-4 py-2 rounded">Sign In</button>
</nav>
```

**Card Layout:**

```html
<div
    class="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden"
>
    <div class="md:w-1/3">
        <img
            src="image.jpg"
            alt="Image"
            class="w-full h-48 md:h-full object-cover"
        />
    </div>
    <div class="md:w-2/3 p-6 flex flex-col justify-between">
        <div>
            <h3 class="text-xl font-bold mb-2">Card Title</h3>
            <p class="text-gray-600 mb-4">Card description goes here...</p>
        </div>
        <button class="bg-blue-500 text-white px-4 py-2 rounded self-start">
            Read More
        </button>
    </div>
</div>
```

---

### 2. CSS Grid Layout

Grid is perfect for two-dimensional layouts.

#### Basic Grid

```html
<!-- 3 equal columns -->
<div class="grid grid-cols-3 gap-4">
    <div class="bg-red-500 p-4">1</div>
    <div class="bg-blue-500 p-4">2</div>
    <div class="bg-green-500 p-4">3</div>
    <div class="bg-yellow-500 p-4">4</div>
    <div class="bg-purple-500 p-4">5</div>
    <div class="bg-pink-500 p-4">6</div>
</div>
```

#### Grid Columns

```html
<!-- Different column configurations -->
<div class="grid grid-cols-1 gap-4">1 column</div>
<div class="grid grid-cols-2 gap-4">2 columns</div>
<div class="grid grid-cols-3 gap-4">3 columns</div>
<div class="grid grid-cols-4 gap-4">4 columns</div>
<div class="grid grid-cols-6 gap-4">6 columns</div>
<div class="grid grid-cols-12 gap-4">12 columns</div>

<!-- Custom fractions -->
<div class="grid grid-cols-[200px_1fr_100px] gap-4">
    <div class="bg-red-500">200px</div>
    <div class="bg-blue-500">Flexible</div>
    <div class="bg-green-500">100px</div>
</div>
```

#### Grid Rows

```html
<!-- 3 equal rows -->
<div class="grid grid-rows-3 h-96 gap-4">
    <div class="bg-red-500">Row 1</div>
    <div class="bg-blue-500">Row 2</div>
    <div class="bg-green-500">Row 3</div>
</div>
```

#### Column and Row Spanning

```html
<div class="grid grid-cols-4 gap-4">
    <!-- Span 2 columns -->
    <div class="col-span-2 bg-red-500 p-4">Spans 2 columns</div>
    <div class="bg-blue-500 p-4">1</div>
    <div class="bg-green-500 p-4">2</div>

    <!-- Span from column 2 to 4 -->
    <div class="bg-yellow-500 p-4">1</div>
    <div class="col-span-3 bg-purple-500 p-4">Spans 3 columns</div>

    <!-- Full width -->
    <div class="col-span-full bg-pink-500 p-4">Full width</div>
</div>
```

#### Grid Gaps

```html
<!-- Different gap sizes -->
<div class="grid grid-cols-3 gap-1">Small gap</div>
<div class="grid grid-cols-3 gap-4">Medium gap</div>
<div class="grid grid-cols-3 gap-8">Large gap</div>

<!-- Different horizontal and vertical gaps -->
<div class="grid grid-cols-3 gap-x-4 gap-y-8">
    <div class="bg-red-500 p-4">1</div>
    <div class="bg-blue-500 p-4">2</div>
    <div class="bg-green-500 p-4">3</div>
    <div class="bg-yellow-500 p-4">4</div>
    <div class="bg-purple-500 p-4">5</div>
    <div class="bg-pink-500 p-4">6</div>
</div>
```

#### Practical Grid Examples

**Photo Gallery:**

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div class="bg-gray-300 aspect-square rounded-lg"></div>
    <div class="bg-gray-300 aspect-square rounded-lg"></div>
    <div class="bg-gray-300 aspect-square rounded-lg"></div>
    <div class="bg-gray-300 aspect-square rounded-lg"></div>
    <div class="bg-gray-300 aspect-square rounded-lg"></div>
    <div class="bg-gray-300 aspect-square rounded-lg"></div>
</div>
```

**Dashboard Layout:**

```html
<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- Sidebar -->
    <div class="lg:col-span-1 bg-gray-800 text-white p-6 rounded-lg">
        <h3 class="text-lg font-bold mb-4">Navigation</h3>
        <ul class="space-y-2">
            <li>
                <a href="#" class="block hover:bg-gray-700 p-2 rounded"
                    >Dashboard</a
                >
            </li>
            <li>
                <a href="#" class="block hover:bg-gray-700 p-2 rounded"
                    >Analytics</a
                >
            </li>
            <li>
                <a href="#" class="block hover:bg-gray-700 p-2 rounded"
                    >Settings</a
                >
            </li>
        </ul>
    </div>

    <!-- Main content -->
    <div class="lg:col-span-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg shadow">
                <h4 class="text-lg font-bold mb-2">Card 1</h4>
                <p class="text-gray-600">Content goes here...</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h4 class="text-lg font-bold mb-2">Card 2</h4>
                <p class="text-gray-600">Content goes here...</p>
            </div>
            <div class="md:col-span-2 bg-white p-6 rounded-lg shadow">
                <h4 class="text-lg font-bold mb-2">Wide Card</h4>
                <p class="text-gray-600">This card spans two columns...</p>
            </div>
        </div>
    </div>
</div>
```

---

### 3. Positioning

#### Static (Default)

```html
<div class="static">This is static positioning (default)</div>
```

#### Relative

```html
<div class="relative">
    <div class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded">
        Badge
    </div>
    This has relative positioning with an absolutely positioned child.
</div>
```

#### Absolute

```html
<div class="relative h-64 bg-gray-200">
    <div class="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded">
        Top Left
    </div>
    <div class="absolute top-4 right-4 bg-red-500 text-white p-2 rounded">
        Top Right
    </div>
    <div class="absolute bottom-4 left-4 bg-green-500 text-white p-2 rounded">
        Bottom Left
    </div>
    <div class="absolute bottom-4 right-4 bg-yellow-500 text-white p-2 rounded">
        Bottom Right
    </div>
    <div
        class="absolute inset-0 flex items-center justify-center bg-purple-500 bg-opacity-50 text-white"
    >
        Centered Overlay
    </div>
</div>
```

#### Fixed

```html
<!-- Fixed navigation -->
<nav class="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4">
    <div class="flex justify-between items-center">
        <div class="font-bold">Fixed Header</div>
        <div>Navigation</div>
    </div>
</nav>

<!-- Fixed button -->
<button
    class="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg"
>
    +
</button>
```

#### Sticky

```html
<div class="h-screen overflow-y-auto">
    <div class="h-64 bg-gray-200 p-4">Scroll down...</div>

    <div class="sticky top-0 bg-blue-500 text-white p-4">
        Sticky Header - I stick to the top when scrolling
    </div>

    <div class="h-96 bg-gray-100 p-4">Content below sticky header...</div>
    <div class="h-96 bg-gray-200 p-4">More content...</div>
</div>
```

#### Z-Index

```html
<div class="relative">
    <div class="absolute top-0 left-0 w-32 h-32 bg-red-500 z-10">z-10</div>
    <div class="absolute top-4 left-4 w-32 h-32 bg-blue-500 z-20">z-20</div>
    <div class="absolute top-8 left-8 w-32 h-32 bg-green-500 z-30">z-30</div>
</div>
```

---

### 4. Container and Max Width

#### Container

```html
<!-- Responsive container -->
<div class="container mx-auto px-4">
    <h1>This content is centered and responsive</h1>
    <p>The container automatically adjusts to different screen sizes.</p>
</div>
```

#### Max Width

```html
<!-- Different max widths -->
<div class="max-w-sm mx-auto bg-gray-200 p-4 mb-4">max-w-sm (24rem)</div>
<div class="max-w-md mx-auto bg-gray-200 p-4 mb-4">max-w-md (28rem)</div>
<div class="max-w-lg mx-auto bg-gray-200 p-4 mb-4">max-w-lg (32rem)</div>
<div class="max-w-xl mx-auto bg-gray-200 p-4 mb-4">max-w-xl (36rem)</div>
<div class="max-w-2xl mx-auto bg-gray-200 p-4 mb-4">max-w-2xl (42rem)</div>
<div class="max-w-4xl mx-auto bg-gray-200 p-4 mb-4">max-w-4xl (56rem)</div>
<div class="max-w-6xl mx-auto bg-gray-200 p-4 mb-4">max-w-6xl (72rem)</div>
<div class="max-w-full mx-auto bg-gray-200 p-4 mb-4">max-w-full (100%)</div>
```

---

## Responsive Design

### Breakpoints

Tailwind uses mobile-first breakpoints:

| Prefix | Min Width | CSS                          |
| ------ | --------- | ---------------------------- |
| `sm`   | 640px     | `@media (min-width: 640px)`  |
| `md`   | 768px     | `@media (min-width: 768px)`  |
| `lg`   | 1024px    | `@media (min-width: 1024px)` |
| `xl`   | 1280px    | `@media (min-width: 1280px)` |
| `2xl`  | 1536px    | `@media (min-width: 1536px)` |

### Responsive Examples

```html
<!-- Responsive text sizes -->
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
    Responsive Heading
</h1>

<!-- Responsive grid -->
<div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
>
    <div class="bg-red-500 p-4">1</div>
    <div class="bg-blue-500 p-4">2</div>
    <div class="bg-green-500 p-4">3</div>
    <div class="bg-yellow-500 p-4">4</div>
</div>

<!-- Responsive flex direction -->
<div class="flex flex-col md:flex-row gap-4">
    <div class="md:w-1/2 bg-gray-200 p-4">
        Stacked on mobile, side-by-side on medium screens and up
    </div>
    <div class="md:w-1/2 bg-gray-300 p-4">Content area</div>
</div>

<!-- Hide/show on different screens -->
<div class="block md:hidden">Visible only on mobile</div>
<div class="hidden md:block">
    Hidden on mobile, visible on medium screens and up
</div>
<div class="hidden lg:block">Visible only on large screens and up</div>
```

---

## Box Model

### Width and Height

```html
<!-- Fixed sizes -->
<div class="w-32 h-32">128px × 128px</div>
<div class="w-64 h-48">256px × 192px</div>

<!-- Percentage based -->
<div class="w-1/2 h-1/3">50% width, 33.33% height</div>
<div class="w-full h-screen">100% width, 100vh height</div>

<!-- Responsive sizes -->
<div class="w-full md:w-1/2 lg:w-1/3">
    Full width on mobile, 1/2 on medium, 1/3 on large
</div>

<!-- Min/Max sizes -->
<div class="min-w-0 max-w-lg">Flexible width with constraints</div>
<div class="min-h-screen max-h-none">At least screen height</div>
```

### Padding and Margin

```html
<!-- Uniform spacing -->
<div class="p-4 m-2">Padding 16px, margin 8px</div>

<!-- Directional spacing -->
<div class="pt-8 pr-4 pb-2 pl-6">Individual padding sides</div>
<div class="px-4 py-2">Horizontal & vertical padding</div>

<!-- Responsive spacing -->
<div class="p-2 md:p-6 lg:p-8">Responsive padding</div>

<!-- Auto margin for centering -->
<div class="w-64 mx-auto">Horizontally centered</div>

<!-- Negative margins -->
<div class="bg-gray-200 p-4">
    <div class="-m-2 bg-blue-500 p-4">Negative margin</div>
</div>
```

---

## Practice Exercises

### Exercise 1: Create a Hero Section

```html
<section class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
    <div class="container mx-auto px-4 py-16 md:py-24">
        <div class="flex flex-col md:flex-row items-center">
            <div class="md:w-1/2 mb-8 md:mb-0">
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                    Build Amazing Websites
                </h1>
                <p class="text-xl mb-8 text-blue-100">
                    Create beautiful, responsive designs with Tailwind CSS.
                </p>
                <div class="flex flex-col sm:flex-row gap-4">
                    <button
                        class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
                    >
                        Get Started
                    </button>
                    <button
                        class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
                    >
                        Learn More
                    </button>
                </div>
            </div>
            <div class="md:w-1/2">
                <div class="bg-white bg-opacity-10 p-8 rounded-lg">
                    <div
                        class="w-full h-64 bg-gradient-to-br from-white to-gray-300 rounded-lg"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</section>
```

### Exercise 2: Create a Feature Grid

```html
<section class="py-16 bg-gray-50">
    <div class="container mx-auto px-4">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Our Features
            </h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover the amazing features that make our product stand out.
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
                class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
                <div class="w-12 h-12 bg-blue-500 rounded-lg mb-6"></div>
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    Fast Performance
                </h3>
                <p class="text-gray-600">
                    Lightning-fast load times and smooth interactions.
                </p>
            </div>

            <div
                class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
                <div class="w-12 h-12 bg-green-500 rounded-lg mb-6"></div>
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    Easy to Use
                </h3>
                <p class="text-gray-600">
                    Intuitive interface designed for everyone.
                </p>
            </div>

            <div
                class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1"
            >
                <div class="w-12 h-12 bg-purple-500 rounded-lg mb-6"></div>
                <h3 class="text-xl font-bold text-gray-800 mb-4">Secure</h3>
                <p class="text-gray-600">
                    Enterprise-grade security for your peace of mind.
                </p>
            </div>
        </div>
    </div>
</section>
```

### Exercise 3: Create a Responsive Navigation

```html
<!-- You'll need JavaScript for the mobile menu toggle -->
<nav class="bg-white shadow-lg sticky top-0 z-50">
    <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">
            <!-- Logo -->
            <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-500 rounded mr-3"></div>
                <span class="text-xl font-bold text-gray-800">Brand</span>
            </div>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center space-x-8">
                <a
                    href="#"
                    class="text-gray-600 hover:text-blue-600 font-medium"
                    >Home</a
                >
                <a
                    href="#"
                    class="text-gray-600 hover:text-blue-600 font-medium"
                    >About</a
                >
                <a
                    href="#"
                    class="text-gray-600 hover:text-blue-600 font-medium"
                    >Services</a
                >
                <a
                    href="#"
                    class="text-gray-600 hover:text-blue-600 font-medium"
                    >Contact</a
                >
                <button
                    class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                    Sign Up
                </button>
            </div>

            <!-- Mobile menu button -->
            <div class="md:hidden">
                <button class="text-gray-600 hover:text-gray-800">
                    <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        ></path>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile Navigation (hidden by default) -->
        <div class="hidden md:hidden pb-4">
            <div class="flex flex-col space-y-4">
                <a
                    href="#"
                    class="text-gray-600 hover:text-blue-600 font-medium"
                    >Home</a
                >
                <a
                    href="#"
                    class="text-gray-600 hover:text-blue-600 font-medium"
                    >About</a
                >
                <a
                    href="#"
                    class="text-gray-600 hover:text-blue-600 font-medium"
                    >Services</a
                >
                <a
                    href="#"
                    class="text-gray-600 hover:text-blue-600 font-medium"
                    >Contact</a
                >
                <button
                    class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 self-start"
                >
                    Sign Up
                </button>
            </div>
        </div>
    </div>
</nav>
```

---

## Common Layout Patterns

### 1. Sidebar Layout

```html
<div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="w-64 bg-gray-800 text-white p-6">
        <h2 class="text-xl font-bold mb-6">Sidebar</h2>
        <nav class="space-y-2">
            <a href="#" class="block p-2 rounded hover:bg-gray-700">Link 1</a>
            <a href="#" class="block p-2 rounded hover:bg-gray-700">Link 2</a>
            <a href="#" class="block p-2 rounded hover:bg-gray-700">Link 3</a>
        </nav>
    </div>

    <!-- Main content -->
    <div class="flex-1 p-8 overflow-y-auto">
        <h1 class="text-2xl font-bold mb-4">Main Content</h1>
        <p class="text-gray-600">Your main content goes here...</p>
    </div>
</div>
```

### 2. Card Grid

```html
<div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6"
>
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="h-48 bg-gray-300"></div>
        <div class="p-6">
            <h3 class="text-lg font-bold mb-2">Card Title</h3>
            <p class="text-gray-600 text-sm mb-4">Card description...</p>
            <button class="bg-blue-500 text-white px-4 py-2 rounded text-sm">
                Action
            </button>
        </div>
    </div>
    <!-- Repeat card structure -->
</div>
```

---

## Next Steps

You've completed Phase 2! You should now understand:

-   ✅ Flexbox layout system
-   ✅ CSS Grid layout system
-   ✅ Positioning (relative, absolute, fixed, sticky)
-   ✅ Responsive design principles
-   ✅ Box model (width, height, padding, margin)
-   ✅ Common layout patterns

**Ready for Phase 3?** We'll cover:

-   Typography and text styling
-   Colors and backgrounds
-   Borders and shadows
-   Form styling
-   Button components

Continue to **Phase 3: Styling Components** when you're ready!
