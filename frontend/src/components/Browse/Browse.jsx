import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // ✅ Get accessToken from Redux
import { fetchCategories } from "../../api/spotifyService";

const BrowsePage = () => {
  const [categories, setCategories] = useState([]); // ✅ Store categories in local state
  const [loading, setLoading] = useState(true);
  const accessToken = useSelector((state) => state.spotify.accessToken); // ✅ Get accessToken

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
        {categories.map((category) => (
          <div key={category.id} className="p-6 rounded-lg bg-gray-800">
            <h3 className="text-white font-bold text-lg">{category.name}</h3>
            {category.icons?.length > 0 && (
              <img
                src={category.icons[0].url}
                alt={category.name}
                className="w-16 h-16 mt-2"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowsePage;
