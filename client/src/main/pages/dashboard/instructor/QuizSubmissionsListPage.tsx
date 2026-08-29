/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCourses } from '../../../../hooks/useCourses'
import {
    getQuizDetail, getQuizSubmissionsForInstructor, getAnswerSheet,
    undisqualifyStudent, deleteQuizSubmission,
} from '../../../../lib/api'
import {
    ArrowLeft, Download, CheckCircle, Clock,
    Award, Search, Filter, AlertTriangle, ShieldOff,
    Eye, Trash2, Loader2, Mail, FileText,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import SEO from '../../../components/SEO'
import { extractErrorMessage } from '../../../../lib/errorUtils'
import { downloadSubmissionsListPDF, generateAnswerSheetPDF } from '../../../../lib/pdfUtilsInstructor'

type StatusFilter = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'DISQUALIFIED'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DISQUALIFIED', label: 'Disqualified' },
]

export const QuizSubmissionsListPage: React.FC = () => {
    const { courseId, quizId, id } = useParams<{ courseId?: string; quizId?: string; id?: string }>()
    const effectiveCourseId = courseId || id
    const effectiveQuizId = quizId
    const navigate = useNavigate()
    const { course, fetchCourseDetail, loading: courseLoading } = useCourses()

    const [quiz, setQuiz] = useState<any>(null)
    const [submissions, setSubmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

    const [downloadingId, setDownloadingId] = useState<string | null>(null)
    const [undisqualifyingId, setUndisqualifyingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        if (effectiveCourseId) {
            fetchCourseDetail(effectiveCourseId).catch((err) => console.log('Course load err', err))
        }
        if (effectiveCourseId && effectiveQuizId) {
            loadData()
        }
    }, [effectiveCourseId, effectiveQuizId])

    const loadData = async () => {
        setLoading(true)
        try {
            const quizRes = await getQuizDetail(effectiveCourseId!, effectiveQuizId!)
            if (quizRes.data.success) {
                setQuiz(quizRes.data.data)
            }
            const subRes = await getQuizSubmissionsForInstructor(effectiveCourseId!, effectiveQuizId!)
            if (subRes.data.success) {
                setSubmissions(subRes.data.data || [])
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to load submissions')
        } finally {
            setLoading(false)
        }
    }

    const downloadListPDF = () => {
        downloadSubmissionsListPDF({
            quizTitle: quiz?.title || 'Unknown Quiz',
            courseTitle: course?.title || '',
            submissions: submissions,
        })
    }

    const downloadStudentAnswerSheet = async (submissionId: string, studentName: string) => {
        setDownloadingId(submissionId)
        try {
            const response = await getAnswerSheet(submissionId)
            if (!response.data.success) {
                throw new Error(response.data.error?.message || 'Failed to fetch answer sheet')
            }
            const data = response.data.data
            await generateAnswerSheetPDF(data, studentName)
        } catch (error) {
            console.error('Download error:', error)
            toast.error(extractErrorMessage(error) || 'Failed to download answer sheet')
        } finally {
            setDownloadingId(null)
        }
    }

    const handleUndisqualify = async (submissionId: string, studentName: string) => {
        if (!window.confirm(`Un-disqualify ${studentName}? This will reset their warnings and allow them to retake.`)) return
        setUndisqualifyingId(submissionId)
        try {
            await undisqualifyStudent(submissionId)
            toast.success(`${studentName} un-disqualified successfully`)
            loadData()
        } catch (err) {
            console.error('Failed to un-disqualify student', err)
            toast.error('Failed to un-disqualify. Please try again.')
        } finally {
            setUndisqualifyingId(null)
        }
    }

    const handleDeleteSubmission = async (submissionId: string, studentName: string) => {
        if (!window.confirm(`Permanently delete the submission for "${studentName}"? This cannot be undone.`)) return
        setDeletingId(submissionId)
        try {
            await deleteQuizSubmission(submissionId)
            toast.success('Submission deleted')
            setSubmissions(prev => prev.filter(s => s.id !== submissionId))
        } catch (err) {
            console.error('Failed to delete submission', err)
            toast.error('Failed to delete submission')
        } finally {
            setDeletingId(null)
        }
    }

    // Calculations
    const totalTaken = submissions.length
    const completedCount = submissions.filter(s => s.completed_at && !s.is_disqualified).length
    const inProgressCount = submissions.filter(s => !s.completed_at && !s.is_disqualified).length
    const disqualifiedCount = submissions.filter(s => s.is_disqualified).length
    const totalScore = submissions.reduce((acc, curr) => acc + (curr.score || 0), 0)
    const totalQuestions = submissions.reduce((acc, curr) => acc + (curr.total_questions || 0), 0)
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0

    // Filtered submissions
    const filteredSubmissions = submissions.filter(sub => {
        const name = (sub.student_name || '').toLowerCase()
        const email = (sub.student_email || '').toLowerCase()
        const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
        if (!matchesSearch) return false

        if (statusFilter === 'COMPLETED') return !!sub.completed_at && !sub.is_disqualified
        if (statusFilter === 'IN_PROGRESS') return !sub.completed_at && !sub.is_disqualified
        if (statusFilter === 'DISQUALIFIED') return !!sub.is_disqualified

        return true
    })

    const handleExportCSV = () => {
        const headers = ['Student Name', 'Email', 'Score', 'Total Questions', 'Percentage', 'Status', 'Warnings', 'Started At', 'Completed At']
        const rows = filteredSubmissions.map(s => {
            const pct = s.total_questions > 0 ? ((s.score / s.total_questions) * 100).toFixed(1) : '0'
            const status = s.is_disqualified ? 'Disqualified' : s.completed_at ? 'Completed' : 'In Progress'
            return [
                s.student_name || 'N/A',
                s.student_email || 'N/A',
                s.score,
                s.total_questions,
                `${pct}%`,
                status,
                s.warnings_count || 0,
                s.started_at ? new Date(s.started_at).toLocaleString() : 'N/A',
                s.completed_at ? new Date(s.completed_at).toLocaleString() : 'N/A',
            ]
        })
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })),
            download: `quiz_submissions_${quiz?.title?.replace(/\s+/g, '_') || 'quiz'}.csv`,
            style: 'visibility:hidden',
        })
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // ── shared design tokens ────────────────────────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm'
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100'

    if (courseLoading || loading) return <LoadingSpinner fullscreen text="Loading quiz submissions..." />

    return (
        <div className="py-6 px-4 md:px-6 space-y-5">
            <SEO title={`Quiz Submissions - ${quiz?.title || 'Quiz'} | ${course?.title || 'Course'}`} noindex />

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    <button
                        onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/quizzes`)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Quizzes
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Quiz Submissions</h1>
                    <p className="text-sm text-gray-400 mt-0.5 truncate">
                        {quiz?.title || 'Quiz'} · {course?.title || 'Course'}
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                    <button
                        onClick={downloadListPDF}
                        disabled={submissions.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <FileText className="w-3.5 h-3.5" /> Download List (PDF)
                    </button>
                </div>
            </div>

            {/* ── Quick stats (4 columns) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Submissions', value: totalTaken, iconBg: 'bg-violet-50', iconText: 'text-violet-600', icon: Award },
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
                        <p className="text-sm font-semibold text-gray-900">Student Submissions</p>
                        <p className="text-xs text-gray-400 mt-0.5">{filteredSubmissions.length} shown</p>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search student name or email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-48"
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
                                {['Student', 'Score', 'Accuracy', 'Warnings', 'Status', 'Started', 'Completed', ''].map(h => (
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
                                            onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/quizzes/${effectiveQuizId}/submissions/${sub.id}`)}
                                            className="group hover:bg-gray-50/60 transition-colors duration-100 cursor-pointer"
                                        >
                                            {/* Student info */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-xs shrink-0 group-hover:bg-violet-100 transition-colors">
                                                        {sub.student_name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 group-hover:text-violet-600 transition-colors truncate">
                                                            {sub.student_name || 'Student'}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                                            <Mail className="w-3 h-3 shrink-0" />
                                                            <span className="truncate max-w-44">{sub.student_email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Score */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {sub.score !== null ? `${sub.score} / ${sub.total_questions || '?'}` : '—'}
                                                </div>
                                            </td>

                                            {/* Accuracy */}
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
                                            <td className="px-5 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                                {sub.is_disqualified ? (
                                                    <button
                                                        onClick={() => handleUndisqualify(String(sub.id), sub.student_name)}
                                                        disabled={undisqualifyingId === String(sub.id)}
                                                        title="Click to un-disqualify"
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md border border-rose-100 cursor-pointer disabled:opacity-50"
                                                    >
                                                        {undisqualifyingId === String(sub.id) ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <ShieldOff className="w-3 h-3" />
                                                        )}
                                                        Disqualified
                                                    </button>
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

                                            {/* Started At */}
                                            <td className="px-5 py-3 whitespace-nowrap text-xs text-gray-500">
                                                {sub.started_at ? new Date(sub.started_at).toLocaleString() : '—'}
                                            </td>

                                            {/* Completed At */}
                                            <td className="px-5 py-3 whitespace-nowrap text-xs text-gray-500">
                                                {sub.completed_at ? new Date(sub.completed_at).toLocaleString() : '—'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* View Sheet */}
                                                    <button
                                                        onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/quizzes/${effectiveQuizId}/submissions/${sub.id}`)}
                                                        title="View Full Result Sheet"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* PDF Download */}
                                                    {sub.completed_at && (
                                                        <button
                                                            onClick={() => downloadStudentAnswerSheet(sub.id, sub.student_name)}
                                                            disabled={downloadingId === sub.id}
                                                            title="Download PDF"
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-50"
                                                        >
                                                            {downloadingId === sub.id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Download className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    )}

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDeleteSubmission(sub.id, sub.student_name)}
                                                        disabled={deletingId === sub.id}
                                                        title="Delete Submission"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                                                    >
                                                        {deletingId === sub.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-14 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <AlertTriangle className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No submissions found</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {searchTerm ? 'Try adjusting your search or filters' : 'No students have submitted this quiz yet.'}
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

export default QuizSubmissionsListPage
