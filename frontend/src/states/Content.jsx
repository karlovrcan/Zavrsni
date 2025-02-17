import { createContext, useContext, useState, useEffect } from "react";
import { songs } from "../components/Home/Home";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currTime, setCurrTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [progress, setProgress] = useState(0);
  const [songIdx, setSongIdx] = useState(0);
  const [pendingSongIdx, setPendingSongIdx] = useState(null);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};
