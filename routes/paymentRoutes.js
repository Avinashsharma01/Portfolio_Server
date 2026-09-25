import { Router } from "express";
import {
  getRazorpayKey,
  createOrder,
  verifyPayment,
} from "../controllers/paymentController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/get-key", getRazorpayKey);
router.post("/create-order", createOrder);
router.post("/verify-payment", optionalAuth, verifyPayment);

export default router;
