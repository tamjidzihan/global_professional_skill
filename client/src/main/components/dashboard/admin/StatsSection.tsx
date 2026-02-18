import {
    Users,
    BookOpen,
    GraduationCap,
    AlertCircle
} from 'lucide-react'
import type { JSX } from 'react'
import { StatsCard } from '../StatsCard'

interface StatsSectionProps {
    data: {
        total_users?: number
        total_courses?: number
        total_enrollments?: number
        pending_courses?: number
        pending_instructor_requests?: number
    }
}

export function StatsSection({ data }: StatsSectionProps): JSX.Element {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
                title="Total Users"
                value={data?.total_users || 0}
                icon={Users}
                color="blue"
            />
            <StatsCard
                title="Total Courses"
                value={data?.total_courses || 0}
                icon={BookOpen}
                color="green"
            />
            <StatsCard
                title="Enrollments"
                value={data?.total_enrollments || 0}
                icon={GraduationCap}
                color="blue"
            />
            <StatsCard
                title="Pending Approvals"
                value={
                    (data?.pending_courses || 0) +
                    (data?.pending_instructor_requests || 0)
                }
                icon={AlertCircle}
                color="red"
            />
        </div>
    )
}