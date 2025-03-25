import React, { useState } from "react";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { SlOptions } from "react-icons/sl";
import { useAudio } from "../../states/AudioProvider";
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

/**
 * @param {object} song - Must include ._id (string), .name, .artists, etc.
 * @param {array} playlists - List of user’s playlists to choose from
 * @param {function} handleAddSongToPlaylist - (playlistId, songId) => ...
 */
const MiniCard = ({ song, playlists, handleAddSongToPlaylist, onClick }) => {
  if (!song) {
    console.error("MiniCard component received an undefined song prop.");
    return null;
  }

  const { currentSong, isPlaying, playPauseSong, togglePlayPause } = useAudio();
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");

  const songId = song._id;

  const handlePlaylistSelection = async () => {
    if (!selectedPlaylist || !songId) return;
    await handleAddSongToPlaylist(selectedPlaylist, songId);
    setShowPlaylistDropdown(false);
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
      className="mini-card flex items-center justify-between p-2  rounded-sm cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
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
          <h3 className="font-normal text-base">
            {truncateText(song.name, 40)}
          </h3>
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

      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">
          {formatDuration(song.duration_ms || song.duration)}
        </span>

        <button
          onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
          className="text-white"
        >
          <SlOptions className="text-xl option-button transform transition duration-200 hover:scale-110 mx-3" />
        </button>

        {showPlaylistDropdown && (
          <div className="absolute right-0  shadow-lg rounded-md mt-2 p-2 w-48">
            <ul className="text-gray-200">
              <li>
                <select
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                  className="w-full bg-[#121212] text-white p-2 rounded-sm"
                >
                  <option value="">Select Playlist</option>
                  {playlists?.map((pl) => (
                    <option key={pl._id} value={pl._id}>
                      {pl.name}
                    </option>
                  ))}
                </select>
              </li>
              <li
                onClick={handlePlaylistSelection}
                className="flex p-2 hover:bg-[#121212] rounded-md cursor-pointer"
              >
                Add to Playlist
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniCard;
