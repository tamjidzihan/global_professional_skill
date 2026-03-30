import { Award, Bell, BookOpen, Star, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../../../components/SEO'

export function CertificatesPage() {
    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title="Certificates" noindex />

            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Certificates</h1>
                <p className="text-sm text-gray-400 mt-0.5">Your earned achievements and credentials</p>
            </div>

            {/* Coming soon card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Decorative header strip */}
                <div className="relative h-32 bg-gray-50 border-b border-gray-100 overflow-hidden">
                    {/* Subtle grid pattern */}
                    <div
                        className="absolute inset-0 opacity-40"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                            `,
                            backgroundSize: '32px 32px',
                        }}
                    />

                    {/* Floating certificate mockups */}
                    <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-20 select-none pointer-events-none">
                        {[
                            { rotate: '-6deg', scale: '0.85', left: '12%' },
                            { rotate: '0deg', scale: '1', left: '50%' },
                            { rotate: '5deg', scale: '0.85', left: '88%' },
                        ].map((style, i) => (
                            <div
                                key={i}
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-32 h-20 bg-white rounded-lg border-2 border-gray-300 shadow-md flex flex-col items-center justify-center gap-1"
                                style={{ left: style.left, transform: `translateX(-50%) translateY(-50%) rotate(${style.rotate}) scale(${style.scale})` }}
                            >
                                <div className="w-6 h-6 rounded-full bg-gray-200" />
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full" />
                                <div className="w-10 h-1.5 bg-gray-100 rounded-full" />
                            </div>
                        ))}
                    </div>

                    {/* Center lock icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center justify-center">
                            <Award className="w-7 h-7 text-violet-500" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-10 flex flex-col items-center text-center">

                    {/* Badge */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 text-violet-700 text-[11px] font-bold rounded-md uppercase tracking-widest mb-5">
                        <Lock className="w-3 h-3" /> Coming Soon
                    </span>

                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Certificates are on their way
                    </h2>
                    <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-8">
                        Complete courses to earn verifiable certificates. We're building a beautiful way to showcase your achievements — check back soon.
                    </p>

                    {/* Feature preview pills */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {[
                            { icon: Award, label: 'Verifiable Credentials' },
                            { icon: Star, label: 'Skill Badges' },
                            { icon: BookOpen, label: 'Course Completions' },
                        ].map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-500"
                            >
                                <Icon className="w-3.5 h-3.5 text-gray-400" />
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="w-full max-w-sm border-t border-gray-100 mb-8" />

                    {/* Progress hint */}
                    <div className="w-full max-w-sm">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <p className="text-xs font-semibold text-gray-600">In the meantime</p>
                                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">Explore</span>
                            </div>
                            <div className="p-3 space-y-2">
                                <Link
                                    to="/courses"
                                    className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all duration-150"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-semibold text-gray-800">Browse Courses</p>
                                        <p className="text-xs text-gray-400">Start learning to earn certificates</p>
                                    </div>
                                    <span className="text-gray-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all text-sm">→</span>
                                </Link>

                                <Link
                                    to="/dashboard/student/my-courses"
                                    className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all duration-150"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                        <Star className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-semibold text-gray-800">My Enrollments</p>
                                        <p className="text-xs text-gray-400">Track your progress</p>
                                    </div>
                                    <span className="text-gray-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all text-sm">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Notify me */}
                    <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                        <Bell className="w-3.5 h-3.5" />
                        <span>You'll be notified when certificates launch</span>
                    </div>
                </div>
            </div>
        </div>
    )
}