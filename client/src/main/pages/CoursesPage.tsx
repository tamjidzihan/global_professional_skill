/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filter, Search } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { CourseCard } from "../components/CourseCard"
import Breadcrumb from "../components/Breadcrumb"
import { useCourses } from "../../hooks/useCourses"
import LoadingSpinner from "../components/LoadingSpinner"
import { debounce } from "lodash"

const CoursesPage = () => {
    const {
        categories,
        courses,
        fetchCategories,
        fetchCourses,
        loading,
        error,
        pagination
    } = useCourses()

    const [activeCategory, setActiveCategory] = useState<string>('All Courses')
    const [selectingCategory, setSelectingCategory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({})

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    // Fetch courses with filters when activeCategory or searchQuery changes
    useEffect(() => {
        const filters: Record<string, any> = {}

        // Apply category filter if not "All Courses"
        if (activeCategory !== 'All Courses') {
            // First, find the category ID from the categories list
            const selectedCategory = categories.find(cat => cat.name === activeCategory)
            if (selectedCategory) {
                filters.category = selectedCategory.id
            }
        }

        // Apply search filter
        if (searchQuery) {
            filters.search = searchQuery
        }

        // Apply other filters if you have them
        // filters.difficulty_level = 'beginner'
        // filters.is_free = false
        // etc.

        setAppliedFilters(filters)
        fetchCourses(filters)
    }, [activeCategory, searchQuery, categories, fetchCourses])


    const handleCategorySelect = useCallback(async (categoryName: string) => {
        if (selectingCategory) return; // Prevent multiple clicks

        setSelectingCategory(true);
        try {
            // Wait for categories to be loaded if empty
            if (categories.length === 0) {
                await fetchCategories();
            }
            setActiveCategory(categoryName);
        } finally {
            setSelectingCategory(false);
        }
    }, [categories.length, fetchCategories]);


    // Debounced search to avoid too many API calls
    const debouncedSetSearchQuery = useCallback(
        debounce((query: string) => {
            setSearchQuery(query)
        }, 500),
        []
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchInput(value)
        debouncedSetSearchQuery(value)
    }

    const clearAllFilters = () => {
        setActiveCategory('All Courses')
        setSearchInput('')
        setSearchQuery('')
    }

    return (
        <>
            <Breadcrumb name="Courses" />
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-4">
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <Search className="w-4 h-4 mr-2 text-[#0066CC]" />
                                    Search Course
                                </h3>
                                <input
                                    type="text"
                                    placeholder="Type to search..."
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-sm"
                                />
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <Filter className="w-4 h-4 mr-2 text-[#0066CC]" />
                                    Categories
                                </h3>
                                {/* Loading state for categories */}
                                {loading && categories.length === 0 && (
                                    <div className="text-sm text-gray-500 py-2">
                                        <LoadingSpinner />
                                    </div>
                                )}

                                {/* Error state */}
                                {error && (
                                    <div className="text-sm text-red-500 py-2">
                                        Error: {error}
                                    </div>
                                )}

                                {/* Categories list */}
                                {!loading && !error && (
                                    <div className="space-y-2">
                                        {/* "All Courses" button */}
                                        <button
                                            onClick={() => setActiveCategory('All Courses')}
                                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors cursor-pointer ${activeCategory === 'All Courses' ? 'bg-[#0066CC] text-white font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0066CC]'}`}
                                        >
                                            All Courses
                                        </button>

                                        {/* Dynamic categories from API */}
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => handleCategorySelect(category.name)}
                                                disabled={selectingCategory}
                                                className={`w-full text-left px-3 py-2 rounded text-sm font-semibold transition-colors cursor-pointer ${activeCategory === category.name ? 'bg-[#0066CC] text-white font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0066CC]'} ${selectingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add more filter options if needed */}
                            {/* <div className="mt-6">
                                <h3 className="font-bold text-gray-800 mb-4">
                                    Difficulty Level
                                </h3>
                                <select 
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                    onChange={(e) => {
                                        // Add to filters
                                    }}
                                >
                                    <option value="">All Levels</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div> */}
                        </div>
                    </div>

                    {/* Course Grid */}
                    <div className="w-full lg:w-3/4">
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                {activeCategory}
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({pagination.count || 0} courses found)
                                </span>
                            </h2>

                            {/* Active filters display */}
                            {(activeCategory !== 'All Courses' || searchQuery) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-[#0066CC] hover:underline"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>

                        {/* Loading state for courses */}
                        {loading && courses.length === 0 ? (
                            <div className="flex justify-center items-center h-64">
                                <LoadingSpinner />
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <h3 className="text-lg font-bold text-red-800 mb-2">
                                    Error loading courses
                                </h3>
                                <p className="text-red-600">{error}</p>
                                <button
                                    onClick={() => fetchCourses(appliedFilters)}
                                    className="mt-4 text-[#0066CC] font-medium hover:underline"
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
                                            originalPrice={course.price}
                                            duration={course.duration_hours}
                                            rating={course.average_rating}
                                            enrolled={course.enrollment_count}
                                            category={course.category_name}
                                            instructor={course.instructor_name}
                                        // thumbnail={course.thumbnail}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {(pagination.next || pagination.previous) && (
                                    <div className="flex justify-center mt-8 space-x-4">
                                        <button
                                            onClick={() => pagination.previous && fetchCourses(appliedFilters, pagination.previous)}
                                            disabled={!pagination.previous}
                                            className={`px-4 py-2 rounded-lg ${pagination.previous ? 'bg-[#0066CC] text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => pagination.next && fetchCourses(appliedFilters, pagination.next)}
                                            disabled={!pagination.next}
                                            className={`px-4 py-2 rounded-lg ${pagination.next ? 'bg-[#0066CC] text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    No courses found
                                </h3>
                                <p className="text-gray-500">
                                    Try adjusting your search or filter criteria.
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="mt-4 text-[#0066CC] font-medium hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default CoursesPage