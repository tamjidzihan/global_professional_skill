/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react'
import {
    Plus, Edit2, Trash2, Eye, EyeOff, Bell, ArrowLeft, Clock,
    X, User, Search, AlertCircle,
    CheckCircle, Clock as ClockIcon, Calendar as CalendarIcon,
    Link2
} from 'lucide-react'
import { format, parseISO, isAfter, isBefore } from 'date-fns'
import { useLocation, Link } from 'react-router-dom'
import { useCourseAnnouncements } from '../../../../hooks/useCourseAnnouncements'
import { useCourses } from '../../../../hooks/useCourses'
import type { CourseAnnouncement, CourseAnnouncementCreateUpdateData } from '../../../../types'
import { extractErrorMessage } from '../../../../lib/errorUtils'
import { toast } from 'react-hot-toast'
import SEO from '../../../components/SEO'

const emptyForm: CourseAnnouncementCreateUpdateData = {
    title: '',
    content: '',
    is_visible: true,
    start_date: null,
    end_date: null,
}

// Status badge component
const StatusBadge: React.FC<{ announcement: CourseAnnouncement }> = ({ announcement }) => {
    const now = new Date()
    const startDate = announcement.start_date ? parseISO(announcement.start_date) : null
    const endDate = announcement.end_date ? parseISO(announcement.end_date) : null

    if (!announcement.is_visible) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                <EyeOff className="w-3 h-3" />
                Hidden
            </span>
        )
    }

    if (startDate && isAfter(startDate, now)) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                <ClockIcon className="w-3 h-3" />
                Scheduled
            </span>
        )
    }

    if (endDate && isBefore(endDate, now)) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                <AlertCircle className="w-3 h-3" />
                Expired
            </span>
        )
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Active
        </span>
    )
}

// Date range display component
const DateRangeDisplay: React.FC<{ startDate: string | null; endDate: string | null }> = ({
    startDate,
    endDate
}) => {
    if (!startDate && !endDate) {
        return <span className="text-xs text-gray-400">Always active</span>
    }

    const start = startDate ? format(parseISO(startDate), 'MMM d, yyyy') : 'Start'
    const end = endDate ? format(parseISO(endDate), 'MMM d, yyyy') : 'End'

    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <CalendarIcon className="w-3 h-3 text-gray-400" />
            <span>{start}</span>
            <span className="text-gray-300">→</span>
            <span>{end}</span>
        </div>
    )
}

const AdminCourseAnnouncementsPage: React.FC = () => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const courseIdQuery = searchParams.get('courseId') || ''

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAnnouncement, setEditingAnnouncement] = useState<CourseAnnouncement | null>(null)
    const [selectedCourseId, setSelectedCourseId] = useState<string>(courseIdQuery)
    const [formData, setFormData] = useState<CourseAnnouncementCreateUpdateData>(emptyForm)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCourseId, setFilterCourseId] = useState<string>(courseIdQuery)
    const [filterStatus, setFilterStatus] = useState<string>('all')

    const formModalRef = useRef<HTMLDivElement>(null)

    const {
        announcements,
        loading: announcementsLoading,
        fetchCourseAnnouncements,
        addCourseAnnouncement,
        editCourseAnnouncement,
        removeCourseAnnouncement,
    } = useCourseAnnouncements()

    const {
        courses,
        fetchCourses,
    } = useCourses()

    useEffect(() => {
        fetchCourseAnnouncements()
        fetchCourses()
    }, [fetchCourseAnnouncements, fetchCourses])

    useEffect(() => {
        if (courseIdQuery) {
            setFilterCourseId(courseIdQuery)
            setSelectedCourseId(courseIdQuery)
        }
    }, [courseIdQuery])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formModalRef.current && !formModalRef.current.contains(event.target as Node)) {
                setIsModalOpen(false)
            }
        }

        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isModalOpen])

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsModalOpen(false)
            }
        }

        if (isModalOpen) {
            document.addEventListener('keydown', handleEsc)
        }

        return () => document.removeEventListener('keydown', handleEsc)
    }, [isModalOpen])

    const resetForm = () => {
        setEditingAnnouncement(null)
        setFormData(emptyForm)
        setSelectedCourseId(courseIdQuery)
    }

    const openModal = (announcement?: CourseAnnouncement) => {
        if (announcement) {
            setEditingAnnouncement(announcement)
            setSelectedCourseId(announcement.course)
            setFormData({
                title: announcement.title,
                content: announcement.content,
                is_visible: announcement.is_visible,
                start_date: announcement.start_date,
                end_date: announcement.end_date,
            })
        } else {
            resetForm()
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!editingAnnouncement && !selectedCourseId) {
            toast.error('Please select a course for this announcement.')
            return
        }

        const payload: CourseAnnouncementCreateUpdateData = {
            ...formData,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
        }

        try {
            if (editingAnnouncement) {
                await editCourseAnnouncement(editingAnnouncement.id, payload)
                toast.success('Course announcement updated successfully')
            } else {
                await addCourseAnnouncement(selectedCourseId, payload)
                toast.success('Course announcement created successfully')
            }
            setIsModalOpen(false)
            resetForm()
            await fetchCourseAnnouncements()
        } catch (err: any) {
            toast.error(extractErrorMessage(err))
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return
        try {
            await removeCourseAnnouncement(id)
            toast.success('Announcement deleted successfully')
        } catch (err: any) {
            toast.error(extractErrorMessage(err))
        }
    }

    // Filter logic
    const getAnnouncementStatus = (ann: CourseAnnouncement) => {
        const now = new Date()
        const startDate = ann.start_date ? parseISO(ann.start_date) : null
        const endDate = ann.end_date ? parseISO(ann.end_date) : null

        if (!ann.is_visible) return 'hidden'
        if (startDate && isAfter(startDate, now)) return 'scheduled'
        if (endDate && isBefore(endDate, now)) return 'expired'
        return 'active'
    }

    const filteredAnnouncements = announcements
        .filter((ann) => {
            const searchMatch =
                ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ann.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ann.course_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ann.created_by_detail?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())

            const courseMatch = filterCourseId ? ann.course === filterCourseId : true
            const statusMatch = filterStatus === 'all' ? true : getAnnouncementStatus(ann) === filterStatus

            return searchMatch && courseMatch && statusMatch
        })

    const stats = {
        total: announcements.length,
        visible: announcements.filter(a => a.is_visible).length,
        hidden: announcements.filter(a => !a.is_visible).length,
        active: announcements.filter(a => getAnnouncementStatus(a) === 'active').length,
        scheduled: announcements.filter(a => getAnnouncementStatus(a) === 'scheduled').length,
        expired: announcements.filter(a => getAnnouncementStatus(a) === 'expired').length,
    }

    const truncateUrl = (url: string) => {
        if (!url) return '';
        return url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');
    }
    return (
        <div className="min-h-screen bg-gray-50/50 py-6 px-4 md:px-6">
            <SEO title="Course Announcements" noindex={true} />

            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Course Announcements</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage announcements for enrolled students across all courses
                        </p>
                        {courseIdQuery && (
                            <Link
                                to={`/dashboard/admin/courses/${courseIdQuery}`}
                                className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 hover:underline mt-2 transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Return to course details
                            </Link>
                        )}
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        New Announcement
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                    { label: 'Total', value: stats.total, icon: Bell, color: 'violet' },
                    { label: 'Active', value: stats.active, icon: CheckCircle, color: 'emerald' },
                    { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'blue' },
                    { label: 'Expired', value: stats.expired, icon: AlertCircle, color: 'amber' },
                    { label: 'Visible', value: stats.visible, icon: Eye, color: 'green' },
                    { label: 'Hidden', value: stats.hidden, icon: EyeOff, color: 'gray' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm px-4 py-3.5 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                                <p className="text-xl font-bold mt-0.5 text-gray-900">{value}</p>
                            </div>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-${color}-50`}>
                                <Icon className={`w-4 h-4 text-${color}-600`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-gray-900">All Announcements</p>
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            {filteredAnnouncements.length}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search announcements..."
                                className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50/50 transition-all cursor-text"
                            />
                        </div>
                        <select
                            value={filterCourseId}
                            onChange={(e) => setFilterCourseId(e.target.value)}
                            className="w-full sm:w-48 px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">All courses</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full sm:w-40 px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">All status</option>
                            <option value="active">Active</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="expired">Expired</option>
                            <option value="hidden">Hidden</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {announcementsLoading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Announcement</th>
                                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Course</th>
                                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Schedule</th>
                                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Created By</th>
                                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAnnouncements.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Bell className="w-12 h-12 text-gray-300" />
                                                <p className="text-sm text-gray-500">No announcements found</p>
                                                <p className="text-xs text-gray-400">Try adjusting your filters or create a new announcement</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAnnouncements.map((announcement) => (
                                    <tr key={announcement.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="max-w-xs">
                                                <p className="text-sm font-medium text-gray-900 truncate">{announcement.title}</p>
                                                {/* Announcement content as clickable link */}
                                                <a
                                                    href={announcement.content}
                                                    target={announcement.content.startsWith('/') ? undefined : '_blank'}
                                                    rel={announcement.content.startsWith('/') ? undefined : 'noreferrer'}
                                                    className=" inline-flex items-center gap-1.5 text-xs text-gray-500 mt-1 line-clamp-2 hover:text-violet-600 hover:underline transition-colors cursor-pointer "
                                                >
                                                    <Link2 className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{truncateUrl(announcement.content)}</span>
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-gray-700">
                                                {announcement.course_title || 'Unknown Course'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge announcement={announcement} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <DateRangeDisplay
                                                startDate={announcement.start_date}
                                                endDate={announcement.end_date}
                                            />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                                                    <User className="w-3.5 h-3.5 text-violet-600" />
                                                </div>
                                                <span className="text-sm text-gray-700">
                                                    {announcement.created_by_detail?.full_name || 'System'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openModal(announcement)}
                                                    className="p-1.5 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors cursor-pointer"
                                                    aria-label="Edit announcement"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(announcement.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                                    aria-label="Delete announcement"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div
                        ref={formModalRef}
                        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Announcements are visible to enrolled students only
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Course <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        disabled={!!editingAnnouncement}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                        <option value="">Select a course</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Visibility</label>
                                    <select
                                        value={formData.is_visible ? 'visible' : 'hidden'}
                                        onChange={(e) => setFormData((prev) => ({
                                            ...prev,
                                            is_visible: e.target.value === 'visible',
                                        }))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                                    >
                                        <option value="visible">Visible</option>
                                        <option value="hidden">Hidden</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-text"
                                    placeholder="Enter announcement title"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.content}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 resize-none transition-all cursor-text"
                                    placeholder="Write the announcement details here..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.start_date || ''}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value || null }))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.end_date || ''}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value || null }))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                                >
                                    {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminCourseAnnouncementsPage