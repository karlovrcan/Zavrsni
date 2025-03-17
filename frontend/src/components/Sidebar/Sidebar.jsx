import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../states/AuthContext";
import { FaPlus } from "react-icons/fa";
import { BiLibrary } from "react-icons/bi";
import { Link } from "react-router-dom";
import { SlOptions } from "react-icons/sl";
import Card from "../Card/Card";  // Import the Card component

const Sidebar = () => {
  const { user, token } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(null);

  useEffect(() => {
    if (user) fetchPlaylists(); // Fetch playlists when the user is logged in
  }, [user]);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setPlaylists(data.playlists); // Set playlists in state
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!user || playlistName.trim() === "") return;

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

  const handleDeletePlaylist = async (id) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      try {
        const response = await fetch(`http://localhost:5001/api/playlists/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setPlaylists(playlists.filter((playlist) => playlist._id !== id)); // Remove from state
        }
      } catch (error) {
        console.error("Error deleting playlist:", error);
      }
    }
  };

  const handleRenamePlaylist = async (id) => {
    const newName = prompt("Enter new name for the playlist:");
    if (newName) {
      try {
        const response = await fetch(`http://localhost:5001/api/playlists/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newName }),
        });
        const data = await response.json();
        if (data.success) {
          setPlaylists(
            playlists.map((playlist) =>
              playlist._id === id ? { ...playlist, name: newName } : playlist
            )
          );
        }
      } catch (error) {
        console.error("Error renaming playlist:", error);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-165px)] w-full flex flex-col mt-3 ml-[5px]">
      <div className="flex-grow h-full overflow-hidden">
        <div className="secondary_bg rounded-lg px-2 py-2 h-full flex flex-col">
          {/* Library Header & Create Button */}
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

          {/* Create Dropdown */}
          {showCreateDropdown && (
            <div className="absolute top-10 right-0 w-48 bg-[#242424] shadow-lg rounded-md p-2">
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

          {/* Create Playlist Input */}
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

          {/* Playlists */}
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
              playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="tertiary_bg rounded-lg px-4 py-3 hover:bg-gray-800 transition-colors duration-200 flex justify-between items-center"
                >
                  <Link
                    to={`/playlist/${playlist._id}`}
                    className="flex-grow text-white"
                  >
                    {playlist.name}
                  </Link>
                  <button
                    onClick={() => setDropdownVisible(playlist._id)} // Toggle dropdown
                    className="text-white rounded-full p-3 hover:bg-[#242424]"
                  >
                    <SlOptions />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownVisible === playlist._id && (
                    <div className="absolute right-0 bg-[#242424] shadow-lg rounded-md mt-2 p-2 w-48">
                      <ul className="text-gray-200">
                        <li
                          onClick={() => handleRenamePlaylist(playlist._id)}
                          className="flex p-2 hover:bg-[#121212] rounded-md cursor-pointer"
                        >
                          Rename
                        </li>
                        <li
                          onClick={() => handleDeletePlaylist(playlist._id)}
                          className="flex p-2 hover:bg-[#121212] rounded-md cursor-pointer"
                        >
                          Delete
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
