# SQL Data Types and Constraints

## Understanding Data Types 📊

Data types define what kind of data can be stored in each column. Choosing the right data type is crucial for:

-   **Storage efficiency**: Saves disk space and memory
-   **Performance**: Faster queries and operations
-   **Data integrity**: Prevents invalid data entry
-   **Application compatibility**: Ensures proper data handling

## Numeric Data Types 🔢

### Integer Types

```sql
-- TINYINT: 1 byte (-128 to 127, or 0 to 255 unsigned)
CREATE TABLE settings (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    is_enabled TINYINT(1)  -- Often used for boolean (0/1)
);

-- SMALLINT: 2 bytes (-32,768 to 32,767, or 0 to 65,535 unsigned)
CREATE TABLE departments (
    dept_id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

-- MEDIUMINT: 3 bytes (-8,388,608 to 8,388,607)
CREATE TABLE inventory (
    item_id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quantity MEDIUMINT
);

-- INT/INTEGER: 4 bytes (-2,147,483,648 to 2,147,483,647)
CREATE TABLE customers (
    customer_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    total_orders INT DEFAULT 0
);

-- BIGINT: 8 bytes (very large numbers)
CREATE TABLE transactions (
    transaction_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    amount_cents BIGINT  -- Store money in cents to avoid decimals
);
```

### Decimal/Fixed-Point Types

```sql
-- DECIMAL(precision, scale) - Exact numeric values
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    price DECIMAL(10,2),        -- Up to 99,999,999.99
    weight_kg DECIMAL(5,3),     -- Up to 99.999 kg
    discount_rate DECIMAL(3,2)  -- Up to 9.99 (percentage)
);

-- NUMERIC - Same as DECIMAL
CREATE TABLE financial_data (
    id INT PRIMARY KEY,
    revenue NUMERIC(15,2),      -- Large financial amounts
    tax_rate NUMERIC(4,4)       -- 0.0000 to 9.9999
);
```

### Floating-Point Types

```sql
-- FLOAT: 4 bytes, single precision
CREATE TABLE measurements (
    id INT PRIMARY KEY,
    temperature FLOAT,          -- Approximate values OK
    pressure FLOAT(7,4)         -- 7 digits total, 4 after decimal
);

-- DOUBLE/REAL: 8 bytes, double precision
CREATE TABLE scientific_data (
    id INT PRIMARY KEY,
    calculation_result DOUBLE,   -- High precision needed
    pi_approximation REAL       -- Alternative to DOUBLE
);
```

### When to Use Each Numeric Type

```sql
-- Use cases and examples
CREATE TABLE examples (
    -- Counters, IDs, quantities
    user_id INT UNSIGNED,
    page_views BIGINT UNSIGNED,
    stock_count SMALLINT,

    -- Money (always use DECIMAL)
    price DECIMAL(10,2),
    tax_amount DECIMAL(8,2),

    -- Percentages
    discount_percent DECIMAL(5,2),  -- 999.99%

    -- Measurements (when precision matters)
    product_weight DECIMAL(8,3),    -- 99999.999 kg

    -- Scientific calculations (approximation OK)
    temperature FLOAT,
    mathematical_result DOUBLE
);
```

## String Data Types 📝

### Fixed vs Variable Length

```sql
-- CHAR(n): Fixed length, padded with spaces
CREATE TABLE country_codes (
    code CHAR(2) PRIMARY KEY,        -- Always 2 characters: 'US', 'UK'
    name VARCHAR(100)
);

-- VARCHAR(n): Variable length, no padding
CREATE TABLE users (
    username VARCHAR(50),            -- Up to 50 characters
    email VARCHAR(255),              -- Email addresses
    first_name VARCHAR(100),         -- Names vary in length
    last_name VARCHAR(100)
);
```

### Text Types for Large Content

```sql
-- TEXT types for large text data
CREATE TABLE articles (
    id INT PRIMARY KEY,
    title VARCHAR(200),              -- Short titles
    summary TEXT,                    -- Medium text (65,535 chars)
    content LONGTEXT,                -- Large articles (4GB)
    tags VARCHAR(500)                -- Comma-separated tags
);

-- Different TEXT sizes
CREATE TABLE content_examples (
    id INT PRIMARY KEY,
    short_desc TINYTEXT,             -- 255 characters
    description TEXT,                -- 65,535 characters
    full_content MEDIUMTEXT,         -- 16,777,215 characters
    book_content LONGTEXT            -- 4,294,967,295 characters
);
```

### Binary Data Types

```sql
-- Binary data storage
CREATE TABLE file_storage (
    id INT PRIMARY KEY,
    filename VARCHAR(255),
    file_data LONGBLOB,              -- Binary files
    file_hash BINARY(32),            -- Fixed binary (SHA-256)
    thumbnail VARBINARY(8000)        -- Variable binary
);
```

