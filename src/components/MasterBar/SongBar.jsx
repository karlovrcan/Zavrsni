import React, { useEffect } from "react";
import { useSelector } from "react-redux";

const SongBar = () => {
  const { masterSong, isPlaying } = useSelector((state) => state.mainSong);
  useEffect(() => {
    if (masterSong) {
      if (isPlaying) masterSong?.mp3?.play();
      else masterSong?.mp3?.pause();
    }
  }, [masterSong, isPlaying]);
  return <div className="w-full fixed bottom-0 left-0 h-20 bg-black"></div>;
};

export default SongBar;
