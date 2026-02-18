/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from 'react';
import type { User, PaginatedResponse } from '../types';
import { api } from '../lib/api';

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [prevPage, setPrevPage] = useState<string | null>(null);

    const fetchUsers = useCallback(async (pageUrl: string | null = null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<PaginatedResponse<{ success: boolean, data: User[] }>>(
                pageUrl || '/accounts/users/'
            );

            const responseData = response.data;
            setUsers(responseData.results.data ?? []);
            setTotalCount(responseData.count || 0);
            setNextPage(responseData.next);
            setPrevPage(responseData.previous);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to fetch users');
            setUsers([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadNextPage = useCallback(() => {
        if (nextPage) {
            fetchUsers(nextPage);
        }
    }, [nextPage, fetchUsers]);

    const loadPrevPage = useCallback(() => {
        if (prevPage) {
            fetchUsers(prevPage);
        }
    }, [prevPage, fetchUsers]);

    return {
        users,
        loading,
        error,
        totalCount,
        nextPage,
        prevPage,
        fetchUsers,
        loadNextPage,
        loadPrevPage,
    };
};
