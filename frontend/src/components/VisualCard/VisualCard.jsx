// VisualCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const VisualCard = ({ title, description, image, link }) => {
  return (
    <Link
      to={link}
      className=" hover:bg-[#242424] rounded-lg p-3 transition duration-200 group"
    >
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
  );
};

export default VisualCard;
