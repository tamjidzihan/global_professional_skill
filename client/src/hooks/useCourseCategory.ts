import { useCallback, useEffect, useState } from 'react'
import { CanceledError } from 'axios'
import { getCategories, getCourses } from '../lib/api'
import { extractErrorMessage } from '../lib/errorUtils'
import type { Category, CoursesSummary } from '../types'

export function useCourseCategory(selectedCategoryId: string | null = null) {
    const [categories, setCategories] = useState<Category[]>([])
    const [courses, setCourses] = useState<CoursesSummary[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [coursesLoading, setCoursesLoading] = useState(true)
    const [categoriesError, setCategoriesError] = useState<string | null>(null)
    const [coursesError, setCoursesError] = useState<string | null>(null)
    const [refreshCount, setRefreshCount] = useState(0)

    useEffect(() => {
        const controller = new AbortController()

        const fetchCategories = async () => {
            setCategoriesLoading(true)
            setCategoriesError(null)
            try {
                const response = await getCategories(undefined, undefined, controller.signal)
                setCategories(response.data.results)
            } catch (error) {
                if (error instanceof CanceledError) return
                setCategoriesError(extractErrorMessage(error))
            } finally {
                if (!controller.signal.aborted) setCategoriesLoading(false)
            }
        }

        void fetchCategories()
        return () => controller.abort()
    }, [refreshCount])

    useEffect(() => {
        const controller = new AbortController()

        const fetchCourses = async () => {
            setCoursesLoading(true)
            setCoursesError(null)
            try {
                const response = await getCourses(
                    selectedCategoryId ? { category: selectedCategoryId } : undefined,
                    undefined,
                    controller.signal,
                )
                setCourses(response.data.results.data)
            } catch (error) {
                if (error instanceof CanceledError) return
                setCoursesError(extractErrorMessage(error))
            } finally {
                if (!controller.signal.aborted) setCoursesLoading(false)
            }
        }

        void fetchCourses()
        return () => controller.abort()
    }, [refreshCount, selectedCategoryId])

    const refresh = useCallback(() => {
        setRefreshCount(count => count + 1)
    }, [])

    return {
        categories,
        courses,
        loading: categoriesLoading || coursesLoading,
        error: categoriesError ?? coursesError,
        refresh,
    }
}

export default useCourseCategory
