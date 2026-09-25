# Tailwind CSS Complete Guide - Phase 3: Styling Components

## Prerequisites

Complete Phase 1 (Getting Started) and Phase 2 (Core Concepts & Layout) before proceeding.

---

## Typography

### Font Families

```html
<!-- Font families -->
<p class="font-sans">Sans-serif font (default)</p>
<p class="font-serif">Serif font</p>
<p class="font-mono">Monospace font</p>

<!-- Custom font example -->
<p class="font-['Helvetica_Neue']">Custom font</p>
```

### Font Sizes

```html
<!-- Font sizes from xs to 9xl -->
<p class="text-xs">Extra small text (12px)</p>
<p class="text-sm">Small text (14px)</p>
<p class="text-base">Base text (16px)</p>
<p class="text-lg">Large text (18px)</p>
<p class="text-xl">Extra large text (20px)</p>
<p class="text-2xl">2x large text (24px)</p>
<p class="text-3xl">3x large text (30px)</p>
<p class="text-4xl">4x large text (36px)</p>
<p class="text-5xl">5x large text (48px)</p>
<p class="text-6xl">6x large text (60px)</p>
<p class="text-7xl">7x large text (72px)</p>
<p class="text-8xl">8x large text (96px)</p>
<p class="text-9xl">9x large text (128px)</p>
```

### Font Weight

```html
<p class="font-thin">Thin (100)</p>
<p class="font-extralight">Extra Light (200)</p>
<p class="font-light">Light (300)</p>
<p class="font-normal">Normal (400)</p>
<p class="font-medium">Medium (500)</p>
<p class="font-semibold">Semi Bold (600)</p>
<p class="font-bold">Bold (700)</p>
<p class="font-extrabold">Extra Bold (800)</p>
<p class="font-black">Black (900)</p>
```

### Text Decoration

```html
<p class="underline">Underlined text</p>
<p class="overline">Overlined text</p>
<p class="line-through">Strikethrough text</p>
<p class="no-underline">No decoration</p>

<!-- Decoration styles -->
<p class="underline decoration-solid">Solid underline</p>
<p class="underline decoration-double">Double underline</p>
<p class="underline decoration-dotted">Dotted underline</p>
<p class="underline decoration-dashed">Dashed underline</p>
<p class="underline decoration-wavy">Wavy underline</p>

<!-- Decoration colors -->
<p class="underline decoration-red-500">Red underline</p>
<p class="underline decoration-blue-500">Blue underline</p>

<!-- Decoration thickness -->
<p class="underline decoration-1">Thin underline</p>
<p class="underline decoration-2">Medium underline</p>
<p class="underline decoration-4">Thick underline</p>
```

### Text Alignment

```html
<p class="text-left">Left aligned text</p>
<p class="text-center">Center aligned text</p>
<p class="text-right">Right aligned text</p>
<p class="text-justify">
    Justified text that spreads across the full width of the container, making
    each line the same length.
</p>
```

### Text Transform

```html
<p class="uppercase">UPPERCASE TEXT</p>
<p class="lowercase">lowercase text</p>
<p class="capitalize">Capitalize Each Word</p>
<p class="normal-case">Normal case text</p>
```

### Line Height

```html
<p class="leading-none">Tight line height</p>
<p class="leading-tight">Tight line height</p>
<p class="leading-snug">Snug line height</p>
<p class="leading-normal">Normal line height</p>
<p class="leading-relaxed">Relaxed line height</p>
<p class="leading-loose">Loose line height</p>

<!-- Numeric line heights -->
<p class="leading-3">Line height 0.75rem</p>
<p class="leading-6">Line height 1.5rem</p>
<p class="leading-10">Line height 2.5rem</p>
```

### Letter Spacing

```html
<p class="tracking-tighter">Tighter letter spacing</p>
<p class="tracking-tight">Tight letter spacing</p>
<p class="tracking-normal">Normal letter spacing</p>
<p class="tracking-wide">Wide letter spacing</p>
<p class="tracking-wider">Wider letter spacing</p>
<p class="tracking-widest">Widest letter spacing</p>
```

### Text Color

