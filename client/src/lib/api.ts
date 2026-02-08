/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosResponse } from 'axios';
import type {
    CreateInstructorRequest,
    User,
    Category,
    CategoryListResponse,
    CategoryDetailResponse,
    CourseDetail,
    CourseListResponse,
    CourseDetailResponse,
    Section,
    Lesson,
    Review,
    ApiResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second delay between retries
const THROTTLE_WINDOW = 60000; // 60 seconds window

// Store for tracking rate limits
let requestCount = 0;
let resetTime = 0;

export const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 second timeout
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Rate limiting helper functions
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const calculateDelay = () => {
    const now = Date.now();

    // If we're within the rate limit window and have made too many requests
    if (requestCount >= 10 && now < resetTime) { // Assuming 10 requests per minute
        return Math.max(RATE_LIMIT_DELAY, resetTime - now);
    }

    // Reset counters if we're past the window
    if (now >= resetTime) {
        requestCount = 0;
        resetTime = now + THROTTLE_WINDOW;
    }

    return 0;
};

// Request interceptor for rate limiting and adding token
api.interceptors.request.use(
    async (config) => {
        // Apply rate limiting
        const delay = calculateDelay();
        if (delay > 0) {
            await wait(delay);
        }

        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Update rate limit tracking
        requestCount++;

        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor to handle token refresh and rate limiting
api.interceptors.response.use(
    (response) => {
        // Check for rate limit headers in response
        const remaining = response.headers['x-ratelimit-remaining'];
        const reset = response.headers['x-ratelimit-reset'];

        if (remaining !== undefined) {
            requestCount = 10 - parseInt(remaining, 10); // Assuming max 10 requests
        }

        if (reset !== undefined) {
            resetTime = parseInt(reset, 10) * 1000; // Convert from seconds to milliseconds
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle rate limiting/throttling errors
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'] ||
                error.response.data?.details?.detail?.match(/available in (\d+) seconds/)?.[1] ||
                60; // Default 60 seconds

            console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);

            // Wait for the specified retry time
            await wait(parseInt(retryAfter) * 1000);

            // Retry the request
            return api(originalRequest);
        }

        // Handle 401 errors for token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise((resolve, reject) => {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    processQueue(new Error('No refresh token'));
                    isRefreshing = false;
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return reject(new Error('No refresh token'));
                }

                api.post(endpoints.auth.refresh, { refresh: refreshToken })
                    .then(response => {
                        const responseData = response.data;
                        const access = responseData.data?.tokens?.access ||
                            responseData.tokens?.access ||
                            responseData.access ||
                            responseData.data?.access;

                        if (access) {
                            localStorage.setItem('access_token', access);
                            processQueue(null, access);
                            originalRequest.headers.Authorization = `Bearer ${access}`;
                            resolve(api(originalRequest));
                        } else {
                            throw new Error('No access token in response');
                        }
                    })
                    .catch(err => {
                        processQueue(err, null);
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                        reject(err);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        return Promise.reject(error);
    }
);

export const endpoints = {
    auth: {
        register: '/accounts/register/',
        verifyEmail: '/accounts/verify-email/',
        login: '/accounts/login/',
        refresh: '/accounts/token/refresh/',
    },
    profile: {
        get: '/accounts/profile/',
        update: '/accounts/profile/',
    },
    instructorRequests: {
        create: '/accounts/instructor-requests/',
        list: '/accounts/instructor-requests/',
        review: (id: string) => `/accounts/instructor-requests/${id}/review/`,
        detail: (id: string) => `/accounts/instructor-requests/${id}/`,
    },
    users: {
        detail: (id: string) => `/accounts/users/${id}/`,
        updateRole: (id: string) => `/accounts/users/${id}/update_role/`,
    },
    courses: {
        list: '/courses/courses/',
        create: '/courses/courses/',
        detail: (id: string) => `/courses/courses/${id}/`,
        update: (id: string) => `/courses/courses/${id}/`,
        delete: (id: string) => `/courses/courses/${id}/`,
        submit: (id: string) => `/courses/courses/${id}/submit_for_review/`,
        review: (id: string) => `/courses/courses/${id}/review/`,
    },
    categories: {
        list: '/courses/categories/',
        create: '/courses/categories/',
        detail: (id: string) => `/courses/categories/${id}/`,
        update: (id: string) => `/courses/categories/${id}/`,
        delete: (id: string) => `/courses/categories/${id}/`,
    },
    sections: {
        list: (courseId: string) => `/courses/courses/${courseId}/sections/`,
        create: (courseId: string) => `/courses/courses/${courseId}/sections/`,
        detail: (courseId: string, sectionId: string) =>
            `/courses/courses/${courseId}/sections/${sectionId}/`,
        update: (courseId: string, sectionId: string) =>
            `/courses/courses/${courseId}/sections/${sectionId}/`,
        delete: (courseId: string, sectionId: string) =>
            `/courses/courses/${courseId}/sections/${sectionId}/`,
    },
    lessons: {
        list: (courseId: string, sectionId: string) =>
            `/courses/courses/${courseId}/sections/${sectionId}/lessons/`,
        create: (courseId: string, sectionId: string) =>
            `/courses/courses/${courseId}/sections/${sectionId}/lessons/`,
        detail: (courseId: string, sectionId: string, lessonId: string) =>
            `/courses/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/`,
        update: (courseId: string, sectionId: string, lessonId: string) =>
            `/courses/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/`,
        delete: (courseId: string, sectionId: string, lessonId: string) =>
            `/courses/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/`,
    },
    enrollments: {
        enroll: '/enrollments/enrollments/',
        list: '/enrollments/enrollments/',
        markComplete: (progressId: string) =>
            `/enrollments/progress/${progressId}/mark_complete/`,
    },
    reviews: {
        list: (courseId: string) => `/courses/courses/${courseId}/reviews/`,
        create: (courseId: string) => `/courses/courses/${courseId}/reviews/`,
        detail: (courseId: string, reviewId: string) =>
            `/courses/courses/${courseId}/reviews/${reviewId}/`,
        update: (courseId: string, reviewId: string) =>
            `/courses/courses/${courseId}/reviews/${reviewId}/`,
        delete: (courseId: string, reviewId: string) =>
            `/courses/courses/${courseId}/reviews/${reviewId}/`,
    },
    analytics: {
        instructor: '/analytics/instructor/',
        admin: '/analytics/admin/',
    },
};

// Instructor Request API Calls
export const createInstructorRequest = (data: CreateInstructorRequest) =>
    api.post(endpoints.instructorRequests.create, data);

export const getInstructorRequests = <T = any>(
    params?: Record<string, string>,
    pageUrl?: string | null
): Promise<AxiosResponse<T>> => {
    if (pageUrl) {
        return api.get<T>(pageUrl);
    }
    return api.get<T>(endpoints.instructorRequests.list, { params });
};

export const getInstructorRequestDetail = <T = any>(id: string): Promise<AxiosResponse<T>> =>
    api.get<T>(endpoints.instructorRequests.detail(id));

export const reviewInstructorRequest = (
    id: string,
    data: { status: 'APPROVED' | 'REJECTED'; feedback?: string }
): Promise<AxiosResponse> =>
    api.post(endpoints.instructorRequests.review(id), data);

// User Management API Calls
export const updateUserRole = (userId: string, role: string) =>
    api.patch(endpoints.users.updateRole(userId), { role });

export const getUserDetail = (userId: string) =>
    api.get(endpoints.users.detail(userId));



// Category API Calls
export const getCategories = <T = CategoryListResponse>(
    params?: Record<string, any>,
    pageUrl?: string | null,
): Promise<AxiosResponse<T>> => {
    if (pageUrl) {
        return api.get<T>(pageUrl);
    }
    return api.get<T>(endpoints.categories.list, { params });
};


export const getCategoryDetail = (id: string): Promise<AxiosResponse<CategoryDetailResponse>> =>
    api.get<CategoryDetailResponse>(endpoints.categories.detail(id));

export const createCategory = (data: Partial<Category>): Promise<AxiosResponse<ApiResponse<Category>>> =>
    api.post<ApiResponse<Category>>(endpoints.categories.create, data);

export const updateCategory = (id: string, data: Partial<Category>): Promise<AxiosResponse<ApiResponse<Category>>> =>
    api.put<ApiResponse<Category>>(endpoints.categories.update(id), data);

export const deleteCategory = (id: string): Promise<AxiosResponse<void>> =>
    api.delete<void>(endpoints.categories.delete(id));

// Course API Calls
export const getCourses = <T = CourseListResponse>(
    params?: Record<string, any>,
    pageUrl?: string | null,
): Promise<AxiosResponse<T>> => {
    if (pageUrl) {
        return api.get<T>(pageUrl);
    }
    return api.get<T>(endpoints.courses.list, { params });
};

export const getCourseDetail = (id: string): Promise<AxiosResponse<CourseDetailResponse>> =>
    api.get<CourseDetailResponse>(endpoints.courses.detail(id));

export const createCourse = (data: Partial<CourseDetail>): Promise<AxiosResponse<ApiResponse<CourseDetail>>> =>
    api.post<ApiResponse<CourseDetail>>(endpoints.courses.create, data);

export const updateCourse = (id: string, data: Partial<CourseDetail>): Promise<AxiosResponse<ApiResponse<CourseDetail>>> =>
    api.put<ApiResponse<CourseDetail>>(endpoints.courses.update(id), data);

export const deleteCourse = (id: string): Promise<AxiosResponse<void>> =>
    api.delete<void>(endpoints.courses.delete(id));

export const submitCourseForReview = (id: string): Promise<AxiosResponse<void>> =>
    api.post<void>(endpoints.courses.submit(id));

export const reviewCourse = (id: string, data: { status: 'APPROVED' | 'REJECTED' | 'PUBLISHED'; feedback?: string }): Promise<AxiosResponse<ApiResponse<CourseDetail>>> =>
    api.post<ApiResponse<CourseDetail>>(endpoints.courses.review(id), data);

// Section API Calls
export const getSections = <T = ApiResponse<Section[]>>(
    courseId: string,
    params?: Record<string, any>,
    pageUrl?: string | null,
): Promise<AxiosResponse<T>> => {
    if (pageUrl) {
        return api.get<T>(pageUrl);
    }
    return api.get<T>(endpoints.sections.list(courseId), { params });
};

export const getSectionDetail = (courseId: string, sectionId: string): Promise<AxiosResponse<ApiResponse<Section>>> =>
    api.get<ApiResponse<Section>>(endpoints.sections.detail(courseId, sectionId));

export const createSection = (courseId: string, data: Partial<Section>): Promise<AxiosResponse<ApiResponse<Section>>> =>
    api.post<ApiResponse<Section>>(endpoints.sections.create(courseId), data);

export const updateSection = (courseId: string, sectionId: string, data: Partial<Section>): Promise<AxiosResponse<ApiResponse<Section>>> =>
    api.put<ApiResponse<Section>>(endpoints.sections.update(courseId, sectionId), data);

export const deleteSection = (courseId: string, sectionId: string): Promise<AxiosResponse<void>> =>
    api.delete<void>(endpoints.sections.delete(courseId, sectionId));

// Lesson API Calls
export const getLessons = <T = ApiResponse<Lesson[]>>(
    courseId: string,
    sectionId: string,
    params?: Record<string, any>,
    pageUrl?: string | null,
): Promise<AxiosResponse<T>> => {
    if (pageUrl) {
        return api.get<T>(pageUrl);
    }
    return api.get<T>(endpoints.lessons.list(courseId, sectionId), { params });
};

export const getLessonDetail = (courseId: string, sectionId: string, lessonId: string): Promise<AxiosResponse<ApiResponse<Lesson>>> =>
    api.get<ApiResponse<Lesson>>(endpoints.lessons.detail(courseId, sectionId, lessonId));

export const createLesson = (courseId: string, sectionId: string, data: Partial<Lesson>): Promise<AxiosResponse<ApiResponse<Lesson>>> =>
    api.post<ApiResponse<Lesson>>(endpoints.lessons.create(courseId, sectionId), data);

export const updateLesson = (courseId: string, sectionId: string, lessonId: string, data: Partial<Lesson>): Promise<AxiosResponse<ApiResponse<Lesson>>> =>
    api.put<ApiResponse<Lesson>>(endpoints.lessons.update(courseId, sectionId, lessonId), data);

export const deleteLesson = (courseId: string, sectionId: string, lessonId: string): Promise<AxiosResponse<void>> =>
    api.delete<void>(endpoints.lessons.delete(courseId, sectionId, lessonId));

// Review API Calls
export const getReviews = <T = ApiResponse<Review[]>>(
    courseId: string,
    params?: Record<string, any>,
    pageUrl?: string | null,
): Promise<AxiosResponse<T>> => {
    if (pageUrl) {
        return api.get<T>(pageUrl);
    }
    return api.get<T>(endpoints.reviews.list(courseId), { params });
};

export const getReviewDetail = (courseId: string, reviewId: string): Promise<AxiosResponse<ApiResponse<Review>>> =>
    api.get<ApiResponse<Review>>(endpoints.reviews.detail(courseId, reviewId));

export const createReview = (courseId: string, data: Partial<Review>): Promise<AxiosResponse<ApiResponse<Review>>> =>
    api.post<ApiResponse<Review>>(endpoints.reviews.create(courseId), data);

export const updateReview = (courseId: string, reviewId: string, data: Partial<Review>): Promise<AxiosResponse<ApiResponse<Review>>> =>
    api.put<ApiResponse<Review>>(endpoints.reviews.update(courseId, reviewId), data);

export const deleteReview = (courseId: string, reviewId: string): Promise<AxiosResponse<void>> =>
    api.delete<void>(endpoints.reviews.delete(courseId, reviewId));

// My Profile API Calls
export const getMyProfile = (): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.get<ApiResponse<User>>(endpoints.profile.get);

export const updateMyProfile = (data: Partial<User> | FormData): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.put<ApiResponse<User>>(endpoints.profile.update, data);