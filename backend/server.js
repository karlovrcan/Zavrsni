import express from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";
import spotifyRoutes from "./routes/spotify.js";
import cors from "cors"; 
import userRoutes from "./routes/user.js"; 
import connectDB from "./db.js"; 
import playlistRoutes from "./routes/playlist.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
connectDB();
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json()); 
app.use("/api/user", userRoutes); 
app.use("/api/spotify", spotifyRoutes); 
app.use("/api/playlists", playlistRoutes);


console.log("🔍 CLIENT_ID:", process.env.CLIENT_ID);
console.log(
  "🔍 CLIENT_SECRET:",
  process.env.CLIENT_SECRET ? "Loaded" : "MISSING!"
);
console.log("🔍 REDIRECT_URI:", process.env.REDIRECT_URI);

app.get("/login", (req, res) => {
  const scope = "user-read-playback-state user-modify-playback-state streaming";
  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify(
    {
      response_type: "code",
      client_id: CLIENT_ID,
      scope,
      redirect_uri: REDIRECT_URI,
    }
  )}`;

  console.log("🔍 Redirecting user to Spotify:", authUrl);
  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  console.log("🔍 Spotify Callback Hit!");
  const { code } = req.query;

  if (!code) {
    console.error("❌ Missing authorization code");
    return res.status(400).json({ message: "Authorization code missing" });
  }

  try {
    console.log("🔍 Received Authorization Code:", code);

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    console.log("🔍 Full Spotify API Response:", response.data);

    const { access_token } = response.data;

    if (!access_token) {
      console.error("❌ Spotify did not return an access token");
      return res
        .status(500)
        .json({ message: "Spotify token missing in response" });
    }

    console.log("✅ Successfully Authenticated! Access Token:", access_token);

    res.redirect(`http://localhost:5173/login?token=${access_token}`); 
  } catch (error) {
    console.error(
      "❌ Spotify Token Exchange Error:",
      error.response ? error.response.data : error
    );
    res.status(500).json({ message: "Failed to get access token" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
