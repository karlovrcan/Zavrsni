import { createContext, useContext, useState, useEffect } from "react";
import { songs } from "../../src/assets/songs/songs";
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
  const [filteredSongs, setFilteredSongs] = useState ([]);

  const dispatch = useDispatch();
  const getUser = async () => {
    const tokenString = localStorage.getItem("token");
    const token =
      tokenString && tokenString !== "undefined"
        ? JSON.parse(tokenString)
        : null;
    if (tokenString === "undefined") {
      localStorage.removeItem("token");
    }
    if (token) {
      const res = await fetch("http://localhost:5001/api/user/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const Data = await res.json();
      if (Data.success && Data.token) {
        localStorage.setItem("token", JSON.stringify(Data.token));
        dispatch(userActor(Data.user));
      } else {
        toast.error(Data.message);
      }
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
