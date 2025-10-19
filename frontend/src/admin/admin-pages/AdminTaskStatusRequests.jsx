import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminTaskStatusRequests = ({ currentUser }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [responseAction, setResponseAction] = useState(null);

  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}get_task_status_requests`, {
        params: { is_admin: true },
      });
      if (response.data.type === 'success') {
        setRequests(response.data.requests);
      } else {
        setError('Failed to fetch requests');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestAction = async () => {
    if (!adminResponse.trim()) {
      setError('Please provide a response for the action.');
      setTimeout(() => setError(null), 1500);
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}handle_task_status_request`, {
        request_id: selectedRequest.id,
        action: responseAction,
        admin_response: adminResponse,
        admin_id: currentUser.user_id,
      });

      if (response.data.type === 'success') {
        setShowResponseModal(false);
        setAdminResponse('');
        setSelectedRequest(null);
        fetchRequests();
        setError(`Request ${responseAction}ed successfully.`);
        setTimeout(() => setError(null), 1500);
      } else {
        setError(response.data.message);
        setTimeout(() => setError(null), 1500);
      }
    } catch (err) {
      console.error('Error handling request:', err);
      setError('Failed to process request. Please try again.');
      setTimeout(() => setError(null), 1500);
    }
  };

  const openResponseModal = (request, action) => {
    setSelectedRequest(request);
    setResponseAction(action);
    setShowResponseModal(true);
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const closeResponseModal = () => {
    setShowResponseModal(false);
    setAdminResponse('');
    setSelectedRequest(null);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      inProgress: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return statusMap[status] || statusMap.default;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'inProgress':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-100 overflow-hidden h-114.5" >
      
      {loading ? (
        <div className="flex flex-col justify-center items-center h-80">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading requests...</p>
        </div>
      ) : error ? (
        <div className="m-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 ">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600 max-w-md mx-auto">No pending task status change requests to review at this time.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-[calc(100vh-300px)] overflow-y-auto">
          {requests.map((request, index) => (
            <div
              key={request.id}
              className="px-8 py-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Request Header */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                        {getStatusIcon(request.requested_status)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors">
                        {request.task_title}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-sm text-gray-600 font-medium">{request.user_name}</p>
                        {request.user_department && (
                          <>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <p className="text-sm text-gray-500">{request.user_department}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Change Visualization */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 w-75 shadow-sm ">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-500 mb-2">Current</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(request.current_status)}`}>
                            {request.current_status}
                          </span>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-500 mb-2">Requested</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(request.requested_status)}`}>
                            {request.requested_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-2 mb-4">
                    {request.request_reason && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Reason</p>
                        <p className="text-sm text-gray-800 line-clamp-2">{request.request_reason}</p>
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>{new Date(request.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>Request #{request.id}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 ml-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openDetailsModal(request)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Details
                    </button>
                    <button
                      onClick={() => openResponseModal(request, 'approve')}
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => openResponseModal(request, 'reject')}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetailsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden border border-gray-200">

              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Request Details</h2>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                        #{selectedRequest.id}
                      </span>
                      <span className="text-blue-100 text-sm">•</span>
                      <span className="text-blue-100 text-sm">
                        Submitted {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailsModal}
                    className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 max-h-[calc(95vh-200px)] overflow-y-auto">

                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Status Change Request</h3>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-center space-x-8">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-3">Current Status</p>
                        <div className="flex flex-col items-center">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusBadge(selectedRequest.current_status)}`}>
                            <div className="w-2 h-2 bg-current rounded-full mr-2"></div>
                            {selectedRequest.current_status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">REQUESTING</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-3">Requested Status</p>
                        <div className="flex flex-col items-center">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusBadge(selectedRequest.requested_status)}`}>
                            <div className="w-2 h-2 bg-current rounded-full mr-2"></div>
                            {selectedRequest.requested_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Task Information</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">TASK TITLE</p>
                          <p className="text-gray-900 font-medium leading-relaxed">{selectedRequest.task_title}</p>
                        </div>
                        {selectedRequest.task_description && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">DESCRIPTION</p>
                            <p className="text-gray-700 leading-relaxed">{selectedRequest.task_description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Request Justification */}
                    {selectedRequest.request_reason && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Request Justification</h4>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                          <p className="text-gray-700 leading-relaxed italic">{selectedRequest.request_reason}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Requester Details</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-semibold text-sm">
                              {selectedRequest.user_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{selectedRequest.user_name}</p>
                            <p className="text-sm text-gray-600">{selectedRequest.user_department}</p>
                          </div>
                        </div>
                        
                        {selectedRequest.user_email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {selectedRequest.user_email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline & Status */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Request Timeline</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                          <div>
                            <p className="text-sm font-medium text-green-800">Submitted</p>
                            <p className="text-green-600 text-sm">
                              {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Current Status</p>
                            <p className="text-yellow-600 text-sm">Awaiting Admin Review</p>
                          </div>
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div className="bg-gray-50  px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Please review all details carefully before making your decision</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        closeDetailsModal();
                        openResponseModal(selectedRequest, 'reject');
                      }}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Reject Request</span>
                    </button>
                    <button
                      onClick={() => {
                        closeDetailsModal();
                        openResponseModal(selectedRequest, 'approve');
                      }}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Approve Request</span>
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent bg-opacity-60 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-6">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden">
              {/* Premium Header */}
              <div className={`bg-gradient-to-r px-8 py-6 border-b border-gray-200 ${
                responseAction === 'approve' 
                  ? 'from-emerald-50 via-green-50 to-emerald-50' 
                  : 'from-red-50 via-rose-50 to-red-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      responseAction === 'approve'
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                        : 'bg-gradient-to-br from-red-500 to-rose-600'
                    }`}>
                      {responseAction === 'approve' ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {responseAction === 'approve' ? 'Approve Request' : 'Reject Request'}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">{selectedRequest.task_title}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeResponseModal}
                    className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-80 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Enhanced Content */}
              <div className="p-8 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Request Summary Card */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 mb-8 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Request Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-1">Submitted by</p>
                        <p className="text-base font-semibold text-gray-900">{selectedRequest.user_name}</p>
                        {selectedRequest.user_department && (
                          <p className="text-sm text-gray-600">{selectedRequest.user_department}</p>
                        )}
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-1">Submitted</p>
                        <p className="text-base font-semibold text-gray-900">
                          {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-3">Status Change</p>
                      <div className="flex items-center justify-center space-x-3">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusBadge(selectedRequest.current_status)}`}>
                          {selectedRequest.current_status}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusBadge(selectedRequest.requested_status)}`}>
                          {selectedRequest.requested_status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedRequest.request_reason && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-2">Justification</p>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-900 leading-relaxed">{selectedRequest.request_reason}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Response Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Administrative Response
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-sm text-gray-600 mb-4">
                      Provide a detailed explanation for your decision. This will be shared with the requester.
                    </p>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 text-base leading-relaxed"
                      rows="6"
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder={`Explain your reasoning for ${responseAction}ing this request. Include any relevant details, next steps, or additional requirements...`}
                      maxLength={500}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {adminResponse.length}/500
                    </div>
                  </div>
                  
                
                </div>
              </div>

              {/* Enhanced Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    This action cannot be undone. The requester will be notified immediately.
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={closeResponseModal}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequestAction}
                      disabled={!adminResponse.trim()}
                      className={`px-6 py-3 text-sm font-medium text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed ${
                        responseAction === 'approve'
                          ? 'bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 disabled:from-emerald-300 disabled:to-green-400'
                          : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 disabled:from-red-300 disabled:to-rose-400'
                      }`}
                    >
                      {responseAction === 'approve' ? (
                        <>
                          <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Approve Request
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Reject Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskStatusRequests;