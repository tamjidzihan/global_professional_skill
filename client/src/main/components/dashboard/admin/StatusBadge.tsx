// components/StatusBadge.tsx
const appStatusConfig: Record<string, { badge: string; iconBg: string; iconText: string }> = {
    PENDING: { badge: 'bg-amber-50 text-amber-700', iconBg: 'bg-amber-50', iconText: 'text-amber-500' },
    REVIEWED: { badge: 'bg-blue-50 text-blue-700', iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
    ACCEPTED: { badge: 'bg-emerald-50 text-emerald-700', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    REJECTED: { badge: 'bg-rose-50 text-rose-700', iconBg: 'bg-rose-50', iconText: 'text-rose-500' },
};

interface StatusBadgeProps {
    status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const cfg = appStatusConfig[status] || appStatusConfig['PENDING'];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-md ${cfg.badge}`}>
            {status}
        </span>
    );
};

export default StatusBadge;