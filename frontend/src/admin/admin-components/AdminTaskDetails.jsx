import React from 'react';

// Utility functions
const getPriorityColor = (priority) => {
  switch(priority) {
    case 'high':
      return 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200 shadow-red-100/50';
    case 'medium':
      return 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-200 shadow-amber-100/50';
    case 'low':
      return 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200 shadow-emerald-100/50';
    default:
      return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200 shadow-gray-100/50';
  }
};

const getStatusInfo = (status) => {
  switch(status) {
    case 'completed':
      return { 
        label: 'Completed', 
        color: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200',
        icon: '✓'
      };
    case 'inProgress':
      return { 
        label: 'In Progress', 
        color: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200',
        icon: '⟳'
      };
    default:
      return { 
        label: 'To Do', 
        color: 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 border-slate-200',
        icon: '○'
      };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
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

// Sample task data
const sampleTask = {
  task_id: 1,
  title: "System Integration Testing Phase 2",
  description: "Complete comprehensive testing of the new payment gateway integration with legacy systems. This includes load testing, security validation, and user acceptance testing across all environments.",
  priority: "high",
  status: "inProgress",
  deadline: "2025-06-10",
  created_at: "2025-05-15",
  assigned_users: [
    { user_id: 1, username: "Alex Thompson" },
    { user_id: 2, username: "Maria Santos" },
    { user_id: 3, username: "David Park" }
  ],
  assigned_by_name: "Robert Chen"
};

const AdminTaskDetails = ({
  selectedTask = sampleTask,
  setSelectedTask = () => {},
  updateTaskStatus = (id, status) => console.log(`Updating task ${id} to ${status}`)
}) => {
  if (!selectedTask) return null;

  const handleStatusUpdate = (status) => {
    updateTaskStatus(selectedTask.task_id, status);
  };

  const isOverdue = isPastDate(selectedTask.deadline) && selectedTask.status !== 'completed';
  const statusInfo = getStatusInfo(selectedTask.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-transparent backdrop-blur-sm"
        onClick={() => setSelectedTask(null)}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-slate-200/60">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200/60">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Task Management
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight mb-3">
                {selectedTask.title}
              </h2>
              
              {/* Badges */}
              <div className="flex items-center space-x-2">
                <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority?.charAt(0).toUpperCase() + selectedTask.priority?.slice(1)}
                </div>
                
                <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm ${statusInfo.color}`}>
                  <span className="mr-1">{statusInfo.icon}</span>
                  {statusInfo.label}
                </div>

                {isOverdue && (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                    ⚠ Overdue
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setSelectedTask(null)}
              className="ml-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Description */}
          {selectedTask.description && (
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="bg-slate-50/80 rounded-lg p-4 border border-slate-200/40">
                <p className="text-slate-700 text-sm leading-relaxed">
                  {selectedTask.description}
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              
              {/* Team */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Team</h4>
                
                <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/40">
                  <div className="text-xs text-slate-500 mb-2">Assigned To</div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedTask.assigned_users?.length > 0 ? (
                      selectedTask.assigned_users.map(user => (
                        <div key={user.user_id} className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {user.username.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <span className="ml-2 text-slate-900 font-medium text-sm truncate">
                            {user.username}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic text-sm">Unassigned</div>
                    )}
                  </div>
                  {selectedTask.assigned_users?.length > 0 && (
                    <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/40">
                      {selectedTask.assigned_users.length} member{selectedTask.assigned_users.length !== 1 ? 's' : ''} assigned
                    </div>
                  )}
                </div>

                <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/40">
                  <div className="text-xs text-slate-500 mb-2">Created By</div>
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-medium">
                      {(selectedTask.assigned_by_name || 'A').split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <span className="ml-2 text-slate-900 font-medium text-sm">
                      {selectedTask.assigned_by_name || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Timeline</h4>
                
                <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/40">
                  <div className="text-xs text-slate-500 mb-1">Created</div>
                  <div className="text-slate-900 font-semibold text-sm">
                    {formatDate(selectedTask.created_at)}
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/40">
                  <div className="text-xs text-slate-500 mb-1">Due Date</div>
                  <div className={`font-semibold text-sm ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatDate(selectedTask.deadline)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
              Update Status
            </h4>
            <div className="flex gap-2">
              {["todo", "inProgress", "completed"].map((status) => {
                const info = getStatusInfo(status);
                const isActive = selectedTask.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                      isActive
                        ? info.color + ' shadow-sm'
                        : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="mr-1">{info.icon}</span>
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200/60">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setSelectedTask(null)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors"
            >
              Close
            </button>
            <button className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskDetails;