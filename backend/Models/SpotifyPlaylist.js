// backend/Models/SpotifyPlaylist.js
import mongoose from "mongoose";

const spotifyPlaylistSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true },
  name: String,
  image: String,
  owner: {
    name: String,
    id: String,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SpotifyPlaylist = mongoose.model(
  "SpotifyPlaylist",
  spotifyPlaylistSchema
);
export default SpotifyPlaylist;
