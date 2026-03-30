/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    Layers,
    Clock,
    Users,
    Calendar,
    Edit,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    BookOpen,
    DollarSign,
    BarChart,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Trash2,
    Eye,
    PlaySquare,
} from 'lucide-react'
import { useAuth } from '../../../../hooks/useAuth'
import { useCourses } from '../../../../hooks/useCourses'
import CourseDetailSkeleton from '../../../components/ui/loadingSkeleton/CourseDetailSkeleton'
import { toast } from 'react-hot-toast'
import { extractErrorMessage } from '../../../../lib/errorUtils'
import SEO from '../../../components/SEO'

// ── Status config ─────────────────────────────────────────────────────────────
const statusConfig: Record<string, { badge: string; iconColor: string; icon: typeof BookOpen }> = {
    PUBLISHED: { badge: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-600', icon: Eye },
    APPROVED: { badge: 'bg-emerald-50 text-emerald-700', iconColor: 'text-emerald-600', icon: CheckCircle },
    PENDING: { badge: 'bg-amber-50 text-amber-700', iconColor: 'text-amber-500', icon: Clock },
    REJECTED: { badge: 'bg-rose-50 text-rose-700', iconColor: 'text-rose-600', icon: XCircle },
    DRAFT: { badge: 'bg-gray-100 text-gray-600', iconColor: 'text-gray-400', icon: Edit },
}

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? statusConfig['DRAFT']
    const Icon = cfg.icon
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${cfg.badge}`}>
            <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
            {status === 'PENDING' ? 'Pending Review' : status}
        </span>
    )
}

// ── Shared prose classes ──────────────────────────────────────────────────────
const proseClasses = `
    prose prose-sm max-w-none text-gray-700 leading-relaxed
    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
    [&_li]:mb-1 [&_li]:text-gray-600
    [&_p]:mb-3 [&_p]:text-gray-600
    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900
    [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-800
    [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-gray-800
`

// ── Section config for overview rich text blocks ───────────────────────────
const overviewSections = [
    { key: 'description', label: 'Course Description', accent: 'bg-violet-50 border-violet-100', bar: 'bg-violet-500' },
    { key: 'learning_outcomes', label: 'Learning Outcomes', accent: 'bg-blue-50 border-blue-100', bar: 'bg-blue-500' },
    { key: 'requirements', label: 'Requirements', accent: 'bg-amber-50 border-amber-100', bar: 'bg-amber-500' },
    { key: 'target_audience', label: 'Target Audience', accent: 'bg-cyan-50 border-cyan-100', bar: 'bg-cyan-500' },
    { key: 'who_can_join', label: 'Eligibility', accent: 'bg-emerald-50 border-emerald-100', bar: 'bg-emerald-500' },
]

export function InstructorCourseDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const {
        course, loading, fetchCourseDetail,
        submitForReview, fetchReviews,
        clearStates, removeCourse,
    } = useCourses()

    const [activeTab, setActiveTab] = useState('overview')
    const [expandedModules, setExpandedModules] = useState<string[]>([])
    const [showSubmitModal, setShowSubmitModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (id) { fetchCourseDetail(id); fetchReviews(id) }
        return () => clearStates()
    }, [id, fetchCourseDetail, fetchReviews, clearStates])

    useEffect(() => {
        if (course?.sections?.length && expandedModules.length === 0)
            setExpandedModules([course.sections[0].id])
    }, [course?.sections, expandedModules.length])

    useEffect(() => {
        if (course && user && course.instructor.id !== user.id)
            navigate('/dashboard/instructor/my-courses')
    }, [course, user, navigate])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setShowSubmitModal(false); setShowDeleteModal(false) }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    const toggleModule = (moduleId: string) =>
        setExpandedModules(prev =>
            prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
        )

    const handleSubmitForReview = async () => {
        if (!id) return
        try {
            await submitForReview(id)
            setShowSubmitModal(false)
            toast.success('Course submitted for review successfully!')
        } catch (error) {
            toast.error(extractErrorMessage(error))
        }
    }

    const handleManageCurriculum = () => {
        if (course?.status === 'PENDING') {
            toast.error('You cannot manage curriculum while the course is pending review.')
            return
        }
        navigate(`/dashboard/instructor/my-courses/${id}/curriculum`)
    }

    const handleDeleteCourse = async () => {
        if (!id) return
        try {
            setDeleting(true)
            await removeCourse(id)
            toast.success('Course deleted successfully')
            navigate('/dashboard/instructor/my-courses')
        } catch (error) {
            toast.error(extractErrorMessage(error))
        } finally {
            setDeleting(false)
            setShowDeleteModal(false)
        }
    }

    const getSeatStatus = () => {
        if (!course) return { badge: 'bg-gray-100 text-gray-500', text: '—' }
        const pct = (course.available_seats / course.total_seats) * 100
        if (course.available_seats <= 0) return { badge: 'bg-rose-50 text-rose-700', text: 'Full' }
        if (pct <= 20) return { badge: 'bg-amber-50 text-amber-700', text: 'Almost Full' }
        return { badge: 'bg-emerald-50 text-emerald-700', text: 'Available' }
    }

    const revenueEstimate = course
        ? (course.enrollment_count || 0) * parseFloat(course.price)
        : 0

    if (loading) return <CourseDetailSkeleton />

    if (!course) {
        return (
            <div className="py-6 px-4 md:px-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3">
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

    const seatStatus = getSeatStatus()

    const quickStats = [
        { label: 'Students', value: course.enrollment_count || 0, icon: Users, iconBg: 'bg-violet-50', iconColor: 'text-violet-500' },
        { label: 'Revenue', value: `৳${revenueEstimate.toLocaleString()}`, icon: DollarSign, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
        { label: 'Classes', value: course.total_classes, icon: Layers, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
        { label: 'Hours', value: course.duration_hours, icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    ]

    return (
        <>
            <SEO title={`Course Detail | ${course.title}`} noindex={true} />

            <div className="py-6 px-4 md:px-6 space-y-6">

                {/* ── Page header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Link
                                to="/dashboard/instructor/my-courses"
                                className="text-xs text-gray-400 hover:text-violet-600 transition-colors"
                            >
                                My Courses
                            </Link>
                            <span className="text-gray-300 text-xs">/</span>
                            <span className="text-xs text-gray-500 truncate">{course.title}</span>
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight truncate">{course.title}</h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {course.total_classes} classes · {course.difficulty_level} · {course.enrollment_count || 0} students enrolled
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <StatusBadge status={course.status} />

                        {course.status !== 'PENDING' && (
                            <Link
                                to={`/dashboard/instructor/edit-course/${course.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors"
                            >
                                <Edit className="w-3.5 h-3.5" /> Edit
                            </Link>
                        )}
                        {course.status === 'DRAFT' && (
                            <button
                                onClick={() => setShowSubmitModal(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
                            >
                                <CheckCircle className="w-3.5 h-3.5" /> Submit for Review
                            </button>
                        )}
                        {course.status === 'PUBLISHED' && (
                            <button
                                onClick={() => navigate(`/dashboard/instructor/my-courses/${id}/analytics`)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer"
                            >
                                <BarChart className="w-3.5 h-3.5" /> Analytics
                            </button>
                        )}
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                </div>

                {/* Pending warning banner */}
                {course.status === 'PENDING' && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                        <span>
                            This course is pending review. You cannot edit or submit changes until the review is complete.
                        </span>
                    </div>
                )}

                {/* ── Hero row: thumbnail + quick stats ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Thumbnail */}
                    <div className="lg:col-span-1">
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-52 object-cover rounded-xl border border-gray-100 shadow-sm"
                            />
                        ) : (
                            <div className="w-full h-52 rounded-xl bg-violet-50 border border-violet-100 flex flex-col items-center justify-center gap-3">
                                <BookOpen className="w-10 h-10 text-violet-300" />
                                <p className="text-xs font-medium text-violet-400">{course.category?.name || 'Uncategorized'}</p>
                            </div>
                        )}
                    </div>

                    {/* Stats grid */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                        {quickStats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
                            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                                    <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
                                </div>
                                <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`w-4 h-4 ${iconColor}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Info cards row ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        {
                            icon: Calendar, label: 'Class Starts',
                            value: course.class_starts
                                ? new Date(course.class_starts).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                : 'TBA',
                        },
                        {
                            icon: Calendar, label: 'Admission Deadline',
                            value: course.admission_deadline
                                ? new Date(course.admission_deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                : 'TBA',
                        },
                        {
                            icon: Clock, label: 'Schedule',
                            value: course.schedule || 'TBA',
                        },
                        {
                            icon: Users, label: 'Available Seats',
                            value: `${course.available_seats} / ${course.total_seats}`,
                            extra: (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${seatStatus.badge}`}>
                                    {seatStatus.text}
                                </span>
                            ),
                        },
                    ].map(({ icon: Icon, label, value, extra }) => (
                        <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                                <p className="text-xs font-semibold text-gray-800 truncate mt-0.5">{value}</p>
                                {extra && <div className="mt-1">{extra}</div>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Quick action cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={handleManageCurriculum}
                        className={`flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-violet-200 hover:shadow-md transition-all text-left group cursor-pointer ${course.status === 'PENDING' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
                            <BookOpen className="w-4.5 h-4.5 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Manage Curriculum</p>
                            <p className="text-xs text-gray-400">Update lessons & modules</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate(`#`)}
                        className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-violet-200 hover:shadow-md transition-all text-left group cursor-pointer"
                    >
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                            <Users className="w-4.5 h-4.5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">View Students</p>
                            <p className="text-xs text-gray-400">{course.enrollment_count || 0} enrolled</p>
                        </div>
                    </button>
                </div>

                {/* ── Tabs ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

                    {/* Tab bar */}
                    <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-100">
                        {[
                            { key: 'overview', label: 'Overview', icon: PlaySquare },
                            { key: 'curriculum', label: 'Curriculum', icon: Layers },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 cursor-pointer ${activeTab === key
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100'
                                    }`}
                            >
                                <Icon className="w-3 h-3" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="p-5">

                        {/* ── Overview ── */}
                        {activeTab === 'overview' && (
                            <div className="space-y-5">
                                {overviewSections.map(({ key, label, accent, bar }) => {
                                    const html = (course as any)[key]
                                    if (!html) return null
                                    return (
                                        <div key={key}>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <span className={`w-1 h-4 ${bar} rounded-full`} />
                                                {label}
                                            </h3>
                                            <div className={`rounded-xl p-5 border ${accent}`}>
                                                <div
                                                    className={proseClasses}
                                                    dangerouslySetInnerHTML={{ __html: html }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* ── Curriculum ── */}
                        {activeTab === 'curriculum' && (
                            <div className="space-y-4">

                                {/* Curriculum header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Course Structure</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {course.sections?.length || 0} modules ·{' '}
                                            {course.sections?.reduce((acc, s) => acc + (s.lesson_count || 0), 0) || 0} lessons
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleManageCurriculum}
                                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer ${course.status === 'PENDING' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        <Edit className="w-3.5 h-3.5" /> Manage Curriculum
                                    </button>
                                </div>

                                {course.sections && course.sections.length > 0 ? (
                                    <div className="space-y-2">
                                        {course.sections.map((section) => (
                                            <div key={section.id} className="border border-gray-100 rounded-xl overflow-hidden">

                                                {/* Section header */}
                                                <button
                                                    onClick={() => toggleModule(section.id)}
                                                    className={`w-full flex items-center justify-between px-4 py-3 transition-colors cursor-pointer ${expandedModules.includes(section.id)
                                                        ? 'bg-violet-50 border-b border-violet-100'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                                                            {section.order}
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-800">{section.title}</span>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${expandedModules.includes(section.id)
                                                        ? 'bg-violet-600 text-white'
                                                        : 'bg-gray-200 text-gray-500'
                                                        }`}>
                                                        {expandedModules.includes(section.id)
                                                            ? <ChevronUp className="w-3.5 h-3.5" />
                                                            : <ChevronDown className="w-3.5 h-3.5" />
                                                        }
                                                    </div>
                                                </button>

                                                {/* Section lessons */}
                                                {expandedModules.includes(section.id) && (
                                                    <div className="p-3 bg-white space-y-1.5">
                                                        {section.description && (
                                                            <p className="text-xs text-gray-400 italic px-2 pb-1">{section.description}</p>
                                                        )}
                                                        {section.lessons && section.lessons.length > 0 ? (
                                                            section.lessons.map((lesson, index) => (
                                                                <div
                                                                    key={lesson.id}
                                                                    className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                                                                            {String(index + 1).padStart(2, '0')}
                                                                        </span>
                                                                        <span className="text-sm text-gray-700 font-medium">{lesson.title}</span>
                                                                    </div>
                                                                    {lesson.is_preview && (
                                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                                                                            Preview
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="py-8 text-center">
                                                                <BookOpen className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                                                <p className="text-xs text-gray-400">No lessons yet.</p>
                                                                <button
                                                                    onClick={handleManageCurriculum}
                                                                    className="mt-2 text-xs text-violet-600 hover:underline font-medium"
                                                                >
                                                                    Add your first lesson →
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-14 text-center border border-dashed border-gray-200 rounded-xl">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <BookOpen className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No curriculum added yet</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Start building your course structure</p>
                                        <button
                                            onClick={handleManageCurriculum}
                                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Add Curriculum
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Submit for Review Modal ── */}
            {showSubmitModal && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowSubmitModal(false)}
                >
                    <div
                        className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Submit for Review</h3>
                        <p className="text-xs text-gray-400 mb-4">
                            Once submitted, you won't be able to make changes until the review is complete.
                        </p>
                        <div className="flex items-start gap-3 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-lg mb-5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">
                                Ensure all course details, curriculum, and pricing are complete before submitting.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitForReview}
                                className="px-3 py-2 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
                            >
                                Submit for Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => !deleting && setShowDeleteModal(false)}
                >
                    <div
                        className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">Delete Course</h3>
                                <p className="text-xs text-gray-400 mb-1">
                                    Are you sure you want to delete this course?
                                </p>
                                <p className="text-xs font-semibold text-rose-600 mb-5">This action cannot be undone.</p>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={deleting}
                                        className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteCourse}
                                        disabled={deleting}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {deleting ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Deleting…
                                            </>
                                        ) : (
                                            <><Trash2 className="w-3.5 h-3.5" /> Delete Course</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}