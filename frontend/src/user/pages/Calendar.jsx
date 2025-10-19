import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskDetailsModal from '../components/TaskDetailsModal';

const Calendar = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();

  const [activeMonth, setActiveMonth] = useState(currentMonth);
  const [activeYear, setActiveYear] = useState(currentYear);
  const [tasks, setTasks] = useState({});
  const [statistics, setStatistics] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('combined');
  const [hoveredDate, setHoveredDate] = useState(null);
  const [calendarTasks, setCalendarTasks] = useState({});
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

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

  useEffect(() => {
    if (!user || !user.user_id) return;
    fetchTasks();
  }, [user, activeMonth, activeYear]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || '';
      const calendarResponse = await axios.get(`${apiUrl}get_calendar_tasks`, {
        params: {
          user_id: user.user_id,
          month: activeMonth + 1,
          year: activeYear,
          is_admin: user.role === 'Admin',
        },
        withCredentials: true,
      });

      const tasksResponse = await axios.get(`${apiUrl}get_tasks`, {
        params: {
          user_id: user.user_id,
          is_admin: user.role === 'Admin',
        },
        withCredentials: true,
      });

      if (calendarResponse.data.type === 'success') {
        const processedTasks = {};
        Object.keys(calendarResponse.data.tasks || {}).forEach((dateKey) => {
          processedTasks[dateKey] = calendarResponse.data.tasks[dateKey].map((task) => ({
            ...task,
            assigned_users: Array.isArray(task.assigned_users) ? task.assigned_users : [],
          }));
        });
        setCalendarTasks(processedTasks);
        setTasks(processedTasks);
      } else {
        throw new Error(calendarResponse.data.message || 'Failed to fetch calendar tasks');
      }

      if (tasksResponse.data.type === 'success') {
        const allTasks = tasksResponse.data.tasks || [];
        const stats = {
          total: allTasks.length,
          todo: allTasks.filter((task) => task.status === 'todo').length,
          inProgress: allTasks.filter((task) => task.status === 'inProgress').length,
          completed: allTasks.filter((task) => task.status === 'completed').length,
        };
        setStatistics(stats);
      } else {
        throw new Error(tasksResponse.data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
        setTimeout(fetchTasks, 2000 * (retryCount + 1));
      } else {
        setError('Failed to load tasks after multiple attempts. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(activeMonth, activeYear);
  const firstDayOfMonth = getFirstDayOfMonth(activeMonth, activeYear);

  const generateCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = calendarTasks[dateStr] || [];
      days.push({
        day,
        isCurrentMonth: true,
        isToday: day === currentDay && activeMonth === currentMonth && activeYear === currentYear,
        hasEvents: dayTasks.length > 0,
        tasks: dayTasks,
        highPriorityTasks: dayTasks.filter((task) => task.priority === 'high').length,
        mediumPriorityTasks: dayTasks.filter((task) => task.priority === 'medium').length,
        lowPriorityTasks: dayTasks.filter((task) => task.priority === 'low').length,
      });
    }
    const totalDays = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    let nextMonthDay = 1;
    for (let i = days.length; i < totalDays; i++) {
      days.push({ day: nextMonthDay++, isCurrentMonth: false });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  const prevMonth = () => {
    if (activeMonth === 0) {
      setActiveMonth(11);
      setActiveYear(activeYear - 1);
    } else {
      setActiveMonth(activeMonth - 1);
    }
  };

  const nextMonth = () => {
    if (activeMonth === 11) {
      setActiveMonth(0);
      setActiveYear(activeYear + 1);
    } else {
      setActiveMonth(activeMonth + 1);
    }
  };

  const getMonthName = (month) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return monthNames[month];
  };

  const getAllTasks = () => {
    const allTasks = [];
    Object.values(tasks).forEach((taskList) => {
      taskList.forEach((task) => allTasks.push({
        ...task,
        assigned_users: Array.isArray(task.assigned_users) ? task.assigned_users : [],
      }));
    });
    return allTasks;
  };

  const getFilteredTasks = () => {
    const allTasks = getAllTasks();
    switch (activeTab) {
      case 'upcoming':
        return allTasks
          .filter((task) => task.status !== 'completed')
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      case 'all':
        return allTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      case 'pending':
        return allTasks.filter((task) => task.status === 'todo');
      case 'completed':
        return allTasks.filter((task) => task.status === 'completed');
      default:
        return allTasks;
    }
  };

  const filteredTasks = getFilteredTasks().slice(0, 5);

  const getPriorityColorClass = (priority) => {
    switch (priority) {
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isPastDate = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getHighestPriorityForDay = (tasks) => {
    if (!tasks || tasks.length === 0) return null;
    if (tasks.some((task) => task.priority === 'high')) return 'high';
    if (tasks.some((task) => task.priority === 'medium')) return 'medium';
    if (tasks.some((task) => task.priority === 'low')) return 'low';
    return null;
  };

  const getUserInitials = (users) => {
    if (!Array.isArray(users) || users.length === 0) return '';
    if (users.length === 1) {
      return users[0].username ? users[0].username.split(' ').map((n) => n[0]).join('').toUpperCase() : '?';
    }
    return `+${users.length}`;
  };

  const handleTaskClick = (task) => {
    console.log('Task clicked:', task);
    // Ensure assigned_users is an array before setting selectedTask
    setSelectedTask({
      ...task,
      assigned_users: Array.isArray(task.assigned_users) ? task.assigned_users : [],
    });
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    console.log('Closing modal');
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hey! It's Calendar</h1>
              <p className="text-gray-600 mt-1">Monitor and manage all team tasks</p>
            </div>
            <div className="flex flex-wrap gap-2">
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
        {/* Main Content Area */}
        <div className={`flex flex-col ${viewMode === 'combined' ? 'lg:flex-row' : ''} gap-6`}>
          {/* Task List Section */}
          {(viewMode === 'combined' || viewMode === 'list') && (
            <div className={`${viewMode === 'combined' ? 'lg:w-1/2' : 'w-full'} bg-white rounded-lg shadow overflow-hidden`}>
              <div className="border-b border-gray-200">
                <div className="flex justify-between items-center px-4 py-3 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                  <button
                    onClick={fetchTasks}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </button>
                </div>
                <div className="px-4">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'upcoming'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('upcoming')}
                    >
                      Upcoming
                    </button>
                    <button
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'all'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('all')}
                    >
                      All
                    </button>
                    <button
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'completed'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('completed')}
                    >
                      Completed
                    </button>
                  </nav>
                </div>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                  <p className="mt-1 text-sm text-gray-500">Add a new task to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.task_id}
                      className={`px-4 py-4 transition-colors duration-150 cursor-pointer ${
                        selectedTask && selectedTask.task_id === task.task_id
                          ? 'bg-blue-50'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-3 ${
                              task.status === 'completed'
                                ? 'bg-green-500'
                                : task.status === 'inProgress'
                                ? 'bg-blue-500'
                                : 'bg-gray-300'
                            }`}
                          ></div>
                          <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColorClass(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-600 text-white text-xs font-medium"
                            title={task.assigned_users.map((u) => u.username).join(', ')}
                          >
                            {getUserInitials(task.assigned_users)}
                          </span>
                        </div>
                      </div>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
                      )}
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {formatDate(task.deadline)}
                            {isPastDate(task.deadline) && task.status !== 'completed' && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                Overdue
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {task.assigned_users.length > 0
                            ? task.assigned_users.map((u) => u.username).join(', ')
                            : 'Unassigned'}
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-medium text-gray-700">
                    {getMonthName(activeMonth)} {activeYear}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dayInfo, index) => {
                    const day = dayInfo.day;
                    const dateStr = day
                      ? `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      : '';
                    const dayTasks = day && calendarTasks[dateStr] ? calendarTasks[dateStr] : [];
                    const isToday = dayInfo.isToday;
                    const isPast = day && new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
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
                        className={`min-h-[80px] border ${dayBorder} ${dayBg} rounded-md relative transition-all duration-150 ${
                          isToday ? 'ring-2 ring-blue-500' : ''
                        } ${isPast && !dayTasks.length ? 'bg-gray-50' : ''} ${
                          dayTasks.length ? 'cursor-pointer hover:shadow-md' : ''
                        } ${hoveredDate === dateStr ? 'transform scale-105 shadow-lg z-10' : ''} ${
                          !dayInfo.isCurrentMonth ? 'opacity-30' : ''
                        }`}
                        onMouseEnter={() => day && setHoveredDate(dateStr)}
                        onMouseLeave={() => setHoveredDate(null)}
                        onClick={() => {
                          if (dayTasks.length > 0) {
                            console.log('Calendar day clicked, task:', dayTasks[0]);
                            handleTaskClick(dayTasks[0]);
                          }
                        }}
                      >
                        {day && (
                          <>
                            <div
                              className={`p-1 text-right text-xs font-medium ${
                                isToday ? 'text-blue-600' : isPast ? 'text-gray-500' : 'text-gray-800'
                              }`}
                            >
                              {day}
                            </div>
                            <div className="px-1 pb-1 overflow-hidden">
                              {dayTasks.slice(0, 2).map((task) => (
                                <div
                                  key={task.task_id}
                                  className={`mb-1 px-1 py-0.5 rounded text-xs truncate flex items-center justify-between ${getPriorityColorClass(
                                    task.priority
                                  )}`}
                                  title={`${task.title} (${task.assigned_users.map((u) => u.username).join(', ')})`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Task in calendar clicked:', task);
                                    handleTaskClick(task);
                                  }}
                                >
                                  <span className="flex-1 truncate">{task.title}</span>
                                  <span
                                    className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-slate-600 text-white text-[10px] font-medium"
                                    title={task.assigned_users.map((u) => u.username).join(', ')}
                                  >
                                    {getUserInitials(task.assigned_users)}
                                  </span>
                                </div>
                              ))}
                              {dayTasks.length > 2 && (
                                <div className="text-xs text-gray-500 mt-1">+{dayTasks.length - 2} more</div>
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

        {/* Task Details Modal */}
        {isTaskModalOpen && selectedTask && (
          <TaskDetailsModal task={selectedTask} onClose={closeTaskModal} />
        )}
      </div>
    </div>
  );
};

export default Calendar;