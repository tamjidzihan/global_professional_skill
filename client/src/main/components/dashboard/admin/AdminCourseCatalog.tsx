import { useEffect, useState, useRef, type JSX } from 'react';
import {
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    CheckCircle,
    XCircle,
    Clock,
    Edit,
    MoreVertical,
    Eye,
    EyeOff,
    ExternalLink,
} from 'lucide-react';
import { useAdminCourses } from '../../../../hooks/useAdminCourses';
import type { CoursesSummary } from '../../../../types';
import { Link } from 'react-router-dom';

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'DRAFT';

const statusConfig: Record<string, { badge: string; iconColor: string; iconBg: string; icon: typeof BookOpen; barColor: string }> = {
    PUBLISHED: { badge: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-600', iconBg: 'bg-blue-50', icon: Eye, barColor: 'bg-blue-500' },
    APPROVED: { badge: 'bg-emerald-50 text-emerald-700', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', icon: CheckCircle, barColor: 'bg-emerald-500' },
    PENDING: { badge: 'bg-amber-50 text-amber-700', iconColor: 'text-amber-500', iconBg: 'bg-amber-50', icon: Clock, barColor: 'bg-amber-400' },
    REJECTED: { badge: 'bg-rose-50 text-rose-700', iconColor: 'text-rose-600', iconBg: 'bg-rose-50', icon: XCircle, barColor: 'bg-rose-500' },
    DRAFT: { badge: 'bg-gray-50 text-gray-600', iconColor: 'text-gray-400', iconBg: 'bg-gray-100', icon: Edit, barColor: 'bg-gray-300' },
};

const STATUS_TABS: FilterStatus[] = ['ALL', 'PUBLISHED', 'PENDING', 'APPROVED', 'REJECTED', 'DRAFT'];

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] || statusConfig['DRAFT'];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md ${cfg.badge}`}>
            <Icon className={`w-3 h-3 ${cfg.iconColor}`} />
            {status}
        </span>
    );
}

// ── Course thumbnail / icon ──────────────────────────────────────────────────
function CourseThumbnail({ course }: { course: CoursesSummary }) {
    if (course.thumbnail) {
        return (
            <img
                className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                src={course.thumbnail}
                alt={course.title}
            />
        );
    }
    return (
        <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <BookOpen className="w-4.5 h-4.5 text-violet-500" />
        </div>
    );
}

// ── Action Dropdown ──────────────────────────────────────────────────────────
function ActionDropdown({ course }: { course: CoursesSummary }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const items = [
        { label: 'View Details', icon: ExternalLink, to: `/dashboard/admin/courses/${course.id}`, cls: 'text-gray-700 hover:bg-gray-50' },
        { label: 'Preview Course', icon: Eye, to: `/courses/${course.id}`, cls: 'text-gray-700 hover:bg-gray-50' },
        ...(course.status === 'PUBLISHED'
            ? [{ label: 'Unpublish', icon: EyeOff, cls: 'text-amber-700 hover:bg-amber-50' }]
            : []),
    ];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-xl z-30 overflow-hidden py-1">
                    {items.map(({ label, icon: Icon, to, cls }) =>
                        to ? (
                            <Link
                                key={label}
                                to={to}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors ${cls}`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                {label}
                            </Link>
                        ) : (
                            <button
                                key={label}
                                onClick={() => setOpen(false)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${cls}`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                {label}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function AdminCourseCatalog(): JSX.Element {
    const { courses, fetchCourses, loading, totalCount, nextPage, prevPage, loadNextPage, loadPrevPage } = useAdminCourses();
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        fetchCourses(filterStatus);
    }, [fetchCourses, filterStatus]);

    const handleStatusFilter = (status: FilterStatus) => {
        setFilterStatus(status);
        fetchCourses(status);
    };

    const filteredCourses = courses.filter((course: CoursesSummary) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            course.title?.toLowerCase().includes(q) ||
            course.instructor_name?.toLowerCase().includes(q) ||
            course.category_name?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                <div>
                    <p className="text-sm font-semibold text-gray-900">Course Catalog</p>
                    <p className="text-xs text-gray-400 mt-0.5">{totalCount} total courses</p>
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

                    {/* Dropdown filter */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={e => handleStatusFilter(e.target.value as FilterStatus)}
                            className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                        >
                            {STATUS_TABS.map(s => (
                                <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* ── Status tab pills ── */}
            <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-100 overflow-x-auto">
                {STATUS_TABS.map(status => {
                    const active = filterStatus === status;
                    const cfg = status === 'ALL' ? null : statusConfig[status];
                    return (
                        <button
                            key={status}
                            onClick={() => handleStatusFilter(status)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${active
                                ? status === 'ALL'
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : `${cfg?.badge} ring-2 ring-offset-0 shadow-sm`
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100'
                                }`}
                        >
                            {cfg && <cfg.icon className={`w-3 h-3 ${active ? cfg.iconColor : 'text-gray-400'}`} />}
                            {status}
                        </button>
                    );
                })}
            </div>

            {/* ── Table ── */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {['Course', 'Instructor', 'Enrollments', 'Status', 'Price', ''].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={5} className="px-5 py-3">
                                        <div className="animate-pulse h-10 bg-gray-50 rounded-lg" />
                                    </td>
                                </tr>
                            ))
                        ) : filteredCourses.length > 0 ? (
                            filteredCourses.map(course => (
                                <tr key={course.id} className="group hover:bg-gray-50/60 transition-colors duration-100">

                                    {/* Course */}
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <CourseThumbnail course={course} />
                                            <div className="min-w-0">
                                                <Link
                                                    to={`/dashboard/admin/courses/${course.id}`}
                                                    className="text-sm font-semibold text-gray-800 hover:text-violet-600 transition-colors truncate block"
                                                >
                                                    {course.title}
                                                </Link>
                                                <p className="text-xs text-gray-400 truncate">{course.category_name}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Instructor */}
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <p className="text-sm text-gray-600 font-medium">{course.instructor_name}</p>
                                    </td>

                                    {/* Enrollments */}
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <Link to={`/dashboard/admin/courses/${course.id}/students`}>
                                            <p className="text-sm hover:text-violet-600 text-gray-600 font-medium">{course.enrollment_count}</p>
                                        </Link>
                                    </td>

                                    {/* Status */}
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <StatusBadge status={course.status} />
                                    </td>

                                    {/* Price */}
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-800">
                                            <span className="text-gray-400 font-normal mr-0.5">৳</span>{course.price}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-3 whitespace-nowrap text-right">
                                        <ActionDropdown course={course} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-14 text-center">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                        <BookOpen className="w-5 h-5 text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">No courses found</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Try adjusting your search or filter</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {(nextPage || prevPage) && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                    <button
                        onClick={loadPrevPage}
                        disabled={!prevPage}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <span className="text-xs text-gray-400">
                        {filteredCourses.length} of {totalCount} courses
                    </span>
                    <button
                        onClick={loadNextPage}
                        disabled={!nextPage}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}