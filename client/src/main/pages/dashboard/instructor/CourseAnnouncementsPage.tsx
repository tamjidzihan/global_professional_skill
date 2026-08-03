/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCourseAnnouncements } from '../../../../hooks/useCourseAnnouncements';
import { useCourses } from '../../../../hooks/useCourses';
import type { CourseAnnouncement, CourseAnnouncementCreateUpdateData } from '../../../../types';
import { extractErrorMessage } from '../../../../lib/errorUtils';
import { toast } from 'react-hot-toast';
import SEO from '../../../components/SEO';
import { format, parseISO } from 'date-fns';

const emptyForm: CourseAnnouncementCreateUpdateData = {
    title: '',
    content: '',
    is_visible: true,
    start_date: null,
    end_date: null,
};

const CourseAnnouncementsPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { course, fetchCourseDetail, clearStates } = useCourses();
    const {
        announcements,
        loading: announcementsLoading,
        fetchCourseAnnouncementsByCourse,
        addCourseAnnouncement,
        editCourseAnnouncement,
        removeCourseAnnouncement,
    } = useCourseAnnouncements();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<CourseAnnouncement | null>(null);
    const [formData, setFormData] = useState<CourseAnnouncementCreateUpdateData>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const formModalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!courseId) return;
        fetchCourseDetail(courseId);
        fetchCourseAnnouncementsByCourse(courseId);
        return () => clearStates();
    }, [courseId, fetchCourseDetail, fetchCourseAnnouncementsByCourse, clearStates]);

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
        setEditingAnnouncement(null);
        setFormData(emptyForm);
    };

    const openModal = (announcement?: CourseAnnouncement) => {
        if (announcement) {
            setEditingAnnouncement(announcement);
            setFormData({
                title: announcement.title,
                content: announcement.content,
                is_visible: announcement.is_visible,
                start_date: announcement.start_date,
                end_date: announcement.end_date,
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!courseId) return;

        setSubmitting(true);
        try {
            const payload: CourseAnnouncementCreateUpdateData = {
                ...formData,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
            };
            if (editingAnnouncement) {
                await editCourseAnnouncement(editingAnnouncement.id, payload);
                toast.success('Announcement updated!');
            } else {
                await addCourseAnnouncement(courseId, payload);
                toast.success('Announcement published!');
            }
            setIsModalOpen(false);
            resetForm();
            await fetchCourseAnnouncementsByCourse(courseId);
        } catch (error: any) {
            toast.error(extractErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (announcementId: string) => {
        if (!confirm('Delete this announcement?')) return;
        if (!courseId) return;
        const success = await removeCourseAnnouncement(announcementId);
        if (success) fetchCourseAnnouncementsByCourse(courseId);
    };

    const filteredAnnouncements = announcements.filter(ann =>
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.created_by_detail?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const visibleCount = announcements.filter(a => a.is_visible).length;
    const scheduledCount = announcements.filter(a => a.start_date || a.end_date).length;
    const hiddenCount = announcements.filter(a => !a.is_visible).length;

    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title="Course Announcements" noindex={true} />

            {/* ── Page header ── */}
            <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <Link
                            to={`/dashboard/instructor/my-courses/${courseId}`}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-2"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course
                        </Link>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Course Announcements</h1>
                        <p className="text-sm text-gray-400 mt-0.5 truncate max-w-sm">
                            {course?.title || 'Loading...'}
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        New Announcement
                    </button>
                </div>
            </div>

            {/* ── Stats cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Total Announcements</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{announcements.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Visible</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{visibleCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Scheduled</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{scheduledCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Hidden</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{hiddenCount}</p>
                </div>
            </div>

            {/* ── Announcements table ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Announcements</p>
                        <p className="text-xs text-gray-400 mt-0.5">{filteredAnnouncements.length} of {announcements.length} items</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-3 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44 md:w-64"
                    />
                </div>

                {announcementsLoading ? (
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
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Title</th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Link</th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Visibility</th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Schedule</th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Created By</th>
                                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredAnnouncements.length > 0 ? (
                                    filteredAnnouncements.map((ann) => (
                                        <tr key={ann.id} className="group hover:bg-gray-50/60 transition-colors duration-100">
                                            <td className="px-5 py-3 max-w-70 wrap-break-word">
                                                <div className="text-sm font-semibold text-gray-900">{ann.title}</div>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-violet-600">
                                                {ann.content ? (
                                                    <a href={ann.content} target={ann.content.startsWith('/') ? undefined : '_blank'} rel={ann.content.startsWith('/') ? undefined : 'noreferrer'} className="underline hover:text-violet-700">
                                                        {ann.content.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">None</span>
                                                )}
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
                                            <td className="px-5 py-3 whitespace-nowrap text-xs text-gray-500">
                                                {ann.start_date || ann.end_date ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span>{ann.start_date ? format(parseISO(ann.start_date), 'MMM dd, yyyy') : 'No start date'}</span>
                                                        <span>{ann.end_date ? format(parseISO(ann.end_date), 'MMM dd, yyyy') : 'No end date'}</span>
                                                    </div>
                                                ) : (
                                                    <span>Always active</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {ann.created_by_detail?.full_name || ann.created_by || 'Unknown'}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal(ann)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(ann.id)}
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
                                            No announcements found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Modal Form ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div ref={formModalRef} className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    {editingAnnouncement ? 'Edit' : 'New'} Announcement
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {editingAnnouncement ? 'Update the announcement details' : 'Post an announcement to enrolled students'}
                                </p>
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
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                                    Title <span className="text-rose-400 normal-case">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                    placeholder="e.g., Important update about upcoming classes"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            {/* Link */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Link</label>
                                <input
                                    type="url"
                                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                    placeholder="https://example.com/page"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                />
                                <p className="mt-2 text-xs text-gray-400">URL that students will be directed to when they click the announcement.</p>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                        value={formData.start_date || ''}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                                        value={formData.end_date || ''}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                                    />
                                </div>
                            </div>

                            {/* Visibility */}
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_visible"
                                        checked={formData.is_visible}
                                        onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                                        className="w-3.5 h-3.5 mt-0.5 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
                                    />
                                    <label htmlFor="is_visible" className="cursor-pointer">
                                        <p className="text-sm font-medium text-gray-800">Visible to students</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Enrolled students will see this announcement</p>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={submitting}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {editingAnnouncement ? 'Update' : 'Publish'}
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
};

export default CourseAnnouncementsPage;