# Database Maintenance and Optimization

## Introduction to Database Maintenance 🔧

Database maintenance involves regular activities to ensure optimal performance, data integrity, and system reliability. This includes table optimization, index maintenance, statistics updates, and automated cleanup procedures.

## Maintenance Scheduling and Planning 📅

### Maintenance Framework Setup

```sql
-- Database maintenance schedule
CREATE TABLE maintenance_schedule (
    maintenance_id INT PRIMARY KEY AUTO_INCREMENT,
    maintenance_name VARCHAR(100),
    maintenance_type ENUM('ANALYZE', 'OPTIMIZE', 'REPAIR', 'CLEANUP', 'INDEX_REBUILD', 'STATISTICS_UPDATE'),
    target_schema VARCHAR(64),
    target_table VARCHAR(64),
    maintenance_frequency VARCHAR(50),
    maintenance_time TIME,
    estimated_duration_minutes INT,
    maintenance_priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    is_active BOOLEAN DEFAULT TRUE,
    last_run DATETIME,
    next_run DATETIME,
    created_at DATETIME DEFAULT NOW(),
    maintenance_window_start TIME,
    maintenance_window_end TIME,
    max_concurrent_jobs INT DEFAULT 1,
    INDEX idx_maintenance_schedule_time (maintenance_time, is_active),
    INDEX idx_maintenance_schedule_next_run (next_run, is_active)
);

-- Insert comprehensive maintenance schedule
INSERT INTO maintenance_schedule (
    maintenance_name, maintenance_type, target_schema, target_table,
    maintenance_frequency, maintenance_time, estimated_duration_minutes,
    maintenance_priority, maintenance_window_start, maintenance_window_end
) VALUES
('Daily Table Analysis', 'ANALYZE', 'ecommerce', '*', 'DAILY', '03:00:00', 30, 'MEDIUM', '02:00:00', '05:00:00'),
('Weekly Table Optimization', 'OPTIMIZE', 'ecommerce', '*', 'WEEKLY', '02:00:00', 120, 'HIGH', '01:00:00', '06:00:00'),
('Monthly Index Rebuild', 'INDEX_REBUILD', 'ecommerce', '*', 'MONTHLY', '01:00:00', 180, 'HIGH', '00:00:00', '06:00:00'),
('Daily Audit Log Cleanup', 'CLEANUP', 'ecommerce', 'audit_*', 'DAILY', '04:00:00', 15, 'MEDIUM', '03:00:00', '05:00:00'),
('Weekly Statistics Update', 'STATISTICS_UPDATE', 'ecommerce', '*', 'WEEKLY', '03:30:00', 45, 'MEDIUM', '02:00:00', '06:00:00'),
('Daily Transaction Log Cleanup', 'CLEANUP', 'ecommerce', 'transaction_log', 'DAILY', '04:30:00', 20, 'MEDIUM', '04:00:00', '05:00:00'),
('Monthly Archive Old Orders', 'CLEANUP', 'ecommerce', 'orders', 'MONTHLY', '02:00:00', 60, 'LOW', '01:00:00', '04:00:00');

-- Maintenance execution tracking
CREATE TABLE maintenance_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    maintenance_id INT,
    start_time DATETIME,
    end_time DATETIME,
    maintenance_status ENUM('SUCCESS', 'FAILED', 'IN_PROGRESS', 'SKIPPED', 'CANCELLED'),
    tables_processed INT,
    rows_affected BIGINT,
    error_message TEXT,
    performance_impact TEXT,
    size_before_mb DECIMAL(12,2),
    size_after_mb DECIMAL(12,2),
    space_reclaimed_mb DECIMAL(12,2),
    execution_details JSON,
    FOREIGN KEY (maintenance_id) REFERENCES maintenance_schedule(maintenance_id),
    INDEX idx_maintenance_history_status (maintenance_status, start_time),
    INDEX idx_maintenance_history_maintenance (maintenance_id, start_time)
);
```

## Comprehensive Maintenance Procedures 🛠️

### Main Maintenance Execution Engine

