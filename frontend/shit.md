import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const AdminCreateTask = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingTasks, setPendingTasks] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [step, setStep] = useState(1); // For multi-step form
    
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        assignedTo: [],
        assignedBy: 'Admin',
        deadline: '',
        priority: 'medium',
        status: 'todo',
        tags: [], // New field for task categorization
        attachments: [], // New field for task attachments
        estimatedHours: '', // New field for time estimation
    });
    
    const [teamMembers, setTeamMembers] = useState([]);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    
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
            const response = await fetch(`${apiUrl}get_session_user`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            if (data.type === 'success') {
                setCurrentUser(data.user);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
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
                const response = await fetch(`${apiUrl}create_task`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(tasksToSync[i])
                });
                
                if (response.ok) {
                    newPendingTasks.splice(newPendingTasks.indexOf(tasksToSync[i]), 1);
                    syncedCount++;
                }
            } catch (err) {
                console.error('Failed to sync task:', err);
            }
        }
        
        setPendingTasks(newPendingTasks);
        localStorage.setItem('pendingTasks', JSON.stringify(newPendingTasks));
        
        setIsLoading(false);
        if (syncedCount > 0) {
            setSuccess(`Synced ${syncedCount} pending task${syncedCount > 1 ? 's' : ''}`);
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
                    const response = await fetch(`${apiUrl}fetch`);
                    if (!response.ok) throw new Error('Failed to fetch team members');
                    const data = await response.json();
                    
                    const activeMembers = data.filter(member => member.status === 'Active');
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
    
    const handleTagInput = (e) => {
        if (e.key === 'Enter' && e.target.value.trim() !== '') {
            e.preventDefault();
            const newTag = e.target.value.trim();
            if (!taskData.tags.includes(newTag)) {
                setTaskData({
                    ...taskData,
                    tags: [...taskData.tags, newTag]
                });
            }
            e.target.value = '';
        }
    };
    
    const removeTag = (tagToRemove) => {
        setTaskData({
            ...taskData,
            tags: taskData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleAssigneeToggle = (userId) => {
        const currentAssignees = [...taskData.assignedTo];
        const index = currentAssignees.indexOf(userId);
        
        if (index === -1) {
            setTaskData({
                ...taskData,
                assignedTo: [...currentAssignees, userId]
            });
        } else {
            currentAssignees.splice(index, 1);
            setTaskData({
                ...taskData,
                assignedTo: currentAssignees
            });
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!taskData.title || taskData.assignedTo.length === 0 || !taskData.deadline) {
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
                const response = await fetch(`${apiUrl}create_task`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newTask)
                });
                
                const data = await response.json();
                
                if (data.type === 'success') {
                    setSuccess('Task created successfully!');
                    resetForm();
                } else {
                    setError(data.message || 'Failed to create task.');
                    
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
            resetForm();
        }
        
        setIsLoading(false);

        setTimeout(() => {
            setSuccess(null);
        }, 3000);
    };

    const resetForm = () => {
        setTaskData({
            title: '',
            description: '',
            assignedTo: [],
            deadline: '',
            priority: 'medium',
            status: 'todo',
            assignedBy: 'Admin',
            tags: [],
            attachments: [],
            estimatedHours: '',
        });
        setStep(1);
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
    
    const getPriorityIcon = (priority) => {
        switch(priority) {
            case 'high':
                return (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                );
            case 'medium':
                return (
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                );
            case 'low':
                return (
                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
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
    
    const getStatusIcon = (status) => {
        switch(status) {
            case 'todo':
                return (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
            case 'inProgress':
                return (
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
            case 'completed':
                return (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                );
            default:
                return null;
        }
    };

    // Filter team members based on search text
    const filteredTeamMembers = teamMembers.filter(member => 
        member.username.toLowerCase().includes(filterText.toLowerCase())
    );

    // Helper to get assignee names for display
    const getAssigneeNames = () => {
        if (!taskData.assignedTo || taskData.assignedTo.length === 0) return 'Not assigned';
        
        return taskData.assignedTo.map(userId => {
            const member = teamMembers.find(m => m.user_id === userId);
            return member ? member.username : `ID: ${userId}`;
        }).join(', ');
    };
    
    // Handle form step navigation
    const nextStep = () => {
        if (step === 1 && !taskData.title) {
            setError("Please enter a task title before proceeding");
            return;
        }
        setStep(step + 1);
    };
    
    const prevStep = () => {
        setStep(step - 1);
    };
    
    return (
        <div className="bg-gradient-to-br from-blue-50 to-gray-50 min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                        <div className="absolute bottom-0 right-0 opacity-10">
                            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                            </svg>
                        </div>
                        
                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold">Create Task</h1>
                                <p className="opacity-80 mt-1">Assign and manage tasks for your team members</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {isOnline ? 'Online' : 'Offline'}
                                </div>
                                
                                {pendingTasks.length > 0 && (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        {pendingTasks.length} Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 md:p-8">
                        {/* Status Messages */}
                        <div className="mb-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm" role="alert">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                        <button 
                                            onClick={() => setError(null)}
                                            className="ml-auto text-red-500 hover:text-red-700"
                                        >
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {success && (
                                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm" role="alert">
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
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex justify-between items-center shadow-sm">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                        <span className="text-blue-700">{pendingTasks.length} task(s) pending synchronization</span>
                                    </div>
                                    <button 
                                        onClick={syncPendingTasks}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center shadow-sm"
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                        </svg>
                                        Sync Now
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Step Progress Bar */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        1
                                    </div>
                                    <div className={`h-1 w-16 ${step > 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                </div>
                                
                                <div className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        2
                                    </div>
                                    <div className={`h-1 w-16 ${step > 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                </div>
                                
                                <div className="flex items-center justify-center w-10 h-10 rounded-full">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        3
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between mt-2 px-2 text-xs text-gray-500">
                                <span>Basic Info</span>
                                <span>Assignment</span>
                                <span>Review</span>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Step 1: Basic Info */}
                            {step === 1 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Task Information</h2>
                                    
                                    {/* Task Title */}
                                    <div className="space-y-1">
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                            Task Title<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={taskData.title}
                                            onChange={handleInputChange}
                                            placeholder="Enter task title"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors"
                                            required
                                        />
                                    </div>
                                    
                                    {/* Task Description */}
                                    <div className="space-y-1">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={taskData.description}
                                            onChange={handleInputChange}
                                            rows="5"
                                            placeholder="Enter detailed task description"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors"
                                        />
                                    </div>
                                    
                                    {/* Deadline */}
                                    <div className="space-y-1">
                                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                                            Deadline<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="deadline"
                                            name="deadline"
                                            value={taskData.deadline}
                                            onChange={handleInputChange}
                                            min={today}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors"
                                            required
                                        />
                                        <p className="text-xs text-gray-500">Only future dates can be selected</p>
                                    </div>
                                    
                                    {/* Time Estimation - New field */}
                                    <div className="space-y-1">
                                        <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">
                                            Estimated Hours
                                        </label>
                                        <input
                                            type="number"
                                            id="estimatedHours"
                                            name="estimatedHours"
                                            value={taskData.estimatedHours}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 4"
                                            min="0"
                                            step="0.5"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors"
                                        />
                                    </div>
                                    
                                    {/* Tags - New field */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Tags
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {taskData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Press Enter to add tag"
                                            onKeyDown={handleTagInput}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Assignment */}
                            {step === 2 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Assign Task</h2>

                                    {/* Filter Team Members */}
                                    <div className="space-y-1">
                                        <label htmlFor="filterText" className="block text-sm font-medium text-gray-700">
                                            Filter Team Members
                                        </label>
                                        <input
                                            type="text"
                                            id="filterText"
                                            name="filterText"
                                            value={filterText}
                                            onChange={(e) => setFilterText(e.target.value)}
                                            placeholder="Search team members by name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors"
                                        />
                                    </div>

                                    {/* Team Members List */}
                                    <div className="space-y-2">
                                        {filteredTeamMembers.map((member) => (
                                            <div
                                                key={member.user_id}
                                                className="flex items-center justify-between p-2 border border-gray-200 rounded-lg shadow-sm"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={member.avatar_url}
                                                        alt={member.username}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-800">{member.username}</p>
                                                        <p className="text-sm text-gray-500">{member.role}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAssigneeToggle(member.user_id)}
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                                                        taskData.assignedTo.includes(member.user_id)
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {taskData.assignedTo.includes(member.user_id) ? 'Assigned' : 'Assign'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Review */}
                            {step === 3 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Review Task Details</h2>

                                    {/* Task Summary */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Title</h3>
                                            <p className="text-gray-800">{taskData.title || 'No title provided'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Description</h3>
                                            <p className="text-gray-800">{taskData.description || 'No description provided'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Deadline</h3>
                                            <p className="text-gray-800">{formatDeadline(taskData.deadline)}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Estimated Hours</h3>
                                            <p className="text-gray-800">{taskData.estimatedHours || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Tags</h3>
                                            <p className="text-gray-800">{taskData.tags.length > 0 ? taskData.tags.join(', ') : 'No tags added'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Assigned To</h3>
                                            <p className="text-gray-800">{getAssigneeNames()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Previous
                                    </button>
                                )}
                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                                    >
                                        Submit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateTask;