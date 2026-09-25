# Database Monitoring and Alerting

## Introduction to Database Monitoring 📊

Database monitoring involves continuously tracking database performance, health, and resource utilization to ensure optimal operation and early detection of issues. Effective monitoring includes metrics collection, trend analysis, and automated alerting.

## Comprehensive Monitoring System 🔍

### Monitoring Infrastructure Setup

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
('Table_Lock_Wait_Time', 'Performance', 'Average table lock wait time', 5, 15, 10),
('Deadlock_Count', 'Concurrency', 'Number of deadlocks detected', 5, 20, 10),
('Query_Response_Time_Ms', 'Performance', 'Average query response time in milliseconds', 100, 500, 5);

CREATE TABLE monitoring_data (
    data_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    metric_id INT,
    metric_value DECIMAL(15,2),
    recorded_at DATETIME DEFAULT NOW(),
    server_instance VARCHAR(100),
    additional_info JSON,
    FOREIGN KEY (metric_id) REFERENCES monitoring_metrics(metric_id),
    INDEX idx_monitoring_data_metric_time (metric_id, recorded_at),
    INDEX idx_monitoring_data_time (recorded_at)
);
```

### Automated Data Collection

```sql
-- Monitoring data collection procedure
DELIMITER //

CREATE PROCEDURE CollectMonitoringMetrics()
BEGIN
    DECLARE current_time DATETIME DEFAULT NOW();
    DECLARE server_name VARCHAR(100) DEFAULT @@hostname;

    -- Collect connection metrics
    INSERT INTO monitoring_data (metric_id, metric_value, recorded_at, server_instance)
    SELECT
        mm.metric_id,
        CAST(gs.VARIABLE_VALUE AS DECIMAL(15,2)),
        current_time,
        server_name
    FROM monitoring_metrics mm
    JOIN performance_schema.global_status gs ON mm.metric_name = gs.VARIABLE_NAME
    WHERE mm.is_active = TRUE
      AND gs.VARIABLE_NAME IN ('Threads_connected', 'Slow_queries');

    -- Calculate InnoDB Buffer Pool Hit Rate
    INSERT INTO monitoring_data (metric_id, metric_value, recorded_at, server_instance)
    SELECT
        mm.metric_id,
        ROUND(100 - (reads.VARIABLE_VALUE / requests.VARIABLE_VALUE * 100), 2),
        current_time,
        server_name
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
      AND mm.is_active = TRUE
      AND requests.VARIABLE_VALUE > 0;

    -- Collect deadlock information
    INSERT INTO monitoring_data (metric_id, metric_value, recorded_at, server_instance)
    SELECT
        mm.metric_id,
        CAST(gs.VARIABLE_VALUE AS DECIMAL(15,2)),
        current_time,
        server_name
    FROM monitoring_metrics mm
    CROSS JOIN (
        SELECT VARIABLE_VALUE
        FROM performance_schema.global_status
        WHERE VARIABLE_NAME = 'Innodb_deadlocks'
    ) gs
    WHERE mm.metric_name = 'Deadlock_Count'
      AND mm.is_active = TRUE;

    -- Calculate average query response time from performance schema
    INSERT INTO monitoring_data (metric_id, metric_value, recorded_at, server_instance, additional_info)
    SELECT
        mm.metric_id,
        ROUND(AVG(avg_timer_wait) / 1000000, 2), -- Convert from picoseconds to milliseconds
        current_time,
        server_name,
        JSON_OBJECT(
            'sample_queries', COUNT(*),
            'max_response_time_ms', ROUND(MAX(avg_timer_wait) / 1000000, 2),
            'min_response_time_ms', ROUND(MIN(avg_timer_wait) / 1000000, 2)
        )
    FROM monitoring_metrics mm
    CROSS JOIN (
        SELECT avg_timer_wait
        FROM performance_schema.events_statements_summary_by_digest
        WHERE last_seen >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
          AND avg_timer_wait > 0
        LIMIT 1000
    ) perf
    WHERE mm.metric_name = 'Query_Response_Time_Ms'
      AND mm.is_active = TRUE;

    -- Simulate system metrics (in production, collect from system monitoring)
    INSERT INTO monitoring_data (metric_id, metric_value, recorded_at, server_instance)
    SELECT
        mm.metric_id,
        CASE mm.metric_name
            WHEN 'CPU_Usage_Percent' THEN ROUND(40 + RAND() * 30, 2)
            WHEN 'Memory_Usage_Percent' THEN ROUND(60 + RAND() * 25, 2)
            WHEN 'Disk_Space_Usage_Percent' THEN ROUND(60 + RAND() * 20, 2)
            WHEN 'Table_Lock_Wait_Time' THEN ROUND(RAND() * 10, 2)
        END,
        current_time,
        server_name
    FROM monitoring_metrics mm
    WHERE mm.metric_name IN ('CPU_Usage_Percent', 'Memory_Usage_Percent', 'Disk_Space_Usage_Percent', 'Table_Lock_Wait_Time')
      AND mm.is_active = TRUE;

    -- Clean up old monitoring data (keep 30 days)
    DELETE FROM monitoring_data
    WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

END //

DELIMITER ;
```

## Alerting System 🚨

### Alert Management Infrastructure

```sql
-- Monitoring alerts table
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
    resolution_notes TEXT,
    escalation_level INT DEFAULT 1,
    notification_sent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (metric_id) REFERENCES monitoring_metrics(metric_id),
    INDEX idx_monitoring_alerts_level (alert_level, resolved_at),
    INDEX idx_monitoring_alerts_time (triggered_at),
    INDEX idx_monitoring_alerts_status (resolved_at, acknowledged_at)
);

-- Alert notification preferences
CREATE TABLE alert_notification_preferences (
    pref_id INT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(255),
    alert_level ENUM('WARNING', 'CRITICAL', 'ALL'),
    metric_category VARCHAR(50),
    notification_method ENUM('EMAIL', 'SMS', 'SLACK', 'WEBHOOK'),
    is_active BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at DATETIME DEFAULT NOW()
);

-- Insert sample notification preferences
INSERT INTO alert_notification_preferences (user_email, alert_level, metric_category, notification_method) VALUES
('admin@company.com', 'CRITICAL', 'Performance', 'EMAIL'),
('admin@company.com', 'CRITICAL', 'Storage', 'SMS'),
('dba@company.com', 'WARNING', 'Performance', 'EMAIL'),
('ops@company.com', 'ALL', 'Connection', 'SLACK');
```

### Alert Detection and Processing

```sql
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
               md.metric_value, ' > ', mm.threshold_warning,
               ' on server ', md.server_instance),
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
    INSERT INTO monitoring_alerts (metric_id, alert_level, alert_message, metric_value, threshold_value, escalation_level)
    SELECT
        md.metric_id,
        'CRITICAL',
        CONCAT(mm.metric_description, ' has exceeded CRITICAL threshold: ',
               md.metric_value, ' > ', mm.threshold_critical,
               ' on server ', md.server_instance, ' - IMMEDIATE ATTENTION REQUIRED!'),
        md.metric_value,
        mm.threshold_critical,
        2
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
    SET ma.resolved_at = NOW(),
        ma.resolution_notes = 'Auto-resolved: metric returned to normal levels'
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

    -- Escalate unacknowledged critical alerts
    UPDATE monitoring_alerts
    SET escalation_level = escalation_level + 1
    WHERE alert_level = 'CRITICAL'
      AND acknowledged_at IS NULL
      AND resolved_at IS NULL
      AND triggered_at <= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
      AND escalation_level < 3;

    -- Return current active alerts
    SELECT
        ma.alert_id,
        mm.metric_name,
        mm.metric_category,
        ma.alert_level,
        ma.alert_message,
        ma.metric_value,
        ma.threshold_value,
        ma.triggered_at,
        TIMESTAMPDIFF(MINUTE, ma.triggered_at, NOW()) as duration_minutes,
        ma.acknowledged_by,
        ma.escalation_level,
        CASE
            WHEN ma.escalation_level >= 3 THEN 'ESCALATED'
            WHEN ma.acknowledged_at IS NOT NULL THEN 'ACKNOWLEDGED'
            ELSE 'ACTIVE'
        END as alert_status
    FROM monitoring_alerts ma
    JOIN monitoring_metrics mm ON ma.metric_id = mm.metric_id
    WHERE ma.resolved_at IS NULL
    ORDER BY
        ma.escalation_level DESC,
        CASE ma.alert_level
            WHEN 'CRITICAL' THEN 1
            WHEN 'WARNING' THEN 2
        END,
        ma.triggered_at DESC;

