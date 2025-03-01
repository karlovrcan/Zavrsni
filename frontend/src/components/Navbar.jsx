import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";
import { GoHomeFill } from "react-icons/go";
import { songs } from "../assets/songs/songs";
import { useGlobalContext } from "../states/Content";

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.account);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const {filteredSongs ,setFilteredSongs} = useGlobalContext();
  const location = useLocation();
  const filterSongs = (e) => {
    setQuery(e.target.value);
    const filSongs = songs.filter((song) => {
      if(song.title.toLowerCase.includes(e.target.value.toLowerCase()) || song.artist.toLowerCase.includes(e.target.value.toLowerCase()))
        return song;
    });
    setFilteredSongs(filSongs);
  }
  console.log("Navbar rendered, current path:", location.pathname);
  useEffect(() => {
    console.log("Navbar useEffect, location changed to:", location.pathname);
  }, [location.pathname]);
  return (
    <div className="sticky top-0 z-10 bg-black shadow-md pb-2 pt-2 px-4 ">
      <div className="flex items-center">
        <div className="mr-4 w-1/4">
          <Link to="/">
            <img src={logo} alt="Spotify Logo" className="w-8" />
          </Link>
        </div>
        <div className="flex-grow flex items-center justify-start px-2 space-x-4 ">
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
        <div className="w-1/4 justify-items-end">
          {!isAuthenticated ? (
            <div className="flex">
              <div className="transform transition duration-200 hover:scale-105">
                <Link
                  to={"/signup"}
                  className="rounded-full mt-3 px-8 text-base py-2 text-white font-semibold"
                >
                  Sign up
                </Link>
              </div>
              <div className="transform transition duration-200 hover:scale-105">
                <Link
                  to={"/login"}
                  className="rounded-full text-black mt-3 px-6 text-base py-2 bg-white font-semibold"
                >
                  Log in
                </Link>
              </div>
            </div>
          ) : (
            <FaUser />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
