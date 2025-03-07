import { setSpotifyDeviceId } from "../Actions/SpotifyActions"; // Import action to store device ID

export const playSong = (uri) => async (dispatch, getState) => {
  const accessToken = getState().spotify.accessToken;
  const deviceId = getState().spotify.deviceId; // ✅ Get stored device ID from Redux

  if (!accessToken) {
    console.error("⚠️ No access token available.");
    return;
  }

  if (!deviceId) {
    console.error(
      "⚠️ No active device found. Make sure the Web Playback SDK is running."
    );
    return;
  }

  try {
    console.log(`🎵 Using device: ${deviceId}`);

    // 🚀 **Step 1: Transfer Playback to Your App**
    await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ device_ids: [deviceId], play: true }),
    });

    console.log("✅ Playback transferred to app:", deviceId);

    // 🚀 **Step 2: Play the song**
    const playRes = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [uri] }),
      }
    );

    if (!playRes.ok) {
      const errorMessage = await playRes.text();
      throw new Error(
        `⚠️ Failed to play song: ${playRes.status} - ${errorMessage}`
      );
    }

    console.log("🎶 Song is now playing in your app!");
  } catch (error) {
    console.error("❌ Error playing song:", error);
  }
};
