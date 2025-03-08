import {
  SPOTIFY_LOGIN_SUCCESS,
  SPOTIFY_LOGOUT,
} from "../Constants/SpotifyConstants";

// Action to set the access token in Redux
export const setSpotifyAccessToken = (token) => ({
  type: "SET_SPOTIFY_ACCESS_TOKEN",
  payload: token,
});

// Action to set the device ID in Redux
export const setSpotifyDeviceId = (deviceId) => ({
  type: "SET_SPOTIFY_DEVICE_ID",
  payload: deviceId,
});

// Redirect to Spotify Login
export const loginWithSpotify = () => {
  return () => {
    window.location.href = "http://localhost:5001/api/spotify/login"; // Ensure backend route exists
  };
};

// Handle Spotify Callback & Store Token
export const handleSpotifyCallback = (token) => {
  return (dispatch) => {
    if (token) {
      console.log("✅ Storing Spotify Token in Redux:", token);
      sessionStorage.setItem("spotify_access_token", token); // Store token
      dispatch({ type: SPOTIFY_LOGIN_SUCCESS, payload: token });
    } else {
      console.error("❌ No token found in Spotify callback");
    }
  };
};

// Logout from Spotify
export const logoutFromSpotify = () => {
  return (dispatch) => {
    sessionStorage.removeItem("spotify_access_token");
    dispatch({ type: SPOTIFY_LOGOUT });
  };
};

// Handle Spotify Search (Needs to be inside a component)
export const handleSearch =
  (query, setResults) => async (dispatch, getState) => {
    if (!query) return;

    const accessToken = getState().spotify.accessToken; // Ensure token is fetched from Redux state
    if (!accessToken) {
      console.error("⚠️ No Spotify access token available.");
      return;
    }

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${query}&type=track&limit=50`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (!data.tracks || !data.tracks.items) {
        throw new Error("Invalid response structure from Spotify API.");
      }

      // Set the search results in state
      setResults(data.tracks.items); // This function needs to be passed from the component
    } catch (error) {
      console.error("❌ Error fetching songs:", error);
    }
  };
