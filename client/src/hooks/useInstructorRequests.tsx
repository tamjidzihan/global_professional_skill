/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useInstructorRequests.ts
import { useState, useCallback, useEffect } from 'react';
import type { InstructorRequest, InstructorRequestsResponse, CreateInstructorRequest } from '../types';
import { getInstructorRequests, createInstructorRequest } from '../lib/api';
import { useAuth } from './useAuth'; // Import useAuth to get current user ID

export const useInstructorRequests = () => {
    const { user, isAuthenticated } = useAuth(); // Get current user and auth status
    const [requests, setRequests] = useState<InstructorRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [prevPage, setPrevPage] = useState<string | null>(null);

    // State for creating a request
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Function to fetch instructor requests
    const fetchInstructorRequests = useCallback(async (status: string = 'ALL', specificUserId?: string, pageUrl: string | null = null) => {
        if (!isAuthenticated && !specificUserId) {
            // Cannot fetch requests without authentication or a specific user ID
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = {};
            if (status !== 'ALL') {
                params.status = status;
            }
            // Add user filter if specificUserId is provided, otherwise use current authenticated user's ID
            if (specificUserId) {
                params.user = specificUserId;
            } else if (user?.id) {
                params.user = user.id;
            }

            const response = await getInstructorRequests<InstructorRequestsResponse>(
                pageUrl ? undefined : params, // params only for initial fetch, not for pageUrl
                pageUrl || undefined
            );

            const responseData = response.data;
            const requestsArray = responseData.results?.data || [];
            setRequests(requestsArray);
            setTotalCount(responseData.count || 0);
            setNextPage(responseData.next);
            setPrevPage(responseData.previous);

        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to fetch instructor requests');
            setRequests([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user]); // Include user in dependencies

    // Function to submit a new instructor request
    const submitInstructorRequest = useCallback(async (data: CreateInstructorRequest) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);
        try {
            await createInstructorRequest(data);
            setSubmitSuccess(true);
            // Optionally refetch requests to update the list after submission
            fetchInstructorRequests();
        } catch (err: any) {
            setSubmitError(err.response?.data?.error?.message || 'Failed to submit instructor request');
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchInstructorRequests]);

    // Initial fetch for the current user's requests when component mounts
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchInstructorRequests();
        } else if (!isAuthenticated && !user?.id) {
            // If not authenticated, clear requests and stop loading
            setRequests([]);
            setLoading(false);
        }
    }, [isAuthenticated, user, fetchInstructorRequests]);


    const loadNextPage = useCallback(() => {
        if (nextPage) {
            fetchInstructorRequests('ALL', undefined, nextPage); // Pass undefined for specificUserId as it's for current user
        }
    }, [nextPage, fetchInstructorRequests]);

    const loadPrevPage = useCallback(() => {
        if (prevPage) {
            fetchInstructorRequests('ALL', undefined, prevPage); // Pass undefined for specificUserId as it's for current user
        }
    }, [prevPage, fetchInstructorRequests]);

    return {
        requests,
        loading,
        error,
        totalCount,
        nextPage,
        prevPage,
        fetchInstructorRequests,
        loadNextPage,
        loadPrevPage,
        isSubmitting,
        submitError,
        submitSuccess,
        submitInstructorRequest,
    };
};
