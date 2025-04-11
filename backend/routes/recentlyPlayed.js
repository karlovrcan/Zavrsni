import express from "express";
import RecentlyPlayed from "../Models/RecentlyPlayed.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// GET recently played (limit 10)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const items = await RecentlyPlayed.find({ userId: req.user.id })
      .sort({ playedAt: -1 })
      .limit(50);
    res.json({ success: true, recentlyPlayed: items.map((i) => i.song) });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST a recently played song
router.post("/", authMiddleware, async (req, res) => {
  const { song } = req.body;
  if (!song || !song.uri) {
    return res.status(400).json({ success: false, error: "Invalid song" });
  }

  try {
    // Remove any existing entry for this song (avoid duplicates)
    await RecentlyPlayed.deleteOne({
      userId: req.user.id,
      "song.uri": song.uri,
    });

    // Add new entry to top
    const newEntry = new RecentlyPlayed({ userId: req.user.id, song });
    await newEntry.save();

    res.json({ success: true, message: "Saved to recently played" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