```html
<!-- Basic colors -->
<p class="text-black">Black text</p>
<p class="text-white">White text</p>
<p class="text-gray-500">Gray text</p>
<p class="text-red-500">Red text</p>
<p class="text-blue-500">Blue text</p>
<p class="text-green-500">Green text</p>

<!-- Color variations -->
<p class="text-blue-100">Very light blue</p>
<p class="text-blue-300">Light blue</p>
<p class="text-blue-500">Medium blue</p>
<p class="text-blue-700">Dark blue</p>
<p class="text-blue-900">Very dark blue</p>

<!-- Opacity -->
<p class="text-blue-500 text-opacity-25">25% opacity</p>
<p class="text-blue-500 text-opacity-50">50% opacity</p>
<p class="text-blue-500 text-opacity-75">75% opacity</p>
```

### Text Overflow

```html
<!-- Truncate with ellipsis -->
<div class="w-64">
    <p class="truncate">
        This is a very long text that will be truncated with an ellipsis when it
        overflows
    </p>
</div>

<!-- Text wrapping -->
<div class="w-32">
    <p class="text-wrap">This text will wrap normally</p>
    <p class="text-nowrap">This text will not wrap</p>
    <p class="break-words">ThisIsAVeryLongWordThatWillBreak</p>
    <p class="break-all">ThisTextWillBreakAtAnyCharacter</p>
</div>
```

### Typography Examples

**Article Heading:**

```html
<article class="max-w-4xl mx-auto px-6 py-12">
    <header class="mb-8">
        <h1
            class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4"
        >
            The Complete Guide to Modern Web Development
        </h1>
        <p class="text-xl text-gray-600 leading-relaxed">
            Learn the essential skills and technologies needed to become a
            successful web developer in today's digital landscape.
        </p>
        <div class="flex items-center text-sm text-gray-500 mt-6">
            <span>Published on January 15, 2024</span>
            <span class="mx-2">•</span>
            <span>10 min read</span>
        </div>
    </header>

    <div class="prose prose-lg max-w-none">
        <p class="text-gray-700 leading-relaxed mb-6">
            Web development has evolved dramatically over the past decade. What
            once required extensive knowledge of multiple programming languages
            and frameworks can now be accomplished with modern tools and
            methodologies.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Getting Started
        </h2>

        <p class="text-gray-700 leading-relaxed mb-6">
            The journey begins with understanding the fundamentals...
        </p>
    </div>
</article>
```

---

## Colors and Backgrounds

### Background Colors

```html
<!-- Solid backgrounds -->
<div class="bg-red-500 p-4">Red background</div>
<div class="bg-blue-100 p-4">Light blue background</div>
<div class="bg-gray-900 p-4 text-white">Dark gray background</div>

<!-- Transparent backgrounds -->
<div class="bg-red-500 bg-opacity-25 p-4">25% opacity red</div>
<div class="bg-blue-500 bg-opacity-50 p-4">50% opacity blue</div>
<div class="bg-green-500 bg-opacity-75 p-4">75% opacity green</div>
```

### Gradient Backgrounds

```html
<!-- Linear gradients -->
<div class="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
    Left to right gradient
</div>

<div class="bg-gradient-to-b from-green-400 to-blue-500 p-8 text-white">
    Top to bottom gradient
</div>

<div
    class="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-8 text-white"
>
    Diagonal gradient with three colors
</div>

<!-- Gradient directions -->
<div class="bg-gradient-to-t">To top</div>
<div class="bg-gradient-to-tr">To top right</div>
<div class="bg-gradient-to-r">To right</div>
<div class="bg-gradient-to-br">To bottom right</div>
<div class="bg-gradient-to-b">To bottom</div>
<div class="bg-gradient-to-bl">To bottom left</div>
<div class="bg-gradient-to-l">To left</div>
<div class="bg-gradient-to-tl">To top left</div>
```

### Background Images

```html
<!-- Background size -->
<div class="bg-cover bg-center h-64" style="background-image: url('image.jpg')">
    Background cover
</div>

<div
    class="bg-contain bg-center bg-no-repeat h-64"
    style="background-image: url('image.jpg')"
>
    Background contain
</div>

<!-- Background position -->
<div class="bg-top">Background positioned at top</div>
<div class="bg-center">Background positioned at center</div>
<div class="bg-bottom">Background positioned at bottom</div>

<!-- Background repeat -->
<div class="bg-repeat">Background repeats</div>
<div class="bg-no-repeat">Background doesn't repeat</div>
<div class="bg-repeat-x">Background repeats horizontally</div>
<div class="bg-repeat-y">Background repeats vertically</div>
```

### Background Examples

**Hero Section with Gradient:**

```html
<section
    class="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white"
>
    <div class="absolute inset-0 bg-black bg-opacity-20"></div>
    <div class="relative container mx-auto px-6 py-24">
        <div class="text-center">
            <h1 class="text-5xl md:text-6xl font-bold mb-6">
                Beautiful Gradients
            </h1>
            <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Create stunning visual effects with Tailwind's gradient
                utilities
            </p>
            <button
                class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
                Get Started
            </button>
        </div>
    </div>
</section>
```

---

## Borders and Outlines

### Border Width

```html
<div class="border p-4 mb-4">Default border</div>
<div class="border-0 p-4 mb-4">No border</div>
<div class="border-2 p-4 mb-4">2px border</div>
<div class="border-4 p-4 mb-4">4px border</div>
<div class="border-8 p-4 mb-4">8px border</div>

<!-- Individual sides -->
<div class="border-t-4 p-4 mb-4">Top border</div>
<div class="border-r-4 p-4 mb-4">Right border</div>
<div class="border-b-4 p-4 mb-4">Bottom border</div>
<div class="border-l-4 p-4 mb-4">Left border</div>

<!-- Horizontal and vertical -->
<div class="border-x-4 p-4 mb-4">Horizontal borders</div>
<div class="border-y-4 p-4 mb-4">Vertical borders</div>
```

### Border Colors

```html
<div class="border-2 border-red-500 p-4 mb-4">Red border</div>
<div class="border-2 border-blue-500 p-4 mb-4">Blue border</div>
<div class="border-2 border-green-500 p-4 mb-4">Green border</div>
<div class="border-2 border-gray-300 p-4 mb-4">Gray border</div>

<!-- Border opacity -->
<div class="border-2 border-red-500 border-opacity-25 p-4 mb-4">
    25% opacity
</div>
<div class="border-2 border-red-500 border-opacity-50 p-4 mb-4">
    50% opacity
</div>
<div class="border-2 border-red-500 border-opacity-75 p-4 mb-4">
    75% opacity
</div>
```

### Border Styles

```html
<div class="border-2 border-solid border-gray-400 p-4 mb-4">Solid border</div>
<div class="border-2 border-dashed border-gray-400 p-4 mb-4">Dashed border</div>
<div class="border-2 border-dotted border-gray-400 p-4 mb-4">Dotted border</div>
<div class="border-2 border-double border-gray-400 p-4 mb-4">Double border</div>
```

### Border Radius

```html
<div class="bg-blue-500 text-white p-4 mb-4">No rounded corners</div>
<div class="bg-blue-500 text-white p-4 mb-4 rounded-sm">
    Small rounded corners
</div>
<div class="bg-blue-500 text-white p-4 mb-4 rounded">
    Default rounded corners
</div>
<div class="bg-blue-500 text-white p-4 mb-4 rounded-md">
    Medium rounded corners
</div>
<div class="bg-blue-500 text-white p-4 mb-4 rounded-lg">
    Large rounded corners
</div>
<div class="bg-blue-500 text-white p-4 mb-4 rounded-xl">
    Extra large rounded corners
</div>
<div class="bg-blue-500 text-white p-4 mb-4 rounded-2xl">
    2xl rounded corners
</div>
<div class="bg-blue-500 text-white p-4 mb-4 rounded-3xl">
    3xl rounded corners
</div>
<div class="bg-blue-500 text-white p-4 mb-4 rounded-full">Fully rounded</div>

<!-- Individual corners -->
<div class="bg-green-500 text-white p-4 mb-4 rounded-tl-lg">
    Top-left rounded
</div>
<div class="bg-green-500 text-white p-4 mb-4 rounded-tr-lg">
    Top-right rounded
</div>
<div class="bg-green-500 text-white p-4 mb-4 rounded-bl-lg">
    Bottom-left rounded
</div>
<div class="bg-green-500 text-white p-4 mb-4 rounded-br-lg">
    Bottom-right rounded
</div>

<!-- Sides -->
<div class="bg-purple-500 text-white p-4 mb-4 rounded-t-lg">Top rounded</div>
<div class="bg-purple-500 text-white p-4 mb-4 rounded-r-lg">Right rounded</div>
<div class="bg-purple-500 text-white p-4 mb-4 rounded-b-lg">Bottom rounded</div>
<div class="bg-purple-500 text-white p-4 mb-4 rounded-l-lg">Left rounded</div>
```

### Outlines

```html
<div class="outline outline-2 outline-blue-500 p-4 mb-4">Blue outline</div>
<div class="outline outline-dashed outline-2 outline-red-500 p-4 mb-4">
    Dashed outline
</div>
<div class="outline outline-dotted outline-2 outline-green-500 p-4 mb-4">
    Dotted outline
</div>

<!-- Outline offset -->
<div class="outline outline-2 outline-blue-500 outline-offset-2 p-4 mb-4">
    Offset outline
</div>
<div class="outline outline-2 outline-red-500 outline-offset-4 p-4 mb-4">
    Larger offset
</div>
```

---

## Shadows and Effects

### Box Shadows

```html
<div class="shadow-sm bg-white p-6 mb-4">Small shadow</div>
<div class="shadow bg-white p-6 mb-4">Default shadow</div>
<div class="shadow-md bg-white p-6 mb-4">Medium shadow</div>
<div class="shadow-lg bg-white p-6 mb-4">Large shadow</div>
<div class="shadow-xl bg-white p-6 mb-4">Extra large shadow</div>
<div class="shadow-2xl bg-white p-6 mb-4">2xl shadow</div>

<!-- Inner shadow -->
<div class="shadow-inner bg-gray-200 p-6 mb-4">Inner shadow</div>

<!-- No shadow -->
<div class="shadow-none bg-gray-200 border p-6 mb-4">No shadow</div>

<!-- Colored shadows -->
<div class="shadow-lg shadow-blue-500/50 bg-white p-6 mb-4">
    Blue colored shadow
</div>
<div class="shadow-lg shadow-red-500/50 bg-white p-6 mb-4">
    Red colored shadow
</div>
```

### Drop Shadows

```html
<div class="drop-shadow-sm bg-white p-4 mb-4">Small drop shadow</div>
<div class="drop-shadow bg-white p-4 mb-4">Default drop shadow</div>
<div class="drop-shadow-md bg-white p-4 mb-4">Medium drop shadow</div>
<div class="drop-shadow-lg bg-white p-4 mb-4">Large drop shadow</div>
<div class="drop-shadow-xl bg-white p-4 mb-4">Extra large drop shadow</div>
<div class="drop-shadow-2xl bg-white p-4 mb-4">2xl drop shadow</div>
<div class="drop-shadow-none bg-white p-4 mb-4">No drop shadow</div>
```

### Text Shadows

```html
<h1 class="text-4xl font-bold text-white drop-shadow-lg">
    Text with drop shadow
</h1>
<h1 class="text-4xl font-bold text-gray-800 drop-shadow-sm">
    Subtle text shadow
</h1>
```

---

## Form Styling

### Input Fields

```html
<div class="space-y-4 max-w-md">
    <!-- Basic input -->
    <input
        type="text"
        placeholder="Enter your name"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    />

    <!-- Input with icon -->
    <div class="relative">
        <input
            type="email"
            placeholder="Enter your email"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
            <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
            </svg>
        </div>
    </div>

    <!-- Error state -->
    <input
        type="text"
        placeholder="This field has an error"
        class="w-full px-4 py-2 border border-red-500 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50"
    />
    <p class="text-red-500 text-sm">This field is required</p>

    <!-- Success state -->
    <input
        type="text"
        placeholder="This field is valid"
        class="w-full px-4 py-2 border border-green-500 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-green-50"
    />
    <p class="text-green-500 text-sm">Looks good!</p>
</div>
```

### Textarea

```html
<textarea
    placeholder="Enter your message"
    rows="4"
    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
></textarea>
```

### Select Dropdown

```html
<select
    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
>
    <option>Choose an option</option>
    <option>Option 1</option>
    <option>Option 2</option>
    <option>Option 3</option>
</select>
```

### Checkboxes and Radio Buttons

```html
<div class="space-y-4">
    <!-- Checkboxes -->
    <div class="flex items-center">
        <input
            type="checkbox"
            id="checkbox1"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label for="checkbox1" class="ml-2 text-sm text-gray-700">
            I agree to the terms and conditions
        </label>
    </div>

    <!-- Radio buttons -->
    <div class="space-y-2">
        <div class="flex items-center">
            <input
                type="radio"
                id="radio1"
                name="radio-group"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
            />
            <label for="radio1" class="ml-2 text-sm text-gray-700"
                >Option 1</label
            >
        </div>
        <div class="flex items-center">
            <input
                type="radio"
                id="radio2"
                name="radio-group"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
            />
            <label for="radio2" class="ml-2 text-sm text-gray-700"
                >Option 2</label
            >
        </div>
    </div>
</div>
```

