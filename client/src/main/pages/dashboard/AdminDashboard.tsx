/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, type JSX } from 'react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import {
    RefreshCw,
    CheckCircle2,
    Calendar as CalendarIcon,
    Sparkles,
    ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAnalytics } from '../../../hooks/useAnalytics'
import { useInstructorRequests } from '../../../hooks/useInstructorRequests'
import { useAdminCourses } from '../../../hooks/useAdminCourses'
import { usePayments } from '../../../hooks/usePayments'
import CalendarCard from '../../components/dashboard/CalendarCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { getInstructorRequestDetail, reviewInstructorRequest, getCourseDetail } from '../../../lib/api'
import type { InstructorRequest } from '../../../types'
import { StatsSection } from '../../components/dashboard/admin/StatsSection'
import { PendingCoursesCard } from '../../components/dashboard/admin/PendingCoursesCard'
import { PendingPaymentsCard } from '../../components/dashboard/admin/PendingPaymentsCard'
import { InstructorRequestFilters } from '../../components/dashboard/admin/InstructorRequestFilters'
import { InstructorRequestsList } from '../../components/dashboard/admin/InstructorRequestsList'
import { getStatusBadge, getStatusColor } from '../../../utils/statusHelpers'
import { InstructorRequestModal } from '../../components/dashboard/admin/InstructorRequestModal'
import { CourseReviewModal } from '../../components/dashboard/admin/CourseReviewModal'
import { CourseStatusPanel } from '../../components/dashboard/admin/CourseStatusPanel'
import { PlatformHealthCard } from '../../components/dashboard/admin/PlatformHealthCard'
import SEO from '../../components/SEO'

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

