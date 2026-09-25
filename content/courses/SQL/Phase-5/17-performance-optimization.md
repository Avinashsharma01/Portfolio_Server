# Database Performance Optimization and Tuning

## Introduction to Database Performance Optimization 🚀

Database performance optimization is the art and science of making your database systems run faster, handle more load, and use resources more efficiently. This involves understanding query execution, indexing strategies, hardware considerations, and system-level optimizations.

## Understanding Query Execution 🔍

### Query Execution Plans

Query execution plans show how the database engine processes your queries, revealing potential bottlenecks and optimization opportunities.

```sql
-- MySQL: Analyze query execution plans
EXPLAIN SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    COUNT(o.order_id) as order_count,
    SUM(o.total_amount) as total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE c.created_at >= '2024-01-01'
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC;

-- Extended analysis with execution details
EXPLAIN FORMAT=JSON
SELECT
    p.product_name,
    c.category_name,
    SUM(oi.quantity) as total_sold,
    SUM(oi.quantity * oi.unit_price) as revenue
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY p.product_id, p.product_name, c.category_name
HAVING revenue > 1000
ORDER BY revenue DESC
LIMIT 20;

-- MySQL 8.0+: Visual explain with tree format
EXPLAIN FORMAT=TREE
SELECT c.customer_id, COUNT(*) as orders
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= '2024-01-01'
GROUP BY c.customer_id
HAVING COUNT(*) > 5;
```

### Analyzing Execution Statistics

```sql
-- Enable performance schema for detailed analysis
SET GLOBAL performance_schema = ON;

-- Create comprehensive performance monitoring
CREATE VIEW query_performance_analysis AS
SELECT
    DIGEST_TEXT as query_pattern,
    COUNT_STAR as execution_count,
    ROUND(AVG_TIMER_WAIT/1000000000000, 6) as avg_execution_time_sec,
    ROUND(MAX_TIMER_WAIT/1000000000000, 6) as max_execution_time_sec,
    ROUND(SUM_TIMER_WAIT/1000000000000, 6) as total_execution_time_sec,
    SUM_ROWS_EXAMINED as total_rows_examined,
    SUM_ROWS_SENT as total_rows_sent,
    SUM_CREATED_TMP_TABLES as temp_tables_created,
    SUM_CREATED_TMP_DISK_TABLES as temp_disk_tables_created,
    SUM_SELECT_FULL_JOIN as full_joins,
    SUM_SELECT_SCAN as full_table_scans,
    ROUND(SUM_ROWS_EXAMINED/COUNT_STAR, 2) as avg_rows_examined_per_query,
    FIRST_SEEN,
    LAST_SEEN
FROM performance_schema.events_statements_summary_by_digest
WHERE DIGEST_TEXT IS NOT NULL
  AND COUNT_STAR > 1
ORDER BY avg_execution_time_sec DESC;

-- Query the performance analysis
SELECT * FROM query_performance_analysis
WHERE avg_execution_time_sec > 0.1  -- Queries taking more than 100ms
LIMIT 20;

-- Identify problematic queries
SELECT
    query_pattern,
    execution_count,
    avg_execution_time_sec,
    total_rows_examined,
    CASE
        WHEN avg_rows_examined_per_query > 10000 THEN 'High Row Scan'
        WHEN full_table_scans > 0 THEN 'Full Table Scan'
        WHEN temp_disk_tables_created > 0 THEN 'Disk Temp Tables'
        WHEN full_joins > 0 THEN 'Full Join'
        ELSE 'Normal'
    END as performance_issue
FROM query_performance_analysis
WHERE avg_execution_time_sec > 0.05
ORDER BY avg_execution_time_sec DESC;
```

## Advanced Indexing Strategies 📊

### Comprehensive Index Design

```sql
-- Analyze current index usage
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CARDINALITY,
    SUB_PART,
    NULLABLE,
    INDEX_TYPE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Index usage statistics from performance schema
SELECT
    object_schema as database_name,
    object_name as table_name,
    index_name,
    count_read,
    count_write,
    count_fetch,
    count_insert,
    count_update,
    count_delete,
    ROUND(count_read / (count_read + count_write + 1) * 100, 2) as read_write_ratio
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = DATABASE()
  AND count_read + count_write > 0
ORDER BY count_read DESC;
```

### Strategic Index Creation

