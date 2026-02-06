import { useEffect, useRef, useState, type JSX } from 'react'
import { StatsCard } from '../../components/dashboard/StatsCard'
import {
    Users,
    BookOpen,
    GraduationCap,
    AlertCircle,
    Mail,
    User,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react'
import { useAnalytics } from '../../../hooks/useAnalytics'
import { useInstructorRequests } from '../../../hooks/useInstructorRequests'
import CalendarCard from '../../components/dashboard/CalendarCard'
import { format } from 'date-fns'
import type { InstructorRequest } from '../../../types'
import { getInstructorRequestDetail, reviewInstructorRequest } from '../../../lib/api'

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

interface DetailSectionProps {
    title: string;
    content: string;
}

function DetailSection({ title, content }: DetailSectionProps): JSX.Element | null {
    if (!content || content.trim() === '') return null

    return (
        <div>
            <h4 className="font-medium text-gray-700 mb-2">{title}</h4>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-line">
                {content}
            </div>
        </div>
    )
}

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
        loadPrevPage
    } = useInstructorRequests()

    const [selectedRequest, setSelectedRequest] = useState<InstructorRequest | null>(null)
    const [showDetails, setShowDetails] = useState<boolean>(false)
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [isReviewing, setIsReviewing] = useState<boolean>(false)
    const [reviewNotes, setReviewNotes] = useState<string>('')

    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        getAdminAnalytics()
        fetchInstructorRequests('ALL')
    }, [getAdminAnalytics, fetchInstructorRequests])

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                showDetails &&
                !isReviewing
            ) {
                closeModal()
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showDetails && !isReviewing) {
                closeModal()
            }
        }

        if (showDetails) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden' // Prevent scrolling
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset' // Restore scrolling
        }
    }, [showDetails, isReviewing])

    const closeModal = () => {
        setShowDetails(false)
        setSelectedRequest(null)
        setIsReviewing(false)
    }

    const handleViewDetails = async (requestId: string): Promise<void> => {
        try {
            const response = await getInstructorRequestDetail<{ success: boolean; data: InstructorRequest }>(requestId)
            setSelectedRequest(response.data.data)
            setReviewNotes('') // Clear any previous review notes
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
                        : 'Your instructor request has been reviewed and rejected.')
            })
            // Refresh the list
            fetchInstructorRequests(filterStatus === 'ALL' ? 'ALL' : filterStatus)
            closeModal()
        } catch (error) {
            console.error('Failed to review request:', error)
        } finally {
            setIsReviewing(false)
        }
    }

    const getStatusIcon = (status: string): JSX.Element => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'REJECTED':
                return <XCircle className="w-4 h-4 text-red-500" />
            case 'PENDING':
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />
        }
    }

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-50 text-green-800 border-green-200'
            case 'REJECTED':
                return 'bg-red-50 text-red-800 border-red-200'
            case 'PENDING':
                return 'bg-yellow-50 text-yellow-800 border-yellow-200'
            default:
                return 'bg-gray-50 text-gray-800 border-gray-200'
        }
    }

    const getStatusBadge = (status: string): JSX.Element => {
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)} border`}>
                {getStatusIcon(status)}
                <span className="ml-1.5">{status}</span>
            </span>
        )
    }

    // Ensure instructorRequests is always an array for filtering
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1 text-sm md:text-base">
                        System-wide statistics and management panel
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Users"
                        value={data?.total_users || 0}
                        icon={Users}
                        color="blue"
                    />
                    <StatsCard
                        title="Total Courses"
                        value={data?.total_courses || 0}
                        icon={BookOpen}
                        color="green"
                    />
                    <StatsCard
                        title="Enrollments"
                        value={data?.total_enrollments || 0}
                        icon={GraduationCap}
                        color="blue"
                    />
                    <StatsCard
                        title="Pending Approvals"
                        value={
                            (data?.pending_courses || 0) +
                            (data?.pending_instructor_requests || 0)
                        }
                        icon={AlertCircle}
                        color="red"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Courses Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Pending Courses
                            </h2>
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {data?.pending_courses || 0}
                            </span>
                        </div>
                        {data?.pending_courses > 0 ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                Advanced React Patterns
                                            </p>
                                            <p className="text-sm text-gray-500 mt-0.5">Submitted by John Doe</p>
                                        </div>
                                        <button className="ml-3 text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
                                            Review →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">
                                    No pending courses to review.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Instructor Requests Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Instructor Requests
                                </h2>
                                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                    {totalCount}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search requests..."
                                            value={searchQuery}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
                                        />
                                    </div>

                                    <div className="relative">
                                        <select
                                            value={filterStatus}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                                handleStatusFilter(e.target.value as FilterStatus)
                                            }
                                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
                                        >
                                            <option value="ALL">All Status</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Status Filter Tabs */}
                            <div className="flex space-x-1 border-b border-gray-200">
                                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as FilterStatus[]).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusFilter(status)}
                                        className={`px-3 py-2 text-xs font-medium transition-colors relative ${filterStatus === status
                                            ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {status}
                                        {status === 'PENDING' && data?.pending_instructor_requests && data.pending_instructor_requests > 0 && (
                                            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                                {data.pending_instructor_requests}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {requestsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredRequests.length > 0 ? (
                            <>
                                <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
                                    {filteredRequests.map((request: InstructorRequest) => (
                                        <div
                                            key={request.id}
                                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                                            onClick={() => handleViewDetails(request.id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                                <User className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-gray-900 truncate">
                                                                    {request.user_name || 'No Name'}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                                                    <p className="text-sm text-gray-500 truncate">
                                                                        {request.user_email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0">
                                                            {getStatusBadge(request.status)}
                                                        </div>
                                                    </div>

                                                    {request.reason && (
                                                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                            <span className="font-medium">Reason:</span> {request.reason}
                                                        </p>
                                                    )}

                                                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {format(new Date(request.created_at), 'MMM d, yyyy')}
                                                        </span>
                                                        {request.reviewed_at && (
                                                            <>
                                                                <span className="text-gray-300">•</span>
                                                                <span>
                                                                    Reviewed: {format(new Date(request.reviewed_at), 'MMM d')}
                                                                </span>
                                                            </>
                                                        )}
                                                        {request.reviewed_by_email && (
                                                            <>
                                                                <span className="text-gray-300">•</span>
                                                                <span className="truncate max-w-30">
                                                                    By: {request.reviewed_by_email}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {(nextPage || prevPage) && (
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={loadPrevPage}
                                            disabled={!prevPage}
                                            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${prevPage
                                                ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            Previous
                                        </button>

                                        <span className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded">
                                            Showing {filteredRequests.length} of {totalCount}
                                        </span>

                                        <button
                                            onClick={loadNextPage}
                                            disabled={!nextPage}
                                            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${nextPage
                                                ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-200">
                                    <User className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium mb-1">
                                    {searchQuery
                                        ? 'No matching requests found'
                                        : filterStatus === 'ALL'
                                            ? 'No instructor requests yet'
                                            : `No ${filterStatus.toLowerCase()} requests`
                                    }
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {searchQuery
                                        ? 'Try a different search term'
                                        : 'Requests will appear here when submitted'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                <CalendarCard />
            </div>

            {showDetails && selectedRequest && (
                <>
                    {/* Backdrop with blur effect */}
                    <div
                        className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-[2px] transition-all duration-200"
                        onClick={closeModal}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <div
                            ref={modalRef}
                            className="relative bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200 pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Review Instructor Request
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            ID: <span className="font-mono text-xs">{selectedRequest.id.slice(0, 8)}...</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        aria-label="Close modal"
                                        disabled={isReviewing}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                                <div className="space-y-6">
                                    {/* Applicant Info */}
                                    <div className={`p-5 rounded-xl border ${getStatusColor(selectedRequest.status)}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border">
                                                    <User className="w-6 h-6 text-gray-700" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">
                                                        {selectedRequest.user_name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Mail className="w-4 h-4 text-gray-500" />
                                                        <p className="text-gray-600">{selectedRequest.user_email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {getStatusBadge(selectedRequest.status)}
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Submitted
                                            </p>
                                            <p className="text-gray-900 font-medium">
                                                {format(new Date(selectedRequest.created_at), 'PPP p')}
                                            </p>
                                        </div>
                                        {selectedRequest.reviewed_at && (
                                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-sm font-medium text-gray-700 mb-1">
                                                    Reviewed
                                                </p>
                                                <p className="text-gray-900 font-medium">
                                                    {format(new Date(selectedRequest.reviewed_at), 'PPP p')}
                                                </p>
                                                {selectedRequest.reviewed_by_email && (
                                                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        By: {selectedRequest.reviewed_by_email}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details Sections */}
                                    <DetailSection title="Reason for Application" content={selectedRequest.reason} />
                                    <DetailSection title="Qualifications" content={selectedRequest.qualifications} />
                                    <DetailSection title="Teaching Interests" content={selectedRequest.teaching_interests} />

                                    {selectedRequest.review_notes && selectedRequest.review_notes.trim() !== '' && (
                                        <DetailSection title="Previous Review Notes" content={selectedRequest.review_notes} />
                                    )}

                                    {/* Action Buttons with Feedback Input */}
                                    {selectedRequest.status === 'PENDING' && (
                                        <div className="pt-6 border-t border-gray-200 space-y-4">
                                            <div>
                                                <p className="font-medium text-gray-700 mb-2">Review Notes</p>
                                                <textarea
                                                    id="reviewNotes"
                                                    rows={3}
                                                    value={reviewNotes}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNotes(e.target.value)}
                                                    placeholder="Enter your review notes or feedback for the applicant..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Optional: Add feedback that will be visible to the applicant
                                                </p>
                                            </div>

                                            <p className="font-medium text-gray-700">Review Decision</p>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={() => handleReview(selectedRequest.id, 'APPROVED', reviewNotes)}
                                                    disabled={isReviewing}
                                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isReviewing ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-5 h-5" />
                                                            Approve Request
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleReview(selectedRequest.id, 'REJECTED', reviewNotes)}
                                                    disabled={isReviewing}
                                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isReviewing ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-5 h-5" />
                                                            Reject Request
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 text-center">
                                                {isReviewing
                                                    ? 'Processing request...'
                                                    : 'Click outside or press ESC to close'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}



        </div>
    )
}