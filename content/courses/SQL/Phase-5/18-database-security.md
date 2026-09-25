# Database Security and User Management

## Introduction to Database Security 🔐

Database security is critical for protecting sensitive data, ensuring compliance with regulations, and maintaining business continuity. This involves implementing multiple layers of security including authentication, authorization, encryption, auditing, and access controls.

## User Management and Authentication 👤

### Creating and Managing Database Users

```sql
-- Create users with different privilege levels
CREATE USER 'app_read_only'@'localhost' IDENTIFIED BY 'SecureP@ssw0rd123!';
CREATE USER 'app_read_write'@'localhost' IDENTIFIED BY 'SecureP@ssw0rd456!';
CREATE USER 'app_admin'@'localhost' IDENTIFIED BY 'SecureP@ssw0rd789!';
CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'BackupP@ssw0rd999!';
CREATE USER 'analyst'@'%' IDENTIFIED BY 'AnalystP@ssw0rd111!';

-- Create users with specific host restrictions
CREATE USER 'web_app'@'192.168.1.%' IDENTIFIED BY 'WebAppP@ssw0rd222!';
CREATE USER 'api_service'@'app-server-01.company.com' IDENTIFIED BY 'ApiServiceP@ssw0rd333!';

-- Set password validation requirements
-- Add to my.cnf:
/*
[mysqld]
validate_password.policy = MEDIUM
validate_password.length = 12
validate_password.number_count = 2
validate_password.special_char_count = 2
validate_password.mixed_case_count = 2
*/

-- View current users
SELECT
    user,
    host,
    account_locked,
    password_expired,
    password_last_changed,
    password_lifetime
FROM mysql.user
ORDER BY user, host;

-- Check user authentication details
SELECT
    user,
    host,
    plugin,
    authentication_string,
    ssl_type,
    ssl_cipher
FROM mysql.user
WHERE user NOT IN ('root', 'mysql.session', 'mysql.sys');
```

### Advanced Authentication Methods

```sql
-- Enable SSL/TLS encryption for specific users
ALTER USER 'app_admin'@'localhost' REQUIRE SSL;
ALTER USER 'analyst'@'%' REQUIRE X509;

-- Create user with certificate-based authentication
CREATE USER 'secure_admin'@'%' IDENTIFIED BY 'SecureAdminP@ss!'
REQUIRE ISSUER 'CN=MySQL_Server_Auto_Generated_CA_Certificate'
AND SUBJECT 'CN=secure_admin,O=Company,C=US';

-- Enable multi-factor authentication (MySQL 8.0.27+)
CREATE USER 'mfa_user'@'localhost' IDENTIFIED BY 'FirstP@ssw0rd!'
AND IDENTIFIED WITH authentication_ldap_simple BY 'ldap_password';

-- Password expiration policies
ALTER USER 'app_read_only'@'localhost' PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'analyst'@'%' PASSWORD EXPIRE INTERVAL 30 DAY;

-- Account locking
ALTER USER 'temp_user'@'localhost' ACCOUNT LOCK;
ALTER USER 'temp_user'@'localhost' ACCOUNT UNLOCK;

-- Failed login attempt tracking
ALTER USER 'app_read_write'@'localhost'
FAILED_LOGIN_ATTEMPTS 3
PASSWORD_LOCK_TIME 2;  -- Lock for 2 days after 3 failed attempts
```

### Role-Based Access Control

