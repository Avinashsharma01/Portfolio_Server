# SQL JOINs - Combining Data from Multiple Tables

## Introduction to JOINs 🔗

JOINs are one of the most powerful features of SQL, allowing you to combine data from multiple related tables. Understanding JOINs is crucial for working with normalized databases where data is spread across multiple tables to avoid redundancy.

## Why Do We Need JOINs? 🤔

In a well-designed database, data is normalized across multiple tables:

```sql
-- Separate tables to avoid redundancy
Customers:
┌─────────────┬──────────────┬───────────────────┐
│ customer_id │     name     │      email        │
├─────────────┼──────────────┼───────────────────┤
│      1      │ John Doe     │ john@example.com  │
│      2      │ Jane Smith   │ jane@example.com  │
└─────────────┴──────────────┴───────────────────┘

Orders:
┌──────────┬─────────────┬────────────┬─────────┐
│ order_id │ customer_id │ order_date │  total  │
├──────────┼─────────────┼────────────┼─────────┤
│    101   │      1      │ 2024-08-01 │ 150.00  │
│    102   │      2      │ 2024-08-02 │  75.50  │
│    103   │      1      │ 2024-08-03 │ 220.00  │
└──────────┴─────────────┴────────────┴─────────┘

-- To get customer names with their orders, we need a JOIN
```

## Sample Database Setup 🗃️

Let's create a comprehensive database for our JOIN examples:

```sql
-- Create database and tables for JOIN practice
CREATE DATABASE join_practice;
USE join_practice;

-- Customers table
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    city VARCHAR(50),
    country VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Products table
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(200) NOT NULL,
    category_id INT,
    price DECIMAL(10,2),
    stock_quantity INT DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Orders table
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    order_date DATE NOT NULL,
    total_amount DECIMAL(12,2),
    status ENUM('pending', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Order items table (junction table)
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Insert sample data
INSERT INTO customers (first_name, last_name, email, city, country) VALUES
('John', 'Doe', 'john@example.com', 'New York', 'USA'),
('Jane', 'Smith', 'jane@example.com', 'London', 'UK'),
('Bob', 'Johnson', 'bob@example.com', 'Toronto', 'Canada'),
('Alice', 'Brown', 'alice@example.com', 'Sydney', 'Australia'),
('Charlie', 'Wilson', 'charlie@example.com', 'Berlin', 'Germany');

INSERT INTO categories (category_name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Clothing', 'Apparel and accessories'),
('Books', 'Physical and digital books'),
('Home & Garden', 'Home improvement and garden supplies');

INSERT INTO products (product_name, category_id, price, stock_quantity) VALUES
('Laptop', 1, 999.99, 50),
('Smartphone', 1, 699.99, 100),
('T-Shirt', 2, 19.99, 200),
('Jeans', 2, 79.99, 75),
('SQL Cookbook', 3, 45.99, 30),
('Garden Hose', 4, 29.99, 25);

INSERT INTO orders (customer_id, order_date, total_amount, status) VALUES
(1, '2024-08-01', 1019.98, 'delivered'),
(2, '2024-08-02', 699.99, 'shipped'),
(1, '2024-08-03', 99.98, 'delivered'),
(3, '2024-08-04', 45.99, 'pending'),
(4, '2024-08-05', 109.98, 'shipped');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 999.99),  -- John's laptop
(1, 3, 1, 19.99),   -- John's t-shirt
(2, 2, 1, 699.99),  -- Jane's smartphone
(3, 3, 2, 19.99),   -- John's 2 t-shirts
(3, 4, 1, 79.99),   -- John's jeans
(4, 5, 1, 45.99),   -- Bob's book
(5, 3, 3, 19.99),   -- Alice's 3 t-shirts
(5, 6, 1, 29.99);   -- Alice's garden hose
```

## INNER JOIN 🎯

INNER JOIN returns only the rows that have matching values in both tables.

### Basic INNER JOIN Syntax

```sql
SELECT columns
FROM table1
INNER JOIN table2 ON table1.column = table2.column;
```

### Simple INNER JOIN Examples

```sql
-- Get customer names with their orders
SELECT
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;

-- Result: Only customers who have placed orders
┌────────────┬───────────┬──────────┬────────────┬──────────────┐
│ first_name │ last_name │ order_id │ order_date │ total_amount │
├────────────┼───────────┼──────────┼────────────┼──────────────┤
│ John       │ Doe       │    1     │ 2024-08-01 │   1019.98    │
│ Jane       │ Smith     │    2     │ 2024-08-02 │    699.99    │
│ John       │ Doe       │    3     │ 2024-08-03 │     99.98    │
│ Bob        │ Johnson   │    4     │ 2024-08-04 │     45.99    │
│ Alice      │ Brown     │    5     │ 2024-08-05 │    109.98    │
└────────────┴───────────┴──────────┴────────────┴──────────────┘
```

