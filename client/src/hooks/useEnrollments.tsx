import { useState, useCallback } from 'react'
import { api, endpoints } from '../lib/api'
import type { Enrollment } from '../types'
import { isAxiosError } from 'axios'

export function useEnrollments() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getMyEnrollments = useCallback(async () => {
        setLoading(true)
        try {
            const response = await api.get(endpoints.enrollments.list)
            setEnrollments(response.data.data)
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

    return {
        enrollments,
        loading,
        error,
        getMyEnrollments,
    }
}
