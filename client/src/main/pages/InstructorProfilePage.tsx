/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getUserDetail } from '../../lib/api';
import type { User } from '../../types';

const InstructorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [instructor, setInstructor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructor = useCallback(async () => {
    if (!id) {
      setIsError(true);
      setError('Instructor ID is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const response = await getUserDetail(id);
      setInstructor(response.data.data);
    } catch (err: any) {
      setIsError(true);
      setError(err.response?.data?.error?.message || 'Failed to load instructor profile.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInstructor();
  }, [fetchInstructor]);


  if (isLoading) return <div className="text-center p-4">Loading instructor profile...</div>;
  if (isError) return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  if (!instructor) return <div className="text-center p-4 text-gray-600">No instructor found.</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Instructor Profile</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Name:</h2>
          <p className="text-gray-900 text-lg">{instructor.first_name} {instructor.last_name}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Email:</h2>
          <p className="text-gray-900 text-lg">{instructor.email}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Role:</h2>
          <p className="text-gray-900 text-lg">{instructor.role}</p>
        </div>
        {/* Potentially add more instructor-specific details here, like bio, experience, courses taught, etc.
            This would require extending the UserSerializer in the backend to include such fields for instructors
            or fetching instructor-specific data from another endpoint. */}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
        <p className="font-semibold">Note:</p>
        <p className="text-sm">Additional instructor details (bio, experience, courses) can be displayed here
          if the backend's UserSerializer or a dedicated instructor profile endpoint provides them.</p>
      </div>
    </div>
  );
};

export default InstructorProfilePage;