END //

DELIMITER ;

-- Alert acknowledgment procedure
DELIMITER //

CREATE PROCEDURE AcknowledgeAlert(
    IN alert_id_param BIGINT,
    IN acknowledged_by_param VARCHAR(100),
    IN notes TEXT
)
BEGIN
    DECLARE alert_exists INT DEFAULT 0;

    -- Check if alert exists and is still active
    SELECT COUNT(*) INTO alert_exists
    FROM monitoring_alerts
    WHERE alert_id = alert_id_param
      AND resolved_at IS NULL;

    IF alert_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Alert not found or already resolved';
    END IF;

    -- Acknowledge the alert
    UPDATE monitoring_alerts
    SET acknowledged_at = NOW(),
        acknowledged_by = acknowledged_by_param,
        resolution_notes = COALESCE(CONCAT(COALESCE(resolution_notes, ''), '\n', notes), notes)
    WHERE alert_id = alert_id_param;

    -- Log acknowledgment
    INSERT INTO system_log (log_type, log_message, log_date)
    VALUES ('ALERT_ACK',
            CONCAT('Alert ', alert_id_param, ' acknowledged by ', acknowledged_by_param),
            NOW());

    SELECT 'Alert acknowledged successfully' as status;

END //

DELIMITER ;
```

## Performance Trend Analysis 📈

### Trending and Historical Analysis

```sql
-- Performance trending view
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
    ) as trend_change,
    CASE
        WHEN AVG(md.metric_value) - LAG(ROUND(AVG(md.metric_value), 2)) OVER (
            PARTITION BY mm.metric_name ORDER BY DATE(md.recorded_at)
        ) > mm.threshold_warning * 0.1 THEN 'INCREASING'
        WHEN AVG(md.metric_value) - LAG(ROUND(AVG(md.metric_value), 2)) OVER (
            PARTITION BY mm.metric_name ORDER BY DATE(md.recorded_at)
        ) < -mm.threshold_warning * 0.1 THEN 'DECREASING'
        ELSE 'STABLE'
    END as trend_direction
FROM monitoring_data md
JOIN monitoring_metrics mm ON md.metric_id = mm.metric_id
WHERE md.recorded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY mm.metric_name, mm.metric_category, DATE(md.recorded_at), mm.threshold_warning
ORDER BY mm.metric_name, trend_date DESC;

-- Performance anomaly detection
DELIMITER //

CREATE PROCEDURE DetectPerformanceAnomalies()
BEGIN
    -- Create temporary table for anomaly results
    DROP TEMPORARY TABLE IF EXISTS performance_anomalies;
    CREATE TEMPORARY TABLE performance_anomalies (
        metric_name VARCHAR(100),
        anomaly_type VARCHAR(50),
        anomaly_description TEXT,
        current_value DECIMAL(15,2),
        expected_range_min DECIMAL(15,2),
        expected_range_max DECIMAL(15,2),
        severity ENUM('LOW', 'MEDIUM', 'HIGH'),
        detected_at DATETIME
    );

    -- Detect values outside normal standard deviation range
    INSERT INTO performance_anomalies
    SELECT
        mm.metric_name,
        'STATISTICAL_OUTLIER',
        CONCAT('Current value ', ROUND(latest.metric_value, 2),
               ' is outside normal range [',
               ROUND(stats.avg_value - (2 * stats.std_deviation), 2), ', ',
               ROUND(stats.avg_value + (2 * stats.std_deviation), 2), ']'),
        latest.metric_value,
        stats.avg_value - (2 * stats.std_deviation),
        stats.avg_value + (2 * stats.std_deviation),
        CASE
            WHEN ABS(latest.metric_value - stats.avg_value) > (3 * stats.std_deviation) THEN 'HIGH'
            WHEN ABS(latest.metric_value - stats.avg_value) > (2.5 * stats.std_deviation) THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        NOW()
    FROM monitoring_metrics mm
    JOIN (
        -- Get latest value for each metric
        SELECT
            metric_id,
            metric_value,
            recorded_at,
            ROW_NUMBER() OVER (PARTITION BY metric_id ORDER BY recorded_at DESC) as rn
        FROM monitoring_data
        WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ) latest ON mm.metric_id = latest.metric_id AND latest.rn = 1
    JOIN (
        -- Calculate baseline statistics
        SELECT
            md.metric_id,
            AVG(md.metric_value) as avg_value,
            STDDEV(md.metric_value) as std_deviation
        FROM monitoring_data md
        WHERE md.recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND md.recorded_at <= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        GROUP BY md.metric_id
        HAVING COUNT(*) >= 10 AND STDDEV(md.metric_value) > 0
    ) stats ON mm.metric_id = stats.metric_id
    WHERE ABS(latest.metric_value - stats.avg_value) > (2 * stats.std_deviation);

    -- Detect sudden spikes or drops
    INSERT INTO performance_anomalies
    SELECT
        mm.metric_name,
        'SUDDEN_CHANGE',
        CONCAT('Sudden ',
               CASE WHEN change_percent > 0 THEN 'increase' ELSE 'decrease' END,
               ' of ', ABS(ROUND(change_percent, 1)), '% detected'),
        current_avg,
        previous_avg,
        current_avg,
        CASE
            WHEN ABS(change_percent) > 100 THEN 'HIGH'
            WHEN ABS(change_percent) > 50 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        NOW()
    FROM (
        SELECT
            mm.metric_name,
            mm.metric_id,
            AVG(CASE WHEN md.recorded_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                     THEN md.metric_value END) as current_avg,
            AVG(CASE WHEN md.recorded_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
                          AND md.recorded_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)
                     THEN md.metric_value END) as previous_avg
        FROM monitoring_metrics mm
        JOIN monitoring_data md ON mm.metric_id = md.metric_id
        WHERE md.recorded_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
        GROUP BY mm.metric_name, mm.metric_id
    ) trend_data
    JOIN monitoring_metrics mm ON trend_data.metric_id = mm.metric_id
    CROSS JOIN (
        SELECT
            CASE WHEN previous_avg > 0
                 THEN ((current_avg - previous_avg) / previous_avg) * 100
                 ELSE 0 END as change_percent
        FROM (
            SELECT current_avg, previous_avg
        ) calc
    ) calc_change
    WHERE previous_avg > 0
      AND current_avg > 0
      AND ABS(((current_avg - previous_avg) / previous_avg) * 100) > 25;

    -- Return detected anomalies
    SELECT
        metric_name,
        anomaly_type,
        anomaly_description,
        current_value,
        expected_range_min,
        expected_range_max,
        severity,
        detected_at
    FROM performance_anomalies
    ORDER BY
        CASE severity WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
        detected_at DESC;

END //

DELIMITER ;
```

## Performance Dashboard 📊

### Comprehensive Dashboard Procedure

```sql
-- Performance dashboard procedure
DELIMITER //

