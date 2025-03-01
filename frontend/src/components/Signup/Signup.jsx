import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { toast } from "react-toastify";
import "./signup.css";
import { useSelector } from "react-redux";
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
  const [userDetails, setUserDetails] = useState({
    username: "",
    password: "",
    password1: "",
    gender: "",
    email: "",
    day: "",
    month: "January",
    year: "",
  });
  const onChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.account);
  const registerUser = async (e) => {
    e.preventDefault();
    const index = months.indexOf(userDetails.month);
    const { username, password, password1, gender, email, day, month, year } =
      userDetails;
    let data = JSON.stringify({
      username,
      password,
      password1,
      gender,
      email,
      day,
      month,
      year,
    });
    const res = await fetch("http://localhost:5001/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });
    const Data = await res.json();
    if (Data.success) {
      setUserDetails({
        username: "",
        password: "",
        password1: "",
        gender: "",
        email: "",
        day: "",
        month: "",
        year: "",
      });
      toast.success(Data.message);

      localStorage.setItem("token", JSON.stringify(Data.token));
      navigate("/login");
    } else {
      toast.error(Data.message);
    }
    console.log(Data);
  };
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/login");
    }
  }, []);
  return (
    <>
      <div className="auth-bg">
        <div className="container w-1/3 mx-auto rounded-lg">
          <div className="logo flex justify-center pt-8">
            <img src={logo} width={60} alt="Spotify Logo" />
          </div>

          <div className="bg-[#121212] p-10 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold text-center mb-7">
              Sign up to start listening.
            </h1>

            <form className="text-center space-y-4">
              <div className="w-full text-sm font-bold text-left">
                <label htmlFor="email" className="block mb-2 ">
                  What is your email?
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={userDetails.email}
                  onChange={onChange}
                  placeholder="Email"
                  className="w-full bg-[#121212] text-white font-normal rounded-md border border-gray-600 shadow-sm 
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
                  value={userDetails.password}
                  onChange={onChange}
                  name="password"
                  placeholder="Password"
                  className="w-full bg-[#121212] text-white font-normal rounded-md border border-gray-600 shadow-sm 
            px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none"
                />
              </div>
              <div className="w-full text-sm font-bold text-left">
                <label htmlFor="password1" className="block mb-2">
                  Confirm password
                </label>
                <input
                  type="password"
                  id="password1"
                  value={userDetails.password1}
                  onChange={onChange}
                  name="password1"
                  placeholder="Password"
                  className="w-full bg-[#121212] text-white font-normal rounded-md border border-gray-600 shadow-sm 
            px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none"
                />
              </div>
              <div className="w-full text-sm font-bold text-left">
                <label htmlFor="username" className="block mb-2">
                  Your prefered name
                </label>
                <input
                  type="text"
                  id="username"
                  value={userDetails.username}
                  onChange={onChange}
                  name="username"
                  className="w-full bg-[#121212] text-white font-normal rounded-md border border-gray-600 shadow-sm 
            px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none mb-2"
                />
                <small className="font-light">
                  This name will appear on your profile.
                </small>
              </div>

              <div className="w-full text-sm font-bold text-left">
                <label htmlFor="date" className="block mb-2">
                  Date of birth
                </label>
                <div className="w-full flex gap-4">
                  <input
                    type="text"
                    id="day"
                    value={userDetails.day}
                    onChange={onChange}
                    name="day"
                    placeholder="dd"
                    className="w-1/4 bg-[#121212] text-white font-normal rounded-md border border-gray-600 shadow-sm 
    px-4 py-3 focus:ring-2 focus:ring-white focus:outline-none mb-2"
                  />
                  <select
                    id="month"
                    name="month"
                    value={userDetails.month}
                    onChange={onChange}
                    className="w-2/4 bg-[#121212] text-white font-normal rounded-md border border-gray-600
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
                    value={userDetails.year}
                    onChange={onChange}
                    name="year"
                    placeholder="yyyy"
                    className="w-1/4 bg-[#121212] text-white font-normal rounded-md border border-gray-600 shadow-sm 
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
                    <label htmlFor="man" className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        id="man"
                        value="man"
                        onChange={onChange}
                        className="hidden peer"
                      />
                      <span className="w-5 h-5 border-2 border-gray-500 peer-checked:border-green-500 peer-checked:bg-green-500 rounded-full flex items-center justify-center">
                        <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
                      </span>
                      Man
                    </label>

                    <label htmlFor="woman" className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        id="woman"
                        value="woman"
                        onChange={onChange}
                        className="hidden peer"
                      />
                      <span className="w-5 h-5 border-2 border-gray-500 peer-checked:border-green-500 peer-checked:bg-green-500 rounded-full flex items-center justify-center">
                        <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
                      </span>
                      Woman
                    </label>

                    <label
                      htmlFor="non-binary"
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="gender"
                        id="non-binary"
                        value="non-binary"
                        onChange={onChange}
                        className="hidden peer"
                      />
                      <span className="w-5 h-5 border-2 border-gray-500 peer-checked:border-green-500 peer-checked:bg-green-500 rounded-full flex items-center justify-center">
                        <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
                      </span>
                      Non-binary
                    </label>

                    <label htmlFor="other" className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        id="other"
                        value="other"
                        onChange={onChange}
                        className="hidden peer"
                      />
                      <span className="w-5 h-5 border-2 border-gray-500 peer-checked:border-green-500 peer-checked:bg-green-500 rounded-full flex items-center justify-center">
                        <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
                      </span>
                      Something else
                    </label>

                    <label htmlFor="pnts" className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        id="pnts"
                        value="prefer-not-to-say"
                        onChange={onChange}
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
            </form>
            <div className="mt-7">
              <form onSubmit={registerUser}>
                <button className="w-full  bg-[#1db954] font-bold  text-black py-4  rounded-full hover:scale-105 translate-all duration-100 hover:font-bold">
                  Sign up
                </button>
              </form>

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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
