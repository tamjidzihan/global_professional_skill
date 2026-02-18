import { CheckCircle, XCircle, Rocket } from 'lucide-react'
import type { JSX, RefObject } from 'react'
import { DetailSection } from './DetailSection'
import type { CourseDetail } from '../../../../types'

interface CourseReviewModalProps {
    course: CourseDetail
    isOpen: boolean
    isReviewing: boolean
    reviewNotes: string
    modalRef: RefObject<HTMLDivElement | null>
    onClose: () => void
    onReviewNotesChange: (notes: string) => void
    onReview: (id: string, status: 'APPROVED' | 'REJECTED' | 'PUBLISHED', notes: string) => void
}

export function CourseReviewModal({
    course,
    isOpen,
    isReviewing,
    reviewNotes,
    modalRef,
    onClose,
    onReviewNotesChange,
    onReview
}: CourseReviewModalProps): JSX.Element | null {
    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-[2px] transition-all duration-200"
                onClick={onClose}
            />

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
                                    Review Course: {course.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Instructor: {course.instructor?.first_name} {course.instructor?.last_name}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
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

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                        <div className="space-y-6">
                            {/* Course Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Category</p>
                                    <p className="text-gray-900 font-medium">{course.category?.name}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Price</p>
                                    <p className="text-gray-900 font-medium">${course.price}</p>
                                </div>
                            </div>

                            <DetailSection title="Description" content={course.description} />

                            {/* Review Actions */}
                            <div className="pt-6 border-t border-gray-200 space-y-4">
                                <div>
                                    <p className="font-medium text-gray-700 mb-2">Review Notes</p>
                                    <textarea
                                        rows={3}
                                        value={reviewNotes}
                                        onChange={(e) => onReviewNotesChange(e.target.value)}
                                        placeholder="Enter your review notes or feedback for the instructor..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => onReview(course.id, 'APPROVED', reviewNotes)}
                                        disabled={isReviewing}
                                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isReviewing ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                Approve
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => onReview(course.id, 'PUBLISHED', reviewNotes)}
                                        disabled={isReviewing}
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Rocket className="w-5 h-5" />
                                        Approve & Publish
                                    </button>
                                    <button
                                        onClick={() => onReview(course.id, 'REJECTED', reviewNotes)}
                                        disabled={isReviewing}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}