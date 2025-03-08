import { setSpotifyDeviceId } from "../Actions/SpotifyActions"; // Import action to store device ID

export const playSong = (uri) => async (dispatch, getState) => {
  const accessToken = getState().spotify.accessToken;
  let deviceId = getState().spotify.deviceId; // Get device ID from Redux

  if (!accessToken) {
    console.error("⚠️ No access token available.");
    return;
  }

  try {
    // If deviceId is missing, fetch available devices
    if (!deviceId) {
      const deviceRes = await fetch(
        "https://api.spotify.com/v1/me/player/devices",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const devices = await deviceRes.json();
      console.log("Available devices:", devices);

      if (!devices.devices || devices.devices.length === 0) {
        console.error("⚠️ No active devices found.");
        return;
      }

      // Select the Web Playback SDK device
      deviceId = devices.devices.find((d) => d.name === "My Spotify App")?.id;

      if (!deviceId) {
        console.error("⚠️ App is not registered as a device.");
        return;
      }

      dispatch(setSpotifyDeviceId(deviceId)); // Store device ID in Redux
    }

    console.log(`🎵 Using device: ${deviceId}`);

    // Step 1: Transfer Playback to Your App
    const transferRes = await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ device_ids: [deviceId], play: true }),
    });

    if (!transferRes.ok) {
      throw new Error(`⚠️ Error transferring playback: ${transferRes.status}`);
    }

    console.log("✅ Playback transferred to app:", deviceId);

    // Step 2: Play the song
    const playRes = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [uri], // Ensure correct format
        }),
      }
    );

    if (!playRes.ok) {
      const errorMessage = await playRes.text();
      throw new Error(
        `⚠️ Failed to play song: ${playRes.status} - ${errorMessage}`
      );
    }

    console.log("🎶 Song is now playing!");
  } catch (error) {
    console.error("❌ Error playing song:", error);
  }
};
