# Creating Databases and Tables

## Database Creation 🏗️

### Creating a Database

The first step in working with SQL is creating a database to store your tables and data.

```sql
-- Basic database creation
CREATE DATABASE company_db;

-- With character set specification (MySQL)
CREATE DATABASE company_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- PostgreSQL with encoding
CREATE DATABASE company_db
WITH ENCODING 'UTF8';

-- SQL Server with options
CREATE DATABASE company_db
ON (
    NAME = 'company_db',
    FILENAME = 'C:\Data\company_db.mdf',
    SIZE = 100MB,
    MAXSIZE = 1GB,
    FILEGROWTH = 10MB
);
```

### Using a Database

After creating a database, you need to select it for use:

```sql
-- MySQL/SQL Server
USE company_db;

-- PostgreSQL (connect to database)
\c company_db

-- Or specify in connection string
-- postgresql://username:password@localhost/company_db
```

### Viewing Databases

```sql
-- MySQL
SHOW DATABASES;

-- PostgreSQL
\l
-- or
SELECT datname FROM pg_database;

-- SQL Server
SELECT name FROM sys.databases;

-- SQLite (shows attached databases)
.databases
```

### Dropping a Database

```sql
-- ⚠️ CAUTION: This permanently deletes the database!
DROP DATABASE company_db;

-- Safer approach - check if exists first
DROP DATABASE IF EXISTS company_db;
```

## Table Creation 📋

### Basic Table Syntax

```sql
CREATE TABLE table_name (
    column1_name data_type [constraints],
    column2_name data_type [constraints],
    ...
    [table_constraints]
);
```

### Simple Table Example

```sql
CREATE TABLE employees (
    id INT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10,2)
);
```

### Table with Constraints

```sql
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    salary DECIMAL(10,2) CHECK (salary > 0),
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Column Constraints 🔒

### Primary Key Constraint

```sql
-- Single column primary key
CREATE TABLE students (
    student_id INT PRIMARY KEY,
    name VARCHAR(100)
);

-- Auto-incrementing primary key
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,  -- MySQL
    -- student_id SERIAL PRIMARY KEY,           -- PostgreSQL
    -- student_id INT IDENTITY(1,1) PRIMARY KEY -- SQL Server
    name VARCHAR(100)
);

-- Composite primary key
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);
```

### Foreign Key Constraint

```sql
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    order_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- With named constraint and actions
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    order_date DATE,
    CONSTRAINT fk_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
```

### NOT NULL Constraint

```sql
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,        -- Cannot be empty
    description TEXT,                  -- Can be NULL
    price DECIMAL(10,2) NOT NULL      -- Cannot be empty
);
```

### UNIQUE Constraint

```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,     -- Single column unique
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15)
);

-- Composite unique constraint
CREATE TABLE employee_projects (
    employee_id INT,
    project_id INT,
    role VARCHAR(50),
    UNIQUE (employee_id, project_id)    -- Combination must be unique
);
```

### CHECK Constraint

```sql
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT CHECK (age >= 18 AND age <= 65),
    salary DECIMAL(10,2) CHECK (salary > 0),
    email VARCHAR(100) CHECK (email LIKE '%@%.%'),
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'terminated'))
);

-- Named CHECK constraint
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    CONSTRAINT chk_positive_price CHECK (price > 0)
);
```

### DEFAULT Constraint

```sql
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_paid BOOLEAN DEFAULT FALSE,
    discount DECIMAL(5,2) DEFAULT 0.00
);
```

## Complete Example: E-commerce Database 🛒

```sql
-- Create database
CREATE DATABASE ecommerce_db;
USE ecommerce_db;

-- Categories table
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Products table
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Orders table
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Order items table
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

## Altering Tables 🔧

### Adding Columns

```sql
-- Add single column
ALTER TABLE employees
ADD COLUMN middle_name VARCHAR(50);

-- Add multiple columns
ALTER TABLE employees
ADD COLUMN (
    birth_date DATE,
    address TEXT,
    city VARCHAR(50)
);

-- Add column with constraints
ALTER TABLE employees
ADD COLUMN employee_code VARCHAR(10) UNIQUE NOT NULL;
```

### Modifying Columns

```sql
-- Change column data type
ALTER TABLE employees
MODIFY COLUMN salary DECIMAL(12,2);

-- Change column name and type (MySQL)
ALTER TABLE employees
CHANGE COLUMN first_name fname VARCHAR(100);

-- Rename column (PostgreSQL)
ALTER TABLE employees
RENAME COLUMN first_name TO fname;

-- Add constraint to existing column
ALTER TABLE employees
ADD CONSTRAINT chk_salary CHECK (salary > 0);
```

### Dropping Columns

```sql
-- Drop single column
ALTER TABLE employees
DROP COLUMN middle_name;

-- Drop multiple columns (MySQL)
ALTER TABLE employees
DROP COLUMN birth_date,
DROP COLUMN address;
```

### Adding/Dropping Constraints

```sql
-- Add foreign key constraint
ALTER TABLE orders
ADD CONSTRAINT fk_customer_orders
FOREIGN KEY (customer_id) REFERENCES customers(customer_id);

-- Drop constraint
ALTER TABLE orders
DROP CONSTRAINT fk_customer_orders;

-- Drop foreign key (MySQL)
ALTER TABLE orders
DROP FOREIGN KEY fk_customer_orders;
```

