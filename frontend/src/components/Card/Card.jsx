import React from "react";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { playSong } from "../../states/Actors/SongActors"; // Import actions
import { useGlobalContext } from "../../states/Content"; // Assuming useGlobalContext

const Card = ({ song }) => {
  if (!song) {
    console.error("Card component received an undefined song prop.");
    return null;
  }

  const { masterSong, isPlaying } = useSelector((state) => state.mainSong); // Access current song state
  const dispatch = useDispatch();
  const { setSongIdx } = useGlobalContext(); // Get function from context to set song index

  // Handle play button functionality
  const handlePlay = (song) => {
    console.log("🎵 handlePlay triggered, received song:", song);

    if (!song || !song.uri) {
      console.error("🚨 handlePlay was triggered with an invalid song:", song);
      return;
    }

    const selectedUri = song.uri; // We need to use the URI for playback, not song.id
    console.log(`🎵 Playing song with URI: ${selectedUri}`);

    // Set the song index and dispatch play action
    setSongIdx(song.id); // Store the song index
    dispatch(playSong(selectedUri)); // Dispatch the play song action with the song URI
  };

  return (
    <div className="card col-span-1 p-3 rounded-lg hover:shadow-lg">
      <div className="relative">
        <img
          src={
            song.albumCover ||
            "https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
          }
          alt="Album Cover"
          className="w-full h-full object-cover rounded-lg"
        />

        {/* Play/Pause button logic */}
        {masterSong?.uri === song.uri && isPlaying ? (
          <button
            onClick={() => handlePlay(song)}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-3"
          >
            <IoIosPause className="text-white text-3xl" />
          </button>
        ) : (
          <button
            onClick={() => handlePlay(song)}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-3"
          >
            <IoIosPlay className="text-white text-3xl" />
          </button>
        )}
      </div>

      {/* Song title and artist */}
      <div className="mt-2 text-center">
        <h3 className="text-white font-semibold text-sm">
          {song.artists.map((artist) => artist.name).join(", ")}{" "}
          {/* Display artists */}
        </h3>
        <p className="text-gray-400 text-xs">{song.name}</p>{" "}
        {/* Display song title */}
      </div>
    </div>
  );
};

export default Card;
