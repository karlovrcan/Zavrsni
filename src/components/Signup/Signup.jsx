import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import "./signup.css";
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Signup = () => {
  return (
    <>
      <div className="container w-1/3 mx-auto mt-12 rounded-lg">
        <div className="logo flex justify-center pt-8">
          <img src={logo} width={60} alt="Spotify Logo" />
        </div>

        <div className="bg-[#121212] p-10 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-center mb-7">
            Sign up to start listening.
          </h1>

          <form className="text-center space-y-4">
            <div className="w-full text-sm font-bold text-left">
              <label htmlFor="email" className="block mb-2 text-">
                What is your email?
              </label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="Email"
                className="w-full bg-[#121212] text-white rounded-md border border-gray-600 shadow-sm 
            px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none"
              />
            </div>
            <div className="w-full text-sm font-bold text-left">
              <label htmlFor="password" className="block mb-2 ">
                Create password
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
            <div className="w-full text-sm font-bold text-left">
              <label htmlFor="password" className="block mb-2">
                Confirm password
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
            <div className="w-full text-sm font-bold text-left">
              <label className="block mb-2">Your prefered name</label>
              <input
                type="text"
                id="username"
                name="username"
                className="w-full bg-[#121212] text-white rounded-md border border-gray-600 shadow-sm 
            px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none mb-2"
              />
              <small className="font-light">
                This name will appear on your profile.
              </small>
            </div>

            <div className="w-full text-sm font-bold text-left">
              <label className="block mb-2">Date of birth</label>
              <div className="w-full flex gap-4">
                <input
                  type="text"
                  id="day"
                  name="day"
                  placeholder="dd"
                  className="w-1/4 bg-[#121212] text-white rounded-md border border-gray-600 shadow-sm 
    px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none mb-2"
                />
                <select
                  id="month"
                  name="month"
                  className="w-2/4 bg-[#121212] text-white rounded-md border border-gray-600
       shadow-sm px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none mb-2"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  id="year"
                  name="year"
                  placeholder="yyyy"
                  className="w-1/4 bg-[#121212] text-white rounded-md border border-gray-600 shadow-sm 
    px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none mb-2"
                />
              </div>
            </div>
            <div className="w-full text-sm font-bold text-left mt-6">
              <fieldset>
                <legend className="block mb-2 font-bold">Gender</legend>
                <p className="text-gray-400 text-sm mb-4 font-light">
                  We use your gender to help personalize our content
                  recommendations and ads for you.
                </p>
                <div className="flex flex-wrap gap-4 font-normal">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="man"
                      className="hidden peer"
                    />
                    <span className="w-5 h-5 border-2 border-gray-500 peer-checked:border-green-500 peer-checked:bg-green-500 rounded-full flex items-center justify-center">
                      <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
                    </span>
                    Man
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="woman"
                      className="hidden peer"
                    />
                    <span className="w-5 h-5 border-2 border-gray-500 peer-checked:border-green-500 peer-checked:bg-green-500 rounded-full flex items-center justify-center">
                      <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
                    </span>
                    Woman
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="non-binary"
                      className="hidden peer"
                    />
                    <span className="w-5 h-5 border-2 border-gray-500 peer-checked:border-green-500 peer-checked:bg-green-500 rounded-full flex items-center justify-center">
                      <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
                    </span>
                    Non-binary
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      className="hidden peer"
                    />
                    <span className="w-5 h-5 border-2 border-gray-500 peer-checked:border-green-500 peer-checked:bg-green-500 rounded-full flex items-center justify-center">
                      <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
                    </span>
                    Something else
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="prefer-not-to-say"
                      className="hidden peer"
                    />
                    <span className="w-5 h-5 border-2 border-gray-500 peer-checked:border-green-500 peer-checked:bg-green-500 rounded-full flex items-center justify-center">
                      <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
                    </span>
                    Prefer not to say
                  </label>
                </div>
              </fieldset>
            </div>

            <button className="w-full  bg-[#1db954] font-bold  text-black py-4  rounded-full hover:scale-105 translate-all duration-100 hover:font-bold">
              Sign up
            </button>

            <div className="text-center w-full text-gray-400 pt-4 ">
              <p>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="underline text-white hover:text-[#1db954]"
                >
                  Log in here.
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
