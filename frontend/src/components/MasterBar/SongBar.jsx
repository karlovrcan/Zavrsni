import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../states/AuthContext";
import { useAudio } from "../../states/AudioProvider";

import { IoIosSkipBackward, IoIosSkipForward } from "react-icons/io";
import { IoPauseCircleSharp, IoPlayCircleSharp } from "react-icons/io5";
import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
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
  } = useAudio();

  const disabled = !currentSong;
  const currentSongId = currentSong?.id;

  const { user, token } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isInPlaylist, setIsInPlaylist] = useState(false);

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
        checkIfSongInPlaylist(data.playlists);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const checkIfSongInPlaylist = (allPlaylists) => {
    if (!currentSongId) return;
    const songExists = allPlaylists.some((pl) =>
      pl.songs.some((s) => s._id === currentSongId)
    );
    setIsInPlaylist(songExists);
  };

  const togglePlaylistSong = async (playlistId) => {
    if (!currentSongId) {
      alert("Song id is missing from currentSong!");
      return;
    }

    const playlist = playlists.find((pl) => pl._id === playlistId);
    if (!playlist) {
      console.error("Could not find playlist with _id =", playlistId);
      return;
    }

    const isSongInPlaylist = playlist.songs.some(
      (s) => s._id === currentSongId
    );

    const endpoint = isSongInPlaylist ? "remove-song" : "add-song";

    const requestBody = {
      songId: currentSongId,
      name: currentSong.name,
      uri: currentSong.uri,
      artists: currentSong.artists || [],
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
        fetchPlaylists();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
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
            {isInPlaylist ? (
              <CiCircleMinus className="text-white text-2xl transform hover:scale-110" />
            ) : (
              <CiCirclePlus className="text-white text-2xl transform hover:scale-110" />
            )}
          </button>

          {!disabled && dropdownOpen && (
            <div className="absolute bottom-full mb-2 right-0 bg-black shadow-md rounded-md w-40 p-2 z-50">
              {playlists.length > 0 ? (
                playlists.map((pl) => (
                  <button
                    key={pl._id}
                    className="block w-full text-left text-white px-2 py-1 hover:bg-gray-800"
                    onClick={() => {
                      togglePlaylistSong(pl._id);
                      setDropdownOpen(false);
                    }}
                  >
                    {pl.songs.some((s) => s._id === currentSongId)
                      ? `Remove from ${pl.name}`
                      : `Add to ${pl.name}`}
                  </button>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No playlists found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Playback controls */}
      <div className="flex flex-col items-center w-[40%] min-w-[300px]">
        <div className="flex justify-center gap-5 items-center mt-1">
          <LuShuffle
            className={`text-lg ${
              disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
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
              onClick={() => !disabled && playPauseSong(currentSong)}
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

        {/* Progress */}
        <div className="flex items-center gap-3 w-full px-4 mt-2 mb-1">
          <span className="text-xs text-gray-400 w-8 text-right">
            {disabled ? "0:00" : currTime}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            disabled={disabled}
            value={isNaN(progress) ? 0 : progress}
            onChange={(e) => changeProgress(Number(e.target.value))}
            className={`w-full ${
              disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
          />
          <span className="text-xs text-gray-400 w-8 text-right">
            {disabled ? "0:00" : duration_ms}
          </span>
        </div>
      </div>

      {/* Right: Volume + Icons */}
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
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={changeVolume}
          disabled={disabled}
          className={`w-24 ${
            disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
          }`}
        />
        <TbArrowsDiagonal
          className={`text-xl ${disabled ? "opacity-30" : ""}`}
        />
      </div>
    </div>
  );
};

export default SongBar;
