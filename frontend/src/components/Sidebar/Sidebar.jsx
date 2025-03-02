// Sidebar.jsx
import React from "react";
import { GoHomeFill } from "react-icons/go";
import { IoSearchSharp } from "react-icons/io5";
import { BiLibrary } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="h-full w-full flex flex-col ">
      <div className="secondary_bg rounded-lg p-6 mb-4">
        <div>
          <Link to="/" className="flex items-center gap-4">
            <GoHomeFill className="font-bold text-xl" />
            <span className="text-base font-semibold">Home</span>
          </Link>
        </div>
        <div>
          <Link to="/search" className="flex mt-4 items-center gap-4">
            <IoSearchSharp className="font-bold text-xl" />
            <span className="text-base font-semibold">Search</span>
          </Link>
        </div>
      </div>

      <div className="flex-grow h-full overflow-hidden">
        <div className="secondary_bg rounded-lg px-2 py-2 h-full flex flex-col">
          <div className="flex px-4 justify-between mb-4 items-center gap-4">
            <div className="flex gap-2 items-center">
              <BiLibrary className="font-bold text-2xl" />
              <span className="text-base font-semibold">Library</span>
            </div>
            <button className="hover:bg-tertiary rounded-full p-2 transition-colors duration-200">
              <FaPlus className="font-bold text-xl" />
            </button>
          </div>

          {/* Scrollable section inside the sidebar */}
          <div className="your_library flex flex-col gap-4 overflow-y-auto pr-2 h-full">
            <div className="tertiary_bg rounded-lg px-4 py-6">
              <p className="font-bold">Create your first playlist.</p>
              <p className="font-semibold">It's easy, we'll help you.</p>
              <button className="rounded-full text-black font-semibold mt-4 px-4 py-1 bg-white">
                Create playlist
              </button>
            </div>
            <div className="tertiary_bg rounded-lg px-4 py-6">
              <p className="font-bold">Let's find some podcasts to follow</p>
              <p className="font-semibold">
                We'll keep you updated on new episodes
              </p>
              <button className="rounded-full text-black font-semibold mt-4 px-4 py-1 bg-white">
                Browse podcasts
              </button>
            </div>
            <div className="tertiary_bg rounded-lg px-4 py-6">
              <p className="font-bold">Let's find some podcasts to follow</p>
              <p className="font-semibold">
                We'll keep you updated on new episodes
              </p>
              <button className="rounded-full text-black font-semibold mt-4 px-4 py-1 bg-white">
                Browse podcasts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
