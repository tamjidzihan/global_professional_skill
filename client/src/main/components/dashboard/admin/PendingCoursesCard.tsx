/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookOpen, ChevronRight, User, Sparkles, CheckCircle2 } from 'lucide-react'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'

interface PendingCoursesCardProps {
    courses: any[]
    loading: boolean
    onViewDetails: (courseId: string) => void
}

export function PendingCoursesCard({ courses, loading, onViewDetails }: PendingCoursesCardProps): JSX.Element {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Pending Courses</h2>
                        <p className="text-[11px] text-gray-400">Instructor submissions awaiting approval</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                        {courses.length || 0} in queue
                    </span>
                    <Link
                        to="/dashboard/admin/courses"
                        className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-0.5 transition-colors"
                    >
                        All
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-4">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="animate-pulse h-16 bg-gray-50 rounded-xl border border-gray-100" />
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="group flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-white transition-all duration-150 shadow-2xs"
                            >
                                {/* Thumbnail / Icon */}
                                <div className="w-10 h-10 rounded-lg bg-violet-100/60 overflow-hidden flex items-center justify-center shrink-0 border border-violet-100">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <BookOpen className="w-5 h-5 text-violet-600" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/dashboard/admin/courses/${course.id}`}
                                            className="text-xs font-bold text-gray-900 truncate block hover:text-violet-600 transition-colors"
                                            title={course.title}
                                        >
                                            {course.title}
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                                            <User className="w-2.5 h-2.5 text-gray-400" />
                                            {course.instructor_name || 'Instructor'}
                                        </span>
                                        <span className="text-gray-300 text-[10px]">•</span>
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                            {course.is_free ? 'Free' : `৳${parseFloat(String(course.price || 0)).toLocaleString()}`}
                                        </span>
                                    </div>
                                </div>

                                {/* Action */}
                                <button
                                    onClick={() => onViewDetails(course.id)}
                                    className="shrink-0 px-2.5 py-1.5 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-600 hover:text-white border border-violet-200 rounded-lg transition-all duration-150 cursor-pointer shadow-2xs"
                                >
                                    Review
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-xs font-bold text-gray-800">All courses reviewed!</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">No pending course submissions in the queue.</p>
                        <Link
                            to="/dashboard/admin/courses"
                            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors"
                        >
                            <Sparkles className="w-3 h-3" />
                            Browse Course Catalog
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}