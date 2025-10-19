import React, { useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const AdminSidebar = ({ expanded, setExpanded, isMobile }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const sidebarRef = useRef(null);

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/admin-layout/admin-dashboard', 
      icon: (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="6" height="10" rx="1" fill="#FF427A" />
            <rect x="3" y="15" width="6" height="6" rx="1" fill="#0075FF" />
            <rect x="11" y="11" width="6" height="10" rx="1" fill="#05CE91" />
            <rect x="11" y="3" width="6" height="6" rx="1" fill="#8675FF" />
          </svg>
        </div>
      )
    },

    { 
      name: 'Task Calendar', 
      path: '/admin-layout/admin-calendar', 
      icon: (
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="6" width="18" height="15" rx="2" fill="#0075FF" opacity="0.2" />
            <rect x="3" y="6" width="18" height="15" rx="2" stroke="#0075FF" strokeWidth="2" />
            <path d="M8 3V9" stroke="#0075FF" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 3V9" stroke="#0075FF" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 12H21" stroke="#0075FF" strokeWidth="2" strokeLinecap="round" />
            <rect x="7" y="14" width="4" height="2" rx="0.5" fill="#0075FF" />
            <rect x="13" y="14" width="4" height="2" rx="0.5" fill="#0075FF" />
            <rect x="7" y="17" width="4" height="2" rx="0.5" fill="#0075FF" />
            <rect x="13" y="17" width="4" height="2" rx="0.5" fill="#0075FF" />
          </svg>
        </div>
      ) 
    },

    { 
      name: 'Team Members', 
      path: '/admin-layout/admin-team-members', 
      icon: (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="4" fill="#5E397B" />
            <circle cx="16" cy="9" r="4" fill="#5E397B" />
            <path d="M21 18C21 21 16 20 16 20C16 20 16 16 16 15C16 14 17 14 17 14C19.5 14 21 15.5 21 18Z" fill="#5E397B" />
            <path d="M14 18C14 21 9 20 9 20C9 20 9 16 9 15C9 14 10 14 10 14C12.5 14 14 15.5 14 18Z" fill="#5E397B" />
          </svg>
        </div>
      )
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside 
      ref={sidebarRef}
      className={`bg-white border-r border-gray-200 h-full shadow-md transition-all duration-300 ease-in-out ${
        expanded ? 'w-60' : 'w-18'
      }`}
    >
      <div className={`py-6 ${expanded ? 'px-4' : 'px-0'}`}>
        <div 
          className="overflow-hidden transition-all duration-300 ease-in-out" 
          style={{ 
            maxHeight: expanded ? '40px' : '0',
            opacity: expanded ? 1 : 0,
            marginBottom: expanded ? '16px' : '0'
          }}
        >
          <h2 className="text-xl font-bold text-gray-700 px-2">
            Admin Menu
          </h2>
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center transition-all duration-300 ease-in-out ${
                  active 
                    ? `${expanded ? 'bg-blue-100 py-3 px-4 rounded-lg' : ''} text-blue-700`
                    : 'text-gray-600 hover:text-blue-600'
                } ${expanded ? 'mx-0 px-4 py-3' : 'mx-auto py-3'}`}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => {
                  if (isMobile) {
                    setExpanded(false);
                    localStorage.setItem('adminSidebarExpanded', 'false');
                  }
                }}
                end
              >
                <div className={`transform transition-transform duration-300 ${
                  hoveredItem === item.path ? 'scale-110' : 'scale-100'
                }`}>
                  {item.icon}
                </div>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap"
                  style={{
                    maxWidth: expanded ? '200px' : '0',
                    opacity: expanded ? 1 : 0,
                    marginLeft: expanded ? '12px' : '0'
                  }}
                >
                  <span className="font-medium">{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;