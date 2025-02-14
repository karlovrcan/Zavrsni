import { createContext, useContext, useState } from "react";

const AppContext = createContext();
export const AppProvider = ({ children }) => {
  const [currTime, setCurrTime] = useState("00:00");
  const [durration, setDuration] = useState("00:00");
  const [progress, setProgress] = useState(0);
  const resetEverything = () => {
    setProgress(0);
    setCurrTime("00:00");
    setDuration("00:00");
  };
  return (
    <AppContext.Provider
      value={{
        currTime,
        setCurrTime,
        durration,
        setDuration,
        progress,
        setProgress,
        resetEverything,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};
