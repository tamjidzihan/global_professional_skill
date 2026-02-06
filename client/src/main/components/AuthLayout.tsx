import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, Shield, Award, Users, ChevronRight } from 'lucide-react'

interface AuthLayoutProps {
    children: React.ReactNode
    type: 'login' | 'register' | 'info'
}

export function AuthLayout({ children, type }: AuthLayoutProps) {
    const isLogin = type === 'login'
    const isRegister = type === 'register'
    const isInfo = type === 'info'

    const features = [
        { icon: Shield, text: 'Secure & Private' },
        { icon: BookOpen, text: 'Access All Courses' },
        { icon: Award, text: 'Track Progress' },
        { icon: Users, text: 'Join Community' },
    ]

    return (
        <main className="grow relative bg-[#FCF8F1]">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Left Side - Hero Info */}
                        <div className="hidden lg:block relative">
                            <div className="bg-linear-to-br from-yellow-50 via-yellow-100 to-yellow-150 rounded-3xl p-10 shadow-lg relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/30 rounded-full animate-spin-slow"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full animate-pulse-slow"></div>

                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-white/20 rounded-full">
                                        <GraduationCap className="w-6 h-6 text-yellow-700" />
                                    </div>
                                    <div>
                                        <div className="text-yellow-900 font-semibold text-sm">
                                            GPIS-BD Learning Portal
                                        </div>
                                        <div className="text-yellow-900/70 text-xs">
                                            Secure Student Access
                                        </div>
                                    </div>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-yellow-900 mb-4">
                                    {isLogin
                                        ? 'Sign in to your account'
                                        : isRegister
                                            ? 'Create Your Account'
                                            : 'Welcome to GPIS-BD'}
                                </h1>
                                <p className="text-yellow-800 mb-8">
                                    {isLogin
                                        ? 'Access all your courses and learning materials securely.'
                                        : isRegister
                                            ? 'Start your IT career journey with us.'
                                            : 'Your secure pathway to knowledge and growth.'}
                                </p>

                                <div className="space-y-2 mb-8">
                                    {['Access all course materials', 'Track your progress', 'Connect with instructors', 'Get career support'].map((feature, i) => (
                                        <div key={i} className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-yellow-800 rounded-full"></div>
                                            <span className="text-yellow-900 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="text-center p-3 bg-white/10 rounded-lg">
                                        <div className="text-xl font-bold text-yellow-900">60K+</div>
                                        <div className="text-xs text-yellow-800">Students</div>
                                    </div>
                                    <div className="text-center p-3 bg-white/10 rounded-lg">
                                        <div className="text-xl font-bold text-yellow-900">98%</div>
                                        <div className="text-xs text-yellow-800">Success Rate</div>
                                    </div>
                                </div>

                                <div className="border-t border-yellow-200 pt-6 relative">
                                    <p className="text-yellow-800 text-sm mb-4">
                                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                                    </p>
                                    <Link
                                        to={isLogin ? '/register' : '/login'}
                                        className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-yellow-900 font-medium rounded-full hover:bg-yellow-500 transition-colors cursor-pointer"
                                    >
                                        <span>{isLogin ? 'Create Account' : 'Sign In'}</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 relative">
                            {/* Mobile Header */}
                            <div className="lg:hidden mb-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-yellow-50 rounded-lg">
                                        <GraduationCap className="w-6 h-6 text-yellow-700" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {isLogin ? 'Welcome Back' : isRegister ? 'Join BITM' : 'Information'}
                                        </h1>
                                        <p className="text-gray-600 text-sm">
                                            {isLogin
                                                ? 'Sign in to continue your learning journey'
                                                : isRegister
                                                    ? 'Create your account to get started'
                                                    : 'Important information regarding your account'}
                                        </p>
                                    </div>
                                </div>

                                {!isInfo && (
                                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                        <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
                                        <Link
                                            to={isLogin ? '/register' : '/login'}
                                            className="text-yellow-700 font-medium hover:underline"
                                        >
                                            {isLogin ? 'Sign up' : 'Sign in'}
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Form */}
                            <div className="max-w-md mx-auto">{children}</div>

                            {/* Mobile Features */}
                            <div className="lg:hidden mt-10 pt-8 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-4">
                                    {features.slice(0, 2).map((feature, index) => {
                                        const Icon = feature.icon
                                        return (
                                            <div key={index} className="flex items-center space-x-2">
                                                <div className="p-1.5 bg-yellow-50 rounded">
                                                    <Icon className="w-4 h-4 text-yellow-700" />
                                                </div>
                                                <span className="text-sm text-gray-600">{feature.text}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
