import axios from "axios";

// ✅ SAFE FALLBACK ADDED
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://erp-management-system-7zgh.onrender.com";

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

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

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

export const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong";

export default api;