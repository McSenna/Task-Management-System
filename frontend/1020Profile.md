import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Briefcase, Users, Edit2, Save, X } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    location: ''
  });

  const [editForm, setEditForm] = useState({...userData});
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  // Fetch user data from the database on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Retrieve user session from localStorage or sessionStorage
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      console.log('Stored user session:', storedUser);
      
      if (!storedUser) {
        setError('No user session found. Please log in again.');
        setIsLoading(false);
        return;
      }

      let userData;
      try {
        userData = JSON.parse(storedUser);
      } catch (e) {
        setError('Invalid user data format. Please log in again.', e);
        setIsLoading(false);
        return;
      }
      
      console.log('Parsed user data:', userData);

      // Check for user_id in different possible formats
      const userId = userData.user_id || userData.id || '';
      
      if (!userId) {
        setError('User ID not found in session. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch profile data from the backend
        console.log(`Fetching profile for user ID: ${userId}`);
        const response = await axios.get(`${apiUrl}get_profile&user_id=${userId}`);
        
        console.log('Profile API response:', response.data);
        
        if (response.data.type === 'success') {
          const profileData = response.data.user;

          // Map the database fields to our profile fields
          setUserData({
            name: profileData.username || userData.username || 'N/A',
            email: profileData.email || userData.email || 'N/A',
            role: profileData.role || userData.role || 'N/A',
            department: profileData.department || 'Department not specified',
            phone: profileData.contact || 'N/A',
            location: profileData.location || 'Location not specified',
          });

          setEditForm({
            name: profileData.username || userData.username || '',
            email: profileData.email || userData.email || '',
            role: profileData.role || userData.role || '',
            department: profileData.department || '',
            phone: profileData.contact || '',
            location: profileData.location || '',
          });
        } else {
          // If API call fails, fall back to session data
          console.log('API call failed, using session data instead');
          
          setUserData({
            name: userData.username || 'N/A',
            email: userData.email || 'N/A',
            role: userData.role || 'N/A',
            department: userData.department || 'Department not specified',
            phone: userData.contact || 'N/A',
            location: userData.location || 'Location not specified',
          });

          setEditForm({
            name: userData.username || '',
            email: userData.email || '',
            role: userData.role || '',
            department: userData.department || '',
            phone: userData.contact || '',
            location: userData.location || '',
          });
          
          setError('Note: Using locally stored profile data. Some fields may be incomplete.');
        }
      } catch (fetchError) {
        console.error('Error fetching profile:', fetchError);
        
        // Fall back to session data if API call fails
        setUserData({
          name: userData.username || 'N/A',
          email: userData.email || 'N/A',
          role: userData.role || 'N/A',
          department: 'Department not specified',
          phone: 'N/A',
          location: 'Location not specified',
        });

        setEditForm({
          name: userData.username || '',
          email: userData.email || '',
          role: userData.role || '',
          department: '',
          phone: '',
          location: '',
        });
        
        setError('Could not connect to server. Using locally stored profile data.');
      }
    } catch (error) {
      console.error('Error in profile setup:', error);
      setError('An error occurred while loading your profile: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!storedUser) {
        setError('User session not found. Please log in again.');
        return;
      }
      
      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.user_id || parsedUser.id || '';
      
      if (!userId) {
        setError('User ID not found in session. Please log in again.');
        return;
      }
      
      // Prepare data for API
      const updateData = {
        user_id: userId,
        username: editForm.name,
        email: editForm.email,
        role: editForm.role,
        department: editForm.department,
        contact: editForm.phone,
        location: editForm.location
      };
      
      console.log('Sending profile update:', updateData);
      const response = await axios.post(`${apiUrl}update_profile`, updateData);
      
      if (response.data.type === 'success') {
        // Update our local state with the new data
        setUserData({...editForm});
        alert('Profile updated successfully');
        
        // Update session with new data (only username, email, role which are required for auth)
        const updatedSessionUser = {
          ...parsedUser,
          username: editForm.name,
          email: editForm.email,
          role: editForm.role
        };
        
        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(updatedSessionUser));
        } else {
          sessionStorage.setItem('user', JSON.stringify(updatedSessionUser));
        }
      } else {
        setError('Failed to update profile: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred while updating your profile: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    }
    
    setIsEditing(false);
  };
  console.log(sessionStorage);
  
  // Get initials for avatar
  const getInitials = () => {
    return userData.name
      ? userData.name
          .split(' ')
          .map((n) => n?.[0] || '')
          .join('')
      : 'N/A';
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            User Profile
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage your personal information and account preferences
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-8 flex flex-col items-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-md mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {getInitials()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
                <p className="text-blue-100 mt-1">{userData.role}</p>
              </div>
              
              <div className="border-t border-gray-200">
                <dl>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50">
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <Briefcase size={16} className="mr-2" />
                      Role
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.role}</dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50">
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <Users size={16} className="mr-2" />
                      Department
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.department}</dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50">
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <Mail size={16} className="mr-2" />
                      Email
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.email}</dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50">
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <Phone size={16} className="mr-2" />
                      Phone
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.phone}</dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50">
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <MapPin size={16} className="mr-2" />
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.location}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Details / Edit Form */}
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Edit2 size={16} className="mr-2" /> Edit Profile
                    </button>
                  )}
                </div>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Personal details and application preferences.
                </p>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 gap-x-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="role"
                          id="role"
                          value={editForm.role}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="department"
                          id="department"
                          value={editForm.department}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="phone"
                          id="phone"
                          value={editForm.phone}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="location"
                          id="location"
                          value={editForm.location}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex space-x-4">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Save size={16} className="mr-2" /> Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({...userData});
                        setIsEditing(false);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <X size={16} className="mr-2" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{userData.name}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Email address</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{userData.email}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Role</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{userData.role}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Department</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{userData.department}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{userData.phone}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{userData.location}</dd>
                    </div>
                  </dl>
                  
                  <div className="mt-8 bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-800">Account Status</h3>
                        <div className="mt-1 text-sm text-gray-600">
                          <p>Active member</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Additional card for extra information */}
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Account Security</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage your security settings and preferences.
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-500">Manage your account password</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Change Password
                  </button>
                </div>
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Two-factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;