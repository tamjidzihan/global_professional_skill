import { 
    Users, 
    BookOpen, 
    CreditCard, 
    Tag, 
    Layers, 
    Briefcase, 
    Megaphone, 
    Settings, 
    ArrowUpRight,
    Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { JSX } from 'react'

interface AdminQuickActionsProps {
    pendingPaymentsCount?: number
    pendingCoursesCount?: number
    pendingRequestsCount?: number
}

export function AdminQuickActions({
    pendingPaymentsCount = 0,
    pendingCoursesCount = 0,
    pendingRequestsCount = 0,
}: AdminQuickActionsProps): JSX.Element {
    const actions = [
        {
            title: 'User Management',
            description: 'Manage accounts & instructor roles',
            icon: Users,
            to: '/dashboard/admin/users',
            color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-100 hover:border-blue-300',
            iconBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
            badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} new` : null,
            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
            title: 'Course Catalog',
            description: 'Review, publish & manage courses',
            icon: BookOpen,
            to: '/dashboard/admin/courses',
            color: 'from-violet-500/10 to-purple-500/10 text-violet-600 border-violet-100 hover:border-violet-300',
            iconBg: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white',
            badge: pendingCoursesCount > 0 ? `${pendingCoursesCount} review` : null,
            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
            title: 'Verify Payments',
            description: 'Approve bKash transactions',
            icon: CreditCard,
            to: '/dashboard/admin/payments',
            color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100 hover:border-emerald-300',
            iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
            badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount} pending` : null,
            badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        },
        {
            title: 'Promo Codes',
            description: 'Discounts & marketing campaigns',
            icon: Tag,
            to: '/dashboard/admin/promo-codes',
            color: 'from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-100 hover:border-amber-300',
            iconBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
            badge: null,
            badgeColor: '',
        },
        {
            title: 'Categories',
            description: 'Taxonomy & course topics',
            icon: Layers,
            to: '/dashboard/admin/categories',
            color: 'from-cyan-500/10 to-blue-500/10 text-cyan-600 border-cyan-100 hover:border-cyan-300',
            iconBg: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white',
            badge: null,
            badgeColor: '',
        },
        {
            title: 'Careers & Jobs',
            description: 'Post openings & track applicants',
            icon: Briefcase,
            to: '/dashboard/admin/careers',
            color: 'from-fuchsia-500/10 to-pink-500/10 text-fuchsia-600 border-fuchsia-100 hover:border-fuchsia-300',
            iconBg: 'bg-fuchsia-50 text-fuchsia-600 group-hover:bg-fuchsia-600 group-hover:text-white',
            badge: null,
            badgeColor: '',
        },
        {
            title: 'Announcements',
            description: 'Platform broadcast messages',
            icon: Megaphone,
            to: '/dashboard/admin/announcements',
            color: 'from-rose-500/10 to-orange-500/10 text-rose-600 border-rose-100 hover:border-rose-300',
            iconBg: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
            badge: null,
            badgeColor: '',
        },
        {
            title: 'Site Settings',
            description: 'Branding, video storage & configs',
            icon: Settings,
            to: '/dashboard/admin/settings',
            color: 'from-slate-500/10 to-gray-500/10 text-slate-600 border-slate-200 hover:border-slate-300',
            iconBg: 'bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white',
            badge: null,
            badgeColor: '',
        },
    ]

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                        <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Admin Command Center</h2>
                        <p className="text-xs text-gray-400">Quick access to core platform operations</p>
                    </div>
                </div>
                <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                    8 Modules
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {actions.map((action) => {
                    const Icon = action.icon
                    return (
                        <Link
                            key={action.title}
                            to={action.to}
                            className={`group relative flex flex-col justify-between p-3.5 rounded-xl border bg-gradient-to-br transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${action.color}`}
                        >
                            <div className="flex items-start justify-between mb-2.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${action.iconBg}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                {action.badge ? (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${action.badgeColor}`}>
                                        {action.badge}
                                    </span>
                                ) : (
                                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100" />
                                )}
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-900 group-hover:text-violet-700 transition-colors">
                                    {action.title}
                                </h3>
                                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                                    {action.description}
                                </p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
