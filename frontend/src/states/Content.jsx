import React, { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currTime, setCurrTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [progress, setProgress] = useState(0);
  const [songIdx, setSongIdx] = useState(0);
  const [pendingSongIdx, setPendingSongIdx] = useState(null);
  const [filteredSongs, setFilteredSongs] = useState([]);

  // Feature sections
  const [followedArtists, setFollowedArtists] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState({
    local: [],
    spotify: [],
  });
  const [categoryPlaylists, setCategoryPlaylists] = useState({}); // e.g. { Party: [...], Pop: [...], Rock: [...] }

  // Standard local data
  const [playlists, setPlaylists] = useState([]);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);

  // Redux tokens
  const { token } = useSelector((state) => state.account);
  const accessToken = useSelector((state) => state.spotify.accessToken);

  const dispatch = useDispatch();

  // ---------------------------
  // 1) fetchUser from session
  // ---------------------------
  const getUser = async () => {
    try {
      const storedToken = sessionStorage.getItem("spotify_access_token");
      if (!storedToken) return;

      const response = await fetch("http://localhost:5001/api/spotify/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (!response.ok) {
        toast.error(`Failed to fetch user data (HTTP ${response.status}).`);
        return;
      }

      const data = await response.json();
      console.log("Spotify user data:", data);
    } catch (error) {
      toast.error("Failed to fetch Spotify user data.");
    }
  };

  // ---------------------------
  // 2) Helper to see all categories
  //    so we know valid category IDs
  // ---------------------------
  const fetchAllSpotifyCategories = async () => {
    try {
      if (!accessToken) return;
      const res = await fetch(
        "https://api.spotify.com/v1/browse/categories?country=US&limit=50",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await res.json();
      console.log("🔎 All Spotify categories:", data.categories?.items);
    } catch (err) {
      console.error("Error fetching all categories:", err);
    }
  };

  // ---------------------------
  // 3) fetchCategoryPlaylists
  //    e.g. "party", "pop", "rock"
  // ---------------------------
  const fetchCategoryPlaylists = async (categoryId, label) => {
    if (!accessToken) return;
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?limit=10&country=US`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await res.json();

      console.log(`🎯 Spotify response for [${label}]`, data); // debug log

      setCategoryPlaylists((prev) => ({
        ...prev,
        [label]: data.playlists?.items || [],
      }));
    } catch (err) {
      console.error(`Failed to fetch ${label} playlists`, err);
    }
  };

  // ---------------------------
  // 4) Featured playlists (local + Spotify DB with featured=true)
  // ---------------------------
  const fetchFeaturedPlaylists = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/featured");
      const data = await res.json();
      if (data.success) {
        setFeaturedPlaylists({ local: data.local, spotify: data.spotify });
      }
    } catch (err) {
      console.error("Failed to fetch featured playlists:", err);
    }
  };

  // ---------------------------
  // 5) fetch local playlists
  // ---------------------------
  const fetchPlaylists = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setPlaylists(data.playlists);
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
    }
  };

  // ---------------------------
  // 6) fetch user's SpotifyPlaylists (database)
  // ---------------------------
  const fetchSpotifyPlaylists = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/spotify-playlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSpotifyPlaylists(data.playlists);
    } catch (err) {
      console.error("Failed to fetch Spotify playlists:", err);
    }
  };

  // ---------------------------
  // 7) fetch user's local albums
  // ---------------------------
  const fetchAlbums = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/albums", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAlbums(data.albums);
    } catch (err) {
      console.error("Failed to fetch albums:", err);
    }
  };

  // ---------------------------
  // 8) fetch followed artists
  // ---------------------------
  const fetchFollowedArtists = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/followed-artists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFollowedArtists(data.artists);
      }
    } catch (err) {
      console.error("Failed to fetch followed artists:", err);
    }
  };

  // ---------------------------
  // 9) Misc playback resets
  // ---------------------------
  const resetEverything = () => {
    setProgress(0);
    setCurrTime("00:00");
    setDuration("00:00");
  };
  const goToPreviousSong = () => {};

  // Update song index
  useEffect(() => {
    if (pendingSongIdx !== null) {
      setSongIdx(pendingSongIdx);
      setPendingSongIdx(null);
    }
  }, [pendingSongIdx]);

  // ---------------------------
  // 10) On first load, fetch local data
  // ---------------------------
  useEffect(() => {
    fetchPlaylists();
    fetchSpotifyPlaylists();
    fetchAlbums();
    fetchFollowedArtists();
    fetchFeaturedPlaylists();
  }, []);

  // ---------------------------
  // 11) Once we have a Spotify accessToken, fetch categories
  // ---------------------------
  useEffect(() => {
    if (!accessToken) return;

    // 1) See all categories to find valid IDs
    fetchAllSpotifyCategories();

    // 2) Now fetch a few known categories
    //    Replace these with category IDs you see from the above log.
    fetchCategoryPlaylists("party", "Party");
    fetchCategoryPlaylists("pop", "Pop");
    fetchCategoryPlaylists("rock", "Rock");
    // If "decades" or "throwback" exist in your region, add them again here
  }, [accessToken]);

  // Provide context
  return (
    <AppContext.Provider
      value={{
        // Basic states
        currTime,
        setCurrTime,
        duration,
        setDuration,
        progress,
        setProgress,
        resetEverything,
        goToPreviousSong,
        songIdx,
        setSongIdx,
        setPendingSongIdx,

        // Misc
        getUser,
        filteredSongs,
        setFilteredSongs,

        // Data
        playlists,
        spotifyPlaylists,
        albums,
        followedArtists,
        featuredPlaylists,
        categoryPlaylists,

        // Fetching
        fetchPlaylists,
        fetchSpotifyPlaylists,
        fetchAlbums,
        fetchFollowedArtists,
        fetchFeaturedPlaylists,
        fetchCategoryPlaylists,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);
