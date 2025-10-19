import React from 'react';

const StatusChangeRequestModal = ({
  showRequestModal,
  setShowRequestModal,
  requestTask,
  requestReason,
  setRequestReason,
  submitStatusRequest
}) => {
  if (!showRequestModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Status Change Request
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Request approval of the Admin for the task status modification
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Task Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              Task Information
            </h4>
            <div className="bg-gray-50 rounded-md p-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">Task:</span>
                <span className="text-sm font-medium text-gray-900 text-right max-w-xs">
                  {requestTask.task_title}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">From:</span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                  {requestTask.source_status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">To:</span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  {requestTask.destination_status}
                </span>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">
              Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              rows="4"
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="Provide a clear business justification for this status change..."
              maxLength={300}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Be specific and concise</span>
              <span>{requestReason.length}/300</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            onClick={() => {
              setShowRequestModal(false);
              setRequestReason('');
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={submitStatusRequest}
            disabled={!requestReason.trim() || requestReason.length < 10}
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeRequestModal;