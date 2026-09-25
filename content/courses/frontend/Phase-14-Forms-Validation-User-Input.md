# Phase 14 — Forms, Validation & User Input

## Table of Contents

- [Controlled vs Uncontrolled Components](#controlled-vs-uncontrolled-components)
- [Controlled Forms](#controlled-forms)
- [Handling Multiple Inputs](#handling-multiple-inputs)
- [Form Validation — Manual](#form-validation--manual)
- [React Hook Form](#react-hook-form)
- [Zod — Schema Validation](#zod--schema-validation)
- [React Hook Form + Zod](#react-hook-form--zod)
- [Complex Form Patterns](#complex-form-patterns)
- [File Uploads](#file-uploads)
- [Accessible Forms](#accessible-forms)
- [Key Takeaways](#key-takeaways)

---

## Controlled vs Uncontrolled Components

```
CONTROLLED:
React state is the "single source of truth"
├── Value stored in useState
├── Every keystroke triggers onChange → setState
├── React controls what's displayed
└── Use for: most forms

UNCONTROLLED:
DOM is the source of truth
├── Value stored in the DOM
├── Access via useRef
├── React doesn't track every change
└── Use for: file inputs, simple one-off forms
```

### Controlled

```jsx
function ControlledInput() {
    const [value, setValue] = useState("");

    return (
        <input
            value={value}                        // React controls display
            onChange={e => setValue(e.target.value)}  // sync state on every change
        />
    );
}
```

### Uncontrolled

```jsx
function UncontrolledInput() {
    const inputRef = useRef();

    function handleSubmit(e) {
        e.preventDefault();
        console.log(inputRef.current.value);  // read from DOM
    }

    return (
        <form onSubmit={handleSubmit}>
            <input ref={inputRef} defaultValue="" />
            <button type="submit">Submit</button>
        </form>
    );
}
```

---

## Controlled Forms

### Basic Form

```jsx
function SignUpForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        console.log("Submitting:", formData);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
            />
            <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
            />
            <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
            />
            <button type="submit">Sign Up</button>
        </form>
    );
}
```

---

## Handling Multiple Inputs

### Different Input Types

```jsx
function ProfileForm() {
    const [form, setForm] = useState({
        name: "",
        bio: "",
        role: "developer",
        newsletter: false,
        skills: []
    });

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    }

    function handleSkillChange(e) {
        const { value, checked } = e.target;
        setForm(prev => ({
            ...prev,
            skills: checked
                ? [...prev.skills, value]
                : prev.skills.filter(s => s !== value)
        }));
    }

    return (
        <form>
            {/* Text input */}
            <input name="name" value={form.name} onChange={handleChange} />

            {/* Textarea */}
            <textarea name="bio" value={form.bio} onChange={handleChange} />

            {/* Select dropdown */}
            <select name="role" value={form.role} onChange={handleChange}>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
            </select>

            {/* Single checkbox */}
            <label>
                <input
                    type="checkbox"
                    name="newsletter"
                    checked={form.newsletter}
                    onChange={handleChange}
                />
                Subscribe to newsletter
            </label>

            {/* Checkbox group */}
            {["React", "Vue", "Angular", "Svelte"].map(skill => (
                <label key={skill}>
                    <input
                        type="checkbox"
                        value={skill}
                        checked={form.skills.includes(skill)}
                        onChange={handleSkillChange}
                    />
                    {skill}
                </label>
            ))}

            {/* Radio buttons */}
            {["light", "dark", "system"].map(theme => (
                <label key={theme}>
                    <input
                        type="radio"
                        name="role"
                        value={theme}
                        checked={form.role === theme}
                        onChange={handleChange}
                    />
                    {theme}
                </label>
            ))}
        </form>
    );
}
```

---

## Form Validation — Manual

### Basic Validation

```jsx
function RegistrationForm() {
    const [form, setForm] = useState({ email: "", password: "", confirm: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    function validate(data) {
        const newErrors = {};

        if (!data.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!data.password) {
            newErrors.password = "Password is required";
        } else if (data.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (data.password !== data.confirm) {
            newErrors.confirm = "Passwords don't match";
        }

        return newErrors;
    }

    function handleChange(e) {
        const { name, value } = e.target;
        const newForm = { ...form, [name]: value };
        setForm(newForm);

        // Validate on change if field was touched
        if (touched[name]) {
            setErrors(validate(newForm));
        }
    }

    function handleBlur(e) {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(validate(form));
    }

    function handleSubmit(e) {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({ email: true, password: true, confirm: true });

        const validationErrors = validate(form);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            console.log("Form is valid!", form);
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.email && errors.email ? "error" : ""}
                />
                {touched.email && errors.email && (
                    <span className="error-message">{errors.email}</span>
                )}
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                {touched.password && errors.password && (
                    <span className="error-message">{errors.password}</span>
                )}
            </div>

            <div>
                <label htmlFor="confirm">Confirm Password</label>
                <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    value={form.confirm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                {touched.confirm && errors.confirm && (
                    <span className="error-message">{errors.confirm}</span>
                )}
            </div>

            <button type="submit">Register</button>
        </form>
    );
}
```

> Manual validation works but gets painful fast. For real apps, use a form library.

---

## React Hook Form

React Hook Form is the **most popular form library** for React — minimal re-renders, great performance, built-in validation.

```bash
npm install react-hook-form
```

### Basic Usage

```jsx
import { useForm } from "react-hook-form";

function LoginForm() {
    const {
        register,      // connect input to form
        handleSubmit,   // wraps your submit handler
        formState: { errors, isSubmitting }
    } = useForm();

    async function onSubmit(data) {
        console.log(data);  // { email: "...", password: "..." }
        await loginUser(data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email"
                        }
                    })}
                />
                {errors.email && <span>{errors.email.message}</span>}
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    {...register("password", {
                        required: "Password is required",
                        minLength: {
                            value: 8,
                            message: "Must be at least 8 characters"
                        }
                    })}
                />
                {errors.password && <span>{errors.password.message}</span>}
            </div>

            <button disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log In"}
            </button>
        </form>
    );
}
```

### Validation Options

```jsx
register("username", {
    required: "Username is required",
    minLength: { value: 3, message: "Min 3 characters" },
    maxLength: { value: 20, message: "Max 20 characters" },
    pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Only letters, numbers, underscore" },
    validate: {
        noSpaces: (value) => !value.includes(" ") || "No spaces allowed",
        notAdmin: (value) => value !== "admin" || "Cannot use 'admin'"
    }
});

register("age", {
    required: "Age is required",
    min: { value: 18, message: "Must be 18+" },
    max: { value: 120, message: "Invalid age" },
    valueAsNumber: true  // convert to number
});
```

### Watch Values

```jsx
const { register, watch } = useForm();

const password = watch("password");

// Use watched value for dependent validation
register("confirmPassword", {
    validate: (value) => value === password || "Passwords don't match"
});
```

### Default Values

```jsx
const { register, handleSubmit, reset } = useForm({
    defaultValues: {
        name: "Alice",
        email: "alice@example.com",
        role: "developer"
    }
});

// Reset form to defaults (or new values)
function handleReset() {
    reset();  // back to defaultValues
    reset({ name: "Bob", email: "bob@example.com" });  // new values
}
```

---

## Zod — Schema Validation

Zod is a **TypeScript-first schema validation library**. Define your shape once, get validation and types.

```bash
npm install zod
```

### Defining Schemas

```javascript
import { z } from "zod";

const userSchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name too long"),

    email: z.string()
        .email("Invalid email address"),

    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[0-9]/, "Must contain a number"),

    age: z.number()
        .min(18, "Must be 18 or older")
        .max(120, "Invalid age"),

    role: z.enum(["developer", "designer", "manager"]),

    newsletter: z.boolean().default(false),

    website: z.string().url("Invalid URL").optional()
});

// Validate
const result = userSchema.safeParse({
    name: "Alice",
    email: "alice@example.com",
    password: "Pass1234",
    age: 25,
    role: "developer"
});

if (result.success) {
    console.log(result.data);  // typed data
} else {
    console.log(result.error.issues);  // array of error messages
}
```

### Password Confirmation with Zod

```javascript
const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
```

---

## React Hook Form + Zod

The combination of React Hook Form + Zod is the **gold standard** for React forms.

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Complete Example

```jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain uppercase letter")
        .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

function SignUpForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(schema),
        mode: "onBlur"  // validate on blur
    });

    async function onSubmit(data) {
        // data is fully validated and typed!
        console.log(data);
        await createAccount(data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField label="Name" error={errors.name}>
                <input {...register("name")} />
            </FormField>

            <FormField label="Email" error={errors.email}>
                <input type="email" {...register("email")} />
            </FormField>

            <FormField label="Password" error={errors.password}>
                <input type="password" {...register("password")} />
            </FormField>

            <FormField label="Confirm Password" error={errors.confirmPassword}>
                <input type="password" {...register("confirmPassword")} />
            </FormField>

            <button disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>
        </form>
    );
}

// Reusable field wrapper
function FormField({ label, error, children }) {
    return (
        <div className={`form-field ${error ? "has-error" : ""}`}>
            <label>{label}</label>
            {children}
            {error && <span className="error">{error.message}</span>}
        </div>
    );
}
```

---

## Complex Form Patterns

### Dynamic Fields (Add/Remove)

```jsx
import { useForm, useFieldArray } from "react-hook-form";

function ExperienceForm() {
    const { register, handleSubmit, control } = useForm({
        defaultValues: {
            experiences: [{ company: "", role: "", years: "" }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "experiences"
    });

    return (
        <form onSubmit={handleSubmit(console.log)}>
            {fields.map((field, index) => (
                <div key={field.id} className="experience-row">
                    <input
                        {...register(`experiences.${index}.company`)}
                        placeholder="Company"
                    />
                    <input
                        {...register(`experiences.${index}.role`)}
                        placeholder="Role"
                    />
                    <input
                        {...register(`experiences.${index}.years`)}
                        placeholder="Years"
                        type="number"
                    />
                    {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)}>✕</button>
                    )}
                </div>
            ))}

            <button
                type="button"
                onClick={() => append({ company: "", role: "", years: "" })}
            >
                + Add Experience
            </button>

            <button type="submit">Save</button>
        </form>
    );
}
```

### Multi-Step Form

```jsx
function MultiStepForm() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});

    function handleNext(stepData) {
        setFormData(prev => ({ ...prev, ...stepData }));
        setStep(s => s + 1);
    }

    function handleBack() {
        setStep(s => s - 1);
    }

    function handleFinalSubmit(stepData) {
        const finalData = { ...formData, ...stepData };
        console.log("Complete data:", finalData);
    }

    return (
        <div>
            <ProgressBar currentStep={step} totalSteps={3} />

            {step === 1 && <PersonalInfo onNext={handleNext} defaultValues={formData} />}
            {step === 2 && <AccountInfo onNext={handleNext} onBack={handleBack} defaultValues={formData} />}
            {step === 3 && <Confirmation onSubmit={handleFinalSubmit} onBack={handleBack} defaultValues={formData} />}
        </div>
    );
}

function PersonalInfo({ onNext, defaultValues }) {
    const { register, handleSubmit } = useForm({ defaultValues });

    return (
        <form onSubmit={handleSubmit(onNext)}>
            <input {...register("firstName", { required: true })} placeholder="First Name" />
            <input {...register("lastName", { required: true })} placeholder="Last Name" />
            <button type="submit">Next →</button>
        </form>
    );
}
```

---

## File Uploads

```jsx
function AvatarUpload() {
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {  // 5MB limit
            alert("File must be under 5MB");
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const res = await fetch("/api/upload/avatar", {
                method: "POST",
                body: formData  // Don't set Content-Type — browser sets it with boundary
            });

            if (!res.ok) throw new Error("Upload failed");
        } catch (err) {
            alert(err.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div>
            {preview && <img src={preview} alt="Preview" className="avatar-preview" />}
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
            />
            {uploading && <p>Uploading...</p>}
        </div>
    );
}
```

---

## Accessible Forms

```jsx
function AccessibleForm() {
    const { register, handleSubmit, formState: { errors } } = useForm();

    return (
        <form onSubmit={handleSubmit(console.log)} noValidate>
            {/* 1. Labels connected to inputs */}
            <div>
                <label htmlFor="email">Email *</label>
                <input
                    id="email"
                    type="email"
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                    <span id="email-error" role="alert" className="error">
                        {errors.email.message}
                    </span>
                )}
            </div>

            {/* 2. Help text linked with aria-describedby */}
            <div>
                <label htmlFor="password">Password *</label>
                <input
                    id="password"
                    type="password"
                    aria-describedby="password-help"
                    {...register("password", { required: true, minLength: 8 })}
                />
                <span id="password-help" className="help-text">
                    Must be at least 8 characters
                </span>
            </div>

            {/* 3. Required fields indicated visually and programmatically */}
            <p className="required-note">* Required fields</p>

            <button type="submit">Submit</button>
        </form>
    );
}
```

### Accessibility Checklist

```
✅ Every input has a <label> with matching htmlFor/id
✅ Error messages use role="alert" and aria-describedby
✅ Required fields marked with aria-required="true"
✅ Invalid fields marked with aria-invalid="true"
✅ Form can be completed with keyboard only
✅ Focus moves to first error on failed submit
✅ Submit button shows loading state (disabled + text change)
```

---

## Key Takeaways

1. **Use controlled components** (value + onChange) for most forms — React owns the data
2. **One handleChange function** can handle many inputs using `e.target.name`
3. **Manual validation works** for simple forms — validate on blur and on submit
4. **React Hook Form** is the best choice for real apps — minimal re-renders, great DX
5. **Zod schemas** define validation rules once — reuse on frontend and backend
6. **React Hook Form + Zod** is the gold standard — combine `zodResolver` for both
7. **useFieldArray** handles dynamic field lists — add/remove rows cleanly
8. **Multi-step forms** share state between steps — store data on "next", restore on "back"
9. **File uploads use FormData** — don't set Content-Type header manually
10. **Accessible forms need labels, aria attributes, and keyboard support** — not optional

---

## Practice Exercises

1. **Build a registration form** with email, password, confirm password using React Hook Form + Zod
2. **Create a dynamic invoice** — add/remove line items with useFieldArray, auto-calculate totals
3. **Build a multi-step wizard** — 3 steps: personal info → address → review & submit
4. **Implement a profile editor** — load existing data with defaultValues, show dirty state, save changes
5. **Create a file upload** with drag-and-drop, preview, file type/size validation, and progress indicator

---

**Previous:** [← Phase 13 — Fetching Data & API Integration](Phase-13-Fetching-Data-API-Integration.md)
**Next:** [Phase 15 — Testing Frontend Applications →](Phase-15-Testing-Frontend.md)