```sql
-- Comprehensive maintenance procedure
DELIMITER //

CREATE PROCEDURE ExecuteMaintenance(IN maintenance_id_param INT)
BEGIN
    DECLARE maintenance_type_var VARCHAR(20);
    DECLARE target_schema_var VARCHAR(64);
    DECLARE target_table_var VARCHAR(64);
    DECLARE maintenance_name_var VARCHAR(100);
    DECLARE start_time_var DATETIME;
    DECLARE end_time_var DATETIME;
    DECLARE tables_processed_var INT DEFAULT 0;
    DECLARE rows_affected_var BIGINT DEFAULT 0;
    DECLARE size_before_var DECIMAL(12,2) DEFAULT 0;
    DECLARE size_after_var DECIMAL(12,2) DEFAULT 0;
    DECLARE maintenance_priority_var VARCHAR(10);

    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name_var VARCHAR(64);
    DECLARE table_rows_var BIGINT;
    DECLARE table_size_mb DECIMAL(12,2);

    DECLARE table_cursor CURSOR FOR
        SELECT
            t.table_name,
            COALESCE(t.table_rows, 0),
            ROUND((t.data_length + t.index_length) / 1024 / 1024, 2)
        FROM information_schema.tables t
        WHERE t.table_schema = target_schema_var
          AND t.table_type = 'BASE TABLE'
          AND (target_table_var = '*' OR t.table_name = target_table_var)
          AND (target_table_var = '*' OR t.table_name LIKE REPLACE(target_table_var, '*', '%'))
        ORDER BY (t.data_length + t.index_length) DESC;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @error_message = MESSAGE_TEXT;

        UPDATE maintenance_history
        SET end_time = NOW(),
            maintenance_status = 'FAILED',
            error_message = @error_message
        WHERE history_id = @current_history_id;

        RESIGNAL;
    END;

    -- Get maintenance configuration
    SELECT
        maintenance_type,
        target_schema,
        target_table,
        maintenance_name,
        maintenance_priority
    INTO
        maintenance_type_var,
        target_schema_var,
        target_table_var,
        maintenance_name_var,
        maintenance_priority_var
    FROM maintenance_schedule
    WHERE maintenance_id = maintenance_id_param
      AND is_active = TRUE;

    IF maintenance_type_var IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maintenance job not found or inactive';
    END IF;

    -- Check if already running
    SELECT COUNT(*) INTO @running_count
    FROM maintenance_history
    WHERE maintenance_id = maintenance_id_param
      AND maintenance_status = 'IN_PROGRESS';

    IF @running_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maintenance job already running';
    END IF;

    SET start_time_var = NOW();

    -- Calculate size before maintenance
    SELECT
        ROUND(SUM((data_length + index_length) / 1024 / 1024), 2)
    INTO size_before_var
    FROM information_schema.tables
    WHERE table_schema = target_schema_var
      AND (target_table_var = '*' OR table_name = target_table_var);

    -- Log maintenance start
    INSERT INTO maintenance_history (
        maintenance_id, start_time, maintenance_status, size_before_mb,
        execution_details
    ) VALUES (
        maintenance_id_param, start_time_var, 'IN_PROGRESS', size_before_var,
        JSON_OBJECT(
            'maintenance_type', maintenance_type_var,
            'target_schema', target_schema_var,
            'target_table', target_table_var,
            'priority', maintenance_priority_var
        )
    );

    SET @current_history_id = LAST_INSERT_ID();

    -- Execute maintenance based on type
    OPEN table_cursor;

    maintenance_loop: LOOP
        FETCH table_cursor INTO table_name_var, table_rows_var, table_size_mb;

        IF done THEN
            LEAVE maintenance_loop;
        END IF;

        -- Skip very small tables (< 1MB) for optimization operations
        IF maintenance_type_var IN ('OPTIMIZE', 'INDEX_REBUILD') AND table_size_mb < 1 THEN
            ITERATE maintenance_loop;
        END IF;

        CASE maintenance_type_var
            WHEN 'ANALYZE' THEN
                SET @sql = CONCAT('ANALYZE TABLE ', target_schema_var, '.', table_name_var);
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;

            WHEN 'OPTIMIZE' THEN
                -- Check fragmentation before optimization
                SELECT
                    ROUND((data_free / (data_length + index_length + data_free)) * 100, 2)
                INTO @fragmentation_percent
                FROM information_schema.tables
                WHERE table_schema = target_schema_var
                  AND table_name = table_name_var
                  AND (data_length + index_length + data_free) > 0;

                -- Only optimize if fragmentation > 10%
                IF COALESCE(@fragmentation_percent, 0) > 10 THEN
                    SET @sql = CONCAT('OPTIMIZE TABLE ', target_schema_var, '.', table_name_var);
                    PREPARE stmt FROM @sql;
                    EXECUTE stmt;
                    DEALLOCATE PREPARE stmt;
                END IF;

            WHEN 'REPAIR' THEN
                SET @sql = CONCAT('REPAIR TABLE ', target_schema_var, '.', table_name_var);
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;

            WHEN 'CLEANUP' THEN
                -- Custom cleanup logic based on table pattern and type
                IF table_name_var LIKE 'audit_%' THEN
                    SET @sql = CONCAT(
                        'DELETE FROM ', target_schema_var, '.', table_name_var,
                        ' WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY) LIMIT 10000'
                    );
                    PREPARE stmt FROM @sql;
                    EXECUTE stmt;
                    SET rows_affected_var = rows_affected_var + ROW_COUNT();
                    DEALLOCATE PREPARE stmt;

                ELSEIF table_name_var = 'transaction_log' THEN
                    SET @sql = CONCAT(
                        'DELETE FROM ', target_schema_var, '.', table_name_var,
                        ' WHERE transaction_date < DATE_SUB(NOW(), INTERVAL 30 DAY) LIMIT 5000'
                    );
                    PREPARE stmt FROM @sql;
                    EXECUTE stmt;
                    SET rows_affected_var = rows_affected_var + ROW_COUNT();
                    DEALLOCATE PREPARE stmt;

                ELSEIF table_name_var = 'orders' THEN
                    -- Archive old completed orders
                    SET @sql = CONCAT(
                        'INSERT INTO ', target_schema_var, '.orders_archive ',
                        'SELECT * FROM ', target_schema_var, '.', table_name_var,
                        ' WHERE order_status = "COMPLETED" AND created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR) LIMIT 1000'
                    );
                    PREPARE stmt FROM @sql;
                    EXECUTE stmt;
                    DEALLOCATE PREPARE stmt;

                    -- Delete archived orders
                    SET @sql = CONCAT(
                        'DELETE FROM ', target_schema_var, '.', table_name_var,
                        ' WHERE order_status = "COMPLETED" AND created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR) LIMIT 1000'
                    );
                    PREPARE stmt FROM @sql;
                    EXECUTE stmt;
                    SET rows_affected_var = rows_affected_var + ROW_COUNT();
                    DEALLOCATE PREPARE stmt;
                END IF;

            WHEN 'INDEX_REBUILD' THEN
                -- Get all indexes for the table
                SELECT GROUP_CONCAT(DISTINCT index_name) INTO @indexes
                FROM information_schema.statistics
                WHERE table_schema = target_schema_var
                  AND table_name = table_name_var
                  AND index_name != 'PRIMARY';

                -- Rebuild indexes by dropping and recreating (simplified approach)
                SET @sql = CONCAT('ALTER TABLE ', target_schema_var, '.', table_name_var, ' ENGINE=InnoDB');
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;

            WHEN 'STATISTICS_UPDATE' THEN
                -- Update table statistics
                SET @sql = CONCAT('ANALYZE TABLE ', target_schema_var, '.', table_name_var);
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;

                -- Update custom statistics if table has them
                IF table_name_var IN ('orders', 'customers', 'products') THEN
                    CALL UpdateTableStatistics(target_schema_var, table_name_var);
                END IF;

        END CASE;

        SET tables_processed_var = tables_processed_var + 1;

        -- Yield control for high-priority operations
        IF maintenance_priority_var = 'LOW' AND tables_processed_var % 5 = 0 THEN
            DO SLEEP(1); -- Brief pause for low priority maintenance
        END IF;

    END LOOP;

    CLOSE table_cursor;

    SET end_time_var = NOW();

    -- Calculate size after maintenance
    SELECT
        ROUND(SUM((data_length + index_length) / 1024 / 1024), 2)
    INTO size_after_var
    FROM information_schema.tables
    WHERE table_schema = target_schema_var
      AND (target_table_var = '*' OR table_name = target_table_var);

    -- Update maintenance history
    UPDATE maintenance_history
    SET end_time = end_time_var,
        maintenance_status = 'SUCCESS',
        tables_processed = tables_processed_var,
        rows_affected = rows_affected_var,
        size_after_mb = size_after_var,
        space_reclaimed_mb = GREATEST(size_before_var - size_after_var, 0),
        performance_impact = CONCAT(
            'Space reclaimed: ',
            ROUND(GREATEST(size_before_var - size_after_var, 0), 2),
            ' MB, Duration: ',
            TIMESTAMPDIFF(MINUTE, start_time_var, end_time_var),
            ' minutes, Tables processed: ',
            tables_processed_var
        ),
        execution_details = JSON_SET(
            execution_details,
            '$.end_time', end_time_var,
            '$.tables_processed', tables_processed_var,
            '$.rows_affected', rows_affected_var,
            '$.space_reclaimed_mb', GREATEST(size_before_var - size_after_var, 0)
        )
    WHERE history_id = @current_history_id;

    -- Update next run time
    UPDATE maintenance_schedule
    SET last_run = start_time_var,
        next_run = CASE maintenance_frequency
            WHEN 'DAILY' THEN DATE_ADD(start_time_var, INTERVAL 1 DAY)
            WHEN 'WEEKLY' THEN DATE_ADD(start_time_var, INTERVAL 1 WEEK)
            WHEN 'MONTHLY' THEN DATE_ADD(start_time_var, INTERVAL 1 MONTH)
        END
    WHERE maintenance_id = maintenance_id_param;

    -- Return maintenance summary
    SELECT
        maintenance_name_var as maintenance_name,
        maintenance_type_var as maintenance_type,
        tables_processed_var as tables_processed,
        rows_affected_var as rows_affected,
        ROUND(GREATEST(size_before_var - size_after_var, 0), 2) as space_reclaimed_mb,
        TIMESTAMPDIFF(MINUTE, start_time_var, end_time_var) as duration_minutes,
        'SUCCESS' as status;

END //

DELIMITER ;

-- Custom statistics update procedure
DELIMITER //

CREATE PROCEDURE UpdateTableStatistics(
    IN schema_name VARCHAR(64),
    IN table_name VARCHAR(64)
)
BEGIN
    -- Update custom statistics based on table type
    CASE table_name
        WHEN 'orders' THEN
            INSERT INTO table_statistics (
                schema_name, table_name, stat_name, stat_value, updated_at
            ) VALUES
            (schema_name, table_name, 'total_orders',
             (SELECT COUNT(*) FROM orders), NOW()),
            (schema_name, table_name, 'avg_order_value',
             (SELECT ROUND(AVG(order_total), 2) FROM orders), NOW()),
            (schema_name, table_name, 'orders_last_30_days',
             (SELECT COUNT(*) FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)), NOW())
            ON DUPLICATE KEY UPDATE
                stat_value = VALUES(stat_value),
                updated_at = VALUES(updated_at);

        WHEN 'customers' THEN
            INSERT INTO table_statistics (
                schema_name, table_name, stat_name, stat_value, updated_at
            ) VALUES
            (schema_name, table_name, 'total_customers',
             (SELECT COUNT(*) FROM customers), NOW()),
            (schema_name, table_name, 'active_customers_30_days',
             (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)), NOW())
            ON DUPLICATE KEY UPDATE
                stat_value = VALUES(stat_value),
                updated_at = VALUES(updated_at);

        WHEN 'products' THEN
            INSERT INTO table_statistics (
                schema_name, table_name, stat_name, stat_value, updated_at
            ) VALUES
            (schema_name, table_name, 'total_products',
             (SELECT COUNT(*) FROM products), NOW()),
            (schema_name, table_name, 'active_products',
             (SELECT COUNT(*) FROM products WHERE status = 'ACTIVE'), NOW())
            ON DUPLICATE KEY UPDATE
                stat_value = VALUES(stat_value),
                updated_at = VALUES(updated_at);
    END CASE;

END //

DELIMITER ;

-- Create table statistics table if it doesn't exist
CREATE TABLE IF NOT EXISTS table_statistics (
    stat_id INT PRIMARY KEY AUTO_INCREMENT,
    schema_name VARCHAR(64),
    table_name VARCHAR(64),
    stat_name VARCHAR(100),
    stat_value DECIMAL(15,2),
    updated_at DATETIME,
    UNIQUE KEY uk_table_stats (schema_name, table_name, stat_name),
    INDEX idx_table_stats_updated (updated_at)
);
```

## Database Health Check System 🏥

### Comprehensive Health Assessment

```sql
-- Comprehensive database health check procedure
DELIMITER //

CREATE PROCEDURE DatabaseHealthCheck()
BEGIN
    -- Create temporary table for health check results
    DROP TEMPORARY TABLE IF EXISTS health_check_results;
    CREATE TEMPORARY TABLE health_check_results (
        check_category VARCHAR(50),
        check_name VARCHAR(100),
        check_status ENUM('PASS', 'WARNING', 'CRITICAL', 'INFO'),
        check_value VARCHAR(200),
        recommendation TEXT,
        impact_level ENUM('LOW', 'MEDIUM', 'HIGH'),
        check_timestamp DATETIME DEFAULT NOW()
    );

    -- Check 1: Database connectivity and basic info
    INSERT INTO health_check_results VALUES (
        'System Info',
        'MySQL Version',
        'INFO',
        VERSION(),
        'Keep MySQL updated to latest stable version for security and performance',
        'LOW',
        NOW()
    );

    INSERT INTO health_check_results VALUES (
        'System Info',
        'Server Uptime',
        'INFO',
        CONCAT(FLOOR(VARIABLE_VALUE/86400), ' days, ',
               FLOOR((VARIABLE_VALUE%86400)/3600), ' hours'),
        'Monitor for unexpected restarts which may indicate stability issues',
        'LOW',
        NOW()
    )
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME = 'Uptime';

    -- Check 2: Connection usage and limits
    INSERT INTO health_check_results
    SELECT
        'Connections',
        'Connection Usage',
        CASE
            WHEN (connected.VARIABLE_VALUE / max_conn.VARIABLE_VALUE * 100) > 80 THEN 'CRITICAL'
            WHEN (connected.VARIABLE_VALUE / max_conn.VARIABLE_VALUE * 100) > 60 THEN 'WARNING'
            ELSE 'PASS'
        END,
        CONCAT(connected.VARIABLE_VALUE, ' / ', max_conn.VARIABLE_VALUE,
               ' (', ROUND(connected.VARIABLE_VALUE / max_conn.VARIABLE_VALUE * 100, 1), '%)'),
        CASE
            WHEN (connected.VARIABLE_VALUE / max_conn.VARIABLE_VALUE * 100) > 80
            THEN 'CRITICAL: Immediate action required - increase max_connections or optimize connection usage'
            WHEN (connected.VARIABLE_VALUE / max_conn.VARIABLE_VALUE * 100) > 60
            THEN 'WARNING: Consider increasing max_connections or implementing connection pooling'
            ELSE 'Connection usage is healthy'
        END,
        CASE
            WHEN (connected.VARIABLE_VALUE / max_conn.VARIABLE_VALUE * 100) > 80 THEN 'HIGH'
            WHEN (connected.VARIABLE_VALUE / max_conn.VARIABLE_VALUE * 100) > 60 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        NOW()
    FROM
        (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Threads_connected') connected,
        (SELECT VARIABLE_VALUE FROM performance_schema.global_variables WHERE VARIABLE_NAME = 'max_connections') max_conn;

    -- Check 3: InnoDB Buffer Pool efficiency
    INSERT INTO health_check_results
    SELECT
        'Performance',
        'InnoDB Buffer Pool Hit Rate',
        CASE
            WHEN (100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100)) < 90 THEN 'CRITICAL'
            WHEN (100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100)) < 95 THEN 'WARNING'
            ELSE 'PASS'
        END,
        CONCAT(ROUND(100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100), 2), '%'),
        CASE
            WHEN (100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100)) < 90
            THEN 'CRITICAL: Buffer pool hit rate too low - increase innodb_buffer_pool_size immediately'
            WHEN (100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100)) < 95
            THEN 'WARNING: Consider increasing innodb_buffer_pool_size for better performance'
            ELSE 'Buffer pool efficiency is excellent'
        END,
        CASE
            WHEN (100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100)) < 90 THEN 'HIGH'
            WHEN (100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100)) < 95 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        NOW()
    FROM
        (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') reads,
        (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests') requests
    WHERE requests.VARIABLE_VALUE > 0;

    -- Check 4: Slow queries analysis
    INSERT INTO health_check_results
    SELECT
        'Performance',
        'Slow Queries',
        CASE
            WHEN VARIABLE_VALUE > 500 THEN 'CRITICAL'
            WHEN VARIABLE_VALUE > 100 THEN 'WARNING'
            ELSE 'PASS'
        END,
        CONCAT(VARIABLE_VALUE, ' slow queries detected'),
        CASE
            WHEN VARIABLE_VALUE > 500
            THEN 'CRITICAL: High number of slow queries - review and optimize immediately'
            WHEN VARIABLE_VALUE > 100
            THEN 'WARNING: Review slow query log and optimize problematic queries'
            ELSE 'Slow query count is acceptable'
        END,
        CASE
            WHEN VARIABLE_VALUE > 500 THEN 'HIGH'
            WHEN VARIABLE_VALUE > 100 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        NOW()
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME = 'Slow_queries';

    -- Check 5: Table fragmentation analysis
    INSERT INTO health_check_results
    SELECT
        'Storage',
        'Table Fragmentation',
        CASE
            WHEN AVG(fragmentation_percent) > 40 THEN 'CRITICAL'
            WHEN AVG(fragmentation_percent) > 20 THEN 'WARNING'
            ELSE 'PASS'
        END,
        CONCAT(ROUND(AVG(fragmentation_percent), 1), '% average fragmentation across ',
               COUNT(*), ' tables'),
        CASE
            WHEN AVG(fragmentation_percent) > 40
            THEN 'CRITICAL: High fragmentation detected - schedule OPTIMIZE TABLE operations'
            WHEN AVG(fragmentation_percent) > 20
            THEN 'WARNING: Moderate fragmentation - consider running OPTIMIZE TABLE on affected tables'
            ELSE 'Table fragmentation is within acceptable levels'
        END,
        CASE
            WHEN AVG(fragmentation_percent) > 40 THEN 'HIGH'
            WHEN AVG(fragmentation_percent) > 20 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        NOW()
    FROM (
        SELECT
            table_name,
            CASE
                WHEN data_free > 0 AND (data_length + index_length) > 0
                THEN (data_free / (data_length + index_length + data_free) * 100)
                ELSE 0
            END as fragmentation_percent
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_type = 'BASE TABLE'
          AND (data_length + index_length) > 1048576 -- Only check tables > 1MB
    ) frag_data
    WHERE fragmentation_percent > 0;

    -- Check 6: Index usage efficiency
    INSERT INTO health_check_results
    SELECT
        'Performance',
        'Unused Indexes',
        CASE
            WHEN COUNT(*) > 10 THEN 'WARNING'
            WHEN COUNT(*) > 20 THEN 'CRITICAL'
            ELSE 'PASS'
        END,
        CONCAT(COUNT(*), ' potentially unused indexes found'),
        CASE
            WHEN COUNT(*) > 20
            THEN 'CRITICAL: Many unused indexes detected - consider removing to improve write performance'
            WHEN COUNT(*) > 10
            THEN 'WARNING: Several unused indexes found - review and consider removal'
            ELSE 'Index usage appears optimal'
        END,
        CASE
            WHEN COUNT(*) > 20 THEN 'HIGH'
            WHEN COUNT(*) > 10 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        NOW()
    FROM information_schema.statistics s
    LEFT JOIN performance_schema.table_io_waits_summary_by_index_usage iu
        ON s.table_schema = iu.object_schema
        AND s.table_name = iu.object_name
        AND s.index_name = iu.index_name
    WHERE s.table_schema = DATABASE()
      AND s.index_name != 'PRIMARY'
      AND (iu.count_star IS NULL OR iu.count_star = 0);

    -- Check 7: Disk space and database size
    INSERT INTO health_check_results
    SELECT
        'Storage',
        'Database Size Growth',
        CASE
            WHEN total_size_gb > 50 THEN 'WARNING'
            WHEN total_size_gb > 100 THEN 'CRITICAL'
            ELSE 'INFO'
        END,
        CONCAT(ROUND(total_size_gb, 2), ' GB total database size'),
        CASE
            WHEN total_size_gb > 100
            THEN 'CRITICAL: Large database size - monitor disk space and consider archiving strategies'
            WHEN total_size_gb > 50
            THEN 'WARNING: Significant database size - plan for storage management'
            ELSE 'Database size is manageable'
        END,
        CASE
            WHEN total_size_gb > 100 THEN 'HIGH'
            WHEN total_size_gb > 50 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        NOW()
    FROM (
        SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024 / 1024, 2) as total_size_gb
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
    ) size_data;

    -- Check 8: Recent maintenance status
    INSERT INTO health_check_results
    SELECT
        'Maintenance',
        'Recent Maintenance',
        CASE
            WHEN MAX(start_time) < DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'WARNING'
            WHEN MAX(start_time) < DATE_SUB(NOW(), INTERVAL 3 DAY) THEN 'INFO'
            ELSE 'PASS'
        END,
        CONCAT('Last maintenance: ',
               COALESCE(DATE_FORMAT(MAX(start_time), '%Y-%m-%d %H:%i'), 'Never')),
        CASE
            WHEN MAX(start_time) < DATE_SUB(NOW(), INTERVAL 7 DAY)
            THEN 'WARNING: No recent maintenance detected - schedule regular maintenance tasks'
            WHEN MAX(start_time) IS NULL
            THEN 'WARNING: No maintenance history found - implement maintenance procedures'
            ELSE 'Maintenance schedule appears current'
        END,
        CASE
            WHEN MAX(start_time) < DATE_SUB(NOW(), INTERVAL 7 DAY) OR MAX(start_time) IS NULL THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        NOW()
    FROM maintenance_history
    WHERE maintenance_status = 'SUCCESS';

    -- Check 9: Replication status (if applicable)
    INSERT INTO health_check_results
    SELECT
        'Replication',
        'Slave Status',
        CASE
            WHEN lag_seconds > 300 THEN 'CRITICAL'
            WHEN lag_seconds > 60 THEN 'WARNING'
            ELSE 'PASS'
        END,
        CONCAT('Replication lag: ', lag_seconds, ' seconds'),
        CASE
            WHEN lag_seconds > 300
            THEN 'CRITICAL: High replication lag - investigate slave performance'
            WHEN lag_seconds > 60
            THEN 'WARNING: Moderate replication lag - monitor slave performance'
            ELSE 'Replication lag is acceptable'
        END,
        CASE
            WHEN lag_seconds > 300 THEN 'HIGH'
            WHEN lag_seconds > 60 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        NOW()
    FROM (
        -- Simulate replication lag (in production, use SHOW SLAVE STATUS)
        SELECT ROUND(RAND() * 30, 0) as lag_seconds
    ) repl_data
    WHERE lag_seconds IS NOT NULL;

    -- Return health check results with summary
    SELECT
        'Health Check Summary' as report_section,
        COUNT(*) as total_checks,
        SUM(CASE WHEN check_status = 'CRITICAL' THEN 1 ELSE 0 END) as critical_issues,
        SUM(CASE WHEN check_status = 'WARNING' THEN 1 ELSE 0 END) as warning_issues,
        SUM(CASE WHEN check_status = 'PASS' THEN 1 ELSE 0 END) as passed_checks,
        CASE
            WHEN SUM(CASE WHEN check_status = 'CRITICAL' THEN 1 ELSE 0 END) > 0 THEN 'CRITICAL'
            WHEN SUM(CASE WHEN check_status = 'WARNING' THEN 1 ELSE 0 END) > 0 THEN 'WARNING'
            ELSE 'HEALTHY'
        END as overall_health_status
    FROM health_check_results;

    -- Return detailed results
    SELECT
        check_category,
        check_name,
        check_status,
        check_value,
        recommendation,
        impact_level
    FROM health_check_results
    ORDER BY
        CASE check_status
            WHEN 'CRITICAL' THEN 1
            WHEN 'WARNING' THEN 2
            WHEN 'PASS' THEN 3
            WHEN 'INFO' THEN 4
        END,
        impact_level DESC,
        check_category,
        check_name;

END //

DELIMITER ;

-- Test health check
CALL DatabaseHealthCheck();
```

## Automated Maintenance Scheduling 📅

### Maintenance Automation and Events

```sql
-- Maintenance scheduler procedure
DELIMITER //

CREATE PROCEDURE RunScheduledMaintenance()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE maintenance_id_var INT;
    DECLARE maintenance_name_var VARCHAR(100);
    DECLARE maintenance_time_var TIME;
    DECLARE window_start_var TIME;
    DECLARE window_end_var TIME;
    DECLARE current_time_var TIME DEFAULT TIME(NOW());

    DECLARE maintenance_cursor CURSOR FOR
        SELECT
            maintenance_id,
            maintenance_name,
            maintenance_time,
            maintenance_window_start,
            maintenance_window_end
        FROM maintenance_schedule
        WHERE is_active = TRUE
          AND next_run <= NOW()
          AND (
              (maintenance_window_start <= maintenance_window_end
               AND current_time_var BETWEEN maintenance_window_start AND maintenance_window_end)
              OR
              (maintenance_window_start > maintenance_window_end
               AND (current_time_var >= maintenance_window_start OR current_time_var <= maintenance_window_end))
          );

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @error_message = MESSAGE_TEXT;

        INSERT INTO system_log (log_type, log_message, log_date)
        VALUES ('MAINTENANCE_ERROR',
                CONCAT('Maintenance error for job ', maintenance_id_var, ': ', @error_message),
                NOW());
    END;

    OPEN maintenance_cursor;

    maintenance_loop: LOOP
        FETCH maintenance_cursor INTO
            maintenance_id_var, maintenance_name_var, maintenance_time_var,
            window_start_var, window_end_var;

        IF done THEN
            LEAVE maintenance_loop;
        END IF;

        -- Check if maintenance is already running
        SELECT COUNT(*) INTO @running_count
        FROM maintenance_history
        WHERE maintenance_id = maintenance_id_var
          AND maintenance_status = 'IN_PROGRESS';

        IF @running_count = 0 THEN
            -- Log maintenance start
            INSERT INTO system_log (log_type, log_message, log_date)
            VALUES ('MAINTENANCE_START',
                    CONCAT('Starting scheduled maintenance: ', maintenance_name_var),
                    NOW());

            -- Execute maintenance
            CALL ExecuteMaintenance(maintenance_id_var);

            -- Log maintenance completion
            INSERT INTO system_log (log_type, log_message, log_date)
            VALUES ('MAINTENANCE_COMPLETE',
                    CONCAT('Completed scheduled maintenance: ', maintenance_name_var),
                    NOW());
        ELSE
            -- Log skipped maintenance
            INSERT INTO system_log (log_type, log_message, log_date)
            VALUES ('MAINTENANCE_SKIP',
                    CONCAT('Skipped maintenance (already running): ', maintenance_name_var),
                    NOW());
        END IF;

    END LOOP;

    CLOSE maintenance_cursor;

END //

DELIMITER ;

-- Create maintenance scheduling events
CREATE EVENT IF NOT EXISTS evt_run_scheduled_maintenance
ON SCHEDULE EVERY 30 MINUTE
STARTS NOW()
DO
    CALL RunScheduledMaintenance();

-- Create system log table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    log_type VARCHAR(50),
    log_message TEXT,
    log_date DATETIME,
    INDEX idx_system_log_type_date (log_type, log_date)
);
```

## Practice Exercises 💪

### Exercise 1: Maintenance Strategy Design

```sql
-- 1. Design a comprehensive maintenance strategy for a production database
-- 2. Implement automated maintenance procedures for different table types
-- 3. Create maintenance windows and priority-based scheduling
-- 4. Build maintenance monitoring and reporting
-- 5. Test maintenance procedures in a test environment
```

### Exercise 2: Health Check Implementation

```sql
-- 1. Implement comprehensive database health checks
-- 2. Create automated health monitoring with alerting
-- 3. Build trend analysis for health metrics
-- 4. Design proactive maintenance based on health indicators
-- 5. Create health dashboards and reports
```

## Quick Reference 📚

### Essential Maintenance Commands

```sql
-- Table maintenance
ANALYZE TABLE table_name;
OPTIMIZE TABLE table_name;
REPAIR TABLE table_name;
ALTER TABLE table_name ENGINE=InnoDB; -- Rebuild table

-- Check table status
SHOW TABLE STATUS LIKE 'table_name';
CHECK TABLE table_name;

-- Index information
SHOW INDEX FROM table_name;
ANALYZE TABLE table_name;
```

### Key Maintenance Best Practices

-   ✅ **Regular Scheduling**: Implement automated maintenance schedules
-   ✅ **Maintenance Windows**: Use appropriate maintenance windows to minimize impact
-   ✅ **Priority Management**: Prioritize maintenance based on business impact
-   ✅ **Health Monitoring**: Continuously monitor database health indicators
-   ✅ **Performance Impact**: Monitor and minimize performance impact during maintenance
-   ✅ **Documentation**: Document all maintenance procedures and results
-   ✅ **Testing**: Test maintenance procedures in non-production environments first
