# Stored Procedures and Functions

## Introduction to Stored Procedures and Functions 🏗️

Stored procedures and functions are precompiled SQL code blocks stored in the database that can be executed repeatedly. They encapsulate complex business logic, improve performance through compilation and caching, enhance security, and provide better code organization and reusability.

## Understanding the Differences 🔍

### Stored Procedures vs Functions

| Aspect                  | Stored Procedures                  | Functions                          |
| ----------------------- | ---------------------------------- | ---------------------------------- |
| **Return Value**        | Can return multiple values or none | Must return exactly one value      |
| **Usage**               | Called with CALL statement         | Used in SELECT statements          |
| **Transaction Control** | Can contain COMMIT/ROLLBACK        | Cannot contain transaction control |
| **Side Effects**        | Can modify database state          | Should be deterministic (pure)     |
| **Parameters**          | IN, OUT, INOUT parameters          | Only input parameters              |

## Creating Stored Procedures 📝

### Basic Stored Procedure Syntax

```sql
-- MySQL syntax for stored procedures
DELIMITER //

CREATE PROCEDURE procedure_name(
    IN parameter1 datatype,
    OUT parameter2 datatype,
    INOUT parameter3 datatype
)
BEGIN
    -- Procedure body
    -- SQL statements
    -- Control flow logic
END //

DELIMITER ;
```

### Simple Stored Procedures

```sql
-- Basic procedure to get customer order summary
DELIMITER //

CREATE PROCEDURE GetCustomerOrderSummary(
    IN customer_id_param INT
)
BEGIN
    SELECT
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.email,
        COUNT(o.order_id) AS total_orders,
        COALESCE(SUM(o.total_amount), 0) AS total_spent,
        COALESCE(ROUND(AVG(o.total_amount), 2), 0) AS average_order_value,
        MIN(o.order_date) AS first_order_date,
        MAX(o.order_date) AS last_order_date
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    WHERE c.customer_id = customer_id_param
    GROUP BY c.customer_id, c.first_name, c.last_name, c.email;
END //

DELIMITER ;

-- Execute the procedure
CALL GetCustomerOrderSummary(1);
```

### Procedures with Output Parameters

```sql
-- Procedure with output parameters
DELIMITER //

CREATE PROCEDURE CalculateCustomerMetrics(
    IN customer_id_param INT,
    OUT total_orders_out INT,
    OUT total_spent_out DECIMAL(10,2),
    OUT avg_order_value_out DECIMAL(10,2),
    OUT customer_tier_out VARCHAR(20)
)
BEGIN
    -- Calculate metrics
    SELECT
        COUNT(order_id),
        COALESCE(SUM(total_amount), 0),
        COALESCE(ROUND(AVG(total_amount), 2), 0)
    INTO total_orders_out, total_spent_out, avg_order_value_out
    FROM orders
    WHERE customer_id = customer_id_param;

    -- Determine customer tier
    IF total_spent_out >= 2000 THEN
        SET customer_tier_out = 'VIP';
    ELSEIF total_spent_out >= 1000 THEN
        SET customer_tier_out = 'Premium';
    ELSEIF total_spent_out >= 500 THEN
        SET customer_tier_out = 'Regular';
    ELSE
        SET customer_tier_out = 'New';
    END IF;
END //

DELIMITER ;

-- Execute with variables to capture output
SET @total_orders = 0;
SET @total_spent = 0;
SET @avg_order = 0;
SET @tier = '';

CALL CalculateCustomerMetrics(1, @total_orders, @total_spent, @avg_order, @tier);

SELECT @total_orders AS TotalOrders,
       @total_spent AS TotalSpent,
       @avg_order AS AvgOrderValue,
       @tier AS CustomerTier;
```

### Complex Business Logic Procedures

```sql
-- Advanced inventory management procedure
DELIMITER //

CREATE PROCEDURE ProcessOrderAndUpdateInventory(
    IN order_id_param INT,
    OUT success_flag BOOLEAN,
    OUT error_message VARCHAR(500)
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE product_id_var INT;
    DECLARE quantity_ordered INT;
    DECLARE current_stock INT;
    DECLARE product_name_var VARCHAR(100);

    -- Cursor for order items
    DECLARE order_cursor CURSOR FOR
        SELECT oi.product_id, oi.quantity, p.product_name, p.stock_quantity
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = order_id_param;

    -- Exception handler
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET success_flag = FALSE;
        SET error_message = 'Database error occurred during processing';
        ROLLBACK;
    END;

    -- Initialize output parameters
    SET success_flag = TRUE;
    SET error_message = '';

    -- Start transaction
    START TRANSACTION;

    -- Check if order exists and is in pending status
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_id = order_id_param AND status = 'Pending') THEN
        SET success_flag = FALSE;
        SET error_message = 'Order not found or not in pending status';
        ROLLBACK;
    ELSE
        -- Process each item in the order
        OPEN order_cursor;

        read_loop: LOOP
            FETCH order_cursor INTO product_id_var, quantity_ordered, product_name_var, current_stock;

            IF done THEN
                LEAVE read_loop;
            END IF;

            -- Check stock availability
            IF current_stock < quantity_ordered THEN
                SET success_flag = FALSE;
                SET error_message = CONCAT('Insufficient stock for product: ', product_name_var,
                                         '. Available: ', current_stock, ', Requested: ', quantity_ordered);
                CLOSE order_cursor;
                ROLLBACK;
                LEAVE read_loop;
            END IF;

            -- Update inventory
            UPDATE products
            SET stock_quantity = stock_quantity - quantity_ordered,
                last_updated = NOW()
            WHERE product_id = product_id_var;

        END LOOP;

        CLOSE order_cursor;

        -- If all items processed successfully, update order status
        IF success_flag THEN
            UPDATE orders
            SET status = 'Processing',
                updated_at = NOW()
            WHERE order_id = order_id_param;

            -- Log the transaction
            INSERT INTO inventory_log (order_id, processed_date, status)
            VALUES (order_id_param, NOW(), 'Inventory Updated');

            COMMIT;
            SET error_message = 'Order processed successfully';
        END IF;
    END IF;
END //

DELIMITER ;

-- Create supporting table for logging
CREATE TABLE IF NOT EXISTS inventory_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    processed_date DATETIME,
    status VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Execute the procedure
SET @success = FALSE;
SET @message = '';
CALL ProcessOrderAndUpdateInventory(1, @success, @message);
SELECT @success AS Success, @message AS Message;
```

## Creating Functions 🔧

### Scalar Functions

```sql
-- Simple function to calculate tax
DELIMITER //

CREATE FUNCTION CalculateTax(amount DECIMAL(10,2), tax_rate DECIMAL(5,4))
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN ROUND(amount * tax_rate, 2);
END //

DELIMITER ;

-- Use the function
SELECT
    order_id,
    total_amount,
    CalculateTax(total_amount, 0.085) AS tax_amount,
    total_amount + CalculateTax(total_amount, 0.085) AS total_with_tax
FROM orders;
```

### Advanced Functions with Business Logic

