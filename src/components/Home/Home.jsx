import React from "react";
import Layout from "../../Layout/Layout";
import Card from "../Card/Card";
import { FiSearch } from "react-icons/fi";

const Home = () => {
  return (
    <Layout>
      <div className="sticky top-0 z-10 bg-black shadow-md pb-1 pt-1">
        <div className="flex justify-end items-center space-x-4 pr-4 mb-4">
          <div className="flex-grow flex justify-center mt-2">
            <div className="relative w-1/2">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-2xl" />
              <input
                type="text"
                placeholder="What do you want to play?"
                className="w-full p-3 px-11 text-black rounded-full tertiary_bg focus:outline-none font-semibold"
              />
            </div>
          </div>
          <div>
            <button className="rounded-full mt-3 px-8 text-base py-2 text-white font-semibold">
              Sign up
            </button>
            <button className="rounded-full text-black mt-3 px-6 text-base py-2 bg-white font-semibold">
              Log in
            </button>
          </div>
        </div>
      </div>

      <div className="secondary_bg px-4 py-4 rounded-lg z-index:1">
        <div className="px-3 flex justify-between items-center ">
          <span className="font-bold text-3xl hover:underline">Focus</span>
          <span className="text-xs hover:underline">Show all</span>
        </div>
        <div className="grid mt-2 gap-3 grid-cols-6">
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
        <div className="px-3 flex justify-between items-center  ">
          <span className="font-bold text-3xl hover:underline">Focus</span>
          <span className="text-xs hover:underline">Show all</span>
        </div>
        <div className="grid mt-2 gap-3 grid-cols-6 ">
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
        <div className="px-3 flex justify-between items-center ">
          <span className="font-bold text-3xl hover:underline">Focus</span>
          <span className="text-xs hover:underline">Show all</span>
        </div>
        <div className="grid mt-2 gap-3 grid-cols-6 ">
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
      </div>
    </Layout>
  );
};

export default Home;
