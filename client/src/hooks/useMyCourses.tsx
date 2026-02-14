/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { getMyCourses, deleteCourse } from '../lib/api';
import type { CoursesSummary, CourseFilters } from '../types';

export function useMyCourses() {
    const [courses, setCourses] = useState<CoursesSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null as string | null,
        previous: null as string | null,
    });

    const fetchMyCourses = useCallback(
        async (filters?: CourseFilters, pageUrl?: string | null) => {
            setLoading(true);
            setError(null);
            try {
                const response = await getMyCourses(filters, pageUrl);
                setCourses(response.data.results.data);
                setPagination({
                    count: response.data.count,
                    next: response.data.next,
                    previous: response.data.previous,
                });
            } catch (err: any) {
                setError(err.response?.data?.error?.message || err.response?.data?.message || 'An error occurred');
                console.error('API call failed:', err);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const removeCourse = useCallback(
        async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                await deleteCourse(id);
                setCourses((prev) => prev.filter((c) => c.id !== id));
            } catch (err: any) {
                const errorMsg = err.response?.data?.error?.message ||
                    err.response?.data?.message ||
                    'Failed to delete course';
                setError(errorMsg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return {
        courses,
        loading,
        error,
        pagination,
        fetchMyCourses,
        removeCourse,
    };
}