### INNER JOIN with Multiple Tables

```sql
-- Get order details with customer and product information
SELECT
    c.first_name,
    c.last_name,
    o.order_date,
    p.product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS line_total
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
INNER JOIN products p ON oi.product_id = p.product_id
ORDER BY o.order_date, c.last_name;
```

### INNER JOIN with WHERE Clause

```sql
-- Get orders from specific date range with customer info
SELECT
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= '2024-08-01'
  AND o.order_date <= '2024-08-03'
ORDER BY o.order_date;
```

## LEFT JOIN (LEFT OUTER JOIN) ⬅️

LEFT JOIN returns all rows from the left table and matching rows from the right table. If no match is found, NULL values are returned for right table columns.

### Basic LEFT JOIN

```sql
-- Get all customers and their orders (including customers with no orders)
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
ORDER BY c.customer_id;

-- Result includes Charlie Wilson who has no orders
┌─────────────┬────────────┬───────────┬──────────┬────────────┬──────────────┐
│ customer_id │ first_name │ last_name │ order_id │ order_date │ total_amount │
├─────────────┼────────────┼───────────┼──────────┼────────────┼──────────────┤
│      1      │ John       │ Doe       │    1     │ 2024-08-01 │   1019.98    │
│      1      │ John       │ Doe       │    3     │ 2024-08-03 │     99.98    │
│      2      │ Jane       │ Smith     │    2     │ 2024-08-02 │    699.99    │
│      3      │ Bob        │ Johnson   │    4     │ 2024-08-04 │     45.99    │
│      4      │ Alice      │ Brown     │    5     │ 2024-08-05 │    109.98    │
│      5      │ Charlie    │ Wilson    │   NULL   │    NULL    │     NULL     │
└─────────────┴────────────┴───────────┴──────────┴────────────┴──────────────┘
```

### Finding Records with No Matches

```sql
-- Find customers who haven't placed any orders
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.customer_id IS NULL;

-- Find products that haven't been ordered
SELECT
    p.product_id,
    p.product_name,
    p.price
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
WHERE oi.product_id IS NULL;
```

### LEFT JOIN with Aggregation

```sql
-- Get customer order summary (including customers with no orders)
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC;
```

## RIGHT JOIN (RIGHT OUTER JOIN) ➡️

RIGHT JOIN returns all rows from the right table and matching rows from the left table. Less commonly used than LEFT JOIN.

```sql
-- Get all orders and customer information (including orders without customer info)
-- Note: This would only happen if foreign key constraints are disabled
SELECT
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
RIGHT JOIN orders o ON c.customer_id = o.customer_id;

-- In practice, this is equivalent to:
SELECT
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date,
    o.total_amount
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id;
```

## FULL OUTER JOIN ↔️

FULL OUTER JOIN returns all rows from both tables, with NULLs where there are no matches. Not supported in MySQL, but available in PostgreSQL, SQL Server, and Oracle.

```sql
-- PostgreSQL/SQL Server/Oracle syntax
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date
FROM customers c
FULL OUTER JOIN orders o ON c.customer_id = o.customer_id;

-- MySQL workaround using UNION
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
UNION
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date
FROM customers c
RIGHT JOIN orders o ON c.customer_id = o.customer_id
WHERE c.customer_id IS NULL;
```

## CROSS JOIN ✖️

CROSS JOIN returns the Cartesian product of both tables (every row from first table combined with every row from second table).

```sql
-- Generate all possible customer-product combinations
SELECT
    c.first_name,
    c.last_name,
    p.product_name,
    p.price
FROM customers c
CROSS JOIN products p
ORDER BY c.customer_id, p.product_id;

-- Practical example: Generate date ranges for reporting
SELECT
    c.customer_id,
    c.first_name,
    date_series.report_date
FROM customers c
CROSS JOIN (
    SELECT '2024-08-01' AS report_date
    UNION SELECT '2024-08-02'
    UNION SELECT '2024-08-03'
) AS date_series
ORDER BY c.customer_id, date_series.report_date;
```

## Self JOIN 🔄

Self JOIN is when a table is joined with itself, useful for hierarchical data or comparing rows within the same table.

```sql
-- Create employee table for self-join example
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    manager_id INT,
    department VARCHAR(50),
    FOREIGN KEY (manager_id) REFERENCES employees(emp_id)
);

INSERT INTO employees VALUES
(1, 'John', 'CEO', NULL, 'Executive'),
(2, 'Jane', 'VP Sales', 1, 'Sales'),
(3, 'Bob', 'VP Engineering', 1, 'Engineering'),
(4, 'Alice', 'Sales Manager', 2, 'Sales'),
(5, 'Charlie', 'Developer', 3, 'Engineering');

-- Find employees and their managers
SELECT
    e.first_name AS employee_name,
    e.last_name AS employee_surname,
    m.first_name AS manager_name,
    m.last_name AS manager_surname
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.emp_id;

-- Find employees in the same department
SELECT
    e1.first_name AS employee1,
    e2.first_name AS employee2,
    e1.department
FROM employees e1
INNER JOIN employees e2 ON e1.department = e2.department
WHERE e1.emp_id < e2.emp_id  -- Avoid duplicate pairs
ORDER BY e1.department;
```

## JOIN with Multiple Conditions 🎛️

You can join tables on multiple conditions using AND/OR in the ON clause.

```sql
-- Join with multiple conditions
SELECT
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
                   AND o.order_date >= '2024-08-01'
                   AND o.status = 'delivered';

-- Complex join conditions
SELECT
    p1.product_name AS product1,
    p2.product_name AS product2,
    p1.price AS price1,
    p2.price AS price2
FROM products p1
INNER JOIN products p2 ON p1.category_id = p2.category_id
                       AND p1.product_id < p2.product_id
                       AND ABS(p1.price - p2.price) < 100;
```

## Non-Equi JOINs 📊

JOINs don't always have to use equality. You can use other comparison operators.

```sql
-- Create price tiers table
CREATE TABLE price_tiers (
    tier_id INT PRIMARY KEY,
    tier_name VARCHAR(50),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2)
);

INSERT INTO price_tiers VALUES
(1, 'Budget', 0.00, 50.00),
(2, 'Mid-range', 50.01, 200.00),
(3, 'Premium', 200.01, 999999.99);

-- Classify products by price tier
SELECT
    p.product_name,
    p.price,
    pt.tier_name
FROM products p
INNER JOIN price_tiers pt ON p.price >= pt.min_price
                          AND p.price <= pt.max_price;
```

## JOIN Performance Optimization 🚀

### Using Indexes for JOINs

```sql
-- Create indexes on foreign key columns
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_products_category_id ON products(category_id);

-- Composite indexes for multiple conditions
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);
CREATE INDEX idx_products_category_price ON products(category_id, price);
```

### Efficient JOIN Order

```sql
-- Start with the most selective table (smallest result set)
-- Good: Start with specific date range
SELECT *
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_date = '2024-08-01';  -- Very selective condition

-- Less efficient: Start with largest table without conditions
SELECT *
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_date = '2024-08-01';
```

## Complex JOIN Examples 🎯

### E-commerce Reporting Query

```sql
-- Comprehensive order report with all related information
SELECT
    -- Customer information
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.city,
    c.country,

    -- Order information
    o.order_id,
    o.order_date,
    o.status,

    -- Product information
    p.product_name,
    cat.category_name,

    -- Order item details
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS line_total,

    -- Calculations
    o.total_amount AS order_total,
    ROUND((oi.quantity * oi.unit_price) / o.total_amount * 100, 2) AS line_percentage

FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
INNER JOIN products p ON oi.product_id = p.product_id
INNER JOIN categories cat ON p.category_id = cat.category_id
WHERE o.order_date >= '2024-08-01'
ORDER BY o.order_date DESC, c.last_name, o.order_id;
```

### Customer Analysis Query

```sql
-- Customer purchase behavior analysis
SELECT
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.country,

    -- Order statistics
    COUNT(DISTINCT o.order_id) AS total_orders,
    COUNT(DISTINCT oi.product_id) AS unique_products_purchased,
    SUM(oi.quantity) AS total_items_purchased,

    -- Financial statistics
    SUM(o.total_amount) AS total_spent,
    AVG(o.total_amount) AS avg_order_value,
    MAX(o.total_amount) AS largest_order,

    -- Date statistics
    MIN(o.order_date) AS first_order_date,
    MAX(o.order_date) AS last_order_date,
    DATEDIFF(MAX(o.order_date), MIN(o.order_date)) AS customer_lifespan_days,

    -- Category preferences
    GROUP_CONCAT(DISTINCT cat.category_name) AS categories_purchased

FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.product_id
LEFT JOIN categories cat ON p.category_id = cat.category_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.country
HAVING total_orders > 0  -- Only customers with orders
ORDER BY total_spent DESC;
```

