import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const DashboardUser = () => {
  const [taskStats, setTaskStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      try {
        setLoading(true);

        // Fetch user session
        const userResponse = await axios.get(`${API_URL}get_session_user`, { withCredentials: true });
        if (userResponse.data.type !== 'success') {
          throw new Error(userResponse.data.message || 'User not logged in');
        }
        const user = userResponse.data.user;
        setCurrentUser(user);
        localStorage.setItem('user_id', user.user_id); 

        const response = await axios.get(`${API_URL}user_get_tasks`, {
          params: {
            user_id: user.user_id,
            is_admin: 'false'
          },
          withCredentials: true
        });

        if (response.data.type === 'success') {
          const tasks = response.data.tasks || [];
          
          // Filter tasks to ensure user is in assigned_users
          const userTasks = tasks.filter(task => 
            task.assigned_users.some(u => u.user_id === user.user_id)
          );

          const stats = {
            total: userTasks.length,
            todo: userTasks.filter(task => task.status === 'todo').length,
            inProgress: userTasks.filter(task => task.status === 'inProgress').length,
            completed: userTasks.filter(task => task.status === 'completed').length
          };
          
          setTaskStats(stats);
          
          const sortedTasks = [...userTasks]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
          
          setRecentTasks(sortedTasks);
        } else {
          throw new Error(response.data.message || 'Failed to fetch tasks');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndTasks();
  }, [API_URL]);

  const chartData = [
    { name: 'To Do', value: taskStats.todo, color: '#FBBF24' },
    { name: 'In Progress', value: taskStats.inProgress, color: '#8B5CF6' },
    { name: 'Completed', value: taskStats.completed, color: '#10B981' }
  ].filter(item => item.value > 0);

  const StatusCard = ({ title, count, bgColor, textColor, icon, iconBg }) => (
    <div className={`rounded-lg shadow-md p-6 ${bgColor} transition-all duration-300 hover:shadow-xl hover:translate-y-1 cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
          <h3 className={`text-3xl font-bold ${textColor} mt-1`}>{count}</h3>
        </div>
        <div className={`${iconBg} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const TaskItem = ({ task }) => {
    const statusColors = {
      todo: 'bg-yellow-100 text-yellow-800',
      inProgress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800'
    };
    
    const priorityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return (
      <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-gray-900">{task.title}</h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {task.description || "No description"}
            </p>
          </div>
          <div className="flex space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
              {task.status === 'todo' ? 'To Do' : 
               task.status === 'inProgress' ? 'In Progress' : 'Completed'}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Due: {task.deadline_formatted}</span>
          {task.days_remaining && (
            <span className={`ml-2 ${
              task.days_remaining.startsWith('-') ? 'text-red-500' : 
              parseInt(task.days_remaining) <= 3 ? 'text-orange-500' : 'text-green-500'
            }`}>
              ({task.days_remaining.startsWith('-') ? 
                `${task.days_remaining.substring(1)} days overdue` : 
                `${task.days_remaining} days left`})
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          <p className="text-gray-500 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 mr-2" />
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        {currentUser ? `${currentUser.username}'s Task Dashboard` : 'My Task Dashboard'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusCard 
          title="Total Tasks" 
          count={taskStats.total} 
          bgColor="bg-white" 
          textColor="text-gray-800" 
          iconBg="bg-blue-100 text-blue-600"
          icon={<Calendar className="h-6 w-6" />} 
        />
        <StatusCard 
          title="To Do" 
          count={taskStats.todo} 
          bgColor="bg-white" 
          textColor="text-gray-800" 
          iconBg="bg-yellow-100 text-yellow-600"
          icon={<ArrowRight className="h-6 w-6" />} 
        />
        <StatusCard 
          title="In Progress" 
          count={taskStats.inProgress} 
          bgColor="bg-white" 
          textColor="text-gray-800" 
          iconBg="bg-purple-100 text-purple-600"
          icon={<Clock className="h-6 w-6" />} 
        />
        <StatusCard 
          title="Completed" 
          count={taskStats.completed} 
          bgColor="bg-white" 
          textColor="text-gray-800" 
          iconBg="bg-green-100 text-green-600"
          icon={<CheckCircle className="h-6 w-6" />} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">My Task Distribution</h3>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} tasks`, name]} 
                  contentStyle={{ borderRadius: '8px', padding: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No task data to display</p>
            </div>
          )}
          
          {chartData.length > 0 && (
            <div className="flex justify-center flex-wrap gap-4 mt-4">
              {chartData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                  <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md col-span-1 lg:col-span-2">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800">My Recent Tasks</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <TaskItem key={task.task_id} task={task} />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No tasks assigned to you
              </div>
            )}
          </div>
          
          {recentTasks.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <button className="flex items-center justify-center w-full py-2 text-blue-600 hover:text-blue-800 transition-colors duration-200">
                <span>View all my tasks</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;