/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { api, endpoints } from '../lib/api'
import { toast } from 'react-hot-toast'

export function useAuth() {
    const { login: contextLogin, logout: contextLogout, user, isAuthenticated } = useAuthContext()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const login = async (email: string, password: string) => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.post(endpoints.auth.login, { email, password })
            const { user, tokens } = response.data.data

            if (!user.email_verified) {
                setError('Please verify your email address to log in.')
                // Show toast notification
                toast.error('Please verify your email address to log in.')
                // Optionally, navigate to a page that prompts email verification
                navigate('/verify-email-prompt'); // Assuming you create this page
                return false
            }

            contextLogin(tokens, user)

            // Redirect based on role
            switch (user.role) {
                case 'ADMIN':
                    navigate('/dashboard/admin')
                    break
                case 'INSTRUCTOR':
                    navigate('/dashboard/instructor')
                    break
                default:
                    navigate('/dashboard/student')
            }
            return true
        } catch (err: any) {
            const emailVerificationError = err.response?.data?.error?.details?.email?.[0];

            if (emailVerificationError === 'Please verify your email address before logging in.') {
                // Do NOT set form error as we are navigating away
                toast.error('Please verify your email address to log in.');
                navigate('/verify-email-prompt');
            } else {
                setError(err.response?.data?.message || 'Login failed');
                toast.error(err.response?.data?.message || 'Login failed'); // Show toast for generic login failures
            }
            return false
        } finally {
            setLoading(false)
        }
    }

    const register = async (data: any) => {
        setLoading(true)
        setError(null)
        try {
            await api.post(endpoints.auth.register, data)
            return true
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed')
            return false
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        contextLogout()
        navigate('/login')
    }

    return {
        login,
        register,
        logout,
        loading,
        error,
        user,
        isAuthenticated,
    }
}
