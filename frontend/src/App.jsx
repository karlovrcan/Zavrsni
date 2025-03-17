import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppProvider } from "./states/Content";
import { AudioProvider } from "./states/AudioProvider"; // ✅ Import AudioProvider
import AuthProvider from "./states/AuthContext"; // Auth context for login
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import Search from "./components/Search/Search";
import Login from "./components/Login/Login"; // ✅ Import Login
import Signup from "./components/Signup/Signup";
import ArtistCard from "./components/ArtistCard/ArtistCard";
import AlbumCard from "./components/AlbumCard/AlbumCard";
import Songbar from "./components/MasterBar/SongBar"; // ✅ Ensure Songbar is included
import { setSpotifyDeviceId } from "./states/Actions/SpotifyActions";
import { fetchSongs } from "./api/spotifyService";

const AppContent = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.spotify.accessToken);

  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [deviceId, setDeviceId] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, accessToken]);

  const handleSearch = async (query) => {
    if (!query || !accessToken) return;

    try {
      const { tracks, artists, albums, playlists } = await fetchSongs(
        query,
        accessToken
      );

      setSongs(tracks);
      setArtists(artists);
      setAlbums(albums);
      setPlaylists(playlists);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
  
    let playerInstance; // <-- store the Spotify Player instance here
  
    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      script.onload = initializePlayer;
      document.body.appendChild(script);
    } else {
      initializePlayer();
    }
  
    function initializePlayer() {
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "My Spotify App",
          getOAuthToken: (cb) => cb(accessToken),
          volume: 0.8,
        });
  
        // Keep a reference to our player instance:
        playerInstance = player;
  
        player.addListener("ready", ({ device_id }) => {
          console.log("🎵 Spotify Web Player Ready. Device ID:", device_id);
          dispatch(setSpotifyDeviceId(device_id));
          setDeviceId(device_id);
        });
  
        // ... the other event listeners ...
  
        player.connect().then((success) => {
          if (success) {
            console.log("✅ Connected to Spotify Web Player.");
          } else {
            console.error("❌ Failed to connect to Spotify Web Player.");
          }
        });
      };
    }
  
    return () => {
      // Clean up by disconnecting the actual instance
      if (playerInstance) {
        console.log("🛑 Disconnecting Spotify Player...");
        playerInstance.disconnect();
      }
    };
  }, [accessToken, dispatch]);
  

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/search"
          element={
            <Search
              songs={songs}
              artists={artists}
              albums={albums}
              playlists={playlists}
            />
          }
        />
        <Route path="/artist/:id" element={<ArtistCard />} />
        <Route path="/album/:id" element={<AlbumCard />} />
        <Route path="/login" element={<Login />} /> {/* Login Route */}
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <Songbar /> {/* ✅ Ensure Songbar is always visible */}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider> {/* Wrap the app in AuthProvider */}
      <AppProvider>
        <AudioProvider>
          {" "}
          {/* ✅ Wrap the entire app in AudioProvider */}
          <Router>
            <AppContent />
          </Router>
        </AudioProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
