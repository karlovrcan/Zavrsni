import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_ABOUT } from "./states/Constants/UserConstant";
import { AppProvider } from "./states/Content";
import { AudioProvider } from "./states/AudioProvider";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import Search from "./components/Search/Search";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Songbar from "./components/MasterBar/SongBar";
import Playlist from "./components/Playlist/Playlist";
import SpotifyPlaylist from "./components/Playlist/SpotifyPlaylist";
import ArtistProfile from "./components/Profile/ArtistProfile";
import Album from "./components/Album/Album";
import Profile from "./components/Profile/Profile";
import Admin from "./components/Admin/Admin";
import { fetchSongs } from "./api/spotifyService";
import SongRadio from "./components/SongRadio.jsx/SongRadio";
import RecentlyPlayed from "./components/RecentlyPlayed/RecentlyPlayed";
import CategoryPlaylist from "./components/CategoryPlaylist/CategoryPlaylist";
const AppContent = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const user = useSelector((state) => state.account.user);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";

  const hideNavAndSongBar =
    location.pathname === "/login" || location.pathname === "/signup";

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    const restoreUser = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          dispatch({ type: USER_ABOUT, payload: res.data.user });
        }
      } catch (err) {
        console.error("🔴 Failed to restore user:", err.message);
      }
    };

    if (token && !user?._id) {
      restoreUser();
    }
  }, []);

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

  return (
    <>
      {!hideNavAndSongBar && <Navbar onSearch={handleSearch} />}

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
        <Route path="/playlist/:id" element={<Playlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/spotify-playlist/:id" element={<SpotifyPlaylist />} />
        <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route path="/album/:id" element={<Album />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/radio/:seedId" element={<SongRadio />} />
        <Route path="/recently-played" element={<RecentlyPlayed />} />
        <Route path="/category/:categoryId" element={<CategoryPlaylist />} />
      </Routes>

      {!hideNavAndSongBar && <Songbar />}
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AudioProvider>
        <Router>
          <AppContent />
        </Router>
      </AudioProvider>
    </AppProvider>
  );
};

export default App;
