import { useEffect } from 'react'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { Users, BookOpen, GraduationCap, AlertCircle } from 'lucide-react'
import { useAnalytics } from '../../../hooks/useAnalytics'

export function AdminDashboard() {
    const { data, getAdminAnalytics, loading } = useAnalytics()

    useEffect(() => {
        getAdminAnalytics()
    }, [getAdminAnalytics])

    if (loading) {
        return <div className="p-4">Loading admin dashboard...</div>
    }

    return (
        <div className="p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
                <p className="text-gray-600 mt-1">
                    System-wide statistics and management.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Users"
                    value={data?.total_users || 0}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    title="Total Courses"
                    value={data?.total_courses || 0}
                    icon={BookOpen}
                    color="green"
                />
                <StatsCard
                    title="Enrollments"
                    value={data?.total_enrollments || 0}
                    icon={GraduationCap}
                    color="orange"
                />
                <StatsCard
                    title="Pending Approvals"
                    value={
                        (data?.pending_courses || 0) +
                        (data?.pending_instructor_requests || 0)
                    }
                    icon={AlertCircle}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Courses */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Pending Courses
                    </h2>
                    {data?.pending_courses > 0 ? (
                        <div className="space-y-4">
                            {/* Placeholder list */}
                            <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Advanced React Patterns
                                    </p>
                                    <p className="text-sm text-gray-500">Submitted by John Doe</p>
                                </div>
                                <button className="text-sm text-[#0066CC] font-medium hover:underline">
                                    Review
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            No pending courses to review.
                        </p>
                    )}
                </div>

                {/* Pending Instructors */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Instructor Requests
                    </h2>
                    {data?.pending_instructor_requests > 0 ? (
                        <div className="space-y-4">
                            {/* Placeholder list */}
                            <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">Jane Smith</p>
                                    <p className="text-sm text-gray-500">
                                        Web Development Expert
                                    </p>
                                </div>
                                <button className="text-sm text-[#0066CC] font-medium hover:underline">
                                    Review
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            No pending instructor requests.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}