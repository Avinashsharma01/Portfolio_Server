# Grouping and Aggregation

## Introduction to GROUP BY 📊

The GROUP BY clause is used to group rows that have the same values in specified columns into summary rows. It's typically used with aggregate functions to perform calculations on each group of data.

## Basic GROUP BY Syntax 📝

```sql
SELECT column1, aggregate_function(column2)
FROM table_name
WHERE condition
GROUP BY column1, column2, ...
HAVING condition
ORDER BY column1, column2, ...;
```

## Understanding Aggregation 🔢

Aggregate functions operate on a set of values and return a single value. They are the foundation of data analysis and reporting.

### Common Aggregate Functions

```sql
-- Set up sample data for examples
CREATE TABLE sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    salesperson VARCHAR(50),
    region VARCHAR(50),
    product_category VARCHAR(50),
    sale_amount DECIMAL(10,2),
    sale_date DATE,
    quantity_sold INT
);

INSERT INTO sales VALUES
(1, 'John', 'North', 'Electronics', 1200.50, '2024-08-01', 3),
(2, 'Jane', 'South', 'Clothing', 650.75, '2024-08-01', 5),
(3, 'John', 'North', 'Electronics', 800.25, '2024-08-02', 2),
(4, 'Bob', 'East', 'Books', 450.00, '2024-08-02', 10),
(5, 'Jane', 'South', 'Electronics', 950.00, '2024-08-03', 1),
(6, 'Alice', 'West', 'Clothing', 720.30, '2024-08-03', 6),
(7, 'John', 'North', 'Books', 325.75, '2024-08-04', 8),
(8, 'Bob', 'East', 'Electronics', 1100.00, '2024-08-04', 4);

-- Basic aggregate functions
SELECT
    COUNT(*) AS total_sales,                    -- Count all rows
    COUNT(sale_amount) AS non_null_amounts,     -- Count non-NULL values
    COUNT(DISTINCT salesperson) AS unique_salespeople,
    SUM(sale_amount) AS total_revenue,
    AVG(sale_amount) AS average_sale,
    MIN(sale_amount) AS smallest_sale,
    MAX(sale_amount) AS largest_sale,
    STDDEV(sale_amount) AS standard_deviation,   -- MySQL/PostgreSQL
    VARIANCE(sale_amount) AS variance
FROM sales;
```

## Simple GROUP BY Examples 🎯

### Group by Single Column

```sql
-- Sales by salesperson
SELECT
    salesperson,
    COUNT(*) AS number_of_sales,
    SUM(sale_amount) AS total_sales,
    AVG(sale_amount) AS average_sale,
    MIN(sale_amount) AS min_sale,
    MAX(sale_amount) AS max_sale
FROM sales
GROUP BY salesperson
ORDER BY total_sales DESC;

-- Sales by region
SELECT
    region,
    COUNT(*) AS total_transactions,
    SUM(sale_amount) AS regional_revenue,
    ROUND(AVG(sale_amount), 2) AS avg_transaction_value
FROM sales
GROUP BY region
ORDER BY regional_revenue DESC;

-- Sales by product category
SELECT
    product_category,
    COUNT(*) AS sales_count,
    SUM(quantity_sold) AS total_quantity,
    SUM(sale_amount) AS category_revenue,
    ROUND(SUM(sale_amount) / SUM(quantity_sold), 2) AS avg_price_per_unit
FROM sales
GROUP BY product_category;
```

### Group by Multiple Columns

```sql
-- Sales by salesperson and region
SELECT
    salesperson,
    region,
    COUNT(*) AS sales_count,
    SUM(sale_amount) AS total_sales,
    ROUND(AVG(sale_amount), 2) AS avg_sale
FROM sales
GROUP BY salesperson, region
ORDER BY salesperson, region;

-- Sales by region and product category
SELECT
    region,
    product_category,
    COUNT(*) AS transactions,
    SUM(sale_amount) AS revenue,
    SUM(quantity_sold) AS units_sold
FROM sales
GROUP BY region, product_category
ORDER BY region, revenue DESC;
```

## GROUP BY with Date Functions 📅

### Group by Date Parts

