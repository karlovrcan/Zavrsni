import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { IoTimeOutline } from "react-icons/io5";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FiEdit3 } from "react-icons/fi";
import { SlOptions } from "react-icons/sl";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import fallbackImage from "../../assets/playlistCover.png";
import { useAudio } from "../../states/AudioProvider";

const Playlist = () => {
  const { token } = useSelector((state) => state.account);
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [bgColor, setBgColor] = useState("#000000");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

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
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    fetchPlaylist();
  }, [id]);

  useEffect(() => {
    if (playlist?.songs?.length > 0) {
      const firstImg = playlist.songs[0].albumCover;
      if (firstImg) {
        import("node-vibrant/browser")
          .then(({ Vibrant }) => Vibrant.from(firstImg).getPalette())
          .then((palette) => {
            const chosenColor =
              palette?.Vibrant?.hex ||
              palette?.DarkVibrant?.hex ||
              palette?.Muted?.hex ||
              "#282828";
            setBgColor(chosenColor);
          })
          .catch((err) => console.error("Error extracting palette:", err));
      }
    }
  }, [playlist]);

  const playlistImage = playlist?.songs?.[0]?.albumCover || fallbackImage;

  const isCurrentPlaylistPlaying =
    currentPlaylistId === playlist?._id &&
    songs.some((s) => s.uri === currentSong?.uri) &&
    isPlaying;

  const handleRenamePlaylist = () => {
    setMenuOpen(false);
    setNewPlaylistName(playlist?.name || "");
    setShowRenameModal(true);
  };

  const handleDeletePlaylist = () => {
    setMenuOpen(false);
    setShowDeleteModal(true);
  };

  if (!playlist) {
    return (
      <Layout>
        <p className="text-white">Loading...</p>
      </Layout>
    );
  }

  const totalSongs = songs.length;
  const totalDurationMs = songs.reduce(
    (acc, song) => acc + song.duration_ms,
    0
  );
  const minutes = Math.floor(totalDurationMs / 60000);
  const seconds = Math.floor((totalDurationMs % 60000) / 1000);
  const formattedDuration = `${minutes} min ${seconds
    .toString()
    .padStart(2, "0")} sec`;
  const createdDate = new Date(playlist.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
              src={playlistImage}
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
            <p className="text-sm text-gray-200 mt-2 whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="text-white font-semibold">
                {playlist.userId?.username || "Unknown"}
              </span>
              {" • "}
              {createdDate}
              {" • "}
              {totalSongs} songs, {formattedDuration}
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
                if (songs[0]) playPauseSong(songs[0]);
              }}
            >
              {isCurrentPlaylistPlaying ? (
                <IoIosPause className="text-4xl text-black" />
              ) : (
                <IoIosPlay className="text-4xl text-black pl-1" />
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:text-gray-300"
            >
              <SlOptions className="text-2xl" />
            </button>

            {menuOpen && (
              <div className="absolute left-[130px] w-auto bg-[#1a1a1a] border border-white/10 rounded shadow z-50">
                <button
                  onClick={handleRenamePlaylist}
                  className="flex items-center justify-start gap-3 w-full px-4 py-2 text-sm font-medium text-white-400 hover:text-white hover:bg-gray-500/10 transition duration-200 "
                >
                  <FiEdit3 className="text-xl" />
                  Rename
                </button>
                <button
                  onClick={handleDeletePlaylist}
                  className="flex items-center justify-start gap-3 w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/10 transition duration-200  border-t border-white/10"
                >
                  <MdOutlineDeleteOutline className="text-lg" />
                  Delete Playlist
                </button>
              </div>
            )}
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
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[440px] h-[240px] bg-[#242424] rounded-lg shadow-lg p-9">
            <h2 className="text-white text-2xl font-semibold mb-4">
              Rename Playlist
            </h2>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name"
              className="w-full p-2 mb-4 text-white bg-[#121212] border border-gray-700 rounded-sm focus:outline-none"
            />
            <div className="flex justify-end gap-10 pt-8">
              <button
                className="text-md text-gray-400 hover:text-white font-semibold transition"
                onClick={() => setShowRenameModal(false)}
              >
                Cancel
              </button>
              <button
                className="text-md text-black bg-green-600 hover:bg-green-500 hover:scale-110 transition px-6 py-3 rounded-full font-semibold"
                onClick={() => {
                  fetch(`http://localhost:5001/api/playlists/${playlist._id}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name: newPlaylistName }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.success) {
                        setShowRenameModal(false);
                        return fetch(
                          `http://localhost:5001/api/playlists/${playlist._id}`
                        );
                      }
                    })
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.success) {
                        setPlaylist(data.playlist);
                        setSongs(data.playlist.songs);
                        window.addPlaylistToSidebar?.();
                      }
                    })
                    .catch((err) =>
                      console.error("Failed to rename playlist:", err)
                    );
                }}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[440px] h-[240px] bg-[#242424] rounded-lg shadow-lg p-9 text-center">
            <h2 className="text-white text-2xl font-bold mb-4 text-start">
              Delete from Your Library?
            </h2>
            <p className="text-sm text-gray-300 mb-4 text-start">
              Are you sure you want to delete this playlist?
            </p>
            <div className="flex justify-end gap-10 pt-10">
              <button
                className="text-md text-gray-400 hover:text-white transition"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="text-md text-black bg-red-600 hover:bg-red-500 hover:scale-110 transition px-6 py-3 rounded-full font-semibold"
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `http://localhost:5001/api/playlists/${playlist._id}`,
                      {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    const data = await res.json();
                    if (data.success) {
                      window.addPlaylistToSidebar?.();
                      navigate("/");
                    }
                  } catch (err) {
                    console.error("Failed to delete playlist:", err);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Playlist;
