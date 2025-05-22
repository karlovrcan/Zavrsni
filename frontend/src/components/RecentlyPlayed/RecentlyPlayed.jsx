import React, { useEffect, useState } from "react";
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
    loadQueue,
    setSongIndex,
    playPauseSong,
    fetchRecentlyPlayed,
    currentPlaylistId,
    togglePlayPause,
    setCurrentPlaylistId,
  } = useAudio();

  const [staticList, setStaticList] = useState([]);

  useEffect(() => {
    fetchRecentlyPlayed().then(() => {
      setStaticList([...recentlyPlayed]);
    });

    window.refreshRecentlyPlayed = async () => {
      await fetchRecentlyPlayed();
      setStaticList([...recentlyPlayed]);
    };

    return () => {
      window.refreshRecentlyPlayed = null;
    };
  }, []);

  const PLAYLIST_ID = "recently-played";

  const isPlaylistPlaying =
    staticList.some((track) => track.uri === currentSong?.uri) &&
    isPlaying &&
    currentPlaylistId === PLAYLIST_ID;

  const handlePlayPauseClick = () => {
    if (!staticList.length) return;

    const isCurrent = currentPlaylistId === PLAYLIST_ID;

    if (isCurrent) {
      togglePlayPause();
      return;
    }

    setCurrentPlaylistId(PLAYLIST_ID);
    loadQueue(staticList, PLAYLIST_ID);
    setTimeout(() => {
      setSongIndex(0);
      playPauseSong(staticList[0]);
    }, 0);
  };

  return (
    <Layout>
      <div className="secondary_bg h-[calc(100vh-155px)] overflow-y-auto custom-scrollbar rounded-lg">
        <div className="flex flex-col gap-4 px-6 pt-6 pb-[100px]">
          <div className="flex items-center justify-between pr-3">
            <h1 className="text-white text-4xl font-bold">Recently Played</h1>
            <button
              className="bg-[#1db954] text-black font-bold p-2 transition hover:scale-110 rounded-full flex items-center"
              onClick={handlePlayPauseClick}
            >
              {isPlaylistPlaying ? (
                <IoIosPause className="text-4xl text-black" />
              ) : (
                <IoIosPlay className="text-4xl text-black pl-1" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-gray-300 text-sm mt-4 px-1">
            <p className="font-semibold w-1/3 text-center pr-[100px]">
              Title / Author
            </p>
            <p className="font-semibold w-1/3 text-center pl-[65px]">Album</p>
            <div className="w-1/3 flex justify-end pr-6">
              <IoTimeOutline className="text-xl" />
            </div>
          </div>

          <div className="w-full h-[2px] bg-white/10"></div>

          <div className="flex flex-col">
            {staticList.map((track, index) => (
              <MiniCard
                key={`${track.uri}-${index}`}
                song={track}
                onClick={() => {
                  loadQueue(staticList, "recently-played");
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
