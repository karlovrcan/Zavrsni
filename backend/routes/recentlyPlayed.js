import express from "express";
import RecentlyPlayed from "../Models/RecentlyPlayed.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

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

router.post("/", authMiddleware, async (req, res) => {
  const { song } = req.body;

  if (!song || !song.uri) {
    return res.status(400).json({
      success: false,
      error: "Invalid song: 'song.uri' is required.",
    });
  }

  try {
    const normalizedSong = {
      ...song,
      album:
        typeof song.album === "string"
          ? song.album
          : song.album?.name || "Unknown Album",
      source: song.source || "",
      playlistId: song.playlistId || null,
    };

    await RecentlyPlayed.deleteOne({
      userId: req.user.id,
      "song.uri": normalizedSong.uri,
    });

    const newEntry = new RecentlyPlayed({
      userId: req.user.id,
      song: normalizedSong,
    });

    await newEntry.save();

    res.json({
      success: true,
      message: "Song saved to recently played.",
    });
  } catch (err) {
    console.error("Error saving recently played:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
