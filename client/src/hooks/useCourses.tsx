/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import {
    // Categories API Endpoints
    getCategories,
    // getCategoryDetail,
    // createCategory,
    // updateCategory,
    // deleteCategory,


    // // Courses API Endpoints
    getCourses,
    // getCourseDetail,
    // createCourse,
    // updateCourse,
    // deleteCourse,

    // submitCourseForReview,
    // reviewCourse,



    // // Sections API Endpoints
    // getSections,
    // getSectionDetail,
    // createSection,
    // updateSection,
    // deleteSection,

    // // Lessons API Endpoints
    // getLessons,
    // getLessonDetail,
    // createLesson,
    // updateLesson,
    // deleteLesson,

    // // Reviews API Endpoints
    // getReviews,
    // getReviewDetail,
    // createReview,
    // updateReview,
    // deleteReview,
} from '../lib/api';

import type {
    CoursesSummary,
    // CourseDetail,
    Category,
    // Section,
    // Lesson,
    // Review,
    // CourseListResponse,
} from '../types';



export function useCourses() {
    const [courses, setCourses] = useState<CoursesSummary[]>([]);
    // const [course, setCourse] = useState<CourseDetail | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    // const [category, setCategory] = useState<Category | null>(null);
    // const [sections, setSections] = useState<Section[]>([]);
    // const [section, setSection] = useState<Section | null>(null);
    // const [lessons, setLessons] = useState<Lesson[]>([]);
    // const [lesson, setLesson] = useState<Lesson | null>(null);
    // const [reviews, setReviews] = useState<Review[]>([]);
    // const [review, setReview] = useState<Review | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null as string | null,
        previous: null as string | null,
    });

    const fetchData = useCallback(
        async <T,>(
            apiCall: (...args: any[]) => Promise<any>,
            setter: React.Dispatch<React.SetStateAction<T>>,
            setPaginationSetter?: React.Dispatch<React.SetStateAction<any>>,
            dataPath: string[] = ['data'], // Path to extract data from response
            ...args: any[]
        ) => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiCall(...args);
                let data = response.data;

                // Navigate through the data path to extract the actual data
                for (const path of dataPath) {
                    if (data && typeof data === 'object' && path in data) {
                        data = data[path];
                    } else {
                        break;
                    }
                }

                setter(data as T);

                // If there's a pagination setter, extract pagination info
                if (setPaginationSetter) {
                    const responseData = response.data;
                    setPaginationSetter({
                        count: responseData.count || 0,
                        next: responseData.next || null,
                        previous: responseData.previous || null,
                    });
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'An error occurred');
                console.error('API call failed:', err);
            } finally {
                setLoading(false);
            }
        },
        [],
    );
    // Course Actions
    const fetchCourses = useCallback(
        async (filters?: Record<string, any>, pageUrl?: string | null) =>
            fetchData<CoursesSummary[]>(getCourses, setCourses, setPagination, ['results', 'data'], filters, pageUrl),
        [fetchData],
    );

    // const fetchCourseDetail = useCallback(
    //     async (id: string) => fetchData<CourseDetail | null>(getCourseDetail, setCourse, ['data', 'data'], id),
    //     [fetchData],
    // );

    // const addCourse = useCallback(
    //     async (data: Partial<CourseDetail>) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await createCourse(data);
    //             const newCourse = response.data.data;
    //             setCourses((prev) => [...prev, newCourse]);
    //             return newCourse;
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to create course',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [],
    // );

    // const editCourse = useCallback(
    //     async (id: string, data: Partial<CourseDetail>) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await updateCourse(id, data);
    //             const updatedCourse = response.data.data;
    //             setCourses((prev) =>
    //                 prev.map((c) => (c.id === id ? updatedCourse : c)),
    //             );
    //             if (course?.id === id) setCourse(updatedCourse);
    //             return updatedCourse;
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to update course',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [course],
    // );

    // const removeCourse = useCallback(
    //     async (id: string) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             await deleteCourse(id);
    //             setCourses((prev) => prev.filter((c) => c.id !== id));
    //             if (course?.id === id) setCourse(null);
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to delete course',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [course],
    // );

    // const submitForReview = useCallback(
    //     async (id: string) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             await submitCourseForReview(id);
    //             setCourse((prev) => prev ? { ...prev, status: 'PENDING' } : prev);
    //             setCourses((prev) =>
    //                 prev.map((c) => c.id === id ? { ...c, status: 'PENDING' } : c)
    //             );
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message ||
    //                 'Failed to submit course for review',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [],
    // );

    // const adminReviewCourse = useCallback(
    //     async (
    //         id: string,
    //         data: { status: 'APPROVED' | 'REJECTED' | 'PUBLISHED'; feedback?: string },
    //     ) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await reviewCourse(id, data);
    //             const reviewedCourse = response.data.data;
    //             setCourse(reviewedCourse);
    //             setCourses((prev) =>
    //                 prev.map((c) => (c.id === id ? reviewedCourse : c)),
    //             );
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to review course',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [],
    // );

    // Category Actions
    const fetchCategories = useCallback(
        async (filters?: Record<string, any>, pageUrl?: string | null) =>
            fetchData<Category[]>(
                getCategories,
                setCategories,
                setPagination,
                ['results'],
                filters,
                pageUrl
            ),
        [fetchData],
    );

    // const fetchCategoryDetail = useCallback(
    //     async (id: string) => fetchData<Category | null>(getCategoryDetail, setCategory, ['data', 'data'], id),
    //     [fetchData],
    // );

    // const addCategory = useCallback(
    //     async (data: Partial<Category>) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await createCategory(data);
    //             const newCategory = response.data.data;
    //             setCategories((prev) => [...prev, newCategory]);
    //             return newCategory;
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to create category',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [],
    // );

    // const editCategory = useCallback(
    //     async (id: string, data: Partial<Category>) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await updateCategory(id, data);
    //             const updatedCategory = response.data.data;
    //             setCategories((prev) =>
    //                 prev.map((c) => (c.id === id ? updatedCategory : c)),
    //             );
    //             if (category?.id === id) setCategory(updatedCategory);
    //             return updatedCategory;
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to update category',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [category],
    // );

    // const removeCategory = useCallback(
    //     async (id: string) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             await deleteCategory(id);
    //             setCategories((prev) => prev.filter((c) => c.id !== id));
    //             if (category?.id === id) setCategory(null);
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to delete category',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [category],
    // );

    // Section Actions
    // const fetchSections = useCallback(
    //     async (
    //         courseId: string,
    //         filters?: Record<string, any>,
    //         pageUrl?: string | null,
    //     ) => fetchData<Section[]>(getSections, setSections, ['data', 'data'], courseId, filters, pageUrl),
    //     [fetchData],
    // );

    // const fetchSectionDetail = useCallback(
    //     async (courseId: string, sectionId: string) =>
    //         fetchData<Section | null>(getSectionDetail, setSection, ['data', 'data'], courseId, sectionId),
    //     [fetchData],
    // );

    // const addSection = useCallback(
    //     async (courseId: string, data: Partial<Section>) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await createSection(courseId, data);
    //             const newSection = response.data.data;
    //             setSections((prev) => [...prev, newSection]);
    //             return newSection;
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to create section',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [],
    // );

    // const editSection = useCallback(
    //     async (courseId: string, sectionId: string, data: Partial<Section>) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await updateSection(courseId, sectionId, data);
    //             const updatedSection = response.data.data;
    //             setSections((prev) =>
    //                 prev.map((s) => (s.id === sectionId ? updatedSection : s)),
    //             );
    //             if (section?.id === sectionId) setSection(updatedSection);
    //             return updatedSection;
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to update section',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [section],
    // );

    // const removeSection = useCallback(
    //     async (courseId: string, sectionId: string) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             await deleteSection(courseId, sectionId);
    //             setSections((prev) => prev.filter((s) => s.id !== sectionId));
    //             if (section?.id === sectionId) setSection(null);
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to delete section',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [section],
    // );

    // Lesson Actions
    // const fetchLessons = useCallback(
    //     async (
    //         courseId: string,
    //         sectionId: string,
    //         filters?: Record<string, any>,
    //         pageUrl?: string | null,
    //     ) =>
    //         fetchData<Lesson[]>(
    //             getLessons,
    //             setLessons,
    //             ['data', 'data'],
    //             courseId,
    //             sectionId,
    //             filters,
    //             pageUrl,
    //         ),
    //     [fetchData],
    // );

    // const fetchLessonDetail = useCallback(
    //     async (courseId: string, sectionId: string, lessonId: string) =>
    //         fetchData<Lesson | null>(
    //             getLessonDetail,
    //             setLesson,
    //             ['data', 'data'],
    //             courseId,
    //             sectionId,
    //             lessonId,
    //         ),
    //     [fetchData],
    // );

    // const addLesson = useCallback(
    //     async (courseId: string, sectionId: string, data: Partial<Lesson>) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await createLesson(courseId, sectionId, data);
    //             const newLesson = response.data.data;
    //             setLessons((prev) => [...prev, newLesson]);
    //             return newLesson;
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to create lesson',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [],
    // );

    // const editLesson = useCallback(
    //     async (
    //         courseId: string,
    //         sectionId: string,
    //         lessonId: string,
    //         data: Partial<Lesson>,
    //     ) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await updateLesson(
    //                 courseId,
    //                 sectionId,
    //                 lessonId,
    //                 data,
    //             );
    //             const updatedLesson = response.data.data;
    //             setLessons((prev) =>
    //                 prev.map((l) => (l.id === lessonId ? updatedLesson : l)),
    //             );
    //             if (lesson?.id === lessonId) setLesson(updatedLesson);
    //             return updatedLesson;
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to update lesson',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [lesson],
    // );

    // const removeLesson = useCallback(
    //     async (courseId: string, sectionId: string, lessonId: string) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             await deleteLesson(courseId, sectionId, lessonId);
    //             setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    //             if (lesson?.id === lessonId) setLesson(null);
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to delete lesson',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [lesson],
    // );

    // // Review Actions
    // const fetchReviews = useCallback(
    //     async (
    //         courseId: string,
    //         filters?: Record<string, any>,
    //         pageUrl?: string | null,
    //     ) =>
    //         fetchData<Review[]>(getReviews, setReviews, ['data', 'data'], courseId, filters, pageUrl),
    //     [fetchData],
    // );

    // const fetchReviewDetail = useCallback(
    //     async (courseId: string, reviewId: string) =>
    //         fetchData<Review | null>(getReviewDetail, setReview, ['data', 'data'], courseId, reviewId),
    //     [fetchData],
    // );

    // const addReview = useCallback(
    //     async (courseId: string, data: Partial<Review>) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await createReview(courseId, data);
    //             const newReview = response.data.data;
    //             setReviews((prev) => [...prev, newReview]);
    //             return newReview;
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to create review',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [],
    // );

    // const editReview = useCallback(
    //     async (courseId: string, reviewId: string, data: Partial<Review>) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await updateReview(courseId, reviewId, data);
    //             const updatedReview = response.data.data;
    //             setReviews((prev) =>
    //                 prev.map((r) => (r.id === reviewId ? updatedReview : r)),
    //             );
    //             if (review?.id === reviewId) setReview(updatedReview);
    //             return updatedReview;
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to update review',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [review],
    // );

    // const removeReview = useCallback(
    //     async (courseId: string, reviewId: string) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             await deleteReview(courseId, reviewId);
    //             setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    //             if (review?.id === reviewId) setReview(null);
    //         } catch (err: any) {
    //             setError(
    //                 err.response?.data?.message || 'Failed to delete review',
    //             );
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [review],
    // );

    return {
        pagination,
        // States
        courses,
        // course,
        categories,
        // category,
        // sections,
        // section,
        // lessons,
        // lesson,
        // reviews,
        // review,
        loading,
        error,

        // Course Actions
        fetchCourses,
        // fetchCourseDetail,
        // addCourse,
        // editCourse,
        // removeCourse,
        // submitForReview,
        // adminReviewCourse,

        // Category Actions
        fetchCategories,
        // fetchCategoryDetail,
        // addCategory,
        // editCategory,
        // removeCategory,

        // Section Actions
        // fetchSections,
        // fetchSectionDetail,
        // addSection,
        // editSection,
        // removeSection,

        // // Lesson Actions
        // fetchLessons,
        // fetchLessonDetail,
        // addLesson,
        // editLesson,
        // removeLesson,

        // // Review Actions
        // fetchReviews,
        // fetchReviewDetail,
        // addReview,
        // editReview,
        // removeReview,
    };
}