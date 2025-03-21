import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex overflow-none">
      <div className="w-[420px] fixed bg-black pr-4 custom-scrollbar">
        <Sidebar />
      </div>
      <div className="flex-grow ml-[420px] overflow-y-auto">{children}</div>
    </div>
  );
};

export default Layout;
