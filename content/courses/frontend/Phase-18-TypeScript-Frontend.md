# Phase 18 — TypeScript for Frontend

## Table of Contents

- [Why TypeScript?](#why-typescript)
- [Setting Up TypeScript with React](#setting-up-typescript-with-react)
- [Basic Types](#basic-types)
- [Functions and Type Annotations](#functions-and-type-annotations)
- [Interfaces and Type Aliases](#interfaces-and-type-aliases)
- [Union Types and Narrowing](#union-types-and-narrowing)
- [Generics](#generics)
- [React + TypeScript Patterns](#react--typescript-patterns)
- [Typing Hooks](#typing-hooks)
- [Typing Events and Refs](#typing-events-and-refs)
- [Typing API Responses](#typing-api-responses)
- [Utility Types](#utility-types)
- [Key Takeaways](#key-takeaways)

---

## Why TypeScript?

```
JAVASCRIPT:
├── No type checking → bugs discovered at RUNTIME
├── "undefined is not a function" at 2 AM
├── Rename a prop → no warning until it breaks
├── No autocomplete for object shapes
└── Large codebases become scary to refactor

TYPESCRIPT:
├── Type errors caught at COMPILE TIME (before users see them)
├── Autocomplete for everything (props, API responses, state)
├── Safe refactoring (rename, change types → compiler finds all usages)
├── Self-documenting code (types ARE documentation)
└── Industry standard for professional React development
```

### TypeScript = JavaScript + Types

```typescript
// JavaScript
function greet(name) {
    return "Hello, " + name;
}
greet(42);  // No error — but probably a bug

// TypeScript
function greet(name: string): string {
    return "Hello, " + name;
}
greet(42);  // ❌ Error: Argument of type 'number' is not assignable to 'string'
```

---

## Setting Up TypeScript with React

```bash
# New project with Vite
npm create vite@latest my-app -- --template react-ts

# Add TypeScript to existing React project
npm install -D typescript @types/react @types/react-dom
npx tsc --init
```

### tsconfig.json (Key Options)

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "jsx": "react-jsx",
        "strict": true,
        "moduleResolution": "bundler",
        "skipLibCheck": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true
    },
    "include": ["src"]
}
```

### File Extensions

```
.ts   → Regular TypeScript files (utils, API, types)
.tsx  → TypeScript files with JSX (React components)
```

---

## Basic Types

```typescript
// Primitives
let name: string = "Alice";
let age: number = 25;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// Arrays
let scores: number[] = [95, 87, 92];
let names: string[] = ["Alice", "Bob"];
let mixed: (string | number)[] = ["hello", 42];

// Tuple (fixed length, specific types per position)
let coordinates: [number, number] = [40.7, -74.0];
let entry: [string, number] = ["Alice", 25];

// Object
let user: { name: string; age: number; email?: string } = {
    name: "Alice",
    age: 25
    // email is optional (?)
};

// Any (escape hatch — avoid when possible)
let flexible: any = "can be anything";

// Unknown (safer than any — must narrow before using)
let input: unknown = getUserInput();
if (typeof input === "string") {
    console.log(input.toUpperCase());  // ✅ safe after check
}
```

---

## Functions and Type Annotations

```typescript
// Parameter types + return type
function add(a: number, b: number): number {
    return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Optional and default parameters
function greet(name: string, greeting: string = "Hello"): string {
    return `${greeting}, ${name}!`;
}

// Void return (function returns nothing)
function logMessage(msg: string): void {
    console.log(msg);
}

// Function type
type MathFn = (a: number, b: number) => number;
const divide: MathFn = (a, b) => a / b;

// Rest parameters
function sum(...numbers: number[]): number {
    return numbers.reduce((total, n) => total + n, 0);
}

// Promise return type
async function fetchUser(id: number): Promise<User> {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
}
```

---

## Interfaces and Type Aliases

### Interface

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user" | "moderator";
    avatar?: string;      // optional
    readonly createdAt: Date;  // can't be changed after creation
}

// Usage
function displayUser(user: User): void {
    console.log(`${user.name} (${user.role})`);
}
```

### Type Alias

```typescript
type Status = "loading" | "success" | "error";

type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
};

type ApiResponse<T> = {
    data: T;
    status: number;
    message: string;
};
```

### Interface vs Type

```typescript
// Interface — can be extended, good for objects
interface Animal {
    name: string;
}

interface Dog extends Animal {
    breed: string;
}

// Type — more flexible, can represent any type
type ID = string | number;                    // union
type Point = [number, number];                // tuple
type Callback = (data: string) => void;       // function

// Both work for object shapes — use interface for objects, type for everything else
```

### Extending and Combining

```typescript
// Interface extends
interface BaseUser {
    id: number;
    name: string;
}

interface AdminUser extends BaseUser {
    permissions: string[];
    adminLevel: number;
}

// Type intersection (&)
type WithTimestamps = {
    createdAt: Date;
    updatedAt: Date;
};

type FullUser = BaseUser & WithTimestamps;
// { id, name, createdAt, updatedAt }
```

---

## Union Types and Narrowing

### Union Types

```typescript
// Value can be one of several types
type Status = "idle" | "loading" | "success" | "error";

type Result = string | number;

function format(value: string | number): string {
    // Must narrow the type before using type-specific methods
    if (typeof value === "string") {
        return value.toUpperCase();     // TS knows it's string here
    }
    return value.toFixed(2);            // TS knows it's number here
}
```

### Discriminated Unions (Most Useful Pattern)

```typescript
// Each variant has a common discriminant field
type ApiState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: User[] }
    | { status: "error"; error: string };

function renderState(state: ApiState) {
    switch (state.status) {
        case "idle":
            return <p>Ready to fetch</p>;
        case "loading":
            return <Spinner />;
        case "success":
            return <UserList users={state.data} />;  // TS knows data exists
        case "error":
            return <p>Error: {state.error}</p>;       // TS knows error exists
    }
}
```

---

## Generics

Generics let you create **reusable types and functions** that work with any type.

```typescript
// Without generics — need separate functions
function firstString(arr: string[]): string | undefined { return arr[0]; }
function firstNumber(arr: number[]): number | undefined { return arr[0]; }

// With generics — ONE function works for any type
function first<T>(arr: T[]): T | undefined {
    return arr[0];
}

first<string>(["a", "b"]);   // returns string
first<number>([1, 2, 3]);    // returns number
first([true, false]);         // TS infers boolean
```

### Generic Interfaces

```typescript
// Reusable API response shape
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

// Usage with different data types
type UserResponse = ApiResponse<User>;
type ProductListResponse = ApiResponse<Product[]>;

async function fetchUsers(): Promise<ApiResponse<User[]>> {
    const res = await fetch("/api/users");
    return res.json();
}
```

### Generic Constraints

```typescript
// T must have an id property
function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
    return items.find(item => item.id === id);
}

findById(users, 5);     // ✅ User has id
findById(products, 3);  // ✅ Product has id
findById(["a", "b"], 1); // ❌ string doesn't have id
```

---

## React + TypeScript Patterns

### Typing Props

```tsx
// Define props interface
interface ButtonProps {
    label: string;
    variant?: "primary" | "secondary" | "danger";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    onClick: () => void;
}

function Button({ label, variant = "primary", size = "md", disabled = false, onClick }: ButtonProps) {
    return (
        <button
            className={`btn btn-${variant} btn-${size}`}
            disabled={disabled}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

// Usage — TypeScript enforces correct props
<Button label="Save" onClick={handleSave} />             // ✅
<Button label="Delete" variant="danger" onClick={del} /> // ✅
<Button label="Save" onClick={handleSave} size="xl" />   // ❌ "xl" not valid
<Button onClick={handleSave} />                           // ❌ label is required
```

### Typing Children

```tsx
interface CardProps {
    title: string;
    children: React.ReactNode;  // anything renderable
}

function Card({ title, children }: CardProps) {
    return (
        <div className="card">
            <h2>{title}</h2>
            <div className="card-body">{children}</div>
        </div>
    );
}
```

### Common React Prop Types

```typescript
// Any renderable content
children: React.ReactNode;

// Only JSX elements (no strings/numbers)
children: React.ReactElement;

// CSS style object
style: React.CSSProperties;

// Class name
className: string;

// HTML element props (get ALL props of a native element)
type InputProps = React.ComponentProps<"input">;
type ButtonProps = React.ComponentProps<"button">;

// Extend native props
interface SearchInputProps extends React.ComponentProps<"input"> {
    onSearch: (query: string) => void;
}
```

---

## Typing Hooks

### useState

```tsx
// TypeScript infers from initial value
const [count, setCount] = useState(0);          // number
const [name, setName] = useState("");            // string
const [isOpen, setIsOpen] = useState(false);     // boolean

// Explicit type needed when initial value doesn't reveal full type
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Product[]>([]);
const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
```

### useReducer

```tsx
interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

type TodoAction =
    | { type: "ADD"; payload: string }
    | { type: "TOGGLE"; payload: number }
    | { type: "DELETE"; payload: number };

function todoReducer(state: Todo[], action: TodoAction): Todo[] {
    switch (action.type) {
        case "ADD":
            return [...state, { id: Date.now(), text: action.payload, completed: false }];
        case "TOGGLE":
            return state.map(t => t.id === action.payload ? { ...t, completed: !t.completed } : t);
        case "DELETE":
            return state.filter(t => t.id !== action.payload);
    }
}

function TodoApp() {
    const [todos, dispatch] = useReducer(todoReducer, []);

    dispatch({ type: "ADD", payload: "Learn TypeScript" });  // ✅
    dispatch({ type: "ADD", payload: 42 });                  // ❌ payload must be string
    dispatch({ type: "REMOVE", payload: 1 });                // ❌ "REMOVE" not a valid type
}
```

### useContext

```tsx
interface AuthContextType {
    user: User | null;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
```

### Custom Hooks

```tsx
function useFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch(url, { signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<T>;
            })
            .then(setData)
            .catch(err => {
                if (err.name !== "AbortError") setError(err.message);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [url]);

    return { data, loading, error };
}

// Usage — generic infers the type
const { data: users } = useFetch<User[]>("/api/users");
// users is User[] | null — TypeScript knows!
```

---

## Typing Events and Refs

### Events

```tsx
function Form() {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        console.log(e.target.value);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
    }

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
        console.log("Clicked at", e.clientX, e.clientY);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            console.log("Enter pressed");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input onChange={handleChange} onKeyDown={handleKeyDown} />
            <button onClick={handleClick}>Submit</button>
        </form>
    );
}
```

### Common Event Types

```typescript
React.ChangeEvent<HTMLInputElement>      // onChange for input
React.ChangeEvent<HTMLSelectElement>     // onChange for select
React.ChangeEvent<HTMLTextAreaElement>   // onChange for textarea
React.FormEvent<HTMLFormElement>         // onSubmit
React.MouseEvent<HTMLButtonElement>      // onClick
React.KeyboardEvent<HTMLInputElement>    // onKeyDown, onKeyUp
React.FocusEvent<HTMLInputElement>       // onFocus, onBlur
React.DragEvent<HTMLDivElement>          // onDrag, onDrop
```

### Refs

```tsx
function TextInput() {
    const inputRef = useRef<HTMLInputElement>(null);
    const divRef = useRef<HTMLDivElement>(null);

    function focusInput() {
        inputRef.current?.focus();  // ?. because ref might be null
    }

    return (
        <div ref={divRef}>
            <input ref={inputRef} />
            <button onClick={focusInput}>Focus</button>
        </div>
    );
}

// Ref for mutable values (not DOM)
const timerRef = useRef<number | null>(null);

timerRef.current = window.setInterval(() => {}, 1000);
```

---

## Typing API Responses

### Define Response Types

```typescript
// types/api.ts
interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user";
}

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

interface ApiError {
    message: string;
    code: string;
    details?: Record<string, string[]>;
}
```

### Type-Safe API Client

```typescript
// api/client.ts
async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message);
    }

    return response.json() as Promise<T>;
}

// api/users.ts
export function getUsers(): Promise<PaginatedResponse<User>> {
    return apiClient("/users");
}

export function getUser(id: number): Promise<User> {
    return apiClient(`/users/${id}`);
}

export function createUser(data: Omit<User, "id">): Promise<User> {
    return apiClient("/users", {
        method: "POST",
        body: JSON.stringify(data)
    });
}
```

---

## Utility Types

TypeScript provides built-in utility types for common transformations.

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}

// Partial<T> — all properties optional
type UserUpdate = Partial<User>;
// { id?: number; name?: string; email?: string; password?: string }

// Required<T> — all properties required
type CompleteUser = Required<User>;

// Pick<T, Keys> — select specific properties
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit<T, Keys> — remove specific properties
type CreateUser = Omit<User, "id">;
// { name: string; email: string; password: string }

// Readonly<T> — all properties readonly
type FrozenUser = Readonly<User>;

// Record<Keys, Value> — key-value map
type RolePermissions = Record<"admin" | "user" | "moderator", string[]>;

// Exclude — remove types from union
type NonAdmin = Exclude<"admin" | "user" | "moderator", "admin">;
// "user" | "moderator"

// ReturnType — get return type of a function
type FetchResult = ReturnType<typeof fetchUsers>;
```

### Real-World Usage

```typescript
// API: Create expects everything except id
type CreateUserInput = Omit<User, "id">;

// API: Update only sends changed fields
type UpdateUserInput = Partial<Omit<User, "id">>;

// Component: Display only needs some fields
type UserCardProps = Pick<User, "name" | "email"> & {
    onClick: () => void;
};

// API Response: User without sensitive fields
type PublicUser = Omit<User, "password">;
```

---

## Key Takeaways

1. **TypeScript catches bugs at compile time** — before users see them
2. **Use `interface` for object shapes, `type` for unions and primitives**
3. **Always type component props** — gives autocomplete and catches wrong prop values
4. **Type useState explicitly** when initial value is `null` or empty array — `useState<User | null>(null)`
5. **Discriminated unions** are the most powerful pattern — use `status` field for API states
6. **Generics make code reusable** — `useFetch<T>`, `ApiResponse<T>`, `Array<T>`
7. **Use utility types** — `Omit`, `Pick`, `Partial`, `Required` save repetition
8. **Type event handlers** — `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent`
9. **Type API responses** — define interfaces for all API data, enforce at fetch layer
10. **Start strict** (`"strict": true`) — it's much harder to add strictness later

---

## Practice Exercises

1. **Convert a JS React app to TypeScript** — rename files to `.tsx`, add types, fix all errors
2. **Type a form component** — props, state, events, validation errors all typed
3. **Create a typed useFetch hook** — generic type parameter for the response data
4. **Build a typed todo app** — interface for Todo, discriminated union for actions, typed reducer
5. **Create a typed API client** — generic `apiClient<T>()`, typed endpoint functions, typed error handling

---

**Previous:** [← Phase 17 — Accessibility (a11y)](Phase-17-Accessibility.md)
**Next:** [Phase 19 — Advanced Patterns & Architecture →](Phase-19-Advanced-Patterns-Architecture.md)
