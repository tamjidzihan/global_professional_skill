/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Download, CheckCircle, Clock,
    Award, Search, Filter, AlertTriangle, ShieldOff, Eye,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import SEO from '../../../components/SEO'
import { extractErrorMessage } from '../../../../lib/errorUtils'
import { api } from '../../../../lib/api'
import type { QuizSubmission, CourseDetail } from '../../../../types'
import { downloadResultPDF } from '../../../../lib/pdfUtils'

type StatusFilter = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'DISQUALIFIED'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DISQUALIFIED', label: 'Disqualified' },
]

export const StudentQuizResultsPage: React.FC = () => {
    const { courseId, id } = useParams<{ courseId?: string; id?: string }>()
    const effectiveCourseId = courseId || id
    const navigate = useNavigate()

    const [course, setCourse] = useState<CourseDetail | null>(null)
    const [submissions, setSubmissions] = useState<QuizSubmission[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
    const [downloadingId, setDownloadingId] = useState<string | null>(null)

    useEffect(() => {
        if (effectiveCourseId) {
            loadData()
        }
    }, [effectiveCourseId])

    const loadData = async () => {
        setLoading(true)
        try {
            const courseRes = await api.get(`/courses/courses/${effectiveCourseId}/`)
            if (courseRes.data.success) {
                setCourse(courseRes.data.data)
            }
            const submissionsRes = await api.get('/courses/my-quiz-submissions/', {
                params: { quiz__course: effectiveCourseId }
            })
            if (submissionsRes.data.success) {
                const list = submissionsRes.data.data || []
                const courseSubmissions = list.filter((sub: any) => {
                    const subCourseId = sub.course || sub.quiz?.course?.id || sub.quiz?.course
                    return !effectiveCourseId || subCourseId === effectiveCourseId || String(subCourseId) === String(effectiveCourseId)
                })
                setSubmissions(courseSubmissions.length > 0 ? courseSubmissions : list)
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to load quiz results')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadPDF = async (submission: QuizSubmission) => {
        setDownloadingId(String(submission.id))
        try {
            await downloadResultPDF({
                submission,
                course: course || undefined,
                api,
            })
        } catch (error) {
            console.error('PDF download error:', error)
            toast.error('Failed to download PDF')
        } finally {
            setDownloadingId(null)
        }
    }

    // Calculations
    const totalTaken = submissions.length
    const completedCount = submissions.filter(s => s.completed_at && !s.is_disqualified).length
    const inProgressCount = submissions.filter(s => !s.completed_at && !s.is_disqualified).length
    const disqualifiedCount = submissions.filter(s => s.is_disqualified).length
    const totalScoreAchieved = submissions.reduce((acc, curr) => acc + (curr.score || 0), 0)
    const totalQuestionsPossible = submissions.reduce((acc, curr) => acc + (curr.total_questions || 0), 0)
    const avgAccuracy = totalQuestionsPossible > 0 ? Math.round((totalScoreAchieved / totalQuestionsPossible) * 100) : 0

    // Filtered list
    const filteredSubmissions = submissions.filter(sub => {
        const title = (sub.quiz_title || '').toLowerCase()
        const matchesSearch = title.includes(searchTerm.toLowerCase())
        if (!matchesSearch) return false

        if (statusFilter === 'COMPLETED') return !!sub.completed_at && !sub.is_disqualified
        if (statusFilter === 'IN_PROGRESS') return !sub.completed_at && !sub.is_disqualified
        if (statusFilter === 'DISQUALIFIED') return !!sub.is_disqualified

        return true
    })

    // ── shared tokens (matching design system) ──────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm'
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100'

    if (loading && !course) return <LoadingSpinner fullscreen text="Loading quiz results..." />

    return (
        <div className="py-6 px-4 md:px-6 space-y-5">
            <SEO title={`My Quiz Results | ${course?.title || 'Course'}`} noindex />

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    <button
                        onClick={() => navigate(`/dashboard/student/my-courses/${effectiveCourseId}`)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Course
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">My Quiz Results</h1>
                    {course && (
                        <p className="text-sm text-gray-400 mt-0.5 truncate">
                            {course.title} · Assessment history and performance
                        </p>
                    )}
                </div>
                <button
                    onClick={() => navigate(`/dashboard/student/my-courses/${effectiveCourseId}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer shrink-0"
                >
                    View Course
                </button>
            </div>

            {/* ── Quick stats (4 columns) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Attempts', value: totalTaken, iconBg: 'bg-violet-50', iconText: 'text-violet-600', icon: Award },
                    { label: 'Completed', value: completedCount, iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', icon: CheckCircle },
                    { label: 'Avg. Accuracy', value: `${avgAccuracy}%`, iconBg: 'bg-blue-50', iconText: 'text-blue-600', icon: Award },
                    {
                        label: disqualifiedCount > 0 ? 'Disqualified' : 'In Progress',
                        value: disqualifiedCount > 0 ? `${disqualifiedCount} attempts` : inProgressCount,
                        iconBg: disqualifiedCount > 0 ? 'bg-rose-50' : 'bg-amber-50',
                        iconText: disqualifiedCount > 0 ? 'text-rose-600' : 'text-amber-600',
                        icon: disqualifiedCount > 0 ? ShieldOff : Clock,
                    },
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

                {/* Card header: search + filter */}
                <div className={`${cardHeader} flex-col sm:flex-row gap-3`}>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Quiz Attempts</p>
                        <p className="text-xs text-gray-400 mt-0.5">{filteredSubmissions.length} shown</p>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search quiz title..."
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
                                            : value === 'IN_PROGRESS'
                                                ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-200 shadow-sm'
                                                : 'bg-rose-50 text-rose-700 ring-2 ring-rose-200 shadow-sm'
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
                                {['Quiz', 'Score', 'Accuracy', 'Warnings', 'Status', 'Date', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSubmissions.length > 0 ? (
                                filteredSubmissions.map(sub => {
                                    const percentage = sub.total_questions > 0
                                        ? ((sub.score / sub.total_questions) * 100).toFixed(0)
                                        : '0'
                                    const pctNumber = parseFloat(percentage)
                                    const isComplete = !!sub.completed_at && !sub.is_disqualified

                                    return (
                                        <tr
                                            key={sub.id}
                                            onClick={() => navigate(`/dashboard/student/my-courses/${effectiveCourseId}/quizzes/${sub.id}`)}
                                            className="group hover:bg-gray-50/60 transition-colors duration-100 cursor-pointer"
                                        >
                                            {/* Quiz Title */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-xs shrink-0 group-hover:bg-violet-100 transition-colors">
                                                        <Award className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 group-hover:text-violet-600 transition-colors truncate">
                                                            {sub.quiz_title || 'Quiz'}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                                            {sub.completed_at
                                                                ? new Date(sub.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                : sub.started_at
                                                                    ? `Started: ${new Date(sub.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                                                    : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Score */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {sub.score !== null ? `${sub.score} / ${sub.total_questions}` : '—'}
                                                </div>
                                            </td>

                                            {/* Accuracy Progress */}
                                            <td className="px-5 py-3">
                                                <div className="flex flex-col gap-1 min-w-28">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-[11px] font-bold ${pctNumber >= 70 ? 'text-emerald-600' : pctNumber >= 40 ? 'text-blue-600' : 'text-rose-600'}`}>
                                                            {percentage}%
                                                        </span>
                                                        <span className="text-[11px] text-gray-400">
                                                            {sub.score} correct
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${pctNumber >= 70 ? 'bg-emerald-500' : pctNumber >= 40 ? 'bg-blue-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${Math.min(100, Math.max(0, pctNumber))}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Warnings */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {sub.warnings_count > 0 ? (
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold">
                                                        ⚠️ {sub.warnings_count} strike{sub.warnings_count > 1 ? 's' : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">None</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {sub.is_disqualified ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-700 rounded-md border border-rose-100">
                                                        <ShieldOff className="w-3 h-3" /> Disqualified
                                                    </span>
                                                ) : isComplete ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-md">
                                                        <CheckCircle className="w-3 h-3" /> Completed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-md">
                                                        <Clock className="w-3 h-3" /> In Progress
                                                    </span>
                                                )}
                                            </td>

                                            {/* Date */}
                                            <td className="px-5 py-3 whitespace-nowrap text-xs text-gray-500">
                                                {sub.completed_at ? new Date(sub.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/student/my-courses/${effectiveCourseId}/quizzes/${sub.id}`)}
                                                        title="View Result Sheet"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    {sub.completed_at && (
                                                        <button
                                                            onClick={() => handleDownloadPDF(sub)}
                                                            disabled={downloadingId === String(sub.id)}
                                                            title="Download PDF"
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-50"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-14 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <AlertTriangle className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No quiz attempts found</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {searchTerm ? 'Try adjusting your search or filter' : "You haven't taken any quizzes for this course yet."}
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

export default StudentQuizResultsPage