## Common JOIN Mistakes and Solutions ❗

### Mistake 1: Cartesian Product

```sql
-- Wrong: Missing JOIN condition creates Cartesian product
SELECT c.first_name, o.order_id
FROM customers c, orders o;  -- Old syntax, dangerous!

-- Correct: Always specify JOIN condition
SELECT c.first_name, o.order_id
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;
```

### Mistake 2: Wrong JOIN Type

```sql
-- Wrong: Using INNER JOIN when you want all customers
SELECT c.first_name, COUNT(o.order_id) AS order_count
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id  -- Excludes customers with no orders
GROUP BY c.customer_id;

-- Correct: Use LEFT JOIN to include all customers
SELECT c.first_name, COUNT(o.order_id) AS order_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id;
```

### Mistake 3: Ambiguous Column Names

```sql
-- Wrong: Ambiguous column reference
SELECT customer_id, order_date  -- Which table's customer_id?
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;

-- Correct: Use table aliases
SELECT c.customer_id, o.order_date
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;
```

## Best Practices 🌟

### 1. Always Use Table Aliases

```sql
-- Good: Clear table aliases
SELECT c.first_name, o.order_date
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;

-- Avoid: Long table names without aliases
SELECT customers.first_name, orders.order_date
FROM customers
INNER JOIN orders ON customers.customer_id = orders.customer_id;
```

### 2. Be Explicit About JOIN Types

```sql
-- Good: Explicit INNER JOIN
SELECT *
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;

-- Avoid: Implicit joins (old syntax)
SELECT *
FROM customers c, orders o
WHERE c.customer_id = o.customer_id;
```

### 3. Order JOINs Logically

```sql
-- Good: Logical flow from main entity to details
SELECT *
FROM customers c                    -- Start with customers
INNER JOIN orders o ON c.customer_id = o.customer_id     -- Their orders
INNER JOIN order_items oi ON o.order_id = oi.order_id    -- Order details
INNER JOIN products p ON oi.product_id = p.product_id;   -- Product info
```

## Practice Exercises 💪

### Exercise 1: Basic JOINs

```sql
-- 1. List all products with their category names
-- 2. Find customers who have placed orders in August 2024
-- 3. Show all categories and count of products in each (including empty categories)
-- 4. List orders with customer names and total amounts
-- 5. Find products that have never been ordered
```

### Exercise 2: Complex JOINs

```sql
-- 1. Create a sales report showing customer, product, and sales details
-- 2. Find customers who have ordered from multiple categories
-- 3. List the most popular product in each category
-- 4. Show customers and their most recent order date
-- 5. Find pairs of customers from the same country
```

### Exercise 3: Performance Analysis

```sql
-- 1. Compare INNER JOIN vs LEFT JOIN performance on large datasets
-- 2. Analyze the effect of different JOIN orders
-- 3. Create appropriate indexes for your JOIN queries
-- 4. Optimize a slow JOIN query
-- 5. Write a query that uses multiple JOIN types effectively
```

## Next Steps ➡️

Now that you've mastered JOINs, you can combine data from multiple tables effectively! Next, we'll explore built-in SQL functions and operators that will help you manipulate and analyze your joined data.

---

## Quick Reference 📚

### JOIN Types Summary

```sql
INNER JOIN      -- Only matching rows from both tables
LEFT JOIN       -- All rows from left table, matching from right
RIGHT JOIN      -- All rows from right table, matching from left
FULL OUTER JOIN -- All rows from both tables (not in MySQL)
CROSS JOIN      -- Cartesian product of both tables
SELF JOIN       -- Table joined with itself
```

### JOIN Syntax Template

```sql
SELECT columns
FROM table1 alias1
[INNER|LEFT|RIGHT|FULL] JOIN table2 alias2
    ON alias1.column = alias2.column
[WHERE conditions]
[ORDER BY columns];
```

### Performance Tips

-   ✅ Always use appropriate indexes on JOIN columns
-   ✅ Start with the most selective table
-   ✅ Use table aliases for readability
-   ✅ Be explicit about JOIN types
-   ✅ Avoid Cartesian products
