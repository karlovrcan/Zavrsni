import React, { useState, useEffect, useContext } from "react";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { BsCheckCircleFill } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { useAudio } from "../../states/AudioProvider";
import { AuthContext } from "../../states/AuthContext";
import "./MiniCard.css";

const truncateText = (text, length) => {
  if (!text || typeof text !== "string") return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const formatDuration = (ms) => {
  if (!ms || ms <= 0) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const MiniCard = ({ song, onClick }) => {
  if (!song) {
    console.error("MiniCard component received an undefined song prop.");
    return null;
  }

  const { currentSong, isPlaying, playPauseSong, togglePlayPause } = useAudio();
  const { user, token } = useContext(AuthContext);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [addedToPlaylists, setAddedToPlaylists] = useState([]);

  const songId = song._id || song.id || song.uri;

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user, songId]);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlaylists(data.playlists);
        const added = data.playlists
          .filter((p) => p.songs.some((s) => s._id === songId))
          .map((p) => p._id);
        setAddedToPlaylists(added);
      }
    } catch (err) {
      console.error("Error fetching playlists", err);
    }
  };

  const addSongToPlaylist = async (playlistId) => {
    const body = {
      songId: songId,
      name: song.name || "Unknown",
      uri: song.uri,
      album: song.album || "Unknown Album",
      artists: song.artists || [],
      albumCover: song.albumCover || "",
      duration_ms: song.duration_ms || song.duration || 0,
    };

    try {
      const res = await fetch(
        `http://localhost:5001/api/playlists/${playlistId}/add-song`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (data.success) {
        setAddedToPlaylists((prev) => [...new Set([...prev, playlistId])]);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error adding song to playlist", err);
    }
  };

  const removeSongFromPlaylist = async (playlistId) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/playlists/${playlistId}/remove-song`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ songId }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setAddedToPlaylists((prev) => prev.filter((id) => id !== playlistId));
        if (typeof window.refreshActivePlaylist === "function") {
          window.refreshActivePlaylist();
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error removing song from playlist", err);
    }
  };

  const handlePlayPauseClick = () => {
    if (currentSong?.uri === song.uri) {
      togglePlayPause();
    } else {
      playPauseSong(song);
    }
  };

  return (
    <div
      className="mini-card flex items-center justify-between p-2 rounded-sm cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 w-1/3">
        <div className="relative w-12 h-12">
          <img
            src={
              song.albumCover ||
              "https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
            }
            alt="Album Cover"
            className="w-12 h-12 rounded-md object-cover"
          />
          <button
            onClick={handlePlayPauseClick}
            className={`mini-play_btn ${
              currentSong?.uri === song.uri && isPlaying ? "active" : ""
            }`}
          >
            {currentSong?.uri === song.uri && isPlaying ? (
              <IoIosPause className="text-white text-xl ml-[6px]" />
            ) : (
              <IoIosPlay className="text-white text-xl ml-[7px]" />
            )}
          </button>
        </div>

        <div className="text-white">
          <h3 className="font-normal text-sm">{truncateText(song.name, 40)}</h3>
          <p className="text-gray-400 text-sm">
            {Array.isArray(song.artists)
              ? song.artists
                  .slice(0, 2)
                  .map((artist) => artist.name)
                  .join(", ")
              : "Unknown Artist"}
          </p>
        </div>
      </div>

      {/* Center: Album */}
      <div className="w-1/3 text-center">
        <p className="text-gray-300 text-sm italic">
          {song.album || "Unknown Album"}
        </p>
      </div>

      {/* Right: Add button + duration */}
      <div className="flex items-center gap-2 w-1/3 justify-end mr-2 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen((prev) => !prev);
          }}
          className="add-icon-button text-xl text-green-400 transform hover:scale-110 transition relative pr-4"
        >
          {addedToPlaylists.length > 0 ? (
            <BsCheckCircleFill />
          ) : (
            <CiCirclePlus />
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-full mb-2 right-0 secondary_bg drop-shadow-[0_9px_10px_rgba(0,0,0,0.8)] rounded-md w-[15rem] p-1 z-50">
            {playlists.length > 0 ? (
              playlists.map((pl) => {
                const isAdded = addedToPlaylists.includes(pl._id);
                return (
                  <button
                    key={pl._id}
                    className="block w-full text-left text-white px-2 py-1 hover:bg-gray-800 flex justify-between items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAdded) {
                        removeSongFromPlaylist(pl._id);
                      } else {
                        addSongToPlaylist(pl._id);
                      }
                    }}
                  >
                    <span className="text-sm pb-1 pt-1">Add to {pl.name}</span>
                    {isAdded && (
                      <BsCheckCircleFill className="text-green-500 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm">No playlists</p>
            )}
          </div>
        )}

        <span className="text-gray-400 text-sm">
          {formatDuration(song.duration_ms || song.duration)}
        </span>
      </div>
    </div>
  );
};

export default MiniCard;
