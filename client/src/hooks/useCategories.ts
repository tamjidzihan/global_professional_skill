/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { getCategories, getCategoryDetail } from '../lib/api'
import type { Category, CategoryDetailResponse } from '../types'

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(false)
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


    return {
        pagination,
        categories,
        category,
        fetchCategories,
        fetchCategoryDetail,
        loading,
        error,
    }
}