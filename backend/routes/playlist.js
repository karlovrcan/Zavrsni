import express from "express";
import Playlist from "../Models/Playlist.js";
import verifyToken from "../middleware/auth.js";
// import Song from "../Models/Songs.js"; // <-- Uncomment if you actually have a Song model
import mongoose from "mongoose";

const router = express.Router();

/**
 * @route   POST /api/playlists
 * @desc    Create a new playlist for the authenticated user
 * @access  Private
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Playlist name is required." });
    }

    const newPlaylist = new Playlist({
      userId: req.userId,
      name,
    });
    await newPlaylist.save();

    res.status(201).json({ success: true, playlist: newPlaylist });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route   GET /api/playlists
 * @desc    Fetch all playlists for the current user
 * @access  Private
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.userId });
    // If you want to show album covers, you'd need to store that data in the subdoc,
    // or look it up from a "Song" model (which must be properly imported).
    // Otherwise, the subdocuments in `playlist.songs` already hold albumCover, so you're good.

    res.json({ success: true, playlists });
  } catch (error) {
    console.error("❌ Error fetching playlists:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

/**
 * @route   PUT /api/playlists/:id
 * @desc    Update a playlist's name
 * @access  Private
 */
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }

    playlist.name = name;
    await playlist.save();

    res.json({ success: true, playlist });
  } catch (error) {
    console.error("❌ Error updating playlist:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   DELETE /api/playlists/:id
 * @desc    Delete a playlist by ID
 * @access  Private
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   POST /api/playlists/:playlistId/add-song
 * @desc    Add a new subdocument to `songs` in the playlist
 * @access  Private
 */
router.post("/:playlistId/add-song", verifyToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { songId, name, uri, artists, albumCover, duration_ms } = req.body;

    if (!songId || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Missing song details" });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }

    // Check if song is already in the playlist
    if (playlist.songs.some((s) => s._id === songId)) {
      return res
        .status(400)
        .json({ success: false, message: "Song already in playlist" });
    }

    // Add the subdocument
    playlist.songs.push({
      _id: songId, // storing your track ID as `_id`
      name,
      uri,
      artists,
      albumCover,
      duration_ms,
    });
    await playlist.save();

    res.json({ success: true, message: "Song added", playlist });
  } catch (error) {
    console.error("Error adding song:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

/**
 * OPTIONAL: If you want to remove a song from a playlist (toggle)
 */
router.post("/:playlistId/remove-song", verifyToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing songId" });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }

    // Filter out the matching subdoc
    playlist.songs = playlist.songs.filter((s) => s._id !== songId);
    await playlist.save();

    res.json({ success: true, message: "Song removed", playlist });
  } catch (error) {
    console.error("Error removing song:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

/**
 * @route   GET /api/playlists/:id
 * @desc    Get a single playlist by ID
 * @access  Public or Private (your choice)
 */
router.get("/:id", async (req, res) => {
  try {
    // If songs are subdocs, .populate() won't do anything. You already have them in `playlist.songs`.
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }

    res.json({ success: true, playlist });
  } catch (error) {
    console.error("❌ Error fetching playlist:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

export default router;
