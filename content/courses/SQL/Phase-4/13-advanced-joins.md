# Advanced JOINs and Complex Scenarios

## Introduction to Advanced JOINs 🚀

Advanced JOINs go beyond basic table relationships to handle complex business scenarios, hierarchical data, and sophisticated reporting requirements. These techniques are essential for enterprise-level database development and analytics.

## Self JOINs - Advanced Patterns 🔄

Self JOINs allow you to compare rows within the same table, handle hierarchical data, and create complex relationships.

### Hierarchical Data Management

```sql
-- Enhanced employee table with hierarchy
CREATE TABLE employees_hierarchy (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    title VARCHAR(100),
    department VARCHAR(50),
    salary DECIMAL(10,2),
    hire_date DATE,
    manager_id INT,
    level_in_hierarchy INT,
    FOREIGN KEY (manager_id) REFERENCES employees_hierarchy(employee_id)
);

INSERT INTO employees_hierarchy VALUES
(1, 'John', 'CEO', 'Chief Executive Officer', 'Executive', 200000, '2020-01-01', NULL, 1),
(2, 'Sarah', 'VP Sales', 'Vice President of Sales', 'Sales', 150000, '2020-02-01', 1, 2),
(3, 'Mike', 'VP Engineering', 'Vice President of Engineering', 'Engineering', 160000, '2020-02-01', 1, 2),
(4, 'Lisa', 'VP Marketing', 'Vice President of Marketing', 'Marketing', 145000, '2020-03-01', 1, 2),
(5, 'Tom', 'Sales Manager', 'Regional Sales Manager', 'Sales', 85000, '2020-04-01', 2, 3),
(6, 'Anna', 'Engineering Manager', 'Senior Engineering Manager', 'Engineering', 90000, '2020-04-01', 3, 3),
(7, 'David', 'Marketing Manager', 'Digital Marketing Manager', 'Marketing', 80000, '2020-05-01', 4, 3),
(8, 'Emma', 'Sales Rep', 'Senior Sales Representative', 'Sales', 60000, '2021-01-01', 5, 4),
(9, 'James', 'Sales Rep', 'Sales Representative', 'Sales', 55000, '2021-02-01', 5, 4),
(10, 'Carol', 'Developer', 'Senior Software Developer', 'Engineering', 95000, '2021-01-01', 6, 4),
(11, 'Bob', 'Developer', 'Software Developer', 'Engineering', 75000, '2021-03-01', 6, 4),
(12, 'Alice', 'Designer', 'UX Designer', 'Marketing', 70000, '2021-04-01', 7, 4);

-- Complete organizational chart
SELECT
    CONCAT(REPEAT('  ', e.level_in_hierarchy - 1), e.first_name, ' ', e.last_name) AS employee_hierarchy,
    e.title,
    e.department,
    e.salary,
    CONCAT(m.first_name, ' ', m.last_name) AS reports_to,
    m.title AS manager_title
FROM employees_hierarchy e
LEFT JOIN employees_hierarchy m ON e.manager_id = m.employee_id
ORDER BY e.level_in_hierarchy, e.department, e.salary DESC;

-- Find all subordinates of a specific manager
SELECT
    m.first_name AS manager_first_name,
    m.last_name AS manager_last_name,
    m.title AS manager_title,
    e.first_name AS subordinate_first_name,
    e.last_name AS subordinate_last_name,
    e.title AS subordinate_title,
    e.level_in_hierarchy - m.level_in_hierarchy AS levels_below
FROM employees_hierarchy m
JOIN employees_hierarchy e ON e.manager_id = m.employee_id
WHERE m.employee_id = 3  -- VP Engineering
ORDER BY e.level_in_hierarchy, e.salary DESC;
```

### Advanced Hierarchical Queries

```sql
-- Recursive CTE for full hierarchy (MySQL 8.0+, PostgreSQL, SQL Server)
WITH RECURSIVE employee_hierarchy AS (
    -- Base case: Top-level employees (no manager)
    SELECT
        employee_id,
        first_name,
        last_name,
        title,
        manager_id,
        salary,
        level_in_hierarchy,
        CAST(CONCAT(first_name, ' ', last_name) AS CHAR(1000)) AS hierarchy_path,
        0 AS depth
    FROM employees_hierarchy
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive case: Employees with managers
    SELECT
        e.employee_id,
        e.first_name,
        e.last_name,
        e.title,
        e.manager_id,
        e.salary,
        e.level_in_hierarchy,
        CAST(CONCAT(eh.hierarchy_path, ' -> ', e.first_name, ' ', e.last_name) AS CHAR(1000)),
        eh.depth + 1
    FROM employees_hierarchy e
    JOIN employee_hierarchy eh ON e.manager_id = eh.employee_id
)
SELECT
    CONCAT(REPEAT('  ', depth), first_name, ' ', last_name) AS org_chart,
    title,
    salary,
    hierarchy_path
FROM employee_hierarchy
ORDER BY hierarchy_path;

-- MySQL workaround for hierarchical queries (without CTE)
SELECT
    e1.first_name AS level1_name,
    e1.title AS level1_title,
    e2.first_name AS level2_name,
    e2.title AS level2_title,
    e3.first_name AS level3_name,
    e3.title AS level3_title,
    e4.first_name AS level4_name,
    e4.title AS level4_title
FROM employees_hierarchy e1
LEFT JOIN employees_hierarchy e2 ON e1.employee_id = e2.manager_id
LEFT JOIN employees_hierarchy e3 ON e2.employee_id = e3.manager_id
LEFT JOIN employees_hierarchy e4 ON e3.employee_id = e4.manager_id
WHERE e1.manager_id IS NULL
ORDER BY e1.employee_id, e2.employee_id, e3.employee_id, e4.employee_id;
```

### Comparing Rows Within Same Table

```sql
-- Employee salary comparisons
SELECT
    e1.first_name AS employee1,
    e1.last_name AS employee1_last,
    e1.salary AS salary1,
    e2.first_name AS employee2,
    e2.last_name AS employee2_last,
    e2.salary AS salary2,
    ABS(e1.salary - e2.salary) AS salary_difference
FROM employees_hierarchy e1
JOIN employees_hierarchy e2 ON e1.employee_id < e2.employee_id  -- Avoid duplicates
WHERE e1.department = e2.department
  AND ABS(e1.salary - e2.salary) < 10000  -- Similar salaries
ORDER BY e1.department, salary_difference;

-- Find employees hired in the same period
SELECT
    e1.first_name AS emp1_name,
    e1.hire_date AS emp1_hire_date,
    e2.first_name AS emp2_name,
    e2.hire_date AS emp2_hire_date,
    DATEDIFF(e2.hire_date, e1.hire_date) AS days_apart
FROM employees_hierarchy e1
JOIN employees_hierarchy e2 ON e1.employee_id < e2.employee_id
WHERE ABS(DATEDIFF(e2.hire_date, e1.hire_date)) <= 30  -- Within 30 days
ORDER BY ABS(DATEDIFF(e2.hire_date, e1.hire_date));
```

## Multiple Table JOINs 🔗

Complex business scenarios often require joining multiple tables to get complete information.

### E-commerce Multi-Table JOINs

```sql
-- Comprehensive order analysis with multiple JOINs
SELECT
    -- Customer information
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email,
    c.city,
    c.country,

    -- Order information
    o.order_id,
    o.order_date,
    o.status AS order_status,
    o.total_amount,

    -- Product information
    p.product_id,
    p.product_name,
    cat.category_name,
    p.price AS list_price,

    -- Order item details
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS line_total,

    -- Calculations
    ROUND((oi.quantity * oi.unit_price) / o.total_amount * 100, 2) AS percentage_of_order,
    ROUND(((p.price - oi.unit_price) / p.price) * 100, 2) AS discount_percentage,

    -- Aggregated customer metrics (using window functions)
    COUNT(*) OVER (PARTITION BY c.customer_id) AS customer_total_items,
    SUM(o.total_amount) OVER (PARTITION BY c.customer_id) AS customer_lifetime_value,
    ROW_NUMBER() OVER (PARTITION BY c.customer_id ORDER BY o.order_date) AS customer_order_sequence

FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
INNER JOIN products p ON oi.product_id = p.product_id
INNER JOIN categories cat ON p.category_id = cat.category_id
WHERE o.order_date >= '2024-01-01'
ORDER BY c.customer_id, o.order_date, oi.product_id;
```

### Supply Chain Analysis

```sql
-- Create supply chain tables
CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(100),
    contact_person VARCHAR(100),
    country VARCHAR(50),
    rating DECIMAL(3,2)
);

CREATE TABLE product_suppliers (
    product_id INT,
    supplier_id INT,
    supply_price DECIMAL(10,2),
    lead_time_days INT,
    minimum_order_quantity INT,
    PRIMARY KEY (product_id, supplier_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

INSERT INTO suppliers VALUES
(1, 'TechCorp Manufacturing', 'John Smith', 'China', 4.5),
(2, 'Global Electronics', 'Jane Doe', 'Taiwan', 4.2),
(3, 'Fashion Forward Ltd', 'Bob Johnson', 'Vietnam', 3.8),
(4, 'BookWorld Publishers', 'Alice Brown', 'USA', 4.7);

INSERT INTO product_suppliers VALUES
(1, 1, 750.00, 14, 10),  -- Laptop from TechCorp
(1, 2, 780.00, 21, 5),   -- Laptop from Global Electronics
(2, 1, 450.00, 10, 20),  -- Smartphone from TechCorp
(2, 2, 420.00, 12, 15),  -- Smartphone from Global Electronics
(3, 3, 8.50, 7, 100),    -- T-Shirt from Fashion Forward
(4, 3, 35.00, 14, 50),   -- Jeans from Fashion Forward
(5, 4, 22.00, 5, 25);    -- Book from BookWorld

-- Complex supply chain analysis
SELECT
    -- Product information
    p.product_name,
    cat.category_name,
    p.price AS retail_price,
    p.stock_quantity,

    -- Supplier information
    s.supplier_name,
    s.country AS supplier_country,
    s.rating AS supplier_rating,
    ps.supply_price,
    ps.lead_time_days,
    ps.minimum_order_quantity,

    -- Financial analysis
    ROUND(p.price - ps.supply_price, 2) AS gross_margin,
    ROUND((p.price - ps.supply_price) / p.price * 100, 2) AS margin_percentage,

    -- Inventory analysis
    CASE
        WHEN p.stock_quantity < ps.minimum_order_quantity THEN 'Reorder Required'
        WHEN p.stock_quantity < ps.minimum_order_quantity * 2 THEN 'Low Stock'
        ELSE 'Adequate Stock'
    END AS stock_status,

    -- Sales performance (join with order items)
    COALESCE(sales_data.units_sold, 0) AS units_sold_last_30_days,
    COALESCE(sales_data.revenue, 0) AS revenue_last_30_days,

    -- Supplier ranking
    ROW_NUMBER() OVER (
        PARTITION BY p.product_id
        ORDER BY ps.supply_price ASC, s.rating DESC, ps.lead_time_days ASC
    ) AS supplier_rank

FROM products p
JOIN categories cat ON p.category_id = cat.category_id
JOIN product_suppliers ps ON p.product_id = ps.product_id
JOIN suppliers s ON ps.supplier_id = s.supplier_id
LEFT JOIN (
    -- Subquery for recent sales data
    SELECT
        oi.product_id,
        SUM(oi.quantity) AS units_sold,
        SUM(oi.quantity * oi.unit_price) AS revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    GROUP BY oi.product_id
) sales_data ON p.product_id = sales_data.product_id
ORDER BY p.product_name, supplier_rank;
```

## UNION and UNION ALL 🔀

UNION operations combine results from multiple SELECT statements, useful for consolidating data from different sources.

### Basic UNION Operations

```sql
-- Combine data from different time periods
SELECT
    'Q1 2024' AS period,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_revenue
FROM orders
WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31'

UNION ALL

SELECT
    'Q2 2024' AS period,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_revenue
FROM orders
WHERE order_date BETWEEN '2024-04-01' AND '2024-06-30'

UNION ALL

SELECT
    'Q3 2024' AS period,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_revenue
FROM orders
WHERE order_date BETWEEN '2024-07-01' AND '2024-09-30'

ORDER BY period;

-- Combine different data sources
SELECT
    'Customer' AS contact_type,
    customer_id AS id,
    CONCAT(first_name, ' ', last_name) AS name,
    email,
    city AS location
FROM customers

UNION ALL

SELECT
    'Employee' AS contact_type,
    employee_id AS id,
    CONCAT(first_name, ' ', last_name) AS name,
    CONCAT(first_name, '.', last_name, '@company.com') AS email,
    city AS location
FROM employees_hierarchy
WHERE city IS NOT NULL

ORDER BY contact_type, name;
```

