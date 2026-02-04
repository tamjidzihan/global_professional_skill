import { useState, useCallback } from 'react'
import { api, endpoints } from '../lib/api'

export function useEnrollments() {
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getMyEnrollments = useCallback(async () => {
        setLoading(true)
        try {
            const response = await api.get(endpoints.enrollments.list)
            setEnrollments(response.data.data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch enrollments')
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
