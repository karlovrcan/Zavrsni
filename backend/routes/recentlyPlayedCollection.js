import express from "express";
import RecentlyPlayedCollection from "../Models/RecentlyPlayedCollection.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  const { type, collectionId, title, image, tracks = [] } = req.body;

  try {
    const record = await RecentlyPlayedCollection.findOneAndUpdate(
      { userId: req.user.id, collectionId },
      {
        type,
        title,
        image,
        tracks,
        lastPlayedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const allCollections = await RecentlyPlayedCollection.find({
      userId: req.user.id,
    })
      .sort({ lastPlayedAt: -1 })
      .skip(8);

    if (allCollections.length > 0) {
      const idsToDelete = allCollections.map((entry) => entry._id);
      await RecentlyPlayedCollection.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  const collections = await RecentlyPlayedCollection.find({
    userId: req.user.id,
  })
    .sort({ lastPlayedAt: -1 })
    .limit(12);
  res.json({ collections });
});

export default router;
