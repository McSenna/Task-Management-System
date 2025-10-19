import React from 'react';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-gradient-to-r from-red-50 to-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        dot: 'bg-red-500',
        shadow: 'shadow-red-100/50',
      };
    case 'medium':
      return {
        bg: 'bg-gradient-to-r from-amber-50 to-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        shadow: 'shadow-amber-100/50',
      };
    case 'low':
      return {
        bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        shadow: 'shadow-emerald-100/50',
      };
    default:
      return {
        bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
        shadow: 'shadow-gray-100/50',
      };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
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

const getStatusDisplay = (status) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        color: 'text-emerald-800',
        bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
        dot: 'bg-emerald-500',
        icon: '✓',
      };
    case 'inProgress':
      return {
        label: 'In Progress',
        color: 'text-blue-800',
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
        dot: 'bg-blue-500',
        icon: '⟳',
      };
    default:
      return {
        label: 'To Do',
        color: 'text-slate-800',
        bg: 'bg-gradient-to-r from-slate-50 to-slate-100',
        dot: 'bg-slate-400',
        icon: '○',
      };
  }
};

const TaskDetailsModal = ({ task, onClose = () => {} }) => {
  if (!task) return null;

  const priorityColors = getPriorityColor(task.priority);
  const statusInfo = getStatusDisplay(task.status);
  const isOverdue = isPastDate(task.deadline) && task.status !== 'completed';

  // Debug: Log the assigned_users array to verify data
  console.log('TaskDetailsModal - task:', task);
  console.log('TaskDetailsModal - assigned_users:', task.assigned_users);

  return (
    <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden border border-slate-200/60">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200/60">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Task Details
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
                {task.title || 'Untitled Task'}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm ${priorityColors.bg} ${priorityColors.text} ${priorityColors.border} ${priorityColors.shadow}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${priorityColors.dot} mr-1.5`}></div>
                  {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'N/A'}
                </div>
                <div
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm ${statusInfo.bg} ${statusInfo.color} border-slate-200`}
                >
                  <span className="mr-1">{statusInfo.icon}</span>
                  {statusInfo.label}
                </div>
                {isOverdue && (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm">
                    ⚠ Overdue
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Description */}
          {task.description && (
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Description</h3>
              <div className="bg-slate-50/80 rounded-lg p-4 border border-slate-200/40">
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {task.description}
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignment Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Team Assignment</h3>
                {/* Assigned To */}
                <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/40">
                  <div className="text-xs text-slate-500 mb-2">Collaborators</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Array.isArray(task.assigned_users) && task.assigned_users.length > 0 ? (
                      task.assigned_users.map((user, index) => (
                        <div
                          key={user.user_id || index}
                          className="flex items-center group"
                          title={`${user.username || 'Unknown User'}${user.role ? ` (${user.role})` : ''}`}
                        >
                          <div className="h-6 w-6 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {user.username ? user.username.split(' ').map((n) => n[0]).join('').toUpperCase() : '?'}
                          </div>
                          <div className="ml-2 flex flex-col">
                            <span className="text-slate-900 font-medium text-sm truncate group-hover:underline">
                              {user.username || 'Unknown User'}
                            </span>
                            {user.role && (
                              <span className="text-xs text-slate-500">{user.role}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic text-sm">
                        {Array.isArray(task.assigned_users) ? 'No collaborators assigned' : 'Error: Collaborators data invalid'}
                      </div>
                    )}
                  </div>
                  {Array.isArray(task.assigned_users) && task.assigned_users.length > 0 && (
                    <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/40">
                      {task.assigned_users.length} collaborator{task.assigned_users.length !== 1 ? 's' : ''} assigned
                    </div>
                  )}
                </div>
                {/* Created By */}
                <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/40">
                  <div className="text-xs text-slate-500 mb-2">Created By</div>
                  <div className="flex items-center" title={task.assigned_by_name || 'Admin'}>
                    <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-medium">
                      {(task.assigned_by_name || 'Admin').split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </div>
                    <span className="ml-2 text-slate-900 font-medium text-sm truncate">
                      {task.assigned_by_name || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Timeline Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Timeline</h3>
                {/* Created Date */}
                <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/40">
                  <div className="text-xs text-slate-500 mb-1">Created</div>
                  <div className="text-slate-900 font-semibold text-sm">{formatDate(task.created_at)}</div>
                </div>
                {/* Deadline */}
                <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/40">
                  <div className="text-xs text-slate-500 mb-1">Due Date</div>
                  <div className={`font-semibold text-sm ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatDate(task.deadline)}
                    {isOverdue && (
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Overdue</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Progress Indicator */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-4">Progress</h3>
              <div className="flex items-center justify-between">
                {['todo', 'inProgress', 'completed'].map((status, index) => {
                  const statusDisplay = getStatusDisplay(status);
                  const isActive = task.status === status;
                  const isPassed =
                    status === 'todo' ||
                    (status === 'inProgress' && (task.status === 'inProgress' || task.status === 'completed')) ||
                    (status === 'completed' && task.status === 'completed');
                  return (
                    <React.Fragment key={status}>
                      <div
                        className={`flex flex-col items-center ${isActive ? statusDisplay.color : isPassed ? 'text-slate-600' : 'text-slate-400'}`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full border-2 mb-2 ${isPassed ? `${statusDisplay.dot} border-transparent` : 'border-slate-300 bg-white'}`}
                        ></div>
                        <span className="text-xs font-medium text-center">{statusDisplay.label}</span>
                      </div>
                      {index < 2 && (
                        <div
                          className={`flex-1 h-0.5 mx-4 ${(status === 'todo' && (task.status === 'inProgress' || task.status === 'completed')) || (status === 'inProgress' && task.status === 'completed') ? 'bg-slate-400' : 'bg-slate-200'}`}
                        ></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;