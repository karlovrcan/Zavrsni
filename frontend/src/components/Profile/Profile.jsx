import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userLogout } from "../../states/Actors/userActors";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.account);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Logout Handler
  const handleLogout = () => {
    dispatch(userLogout());
    navigate("/login");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center">Profile Page</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-4">
        <p className="text-lg">
          👤 <strong>Username:</strong> {user?.username}
        </p>
        <p className="text-lg">
          📧 <strong>Email:</strong> {user?.email}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-600 text-white font-bold py-2 px-4 rounded-full hover:scale-105 transition-all"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
