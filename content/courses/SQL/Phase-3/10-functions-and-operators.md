# SQL Functions and Operators

## Introduction to SQL Functions 🧮

SQL functions are pre-built operations that perform calculations, manipulate strings, work with dates, and much more. They are essential tools for data processing, analysis, and transformation within your queries.

## Categories of SQL Functions 📊

Functions in SQL are typically categorized into:

-   **Aggregate Functions**: Operate on groups of rows (SUM, COUNT, AVG)
-   **Scalar Functions**: Operate on individual values (UPPER, LENGTH, ROUND)
-   **Date/Time Functions**: Work with date and time values
-   **Mathematical Functions**: Perform mathematical operations
-   **String Functions**: Manipulate text data
-   **Conditional Functions**: Implement conditional logic
-   **Window Functions**: Advanced analytical functions (covered later)

## String Functions 📝

### Case Conversion Functions

```sql
-- Convert text case
SELECT
    first_name,
    UPPER(first_name) AS uppercase_name,
    LOWER(first_name) AS lowercase_name,
    INITCAP(first_name) AS proper_case,  -- PostgreSQL/Oracle
    CONCAT(UPPER(LEFT(first_name, 1)), LOWER(SUBSTRING(first_name, 2))) AS title_case  -- MySQL
FROM customers;

-- Practical example: Clean email addresses
UPDATE customers
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL;
```

### String Length and Manipulation

```sql
-- String length and substring operations
SELECT
    product_name,
    LENGTH(product_name) AS name_length,
    CHAR_LENGTH(product_name) AS char_count,  -- Same as LENGTH in most cases
    LEFT(product_name, 10) AS first_10_chars,
    RIGHT(product_name, 5) AS last_5_chars,
    SUBSTRING(product_name, 3, 5) AS middle_5_chars,
    MID(product_name, 2, 8) AS mid_substring  -- MySQL alternative
FROM products;

-- String position and searching
SELECT
    email,
    LOCATE('@', email) AS at_position,          -- MySQL
    POSITION('@' IN email) AS at_position_std,  -- Standard SQL
    INSTR(email, '@') AS at_position_oracle     -- Oracle/MySQL
FROM customers
WHERE email IS NOT NULL;
```

### String Concatenation

```sql
-- Different ways to concatenate strings
SELECT
    first_name,
    last_name,

    -- Standard SQL concatenation
    CONCAT(first_name, ' ', last_name) AS full_name,

    -- Multiple arguments
    CONCAT(first_name, ' ', last_name, ' (', email, ')') AS full_info,

    -- With separator
    CONCAT_WS(' ', first_name, last_name) AS full_name_ws,  -- MySQL/PostgreSQL
    CONCAT_WS(' - ', first_name, last_name, city) AS detailed_info,

    -- Pipe operator (PostgreSQL, Oracle, SQL Server)
    -- first_name || ' ' || last_name AS full_name_pipe

FROM customers;

-- Practical example: Create display names
SELECT
    customer_id,
    CONCAT(
        UPPER(LEFT(first_name, 1)),
        LOWER(SUBSTRING(first_name, 2)),
        ' ',
        UPPER(LEFT(last_name, 1)),
        LOWER(SUBSTRING(last_name, 2))
    ) AS display_name,
    CONCAT(last_name, ', ', first_name) AS formal_name
FROM customers;
```

### String Trimming and Padding

```sql
-- Remove whitespace and pad strings
SELECT
    '   Hello World   ' AS original,
    TRIM('   Hello World   ') AS trimmed,
    LTRIM('   Hello World   ') AS left_trimmed,
    RTRIM('   Hello World   ') AS right_trimmed,
    TRIM('x' FROM 'xxxHello Worldxxx') AS trim_specific_char;

-- Padding strings
SELECT
    product_name,
    LPAD(product_name, 20, '*') AS left_padded,
    RPAD(product_name, 20, '-') AS right_padded,
    LPAD(CAST(product_id AS CHAR), 5, '0') AS padded_id  -- Zero-pad IDs
FROM products;

-- Clean up data example
UPDATE customers
SET
    first_name = TRIM(first_name),
    last_name = TRIM(last_name),
    email = TRIM(LOWER(email))
WHERE first_name IS NOT NULL;
```

### String Replacement and Pattern Matching

```sql
-- Replace text within strings
SELECT
    product_name,
    REPLACE(product_name, 'Laptop', 'Computer') AS modified_name,
    REPLACE(email, '@example.com', '@company.com') AS new_email
FROM products p
JOIN customers c ON 1=1  -- Cross join for example
LIMIT 5;

-- Pattern matching with LIKE
SELECT * FROM products WHERE product_name LIKE 'Smart%';     -- Starts with 'Smart'
SELECT * FROM products WHERE product_name LIKE '%phone';    -- Ends with 'phone'
SELECT * FROM products WHERE product_name LIKE '%book%';    -- Contains 'book'
SELECT * FROM products WHERE product_name LIKE '_aptop';    -- Second char + 'aptop'

-- Regular expressions (MySQL)
SELECT * FROM customers
WHERE email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';  -- Valid email pattern

-- PostgreSQL regular expressions
-- SELECT * FROM customers WHERE email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
```

## Numeric Functions 🔢

### Mathematical Operations

```sql
-- Basic math functions
SELECT
    price,
    ABS(price - 100) AS price_difference,
    ROUND(price, 0) AS rounded_price,
    ROUND(price, 1) AS price_one_decimal,
    CEIL(price) AS ceiling_price,
    CEILING(price) AS ceiling_price_alt,  -- Alternative name
    FLOOR(price) AS floor_price,
    TRUNCATE(price, 1) AS truncated_price  -- MySQL
FROM products;

-- Advanced math functions
SELECT
    price,
    SQRT(price) AS square_root,
    POWER(price, 2) AS price_squared,
    POW(price, 0.5) AS price_sqrt_alt,
    LOG(price) AS natural_log,
    LOG10(price) AS log_base_10,
    EXP(1) AS euler_number,
    PI() AS pi_value
FROM products
WHERE price > 0;
```

### Random Numbers

```sql
-- Generate random numbers
SELECT
    RAND() AS random_decimal,                    -- 0 to 1
    RAND() * 100 AS random_percentage,           -- 0 to 100
    FLOOR(RAND() * 100) + 1 AS random_1_to_100, -- 1 to 100 integer
    ROUND(RAND() * 1000, 2) AS random_price;    -- Random price

-- Random sampling
SELECT * FROM customers
ORDER BY RAND()
LIMIT 3;  -- Get 3 random customers

-- PostgreSQL random
-- SELECT RANDOM(), customer_id FROM customers ORDER BY RANDOM() LIMIT 3;
```

### Aggregate Functions with Numbers

```sql
-- Statistical functions
SELECT
    category_id,
    COUNT(*) AS product_count,
    SUM(price) AS total_price,
    AVG(price) AS average_price,
    MIN(price) AS cheapest_price,
    MAX(price) AS most_expensive,
    STDDEV(price) AS price_std_deviation,  -- Standard deviation
    VARIANCE(price) AS price_variance      -- Variance
FROM products
GROUP BY category_id;
```

## Date and Time Functions 📅

### Current Date and Time

```sql
-- Get current date and time
SELECT
    NOW() AS current_datetime,           -- MySQL
    CURRENT_TIMESTAMP AS current_ts,     -- Standard SQL
    CURRENT_DATE AS current_date,        -- Date only
    CURRENT_TIME AS current_time,        -- Time only
    CURDATE() AS current_date_mysql,     -- MySQL date
    CURTIME() AS current_time_mysql,     -- MySQL time
    UNIX_TIMESTAMP() AS unix_timestamp,  -- Seconds since 1970
    SYSDATE() AS system_date;            -- MySQL system date

-- PostgreSQL equivalents
-- SELECT NOW(), CURRENT_TIMESTAMP, CURRENT_DATE, CURRENT_TIME, LOCALTIMESTAMP;
```

### Date Extraction

```sql
-- Extract parts of dates
SELECT
    order_date,
    YEAR(order_date) AS order_year,
    MONTH(order_date) AS order_month,
    DAY(order_date) AS order_day,
    DAYOFWEEK(order_date) AS day_of_week,     -- 1=Sunday, 7=Saturday
    DAYOFYEAR(order_date) AS day_of_year,     -- 1-366
    WEEK(order_date) AS week_number,          -- Week of year
    MONTHNAME(order_date) AS month_name,      -- MySQL
    DAYNAME(order_date) AS day_name,          -- MySQL
    QUARTER(order_date) AS quarter            -- 1-4
FROM orders;

-- PostgreSQL date extraction
-- SELECT EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date) FROM orders;
```

