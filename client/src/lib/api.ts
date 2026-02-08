/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosResponse } from 'axios'
import type { CreateInstructorRequest, User } from '../types'

const API_URL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
    baseURL: API_URL,
})


let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
}> = []

const processQueue = (error: any | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else if (token) {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

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

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                }).catch(err => {
                    return Promise.reject(err)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            return new Promise((resolve, reject) => {
                const refreshToken = localStorage.getItem('refresh_token')
                if (!refreshToken) {
                    processQueue(new Error('No refresh token'))
                    isRefreshing = false
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    localStorage.removeItem('user')
                    window.location.href = '/login'
                    return reject(new Error('No refresh token'))
                }

                api.post(endpoints.auth.refresh, { refresh: refreshToken })
                    .then(response => {
                        const responseData = response.data
                        const access = responseData.data?.tokens?.access ||
                            responseData.tokens?.access ||
                            responseData.access ||
                            responseData.data?.access

                        if (access) {
                            localStorage.setItem('access_token', access)
                            processQueue(null, access)
                            originalRequest.headers.Authorization = `Bearer ${access}`
                            resolve(api(originalRequest))
                        } else {
                            throw new Error('No access token in response')
                        }
                    })
                    .catch(err => {
                        processQueue(err, null)
                        localStorage.removeItem('access_token')
                        localStorage.removeItem('refresh_token')
                        localStorage.removeItem('user')
                        window.location.href = '/login'
                        reject(err)
                    })
                    .finally(() => {
                        isRefreshing = false
                    })
            })
        }

        return Promise.reject(error)
    }
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

// Instructor Request API Calls
export const createInstructorRequest = (data: CreateInstructorRequest) =>
    api.post(endpoints.instructorRequests.create, data)


export const getInstructorRequests = <T = any>(
    params?: Record<string, string>,
    pageUrl?: string | null
): Promise<AxiosResponse<T>> => {
    if (pageUrl) {
        return api.get<T>(pageUrl)
    }
    return api.get<T>(endpoints.instructorRequests.list, { params })
}

export const getInstructorRequestDetail = <T = any>(id: string): Promise<AxiosResponse<T>> =>
    api.get<T>(endpoints.instructorRequests.detail(id))

export const reviewInstructorRequest = (
    id: string,
    data: { status: 'APPROVED' | 'REJECTED'; feedback?: string }
): Promise<AxiosResponse> =>
    api.post(endpoints.instructorRequests.review(id), data)

// User Management API Calls
export const updateUserRole = (userId: string, role: string) =>
    api.patch(endpoints.users.updateRole(userId), { role })

export const getUserDetail = (userId: string) =>
    api.get(endpoints.users.detail(userId))

// My Profile API Calls
export const getMyProfile = () =>
    api.get(endpoints.profile.get)

export const updateMyProfile = (data: Partial<User> | FormData) =>
    api.put(endpoints.profile.update, data)

