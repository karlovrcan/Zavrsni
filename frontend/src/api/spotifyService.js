import axios from "axios";

const API_BASE_URL = "https://api.spotify.com/v1";

export const fetchSongs = async (query, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: {
        q: query,
        type: "track,artist,album,playlist",
        limit: 50,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Full API Response:", response.data);
    return {
      tracks: response.data.tracks?.items || [],
      artists: response.data.artists?.items || [],
      albums: response.data.albums?.items || [],
      playlists: response.data.playlists?.items || [],
    };
  } catch (error) {
    console.error("Error fetching songs:", error);
    return { tracks: [], artists: [], albums: [], playlists: [] };
  }
};
