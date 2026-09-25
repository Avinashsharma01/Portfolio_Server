# Phase 15 — Testing Frontend Applications

## Table of Contents

- [Why Test?](#why-test)
- [Testing Pyramid](#testing-pyramid)
- [Setting Up Vitest](#setting-up-vitest)
- [Writing Unit Tests](#writing-unit-tests)
- [Testing React Components — React Testing Library](#testing-react-components--react-testing-library)
- [User Interactions](#user-interactions)
- [Testing Async Code](#testing-async-code)
- [Mocking API Calls](#mocking-api-calls)
- [Testing Forms](#testing-forms)
- [Testing Hooks](#testing-hooks)
- [End-to-End Testing with Cypress](#end-to-end-testing-with-cypress)
- [What to Test (and What Not To)](#what-to-test-and-what-not-to)
- [Key Takeaways](#key-takeaways)

---

## Why Test?

```
WITHOUT TESTS:
├── "It works on my machine"
├── Refactoring breaks things silently
├── Every change requires manual checking
├── Fear of touching old code
└── Bugs discovered by users

WITH TESTS:
├── Confidence that code works correctly
├── Safe refactoring — tests catch regressions
├── Documentation of expected behavior
├── Faster development in the long run
└── Bugs caught before deployment
```

---

## Testing Pyramid

```
        /\
       /  \       E2E Tests (Cypress, Playwright)
      /    \      → Full user flows in real browser
     /──────\     → Slowest, most expensive
    /        \    → Few tests: login flow, checkout, critical paths
   / Integr.  \
  /   Tests    \  Integration Tests (React Testing Library)
 /              \ → Components + interactions together
/────────────────\ → Medium speed
                   → Most of your tests: forms, lists, data display

   Unit Tests      Unit Tests (Vitest/Jest)
  (Foundation)     → Pure functions, utilities, hooks
                   → Fastest, cheapest
                   → format dates, validate emails, calculate totals
```

| Type | Speed | Confidence | Quantity |
|------|-------|-----------|----------|
| **Unit** | ⚡ Fast | Low-Medium | Many |
| **Integration** | 🔄 Medium | High | Most |
| **E2E** | 🐌 Slow | Very High | Few |

---

## Setting Up Vitest

Vitest is a Vite-native test runner — fast, compatible with Jest API, zero config.

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Configuration

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,         // no need to import describe, it, expect
        environment: "jsdom",  // simulate browser DOM
        setupFiles: "./src/test/setup.js",
        css: true
    }
});
```

### Setup File

```javascript
// src/test/setup.js
import "@testing-library/jest-dom";
// Adds custom matchers: toBeInTheDocument, toHaveTextContent, etc.
```

### Package.json Scripts

```json
{
    "scripts": {
        "test": "vitest",
        "test:run": "vitest run",
        "test:coverage": "vitest run --coverage"
    }
}
```

### File Naming

```
src/
├── utils/
│   ├── format.js
│   └── format.test.js       ← co-located test
├── components/
│   ├── Button.jsx
│   └── Button.test.jsx      ← co-located test
└── test/
    └── setup.js
```

---

## Writing Unit Tests

### Basic Structure

```javascript
// utils/math.js
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }
export function divide(a, b) {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
}
```

```javascript
// utils/math.test.js
import { add, multiply, divide } from "./math";

describe("math utilities", () => {
    describe("add", () => {
        it("adds two positive numbers", () => {
            expect(add(2, 3)).toBe(5);
        });

        it("handles negative numbers", () => {
            expect(add(-1, -2)).toBe(-3);
        });

        it("handles zero", () => {
            expect(add(5, 0)).toBe(5);
        });
    });

    describe("divide", () => {
        it("divides two numbers", () => {
            expect(divide(10, 2)).toBe(5);
        });

        it("throws on division by zero", () => {
            expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
        });
    });
});
```

### Common Matchers

```javascript
// Equality
expect(value).toBe(5);                    // strict ===
expect(obj).toEqual({ a: 1, b: 2 });     // deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThanOrEqual(10);
expect(0.1 + 0.2).toBeCloseTo(0.3);      // floating point

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain("substring");

// Arrays
expect(arr).toContain("item");
expect(arr).toHaveLength(3);

// Objects
expect(obj).toHaveProperty("key");
expect(obj).toHaveProperty("nested.key", "value");

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow("error message");
```

### Testing Utility Functions

```javascript
// utils/format.js
export function formatPrice(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}

export function truncate(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
}

export function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
```

```javascript
// utils/format.test.js
import { formatPrice, truncate, slugify } from "./format";

describe("formatPrice", () => {
    it("formats cents to dollars", () => {
        expect(formatPrice(999)).toBe("$9.99");
        expect(formatPrice(100)).toBe("$1.00");
        expect(formatPrice(0)).toBe("$0.00");
        expect(formatPrice(1050)).toBe("$10.50");
    });
});

describe("truncate", () => {
    it("returns string unmodified if under maxLength", () => {
        expect(truncate("hello", 10)).toBe("hello");
    });

    it("truncates and adds ellipsis", () => {
        expect(truncate("hello world", 5)).toBe("hello...");
    });
});

describe("slugify", () => {
    it("converts text to URL-friendly slug", () => {
        expect(slugify("Hello World")).toBe("hello-world");
        expect(slugify("React & Vue")).toBe("react-vue");
        expect(slugify("  Spaces  ")).toBe("spaces");
    });
});
```

---

## Testing React Components — React Testing Library

React Testing Library tests components the way **users interact with them** — no testing implementation details.

### Basic Component Test

```jsx
// components/Greeting.jsx
export default function Greeting({ name }) {
    return <h1>Hello, {name}!</h1>;
}
```

```jsx
// components/Greeting.test.jsx
import { render, screen } from "@testing-library/react";
import Greeting from "./Greeting";

describe("Greeting", () => {
    it("renders the name", () => {
        render(<Greeting name="Alice" />);
        expect(screen.getByText("Hello, Alice!")).toBeInTheDocument();
    });

    it("renders with heading role", () => {
        render(<Greeting name="Bob" />);
        expect(screen.getByRole("heading")).toHaveTextContent("Hello, Bob!");
    });
});
```

### Query Methods

```jsx
// getBy — throws if not found (use when element MUST exist)
screen.getByText("Submit");
screen.getByRole("button", { name: "Submit" });
screen.getByLabelText("Email");
screen.getByPlaceholderText("Search...");
screen.getByTestId("custom-element");

// queryBy — returns null if not found (use for asserting absence)
expect(screen.queryByText("Error")).not.toBeInTheDocument();

// findBy — waits for element (async, use for elements that appear later)
const element = await screen.findByText("Data loaded");
```

### Query Priority (Best → Worst)

```
1. getByRole         → accessible roles (button, heading, textbox)
2. getByLabelText    → form fields by label
3. getByPlaceholderText → input placeholder
4. getByText         → visible text content
5. getByDisplayValue → current input value
6. getByAltText      → images
7. getByTitle        → title attribute
8. getByTestId       → data-testid (last resort)
```

---

## User Interactions

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter";

describe("Counter", () => {
    it("increments when clicking the button", async () => {
        const user = userEvent.setup();
        render(<Counter />);

        expect(screen.getByText("Count: 0")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Increment" }));

        expect(screen.getByText("Count: 1")).toBeInTheDocument();
    });

    it("decrements when clicking decrement", async () => {
        const user = userEvent.setup();
        render(<Counter />);

        await user.click(screen.getByRole("button", { name: "Decrement" }));

        expect(screen.getByText("Count: -1")).toBeInTheDocument();
    });
});
```

### Common User Events

```jsx
const user = userEvent.setup();

// Click
await user.click(element);
await user.dblClick(element);

// Type in input
await user.type(screen.getByRole("textbox"), "Hello");

// Clear input and type
await user.clear(screen.getByRole("textbox"));
await user.type(screen.getByRole("textbox"), "New value");

// Select dropdown
await user.selectOptions(screen.getByRole("combobox"), "option-value");

// Check/uncheck checkbox
await user.click(screen.getByRole("checkbox"));

// Keyboard
await user.keyboard("{Enter}");
await user.tab();
```

---

## Testing Async Code

### Waiting for Elements

```jsx
// components/UserProfile.jsx
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(res => res.json())
            .then(data => setUser(data));
    }, [userId]);

    if (!user) return <p>Loading...</p>;
    return <h1>{user.name}</h1>;
}
```

```jsx
// components/UserProfile.test.jsx
import { render, screen } from "@testing-library/react";
import UserProfile from "./UserProfile";

// Mock fetch globally
beforeEach(() => {
    globalThis.fetch = vi.fn();
});

it("shows loading then user data", async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Alice" })
    });

    render(<UserProfile userId={1} />);

    // Initially shows loading
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Wait for data to appear
    expect(await screen.findByText("Alice")).toBeInTheDocument();

    // Loading is gone
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});
```

### waitFor

```jsx
import { waitFor } from "@testing-library/react";

it("updates after action", async () => {
    render(<MyComponent />);

    await user.click(screen.getByRole("button"));

    // Wait for a condition to be true
    await waitFor(() => {
        expect(screen.getByText("Updated!")).toBeInTheDocument();
    });
});
```

---

## Mocking API Calls

### Mock Service Worker (MSW) — Recommended

MSW intercepts network requests at the network level — your code uses real fetch/axios.

```bash
npm install -D msw
```

```javascript
// src/test/mocks/handlers.js
import { http, HttpResponse } from "msw";

export const handlers = [
    http.get("/api/users", () => {
        return HttpResponse.json([
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" }
        ]);
    }),

    http.post("/api/users", async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json(
            { id: 3, ...body },
            { status: 201 }
        );
    }),

    http.delete("/api/users/:id", ({ params }) => {
        return new HttpResponse(null, { status: 204 });
    })
];
```

```javascript
// src/test/mocks/server.js
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

```javascript
// src/test/setup.js
import "@testing-library/jest-dom";
import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Using in Tests

```jsx
import { server } from "../test/mocks/server";
import { http, HttpResponse } from "msw";

it("shows error when API fails", async () => {
    // Override handler for this test
    server.use(
        http.get("/api/users", () => {
            return new HttpResponse(null, { status: 500 });
        })
    );

    render(<UserList />);

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
});
```

---

## Testing Forms

```jsx
// components/LoginForm.jsx
export default function LoginForm({ onSubmit }) {
    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            onSubmit({
                email: formData.get("email"),
                password: formData.get("password")
            });
        }}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />

            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required />

            <button type="submit">Log In</button>
        </form>
    );
}
```

```jsx
// components/LoginForm.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
    it("submits email and password", async () => {
        const user = userEvent.setup();
        const handleSubmit = vi.fn();

        render(<LoginForm onSubmit={handleSubmit} />);

        await user.type(screen.getByLabelText("Email"), "alice@example.com");
        await user.type(screen.getByLabelText("Password"), "password123");
        await user.click(screen.getByRole("button", { name: "Log In" }));

        expect(handleSubmit).toHaveBeenCalledWith({
            email: "alice@example.com",
            password: "password123"
        });
    });

    it("disables submit button while submitting", async () => {
        // test loading state...
    });
});
```

---

## Testing Hooks

```jsx
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
    it("starts at initial value", () => {
        const { result } = renderHook(() => useCounter(10));
        expect(result.current.count).toBe(10);
    });

    it("increments", () => {
        const { result } = renderHook(() => useCounter(0));

        act(() => {
            result.current.increment();
        });

        expect(result.current.count).toBe(1);
    });

    it("resets to initial value", () => {
        const { result } = renderHook(() => useCounter(5));

        act(() => {
            result.current.increment();
            result.current.increment();
            result.current.reset();
        });

        expect(result.current.count).toBe(5);
    });
});
```

---

## End-to-End Testing with Cypress

```bash
npm install -D cypress
npx cypress open
```

### Basic E2E Test

```javascript
// cypress/e2e/login.cy.js
describe("Login", () => {
    it("logs in successfully", () => {
        cy.visit("/login");

        cy.get('input[name="email"]').type("alice@example.com");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();

        // Should redirect to dashboard
        cy.url().should("include", "/dashboard");
        cy.contains("Welcome, Alice").should("be.visible");
    });

    it("shows error for invalid credentials", () => {
        cy.visit("/login");

        cy.get('input[name="email"]').type("wrong@example.com");
        cy.get('input[name="password"]').type("wrongpass");
        cy.get('button[type="submit"]').click();

        cy.contains("Invalid credentials").should("be.visible");
        cy.url().should("include", "/login");
    });
});
```

### Common Cypress Commands

```javascript
cy.visit("/page");                        // navigate
cy.get(".selector");                      // query DOM
cy.contains("text");                      // find by text
cy.get("input").type("text");             // type
cy.get("button").click();                 // click
cy.url().should("include", "/page");      // assert URL
cy.get(".item").should("have.length", 3); // assert count
cy.get(".modal").should("not.exist");     // assert absence
```

---

## What to Test (and What Not To)

```
✅ TEST:
├── User interactions (click, type, submit)
├── Conditional rendering (show/hide based on state)
├── API integration (loading → data → error states)
├── Form validation (required, format, match)
├── Utility/helper functions
├── Edge cases (empty lists, long text, special chars)
└── Accessibility (elements have correct roles, labels)

❌ DON'T TEST:
├── Implementation details (state variable names, internal structure)
├── Third-party library internals (React Router, MUI)
├── CSS/styling (use visual regression tools instead)
├── Constant/static content
├── Simple pass-through components
└── Constructor/lifecycle methods
```

---

## Key Takeaways

1. **Test behavior, not implementation** — test what users see and do, not internal state
2. **Vitest + React Testing Library** is the standard stack for React testing
3. **Use `getByRole`** as first choice for queries — it tests accessibility too
4. **`userEvent`** simulates real user behavior better than `fireEvent`
5. **Mock API calls with MSW** — intercepts at network level, code uses real fetch
6. **Test the three states**: loading, error, and success for async components
7. **`findBy`** queries wait for elements to appear — use for async rendering
8. **Cypress** for E2E tests — test critical user flows in a real browser
9. **Don't test everything** — focus on user-facing behavior and business logic
10. **Co-locate tests** next to source files — `Component.test.jsx` beside `Component.jsx`

---

## Practice Exercises

1. **Test a Counter component** — render, click increment/decrement/reset, assert text
2. **Test a Todo List** — add item, toggle complete, delete item, test empty state
3. **Test an API-driven component** — mock fetch with MSW, test loading/data/error states
4. **Test a form** — fill inputs, submit, assert callback called with correct data
5. **Write a Cypress E2E test** — test a complete signup flow from landing page to dashboard

---

**Previous:** [← Phase 14 — Forms, Validation & User Input](Phase-14-Forms-Validation-User-Input.md)
**Next:** [Phase 16 — Performance Optimization →](Phase-16-Performance-Optimization.md)
