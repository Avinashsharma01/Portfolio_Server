# Database Backup and Recovery Strategies

## Introduction to Backup and Recovery 💾

Database backup and recovery is critical for protecting data against loss, corruption, or disasters. A comprehensive backup strategy ensures business continuity and data integrity through various backup types and recovery procedures.

## Backup Strategy Planning 📋

### Types of Database Backups

1. **Full Backup**: Complete copy of the entire database
2. **Incremental Backup**: Only changes since the last backup
3. **Differential Backup**: Changes since the last full backup
4. **Transaction Log Backup**: Continuous backup of transaction logs
5. **Point-in-Time Backup**: Backup to a specific moment in time

### Backup Configuration

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

## Automated Backup Procedures 🤖

### Comprehensive Backup Execution

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

## Point-in-Time Recovery 🕒

### Recovery Planning and Execution

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

### Recovery Testing and Validation

```sql
-- Recovery testing procedures
DELIMITER //

CREATE PROCEDURE TestBackupRecovery(IN backup_id_param INT)
BEGIN
    DECLARE test_database VARCHAR(100);
    DECLARE backup_file VARCHAR(500);
    DECLARE test_start DATETIME;
    DECLARE test_end DATETIME;
    DECLARE test_status VARCHAR(20);
    DECLARE error_msg TEXT DEFAULT NULL;

    -- Handler for any SQL exception
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            error_msg = MESSAGE_TEXT;

        SET test_status = 'FAILED';
        SET test_end = NOW();

        INSERT INTO backup_test_history (
            backup_id, test_start_time, test_end_time,
            test_status, test_database, error_message
        ) VALUES (
            backup_id_param, test_start, test_end,
            test_status, test_database, error_msg
        );

        -- Clean up test database
        SET @sql = CONCAT('DROP DATABASE IF EXISTS ', test_database);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        RESIGNAL;
    END;

    SET test_start = NOW();

    -- Get backup file path
    SELECT backup_file_path INTO backup_file
    FROM backup_history
    WHERE backup_id = backup_id_param
      AND backup_status = 'SUCCESS'
    ORDER BY backup_start_time DESC
    LIMIT 1;

    -- Generate test database name
    SET test_database = CONCAT('test_restore_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s'));

    -- Create test database
    SET @sql = CONCAT('CREATE DATABASE ', test_database);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- In production, you would restore the backup file here
    -- For demonstration, we'll simulate a successful restore

    -- Verify restoration by checking table count
    SELECT COUNT(*) INTO @table_count
    FROM information_schema.tables
    WHERE table_schema = test_database;

    -- Simulate some tables restored
    SET @table_count = 5;

    SET test_end = NOW();
    SET test_status = CASE WHEN @table_count > 0 THEN 'SUCCESS' ELSE 'FAILED' END;

    -- Log test results
    INSERT INTO backup_test_history (
        backup_id, test_start_time, test_end_time,
        test_status, test_database, tables_restored,
        test_duration_seconds
    ) VALUES (
        backup_id_param, test_start, test_end,
        test_status, test_database, @table_count,
        TIMESTAMPDIFF(SECOND, test_start, test_end)
    );

    -- Clean up test database
    SET @sql = CONCAT('DROP DATABASE ', test_database);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- Return test results
    SELECT
        test_status,
        test_database,
        @table_count as tables_restored,
        TIMESTAMPDIFF(SECOND, test_start, test_end) as test_duration_seconds,
        'Test completed successfully' as message;

END //

DELIMITER ;

-- Backup test history table
CREATE TABLE backup_test_history (
    test_id INT PRIMARY KEY AUTO_INCREMENT,
    backup_id INT,
    test_start_time DATETIME,
    test_end_time DATETIME,
    test_status ENUM('SUCCESS', 'FAILED'),
    test_database VARCHAR(100),
    tables_restored INT,
    test_duration_seconds INT,
    error_message TEXT,
    FOREIGN KEY (backup_id) REFERENCES backup_schedule(backup_id),
    INDEX idx_backup_test_status (test_status, test_start_time)
);
```

