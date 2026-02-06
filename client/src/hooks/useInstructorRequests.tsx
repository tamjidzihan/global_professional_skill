// hooks/useInstructorRequests.ts
import { useState, useCallback } from 'react'
import type { InstructorRequest, InstructorRequestsResponse } from '../types'
import { getInstructorRequests } from '../lib/api'

export const useInstructorRequests = () => {
    const [requests, setRequests] = useState<InstructorRequest[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState<number>(0)
    const [nextPage, setNextPage] = useState<string | null>(null)
    const [prevPage, setPrevPage] = useState<string | null>(null)

    const fetchInstructorRequests = useCallback(async (status: string = 'ALL', pageUrl: string | null = null) => {
        setLoading(true)
        setError(null)
        try {
            const params: Record<string, string> = {}
            if (status !== 'ALL') {
                params.status = status
            }

            const response = await getInstructorRequests<InstructorRequestsResponse>(
                pageUrl ? undefined : params,
                pageUrl || undefined
            )

            const responseData = response.data

            // Handle the nested structure
            const requestsArray = responseData.results?.data || []
            setRequests(requestsArray)
            setTotalCount(responseData.count || 0)
            setNextPage(responseData.next)
            setPrevPage(responseData.previous)

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || 'Failed to fetch instructor requests')
            } else {
                setError('Failed to fetch instructor requests')
            }
            setRequests([])
            setTotalCount(0)
        } finally {
            setLoading(false)
        }
    }, [])

    const loadNextPage = useCallback(() => {
        if (nextPage) {
            fetchInstructorRequests('ALL', nextPage)
        }
    }, [nextPage, fetchInstructorRequests])

    const loadPrevPage = useCallback(() => {
        if (prevPage) {
            fetchInstructorRequests('ALL', prevPage)
        }
    }, [prevPage, fetchInstructorRequests])

    return {
        requests,
        loading,
        error,
        totalCount,
        nextPage,
        prevPage,
        fetchInstructorRequests,
        loadNextPage,
        loadPrevPage,
    }
}