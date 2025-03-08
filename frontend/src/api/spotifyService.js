import axios from "axios";

const API_BASE_URL = "https://api.spotify.com/v1";

export const fetchSongs = async (query, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: {
        q: query,
        type: "track,artist,album,playlist",
        limit: 50, // Fetch more results
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Log response to debug
    console.log("🔍 Full API Response:", response.data);

    // ✅ Ensure playlists do not contain `null` values
    const cleanPlaylists =
      response.data.playlists?.items?.filter((p) => p !== null) || [];

    return {
      tracks: response.data.tracks?.items || [],
      artists: response.data.artists?.items || [],
      albums: response.data.albums?.items || [],
      playlists: cleanPlaylists, // ✅ Use filtered playlists
    };
  } catch (error) {
    console.error("Spotify API Fetch Error:", error);
    return { tracks: [], artists: [], albums: [], playlists: [] };
  }
};
