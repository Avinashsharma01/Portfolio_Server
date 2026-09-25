# Window Functions and Analytical Queries

## Introduction to Window Functions 🪟

Window functions are one of the most powerful features in modern SQL, providing advanced analytical capabilities that go far beyond simple aggregations. They allow you to perform calculations across sets of table rows that are related to the current row, without needing to group the result set.

## Understanding Window Functions 🎯

Window functions operate on a set of rows (called a "window") and return a single value for each row in the original result set, unlike aggregate functions which collapse multiple rows into one.

### Basic Syntax and Structure

```sql
-- General window function syntax
SELECT
    column1,
    column2,
    window_function() OVER (
        [PARTITION BY partition_columns]
        [ORDER BY order_columns]
        [ROWS/RANGE window_frame]
    ) AS result_column
FROM table_name;
```

### Fundamental Window Functions

```sql
-- Sample data for demonstrations
CREATE TABLE sales_performance (
    sales_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    employee_name VARCHAR(100),
    department VARCHAR(50),
    region VARCHAR(50),
    sale_date DATE,
    sale_amount DECIMAL(10,2),
    product_category VARCHAR(50),
    customer_tier VARCHAR(20)
);

INSERT INTO sales_performance VALUES
(1, 101, 'John Smith', 'Electronics', 'North', '2024-08-01', 1500.00, 'Laptops', 'Premium'),
(2, 102, 'Sarah Wilson', 'Electronics', 'North', '2024-08-01', 2200.00, 'Smartphones', 'VIP'),
(3, 103, 'Mike Johnson', 'Clothing', 'South', '2024-08-01', 800.00, 'Shirts', 'Regular'),
(4, 101, 'John Smith', 'Electronics', 'North', '2024-08-02', 1800.00, 'Tablets', 'Premium'),
(5, 104, 'Lisa Brown', 'Electronics', 'East', '2024-08-02', 3200.00, 'Laptops', 'VIP'),
(6, 102, 'Sarah Wilson', 'Electronics', 'North', '2024-08-02', 1600.00, 'Accessories', 'Premium'),
(7, 105, 'David Lee', 'Clothing', 'West', '2024-08-02', 950.00, 'Pants', 'Regular'),
(8, 103, 'Mike Johnson', 'Clothing', 'South', '2024-08-03', 1200.00, 'Jackets', 'Premium'),
(9, 106, 'Emma Davis', 'Home & Garden', 'North', '2024-08-03', 2800.00, 'Furniture', 'VIP'),
(10, 104, 'Lisa Brown', 'Electronics', 'East', '2024-08-03', 2600.00, 'Smartphones', 'VIP'),
(11, 107, 'Tom Wilson', 'Home & Garden', 'South', '2024-08-03', 1400.00, 'Tools', 'Premium'),
(12, 105, 'David Lee', 'Clothing', 'West', '2024-08-04', 1100.00, 'Shoes', 'Regular'),
(13, 108, 'Anna Taylor', 'Electronics', 'East', '2024-08-04', 2900.00, 'Gaming', 'VIP'),
(14, 109, 'Bob Miller', 'Clothing', 'North', '2024-08-04', 750.00, 'Accessories', 'Regular'),
(15, 110, 'Carol White', 'Home & Garden', 'West', '2024-08-04', 3500.00, 'Appliances', 'VIP');
```

## Ranking Functions 🏆

Ranking functions assign ranks to rows based on specified criteria.

### ROW_NUMBER, RANK, and DENSE_RANK

