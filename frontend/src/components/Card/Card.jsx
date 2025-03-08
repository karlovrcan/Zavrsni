import React from "react";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { playSong } from "../../states/Actors/SongActors";
import { useGlobalContext } from "../../states/Content";
import "./Card.css";

const Card = ({ song, type }) => {
  if (!song) {
    console.error("Card component received an undefined song prop.");
    return null;
  }

  const { masterSong, isPlaying } = useSelector((state) => state.mainSong);
  const dispatch = useDispatch();
  const { setSongIdx } = useGlobalContext();

  const handlePlay = (song) => {
    if (!song || !song.uri) {
      console.error("🚨 Invalid song:", song);
      return;
    }

    setSongIdx(song.id);
    dispatch(playSong(song.uri));
  };

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
          }`} // ✅ Rounded for artists, squared for others
        />

        <button
          onClick={() => handlePlay(song)}
          className={`play_btn ${
            masterSong?.uri === song.uri && isPlaying ? "active" : ""
          }`}
        >
          {masterSong?.uri === song.uri && isPlaying ? (
            <IoIosPause className="text-white text-3xl" />
          ) : (
            <IoIosPlay className="text-white text-3xl" />
          )}
        </button>
      </div>

      {/* Song title and artist */}
      <div className="mt-2 text-center">
        <h3 className="text-white font-semibold text-base mb-2">{song.name}</h3>
        <p className="text-white text-sm">
          {song.artists.map((artist) => artist.name).join(", ")}
        </p>
      </div>
    </div>
  );
};

export default Card;
