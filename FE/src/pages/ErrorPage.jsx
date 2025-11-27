import React, { useState, useEffect } from "react";
import { FaExclamationCircle, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [rotation, setRotation] = useState(0);
  const navigate = useNavigate();

  // Show content with fade-in and animate background rotation
  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-500 to-green-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0">
        <div
          className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        <div
          className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48"
          style={{ transform: `rotate(${-rotation}deg)` }}
        />
      </div>

      {/* Main card */}
      <div
        className={`relative z-10 max-w-2xl w-full transition-all duration-1000 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-white/20 p-6 rounded-full">
                <FaExclamationCircle className="w-16 h-16 text-white animate-bounce" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <h1 className="text-center text-8xl md:text-9xl font-bold text-white/90 mb-4">
            404
          </h1>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-white/80 text-lg md:text-xl max-w-md mx-auto">
              The page you're looking for seems to have wandered off into the
              digital void.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick= {()=> navigate("/login")}className="group flex items-center gap-2 bg-white text-green-900 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl w-full sm:w-auto justify-center">
              <FaHome className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              Back To Home
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Error Code: 404 | Need help?{" "}
              <span className="text-white underline cursor-pointer hover:text-white/80 transition-colors">
                Contact Support
              </span>
            </p>
          </div>
        </div>

        {/* Floating glow elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/20 rounded-full blur-xl animate-pulse" />
        <div
          className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
    </div>
  );
}