```sql
-- Function to determine customer loyalty level
DELIMITER //

CREATE FUNCTION GetCustomerLoyaltyLevel(customer_id_param INT)
RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_spent DECIMAL(10,2) DEFAULT 0;
    DECLARE order_count INT DEFAULT 0;
    DECLARE first_order_date DATE;
    DECLARE loyalty_level VARCHAR(20);

    -- Get customer metrics
    SELECT
        COALESCE(SUM(total_amount), 0),
        COUNT(*),
        MIN(order_date)
    INTO total_spent, order_count, first_order_date
    FROM orders
    WHERE customer_id = customer_id_param;

    -- Calculate tenure in months
    SET @tenure_months = TIMESTAMPDIFF(MONTH, first_order_date, CURDATE());

    -- Determine loyalty level based on multiple factors
    IF total_spent >= 5000 AND order_count >= 20 AND @tenure_months >= 12 THEN
        SET loyalty_level = 'Platinum';
    ELSEIF total_spent >= 2000 AND order_count >= 10 AND @tenure_months >= 6 THEN
        SET loyalty_level = 'Gold';
    ELSEIF total_spent >= 1000 AND order_count >= 5 AND @tenure_months >= 3 THEN
        SET loyalty_level = 'Silver';
    ELSEIF order_count >= 1 THEN
        SET loyalty_level = 'Bronze';
    ELSE
        SET loyalty_level = 'New';
    END IF;

    RETURN loyalty_level;
END //

DELIMITER ;

-- Use the function in queries
SELECT
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    GetCustomerLoyaltyLevel(c.customer_id) AS loyalty_level,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC;
```

### Table-Valued Functions (PostgreSQL/SQL Server style)

```sql
-- MySQL doesn't support table-valued functions directly, but we can use procedures
-- Here's how you would do it in PostgreSQL:

/*
-- PostgreSQL table-valued function
CREATE OR REPLACE FUNCTION GetTopCustomersByCategory(category_name VARCHAR)
RETURNS TABLE (
    customer_id INT,
    customer_name VARCHAR,
    total_spent DECIMAL,
    order_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name)::VARCHAR,
        COALESCE(SUM(o.total_amount), 0)::DECIMAL,
        COUNT(o.order_id)
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    JOIN categories cat ON p.category_id = cat.category_id
    WHERE cat.category_name = category_name
    GROUP BY c.customer_id, c.first_name, c.last_name
    ORDER BY SUM(o.total_amount) DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
*/

-- MySQL equivalent using procedure
DELIMITER //

CREATE PROCEDURE GetTopCustomersByCategory(
    IN category_name_param VARCHAR(100)
)
BEGIN
    SELECT
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        COALESCE(SUM(o.total_amount), 0) AS total_spent,
        COUNT(o.order_id) AS order_count
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    JOIN categories cat ON p.category_id = cat.category_id
    WHERE cat.category_name = category_name_param
    GROUP BY c.customer_id, c.first_name, c.last_name
    ORDER BY total_spent DESC
    LIMIT 10;
END //

DELIMITER ;

-- Execute the procedure
CALL GetTopCustomersByCategory('Electronics');
```

## Control Flow Structures 🔄

### Conditional Logic

