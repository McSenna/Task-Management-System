import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminCreateUser from './AdminCreateUser';

const AdminTeamMembers = () => {
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table'); 

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

    const fetchTeamMembers = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${apiUrl}fetch`);
            setTeamMembers(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load team members. Please try again later.');
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const storeLogs = async (action) => {
        try {
            await axios.put(`${apiUrl}store_logs`, {
                user_id: 'Admin', 
                action,
            });
        } catch (error) {
            console.error('Error storing logs', error);
        }
    };

    const deleteTeamMember = async (userId, username) => {
        if (window.confirm('Are you sure you want to delete this team member?')) {
            try {
                const response = await axios.post(`${apiUrl}delete`, {
                    user_id: userId
                });
                
                if (response.data.type === 'success') {
                    setTeamMembers(teamMembers.filter(member => member.user_id !== userId));
                    alert(response.data.message);
                    await storeLogs(`Admin Deleted a User: ${username}, ${userId}`);
                } else {
                    alert(response.data.message || 'Failed to delete user');
                    await storeLogs(`Admin Failed to Delete a User, ${userId}`);
                }
            } catch (err) {
                console.error('Delete error:', err);
                alert('An error occurred while deleting the user');
                await storeLogs(`An Error while deleting the user, ${userId}`);
            }
        }
    };

    const handleUserCreated = (newUser) => {
        if (editingUser) {
            setTeamMembers(teamMembers.map(member => 
                member.user_id === newUser.user_id ? newUser : member
            ));
        } else {
            setTeamMembers([...teamMembers, newUser]);
        }
        setShowCreateUserModal(false);
        setEditingUser(null);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowCreateUserModal(true);
    };

    const openCreateUserModal = () => {
        setEditingUser(null);
        setShowCreateUserModal(true);
    };

    const closeCreateUserModal = () => {
        setShowCreateUserModal(false);
        setEditingUser(null);
    };

    const filteredMembers = teamMembers.filter(member => 
        member.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAvatarInitials = (username) => {
        if (!username) return '';
        return username.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getAvatarColor = (username) => {
        if (!username) return 'bg-gray-200';
        
        const colors = [
            'bg-blue-100 text-blue-800',
            'bg-green-100 text-green-800',
            'bg-purple-100 text-purple-800',
            'bg-pink-100 text-pink-800',
            'bg-yellow-100 text-yellow-800',
            'bg-indigo-100 text-indigo-800',
            'bg-red-100 text-red-800',
            'bg-teal-100 text-teal-800'
        ];
        
        const charCodeSum = username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[charCodeSum % colors.length];
    };

    const getStatusClass = (status) => {
        return status === 'Active' 
            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
            : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
    };

    const TableView = () => (
        <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full">
                <thead className="backdrop-blur-sm bg-white/30 border-b border-gray-200/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 backdrop-blur-sm bg-white/20">
                    {filteredMembers.map((member) => (
                        <tr key={member.id || member.user_id} className="hover:bg-white/40 transition-all duration-300">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-md ${getAvatarColor(member.username)}`}>
                                        {getAvatarInitials(member.username)}
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">{member.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {member.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{member.role}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full shadow-sm ${getStatusClass(member.status)}`}>
                                    {member.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <button 
                                        className="text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 rounded-full hover:bg-blue-50"
                                        onClick={() => handleEditUser(member)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="text-red-600 hover:text-red-800 transition-colors px-3 py-1 rounded-full hover:bg-red-50"
                                        onClick={() => deleteTeamMember(member.user_id, member.username)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const GridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
                <div key={member.id || member.user_id} className="rounded-2xl bg-white/30 backdrop-blur-lg shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                    <div className="relative h-20 bg-gradient-to-r from-blue-600 to-blue-800">
                        <div className="absolute -bottom-8 left-6">
                            <div className={`h-16 w-16 rounded-full flex items-center justify-center text-lg font-bold border-4 border-white shadow-lg ${getAvatarColor(member.username)}`}>
                                {getAvatarInitials(member.username)}
                            </div>
                        </div>
                    </div>
                    <div className="pt-10 pb-6 px-6">
                        <div className="mb-1 text-lg font-semibold">{member.username}</div>
                        <div className="mb-3 text-sm text-gray-600">{member.email}</div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <div className="text-sm font-medium px-3 py-1 rounded-lg bg-blue-50 text-blue-700">{member.role}</div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm ${getStatusClass(member.status)}`}>
                                {member.status}
                            </span>
                        </div>
                        <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                className="flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                onClick={() => handleEditUser(member)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit
                            </button>
                            <button 
                                className="flex items-center justify-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                onClick={() => deleteTeamMember(member.user_id, member.username)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header with glass effect */}
            <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            Team Members
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                className="pl-10 w-full py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-md shadow-inner"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-center bg-white/50 backdrop-blur-md rounded-lg shadow-inner p-1">
                            <button 
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-white/60'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm0 2h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-white/60'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                        </div>
                        <button 
                            onClick={openCreateUserModal}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all flex items-center shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Member
                        </button>
                    </div>
                </div>
            </div>

            {/* Team Members */}
            <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50/80 backdrop-blur-md border-l-4 border-red-500 p-4 m-4 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        {filteredMembers.length > 0 ? (
                            viewMode === 'table' ? <TableView /> : <GridView />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <div className="relative w-24 h-24 mb-4">
                                    <div className="absolute inset-0 bg-blue-100 rounded-full opacity-30 animate-ping"></div>
                                    <div className="relative flex items-center justify-center w-24 h-24 bg-white/50 backdrop-blur-md rounded-full shadow-lg border border-white/30">
                                        <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xl font-medium mb-2 text-gray-700">No team members found</p>
                                <p className="text-gray-500 mb-4">Get started by adding your first team member</p>
                                <button 
                                    onClick={openCreateUserModal}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all flex items-center shadow-md"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add Team Member
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create/Edit User Modal with glass effect */}
            {showCreateUserModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-3xl mx-4 transform transition-all duration-300 animate-fadeIn border border-white/30">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    {editingUser ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit Team Member
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            Add New Team Member
                                        </>
                                    )}
                                </h2>
                                <button 
                                    onClick={closeCreateUserModal}
                                    className="text-white hover:text-blue-100 transition-colors rounded-full p-1 hover:bg-blue-500/30"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <AdminCreateUser 
                            onUserCreated={handleUserCreated}
                            onCancel={closeCreateUserModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTeamMembers;