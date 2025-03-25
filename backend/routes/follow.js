import express from "express";
import FollowedArtist from "../Models/Follow.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/followed-artists
 * @desc    Get all followed artists for the authenticated user
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const artists = await FollowedArtist.find({ userId: req.userId });
    res.json({ success: true, artists });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", err });
  }
});

/**
 * @route   POST /api/followed-artists
 * @desc    Follow a new artist
 */
router.post("/", verifyToken, async (req, res) => {
  const { id, name, image } = req.body;

  if (!id || !name) {
    return res
      .status(400)
      .json({ success: false, message: "Missing artist info" });
  }

  try {
    const alreadyFollowed = await FollowedArtist.findOne({
      userId: req.userId,
      id,
    });
    if (alreadyFollowed) {
      return res
        .status(400)
        .json({ success: false, message: "Already followed" });
    }

    const newArtist = new FollowedArtist({
      userId: req.userId,
      id,
      name,
      image,
    });

    await newArtist.save();
    res.status(201).json({ success: true, artist: newArtist });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", err });
  }
});

/**
 * @route   DELETE /api/followed-artists/:id
 * @desc    Unfollow an artist
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const result = await FollowedArtist.findOneAndDelete({
      userId: req.userId,
      id: req.params.id,
    });

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }

    res.json({ success: true, message: "Artist unfollowed" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", err });
  }
});

export default router;
