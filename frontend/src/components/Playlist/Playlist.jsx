import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { IoIosPlay } from "react-icons/io";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { useAudio } from "../../states/AudioProvider";

const Playlist = () => {
  const { id } = useParams(); // Get playlist ID from the URL
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const { playPauseSong } = useAudio();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/playlists/${id}`
        );
        const data = await response.json();

        console.log("Fetched playlist data:", data); // ✅ Log to check song data

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

    fetchPlaylist();
  }, [id]);

  if (!playlist) return <p className="text-white">Loading...</p>;

  return (
    <Layout>
      <div className="secondary_bg h-[calc(100vh-155px)] px-4 py-4 rounded-lg mr-3">
        <div className="text-3xl font-bold text-white mb-4">
          {playlist.name}
        </div>

        {/* Play and Save Buttons */}
        <div className="flex items-center gap-4 mb-6">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            onClick={() => playPauseSong(songs[0])}
          >
            <IoIosPlay className="text-2xl mr-1" />
            Play
          </button>

          <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <CiCirclePlus className="text-2xl mr-1" />
            Save
          </button>
        </div>

        {/* List of Songs */}
        <div className="space-y-3">
          {songs.length > 0 ? (
            songs.map((song, index) => {
              console.log(`Rendering song ${index}:`, song); // ✅ Debugging log
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
