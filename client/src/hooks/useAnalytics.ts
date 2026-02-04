import { useState, useCallback } from 'react'
import { api, endpoints } from '../lib/api'

export function useAnalytics() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getInstructorAnalytics = useCallback(async () => {
        setLoading(true)
        try {
            const response = await api.get(endpoints.analytics.instructor)
            setData(response.data.data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch analytics')
        } finally {
            setLoading(false)
        }
    }, [])

    const getAdminAnalytics = useCallback(async () => {
        setLoading(true)
        try {
            const response = await api.get(endpoints.analytics.admin)
            setData(response.data.data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch analytics')
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        data,
        loading,
        error,
        getInstructorAnalytics,
        getAdminAnalytics,
    }
}
