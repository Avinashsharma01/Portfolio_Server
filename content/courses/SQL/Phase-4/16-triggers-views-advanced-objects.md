# Triggers, Views, and Advanced Database Objects

## Introduction to Database Objects 🏛️

Database objects like triggers, views, indexes, and constraints form the backbone of a well-designed database system. They provide automation, data integrity, security, and performance optimization. Understanding these objects is crucial for building robust, enterprise-level database applications.

## Database Triggers 🎯

### Understanding Triggers

Triggers are special stored procedures that automatically execute (or "fire") in response to specific events in a database table or view. They are ideal for enforcing business rules, maintaining audit trails, and ensuring data integrity.

### Types of Triggers

| Trigger Type      | When It Fires               | Common Uses                      |
| ----------------- | --------------------------- | -------------------------------- |
| **BEFORE INSERT** | Before new record insertion | Data validation, auto-generation |
| **AFTER INSERT**  | After new record insertion  | Logging, notifications           |
| **BEFORE UPDATE** | Before record modification  | Change validation, backup        |
| **AFTER UPDATE**  | After record modification   | Audit trails, cascading updates  |
| **BEFORE DELETE** | Before record deletion      | Validation, soft deletes         |
| **AFTER DELETE**  | After record deletion       | Cleanup, logging                 |

### Basic Trigger Creation

```sql
-- MySQL trigger syntax
DELIMITER //

CREATE TRIGGER trigger_name
    BEFORE/AFTER INSERT/UPDATE/DELETE
    ON table_name
    FOR EACH ROW
BEGIN
    -- Trigger logic
END //

DELIMITER ;
```

### Audit Trail Triggers

```sql
-- Create audit table for customers
CREATE TABLE customer_audit (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE'),
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(100),
    change_date DATETIME,
    change_ip VARCHAR(45),
    INDEX idx_customer_audit_date (change_date),
    INDEX idx_customer_audit_customer (customer_id)
);

-- Trigger for customer inserts
DELIMITER //

CREATE TRIGGER trg_customer_insert_audit
    AFTER INSERT ON customers
    FOR EACH ROW
BEGIN
    INSERT INTO customer_audit (
        customer_id,
        action_type,
        new_values,
        changed_by,
        change_date,
        change_ip
    ) VALUES (
        NEW.customer_id,
        'INSERT',
        JSON_OBJECT(
            'customer_id', NEW.customer_id,
            'first_name', NEW.first_name,
            'last_name', NEW.last_name,
            'email', NEW.email,
            'phone', NEW.phone,
            'city', NEW.city,
            'country', NEW.country,
            'created_at', NEW.created_at
        ),
        USER(),
        NOW(),
        CONNECTION_ID()  -- Using connection ID as proxy for IP
    );
END //

DELIMITER ;

-- Trigger for customer updates
DELIMITER //

CREATE TRIGGER trg_customer_update_audit
    AFTER UPDATE ON customers
    FOR EACH ROW
BEGIN
    INSERT INTO customer_audit (
        customer_id,
        action_type,
        old_values,
        new_values,
        changed_by,
        change_date,
        change_ip
    ) VALUES (
        NEW.customer_id,
        'UPDATE',
        JSON_OBJECT(
            'customer_id', OLD.customer_id,
            'first_name', OLD.first_name,
            'last_name', OLD.last_name,
            'email', OLD.email,
            'phone', OLD.phone,
            'city', OLD.city,
            'country', OLD.country,
            'updated_at', OLD.updated_at
        ),
        JSON_OBJECT(
            'customer_id', NEW.customer_id,
            'first_name', NEW.first_name,
            'last_name', NEW.last_name,
            'email', NEW.email,
            'phone', NEW.phone,
            'city', NEW.city,
            'country', NEW.country,
            'updated_at', NEW.updated_at
        ),
        USER(),
        NOW(),
        CONNECTION_ID()
    );
END //

DELIMITER ;

-- Trigger for customer deletes
DELIMITER //

CREATE TRIGGER trg_customer_delete_audit
    BEFORE DELETE ON customers  -- BEFORE to capture data before it's gone
    FOR EACH ROW
BEGIN
    INSERT INTO customer_audit (
        customer_id,
        action_type,
        old_values,
        changed_by,
        change_date,
        change_ip
    ) VALUES (
        OLD.customer_id,
        'DELETE',
        JSON_OBJECT(
            'customer_id', OLD.customer_id,
            'first_name', OLD.first_name,
            'last_name', OLD.last_name,
            'email', OLD.email,
            'phone', OLD.phone,
            'city', OLD.city,
            'country', OLD.country,
            'created_at', OLD.created_at,
            'updated_at', OLD.updated_at
        ),
        USER(),
        NOW(),
        CONNECTION_ID()
    );
END //

DELIMITER ;

-- Test the audit triggers
UPDATE customers SET email = 'newemail@example.com' WHERE customer_id = 1;
SELECT * FROM customer_audit WHERE customer_id = 1;
```

### Business Logic Triggers

```sql
-- Inventory management trigger
DELIMITER //

CREATE TRIGGER trg_order_item_inventory_check
    BEFORE INSERT ON order_items
    FOR EACH ROW
BEGIN
    DECLARE available_stock INT DEFAULT 0;
    DECLARE product_name_var VARCHAR(100);

    -- Get current stock
    SELECT stock_quantity, product_name
    INTO available_stock, product_name_var
    FROM products
    WHERE product_id = NEW.product_id;

    -- Check if sufficient stock is available
    IF available_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = CONCAT('Insufficient stock for product: ', product_name_var,
                                 '. Available: ', available_stock,
                                 ', Requested: ', NEW.quantity);
    END IF;
END //

DELIMITER ;

-- Automatic inventory update trigger
DELIMITER //

CREATE TRIGGER trg_order_item_inventory_update
    AFTER INSERT ON order_items
    FOR EACH ROW
BEGIN
    -- Update product stock
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity,
        last_updated = NOW()
    WHERE product_id = NEW.product_id;

    -- Check for low stock and create alert
    INSERT INTO inventory_alerts (product_id, alert_type, alert_message, created_at)
    SELECT
        p.product_id,
        'LOW_STOCK',
        CONCAT('Low stock alert: ', p.product_name, ' has only ', p.stock_quantity, ' units remaining'),
        NOW()
    FROM products p
    WHERE p.product_id = NEW.product_id
      AND p.stock_quantity <= p.reorder_level
      AND NOT EXISTS (
          SELECT 1 FROM inventory_alerts ia
          WHERE ia.product_id = p.product_id
            AND ia.alert_type = 'LOW_STOCK'
            AND ia.resolved_at IS NULL
      );
END //

DELIMITER ;

-- Create inventory alerts table
CREATE TABLE IF NOT EXISTS inventory_alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT,
    alert_type ENUM('LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCKED'),
    alert_message TEXT,
    created_at DATETIME,
    resolved_at DATETIME NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    INDEX idx_alerts_product_status (product_id, resolved_at)
);

-- Add reorder_level column to products if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level INT DEFAULT 10;
UPDATE products SET reorder_level = 10 WHERE reorder_level IS NULL;
```

### Advanced Trigger Patterns

```sql
-- Cascading update trigger for order totals
DELIMITER //

CREATE TRIGGER trg_order_item_total_update
    AFTER INSERT ON order_items
    FOR EACH ROW
BEGIN
    UPDATE orders
    SET total_amount = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM order_items
        WHERE order_id = NEW.order_id
    ),
    updated_at = NOW()
    WHERE order_id = NEW.order_id;
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_order_item_total_update_on_change
    AFTER UPDATE ON order_items
    FOR EACH ROW
BEGIN
    UPDATE orders
    SET total_amount = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM order_items
        WHERE order_id = NEW.order_id
    ),
    updated_at = NOW()
    WHERE order_id = NEW.order_id;

    -- If order_id changed, update the old order too
    IF OLD.order_id != NEW.order_id THEN
        UPDATE orders
        SET total_amount = (
            SELECT COALESCE(SUM(quantity * unit_price), 0)
            FROM order_items
            WHERE order_id = OLD.order_id
        ),
        updated_at = NOW()
        WHERE order_id = OLD.order_id;
    END IF;
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_order_item_total_update_on_delete
    AFTER DELETE ON order_items
    FOR EACH ROW
BEGIN
    UPDATE orders
    SET total_amount = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM order_items
        WHERE order_id = OLD.order_id
    ),
    updated_at = NOW()
    WHERE order_id = OLD.order_id;
END //

DELIMITER ;
```

## Database Views 👁️

### Understanding Views