```sql
-- Sales by date
SELECT
    sale_date,
    COUNT(*) AS daily_transactions,
    SUM(sale_amount) AS daily_revenue,
    AVG(sale_amount) AS avg_transaction
FROM sales
GROUP BY sale_date
ORDER BY sale_date;

-- Sales by month (if you had more data)
SELECT
    YEAR(sale_date) AS year,
    MONTH(sale_date) AS month,
    MONTHNAME(sale_date) AS month_name,
    COUNT(*) AS monthly_transactions,
    SUM(sale_amount) AS monthly_revenue
FROM sales
GROUP BY YEAR(sale_date), MONTH(sale_date)
ORDER BY year, month;

-- Sales by day of week
SELECT
    DAYNAME(sale_date) AS day_of_week,
    DAYOFWEEK(sale_date) AS day_number,
    COUNT(*) AS transactions,
    SUM(sale_amount) AS revenue,
    ROUND(AVG(sale_amount), 2) AS avg_transaction
FROM sales
GROUP BY DAYOFWEEK(sale_date), DAYNAME(sale_date)
ORDER BY day_number;
```

### Rolling Aggregations

```sql
-- Add more sample data for better rolling examples
INSERT INTO sales VALUES
(9, 'John', 'North', 'Electronics', 1350.00, '2024-08-05', 2),
(10, 'Jane', 'South', 'Books', 275.50, '2024-08-05', 3),
(11, 'Alice', 'West', 'Electronics', 890.75, '2024-08-06', 1),
(12, 'Bob', 'East', 'Clothing', 560.25, '2024-08-06', 4);

-- Daily running totals
SELECT
    sale_date,
    SUM(sale_amount) AS daily_sales,
    SUM(SUM(sale_amount)) OVER (ORDER BY sale_date) AS running_total,
    AVG(SUM(sale_amount)) OVER (ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS three_day_avg
FROM sales
GROUP BY sale_date
ORDER BY sale_date;
```

## HAVING Clause - Filtering Groups 🔍

The HAVING clause filters groups after they've been formed, unlike WHERE which filters individual rows before grouping.

### Basic HAVING Examples

```sql
-- Salespeople with more than 2 sales
SELECT
    salesperson,
    COUNT(*) AS sales_count,
    SUM(sale_amount) AS total_sales
FROM sales
GROUP BY salesperson
HAVING COUNT(*) > 2;

-- Regions with average sale > $700
SELECT
    region,
    COUNT(*) AS transactions,
    ROUND(AVG(sale_amount), 2) AS avg_sale,
    SUM(sale_amount) AS total_revenue
FROM sales
GROUP BY region
HAVING AVG(sale_amount) > 700;

-- Categories with total sales > $1000
SELECT
    product_category,
    COUNT(*) AS sales_count,
    SUM(sale_amount) AS total_revenue
FROM sales
GROUP BY product_category
HAVING SUM(sale_amount) > 1000;
```

### Complex HAVING Conditions

```sql
-- Multiple HAVING conditions
SELECT
    salesperson,
    region,
    COUNT(*) AS sales_count,
    SUM(sale_amount) AS total_sales,
    AVG(sale_amount) AS avg_sale
FROM sales
GROUP BY salesperson, region
HAVING COUNT(*) >= 2
   AND SUM(sale_amount) > 1000
   AND AVG(sale_amount) > 500;

-- HAVING with calculated fields
SELECT
    product_category,
    COUNT(*) AS transaction_count,
    SUM(sale_amount) AS total_revenue,
    SUM(quantity_sold) AS total_quantity,
    ROUND(SUM(sale_amount) / SUM(quantity_sold), 2) AS avg_price_per_unit
FROM sales
GROUP BY product_category
HAVING SUM(sale_amount) / SUM(quantity_sold) > 100;  -- Categories with avg price > $100
```

## Advanced Aggregation Techniques 🎨

### Conditional Aggregation

```sql
-- Count different types of sales per salesperson
SELECT
    salesperson,
    COUNT(*) AS total_sales,
    SUM(CASE WHEN sale_amount > 1000 THEN 1 ELSE 0 END) AS high_value_sales,
    SUM(CASE WHEN product_category = 'Electronics' THEN 1 ELSE 0 END) AS electronics_sales,
    SUM(CASE WHEN sale_amount > 1000 THEN sale_amount ELSE 0 END) AS high_value_revenue,
    ROUND(
        SUM(CASE WHEN sale_amount > 1000 THEN sale_amount ELSE 0 END) /
        SUM(sale_amount) * 100, 2
    ) AS high_value_percentage
FROM sales
GROUP BY salesperson;

-- Regional performance metrics
SELECT
    region,
    COUNT(*) AS total_transactions,
    COUNT(DISTINCT salesperson) AS unique_salespeople,
    COUNT(DISTINCT product_category) AS categories_sold,

    -- Revenue by category
    SUM(CASE WHEN product_category = 'Electronics' THEN sale_amount ELSE 0 END) AS electronics_revenue,
    SUM(CASE WHEN product_category = 'Clothing' THEN sale_amount ELSE 0 END) AS clothing_revenue,
    SUM(CASE WHEN product_category = 'Books' THEN sale_amount ELSE 0 END) AS books_revenue,

    -- Performance indicators
    ROUND(AVG(sale_amount), 2) AS avg_transaction,
    ROUND(STDDEV(sale_amount), 2) AS revenue_volatility
FROM sales
GROUP BY region;
```

### Nested Aggregations

```sql
-- Find salespeople who exceed regional average
SELECT
    s.salesperson,
    s.region,
    s.personal_avg,
    r.regional_avg,
    ROUND(s.personal_avg - r.regional_avg, 2) AS performance_diff
FROM (
    -- Individual salesperson averages
    SELECT
        salesperson,
        region,
        ROUND(AVG(sale_amount), 2) AS personal_avg
    FROM sales
    GROUP BY salesperson, region
) s
JOIN (
    -- Regional averages
    SELECT
        region,
        ROUND(AVG(sale_amount), 2) AS regional_avg
    FROM sales
    GROUP BY region
) r ON s.region = r.region
WHERE s.personal_avg > r.regional_avg;
```

## Grouping Sets and Advanced GROUP BY 📈

### GROUP BY with ROLLUP (MySQL 8.0+, PostgreSQL, SQL Server)

```sql
-- Hierarchical grouping with subtotals
SELECT
    region,
    product_category,
    COUNT(*) AS sales_count,
    SUM(sale_amount) AS total_revenue
FROM sales
GROUP BY region, product_category WITH ROLLUP;

-- This creates:
-- 1. Detail rows: Each region-category combination
-- 2. Region subtotals: Each region with all categories combined
-- 3. Grand total: All regions and categories combined
```

### Manual Rollup with UNION (MySQL compatible)

```sql
-- Manual rollup using UNION
SELECT
    region,
    product_category,
    COUNT(*) AS sales_count,
    SUM(sale_amount) AS total_revenue,
    'Detail' AS level_type
FROM sales
GROUP BY region, product_category

UNION ALL

SELECT
    region,
    'ALL CATEGORIES' AS product_category,
    COUNT(*) AS sales_count,
    SUM(sale_amount) AS total_revenue,
    'Region Total' AS level_type
FROM sales
GROUP BY region

UNION ALL

SELECT
    'ALL REGIONS' AS region,
    'ALL CATEGORIES' AS product_category,
    COUNT(*) AS sales_count,
    SUM(sale_amount) AS total_revenue,
    'Grand Total' AS level_type
FROM sales

ORDER BY
    CASE WHEN region = 'ALL REGIONS' THEN 'ZZZZ' ELSE region END,
    CASE WHEN product_category = 'ALL CATEGORIES' THEN 'ZZZZ' ELSE product_category END;
```

## Practical Business Examples 🏢

### Sales Performance Dashboard

```sql
-- Comprehensive sales dashboard
SELECT
    salesperson,
    region,

    -- Basic metrics
    COUNT(*) AS total_sales,
    ROUND(SUM(sale_amount), 2) AS total_revenue,
    ROUND(AVG(sale_amount), 2) AS avg_deal_size,

    -- Product mix
    COUNT(DISTINCT product_category) AS categories_sold,
    GROUP_CONCAT(DISTINCT product_category) AS categories_list,

    -- Performance indicators
    MIN(sale_amount) AS smallest_deal,
    MAX(sale_amount) AS largest_deal,
    ROUND(STDDEV(sale_amount), 2) AS deal_size_volatility,

    -- Date range
    MIN(sale_date) AS first_sale,
    MAX(sale_date) AS last_sale,
    DATEDIFF(MAX(sale_date), MIN(sale_date)) + 1 AS active_days,

    -- Productivity
    ROUND(SUM(sale_amount) / (DATEDIFF(MAX(sale_date), MIN(sale_date)) + 1), 2) AS daily_avg_revenue
FROM sales
GROUP BY salesperson, region
ORDER BY total_revenue DESC;
```

