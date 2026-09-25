# Filtering and Sorting Data

## Introduction to Data Filtering 🔍

Filtering allows you to retrieve only the rows that meet specific criteria, while sorting helps organize the results in a meaningful order. These are essential skills for effective data analysis and reporting.

## The WHERE Clause - Basic Filtering 📋

### Simple Conditions

```sql
-- Exact match
SELECT * FROM employees WHERE dept_id = 1;
SELECT * FROM employees WHERE first_name = 'John';
SELECT * FROM employees WHERE is_active = TRUE;

-- Numeric comparisons
SELECT * FROM employees WHERE salary > 70000;
SELECT * FROM employees WHERE salary >= 75000;
SELECT * FROM employees WHERE salary < 60000;
SELECT * FROM employees WHERE salary <= 80000;
SELECT * FROM employees WHERE salary <> 75000;  -- Not equal
SELECT * FROM employees WHERE salary != 75000;  -- Not equal (alternative)
```

### Working with Dates

```sql
-- Date comparisons
SELECT * FROM employees WHERE hire_date = '2024-01-15';
SELECT * FROM employees WHERE hire_date > '2024-01-01';
SELECT * FROM employees WHERE hire_date >= '2024-01-01' AND hire_date < '2024-02-01';

-- Date functions
SELECT * FROM employees WHERE YEAR(hire_date) = 2024;
SELECT * FROM employees WHERE MONTH(hire_date) = 1;  -- January hires
SELECT * FROM employees WHERE DAYOFWEEK(hire_date) = 2;  -- Monday hires

-- Recent records
SELECT * FROM employees WHERE hire_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY);
SELECT * FROM employees WHERE hire_date >= DATE_ADD('2024-01-01', INTERVAL 6 MONTH);
```

### String Comparisons

```sql
-- Case-sensitive comparison (depends on collation)
SELECT * FROM employees WHERE first_name = 'john';  -- May not match 'John'

-- Case-insensitive comparison
SELECT * FROM employees WHERE LOWER(first_name) = 'john';
SELECT * FROM employees WHERE UPPER(first_name) = 'JOHN';

-- String functions in conditions
SELECT * FROM employees WHERE LENGTH(last_name) > 5;
SELECT * FROM employees WHERE SUBSTRING(email, 1, 4) = 'john';
```

## Logical Operators 🔗

### AND Operator

```sql
-- Multiple conditions must be true
SELECT * FROM employees
WHERE dept_id = 1 AND salary > 70000;

SELECT * FROM employees
WHERE hire_date >= '2024-01-01'
  AND hire_date < '2024-07-01'
  AND is_active = TRUE;

-- Complex AND conditions
SELECT * FROM employees
WHERE (salary >= 70000 AND salary <= 90000)
  AND dept_id IN (1, 2)
  AND hire_date > '2023-01-01';
```

### OR Operator

```sql
-- Any condition can be true
SELECT * FROM employees
WHERE dept_id = 1 OR dept_id = 2;

SELECT * FROM employees
WHERE salary < 50000 OR salary > 100000;

-- Mixing AND and OR (use parentheses!)
SELECT * FROM employees
WHERE (dept_id = 1 OR dept_id = 2)
  AND salary > 70000;

-- Multiple OR conditions
SELECT * FROM employees
WHERE first_name = 'John'
   OR first_name = 'Jane'
   OR first_name = 'Bob';
```

### NOT Operator

```sql
-- Negate conditions
SELECT * FROM employees WHERE NOT dept_id = 1;
SELECT * FROM employees WHERE NOT (salary > 70000 AND dept_id = 1);

-- Alternative syntax
SELECT * FROM employees WHERE dept_id != 1;
SELECT * FROM employees WHERE dept_id <> 1;
```

## Advanced Filtering Operators 🎯

### IN Operator

```sql
-- Check if value is in a list
SELECT * FROM employees WHERE dept_id IN (1, 2, 3);
SELECT * FROM employees WHERE first_name IN ('John', 'Jane', 'Bob');

-- Using subquery with IN
SELECT * FROM employees
WHERE dept_id IN (
    SELECT dept_id FROM departments WHERE budget > 200000
);

-- NOT IN
SELECT * FROM employees WHERE dept_id NOT IN (1, 2);
```

### BETWEEN Operator

```sql
-- Range conditions (inclusive)
SELECT * FROM employees WHERE salary BETWEEN 60000 AND 80000;
SELECT * FROM employees WHERE hire_date BETWEEN '2024-01-01' AND '2024-06-30';

-- NOT BETWEEN
SELECT * FROM employees WHERE salary NOT BETWEEN 70000 AND 90000;

-- BETWEEN with dates
SELECT * FROM projects
WHERE start_date BETWEEN '2024-01-01' AND '2024-12-31';
```

### LIKE Operator - Pattern Matching

```sql
-- Wildcard patterns
SELECT * FROM employees WHERE first_name LIKE 'J%';     -- Starts with 'J'
SELECT * FROM employees WHERE last_name LIKE '%son';    -- Ends with 'son'
SELECT * FROM employees WHERE email LIKE '%@gmail.%';   -- Contains '@gmail.'

-- Single character wildcard
SELECT * FROM employees WHERE first_name LIKE 'J_n';    -- 'Jon', 'Jan', etc.

-- Case-insensitive LIKE (MySQL uses collation, PostgreSQL use ILIKE)
SELECT * FROM employees WHERE first_name LIKE 'j%';     -- May be case-insensitive
SELECT * FROM employees WHERE first_name ILIKE 'j%';    -- PostgreSQL case-insensitive

-- NOT LIKE
SELECT * FROM employees WHERE email NOT LIKE '%@company.com';
```

### NULL Handling

```sql
-- Check for NULL values
SELECT * FROM employees WHERE phone IS NULL;
SELECT * FROM employees WHERE dept_id IS NULL;

-- Check for NOT NULL values
SELECT * FROM employees WHERE phone IS NOT NULL;

-- NULL in comparisons (always returns NULL/false)
SELECT * FROM employees WHERE phone = NULL;      -- Wrong! Returns no rows
SELECT * FROM employees WHERE phone <> NULL;     -- Wrong! Returns no rows

-- Handling NULL in conditions
SELECT * FROM employees
WHERE phone IS NOT NULL OR email IS NOT NULL;
```

## CASE Statement - Conditional Logic 🎭

### Simple CASE

```sql
-- Create categories based on salary
SELECT
    first_name,
    last_name,
    salary,
    CASE
        WHEN salary < 60000 THEN 'Entry Level'
        WHEN salary < 80000 THEN 'Mid Level'
        WHEN salary < 100000 THEN 'Senior Level'
        ELSE 'Executive Level'
    END AS salary_category
FROM employees;
```

### CASE in WHERE Clause

```sql
-- Dynamic filtering based on conditions
SELECT * FROM employees
WHERE
    CASE
        WHEN dept_id = 1 THEN salary > 70000
        WHEN dept_id = 2 THEN salary > 60000
        ELSE salary > 50000
    END;
```

### Searched CASE

```sql
-- Complex conditional logic
SELECT
    first_name,
    last_name,
    hire_date,
    CASE
        WHEN DATEDIFF(CURRENT_DATE(), hire_date) < 90 THEN 'New Hire'
        WHEN DATEDIFF(CURRENT_DATE(), hire_date) < 365 THEN 'Recent Hire'
        WHEN DATEDIFF(CURRENT_DATE(), hire_date) < 1095 THEN 'Experienced'
        ELSE 'Veteran'
    END AS experience_level
FROM employees;
```

## ORDER BY - Sorting Results 📊

### Basic Sorting

```sql
-- Sort by single column (ascending by default)
SELECT * FROM employees ORDER BY last_name;
SELECT * FROM employees ORDER BY last_name ASC;  -- Explicit ascending

-- Sort descending
SELECT * FROM employees ORDER BY salary DESC;
SELECT * FROM employees ORDER BY hire_date DESC;
```

### Multiple Column Sorting

```sql
-- Sort by multiple columns
SELECT * FROM employees
ORDER BY dept_id ASC, salary DESC;

SELECT * FROM employees
ORDER BY last_name ASC, first_name ASC, hire_date DESC;

-- Sort with different directions
SELECT * FROM employees
ORDER BY
    dept_id ASC,           -- Department ascending
    salary DESC,           -- Salary descending within department
    last_name ASC;         -- Name ascending within salary group
```

### Sorting with Expressions

```sql
-- Sort by calculated values
SELECT
    first_name,
    last_name,
    salary,
    salary * 12 AS annual_salary
FROM employees
ORDER BY salary * 12 DESC;

-- Sort by functions
SELECT * FROM employees
ORDER BY LENGTH(last_name) DESC, last_name ASC;

-- Sort by CASE expression
SELECT
    first_name,
    last_name,
    dept_id
FROM employees
ORDER BY
    CASE dept_id
        WHEN 1 THEN 1  -- Engineering first
        WHEN 2 THEN 2  -- Marketing second
        WHEN 3 THEN 3  -- Sales third
        ELSE 4         -- Others last
    END;
```

### Sorting with NULL Values

```sql
-- NULL values behavior (database-specific)
SELECT * FROM employees ORDER BY phone;  -- NULLs first or last?

-- Explicit NULL handling
SELECT * FROM employees
ORDER BY phone IS NULL, phone;  -- NULLs last

SELECT * FROM employees
ORDER BY phone IS NULL DESC, phone;  -- NULLs first

-- MySQL specific
SELECT * FROM employees ORDER BY phone ASC;   -- NULLs first
SELECT * FROM employees ORDER BY phone DESC;  -- NULLs last

-- PostgreSQL specific
SELECT * FROM employees ORDER BY phone NULLS FIRST;
SELECT * FROM employees ORDER BY phone NULLS LAST;
```

## LIMIT and OFFSET - Result Pagination 📄

### Basic LIMIT

```sql
-- Get first 10 rows
SELECT * FROM employees LIMIT 10;

-- Get top 5 highest paid employees
SELECT * FROM employees
ORDER BY salary DESC
LIMIT 5;

-- Get oldest 3 employees
SELECT * FROM employees
ORDER BY hire_date ASC
LIMIT 3;
```

### LIMIT with OFFSET (Pagination)

```sql
-- Skip first 10 rows, get next 10 (page 2)
SELECT * FROM employees LIMIT 10 OFFSET 10;

-- Alternative MySQL syntax
SELECT * FROM employees LIMIT 10, 10;  -- LIMIT offset, count

-- Pagination examples
SELECT * FROM employees ORDER BY emp_id LIMIT 20 OFFSET 0;   -- Page 1 (rows 1-20)
SELECT * FROM employees ORDER BY emp_id LIMIT 20 OFFSET 20;  -- Page 2 (rows 21-40)
SELECT * FROM employees ORDER BY emp_id LIMIT 20 OFFSET 40;  -- Page 3 (rows 41-60)
```

### Database-Specific Pagination

```sql
-- SQL Server - TOP and OFFSET/FETCH
SELECT TOP 10 * FROM employees ORDER BY salary DESC;

SELECT * FROM employees
ORDER BY salary DESC
OFFSET 10 ROWS
FETCH NEXT 10 ROWS ONLY;

-- Oracle - ROWNUM and ROW_NUMBER()
SELECT * FROM employees WHERE ROWNUM <= 10;

SELECT * FROM (
    SELECT e.*, ROW_NUMBER() OVER (ORDER BY salary DESC) as rn
    FROM employees e
) WHERE rn BETWEEN 11 AND 20;

-- PostgreSQL - LIMIT and OFFSET (same as MySQL)
SELECT * FROM employees ORDER BY salary DESC LIMIT 10 OFFSET 20;
```

## Combining Multiple Conditions 🔀

### Complex WHERE Clauses

```sql
-- Complex business logic
SELECT * FROM employees
WHERE (
    (dept_id = 1 AND salary > 75000) OR
    (dept_id = 2 AND salary > 65000) OR
    (dept_id = 3 AND salary > 55000)
) AND is_active = TRUE
  AND hire_date > '2023-01-01';

-- Date range with multiple conditions
SELECT * FROM employees
WHERE hire_date BETWEEN '2024-01-01' AND '2024-06-30'
  AND salary BETWEEN 60000 AND 90000
  AND dept_id IN (1, 2, 3)
  AND email LIKE '%@company.com';
```

### Subqueries in WHERE

```sql
-- Employees in departments with high budget
SELECT * FROM employees
WHERE dept_id IN (
    SELECT dept_id FROM departments WHERE budget > 300000
);

-- Employees earning above average
SELECT * FROM employees
WHERE salary > (
    SELECT AVG(salary) FROM employees
);

-- Employees in same department as 'John Doe'
SELECT * FROM employees
WHERE dept_id = (
    SELECT dept_id FROM employees
    WHERE first_name = 'John' AND last_name = 'Doe'
);
```

## Practical Examples 🎯

### Employee Queries

```sql
-- Recent high-performing employees
SELECT
    first_name,
    last_name,
    hire_date,
    salary,
    DATEDIFF(CURRENT_DATE(), hire_date) AS days_employed
FROM employees
WHERE hire_date >= '2024-01-01'
  AND salary > 70000
ORDER BY salary DESC, hire_date ASC;

-- Employees due for performance review (hired exactly 1 year ago)
SELECT * FROM employees
WHERE DATE(hire_date) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR);

-- Senior employees by department
SELECT
    dept_id,
    first_name,
    last_name,
    salary,
    hire_date
FROM employees
WHERE salary > (
    SELECT AVG(salary) FROM employees e2
    WHERE e2.dept_id = employees.dept_id
)
ORDER BY dept_id, salary DESC;
```

### Project Queries

```sql
-- Active projects with budget analysis
SELECT
    project_name,
    budget,
    DATEDIFF(end_date, start_date) AS duration_days,
    budget / DATEDIFF(end_date, start_date) AS daily_budget
FROM projects
WHERE status = 'active'
  AND start_date <= CURRENT_DATE()
  AND end_date >= CURRENT_DATE()
ORDER BY daily_budget DESC;

-- Overdue projects
SELECT * FROM projects
WHERE status IN ('planning', 'active')
  AND end_date < CURRENT_DATE()
ORDER BY end_date ASC;
```

