import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { playMaster, pauseMaster } from "../../states/Actors/SongActors";
import "./SongBar.css";

import {
  IoMdAddCircleOutline,
  IoIosSkipBackward,
  IoIosSkipForward,
} from "react-icons/io";
import { IoPauseCircleSharp, IoPlayCircleSharp } from "react-icons/io5";
import { LuShuffle, LuRepeat2, LuVolume2 } from "react-icons/lu";
import { AiOutlinePlaySquare } from "react-icons/ai";
import { HiOutlineQueueList } from "react-icons/hi2";
import { TbArrowsDiagonal } from "react-icons/tb";
import { useGlobalContext } from "../../states/Content";

const SongBar = () => {
  const { masterSong, isPlaying } = useSelector((state) => state.mainSong);
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const {
    progress,
    setProgress,
    resetEverything,
    currTime,
    setCurrTime,
    duration,
    setDuration,
  } = useGlobalContext();

  useEffect(() => {
    console.log("🔄 useEffect triggered! MasterSong:", masterSong); // Debugging log
    if (!masterSong || !masterSong.mp3) {
      console.warn("🚨 No masterSong or mp3 found. Exiting useEffect.");
      return;
    }

    if (audioRef.current && audioRef.current !== masterSong.mp3) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    audioRef.current = masterSong.mp3;

    // ✅ Wait for metadata to load before setting duration
    audioRef.current.onloadedmetadata = () => {
      console.log("✅ Metadata Loaded! Duration:", audioRef.current.duration);

      setTimeout(() => {
        setDuration(audioRef.current.duration || 0);
        console.log("📏 Updated Duration State:", audioRef.current.duration);
      }, 100); // Delay state update to ensure React processes it
    };

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (!masterSong.mp3) return;
        setProgress(
          (masterSong.mp3.currentTime / masterSong.mp3.duration) * 100
        );
        setCurrTime(formatTime(masterSong.mp3.currentTime));
      }, 1000);

      timeoutRef.current = setTimeout(() => {
        if (!isPlaying) return;
        audioRef.current
          .play()
          .catch((err) => console.error("❌ Playback Error:", err));
      }, 200);
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, [masterSong, isPlaying]);

  const handleMaster = () => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      dispatch(pauseMaster());
      setTimeout(() => {
        audioRef.current.pause();
      }, 100);
    } else {
      dispatch(playMaster());
      setTimeout(() => {
        if (!isPlaying) return;
        audioRef.current
          .play()
          .catch((err) => console.error("❌ Play Error:", err));
      }, 150);
    }
  };

  const changeProgress = (e) => {
    const newProgress = e.target.value;
    setProgress(newProgress);
    masterSong.mp3.currentTime = (newProgress / 100) * masterSong.mp3.duration;
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="w-full fixed bottom-0 left-0 h-20 bg-black flex justify-between items-center px-4">
      <div className="flex items-center gap-4 w-[30%] min-w-[250px]">
        <img
          src="https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
          alt="Song Cover"
          className="h-14 w-14 rounded-md"
        />
        <div className="flex flex-col text-sm font-normal">
          <p className="truncate w-[150px]">
            {masterSong?.title || "No Title"}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {masterSong?.artist || "Unknown Artist"}
          </p>
        </div>
        <IoMdAddCircleOutline className="text-xl text-gray-400" />
      </div>

      <div className="flex flex-col items-center w-[40%] min-w-[300px]">
        <div className="flex justify-center gap-5 items-center">
          <LuShuffle className="text-lg" />
          <IoIosSkipBackward className="text-2xl" />
          {isPlaying ? (
            <button onClick={handleMaster}>
              <IoPauseCircleSharp className="text-white text-[40px]" />
            </button>
          ) : (
            <button onClick={handleMaster}>
              <IoPlayCircleSharp className="text-white text-[40px]" />
            </button>
          )}
          <IoIosSkipForward className="text-2xl" />
          <LuRepeat2 className="text-lg" />
        </div>
        <div className="flex items-center gap-2 w-full px-4">
          <span className="text-xs text-gray-400 w-8 text-right">
            {currTime}
          </span>
          <input
            type="range"
            min={0}
            value={progress}
            onChange={changeProgress}
            disabled={!masterSong?.mp3}
            max={100}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-400 w-8">
            {console.log("📏 Duration State:", duration)}
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end w-[30%] min-w-[250px] gap-4">
        <AiOutlinePlaySquare className="text-xl" />
        <HiOutlineQueueList className="text-xl" />
        <LuVolume2 className="text-xl" />
        <input
          type="range"
          min={0}
          max={100}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
        <TbArrowsDiagonal className="text-xl" />
      </div>
    </div>
  );
};

export default SongBar;
