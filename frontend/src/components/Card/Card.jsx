import React from "react";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { useAudio } from "../../states/AudioProvider";
import "./Card.css";

const truncateText = (text, length) => {
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const Card = ({ song, type }) => {
  if (!song) {
    console.error("Card component received an undefined song prop.");
    return null;
  }

  const { currentSong, isPlaying, playPauseSong } = useAudio();

  return (
    <div className="card col-span-1 p-3 rounded-lg hover:bg-[#1db954] relative mb-2">
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
          onClick={() => playPauseSong(song)}
          className={`play_btn ${
            currentSong?.uri === song.uri && isPlaying ? "active" : ""
          }`}
        >
          {currentSong?.uri === song.uri && isPlaying ? (
            <IoIosPause className="text-white text-3xl" />
          ) : (
            <IoIosPlay className="text-white text-3xl" />
          )}
        </button>
      </div>

      {/* Song title and artist */}
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
      </div>
    </div>
  );
};

export default Card;
