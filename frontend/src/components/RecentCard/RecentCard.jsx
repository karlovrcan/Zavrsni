import React from "react";
import { Link } from "react-router-dom";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { useAudio } from "../../states/AudioProvider";
import { useSelector } from "react-redux";

const RecentCard = ({ item }) => {
  const {
    currentPlaylistId,
    currentSong,
    isPlaying,
    togglePlayPause,
    setCurrentPlaylistId,
    loadQueue,
    setSongIndex,
    playPauseSong,
  } = useAudio();

  const { token } = useSelector((state) => state.account);

  const playlistOrAlbumId = item.spotifyId || item.playlistId || item.albumId;

  const isCurrent =
    currentPlaylistId === playlistOrAlbumId &&
    item.tracks?.some((track) => track.uri === currentSong?.uri);

  const handleClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const trackList = item.tracks || [];
    if (!trackList.length) return;

    const sourceType = item.spotifyId || item.playlistId ? "playlist" : "album";

    if (
      currentPlaylistId === playlistOrAlbumId &&
      trackList.some((t) => t.uri === currentSong?.uri)
    ) {
      togglePlayPause();
      return;
    }

    loadQueue(trackList, playlistOrAlbumId, sourceType);
    setCurrentPlaylistId(playlistOrAlbumId);
    setSongIndex(0);
    playPauseSong(trackList[0]);

    await fetch("http://localhost:5001/api/recently-played-collections", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: item.spotifyId
          ? "spotify-playlist"
          : item.playlistId
          ? "playlist"
          : "album",
        collectionId: playlistOrAlbumId,
        title: item.title,
        image: item.image,
        tracks: trackList,
      }),
    });
  };

  return (
    <div
      className={`group relative flex items-center gap-2 transition rounded-lg overflow-hidden cursor-pointer hover:scale-105 ${
        isCurrent ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
      }`}
    >
      <img
        src={item.image}
        alt={item.title}
        className="w-12 h-12 rounded-l-lg object-cover"
      />
      <span className="text-white font-medium text-sm truncate w-full pr-1">
        {item.title}
      </span>

      <button
        onClick={handleClick}
        className={`absolute right-2 bg-[#1db954] text-black p-2 rounded-full scale-100 hover:scale-110 transition-all duration-200 ease-in-out z-10 ${
          isCurrent && isPlaying
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {isCurrent && isPlaying ? (
          <IoIosPause className="h-5 w-5" />
        ) : (
          <IoIosPlay className="h-5 w-5 pl-[1px]" />
        )}
      </button>

      <Link to={item.link} className="absolute inset-0 z-0" />
    </div>
  );
};

export default RecentCard;
