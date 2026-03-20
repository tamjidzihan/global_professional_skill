import { useEffect } from 'react'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { BookOpen, Users, Star, DollarSign, PlusCircle, TrendingUp, FileText } from 'lucide-react'
import { useAnalytics } from '../../../hooks/useAnalytics'
import CalendarCard from '../../components/dashboard/CalendarCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Link } from 'react-router-dom'
import PageTitle from '../../components/PageTitle'

export function InstructorDashboard() {
    const { data, getInstructorAnalytics, loading } = useAnalytics()

    useEffect(() => {
        getInstructorAnalytics()
    }, [getInstructorAnalytics])

    if (loading) {
        return <LoadingSpinner />
    }

    const quickActions = [
        {
            to: '/dashboard/instructor/create-course',
            icon: PlusCircle,
            label: 'Create New Course',
            sub: 'Organize your knowledge',
            iconBg: 'bg-violet-50',
            iconText: 'text-violet-600',
            primary: true,
        },
        {
            to: '/dashboard/instructor/my-courses',
            icon: BookOpen,
            label: 'View All Courses',
            sub: 'Track performance',
            iconBg: 'bg-amber-50',
            iconText: 'text-amber-600',
        },
        {
            to: '#',
            icon: TrendingUp,
            label: 'View Analytics',
            sub: 'Insights at a glance',
            iconBg: 'bg-blue-50',
            iconText: 'text-blue-600',
        },
        {
            to: '#',
            icon: FileText,
            label: 'Make Announcement',
            sub: 'Notify your students',
            iconBg: 'bg-emerald-50',
            iconText: 'text-emerald-600',
        },
    ]

    return (
        <div className="py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <PageTitle title="Instructor Dashboard" />

            <div className="lg:col-span-3 space-y-6">

                {/* ── Page header ── */}
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                        Instructor Dashboard
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Manage your courses and view performance.
                    </p>
                </div>

                {/* ── Stats Grid ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

                {/* ── Quick Actions ── */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
                    {/* Card header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Frequently used tasks and shortcuts</p>
                        </div>
                        <span className="px-2.5 py-1 text-[11px] font-semibold bg-violet-50 text-violet-600 rounded-md">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                    </div>

                    {/* Actions grid */}
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {quickActions.map((action) => (
                            <Link key={action.label} to={action.to}>
                                <div className={`
                                    group flex items-center gap-3 p-4 rounded-xl border transition-all duration-150 cursor-pointer
                                    ${action.primary
                                        ? 'bg-violet-600 border-violet-600 hover:bg-violet-700 hover:border-violet-700'
                                        : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                    }
                                `}>
                                    <div className={`
                                        w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                                        group-hover:scale-110 transition-transform duration-150
                                        ${action.primary ? 'bg-white/20' : action.iconBg}
                                    `}>
                                        <action.icon className={`w-4.5 h-4.5 ${action.primary ? 'text-white' : action.iconText}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold leading-tight ${action.primary ? 'text-white' : 'text-gray-800'}`}>
                                            {action.label}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${action.primary ? 'text-violet-200' : 'text-gray-400'}`}>
                                            {action.sub}
                                        </p>
                                    </div>
                                    <span className={`text-sm shrink-0 group-hover:translate-x-0.5 transition-transform duration-150 ${action.primary ? 'text-violet-200' : 'text-gray-300'}`}>
                                        →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Footer hint */}
                    <div className="px-5 py-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span className="text-xs text-gray-400">
                                You have <span className="font-semibold text-gray-600">{data?.total_courses || 0}</span> active courses
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── Calendar ── */}
            <div className="lg:col-span-1">
                <CalendarCard />
            </div>
        </div>
    )
}