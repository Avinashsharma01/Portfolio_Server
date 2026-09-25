# The Relational Model

## What is the Relational Model? 🔗

The **Relational Model** is a database model based on the mathematical concept of relations. Proposed by Dr. Edgar F. Codd in 1970, it organizes data into tables (relations) consisting of rows and columns.

## Core Concepts 📚

### 1. **Relation (Table)**

A relation is a two-dimensional table with rows and columns.

```
Students Table:
┌────┬──────────┬─────┬───────────────────┐
│ ID │   Name   │ Age │      Email        │
├────┼──────────┼─────┼───────────────────┤
│ 1  │ John Doe │ 20  │ john@example.com  │
│ 2  │ Jane Smith│ 22  │ jane@example.com  │
│ 3  │ Bob Wilson│ 19  │ bob@example.com   │
└────┴──────────┴─────┴───────────────────┘
```

### 2. **Tuple (Row)**

A tuple is a single row in a table representing one record.

```
Example Tuple: (1, 'John Doe', 20, 'john@example.com')
```

### 3. **Attribute (Column)**

An attribute is a column in a table representing a property.

```
Attributes: ID, Name, Age, Email
```

### 4. **Domain**

The set of allowable values for an attribute.

```
Age Domain: {0, 1, 2, ..., 150}
Email Domain: Valid email format strings
```

### 5. **Schema**

The structure of a relation (table name + attributes).

```
Students(ID, Name, Age, Email)
```

## Relational Model Terminology 📖

| Relational Model | Common Terms      | File System       |
| ---------------- | ----------------- | ----------------- |
| Relation         | Table             | File              |
| Tuple            | Row               | Record            |
| Attribute        | Column            | Field             |
| Domain           | Data Type         | Data Type         |
| Cardinality      | Number of Rows    | Number of Records |
| Degree           | Number of Columns | Number of Fields  |

## Properties of Relations 🎯

### 1. **Each Relation has a Unique Name**

No two tables can have the same name in a database.

### 2. **Each Attribute has a Unique Name**

Within a table, all column names must be unique.

### 3. **Each Tuple is Unique**

No two rows can be identical in all attributes.

### 4. **Order of Tuples is Irrelevant**

Rows can be in any order - the meaning doesn't change.

### 5. **Order of Attributes is Irrelevant**

Columns can be in any order - relationships remain the same.

### 6. **Atomic Values Only**

Each cell contains only one value (no arrays or nested tables).

## Keys in Relational Model 🔑

### 1. **Super Key**

A set of attributes that can uniquely identify any tuple.

```
Students: {ID}, {ID, Name}, {ID, Email}, {Email}, etc.
```

### 2. **Candidate Key**

A minimal super key (no subset is also a super key).

```
Students: {ID}, {Email}
```

### 3. **Primary Key**

The chosen candidate key for the relation.

```
Students: ID (Primary Key)
```

### 4. **Alternate Key**

Candidate keys that are not chosen as primary key.

```
Students: Email (Alternate Key)
```

### 5. **Foreign Key**

An attribute that references the primary key of another relation.

```
Orders Table:
- CustomerID (Foreign Key referencing Customers.ID)
```

### 6. **Composite Key**

A key made up of multiple attributes.

```
OrderItems: {OrderID, ProductID} (Composite Primary Key)
```

## Relationships Between Tables 🔗

### 1. **One-to-One (1:1)**

Each record in Table A relates to exactly one record in Table B.

```
Person ←→ Passport
┌────┬──────────┐    ┌────────────┬─────────────┐
│ ID │   Name   │    │ PassportNo │   PersonID  │
├────┼──────────┤    ├────────────┼─────────────┤
│ 1  │ John Doe │    │ A1234567   │      1      │
│ 2  │ Jane     │    │ B7654321   │      2      │
└────┴──────────┘    └────────────┴─────────────┘
```

### 2. **One-to-Many (1:M)**

Each record in Table A can relate to multiple records in Table B.

```
Department ←→ Employee
┌────┬─────────────┐    ┌────┬──────────┬──────────────┐
│ ID │    Name     │    │ ID │   Name   │ DepartmentID │
├────┼─────────────┤    ├────┼──────────┼──────────────┤
│ 1  │ Engineering │    │ 1  │ John     │      1       │
│ 2  │ Marketing   │    │ 2  │ Jane     │      1       │
└────┴─────────────┘    │ 3  │ Bob      │      2       │
                        └────┴──────────┴──────────────┘
```

### 3. **Many-to-Many (M:M)**

Records in Table A can relate to multiple records in Table B and vice versa.

```
Student ←→ Course (via StudentCourse junction table)

Students:                Courses:               StudentCourse:
┌────┬──────────┐       ┌────┬─────────────┐   ┌───────────┬──────────┐
│ ID │   Name   │       │ ID │    Name     │   │ StudentID │ CourseID │
├────┼──────────┤       ├────┼─────────────┤   ├───────────┼──────────┤
│ 1  │ John     │       │ 1  │ Math        │   │     1     │    1     │
│ 2  │ Jane     │       │ 2  │ Physics     │   │     1     │    2     │
└────┴──────────┘       │ 3  │ Chemistry   │   │     2     │    1     │
                        └────┴─────────────┘   │     2     │    3     │
                                              └───────────┴──────────┘
```

## Integrity Constraints 🛡️

### 1. **Entity Integrity**

Primary key cannot be NULL.

```sql
-- This violates entity integrity
INSERT INTO Students (ID, Name) VALUES (NULL, 'John');  -- ERROR!
```

### 2. **Referential Integrity**

Foreign key must reference an existing primary key or be NULL.

```sql
-- This violates referential integrity
INSERT INTO Orders (CustomerID) VALUES (999);  -- ERROR if Customer 999 doesn't exist
```

### 3. **Domain Integrity**

Attribute values must be from the valid domain.

```sql
-- This violates domain integrity
INSERT INTO Students (Age) VALUES (-5);  -- ERROR: Age cannot be negative
```

### 4. **User-Defined Integrity**

Custom business rules defined by the user.

```sql
-- Example: Salary must be positive
ALTER TABLE Employees ADD CONSTRAINT chk_salary CHECK (Salary > 0);
```

## Normalization Preview 🔄

Normalization is the process of organizing data to reduce redundancy and improve data integrity.

### **Unnormalized Table (Problems):**

```
StudentCourse Table:
┌───────────┬──────────────┬─────────────┬──────────────┬─────────────┐
│ StudentID │ StudentName  │ CourseID    │ CourseName   │ Instructor  │
├───────────┼──────────────┼─────────────┼──────────────┼─────────────┤
│    1      │ John Doe     │     101     │ Math         │ Dr. Smith   │
│    1      │ John Doe     │     102     │ Physics      │ Dr. Jones   │
│    2      │ Jane Smith   │     101     │ Math         │ Dr. Smith   │
└───────────┴──────────────┴─────────────┴──────────────┴─────────────┘

Problems:
- StudentName repeated (redundancy)
- CourseName repeated (redundancy)
- If we change Dr. Smith's name, we need to update multiple rows
```

### **Normalized Tables (Better):**

```
Students:                    Courses:                   Enrollments:
┌────┬──────────────┐       ┌─────┬──────────┬─────────┐ ┌───────────┬──────────┐
│ ID │    Name      │       │ ID  │   Name   │ Teacher │ │ StudentID │ CourseID │
├────┼──────────────┤       ├─────┼──────────┼─────────┤ ├───────────┼──────────┤
│ 1  │ John Doe     │       │ 101 │ Math     │Dr.Smith │ │     1     │   101    │
│ 2  │ Jane Smith   │       │ 102 │ Physics  │Dr.Jones │ │     1     │   102    │
└────┴──────────────┘       └─────┴──────────┴─────────┘ │     2     │   101    │
                                                        └───────────┴──────────┘
```

## Advantages of Relational Model ✅

1. **Simplicity**: Easy to understand and use
2. **Flexibility**: Easy to add, modify, or delete data
3. **Data Independence**: Changes to storage don't affect applications
4. **Mathematical Foundation**: Based on solid mathematical principles
5. **Query Language**: SQL provides powerful querying capabilities
6. **Integrity**: Built-in mechanisms to maintain data consistency
7. **Security**: User-level access control

## Disadvantages of Relational Model ❌

1. **Performance**: Can be slower for complex hierarchical data
2. **Storage Overhead**: Metadata and indexing require extra space
3. **Limited Data Types**: Traditional SQL has limited support for complex data types
4. **Impedance Mismatch**: Difference between relational and object-oriented paradigms

## Real-World Example: E-Commerce Database 🛒

```
Customers:
┌────┬──────────────┬───────────────────┬─────────────────┐
│ ID │     Name     │      Email        │     Phone       │
├────┼──────────────┼───────────────────┼─────────────────┤
│ 1  │ John Doe     │ john@example.com  │ 555-0123        │
│ 2  │ Jane Smith   │ jane@example.com  │ 555-0456        │
└────┴──────────────┴───────────────────┴─────────────────┘

Products:
┌────┬─────────────┬────────┬─────────────┐
│ ID │    Name     │ Price  │ CategoryID  │
├────┼─────────────┼────────┼─────────────┤
│ 1  │ Laptop      │ 999.99 │     1       │
│ 2  │ Mouse       │  29.99 │     1       │
│ 3  │ T-Shirt     │  19.99 │     2       │
└────┴─────────────┴────────┴─────────────┘

Orders:
┌────┬────────────┬────────────┬─────────┐
│ ID │ CustomerID │    Date    │  Total  │
├────┼────────────┼────────────┼─────────┤
│ 1  │     1      │ 2024-01-15 │ 1029.98 │
│ 2  │     2      │ 2024-01-16 │   19.99 │
└────┴────────────┴────────────┴─────────┘

OrderItems:
┌─────────┬───────────┬──────────┬───────┐
│ OrderID │ ProductID │ Quantity │ Price │
├─────────┼───────────┼──────────┼───────┤
│    1    │     1     │    1     │999.99 │
│    1    │     2     │    1     │ 29.99 │
│    2    │     3     │    1     │ 19.99 │
└─────────┴───────────┴──────────┴───────┘
```

## Next Steps ➡️

Now that you understand the relational model, we'll introduce SQL - the language used to interact with relational databases.

---

## Practice Exercise 💪

Design a simple relational database for a library system with:

-   Books (ID, Title, Author, ISBN, PublishedYear)
-   Members (ID, Name, Email, JoinDate)
-   Borrowings (BookID, MemberID, BorrowDate, ReturnDate)

Identify:

1. Primary keys for each table
2. Foreign keys and their relationships
3. What type of relationship exists between Books and Members?

**Answer:**

1. Primary Keys: Books.ID, Members.ID, Borrowings.{BookID, MemberID, BorrowDate}
2. Foreign Keys: Borrowings.BookID → Books.ID, Borrowings.MemberID → Members.ID
3. Many-to-Many relationship (a book can be borrowed by many members, a member can borrow many books)
