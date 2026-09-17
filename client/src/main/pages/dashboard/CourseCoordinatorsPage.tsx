/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    UserCheck,
    UserPlus,
    Search,
    Trash2,
    Shield,
    Mail,
    Building,
    AlertCircle,
    RefreshCw,
    Award,
    Sparkles,
    Eye,
    EyeOff,
    X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../../hooks/useAuth';
import {
    api,
    getCourseCoordinators,
    addCourseCoordinator,
    removeCourseCoordinator,
    getAvailableInstructors,
} from '../../../lib/api';
import type { User, CourseDetail } from '../../../types';

export const CourseCoordinatorsPage: React.FC = () => {
    const { courseId, id } = useParams<{ courseId?: string; id?: string }>();
    const effectiveCourseId = courseId || id;
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const isAdminRoute = location.pathname.includes('/admin/');

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [coordinators, setCoordinators] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search & Directory state
    const [searchQuery, setSearchQuery] = useState('');
    const [showDirectory, setShowDirectory] = useState(false);
    const [availableInstructors, setAvailableInstructors] = useState<User[]>([]);
    const [searchingInstructors, setSearchingInstructors] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Removal confirmation modal state
    const [removingCoordinator, setRemovingCoordinator] = useState<User | null>(null);
    const [removingLoading, setRemovingLoading] = useState(false);

    const loadData = useCallback(async () => {
        if (!effectiveCourseId) return;
        try {
            const [courseRes, coordsRes] = await Promise.all([
                api.get(`/courses/courses/${effectiveCourseId}/`),
                getCourseCoordinators(effectiveCourseId),
            ]);

            if (courseRes.data.success && courseRes.data.data) {
                setCourse(courseRes.data.data);
            }
            if (coordsRes.data.success && coordsRes.data.data) {
                setCoordinators(coordsRes.data.data);
            }
        } catch (error: any) {
            console.error('Failed to load course coordinator data:', error);
            toast.error(error.response?.data?.error?.message || 'Failed to load course details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [effectiveCourseId]);

    useEffect(() => {
        setLoading(true);
        loadData();
    }, [loadData]);

    // Fetch available instructors when search query changes or directory is toggled
    const canManageCoordinators = isAdminRoute || (user && course && course.instructor.id === user.id);

    useEffect(() => {
        if (!effectiveCourseId || !canManageCoordinators) return;

        // Only search/fetch if user typed at least 1 character OR explicitly opened the directory
        if (!searchQuery.trim() && !showDirectory) {
            setAvailableInstructors([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearchingInstructors(true);
            try {
                const res = await getAvailableInstructors(effectiveCourseId, searchQuery.trim() || undefined);
                if (res.data.success && res.data.data) {
                    setAvailableInstructors(res.data.data);
                }
            } catch (error: any) {
                console.error('Failed to fetch available instructors:', error);
            } finally {
                setSearchingInstructors(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [effectiveCourseId, searchQuery, showDirectory]);

    const handleAddCoordinator = async (instructor: User) => {
        if (!effectiveCourseId) return;
        setActionLoadingId(instructor.id);
        try {
            const res = await addCourseCoordinator(effectiveCourseId, instructor.id);
            if (res.data.success) {
                toast.success(res.data.message || `${instructor.full_name || instructor.email} added as coordinator!`);
                // Remove from available instructors and add to current coordinators list
                setAvailableInstructors((prev) => prev.filter((i) => i.id !== instructor.id));
                setCoordinators((prev) => [...prev, instructor]);
                await loadData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to add coordinator');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleConfirmRemove = async () => {
        if (!effectiveCourseId || !removingCoordinator) return;
        setRemovingLoading(true);
        try {
            const res = await removeCourseCoordinator(effectiveCourseId, removingCoordinator.id);
            if (res.data.success) {
                toast.success(res.data.message || `${removingCoordinator.full_name || removingCoordinator.email} removed.`);
                setCoordinators((prev) => prev.filter((c) => c.id !== removingCoordinator.id));
                setRemovingCoordinator(null);
                await loadData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to remove coordinator');
        } finally {
            setRemovingLoading(false);
        }
    };

    const handleManualRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const backUrl = isAdminRoute
        ? `/dashboard/admin/courses/${effectiveCourseId}`
        : `/dashboard/instructor/my-courses/${effectiveCourseId}`;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="py-12 px-4 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h2 className="text-lg font-bold text-gray-900">Course Not Found</h2>
                <button
                    onClick={() => navigate(isAdminRoute ? '/dashboard/admin/courses' : '/dashboard/instructor/my-courses')}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors"
                >
                    Return to Courses
                </button>
            </div>
        );
    }

    return (
        <div className="py-6 px-4 md:px-6 space-y-6 bg-gray-50/50 min-h-screen">
            <SEO title={`Manage Coordinators | ${course.title}`} noindex />

            {/* Top Navigation & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                    <button
                        onClick={() => navigate(backUrl)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-1.5 cursor-pointer font-medium"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Course Detail
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-600" />
                        Course Coordinators Management
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5 truncate max-w-xl">
                        {course.title}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleManualRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer shadow-xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <Link
                        to={backUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors shadow-xs cursor-pointer"
                    >
                        View Course
                    </Link>
                </div>
            </div>

            {/* Course & Lead Instructor Overview Banner */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100">
                            <Award className="w-8 h-8" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md">
                            {course.category?.name || 'General'}
                        </span>
                        <h2 className="text-base font-bold text-gray-900 mt-1 truncate">{course.title}</h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-amber-500" />
                                <strong>Lead Instructor:</strong> {course.instructor.full_name || course.instructor.email}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-violet-500" />
                                <strong>Coordinators:</strong> {coordinators.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {course.instructor.full_name?.charAt(0) || 'I'}
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Primary Instructor</p>
                        <p className="text-xs font-semibold text-gray-800 truncate max-w-[150px]">
                            {course.instructor.full_name || course.instructor.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid: Active Coordinators (Left) + Add Coordinators (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ── Left Column: Active Assigned Coordinators ── */}
                <div className="lg:col-span-6 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-emerald-600" />
                                    Assigned Course Coordinators
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Instructors assisting in course coordination, materials, and student monitoring
                                </p>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                                {coordinators.length} Assigned
                            </span>
                        </div>

                        {coordinators.length > 0 ? (
                            <div className="space-y-3">
                                {coordinators.map((coordinator) => (
                                    <div
                                        key={coordinator.id}
                                        className="flex items-start justify-between gap-3 p-3.5 bg-gray-50/70 border border-gray-100 hover:border-gray-200 rounded-xl transition-all"
                                    >
                                        <div className="flex items-start gap-3 min-w-0">
                                            {coordinator.profile_picture ? (
                                                <img
                                                    src={coordinator.profile_picture}
                                                    alt={coordinator.full_name || coordinator.email}
                                                    className="w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                                                    {coordinator.full_name?.charAt(0) || coordinator.first_name?.charAt(0) || 'C'}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className="text-xs font-bold text-gray-900 truncate">
                                                        {coordinator.full_name || `${coordinator.first_name} ${coordinator.last_name}`.trim() || coordinator.email}
                                                    </p>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                                                        Coordinator
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 flex items-center gap-1 truncate mt-0.5">
                                                    <Mail className="w-3 h-3 text-gray-400 shrink-0" /> {coordinator.email}
                                                </p>
                                                {coordinator.organization_name && (
                                                    <p className="text-[10px] text-gray-400 flex items-center gap-1 truncate mt-0.5">
                                                        <Building className="w-3 h-3 text-gray-400 shrink-0" /> {coordinator.organization_name}
                                                    </p>
                                                )}
                                                {coordinator.bio && (
                                                    <p className="text-[11px] text-gray-600 line-clamp-1 italic mt-1 bg-white/60 p-1 rounded border border-gray-100">
                                                        "{coordinator.bio}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {canManageCoordinators && (
                                            <button
                                                type="button"
                                                onClick={() => setRemovingCoordinator(coordinator)}
                                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                                                title="Remove Coordinator"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 px-4 text-center border-2 border-dashed border-gray-100 rounded-2xl space-y-2">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-700">No Course Coordinators Assigned Yet</h3>
                                <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                                    You can assign other certified instructors as coordinators to help manage this course. Use the search panel on the right to find and add instructors.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right Column: Search & Add Coordinators (Only for Main Instructor or Admin) ── */}
                <div className="lg:col-span-6 space-y-4">
                    {canManageCoordinators ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
                            <div className="border-b border-gray-100 pb-3 flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <UserPlus className="w-4 h-4 text-violet-600" />
                                        Add New Coordinator
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Search for instructors by name or email
                                    </p>
                                </div>

                                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100 shrink-0">
                                    Instructor Role Only
                                </span>
                            </div>

                            {/* Search Input Box */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                                    Search Registered Instructors
                                </label>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by instructor name (e.g. John Doe) or email..."
                                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 font-medium text-gray-800 transition-all"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* On-Demand Full List Toggle */}
                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowDirectory(!showDirectory)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                        showDirectory
                                            ? 'bg-violet-100 text-violet-800'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                                    }`}
                                >
                                    {showDirectory ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    <span>{showDirectory ? 'Hide Full Instructor List' : 'Browse All Available Instructors'}</span>
                                </button>

                                {searchingInstructors && (
                                    <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                        <LoadingSpinner size={12} /> Searching...
                                    </span>
                                )}
                            </div>

                            {/* Search / Directory Results Container */}
                            <div className="space-y-3 pt-2">
                                {searchingInstructors ? (
                                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-400">
                                        <LoadingSpinner size={24} />
                                        <p className="text-xs">Finding available instructors...</p>
                                    </div>
                                ) : availableInstructors.length > 0 ? (
                                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            Found {availableInstructors.length} Available Instructor{availableInstructors.length > 1 ? 's' : ''}
                                        </p>
                                        {availableInstructors.map((instructor) => (
                                            <div
                                                key={instructor.id}
                                                className="flex items-center justify-between gap-3 p-3 bg-white border border-gray-100 hover:border-violet-200 hover:shadow-xs rounded-xl transition-all"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {instructor.profile_picture ? (
                                                        <img
                                                            src={instructor.profile_picture}
                                                            alt={instructor.full_name || instructor.email}
                                                            className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                            {instructor.full_name?.charAt(0) || instructor.first_name?.charAt(0) || 'I'}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-gray-900 truncate">
                                                            {instructor.full_name || `${instructor.first_name} ${instructor.last_name}`.trim() || instructor.email}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 truncate">{instructor.email}</p>
                                                        {instructor.organization_name && (
                                                            <p className="text-[10px] text-gray-400 truncate">{instructor.organization_name}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleAddCoordinator(instructor)}
                                                    disabled={actionLoadingId === instructor.id}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 disabled:opacity-50"
                                                >
                                                    {actionLoadingId === instructor.id ? (
                                                        <LoadingSpinner size={12} />
                                                    ) : (
                                                        <>
                                                            <UserPlus className="w-3.5 h-3.5" />
                                                            <span>Add</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (searchQuery.trim() || showDirectory) ? (
                                    <div className="py-8 px-4 text-center bg-gray-50/50 rounded-xl border border-gray-100 space-y-1.5">
                                        <Users className="w-8 h-8 text-gray-300 mx-auto" />
                                        <p className="text-xs font-bold text-gray-700">No Eligible Instructors Found</p>
                                        <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                                            {searchQuery.trim()
                                                ? `No instructors matched "${searchQuery}". Ensure the user has the INSTRUCTOR role.`
                                                : 'All active instructors are already assigned to this course.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="py-8 px-4 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 space-y-1">
                                        <Sparkles className="w-6 h-6 text-violet-400 mx-auto" />
                                        <p className="text-xs font-bold text-gray-700">Search or Browse Instructors</p>
                                        <p className="text-[11px] text-gray-400">
                                            Type a name/email above or click "Browse All Available Instructors" to choose a coordinator.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Coordinator Management Restricted</h3>
                                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
                                    Only the lead instructor (<strong>{course.instructor.full_name || course.instructor.email}</strong>) or an administrator can add or remove coordinators for this course.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Remove Coordinator Confirmation Modal */}
            {removingCoordinator && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-bold text-gray-900">Remove Course Coordinator?</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Are you sure you want to remove{' '}
                                <strong className="text-gray-800">
                                    {removingCoordinator.full_name || removingCoordinator.email}
                                </strong>{' '}
                                as a coordinator for this course? They will no longer have coordinator access.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setRemovingCoordinator(null)}
                                disabled={removingLoading}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmRemove}
                                disabled={removingLoading}
                                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                {removingLoading ? <LoadingSpinner size={14} /> : 'Confirm Removal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
