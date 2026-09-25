# Database Capacity Planning and Scaling

## Introduction to Capacity Planning 📈

Capacity planning involves analyzing current database usage, predicting future growth, and ensuring adequate resources for optimal performance. This includes storage planning, performance scaling, and resource optimization strategies.

## Growth Analysis and Forecasting 📊

### Growth Tracking Infrastructure

```sql
-- Database growth tracking tables
CREATE TABLE growth_metrics (
    metric_id INT PRIMARY KEY AUTO_INCREMENT,
    metric_date DATE,
    database_size_mb DECIMAL(12,2),
    table_count INT,
    row_count_total BIGINT,
    index_size_mb DECIMAL(12,2),
    data_size_mb DECIMAL(12,2),
    avg_row_size_bytes DECIMAL(10,2),
    largest_table VARCHAR(64),
    largest_table_size_mb DECIMAL(12,2),
    daily_transactions BIGINT,
    peak_connections INT,
    avg_query_time_ms DECIMAL(8,2),
    created_at DATETIME DEFAULT NOW(),
    UNIQUE KEY uk_growth_metrics_date (metric_date),
    INDEX idx_growth_metrics_date (metric_date)
);

-- Table-specific growth tracking
CREATE TABLE table_growth_metrics (
    table_metric_id INT PRIMARY KEY AUTO_INCREMENT,
    metric_date DATE,
    schema_name VARCHAR(64),
    table_name VARCHAR(64),
    table_size_mb DECIMAL(12,2),
    row_count BIGINT,
    avg_row_size_bytes DECIMAL(10,2),
    index_size_mb DECIMAL(12,2),
    data_size_mb DECIMAL(12,2),
    fragmentation_percent DECIMAL(5,2),
    daily_inserts BIGINT DEFAULT 0,
    daily_updates BIGINT DEFAULT 0,
    daily_deletes BIGINT DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    UNIQUE KEY uk_table_growth_date (metric_date, schema_name, table_name),
    INDEX idx_table_growth_date (metric_date),
    INDEX idx_table_growth_table (schema_name, table_name, metric_date)
);

-- Capacity planning thresholds
CREATE TABLE capacity_thresholds (
    threshold_id INT PRIMARY KEY AUTO_INCREMENT,
    resource_type ENUM('STORAGE', 'MEMORY', 'CPU', 'CONNECTIONS', 'IOPS'),
    threshold_name VARCHAR(100),
    warning_threshold DECIMAL(10,2),
    critical_threshold DECIMAL(10,2),
    measurement_unit VARCHAR(20),
    is_percentage BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);

-- Insert capacity thresholds
INSERT INTO capacity_thresholds (resource_type, threshold_name, warning_threshold, critical_threshold, measurement_unit, is_percentage) VALUES
('STORAGE', 'Database Size', 80, 90, 'GB', FALSE),
('STORAGE', 'Disk Usage Percentage', 75, 85, '%', TRUE),
('MEMORY', 'Buffer Pool Usage', 80, 90, '%', TRUE),
('CPU', 'CPU Utilization', 70, 85, '%', TRUE),
('CONNECTIONS', 'Connection Usage', 70, 80, '%', TRUE),
('IOPS', 'Disk IO Operations', 1000, 2000, 'ops/sec', FALSE);
```

### Growth Data Collection

