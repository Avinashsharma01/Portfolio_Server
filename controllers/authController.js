import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { generateToken } from "../middleware/auth.js";

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: "Database is connecting, please try again in a few seconds." });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email already exists. Please log in." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      purchasedTiers: [],
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: err.message || "Registration failed." });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: "Database is connecting, please try again in a few seconds." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Logged in successfully!",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: err.message || "Login failed." });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    // Find any payments by this user's email that might have been made prior to registration
    const userPayments = await Payment.find({
      $or: [{ userId: req.user._id }, { buyerEmail: req.user.email }],
      verified: true,
    });

    // Merge purchased tiers
    let tiersSet = new Set(req.user.purchasedTiers || []);
    userPayments.forEach((p) => {
      if (p.tier === "pro" || p.tier === "mentorship") {
        tiersSet.add("frontend");
        tiersSet.add("backend");
        tiersSet.add("frontend_bundle");
        tiersSet.add("backend_bundle");
        tiersSet.add("pro");
        tiersSet.add("mentorship");
      } else if (p.tier) {
        tiersSet.add(p.tier);
      }
    });

    const updatedTiers = Array.from(tiersSet);
    if (updatedTiers.length !== (req.user.purchasedTiers || []).length) {
      req.user.purchasedTiers = updatedTiers;
      await req.user.save();
    }

    res.json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    console.error("Auth me error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/purchases
export const getUserPurchases = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [{ userId: req.user._id }, { buyerEmail: req.user.email }],
      verified: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      purchases: payments,
      purchasedTiers: req.user.purchasedTiers,
    });
  } catch (err) {
    console.error("Get user purchases error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
