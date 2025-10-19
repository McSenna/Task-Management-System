import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RefreshCw, Activity, Users, CheckSquare, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  // State for dashboard data
  const [systemLogsData, setSystemLogsData] = useState([]);
  const [recentLogsData, setRecentLogsData] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  
  // API URL
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  
  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };
  
  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get logs
      const logsResponse = await fetch(`${apiUrl}fetch_logs`);
      if (!logsResponse.ok) {
        throw new Error(`Request failed: ${logsResponse.status}`);
      }
      const logsData = await logsResponse.json();
      
      // Sort logs by newest first
      const sortedLogs = Array.isArray(logsData) 
        ? [...logsData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        : [];
      
      setRecentLogsData(sortedLogs);
      
      // Process logs for pie chart
      const logTypes = {};
      sortedLogs.forEach(log => {
        const type = log.action.split(' ')[0] || 'Other';
        logTypes[type] = (logTypes[type] || 0) + 1;
      });
      
      const logDistribution = Object.keys(logTypes).map(key => ({
        name: key,
        value: logTypes[key]
      }));
      
      setSystemLogsData(logDistribution);
      
      // Fetch user data
      const usersResponse = await fetch(`${apiUrl}fetch`);
      if (usersResponse.ok) {
        const userData = await usersResponse.json();
        setUserCount(Array.isArray(userData) ? userData.length : 0);
      }
      
      // Fetch tasks data
      const tasksResponse = await fetch(`${apiUrl}get_tasks`);
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        if (tasksData.type === 'success' && Array.isArray(tasksData.tasks)) {
          setTaskCount(tasksData.tasks.length);
        } else {
          setTaskCount(
            Array.isArray(tasksData) ? tasksData.length : 
            (tasksData.tasks && Array.isArray(tasksData.tasks) ? tasksData.tasks.length : 0)
          );
        }
      }
      
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Set up interval for updates
  useEffect(() => {
    fetchDashboardData();
    
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(fetchDashboardData, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchDashboardData, autoRefresh, refreshInterval]);

  // Loading state
  if (loading && !recentLogsData.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="w-10 h-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !recentLogsData.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-sm">
          <AlertTriangle className="text-red-500 w-8 h-8 mx-auto mb-2" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-2 ">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-100">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Users className="h-5 w-5 text-indigo-500" />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-500">Team Members</span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-800">{userCount}</p>
            <div className="mt-2 h-1 w-16 bg-indigo-100 rounded-full"></div>
          </div>
          
          <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckSquare className="h-5 w-5 text-green-500" />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-500">Total Tasks</span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-800">{taskCount}</p>
            <div className="mt-2 h-1 w-16 bg-green-100 rounded-full"></div>
          </div>
        </div>
        
        {/* Charts and Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* System Logs Distribution */}
          <div className="lg:col-span-4 p-6 bg-white border border-gray-100 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium text-gray-700">Log Distribution</h2>
              <div className="h-1 w-8 bg-indigo-100 rounded-full"></div>
            </div>
            
            {systemLogsData.length > 0 ? (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={systemLogsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {systemLogsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {systemLogsData.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center p-1 rounded hover:bg-gray-50 transition-colors duration-300">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-gray-600 font-medium">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-56">
                <p className="text-sm text-gray-400">No data available</p>
              </div>
            )}
          </div>

          {/* Live System Logs */}
          <div className="lg:col-span-8 p-6 bg-white border border-gray-100 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium text-gray-700">Recent Activity</h2>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${loading ? 'bg-indigo-400 animate-pulse' : 'bg-green-400'}`}></span>
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
            
            {recentLogsData.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-50">
                {/* Table with fixed header */}
                <div className="min-w-full">
                  {/* Sticky header - stays in place */}
                  <div className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                    <div className="flex text-sm font-medium text-gray-500">
                      <div className="w-3/4 px-4 py-3 text-left ml-10">Action</div>
                      <div className="w-1/4 px-4 py-3 text-right mr-10">Date and Time</div>
                    </div>
                  </div>
                  
                  {/* Scrollable body - only this part scrolls */}
                  <div className="overflow-auto max-h-64">
                    {recentLogsData.map((log, index) => {
                      const logDate = new Date(log.timestamp);
                      return (
                        <div 
                          key={index} 
                          className="flex border-b border-gray-50 hover:bg-gray-50 transition-colors duration-200 text-sm"
                        >
                          <div className="w-3/4 px-4 py-3 text-gray-800">{log.action}</div>
                          <div className="w-1/4 px-4 py-3 text-gray-500 text-right">
                            {logDate.toLocaleDateString()} {logDate.toLocaleTimeString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-56 border border-gray-50 rounded-lg">
                <p className="text-sm text-gray-400">No logs available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;