### Date Arithmetic

```sql
-- Add and subtract time periods
SELECT
    order_date,
    DATE_ADD(order_date, INTERVAL 30 DAY) AS due_date,
    DATE_SUB(order_date, INTERVAL 1 WEEK) AS week_before,
    DATE_ADD(order_date, INTERVAL 3 MONTH) AS quarterly_review,
    DATE_ADD(order_date, INTERVAL 1 YEAR) AS anniversary,

    -- Alternative syntax
    order_date + INTERVAL 30 DAY AS due_date_alt,
    order_date - INTERVAL 7 DAY AS week_before_alt
FROM orders;

-- Calculate differences between dates
SELECT
    order_date,
    CURRENT_DATE AS today,
    DATEDIFF(CURRENT_DATE, order_date) AS days_since_order,
    DATEDIFF(order_date, '2024-01-01') AS days_from_new_year,
    TIMESTAMPDIFF(MONTH, order_date, CURRENT_DATE) AS months_since_order,
    TIMESTAMPDIFF(YEAR, order_date, CURRENT_DATE) AS years_since_order
FROM orders;
```

### Date Formatting

```sql
-- Format dates for display
SELECT
    order_date,
    DATE_FORMAT(order_date, '%Y-%m-%d') AS iso_date,
    DATE_FORMAT(order_date, '%M %d, %Y') AS formatted_date,
    DATE_FORMAT(order_date, '%W, %M %e, %Y') AS full_date,
    DATE_FORMAT(order_date, '%d/%m/%Y') AS european_date,
    DATE_FORMAT(order_date, '%Y-%m') AS year_month,
    DATE_FORMAT(NOW(), '%H:%i:%s') AS current_time_formatted
FROM orders;

-- Common date format codes:
-- %Y = 4-digit year, %y = 2-digit year
-- %M = Full month name, %m = numeric month, %b = abbreviated month
-- %D = Day with suffix (1st, 2nd), %d = numeric day, %e = day without leading zero
-- %W = Full weekday name, %w = numeric weekday
-- %H = 24-hour format hour, %h = 12-hour format hour
-- %i = minutes, %s = seconds
```

### Working with Time Zones

```sql
-- Time zone conversions (MySQL)
SELECT
    NOW() AS local_time,
    UTC_TIMESTAMP() AS utc_time,
    CONVERT_TZ(NOW(), 'SYSTEM', 'UTC') AS converted_utc,
    CONVERT_TZ(NOW(), 'SYSTEM', 'US/Eastern') AS eastern_time,
    CONVERT_TZ(NOW(), 'SYSTEM', 'Europe/London') AS london_time;

-- PostgreSQL time zone handling
-- SELECT NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'US/Eastern';
```

## Conditional Functions 🎭

### CASE Statements

```sql
-- Simple CASE statement
SELECT
    product_name,
    price,
    CASE
        WHEN price < 50 THEN 'Budget'
        WHEN price < 200 THEN 'Mid-range'
        WHEN price < 500 THEN 'Premium'
        ELSE 'Luxury'
    END AS price_category,

    CASE
        WHEN stock_quantity = 0 THEN 'Out of Stock'
        WHEN stock_quantity < 10 THEN 'Low Stock'
        WHEN stock_quantity < 50 THEN 'In Stock'
        ELSE 'Well Stocked'
    END AS stock_status
FROM products;

-- CASE in calculations
SELECT
    customer_id,
    SUM(total_amount) AS total_spent,
    SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) AS delivered_amount,
    SUM(CASE WHEN status = 'cancelled' THEN total_amount ELSE 0 END) AS cancelled_amount,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) AS delivered_orders
FROM orders
GROUP BY customer_id;
```

### NULL Handling Functions

```sql
-- Handle NULL values
SELECT
    first_name,
    last_name,
    phone,

    -- Return first non-NULL value
    COALESCE(phone, email, 'No contact info') AS primary_contact,

    -- MySQL specific functions
    IFNULL(phone, 'No phone') AS phone_display,
    IF(phone IS NULL, 'Missing', 'Available') AS phone_status,

    -- NULLIF - return NULL if values are equal
    NULLIF(first_name, last_name) AS different_names
FROM customers;

-- SQL Server/PostgreSQL alternatives
-- ISNULL(phone, 'No phone') -- SQL Server
-- CASE WHEN phone IS NULL THEN 'No phone' ELSE phone END -- Universal
```

### Conditional Aggregation

```sql
-- Conditional counting and summing
SELECT
    category_id,
    COUNT(*) AS total_products,
    SUM(CASE WHEN price > 100 THEN 1 ELSE 0 END) AS expensive_products,
    SUM(CASE WHEN stock_quantity > 0 THEN 1 ELSE 0 END) AS available_products,
    AVG(CASE WHEN price > 0 THEN price END) AS avg_price_exclude_free,
    MAX(CASE WHEN stock_quantity > 0 THEN price END) AS max_available_price
FROM products
GROUP BY category_id;
```

## Conversion Functions 🔄

### Data Type Conversion

```sql
-- Convert between data types
SELECT
    product_id,
    CAST(product_id AS CHAR) AS id_as_string,
    CAST(price AS SIGNED) AS price_as_integer,
    CAST('2024-08-11' AS DATE) AS string_to_date,
    CAST(NOW() AS DATE) AS datetime_to_date,

    -- MySQL specific CONVERT function
    CONVERT(product_id, CHAR) AS id_converted,
    CONVERT(price, DECIMAL(8,0)) AS price_no_decimals
FROM products;

-- String to number conversions
SELECT
    '123.45' AS original_string,
    CAST('123.45' AS DECIMAL(10,2)) AS as_decimal,
    '123.45' + 0 AS implicit_conversion,  -- MySQL trick
    FORMAT(123456.789, 2) AS formatted_number  -- Formats with thousands separator
FROM dual;  -- MySQL's dummy table
```

### Safe Conversions

```sql
-- Handle conversion errors gracefully
SELECT
    product_name,
    -- Try to extract numbers from product names
    CASE
        WHEN product_name REGEXP '[0-9]+' THEN
            CAST(REGEXP_SUBSTR(product_name, '[0-9]+') AS UNSIGNED)
        ELSE 0
    END AS extracted_number
FROM products;

-- PostgreSQL safe conversion
-- SELECT product_name,
--        CASE WHEN product_name ~ '[0-9]+'
--             THEN (regexp_matches(product_name, '[0-9]+'))[1]::integer
--             ELSE 0 END
-- FROM products;
```

## Advanced Function Usage 🎯

### Nested Functions

```sql
-- Combine multiple functions
SELECT
    customer_id,
    UPPER(
        CONCAT(
            LEFT(first_name, 1),
            '. ',
            last_name
        )
    ) AS formal_name,

    ROUND(
        DATEDIFF(CURRENT_DATE, created_at) / 365.25,
        1
    ) AS years_as_customer,

    FORMAT(
        ROUND(
            RAND() * 1000,
            2
        ),
        2
    ) AS random_formatted_number
FROM customers;
```

### Functions in Different Clauses

```sql
-- Functions in WHERE, ORDER BY, and GROUP BY
SELECT
    YEAR(order_date) AS order_year,
    MONTH(order_date) AS order_month,
    COUNT(*) AS order_count,
    SUM(total_amount) AS monthly_total,
    AVG(total_amount) AS avg_order_value
FROM orders
WHERE YEAR(order_date) = 2024
  AND MONTH(order_date) >= 8
GROUP BY YEAR(order_date), MONTH(order_date)
HAVING COUNT(*) > 1
ORDER BY YEAR(order_date) DESC, MONTH(order_date) DESC;

-- Functions in subqueries
SELECT *
FROM customers c
WHERE MONTH(created_at) = MONTH(CURRENT_DATE)
  AND customer_id IN (
    SELECT customer_id
    FROM orders
    WHERE YEAR(order_date) = YEAR(CURRENT_DATE)
  );
```

## User-Defined Functions (Advanced) 🛠️

### MySQL Stored Functions

```sql
-- Create a custom function to calculate age
DELIMITER //
CREATE FUNCTION calculate_age(birth_date DATE)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN TIMESTAMPDIFF(YEAR, birth_date, CURDATE());
END //
DELIMITER ;

-- Use the custom function
SELECT
    first_name,
    last_name,
    calculate_age('1990-05-15') AS age
FROM customers;
```

## Performance Considerations 🚀

### Function Performance Tips

```sql
-- Avoid functions on indexed columns in WHERE clauses
-- Slow: Function prevents index usage
SELECT * FROM orders WHERE YEAR(order_date) = 2024;

-- Fast: Range query uses index
SELECT * FROM orders
WHERE order_date >= '2024-01-01'
  AND order_date < '2025-01-01';

-- Use functional indexes when functions are necessary
-- CREATE INDEX idx_order_year ON orders((YEAR(order_date)));
```

### Efficient Function Usage

```sql
-- Calculate once, use multiple times
SELECT
    customer_id,
    total_amount,
    @tax_rate := 0.08 AS tax_rate,  -- Calculate once
    total_amount * @tax_rate AS tax_amount,
    total_amount + (total_amount * @tax_rate) AS total_with_tax
FROM orders;

-- Use CASE instead of multiple function calls
SELECT
    customer_id,
    CASE
        WHEN total_amount < 100 THEN total_amount * 0.05
        WHEN total_amount < 500 THEN total_amount * 0.10
        ELSE total_amount * 0.15
    END AS discount_amount
FROM orders;
```

## Common Patterns and Use Cases 📋

### Data Cleaning Functions

```sql
-- Comprehensive data cleaning
SELECT
    customer_id,
    TRIM(UPPER(first_name)) AS clean_first_name,
    TRIM(UPPER(last_name)) AS clean_last_name,
    LOWER(TRIM(email)) AS clean_email,
    REPLACE(REPLACE(phone, '-', ''), ' ', '') AS clean_phone,
    CASE
        WHEN country = '' THEN NULL
        ELSE UPPER(TRIM(country))
    END AS clean_country
FROM customers;
```

### Reporting Functions

```sql
-- Business reporting with functions
SELECT
    DATE_FORMAT(order_date, '%Y-%m') AS month,
    COUNT(*) AS total_orders,
    ROUND(AVG(total_amount), 2) AS avg_order_value,
    ROUND(SUM(total_amount), 2) AS monthly_revenue,
    CONCAT('$', FORMAT(SUM(total_amount), 2)) AS formatted_revenue,
    ROUND(
        (SUM(total_amount) / LAG(SUM(total_amount)) OVER (ORDER BY DATE_FORMAT(order_date, '%Y-%m')) - 1) * 100,
        1
    ) AS growth_percentage
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY month;
```

## Practice Exercises 💪

### Exercise 1: String Manipulation

```sql
-- 1. Create email usernames from customer names (first.last@company.com)
-- 2. Extract domain names from existing email addresses
-- 3. Create product codes by combining category and product name
-- 4. Clean up phone numbers to standard format
-- 5. Find customers with similar names (using string functions)
```

### Exercise 2: Date Calculations

```sql
-- 1. Calculate customer tenure in years and months
-- 2. Find orders placed on weekends
-- 3. Group sales by quarter and year
-- 4. Calculate average days between orders for each customer
-- 5. Find seasonal sales patterns by month
```

### Exercise 3: Conditional Logic

```sql
-- 1. Categorize customers by spending levels
-- 2. Create a customer satisfaction score based on order history
-- 3. Calculate dynamic shipping costs based on location and order value
-- 4. Generate product recommendations based on category preferences
-- 5. Create a customer risk assessment using multiple factors
```

## Next Steps ➡️

Now that you've mastered SQL functions and operators, you can manipulate and analyze data in sophisticated ways! Next, we'll explore grouping and aggregation, which will let you create powerful summary reports and analytics.

---

## Quick Reference 📚

### Essential String Functions

```sql
CONCAT(), UPPER(), LOWER(), TRIM(), LENGTH()
SUBSTRING(), LEFT(), RIGHT(), REPLACE()
LIKE, REGEXP, LOCATE(), POSITION()
```

### Key Date Functions

```sql
NOW(), CURRENT_DATE, YEAR(), MONTH(), DAY()
DATE_ADD(), DATE_SUB(), DATEDIFF()
DATE_FORMAT(), STR_TO_DATE()
```

### Important Math Functions

```sql
ROUND(), CEIL(), FLOOR(), ABS()
SUM(), AVG(), COUNT(), MIN(), MAX()
RAND(), SQRT(), POWER()
```

### Conditional Functions

```sql
CASE WHEN ... THEN ... ELSE ... END
COALESCE(), IFNULL(), NULLIF()
IF() -- MySQL specific
```
