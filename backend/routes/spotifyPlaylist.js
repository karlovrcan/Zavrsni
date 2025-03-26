// backend/routes/spotify.js
import express from "express";
import SpotifyPlaylist from "../Models/SpotifyPlaylist.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// POST /api/spotify
router.post("/", verifyToken, async (req, res) => {
  const { spotifyId, name, image, owner, tracks = [] } = req.body;

  try {
    const existing = await SpotifyPlaylist.findOne({
      spotifyId,
      addedBy: req.userId,
    });
    if (existing)
      return res.status(200).json({ success: true, playlist: existing });

    const playlist = new SpotifyPlaylist({
      spotifyId,
      name,
      image,
      owner,
      addedBy: req.userId,
      tracks: tracks.map((track) => ({
        _id: track.id,
        name: track.name,
        uri: track.uri,
        album: track.album?.name || "Unknown Album", // ✅ Ensure it's included
        albumCover: track.album?.images?.[0]?.url || "",
        duration_ms: track.duration_ms,
        artists: (track.artists || []).map((a) => ({ name: a.name })),
      })),
    });

    await playlist.save();
    res.status(201).json({ success: true, playlist });
  } catch (err) {
    console.error("Error saving Spotify playlist:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to save playlist" });
  }
});

// GET /api/spotify
router.get("/", verifyToken, async (req, res) => {
  try {
    const playlists = await SpotifyPlaylist.find({ addedBy: req.userId });
    res.json({ success: true, playlists });
  } catch (err) {
    console.error("Error fetching Spotify playlists:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/spotify/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await SpotifyPlaylist.findOneAndDelete({
      _id: req.params.id,
      addedBy: req.userId,
    });

    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Playlist deleted" });
  } catch (err) {
    console.error("Error deleting Spotify playlist:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
