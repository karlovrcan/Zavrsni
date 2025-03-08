import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppProvider } from "./states/Content";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import Search from "./components/Search/Search";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import ArtistCard from "./components/ArtistCard/ArtistCard";
import AlbumCard from "./components/AlbumCard/AlbumCard";
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
    if (accessToken) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "My Spotify App",
          getOAuthToken: (cb) => cb(accessToken),
          volume: 0.8,
        });

        player.addListener("ready", ({ device_id }) => {
          console.log("🎵 Spotify Web Player Ready. Device ID:", device_id);
          dispatch(setSpotifyDeviceId(device_id));
          setDeviceId(device_id); // ✅ Save device ID in state
        });

        player.addListener("not_ready", ({ device_id }) => {
          console.log("⚠️ Device has gone offline:", device_id);
        });

        player.connect();
      };
    }
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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent /> {/* ✅ Now useLocation() is inside Router */}
      </Router>
    </AppProvider>
  );
};

export default App;
