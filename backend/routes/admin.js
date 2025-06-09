import express from "express";
import User from "../models/User.js";
import isAdmin from "../middleware/isAdmin.js";
import verifyToken from "../middleware/auth.js";
import SpotifyPlaylist from "../Models/SpotifyPlaylist.js";
import Playlist from "../Models/Playlist.js";

const router = express.Router();

router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/user/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/user/:id/role", verifyToken, isAdmin, async (req, res) => {
  const { role } = req.body;
  if (!["guest", "user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/user-local-playlist-stats",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const stats = await Playlist.aggregate([
        {
          $group: {
            _id: "$userId",
            playlistCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            _id: 1,
            playlistCount: 1,
            username: "$userInfo.username",
            email: "$userInfo.email",
          },
        },
        { $sort: { playlistCount: -1 } },
      ]);

      res.json(stats);
    } catch (err) {
      console.error("Error fetching local playlist stats:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get(
  "/user-spotify-playlist-stats",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const stats = await SpotifyPlaylist.aggregate([
        { $group: { _id: "$addedBy", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            _id: 1,
            count: 1,
            username: "$userInfo.username",
            email: "$userInfo.email",
          },
        },
        { $sort: { count: -1 } },
      ]);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get(
  "/album-appearance-stats",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      // Aggregate from local playlists
      const local = await Playlist.aggregate([
        { $unwind: "$songs" },
        {
          $group: {
            _id: "$songs.albumId",
            count: { $sum: 1 },
            name: { $first: "$songs.album" },
          },
        },
      ]);

      const spotify = await SpotifyPlaylist.aggregate([
        { $unwind: "$tracks" },
        {
          $group: {
            _id: "$tracks.albumId",
            count: { $sum: 1 },
            name: { $first: "$tracks.album" },
          },
        },
      ]);

      const merged = [...local, ...spotify];
      const combined = merged.reduce((acc, curr) => {
        if (!curr._id) return acc;
        acc[curr._id] = acc[curr._id] || { count: 0, name: curr.name };
        acc[curr._id].count += curr.count;
        return acc;
      }, {});
      const sorted = Object.entries(combined)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => b.count - a.count);

      res.json(sorted);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/song-appearance-stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const localSongs = await Playlist.aggregate([
      { $unwind: "$songs" },
      {
        $group: {
          _id: "$songs.uri",
          name: { $first: "$songs.name" },
          artists: { $first: "$songs.artists" },
          count: { $sum: 1 },
        },
      },
    ]);

    const spotifySongs = await SpotifyPlaylist.aggregate([
      { $unwind: "$tracks" },
      {
        $group: {
          _id: "$tracks.uri",
          name: { $first: "$tracks.name" },
          artists: { $first: "$tracks.artists" },
          count: { $sum: 1 },
        },
      },
    ]);

    const merged = [...localSongs, ...spotifySongs];
    const combined = merged.reduce((acc, song) => {
      if (!song._id) return acc;

      if (!acc[song._id]) {
        acc[song._id] = {
          uri: song._id,
          name: song.name,
          artists: song.artists,
          count: 0,
        };
      }
      acc[song._id].count += song.count;
      return acc;
    }, {});

    const sorted = Object.values(combined).sort((a, b) => b.count - a.count);

    res.json(sorted);
  } catch (err) {
    console.error("Error generating song stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
