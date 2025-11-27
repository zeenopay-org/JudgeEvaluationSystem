import React, { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import banner from "../../assets/peagent.jpg";
import DOMPURIFY from "dompurify";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";
  // const BACKEND_URL = "http://localhost:5000/api/v1";

const Login = () => {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const sanitizeInput = (value) => {
    return DOMPURIFY.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  };

  const validateForm = () => {
    const cleanEmail = sanitizeInput(email).trim();

    if (!cleanEmail || !password) {
      toast.error("Fields are required");
      return false;
    }

    // if (password.length < 8) {
    //   toast.error("Password must be at least 8 characters long");
    //   return false;
    // }

    // const passwordRegex =
    //   /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    // if (!passwordRegex.test(password)) {
    //   toast.error(
    //     "Password must include 1 lowercase letter, 1 number, and 1 special character"
    //   );
    //   return false;
    // }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return cleanEmail;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = validateForm();
    
    if (!cleanEmail) return;
    if (!agree) {
      toast.error("You must agree to the terms of service before signing in");
      return;
    }

    try {
      let response = await fetch(`${BACKEND_URL}/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      let data;

      let isAdmin = false;

      if (response.ok) {
        const possibleAdmin = await response.json();
        if (possibleAdmin?.admin?.role === "admin") {
          data = possibleAdmin;
          isAdmin = true;
        } else {
          response = await fetch(`${BACKEND_URL}/judges/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Invalid judge credentials");
          }

          data = await response.json();
        }
      } else {
        response = await fetch(`${BACKEND_URL}/judges/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Invalid credentials");
        }

        data = await response.json();
      }

      if (isAdmin) {
        login({ admin: data.admin, token: data.token });
        toast.success("Admin login successful");
      } else {
        login({ judge: data.judge, token: data.token });
        toast.success("Judge login successful");
      }

      setEmail("");
      setPassword("");
      navigate("/event", { replace: true });
    } catch (error) {
      const safeMessage = DOMPURIFY.sanitize(error.message || "login failed", {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
      toast.error(safeMessage);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[100dvh] bg-green-700 overflow-hidden">
      {/* Left: Banner Image (Top on Mobile) */}
      <div className="w-full lg:w-2/3 h-56 sm:h-72 md:h-96 lg:h-auto relative">
        <img
          src={banner}
          alt="Judging Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/3 bg-white px-6 sm:px-10 lg:px-16 py-10 lg:py-0">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 flex flex-col justify-center"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-gray-500 text-sm">
              Smart, swift, and transparent judging — redefined. Login to
              elevate your judging experience.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              E-mail Address:
            </label>
            <input
              type="text"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-gradient-to-b from-gray-50 to-gray-100 
              text-gray-800 shadow-sm border border-gray-200 
              focus:outline-none focus:ring-2 focus:ring-green-300 
              transition duration-200 placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Password:
            </label>
            <input
              id="password"
              type={visible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 pr-10 bg-gradient-to-b from-gray-50 to-gray-100
              text-gray-800 shadow-sm border border-gray-200
              focus:outline-none focus:ring-2 focus:ring-green-300
              transition duration-200 placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition"
            >
              <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} />
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-500">
              I agree to the terms of service
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white font-semibold py-2.5 rounded-lg 
            hover:bg-green-800 transition duration-200"
          >
            Sign In
          </button>

          <p className="text-center text-green-900 text-xs mt-6">
            © 2025 ZeenoPay. All rights reserved.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
