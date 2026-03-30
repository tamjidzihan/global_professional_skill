import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    Tag,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useCategories } from '../../../../hooks/useCategories';
import type { Category } from '../../../../types';

export function CategoryTable() {
    const {
        categories,
        loading,
        submitting,
        error,
        fetchCategories,
        createCategoryAction,
        updateCategoryAction,
        deleteCategoryAction,
        pagination
    } = useCategories();

    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCategories({ search: searchQuery });
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await updateCategoryAction(editingCategory.id, formData);
            } else {
                await createCategoryAction(formData);
            }
            handleCloseModal();
            fetchCategories();
        } catch (err) {
            console.error('Operation failed:', err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCategoryAction(id);
            setShowDeleteConfirm(null);
            fetchCategories();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handlePageChange = (url: string | null) => {
        if (url) fetchCategories({}, url);
    };

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-50 focus:border-violet-300 transition-all"
                    />
                </form>

                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors shadow-sm cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Table Container */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Category Name</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Description</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center">Courses</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8 mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-16 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                                                <Tag className="w-6 h-6 text-gray-300" />
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">No categories found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                                                    <Tag className="w-4 h-4 text-violet-600" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-500 line-clamp-1 max-w-md">
                                                {cat.description || 'No description provided'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">
                                                {cat.course_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all cursor-pointer"
                                                    title="Edit Category"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(cat.id)}
                                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.count > 0 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Showing <span className="font-semibold text-gray-900">{categories.length}</span> of <span className="font-semibold text-gray-900">{pagination.count}</span> categories
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.previous)}
                                disabled={!pagination.previous}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.next)}
                                disabled={!pagination.next}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Upsert Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {editingCategory ? 'Modify existing category details' : 'Create a new course classification'}
                                </p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-violet-50 focus:border-violet-300 transition-all"
                                    placeholder="e.g. Graphic Design"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-violet-50 focus:border-violet-300 transition-all resize-none"
                                    placeholder="Describe this category..."
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 border border-transparent rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6 text-rose-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Category?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            This action cannot be undone. Any courses in this category will become uncategorized.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
                            >
                                No, Keep it
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
