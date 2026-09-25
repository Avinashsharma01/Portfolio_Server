# Database Administration and Maintenance

## Introduction to Database Administration 🛠️

Database administration encompasses the ongoing management, monitoring, and maintenance of database systems to ensure optimal performance, security, availability, and data integrity. This includes backup and recovery, monitoring, maintenance routines, and capacity planning.

## Backup and Recovery Strategies 💾

### Comprehensive Backup Strategy

```sql
-- MySQL backup configuration and procedures
-- Add to my.cnf for point-in-time recovery:
/*
[mysqld]
log-bin = mysql-bin
binlog-format = ROW
expire_logs_days = 7
sync_binlog = 1
innodb_flush_log_at_trx_commit = 1
*/

-- Create backup management table
CREATE TABLE backup_schedule (
    backup_id INT PRIMARY KEY AUTO_INCREMENT,
    backup_name VARCHAR(100),
    backup_type ENUM('FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'TRANSACTION_LOG'),
    database_name VARCHAR(64),
    backup_frequency VARCHAR(50),
    backup_time TIME,
    retention_days INT,
    backup_location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    last_run DATETIME,
    next_run DATETIME,
    INDEX idx_backup_schedule_time (backup_time, is_active),
    INDEX idx_backup_schedule_type (backup_type, is_active)
);

-- Insert backup schedule configuration
INSERT INTO backup_schedule (backup_name, backup_type, database_name, backup_frequency, backup_time, retention_days, backup_location) VALUES
('Daily Full Backup', 'FULL', 'ecommerce', 'DAILY', '02:00:00', 30, '/backup/daily/'),
('Hourly Transaction Log', 'TRANSACTION_LOG', 'ecommerce', 'HOURLY', '00:00:00', 7, '/backup/logs/'),
('Weekly Full System', 'FULL', '*', 'WEEKLY', '01:00:00', 90, '/backup/weekly/'),
('Monthly Archive', 'FULL', 'ecommerce', 'MONTHLY', '00:30:00', 365, '/backup/archive/');

-- Backup execution tracking
CREATE TABLE backup_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    backup_id INT,
    backup_start_time DATETIME,
    backup_end_time DATETIME,
    backup_status ENUM('SUCCESS', 'FAILED', 'IN_PROGRESS'),
    backup_size_mb DECIMAL(12,2),
    backup_file_path VARCHAR(500),
    error_message TEXT,
    compression_ratio DECIMAL(5,2),
    backup_method VARCHAR(50),
    FOREIGN KEY (backup_id) REFERENCES backup_schedule(backup_id),
    INDEX idx_backup_history_status (backup_status, backup_start_time),
    INDEX idx_backup_history_backup_id (backup_id, backup_start_time)
);
```

### Automated Backup Procedures

```sql
-- Comprehensive backup procedure
DELIMITER //

CREATE PROCEDURE ExecuteBackup(
    IN backup_type_param VARCHAR(20),
    IN database_name_param VARCHAR(64),
    IN backup_location_param VARCHAR(255)
)
BEGIN
    DECLARE backup_id_var INT;
    DECLARE backup_file_path VARCHAR(500);
    DECLARE backup_command TEXT;
    DECLARE backup_start DATETIME;
    DECLARE backup_end DATETIME;
    DECLARE file_size_mb DECIMAL(12,2);

    -- Set backup start time
    SET backup_start = NOW();

    -- Get backup configuration
    SELECT backup_id INTO backup_id_var
    FROM backup_schedule
    WHERE backup_type = backup_type_param
      AND database_name = database_name_param
      AND is_active = TRUE
    LIMIT 1;

    -- Generate backup file path
    SET backup_file_path = CONCAT(
        backup_location_param,
        database_name_param, '_',
        backup_type_param, '_',
        DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s'),
        '.sql'
    );

    -- Log backup start
    INSERT INTO backup_history (
        backup_id, backup_start_time, backup_status, backup_file_path, backup_method
    ) VALUES (
        backup_id_var, backup_start, 'IN_PROGRESS', backup_file_path, 'mysqldump'
    );

    SET @history_id = LAST_INSERT_ID();

    -- Generate backup command based on type
    CASE backup_type_param
        WHEN 'FULL' THEN
            SET backup_command = CONCAT(
                'mysqldump --single-transaction --routines --triggers --events ',
                '--master-data=2 --flush-logs --all-databases > ',
                backup_file_path
            );

        WHEN 'INCREMENTAL' THEN
            SET backup_command = CONCAT(
                'mysqldump --single-transaction --master-data=2 ',
                '--where="updated_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)" ',
                database_name_param, ' > ', backup_file_path
            );

        WHEN 'TRANSACTION_LOG' THEN
            SET backup_command = CONCAT(
                'mysqlbinlog --start-datetime="',
                DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 HOUR), '%Y-%m-%d %H:%i:%s'),
                '" /var/log/mysql/mysql-bin.* > ', backup_file_path
            );

        ELSE
            UPDATE backup_history
            SET backup_status = 'FAILED',
                backup_end_time = NOW(),
                error_message = 'Invalid backup type'
            WHERE history_id = @history_id;
    END CASE;

    -- In a real implementation, you would execute the backup command
    -- For this example, we'll simulate success
    SET backup_end = NOW();
    SET file_size_mb = ROUND(RAND() * 1000 + 100, 2); -- Simulated file size

    -- Update backup history with completion
    UPDATE backup_history
    SET backup_end_time = backup_end,
        backup_status = 'SUCCESS',
        backup_size_mb = file_size_mb,
        compression_ratio = ROUND(RAND() * 30 + 50, 2) -- Simulated compression
    WHERE history_id = @history_id;

    -- Update next run time
    UPDATE backup_schedule
    SET last_run = backup_start,
        next_run = CASE backup_frequency
            WHEN 'HOURLY' THEN DATE_ADD(backup_start, INTERVAL 1 HOUR)
            WHEN 'DAILY' THEN DATE_ADD(backup_start, INTERVAL 1 DAY)
            WHEN 'WEEKLY' THEN DATE_ADD(backup_start, INTERVAL 1 WEEK)
            WHEN 'MONTHLY' THEN DATE_ADD(backup_start, INTERVAL 1 MONTH)
        END
    WHERE backup_id = backup_id_var;

    -- Clean up old backups based on retention policy
    CALL CleanupOldBackups(backup_id_var);

    -- Return backup result
    SELECT
        'Backup completed successfully' as status,
        backup_file_path as file_path,
        file_size_mb as size_mb,
        TIMESTAMPDIFF(SECOND, backup_start, backup_end) as duration_seconds;

END //

DELIMITER ;

-- Backup cleanup procedure
DELIMITER //

CREATE PROCEDURE CleanupOldBackups(IN backup_id_param INT)
BEGIN
    DECLARE retention_days_var INT;

    -- Get retention policy
    SELECT retention_days INTO retention_days_var
    FROM backup_schedule
    WHERE backup_id = backup_id_param;

    -- Mark old backups for cleanup
    UPDATE backup_history
    SET backup_status = 'EXPIRED'
    WHERE backup_id = backup_id_param
      AND backup_start_time < DATE_SUB(NOW(), INTERVAL retention_days_var DAY)
      AND backup_status = 'SUCCESS';

    -- In production, you would also delete the actual backup files
    -- DELETE old backup files from filesystem based on backup_file_path

    INSERT INTO system_log (log_type, log_message, log_date)
    VALUES ('BACKUP_CLEANUP',
            CONCAT('Cleaned up backups older than ', retention_days_var, ' days for backup_id ', backup_id_param),
            NOW());

END //

DELIMITER ;

-- Test backup procedures
CALL ExecuteBackup('FULL', 'ecommerce', '/backup/test/');
```

