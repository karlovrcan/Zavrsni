import { createContext, useContext, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { userActor } from "./Actors/userActors";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currTime, setCurrTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [progress, setProgress] = useState(0);
  const [songIdx, setSongIdx] = useState(0);
  const [pendingSongIdx, setPendingSongIdx] = useState(null);
  const [filteredSongs, setFilteredSongs] = useState([]);

  const dispatch = useDispatch();
  // Content.jsx
  const getUser = async () => {
    try {
      const token = sessionStorage.getItem("spotify_access_token");

      if (!token) {
        console.error("No access token found");
        return;
      }

      // Fetch user data from an API or other source
      const response = await fetch("your-api-endpoint", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if the response is JSON
      const data = await response.text(); // Get response as text (not JSON)

      // If the response is a JWT or a non-JSON, don't attempt to parse
      if (data.startsWith("{") || data.startsWith("[")) {
        // It's likely JSON, so parse it
        const parsedData = JSON.parse(data);
        console.log("User data:", parsedData);
      } else {
        // Handle the case where it's a non-JSON string (e.g., JWT token)
        console.log("Received non-JSON data:", data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (pendingSongIdx !== null) {
      setSongIdx(pendingSongIdx);
      setPendingSongIdx(null);
    }
  }, [pendingSongIdx]);

  const resetEverything = () => {
    setProgress(0);
    setCurrTime("00:00");
    setDuration("00:00");

    if (songIdx < songs.length - 1) {
      setPendingSongIdx(songIdx + 1);
    } else {
      console.warn("⚠ No next song available");
    }
  };

  const goToPreviousSong = () => {
    if (songIdx > 0) {
      setPendingSongIdx(songIdx - 1);
    } else {
      console.warn("⚠ No previous song available");
    }
  };

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};
