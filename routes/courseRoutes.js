import { Router } from "express";
import {
  getCatalog,
  getChapter,
  getProgress,
  toggleProgress,
} from "../controllers/courseController.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/catalog", getCatalog);
router.get("/chapter", optionalAuth, getChapter);
router.get("/progress", authenticateToken, getProgress);
router.post("/progress/toggle", authenticateToken, toggleProgress);

export default router;
