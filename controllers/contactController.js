import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Message from "../models/Message.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_MESSAGES_FILE = path.join(__dirname, "..", "contact_messages_backup.json");

// Helper for local file fallback backup
const appendToBackup = (messageData) => {
  try {
    let existing = [];
    if (fs.existsSync(BACKUP_MESSAGES_FILE)) {
      existing = JSON.parse(fs.readFileSync(BACKUP_MESSAGES_FILE, "utf-8") || "[]");
    }
    existing.push(messageData);
    fs.writeFileSync(BACKUP_MESSAGES_FILE, JSON.stringify(existing, null, 2), "utf-8");
  } catch (backupErr) {
    console.error("⚠️ Failed to write to contact backup file:", backupErr.message);
  }
};

// POST /api/contact: Submit a new contact message
export const submitContact = async (req, res) => {
  try {
    let { name, email, subject, message } = req.body;

    // Validate presence
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields (Name, Email, Subject, and Message).",
      });
    }

    name = String(name).trim();
    email = String(email).trim().toLowerCase();
    subject = String(subject).trim();
    message = String(message).trim();

    // Validate lengths
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (subject.length < 2 || subject.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Subject must be between 2 and 200 characters.",
      });
    }

    if (message.length < 5 || message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message must be between 5 and 5000 characters.",
      });
    }

    const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    const messageData = {
      name,
      email,
      subject,
      message,
      ip: String(ip).slice(0, 100),
      userAgent: String(userAgent).slice(0, 300),
      createdAt: new Date(),
    };

    let savedMessage = null;

    // Attempt MongoDB save if connected
    if (mongoose.connection.readyState === 1) {
      try {
        savedMessage = await Message.create(messageData);
      } catch (mongoErr) {
        console.error("⚠️ MongoDB error saving contact message, falling back to backup file:", mongoErr.message);
      }
    }

    // Always append to backup file as reliable persistent storage
    appendToBackup({ ...messageData, _id: savedMessage?._id || `local_${Date.now()}` });

    console.log(`📬 [Contact Form] New message from "${name}" <${email}> | Subject: "${subject}"`);

    return res.status(201).json({
      success: true,
      message: "Thank you! Your message has been sent successfully. I'll get back to you soon.",
      data: {
        id: savedMessage?._id || `msg_${Date.now()}`,
        name,
        email,
        subject,
        createdAt: messageData.createdAt,
      },
    });
  } catch (err) {
    console.error("❌ Error processing contact message:", err);
    return res.status(500).json({
      success: false,
      message: "An internal error occurred while sending your message. Please try emailing directly at avinashsharma31384@gmail.com",
    });
  }
};

// GET /api/contact/messages: View received messages (sorted newest first)
export const getMessages = async (req, res) => {
  try {
    let messages = [];

    if (mongoose.connection.readyState === 1) {
      messages = await Message.find().sort({ createdAt: -1 }).limit(100).lean();
    } else if (fs.existsSync(BACKUP_MESSAGES_FILE)) {
      messages = JSON.parse(fs.readFileSync(BACKUP_MESSAGES_FILE, "utf-8") || "[]").reverse();
    }

    return res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    console.error("Error retrieving contact messages:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/contact/messages/:id/status: Mark message status (unread, read, archived)
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["unread", "read", "archived"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    if (mongoose.connection.readyState === 1) {
      const updated = await Message.findByIdAndUpdate(id, { status }, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: "Message not found." });
      }
      return res.json({ success: true, message: updated });
    }

    return res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/contact/messages/:id: Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      await Message.findByIdAndDelete(id);
    }

    return res.json({ success: true, message: "Message deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
