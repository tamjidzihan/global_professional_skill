import { 
    Activity, 
    ShieldCheck, 
    Tag, 
    Briefcase, 
    Layers, 
    Users,
    CheckCircle2
} from 'lucide-react'
import type { JSX } from 'react'

interface PlatformHealthCardProps {
    totalCategories?: number
    activeJobs?: number
    activePromoCodes?: number
    totalAdmins?: number
}

export function PlatformHealthCard({
    totalCategories = 0,
    activeJobs = 0,
    activePromoCodes = 0,
    totalAdmins = 1,
}: PlatformHealthCardProps): JSX.Element {
    const items = [
        {
            label: 'Course Categories',
            value: totalCategories,
            icon: Layers,
            color: 'text-cyan-600 bg-cyan-50',
        },
        {
            label: 'Active Job Openings',
            value: activeJobs,
            icon: Briefcase,
            color: 'text-fuchsia-600 bg-fuchsia-50',
        },
        {
            label: 'Active Promo Codes',
            value: activePromoCodes,
            icon: Tag,
            color: 'text-amber-600 bg-amber-50',
        },
        {
            label: 'Admin Staff Accounts',
            value: totalAdmins,
            icon: Users,
            color: 'text-violet-600 bg-violet-50',
        },
    ]

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-900">Platform Overview</h3>
                        <p className="text-[10px] text-gray-400">System status & active assets</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Operational
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                {items.map((item) => {
                    const Icon = item.icon
                    return (
                        <div
                            key={item.label}
                            className="p-2.5 rounded-lg bg-gray-50 border border-gray-100/80 flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${item.color}`}>
                                    <Icon className="w-3 h-3" />
                                </div>
                                <span className="text-xs font-bold text-gray-900">{item.value}</span>
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 truncate">{item.label}</span>
                        </div>
                    )
                })}
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span className="inline-flex items-center gap-1 text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
                    Security & RBAC Active
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Healthy
                </span>
            </div>
        </div>
    )
}
