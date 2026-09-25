import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { getRazorpayInstance } from "../config/razorpay.js";

// Helper to link tier to user
const linkTierToUser = async (user, tierToUnlock) => {
  if (!user || !tierToUnlock) return user?.purchasedTiers || [];
  let newTiers = [...(user.purchasedTiers || [])];
  if (tierToUnlock === "pro" || tierToUnlock === "mentorship") {
    newTiers = Array.from(new Set([...newTiers, "frontend", "backend", "frontend_bundle", "backend_bundle", "pro", "mentorship"]));
  } else {
    newTiers = Array.from(new Set([...newTiers, tierToUnlock]));
  }
  user.purchasedTiers = newTiers;
  await user.save();
  return newTiers;
};

// GET /api/get-key
export const getRazorpayKey = (req, res) => {
  res.json({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  });
};

// POST /api/create-order
export const createOrder = async (req, res) => {
  try {
    let { amount, currency = "INR", receipt, tier, notes = {} } = req.body;

    const amountInPaise = Math.round(Number(amount));

    // Validate amount >= 100 paise (₹1)
    if (!amountInPaise || isNaN(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Amount is required and must be at least 100 paise (₹1)",
      });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // Check if keys are placeholder dummy values
    const isMock = !key_id || key_id.includes("YourRazorpayKeyIdHere") || !key_secret || key_secret.includes("YourRazorpayKeySecretHere");

    if (isMock) {
      const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      return res.json({
        success: true,
        mock: true,
        order_id: mockOrderId,
        amount: amountInPaise,
        currency: currency,
        key_id: key_id || "rzp_test_placeholder",
        message: "Generated order (Demo mode - please add live RAZORPAY_KEY_ID & SECRET in .env)",
      });
    }

    const instance = getRazorpayInstance();
    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt || `receipt_${tier || "tier"}_${Date.now()}`,
      notes: {
        tier: tier || "general",
        ...notes,
      },
    };

    const order = await instance.orders.create(options);

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    const statusCode = error.statusCode || (error.status === 401 ? 401 : error.error?.code === "BAD_REQUEST_ERROR" ? 400 : 500);
    res.status(statusCode).json({
      success: false,
      message: error.error?.description || error.message || "Failed to create Razorpay order",
    });
  }
};

// POST /api/verify-payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tier,
      amount,
      currency,
      buyerName,
      buyerEmail,
      buyerContact,
    } = req.body;

    // Missing fields: return 400
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // Handle mock signature verification
    if (razorpay_order_id.startsWith("order_mock_") || !key_secret || key_secret.includes("YourRazorpayKeySecretHere")) {
      let linkedUser = req.user;
      if (!linkedUser && buyerEmail) {
        linkedUser = await User.findOne({ email: buyerEmail.toLowerCase().trim() });
      }

      let updatedTiers = [];
      if (linkedUser) {
        updatedTiers = await linkTierToUser(linkedUser, tier);
      }

      // Save mock payment to DB if connected
      if (mongoose.connection.readyState === 1) {
        try {
          await Payment.create({
            userId: linkedUser ? linkedUser._id : null,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature: razorpay_signature || "mock_signature",
            tier: tier || "unknown",
            amount: amount || 0,
            currency: currency || "INR",
            buyerName: buyerName || (linkedUser ? linkedUser.name : ""),
            buyerEmail: buyerEmail || (linkedUser ? linkedUser.email : ""),
            buyerContact: buyerContact || "",
            status: "verified",
            verified: true,
            mock: true,
          });
          console.log(`💾 Mock payment saved: ${razorpay_payment_id} (${tier}) for user: ${linkedUser?.email || "guest"}`);
        } catch (dbErr) {
          console.warn("DB save error (mock):", dbErr.message);
        }
      }

      return res.json({
        success: true,
        verified: true,
        mock: true,
        tier: tier,
        purchasedTiers: updatedTiers.length > 0 ? updatedTiers : [tier],
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        message: "Payment verified successfully (Demo Mode)!",
      });
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Signature mismatch: return 400, do NOT mark as paid
    if (generated_signature === razorpay_signature) {
      // ✅ Signature valid — fetch payment details from Razorpay if available
      let fetchedEmail = buyerEmail || "";
      let fetchedContact = buyerContact || "";
      let fetchedMethod = "";
      let finalAmount = amount || 0;

      try {
        const instance = getRazorpayInstance();
        const paymentDetails = await instance.payments.fetch(razorpay_payment_id);
        if (paymentDetails) {
          fetchedEmail = paymentDetails.email || fetchedEmail;
          fetchedContact = paymentDetails.contact || fetchedContact;
          fetchedMethod = paymentDetails.method || "";
          finalAmount = paymentDetails.amount || finalAmount;
        }
      } catch (fetchErr) {
        console.warn("Could not fetch payment details from Razorpay API:", fetchErr.message);
      }

      // Link with authenticated user or find user by email
      let linkedUser = req.user;
      if (!linkedUser && fetchedEmail) {
        linkedUser = await User.findOne({ email: fetchedEmail.toLowerCase().trim() });
      }

      let updatedTiers = [];
      if (linkedUser) {
        updatedTiers = await linkTierToUser(linkedUser, tier);
      }

      // Save purchase to MongoDB
      if (mongoose.connection.readyState === 1) {
        try {
          await Payment.create({
            userId: linkedUser ? linkedUser._id : null,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            tier: tier || "unknown",
            amount: finalAmount,
            currency: currency || "INR",
            buyerName: buyerName || (linkedUser ? linkedUser.name : ""),
            buyerEmail: fetchedEmail,
            buyerContact: fetchedContact,
            paymentMethod: fetchedMethod,
            status: "verified",
            verified: true,
            mock: false,
          });
          console.log(`💾 Payment saved to MongoDB: ${razorpay_payment_id} | Tier: ${tier} | Amount: ₹${finalAmount / 100} | User: ${linkedUser?.email || fetchedEmail || "guest"}`);
        } catch (dbErr) {
          console.error("DB save error:", dbErr.message);
        }
      }

      return res.json({
        success: true,
        verified: true,
        tier: tier,
        purchasedTiers: updatedTiers.length > 0 ? updatedTiers : (tier === "pro" || tier === "mentorship" ? ["frontend", "backend", "pro", "mentorship"] : [tier]),
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        message: "Payment verified successfully!",
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Signature verification failed. Invalid payment signature.",
      });
    }
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};
