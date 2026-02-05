import React, { useEffect, useState, createContext, useContext, useCallback } from 'react'


interface User {
    id: string
    email: string
    first_name?: string
    last_name?: string
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
    email_verified: boolean
}
interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (
        tokens: {
            access: string
            refresh: string
        },
        userData: User,
    ) => void
    logout: () => void
    updateUser: (userData: Partial<User>) => void
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const logout = useCallback(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        setUser(null)
    }, [])

    useEffect(() => {
        const initAuth = async () => {
            const accessToken = localStorage.getItem('access_token')
            const storedUser = localStorage.getItem('user')
            if (accessToken && storedUser) {
                try {
                    setUser(JSON.parse(storedUser))
                } catch (error) {
                    console.error('Failed to parse stored user', error)
                    logout()
                }
            }
            setIsLoading(false)
        }
        initAuth()
    }, [logout])
    const login = (
        tokens: {
            access: string
            refresh: string
        },
        userData: User,
    ) => {
        localStorage.setItem('access_token', tokens.access)
        localStorage.setItem('refresh_token', tokens.refresh)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }
    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = {
                ...user,
                ...userData,
            }
            setUser(updatedUser)
            localStorage.setItem('user', JSON.stringify(updatedUser))
        }
    }
    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
export function useAuthContext() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}
