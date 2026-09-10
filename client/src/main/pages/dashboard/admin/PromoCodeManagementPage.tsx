/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
    Tag,
    Plus,
    Calendar,
    Percent,
    CheckCircle,
    XCircle,
    Trash2,
    Edit2,
    Clock,
    AlertCircle,
    Users,
    Search,
    Filter,
    BookOpen,
    ArrowLeft,
    RefreshCw,
    Check,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    getPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    getCourses,
} from '../../../../lib/api';
import type { PromoCode } from '../../../../types';
import SEO from '../../../components/SEO';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

type FilterStatus = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

const STATUS_TABS: { value: FilterStatus; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'EXPIRED', label: 'Expired' },
];

export function PromoCodeManagementPage() {
    const navigate = useNavigate();
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');

    // Form fields
    const [code, setCode] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState<number>(10);
    const [validFrom, setValidFrom] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [maxUses, setMaxUses] = useState<string>('');
    const [isActive, setIsActive] = useState(true);
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    const fetchPromoCodesList = async () => {
        setLoading(true);
        try {
            const res = await getPromoCodes();
            const data = res.data as any;
            if (data.results && Array.isArray(data.results)) {
                setPromoCodes(data.results);
            } else if (Array.isArray(data.data)) {
                setPromoCodes(data.data);
            } else if (Array.isArray(data)) {
                setPromoCodes(data);
            }
        } catch (error) {
            console.error('Failed to fetch promo codes:', error);
            toast.error('Failed to load promo codes');
        } finally {
            setLoading(false);
        }
    };

    const fetchCoursesList = async () => {
        try {
            const res = await getCourses({ all: 'true' });
            const data = res.data as any;
            const courseArray = Array.isArray(data.results?.data)
                ? data.results.data
                : Array.isArray(data.results)
                ? data.results
                : Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                ? data
                : [];
            setCourses(courseArray.map((c: any) => ({ id: c.id, title: c.title })));
        } catch (error) {
            console.error('Failed to fetch courses list:', error);
        }
    };

    useEffect(() => {
        fetchPromoCodesList();
        fetchCoursesList();
    }, []);

    const openCreateModal = () => {
        setEditingPromo(null);
        setCode('');
        setDiscountPercentage(10);
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + 30);

        setValidFrom(now.toISOString().slice(0, 16));
        setValidUntil(future.toISOString().slice(0, 16));
        setMaxUses('');
        setIsActive(true);
        setSelectedCourses([]);
        setCourseSearch('');
        setShowModal(true);
    };

    const openEditModal = (promo: PromoCode) => {
        setEditingPromo(promo);
        setCode(promo.code);
        setDiscountPercentage(promo.discount_percentage);
        setValidFrom(promo.valid_from ? new Date(promo.valid_from).toISOString().slice(0, 16) : '');
        setValidUntil(promo.valid_until ? new Date(promo.valid_until).toISOString().slice(0, 16) : '');
        setMaxUses(promo.max_uses ? String(promo.max_uses) : '');
        setIsActive(promo.is_active);
        setSelectedCourses(promo.courses || []);
        setCourseSearch('');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code.trim()) {
            toast.error('Promo code name is required.');
            return;
        }

        if (discountPercentage <= 0 || discountPercentage > 100) {
            toast.error('Discount percentage must be between 1% and 100%.');
            return;
        }

        if (!validFrom || !validUntil) {
            toast.error('Please specify valid start and end dates.');
            return;
        }

        if (new Date(validUntil) <= new Date(validFrom)) {
            toast.error('Valid End date must be after Valid Start date.');
            return;
        }

        setSubmitting(true);
        const payload: any = {
            code: code.trim().toUpperCase(),
            discount_percentage: Number(discountPercentage),
            valid_from: new Date(validFrom).toISOString(),
            valid_until: new Date(validUntil).toISOString(),
            max_uses: maxUses ? parseInt(maxUses, 10) : null,
            is_active: isActive,
            courses: selectedCourses,
        };

        try {
            if (editingPromo) {
                await updatePromoCode(editingPromo.id, payload);
                toast.success('Promo code updated successfully!');
            } else {
                await createPromoCode(payload);
                toast.success('Promo code created successfully!');
            }
            setShowModal(false);
            fetchPromoCodesList();
        } catch (err: any) {
            const msg = err.response?.data?.error?.message || err.response?.data?.code?.[0] || 'Failed to save promo code.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, codeName: string) => {
        if (!confirm(`Are you sure you want to delete promo code "${codeName}"?`)) return;
        try {
            await deletePromoCode(id);
            toast.success(`Promo code "${codeName}" deleted.`);
            fetchPromoCodesList();
        } catch (error) {
            console.error('Failed to delete promo code:', error);
            toast.error('Failed to delete promo code');
        }
    };

    const toggleCourseSelection = (courseId: string) => {
        setSelectedCourses(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    const selectAllCourses = () => {
        setSelectedCourses(courses.map(c => c.id));
    };

    const clearAllCourses = () => {
        setSelectedCourses([]);
    };

    // Filter calculations
    const now = new Date();
    const filteredPromoCodes = promoCodes.filter(promo => {
        const matchesSearch = promo.code.toLowerCase().includes(searchQuery.toLowerCase());
        const isExpired = promo.valid_until && new Date(promo.valid_until) < now;

        if (statusFilter === 'ACTIVE') return matchesSearch && promo.is_active && !isExpired;
        if (statusFilter === 'INACTIVE') return matchesSearch && !promo.is_active;
        if (statusFilter === 'EXPIRED') return matchesSearch && isExpired;
        return matchesSearch;
    });

    // Quick stats calculations
    const totalCount = promoCodes.length;
    const activeCount = promoCodes.filter(p => p.is_active && (!p.valid_until || new Date(p.valid_until) >= now)).length;
    const totalRedemptions = promoCodes.reduce((acc, curr) => acc + (curr.uses_count || 0), 0);
    const expiredOrInactiveCount = promoCodes.filter(p => !p.is_active || (p.valid_until && new Date(p.valid_until) < now)).length;

    // Filter courses inside modal
    const modalFilteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(courseSearch.toLowerCase())
    );

    // ── Design tokens ────────────────────────────────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm';
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100';

    if (loading && promoCodes.length === 0) {
        return <LoadingSpinner fullscreen text="Loading promo codes..." />;
    }

    return (
        <div className="py-6 px-4 md:px-6 space-y-5">
            <SEO title="Promo Code Management" noindex />

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Promo Code Management</h1>
                    <p className="text-sm text-gray-400 mt-0.5 truncate">
                        Create discount coupons, set validity windows, usage limits, and course restrictions.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => fetchPromoCodesList()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer"
                        title="Refresh List"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors cursor-pointer shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" /> Create Promo Code
                    </button>
                </div>
            </div>

            {/* ── Quick stats (4 columns) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Promo Codes', value: totalCount, iconBg: 'bg-violet-50', iconText: 'text-violet-600', icon: Tag },
                    { label: 'Active Codes', value: activeCount, iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', icon: CheckCircle },
                    { label: 'Total Redemptions', value: totalRedemptions, iconBg: 'bg-blue-50', iconText: 'text-blue-600', icon: Users },
                    { label: 'Expired / Inactive', value: expiredOrInactiveCount, iconBg: 'bg-rose-50', iconText: 'text-rose-600', icon: Clock },
                ].map(({ label, value, iconBg, iconText, icon: Icon }) => (
                    <div key={label} className={`${card} p-4 flex items-center gap-3`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                            <Icon className={`w-4 h-4 ${iconText}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                            <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Table Card ── */}
            <div className={card}>
                {/* Card header */}
                <div className={`${cardHeader} flex-col sm:flex-row gap-3`}>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Promo Code List</p>
                        <p className="text-xs text-gray-400 mt-0.5">{filteredPromoCodes.length} of {promoCodes.length} promo codes shown</p>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search promo code..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44 sm:w-48"
                            />
                        </div>
                        {/* Dropdown filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value as FilterStatus)}
                                className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                            >
                                {STATUS_TABS.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Status tab pills */}
                <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-100 overflow-x-auto">
                    {STATUS_TABS.map(({ value, label }) => {
                        const active = statusFilter === value;
                        return (
                            <button
                                key={value}
                                onClick={() => setStatusFilter(value)}
                                className={`inline-flex items-center px-3 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
                                    active
                                        ? value === 'ALL'
                                            ? 'bg-gray-900 text-white shadow-sm'
                                            : value === 'ACTIVE'
                                            ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200 shadow-sm'
                                            : value === 'INACTIVE'
                                            ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-200 shadow-sm'
                                            : 'bg-rose-50 text-rose-700 ring-2 ring-rose-200 shadow-sm'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {['Promo Code', 'Discount', 'Redemptions / Limit', 'Validity Duration', 'Applicable Courses', 'Status', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPromoCodes.length > 0 ? (
                                filteredPromoCodes.map(promo => {
                                    const isExpired = promo.valid_until && new Date(promo.valid_until) < now;
                                    const isLimitReached = promo.max_uses !== null && promo.uses_count >= promo.max_uses;
                                    const usagePercent = promo.max_uses ? Math.min(100, Math.round((promo.uses_count / promo.max_uses) * 100)) : 0;

                                    return (
                                        <tr key={promo.id} className="group hover:bg-gray-50/60 transition-colors duration-100">
                                            {/* Promo Code */}
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="font-mono font-bold text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-md border border-violet-100/80">
                                                        {promo.code}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Discount */}
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-xs">
                                                    <Percent className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span>{promo.discount_percentage}% OFF</span>
                                                </div>
                                            </td>

                                            {/* Redemptions */}
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="space-y-1 min-w-28">
                                                    <div className="flex items-center justify-between text-xs text-gray-700">
                                                        <span className="font-semibold">{promo.uses_count} used</span>
                                                        <span className="text-[11px] text-gray-400">
                                                            {promo.max_uses === null ? 'No limit' : `max ${promo.max_uses}`}
                                                        </span>
                                                    </div>
                                                    {promo.max_uses !== null && (
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    isLimitReached ? 'bg-amber-500' : 'bg-blue-500'
                                                                }`}
                                                                style={{ width: `${usagePercent}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Validity Duration */}
                                            <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                                                        <span>{new Date(promo.valid_from).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                                                        <Clock className="w-3 h-3 shrink-0" />
                                                        <span>Until {new Date(promo.valid_until).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Applicable Courses */}
                                            <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                                                {promo.courses_detail && promo.courses_detail.length > 0 ? (
                                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-blue-100">
                                                        <BookOpen className="w-3 h-3" />
                                                        {promo.courses_detail.length} Course{promo.courses_detail.length > 1 ? 's' : ''}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-medium text-[11px] bg-gray-100 text-gray-600">
                                                        All Courses
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {isExpired ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-700 rounded-md border border-rose-100">
                                                        <XCircle className="w-3 h-3" /> Expired
                                                    </span>
                                                ) : isLimitReached ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-700 rounded-md border border-amber-100">
                                                        <AlertCircle className="w-3 h-3" /> Limit Reached
                                                    </span>
                                                ) : promo.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-md">
                                                        <CheckCircle className="w-3 h-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-gray-100 text-gray-600 rounded-md">
                                                        <XCircle className="w-3 h-3" /> Inactive
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(promo)}
                                                        title="Edit Promo Code"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors cursor-pointer"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(promo.id, promo.code)}
                                                        title="Delete Promo Code"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-14 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <Tag className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No promo codes found</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {searchQuery || statusFilter !== 'ALL'
                                                ? 'Try adjusting your search query or filter'
                                                : 'Start by creating your first promotional discount coupon'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                {filteredPromoCodes.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Showing {filteredPromoCodes.length} of {promoCodes.length} promo codes
                        </p>
                    </div>
                )}
            </div>

            {/* ── Create / Edit Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                    <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                                    <Tag className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    {editingPromo ? `Edit Promo Code (${editingPromo.code})` : 'Create New Promo Code'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
                            {/* Code Input */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                    Promo Code Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. SAVE20, SPECIAL50"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold uppercase focus:border-violet-300 focus:ring-2 focus:ring-violet-50 outline-none"
                                />
                                <p className="text-[11px] text-gray-400 mt-0.5">Codes are automatically capitalized.</p>
                            </div>

                            {/* Discount Percentage */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                    Discount Percentage (%) *
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        step="0.1"
                                        required
                                        placeholder="e.g. 20"
                                        value={discountPercentage}
                                        onChange={e => setDiscountPercentage(Number(e.target.value))}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg font-semibold focus:border-violet-300 focus:ring-2 focus:ring-violet-50 outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
                                </div>
                            </div>

                            {/* Validity Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                        Valid From *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={validFrom}
                                        onChange={e => setValidFrom(e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:border-violet-300 focus:ring-2 focus:ring-violet-50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                        Valid Until (Expiry) *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={validUntil}
                                        onChange={e => setValidUntil(e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:border-violet-300 focus:ring-2 focus:ring-violet-50 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Max Uses & Active status */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                        Max Usage Limit
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Leave empty for unlimited"
                                        value={maxUses}
                                        onChange={e => setMaxUses(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-violet-300 focus:ring-2 focus:ring-violet-50 outline-none"
                                    />
                                </div>
                                <div className="pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={e => setIsActive(e.target.checked)}
                                            className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
                                        />
                                        <span className="text-xs font-semibold text-gray-800">Is Active</span>
                                    </label>
                                </div>
                            </div>

                            {/* Restrict to Courses */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Restrict to Specific Courses
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={selectAllCourses}
                                            className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 transition-colors cursor-pointer"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-gray-300">·</span>
                                        <button
                                            type="button"
                                            onClick={clearAllCourses}
                                            className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-400 mb-2">If none selected, promo applies to all courses.</p>

                                <div className="relative mb-2">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search courses to restrict..."
                                        value={courseSearch}
                                        onChange={e => setCourseSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-300"
                                    />
                                </div>

                                <div className="max-h-36 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50 space-y-1 divide-y divide-gray-100">
                                    {modalFilteredCourses.length === 0 ? (
                                        <p className="text-[11px] text-gray-400 italic py-2 text-center">No matching courses found</p>
                                    ) : (
                                        modalFilteredCourses.map(c => {
                                            const isSelected = selectedCourses.includes(c.id);
                                            return (
                                                <label
                                                    key={c.id}
                                                    className={`flex items-center gap-2 text-xs py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
                                                        isSelected ? 'bg-violet-50/80 text-violet-900 font-semibold' : 'text-gray-700 hover:bg-gray-100/60'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleCourseSelection(c.id)}
                                                        className="w-3.5 h-3.5 text-violet-600 rounded border-gray-300"
                                                    />
                                                    <span className="truncate">{c.title}</span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {submitting ? (
                                        'Saving...'
                                    ) : (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            {editingPromo ? 'Update Promo Code' : 'Create Promo Code'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PromoCodeManagementPage;
