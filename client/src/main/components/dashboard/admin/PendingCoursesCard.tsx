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
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                    Pending Courses
                </h2>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {courses.length || 0}
                </span>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-lg"></div>
                    ))}
                </div>
            ) : courses.length > 0 ? (
                <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                    <Link to={`/dashboard/admin/courses/${course.id}`} className="font-medium text-gray-900 truncate cursor-pointer">
                                        {course.title}
                                    </Link>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Submitted by {course.instructor_name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => onViewDetails(course.id)}
                                    className="ml-3 text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors cursor-pointer"
                                >
                                    Review →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                        No pending courses to review.
                    </p>
                </div>
            )}
        </div>
    )
}