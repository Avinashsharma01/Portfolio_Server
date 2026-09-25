# Tailwind CSS Complete Guide - Phase 5: Advanced Features & Customization

## Prerequisites

Complete Phase 1-4 before proceeding.

---

## Tailwind Configuration

### Basic Configuration File

Create or customize `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,js,ts,jsx,tsx,vue,svelte,php}",
        "./pages/**/*.{html,js,ts,jsx,tsx,vue,svelte,php}",
        "./components/**/*.{html,js,ts,jsx,tsx,vue,svelte,php}",
    ],
    darkMode: "class", // 'media' or 'class'
    theme: {
        extend: {
            // Your customizations here
        },
    },
    plugins: [],
};
```

### Extending the Theme

#### Custom Colors

```javascript
module.exports = {
    theme: {
        extend: {
            colors: {
                // Brand colors
                primary: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6", // Main brand color
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                    950: "#172554",
                },
                secondary: {
                    DEFAULT: "#6b7280",
                    light: "#9ca3af",
                    dark: "#4b5563",
                },
                // Custom color names
                "brand-blue": "#1fb6ff",
                "brand-purple": "#7e5bef",
                "brand-pink": "#ff49db",
                "brand-orange": "#ff7849",
                "brand-green": "#13ce66",
                "brand-yellow": "#ffc82c",
                "brand-gray": "#8492a6",
            },
        },
    },
};
```

#### Custom Fonts

```javascript
module.exports = {
    theme: {
        extend: {
            fontFamily: {
                // Add custom fonts
                sans: ["Inter", "ui-sans-serif", "system-ui"],
                serif: ["Georgia", "ui-serif"],
                mono: ["Fira Code", "ui-monospace"],
                display: ["Oswald", "ui-sans-serif"],
                body: ["Open Sans", "ui-sans-serif"],
            },
        },
    },
};
```

#### Custom Spacing

```javascript
module.exports = {
    theme: {
        extend: {
            spacing: {
                128: "32rem",
                144: "36rem",
                18: "4.5rem",
                88: "22rem",
            },
        },
    },
};
```

#### Custom Breakpoints

```javascript
module.exports = {
    theme: {
        screens: {
            xs: "475px",
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1536px",
            "3xl": "1920px",
        },
    },
};
```

#### Custom Animations

```javascript
module.exports = {
    theme: {
        extend: {
            animation: {
                "fade-in": "fadeIn 0.5s ease-in-out",
                "slide-in": "slideIn 0.3s ease-out",
                "bounce-slow": "bounce 2s infinite",
                wiggle: "wiggle 1s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideIn: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(0)" },
                },
                wiggle: {
                    "0%, 100%": { transform: "rotate(-3deg)" },
                    "50%": { transform: "rotate(3deg)" },
                },
            },
        },
    },
};
```

### Complete Custom Theme Example

```javascript
module.exports = {
    content: ["./src/**/*.{html,js}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    200: "#bae6fd",
                    300: "#7dd3fc",
                    400: "#38bdf8",
                    500: "#0ea5e9",
                    600: "#0284c7",
                    700: "#0369a1",
                    800: "#075985",
                    900: "#0c4a6e",
                },
                gray: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    300: "#cbd5e1",
                    400: "#94a3b8",
                    500: "#64748b",
                    600: "#475569",
                    700: "#334155",
                    800: "#1e293b",
                    900: "#0f172a",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Poppins", "system-ui", "sans-serif"],
            },
            fontSize: {
                xs: ["0.75rem", { lineHeight: "1rem" }],
                sm: ["0.875rem", { lineHeight: "1.25rem" }],
                base: ["1rem", { lineHeight: "1.5rem" }],
                lg: ["1.125rem", { lineHeight: "1.75rem" }],
                xl: ["1.25rem", { lineHeight: "1.75rem" }],
                "2xl": ["1.5rem", { lineHeight: "2rem" }],
                "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
                "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
                "5xl": ["3rem", { lineHeight: "1" }],
                "6xl": ["3.75rem", { lineHeight: "1" }],
                "7xl": ["4.5rem", { lineHeight: "1" }],
                "8xl": ["6rem", { lineHeight: "1" }],
                "9xl": ["8rem", { lineHeight: "1" }],
            },
            spacing: {
                128: "32rem",
                144: "36rem",
            },
            borderRadius: {
                "4xl": "2rem",
                "5xl": "2.5rem",
            },
            boxShadow: {
                "inner-lg": "inset 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                colored: "0 4px 14px 0 rgba(59, 130, 246, 0.3)",
            },
        },
    },
    plugins: [],
};
```

---

## Creating Custom Components

### Using @apply Directive

Create reusable component classes in your CSS:

```css
/* In your main CSS file */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
    .btn {
        @apply px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
    }

    .btn-primary {
        @apply bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500;
    }

    .btn-secondary {
        @apply bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
    }

    .btn-large {
        @apply px-6 py-3 text-lg;
    }

    .btn-small {
        @apply px-3 py-1.5 text-sm;
    }

    .card {
        @apply bg-white rounded-lg shadow-md overflow-hidden;
    }

    .card-header {
        @apply px-6 py-4 border-b border-gray-200 bg-gray-50;
    }

    .card-body {
        @apply px-6 py-4;
    }

    .card-footer {
        @apply px-6 py-4 border-t border-gray-200 bg-gray-50;
    }

    .form-input {
        @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
    }

    .form-label {
        @apply block text-sm font-medium text-gray-700 mb-1;
    }

    .form-error {
        @apply text-red-500 text-sm mt-1;
    }
}
```

### Using Component Classes

```html
<!-- Using custom button classes -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary btn-large">Large Secondary</button>
<button class="btn btn-primary btn-small">Small Primary</button>

<!-- Using custom card classes -->
<div class="card">
    <div class="card-header">
        <h3 class="text-lg font-semibold">Card Title</h3>
    </div>
    <div class="card-body">
        <p>Card content goes here...</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">Action</button>
    </div>
</div>

<!-- Using custom form classes -->
<form class="space-y-4">
    <div>
        <label class="form-label">Email</label>
        <input type="email" class="form-input" placeholder="Enter your email" />
        <p class="form-error">This field is required</p>
    </div>
</form>
```

---

## Plugin System

### Installing Official Plugins

#### Forms Plugin

```bash
npm install @tailwindcss/forms
```

```javascript
// tailwind.config.js
module.exports = {
    plugins: [require("@tailwindcss/forms")],
};
```

#### Typography Plugin

```bash
npm install @tailwindcss/typography
```

```javascript
// tailwind.config.js
module.exports = {
    plugins: [require("@tailwindcss/typography")],
};
```

```html
<!-- Use prose classes for rich text -->
<article class="prose prose-lg max-w-none">
    <h1>Article Title</h1>
    <p>Article content with proper typography...</p>
    <ul>
        <li>List item 1</li>
        <li>List item 2</li>
    </ul>
</article>
```

#### Aspect Ratio Plugin

```bash
npm install @tailwindcss/aspect-ratio
```

```javascript
// tailwind.config.js
module.exports = {
    plugins: [require("@tailwindcss/aspect-ratio")],
};
```

```html
<!-- Maintain aspect ratios -->
<div class="aspect-w-16 aspect-h-9">
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
</div>

<div class="aspect-w-1 aspect-h-1">
    <img src="square-image.jpg" alt="Square image" />
</div>
```

### Creating Custom Plugins

#### Simple Utility Plugin

```javascript
// tailwind.config.js
const plugin = require("tailwindcss/plugin");

module.exports = {
    plugins: [
        plugin(function ({ addUtilities }) {
            addUtilities({
                ".scrollbar-hide": {
                    /* IE and Edge */
                    "-ms-overflow-style": "none",
                    /* Firefox */
                    "scrollbar-width": "none",
                    /* Safari and Chrome */
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                },
                ".text-shadow": {
                    "text-shadow": "2px 2px 4px rgba(0, 0, 0, 0.1)",
                },
                ".text-shadow-md": {
                    "text-shadow": "4px 4px 8px rgba(0, 0, 0, 0.12)",
                },
                ".text-shadow-lg": {
                    "text-shadow": "8px 8px 16px rgba(0, 0, 0, 0.15)",
                },
                ".glass": {
                    background: "rgba(255, 255, 255, 0.1)",
                    "backdrop-filter": "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                },
            });
        }),
    ],
};
```

#### Component Plugin

```javascript
// tailwind.config.js
const plugin = require("tailwindcss/plugin");

module.exports = {
    plugins: [
        plugin(function ({ addComponents, theme }) {
            addComponents({
                ".btn": {
                    padding: `${theme("spacing.2")} ${theme("spacing.4")}`,
                    borderRadius: theme("borderRadius.lg"),
                    fontWeight: theme("fontWeight.medium"),
                    transition: "all 0.2s ease-in-out",
                    "&:focus": {
                        outline: "none",
                        boxShadow: `0 0 0 3px ${theme("colors.blue.200")}`,
                    },
                },
                ".btn-primary": {
                    backgroundColor: theme("colors.blue.500"),
                    color: theme("colors.white"),
                    "&:hover": {
                        backgroundColor: theme("colors.blue.600"),
                    },
                },
                ".btn-secondary": {
                    backgroundColor: theme("colors.gray.200"),
                    color: theme("colors.gray.900"),
                    "&:hover": {
                        backgroundColor: theme("colors.gray.300"),
                    },
                },
            });
        }),
    ],
};
```

#### Advanced Plugin with Variants

```javascript
// tailwind.config.js
const plugin = require("tailwindcss/plugin");

module.exports = {
    plugins: [
        plugin(function ({ addUtilities, addVariant, e, prefix, config }) {
            // Add custom variant
            addVariant("optional", "&:optional");
            addVariant("hocus", ["&:hover", "&:focus"]);

            // Add responsive variants for custom utilities
            const newUtilities = {
                ".skew-10deg": {
                    transform: "skewY(-10deg)",
                },
                ".skew-15deg": {
                    transform: "skewY(-15deg)",
                },
            };

            addUtilities(newUtilities, ["responsive", "hover"]);
        }),
    ],
};
```

---

## Advanced Theming

### CSS Custom Properties Integration

```javascript
// tailwind.config.js
module.exports = {
    theme: {
        extend: {
            colors: {
                primary: "var(--color-primary)",
                secondary: "var(--color-secondary)",
                accent: "var(--color-accent)",
            },
            spacing: {
                section: "var(--spacing-section)",
            },
        },
    },
};
```

```css
/* In your CSS */
:root {
    --color-primary: #3b82f6;
    --color-secondary: #6b7280;
    --color-accent: #f59e0b;
    --spacing-section: 4rem;
}

.theme-dark {
    --color-primary: #60a5fa;
    --color-secondary: #9ca3af;
    --color-accent: #fbbf24;
}

.theme-purple {
    --color-primary: #8b5cf6;
    --color-secondary: #6b7280;
    --color-accent: #ec4899;
}
```

### Multi-Theme System

```html
<div class="theme-selector">
    <button onclick="setTheme('light')" class="theme-btn">Light</button>
    <button onclick="setTheme('dark')" class="theme-btn">Dark</button>
    <button onclick="setTheme('purple')" class="theme-btn">Purple</button>
</div>

<script>
    function setTheme(theme) {
        document.documentElement.className = "";
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else if (theme === "purple") {
            document.documentElement.classList.add("theme-purple");
        }
        localStorage.setItem("theme", theme);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
</script>
```

---

## Advanced Patterns

### Container Queries (Experimental)

```javascript
// tailwind.config.js
module.exports = {
    plugins: [require("@tailwindcss/container-queries")],
};
```

```html
<div class="@container">
    <div class="@sm:grid-cols-2 @lg:grid-cols-3">
        <!-- Content adapts to container size, not viewport -->
    </div>
</div>
```

### Dynamic Classes with JavaScript

```html
<div id="dynamic-component" class="p-4 rounded-lg">
    <h3>Dynamic Component</h3>
    <p>Classes change based on state</p>
</div>

<script>
    function updateComponent(state) {
        const element = document.getElementById("dynamic-component");
        const baseClasses = "p-4 rounded-lg";

        let stateClasses = "";
        switch (state) {
            case "success":
                stateClasses =
                    "bg-green-100 border border-green-300 text-green-800";
                break;
            case "error":
                stateClasses = "bg-red-100 border border-red-300 text-red-800";
                break;
            case "warning":
                stateClasses =
                    "bg-yellow-100 border border-yellow-300 text-yellow-800";
                break;
            default:
                stateClasses =
                    "bg-gray-100 border border-gray-300 text-gray-800";
        }

        element.className = `${baseClasses} ${stateClasses}`;
    }

    // Usage
    updateComponent("success");
</script>
```

