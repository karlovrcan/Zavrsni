// spotify.js

import express from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// 🔹 Spotify Login: Redirect User to Spotify Authorization
router.get("/login", (req, res) => {
  // UNIFIED SCOPE with user-read-private and more
  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-library-read",
    "user-library-modify",
    "streaming",
    "app-remote-control",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
  ].join(" ");

  // Build the Spotify authorization URL
  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify(
    {
      response_type: "code",
      client_id: process.env.CLIENT_ID,
      scope: scopes,
      redirect_uri: process.env.REDIRECT_URI, // e.g. http://localhost:5001/api/spotify/callback
    }
  )}`;

  console.log("🔍 Redirecting user to Spotify:", authUrl);
  // Send the user off to Spotify's login screen
  res.redirect(authUrl);
});

// 🔹 Spotify Callback: Handle token exchange
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Authorization code missing" });
  }

  try {
    // Prepare data for the token request
    const tokenRequestData = querystring.stringify({
      code: code,
      redirect_uri: process.env.REDIRECT_URI, // Must match EXACTLY your .env
      grant_type: "authorization_code",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    });

    // Exchange code for tokens
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      tokenRequestData,
      {
        headers: {
          // Not strictly required to do Basic auth here if we pass client_id/client_secret in body
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token } = response.data;
    if (!access_token) {
      return res
        .status(500)
        .json({ message: "Spotify token missing in response" });
    }

    console.log("✅ Access Token:", access_token);
    console.log("✅ Refresh Token:", refresh_token);

    // After exchanging for tokens, redirect front end with them
    // e.g. /login?access_token=___&refresh_token=___
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(
      `${frontendURL}/login?access_token=${access_token}&refresh_token=${refresh_token}`
    );
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

// 🔹 Refresh the token
router.get("/refresh", async (req, res) => {
  const refreshToken = req.query.refresh_token;
  if (!refreshToken) {
    return res.status(400).json({ message: "Missing refresh token" });
  }

  try {
    // Build the request data
    const requestData = querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    });

    // Request a refreshed access token
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      requestData,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, refresh_token: newRefreshToken } = response.data;
    if (!access_token) {
      return res
        .status(500)
        .json({ message: "No access token in refresh response" });
    }

    console.log("✅ Refreshed Access Token:", access_token);

    // If Spotify returns a new refresh_token, use it; otherwise keep the old
    res.json({
      access_token,
      refresh_token: newRefreshToken || refreshToken,
    });
  } catch (error) {
    console.error("❌ Error refreshing token:", error.response?.data || error);
    res.status(500).json({ message: "Failed to refresh token" });
  }
});

// 🔹 /me: Get the user's Spotify profile
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
