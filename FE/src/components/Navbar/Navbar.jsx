import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onOpenSidebar, showHamburger }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login",{ replace: true });
  };

  return (
    <nav className="bg-green-900 shadow-md px-4 md:px-6 h-16 flex justify-between items-center sticky top-0 z-30">
      {/* Left: Logo + Links */}
      <div className="flex items-center space-x-3 md:space-x-6">
        {showHamburger && (
          <button
            className="inline-flex items-center justify-center h-10 w-10 rounded hover:bg-blue-700/40 focus:outline-none"
            aria-label="Open sidebar"
            onClick={onOpenSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {/* Links (collapse into hamburger on close via sidebar state in parent) */}
        {/* <a href="/" className="text-white hover:text-gray-200 hidden sm:inline">
          Home
        </a>
        <a href="#" className="text-white hover:text-gray-200 hidden sm:inline">
          About
        </a>
        <a href="#" className="text-white hover:text-gray-200 hidden sm:inline">
          Contact
        </a> */}
      </div>

      {/* Right: Welcome + Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
        >
          <span className="text-gray-700">Welcome {admin?.email}</span>
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
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