### Point-in-Time Recovery

```sql
-- Point-in-time recovery procedures
DELIMITER //

CREATE PROCEDURE PreparePointInTimeRecovery(
    IN target_datetime DATETIME,
    IN recovery_database VARCHAR(64)
)
BEGIN
    DECLARE last_full_backup VARCHAR(500);
    DECLARE last_backup_time DATETIME;

    -- Find the most recent full backup before the target time
    SELECT
        backup_file_path,
        backup_start_time
    INTO last_full_backup, last_backup_time
    FROM backup_history bh
    JOIN backup_schedule bs ON bh.backup_id = bs.backup_id
    WHERE bs.backup_type = 'FULL'
      AND bs.database_name = recovery_database
      AND bh.backup_start_time <= target_datetime
      AND bh.backup_status = 'SUCCESS'
    ORDER BY bh.backup_start_time DESC
    LIMIT 1;

    IF last_full_backup IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No suitable full backup found for point-in-time recovery';
    END IF;

    -- Create recovery plan
    DROP TEMPORARY TABLE IF EXISTS recovery_plan;
    CREATE TEMPORARY TABLE recovery_plan (
        step_number INT,
        step_type VARCHAR(50),
        step_description TEXT,
        file_path VARCHAR(500),
        command_template TEXT
    );

    -- Step 1: Restore full backup
    INSERT INTO recovery_plan VALUES (
        1,
        'FULL_RESTORE',
        CONCAT('Restore full backup from ', last_backup_time),
        last_full_backup,
        CONCAT('mysql ', recovery_database, ' < ', last_full_backup)
    );

    -- Step 2: Apply binary logs
    INSERT INTO recovery_plan VALUES (
        2,
        'BINLOG_REPLAY',
        CONCAT('Apply binary logs from ', last_backup_time, ' to ', target_datetime),
        '/var/log/mysql/mysql-bin.*',
        CONCAT('mysqlbinlog --start-datetime="', last_backup_time,
               '" --stop-datetime="', target_datetime,
               '" /var/log/mysql/mysql-bin.* | mysql ', recovery_database)
    );

    -- Return recovery plan
    SELECT
        step_number,
        step_type,
        step_description,
        file_path,
        command_template
    FROM recovery_plan
    ORDER BY step_number;

    -- Log recovery preparation
    INSERT INTO system_log (log_type, log_message, log_date)
    VALUES ('RECOVERY_PREP',
            CONCAT('Point-in-time recovery plan prepared for ', recovery_database, ' to ', target_datetime),
            NOW());

END //

DELIMITER ;

-- Test recovery planning
CALL PreparePointInTimeRecovery('2024-08-11 14:30:00', 'ecommerce');
```

## Database Monitoring and Alerting 📊

### Comprehensive Monitoring System

```sql
-- Database health monitoring tables
CREATE TABLE monitoring_metrics (
    metric_id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100),
    metric_category VARCHAR(50),
    metric_description TEXT,
    threshold_warning DECIMAL(15,2),
    threshold_critical DECIMAL(15,2),
    collection_frequency_minutes INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW()
);

-- Insert monitoring metrics configuration
INSERT INTO monitoring_metrics (metric_name, metric_category, metric_description, threshold_warning, threshold_critical, collection_frequency_minutes) VALUES
('Connections_Used', 'Connection', 'Number of active connections', 100, 150, 5),
('CPU_Usage_Percent', 'Performance', 'CPU usage percentage', 70, 90, 5),
('Memory_Usage_Percent', 'Performance', 'Memory usage percentage', 80, 95, 5),
('Disk_Space_Usage_Percent', 'Storage', 'Disk space usage percentage', 85, 95, 15),
('Slow_Queries_Per_Hour', 'Performance', 'Number of slow queries per hour', 50, 100, 60),
('Replication_Lag_Seconds', 'Replication', 'Replication lag in seconds', 60, 300, 5),
('InnoDB_Buffer_Pool_Hit_Rate', 'Performance', 'Buffer pool hit rate percentage', 95, 90, 15),
('Table_Lock_Wait_Time', 'Performance', 'Average table lock wait time', 5, 15, 10);

CREATE TABLE monitoring_data (
    data_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    metric_id INT,
    metric_value DECIMAL(15,2),
    recorded_at DATETIME DEFAULT NOW(),
    server_instance VARCHAR(100),
    FOREIGN KEY (metric_id) REFERENCES monitoring_metrics(metric_id),
    INDEX idx_monitoring_data_metric_time (metric_id, recorded_at),
    INDEX idx_monitoring_data_time (recorded_at)
);

-- Monitoring data collection procedure
DELIMITER //

CREATE PROCEDURE CollectMonitoringMetrics()
BEGIN
    DECLARE current_time DATETIME DEFAULT NOW();

    -- Collect connection metrics
    INSERT INTO monitoring_data (metric_id, metric_value, recorded_at, server_instance)
    SELECT
        mm.metric_id,
        CAST(gs.VARIABLE_VALUE AS DECIMAL(15,2)),
        current_time,
        @@hostname
    FROM monitoring_metrics mm
    JOIN performance_schema.global_status gs ON mm.metric_name = gs.VARIABLE_NAME
    WHERE mm.is_active = TRUE
      AND gs.VARIABLE_NAME IN ('Threads_connected', 'Slow_queries');

    -- Calculate derived metrics
    -- Buffer pool hit rate
    INSERT INTO monitoring_data (metric_id, metric_value, recorded_at, server_instance)
    SELECT
        mm.metric_id,
        ROUND(100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100), 2),
        current_time,
        @@hostname
    FROM monitoring_metrics mm
    CROSS JOIN (
        SELECT CAST(VARIABLE_VALUE AS DECIMAL(15,2)) AS VARIABLE_VALUE
        FROM performance_schema.global_status
        WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads'
    ) reads
    CROSS JOIN (
        SELECT CAST(VARIABLE_VALUE AS DECIMAL(15,2)) AS VARIABLE_VALUE
        FROM performance_schema.global_status
        WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests'
    ) requests
    WHERE mm.metric_name = 'InnoDB_Buffer_Pool_Hit_Rate'
      AND mm.is_active = TRUE;

    -- Disk space usage (simulated - in production use system commands)
    INSERT INTO monitoring_data (metric_id, metric_value, recorded_at, server_instance)
    SELECT
        mm.metric_id,
        ROUND(60 + RAND() * 20, 2), -- Simulated disk usage 60-80%
        current_time,
        @@hostname
    FROM monitoring_metrics mm
    WHERE mm.metric_name = 'Disk_Space_Usage_Percent'
      AND mm.is_active = TRUE;

    -- Clean up old monitoring data (keep 30 days)
    DELETE FROM monitoring_data
    WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

END //

DELIMITER ;

-- Alerting system
CREATE TABLE monitoring_alerts (
    alert_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    metric_id INT,
    alert_level ENUM('WARNING', 'CRITICAL'),
    alert_message TEXT,
    metric_value DECIMAL(15,2),
    threshold_value DECIMAL(15,2),
    triggered_at DATETIME DEFAULT NOW(),
    acknowledged_at DATETIME NULL,
    resolved_at DATETIME NULL,
    acknowledged_by VARCHAR(100),
    FOREIGN KEY (metric_id) REFERENCES monitoring_metrics(metric_id),
    INDEX idx_monitoring_alerts_level (alert_level, resolved_at),
    INDEX idx_monitoring_alerts_time (triggered_at)
);

-- Alert checking procedure
DELIMITER //

CREATE PROCEDURE CheckMonitoringAlerts()
BEGIN
    DECLARE current_time DATETIME DEFAULT NOW();

    -- Check for warning thresholds
    INSERT INTO monitoring_alerts (metric_id, alert_level, alert_message, metric_value, threshold_value)
    SELECT
        md.metric_id,
        'WARNING',
        CONCAT(mm.metric_description, ' has exceeded warning threshold: ',
               md.metric_value, ' > ', mm.threshold_warning),
        md.metric_value,
        mm.threshold_warning
    FROM monitoring_data md
    JOIN monitoring_metrics mm ON md.metric_id = mm.metric_id
    WHERE md.recorded_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
      AND md.metric_value > mm.threshold_warning
      AND mm.threshold_warning IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM monitoring_alerts ma
          WHERE ma.metric_id = md.metric_id
            AND ma.resolved_at IS NULL
            AND ma.triggered_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      );

    -- Check for critical thresholds
    INSERT INTO monitoring_alerts (metric_id, alert_level, alert_message, metric_value, threshold_value)
    SELECT
        md.metric_id,
        'CRITICAL',
        CONCAT(mm.metric_description, ' has exceeded critical threshold: ',
               md.metric_value, ' > ', mm.threshold_critical),
        md.metric_value,
        mm.threshold_critical
    FROM monitoring_data md
    JOIN monitoring_metrics mm ON md.metric_id = mm.metric_id
    WHERE md.recorded_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
      AND md.metric_value > mm.threshold_critical
      AND mm.threshold_critical IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM monitoring_alerts ma
          WHERE ma.metric_id = md.metric_id
            AND ma.resolved_at IS NULL
            AND ma.triggered_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
      );

    -- Auto-resolve alerts when metrics return to normal
    UPDATE monitoring_alerts ma
    JOIN monitoring_metrics mm ON ma.metric_id = mm.metric_id
    SET ma.resolved_at = NOW()
    WHERE ma.resolved_at IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM monitoring_data md
          WHERE md.metric_id = ma.metric_id
            AND md.recorded_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
            AND (
                (ma.alert_level = 'WARNING' AND md.metric_value > mm.threshold_warning) OR
                (ma.alert_level = 'CRITICAL' AND md.metric_value > mm.threshold_critical)
            )
      );

    -- Return current active alerts
    SELECT
        ma.alert_id,
        mm.metric_name,
        ma.alert_level,
        ma.alert_message,
        ma.metric_value,
        ma.threshold_value,
        ma.triggered_at,
        TIMESTAMPDIFF(MINUTE, ma.triggered_at, NOW()) as duration_minutes,
        ma.acknowledged_by
    FROM monitoring_alerts ma
    JOIN monitoring_metrics mm ON ma.metric_id = mm.metric_id
    WHERE ma.resolved_at IS NULL
    ORDER BY
        CASE ma.alert_level
            WHEN 'CRITICAL' THEN 1
            WHEN 'WARNING' THEN 2
        END,
        ma.triggered_at DESC;

END //

DELIMITER ;

-- Schedule monitoring collection
CREATE EVENT IF NOT EXISTS evt_collect_monitoring_data
ON SCHEDULE EVERY 5 MINUTE
STARTS NOW()
DO
    CALL CollectMonitoringMetrics();

CREATE EVENT IF NOT EXISTS evt_check_monitoring_alerts
ON SCHEDULE EVERY 5 MINUTE
STARTS NOW()
DO
    CALL CheckMonitoringAlerts();

-- Test monitoring system
CALL CollectMonitoringMetrics();
CALL CheckMonitoringAlerts();
```

