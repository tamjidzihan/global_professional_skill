import React, { useState, useEffect, useCallback } from 'react';
import { getInstructorRequests, reviewInstructorRequest, updateUserRole } from '../../../lib/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import type { InstructorRequest } from '../../../types';

const AdminInstructorRequestsPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [requests, setRequests] = useState<InstructorRequest[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin (though ProtectedRoute should handle this)
  if (!user || user.role !== 'ADMIN') {
    navigate('/dashboard');
    toast.error('Access denied. Only administrators can view this page.');
    return null;
  }

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const response = await getInstructorRequests(filterStatus);
      setRequests(response.data.data);
    } catch (err: any) {
      setIsError(true);
      setError(err.response?.data?.error?.message || 'Failed to load requests.');
      toast.error(err.response?.data?.error?.message || 'Failed to load requests.');
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleReview = async (id: string, userId: string, status: 'APPROVED' | 'REJECTED') => {
    if (isReviewing || isUpdatingRole) return;

    setIsReviewing(true);
    try {
      await reviewInstructorRequest(id, { status });
      toast.success(`Request ${status.toLowerCase()} successfully.`);

      if (status === 'APPROVED') {
        setIsUpdatingRole(true);
        try {
          await updateUserRole(userId, 'INSTRUCTOR');
          toast.success('User role updated to INSTRUCTOR.');
        } catch (err: any) {
          toast.error(err.response?.data?.error?.message || 'Failed to update user role.');
        } finally {
          setIsUpdatingRole(false);
        }
      }
      fetchRequests(); // Re-fetch requests to update the list
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to review request.');
    } finally {
      setIsReviewing(false);
    }
  };

  if (isLoading) return <div className="text-center p-4">Loading instructor requests...</div>;
  if (isError) return <div className="text-center p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Instructor Requests</h1>

      <div className="mb-4">
        <label htmlFor="statusFilter" className="block text-gray-700 text-sm font-semibold mb-2">
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {requests && requests.length === 0 ? (
        <p className="text-gray-600">No instructor requests found for the selected status.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bio
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualifications
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teaching Interests
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested On
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests?.map((request) => (
                <tr key={request.id}>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <Link to={`/dashboard/admin/instructor-requests/${request.id}`} className="text-blue-600 hover:text-blue-900">
                      <div className="text-sm font-medium text-gray-900">
                        {request.user.first_name} {request.user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{request.user.email}</div>
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 whitespace-normal">
                    {request.bio}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 whitespace-normal">
                    {request.experience}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 whitespace-normal">
                    {request.reason}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 whitespace-normal">
                    {request.qualifications}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 whitespace-normal">
                    {request.teaching_interests}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleReview(request.id, request.user.id, 'APPROVED')}
                          className="text-green-600 hover:text-green-900 mr-3"
                          disabled={isReviewing || isUpdatingRole}
                        >
                          {isReviewing && isUpdatingRole ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReview(request.id, request.user.id, 'REJECTED')}
                          className="text-red-600 hover:text-red-900"
                          disabled={isReviewing}
                        >
                          {isReviewing ? 'Processing...' : 'Reject'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminInstructorRequestsPage;
