import { type LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    color?: 'blue' | 'green' | 'orange' | 'red'
    change?: string
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    color = 'blue',
    change,
}: StatsCardProps) {
    const colors = {
        blue: {
            iconBg: 'bg-blue-50',
            iconText: 'text-blue-600',
            badge: 'bg-blue-50 text-blue-600',
            accent: 'bg-blue-600',
        },
        green: {
            iconBg: 'bg-emerald-50',
            iconText: 'text-emerald-600',
            badge: 'bg-emerald-50 text-emerald-600',
            accent: 'bg-emerald-500',
        },
        orange: {
            iconBg: 'bg-orange-50',
            iconText: 'text-orange-600',
            badge: 'bg-orange-50 text-orange-600',
            accent: 'bg-orange-500',
        },
        red: {
            iconBg: 'bg-rose-50',
            iconText: 'text-rose-600',
            badge: 'bg-rose-50 text-rose-600',
            accent: 'bg-rose-500',
        },
    }

    const c = colors[color]

    return (
        <div className="group relative bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden">
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.75 ${c.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2 select-none">
                        {title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 leading-none tracking-tight">
                        {value}
                    </h3>
                    {change && (
                        <p className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${c.badge}`}>
                            {change}
                        </p>
                    )}
                </div>

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-4.5 h-4.5 ${c.iconText}`} />
                </div>
            </div>
        </div>
    )
}