### String Type Guidelines

```sql
-- Best practices for string types
CREATE TABLE user_profiles (
    id INT PRIMARY KEY,

    -- Use CHAR for fixed-length codes
    country_code CHAR(2),            -- ISO country codes
    currency_code CHAR(3),           -- ISO currency codes

    -- Use VARCHAR for variable text
    username VARCHAR(50),            -- Usernames
    email VARCHAR(320),              -- Max email length per RFC
    phone VARCHAR(20),               -- International phone formats

    -- Use TEXT for long content
    bio TEXT,                        -- User biography
    preferences JSON                 -- JSON data (MySQL 5.7+)
);
```

## Date and Time Data Types 📅

### Basic Date/Time Types

```sql
-- Date and time storage
CREATE TABLE events (
    id INT PRIMARY KEY,

    -- DATE: YYYY-MM-DD (1000-01-01 to 9999-12-31)
    event_date DATE,

    -- TIME: HH:MM:SS (-838:59:59 to 838:59:59)
    start_time TIME,
    duration TIME,

    -- DATETIME: YYYY-MM-DD HH:MM:SS (no timezone)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- TIMESTAMP: YYYY-MM-DD HH:MM:SS (with timezone awareness)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- YEAR: YYYY (1901 to 2155)
    year_established YEAR
);
```

### Working with Timezones

```sql
-- Timezone considerations
CREATE TABLE global_events (
    id INT PRIMARY KEY,
    event_name VARCHAR(200),

    -- Store in UTC, convert for display
    event_datetime_utc DATETIME,

    -- Or use TIMESTAMP (automatically converts)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Store timezone separately if needed
    timezone VARCHAR(50)             -- 'America/New_York', 'Europe/London'
);
```

### Date/Time Examples and Usage

```sql
-- Practical examples
CREATE TABLE user_activity (
    id INT PRIMARY KEY,
    user_id INT,

    -- Just the date
    login_date DATE,                 -- '2024-08-11'

    -- Date and time without timezone
    login_datetime DATETIME,         -- '2024-08-11 14:30:15'

    -- Timestamp with automatic timezone handling
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Time duration
    session_duration TIME,           -- '02:45:30' (2 hours, 45 minutes)

    -- Birth year only
    birth_year YEAR                  -- 1995
);

-- Insert examples
INSERT INTO user_activity (user_id, login_date, login_datetime, session_duration, birth_year)
VALUES (
    1,
    '2024-08-11',                    -- DATE
    '2024-08-11 14:30:15',          -- DATETIME
    '02:45:30',                      -- TIME (duration)
    1995                             -- YEAR
);
```

## Boolean and Bit Data Types ✅

### Boolean Data

```sql
-- Boolean storage options
CREATE TABLE user_settings (
    id INT PRIMARY KEY,

    -- Method 1: BOOLEAN/BOOL (MySQL stores as TINYINT)
    is_active BOOLEAN DEFAULT TRUE,
    email_notifications BOOL DEFAULT FALSE,

    -- Method 2: TINYINT explicitly
    is_premium TINYINT(1) DEFAULT 0,      -- 0 = false, 1 = true

    -- Method 3: ENUM for clarity
    account_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',

    -- Method 4: BIT type
    feature_flags BIT(8) DEFAULT b'00000000'  -- 8 boolean flags in one field
);

-- Working with boolean values
INSERT INTO user_settings (is_active, email_notifications, is_premium)
VALUES (TRUE, FALSE, 1);

-- Querying boolean values
SELECT * FROM user_settings WHERE is_active = TRUE;
SELECT * FROM user_settings WHERE is_premium;  -- Implicit TRUE check
```

## JSON and XML Data Types 📄

### JSON Data Type (MySQL 5.7+, PostgreSQL 9.2+)

```sql
-- Storing structured data as JSON
CREATE TABLE user_profiles (
    id INT PRIMARY KEY,
    username VARCHAR(50),

    -- JSON for flexible attributes
    preferences JSON,
    metadata JSON,

    -- Traditional approach (alternative)
    settings_json TEXT  -- Store JSON as text in older versions
);

-- Insert JSON data
INSERT INTO user_profiles (username, preferences, metadata) VALUES (
    'john_doe',
    '{"theme": "dark", "language": "en", "notifications": {"email": true, "push": false}}',
    '{"last_login": "2024-08-11T14:30:00Z", "login_count": 42}'
);

-- Query JSON data
SELECT username,
       JSON_EXTRACT(preferences, '$.theme') AS theme,
       JSON_EXTRACT(preferences, '$.notifications.email') AS email_notifications
FROM user_profiles;

-- Using JSON path operators (MySQL 5.7+)
SELECT username,
       preferences->'$.theme' AS theme,
       preferences->'$.notifications.email' AS email_notifications
FROM user_profiles;
```

### XML Data Type (SQL Server, PostgreSQL)

```sql
-- SQL Server XML example
CREATE TABLE documents (
    id INT PRIMARY KEY,
    title VARCHAR(200),
    content XML
);

-- Insert XML data
INSERT INTO documents (title, content) VALUES (
    'Sample Document',
    '<document>
        <author>John Doe</author>
        <sections>
            <section id="1">Introduction</section>
            <section id="2">Main Content</section>
        </sections>
    </document>'
);
```

## Custom Data Types and ENUM 🎯

### ENUM Type

```sql
-- ENUM for predefined values
CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,

    -- Status with limited options
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled')
           DEFAULT 'pending',

    -- Priority levels
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',

    -- Payment methods
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer')
);

-- ENUM benefits:
-- 1. Data validation at database level
-- 2. Storage efficiency (stored as integers internally)
-- 3. Clear documentation of allowed values
```

### SET Type (MySQL)

```sql
-- SET for multiple selections
CREATE TABLE user_interests (
    id INT PRIMARY KEY,
    username VARCHAR(50),

    -- Multiple interests can be selected
    interests SET('sports', 'music', 'technology', 'travel', 'cooking', 'reading')
);

-- Insert multiple SET values
INSERT INTO user_interests (username, interests) VALUES
('alice', 'sports,technology,travel'),
('bob', 'music,cooking');

-- Query SET values
SELECT * FROM user_interests WHERE FIND_IN_SET('technology', interests);
```

## Constraints in Detail 🔒

### Primary Key Constraints

```sql
-- Single column primary key
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

-- Composite primary key
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    line_number SMALLINT,
    quantity INT,
    PRIMARY KEY (order_id, product_id, line_number)
);

-- Named primary key constraint
CREATE TABLE products (
    product_id INT AUTO_INCREMENT,
    sku VARCHAR(50),
    name VARCHAR(200),
    CONSTRAINT pk_products PRIMARY KEY (product_id)
);
```

### Foreign Key Constraints with Actions

```sql
-- Foreign key with referential actions
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    product_id INT,

    -- ON DELETE CASCADE: Delete orders when customer is deleted
    CONSTRAINT fk_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- ON DELETE SET NULL: Set to NULL when product is deleted
    CONSTRAINT fk_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE SET NULL
        ON UPDATE RESTRICT  -- Prevent updates to referenced key
);
```

### Check Constraints

```sql
-- Various CHECK constraints
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,

    -- Age validation
    age INT CHECK (age >= 18 AND age <= 65),

    -- Salary validation
    salary DECIMAL(10,2) CHECK (salary > 0),

    -- Email format validation
    email VARCHAR(100) CHECK (email LIKE '%@%.%'),

    -- Status validation
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'terminated')),

    -- Date validation
    hire_date DATE CHECK (hire_date >= '2000-01-01' AND hire_date <= CURRENT_DATE()),

    -- Complex validation
    CONSTRAINT chk_salary_age CHECK (
        (age < 25 AND salary <= 50000) OR
        (age >= 25 AND salary <= 200000)
    )
);
```

### Unique Constraints

```sql
-- Multiple unique constraints
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(15),

    -- Single column unique
    CONSTRAINT uk_username UNIQUE (username),
    CONSTRAINT uk_email UNIQUE (email),

    -- Composite unique constraint
    CONSTRAINT uk_phone_email UNIQUE (phone, email)
);
```

### Default Constraints

```sql
-- Various default values
CREATE TABLE user_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,

    -- Static defaults
    status VARCHAR(20) DEFAULT 'active',
    is_verified BOOLEAN DEFAULT FALSE,
    credit_balance DECIMAL(10,2) DEFAULT 0.00,

    -- Function-based defaults
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Expression defaults (MySQL 8.0+)
    account_number VARCHAR(20) DEFAULT (CONCAT('ACC', LPAD(LAST_INSERT_ID(), 10, '0')))
);
```

## Data Type Conversion and Casting 🔄

### Implicit Conversion

```sql
-- MySQL automatically converts types when possible
CREATE TABLE conversions (
    id INT PRIMARY KEY,
    number_as_string VARCHAR(10),
    string_as_number INT
);

INSERT INTO conversions VALUES (1, 123, '456');  -- Auto-conversion

-- Be careful with implicit conversion
SELECT * FROM conversions WHERE number_as_string = 123;  -- Works
SELECT * FROM conversions WHERE string_as_number = '456';  -- Works
```

### Explicit Conversion

