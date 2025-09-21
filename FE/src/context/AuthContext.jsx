import { createContext, useState, useEffect } from "react";

// Create context
export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [admin, setAdmin] = useState(() => {
    try {
      const storedAdmin = localStorage.getItem("admin");
      return storedAdmin ? JSON.parse(storedAdmin) : null;
    } catch (error) {
      return null;
    }
  });
  const [judge, setJudge] = useState(() => {
    try {
      const storedJudge = localStorage.getItem("judge");
      return storedJudge ? JSON.parse(storedJudge) : null;
    } catch (error) {
      return null;
    }
  });


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

    if (judge) {
      localStorage.setItem("judge", JSON.stringify(judge));
    } else {
      localStorage.removeItem("judge");
    }
  }, [token, admin, judge]);

  // Login function (save token + admin/judge)
  const login = (data) => {
    setToken(data.token);
    if (data.admin) {
      setAdmin(data.admin);
      setJudge(null); // Clear judge if admin login
    } else if (data.judge) {
      setJudge(data.judge);
      setAdmin(null); // Clear admin if judge login
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setAdmin(null);
    setJudge(null);
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("judge");
  };

  return (
    <AuthContext.Provider value={{ token, admin, judge, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};