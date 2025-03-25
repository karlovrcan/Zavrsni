import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    required: true,
  },
  name: String,
  image: String,
  artists: [
    {
      name: String,
      id: String,
    },
  ],
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

const Album = mongoose.model("Album", albumSchema);
export default Album;
