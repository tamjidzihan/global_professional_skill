import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Filter, Search, ChevronRight, X, CircleX, Folder, CornerDownLeft } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { CourseCard } from "../components/CourseCard"
import Breadcrumb from "../components/Breadcrumb"
import { useCourses } from "../../hooks/useCourses"
import LoadingSpinner from "../components/LoadingSpinner"
import { useCategories } from "../../hooks/useCategories"
import CoursesPageSkeleton from '../components/loadingSkeleton/CoursesPageSkeleton';

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
    const [showFilters, setShowFilters] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

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
        }, 500);

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

    if (loading && courses.length === 0) {
        return <CoursesPageSkeleton />
    }

    return (
        <>
            <Breadcrumb
                name="Courses"
                icon={Folder}
            />

            {/* Top Search Bar - Enhanced Premium Design */}
            <div className="container mx-auto px-4 py-2 mb-2">
                <div className="relative group">
                    {/* Animated gradient glow effect */}
                    <div className="absolute -inset-0.5 bg-linear-to-r from-[#0066CC]/20 via-[#0066CC]/30 to-[#0066CC]/20 
                    rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                    <div className="relative rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200/80 
                    shadow-lg hover:shadow-xl transition-all duration-300">

                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/50 via-white/30 to-white/50 
                        pointer-events-none"></div>

                        <div className="relative px-6 py-4">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                                {/* Left Heading - Enhanced */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[#0066CC]/20 rounded-lg blur-sm"></div>
                                        <div className="relative p-2.5 rounded-lg bg-linear-to-br from-[#0066CC] to-blue-600 
                                        shadow-lg shadow-[#0066CC]/20">
                                            <Search className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg tracking-tight">
                                            Find Your Perfect Course
                                        </h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                            Search by course
                                        </p>
                                    </div>
                                </div>

                                {/* Search Input - Enhanced with micro-interactions */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search courses"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={handleSearchKeyDown}
                                            className="w-full px-5 py-4 pl-12 
                                         bg-gray-50/80 border border-gray-200 
                                         rounded-xl shadow-sm
                                         placeholder:text-gray-400 placeholder:text-sm
                                         focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 
                                         focus:border-[#0066CC] focus:bg-white
                                         transition-all duration-200
                                         hover:bg-white hover:border-gray-300"
                                        />

                                        {/* Search icon with animated color */}
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 
                                             text-gray-400 transition-all duration-200
                                             peer-focus:text-[#0066CC] 
                                             group-hover:text-gray-500" />

                                        {/* Clear button - appears when typing */}
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 
                                             p-1 rounded-full hover:bg-gray-100 
                                             transition-all duration-200 group/clear"
                                                aria-label="Clear search"
                                            >
                                                <CircleX size={16} className="text-gray-400 group-hover/clear:text-gray-600" />
                                            </button>
                                        )}

                                        {/* Search hint for Enter key */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
                                            <div className="px-2 py-1 text-xs font-semibold 
                                             bg-gray-100 hover:bg-gray-50 transition-all duration-300 border border-gray-200 rounded-lg hover:shadow-lg cursor-pointer" >
                                                <CornerDownLeft size={25} className="text-blue-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Filter Button - Enhanced */}
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="lg:hidden inline-flex items-center justify-center gap-2 
                                 px-5 py-4 bg-linear-to-r from-[#0066CC] to-blue-600 
                                 text-white font-medium rounded-xl shadow-lg
                                 hover:shadow-xl hover:from-[#0052a3] hover:to-blue-700 
                                 hover:scale-[1.02] active:scale-[0.98]
                                 transition-all duration-200"
                                >
                                    <Filter className="w-5 h-5" />
                                    <span>Filters</span>
                                    {categories.length > 0 && (
                                        <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                                            {categories.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Active Filters - Enhanced with better visual hierarchy */}
                            {(urlCategoryId || urlSearchQuery) && (
                                <div className="mt-6 pt-4 border-t border-gray-200/60">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Active filters:
                                        </span>

                                        {urlCategoryId && (
                                            <span className="group/filter inline-flex items-center gap-1.5 
                                               px-3 py-1.5 rounded-lg
                                               bg-linear-to-r from-[#0066CC]/10 to-[#0066CC]/5 
                                               border border-[#0066CC]/20
                                               text-[#0066CC] text-sm font-medium
                                               transition-all hover:shadow-sm">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-[#0066CC] rounded-full"></span>
                                                    Category:
                                                </span>
                                                <span className="font-semibold">{activeCategoryName}</span>
                                                <button
                                                    onClick={() => {
                                                        const newUrl = new URL(window.location.href)
                                                        newUrl.searchParams.delete('category')
                                                        if (urlSearchQuery) {
                                                            newUrl.searchParams.set('search', urlSearchQuery)
                                                        }
                                                        window.history.pushState({}, '', newUrl.toString())
                                                    }}
                                                    className="ml-0.5 p-0.5 rounded-full hover:bg-[#0066CC]/10 
                                                 transition-colors"
                                                    aria-label="Remove category filter"
                                                >
                                                    <X size={14} className="hover:text-red-500 transition-colors" />
                                                </button>
                                            </span>
                                        )}

                                        {urlSearchQuery && (
                                            <span className="group/filter inline-flex items-center gap-1.5 
                                               px-3 py-1.5 rounded-lg
                                               bg-linear-to-r from-green-50 to-emerald-50 
                                               border border-green-200/60
                                               text-green-700 text-sm font-medium
                                               transition-all hover:shadow-sm">
                                                <Search size={14} className="text-green-600" />
                                                <span className="font-semibold">"{urlSearchQuery}"</span>
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
                                                    className="ml-0.5 p-0.5 rounded-full hover:bg-green-200/50 
                                                 transition-colors"
                                                    aria-label="Remove search filter"
                                                >
                                                    <X size={14} className="hover:text-red-500 transition-colors" />
                                                </button>
                                            </span>
                                        )}

                                        <button
                                            onClick={clearAllFilters}
                                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 
                                         text-sm font-medium text-gray-600 
                                         hover:text-[#0066CC] rounded-lg
                                         hover:bg-gray-100 transition-all duration-200
                                         group/clear"
                                        >
                                            <span>Clear all</span>
                                            <X size={14} className="group-hover/clear:rotate-90 transition-transform duration-200" />
                                        </button>
                                    </div>

                                    {/* Filter count badge */}
                                    <div className="mt-2 text-xs text-gray-500">
                                        {[urlCategoryId, urlSearchQuery].filter(Boolean).length} filter(s) applied
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar Filters - Enhanced Professional Design */}
                    <div className="hidden lg:block w-full lg:w-1/4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 sticky top-4 transition-all hover:shadow-md">
                            {/* Categories Section */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                                    <div className="w-1 h-5 bg-[#0066CC] rounded-full mr-3"></div>
                                    <span>Categories</span>
                                    <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                        {categories.length}
                                    </span>
                                </h3>

                                {categoryLoading && categories.length === 0 && (
                                    <div className="flex justify-center py-8">
                                        <div className="flex flex-col items-center">
                                            <LoadingSpinner />
                                            <p className="text-xs text-gray-500 mt-2">Loading categories...</p>
                                        </div>
                                    </div>
                                )}

                                {categoryError && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                        <p className="text-xs font-medium text-red-800 mb-1">Failed to load categories</p>
                                        <p className="text-xs text-red-600">{categoryError}</p>
                                        <button
                                            onClick={() => fetchCategories()}
                                            className="mt-2 text-xs font-medium text-red-700 hover:text-red-900 underline underline-offset-2"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                )}

                                {!loading && !error && (
                                    <div className="space-y-1">
                                        {/* All Courses Link - Enhanced */}
                                        <Link
                                            to="/courses"
                                            className={`
                                                        group relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg 
                                                        text-sm transition-all duration-200 ease-in-out ${!urlCategoryId && !urlSearchQuery ? 'bg-linear-to-r from-[#0066CC]/10 to-[#0066CC]/5 text-[#0066CC] font-medium border border-[#0066CC]/20' : 'text-gray-700 hover:bg-gray-100 hover:text-[#0066CC] border border-transparent hover:border-gray-200'}
                                                        `}
                                        >
                                            <span className="flex items-center">
                                                <span className={`
                                                        w-1.5 h-1.5 rounded-full mr-2.5 transition-all
                                                        ${!urlCategoryId && !urlSearchQuery
                                                        ? 'bg-[#0066CC] ring-2 ring-[#0066CC]/20'
                                                        : 'bg-gray-300 group-hover:bg-[#0066CC]'
                                                    }                            
                                                    `}></span>
                                                All Courses
                                            </span>
                                            {!urlCategoryId && !urlSearchQuery && (
                                                <span className="text-xs bg-[#0066CC]/10 text-[#0066CC] px-2 py-0.5 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </Link>

                                        {/* Category Links - Enhanced */}
                                        {categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                to={`/courses?category=${category.id}${urlSearchQuery ? `&search=${encodeURIComponent(urlSearchQuery)}` : ''}`}
                                                className={` group relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ease-in-out
                                                        ${urlCategoryId === category.id.toString()
                                                        ? 'bg-linear-to-r from-[#0066CC]/10 to-[#0066CC]/5 text-[#0066CC] font-medium border border-[#0066CC]/20'
                                                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#0066CC] border border-transparent hover:border-gray-200'
                                                    }
                                                `}
                                            >
                                                <span className="flex items-center truncate pr-2">
                                                    <span className={` w-1.5 h-1.5 rounded-full mr-2.5 transition-all shrink-0
                                                                        ${urlCategoryId === category.id.toString()
                                                            ? 'bg-[#0066CC] ring-2 ring-[#0066CC]/20'
                                                            : 'bg-gray-300 group-hover:bg-[#0066CC]'
                                                        }
                                                    `}></span>
                                                    <span className="truncate">{category.name}</span>
                                                </span>
                                                {urlCategoryId === category.id.toString() && (
                                                    <span className="text-xs bg-[#0066CC]/10 text-[#0066CC] px-2 py-0.5 rounded-full shrink-0 ml-2">
                                                        Active
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats - Enhanced */}
                            <div className="pt-6 border-t border-gray-200/60">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                    <span className="w-1 h-4 bg-gray-300 rounded-full mr-2"></span>
                                    Quick Stats
                                </h4>
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">Total Courses</span>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-lg font-bold text-gray-900 leading-none">
                                                {pagination.count || 0}
                                            </span>
                                            <span className="text-xs text-gray-500">courses</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">Categories</span>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-lg font-bold text-gray-900 leading-none">
                                                {categories.length}
                                            </span>
                                            <span className="text-xs text-gray-500">available</span>
                                        </div>
                                    </div>

                                    {/* Optional: Active Filters Summary */}
                                    {(urlCategoryId || urlSearchQuery) && (
                                        <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Active Filters</span>
                                                <button
                                                    onClick={clearAllFilters}
                                                    className="text-xs font-medium text-[#0066CC] hover:text-[#004c99] transition-colors"
                                                >
                                                    Clear all
                                                </button>
                                            </div>
                                            <div className="mt-2 space-y-1.5">
                                                {urlCategoryId && (
                                                    <div className="flex items-center justify-between bg-blue-50/50 px-2 py-1.5 rounded-md">
                                                        <span className="text-xs text-gray-700">Category</span>
                                                        <span className="text-xs font-medium text-[#0066CC]">{activeCategoryName}</span>
                                                    </div>
                                                )}
                                                {urlSearchQuery && (
                                                    <div className="flex items-center justify-between bg-green-50/50 px-2 py-1.5 rounded-md">
                                                        <span className="text-xs text-gray-700">Search</span>
                                                        <span className="text-xs font-medium text-green-700">"{urlSearchQuery}"</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filter Overlay - Premium Design */}
                    {(showFilters || isClosing) && (
                        <>
                            {/* Backdrop with blur effect */}
                            <div
                                className={`
                                                lg:hidden fixed inset-0 z-50 
                                                transition-all duration-500 ease-out
                                                ${showFilters && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                                        `}
                                onClick={closeMobileFilters}  >
                                <div className={` absolute inset-0    transition-all duration-500 ease-out
                                    ${showFilters && !isClosing
                                        ? 'bg-black/60 backdrop-blur-sm'
                                        : 'bg-black/0 backdrop-blur-0'
                                    }
                                `}></div>
                            </div>

                            {/* Filter Sidebar - Slide from right with enhanced design */}
                            <div
                                className={`
                                        lg:hidden fixed top-0 right-0 h-full w-[85%] max-w-sm 
                                        bg-white shadow-2xl z-60 
                                        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                                        ${showFilters
                                        ? 'translate-x-0 opacity-100'
                                        : 'translate-x-full opacity-0'
                                    }
                                    `}
                            >
                                {/* Premium Header with Gradient */}
                                <div className="relative bg-linear-to-r from-[#0066CC] to-blue-600 text-white">
                                    {/* Decorative pattern */}
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-size-[20px_20px]"></div>

                                    <div className="relative px-6 py-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                                    <Filter className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h2 className="font-semibold text-lg">Filter Courses</h2>
                                                    <p className="text-xs text-white/80 mt-0.5">
                                                        {categories.length} categories available
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={closeMobileFilters}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 
                                     hover:rotate-90 active:scale-95"
                                                aria-label="Close filters"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable Content with better spacing */}
                                <div className="flex-1 overflow-y-auto h-[calc(100%-130px)] p-6">
                                    {/* Categories Section */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                            <span className="w-1 h-5 bg-[#0066CC] rounded-full mr-3"></span>
                                            Browse Categories
                                        </h3>

                                        {categoryLoading && categories.length === 0 && (
                                            <div className="flex justify-center py-8">
                                                <LoadingSpinner />
                                            </div>
                                        )}

                                        {categoryError && (
                                            <div className="bg-red-50 rounded-lg p-4 text-center">
                                                <p className="text-sm text-red-600">{categoryError}</p>
                                            </div>
                                        )}

                                        {!loading && !error && (
                                            <div className="space-y-1.5">
                                                {/* All Courses Link - Mobile Enhanced */}
                                                <Link
                                                    to="/courses"
                                                    onClick={closeMobileFilters}
                                                    className={`
                                                            w-full flex items-center justify-between px-4 py-3.5 
                                                            rounded-xl text-sm transition-all duration-200
                                                            ${!urlCategoryId && !urlSearchQuery
                                                            ? 'bg-linear-to-r from-[#0066CC]/10 to-[#0066CC]/5 text-[#0066CC] font-medium border border-[#0066CC]/20'
                                                            : 'bg-gray-50/50 text-gray-700 hover:bg-gray-100 border border-transparent'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`
                                                                w-2 h-2 rounded-full mr-3
                                                                ${!urlCategoryId && !urlSearchQuery
                                                                ? 'bg-[#0066CC] ring-2 ring-[#0066CC]/20'
                                                                : 'bg-gray-400'
                                                            }
                                                         `}></div>
                                                        <span>All Courses</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </Link>

                                                {/* Category Links - Mobile Enhanced */}
                                                {categories.map((category) => (
                                                    <Link
                                                        key={category.id}
                                                        to={`/courses?category=${category.id}${urlSearchQuery ? `&search=${encodeURIComponent(urlSearchQuery)}` : ''}`}
                                                        onClick={closeMobileFilters}
                                                        className={`
                                        w-full flex items-center justify-between px-4 py-3.5 
                                        rounded-xl text-sm transition-all duration-200
                                        ${urlCategoryId === category.id.toString()
                                                                ? 'bg-linear-to-r from-[#0066CC]/10 to-[#0066CC]/5 text-[#0066CC] font-medium border border-[#0066CC]/20'
                                                                : 'bg-gray-50/50 text-gray-700 hover:bg-gray-100 border border-transparent'
                                                            }
                                    `}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className={`
                                            w-2 h-2 rounded-full mr-3
                                            ${urlCategoryId === category.id.toString()
                                                                    ? 'bg-[#0066CC] ring-2 ring-[#0066CC]/20'
                                                                    : 'bg-gray-400'
                                                                }
                                        `}></div>
                                                            <span className="truncate">{category.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {urlCategoryId === category.id.toString() && (
                                                                <span className="text-xs bg-[#0066CC]/10 text-[#0066CC] px-2 py-1 rounded-full">
                                                                    Active
                                                                </span>
                                                            )}
                                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Active Filters Summary - Mobile */}
                                    {(urlCategoryId || urlSearchQuery) && (
                                        <div className="mb-8 p-4 bg-gray-50/80 rounded-xl border border-gray-200/60">
                                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                                                Active Filters
                                            </h4>
                                            <div className="space-y-2">
                                                {urlCategoryId && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Category</span>
                                                        <span className="text-sm font-medium text-[#0066CC] bg-[#0066CC]/5 px-3 py-1.5 rounded-lg">
                                                            {activeCategoryName}
                                                        </span>
                                                    </div>
                                                )}
                                                {urlSearchQuery && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Search</span>
                                                        <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                                                            "{urlSearchQuery}"
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Premium Footer with Action Buttons */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200/80">
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={clearAllFilters}
                                            className="w-full px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl 
                                 hover:bg-gray-200 transition-all duration-200 font-medium text-sm
                                 active:scale-[0.98] border border-transparent hover:border-gray-300"
                                        >
                                            Clear All Filters
                                        </button>
                                        <button
                                            onClick={closeMobileFilters}
                                            className="w-full px-4 py-3.5 bg-linear-to-r from-[#0066CC] to-blue-600 
                                 text-white rounded-xl hover:from-[#0052a3] hover:to-blue-700 
                                 transition-all duration-200 font-medium text-sm shadow-lg shadow-[#0066CC]/20
                                 active:scale-[0.98]"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
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

                        {error ? (
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