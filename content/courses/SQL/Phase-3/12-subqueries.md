# Subqueries - Queries Within Queries

## Introduction to Subqueries 🎯

A **subquery** (also called a nested query or inner query) is a query that is embedded within another SQL statement. Subqueries allow you to perform complex operations by breaking them down into logical steps, making your SQL more readable and powerful.

## Types of Subqueries 📋

### By Location:

-   **WHERE clause subqueries**: Filter main query results
-   **FROM clause subqueries**: Create derived tables
-   **SELECT clause subqueries**: Calculate values for result columns
-   **HAVING clause subqueries**: Filter grouped results

### By Result Type:

-   **Scalar subqueries**: Return single value (one row, one column)
-   **Row subqueries**: Return single row with multiple columns
-   **Column subqueries**: Return multiple rows, single column
-   **Table subqueries**: Return multiple rows and columns

### By Execution:

-   **Non-correlated subqueries**: Independent of outer query
-   **Correlated subqueries**: Reference columns from outer query

## Sample Database Setup 🗃️

Let's expand our sample database for subquery examples:

```sql
-- Enhanced sample database for subquery practice
USE join_practice;  -- From previous chapter

-- Add employee table
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    department VARCHAR(50),
    salary DECIMAL(10,2),
    hire_date DATE,
    manager_id INT,
    city VARCHAR(50)
);

INSERT INTO employees VALUES
(1, 'John', 'Smith', 'Sales', 60000, '2023-01-15', NULL, 'New York'),
(2, 'Jane', 'Doe', 'Marketing', 65000, '2023-02-01', 1, 'Los Angeles'),
(3, 'Bob', 'Johnson', 'Sales', 55000, '2023-03-01', 1, 'Chicago'),
(4, 'Alice', 'Brown', 'Engineering', 85000, '2022-12-01', NULL, 'San Francisco'),
(5, 'Charlie', 'Wilson', 'Engineering', 90000, '2022-11-15', 4, 'San Francisco'),
(6, 'Diana', 'Davis', 'Marketing', 70000, '2023-04-01', 2, 'Boston'),
(7, 'Eve', 'Miller', 'Sales', 58000, '2023-05-01', 1, 'Miami'),
(8, 'Frank', 'Garcia', 'Engineering', 92000, '2022-10-01', 4, 'Seattle');

-- Add department budgets table
CREATE TABLE department_budgets (
    department VARCHAR(50) PRIMARY KEY,
    annual_budget DECIMAL(12,2),
    budget_year INT
);

INSERT INTO department_budgets VALUES
('Sales', 500000, 2024),
('Marketing', 300000, 2024),
('Engineering', 800000, 2024),
('HR', 200000, 2024);
```

## Scalar Subqueries 🎯

Scalar subqueries return exactly one value (one row, one column) and can be used anywhere a single value is expected.

### Subqueries in SELECT Clause

```sql
-- Add calculated columns using scalar subqueries
SELECT
    first_name,
    last_name,
    salary,
    (SELECT AVG(salary) FROM employees) AS company_avg_salary,
    salary - (SELECT AVG(salary) FROM employees) AS salary_difference,
    ROUND(
        (salary / (SELECT AVG(salary) FROM employees) - 1) * 100, 2
    ) AS salary_percentage_diff
FROM employees
ORDER BY salary DESC;

-- Department-specific calculations
SELECT
    first_name,
    last_name,
    department,
    salary,
    (SELECT MAX(salary) FROM employees e2 WHERE e2.department = employees.department) AS dept_max_salary,
    (SELECT MIN(salary) FROM employees e2 WHERE e2.department = employees.department) AS dept_min_salary,
    (SELECT COUNT(*) FROM employees e2 WHERE e2.department = employees.department) AS dept_employee_count
FROM employees
ORDER BY department, salary DESC;
```

### Subqueries in WHERE Clause

```sql
-- Employees earning above average salary
SELECT first_name, last_name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Employees in departments with high budgets
SELECT first_name, last_name, department
FROM employees
WHERE department IN (
    SELECT department
    FROM department_budgets
    WHERE annual_budget > 400000
);

-- Latest hired employee
SELECT first_name, last_name, hire_date
FROM employees
WHERE hire_date = (SELECT MAX(hire_date) FROM employees);

-- Employees earning more than the highest paid person in Sales
SELECT first_name, last_name, department, salary
FROM employees
WHERE salary > (
    SELECT MAX(salary)
    FROM employees
    WHERE department = 'Sales'
);
```

## Column Subqueries with IN/NOT IN 📊

Column subqueries return multiple rows in a single column and are commonly used with IN, NOT IN, ANY, and ALL operators.

### IN and NOT IN

```sql
-- Customers who have placed orders
SELECT customer_id, first_name, last_name
FROM customers
WHERE customer_id IN (
    SELECT DISTINCT customer_id
    FROM orders
    WHERE customer_id IS NOT NULL
);

-- Customers who haven't placed orders
SELECT customer_id, first_name, last_name
FROM customers
WHERE customer_id NOT IN (
    SELECT customer_id
    FROM orders
    WHERE customer_id IS NOT NULL  -- Important: handle NULLs with NOT IN
);

-- Products that have been ordered
SELECT product_id, product_name, price
FROM products
WHERE product_id IN (
    SELECT DISTINCT product_id
    FROM order_items
);

-- Employees in cities where we have customers
SELECT employee_id, first_name, last_name, city
FROM employees
WHERE city IN (
    SELECT DISTINCT city
    FROM customers
    WHERE city IS NOT NULL
);
```

### ANY and ALL Operators

```sql
-- Employees earning more than ANY employee in Marketing
SELECT first_name, last_name, department, salary
FROM employees
WHERE salary > ANY (
    SELECT salary
    FROM employees
    WHERE department = 'Marketing'
);

-- Employees earning more than ALL employees in Sales
SELECT first_name, last_name, department, salary
FROM employees
WHERE salary > ALL (
    SELECT salary
    FROM employees
    WHERE department = 'Sales'
);

-- Products more expensive than ANY product in Electronics category
SELECT product_name, price
FROM products
WHERE price > ANY (
    SELECT price
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    WHERE c.category_name = 'Electronics'
);
```

## EXISTS and NOT EXISTS 🔍

EXISTS checks whether a subquery returns any rows. It's often more efficient than IN for large datasets.

### Basic EXISTS Examples

```sql
-- Customers who have placed orders (using EXISTS)
SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);

-- Customers who haven't placed orders (using NOT EXISTS)
SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);

-- Products that have been ordered (using EXISTS)
SELECT p.product_id, p.product_name
FROM products p
WHERE EXISTS (
    SELECT 1
    FROM order_items oi
    WHERE oi.product_id = p.product_id
);

-- Categories with products in stock
SELECT c.category_id, c.category_name
FROM categories c
WHERE EXISTS (
    SELECT 1
    FROM products p
    WHERE p.category_id = c.category_id
    AND p.stock_quantity > 0
);
```

### Complex EXISTS Conditions

```sql
-- Employees who work in the same city as any customer
SELECT e.employee_id, e.first_name, e.last_name, e.city
FROM employees e
WHERE EXISTS (
    SELECT 1
    FROM customers c
    WHERE c.city = e.city
);

-- Departments with employees earning above company average
SELECT DISTINCT department
FROM employees e1
WHERE EXISTS (
    SELECT 1
    FROM employees e2
    WHERE e2.department = e1.department
    AND e2.salary > (SELECT AVG(salary) FROM employees)
);

-- Customers who have ordered from multiple categories
SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
WHERE EXISTS (
    SELECT p1.category_id
    FROM orders o1
    JOIN order_items oi1 ON o1.order_id = oi1.order_id
    JOIN products p1 ON oi1.product_id = p1.product_id
    WHERE o1.customer_id = c.customer_id
    GROUP BY p1.category_id
    HAVING COUNT(DISTINCT p1.category_id) > 1
);
```

## Correlated Subqueries 🔄

Correlated subqueries reference columns from the outer query and are executed once for each row of the outer query.

### Department Analysis with Correlated Subqueries

```sql
-- Employees earning above their department average
SELECT
    first_name,
    last_name,
    department,
    salary,
    (SELECT ROUND(AVG(salary), 2)
     FROM employees e2
     WHERE e2.department = e1.department) AS dept_avg_salary
FROM employees e1
WHERE salary > (
    SELECT AVG(salary)
    FROM employees e2
    WHERE e2.department = e1.department
)
ORDER BY department, salary DESC;

-- Employees who are the highest paid in their department
SELECT
    first_name,
    last_name,
    department,
    salary
FROM employees e1
WHERE salary = (
    SELECT MAX(salary)
    FROM employees e2
    WHERE e2.department = e1.department
);

-- Products that are the most expensive in their category
SELECT
    p1.product_name,
    c.category_name,
    p1.price
FROM products p1
JOIN categories c ON p1.category_id = c.category_id
WHERE p1.price = (
    SELECT MAX(p2.price)
    FROM products p2
    WHERE p2.category_id = p1.category_id
);
```

### Row Number Simulation with Correlated Subqueries

```sql
-- Second highest salary in each department
SELECT
    first_name,
    last_name,
    department,
    salary
FROM employees e1
WHERE 2 = (
    SELECT COUNT(DISTINCT salary)
    FROM employees e2
    WHERE e2.department = e1.department
    AND e2.salary >= e1.salary
);

-- Top 2 employees by salary in each department
SELECT
    first_name,
    last_name,
    department,
    salary,
    (SELECT COUNT(DISTINCT salary)
     FROM employees e2
     WHERE e2.department = e1.department
     AND e2.salary >= e1.salary) AS salary_rank
FROM employees e1
WHERE (
    SELECT COUNT(DISTINCT salary)
    FROM employees e2
    WHERE e2.department = e1.department
    AND e2.salary >= e1.salary
) <= 2
ORDER BY department, salary DESC;
```

## Subqueries in FROM Clause (Derived Tables) 📋

Subqueries in the FROM clause create temporary result sets that you can query like regular tables.

### Basic Derived Tables

```sql
-- Department statistics as a derived table
SELECT
    dept_stats.department,
    dept_stats.employee_count,
    dept_stats.avg_salary,
    dept_stats.total_payroll,
    db.annual_budget,
    ROUND((dept_stats.total_payroll / db.annual_budget) * 100, 2) AS budget_utilization
FROM (
    SELECT
        department,
        COUNT(*) AS employee_count,
        ROUND(AVG(salary), 2) AS avg_salary,
        SUM(salary) AS total_payroll
    FROM employees
    GROUP BY department
) AS dept_stats
LEFT JOIN department_budgets db ON dept_stats.department = db.department;

-- Customer order summary
SELECT
    customer_summary.customer_id,
    customer_summary.total_orders,
    customer_summary.total_spent,
    customer_summary.avg_order_value,
    c.first_name,
    c.last_name
FROM (
    SELECT
        customer_id,
        COUNT(*) AS total_orders,
        SUM(total_amount) AS total_spent,
        ROUND(AVG(total_amount), 2) AS avg_order_value
    FROM orders
    GROUP BY customer_id
) AS customer_summary
JOIN customers c ON customer_summary.customer_id = c.customer_id
WHERE customer_summary.total_spent > 500
ORDER BY customer_summary.total_spent DESC;
```

### Complex Derived Table Examples

```sql
-- Monthly sales analysis
SELECT
    monthly_sales.year_month,
    monthly_sales.monthly_revenue,
    monthly_sales.order_count,
    monthly_sales.avg_order_value,
    LAG(monthly_sales.monthly_revenue) OVER (ORDER BY monthly_sales.year_month) AS prev_month_revenue,
    ROUND(
        (monthly_sales.monthly_revenue - LAG(monthly_sales.monthly_revenue) OVER (ORDER BY monthly_sales.year_month)) /
        LAG(monthly_sales.monthly_revenue) OVER (ORDER BY monthly_sales.year_month) * 100, 2
    ) AS month_over_month_growth
FROM (
    SELECT
        DATE_FORMAT(order_date, '%Y-%m') AS year_month,
        COUNT(*) AS order_count,
        SUM(total_amount) AS monthly_revenue,
        ROUND(AVG(total_amount), 2) AS avg_order_value
    FROM orders
    GROUP BY DATE_FORMAT(order_date, '%Y-%m')
) AS monthly_sales
ORDER BY monthly_sales.year_month;

-- Product performance analysis
SELECT
    product_performance.*,
    categories.category_name,
    RANK() OVER (PARTITION BY product_performance.category_id ORDER BY product_performance.total_revenue DESC) AS category_rank
FROM (
    SELECT
        p.product_id,
        p.product_name,
        p.category_id,
        p.price,
        COALESCE(SUM(oi.quantity), 0) AS total_quantity_sold,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_revenue,
        COUNT(DISTINCT oi.order_id) AS unique_orders
    FROM products p
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    GROUP BY p.product_id, p.product_name, p.category_id, p.price
) AS product_performance
JOIN categories ON product_performance.category_id = categories.category_id
ORDER BY total_revenue DESC;
```

## Subqueries with Aggregation 📊

### Complex Aggregation Scenarios

```sql
-- Departments with above-average salaries
SELECT department, AVG(salary) AS avg_dept_salary
FROM employees
GROUP BY department
HAVING AVG(salary) > (
    SELECT AVG(salary) FROM employees
);

-- Customers spending more than average in their city
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    c.city,
    customer_totals.total_spent,
    city_averages.city_avg_spending
FROM customers c
JOIN (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
) AS customer_totals ON c.customer_id = customer_totals.customer_id
JOIN (
    SELECT
        c2.city,
        AVG(city_totals.customer_total) AS city_avg_spending
    FROM customers c2
    JOIN (
        SELECT customer_id, SUM(total_amount) AS customer_total
        FROM orders
        GROUP BY customer_id
    ) AS city_totals ON c2.customer_id = city_totals.customer_id
    GROUP BY c2.city
) AS city_averages ON c.city = city_averages.city
WHERE customer_totals.total_spent > city_averages.city_avg_spending;
```

### Ranking with Subqueries

```sql
-- Top 3 products by revenue in each category
SELECT
    category_name,
    product_name,
    total_revenue,
    product_rank
FROM (
    SELECT
        c.category_name,
        p.product_name,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_revenue,
        (
            SELECT COUNT(*) + 1
            FROM products p2
            LEFT JOIN order_items oi2 ON p2.product_id = oi2.product_id
            WHERE p2.category_id = p.category_id
            GROUP BY p2.product_id
            HAVING COALESCE(SUM(oi2.quantity * oi2.unit_price), 0) > COALESCE(SUM(oi.quantity * oi.unit_price), 0)
        ) AS product_rank
    FROM categories c
    JOIN products p ON c.category_id = p.category_id
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    GROUP BY c.category_id, c.category_name, p.product_id, p.product_name
) AS ranked_products
WHERE product_rank <= 3
ORDER BY category_name, product_rank;
```

## Performance Considerations 🚀

### Optimizing Subqueries

```sql
-- Inefficient: Correlated subquery executed for each row
SELECT first_name, last_name, salary
FROM employees e1
WHERE salary > (
    SELECT AVG(salary)
    FROM employees e2
    WHERE e2.department = e1.department
);

-- More efficient: Pre-calculate department averages
SELECT e.first_name, e.last_name, e.salary
FROM employees e
JOIN (
    SELECT department, AVG(salary) AS dept_avg
    FROM employees
    GROUP BY department
) dept_avgs ON e.department = dept_avgs.department
WHERE e.salary > dept_avgs.dept_avg;

-- Use EXISTS instead of IN for large datasets
-- Less efficient with large datasets
SELECT customer_id, first_name
FROM customers
WHERE customer_id IN (SELECT customer_id FROM orders);

-- More efficient
SELECT DISTINCT c.customer_id, c.first_name
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);
```

### Indexing for Subqueries

```sql
-- Create indexes to optimize subquery performance
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_salary ON employees(salary);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Composite indexes for complex subqueries
CREATE INDEX idx_employees_dept_salary ON employees(department, salary);
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);
```

## Common Subquery Patterns 🎭

### Window Function Alternatives

```sql
-- Before window functions: Using subqueries for running totals
SELECT
    order_date,
    total_amount,
    (
        SELECT SUM(total_amount)
        FROM orders o2
        WHERE o2.order_date <= o1.order_date
    ) AS running_total
FROM orders o1
ORDER BY order_date;

-- Modern approach with window functions (more efficient)
SELECT
    order_date,
    total_amount,
    SUM(total_amount) OVER (ORDER BY order_date) AS running_total
FROM orders
ORDER BY order_date;
```

### Conditional Logic with Subqueries

