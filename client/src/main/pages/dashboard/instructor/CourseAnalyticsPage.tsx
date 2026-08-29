/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    ArrowLeft, Users, DollarSign, CheckCircle, Clock,
    Award, BarChart2, Download,
    Search, Filter, ChevronRight, Layers, FileText,
    AlertCircle, AlertTriangle, ShieldOff, Eye, Megaphone,
    TrendingUp,
} from 'lucide-react'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
    AreaChart,
    Area,
} from 'recharts'
import { api } from '../../../../lib/api'
import { extractErrorMessage } from '../../../../lib/errorUtils'
import SEO from '../../../components/SEO'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import type { CourseDetail } from '../../../../types'
import { useAuth } from '../../../../hooks/useAuth'

type TabType = 'OVERVIEW' | 'STUDENTS' | 'QUIZZES'

export const CourseAnalyticsPage: React.FC = () => {
    const { id, courseId } = useParams<{ id?: string; courseId?: string }>()
    const effectiveCourseId = id || courseId
    const navigate = useNavigate()
    const { user } = useAuth()

    const [course, setCourse] = useState<CourseDetail | null>(null)
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [submissions, setSubmissions] = useState<any[]>([])
    const [materialsCount, setMaterialsCount] = useState<number>(0)
    const [announcementsCount, setAnnouncementsCount] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW')
    const [studentSearch, setStudentSearch] = useState<string>('')
    const [studentStatusFilter, setStudentStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS'>('ALL')

    useEffect(() => {
        if (effectiveCourseId) {
            loadAllAnalytics()
        }
    }, [effectiveCourseId])

    const loadAllAnalytics = async () => {
        setLoading(true)
        setError(null)
        try {
            // 1. Course Details
            const courseRes = await api.get(`/courses/courses/${effectiveCourseId}/`)
            if (courseRes.data.success) {
                const c = courseRes.data.data
                setCourse(c)

                // Permission check
                if (user && user.role === 'INSTRUCTOR' && c.instructor?.id !== user.id) {
                    navigate('/dashboard/instructor/my-courses')
                    return
                }
            }

            // 2. Enrollments with progress & quiz submissions
            try {
                const enrollRes = await api.get(`/enrollments/enrollments/`, {
                    params: { course: effectiveCourseId },
                })
                const enrollData = enrollRes.data?.results || enrollRes.data?.data || enrollRes.data
                if (Array.isArray(enrollData)) {
                    setEnrollments(enrollData)
                }
            } catch (err) {
                console.error('Enrollments fetch error:', err)
            }

            // 3. Quizzes
            try {
                const quizRes = await api.get(`/courses/quizzes/`, {
                    params: { course: effectiveCourseId },
                })
                const qData = quizRes.data?.results || quizRes.data?.data || quizRes.data
                if (Array.isArray(qData)) {
                    setQuizzes(qData)
                }
            } catch (err) {
                console.error('Quizzes fetch error:', err)
            }

            // 4. Submissions
            try {
                const subRes = await api.get(`/courses/my-quiz-submissions/`, {
                    params: { quiz__course: effectiveCourseId },
                })
                const sData = subRes.data?.results || subRes.data?.data || subRes.data
                if (Array.isArray(sData)) {
                    setSubmissions(sData)
                }
            } catch (err) {
                console.error('Submissions fetch error:', err)
            }

            // 5. Materials count
            try {
                const matRes = await api.get(`/courses/course-materials/`, {
                    params: { course: effectiveCourseId },
                })
                const mData = matRes.data?.results || matRes.data?.data || matRes.data
                if (Array.isArray(mData)) {
                    setMaterialsCount(mData.length)
                }
            } catch (err) {
                console.error('Materials fetch error:', err)
            }

            // 6. Announcements count
            try {
                const annRes = await api.get(`/courses/announcements/`, {
                    params: { course: effectiveCourseId },
                })
                const aData = annRes.data?.results || annRes.data?.data || annRes.data
                if (Array.isArray(aData)) {
                    setAnnouncementsCount(aData.length)
                }
            } catch (err) {
                console.error('Announcements fetch error:', err)
            }

        } catch (err) {
            setError(extractErrorMessage(err) || 'Failed to load course analytics')
        } finally {
            setLoading(false)
        }
    }

    // Calculations & Metrics
    const totalStudents = enrollments.length || course?.enrollment_count || 0
    const priceNum = parseFloat(course?.price || '0')
    const totalRevenue = totalStudents * priceNum

    const completedEnrollments = enrollments.filter(e => parseFloat(e.progress_percentage || '0') >= 100)
    const inProgressEnrollments = enrollments.filter(e => parseFloat(e.progress_percentage || '0') < 100)
    const completionRate = totalStudents > 0 ? Math.round((completedEnrollments.length / totalStudents) * 100) : 0

    // Quiz metrics
    const totalAttempts = submissions.length
    const totalScoreAchieved = submissions.reduce((acc, curr) => acc + (curr.score || 0), 0)
    const totalPossibleScore = submissions.reduce((acc, curr) => acc + (curr.total_questions || 0), 0)
    const avgQuizAccuracy = totalPossibleScore > 0 ? Math.round((totalScoreAchieved / totalPossibleScore) * 100) : 0
    const totalWarnings = submissions.reduce((acc, curr) => acc + (curr.warnings_count || 0), 0)
    const disqualifiedCount = submissions.filter(s => s.is_disqualified).length

    // Progress buckets
    const bucket100 = completedEnrollments.length
    const bucket75 = enrollments.filter(e => {
        const p = parseFloat(e.progress_percentage || '0')
        return p >= 75 && p < 100
    }).length
    const bucket50 = enrollments.filter(e => {
        const p = parseFloat(e.progress_percentage || '0')
        return p >= 50 && p < 75
    }).length
    const bucket25 = enrollments.filter(e => {
        const p = parseFloat(e.progress_percentage || '0')
        return p >= 25 && p < 50
    }).length
    const bucket0 = enrollments.filter(e => {
        const p = parseFloat(e.progress_percentage || '0')
        return p < 25
    }).length

    // ── Quiz Score Distribution Calculation ─────────────────────────────────
    const scoreGradeA = submissions.filter(s => s.total_questions > 0 && (s.score / s.total_questions) >= 0.9).length
    const scoreGradeB = submissions.filter(s => s.total_questions > 0 && (s.score / s.total_questions) >= 0.75 && (s.score / s.total_questions) < 0.9).length
    const scoreGradeC = submissions.filter(s => s.total_questions > 0 && (s.score / s.total_questions) >= 0.5 && (s.score / s.total_questions) < 0.75).length
    const scoreGradeD = submissions.filter(s => s.total_questions > 0 && (s.score / s.total_questions) < 0.5).length

    const quizScoreDistribution = [
        { name: '90 - 100%', label: 'Excellent (A)', count: scoreGradeA, color: '#10b981' },
        { name: '75 - 89%', label: 'Good (B)', count: scoreGradeB, color: '#6366f1' },
        { name: '50 - 74%', label: 'Passing (C)', count: scoreGradeC, color: '#f59e0b' },
        { name: '< 50%', label: 'Needs Help', count: scoreGradeD, color: '#f43f5e' },
    ]

    // ── Per-Quiz Performance Chart Data ──────────────────────────────────────
    const perQuizPerformanceData = quizzes.map(q => {
        const qSubs = submissions.filter(s => (s.quiz?.id || s.quiz) === q.id)
        const count = qSubs.length
        const totalScore = qSubs.reduce((acc, curr) => acc + (curr.score || 0), 0)
        const totalPossible = qSubs.reduce((acc, curr) => acc + (curr.total_questions || 0), 0)
        const avgPct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0
        const passed = qSubs.filter(s => s.total_questions > 0 && (s.score / s.total_questions) >= 0.5).length
        const passRate = count > 0 ? Math.round((passed / count) * 100) : 0

        return {
            name: q.title?.length > 18 ? `${q.title.slice(0, 16)}...` : q.title || 'Quiz',
            fullName: q.title || 'Quiz',
            accuracy: avgPct,
            passRate: passRate,
            attempts: count,
        }
    })

    // ── Student Progress Timeline Data ───────────────────────────────────────
    const recentEnrollmentsSorted = [...enrollments].sort((a, b) =>
        new Date(a.enrolled_at).getTime() - new Date(b.enrolled_at).getTime()
    )

    const enrollmentTrendMap: Record<string, number> = {}
    recentEnrollmentsSorted.forEach(e => {
        const dateKey = new Date(e.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        enrollmentTrendMap[dateKey] = (enrollmentTrendMap[dateKey] || 0) + 1
    })

    const enrollmentTrendData = Object.entries(enrollmentTrendMap).map(([date, count]) => ({
        date,
        students: count,
    }))

    // Filtered students
    const filteredEnrollments = enrollments.filter(e => {
        const matchSearch =
            (e.student_name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
            (e.student?.email || '').toLowerCase().includes(studentSearch.toLowerCase())
        const done = parseFloat(e.progress_percentage || '0') >= 100
        const matchStatus =
            studentStatusFilter === 'ALL' ||
            (studentStatusFilter === 'COMPLETED' && done) ||
            (studentStatusFilter === 'IN_PROGRESS' && !done)
        return matchSearch && matchStatus
    })

    const handleExportCSV = () => {
        const headers = ['Student Name', 'Email', 'Enrolled Date', 'Progress %', 'Completed Lessons', 'Status']
        const rows = enrollments.map(e => [
            e.student_name,
            e.student?.email || 'N/A',
            new Date(e.enrolled_at).toLocaleDateString(),
            `${e.progress_percentage || 0}%`,
            e.completed_lessons || 0,
            parseFloat(e.progress_percentage || '0') >= 100 ? 'Completed' : 'In Progress',
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })),
            download: `analytics_${course?.slug || 'course'}.csv`,
            style: 'visibility:hidden',
        })
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // ── shared design tokens ────────────────────────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm'
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100'

    if (loading && !course) return <LoadingSpinner fullscreen text="Loading course analytics..." />

    if (!course) {
        return (
            <div className="py-6 px-4 md:px-6">
                <div className={`${card} py-16 flex flex-col items-center gap-3`}>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Course not found</p>
                    <Link
                        to="/dashboard/instructor/my-courses"
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors"
                    >
                        ← Back to My Courses
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="py-6 px-4 md:px-6 space-y-5">
            <SEO title={`Analytics - ${course.title} | Global Professional`} noindex={true} />

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    <button
                        onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}`)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Course
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Course Analytics</h1>
                    <p className="text-sm text-gray-400 mt-0.5 truncate">
                        {course.title} · Performance & Engagement Insights
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/students`)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                        <Users className="w-3.5 h-3.5" /> View Students
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                </div>
            </div>

            {/* ── Error state ── */}
            {error && (
                <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-rose-800">Failed to load analytics</p>
                        <p className="text-xs text-rose-600 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* ── Quick stats (4 columns) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    {
                        label: 'Total Enrolled',
                        value: totalStudents,
                        icon: Users,
                        iconBg: 'bg-violet-50',
                        iconText: 'text-violet-600',
                    },
                    {
                        label: 'Total Revenue',
                        value: `৳${totalRevenue.toLocaleString()}`,
                        icon: DollarSign,
                        iconBg: 'bg-emerald-50',
                        iconText: 'text-emerald-600',
                    },
                    {
                        label: 'Completion Rate',
                        value: `${completionRate}%`,
                        icon: CheckCircle,
                        iconBg: 'bg-blue-50',
                        iconText: 'text-blue-600',
                    },
                    {
                        label: 'Avg. Quiz Accuracy',
                        value: `${avgQuizAccuracy}%`,
                        icon: Award,
                        iconBg: 'bg-amber-50',
                        iconText: 'text-amber-600',
                    },
                ].map(({ label, value, icon: Icon, iconBg, iconText }) => (
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

            {/* ── Navigation Tabs ── */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                    { key: 'OVERVIEW', label: 'Overview & Analytics Charts', icon: BarChart2 },
                    { key: 'STUDENTS', label: `Student Progress (${enrollments.length})`, icon: Users },
                    { key: 'QUIZZES', label: `Assessments & Quizzes (${quizzes.length})`, icon: Award },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key as TabType)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap ${activeTab === key
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                            }`}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Tab: OVERVIEW ── */}
            {activeTab === 'OVERVIEW' && (
                <div className="space-y-5">
                    {/* Row 1: Student Progress Distribution & Quiz Score Distribution Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* Student Progress Breakdown */}
                        <div className={`${card} p-5 space-y-4`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Student Progress Breakdown</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Distribution across lesson completion milestones</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                        {completedEnrollments.length} Completed
                                    </span>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                                        {inProgressEnrollments.length} In Progress
                                    </span>
                                </div>
                            </div>

                            {/* Detailed Buckets */}
                            <div className="space-y-3 pt-2">
                                {[
                                    { label: 'Completed (100%)', count: bucket100, color: 'bg-emerald-500' },
                                    { label: 'Advanced (75% - 99%)', count: bucket75, color: 'bg-blue-500' },
                                    { label: 'Intermediate (50% - 74%)', count: bucket50, color: 'bg-violet-500' },
                                    { label: 'Beginner (25% - 49%)', count: bucket25, color: 'bg-amber-500' },
                                    { label: 'Just Started (0% - 24%)', count: bucket0, color: 'bg-rose-400' },
                                ].map(b => {
                                    const pct = totalStudents > 0 ? ((b.count / totalStudents) * 100).toFixed(0) : '0'
                                    return (
                                        <div key={b.label} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-700 font-medium">{b.label}</span>
                                                <span className="text-gray-400">{b.count} students ({pct}%)</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${b.color} transition-all duration-500`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Quiz Results Score Distribution Graph */}
                        <div className={`${card} p-5 space-y-4`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Quiz Score Distribution</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Student scores across all {totalAttempts} submissions</p>
                                </div>
                                <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">
                                    Avg: {avgQuizAccuracy}%
                                </span>
                            </div>

                            {totalAttempts > 0 ? (
                                <div className="h-56 w-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={quizScoreDistribution}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload
                                                        const pct = totalAttempts > 0 ? ((data.count / totalAttempts) * 100).toFixed(0) : '0'
                                                        return (
                                                            <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-lg text-xs space-y-1">
                                                                <p className="font-bold text-gray-800">{data.label}</p>
                                                                <p className="text-gray-500">{data.count} submissions ({pct}%)</p>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                                {quizScoreDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-56 flex flex-col items-center justify-center text-center p-4">
                                    <Award className="w-8 h-8 text-gray-200 mb-2" />
                                    <p className="text-xs font-semibold text-gray-500">No quiz submissions recorded yet</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">As students take quizzes, the score distribution will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Per-Quiz Comparative Performance Graph */}
                    {quizzes.length > 0 && (
                        <div className={`${card} p-5 space-y-4`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Per-Quiz Accuracy & Performance Comparison</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Average accuracy and pass rate across each course quiz</p>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm bg-violet-600 inline-block" />
                                        <span>Avg. Accuracy (%)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                                        <span>Pass Rate (%)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-64 w-full pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={perQuizPerformanceData}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11, fill: '#4b5563' }}
                                            axisLine={{ stroke: '#e5e7eb' }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                                            axisLine={{ stroke: '#e5e7eb' }}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const d = payload[0].payload
                                                    return (
                                                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-lg text-xs space-y-1">
                                                            <p className="font-bold text-gray-900">{d.fullName}</p>
                                                            <p className="text-violet-600 font-medium">Avg Accuracy: {d.accuracy}%</p>
                                                            <p className="text-emerald-600 font-medium">Pass Rate: {d.passRate}%</p>
                                                            <p className="text-gray-400">Total Attempts: {d.attempts}</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Bar dataKey="accuracy" name="Avg. Accuracy (%)" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="passRate" name="Pass Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Row 3: Capacity, Engagement & Proctoring Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                        {/* Engagement & Capacity Card */}
                        <div className={`${card} p-5 space-y-4`}>
                            <h3 className="text-sm font-semibold text-gray-900">Course Capacity & Content</h3>

                            <div className="space-y-3 text-xs">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                                    <div className="flex items-center justify-between text-gray-700">
                                        <span className="font-semibold">Seat Occupancy</span>
                                        <span className="font-bold text-gray-900">{totalStudents} / {course.total_seats}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                            style={{ width: `${Math.min(100, (totalStudents / Math.max(1, course.total_seats)) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                                            <Layers className="w-3.5 h-3.5" />
                                            <span className="text-[10px] uppercase font-semibold">Classes</span>
                                        </div>
                                        <p className="text-base font-bold text-gray-900">{course.total_classes}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-[10px] uppercase font-semibold">Duration</span>
                                        </div>
                                        <p className="text-base font-bold text-gray-900">{course.duration_hours}h</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                                            <FileText className="w-3.5 h-3.5" />
                                            <span className="text-[10px] uppercase font-semibold">Materials</span>
                                        </div>
                                        <p className="text-base font-bold text-gray-900">{materialsCount} files</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                                            <Megaphone className="w-3.5 h-3.5" />
                                            <span className="text-[10px] uppercase font-semibold">Notices</span>
                                        </div>
                                        <p className="text-base font-bold text-gray-900">{announcementsCount} posts</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assessment & Proctoring Summary */}
                        <div className={`${card} lg:col-span-2 p-5 space-y-4`}>
                            <h3 className="text-sm font-semibold text-gray-900">Assessment & Integrity Insights</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-100 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-700">Attempts</span>
                                        <Award className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-violet-900">{totalAttempts}</p>
                                    <p className="text-[11px] text-violet-600">Total Quiz Submissions</p>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">Tab Strikes</span>
                                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-amber-900">{totalWarnings}</p>
                                    <p className="text-[11px] text-amber-600">Focus Switch Warnings</p>
                                </div>

                                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-700">Disqualified</span>
                                        <ShieldOff className="w-4 h-4 text-rose-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-rose-900">{disqualifiedCount}</p>
                                    <p className="text-[11px] text-rose-600">Proctoring Disqualifications</p>
                                </div>
                            </div>

                            {/* Enrollment Trend mini graph if available */}
                            {enrollmentTrendData.length > 1 && (
                                <div className="pt-2 border-t border-gray-100 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Student Enrollment Velocity
                                        </span>
                                        <span className="text-gray-400">{enrollments.length} total</span>
                                    </div>
                                    <div className="h-24 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={enrollmentTrendData}
                                                margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="students" stroke="#7c3aed" fill="#ede9fe" strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tab: STUDENTS ── */}
            {activeTab === 'STUDENTS' && (
                <div className={card}>
                    {/* Card Header with Search & Filter */}
                    <div className={`${cardHeader} flex-col sm:flex-row gap-3`}>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Enrolled Student Cohort</p>
                            <p className="text-xs text-gray-400 mt-0.5">{filteredEnrollments.length} students shown</p>
                        </div>
                        <div className="flex items-center gap-2 sm:ml-auto">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                    className="pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44"
                                />
                            </div>
                            {/* Status Filter */}
                            <div className="relative">
                                <select
                                    value={studentStatusFilter}
                                    onChange={e => setStudentStatusFilter(e.target.value as any)}
                                    className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {['Student', 'Enrolled Date', 'Progress', 'Quiz Submissions', 'Status', ''].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredEnrollments.length > 0 ? (
                                    filteredEnrollments.map(enrollment => {
                                        const progress = parseFloat(enrollment.progress_percentage || '0')
                                        const isComplete = progress >= 100
                                        const studentQuizSubs = enrollment.quiz_submissions || []

                                        return (
                                            <tr
                                                key={enrollment.id}
                                                onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/students/${enrollment.student?.id}/quizzes`)}
                                                className="group hover:bg-gray-50/60 transition-colors duration-100 cursor-pointer"
                                            >
                                                {/* Student */}
                                                <td className="px-5 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {enrollment.student?.profile_picture ? (
                                                            <img
                                                                src={enrollment.student.profile_picture}
                                                                alt={enrollment.student_name}
                                                                className="w-9 h-9 rounded-xl object-cover border border-gray-100 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0">
                                                                {enrollment.student_name?.charAt(0) || 'S'}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 group-hover:text-violet-600 transition-colors truncate">
                                                                {enrollment.student_name}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-44">
                                                                {enrollment.student?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Enrolled Date */}
                                                <td className="px-5 py-3 whitespace-nowrap text-xs text-gray-500">
                                                    {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>

                                                {/* Progress */}
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-col gap-1 min-w-28">
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
                                                    {studentQuizSubs.length > 0 ? (
                                                        <span className="inline-flex items-center gap-1 font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md text-[11px]">
                                                            <Award className="w-3 h-3" /> {studentQuizSubs.length} attempt{studentQuizSubs.length > 1 ? 's' : ''}
                                                        </span>
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
                                                </td>

                                                {/* Action */}
                                                <td className="px-5 py-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/students/${enrollment.student?.id}/quizzes`)}
                                                        title="View Student Quiz Results"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors cursor-pointer ml-auto"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                                            No enrolled students found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Tab: QUIZZES ── */}
            {activeTab === 'QUIZZES' && (
                <div className={card}>
                    <div className={cardHeader}>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Course Assessments</p>
                            <p className="text-xs text-gray-400 mt-0.5">{quizzes.length} quizzes created</p>
                        </div>
                        <button
                            onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/quizzes`)}
                            className="text-xs font-semibold text-violet-600 hover:text-violet-800 hover:underline cursor-pointer"
                        >
                            Manage Quizzes →
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {['Quiz Title', 'Questions', 'Duration', 'Attempts', 'Pass Rate', ''].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {quizzes.length > 0 ? (
                                    quizzes.map(quiz => {
                                        const quizSubs = submissions.filter(s => (s.quiz?.id || s.quiz) === quiz.id)
                                        const totalSubs = quizSubs.length
                                        const passedSubs = quizSubs.filter(s => s.total_questions > 0 && (s.score / s.total_questions) >= 0.5).length
                                        const passRate = totalSubs > 0 ? Math.round((passedSubs / totalSubs) * 100) : 0

                                        return (
                                            <tr
                                                key={quiz.id}
                                                onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/quizzes/${quiz.id}/submissions`)}
                                                className="group hover:bg-gray-50/60 transition-colors duration-100 cursor-pointer"
                                            >
                                                {/* Quiz Title */}
                                                <td className="px-5 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs shrink-0 group-hover:bg-amber-100 transition-colors">
                                                            <Award className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 group-hover:text-violet-600 transition-colors truncate">
                                                                {quiz.title}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-44">
                                                                {quiz.is_active ? 'Active' : 'Draft'} · PIN: {quiz.has_pin ? 'Enabled' : 'None'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Questions */}
                                                <td className="px-5 py-3 whitespace-nowrap text-xs text-gray-700 font-medium">
                                                    {quiz.total_questions || 0} questions
                                                </td>

                                                {/* Duration */}
                                                <td className="px-5 py-3 whitespace-nowrap text-xs text-gray-500">
                                                    {quiz.duration_minutes ? `${quiz.duration_minutes} min` : 'Untimed'}
                                                </td>

                                                {/* Attempts */}
                                                <td className="px-5 py-3 whitespace-nowrap text-xs text-gray-900 font-bold">
                                                    {totalSubs} submissions
                                                </td>

                                                {/* Pass Rate */}
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-col gap-1 min-w-24">
                                                        <span className="text-[11px] font-bold text-emerald-600">
                                                            {passRate}%
                                                        </span>
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                                                style={{ width: `${passRate}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Action */}
                                                <td className="px-5 py-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => navigate(`/dashboard/instructor/my-courses/${effectiveCourseId}/quizzes/${quiz.id}/submissions`)}
                                                        title="View Submissions"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors cursor-pointer ml-auto"
                                                    >
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                                            No quizzes found for this course.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CourseAnalyticsPage
