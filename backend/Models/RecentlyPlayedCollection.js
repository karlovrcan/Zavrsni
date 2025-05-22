// models/RecentlyPlayedCollection.js
import mongoose from "mongoose";

const recentlyPlayedCollectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["playlist", "spotify-playlist", "album"],
    required: true,
  },
  collectionId: { type: String, required: true },
  title: String,
  image: String,
  tracks: { type: [Object], default: [] },
  lastPlayedAt: { type: Date, default: Date.now },
});

recentlyPlayedCollectionSchema.index(
  { userId: 1, collectionId: 1 },
  { unique: true }
);

export default mongoose.model(
  "RecentlyPlayedCollection",
  recentlyPlayedCollectionSchema
);