```sql
-- Comprehensive procedure with control flow
DELIMITER //

CREATE PROCEDURE ProcessCustomerDiscount(
    IN customer_id_param INT,
    IN discount_type VARCHAR(20),
    OUT discount_amount DECIMAL(10,2),
    OUT discount_message VARCHAR(200)
)
BEGIN
    DECLARE customer_tier VARCHAR(20);
    DECLARE total_spent DECIMAL(10,2);
    DECLARE order_count INT;
    DECLARE last_order_date DATE;

    -- Get customer information
    SELECT GetCustomerLoyaltyLevel(customer_id_param) INTO customer_tier;

    SELECT
        COALESCE(SUM(total_amount), 0),
        COUNT(*),
        MAX(order_date)
    INTO total_spent, order_count, last_order_date
    FROM orders
    WHERE customer_id = customer_id_param;

    -- Initialize output
    SET discount_amount = 0;
    SET discount_message = 'No discount applicable';

    -- Process different discount types
    CASE discount_type
        WHEN 'LOYALTY' THEN
            CASE customer_tier
                WHEN 'Platinum' THEN
                    SET discount_amount = 100.00;
                    SET discount_message = 'Platinum loyalty discount applied';
                WHEN 'Gold' THEN
                    SET discount_amount = 50.00;
                    SET discount_message = 'Gold loyalty discount applied';
                WHEN 'Silver' THEN
                    SET discount_amount = 25.00;
                    SET discount_message = 'Silver loyalty discount applied';
                ELSE
                    SET discount_message = 'Customer tier not eligible for loyalty discount';
            END CASE;

        WHEN 'VOLUME' THEN
            IF total_spent >= 5000 THEN
                SET discount_amount = total_spent * 0.10;
                SET discount_message = '10% volume discount for high-value customers';
            ELSEIF total_spent >= 2000 THEN
                SET discount_amount = total_spent * 0.05;
                SET discount_message = '5% volume discount for valued customers';
            ELSE
                SET discount_message = 'Customer spending not eligible for volume discount';
            END IF;

        WHEN 'RETENTION' THEN
            IF DATEDIFF(CURDATE(), last_order_date) >= 90 THEN
                SET discount_amount = 30.00;
                SET discount_message = 'Welcome back retention discount';
            ELSE
                SET discount_message = 'Customer not eligible for retention discount';
            END IF;

        WHEN 'FREQUENCY' THEN
            IF order_count >= 20 THEN
                SET discount_amount = 75.00;
                SET discount_message = 'Frequent buyer discount';
            ELSEIF order_count >= 10 THEN
                SET discount_amount = 40.00;
                SET discount_message = 'Regular customer discount';
            ELSE
                SET discount_message = 'Order frequency not eligible for discount';
            END IF;

        ELSE
            SET discount_message = 'Invalid discount type specified';
    END CASE;

    -- Cap the discount amount
    IF discount_amount > 200.00 THEN
        SET discount_amount = 200.00;
        SET discount_message = CONCAT(discount_message, ' (capped at maximum $200)');
    END IF;

END //

DELIMITER ;

-- Test the procedure with different discount types
SET @discount = 0;
SET @message = '';

CALL ProcessCustomerDiscount(1, 'LOYALTY', @discount, @message);
SELECT 'LOYALTY' AS DiscountType, @discount AS Amount, @message AS Message;

CALL ProcessCustomerDiscount(1, 'VOLUME', @discount, @message);
SELECT 'VOLUME' AS DiscountType, @discount AS Amount, @message AS Message;
```

### Loops and Iterations

```sql
-- Procedure with loop to process multiple records
DELIMITER //

CREATE PROCEDURE GenerateMonthlyReports(
    IN start_year INT,
    IN start_month INT,
    IN num_months INT
)
BEGIN
    DECLARE counter INT DEFAULT 0;
    DECLARE current_year INT;
    DECLARE current_month INT;
    DECLARE report_start_date DATE;
    DECLARE report_end_date DATE;

    -- Create temporary table for results
    DROP TEMPORARY TABLE IF EXISTS monthly_summary;
    CREATE TEMPORARY TABLE monthly_summary (
        report_month VARCHAR(20),
        total_orders INT,
        total_revenue DECIMAL(12,2),
        avg_order_value DECIMAL(10,2),
        new_customers INT,
        unique_customers INT
    );

    -- Loop through months
    WHILE counter < num_months DO
        SET current_year = start_year;
        SET current_month = start_month + counter;

        -- Handle year rollover
        WHILE current_month > 12 DO
            SET current_month = current_month - 12;
            SET current_year = current_year + 1;
        END WHILE;

        -- Calculate date range for current month
        SET report_start_date = STR_TO_DATE(CONCAT(current_year, '-', current_month, '-01'), '%Y-%m-%d');
        SET report_end_date = LAST_DAY(report_start_date);

        -- Insert monthly summary
        INSERT INTO monthly_summary
        SELECT
            CONCAT(MONTHNAME(report_start_date), ' ', current_year) AS report_month,
            COUNT(DISTINCT o.order_id) AS total_orders,
            COALESCE(SUM(o.total_amount), 0) AS total_revenue,
            COALESCE(ROUND(AVG(o.total_amount), 2), 0) AS avg_order_value,
            COUNT(DISTINCT CASE
                WHEN o.order_date = (
                    SELECT MIN(order_date)
                    FROM orders o2
                    WHERE o2.customer_id = o.customer_id
                ) THEN o.customer_id
            END) AS new_customers,
            COUNT(DISTINCT o.customer_id) AS unique_customers
        FROM orders o
        WHERE o.order_date BETWEEN report_start_date AND report_end_date;

        SET counter = counter + 1;
    END WHILE;

    -- Return the results
    SELECT * FROM monthly_summary ORDER BY STR_TO_DATE(CONCAT('01 ', report_month), '%d %M %Y');

END //

DELIMITER ;

-- Generate reports for 6 months starting from January 2024
CALL GenerateMonthlyReports(2024, 1, 6);
```

