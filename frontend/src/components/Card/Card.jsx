import React, { useState } from "react";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { SlOptions } from "react-icons/sl";
import { useAudio } from "../../states/AudioProvider";
import "./Card.css";

const truncateText = (text, length) => {
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const Card = ({ song, type, playlists, handleAddSongToPlaylist }) => {
  // Guard against missing song prop
  if (!song) {
    console.error("Card component received an undefined song prop.");
    return null;
  }

  // Pull from AudioProvider: current track info + controls
  const { currentSong, isPlaying, playPauseSong, togglePlayPause } = useAudio();

  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");

  const handlePlaylistSelection = async () => {
    if (!selectedPlaylist) return;
    await handleAddSongToPlaylist(selectedPlaylist, song.id);
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
    <div className="card col-span-1 p-3 rounded-lg hover:bg-[#242424] relative mb-2">
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
          onClick={handlePlayPauseClick}
          className={`play_btn ${
            currentSong?.uri === song.uri && isPlaying ? "active" : ""
          }`}
        >
          {currentSong?.uri === song.uri && isPlaying ? (
            <c className="text-white text-3xl" />
          ) : (
            <IoIosPlay className="text-white text-3xl" />
          )}
        </button>
      </div>

      <div className="mt-2 text-start">
        <h3 className="text-white font-semibold text-base mb-2">
          {truncateText(song.name, 30)}
        </h3>
        <p className="text-white text-sm">
          {song.artists
            .slice(0, 2)
            .map((artist) => artist.name)
            .join(", ") + (song.artists.length > 2 ? "..." : "")}
        </p>

        {/* Playlist dropdown trigger */}
        <button
          onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
          className="absolute top-2 right-14 text-white"
        >
          <SlOptions className="text-2xl" />
        </button>

        {showPlaylistDropdown && (
          <div className="absolute right-2 bg-[#242424] shadow-lg rounded-md mt-2 p-2 w-48">
            <ul className="text-gray-200">
              <li>
                <select
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                  className="w-full bg-[#121212] text-white p-2 rounded-sm"
                >
                  <option value="">Select Playlist</option>
                  {playlists?.map((playlist) => (
                    <option key={playlist._id} value={playlist._id}>
                      {playlist.name}
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

export default Card;
