# Phase 09 — Build Tools & Module Bundlers

## Table of Contents

- [Why Build Tools Exist](#why-build-tools-exist)
- [Package Managers — npm, pnpm, yarn](#package-managers--npm-pnpm-yarn)
- [package.json Deep Dive](#packagejson-deep-dive)
- [What is Bundling?](#what-is-bundling)
- [Vite — The Modern Build Tool](#vite--the-modern-build-tool)
- [Webpack — The Established Bundler](#webpack--the-established-bundler)
- [Transpilation — Babel & SWC](#transpilation--babel--swc)
- [Linting with ESLint](#linting-with-eslint)
- [Code Formatting with Prettier](#code-formatting-with-prettier)
- [Environment Variables](#environment-variables)
- [Key Takeaways](#key-takeaways)

---

## Why Build Tools Exist

Modern browsers can run JavaScript, but not everything developers write:

```
WHAT DEVELOPERS WRITE:              WHAT BROWSERS NEED:
├── JSX (React syntax)               ├── Plain JavaScript
├── TypeScript                       ├── Plain JavaScript
├── SCSS / Sass / PostCSS            ├── Plain CSS
├── ES Modules (import/export)       ├── Bundled files (fewer requests)
├── Modern syntax (ES2024)           ├── Compatible syntax (older browsers)
├── Hundreds of files                ├── A few optimized files
└── Development code                 └── Minified production code

BUILD TOOL = The translator between developers and browsers
```

### What Build Tools Do

| Task | What It Does | Tool |
|------|-------------|------|
| **Bundling** | Combines many files into few | Vite, Webpack, Rollup |
| **Transpilation** | Converts modern JS to compatible JS | Babel, SWC |
| **Minification** | Removes whitespace, shortens variables | Terser, esbuild |
| **CSS Processing** | SCSS → CSS, autoprefixer, CSS Modules | PostCSS, Sass |
| **Dev Server** | Hot reload, instant preview | Vite, webpack-dev-server |
| **Tree Shaking** | Removes unused code | Rollup, Webpack, Vite |
| **Code Splitting** | Lazy loads code on demand | Webpack, Vite |
| **Asset Handling** | Optimizes images, fonts, SVGs | Vite, Webpack loaders |

---

## Package Managers — npm, pnpm, yarn

### npm (Node Package Manager)

npm comes with Node.js — it's the default.

```bash
# Initialize a project
npm init -y

# Install a dependency
npm install react react-dom

# Install a dev dependency
npm install --save-dev typescript eslint

# Install globally
npm install -g create-react-app

# Remove a package
npm uninstall lodash

# Run a script
npm run build
npm run dev
```

### pnpm (Performant npm)

pnpm is **faster** and uses **less disk space** by sharing packages across projects.

```bash
# Install pnpm
npm install -g pnpm

# Same commands, just replace npm with pnpm
pnpm install react react-dom
pnpm add -D typescript
pnpm run dev
```

### npm vs pnpm vs yarn

| Feature | npm | pnpm | yarn |
|---------|-----|------|------|
| **Speed** | Moderate | Fastest | Fast |
| **Disk space** | Copies to each project | Symlinks (shared store) | Copies to each project |
| **Lock file** | `package-lock.json` | `pnpm-lock.yaml` | `yarn.lock` |
| **Workspaces** | ✅ | ✅ (best) | ✅ |
| **Default** | Comes with Node.js | Install separately | Install separately |

> **Recommendation:** Use **pnpm** for new projects. It's faster and saves disk space.

---

## package.json Deep Dive

```json
{
    "name": "my-app",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "lint": "eslint src/",
        "format": "prettier --write src/"
    },
    "dependencies": {
        "react": "^18.3.0",
        "react-dom": "^18.3.0",
        "react-router-dom": "^6.20.0"
    },
    "devDependencies": {
        "@types/react": "^18.3.0",
        "eslint": "^9.0.0",
        "prettier": "^3.2.0",
        "typescript": "^5.4.0",
        "vite": "^5.4.0"
    }
}
```

### Dependencies vs DevDependencies

```
dependencies (npm install react):
├── Needed at RUNTIME (in the user's browser)
├── React, React Router, Axios, date-fns
└── Shipped in the final bundle

devDependencies (npm install -D eslint):
├── Needed only during DEVELOPMENT
├── ESLint, Prettier, TypeScript, Vite, Testing libraries
└── NOT included in the production bundle
```

### Version Numbers (Semver)

```
"react": "^18.3.1"
          │  │  │
          │  │  └── PATCH: Bug fixes (safe to update)
          │  └───── MINOR: New features, backward compatible
          └──────── MAJOR: Breaking changes

^ (caret):  Allows minor + patch updates  →  ^18.3.1 = any 18.x.x
~ (tilde):  Allows only patch updates     →  ~18.3.1 = any 18.3.x
exact:      No auto updates               →  18.3.1  = only 18.3.1
```

---

## What is Bundling?

Bundling combines all your JavaScript (and CSS, images, etc.) into a few optimized files:

```
WITHOUT BUNDLING:
Browser must download 200+ files
├── src/index.js
├── src/App.js
├── src/components/Header.js
├── src/components/Footer.js
├── src/utils/api.js
├── node_modules/react/index.js    ← 1000s of files!
├── node_modules/react-dom/...
└── ... 200 HTTP requests = SLOW

WITH BUNDLING:
Browser downloads 2-3 files
├── index-a7f3k2.js    (your code + react + react-dom, minified)
├── styles-x8b2m1.css  (all CSS combined, minified)
└── done!              2 HTTP requests = FAST
```

### What Happens During a Build

```
Source Files → Build Tool → Optimized Output

1. RESOLVE imports (find all dependencies)
2. BUNDLE files together (combine into chunks)
3. TRANSPILE modern syntax (TypeScript → JS, JSX → JS)
4. TREE SHAKE (remove unused exports)
5. MINIFY (remove whitespace, shorten names)
6. SPLIT CODE (separate vendor code, lazy routes)
7. HASH filenames (index-a7f3k2.js for cache busting)
8. OUTPUT to dist/ folder
```

---

## Vite — The Modern Build Tool

Vite (French for "fast") is the **recommended build tool** for new projects. It's extremely fast because it uses native ES modules in development.

### Creating a Vite Project

```bash
# Create a new React project with Vite
npm create vite@latest my-app -- --template react

# TypeScript variant
npm create vite@latest my-app -- --template react-ts

# Navigate and install
cd my-app
npm install
npm run dev
```

### Project Structure

```
my-app/
├── public/              ← Static assets (copied as-is)
│   └── favicon.ico
├── src/
│   ├── App.jsx          ← Root component
│   ├── App.css
│   ├── main.jsx         ← Entry point
│   └── index.css
├── index.html           ← THE entry HTML file
├── package.json
└── vite.config.js       ← Vite configuration
```

### Why Vite is Fast

```
WEBPACK (Traditional):
1. Bundle ALL files before starting dev server
2. Change one file → rebuild entire bundle
3. Startup: 10-30 seconds
4. HMR: 1-5 seconds

VITE (Modern):
1. Start dev server IMMEDIATELY (no bundling)
2. Uses native ES modules — browser loads files on demand
3. Startup: < 500ms
4. HMR: < 50ms (instant)

HOW:
Dev:   Vite serves native ES modules (no bundling needed)
Build: Vite uses Rollup for production (optimized bundle)
```

### vite.config.js

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,  // auto-open browser
        proxy: {
            // Proxy API requests to backend
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: "dist",
        sourcemap: true
    },
    resolve: {
        alias: {
            "@": "/src"  // import from "@/components/Button"
        }
    }
});
```

### Hot Module Replacement (HMR)

Vite updates components in the browser **without losing state**:

```
You edit Button.jsx:
1. Vite detects the change
2. Sends ONLY the changed module to the browser
3. React re-renders the Button component
4. State is preserved (form inputs, scroll position, etc.)
5. Total time: ~50ms

vs. Full page reload:
1. Rebuild entire bundle
2. Browser reloads page
3. ALL state is lost
4. Total time: seconds
```

---

## Webpack — The Established Bundler

Webpack is the most widely used bundler. Many existing projects use it, so understanding it is valuable.

### Core Concepts

```
ENTRY:   Where webpack starts (src/index.js)
OUTPUT:  Where bundles go (dist/bundle.js)
LOADERS: Transform non-JS files (CSS, images, TypeScript)
PLUGINS: Additional processing (HTML generation, minification)
```

### Basic webpack.config.js

```javascript
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].[contenthash].js",
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                type: "asset/resource"
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        })
    ],
    devServer: {
        port: 3000,
        hot: true,
        open: true
    }
};
```

### Vite vs Webpack

| Feature | Vite | Webpack |
|---------|------|---------|
| **Dev startup** | Instant (~500ms) | Slow (10-30s) |
| **HMR speed** | ~50ms | 1-5s |
| **Config** | Minimal | Verbose |
| **Learning curve** | Low | High |
| **Ecosystem** | Growing | Massive |
| **Production** | Rollup (under the hood) | Webpack |
| **Use for** | New projects | Legacy/enterprise projects |

> **For new projects, use Vite.** Learn Webpack concepts for maintaining existing projects.

---

## Transpilation — Babel & SWC

### What is Transpilation?

```
Transpilation = Translating modern code to compatible code

YOUR CODE:                          TRANSPILED CODE:
const greet = (name) => {           var greet = function(name) {
    return `Hello, ${name}!`;           return "Hello, " + name + "!";
};                                  };

JSX:                                TRANSPILED:
<Button onClick={handle}>          React.createElement(Button,
  Click                              { onClick: handle },
</Button>                            "Click"
                                   )
```

### Babel

Babel was the standard JavaScript transpiler for years:

```bash
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react
```

```json
// babel.config.json
{
    "presets": [
        ["@babel/preset-env", { "targets": "> 0.5%, not dead" }],
        ["@babel/preset-react", { "runtime": "automatic" }]
    ]
}
```

### SWC (Speedy Web Compiler)

SWC is a **Rust-based** transpiler — 20-70x faster than Babel. Vite uses SWC by default.

```
BABEL:  Written in JavaScript  → ~200ms per file
SWC:    Written in Rust        → ~10ms per file
```

> **Vite uses SWC under the hood.** You don't need to configure Babel separately.

---

## Linting with ESLint

ESLint finds **code quality issues** and **potential bugs** before they reach production.

### Setup

```bash
npm install --save-dev eslint @eslint/js
npm init @eslint/config
```

### ESLint Configuration (eslint.config.js — Flat Config)

```javascript
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
    js.configs.recommended,
    {
        files: ["**/*.{js,jsx}"],
        plugins: {
            react,
            "react-hooks": reactHooks
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "warn",
            "react/prop-types": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn"
        }
    }
];
```

### What ESLint Catches

```javascript
// ❌ Unused variable
const unused = 42;  // ESLint: 'unused' is assigned but never used

// ❌ Accidental assignment in condition
if (x = 5) { }     // ESLint: Expected '===' but saw '='

// ❌ Missing dependency in useEffect
useEffect(() => {
    fetchUser(userId);
}, []);  // ESLint: 'userId' missing from dependency array

// ❌ Conditional hook
if (condition) {
    useState(0);    // ESLint: Hooks must be called unconditionally
}
```

---

## Code Formatting with Prettier

Prettier enforces **consistent code style** automatically — no more debates about tabs vs spaces.

### Setup

```bash
npm install --save-dev prettier
```

### .prettierrc

```json
{
    "semi": true,
    "singleQuote": false,
    "trailingComma": "es5",
    "tabWidth": 4,
    "printWidth": 100,
    "bracketSpacing": true,
    "arrowParens": "always",
    "endOfLine": "lf"
}
```

### ESLint + Prettier Together

```bash
npm install --save-dev eslint-config-prettier
```

```javascript
// eslint.config.js
import prettier from "eslint-config-prettier";

export default [
    js.configs.recommended,
    prettier  // Turn off ESLint rules that conflict with Prettier
];
```

### Format on Save (VS Code)

```json
// .vscode/settings.json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## Environment Variables

### With Vite

```bash
# .env (all environments)
VITE_APP_TITLE=My App

# .env.development
VITE_API_URL=http://localhost:5000/api

# .env.production
VITE_API_URL=https://api.myapp.com
```

```javascript
// Access in code (must start with VITE_ prefix)
const apiUrl = import.meta.env.VITE_API_URL;
const appTitle = import.meta.env.VITE_APP_TITLE;
const isDev = import.meta.env.DEV;       // true in development
const isProd = import.meta.env.PROD;      // true in production
const mode = import.meta.env.MODE;        // "development" or "production"
```

### Security Rules

```
✅ SAFE to expose (VITE_ prefix):
├── API base URLs (they're visible in network tab anyway)
├── Public API keys (Google Maps, Stripe publishable key)
├── Feature flags
└── App configuration

❌ NEVER expose in frontend code:
├── Database passwords
├── Private API keys / secrets
├── JWT signing secrets
├── AWS credentials
└── Any server-side secrets
```

> **Everything in frontend code is visible to users.** The `VITE_` prefix is a safety reminder — only prefix variables that are safe to expose.

---

## Key Takeaways

1. **Build tools translate developer code** to browser-compatible, optimized code
2. **Use Vite for new projects** — it's fast, simple, and modern
3. **Use pnpm** for faster installs and less disk usage
4. **`dependencies` are for runtime**, **`devDependencies` are for development only**
5. **Bundling** combines files and tree-shakes unused code for production
6. **Vite uses native ES modules in dev** — no bundling needed, instant startup
7. **ESLint catches bugs**, **Prettier formats code** — use both
8. **Environment variables** with `VITE_` prefix are safe for frontend (public info only)
9. **SWC is replacing Babel** — Rust-based, 20-70x faster transpilation
10. **Learn Webpack concepts** but use Vite for new work

---

## Practice Exercises

1. **Create a Vite React project** from scratch — customize the config with aliases and proxy
2. **Set up ESLint + Prettier** in a project with format-on-save
3. **Configure environment variables** for dev and production API endpoints
4. **Analyze your bundle** — run `npx vite-bundle-visualizer` and see what's in your build
5. **Convert a Webpack project to Vite** — understand the differences in configuration

---

**Previous:** [← Phase 08 — Browser APIs & Web Storage](Phase-08-Browser-APIs-Web-Storage.md)
**Next:** [Phase 10 — React Fundamentals →](Phase-10-React-Fundamentals.md)
