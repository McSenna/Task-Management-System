import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const TaskFlow = () => {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    completed: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineUpdates, setOfflineUpdates] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTask, setRequestTask] = useState(null);
  const [requestReason, setRequestReason] = useState('');
  const [requestStatus, setRequestStatus] = useState(null);

  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineUpdates();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const storedOfflineUpdates = localStorage.getItem('kanbanOfflineUpdates');
    if (storedOfflineUpdates) {
      setOfflineUpdates(JSON.parse(storedOfflineUpdates));
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      setIsLoading(true);
      
      try {
        const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
        let user = null;
        
        if (userStr) {
          user = JSON.parse(userStr);
          setCurrentUser(user);
        } else if (navigator.onLine) {
          const userResponse = await axios.get(`${apiUrl}get_session_user`);
          if (userResponse.data.type === 'success') {
            user = userResponse.data.user;
            setCurrentUser(user);
          }
        }
        
        if (user) {
          await fetchTasks(user.user_id);
        } else {
          setError('No user found. Please log in.');
        }
      } catch (err) {
        console.error('Error fetching user or tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndTasks();
  }, [apiUrl]);

  const fetchTasks = async (userId) => {
    try {
      const cachedTasksStr = localStorage.getItem(`userTasks_${userId}`);
      
      if (!navigator.onLine && cachedTasksStr) {
        const cachedTasks = JSON.parse(cachedTasksStr);
        organizeTasks(cachedTasks);
        return;
      }
      
      if (navigator.onLine) {
        const response = await axios.get(`${apiUrl}get_tasks`, {
          params: { user_id: userId }
        });
        
        if (response.data.type === 'success') {
          localStorage.setItem(`userTasks_${userId}`, JSON.stringify(response.data.tasks));
          organizeTasks(response.data.tasks);
        } else {
          setError('Failed to load tasks.');
        }
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    }
  };

  const organizeTasks = (taskList) => {
    const organized = {
      todo: [],
      inProgress: [],
      completed: []
    };
    
    taskList.forEach(task => {
      const status = ['todo', 'inProgress', 'completed'].includes(task.status) ? task.status : 'todo';
      organized[status].push({
        ...task,
        task_id: String(task.task_id)
      });
    });
    
    setTasks(organized);
  };

  const storeLogs = async (action) => {
    try {
      await axios.put(`${apiUrl}store_logs`, {
        user_id: currentUser?.user_id,
        user_name: currentUser?.name || currentUser?.username || 'Unknown User',
        action,
      });
    } catch (error) {
      console.error('Error storing logs', error);
    }
  };

  const syncOfflineUpdates = async () => {
    if (offlineUpdates.length === 0) return;
    
    const updatesCopy = [...offlineUpdates];
    const failedUpdates = [];
    
    for (const update of updatesCopy) {
      try {
        if (update.type === 'status_change') {
          await axios.post(`${apiUrl}update_task_status`, {
            task_id: update.taskId,
            task_title: update.taskTitle,
            status: update.destinationStatus
          });
          await storeLogs(`Task "${update.taskTitle}" status changed from ${update.sourceStatus} to ${update.destinationStatus} (synced from offline by ${currentUser?.name || currentUser?.username || 'Unknown User'})`);
        } else if (update.type === 'status_request') {
          await axios.post(`${apiUrl}create_task_status_request`, {
            task_id: update.taskId,
            user_id: update.userId,
            current_status: update.sourceStatus,
            requested_status: update.destinationStatus,
            request_reason: update.requestReason
          });
          await storeLogs(`Task "${update.taskTitle}" status change request from ${update.sourceStatus} to ${update.destinationStatus} (synced from offline by ${currentUser?.name || currentUser?.username || 'Unknown User'})`);
        }
      } catch (err) {
        console.error('Failed to sync update:', err);
        failedUpdates.push(update);
      }
    }
    
    setOfflineUpdates(failedUpdates);
    localStorage.setItem('kanbaruOfflineUpdates', JSON.stringify(failedUpdates));
    
    if (failedUpdates.length < updatesCopy.length && currentUser) {
      fetchTasks(currentUser.user_id);
    }
  };

  const isMoveAllowed = (sourceStatus, destStatus) => {
    if (sourceStatus === 'todo' && destStatus === 'inProgress') return true;
    return false; 
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    const sourceStatus = source.droppableId;
    const destinationStatus = destination.droppableId;

    const tasksCopy = JSON.parse(JSON.stringify(tasks));
    const [movedTask] = tasksCopy[sourceStatus].splice(source.index, 1);
    const taskTitle = movedTask.title;

    if (isMoveAllowed(sourceStatus, destinationStatus)) {
      movedTask.status = destinationStatus;
      tasksCopy[destinationStatus].splice(destination.index, 0, movedTask);
      setTasks(tasksCopy);
      
      const userName = currentUser?.name || currentUser?.username || 'Unknown User';
      const logAction = `Task ${draggableId} "${taskTitle}" status changed from ${sourceStatus} to ${destinationStatus} by ${userName}`;
      
      if (navigator.onLine) {
        try {
          await axios.post(`${apiUrl}update_task_status`, {
            task_id: draggableId,
            task_title: taskTitle,
            status: destinationStatus,
          });
          await storeLogs(logAction);
          if (currentUser) {
            const allTasks = [
              ...tasksCopy.todo,
              ...tasksCopy.inProgress,
              ...tasksCopy.completed,
            ];
            localStorage.setItem(`userTasks_${currentUser.user_id}`, JSON.stringify(allTasks));
          }
        } catch (err) {
          console.error("Error updating task status:", err);
          setTasks(tasks);
          setError("Failed to update task status. Please try again.");
          setTimeout(() => setError(null), 1500);
        }
      } else {
        const update = {
          type: 'status_change',
          taskId: draggableId,
          taskTitle: taskTitle,
          sourceStatus,
          destinationStatus,
          timestamp: new Date().toISOString(),
        };
        const updatedOfflineUpdates = [...offlineUpdates, update];
        setOfflineUpdates(updatedOfflineUpdates);
        localStorage.setItem('kanbanOfflineUpdates', JSON.stringify(updatedOfflineUpdates));
        await storeLogs(logAction);
        if (currentUser) {
          const allTasks = [
            ...tasksCopy.todo,
            ...tasksCopy.inProgress,
            ...tasksCopy.completed,
          ];
          localStorage.setItem(`userTasks_${currentUser.user_id}`, JSON.stringify(allTasks));
        }
      }
    } else {
      setRequestTask({
        task_id: draggableId,
        task_title: taskTitle,
        source_status: sourceStatus,
        destination_status: destinationStatus,
        index: source.index
      });
      setRequestStatus(destinationStatus);
      setShowRequestModal(true);
    }
  };

  const submitStatusRequest = async () => {
    if (!requestReason.trim()) {
      setError('Please provide a reason for the status change request.');
      setTimeout(() => setError(null), 1500);
      return;
    }

    const requestData = {
      task_id: requestTask.task_id,
      user_id: currentUser.user_id,
      current_status: requestTask.source_status,
      requested_status: requestTask.destination_status,
      request_reason: requestReason
    };

    const logAction = `User ${currentUser?.name || currentUser?.username || 'Unknown User'} requested status change for task "${requestTask.task_title}" from ${requestTask.source_status} to ${requestTask.destination_status}`;

    if (navigator.onLine) {
      try {
        const response = await axios.post(`${apiUrl}create_task_status_request`, requestData);
        if (response.data.type === 'success') {
          await storeLogs(logAction);
          setShowRequestModal(false);
          setRequestReason('');
          setError('Status change request submitted. Waiting for admin approval.');
          setTimeout(() => setError(null), 1500);
        } else {
          setError(response.data.message);
          setTimeout(() => setError(null), 1500);
        }
      } catch (err) {
        console.error('Error submitting status request:', err);
        setError('Failed to submit status request. Please try again.');
        setTimeout(() => setError(null), 1500);
      }
    } else {
      const update = {
        type: 'status_request',
        taskId: requestTask.task_id,
        userId: currentUser.user_id,
        taskTitle: requestTask.task_title,
        sourceStatus: requestTask.source_status,
        destinationStatus: requestTask.destination_status,
        requestReason: requestReason,
        timestamp: new Date().toISOString(),
      };
      const updatedOfflineUpdates = [...offlineUpdates, update];
      setOfflineUpdates(updatedOfflineUpdates);
      localStorage.setItem('kanbanOfflineUpdates', JSON.stringify(updatedOfflineUpdates));
      await storeLogs(logAction);
      setShowRequestModal(false);
      setRequestReason('');
      setError('Status change request queued for sync when online.');
      setTimeout(() => setError(null), 1500);
    }
  };

  const getPriorityBadge = (priority) => {
    const baseClasses = "text-xs font-medium px-2 py-1 rounded-full";
    
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'medium':
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'low':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysRemainingInfo = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let text = '';
    let classes = 'text-xs';
    
    if (diffDays < 0) {
      text = `${Math.abs(diffDays)} days overdue`;
      classes += ' text-red-600';
    } else if (diffDays === 0) {
      text = 'Due today';
      classes += ' text-amber-600 font-medium';
    } else if (diffDays === 1) {
      text = 'Due tomorrow';
      classes += ' text-amber-600';
    } else if (diffDays <= 3) {
      text = `${diffDays} days left`;
      classes += ' text-amber-600';
    } else {
      text = `${diffDays} days left`;
      classes += ' text-gray-500';
    }
    
    return { text, classes };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">My Tasks</h1>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="bg-gray-50 rounded-lg shadow">
            <div className="bg-gray-100 px-4 py-3 rounded-t-lg border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-700 flex items-center">
                <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                To Do
                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {tasks.todo.length}
                </span>
              </h2>
            </div>
            
            <Droppable droppableId="todo">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 min-h-[12rem] h-[calc(100vh-12rem)] overflow-y-auto ${
                    snapshot.isDraggingOver ? 'bg-gray-100' : ''
                  }`}
                >
                  {tasks.todo.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-gray-400 border border-dashed border-gray-300 rounded-lg">
                      <p>No tasks</p>
                    </div>
                  ) : (
                    tasks.todo.map((task, index) => (
                      <Draggable 
                        key={task.task_id} 
                        draggableId={task.task_id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 ${
                              snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                            } transition-shadow`}
                            style={{
                              ...provided.draggableProps.style
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-gray-800">{task.title}</h3>
                              <span className={getPriorityBadge(task.priority)}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center text-xs text-gray-500 gap-y-2">
                              <div className="flex items-center mr-4">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                                </svg>
                                From: {task.assigned_by_name || 'Admin'}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                                </svg>
                                {formatDate(task.deadline)}
                              </div>
                              <div className="ml-auto">
                                <span className={getDaysRemainingInfo(task.deadline).classes}>
                                  {getDaysRemainingInfo(task.deadline).text}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          
          {/* In Progress Column */}
          <div className="bg-gray-50 rounded-lg shadow">
            <div className="bg-blue-50 px-4 py-3 rounded-t-lg border-b border-blue-100">
              <h2 className="text-lg font-medium text-blue-700 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                In Progress
                <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {tasks.inProgress.length}
                </span>
              </h2>
            </div>
            
            <Droppable droppableId="inProgress">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 min-h-[12rem] h-[calc(100vh-12rem)] overflow-y-auto ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  }`}
                >
                  {tasks.inProgress.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-gray-400 border border-dashed border-gray-300 rounded-lg">
                      <p>No tasks in progress</p>
                    </div>
                  ) : (
                    tasks.inProgress.map((task, index) => (
                      <Draggable
                        key={task.task_id}
                        draggableId={task.task_id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 mb-3 rounded-lg shadow-sm border-l-4 border-blue-400 border-t border-r border-b ${
                              snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                            } transition-shadow`}
                            style={{
                              ...provided.draggableProps.style
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-gray-800">{task.title}</h3>
                              <span className={getPriorityBadge(task.priority)}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center text-xs text-gray-500 gap-y-2">
                              <div className="flex items-center mr-4">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                                </svg>
                                From: {task.assigned_by_name || 'Admin'}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                                </svg>
                                {formatDate(task.deadline)}
                              </div>
                              <div className="ml-auto">
                                <span className={getDaysRemainingInfo(task.deadline).classes}>
                                  {getDaysRemainingInfo(task.deadline).text}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          
          <div className="bg-gray-50 rounded-lg shadow">
            <div className="bg-green-50 px-4 py-3 rounded-t-lg border-b border-green-100">
              <h2 className="text-lg font-medium text-green-700 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Completed
                <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                  {tasks.completed.length}
                </span>
              </h2>
            </div>
            
            <Droppable droppableId="completed">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 min-h-[12rem] h-[calc(100vh-12rem)] overflow-y-auto ${
                    snapshot.isDraggingOver ? 'bg-green-50' : ''
                  }`}
                >
                  {tasks.completed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-gray-400 border border-dashed border-gray-300 rounded-lg">
                      <p>No completed tasks</p>
                    </div>
                  ) : (
                    tasks.completed.map((task, index) => (
                      <Draggable 
                        key={task.task_id} 
                        draggableId={task.task_id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 mb-3 rounded-lg shadow-sm border-l-4 border-green-400 border-t border-r border-b ${
                              snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                            } transition-shadow`}
                            style={{
                              ...provided.draggableProps.style
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-gray-800 line-through">{task.title}</h3>
                              <span className={getPriorityBadge(task.priority)}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center text-xs text-gray-500 gap-y-2">
                              <div className="flex items-center mr-4">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                                </svg>
                                From: {task.assigned_by_name || 'Admin'}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                                </svg>
                                {formatDate(task.deadline)}
                              </div>
                              <div className="ml-auto flex items-center text-green-600">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L9 12l4-4z" clipRule="evenodd"></path>
                                </svg>
                                Completed
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      {/* Status Change Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center">
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Request Status Change
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Task: {requestTask.task_title}<br />
              Current Status: {requestTask.source_status}<br />
              Requested Status: {requestTask.destination_status}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Request
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="4"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Explain why you want to change the task status"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestReason('');
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={submitStatusRequest}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFlow;