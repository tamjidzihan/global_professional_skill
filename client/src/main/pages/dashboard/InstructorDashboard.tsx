import { useEffect } from 'react'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { BookOpen, Users, Star, DollarSign, PlusCircle, TrendingUp, FileText } from 'lucide-react'
import { useAnalytics } from '../../../hooks/useAnalytics'
import CalendarCard from '../../components/dashboard/CalendarCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Link } from 'react-router-dom'

export function InstructorDashboard() {
    const { data, getInstructorAnalytics, loading } = useAnalytics()

    useEffect(() => {
        getInstructorAnalytics()
    }, [getInstructorAnalytics])

    if (loading) {
        return <LoadingSpinner />
    }

    return (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Instructor Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage your courses and view performance.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
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
                        color="red"
                    />
                </div>

                {/* Quick Actions - Enhanced Design */}
                <div className="bg-linear-to-br from-white to-blue-50/30 p-6 rounded-xl border border-blue-100/50 shadow-sm hover:shadow-md transition-all duration-300 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Frequently used tasks and shortcuts</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link to="/dashboard/instructor/create-course">
                            <button className="group w-full flex items-center gap-3 p-4 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer">
                                <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                    <PlusCircle className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold">Create New Course</div>
                                    <div className="text-xs text-blue-100 mt-0.5">Organize your knowledge</div>
                                </div>
                                <span className="text-blue-200 group-hover:translate-x-1 transition-transform duration-200">→</span>
                            </button>
                        </Link>

                        <Link to="/dashboard/instructor/my-courses">
                            <button className="group w-full flex items-center gap-3 p-4 bg-white border-2 border-gray-100 text-gray-700 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer">
                                <div className="p-2 bg-yellow-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                    <BookOpen className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold">View All Course</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Track performance</div>
                                </div>
                                <span className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200">→</span>
                            </button>
                        </Link>

                        <Link to="#">
                            <button className="group w-full flex items-center gap-3 p-4 bg-white border-2 border-gray-100 text-gray-700 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer">
                                <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold">View Analytics</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Track performance</div>
                                </div>
                                <span className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200">→</span>
                            </button>
                        </Link>

                        <Link to="#">
                            <button className="group w-full flex items-center gap-3 p-4 bg-white border-2 border-gray-100 text-gray-700 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer">
                                <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                    <FileText className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold">Make Announcement</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Notify your students</div>
                                </div>
                                <span className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200">→</span>
                            </button>
                        </Link>
                    </div>

                    {/* Quick Tips */}
                    <div className="mt-3 pt-3 border-t border-blue-100/50">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>You have {data?.total_courses || 0} active courses</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1">
                <CalendarCard />
            </div>
        </div>
    )
}