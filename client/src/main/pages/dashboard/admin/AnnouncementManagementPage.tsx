import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Clock, ChevronRight, X, Megaphone } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAnnouncements } from '../../../../hooks/useAnnouncements';
import type { Announcement, AnnouncementCreateUpdateData } from '../../../../types';
import RichTextEditor from '../../../components/RichTextEditor';
import SEO from '../../../components/SEO';
import AnnouncementDetailModal from '../../../components/dashboard/admin/AnnouncementDetailModal';
import { Link } from 'react-router-dom';

const AnnouncementManagementPage: React.FC = () => {
    const {
        announcements,
        loading,
        fetchAnnouncements,
        addAnnouncement,
        editAnnouncement,
        removeAnnouncement
    } = useAnnouncements();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState<AnnouncementCreateUpdateData>({
        title: '',
        content: '',
        is_visible: true,
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const handleOpenModal = (ann?: Announcement) => {
        if (ann) {
            setEditingAnnouncement(ann);
            setFormData({
                title: ann.title,
                content: ann.content,
                is_visible: ann.is_visible,
                start_date: ann.start_date ? format(parseISO(ann.start_date), "yyyy-MM-dd'T'HH:mm") : '',
                end_date: ann.end_date ? format(parseISO(ann.end_date), "yyyy-MM-dd'T'HH:mm") : ''
            });
        } else {
            setEditingAnnouncement(null);
            setFormData({
                title: '',
                content: '',
                is_visible: true,
                start_date: '',
                end_date: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data: AnnouncementCreateUpdateData = {
            ...formData,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null
        };

        let success;
        if (editingAnnouncement) {
            success = await editAnnouncement(editingAnnouncement.id, data);
        } else {
            success = await addAnnouncement(data);
        }

        if (success) {
            setIsModalOpen(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        await removeAnnouncement(id);
    };

    const filteredAnnouncements = announcements.filter(ann =>
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content.replace(/<[^>]*>/g, '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const stats = [
        {
            label: 'Total Announcements',
            value: announcements.length,
            icon: Megaphone,
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-500',
        },
        {
            label: 'Visible',
            value: announcements.filter(ann => ann.is_visible).length,
            icon: Eye,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
        },
        {
            label: 'Hidden',
            value: announcements.filter(ann => !ann.is_visible).length,
            icon: EyeOff,
            iconBg: 'bg-gray-50',
            iconColor: 'text-gray-500',
        },
        {
            label: 'Scheduled',
            value: announcements.filter(ann => ann.start_date).length,
            icon: Clock,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-500',
        },
    ];

    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title="Announcement Management" noindex={true} />

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Announcement Management</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Create and manage site-wide announcements for students and instructors.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        New Announcement
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-medium">{label}</p>
                                <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
                            </div>
                            <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                                <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Announcements</p>
                        <p className="text-xs text-gray-400 mt-0.5">{filteredAnnouncements.length} of {announcements.length} announcements</p>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search announcements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-3 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44 md:w-64"
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="py-20">
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="px-5 py-3 border-b border-gray-50">
                                    <div className="animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-1/4 bg-gray-100 rounded" />
                                                <div className="h-3 w-2/3 bg-gray-100 rounded" />
                                            </div>
                                            <div className="w-20 h-6 bg-gray-100 rounded" />
                                            <div className="w-32 h-6 bg-gray-100 rounded" />
                                            <div className="w-24 h-6 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        Announcement
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        Visibility
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        Schedule
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        Created
                                    </th>
                                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredAnnouncements.length > 0 ? (
                                    filteredAnnouncements.map((ann) => (
                                        <tr key={ann.id} className="group hover:bg-gray-50/60 transition-colors duration-100">
                                            <td className="px-5 py-3">
                                                <div className="min-w-50">
                                                    <Link
                                                        to={`/dashboard/announcements/${ann.id}`}
                                                        className="text-sm cursor-pointer font-semibold text-gray-800 hover:text-violet-600 transition-colors text-left"
                                                    >
                                                        {ann.title}
                                                    </Link>
                                                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                                        {ann.content.replace(/<[^>]*>/g, '').substring(0, 80)}
                                                        {ann.content.replace(/<[^>]*>/g, '').length > 80 ? '...' : ''}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {ann.is_visible ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700">
                                                        <Eye className="w-3 h-3" /> Visible
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md bg-gray-100 text-gray-600">
                                                        <EyeOff className="w-3 h-3" /> Hidden
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {ann.start_date ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                        <Clock className="w-3 h-3 text-gray-400" />
                                                        <span>{format(parseISO(ann.start_date), 'MMM dd, HH:mm')}</span>
                                                        <ChevronRight className="w-2.5 h-2.5 text-gray-300" />
                                                        <span>{ann.end_date ? format(parseISO(ann.end_date), 'MMM dd, HH:mm') : '∞'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Always active</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <span className="text-xs text-gray-500">
                                                    {format(parseISO(ann.created_at), 'MMM dd, yyyy')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleOpenModal(ann)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ann.id)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-14 text-center">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                                <Megaphone className="w-5 h-5 text-gray-300" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-500">No announcements found</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {searchTerm ? 'Try adjusting your search' : 'Create your first announcement to get started'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                {filteredAnnouncements.length > 0 && !loading && (
                    <div className="px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Showing {filteredAnnouncements.length} of {announcements.length} announcements
                        </p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && viewingAnnouncement && (
                <AnnouncementDetailModal
                    announcement={viewingAnnouncement}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setViewingAnnouncement(null);
                    }}
                />
            )}

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    {editingAnnouncement ? 'Edit' : 'New'} Announcement
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {editingAnnouncement ? 'Update announcement details' : 'Create a new site-wide announcement'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                    placeholder="Enter announcement title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                                    Content
                                </label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Display Schedule
                                    </label>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Start Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                                value={formData.start_date || ''}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">End Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                                value={formData.end_date || ''}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Settings
                                    </label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <input
                                            type="checkbox"
                                            id="is_visible"
                                            className="w-3.5 h-3.5 text-violet-600 rounded focus:ring-violet-500"
                                            checked={formData.is_visible}
                                            onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                                        />
                                        <label htmlFor="is_visible" className="text-xs font-medium text-gray-700 cursor-pointer">
                                            Visible to students and instructors
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm"
                                >
                                    {editingAnnouncement ? 'Save Changes' : 'Create Announcement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementManagementPage;