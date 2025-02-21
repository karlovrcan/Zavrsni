import React, { useState } from "react";

import logo from "../../assets/logo.svg";
import "./login.css";
import { Link } from "react-router-dom";

const Login = () => {
  const [userDetails, setUserDetails] = useState({
    username: "",
    password: "",
  });

  const loginUser = async (e) => {
    e.preventDefault();
    const { username, password } = userDetails;
    let data = JSON.stringify({
      username,
      password,
    });
    const res = await fetch("http://localhost:5001/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });
    const Data = await res.json();
    console.log(Data);
  };

  const onChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

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

          <form onSubmit={loginUser} className="text-center space-y-4">
            <div className="w-full text-sm font-bold text-left">
              <label htmlFor="username" className="block mb-2 text-gray-300">
                Email or username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={userDetails.username}
                onChange={onChange}
                placeholder="Enter your username"
                className="w-full bg-[#121212] text-white font-normal rounded-md border border-gray-600 shadow-sm 
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
                value={userDetails.password}
                onChange={onChange}
                placeholder="Password"
                className="w-full bg-[#121212] text-white font-normal rounded-md border border-gray-600 shadow-sm 
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
