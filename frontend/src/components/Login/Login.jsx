import React from "react";
import logo from "../../assets/logo.svg";
import "./login.css";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <>
      <div className="container w-1/3 mx-auto mt-12 rounded-lg">
        <div className="logo flex justify-center pt-8">
          <img src={logo} width={60} alt="Spotify Logo" />
        </div>

        <div className="bg-[#121212] p-10 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center mb-7">
            Log in to Spotify
          </h1>

          <form className="text-center space-y-4">
            <div className="w-full text-sm font-bold text-left">
              <label htmlFor="email" className="block mb-2 text-gray-300">
                Email or username
              </label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="Email or username"
                className="w-full bg-[#121212] text-white rounded-md border border-gray-600 shadow-sm 
                px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none"
              />
            </div>
            <div className="w-full text-sm font-bold text-left">
              <label htmlFor="password" className="block mb-2 text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                className="w-full bg-[#121212] text-white rounded-md border border-gray-600 shadow-sm 
                px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none"
              />
            </div>
            <button className="w-full  bg-[#1db954] font-bold  text-black py-4  rounded-full hover:scale-105 translate-all duration-100 hover:font-bold">
              Log in
            </button>
            <div className="text-center w-full underline pt-4 hover:text-[#1db954]">
              <Link to="/password/forgot">Forgot password? </Link>
            </div>
            <div className="text-center w-full text-gray-400 pt-4">
              <p>
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="underline text-white hover:text-[#1db954]"
                >
                  Sign up for Spotify.
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
