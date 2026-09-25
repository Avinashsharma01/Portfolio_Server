import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/razorpay-purchases";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB connected successfully to ${uri}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};

mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected event fired");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection event error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected");
});

export default connectDB;