Views are virtual tables that provide a specific perspective on data from one or more tables. They don't store data themselves but display data from underlying tables based on a defined query.

### Benefits of Views

-   **Security**: Hide sensitive columns and rows
-   **Simplification**: Simplify complex queries
-   **Consistency**: Ensure consistent data access patterns
-   **Abstraction**: Hide database structure complexity
-   **Reusability**: Share common query logic

### Basic View Creation

```sql
-- Simple view for customer summary
CREATE VIEW customer_summary AS
SELECT
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS full_name,
    c.email,
    c.city,
    c.country,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent,
    COALESCE(ROUND(AVG(o.total_amount), 2), 0) AS avg_order_value,
    MAX(o.order_date) AS last_order_date
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.city, c.country;

-- Use the view
SELECT * FROM customer_summary WHERE total_spent > 1000;
SELECT full_name, total_orders FROM customer_summary ORDER BY total_spent DESC LIMIT 10;
```

### Complex Business Views

```sql
-- Comprehensive product performance view
CREATE VIEW product_performance AS
SELECT
    p.product_id,
    p.product_name,
    p.price AS list_price,
    p.stock_quantity,
    cat.category_name,

    -- Sales metrics
    COALESCE(sales_stats.total_quantity_sold, 0) AS total_quantity_sold,
    COALESCE(sales_stats.total_revenue, 0) AS total_revenue,
    COALESCE(sales_stats.total_orders, 0) AS total_orders,
    COALESCE(ROUND(sales_stats.avg_quantity_per_order, 2), 0) AS avg_quantity_per_order,
    COALESCE(ROUND(sales_stats.avg_unit_price, 2), 0) AS avg_selling_price,

    -- Performance indicators
    CASE
        WHEN sales_stats.total_quantity_sold >= 100 THEN 'High Performer'
        WHEN sales_stats.total_quantity_sold >= 50 THEN 'Good Performer'
        WHEN sales_stats.total_quantity_sold >= 10 THEN 'Average Performer'
        WHEN sales_stats.total_quantity_sold > 0 THEN 'Low Performer'
        ELSE 'No Sales'
    END AS performance_category,

    -- Profitability (assuming 30% cost margin)
    COALESCE(sales_stats.total_revenue * 0.3, 0) AS estimated_profit,
    COALESCE(ROUND((sales_stats.total_revenue * 0.3) / NULLIF(sales_stats.total_quantity_sold, 0), 2), 0) AS profit_per_unit,

    -- Inventory status
    CASE
        WHEN p.stock_quantity = 0 THEN 'Out of Stock'
        WHEN p.stock_quantity <= p.reorder_level THEN 'Low Stock'
        WHEN p.stock_quantity > p.reorder_level * 5 THEN 'Overstocked'
        ELSE 'Normal'
    END AS inventory_status,

    -- Last sale information
    sales_stats.last_sale_date,
    DATEDIFF(CURDATE(), sales_stats.last_sale_date) AS days_since_last_sale

FROM products p
JOIN categories cat ON p.category_id = cat.category_id
LEFT JOIN (
    SELECT
        oi.product_id,
        SUM(oi.quantity) AS total_quantity_sold,
        SUM(oi.quantity * oi.unit_price) AS total_revenue,
        COUNT(DISTINCT oi.order_id) AS total_orders,
        AVG(oi.quantity) AS avg_quantity_per_order,
        AVG(oi.unit_price) AS avg_unit_price,
        MAX(o.order_date) AS last_sale_date
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    GROUP BY oi.product_id
) sales_stats ON p.product_id = sales_stats.product_id;

-- Use the view for analysis
SELECT * FROM product_performance
WHERE performance_category = 'High Performer'
ORDER BY total_revenue DESC;

SELECT category_name, COUNT(*) as product_count, SUM(total_revenue) as category_revenue
FROM product_performance
GROUP BY category_name
ORDER BY category_revenue DESC;
```

### Security-Focused Views

