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

export const fetchCategories = async (token) => {
  try {
    console.log("📡 Fetching categories from Spotify...");

    const response = await axios.get(`${API_BASE_URL}/browse/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ Categories Fetched:", response.data.categories.items);
    return response.data.categories.items || [];
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return [];
  }
};

export const fetchRecommendedSongs = async (
  seedTrackId,
  token,
  market = "US"
) => {
  if (!token || !seedTrackId) {
    console.warn("⚠️ Missing access token or seed track ID.");
    return [];
  }

  console.log("📡 Fetching recommendations for seed track ID:", seedTrackId);

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/recommendations`,
      {
        params: {
          seed_tracks: seedTrackId, // ✅ Pass multiple track IDs if possible
          seed_artists: "4NHQUGzhtTLFvgF5SZesLK", // ✅ Example artist ID for better recommendations
          limit: 5,
          market: market, // ✅ Add market parameter
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.data.tracks || response.data.tracks.length === 0) {
      console.warn("⚠️ No recommendations found for track ID:", seedTrackId);
      return [];
    }

    console.log("✅ Recommended Songs Fetched:", response.data.tracks);
    return response.data.tracks;
  } catch (error) {
    console.error(
      "❌ Error fetching recommended songs:",
      error.response?.data || error.message
    );
    return [];
  }
};
