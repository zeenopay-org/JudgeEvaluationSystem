import React, { useContext, useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Dashboard/sidebar/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const { judge } = useContext(AuthContext);
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 80 : 256;

  // ✅ Detect screen resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Toggle sidebar only via hamburger
 const handleOpenSidebar = () => {
  if (isMobile) {
    setSidebarOpen((prev) => !prev); // toggle open/close
  }
};

  const handleCollapseToggle = () => {
    if (!isMobile) setSidebarCollapsed(!sidebarCollapsed);
  };

  // ✅ Prevent background scroll on mobile when sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobile, sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50 relative overflow-hidden">
      {/* ✅ Desktop Sidebar */}
      {!judge && !isMobile && sidebarOpen && (
        <div
          className="fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-40"
          style={{ width: sidebarWidth }}
        >
          <Sidebar
            isOpen={sidebarOpen}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleCollapseToggle}
          />
        </div>
      )}

      {/* ✅ Mobile Sidebar (under the fixed navbar) */}
      {/* ✅ Overlay for mobile when sidebar is open */}
{isMobile && sidebarOpen && (
  <div
    className="fixed inset-0 bg-black/30 z-[9997]"
    onClick={() => setSidebarOpen(false)}
  />
)}

{/* ✅ Mobile Sidebar */}
{isMobile && (
  <div
    className={`fixed top-0 left-0 h-full transform transition-transform duration-300 ease-in-out w-4/5 sm:w-2/3 md:w-1/2 z-[9998] ${
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    }`}
  >
    <Sidebar
      isOpen={sidebarOpen}
      collapsed={false}
      onToggleCollapse={handleCollapseToggle}
      isMobile={true}
    />
  </div>
)}

      {/* ✅ Main Content */}
      <div
        className="flex-1 min-w-0 pt-16 transition-all duration-300"
        style={{
          marginLeft:
            !judge && !isMobile && sidebarOpen ? `${sidebarWidth}px` : 0,
        }}
      >
        {/* ✅ Navbar (fixed only on mobile, above sidebar) */}
        <div
          className={`${
            isMobile
              ? "fixed top-0 left-0 w-full z-[10000]" // Navbar overlaps sidebar
              : "sticky top-0 z-[40]"
          }`}
        >
          <Navbar
            sidebarOpen={sidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            isMobile={isMobile}
            onOpenSidebar={handleOpenSidebar}
          />
        </div>

        <main className="p-4 md:p-6 transition-all duration-300">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
