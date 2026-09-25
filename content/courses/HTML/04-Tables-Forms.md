# Phase 4: Tables and Forms

## 🎯 What You'll Learn

-   Creating structured data tables
-   Building interactive forms with various input types
-   Form validation and accessibility
-   Advanced table features and styling considerations
-   Best practices for data presentation

---

## 📖 Table of Contents

1. [HTML Tables](#html-tables)
2. [Table Structure and Semantics](#table-structure-and-semantics)
3. [Advanced Table Features](#advanced-table-features)
4. [HTML Forms](#html-forms)
5. [Input Types and Attributes](#input-types-and-attributes)
6. [Form Validation](#form-validation)
7. [Practical Examples](#practical-examples)
8. [Exercises](#exercises)

---

## HTML Tables

### 1. Basic Table Structure

```html
<table>
    <tr>
        <th>Header 1</th>
        <th>Header 2</th>
        <th>Header 3</th>
    </tr>
    <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 3</td>
    </tr>
    <tr>
        <td>Data 4</td>
        <td>Data 5</td>
        <td>Data 6</td>
    </tr>
</table>
```

### 2. Table Elements Explained

-   `<table>`: Container for the entire table
-   `<tr>`: Table row
-   `<th>`: Table header cell (bold and centered by default)
-   `<td>`: Table data cell
-   `<caption>`: Table title/description

### 3. Simple Example

```html
<table>
    <caption>
        Student Grades
    </caption>
    <tr>
        <th>Name</th>
        <th>Math</th>
        <th>Science</th>
        <th>English</th>
    </tr>
    <tr>
        <td>John Doe</td>
        <td>85</td>
        <td>92</td>
        <td>78</td>
    </tr>
    <tr>
        <td>Jane Smith</td>
        <td>90</td>
        <td>88</td>
        <td>95</td>
    </tr>
</table>
```

---

## Table Structure and Semantics

### 1. Semantic Table Structure

```html
<table>
    <caption>
        Quarterly Sales Report
    </caption>
    <thead>
        <tr>
            <th>Quarter</th>
            <th>Product A</th>
            <th>Product B</th>
            <th>Total</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Q1</td>
            <td>$10,000</td>
            <td>$15,000</td>
            <td>$25,000</td>
        </tr>
        <tr>
            <td>Q2</td>
            <td>$12,000</td>
            <td>$18,000</td>
            <td>$30,000</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td><strong>Total</strong></td>
            <td><strong>$22,000</strong></td>
            <td><strong>$33,000</strong></td>
            <td><strong>$55,000</strong></td>
        </tr>
    </tfoot>
</table>
```

### 2. Table Sections

-   `<thead>`: Groups header content
-   `<tbody>`: Groups body content
-   `<tfoot>`: Groups footer content
-   `<caption>`: Provides table description

### 3. Column Groups

```html
<table>
    <caption>
        Employee Information
    </caption>
    <colgroup>
        <col />
        <col span="2" style="background-color: #f0f0f0;" />
        <col />
    </colgroup>
    <thead>
        <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Salary</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Alice Johnson</td>
            <td>Engineering</td>
            <td>Developer</td>
            <td>$70,000</td>
        </tr>
    </tbody>
</table>
```

---

## Advanced Table Features

### 1. Spanning Cells

```html
<table>
    <tr>
        <th colspan="3">Sales Report 2024</th>
    </tr>
    <tr>
        <th>Product</th>
        <th>Q1</th>
        <th>Q2</th>
    </tr>
    <tr>
        <td>Laptops</td>
        <td>100</td>
        <td>120</td>
    </tr>
    <tr>
        <td>Phones</td>
        <td>200</td>
        <td>180</td>
    </tr>
</table>

<!-- Rowspan example -->
<table>
    <tr>
        <th>Product</th>
        <th>Details</th>
    </tr>
    <tr>
        <td rowspan="2">Laptop</td>
        <td>Model A - $999</td>
    </tr>
    <tr>
        <td>Model B - $1299</td>
    </tr>
</table>
```

### 2. Accessible Tables

```html
<table>
    <caption>
        Monthly Budget Breakdown
    </caption>
    <thead>
        <tr>
            <th scope="col">Category</th>
            <th scope="col">January</th>
            <th scope="col">February</th>
            <th scope="col">March</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Housing</th>
            <td>$1,200</td>
            <td>$1,200</td>
            <td>$1,250</td>
        </tr>
        <tr>
            <th scope="row">Food</th>
            <td>$400</td>
            <td>$450</td>
            <td>$425</td>
        </tr>
    </tbody>
</table>
```

### 3. Complex Tables with Headers

```html
<table>
    <caption>
        Product Comparison
    </caption>
    <thead>
        <tr>
            <th rowspan="2">Feature</th>
            <th colspan="3">Products</th>
        </tr>
        <tr>
            <th>Basic</th>
            <th>Pro</th>
            <th>Enterprise</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Storage</th>
            <td>10GB</td>
            <td>100GB</td>
            <td>1TB</td>
        </tr>
        <tr>
            <th scope="row">Users</th>
            <td>1</td>
            <td>10</td>
            <td>Unlimited</td>
        </tr>
    </tbody>
</table>
```

---

## HTML Forms

### 1. Basic Form Structure

```html
<form action="/submit" method="post">
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required />

    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required />

    <button type="submit">Submit</button>
</form>
```

### 2. Form Elements Overview

-   `<form>`: Container for form elements
-   `<input>`: Various input types
-   `<label>`: Labels for form controls
-   `<textarea>`: Multi-line text input
-   `<select>`: Dropdown menus
-   `<button>`: Clickable buttons
-   `<fieldset>`: Groups related form elements
-   `<legend>`: Caption for fieldset

### 3. Labels and Accessibility

```html
<!-- Method 1: for attribute -->
<label for="email">Email Address:</label>
<input type="email" id="email" name="email" />

<!-- Method 2: nested input -->
<label>
    Phone Number:
    <input type="tel" name="phone" />
</label>
```

---

## Input Types and Attributes

### 1. Text Input Types

```html
<!-- Basic text -->
<input type="text" name="firstname" placeholder="Enter your first name" />

<!-- Email (with validation) -->
<input type="email" name="email" placeholder="user@example.com" />

<!-- Password -->
<input type="password" name="password" minlength="8" />

<!-- Phone number -->
<input type="tel" name="phone" placeholder="(123) 456-7890" />

<!-- URL -->
<input type="url" name="website" placeholder="https://example.com" />

<!-- Search -->
<input type="search" name="query" placeholder="Search..." />
```

### 2. Numeric Input Types

```html
<!-- Number -->
<input type="number" name="age" min="18" max="100" step="1" />

<!-- Range slider -->
<input type="range" name="volume" min="0" max="100" value="50" />

<!-- Date -->
<input type="date" name="birthday" min="1900-01-01" max="2024-12-31" />

<!-- Time -->
<input type="time" name="appointment" />

<!-- Date and time -->
<input type="datetime-local" name="meeting" />

<!-- Month -->
<input type="month" name="start-month" />

<!-- Week -->
<input type="week" name="vacation-week" />
```

### 3. Selection Input Types

```html
<!-- Radio buttons (single choice) -->
<fieldset>
    <legend>Choose your size:</legend>
    <label><input type="radio" name="size" value="small" /> Small</label>
    <label
        ><input type="radio" name="size" value="medium" checked /> Medium</label
    >
    <label><input type="radio" name="size" value="large" /> Large</label>
</fieldset>

<!-- Checkboxes (multiple choices) -->
<fieldset>
    <legend>Select your interests:</legend>
    <label
        ><input type="checkbox" name="interests" value="sports" /> Sports</label
    >
    <label
        ><input type="checkbox" name="interests" value="music" /> Music</label
    >
    <label
        ><input type="checkbox" name="interests" value="reading" />
        Reading</label
    >
</fieldset>

<!-- Dropdown select -->
<label for="country">Country:</label>
<select id="country" name="country">
    <option value="">Choose a country</option>
    <option value="us">United States</option>
    <option value="ca">Canada</option>
    <option value="uk">United Kingdom</option>
    <option value="au">Australia</option>
</select>

<!-- Multiple select -->
<label for="languages">Languages (hold Ctrl to select multiple):</label>
<select id="languages" name="languages" multiple>
    <option value="html">HTML</option>
    <option value="css">CSS</option>
    <option value="js">JavaScript</option>
    <option value="python">Python</option>
</select>
```

### 4. File and Other Input Types

```html
<!-- File upload -->
<label for="resume">Upload Resume:</label>
<input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" />

<!-- Multiple file upload -->
<label for="photos">Upload Photos:</label>
<input type="file" id="photos" name="photos" multiple accept="image/*" />

<!-- Color picker -->
<label for="color">Choose color:</label>
<input type="color" id="color" name="color" value="#ff0000" />

<!-- Hidden input -->
<input type="hidden" name="user_id" value="12345" />

<!-- Submit and reset buttons -->
<input type="submit" value="Send Form" />
<input type="reset" value="Clear Form" />
<button type="submit">Submit with Button</button>
```

### 5. Textarea

```html
<label for="message">Message:</label>
<textarea
    id="message"
    name="message"
    rows="5"
    cols="50"
    placeholder="Enter your message here..."
></textarea>

<!-- Textarea with character limit -->
<label for="bio">Bio (max 500 characters):</label>
<textarea id="bio" name="bio" maxlength="500" rows="4" cols="50"></textarea>
```

---

## Form Validation

### 1. HTML5 Validation Attributes

```html
<form>
    <!-- Required field -->
    <label for="name">Name (required):</label>
    <input type="text" id="name" name="name" required />

    <!-- Length validation -->
    <label for="username">Username (3-20 characters):</label>
    <input
        type="text"
        id="username"
        name="username"
        minlength="3"
        maxlength="20"
        required
    />

    <!-- Pattern validation -->
    <label for="phone">Phone (XXX-XXX-XXXX):</label>
    <input
        type="tel"
        id="phone"
        name="phone"
        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
        placeholder="123-456-7890"
    />

    <!-- Number range -->
    <label for="age">Age (18-100):</label>
    <input type="number" id="age" name="age" min="18" max="100" required />

    <button type="submit">Submit</button>
</form>
```

### 2. Custom Validation Messages

```html
<form>
    <label for="email">Email:</label>
    <input
        type="email"
        id="email"
        name="email"
        required
        title="Please enter a valid email address"
    />

    <label for="password">Password:</label>
    <input
        type="password"
        id="password"
        name="password"
        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
        title="Must contain at least one number, one uppercase and lowercase letter, and at least 8 characters"
    />

    <button type="submit">Submit</button>
</form>
```

---

## Practical Examples

### Example 1: Contact Form

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Contact Us</title>
    </head>
    <body>
        <h1>Contact Us</h1>

        <form action="/contact" method="post">
            <fieldset>
                <legend>Personal Information</legend>

                <label for="first-name">First Name:</label>
                <input type="text" id="first-name" name="first_name" required />

                <label for="last-name">Last Name:</label>
                <input type="text" id="last-name" name="last_name" required />

                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required />

                <label for="phone">Phone (optional):</label>
                <input type="tel" id="phone" name="phone" />
            </fieldset>

            <fieldset>
                <legend>Message Details</legend>

                <label for="subject">Subject:</label>
                <select id="subject" name="subject" required>
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="other">Other</option>
                </select>

                <label for="message">Message:</label>
                <textarea
                    id="message"
                    name="message"
                    rows="6"
                    cols="50"
                    placeholder="Please describe your inquiry..."
                    required
                ></textarea>
            </fieldset>

            <fieldset>
                <legend>Contact Preferences</legend>

                <label>
                    <input type="checkbox" name="newsletter" value="yes" />
                    Subscribe to our newsletter
                </label>

                <label>Preferred contact method:</label>
                <label
                    ><input
                        type="radio"
                        name="contact_method"
                        value="email"
                        checked
                    />
                    Email</label
                >
                <label
                    ><input type="radio" name="contact_method" value="phone" />
                    Phone</label
                >
            </fieldset>

            <button type="submit">Send Message</button>
            <button type="reset">Clear Form</button>
        </form>
    </body>
</html>
```

### Example 2: Data Table with Forms

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Employee Management</title>
    </head>
    <body>
        <h1>Employee Database</h1>

        <!-- Employee Table -->
        <table>
            <caption>
                Current Employees
            </caption>
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Department</th>
                    <th scope="col">Position</th>
                    <th scope="col">Salary</th>
                    <th scope="col">Start Date</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>001</td>
                    <td>John Smith</td>
                    <td>Engineering</td>
                    <td>Senior Developer</td>
                    <td>$85,000</td>
                    <td>2020-03-15</td>
                </tr>
                <tr>
                    <td>002</td>
                    <td>Sarah Johnson</td>
                    <td>Marketing</td>
                    <td>Marketing Manager</td>
                    <td>$75,000</td>
                    <td>2019-07-22</td>
                </tr>
                <tr>
                    <td>003</td>
                    <td>Mike Brown</td>
                    <td>Sales</td>
                    <td>Sales Representative</td>
                    <td>$60,000</td>
                    <td>2021-11-08</td>
                </tr>
            </tbody>
        </table>

        <h2>Add New Employee</h2>

        <!-- Add Employee Form -->
        <form action="/add-employee" method="post">
            <label for="emp-name">Full Name:</label>
            <input type="text" id="emp-name" name="name" required />

            <label for="department">Department:</label>
            <select id="department" name="department" required>
                <option value="">Select Department</option>
                <option value="engineering">Engineering</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="hr">Human Resources</option>
            </select>

            <label for="position">Position:</label>
            <input type="text" id="position" name="position" required />

            <label for="salary">Salary:</label>
            <input
                type="number"
                id="salary"
                name="salary"
                min="30000"
                max="200000"
                step="1000"
                required
            />

            <label for="start-date">Start Date:</label>
            <input type="date" id="start-date" name="start_date" required />

            <button type="submit">Add Employee</button>
        </form>
    </body>
</html>
```

---

## Exercises

### Exercise 1: Student Grade Table

Create a table displaying:

-   Student names, subjects, and grades
-   Use proper table structure (thead, tbody, tfoot)
-   Include a row with average grades
-   Add a caption describing the table

### Exercise 2: Registration Form

Build a complete registration form with:

-   Personal information (name, email, phone)
-   Account details (username, password with confirmation)
-   Preferences (newsletter subscription, contact method)
-   Proper validation attributes
-   Fieldsets to group related information

### Exercise 3: Product Comparison Table

Create a product comparison table:

-   Multiple products with various features
-   Use colspan and rowspan where appropriate
-   Include pricing information
-   Make it accessible with proper scope attributes

### Exercise 4: Survey Form

Design a survey form including:

-   Various input types (text, radio, checkbox, select)
-   Rating scales using radio buttons or range inputs
-   Text areas for comments
-   File upload for attachments
-   Form validation

---

## 🎯 Key Takeaways

1. **Tables are for data**, not layout - use them for tabular information
2. **Always use labels** with form inputs for accessibility
3. **Group related content** with fieldsets and legends
4. **Use appropriate input types** for better user experience and validation
5. **Include proper validation** to improve data quality
6. **Test forms thoroughly** across different browsers and devices

---

## 🚀 Next Phase Preview

In **Phase 5: Semantic HTML**, you'll learn:

-   HTML5 semantic elements (header, nav, main, article, section, aside, footer)
-   Document structure and accessibility
-   SEO-friendly markup
-   Modern HTML best practices

---

## 📝 Quick Reference

### Table Structure:

```html
<table>
    <caption>
        Table Description
    </caption>
    <thead>
        <tr>
            <th scope="col">Header</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Data</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td>Footer</td>
        </tr>
    </tfoot>
</table>
```

### Form Basics:

```html
<form action="/submit" method="post">
    <label for="input-id">Label:</label>
    <input type="text" id="input-id" name="field-name" required />
    <button type="submit">Submit</button>
</form>
```

### Common Input Types:

-   `text`, `email`, `password`, `tel`, `url`
-   `number`, `range`, `date`, `time`
-   `radio`, `checkbox`, `select`, `textarea`
-   `file`, `color`, `hidden`

**Ready for Phase 5?** You've mastered tables and forms!