```sql
-- Create roles for different access levels
CREATE ROLE 'read_only_role';
CREATE ROLE 'data_entry_role';
CREATE ROLE 'analyst_role';
CREATE ROLE 'admin_role';
CREATE ROLE 'backup_role';

-- Grant basic read permissions to read_only_role
GRANT SELECT ON ecommerce.customers TO 'read_only_role';
GRANT SELECT ON ecommerce.orders TO 'read_only_role';
GRANT SELECT ON ecommerce.products TO 'read_only_role';
GRANT SELECT ON ecommerce.categories TO 'read_only_role';

-- Grant data entry permissions
GRANT SELECT, INSERT, UPDATE ON ecommerce.orders TO 'data_entry_role';
GRANT SELECT, INSERT, UPDATE ON ecommerce.order_items TO 'data_entry_role';
GRANT SELECT ON ecommerce.products TO 'data_entry_role';
GRANT SELECT ON ecommerce.customers TO 'data_entry_role';

-- Grant analyst permissions (read + some views)
GRANT 'read_only_role' TO 'analyst_role';
GRANT SELECT ON ecommerce.customer_summary TO 'analyst_role';
GRANT SELECT ON ecommerce.product_performance TO 'analyst_role';
GRANT SELECT ON ecommerce.financial_summary_view TO 'analyst_role';
GRANT EXECUTE ON PROCEDURE ecommerce.GenerateMonthlyReports TO 'analyst_role';

-- Grant admin permissions
GRANT ALL PRIVILEGES ON ecommerce.* TO 'admin_role';
GRANT CREATE USER, RELOAD, PROCESS, SHOW DATABASES ON *.* TO 'admin_role';

-- Grant backup permissions
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON ecommerce.* TO 'backup_role';
GRANT RELOAD, PROCESS ON *.* TO 'backup_role';

-- Assign roles to users
GRANT 'read_only_role' TO 'app_read_only'@'localhost';
GRANT 'data_entry_role' TO 'app_read_write'@'localhost';
GRANT 'analyst_role' TO 'analyst'@'%';
GRANT 'admin_role' TO 'app_admin'@'localhost';
GRANT 'backup_role' TO 'backup_user'@'localhost';

-- Make roles active by default
ALTER USER 'app_read_only'@'localhost' DEFAULT ROLE 'read_only_role';
ALTER USER 'app_read_write'@'localhost' DEFAULT ROLE 'data_entry_role';
ALTER USER 'analyst'@'%' DEFAULT ROLE 'analyst_role';
ALTER USER 'app_admin'@'localhost' DEFAULT ROLE 'admin_role';
ALTER USER 'backup_user'@'localhost' DEFAULT ROLE 'backup_role';

-- View role assignments
SELECT
    FROM_USER as role_name,
    TO_USER as user_name,
    TO_HOST as user_host,
    WITH_ADMIN_OPTION
FROM mysql.role_edges;

-- Check current user privileges
SHOW GRANTS FOR CURRENT_USER();
SHOW GRANTS FOR 'analyst'@'%';
```

## Data Encryption and Protection 🛡️

### Transparent Data Encryption (TDE)

```sql
-- Enable encryption for tablespaces (MySQL 8.0+)
-- First configure encryption in my.cnf:
/*
[mysqld]
early-plugin-load=keyring_file.so
keyring_file_data=/var/lib/mysql-keyring/keyring
innodb_undo_log_encrypt=ON
innodb_redo_log_encrypt=ON
binlog_encryption=ON
*/

-- Create encrypted table
CREATE TABLE sensitive_customer_data (
    customer_id INT PRIMARY KEY,
    ssn VARCHAR(11) ENCRYPTED,
    credit_card VARCHAR(19) ENCRYPTED,
    bank_account VARCHAR(20) ENCRYPTED,
    personal_notes TEXT ENCRYPTED,
    created_at DATETIME,
    updated_at DATETIME
) ENCRYPTION='Y';

-- Create encrypted general tablespace
CREATE TABLESPACE encrypted_space
ADD DATAFILE 'encrypted_space.ibd'
ENCRYPTION = 'Y';

-- Move existing table to encrypted tablespace
ALTER TABLE customers TABLESPACE encrypted_space;

-- Check encryption status
SELECT
    table_schema,
    table_name,
    create_options
FROM information_schema.tables
WHERE create_options LIKE '%ENCRYPTION%';

-- Rotate encryption keys
ALTER INSTANCE ROTATE INNODB MASTER KEY;
```

### Application-Level Encryption

```sql
-- Create functions for data encryption/decryption
DELIMITER //

CREATE FUNCTION EncryptSensitiveData(
    data_to_encrypt TEXT,
    encryption_key VARCHAR(32)
)
RETURNS TEXT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE encrypted_data TEXT;

    -- Use AES encryption with 256-bit key
    SET encrypted_data = TO_BASE64(AES_ENCRYPT(data_to_encrypt, encryption_key));

    RETURN encrypted_data;
END //

CREATE FUNCTION DecryptSensitiveData(
    encrypted_data TEXT,
    decryption_key VARCHAR(32)
)
RETURNS TEXT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE decrypted_data TEXT;

    -- Decrypt the data
    SET decrypted_data = AES_DECRYPT(FROM_BASE64(encrypted_data), decryption_key);

    RETURN decrypted_data;
END //

DELIMITER ;

-- Create table with encrypted columns
CREATE TABLE customer_secure_data (
    customer_id INT PRIMARY KEY,
    encrypted_ssn TEXT,
    encrypted_credit_card TEXT,
    encrypted_notes TEXT,
    encryption_key_id INT,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
    INDEX idx_key_id (encryption_key_id)
);

-- Key management table
CREATE TABLE encryption_keys (
    key_id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(50),
    key_hash VARCHAR(64),  -- Store hash, not actual key
    created_at DATETIME DEFAULT NOW(),
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_active (is_active, expires_at)
);

-- Procedures for secure data operations
DELIMITER //

CREATE PROCEDURE InsertSecureCustomerData(
    IN customer_id_param INT,
    IN ssn_param VARCHAR(11),
    IN credit_card_param VARCHAR(19),
    IN notes_param TEXT,
    IN encryption_key_param VARCHAR(32)
)
BEGIN
    DECLARE key_id_var INT;

    -- Get or create key ID (simplified - in production, use proper key management)
    SELECT key_id INTO key_id_var
    FROM encryption_keys
    WHERE key_hash = SHA2(encryption_key_param, 256)
      AND is_active = TRUE
    LIMIT 1;

    IF key_id_var IS NULL THEN
        INSERT INTO encryption_keys (key_name, key_hash)
        VALUES ('AUTO_GENERATED', SHA2(encryption_key_param, 256));
        SET key_id_var = LAST_INSERT_ID();
    END IF;

    -- Insert encrypted data
    INSERT INTO customer_secure_data (
        customer_id,
        encrypted_ssn,
        encrypted_credit_card,
        encrypted_notes,
        encryption_key_id
    ) VALUES (
        customer_id_param,
        EncryptSensitiveData(ssn_param, encryption_key_param),
        EncryptSensitiveData(credit_card_param, encryption_key_param),
        EncryptSensitiveData(notes_param, encryption_key_param),
        key_id_var
    );
END //

CREATE PROCEDURE GetSecureCustomerData(
    IN customer_id_param INT,
    IN decryption_key_param VARCHAR(32)
)
BEGIN
    -- Verify key matches
    IF EXISTS (
        SELECT 1 FROM customer_secure_data csd
        JOIN encryption_keys ek ON csd.encryption_key_id = ek.key_id
        WHERE csd.customer_id = customer_id_param
          AND ek.key_hash = SHA2(decryption_key_param, 256)
          AND ek.is_active = TRUE
    ) THEN
        -- Return decrypted data
        SELECT
            customer_id,
            DecryptSensitiveData(encrypted_ssn, decryption_key_param) as ssn,
            DecryptSensitiveData(encrypted_credit_card, decryption_key_param) as credit_card,
            DecryptSensitiveData(encrypted_notes, decryption_key_param) as notes,
            created_at,
            updated_at
        FROM customer_secure_data
        WHERE customer_id = customer_id_param;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid decryption key or customer not found';
    END IF;
END //

DELIMITER ;

-- Test encryption functions
SET @encryption_key = 'MySecureEncryptionKey123456789!';
CALL InsertSecureCustomerData(1, '123-45-6789', '4532-1234-5678-9012', 'VIP customer with special requirements', @encryption_key);
CALL GetSecureCustomerData(1, @encryption_key);
```

## Access Control and Privileges 🔑

### Granular Privilege Management

```sql
-- Database-level privileges
GRANT CREATE, ALTER, INDEX ON ecommerce.* TO 'app_admin'@'localhost';
GRANT CREATE TEMPORARY TABLES ON ecommerce.* TO 'data_entry_role';

-- Table-level privileges with column restrictions
GRANT SELECT (customer_id, first_name, last_name, email, city, country)
ON ecommerce.customers TO 'customer_service'@'%';

GRANT UPDATE (email, phone, city, country)
ON ecommerce.customers TO 'customer_service'@'%';

-- View-based security
CREATE VIEW customer_service_safe_view AS
SELECT
    customer_id,
    first_name,
    last_name,
    CONCAT(LEFT(email, 3), '***@', SUBSTRING_INDEX(email, '@', -1)) as masked_email,
    city,
    country,
    created_at
FROM customers;

GRANT SELECT ON ecommerce.customer_service_safe_view TO 'customer_service'@'%';

-- Stored procedure privileges
GRANT EXECUTE ON PROCEDURE ecommerce.GetCustomerOrderSummary TO 'customer_service'@'%';
GRANT EXECUTE ON FUNCTION ecommerce.GetCustomerLoyaltyLevel TO 'analyst_role';

-- Row-level security simulation (MySQL doesn't have native RLS)
CREATE VIEW customer_orders_filtered AS
SELECT
    o.order_id,
    o.customer_id,
    o.order_date,
    o.total_amount,
    o.status
FROM orders o
WHERE o.customer_id = @current_customer_id;

-- Procedure to set security context
DELIMITER //

CREATE PROCEDURE SetSecurityContext(IN customer_id_param INT)
BEGIN
    SET @current_customer_id = customer_id_param;
    SET @security_context_set = NOW();
END //

DELIMITER ;

-- Dynamic privilege checking
DELIMITER //

CREATE PROCEDURE CheckUserPrivileges(IN username_param VARCHAR(100))
BEGIN
    SELECT
        grantee,
        table_schema,
        table_name,
        privilege_type,
        is_grantable
    FROM information_schema.table_privileges
    WHERE grantee LIKE CONCAT('%', username_param, '%')
    ORDER BY table_schema, table_name, privilege_type;

    SELECT
        grantee,
        privilege_type,
        is_grantable
    FROM information_schema.user_privileges
    WHERE grantee LIKE CONCAT('%', username_param, '%')
    ORDER BY privilege_type;
END //

DELIMITER ;

-- Execute privilege check
CALL CheckUserPrivileges('analyst');
```

### Security Policy Implementation

```sql
-- Create security policy table
CREATE TABLE security_policies (
    policy_id INT PRIMARY KEY AUTO_INCREMENT,
    policy_name VARCHAR(100),
    policy_type ENUM('PASSWORD', 'ACCESS', 'ENCRYPTION', 'AUDIT'),
    policy_rules JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);

-- Insert security policies
INSERT INTO security_policies (policy_name, policy_type, policy_rules) VALUES
('Password Policy', 'PASSWORD', JSON_OBJECT(
    'min_length', 12,
    'require_uppercase', true,
    'require_lowercase', true,
    'require_numbers', true,
    'require_special', true,
    'expiry_days', 90,
    'history_count', 5
)),
('Access Control Policy', 'ACCESS', JSON_OBJECT(
    'max_failed_attempts', 3,
    'lockout_duration_minutes', 30,
    'require_ssl', true,
    'allowed_hours', '06:00-22:00',
    'allowed_ips', ['192.168.1.0/24', '10.0.0.0/8']
)),
('Data Encryption Policy', 'ENCRYPTION', JSON_OBJECT(
    'encrypt_sensitive_tables', true,
    'encryption_algorithm', 'AES-256',
    'key_rotation_days', 30,
    'encrypt_backups', true
)),
('Audit Policy', 'AUDIT', JSON_OBJECT(
    'audit_logins', true,
    'audit_data_changes', true,
    'audit_privilege_changes', true,
    'retention_days', 365
));

-- Security compliance check procedure
DELIMITER //

CREATE PROCEDURE CheckSecurityCompliance()
BEGIN
    -- Check password policies
    SELECT
        'Password Compliance' as check_category,
        user,
        host,
        CASE
            WHEN password_last_changed < DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 'PASSWORD_EXPIRED'
            WHEN account_locked = 'Y' THEN 'ACCOUNT_LOCKED'
            WHEN password_expired = 'Y' THEN 'PASSWORD_EXPIRED'
            ELSE 'COMPLIANT'
        END as compliance_status
    FROM mysql.user
    WHERE user NOT IN ('root', 'mysql.session', 'mysql.sys');

    -- Check SSL usage
    SELECT
        'SSL Compliance' as check_category,
        user,
        host,
        ssl_type,
        CASE
            WHEN ssl_type = '' THEN 'SSL_NOT_REQUIRED'
            WHEN ssl_type IS NOT NULL THEN 'SSL_REQUIRED'
            ELSE 'UNKNOWN'
        END as ssl_status
    FROM mysql.user
    WHERE user NOT IN ('root', 'mysql.session', 'mysql.sys');

    -- Check encryption status
    SELECT
        'Encryption Compliance' as check_category,
        table_schema,
        table_name,
        CASE
            WHEN create_options LIKE '%ENCRYPTION%' THEN 'ENCRYPTED'
            ELSE 'NOT_ENCRYPTED'
        END as encryption_status
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE';

END //

DELIMITER ;

-- Run compliance check
CALL CheckSecurityCompliance();
```

## Auditing and Logging 📋

### Comprehensive Audit System

