/* eslint-disable react-hooks/set-state-in-effect */
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
    FileText,
    BarChart,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../../../hooks/useAuth'
import { useCourses } from '../../../../hooks/useCourses'
import CourseDetailSkeleton from '../../../components/loadingSkeleton/CourseDetailSkeleton'
import DashboardBreadcrumb from '../../../components/dashboard/DashboardBreadcrumb'

export function InstructorCourseDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const {
        course,
        loading,
        error,
        fetchCourseDetail,
        submitForReview,
        fetchReviews,
        // reviews,
        clearStates,
    } = useCourses()

    const [activeTab, setActiveTab] = useState('overview')
    const [expandedModules, setExpandedModules] = useState<string[]>([])
    const [showSubmitModal, setShowSubmitModal] = useState(false)
    // const [showRejectionModal, setShowRejectionModal] = useState(false)
    // const [rejectionReason, setRejectionReason] = useState('')

    useEffect(() => {
        if (id) {
            fetchCourseDetail(id)
            fetchReviews(id)
        }
        return () => {
            clearStates()
        }
    }, [id, fetchCourseDetail, fetchReviews, clearStates])

    useEffect(() => {
        if (course?.sections) {
            // Expand first section by default
            if (course.sections.length > 0 && expandedModules.length === 0) {
                setExpandedModules([course.sections[0].id])
            }
        }
    }, [course?.sections, expandedModules.length])

    // Check if current user is the instructor
    useEffect(() => {
        if (course && user && course.instructor.id !== user.id) {
            navigate('/dashboard/instructor/my-courses')
        }
    }, [course, user, navigate])

    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) =>
            prev.includes(moduleId)
                ? prev.filter((id) => id !== moduleId)
                : [...prev, moduleId],
        )
    }

    const handleSubmitForReview = async () => {
        if (!id) return
        try {
            await submitForReview(id)
            setShowSubmitModal(false)
            // Show success message
            alert('Course submitted for review successfully!')
        } catch (error) {
            console.error('Failed to submit for review:', error)
            alert('Failed to submit course for review. Please try again.')
        }
    }

    const handleViewEnrollments = () => {
        // navigate(`/dashboard/instructor/courses/${id}/enrollments`)
        navigate(`#`)
    }

    const handleViewAnalytics = () => {
        navigate(`/dashboard/instructor/courses/${id}/analytics`)
    }

    const handleManageCurriculum = () => {
        navigate(`/dashboard/instructor/courses/${id}/curriculum`)
    }


    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                        <CheckCircle className="w-4 h-4" />
                        Published
                    </div>
                )
            case 'PENDING':
                return (
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium border border-yellow-200">
                        <AlertTriangle className="w-4 h-4" />
                        Pending Review
                    </div>
                )
            case 'APPROVED':
                return (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200">
                        <CheckCircle className="w-4 h-4" />
                        Approved
                    </div>
                )
            case 'REJECTED':
                return (
                    <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-sm font-medium border border-red-200">
                        <XCircle className="w-4 h-4" />
                        Rejected
                    </div>
                )
            default:
                return (
                    <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                        <FileText className="w-4 h-4" />
                        Draft
                    </div>
                )
        }
    }

    const getSeatStatusColor = () => {
        if (!course) return 'bg-gray-100'
        const percentage = (course.available_seats / course.total_seats) * 100
        if (course.available_seats <= 0) return 'bg-red-100 text-red-800 border-red-200'
        if (percentage <= 20) return 'bg-orange-100 text-orange-800 border-orange-200'
        return 'bg-green-100 text-green-800 border-green-200'
    }

    const getRevenueEstimate = () => {
        if (!course) return 0
        const enrolledStudents = course.enrollment_count || 0
        return enrolledStudents * parseFloat(course.price)
    }

    if (loading) {
        return <CourseDetailSkeleton />
    }

    if (error || !course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'The course you are looking for does not exist.'}</p>
                    <Link
                        to="/dashboard/instructor/my-courses"
                        className="inline-block bg-[#0066CC] text-white px-6 py-3 rounded-lg hover:bg-[#004c99] transition-colors"
                    >
                        Back to My Courses
                    </Link>
                </div>
            </div>
        )
    }
    const breadcrumbSubtitle = `${course.total_classes} classes • ${course.difficulty_level} • ${course.enrollment_count || 0} students enrolled`

    return (
        <>
            {/* Breadcrumb Navigation */}
            <div className="container mx-auto">
                <DashboardBreadcrumb
                    name={course.title}
                    subtitle={breadcrumbSubtitle}
                    icon={BookOpen}
                />
            </div>

            {/* Course Header */}
            <div className="bg-linear-to-br from-gray-50 to-white border-b border-gray-200 py-8">
                <div className="container mx-auto px-4">
                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            {getStatusBadge(course.status)}
                            {/* {course.rejection_reason && course.status === 'REJECTED' && (
                                <button
                                    onClick={() => {
                                        setRejectionReason(course.rejection_reason || '')
                                        setShowRejectionModal(true)
                                    }}
                                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    View Rejection Reason
                                </button>
                            )} */}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to={`/dashboard/instructor/edit-course/${course.id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#0066CC] text-[#0066CC] rounded-lg font-medium hover:bg-[#0066CC] hover:text-white transition-all shadow-sm hover:shadow-md"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Course
                            </Link>
                            {course.status === 'DRAFT' && (
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#76C043] text-white rounded-lg font-medium hover:bg-[#65a838] transition-all shadow-sm hover:shadow-md"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Submit for Review
                                </button>
                            )}
                            {course.status === 'PUBLISHED' && (
                                <>
                                    <button
                                        onClick={handleViewEnrollments}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg font-medium hover:bg-[#004c99] transition-all shadow-sm hover:shadow-md"
                                    >
                                        <Users className="w-4 h-4" />
                                        View Enrollments
                                    </button>
                                    <button
                                        onClick={handleViewAnalytics}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all shadow-sm hover:shadow-md"
                                    >
                                        <BarChart className="w-4 h-4" />
                                        Analytics
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left: Course Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                {course.title}
                            </h1>

                            <p className="text-gray-600 mb-6 text-lg">{course.short_description}</p>

                            {/* Quick Stats Grid */}
                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {/* Students Card */}
                                <div className="bg-white rounded-lg border border-gray-100 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs text-gray-500">Students</span>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-900">{course.enrollment_count || 0}</p>
                                </div>

                                {/* Revenue Card */}
                                <div className="bg-white rounded-lg border border-gray-100 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs text-gray-500">Revenue</span>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-900">${getRevenueEstimate().toLocaleString()}</p>
                                </div>

                                {/* Classes Card */}
                                <div className="bg-white rounded-lg border border-gray-100 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Layers className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs text-gray-500">Classes</span>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-900">{course.total_classes}</p>
                                </div>

                                {/* Hours Card */}
                                <div className="bg-white rounded-lg border border-gray-100 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs text-gray-500">Hours</span>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-900">{course.duration_hours}</p>
                                </div>
                            </div>

                            {/* Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-[#e8f5e9] border-l-4 border-[#76C043] p-4 rounded-lg">
                                    <div className="flex items-start">
                                        <Calendar className="w-5 h-5 text-[#76C043] mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Class Starts</p>
                                            <p className="font-semibold text-gray-900">
                                                {course.class_starts ? new Date(course.class_starts).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                }) : 'TBA'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#e8f5e9] border-l-4 border-[#76C043] p-4 rounded-lg">
                                    <div className="flex items-start">
                                        <Calendar className="w-5 h-5 text-[#76C043] mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Admission Deadline</p>
                                            <p className="font-semibold text-gray-900">
                                                {course.admission_deadline ? new Date(course.admission_deadline).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                }) : 'TBA'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#e8f5e9] border-l-4 border-[#76C043] p-4 rounded-lg">
                                    <div className="flex items-start">
                                        <Clock className="w-5 h-5 text-[#76C043] mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Schedule</p>
                                            <p className="font-semibold text-gray-900">{course.schedule || 'TBA'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${getSeatStatusColor()} border-l-4 p-4 rounded-lg`}>
                                    <div className="flex items-start">
                                        <Users className="w-5 h-5 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm">Available Seats</p>
                                            <p className="font-semibold">
                                                {course.available_seats} of {course.total_seats}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Course Thumbnail */}
                        <div className="w-full lg:w-96 shrink-0">
                            {course.thumbnail ? (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-64 object-cover rounded-xl shadow-lg border border-gray-200"
                                />
                            ) : (
                                <div className="bg-linear-to-br from-[#0066CC] to-[#004c99] rounded-xl p-8 text-white relative overflow-hidden shadow-xl h-64 flex items-center justify-center">
                                    <div className="relative z-10 text-center">
                                        <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-2xl font-bold mb-2">{course.title}</h3>
                                        <p className="text-lg opacity-90">{course.category?.name || 'Uncategorized'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Quick Action Cards for Instructors */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={handleManageCurriculum}
                        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#0066CC] hover:shadow-md transition-all group"
                    >
                        <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-[#0066CC] group-hover:text-white transition-colors">
                            <BookOpen className="w-5 h-5 text-[#0066CC] group-hover:text-white" />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-gray-900">Manage Curriculum</p>
                            <p className="text-xs text-gray-500">Update lessons & modules</p>
                        </div>
                    </button>

                    <button
                        onClick={handleViewEnrollments}
                        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-600  hover:shadow-md transition-all group"
                    >
                        <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-600 transition-colors">
                            <Users className="w-5 h-5 text-green-600 group-hover:text-white" />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-gray-900">View Students</p>
                            <p className="text-xs text-gray-500">{course.enrollment_count || 0} enrolled</p>
                        </div>
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'overview'
                                ? 'border-[#76C043] text-[#76C043]'
                                : 'border-transparent text-gray-600 hover:text-gray-900 '
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('curriculum')}
                            className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'curriculum'
                                ? 'border-[#76C043] text-[#76C043]'
                                : 'border-transparent text-gray-600 hover:text-gray-900 cursor-pointer'
                                }`}
                        >
                            Curriculum
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Full Description */}
                            <div className="group">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                    Course Description
                                </h3>
                                <div className="bg-linear-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div
                                        className="
                                                prose prose-sm max-w-none
                                                text-gray-700 leading-relaxed
                                                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                                                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                                                [&_li]:mb-1 [&_li]:text-gray-600
                                                [&_p]:mb-3 [&_p]:text-gray-600
                                                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900
                                                [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-800
                                                [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-gray-800
                                                [&_a]:text-purple-600 [&_a]:hover:text-purple-700 [&_a]:underline [&_a]:underline-offset-2
                                                "
                                        dangerouslySetInnerHTML={{ __html: course.description }}
                                    />
                                </div>
                            </div>

                            {/* Learning Outcomes */}
                            {course.learning_outcomes && (
                                <div className="group">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                        Learning Outcomes
                                    </h3>
                                    <div className="bg-linear-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div
                                            className="
                prose prose-sm max-w-none
                text-gray-700 leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                [&_li]:mb-1 [&_li]:text-gray-600
                [&_p]:mb-3 [&_p]:text-gray-600
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900
                [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-800
                [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-gray-800
                [&_a]:text-blue-600 [&_a]:hover:text-blue-700 [&_a]:underline [&_a]:underline-offset-2
              "
                                            dangerouslySetInnerHTML={{ __html: course.learning_outcomes }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Requirements */}
                            {course.requirements && (
                                <div className="group">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                                        Requirements
                                    </h3>
                                    <div className="bg-linear-to-br from-amber-50 to-white rounded-xl p-6 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div
                                            className="
                prose prose-sm max-w-none
                text-gray-700 leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                [&_li]:mb-1 [&_li]:text-gray-600
                [&_p]:mb-3 [&_p]:text-gray-600
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900
                [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-800
                [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-gray-800
                [&_a]:text-amber-600 [&_a]:hover:text-amber-700 [&_a]:underline [&_a]:underline-offset-2
              "
                                            dangerouslySetInnerHTML={{ __html: course.requirements }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Target Audience */}
                            {course.target_audience && (
                                <div className="group">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                                        Target Audience
                                    </h3>
                                    <div className="bg-linear-to-br from-cyan-50 to-white rounded-xl p-6 border border-cyan-100 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div
                                            className="
                prose prose-sm max-w-none
                text-gray-700 leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                [&_li]:mb-1 [&_li]:text-gray-600
                [&_p]:mb-3 [&_p]:text-gray-600
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900
                [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-800
                [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-gray-800
                [&_a]:text-cyan-600 [&_a]:hover:text-cyan-700 [&_a]:underline [&_a]:underline-offset-2
              "
                                            dangerouslySetInnerHTML={{ __html: course.target_audience }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Who Can Join */}
                            {course.who_can_join && (
                                <div className="group">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                        Eligibility
                                    </h3>
                                    <div className="bg-linear-to-br from-emerald-50 to-white rounded-xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div
                                            className="
                prose prose-sm max-w-none
                text-gray-700 leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                [&_li]:mb-1 [&_li]:text-gray-600
                [&_p]:mb-3 [&_p]:text-gray-600
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900
                [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-800
                [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-gray-800
                [&_a]:text-emerald-600 [&_a]:hover:text-emerald-700 [&_a]:underline [&_a]:underline-offset-2
              "
                                            dangerouslySetInnerHTML={{ __html: course.who_can_join }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'curriculum' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Course Structure
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {course.sections?.length || 0} modules • {course.sections?.reduce((acc, section) => acc + (section.lesson_count || 0), 0) || 0} lessons
                                    </p>
                                </div>
                                <button
                                    onClick={handleManageCurriculum}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-[#0066CC] to-[#0052a3] text-white rounded-xl hover:from-[#0052a3] hover:to-[#004080] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm font-medium"
                                >
                                    <Edit className="w-4 h-4" />
                                    Manage Curriculum
                                </button>
                            </div>

                            {course.sections && course.sections.length > 0 ? (
                                <div className="space-y-4">
                                    {course.sections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-all duration-300"
                                        >
                                            {/* Module Header */}
                                            <button
                                                onClick={() => toggleModule(section.id)}
                                                className={`w-full flex items-center justify-between p-5 transition-all duration-300 ${expandedModules.includes(section.id)
                                                    ? 'bg-linear-to-r from-[#e8f5e9] to-white border-b border-gray-200'
                                                    : 'bg-gray-50/50 hover:bg-gray-100/80'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-[#0066CC] to-[#0052a3] text-white font-bold shadow-md">
                                                        {section.order}
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-semibold text-gray-900 text-lg">{section.title}</h4>
                                                    </div>
                                                </div>
                                                <div className={`p-2 rounded-full transition-all duration-300 ${expandedModules.includes(section.id) ? 'bg-[#0066CC] text-white' : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {expandedModules.includes(section.id) ? (
                                                        <ChevronUp className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Module Content */}
                                            {expandedModules.includes(section.id) && (
                                                <div className="p-6 bg-white animate-slideDown">
                                                    {section.description && (
                                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                            <p className="text-gray-600 text-sm italic">📝 {section.description}</p>
                                                        </div>
                                                    )}
                                                    <ul className="space-y-3">
                                                        {section.lessons && section.lessons.length > 0 ? (
                                                            section.lessons.map((lesson, index) => (
                                                                <li
                                                                    key={lesson.id}
                                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 group border border-transparent hover:border-gray-200"
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-gray-500 font-medium text-sm shadow-sm group-hover:shadow">
                                                                            {String(index + 1).padStart(2, '0')}
                                                                        </span>
                                                                        <span className="text-gray-700 font-medium">{lesson.title}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {lesson.is_preview && (
                                                                            <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                                                                                Preview Available
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                                                                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                                <p className="mb-4">No lessons added yet.</p>
                                                                <button
                                                                    onClick={handleManageCurriculum}
                                                                    className="text-[#0066CC] hover:text-[#0052a3] font-medium underline underline-offset-4"
                                                                >
                                                                    Add your first lesson →
                                                                </button>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-linear-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200">
                                    <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 text-lg mb-4">No curriculum has been added yet.</p>
                                    <p className="text-sm text-gray-500 mb-6">Start building your course by adding modules and lessons.</p>
                                    <button
                                        onClick={handleManageCurriculum}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#0066CC] to-[#0052a3] text-white rounded-xl hover:from-[#0052a3] hover:to-[#004080] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Add Curriculum
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Submit for Review Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Submit for Review</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to submit this course for admin review? Once submitted, you won't be able to make changes until the review is complete.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-700">
                                    Please ensure all course details, curriculum, and pricing information are complete before submitting.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitForReview}
                                className="px-4 py-2 bg-[#76C043] text-white rounded-lg hover:bg-[#65a838] transition-colors"
                            >
                                Submit for Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {/* {showRejectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            Rejection Reason
                        </h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-gray-700 whitespace-pre-line">{rejectionReason || 'No specific reason provided.'}</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowRejectionModal(false)}
                                className="px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#004c99] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
        </>
    )
}