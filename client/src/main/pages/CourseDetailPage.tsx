/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    Layers,
    Clock,
    Users,
    Calendar,
    MapPin,
    Star,
    Plus,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    BookOpen,
    Award,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCourses } from '../../hooks/useCourses'
import Breadcrumb from '../components/Breadcrumb'
import CourseDetailSkeleton from '../components/loadingSkeleton/CourseDetailSkeleton'

export function CourseDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const {
        course,
        loading,
        error,
        fetchCourseDetail,
        submitForReview,
        // adminReviewCourse,
        addReview,
        fetchReviews,
        reviews,
        clearStates,
    } = useCourses()

    const [activeTab, setActiveTab] = useState('description')
    const [expandedModules, setExpandedModules] = useState<string[]>([])
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewText, setReviewText] = useState('')
    const [showAdminReviewModal, setShowAdminReviewModal] = useState(false)
    const [adminReviewStatus, setAdminReviewStatus] = useState<'APPROVED' | 'PUBLISHED' | 'REJECTED'>('APPROVED')
    const [adminReviewNotes, setAdminReviewNotes] = useState('')
    const [enrollLoading, setEnrollLoading] = useState(false)

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

    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) =>
            prev.includes(moduleId)
                ? prev.filter((id) => id !== moduleId)
                : [...prev, moduleId],
        )
    }

    const handleEnrollNow = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/courses/${id}` } })
            return
        }

        if (!course?.is_admission_open) {
            alert('Admission is currently closed for this course.')
            return
        }

        if (course?.is_full) {
            alert('Sorry, this course is full. No seats available.')
            return
        }

        setEnrollLoading(true)
        try {
            // TODO: Implement enrollment API call
            // await enrollInCourse(course.id)
            alert('Successfully enrolled in the course!')
        } catch (error) {
            console.error('Enrollment failed:', error)
            alert('Failed to enroll. Please try again.')
        } finally {
            setEnrollLoading(false)
        }
    }

    const handleSubmitForReview = async () => {
        if (!id) return
        try {
            await submitForReview(id)
            alert('Course submitted for review successfully!')
        } catch (error) {
            console.error('Failed to submit for review:', error)
        }
    }

    // const handleAdminReview = async () => {
    //     if (!id) return
    //     try {
    //         await adminReviewCourse(id, {
    //             status: adminReviewStatus,
    //             review_notes: adminReviewNotes,
    //         })
    //         setShowAdminReviewModal(false)
    //         alert(`Course ${adminReviewStatus.toLowerCase()} successfully!`)
    //     } catch (error) {
    //         console.error('Failed to review course:', error)
    //         alert('Failed to review course. Please try again.')
    //     }
    // }

    const handleAddReview = async () => {
        if (!id || !user) return
        try {
            await addReview(id, {
                course: id,
                rating: reviewRating,
                review_text: reviewText,
            })
            setShowReviewModal(false)
            setReviewRating(5)
            setReviewText('')
            alert('Review submitted successfully!')
        } catch (error: any) {
            console.error('Failed to submit review:', error)
            alert(error.message || 'Failed to submit review. Please try again.')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Published</span>
            case 'PENDING':
                return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Pending Review</span>
            case 'APPROVED':
                return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Approved</span>
            case 'REJECTED':
                return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Rejected</span>
            default:
                return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">Draft</span>
        }
    }

    const getSeatStatusColor = () => {
        if (!course) return 'bg-gray-100'
        const percentage = (course.available_seats / course.total_seats) * 100
        if (course.available_seats <= 0) return 'bg-red-100 text-red-800'
        if (percentage <= 20) return 'bg-orange-100 text-orange-800'
        return 'bg-green-100 text-green-800'
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
                        to="/courses"
                        className="inline-block bg-[#0066CC] text-white px-6 py-3 rounded-lg hover:bg-[#004c99] transition-colors"
                    >
                        Browse Courses
                    </Link>
                </div>
            </div>
        )
    }

    const breadcrumbSubtitle = `${course.total_classes} classes • ${course.difficulty_level} • ${course.enrollment_count} enrolled`

    return (
        <>
            {/* Breadcrumb Navigation */}
            <Breadcrumb
                name={course.title}
                subtitle={breadcrumbSubtitle}
                icon={BookOpen}
            />

            {/* Course Header */}
            <div className="bg-[#f5f5dc] py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Left: Course Info */}
                        <div className="flex-1">
                            {/* Status Badges */}
                            <div className="flex items-center gap-3 mb-3">
                                {getStatusBadge(course.status)}
                                {!course.is_admission_open && (
                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Admission Closed
                                    </span>
                                )}
                                {course.is_full && (
                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Course Full
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-[#0066CC] mb-2">
                                {course.title}
                            </h1>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="ml-1 text-gray-700">{parseFloat(course.average_rating).toFixed(1)}</span>
                                    <span className="ml-1 text-gray-500">({course.total_reviews} reviews)</span>
                                </div>
                                <span className="text-gray-800">•</span>
                                <span className="text-gray-700">{course.category?.name || 'Uncategorized'}</span>
                                <span className="text-gray-800">•</span>
                                <span className="text-gray-700">{course.difficulty_level}</span>
                            </div>

                            <p className="text-gray-600 mb-6">{course.short_description}</p>

                            {/* Info Cards Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                <div className="bg-[#0066CC] text-white px-4 py-3 rounded-lg flex items-center transition-transform hover:scale-[1.02]">
                                    <Layers className="w-6 h-6 mr-3" />
                                    <div className=' flex flex-row items-center gap-2'>
                                        <div className="text-md">Total Classes :</div>
                                        <div className="text-2xl font-bold">
                                            {course.total_classes}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#0066CC] text-white px-4 py-3 rounded-lg flex items-center transition-transform hover:scale-[1.02]">
                                    <Clock className="w-6 h-6 mr-3" />
                                    <div className=' flex flex-row items-center gap-2'>
                                        <div className="text-md">Total Hours :</div>
                                        <div className="text-2xl font-bold">
                                            {course.duration_hours}
                                        </div>
                                    </div>
                                </div>
                                <div className={`${getSeatStatusColor()} px-4 py-3 rounded-lg flex items-center transition-transform hover:scale-[1.02]`}>
                                    <Users className="w-6 h-6 mr-3" />
                                    <div className=' flex flex-row items-center gap-2'>
                                        <div className="text-md">Available Seats :</div>
                                        <div className="text-2xl font-bold">
                                            {course.available_seats}
                                        </div>
                                        <div className="text-xs opacity-75">
                                            (  of {course.total_seats} total )
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                <div className="bg-[#e8f5e9] border-l-4 border-[#76C043] p-4 rounded transition-colors hover:bg-[#dff0d8]">
                                    <div className="flex items-start">
                                        <Calendar className="w-5 h-5 text-[#76C043] mr-2 mt-0.5" />
                                        <div className="text-md">
                                            <div className="font-semibold text-gray-800">
                                                Class Starts: {course.class_starts ? new Date(course.class_starts).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                                            </div>
                                            <div className="text-gray-600">
                                                Deadline: {course.admission_deadline ? new Date(course.admission_deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#e8f5e9] border-l-4 border-[#76C043] p-4 rounded transition-colors hover:bg-[#dff0d8]">
                                    <div className="flex items-start">
                                        <Clock className="w-5 h-5 text-[#76C043] mr-2 mt-0.5" />
                                        <div className="text-md">
                                            <div className="font-semibold text-gray-800">
                                                Schedule:
                                            </div>
                                            <div className="text-gray-600">{course.schedule || 'TBA'}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#e8f5e9] border-l-4 border-[#76C043] p-4 rounded transition-colors hover:bg-[#dff0d8]">
                                    <div className="flex items-start">
                                        <MapPin className="w-5 h-5 text-[#76C043] mr-2 mt-0.5" />
                                        <div className="text-md">
                                            <div className="font-semibold text-gray-800">Venue:</div>
                                            <div className="text-gray-600">{course.venue || 'TBA'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-gray-600">Course Fee:</span>
                                        <div className="flex items-baseline">
                                            <span className="text-2xl md:text-3xl font-bold text-gray-800">
                                                TK. {parseFloat(course.price).toLocaleString()}
                                            </span>
                                            {course.is_free && (
                                                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                                                    FREE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {course.is_free ? 'Free course' : 'Pay once, get lifetime access'}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    {user?.role === 'INSTRUCTOR' && user.id === course.instructor.id && (
                                        <>
                                            <Link
                                                to={`/instructor/courses/${course.id}/edit`}
                                                className="bg-white text-[#0066CC] border-2 border-[#0066CC] px-6 py-3 rounded font-bold hover:bg-[#0066CC] hover:text-white transition-colors"
                                            >
                                                Edit Course
                                            </Link>
                                            {course.status === 'DRAFT' && (
                                                <button
                                                    onClick={handleSubmitForReview}
                                                    className="bg-[#76C043] text-white px-6 py-3 rounded font-bold hover:bg-[#65a838] transition-colors"
                                                >
                                                    Submit for Review
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {user?.role === 'ADMIN' && course.status !== 'PUBLISHED' && (
                                        <button
                                            onClick={() => setShowAdminReviewModal(true)}
                                            className="bg-[#0066CC] text-white px-6 py-3 rounded font-bold hover:bg-[#004c99] transition-colors"
                                        >
                                            Review Course
                                        </button>
                                    )}
                                    {course.status === 'PUBLISHED' && (
                                        <button
                                            onClick={handleEnrollNow}
                                            disabled={!course.is_admission_open || course.is_full || enrollLoading}
                                            className={`px-8 py-3 rounded font-bold transition-colors shadow-md hover:shadow-lg ${course.is_enrolled
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : !course.is_admission_open || course.is_full
                                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                                    : 'bg-[#76C043] text-white hover:bg-[#65a838]'
                                                }`}
                                        >
                                            {enrollLoading ? 'Processing...' : course.is_enrolled ? 'Enrolled' : 'Enroll Now'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Course Banner */}
                        <div className="w-full lg:w-120 shrink-0">
                            {course.thumbnail ? (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full max-h-94 object-cover rounded-lg shadow-xl"
                                />
                            ) : (
                                <div className="bg-linear-to-br from-[#1a237e] to-[#0d47a1] rounded-lg p-8 text-white relative overflow-hidden shadow-xl h-64 flex items-center justify-center">
                                    <div className="relative z-10 text-center">
                                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-2xl font-bold mb-2">GPIBD Course</h3>
                                        <p className="text-lg">{course.category.name}</p>
                                    </div>
                                </div>
                            )}

                            {/* Share and Save Buttons */}
                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                                    </svg>
                                    Share
                                </button>
                                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Course Details */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Course Details
                        </h2>

                        {/* Tabs */}
                        <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'description' ? 'border-b-2 border-[#76C043] text-[#76C043]' : 'text-gray-600 hover:text-gray-800 cursor-pointer'}`}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setActiveTab('curriculum')}
                                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'curriculum' ? 'border-b-2 border-[#76C043] text-[#76C043]' : 'text-gray-600 hover:text-gray-800 cursor-pointer'}`}
                            >
                                Curriculum
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white h-180 overflow-y-scroll rounded-lg px-10 py-6 border border-gray-200 shadow-sm">
                            {activeTab === 'description' && (
                                <div className="space-y-6 text-gray-700">
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-800">Course Overview</h3>
                                        <p className="text-justify leading-relaxed whitespace-pre-line">
                                            {course.description}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-800">Key Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="font-medium">Total Classes</span>
                                                <span className="text-[#0066CC] font-bold">{course.total_classes}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="font-medium">Total Hours</span>
                                                <span className="text-[#0066CC] font-bold">{course.duration_hours}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="font-medium">Course Fee</span>
                                                <span className="font-bold">
                                                    {course.is_free ? 'Free' : `BDT ${parseFloat(course.price).toLocaleString()}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="font-medium">Difficulty Level</span>
                                                <span className="font-bold capitalize">{course.difficulty_level.toLowerCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {course.target_audience && (
                                        <div className="space-y-3">
                                            <h3 className="text-lg font-bold text-gray-800">Target Audience</h3>
                                            <p className="text-justify leading-relaxed">{course.target_audience}</p>
                                        </div>
                                    )}
                                    {course.requirements && (
                                        <div className="space-y-3">
                                            <h3 className="text-lg font-bold text-gray-800">Requirements</h3>
                                            <p className="text-justify leading-relaxed">{course.requirements || 'No specific requirements. Everyone can join!'}</p>
                                        </div>
                                    )}
                                    {course.learning_outcomes && (
                                        <div className="space-y-3">
                                            <h3 className="text-lg font-bold text-gray-800">What You'll Learn</h3>
                                            <p className="text-justify leading-relaxed"> {course.learning_outcomes}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'curriculum' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Course Curriculum ({course.sections?.length || 0} Modules)
                                        </h3>
                                        {course.sections && course.sections.length > 0 && (
                                            <button
                                                onClick={() => setExpandedModules(
                                                    expandedModules.length === course.sections.length
                                                        ? []
                                                        : course.sections.map(s => s.id)
                                                )}
                                                className="text-sm text-[#0066CC] hover:text-[#004c99] font-medium"
                                            >
                                                {expandedModules.length === course.sections.length
                                                    ? 'Collapse All'
                                                    : 'Expand All'
                                                }
                                            </button>
                                        )}
                                    </div>
                                    {course.sections && course.sections.length > 0 ? (
                                        course.sections.map((section) => (
                                            <div
                                                key={section.id}
                                                className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-[#76C043]"
                                            >
                                                {/* Module Header */}
                                                <button
                                                    onClick={() => toggleModule(section.id)}
                                                    className={`w-full flex items-center justify-between p-4 transition-all ${expandedModules.includes(section.id) ? 'bg-[#e8f5e9]' : 'bg-gray-50 hover:bg-gray-100'}`}
                                                >
                                                    <div className="flex items-center">
                                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0066CC] text-white font-bold mr-4">
                                                            {section.order}
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="block font-medium text-gray-800">
                                                                {section.title}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {section.lesson_count} lessons
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-gray-500 hidden md:inline">
                                                            {expandedModules.includes(section.id) ? 'Hide' : 'Show'}
                                                        </span>
                                                        {expandedModules.includes(section.id) ? (
                                                            <ChevronUp className="w-5 h-5 text-gray-600" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-gray-600" />
                                                        )}
                                                    </div>
                                                </button>

                                                {/* Module Content */}
                                                {expandedModules.includes(section.id) && (
                                                    <div className="p-6 bg-white">
                                                        {section.description && (
                                                            <p className="text-gray-600 mb-4 text-sm">{section.description}</p>
                                                        )}
                                                        <ul className="space-y-3">
                                                            {section.lessons && section.lessons.length > 0 ? (
                                                                section.lessons.map((lesson, index) => (
                                                                    <li
                                                                        key={lesson.id}
                                                                        className="flex items-start group"
                                                                    >
                                                                        <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 text-sm mr-3 group-hover:bg-[#76C043] group-hover:text-white transition-colors">
                                                                            {index + 1}
                                                                        </span>
                                                                        <div className="flex-1 flex items-center justify-between">
                                                                            <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                                                                                {lesson.title}
                                                                            </span>
                                                                            {lesson.is_preview && (
                                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                                    Preview
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="text-gray-500 text-center py-4">
                                                                    No lessons in this section yet.
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600">No curriculum available yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="w-full lg:w-100">
                        {/* Instructors */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-[#0066CC]" />
                                Instructor
                            </h3>
                            <div className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                {course.instructor.profile_picture ? (
                                    <img
                                        src={course.instructor.profile_picture}
                                        alt={course.instructor.full_name || course.instructor.email}
                                        className="w-16 h-16 rounded-full mr-4 border-2 border-[#0066CC] object-cover"
                                    />
                                ) : (
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            course.instructor.full_name || course.instructor.email
                                        )}&background=0066CC&color=fff`}
                                        alt={course.instructor.full_name || course.instructor.email}
                                        className="w-16 h-16 rounded-full mr-4 border-2 border-[#0066CC]"
                                    />
                                )}
                                <div>
                                    <p className="font-bold text-gray-800">
                                        {course.instructor.full_name || course.instructor.email}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-1">
                                        Instructor
                                    </p>
                                    {course.instructor.bio && (
                                        <p className="text-sm text-gray-600 line-clamp-2">{course.instructor.bio}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Who can Join */}
                        {course.who_can_join && (
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-[#0066CC]" />
                                    Who can Join?
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                    {course.who_can_join}
                                </p>
                            </div>
                        )}

                        {/* Course Stats */}
                        {/* <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Course Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Enrolled Students</span>
                                    <span className="font-bold text-[#0066CC]">{course.enrollment_count}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Available Seats</span>
                                    <span className={`font-bold ${course.available_seats <= 0 ? 'text-red-600' : 'text-[#0066CC]'}`}>
                                        {course.available_seats}/{course.total_seats}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Total Classes</span>
                                    <span className="font-bold text-[#0066CC]">{course.total_classes}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Average Rating</span>
                                    <span className="font-bold text-[#0066CC]">{parseFloat(course.average_rating).toFixed(1)}/5.0</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Total Reviews</span>
                                    <span className="font-bold text-[#0066CC]">{course.total_reviews}</span>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Course Reviews */}
                {course.status === 'PUBLISHED' && (
                    <div className="mt-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-gray-800">Course Reviews</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <span className="ml-2 text-gray-800 font-bold">{parseFloat(course.average_rating).toFixed(1)}</span>
                                    <span className="ml-1 text-gray-600">({course.total_reviews} ratings)</span>
                                </div>
                                {user && !course.is_enrolled && (
                                    <button
                                        onClick={handleEnrollNow}
                                        disabled={!course.is_admission_open || course.is_full}
                                        className="bg-[#0066CC] text-white px-6 py-2 rounded-lg hover:bg-[#004c99] transition-colors"
                                    >
                                        Enroll to Review
                                    </button>
                                )}
                                {user && course.is_enrolled && (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="bg-[#76C043] text-white px-6 py-2 rounded-lg flex items-center hover:bg-[#65a838] transition-colors shadow-md hover:shadow-lg"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Review
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Rating Summary */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4">Rating Breakdown</h3>
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    // Calculate percentage based on reviews
                                    const count = reviews?.filter(r => Math.floor(r.rating) === stars).length || 0
                                    const percentage = reviews?.length ? (count / reviews.length) * 100 : 0

                                    return (
                                        <div key={stars} className="flex items-center mb-2">
                                            <div className="flex w-20">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mx-3">
                                                <div
                                                    className="h-full bg-yellow-400"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-600 w-10 text-right">
                                                {percentage.toFixed(0)}%
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Recent Reviews */}
                            <div className="md:col-span-2 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4">Recent Reviews</h3>
                                {reviews && reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.slice(0, 3).map((review) => (
                                            <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                                                <div className="flex items-center mb-2">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.student_name)}&background=0066CC&color=fff`}
                                                        alt={review.student_name}
                                                        className="w-10 h-10 rounded-full mr-3"
                                                    />
                                                    <div>
                                                        <p className="font-medium">{review.student_name}</p>
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                                />
                                                            ))}
                                                            <span className="text-xs text-gray-500 ml-2">
                                                                {new Date(review.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm">{review.review_text}</p>
                                            </div>
                                        ))}
                                        {reviews.length > 3 && (
                                            <div className="text-center pt-2">
                                                <button className="text-[#0066CC] hover:text-[#004c99] font-medium">
                                                    View all {reviews.length} reviews →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-2">No reviews yet</p>
                                        {course.is_enrolled && (
                                            <p className="text-sm text-gray-500">
                                                Be the first to review this course!
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Review Modal */}
            {showAdminReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Review Course</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Review Decision
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="APPROVED"
                                            checked={adminReviewStatus === 'APPROVED'}
                                            onChange={(e) => setAdminReviewStatus(e.target.value as any)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Approved</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="PUBLISHED"
                                            checked={adminReviewStatus === 'PUBLISHED'}
                                            onChange={(e) => setAdminReviewStatus(e.target.value as any)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Publish Now</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="REJECTED"
                                            checked={adminReviewStatus === 'REJECTED'}
                                            onChange={(e) => setAdminReviewStatus(e.target.value as any)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Reject</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Review Notes
                                </label>
                                <textarea
                                    value={adminReviewNotes}
                                    onChange={(e) => setAdminReviewNotes(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                                    placeholder="Add feedback for the instructor..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowAdminReviewModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            {/* <button
                                onClick={handleAdminReview}
                                className="px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#004c99] transition-colors"
                            >
                                Submit Review
                            </button> */}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Write a Review</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            onClick={() => setReviewRating(rating)}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${rating <= reviewRating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Review
                                </label>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                                    placeholder="Share your experience with this course..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddReview}
                                disabled={!reviewText.trim()}
                                className="px-4 py-2 bg-[#76C043] text-white rounded-lg hover:bg-[#65a838] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}