### Advanced UNION Scenarios

```sql
-- Create comprehensive business directory
SELECT
    'High Value Customer' AS category,
    customer_id AS id,
    CONCAT(first_name, ' ', last_name) AS name,
    email AS contact,
    city,
    customer_totals.total_spent AS value
FROM customers c
JOIN (
    SELECT customer_id, SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
    HAVING SUM(total_amount) > 1000
) customer_totals ON c.customer_id = customer_totals.customer_id

UNION ALL

SELECT
    'Key Employee' AS category,
    employee_id AS id,
    CONCAT(first_name, ' ', last_name) AS name,
    CONCAT(first_name, '.', last_name, '@company.com') AS contact,
    department AS city,
    salary AS value
FROM employees_hierarchy
WHERE level_in_hierarchy <= 3

UNION ALL

SELECT
    'Top Supplier' AS category,
    supplier_id AS id,
    supplier_name AS name,
    contact_person AS contact,
    country AS city,
    rating * 1000 AS value
FROM suppliers
WHERE rating >= 4.0

ORDER BY category, value DESC;
```

## Cross Database JOINs 🌐

Sometimes you need to join tables from different databases or systems.

```sql
-- Cross-database queries (MySQL syntax)
SELECT
    sales_db.customers.customer_id,
    sales_db.customers.first_name,
    sales_db.customers.last_name,
    inventory_db.product_locations.warehouse,
    inventory_db.product_locations.quantity_available
FROM sales_db.customers
JOIN sales_db.orders ON sales_db.customers.customer_id = sales_db.orders.customer_id
JOIN sales_db.order_items ON sales_db.orders.order_id = sales_db.order_items.order_id
JOIN inventory_db.product_locations ON sales_db.order_items.product_id = inventory_db.product_locations.product_id
WHERE sales_db.orders.order_date >= '2024-08-01';

-- Alternative approach using database prefixes
USE sales_db;
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    pl.warehouse,
    pl.quantity_available
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN inventory_db.product_locations pl ON oi.product_id = pl.product_id
WHERE o.order_date >= '2024-08-01';
```

## Conditional JOINs 🎯

Advanced JOINs with conditional logic for complex business rules.

### Dynamic JOIN Conditions

```sql
-- Products with their best supplier based on different criteria
SELECT
    p.product_name,
    s.supplier_name,
    ps.supply_price,
    ps.lead_time_days,
    s.rating,
    'Best Price' AS selection_criteria
FROM products p
JOIN product_suppliers ps ON p.product_id = ps.product_id
JOIN suppliers s ON ps.supplier_id = s.supplier_id
WHERE ps.supply_price = (
    SELECT MIN(ps2.supply_price)
    FROM product_suppliers ps2
    WHERE ps2.product_id = p.product_id
)

UNION ALL

SELECT
    p.product_name,
    s.supplier_name,
    ps.supply_price,
    ps.lead_time_days,
    s.rating,
    'Fastest Delivery' AS selection_criteria
FROM products p
JOIN product_suppliers ps ON p.product_id = ps.product_id
JOIN suppliers s ON ps.supplier_id = s.supplier_id
WHERE ps.lead_time_days = (
    SELECT MIN(ps2.lead_time_days)
    FROM product_suppliers ps2
    WHERE ps2.product_id = p.product_id
)

ORDER BY product_name, selection_criteria;
```

### Time-Based JOINs

