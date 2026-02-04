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
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
    }
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {change && (
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                            <span>{change}</span>
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    )
}
