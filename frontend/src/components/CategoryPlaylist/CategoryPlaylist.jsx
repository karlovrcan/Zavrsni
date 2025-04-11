import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchCategoryPlaylists } from "../../api/spotifyService"; // 👈 you'll create this if not already
import { Link } from "react-router-dom";

const CategoryPlaylist = () => {
  const { categoryId } = useParams();
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaylists = async () => {
      if (!accessToken) return;
      console.log("🔍 categoryId from URL:", categoryId);

      setLoading(true);
      const data = await fetchCategoryPlaylists(categoryId, accessToken); // ⬅️ Use ID again
      setPlaylists(data?.playlists?.items || []);
      setLoading(false);
    };

    loadPlaylists();
  }, [accessToken, categoryId]);

  if (loading) return <p className="text-white p-6">Loading playlists...</p>;
  if (!playlists.length)
    return <p className="text-white p-6">No playlists found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-white text-3xl font-bold mb-4">Playlists</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <p className="text-white p-6">Category ID: {categoryId}</p>

        {playlists.map((playlist) => (
          <Link to={`/playlist/${playlist.id}`} key={playlist.id}>
            <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition">
              <img
                src={playlist.images?.[0]?.url}
                alt={playlist.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="text-white font-medium">{playlist.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPlaylist;
