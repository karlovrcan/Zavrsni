import React from "react";
import "./Card.css";
import { GrPlayFill } from "react-icons/gr";
const Card = () => {
  return (
    <div className="card col-span-1 secondary_bg p-3 rounded-lg">
      <div className="relative">
        <img
          src="https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
          alt=""
        />
        <button className="flex play_btn items-center justify-center p-3  bg-green-600 rounded-[50%]">
          <GrPlayFill className="text-black text-5xl " />
        </button>
      </div>
      <h3 className="text-base font-bold mt-2 mb-2">Umami</h3>
      <p className="text-xs text-gray-400 font-semibold">
        Lorem ipsum test one two tree
      </p>
    </div>
  );
};

export default Card;
