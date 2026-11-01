import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  // On app startup, check the saved token and restore the user session.
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("divineDarshanToken");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem("divineDarshanToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("divineDarshanToken", data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, mobile, password) => {
    const { data } = await api.post("/auth/register", { name, email, mobile, password });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("divineDarshanToken");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
