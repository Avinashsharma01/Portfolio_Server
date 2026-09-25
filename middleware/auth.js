import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_ecommerce_blueprint_2026_secure!";

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// Middleware: Authenticate JWT from Authorization header
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User account not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired session. Please log in again." });
  }
};

// Optional Auth Middleware (attaches req.user if valid token provided)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : (req.body?.token || null);

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
  } catch {
    // Ignore invalid token in optional auth
  }
  next();
};
