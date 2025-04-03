import React from "react";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { useAudio } from "../../states/AudioProvider";
import { Link } from "react-router-dom";

const SingularCard = ({ song, handlePlay }) => {
  const { currentSong, isPlaying, togglePlayPause } = useAudio();

  const isCurrent = currentSong?.uri === song.uri;
  const isActive = isCurrent && isPlaying;

  const handleClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      handlePlay();
    }
  };

  return (
    <div className="flex flex-col justify-between bg-[#1f1f1f] hover:bg-[#3a3a3a] transition p-4 rounded-xl w-full h-full">
      <div className="w-full flex justify-start mt-2 ml-2">
        <img
          src={
            song.albumCover ||
            "https://i.scdn.co/image/ab67616d00001e0282c6b3c53a3aa1bfa42f24b7"
          }
          alt={song.name}
          className="w-24 h-24 object-cover shadow-lg rounded-md mb-2"
        />
      </div>

      <div className="flex justify-between items-end mt-auto pb-2 mx-2">
        <div className="flex flex-col max-w-[70%]">
          <p className="text-white text-3xl font-bold leading-tight">
            {song.name}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Song •{" "}
            {song.artists.map((artist, index) => (
              <Link
                to={`/artist/${artist.id}`}
                key={artist.id}
                className="text-white font-medium hover:underline"
              >
                {artist.name}
                {index < song.artists.length - 1 && ", "}
              </Link>
            ))}
          </p>
        </div>

        <button
          onClick={handleClick}
          className="bg-green-500 hover:bg-green-600 rounded-full p-3 transition hover:scale-110"
        >
          {isActive ? (
            <IoIosPause className="text-black text-2xl" />
          ) : (
            <IoIosPlay className="text-black text-2xl" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SingularCard;
