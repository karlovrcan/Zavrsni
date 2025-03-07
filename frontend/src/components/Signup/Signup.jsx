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
    email: "",
    day: "",
    month: "January",
    year: "",
  });

  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.account);

  // 🔹 Handle Input Changes
  const onChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  // 🔹 Handle Form Submission
  const registerUser = async (e) => {
    e.preventDefault();

    const { username, password, password1, email, day, month, year } =
      userDetails;

    // Basic Form Validation
    if (
      !username ||
      !password ||
      !password1 ||
      !email ||
      !day ||
      !month ||
      !year
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== password1) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          email,
          day,
          month,
          year,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Signup successful!");
        sessionStorage.setItem("token", data.token); // Store token in session storage
        navigate("/"); // Redirect to homepage after signup
      } else {
        toast.error(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Server error. Please try again later.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

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

            <form onSubmit={registerUser} className="text-center space-y-4">
              <div className="w-full text-sm font-bold text-left">
                <label htmlFor="email" className="block mb-2">
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={userDetails.email}
                  onChange={onChange}
                  placeholder="Enter your email"
                  className="w-full bg-[#121212] text-white rounded-md border border-gray-600 px-4 py-3 focus:ring-2 focus:ring-white"
                />
              </div>

              <div className="w-full text-sm font-bold text-left">
                <label htmlFor="password" className="block mb-2">
                  Create Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={userDetails.password}
                  onChange={onChange}
                  placeholder="Password"
                  className="w-full bg-[#121212] text-white rounded-md border border-gray-600 px-4 py-3 focus:ring-2 focus:ring-white"
                />
              </div>

              <div className="w-full text-sm font-bold text-left">
                <label htmlFor="password1" className="block mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="password1"
                  name="password1"
                  value={userDetails.password1}
                  onChange={onChange}
                  placeholder="Confirm Password"
                  className="w-full bg-[#121212] text-white rounded-md border border-gray-600 px-4 py-3 focus:ring-2 focus:ring-white"
                />
              </div>

              <div className="w-full text-sm font-bold text-left">
                <label htmlFor="username" className="block mb-2">
                  Your Preferred Name
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={userDetails.username}
                  onChange={onChange}
                  placeholder="Enter your username"
                  className="w-full bg-[#121212] text-white rounded-md border border-gray-600 px-4 py-3 focus:ring-2 focus:ring-white"
                />
              </div>

              <div className="w-full text-sm font-bold text-left">
                <label htmlFor="date" className="block mb-2">
                  Date of Birth
                </label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    id="day"
                    name="day"
                    value={userDetails.day}
                    onChange={onChange}
                    placeholder="DD"
                    className="w-1/4 bg-[#121212] text-white rounded-md border border-gray-600 px-4 py-3 focus:ring-2 focus:ring-white"
                  />
                  <select
                    id="month"
                    name="month"
                    value={userDetails.month}
                    onChange={onChange}
                    className="w-2/4 bg-[#121212] text-white rounded-md border border-gray-600 px-4 py-3 focus:ring-2 focus:ring-white"
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
                    value={userDetails.year}
                    onChange={onChange}
                    placeholder="YYYY"
                    className="w-1/4 bg-[#121212] text-white rounded-md border border-gray-600 px-4 py-3 focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1db954] text-black font-bold py-4 rounded-full hover:scale-105 transition-all duration-100"
              >
                Sign Up
              </button>

              <div className="text-center w-full text-gray-400 pt-4">
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
      </div>
    </>
  );
};

export default Signup;
