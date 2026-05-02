import { useState, useCallback } from 'react'
import { enrollInCourse, getEnrollments, api, endpoints } from '../lib/api'
import type { Enrollment, ApiResponse } from '../types'
import { isAxiosError } from 'axios'
import { toast } from 'react-hot-toast'

export function useEnrollments() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getMyEnrollments = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getEnrollments()
            setEnrollments(response.data.results)
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to fetch enrollments')
            } else if (err instanceof Error) {
                setError(err.message || 'Failed to fetch enrollments')
            } else {
                setError('An unknown error occurred.')
            }
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchAllEnrollments = useCallback(async (params?: Record<string, string | number | boolean>) => {
        setLoading(true)
        setError(null)
        try {
            const response = await getEnrollments(params)
            setEnrollments(response.data.results)
            return response.data
        } catch (err: unknown) {
            let msg = 'Failed to fetch enrollments'
            if (isAxiosError(err)) {
                msg = err.response?.data?.error?.message || msg
            } else if (err instanceof Error) {
                msg = err.message || msg
            }
            setError(msg)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchEnrollmentDetail = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.get<ApiResponse<Enrollment>>(endpoints.enrollments.detail(id))
            setEnrollment(response.data.data)
            return response.data.data
        } catch (err: unknown) {
            let msg = 'Failed to fetch enrollment details'
            if (isAxiosError(err)) {
                msg = err.response?.data?.error?.message || msg
            } else if (err instanceof Error) {
                msg = err.message || msg
            }
            setError(msg)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    const enroll = async (courseId: string) => {
        setLoading(true)
        try {
            const response = await enrollInCourse(courseId)
            if (response.data.success) {
                toast.success('Successfully enrolled in the course!')
                return true
            }
            return false
        } catch (err: unknown) {
            let message = 'Failed to enroll'
            if (isAxiosError(err)) {
                message = err.response?.data?.error?.message || message
            }
            toast.error(message)
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        enrollments,
        enrollment,
        loading,
        error,
        getMyEnrollments,
        fetchAllEnrollments,
        fetchEnrollmentDetail,
        enroll,
    }
}
