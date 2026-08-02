import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNewsTickerItems } from '../../../../hooks/useNewsTickerItems';
import type { NewsTickerItem, NewsTickerItemCreateUpdateData } from '../../../../types';
import SEO from '../../../components/SEO';

const COLOR_OPTIONS = [
    'bg-[#3B5EF5]',
    'bg-[#FBBF24]',
    'bg-[#86EFAC]',
    'bg-[#C084FC]',
    'bg-[#FF5252]',
    'bg-[#10B981]',
    'bg-[#0EA5E9]',
];

const NewsTickerManagementPage: React.FC = () => {
    const {
        items,
        loading,
        fetchNewsTickerItems,
        addNewsTickerItem,
        editNewsTickerItem,
        removeNewsTickerItem,
    } = useNewsTickerItems();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsTickerItem | null>(null);
    const [formData, setFormData] = useState<NewsTickerItemCreateUpdateData>({
        text: '',
        link: null,
        color: 'bg-[#3B5EF5]',
        is_visible: true,
        order: 0,
        start_date: null,
        end_date: null,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const formModalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNewsTickerItems();
    }, [fetchNewsTickerItems]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formModalRef.current && !formModalRef.current.contains(event.target as Node)) {
                setIsModalOpen(false);
            }
        };
        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isModalOpen]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsModalOpen(false);
            }
        };
        if (isModalOpen) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isModalOpen]);

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            text: '',
            color: 'bg-[#3B5EF5]',
            is_visible: true,
            order: 0,
            start_date: null,
            end_date: null,
        });
    };

    const openModal = (item?: NewsTickerItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                text: item.text,
                link: item.link ?? null,
                color: item.color,
                is_visible: item.is_visible,
                order: item.order,
                start_date: item.start_date,
                end_date: item.end_date,
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const data: NewsTickerItemCreateUpdateData = {
            ...formData,
            link: formData.link || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
        };
        if (editingItem) {
            await editNewsTickerItem(editingItem.id, data);
        } else {
            await addNewsTickerItem(data);
        }
        setIsModalOpen(false);
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ticker item?')) return;
        await removeNewsTickerItem(id);
    };

    const filteredItems = items.filter(item =>
        item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.color.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title="News Ticker Management" noindex={true} />

            <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">News Ticker Management</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Manage messages that appear in the site-wide news ticker.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        New Ticker Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Total Items</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{items.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Visible</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{items.filter(i => i.is_visible).length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Scheduled</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{items.filter(i => i.start_date || i.end_date).length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Draft / Hidden</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{items.filter(i => !i.is_visible).length}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Ticker Items</p>
                        <p className="text-xs text-gray-400 mt-0.5">{filteredItems.length} of {items.length} items</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Search ticker items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-3 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44 md:w-64"
                    />
                </div>

                {loading ? (
                    <div className="py-20">
                        <div className="space-y-3 px-5">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Text</th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Link</th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Color</th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Visibility</th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Schedule</th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Order</th>
                                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="group hover:bg-gray-50/60 transition-colors duration-100">
                                            <td className="px-5 py-3 max-w-70 wrap-break-word">
                                                <div className="text-sm font-semibold text-gray-900">{item.text}</div>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-violet-600">
                                                {item.link ? (
                                                    <a href={item.link} target={item.link.startsWith('/') ? undefined : '_blank'} rel={item.link.startsWith('/') ? undefined : 'noreferrer'} className="underline hover:text-violet-700">
                                                        Open
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">None</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${item.color}`}>
                                                    <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                                                    {item.color}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {item.is_visible ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700">
                                                        <Eye className="w-3 h-3" /> Visible
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md bg-gray-100 text-gray-600">
                                                        <EyeOff className="w-3 h-3" /> Hidden
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-xs text-gray-500">
                                                {item.start_date || item.end_date ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span>{item.start_date ? format(parseISO(item.start_date), 'MMM dd, yyyy HH:mm') : 'Start immediately'}</span>
                                                        <span>{item.end_date ? format(parseISO(item.end_date), 'MMM dd, yyyy HH:mm') : 'No end date'}</span>
                                                    </div>
                                                ) : (
                                                    <span>Always active</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-600">{item.order}</td>
                                            <td className="px-5 py-3 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal(item)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-14 text-center text-sm text-gray-500">
                                            No news ticker items found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div ref={formModalRef} className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">{editingItem ? 'Edit' : 'New'} News Ticker Item</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{editingItem ? 'Update the ticker message' : 'Create a new ticker message'}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Message Text</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                    placeholder="Enter ticker message"
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Link</label>
                                <input
                                    type="url"
                                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                    placeholder="https://example.com/page"
                                    value={formData.link || ''}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value || null })}
                                />
                                <p className="mt-2 text-xs text-gray-400">Optional URL that opens when the ticker item is clicked.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Bullet Color</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {COLOR_OPTIONS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`h-10 rounded-xl border ${formData.color === color ? 'border-violet-600 shadow-sm' : 'border-gray-200'} flex items-center justify-center`}
                                            >
                                                <span className={`w-8 h-8 rounded-full ${color}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Details</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Order</label>
                                            <input
                                                type="number"
                                                min={0}
                                                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                                value={formData.order}
                                                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Visible</label>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_visible}
                                                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                                                    className="w-3.5 h-3.5 text-violet-600 rounded focus:ring-violet-500"
                                                />
                                                <span className="text-sm text-gray-700">Show item in ticker</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                        value={formData.start_date || ''}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">End Date</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                        value={formData.end_date || ''}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm"
                                >
                                    {editingItem ? 'Save Changes' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsTickerManagementPage;
