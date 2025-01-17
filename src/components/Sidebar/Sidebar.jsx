import React from "react";
import { GoHomeFill } from "react-icons/go";
import { FiSearch } from "react-icons/fi";
import { BiLibrary } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="w-1/4 h-screen sticky top-0 flex flex-col bg-black text-white p-4">
      <div className="secondary_bg rounded-lg p-6 mb-4">
        <div className="flex items-center gap-4">
          <GoHomeFill className="font-bold text-3xl" />
          <span className="text-lg font-semibold">Home</span>
        </div>
        <div className="flex mt-4 items-center gap-4">
          <FiSearch className="font-bold text-3xl" />
          <span className="text-lg font-semibold">Search</span>
        </div>
      </div>
      <div className="secondary_bg rounded-lg px-2 py-2 flex-grow overflow-y-auto">
        <div className="flex px-4 justify-between mb-4 items-center gap-4">
          <div className="flex gap-2 items-center">
            <BiLibrary className="font-bold text-3xl" />
            <span className="text-lg font-semibold">Library</span>
          </div>
          <button className="hover:bg-black/25 rounded-full p-2">
            <FaPlus className="font-bold text-xl" />
          </button>
        </div>

        {/* Your Library */}
        <div className="your_library flex flex-col gap-4">
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
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
