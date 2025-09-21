import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Events', to: '/event', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M6.75 3A.75.75 0 0 0 6 3.75V5H4.5A2.25 2.25 0 0 0 2.25 7.25v10.5A2.25 2.25 0 0 0 4.5 20h15a2.25 2.25 0 0 0 2.25-2.25V7.25A2.25 2.25 0 0 0 19.5 5H18V3.75a.75.75 0 0 0-1.5 0V5H7.5V3.75A.75.75 0 0 0 6.75 3ZM3.75 9h16.5v8.75a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75V9Z" />
    </svg>
  ) },
  { label: 'Contestants', to: '/contestant', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M16.5 7.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
      <path d="M3.75 20.25a8.25 8.25 0 1 1 16.5 0v.75H3.75v-.75Z" />
    </svg>
  ) },
  { label: 'Judges', to: '/judges', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M16.5 7.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
      <path d="M3.75 20.25a8.25 8.25 0 1 1 16.5 0v.75H3.75v-.75Z" />
    </svg>
  ) },
  { label: 'Scores', to: '/scores', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M3 3.75A.75.75 0 0 1 3.75 3h16.5a.75.75 0 0 1 .75.75v16.5a.75.75 0 0 1-1.28.53L15 16.06l-4.47 4.72a.75.75 0 0 1-1.06 0L3.53 14.84A.75.75 0 0 1 3 14.31V3.75Z" />
    </svg>
  ) },
  { label: 'Rounds', to: '/rounds', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75Zm0 5.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Z" />
    </svg>
  ) },
  { label: 'Questions', to: '/questions', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 3.75a6.25 6.25 0 0 0-6.25 6.25.75.75 0 0 0 1.5 0 4.75 4.75 0 1 1 6.87 4.27c-.77.35-1.12.86-1.12 1.48v.25a.75.75 0 0 0 1.5 0v-.08c0-.06.03-.11.12-.15A6.25 6.25 0 0 0 12 3.75Zm0 15.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" />
    </svg>
  ) },
  { label: 'Title', to: '/title', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M8.25 3.75A.75.75 0 0 1 9 3h6a.75.75 0 0 1 .75.75v3.5a3.75 3.75 0 1 1-7.5 0v-3.5ZM6 3.75A2.25 2.25 0 0 1 8.25 1.5h7.5A2.25 2.25 0 0 1 18 3.75v3.5a5.25 5.25 0 1 1-10.5 0v-3.5ZM6 20.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75Z" />
    </svg>
  ) },
  { label: 'TitleAssignments', to: '/titleassignments', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 2.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5Z" />
      <path d="M8.25 14.25a.75.75 0 0 0-.69 1.03l2 5a.75.75 0 0 0 1.17.32l2.27-1.7 2.28 1.7a.75.75 0 0 0 1.17-.32l2-5a.75.75 0 0 0-.69-1.03h-9.51Z" />
      <path d="M12 6.75l.9 1.83 2.02.29-1.46 1.42.35 2-1.81-.95-1.81.95.35-2L9.08 8.87l2.02-.29L12 6.75Z" />
    </svg>
  ) },

]

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  return (
    <aside
      className={`
        bg-gray-50 border-r border-gray-200 w-64
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-40 shadow-lg flex flex-col h-screen
      `}
      aria-label="Sidebar"
    >
      <div className="flex items-center  bg-green-900 justify-between h-16 px-4 md:px-6 border-b">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded bg-green-200" />
          <div className="flex flex-items-end text-white font-bold  px-4 py-4">
            ZeenoPay
          </div>
        </div>
        <button
          className="inline-flex items-center justify-center h-9 w-9 rounded hover:bg-gray-100"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="white" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="px-3 py-4 overflow-y-auto">
        <div className="grid grid-cols-1 gap-3">
          {navItems.map(item => {
            const active = location.pathname.startsWith(item.to)
            return (
              <Link key={item.to} to={item.to}>
                <div
                  className={`
                    group flex items-center justify-between rounded-2xl
                    ${active ? 'bg-white ring-1 ring-green-800 shadow-md' : 'bg-white ring-1 ring-gray-200 shadow-sm hover:shadow-lg hover:ring-gray-300'}
                    px-4 py-3 transition-all duration-200
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${active ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600'} transition-colors`}>
                    {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${active ? 'text-green-700' : 'text-gray-800'}`}>{item.label}</span>
                      <span className="text-xs text-gray-500">Manage {item.label.toLowerCase()}</span>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-5 w-5 ${active ? 'text-green-700' : 'text-gray-300 group-hover:text-gray-400'} transition-colors`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar


