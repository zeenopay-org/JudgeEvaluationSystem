import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onOpenSidebar, sidebarOpen, sidebarCollapsed, isMobile }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { admin, judge, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Compute left offset for main navbar
  // If judge is logged in, navbar should span full width
  const leftOffset = judge ? 0 : !sidebarOpen ? 0 : sidebarCollapsed ? 80 : 256;

  return (
    <nav
      className="bg-green-900 shadow-md fixed top-0 right-0 h-16 flex items-center justify-between px-4 md:px-6 z-[60] transition-all duration-300 ease-in-out"
      style={{
        left: isMobile ? 0 : `${leftOffset}px`,
        width: isMobile
          ? "100%"
          : judge
          ? "100%"
          : `calc(100% - ${leftOffset}px)`,
        marginLeft: 0,
      }}
    >
      {/* Left side: Hamburger or Title */}
      {/* Left side: Hamburger or Title */}
      <div className="flex items-center space-x-3 md:space-x-6 transition-all duration-300">
        {/* Hamburger Toggle — always visible on mobile */}
        {!judge && (
          <button
            onClick={onOpenSidebar}
            className="text-white focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        {/* Time Display */}
        <span className="text-white font-mono text-sm">{formattedTime}</span>
      </div>

      {/* Right side: Profile */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-green-800 transition"
        >
          <span className="text-white text-sm md:text-base">
            Welcome,&nbsp;
            <span className="text-white font-semibold">
              {(admin?.email || judge?.email)?.split("@")[0]}
            </span>
          </span>
          <svg
            className="w-4 h-4 text-gray-600 transition-transform duration-200"
            style={{
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
            <a
              href="/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              View Details
            </a>
            <button
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