```sql
-- Procedure to collect comprehensive growth metrics
DELIMITER //

CREATE PROCEDURE CollectGrowthMetrics()
BEGIN
    DECLARE current_date_var DATE DEFAULT CURDATE();
    DECLARE db_size DECIMAL(12,2);
    DECLARE tbl_count INT;
    DECLARE row_total BIGINT;
    DECLARE idx_size DECIMAL(12,2);
    DECLARE data_size DECIMAL(12,2);
    DECLARE avg_row_size DECIMAL(10,2);
    DECLARE largest_tbl VARCHAR(64);
    DECLARE largest_size DECIMAL(12,2);
    DECLARE daily_trans BIGINT DEFAULT 0;
    DECLARE peak_conn INT DEFAULT 0;
    DECLARE avg_query_time DECIMAL(8,2) DEFAULT 0;

    -- Calculate database-level metrics
    SELECT
        ROUND(SUM((data_length + index_length) / 1024 / 1024), 2),
        COUNT(*),
        SUM(table_rows),
        ROUND(SUM(index_length / 1024 / 1024), 2),
        ROUND(SUM(data_length / 1024 / 1024), 2),
        ROUND(AVG(CASE WHEN table_rows > 0 THEN data_length / table_rows ELSE 0 END), 2)
    INTO db_size, tbl_count, row_total, idx_size, data_size, avg_row_size
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE';

    -- Find largest table
    SELECT
        table_name,
        ROUND((data_length + index_length) / 1024 / 1024, 2)
    INTO largest_tbl, largest_size
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
    ORDER BY (data_length + index_length) DESC
    LIMIT 1;

    -- Get peak connections (simulated - in production, track from monitoring)
    SET peak_conn = 50 + ROUND(RAND() * 100);

    -- Get average query time from performance schema
    SELECT
        ROUND(AVG(avg_timer_wait) / 1000000, 2)
    INTO avg_query_time
    FROM performance_schema.events_statements_summary_by_digest
    WHERE last_seen >= DATE_SUB(NOW(), INTERVAL 1 DAY)
      AND avg_timer_wait > 0
    LIMIT 100;

    -- Estimate daily transactions (simulated)
    SET daily_trans = 10000 + ROUND(RAND() * 50000);

    -- Insert or update database-level metrics
    INSERT INTO growth_metrics (
        metric_date, database_size_mb, table_count, row_count_total,
        index_size_mb, data_size_mb, avg_row_size_bytes,
        largest_table, largest_table_size_mb, daily_transactions,
        peak_connections, avg_query_time_ms
    ) VALUES (
        current_date_var, db_size, tbl_count, row_total,
        idx_size, data_size, avg_row_size,
        largest_tbl, largest_size, daily_trans,
        peak_conn, avg_query_time
    ) ON DUPLICATE KEY UPDATE
        database_size_mb = db_size,
        table_count = tbl_count,
        row_count_total = row_total,
        index_size_mb = idx_size,
        data_size_mb = data_size,
        avg_row_size_bytes = avg_row_size,
        largest_table = largest_tbl,
        largest_table_size_mb = largest_size,
        daily_transactions = daily_trans,
        peak_connections = peak_conn,
        avg_query_time_ms = avg_query_time,
        created_at = NOW();

    -- Collect table-level metrics
    INSERT INTO table_growth_metrics (
        metric_date, schema_name, table_name, table_size_mb,
        row_count, avg_row_size_bytes, index_size_mb, data_size_mb,
        fragmentation_percent, daily_inserts, daily_updates, daily_deletes
    )
    SELECT
        current_date_var,
        table_schema,
        table_name,
        ROUND((data_length + index_length) / 1024 / 1024, 2),
        table_rows,
        CASE WHEN table_rows > 0 THEN ROUND(data_length / table_rows, 2) ELSE 0 END,
        ROUND(index_length / 1024 / 1024, 2),
        ROUND(data_length / 1024 / 1024, 2),
        CASE
            WHEN (data_length + index_length + data_free) > 0
            THEN ROUND((data_free / (data_length + index_length + data_free)) * 100, 2)
            ELSE 0
        END,
        -- Simulate daily DML operations based on table size
        CASE
            WHEN table_rows > 1000000 THEN ROUND(table_rows * 0.01 * (0.5 + RAND() * 0.5))
            WHEN table_rows > 100000 THEN ROUND(table_rows * 0.02 * (0.5 + RAND() * 0.5))
            ELSE ROUND(table_rows * 0.05 * (0.5 + RAND() * 0.5))
        END,
        CASE
            WHEN table_rows > 1000000 THEN ROUND(table_rows * 0.005 * (0.5 + RAND() * 0.5))
            WHEN table_rows > 100000 THEN ROUND(table_rows * 0.01 * (0.5 + RAND() * 0.5))
            ELSE ROUND(table_rows * 0.02 * (0.5 + RAND() * 0.5))
        END,
        CASE
            WHEN table_rows > 1000000 THEN ROUND(table_rows * 0.002 * (0.5 + RAND() * 0.5))
            WHEN table_rows > 100000 THEN ROUND(table_rows * 0.005 * (0.5 + RAND() * 0.5))
            ELSE ROUND(table_rows * 0.01 * (0.5 + RAND() * 0.5))
        END
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
    ON DUPLICATE KEY UPDATE
        table_size_mb = VALUES(table_size_mb),
        row_count = VALUES(row_count),
        avg_row_size_bytes = VALUES(avg_row_size_bytes),
        index_size_mb = VALUES(index_size_mb),
        data_size_mb = VALUES(data_size_mb),
        fragmentation_percent = VALUES(fragmentation_percent),
        daily_inserts = VALUES(daily_inserts),
        daily_updates = VALUES(daily_updates),
        daily_deletes = VALUES(daily_deletes),
        created_at = NOW();

END //

DELIMITER ;
```

### Growth Analysis and Forecasting

```sql
-- Comprehensive growth analysis procedure
DELIMITER //

CREATE PROCEDURE AnalyzeGrowthTrends(IN forecast_days INT)
BEGIN
    -- Growth rate analysis with trend calculation
    WITH growth_analysis AS (
        SELECT
            metric_date,
            database_size_mb,
            row_count_total,
            daily_transactions,
            peak_connections,
            avg_query_time_ms,
            LAG(database_size_mb) OVER (ORDER BY metric_date) as prev_size,
            LAG(row_count_total) OVER (ORDER BY metric_date) as prev_rows,
            LAG(daily_transactions) OVER (ORDER BY metric_date) as prev_transactions,
            LAG(metric_date) OVER (ORDER BY metric_date) as prev_date
        FROM growth_metrics
        WHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
        ORDER BY metric_date
    ),
    daily_growth AS (
        SELECT
            metric_date,
            database_size_mb,
            row_count_total,
            daily_transactions,
            peak_connections,
            avg_query_time_ms,
            CASE
                WHEN prev_size IS NOT NULL AND DATEDIFF(metric_date, prev_date) > 0
                THEN (database_size_mb - prev_size) / DATEDIFF(metric_date, prev_date)
                ELSE 0
            END as daily_size_growth_mb,
            CASE
                WHEN prev_rows IS NOT NULL AND DATEDIFF(metric_date, prev_date) > 0
                THEN (row_count_total - prev_rows) / DATEDIFF(metric_date, prev_date)
                ELSE 0
            END as daily_row_growth,
            CASE
                WHEN prev_transactions IS NOT NULL AND DATEDIFF(metric_date, prev_date) > 0
                THEN (daily_transactions - prev_transactions) / DATEDIFF(metric_date, prev_date)
                ELSE 0
            END as daily_transaction_growth
        FROM growth_analysis
        WHERE prev_size IS NOT NULL
    )

    -- Current growth statistics
    SELECT
        'Growth Statistics (Last 90 Days)' as analysis_type,
        ROUND(AVG(daily_size_growth_mb), 3) as avg_daily_size_growth_mb,
        ROUND(MAX(daily_size_growth_mb), 3) as max_daily_size_growth_mb,
        ROUND(MIN(daily_size_growth_mb), 3) as min_daily_size_growth_mb,
        ROUND(AVG(daily_row_growth), 0) as avg_daily_row_growth,
        ROUND(AVG(daily_transaction_growth), 0) as avg_daily_transaction_growth,
        ROUND(AVG(peak_connections), 0) as avg_peak_connections,
        ROUND(AVG(avg_query_time_ms), 2) as avg_query_response_time_ms,
        COUNT(*) as days_analyzed,
        ROUND(STDDEV(daily_size_growth_mb), 3) as size_growth_variance
    FROM daily_growth
    WHERE daily_size_growth_mb >= 0; -- Exclude negative growth (cleanup days)

    -- Growth forecast based on trends
    SELECT
        'Growth Forecast' as analysis_type,
        forecast_days as forecast_period_days,
        CURDATE() + INTERVAL forecast_days DAY as forecast_date,
        ROUND(MAX(database_size_mb), 2) as current_size_mb,
        ROUND(MAX(database_size_mb) / 1024, 2) as current_size_gb,
        ROUND(
            MAX(database_size_mb) + (AVG(daily_size_growth_mb) * forecast_days), 2
        ) as forecasted_size_mb,
        ROUND(
            (MAX(database_size_mb) + (AVG(daily_size_growth_mb) * forecast_days)) / 1024, 2
        ) as forecasted_size_gb,
        ROUND(
            MAX(row_count_total) + (AVG(daily_row_growth) * forecast_days), 0
        ) as forecasted_row_count,
        ROUND(
            MAX(daily_transactions) + (AVG(daily_transaction_growth) * forecast_days), 0
        ) as forecasted_daily_transactions,
        -- Calculate growth rate percentage
        ROUND(
            (AVG(daily_size_growth_mb) * forecast_days / MAX(database_size_mb)) * 100, 2
        ) as growth_percentage
    FROM daily_growth, growth_metrics
    WHERE daily_size_growth_mb >= 0
      AND growth_metrics.metric_date = (SELECT MAX(metric_date) FROM growth_metrics);

    -- Table-specific growth analysis for top growing tables
    SELECT
        'Top Growing Tables' as analysis_type,
        tgm1.table_name,
        ROUND(tgm1.table_size_mb, 2) as current_size_mb,
        ROUND(tgm1.row_count / 1000, 0) as current_rows_k,
        ROUND(
            (tgm1.table_size_mb - COALESCE(tgm30.table_size_mb, 0)) /
            GREATEST(DATEDIFF(tgm1.metric_date, tgm30.metric_date), 1), 3
        ) as daily_growth_mb,
        ROUND(
            (tgm1.row_count - COALESCE(tgm30.row_count, 0)) /
            GREATEST(DATEDIFF(tgm1.metric_date, tgm30.metric_date), 1), 0
        ) as daily_row_growth,
        ROUND(tgm1.fragmentation_percent, 1) as fragmentation_percent,
        ROUND(
            tgm1.table_size_mb + (
                (tgm1.table_size_mb - COALESCE(tgm30.table_size_mb, 0)) /
                GREATEST(DATEDIFF(tgm1.metric_date, tgm30.metric_date), 1) * forecast_days
            ), 2
        ) as forecasted_size_mb
    FROM table_growth_metrics tgm1
    LEFT JOIN table_growth_metrics tgm30 ON
        tgm1.schema_name = tgm30.schema_name
        AND tgm1.table_name = tgm30.table_name
        AND tgm30.metric_date = DATE_SUB(tgm1.metric_date, INTERVAL 30 DAY)
    WHERE tgm1.metric_date = (
        SELECT MAX(metric_date) FROM table_growth_metrics
        WHERE schema_name = tgm1.schema_name AND table_name = tgm1.table_name
    )
    AND tgm1.table_size_mb > 10 -- Only analyze tables > 10MB
    ORDER BY
        CASE WHEN tgm30.table_size_mb > 0
             THEN (tgm1.table_size_mb - tgm30.table_size_mb) / GREATEST(DATEDIFF(tgm1.metric_date, tgm30.metric_date), 1)
             ELSE tgm1.table_size_mb
        END DESC
    LIMIT 10;

    -- Capacity threshold analysis
    SELECT
        'Capacity Threshold Analysis' as analysis_type,
        ct.resource_type,
        ct.threshold_name,
        ct.warning_threshold,
        ct.critical_threshold,
        ct.measurement_unit,
        CASE ct.resource_type
            WHEN 'STORAGE' THEN
                CASE ct.threshold_name
                    WHEN 'Database Size' THEN ROUND(MAX(gm.database_size_mb) / 1024, 2)
                    ELSE NULL
                END
            WHEN 'CONNECTIONS' THEN ROUND(AVG(gm.peak_connections), 0)
            ELSE NULL
        END as current_value,
        CASE
            WHEN ct.resource_type = 'STORAGE' AND ct.threshold_name = 'Database Size' THEN
                CASE
                    WHEN MAX(gm.database_size_mb) / 1024 > ct.critical_threshold THEN 'CRITICAL'
                    WHEN MAX(gm.database_size_mb) / 1024 > ct.warning_threshold THEN 'WARNING'
                    ELSE 'OK'
                END
            WHEN ct.resource_type = 'CONNECTIONS' THEN
                CASE
                    WHEN AVG(gm.peak_connections) > ct.critical_threshold THEN 'CRITICAL'
                    WHEN AVG(gm.peak_connections) > ct.warning_threshold THEN 'WARNING'
                    ELSE 'OK'
                END
            ELSE 'N/A'
        END as status
    FROM capacity_thresholds ct
    CROSS JOIN (
        SELECT
            database_size_mb,
            peak_connections
        FROM growth_metrics
        WHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    ) gm
    WHERE ct.resource_type IN ('STORAGE', 'CONNECTIONS')
    GROUP BY ct.threshold_id, ct.resource_type, ct.threshold_name,
             ct.warning_threshold, ct.critical_threshold, ct.measurement_unit;

END //

DELIMITER ;
```

## Resource Utilization Planning 🔧

### Resource Monitoring and Analysis

```sql
-- Resource utilization tracking
CREATE TABLE resource_utilization (
    util_id INT PRIMARY KEY AUTO_INCREMENT,
    recorded_at DATETIME DEFAULT NOW(),
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_percent DECIMAL(5,2),
    disk_io_ops_per_sec INT,
    network_io_mbps DECIMAL(8,2),
    active_connections INT,
    queries_per_second DECIMAL(8,2),
    innodb_buffer_pool_usage_percent DECIMAL(5,2),
    temp_table_usage_mb DECIMAL(10,2),
    slow_queries_per_hour INT,
    lock_wait_time_avg_ms DECIMAL(8,2),
    INDEX idx_resource_util_time (recorded_at)
);

-- Resource capacity planning
DELIMITER //

CREATE PROCEDURE GenerateCapacityPlan(IN planning_horizon_days INT)
BEGIN
    -- Simulate resource utilization data (in production, collect from system monitoring)
    INSERT INTO resource_utilization (
        cpu_usage_percent, memory_usage_percent, disk_io_ops_per_sec,
        network_io_mbps, active_connections, queries_per_second,
        innodb_buffer_pool_usage_percent, temp_table_usage_mb,
        slow_queries_per_hour, lock_wait_time_avg_ms
    ) VALUES (
        ROUND(40 + RAND() * 30, 2),  -- CPU: 40-70%
        ROUND(60 + RAND() * 25, 2),  -- Memory: 60-85%
        ROUND(1000 + RAND() * 2000, 0), -- Disk IO: 1000-3000 ops/sec
        ROUND(10 + RAND() * 20, 2),   -- Network: 10-30 Mbps
        ROUND(50 + RAND() * 100, 0),  -- Connections: 50-150
        ROUND(100 + RAND() * 200, 2), -- QPS: 100-300
        ROUND(70 + RAND() * 20, 2),   -- Buffer pool: 70-90%
        ROUND(50 + RAND() * 200, 2),  -- Temp tables: 50-250 MB
        ROUND(RAND() * 20, 0),        -- Slow queries: 0-20/hour
        ROUND(RAND() * 10, 2)         -- Lock wait: 0-10ms
    );

    -- Current resource utilization summary
    SELECT
        'Current Resource Utilization (Last 7 Days)' as analysis_section,
        ROUND(AVG(cpu_usage_percent), 2) as avg_cpu_percent,
        ROUND(MAX(cpu_usage_percent), 2) as peak_cpu_percent,
        ROUND(AVG(memory_usage_percent), 2) as avg_memory_percent,
        ROUND(MAX(memory_usage_percent), 2) as peak_memory_percent,
        ROUND(AVG(active_connections), 0) as avg_connections,
        ROUND(MAX(active_connections), 0) as peak_connections,
        ROUND(AVG(queries_per_second), 2) as avg_qps,
        ROUND(MAX(queries_per_second), 2) as peak_qps,
        ROUND(AVG(disk_io_ops_per_sec), 0) as avg_disk_iops,
        ROUND(MAX(disk_io_ops_per_sec), 0) as peak_disk_iops,
        ROUND(AVG(innodb_buffer_pool_usage_percent), 2) as avg_buffer_pool_usage
    FROM resource_utilization
    WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);

    -- Resource capacity analysis with recommendations
    SELECT
        'Resource Capacity Analysis' as analysis_section,
        resource_type,
        metric_name,
        current_avg_usage,
        peak_usage,
        threshold_warning,
        threshold_critical,
        ROUND((current_avg_usage / threshold_warning) * 100, 1) as warning_threshold_percent,
        ROUND((peak_usage / threshold_critical) * 100, 1) as critical_threshold_percent,
        CASE
            WHEN peak_usage > threshold_critical THEN 'IMMEDIATE_ACTION_REQUIRED'
            WHEN peak_usage > threshold_warning THEN 'MONITOR_CLOSELY'
            WHEN current_avg_usage > threshold_warning * 0.8 THEN 'PLAN_UPGRADE'
            ELSE 'ADEQUATE_CAPACITY'
        END as capacity_status,
        recommendation,
        priority
    FROM (
        SELECT 'CPU' as resource_type,
               'CPU Usage' as metric_name,
               AVG(cpu_usage_percent) as current_avg_usage,
               MAX(cpu_usage_percent) as peak_usage,
               70 as threshold_warning, 90 as threshold_critical,
               'Consider CPU upgrade, query optimization, or load balancing' as recommendation,
               CASE
                   WHEN MAX(cpu_usage_percent) > 90 THEN 'HIGH'
                   WHEN MAX(cpu_usage_percent) > 70 THEN 'MEDIUM'
                   ELSE 'LOW'
               END as priority
        FROM resource_utilization WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)

        UNION ALL

        SELECT 'Memory' as resource_type,
               'Memory Usage' as metric_name,
               AVG(memory_usage_percent) as current_avg_usage,
               MAX(memory_usage_percent) as peak_usage,
               80 as threshold_warning, 95 as threshold_critical,
               'Consider memory upgrade, buffer pool tuning, or query optimization' as recommendation,
               CASE
                   WHEN MAX(memory_usage_percent) > 95 THEN 'HIGH'
                   WHEN MAX(memory_usage_percent) > 80 THEN 'MEDIUM'
                   ELSE 'LOW'
               END as priority
        FROM resource_utilization WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)

        UNION ALL

        SELECT 'Storage' as resource_type,
               'Disk IOPS' as metric_name,
               AVG(disk_io_ops_per_sec) as current_avg_usage,
               MAX(disk_io_ops_per_sec) as peak_usage,
               2000 as threshold_warning, 3500 as threshold_critical,
               'Consider SSD upgrade, query optimization, or storage scaling' as recommendation,
               CASE
                   WHEN MAX(disk_io_ops_per_sec) > 3500 THEN 'HIGH'
                   WHEN MAX(disk_io_ops_per_sec) > 2000 THEN 'MEDIUM'
                   ELSE 'LOW'
               END as priority
        FROM resource_utilization WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)

        UNION ALL

        SELECT 'Connections' as resource_type,
               'Active Connections' as metric_name,
               AVG(active_connections) as current_avg_usage,
               MAX(active_connections) as peak_usage,
               100 as threshold_warning, 150 as threshold_critical,
               'Review connection pooling, increase max_connections, or optimize connection usage' as recommendation,
               CASE
                   WHEN MAX(active_connections) > 150 THEN 'HIGH'
                   WHEN MAX(active_connections) > 100 THEN 'MEDIUM'
                   ELSE 'LOW'
               END as priority
        FROM resource_utilization WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ) capacity_data
    ORDER BY
        CASE capacity_status
            WHEN 'IMMEDIATE_ACTION_REQUIRED' THEN 1
            WHEN 'MONITOR_CLOSELY' THEN 2
            WHEN 'PLAN_UPGRADE' THEN 3
            ELSE 4
        END,
        CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END;

    -- Growth-based capacity forecast
    SELECT
        'Growth-Based Capacity Forecast' as analysis_section,
        planning_horizon_days as forecast_days,
        'Database Storage' as resource_type,
        ROUND(MAX(gm.database_size_mb), 2) as current_size_mb,
        ROUND(MAX(gm.database_size_mb) / 1024, 2) as current_size_gb,
        ROUND(
            MAX(gm.database_size_mb) *
            (1 + (planning_horizon_days / 365.0) * 0.5), 2
        ) as forecasted_size_mb,
        ROUND(
            (MAX(gm.database_size_mb) * (1 + (planning_horizon_days / 365.0) * 0.5)) / 1024, 2
        ) as forecasted_size_gb,
        ROUND(
            MAX(gm.daily_transactions) *
            (1 + (planning_horizon_days / 365.0) * 0.3), 0
        ) as forecasted_daily_transactions,
        CASE
            WHEN planning_horizon_days >= 365 THEN 'Plan major infrastructure upgrades'
            WHEN planning_horizon_days >= 180 THEN 'Plan storage expansion and performance scaling'
            WHEN planning_horizon_days >= 90 THEN 'Monitor growth trends closely'
            ELSE 'Current capacity likely sufficient'
        END as recommendation
    FROM growth_metrics gm
    WHERE gm.metric_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

    -- Performance scaling recommendations
    SELECT
        'Performance Scaling Recommendations' as analysis_section,
        scaling_area,
        current_state,
        recommended_action,
        expected_benefit,
        implementation_priority,
        estimated_timeline
    FROM (
        SELECT 'Query Performance' as scaling_area,
               CONCAT('Avg response time: ',
                      ROUND(AVG(ru.queries_per_second), 2), ' QPS') as current_state,
               'Implement query optimization and index tuning' as recommended_action,
               'Reduce response time by 20-40%' as expected_benefit,
               'HIGH' as implementation_priority,
               '2-4 weeks' as estimated_timeline
        FROM resource_utilization ru
        WHERE ru.recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)

        UNION ALL

        SELECT 'Buffer Pool Optimization' as scaling_area,
               CONCAT('Avg buffer pool usage: ',
                      ROUND(AVG(ru.innodb_buffer_pool_usage_percent), 2), '%') as current_state,
               'Optimize buffer pool size and configuration' as recommended_action,
               'Improve cache hit rate and reduce disk I/O' as expected_benefit,
               'MEDIUM' as implementation_priority,
               '1-2 weeks' as estimated_timeline
        FROM resource_utilization ru
        WHERE ru.recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)

        UNION ALL

        SELECT 'Connection Management' as scaling_area,
               CONCAT('Peak connections: ',
                      MAX(ru.active_connections)) as current_state,
               'Implement connection pooling and optimize connection lifecycle' as recommended_action,
               'Reduce connection overhead and improve scalability' as expected_benefit,
               'MEDIUM' as implementation_priority,
               '1-3 weeks' as estimated_timeline
        FROM resource_utilization ru
        WHERE ru.recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ) scaling_recommendations
    ORDER BY
        CASE implementation_priority
            WHEN 'HIGH' THEN 1
            WHEN 'MEDIUM' THEN 2
            ELSE 3
        END;

END //

DELIMITER ;
```

## Scaling Strategy Framework 📋

### Scaling Decision Matrix

```sql
-- Scaling strategies and recommendations
CREATE TABLE scaling_strategies (
    strategy_id INT PRIMARY KEY AUTO_INCREMENT,
    strategy_name VARCHAR(100),
    strategy_type ENUM('VERTICAL', 'HORIZONTAL', 'FUNCTIONAL', 'DATA_PARTITIONING'),
    resource_focus VARCHAR(50),
    complexity_level ENUM('LOW', 'MEDIUM', 'HIGH'),
    cost_impact ENUM('LOW', 'MEDIUM', 'HIGH'),
    implementation_time VARCHAR(50),
    scalability_factor DECIMAL(3,1),
    description TEXT,
    prerequisites TEXT,
    risks TEXT
);

-- Insert scaling strategies
INSERT INTO scaling_strategies (
    strategy_name, strategy_type, resource_focus, complexity_level,
    cost_impact, implementation_time, scalability_factor, description,
    prerequisites, risks
) VALUES
('CPU Upgrade', 'VERTICAL', 'CPU', 'LOW', 'MEDIUM', '1-2 hours', 2.0,
 'Upgrade server CPU to handle increased processing load',
 'Scheduled maintenance window, compatible hardware',
 'Single point of failure, limited scaling potential'),

('Memory Expansion', 'VERTICAL', 'Memory', 'LOW', 'LOW', '1-2 hours', 1.5,
 'Add more RAM to improve buffer pool and caching performance',
 'Available memory slots, compatible RAM modules',
 'Limited by hardware maximum, diminishing returns'),

('SSD Storage Upgrade', 'VERTICAL', 'Storage', 'MEDIUM', 'MEDIUM', '2-4 hours', 3.0,
 'Replace traditional drives with SSDs for better I/O performance',
 'Data migration plan, backup strategy',
 'Data migration complexity, potential downtime'),

('Read Replicas', 'HORIZONTAL', 'Read Load', 'MEDIUM', 'MEDIUM', '1-2 weeks', 4.0,
 'Implement read replicas to distribute read workload',
 'Replication setup, application modifications',
 'Replication lag, data consistency challenges'),

('Database Sharding', 'HORIZONTAL', 'Data Volume', 'HIGH', 'HIGH', '2-6 months', 10.0,
 'Partition data across multiple database instances',
 'Comprehensive application redesign, data distribution strategy',
 'High complexity, cross-shard queries, data rebalancing'),

('Table Partitioning', 'DATA_PARTITIONING', 'Large Tables', 'MEDIUM', 'LOW', '2-4 weeks', 3.0,
 'Partition large tables to improve query performance and maintenance',
 'Identify partitioning strategy, test with non-production data',
 'Query complexity, partition maintenance overhead'),

('Connection Pooling', 'FUNCTIONAL', 'Connections', 'LOW', 'LOW', '1-2 weeks', 2.0,
 'Implement connection pooling to optimize connection usage',
 'Application changes, pooling software setup',
 'Configuration complexity, monitoring requirements'),

('Query Optimization', 'FUNCTIONAL', 'Performance', 'MEDIUM', 'LOW', '2-8 weeks', 5.0,
 'Optimize slow queries and improve index usage',
 'Query analysis tools, performance monitoring',
 'Requires ongoing maintenance, may need application changes');

-- Scaling recommendation procedure
DELIMITER //

CREATE PROCEDURE RecommendScalingStrategy(
    IN current_cpu_usage DECIMAL(5,2),
    IN current_memory_usage DECIMAL(5,2),
    IN current_connections INT,
    IN database_size_gb DECIMAL(10,2),
    IN growth_rate_percent DECIMAL(5,2)
)
BEGIN
    -- Create temporary table for recommendations
    DROP TEMPORARY TABLE IF EXISTS scaling_recommendations;
    CREATE TEMPORARY TABLE scaling_recommendations (
        priority_rank INT,
        strategy_name VARCHAR(100),
        strategy_type VARCHAR(20),
        relevance_score DECIMAL(3,1),
        urgency ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        rationale TEXT,
        estimated_benefit TEXT,
        implementation_complexity VARCHAR(10),
        estimated_timeline VARCHAR(50)
    );

    -- Analyze CPU scaling needs
    IF current_cpu_usage > 80 THEN
        INSERT INTO scaling_recommendations VALUES (
            1, 'CPU Upgrade', 'VERTICAL', 9.0, 'CRITICAL',
            CONCAT('CPU usage at ', current_cpu_usage, '% requires immediate attention'),
            'Reduce CPU bottlenecks, improve query response times',
            'LOW', '1-2 hours'
        );
    ELSEIF current_cpu_usage > 70 THEN
        INSERT INTO scaling_recommendations VALUES (
            3, 'Query Optimization', 'FUNCTIONAL', 8.0, 'HIGH',
            CONCAT('CPU usage at ', current_cpu_usage, '% indicates optimization opportunities'),
            'Reduce CPU load through better query performance',
            'MEDIUM', '2-8 weeks'
        );
    END IF;

    -- Analyze memory scaling needs
    IF current_memory_usage > 90 THEN
        INSERT INTO scaling_recommendations VALUES (
            1, 'Memory Expansion', 'VERTICAL', 9.5, 'CRITICAL',
            CONCAT('Memory usage at ', current_memory_usage, '% may cause performance issues'),
            'Improve buffer pool efficiency, reduce disk I/O',
            'LOW', '1-2 hours'
        );
    ELSEIF current_memory_usage > 80 THEN
        INSERT INTO scaling_recommendations VALUES (
            2, 'Memory Expansion', 'VERTICAL', 7.5, 'HIGH',
            CONCAT('Memory usage at ', current_memory_usage, '% suggests need for expansion'),
            'Better caching performance, improved query response',
            'LOW', '1-2 hours'
        );
    END IF;

    -- Analyze connection scaling needs
    IF current_connections > 120 THEN
        INSERT INTO scaling_recommendations VALUES (
            2, 'Connection Pooling', 'FUNCTIONAL', 8.5, 'HIGH',
            CONCAT('High connection count (', current_connections, ') needs optimization'),
            'Reduce connection overhead, improve scalability',
            'LOW', '1-2 weeks'
        );
    END IF;

    -- Analyze storage and growth scaling needs
    IF database_size_gb > 100 OR growth_rate_percent > 50 THEN
        INSERT INTO scaling_recommendations VALUES (
            2, 'SSD Storage Upgrade', 'VERTICAL', 8.0, 'HIGH',
            CONCAT('Large database size (', database_size_gb, 'GB) or high growth rate (',
                   growth_rate_percent, '%) suggests storage optimization'),
            'Dramatically improve I/O performance, reduce query latency',
            'MEDIUM', '2-4 hours'
        );

        IF database_size_gb > 500 THEN
            INSERT INTO scaling_recommendations VALUES (
                4, 'Table Partitioning', 'DATA_PARTITIONING', 7.0, 'MEDIUM',
                'Very large database suggests partitioning strategy needed',
                'Improve query performance on large tables, easier maintenance',
                'MEDIUM', '2-4 weeks'
            );
        END IF;

        IF database_size_gb > 1000 THEN
            INSERT INTO scaling_recommendations VALUES (
                5, 'Database Sharding', 'HORIZONTAL', 9.0, 'MEDIUM',
                'Extremely large database may require sharding for optimal performance',
                'Massive scalability improvement, distributed load',
                'HIGH', '2-6 months'
            );
        END IF;
    END IF;

    -- Always recommend read replicas for high-load systems
    IF current_cpu_usage > 60 OR current_connections > 80 THEN
        INSERT INTO scaling_recommendations VALUES (
            3, 'Read Replicas', 'HORIZONTAL', 7.5, 'MEDIUM',
            'High load suggests benefit from read load distribution',
            'Distribute read workload, improve application performance',
            'MEDIUM', '1-2 weeks'
        );
    END IF;

    -- Return prioritized recommendations
    SELECT
        priority_rank,
        strategy_name,
        strategy_type,
        relevance_score,
        urgency,
        rationale,
        estimated_benefit,
        implementation_complexity,
        estimated_timeline
    FROM scaling_recommendations
    ORDER BY
        CASE urgency
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            ELSE 4
        END,
        relevance_score DESC,
        priority_rank;

END //

DELIMITER ;

-- Test scaling recommendations
CALL RecommendScalingStrategy(75.5, 85.2, 95, 250.8, 25.3);
```

## Automated Capacity Monitoring 🤖

### Capacity Monitoring Events

```sql
-- Schedule capacity planning data collection
CREATE EVENT IF NOT EXISTS evt_collect_growth_metrics
ON SCHEDULE EVERY 1 DAY
STARTS '2024-08-12 01:00:00'
DO
    CALL CollectGrowthMetrics();

CREATE EVENT IF NOT EXISTS evt_capacity_analysis
ON SCHEDULE EVERY 1 WEEK
STARTS '2024-08-12 06:00:00'
DO
    CALL AnalyzeGrowthTrends(180); -- 6-month forecast

CREATE EVENT IF NOT EXISTS evt_resource_planning
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-08-12 02:00:00'
DO
    CALL GenerateCapacityPlan(365); -- 1-year planning horizon

-- Capacity monitoring dashboard
DELIMITER //

CREATE PROCEDURE CapacityPlanningDashboard()
BEGIN
    -- Current capacity status
    SELECT
        'Current Capacity Status' as section,
        metric_name,
        current_value,
        threshold_warning,
        threshold_critical,
        ROUND((current_value / threshold_critical) * 100, 1) as capacity_utilization_percent,
        CASE
            WHEN current_value > threshold_critical THEN 'CRITICAL'
            WHEN current_value > threshold_warning THEN 'WARNING'
            ELSE 'OK'
        END as status,
        recommended_action
    FROM (
        SELECT 'Database Size (GB)' as metric_name,
               ROUND(MAX(database_size_mb) / 1024, 2) as current_value,
               80 as threshold_warning,
               100 as threshold_critical,
               'Consider storage expansion or archiving' as recommended_action
        FROM growth_metrics
        WHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)

        UNION ALL

        SELECT 'Peak Connections' as metric_name,
               MAX(peak_connections) as current_value,
               100 as threshold_warning,
               150 as threshold_critical,
               'Implement connection pooling or increase limits' as recommended_action
        FROM growth_metrics
        WHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)

        UNION ALL

        SELECT 'Avg Query Time (ms)' as metric_name,
               ROUND(AVG(avg_query_time_ms), 2) as current_value,
               100 as threshold_warning,
               200 as threshold_critical,
               'Optimize queries and review indexing strategy' as recommended_action
        FROM growth_metrics
        WHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    ) capacity_metrics;

    -- Growth trend summary
    SELECT
        'Growth Trend Summary (30 Days)' as section,
        'Database Size' as metric,
        ROUND(MIN(database_size_mb) / 1024, 2) as size_30_days_ago_gb,
        ROUND(MAX(database_size_mb) / 1024, 2) as current_size_gb,
        ROUND((MAX(database_size_mb) - MIN(database_size_mb)) / 1024, 2) as growth_gb,
        ROUND(((MAX(database_size_mb) - MIN(database_size_mb)) / MIN(database_size_mb)) * 100, 2) as growth_percent,
        ROUND(((MAX(database_size_mb) - MIN(database_size_mb)) / 30), 2) as daily_growth_mb
    FROM growth_metrics
    WHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

    -- Largest tables requiring attention
    SELECT
        'Largest Tables' as section,
        table_name,
        ROUND(table_size_mb, 2) as size_mb,
        ROUND(table_size_mb / 1024, 2) as size_gb,
        ROUND(row_count / 1000, 0) as rows_k,
        ROUND(fragmentation_percent, 1) as fragmentation_percent,
        CASE
            WHEN fragmentation_percent > 25 THEN 'HIGH_FRAGMENTATION'
            WHEN table_size_mb > 1024 THEN 'LARGE_SIZE'
            WHEN row_count > 10000000 THEN 'HIGH_ROW_COUNT'
            ELSE 'MONITOR'
        END as attention_reason
    FROM table_growth_metrics
    WHERE metric_date = (SELECT MAX(metric_date) FROM table_growth_metrics)
      AND table_size_mb > 100
    ORDER BY table_size_mb DESC
    LIMIT 10;

END //

DELIMITER ;

-- Generate capacity planning dashboard
CALL CapacityPlanningDashboard();
```

## Practice Exercises 💪

### Exercise 1: Growth Analysis Implementation

```sql
-- 1. Implement comprehensive growth tracking for your database
-- 2. Create forecasting models based on historical data
-- 3. Set up automated growth data collection
-- 4. Build capacity threshold monitoring
-- 5. Create growth trend visualizations and reports
```

### Exercise 2: Scaling Strategy Development

```sql
-- 1. Analyze current resource utilization patterns
-- 2. Design scaling strategies for different growth scenarios
-- 3. Implement capacity planning automation
-- 4. Create scaling decision matrices
-- 5. Develop scaling implementation timelines and procedures
```

## Best Practices 📋

### Capacity Planning Checklist

```sql
-- Capacity planning validation
DELIMITER //

CREATE PROCEDURE ValidateCapacityPlanning()
BEGIN
    CREATE TEMPORARY TABLE capacity_validation (
        check_category VARCHAR(50),
        check_item VARCHAR(100),
        status ENUM('PASS', 'WARNING', 'CRITICAL'),
        details TEXT
    );

    -- Check growth data collection
    INSERT INTO capacity_validation
    SELECT
        'Data Collection',
        'Growth Metrics Collection',
        CASE
            WHEN MAX(metric_date) >= DATE_SUB(CURDATE(), INTERVAL 2 DAY) THEN 'PASS'
            WHEN MAX(metric_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 'WARNING'
            ELSE 'CRITICAL'
        END,
        CONCAT('Last growth data collected: ',
               COALESCE(DATE_FORMAT(MAX(metric_date), '%Y-%m-%d'), 'Never'))
    FROM growth_metrics;

    -- Check capacity thresholds
    INSERT INTO capacity_validation
    SELECT
        'Thresholds',
        'Capacity Thresholds Defined',
        CASE WHEN COUNT(*) >= 5 THEN 'PASS' ELSE 'WARNING' END,
        CONCAT(COUNT(*), ' capacity thresholds configured')
    FROM capacity_thresholds;

    -- Check recent analysis
    INSERT INTO capacity_validation VALUES (
        'Analysis',
        'Growth Analysis Currency',
        'WARNING',
        'Run growth analysis regularly to maintain current forecasts'
    );

    -- Check scaling strategies
    INSERT INTO capacity_validation
    SELECT
        'Planning',
        'Scaling Strategies Defined',
        CASE WHEN COUNT(*) >= 5 THEN 'PASS' ELSE 'WARNING' END,
        CONCAT(COUNT(*), ' scaling strategies documented')
    FROM scaling_strategies;

    SELECT * FROM capacity_validation ORDER BY
        CASE status WHEN 'CRITICAL' THEN 1 WHEN 'WARNING' THEN 2 ELSE 3 END,
        check_category;

END //

DELIMITER ;

-- Run capacity planning validation
CALL ValidateCapacityPlanning();
```

## Quick Reference 📚

### Essential Capacity Planning Queries

```sql
-- Check database size growth
SELECT
    metric_date,
    ROUND(database_size_mb / 1024, 2) as size_gb,
    row_count_total,
    daily_transactions
FROM growth_metrics
ORDER BY metric_date DESC
LIMIT 30;

-- Analyze table growth
SELECT
    table_name,
    ROUND(table_size_mb, 2) as size_mb,
    row_count,
    fragmentation_percent
FROM table_growth_metrics
WHERE metric_date = CURDATE()
ORDER BY table_size_mb DESC;
```

### Key Capacity Planning Best Practices

-   ✅ **Regular Monitoring**: Collect growth metrics consistently
-   ✅ **Trend Analysis**: Analyze historical data for accurate forecasting
-   ✅ **Threshold Management**: Set and monitor capacity thresholds
-   ✅ **Scaling Strategies**: Prepare multiple scaling options
-   ✅ **Proactive Planning**: Plan capacity changes before reaching limits
-   ✅ **Cost Optimization**: Balance performance needs with cost considerations
-   ✅ **Documentation**: Document scaling decisions and implementations
