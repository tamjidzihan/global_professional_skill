/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import {
    BookOpen,
    Clock,
    CheckCircle,
    PlayCircle,
    Search,
    Filter,
    PlaySquare,
    Award,
    TrendingUp,
    Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEnrollments } from '../../../../hooks/useEnrollments';
import { usePayments } from '../../../../hooks/usePayments';
import SEO from '../../../components/SEO';

type FilterStatus = 'ALL' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';

const STATUS_TABS: FilterStatus[] = ['ALL', 'IN_PROGRESS', 'NOT_STARTED', 'COMPLETED', 'PENDING'];

const statusConfig: Record<string, { badge: string; iconColor: string; icon: typeof BookOpen }> = {
    COMPLETED: { badge: 'bg-emerald-50 text-emerald-700', iconColor: 'text-emerald-600', icon: CheckCircle },
    IN_PROGRESS: { badge: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-600', icon: TrendingUp },
    NOT_STARTED: { badge: 'bg-gray-100 text-gray-500', iconColor: 'text-gray-400', icon: PlaySquare },
    PENDING: { badge: 'bg-yellow-50 text-yellow-700', iconColor: 'text-yellow-600', icon: Clock },
};

function getProgressStatus(percentage: number): FilterStatus {
    if (percentage === 100) return 'COMPLETED';
    if (percentage > 0) return 'IN_PROGRESS';
    return 'NOT_STARTED';
}

function StatusBadge({ status }: { status: string }) {
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

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ percentage }: { percentage: number }) {
    const pct = Math.round(Number(percentage || 0));
    const barColor =
        pct === 100 ? 'bg-emerald-500' :
            pct > 0 ? 'bg-blue-500' :
                'bg-gray-300';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Progress</span>
                <span className={`text-xs font-bold ${pct === 100 ? 'text-emerald-600' : pct > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {pct}%
                </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                    className={`${barColor} h-full rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

// ── Enrollment Card ───────────────────────────────────────────────────────────
function EnrollmentCard({ enrollment }: { enrollment: any }) {
    const pct = Number(enrollment.progress_percentage || 0);
    const isCompleted = pct === 100;
    const isStarted = pct > 0;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden group">

            {/* Thumbnail */}
            <div className="h-40 bg-gray-50 relative overflow-hidden shrink-0">
                {enrollment.course.thumbnail ? (
                    <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-violet-50">
                        <BookOpen className="w-10 h-10 text-violet-200" />
                    </div>
                )}
                {/* Status badge overlay */}
                <div className="absolute top-3 left-3">
                    <StatusBadge status={getProgressStatus(pct)} />
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col gap-3">

                {/* Category */}
                <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-500">
                    {enrollment.course.category_name}
                </span>

                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-violet-600 transition-colors -mt-1">
                    {enrollment.course.title}
                </h3>

                {/* Duration & Classes */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                    {enrollment.course.duration_hours && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {enrollment.course.duration_hours}h
                        </div>
                    )}
                    {enrollment.course.total_classes && (
                        <div className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            {enrollment.course.total_classes} classes
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div className="mt-auto pt-2">
                    <ProgressBar percentage={pct} />
                </div>

                {/* CTA */}
                <Link
                    to={`/courses/${enrollment.course.id}`}
                    className={`mt-1 inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold rounded-lg transition-colors ${isCompleted
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                        : 'bg-violet-600 text-white hover:bg-violet-700'
                        }`}
                >
                    {isCompleted ? (
                        <><Award className="w-3.5 h-3.5" /> View Certificate</>
                    ) : (
                        <><PlayCircle className="w-3.5 h-3.5" /> {isStarted ? 'Continue Learning' : 'Start Learning'}</>
                    )}
                </Link>
            </div>
        </div>
    );
}

// ── Pending Payment Card ──────────────────────────────────────────────────────
function PendingPaymentCard({ payment }: { payment: any }) {
    return (
        <div className="bg-white rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group relative">
            {/* Thumbnail */}
            <div className="h-40 bg-gray-50 relative overflow-hidden shrink-0">
                {payment.course_thumbnail ? (
                    <img
                        src={payment.course_thumbnail}
                        alt={payment.course_title}
                        className="w-full h-full object-cover opacity-60 grayscale-[50%]"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-yellow-50">
                        <BookOpen className="w-10 h-10 text-yellow-200" />
                    </div>
                )}
                {/* Status badge overlay */}
                <div className="absolute top-3 left-3">
                    <StatusBadge status="PENDING" />
                </div>
                <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                    <Clock className="w-12 h-12 text-yellow-600 opacity-40 animate-pulse" />
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-yellow-600">
                    Payment Verification
                </span>

                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                    {payment.course_title}
                </h3>

                <div className="space-y-2 py-2 border-y border-gray-50 my-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Amount Paid:</span>
                        <span className="font-bold text-gray-700">{payment.currency} {payment.amount}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Method:</span>
                        <span className="text-gray-700">{payment.payment_method}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>TrxID:</span>
                        <span className="font-mono text-gray-700">{payment.transaction_id}</span>
                    </div>
                </div>

                <div className="p-2.5 bg-yellow-50/50 rounded-lg text-[10px] text-yellow-800 border border-yellow-100/50 leading-relaxed italic">
                    Our team is currently verifying your payment details. You will gain full access to the course content as soon as the verification is complete.
                </div>

                <button
                    disabled
                    className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                    <Clock className="w-3.5 h-3.5" /> Awaiting Approval
                </button>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
const MyEnrollmentsPage = () => {
    const { enrollments, getMyEnrollments, loading: enrollmentsLoading } = useEnrollments();
    const { payments, fetchPayments, loading: paymentsLoading } = usePayments();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

    useEffect(() => {
        getMyEnrollments();
        fetchPayments({ status: 'PENDING' });
    }, [getMyEnrollments, fetchPayments]);

    const loading = enrollmentsLoading || paymentsLoading;

    // Merge enrollments and pending payments for filtering
    const filteredEnrollments = (enrollments ?? []).filter((e: any) => {
        const pct = Number(e.progress_percentage || 0);
        const matchesStatus = statusFilter === 'ALL' || getProgressStatus(pct) === statusFilter;
        const matchesSearch = !searchQuery ||
            e.course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.course.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const filteredPayments = (payments ?? []).filter((p: any) => {
        if (p.status !== 'PENDING') return false;
        const matchesStatus = statusFilter === 'ALL' || statusFilter === 'PENDING';
        const matchesSearch = !searchQuery ||
            p.course_title?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Stats
    const totalEnrollments = (enrollments ?? []).length;
    const totalPending = (payments ?? []).filter(p => p.status === 'PENDING').length;
    const completed = (enrollments ?? []).filter((e: any) => Number(e.progress_percentage) === 100).length;
    const inProgress = (enrollments ?? []).filter((e: any) => Number(e.progress_percentage) > 0 && Number(e.progress_percentage) < 100).length;

    const stats = [
        { label: 'Enrolled', value: totalEnrollments, icon: BookOpen, iconBg: 'bg-violet-50', iconColor: 'text-violet-500', valueColor: 'text-gray-900' },
        { label: 'In Progress', value: inProgress, icon: TrendingUp, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', valueColor: 'text-blue-600' },
        { label: 'Completed', value: completed, icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', valueColor: 'text-emerald-600' },
        { label: 'Pending', value: totalPending, icon: Clock, iconBg: 'bg-yellow-50', iconColor: 'text-yellow-500', valueColor: 'text-yellow-600' },
    ];

    return (
        <div className="py-6 px-4 md:px-6 space-y-6">
            <SEO title="My Learning" noindex />

            {/* ── Page header ── */}
            <div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">My Learning</h1>
                <p className="text-sm text-gray-400 mt-0.5">Manage and track your enrolled courses.</p>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map(({ label, value, icon: Icon, iconBg, iconColor, valueColor }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-medium">{label}</p>
                                <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
                            </div>
                            <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                                <Icon className={`w-4 h-4 ${iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Filter card ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Enrolled Courses</p>
                        <p className="text-xs text-gray-400 mt-0.5">{totalEnrollments + totalPending} total courses</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44"
                            />
                        </div>
                        {/* Dropdown */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value as FilterStatus)}
                                className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                            >
                                {STATUS_TABS.map(s => (
                                    <option key={s} value={s}>
                                        {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Tab pills */}
                <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-100 overflow-x-auto">
                    {STATUS_TABS.map(status => {
                        const active = statusFilter === status;
                        const cfg = status === 'ALL' ? null : statusConfig[status];
                        return (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${active
                                    ? status === 'ALL'
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : `${cfg?.badge} ring-2 ring-offset-0 shadow-sm`
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100'
                                    }`}
                            >
                                {cfg && <cfg.icon className={`w-3 h-3 ${active ? cfg.iconColor : 'text-gray-400'}`} />}
                                {status === 'ALL' ? 'ALL' : status.replace('_', ' ')}
                            </button>
                        );
                    })}
                </div>

                {/* ── Grid / empty / loading ── */}
                <div className="p-5">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-gray-50 rounded-xl h-72 animate-pulse border border-gray-100" />
                            ))}
                        </div>
                    ) : (filteredEnrollments.length > 0 || filteredPayments.length > 0) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPayments.map((payment: any) => (
                                <PendingPaymentCard key={payment.id} payment={payment} />
                            ))}
                            {filteredEnrollments.map((enrollment: any) => (
                                <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-14 text-center">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                <BookOpen className="w-5 h-5 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">
                                {searchQuery || statusFilter !== 'ALL' ? 'No courses match your filters' : "You haven't enrolled in any courses yet"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? 'Try adjusting your search or filter'
                                    : 'Browse the catalog to start learning'}
                            </p>
                            {!searchQuery && statusFilter === 'ALL' && (
                                <Link
                                    to="/courses"
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors"
                                >
                                    <BookOpen className="w-3.5 h-3.5" /> Browse Courses
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer count */}
                {(filteredEnrollments.length > 0 || filteredPayments.length > 0) && (
                    <div className="px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Showing {filteredEnrollments.length + filteredPayments.length} of {totalEnrollments + totalPending} courses
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEnrollmentsPage;