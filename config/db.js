import mongoose from "mongoose";

const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    process.env.MONGO_PRIVATE_URL ||
    "mongodb://127.0.0.1:27017/razorpay-purchases";

  // Mask credentials so passwords are not leaked in deployment logs
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");

  if (!process.env.MONGODB_URI && !process.env.MONGO_URL && process.env.NODE_ENV === "production") {
    console.warn("⚠️ Warning: Neither MONGODB_URI nor MONGO_URL is set in environment variables! Cloud databases cannot use localhost.");
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`✅ MongoDB connected successfully (${maskedUri})`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    if (!process.env.MONGODB_URI && !process.env.MONGO_URL) {
      console.warn("💡 Tip for Railway: In your Railway dashboard, add MONGODB_URI or add a MongoDB database service to this project.");
    }
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
