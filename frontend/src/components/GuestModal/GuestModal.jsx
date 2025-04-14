import React from "react";
import { Link } from "react-router-dom";

const GuestModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/50 py-5 px-5">
      <div className="bg-[#282828] text-white rounded-xl p-6 w-full max-w-md relative shadow-lg mx-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl hover:scale-110 transition duration-100 "
        >
          ×
        </button>

        {/* Modal Content */}
        <h2 className="text-3xl font-semibold mb-2 text-center py-4">
          Start listening with a free Spotify account.
        </h2>

        <div className="flex flex-col gap-3 justify-center items-center">
          <Link to="/signup" onClick={onClose}>
            <button className="bg-[#1db954] font-semibold text-black px-6 py-3 rounded-full hover:scale-105 transition duration-100">
              Sign up for free
            </button>
          </Link>
          <div className="text-center text-sm w-full text-gray-400 pt-4 ">
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="underline text-white text-sm hover:text-[#1db954]"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestModal;
