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
            bg: 'from-blue-500/10 to-indigo-500/10',
            text: 'text-blue-600',
            icon: 'bg-blue-500/15 text-blue-600',
            ring: 'group-hover:ring-blue-400/30',
        },
        green: {
            bg: 'from-emerald-500/10 to-green-500/10',
            text: 'text-emerald-600',
            icon: 'bg-emerald-500/15 text-emerald-600',
            ring: 'group-hover:ring-emerald-400/30',
        },
        orange: {
            bg: 'from-orange-500/10 to-amber-500/10',
            text: 'text-orange-600',
            icon: 'bg-orange-500/15 text-orange-600',
            ring: 'group-hover:ring-orange-400/30',
        },
        red: {
            bg: 'from-rose-500/10 to-red-500/10',
            text: 'text-rose-600',
            icon: 'bg-rose-500/15 text-rose-600',
            ring: 'group-hover:ring-rose-400/30',
        },
    }

    return (
        <div
            className={`
                group relative overflow-hidden rounded-xl border border-gray-100 
                bg-linear-to-br ${colors[color].bg}
                p-6 shadow-sm transition-all duration-300 
                hover:shadow-lg
            `}
        >
            {/* Glow effect */}
            <div
                className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 transition 
                    ring-1 ${colors[color].ring} rounded-xl
                `}
            />

            <div className="relative flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                        {title}
                    </p>

                    <h3 className="text-3xl font-bold tracking-tight text-gray-900">
                        {value}
                    </h3>

                    {change && (
                        <p className={`mt-1 text-xs font-medium ${colors[color].text}`}>
                            {change}
                        </p>
                    )}
                </div>

                <div
                    className={`
                        p-4 rounded-xl backdrop-blur-sm
                        ${colors[color].icon}
                        transition-transform duration-300 
                        group-hover:scale-110
                    `}
                >
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    )
}
