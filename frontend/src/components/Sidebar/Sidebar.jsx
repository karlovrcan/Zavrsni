import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../states/AuthContext";
import { FaPlus } from "react-icons/fa";
import { BiLibrary } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { SlOptions } from "react-icons/sl";
import Card from "../Card/Card";

const Sidebar = () => {
  const { user, token } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const navigate = useNavigate();

  const startEditingPlaylist = (playlistId, currentName) => {
    setEditingPlaylistId(playlistId);
    setNewPlaylistName(currentName);
  };

  useEffect(() => {
    if (user) fetchPlaylists();
  }, [user]);

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
        setPlaylists([...playlists, data.playlist]);
        setPlaylistName("");
        setShowInput(false);
        setShowCreateDropdown(false);
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  const handleRenamePlaylist = async (playlistId) => {
    if (!newPlaylistName.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/playlists/${playlistId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newPlaylistName }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setPlaylists(
          playlists.map((playlist) =>
            playlist._id === playlistId
              ? { ...playlist, name: newPlaylistName }
              : playlist
          )
        );
        setEditingPlaylistId(null);
      }
    } catch (error) {
      console.error("Error renaming playlist:", error);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/playlists/${playlistId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setPlaylists(
          playlists.filter((playlist) => playlist._id !== playlistId)
        );
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  };

  const toggleDropdown = (playlistId) => {
    setDropdownVisible(dropdownVisible === playlistId ? null : playlistId);
  };

  const closeDropdown = () => {
    setDropdownVisible(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu")) {
        closeDropdown();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
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
                className="bg-[#121212] text-white text-base px-3 py-2 rounded-full font-semibold hover:bg-[#242424] transition-colors duration-200 flex items-center space-x-2"
                onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              >
                {showCreateDropdown ? (
                  "✖"
                ) : (
                  <div className="flex items-center">
                    <FaPlus />
                    <span className="ml-1">Create</span>
                  </div>
                )}
              </button>
            )}
          </div>

          {showCreateDropdown && (
            <div className="absolute top-[65px] right-[-100px] w-48 bg-[#242424] shadow-lg rounded-md p-2">
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
            <div className="px-4">
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Playlist Name"
                className="w-full p-2 text-white tertiary_bg rounded-sm "
              />
              <button
                onClick={handleCreatePlaylist}
                className="w-full mt-2 bg-green-500 text-white py-1 rounded-sm hover:bg-green-600"
              >
                Create
              </button>
            </div>
          )}

          <div className="your_library flex flex-col gap-4 overflow-y-auto pr-2 h-full">
            {!user ? (
              <div className="tertiary_bg rounded-lg px-4 py-6">
                <p className="font-bold">Create your first playlist.</p>
                <p className="font-semibold">It's easy, we'll help you.</p>
                <button className="rounded-full text-black font-semibold mt-4 px-4 py-1 bg-white">
                  Create playlist
                </button>
              </div>
            ) : (
              playlists.map((playlist) => {
                const playlistImage =
                  playlist?.albumCover ||
                  "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg";

                return (
                  <div
                    key={playlist._id}
                    className="flex items-center gap-4 secondary_bg hover:bg-[#242424] transition-colors duration-200 rounded-lg p-2 cursor-pointer relative"
                    onClick={() => navigate(`/playlist/${playlist._id}`)} // ✅ Redirect on click
                  >
                    <img
                      src={playlistImage}
                      alt="Playlist Cover"
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div className="flex-grow">
                      <span className="text-white font-semibold truncate">
                        {playlist.name}
                      </span>
                    </div>

                    {/* Options Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // ✅ Prevent navigation when clicking the options button
                        toggleDropdown(playlist._id);
                      }}
                      className="text-white text-xl p-2 transition duration-200 transform hover:scale-110"
                    >
                      <SlOptions />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownVisible === playlist._id && (
                      <div className="dropdown-menu absolute top-[4.5rem] right-0 bg-[#242424] shadow-lg rounded-sm p-1 w-32 text-gray-200 z-50">
                        <ul>
                          <li
                            className="p-2 hover:bg-[#3E3D3D] rounded-sm cursor-pointer transition duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingPlaylist(playlist._id, playlist.name);
                              closeDropdown();
                            }}
                          >
                            Rename
                          </li>
                          <li
                            className="p-2 hover:bg-[#3E3D3D] rounded-sm cursor-pointer text-red-400 transition duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlaylist(playlist._id);
                              closeDropdown();
                            }}
                          >
                            Delete
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