```sql
-- Comprehensive ranking analysis
SELECT
    employee_name,
    department,
    region,
    sale_amount,
    sale_date,

    -- ROW_NUMBER: Unique sequential integers
    ROW_NUMBER() OVER (ORDER BY sale_amount DESC) AS row_num_overall,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY sale_amount DESC) AS row_num_by_dept,

    -- RANK: Same values get same rank, gaps appear
    RANK() OVER (ORDER BY sale_amount DESC) AS rank_overall,
    RANK() OVER (PARTITION BY department ORDER BY sale_amount DESC) AS rank_by_dept,

    -- DENSE_RANK: Same values get same rank, no gaps
    DENSE_RANK() OVER (ORDER BY sale_amount DESC) AS dense_rank_overall,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY sale_amount DESC) AS dense_rank_by_dept,

    -- PERCENT_RANK: Relative rank as percentage
    ROUND(PERCENT_RANK() OVER (ORDER BY sale_amount DESC) * 100, 2) AS percentile_rank,

    -- NTILE: Divide into buckets
    NTILE(4) OVER (ORDER BY sale_amount DESC) AS quartile,
    NTILE(10) OVER (ORDER BY sale_amount DESC) AS decile

FROM sales_performance
ORDER BY sale_amount DESC;

-- Top performers by department
SELECT
    department,
    employee_name,
    sale_amount,
    sale_date,
    RANK() OVER (PARTITION BY department ORDER BY sale_amount DESC) AS dept_rank
FROM sales_performance
WHERE RANK() OVER (PARTITION BY department ORDER BY sale_amount DESC) <= 3
ORDER BY department, dept_rank;
```

### Advanced Ranking Scenarios

```sql
-- Multiple criteria ranking
SELECT
    employee_name,
    department,
    sale_amount,
    customer_tier,

    -- Rank by multiple criteria
    RANK() OVER (
        ORDER BY
            CASE WHEN customer_tier = 'VIP' THEN 1
                 WHEN customer_tier = 'Premium' THEN 2
                 ELSE 3 END,
            sale_amount DESC
    ) AS strategic_rank,

    -- Conditional ranking
    CASE
        WHEN customer_tier = 'VIP' THEN
            RANK() OVER (PARTITION BY customer_tier ORDER BY sale_amount DESC)
        ELSE NULL
    END AS vip_only_rank,

    -- Performance percentiles
    ROUND(CUME_DIST() OVER (ORDER BY sale_amount) * 100, 2) AS cumulative_distribution

FROM sales_performance
ORDER BY strategic_rank;

-- Sales performance tiers
SELECT
    employee_name,
    department,
    total_sales,
    avg_sale,
    sale_count,

    -- Performance classification
    CASE
        WHEN NTILE(5) OVER (ORDER BY total_sales DESC) = 1 THEN 'Top Performer'
        WHEN NTILE(5) OVER (ORDER BY total_sales DESC) = 2 THEN 'High Performer'
        WHEN NTILE(5) OVER (ORDER BY total_sales DESC) = 3 THEN 'Average Performer'
        WHEN NTILE(5) OVER (ORDER BY total_sales DESC) = 4 THEN 'Below Average'
        ELSE 'Needs Improvement'
    END AS performance_tier,

    NTILE(5) OVER (ORDER BY total_sales DESC) AS quintile

FROM (
    SELECT
        employee_name,
        department,
        SUM(sale_amount) AS total_sales,
        ROUND(AVG(sale_amount), 2) AS avg_sale,
        COUNT(*) AS sale_count
    FROM sales_performance
    GROUP BY employee_name, department
) employee_summary
ORDER BY total_sales DESC;
```

## Aggregate Window Functions 📊

Window functions can use aggregate functions to provide running totals, moving averages, and cumulative statistics.

### Running Totals and Cumulative Analysis

