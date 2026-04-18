/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronRight, ChevronLeft, Search, X, RotateCcw } from "lucide-react"
import { useNavigate, useLocation } from 'react-router-dom';
import { CourseCard } from "../CourseCard";
import type { CoursesSummary } from "../../../types";

interface CourseGridProps {
    courses: CoursesSummary[];
    error: string | null;
    pagination: any;
    appliedFilters: Record<string, string | number>;
    activeCategoryName: string;
    urlSearchQuery: string;
    onFetchCourses: (filters: Record<string, string | number>, url?: string) => void;
    onClearAll: () => void;
    onOpenMobileFilters: () => void;
}

const CourseGrid = ({
    courses,
    error,
    pagination,
    appliedFilters,
    activeCategoryName,
    onFetchCourses,
    onClearAll,
    onOpenMobileFilters
}: CourseGridProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract current page from URL or default to 1
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1');

    // Handle page change with URL update
    const handlePageChange = (pageUrl: string | null, direction: 'next' | 'prev') => {
        if (!pageUrl) return;

        // Calculate new page number
        const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;

        // Update URL with new page number
        const newParams = new URLSearchParams(location.search);
        if (newPage > 1) {
            newParams.set('page', newPage.toString());
        } else {
            newParams.delete('page');
        }

        // Update URL without reloading the page
        navigate(`/courses?${newParams.toString()}`, { replace: true });

        // Fetch data for the new page
        onFetchCourses(appliedFilters, pageUrl);
    };

    return (
        <div className="w-full">
            {/* Header Section with Pagination */}
            <div className="mb-4 md:mb-6 px-1">
                {/* Top Row: Title and Header Pagination */}
                <div className="flex flex-row items-center justify-between gap-3 mb-1">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                        {activeCategoryName}
                    </h2>

                    {/* Header Pagination - Visible on all screens */}
                    {(pagination.next || pagination.previous) && (
                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(pagination.previous, 'prev')}
                                disabled={!pagination.previous}
                                className={`p-2 rounded-lg flex items-center justify-center transition-all
                                    ${pagination.previous
                                        ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm cursor-pointer'
                                        : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                                    }`}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page Indicator */}
                            <span className="text-sm font-medium text-gray-600 px-2">
                                Page {currentPage}
                            </span>

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(pagination.next, 'next')}
                                disabled={!pagination.next}
                                className={`p-2 rounded-lg flex items-center justify-center transition-all
                                    ${pagination.next
                                        ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm cursor-pointer'
                                        : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                                    }`}
                                aria-label="Next page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error ? (
                <ErrorState error={error} onRetry={() => onFetchCourses(appliedFilters)} />
            ) : courses.length > 0 ? (
                <>
                    {/* Grid: 1 col mobile, 2 col tablet (sm/md), 3 col desktop (lg) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                id={course.id}
                                title={course.title}
                                price={course.price}
                                level={course.difficulty_level}
                                rating={course.average_rating}
                                enrolled={course.enrollment_count}
                                category={course.category_name}
                                instructor={course.instructor_name}
                                thumbnail={course.thumbnail}
                                duration_hours={course.duration_hours}
                                total_classes={course.total_classes}
                                delivery_mode={course.delivery_mode}
                            />
                        ))}
                    </div>

                    {/* Bottom Pagination */}
                    {(pagination.next || pagination.previous) && (
                        <Pagination
                            pagination={pagination}
                            appliedFilters={appliedFilters}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            ) : (
                <EmptyState onClearAll={onClearAll} onOpenMobileFilters={onOpenMobileFilters} />
            )}
        </div>
    )
}

const ErrorState = ({ error, onRetry }: any) => (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 md:p-8 text-center my-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-red-800 mb-2">Oops! Something went wrong</h3>
        <p className="text-sm text-red-600 mb-6 max-w-xs mx-auto">{error}</p>
        <button
            onClick={onRetry}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all active:scale-95"
        >
            Try again
        </button>
    </div>
)

interface PaginationProps {
    pagination: any;
    appliedFilters: Record<string, string | number>;
    currentPage: number;
    onPageChange: (pageUrl: string | null, direction: 'next' | 'prev') => void;
}

const Pagination = ({ pagination, currentPage, onPageChange }: PaginationProps) => (
    <div className="flex items-center justify-between mt-10 pb-10 border-t border-gray-100 pt-6 px-1">
        <button
            onClick={() => onPageChange(pagination.previous, 'prev')}
            disabled={!pagination.previous}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all
                ${pagination.previous
                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm cursor-pointer'
                    : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                }`}
        >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
        </button>

        {/* Page Indicator for Desktop */}
        <span className="hidden sm:block text-sm font-medium text-gray-600">
            Page {currentPage}
        </span>

        <button
            onClick={() => onPageChange(pagination.next, 'next')}
            disabled={!pagination.next}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all
                ${pagination.next
                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm cursor-pointer'
                    : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                }`}
        >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
        </button>
    </div>
)

const EmptyState = ({ onClearAll, onOpenMobileFilters }: any) => (
    <div className="bg-white rounded-3xl p-8 md:p-16 text-center border border-gray-100 shadow-sm my-4">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
            <Search className="w-8 h-8 text-[#0066CC]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
        <p className="text-sm md:text-base text-gray-500 mb-8 max-w-sm mx-auto">
            Try adjusting your search or filters to find what you're looking for.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
                onClick={onClearAll}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0066CC] text-white rounded-xl font-semibold hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-200"
            >
                <RotateCcw className="w-4 h-4" />
                Clear All Filters
            </button>
            <button
                onClick={onOpenMobileFilters}
                className="lg:hidden flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all active:scale-95"
            >
                Modify Search
            </button>
        </div>
    </div>
)

export default CourseGrid;