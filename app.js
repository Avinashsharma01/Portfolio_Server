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

// ─── Global Middleware ─────────────────────────────────────────────
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Razorpay backend server running cleanly!",
    mongoStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
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
