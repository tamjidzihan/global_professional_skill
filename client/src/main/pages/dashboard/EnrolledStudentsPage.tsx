import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Users, ArrowLeft, Search, Download, Mail, Phone,
    Calendar, CheckCircle, Clock, Filter, AlertCircle,
} from 'lucide-react'
import { useEnrollments } from '../../../hooks/useEnrollments'
import { useCourses } from '../../../hooks/useCourses'
import { useAuth } from '../../../hooks/useAuth'
import SEO from '../../components/SEO'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

type StatusFilter = 'ALL' | 'COMPLETED' | 'IN_PROGRESS'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
]

export default function EnrolledStudentsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { course, fetchCourseDetail } = useCourses()
    const { enrollments, loading, error, fetchAllEnrollments } = useEnrollments()

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

    useEffect(() => {
        if (id) { fetchCourseDetail(id); fetchAllEnrollments({ course: id }) }
    }, [id, fetchCourseDetail, fetchAllEnrollments])

    useEffect(() => {
        if (course && user) {
            const allowed = user.role === 'ADMIN' || (user.role === 'INSTRUCTOR' && course.instructor.id === user.id)
            if (!allowed) navigate('/dashboard')
        }
    }, [course, user, navigate])

    const filteredEnrollments = enrollments.filter(e => {
        const matchSearch =
            e.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.student.email.toLowerCase().includes(searchTerm.toLowerCase())
        const pct = parseFloat(e.progress_percentage || '0')
        const done = pct >= 100
        const matchStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'COMPLETED' && done) ||
            (statusFilter === 'IN_PROGRESS' && !done)
        return matchSearch && matchStatus
    })

    const handleExport = () => {
        const headers = ['Student Name', 'Email', 'Phone', 'Enrollment Date', 'Progress', 'Completion Date']
        const rows = filteredEnrollments.map(e => [
            e.student_name, e.student.email, e.student.phone_number || 'N/A',
            new Date(e.enrolled_at).toLocaleDateString(),
            `${e.progress_percentage || 0}%`,
            e.completed_at ? new Date(e.completed_at).toLocaleDateString() : 'In Progress',
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })),
            download: `students_${course?.slug || 'course'}.csv`,
            style: 'visibility:hidden',
        })
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
    }

    const completedCount = enrollments.filter(e => parseFloat(e.progress_percentage || '0') >= 100).length
    const inProgressCount = enrollments.length - completedCount

    // ── shared tokens ──────────────────────────────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm'
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100'

    if (loading && !course) return <LoadingSpinner fullscreen text="Loading students..." />

    return (
        <div className="py-6 px-4 md:px-6 space-y-5">
            <SEO title={`Enrolled Students | ${course?.title || 'Course'}`} noindex />

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Course
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Enrolled Students</h1>
                    {course && (
                        <p className="text-sm text-gray-400 mt-0.5 truncate">
                            {course.title} · {course.enrollment_count} enrolled
                        </p>
                    )}
                </div>
                <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer shrink-0"
                >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
            </div>

            {/* ── Quick stats ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total', value: enrollments.length, iconBg: 'bg-violet-50', iconText: 'text-violet-600', icon: Users },
                    { label: 'In Progress', value: inProgressCount, iconBg: 'bg-blue-50', iconText: 'text-blue-600', icon: Clock },
                    { label: 'Completed', value: completedCount, iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', icon: CheckCircle },
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

            {/* ── Error state ── */}
            {error && (
                <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-rose-800">Failed to load students</p>
                        <p className="text-xs text-rose-600 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* ── Table card ── */}
            <div className={card}>

                {/* Card header: search + filter */}
                <div className={`${cardHeader} flex-col sm:flex-row gap-3`}>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Student List</p>
                        <p className="text-xs text-gray-400 mt-0.5">{filteredEnrollments.length} shown</p>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search name or email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44"
                            />
                        </div>
                        {/* Status dropdown */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                                className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                            >
                                {STATUS_TABS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Status tab pills */}
                <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-100 overflow-x-auto">
                    {STATUS_TABS.map(({ value, label }) => {
                        const active = statusFilter === value
                        return (
                            <button
                                key={value}
                                onClick={() => setStatusFilter(value)}
                                className={`inline-flex items-center px-3 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${active
                                    ? value === 'ALL'
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : value === 'COMPLETED'
                                            ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200 shadow-sm'
                                            : 'bg-blue-50 text-blue-700 ring-2 ring-blue-200 shadow-sm'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                    }`}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {['Student', 'Enrolled', 'Progress', 'Quiz Scores', 'Status', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-5 py-3">
                                            <div className="animate-pulse h-10 bg-gray-50 rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredEnrollments.length > 0 ? (
                                filteredEnrollments.map(enrollment => {
                                    const progress = parseFloat(enrollment.progress_percentage || '0')
                                    const isComplete = progress >= 100

                                    return (
                                        <tr key={enrollment.id} className="group hover:bg-gray-50/60 transition-colors duration-100">

                                            {/* Student */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {enrollment.student.profile_picture ? (
                                                        <img
                                                            src={enrollment.student.profile_picture}
                                                            alt={enrollment.student_name}
                                                            className="w-9 h-9 rounded-xl object-cover border border-gray-100 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0">
                                                            {enrollment.student_name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{enrollment.student_name}</p>
                                                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                                            <Mail className="w-3 h-3 shrink-0" />
                                                            <span className="truncate max-w-40">{enrollment.student.email}</span>
                                                        </div>
                                                        {enrollment.student.phone_number && (
                                                            <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                                                <Phone className="w-3 h-3 shrink-0" />
                                                                <span>{enrollment.student.phone_number}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Enrolled date */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                                    {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>

                                            {/* Progress */}
                                            <td className="px-5 py-3">
                                                <div className="flex flex-col gap-1 min-w-30">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-[11px] font-bold ${isComplete ? 'text-emerald-600' : 'text-violet-600'}`}>
                                                            {progress.toFixed(0)}%
                                                        </span>
                                                        <span className="text-[11px] text-gray-400">
                                                            {enrollment.completed_lessons || 0} lessons
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-violet-500'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Quiz Scores */}
                                            <td className="px-5 py-3 text-xs text-gray-700">
                                                {enrollment.quiz_submissions && enrollment.quiz_submissions.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {enrollment.quiz_submissions.map(sub => (
                                                            <div key={sub.id} className="flex items-center gap-1.5 font-medium">
                                                                <span className="text-gray-900 font-bold shrink-0">{sub.score} / {sub.total_questions}</span>
                                                                <span className="text-[10px] text-gray-400 truncate max-w-24" title={sub.quiz_title}>({sub.quiz_title})</span>
                                                                {sub.warnings_count > 0 && (
                                                                    <span
                                                                        className="inline-flex items-center gap-0.5 px-1 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-bold"
                                                                        title={`${sub.warnings_count} window focus warning(s)`}
                                                                    >
                                                                        ⚠️{sub.warnings_count}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {isComplete ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-md">
                                                        <CheckCircle className="w-3 h-3" /> Completed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-md">
                                                        <Clock className="w-3 h-3" /> In Progress
                                                    </span>
                                                )}
                                                {enrollment.completed_at && (
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        {new Date(enrollment.completed_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a
                                                        href={`mailto:${enrollment.student.email}`}
                                                        title="Send Email"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors"
                                                    >
                                                        <Mail className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-14 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <Users className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No students found</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {searchTerm ? 'Try adjusting your search or filters' : 'No students have enrolled yet'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}