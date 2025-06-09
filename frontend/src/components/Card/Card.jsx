import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { useAudio } from "../../states/AudioProvider";
import "./Card.css";

const truncateText = (text, length) => {
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const Card = ({
  song,
  type = "Track",
  playlists,
  handleAddSongToPlaylist,
  onPlayRequest,
  onClickCard,
}) => {
  if (!song) {
    console.error("Card component received an undefined song prop.");
    return null;
  }
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    playPauseSong,
    togglePlayPause,
    currentPlaylistId,
  } = useAudio();
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const isActivePlaylist = currentPlaylistId === song.id;

  const handlePlaylistSelection = async () => {
    if (!selectedPlaylist) return;
    await handleAddSongToPlaylist(selectedPlaylist, song.id);
    setShowPlaylistDropdown(false);
  };

  const handlePlayPauseClick = () => {
    const patchedSong = { ...song, id: song.id || song._id || song.uri };
    if (currentSong?.uri === song.uri) {
      togglePlayPause();
    } else {
      playPauseSong(patchedSong);
    }
  };

  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <>
      <div className="w-full">
        <div
          className={`card p-3 rounded-lg items-stretch relative ${
            isActivePlaylist ? "active" : ""
          }`}
          onClick={() => {
            if (typeof onClickCard === "function") {
              onClickCard();
            } else {
              navigate(`/spotify-playlist/${song.id}`);
            }
          }}
        >
          <div className="relative flex justify-center items-center">
            <img
              src={
                song.albumCover ||
                "https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
              }
              alt="Album Cover"
              className={`w-full h-full object-cover ${
                type === "artist" ? "rounded-full" : "rounded-lg"
              }`}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onPlayRequest === "function") {
                  onPlayRequest(song);
                } else {
                  handlePlayPauseClick();
                }
              }}
              className={`play_btn ${isActivePlaylist ? "active" : ""}`}
            >
              {isActivePlaylist && isPlaying ? (
                <IoIosPause className="text-black text-3xl" />
              ) : (
                <IoIosPlay className="text-black text-3xl" />
              )}
            </button>
          </div>
          <div className="mt-2 text-start">
            <h3 className="text-white font-semibold line-clamp-2 text-sm mb-1">
              {truncateText(song.name, 35)}
            </h3>

            <p className="text-sm text-gray-400 mb-1">{formattedType}</p>

            <p className="text-gray-400 text-sm">
              {song.artists
                .slice(0, 2)
                .map((artist) => artist.name)
                .join(", ") + (song.artists.length > 2 ? "..." : "")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