```sql
-- Strategic indexes for e-commerce database

-- 1. Customer analysis indexes
CREATE INDEX idx_customers_registration_date ON customers(created_at);
CREATE INDEX idx_customers_location ON customers(country, city);
CREATE INDEX idx_customers_status_email ON customers(status, email);

-- 2. Order processing indexes
CREATE INDEX idx_orders_processing ON orders(status, order_date, customer_id);
CREATE INDEX idx_orders_date_range ON orders(order_date, total_amount);
CREATE INDEX idx_orders_customer_total ON orders(customer_id, total_amount, order_date);

-- 3. Product catalog indexes
CREATE INDEX idx_products_category_price ON products(category_id, price, stock_quantity);
CREATE INDEX idx_products_inventory ON products(stock_quantity, reorder_level, status);
CREATE INDEX idx_products_search ON products(status, category_id, price);

-- 4. Sales analysis indexes
CREATE INDEX idx_order_items_product_analysis ON order_items(product_id, order_id, quantity, unit_price);
CREATE INDEX idx_order_items_revenue ON order_items(order_id, unit_price, quantity);

-- 5. Covering indexes for common queries
CREATE INDEX idx_customer_order_summary ON orders(
    customer_id, order_date, total_amount, status
);

CREATE INDEX idx_product_sales_summary ON order_items(
    product_id, quantity, unit_price
) INCLUDING (order_id);  -- MySQL 8.0+ invisible columns

-- 6. Functional indexes for computed columns
CREATE INDEX idx_customer_full_name ON customers(
    (CONCAT(first_name, ' ', last_name))
);

CREATE INDEX idx_order_year_month ON orders(
    (YEAR(order_date)), (MONTH(order_date))
);

-- 7. Partial indexes for specific conditions
CREATE INDEX idx_active_high_value_products ON products(product_id, price)
WHERE status = 'active' AND price > 100;

CREATE INDEX idx_recent_large_orders ON orders(customer_id, total_amount)
WHERE order_date >= '2024-01-01' AND total_amount > 500;
```

### Index Optimization Analysis

```sql
-- Procedure to analyze and recommend index optimizations
DELIMITER //

CREATE PROCEDURE AnalyzeIndexEffectiveness()
BEGIN
    -- Create temporary table for analysis results
    DROP TEMPORARY TABLE IF EXISTS index_analysis;
    CREATE TEMPORARY TABLE index_analysis (
        table_name VARCHAR(64),
        index_name VARCHAR(64),
        index_type VARCHAR(16),
        columns_count INT,
        cardinality BIGINT,
        index_size_mb DECIMAL(10,2),
        read_count BIGINT,
        write_count BIGINT,
        effectiveness_score DECIMAL(10,2),
        recommendation VARCHAR(200)
    );

    -- Analyze each index
    INSERT INTO index_analysis
    SELECT
        s.TABLE_NAME,
        s.INDEX_NAME,
        s.INDEX_TYPE,
        COUNT(*) as columns_count,
        MAX(s.CARDINALITY) as cardinality,
        ROUND(
            SUM(
                CASE
                    WHEN s.SUB_PART IS NULL THEN
                        CASE s.COLUMN_NAME
                            WHEN 'id' THEN 4
                            WHEN s.COLUMN_NAME LIKE '%_id' THEN 4
                            WHEN s.COLUMN_NAME LIKE '%date%' THEN 8
                            WHEN s.COLUMN_NAME LIKE '%time%' THEN 8
                            ELSE 20  -- Default for varchar/text
                        END
                    ELSE s.SUB_PART
                END
            ) / 1024 / 1024, 2
        ) as estimated_size_mb,
        COALESCE(io.count_read, 0) as read_count,
        COALESCE(io.count_write + io.count_insert + io.count_update + io.count_delete, 0) as write_count,
        -- Calculate effectiveness score
        CASE
            WHEN COALESCE(io.count_read, 0) = 0 THEN 0
            ELSE ROUND(
                (COALESCE(io.count_read, 0) /
                 (COALESCE(io.count_read, 0) + COALESCE(io.count_write + io.count_insert + io.count_update + io.count_delete, 0) + 1)) *
                LOG(COALESCE(io.count_read, 0) + 1) * 10, 2
            )
        END as effectiveness_score,
        -- Generate recommendations
        CASE
            WHEN COALESCE(io.count_read, 0) = 0 AND s.INDEX_NAME != 'PRIMARY' THEN 'Consider dropping - unused index'
            WHEN COALESCE(io.count_read, 0) < 10 AND s.INDEX_NAME != 'PRIMARY' THEN 'Low usage - review necessity'
            WHEN MAX(s.CARDINALITY) < 10 THEN 'Low cardinality - consider composite index'
            WHEN COUNT(*) > 5 THEN 'Too many columns - consider splitting'
            WHEN COALESCE(io.count_read, 0) > 1000 THEN 'High usage - well optimized'
            ELSE 'Normal usage'
        END as recommendation

    FROM information_schema.STATISTICS s
    LEFT JOIN performance_schema.table_io_waits_summary_by_index_usage io
        ON s.TABLE_SCHEMA = io.object_schema
        AND s.TABLE_NAME = io.object_name
        AND s.INDEX_NAME = io.index_name
    WHERE s.TABLE_SCHEMA = DATABASE()
    GROUP BY s.TABLE_NAME, s.INDEX_NAME, s.INDEX_TYPE
    ORDER BY effectiveness_score DESC;

    -- Return analysis results
    SELECT
        table_name,
        index_name,
        index_type,
        columns_count,
        cardinality,
        index_size_mb,
        read_count,
        write_count,
        effectiveness_score,
        recommendation
    FROM index_analysis
    ORDER BY
        CASE
            WHEN recommendation LIKE 'Consider dropping%' THEN 1
            WHEN recommendation LIKE 'Low usage%' THEN 2
            WHEN recommendation LIKE 'Low cardinality%' THEN 3
            ELSE 4
        END,
        effectiveness_score DESC;

END //

DELIMITER ;

-- Run the analysis
CALL AnalyzeIndexEffectiveness();
```

## Query Optimization Techniques 🎯

### Query Rewriting Strategies

```sql
-- Before: Inefficient subquery
SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
WHERE c.customer_id IN (
    SELECT o.customer_id
    FROM orders o
    WHERE o.total_amount > 1000
);

-- After: Optimized with EXISTS
SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.total_amount > 1000
);

-- Before: Correlated subquery in SELECT
SELECT
    p.product_id,
    p.product_name,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.product_id) as order_count
FROM products p;

-- After: Single JOIN
SELECT
    p.product_id,
    p.product_name,
    COALESCE(oi_summary.order_count, 0) as order_count
FROM products p
LEFT JOIN (
    SELECT product_id, COUNT(*) as order_count
    FROM order_items
    GROUP BY product_id
) oi_summary ON p.product_id = oi_summary.product_id;

-- Before: Multiple OR conditions
SELECT * FROM orders
WHERE status = 'Pending'
   OR status = 'Processing'
   OR status = 'Shipped';

-- After: Using IN clause
SELECT * FROM orders
WHERE status IN ('Pending', 'Processing', 'Shipped');

-- Before: Function on indexed column
SELECT * FROM orders
WHERE YEAR(order_date) = 2024;

-- After: Range condition
SELECT * FROM orders
WHERE order_date >= '2024-01-01'
  AND order_date < '2025-01-01';
```

### Advanced Query Optimization

```sql
-- Optimized pagination with offset alternatives
-- Before: Inefficient OFFSET for large datasets
SELECT customer_id, first_name, last_name, email
FROM customers
ORDER BY customer_id
LIMIT 50 OFFSET 10000;  -- Slow for large offsets

-- After: Cursor-based pagination
SELECT customer_id, first_name, last_name, email
FROM customers
WHERE customer_id > 10000  -- Use last seen ID
ORDER BY customer_id
LIMIT 50;

-- Optimized aggregation with pre-computed values
-- Create summary tables for frequently accessed aggregations
CREATE TABLE daily_sales_summary (
    summary_date DATE PRIMARY KEY,
    total_orders INT,
    total_revenue DECIMAL(12,2),
    total_items_sold INT,
    unique_customers INT,
    avg_order_value DECIMAL(10,2),
    last_updated DATETIME
);

-- Procedure to update summary (run nightly)
DELIMITER //

CREATE PROCEDURE UpdateDailySalesSummary(IN summary_date_param DATE)
BEGIN
    INSERT INTO daily_sales_summary (
        summary_date, total_orders, total_revenue, total_items_sold,
        unique_customers, avg_order_value, last_updated
    )
    SELECT
        DATE(o.order_date),
        COUNT(DISTINCT o.order_id),
        SUM(o.total_amount),
        SUM(oi.quantity),
        COUNT(DISTINCT o.customer_id),
        ROUND(AVG(o.total_amount), 2),
        NOW()
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE DATE(o.order_date) = summary_date_param
    GROUP BY DATE(o.order_date)
    ON DUPLICATE KEY UPDATE
        total_orders = VALUES(total_orders),
        total_revenue = VALUES(total_revenue),
        total_items_sold = VALUES(total_items_sold),
        unique_customers = VALUES(unique_customers),
        avg_order_value = VALUES(avg_order_value),
        last_updated = NOW();
END //

DELIMITER ;

-- Use summary table instead of real-time aggregation
SELECT
    summary_date,
    total_orders,
    total_revenue,
    avg_order_value
FROM daily_sales_summary
WHERE summary_date BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY summary_date;
```

### Query Cache Optimization