```sql
-- Orders with their delivery performance
CREATE TABLE shipments (
    shipment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    shipped_date DATE,
    delivered_date DATE,
    carrier VARCHAR(100),
    tracking_number VARCHAR(100),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

INSERT INTO shipments VALUES
(1, 1, '2024-08-02', '2024-08-05', 'FastShip Express', 'FS123456789'),
(2, 2, '2024-08-03', '2024-08-06', 'QuickDelivery', 'QD987654321'),
(3, 3, '2024-08-04', '2024-08-07', 'FastShip Express', 'FS246813579'),
(4, 4, '2024-08-05', NULL, 'SlowPost', 'SP135792468'),
(5, 5, '2024-08-06', '2024-08-09', 'QuickDelivery', 'QD864209753');

-- Complex time-based analysis
SELECT
    o.order_id,
    o.order_date,
    o.status,
    s.shipped_date,
    s.delivered_date,
    s.carrier,

    -- Time calculations
    DATEDIFF(s.shipped_date, o.order_date) AS days_to_ship,
    DATEDIFF(s.delivered_date, s.shipped_date) AS days_in_transit,
    DATEDIFF(s.delivered_date, o.order_date) AS total_delivery_days,

    -- Performance metrics
    CASE
        WHEN DATEDIFF(s.shipped_date, o.order_date) <= 1 THEN 'Fast Processing'
        WHEN DATEDIFF(s.shipped_date, o.order_date) <= 3 THEN 'Standard Processing'
        ELSE 'Slow Processing'
    END AS processing_speed,

    CASE
        WHEN s.delivered_date IS NULL THEN 'In Transit'
        WHEN DATEDIFF(s.delivered_date, s.shipped_date) <= 3 THEN 'Fast Delivery'
        WHEN DATEDIFF(s.delivered_date, s.shipped_date) <= 7 THEN 'Standard Delivery'
        ELSE 'Slow Delivery'
    END AS delivery_speed,

    -- Customer information
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name

FROM orders o
LEFT JOIN shipments s ON o.order_id = s.order_id
JOIN customers c ON o.customer_id = c.customer_id
ORDER BY o.order_date DESC;
```

## Performance Optimization for Complex JOINs 🚀

### Index Strategies

```sql
-- Comprehensive indexing strategy for complex JOINs
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);
CREATE INDEX idx_order_items_composite ON order_items(order_id, product_id, quantity);
CREATE INDEX idx_products_category_price ON products(category_id, price);
CREATE INDEX idx_employees_manager_dept ON employees_hierarchy(manager_id, department);
CREATE INDEX idx_shipments_order_dates ON shipments(order_id, shipped_date, delivered_date);

-- Covering indexes for frequently accessed columns
CREATE INDEX idx_customer_details ON customers(customer_id, first_name, last_name, email, city);
CREATE INDEX idx_product_details ON products(product_id, product_name, price, stock_quantity);
```

### Query Optimization Techniques

```sql
-- Use STRAIGHT_JOIN to force join order (MySQL)
SELECT STRAIGHT_JOIN
    o.order_id,
    c.customer_id,
    p.product_name
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.order_date >= '2024-08-01';

-- Use EXISTS instead of IN for large datasets
SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
    AND o.order_date >= '2024-08-01'
);

-- Optimize with derived tables
SELECT
    customer_summary.customer_id,
    customer_summary.order_count,
    customer_summary.total_spent,
    c.first_name,
    c.last_name
FROM (
    SELECT
        customer_id,
        COUNT(*) AS order_count,
        SUM(total_amount) AS total_spent
    FROM orders
    WHERE order_date >= '2024-01-01'
    GROUP BY customer_id
    HAVING COUNT(*) > 2
) customer_summary
JOIN customers c ON customer_summary.customer_id = c.customer_id
ORDER BY customer_summary.total_spent DESC;
```

## Real-World Complex JOIN Examples 🏢

### Customer Segmentation Analysis

