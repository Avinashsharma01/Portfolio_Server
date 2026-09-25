# Introduction to SQL

## What is SQL? 💫

**SQL (Structured Query Language)** is a standardized programming language designed for managing and manipulating relational databases. It's the universal language for communicating with database management systems.

## History of SQL 📜

-   **1970**: Dr. Edgar F. Codd publishes relational model paper
-   **1974**: IBM starts System R project, creates SEQUEL
-   **1979**: First commercial SQL product (Oracle V2)
-   **1982**: IBM releases SQL/DS
-   **1986**: SQL becomes ANSI standard (SQL-86)
-   **1989**: SQL-89 (SQL1) released
-   **1999**: SQL:1999 (SQL3) adds object-oriented features
-   **2003**: SQL:2003 adds XML features
-   **2006**: SQL:2006 adds JSON support
-   **2016**: SQL:2016 adds JSON and row pattern matching

## SQL Standards 📋

### Major SQL Standards:

-   **SQL-86** (SQL1): Basic relational operations
-   **SQL-89** (SQL1): Minor revisions
-   **SQL-92** (SQL2): Major expansion, outer joins, new data types
-   **SQL:1999** (SQL3): Regular expressions, arrays, structured types
-   **SQL:2003**: XML features, window functions, standardized object features
-   **SQL:2006**: Import/export XML, JSON support
-   **SQL:2008**: MERGE statement, INSTEAD OF triggers
-   **SQL:2011**: Temporal data, improved window functions
-   **SQL:2016**: Row pattern matching, JSON support, multi-dimensional arrays

## SQL Components 🧩

SQL is divided into several sublanguages:

### 1. **Data Definition Language (DDL)**

Defines database structure and schema.

```sql
-- Create database
CREATE DATABASE school;

-- Create table
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    email VARCHAR(100) UNIQUE
);

-- Modify table structure
ALTER TABLE students ADD COLUMN phone VARCHAR(15);

-- Delete table
DROP TABLE students;
```

### 2. **Data Manipulation Language (DML)**

Manipulates data within tables.

```sql
-- Insert data
INSERT INTO students (id, name, age, email)
VALUES (1, 'John Doe', 20, 'john@example.com');

-- Update data
UPDATE students
SET age = 21
WHERE id = 1;

-- Delete data
DELETE FROM students
WHERE id = 1;

-- Select data
SELECT name, age
FROM students
WHERE age > 18;
```

### 3. **Data Control Language (DCL)**

Controls access to data and database.

```sql
-- Grant permissions
GRANT SELECT, INSERT ON students TO user1;

-- Revoke permissions
REVOKE INSERT ON students FROM user1;
```

### 4. **Transaction Control Language (TCL)**

Manages database transactions.

```sql
-- Start transaction
BEGIN TRANSACTION;

-- Save changes
COMMIT;

-- Undo changes
ROLLBACK;

-- Create savepoint
SAVEPOINT sp1;

-- Rollback to savepoint
ROLLBACK TO sp1;
```

## SQL Syntax Rules 📝

### 1. **Case Sensitivity**

-   SQL keywords are **NOT** case-sensitive
-   Table and column names may be case-sensitive (depends on DBMS)
-   String values **ARE** case-sensitive

```sql
-- These are equivalent
SELECT * FROM students;
select * from students;
Select * From Students;

-- But these are different
WHERE name = 'John';    -- Different from
WHERE name = 'john';
```

### 2. **Statement Termination**

-   SQL statements end with semicolon (`;`)
-   Some systems allow omitting semicolon for single statements

```sql
SELECT * FROM students;
INSERT INTO students VALUES (1, 'John');
```

### 3. **Comments**

```sql
-- Single line comment
SELECT * FROM students; -- End-of-line comment

/*
   Multi-line comment
   Can span multiple lines
*/
SELECT * FROM students;
```

### 4. **String Literals**

```sql
-- Use single quotes for strings
SELECT * FROM students WHERE name = 'John Doe';

-- Escape single quotes by doubling them
SELECT * FROM students WHERE name = 'O''Connor';
```

### 5. **Identifiers**

```sql
-- Valid identifiers
student_id
StudentName
student2

-- Invalid identifiers (use quotes if necessary)
"2student"     -- Starts with number
"student-id"   -- Contains hyphen
"SELECT"       -- Reserved keyword
```

## Basic SQL Data Types 📊

### **Numeric Types**

```sql
INT             -- Integer (-2,147,483,648 to 2,147,483,647)
BIGINT          -- Large integer
DECIMAL(p,s)    -- Fixed-point number (precision, scale)
FLOAT           -- Floating-point number
REAL            -- Single precision floating-point
```

### **Character Types**

```sql
CHAR(n)         -- Fixed-length string
VARCHAR(n)      -- Variable-length string
TEXT            -- Large text data
```

### **Date and Time Types**

```sql
DATE            -- Date (YYYY-MM-DD)
TIME            -- Time (HH:MM:SS)
DATETIME        -- Date and time
TIMESTAMP       -- Timestamp with timezone
```

### **Boolean Type**

```sql
BOOLEAN         -- TRUE, FALSE, or NULL
```

### **Other Types**

```sql
BLOB            -- Binary Large Object
JSON            -- JSON data (in supported databases)
XML             -- XML data (in supported databases)
```

## SQL Operators 🔧

### **Arithmetic Operators**

```sql
SELECT
    price + tax AS total_cost,
    quantity * price AS subtotal,
    discount / 100 AS discount_rate,
    price - discount AS final_price,
    price % 10 AS remainder
FROM products;
```

### **Comparison Operators**

```sql
SELECT * FROM products WHERE price = 100;     -- Equal
SELECT * FROM products WHERE price <> 100;    -- Not equal
SELECT * FROM products WHERE price != 100;    -- Not equal (alternative)
SELECT * FROM products WHERE price > 100;     -- Greater than
SELECT * FROM products WHERE price < 100;     -- Less than
SELECT * FROM products WHERE price >= 100;    -- Greater than or equal
SELECT * FROM products WHERE price <= 100;    -- Less than or equal
```

### **Logical Operators**

```sql
-- AND operator
SELECT * FROM students
WHERE age > 18 AND grade = 'A';

-- OR operator
SELECT * FROM students
WHERE age < 18 OR grade = 'F';

-- NOT operator
SELECT * FROM students
WHERE NOT grade = 'F';
```

### **Special Operators**

```sql
-- IN operator
SELECT * FROM students
WHERE grade IN ('A', 'B', 'C');

-- BETWEEN operator
SELECT * FROM students
WHERE age BETWEEN 18 AND 25;

-- LIKE operator (pattern matching)
SELECT * FROM students
WHERE name LIKE 'John%';     -- Starts with 'John'

-- IS NULL / IS NOT NULL
SELECT * FROM students
WHERE email IS NOT NULL;
```

## SQL Functions Categories 🎯

### **Aggregate Functions**

```sql
SELECT
    COUNT(*) AS total_students,
    AVG(age) AS average_age,
    MAX(age) AS oldest_student,
    MIN(age) AS youngest_student,
    SUM(age) AS total_age
FROM students;
```

### **String Functions**

```sql
SELECT
    UPPER(name) AS uppercase_name,
    LOWER(name) AS lowercase_name,
    LENGTH(name) AS name_length,
    SUBSTRING(name, 1, 5) AS first_five_chars
FROM students;
```

### **Date Functions**

```sql
SELECT
    CURRENT_DATE AS today,
    YEAR(birth_date) AS birth_year,
    DATEDIFF(CURRENT_DATE, birth_date) AS days_old
FROM students;
```

### **Mathematical Functions**

```sql
SELECT
    ROUND(gpa, 2) AS rounded_gpa,
    ABS(balance) AS absolute_balance,
    CEIL(average_score) AS ceiling_score,
    FLOOR(average_score) AS floor_score
FROM students;
```

## Popular SQL Database Systems 🗄️

### **Open Source**

-   **MySQL**: Most popular open-source database
-   **PostgreSQL**: Advanced open-source object-relational database
-   **SQLite**: Lightweight, embedded database
-   **MariaDB**: MySQL fork with additional features

### **Commercial**

-   **Oracle Database**: Enterprise-grade database system
-   **Microsoft SQL Server**: Windows-focused database system
-   **IBM Db2**: Enterprise database for large organizations

### **Cloud-Based**

-   **Amazon RDS**: Managed relational database service
-   **Google Cloud SQL**: Fully-managed database service
-   **Azure SQL Database**: Microsoft's cloud database service

## SQL Dialects 🗣️

Different database systems have slight variations in SQL syntax:

### **MySQL**

```sql
-- Auto-increment primary key
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

-- Limit rows
SELECT * FROM students LIMIT 10;
```

### **PostgreSQL**

```sql
-- Auto-increment primary key
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

-- Limit rows
SELECT * FROM students LIMIT 10;
```

### **SQL Server**

```sql
-- Auto-increment primary key
CREATE TABLE students (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100)
);

-- Limit rows
SELECT TOP 10 * FROM students;
```

### **Oracle**

```sql
-- Auto-increment primary key (Oracle 12c+)
CREATE TABLE students (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100)
);

-- Limit rows
SELECT * FROM students WHERE ROWNUM <= 10;
```

## Best Practices 🌟

### 1. **Use Consistent Naming Conventions**

```sql
-- Good: Consistent snake_case
CREATE TABLE student_courses (
    student_id INT,
    course_id INT,
    enrollment_date DATE
);

-- Avoid: Mixed naming styles
CREATE TABLE StudentCourses (
    studentID INT,
    CourseId INT,
    enrollmentdate DATE
);
```

### 2. **Write Readable SQL**

```sql
-- Good: Well-formatted
SELECT s.name,
       s.email,
       c.course_name
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c ON e.course_id = c.id
WHERE s.age > 18
ORDER BY s.name;

-- Avoid: All on one line
SELECT s.name,s.email,c.course_name FROM students s JOIN enrollments e ON s.id=e.student_id JOIN courses c ON e.course_id=c.id WHERE s.age>18 ORDER BY s.name;
```

### 3. **Use Meaningful Column Aliases**

```sql
-- Good
SELECT
    CONCAT(first_name, ' ', last_name) AS full_name,
    YEAR(CURRENT_DATE) - YEAR(birth_date) AS age
FROM students;

-- Avoid
SELECT
    CONCAT(first_name, ' ', last_name) AS col1,
    YEAR(CURRENT_DATE) - YEAR(birth_date) AS col2
FROM students;
```

## Common SQL Patterns 🎭

### **Conditional Logic**

```sql
SELECT
    name,
    grade,
    CASE
        WHEN grade >= 90 THEN 'A'
        WHEN grade >= 80 THEN 'B'
        WHEN grade >= 70 THEN 'C'
        WHEN grade >= 60 THEN 'D'
        ELSE 'F'
    END AS letter_grade
FROM students;
```

### **Handling NULL Values**

```sql
SELECT
    name,
    COALESCE(phone, 'No phone provided') AS contact_phone,
    ISNULL(email, 'No email') AS contact_email  -- SQL Server
FROM students;
```

### **Working with Dates**

```sql
SELECT *
FROM orders
WHERE order_date >= '2024-01-01'
  AND order_date < '2025-01-01';
```

## Next Steps ➡️

Now that you understand SQL basics, we'll dive into creating databases and tables, which forms the foundation of database development.

---

## Quick Quiz 🧠

1. What does SQL stand for?
2. Name the four main SQL sublanguages.
3. What's the difference between CHAR and VARCHAR?
4. How do you write a comment in SQL?

**Answers:**

1. Structured Query Language
2. DDL, DML, DCL, TCL
3. CHAR is fixed-length, VARCHAR is variable-length
4. `--` for single line, `/* */` for multi-line comments