```sql
-- MySQL Query Cache configuration (for MySQL 5.7 and earlier)
-- Note: Query cache was removed in MySQL 8.0

-- Check query cache status
SHOW VARIABLES LIKE 'query_cache%';
SHOW STATUS LIKE 'Qcache%';

-- For MySQL 8.0+, use result set caching in application layer
-- Create a procedure that implements smart caching logic
DELIMITER //

CREATE PROCEDURE GetCachedCustomerSummary(
    IN cache_duration_minutes INT,
    IN force_refresh BOOLEAN
)
BEGIN
    DECLARE cache_expired BOOLEAN DEFAULT TRUE;
    DECLARE last_cache_update DATETIME;

    -- Check if cache exists and is fresh
    SELECT MAX(last_updated) INTO last_cache_update
    FROM daily_sales_summary;

    IF last_cache_update IS NOT NULL AND NOT force_refresh THEN
        SET cache_expired = (TIMESTAMPDIFF(MINUTE, last_cache_update, NOW()) > cache_duration_minutes);
    END IF;

    -- Refresh cache if expired
    IF cache_expired THEN
        -- Update yesterday's summary
        CALL UpdateDailySalesSummary(DATE_SUB(CURDATE(), INTERVAL 1 DAY));
    END IF;

    -- Return cached results
    SELECT * FROM daily_sales_summary
    WHERE summary_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ORDER BY summary_date DESC;

END //

DELIMITER ;

-- Use the cached procedure
CALL GetCachedCustomerSummary(60, FALSE);  -- Cache for 60 minutes
```

## Hardware and System Optimization 💻

### Memory Configuration

```sql
-- MySQL memory optimization settings
-- Add these to my.cnf configuration file

/*
[mysqld]
# Buffer pool size (70-80% of available RAM for dedicated server)
innodb_buffer_pool_size = 4G
innodb_buffer_pool_instances = 4

# Query cache (MySQL 5.7 and earlier)
query_cache_type = 1
query_cache_size = 256M
query_cache_limit = 1M

# Connection settings
max_connections = 500
thread_cache_size = 50

# InnoDB settings
innodb_log_file_size = 512M
innodb_log_buffer_size = 64M
innodb_flush_log_at_trx_commit = 2
innodb_file_per_table = 1

# MyISAM settings (if using MyISAM tables)
key_buffer_size = 256M
read_buffer_size = 2M
read_rnd_buffer_size = 4M
sort_buffer_size = 4M

# Temporary table settings
tmp_table_size = 256M
max_heap_table_size = 256M
*/

-- Monitor memory usage
SELECT
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS database_size_mb,
    ROUND(SUM(data_length) / 1024 / 1024, 2) AS data_size_mb,
    ROUND(SUM(index_length) / 1024 / 1024, 2) AS index_size_mb
FROM information_schema.tables
WHERE table_schema = DATABASE();

-- Check InnoDB buffer pool usage
SELECT
    VARIABLE_NAME,
    VARIABLE_VALUE,
    CASE VARIABLE_NAME
        WHEN 'Innodb_buffer_pool_pages_total' THEN ROUND(VARIABLE_VALUE * 16 / 1024, 2)
        WHEN 'Innodb_buffer_pool_pages_free' THEN ROUND(VARIABLE_VALUE * 16 / 1024, 2)
        WHEN 'Innodb_buffer_pool_pages_data' THEN ROUND(VARIABLE_VALUE * 16 / 1024, 2)
        ELSE VARIABLE_VALUE
    END AS value_mb
FROM performance_schema.global_status
WHERE VARIABLE_NAME IN (
    'Innodb_buffer_pool_pages_total',
    'Innodb_buffer_pool_pages_free',
    'Innodb_buffer_pool_pages_data',
    'Innodb_buffer_pool_pages_dirty'
);
```

### Storage Optimization

```sql
-- Table optimization and maintenance procedures
DELIMITER //

CREATE PROCEDURE OptimizeDatabase()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name_var VARCHAR(64);
    DECLARE optimization_result TEXT;

    -- Cursor for all tables in the database
    DECLARE table_cursor CURSOR FOR
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_type = 'BASE TABLE';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Create log table for optimization results
    CREATE TABLE IF NOT EXISTS optimization_log (
        log_id INT PRIMARY KEY AUTO_INCREMENT,
        table_name VARCHAR(64),
        operation VARCHAR(20),
        result TEXT,
        optimization_date DATETIME,
        INDEX idx_opt_date (optimization_date)
    );

    OPEN table_cursor;

    optimization_loop: LOOP
        FETCH table_cursor INTO table_name_var;

        IF done THEN
            LEAVE optimization_loop;
        END IF;

        -- Analyze table
        SET @sql = CONCAT('ANALYZE TABLE ', table_name_var);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        INSERT INTO optimization_log (table_name, operation, result, optimization_date)
        VALUES (table_name_var, 'ANALYZE', 'Completed', NOW());

        -- Optimize table
        SET @sql = CONCAT('OPTIMIZE TABLE ', table_name_var);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        INSERT INTO optimization_log (table_name, operation, result, optimization_date)
        VALUES (table_name_var, 'OPTIMIZE', 'Completed', NOW());

    END LOOP;

    CLOSE table_cursor;

    -- Show optimization summary
    SELECT
        'Optimization completed for ' || COUNT(*) || ' tables' as summary,
        MIN(optimization_date) as start_time,
        MAX(optimization_date) as end_time
    FROM optimization_log
    WHERE DATE(optimization_date) = CURDATE();

END //

DELIMITER ;

-- Monitor table fragmentation
SELECT
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS total_size_mb,
    ROUND(data_free / 1024 / 1024, 2) AS fragmented_mb,
    ROUND(data_free / (data_length + index_length + data_free) * 100, 2) AS fragmentation_percent
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND data_free > 0
ORDER BY fragmentation_percent DESC;
```