CREATE PROCEDURE GeneratePerformanceDashboard()
BEGIN
    -- Current system status
    SELECT
        'Current System Status' as section,
        mm.metric_name,
        mm.metric_category,
        ROUND(md.metric_value, 2) as current_value,
        mm.threshold_warning,
        mm.threshold_critical,
        CASE
            WHEN md.metric_value > mm.threshold_critical THEN 'CRITICAL'
            WHEN md.metric_value > mm.threshold_warning THEN 'WARNING'
            ELSE 'NORMAL'
        END as status,
        ROUND(
            CASE
                WHEN mm.threshold_critical > 0
                THEN (md.metric_value / mm.threshold_critical) * 100
                ELSE 0
            END, 1
        ) as threshold_percentage,
        md.recorded_at as last_updated
    FROM monitoring_data md
    JOIN monitoring_metrics mm ON md.metric_id = mm.metric_id
    WHERE md.recorded_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      AND md.data_id IN (
          SELECT MAX(data_id)
          FROM monitoring_data md2
          WHERE md2.metric_id = md.metric_id
      )
    ORDER BY
        CASE
            WHEN md.metric_value > mm.threshold_critical THEN 1
            WHEN md.metric_value > mm.threshold_warning THEN 2
            ELSE 3
        END,
        mm.metric_category;

    -- Performance trends (last 7 days)
    SELECT
        'Performance Trends (7 days)' as section,
        metric_name,
        metric_category,
        ROUND(AVG(avg_value), 2) as avg_7_day,
        ROUND(MIN(min_value), 2) as min_7_day,
        ROUND(MAX(max_value), 2) as max_7_day,
        ROUND(AVG(COALESCE(trend_change, 0)), 2) as avg_daily_change,
        COUNT(DISTINCT trend_date) as days_with_data,
        CASE
            WHEN AVG(COALESCE(trend_change, 0)) > 5 THEN 'INCREASING'
            WHEN AVG(COALESCE(trend_change, 0)) < -5 THEN 'DECREASING'
            ELSE 'STABLE'
        END as trend_direction
    FROM monitoring_trends
    WHERE trend_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY metric_name, metric_category
    ORDER BY metric_category, metric_name;

    -- Alert summary (last 24 hours)
    SELECT
        'Alert Summary (24 hours)' as section,
        ma.alert_level,
        mm.metric_category,
        COUNT(*) as total_alerts,
        SUM(CASE WHEN ma.resolved_at IS NULL THEN 1 ELSE 0 END) as active_alerts,
        SUM(CASE WHEN ma.acknowledged_at IS NOT NULL THEN 1 ELSE 0 END) as acknowledged_alerts,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, ma.triggered_at, COALESCE(ma.resolved_at, NOW()))), 2) as avg_duration_minutes,
        MIN(ma.triggered_at) as first_alert,
        MAX(ma.triggered_at) as latest_alert
    FROM monitoring_alerts ma
    JOIN monitoring_metrics mm ON ma.metric_id = mm.metric_id
    WHERE ma.triggered_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    GROUP BY ma.alert_level, mm.metric_category
    ORDER BY ma.alert_level, mm.metric_category;

    -- Top problematic metrics
    SELECT
        'Top Problematic Metrics' as section,
        mm.metric_name,
        mm.metric_category,
        COUNT(ma.alert_id) as alert_count,
        MAX(ma.triggered_at) as last_alert,
        ROUND(AVG(ma.metric_value), 2) as avg_problem_value,
        mm.threshold_critical,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, ma.triggered_at, COALESCE(ma.resolved_at, NOW()))), 2) as avg_resolution_time
    FROM monitoring_metrics mm
    LEFT JOIN monitoring_alerts ma ON mm.metric_id = ma.metric_id
        AND ma.triggered_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    WHERE ma.alert_id IS NOT NULL
    GROUP BY mm.metric_id, mm.metric_name, mm.metric_category, mm.threshold_critical
    ORDER BY alert_count DESC, last_alert DESC
    LIMIT 10;

END //

DELIMITER ;

-- Generate performance dashboard
CALL GeneratePerformanceDashboard();
```

## Automated Event Scheduling 🕒

### Monitoring Event Automation

```sql
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

CREATE EVENT IF NOT EXISTS evt_detect_anomalies
ON SCHEDULE EVERY 30 MINUTE
STARTS NOW()
DO
    CALL DetectPerformanceAnomalies();

-- Event to clean up old resolved alerts
CREATE EVENT IF NOT EXISTS evt_cleanup_old_alerts
ON SCHEDULE EVERY 1 DAY
STARTS '2024-08-12 02:00:00'
DO
    DELETE FROM monitoring_alerts
    WHERE resolved_at IS NOT NULL
      AND resolved_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Show active events
