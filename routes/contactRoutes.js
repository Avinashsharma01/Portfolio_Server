import { Router } from "express";
import {
  submitContact,
  getMessages,
  updateMessageStatus,
  deleteMessage,
} from "../controllers/contactController.js";

const router = Router();

router.post("/", submitContact);
router.get("/messages", getMessages);
router.patch("/messages/:id/status", updateMessageStatus);
router.delete("/messages/:id", deleteMessage);

export default router;
