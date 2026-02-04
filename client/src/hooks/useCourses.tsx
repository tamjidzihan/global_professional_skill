import { useState, useCallback } from 'react'
import { api, endpoints } from '../lib/api'

export function useCourses() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getCourses = useCallback(async (filters?: any) => {
        setLoading(true)
        try {
            const response = await api.get(endpoints.courses.list, {
                params: filters,
            })
            setCourses(response.data.data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch courses')
        } finally {
            setLoading(false)
        }
    }, [])

    const createCourse = async (data: any) => {
        setLoading(true)
        try {
            const response = await api.post(endpoints.courses.create, data)
            setCourses((prev) => [...prev, response.data.data])
            return response.data.data
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create course')
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {
        courses,
        loading,
        error,
        getCourses,
        createCourse,
    }
}
