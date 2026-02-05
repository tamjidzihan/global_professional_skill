import React, { useState } from 'react'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface RegisterFormData {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    acceptTerms: boolean;
}

export function RegisterPage() {
    const { register, loading, error } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        acceptTerms: false
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        // Validate form
        if (!formData.acceptTerms) {
            setFormError('You must accept the Terms & Conditions and Privacy Policy.')
            return
        }

        if (formData.password !== formData.password_confirm) {
            setFormError('Passwords do not match.')
            return
        }

        if (formData.password.length < 8) {
            setFormError('Password must be at least 8 characters long.')
            return
        }

        // Prepare API payload
        const payload = {
            email: formData.email,
            password: formData.password,
            password_confirm: formData.password_confirm,
            first_name: formData.first_name,
            last_name: formData.last_name
        }

        const success = await register(payload)

        if (success) {
            // Reset form data on successful registration
            setFormData({
                email: '',
                password: '',
                password_confirm: '',
                first_name: '',
                last_name: '',
                acceptTerms: false
            })
            // Navigate to login with success message
            navigate('/login?registrationSuccess=true')
        }
    }

    const handleChange = (field: keyof RegisterFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <AuthLayout type="register">
            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h1>
                <p className="text-gray-600">Enter your credentials to Create new account</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {(error || formError) && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-700">
                                <p className="font-medium mb-1">Registration Failed</p>
                                <p>{error || formError}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* First Name Field */}
                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="first_name"
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                            placeholder="Enter your first name"
                            required
                            minLength={2}
                        />
                    </div>
                </div>

                {/* Last Name Field */}
                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="last_name"
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                            placeholder="Enter your last name"
                            required
                            minLength={2}
                        />
                    </div>
                </div>

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
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                            placeholder="student@example.com"
                            required
                            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                            placeholder="Create a strong password"
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Use at least 8 characters with a mix of letters, numbers, and symbols
                    </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password_confirm"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password_confirm}
                            onChange={(e) => handleChange('password_confirm', e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                            placeholder="Confirm your password"
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start">
                    <input
                        id="terms"
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                        className="h-4 w-4 text-[#0066CC] border-gray-300 rounded mt-0.5"
                        required
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                        I agree to the{' '}
                        <Link to="/terms" className="text-[#0066CC] hover:underline">
                            Terms & Conditions
                        </Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-[#0066CC] hover:underline">
                            Privacy Policy
                        </Link>
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#0066CC] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Login Link */}
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#0066CC] font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}