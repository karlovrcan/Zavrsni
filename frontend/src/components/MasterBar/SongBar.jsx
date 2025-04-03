import { useState, useEffect } from "react";
import { useAudio } from "../../states/AudioProvider";
import { useSelector } from "react-redux";
import { IoIosSkipBackward, IoIosSkipForward } from "react-icons/io";
import { IoPauseCircleSharp, IoPlayCircleSharp } from "react-icons/io5";
import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { BsCheckCircleFill } from "react-icons/bs";

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
import "./SongBar.css";

const SongBar = () => {
  const {
    currentSong,
    isPlaying,
    playPauseSong,
    togglePlayPause,
    progress,
    changeProgress,
    currTime,
    duration_ms,
    changeVolume,
    volume,
    nextSong,
    prevSong,
    shuffleSongs,
    isShuffling,
  } = useAudio();

  const disabled = !currentSong;
  const currentSongId = currentSong?.id;
  const { user, token } = useSelector((state) => state.account);
  const [playlists, setPlaylists] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addedToPlaylists, setAddedToPlaylists] = useState([]);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user, currentSong]);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setPlaylists(data.playlists);
        const added = data.playlists
          .filter((p) => p.songs.some((s) => s._id === currentSongId))
          .map((p) => p._id);
        setAddedToPlaylists(added);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const togglePlaylistSong = async (playlistId) => {
    if (!currentSongId) return;

    const isAdded = addedToPlaylists.includes(playlistId);
    const endpoint = isAdded ? "remove-song" : "add-song";

    const requestBody = {
      songId: currentSongId,
      name: currentSong.name,
      uri: currentSong.uri,
      artists: currentSong.artists || [],
      album: currentSong.album || "Unknown Album",
      albumCover: currentSong.albumCover || "",
      duration_ms: currentSong.duration_ms || 0,
    };

    try {
      const response = await fetch(
        `http://localhost:5001/api/playlists/${playlistId}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      if (data.success) {
        setAddedToPlaylists((prev) =>
          isAdded
            ? prev.filter((id) => id !== playlistId)
            : [...new Set([...prev, playlistId])]
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  const formatRawMs = (ms) => {
    const totalSeconds = Math.floor((ms || 0) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeekClick = (e) => {
    if (disabled) return;

    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;

    changeProgress(newProgress);
  };

  return (
    <div className="w-full fixed bottom-0 left-0 h-[90px] bg-black flex justify-between items-center px-4 z-50">
      <div className="flex items-center gap-4 w-[30%] min-w-[250px]">
        <img
          src={currentSong?.albumCover || "../src/assets/playlistCover.png"}
          alt="Song Cover"
          className="h-14 w-14 rounded-md object-cover"
        />
        <div className="flex flex-col text-sm font-normal">
          <p className="truncate w-[150px] text-white font-semibold">
            {currentSong?.name || ""}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {currentSong?.artists?.map((a) => a.name).join(", ") || ""}
          </p>
        </div>
        <div className="relative">
          <button
            className={`text-white px-3 py-1 rounded-md ${
              disabled ? "opacity-30 cursor-not-allowed" : ""
            }`}
            onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
            disabled={disabled}
          >
            {addedToPlaylists.length > 0 ? (
              <BsCheckCircleFill className="text-green-400 text-lg transform hover:scale-110" />
            ) : (
              <CiCirclePlus className="text-white text-2xl transform hover:scale-110" />
            )}
          </button>
          {!disabled && dropdownOpen && (
            <div className="absolute bottom-full mb-2 right-0 bg-black shadow-md rounded-md w-40 p-2 z-50">
              {playlists.length > 0 ? (
                playlists.map((pl) => {
                  const isAdded = addedToPlaylists.includes(pl._id);
                  return (
                    <button
                      key={pl._id}
                      className="block w-full text-left text-white px-2 py-1 hover:bg-gray-800 flex justify-between items-center"
                      onClick={() => {
                        togglePlaylistSong(pl._id);
                        setDropdownOpen(false);
                      }}
                    >
                      <span className="text-sm">
                        {isAdded
                          ? `Remove from ${pl.name}`
                          : `Add to ${pl.name}`}
                      </span>
                      {isAdded && (
                        <BsCheckCircleFill className="text-green-500 ml-2" />
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-400 text-sm">No playlists found</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center w-[40%] min-w-[300px]">
        <div className="flex justify-center gap-5 items-center mt-1">
          <LuShuffle
            onClick={shuffleSongs}
            className={`text-lg cursor-pointer ${
              isShuffling ? "text-green-400" : "text-white"
            } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
          />

          <IoIosSkipBackward
            onClick={() => !disabled && prevSong()}
            className={`text-2xl ${
              disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
          />
          {isPlaying ? (
            <IoPauseCircleSharp
              className={`text-white text-[40px] ${
                disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={() => !disabled && togglePlayPause()}
            />
          ) : (
            <IoPlayCircleSharp
              className={`text-white text-[40px] ${
                disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={() => !disabled && togglePlayPause()}
            />
          )}

          <IoIosSkipForward
            onClick={() => !disabled && nextSong()}
            className={`text-2xl ${
              disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
          />
          <LuRepeat2
            className={`text-lg ${
              disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
          />
        </div>

        <div className="flex items-center justify-between gap-2 w-full px-4 mt-2 mb-1 h-[32px] relative z-10">
          <span className="text-xs text-gray-400 w-[42px] text-right flex-shrink-0">
            {disabled ? "0:00" : currTime}
          </span>

          <div
            className="slider-container flex-grow relative"
            onClick={handleSeekClick}
          >
            <div
              className="active_progress"
              style={{ width: `${progress || 0}%` }}
            ></div>
            <input
              type="range"
              min={0}
              max={100}
              value={isNaN(progress) ? 0 : progress}
              onChange={(e) => changeProgress(Number(e.target.value))}
              disabled={disabled}
              className={`progression ${
                disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
              }`}
            />
          </div>

          <span className="text-xs text-gray-400 w-[42px] text-right flex-shrink-0">
            {disabled ? "0:00" : formatRawMs(currentSong?.duration_ms)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end w-[30%] min-w-[250px] gap-4 text-white">
        <AiOutlinePlaySquare
          className={`text-xl ${disabled ? "opacity-30" : ""}`}
        />
        <HiOutlineQueueList
          className={`text-xl ${disabled ? "opacity-30" : ""}`}
        />
        {volume > 50 ? (
          <LuVolume2 className={`text-xl ${disabled ? "opacity-30" : ""}`} />
        ) : volume > 0 ? (
          <LuVolume1 className={`text-xl ${disabled ? "opacity-30" : ""}`} />
        ) : (
          <LuVolume className={`text-xl ${disabled ? "opacity-30" : ""}`} />
        )}
        <div className="slider-container w-24">
          <div
            className="active_progress"
            style={{ width: `${volume || 0}%` }}
          ></div>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={changeVolume}
            disabled={disabled}
            className={`progression ${
              disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
          />
        </div>
        <TbArrowsDiagonal
          className={`text-xl ${disabled ? "opacity-30" : ""}`}
        />
      </div>
    </div>
  );
};

export default SongBar;
