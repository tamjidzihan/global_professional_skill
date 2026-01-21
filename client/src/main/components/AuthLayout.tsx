import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, Shield, Award, Users, ChevronRight } from 'lucide-react'

interface AuthLayoutProps {
    children: React.ReactNode
    type: 'login' | 'register'
}

export function AuthLayout({ children, type }: AuthLayoutProps) {
    const isLogin = type === 'login'

    const features = [
        { icon: Shield, text: 'Secure & Private' },
        { icon: BookOpen, text: 'Access All Courses' },
        { icon: Award, text: 'Track Progress' },
        { icon: Users, text: 'Join Community' },
    ]



    return (
        <main className="grow relative">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Left Side - Features & Info */}
                        <div className="hidden lg:block">
                            <div className="bg-linear-to-br from-[#0052CC] to-blue-800 rounded-xl p-8 h-full">
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="p-2 bg-white/20 rounded">
                                        <GraduationCap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-medium">GPIS-BD Learning Portal</div>
                                        <div className="text-white/70 text-xs">Secure Student Access</div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h1 className="text-2xl font-bold text-white mb-4">
                                        Welcome to GPIS-BD<br />Learning Platform
                                    </h1>
                                    <p className="text-blue-100">
                                        {isLogin
                                            ? 'Sign in to access your courses and learning materials.'
                                            : 'Create an account to start your IT career journey.'
                                        }
                                    </p>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {[
                                        'Access all course materials',
                                        'Track your learning progress',
                                        'Connect with instructors',
                                        'Get career support'
                                    ].map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                            <span className="text-blue-100 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="text-center p-3 bg-white/10 rounded-lg">
                                        <div className="text-xl font-bold text-white">60K+</div>
                                        <div className="text-xs text-blue-100">Students</div>
                                    </div>
                                    <div className="text-center p-3 bg-white/10 rounded-lg">
                                        <div className="text-xl font-bold text-white">98%</div>
                                        <div className="text-xs text-blue-100">Success Rate</div>
                                    </div>
                                </div>

                                <div className="border-t border-white/20 pt-6">
                                    <p className="text-blue-100 text-sm mb-4">
                                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                                    </p>
                                    <Link
                                        to={isLogin ? '/register' : '/login'}
                                        className="inline-flex items-center space-x-2 px-4 py-2 border border-white text-white hover:bg-white hover:text-[#0066CC] rounded transition-colors"
                                    >
                                        <span>{isLogin ? 'Create Account' : 'Sign In'}</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form Section */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
                            {/* Mobile Header */}
                            <div className="lg:hidden mb-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <GraduationCap className="w-6 h-6 text-[#0066CC]" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {isLogin ? 'Welcome Back' : 'Join BITM'}
                                        </h1>
                                        <p className="text-gray-600 text-sm">
                                            {isLogin
                                                ? 'Sign in to continue your learning journey'
                                                : 'Create your account to get started'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Mobile Switch */}
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                    <span>
                                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                                    </span>
                                    <Link
                                        to={isLogin ? '/register' : '/login'}
                                        className="text-[#0066CC] font-medium hover:underline"
                                    >
                                        {isLogin ? 'Sign up' : 'Sign in'}
                                    </Link>
                                </div>
                            </div>

                            {/* Form Container */}
                            <div className="max-w-md mx-auto">
                                {children}
                            </div>

                            {/* Additional Info - Mobile */}
                            <div className="lg:hidden mt-10 pt-8 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-4">
                                    {features.slice(0, 2).map((feature, index) => {
                                        const Icon = feature.icon
                                        return (
                                            <div key={index} className="flex items-center space-x-2">
                                                <div className="p-1.5 bg-blue-50 rounded">
                                                    <Icon className="w-4 h-4 text-[#0066CC]" />
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