### Form Layout Example

```html
<form class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
        Contact Us
    </h2>

    <div class="space-y-4">
        <div>
            <label
                for="name"
                class="block text-sm font-medium text-gray-700 mb-1"
            >
                Full Name
            </label>
            <input
                type="text"
                id="name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="John Doe"
            />
        </div>

        <div>
            <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-1"
            >
                Email Address
            </label>
            <input
                type="email"
                id="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="john@example.com"
            />
        </div>

        <div>
            <label
                for="subject"
                class="block text-sm font-medium text-gray-700 mb-1"
            >
                Subject
            </label>
            <select
                id="subject"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
            >
                <option>General Inquiry</option>
                <option>Support</option>
                <option>Feedback</option>
                <option>Other</option>
            </select>
        </div>

        <div>
            <label
                for="message"
                class="block text-sm font-medium text-gray-700 mb-1"
            >
                Message
            </label>
            <textarea
                id="message"
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                placeholder="Your message here..."
            ></textarea>
        </div>

        <div class="flex items-center">
            <input
                type="checkbox"
                id="newsletter"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="newsletter" class="ml-2 text-sm text-gray-700">
                Subscribe to our newsletter
            </label>
        </div>

        <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium transition-colors"
        >
            Send Message
        </button>
    </div>
</form>
```

---

## Button Components

### Basic Buttons

```html
<div class="flex flex-wrap gap-4">
    <!-- Solid buttons -->
    <button
        class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
    >
        Primary
    </button>

    <button
        class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
    >
        Secondary
    </button>

    <button
        class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
    >
        Success
    </button>

    <button
        class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
    >
        Danger
    </button>
</div>
```

### Outline Buttons

```html
<div class="flex flex-wrap gap-4">
    <button
        class="border-2 border-blue-500 text-blue-500 px-6 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
    >
        Primary Outline
    </button>

    <button
        class="border-2 border-gray-500 text-gray-500 px-6 py-2 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"
    >
        Secondary Outline
    </button>

    <button
        class="border-2 border-green-500 text-green-500 px-6 py-2 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
    >
        Success Outline
    </button>
</div>
```

### Button Sizes

```html
<div class="flex flex-wrap items-center gap-4">
    <button
        class="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600"
    >
        Extra Small
    </button>

    <button
        class="bg-blue-500 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-600"
    >
        Small
    </button>

    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Medium
    </button>

    <button
        class="bg-blue-500 text-white px-6 py-3 text-lg rounded hover:bg-blue-600"
    >
        Large
    </button>

    <button
        class="bg-blue-500 text-white px-8 py-4 text-xl rounded hover:bg-blue-600"
    >
        Extra Large
    </button>
</div>
```

### Button States

```html
<div class="flex flex-wrap gap-4">
    <!-- Normal -->
    <button
        class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
    >
        Normal
    </button>

    <!-- Hover (use :hover in CSS) -->
    <button class="bg-blue-600 text-white px-6 py-2 rounded-lg">Hovered</button>

    <!-- Focused -->
    <button
        class="bg-blue-500 text-white px-6 py-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
    >
        Focused
    </button>

    <!-- Active -->
    <button class="bg-blue-700 text-white px-6 py-2 rounded-lg">Active</button>

    <!-- Disabled -->
    <button
        class="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg cursor-not-allowed"
        disabled
    >
        Disabled
    </button>

    <!-- Loading -->
    <button
        class="bg-blue-500 text-white px-6 py-2 rounded-lg opacity-75 cursor-not-allowed"
        disabled
    >
        <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
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
</div>
```

### Button Groups

```html
<div class="inline-flex rounded-lg overflow-hidden border border-gray-300">
    <button
        class="bg-white text-gray-700 px-4 py-2 hover:bg-gray-50 border-r border-gray-300"
    >
        Left
    </button>
    <button
        class="bg-white text-gray-700 px-4 py-2 hover:bg-gray-50 border-r border-gray-300"
    >
        Middle
    </button>
    <button class="bg-white text-gray-700 px-4 py-2 hover:bg-gray-50">
        Right
    </button>
</div>
```

### Icon Buttons

```html
<div class="flex flex-wrap gap-4">
    <!-- Button with icon and text -->
    <button
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
    >
        <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
        </svg>
        Add Item
    </button>

    <!-- Icon only button -->
    <button class="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300">
        <svg
            class="w-5 h-5"
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

    <!-- Circular icon button -->
    <button
        class="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg"
    >
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
                d="M6 18L18 6M6 6l12 12"
            ></path>
        </svg>
    </button>
</div>
```

