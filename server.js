import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`🚀 Razorpay backend server running on http://localhost:${PORT}`);
});
