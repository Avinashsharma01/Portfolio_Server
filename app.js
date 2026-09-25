import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Import route modules
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// ─── CORS Configuration ────────────────────────────────────────────
// Allow configured frontend domains (comma-separated or single) or all origins by default
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : "*";

app.use(
  cors({
    origin: allowedOrigins.length === 1 && allowedOrigins[0] !== "*"
      ? allowedOrigins[0]
      : allowedOrigins.includes("*")
      ? "*"
      : allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ─── Root Status & Health Checks (Railway Compatible) ───────────────
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Portfolio & Course Backend API",
    version: "1.0.0",
    uptime: `${Math.floor(process.uptime())}s`,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    healthCheck: "/api/health",
    timestamp: new Date().toISOString(),
  });
});

app.get(["/health", "/api/health"], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "ok",
    message: "Razorpay & Portfolio backend server running cleanly!",
    mongoStatus: isDbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ─── Route Mounting ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api", paymentRoutes);
app.use("/api", adminRoutes);

// ─── 404 Not Found Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

export default app;
