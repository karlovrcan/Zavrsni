import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="w-3/4 h-screen overflow-y-auto">{children}</div>
    </div>
  );
};

export default Layout;