---

## Practice Exercises

### Exercise 1: Create a Pricing Card

```html
<div class="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
    <div
        class="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-8"
    >
        <h3 class="text-2xl font-bold mb-2">Pro Plan</h3>
        <div class="text-4xl font-bold mb-1">
            $29
            <span class="text-lg font-normal opacity-75">/month</span>
        </div>
        <p class="text-blue-100">Perfect for professionals</p>
    </div>

    <div class="p-8">
        <ul class="space-y-4 mb-8">
            <li class="flex items-center text-gray-700">
                <svg
                    class="w-5 h-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                    ></path>
                </svg>
                Unlimited projects
            </li>
            <li class="flex items-center text-gray-700">
                <svg
                    class="w-5 h-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                    ></path>
                </svg>
                Priority support
            </li>
            <li class="flex items-center text-gray-700">
                <svg
                    class="w-5 h-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                    ></path>
                </svg>
                Advanced analytics
            </li>
            <li class="flex items-center text-gray-700">
                <svg
                    class="w-5 h-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                    ></path>
                </svg>
                Custom integrations
            </li>
        </ul>

        <button
            class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
            Choose Pro Plan
        </button>
    </div>
</div>
```

### Exercise 2: Create a Newsletter Signup

```html
<div
    class="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 rounded-2xl text-white max-w-md mx-auto"
>
    <div class="text-center mb-6">
        <h3 class="text-2xl font-bold mb-2">Stay Updated</h3>
        <p class="text-indigo-100">
            Get the latest news and updates delivered to your inbox.
        </p>
    </div>

    <form class="space-y-4">
        <div>
            <input
                type="email"
                placeholder="Enter your email"
                class="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-indigo-200 focus:outline-none focus:bg-opacity-30 focus:border-opacity-50"
            />
        </div>

        <button
            type="submit"
            class="w-full bg-white text-indigo-600 font-bold py-3 px-6 rounded-lg hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-30"
        >
            Subscribe Now
        </button>
    </form>

    <p class="text-xs text-indigo-200 text-center mt-4">
        We respect your privacy. Unsubscribe at any time.
    </p>
</div>
```

### Exercise 3: Create a Profile Card

```html
<div class="max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
    <div class="relative">
        <div class="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        <div class="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div
                class="w-24 h-24 bg-gray-300 rounded-full border-4 border-white shadow-lg"
            ></div>
        </div>
    </div>

    <div class="pt-16 pb-8 px-8 text-center">
        <h3 class="text-xl font-bold text-gray-800 mb-1">Sarah Johnson</h3>
        <p class="text-gray-600 mb-4">UX Designer</p>

        <p class="text-gray-700 text-sm mb-6 leading-relaxed">
            Passionate about creating beautiful and functional user experiences.
            Love working with modern design tools and technologies.
        </p>

        <div class="flex justify-center space-x-4 mb-6">
            <div class="text-center">
                <div class="text-xl font-bold text-gray-800">127</div>
                <div class="text-xs text-gray-600 uppercase tracking-wide">
                    Projects
                </div>
            </div>
            <div class="text-center">
                <div class="text-xl font-bold text-gray-800">89</div>
                <div class="text-xs text-gray-600 uppercase tracking-wide">
                    Clients
                </div>
            </div>
            <div class="text-center">
                <div class="text-xl font-bold text-gray-800">5</div>
                <div class="text-xs text-gray-600 uppercase tracking-wide">
                    Years
                </div>
            </div>
        </div>

        <div class="flex space-x-3">
            <button
                class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
                Follow
            </button>
            <button
                class="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
                Message
            </button>
        </div>
    </div>
</div>
```

---

## Next Steps

You've completed Phase 3! You should now understand:

-   ✅ Typography (fonts, sizes, weights, spacing)
-   ✅ Colors and background systems
-   ✅ Borders, outlines, and rounded corners
-   ✅ Shadows and visual effects
-   ✅ Form styling and validation states
-   ✅ Button components and variations

**Ready for Phase 4?** We'll cover:

-   Responsive design patterns
-   Hover, focus, and active states
-   Transitions and animations
-   Dark mode and theming
-   Advanced utility combinations

Continue to **Phase 4: Responsive Design & Utilities** when you're ready!
