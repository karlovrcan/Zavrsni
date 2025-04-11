import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchCategories } from "../../api/spotifyService";
import { Link } from "react-router-dom";

const BrowsePage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const accessToken = useSelector((state) => state.spotify.accessToken);

  // slug => display name
  const supportedCategories = {
    pop: "Pop",
    rock: "Rock",
    party: "Party",
    chill: "Chill",
    mood: "Mood",
    workout: "Workout",
    hiphop: "Hip-Hop",
    rnb: "R&B",
    sleep: "Sleep",
    country: "Country",
  };

  useEffect(() => {
    const loadCategories = async () => {
      if (!accessToken) {
        console.warn("⚠️ No access token available.");
        return;
      }

      console.log("📡 Calling fetchCategories()...");
      setLoading(true);
      const fetchedCategories = await fetchCategories(accessToken);
      setCategories(fetchedCategories);
      setLoading(false);
    };

    loadCategories();
  }, [accessToken]);

  if (loading) return <p className="text-white">Loading categories...</p>;
  if (!categories || categories.length === 0) {
    return <p className="text-white">No categories available.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-white text-3xl font-bold mb-4">Browse all</h2>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => {
          const slug = Object.keys(supportedCategories).find(
            (key) =>
              supportedCategories[key].toLowerCase() ===
              category.name.toLowerCase()
          );

          const isSupported = !!slug;

          const content = (
            <div className="p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition duration-200 cursor-pointer">
              <h3 className="text-white font-bold text-lg">{category.name}</h3>
              {category.icons?.length > 0 && (
                <img
                  src={category.icons[0].url}
                  alt={category.name}
                  className="w-16 h-16 mt-2"
                />
              )}
            </div>
          );

          return isSupported ? (
            <Link to={`/category/${slug}`} key={category.id}>
              {content}
            </Link>
          ) : (
            <div
              key={category.id}
              className="opacity-50 cursor-not-allowed"
              title="Category not supported"
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BrowsePage;
