import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { userLogout, updateUserProfile } from "../../states/Actors/userActors";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { user, isAuthenticated, token } = useSelector(
    (state) => state.account
  );

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user?._id !== id) {
      navigate(`/profile/${user?._id}`);
    } else {
      setFormData({
        username: user?.username || "",
        bio: user?.bio || "",
        avatar: user?.avatar || "",
      });
    }
  }, [isAuthenticated, user, id, navigate]);

  const handleLogout = () => {
    dispatch(userLogout());
    navigate("/login");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:5001/api/user/update",
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(updateUserProfile(res.data.user));
      alert("✅ Profile updated!");
    } catch (err) {
      console.error("❌ Update error:", err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center">Your Profile</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-md mt-4"
      >
        <label className="block text-white mb-2">
          Username:
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full mt-1 p-2 rounded bg-gray-700 text-white"
            required
          />
        </label>

        <label className="block text-white mt-4 mb-2">
          Bio:
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full mt-1 p-2 rounded bg-gray-700 text-white"
          />
        </label>

        <label className="block text-white mt-4 mb-2">
          Avatar URL:
          <input
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            className="w-full mt-1 p-2 rounded bg-gray-700 text-white"
          />
        </label>

        {formData.avatar && (
          <img
            src={formData.avatar}
            alt="avatar preview"
            className="w-24 h-24 rounded-full mt-4"
          />
        )}

        <button
          type="submit"
          className="mt-6 bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:scale-105 transition-all"
        >
          Save Changes
        </button>
      </form>

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
