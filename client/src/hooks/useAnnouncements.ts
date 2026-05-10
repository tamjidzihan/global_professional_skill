/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import {
    getAnnouncements,
    getAnnouncementDetail,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from '../lib/api';
import type { Announcement, AnnouncementCreateUpdateData } from '../types';
import { extractErrorMessage } from '../lib/errorUtils';
import toast from 'react-hot-toast';

export function useAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnnouncements = useCallback(async (params?: Record<string, any>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAnnouncements(params);
            if (response.data.success) {
                setAnnouncements(response.data.data);
            }
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err);
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAnnouncementDetail = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAnnouncementDetail(id);
            if (response.data.success) {
                setAnnouncement(response.data.data);
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

    const addAnnouncement = useCallback(async (data: AnnouncementCreateUpdateData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await createAnnouncement(data);
            if (response.data.success) {
                const newAnn = response.data.data;
                setAnnouncements(prev => [newAnn, ...prev]);
                toast.success('Announcement created successfully');
                return newAnn;
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

    const editAnnouncement = useCallback(async (id: string, data: AnnouncementCreateUpdateData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await updateAnnouncement(id, data);
            if (response.data.success) {
                const updatedAnn = response.data.data;
                setAnnouncements(prev => prev.map(a => a.id === id ? updatedAnn : a));
                if (announcement?.id === id) setAnnouncement(updatedAnn);
                toast.success('Announcement updated successfully');
                return updatedAnn;
            }
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err);
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
        return null;
    }, [announcement]);

    const removeAnnouncement = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await deleteAnnouncement(id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
            if (announcement?.id === id) setAnnouncement(null);
            toast.success('Announcement deleted successfully');
            return true;
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err);
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
        return false;
    }, [announcement]);

    return {
        announcements,
        announcement,
        loading,
        error,
        fetchAnnouncements,
        fetchAnnouncementDetail,
        addAnnouncement,
        editAnnouncement,
        removeAnnouncement,
    };
}
