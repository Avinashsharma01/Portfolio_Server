import mongoose from "mongoose";
import Payment from "../models/Payment.js";

// GET /api/purchases: View all verified purchases and sales analytics
export const getAllPurchases = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const { tier, status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (tier) filter.tier = tier;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [purchases, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Payment.countDocuments(filter),
    ]);

    // Summary stats
    const stats = await Payment.aggregate([
      { $match: { verified: true } },
      {
        $group: {
          _id: "$tier",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$amount" }, // in paise
        },
      },
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      stats: stats.map((s) => ({
        tier: s._id,
        count: s.count,
        totalRevenue: `₹${(s.totalRevenue / 100).toFixed(2)}`,
      })),
      purchases,
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