```sql
-- Comprehensive cumulative analysis
SELECT
    sale_date,
    employee_name,
    department,
    sale_amount,

    -- Running totals
    SUM(sale_amount) OVER (
        ORDER BY sale_date, sales_id
        ROWS UNBOUNDED PRECEDING
    ) AS running_total_overall,

    SUM(sale_amount) OVER (
        PARTITION BY department
        ORDER BY sale_date, sales_id
        ROWS UNBOUNDED PRECEDING
    ) AS running_total_by_dept,

    SUM(sale_amount) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date, sales_id
        ROWS UNBOUNDED PRECEDING
    ) AS employee_cumulative_sales,

    -- Moving averages
    ROUND(AVG(sale_amount) OVER (
        ORDER BY sale_date, sales_id
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2) AS moving_avg_3_sales,

    ROUND(AVG(sale_amount) OVER (
        PARTITION BY department
        ORDER BY sale_date, sales_id
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ), 2) AS dept_moving_avg_5,

    -- Running count
    COUNT(*) OVER (
        ORDER BY sale_date, sales_id
        ROWS UNBOUNDED PRECEDING
    ) AS total_sales_count,

    -- Running maximum and minimum
    MAX(sale_amount) OVER (
        ORDER BY sale_date, sales_id
        ROWS UNBOUNDED PRECEDING
    ) AS highest_sale_so_far,

    MIN(sale_amount) OVER (
        ORDER BY sale_date, sales_id
        ROWS UNBOUNDED PRECEDING
    ) AS lowest_sale_so_far

FROM sales_performance
ORDER BY sale_date, sales_id;
```

### Window Frames - ROWS vs RANGE

```sql
-- Understanding window frames
SELECT
    sale_date,
    sale_amount,

    -- ROWS: Physical number of rows
    SUM(sale_amount) OVER (
        ORDER BY sale_date
        ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
    ) AS sum_rows_1_before_after,

    -- RANGE: Logical range of values
    SUM(sale_amount) OVER (
        ORDER BY sale_date
        RANGE BETWEEN INTERVAL 1 DAY PRECEDING AND INTERVAL 1 DAY FOLLOWING
    ) AS sum_range_1_day_before_after,

    -- Different frame specifications
    AVG(sale_amount) OVER (
        ORDER BY sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS avg_from_start,

    AVG(sale_amount) OVER (
        ORDER BY sale_date
        ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING
    ) AS avg_to_end,

    SUM(sale_amount) OVER (
        ORDER BY sale_date
        ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING
    ) AS sum_2_around

FROM sales_performance
ORDER BY sale_date, sales_id;
```

## Offset Functions 🔄

Offset functions allow you to access data from other rows relative to the current row.

### LAG and LEAD Functions

```sql
-- Previous and next value analysis
SELECT
    sale_date,
    employee_name,
    department,
    sale_amount,

    -- Previous values
    LAG(sale_amount) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
    ) AS previous_sale,

    LAG(sale_amount, 2) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
    ) AS sale_2_before,

    LAG(sale_date) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
    ) AS previous_sale_date,

    -- Next values
    LEAD(sale_amount) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
    ) AS next_sale,

    LEAD(sale_date) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
    ) AS next_sale_date,

    -- Calculations with offset values
    sale_amount - LAG(sale_amount) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
    ) AS sale_change,

    ROUND(
        (sale_amount - LAG(sale_amount) OVER (
            PARTITION BY employee_name
            ORDER BY sale_date
        )) / LAG(sale_amount) OVER (
            PARTITION BY employee_name
            ORDER BY sale_date
        ) * 100, 2
    ) AS sale_change_percent,

    -- Days between sales
    DATEDIFF(
        sale_date,
        LAG(sale_date) OVER (
            PARTITION BY employee_name
            ORDER BY sale_date
        )
    ) AS days_since_last_sale

FROM sales_performance
ORDER BY employee_name, sale_date;
```

### Advanced Offset Analysis

