import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [localPlaylistStats, setLocalPlaylistStats] = useState([]);
  const [spotifyPlaylistStats, setSpotifyPlaylistStats] = useState([]);
  const [albumStats, setAlbumStats] = useState([]);
  const [songStats, setSongStats] = useState([]);
  const [selectedStat, setSelectedStat] = useState("local");
  const [showAllAlbums, setShowAllAlbums] = useState(false);
  const [showAllSongs, setShowAllSongs] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await axios.get("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.user.role !== "admin") {
          return navigate("/unauthorized");
        }

        setIsAuthorized(true);
        fetchUsers(token);
        fetchSpotifyStats(token);
        fetchAlbumStats(token);
        fetchSongStats(token);
        fetchLocalPlaylistStats(token);
      } catch (err) {
        console.error("Authorization failed", err);
        navigate("/login");
      }
    };

    checkAdmin();
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Something went wrong while deleting user.");
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.patch(
        `/api/admin/user/${id}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, role: res.data.role } : user
        )
      );
    } catch (err) {
      console.error("Role change failed:", err);
      alert("Failed to update role.");
    }
  };

  const fetchLocalPlaylistStats = async (token) => {
    try {
      const res = await axios.get("/api/admin/user-local-playlist-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocalPlaylistStats(res.data);
    } catch (err) {
      console.error("Failed to fetch local playlist stats", err);
    }
  };

  const fetchSpotifyStats = async (token) => {
    try {
      const res = await axios.get("/api/admin/user-spotify-playlist-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpotifyPlaylistStats(res.data);
    } catch (err) {
      console.error("Failed to fetch Spotify stats", err);
    }
  };

  const fetchAlbumStats = async (token) => {
    try {
      const res = await axios.get("/api/admin/album-appearance-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlbumStats(res.data);
    } catch (err) {
      console.error("Failed to fetch album stats", err);
    }
  };

  const fetchSongStats = async (token) => {
    try {
      const res = await axios.get("/api/admin/song-appearance-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSongStats(res.data);
    } catch (err) {
      console.error("Failed to fetch song stats", err);
    }
  };

  if (isAuthorized === null) return <p>Loading...</p>;
  if (!isAuthorized) return null;

  return (
    <div className="p-4 h-[calc(100vh-150px)] secondary_bg overflow-y-auto custom-scrollbar">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <h2 className="text-2xl text-center font-bold text-white mt-12 mb-7 border-b border-white/10 pb-1">
        User roles{" "}
      </h2>
      <div className="flex justify-center mb-10">
        <table className="min-w-[50%] border border-white/10 text-sm text-white bg-[#1a1a1a] rounded overflow-hidden shadow-md">
          <thead className="bg-[#2a2a2a] text-gray-300 uppercase text-xs tracking-wide">
            <tr>
              <th className="p-2 border-r border-white/10">Username</th>
              <th className="p-2 border-r border-white/10">Email</th>
              <th className="p-2 border-r border-white/10">Role</th>
              <th className="p-2 border-white/10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border">
                <td className="p-3 border-t border-r border-white/10 text-center">
                  {user.username}
                </td>
                <td className="p-3 border-t border-r border-white/10 text-center">
                  {user.email}
                </td>
                <td className="p-3 border-t border-r border-white/10 text-center">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="bg-gray-700  rounded p-2 "
                  >
                    <option value="guest">guest</option>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-3 border-t border-white/10 text-center">
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-500 rounded-lg p-2 text-white-500 hover:scale-110"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {[
          { label: "All", value: "all" },
          { label: "Local Playlists", value: "local" },
          { label: "Spotify Playlists", value: "spotify" },
          { label: "Albums", value: "albums" },
          { label: "Songs", value: "songs" },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setSelectedStat(value)}
            className={`px-4 py-1.5 text-sm rounded-full font-medium transition ${
              selectedStat === value
                ? "bg-white text-black shadow"
                : "bg-[#2a2a2a] text-white hover:bg-[#333]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {(selectedStat === "local" || selectedStat === "all") && (
        <>
          <h2 className="text-2xl text-center font-bold text-white mt-12 mb-7 border-b border-white/10 pb-1">
            Users by Local Playlists Created
          </h2>
          <div className="flex justify-center">
            <table className="min-w-[50%] max-w-[70%] border border-white/10 text-sm text-white bg-[#1a1a1a] rounded overflow-hidden shadow-md">
              <thead className="bg-[#2a2a2a] text-gray-300 uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-2 border-r border-white/10">Username</th>
                  <th className="p-2 border-r border-white/10">Email</th>
                  <th className="p-2 border-r border-white/10">
                    Local Playlists
                  </th>
                </tr>
              </thead>
              <tbody>
                {localPlaylistStats.map((user) => (
                  <tr key={user._id} className="border">
                    <td className="p-3 border-t border-r border-white/10 text-center">
                      {user.username}
                    </td>
                    <td className="p-3 border-t border-r border-white/10 text-center">
                      {user.email}
                    </td>
                    <td className="p-3 border-t border-white/10 text-center">
                      {user.playlistCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(selectedStat === "spotify" || selectedStat === "all") && (
        <>
          <h2 className="text-2xl text-center font-bold text-white mt-12 mb-7 border-b border-white/10 pb-1">
            Users by Spotify Playlists Created
          </h2>
          <div className="flex justify-center">
            <table className="min-w-[50%] max-w-[70%] border border-white/10 text-sm text-white bg-[#1a1a1a] rounded overflow-hidden shadow-md">
              <thead className="bg-[#2a2a2a] text-gray-300 uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-2 border-r border-white/10">Username</th>
                  <th className="p-2 border-r border-white/10">Email</th>
                  <th className="p-2 border-white-10">Spotify Playlists</th>
                </tr>
              </thead>
              <tbody>
                {spotifyPlaylistStats.map((user) => (
                  <tr key={user._id} className="border-white/10">
                    <td className="p-3 border-t border-r border-white/10 text-center">
                      {user.username}
                    </td>
                    <td className="p-3 border-t border-r border-white/10 text-center">
                      {user.email}
                    </td>
                    <td className="p-3 border-t border-r border-white/10 text-center">
                      {user.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(selectedStat === "albums" || selectedStat === "all") && (
        <>
          <h2 className="text-2xl text-center font-bold text-white mt-12 mb-7 border-b border-white/10 pb-1">
            Albums by Playlist Appearances
          </h2>
          <div className=" flex justify-center">
            <table className="min-w-[50%] border border-white/10 text-sm text-white bg-[#1a1a1a] rounded overflow-hidden shadow-md">
              {" "}
              <thead className="bg-[#2a2a2a] text-gray-300 uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-2 border-r border-white/10">Album</th>
                  <th className="p-2 border-white/10 ">Appearances</th>
                </tr>
              </thead>
              <tbody>
                {(showAllAlbums ? albumStats : albumStats.slice(0, 10)).map(
                  (album) => (
                    <tr key={album.id} className="border">
                      <td className="p-3 border-t border-r border-white/10 text-start">
                        {album.name || "Unknown Album"}
                      </td>
                      <td className="p-3 border-t border-r border-white/10 text-center">
                        {album.count}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center">
            <button
              className="mt-2 text-md font-semibold text-white-400 hover:underline"
              onClick={() => setShowAllAlbums((prev) => !prev)}
            >
              {showAllAlbums ? "Show less" : "See more"}
            </button>
          </div>
        </>
      )}

      {(selectedStat === "songs" || selectedStat === "all") && (
        <>
          <h2 className="text-2xl text-center font-bold text-white mt-12 mb-7 border-b border-white/10 pb-1">
            Songs by Playlist Appearances
          </h2>
          <div className="flex justify-center">
            <table className="w-auto border border-white/10 text-sm text-white bg-[#1a1a1a] rounded overflow-hidden shadow-md">
              <thead className="bg-[#2a2a2a] text-gray-300 uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-2 border-r border-white/10">Song</th>
                  <th className="p-2 border-r border-white/10">Artists</th>
                  <th className="p-2 border-r border-white/10">Appearances</th>
                </tr>
              </thead>
              <tbody>
                {(showAllSongs ? songStats : songStats.slice(0, 10)).map(
                  (song) => (
                    <tr key={song.uri} className="border-l border-r">
                      <td className="p-3 border-t border-r border-white/10 ">
                        {song.name}
                      </td>
                      <td className="p-3 border-t border-r border-white/10">
                        {song.artists?.map((a) => a.name).join(", ")}
                      </td>
                      <td className="p-3 border-t border-white/10 text-center">
                        {song.count}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center">
            <button
              className="mt-2 text-md font-semibold  text-white-400 hover:underline"
              onClick={() => setShowAllSongs((prev) => !prev)}
            >
              {showAllSongs ? "Show less" : "See more"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
