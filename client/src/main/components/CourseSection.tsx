import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, ArrowRight, AlertCircle, RefreshCw } from "lucide-react"
import { CourseCard } from "./CourseCard"
import { useCourses } from "../../hooks/useCourses"
import CourseCardSkeleton from "./ui/loadingSkeleton/CourseCardSkeleton"

const CourseSection = () => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const { fetchCourses, courses, fetchCategories, categories, loading, error } = useCourses()

    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const [activeCategory, setActiveCategory] = useState("Our Courses")
    const [categoryLoading, setCategoryLoading] = useState(false)

    useEffect(() => {
        fetchCategories()
        // Initial fetch for Our courses
        fetchCourses()
    }, [fetchCourses, fetchCategories])

    // Add "All Courses" to categories
    const allCategories = useMemo(() => {
        return [
            { name: "Our Courses", icon: "" },
            ...categories
        ]
    }, [categories])

    // Handle category change - fetch from database
    const handleCategoryChange = useCallback(async (categoryName: string) => {
        setActiveCategory(categoryName)
        setCategoryLoading(true)

        try {
            if (categoryName === "Our Courses") {
                await fetchCourses()
            } else {
                // Find the category ID from the categories list
                const selectedCategory = categories.find(cat => cat.name === categoryName)
                if (selectedCategory) {
                    // Fetch courses filtered by category
                    await fetchCourses({
                        category: selectedCategory.id
                        // You can add other filters here if needed
                        // difficulty_level: '',
                        // status: 'PUBLISHED',
                        // search: '',
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching courses for category:', error)
        } finally {
            setCategoryLoading(false)
        }
    }, [categories, fetchCourses])

    // Get only the last 8 courses
    const displayedCourses = useMemo(() => {
        return courses.slice(-12)
    }, [courses])

    const scrollByAmount = (amount: number) => {
        scrollRef.current?.scrollBy({
            left: amount,
            behavior: "smooth",
        })
    }

    const onMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return
        setIsDragging(true)
        setStartX(e.pageX - scrollRef.current.offsetLeft)
        setScrollLeft(scrollRef.current.scrollLeft)
    }

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return
        e.preventDefault()
        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = (x - startX) * 1.5
        scrollRef.current.scrollLeft = scrollLeft - walk
    }

    const stopDragging = () => setIsDragging(false)

    const handleRetry = () => {
        fetchCategories()
        handleCategoryChange(activeCategory)
    }

    // Combine loading states
    const isLoading = loading || categoryLoading

    return (
        <section className="py-10 sm:py-14 bg-linear-to-b from-white to-[#FCF8F1] overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-6 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-full text-sm font-semibold mb-4">
                        <Sparkles className="w-4 h-4" />
                        Popular Courses
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                        Explore Our <span className="bg-linear-to-r from-[#0066CC] to-purple-600 bg-clip-text text-transparent">Premium Courses</span>
                    </h2>
                    <p className="text-gray-600">
                        Choose from a wide range of industry-ready professional courses designed to boost your career
                    </p>
                </div>

                {/* Category Scroll - Only show if no error */}
                {!error && (
                    <div className="relative mb-8">
                        {/* Left Arrow */}
                        <button
                            onClick={() => scrollByAmount(-300)}
                            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl hover:shadow-2xl rounded-full p-3 transition-all hover:scale-110 border-2 border-gray-200 hover:border-blue-400"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={20} className="text-gray-700" />
                        </button>

                        {/* Scroll Container */}
                        <div className="relative">
                            <div
                                ref={scrollRef}
                                onMouseDown={onMouseDown}
                                onMouseMove={onMouseMove}
                                onMouseUp={stopDragging}
                                onMouseLeave={stopDragging}
                                className="flex gap-3 overflow-x-auto scrollbar-hide px-2 md:px-16 py-4 cursor-grab active:cursor-grabbing select-none"
                            >
                                {allCategories.map((category) => (
                                    <button
                                        key={category.name}
                                        onClick={() => handleCategoryChange(category.name)}
                                        disabled={categoryLoading}
                                        className={`group relative px-3 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${activeCategory === category.name
                                            ? 'bg-linear-to-r from-[#0066CC] to-blue-600 text-white shadow-lg scale-105'
                                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                            } ${categoryLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className="text-lg">{category.icon}</span>
                                            {category.name}
                                            {categoryLoading && activeCategory === category.name && (
                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                            )}
                                        </span>
                                        {activeCategory === category.name && (
                                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={() => scrollByAmount(300)}
                            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl hover:shadow-2xl rounded-full p-3 transition-all hover:scale-110 border-2 border-gray-200 hover:border-blue-400"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={20} className="text-gray-700" />
                        </button>
                    </div>
                )}

                {/* Active Category Display - Only show if no error */}
                {!error && (
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {activeCategory}
                                </h3>
                            </div>
                        </div>

                        {/* View All Courses Button - Same line, smaller on mobile */}
                        <Link
                            to="/courses"
                            className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-linear-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl group text-xs sm:text-sm md:text-base"
                        >
                            <span className="hidden xs:inline">View All Courses</span>
                            <span className="xs:hidden">All</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="mb-12">
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-red-700 mb-2">Failed to Load Courses</h3>
                            <p className="text-red-600 mb-6">{error}</p>
                            <button
                                onClick={handleRetry}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Course Grid with Error Handling */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {isLoading && [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <CourseCardSkeleton key={i} />
                    ))}

                    {!isLoading && !error && courses.length === 0 && (
                        <div className="col-span-full py-12">
                            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 text-center max-w-md mx-auto">
                                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-gray-700 mb-2">No Courses Found</h3>
                                <p className="text-gray-500 mb-4">There are no courses available in this category at the moment.</p>
                                <button
                                    onClick={() => handleCategoryChange("Our Courses")}
                                    className="text-blue-600 font-semibold hover:text-blue-700"
                                >
                                    View all courses instead
                                </button>
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && displayedCourses.length > 0 && displayedCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            price={course.price}
                            level={course.difficulty_level}
                            badge={course.difficulty_level}
                            rating={course.average_rating}
                            enrolled={course.enrollment_count}
                            category={course.category_name}
                            instructor={course.instructor_name}
                            thumbnail={course.thumbnail}
                        />
                    ))}
                </div>

                {/* Bottom View All Courses Button - Visible on all screens */}
                {!error && courses.length > 0 && (
                    <div className="flex justify-center mt-8 mb-4">
                        <Link
                            to="/courses"
                            className="inline-flex items-center gap-2 px-8 py-2 rounded-xl bg-linear-to-r from-[#0066CC] to-blue-600 text-white font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl group text-base sm:text-lg"
                        >
                            <span>All Courses</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}

export default CourseSection