```sql
-- Comprehensive customer analysis with multiple JOINs
SELECT
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email,
    c.city,
    c.country,

    -- Order statistics
    customer_stats.total_orders,
    customer_stats.total_spent,
    customer_stats.avg_order_value,
    customer_stats.first_order_date,
    customer_stats.last_order_date,
    DATEDIFF(CURRENT_DATE(), customer_stats.last_order_date) AS days_since_last_order,

    -- Product preferences
    category_prefs.favorite_category,
    category_prefs.categories_purchased,

    -- Customer classification
    CASE
        WHEN customer_stats.total_spent > 2000 THEN 'VIP'
        WHEN customer_stats.total_spent > 1000 THEN 'Premium'
        WHEN customer_stats.total_spent > 500 THEN 'Regular'
        ELSE 'New'
    END AS customer_tier,

    CASE
        WHEN DATEDIFF(CURRENT_DATE(), customer_stats.last_order_date) <= 30 THEN 'Active'
        WHEN DATEDIFF(CURRENT_DATE(), customer_stats.last_order_date) <= 90 THEN 'At Risk'
        ELSE 'Inactive'
    END AS activity_status

FROM customers c
LEFT JOIN (
    -- Customer order statistics
    SELECT
        customer_id,
        COUNT(*) AS total_orders,
        SUM(total_amount) AS total_spent,
        ROUND(AVG(total_amount), 2) AS avg_order_value,
        MIN(order_date) AS first_order_date,
        MAX(order_date) AS last_order_date
    FROM orders
    GROUP BY customer_id
) customer_stats ON c.customer_id = customer_stats.customer_id

LEFT JOIN (
    -- Customer category preferences
    SELECT
        o.customer_id,
        GROUP_CONCAT(DISTINCT cat.category_name ORDER BY category_revenue DESC) AS favorite_category,
        COUNT(DISTINCT cat.category_id) AS categories_purchased
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    JOIN categories cat ON p.category_id = cat.category_id
    JOIN (
        -- Find each customer's highest revenue category
        SELECT
            o2.customer_id,
            cat2.category_id,
            SUM(oi2.quantity * oi2.unit_price) AS category_revenue,
            ROW_NUMBER() OVER (PARTITION BY o2.customer_id ORDER BY SUM(oi2.quantity * oi2.unit_price) DESC) AS rn
        FROM orders o2
        JOIN order_items oi2 ON o2.order_id = oi2.order_id
        JOIN products p2 ON oi2.product_id = p2.product_id
        JOIN categories cat2 ON p2.category_id = cat2.category_id
        GROUP BY o2.customer_id, cat2.category_id
    ) top_cat ON o.customer_id = top_cat.customer_id AND cat.category_id = top_cat.category_id AND top_cat.rn = 1
    GROUP BY o.customer_id
) category_prefs ON c.customer_id = category_prefs.customer_id

ORDER BY customer_stats.total_spent DESC NULLS LAST;
```

## Practice Exercises 💪

### Exercise 1: Hierarchical Data

```sql
-- 1. Create a full organizational chart showing all reporting relationships
-- 2. Find all employees who report to a specific manager (direct and indirect)
-- 3. Calculate the total salary cost for each manager's team
-- 4. Find employees with no direct reports
-- 5. Identify the longest reporting chain in the organization
```

### Exercise 2: Complex Business Analysis

```sql
-- 1. Create a supplier performance scorecard with multiple metrics
-- 2. Analyze customer purchasing patterns across different time periods
-- 3. Build a product recommendation system using purchase history
-- 4. Create a comprehensive sales territory analysis
-- 5. Develop a customer churn prediction model using historical data
```

### Exercise 3: Performance Optimization

```sql
-- 1. Optimize a slow multi-table JOIN query
-- 2. Create appropriate indexes for complex JOIN scenarios
-- 3. Compare different JOIN strategies for the same business requirement
-- 4. Analyze query execution plans for complex JOINs
-- 5. Implement caching strategies for frequently joined data
```

## Next Steps ➡️

You've now mastered advanced JOIN techniques! These skills enable you to handle complex business scenarios and create sophisticated analytical queries. Next, we'll explore Window Functions, which provide powerful analytical capabilities for advanced data analysis.

---

## Quick Reference 📚

### Advanced JOIN Patterns

```sql
-- Self JOIN for hierarchies
SELECT e.name, m.name as manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id

-- Multiple table JOINs
SELECT * FROM table1 t1
JOIN table2 t2 ON t1.id = t2.t1_id
JOIN table3 t3 ON t2.id = t3.t2_id

-- UNION operations
SELECT col1, col2 FROM table1 UNION ALL SELECT col1, col2 FROM table2

-- Conditional JOINs
JOIN table2 ON table1.id = table2.id AND table2.status = 'active'
```

### Performance Tips

-   ✅ Create covering indexes for frequently joined columns
-   ✅ Use EXISTS instead of IN for large datasets
-   ✅ Consider derived tables for complex aggregations
-   ✅ Monitor query execution plans
-   ✅ Use appropriate JOIN order for optimal performance
