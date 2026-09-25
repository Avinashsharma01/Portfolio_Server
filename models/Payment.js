import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  // Razorpay identifiers
  razorpay_order_id: {
    type: String,
    required: true,
    index: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
    unique: true,
  },
  razorpay_signature: {
    type: String,
    required: true,
  },

  // Purchase details
  tier: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true, // stored in paise
  },
  currency: {
    type: String,
    default: "INR",
  },

  // User Reference (if authenticated)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true,
  },

  // Buyer info (from Razorpay prefill / checkout)
  buyerName: {
    type: String,
    default: "",
  },
  buyerEmail: {
    type: String,
    default: "",
  },
  buyerContact: {
    type: String,
    default: "",
  },
  paymentMethod: {
    type: String,
    default: "",
  },

  // Status
  status: {
    type: String,
    enum: ["created", "verified", "failed"],
    default: "verified",
  },
  verified: {
    type: Boolean,
    default: true,
  },
  mock: {
    type: Boolean,
    default: false,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual to get amount in INR (rupees)
paymentSchema.virtual("amountInINR").get(function () {
  return this.amount / 100;
});

// Ensure virtuals are included in JSON output
paymentSchema.set("toJSON", { virtuals: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
