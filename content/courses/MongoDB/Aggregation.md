# MongoDB Aggregation Pipeline - Complete Guide

## Table of Contents

1. [Introduction to Aggregation](#introduction-to-aggregation)
2. [Aggregation vs Find Operations](#aggregation-vs-find-operations)
3. [Pipeline Concept](#pipeline-concept)
4. [Complete Aggregation Stages Reference](#complete-aggregation-stages-reference)
5. [Basic Aggregation Stages](#basic-aggregation-stages)
6. [Common Aggregation Operators](#common-aggregation-operators)
7. [Expression Operators Reference](#expression-operators-reference)
8. [Practical Examples](#practical-examples)
9. [Advanced Aggregation Stages](#advanced-aggregation-stages)
10. [Performance Optimization](#performance-optimization)
11. [Best Practices](#best-practices)

---

## Introduction to Aggregation

MongoDB aggregation is a powerful framework for data transformation and analysis. It allows you to process data records and return computed results by passing documents through a multi-stage pipeline.

### What is Aggregation?

-   **Data Processing Framework**: Transform and analyze data
-   **Pipeline-based**: Sequential stages that process documents
-   **Flexible**: Supports complex data transformations
-   **Efficient**: Optimized for performance

### Why Use Aggregation?

-   Complex data analysis
-   Data transformation and reshaping
-   Grouping and statistical operations
-   Real-time analytics
-   Data preparation for reports

---

## Aggregation vs Find Operations

| Find Operations           | Aggregation Pipeline          |
| ------------------------- | ----------------------------- |
| Simple queries            | Complex data processing       |
| Filter documents          | Transform documents           |
| Limited data manipulation | Extensive data transformation |
| Basic sorting/limiting    | Advanced grouping/analysis    |

### Example Comparison:

**Find Operation:**

```javascript
db.orders.find({ status: "completed" });
```

**Aggregation Pipeline:**

```javascript
db.orders.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$customerId", totalSpent: { $sum: "$amount" } } },
    { $sort: { totalSpent: -1 } },
]);
```

---

## Pipeline Concept

The aggregation pipeline is like an assembly line where documents flow through multiple stages, each performing specific operations.

### Pipeline Structure:

```javascript
db.collection.aggregate([
    { stage1 },
    { stage2 },
    { stage3 },
    // ... more stages
]);
```

### How It Works:

1. **Input**: Documents from collection
2. **Stage 1**: Process all documents
3. **Stage 2**: Process output from Stage 1
4. **Stage 3**: Process output from Stage 2
5. **Output**: Final transformed result

### Visual Representation:

```
Documents → [$match] → [$group] → [$sort] → [$limit] → Result
    100         80        10        10        5        5
```

---

## Complete Aggregation Stages Reference

### Core Pipeline Stages

| Stage          | Definition                                                       | Purpose                                                    |
| -------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| `$match`       | Filters documents based on specified conditions                  | Select documents that meet criteria (like WHERE in SQL)    |
| `$project`     | Reshapes documents by including, excluding, or adding fields     | Select and transform fields (like SELECT in SQL)           |
| `$group`       | Groups documents by specified criteria and performs calculations | Group data and perform aggregations (like GROUP BY in SQL) |
| `$sort`        | Sorts documents by specified fields                              | Order results (like ORDER BY in SQL)                       |
| `$limit`       | Limits the number of documents passed to the next stage          | Restrict number of results (like LIMIT in SQL)             |
| `$skip`        | Skips specified number of documents                              | Skip documents for pagination (like OFFSET in SQL)         |
| `$unwind`      | Deconstructs an array field into separate documents              | Flatten array fields for processing                        |
| `$lookup`      | Performs left outer join with another collection                 | Join collections (like LEFT JOIN in SQL)                   |
| `$addFields`   | Adds new fields to documents                                     | Add computed fields without removing existing ones         |
| `$replaceRoot` | Replaces root document with specified document                   | Change document structure completely                       |
| `$facet`       | Processes multiple aggregation pipelines in parallel             | Run multiple aggregations simultaneously                   |
| `$bucket`      | Groups documents into buckets based on boundaries                | Categorize data into ranges                                |
| `$bucketAuto`  | Automatically groups documents into specified number of buckets  | Auto-categorize data into equal groups                     |
| `$count`       | Counts the number of documents                                   | Get document count at any pipeline stage                   |
| `$sample`      | Randomly selects specified number of documents                   | Get random sample of documents                             |

### Data Processing Stages

| Stage                | Definition                                                  | Purpose                                      |
| -------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| `$redact`            | Restricts content of documents based on document content    | Filter document content conditionally        |
| `$geoNear`           | Returns documents in order of proximity to geospatial point | Find documents near a geographic location    |
| `$graphLookup`       | Performs recursive search on a collection                   | Find connected data in graph-like structures |
| `$indexStats`        | Returns statistics about index usage                        | Analyze index performance                    |
| `$collStats`         | Returns statistics about collection                         | Get collection metadata and stats            |
| `$currentOp`         | Returns information about active operations                 | Monitor database operations                  |
| `$listLocalSessions` | Lists active sessions                                       | Session management information               |
| `$listSessions`      | Lists all sessions                                          | Complete session information                 |
| `$merge`             | Writes results to a collection                              | Save aggregation results to collection       |
| `$out`               | Writes results to a collection (replaces existing)          | Output results to new/existing collection    |
| `$planCacheStats`    | Returns plan cache statistics                               | Analyze query plan performance               |

### Set Operations Stages

| Stage              | Definition                                 | Purpose                                  |
| ------------------ | ------------------------------------------ | ---------------------------------------- |
| `$unionWith`       | Combines results from multiple collections | Union data from different collections    |
| `$densify`         | Adds documents to fill gaps in data        | Fill missing time series data points     |
| `$fill`            | Fills null values in documents             | Replace null/missing values              |
| `$setWindowFields` | Performs window function operations        | Calculate values across document windows |

### Array Processing Stages

| Stage                   | Definition                        | Purpose                             |
| ----------------------- | --------------------------------- | ----------------------------------- |
| `$unwind`               | Deconstructs array fields         | Process array elements individually |
| `$push` (in $group)     | Creates array from grouped values | Collect values into arrays          |
| `$addToSet` (in $group) | Creates array of unique values    | Collect unique values into arrays   |

---

## Expression Operators Reference

### Arithmetic Operators

| Operator    | Definition                          | Syntax                               | Example                                  |
| ----------- | ----------------------------------- | ------------------------------------ | ---------------------------------------- |
| `$add`      | Adds numbers or dates               | `{ $add: [expr1, expr2, ...] }`      | `{ $add: ["$price", "$tax"] }`           |
| `$subtract` | Subtracts second value from first   | `{ $subtract: [expr1, expr2] }`      | `{ $subtract: ["$total", "$discount"] }` |
| `$multiply` | Multiplies numbers                  | `{ $multiply: [expr1, expr2, ...] }` | `{ $multiply: ["$quantity", "$price"] }` |
| `$divide`   | Divides first number by second      | `{ $divide: [expr1, expr2] }`        | `{ $divide: ["$total", "$count"] }`      |
| `$mod`      | Returns remainder of division       | `{ $mod: [expr1, expr2] }`           | `{ $mod: ["$value", 10] }`               |
| `$abs`      | Returns absolute value              | `{ $abs: expr }`                     | `{ $abs: "$balance" }`                   |
| `$ceil`     | Returns smallest integer >= value   | `{ $ceil: expr }`                    | `{ $ceil: "$average" }`                  |
| `$floor`    | Returns largest integer <= value    | `{ $floor: expr }`                   | `{ $floor: "$price" }`                   |
| `$round`    | Rounds to specified decimal places  | `{ $round: [expr, places] }`         | `{ $round: ["$avg", 2] }`                |
| `$sqrt`     | Returns square root                 | `{ $sqrt: expr }`                    | `{ $sqrt: "$area" }`                     |
| `$pow`      | Raises number to specified power    | `{ $pow: [base, exponent] }`         | `{ $pow: ["$base", 2] }`                 |
| `$exp`      | Raises e to specified power         | `{ $exp: expr }`                     | `{ $exp: "$rate" }`                      |
| `$ln`       | Returns natural logarithm           | `{ $ln: expr }`                      | `{ $ln: "$value" }`                      |
| `$log`      | Returns logarithm in specified base | `{ $log: [number, base] }`           | `{ $log: ["$value", 10] }`               |
| `$log10`    | Returns base-10 logarithm           | `{ $log10: expr }`                   | `{ $log10: "$value" }`                   |
| `$sin`      | Returns sine in radians             | `{ $sin: expr }`                     | `{ $sin: "$angle" }`                     |
| `$cos`      | Returns cosine in radians           | `{ $cos: expr }`                     | `{ $cos: "$angle" }`                     |
| `$tan`      | Returns tangent in radians          | `{ $tan: expr }`                     | `{ $tan: "$angle" }`                     |

### String Operators

| Operator        | Definition                            | Syntax                                                         | Example                                                                |
| --------------- | ------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `$concat`       | Concatenates strings                  | `{ $concat: [str1, str2, ...] }`                               | `{ $concat: ["$firstName", " ", "$lastName"] }`                        |
| `$substr`       | Returns substring                     | `{ $substr: [string, start, length] }`                         | `{ $substr: ["$name", 0, 3] }`                                         |
| `$substrBytes`  | Returns substring by byte position    | `{ $substrBytes: [string, start, length] }`                    | `{ $substrBytes: ["$text", 0, 10] }`                                   |
| `$substrCP`     | Returns substring by code point       | `{ $substrCP: [string, start, length] }`                       | `{ $substrCP: ["$unicode", 0, 5] }`                                    |
| `$toLower`      | Converts string to lowercase          | `{ $toLower: expr }`                                           | `{ $toLower: "$email" }`                                               |
| `$toUpper`      | Converts string to uppercase          | `{ $toUpper: expr }`                                           | `{ $toUpper: "$name" }`                                                |
| `$strlen`       | Returns string length                 | `{ $strlen: expr }`                                            | `{ $strlen: "$description" }`                                          |
| `$strLenBytes`  | Returns string length in bytes        | `{ $strLenBytes: expr }`                                       | `{ $strLenBytes: "$text" }`                                            |
| `$strLenCP`     | Returns string length in code points  | `{ $strLenCP: expr }`                                          | `{ $strLenCP: "$unicode" }`                                            |
| `$split`        | Splits string by delimiter            | `{ $split: [string, delimiter] }`                              | `{ $split: ["$fullName", " "] }`                                       |
| `$trim`         | Removes whitespace from both ends     | `{ $trim: { input: expr } }`                                   | `{ $trim: { input: "$name" } }`                                        |
| `$ltrim`        | Removes whitespace from left          | `{ $ltrim: { input: expr } }`                                  | `{ $ltrim: { input: "$name" } }`                                       |
| `$rtrim`        | Removes whitespace from right         | `{ $rtrim: { input: expr } }`                                  | `{ $rtrim: { input: "$name" } }`                                       |
| `$indexOfBytes` | Returns byte index of substring       | `{ $indexOfBytes: [string, substring] }`                       | `{ $indexOfBytes: ["$email", "@"] }`                                   |
| `$indexOfCP`    | Returns code point index of substring | `{ $indexOfCP: [string, substring] }`                          | `{ $indexOfCP: ["$text", "word"] }`                                    |
| `$regexFind`    | Finds first regex match               | `{ $regexFind: { input: str, regex: pattern } }`               | `{ $regexFind: { input: "$email", regex: "@(.+)" } }`                  |
| `$regexFindAll` | Finds all regex matches               | `{ $regexFindAll: { input: str, regex: pattern } }`            | `{ $regexFindAll: { input: "$text", regex: "\\d+" } }`                 |
| `$regexMatch`   | Tests if string matches regex         | `{ $regexMatch: { input: str, regex: pattern } }`              | `{ $regexMatch: { input: "$email", regex: "^.+@.+$" } }`               |
| `$replaceOne`   | Replaces first occurrence             | `{ $replaceOne: { input: str, find: str, replacement: str } }` | `{ $replaceOne: { input: "$text", find: "old", replacement: "new" } }` |
| `$replaceAll`   | Replaces all occurrences              | `{ $replaceAll: { input: str, find: str, replacement: str } }` | `{ $replaceAll: { input: "$text", find: " ", replacement: "_" } }`     |

### Date Operators

| Operator          | Definition                          | Syntax                                                         | Example                                                                |
| ----------------- | ----------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `$dateFromString` | Converts string to date             | `{ $dateFromString: { dateString: str } }`                     | `{ $dateFromString: { dateString: "$dateStr" } }`                      |
| `$dateToString`   | Converts date to string             | `{ $dateToString: { format: str, date: expr } }`               | `{ $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }`        |
| `$dateToParts`    | Returns date parts as document      | `{ $dateToParts: { date: expr } }`                             | `{ $dateToParts: { date: "$createdAt" } }`                             |
| `$dateFromParts`  | Constructs date from parts          | `{ $dateFromParts: { year: n, month: n, day: n } }`            | `{ $dateFromParts: { year: 2024, month: 1, day: 15 } }`                |
| `$year`           | Extracts year from date             | `{ $year: expr }`                                              | `{ $year: "$createdAt" }`                                              |
| `$month`          | Extracts month from date            | `{ $month: expr }`                                             | `{ $month: "$createdAt" }`                                             |
| `$dayOfMonth`     | Extracts day of month               | `{ $dayOfMonth: expr }`                                        | `{ $dayOfMonth: "$createdAt" }`                                        |
| `$dayOfWeek`      | Extracts day of week (1=Sunday)     | `{ $dayOfWeek: expr }`                                         | `{ $dayOfWeek: "$createdAt" }`                                         |
| `$dayOfYear`      | Extracts day of year                | `{ $dayOfYear: expr }`                                         | `{ $dayOfYear: "$createdAt" }`                                         |
| `$hour`           | Extracts hour                       | `{ $hour: expr }`                                              | `{ $hour: "$timestamp" }`                                              |
| `$minute`         | Extracts minute                     | `{ $minute: expr }`                                            | `{ $minute: "$timestamp" }`                                            |
| `$second`         | Extracts second                     | `{ $second: expr }`                                            | `{ $second: "$timestamp" }`                                            |
| `$millisecond`    | Extracts millisecond                | `{ $millisecond: expr }`                                       | `{ $millisecond: "$timestamp" }`                                       |
| `$week`           | Extracts week of year               | `{ $week: expr }`                                              | `{ $week: "$createdAt" }`                                              |
| `$isoWeek`        | Extracts ISO week of year           | `{ $isoWeek: expr }`                                           | `{ $isoWeek: "$createdAt" }`                                           |
| `$isoDayOfWeek`   | Extracts ISO day of week (1=Monday) | `{ $isoDayOfWeek: expr }`                                      | `{ $isoDayOfWeek: "$createdAt" }`                                      |
| `$isoWeekYear`    | Extracts ISO week year              | `{ $isoWeekYear: expr }`                                       | `{ $isoWeekYear: "$createdAt" }`                                       |
| `$dateAdd`        | Adds time units to date             | `{ $dateAdd: { startDate: date, unit: str, amount: n } }`      | `{ $dateAdd: { startDate: "$date", unit: "day", amount: 7 } }`         |
| `$dateSubtract`   | Subtracts time units from date      | `{ $dateSubtract: { startDate: date, unit: str, amount: n } }` | `{ $dateSubtract: { startDate: "$date", unit: "month", amount: 1 } }`  |
| `$dateDiff`       | Calculates difference between dates | `{ $dateDiff: { startDate: date, endDate: date, unit: str } }` | `{ $dateDiff: { startDate: "$start", endDate: "$end", unit: "day" } }` |
| `$dateTrunc`      | Truncates date to specified unit    | `{ $dateTrunc: { date: expr, unit: str } }`                    | `{ $dateTrunc: { date: "$createdAt", unit: "month" } }`                |

### Array Operators

| Operator         | Definition                               | Syntax                                                        | Example                                                                                        |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `$arrayElemAt`   | Returns element at specified index       | `{ $arrayElemAt: [array, index] }`                            | `{ $arrayElemAt: ["$items", 0] }`                                                              |
| `$arrayToObject` | Converts array to object                 | `{ $arrayToObject: expr }`                                    | `{ $arrayToObject: "$keyValuePairs" }`                                                         |
| `$concatArrays`  | Concatenates arrays                      | `{ $concatArrays: [array1, array2, ...] }`                    | `{ $concatArrays: ["$arr1", "$arr2"] }`                                                        |
| `$filter`        | Filters array elements                   | `{ $filter: { input: array, cond: expr } }`                   | `{ $filter: { input: "$items", cond: { $gt: ["$$this.price", 100] } } }`                       |
| `$first`         | Returns first array element              | `{ $first: expr }`                                            | `{ $first: "$items" }`                                                                         |
| `$in`            | Tests if value is in array               | `{ $in: [expr, array] }`                                      | `{ $in: ["active", "$statuses"] }`                                                             |
| `$indexOfArray`  | Returns index of element in array        | `{ $indexOfArray: [array, value] }`                           | `{ $indexOfArray: ["$items", "apple"] }`                                                       |
| `$isArray`       | Tests if expression is array             | `{ $isArray: expr }`                                          | `{ $isArray: "$items" }`                                                                       |
| `$last`          | Returns last array element               | `{ $last: expr }`                                             | `{ $last: "$items" }`                                                                          |
| `$map`           | Applies expression to each array element | `{ $map: { input: array, as: str, in: expr } }`               | `{ $map: { input: "$items", as: "item", in: "$$item.price" } }`                                |
| `$objectToArray` | Converts object to array                 | `{ $objectToArray: expr }`                                    | `{ $objectToArray: "$metadata" }`                                                              |
| `$range`         | Creates array of integers                | `{ $range: [start, end, step] }`                              | `{ $range: [1, 10, 2] }`                                                                       |
| `$reduce`        | Reduces array to single value            | `{ $reduce: { input: array, initialValue: expr, in: expr } }` | `{ $reduce: { input: "$items", initialValue: 0, in: { $add: ["$$value", "$$this.price"] } } }` |
| `$reverseArray`  | Reverses array order                     | `{ $reverseArray: expr }`                                     | `{ $reverseArray: "$items" }`                                                                  |
| `$size`          | Returns array length                     | `{ $size: expr }`                                             | `{ $size: "$items" }`                                                                          |
| `$slice`         | Returns subset of array                  | `{ $slice: [array, position, n] }`                            | `{ $slice: ["$items", 0, 3] }`                                                                 |
| `$sortArray`     | Sorts array elements                     | `{ $sortArray: { input: array, sortBy: expr } }`              | `{ $sortArray: { input: "$items", sortBy: { price: 1 } } }`                                    |
| `$zip`           | Combines arrays into array of arrays     | `{ $zip: { inputs: [array1, array2, ...] } }`                 | `{ $zip: { inputs: ["$names", "$ages"] } }`                                                    |

### Conditional Operators

| Operator  | Definition                  | Syntax                                                                   | Example                                                                                               |
| --------- | --------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `$cond`   | If-then-else conditional    | `{ $cond: { if: expr, then: expr, else: expr } }`                        | `{ $cond: { if: { $gte: ["$age", 18] }, then: "Adult", else: "Minor" } }`                             |
| `$ifNull` | Returns alternative if null | `{ $ifNull: [expr, replacement] }`                                       | `{ $ifNull: ["$middleName", ""] }`                                                                    |
| `$switch` | Multi-branch conditional    | `{ $switch: { branches: [{ case: expr, then: expr }], default: expr } }` | `{ $switch: { branches: [{ case: { $eq: ["$grade", "A"] }, then: "Excellent" }], default: "Good" } }` |

### Comparison Operators

| Operator | Definition            | Syntax                     | Example                            |
| -------- | --------------------- | -------------------------- | ---------------------------------- |
| `$eq`    | Equal to              | `{ $eq: [expr1, expr2] }`  | `{ $eq: ["$status", "active"] }`   |
| `$ne`    | Not equal to          | `{ $ne: [expr1, expr2] }`  | `{ $ne: ["$status", "inactive"] }` |
| `$gt`    | Greater than          | `{ $gt: [expr1, expr2] }`  | `{ $gt: ["$age", 18] }`            |
| `$gte`   | Greater than or equal | `{ $gte: [expr1, expr2] }` | `{ $gte: ["$score", 90] }`         |
| `$lt`    | Less than             | `{ $lt: [expr1, expr2] }`  | `{ $lt: ["$price", 100] }`         |
| `$lte`   | Less than or equal    | `{ $lte: [expr1, expr2] }` | `{ $lte: ["$quantity", 10] }`      |
| `$cmp`   | Compare two values    | `{ $cmp: [expr1, expr2] }` | `{ $cmp: ["$date1", "$date2"] }`   |

### Logical Operators

| Operator | Definition  | Syntax                          | Example                                                             |
| -------- | ----------- | ------------------------------- | ------------------------------------------------------------------- |
| `$and`   | Logical AND | `{ $and: [expr1, expr2, ...] }` | `{ $and: [{ $gt: ["$age", 18] }, { $eq: ["$status", "active"] }] }` |
| `$or`    | Logical OR  | `{ $or: [expr1, expr2, ...] }`  | `{ $or: [{ $eq: ["$type", "premium"] }, { $gt: ["$score", 90] }] }` |
| `$not`   | Logical NOT | `{ $not: expr }`                | `{ $not: { $eq: ["$status", "inactive"] } }`                        |

### Type Operators

| Operator      | Definition               | Syntax                  | Example                          |
| ------------- | ------------------------ | ----------------------- | -------------------------------- |
| `$type`       | Returns BSON type        | `{ $type: expr }`       | `{ $type: "$value" }`            |
| `$isNumber`   | Tests if value is number | `{ $isNumber: expr }`   | `{ $isNumber: "$price" }`        |
| `$toBool`     | Converts to boolean      | `{ $toBool: expr }`     | `{ $toBool: "$isActive" }`       |
| `$toDate`     | Converts to date         | `{ $toDate: expr }`     | `{ $toDate: "$dateString" }`     |
| `$toDecimal`  | Converts to decimal      | `{ $toDecimal: expr }`  | `{ $toDecimal: "$priceString" }` |
| `$toDouble`   | Converts to double       | `{ $toDouble: expr }`   | `{ $toDouble: "$numberString" }` |
| `$toInt`      | Converts to integer      | `{ $toInt: expr }`      | `{ $toInt: "$ageString" }`       |
| `$toLong`     | Converts to long         | `{ $toLong: expr }`     | `{ $toLong: "$bigNumber" }`      |
| `$toObjectId` | Converts to ObjectId     | `{ $toObjectId: expr }` | `{ $toObjectId: "$idString" }`   |
| `$toString`   | Converts to string       | `{ $toString: expr }`   | `{ $toString: "$numberValue" }`  |

### Object Operators

| Operator         | Definition                         | Syntax                                 | Example                                       |
| ---------------- | ---------------------------------- | -------------------------------------- | --------------------------------------------- |
| `$mergeObjects`  | Merges multiple objects            | `{ $mergeObjects: [obj1, obj2, ...] }` | `{ $mergeObjects: ["$address", "$contact"] }` |
| `$objectToArray` | Converts object to key-value array | `{ $objectToArray: expr }`             | `{ $objectToArray: "$metadata" }`             |
| `$arrayToObject` | Converts key-value array to object | `{ $arrayToObject: expr }`             | `{ $arrayToObject: "$keyValuePairs" }`        |

### Accumulator Operators (for $group)

| Operator      | Definition                     | Syntax                  | Example                      |
| ------------- | ------------------------------ | ----------------------- | ---------------------------- |
| `$sum`        | Calculates sum                 | `{ $sum: expr }`        | `{ $sum: "$amount" }`        |
| `$avg`        | Calculates average             | `{ $avg: expr }`        | `{ $avg: "$score" }`         |
| `$min`        | Finds minimum value            | `{ $min: expr }`        | `{ $min: "$price" }`         |
| `$max`        | Finds maximum value            | `{ $max: expr }`        | `{ $max: "$price" }`         |
| `$first`      | Returns first value in group   | `{ $first: expr }`      | `{ $first: "$name" }`        |
| `$last`       | Returns last value in group    | `{ $last: expr }`       | `{ $last: "$date" }`         |
| `$push`       | Creates array of all values    | `{ $push: expr }`       | `{ $push: "$item" }`         |
| `$addToSet`   | Creates array of unique values | `{ $addToSet: expr }`   | `{ $addToSet: "$category" }` |
| `$stdDevPop`  | Population standard deviation  | `{ $stdDevPop: expr }`  | `{ $stdDevPop: "$scores" }`  |
| `$stdDevSamp` | Sample standard deviation      | `{ $stdDevSamp: expr }` | `{ $stdDevSamp: "$scores" }` |
| `$count`      | Counts documents               | `{ $count: {} }`        | `{ $count: {} }`             |

### Window Function Operators (for $setWindowFields)

| Operator          | Definition                       | Syntax                                        | Example                                   |
| ----------------- | -------------------------------- | --------------------------------------------- | ----------------------------------------- |
| `$rank`           | Returns rank of current document | `{ $rank: {} }`                               | Used in window functions for ranking      |
| `$denseRank`      | Returns dense rank (no gaps)     | `{ $denseRank: {} }`                          | Dense ranking without gaps                |
| `$documentNumber` | Returns position in window       | `{ $documentNumber: {} }`                     | Sequential numbering                      |
| `$rowNumber`      | Returns row number               | `{ $rowNumber: {} }`                          | Row numbering in window                   |
| `$shift`          | Returns value from another row   | `{ $shift: { output: expr, by: n } }`         | `{ $shift: { output: "$sales", by: 1 } }` |
| `$integral`       | Calculates integral              | `{ $integral: { input: expr, unit: str } }`   | Calculates area under curve               |
| `$derivative`     | Calculates derivative            | `{ $derivative: { input: expr, unit: str } }` | Calculates rate of change                 |
| `$covariancePop`  | Population covariance            | `{ $covariancePop: [expr1, expr2] }`          | Statistical covariance                    |
| `$covarianceSamp` | Sample covariance                | `{ $covarianceSamp: [expr1, expr2] }`         | Sample covariance                         |

### Set Operators

| Operator           | Definition                               | Syntax                                        | Example                                              |
| ------------------ | ---------------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| `$setEquals`       | Tests if arrays contain same elements    | `{ $setEquals: [array1, array2] }`            | `{ $setEquals: ["$tags1", "$tags2"] }`               |
| `$setIntersection` | Returns common elements                  | `{ $setIntersection: [array1, array2, ...] }` | `{ $setIntersection: ["$interests", "$available"] }` |
| `$setUnion`        | Returns combined unique elements         | `{ $setUnion: [array1, array2, ...] }`        | `{ $setUnion: ["$skills", "$requirements"] }`        |
| `$setDifference`   | Returns elements in first but not second | `{ $setDifference: [array1, array2] }`        | `{ $setDifference: ["$all", "$used"] }`              |
| `$setIsSubset`     | Tests if first array is subset of second | `{ $setIsSubset: [array1, array2] }`          | `{ $setIsSubset: ["$required", "$available"] }`      |
| `$anyElementTrue`  | Tests if any array element is true       | `{ $anyElementTrue: array }`                  | `{ $anyElementTrue: "$flags" }`                      |
| `$allElementsTrue` | Tests if all array elements are true     | `{ $allElementsTrue: array }`                 | `{ $allElementsTrue: "$conditions" }`                |

### Text Search Operators

| Operator | Definition                       | Syntax                   | Example                             |
| -------- | -------------------------------- | ------------------------ | ----------------------------------- |
| `$meta`  | Returns metadata for text search | `{ $meta: "textScore" }` | `{ score: { $meta: "textScore" } }` |

### Geospatial Operators

| Operator         | Definition             | Syntax                                               | Example                         |
| ---------------- | ---------------------- | ---------------------------------------------------- | ------------------------------- |
| `$geoIntersects` | Tests for intersection | `{ $geoIntersects: { $geometry: geojson } }`         | Geographic intersection queries |
| `$geoWithin`     | Tests if within area   | `{ $geoWithin: { $geometry: geojson } }`             | Geographic containment queries  |
| `$near`          | Finds nearby points    | `{ $near: { $geometry: geojson, $maxDistance: n } }` | Proximity queries               |
| `$nearSphere`    | Spherical proximity    | `{ $nearSphere: { $geometry: geojson } }`            | Spherical proximity queries     |

### Bitwise Operators

| Operator        | Definition                  | Syntax                                 | Example            |
| --------------- | --------------------------- | -------------------------------------- | ------------------ |
| `$bitsAllClear` | Tests if all bits are clear | `{ $bitsAllClear: [expr, positions] }` | Bitwise operations |
| `$bitsAllSet`   | Tests if all bits are set   | `{ $bitsAllSet: [expr, positions] }`   | Bitwise operations |
| `$bitsAnyClear` | Tests if any bits are clear | `{ $bitsAnyClear: [expr, positions] }` | Bitwise operations |
| `$bitsAnySet`   | Tests if any bits are set   | `{ $bitsAnySet: [expr, positions] }`   | Bitwise operations |

### Variable Operators

| Operator   | Definition                              | Syntax                                          | Example                                                                |
| ---------- | --------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| `$let`     | Defines variables for use in expression | `{ $let: { vars: { var1: expr1 }, in: expr } }` | `{ $let: { vars: { total: { $add: ["$a", "$b"] } }, in: "$$total" } }` |
| `$literal` | Returns value without parsing           | `{ $literal: expr }`                            | `{ $literal: "$field" }` returns the string "$field"                   |

### Miscellaneous Operators

| Operator       | Definition                            | Syntax                                                  | Example                       |
| -------------- | ------------------------------------- | ------------------------------------------------------- | ----------------------------- |
| `$rand`        | Returns random number between 0 and 1 | `{ $rand: {} }`                                         | `{ $rand: {} }`               |
| `$sampleRate`  | Randomly selects documents            | `{ $sampleRate: rate }`                                 | Used in `$match` for sampling |
| `$function`    | Defines custom JavaScript function    | `{ $function: { body: str, args: array, lang: "js" } }` | Custom JavaScript expressions |
| `$accumulator` | Custom accumulator function           | Complex syntax for custom aggregations                  | Custom accumulation logic     |

---

## Basic Aggregation Stages

### 1. $match - Filtering Documents

Filters documents (similar to find())

**Syntax:**

```javascript
{ $match: { <query> } }
```

**Examples:**

```javascript
// Basic filtering
{ $match: { status: "active" } }

// Multiple conditions
{ $match: { status: "active", age: { $gte: 18 } } }

// Complex queries
{ $match: {
  $and: [
    { status: "active" },
    { $or: [{ age: { $gte: 18 } }, { verified: true }] }
  ]
}}
```

### 2. $project - Selecting and Transforming Fields

Reshapes documents by including, excluding, or adding fields

**Syntax:**

```javascript
{ $project: { <specification> } }
```

**Examples:**

```javascript
// Include specific fields
{ $project: { name: 1, email: 1, _id: 0 } }

// Exclude fields
{ $project: { password: 0, sensitive_data: 0 } }

// Create new fields
{ $project: {
  name: 1,
  email: 1,
  fullName: { $concat: ["$firstName", " ", "$lastName"] },
  isAdult: { $gte: ["$age", 18] }
}}

// Rename fields
{ $project: {
  username: "$name",
  userEmail: "$email",
  userAge: "$age"
}}
```

### 3. $group - Grouping and Aggregating

Groups documents by specified criteria and performs calculations

**Syntax:**

```javascript
{ $group: {
  _id: <expression>,
  <field1>: { <accumulator1>: <expression1> },
  <field2>: { <accumulator2>: <expression2> }
}}
```

**Examples:**

```javascript
// Count documents by category
{ $group: {
  _id: "$category",
  count: { $sum: 1 }
}}

// Calculate totals and averages
{ $group: {
  _id: "$department",
  totalSalary: { $sum: "$salary" },
  avgSalary: { $avg: "$salary" },
  maxSalary: { $max: "$salary" },
  minSalary: { $min: "$salary" },
  employeeCount: { $sum: 1 }
}}

// Multiple grouping fields
{ $group: {
  _id: { department: "$department", location: "$location" },
  count: { $sum: 1 }
}}
```

### 4. $sort - Sorting Documents

Sorts documents by specified fields

**Syntax:**

```javascript
{ $sort: { <field1>: <sort order>, <field2>: <sort order> } }
```

**Examples:**

```javascript
// Ascending sort
{ $sort: { name: 1 } }

// Descending sort
{ $sort: { age: -1 } }

// Multiple field sorting
{ $sort: { department: 1, salary: -1 } }

// Sorting after grouping
{ $sort: { totalSales: -1 } }
```

### 5. $limit - Limiting Results

Limits the number of documents

**Syntax:**

```javascript
{ $limit: <number> }
```

**Examples:**

```javascript
// Get top 10 results
{
    $limit: 10;
}

// Often used with $sort
[
    { $sort: { score: -1 } },
    { $limit: 5 }, // Top 5 highest scores
];
```

### 6. $skip - Skipping Documents

Skips specified number of documents (useful for pagination)

**Syntax:**

```javascript
{ $skip: <number> }
```

**Examples:**

```javascript
// Skip first 20 documents
{
    $skip: 20;
}

// Pagination example (page 3, 10 items per page)
[
    { $skip: 20 }, // Skip first 20 (pages 1-2)
    { $limit: 10 }, // Take next 10 (page 3)
];
```

---

## Common Aggregation Operators

### Accumulator Operators (used with $group)

| Operator    | Description            | Example                 |
| ----------- | ---------------------- | ----------------------- |
| `$sum`      | Sum of values          | `{ $sum: "$amount" }`   |
| `$avg`      | Average of values      | `{ $avg: "$score" }`    |
| `$min`      | Minimum value          | `{ $min: "$price" }`    |
| `$max`      | Maximum value          | `{ $max: "$price" }`    |
| `$first`    | First value in group   | `{ $first: "$name" }`   |
| `$last`     | Last value in group    | `{ $last: "$date" }`    |
| `$push`     | Array of all values    | `{ $push: "$item" }`    |
| `$addToSet` | Array of unique values | `{ $addToSet: "$tag" }` |

### Arithmetic Operators

| Operator    | Description    | Example                                  |
| ----------- | -------------- | ---------------------------------------- |
| `$add`      | Addition       | `{ $add: ["$price", "$tax"] }`           |
| `$subtract` | Subtraction    | `{ $subtract: ["$total", "$discount"] }` |
| `$multiply` | Multiplication | `{ $multiply: ["$quantity", "$price"] }` |
| `$divide`   | Division       | `{ $divide: ["$total", "$count"] }`      |
| `$mod`      | Modulo         | `{ $mod: ["$value", 10] }`               |

### String Operators

| Operator   | Description         | Example                                         |
| ---------- | ------------------- | ----------------------------------------------- |
| `$concat`  | Concatenate strings | `{ $concat: ["$firstName", " ", "$lastName"] }` |
| `$substr`  | Substring           | `{ $substr: ["$name", 0, 3] }`                  |
| `$toUpper` | Uppercase           | `{ $toUpper: "$name" }`                         |
| `$toLower` | Lowercase           | `{ $toLower: "$email" }`                        |
| `$strlen`  | String length       | `{ $strlen: "$description" }`                   |

### Date Operators

| Operator        | Description            | Example                                                         |
| --------------- | ---------------------- | --------------------------------------------------------------- |
| `$year`         | Extract year           | `{ $year: "$createdAt" }`                                       |
| `$month`        | Extract month          | `{ $month: "$createdAt" }`                                      |
| `$dayOfMonth`   | Extract day            | `{ $dayOfMonth: "$createdAt" }`                                 |
| `$dayOfWeek`    | Day of week (1=Sunday) | `{ $dayOfWeek: "$createdAt" }`                                  |
| `$dateToString` | Format date            | `{ $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }` |

### Conditional Operators

| Operator  | Description         | Example                                                                                               |
| --------- | ------------------- | ----------------------------------------------------------------------------------------------------- |
| `$cond`   | If-then-else        | `{ $cond: { if: { $gte: ["$age", 18] }, then: "Adult", else: "Minor" } }`                             |
| `$ifNull` | Handle null values  | `{ $ifNull: ["$middleName", ""] }`                                                                    |
| `$switch` | Multiple conditions | `{ $switch: { branches: [{ case: { $eq: ["$grade", "A"] }, then: "Excellent" }], default: "Good" } }` |

---

## Practical Examples

Let's work with a sample `orders` collection:

```javascript
// Sample data
{
  _id: ObjectId("..."),
  customerId: "cust001",
  customerName: "John Doe",
  items: [
    { product: "Laptop", quantity: 1, price: 1000 },
    { product: "Mouse", quantity: 2, price: 25 }
  ],
  totalAmount: 1050,
  status: "completed",
  orderDate: ISODate("2024-01-15"),
  shippingAddress: {
    city: "New York",
    state: "NY",
    country: "USA"
  }
}
```

### Example 1: Sales Report by Month

```javascript
db.orders.aggregate([
    // Filter completed orders
    { $match: { status: "completed" } },

    // Group by year-month
    {
        $group: {
            _id: {
                year: { $year: "$orderDate" },
                month: { $month: "$orderDate" },
            },
            totalSales: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: "$totalAmount" },
        },
    },

    // Sort by year and month
    { $sort: { "_id.year": 1, "_id.month": 1 } },

    // Format output
    {
        $project: {
            _id: 0,
            period: {
                $concat: [
                    { $toString: "$_id.year" },
                    "-",
                    { $toString: "$_id.month" },
                ],
            },
            totalSales: 1,
            orderCount: 1,
            avgOrderValue: { $round: ["$avgOrderValue", 2] },
        },
    },
]);
```

### Example 2: Top 5 Customers by Total Spending

```javascript
db.orders.aggregate([
    { $match: { status: "completed" } },

    {
        $group: {
            _id: "$customerId",
            customerName: { $first: "$customerName" },
            totalSpent: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
            lastOrderDate: { $max: "$orderDate" },
        },
    },

    { $sort: { totalSpent: -1 } },
    { $limit: 5 },

    {
        $project: {
            _id: 0,
            customerId: "$_id",
            customerName: 1,
            totalSpent: 1,
            orderCount: 1,
            avgOrderValue: { $divide: ["$totalSpent", "$orderCount"] },
            lastOrderDate: 1,
        },
    },
]);
```

### Example 3: Product Performance Analysis

```javascript
db.orders.aggregate([
    { $match: { status: "completed" } },

    // Unwind items array to work with individual products
    { $unwind: "$items" },

    {
        $group: {
            _id: "$items.product",
            totalQuantitySold: { $sum: "$items.quantity" },
            totalRevenue: {
                $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
            orderCount: { $sum: 1 },
            avgPrice: { $avg: "$items.price" },
        },
    },

    { $sort: { totalRevenue: -1 } },

    {
        $project: {
            _id: 0,
            product: "$_id",
            totalQuantitySold: 1,
            totalRevenue: 1,
            orderCount: 1,
            avgPrice: { $round: ["$avgPrice", 2] },
        },
    },
]);
```

### Example 4: Geographic Sales Distribution

```javascript
db.orders.aggregate([
    { $match: { status: "completed" } },

    {
        $group: {
            _id: {
                state: "$shippingAddress.state",
                country: "$shippingAddress.country",
            },
            totalSales: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
            uniqueCustomers: { $addToSet: "$customerId" },
        },
    },

    {
        $project: {
            _id: 0,
            location: {
                $concat: ["$_id.state", ", ", "$_id.country"],
            },
            totalSales: 1,
            orderCount: 1,
            uniqueCustomers: { $size: "$uniqueCustomers" },
            avgOrderValue: { $divide: ["$totalSales", "$orderCount"] },
        },
    },

    { $sort: { totalSales: -1 } },
]);
```

---

## Advanced Aggregation Stages

### 1. $unwind - Deconstructing Arrays

Deconstructs an array field to create separate documents for each element

**Syntax:**

```javascript
{ $unwind: "$arrayField" }
// or with options
{ $unwind: {
  path: "$arrayField",
  includeArrayIndex: "arrayIndex",
  preserveNullAndEmptyArrays: true
}}
```

**Example:**

```javascript
// Input document
{ _id: 1, items: ["apple", "banana", "orange"] }

// After $unwind: "$items"
{ _id: 1, items: "apple" }
{ _id: 1, items: "banana" }
{ _id: 1, items: "orange" }
```

### 2. $lookup - Joining Collections

Performs left outer join with another collection

**Syntax:**

```javascript
{ $lookup: {
  from: "otherCollection",
  localField: "localFieldName",
  foreignField: "foreignFieldName",
  as: "resultArrayField"
}}
```

**Example:**

```javascript
// Join orders with customers
db.orders.aggregate([
    {
        $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customerInfo",
        },
    },

    { $unwind: "$customerInfo" },

    {
        $project: {
            orderId: "$_id",
            customerName: "$customerInfo.name",
            customerEmail: "$customerInfo.email",
            totalAmount: 1,
            orderDate: 1,
        },
    },
]);
```

### 3. $facet - Multiple Parallel Pipelines

Processes multiple aggregation pipelines within a single stage

**Syntax:**

```javascript
{ $facet: {
  "pipeline1Name": [ stage1, stage2, ... ],
  "pipeline2Name": [ stage1, stage2, ... ],
  ...
}}
```

**Example:**

```javascript
db.orders.aggregate([
    {
        $facet: {
            salesByMonth: [
                {
                    $group: {
                        _id: { $month: "$orderDate" },
                        total: { $sum: "$totalAmount" },
                    },
                },
                { $sort: { _id: 1 } },
            ],

            topCustomers: [
                {
                    $group: {
                        _id: "$customerId",
                        total: { $sum: "$totalAmount" },
                    },
                },
                { $sort: { total: -1 } },
                { $limit: 5 },
            ],

            statusSummary: [
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ],
        },
    },
]);
```

### 4. $bucket - Data Grouping into Buckets

Groups documents into buckets based on specified boundaries

**Syntax:**

```javascript
{ $bucket: {
  groupBy: <expression>,
  boundaries: [<boundary1>, <boundary2>, ...],
  default: <defaultBucket>,
  output: {
    <outputField1>: <accumulator>,
    ...
  }
}}
```

**Example:**

```javascript
// Group orders by price ranges
db.orders.aggregate([
    {
        $bucket: {
            groupBy: "$totalAmount",
            boundaries: [0, 100, 500, 1000, 5000],
            default: "5000+",
            output: {
                count: { $sum: 1 },
                avgAmount: { $avg: "$totalAmount" },
                orders: { $push: "$_id" },
            },
        },
    },
]);
```

### 5. $addFields - Adding Computed Fields

Adds new fields to documents

**Syntax:**

```javascript
{ $addFields: {
  <newField1>: <expression1>,
  <newField2>: <expression2>,
  ...
}}
```

**Example:**

```javascript
db.orders.aggregate([
    {
        $addFields: {
            orderYear: { $year: "$orderDate" },
            itemCount: { $size: "$items" },
            hasDiscount: { $gt: ["$discount", 0] },
            estimatedTax: { $multiply: ["$totalAmount", 0.08] },
        },
    },
]);
```

### 6. $replaceRoot - Promoting Subdocuments

Replaces the root document with a specified document

**Syntax:**

```javascript
{ $replaceRoot: { newRoot: <expression> } }
```

**Example:**

```javascript
// Promote shipping address to root level
db.orders.aggregate([
    {
        $replaceRoot: {
            newRoot: {
                $mergeObjects: [
                    "$shippingAddress",
                    { orderId: "$_id", totalAmount: "$totalAmount" },
                ],
            },
        },
    },
]);
```

---

## Performance Optimization

### 1. Pipeline Optimization Tips

**Order of Stages:**

```javascript
// Good: Filter early, reduce documents
[
  { $match: { status: "active" } },        // Reduce dataset first
  { $lookup: ... },                       // Then join
  { $group: ... }                         // Finally aggregate
]

// Bad: Process all data first
[
  { $lookup: ... },                       // Process all documents
  { $group: ... },                        // Then group all
  { $match: { status: "active" } }        // Filter at the end
]
```

**Use Indexes:**

```javascript
// Create index for match stage
db.orders.createIndex({ status: 1, orderDate: 1 });

// Then use in aggregation
db.orders.aggregate([
    {
        $match: {
            status: "completed",
            orderDate: { $gte: ISODate("2024-01-01") },
        },
    },
    // ... other stages
]);
```

### 2. Memory Considerations

**Limit Working Set:**

```javascript
// Use $limit early when possible
[
  { $match: { category: "electronics" } },
  { $sort: { price: -1 } },
  { $limit: 100 },                        // Limit early
  { $lookup: ... }                        // Process fewer documents
]
```

**Project Unnecessary Fields:**

```javascript
// Remove large fields early
[
  { $match: { status: "active" } },
  { $project: {
    largeTextField: 0,                    // Remove early
    binaryData: 0
  }},
  { $group: ... }
]
```

### 3. Using Explain

```javascript
// Analyze pipeline performance
db.orders
    .explain("executionStats")
    .aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: "$customerId", total: { $sum: "$amount" } } },
    ]);
```

---

## Best Practices

### 1. Pipeline Design

✅ **Do:**

-   Filter early with `$match`
-   Use indexes for `$match` and `$sort`
-   Limit results when possible
-   Project out unnecessary fields early
-   Use `$limit` after `$sort` for top-N queries

❌ **Don't:**

-   Use `$group` before `$match` when possible to avoid
-   Create very deep pipelines (consider breaking into multiple queries)
-   Ignore memory limits (100MB per stage by default)
-   Use `$lookup` on large collections without proper indexing

### 2. Error Handling

```javascript
// Handle missing fields
{ $project: {
  name: { $ifNull: ["$name", "Unknown"] },
  age: { $ifNull: ["$age", 0] }
}}

// Handle array operations safely
{ $project: {
  itemCount: {
    $cond: {
      if: { $isArray: "$items" },
      then: { $size: "$items" },
      else: 0
    }
  }
}}
```

### 3. Debugging Pipelines

```javascript
// Add debugging stages
db.orders.aggregate([
    { $match: { status: "completed" } },
    { $count: "afterMatch" }, // Check document count

    { $group: { _id: "$customerId", total: { $sum: "$amount" } } },
    { $count: "afterGroup" }, // Check again

    { $sort: { total: -1 } },
]);
```

### 4. Reusable Pipeline Components

```javascript
// Define reusable pipeline stages
const matchActiveOrders = { $match: { status: "active" } };
const projectBasicInfo = { $project: { _id: 1, customerId: 1, amount: 1 } };

// Use in multiple pipelines
db.orders.aggregate([matchActiveOrders, projectBasicInfo, ...]);
```

### 5. Working with Large Datasets

```javascript
// Use allowDiskUse for large operations
db.orders.aggregate(
  [
    { $group: { _id: "$customerId", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } }
  ],
  { allowDiskUse: true }  // Allow using disk for large sorts
)

// Use cursor for large results
const cursor = db.orders.aggregate([...], { cursor: { batchSize: 1000 } });
```

---

## Summary

MongoDB aggregation pipeline is a powerful tool for:

-   **Data Analysis**: Complex analytics and reporting
-   **Data Transformation**: Reshaping and enriching documents
-   **Performance**: Efficient server-side processing
-   **Flexibility**: Handling diverse data processing needs

### Key Takeaways:

1. **Think in Stages**: Each stage transforms the data for the next
2. **Optimize Early**: Filter and limit data as early as possible
3. **Use Indexes**: Especially for `$match` and `$sort` stages
4. **Practice**: Start with simple pipelines and gradually increase complexity
5. **Monitor Performance**: Use `explain()` to understand execution

### Next Steps:

-   Practice with your own datasets
-   Experiment with different stage combinations
-   Learn about MongoDB's aggregation expressions
-   Explore aggregation in MongoDB drivers for your programming language

Happy aggregating! 🚀