```sql
-- Dynamic filtering based on data conditions
SELECT
    product_id,
    product_name,
    price,
    CASE
        WHEN price > (SELECT AVG(price) FROM products) THEN 'Above Average'
        WHEN price = (SELECT AVG(price) FROM products) THEN 'Average'
        ELSE 'Below Average'
    END AS price_category
FROM products
ORDER BY price DESC;
```

## Common Mistakes and Solutions ❗

### Mistake 1: NOT IN with NULLs

```sql
-- Dangerous: NOT IN with potential NULLs
SELECT customer_id
FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM orders);  -- May return no rows if any order has NULL customer_id

-- Safe: Handle NULLs explicitly
SELECT customer_id
FROM customers
WHERE customer_id NOT IN (
    SELECT customer_id
    FROM orders
    WHERE customer_id IS NOT NULL
);

-- Better: Use NOT EXISTS
SELECT c.customer_id
FROM customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

### Mistake 2: Multiple Row Subqueries with Scalar Operators

```sql
-- Wrong: Subquery returns multiple rows
-- SELECT first_name FROM employees WHERE salary > (SELECT salary FROM employees WHERE department = 'Sales');

-- Correct: Use ANY, ALL, or MAX/MIN
SELECT first_name
FROM employees
WHERE salary > ALL (SELECT salary FROM employees WHERE department = 'Sales');

-- Or
SELECT first_name
FROM employees
WHERE salary > (SELECT MAX(salary) FROM employees WHERE department = 'Sales');
```

### Mistake 3: Inefficient Correlated Subqueries

```sql
-- Inefficient: Subquery executed for each row
SELECT product_name,
       (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.product_id) AS order_count
FROM products p;

-- Efficient: Use JOIN with aggregation
SELECT p.product_name, COALESCE(oi_summary.order_count, 0) AS order_count
FROM products p
LEFT JOIN (
    SELECT product_id, COUNT(*) AS order_count
    FROM order_items
    GROUP BY product_id
) oi_summary ON p.product_id = oi_summary.product_id;
```

## Practice Exercises 💪

### Exercise 1: Basic Subqueries

```sql
-- 1. Find employees earning more than the company average
-- 2. List products that have never been ordered
-- 3. Find customers from cities where we have no employees
-- 4. Get the most recent order for each customer
-- 5. Find departments with more than 2 employees
```

### Exercise 2: Correlated Subqueries

```sql
-- 1. Find employees who earn the most in their department
-- 2. List products that are more expensive than the average in their category
-- 3. Find customers who have placed more orders than average for their city
-- 4. Get the second most expensive product in each category
-- 5. Find employees hired in the same year as their manager
```

### Exercise 3: Complex Subqueries

```sql
-- 1. Create a customer ranking based on total spending
-- 2. Find products that contribute to top 20% of category revenue
-- 3. Identify employees whose salary is in the top 10% company-wide
-- 4. Find customers who have ordered from all available categories
-- 5. Create a monthly growth report using subqueries
```

## Next Steps ➡️

Congratulations! You've mastered subqueries, one of the most powerful features in SQL. You can now write complex queries that break down business problems into logical steps. Next, we'll explore advanced topics that will take your SQL skills to the expert level.

---

## Quick Reference 📚

### Subquery Types

```sql
-- Scalar subquery (returns one value)
WHERE salary > (SELECT AVG(salary) FROM employees)

-- Column subquery (returns multiple rows, one column)
WHERE department IN (SELECT department FROM high_budget_depts)

-- Row subquery (returns one row, multiple columns)
WHERE (dept, salary) = (SELECT department, MAX(salary) FROM ...)

-- Table subquery (returns multiple rows and columns)
FROM (SELECT dept, AVG(salary) as avg_sal FROM employees GROUP BY dept) t
```

### Key Operators

```sql
IN, NOT IN              -- Check membership in list
EXISTS, NOT EXISTS      -- Check if subquery returns rows
ANY, ALL               -- Compare with any/all values
= > < >= <= <>         -- Scalar comparisons
```

### Performance Tips

-   ✅ Use EXISTS instead of IN for large datasets
-   ✅ Avoid correlated subqueries when possible
-   ✅ Create appropriate indexes for subquery columns
-   ✅ Consider window functions as alternatives
-   ✅ Handle NULLs carefully with NOT IN
