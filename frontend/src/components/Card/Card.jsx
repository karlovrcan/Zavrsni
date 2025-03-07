import React from "react";
import { IoPlayCircleSharp } from "react-icons/io5";

const Card = ({ song, handlePlay }) => {
  return (
    <div className="card-container flex items-center p-2 bg-gray-800 rounded-md">
      <img
        src={song.albumCover}
        alt={song.name}
        className="h-14 w-14 rounded-md"
      />
      <div className="ml-3 flex flex-col">
        <p className="text-white text-sm">{song.name}</p>
        <p className="text-gray-400 text-xs">
          {song.artists.map((a) => a.name).join(", ")}
        </p>
      </div>
      <button onClick={() => handlePlay(song.uri)} className="ml-auto">
        <IoPlayCircleSharp className="text-white text-2xl hover:text-green-500 transition" />
      </button>
    </div>
  );
};

export default Card;
