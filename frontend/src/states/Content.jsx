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

  const [followedArtists, setFollowedArtists] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState({
    local: [],
    spotify: [],
  });
  const [categoryPlaylists, setCategoryPlaylists] = useState({});

  const [playlists, setPlaylists] = useState([]);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);

  const { token } = useSelector((state) => state.account);
  const accessToken = useSelector((state) => state.spotify.accessToken);

  const dispatch = useDispatch();

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

      fetchPlaylists();
      fetchSpotifyPlaylists();
      fetchAlbums();
      fetchFollowedArtists();
    } catch (error) {
      toast.error("Failed to fetch Spotify user data.");
    }
  };

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

  const resetEverything = () => {
    setProgress(0);
    setCurrTime("00:00");
    setDuration("00:00");
  };
  const goToPreviousSong = () => {};

  useEffect(() => {
    if (pendingSongIdx !== null) {
      setSongIdx(pendingSongIdx);
      setPendingSongIdx(null);
    }
  }, [pendingSongIdx]);

  useEffect(() => {
    fetchPlaylists();
    fetchSpotifyPlaylists();
    fetchAlbums();
    fetchFollowedArtists();
    fetchFeaturedPlaylists();
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    fetchAllSpotifyCategories();
    fetchCategoryPlaylists("party", "Party");
    fetchCategoryPlaylists("pop", "Pop");
    fetchCategoryPlaylists("rock", "Rock");
  }, [accessToken]);

  return (
    <AppContext.Provider
      value={{
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

        getUser,
        filteredSongs,
        setFilteredSongs,

        playlists,
        spotifyPlaylists,
        albums,
        followedArtists,
        featuredPlaylists,
        categoryPlaylists,

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
