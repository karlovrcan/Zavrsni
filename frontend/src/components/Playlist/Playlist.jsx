import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { BsCheckCircleFill } from "react-icons/bs";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { useAudio } from "../../states/AudioProvider";
import fallbackImage from "../../assets/playlistCover.png";

const Playlist = () => {
  const { token } = useSelector((state) => state.account);
  const { id } = useParams();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [bgColor, setBgColor] = useState("#000000");
  const [isSaved, setIsSaved] = useState(true);

  const {
    playPauseSong,
    loadQueue,
    setSongIndex,
    currentSong,
    isPlaying,
    togglePlayPause,
    currentPlaylistId,
    setCurrentPlaylistId,
  } = useAudio();

  const scrollRef = useRef(null);

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/playlists/${id}`);
      const data = await response.json();

      if (
        !data.success ||
        !data.playlist ||
        !Array.isArray(data.playlist.songs)
      ) {
        console.error("Invalid API response:", data);
        return;
      }

      setPlaylist(data.playlist);
      setSongs(data.playlist.songs);
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  useEffect(() => {
    if (playlist?.songs?.length > 0) {
      const firstImg = playlist.songs[0].albumCover;
      if (firstImg) {
        import("node-vibrant/browser")
          .then(({ Vibrant }) => {
            if (!Vibrant?.from) throw new Error("Vibrant.from is missing");
            return Vibrant.from(firstImg).getPalette();
          })
          .then((palette) => {
            const chosenColor =
              palette?.Vibrant?.hex ||
              palette?.DarkVibrant?.hex ||
              palette?.Muted?.hex ||
              "#282828"; // fallback
            setBgColor(chosenColor);
          })
          .catch((err) => console.error("Error extracting palette:", err));
      }
    }
  }, [playlist]);

  useEffect(() => {
    window.refreshActivePlaylist = fetchPlaylist;
    return () => {
      window.refreshActivePlaylist = null;
    };
  }, [id]);

  const deleteCustomPlaylist = async () => {
    if (!playlist?._id) return;
    try {
      const res = await fetch(
        `http://localhost:5001/api/playlists/${playlist._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        setIsSaved(false);
        window.addPlaylistToSidebar?.();
      }
    } catch (err) {
      console.error("Failed to delete custom playlist:", err);
    }
  };

  if (!playlist) {
    return (
      <Layout>
        <p className="text-white">Loading...</p>
      </Layout>
    );
  }

  const playlistImage = playlist.songs.length
    ? playlist.songs[0].albumCover
    : fallbackImage;

  const isCurrentPlaylistPlaying =
    currentPlaylistId === playlist._id &&
    songs.some((s) => s.uri === currentSong?.uri) &&
    isPlaying;

  return (
    <Layout>
      <div
        ref={scrollRef}
        style={{
          background: `linear-gradient(135deg, ${bgColor} 0%, #000000 100%)`,
        }}
        className="secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar"
      >
        <div className="flex p-4">
          <div className="w-1/4">
            <img
              src={playlistImage || fallbackImage}
              alt="Playlist Cover"
              className="w-[230px] h-[230px] rounded-lg object-cover drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]"
            />
          </div>
          <div className="w-3/4 flex flex-col justify-end pl-6 overflow-hidden">
            <h1
              className="text-white font-extrabold w-full break-words text-[clamp(3rem,5vw,1.5rem)] leading-tight"
              title={playlist?.name}
            >
              {playlist?.name}
            </h1>
            <p className="text-gray-300 text-sm mt-2 font-sm">
              Playlist by{" "}
              <span className="text-white font-bold">
                {playlist.userId?.username || "Unknown"}
              </span>
            </p>
          </div>
        </div>

        <div className="w-full bg-black/50 pb-[110px]">
          <div className="flex items-center pt-6 pl-6 gap-4 mb-6 mt-6">
            <button
              className="bg-[#1db954] text-white font-bold p-2 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
              onClick={() => {
                if (currentPlaylistId === playlist._id) {
                  togglePlayPause();
                  return;
                }

                loadQueue(songs, playlist._id);
                setCurrentPlaylistId(playlist._id);
                setSongIndex(0);
                if (songs[0]) {
                  playPauseSong(songs[0]);
                }
              }}
            >
              {isCurrentPlaylistPlaying ? (
                <IoIosPause className="text-4xl text-black" />
              ) : (
                <IoIosPlay className="text-4xl text-black pl-1" />
              )}
            </button>

            <button
              onClick={isSaved ? deleteCustomPlaylist : undefined}
              className={`text-3xl font-bold p-1 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] ${
                isSaved ? "text-[#1db954]" : "text-white"
              }`}
            >
              {isSaved ? <BsCheckCircleFill /> : <CiCirclePlus />}
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-2 text-gray-300 text-sm">
            <p className="font-semibold w-1/3 text-center pr-[90px]">
              Title / Author
            </p>
            <p className="font-semibold w-1/3 text-center pl-[60px]">Album</p>
            <div className="w-1/3 flex justify-end pr-6">
              <IoTimeOutline className="text-xl" />
            </div>
          </div>
          <div className="w-full h-[2px] bg-white/10"></div>

          <div className="flex flex-col px-4 pt-2">
            {songs.length > 0 ? (
              songs.map((song, index) => (
                <MiniCard
                  key={song.uri || index}
                  song={song}
                  onClick={() => {
                    loadQueue(songs, playlist._id);
                    setSongIndex(index);
                    playPauseSong(song);
                  }}
                />
              ))
            ) : (
              <div className="flex justify-center items-center h-full w-full mt-9">
                <p className="text-3xl text-gray-400 text-center">
                  Add songs to start listening.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Playlist;
