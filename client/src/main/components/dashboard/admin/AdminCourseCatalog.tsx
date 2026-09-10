import { useEffect, useState, useRef, useCallback, type JSX } from 'react';
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
    X,
} from 'lucide-react';
import { useAdminCourses } from '../../../../hooks/useAdminCourses';
import type { CoursesSummary } from '../../../../types';
import { Link } from 'react-router-dom';

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'DRAFT';

const statusConfig: Record<string, { badge: string; iconColor: string; iconBg: string; icon: typeof BookOpen; barColor: string }> = {
    PUBLISHED: { badge: 'bg-blue-50 text-blue-700 border border-blue-200/80', iconColor: 'text-blue-600', iconBg: 'bg-blue-50', icon: Eye, barColor: 'bg-blue-500' },
    APPROVED: { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', icon: CheckCircle, barColor: 'bg-emerald-500' },
    PENDING: { badge: 'bg-amber-50 text-amber-700 border border-amber-200/80', iconColor: 'text-amber-500', iconBg: 'bg-amber-50', icon: Clock, barColor: 'bg-amber-400' },
    REJECTED: { badge: 'bg-rose-50 text-rose-700 border border-rose-200/80', iconColor: 'text-rose-600', iconBg: 'bg-rose-50', icon: XCircle, barColor: 'bg-rose-500' },
    DRAFT: { badge: 'bg-gray-50 text-gray-600 border border-gray-200/80', iconColor: 'text-gray-400', iconBg: 'bg-gray-100', icon: Edit, barColor: 'bg-gray-300' },
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
        <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 border border-violet-100">
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
    const {
        courses,
        fetchCourses,
        loading,
        totalCount,
        currentPage,
        pageSize,
        totalPages,
        nextPage,
        prevPage,
        loadNextPage,
        loadPrevPage,
        goToPage,
    } = useAdminCourses();

    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const triggerFetch = useCallback((status: FilterStatus, search: string, page: number = 1) => {
        fetchCourses(status, null, {
            search,
            page,
            pageSize,
        });
    }, [fetchCourses, pageSize]);

    useEffect(() => {
        triggerFetch('ALL', '', 1);
    }, [triggerFetch]);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            triggerFetch(filterStatus, val.trim(), 1);
        }, 350);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        triggerFetch(filterStatus, '', 1);
    };

    const handleStatusFilter = (status: FilterStatus) => {
        setFilterStatus(status);
        triggerFetch(status, searchQuery.trim(), 1);
    };

    // Calculate pagination items range
    const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endItem = totalCount > 0 ? Math.min(currentPage * pageSize, totalCount) : 0;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) {
                pages.push('...');
            }
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) {
                pages.push('...');
            }
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                <div>
                    <h2 className="text-sm font-bold text-gray-900">Course Catalog</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {loading ? 'Updating catalog...' : `${totalCount} total courses`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={e => handleSearchChange(e.target.value)}
                            className="pl-8 pr-8 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10 transition-all w-48 sm:w-56"
                        />
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                title="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown filter for mobile */}
                    <div className="relative sm:hidden">
                        <select
                            value={filterStatus}
                            onChange={e => handleStatusFilter(e.target.value as FilterStatus)}
                            className="appearance-none pl-3 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10 transition-all cursor-pointer"
                        >
                            {STATUS_TABS.map(s => (
                                <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* ── Status tab pills (Desktop/Tablet) ── */}
            <div className="hidden sm:flex items-center gap-1.5 px-5 py-3 border-b border-gray-100 overflow-x-auto bg-gray-50/30">
                {STATUS_TABS.map(status => {
                    const active = filterStatus === status;
                    const cfg = status === 'ALL' ? null : statusConfig[status];
                    return (
                        <button
                            key={status}
                            onClick={() => handleStatusFilter(status)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${active
                                ? status === 'ALL'
                                    ? 'bg-gray-900 text-white shadow-xs'
                                    : `${cfg?.badge} ring-2 ring-violet-500/20 shadow-xs font-extrabold`
                                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/80 shadow-2xs'
                                }`}
                        >
                            {cfg && <cfg.icon className={`w-3 h-3 ${active ? cfg.iconColor : 'text-gray-400'}`} />}
                            {status === 'ALL' ? 'All Courses' : status}
                        </button>
                    );
                })}
            </div>

            {/* ── Table ── */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            {['Course', 'Instructor', 'Enrollments', 'Status', 'Price', ''].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={6} className="px-5 py-3.5">
                                        <div className="animate-pulse h-9 bg-gray-50 rounded-lg border border-gray-100/60" />
                                    </td>
                                </tr>
                            ))
                        ) : courses.length > 0 ? (
                            courses.map(course => (
                                <tr key={course.id} className="group hover:bg-gray-50/60 transition-colors duration-100">

                                    {/* Course */}
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <CourseThumbnail course={course} />
                                            <div className="min-w-0 max-w-xs sm:max-w-md">
                                                <Link
                                                    to={`/dashboard/admin/courses/${course.id}`}
                                                    className="text-xs sm:text-sm font-bold text-gray-900 hover:text-violet-600 transition-colors truncate block"
                                                    title={course.title}
                                                >
                                                    {course.title}
                                                </Link>
                                                <p className="text-[11px] text-gray-400 truncate mt-0.5">{course.category_name || 'Uncategorized'}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Instructor */}
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <p className="text-xs font-medium text-gray-700">{course.instructor_name || '—'}</p>
                                    </td>

                                    {/* Enrollments */}
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <Link
                                            to={`/dashboard/admin/courses/${course.id}/students`}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-violet-600 transition-colors"
                                        >
                                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-mono font-bold text-[11px]">
                                                {course.enrollment_count ?? 0}
                                            </span>
                                            <span className="text-[10px] text-gray-400">students</span>
                                        </Link>
                                    </td>

                                    {/* Status */}
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <StatusBadge status={course.status} />
                                    </td>

                                    {/* Price */}
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <span className="text-xs font-bold text-gray-900">
                                            {course.is_free ? (
                                                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Free</span>
                                            ) : (
                                                <>
                                                    <span className="text-gray-400 font-normal mr-0.5">৳</span>
                                                    {parseFloat(String(course.price || 0)).toLocaleString()}
                                                </>
                                            )}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                        <ActionDropdown course={course} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-14 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                        <BookOpen className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">No courses found</p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                                        {searchQuery ? `No courses matching "${searchQuery}"` : 'No courses available under this status filter.'}
                                    </p>
                                    {searchQuery && (
                                        <button
                                            onClick={handleClearSearch}
                                            className="mt-3 text-xs font-bold text-violet-600 hover:text-violet-700 underline cursor-pointer"
                                        >
                                            Clear search query
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Rich Pagination Bar ── */}
            {totalCount > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
                    {/* Item count text */}
                    <div className="text-xs text-gray-500 font-medium">
                        Showing <span className="font-bold text-gray-900">{startItem}</span> to{' '}
                        <span className="font-bold text-gray-900">{endItem}</span> of{' '}
                        <span className="font-bold text-gray-900">{totalCount}</span> courses
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-1.5 self-center sm:self-auto">
                        {/* Previous Button */}
                        <button
                            onClick={loadPrevPage}
                            disabled={currentPage <= 1 || !prevPage || loading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                            title="Previous Page"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                        </button>

                        {/* Numbered Page Buttons */}
                        {totalPages > 1 && (
                            <div className="hidden sm:flex items-center gap-1 mx-1">
                                {getPageNumbers().map((pageItem, idx) => {
                                    if (pageItem === '...') {
                                        return (
                                            <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-gray-400 font-bold">
                                                …
                                            </span>
                                        );
                                    }
                                    const pageNum = Number(pageItem);
                                    const isActive = pageNum === currentPage;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            disabled={loading}
                                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${isActive
                                                ? 'bg-violet-600 text-white shadow-2xs font-extrabold'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/70'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Page X of Y on mobile */}
                        {totalPages > 1 && (
                            <span className="sm:hidden text-xs font-bold text-gray-600 px-2">
                                {currentPage} / {totalPages}
                            </span>
                        )}

                        {/* Next Button */}
                        <button
                            onClick={loadNextPage}
                            disabled={currentPage >= totalPages || !nextPage || loading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                            title="Next Page"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}