import express from "express";
import Album from "../Models/Album.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   POST /api/albums
 * @desc    Save a new album for the authenticated user
 * @access  Private
 */
router.post("/", verifyToken, async (req, res) => {
  const { spotifyId, name, image, artists, genre } = req.body;

  try {
    const existing = await Album.findOne({ spotifyId, addedBy: req.user._id });
    if (existing) {
      return res.status(200).json({ success: true, album: existing });
    }

    const album = new Album({
      spotifyId,
      name,
      image,
      artists,
      addedBy: req.user._id,
      genre,
    });

    await album.save();
    res.status(201).json({ success: true, album });
  } catch (err) {
    console.error("❌ Error saving album:", err);
    res.status(500).json({ success: false, message: "Failed to save album" });
  }
});

/**
 * @route   GET /api/albums
 * @desc    Get all saved albums for the current user
 * @access  Private
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const albums = await Album.find({ addedBy: req.user._id });
    res.status(200).json({ success: true, albums });
  } catch (err) {
    console.error("❌ Error fetching albums:", err);
    res.status(500).json({ success: false, message: "Failed to fetch albums" });
  }
});

// GET /api/albums/:id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const album = await Album.findOne({
      _id: req.params.id,
      addedBy: req.user._id,
    });

    if (!album) {
      return res
        .status(404)
        .json({ success: false, message: "Album not found" });
    }

    // OPTIONAL: fetch full details from Spotify if needed
    res.json({ success: true, album });
  } catch (err) {
    console.error("❌ Error fetching album by ID:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   DELETE /api/albums/:id
 * @desc    Delete a saved album by its Mongo ID
 * @access  Private
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Album.findOneAndDelete({
      _id: req.params.id,
      addedBy: req.user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Album not found" });
    }

    res.json({ success: true, message: "Album deleted" });
  } catch (err) {
    console.error("❌ Error deleting album:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
