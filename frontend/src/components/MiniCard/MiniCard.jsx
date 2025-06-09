import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { BsCheckCircleFill } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { useAudio } from "../../states/AudioProvider";
import { Link, useNavigate } from "react-router-dom";
import "./MiniCard.css";
import GuestModalPortal from "../GuestModal/GuestModalPortal";

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
  const { currentSong, isPlaying, playPauseSong, togglePlayPause } = useAudio();

  const { user, token, isAuthenticated } = useSelector(
    (state) => state.account
  );
  const [showGuestModal, setShowGuestModal] = useState(false);
  const isGuest = !isAuthenticated || user?.role === "guest";
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const navigate = useNavigate();
  const songUri = song.uri;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [addedToPlaylists, setAddedToPlaylists] = useState([]);

  useEffect(() => {
    if (user && token) {
      fetchPlaylists();
    }
  }, [user, token, songUri]);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
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

  const handlePlayPauseClick = () => {
    if (currentSong?.uri === songUri) {
      togglePlayPause();
    } else {
      if (typeof onClick === "function") {
        onClick();
      }
    }
  };

  const isActive = currentSong?.uri === songUri && isPlaying;

  return (
    <>
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
                if (isGuest) {
                  setShowGuestModal(true);
                  return;
                }
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
                      to={artist.id ? `/artist/${artist.id}` : "#"}
                      onClick={(e) => {
                        if (!artist.id) {
                          e.preventDefault();
                        }
                        e.stopPropagation();
                      }}
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
          <button
            onClick={(e) => {
              if (isGuest) {
                setShowGuestModal(true);
                return;
              }
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
            <div className="absolute bottom-[40px] right-0 w-64 bg-[#242424] rounded-lg drop-shadow-[0_0_10px_rgba(0,0,0,0.9)] p-2 z-[999]">
              <p className="text-gray-400 text-sm px-2 mb-2 mt-2">
                Add to playlist
              </p>
              <div className="w-full h-[2px] bg-white/10" />
              <div className="max-h-64 overflow-y-auto custom-scrollbar mt-1">
                {playlists.length > 0 ? (
                  playlists.map((pl) => {
                    const isInThisPlaylist = addedToPlaylists.includes(pl._id);
                    const playlistImage =
                      pl.songs?.[0]?.albumCover ||
                      "https://misc.scdn.co/liked-songs/liked-songs-640.png";

                    return (
                      <button
                        key={pl._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isInThisPlaylist) {
                            removeSongFromPlaylist(pl._id);
                          } else {
                            addSongToPlaylist(pl._id);
                          }
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between text-left px-2 py-2 rounded hover:bg-[#1a1a1a] transition ${
                          isInThisPlaylist ? "bg-[#1db954]/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={playlistImage}
                            alt="playlist"
                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                          />
                          <span className="text-white text-sm truncate">
                            {pl.name}
                          </span>
                        </div>
                        {isInThisPlaylist ? (
                          <BsCheckCircleFill className="text-green-500 text-lg flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 border border-white/30 rounded-full flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm px-2">
                    No playlists found
                  </p>
                )}
              </div>
              <div className="flex justify-end px-2 pt-2">
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="text-gray-400 text-sm hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <span className="text-gray-400 text-sm">
            {formatDuration(song.duration_ms)}
          </span>
        </div>
      </div>
    </>
  );
};

export default MiniCard;
