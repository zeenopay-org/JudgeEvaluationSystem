import React, { useContext, useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Dashboard/sidebar/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // default open on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 540);
  const { judge } = useContext(AuthContext);
  const location = useLocation();

  const sidebarWidth = sidebarCollapsed ? 80 : 256;

  // Track screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 540);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set initial sidebar state once
  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 540);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={!judge && sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div
        className="flex-1 min-w-0 pt-16 transition-all duration-300"
        style={{
          marginLeft: !judge && sidebarOpen ? `${sidebarWidth}px` : 0,
        }}
      >
        <Navbar
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Overlay for mobile */}
        {!judge && isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Page content */}
        <main className="p-4 md:p-6 transition-all duration-300">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;