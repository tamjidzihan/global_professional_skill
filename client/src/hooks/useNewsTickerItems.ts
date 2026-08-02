/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import {
    getNewsTickerItems,
    getNewsTickerItemDetail,
    createNewsTickerItem,
    updateNewsTickerItem,
    deleteNewsTickerItem,
} from '../lib/api';
import type { NewsTickerItem, NewsTickerItemCreateUpdateData } from '../types';
import { extractErrorMessage } from '../lib/errorUtils';
import toast from 'react-hot-toast';

export function useNewsTickerItems() {
    const [items, setItems] = useState<NewsTickerItem[]>([]);
    const [item, setItem] = useState<NewsTickerItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNewsTickerItems = useCallback(async (params?: Record<string, any>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getNewsTickerItems(params);
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err);
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchNewsTickerItemDetail = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getNewsTickerItemDetail(id);
            if (response.data.success) {
                setItem(response.data.data);
                return response.data.data;
            }
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err);
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
        return null;
    }, []);

    const addNewsTickerItem = useCallback(async (data: NewsTickerItemCreateUpdateData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await createNewsTickerItem(data);
            if (response.data.success) {
                const newItem = response.data.data;
                setItems(prev => [newItem, ...prev]);
                toast.success('News ticker item created successfully');
                return newItem;
            }
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err);
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
        return null;
    }, []);

    const editNewsTickerItem = useCallback(async (id: string, data: NewsTickerItemCreateUpdateData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await updateNewsTickerItem(id, data);
            if (response.data.success) {
                const updatedItem = response.data.data;
                setItems(prev => prev.map(i => i.id === id ? updatedItem : i));
                if (item?.id === id) setItem(updatedItem);
                toast.success('News ticker item updated successfully');
                return updatedItem;
            }
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err);
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
        return null;
    }, [item]);

    const removeNewsTickerItem = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await deleteNewsTickerItem(id);
            setItems(prev => prev.filter(i => i.id !== id));
            if (item?.id === id) setItem(null);
            toast.success('News ticker item deleted successfully');
            return true;
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err);
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
        return false;
    }, [item]);

    return {
        items,
        item,
        loading,
        error,
        fetchNewsTickerItems,
        fetchNewsTickerItemDetail,
        addNewsTickerItem,
        editNewsTickerItem,
        removeNewsTickerItem,
    };
}