```sql
-- Create audit tables
CREATE TABLE audit_login_attempts (
    audit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100),
    host VARCHAR(255),
    connection_id BIGINT,
    login_time DATETIME,
    login_success BOOLEAN,
    failure_reason VARCHAR(200),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    INDEX idx_audit_login_time (login_time),
    INDEX idx_audit_login_user (username, login_time),
    INDEX idx_audit_login_success (login_success, login_time)
);

CREATE TABLE audit_data_changes (
    audit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(64),
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE'),
    primary_key_value VARCHAR(100),
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(100),
    changed_at DATETIME,
    connection_id BIGINT,
    query_text TEXT,
    INDEX idx_audit_data_table_time (table_name, changed_at),
    INDEX idx_audit_data_user_time (changed_by, changed_at)
);

CREATE TABLE audit_privilege_changes (
    audit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    target_user VARCHAR(100),
    target_host VARCHAR(255),
    privilege_type VARCHAR(50),
    privilege_level VARCHAR(50),
    operation_type ENUM('GRANT', 'REVOKE'),
    granted_by VARCHAR(100),
    granted_at DATETIME,
    privilege_details JSON,
    INDEX idx_audit_priv_user (target_user, granted_at),
    INDEX idx_audit_priv_type (privilege_type, granted_at)
);

-- Enhanced audit triggers for sensitive tables
DELIMITER //

CREATE TRIGGER trg_audit_customer_changes
    AFTER UPDATE ON customers
    FOR EACH ROW
BEGIN
    INSERT INTO audit_data_changes (
        table_name,
        operation_type,
        primary_key_value,
        old_values,
        new_values,
        changed_by,
        changed_at,
        connection_id
    ) VALUES (
        'customers',
        'UPDATE',
        OLD.customer_id,
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

-- Audit analysis procedures
DELIMITER //

CREATE PROCEDURE GenerateAuditReport(
    IN start_date DATE,
    IN end_date DATE,
    IN report_type VARCHAR(20)
)
BEGIN
    CASE report_type
        WHEN 'LOGIN_SUMMARY' THEN
            SELECT
                DATE(login_time) as login_date,
                COUNT(*) as total_attempts,
                SUM(CASE WHEN login_success THEN 1 ELSE 0 END) as successful_logins,
                SUM(CASE WHEN NOT login_success THEN 1 ELSE 0 END) as failed_logins,
                COUNT(DISTINCT username) as unique_users,
                COUNT(DISTINCT ip_address) as unique_ips
            FROM audit_login_attempts
            WHERE DATE(login_time) BETWEEN start_date AND end_date
            GROUP BY DATE(login_time)
            ORDER BY login_date;

        WHEN 'DATA_CHANGES' THEN
            SELECT
                table_name,
                operation_type,
                COUNT(*) as change_count,
                COUNT(DISTINCT changed_by) as unique_users,
                MIN(changed_at) as first_change,
                MAX(changed_at) as last_change
            FROM audit_data_changes
            WHERE DATE(changed_at) BETWEEN start_date AND end_date
            GROUP BY table_name, operation_type
            ORDER BY table_name, operation_type;

        WHEN 'PRIVILEGE_CHANGES' THEN
            SELECT
                target_user,
                privilege_type,
                operation_type,
                COUNT(*) as change_count,
                granted_by,
                MAX(granted_at) as last_change
            FROM audit_privilege_changes
            WHERE DATE(granted_at) BETWEEN start_date AND end_date
            GROUP BY target_user, privilege_type, operation_type, granted_by
            ORDER BY last_change DESC;

        WHEN 'SECURITY_ALERTS' THEN
            -- Failed login attempts
            SELECT
                'FAILED_LOGINS' as alert_type,
                username,
                ip_address,
                COUNT(*) as attempt_count,
                MAX(login_time) as last_attempt
            FROM audit_login_attempts
            WHERE DATE(login_time) BETWEEN start_date AND end_date
              AND login_success = FALSE
            GROUP BY username, ip_address
            HAVING COUNT(*) >= 3
            ORDER BY attempt_count DESC;

        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid report type';
    END CASE;
END //

DELIMITER ;

-- Generate audit reports
CALL GenerateAuditReport('2024-08-01', '2024-08-31', 'LOGIN_SUMMARY');
CALL GenerateAuditReport('2024-08-01', '2024-08-31', 'DATA_CHANGES');
CALL GenerateAuditReport('2024-08-01', '2024-08-31', 'SECURITY_ALERTS');
```

### Performance Schema Security Monitoring

```sql
-- Monitor suspicious query patterns
CREATE VIEW security_query_analysis AS
SELECT
    digest_text,
    count_star as execution_count,
    sum_rows_examined,
    sum_rows_sent,
    ROUND(avg_timer_wait/1000000000000, 6) as avg_execution_time,
    first_seen,
    last_seen,
    CASE
        WHEN digest_text LIKE '%UNION%' AND digest_text LIKE '%SELECT%' THEN 'POTENTIAL_SQL_INJECTION'
        WHEN sum_rows_examined > 100000 AND sum_rows_sent < 100 THEN 'SUSPICIOUS_DATA_SCAN'
        WHEN digest_text LIKE '%mysql.user%' THEN 'USER_TABLE_ACCESS'
        WHEN digest_text LIKE '%INFORMATION_SCHEMA%' THEN 'SCHEMA_RECONNAISSANCE'
        ELSE 'NORMAL'
    END as security_classification
FROM performance_schema.events_statements_summary_by_digest
WHERE digest_text IS NOT NULL
  AND count_star > 0
ORDER BY
    CASE
        WHEN digest_text LIKE '%UNION%' AND digest_text LIKE '%SELECT%' THEN 1
        WHEN sum_rows_examined > 100000 AND sum_rows_sent < 100 THEN 2
        WHEN digest_text LIKE '%mysql.user%' THEN 3
        ELSE 4
    END,
    count_star DESC;

-- Security monitoring procedure
DELIMITER //

CREATE PROCEDURE MonitorSecurityThreats()
BEGIN
    -- Create security alerts table
    CREATE TABLE IF NOT EXISTS security_alerts (
        alert_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        alert_type VARCHAR(50),
        alert_severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        alert_message TEXT,
        alert_details JSON,
        created_at DATETIME DEFAULT NOW(),
        resolved_at DATETIME NULL,
        INDEX idx_security_alerts_type (alert_type, created_at),
        INDEX idx_security_alerts_severity (alert_severity, resolved_at)
    );

    -- Check for suspicious queries
    INSERT INTO security_alerts (alert_type, alert_severity, alert_message, alert_details)
    SELECT
        'SUSPICIOUS_QUERY',
        CASE
            WHEN security_classification = 'POTENTIAL_SQL_INJECTION' THEN 'CRITICAL'
            WHEN security_classification = 'USER_TABLE_ACCESS' THEN 'HIGH'
            WHEN security_classification = 'SUSPICIOUS_DATA_SCAN' THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        CONCAT('Suspicious query pattern detected: ', security_classification),
        JSON_OBJECT(
            'query_pattern', LEFT(digest_text, 200),
            'execution_count', execution_count,
            'classification', security_classification,
            'last_seen', last_seen
        )
    FROM security_query_analysis
    WHERE security_classification != 'NORMAL'
      AND last_seen > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      AND NOT EXISTS (
          SELECT 1 FROM security_alerts sa
          WHERE sa.alert_type = 'SUSPICIOUS_QUERY'
            AND sa.created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            AND JSON_EXTRACT(sa.alert_details, '$.query_pattern') = LEFT(digest_text, 200)
      );

    -- Check for multiple failed connections
    INSERT INTO security_alerts (alert_type, alert_severity, alert_message, alert_details)
    SELECT
        'MULTIPLE_FAILED_CONNECTIONS',
        'HIGH',
        CONCAT('Multiple failed connection attempts detected'),
        JSON_OBJECT(
            'failed_connections', SUM(CASE WHEN VARIABLE_NAME = 'Aborted_connects' THEN VARIABLE_VALUE END),
            'total_connections', SUM(CASE WHEN VARIABLE_NAME = 'Connections' THEN VARIABLE_VALUE END)
        )
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME IN ('Aborted_connects', 'Connections')
    HAVING SUM(CASE WHEN VARIABLE_NAME = 'Aborted_connects' THEN VARIABLE_VALUE END) > 100
      AND NOT EXISTS (
          SELECT 1 FROM security_alerts sa
          WHERE sa.alert_type = 'MULTIPLE_FAILED_CONNECTIONS'
            AND sa.created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      );

    -- Return current unresolved alerts
    SELECT
        alert_type,
        alert_severity,
        alert_message,
        alert_details,
        created_at,
        TIMESTAMPDIFF(MINUTE, created_at, NOW()) as minutes_ago
    FROM security_alerts
    WHERE resolved_at IS NULL
    ORDER BY
        CASE alert_severity
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            ELSE 4
        END,
        created_at DESC;

END //

DELIMITER ;

-- Run security monitoring
CALL MonitorSecurityThreats();
```

## Data Masking and Privacy 🎭

### Dynamic Data Masking

