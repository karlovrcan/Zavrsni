import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import { IoIosPlay } from "react-icons/io";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { useAudio } from "../../states/AudioProvider";

const Playlist = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [bgColor, setBgColor] = useState("#000000"); // default background color
  const { playPauseSong, setSongs: setGlobalSongs, setSongIndex } = useAudio();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/playlists/${id}`
        );
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
        setGlobalSongs(data.playlist.songs);
        setSongIndex(0);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    fetchPlaylist();
  }, [id, setGlobalSongs, setSongIndex]);
  useEffect(() => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      const firstImg = playlist.songs[0].albumCover;
      if (firstImg) {
        import("node-vibrant/browser")
          .then((module) => {
            const { Vibrant } = module;
            if (!Vibrant || typeof Vibrant.from !== "function") {
              throw new Error(
                "Vibrant.from is not available in the imported module"
              );
            }
            return Vibrant.from(firstImg).getPalette();
          })
          .then((palette) => {
            if (palette.Vibrant) {
              setBgColor(palette.Vibrant.hex);
            }
          })
          .catch((err) => console.error("Error extracting palette:", err));
      }
    }
  }, [playlist]);

  if (!playlist) return <p className="text-white">Loading...</p>;

  const playlistImage = playlist.songs.length
    ? playlist.songs[0].albumCover
    : "https://www.pinterest.com/pin/741545894906875788/";

  return (
    <Layout>
      <div
        style={{
          background: `linear-gradient(135deg, ${bgColor} 0%, #000000 100%)`,
        }}
        className="px-2 secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar"
      >
        <div className="flex p-4">
          <div className="w-1/4">
            <img
              src={playlistImage}
              alt="Playlist Cover"
              className=" w-[230px] h-[230px] rounded-lg object-cover drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]"
            />
          </div>
          <div className="w-3/4 place-content-end pl-2 font-extrabold text-7xl">
            {playlist.name}
          </div>
        </div>
        <div className="flex items-center p-4 gap-4 mb-6 mt-6">
          <button
            className="bg-[#1db954] text-white font-bold p-2 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
            onClick={() => {
              setSongIndex(0);
              playPauseSong(songs[0]);
            }}
          >
            <IoIosPlay className="text-5xl pl-1" />
          </button>
          <button className="hover:scale-110 transition duration-200 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <CiCirclePlus className="text-4xl mr-1" />
          </button>
        </div>
        <div>
          <div className="flex items-center justify-between px-4 py-2 text-gray-300  text-sm">
            <p className="font-semibold ml-[65px]">Title / Author</p>
            <IoTimeOutline className="text-xl mr-[70px]" />
          </div>
          <div className="w-full h-[2px] bg-white/10"></div>
        </div>
        <div className="flex flex-col gap-1 p-4">
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <MiniCard
                key={song._id || index}
                song={song}
                onClick={() => {
                  setSongIndex(index);
                  playPauseSong(song);
                }}
              />
            ))
          ) : (
            <p className="text-gray-400">No songs in this playlist.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Playlist;
