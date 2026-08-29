/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Download, CheckCircle, AlertTriangle, Clock,
    Award, Mail, User as UserIcon, ShieldOff, Check, X,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import SEO from '../../../components/SEO'
import { extractErrorMessage } from '../../../../lib/errorUtils'
import { api } from '../../../../lib/api'
import 'jspdf-autotable'
import type { CourseDetail } from '../../../../types'
import { downloadResultPDF } from '../../../../lib/pdfUtils'
import { useAuth } from '../../../../hooks/useAuth'

export const QuizResultDetailPage: React.FC = () => {
    const { courseId, submissionId, quizId, id } = useParams<{
        courseId?: string;
        id?: string;
        submissionId: string;
        quizId?: string;
    }>()
    const effectiveCourseId = courseId || id
    const navigate = useNavigate()
    const { user } = useAuth()
    const isInstructorOrAdmin = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN'

    const [course, setCourse] = useState<CourseDetail>()
    const [submission, setSubmission] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (submissionId) {
            loadSubmissionDetail()
        }
    }, [submissionId])

    useEffect(() => {
        if (effectiveCourseId) {
            loadCourseData()
        }
    }, [effectiveCourseId])

    const loadCourseData = async () => {
        try {
            const courseRes = await api.get(`/courses/courses/${effectiveCourseId}/`)
            if (courseRes.data.success) {
                setCourse(courseRes.data.data)
            }
        } catch (error) {
            console.error('Course load error:', error)
        }
    }

    const loadSubmissionDetail = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/courses/my-quiz-submissions/${submissionId}/`)
            if (res.data.success) {
                setSubmission(res.data.data)
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to load quiz result')
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        if (isInstructorOrAdmin) {
            const targetQuizId = quizId || submission?.quiz?.id || submission?.quiz
            if (targetQuizId && effectiveCourseId) {
                navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/quizzes/${targetQuizId}/submissions`)
            } else if (effectiveCourseId) {
                navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/quizzes`)
            } else {
                navigate(-1)
            }
        } else {
            navigate(`/dashboard/student/my-courses/${effectiveCourseId}/quizzes`)
        }
    }

    // ── shared tokens (matching EnrolledStudentsPage) ──────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm'
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100'

    if (loading) return <LoadingSpinner fullscreen text="Loading quiz result..." />

    if (!submission) {
        return (
            <div className="py-6 px-4 md:px-6 space-y-5">
                <div className={`${card} p-12 text-center max-w-lg mx-auto`}>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Quiz Result Not Found</h3>
                    <p className="text-xs text-gray-400 mb-5">The requested quiz submission could not be found or you do not have permission to view it.</p>
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> {isInstructorOrAdmin ? 'Back to Submissions' : 'Back to Quizzes'}
                    </button>
                </div>
            </div>
        )
    }

    const percentage = submission.total_questions > 0
        ? ((submission.score / submission.total_questions) * 100).toFixed(0)
        : '0'
    const pctNumber = parseFloat(percentage)
    const isComplete = !!submission.completed_at && !submission.is_disqualified

    // Calculate duration
    let durationText = 'N/A'
    if (submission.started_at && submission.completed_at) {
        const start = new Date(submission.started_at).getTime()
        const end = new Date(submission.completed_at).getTime()
        const minutes = Math.max(1, Math.round((end - start) / (1000 * 60)))
        durationText = `${minutes} min`
    } else if (submission.started_at) {
        durationText = 'In Progress'
    }

    const quizTitle = submission.quiz_title || submission.quiz?.title || 'Quiz'
    const studentName = submission.student_name || 'Student'

    return (
        <div className="py-6 px-4 md:px-6 space-y-5">
            <SEO title={`Quiz Result - ${quizTitle} | ${course?.title || 'Course'}`} noindex />

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> {isInstructorOrAdmin ? 'Back to Submissions' : 'Back to Quizzes'}
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Quiz Result</h1>
                    <p className="text-sm text-gray-400 mt-0.5 truncate">
                        {quizTitle} · {course?.title || 'Course'}
                    </p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        downloadResultPDF({
                            submission,
                            course,
                            api,
                        })
                    }}
                    disabled={!submission.completed_at}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
            </div>

            {/* ── Student Header Card (when viewed by Instructor / Admin) ── */}
            {isInstructorOrAdmin && (submission.student_name || submission.student_email) && (
                <div className={`${card} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0">
                            {studentName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{studentName}</p>
                            {submission.student_email && (
                                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                    <Mail className="w-3 h-3 shrink-0" />
                                    <span>{submission.student_email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gray-50 text-gray-600 border border-gray-100">
                            <UserIcon className="w-3 h-3 text-gray-400" /> Student Submission
                        </span>
                    </div>
                </div>
            )}

            {/* ── Disqualification Alert ── */}
            {submission.is_disqualified && (
                <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <ShieldOff className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-rose-800">Disqualified from Quiz</p>
                        <p className="text-xs text-rose-600 mt-0.5">
                            {submission.disqualification_reason || 'This quiz attempt was disqualified due to tab focus warnings or proctoring rules.'}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Quick stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    {
                        label: 'Score',
                        value: `${submission.score || 0} / ${submission.total_questions || 0}`,
                        iconBg: 'bg-violet-50',
                        iconText: 'text-violet-600',
                        icon: Award,
                    },
                    {
                        label: 'Accuracy',
                        value: `${percentage}%`,
                        iconBg: pctNumber >= 70 ? 'bg-emerald-50' : pctNumber >= 40 ? 'bg-blue-50' : 'bg-rose-50',
                        iconText: pctNumber >= 70 ? 'text-emerald-600' : pctNumber >= 40 ? 'text-blue-600' : 'text-rose-600',
                        icon: CheckCircle,
                    },
                    {
                        label: 'Duration',
                        value: durationText,
                        iconBg: 'bg-blue-50',
                        iconText: 'text-blue-600',
                        icon: Clock,
                    },
                    {
                        label: 'Warnings',
                        value: submission.warnings_count || 0,
                        iconBg: submission.warnings_count > 0 ? 'bg-amber-50' : 'bg-gray-50',
                        iconText: submission.warnings_count > 0 ? 'text-amber-600' : 'text-gray-400',
                        icon: AlertTriangle,
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

            {/* ── Attempt Summary Details ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`${card} p-4 space-y-2.5`}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Timeline</p>
                    <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-gray-600">
                            <span className="text-gray-400">Started:</span>
                            <span className="font-medium text-gray-800">
                                {submission.started_at ? new Date(submission.started_at).toLocaleString() : 'N/A'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                            <span className="text-gray-400">Completed:</span>
                            <span className="font-medium text-gray-800">
                                {submission.completed_at ? new Date(submission.completed_at).toLocaleString() : 'In Progress'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={`${card} p-4 space-y-2.5`}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Status</p>
                    <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Result:</span>
                            {submission.is_disqualified ? (
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
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                            <span className="text-gray-400">Proctoring Strikes:</span>
                            <span className="font-medium text-gray-800">
                                {submission.warnings_count || 0} strike(s)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Detailed Question Breakdown Section ── */}
            {submission.questions && submission.questions.length > 0 && (
                <div className={card}>
                    <div className={cardHeader}>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Detailed Question Breakdown</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {submission.questions.length} question{submission.questions.length === 1 ? '' : 's'} with student answers and correct answers
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                {submission.score} / {submission.total_questions} Correct
                            </span>
                        </div>
                    </div>

                    <div className="p-5 space-y-4 divide-y divide-gray-100">
                        {(submission.shuffled_question_ids || submission.questions.map((q: any) => q.id)).map((questionId: string, index: number) => {
                            const question = submission.questions.find((q: any) => q.id === questionId)
                            if (!question) return null

                            const studentAnswer = submission.student_answers?.find(
                                (ans: any) => ans.question_id === question.id
                            )
                            const selectedOption = studentAnswer?.selected_option || null
                            const correctOption = question.correct_option
                            const isCorrect = selectedOption === correctOption

                            const options = [
                                { label: 'A', text: question.option_a },
                                { label: 'B', text: question.option_b },
                                { label: 'C', text: question.option_c },
                                { label: 'D', text: question.option_d },
                            ]

                            return (
                                <div key={question.id} className={index === 0 ? '' : 'pt-4'}>
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className="w-6 h-6 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {question.question_text}
                                            </p>
                                        </div>
                                        {selectedOption && (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                {isCorrect ? 'Correct' : 'Incorrect'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 ml-9">
                                        {options.map((opt) => {
                                            const isSelected = opt.label === selectedOption
                                            const isCorrectOption = opt.label === correctOption

                                            let containerStyle = 'bg-gray-50/70 border-gray-100 text-gray-700'
                                            let labelStyle = 'text-gray-500 font-semibold'

                                            if (isCorrectOption && isSelected) {
                                                containerStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-200'
                                                labelStyle = 'text-emerald-700 font-bold'
                                            } else if (isCorrectOption && !isSelected) {
                                                containerStyle = 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                                                labelStyle = 'text-emerald-700 font-bold'
                                            } else if (isSelected && !isCorrectOption) {
                                                containerStyle = 'bg-rose-50 border-rose-200 text-rose-800'
                                                labelStyle = 'text-rose-700 font-bold'
                                            }

                                            return (
                                                <div
                                                    key={opt.label}
                                                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${containerStyle}`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className={`w-5 shrink-0 ${labelStyle}`}>{opt.label}.</span>
                                                        <span className="truncate">{opt.text}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                        {isCorrectOption && isSelected && (
                                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold text-[10px]">
                                                                <Check className="w-2.5 h-2.5" /> Your Answer (Correct)
                                                            </span>
                                                        )}
                                                        {isCorrectOption && !isSelected && (
                                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-700 font-semibold text-[10px]">
                                                                Correct Answer
                                                            </span>
                                                        )}
                                                        {isSelected && !isCorrectOption && (
                                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold text-[10px]">
                                                                <X className="w-2.5 h-2.5" /> Your Answer
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default QuizResultDetailPage
