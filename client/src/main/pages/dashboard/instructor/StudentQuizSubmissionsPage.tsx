/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Search, Download, Mail, Phone,
    CheckCircle, Clock, Filter, AlertCircle,
    ShieldOff, Loader2, Trash2, Award, Eye,
} from 'lucide-react'
import { api, undisqualifyStudent, deleteQuizSubmission, getAnswerSheet } from '../../../../lib/api'
import { extractErrorMessage } from '../../../../lib/errorUtils'
import SEO from '../../../components/SEO'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { generateAnswerSheetPDF } from '../../../../lib/pdfUtilsInstructor'
import type { CourseDetail } from '../../../../types'

type StatusFilter = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'DISQUALIFIED'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DISQUALIFIED', label: 'Disqualified' },
]

export const StudentQuizSubmissionsPage: React.FC = () => {
    const { courseId, id, studentId } = useParams<{ courseId?: string; id?: string; studentId: string }>()
    const effectiveCourseId = courseId || id
    const navigate = useNavigate()

    const [course, setCourse] = useState<CourseDetail | null>(null)
    const [student, setStudent] = useState<any>(null)
    const [submissions, setSubmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
    const [undisqualifyingId, setUndisqualifyingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [downloadingId, setDownloadingId] = useState<string | null>(null)

    useEffect(() => {
        if (effectiveCourseId && studentId) {
            loadData()
        }
    }, [effectiveCourseId, studentId])

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            // 1. Course Details
            const courseRes = await api.get(`/courses/courses/${effectiveCourseId}/`)
            if (courseRes.data.success) {
                setCourse(courseRes.data.data)
            }

            // 2. Enrollment Data for student details
            const enrollRes = await api.get(`/enrollments/enrollments/`, {
                params: {
                    course: effectiveCourseId,
                    student: studentId,
                },
            })

            const enrollmentData = enrollRes.data?.results || enrollRes.data?.data || enrollRes.data
            const matchingEnrollment = Array.isArray(enrollmentData)
                ? enrollmentData.find((e: any) => e.student?.id === studentId || e.student === studentId || String(e.student?.id) === String(studentId))
                : enrollmentData

            if (matchingEnrollment) {
                setStudent(matchingEnrollment.student)
                if (matchingEnrollment.quiz_submissions) {
                    setSubmissions(matchingEnrollment.quiz_submissions)
                }
            }

            // 3. Fallback/Sync with direct submissions endpoint
            try {
                const subRes = await api.get(`/courses/my-quiz-submissions/`, {
                    params: {
                        quiz__course: effectiveCourseId,
                        student: studentId,
                    },
                })
                if (subRes.data.success && Array.isArray(subRes.data.data)) {
                    setSubmissions(subRes.data.data)
                    if (!matchingEnrollment && subRes.data.data.length > 0) {
                        const firstSub = subRes.data.data[0]
                        setStudent({
                            id: firstSub.student,
                            first_name: firstSub.student_name?.split(' ')[0] || '',
                            last_name: firstSub.student_name?.split(' ').slice(1).join(' ') || '',
                            email: firstSub.student_email,
                        })
                    }
                }
            } catch (err) {
                console.log('Submission query sync', err)
            }
        } catch (err) {
            setError(extractErrorMessage(err) || 'Failed to load quiz results')
        } finally {
            setLoading(false)
        }
    }

    const handleUndisqualify = async (submissionId: string, studentName: string) => {
        if (!window.confirm(`Un-disqualify ${studentName}? This will reset their warnings and allow them to retake the quiz.`)) return
        setUndisqualifyingId(submissionId)
        try {
            await undisqualifyStudent(submissionId)
            loadData()
        } catch (err) {
            console.error('Failed to un-disqualify student', err)
            alert('Failed to un-disqualify. Please try again.')
        } finally {
            setUndisqualifyingId(null)
        }
    }

    const handleDeleteSubmission = async (submissionId: string, quizTitle: string) => {
        if (!window.confirm(`Delete the quiz result for "${quizTitle}"? This cannot be undone.`)) return
        setDeletingId(submissionId)
        try {
            await deleteQuizSubmission(submissionId)
            setSubmissions(prev => prev.filter(s => s.id !== submissionId))
        } catch (err) {
            console.error('Failed to delete submission', err)
            alert('Failed to delete submission. Please try again.')
        } finally {
            setDeletingId(null)
        }
    }

    const handleDownloadPDF = async (submissionId: string, studentName: string) => {
        setDownloadingId(submissionId)
        try {
            const response = await getAnswerSheet(submissionId)
            if (!response.data.success) {
                throw new Error(response.data.error?.message || 'Failed to fetch answer sheet')
            }
            const data = response.data.data
            await generateAnswerSheetPDF(data, studentName)
        } catch (err) {
            console.error('Download error:', err)
            alert(extractErrorMessage(err) || 'Failed to download answer sheet')
        } finally {
            setDownloadingId(null)
        }
    }

    const studentFullName = student?.get_full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || student?.email || 'Student'

    const filteredSubmissions = submissions.filter(sub => {
        const title = (sub.quiz_title || sub.quiz?.title || '').toLowerCase()
        const matchesSearch = title.includes(searchTerm.toLowerCase())
        if (!matchesSearch) return false

        if (statusFilter === 'COMPLETED') return !!sub.completed_at && !sub.is_disqualified
        if (statusFilter === 'IN_PROGRESS') return !sub.completed_at && !sub.is_disqualified
        if (statusFilter === 'DISQUALIFIED') return !!sub.is_disqualified

        return true
    })

    const handleExportCSV = () => {
        const headers = ['Quiz Title', 'Score', 'Total Questions', 'Percentage', 'Status', 'Warnings', 'Started At', 'Completed At']
        const rows = filteredSubmissions.map(s => {
            const pct = s.total_questions > 0 ? ((s.score / s.total_questions) * 100).toFixed(1) : '0'
            const status = s.is_disqualified ? 'Disqualified' : s.completed_at ? 'Completed' : 'In Progress'
            return [
                s.quiz_title || s.quiz?.title || 'Quiz',
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
            download: `quiz_results_${studentFullName.replace(/\s+/g, '_')}.csv`,
            style: 'visibility:hidden',
        })
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const totalTaken = submissions.length
    const completedCount = submissions.filter(s => s.completed_at && !s.is_disqualified).length
    const inProgressCount = submissions.filter(s => !s.completed_at && !s.is_disqualified).length
    const totalScore = submissions.reduce((acc, curr) => acc + (curr.score || 0), 0)
    const totalQuestions = submissions.reduce((acc, curr) => acc + (curr.total_questions || 0), 0)
    const avgPercentage = totalQuestions > 0 ? ((totalScore / totalQuestions) * 100).toFixed(0) : '0'

    // ── shared tokens (matching EnrolledStudentsPage) ──────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm'
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100'

    if (loading && !course) return <LoadingSpinner fullscreen text="Loading quiz submissions..." />

    return (
        <div className="py-6 px-4 md:px-6 space-y-5">
            <SEO title={`Student Quiz Results - ${studentFullName} | ${course?.title || 'Course'}`} noindex />

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    <button
                        onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/students`)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Enrolled Students
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Student Quiz Results</h1>
                    {course && (
                        <p className="text-sm text-gray-400 mt-0.5 truncate">
                            {studentFullName} · {course.title}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer shrink-0"
                >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
            </div>

            {/* ── Student Header Card ── */}
            <div className={`${card} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div className="flex items-center gap-3">
                    {student?.profile_picture ? (
                        <img
                            src={student.profile_picture}
                            alt={studentFullName}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0">
                            {studentFullName.charAt(0)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{studentFullName}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            {student?.email && (
                                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                    <Mail className="w-3 h-3 shrink-0" />
                                    <span>{student.email}</span>
                                </div>
                            )}
                            {student?.phone_number && (
                                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                    <Phone className="w-3 h-3 shrink-0" />
                                    <span>{student.phone_number}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gray-50 text-gray-600 border border-gray-100">
                        Enrolled Student
                    </span>
                </div>
            </div>

            {/* ── Quick stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Quizzes', value: totalTaken, iconBg: 'bg-violet-50', iconText: 'text-violet-600', icon: Award },
                    { label: 'Completed', value: completedCount, iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', icon: CheckCircle },
                    { label: 'In Progress', value: inProgressCount, iconBg: 'bg-blue-50', iconText: 'text-blue-600', icon: Clock },
                    { label: 'Avg. Accuracy', value: `${avgPercentage}%`, iconBg: 'bg-purple-50', iconText: 'text-purple-600', icon: Award },
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
                        <p className="text-xs font-semibold text-rose-800">Failed to load quiz results</p>
                        <p className="text-xs text-rose-600 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* ── Table card ── */}
            <div className={card}>

                {/* Card header: search + filter */}
                <div className={`${cardHeader} flex-col sm:flex-row gap-3`}>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Quiz History</p>
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
                                {['Quiz', 'Score', 'Accuracy', 'Warnings', 'Status', ''].map(h => (
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
                            ) : filteredSubmissions.length > 0 ? (
                                filteredSubmissions.map(sub => {
                                    const quizId = (sub.quiz as any)?.id || sub.quiz
                                    const percentage = sub.total_questions > 0
                                        ? ((sub.score / sub.total_questions) * 100).toFixed(0)
                                        : '0'
                                    const pctNumber = parseFloat(percentage)
                                    const isComplete = !!sub.completed_at && !sub.is_disqualified

                                    return (
                                        <tr
                                            key={sub.id}
                                            onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/quizzes/${quizId}/submissions/${sub.id}`)}
                                            className="group hover:bg-gray-50/60 transition-colors duration-100 cursor-pointer"
                                        >
                                            {/* Quiz Title & Date */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-xs shrink-0 group-hover:bg-violet-100 transition-colors">
                                                        <Award className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 group-hover:text-violet-600 transition-colors truncate">
                                                            {sub.quiz_title || sub.quiz?.title || 'Quiz'}
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
                                                        onClick={() => handleUndisqualify(String(sub.id), studentFullName)}
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

                                            {/* Actions */}
                                            <td className="px-5 py-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* View Sheet */}
                                                    <button
                                                        onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/quizzes/${quizId}/submissions/${sub.id}`)}
                                                        title="View Full Result Sheet"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* PDF Download */}
                                                    {sub.completed_at && (
                                                        <button
                                                            onClick={() => handleDownloadPDF(sub.id, studentFullName)}
                                                            disabled={downloadingId === sub.id}
                                                            title="Download PDF Answer Sheet"
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
                                                        onClick={() => handleDeleteSubmission(sub.id, sub.quiz_title || sub.quiz?.title || 'Quiz')}
                                                        disabled={deletingId === sub.id}
                                                        title="Delete Result"
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
                                    <td colSpan={6} className="py-14 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <Award className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No quiz submissions found</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {searchTerm ? 'Try adjusting your search or filters' : 'This student has not taken any quizzes yet'}
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

export default StudentQuizSubmissionsPage
