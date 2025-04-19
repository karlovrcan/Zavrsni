import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  featured: { type: Boolean, default: false },
  songs: [
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      artists: [
        {
          name: String,
          id: String,
        },
      ],
      uri: { type: String, required: true },
      album: { type: String, required: true },
      albumCover: { type: String, required: true },
      duration_ms: { type: Number, required: true },
      genre: { type: String, default: "" },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Playlist", PlaylistSchema);
