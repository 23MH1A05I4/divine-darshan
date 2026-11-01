import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Attach the saved token (if any) to every outgoing request.
// This is what allows the user to stay logged in across page refreshes.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("divineDarshanToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
