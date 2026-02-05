import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error),
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refresh_token')
                if (!refreshToken) {
                    throw new Error('No refresh token')
                }

                const response = await axios.post(
                    `${API_URL}/accounts/token/refresh/`,
                    {
                        refresh: refreshToken,
                    },
                )

                const { access } = response.data.data.tokens || response.data
                localStorage.setItem('access_token', access)

                originalRequest.headers.Authorization = `Bearer ${access}`
                return api(originalRequest)
            } catch (refreshError) {
                // If refresh fails, logout user
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('user')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    },
)

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
    },
    courses: {
        list: '/courses/courses/',
        create: '/courses/courses/',
        detail: (id: string) => `/courses/courses/${id}/`,
        submit: (id: string) => `/courses/courses/${id}/submit_for_review/`,
        review: (id: string) => `/courses/courses/${id}/review/`,
    },
    sections: {
        create: (courseId: string) => `/courses/courses/${courseId}/sections/`,
    },
    lessons: {
        create: (courseId: string, sectionId: string) =>
            `/courses/courses/${courseId}/sections/${sectionId}/lessons/`,
    },
    enrollments: {
        enroll: '/enrollments/enrollments/',
        list: '/enrollments/enrollments/',
        markComplete: (progressId: string) =>
            `/enrollments/progress/${progressId}/mark_complete/`,
    },
    reviews: {
        create: (courseId: string) => `/courses/courses/${courseId}/reviews/`,
    },
    analytics: {
        instructor: '/analytics/instructor/',
        admin: '/analytics/admin/',
    },
}
