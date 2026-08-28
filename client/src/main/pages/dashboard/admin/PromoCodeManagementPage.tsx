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
    Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode, getCourses } from '../../../../lib/api';
import type { PromoCode } from '../../../../types';

export function PromoCodeManagementPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActive, setFilterActive] = useState<string>('ALL');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [submitting, setSubmitting] = useState(false);

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
            const res = await getCourses({ page_size: 100 });
            const data = res.data as any;
            const courseArray = Array.isArray(data.results?.data)
                ? data.results.data
                : Array.isArray(data.results)
                ? data.results
                : Array.isArray(data.data)
                ? data.data
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
        // Default start: today; Default end: +30 days
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + 30);

        setValidFrom(now.toISOString().slice(0, 16));
        setValidUntil(future.toISOString().slice(0, 16));
        setMaxUses('');
        setIsActive(true);
        setSelectedCourses([]);
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

    const filteredPromoCodes = promoCodes.filter(promo => {
        const matchesSearch = promo.code.toLowerCase().includes(searchQuery.toLowerCase());
        if (filterActive === 'ACTIVE') return matchesSearch && promo.is_active;
        if (filterActive === 'INACTIVE') return matchesSearch && !promo.is_active;
        return matchesSearch;
    });

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                        <Tag className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Promo Code Management</h1>
                        <p className="text-sm text-gray-500">Create discount coupons, set validity duration, usage limits, and course restrictions.</p>
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-95 cursor-pointer"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Promo Code
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by promo code (e.g. SAVE20)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm font-medium"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                    >
                        <option value="ALL">All Promo Codes</option>
                        <option value="ACTIVE">Active Only</option>
                        <option value="INACTIVE">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Promo Codes Table / Grid */}
            {loading ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto mb-3"></div>
                    <p className="text-gray-500 font-medium">Loading promo codes...</p>
                </div>
            ) : filteredPromoCodes.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-800 mb-1">No Promo Codes Found</h3>
                    <p className="text-sm text-gray-500 mb-6">Create discount coupons to offer price discounts for your courses.</p>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center px-4 py-2.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Promo Code
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-4 px-6">Promo Code</th>
                                    <th className="py-4 px-6">Discount</th>
                                    <th className="py-4 px-6">Validity Duration</th>
                                    <th className="py-4 px-6">Redemptions / Max</th>
                                    <th className="py-4 px-6">Applicable Courses</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredPromoCodes.map((promo) => {
                                    const now = new Date();
                                    const isExpired = promo.valid_until && new Date(promo.valid_until) < now;
                                    const isLimitReached = promo.max_uses !== null && promo.uses_count >= promo.max_uses;

                                    return (
                                        <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 font-mono font-bold text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-violet-50 text-violet-700 px-3 py-1.5 rounded-lg border border-violet-100">
                                                        {promo.code}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-emerald-600">
                                                <div className="flex items-center gap-1">
                                                    <Percent className="w-4 h-4 text-emerald-500" />
                                                    <span>{promo.discount_percentage}% OFF</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 text-xs">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>From: {new Date(promo.valid_from).toLocaleDateString()} {new Date(promo.valid_from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>To: {new Date(promo.valid_until).toLocaleDateString()} {new Date(promo.valid_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-700 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {promo.uses_count} / {promo.max_uses === null ? '∞' : promo.max_uses}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 text-xs">
                                                {promo.courses_detail && promo.courses_detail.length > 0 ? (
                                                    <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium border border-blue-100">
                                                        {promo.courses_detail.length} Course(s)
                                                    </span>
                                                ) : (
                                                    <span className="inline-block bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium">
                                                        All Courses
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {isExpired ? (
                                                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                        <XCircle className="w-3.5 h-3.5" /> Expired
                                                    </span>
                                                ) : isLimitReached ? (
                                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Limit Reached
                                                    </span>
                                                ) : promo.is_active ? (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-bold">
                                                        <XCircle className="w-3.5 h-3.5" /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(promo)}
                                                        className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit Promo Code"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(promo.id, promo.code)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete Promo Code"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create / Edit Promo Code Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                            <div className="flex items-center gap-2">
                                <Tag className="w-5 h-5 text-violet-600" />
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingPromo ? `Edit Promo Code (${editingPromo.code})` : 'Create New Promo Code'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1">
                            {/* Code Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Promo Code Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. SAVE20 or SUMMER50"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold uppercase focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">Codes are automatically converted to uppercase.</p>
                            </div>

                            {/* Discount Percentage */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
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
                                        onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                </div>
                            </div>

                            {/* Validity Duration (Start & End) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Valid From *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={validFrom}
                                        onChange={(e) => setValidFrom(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Valid Until (Expiration) *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={validUntil}
                                        onChange={(e) => setValidUntil(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none"
                                    />
                                </div>
                            </div>

                            {/* Max Uses & Active status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Max Usage Limit (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Leave empty for unlimited"
                                        value={maxUses}
                                        onChange={(e) => setMaxUses(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none"
                                    />
                                </div>
                                <div className="pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="w-5 h-5 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
                                        />
                                        <span className="text-sm font-bold text-gray-800">Is Active</span>
                                    </label>
                                </div>
                            </div>

                            {/* Target Courses Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Restrict to Specific Courses (Optional)
                                </label>
                                <p className="text-xs text-gray-400 mb-2">If no courses are selected, promo code applies to ALL courses.</p>
                                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2">
                                    {courses.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No courses found</p>
                                    ) : (
                                        courses.map((c) => (
                                            <label key={c.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCourses.includes(c.id)}
                                                    onChange={() => toggleCourseSelection(c.id)}
                                                    className="w-4 h-4 text-violet-600 rounded border-gray-300"
                                                />
                                                <span className="line-clamp-1">{c.title}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all text-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {submitting ? 'Saving...' : editingPromo ? 'Update Promo Code' : 'Create Promo Code'}
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
