import React, { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

import "./login.css";

const Login = () => {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login, token } = useContext(AuthContext);

 useEffect(() => {
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    navigate("/", { replace: true });
  }
}, [navigate]);

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    // Email validation
    if (!email) {
      formErrors.email = "email is required";
      isValid = false;
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!password) {
      formErrors.password = "password is required";
      isValid = false;
    } else if (password.length < 4) {
      formErrors.password = "password must be at least 8 characters";
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      formErrors.password =
        "Password must be at least 8 characters, include 1 uppercase letter , 1 number and 1 special character";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Try admin login first
      let response = await fetch("http://localhost:5000/api/v1/users/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      let isAdmin = false;

      if (response.ok) {
        const possibleAdmin = await response.json();
        // Only accept as admin if role is actually 'admin'
        if (possibleAdmin?.admin?.role === 'admin') {
          data = possibleAdmin;
          isAdmin = true;
        } else {
          // Fall back to judge login if role is not admin
          response = await fetch("http://localhost:5000/api/v1/judges/signin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Invalid credentials");
          }
          data = await response.json();
          isAdmin = false;
        }
      } else {
        // If admin login fails, try judge login
        response = await fetch("http://localhost:5000/api/v1/judges/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Invalid credentials");
        }
        data = await response.json();
        isAdmin = false;
      }

      // Debug: Log the full response data
      console.log("Full response data:", data);
      console.log("isAdmin flag:", isAdmin);

      // Save token and user info to context
      if (isAdmin) {
        login({ admin: data.admin, token: data.token });
        console.log("Admin data on login:", data.admin);
      } else {
        login({ judge: data.judge, token: data.token });
        console.log("Judge data on login:", data.judge);
      }

      setEmail("");
      setPassword("");
      navigate("/",{ replace: true });
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: error.message });
    }
  };

  return (
    <div className="login-container">
      {/* Left Column */}
      <div className="left-panel">
        <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
        <p className="mb-6 text-lg">
          Access your real-time merchant dashboard with lightning-fast updates
        </p>
        <ul className="space-y-4 list-disc pl-5">
          <li>0.25s Real-Time Updates</li>
          <li>Complete Transparency</li>
          <li>99.99% Uptime Guarantee</li>
          <li>AI-Enhanced Management</li>
        </ul>
        <div className="mt-10 text-sm space-y-1">
          <p>Access Anywhere, Anytime</p>
          <p>
            Download our mobile app for real-time event management on the go
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="right-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-2 text-center">Welcome Back</h2>
          <p className="text-center mb-6 text-gray-600">
            Sign in to your real-time merchant dashboard
          </p>

          <div className="mb-4">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="text"
              placeholder="Enter your emailaddress"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-2 password-field">
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <input
              id="password"
              type={visible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="toggle-visibility text-gray-500"
              aria-label={visible ? "Hide password" : "Show password"}
            >
              <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} />
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex justify-end mb-4">
            <a href="#">Forgot Password?</a>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <button className="font-bold" type="submit">
            Sign In
          </button>
          <div className="form-divider"></div>
          <p className="copyright">© 2025 ZeenoPay. All rights reserved.</p>
        </form>
      </div>
    </div>
  );
};

export default Login;
