import mongoose from "mongoose";

const FollowedArtistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  id: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String },
  followedAt: { type: Date, default: Date.now },
});

export default mongoose.model("FollowedArtist", FollowedArtistSchema);
