import React, { useContext, useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Dashboard/sidebar/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);  // Sidebar visibility (for mobile)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);  // Sidebar collapse state
  const { judge } = useContext(AuthContext);
  const location = useLocation();

  const sidebarWidth = sidebarCollapsed ? 80 : 256;

  // Auto-open sidebar for small screens when navigating (if mobile)
  useEffect(() => {
    if (window.innerWidth < 540) {
      setSidebarOpen(true);  // Automatically open the sidebar on mobile
    }
  }, [location]);

  // Handle screen resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 540) {
        setSidebarOpen(true);  // Automatically open sidebar on larger screens
      } else {
        setSidebarOpen(false); // Collapse sidebar on small screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();  // Run on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for admin */}
      {!judge && (
        <Sidebar
          isOpen={sidebarOpen} // Sidebar visibility
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main content */}
      <div
        className="flex-1 min-w-0 pt-16 transition-all duration-300"
        style={{
          marginLeft: !judge && sidebarOpen ? `${sidebarWidth}px` : 0,  // Set content margin based on sidebar visibility
        }}
      >
        <Navbar
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          onOpenSidebar={() => setSidebarOpen(true)}  // Open the sidebar when clicking hamburger
        />

        {/* Overlay for mobile */}
        {!judge && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}  // Close sidebar on overlay click
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
