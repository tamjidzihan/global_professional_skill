import { useState, useCallback } from 'react'
import { enrollInCourse, getEnrollments } from '../lib/api'
import type { Enrollment } from '../types'
import { isAxiosError } from 'axios'
import { toast } from 'react-hot-toast'

export function useEnrollments() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
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
        loading,
        error,
        getMyEnrollments,
        enroll,
    }
}
