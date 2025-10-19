import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ 
  isAuthenticated, 
  authType, 
  redirectPath = '/',
  children 
}) => {
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (authType && authType !== 'both') {
    const userType = localStorage.getItem('userType') || sessionStorage.getItem('userType');
    
    if (userType !== authType) {
      return <Navigate to={userType === 'admin' ? '/admin-layout' : '/user-layout'} replace />;
    }
  }
  
  return children ? children : <Outlet />;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const hasSessionId = localStorage.getItem('session_id') || sessionStorage.getItem('session_id');
      const type = localStorage.getItem('userType') || sessionStorage.getItem('userType');
      
      setIsAuthenticated(hasSessionId === 'active');
      setUserType(type);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isAuthenticated, userType });
    }
    return child;
  });
};

export const AdminRoute = ({ children }) => (
  <ProtectedRoute 
    isAuthenticated={localStorage.getItem('session_id') === 'active' || sessionStorage.getItem('session_id') === 'active'} 
    authType="admin" 
    redirectPath="/"
  >
    {children}
  </ProtectedRoute>
);

export const UserRoute = ({ children }) => (
  <ProtectedRoute 
    isAuthenticated={localStorage.getItem('session_id') === 'active' || sessionStorage.getItem('session_id') === 'active'} 
    authType="user" 
    redirectPath="/"
  >
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;