### Monthly Trend Analysis

```sql
-- Create more sample data for trend analysis
INSERT INTO sales VALUES
(13, 'John', 'North', 'Electronics', 1450.00, '2024-07-15', 2),
(14, 'Jane', 'South', 'Clothing', 380.50, '2024-07-20', 3),
(15, 'Bob', 'East', 'Books', 220.75, '2024-07-25', 5),
(16, 'Alice', 'West', 'Electronics', 1250.25, '2024-09-01', 1),
(17, 'John', 'North', 'Clothing', 495.80, '2024-09-05', 4);

-- Monthly trend analysis
SELECT
    YEAR(sale_date) AS year,
    MONTH(sale_date) AS month,
    MONTHNAME(sale_date) AS month_name,

    -- Volume metrics
    COUNT(*) AS transactions,
    SUM(quantity_sold) AS units_sold,

    -- Revenue metrics
    ROUND(SUM(sale_amount), 2) AS monthly_revenue,
    ROUND(AVG(sale_amount), 2) AS avg_transaction_value,

    -- Growth calculations (using window functions)
    ROUND(
        (SUM(sale_amount) - LAG(SUM(sale_amount)) OVER (ORDER BY YEAR(sale_date), MONTH(sale_date))) /
        LAG(SUM(sale_amount)) OVER (ORDER BY YEAR(sale_date), MONTH(sale_date)) * 100, 2
    ) AS month_over_month_growth,

    -- Market share by region (example)
    ROUND(
        SUM(CASE WHEN region = 'North' THEN sale_amount ELSE 0 END) / SUM(sale_amount) * 100, 1
    ) AS north_region_share
FROM sales
GROUP BY YEAR(sale_date), MONTH(sale_date)
ORDER BY year, month;
```

### Customer Segmentation Analysis

```sql
-- Create customer table for segmentation
CREATE TABLE customer_analysis AS
SELECT
    region AS customer_segment,
    COUNT(*) AS transaction_count,
    SUM(sale_amount) AS total_spent,
    AVG(sale_amount) AS avg_transaction,
    MIN(sale_date) AS first_purchase,
    MAX(sale_date) AS last_purchase,
    COUNT(DISTINCT product_category) AS category_diversity,

    -- Customer classification
    CASE
        WHEN SUM(sale_amount) > 2000 THEN 'High Value'
        WHEN SUM(sale_amount) > 1000 THEN 'Medium Value'
        ELSE 'Low Value'
    END AS value_segment,

    CASE
        WHEN COUNT(*) > 3 THEN 'Frequent'
        WHEN COUNT(*) > 1 THEN 'Regular'
        ELSE 'One-time'
    END AS frequency_segment
FROM sales
GROUP BY region;

-- View the customer segmentation
SELECT * FROM customer_analysis ORDER BY total_spent DESC;
```

## Performance Optimization for GROUP BY 🚀

### Indexing for GROUP BY

```sql
-- Create indexes to optimize GROUP BY queries
CREATE INDEX idx_sales_salesperson ON sales(salesperson);
CREATE INDEX idx_sales_region ON sales(region);
CREATE INDEX idx_sales_category ON sales(product_category);
CREATE INDEX idx_sales_date ON sales(sale_date);

-- Composite indexes for multiple GROUP BY columns
CREATE INDEX idx_sales_person_region ON sales(salesperson, region);
CREATE INDEX idx_sales_region_category ON sales(region, product_category);
CREATE INDEX idx_sales_date_region ON sales(sale_date, region);
```

### Efficient GROUP BY Techniques

```sql
-- Use LIMIT with GROUP BY for top-N queries
SELECT
    salesperson,
    SUM(sale_amount) AS total_sales
FROM sales
GROUP BY salesperson
ORDER BY total_sales DESC
LIMIT 3;  -- Top 3 salespeople

-- Use WHERE to filter before grouping (more efficient than HAVING for base conditions)
SELECT
    region,
    COUNT(*) AS recent_sales,
    SUM(sale_amount) AS recent_revenue
FROM sales
WHERE sale_date >= '2024-08-01'  -- Filter first
GROUP BY region
HAVING COUNT(*) > 1;  -- Then filter groups

-- Avoid functions in GROUP BY when possible
-- Less efficient:
SELECT
    YEAR(sale_date) AS year,
    COUNT(*) AS sales_count
FROM sales
GROUP BY YEAR(sale_date);

-- More efficient with computed column or materialized view:
-- ALTER TABLE sales ADD COLUMN sale_year INT AS (YEAR(sale_date));
-- CREATE INDEX idx_sales_year ON sales(sale_year);
-- SELECT sale_year, COUNT(*) FROM sales GROUP BY sale_year;
```