```sql
-- Create data masking functions
DELIMITER //

CREATE FUNCTION MaskEmail(email_address VARCHAR(255))
RETURNS VARCHAR(255)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE masked_email VARCHAR(255);
    DECLARE at_position INT;
    DECLARE domain_part VARCHAR(100);

    SET at_position = LOCATE('@', email_address);

    IF at_position > 0 THEN
        SET domain_part = SUBSTRING(email_address, at_position);
        SET masked_email = CONCAT(
            LEFT(email_address, 3),
            REPEAT('*', at_position - 4),
            domain_part
        );
    ELSE
        SET masked_email = CONCAT(LEFT(email_address, 3), REPEAT('*', LENGTH(email_address) - 3));
    END IF;

    RETURN masked_email;
END //

CREATE FUNCTION MaskCreditCard(card_number VARCHAR(19))
RETURNS VARCHAR(19)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE masked_card VARCHAR(19);

    -- Show only last 4 digits
    SET masked_card = CONCAT(
        REPEAT('*', LENGTH(card_number) - 4),
        RIGHT(card_number, 4)
    );

    RETURN masked_card;
END //

CREATE FUNCTION MaskSSN(ssn VARCHAR(11))
RETURNS VARCHAR(11)
READS SQL DATA
DETERMINISTIC
BEGIN
    -- Show only last 4 digits in format ***-**-1234
    RETURN CONCAT('***-**-', RIGHT(ssn, 4));
END //

DELIMITER ;

-- Create masked views for different user roles
CREATE VIEW customer_data_masked AS
SELECT
    customer_id,
    CASE
        WHEN USER() LIKE '%admin%' THEN first_name
        ELSE CONCAT(LEFT(first_name, 1), REPEAT('*', LENGTH(first_name) - 1))
    END as first_name,
    CASE
        WHEN USER() LIKE '%admin%' THEN last_name
        ELSE CONCAT(LEFT(last_name, 1), REPEAT('*', LENGTH(last_name) - 1))
    END as last_name,
    CASE
        WHEN USER() LIKE '%admin%' OR USER() LIKE '%customer_service%' THEN email
        ELSE MaskEmail(email)
    END as email,
    city,
    country,
    created_at
FROM customers;

-- Role-based data access procedure
DELIMITER //

CREATE PROCEDURE GetCustomerDataByRole(
    IN customer_id_param INT,
    IN requesting_user VARCHAR(100)
)
BEGIN
    DECLARE user_role VARCHAR(50);

    -- Determine user role based on granted roles
    SELECT
        COALESCE(
            CASE
                WHEN requesting_user LIKE '%admin%' THEN 'ADMIN'
                WHEN requesting_user LIKE '%customer_service%' THEN 'CUSTOMER_SERVICE'
                WHEN requesting_user LIKE '%analyst%' THEN 'ANALYST'
                ELSE 'READ_only_role'
            END,
            'BASIC'
        ) INTO user_role;

    -- Return data based on role
    CASE user_role
        WHEN 'ADMIN' THEN
            -- Full access to all data
            SELECT
                customer_id,
                first_name,
                last_name,
                email,
                phone,
                city,
                country,
                created_at,
                updated_at
            FROM customers
            WHERE customer_id = customer_id_param;

        WHEN 'CUSTOMER_SERVICE' THEN
            -- Masked sensitive data
            SELECT
                customer_id,
                first_name,
                last_name,
                email,
                CASE
                    WHEN phone IS NOT NULL THEN CONCAT('***-***-', RIGHT(phone, 4))
                    ELSE NULL
                END as phone,
                city,
                country,
                created_at
            FROM customers
            WHERE customer_id = customer_id_param;

        WHEN 'ANALYST' THEN
            -- Heavily masked data for analysis
            SELECT
                customer_id,
                'MASKED' as first_name,
                'MASKED' as last_name,
                MaskEmail(email) as email,
                NULL as phone,
                city,
                country,
                created_at
            FROM customers
            WHERE customer_id = customer_id_param;

        ELSE
            -- Basic information only
            SELECT
                customer_id,
                'RESTRICTED' as first_name,
                'RESTRICTED' as last_name,
                'RESTRICTED' as email,
                city,
                country
            FROM customers
            WHERE customer_id = customer_id_param;
    END CASE;

END //

DELIMITER ;

-- Test data masking
CALL GetCustomerDataByRole(1, 'admin@company.com');
CALL GetCustomerDataByRole(1, 'support@company.com');
CALL GetCustomerDataByRole(1, 'analyst@company.com');
```

### Data Anonymization for Testing

```sql
-- Create anonymized data for testing environments
DELIMITER //

CREATE PROCEDURE CreateAnonymizedTestData()
BEGIN
    -- Create anonymized customer table
    DROP TABLE IF EXISTS customers_test;
    CREATE TABLE customers_test AS
    SELECT
        customer_id,
        CONCAT('TestUser', customer_id) as first_name,
        CONCAT('LastName', customer_id) as last_name,
        CONCAT('test.user', customer_id, '@example.com') as email,
        CONCAT('555-0', LPAD(customer_id, 3, '0')) as phone,
        city,
        country,
        created_at,
        updated_at
    FROM customers;

    -- Create anonymized order data with realistic patterns
    DROP TABLE IF EXISTS orders_test;
    CREATE TABLE orders_test AS
    SELECT
        order_id,
        customer_id,
        order_date,
        -- Randomize amounts while maintaining realistic patterns
        ROUND(total_amount * (0.8 + RAND() * 0.4), 2) as total_amount,
        status,
        created_at,
        updated_at
    FROM orders;

    -- Create log of anonymization
    INSERT INTO system_log (log_type, log_message, log_date)
    VALUES ('ANONYMIZATION', 'Test data anonymization completed', NOW());

    SELECT 'Anonymized test data created successfully' as result;

END //

DELIMITER ;

-- Data retention and cleanup procedures
DELIMITER //

CREATE PROCEDURE CleanupOldAuditData(IN retention_days INT)
BEGIN
    DECLARE deleted_login_records INT DEFAULT 0;
    DECLARE deleted_data_records INT DEFAULT 0;
    DECLARE deleted_privilege_records INT DEFAULT 0;

    -- Clean up old login audit records
    DELETE FROM audit_login_attempts
    WHERE login_time < DATE_SUB(NOW(), INTERVAL retention_days DAY);
    SET deleted_login_records = ROW_COUNT();

    -- Clean up old data change audit records
    DELETE FROM audit_data_changes
    WHERE changed_at < DATE_SUB(NOW(), INTERVAL retention_days DAY);
    SET deleted_data_records = ROW_COUNT();

    -- Clean up old privilege change audit records
    DELETE FROM audit_privilege_changes
    WHERE granted_at < DATE_SUB(NOW(), INTERVAL retention_days DAY);
    SET deleted_privilege_records = ROW_COUNT();

    -- Log cleanup activity
    INSERT INTO system_log (log_type, log_message, log_date)
    VALUES (
        'AUDIT_CLEANUP',
        CONCAT('Cleaned up audit data: ', deleted_login_records, ' login records, ',
               deleted_data_records, ' data change records, ',
               deleted_privilege_records, ' privilege change records'),
        NOW()
    );

    SELECT
        deleted_login_records,
        deleted_data_records,
        deleted_privilege_records,
        'Audit cleanup completed' as status;

END //

DELIMITER ;

-- Schedule cleanup (retain audit data for 1 year)
CALL CleanupOldAuditData(365);
```

