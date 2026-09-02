import { toast } from 'react-hot-toast'
import React, { useState } from 'react'
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    Phone,
    Building2,
    BadgeCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import SEO from '../components/SEO'
import { AuthLayout } from '../layouts/AuthLayout'

interface RegisterFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    organization_name: string;
    employee_id: string;
    password: string;
    password_confirm: string;
    acceptTerms: boolean;
}

export function RegisterPage() {
    const { register, loading, error } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const [formData, setFormData] = useState<RegisterFormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        organization_name: '',
        employee_id: '',
        password: '',
        password_confirm: '',
        acceptTerms: false,
    })

    const validatePhoneNumber = (phone: string): boolean => {
        const cleaned = phone.replace(/[\s\-()]/g, '')
        const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/
        return bdPhoneRegex.test(cleaned)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        // Validation
        if (!formData.first_name.trim()) {
            setFormError('First name is required.')
            return
        }

        if (!formData.last_name.trim()) {
            setFormError('Last name is required.')
            return
        }

        if (!formData.email.trim()) {
            setFormError('Email address is required.')
            return
        }

        if (!formData.phone_number.trim()) {
            setFormError('Mobile number is required.')
            return
        }

        if (!validatePhoneNumber(formData.phone_number)) {
            setFormError(
                'Please enter a valid Bangladesh mobile number (e.g. +8801712345678 or 01712345678).'
            )
            return
        }

        if (formData.password.length < 8) {
            setFormError('Password must be at least 8 characters long.')
            return
        }

        if (formData.password !== formData.password_confirm) {
            setFormError('Passwords do not match.')
            return
        }

        if (!formData.acceptTerms) {
            setFormError('You must accept the Terms & Conditions and Privacy Policy.')
            return
        }

        // Prepare API payload
        const payload = {
            email: formData.email.trim(),
            password: formData.password,
            password_confirm: formData.password_confirm,
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            phone_number: formData.phone_number.trim(),
            organization_name: formData.organization_name.trim(),
            employee_id: formData.employee_id.trim(),
        }

        const success = await register(payload)

        if (success) {
            toast.success(
                'Registration successful! Verification link has been sent to your email and phone.'
            )
            // Navigate to verification prompt page with registered contact info
            navigate('/verify-email-prompt', {
                state: {
                    email: formData.email.trim(),
                    phone_number: formData.phone_number.trim(),
                },
            })
        }
    }

    const handleChange = (field: keyof RegisterFormData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (formError) setFormError(null)
    }

    return (
        <AuthLayout type="register">
            <SEO
                title="Create Your Account"
                description="Join Global Professional Institute today. Create an account to access professional courses and advance your career."
            />
            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h1>
                <p className="text-gray-600">Enter your credentials to create a new account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {(error || formError) && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-700">
                                <p className="font-medium mb-0.5">Registration Failed</p>
                                <p>{formError || error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                        <label
                            htmlFor="first_name"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                            First Name <span className="text-red-500">*</span>
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
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                                placeholder="e.g. John"
                                required
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div>
                        <label
                            htmlFor="last_name"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                            Last Name <span className="text-red-500">*</span>
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
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                                placeholder="e.g. Doe"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
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
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                            placeholder="student@example.com"
                            required
                        />
                    </div>
                </div>

                {/* Mobile Number Field (Required) */}
                <div>
                    <label
                        htmlFor="phone_number"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="phone_number"
                            type="tel"
                            value={formData.phone_number}
                            onChange={(e) => handleChange('phone_number', e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm font-mono tracking-wide"
                            placeholder="+880 1712345678"
                            required
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                        <span className="font-medium text-gray-600">Example:</span>
                        <span className="font-mono text-gray-500">+880 1712345678</span>
                        <span className="text-gray-400">or</span>
                        <span className="font-mono text-gray-500">01712345678</span>
                    </p>
                </div>

                {/* Organization Name & Employee ID (Optional Fields) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Organization Name */}
                    <div>
                        <label
                            htmlFor="organization_name"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                            Organization Name (Optional)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building2 className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="organization_name"
                                type="text"
                                value={formData.organization_name}
                                onChange={(e) => handleChange('organization_name', e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                                placeholder="Company or Institution"
                            />
                        </div>
                    </div>

                    {/* Employee ID */}
                    <div>
                        <label
                            htmlFor="employee_id"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                            Employee ID (Optional)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <BadgeCheck className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="employee_id"
                                type="text"
                                value={formData.employee_id}
                                onChange={(e) => handleChange('employee_id', e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                                placeholder="e.g. EMP-10492"
                            />
                        </div>
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        Password <span className="text-red-500">*</span>
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
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                            placeholder="Create a secure password"
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Use at least 8 characters with letters, numbers & symbols
                    </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label
                        htmlFor="password_confirm"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        Confirm Password <span className="text-red-500">*</span>
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
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                            placeholder="Confirm your password"
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start pt-1">
                    <input
                        id="terms"
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                        className="h-4 w-4 text-[#0066CC] border-gray-300 rounded mt-0.5 cursor-pointer"
                        required
                    />
                    <label htmlFor="terms" className="ml-2 text-xs text-gray-600 leading-normal">
                        I agree to the{' '}
                        <Link to="/terms" className="text-[#0066CC] hover:underline font-medium">
                            Terms & Conditions
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-[#0066CC] hover:underline font-medium">
                            Privacy Policy
                        </Link>
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#0066CC] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm cursor-pointer"
                    disabled={
                        loading ||
                        !formData.first_name ||
                        !formData.last_name ||
                        !formData.email ||
                        !formData.phone_number ||
                        !formData.password ||
                        !formData.password_confirm ||
                        !formData.acceptTerms
                    }
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Login Link */}
                <p className="text-center text-xs text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#0066CC] font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}