```sql
-- Customer service view (hiding sensitive information)
CREATE VIEW customer_service_view AS
SELECT
    customer_id,
    CONCAT(LEFT(first_name, 1), REPEAT('*', LENGTH(first_name)-1)) AS masked_first_name,
    CONCAT(LEFT(last_name, 1), REPEAT('*', LENGTH(last_name)-1)) AS masked_last_name,
    CONCAT(LEFT(email, 3), '***@', SUBSTRING_INDEX(email, '@', -1)) AS masked_email,
    city,
    country,
    created_at,
    -- Show only last 4 digits of phone if exists
    CASE
        WHEN phone IS NOT NULL THEN CONCAT('***-***-', RIGHT(phone, 4))
        ELSE NULL
    END AS masked_phone
FROM customers;

-- Financial summary view (for managers only)
CREATE VIEW financial_summary_view AS
SELECT
    DATE(order_date) AS order_date,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS daily_revenue,
    ROUND(AVG(total_amount), 2) AS avg_order_value,
    MIN(total_amount) AS min_order_value,
    MAX(total_amount) AS max_order_value,
    COUNT(DISTINCT customer_id) AS unique_customers
FROM orders
WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
GROUP BY DATE(order_date)
ORDER BY order_date DESC;
```

### Updatable Views

```sql
-- Create an updatable view for product management
CREATE VIEW product_management_view AS
SELECT
    product_id,
    product_name,
    price,
    stock_quantity,
    reorder_level,
    category_id
FROM products
WHERE status = 'active';

-- This view is updatable because it:
-- 1. Contains columns from a single table
-- 2. Includes the primary key
-- 3. Doesn't use GROUP BY, HAVING, DISTINCT, etc.

-- Update through the view
UPDATE product_management_view
SET price = 999.99, stock_quantity = 50
WHERE product_id = 1;

-- Insert through the view (with default values for missing columns)
INSERT INTO product_management_view (product_name, price, stock_quantity, category_id)
VALUES ('New Product', 199.99, 100, 1);
```

### Materialized Views (PostgreSQL/Oracle concept)

```sql
-- MySQL doesn't support true materialized views, but we can simulate them
-- Create a table that acts as a materialized view
CREATE TABLE mv_monthly_sales_summary (
    summary_date DATE,
    total_orders INT,
    total_revenue DECIMAL(12,2),
    avg_order_value DECIMAL(10,2),
    unique_customers INT,
    top_product_id INT,
    top_product_revenue DECIMAL(10,2),
    last_updated DATETIME,
    PRIMARY KEY (summary_date)
);

-- Procedure to refresh the "materialized view"
DELIMITER //

CREATE PROCEDURE RefreshMonthlySalesSummary()
BEGIN
    -- Clear existing data
    DELETE FROM mv_monthly_sales_summary
    WHERE summary_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH);

    -- Populate with fresh data
    INSERT INTO mv_monthly_sales_summary
    SELECT
        DATE(CONCAT(YEAR(o.order_date), '-', MONTH(o.order_date), '-01')) AS summary_date,
        COUNT(*) AS total_orders,
        SUM(o.total_amount) AS total_revenue,
        ROUND(AVG(o.total_amount), 2) AS avg_order_value,
        COUNT(DISTINCT o.customer_id) AS unique_customers,

        -- Top product for the month
        (SELECT oi2.product_id
         FROM order_items oi2
         JOIN orders o2 ON oi2.order_id = o2.order_id
         WHERE YEAR(o2.order_date) = YEAR(o.order_date)
           AND MONTH(o2.order_date) = MONTH(o.order_date)
         GROUP BY oi2.product_id
         ORDER BY SUM(oi2.quantity * oi2.unit_price) DESC
         LIMIT 1) AS top_product_id,

        (SELECT SUM(oi2.quantity * oi2.unit_price)
         FROM order_items oi2
         JOIN orders o2 ON oi2.order_id = o2.order_id
         WHERE YEAR(o2.order_date) = YEAR(o.order_date)
           AND MONTH(o2.order_date) = MONTH(o.order_date)
         GROUP BY oi2.product_id
         ORDER BY SUM(oi2.quantity * oi2.unit_price) DESC
         LIMIT 1) AS top_product_revenue,

        NOW() AS last_updated

    FROM orders o
    WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY YEAR(o.order_date), MONTH(o.order_date)
    ORDER BY summary_date;

END //

DELIMITER ;

-- Schedule this to run monthly or create an event
-- Call the refresh procedure
CALL RefreshMonthlySalesSummary();

-- Query the "materialized view"
SELECT * FROM mv_monthly_sales_summary ORDER BY summary_date DESC;
```

## Advanced Database Objects 🛠️

### Indexes

