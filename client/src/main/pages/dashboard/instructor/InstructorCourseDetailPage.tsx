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
    GraduationCap,
    Star,
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
        reviews,
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
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Full Description */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Course Description</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {course.description}
                                </p>
                            </div>

                            {/* Learning Outcomes */}
                            {course.learning_outcomes && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Learning Outcomes</h3>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {course.learning_outcomes}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Requirements */}
                            {course.requirements && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Requirements</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {course.requirements}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Target Audience */}
                            {course.target_audience && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Target Audience</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {course.target_audience}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Who Can Join */}
                            {course.who_can_join && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Eligibility</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {course.who_can_join}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'curriculum' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Course Structure ({course.sections?.length || 0} Modules)
                                </h3>
                                <button
                                    onClick={handleManageCurriculum}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#004c99] transition-colors text-sm"
                                >
                                    <Edit className="w-4 h-4" />
                                    Manage Curriculum
                                </button>
                            </div>

                            {course.sections && course.sections.length > 0 ? (
                                course.sections.map((section) => (
                                    <div
                                        key={section.id}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                    >
                                        {/* Module Header */}
                                        <button
                                            onClick={() => toggleModule(section.id)}
                                            className={`w-full flex items-center justify-between p-4 transition-all ${expandedModules.includes(section.id)
                                                ? 'bg-[#e8f5e9] border-b border-gray-200'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0066CC] text-white font-bold">
                                                    {section.order}
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {section.lesson_count || 0} lessons
                                                    </p>
                                                </div>
                                            </div>
                                            {expandedModules.includes(section.id) ? (
                                                <ChevronUp className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-600" />
                                            )}
                                        </button>

                                        {/* Module Content */}
                                        {expandedModules.includes(section.id) && (
                                            <div className="p-4 bg-white">
                                                {section.description && (
                                                    <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                                                )}
                                                <ul className="space-y-2">
                                                    {section.lessons && section.lessons.length > 0 ? (
                                                        section.lessons.map((lesson, index) => (
                                                            <li
                                                                key={lesson.id}
                                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-sm font-medium text-gray-500">
                                                                        {String(index + 1).padStart(2, '0')}
                                                                    </span>
                                                                    <span className="text-gray-700">{lesson.title}</span>
                                                                </div>
                                                                {lesson.is_preview && (
                                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                        Preview Available
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="text-center py-8 text-gray-500">
                                                            No lessons added yet. Click "Manage Curriculum" to add lessons.
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">No curriculum has been added to this course yet.</p>
                                    <button
                                        onClick={handleManageCurriculum}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#0066CC] text-white rounded-lg hover:bg-[#004c99] transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Add Curriculum
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div>

                            {course.enrollment_count > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Enrolled Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Progress
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {/* This would be populated with actual student data */}
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                                    <p>Student list will appear here once students enroll.</p>
                                                    <button
                                                        onClick={handleViewEnrollments}
                                                        className="mt-3 text-[#0066CC] hover:text-[#004c99] font-medium"
                                                    >
                                                        View detailed enrollments →
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">No students enrolled yet</p>
                                    <p className="text-sm text-gray-500">
                                        Once your course is published, students can enroll and you'll see them here.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Student Reviews</h3>
                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                                    <GraduationCap className="w-5 h-5 text-gray-500" />
                                    <span className="font-semibold">{parseFloat(course.average_rating || '0').toFixed(1)}</span>
                                    <span className="text-gray-500">/ 5.0</span>
                                    <span className="text-gray-400 mx-2">•</span>
                                    <span className="text-gray-600">{course.total_reviews || 0} reviews</span>
                                </div>
                            </div>

                            {reviews && reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.student_name)}&background=0066CC&color=fff`}
                                                        alt={review.student_name}
                                                        className="w-10 h-10 rounded-full mr-3"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{review.student_name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(review.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 ml-13">{review.review_text}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No reviews yet</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Reviews will appear here once students start reviewing your course.
                                    </p>
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