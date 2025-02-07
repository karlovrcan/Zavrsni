import React from "react";
import "./Card.css";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { playSong } from "../../states/Actors/SongActors";

const Card = ({ song }) => {
  const { masterSong, isPlaying } = useSelector((state) => state.mainSong);
  const dispatch = useDispatch();
  const handlePlay = (song) => {
    dispatch(playSong(song));
  };
  const handlePause = () => {
    dispatch(pauseSong);
  };
  return (
    song && (
      <div className="card col-span-1 secondary_bg p-3 rounded-lg shadow-md hover:shadow-lg">
        <div className="relative">
          <img
            src="https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
            alt="Album Cover"
            className="rounded-lg"
          />
          {masterSong.id === song.id && isPlaying ? (
            <button onClick={handlePause} className="play_btn">
              <IoIosPause className="text-black text-3xl" />
            </button>
          ) : (
            <button onClick={() => handlePlay(song)} className="play_btn">
              <IoIosPlay className="text-black text-3xl" />
            </button>
          )}
        </div>
        <h3 className="text-base font-bold mt-2 mb-2">{song.artist}</h3>
        <p className="text-xs text-gray-400 font-semibold">{song.title}</p>
      </div>
    )
  );
};

export default Card;