### Performance Trend Analysis

```sql
-- Performance trending and analysis
CREATE VIEW monitoring_trends AS
SELECT
    mm.metric_name,
    mm.metric_category,
    DATE(md.recorded_at) as trend_date,
    MIN(md.metric_value) as min_value,
    MAX(md.metric_value) as max_value,
    ROUND(AVG(md.metric_value), 2) as avg_value,
    ROUND(STDDEV(md.metric_value), 2) as std_deviation,
    COUNT(*) as sample_count,
    -- Trend direction (compared to previous day)
    LAG(ROUND(AVG(md.metric_value), 2)) OVER (
        PARTITION BY mm.metric_name
        ORDER BY DATE(md.recorded_at)
    ) as prev_day_avg,
    ROUND(
        AVG(md.metric_value) - LAG(ROUND(AVG(md.metric_value), 2)) OVER (
            PARTITION BY mm.metric_name
            ORDER BY DATE(md.recorded_at)
        ), 2
    ) as trend_change
FROM monitoring_data md
JOIN monitoring_metrics mm ON md.metric_id = mm.metric_id
WHERE md.recorded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY mm.metric_name, mm.metric_category, DATE(md.recorded_at)
ORDER BY mm.metric_name, trend_date DESC;

-- Performance dashboard procedure
DELIMITER //

CREATE PROCEDURE GeneratePerformanceDashboard()
BEGIN
    -- Current system status
    SELECT
        'Current System Status' as section,
        mm.metric_name,
        mm.metric_category,
        md.metric_value,
        mm.threshold_warning,
        mm.threshold_critical,
        CASE
            WHEN md.metric_value > mm.threshold_critical THEN 'CRITICAL'
            WHEN md.metric_value > mm.threshold_warning THEN 'WARNING'
            ELSE 'NORMAL'
        END as status,
        md.recorded_at
    FROM monitoring_data md
    JOIN monitoring_metrics mm ON md.metric_id = mm.metric_id
    WHERE md.recorded_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ORDER BY md.recorded_at DESC, mm.metric_category;

    -- Performance trends (last 7 days)
    SELECT
        'Performance Trends (7 days)' as section,
        metric_name,
        metric_category,
        ROUND(AVG(avg_value), 2) as avg_7_day,
        ROUND(MIN(min_value), 2) as min_7_day,
        ROUND(MAX(max_value), 2) as max_7_day,
        ROUND(AVG(trend_change), 2) as avg_daily_change,
        CASE
            WHEN AVG(trend_change) > 5 THEN 'INCREASING'
            WHEN AVG(trend_change) < -5 THEN 'DECREASING'
            ELSE 'STABLE'
        END as trend_direction
    FROM monitoring_trends
    WHERE trend_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY metric_name, metric_category
    ORDER BY metric_category, metric_name;

    -- Alert summary
    SELECT
        'Alert Summary' as section,
        alert_level,
        COUNT(*) as total_alerts,
        SUM(CASE WHEN resolved_at IS NULL THEN 1 ELSE 0 END) as active_alerts,
        SUM(CASE WHEN acknowledged_at IS NOT NULL THEN 1 ELSE 0 END) as acknowledged_alerts,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, triggered_at, COALESCE(resolved_at, NOW()))), 2) as avg_duration_minutes
    FROM monitoring_alerts
    WHERE triggered_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    GROUP BY alert_level
    ORDER BY alert_level;

END //

DELIMITER ;

-- Generate dashboard
CALL GeneratePerformanceDashboard();
```

## Database Maintenance and Optimization 🔧

### Automated Maintenance Procedures