## Common Mistakes and Solutions ❗

### Mistake 1: SELECT columns not in GROUP BY

```sql
-- Wrong: sale_date is not in GROUP BY or aggregate function
-- SELECT salesperson, sale_date, SUM(sale_amount)
-- FROM sales
-- GROUP BY salesperson;  -- ERROR in most SQL databases

-- Correct: Include all non-aggregated columns in GROUP BY
SELECT
    salesperson,
    sale_date,
    SUM(sale_amount) AS daily_total
FROM sales
GROUP BY salesperson, sale_date;

-- Or use aggregate function
SELECT
    salesperson,
    MAX(sale_date) AS latest_sale_date,
    SUM(sale_amount) AS total_sales
FROM sales
GROUP BY salesperson;
```

### Mistake 2: Using WHERE instead of HAVING

```sql
-- Wrong: Can't use aggregate functions in WHERE
-- SELECT region, SUM(sale_amount) as total
-- FROM sales
-- WHERE SUM(sale_amount) > 1000  -- ERROR
-- GROUP BY region;

-- Correct: Use HAVING for aggregate conditions
SELECT
    region,
    SUM(sale_amount) AS total
FROM sales
GROUP BY region
HAVING SUM(sale_amount) > 1000;
```

### Mistake 3: Incorrect NULL handling

```sql
-- Consider how NULLs affect aggregations
CREATE TABLE test_sales AS SELECT * FROM sales;
UPDATE test_sales SET sale_amount = NULL WHERE sale_id = 1;

-- COUNT(*) counts all rows, COUNT(column) excludes NULLs
SELECT
    salesperson,
    COUNT(*) AS total_rows,           -- Includes NULLs
    COUNT(sale_amount) AS valid_sales, -- Excludes NULLs
    SUM(sale_amount) AS total_sales   -- NULLs don't affect SUM
FROM test_sales
GROUP BY salesperson;
```

## Practice Exercises 💪

### Exercise 1: Basic Aggregations

```sql
-- 1. Calculate total sales and average sale by each salesperson
-- 2. Find the number of unique products sold in each region
-- 3. Calculate the total quantity sold by product category
-- 4. Find the salesperson with the highest single sale
-- 5. Calculate daily sales totals and identify the best sales day
```

### Exercise 2: Advanced Grouping

```sql
-- 1. Create a sales report grouped by region and category with subtotals
-- 2. Find salespeople who have sales in multiple regions
-- 3. Calculate month-over-month growth for each region
-- 4. Identify the top 2 product categories by revenue in each region
-- 5. Calculate the percentage contribution of each salesperson to regional sales
```

### Exercise 3: Business Analysis

```sql
-- 1. Create a customer segmentation based on purchase behavior
-- 2. Analyze seasonal sales patterns by product category
-- 3. Find underperforming salespeople (below average for their region)
-- 4. Calculate customer lifetime value by segment
-- 5. Identify cross-selling opportunities between product categories
```

## Next Steps ➡️

You've now mastered grouping and aggregation - essential skills for data analysis and reporting! Next, we'll explore subqueries, which allow you to create more sophisticated queries by nesting queries within queries.

---

## Quick Reference 📚

### Essential Aggregate Functions

```sql
COUNT(*), COUNT(column), COUNT(DISTINCT column)
SUM(column), AVG(column)
MIN(column), MAX(column)
STDDEV(column), VARIANCE(column)
```

### GROUP BY Syntax

```sql
SELECT columns, aggregate_functions
FROM table
WHERE row_conditions
GROUP BY grouping_columns
HAVING group_conditions
ORDER BY columns;
```

### Key Concepts

-   **GROUP BY**: Groups rows with same values
-   **HAVING**: Filters groups (use after GROUP BY)
-   **WHERE**: Filters rows (use before GROUP BY)
-   **Aggregate Functions**: Operate on groups of rows
-   **ROLLUP**: Creates subtotals and grand totals