## Backup Monitoring and Reporting 📊

### Backup Status Dashboard

```sql
-- Backup monitoring dashboard
DELIMITER //

CREATE PROCEDURE BackupStatusDashboard()
BEGIN
    -- Recent backup status
    SELECT
        'Recent Backup Status' as section,
        bs.backup_name,
        bs.backup_type,
        bs.database_name,
        bh.backup_status,
        bh.backup_start_time,
        bh.backup_size_mb,
        TIMESTAMPDIFF(HOUR, bh.backup_start_time, NOW()) as hours_ago,
        bh.backup_file_path
    FROM backup_schedule bs
    LEFT JOIN backup_history bh ON bs.backup_id = bh.backup_id
    WHERE bs.is_active = TRUE
      AND bh.backup_start_time = (
          SELECT MAX(backup_start_time)
          FROM backup_history bh2
          WHERE bh2.backup_id = bs.backup_id
      )
    ORDER BY bh.backup_start_time DESC;

    -- Backup success rate
    SELECT
        'Backup Success Rate (Last 30 Days)' as section,
        bs.backup_name,
        COUNT(*) as total_backups,
        SUM(CASE WHEN bh.backup_status = 'SUCCESS' THEN 1 ELSE 0 END) as successful_backups,
        ROUND(SUM(CASE WHEN bh.backup_status = 'SUCCESS' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as success_rate_percent,
        AVG(bh.backup_size_mb) as avg_backup_size_mb,
        AVG(TIMESTAMPDIFF(MINUTE, bh.backup_start_time, bh.backup_end_time)) as avg_duration_minutes
    FROM backup_schedule bs
    JOIN backup_history bh ON bs.backup_id = bh.backup_id
    WHERE bh.backup_start_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      AND bs.is_active = TRUE
    GROUP BY bs.backup_id, bs.backup_name
    ORDER BY success_rate_percent DESC;

    -- Storage usage by backup type
    SELECT
        'Backup Storage Usage' as section,
        bs.backup_type,
        COUNT(*) as backup_count,
        ROUND(SUM(bh.backup_size_mb), 2) as total_size_mb,
        ROUND(SUM(bh.backup_size_mb) / 1024, 2) as total_size_gb,
        ROUND(AVG(bh.backup_size_mb), 2) as avg_size_mb,
        MIN(bh.backup_start_time) as oldest_backup,
        MAX(bh.backup_start_time) as newest_backup
    FROM backup_schedule bs
    JOIN backup_history bh ON bs.backup_id = bh.backup_id
    WHERE bh.backup_status = 'SUCCESS'
      AND bs.is_active = TRUE
    GROUP BY bs.backup_type
    ORDER BY total_size_mb DESC;

    -- Failed backups requiring attention
    SELECT
        'Failed Backups Requiring Attention' as section,
        bs.backup_name,
        bh.backup_start_time,
        bh.error_message,
        TIMESTAMPDIFF(HOUR, bh.backup_start_time, NOW()) as hours_since_failure
    FROM backup_schedule bs
    JOIN backup_history bh ON bs.backup_id = bh.backup_id
    WHERE bh.backup_status = 'FAILED'
      AND bh.backup_start_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      AND bs.is_active = TRUE
    ORDER BY bh.backup_start_time DESC;

END //

DELIMITER ;

-- Generate backup dashboard
CALL BackupStatusDashboard();
```

## Best Practices 📋

### Backup Strategy Checklist

```sql
-- Backup validation procedure
DELIMITER //

CREATE PROCEDURE ValidateBackupStrategy()
BEGIN
    CREATE TEMPORARY TABLE backup_validation (
        check_category VARCHAR(50),
        check_item VARCHAR(100),
        status ENUM('PASS', 'WARNING', 'CRITICAL'),
        details TEXT
    );

    -- Check if backups are configured
    INSERT INTO backup_validation
    SELECT
        'Configuration',
        'Backup Jobs Configured',
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'CRITICAL' END,
        CONCAT(COUNT(*), ' active backup jobs found')
    FROM backup_schedule WHERE is_active = TRUE;

    -- Check recent backup execution
    INSERT INTO backup_validation
    SELECT
        'Execution',
        'Recent Backup Success',
        CASE
            WHEN MAX(backup_start_time) >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'PASS'
            WHEN MAX(backup_start_time) >= DATE_SUB(NOW(), INTERVAL 3 DAY) THEN 'WARNING'
            ELSE 'CRITICAL'
        END,
        CONCAT('Last successful backup: ', COALESCE(DATE_FORMAT(MAX(backup_start_time), '%Y-%m-%d %H:%i'), 'Never'))
    FROM backup_history WHERE backup_status = 'SUCCESS';

    -- Check binary logging
    INSERT INTO backup_validation VALUES (
        'Point-in-Time Recovery',
        'Binary Logging Enabled',
        CASE WHEN @@log_bin = 1 THEN 'PASS' ELSE 'WARNING' END,
        CASE WHEN @@log_bin = 1 THEN 'Binary logging is enabled' ELSE 'Enable binary logging for point-in-time recovery' END
    );

    -- Check backup testing
    INSERT INTO backup_validation
    SELECT
        'Testing',
        'Backup Testing',
        CASE
            WHEN COUNT(*) > 0 AND MAX(test_start_time) >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'PASS'
            WHEN COUNT(*) > 0 THEN 'WARNING'
            ELSE 'CRITICAL'
        END,
        CASE
            WHEN COUNT(*) = 0 THEN 'No backup tests found - implement regular testing'
            WHEN MAX(test_start_time) < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'Backup testing is outdated'
            ELSE CONCAT('Last backup test: ', DATE_FORMAT(MAX(test_start_time), '%Y-%m-%d'))
        END
    FROM backup_test_history;

    SELECT * FROM backup_validation ORDER BY
        CASE status WHEN 'CRITICAL' THEN 1 WHEN 'WARNING' THEN 2 ELSE 3 END,
        check_category;

END //

DELIMITER ;

-- Run backup validation
CALL ValidateBackupStrategy();
```

## Practice Exercises 💪

### Exercise 1: Backup Implementation

```sql
-- 1. Design a backup strategy for a production database
-- 2. Implement automated backup procedures with different types
-- 3. Create retention policies and cleanup procedures
-- 4. Test backup and restore procedures
-- 5. Set up backup monitoring and alerting
```

### Exercise 2: Recovery Planning

```sql
-- 1. Create point-in-time recovery procedures
-- 2. Implement backup testing automation
-- 3. Design disaster recovery plans
-- 4. Create recovery time objective (RTO) procedures
-- 5. Test various recovery scenarios
```

## Quick Reference Commands 📚

### Essential Backup Commands

```bash
# MySQL backup commands
mysqldump --single-transaction --routines --triggers --events --all-databases > backup.sql
mysqldump --single-transaction --master-data=2 database_name > database_backup.sql
mysqlbinlog --start-datetime="2024-08-11 10:00:00" mysql-bin.000001 > binlog_backup.sql

# Restore commands
mysql database_name < backup.sql
mysql < full_backup.sql
```

### Key Backup Best Practices

-   ✅ **Multiple Backup Types**: Implement full, incremental, and transaction log backups
-   ✅ **Regular Testing**: Test backups regularly to ensure recoverability
-   ✅ **Retention Policies**: Implement automated cleanup based on retention requirements
-   ✅ **Monitoring**: Monitor backup success and failure rates
-   ✅ **Documentation**: Document recovery procedures and test results
-   ✅ **Offsite Storage**: Store backups in multiple locations
-   ✅ **Encryption**: Encrypt sensitive backup data
