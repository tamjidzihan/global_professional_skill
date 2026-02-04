import { useState, useEffect, useCallback } from 'react'
import { api, endpoints } from '../lib/api'
import { useAuthContext } from '../context/AuthContext'

export function useProfile() {
    const { user, updateUser } = useAuthContext()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getProfile = useCallback(async () => {
        setLoading(true)
        try {
            const response = await api.get(endpoints.profile.get)
            setProfile(response.data.data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch profile')
        } finally {
            setLoading(false)
        }
    }, [])

    const updateProfile = async (data: any) => {
        setLoading(true)
        try {
            const response = await api.patch(endpoints.profile.update, data)
            setProfile(response.data.data)
            updateUser(response.data.data) // Update context if needed
            return true
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile')
            return false
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            getProfile()
        }
    }, [user, getProfile])

    return {
        profile,
        loading,
        error,
        getProfile,
        updateProfile,
    }
}
