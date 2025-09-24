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

  // Reconcile persisted role with JWT on first load to avoid stale mixed roles
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) return;
      const [, payload] = storedToken.split(".");
      if (!payload) return;
      const decoded = JSON.parse(atob(payload));
      const roleFromToken = decoded?.role;

      if (roleFromToken === 'admin') {
        const storedAdmin = localStorage.getItem("admin");
        setAdmin(storedAdmin ? JSON.parse(storedAdmin) : { role: 'admin' });
        setJudge(null);
        localStorage.removeItem("judge");
      } else if (roleFromToken === 'judge') {
        const storedJudge = localStorage.getItem("judge");
        setJudge(storedJudge ? JSON.parse(storedJudge) : { role: 'judge' });
        setAdmin(null);
        localStorage.removeItem("admin");
      }
    } catch (error) {
      console.error("Error reconciling persisted role with JWT:", error);
      
    }
  }, []);


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