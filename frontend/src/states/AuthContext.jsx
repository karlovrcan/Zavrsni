import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("auth_token") || "");

  useEffect(() => {
    console.log("AuthContext - Token Found:", token);

    if (!token) {
      console.log("AuthContext - No token, user remains null.");
      return;
    }

    const fetchUser = async () => {
      try {
        console.log("AuthContext - Fetching user with token:", token);

        const response = await fetch("http://localhost:5001/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        console.log("AuthContext - API Response:", data);

        if (data.success) {
          console.log("AuthContext - Setting user:", data.user);
          setUser(data.user); // ✅ This should update user
        } else {
          console.warn("AuthContext - User fetch failed:", data.message);
          setUser(null);
          localStorage.removeItem("auth_token");
        }
      } catch (error) {
        console.error("AuthContext - Error fetching user:", error);
        setUser(null);
        localStorage.removeItem("auth_token");
      }
    };

    fetchUser();
  }, [token]);

  const login = (newToken) => {
    console.log("AuthContext - Setting new token:", newToken);
    localStorage.setItem("auth_token", newToken); // ✅ Save token
    setToken(newToken); // ✅ Update state
  };

  const logout = () => {
    console.log("AuthContext - Logging out, removing token.");
    localStorage.removeItem("auth_token");
    setUser(null);
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
