/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { getCategories, getCategoryDetail, createCategory, updateCategory, deleteCategory } from '../lib/api'
import type { Category, CategoryDetailResponse } from '../types'
import toast from 'react-hot-toast'

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        count: 0,
        next: null as string | null,
        previous: null as string | null,
    });

    const fetchData = useCallback(
        async <T,>(
            apiCall: (...args: any[]) => Promise<any>,
            setter: React.Dispatch<React.SetStateAction<T>>,
            setPaginationSetter?: React.Dispatch<React.SetStateAction<any>>,
            dataPath: string[] = ['data'], // Path to extract data from response
            ...args: any[]
        ) => {
            setLoading(true)
            setError(null)
            try {
                const response = await apiCall(...args);
                let data = response.data;

                // Navigate through the data path to extract the actual data
                for (const path of dataPath) {
                    if (data && typeof data === 'object' && path in data) {
                        data = data[path];
                    } else {
                        break;
                    }
                }

                setter(data as T);

                // If there's a pagination setter, extract pagination info
                if (setPaginationSetter) {
                    const responseData = response.data;
                    setPaginationSetter({
                        count: responseData.count || 0,
                        next: responseData.next || null,
                        previous: responseData.previous || null,
                    });
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'An error occurred');
                console.error('API call failed:', err);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    // Category Actions
    const fetchCategories = useCallback(
        async (filters?: Record<string, any>, pageUrl?: string | null) =>
            fetchData<Category[]>(
                getCategories,
                setCategories,
                setPagination,
                ['results'],
                filters,
                pageUrl
            ),
        [fetchData],
    );

    const fetchCategoryDetail = useCallback(
        async (id: string) => fetchData<CategoryDetailResponse | null>(
            getCategoryDetail,
            setCategory,
            undefined,
            ['data'],
            id),
        [fetchData],
    );

    const createCategoryAction = async (data: Partial<Category>) => {
        setSubmitting(true)
        setError(null)
        try {
            const response = await createCategory(data)
            toast.success('Category created successfully')
            return response.data
        } catch (err: any) {
            const msg = err.response?.data?.error?.details?.name?.[0] || 'Failed to create category'
            setError(msg)
            toast.error(msg)
            return false
        } finally {
            setSubmitting(false)
        }
    }

    const updateCategoryAction = async (id: string, data: Partial<Category>) => {
        setSubmitting(true)
        setError(null)
        try {
            const response = await updateCategory(id, data)
            toast.success('Category updated successfully')
            return response.data
        } catch (err: any) {
            const msg = err.response?.data?.error?.details?.name?.[0] || 'Failed to update category'
            setError(msg)
            toast.error(msg)
            return false
        } finally {
            setSubmitting(false)
        }
    }

    const deleteCategoryAction = async (id: string) => {
        setSubmitting(true)
        setError(null)
        try {
            await deleteCategory(id)
            setCategories(prev => prev.filter(c => c.id !== id))
            toast.success('Category deleted successfully')
        } catch (err: any) {
            const msg = err.response?.data?.error?.details?.name?.[0] || 'Failed to delete category'
            setError(msg)
            toast.error(msg)
            return false
        } finally {
            setSubmitting(false)
        }
    }


    return {
        pagination,
        categories,
        category,
        fetchCategories,
        fetchCategoryDetail,
        createCategoryAction,
        updateCategoryAction,
        deleteCategoryAction,
        loading,
        submitting,
        error,
    }
}