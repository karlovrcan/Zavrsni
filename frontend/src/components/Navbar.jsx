import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import logo from "../assets/logo.svg"; // Assuming logo path
import { userLogout } from "../states/Actors/userActors"; // Action to logout
import { useGlobalContext } from "../states/Content";

const Navbar = ({ onSearch }) => {
  // ✅ Accept `onSearch` from App.jsx
  const { isAuthenticated } = useSelector((state) => state.account); // Get auth status from Redux store
  const dispatch = useDispatch();
  const { setFilteredSongs } = useGlobalContext(); // Assuming global context for filtering songs

  const [query, setQuery] = useState(""); // Track search query
  const [showDropdown, setShowDropdown] = useState(false); // Handle dropdown toggle

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const filterSongs = (e) => {
    const searchValue = e.target.value;
    setQuery(searchValue);

    if (searchValue.trim() === "") {
      setFilteredSongs([]); // Clear songs if input is empty
      return;
    }

    setFilteredSongs([]); // Filtering logic removed for simplicity
    onSearch(searchValue); // Pass the query up to App.jsx
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    dispatch(userLogout());
    setShowDropdown(false);
  };

  return (
    <div className="sticky top-0 z-10 bg-black shadow-md pb-2 pt-2 px-4">
      <div className="flex items-center">
        <div className="mr-4 w-1/4">
          <Link to="/">
            <img src={logo} alt="Spotify Logo" className="w-8" />
          </Link>
        </div>
        <div className="flex-grow flex items-center justify-start px-9 space-x-4">
          <Link to="/" className="text-white text-2xl">
            <div className="tertiary_bg py-2 px-2 rounded-[50%] transform transition duration-200 hover:scale-110 hover:bg-gray-700">
              <GoHomeFill />
            </div>
          </Link>

          <div className="relative w-2/3">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white-400 text-2xl" />
            <input
              type="text"
              placeholder="What do you want to play?"
              value={query}
              onChange={filterSongs}
              className="w-full p-3 px-11 text-black rounded-full text-white tertiary_bg focus:outline-none font-normal"
            />
          </div>
        </div>
        <div
          className={`w-1/4 flex ${
            isAuthenticated ? "justify-center" : "justify-end"
          }`}
        >
          {!isAuthenticated ? (
            <div className="flex">
              <Link
                to={"/signup"}
                className="rounded-full mt-3 px-8 text-base py-2 text-white font-semibold"
              >
                Sign up
              </Link>
              <Link
                to={"/login"}
                className="rounded-full text-black mt-3 px-6 text-base py-2 bg-white font-semibold"
              >
                Log in
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button onClick={toggleDropdown}>
                <FaUser />
              </button>
              {showDropdown && (
                <div className="absolute dropdown top-11 w-[12rem] h-auto rounded-md shadow-lg right-0 bg-[#242424]">
                  <ul className="p-1 text-gray-200">
                    <li>
                      <Link
                        to={"/settings"}
                        className="flex p-2 justify-between rounded-sm hover:bg-[#121212]"
                      >
                        <span>Settings</span>
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={logoutUser}
                        className="w-full flex p-2 justify-between rounded-sm text-left hover:bg-[#121212]"
                      >
                        <span>Log Out</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
