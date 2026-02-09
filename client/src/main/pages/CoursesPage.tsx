import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Filter, Search, ChevronRight, X, CircleX } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { CourseCard } from "../components/CourseCard"
import Breadcrumb from "../components/Breadcrumb"
import { useCourses } from "../../hooks/useCourses"
import LoadingSpinner from "../components/LoadingSpinner"
import { useCategories } from "../../hooks/useCategories"

const CoursesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const urlCategoryId = queryParams.get('category');
    const urlSearchQuery = queryParams.get('search') || '';

    const {
        courses,
        fetchCourses,
        loading,
        error,
        pagination
    } = useCourses()

    const {
        categories,
        fetchCategories,
        loading: categoryLoading,
        error: categoryError
    } = useCategories()

    const [searchQuery, setSearchQuery] = useState(urlSearchQuery)
    const [appliedFilters, setAppliedFilters] = useState<Record<string, string | number>>({})
    const [showFilters, setShowFilters] = useState(false) // Mobile filter toggle state
    const [isClosing, setIsClosing] = useState(false) // For animation

    // Memoized active category name based on URL
    const activeCategoryName = useMemo(() => {
        if (!urlCategoryId) return 'All Courses';
        const category = categories.find(cat => cat.id.toString() === urlCategoryId);
        return category ? category.name : 'All Courses';
    }, [urlCategoryId, categories])

    // Initialize search query from URL
    useEffect(() => {
        setSearchQuery(urlSearchQuery);
    }, [urlSearchQuery])

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    // Fetch courses when URL params change
    useEffect(() => {
        const filters: Record<string, string | number> = {}

        if (urlCategoryId) {
            filters.category = urlCategoryId;
        }

        if (urlSearchQuery) {
            filters.search = urlSearchQuery;
        }

        setAppliedFilters(filters);
        fetchCourses(filters);
    }, [urlCategoryId, urlSearchQuery, fetchCourses])

    // Update URL when search query changes (with debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const newParams = new URLSearchParams();

            // Keep existing category if present
            if (urlCategoryId) {
                newParams.set('category', urlCategoryId);
            }

            // Add or update search query
            if (searchQuery.trim()) {
                newParams.set('search', searchQuery.trim());
            } else {
                newParams.delete('search');
            }

            // Use navigate with replace to avoid adding to history
            navigate(`/courses?${newParams.toString()}`, { replace: true });
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, urlCategoryId, navigate]);

    // Handle instant search on Enter key
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const newParams = new URLSearchParams();

            // Keep existing category if present
            if (urlCategoryId) {
                newParams.set('category', urlCategoryId);
            }

            // Add or update search query
            if (searchQuery.trim()) {
                newParams.set('search', searchQuery.trim());
            }

            // Use navigate instead of pushState
            navigate(`/courses?${newParams.toString()}`);
        }
    }

    const clearAllFilters = () => {
        setSearchQuery('');
        // Navigate back to clean /courses URL
        window.history.pushState({}, '', '/courses');
    }

    const closeMobileFilters = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowFilters(false);
            setIsClosing(false);
        }, 300);
    }

    // Prevent body scroll when mobile filters are open
    useEffect(() => {
        if (showFilters) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showFilters]);

    return (
        <>
            <Breadcrumb name="Courses" />

            {/* Top Search Bar */}
            <div className="container mx-auto px-4 pt-2 pb-2">
                <div className="relative rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl">

                    {/* Gradient Glow Border */}
                    <div className="absolute -inset-px rounded-2xl bg-linear-to-r from-[#0066CC]/20 via-[#FCF8F1] to-[#0066CC]/10 blur-sm"></div>

                    <div className="relative p-5 md:p-7">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                            {/* Left Heading */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#0066CC]/10">
                                    <Search className="w-5 h-5 text-[#0066CC]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        Find Your Perfect Course
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Search by course, instructor, or keyword
                                    </p>
                                </div>
                            </div>

                            {/* Search Input */}
                            <div className="flex-1">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Search courses, mentors, or skills..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        className="w-full px-5 py-3.5 pl-12 bg-white border border-gray-200 rounded-xl shadow-sm
                            focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC]
                            transition-all"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0066CC] transition" />
                                </div>
                            </div>

                            {/* Mobile Filter Button */}
                            <button
                                onClick={() => setShowFilters(true)}
                                className="lg:hidden inline-flex items-center justify-center gap-2 px-5 py-3
                    bg-linear-to-r from-[#0066CC] to-blue-700 text-white font-medium rounded-xl shadow-lg
                    hover:scale-[1.02] hover:shadow-xl transition-all"
                            >
                                <Filter className="w-5 h-5" />
                                Filters
                            </button>
                        </div>

                        {/* Active Filters */}
                        {(urlCategoryId || urlSearchQuery) && (
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Active:
                                    </span>

                                    {urlCategoryId && (
                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                            bg-[#0066CC]/10 text-[#0066CC] text-sm font-medium">
                                            {activeCategoryName}
                                            <button
                                                onClick={() => {
                                                    const newUrl = new URL(window.location.href)
                                                    newUrl.searchParams.delete('category')
                                                    if (urlSearchQuery) {
                                                        newUrl.searchParams.set('search', urlSearchQuery)
                                                    }
                                                    window.history.pushState({}, '', newUrl.toString())
                                                }}
                                                className="hover:text-red-500 transition"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}

                                    {urlSearchQuery && (
                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                            bg-green-100 text-green-700 text-sm font-medium">
                                            "{urlSearchQuery}"
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('')
                                                    const newUrl = new URL(window.location.href)
                                                    newUrl.searchParams.delete('search')
                                                    if (urlCategoryId) {
                                                        newUrl.searchParams.set('category', urlCategoryId)
                                                    }
                                                    window.history.pushState({}, '', newUrl.toString())
                                                }}
                                                className="hover:text-red-500 transition cursor-pointer"
                                            >
                                                <CircleX size={15} />
                                            </button>
                                        </span>
                                    )}

                                    <button
                                        onClick={clearAllFilters}
                                        className="ml-auto text-sm font-medium text-[#0066CC] hover:underline cursor-pointer"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <div className="container mx-auto px-4 pb-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar Filters - Hidden on mobile */}
                    <div className="hidden lg:block w-full lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-4">
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <Filter className="w-5 h-5 mr-2 text-[#0066CC]" />
                                    Categories
                                </h3>

                                {categoryLoading && categories.length === 0 && (
                                    <div className="text-sm text-gray-500 py-2">
                                        <LoadingSpinner />
                                    </div>
                                )}

                                {categoryError && (
                                    <div className="text-sm text-red-500 py-2">
                                        Error: {categoryError}
                                    </div>
                                )}

                                {!loading && !error && (
                                    <div className="space-y-2">
                                        {/* All Courses Link */}
                                        <Link
                                            to="/courses"
                                            className={`w-full block text-left px-3 py-2.5 rounded text-sm transition-colors ${!urlCategoryId && !urlSearchQuery ? 'bg-[#0066CC] text-white font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0066CC]'}`}
                                        >
                                            All Courses
                                        </Link>

                                        {/* Category Links */}
                                        {categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                to={`/courses?category=${category.id}${urlSearchQuery ? `&search=${encodeURIComponent(urlSearchQuery)}` : ''}`}
                                                className={`w-full block text-left px-3 py-2.5 rounded text-sm font-medium transition-colors ${urlCategoryId === category.id.toString() ? 'bg-[#0066CC] text-white font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0066CC]'}`}
                                            >
                                                {category.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3">Quick Stats</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Total Courses:</span>
                                        <span className="font-semibold">{pagination.count || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Categories:</span>
                                        <span className="font-semibold">{categories.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filter Overlay */}
                    {(showFilters || isClosing) && (
                        <div
                            className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${showFilters && !isClosing ? 'opacity-100' : 'opacity-0'}`}
                            onClick={closeMobileFilters}
                        >
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                        </div>
                    )}

                    {/* Mobile Filter Sidebar */}
                    <div
                        className={`lg:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        <div className="flex flex-col h-full">
                            {/* Mobile Filter Header */}
                            <div className="bg-linear-to-r from-[#0066CC] to-blue-600 text-white p-4 flex justify-between items-center">
                                <span className="font-bold text-lg flex items-center">
                                    <Filter className="w-5 h-5 mr-2" />
                                    Filter Courses
                                </span>
                                <button
                                    onClick={closeMobileFilters}
                                    className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
                                    aria-label="Close filters"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile Filter Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                        <Filter className="w-5 h-5 mr-2 text-[#0066CC]" />
                                        Categories
                                    </h3>

                                    {categoryLoading && categories.length === 0 && (
                                        <div className="text-sm text-gray-500 py-2">
                                            <LoadingSpinner />
                                        </div>
                                    )}

                                    {categoryError && (
                                        <div className="text-sm text-red-500 py-2">
                                            Error: {categoryError}
                                        </div>
                                    )}

                                    {!loading && !error && (
                                        <div className="space-y-2">
                                            {/* All Courses Link */}
                                            <Link
                                                to="/courses"
                                                onClick={closeMobileFilters}
                                                className={`w-full block text-left px-4 py-3 rounded-lg text-sm transition-colors ${!urlCategoryId && !urlSearchQuery ? 'bg-[#0066CC] text-white font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0066CC]'}`}
                                            >
                                                All Courses
                                            </Link>

                                            {/* Category Links */}
                                            {categories.map((category) => (
                                                <Link
                                                    key={category.id}
                                                    to={`/courses?category=${category.id}${urlSearchQuery ? `&search=${encodeURIComponent(urlSearchQuery)}` : ''}`}
                                                    onClick={closeMobileFilters}
                                                    className={`w-full block text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${urlCategoryId === category.id.toString() ? 'bg-[#0066CC] text-white font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0066CC]'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{category.name}</span>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-gray-200">
                                    <button
                                        onClick={clearAllFilters}
                                        className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Filter Footer */}
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                                <button
                                    onClick={closeMobileFilters}
                                    className="w-full px-4 py-3 bg-[#0066CC] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Course Grid - Full width on mobile, 3/4 on desktop */}
                    <div className="w-full lg:w-3/4">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                {activeCategoryName}
                            </h2>
                            <p className="text-gray-600">
                                Showing {pagination.count || 0} courses
                                {urlSearchQuery && ` for "${urlSearchQuery}"`}
                            </p>
                        </div>

                        {/* Mobile Filter Info */}
                        <div className="lg:hidden mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Filter className="w-4 h-4 mr-2 text-[#0066CC]" />
                                    <span className="text-sm text-gray-700">
                                        {urlCategoryId ? `Category: ${activeCategoryName}` : 'All Categories'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="text-sm text-[#0066CC] font-medium hover:underline"
                                >
                                    Change
                                </button>
                            </div>
                        </div>

                        {loading && courses.length === 0 ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="text-center">
                                    <LoadingSpinner />
                                    <p className="mt-4 text-gray-600">Loading courses...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <X className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-red-800 mb-2">
                                    Error loading courses
                                </h3>
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={() => fetchCourses(appliedFilters)}
                                    className="px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : courses.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {courses.map((course) => (
                                        <CourseCard
                                            key={course.id}
                                            id={course.id}
                                            title={course.title}
                                            price={course.price}
                                            duration={course.duration_hours}
                                            rating={course.average_rating}
                                            enrolled={course.enrollment_count}
                                            category={course.category_name}
                                            instructor={course.instructor_name}
                                            thumbnail={course.thumbnail}
                                        />
                                    ))}
                                </div>

                                {(pagination.next || pagination.previous) && (
                                    <div className="flex justify-center mt-8 space-x-4">
                                        <button
                                            onClick={() => pagination.previous && fetchCourses(appliedFilters, pagination.previous)}
                                            disabled={!pagination.previous}
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${pagination.previous ? 'bg-[#0066CC] text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            <ChevronRight className="w-4 h-4 rotate-180" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => pagination.next && fetchCourses(appliedFilters, pagination.next)}
                                            disabled={!pagination.next}
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${pagination.next ? 'bg-[#0066CC] text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white rounded-lg p-8 md:p-12 text-center border border-gray-100">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    No courses found
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    We couldn't find any courses matching your criteria.
                                    Try adjusting your search or filter options.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={clearAllFilters}
                                        className="px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Clear all filters
                                    </button>
                                    <button
                                        onClick={() => setShowFilters(true)}
                                        className="lg:hidden px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Change filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default CoursesPage