import axios from "axios";

// ✅ SAFE + PRODUCTION READY BASE URL
const getApiBaseUrl = () => {
  const defaultApiUrl = "https://erp-management-system-7zgh.onrender.com/api";
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (!envUrl) {
    return defaultApiUrl;
  }

  if (typeof window !== "undefined") {
    const currentOrigin = window.location.origin;
    if (envUrl === currentOrigin || envUrl === `${currentOrigin}/`) {
      return defaultApiUrl;
    }
  }

  return `${envUrl.replace(/\/$/, "")}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// 🔐 Get token from localStorage safely
const getStoredToken = () => {
  const userInfo = localStorage.getItem("userInfo");

  if (!userInfo) return null;

  try {
    const parsed = JSON.parse(userInfo);
    return parsed?.token || null;
  } catch (error) {
    localStorage.removeItem("userInfo");
    return null;
  }
};

// 🌐 Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 🔐 Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ❌ Unified error handler
export const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong";

export default api;