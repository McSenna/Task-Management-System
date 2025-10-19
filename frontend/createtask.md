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
        deadline: '',
        priority: 'medium',
        status: 'todo',
        offline_creator: '',
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
    
    const handleOfflineCreatorChange = (e) => {
        setTaskData({
            ...taskData,
            offline_creator: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!taskData.title || !taskData.assignedTo || !taskData.deadline) {
            setError('Please fill in all required fields: Title, Assigned To, and Deadline.');
            return;
        }

        if (!currentUser && !taskData.offline_creator) {
            setError('Please enter your name since you are working without being logged in.');
            return;
        }
        
        setIsLoading(true);
        setError(null);

        const newTask = {
            ...taskData,
            created_at: new Date().toISOString(),
            created_offline: !navigator.onLine,
            creator_name: currentUser ? currentUser.username : taskData.offline_creator,
            creator_id: currentUser ? currentUser.user_id : null
        };
        
        if (navigator.onLine) {
            try {
                const response = await axios.post(`${apiUrl}create_task`, newTask);
                
                if (response.data.type === 'success') {
                    setSuccess('Task created successfully!');
                    setTaskData({
                        title: '',
                        description: '',
                        assignedTo: '',
                        deadline: '',
                        priority: 'medium',
                        status: 'todo',
                        offline_creator: taskData.offline_creator 
                    });
                } else {
                    setError(response.data.message || 'Failed to create task.');
                    
                    const updatedPendingTasks = [...pendingTasks, newTask];
                    setPendingTasks(updatedPendingTasks);
                    localStorage.setItem('pendingTasks', JSON.stringify(updatedPendingTasks));
                    setSuccess('Task saved locally and will be synced later.');
                }
            } catch (err) {
                console.error('Create task error:', err);
                setError('An error occurred while creating the task. Saving locally for later sync.');
                
                const updatedPendingTasks = [...pendingTasks, newTask];
                setPendingTasks(updatedPendingTasks);
                localStorage.setItem('pendingTasks', JSON.stringify(updatedPendingTasks));
                setSuccess('Task saved locally and will be synced when online.');
            }
        } else {
            const updatedPendingTasks = [...pendingTasks, newTask];
            setPendingTasks(updatedPendingTasks);
            localStorage.setItem('pendingTasks', JSON.stringify(updatedPendingTasks));
            setSuccess('Task saved locally and will be synced when online.');

            setTaskData({
                title: '',
                description: '',
                assignedTo: '',
                deadline: '',
                priority: 'medium',
                status: 'todo',
                offline_creator: taskData.offline_creator 
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
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Create New Task</h1>
                    <p className="text-gray-600">Assign tasks to team members and set deadlines</p>
                </div>
                {/* <div className="flex items-center space-x-2">
                    {!isOnline && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                            Offline Mode
                        </span>
                    )}
                    {currentUser ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {currentUser.username}
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            Anonymous Admin
                        </span>
                    )}
                </div> */}
            </div>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
                    <span className="block sm:inline">{success}</span>
                </div>
            )}
            
            {/* Pending Tasks Banner */}
            {pendingTasks.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                    <span>{pendingTasks.length} task(s) pending synchronization</span>
                    {isOnline && (
                        <button 
                            onClick={syncPendingTasks}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                        >
                            Sync Now
                        </button>
                    )}
                </div>
            )}
            
            {/* Not Logged In Notice */}
            {/* {!currentUser && (
                <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-purple-700">
                                You're creating tasks without being logged in. Your name will be recorded as the task creator.
                            </p>
                        </div>
                    </div>
                </div>
            )} */}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                                rows="4"
                                placeholder="Enter task description"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        {/* Assigned To */}
                        <div>
                            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                                Assigned To<span className="text-red-500">*</span>
                            </label>
                            {isLoading && teamMembers.length === 0 ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    <span>Loading team members...</span>
                                </div>
                            ) : teamMembers.length > 0 ? (
                                <select
                                    id="assignedTo"
                                    name="assignedTo"
                                    value={taskData.assignedTo}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    <p className="text-xs text-amber-600">No team members loaded. Enter user ID manually.</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Your Name (always visible but required only when not logged in) */}
                        <div>
                            <label htmlFor="offline_creator" className="block text-sm font-medium text-gray-700 mb-1">
                                Your Name{!currentUser && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                id="offline_creator"
                                value={taskData.offline_creator}
                                onChange={handleOfflineCreatorChange}
                                placeholder={currentUser ? "Optional when logged in" : "Enter your name (required)"}
                                className={`w-full px-4 py-2 border ${!currentUser ? 'border-purple-300 bg-purple-50' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                                required={!currentUser}
                            />
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Past dates are not allowed.</p>
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
                                        className={`flex-1 cursor-pointer border ${taskData.priority === priority ? getPriorityClass(priority) : 'border-gray-200'} rounded-md px-3 py-2 text-center text-sm font-medium transition-all`}
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
                            <select
                                id="status"
                                name="status"
                                value={taskData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="todo">To Do</option>
                                <option value="inProgress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* Preview Card */}
                {taskData.title && (
                    <div className="mt-8 mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Task Preview</h3>
                        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-gray-800">{taskData.title}</h3>
                                    {taskData.description && (
                                        <p className="text-sm text-gray-600 mt-1">{taskData.description}</p>
                                    )}
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full ${getPriorityClass(taskData.priority)}`}>
                                    {taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)}
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center mt-4 text-sm text-gray-600 gap-4">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                    </svg>
                                    {taskData.assignedTo ? 
                                        (teamMembers.find(member => member.user_id === taskData.assignedTo)?.username || `User ID: ${taskData.assignedTo}`) : 
                                        'Not assigned'}
                                </div>
                                
                                {/* Creator info */}
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                                    </svg>
                                    Created by: {currentUser ? currentUser.username : taskData.offline_creator || 'Anonymous'}
                                </div>
                                
                                {taskData.deadline && (
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                                        </svg>
                                        {formatDeadline(taskData.deadline)}
                                    </div>
                                )}
                                
                                {/* Status tag */}
                                <div className="flex items-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                        ${taskData.status === 'todo' ? 'bg-gray-100 text-gray-800' : 
                                          taskData.status === 'inProgress' ? 'bg-blue-100 text-blue-800' : 
                                          'bg-green-100 text-green-800'}`}>
                                        {taskData.status === 'todo' ? 'To Do' : 
                                         taskData.status === 'inProgress' ? 'In Progress' : 'Completed'}
                                    </span>
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
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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