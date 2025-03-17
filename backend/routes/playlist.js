import express from "express";
import Playlist from "../Models/Playlist.js"
import verifyToken from "../middleware/auth.js"; 

const router = express.Router();

/**
 * @route   POST /api/playlists
 * @desc    Create a new playlist for the authenticated user
 * @access  Private
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Playlist name is required." });

    const newPlaylist = new Playlist({ userId: req.userId, name });
    await newPlaylist.save();

    res.status(201).json({ success: true, playlist: newPlaylist });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/", verifyToken, async (req, res) => {
    try {
      const playlists = await Playlist.find({ userId: req.userId });
      res.json({ success: true, playlists });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  });

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params; // Get playlist ID from URL
  const { name } = req.body; // New name to rename the playlist

  try {
    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

    playlist.name = name;
    await playlist.save();

    res.json({ success: true, playlist }); 
  } catch (error) {
    console.error("❌ Error updating playlist:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/:playlistId/add-song", verifyToken, async (req, res) => {
  try {
    const { playlistId } = req.params; // Get playlist ID from URL
    const { songId } = req.body; // Get song ID from the request body

    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    // Check if the song is already in the playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ success: false, message: "Song already in playlist" });
    }

    // Add the song to the playlist
    playlist.songs.push(songId);
    await playlist.save();

    res.json({ success: true, message: "Song added to playlist", playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
});



export default router;
