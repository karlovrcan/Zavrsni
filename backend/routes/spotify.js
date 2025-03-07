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

// 🔹 Spotify Callback: Exchange Code for Token
router.get("/callback", async (req, res) => {
  console.log("🔍 Spotify Callback Hit!");
  const { code } = req.query;

  if (!code) {
    console.error("❌ Spotify Callback Error: Missing authorization code");
    return res.status(400).json({ message: "Authorization code missing" });
  }

  try {
    console.log("🔍 Received Authorization Code:", code);

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

    console.log("🔍 Full Spotify API Response:", response.data);

    const { access_token } = response.data;

    if (!access_token) {
      console.error("❌ Spotify did not return an access token");
      return res
        .status(500)
        .json({ message: "Spotify token missing in response" });
    }

    console.log("✅ Successfully Authenticated! Access Token:", access_token);
    res.json({ access_token });
  } catch (error) {
    console.error(
      "❌ Spotify Token Exchange Error:",
      error.response ? error.response.data : error
    );
    res.status(500).json({
      message: "Failed to get access token",
      error: error.response ? error.response.data : error.message,
    });
  }
});

// 🔹 Use `export default router`
export default router;