### Department Analysis

```sql
-- Department employee distribution
SELECT
    d.dept_name,
    COUNT(e.emp_id) AS employee_count,
    AVG(e.salary) AS avg_salary,
    MAX(e.salary) AS max_salary,
    MIN(e.salary) AS min_salary
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
WHERE e.is_active = TRUE
GROUP BY d.dept_id, d.dept_name
HAVING COUNT(e.emp_id) > 0
ORDER BY employee_count DESC;
```

## Performance Considerations 🚀

### Index-Friendly Queries

```sql
-- Good: Uses index on dept_id
SELECT * FROM employees WHERE dept_id = 1;

-- Potentially slower: Function on indexed column
SELECT * FROM employees WHERE UPPER(first_name) = 'JOHN';

-- Better: Store consistent case or use functional index
SELECT * FROM employees WHERE first_name = 'John';
```

### Efficient Date Filtering

```sql
-- Good: Range query can use index
SELECT * FROM employees
WHERE hire_date >= '2024-01-01' AND hire_date < '2024-02-01';

-- Slower: Function prevents index usage
SELECT * FROM employees WHERE YEAR(hire_date) = 2024 AND MONTH(hire_date) = 1;
```

### LIMIT for Large Results

```sql
-- Good: Limits memory usage
SELECT * FROM employees
WHERE dept_id = 1
ORDER BY salary DESC
LIMIT 100;

-- Be careful: Large OFFSET can be slow
SELECT * FROM employees
ORDER BY emp_id
LIMIT 100 OFFSET 100000;  -- Can be slow with large offset
```

## Common Mistakes and Solutions ❗

### Mistake 1: Missing Parentheses

```sql
-- Wrong: Ambiguous logic
SELECT * FROM employees
WHERE dept_id = 1 OR dept_id = 2 AND salary > 70000;  -- Which gets priority?

-- Correct: Clear logic with parentheses
SELECT * FROM employees
WHERE (dept_id = 1 OR dept_id = 2) AND salary > 70000;
```

### Mistake 2: NULL Comparisons

```sql
-- Wrong: NULL comparisons
SELECT * FROM employees WHERE phone = NULL;     -- Returns no rows
SELECT * FROM employees WHERE phone != NULL;    -- Returns no rows

-- Correct: NULL checks
SELECT * FROM employees WHERE phone IS NULL;
SELECT * FROM employees WHERE phone IS NOT NULL;
```

### Mistake 3: String Case Sensitivity

```sql
-- May not work as expected (depends on collation)
SELECT * FROM employees WHERE first_name = 'john';

-- Safer approach
SELECT * FROM employees WHERE LOWER(first_name) = LOWER('john');
```

## Practice Exercises 💪

### Exercise 1: Employee Filtering

```sql
-- 1. Find all employees hired in the last 6 months
-- 2. Get employees with salary between 60K and 80K
-- 3. Find employees whose email ends with '@company.com'
-- 4. List employees from Engineering or Marketing departments
-- 5. Find employees with missing phone numbers
```

### Exercise 2: Complex Queries

```sql
-- 1. Get top 10 highest paid employees from each department
-- 2. Find employees hired on weekends
-- 3. List employees whose first name starts with vowels
-- 4. Get employees earning above their department average
-- 5. Find the most recently hired employee from each department
```

### Exercise 3: Date and Sorting

```sql
-- 1. Sort employees by years of service (longest first)
-- 2. Get employees hired in Q1 2024, sorted by salary
-- 3. Find employees with birthdays this month (if you have birth_date)
-- 4. List projects ending in the next 30 days
-- 5. Get employee anniversaries for the current month
```

## Next Steps ➡️

You've now mastered filtering and sorting - the foundation of data analysis! Next, we'll explore JOINs, which allow you to combine data from multiple tables for more comprehensive queries.

---

## Quick Reference 📚

### WHERE Clause Operators

```sql
=, !=, <>, <, <=, >, >=          -- Comparison
AND, OR, NOT                     -- Logical
IN, NOT IN                       -- List membership
BETWEEN, NOT BETWEEN             -- Range
LIKE, NOT LIKE                   -- Pattern matching
IS NULL, IS NOT NULL             -- NULL checks
```

### ORDER BY Examples

```sql
ORDER BY column ASC              -- Ascending (default)
ORDER BY column DESC             -- Descending
ORDER BY col1 ASC, col2 DESC     -- Multiple columns
ORDER BY 1, 2                    -- By column position
```

### LIMIT Examples

```sql
LIMIT 10                         -- First 10 rows
LIMIT 10 OFFSET 20              -- Skip 20, get 10
LIMIT 20, 10                    -- MySQL: offset, count
```
