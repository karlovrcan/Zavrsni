import React from "react";
import { Link } from "react-router-dom";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { useAudio } from "../../states/AudioProvider";

const VisualCard = ({
  title,
  description,
  image,
  link,
  id,
  tracks = [],
  type = "album",
}) => {
  const {
    currentPlaylistId,
    isPlaying,
    playPauseSong,
    setCurrentPlaylistId,
    togglePlayPause,
    loadQueue,
    setSongIndex,
    currentSong,
  } = useAudio();

  const isCurrent =
    currentPlaylistId === id &&
    tracks.some((track) => track.uri === currentSong?.uri);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tracks.length) return;

    if (currentPlaylistId === id) {
      togglePlayPause();
      return;
    }

    loadQueue(tracks, id, type);
    setCurrentPlaylistId(id);
    setSongIndex(0);
    playPauseSong(tracks[0]);
  };

  return (
    <div
      className={`relative group rounded-lg p-3 transition duration-200 ${
        isCurrent ? "bg-[#242424]" : "hover:bg-[#242424]"
      }`}
    >
      <Link to={link}>
        <div className="w-full aspect-square relative overflow-hidden rounded-lg mb-3">
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full rounded-lg"
          />
        </div>
        <h3 className="text-white font-semibold text-sm mb-1 truncate">
          {title}
        </h3>
        <p className="text-gray-400 text-xs truncate">{description}</p>
      </Link>

      {tracks.length > 0 && (
        <button
          onClick={handleClick}
          className={`absolute bottom-16 right-5 bg-[#1db954] text-black p-3 rounded-full hover:scale-110 transition-all duration-200 z-10 ${
            isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {isCurrent && isPlaying ? (
            <IoIosPause className="text-2xl" />
          ) : (
            <IoIosPlay className="text-2xl pl-[1px]" />
          )}
        </button>
      )}
    </div>
  );
};

export default VisualCard;
