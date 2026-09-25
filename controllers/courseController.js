import fs from "fs";
import {
  findTrackDir,
  findChapterFile,
  isFreeDemo,
  hasAccessToTrack,
  CATALOG_PATH,
} from "../utils/courseHelpers.js";

// GET /api/course/catalog
export const getCatalog = (req, res) => {
  try {
    if (fs.existsSync(CATALOG_PATH)) {
      const data = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
      const annotated = {};
      for (const [trackKey, chapters] of Object.entries(data)) {
        annotated[trackKey] = chapters.map((c) => ({
          ...c,
          isFree: isFreeDemo(c.id, c.fileName, c.id),
        }));
      }
      return res.json({ success: true, catalog: annotated });
    }
    res.json({ success: false, message: "Catalog file not found." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/course/chapter
export const getChapter = async (req, res) => {
  try {
    const { track } = req.query;
    const phaseId = req.query.phaseId || "README";

    if (!track) {
      return res.status(400).json({ success: false, message: "Track parameter is required." });
    }

    const trackInfo = findTrackDir(track);
    if (!trackInfo) {
      return res.status(404).json({ success: false, message: `Course track '${track}' not found.` });
    }

    const matched = findChapterFile(trackInfo.fullPath, phaseId);
    if (!matched) {
      return res.status(404).json({
        success: false,
        message: `Chapter '${phaseId}' not found in course track '${trackInfo.dirName}'.`,
      });
    }

    const isFree = isFreeDemo(phaseId, matched.fileName, matched.relPath);

    // If not a free demo, require authenticated purchase
    if (!isFree) {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          isLocked: true,
          track: trackInfo.dirName,
          phaseId,
          message: "Sign in or create an account to access this chapter.",
        });
      }

      const hasPurchased = hasAccessToTrack(user.purchasedTiers, trackInfo.dirName);

      if (!hasPurchased) {
        return res.status(403).json({
          success: false,
          isLocked: true,
          track: trackInfo.dirName,
          phaseId,
          message: `This chapter is locked. Enroll in the Pro Full-Stack Bundle or ${trackInfo.dirName} blueprint to unlock lifetime access.`,
        });
      }
    }

    const content = fs.readFileSync(matched.fullPath, "utf-8");

    // Extract title from first markdown header
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch
      ? titleMatch[1].trim()
      : matched.fileName.replace(/\.md$/, "").replace(/[-_]/g, " ");

    res.json({
      success: true,
      isLocked: false,
      track: trackInfo.dirName,
      phaseId: matched.relPath.replace(/\.md$/, ""),
      fileName: matched.fileName,
      title,
      content,
      isFree,
    });
  } catch (err) {
    console.error("Error reading course chapter:", err);
    res.status(500).json({ success: false, message: "Could not load chapter content." });
  }
};

// GET /api/course/progress
export const getProgress = async (req, res) => {
  try {
    res.json({
      success: true,
      completedPhases: req.user.completedPhases || [],
    });
  } catch (err) {
    console.error("Error getting course progress:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/course/progress/toggle
export const toggleProgress = async (req, res) => {
  try {
    const { phaseKey } = req.body; // e.g. "frontend:Phase-01-How-The-Browser-Works"
    if (!phaseKey) {
      return res.status(400).json({ success: false, message: "phaseKey is required." });
    }

    let completed = [...(req.user.completedPhases || [])];
    const index = completed.indexOf(phaseKey);
    let isCompleted = false;

    if (index > -1) {
      completed.splice(index, 1);
      isCompleted = false;
    } else {
      completed.push(phaseKey);
      isCompleted = true;
    }

    req.user.completedPhases = completed;
    await req.user.save();

    res.json({
      success: true,
      completedPhases: completed,
      isCompleted,
    });
  } catch (err) {
    console.error("Error toggling course progress:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