export function AdminDashboard(): JSX.Element {
    const { data, getAdminAnalytics, loading: analyticsLoading } = useAnalytics()
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

    const {
        payments,
        fetchPayments,
        loading: paymentsLoading,
    } = usePayments()

    const [isRefreshing, setIsRefreshing] = useState(false)
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

    const loadAllData = async () => {
        await Promise.all([
            getAdminAnalytics(),
            fetchInstructorRequests('ALL'),
            fetchPendingCourses('PENDING', null, { all: true }),
            fetchPayments({ status: 'PENDING' }),
        ])
    }

    useEffect(() => {
        loadAllData()
    }, [getAdminAnalytics, fetchInstructorRequests, fetchPendingCourses, fetchPayments])

    const handleManualRefresh = async () => {
        setIsRefreshing(true)
        try {
            await loadAllData()
            toast.success('Dashboard data refreshed!', { id: 'dash-refresh' })
        } catch {
            toast.error('Failed to refresh data', { id: 'dash-refresh-err' })
        } finally {
            setIsRefreshing(false)
        }
    }

    // Modal click-outside handlers
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
            toast.error('Failed to load course details')
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
            toast.success(`Course ${status.toLowerCase()} successfully!`)
            fetchPendingCourses('PENDING', null, { all: true })
            getAdminAnalytics()
            closeCourseModal()
        } catch (error) {
            console.error('Failed to review course:', error)
            toast.error('Failed to update course status')
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
            toast.error('Failed to load request details')
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
            toast.success(`Instructor request ${status.toLowerCase()}!`)
            fetchInstructorRequests(filterStatus === 'ALL' ? 'ALL' : filterStatus)
            getAdminAnalytics()
            closeModal()
        } catch (error) {
            console.error('Failed to review request:', error)
            toast.error('Failed to review instructor request')
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

    // Dynamic Time of Day Greeting
    const hour = new Date().getHours()
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

    const pendingPaymentsCount = payments.filter(p => p.status === 'PENDING').length
    const pendingCoursesCount = pendingCourses.length
    const pendingRequestsCount = data?.pending_instructor_requests || 0
    const totalPendingCount = pendingPaymentsCount + pendingCoursesCount + pendingRequestsCount

    if (analyticsLoading && !data) return <LoadingSpinner fullscreen text="Loading Admin Dashboard..." />

    return (
        <div className="py-6 px-4 md:px-6 space-y-6 mx-auto">
            <SEO title="Admin Dashboard | Control Center" noindex={true} />

            {/* ── 1. Top Header Banner with Live Refresh (Neutral Theme) ── */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-xs relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                                <Sparkles className="w-3 h-3 text-violet-600" />
                                Administrator Control Center
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                <CalendarIcon className="w-3 h-3 text-gray-400" />
                                {format(new Date(), 'EEEE, MMMM d, yyyy')}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-2xl font-bold tracking-tight text-gray-900">
                            {timeGreeting}, <span className="text-violet-600 font-extrabold">Admin</span> 👋
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-2xs hover:border-gray-300"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isRefreshing ? 'animate-spin text-violet-600' : ''}`} />
                            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                        </button>
                    </div>
                </div>

                {/* Live Action Center Ribbon (inside header banner) */}
                {totalPendingCount > 0 ? (
                    <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 bg-amber-50/50 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 p-4 sm:px-7 rounded-b-2xl border-b border-amber-100/60">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-amber-800">
                                    Action Required: {totalPendingCount} items in review queue
                                </span>
                                <span className="text-amber-300 text-xs hidden sm:inline">•</span>
                                <div className="flex items-center gap-2 text-xs text-amber-900">
                                    {pendingPaymentsCount > 0 && (
                                        <span className="bg-white/80 border border-amber-200/80 px-2 py-0.5 rounded-md font-medium text-[11px]">
                                            💳 {pendingPaymentsCount} Payments
                                        </span>
                                    )}
                                    {pendingCoursesCount > 0 && (
                                        <span className="bg-white/80 border border-amber-200/80 px-2 py-0.5 rounded-md font-medium text-[11px]">
                                            📚 {pendingCoursesCount} Courses
                                        </span>
                                    )}
                                    {pendingRequestsCount > 0 && (
                                        <span className="bg-white/80 border border-amber-200/80 px-2 py-0.5 rounded-md font-medium text-[11px]">
                                            👨‍🏫 {pendingRequestsCount} Instructors
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {pendingPaymentsCount > 0 && (
                                <Link
                                    to="/dashboard/admin/payments"
                                    className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 transition-colors"
                                >
                                    Verify Payments <ArrowRight className="w-3 h-3" />
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-emerald-700 font-medium relative z-10 bg-emerald-50/40 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 p-3.5 sm:px-7 rounded-b-2xl border-b border-emerald-100/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>All pending queues are clear! All courses, payments, and instructor requests have been processed.</span>
                    </div>
                )}
            </div>

            {/* ── 2. Metric Statistics Section ── */}
            <StatsSection data={data} />

            {/* ── 3. Main Operations Grid & Sidebar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left 8 Cols: Operational Cards */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Pending Courses & Pending Payments Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pending Courses */}
                        <PendingCoursesCard
                            courses={pendingCourses}
                            loading={coursesLoading}
                            onViewDetails={handleViewCourseDetails}
                        />

                        {/* Pending Payments */}
                        <PendingPaymentsCard
                            payments={payments}
                            loading={paymentsLoading}
                        />
                    </div>

                    {/* Instructor Requests Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <InstructorRequestFilters
                                filterStatus={filterStatus}
                                searchQuery={searchQuery}
                                totalCount={totalCount}
                                pendingCount={data?.pending_instructor_requests}
                                onFilterChange={handleStatusFilter}
                                onSearchChange={setSearchQuery}
                            />
                        </div>
                        <div className="p-5">
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

                {/* Right 4 Cols: Sidebar Panels */}
                <div className="lg:col-span-4 space-y-5">
                    {/* Interactive Calendar */}
                    <CalendarCard />
                    {/* Course Status Distribution */}
                    <CourseStatusPanel />

                    {/* Platform Resource Health Card */}
                    <PlatformHealthCard
                        totalCategories={data?.total_categories}
                        activeJobs={data?.total_active_jobs}
                        activePromoCodes={data?.total_promo_codes}
                        totalAdmins={data?.total_admins}
                    />
                </div>
            </div>

            {/* ── 5. Review & Detail Modals ── */}
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
