import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

// Initialize Database Connection
connectDB();

// Start HTTP Server
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Razorpay backend server running on http://${HOST}:${PORT} (port ${PORT})`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown handling for cloud container lifecycles (Railway, Docker, etc.)
const handleShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log("🔒 HTTP server closed.");
    try {
      await mongoose.connection.close(false);
      console.log("📦 MongoDB connection closed cleanly.");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error closing MongoDB connection:", err);
      process.exit(1);
    }
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    console.error("⚠️ Forcefully shutting down server due to timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

