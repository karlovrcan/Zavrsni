import React, { useEffect } from "react";
import "./Card.css";
import { IoIosPlay, IoIosPause, IoMdAddCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { playSong, pauseSong } from "../../states/Actors/SongActors";

const Card = ({ song }) => {
  if (!song) {
    console.error("Card component received an undefined song prop.");
    return null;
  }

  const { masterSong, isPlaying } = useSelector((state) => state.mainSong) || {
    masterSong: { id: null, mp3: null },
    isPlaying: false,
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (isPlaying && masterSong?.mp3 && masterSong.id !== song.id) {
      masterSong.mp3.pause();
      masterSong.mp3.currentTime = 0;
    }
  }, [masterSong, isPlaying]);

  const handlePlay = () => {
    if (masterSong?.mp3) {
      masterSong.mp3.pause();
      masterSong.mp3.currentTime = 0;
    }

    dispatch(playSong(song));
    song.mp3.currentTime = 0;
    song.mp3.play();
  };

  const handlePause = () => {
    dispatch(pauseSong());
    song.mp3.pause();
    song.mp3.currentTime = 0;
  };

  return (
    <div className="card col-span-1 secondary_bg p-3 rounded-lg  hover:shadow-lg">
      <div className="relative">
        <img
          src="https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
          alt="Album Cover"
          className="rounded-lg"
        />
        {masterSong?.id === song.id && isPlaying ? (
          <button onClick={handlePause} className="play_btn">
            <IoIosPause className="text-black text-2xl justify-center" />
          </button>
        ) : (
          <button onClick={handlePlay} className="play_btn">
            <IoIosPlay className="text-black text-2xl justify-center ml-0.5" />
          </button>
        )}
      </div>
      <p className="text-base font-normal mt-2 mb-2">{song.title}</p>
      <h3 className="text-sm text-gray-400 font-normal ">{song.artist}</h3>
    </div>
  );
};

export default Card;