## Practice Exercises 💪

### Exercise 1: Complete Security Implementation

```sql
-- 1. Design a comprehensive user management system
-- 2. Implement role-based access control for all tables
-- 3. Create encrypted storage for sensitive data
-- 4. Build audit trails for all data access
-- 5. Implement data masking for different user roles
```

### Exercise 2: Security Monitoring System

```sql
-- 1. Create real-time security threat detection
-- 2. Implement automated alerting for suspicious activities
-- 3. Build security compliance reporting
-- 4. Design incident response procedures
-- 5. Create security metrics dashboard
```

### Exercise 3: Data Privacy Compliance

```sql
-- 1. Implement GDPR/CCPA compliance features
-- 2. Create data anonymization procedures
-- 3. Build data retention and deletion policies
-- 4. Implement consent management
-- 5. Create privacy impact assessment tools
```

## Security Best Practices 🛡️

### Security Checklist

```sql
-- Security configuration validation
DELIMITER //

CREATE PROCEDURE ValidateSecurityConfiguration()
BEGIN
    CREATE TEMPORARY TABLE security_checklist (
        check_item VARCHAR(100),
        status ENUM('PASS', 'FAIL', 'WARNING'),
        details TEXT
    );

    -- Check for default users
    INSERT INTO security_checklist
    SELECT
        'Default Users Check',
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
        CONCAT('Found ', COUNT(*), ' users with default/weak passwords')
    FROM mysql.user
    WHERE (user = 'root' AND host != 'localhost')
       OR (user = '' OR password = '');

    -- Check SSL configuration
    INSERT INTO security_checklist
    SELECT
        'SSL Configuration',
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'WARNING' END,
        CONCAT(COUNT(*), ' users require SSL')
    FROM mysql.user
    WHERE ssl_type != '';

    -- Check for overprivileged users
    INSERT INTO security_checklist
    SELECT
        'Privilege Check',
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'WARNING' END,
        CONCAT(COUNT(*), ' users have ALL PRIVILEGES')
    FROM mysql.user
    WHERE Select_priv = 'Y' AND Insert_priv = 'Y' AND Update_priv = 'Y'
      AND Delete_priv = 'Y' AND Create_priv = 'Y' AND Drop_priv = 'Y'
      AND user NOT IN ('root');

    -- Check password expiration
    INSERT INTO security_checklist
    SELECT
        'Password Expiration',
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'WARNING' END,
        CONCAT(COUNT(*), ' users have expired passwords')
    FROM mysql.user
    WHERE password_expired = 'Y';

    SELECT * FROM security_checklist;

END //

DELIMITER ;

-- Run security validation
CALL ValidateSecurityConfiguration();
```

## Next Steps ➡️

You've mastered database security and user management! These skills are essential for protecting sensitive data and ensuring compliance with security regulations. Next, we'll explore Database Administration and Maintenance for complete database management expertise.

---

## Quick Reference 📚

### User Management Commands

```sql
-- Create user with strong authentication
CREATE USER 'username'@'host' IDENTIFIED BY 'strong_password';

-- Grant role-based privileges
CREATE ROLE 'role_name';
GRANT privileges ON database.* TO 'role_name';
GRANT 'role_name' TO 'username'@'host';

-- SSL requirement
ALTER USER 'username'@'host' REQUIRE SSL;

-- Password policies
ALTER USER 'username'@'host' PASSWORD EXPIRE INTERVAL 90 DAY;
```

### Security Best Practices

-   ✅ **Principle of Least Privilege**: Grant minimum required permissions
-   ✅ **Strong Authentication**: Use complex passwords and SSL/TLS
-   ✅ **Regular Auditing**: Monitor all data access and changes
-   ✅ **Data Encryption**: Encrypt sensitive data at rest and in transit
-   ✅ **Access Control**: Implement role-based access control
-   ✅ **Monitoring**: Set up real-time security threat detection
-   ✅ **Compliance**: Follow regulatory requirements (GDPR, CCPA, etc.)
