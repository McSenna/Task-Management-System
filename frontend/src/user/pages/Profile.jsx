import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Briefcase, Users, Edit2, Shield, Key, Lock } from 'lucide-react';
import axios from 'axios';
import UserProfileUpdate from './UserProfileUpdate';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    user_id: '',
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    location: ''
  });
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
  
      // Check for active session
      const storage = localStorage.getItem('session_id') ? localStorage : sessionStorage;
      const userId = storage.getItem('user_id');
      const sessionId = storage.getItem('session_id');
      
      if (!sessionId) {
        setError('No active session found. Please log in.');
        setIsLoading(false);
        return;
      }

      // First try to get fresh data from the server
      try {
        const response = await axios.get(`${apiUrl}get_session_user`, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        });
    
        if (response.data.type === 'success') {
          const profile = response.data.user;
          
          // Update state with server data
          setUserData({
            user_id: profile.user_id || '',
            name: profile.username || '',
            email: profile.email || '',
            role: profile.role || '',
            department: profile.department || '',
            phone: profile.contact || '',
            location: profile.location || ''
          });
          
          // Update local storage with fresh data
          storage.setItem('user', JSON.stringify(profile));
          setIsLoading(false);
          return;
        } else {
          throw new Error(response.data.message || 'Failed to fetch profile');
        }
      } catch (apiError) {
        console.error('Error fetching profile from API:', apiError);
        
        // If API call fails, try to use stored user data as fallback
        const storedUser = storage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUserData({
              user_id: parsedUser.user_id || parsedUser.id || '',
              name: parsedUser.username || parsedUser.name || '',
              email: parsedUser.email || '',
              role: parsedUser.role || '',
              department: parsedUser.department || '',
              phone: parsedUser.contact || parsedUser.phone || '',
              location: parsedUser.location || ''
            });
            setIsLoading(false);
            return;
          } catch (parseError) {
            console.error('Error parsing stored user:', parseError);
            setError('Unable to load profile data. Please try logging in again.');
          }
        } else {
          setError('Unable to fetch profile. Please try logging in again.');
        }
      }
    } catch (error) {
      console.error('Error in profile loading:', error);
      setError('Unable to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U';
  };

  const handleProfileUpdate = (updatedData) => {
    setUserData(updatedData);
    setIsEditing(false);
    
    // Update the stored user data
    const storage = localStorage.getItem('session_id') ? localStorage : sessionStorage;
    try {
      const storedUser = JSON.parse(storage.getItem('user') || '{}');
      
      // Create updated user object with consistent property names
      const updatedUser = { 
        ...storedUser,
        user_id: updatedData.user_id,
        username: updatedData.name,
        email: updatedData.email,
        role: updatedData.role,
        department: updatedData.department,
        contact: updatedData.phone,
        location: updatedData.location
      };
      
      storage.setItem('user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Error updating stored user data:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  const renderProfileTab = () => (
    <>
      {isEditing ? (
        <UserProfileUpdate 
          userData={userData}
          apiUrl={apiUrl}
          onUpdate={handleProfileUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                    <Users size={20} className="mr-2 text-indigo-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                      <div className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-md border border-gray-100">
                        {userData.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                      <div className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center">
                        <Mail size={16} className="text-gray-400 mr-2" />
                        {userData.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                      <div className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center">
                        <Phone size={16} className="text-gray-400 mr-2" />
                        {userData.phone || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                    <Briefcase size={20} className="mr-2 text-indigo-600" />
                    Work Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                      <div className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-md border border-gray-100">
                        {userData.role || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                      <div className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-md border border-gray-100">
                        {userData.department || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                      <div className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center">
                        <MapPin size={16} className="text-gray-400 mr-2" />
                        {userData.location || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Edit2 size={16} className="mr-2" /> Edit Profile Information
            </button>
          </div>
        </div>
      )}
    </>
  );

  const renderSecurityTab = () => (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-5">
            <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
              <Key size={20} className="mr-2 text-indigo-600" />
              Password Management
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              It's a good practice to change your password regularly and use a strong password that combines letters, numbers, and special characters.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Lock size={16} className="mr-2" />
                Change Password
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5">
            <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
              <Shield size={20} className="mr-2 text-indigo-600" />
              Two-factor Authentication
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Add an extra layer of security to your account by enabling two-factor authentication. This will require an additional verification step when signing in.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md max-w-3xl mx-auto">
            {error}
          </div>
        )}

        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-300"></div>
            <div className="absolute inset-0 bg-black opacity-10"></div>
            
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end -mt-16">
                <div className="flex items-center justify-center h-24 w-24 rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-4 sm:mb-0">
                  <span className="text-2xl font-bold text-white">
                    {getInitials(userData.name)}
                  </span>
                </div>
                
                <div className="sm:ml-6 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {/* Increased font size for the name */}
                      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{userData.name}</h1>
                      <p className="text-sm font-medium text-gray-500 mt-1 flex items-center">
                        <Briefcase size={14} className="mr-1" />
                        {userData.role || 'Role not specified'}
                        {userData.department && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{userData.department}</span>
                          </>
                        )}
                      </p>
                    </div>
                    
                    <div className="mt-4 sm:mt-0">
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active Account
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Security Settings
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          {activeTab === 'profile' ? renderProfileTab() : renderSecurityTab()}
        </div>
      </div>
    </div>
  );
};

export default Profile;