## Advanced Performance Monitoring 📈

### Real-time Performance Dashboard

```sql
-- Create comprehensive performance monitoring views
CREATE VIEW server_performance_summary AS
SELECT
    'Connection Statistics' as metric_category,
    VARIABLE_NAME as metric_name,
    VARIABLE_VALUE as metric_value,
    CASE
        WHEN VARIABLE_NAME = 'Threads_connected' AND CAST(VARIABLE_VALUE AS UNSIGNED) > 100 THEN 'WARNING'
        WHEN VARIABLE_NAME = 'Threads_running' AND CAST(VARIABLE_VALUE AS UNSIGNED) > 10 THEN 'WARNING'
        ELSE 'OK'
    END as status
FROM performance_schema.global_status
WHERE VARIABLE_NAME IN (
    'Threads_connected', 'Threads_running', 'Connections',
    'Aborted_connects', 'Max_used_connections'
)

UNION ALL

SELECT
    'Query Statistics' as metric_category,
    VARIABLE_NAME as metric_name,
    VARIABLE_VALUE as metric_value,
    CASE
        WHEN VARIABLE_NAME = 'Slow_queries' AND CAST(VARIABLE_VALUE AS UNSIGNED) > 100 THEN 'WARNING'
        WHEN VARIABLE_NAME = 'Select_full_join' AND CAST(VARIABLE_VALUE AS UNSIGNED) > 10 THEN 'WARNING'
        ELSE 'OK'
    END as status
FROM performance_schema.global_status
WHERE VARIABLE_NAME IN (
    'Queries', 'Slow_queries', 'Select_full_join', 'Select_scan',
    'Created_tmp_tables', 'Created_tmp_disk_tables'
)

UNION ALL

SELECT
    'InnoDB Statistics' as metric_category,
    VARIABLE_NAME as metric_name,
    VARIABLE_VALUE as metric_value,
    'OK' as status
FROM performance_schema.global_status
WHERE VARIABLE_NAME IN (
    'Innodb_buffer_pool_read_requests', 'Innodb_buffer_pool_reads',
    'Innodb_rows_read', 'Innodb_rows_inserted', 'Innodb_rows_updated', 'Innodb_rows_deleted'
);

-- Performance alerting procedure
DELIMITER //

CREATE PROCEDURE CheckPerformanceAlerts()
BEGIN
    DECLARE alert_count INT DEFAULT 0;

    -- Create alerts table if not exists
    CREATE TABLE IF NOT EXISTS performance_alerts (
        alert_id INT PRIMARY KEY AUTO_INCREMENT,
        alert_type VARCHAR(50),
        alert_message TEXT,
        metric_value VARCHAR(20),
        threshold_value VARCHAR(20),
        alert_time DATETIME,
        resolved_time DATETIME NULL,
        INDEX idx_alert_time (alert_time),
        INDEX idx_alert_type (alert_type, resolved_time)
    );

    -- Check for high connection count
    INSERT INTO performance_alerts (alert_type, alert_message, metric_value, threshold_value, alert_time)
    SELECT
        'HIGH_CONNECTIONS',
        CONCAT('High connection count detected: ', VARIABLE_VALUE, ' connections'),
        VARIABLE_VALUE,
        '100',
        NOW()
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME = 'Threads_connected'
      AND CAST(VARIABLE_VALUE AS UNSIGNED) > 100
      AND NOT EXISTS (
          SELECT 1 FROM performance_alerts
          WHERE alert_type = 'HIGH_CONNECTIONS'
            AND resolved_time IS NULL
            AND alert_time > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      );

    -- Check for slow queries
    INSERT INTO performance_alerts (alert_type, alert_message, metric_value, threshold_value, alert_time)
    SELECT
        'SLOW_QUERIES',
        CONCAT('Slow queries detected: ', VARIABLE_VALUE, ' slow queries'),
        VARIABLE_VALUE,
        '50',
        NOW()
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME = 'Slow_queries'
      AND CAST(VARIABLE_VALUE AS UNSIGNED) > 50
      AND NOT EXISTS (
          SELECT 1 FROM performance_alerts
          WHERE alert_type = 'SLOW_QUERIES'
            AND resolved_time IS NULL
            AND alert_time > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
      );

    -- Check buffer pool hit ratio
    INSERT INTO performance_alerts (alert_type, alert_message, metric_value, threshold_value, alert_time)
    SELECT
        'LOW_BUFFER_POOL_HIT_RATIO',
        CONCAT('Low buffer pool hit ratio: ',
               ROUND(100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100), 2), '%'),
        ROUND(100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100), 2),
        '95',
        NOW()
    FROM
        (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') reads,
        (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests') requests
    WHERE (100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100)) < 95
      AND NOT EXISTS (
          SELECT 1 FROM performance_alerts
          WHERE alert_type = 'LOW_BUFFER_POOL_HIT_RATIO'
            AND resolved_time IS NULL
            AND alert_time > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
      );

    -- Return current unresolved alerts
    SELECT
        alert_type,
        alert_message,
        metric_value,
        threshold_value,
        alert_time,
        TIMESTAMPDIFF(MINUTE, alert_time, NOW()) as minutes_ago
    FROM performance_alerts
    WHERE resolved_time IS NULL
    ORDER BY alert_time DESC;

END //

DELIMITER ;

-- Run performance checks
CALL CheckPerformanceAlerts();
```

