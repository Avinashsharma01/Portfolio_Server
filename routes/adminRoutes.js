import { Router } from "express";
import { getAllPurchases } from "../controllers/adminController.js";

const router = Router();

router.get("/purchases", getAllPurchases);

export default router;
