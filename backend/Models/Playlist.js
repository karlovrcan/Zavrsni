import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  songs: [
    {
      _id: { type: String, required: true }, // We'll store the same string as track.id
      name: { type: String, required: true },
      artists: [{ name: String }],
      uri: { type: String, required: true },
      albumCover: { type: String, required: true },
      duration: { type: Number, required: true },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Playlist", PlaylistSchema);
