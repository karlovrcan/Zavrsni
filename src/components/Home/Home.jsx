import React from "react";
import Layout from "../../Layout/Layout";
import Card from "../Card/Card";
import { FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";

const songs = [
  {
    id: Math.random * Date.now(),
    title: "Oj Ugljane",
    artist: "Karlo Vrcan",
    mp3: new Audio("/mp3/Mashup.mp3"),
  },
  {
    id: Math.random * Date.now(),
    title: "Pizda",
    artist: "Jakov Vrcan",
    mp3: new Audio("/mp3/Mashup.mp3"),
  },
  {
    id: Math.random * Date.now(),
    title: "Boko",
    artist: "Marko Vrcan",
    mp3: new Audio("/mp3/Mashup.mp3"),
  },
  {
    id: Math.random * Date.now(),
    title: "Oje",
    artist: "Marija Vrcan",
    mp3: new Audio("/mp3/Mashup.mp3"),
  },
];

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
            <Link
              to={"/signup"}
              className="rounded-full mt-3 px-8 text-base py-2 text-white font-semibold"
            >
              Sign up
            </Link>
            <Link
              to={"/login"}
              className="rounded-full text-black mt-3 px-6 text-base py-2 bg-white font-semibold"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      <div className="secondary_bg px-4 py-4 rounded-lg z-index:1">
        <div className="px-3 flex justify-between items-center ">
          <span className="font-bold text-3xl hover:underline">Focus</span>
          <span className="text-xs hover:underline">Show all</span>
        </div>
        <div className="grid mt-2 gap-3 grid-cols-6">
          {songs.map((song) => {
            return <Card key={song.id} song={song} />;
          })}
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
