import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarTasks, setCalendarTasks] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [viewMode, setViewMode] = useState('combined'); 
  const [activeTab, setActiveTab] = useState('upcoming');
  
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}get_tasks`);
      if (response.data.type === 'success') {
        setTasks(response.data.tasks);
        organizeTasksForCalendar(response.data.tasks);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const organizeTasksForCalendar = (taskList) => {
    const organized = {};
    
    taskList.forEach(task => {
      const dateKey = task.deadline.split(' ')[0];
      if (!organized[dateKey]) {
        organized[dateKey] = [];
      }
      organized[dateKey].push(task);
    });
    
    setCalendarTasks(organized);
  };
  
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await axios.post(`${apiUrl}update_task_status`, {
        task_id: taskId,
        status: newStatus
      });
      
      if (response.data.type === 'success') {
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task => 
            task.task_id === taskId ? { ...task, status: newStatus } : task
          );
          organizeTasksForCalendar(updatedTasks);
          return updatedTasks;
        });
        
        if (selectedTask && selectedTask.task_id === taskId) {
          setSelectedTask({...selectedTask, status: newStatus});
        }
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityHoverBg = (priority) => {
    switch (priority) {
      case 'high': return 'hover:bg-red-50';
      case 'medium': return 'hover:bg-amber-50';
      case 'low': return 'hover:bg-emerald-50';
      default: return 'hover:bg-gray-50';
    }
  };
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'todo':
        return { color: 'bg-gray-300 text-gray-800', label: 'To Do' };
      case 'inProgress':
        return { color: 'bg-blue-200 text-blue-800', label: 'In Progress' };
      case 'completed':
        return { color: 'bg-green-200 text-green-800', label: 'Completed' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status };
    }
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysInMonth = (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const handleCalendarTileClick = (day) => {
    if (!day) return;
    
    const dateKey = formatDateForKey(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      day
    );
    
    if (calendarTasks[dateKey] && calendarTasks[dateKey].length > 0) {
      setSelectedTask(calendarTasks[dateKey][0]);
    }
  };
  
  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  const days = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1
  );
  
  const formatDateForKey = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  };

  const taskCounts = tasks.reduce((acc, task) => {
    const status = task.status || 'todo';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const getHighestPriorityForDay = (dayTasks) => {
    if (dayTasks.some(task => task.priority === 'high')) return 'high';
    if (dayTasks.some(task => task.priority === 'medium')) return 'medium';
    if (dayTasks.some(task => task.priority === 'low')) return 'low';
    return 'none';
  };

  const filteredTasks = tasks.filter(task => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    
    switch (activeTab) {
      case 'upcoming':
        return deadline > now && task.status !== 'completed';
      case 'pending':
        return task.status !== 'completed';
      case 'completed':
        return task.status === 'completed';
      case 'all':
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hey!! Its Calendar</h1>
              <p className="text-gray-600 mt-1">Monitor and manage all team tasks</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewMode('combined')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'add' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Add Task
              </button>

              <button
                onClick={() => setViewMode('combined')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'combined' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Combined View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Calendar View
              </button>
            </div>
          </div>
        </div>
        
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-blue-500">
            <div className="text-sm font-medium text-gray-500">Total Tasks</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{tasks.length}</div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-gray-500">
            <div className="text-sm font-medium text-gray-500">To Do</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{taskCounts.todo || 0}</div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-gray-500 h-full rounded-full" style={{ width: `${tasks.length ? (taskCounts.todo || 0) / tasks.length * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-blue-500">
            <div className="text-sm font-medium text-gray-500">In Progress</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{taskCounts.inProgress || 0}</div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${tasks.length ? (taskCounts.inProgress || 0) / tasks.length * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-green-500">
            <div className="text-sm font-medium text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{taskCounts.completed || 0}</div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: `${tasks.length ? (taskCounts.completed || 0) / tasks.length * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className={`flex flex-col ${viewMode === 'combined' ? 'lg:flex-row' : ''} gap-6`}>
          {/* Task List Section */}
          {(viewMode === 'combined' || viewMode === 'list') && (
            <div className={`${viewMode === 'combined' ? 'lg:w-1/2' : 'w-full'} bg-white rounded-lg shadow overflow-hidden`}>
              {/* Task List Header with Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex justify-between items-center px-4 py-3 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                  <button 
                    onClick={fetchTasks}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="px-4">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                      onClick={() => setActiveTab('upcoming')}
                    >
                      Upcoming
                    </button>
                    <button
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                      onClick={() => setActiveTab('all')}
                    >
                      All
                    </button>
                    <button
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                      onClick={() => setActiveTab('pending')}
                    >
                      Pending
                    </button>
                    <button
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'completed' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                      onClick={() => setActiveTab('completed')}
                    >
                      Completed
                    </button>
                  </nav>
                </div>
              </div>
              
              {/* Task List Content */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                  <p className="mt-1 text-sm text-gray-500">Add a new task to get started.</p>
                  <div className="mt-6">
                    <button
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      + Add New Task
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {filteredTasks.map((task) => (
                    <div 
                      key={task.task_id} 
                      className={`px-4 py-4 ${getPriorityHoverBg(task.priority)} transition-colors duration-150 cursor-pointer ${
                        selectedTask && selectedTask.task_id === task.task_id 
                          ? 'bg-blue-50' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            task.status === 'completed' ? 'bg-green-500' : 
                            task.status === 'inProgress' ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                          <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
                      )}
                      
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {formatDate(task.deadline)}
                            {isPastDate(task.deadline) && task.status !== 'completed' && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Overdue</span>
                            )}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {task.assigned_to_name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* View All Button */}
              {filteredTasks.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    + View All Tasks
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Calendar Section */}
          {(viewMode === 'combined' || viewMode === 'calendar') && (
            <div className={`${viewMode === 'combined' ? 'lg:w-1/2' : 'w-full'} bg-white rounded-lg shadow overflow-hidden`}>
              <div className="border-b border-gray-200 px-4 py-3 sm:px-6 bg-white flex flex-col sm:flex-row justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">Task Calendar</h2>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={prevMonth} 
                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-medium text-gray-700">{getMonthName(currentDate)}</span>
                  <button 
                    onClick={nextMonth} 
                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const dateKey = day ? formatDateForKey(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      day
                    ) : '';
                    
                    const dayTasks = day && calendarTasks[dateKey] ? calendarTasks[dateKey] : [];
                    const isToday = day === new Date().getDate() && 
                                  currentDate.getMonth() === new Date().getMonth() && 
                                  currentDate.getFullYear() === new Date().getFullYear();
                    const isPast = day && new Date(dateKey) < new Date(new Date().setHours(0,0,0,0));
                    const highestPriority = getHighestPriorityForDay(dayTasks);
                    
                    let dayBg = 'bg-white';
                    let dayBorder = '';
                    
                    if (highestPriority === 'high') {
                      dayBg = 'bg-red-50';
                      dayBorder = 'border-red-200';
                    } else if (highestPriority === 'medium') {
                      dayBg = 'bg-amber-50';
                      dayBorder = 'border-amber-200';
                    } else if (highestPriority === 'low') {
                      dayBg = 'bg-emerald-50';
                      dayBorder = 'border-emerald-200';
                    }
                    
                    return (
                      <div 
                        key={index} 
                        className={`
                          ${day ? `min-h-[80px] border ${dayBorder} ${dayBg} rounded-md relative transition-all duration-150` : ''}
                          ${isToday ? 'ring-2 ring-blue-500' : ''}
                          ${isPast && !dayTasks.length ? 'bg-gray-50' : ''}
                          ${dayTasks.length ? 'cursor-pointer hover:shadow-md' : ''}
                          ${hoveredDate === dateKey ? 'transform scale-105 shadow-lg z-10' : ''}
                        `}
                        onClick={() => day && handleCalendarTileClick(day)}
                        onMouseEnter={() => day && setHoveredDate(dateKey)}
                        onMouseLeave={() => setHoveredDate(null)}
                      >
                        {day && (
                          <>
                            <div className={`
                              p-1 text-right text-xs font-medium
                              ${isToday ? 'text-blue-600' : isPast ? 'text-gray-500' : 'text-gray-800'}
                            `}>
                              {day}
                            </div>
                            
                            <div className="px-1 pb-1 overflow-hidden">
                              {dayTasks.slice(0, 2).map((task) => (
                                <div 
                                  key={task.task_id} 
                                  className={`
                                    mb-1 px-1 py-0.5 rounded text-xs truncate
                                    ${getPriorityColor(task.priority)} 
                                    ${task.status === 'completed' ? 'opacity-70' : ''}
                                  `}
                                  title={task.title}
                                >
                                  <div className="flex items-center">
                                    <div className={`
                                      w-2 h-2 rounded-full mr-1 flex-shrink-0
                                      ${task.status === 'completed' ? 'bg-green-300' : 
                                        task.status === 'inProgress' ? 'bg-blue-300' : 'bg-gray-300'}
                                    `}></div>
                                    <span className="truncate">{task.title}</span>
                                  </div>
                                </div>
                              ))}
                              {dayTasks.length > 2 && (
                                <div className="text-xs text-center text-gray-500">
                                  +{dayTasks.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedTask && (
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-transparent" onClick={() => setSelectedTask(null)}></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Task Details
                        </h3>
                        <button
                          onClick={() => setSelectedTask(null)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">
                          {selectedTask.title}
                        </h4>
                        
                        {selectedTask.description && (
                          <div className="bg-gray-50 p-3 rounded-md mb-4">
                            <p className="text-gray-700">{selectedTask.description}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Assigned to</p>
                            <p className="mt-1 text-sm text-gray-900">{selectedTask.assigned_to_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Created by</p>
                            <p className="mt-1 text-sm text-gray-900">{selectedTask.assigned_by_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Deadline</p>
                            <p className={`mt-1 text-sm ${
                              isPastDate(selectedTask.deadline) && selectedTask.status !== 'completed' 
                                ? 'text-red-600 font-medium' 
                                : 'text-gray-900'
                            }`}>
                              {formatDate(selectedTask.deadline)}
                              {isPastDate(selectedTask.deadline) && selectedTask.status !== 'completed' && (
                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Overdue</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Created</p>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTask.created_at)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-500 mb-2">Priority</p>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedTask.priority)}`}>
                            {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
                          <div className="flex flex-wrap gap-2">
                            {["todo", "inProgress", "completed"].map((status) => (
                              <button
                                key={status}
                                onClick={() => updateTaskStatus(selectedTask.task_id, status)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                  selectedTask.status === status
                                    ? getStatusInfo(status).color
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {getStatusInfo(status).label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setSelectedTask(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminCalendar;