import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [admin, setAdmin] = useState(() => {
    try {
      const storedAdmin = localStorage.getItem("admin");
      return storedAdmin ? JSON.parse(storedAdmin) : null;
    } catch {
      return null;
    }
  });
  const [judge, setJudge] = useState(() => {
    try {
      const storedJudge = localStorage.getItem("judge");
      return storedJudge ? JSON.parse(storedJudge) : null;
    } catch {
      return null;
    }
  });

  // ✅ AUTO LOGOUT when token expires
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = () => {
      try {
        const decoded = jwtDecode(token); // <-- jwt-decode automatically parses the payload
        const exp = decoded.exp * 1000;

        if (Date.now() >= exp) {
          handleLogout();
          navigate("/login");
        }
      } catch (err) {
        handleLogout();
        navigate("/login");
      }
    };

    // Run immediately and every 5 seconds
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 5000);

    return () => clearInterval(interval);
  }, [token, navigate]);

  // ✅ Sync role with token
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) return;
      const decoded = jwtDecode(storedToken);
      const role = decoded?.role;

      if (role === "admin") {
        const storedAdmin = localStorage.getItem("admin");
        setAdmin(storedAdmin ? JSON.parse(storedAdmin) : { role: "admin" });
        setJudge(null);
        localStorage.removeItem("judge");
      } else if (role === "judge") {
        const storedJudge = localStorage.getItem("judge");
        setJudge(storedJudge ? JSON.parse(storedJudge) : { role: "judge" });
        setAdmin(null);
        localStorage.removeItem("admin");
      }
    } catch (error) {
      console.error("Error syncing role:", error);
    }
  }, []);

  // ✅ Persist to localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (admin) localStorage.setItem("admin", JSON.stringify(admin));
    else localStorage.removeItem("admin");

    if (judge) localStorage.setItem("judge", JSON.stringify(judge));
    else localStorage.removeItem("judge");
  }, [token, admin, judge]);

  // ✅ Login function
  const handleLogin = (data) => {
    setToken(data.token);
    if (data.admin) {
      setAdmin(data.admin);
      setJudge(null);
    } else if (data.judge) {
      setJudge(data.judge);
      setAdmin(null);
    }
  };

  // ✅ Logout function
  const handleLogout = () => {
    setToken(null);
    setAdmin(null);
    setJudge(null);
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("judge");
  };

  return (
    <AuthContext.Provider
      value={{ token, admin, judge, login: handleLogin, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
