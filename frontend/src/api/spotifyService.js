import axios from "axios";

const API_BASE_URL = "https://api.spotify.com/v1";

/**
 * Searching songs, artists, albums, playlists
 */
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

/**
 * Fetching categories from Spotify
 */
export const fetchCategories = async (token) => {
  try {
    console.log("📡 Fetching categories from Spotify...");
    const response = await axios.get(`${API_BASE_URL}/browse/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Categories Fetched:", response.data.categories.items);
    return response.data.categories.items || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const fetchCategoryPlaylists = async (categoryId, accessToken) => {
  try {
    console.log("🔐 Using accessToken:", accessToken);

    const response = await fetch(
      `https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?limit=20&country=US`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching category playlists:", error);
    return null;
  }
};

export const fetchRecommendedSongs = async ({ trackId }, token) => {
  const params = {
    limit: 5,
    market: "from_token",
    seed_tracks: trackId,
  };

  const queryString = new URLSearchParams(params).toString();

  const response = await fetch(
    `https://api.spotify.com/v1/recommendations?${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 404) {
    // Retry with fallback
    console.warn("🔁 Retrying with fallback market: US");
    const fallbackQuery = new URLSearchParams({
      ...params,
      market: "US",
    }).toString();

    const fallbackRes = await fetch(
      `https://api.spotify.com/v1/recommendations?${fallbackQuery}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return fallbackRes.ok ? await fallbackRes.json().then((r) => r.tracks) : [];
  }

  return response.ok ? await response.json().then((r) => r.tracks) : [];
};
