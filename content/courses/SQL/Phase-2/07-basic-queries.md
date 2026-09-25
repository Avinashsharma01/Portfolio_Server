# Basic SQL Queries - CRUD Operations

## What are CRUD Operations? 🔄

**CRUD** stands for the four basic operations you can perform on data:

-   **C**reate (INSERT) - Add new data
-   **R**ead (SELECT) - Retrieve existing data
-   **U**pdate (UPDATE) - Modify existing data
-   **D**elete (DELETE) - Remove data

These operations form the foundation of database interaction.

## Sample Database Setup 🗃️

Let's create a sample database to practice with:

```sql
-- Create and use database
CREATE DATABASE company_db;
USE company_db;

-- Create tables for practice
CREATE TABLE departments (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    budget DECIMAL(12,2)
);

CREATE TABLE employees (
    emp_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2),
    dept_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    project_name VARCHAR(200) NOT NULL,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning'
);
```

## CREATE - INSERT Operations 📝

### Basic INSERT Syntax

```sql
-- Insert single row with all columns
INSERT INTO departments (dept_name, location, budget)
VALUES ('Engineering', 'New York', 500000.00);

-- Insert single row with specific columns
INSERT INTO departments (dept_name, location)
VALUES ('Marketing', 'Los Angeles');

-- Insert multiple rows at once
INSERT INTO departments (dept_name, location, budget) VALUES
    ('Sales', 'Chicago', 300000.00),
    ('HR', 'New York', 150000.00),
    ('Finance', 'Boston', 250000.00);
```

### INSERT with All Columns

```sql
-- When inserting all columns in order, you can omit column names
INSERT INTO employees VALUES
(1, 'John', 'Doe', 'john.doe@company.com', '555-0123', '2024-01-15', 75000.00, 1, TRUE);

-- Better practice: Always specify columns
INSERT INTO employees (first_name, last_name, email, phone, hire_date, salary, dept_id)
VALUES ('Jane', 'Smith', 'jane.smith@company.com', '555-0124', '2024-02-01', 80000.00, 1);
```

### INSERT with Functions and Expressions

```sql
-- Using functions in INSERT
INSERT INTO employees (first_name, last_name, email, hire_date, salary, dept_id)
VALUES
    ('Alice', 'Johnson', 'alice.johnson@company.com', CURRENT_DATE(), 70000.00, 2),
    ('Bob', 'Wilson', 'bob.wilson@company.com', '2024-03-01', 65000.00, 3);

-- Using calculations
INSERT INTO projects (project_name, start_date, end_date, budget)
VALUES ('Website Redesign', '2024-08-01', DATE_ADD('2024-08-01', INTERVAL 6 MONTH), 75000.00);
```

### INSERT with SELECT (Copy Data)

```sql
-- Insert data from another table
CREATE TABLE employees_backup (
    emp_id INT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100)
);

-- Copy specific employees to backup table
INSERT INTO employees_backup (emp_id, first_name, last_name, email)
SELECT emp_id, first_name, last_name, email
FROM employees
WHERE dept_id = 1;
```

### Handling Duplicate Keys

```sql
-- INSERT IGNORE - Skip duplicates without error
INSERT IGNORE INTO departments (dept_name, location)
VALUES ('Engineering', 'San Francisco');  -- Won't insert if duplicate

-- ON DUPLICATE KEY UPDATE - Update if duplicate exists
INSERT INTO employees (emp_id, first_name, last_name, email, salary)
VALUES (1, 'John', 'Doe', 'john.doe@company.com', 78000.00)
ON DUPLICATE KEY UPDATE
    salary = VALUES(salary),
    first_name = VALUES(first_name);
```

## READ - SELECT Operations 📖

### Basic SELECT Syntax

```sql
-- Select all columns
SELECT * FROM employees;

-- Select specific columns
SELECT first_name, last_name, email FROM employees;

-- Select with column aliases
SELECT
    first_name AS "First Name",
    last_name AS "Last Name",
    salary AS "Annual Salary"
FROM employees;
```

### SELECT with Calculations

```sql
-- Calculated columns
SELECT
    first_name,
    last_name,
    salary,
    salary / 12 AS monthly_salary,
    salary * 1.1 AS salary_with_raise,
    CONCAT(first_name, ' ', last_name) AS full_name
FROM employees;

-- Using functions
SELECT
    UPPER(first_name) AS first_name_upper,
    LOWER(last_name) AS last_name_lower,
    LENGTH(email) AS email_length,
    YEAR(hire_date) AS hire_year
FROM employees;
```

### DISTINCT - Remove Duplicates

```sql
-- Get unique values
SELECT DISTINCT dept_id FROM employees;

-- Get unique combinations
SELECT DISTINCT dept_id, is_active FROM employees;

-- Count unique values
SELECT COUNT(DISTINCT dept_id) AS department_count FROM employees;
```

### LIMIT - Restrict Number of Rows

```sql
-- Get first 5 employees
SELECT * FROM employees LIMIT 5;

-- Skip first 5, then get next 5 (pagination)
SELECT * FROM employees LIMIT 5 OFFSET 5;

-- Alternative syntax for LIMIT with OFFSET
SELECT * FROM employees LIMIT 5, 5;  -- MySQL syntax
```

## UPDATE Operations ✏️

### Basic UPDATE Syntax

```sql
-- Update single column
UPDATE employees
SET salary = 82000.00
WHERE emp_id = 2;

-- Update multiple columns
UPDATE employees
SET
    salary = 85000.00,
    phone = '555-9999'
WHERE emp_id = 1;
```

### UPDATE with Calculations

```sql
-- Give everyone a 5% raise
UPDATE employees
SET salary = salary * 1.05;

-- Give raise to specific department
UPDATE employees
SET salary = salary * 1.10
WHERE dept_id = 1;

-- Update with functions
UPDATE employees
SET email = LOWER(email);
```

### UPDATE with JOIN (Advanced)

```sql
-- Update based on data from another table
UPDATE employees e
JOIN departments d ON e.dept_id = d.dept_id
SET e.salary = e.salary * 1.15
WHERE d.dept_name = 'Engineering';
```

### Conditional UPDATE

```sql
-- Update with CASE statement
UPDATE employees
SET salary = CASE
    WHEN dept_id = 1 THEN salary * 1.10  -- Engineering: 10% raise
    WHEN dept_id = 2 THEN salary * 1.08  -- Marketing: 8% raise
    WHEN dept_id = 3 THEN salary * 1.06  -- Sales: 6% raise
    ELSE salary * 1.03                   -- Others: 3% raise
END;
```

### Safe UPDATE Practices

```sql
-- Always use WHERE clause to avoid updating all rows
UPDATE employees
SET salary = 90000.00
WHERE emp_id = 1;  -- Specific employee only

-- Use SELECT first to verify your WHERE clause
SELECT * FROM employees WHERE dept_id = 1;  -- Check what will be updated
UPDATE employees SET salary = salary * 1.1 WHERE dept_id = 1;

-- Use LIMIT for safety (MySQL)
UPDATE employees
SET salary = 95000.00
WHERE first_name = 'John'
LIMIT 1;  -- Only update first match
```

## DELETE Operations 🗑️

### Basic DELETE Syntax

```sql
-- Delete specific row
DELETE FROM employees
WHERE emp_id = 5;

-- Delete multiple rows
DELETE FROM employees
WHERE dept_id = 4;

-- Delete with multiple conditions
DELETE FROM employees
WHERE dept_id = 2 AND salary < 50000;
```

### Conditional DELETE

```sql
-- Delete inactive employees
DELETE FROM employees
WHERE is_active = FALSE;

-- Delete old records
DELETE FROM employees
WHERE hire_date < '2020-01-01';

-- Delete using subquery
DELETE FROM employees
WHERE dept_id IN (
    SELECT dept_id
    FROM departments
    WHERE budget < 100000
);
```

### Safe DELETE Practices

```sql
-- Always test with SELECT first
SELECT * FROM employees WHERE hire_date < '2020-01-01';  -- See what will be deleted
DELETE FROM employees WHERE hire_date < '2020-01-01';

-- Use LIMIT for safety (MySQL)
DELETE FROM employees
WHERE is_active = FALSE
LIMIT 10;  -- Delete only 10 rows at a time

-- Soft delete instead of hard delete
UPDATE employees
SET is_active = FALSE, deleted_at = CURRENT_TIMESTAMP()
WHERE emp_id = 5;
```

