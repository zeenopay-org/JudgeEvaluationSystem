import { createContext, useState, useEffect } from "react";

// Create context
export const AuthContext = createContext();

// Provider component paxi main file ma halna prxa
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [admin, setAdmin] = useState(() => JSON.parse(localStorage.getItem("admin")) || null);

  // token lai ra admin lai save grne localStorage ma whenever they change
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (admin) {
      localStorage.setItem("admin", JSON.stringify(admin));
    } else {
      localStorage.removeItem("admin");
    }
  }, [token, admin]);

  // Login function (save token + admin)
  const login = (data) => {
    setToken(data.token);
    setAdmin(data.admin);
  };

  // Logout ko lagy function (sav clear hanxa)
  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
  };

  return (
    <AuthContext.Provider value={{ token, admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};