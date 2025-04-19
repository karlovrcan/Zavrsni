import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaPlus } from "react-icons/fa";
import { BiLibrary } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { user, token, isAuthenticated } = useSelector(
    (state) => state.account
  );
  const [playlists, setPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [artists, setArtists] = useState([]);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [libraryFilter, setLibraryFilter] = useState("all");
  const isGuest = !isAuthenticated || user?.role === "guest";
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      fetchPlaylists();
      fetchAlbums();
      fetchSpotifyPlaylists();
      fetchArtists();
    }
  }, [user, token]);

  useEffect(() => {
    window.addAlbumToSidebar = fetchAlbums;
    window.addSpotifyToSidebar = fetchSpotifyPlaylists;
    window.addPlaylistToSidebar = fetchPlaylists;
    window.addFollowedArtistToSidebar = fetchArtists;
    return () => {
      window.addAlbumToSidebar = null;
      window.addSpotifyToSidebar = null;
      window.addPlaylistToSidebar = null;
      window.addFollowedArtistToSidebar = null;
    };
  }, []);

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) return;
    try {
      const response = await fetch("http://localhost:5001/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: playlistName }),
      });
      const data = await response.json();
      if (data.success) {
        const patchedPlaylist = {
          ...data.playlist,
          userId: { _id: user._id, username: user.username },
        };
        setPlaylists([...playlists, patchedPlaylist]);
        setPlaylistName("");
        setShowInput(false);
        setShowCreateDropdown(false);
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  const fetchArtists = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/followed-artists",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        setArtists(data.artists);
      }
    } catch (error) {
      console.error("Error fetching followed artists:", error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/albums", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        setAlbums(data.albums);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  const fetchSpotifyPlaylists = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/spotify-playlist",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        setSpotifyPlaylists(data.playlists);
      }
    } catch (error) {
      console.error("Error fetching Spotify playlists:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-155px)] w-full flex flex-col ml-[5px]">
      <div className="flex-grow h-full overflow-hidden">
        <div className="secondary_bg rounded-lg px-2 py-2 h-full flex flex-col">
          <div className="flex px-4 justify-between mb-4 items-center gap-4 relative">
            <div className="flex gap-2 items-center">
              <BiLibrary className="font-bold text-2xl" />
              <span className="text-xl font-semibold">Your Library</span>
            </div>
            {user && (
              <button
                className="bg-[#121212] text-white text-base px-2 py-2 rounded-full font-semibold hover:bg-[#242424] transition-colors duration-200 flex items-center space-x-2"
                onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              >
                {showCreateDropdown ? (
                  <FaPlus className="rotate-[45deg] transform transition-transform duration-300 ease-in-out" />
                ) : (
                  <div className="transform transition-transform duration-300 ease-in-out">
                    <FaPlus />
                  </div>
                )}
              </button>
            )}
          </div>

          {showCreateDropdown && (
            <div className="absolute top-[65px] right-3 w-48 bg-[#242424] shadow-lg rounded-md p-2 z-50">
              <ul className="text-gray-200">
                <li
                  className="flex p-2 hover:bg-[#121212] rounded-md cursor-pointer"
                  onClick={() => setShowInput(true)}
                >
                  <span>Playlist</span>
                </li>
              </ul>
            </div>
          )}

          {showInput && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="w-[440px] h-[240px] bg-[#242424] rounded-lg shadow-lg p-8">
                <h2 className="text-white text-2xl font-semibold mb-6">
                  Create Playlist
                </h2>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="Playlist Name"
                  className=" w-full p-3 mb-6 text-white bg-[#121212] border border-gray-700 rounded-sm focus:outline-none"
                />
                <div className="flex justify-end gap-6 py-3">
                  <button
                    className="text-md font-semibold text-gray-400 hover:text-white transition"
                    onClick={() => {
                      setShowInput(false);
                      setPlaylistName("");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="text-md font-semibold text-black bg-green-500 hover:bg-green-400 hover:scale-110 transition px-3 py-2 rounded-full font-semibold"
                    onClick={handleCreatePlaylist}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
          {!isGuest && (
            <div className="flex gap-2 px-2 mb-3">
              {["all", "playlists", "albums", "artists"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLibraryFilter(filter)}
                  className={`px-3 py-1 text-sm rounded-full font-medium transition-colors duration-200 ${
                    libraryFilter === filter
                      ? "bg-white text-black"
                      : "bg-[#2a2a2a] text-white"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          )}

          <div className="your_library flex flex-col overflow-y-auto pr-2 h-full">
            {isGuest ? (
              <div className="tertiary_bg rounded-lg px-4 py-6">
                <p className="font-bold">Create your first playlist.</p>
                <p className="font-semibold">It's easy, we'll help you.</p>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-full text-black font-semibold mt-4 px-4 py-1 bg-white transform transition hover:scale-105"
                >
                  Log in to create playlist
                </button>
              </div>
            ) : (
              <>
                {["all", "playlists"].includes(libraryFilter) &&
                  spotifyPlaylists.length > 0 && (
                    <>
                      {spotifyPlaylists.map((pl) => (
                        <div
                          key={pl._id}
                          className="flex items-center gap-4 secondary_bg hover:bg-[#242424] transition-colors duration-200 rounded-lg p-2 cursor-pointer relative"
                          onClick={() =>
                            navigate(`/spotify-playlist/${pl.spotifyId}`)
                          }
                        >
                          <img
                            src={pl.image}
                            alt="Playlist Cover"
                            className="w-12 h-12 rounded-md object-cover"
                          />
                          <div className="flex-grow overflow-hidden">
                            <div className="text-white text-sm font-medium truncate">
                              {pl.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              Playlist • {pl.owner?.name || "Unknown"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                {["all", "playlists"].includes(libraryFilter) &&
                  playlists.length > 0 && (
                    <>
                      {playlists.map((playlist) => {
                        const playlistImage = playlist?.songs?.length
                          ? playlist.songs[0].albumCover
                          : "../src/assets/playlistCover.png";

                        return (
                          <div
                            key={playlist._id}
                            className="flex items-center gap-4 secondary_bg hover:bg-[#242424] transition-colors duration-200 rounded-lg p-2 cursor-pointer relative"
                            onClick={() =>
                              navigate(`/playlist/${playlist._id}`)
                            }
                          >
                            <img
                              src={playlistImage}
                              alt="Playlist Cover"
                              className="w-12 h-12 rounded-md object-cover"
                            />
                            <div className="flex-grow overflow-hidden">
                              <div className="text-white text-sm font-normal leading-tight">
                                <div className="truncate font-medium">
                                  {playlist.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Playlist •{" "}
                                  {playlist.userId?.username || "Unknown"}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                {["all", "albums"].includes(libraryFilter) &&
                  albums.length > 0 && (
                    <>
                      {albums.map((album) => (
                        <div
                          key={album._id}
                          className="flex items-center gap-4 secondary_bg hover:bg-[#242424] transition-colors duration-200 rounded-lg p-2 cursor-pointer relative"
                          onClick={() => navigate(`/album/${album.spotifyId}`)}
                        >
                          <img
                            src={album.image}
                            alt="Album Cover"
                            className="w-12 h-12 rounded-md object-cover"
                          />
                          <div className="flex-grow overflow-hidden">
                            <div className="text-white text-sm font-normal leading-tight">
                              <div className="truncate font-medium">
                                {album.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                Album •{" "}
                                {album.artists?.[0]?.name || "Unknown Artist"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                {["all", "artists"].includes(libraryFilter) &&
                  artists.length > 0 && (
                    <>
                      {artists.map((artist) => (
                        <div
                          key={artist.id}
                          className="flex items-center gap-4 secondary_bg hover:bg-[#242424] transition-colors duration-200 rounded-lg p-2 cursor-pointer"
                          onClick={() => navigate(`/artist/${artist.id}`)}
                        >
                          <img
                            src={artist.image || "/default_artist.png"}
                            alt="Artist"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-grow overflow-hidden">
                            <div className="text-white text-sm font-medium truncate">
                              {artist.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              Artist
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
