# Phase 12 — File Uploads & Streams

## Table of Contents

- [File Uploads Basics](#file-uploads-basics)
- [Multer — File Upload Middleware](#multer--file-upload-middleware)
- [Single File Upload](#single-file-upload)
- [Multiple File Uploads](#multiple-file-uploads)
- [File Validation](#file-validation)
- [Cloud Storage (AWS S3)](#cloud-storage-aws-s3)
- [Image Processing](#image-processing)
- [Node.js Streams Deep Dive](#nodejs-streams-deep-dive)
- [Stream Types](#stream-types)
- [Piping Streams](#piping-streams)
- [Practical Stream Examples](#practical-stream-examples)
- [Key Takeaways](#key-takeaways)

---

## File Uploads Basics

### How File Uploads Work

```
1. Client sends file in a multipart/form-data request
2. Server receives the raw binary data
3. Server parses the data and saves the file
4. Server returns file info (path, URL) to client

Content-Type: multipart/form-data

The body is split into "parts" separated by a boundary:
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

[binary data here]
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="name"

Avinash
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

### Why Not express.json()?

```
express.json()     → Parses JSON bodies (application/json)
express.urlencoded → Parses form data (application/x-www-form-urlencoded)
multer             → Parses file uploads (multipart/form-data)

You need Multer because files are binary data, not text/JSON.
```

---

## Multer — File Upload Middleware

```bash
npm install multer
```

### Basic Setup

```javascript
const multer = require("multer");

// Simple setup — stores in memory
const upload = multer({ dest: "uploads/" }); // Files saved to uploads/ folder

// Or configure storage explicitly
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Where to save
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp-originalname
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split(".").pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
    },
});

const upload = multer({ storage });
```

### File Object Properties

When Multer processes a file, it adds a `file` object to `req`:

```javascript
req.file = {
    fieldname: "avatar",                    // Form field name
    originalname: "photo.jpg",              // Original filename
    encoding: "7bit",                       // File encoding
    mimetype: "image/jpeg",                 // MIME type
    destination: "uploads/",                // Where saved
    filename: "avatar-1705312000-123.jpg",  // Generated filename
    path: "uploads/avatar-1705312000.jpg",  // Full path
    size: 524288,                           // Size in bytes
};
```

---

## Single File Upload

```javascript
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Ensure uploads directory exists
const uploadDir = "uploads/avatars";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
        }
    },
});

// Route — "avatar" matches the form field name
app.post("/api/users/avatar", upload.single("avatar"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
        success: true,
        data: {
            filename: req.file.filename,
            path: `/uploads/avatars/${req.file.filename}`,
            size: req.file.size,
            mimetype: req.file.mimetype,
        },
    });
});

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));
```

### Frontend Form

```html
<!-- HTML form for file upload -->
<form action="/api/users/avatar" method="POST" enctype="multipart/form-data">
    <input type="file" name="avatar" accept="image/*" />
    <button type="submit">Upload</button>
</form>
```

```javascript
// JavaScript (fetch API)
const formData = new FormData();
formData.append("avatar", fileInput.files[0]);

const response = await fetch("/api/users/avatar", {
    method: "POST",
    body: formData,
    // Don't set Content-Type — browser sets it with boundary automatically
});
```

---

## Multiple File Uploads

### Multiple Files, Same Field

```javascript
// Up to 10 photos
app.post("/api/posts/photos", upload.array("photos", 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    const fileData = req.files.map(file => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
        size: file.size,
    }));

    res.json({ success: true, data: fileData });
});
```

### Multiple Fields, Different Files

```javascript
const cpUpload = upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
]);

app.post("/api/users/photos", cpUpload, (req, res) => {
    // req.files is an object:
    // req.files.avatar[0]        — single avatar
    // req.files.coverPhoto[0]    — single cover photo
    // req.files.gallery          — array of gallery photos

    res.json({
        success: true,
        data: {
            avatar: req.files.avatar?.[0]?.filename,
            coverPhoto: req.files.coverPhoto?.[0]?.filename,
            gallery: req.files.gallery?.map(f => f.filename),
        },
    });
});
```

---

## File Validation

### Comprehensive Validation

```javascript
// config/multerConfig.js
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const ALLOWED_TYPES = {
    image: {
        mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        maxSize: 5 * 1024 * 1024, // 5MB
    },
    document: {
        mimeTypes: ["application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        maxSize: 10 * 1024 * 1024, // 10MB
    },
    video: {
        mimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
        maxSize: 100 * 1024 * 1024, // 100MB
    },
};

const createUpload = (type, destination) => {
    const config = ALLOWED_TYPES[type];
    if (!config) throw new Error(`Unknown upload type: ${type}`);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, destination),
        filename: (req, file, cb) => {
            // Generate random filename to prevent path traversal
            const randomName = crypto.randomBytes(16).toString("hex");
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${randomName}${ext}`);
        },
    });

    return multer({
        storage,
        limits: { fileSize: config.maxSize },
        fileFilter: (req, file, cb) => {
            if (config.mimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error(`Invalid file type. Allowed: ${config.mimeTypes.join(", ")}`));
            }
        },
    });
};

module.exports = { createUpload };
```

### Handle Multer Errors

```javascript
// Wrap upload middleware to handle errors
const handleUpload = (uploadMiddleware) => (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors
            const messages = {
                LIMIT_FILE_SIZE: "File too large",
                LIMIT_FILE_COUNT: "Too many files",
                LIMIT_UNEXPECTED_FILE: "Unexpected file field",
            };
            return res.status(400).json({
                error: messages[err.code] || err.message,
            });
        }
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// Usage
const imageUpload = createUpload("image", "uploads/images");
app.post("/api/upload", handleUpload(imageUpload.single("image")), controller);
```

---

## Cloud Storage (AWS S3)

In production, store files in cloud storage (S3, GCS, Azure Blob) instead of local disk.

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer-s3
```

### Upload Directly to S3

```javascript
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const multer = require("multer");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const uniqueName = `uploads/${Date.now()}-${file.originalname}`;
            cb(null, uniqueName);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

app.post("/api/upload", upload.single("file"), (req, res) => {
    res.json({
        success: true,
        data: {
            url: req.file.location,  // S3 URL
            key: req.file.key,       // S3 key
            size: req.file.size,
        },
    });
});
```

### Pre-Signed URLs (Better for Large Files)

```javascript
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Generate upload URL — client uploads directly to S3
app.post("/api/upload/presigned-url", async (req, res) => {
    const { filename, contentType } = req.body;
    const key = `uploads/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({
        success: true,
        data: { uploadUrl, key },
    });
});

// Client then PUTs the file directly to the pre-signed URL
```

---

## Image Processing

### Using Sharp

```bash
npm install sharp
```

```javascript
const sharp = require("sharp");
const path = require("path");

// Process uploaded image
app.post("/api/upload/image", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const originalPath = req.file.path;
    const processedDir = "uploads/processed";

    // Generate different sizes
    const sizes = {
        thumbnail: { width: 150, height: 150 },
        medium: { width: 600, height: 400 },
        large: { width: 1200, height: 800 },
    };

    const results = {};

    for (const [name, dimensions] of Object.entries(sizes)) {
        const outputPath = path.join(processedDir, `${name}-${req.file.filename}`);
        await sharp(originalPath)
            .resize(dimensions.width, dimensions.height, {
                fit: "cover",
                position: "center",
            })
            .jpeg({ quality: 80 })
            .toFile(outputPath);

        results[name] = `/uploads/processed/${name}-${req.file.filename}`;
    }

    res.json({ success: true, data: results });
});
```

### Memory Storage + Sharp Pipeline

```javascript
// Use memory storage (no temp files on disk)
const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

app.post("/api/upload/avatar", memoryUpload.single("avatar"), async (req, res) => {
    const processedBuffer = await sharp(req.file.buffer)
        .resize(200, 200)
        .jpeg({ quality: 80 })
        .toBuffer();

    // Save to disk or upload to S3
    const filename = `avatar-${Date.now()}.jpg`;
    await sharp(processedBuffer).toFile(`uploads/avatars/${filename}`);

    res.json({ success: true, data: { path: `/uploads/avatars/${filename}` } });
});
```

---

## Node.js Streams Deep Dive

### What Are Streams?

Streams process data piece by piece instead of loading everything into memory at once.

```
WITHOUT STREAMS (Buffering):
Read entire file into memory → Process all at once → Write entire file
Problem: 1GB file = 1GB of memory used!

WITH STREAMS:
Read small chunk → Process chunk → Write chunk → Read next chunk...
Advantage: Even a 1GB file uses only ~16KB-64KB of memory!
```

### Why Streams?

```
File Size    │ Buffering (fs.readFile) │ Streaming (fs.createReadStream)
─────────────┼────────────────────────┼─────────────────────────────────
10 KB        │ ✅ Fine                 │ Not needed
1 MB         │ ✅ Fine                 │ Optional
100 MB       │ ⚠️ Slow                │ ✅ Recommended
1 GB         │ ❌ Out of memory       │ ✅ Required
10 GB        │ ❌ Impossible          │ ✅ Required
```

---

## Stream Types

### 1. Readable Streams

Sources of data you can read from.

```javascript
const fs = require("fs");

// Create a readable stream
const readStream = fs.createReadStream("large-file.txt", {
    encoding: "utf8",
    highWaterMark: 64 * 1024, // 64KB chunks (default: 64KB)
});

// Event: data — fired for each chunk
readStream.on("data", (chunk) => {
    console.log(`Received ${chunk.length} bytes`);
});

// Event: end — no more data
readStream.on("end", () => {
    console.log("Finished reading");
});

// Event: error
readStream.on("error", (err) => {
    console.error("Read error:", err);
});
```

### 2. Writable Streams

Destinations you can write to.

```javascript
const writeStream = fs.createWriteStream("output.txt");

writeStream.write("Hello ");
writeStream.write("World\n");
writeStream.write("Line 2\n");
writeStream.end("Final line"); // End and close the stream

writeStream.on("finish", () => {
    console.log("Finished writing");
});
```

### 3. Duplex Streams

Both readable and writable (e.g., TCP sockets).

```javascript
const net = require("net");

const server = net.createServer((socket) => {
    // socket is a duplex stream
    socket.on("data", (data) => {
        socket.write(`Echo: ${data}`); // Read and write
    });
});
```

### 4. Transform Streams

Modify data as it passes through.

```javascript
const { Transform } = require("stream");

const upperCaseTransform = new Transform({
    transform(chunk, encoding, callback) {
        this.push(chunk.toString().toUpperCase());
        callback();
    },
});

// Usage
process.stdin.pipe(upperCaseTransform).pipe(process.stdout);
```

---

## Piping Streams

### Basic Pipe

```javascript
const fs = require("fs");

// Copy a file using streams
const readStream = fs.createReadStream("input.txt");
const writeStream = fs.createWriteStream("output.txt");

readStream.pipe(writeStream);

// Equivalent to:
readStream.on("data", (chunk) => writeStream.write(chunk));
readStream.on("end", () => writeStream.end());
```

### Pipeline (Modern, with Error Handling)

```javascript
const { pipeline } = require("stream/promises");
const fs = require("fs");
const zlib = require("zlib");

// Compress a file
async function compressFile(input, output) {
    await pipeline(
        fs.createReadStream(input),
        zlib.createGzip(),
        fs.createWriteStream(output)
    );
    console.log("Compression complete");
}

compressFile("large-file.txt", "large-file.txt.gz");
```

### Chain Multiple Transforms

```javascript
const { pipeline } = require("stream/promises");
const { Transform } = require("stream");

// Custom transform: filter lines containing "ERROR"
const filterErrors = new Transform({
    transform(chunk, encoding, callback) {
        const lines = chunk.toString().split("\n");
        const errorLines = lines.filter(line => line.includes("ERROR"));
        if (errorLines.length > 0) {
            this.push(errorLines.join("\n") + "\n");
        }
        callback();
    },
});

// Parse log file → filter errors → save to new file
await pipeline(
    fs.createReadStream("app.log"),
    filterErrors,
    fs.createWriteStream("errors.log")
);
```

---

## Practical Stream Examples

### 1. Streaming File Download

```javascript
app.get("/api/download/:filename", (req, res) => {
    const filePath = path.join(__dirname, "files", req.params.filename);

    // Check file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    const stat = fs.statSync(filePath);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Disposition", `attachment; filename="${req.params.filename}"`);

    // Stream the file (efficient for large files)
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Download failed" });
        }
    });
});
```

### 2. CSV Export with Streams

```javascript
app.get("/api/users/export", async (req, res) => {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");

    // Write CSV header
    res.write("id,name,email,role\n");

    // Stream users from database in batches
    const cursor = User.find().cursor();

    for await (const user of cursor) {
        res.write(`${user._id},${user.name},${user.email},${user.role}\n`);
    }

    res.end();
});
```

### 3. Upload with Progress Tracking

```javascript
app.post("/api/upload/large", (req, res) => {
    const fileSize = parseInt(req.headers["content-length"]);
    let uploaded = 0;

    req.on("data", (chunk) => {
        uploaded += chunk.length;
        const progress = Math.round((uploaded / fileSize) * 100);
        console.log(`Upload progress: ${progress}%`);
    });

    const writeStream = fs.createWriteStream("uploads/large-file");
    req.pipe(writeStream);

    writeStream.on("finish", () => {
        res.json({ success: true, message: "Upload complete" });
    });
});
```

### 4. JSON Streaming for Large Datasets

```javascript
app.get("/api/data/stream", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.write("[\n");

    const cursor = DataModel.find().cursor();
    let first = true;

    for await (const doc of cursor) {
        if (!first) res.write(",\n");
        res.write(JSON.stringify(doc));
        first = false;
    }

    res.write("\n]");
    res.end();
});
```

---

## Key Takeaways

1. **Multer** handles multipart/form-data (file uploads) — express.json() cannot
2. **Always validate files** — check type, size, and sanitize filenames
3. **Use random filenames** to prevent path traversal attacks
4. **Cloud storage** (S3) is preferred for production over local disk
5. **Pre-signed URLs** let clients upload directly to S3 (better for large files)
6. **Sharp** for server-side image processing (resize, compress, convert)
7. **Streams process data in chunks** — essential for large files
8. **pipeline()** is the modern way to pipe streams with proper error handling
9. **Always handle stream errors** — otherwise they crash the process
10. **Mongoose cursors** with `for await` are great for streaming DB results

---

## Practice Exercises

1. **Avatar upload:** Build an avatar upload endpoint with Multer (validate image type, max 2MB)
2. **Multiple uploads:** Create a gallery upload that accepts up to 10 images
3. **Image processing:** Resize uploaded images into thumbnail, medium, and large with Sharp
4. **File download:** Build a streaming file download endpoint
5. **CSV export:** Stream database records to a CSV file download
6. **S3 upload:** Configure Multer to upload directly to AWS S3

---

**Previous:** [← Phase 11 — Error Handling & Logging](Phase-11-Error-Handling-Logging.md)

**Next:** [Phase 13 — Security Best Practices →](Phase-13-Security-Best-Practices.md)
