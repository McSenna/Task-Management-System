import React, { useState } from 'react';
import { Save, X, Mail, Phone, MapPin, Briefcase, Users } from 'lucide-react';
import axios from 'axios';

const UserProfileUpdate = ({ userData, apiUrl, onUpdate, onCancel }) => {
  const [editForm, setEditForm] = useState({
    name: userData.name,
    email: userData.email,
    role: userData.role,
    department: userData.department,
    phone: userData.phone,
    location: userData.location
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const storeLogs = async (action) => {
    try {
      await axios.put(`${apiUrl}store_logs`, {
        user_id: userData?.user_id,
        user_name: userData?.name || userData?.username || 'Unknown User',
        action,
      });
    } catch (error) {
      console.error('Error storing logs', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const userId = userData.user_id;
  
      if (!userId) {
        const errorMessage = 'User ID not found. Please try logging in again.';
        setError(errorMessage);
        await storeLogs(`Profile update failed: ${errorMessage}`);
        return;
      }
  
      const response = await axios.post(
        `${apiUrl}update_profile`,
        {
          user_id: userId,
          username: editForm.name,
          email: editForm.email,
          role: editForm.role,
          department: editForm.department,
          contact: editForm.phone,
          location: editForm.location,
        },
        {
          withCredentials: true,
        }
      );
  
      console.log('Response data:', response.data);
  
      if (response.data.type === 'success' || response.data.type === 'info') {
        const updatedUserData = {
          ...userData,
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          department: editForm.department,
          phone: editForm.phone,
          location: editForm.location,
        };
  
        const storage = localStorage.getItem('session_id') ? localStorage : sessionStorage;
        const storedUser = JSON.parse(storage.getItem('user') || '{}');
        const updatedUser = {
          ...storedUser,
          username: editForm.name,
          email: editForm.email,
          role: editForm.role,
          department: editForm.department,
          contact: editForm.phone,
          location: editForm.location,
        };
        storage.setItem('user', JSON.stringify(updatedUser));
  
        // Log successful update
        await storeLogs(`Profile updated successfully for ${editForm.name}`);
        
        alert(response.data.message || 'Profile updated successfully!');
        
        onUpdate(updatedUserData);
      } else {
        const errorMessage = response.data.message || 'Failed to update profile.';
        setError(errorMessage);
        
        // Log failed update
        await storeLogs(`Profile update failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = 'An error occurred while updating the profile. Please try again.';
      setError(errorMessage);
      
      // Log error
      await storeLogs(`Profile update error: ${error.message || errorMessage}`);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <Users size={20} className="mr-2 text-indigo-600" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-gray-500 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="text-sm text-gray-900 font-medium w-full p-3 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        className="text-sm text-gray-900 font-medium w-full p-3 pl-10 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-500 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                        className="text-sm text-gray-900 font-medium w-full p-3 pl-10 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Information Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <Briefcase size={20} className="mr-2 text-indigo-600" />
                  Work Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="role" className="block text-xs font-medium text-gray-500 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      id="role"
                      value={editForm.role}
                      onChange={handleInputChange}
                      className="text-sm text-gray-900 font-medium w-full p-3 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-xs font-medium text-gray-500 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      id="department"
                      value={editForm.department}
                      onChange={handleInputChange}
                      className="text-sm text-gray-900 font-medium w-full p-3 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-xs font-medium text-gray-500 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={editForm.location}
                        onChange={handleInputChange}
                        className="text-sm text-gray-900 font-medium w-full p-3 pl-10 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center space-x-4">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Save size={16} className="mr-2" /> Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <X size={16} className="mr-2" /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileUpdate;