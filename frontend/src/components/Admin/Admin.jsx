import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Admin = () => {
  console.log("🧠 Admin component mounted");

  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await axios.get("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Logged-in user:", res.data.user);

        if (res.data.user.role !== "admin") {
          return navigate("/unauthorized");
        }

        setIsAuthorized(true);
        fetchUsers(token);
      } catch (err) {
        console.error("Authorization failed", err);
        navigate("/login");
      }
    };

    checkAdmin();
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const res = await axios.get("/admin/users", {
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
      await axios.delete(`/admin/user/${id}`, {
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
        `/admin/user/${id}/role`,
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

  if (isAuthorized === null) return <p>Loading...</p>; // optional loader
  if (!isAuthorized) return null; // avoid flicker

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Username</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border">
              <td className="p-2 border">{user.username}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  className="border rounded px-1 py-0.5"
                >
                  <option value="guest">guest</option>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="p-2 border">
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(user._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