### TRUNCATE vs DELETE

```sql
-- DELETE: Removes rows one by one, can use WHERE clause
DELETE FROM employees WHERE dept_id = 1;

-- TRUNCATE: Removes all rows quickly, resets auto-increment
TRUNCATE TABLE employees;  -- Faster, but removes ALL data

-- TRUNCATE vs DELETE comparison:
-- TRUNCATE: Faster, resets AUTO_INCREMENT, can't use WHERE
-- DELETE: Slower, preserves AUTO_INCREMENT, can use WHERE
```

## Working with NULL Values 🔍

### INSERT with NULL

```sql
-- Insert with NULL values
INSERT INTO employees (first_name, last_name, email, hire_date, dept_id)
VALUES ('Tom', 'Brown', 'tom.brown@company.com', '2024-04-01', NULL);  -- No department assigned
```

### SELECT with NULL

```sql
-- Find NULL values
SELECT * FROM employees WHERE dept_id IS NULL;
SELECT * FROM employees WHERE phone IS NULL;

-- Find NOT NULL values
SELECT * FROM employees WHERE dept_id IS NOT NULL;

-- Handle NULL in calculations
SELECT
    first_name,
    last_name,
    COALESCE(phone, 'No phone') AS phone_display,
    IFNULL(dept_id, 0) AS dept_display  -- MySQL function
FROM employees;
```

### UPDATE with NULL

```sql
-- Set value to NULL
UPDATE employees
SET phone = NULL
WHERE emp_id = 3;

-- Replace NULL with value
UPDATE employees
SET phone = '555-0000'
WHERE phone IS NULL;
```

## Common Patterns and Examples 🎯

### Data Entry Patterns

```sql
-- Employee onboarding
INSERT INTO employees (first_name, last_name, email, hire_date, dept_id, salary)
VALUES ('Sarah', 'Davis', 'sarah.davis@company.com', CURRENT_DATE(), 1, 72000.00);

-- Project creation
INSERT INTO projects (project_name, start_date, budget, status)
VALUES ('Mobile App Development', '2024-09-01', 120000.00, 'planning');

-- Department restructuring
UPDATE departments
SET budget = budget * 1.15
WHERE dept_name IN ('Engineering', 'Product');
```

### Data Maintenance Patterns

```sql
-- Archive old data
CREATE TABLE employees_archive AS
SELECT * FROM employees WHERE hire_date < '2020-01-01';

DELETE FROM employees WHERE hire_date < '2020-01-01';

-- Data cleanup
UPDATE employees
SET email = TRIM(LOWER(email));  -- Clean email format

DELETE FROM employees
WHERE email = '' OR email IS NULL;  -- Remove invalid records
```

### Reporting Patterns

```sql
-- Employee summary
SELECT
    dept_id,
    COUNT(*) AS employee_count,
    AVG(salary) AS average_salary,
    MAX(salary) AS highest_salary,
    MIN(salary) AS lowest_salary
FROM employees
GROUP BY dept_id;

-- Recent hires
SELECT first_name, last_name, hire_date
FROM employees
WHERE hire_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
ORDER BY hire_date DESC;
```

## Error Handling and Common Issues ⚠️

### Common INSERT Errors

```sql
-- Error: Duplicate key
-- Solution: Use INSERT IGNORE or ON DUPLICATE KEY UPDATE
INSERT IGNORE INTO employees (emp_id, first_name, last_name, email)
VALUES (1, 'John', 'Doe', 'john@company.com');

-- Error: Foreign key constraint
-- Solution: Ensure referenced record exists
INSERT INTO employees (first_name, last_name, email, dept_id)
VALUES ('New', 'Employee', 'new@company.com', 999);  -- Error if dept 999 doesn't exist

-- Check department exists first
SELECT * FROM departments WHERE dept_id = 999;
```

### Common UPDATE/DELETE Errors

