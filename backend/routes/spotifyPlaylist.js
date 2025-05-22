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
      addedBy: req.user._id, // ✅ fix this
    });
    if (existing)
      return res.status(200).json({ success: true, playlist: existing });

    const playlist = new SpotifyPlaylist({
      spotifyId,
      name,
      image,
      owner,
      addedBy: req.user._id, // ✅ fix this too
      tracks: tracks.map((track) => ({
        _id: track.id || track.uri || "unknown", // ✅ required by schema
        name: track.name || "Untitled",
        uri: track.uri || "unknown",
        album: track.album || "Unknown Album",
        albumId: track.albumId || "",
        genre: track.genre || "",
        albumCover: track.albumCover || "https://via.placeholder.com/150",
        duration_ms: track.duration_ms || 0,
        artists: (track.artists || []).map((a) => ({ name: a.name })),
      })),
    });

    await playlist.save();
    res.status(201).json({ success: true, playlist });
  } catch (err) {
    console.error("❌ Error saving Spotify playlist:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to save playlist" });
  }
});

// GET /api/spotify
router.get("/", verifyToken, async (req, res) => {
  try {
    const playlists = await SpotifyPlaylist.find({ addedBy: req.user._id });
    res.json({ success: true, playlists });
  } catch (err) {
    console.error("Error fetching Spotify playlists:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/spotify/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await SpotifyPlaylist.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }

    res.json({ success: true, message: "Playlist deleted" });
  } catch (error) {
    console.error("❌ Failed to delete Spotify playlist:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

router.get("/:spotifyId", verifyToken, async (req, res) => {
  try {
    const playlist = await SpotifyPlaylist.findOne({
      spotifyId: req.params.spotifyId,
      addedBy: req.user._id,
    });

    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }

    res.status(200).json({ success: true, playlist });
  } catch (err) {
    console.error("❌ Failed to fetch Spotify playlist:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
