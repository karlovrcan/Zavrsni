import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { playSong } from "../../states/Actors/SongActors";
import { useGlobalContext } from "../../states/Content";
import {
  IoMdAddCircleOutline,
  IoIosSkipBackward,
  IoIosSkipForward,
} from "react-icons/io";
import { IoPauseCircleSharp, IoPlayCircleSharp } from "react-icons/io5";
import {
  LuShuffle,
  LuRepeat2,
  LuVolume2,
  LuVolume1,
  LuVolume,
} from "react-icons/lu";
import { AiOutlinePlaySquare } from "react-icons/ai";
import { HiOutlineQueueList } from "react-icons/hi2";
import { TbArrowsDiagonal } from "react-icons/tb";

const SongBar = () => {
  const dispatch = useDispatch();
  const { masterSong, isPlaying } = useSelector((state) => state.mainSong);
  const {
    progress,
    setProgress,
    currTime,
    setCurrTime,
    duration,
    setDuration,
    songIdx,
    setSongIdx,
    pendingSongIdx,
    setPendingSongIdx,
  } = useGlobalContext();

  const audioRef = useRef(null);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const [volume, setVolume] = useState(50);
  const [currentSong, setCurrentSong] = useState(null);

  // Play / Pause Logic
  useEffect(() => {
    if (!masterSong || !masterSong.mp3) return;

    // If song changes, reset previous one
    if (audioRef.current && audioRef.current !== masterSong.mp3) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    audioRef.current = masterSong.mp3;
    audioRef.current.load();

    // Update metadata
    audioRef.current.onloadedmetadata = () => {
      setTimeout(() => setDuration(audioRef.current.duration || 0), 100);
    };

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(
          (audioRef.current.currentTime / audioRef.current.duration) * 100
        );
        setCurrTime(formatTime(audioRef.current.currentTime));
      }, 1000);

      timeoutRef.current = setTimeout(() => {
        audioRef.current
          .play()
          .catch((err) => console.error("Playback Error:", err));
      }, 200);
    } else {
      audioRef.current.pause();
    }

    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, [masterSong, isPlaying]);

  // Play/Pause button handler
  const handleMaster = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      dispatch(pauseMaster());
      setTimeout(() => audioRef.current.pause(), 100);
    } else {
      dispatch(playMaster());
      setTimeout(
        () =>
          audioRef.current
            .play()
            .catch((err) => console.error("Play Error:", err)),
        150
      );
    }
  };

  // Change song progress
  const changeProgress = (e) => {
    const newProgress = e.target.value;
    setProgress(newProgress);
    audioRef.current.currentTime =
      (newProgress / 100) * audioRef.current.duration;
  };

  // Change volume
  const changeVolume = (e) => {
    setVolume(e.target.value);
    audioRef.current.volume = e.target.value / 100;
  };

  // Format time for display
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle song navigation
  const forwardSong = () =>
    setPendingSongIdx(songIdx < songs.length - 1 ? songIdx + 1 : songIdx);
  const backwardSong = () =>
    setPendingSongIdx(songIdx > 0 ? songIdx - 1 : songIdx);

  // Get current song details
  useEffect(() => {
    if (masterSong) {
      const foundSong = songs.find((song) => song.id === masterSong.id);
      setCurrentSong(foundSong);
    }
  }, [masterSong]);

  return (
    <div className="w-full fixed bottom-0 left-0 h-[90px] bg-black flex justify-between items-center px-4">
      {/* Left: Song Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[250px]">
        <img
          src={
            currentSong?.img ||
            "https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
          }
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

      {/* Middle: Playback Controls */}
      <div className="flex flex-col items-center w-[40%] min-w-[300px]">
        <div className="flex justify-center gap-5 items-center mt-1">
          <LuShuffle className="text-lg" />
          <IoIosSkipBackward
            onClick={backwardSong}
            className="text-2xl cursor-pointer"
          />
          {isPlaying ? (
            <IoPauseCircleSharp
              className="text-white text-[40px] cursor-pointer"
              onClick={handleMaster}
            />
          ) : (
            <IoPlayCircleSharp
              className="text-white text-[40px] cursor-pointer"
              onClick={handleMaster}
            />
          )}
          <IoIosSkipForward
            onClick={forwardSong}
            className="text-2xl cursor-pointer"
          />
          <LuRepeat2 className="text-lg" />
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3 w-full px-4 mt-2 mb-1">
          <span className="text-xs text-gray-400 w-8 text-right">
            {currTime}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={changeProgress}
            className="w-full cursor-pointer"
          />
          <span className="text-xs text-gray-400 w-8">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume & Queue */}
      <div className="flex items-center justify-end w-[30%] min-w-[250px] gap-4">
        <AiOutlinePlaySquare className="text-xl" />
        <HiOutlineQueueList className="text-xl" />
        {volume == 0 ? (
          <LuVolume className="text-xl" />
        ) : volume > 50 ? (
          <LuVolume2 className="text-xl" />
        ) : (
          <LuVolume1 className="text-xl" />
        )}
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={changeVolume}
          className="w-24 cursor-pointer"
        />
        <TbArrowsDiagonal className="text-xl" />
      </div>
    </div>
  );
};

export default SongBar;
