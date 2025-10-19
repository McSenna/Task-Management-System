import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Info, CheckCircle, User, 
  Clock, AlertCircle, ChevronDown, Flag 
} from 'lucide-react';
import axios from 'axios';

const AdminCreateTask = ({ onTaskCreated, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAssignees, setShowAssignees] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assignedTo: [],
    assignedBy: 'Admin',
    deadline: '',
    priority: 'medium',
    status: 'todo',
  });
  
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);
  
  const fetchTeamMembers = async () => {
    setFetchingMembers(true);
    try {
      const response = await axios.get(`${apiUrl}fetch`);
      // Filter for active members only
      const activeMembers = response.data.filter(member => member.status === 'Active');
      setTeamMembers(activeMembers);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members. Please try refreshing the page.');
    } finally {
      setFetchingMembers(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData({
      ...taskData,
      [name]: value,
    });
  };

  const handleMemberSelection = (userId) => {
    const isSelected = selectedMembers.includes(userId);
    let newSelectedMembers;
    
    if (isSelected) {
      newSelectedMembers = selectedMembers.filter(id => id !== userId);
    } else {
      newSelectedMembers = [...selectedMembers, userId];
    }
    
    setSelectedMembers(newSelectedMembers);
    
    setTaskData({
      ...taskData,
      assignedTo: newSelectedMembers,
    });
  };
  
  const storeLogs = async (action) => {
    try {
      await axios.put(`${apiUrl}store_logs`, {
        user_id: 'Admin', 
        action,
      });
    } catch (error) {
      console.error('Error storing logs', error);
    }
  };

  const resetForm = () => {
    setTaskData({
      title: '',
      description: '',
      assignedTo: [],
      assignedBy: 'Admin',
      deadline: '',
      priority: 'medium',
      status: 'todo',
    });
    setSelectedMembers([]);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!taskData.title || taskData.assignedTo.length === 0 || !taskData.deadline) {
      setError('Please fill in all required fields: Title, Assigned To, and Deadline.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const assignedUsernames = taskData.assignedTo.map(userId => {
        const member = teamMembers.find(m => m.user_id === userId);
        return member ? member.username : userId;
      }).join(", ");
      
      const response = await axios.post(`${apiUrl}create_task`, taskData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.type === 'success') {
        setSuccess('Task created successfully!');
        alert('Task created successfully!');  
        resetForm();
        
        await storeLogs(`Admin Created a new task: ${taskData.title} assigned to ${assignedUsernames}`);

        setTimeout(() => {
          if (onTaskCreated) onTaskCreated();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to create task.');
        await storeLogs(`Admin Failed to create task: ${response.data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Create task error:', err.response?.data || err);
      setError('An error occurred while creating the task. ' + 
               (err.response?.data?.message || 'Server communication error.'));
      await storeLogs(`Admin Failed to create task: ${err.response?.data?.message || 'Server error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedMembersText = () => {
    if (selectedMembers.length === 0) return "Select team members";
    if (selectedMembers.length <= 2) {
      return selectedMembers.map(id => {
        const member = teamMembers.find(m => m.user_id === id);
        return member ? member.username : "";
      }).join(", ");
    }
    return `${selectedMembers.length} members selected`;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-md mr-3">
            <Flag className="w-4 h-4" />
          </span>
          Create New Task
        </h2>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>


      {(error || success) && (
        <div className={`mx-6 mt-4 p-3 rounded-md flex items-start ${
          error ? "bg-red-50 text-red-700 border border-red-100" : 
                 "bg-green-50 text-green-700 border border-green-100"
        }`}>
          {error ? 
            <AlertCircle className="w-5 h-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" /> : 
            <CheckCircle className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
          }
          <p className="text-sm">{error || success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Title & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Task Title<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={taskData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive task title"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Deadline<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="deadline"
                  value={taskData.deadline}
                  onChange={handleInputChange}
                  min={today}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 pr-10 transition-all"
                />
                <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={taskData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter detailed description of the task"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Assigned To<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowAssignees(!showAssignees)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-left bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all flex justify-between items-center"
              >
                <span className={selectedMembers.length === 0 ? "text-gray-400" : "text-gray-700"}>
                  {getSelectedMembersText()}
                </span>
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-1" />
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </button>
              
              {showAssignees && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  <div className="p-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase">Team Members</p>
                  </div>
                  {fetchingMembers ? (
                    <div className="flex justify-center items-center p-4">
                      <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2 text-sm text-gray-500">Loading team members...</span>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center p-4 text-sm text-gray-500">
                      No active team members found.
                    </div>
                  ) : (
                    teamMembers.map(member => (
                      <div 
                        key={member.user_id}
                        className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${
                          selectedMembers.includes(member.user_id) ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleMemberSelection(member.user_id)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          selectedMembers.includes(member.user_id) 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{member.username}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.user_id)}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <div className="flex space-x-2">
                {[
                  { value: 'low', label: 'Low', color: 'emerald' },
                  { value: 'medium', label: 'Medium', color: 'amber' },
                  { value: 'high', label: 'High', color: 'red' }
                ].map(priority => (
                  <label
                    key={priority.value}
                    className={`flex-1 cursor-pointer rounded-md px-3 py-2.5 flex items-center justify-center transition-all ${
                      taskData.priority === priority.value 
                        ? priority.value === 'low' 
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                          : priority.value === 'medium'
                            ? 'bg-amber-50 border border-amber-200 text-amber-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={taskData.priority === priority.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      taskData.priority === priority.value
                        ? priority.value === 'low'
                          ? 'bg-emerald-500'
                          : priority.value === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        : 'bg-gray-300'  
                    }`}></div>
                    <span className="font-medium text-sm">{priority.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="flex space-x-2">
                {[
                  { value: 'todo', label: 'To Do', icon: <div className="w-3 h-3 border-2 border-gray-400 rounded-sm"></div> },
                  { value: 'inProgress', label: 'In Progress', icon: <Clock className="w-3 h-3 text-blue-500" /> },
                  { value: 'completed', label: 'Done', icon: <CheckCircle className="w-3 h-3 text-green-500" /> }
                ].map(status => (
                  <label
                    key={status.value}
                    className={`flex-1 cursor-pointer rounded-md px-3 py-2.5 transition-all flex items-center justify-center ${
                      taskData.status === status.value 
                        ? 'bg-gray-100 border border-gray-300 text-gray-800' 
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={taskData.status === status.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <span className="mr-2">{status.icon}</span>
                      <span className="font-medium text-sm">{status.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3 border-t pt-6">
          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Task...
              </>
            ) : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateTask;