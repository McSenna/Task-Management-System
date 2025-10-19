import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import useNotifications from './hooks/useNotifications';
import ToastNotifications from './components/ToastNotifications';
import ProfileModal from './components/ProfileModal';

const UserLayout = () => {
  const savedSidebarState = localStorage.getItem('sidebarExpanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    savedSidebarState !== null ? JSON.parse(savedSidebarState) : true
  );
  const [isMobile, setIsMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);

  const { notifications, unread, markRead, markAllRead, toasts, removeToast } = useNotifications(20000);

  const toggleSidebar = () => {
    const newState = !sidebarExpanded;
    setSidebarExpanded(newState);
    localStorage.setItem('sidebarExpanded', JSON.stringify(newState));
  };

  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(sidebarExpanded));
  }, [sidebarExpanded]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      
      if (isMobileView) {
        setSidebarExpanded(false);
        localStorage.setItem('sidebarExpanded', 'false');
      }
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-20">
        <Header 
          toggleSidebar={toggleSidebar}
          notifications={notifications}
          unread={unread}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onOpenProfile={(user) => { setProfileUser(user); setProfileOpen(true); }}
        />
      </div>
      
      <div className="flex flex-grow relative">
        <div 
          className={`fixed left-0 top-16 h-[calc(100vh-64px)] z-10 transition-all duration-300 ease-in-out
            ${isMobile ? 
              (sidebarExpanded ? 'translate-x-0' : '-translate-x-full') : 
              'translate-x-0'}`}
          style={{ width: sidebarExpanded ? '240px' : '72px' }}
        >
          <Sidebar 
            expanded={sidebarExpanded} 
            setExpanded={setSidebarExpanded} 
            isMobile={isMobile} 
          />
        </div>
        
        <main 
          className="flex-grow transition-all duration-300 ease-in-out min-h-[calc(100vh-64px)]"
          style={{ 
            marginLeft: isMobile ? 0 : (sidebarExpanded ? '240px' : '72px'),
            width: isMobile ? '100%' : `calc(100% - ${sidebarExpanded ? '240px' : '72px'})`
          }}
        >
          <div className="content-container w-full h-full p-4">
            <Outlet />
          </div>
        </main>
      </div>

      {isMobile && sidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-5"
          onClick={() => {
            setSidebarExpanded(false);
            localStorage.setItem('sidebarExpanded', 'false');
          }}
        />
      )}
      
      <ToastNotifications toasts={toasts} onClose={removeToast} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} user={profileUser} />
    </div>
  );
};

export default UserLayout;