import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppProvider } from "./states/Content";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import Search from "./components/Search/Search";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import { setSpotifyDeviceId } from "./states/Actions/SpotifyActions"; // ✅ Store device ID in Redux

const App = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const [results, setResults] = useState([]); // ✅ Define state for search results

  // Function that receives query from Navbar and handles search
  const handleSearch = async (query) => {
    if (!query) return;
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await res.json();
      setResults(data.tracks.items || []); // ✅ Safely set results
    } catch (error) {
      console.error("Error fetching songs:", error);
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
        });

        player.addListener("not_ready", ({ device_id }) => {
          console.log("⚠️ Device has gone offline:", device_id);
        });

        player.connect();
      };
    }
  }, [accessToken, dispatch]);

  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Navbar onSearch={handleSearch} />{" "}
          {/* ✅ Pass handleSearch to Navbar */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search query={results} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
