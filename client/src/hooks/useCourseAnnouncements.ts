/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import {
    getCourseAnnouncements,
    getCourseAnnouncementsByCourse,
    getCourseAnnouncementDetail,
    createCourseAnnouncement,
    updateCourseAnnouncement,
    deleteCourseAnnouncement,
} from '../lib/api'
import type { CourseAnnouncement, CourseAnnouncementCreateUpdateData } from '../types'
import { extractErrorMessage } from '../lib/errorUtils'
import toast from 'react-hot-toast'

export function useCourseAnnouncements() {
    const [announcements, setAnnouncements] = useState<CourseAnnouncement[]>([])
    const [announcement, setAnnouncement] = useState<CourseAnnouncement | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCourseAnnouncements = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await getCourseAnnouncements()
            if (response.data.success) {
                setAnnouncements(response.data.data)
            }
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err)
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchCourseAnnouncementsByCourse = useCallback(async (courseId: string) => {
        setLoading(true)
        setError(null)
        try {
            const response = await getCourseAnnouncementsByCourse(courseId)
            if (response.data.success) {
                setAnnouncements(response.data.data)
                return response.data.data
            }
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err)
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
        return [] as CourseAnnouncement[]
    }, [])

    const fetchCourseAnnouncementDetail = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)
        try {
            const response = await getCourseAnnouncementDetail(id)
            if (response.data.success) {
                setAnnouncement(response.data.data)
                return response.data.data
            }
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err)
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
        return null
    }, [])

    const addCourseAnnouncement = useCallback(
        async (courseId: string, data: CourseAnnouncementCreateUpdateData) => {
            setLoading(true)
            setError(null)
            try {
                const response = await createCourseAnnouncement(courseId, data)
                if (response.data.success) {
                    const newAnnouncement = response.data.data
                    setAnnouncements(prev => [newAnnouncement, ...prev])
                    toast.success('Course announcement created successfully')
                    return newAnnouncement
                }
            } catch (err: any) {
                const errorMsg = extractErrorMessage(err)
                setError(errorMsg)
                toast.error(errorMsg)
            } finally {
                setLoading(false)
            }
            return null
        },
        [],
    )

    const editCourseAnnouncement = useCallback(
        async (id: string, data: CourseAnnouncementCreateUpdateData) => {
            setLoading(true)
            setError(null)
            try {
                const response = await updateCourseAnnouncement(id, data)
                if (response.data.success) {
                    const updatedAnnouncement = response.data.data
                    setAnnouncements(prev => prev.map(item => item.id === id ? updatedAnnouncement : item))
                    if (announcement?.id === id) setAnnouncement(updatedAnnouncement)
                    toast.success('Course announcement updated successfully')
                    return updatedAnnouncement
                }
            } catch (err: any) {
                const errorMsg = extractErrorMessage(err)
                setError(errorMsg)
                toast.error(errorMsg)
            } finally {
                setLoading(false)
            }
            return null
        },
        [announcement],
    )

    const removeCourseAnnouncement = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)
        try {
            await deleteCourseAnnouncement(id)
            setAnnouncements(prev => prev.filter(item => item.id !== id))
            if (announcement?.id === id) setAnnouncement(null)
            toast.success('Course announcement deleted successfully')
            return true
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err)
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
        return false
    }, [announcement])

    return {
        announcements,
        announcement,
        loading,
        error,
        fetchCourseAnnouncements,
        fetchCourseAnnouncementsByCourse,
        fetchCourseAnnouncementDetail,
        addCourseAnnouncement,
        editCourseAnnouncement,
        removeCourseAnnouncement,
    }
}
