/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { createInstructorRequest } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';


const InstructorApplicationPage: React.FC = () => {
  const [reason, setReason] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [teachingInterests, setTeachingInterests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit an application.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createInstructorRequest({ reason, qualifications, teaching_interests: teachingInterests });
      toast.success('Instructor application submitted successfully!');
      navigate(`/dashboard/${user?.role.toLowerCase()}`);
    } catch (error: any) {
      setSubmitError(error.response?.data?.error?.message || 'Failed to submit application.');
      toast.error(error.response?.data?.error?.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Become an Instructor</h1>
      <p className="text-gray-600 mb-8">
        Share your knowledge and passion by becoming an instructor. Fill out the form below
        to submit your application. Our team will review it shortly.
      </p>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <label htmlFor="reason" className="block text-gray-700 text-sm font-semibold mb-2">
            Reason for Applying <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why do you want to become an instructor? What motivates you?"
            required
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">
            Explain your motivation for applying.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="qualifications" className="block text-gray-700 text-sm font-semibold mb-2">
            Qualifications <span className="text-red-500">*</span>
          </label>
          <textarea
            id="qualifications"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            placeholder="List your relevant academic degrees, certifications, or professional experience."
            required
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">
            Outline your key qualifications.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="teachingInterests" className="block text-gray-700 text-sm font-semibold mb-2">
            Teaching Interests <span className="text-red-500">*</span>
          </label>
          <textarea
            id="teachingInterests"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={teachingInterests}
            onChange={(e) => setTeachingInterests(e.target.value)}
            placeholder="What subjects or topics are you interested in teaching?"
            required
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">
            Specify your areas of teaching interest.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
        {submitError && (
          <p className="text-red-500 text-sm mt-4 text-center">
            Error: {submitError}
          </p>
        )}
      </form>
    </div>
  );
};

export default InstructorApplicationPage;
