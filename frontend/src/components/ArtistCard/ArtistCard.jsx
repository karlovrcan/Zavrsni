import React from "react";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../../states/AudioProvider";

const truncateText = (text, length) => {
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const ArtistCard = ({ song, onPlayRequest, onClickCard }) => {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    playPauseSong,
    togglePlayPause,
    currentPlaylistId,
  } = useAudio();

  const isActive = currentPlaylistId === song.id && isPlaying;

  const handlePlayPauseClick = (e) => {
    e.stopPropagation();
    if (onPlayRequest) {
      onPlayRequest(song);
    } else {
      togglePlayPause();
    }
  };

  return (
    <div
      className="group w-full rounded-lg cursor-pointer transition duration-200 hover:bg-black/40 pb-3"
      onClick={() => {
        if (typeof onClickCard === "function") {
          onClickCard();
        } else {
          navigate(`/artist/${song.id}`);
        }
      }}
    >
      <div className="relative w-full pt-[100%] ">
        <img
          src={
            song.albumCover ||
            "https://i.scdn.co/image/ab6761610000e5eb4111f3d7206e8c3f97a5c4aa"
          }
          alt={song.name}
          className="absolute inset-0 w-full h-full px-3 py-3 object-cover rounded-full drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]"
        />
        <button
          onClick={handlePlayPauseClick}
          className="absolute bottom-2 right-2 w-12 h-12 bg-[#1db954] rounded-full flex items-center justify-center opacity-0 singu group-hover:opacity-100 hover:scale-110 transition-all duration-200"
        >
          {isActive ? (
            <IoIosPause className="text-black text-3xl" />
          ) : (
            <IoIosPlay className="text-black text-4xl pl-1" />
          )}
        </button>
      </div>
      <div className="mt-2 text-start ml-3">
        <h3 className="text-white font-semibold text-sm truncate">
          {truncateText(song.name, 35)}
        </h3>
        <p className="text-sm text-gray-400 mt-1">Artist</p>
      </div>
    </div>
  );
};

export default ArtistCard;
