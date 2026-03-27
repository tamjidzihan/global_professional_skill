import {
    BarChart2,
    TrendingUp,
    PieChart,
    FileText,
    Users,
    BookOpen,
    Bell,
    Lock,
    ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PageTitle from '../../../components/PageTitle'

export function ReportsPage() {
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm'
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100'
    const cardBody = 'p-5'

    const upcomingFeatures = [
        { icon: TrendingUp, label: 'Enrollment Trends', sub: 'Track growth over time', iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
        { icon: PieChart, label: 'Revenue Breakdown', sub: 'Income by course & category', iconBg: 'bg-violet-50', iconText: 'text-violet-600' },
        { icon: Users, label: 'Student Analytics', sub: 'Engagement & completion rates', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
        { icon: BookOpen, label: 'Course Performance', sub: 'Ratings, reviews & completions', iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
        { icon: FileText, label: 'Exportable Reports', sub: 'CSV & PDF downloads', iconBg: 'bg-rose-50', iconText: 'text-rose-600' },
        { icon: BarChart2, label: 'Custom Dashboards', sub: 'Build your own views', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600' },
    ]

    const quickLinks = [
        { icon: BookOpen, label: 'My Courses', sub: 'View and manage your courses', to: '/dashboard/instructor/my-courses', iconBg: 'bg-violet-50', iconText: 'text-violet-600' },
    ]

    return (
        <div className="py-6 px-4 md:px-6">
            <PageTitle title="Reports" />

            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Reports</h1>
                <p className="text-sm text-gray-400 mt-0.5">Platform analytics and performance insights</p>
            </div>

            {/* Main card */}
            <div className={`${card} overflow-hidden`}>

                {/* Decorative header */}
                <div className="relative h-36 bg-gray-50 border-b border-gray-100 overflow-hidden">
                    {/* Grid */}
                    <div
                        className="absolute inset-0 opacity-50"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                            `,
                            backgroundSize: '28px 28px',
                        }}
                    />

                    {/* Faint bar chart silhouette */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-2.5 opacity-10 select-none pointer-events-none pb-0">
                        {[40, 65, 50, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
                            <div
                                key={i}
                                className="w-7 bg-violet-600 rounded-t-md"
                                style={{ height: `${h}px` }}
                            />
                        ))}
                    </div>

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center justify-center">
                            <BarChart2 className="w-7 h-7 text-violet-500" />
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
                        Analytics & Reports are in development
                    </h2>
                    <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-10">
                        We're building a powerful reporting suite so you can monitor platform health,
                        track student progress, and make data-driven decisions — all in one place.
                    </p>

                    {/* Upcoming features grid */}
                    <div className="w-full max-w-xl mb-10">
                        <div className={card}>
                            <div className={cardHeader}>
                                <p className="text-xs font-semibold text-gray-600">What's coming</p>
                                <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                                    {upcomingFeatures.length} Features
                                </span>
                            </div>
                            <div className={`${cardBody} grid grid-cols-1 sm:grid-cols-2 gap-2`}>
                                {upcomingFeatures.map(({ icon: Icon, label, sub, iconBg, iconText }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                                            <Icon className={`w-4 h-4 ${iconText}`} />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-sm font-semibold text-gray-700 leading-tight">{label}</p>
                                            <p className="text-xs text-gray-400 truncate">{sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full max-w-xl border-t border-gray-100 mb-8" />

                    {/* Quick links */}
                    <div className="w-full max-w-xl">
                        <div className={card}>
                            <div className={cardHeader}>
                                <p className="text-xs font-semibold text-gray-600">In the meantime</p>
                                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">Explore</span>
                            </div>
                            <div className={`${cardBody} space-y-2`}>
                                {quickLinks.map(({ icon: Icon, label, sub, to, iconBg, iconText }) => (
                                    <Link
                                        key={label}
                                        to={to}
                                        className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all duration-150"
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                                            <Icon className={`w-4 h-4 ${iconText}`} />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-sm font-semibold text-gray-800">{label}</p>
                                            <p className="text-xs text-gray-400">{sub}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notify hint */}
                    <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                        <Bell className="w-3.5 h-3.5" />
                        <span>You'll be notified when Reports launches</span>
                    </div>
                </div>
            </div>
        </div>
    )
}