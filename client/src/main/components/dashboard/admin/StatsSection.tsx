import {
    Users,
    BookOpen,
    GraduationCap,
    AlertCircle,
    DollarSign,
    ArrowUpRight,
} from 'lucide-react'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'

interface StatsSectionProps {
    data: {
        total_users?: number
        total_students?: number
        total_instructors?: number
        total_courses?: number
        published_courses?: number
        pending_courses?: number
        total_enrollments?: number
        total_revenue?: number
        pending_payments_amount?: number
        pending_instructor_requests?: number
        pending_payments?: number
    }
}

export function StatsSection({ data }: StatsSectionProps): JSX.Element {
    const totalPending =
        (data?.pending_courses || 0) +
        (data?.pending_instructor_requests || 0) +
        (data?.pending_payments || 0)

    const stats = [
        {
            title: 'Total Users',
            value: data?.total_users || 0,
            subtitle: `${data?.total_students || 0} Students • ${data?.total_instructors || 0} Instructors`,
            icon: Users,
            color: 'blue',
            to: '/dashboard/admin/users',
            gradient: 'from-blue-500/10 via-transparent to-transparent',
            iconBg: 'bg-blue-50 text-blue-600',
            borderHover: 'hover:border-blue-300',
            badge: 'Registered accounts',
        },
        {
            title: 'Course Catalog',
            value: data?.total_courses || 0,
            subtitle: `${data?.published_courses || 0} Published • ${data?.pending_courses || 0} In Review`,
            icon: BookOpen,
            color: 'violet',
            to: '/dashboard/admin/courses',
            gradient: 'from-violet-500/10 via-transparent to-transparent',
            iconBg: 'bg-violet-50 text-violet-600',
            borderHover: 'hover:border-violet-300',
            badge: 'Courses & modules',
        },
        {
            title: 'Total Enrollments',
            value: data?.total_enrollments || 0,
            subtitle: 'Platform learning journeys',
            icon: GraduationCap,
            color: 'indigo',
            to: '/dashboard/admin/courses',
            gradient: 'from-indigo-500/10 via-transparent to-transparent',
            iconBg: 'bg-indigo-50 text-indigo-600',
            borderHover: 'hover:border-indigo-300',
            badge: 'Active enrollments',
        },
        {
            title: 'Platform Revenue',
            value: `৳${(data?.total_revenue || 0).toLocaleString()}`,
            subtitle: data?.pending_payments ? `${data.pending_payments} pending verification` : 'All payments settled',
            icon: DollarSign,
            color: 'emerald',
            to: '/dashboard/admin/payments',
            gradient: 'from-emerald-500/10 via-transparent to-transparent',
            iconBg: 'bg-emerald-50 text-emerald-600',
            borderHover: 'hover:border-emerald-300',
            badge: 'Verified earnings',
        },
        {
            title: 'Action Center',
            value: totalPending,
            subtitle: totalPending > 0 ? `${totalPending} items need review` : 'All tasks completed',
            icon: AlertCircle,
            color: totalPending > 0 ? 'rose' : 'gray',
            to: totalPending > 0 ? (data?.pending_payments ? '/dashboard/admin/payments' : '/dashboard/admin/courses') : '/dashboard/admin',
            gradient: totalPending > 0 ? 'from-rose-500/10 via-transparent to-transparent' : 'from-gray-500/5 via-transparent to-transparent',
            iconBg: totalPending > 0 ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-500',
            borderHover: totalPending > 0 ? 'hover:border-rose-300' : 'hover:border-gray-300',
            badge: totalPending > 0 ? 'Attention required' : 'Clear backlog',
            isPulse: totalPending > 0,
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 py-3">
            {stats.map((card) => {
                const Icon = card.icon
                return (
                    <Link
                        key={card.title}
                        to={card.to}
                        className={`group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between ${card.borderHover}`}
                    >
                        {/* Subtle background glow */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

                        <div>
                            {/* Top row: Label & Icon */}
                            <div className="flex items-center justify-between mb-3 relative z-10">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    {card.title}
                                </span>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${card.iconBg}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Main Value */}
                            <div className="flex items-baseline gap-1.5 relative z-10">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {card.value}
                                </h3>
                                {card.isPulse && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Bottom Row: Subtitle & Quick arrow */}
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between relative z-10">
                            <p className="text-[11px] font-medium text-gray-500 truncate max-w-[130px]" title={card.subtitle}>
                                {card.subtitle}
                            </p>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-700 transition-colors shrink-0" />
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
