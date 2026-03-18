import React, { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

const AuthContext = createContext();

const getStoredUserInfo = () => {
  const saved = localStorage.getItem("userInfo");

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.removeItem("userInfo");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(getStoredUserInfo);
  const [loading, setLoading] = useState(true);

  const login = (data) => {
    setUserInfo(data);
    localStorage.setItem("userInfo", JSON.stringify(data));
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem("userInfo");
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        if (!userInfo?.token) {
          setLoading(false);
          return;
        }

        const { data } = await api.get("/me");

        const updatedUserInfo = {
          token: userInfo.token,
          user: data.user,
        };

        setUserInfo(updatedUserInfo);
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [userInfo?.token]);

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        setUserInfo,
        login,
        logout,
        loading,
        isAuthenticated: !!userInfo?.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);