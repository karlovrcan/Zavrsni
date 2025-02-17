import React from "react";
import "./Card.css";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { playSong, pauseSong } from "../../states/Actors/SongActors";
import { useGlobalContext } from "../../states/Content";
import { songs } from "../Home/Home";

const Card = ({ song }) => {
  if (!song) {
    console.error("Card component received an undefined song prop.");
    return null;
  }

  const { masterSong, isPlaying } = useSelector((state) => state.mainSong);
  const dispatch = useDispatch();
  const { resetEverything, setSongIdx } = useGlobalContext();

  const handlePlay = (song) => {
    console.log("🎵 handlePlay triggered, received song:", song);

    if (!song || !song.id) {
      console.error("🚨 handlePlay was triggered with an invalid song:", song);
      return;
    }

    console.log("🎶 Available Songs:", songs); // Check if songs array exists
    console.log(`🎵 Searching for: ${song.title}, ID: ${song.id}`);

    const selectedIndex = songs.findIndex(
      (s) => String(s.id) === String(song.id)
    );
    console.log(`🎵 Index Found: ${selectedIndex}`);

    if (selectedIndex !== -1) {
      setSongIdx(selectedIndex); // ✅ Store the correct index when clicking a song
      dispatch(playSong(song)); // ✅ Play the selected song
    } else {
      console.error("🚨 Song not found in the list!");
    }
  };

  return (
    <div className="card col-span-1 secondary_bg p-3 rounded-lg shadow-md hover:shadow-lg">
      <div className="relative">
        <img
          src="https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
          alt="Album Cover"
          className="rounded-lg"
        />
        {masterSong?.id === song.id && isPlaying ? (
          <button onClick={() => handlePlay(song)} className="play_btn">
            {" "}
            <IoIosPause className="text-black text-2xl" />
          </button>
        ) : (
          <button onClick={() => handlePlay(song)} className="play_btn">
            <IoIosPlay className="text-black text-2xl" />
          </button>
        )}
      </div>
      <h3 className="text-base font-bold mt-2 mb-2">{song.artist}</h3>
      <p className="text-xs text-gray-400 font-semibold">{song.title}</p>
    </div>
  );
};

export default Card;
