// routes/followedArtists.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import Artist from "../Models/Artist.js";
const router = express.Router();

// Get all followed artists
router.get("/", authMiddleware, async (req, res) => {
  try {
    const artists = await Artist.find({ userId: req.user.id });
    res.json({ success: true, artists });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Follow an artist
router.post("/", authMiddleware, async (req, res) => {
  const { id, name, image } = req.body;

  if (!id || !name) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const exists = await Artist.findOne({ userId: req.user.id, id });
    if (exists) {
      return res.json({ success: true, message: "Artist already followed" });
    }

    const newArtist = new Artist({ id, name, image, userId: req.user.id });
    await newArtist.save();

    res.json({ success: true, artist: newArtist });
  } catch (err) {
    console.error("Error saving artist:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Unfollow an artist
router.delete("/:spotifyId", authMiddleware, async (req, res) => {
  try {
    const deleted = await Artist.findOneAndDelete({
      userId: req.user.id,
      id: req.params.spotifyId,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, error: "Artist not found" });
    }

    res.json({ success: true, message: "Artist unfollowed" });
  } catch (err) {
    console.error("Error deleting artist:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