### CSS-in-JS Integration (React Example)

```jsx
import { clsx } from 'clsx';

const Button = ({ variant = 'primary', size = 'medium', children, ...props }) => {
    const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
        primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    };

    const sizeClasses = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2',
        large: 'px-6 py-3 text-lg',
    };

    const classes = clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size]
    );

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};

// Usage
<Button variant="primary" size="large">Click me</Button>
<Button variant="danger" size="small">Delete</Button>
```

---

## Performance and Production

### Build Optimization

```javascript
// tailwind.config.js
module.exports = {
    content: [
        "./src/**/*.{html,js,ts,jsx,tsx,vue,svelte}",
        // Be specific to avoid scanning unnecessary files
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    // Optimize for production
    corePlugins: {
        // Disable unused core plugins
        preflight: true,
        container: false, // If you don't use container
    },
};
```

### Critical CSS Extraction

```javascript
// For Next.js or similar frameworks
const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
    plugins: [
        "tailwindcss",
        process.env.NODE_ENV === "production" &&
            purgecss({
                content: [
                    "./pages/**/*.{js,ts,jsx,tsx}",
                    "./components/**/*.{js,ts,jsx,tsx}",
                ],
                defaultExtractor: (content) =>
                    content.match(/[\w-/:]+(?<!:)/g) || [],
                safelist: ["html", "body"],
            }),
        "autoprefixer",
    ].filter(Boolean),
};
```

### Bundle Size Monitoring

```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Check which Tailwind utilities are being used
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
```

---

## Best Practices

### 1. Organization

```html
<!-- Group related classes logically -->
<!-- Layout classes first, then appearance, then interactions -->
<div
    class="
    flex flex-col md:flex-row gap-4 
    bg-white rounded-lg shadow-md border border-gray-200 
    hover:shadow-lg transition-shadow
"
>
    <!-- Content -->
</div>
```

### 2. Responsive Design

```html
<!-- Mobile-first approach -->
<div
    class="
    text-sm sm:text-base md:text-lg lg:text-xl
    p-4 sm:p-6 md:p-8
    grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
"
>
    <!-- Responsive content -->
</div>
```

### 3. Component Extraction

```html
<!-- Instead of repeating classes -->
<button
    class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
>
    Button 1
</button>
<button
    class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
>
    Button 2
</button>

<!-- Extract to component class -->
<button class="btn btn-primary">Button 1</button>
<button class="btn btn-primary">Button 2</button>
```

### 4. Semantic HTML with Tailwind

```html
<!-- Maintain semantic structure -->
<article class="bg-white rounded-lg shadow-md p-6">
    <header class="mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Article Title</h1>
        <time class="text-sm text-gray-600" datetime="2024-01-15"
            >January 15, 2024</time
        >
    </header>

    <main class="prose prose-gray max-w-none">
        <p>Article content...</p>
    </main>

    <footer class="mt-6 pt-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">By John Doe</span>
            </div>
            <div class="flex space-x-2">
                <button class="btn btn-secondary btn-small">Share</button>
                <button class="btn btn-primary btn-small">Read More</button>
            </div>
        </div>
    </footer>
</article>
```

---

## Final Project: Complete E-commerce Card

