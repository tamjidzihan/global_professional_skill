import { statusConfig } from './statusUtils';

export function StatusBadge({ status }: { status: string }) {
    const key = status as keyof typeof statusConfig;
    const cfg = statusConfig[key] || statusConfig.NOT_STARTED;
    const Icon = cfg.icon;
    const label = key.replace('_', ' ');
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md ${cfg.badge}`}>
            <Icon className={`w-3 h-3 ${cfg.iconColor}`} />
            {label}
        </span>
    );
}
