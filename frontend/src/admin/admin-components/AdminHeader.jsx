import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, Bell } from 'lucide-react';

const AdminHeader = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (toggleSidebar) toggleSidebar();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = (e) => {
    if (!e.target.closest('.dropdown-container')) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('click', closeDropdown);
    }
    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('session_id');
      sessionStorage.removeItem('session_id');
      localStorage.removeItem('userType');
      sessionStorage.removeItem('userType');
      window.location.href = '/';
    }
  };
  return (
    <header className="bg-white w-full border-b border-gray-200 shadow-sm h-16">
      <div className="flex justify-between items-center h-full px-4">
        <div className="flex items-center">
          <button 
            onClick={handleToggleSidebar}
            className="text-gray-600 hover:text-blue-600 focus:outline-none mr-4"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          
          <div className="font-bold text-xl text-blue-600 flex items-center">
            <svg
              className="w-8 h-8 mr-2 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 2a4 4 0 100 8 4 4 0 000-8zm-6 9a6 6 0 1112 0v1a1 1 0 11-2 0v-1a4 4 0 10-8 0v1a1 1 0 11-2 0v-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden sm:inline">Admin Portal</span>
          </div>
        </div>

        {/* Right side - Navigation and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <span className="sr-only">View notifications</span>
            <Bell size={20} />
          </button>

          {/* User Menu */}
          <div className="relative dropdown-container">
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
              onClick={toggleDropdown}
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                A
              </div>
              <div className="hidden md:block text-sm font-medium">Admin</div>
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-10">
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                  admin@gmail.com
                </div> 

                <button 
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <svg 
                    className="mr-2 w-4 h-4" 
                    width="24" height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#FF427A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="#FF427A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="#FF427A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;