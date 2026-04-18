import { BookOpen, CheckCircle, TrendingUp, PlaySquare, Clock } from 'lucide-react';

export type FilterStatus = 'ALL' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';

export const statusConfig: Record<string, { badge: string; iconColor: string; icon: typeof BookOpen }> = {
    COMPLETED: { badge: 'bg-emerald-50 text-emerald-700', iconColor: 'text-emerald-600', icon: CheckCircle },
    IN_PROGRESS: { badge: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-600', icon: TrendingUp },
    NOT_STARTED: { badge: 'bg-gray-100 text-gray-500', iconColor: 'text-gray-400', icon: PlaySquare },
    PENDING: { badge: 'bg-yellow-50 text-yellow-700', iconColor: 'text-yellow-600', icon: Clock },
};

export function getProgressStatus(percentage: number): FilterStatus {
    if (percentage === 100) return 'COMPLETED';
    if (percentage > 0) return 'IN_PROGRESS';
    return 'NOT_STARTED';
}
