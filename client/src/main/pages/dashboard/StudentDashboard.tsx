import { useEffect, useState } from 'react'
import { StatsCard } from '../../components/dashboard/StatsCard'
import {
    BookOpen, CheckCircle, Clock, Award, Briefcase,
    Sparkles, AlertCircle, PlayCircle, CreditCard,
    ArrowRight, Hash, ShieldAlert
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../../context/AuthContext'
import { useEnrollments } from '../../../hooks/useEnrollments'
import { usePayments } from '../../../hooks/usePayments'
import { useInstructorRequests } from '../../../hooks/useInstructorRequests'
import CalendarCard from '../../components/dashboard/CalendarCard'
import SEO from '../../components/SEO'
import { getMyQuizSubmissions } from '../../../lib/api'
import type { QuizSubmission } from '../../../types'

export function StudentDashboard() {
    const { user } = useAuthContext()
    const { enrollments, getMyEnrollments, loading } = useEnrollments()
    const { payments, fetchPayments } = usePayments()
    const { requests, loading: requestsLoading, error: requestsError } = useInstructorRequests()

    const [submissions, setSubmissions] = useState<QuizSubmission[]>([])
    const [loadingSubmissions, setLoadingSubmissions] = useState(true)

    useEffect(() => {
        getMyEnrollments()
        fetchPayments({ status: 'PENDING' })

        const fetchSubmissions = async () => {
            try {
                const res = await getMyQuizSubmissions();
                if (res.data.success && Array.isArray(res.data.data)) {
                    setSubmissions(res.data.data);
                }
            } catch (error) {
                console.error("Failed to load submissions", error);
            } finally {
                setLoadingSubmissions(false);
            }
        };
        fetchSubmissions();
    }, [getMyEnrollments, fetchPayments])

    const totalEnrolled = enrollments?.length || 0
    const completed = enrollments?.filter(e => Number(e?.progress_percentage) === 100).length || 0
    const inProgress = totalEnrolled - completed
    const pendingPayments = payments?.filter(p => p.status === 'PENDING').length || 0

    // Instructor request status config
    const requestStatusConfig: Record<string, { badge: string; iconBg: string; iconText: string; icon: typeof Clock; label: string }> = {
        PENDING: { badge: 'bg-amber-50 text-amber-700', iconBg: 'bg-amber-50', iconText: 'text-amber-500', icon: Clock, label: 'Pending Review' },
        APPROVED: { badge: 'bg-emerald-50 text-emerald-700', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', icon: CheckCircle, label: 'Approved' },
        REJECTED: { badge: 'bg-rose-50 text-rose-700', iconBg: 'bg-rose-50', iconText: 'text-rose-500', icon: AlertCircle, label: 'Rejected' },
    }

    // ── shared tokens ──────────────────────────────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm'
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100'
    const cardBody = 'p-5'

    const latestRequest = requests
        ?.slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

    return (
        <div className="py-6 px-4 md:px-6 grid grid-cols-1 lg:grid-cols-4 gap-5">
            <SEO title="Student Dashboard" noindex />

            {/* ════════════════════════════
                MAIN COLUMN
            ════════════════════════════ */}
            <div className="lg:col-span-3 space-y-6">

                {/* Page header */}
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                        Welcome back, {user?.first_name || 'Student'}!
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Here's an overview of your learning progress.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatsCard title="Enrolled" value={totalEnrolled} icon={BookOpen} color="blue" />
                    <StatsCard title="In Progress" value={inProgress} icon={Clock} color="orange" />
                    <StatsCard title="Pending Payments" value={pendingPayments} icon={CreditCard} color="orange" />
                    <StatsCard title="Certificates" value={completed} icon={Award} color="blue" />
                </div>

                {/* ── Pending Payments ── */}
                {payments && payments.length > 0 && (
                    <div className={card}>
                        <div className={cardHeader}>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Pending Enrollments</p>
                                <p className="text-xs text-gray-400 mt-0.5">Awaiting payment verification</p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-700 rounded-md">
                                <Clock className="w-3 h-3" /> {payments.length}
                            </span>
                        </div>
                        <div className={cardBody}>
                            <div className="space-y-2">
                                {payments.map(payment => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50/20 transition-all duration-150"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-10 h-10 rounded-lg bg-amber-50 overflow-hidden shrink-0">
                                            {payment.course_thumbnail ? (
                                                <img src={payment.course_thumbnail} alt={payment.course_title} className="w-full h-full object-cover opacity-80" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="w-4 h-4 text-amber-500" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{payment.course_title}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-xs text-gray-400">{payment.currency} {payment.amount}</span>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-white border border-gray-100 px-1.5 py-0.5 rounded-md font-mono">
                                                    <Hash className="w-2.5 h-2.5" />{payment.transaction_id}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badge */}
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-md shrink-0">
                                            <Clock className="w-2.5 h-2.5" /> Pending
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-400 flex items-start gap-1.5">
                                    <span className="shrink-0 mt-px">ℹ️</span>
                                    Our team is verifying your payment. You'll get access once approved.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Recent Courses ── */}
                <div className={card}>
                    <div className={cardHeader}>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Recent Courses</p>
                            <p className="text-xs text-gray-400 mt-0.5">Pick up where you left off</p>
                        </div>
                        <Link
                            to="/dashboard/student/my-courses"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                        >
                            View All <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className={cardBody}>
                        {loading ? (
                            <div className="space-y-2.5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse h-18 bg-gray-50 rounded-lg border border-gray-100" />
                                ))}
                            </div>
                        ) : enrollments && enrollments.length > 0 ? (
                            <div className="space-y-2.5">
                                {enrollments.slice(0, 3).map(enrollment => {
                                    const pct = Math.round(Number(enrollment?.progress_percentage) || 0)
                                    return (
                                        <div
                                            key={enrollment?.id}
                                            className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-violet-200 hover:bg-violet-50/20 transition-all duration-150"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                                {enrollment.course.thumbnail ? (
                                                    <img src={enrollment.course.thumbnail} alt={enrollment.course.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-violet-50 flex items-center justify-center">
                                                        <BookOpen className="w-5 h-5 text-violet-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info + progress */}
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/dashboard/student/my-courses/${enrollment.course.id}`}>
                                                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-violet-700 transition-colors">
                                                        {enrollment?.course?.title || 'Course Title'}
                                                    </p>
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-violet-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-gray-500 shrink-0">{pct}%</span>
                                                </div>
                                            </div>

                                            {/* CTA */}
                                            <Link
                                                to={`/dashboard/student/my-courses/${enrollment.course.id}`}
                                                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <PlayCircle className="w-3.5 h-3.5" /> Continue
                                            </Link>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                                    <BookOpen className="w-5 h-5 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-500">No courses yet</p>
                                <p className="text-xs text-gray-400 mt-0.5 mb-4">Start your learning journey today!</p>
                                <Link
                                    to="/courses"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                                >
                                    Browse Courses <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Recent Quiz Submissions ── */}
                <div className={card}>
                    <div className={cardHeader}>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Recent Quiz Results</p>
                            <p className="text-xs text-gray-400 mt-0.5">Your exam performances and grades</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                            <Award className="w-4 h-4 text-violet-600" />
                        </div>
                    </div>
                    <div className={cardBody}>
                        {loadingSubmissions ? (
                            <div className="space-y-2.5">
                                {[1, 2].map(i => (
                                    <div key={i} className="animate-pulse h-16 bg-gray-50 rounded-lg border border-gray-100" />
                                ))}
                            </div>
                        ) : submissions && submissions.length > 0 ? (
                            <div className="space-y-2.5">
                                {submissions.slice(0, 5).map(sub => {
                                    const scorePct = sub.total_questions > 0 ? (sub.score / sub.total_questions) * 100 : 0;
                                    const passed = scorePct >= 50;

                                    return (
                                        <div
                                            key={sub.id}
                                            className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{sub.quiz_title}</p>
                                                <p className="text-xs text-gray-400 truncate mt-0.5">{sub.course_title}</p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                {sub.warnings_count > 0 && (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-md"
                                                        title={`${sub.warnings_count} window focus warnings during quiz`}
                                                    >
                                                        <ShieldAlert className="w-2.5 h-2.5" />
                                                        {sub.warnings_count}
                                                    </span>
                                                )}

                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${
                                                    passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                                }`}>
                                                    Score: {sub.score} / {sub.total_questions}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <p className="text-xs font-medium text-gray-400">No quizzes completed yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ════════════════════════════
                SIDEBAR COLUMN
            ════════════════════════════ */}
            <div className="lg:col-span-1 space-y-5">
                <CalendarCard />

                {/* Instructor application status */}
                <div className={card}>
                    <div className={cardHeader}>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Instructor Status</p>
                            <p className="text-xs text-gray-400 mt-0.5">Application overview</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4 text-violet-600" />
                        </div>
                    </div>
                    <div className={cardBody}>
                        {requestsLoading ? (
                            <div className="space-y-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="animate-pulse h-10 bg-gray-50 rounded-lg border border-gray-100" />
                                ))}
                            </div>
                        ) : requestsError ? (
                            <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                <p className="text-xs text-rose-700">Failed to load status</p>
                            </div>
                        ) : latestRequest ? (() => {
                            const cfg = requestStatusConfig[latestRequest.status] || requestStatusConfig['PENDING']
                            const Icon = cfg.icon
                            return (
                                <div className="space-y-3">
                                    {/* Status row */}
                                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${cfg.badge}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                                            <Icon className={`w-4 h-4 ${cfg.iconText}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60">Status</p>
                                            <p className="text-sm font-bold">{cfg.label}</p>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-gray-400">
                                        Submitted {new Date(latestRequest.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>

                                    {latestRequest.status === 'REJECTED' && (
                                        <div className="space-y-2">
                                            {latestRequest.review_notes && (
                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Reason</p>
                                                    <p className="text-xs text-gray-600">{latestRequest.review_notes}</p>
                                                </div>
                                            )}
                                            <Link
                                                to="/apply-as-instructor"
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                                            >
                                                Re-apply as Instructor <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )
                        })() : (
                            <div className="flex flex-col items-center text-center py-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
                                    <Sparkles className="w-5 h-5 text-violet-500" />
                                </div>
                                <p className="text-sm font-semibold text-gray-800 mb-0.5">Become an Instructor</p>
                                <p className="text-xs text-gray-400 mb-4">Share your knowledge and earn by teaching.</p>
                                <Link
                                    to="/apply-as-instructor"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                                >
                                    Apply as Instructor <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}