### Historical Performance Tracking

```sql
-- Create performance history tracking
CREATE TABLE performance_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    metric_category VARCHAR(50),
    metric_name VARCHAR(100),
    metric_value BIGINT,
    recorded_at DATETIME,
    INDEX idx_perf_history_time (recorded_at),
    INDEX idx_perf_history_metric (metric_category, metric_name, recorded_at)
);

-- Procedure to collect performance metrics
DELIMITER //

CREATE PROCEDURE CollectPerformanceMetrics()
BEGIN
    -- Collect connection metrics
    INSERT INTO performance_history (metric_category, metric_name, metric_value, recorded_at)
    SELECT
        'Connections',
        VARIABLE_NAME,
        CAST(VARIABLE_VALUE AS UNSIGNED),
        NOW()
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME IN ('Threads_connected', 'Threads_running', 'Connections');

    -- Collect query metrics
    INSERT INTO performance_history (metric_category, metric_name, metric_value, recorded_at)
    SELECT
        'Queries',
        VARIABLE_NAME,
        CAST(VARIABLE_VALUE AS UNSIGNED),
        NOW()
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME IN ('Queries', 'Slow_queries', 'Select_full_join');

    -- Collect InnoDB metrics
    INSERT INTO performance_history (metric_category, metric_name, metric_value, recorded_at)
    SELECT
        'InnoDB',
        VARIABLE_NAME,
        CAST(VARIABLE_VALUE AS UNSIGNED),
        NOW()
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME IN (
        'Innodb_buffer_pool_reads', 'Innodb_buffer_pool_read_requests',
        'Innodb_rows_read', 'Innodb_rows_inserted', 'Innodb_rows_updated'
    );

END //

DELIMITER ;

-- Create event to collect metrics every 5 minutes
CREATE EVENT IF NOT EXISTS evt_collect_performance_metrics
ON SCHEDULE EVERY 5 MINUTE
STARTS NOW()
DO
    CALL CollectPerformanceMetrics();

-- Query performance trends
SELECT
    metric_name,
    DATE(recorded_at) as date,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    ROUND(AVG(metric_value), 2) as avg_value,
    COUNT(*) as sample_count
FROM performance_history
WHERE metric_category = 'Connections'
  AND recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY metric_name, DATE(recorded_at)
ORDER BY metric_name, date;
```

## Partitioning and Sharding 🗂️

### Table Partitioning

```sql
-- Range partitioning by date
CREATE TABLE orders_partitioned (
    order_id INT AUTO_INCREMENT,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10,2),
    status VARCHAR(20),
    created_at DATETIME,
    PRIMARY KEY (order_id, order_date),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status)
)
PARTITION BY RANGE (YEAR(order_date)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Hash partitioning for even distribution
CREATE TABLE customer_activity_log (
    log_id BIGINT AUTO_INCREMENT,
    customer_id INT,
    activity_type VARCHAR(50),
    activity_data JSON,
    created_at DATETIME,
    PRIMARY KEY (log_id, customer_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
)
PARTITION BY HASH(customer_id)
PARTITIONS 8;

-- List partitioning by category
CREATE TABLE products_partitioned (
    product_id INT AUTO_INCREMENT,
    product_name VARCHAR(200),
    category_id INT,
    price DECIMAL(10,2),
    stock_quantity INT,
    PRIMARY KEY (product_id, category_id),
    INDEX idx_price (price),
    INDEX idx_stock (stock_quantity)
)
PARTITION BY LIST(category_id) (
    PARTITION p_electronics VALUES IN (1,2,3),
    PARTITION p_clothing VALUES IN (4,5,6),
    PARTITION p_home_garden VALUES IN (7,8,9),
    PARTITION p_books VALUES IN (10,11,12),
    PARTITION p_other VALUES IN (13,14,15,16,17,18,19,20)
);

-- Partition management procedures
DELIMITER //

CREATE PROCEDURE ManageOrderPartitions()
BEGIN
    DECLARE next_year INT;
    DECLARE partition_name VARCHAR(20);
    DECLARE partition_exists INT DEFAULT 0;

    SET next_year = YEAR(CURDATE()) + 1;
    SET partition_name = CONCAT('p', next_year);

    -- Check if partition already exists
    SELECT COUNT(*) INTO partition_exists
    FROM information_schema.partitions
    WHERE table_schema = DATABASE()
      AND table_name = 'orders_partitioned'
      AND partition_name = partition_name;

    -- Add new partition if it doesn't exist
    IF partition_exists = 0 THEN
        SET @sql = CONCAT(
            'ALTER TABLE orders_partitioned ADD PARTITION (',
            'PARTITION ', partition_name, ' VALUES LESS THAN (', next_year + 1, ')',
            ')'
        );
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        INSERT INTO system_log (log_type, log_message, log_date)
        VALUES ('PARTITION', CONCAT('Added partition ', partition_name, ' for orders_partitioned'), NOW());
    END IF;

    -- Drop old partitions (keep 3 years of data)
    SELECT CONCAT('ALTER TABLE orders_partitioned DROP PARTITION ', partition_name) as drop_sql
    FROM information_schema.partitions
    WHERE table_schema = DATABASE()
      AND table_name = 'orders_partitioned'
      AND partition_name LIKE 'p%'
      AND CAST(SUBSTRING(partition_name, 2) AS UNSIGNED) < YEAR(CURDATE()) - 2;

END //

DELIMITER ;

-- Query partition information
SELECT
    table_name,
    partition_name,
    partition_method,
    partition_expression,
    partition_description,
    table_rows,
    ROUND((data_length + index_length) / 1024 / 1024, 2) as size_mb
FROM information_schema.partitions
WHERE table_schema = DATABASE()
  AND partition_name IS NOT NULL
ORDER BY table_name, partition_name;
```

### Horizontal Sharding Strategy

```sql
-- Sharding setup for large-scale applications
-- Shard configuration table
CREATE TABLE shard_configuration (
    shard_id INT PRIMARY KEY,
    shard_name VARCHAR(50),
    database_host VARCHAR(100),
    database_name VARCHAR(50),
    shard_key_min INT,
    shard_key_max INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    INDEX idx_shard_range (shard_key_min, shard_key_max)
);

-- Sample shard configuration
INSERT INTO shard_configuration VALUES
(1, 'shard_customers_01', 'db-shard-01.example.com', 'ecommerce_shard_01', 1, 1000000, TRUE, NOW()),
(2, 'shard_customers_02', 'db-shard-02.example.com', 'ecommerce_shard_02', 1000001, 2000000, TRUE, NOW()),
(3, 'shard_customers_03', 'db-shard-03.example.com', 'ecommerce_shard_03', 2000001, 3000000, TRUE, NOW()),
(4, 'shard_customers_04', 'db-shard-04.example.com', 'ecommerce_shard_04', 3000001, 4000000, TRUE, NOW());

-- Sharding router function
DELIMITER //

CREATE FUNCTION GetShardForCustomer(customer_id_param INT)
RETURNS VARCHAR(100)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE shard_host VARCHAR(100);
    DECLARE shard_db VARCHAR(50);

    SELECT
        CONCAT(database_host, '/', database_name)
    INTO shard_host
    FROM shard_configuration
    WHERE customer_id_param BETWEEN shard_key_min AND shard_key_max
      AND is_active = TRUE
    LIMIT 1;

    RETURN COALESCE(shard_host, 'default-shard');
END //

DELIMITER ;

-- Cross-shard query procedure
DELIMITER //

CREATE PROCEDURE GetCustomerOrdersSummaryAcrossShards(
    IN customer_id_param INT
)
BEGIN
    DECLARE shard_info VARCHAR(100);

    -- Get shard information for customer
    SELECT GetShardForCustomer(customer_id_param) INTO shard_info;

    -- Return shard routing information
    SELECT
        customer_id_param as customer_id,
        shard_info as target_shard,
        'Route query to specific shard' as instruction;

    -- In a real implementation, this would:
    -- 1. Connect to the appropriate shard
    -- 2. Execute the query on that shard
    -- 3. Return the results

END //

DELIMITER ;

-- Test sharding
SELECT GetShardForCustomer(500000) as shard_for_customer_500k;
SELECT GetShardForCustomer(1500000) as shard_for_customer_1_5m;
```

