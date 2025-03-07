import React, { useEffect } from "react";
import Layout from "../../Layout/Layout";
import Card from "../Card/Card";

import { useGlobalContext } from "../../states/Content.jsx";

const Home = () => {
  const { getUser } = useGlobalContext();
  useEffect(() => {
    getUser();
  }, []);
  return (
    <Layout>
      <div className="secondary_bg h-[calc(100vh-155px)] px-4 py-4 rounded-lg z-index:1 mr-3">
        <div className="px-3 flex justify-between items-center ">
          <span className="font-bold text-3xl hover:underline">Focus</span>
          <span className="text-xs hover:underline">Show all</span>
        </div>
        <div className="grid mt-2 gap-3 grid-cols-6"></div>
      </div>
    </Layout>
  );
};

export default Home;
