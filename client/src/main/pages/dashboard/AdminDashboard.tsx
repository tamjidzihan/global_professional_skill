/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, type JSX } from 'react'
import { useAnalytics } from '../../../hooks/useAnalytics'
import { useInstructorRequests } from '../../../hooks/useInstructorRequests'
import { useAdminCourses } from '../../../hooks/useAdminCourses'
import CalendarCard from '../../components/dashboard/CalendarCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { getInstructorRequestDetail, reviewInstructorRequest, getCourseDetail } from '../../../lib/api'
import type { InstructorRequest } from '../../../types'
import { StatsSection } from '../../components/dashboard/admin/StatsSection'
import { PendingCoursesCard } from '../../components/dashboard/admin/PendingCoursesCard'
import { InstructorRequestFilters } from '../../components/dashboard/admin/InstructorRequestFilters'
import { InstructorRequestsList } from '../../components/dashboard/admin/InstructorRequestsList'
import { getStatusBadge, getStatusColor } from '../../../utils/statusHelpers'
import { InstructorRequestModal } from '../../components/dashboard/admin/InstructorRequestModal'
import { CourseReviewModal } from '../../components/dashboard/admin/CourseReviewModal'
import { CourseStatusPanel } from '../../components/dashboard/admin/CourseStatusPanel'
import SEO from '../../components/SEO'

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

export function AdminDashboard(): JSX.Element {
    const { data, getAdminAnalytics, loading } = useAnalytics()
    const {
        requests: instructorRequests,
        fetchInstructorRequests,
        loading: requestsLoading,
        totalCount,
        nextPage,
        prevPage,
        loadNextPage,
        loadPrevPage,
    } = useInstructorRequests()

    const {
        courses: pendingCourses,
        fetchCourses: fetchPendingCourses,
        loading: coursesLoading,
        reviewCourseAction,
    } = useAdminCourses()

    const [selectedRequest, setSelectedRequest] = useState<InstructorRequest | null>(null)
    const [showDetails, setShowDetails] = useState<boolean>(false)
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [isReviewing, setIsReviewing] = useState<boolean>(false)
    const [reviewNotes, setReviewNotes] = useState<string>('')

    const [selectedCourse, setSelectedCourse] = useState<any | null>(null)
    const [showCourseModal, setShowCourseModal] = useState<boolean>(false)
    const [courseReviewNotes, setCourseReviewNotes] = useState<string>('')
    const [isReviewingCourse, setIsReviewingCourse] = useState<boolean>(false)

    const modalRef = useRef<HTMLDivElement>(null)
    const courseModalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        getAdminAnalytics()
        fetchInstructorRequests('ALL')
        fetchPendingCourses('PENDING')
    }, [getAdminAnalytics, fetchInstructorRequests, fetchPendingCourses])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node) && showDetails && !isReviewing) {
                closeModal()
            }
        }
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showDetails && !isReviewing) closeModal()
        }
        if (showDetails) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [showDetails, isReviewing])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (courseModalRef.current && !courseModalRef.current.contains(event.target as Node) && showCourseModal && !isReviewingCourse) {
                closeCourseModal()
            }
        }
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showCourseModal && !isReviewingCourse) closeCourseModal()
        }
        if (showCourseModal) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [showCourseModal, isReviewingCourse])

    const closeModal = () => {
        setShowDetails(false)
        setSelectedRequest(null)
        setIsReviewing(false)
    }

    const closeCourseModal = () => {
        setShowCourseModal(false)
        setSelectedCourse(null)
        setIsReviewingCourse(false)
    }

    const handleViewCourseDetails = async (courseId: string): Promise<void> => {
        try {
            const response = await getCourseDetail(courseId)
            setSelectedCourse(response.data.data)
            setCourseReviewNotes('')
            setShowCourseModal(true)
        } catch (error) {
            console.error('Failed to fetch course details:', error)
        }
    }

    const handleReviewCourse = async (
        courseId: string,
        status: 'APPROVED' | 'REJECTED' | 'PUBLISHED',
        feedback: string = ''
    ): Promise<void> => {
        setIsReviewingCourse(true)
        try {
            await reviewCourseAction(courseId, {
                status,
                feedback: feedback.trim() || `Your course has been ${status.toLowerCase()}.`,
            })
            fetchPendingCourses('PENDING')
            getAdminAnalytics()
            closeCourseModal()
        } catch (error) {
            console.error('Failed to review course:', error)
        } finally {
            setIsReviewingCourse(false)
        }
    }

    const handleViewDetails = async (requestId: string): Promise<void> => {
        try {
            const response = await getInstructorRequestDetail<{ success: boolean; data: InstructorRequest }>(requestId)
            setSelectedRequest(response.data.data)
            setReviewNotes('')
            setShowDetails(true)
        } catch (error) {
            console.error('Failed to fetch request details:', error)
        }
    }

    const handleStatusFilter = (status: FilterStatus): void => {
        setFilterStatus(status)
        fetchInstructorRequests(status === 'ALL' ? 'ALL' : status)
    }

    const handleReview = async (
        requestId: string,
        status: 'APPROVED' | 'REJECTED',
        feedback: string = ''
    ): Promise<void> => {
        setIsReviewing(true)
        try {
            await reviewInstructorRequest(requestId, {
                status,
                feedback: feedback.trim() ||
                    (status === 'APPROVED'
                        ? 'Your instructor request has been approved.'
                        : 'Your instructor request has been reviewed and rejected.'),
            })
            fetchInstructorRequests(filterStatus === 'ALL' ? 'ALL' : filterStatus)
            closeModal()
        } catch (error) {
            console.error('Failed to review request:', error)
        } finally {
            setIsReviewing(false)
        }
    }

    const safeRequests = Array.isArray(instructorRequests) ? instructorRequests : []
    const filteredRequests = safeRequests.filter((request: InstructorRequest) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                request.user_name?.toLowerCase().includes(query) ||
                request.user_email?.toLowerCase().includes(query) ||
                request.reason?.toLowerCase().includes(query) ||
                request.qualifications?.toLowerCase().includes(query) ||
                request.teaching_interests?.toLowerCase().includes(query)
            )
        }
        return true
    })

    if (loading) return <LoadingSpinner />

    return (
        <div className="py-6 px-4 md:px-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <SEO title="Admin Dashboard" noindex={true} />

            <div className="lg:col-span-3 space-y-6">

                {/* ── Page header ── */}
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        System-wide statistics and management panel
                    </p>
                </div>

                {/* ── Stats ── */}
                <StatsSection data={data} />

                {/* ── Management cards ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Pending Courses */}
                    <PendingCoursesCard
                        courses={pendingCourses}
                        loading={coursesLoading}
                        onViewDetails={handleViewCourseDetails}
                    />

                    {/* Instructor Requests */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <InstructorRequestFilters
                                filterStatus={filterStatus}
                                searchQuery={searchQuery}
                                totalCount={totalCount}
                                pendingCount={data?.pending_instructor_requests}
                                onFilterChange={handleStatusFilter}
                                onSearchChange={setSearchQuery}
                            />
                        </div>
                        <div className="p-4">
                            <InstructorRequestsList
                                requests={filteredRequests}
                                loading={requestsLoading}
                                filterStatus={filterStatus}
                                searchQuery={searchQuery}
                                totalCount={totalCount}
                                nextPage={nextPage}
                                prevPage={prevPage}
                                onViewDetails={handleViewDetails}
                                onNextPage={loadNextPage}
                                onPrevPage={loadPrevPage}
                                getStatusBadge={getStatusBadge}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Sidebar column ── */}
            <div className="lg:col-span-1 space-y-4">
                <CalendarCard />
                <CourseStatusPanel />
            </div>

            {/* ── Modals ── */}
            {selectedRequest && (
                <InstructorRequestModal
                    request={selectedRequest}
                    isOpen={showDetails}
                    isReviewing={isReviewing}
                    reviewNotes={reviewNotes}
                    modalRef={modalRef}
                    onClose={closeModal}
                    onReviewNotesChange={setReviewNotes}
                    onReview={handleReview}
                    getStatusColor={getStatusColor}
                    getStatusBadge={getStatusBadge}
                />
            )}

            {selectedCourse && (
                <CourseReviewModal
                    course={selectedCourse}
                    isOpen={showCourseModal}
                    isReviewing={isReviewingCourse}
                    reviewNotes={courseReviewNotes}
                    modalRef={courseModalRef}
                    onClose={closeCourseModal}
                    onReviewNotesChange={setCourseReviewNotes}
                    onReview={handleReviewCourse}
                />
            )}
        </div>
    )
}