import mongoose from "mongoose";

const recentlyPlayedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  song: {
    _id: String,
    uri: String,
    name: String,
    artists: [{ name: String, id: String }],
    albumCover: String,
    albumId: String,
    playlistId: String,
    duration_ms: Number,
    genre: { type: String, default: "" },
    album: { type: String, default: "" },
    source: { type: String, default: "" },
  },
  playedAt: { type: Date, default: Date.now },
});

const RecentlyPlayed = mongoose.model("RecentlyPlayed", recentlyPlayedSchema);
export default RecentlyPlayed;