```sql
-- Database maintenance schedule
CREATE TABLE maintenance_schedule (
    maintenance_id INT PRIMARY KEY AUTO_INCREMENT,
    maintenance_name VARCHAR(100),
    maintenance_type ENUM('ANALYZE', 'OPTIMIZE', 'REPAIR', 'CLEANUP', 'INDEX_REBUILD'),
    target_schema VARCHAR(64),
    target_table VARCHAR(64),
    maintenance_frequency VARCHAR(50),
    maintenance_time TIME,
    estimated_duration_minutes INT,
    is_active BOOLEAN DEFAULT TRUE,
    last_run DATETIME,
    next_run DATETIME,
    created_at DATETIME DEFAULT NOW()
);

-- Insert maintenance schedule
INSERT INTO maintenance_schedule (maintenance_name, maintenance_type, target_schema, target_table, maintenance_frequency, maintenance_time, estimated_duration_minutes) VALUES
('Daily Table Analysis', 'ANALYZE', 'ecommerce', '*', 'DAILY', '03:00:00', 30),
('Weekly Table Optimization', 'OPTIMIZE', 'ecommerce', '*', 'WEEKLY', '02:00:00', 120),
('Monthly Index Rebuild', 'INDEX_REBUILD', 'ecommerce', '*', 'MONTHLY', '01:00:00', 180),
('Daily Log Cleanup', 'CLEANUP', 'ecommerce', 'audit_*', 'DAILY', '04:00:00', 15),
('Weekly Statistics Update', 'ANALYZE', 'information_schema', '*', 'WEEKLY', '03:30:00', 45);

-- Maintenance execution tracking
CREATE TABLE maintenance_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    maintenance_id INT,
    start_time DATETIME,
    end_time DATETIME,
    maintenance_status ENUM('SUCCESS', 'FAILED', 'IN_PROGRESS', 'SKIPPED'),
    tables_processed INT,
    error_message TEXT,
    performance_impact TEXT,
    size_before_mb DECIMAL(12,2),
    size_after_mb DECIMAL(12,2),
    FOREIGN KEY (maintenance_id) REFERENCES maintenance_schedule(maintenance_id),
    INDEX idx_maintenance_history_status (maintenance_status, start_time),
    INDEX idx_maintenance_history_maintenance (maintenance_id, start_time)
);

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
    DECLARE size_before_var DECIMAL(12,2) DEFAULT 0;
    DECLARE size_after_var DECIMAL(12,2) DEFAULT 0;

    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name_var VARCHAR(64);
    DECLARE table_cursor CURSOR FOR
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = target_schema_var
          AND table_type = 'BASE TABLE'
          AND (target_table_var = '*' OR table_name = target_table_var);

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
        maintenance_name
    INTO
        maintenance_type_var,
        target_schema_var,
        target_table_var,
        maintenance_name_var
    FROM maintenance_schedule
    WHERE maintenance_id = maintenance_id_param
      AND is_active = TRUE;

    IF maintenance_type_var IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maintenance job not found or inactive';
    END IF;

    SET start_time_var = NOW();

    -- Calculate size before maintenance
    SELECT
        ROUND(SUM((data_length + index_length) / 1024 / 1024), 2)
    INTO size_before_var
    FROM information_schema.tables
    WHERE table_schema = target_schema_var;

    -- Log maintenance start
    INSERT INTO maintenance_history (
        maintenance_id, start_time, maintenance_status, size_before_mb
    ) VALUES (
        maintenance_id_param, start_time_var, 'IN_PROGRESS', size_before_var
    );

    SET @current_history_id = LAST_INSERT_ID();

    -- Execute maintenance based on type
    OPEN table_cursor;

    maintenance_loop: LOOP
        FETCH table_cursor INTO table_name_var;

        IF done THEN
            LEAVE maintenance_loop;
        END IF;

        CASE maintenance_type_var
            WHEN 'ANALYZE' THEN
                SET @sql = CONCAT('ANALYZE TABLE ', target_schema_var, '.', table_name_var);
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;

            WHEN 'OPTIMIZE' THEN
                SET @sql = CONCAT('OPTIMIZE TABLE ', target_schema_var, '.', table_name_var);
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;

            WHEN 'REPAIR' THEN
                SET @sql = CONCAT('REPAIR TABLE ', target_schema_var, '.', table_name_var);
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;

            WHEN 'CLEANUP' THEN
                -- Custom cleanup logic based on table pattern
                IF table_name_var LIKE 'audit_%' THEN
                    SET @sql = CONCAT(
                        'DELETE FROM ', target_schema_var, '.', table_name_var,
                        ' WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)'
                    );
                    PREPARE stmt FROM @sql;
                    EXECUTE stmt;
                    DEALLOCATE PREPARE stmt;
                END IF;

            WHEN 'INDEX_REBUILD' THEN
                -- Rebuild indexes by dropping and recreating
                SET @sql = CONCAT('ALTER TABLE ', target_schema_var, '.', table_name_var, ' ENGINE=InnoDB');
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;

        END CASE;

        SET tables_processed_var = tables_processed_var + 1;

    END LOOP;

    CLOSE table_cursor;

    SET end_time_var = NOW();

    -- Calculate size after maintenance
    SELECT
        ROUND(SUM((data_length + index_length) / 1024 / 1024), 2)
    INTO size_after_var
    FROM information_schema.tables
    WHERE table_schema = target_schema_var;

    -- Update maintenance history
    UPDATE maintenance_history
    SET end_time = end_time_var,
        maintenance_status = 'SUCCESS',
        tables_processed = tables_processed_var,
        size_after_mb = size_after_var,
        performance_impact = CONCAT(
            'Space saved: ',
            ROUND(size_before_var - size_after_var, 2),
            ' MB, Duration: ',
            TIMESTAMPDIFF(MINUTE, start_time_var, end_time_var),
            ' minutes'
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
        ROUND(size_before_var - size_after_var, 2) as space_saved_mb,
        TIMESTAMPDIFF(MINUTE, start_time_var, end_time_var) as duration_minutes,
        'SUCCESS' as status;

END //

DELIMITER ;

-- Test maintenance execution
CALL ExecuteMaintenance(1);
```

### Database Health Check

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
        recommendation TEXT
    );

    -- Check 1: Database connectivity and basic info
    INSERT INTO health_check_results VALUES (
        'System Info',
        'MySQL Version',
        'INFO',
        VERSION(),
        'Keep MySQL updated to latest stable version'
    );

    INSERT INTO health_check_results VALUES (
        'System Info',
        'Uptime',
        'INFO',
        CONCAT(FLOOR(VARIABLE_VALUE/86400), ' days, ',
               FLOOR((VARIABLE_VALUE%86400)/3600), ' hours'),
        'Monitor for unexpected restarts'
    )
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME = 'Uptime';

    -- Check 2: Connection usage
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
            WHEN (connected.VARIABLE_VALUE / max_conn.VARIABLE_VALUE * 100) > 60
            THEN 'Consider increasing max_connections or optimizing connection usage'
            ELSE 'Connection usage is healthy'
        END
    FROM
        (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Threads_connected') connected,
        (SELECT VARIABLE_VALUE FROM performance_schema.global_variables WHERE VARIABLE_NAME = 'max_connections') max_conn;

    -- Check 3: InnoDB Buffer Pool efficiency
    INSERT INTO health_check_results
    SELECT
        'Performance',
        'InnoDB Buffer Pool Hit Rate',
        CASE
            WHEN (100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100)) < 95 THEN 'WARNING'
            WHEN (100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100)) < 90 THEN 'CRITICAL'
            ELSE 'PASS'
        END,
        CONCAT(ROUND(100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100), 2), '%'),
        CASE
            WHEN (100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100)) < 95
            THEN 'Consider increasing innodb_buffer_pool_size'
            ELSE 'Buffer pool efficiency is good'
        END
    FROM
        (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') reads,
        (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests') requests;

    -- Check 4: Slow queries
    INSERT INTO health_check_results
    SELECT
        'Performance',
        'Slow Queries',
        CASE
            WHEN VARIABLE_VALUE > 100 THEN 'WARNING'
            WHEN VARIABLE_VALUE > 500 THEN 'CRITICAL'
            ELSE 'PASS'
        END,
        VARIABLE_VALUE,
        CASE
            WHEN VARIABLE_VALUE > 100
            THEN 'Review and optimize slow queries, consider adjusting long_query_time'
            ELSE 'Slow query count is acceptable'
        END
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME = 'Slow_queries';

    -- Check 5: Table fragmentation
    INSERT INTO health_check_results
    SELECT
        'Storage',
        'Table Fragmentation',
        CASE
            WHEN AVG(fragmentation_percent) > 20 THEN 'WARNING'
            WHEN AVG(fragmentation_percent) > 40 THEN 'CRITICAL'
            ELSE 'PASS'
        END,
        CONCAT(ROUND(AVG(fragmentation_percent), 1), '% average'),
        CASE
            WHEN AVG(fragmentation_percent) > 20
            THEN 'Run OPTIMIZE TABLE on fragmented tables'
            ELSE 'Table fragmentation is acceptable'
        END
    FROM (
        SELECT
            CASE
                WHEN data_free > 0 AND (data_length + index_length) > 0
                THEN (data_free / (data_length + index_length + data_free) * 100)
                ELSE 0
            END as fragmentation_percent
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_type = 'BASE TABLE'
    ) frag_data;

    -- Check 6: Backup status
    INSERT INTO health_check_results
    SELECT
        'Backup',
        'Recent Backup Status',
        CASE
            WHEN MAX(backup_start_time) < DATE_SUB(NOW(), INTERVAL 2 DAY) THEN 'CRITICAL'
            WHEN MAX(backup_start_time) < DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'WARNING'
            ELSE 'PASS'
        END,
        CONCAT('Last backup: ', COALESCE(DATE_FORMAT(MAX(backup_start_time), '%Y-%m-%d %H:%i'), 'Never')),
        CASE
            WHEN MAX(backup_start_time) < DATE_SUB(NOW(), INTERVAL 1 DAY)
            THEN 'Ensure regular backups are running'
            ELSE 'Backup schedule is current'
        END
    FROM backup_history
    WHERE backup_status = 'SUCCESS';

    -- Check 7: Disk space
    INSERT INTO health_check_results VALUES (
        'Storage',
        'Database Size',
        'INFO',
        CONCAT(ROUND(SUM(data_length + index_length) / 1024 / 1024 / 1024, 2), ' GB'),
        'Monitor disk space growth trends'
    )
    FROM information_schema.tables
    WHERE table_schema = DATABASE();

    -- Return health check results
    SELECT
        check_category,
        check_name,
        check_status,
        check_value,
        recommendation
    FROM health_check_results
    ORDER BY
        CASE check_status
            WHEN 'CRITICAL' THEN 1
            WHEN 'WARNING' THEN 2
            WHEN 'PASS' THEN 3
            WHEN 'INFO' THEN 4
        END,
        check_category,
        check_name;

END //

DELIMITER ;

-- Run health check
CALL DatabaseHealthCheck();
```

## Capacity Planning and Scaling 📈

### Growth Analysis and Forecasting

```sql
-- Database growth tracking
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
    created_at DATETIME DEFAULT NOW(),
    UNIQUE KEY uk_growth_metrics_date (metric_date)
);

-- Procedure to collect growth metrics
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

    -- Calculate database metrics
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

    -- Insert or update metrics
    INSERT INTO growth_metrics (
        metric_date, database_size_mb, table_count, row_count_total,
        index_size_mb, data_size_mb, avg_row_size_bytes,
        largest_table, largest_table_size_mb
    ) VALUES (
        current_date_var, db_size, tbl_count, row_total,
        idx_size, data_size, avg_row_size,
        largest_tbl, largest_size
    ) ON DUPLICATE KEY UPDATE
        database_size_mb = db_size,
        table_count = tbl_count,
        row_count_total = row_total,
        index_size_mb = idx_size,
        data_size_mb = data_size,
        avg_row_size_bytes = avg_row_size,
        largest_table = largest_tbl,
        largest_table_size_mb = largest_size,
        created_at = NOW();

END //

DELIMITER ;

-- Growth analysis and forecasting
DELIMITER //

CREATE PROCEDURE AnalyzeGrowthTrends(IN forecast_days INT)
BEGIN
    -- Growth rate analysis
    WITH growth_analysis AS (
        SELECT
            metric_date,
            database_size_mb,
            LAG(database_size_mb) OVER (ORDER BY metric_date) as prev_size,
            LAG(metric_date) OVER (ORDER BY metric_date) as prev_date,
            row_count_total,
            LAG(row_count_total) OVER (ORDER BY metric_date) as prev_rows
        FROM growth_metrics
        WHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
        ORDER BY metric_date
    ),
    daily_growth AS (
        SELECT
            metric_date,
            database_size_mb,
            CASE
                WHEN prev_size IS NOT NULL AND DATEDIFF(metric_date, prev_date) > 0
                THEN (database_size_mb - prev_size) / DATEDIFF(metric_date, prev_date)
                ELSE 0
            END as daily_size_growth_mb,
            CASE
                WHEN prev_rows IS NOT NULL AND DATEDIFF(metric_date, prev_date) > 0
                THEN (row_count_total - prev_rows) / DATEDIFF(metric_date, prev_date)
                ELSE 0
            END as daily_row_growth
        FROM growth_analysis
        WHERE prev_size IS NOT NULL
    )

    -- Current growth statistics
    SELECT
        'Growth Statistics' as analysis_type,
        ROUND(AVG(daily_size_growth_mb), 2) as avg_daily_growth_mb,
        ROUND(MAX(daily_size_growth_mb), 2) as max_daily_growth_mb,
        ROUND(MIN(daily_size_growth_mb), 2) as min_daily_growth_mb,
        ROUND(AVG(daily_row_growth), 0) as avg_daily_row_growth,
        COUNT(*) as days_analyzed
    FROM daily_growth
    WHERE daily_size_growth_mb > 0;

    -- Growth forecast
    SELECT
        'Growth Forecast' as analysis_type,
        CURDATE() + INTERVAL forecast_days DAY as forecast_date,
        ROUND(
            MAX(database_size_mb) + (AVG(daily_size_growth_mb) * forecast_days), 2
        ) as forecasted_size_mb,
        ROUND(
            (MAX(database_size_mb) + (AVG(daily_size_growth_mb) * forecast_days)) / 1024, 2
        ) as forecasted_size_gb,
        ROUND(
            MAX(row_count_total) + (AVG(daily_row_growth) * forecast_days), 0
        ) as forecasted_row_count
    FROM daily_growth, growth_metrics
    WHERE daily_size_growth_mb > 0;

    -- Capacity recommendations
    SELECT
        'Capacity Recommendations' as analysis_type,
        CASE
            WHEN AVG(daily_size_growth_mb) * 365 > 10240 THEN 'Plan for storage expansion within 6 months'
            WHEN AVG(daily_size_growth_mb) * 365 > 5120 THEN 'Monitor storage growth closely'
            ELSE 'Current growth rate is manageable'
        END as storage_recommendation,
        CASE
            WHEN AVG(daily_row_growth) * 365 > 10000000 THEN 'Consider partitioning or archiving strategies'
            WHEN AVG(daily_row_growth) * 365 > 1000000 THEN 'Monitor query performance as data grows'
            ELSE 'Row growth is within normal parameters'
        END as performance_recommendation
    FROM daily_growth
    WHERE daily_size_growth_mb > 0;

END //

DELIMITER ;

-- Collect current metrics and analyze trends
CALL CollectGrowthMetrics();
CALL AnalyzeGrowthTrends(90);  -- 90-day forecast
```

### Resource Planning

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
    INDEX idx_resource_util_time (recorded_at)
);

-- Capacity planning analysis
DELIMITER //

CREATE PROCEDURE GenerateCapacityPlan(IN planning_horizon_days INT)
BEGIN
    -- Simulate resource utilization data (in production, collect from system)
    INSERT INTO resource_utilization (
        cpu_usage_percent, memory_usage_percent, disk_io_ops_per_sec,
        network_io_mbps, active_connections, queries_per_second,
        innodb_buffer_pool_usage_percent, temp_table_usage_mb
    ) VALUES (
        ROUND(40 + RAND() * 30, 2),  -- CPU: 40-70%
        ROUND(60 + RAND() * 25, 2),  -- Memory: 60-85%
        ROUND(1000 + RAND() * 2000, 0), -- Disk IO: 1000-3000 ops/sec
        ROUND(10 + RAND() * 20, 2),   -- Network: 10-30 Mbps
        ROUND(50 + RAND() * 100, 0),  -- Connections: 50-150
        ROUND(100 + RAND() * 200, 2), -- QPS: 100-300
        ROUND(70 + RAND() * 20, 2),   -- Buffer pool: 70-90%
        ROUND(50 + RAND() * 200, 2)   -- Temp tables: 50-250 MB
    );

    -- Resource utilization analysis
    SELECT
        'Current Resource Utilization' as analysis_section,
        ROUND(AVG(cpu_usage_percent), 2) as avg_cpu_percent,
        ROUND(MAX(cpu_usage_percent), 2) as peak_cpu_percent,
        ROUND(AVG(memory_usage_percent), 2) as avg_memory_percent,
        ROUND(MAX(memory_usage_percent), 2) as peak_memory_percent,
        ROUND(AVG(active_connections), 0) as avg_connections,
        ROUND(MAX(active_connections), 0) as peak_connections,
        ROUND(AVG(queries_per_second), 2) as avg_qps,
        ROUND(MAX(queries_per_second), 2) as peak_qps
    FROM resource_utilization
    WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);

    -- Capacity thresholds and recommendations
    SELECT
        'Capacity Analysis' as analysis_section,
        resource_type,
        current_avg_usage,
        peak_usage,
        threshold_warning,
        threshold_critical,
        CASE
            WHEN peak_usage > threshold_critical THEN 'IMMEDIATE_ACTION_REQUIRED'
            WHEN peak_usage > threshold_warning THEN 'MONITOR_CLOSELY'
            WHEN current_avg_usage > threshold_warning * 0.8 THEN 'PLAN_UPGRADE'
            ELSE 'ADEQUATE_CAPACITY'
        END as capacity_status,
        recommendation
    FROM (
        SELECT 'CPU' as resource_type,
               AVG(cpu_usage_percent) as current_avg_usage,
               MAX(cpu_usage_percent) as peak_usage,
               70 as threshold_warning, 90 as threshold_critical,
               'Consider CPU upgrade or query optimization' as recommendation
        FROM resource_utilization WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)

        UNION ALL

        SELECT 'Memory' as resource_type,
               AVG(memory_usage_percent) as current_avg_usage,
               MAX(memory_usage_percent) as peak_usage,
               80 as threshold_warning, 95 as threshold_critical,
               'Consider memory upgrade or buffer pool tuning' as recommendation
        FROM resource_utilization WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)

        UNION ALL

        SELECT 'Connections' as resource_type,
               AVG(active_connections) as current_avg_usage,
               MAX(active_connections) as peak_usage,
               100 as threshold_warning, 150 as threshold_critical,
               'Review connection pooling and max_connections setting' as recommendation
        FROM resource_utilization WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ) capacity_data;

    -- Growth-based capacity forecast
    SELECT
        'Capacity Forecast' as analysis_section,
        planning_horizon_days as forecast_days,
        'Storage' as resource_type,
        ROUND(MAX(gm.database_size_mb), 2) as current_size_mb,
        ROUND(MAX(gm.database_size_mb) * 1.5, 2) as forecasted_size_mb,
        ROUND((MAX(gm.database_size_mb) * 1.5) / 1024, 2) as forecasted_size_gb,
        'Plan storage expansion based on growth trends' as recommendation
    FROM growth_metrics gm
    WHERE gm.metric_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

END //

DELIMITER ;

-- Generate capacity planning report
CALL GenerateCapacityPlan(180); -- 6-month planning horizon
```

## Practice Exercises 💪

### Exercise 1: Complete Backup Strategy

```sql
-- 1. Design a comprehensive backup and recovery strategy
-- 2. Implement automated backup procedures with retention policies
-- 3. Create point-in-time recovery procedures
-- 4. Test backup and restore procedures
-- 5. Document disaster recovery plans
```

### Exercise 2: Monitoring and Alerting System

```sql
-- 1. Build a comprehensive database monitoring system
-- 2. Implement automated alerting for critical issues
-- 3. Create performance trending and analysis
-- 4. Design maintenance automation
-- 5. Build capacity planning tools
```

### Exercise 3: Database Administration Toolkit

```sql
-- 1. Create automated maintenance procedures
-- 2. Implement database health check systems
-- 3. Build growth analysis and forecasting
-- 4. Design resource utilization monitoring
-- 5. Create administration dashboards
```

## Best Practices Summary 📋

### Database Administration Checklist

```sql
-- Administration best practices validation
DELIMITER //

CREATE PROCEDURE ValidateAdministrationSetup()
BEGIN
    CREATE TEMPORARY TABLE admin_checklist (
        category VARCHAR(50),
        check_item VARCHAR(100),
        status ENUM('CONFIGURED', 'MISSING', 'NEEDS_ATTENTION'),
        details TEXT
    );

    -- Backup configuration check
    INSERT INTO admin_checklist
    SELECT
        'Backup',
        'Backup Schedule Configured',
        CASE WHEN COUNT(*) > 0 THEN 'CONFIGURED' ELSE 'MISSING' END,
        CONCAT(COUNT(*), ' backup jobs configured')
    FROM backup_schedule WHERE is_active = TRUE;

    -- Monitoring configuration check
    INSERT INTO admin_checklist
    SELECT
        'Monitoring',
        'Monitoring Metrics Configured',
        CASE WHEN COUNT(*) > 0 THEN 'CONFIGURED' ELSE 'MISSING' END,
        CONCAT(COUNT(*), ' monitoring metrics active')
    FROM monitoring_metrics WHERE is_active = TRUE;

    -- Maintenance configuration check
    INSERT INTO admin_checklist
    SELECT
        'Maintenance',
        'Maintenance Schedule Configured',
        CASE WHEN COUNT(*) > 0 THEN 'CONFIGURED' ELSE 'MISSING' END,
        CONCAT(COUNT(*), ' maintenance jobs configured')
    FROM maintenance_schedule WHERE is_active = TRUE;

    -- Binary logging check
    INSERT INTO admin_checklist VALUES (
        'Recovery',
        'Binary Logging Enabled',
        CASE WHEN @@log_bin = 1 THEN 'CONFIGURED' ELSE 'MISSING' END,
        CASE WHEN @@log_bin = 1 THEN 'Binary logging is enabled for point-in-time recovery'
             ELSE 'Binary logging should be enabled for complete recovery capability' END
    );

    SELECT * FROM admin_checklist ORDER BY category, check_item;

END //

DELIMITER ;

-- Run administration validation
CALL ValidateAdministrationSetup();
```

## Next Steps ➡️

Congratulations! You've completed the comprehensive database administration module. You now have the skills to manage enterprise-level database systems including backup/recovery, monitoring, maintenance, and capacity planning. Next, we'll explore Modern Database Technologies and Cloud Integration.

---

## Quick Reference 📚

### Essential Administration Commands

```sql
-- Backup operations
BACKUP DATABASE db_name TO 'backup_location';
RESTORE DATABASE db_name FROM 'backup_location';

-- Maintenance operations
ANALYZE TABLE table_name;
OPTIMIZE TABLE table_name;
REPAIR TABLE table_name;

-- Monitoring queries
SHOW PROCESSLIST;
SHOW ENGINE INNODB STATUS;
SHOW MASTER STATUS;
SHOW SLAVE STATUS;
```

### Administration Best Practices

-   ✅ **Regular Backups**: Implement automated backup strategies with testing
-   ✅ **Proactive Monitoring**: Set up comprehensive monitoring and alerting
-   ✅ **Maintenance Schedules**: Automate routine maintenance tasks
-   ✅ **Capacity Planning**: Monitor growth and plan for future needs
-   ✅ **Documentation**: Maintain detailed operational procedures
-   ✅ **Disaster Recovery**: Test recovery procedures regularly
-   ✅ **Performance Tuning**: Continuously monitor and optimize performance
