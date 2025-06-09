import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BrowsePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/category");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-white text-3xl font-bold mb-4">Browse all</h2>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat._id}
            onClick={() =>
              navigate(
                `/search?tags=${encodeURIComponent(
                  cat.tags.join(",")
                )}&source=browse`
              )
            }
            className="p-6 rounded-lg h-[150px] hover:scale-105 transition cursor-pointer"
            style={{ backgroundColor: cat.color }}
          >
            <h3 className="text-white font-bold text-xl">{cat.label}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowsePage;
