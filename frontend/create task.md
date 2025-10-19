import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const AdminCreateTask = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingTasks, setPendingTasks] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        assignedBy: 'Admin',
        deadline: '',
        priority: 'medium',
        status: 'todo',
    });
    
    const [teamMembers, setTeamMembers] = useState([]);
    
    const today = new Date().toISOString().split('T')[0];
    
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

    useEffect(() => {
        const storedTasks = localStorage.getItem('pendingTasks');
        if (storedTasks) {
            setPendingTasks(JSON.parse(storedTasks));
        }
        
        const handleOnline = () => {
            setIsOnline(true);
            syncPendingTasks();
        };
        
        const handleOffline = () => {
            setIsOnline(false);
        };
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (navigator.onLine) {
            fetchCurrentUser();
        } else {
            const cachedUser = localStorage.getItem('currentUser');
            if (cachedUser) {
                setCurrentUser(JSON.parse(cachedUser));
            }
        }
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get(`${apiUrl}get_session_user`);
            if (response.data.type === 'success') {
                setCurrentUser(response.data.user);
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            }
        } catch (err) {
            console.error('Error fetching current user:', err);
            setCurrentUser(null);
        }
    };

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const syncPendingTasks = async () => {
        if (pendingTasks.length === 0) return;
        
        setIsLoading(true);
        setError(null);
        
        const tasksToSync = [...pendingTasks];
        const newPendingTasks = [...pendingTasks];
        let syncedCount = 0;
        
        for (let i = 0; i < tasksToSync.length; i++) {
            try {
                await axios.post(`${apiUrl}create_task`, tasksToSync[i]);
                newPendingTasks.splice(newPendingTasks.indexOf(tasksToSync[i]), 1);
                syncedCount++;
            } catch (err) {
                console.error('Failed to sync task:', err);
            }
        }
        
        setPendingTasks(newPendingTasks);
        localStorage.setItem('pendingTasks', JSON.stringify(newPendingTasks));
        
        setIsLoading(false);
        if (syncedCount > 0) {
            setSuccess(`Synced ${syncedCount} pending tasks`);
            setTimeout(() => setSuccess(null), 3000);
        }
    };
    
    const fetchTeamMembers = async () => {
        try {
            setIsLoading(true);
            const cachedMembers = localStorage.getItem('teamMembers');
            
            if (cachedMembers) {
                setTeamMembers(JSON.parse(cachedMembers));
            }
            
            if (navigator.onLine) {
                try {
                    const response = await axios.get(`${apiUrl}fetch`);
                    const activeMembers = response.data.filter(member => member.status === 'Active');
                    setTeamMembers(activeMembers);
                    localStorage.setItem('teamMembers', JSON.stringify(activeMembers));
                } catch (err) {
                    console.error('Error fetching team members:', err);
                }
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load team members. Using cached data if available.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTaskData({
            ...taskData,
            [name]: value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!taskData.title || !taskData.assignedTo || !taskData.deadline) {
            setError('Please fill in all required fields: Title, Assigned To, and Deadline.');
            return;
        }
        
        setIsLoading(true);
        setError(null);

        const newTask = {
            ...taskData,
            created_at: new Date().toISOString(),
            created_offline: !navigator.onLine,
            creator_name: currentUser ? currentUser.username : 'Admin',
            creator_id: currentUser ? currentUser.user_id : null
        };
        
        if (navigator.onLine) {
            try {
                const response = await axios.post(`${apiUrl}create_task`, newTask);
                
                if (response.data.type === 'success') {
                    setSuccess(alert('Task created successfully!'));
                    setTaskData({
                        title: '',
                        description: '',
                        assignedTo: '',
                        deadline: '',
                        priority: 'medium',
                        status: 'todo',
                        assignedBy: 'Admin'
                    });
                } else {
                    setError(response.data.message || 'Failed to create task.');
                    
                    const updatedPendingTasks = [...pendingTasks, newTask];
                    setPendingTasks(updatedPendingTasks);
                    localStorage.setItem('pendingTasks', JSON.stringify(updatedPendingTasks));
                    setSuccess(alert('Task saved locally and will be synced later.'))
                }
            } catch (err) {
                console.error('Create task error:', err);
                setError(alert('An error occurred while creating the task. Saving locally for later sync.'));
                
                const updatedPendingTasks = [...pendingTasks, newTask];
                setPendingTasks(updatedPendingTasks);
                localStorage.setItem('pendingTasks', JSON.stringify(updatedPendingTasks));
                setSuccess(alert('Task saved locally and will be synced when online.'));
            }
        } else {
            const updatedPendingTasks = [...pendingTasks, newTask];
            setPendingTasks(updatedPendingTasks);
            localStorage.setItem('pendingTasks', JSON.stringify(updatedPendingTasks));
            setSuccess(alert('Task saved locally and will be synced when online.'));

            setTaskData({
                title: '',
                description: '',
                assignedTo: '',
                deadline: '',
                priority: 'medium',
                status: 'todo',
                assignedBy: 'Admin'
            });
        }
        
        setIsLoading(false);

        setTimeout(() => {
            setSuccess(null);
        }, 3000);
    };

    const formatDeadline = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return format(date, 'MMM dd, yyyy');
    };

    const getPriorityClass = (priority) => {
        switch(priority) {
            case 'high': return 'bg-red-200 text-red-800 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'todo': return 'bg-gray-100 text-gray-800';
            case 'inProgress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Create Task</h1>
                    <p className="text-gray-600 mt-1">Assign and manage tasks for your team members</p>
                </div>
                
                <div className="flex items-center gap-2">
                    
                    
                    {pendingTasks.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {pendingTasks.length} Pending
                        </span>
                    )}
                </div>
            </div>
            
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6" role="alert">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-6" role="alert">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {pendingTasks.length > 0 && isOnline && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 flex justify-between items-center">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <span className="text-blue-700">{pendingTasks.length} task(s) pending synchronization</span>
                    </div>
                    <button 
                        onClick={syncPendingTasks}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center"
                    >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Sync Now
                    </button>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Task Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Task Title<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={taskData.title}
                                onChange={handleInputChange}
                                placeholder="Enter task title"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                required
                            />
                        </div>
                        
                        {/* Task Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={taskData.description}
                                onChange={handleInputChange}
                                rows="5"
                                placeholder="Enter detailed task description"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            />
                        </div>
                        
                        {/* Assigned To */}
                        <div>
                            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                                Assigned To<span className="text-red-500">*</span>
                            </label>
                            {isLoading && teamMembers.length === 0 ? (
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    <span>Loading team members...</span>
                                </div>
                            ) : teamMembers.length > 0 ? (
                                <select
                                    id="assignedTo"
                                    name="assignedTo"
                                    value={taskData.assignedTo}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                                    required
                                >
                                    <option value="">Select a team member</option>
                                    {teamMembers.map(member => (
                                        <option key={member.user_id} value={member.user_id}>
                                            {member.username}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        id="assignedTo"
                                        name="assignedTo"
                                        value={taskData.assignedTo}
                                        onChange={handleInputChange}
                                        placeholder="Enter user ID to assign task"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        required
                                    />
                                    <p className="text-xs text-amber-600">No team members loaded. Enter user ID manually.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Deadline */}
                        <div>
                            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                                Deadline<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="deadline"
                                name="deadline"
                                value={taskData.deadline}
                                onChange={handleInputChange}
                                min={today}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Only future dates can be selected</p>
                        </div>
                        
                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <div className="flex space-x-4">
                                {['low', 'medium', 'high'].map(priority => (
                                    <label 
                                        key={priority}
                                        className={`flex-1 cursor-pointer border ${taskData.priority === priority ? getPriorityClass(priority) + ' shadow-sm' : 'border-gray-200'} rounded-lg px-4 py-3 text-center text-sm font-medium transition-all`}
                                    >
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={priority}
                                            checked={taskData.priority === priority}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <span className="capitalize">{priority}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        {/* Initial Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Initial Status
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['todo', 'inProgress', 'completed'].map(status => (
                                    <label 
                                        key={status}
                                        className={`cursor-pointer border ${taskData.status === status ? getStatusClass(status) + ' shadow-sm' : 'border-gray-200'} rounded-lg px-4 py-3 text-center text-sm font-medium transition-all`}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={status}
                                            checked={taskData.status === status}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <span>
                                            {status === 'todo' ? 'To Do' : 
                                             status === 'inProgress' ? 'In Progress' : 'Completed'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Preview Card - Only show if title exists */}
                {taskData.title && (
                    <div className="mt-8 mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                            </svg>
                            Task Preview
                        </h3>
                        <div className="p-6 bg-white rounded-lg shadow border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 text-lg">{taskData.title}</h3>
                                    {taskData.description && (
                                        <p className="text-gray-600 mt-2 line-clamp-2">{taskData.description}</p>
                                    )}
                                </div>
                                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getPriorityClass(taskData.priority)}`}>
                                    {taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Assigned To</p>
                                        <p className="text-sm font-medium">
                                            {taskData.assignedTo ? 
                                                (teamMembers.find(member => member.user_id === taskData.assignedTo)?.username || `ID: ${taskData.assignedTo}`) : 
                                                'Not assigned'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Created By</p>
                                        <p className="text-sm font-medium">
                                            {currentUser ? currentUser.username : 'Admin'}
                                        </p>
                                    </div>
                                </div>
                                
                                {taskData.deadline && (
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                                            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Deadline</p>
                                            <p className="text-sm font-medium">{formatDeadline(taskData.deadline)}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Status</p>
                                        <p className="mt-1">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(taskData.status)}`}>
                                                {taskData.status === 'todo' ? 'To Do' : 
                                                 taskData.status === 'inProgress' ? 'In Progress' : 'Completed'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                                 shadow-md transition-all disabled:bg-blue-400 disabled:cursor-not-allowed
                                 flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Creating Task...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                <span>{isOnline ? 'Create Task' : 'Save Task Locally'}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminCreateTask;