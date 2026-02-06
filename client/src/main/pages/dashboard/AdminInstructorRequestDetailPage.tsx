import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInstructorRequestDetail, reviewInstructorRequest, updateUserRole } from '../../../lib/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth';
import type { InstructorRequest } from '../../../types';

const AdminInstructorRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState<InstructorRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    navigate('/dashboard');
    toast.error('Access denied. Only administrators can view this page.');
    return null;
  }

  const fetchRequestDetail = useCallback(async () => {
    if (!id) {
      setIsError(true);
      setError('Instructor request ID is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const response = await getInstructorRequestDetail(id);
      setRequest(response.data.data);
    } catch (err: any) {
      setIsError(true);
      setError(err.response?.data?.error?.message || 'Failed to load instructor request detail.');
      toast.error(err.response?.data?.error?.message || 'Failed to load instructor request detail.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequestDetail();
  }, [fetchRequestDetail]);

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!request || isProcessing) return;

    setIsProcessing(true);
    try {
      await reviewInstructorRequest(request.id, { status });
      toast.success(`Request ${status.toLowerCase()} successfully.`);

      if (status === 'APPROVED') {
        try {
          await updateUserRole(request.user.id, 'INSTRUCTOR');
          toast.success('User role updated to INSTRUCTOR.');
        } catch (err: any) {
          toast.error(err.response?.data?.error?.message || 'Failed to update user role.');
        }
      }
      navigate('/dashboard/admin/instructor-requests'); // Go back to the list after review
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to review request.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="text-center p-4">Loading request details...</div>;
  if (isError) return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  if (!request) return <div className="text-center p-4 text-gray-600">No request found.</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Instructor Request Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-500 text-sm">Request ID:</p>
          <p className="text-gray-900 font-medium">{request.id}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Status:</p>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
              request.status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : request.status === 'APPROVED'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {request.status}
          </span>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Requested By:</p>
          <p className="text-gray-900 font-medium">{request.user.first_name} {request.user.last_name} ({request.user.email})</p>
        </div>
        {request.reviewed_by && (
          <div>
            <p className="text-gray-500 text-sm">Reviewed By:</p>
            <p className="text-gray-900 font-medium">{request.reviewed_by_email}</p>
          </div>
        )}
        <div>
          <p className="text-gray-500 text-sm">Requested On:</p>
          <p className="text-gray-900">{new Date(request.created_at).toLocaleString()}</p>
        </div>
        {request.reviewed_at && (
          <div>
            <p className="text-gray-500 text-sm">Reviewed On:</p>
            <p className="text-gray-900">{new Date(request.reviewed_at).toLocaleString()}</p>
          </div>
        )}
      </div>

      <hr className="my-6" />

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Biography</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{request.bio}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Teaching Experience</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{request.experience}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Reason for Applying</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{request.reason}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Qualifications</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{request.qualifications}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Teaching Interests</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{request.teaching_interests}</p>
        </div>
        {request.review_notes && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Review Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{request.review_notes}</p>
          </div>
        )}
      </div>

      {request.status === 'PENDING' && (
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => handleReview('REJECTED')}
            className="px-6 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition duration-200"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Reject'}
          </button>
          <button
            onClick={() => handleReview('APPROVED')}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminInstructorRequestDetailPage;
