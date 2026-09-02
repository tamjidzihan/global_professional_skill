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
                navigate('/verify-email-prompt', { state: { email } });
                return false
            }

            contextLogin(tokens, user)

            toast.success(`welcome back, ${user.first_name}!`)

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
                navigate('/verify-email-prompt', { state: { email } });
            } else {
                setError(
                    err.response?.data?.error?.details?.email?.[0] ||
                    err.response?.data?.error?.details?.password?.[0] ||
                    'Login failed'
                );
                toast.error(
                    err.response?.data?.error?.details?.email?.[0] ||
                    err.response?.data?.error?.details?.password?.[0] ||
                    'Login failed'
                );
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
            const details = err.response?.data?.error?.details || err.response?.data || {}
            let errorMessage = 'Registration failed'

            if (details.phone_number?.[0]) {
                errorMessage = details.phone_number[0]
            } else if (details.email?.[0]) {
                errorMessage = details.email[0]
            } else if (details.employee_id?.[0]) {
                errorMessage = details.employee_id[0]
            } else if (details.password?.[0]) {
                errorMessage = details.password[0]
            } else if (details.non_field_errors?.[0]) {
                errorMessage = details.non_field_errors[0]
            } else if (err.response?.data?.error?.message) {
                errorMessage = err.response.data.error.message
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message
            }

            setError(errorMessage)
            toast.error(errorMessage)
            return false
        } finally {
            setLoading(false)
        }
    }

    const resendVerification = async (email: string, channel: 'email' | 'sms' | 'both' = 'both') => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.post(endpoints.auth.resendVerification, { email, channel })
            const successMsg = response.data?.message || 'Verification message sent successfully.'
            toast.success(successMsg)
            return true
        } catch (err: any) {
            const message =
                err.response?.data?.error?.message ||
                err.response?.data?.message ||
                err.response?.data?.non_field_errors?.[0] ||
                err.response?.data?.email?.[0] ||
                'Failed to resend verification message'
            setError(message)
            toast.error(message)
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
        resendVerification,
        logout,
        loading,
        error,
        user,
        isAuthenticated,
    }
}
