import React, { useContext, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Dashboard/sidebar/Sidebar";
import { AuthContext } from "../../context/AuthContext";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { admin, judge } = useContext(AuthContext);

  return (
    <div className="bg-gray-50 flex min-h-screen">
      {/* ✅ Sidebar only for admin */}
      {!judge && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* ✅ Main section (Navbar + Content) */}
      <div
        className={`flex-1 min-w-0 pt-16 transition-all duration-300 ${
          !judge && sidebarOpen ? "md:ml-64" : ""
        }`}
      >
        {/* Navbar (always visible for both admin and judge) */}
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          showHamburger={!judge && !sidebarOpen} // hide hamburger for judge
          sidebarOpen={sidebarOpen}
        />

        {/* Mobile overlay for sidebar (admin only) */}
        {!judge && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <main className="p-2 md:p-4">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
