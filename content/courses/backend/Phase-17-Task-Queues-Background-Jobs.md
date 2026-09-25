# Phase 17 — Task Queues & Background Jobs

## Table of Contents

- [Why Background Jobs?](#why-background-jobs)
- [Queue Architecture](#queue-architecture)
- [BullMQ — Production Queue](#bullmq--production-queue)
- [Job Types & Patterns](#job-types--patterns)
- [Delayed & Scheduled Jobs](#delayed--scheduled-jobs)
- [Repeatable Jobs (Cron)](#repeatable-jobs-cron)
- [Job Events & Monitoring](#job-events--monitoring)
- [Priority Queues](#priority-queues)
- [Retry & Error Handling](#retry--error-handling)
- [Real-World Examples](#real-world-examples)
- [Bull Board — Dashboard](#bull-board--dashboard)
- [Key Takeaways](#key-takeaways)

---

## Why Background Jobs?

```
WITHOUT QUEUES:
User clicks "Send Email" → Server sends email (3-5 seconds) → User waits → Response
User clicks "Generate PDF" → Server generates PDF (10 seconds) → User waits → Response
Problem: User is blocked, server threads are stuck, timeouts happen

WITH QUEUES:
User clicks "Send Email" → Server adds to queue → Response immediately (50ms)
                            Worker picks up job → Sends email in background
User clicks "Generate PDF" → Server adds to queue → Response immediately (50ms)
                              Worker picks up job → Generates PDF in background
```

### Use Cases for Background Jobs

| Task | Why Background? |
|------|----------------|
| Send emails | Slow, external API, can retry |
| Generate reports/PDFs | CPU intensive, takes time |
| Process image uploads | Resize, compress, transform |
| Send push notifications | Batch processing, external service |
| Data import/export | Large datasets, can take minutes |
| Cleanup old data | Periodic maintenance |
| Sync with third-party APIs | External dependency, rate limits |
| Send webhooks | Retry on failure, ordered delivery |

---

## Queue Architecture

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌──────────┐
│  Client  │ ──→ │  Server │ ──→ │  Redis  │ ←── │  Worker  │
│ (Browser)│     │ (API)   │     │ (Queue) │     │ (Process)│
└─────────┘     └─────────┘     └─────────┘     └──────────┘
                    │                                  │
              Adds job to queue              Picks up and processes job
              Returns immediately            Runs in separate process

Components:
├── Producer: Adds jobs to the queue (your API server)
├── Queue: Stores jobs (backed by Redis)
├── Consumer/Worker: Processes jobs (separate process)
└── Job: Unit of work with data and status
```

---

## BullMQ — Production Queue

BullMQ is the standard task queue library for Node.js (successor to Bull).

```bash
npm install bullmq
```

### Basic Setup

```javascript
// queues/emailQueue.js
const { Queue } = require("bullmq");

const emailQueue = new Queue("email", {
    connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
    },
});

module.exports = emailQueue;
```

### Adding Jobs (Producer)

```javascript
// controllers/authController.js
const emailQueue = require("../queues/emailQueue");

const register = async (req, res) => {
    const user = await User.create(req.body);

    // Add email job to queue (returns immediately)
    await emailQueue.add("welcome-email", {
        to: user.email,
        name: user.name,
        subject: "Welcome to our platform!",
    });

    res.status(201).json({
        success: true,
        data: user,
        message: "Registration successful. Welcome email will be sent shortly.",
    });
};
```

### Processing Jobs (Worker)

```javascript
// workers/emailWorker.js
const { Worker } = require("bullmq");
const { sendEmail } = require("../services/emailService");

const emailWorker = new Worker(
    "email", // Queue name
    async (job) => {
        console.log(`Processing job ${job.id}: ${job.name}`);

        const { to, name, subject } = job.data;

        // Process the job
        switch (job.name) {
            case "welcome-email":
                await sendEmail({
                    to,
                    subject,
                    html: `<h1>Welcome, ${name}!</h1><p>Thanks for joining.</p>`,
                });
                break;
            case "password-reset":
                await sendEmail({
                    to,
                    subject: "Password Reset",
                    html: `<p>Click <a href="${job.data.resetUrl}">here</a> to reset.</p>`,
                });
                break;
            default:
                throw new Error(`Unknown job type: ${job.name}`);
        }

        console.log(`Job ${job.id} completed`);
        return { sent: true, to };
    },
    {
        connection: {
            host: process.env.REDIS_HOST || "localhost",
            port: process.env.REDIS_PORT || 6379,
        },
        concurrency: 5, // Process 5 jobs simultaneously
    }
);

emailWorker.on("completed", (job, result) => {
    console.log(`✅ Email sent to ${result.to}`);
});

emailWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
});

module.exports = emailWorker;
```

### Running Workers

```json
// package.json
{
    "scripts": {
        "start": "node server.js",
        "worker": "node workers/emailWorker.js",
        "worker:all": "node workers/index.js"
    }
}
```

```bash
# Terminal 1: Start API server
npm start

# Terminal 2: Start worker (separate process)
npm run worker
```

---

## Job Types & Patterns

### Named Jobs

```javascript
// One queue, multiple job types
const emailQueue = new Queue("email");

// Different job types
await emailQueue.add("welcome-email", { to, name });
await emailQueue.add("password-reset", { to, resetUrl });
await emailQueue.add("order-confirmation", { to, orderId });
await emailQueue.add("weekly-digest", { to, articles });
```

### Job Options

```javascript
await emailQueue.add("welcome-email", { to, name }, {
    // Retry options
    attempts: 3,                      // Retry up to 3 times
    backoff: {
        type: "exponential",          // Wait longer between retries
        delay: 2000,                  // Start with 2s (then 4s, 8s)
    },

    // Priority (lower = higher priority)
    priority: 1,                      // 1 = highest priority

    // Delay
    delay: 5000,                      // Wait 5 seconds before processing

    // Remove when complete
    removeOnComplete: { count: 1000 }, // Keep last 1000 completed jobs
    removeOnFail: { count: 5000 },     // Keep last 5000 failed jobs

    // Job ID (for deduplication)
    jobId: `welcome-${userId}`,       // Prevent duplicate jobs
});
```

---

## Delayed & Scheduled Jobs

### Delayed Jobs

```javascript
// Send reminder email after 24 hours
await emailQueue.add(
    "reminder",
    { to: user.email, message: "Don't forget to complete your profile!" },
    { delay: 24 * 60 * 60 * 1000 } // 24 hours in milliseconds
);

// Schedule follow-up after 3 days
await emailQueue.add(
    "followup",
    { to: user.email, orderId },
    { delay: 3 * 24 * 60 * 60 * 1000 } // 3 days
);
```

### Scheduled at Specific Time

```javascript
// Schedule for a specific date/time
const scheduledDate = new Date("2025-01-01T09:00:00Z");
const delay = scheduledDate.getTime() - Date.now();

if (delay > 0) {
    await emailQueue.add("new-year-promo", { to: user.email }, { delay });
}
```

---

## Repeatable Jobs (Cron)

```javascript
// Run every day at midnight
await emailQueue.add(
    "daily-digest",
    { type: "daily" },
    {
        repeat: {
            pattern: "0 0 * * *", // Cron syntax: minute hour day month weekday
        },
    }
);

// Run every hour
await emailQueue.add(
    "metrics-snapshot",
    {},
    { repeat: { pattern: "0 * * * *" } }
);

// Run every Monday at 9 AM
await emailQueue.add(
    "weekly-report",
    {},
    { repeat: { pattern: "0 9 * * 1" } }
);

// Run every 5 minutes
await emailQueue.add(
    "health-check",
    {},
    { repeat: { every: 5 * 60 * 1000 } } // 5 minutes in ms
);
```

### Cron Syntax Reference

```
* * * * *
│ │ │ │ │
│ │ │ │ └── Day of Week (0-7, 0 and 7 = Sunday)
│ │ │ └──── Month (1-12)
│ │ └────── Day of Month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)

Examples:
"0 0 * * *"     → Every day at midnight
"*/15 * * * *"  → Every 15 minutes
"0 9 * * 1-5"  → Weekdays at 9 AM
"0 0 1 * *"    → First day of every month
"0 */6 * * *"  → Every 6 hours
```

---

## Job Events & Monitoring

### Worker Events

```javascript
const worker = new Worker("email", processor, { connection });

worker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed. Result:`, result);
});

worker.on("failed", (job, error) => {
    console.error(`Job ${job.id} failed. Error:`, error.message);
    console.error(`Attempt: ${job.attemptsMade} / ${job.opts.attempts}`);
});

worker.on("progress", (job, progress) => {
    console.log(`Job ${job.id} progress: ${progress}%`);
});

worker.on("error", (error) => {
    console.error("Worker error:", error);
});
```

### Job Progress

```javascript
// Worker — report progress for long-running jobs
const worker = new Worker("export", async (job) => {
    const { userId, format } = job.data;
    const records = await getRecords(userId);
    const total = records.length;

    const results = [];
    for (let i = 0; i < total; i++) {
        results.push(await processRecord(records[i]));

        // Update progress
        await job.updateProgress(Math.round(((i + 1) / total) * 100));
    }

    return { file: await saveExport(results, format) };
});
```

### Queue Events

```javascript
const { QueueEvents } = require("bullmq");

const queueEvents = new QueueEvents("email", { connection });

queueEvents.on("completed", ({ jobId, returnvalue }) => {
    console.log(`Job ${jobId} completed with:`, returnvalue);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.error(`Job ${jobId} failed:`, failedReason);
});

queueEvents.on("waiting", ({ jobId }) => {
    console.log(`Job ${jobId} is waiting`);
});
```

---

## Priority Queues

```javascript
// Lower number = higher priority
await emailQueue.add("password-reset", data, { priority: 1 });   // Urgent
await emailQueue.add("order-confirm", data, { priority: 5 });     // Normal
await emailQueue.add("marketing", data, { priority: 10 });        // Low
await emailQueue.add("weekly-digest", data, { priority: 20 });    // Lowest

// Processing order (regardless of when added):
// 1. password-reset (priority 1) — processed first
// 2. order-confirm (priority 5)
// 3. marketing (priority 10)
// 4. weekly-digest (priority 20) — processed last
```

---

## Retry & Error Handling

### Retry Strategies

```javascript
// Exponential backoff (recommended)
await emailQueue.add("send", data, {
    attempts: 5,
    backoff: {
        type: "exponential",
        delay: 1000, // 1s, 2s, 4s, 8s, 16s
    },
});

// Fixed delay
await emailQueue.add("send", data, {
    attempts: 3,
    backoff: {
        type: "fixed",
        delay: 5000, // Always wait 5 seconds between retries
    },
});
```

### Dead Letter Queue

```javascript
// After all retries fail, move to dead letter queue
const deadLetterQueue = new Queue("dead-letter", { connection });

const worker = new Worker("email", async (job) => {
    try {
        await sendEmail(job.data);
    } catch (error) {
        if (job.attemptsMade >= job.opts.attempts - 1) {
            // Final attempt failed — move to dead letter queue
            await deadLetterQueue.add("failed-email", {
                originalJob: job.data,
                error: error.message,
                failedAt: new Date(),
            });
        }
        throw error; // Re-throw to trigger retry
    }
}, { connection });
```

---

## Real-World Examples

### Image Processing Queue

```javascript
// queues/imageQueue.js
const imageQueue = new Queue("image-processing", { connection });

// Producer — when user uploads image
const uploadImage = async (req, res) => {
    const image = req.file;

    await imageQueue.add("resize", {
        filePath: image.path,
        userId: req.user._id,
        sizes: [
            { width: 150, height: 150, name: "thumbnail" },
            { width: 800, height: 600, name: "medium" },
            { width: 1920, height: 1080, name: "large" },
        ],
    });

    res.json({ message: "Image uploaded. Processing in background." });
};

// Worker
const sharp = require("sharp");
const path = require("path");

const imageWorker = new Worker("image-processing", async (job) => {
    const { filePath, sizes, userId } = job.data;

    const results = [];
    for (let i = 0; i < sizes.length; i++) {
        const { width, height, name } = sizes[i];
        const outputPath = path.join("uploads", `${path.parse(filePath).name}-${name}.webp`);

        await sharp(filePath)
            .resize(width, height, { fit: "cover" })
            .webp({ quality: 80 })
            .toFile(outputPath);

        results.push({ name, path: outputPath });
        await job.updateProgress(Math.round(((i + 1) / sizes.length) * 100));
    }

    return results;
}, { connection });
```

### Data Export Queue

```javascript
// Export large dataset as CSV
const exportWorker = new Worker("export", async (job) => {
    const { userId, filters, format } = job.data;

    await job.updateProgress(10);

    // Fetch data in batches
    const batchSize = 1000;
    let page = 0;
    const allData = [];

    while (true) {
        const batch = await Order.find(filters)
            .skip(page * batchSize)
            .limit(batchSize)
            .lean();

        if (batch.length === 0) break;
        allData.push(...batch);
        page++;

        await job.updateProgress(10 + Math.min(60, page * 10));
    }

    await job.updateProgress(70);

    // Generate file
    const filePath = `exports/export-${userId}-${Date.now()}.csv`;
    await generateCSV(allData, filePath);

    await job.updateProgress(90);

    // Save export record
    await Export.create({ user: userId, filePath, recordCount: allData.length });

    await job.updateProgress(100);

    return { filePath, recordCount: allData.length };
}, { connection, concurrency: 2 });
```

---

## Bull Board — Dashboard

```bash
npm install @bull-board/express @bull-board/api
```

```javascript
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const emailQueue = require("./queues/emailQueue");
const imageQueue = require("./queues/imageQueue");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
    queues: [
        new BullMQAdapter(emailQueue),
        new BullMQAdapter(imageQueue),
    ],
    serverAdapter,
});

// Mount the dashboard (protect in production!)
app.use("/admin/queues", serverAdapter.getRouter());

// Visit http://localhost:3000/admin/queues to see the dashboard
```

```
Dashboard shows:
├── Active jobs (currently processing)
├── Waiting jobs (in queue)
├── Completed jobs (with results)
├── Failed jobs (with error details)
├── Delayed jobs (scheduled for later)
└── Repeatable jobs (cron schedules)
```

---

## Key Takeaways

1. **Use queues for anything slow, unreliable, or non-essential to the response**
2. **BullMQ + Redis** is the standard stack for Node.js background jobs
3. **Workers run in separate processes** — they don't block your API server
4. **Always set retry strategies** with exponential backoff for external services
5. **Delayed jobs** are great for reminders, follow-ups, and scheduled tasks
6. **Repeatable jobs** replace cron jobs with better reliability and monitoring
7. **Report progress** for long-running jobs so users can track status
8. **Priority queues** ensure urgent jobs (password reset) are processed first
9. **Dead letter queues** capture permanently failed jobs for investigation
10. **Bull Board** provides a visual dashboard for monitoring all your queues

---

## Practice Exercises

1. **Email queue:** Set up a BullMQ queue for sending emails with retry logic
2. **Image processing:** Create a worker that resizes uploaded images in background
3. **Scheduled jobs:** Set up daily cleanup (delete expired tokens, old logs)
4. **Progress tracking:** Implement a data export job with progress updates
5. **Priority queue:** Add priority levels for different email types
6. **Dashboard:** Install Bull Board and monitor your queues

---

**Previous:** [← Phase 16 — WebSockets & Real-Time](Phase-16-WebSockets-Realtime.md)

**Next:** [Phase 18 — Microservices Architecture →](Phase-18-Microservices-Architecture.md)