```html
<div
    class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden max-w-sm mx-auto"
>
    <!-- Image Container -->
    <div
        class="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
    >
        <img
            src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop"
            alt="Wireless Headphones"
            class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
        />

        <!-- Overlay Gradient -->
        <div
            class="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>

        <!-- Badges -->
        <div class="absolute top-4 left-4 flex flex-col space-y-2">
            <span
                class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
            >
                -25%
            </span>
            <span
                class="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full"
            >
                FREE SHIPPING
            </span>
        </div>

        <!-- Quick Actions -->
        <div
            class="absolute top-4 right-4 flex flex-col space-y-2 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300 delay-75"
        >
            <button
                class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
                title="Add to Wishlist"
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
                class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
                title="Quick View"
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
            <button
                class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
                title="Compare"
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                </svg>
            </button>
        </div>

        <!-- Size Indicator -->
        <div
            class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1"
        >
            <span class="text-xs font-medium text-gray-700"
                >Available in 3 colors</span
            >
        </div>
    </div>

    <!-- Content -->
    <div class="p-6">
        <!-- Category & Brand -->
        <div class="flex items-center justify-between mb-2">
            <span
                class="text-xs font-medium text-blue-600 uppercase tracking-wide"
                >Audio</span
            >
            <span class="text-xs text-gray-500">Sony</span>
        </div>

        <!-- Product Name -->
        <h3
            class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2"
        >
            Premium Wireless Noise-Cancelling Headphones
        </h3>

        <!-- Rating -->
        <div class="flex items-center mb-3">
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
                <svg
                    class="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    ></path>
                </svg>
                <svg
                    class="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    ></path>
                </svg>
                <svg
                    class="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    ></path>
                </svg>
                <svg
                    class="w-4 h-4 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    ></path>
                </svg>
            </div>
            <span class="text-sm text-gray-600 ml-2">4.5 (128 reviews)</span>
        </div>

        <!-- Features -->
        <div class="flex flex-wrap gap-1 mb-4">
            <span
                class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >30h Battery</span
            >
            <span
                class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >ANC</span
            >
            <span
                class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >Bluetooth 5.0</span
            >
        </div>

        <!-- Price -->
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
                <span class="text-2xl font-bold text-gray-900">$199</span>
                <span class="text-lg text-gray-500 line-through">$265</span>
                <span
                    class="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium"
                    >25% OFF</span
                >
            </div>
        </div>

        <!-- Color Options -->
        <div class="flex items-center justify-between mb-6">
            <span class="text-sm font-medium text-gray-700">Color:</span>
            <div class="flex items-center space-x-2">
                <button
                    class="w-6 h-6 bg-black rounded-full border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:border-blue-500 ring-2 ring-blue-500 transition-all"
                ></button>
                <button
                    class="w-6 h-6 bg-white rounded-full border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:border-blue-500 transition-all"
                ></button>
                <button
                    class="w-6 h-6 bg-blue-500 rounded-full border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:border-blue-500 transition-all"
                ></button>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
            <button
                class="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
                Add to Cart
            </button>
            <button
                class="bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
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
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                </svg>
            </button>
        </div>

        <!-- Shipping Info -->
        <div class="mt-4 pt-4 border-t border-gray-100">
            <div class="flex items-center text-sm text-gray-600">
                <svg
                    class="w-4 h-4 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                    ></path>
                </svg>
                Free shipping on orders over $100
            </div>
            <div class="flex items-center text-sm text-gray-600 mt-1">
                <svg
                    class="w-4 h-4 mr-2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                2-year warranty included
            </div>
        </div>
    </div>

    <!-- Hover Effect Overlay -->
    <div
        class="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    ></div>
</div>
```

---

## Congratulations! 🎉

You've completed the comprehensive Tailwind CSS guide! You now have expertise in:

### ✅ Phase 1: Getting Started

-   Installation and setup
-   Basic utility classes
-   Color and spacing systems

### ✅ Phase 2: Core Concepts & Layout

-   Flexbox and CSS Grid
-   Positioning and responsive design
-   Container and layout patterns

### ✅ Phase 3: Styling Components

-   Typography and colors
-   Borders, shadows, and effects
-   Form styling and buttons

### ✅ Phase 4: Responsive Design & Utilities

-   Advanced responsive patterns
-   Interactive states and animations
-   Dark mode and complex utilities

### ✅ Phase 5: Advanced Features & Customization

-   Custom configuration and theming
-   Plugin system and custom components
-   Production optimization and best practices

## What's Next?

1. **Practice Building Real Projects**: Create a portfolio website, dashboard, or e-commerce site
2. **Explore Framework Integration**: Learn how to use Tailwind with React, Vue, or your preferred framework
3. **Join the Community**: Follow [@tailwindcss](https://twitter.com/tailwindcss) and join discussions
4. **Stay Updated**: Keep up with new features and updates in the official documentation
5. **Build Your Own Design System**: Create a custom design system using Tailwind as the foundation

## Additional Resources

-   **Official Documentation**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
-   **Tailwind UI**: [tailwindui.com](https://tailwindui.com) (Premium components)
-   **Headless UI**: [headlessui.com](https://headlessui.com) (Unstyled components)
-   **Heroicons**: [heroicons.com](https://heroicons.com) (Beautiful SVG icons)
-   **Tailwind Play**: [play.tailwindcss.com](https://play.tailwindcss.com) (Online playground)

Happy coding with Tailwind CSS! 🚀
