import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { BsCheckCircleFill } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { useAudio } from "../../states/AudioProvider";
import { Link, useNavigate } from "react-router-dom";
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

const MiniCard = ({ song, onClick, hideAlbum = false, active = false }) => {
  if (!song) {
    console.error("MiniCard received an undefined song prop.");
    return null;
  }
  const {
    currentSong,
    isPlaying,
    playPauseSong,
    togglePlayPause,
    getRecommendedSongs,
  } = useAudio();

  const { user, token } = useSelector((state) => state.account);
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const navigate = useNavigate();

  // The unique identifier for the track (front end)
  const songUri = song.uri;

  // State for “Add to playlist” dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [addedToPlaylists, setAddedToPlaylists] = useState([]);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user, songUri]);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlaylists(data.playlists);
        // Mark which playlists contain this track by .uri
        const inThese = data.playlists
          .filter((p) => p.songs.some((s) => s.uri === songUri))
          .map((p) => p._id); // the playlist’s _id
        setAddedToPlaylists(inThese);
      }
    } catch (err) {
      console.error("Error fetching playlists", err);
    }
  };

  const handleSongRadio = async (seedTrack) => {
    // ...
  };

  const addSongToPlaylist = async (playlistId) => {
    const body = {
      songId: songUri, // unify
      name: song.name,
      uri: song.uri,
      album: song.album || "Unknown",
      artists: song.artists || [],
      albumCover: song.albumCover || "",
      duration_ms: song.duration_ms || 0,
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
          body: JSON.stringify({ songId: songUri }),
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

  // Click “play” icon in the thumbnail
  const handlePlayPauseClick = () => {
    if (currentSong?.uri === songUri) {
      togglePlayPause();
    } else {
      playPauseSong(song);
    }
  };

  const isActive = currentSong?.uri === songUri && isPlaying;

  return (
    <div
      className={`mini-card flex items-center justify-between p-2 rounded-sm cursor-pointer transition ${
        isActive ? "active bg-black/40" : "hover:bg-black/40"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0 max-w-[400px]">
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
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPauseClick();
            }}
            className={`mini-play_btn ${isActive ? "active" : ""}`}
          >
            {isActive ? (
              <IoIosPause className="text-white text-xl ml-[6px]" />
            ) : (
              <IoIosPlay className="text-white text-xl ml-[7px]" />
            )}
          </button>
        </div>

        <div className="text-white truncate">
          <h3 className="font-normal text-sm truncate">
            {truncateText(song.name, 40)}
          </h3>
          <p className="text-gray-400 text-sm truncate">
            {Array.isArray(song.artists)
              ? song.artists.slice(0, 2).map((artist, index, arr) => (
                  <Link
                    key={artist.id || `${artist.name}-${index}`}
                    to={`/artist/${artist.id || "#"}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline text-gray-400"
                  >
                    {artist.name}
                    {index < arr.length - 1 ? ", " : ""}
                  </Link>
                ))
              : "Unknown Artist"}
          </p>
        </div>
      </div>

      {!hideAlbum && (
        <div className="w-1/3 px-2 text-start">
          {song.albumId ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/album/${song.albumId}`);
              }}
              className="text-gray-400 text-sm transition hover:underline block max-w-full text-left hover:text-white"
              title={song.album}
            >
              {song.album || "Unknown Album"}
            </button>
          ) : (
            <p className="text-sm text-gray-400 truncate">
              {song.album || "Unknown Album"}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 w-[80px] text-sm relative pr-2">
        {/* Add to playlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen((prev) => !prev);
          }}
          className="add-icon-button text-xl text-green-400 transform hover:scale-110 transition relative pr-3"
        >
          {addedToPlaylists.length > 0 ? (
            <BsCheckCircleFill />
          ) : (
            <CiCirclePlus />
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-full mb-2 right-0 secondary_bg drop-shadow-[0_9px_10px_rgba(0,0,0,0.8)] rounded-md w-[15rem] p-1 z-50">
            <button
              className="block w-full text-left text-white px-2 py-1 hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                handleSongRadio(song);
                setDropdownOpen(false);
              }}
            >
              Start Song Radio
            </button>

            {/* Show playlists */}
            {playlists.length > 0 ? (
              playlists.map((pl) => {
                const isInThisPlaylist = addedToPlaylists.includes(pl._id);
                return (
                  <button
                    key={pl._id}
                    className="block w-full text-left text-white px-2 py-1 hover:bg-gray-800 flex justify-between items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isInThisPlaylist) removeSongFromPlaylist(pl._id);
                      else addSongToPlaylist(pl._id);
                    }}
                  >
                    <span className="text-sm pb-1 pt-1">Add to {pl.name}</span>
                    {isInThisPlaylist && (
                      <BsCheckCircleFill className="text-green-500 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm px-2">No playlists</p>
            )}
          </div>
        )}

        <span className="text-gray-400 text-sm">
          {formatDuration(song.duration_ms)}
        </span>
      </div>
    </div>
  );
};

export default MiniCard;
