import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditTeamMemberModal = ({ user, onUserCreated, onCancel }) => {
    const isEditing = !!user;
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        role: user?.role || 'member',
        status: user?.status || 'Active',
        contact: user?.contact || '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        
        if (!isEditing && !formData.password) {
            newErrors.password = 'Password is required';
        }
        
        if (formData.password && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.role) {
            newErrors.role = 'Role is required';
        }
        
        if (!formData.status) {
            newErrors.status = 'Status is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for the field being edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        
        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                contact: formData.contact,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            if (isEditing) {
                payload.user_id = user.user_id;
                const response = await axios.put(`${apiUrl}update`, payload);
                
                if (response.data.type === 'success') {
                    onUserCreated({
                        ...payload,
                        user_id: user.user_id
                    });
                    alert(response.data.message);
                } else {
                    alert(response.data.message || 'Failed to update user');
                }
            } else {
                const response = await axios.post(`${apiUrl}insert`, payload);
                
                if (response.data.type === 'success') {
                    onUserCreated({
                        ...payload,
                        user_id: response.data.user_id
                    });
                    alert(response.data.message);
                } else {
                    alert(response.data.message || 'Failed to create user');
                }
            }
        } catch (err) {
            console.error('Error:', err);
            alert('An error occurred while processing the request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border bg-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.username ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="Enter username"
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border bg-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.email ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="Enter email"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border bg-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.role ? 'border-red-500' : 'border-gray-200'
                            }`}
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                        </select>
                        {errors.role && (
                            <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border bg-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.status ? 'border-red-500' : 'border-gray-200'
                            }`}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        {errors.status && (
                            <p className="mt-1 text-sm text-red-500">{errors.status}</p>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact
                        </label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border bg-white/50 backdrop-blur-md focus纲程-2 focus:ring-blue-500 border-gray-200"
                            placeholder="Enter contact number"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isEditing ? 'New Password (optional)' : 'Password'}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border bg-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.password ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="Enter password"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border bg-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="Confirm password"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all flex items-center disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : null}
                        {isEditing ? 'Update Member' : 'Create Member'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTeamMemberModal;