import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calendar = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();
  
  const [selectedDate, setSelectedDate] = useState(currentDay);
  const [activeMonth, setActiveMonth] = useState(currentMonth);
  const [activeYear, setActiveYear] = useState(currentYear);
  
  // Add state for tasks and user information
  const [tasks, setTasks] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get API URL from environment variable
  const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

  // Fetch logged-in user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_URL}get_session_user`);
        if (response.data.type === 'success') {
          setUserInfo(response.data.user);
          // After getting user info, fetch their tasks
          fetchUserTasks(response.data.user.user_id);
        } else {
          setError('User not logged in or not found');
        }
      } catch (err) {
        setError('Error fetching user data: ' + err.message);
      }
    };

    fetchUserData();
  }, [API_URL]);

  // Fetch calendar tasks when month or year changes
  useEffect(() => {
    if (userInfo?.user_id) {
      fetchCalendarTasks();
    }
  }, [activeMonth, activeYear, userInfo]);

  // Function to fetch tasks for the calendar
  const fetchCalendarTasks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}get_calendar_tasks`, {
        params: {
          user_id: userInfo.user_id,
          month: activeMonth + 1, // API expects 1-12 for months
          year: activeYear
        }
      });
      
      if (response.data.type === 'success') {
        setTasks(response.data.tasks);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      setError('Error fetching tasks: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user tasks for the events list
  const fetchUserTasks = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}get_tasks`, {
        params: {
          user_id: userId
        }
      });
      
      if (response.data.type === 'success') {
        const upcomingTasks = response.data.tasks.slice(0, 4); // Show only first 4 tasks
        setTasks(upcomingTasks);
      }
    } catch (err) {
      setError('Error fetching tasks: ' + err.message);
    }
  };

  // Function to update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await axios.post(
        `${API_URL}update_task_status`,
        { task_id: taskId, status: newStatus }
      );
      
      if (response.data.type === 'success') {
        // Refresh tasks after update
        fetchCalendarTasks();
      }
    } catch (err) {
      setError('Error updating task: ' + err.message);
    }
  };

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
      const dateString = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      days.push({ 
        day, 
        isCurrentMonth: true,
        isToday: day === currentDay && activeMonth === currentMonth && activeYear === currentYear,
        hasEvents: tasks[dateString] && tasks[dateString].length > 0,
        dateString: dateString
      });
    }
    
    // Fill remaining cells to complete the grid
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - days.length;
    
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: i, isCurrentMonth: false });
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

  // Go to current month
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

  // Get task priority styling
  const getTaskPriorityStyles = (priority) => {
    switch(priority) {
      case 'high':
        return {
          container: 'bg-red-50 border-red-200',
          dot: 'bg-red-500',
          icon: (
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
            </svg>
          )
        };
      case 'medium':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          dot: 'bg-yellow-500',
          icon: (
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
            </svg>
          )
        };
      case 'low':
        return {
          container: 'bg-blue-50 border-blue-200',
          dot: 'bg-blue-500',
          icon: (
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
            </svg>
          )
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          dot: 'bg-gray-500',
          icon: null
        };
    }
  };

  // Get task status styling
  const getTaskStatusClass = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display
  const formatDateFromString = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get upcoming tasks
  const getUpcomingTasks = () => {
    if (!Array.isArray(tasks)) {
      // If tasks is an object (like from calendar tasks), convert to array
      return Object.values(tasks).flat().slice(0, 4);
    }
    return tasks.slice(0, 4);
  };

  // Function to get events for a specific date
  const getEventsForDate = (dateString) => {
    return tasks[dateString] || [];
  };

  // Function to determine if a date is today
  const isToday = (day) => {
    return day === currentDay && activeMonth === currentMonth && activeYear === currentYear;
  };

  // Selected day's tasks
  const selectedDayTasks = () => {
    if (selectedDate) {
      const formattedDate = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
      return getEventsForDate(formattedDate);
    }
    return [];
  };

  if (isLoading && !userInfo) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-700">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
            <p className="text-gray-600">
              {userInfo ? `Welcome, ${userInfo.username}` : 'View and manage your schedule with ease'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={goToToday}
              className="bg-white text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            <a 
              href="/create-task" 
              className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              New Task
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Events list */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Tasks</h2>
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button className="py-1 px-3 rounded-md bg-white shadow-sm text-gray-800 font-medium text-sm">All</button>
                <button className="py-1 px-3 rounded-md text-gray-600 text-sm">Pending</button>
                <button className="py-1 px-3 rounded-md text-gray-600 text-sm">Completed</button>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              {getUpcomingTasks().length > 0 ? (
                getUpcomingTasks().map((task) => {
                  const priorityStyles = getTaskPriorityStyles(task.priority);
                  return (
                    <div key={task.task_id} className={`p-4 rounded-lg border flex items-start transition-all duration-200 hover:shadow-md ${priorityStyles.container}`}>
                      <div className="mr-3 mt-1">
                        {priorityStyles.icon}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-800">{task.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                          </svg>
                          {task.deadline_formatted || formatDateFromString(task.deadline)}
                          <span className="mx-1">•</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTaskStatusClass(task.status)}`}>
                            {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {task.description}
                        </div>
                        {task.days_remaining && (
                          <div className="mt-2 text-xs">
                            {parseInt(task.days_remaining) < 0 ? (
                              <span className="text-red-600">Overdue by {Math.abs(parseInt(task.days_remaining))} days</span>
                            ) : parseInt(task.days_remaining) === 0 ? (
                              <span className="text-orange-600">Due today</span>
                            ) : (
                              <span className="text-green-600">{task.days_remaining} days remaining</span>
                            )}
                          </div>
                        )}
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        </svg>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-4 text-gray-500">
                  No upcoming tasks found
                </div>
              )}
            </div>
            
            <a 
              href="/tasks" 
              className="w-full py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
              </svg>
              View All Tasks
            </a>
          </div>

          {/* Right column - Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">{getMonthName(activeMonth)} {activeYear}</h2>
              <div className="flex items-center space-x-2">
                <button onClick={goToPreviousMonth} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <button onClick={goToNextMonth} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((dayObj, index) => (
                <div 
                  key={index} 
                  onClick={() => dayObj.isCurrentMonth && dayObj.day && setSelectedDate(dayObj.day)}
                  className={`
                    p-1 rounded-lg border transition-all duration-200
                    ${!dayObj.isCurrentMonth || !dayObj.day ? 'text-gray-300 border-transparent' : 'text-gray-700 hover:border-gray-300 cursor-pointer'}
                    ${dayObj.isToday ? 'font-bold text-indigo-600' : ''}
                    ${dayObj.day === selectedDate && dayObj.isCurrentMonth ? 'bg-indigo-50 border-indigo-200' : ''}
                  `}
                >
                  <div className="flex flex-col h-20">
                    <div className="text-right p-1">
                      {dayObj.day}
                      {dayObj.isToday && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>}
                    </div>
                    
                    {dayObj.hasEvents && dayObj.isCurrentMonth && (
                      <div className="mt-auto flex flex-col space-y-1 px-1">
                        {/* Show up to 2 task indicators */}
                        {getEventsForDate(dayObj.dateString).slice(0, 2).map((task, i) => (
                          <div 
                            key={i} 
                            className={`text-xs truncate px-1 py-0.5 rounded ${getTaskStatusClass(task.status)}`}
                            title={task.title}
                          >
                            {task.title.length > 10 ? task.title.substring(0, 10) + '...' : task.title}
                          </div>
                        ))}
                        
                        {/* Show count if there are more tasks */}
                        {getEventsForDate(dayObj.dateString).length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{getEventsForDate(dayObj.dateString).length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected date tasks */}
            {selectedDate && selectedDayTasks().length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-2">
                  Tasks for {getMonthName(activeMonth)} {selectedDate}, {activeYear}
                </h3>
                <div className="space-y-2">
                  {selectedDayTasks().map((task) => (
                    <div 
                      key={task.task_id} 
                      className={`p-3 rounded-lg border flex items-center ${getTaskPriorityStyles(task.priority).container}`}
                    >
                      <div className="mr-3">
                        {getTaskPriorityStyles(task.priority).icon}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-1">{task.description}</p>
                      </div>
                      <div className="ml-4">
                        <select 
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.task_id, e.target.value)}
                          className={`text-xs rounded px-2 py-1 border ${getTaskStatusClass(task.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;