import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import SongBar from "../components/MasterBar/SongBar";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <div className="w-[420px] fixed bg-black pr-4 custom-scrollbar z-10">
        <Sidebar />
      </div>

      <div className="flex-grow h-screen ml-[420px] overflow-y-auto custom-scrollbar relative z-0 pb-[100px]">
        {" "}
        {children}
      </div>

      <SongBar />
    </div>
  );
};

export default Layout;
