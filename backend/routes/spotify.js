import express from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// 🔹 Spotify Login: Redirect User to Spotify Authorization
router.get("/login", (req, res) => {
  const scope = "user-read-playback-state user-modify-playback-state streaming";
  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify(
    {
      response_type: "code",
      client_id: process.env.CLIENT_ID,
      scope,
      redirect_uri: process.env.REDIRECT_URI,
    }
  )}`;

  console.log("🔍 Redirecting user to Spotify:", authUrl);
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Authorization code missing" });
  }

  try {
    const tokenRequestData = querystring.stringify({
      code: code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: "authorization_code",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    });

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      tokenRequestData,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = response.data;

    if (!access_token) {
      return res
        .status(500)
        .json({ message: "Spotify token missing in response" });
    }

    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendURL}/login?token=${access_token}`);
  } catch (error) {
    console.error(
      "Spotify Token Exchange Error:",
      error.response?.data || error
    );
    res.status(500).json({
      message: "Failed to get access token",
      error: error.response?.data || error.message,
    });
  }
});

// 🔹 New Route: Proxy Spotify /me request through your backend
router.get("/me", async (req, res) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing access token" });
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error(
      "❌ Failed to fetch Spotify /me:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Failed to fetch Spotify user info",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