```sql
-- Error: Updating all rows accidentally
-- Solution: Always use WHERE clause
UPDATE employees SET salary = 50000;  -- DANGEROUS! Updates all employees

-- Safe approach
UPDATE employees
SET salary = 50000
WHERE emp_id = 1;  -- Only update specific employee

-- Error: Foreign key constraint on DELETE
-- Solution: Handle dependent records first
DELETE FROM departments WHERE dept_id = 1;  -- Error if employees reference this dept

-- Safe approach
UPDATE employees SET dept_id = NULL WHERE dept_id = 1;  -- Remove references first
DELETE FROM departments WHERE dept_id = 1;  -- Then delete department
```

## Best Practices 🌟

### 1. Always Use WHERE Clauses

```sql
-- Good: Specific updates
UPDATE employees SET salary = 80000 WHERE emp_id = 1;

-- Dangerous: Affects all rows
UPDATE employees SET salary = 80000;  -- Avoid this!
```

### 2. Use Transactions for Multiple Operations

```sql
-- Start transaction
BEGIN;

-- Multiple related operations
INSERT INTO departments (dept_name, location) VALUES ('R&D', 'Seattle');
INSERT INTO employees (first_name, last_name, email, dept_id)
VALUES ('Research', 'Lead', 'research@company.com', LAST_INSERT_ID());

-- Commit if all successful
COMMIT;

-- Or rollback if something goes wrong
-- ROLLBACK;
```

### 3. Validate Data Before Operations

```sql
-- Check before INSERT
SELECT COUNT(*) FROM departments WHERE dept_name = 'New Department';

-- Check before UPDATE
SELECT * FROM employees WHERE dept_id = 1;  -- See what will be affected
UPDATE employees SET salary = salary * 1.1 WHERE dept_id = 1;

-- Check before DELETE
SELECT COUNT(*) FROM employees WHERE is_active = FALSE;  -- See how many will be deleted
DELETE FROM employees WHERE is_active = FALSE;
```

### 4. Use Meaningful Column Aliases

```sql
-- Good: Clear aliases
SELECT
    CONCAT(first_name, ' ', last_name) AS full_name,
    salary * 12 AS annual_salary,
    DATEDIFF(CURRENT_DATE(), hire_date) AS days_employed
FROM employees;

-- Avoid: Unclear aliases
SELECT
    CONCAT(first_name, ' ', last_name) AS col1,
    salary * 12 AS col2,
    DATEDIFF(CURRENT_DATE(), hire_date) AS col3
FROM employees;
```

## Practice Exercises 💪

### Exercise 1: Employee Management

```sql
-- 1. Add a new department 'IT Support' located in 'Remote'
-- 2. Add 3 new employees to this department
-- 3. Give all employees in 'Engineering' department a 10% raise
-- 4. Find all employees hired in the last 6 months
-- 5. Update phone numbers to a standard format
```

### Exercise 2: Data Cleanup

```sql
-- 1. Find employees with missing phone numbers
-- 2. Update all email addresses to lowercase
-- 3. Remove employees who haven't been active for 2 years
-- 4. Archive completed projects to a separate table
-- 5. Update department budgets based on employee count
```

### Exercise 3: Reporting Queries

```sql
-- 1. Count employees by department
-- 2. Find the highest and lowest paid employees
-- 3. List employees hired in each month of 2024
-- 4. Calculate total salary expense by department
-- 5. Find employees with salary above department average
```

## Next Steps ➡️

Now that you've mastered basic CRUD operations, we'll explore filtering and sorting data to create more sophisticated queries for data analysis and reporting.

---

## Quick Reference 📚

### CRUD Operations Summary

```sql
-- CREATE (INSERT)
INSERT INTO table_name (column1, column2) VALUES (value1, value2);

-- READ (SELECT)
SELECT column1, column2 FROM table_name WHERE condition;

-- UPDATE
UPDATE table_name SET column1 = value1 WHERE condition;

-- DELETE
DELETE FROM table_name WHERE condition;
```

### Safety Checklist ✅

-   ✅ Always use WHERE clauses in UPDATE/DELETE
-   ✅ Test SELECT before UPDATE/DELETE
-   ✅ Use transactions for multiple operations
-   ✅ Validate foreign key references
-   ✅ Handle NULL values appropriately
-   ✅ Use meaningful column aliases
