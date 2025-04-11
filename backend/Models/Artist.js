// models/Artist.js
import mongoose from "mongoose";

const artistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  id: { type: String, required: true }, // Spotify artist ID
  name: { type: String, required: true },
  image: { type: String },
});

const Artist = mongoose.model("Artist", artistSchema);
export default Artist;