## Error Handling and Transactions 🛡️

### Comprehensive Error Handling

```sql
-- Advanced procedure with comprehensive error handling
DELIMITER //

CREATE PROCEDURE TransferOrderToNewCustomer(
    IN old_customer_id INT,
    IN new_customer_id INT,
    IN order_id_param INT,
    OUT success_flag BOOLEAN,
    OUT error_code VARCHAR(20),
    OUT error_message VARCHAR(500)
)
BEGIN
    DECLARE order_exists INT DEFAULT 0;
    DECLARE old_customer_exists INT DEFAULT 0;
    DECLARE new_customer_exists INT DEFAULT 0;
    DECLARE order_status VARCHAR(50);
    DECLARE order_total DECIMAL(10,2);

    -- Exception handlers
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @sqlstate = RETURNED_SQLSTATE,
            @errno = MYSQL_ERRNO,
            @text = MESSAGE_TEXT;

        SET success_flag = FALSE;
        SET error_code = @errno;
        SET error_message = CONCAT('SQL Error: ', @text);
        ROLLBACK;
    END;

    DECLARE EXIT HANDLER FOR SQLWARNING
    BEGIN
        SET success_flag = FALSE;
        SET error_code = 'WARNING';
        SET error_message = 'SQL Warning occurred during transfer';
        ROLLBACK;
    END;

    -- Initialize output parameters
    SET success_flag = TRUE;
    SET error_code = '';
    SET error_message = '';

    -- Start transaction
    START TRANSACTION;

    -- Validate inputs
    IF old_customer_id IS NULL OR new_customer_id IS NULL OR order_id_param IS NULL THEN
        SET success_flag = FALSE;
        SET error_code = 'INVALID_INPUT';
        SET error_message = 'All parameters must be provided';
        ROLLBACK;
    ELSEIF old_customer_id = new_customer_id THEN
        SET success_flag = FALSE;
        SET error_code = 'SAME_CUSTOMER';
        SET error_message = 'Old and new customer IDs cannot be the same';
        ROLLBACK;
    ELSE
        -- Check if old customer exists
        SELECT COUNT(*) INTO old_customer_exists
        FROM customers WHERE customer_id = old_customer_id;

        IF old_customer_exists = 0 THEN
            SET success_flag = FALSE;
            SET error_code = 'OLD_CUSTOMER_NOT_FOUND';
            SET error_message = CONCAT('Old customer ID ', old_customer_id, ' does not exist');
            ROLLBACK;
        ELSE
            -- Check if new customer exists
            SELECT COUNT(*) INTO new_customer_exists
            FROM customers WHERE customer_id = new_customer_id;

            IF new_customer_exists = 0 THEN
                SET success_flag = FALSE;
                SET error_code = 'NEW_CUSTOMER_NOT_FOUND';
                SET error_message = CONCAT('New customer ID ', new_customer_id, ' does not exist');
                ROLLBACK;
            ELSE
                -- Check if order exists and belongs to old customer
                SELECT COUNT(*), MAX(status), MAX(total_amount)
                INTO order_exists, order_status, order_total
                FROM orders
                WHERE order_id = order_id_param AND customer_id = old_customer_id;

                IF order_exists = 0 THEN
                    SET success_flag = FALSE;
                    SET error_code = 'ORDER_NOT_FOUND';
                    SET error_message = CONCAT('Order ', order_id_param, ' not found for customer ', old_customer_id);
                    ROLLBACK;
                ELSEIF order_status IN ('Shipped', 'Delivered', 'Cancelled') THEN
                    SET success_flag = FALSE;
                    SET error_code = 'ORDER_CANNOT_TRANSFER';
                    SET error_message = CONCAT('Order cannot be transferred - current status: ', order_status);
                    ROLLBACK;
                ELSE
                    -- Perform the transfer
                    UPDATE orders
                    SET customer_id = new_customer_id,
                        updated_at = NOW()
                    WHERE order_id = order_id_param;

                    -- Log the transfer
                    INSERT INTO order_transfer_log (
                        order_id,
                        old_customer_id,
                        new_customer_id,
                        transfer_date,
                        order_amount,
                        transfer_reason
                    ) VALUES (
                        order_id_param,
                        old_customer_id,
                        new_customer_id,
                        NOW(),
                        order_total,
                        'Administrative transfer'
                    );

                    COMMIT;
                    SET error_message = CONCAT('Order ', order_id_param, ' successfully transferred from customer ',
                                             old_customer_id, ' to customer ', new_customer_id);
                END IF;
            END IF;
        END IF;
    END IF;
END //

DELIMITER ;

-- Create logging table
CREATE TABLE IF NOT EXISTS order_transfer_log (
    transfer_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    old_customer_id INT,
    new_customer_id INT,
    transfer_date DATETIME,
    order_amount DECIMAL(10,2),
    transfer_reason VARCHAR(200),
    created_by VARCHAR(100) DEFAULT USER()
);

-- Test the procedure
SET @success = FALSE;
SET @code = '';
SET @message = '';

CALL TransferOrderToNewCustomer(1, 2, 1, @success, @code, @message);
SELECT @success AS Success, @code AS ErrorCode, @message AS Message;
```

## Dynamic SQL in Stored Procedures 🎯

### Building Dynamic Queries

```sql
-- Procedure with dynamic SQL for flexible reporting
DELIMITER //

CREATE PROCEDURE GenerateDynamicReport(
    IN table_name VARCHAR(100),
    IN group_by_column VARCHAR(100),
    IN filter_column VARCHAR(100),
    IN filter_value VARCHAR(100),
    IN order_by_column VARCHAR(100),
    IN limit_count INT
)
BEGIN
    SET @sql = CONCAT(
        'SELECT ',
        group_by_column,
        ', COUNT(*) as record_count,
         SUM(CASE WHEN total_amount IS NOT NULL THEN total_amount ELSE 0 END) as total_amount,
         ROUND(AVG(CASE WHEN total_amount IS NOT NULL THEN total_amount ELSE 0 END), 2) as avg_amount
         FROM ', table_name
    );

    -- Add WHERE clause if filter is specified
    IF filter_column IS NOT NULL AND filter_value IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' WHERE ', filter_column, ' = ''', filter_value, '''');
    END IF;

    -- Add GROUP BY
    SET @sql = CONCAT(@sql, ' GROUP BY ', group_by_column);

    -- Add ORDER BY if specified
    IF order_by_column IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' ORDER BY ', order_by_column, ' DESC');
    END IF;

    -- Add LIMIT if specified
    IF limit_count IS NOT NULL AND limit_count > 0 THEN
        SET @sql = CONCAT(@sql, ' LIMIT ', limit_count);
    END IF;

    -- Prepare and execute the dynamic statement
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END //

DELIMITER ;

-- Execute dynamic reports
CALL GenerateDynamicReport('orders', 'status', 'customer_id', '1', 'total_amount', 10);
CALL GenerateDynamicReport('orders', 'DATE(order_date)', NULL, NULL, 'record_count', 5);
```

## Database-Specific Features 🛠️

### MySQL Advanced Features

```sql
-- Procedure using MySQL-specific features
DELIMITER //

CREATE PROCEDURE AnalyzeCustomerBehavior()
BEGIN
    -- Use JSON functions
    SELECT
        customer_id,
        JSON_OBJECT(
            'total_orders', COUNT(*),
            'total_spent', SUM(total_amount),
            'avg_order', ROUND(AVG(total_amount), 2),
            'order_dates', JSON_ARRAYAGG(order_date)
        ) AS customer_summary
    FROM orders
    GROUP BY customer_id;

    -- Use common table expressions (MySQL 8.0+)
    WITH customer_ranks AS (
        SELECT
            customer_id,
            SUM(total_amount) as total_spent,
            RANK() OVER (ORDER BY SUM(total_amount) DESC) as spending_rank
        FROM orders
        GROUP BY customer_id
    )
    SELECT * FROM customer_ranks WHERE spending_rank <= 10;

END //

DELIMITER ;
```

### PostgreSQL Features

```sql
-- PostgreSQL stored procedure example
/*
CREATE OR REPLACE PROCEDURE update_customer_stats()
LANGUAGE plpgsql
AS $$
DECLARE
    customer_record RECORD;
    total_spent NUMERIC;
BEGIN
    -- Use FOR loop with dynamic SQL
    FOR customer_record IN
        SELECT customer_id, first_name, last_name FROM customers
    LOOP
        SELECT COALESCE(SUM(total_amount), 0)
        INTO total_spent
        FROM orders
        WHERE customer_id = customer_record.customer_id;

        -- Update customer statistics
        UPDATE customers
        SET last_purchase_amount = total_spent,
            updated_at = NOW()
        WHERE customer_id = customer_record.customer_id;

        -- Log the update
        RAISE NOTICE 'Updated customer %: % %',
            customer_record.customer_id,
            customer_record.first_name,
            customer_record.last_name;
    END LOOP;

    COMMIT;
END;
$$;
*/
```

## Performance Optimization 🚀

### Optimization Strategies

```sql
-- Optimized procedure with performance considerations
DELIMITER //

CREATE PROCEDURE OptimizedSalesReport(
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    -- Create indexes for optimal performance
    -- CREATE INDEX idx_orders_date_customer ON orders(order_date, customer_id);
    -- CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);

    -- Use temporary table for complex calculations
    DROP TEMPORARY TABLE IF EXISTS temp_sales_summary;
    CREATE TEMPORARY TABLE temp_sales_summary (
        customer_id INT,
        customer_name VARCHAR(200),
        total_orders INT,
        total_revenue DECIMAL(12,2),
        avg_order_value DECIMAL(10,2),
        PRIMARY KEY (customer_id),
        INDEX idx_revenue (total_revenue)
    );

    -- Populate temporary table with optimized query
    INSERT INTO temp_sales_summary
    SELECT
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name),
        COUNT(o.order_id),
        SUM(o.total_amount),
        ROUND(AVG(o.total_amount), 2)
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.order_date BETWEEN start_date AND end_date
    GROUP BY c.customer_id, c.first_name, c.last_name
    HAVING COUNT(o.order_id) > 0;

    -- Return results with additional analytics
    SELECT
        tss.*,
        RANK() OVER (ORDER BY total_revenue DESC) as revenue_rank,
        CASE
            WHEN total_revenue >= 2000 THEN 'VIP'
            WHEN total_revenue >= 1000 THEN 'Premium'
            ELSE 'Regular'
        END as customer_tier
    FROM temp_sales_summary tss
    ORDER BY total_revenue DESC;

    -- Cleanup
    DROP TEMPORARY TABLE temp_sales_summary;

END //

DELIMITER ;

-- Execute optimized report
CALL OptimizedSalesReport('2024-01-01', '2024-12-31');
```

## Best Practices and Security 🔐

### Security Considerations

```sql
-- Secure procedure with input validation
DELIMITER //

CREATE PROCEDURE SecureCustomerLookup(
    IN search_term VARCHAR(100)
)
BEGIN
    -- Input validation
    IF search_term IS NULL OR CHAR_LENGTH(TRIM(search_term)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Search term cannot be empty';
    END IF;

    IF CHAR_LENGTH(search_term) > 100 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Search term too long';
    END IF;

    -- Validate that search term doesn't contain SQL injection patterns
    IF search_term REGEXP '(;|--|/\\*|\\*/|xp_|sp_)' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid characters in search term';
    END IF;

    -- Use parameterized queries (prepared statements within procedure)
    SET @sql = 'SELECT customer_id, first_name, last_name, email, city
                FROM customers
                WHERE CONCAT(first_name, " ", last_name) LIKE ?
                   OR email LIKE ?
                LIMIT 50';

    SET @search_pattern = CONCAT('%', search_term, '%');

    PREPARE stmt FROM @sql;
    EXECUTE stmt USING @search_pattern, @search_pattern;
    DEALLOCATE PREPARE stmt;

END //

DELIMITER ;
```

## Practice Exercises 💪

### Exercise 1: Customer Management System

```sql
-- 1. Create a procedure to register a new customer with validation
-- 2. Build a function to calculate customer lifetime value
-- 3. Design a procedure to merge duplicate customer records
-- 4. Implement a function for customer credit scoring
-- 5. Create a procedure for customer tier promotion/demotion
```

### Exercise 2: Inventory Management

```sql
-- 1. Build a procedure for automated reorder point calculation
-- 2. Create a function to predict stock-out dates
-- 3. Design a procedure for bulk inventory adjustments
-- 4. Implement a function for ABC analysis classification
-- 5. Create a procedure for dead stock identification
```

### Exercise 3: Financial Reporting

```sql
-- 1. Build a procedure for monthly financial closing
-- 2. Create functions for various financial ratios
-- 3. Design a procedure for commission calculations
-- 4. Implement a function for currency conversion
-- 5. Create a procedure for budget variance analysis
```

## Management and Maintenance 🔧

### Viewing and Managing Procedures

```sql
-- View all procedures in database
SHOW PROCEDURE STATUS WHERE Db = 'your_database_name';

-- View procedure definition
SHOW CREATE PROCEDURE GetCustomerOrderSummary;

-- Drop procedures and functions
DROP PROCEDURE IF EXISTS GetCustomerOrderSummary;
DROP FUNCTION IF EXISTS CalculateTax;

-- Grant permissions
GRANT EXECUTE ON PROCEDURE GetCustomerOrderSummary TO 'username'@'localhost';
GRANT EXECUTE ON FUNCTION CalculateTax TO 'username'@'localhost';
```

## Next Steps ➡️

You've now mastered stored procedures and functions! These powerful tools enable you to encapsulate complex business logic, improve performance, and enhance security. Next, we'll explore Triggers and Views to complete your advanced SQL toolkit.

---

## Quick Reference 📚

### Basic Syntax

```sql
-- Procedure with parameters
CREATE PROCEDURE proc_name(IN param1 INT, OUT param2 VARCHAR(100))
BEGIN
    -- procedure body
END;

-- Function
CREATE FUNCTION func_name(param1 INT) RETURNS INT
BEGIN
    RETURN calculation;
END;

-- Control flow
IF condition THEN statements;
ELSEIF condition THEN statements;
ELSE statements;
END IF;

WHILE condition DO statements; END WHILE;
```

### Best Practices

-   ✅ Always use input validation
-   ✅ Implement proper error handling
-   ✅ Use transactions for data consistency
-   ✅ Follow naming conventions
-   ✅ Document parameters and functionality
-   ✅ Consider security implications
-   ✅ Optimize for performance
