import React from "react";
import "./Card.css";
import { IoIosPlay } from "react-icons/io";

const Card = () => {
  return (
    <div className="card col-span-1 secondary_bg p-3 rounded-lg shadow-md hover:shadow-lg">
      <div className="relative">
        <img
          src="https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
          alt="Album Cover"
          className="rounded-lg"
        />
        <button className="play_btn">
          <IoIosPlay className="text-black text-3xl" />
        </button>
      </div>
      <h3 className="text-base font-bold mt-2 mb-2">Umami</h3>
      <p className="text-xs text-gray-400 font-semibold">
        Lorem ipsum test one two three
      </p>
    </div>
  );
};

export default Card;
