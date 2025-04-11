import express from "express";
import dotenv from "dotenv";
import spotifyRoutes from "./routes/spotify.js";
import cors from "cors";
import userRoutes from "./routes/user.js";
import connectDB from "./db.js";
import playlistRoutes from "./routes/playlist.js";
import albumRoutes from "./routes/album.js";
import spotifyPlaylistRoutes from "./routes/spotifyPlaylist.js";
import adminRoutes from "./routes/admin.js";
import followedArtistRoutes from "./routes/artist.js";
import recentlyPlayedRoutes from "./routes/recentlyPlayed.js";
import featuredRoutes from "./routes/featured.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" })); // or higher if needed
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// -- Register routes --
app.use("/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/spotify-playlist", spotifyPlaylistRoutes);
app.use("/api/followed-artists", followedArtistRoutes);
app.use("/api/recently-played", recentlyPlayedRoutes);
app.use("/api/featured", featuredRoutes);

// -- This is our unified Spotify routes (includes /api/spotify/login, /api/spotify/callback, etc.)
app.use("/api/spotify", spotifyRoutes);

// Debug logs
console.log("🔍 CLIENT_ID:", process.env.CLIENT_ID);
console.log(
  "🔍 CLIENT_SECRET:",
  process.env.CLIENT_SECRET ? "Loaded" : "MISSING!"
);
console.log("🔍 REDIRECT_URI:", process.env.REDIRECT_URI);

// -- Start the server --
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
