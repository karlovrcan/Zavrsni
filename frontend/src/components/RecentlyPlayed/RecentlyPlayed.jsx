import React from "react";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { useAudio } from "../../states/AudioProvider";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { IoTimeOutline } from "react-icons/io5";

const RecentlyPlayed = () => {
  const {
    recentlyPlayed,
    currentSong,
    isPlaying,
    setSongs: setGlobalSongs,
    setSongIndex,
    playPauseSong,
  } = useAudio();

  const handlePlayPauseClick = () => {
    if (!recentlyPlayed.length) return;

    const firstTrack = recentlyPlayed[0];
    setGlobalSongs(recentlyPlayed);

    if (currentSong?.uri === firstTrack.uri) {
      // Toggle pause
      playPauseSong(currentSong);
    } else {
      setSongIndex(0);
      playPauseSong(firstTrack);
    }
  };

  return (
    <Layout>
      <div className="secondary_bg h-[calc(100vh-155px)] overflow-y-auto custom-scrollbar rounded-lg">
        <div className="flex flex-col gap-4 px-6 pt-6 pb-[100px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-white text-4xl font-bold">Recently Played</h1>
            <button
              className="bg-[#1db954] text-black font-bold p-2 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
              onClick={handlePlayPauseClick}
            >
              {currentSong?.uri === recentlyPlayed[0]?.uri && isPlaying ? (
                <IoIosPause className="text-4xl text-black" />
              ) : (
                <IoIosPlay className="text-5xl text-black pl-1" />
              )}
            </button>
          </div>

          {/* Column labels */}
          <div className="flex items-center justify-between text-gray-300 text-sm mt-4 px-1">
            <p className="font-semibold w-1/3 text-center pr-[100px]">
              Title / Author
            </p>
            <p className="font-semibold w-1/3 text-center pr-2">Album</p>
            <div className="w-1/3 flex justify-end pr-6">
              <IoTimeOutline className="text-xl" />
            </div>
          </div>

          <div className="w-full h-[2px] bg-white/10"></div>

          {/* Song List */}
          <div className="flex flex-col">
            {recentlyPlayed.map((track, index) => (
              <MiniCard
                key={`${track.uri}-${index}`}
                song={track}
                onClick={() => {
                  setGlobalSongs(recentlyPlayed);
                  setSongIndex(index);
                  playPauseSong(track);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecentlyPlayed;
