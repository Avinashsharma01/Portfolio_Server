import { Router } from "express";
import {
  register,
  login,
  getMe,
  getUserPurchases,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);
router.get("/purchases", authenticateToken, getUserPurchases);

export default router;
