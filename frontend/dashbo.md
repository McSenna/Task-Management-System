import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Search, Filter, Trash2, Download, RefreshCw, ChevronLeft, ChevronRight, 
  Activity, AlertCircle, Clock, Shield, Database, User } from 'lucide-react';

const AdminDashboard = () => {
  // State management
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    total: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    module: '',
    affected_id: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [availableActions, setAvailableActions] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    actions: {}
  });
  
  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
  
  // Fetch activity logs from API
  const fetchActivityLogs = async (page = 1) => {
    setLoading(true);
    try {
      // Build query params from filters
      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit,
        ...filters
      });
      
      // FIXED: Added action parameter to the URL and properly appended query parameters
      const response = await axios.get(`${API_URL}?action=get_activity_logs&${params.toString()}`);
      
      if (response.data.type === 'success') {
        setLogs(response.data.logs);
        setPagination({
          currentPage: response.data.page,
          totalPages: response.data.pages,
          limit: response.data.limit,
          total: response.data.total
        });
        
        // Update stats
        setStats({
          total: response.data.total,
          today: response.data.logs.filter(log => {
            const today = new Date().toISOString().split('T')[0];
            return log.created_at.includes(today);
          }).length,
          actions: response.data.logs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
          }, {})
        });
        
        // Extract unique actions and modules for filters
        if (response.data.logs.length > 0) {
          const actions = [...new Set(response.data.logs.map(log => log.action))];
          const modules = [...new Set(response.data.logs.map(log => log.module))];
          setAvailableActions(actions);
          setAvailableModules(modules);
        }
      } else {
        setError(response.data.message || 'Failed to fetch activity logs');
      }
    } catch (err) {
      setError('An error occurred while fetching activity logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle purging old logs
  const handlePurgeLogs = async (days) => {
    if (!confirm(`Are you sure you want to purge logs older than ${days} days?`)) {
      return;
    }
    
    try {
      // FIXED: Proper URL format for purge operation
      const response = await axios.get(`${API_URL}?action=purge_activity_logs&days=${days}`);
      if (response.data.type === 'success') {
        alert(response.data.message);
        fetchActivityLogs(1); // Refresh after purging
      } else {
        alert(response.data.message || 'Failed to purge logs');
      }
    } catch (err) {
      alert('An error occurred while purging logs');
      console.error(err);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchActivityLogs(1); // Reset to first page when searching
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      user_id: '',
      action: '',
      module: '',
      affected_id: '',
      date_from: '',
      date_to: '',
      search: ''
    });
    // Apply reset immediately
    setTimeout(() => {
      fetchActivityLogs(1);
    }, 0);
  };
  
  // Export logs as CSV
  const exportLogs = () => {
    if (logs.length === 0) return;
    
    const headers = Object.keys(logs[0]).filter(key => key !== 'created_at_formatted');
    const csvContent = [
      headers.join(','),
      ...logs.map(log => headers.map(header => {
        let value = log[header] || '';
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Initialize component
  useEffect(() => {
    fetchActivityLogs();
  }, []);
  
  // Get badge color based on action
  const getActionBadgeColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'login':
        return 'bg-purple-100 text-purple-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get stats card style based on index
  const getStatCardStyle = (index) => {
    const styles = [
      { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Activity className="h-8 w-8 text-blue-500" /> },
      { bg: 'bg-green-50', text: 'text-green-700', icon: <User className="h-8 w-8 text-green-500" /> },
      { bg: 'bg-purple-50', text: 'text-purple-700', icon: <Shield className="h-8 w-8 text-purple-500" /> },
      { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock className="h-8 w-8 text-amber-500" /> }
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs Dashboard</h1>
        <p className="mt-2 text-gray-600">Monitor and track system activities and user actions</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 shadow-sm border border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Logs</p>
              <p className="mt-2 text-3xl font-bold text-blue-700">{pagination.total}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6 shadow-sm border border-green-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-green-600">Today's Activity</p>
              <p className="mt-2 text-3xl font-bold text-green-700">{stats.today}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6 shadow-sm border border-purple-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-purple-600">Unique Modules</p>
              <p className="mt-2 text-3xl font-bold text-purple-700">{availableModules.length}</p>
            </div>
            <Database className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-amber-50 rounded-lg p-6 shadow-sm border border-amber-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-amber-600">Action Types</p>
              <p className="mt-2 text-3xl font-bold text-amber-700">{availableActions.length}</p>
            </div>
            <Shield className="h-8 w-8 text-amber-500" />
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Filter size={16} />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
          <button 
            onClick={() => fetchActivityLogs(pagination.currentPage)}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            title="Refresh logs"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={exportLogs}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            disabled={logs.length === 0}
            title="Export as CSV"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => handlePurgeLogs(90)}
            className="flex items-center gap-1 px-4 py-2 bg-red-50 border border-red-200 rounded-md text-red-700 hover:bg-red-100 transition-colors shadow-sm"
            title="Purge logs older than 90 days"
          >
            <Trash2 size={16} />
            <span>Purge Old Logs</span>
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-4">
          <div className="flex-1 min-w-[280px] relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by username, description or log ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            Search
          </button>
          <button 
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm"
          >
            Reset
          </button>
        </form>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <select 
                name="action" 
                value={filters.action} 
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Actions</option>
                {availableActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
              <select 
                name="module" 
                value={filters.module} 
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Modules</option>
                {availableModules.map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input 
                type="text" 
                name="user_id" 
                value={filters.user_id} 
                onChange={handleFilterChange}
                placeholder="Filter by user ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Affected ID</label>
              <input 
                type="text" 
                name="affected_id" 
                value={filters.affected_id} 
                onChange={handleFilterChange}
                placeholder="Filter by affected ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input 
                  type="date" 
                  name="date_from" 
                  value={filters.date_from} 
                  onChange={handleFilterChange}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input 
                  type="date" 
                  name="date_to" 
                  value={filters.date_to} 
                  onChange={handleFilterChange}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Activity Logs Table */}
      <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading activity logs...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={() => fetchActivityLogs(1)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No activity logs found for the selected filters.</p>
            <button 
              onClick={handleResetFilters}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Log ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.log_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.username ? (
                          <span className="font-medium">{log.username}</span>
                        ) : (
                          <span className="text-gray-400">System</span>
                        )}
                        {log.user_id && <div className="text-xs text-gray-500">ID: {log.user_id}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.module}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.created_at_formatted || new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchActivityLogs(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchActivityLogs(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.currentPage === pagination.totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{logs.length}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => fetchActivityLogs(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.currentPage === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft size={18} />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      // Calculate which page numbers to show
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchActivityLogs(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === pagination.currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => fetchActivityLogs(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.currentPage === pagination.totalPages 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight size={18} />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Activity Logs Dashboard • Last refreshed: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default AdminDashboard;