```sql
-- Comprehensive indexing strategy

-- Primary indexes (already exist on primary keys)
-- SHOW INDEX FROM customers;

-- Secondary indexes for foreign keys
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_products_category_id ON products(category_id);

-- Composite indexes for common queries
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);
CREATE INDEX idx_orders_date_status ON orders(order_date, status);
CREATE INDEX idx_products_category_price ON products(category_id, price);

-- Covering indexes (include all columns needed for a query)
CREATE INDEX idx_customer_summary ON customers(customer_id, first_name, last_name, email);
CREATE INDEX idx_order_summary ON orders(order_id, customer_id, order_date, total_amount, status);

-- Full-text indexes for text search
ALTER TABLE products ADD FULLTEXT(product_name, description);
CREATE FULLTEXT INDEX idx_customers_name_search ON customers(first_name, last_name);

-- Partial indexes (MySQL 8.0+) - Index only specific rows
CREATE INDEX idx_active_products ON products(product_id) WHERE status = 'active';

-- Functional indexes (MySQL 8.0+)
CREATE INDEX idx_customer_full_name ON customers((CONCAT(first_name, ' ', last_name)));
CREATE INDEX idx_orders_year ON orders((YEAR(order_date)));

-- Show index usage
SHOW INDEX FROM products;
SHOW INDEX FROM orders;
```

### Constraints

```sql
-- Check constraints (MySQL 8.0.16+)
ALTER TABLE products
ADD CONSTRAINT chk_price_positive CHECK (price > 0),
ADD CONSTRAINT chk_stock_non_negative CHECK (stock_quantity >= 0);

ALTER TABLE orders
ADD CONSTRAINT chk_total_amount_positive CHECK (total_amount >= 0);

ALTER TABLE order_items
ADD CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
ADD CONSTRAINT chk_unit_price_positive CHECK (unit_price > 0);

-- Unique constraints
ALTER TABLE customers
ADD CONSTRAINT uk_customer_email UNIQUE (email);

ALTER TABLE products
ADD CONSTRAINT uk_product_name_category UNIQUE (product_name, category_id);

-- Custom validation through triggers (for older MySQL versions)
DELIMITER //

CREATE TRIGGER trg_validate_order_amount
    BEFORE INSERT ON orders
    FOR EACH ROW
BEGIN
    IF NEW.total_amount < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order total amount cannot be negative';
    END IF;

    IF NEW.total_amount > 50000 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order total amount exceeds maximum limit of $50,000';
    END IF;
END //

DELIMITER ;
```

### Database Events (MySQL Scheduler)

```sql
-- Enable the event scheduler
SET GLOBAL event_scheduler = ON;

-- Event to clean up old audit records
DELIMITER //

CREATE EVENT evt_cleanup_old_audit_records
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-09-01 02:00:00'
DO
BEGIN
    -- Delete audit records older than 2 years
    DELETE FROM customer_audit
    WHERE change_date < DATE_SUB(NOW(), INTERVAL 2 YEAR);

    -- Log the cleanup
    INSERT INTO system_log (log_type, log_message, log_date)
    VALUES ('CLEANUP', 'Old audit records cleaned up', NOW());
END //

DELIMITER ;

-- Event to refresh materialized view
CREATE EVENT evt_refresh_monthly_summary
ON SCHEDULE EVERY 1 DAY
STARTS '2024-08-01 01:00:00'
DO
    CALL RefreshMonthlySalesSummary();

-- Event to check for low stock daily
DELIMITER //

CREATE EVENT evt_daily_inventory_check
ON SCHEDULE EVERY 1 DAY
STARTS '2024-08-01 08:00:00'
DO
BEGIN
    INSERT INTO inventory_alerts (product_id, alert_type, alert_message, created_at)
    SELECT
        p.product_id,
        'LOW_STOCK',
        CONCAT('Daily check: ', p.product_name, ' is below reorder level. Current stock: ', p.stock_quantity),
        NOW()
    FROM products p
    WHERE p.stock_quantity <= p.reorder_level
      AND NOT EXISTS (
          SELECT 1 FROM inventory_alerts ia
          WHERE ia.product_id = p.product_id
            AND ia.alert_type = 'LOW_STOCK'
            AND ia.resolved_at IS NULL
            AND DATE(ia.created_at) = CURDATE()
      );
END //

DELIMITER ;

-- View scheduled events
SHOW EVENTS;

-- Create system log table
CREATE TABLE IF NOT EXISTS system_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    log_type VARCHAR(50),
    log_message TEXT,
    log_date DATETIME,
    INDEX idx_log_date_type (log_date, log_type)
);
```

## Performance Monitoring Views 📊

### Database Performance Views

```sql
-- Create views for performance monitoring
CREATE VIEW db_performance_summary AS
SELECT
    'Table Statistics' AS metric_category,
    table_name,
    table_rows,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb,
    ROUND(data_length / 1024 / 1024, 2) AS data_mb,
    ROUND(index_length / 1024 / 1024, 2) AS index_mb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_type = 'BASE TABLE'
ORDER BY (data_length + index_length) DESC;

-- Query performance view
CREATE VIEW slow_query_analysis AS
SELECT
    'Query Performance' AS analysis_type,
    sql_text,
    exec_count,
    ROUND(avg_timer_wait/1000000000000, 6) AS avg_exec_time_sec,
    ROUND(sum_timer_wait/1000000000000, 6) AS total_exec_time_sec,
    ROUND(sum_lock_time/1000000000000, 6) AS total_lock_time_sec,
    sum_rows_examined,
    sum_rows_sent,
    sum_created_tmp_tables
FROM performance_schema.events_statements_summary_by_digest
WHERE avg_timer_wait > 1000000000  -- Queries taking more than 1ms
ORDER BY avg_timer_wait DESC
LIMIT 20;

-- Index usage analysis
CREATE VIEW index_usage_analysis AS
SELECT
    object_schema AS database_name,
    object_name AS table_name,
    index_name,
    count_read,
    count_write,
    count_fetch,
    count_insert,
    count_update,
    count_delete,
    CASE
        WHEN count_read = 0 THEN 'Unused Index'
        WHEN count_read < 10 THEN 'Low Usage'
        WHEN count_read < 100 THEN 'Medium Usage'
        ELSE 'High Usage'
    END AS usage_category
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = DATABASE()
ORDER BY count_read DESC;
```

## Best Practices and Troubleshooting 🔧

### Trigger Best Practices

```sql
-- Example of well-designed trigger with best practices
DELIMITER //

CREATE TRIGGER trg_order_business_rules
    BEFORE INSERT ON orders
    FOR EACH ROW
BEGIN
    -- Declare variables
    DECLARE customer_exists INT DEFAULT 0;
    DECLARE customer_status VARCHAR(20) DEFAULT '';
    DECLARE order_limit DECIMAL(10,2) DEFAULT 0;

    -- Input validation
    IF NEW.customer_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Customer ID cannot be null';
    END IF;

    IF NEW.total_amount IS NULL OR NEW.total_amount <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order total must be greater than zero';
    END IF;

    -- Business rule validation
    SELECT COUNT(*), MAX(status)
    INTO customer_exists, customer_status
    FROM customers
    WHERE customer_id = NEW.customer_id;

    IF customer_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Customer does not exist';
    END IF;

    IF customer_status = 'SUSPENDED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot create orders for suspended customers';
    END IF;

    -- Set order limit based on customer tier
    SET order_limit = CASE
        WHEN customer_status = 'VIP' THEN 50000
        WHEN customer_status = 'PREMIUM' THEN 25000
        ELSE 10000
    END;

    IF NEW.total_amount > order_limit THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = CONCAT('Order amount exceeds limit for customer tier: $', order_limit);
    END IF;

    -- Auto-set values
    IF NEW.order_date IS NULL THEN
        SET NEW.order_date = CURDATE();
    END IF;

    IF NEW.status IS NULL THEN
        SET NEW.status = 'Pending';
    END IF;

    SET NEW.created_at = NOW();

END //

DELIMITER ;
```

### View Management

```sql
-- View dependency analysis
SELECT
    table_schema,
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = DATABASE();

-- Check view updatability
SELECT
    table_name,
    is_updatable,
    check_option
FROM information_schema.views
WHERE table_schema = DATABASE();

-- Drop and recreate view safely
DROP VIEW IF EXISTS customer_summary;
CREATE VIEW customer_summary AS
-- Updated view definition here
SELECT
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS full_name,
    c.email,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.email;
```

### Troubleshooting Common Issues

