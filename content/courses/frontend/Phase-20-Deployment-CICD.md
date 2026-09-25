# Phase 20 — Deployment & CI/CD for Frontend

## Table of Contents

- [From Development to Production](#from-development-to-production)
- [Building for Production](#building-for-production)
- [Deployment Platforms](#deployment-platforms)
- [Deploying to Vercel](#deploying-to-vercel)
- [Deploying to Netlify](#deploying-to-netlify)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Environment Variables](#environment-variables)
- [Custom Domains & HTTPS](#custom-domains--https)
- [CI/CD Pipelines with GitHub Actions](#cicd-pipelines-with-github-actions)
- [Preview Deployments](#preview-deployments)
- [Monitoring and Analytics](#monitoring-and-analytics)
- [Production Checklist](#production-checklist)
- [Key Takeaways](#key-takeaways)

---

## From Development to Production

```
DEVELOPMENT:
├── npm run dev        → Vite dev server (HMR, no optimization)
├── Source maps         → Full debugging
├── Unminified code    → Readable
└── localhost:5173     → Your machine only

PRODUCTION:
├── npm run build      → Optimized static files (HTML, CSS, JS)
├── Minified code      → Smaller files
├── Tree-shaking       → Dead code removed
├── Code splitting     → Separate chunks per route
└── Deployed to CDN    → Available worldwide
```

---

## Building for Production

```bash
# Build optimized output
npm run build

# Output goes to dist/ folder
dist/
├── index.html             ← Entry HTML
├── assets/
│   ├── index-abc123.css   ← Bundled, minified CSS
│   ├── index-def456.js    ← Bundled, minified JS
│   └── vendor-ghi789.js   ← Third-party libraries
└── favicon.ico
```

### Building with Vite

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "dist",
        sourcemap: false,           // disable source maps in production
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom"],
                    router: ["react-router-dom"]
                }
            }
        }
    }
});
```

### Preview Production Build Locally

```bash
npm run build
npm run preview    # Serves dist/ on localhost:4173
```

---

## Deployment Platforms

| Platform | Free Tier | Best For | Deploy From |
|----------|-----------|----------|-------------|
| **Vercel** | 100GB bandwidth | React, Next.js, any SPA | Git push |
| **Netlify** | 100GB bandwidth | Static sites, SPAs | Git push |
| **GitHub Pages** | Unlimited (public repos) | Simple static sites | GitHub Actions |
| **Cloudflare Pages** | Unlimited bandwidth | Global performance | Git push |
| **Render** | 100GB bandwidth | Full-stack apps | Git push |
| **AWS S3 + CloudFront** | Pay-as-you-go | Enterprise, custom setup | CLI / CI |

---

## Deploying to Vercel

Vercel is the **simplest option** for React apps — zero config.

### Method 1: Git Integration (Recommended)

```
1. Push your code to GitHub
2. Go to vercel.com → "Import Project"
3. Select your GitHub repo
4. Vercel auto-detects Vite/React
5. Click "Deploy"
6. Every push to main → automatic deployment
```

### Method 2: Vercel CLI

```bash
# Install
npm install -g vercel

# Deploy (from project directory)
vercel

# Follow prompts:
# → Link to existing project or create new
# → Framework: Vite
# → Build command: npm run build
# → Output directory: dist

# Production deploy
vercel --prod
```

### Vercel Configuration

```json
// vercel.json — SPA routing fix
{
    "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
    ],
    "headers": [
        {
            "source": "/assets/(.*)",
            "headers": [
                { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
            ]
        }
    ]
}
```

---

## Deploying to Netlify

### Method 1: Git Integration

```
1. Push code to GitHub
2. Go to netlify.com → "Add new site" → "Import from Git"
3. Select repo
4. Build settings:
   - Build command: npm run build
   - Publish directory: dist
5. Click "Deploy"
```

### Method 2: Netlify CLI

```bash
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy preview
netlify deploy

# Production deploy
netlify deploy --prod
```

### SPA Routing Fix

```
# public/_redirects (create this file)
/*    /index.html   200
```

Or use a config file:

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## Deploying to GitHub Pages

Free hosting for any GitHub repository.

### Setup with Vite

```javascript
// vite.config.js
export default defineConfig({
    plugins: [react()],
    base: "/your-repo-name/"  // IMPORTANT for GitHub Pages
});
```

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

### Enable GitHub Pages

```
1. Go to repo → Settings → Pages
2. Source: GitHub Actions
3. Push to main → workflow deploys automatically
4. URL: https://username.github.io/repo-name/
```

### SPA Routing Fix for GitHub Pages

```html
<!-- public/404.html — redirect all 404s to index.html -->
<!DOCTYPE html>
<html>
<head>
    <script>
        // Redirect to index.html with the path as a query parameter
        const path = window.location.pathname;
        window.location.replace(
            window.location.origin + '/your-repo-name/?redirect=' + encodeURIComponent(path)
        );
    </script>
</head>
</html>
```

---

## Environment Variables

### Vite Environment Variables

```bash
# .env — default (all environments)
VITE_APP_NAME=My React App

# .env.development — dev only
VITE_API_URL=http://localhost:3000/api

# .env.production — production only
VITE_API_URL=https://api.myapp.com

# .env.local — local overrides (git-ignored)
VITE_API_KEY=my-local-key
```

### Usage in Code

```javascript
// Access with import.meta.env
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// ⚠️ MUST start with VITE_ to be exposed to client code
// This prevents accidentally exposing secrets
```

### Environment Variables in Deployment

```
VERCEL:
Settings → Environment Variables → Add VITE_API_URL

NETLIFY:
Site settings → Environment variables → Add VITE_API_URL

GITHUB ACTIONS:
Repository → Settings → Secrets and variables → Actions → Add secret
```

> **Never put secrets (API keys, passwords) in frontend code.** Environment variables in SPAs are bundled into JavaScript — anyone can read them. Keep secrets in your backend.

---

## Custom Domains & HTTPS

### Vercel

```
1. Project Settings → Domains → Add domain
2. Add DNS records:
   - A record: 76.76.21.21
   - CNAME: cname.vercel-dns.com
3. HTTPS is automatic (Let's Encrypt)
```

### Netlify

```
1. Site settings → Domain management → Add custom domain
2. Add DNS records:
   - A record: 75.2.60.5
   - CNAME: your-site-name.netlify.app
3. HTTPS is automatic (Let's Encrypt)
```

### GitHub Pages

```
1. Settings → Pages → Custom domain → Enter domain
2. Add DNS records:
   - A records: 185.199.108.153, etc.
   - Or CNAME: username.github.io
3. Check "Enforce HTTPS"
```

---

## CI/CD Pipelines with GitHub Actions

### Full Pipeline: Lint → Test → Build → Deploy

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Job 1: Code quality checks
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit  # TypeScript check

  # Job 2: Tests
  test:
    runs-on: ubuntu-latest
    needs: lint  # only run if lint passes
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:run

  # Job 3: Build and Deploy (only on main branch push)
  deploy:
    runs-on: ubuntu-latest
    needs: test  # only run if tests pass
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: dist
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Pipeline Visualization

```
Push to main:
┌──────┐    ┌──────┐    ┌────────┐
│ Lint │ ──►│ Test │ ──►│ Deploy │
└──────┘    └──────┘    └────────┘
  ✅          ✅           ✅

Pull Request:
┌──────┐    ┌──────┐    ┌─────────┐
│ Lint │ ──►│ Test │ ──►│ Preview │
└──────┘    └──────┘    └─────────┘
  ✅          ✅           ✅
```

---

## Preview Deployments

Preview deployments create a **unique URL for every pull request** — reviewers can see changes before merging.

### Vercel (Automatic)

```
Every push to a PR branch → Vercel deploys a preview
URL: https://my-app-abc123-username.vercel.app
Comment added to PR with preview link
```

### Netlify (Automatic)

```
Every push to a PR branch → Netlify deploys a preview
URL: https://deploy-preview-42--my-app.netlify.app
Comment added to PR with preview link
```

### Benefits

```
✅ Reviewers see live changes (not just code)
✅ QA team can test before merge
✅ Stakeholders can preview features
✅ Catch visual bugs that code review misses
✅ Easy to share with non-technical team members
```

---

## Monitoring and Analytics

### Error Tracking

```javascript
// Sentry — catch and report errors in production
import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE
});

// Wrap your app
function App() {
    return (
        <Sentry.ErrorBoundary fallback={<ErrorPage />}>
            <Router />
        </Sentry.ErrorBoundary>
    );
}
```

### Web Analytics

```html
<!-- Plausible Analytics (privacy-friendly) -->
<script defer data-domain="yoursite.com" src="https://plausible.io/js/script.js"></script>
```

### Performance Monitoring

```javascript
// Report Core Web Vitals
import { onLCP, onINP, onCLS } from "web-vitals";

function sendToAnalytics(metric) {
    // Send to your analytics endpoint
    fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: metric.name,
            value: metric.value,
            id: metric.id
        })
    });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

---

## Production Checklist

```
BUILD:
✅ npm run build succeeds with no errors
✅ No console.log statements in production
✅ Source maps disabled (or uploaded to error tracker only)
✅ Environment variables set correctly
✅ Bundle size analyzed and optimized

PERFORMANCE:
✅ Lighthouse score > 90
✅ Images optimized (WebP/AVIF, lazy loading, sized)
✅ Code splitting for routes
✅ Fonts preloaded
✅ CSS/JS minified

SECURITY:
✅ No secrets in frontend code
✅ HTTPS enabled
✅ Content Security Policy headers
✅ Dependencies audited (npm audit)
✅ User input sanitized

SEO:
✅ <title> and <meta description> on every page
✅ Open Graph tags for social sharing
✅ Sitemap.xml generated
✅ robots.txt configured
✅ Semantic HTML for structure

ACCESSIBILITY:
✅ Lighthouse Accessibility > 95
✅ Keyboard navigation works
✅ Screen reader tested
✅ Color contrast passes WCAG AA

RELIABILITY:
✅ Error boundaries wrap major sections
✅ Error tracking set up (Sentry)
✅ 404 page handles unknown routes
✅ Offline fallback (optional PWA)
✅ CI/CD pipeline runs lint + test + build on every PR

DEPLOYMENT:
✅ Preview deployments for PRs
✅ Automatic deployment on merge to main
✅ Custom domain configured
✅ HTTPS enforced
✅ CDN caching for static assets
```

---

## Key Takeaways

1. **`npm run build` creates optimized static files** in `dist/` — minified, tree-shaken, code-split
2. **Vercel and Netlify are the easiest** deployment platforms — zero config, auto-deploy from Git
3. **GitHub Pages is free** for public repos — use GitHub Actions for automated deployment
4. **SPA routing needs a redirect rule** — `/* → /index.html` (200 status, not 301)
5. **Environment variables must start with `VITE_`** to be exposed to client code
6. **Never put secrets in frontend code** — environment variables are visible in the bundle
7. **CI/CD pipeline: lint → test → build → deploy** — catch problems before they reach production
8. **Preview deployments** let reviewers see live changes before merging
9. **Monitor production** with error tracking (Sentry) and web analytics
10. **Run the production checklist** before every launch — performance, security, SEO, accessibility

---

## Practice Exercises

1. **Deploy a React app to Vercel** — connect your GitHub repo, set environment variables
2. **Deploy to Netlify** — configure `netlify.toml`, set up SPA redirects
3. **Create a CI/CD pipeline** — GitHub Actions that lints, tests, and deploys on push to main
4. **Set up preview deployments** — every PR gets its own preview URL
5. **Run the production checklist** — fix all issues, achieve Lighthouse scores > 90 on all categories

---

**Previous:** [← Phase 19 — Advanced Patterns & Architecture](Phase-19-Advanced-Patterns-Architecture.md)

---

> _"First, solve the problem. Then, write the code."_ — John Johnson

**Congratulations!** 🎉 You've completed the Frontend Development Guide. You now have the knowledge to build professional, accessible, performant, and well-tested web applications. Keep building, keep learning, and ship great products.