```sql
-- Trend analysis with offset functions
SELECT
    employee_name,
    sale_date,
    sale_amount,

    -- Compare with first and last sales
    FIRST_VALUE(sale_amount) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
        ROWS UNBOUNDED PRECEDING
    ) AS first_sale,

    LAST_VALUE(sale_amount) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS last_sale,

    -- Performance trend analysis
    CASE
        WHEN sale_amount > LAG(sale_amount) OVER (
            PARTITION BY employee_name ORDER BY sale_date
        ) THEN 'Improving'
        WHEN sale_amount < LAG(sale_amount) OVER (
            PARTITION BY employee_name ORDER BY sale_date
        ) THEN 'Declining'
        WHEN sale_amount = LAG(sale_amount) OVER (
            PARTITION BY employee_name ORDER BY sale_date
        ) THEN 'Stable'
        ELSE 'First Sale'
    END AS trend,

    -- Sales streak analysis
    CASE
        WHEN sale_amount > LAG(sale_amount) OVER (
            PARTITION BY employee_name ORDER BY sale_date
        ) THEN 1
        ELSE 0
    END AS improvement_flag

FROM sales_performance
ORDER BY employee_name, sale_date;
```

## Complex Analytical Queries 🔍

### Multi-Dimensional Analysis

```sql
-- Comprehensive business intelligence analysis
SELECT
    department,
    region,
    employee_name,
    sale_date,
    sale_amount,
    customer_tier,

    -- Department analysis
    SUM(sale_amount) OVER (PARTITION BY department) AS dept_total_sales,
    ROUND(sale_amount / SUM(sale_amount) OVER (PARTITION BY department) * 100, 2) AS dept_contribution_percent,
    RANK() OVER (PARTITION BY department ORDER BY sale_amount DESC) AS dept_rank,

    -- Regional analysis
    SUM(sale_amount) OVER (PARTITION BY region) AS region_total_sales,
    ROUND(sale_amount / SUM(sale_amount) OVER (PARTITION BY region) * 100, 2) AS region_contribution_percent,
    RANK() OVER (PARTITION BY region ORDER BY sale_amount DESC) AS region_rank,

    -- Time-based analysis
    SUM(sale_amount) OVER (PARTITION BY sale_date) AS daily_total_sales,
    ROUND(sale_amount / SUM(sale_amount) OVER (PARTITION BY sale_date) * 100, 2) AS daily_contribution_percent,

    -- Customer tier analysis
    AVG(sale_amount) OVER (PARTITION BY customer_tier) AS tier_avg_sale,
    RANK() OVER (PARTITION BY customer_tier ORDER BY sale_amount DESC) AS tier_rank,

    -- Overall percentiles
    ROUND(PERCENT_RANK() OVER (ORDER BY sale_amount) * 100, 2) AS overall_percentile,
    NTILE(100) OVER (ORDER BY sale_amount) AS percentile_bucket,

    -- Complex ranking
    DENSE_RANK() OVER (
        PARTITION BY department, customer_tier
        ORDER BY sale_amount DESC
    ) AS dept_tier_rank

FROM sales_performance
ORDER BY department, region, sale_amount DESC;
```

### Time Series Analysis

```sql
-- Advanced time series analysis
WITH daily_metrics AS (
    SELECT
        sale_date,
        department,
        SUM(sale_amount) AS daily_sales,
        COUNT(*) AS daily_transactions,
        AVG(sale_amount) AS daily_avg_sale
    FROM sales_performance
    GROUP BY sale_date, department
)
SELECT
    sale_date,
    department,
    daily_sales,
    daily_transactions,
    daily_avg_sale,

    -- Moving averages
    ROUND(AVG(daily_sales) OVER (
        PARTITION BY department
        ORDER BY sale_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2) AS sales_3day_ma,

    -- Growth rates
    ROUND((daily_sales - LAG(daily_sales) OVER (
        PARTITION BY department ORDER BY sale_date
    )) / LAG(daily_sales) OVER (
        PARTITION BY department ORDER BY sale_date
    ) * 100, 2) AS daily_growth_rate,

    -- Cumulative metrics
    SUM(daily_sales) OVER (
        PARTITION BY department
        ORDER BY sale_date
        ROWS UNBOUNDED PRECEDING
    ) AS cumulative_sales,

    -- Variance analysis
    daily_sales - AVG(daily_sales) OVER (
        PARTITION BY department
    ) AS variance_from_dept_avg,

    -- Ranking within time period
    RANK() OVER (
        PARTITION BY department
        ORDER BY daily_sales DESC
    ) AS daily_rank_in_dept

FROM daily_metrics
ORDER BY department, sale_date;
```

