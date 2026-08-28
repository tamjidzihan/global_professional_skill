/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import {
    // Categories API Endpoints
    getCategories,
    getCategoryDetail,
    // createCategory,
    // updateCategory,
    deleteCategory,

    // Courses API Endpoints
    getCourses,
    getCourseDetail,
    createCourse,
    updateCourse,
    deleteCourse,
    submitCourseForReview,
    // reviewCourse,

    // Sections API Endpoints
    getSections,
    getSectionDetail,
    createSection,
    updateSection,
    deleteSection,

    // Lessons API Endpoints
    getLessons,
    getLessonDetail,
    createLesson,
    updateLesson,
    deleteLesson,
    toggleLessonCompletion,

    // Reviews API Endpoints
    getReviews,
    getReviewDetail,
    createReview,
    // updateReview,
    deleteReview,
} from '../lib/api';

import type {
    CoursesSummary,
    CourseDetail,
    Category,
    Section,
    Lesson,
    Review,
    SectionCreateData,
    LessonCreateUpdateData,
    CourseFilters,
    CourseStatus,
    ReviewCreateUpdateData,
} from '../types';
import { extractErrorMessage } from '../lib/errorUtils';
import toast from 'react-hot-toast';

export function useCourses() {
    // States
    const [courses, setCourses] = useState<CoursesSummary[]>([]);
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [section, setSection] = useState<Section | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [review, setReview] = useState<Review | null>(null);

    const [loading, setLoading] = useState(false);
    const [coursesFetched, setCoursesFetched] = useState(false);
    const [courseDetailFetched, setCourseDetailFetched] = useState(false);
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
            dataPath: string[] = ['data'],
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

                // Extract pagination info
                if (setPaginationSetter) {
                    const responseData = response.data;
                    setPaginationSetter({
                        count: responseData.count || 0,
                        next: responseData.next || null,
                        previous: responseData.previous || null,
                    });
                }
            } catch (err: any) {
                setError(err.response?.data?.error?.message || err.response?.data?.message || 'An error occurred');
                console.error('API call failed:', err);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    // ==================== Course Actions ====================

    const fetchCourses = useCallback(
        async (filters?: CourseFilters, pageUrl?: string | null) => {
            setCoursesFetched(false);
            await fetchData<CoursesSummary[]>(
                getCourses,
                setCourses,
                setPagination,
                ['results', 'data'],
                filters,
                pageUrl
            );
            setCoursesFetched(true);
        },
        [fetchData],
    );

    const fetchCourseDetail = useCallback(
        async (id: string) => {
            setCourseDetailFetched(false);
            await fetchData<CourseDetail | null>(
                getCourseDetail,
                setCourse,
                undefined,
                ['data', 'data'],
                id
            );
            setCourseDetailFetched(true);
        },
        [fetchData],
    );

    const addCourse = useCallback(
        async (data: FormData) => {
            setLoading(true);
            setError(null);
            try {
                const response = await createCourse(data);
                const newCourse = response.data.data;

                const { instructor, category, ...rest } = newCourse;
                const newCourseSummary: CoursesSummary = {
                    ...rest,
                    instructor_name: `${instructor.first_name} ${instructor.last_name}`,
                    category_name: category.name,
                };
                setCourses((prev) => [newCourseSummary, ...prev]);
                toast.success('Course created successfully');
                return newCourse;

            } catch (err: any) {
                const errorMsg = extractErrorMessage(err);
                setError(errorMsg);
                toast.error(errorMsg);
                return false
            } finally {
                setLoading(false);
            }
        },
        []
    );


    const editCourse = useCallback(
        async (id: string, data: FormData) => {
            setLoading(true);
            setError(null);
            try {
                const response = await updateCourse(id, data);
                const updatedCourse = response.data.data;

                const { instructor, category, ...rest } = updatedCourse;
                const updatedCourseSummary: CoursesSummary = {
                    ...rest,
                    instructor_name: `${instructor.first_name} ${instructor.last_name}`,
                    category_name: category.name,
                };

                setCourses((prev) =>
                    prev.map((c) => (c.id === id ? updatedCourseSummary : c)),
                );
                if (course?.id === id) setCourse(updatedCourse);
                toast.success('Course updated successfully');
                return updatedCourse;
            } catch (err: any) {
                const errorMsg = extractErrorMessage(err);
                setError(errorMsg);
                toast.error(errorMsg);
                return false
            } finally {
                setLoading(false);
            }
        },
        [course],
    );

    const removeCourse = useCallback(
        async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                await deleteCourse(id);
                setCourses((prev) => prev.filter((c) => c.id !== id));
                if (course?.id === id) setCourse(null);
                toast.success('Course deleted successfully');
            } catch (err: any) {
                const errorMsg = err.response?.data?.error?.message ||
                    err.response?.data?.message ||
                    'Failed to delete course';
                setError(errorMsg);
                toast.error(errorMsg);

                return false
            } finally {
                setLoading(false);
            }
        },
        [course],
    );

    const submitForReview = useCallback(
        async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                await submitCourseForReview(id);
                setCourse((prev) => prev ? { ...prev, status: 'PENDING' as CourseStatus } : prev);
                setCourses((prev) =>
                    prev.map((c) =>
                        c.id === id ? { ...c, status: 'PENDING' as CourseStatus } : c
                    )
                );
            } catch (err: any) {
                const errorMsg = extractErrorMessage(err);
                setError(errorMsg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    // const adminReviewCourse = useCallback(
    //     async (id: string, data: CourseReviewData) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await reviewCourse(id, data);
    //             const reviewedCourse = response.data.data;
    //             setCourse(reviewedCourse);
    //             setCourses((prev) =>
    //                 prev.map((c) => (c.id === id ? reviewedCourse : c)),
    //             );
    //             return reviewedCourse;
    //         } catch (err: any) {
    //             const errorMsg = err.response?.data?.error?.message ||
    //                 err.response?.data?.message ||
    //                 'Failed to review course';
    //             setError(errorMsg);
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [],
    // );

    // ==================== Category Actions ====================

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

    const fetchCategoryDetail = useCallback(
        async (id: string) =>
            fetchData<Category | null>(
                getCategoryDetail,
                setCategory,
                undefined,
                ['data'],
                id
            ),
        [fetchData],
    );

    // const addCategory = useCallback(
    //     async (data: Partial<Category>) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await createCategory(data);
    //             const newCategory = response.data;
    //             setCategories((prev) => [...prev, newCategory]);
    //             return newCategory;
    //         } catch (err: any) {
    //             const errorMsg = err.response?.data?.error?.message ||
    //                 err.response?.data?.message ||
    //                 'Failed to create category';
    //             setError(errorMsg);
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
    //             const updatedCategory = response.data;
    //             setCategories((prev) =>
    //                 prev.map((c) => (c.id === id ? updatedCategory : c)),
    //             );
    //             if (category?.id === id) setCategory(updatedCategory);
    //             return updatedCategory;
    //         } catch (err: any) {
    //             const errorMsg = err.response?.data?.error?.message ||
    //                 err.response?.data?.message ||
    //                 'Failed to update category';
    //             setError(errorMsg);
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [category],
    // );

    const removeCategory = useCallback(
        async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                await deleteCategory(id);
                setCategories((prev) => prev.filter((c) => c.id !== id));
                if (category?.id === id) setCategory(null);
            } catch (err: any) {
                const errorMsg = err.response?.data?.error?.message ||
                    err.response?.data?.message ||
                    'Failed to delete category';
                setError(errorMsg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [category],
    );

    // ==================== Section Actions ====================

    const fetchSections = useCallback(
        async (courseId: string, filters?: Record<string, any>, pageUrl?: string | null) =>
            fetchData<Section[]>(
                getSections,
                setSections,
                undefined,
                ['data'],
                courseId,
                filters,
                pageUrl
            ),
        [fetchData],
    );

    const fetchSectionDetail = useCallback(async (courseId: string, sectionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getSectionDetail(courseId, sectionId);
            const data = response.data.data;
            setSection(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to fetch section');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const addSection = useCallback(async (courseId: string, data: SectionCreateData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await createSection(courseId, data);
            const newSection = response.data.data;
            setSections((prev) => [...prev, newSection]);

            // Update course detail if it's the current course
            if (course?.id === courseId) {
                setCourse(prev => prev ? {
                    ...prev,
                    sections: [...(prev.sections || []), newSection],
                    total_classes: (prev.total_classes || 0) + 1
                } : prev);
            }

            return newSection;
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Failed to create section';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [course]);

    const editSection = useCallback(async (
        courseId: string,
        sectionId: string,
        data: Partial<SectionCreateData>
    ) => {
        setLoading(true);
        setError(null);
        try {
            const response = await updateSection(courseId, sectionId, data);
            const updatedSection = response.data.data;

            setSections((prev) =>
                prev.map((s) => (s.id === sectionId ? updatedSection : s)),
            );

            // Update course detail sections
            if (course?.id === courseId) {
                setCourse(prev => prev ? {
                    ...prev,
                    sections: prev.sections.map(s =>
                        s.id === sectionId ? updatedSection : s
                    )
                } : prev);
            }

            if (section?.id === sectionId) setSection(updatedSection);
            return updatedSection;
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Failed to update section';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [section, course]);

    const removeSection = useCallback(async (courseId: string, sectionId: string) => {
        setLoading(true);
        setError(null);
        try {
            await deleteSection(courseId, sectionId);
            setSections((prev) => prev.filter((s) => s.id !== sectionId));

            // Update course detail
            if (course?.id === courseId) {
                setCourse(prev => prev ? {
                    ...prev,
                    sections: prev.sections.filter(s => s.id !== sectionId),
                    total_classes: Math.max(0, (prev.total_classes || 0) - 1)
                } : prev);
            }

            if (section?.id === sectionId) setSection(null);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Failed to delete section';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [section, course]);

    // ==================== Lesson Actions ====================


    const fetchLessons = useCallback(
        async (courseId: string, sectionId: string, filters?: Record<string, any>, pageUrl?: string | null) =>
            fetchData<Lesson[]>(
                getLessons,
                setLessons,
                undefined,
                ['data'],
                courseId,
                sectionId,
                filters,
                pageUrl,
            ),
        [fetchData],
    );


    const fetchLessonDetail = useCallback(async (
        courseId: string,
        sectionId: string,
        lessonId: string
    ): Promise<Lesson | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await getLessonDetail(courseId, sectionId, lessonId);
            const data = response.data.data;
            setLesson(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to fetch lesson');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const addLesson = useCallback(async (
        courseId: string,
        sectionId: string,
        data: LessonCreateUpdateData
    ) => {
        setLoading(true);
        setError(null);
        try {
            const response = await createLesson(courseId, sectionId, data);
            const newLesson = response.data.data;
            setLessons((prev) => [...prev, newLesson]);

            // Update section lessons in course detail
            if (course?.id === courseId) {
                setCourse(prev => {
                    if (!prev) return prev;
                    const updatedSections = prev.sections.map(s =>
                        s.id === sectionId
                            ? {
                                ...s,
                                lessons: [...s.lessons, newLesson],
                                lesson_count: s.lesson_count + 1
                            }
                            : s
                    );
                    return {
                        ...prev,
                        sections: updatedSections,
                        total_classes: (prev.total_classes || 0) + 1
                    };
                });
            }

            return newLesson;
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Failed to create lesson';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [course]);

    const editLesson = useCallback(async (
        courseId: string,
        sectionId: string,
        lessonId: string,
        data: Partial<LessonCreateUpdateData>
    ) => {
        setLoading(true);
        setError(null);
        try {
            const response = await updateLesson(courseId, sectionId, lessonId, data);
            const updatedLesson = response.data.data;

            setLessons((prev) =>
                prev.map((l) => (l.id === lessonId ? updatedLesson : l)),
            );

            // Update section lessons in course detail
            if (course?.id === courseId) {
                setCourse(prev => {
                    if (!prev) return prev;
                    const updatedSections = prev.sections.map(s =>
                        s.id === sectionId
                            ? {
                                ...s,
                                lessons: s.lessons.map(l =>
                                    l.id === lessonId ? updatedLesson : l
                                )
                            }
                            : s
                    );
                    return { ...prev, sections: updatedSections };
                });
            }

            if (lesson?.id === lessonId) setLesson(updatedLesson);
            return updatedLesson;
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Failed to update lesson';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [lesson, course]);

    const removeLesson = useCallback(async (
        courseId: string,
        sectionId: string,
        lessonId: string
    ) => {
        setLoading(true);
        setError(null);
        try {
            await deleteLesson(courseId, sectionId, lessonId);
            setLessons((prev) => prev.filter((l) => l.id !== lessonId));

            // Update section lessons in course detail
            if (course?.id === courseId) {
                setCourse(prev => prev ? {
                    ...prev,
                    sections: prev.sections.map(s =>
                        s.id === sectionId
                            ? {
                                ...s,
                                lessons: s.lessons.filter(l => l.id !== lessonId),
                                lesson_count: Math.max(0, (s.lesson_count || 0) - 1)
                            }
                            : s
                    )
                } : prev);
            }

            if (lesson?.id === lessonId) setLesson(null);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Failed to delete lesson';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [lesson, course]);

    const toggleLessonProgress = useCallback(async (
        courseId: string,
        sectionId: string,
        lessonId: string
    ) => {
        setLoading(true);
        setError(null);
        try {
            const response = await toggleLessonCompletion(courseId, sectionId, lessonId);
            const updatedLesson = response.data.data;
            const is_completed = updatedLesson.is_completed;
            
            // Update lessons list
            setLessons((prev) =>
                prev.map((l) => (l.id === lessonId ? updatedLesson : l)),
            );

            // Update section lessons in course detail
            if (course?.id === courseId) {
                setCourse(prev => {
                    if (!prev) return prev;
                    const updatedSections = prev.sections.map(s =>
                        s.id === sectionId
                            ? {
                                ...s,
                                lessons: s.lessons.map(l =>
                                    l.id === lessonId ? updatedLesson : l
                                )
                            }
                            : s
                    );
                    return { ...prev, sections: updatedSections };
                });
            }
            
            toast.success(response.data.message || "Progress updated");
            return is_completed;
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err);
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    }, [course]);


    // ==================== Review Actions ====================

    const fetchReviews = useCallback(
        async (courseId: string, filters?: Record<string, any>, pageUrl?: string | null) =>
            fetchData<Review[]>(
                getReviews,
                setReviews,
                setPagination,
                ['results', 'data'],
                courseId,
                filters,
                pageUrl
            ),
        [fetchData],
    );

    const fetchReviewDetail = useCallback(
        async (courseId: string, reviewId: string) =>
            fetchData<Review | null>(
                getReviewDetail,
                setReview,
                undefined,
                ['data', 'data'],
                courseId,
                reviewId
            ),
        [fetchData],
    );

    const addReview = useCallback(
        async (courseId: string, data: ReviewCreateUpdateData) => {
            setLoading(true);
            setError(null);
            try {
                const response = await createReview(courseId, data);
                const newReview = response.data.data;
                setReviews((prev) => [newReview, ...prev]);

                // Update course reviews and rating in detail view
                if (course?.id === courseId) {
                    setCourse(prev => prev ? {
                        ...prev,
                        reviews: [newReview, ...(prev.reviews || [])],
                        total_reviews: (prev.total_reviews || 0) + 1,
                        // Note: average_rating should be updated from the server response
                    } : prev);
                }

                return newReview;
            } catch (err: any) {
                const errorMsg = err.response?.data?.error?.message ||
                    err.response?.data?.message ||
                    'Failed to create review';
                setError(errorMsg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [course],
    );

    // const editReview = useCallback(
    //     async (courseId: string, reviewId: string, data: Partial<ReviewCreateUpdateData>) => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await updateReview(courseId, reviewId, data);
    //             const updatedReview = response.data.data;
    //             setReviews((prev) =>
    //                 prev.map((r) => (r.id === reviewId ? updatedReview : r)),
    //             );

    //             // Update course reviews in detail view
    //             if (course?.id === courseId) {
    //                 setCourse(prev => prev ? {
    //                     ...prev,
    //                     reviews: prev.reviews.map(r =>
    //                         r.id === reviewId ? updatedReview : r
    //                     ),
    //                     average_rating: response.data.data.average_rating || prev.average_rating,
    //                 } : prev);
    //             }

    //             if (review?.id === reviewId) setReview(updatedReview);
    //             return updatedReview;
    //         } catch (err: any) {
    //             const errorMsg = err.response?.data?.error?.message ||
    //                 err.response?.data?.message ||
    //                 'Failed to update review';
    //             setError(errorMsg);
    //             throw err;
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [review, course],
    // );

    const removeReview = useCallback(
        async (courseId: string, reviewId: string) => {
            setLoading(true);
            setError(null);
            try {
                await deleteReview(courseId, reviewId);
                setReviews((prev) => prev.filter((r) => r.id !== reviewId));

                // Update course in detail view
                if (course?.id === courseId) {
                    setCourse(prev => prev ? {
                        ...prev,
                        reviews: prev.reviews.filter(r => r.id !== reviewId),
                        total_reviews: Math.max(0, (prev.total_reviews || 0) - 1),
                    } : prev);
                }

                if (review?.id === reviewId) setReview(null);
            } catch (err: any) {
                const errorMsg = err.response?.data?.error?.message ||
                    err.response?.data?.message ||
                    'Failed to delete review';
                setError(errorMsg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [review, course],
    );

    // Helper function to clear all states
    const clearStates = useCallback(() => {
        setCourses([]);
        setCourse(null);
        setCategories([]);
        setCategory(null);
        setSections([]);
        setSection(null);
        setLessons([]);
        setLesson(null);
        setReviews([]);
        setReview(null);
        setError(null);
        setCoursesFetched(false);
        setCourseDetailFetched(false);
        setPagination({
            count: 0,
            next: null,
            previous: null,
        });
    }, []);

    return {
        // Pagination
        pagination,

        // States
        courses,
        course,
        categories,
        category,
        sections,
        section,
        lessons,
        lesson,
        reviews,
        review,
        loading,
        coursesFetched,
        courseDetailFetched,
        error,

        // Course Actions
        fetchCourses,
        fetchCourseDetail,
        addCourse,
        editCourse,
        removeCourse,
        submitForReview,
        // adminReviewCourse,

        // Category Actions
        fetchCategories,
        fetchCategoryDetail,
        // addCategory,
        // editCategory,
        removeCategory,

        // Section Actions
        fetchSections,
        fetchSectionDetail,
        addSection,
        editSection,
        removeSection,

        // Lesson Actions
        fetchLessons,
        fetchLessonDetail,
        addLesson,
        editLesson,
        removeLesson,
        toggleLessonProgress,

        // Review Actions
        fetchReviews,
        fetchReviewDetail,
        addReview,
        // editReview,
        removeReview,

        // Utility
        clearStates,
    };
}