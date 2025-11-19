import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import {
  FaCalendarAlt,
  FaUserAlt,
  FaBalanceScale,
  FaPenAlt,
  FaBullseye,
  FaTrophy,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

const navItems = [
  { label: "Events", to: "/event", icon: <FaCalendarAlt /> },
  { label: "Contestants", to: "/contestant", icon: <FaUserAlt /> },
  { label: "Judges", to: "/judge", icon: <FaBalanceScale /> },
  { label: "Scores", to: "/scores", icon: <FaPenAlt /> },
  { label: "Rounds", to: "/round", icon: <FaBullseye /> },
  { label: "Title", to: "/title", icon: <FaTrophy /> },
];

const Sidebar = ({ isOpen, collapsed, onToggleCollapse }) => {
  const { judge, logout, admin } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const user = admin || judge;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (judge) return null;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-100 shadow-lg transition-all duration-300 ease-in-out`}
      style={{
        width: collapsed ? "80px" : "256px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-3 bg-green-900 relative">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded bg-green-200 flex items-center justify-center text-green-900 font-bold text-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6 hover:shadow-lg">
            Z
          </div>

          <span
            className={`text-white font-bold text-[17px] tracking-wide transition-all duration-300 origin-left ${
              collapsed
                ? "opacity-0 -translate-x-2 pointer-events-none"
                : "opacity-100 translate-x-0"
            }`}
          >
            ZeenoPay
          </span>
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-green-700 hover:bg-green-800 text-white rounded-full p-1.5 transition-all duration-300 shadow-lg border-2 border-gray-100 hover:scale-110 hover:shadow-xl active:scale-95"
          aria-label="Toggle sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transform transition-transform duration-300 ${
              collapsed ? "rotate-0" : "rotate-180"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={collapsed ? "M9 5l7 7-7 7" : "M6 18L18 6M6 6l12 12"}
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-3">
        <ul
          className={`flex flex-col transition-all duration-300 ${
            collapsed
              ? "items-center space-y-3 py-3"
              : "items-start space-y-1 py-2 px-2"
          }`}
        >
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <li key={item.to} className="w-full">
                <Link
                  to={item.to}
                  className={`group relative flex items-center transition-all duration-300 rounded-md transform hover:scale-105 active:scale-95
                   ${
                     collapsed
                       ? "w-full h-12 flex items-center justify-start pl-5"
                       : "w-full h-12 flex items-center justify-start gap-3 pl-4 pr-2"
                   }
                    ${
                      active
                        ? "text-green-800 bg-green-100 shadow-md"
                        : "text-gray-600 hover:bg-green-50 hover:text-green-700 hover:shadow-sm"
                    }
                  `}
                >
                  <span
                    className={`absolute left-0 top-0 h-full w-[3px] rounded-r-full bg-green-700 transition-all duration-300 ${
                      active
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-0 group-hover:opacity-60 group-hover:scale-y-75"
                    }`}
                  />
                  <span
                    className={`flex items-center justify-center text-[18px] w-6 h-6 mr-0.5 transition-all duration-300 ${
                      active
                        ? "text-green-800 scale-110"
                        : "group-hover:text-green-700 group-hover:scale-110"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`ml-2 text-sm font-medium whitespace-nowrap transition-all duration-300 origin-left ${
                      collapsed
                        ? "opacity-0 -translate-x-3 pointer-events-none"
                        : "opacity-100 translate-x-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Footer Section */}
      <div className="mt-auto border-t border-gray-200">
        {/* User Profile */}
        <div
          className={`p-3 border-b border-gray-200 transition-all duration-300 hover:bg-gray-50 ${
            collapsed ? "px-2" : "px-3"
          }`}
        >
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-start gap-3"
            }`}
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg hover:ring-2 hover:ring-green-300">
                {user?.name?.charAt(0) || <FaUserCircle className="text-lg" />}
              </div>
            </div>
            <div
              className={`transition-all duration-300 overflow-hidden ${
                collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              }`}
            >
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.role || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "No Email"}
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-2 space-y-1">
          <button
            onClick={handleLogout}
            className={`group w-full flex items-center rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-md
              ${
                collapsed
                  ? "justify-center h-10"
                  : "justify-start gap-3 h-10 px-3"
              }
              text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100`}
          >
            <span className="flex items-center justify-center text-[16px] w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12">
              <FaSignOutAlt />
            </span>
            <span
              className={`text-sm font-medium whitespace-nowrap transition-all duration-300 origin-left ${
                collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              }`}
            >
              Logout
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-3 py-3 bg-gray-50 border-t border-gray-200">
          <div
            className={`text-center transition-all duration-300 ${
              collapsed
                ? "opacity-0 h-0 pointer-events-none"
                : "opacity-100 h-auto"
            }`}
          >
            <p className="text-xs text-gray-500 mb-1 transition-colors duration-300 hover:text-gray-700">
              © {new Date().getFullYear()} ZeenoPay
            </p>
            <p className="text-[10px] text-gray-400 transition-colors duration-300 hover:text-gray-600">
              v{"1.0.0"}
            </p>
          </div>
          <div
            className={`text-center transition-all duration-300 ${
              collapsed ? "opacity-100" : "opacity-0 h-0 pointer-events-none"
            }`}
          >
            <p className="text-xs text-gray-500">©</p>
          </div>
        </div>
      </div>

      
    </aside>
  );
};

export default Sidebar;