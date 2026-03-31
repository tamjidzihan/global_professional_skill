/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, type JSX } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMyCourses } from '../../../../hooks/useMyCourses';
import {
    Trash2,
    Edit,
    PlusCircle,
    Search,
    Filter,
    Eye,
    Users,
    Clock,
    BookOpen,
    CheckCircle,
    XCircle,
    MoreVertical,
    ExternalLink,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import SEO from '../../../components/SEO';

// ── Types ────────────────────────────────────────────────────────────────────
type FilterStatus = 'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

// ── Status config (mirrors admin design system) ───────────────────────────────
const statusConfig: Record<string, {
    badge: string;
    iconColor: string;
    icon: typeof BookOpen;
}> = {
    PUBLISHED: { badge: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-600', icon: Eye },
    APPROVED: { badge: 'bg-emerald-50 text-emerald-700', iconColor: 'text-emerald-600', icon: CheckCircle },
    PENDING: { badge: 'bg-amber-50 text-amber-700', iconColor: 'text-amber-500', icon: Clock },
    REJECTED: { badge: 'bg-rose-50 text-rose-700', iconColor: 'text-rose-600', icon: XCircle },
    DRAFT: { badge: 'bg-gray-100 text-gray-600', iconColor: 'text-gray-400', icon: Edit },
    ARCHIVED: { badge: 'bg-gray-100 text-gray-500', iconColor: 'text-gray-400', icon: AlertCircle },
};

const STATUS_TABS: FilterStatus[] = ['ALL', 'PUBLISHED', 'PENDING', 'APPROVED', 'DRAFT', 'ARCHIVED'];

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? statusConfig['DRAFT'];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md ${cfg.badge}`}>
            <Icon className={`w-3 h-3 ${cfg.iconColor}`} />
            {status}
        </span>
    );
}

// ── Course Thumbnail ──────────────────────────────────────────────────────────
function CourseThumbnail({ course }: { course: any }) {
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

// ── Action Dropdown ───────────────────────────────────────────────────────────
function ActionDropdown({ course, onDelete }: { course: any; onDelete: (id: string) => void }) {
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
        {
            label: 'View Details',
            icon: ExternalLink,
            to: `/dashboard/instructor/my-courses/${course.id}`,
            cls: 'text-gray-700 hover:bg-gray-50',
        },
        {
            label: 'Curriculum',
            icon: BookOpen,
            to: `/dashboard/instructor/my-courses/${course.id}/curriculum`,
            cls: 'text-gray-700 hover:bg-gray-50',
        },
        {
            label: 'Edit Course',
            icon: Edit,
            to: `/dashboard/instructor/edit-course/${course.id}`,
            cls: 'text-gray-700 hover:bg-gray-50',
        },
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
                    {items.map(({ label, icon: Icon, to, cls }) => (
                        <Link
                            key={label}
                            to={to}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors ${cls}`}
                        >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            {label}
                        </Link>
                    ))}
                    {/* Divider */}
                    <div className="my-1 border-t border-gray-100" />
                    <button
                        onClick={() => { onDelete(course.id); setOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        Delete Course
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
const MyCoursesPage = (): JSX.Element => {
    const { courses, loading, error, fetchMyCourses, removeCourse } = useMyCourses();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => { fetchMyCourses(); }, [fetchMyCourses]);

    useEffect(() => {
        if (location.state?.refresh) {
            fetchMyCourses();
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate, fetchMyCourses]);

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            removeCourse(id);
        }
    };

    const handleStatusFilter = (status: FilterStatus) => setStatusFilter(status);

    const filteredCourses = courses.filter((course: any) => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || course.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // ── Stats ──
    const stats = [
        {
            label: 'Total Courses',
            value: courses.length,
            icon: BookOpen,
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-500',
            valueColor: 'text-gray-900',
        },
        {
            label: 'Published',
            value: courses.filter((c: any) => c.status === 'PUBLISHED').length,
            icon: Eye,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            valueColor: 'text-blue-600',
        },
        {
            label: 'Total Students',
            value: courses.reduce((acc: number, c: any) => acc + (c.enrollment_count ?? 0), 0),
            icon: Users,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
            valueColor: 'text-gray-900',
        },
        {
            label: 'Drafts',
            value: courses.filter((c: any) => c.status === 'DRAFT').length,
            icon: Clock,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-500',
            valueColor: 'text-amber-600',
        },
    ];

    // ── Loading ──
    if (loading) {
        return (
            <div className="py-6 px-4 md:px-6 space-y-6">
                <SEO title="My Courses" noindex={true} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <div className="animate-pulse space-y-3">
                                <div className="h-3 w-24 bg-gray-100 rounded" />
                                <div className="h-6 w-12 bg-gray-100 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="px-5 py-3 border-b border-gray-50">
                            <div className="animate-pulse h-10 bg-gray-50 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Error ──
    if (error) {
        return (
            <div className="py-6 px-4 md:px-6">
                <SEO title="My Courses" noindex={true} />
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Failed to load courses</p>
                    <p className="text-xs text-gray-400">{error}</p>
                    <button
                        onClick={() => fetchMyCourses()}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 px-4 md:px-6 space-y-6">
            <SEO title="My Courses" noindex={true} />

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">My Courses</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Manage and monitor your course offerings.</p>
                </div>
                <Link
                    to="/dashboard/instructor/create-course"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors shadow-sm cursor-pointer"
                >
                    <PlusCircle className="w-4 h-4" />
                    Create Course
                </Link>
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
                                <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Table card ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

                {/* Card header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Course List</p>
                        <p className="text-xs text-gray-400 mt-0.5">{courses.length} total courses</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44"
                            />
                        </div>

                        {/* Dropdown filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
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

                {/* Tab pills */}
                <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-100 overflow-x-auto">
                    {STATUS_TABS.map(status => {
                        const active = statusFilter === status;
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

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {['Course', 'Category', 'Students', 'Price', 'Status', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map((course: any) => (
                                    <tr key={course.id} className="group hover:bg-gray-50/60 transition-colors duration-100">

                                        {/* Course */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <CourseThumbnail course={course} />
                                                <div className="min-w-0">
                                                    <Link
                                                        to={`/dashboard/instructor/my-courses/${course.id}`}
                                                        className="text-sm font-semibold text-gray-800 hover:text-violet-600 transition-colors truncate block"
                                                    >
                                                        {course.title}
                                                    </Link>
                                                    <p className="text-xs text-gray-400 truncate font-mono">
                                                        {course.id.slice(0, 8)}…
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <p className="text-sm text-gray-600">{course.category_name}</p>
                                        </td>

                                        {/* Students */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center">
                                                    <Users className="w-3 h-3 text-gray-400" />
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {course.enrollment_count ?? 0}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-800">
                                                <span className="text-gray-400 font-normal mr-0.5">৳</span>
                                                {course.price}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <StatusBadge status={course.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3 whitespace-nowrap text-right">
                                            <ActionDropdown course={course} onDelete={handleDelete} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-14 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <BookOpen className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No courses found</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {searchTerm || statusFilter !== 'ALL'
                                                ? 'Try adjusting your search or filter'
                                                : 'Start by creating your first course'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                {filteredCourses.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Showing {filteredCourses.length} of {courses.length} courses
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCoursesPage;