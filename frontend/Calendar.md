import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calendar = () => {
  // Date management
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();
  
  const [selectedDate, setSelectedDate] = useState(currentDay);
  const [activeMonth, setActiveMonth] = useState(currentMonth);
  const [activeYear, setActiveYear] = useState(currentYear);
  const [tasks, setTasks] = useState({});
  const [statistics, setStatistics] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [viewMode, setViewMode] = useState('combined'); // 'combined', 'list', or 'calendar'

  // Get user from local storage or session storage
  useEffect(() => {
    const storage = localStorage.getItem('session_id') ? localStorage : sessionStorage;
    const userData = storage.getItem('user');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
        setError('Failed to load user data');
      }
    }
  }, []);

  // Fetch tasks when user, month, or year changes
  useEffect(() => {
    if (!user || !user.user_id) return;
    
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || '';
        
        // Fetch calendar tasks
        const calendarResponse = await axios.get(`${apiUrl}get_calendar_tasks`, {
          params: {
            user_id: user.user_id,
            month: activeMonth + 1, // API expects 1-12 for months
            year: activeYear
          },
          withCredentials: true
        });

        // Fetch all tasks for statistics
        const tasksResponse = await axios.get(`${apiUrl}get_tasks`, {
          params: {
            user_id: user.user_id
          },
          withCredentials: true
        });

        if (calendarResponse.data.type === 'success') {
          setTasks(calendarResponse.data.tasks || {});
        } else {
          setError(calendarResponse.data.message || 'Failed to fetch calendar tasks');
        }

        if (tasksResponse.data.type === 'success') {
          const allTasks = tasksResponse.data.tasks || [];
          
          // Calculate statistics
          const stats = {
            total: allTasks.length,
            todo: allTasks.filter(task => task.status === 'pending').length,
            inProgress: allTasks.filter(task => task.status === 'in_progress').length,
            completed: allTasks.filter(task => task.status === 'completed').length
          };
          
          setStatistics(stats);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, activeMonth, activeYear]);

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(activeMonth, activeYear);
  const firstDayOfMonth = getFirstDayOfMonth(activeMonth, activeYear);
  
  // Generate calendar days array
  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = tasks[dateStr] || [];
      
      days.push({ 
        day, 
        isCurrentMonth: true,
        isToday: day === currentDay && activeMonth === currentMonth && activeYear === currentYear,
        hasEvents: dayTasks.length > 0,
        tasks: dayTasks,
        highPriorityTasks: dayTasks.filter(task => task.priority === 'high').length,
        mediumPriorityTasks: dayTasks.filter(task => task.priority === 'medium').length,
        lowPriorityTasks: dayTasks.filter(task => task.priority === 'low').length
      });
    }
    
    // Add days of the next month
    const totalDays = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    let nextMonthDay = 1;
    for (let i = days.length; i < totalDays; i++) {
      days.push({ day: nextMonthDay++, isCurrentMonth: false });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  
  // Month navigation
  const goToPreviousMonth = () => {
    if (activeMonth === 0) {
      setActiveMonth(11);
      setActiveYear(activeYear - 1);
    } else {
      setActiveMonth(activeMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (activeMonth === 11) {
      setActiveMonth(0);
      setActiveYear(activeYear + 1);
    } else {
      setActiveMonth(activeMonth + 1);
    }
  };

  // Reset to current month/year
  const goToToday = () => {
    setActiveMonth(currentMonth);
    setActiveYear(currentYear);
    setSelectedDate(currentDay);
  };

  // Get month name
  const getMonthName = (month) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
  };

  // Get selected day tasks
  const getSelectedDayTasks = () => {
    if (!selectedDate) return [];
    
    const dateStr = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    return tasks[dateStr] || [];
  };

  const selectedDayTasks = getSelectedDayTasks();
  
  // Get all tasks across all dates
  const getAllTasks = () => {
    const allTasks = [];
    Object.entries(tasks).forEach(([date, taskList]) => {
      taskList.forEach(task => {
        // Add date to each task object
        allTasks.push({...task, date});
      });
    });
    return allTasks;
  };

  // Filter tasks based on active tab
  const getFilteredTasks = () => {
    const allTasks = getAllTasks();
    
    switch(activeTab) {
      case 'upcoming':
        return allTasks
          .filter(task => task.status !== 'completed')
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      case 'all':
        return allTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      case 'pending':
        return allTasks.filter(task => task.status === 'pending');
      case 'completed':
        return allTasks.filter(task => task.status === 'completed');
      default:
        return allTasks;
    }
  };

  // Tasks for list view (all tasks)
  const allFilteredTasks = getFilteredTasks();
  // Tasks for task widget (limited to 5)
  const filteredTasks = getFilteredTasks().slice(0, 5);

  // Format date for readable display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color class
  const getStatusColorClass = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-gray-200 text-gray-800';
      case 'in_progress':
        return 'bg-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  // Get priority color class
  const getPriorityColorClass = (priority) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority dot color
  const getPriorityDotColor = (priority) => {
    switch(priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Render loading state
  const renderLoading = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="text-center py-8">
      <div className="text-red-500 mb-2">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p className="text-red-500 font-medium">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );

  // Render a single task item
  const renderTaskItem = (task) => (
    <div key={task.task_id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`w-3 h-3 rounded-full mt-1.5 mr-3 ${getPriorityDotColor(task.priority)}`}></div>
          <div>
            <h3 className="font-medium text-gray-800">{task.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColorClass(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              <span className="mx-2">•</span>
              <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs uppercase font-medium ${
          task.status === 'pending' ? 'bg-gray-100 text-gray-800' :
          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  );

  // Render tasks tab component
  const renderTasksTab = () => (
    <div className="bg-white rounded-lg p-4 shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh
        </button>
      </div>
      
      {/* Task tabs */}
      <div className="flex border-b mb-4 overflow-x-auto">
        <button 
          className={`px-4 py-2 ${activeTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>
      
      {/* Task list */}
      {loading ? renderLoading() : error ? renderError() : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <p className="text-gray-500 mt-4">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(renderTaskItem)}
          
          <button className="w-full py-2 text-center text-blue-600 hover:bg-blue-50 border border-dashed border-blue-300 rounded-lg">
            + View All Tasks
          </button>
        </div>
      )}
    </div>
  );

  // Render calendar component
  const renderCalendar = () => (
    <div className="bg-white rounded-lg p-4 shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Task Calendar</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToToday}
            className="text-sm px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md mr-2"
          >
            Today
          </button>
          <button 
            onClick={goToPreviousMonth} 
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <span className="text-gray-600 font-medium">{getMonthName(activeMonth)} {activeYear}</span>
          <button 
            onClick={goToNextMonth} 
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Days of week */}
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="text-center py-2 text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {loading ? (
          <div className="col-span-7">
            {renderLoading()}
          </div>
        ) : error ? (
          <div className="col-span-7">
            {renderError()}
          </div>
        ) : (
          calendarDays.map((dayObj, index) => (
            <div
              key={index}
              onClick={() => dayObj.isCurrentMonth && dayObj.day && setSelectedDate(dayObj.day)}
              className={`
                p-1 border rounded-md min-h-16 transition-all ${
                  !dayObj.isCurrentMonth 
                    ? 'text-gray-300 bg-gray-50' 
                    : dayObj.isToday
                      ? 'border-blue-500 bg-blue-50'
                      : dayObj.day === selectedDate
                        ? 'border-gray-400 bg-gray-100'
                        : 'hover:border-gray-300 cursor-pointer'
                }
              `}
            >
              <div className="text-right text-xs p-1">{dayObj.day}</div>
              
              {dayObj.isCurrentMonth && dayObj.day && dayObj.hasEvents && (
                <div className="mt-1">
                  {dayObj.highPriorityTasks > 0 && (
                    <div className="text-xs rounded px-1 py-0.5 mb-0.5 bg-red-100 text-red-800">
                      {dayObj.highPriorityTasks} high priority
                    </div>
                  )}
                  
                  {dayObj.mediumPriorityTasks > 0 && (
                    <div className="text-xs rounded px-1 py-0.5 mb-0.5 bg-yellow-100 text-yellow-800">
                      {dayObj.mediumPriorityTasks} medium priority
                    </div>
                  )}
                  
                  {dayObj.lowPriorityTasks > 0 && (
                    <div className="text-xs rounded px-1 py-0.5 mb-0.5 bg-green-100 text-green-800">
                      {dayObj.lowPriorityTasks} low priority
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Selected day tasks */}
      {selectedDate && !loading && !error && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-medium text-gray-800 mb-2">
            Tasks for {getMonthName(activeMonth)} {selectedDate}, {activeYear}
          </h3>
          
          {selectedDayTasks.length > 0 ? (
            <div className="space-y-2">
              {selectedDayTasks.map(task => (
                <div 
                  key={task.task_id} 
                  className={`p-3 rounded-lg border ${
                    task.priority === 'high' ? 'border-red-200 bg-red-50' : 
                    task.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' : 
                    'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium">{task.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'pending' ? 'bg-gray-100 text-gray-800' : 
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Assigned by: {task.assigned_by_name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No tasks for this day</p>
          )}
        </div>
      )}
    </div>
  );

  // Render list view (full task list with expanded features)
  const renderListView = () => (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">All Tasks</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b mb-4 overflow-x-auto">
        <button 
          className={`px-4 py-2 ${activeTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>
      
      {/* List header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-t-lg font-medium text-gray-600 border-b">
        <div className="col-span-5">Task</div>
        <div className="col-span-2">Due Date</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1">Action</div>
      </div>
      
      {/* Task list */}
      {loading ? renderLoading() : error ? renderError() : allFilteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <p className="text-gray-500 mt-4">No tasks found</p>
        </div>
      ) : (
        <div className="divide-y">
          {allFilteredTasks.map(task => (
            <div key={task.task_id} className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center">
              <div className="col-span-5">
                <div className="flex items-start">
                  <div className={`w-3 h-3 rounded-full mt-1.5 mr-3 ${getPriorityDotColor(task.priority)}`}></div>
                  <div>
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-2 text-sm text-gray-600">
                {formatDate(task.deadline)}
              </div>
              <div className="col-span-2">
                <span className={`px-3 py-1 rounded-full text-xs ${getPriorityColorClass(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
              <div className="col-span-2">
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColorClass(task.status)}`}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                <button className="text-gray-500 hover:text-gray-700 mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
                <button className="text-gray-500 hover:text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render calendar view (expanded calendar with more features)
  const renderCalendarView = () => (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Calendar View</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToToday}
            className="text-sm px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md mr-2"
          >
            Today
          </button>
          <button 
            onClick={goToPreviousMonth} 
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <span className="text-gray-600 font-medium">{getMonthName(activeMonth)} {activeYear}</span>
          <button 
            onClick={goToNextMonth} 
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          <button 
            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Task
          </button>
        </div>
      </div>
      
      {/* Calendar legend */}
      <div className="flex items-center justify-end mb-2 text-xs">
        <div className="flex items-center mr-3">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center mr-3">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span>Low Priority</span>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Days of week */}
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
          <div key={day} className="text-center py-2 font-medium text-gray-500 border-b">
            {day}
          </div>
        ))}
        
        {/* Calendar days - larger cells for full view */}
        {loading ? (
          <div className="col-span-7">
            {renderLoading()}
          </div>
        ) : error ? (
          <div className="col-span-7">
            {renderError()}
          </div>
        ) : (
          calendarDays.map((dayObj, index) => (
            <div
              key={index}
              onClick={() => dayObj.isCurrentMonth && dayObj.day && setSelectedDate(dayObj.day)}
              className={`
                p-2 border rounded-md min-h-32 transition-all ${
                  !dayObj.isCurrentMonth 
                    ? 'text-gray-300 bg-gray-50' 
                    : dayObj.isToday
                      ? 'border-blue-500 bg-blue-50'
                      : dayObj.day === selectedDate
                        ? 'border-gray-400 bg-gray-100'
                        : 'hover:border-gray-300 cursor-pointer'
                }
              `}
            >
              <div className={`text-right font-medium ${
                dayObj.isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center ml-auto' : ''
              }`}>
                {dayObj.day}
              </div>
              
              {dayObj.isCurrentMonth && dayObj.day && dayObj.hasEvents && (
                <div className="mt-2 space-y-1">
                  {dayObj.tasks.map((task, i) => (
                    <div 
                      key={i}
                      className={`text-xs p-1.5 rounded-md mb-1 ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800 border-l-2 border-red-500' 
                          : task.priority === 'medium' 
                            ? 'bg-yellow-100 text-yellow-800 border-l-2 border-yellow-500' 
                            : 'bg-green-100 text-green-800 border-l-2 border-green-500'
                      }`}
                      title={task.title}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColorClass(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Task Management Calendar</h1>
              <p className="text-gray-600">Monitor and manage all team tasks in one place</p>
            </div>
            <div className="hidden md:block">
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('combined')}
                  className={`px-4 py-2 rounded-md ${viewMode === 'combined' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700'}`}
                >
                  Combined View
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700'}`}
                >
                  List View
                </button>
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-md ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700'}`}
                >
                  Calendar View
                </button>
              </div>
            </div>
            <div className="md:hidden">
              <select 
                className="form-select rounded-md border-gray-300"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <option value="combined">Combined View</option>
                <option value="list">List View</option>
                <option value="calendar">Calendar View</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Statistics - show in all views */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm">Total Tasks</h3>
                <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
            <div className="w-full h-2 bg-blue-100 rounded-full mt-3">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-400">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm">To Do</h3>
                <p className="text-2xl font-bold text-gray-600">{statistics.todo}</p>
              </div>
              <div className="bg-gray-100 rounded-full p-2">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-3">
              <div className="h-2 bg-gray-500 rounded-full" style={{ width: `${statistics.total ? (statistics.todo / statistics.total) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm">In Progress</h3>
                <p className="text-2xl font-bold text-blue-600">{statistics.inProgress}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div className="w-full h-2 bg-blue-100 rounded-full mt-3">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${statistics.total ? (statistics.inProgress / statistics.total) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm">Completed</h3>
                <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
              </div>
              <div className="bg-green-100 rounded-full p-2">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <div className="w-full h-2 bg-green-100 rounded-full mt-3">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: `${statistics.total ? (statistics.completed / statistics.total) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>
        
        {/* Main content - changes based on view mode */}
        {viewMode === 'combined' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column - Tasks */}
            <div className="lg:col-span-5">
              {renderTasksTab()}
            </div>
            
            {/* Right column - Calendar */}
            <div className="lg:col-span-7">
              {renderCalendar()}
            </div>
          </div>
        )}
        
        {viewMode === 'list' && renderListView()}
        
        {viewMode === 'calendar' && renderCalendarView()}
      </div>
    </div>
  );
};

export default Calendar;