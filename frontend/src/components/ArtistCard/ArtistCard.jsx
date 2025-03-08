import React from "react";
import { useNavigate } from "react-router-dom";

const ArtistCard = ({ artist }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/artist/${artist.id}`); // ✅ Navigate to artist page
  };

  return (
    <div
      onClick={handleClick}
      className="bg-black flex flex-col items-center cursor-pointer rounded-[100%]"
    >
      <img
        src={artist.images[0]?.url}
        alt="Artist"
        className="h-24 w-24 rounded-full object-cover"
      />
      <p className="text-sm font-medium mt-2">{artist.name}</p>
    </div>
  );
};

export default ArtistCard;
