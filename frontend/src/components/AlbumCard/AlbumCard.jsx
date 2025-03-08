import React from "react";
import { useNavigate } from "react-router-dom";

const AlbumCard = ({ album }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/album/${album.id}`); // ✅ Navigate to album page
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[#121212] p-3 rounded-[50%] flex flex-col items-center cursor-pointer hover:bg[#1db954] transition"
    >
      <img
        src={album.images[0]?.url}
        alt="Album Cover"
        className="h-28 w-28 rounded-md object-cover"
      />
      <p className="text-sm font-medium mt-2">{album.name}</p>
      <p className="text-xs text-gray-400">
        {album.artists.map((artist) => artist.name).join(", ")}
      </p>
    </div>
  );
};

export default AlbumCard;
