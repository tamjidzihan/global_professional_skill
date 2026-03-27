import { BookOpen, Clock, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { type JSX, useEffect } from 'react';
import { useAnalytics } from '../../../../hooks/useAnalytics';

const statusConfig = [
    { key: 'PENDING', label: 'Pending', icon: Clock, iconBg: 'bg-amber-50', iconText: 'text-amber-500', bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700' },
    { key: 'PUBLISHED', label: 'Published', icon: Eye, iconBg: 'bg-blue-50', iconText: 'text-blue-500', bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
    { key: 'APPROVED', label: 'Approved', icon: CheckCircle, iconBg: 'bg-emerald-50', iconText: 'text-emerald-500', bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
    { key: 'REJECTED', label: 'Rejected', icon: XCircle, iconBg: 'bg-rose-50', iconText: 'text-rose-500', bar: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700' },
    { key: 'DRAFT', label: 'Draft', icon: FileText, iconBg: 'bg-gray-50', iconText: 'text-gray-400', bar: 'bg-gray-300', badge: 'bg-gray-50 text-gray-600' },
];

export function CourseStatusPanel(): JSX.Element {
    const { data: analyticsData, getAdminAnalytics, loading } = useAnalytics();

    useEffect(() => {
        getAdminAnalytics();
    }, [getAdminAnalytics]);

    const total = analyticsData?.total_courses || 0;

    const rows = statusConfig.map(cfg => ({
        ...cfg,
        value: analyticsData?.course_status_distribution?.[cfg.key] || 0,
    })).filter(r => r.value > 0 || !total);

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                    <p className="text-sm font-semibold text-gray-900">Course Status</p>
                    <p className="text-xs text-gray-400 mt-0.5">Distribution overview</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-violet-600" />
                </div>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="space-y-2.5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse h-13 bg-gray-50 rounded-lg border border-gray-100" />
                        ))}
                    </div>
                ) : total === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                            <BookOpen className="w-5 h-5 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">No courses yet</p>
                        <p className="text-xs text-gray-400 mt-0.5">Course data will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {rows.map(({ key, label, icon: Icon, iconBg, iconText, bar, badge, value }) => {
                            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                            return (
                                <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-gray-200 hover:bg-white transition-all duration-150">
                                    {/* Icon */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                                        <Icon className={`w-4 h-4 ${iconText}`} />
                                    </div>

                                    {/* Label + bar */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-semibold text-gray-700">{label}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badge}`}>
                                                {value}
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${bar} transition-all duration-500`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Percentage */}
                                    <span className="text-[11px] font-bold text-gray-400 shrink-0 w-9 text-right">
                                        {pct}%
                                    </span>
                                </div>
                            );
                        })}

                        {/* Total */}
                        <div className="flex items-center justify-between px-3 pt-3 mt-1 border-t border-gray-100">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Total Courses</span>
                            <span className="text-sm font-bold text-gray-900">{total}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}