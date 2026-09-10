/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef } from 'react';
import type {
    CoursesSummary,
    CourseDetail
} from '../types';
import { getCourses, reviewCourse, getCourseDetail } from '../lib/api';

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'DRAFT';

export interface FetchCoursesOptions {
    page?: number;
    search?: string;
    all?: boolean;
    pageSize?: number;
}

export const useAdminCourses = () => {
    const [courses, setCourses] = useState<CoursesSummary[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [prevPage, setPrevPage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(12);

    const currentStatusRef = useRef<FilterStatus>('ALL');
    const currentSearchRef = useRef<string>('');

    const fetchCourses = useCallback(async (
        status: FilterStatus = 'ALL',
        pageUrl: string | null = null,
        options?: FetchCoursesOptions
    ) => {
        setLoading(true);
        setError(null);
        currentStatusRef.current = status;
        if (options?.search !== undefined) {
            currentSearchRef.current = options.search;
        }

        try {
            const params: Record<string, any> = {};

            if (options?.all) {
                params.all = 'true';
            } else {
                if (options?.page) {
                    params.page = options.page;
                }
                if (options?.pageSize) {
                    params.page_size = options.pageSize;
                }
            }

            if (status !== 'ALL') {
                params.status = status;
            }

            if (currentSearchRef.current) {
                params.search = currentSearchRef.current;
            }

            const response = await getCourses<any>(
                pageUrl ? undefined : params,
                pageUrl || undefined
            );

            const responseData = response.data;
            const coursesList =
                responseData?.results?.data ||
                responseData?.data ||
                (Array.isArray(responseData?.results) ? responseData.results : null) ||
                (Array.isArray(responseData) ? responseData : []);

            setCourses(coursesList);
            const count = responseData?.count ?? coursesList.length;
            setTotalCount(count);
            setNextPage(responseData?.next ?? null);
            setPrevPage(responseData?.previous ?? null);

            if (options?.pageSize) {
                setPageSize(options.pageSize);
            }

            // Determine page number
            if (options?.page) {
                setCurrentPage(options.page);
            } else if (pageUrl) {
                try {
                    const parsedUrl = new URL(pageUrl, window.location.origin);
                    const pageParam = parsedUrl.searchParams.get('page');
                    if (pageParam) {
                        setCurrentPage(parseInt(pageParam, 10));
                    }
                } catch {
                    // ignore URL parsing fallback
                }
            } else {
                setCurrentPage(1);
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to fetch courses');
            setCourses([]);
            setTotalCount(0);
            setNextPage(null);
            setPrevPage(null);
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
            if (selectedCourse?.id === id) {
                await fetchCourseDetail(id);
            }
            fetchCourses('PENDING', null, { all: true });
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to review course');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCourses, fetchCourseDetail, selectedCourse]);

    const loadNextPage = useCallback(() => {
        if (nextPage) {
            fetchCourses(currentStatusRef.current, nextPage);
        }
    }, [nextPage, fetchCourses]);

    const loadPrevPage = useCallback(() => {
        if (prevPage) {
            fetchCourses(currentStatusRef.current, prevPage);
        }
    }, [prevPage, fetchCourses]);

    const goToPage = useCallback((pageNumber: number) => {
        fetchCourses(currentStatusRef.current, null, {
            page: pageNumber,
            search: currentSearchRef.current,
            pageSize,
        });
    }, [fetchCourses, pageSize]);

    const clearSelectedCourse = useCallback(() => {
        setSelectedCourse(null);
    }, []);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
        // State
        courses,
        loading,
        error,
        totalCount,
        nextPage,
        prevPage,
        currentPage,
        pageSize,
        totalPages,
        selectedCourse,

        // Actions
        fetchCourses,
        reviewCourseAction,
        loadNextPage,
        loadPrevPage,
        goToPage,
        setPageSize,
        fetchCourseDetail,
        clearSelectedCourse,
    };
};