SHOW EVENTS;
```

## Practice Exercises 💪

### Exercise 1: Monitoring Setup

```sql
-- 1. Design a monitoring strategy for your database environment
-- 2. Implement custom metrics for application-specific monitoring
-- 3. Create alerting rules based on business requirements
-- 4. Set up notification preferences for different user roles
-- 5. Test alert generation and acknowledgment workflows
```

### Exercise 2: Performance Analysis

```sql
-- 1. Implement trend analysis for key performance metrics
-- 2. Create anomaly detection for unusual patterns
-- 3. Build predictive alerting based on trends
-- 4. Design capacity planning based on monitoring data
-- 5. Create automated performance reports
```

## Best Practices 📋

### Monitoring Validation

```sql
-- Monitoring system health check
DELIMITER //

CREATE PROCEDURE ValidateMonitoringSetup()
BEGIN
    CREATE TEMPORARY TABLE monitoring_validation (
        check_category VARCHAR(50),
        check_item VARCHAR(100),
        status ENUM('PASS', 'WARNING', 'CRITICAL'),
        details TEXT
    );

    -- Check if metrics are configured
    INSERT INTO monitoring_validation
    SELECT
        'Configuration',
        'Monitoring Metrics Configured',
        CASE WHEN COUNT(*) >= 5 THEN 'PASS' ELSE 'WARNING' END,
        CONCAT(COUNT(*), ' monitoring metrics configured')
    FROM monitoring_metrics WHERE is_active = TRUE;

    -- Check recent data collection
    INSERT INTO monitoring_validation
    SELECT
        'Data Collection',
        'Recent Data Collection',
        CASE
            WHEN MAX(recorded_at) >= DATE_SUB(NOW(), INTERVAL 10 MINUTE) THEN 'PASS'
            WHEN MAX(recorded_at) >= DATE_SUB(NOW(), INTERVAL 30 MINUTE) THEN 'WARNING'
            ELSE 'CRITICAL'
        END,
        CONCAT('Last data collected: ', COALESCE(DATE_FORMAT(MAX(recorded_at), '%Y-%m-%d %H:%i'), 'Never'))
    FROM monitoring_data;

    -- Check alert configuration
    INSERT INTO monitoring_validation
    SELECT
        'Alerting',
        'Alert Thresholds Configured',
        CASE
            WHEN COUNT(*) = (SELECT COUNT(*) FROM monitoring_metrics WHERE is_active = TRUE) THEN 'PASS'
            ELSE 'WARNING'
        END,
        CONCAT(COUNT(*), ' metrics have alert thresholds configured')
    FROM monitoring_metrics
    WHERE is_active = TRUE
      AND (threshold_warning IS NOT NULL OR threshold_critical IS NOT NULL);

    -- Check event scheduler
    INSERT INTO monitoring_validation VALUES (
        'Automation',
        'Event Scheduler Status',
        CASE WHEN @@event_scheduler = 'ON' THEN 'PASS' ELSE 'CRITICAL' END,
        CASE WHEN @@event_scheduler = 'ON' THEN 'Event scheduler is running' ELSE 'Event scheduler is disabled - enable for automated monitoring' END
    );

    SELECT * FROM monitoring_validation ORDER BY
        CASE status WHEN 'CRITICAL' THEN 1 WHEN 'WARNING' THEN 2 ELSE 3 END,
        check_category;

END //

DELIMITER ;

-- Run monitoring validation
CALL ValidateMonitoringSetup();
```

## Quick Reference 📚

### Essential Monitoring Queries

```sql
-- Check current connections
SHOW PROCESSLIST;

-- View performance schema summary
SELECT * FROM performance_schema.events_statements_summary_by_digest
ORDER BY avg_timer_wait DESC LIMIT 10;

-- Check InnoDB status
SHOW ENGINE INNODB STATUS;

-- View current alerts
SELECT * FROM monitoring_alerts WHERE resolved_at IS NULL;
```

### Key Monitoring Best Practices

-   ✅ **Comprehensive Metrics**: Monitor all critical database aspects
-   ✅ **Appropriate Thresholds**: Set realistic warning and critical levels
-   ✅ **Automated Collection**: Use scheduled events for consistent monitoring
-   ✅ **Trend Analysis**: Track performance trends over time
-   ✅ **Proactive Alerting**: Alert before problems become critical
-   ✅ **Alert Management**: Implement acknowledgment and escalation
-   ✅ **Regular Review**: Continuously tune thresholds and metrics
