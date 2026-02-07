/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { getMyProfile, updateMyProfile } from '../lib/api';
import type { User } from '../types';
import { useAuth } from './useAuth';

export const useMyProfile = () => {
    const { isAuthenticated } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await getMyProfile();
            setProfile(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to fetch profile.');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const updateProfile = useCallback(async (profileData: Partial<User> | FormData) => {
        setIsUpdating(true);
        setUpdateError(null);
        setUpdateSuccess(false);
        try {
            const response = await updateMyProfile(profileData);
            setProfile(response.data.data); // Update local state with new profile data
            setUpdateSuccess(true);
        } catch (err: any) {
            setUpdateError(err.response?.data?.error?.message || 'Failed to update profile.');
        } finally {
            setIsUpdating(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        isLoading,
        error,
        updateProfile,
        isUpdating,
        updateError,
        updateSuccess,
        fetchProfile
    };
};