```sql
-- Trigger debugging - Create a debug log table
CREATE TABLE trigger_debug_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    trigger_name VARCHAR(100),
    table_name VARCHAR(100),
    operation VARCHAR(10),
    old_values JSON,
    new_values JSON,
    debug_message TEXT,
    log_timestamp DATETIME DEFAULT NOW()
);

-- Example trigger with debugging
DELIMITER //

CREATE TRIGGER trg_debug_customer_update
    AFTER UPDATE ON customers
    FOR EACH ROW
BEGIN
    INSERT INTO trigger_debug_log (
        trigger_name, table_name, operation, old_values, new_values, debug_message
    ) VALUES (
        'trg_debug_customer_update',
        'customers',
        'UPDATE',
        JSON_OBJECT('id', OLD.customer_id, 'email', OLD.email),
        JSON_OBJECT('id', NEW.customer_id, 'email', NEW.email),
        CONCAT('Customer ', NEW.customer_id, ' updated successfully')
    );
END //

DELIMITER ;

-- View trigger execution log
SELECT * FROM trigger_debug_log ORDER BY log_timestamp DESC LIMIT 10;
```

## Practice Exercises 💪

### Exercise 1: Audit System Design

```sql
-- 1. Create a comprehensive audit system for all tables
-- 2. Design triggers that capture who, what, when, and where
-- 3. Build views to analyze audit data
-- 4. Create procedures to archive old audit records
-- 5. Implement audit data retention policies
```

### Exercise 2: Business Rules Implementation

```sql
-- 1. Create triggers for complex business validation rules
-- 2. Implement automatic pricing rules based on customer tier
-- 3. Design cascading update triggers for related data
-- 4. Build error handling and notification systems
-- 5. Create performance monitoring for trigger execution
```

### Exercise 3: Reporting Views

```sql
-- 1. Design a hierarchy of views for different reporting needs
-- 2. Create security-focused views for different user roles
-- 3. Build materialized view simulation with refresh procedures
-- 4. Implement view-based data access layer
-- 5. Create performance analysis views for database optimization
```

## Database Object Management 🔧

### Viewing Object Information

```sql
-- List all triggers
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    created
FROM information_schema.triggers
WHERE trigger_schema = DATABASE();

-- List all views
SELECT
    table_name,
    view_definition,
    is_updatable
FROM information_schema.views
WHERE table_schema = DATABASE();

-- List all indexes
SELECT
    table_name,
    index_name,
    column_name,
    seq_in_index,
    non_unique
FROM information_schema.statistics
WHERE table_schema = DATABASE()
ORDER BY table_name, index_name, seq_in_index;

-- List all events
SHOW EVENTS FROM your_database_name;

-- List all constraints
SELECT
    constraint_name,
    table_name,
    constraint_type,
    column_name
FROM information_schema.key_column_usage
WHERE constraint_schema = DATABASE();
```

### Backup and Recovery Considerations

```sql
-- Backup views and triggers
-- mysqldump includes views and triggers by default
-- mysqldump -u username -p database_name > backup_file.sql

-- Export only triggers
-- mysqldump -u username -p --triggers --no-create-info --no-data database_name > triggers_only.sql

-- Export only views
-- mysqldump -u username -p --no-create-info --no-data database_name > views_only.sql
```

## Next Steps ➡️

Congratulations! You've completed the comprehensive SQL and DBMS learning series. You now have mastery over:

-   Database fundamentals and design principles
-   Complete SQL syntax from basic to advanced
-   Complex JOINs and analytical queries
-   Window functions for advanced analytics
-   Stored procedures and functions
-   Triggers, views, and database objects

You're now equipped to design, implement, and optimize enterprise-level database systems!

---

## Quick Reference 📚

### Trigger Syntax

```sql
CREATE TRIGGER trigger_name
    BEFORE/AFTER INSERT/UPDATE/DELETE
    ON table_name FOR EACH ROW
BEGIN
    -- Trigger logic using OLD and NEW references
END;
```

### View Syntax

```sql
CREATE VIEW view_name AS
SELECT columns FROM tables WHERE conditions;

-- Updatable views require:
-- - Single table
-- - Primary key included
-- - No aggregations or DISTINCT
```

### Best Practices

-   ✅ Keep triggers simple and fast
-   ✅ Avoid complex business logic in triggers
-   ✅ Use views for data security and simplification
-   ✅ Document all database objects thoroughly
-   ✅ Monitor performance impact
-   ✅ Test triggers thoroughly before deployment
-   ✅ Consider alternatives to triggers when possible
