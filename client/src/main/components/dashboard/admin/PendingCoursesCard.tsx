/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookOpen } from 'lucide-react'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'

interface PendingCoursesCardProps {
    courses: any[]
    loading: boolean
    onViewDetails: (courseId: string) => void
}

export function PendingCoursesCard({ courses, loading, onViewDetails }: PendingCoursesCardProps): JSX.Element {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                    <h2 className="text-sm font-semibold text-gray-900">Pending Courses</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Awaiting your review</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-600 rounded-md">
                    {courses.length || 0}
                </span>
            </div>

            {/* Body */}
            <div className="p-4">
                {loading ? (
                    <div className="space-y-2.5">
                        {[1, 2].map((i) => (
                            <div key={i} className="animate-pulse h-15 bg-gray-50 rounded-lg border border-gray-100" />
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="space-y-2 max-h-65 overflow-y-auto pr-0.5">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-white transition-all duration-150"
                            >
                                {/* Icon */}
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-4 h-4 text-amber-600" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        to={`/dashboard/admin/courses/${course.id}`}
                                        className="text-sm font-semibold text-gray-800 truncate block hover:text-violet-600 transition-colors"
                                    >
                                        {course.title}
                                    </Link>
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                                        by {course.instructor_name}
                                    </p>
                                </div>

                                {/* Action */}
                                <button
                                    onClick={() => onViewDetails(course.id)}
                                    className="shrink-0 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                >
                                    Review →
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                            <BookOpen className="w-5 h-5 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">All caught up</p>
                        <p className="text-xs text-gray-400 mt-0.5">No pending courses to review</p>
                    </div>
                )}
            </div>
        </div>
    )
}