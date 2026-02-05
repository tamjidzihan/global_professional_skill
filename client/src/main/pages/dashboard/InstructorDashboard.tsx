import { useEffect } from 'react'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { BookOpen, Users, DollarSign, Star } from 'lucide-react'
import { useAnalytics } from '../../../hooks/useAnalytics'

export function InstructorDashboard() {
    const { data, getInstructorAnalytics, loading } = useAnalytics()

    useEffect(() => {
        getInstructorAnalytics()
    }, [getInstructorAnalytics])

    if (loading) {
        return <div className="p-4">Loading dashboard...</div>
    }

    return (
        <div className="p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Instructor Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                    Manage your courses and view performance.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Courses"
                    value={data?.total_courses || 0}
                    icon={BookOpen}
                    color="blue"
                />
                <StatsCard
                    title="Total Students"
                    value={data?.total_enrollments || 0}
                    icon={Users}
                    color="green"
                />
                <StatsCard
                    title="Avg. Rating"
                    value={data?.average_rating || '0.0'}
                    icon={Star}
                    color="orange"
                />
                <StatsCard
                    title="Total Reviews"
                    value={data?.total_reviews || 0}
                    icon={DollarSign}
                    color="blue"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <button className="px-4 py-2 bg-[#0066CC] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Create New Course
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        View Analytics
                    </button>
                </div>
            </div>
        </div>
    )
}