```sql
-- CAST function
SELECT
    CAST('123' AS SIGNED) AS string_to_int,
    CAST(123.45 AS CHAR) AS number_to_string,
    CAST('2024-08-11' AS DATE) AS string_to_date;

-- CONVERT function (MySQL)
SELECT
    CONVERT('123', SIGNED) AS string_to_int,
    CONVERT(NOW(), DATE) AS datetime_to_date;

-- Type conversion in calculations
SELECT
    price,
    CAST(price AS SIGNED) AS price_rounded,
    CAST(price * 1.1 AS DECIMAL(10,2)) AS price_with_tax
FROM products;
```

## Database-Specific Data Types 🗄️

### MySQL Specific

```sql
-- MySQL-specific types
CREATE TABLE mysql_specific (
    id INT PRIMARY KEY,

    -- Spatial data types
    location POINT,
    area POLYGON,

    -- SET type for multiple values
    tags SET('urgent', 'featured', 'sale', 'new'),

    -- JSON type (MySQL 5.7+)
    metadata JSON,

    -- Binary types
    file_hash BINARY(16),       -- MD5 hash
    large_binary LONGBLOB       -- Large binary data
);
```

### PostgreSQL Specific

```sql
-- PostgreSQL-specific types
CREATE TABLE postgresql_specific (
    id SERIAL PRIMARY KEY,

    -- Arrays
    tags TEXT[],
    numbers INTEGER[],

    -- UUID type
    uuid UUID DEFAULT gen_random_uuid(),

    -- Network address types
    ip_address INET,
    mac_address MACADDR,

    -- Range types
    age_range INT4RANGE,
    date_range DATERANGE,

    -- JSON and JSONB
    metadata JSON,
    settings JSONB              -- Binary JSON (faster)
);
```

### SQL Server Specific

```sql
-- SQL Server-specific types
CREATE TABLE sqlserver_specific (
    id INT IDENTITY(1,1) PRIMARY KEY,

    -- Unicode strings
    unicode_name NVARCHAR(100),

    -- Unique identifier
    row_guid UNIQUEIDENTIFIER DEFAULT NEWID(),

    -- XML data
    xml_data XML,

    -- Hierarchical data
    node_path HIERARCHYID,

    -- Spatial data
    location GEOGRAPHY
);
```

## Best Practices for Data Types 🌟

### 1. Choose the Right Size

```sql
-- Good: Right-sized data types
CREATE TABLE efficient_table (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- 4 bytes, plenty for most cases
    status TINYINT UNSIGNED,                      -- 1 byte for small numbers
    price DECIMAL(8,2),                           -- Exact for money
    created_at TIMESTAMP                          -- 4 bytes vs 8 for DATETIME
);

-- Avoid: Over-sized data types
CREATE TABLE inefficient_table (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,        -- 8 bytes when 4 would do
    status INT,                                   -- 4 bytes for 0-255 values
    price DOUBLE,                                 -- Imprecise for money
    created_at DATETIME                           -- 8 bytes vs 4 for TIMESTAMP
);
```

### 2. Use Appropriate Constraints

```sql
-- Comprehensive constraint usage
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email LIKE '%@%.%'),
    age TINYINT UNSIGNED CHECK (age >= 13 AND age <= 120),
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,

    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status_created (status, created_at)
);
```

### 3. Plan for Future Growth

```sql
-- Consider future requirements
CREATE TABLE scalable_design (
    -- Use BIGINT for high-volume tables
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Use VARCHAR instead of CHAR for flexibility
    code VARCHAR(20) NOT NULL,  -- Can grow from 2 to 20 chars

    -- Use TEXT for content that might grow
    description TEXT,           -- Start small, can grow

    -- Use JSON for flexible attributes
    metadata JSON               -- Add new fields without schema changes
);
```

## Next Steps ➡️

Now that you understand data types and constraints, we'll explore basic SQL queries - the foundation of data manipulation and retrieval.

---

## Quick Reference 📚

### Common Data Types

| Category     | Type          | Use Case               | Example                |
| ------------ | ------------- | ---------------------- | ---------------------- |
| **Integer**  | INT           | IDs, counts            | `customer_id INT`      |
| **Decimal**  | DECIMAL(10,2) | Money, precise numbers | `price DECIMAL(10,2)`  |
| **String**   | VARCHAR(n)    | Variable text          | `name VARCHAR(100)`    |
| **String**   | TEXT          | Long content           | `description TEXT`     |
| **Date**     | DATE          | Dates only             | `birth_date DATE`      |
| **DateTime** | TIMESTAMP     | Date with time         | `created_at TIMESTAMP` |
| **Boolean**  | BOOLEAN       | True/false             | `is_active BOOLEAN`    |
| **JSON**     | JSON          | Structured data        | `metadata JSON`        |

### Essential Constraints

```sql
NOT NULL           -- Cannot be empty
UNIQUE            -- No duplicates
PRIMARY KEY       -- Unique identifier
FOREIGN KEY       -- Reference to another table
CHECK (condition) -- Custom validation
DEFAULT value     -- Default value if none provided
```
