import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";

const Topbar = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-user-name">
          {userInfo?.user?.name || "User"}
        </div>
        <div className="topbar-user-role">
          {userInfo?.user?.role || "Role"}
        </div>
      </div>

      <div className="topbar-actions">
        <button type="button" className="secondary-btn" onClick={toggleTheme}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        <button type="button" className="delete-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;