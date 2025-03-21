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
    duration,
    changeVolume,
    volume,
    nextSong,
    prevSong,
  } = useAudio();

  // If no song is selected, render nothing
  if (!currentSong) return null;

  const { user, token } = useContext(AuthContext);

  const [playlists, setPlaylists] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isInPlaylist, setIsInPlaylist] = useState(false);

  if (!currentSong) return null;
  const currentSongId = currentSong.id;

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user, currentSong]);

  // Fetch the user's playlists from /api/playlists
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

  // See if "currentSongId" is already in any user playlist
  const checkIfSongInPlaylist = (allPlaylists) => {
    if (!currentSongId) return;

    // Because your subdoc uses "_id" in the schema, we must check s._id
    const songExists = allPlaylists.some((pl) =>
      pl.songs.some((s) => s._id === currentSongId)
    );
    setIsInPlaylist(songExists);
  };

  // Toggle add/remove the currentSong to/from the chosen playlist
  const togglePlaylistSong = async (playlistId) => {
    if (!currentSongId) {
      alert("Song id is missing from currentSong!");
      return;
    }

    // Find the playlist object with matching "_id"
    const playlist = playlists.find((pl) => pl._id === playlistId);
    if (!playlist) {
      console.error("Could not find playlist with _id =", playlistId);
      return;
    }

    // If the track is found inside "pl.songs", it means we want to remove it
    const isSongInPlaylist = playlist.songs.some(
      (s) => s._id === currentSongId
    );

    // Choose the correct endpoint
    const endpoint = isSongInPlaylist ? "remove-song" : "add-song";

    // The body must match what your playlist schema expects
    const requestBody = {
      songId: currentSongId,
      name: currentSong.name,
      uri: currentSong.uri,
      artists: currentSong.artists || [],
      albumCover: currentSong.albumCover || "",
      duration: currentSong.duration_ms || 0,
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
        // If it worked, refresh the playlists so we see updated songs
        fetchPlaylists();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  return (
    <div className="w-full fixed bottom-0 left-0 h-[90px] bg-black flex justify-between items-center px-4">
      {/* Left: cover + title + artist + playlist dropdown */}
      <div className="flex items-center gap-4 w-[30%] min-w-[250px]">
        <img
          src={
            currentSong.albumCover ||
            "https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
          }
          alt="Song Cover"
          className="h-14 w-14 rounded-md"
        />
        <div className="flex flex-col text-sm font-normal">
          <p className="truncate w-[150px]">
            {currentSong.name || "Unknown Track"}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {(currentSong.artists || []).map((a) => a.name).join(", ")}
          </p>
        </div>
        <div className="relative">
          <button
            className="text-white px-3 py-1 rounded-md"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {isInPlaylist ? (
              <CiCircleMinus className="text-white text-2xl transform hover:scale-110" />
            ) : (
              <CiCirclePlus className="text-white text-2xl transform hover:scale-110" />
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute bottom-full mb-2 right-0 bg-black shadow-md rounded-md w-40 p-2">
              {playlists.length > 0 ? (
                playlists.map((pl) => (
                  <button
                    key={pl._id} // use pl._id for the playlist's unique key
                    className="block w-full text-left text-white px-2 py-1 hover:bg-gray-800"
                    onClick={() => {
                      togglePlaylistSong(pl._id); // pass pl._id to the toggler
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
          <LuShuffle className="text-lg cursor-pointer" />
          <IoIosSkipBackward
            onClick={prevSong}
            className="text-2xl cursor-pointer"
          />
          {isPlaying ? (
            <IoPauseCircleSharp
              className="text-white text-[40px] cursor-pointer"
              onClick={togglePlayPause}
            />
          ) : (
            <IoPlayCircleSharp
              className="text-white text-[40px] cursor-pointer"
              onClick={() => playPauseSong(currentSong)}
            />
          )}
          <IoIosSkipForward
            onClick={nextSong}
            className="text-2xl cursor-pointer"
          />
          <LuRepeat2 className="text-lg cursor-pointer" />
        </div>

        {/* Progress bar + times */}
        <div className="flex items-center gap-3 w-full px-4 mt-2 mb-1">
          <span className="text-xs text-gray-400 w-8 text-right">
            {currTime}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={isNaN(progress) ? 0 : progress}
            onChange={(e) => changeProgress(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
          <span className="text-xs text-gray-400 w-8 text-right">
            {duration}
          </span>
        </div>
      </div>

      {/* Right: volume + queue icons */}
      <div className="flex items-center justify-end w-[30%] min-w-[250px] gap-4">
        <AiOutlinePlaySquare className="text-xl" />
        <HiOutlineQueueList className="text-xl" />
        {volume > 50 ? (
          <LuVolume2 className="text-xl" />
        ) : volume > 0 ? (
          <LuVolume1 className="text-xl" />
        ) : (
          <LuVolume className="text-xl" />
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
