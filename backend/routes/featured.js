import express from "express";
import Playlist from "../Models/Playlist.js";
import SpotifyPlaylist from "../Models/SpotifyPlaylist.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const local = await Playlist.find({ featured: true });
    const spotify = await SpotifyPlaylist.find({ featured: true });

    res.json({ success: true, local, spotify });
  } catch (err) {
    console.error("Error fetching featured playlists:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
