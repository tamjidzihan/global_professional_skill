// LoginPage.tsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../../hooks/useAuth'

export function LoginPage() {
    const { login, loading, error } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return
        await login(email, password)
    }

    const handleDemoLogin = () => {
        setEmail('student@gpis.org.bd')
        setPassword('password123')
    }

    return (
        <AuthLayout type="login">
            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
                <p className="text-gray-600">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-700">
                                <p className="font-medium mb-1">Login Failed</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all"
                            placeholder="student@gpis.org.bd"
                            required
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-sm text-[#0066CC] hover:text-blue-700 font-medium"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all"
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Remember Me & Demo Login */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-[#0066CC] focus:ring-[#0066CC] border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>

                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        className="text-sm text-gray-600 hover:text-[#0066CC] font-medium"
                    >
                        Try demo account
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-linear-to-r from-[#0066CC] to-blue-600 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Signing in...</span>
                        </>
                    ) : (
                        <span>Sign In</span>
                    )}
                </button>

                {/* Help Text */}
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">Need help signing in?</p>
                            <p>Contact support at <a href="mailto:support@gpis.org.bd" className="underline">support@gpis.org.bd</a></p>
                        </div>
                    </div>
                </div>
            </form>
        </AuthLayout>
    )
}