import { useState, useCallback } from 'react';
import type { CourseListResponse, CoursesSummary } from '../types';
import { getCourses, reviewCourse } from '../lib/api';

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'DRAFT';

export const useAdminCourses = () => {
    const [courses, setCourses] = useState<CoursesSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [prevPage, setPrevPage] = useState<string | null>(null);

    const fetchCourses = useCallback(async (status: FilterStatus = 'ALL', pageUrl: string | null = null) => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = {};
            if (status !== 'ALL') {
                params.status = status;
            }

            const response = await getCourses<CourseListResponse>(
                pageUrl ? undefined : params,
                pageUrl || undefined
            );

            const responseData = response.data;
            setCourses(responseData.results.data ?? []);
            setTotalCount(responseData.count || 0);
            setNextPage(responseData.next);
            setPrevPage(responseData.previous);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to fetch courses');
            setCourses([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const reviewCourseAction = useCallback(async (
        id: string,
        data: { status: 'APPROVED' | 'REJECTED' | 'PUBLISHED'; feedback?: string }
    ) => {
        setLoading(true);
        setError(null);
        try {
            await reviewCourse(id, data);
            // Refresh courses after review if we're in a list view
            // fetchCourses('PENDING'); 
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to review course');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const loadNextPage = useCallback(() => {
        if (nextPage) {
            fetchCourses('ALL', nextPage);
        }
    }, [nextPage, fetchCourses]);

    const loadPrevPage = useCallback(() => {
        if (prevPage) {
            fetchCourses('ALL', prevPage);
        }
    }, [prevPage, fetchCourses]);

    return {
        courses,
        loading,
        error,
        totalCount,
        nextPage,
        prevPage,
        fetchCourses,
        reviewCourseAction,
        loadNextPage,
        loadPrevPage,
    };
};
