/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import type {
    CourseListResponse,
    CoursesSummary,
    CourseDetail
} from '../types';
import { getCourses, reviewCourse, getCourseDetail } from '../lib/api';

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'DRAFT';

export const useAdminCourses = () => {
    const [courses, setCourses] = useState<CoursesSummary[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null);
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

    const fetchCourseDetail = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCourseDetail(id);
            const courseData = response.data.data;
            setSelectedCourse(courseData);
            return courseData;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || 'Failed to fetch course details';
            setError(errorMessage);
            setSelectedCourse(null);
            throw err;
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
            // If we're currently viewing this course, refresh its details
            if (selectedCourse?.id === id) {
                await fetchCourseDetail(id);
            }
            fetchCourses('PENDING');
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to review course');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCourses, fetchCourseDetail, selectedCourse]);

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

    const clearSelectedCourse = useCallback(() => {
        setSelectedCourse(null);
    }, []);

    return {
        // Existing state
        courses,
        loading,
        error,
        totalCount,
        nextPage,
        prevPage,

        // New state
        selectedCourse,

        // Existing functions
        fetchCourses,
        reviewCourseAction,
        loadNextPage,
        loadPrevPage,

        // New functions
        fetchCourseDetail,
        clearSelectedCourse,
    };
};