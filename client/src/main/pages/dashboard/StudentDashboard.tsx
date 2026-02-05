import { useEffect } from 'react'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { BookOpen, CheckCircle, Clock, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../../context/AuthContext'
import { useEnrollments } from '../../../hooks/useEnrollments'
import CalendarCard from '../../components/dashboard/CalendarCard' // Import CalendarCard

export function StudentDashboard() {
    const { user } = useAuthContext()
    const { enrollments, getMyEnrollments, loading } = useEnrollments()

    useEffect(() => {
        getMyEnrollments()
    }, [getMyEnrollments])

    // Safely calculate stats
    const totalEnrolled = enrollments?.length || 0
    const completed = enrollments?.filter(
        (e) => e?.progress_percentage === 100,
    ).length || 0
    const inProgress = totalEnrolled - completed

    return (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-6"> {/* Added grid layout */}
            <div className="lg:col-span-3"> {/* Main content takes 2/3 width on large screens */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.first_name || 'Student'}!
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Here's an overview of your learning progress.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Enrolled Courses"
                        value={totalEnrolled}
                        icon={BookOpen}
                        color="blue"
                    />
                    <StatsCard
                        title="In Progress"
                        value={inProgress}
                        icon={Clock}
                        color="orange"
                    />
                    <StatsCard
                        title="Completed"
                        value={completed}
                        icon={CheckCircle}
                        color="green"
                    />
                    <StatsCard
                        title="Certificates"
                        value={completed} // Assuming 1 cert per completed course
                        icon={Award}
                        color="blue"
                    />
                </div>

                {/* Recent Enrollments */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent Courses</h2>
                        <Link
                            to="/courses"
                            className="text-sm text-[#0066CC] hover:underline"
                        >
                            Browse All Courses
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                            <p className="text-gray-500">Loading your courses...</p>
                        </div>
                    ) : enrollments && enrollments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.slice(0, 3).map((enrollment) => (
                                <div
                                    key={enrollment?.id}
                                    className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="h-32 bg-gray-200 relative">
                                        {/* Placeholder for course image */}
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <BookOpen className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
                                            {enrollment?.course?.title || 'Course Title'}
                                        </h3>
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                            <span>Progress</span>
                                            <span>{Math.round(enrollment?.progress_percentage || 0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                            <div
                                                className="bg-[#76C043] h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${enrollment?.progress_percentage || 0}%`,
                                                }}
                                            />
                                        </div>
                                        <button className="w-full py-2 bg-[#0066CC] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                            Continue Learning
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">
                                No courses yet
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Start your learning journey today!
                            </p>
                            <Link
                                to="/courses"
                                className="inline-block px-6 py-2 bg-[#76C043] text-white rounded-full font-medium hover:bg-[#65a838] transition-colors"
                            >
                                Browse Courses
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <div className="lg:col-span-1"> {/* Calendar takes 1/3 width on large screens */}
                <CalendarCard />
            </div>
        </div>
    )
}