import { useState } from 'react'
import { api, endpoints } from '../lib/api'
import { useAuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
    const { login: contextLogin, logout: contextLogout } = useAuthContext()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const login = async (email: string, password: string) => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.post(endpoints.auth.login, { email, password })
            const { user, tokens } = response.data.data
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
            setError(err.response?.data?.message || 'Login failed')
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
    }
}