## Practice Exercises 💪

### Exercise 1: Query Optimization Challenge

```sql
-- 1. Analyze and optimize this slow query:
/*
SELECT c.first_name, c.last_name,
       COUNT(o.order_id) as order_count,
       SUM(oi.quantity * oi.unit_price) as total_revenue
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
WHERE YEAR(o.order_date) = 2024
  AND c.country = 'USA'
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING total_revenue > 1000
ORDER BY total_revenue DESC;
*/

-- 2. Create appropriate indexes
-- 3. Rewrite the query for better performance
-- 4. Implement result caching strategy
-- 5. Monitor the performance improvement
```

### Exercise 2: Partitioning Implementation

```sql
-- 1. Design a partitioning strategy for order_items table
-- 2. Implement range partitioning by order_date
-- 3. Create partition maintenance procedures
-- 4. Test query performance across partitions
-- 5. Implement partition pruning optimization
```

### Exercise 3: Performance Monitoring System

```sql
-- 1. Create a comprehensive performance monitoring dashboard
-- 2. Implement automated alerting for performance issues
-- 3. Design historical performance trending
-- 4. Create index usage analysis tools
-- 5. Build query performance baseline comparison
```

## Advanced Optimization Tips 🚀

### MySQL 8.0+ Specific Optimizations

```sql
-- Invisible indexes for testing
CREATE INDEX idx_test_performance ON orders(customer_id, order_date) INVISIBLE;

-- Make index visible after testing
ALTER TABLE orders ALTER INDEX idx_test_performance VISIBLE;

-- Descending indexes
CREATE INDEX idx_orders_date_desc ON orders(order_date DESC, total_amount DESC);

-- Functional indexes
CREATE INDEX idx_customer_domain ON customers((SUBSTRING_INDEX(email, '@', -1)));

-- Multi-valued indexes for JSON
ALTER TABLE products ADD COLUMN tags JSON;
CREATE INDEX idx_product_tags ON products((CAST(tags->'$[*]' AS CHAR(200) ARRAY)));

-- Histogram statistics for better query optimization
ANALYZE TABLE orders UPDATE HISTOGRAM ON order_date, total_amount WITH 100 BUCKETS;
ANALYZE TABLE customers UPDATE HISTOGRAM ON created_at WITH 50 BUCKETS;

-- Check histogram information
SELECT
    SCHEMA_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    JSON_EXTRACT(HISTOGRAM, '$.buckets[0]') as first_bucket,
    JSON_EXTRACT(HISTOGRAM, '$.buckets[last]') as last_bucket
FROM information_schema.COLUMN_STATISTICS;
```

### Resource Group Management (MySQL 8.0+)

```sql
-- Create resource groups for different workload types
CREATE RESOURCE GROUP rg_oltp
    TYPE = USER
    VCPU = 0-3
    THREAD_PRIORITY = 0;

CREATE RESOURCE GROUP rg_analytics
    TYPE = USER
    VCPU = 4-7
    THREAD_PRIORITY = -20;

-- Assign sessions to resource groups
SET RESOURCE GROUP rg_oltp;  -- For OLTP queries
SET RESOURCE GROUP rg_analytics;  -- For analytics queries

-- View resource group information
SELECT * FROM information_schema.RESOURCE_GROUPS;
```

## Next Steps ➡️

You've mastered database performance optimization! This knowledge enables you to design high-performance database systems that can handle enterprise-scale workloads efficiently. Next, we'll explore Database Security and Administration for complete database management expertise.

---

## Quick Reference 📚

### Performance Analysis Commands

```sql
-- Execution plan analysis
EXPLAIN [FORMAT=JSON|TREE] SELECT ...;

-- Index usage analysis
SELECT * FROM performance_schema.table_io_waits_summary_by_index_usage;

-- Query performance analysis
SELECT * FROM performance_schema.events_statements_summary_by_digest;

-- Table optimization
ANALYZE TABLE table_name;
OPTIMIZE TABLE table_name;
```

### Key Optimization Principles

-   ✅ **Index Strategy**: Create covering indexes for frequent queries
-   ✅ **Query Design**: Avoid functions on indexed columns
-   ✅ **Partitioning**: Use for large tables with time-based access patterns
-   ✅ **Caching**: Implement result caching for expensive aggregations
-   ✅ **Monitoring**: Continuously monitor and tune performance
-   ✅ **Testing**: Always test optimizations in staging environment
