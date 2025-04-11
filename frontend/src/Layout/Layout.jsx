import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import SongBar from "../components/MasterBar/SongBar"; // add this

const Layout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-[420px] fixed bg-black pr-4 custom-scrollbar z-10">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-grow ml-[420px] overflow-y-auto relative z-0 pb-[100px]">
        {children}
      </div>

      <SongBar />
    </div>
  );
};

export default Layout;
