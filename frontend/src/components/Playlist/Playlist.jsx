import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { IoIosPause, IoIosPlay } from "react-icons/io";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { useAudio } from "../../states/AudioProvider";

const Playlist = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const { playPauseSong, setSongs: setGlobalSongs, setSongIndex } = useAudio();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/playlists/${id}`
        );
        const data = await response.json();

        console.log("Fetched playlist data:", data);

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
  }, [id]);

  if (!playlist) return <p className="text-white">Loading...</p>;

  const playlistImage = playlist?.songs?.length
    ? playlist.songs[0].albumCover
    : "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg";

  return (
    <Layout>
      <div className=" px-2 secondary_bg rounded-lg h-[calc(100vh-155px)]  overflow-auto custom-scrollbar">
        <div className="flex p-4">
          <div className="w-1/3">
            <img
              src={playlistImage}
              alt="Playlist Cover"
              className=" secondary_bg w-[230px] h-[230px] rounded-md object-cover"
            />
          </div>
          <div className="w-2/3 place-content-end font-extrabold text-7xl">
            {playlist.name}
          </div>
        </div>
        <div className="flex items-center p-4 gap-4 mb-6 mt-6">
          <button
            className="bg-[#1db954] text-white font-bold p-2 transition hover:scale-110  rounded-full flex items-center"
            onClick={() => {
              setSongIndex(0);
              playPauseSong(songs[0]);
            }}
          >
            <IoIosPlay className="text-5xl " />
          </button>

          <button className=" hover:scale-110 transition duration-200 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <CiCirclePlus className="text-4xl mr-1" />
          </button>
        </div>

        <div className="p-4">
          {songs.length > 0 ? (
            songs.map((song, index) => {
              console.log(`Rendering song ${index}:`, song);
              return <MiniCard key={song._id || index} song={song} />;
            })
          ) : (
            <p className="text-gray-400">No songs in this playlist.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Playlist;
