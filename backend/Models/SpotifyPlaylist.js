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
  featured: { type: Boolean, default: false },

  tracks: [
    {
      _id: { type: String, required: true }, // Spotify track ID
      name: { type: String, required: true },
      uri: { type: String, required: true },
      album: { type: String, required: true },
      albumId: { type: String, required: true },
      albumCover: { type: String, required: true },
      duration_ms: { type: Number, required: true },
      artists: [{ name: String }],
      genre: { type: String, default: "" },
    },
  ],
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
