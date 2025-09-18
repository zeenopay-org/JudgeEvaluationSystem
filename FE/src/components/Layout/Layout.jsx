import React from 'react'
import Navbar from '../Navbar/Navbar'
import Sidebar from '../Dashboard/sidebar/Sidebar'
import { useState } from 'react'


const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="bg-gray-50 flex">
      {/* Sidebar on the very left from top to bottom */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Right side: navbar and content */}
      <div className={`flex-1 min-w-0 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        <div className={`${sidebarOpen ? 'md:ml-0' : ''}`}>
          <Navbar onOpenSidebar={() => setSidebarOpen(true)} showHamburger={!sidebarOpen} />
        </div>
        {/* No floating toggle; hamburger renders inside Navbar when sidebar is closed */}
        
        {/* Overlay for mobile only when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Page content */}
        <main className="p-2 md:p-4">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
export default Layout