## Performance Analysis and Comparison 📈

### Employee Performance Dashboard

```sql
-- Comprehensive employee performance analysis
WITH employee_stats AS (
    SELECT
        employee_name,
        department,
        region,
        COUNT(*) AS total_sales,
        SUM(sale_amount) AS total_revenue,
        ROUND(AVG(sale_amount), 2) AS avg_sale_amount,
        MIN(sale_amount) AS min_sale,
        MAX(sale_amount) AS max_sale,
        MIN(sale_date) AS first_sale_date,
        MAX(sale_date) AS last_sale_date
    FROM sales_performance
    GROUP BY employee_name, department, region
)
SELECT
    employee_name,
    department,
    region,
    total_sales,
    total_revenue,
    avg_sale_amount,
    max_sale - min_sale AS sale_range,
    DATEDIFF(last_sale_date, first_sale_date) + 1 AS active_days,

    -- Performance rankings
    RANK() OVER (ORDER BY total_revenue DESC) AS revenue_rank,
    RANK() OVER (ORDER BY avg_sale_amount DESC) AS avg_sale_rank,
    RANK() OVER (ORDER BY total_sales DESC) AS volume_rank,

    -- Department comparisons
    RANK() OVER (PARTITION BY department ORDER BY total_revenue DESC) AS dept_revenue_rank,
    ROUND(total_revenue / SUM(total_revenue) OVER (PARTITION BY department) * 100, 2) AS dept_revenue_share,

    -- Performance categories
    CASE
        WHEN NTILE(4) OVER (ORDER BY total_revenue DESC) = 1 THEN 'Top Performer'
        WHEN NTILE(4) OVER (ORDER BY total_revenue DESC) = 2 THEN 'High Performer'
        WHEN NTILE(4) OVER (ORDER BY total_revenue DESC) = 3 THEN 'Good Performer'
        ELSE 'Developing'
    END AS performance_category,

    -- Efficiency metrics
    ROUND(total_revenue / total_sales, 2) AS revenue_per_sale,
    ROUND(total_revenue / (DATEDIFF(last_sale_date, first_sale_date) + 1), 2) AS revenue_per_day

FROM employee_stats
ORDER BY total_revenue DESC;
```

### Market Segment Analysis

```sql
-- Multi-dimensional market analysis
SELECT
    customer_tier,
    product_category,
    department,
    region,

    -- Segment metrics
    COUNT(*) AS transaction_count,
    SUM(sale_amount) AS segment_revenue,
    ROUND(AVG(sale_amount), 2) AS avg_transaction_value,

    -- Market share analysis
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS transaction_share_percent,
    ROUND(SUM(sale_amount) * 100.0 / SUM(SUM(sale_amount)) OVER (), 2) AS revenue_share_percent,

    -- Tier analysis
    ROUND(SUM(sale_amount) * 100.0 / SUM(SUM(sale_amount)) OVER (PARTITION BY customer_tier), 2) AS tier_revenue_share,

    -- Category analysis
    ROUND(SUM(sale_amount) * 100.0 / SUM(SUM(sale_amount)) OVER (PARTITION BY product_category), 2) AS category_revenue_share,

    -- Regional analysis
    ROUND(SUM(sale_amount) * 100.0 / SUM(SUM(sale_amount)) OVER (PARTITION BY region), 2) AS region_revenue_share,

    -- Performance ranking
    RANK() OVER (ORDER BY SUM(sale_amount) DESC) AS segment_rank,
    DENSE_RANK() OVER (ORDER BY ROUND(AVG(sale_amount), 2) DESC) AS avg_value_rank

FROM sales_performance
GROUP BY customer_tier, product_category, department, region
HAVING COUNT(*) >= 1  -- Filter for segments with activity
ORDER BY segment_revenue DESC;
```

## Advanced Window Function Techniques 🎓

### Conditional Aggregation with Windows

```sql
-- Conditional aggregation using window functions
SELECT
    employee_name,
    sale_date,
    sale_amount,
    customer_tier,

    -- Conditional sums
    SUM(CASE WHEN customer_tier = 'VIP' THEN sale_amount ELSE 0 END) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
        ROWS UNBOUNDED PRECEDING
    ) AS cumulative_vip_sales,

    SUM(CASE WHEN customer_tier = 'Premium' THEN sale_amount ELSE 0 END) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
        ROWS UNBOUNDED PRECEDING
    ) AS cumulative_premium_sales,

    -- Conditional counts
    COUNT(CASE WHEN sale_amount > 2000 THEN 1 END) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
        ROWS UNBOUNDED PRECEDING
    ) AS high_value_sales_count,

    -- Conditional averages
    ROUND(AVG(CASE WHEN customer_tier = 'VIP' THEN sale_amount END) OVER (
        PARTITION BY employee_name
        ORDER BY sale_date
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ), 2) AS recent_vip_avg,

    -- Performance flags
    CASE
        WHEN sale_amount > AVG(sale_amount) OVER (
            PARTITION BY employee_name
            ORDER BY sale_date
            ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING
        ) THEN 'Above Recent Average'
        ELSE 'Below Recent Average'
    END AS performance_vs_recent

FROM sales_performance
ORDER BY employee_name, sale_date;
```

### Gap and Island Analysis

```sql
-- Find consecutive patterns in data
WITH sales_with_gaps AS (
    SELECT
        employee_name,
        sale_date,
        sale_amount,

        -- Identify gaps in sales activity
        LAG(sale_date) OVER (PARTITION BY employee_name ORDER BY sale_date) AS prev_sale_date,
        DATEDIFF(sale_date, LAG(sale_date) OVER (PARTITION BY employee_name ORDER BY sale_date)) AS days_gap,

        -- Mark significant gaps (more than 1 day)
        CASE
            WHEN DATEDIFF(sale_date, LAG(sale_date) OVER (PARTITION BY employee_name ORDER BY sale_date)) > 1
            OR LAG(sale_date) OVER (PARTITION BY employee_name ORDER BY sale_date) IS NULL
            THEN 1
            ELSE 0
        END AS is_gap_start
    FROM sales_performance
),
sales_with_groups AS (
    SELECT
        *,
        -- Create grouping for consecutive sales periods
        SUM(is_gap_start) OVER (
            PARTITION BY employee_name
            ORDER BY sale_date
            ROWS UNBOUNDED PRECEDING
        ) AS sales_group
    FROM sales_with_gaps
)
SELECT
    employee_name,
    sales_group,
    COUNT(*) AS consecutive_sales,
    MIN(sale_date) AS period_start,
    MAX(sale_date) AS period_end,
    SUM(sale_amount) AS period_total,
    ROUND(AVG(sale_amount), 2) AS period_avg
FROM sales_with_groups
GROUP BY employee_name, sales_group
ORDER BY employee_name, period_start;
```

## Practice Exercises 💪

### Exercise 1: Sales Analysis

```sql
-- 1. Create a rolling 3-day sales report for each department
-- 2. Find the top and bottom performing days for each employee
-- 3. Calculate month-over-month growth rates
-- 4. Identify sales trends (improving, declining, stable) for each employee
-- 5. Create a balanced scorecard with multiple performance metrics
```

### Exercise 2: Customer Segmentation

```sql
-- 1. Segment customers based on recency, frequency, and monetary value
-- 2. Track customer lifecycle stages using window functions
-- 3. Calculate customer lifetime value with running totals
-- 4. Identify customer churn patterns using gap analysis
-- 5. Create cohort analysis for customer retention
```

### Exercise 3: Advanced Analytics

```sql
-- 1. Build a forecasting model using historical trends
-- 2. Create anomaly detection using statistical window functions
-- 3. Implement A/B test analysis with window functions
-- 4. Design territory performance comparisons
-- 5. Build a real-time dashboard with key performance indicators
```

## Database-Specific Window Functions 🛠️

### MySQL 8.0+ Features

```sql
-- Named windows
SELECT
    employee_name,
    sale_amount,
    RANK() OVER w AS sales_rank,
    PERCENT_RANK() OVER w AS sales_percentile
FROM sales_performance
WINDOW w AS (ORDER BY sale_amount DESC);

-- JSON functions with windows
SELECT
    department,
    JSON_ARRAYAGG(
        JSON_OBJECT('employee', employee_name, 'amount', sale_amount)
        ORDER BY sale_amount DESC
    ) AS top_performers
FROM (
    SELECT department, employee_name, sale_amount,
           ROW_NUMBER() OVER (PARTITION BY department ORDER BY sale_amount DESC) as rn
    FROM sales_performance
) ranked
WHERE rn <= 3
GROUP BY department;
```

### PostgreSQL Extensions

```sql
-- Array aggregates with windows
SELECT
    department,
    employee_name,
    sale_amount,
    ARRAY_AGG(sale_amount) OVER (
        PARTITION BY department
        ORDER BY sale_date
        ROWS 2 PRECEDING
    ) AS recent_sales_array
FROM sales_performance;

-- String aggregation
SELECT
    department,
    STRING_AGG(employee_name, ', ' ORDER BY sale_amount DESC) AS employee_list
FROM sales_performance
GROUP BY department;
```

## Performance Optimization 🚀

### Indexing for Window Functions

```sql
-- Optimal indexes for window function performance
CREATE INDEX idx_sales_employee_date ON sales_performance(employee_name, sale_date);
CREATE INDEX idx_sales_dept_amount ON sales_performance(department, sale_amount DESC);
CREATE INDEX idx_sales_date_amount ON sales_performance(sale_date, sale_amount);

-- Covering index for common window queries
CREATE INDEX idx_sales_comprehensive ON sales_performance(
    department, employee_name, sale_date, sale_amount, customer_tier
);
```

### Query Optimization Tips

```sql
-- Use CTEs for complex window calculations
WITH sales_ranked AS (
    SELECT *,
           RANK() OVER (PARTITION BY department ORDER BY sale_amount DESC) as dept_rank
    FROM sales_performance
)
SELECT * FROM sales_ranked WHERE dept_rank <= 5;

-- Avoid window functions in WHERE clauses
-- Instead of: WHERE RANK() OVER (...) <= 5
-- Use subquery or CTE as shown above
```

## Next Steps ➡️

Congratulations! You've mastered window functions, one of the most powerful features in modern SQL. These analytical capabilities enable sophisticated business intelligence and data analysis. Next, we'll explore Stored Procedures and Functions to encapsulate complex business logic.

---

## Quick Reference 📚

### Window Function Categories

```sql
-- Ranking functions
ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE(), PERCENT_RANK(), CUME_DIST()

-- Aggregate functions
SUM(), AVG(), COUNT(), MIN(), MAX()

-- Offset functions
LAG(), LEAD(), FIRST_VALUE(), LAST_VALUE()

-- Window frame syntax
ROWS BETWEEN start AND end
RANGE BETWEEN start AND end
```

### Performance Tips

-   ✅ Create appropriate indexes on PARTITION BY and ORDER BY columns
-   ✅ Use named windows for multiple functions with same specification
-   ✅ Avoid window functions in WHERE clauses
-   ✅ Consider CTEs for complex window calculations
-   ✅ Use covering indexes for frequently accessed columns