## Viewing Table Information 👀

### Show Tables

```sql
-- MySQL
SHOW TABLES;

-- PostgreSQL
\dt

-- SQL Server
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
```

### Describe Table Structure

```sql
-- MySQL
DESCRIBE employees;
-- or
SHOW COLUMNS FROM employees;

-- PostgreSQL
\d employees

-- SQL Server
EXEC sp_columns employees;

-- Standard SQL
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'employees';
```

### Show Create Table Statement

```sql
-- MySQL
SHOW CREATE TABLE employees;

-- PostgreSQL
\d+ employees

-- Get table creation script from information schema
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'employees'
ORDER BY ORDINAL_POSITION;
```

## Dropping Tables 🗑️

```sql
-- Drop single table
DROP TABLE employees;

-- Drop table if exists (safer)
DROP TABLE IF EXISTS employees;

-- Drop multiple tables
DROP TABLE employees, departments, projects;

-- Truncate table (remove all data, keep structure)
TRUNCATE TABLE employees;
```

## Temporary Tables 📝

### Creating Temporary Tables

```sql
-- MySQL
CREATE TEMPORARY TABLE temp_sales (
    sale_id INT,
    amount DECIMAL(10,2),
    sale_date DATE
);

-- SQL Server
CREATE TABLE #temp_sales (
    sale_id INT,
    amount DECIMAL(10,2),
    sale_date DATE
);

-- PostgreSQL
CREATE TEMP TABLE temp_sales (
    sale_id INT,
    amount DECIMAL(10,2),
    sale_date DATE
);
```

## Database Design Best Practices 🌟

### 1. Naming Conventions

```sql
-- Use consistent naming
-- Tables: plural nouns (customers, orders, products)
-- Columns: singular nouns (customer_id, first_name)
-- Primary keys: table_name + _id (customer_id, order_id)
-- Foreign keys: referenced_table + _id (customer_id in orders table)

CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email_address VARCHAR(100) UNIQUE
);
```

### 2. Data Type Selection

```sql
-- Choose appropriate data types
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,        -- INT for IDs
    name VARCHAR(200) NOT NULL,                       -- VARCHAR for variable text
    description TEXT,                                 -- TEXT for long content
    price DECIMAL(10,2) NOT NULL,                    -- DECIMAL for money
    is_active BOOLEAN DEFAULT TRUE,                   -- BOOLEAN for true/false
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- TIMESTAMP for dates
);
```

### 3. Constraint Usage

```sql
-- Use constraints to maintain data integrity
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status ENUM('pending', 'shipped', 'delivered') DEFAULT 'pending',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

## Common Errors and Solutions ❗

### 1. Foreign Key Constraint Errors

```sql
-- Error: Cannot add foreign key constraint
-- Solution: Ensure referenced table and column exist
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);

-- This will work
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

### 2. Data Type Mismatch

```sql
-- Error: Data type mismatch in foreign key
-- Solution: Ensure data types match exactly
CREATE TABLE customers (
    customer_id BIGINT PRIMARY KEY AUTO_INCREMENT,  -- BIGINT
    name VARCHAR(100)
);

-- Foreign key must be same type
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT,  -- Must be BIGINT, not INT
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

### 3. Unique Constraint Violations

```sql
-- Handle potential duplicates
INSERT IGNORE INTO customers (email) VALUES ('john@example.com');  -- MySQL

-- Or use ON DUPLICATE KEY UPDATE
INSERT INTO customers (name, email)
VALUES ('John Doe', 'john@example.com')
ON DUPLICATE KEY UPDATE name = VALUES(name);
```

## Practice Exercises 💪

### Exercise 1: Library Database

Create a library management system with these requirements:

-   Books (ISBN, title, author, publication_year, available_copies)
-   Members (member_id, name, email, join_date)
-   Borrowings (member_id, ISBN, borrow_date, return_date, status)

### Exercise 2: School Database

Design a school database:

-   Students (student_id, first_name, last_name, date_of_birth, grade_level)
-   Courses (course_id, course_name, credits, department)
-   Enrollments (student_id, course_id, semester, year, grade)

### Exercise 3: Hospital Database

Create a hospital management system:

-   Patients (patient_id, name, date_of_birth, contact_info)
-   Doctors (doctor_id, name, specialization, phone)
-   Appointments (appointment_id, patient_id, doctor_id, date_time, status)

## Next Steps ➡️

Now that you can create databases and tables, we'll move on to working with different data types and understanding how to choose the right constraints for your specific needs.

---

## Quick Reference 📚

### Essential DDL Commands

```sql
CREATE DATABASE db_name;
USE db_name;
CREATE TABLE table_name (...);
ALTER TABLE table_name ADD COLUMN ...;
ALTER TABLE table_name DROP COLUMN ...;
DROP TABLE table_name;
TRUNCATE TABLE table_name;
```

### Key Constraints

-   `PRIMARY KEY`: Unique identifier
-   `FOREIGN KEY`: References another table
-   `NOT NULL`: Cannot be empty
-   `UNIQUE`: No duplicates allowed
-   `CHECK`: Custom validation rules
-   `DEFAULT`: Default value if none provided
