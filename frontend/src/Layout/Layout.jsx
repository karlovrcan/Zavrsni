import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex bg-black overflow-none">
      <div className="w-[420px] h-[80%] mt-[63px] fixed top-0  bg-black  pr-4 custom-scrollbar">
        <Sidebar />
      </div>
      <div className="flex-grow ml-[420px] overflow-y-auto">{children}</div>
    </div>
  );
};

export default Layout;
