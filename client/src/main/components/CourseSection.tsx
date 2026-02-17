import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, BookOpen, TrendingUp, Sparkles, ArrowRight } from "lucide-react"
import { CourseCard } from "./CourseCard"

const CourseSection = () => {
    const scrollRef = useRef<HTMLDivElement>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const [activeCategory, setActiveCategory] = useState("All Courses")

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

    const courses = [
        { id: "1", title: "Certified Course on Full Stack Web Development with ASP.Net Core MVC", price: "21,000", originalPrice: "25,000" },
        { id: "2", title: "Certified Course on Advanced Excel for Professionals", price: "5,000", originalPrice: "8,000" },
        { id: "3", title: "IT Support Service, Level-3 NTVQF", price: "3,000", originalPrice: "" },
        { id: "4", title: "Certified Course on Cisco Certified Network Associate (CCNA)", price: "17,000", originalPrice: "19,000" },
        { id: "5", title: "Certificate Course on Software Testing & Quality Assurance", price: "21,000", originalPrice: "23,000" },
        { id: "6", title: "Certified Training on Professional IT Support Technical", price: "10,000", originalPrice: "12,000" },
        { id: "7", title: "Certified Course on Master of Cyber Security for Professionals", price: "21,000", originalPrice: "25,000" },
        { id: "8", title: "Competency Based Training & Assessment Methodology (CBT&A)", price: "12,000", originalPrice: "" },
    ]

    const coursesCategory = [
        { name: "All Courses", icon: "🎯" },
        { name: "Graphics & Multimedia", icon: "🎨" },
        { name: "Web & Software", icon: "💻" },
        { name: "Digital Marketing", icon: "📱" },
        { name: "Networking & IT Support", icon: "🌐" },
        { name: "Cyber Security", icon: "🔒" },
        { name: "Quality Assurance", icon: "✅" },
        { name: "Database Management", icon: "🗄️" },
        { name: "Cloud Computing", icon: "☁️" },
        { name: "DevOps", icon: "⚙️" },
        { name: "AI & ML", icon: "🤖" },
        { name: "Blockchain", icon: "⛓️" },
        { name: "Data Science", icon: "📊" },
    ]

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


                {/* Category Scroll */}
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
                        {/* Gradient Overlays */}
                        <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-[#FCF8F1] to-transparent z-10 pointer-events-none hidden md:block"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-white to-transparent z-10 pointer-events-none hidden md:block"></div>

                        <div
                            ref={scrollRef}
                            onMouseDown={onMouseDown}
                            onMouseMove={onMouseMove}
                            onMouseUp={stopDragging}
                            onMouseLeave={stopDragging}
                            className="flex gap-3 overflow-x-auto scrollbar-hide px-2 md:px-16 py-4 cursor-grab active:cursor-grabbing select-none"
                        >
                            {coursesCategory.map((category) => (
                                <button
                                    key={category.name}
                                    onClick={() => setActiveCategory(category.name)}
                                    className={`group relative px-3 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeCategory === category.name
                                        ? 'bg-linear-to-r from-[#0066CC] to-blue-600 text-white shadow-lg scale-105'
                                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">{category.icon}</span>
                                        {category.name}
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

                {/* Active Category Display */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {activeCategory}
                            </h3>
                            <p className="text-sm text-gray-600">{courses.length} courses available</p>
                        </div>
                    </div>

                    <Link
                        to="/courses"
                        className="hidden lg:inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl group"
                    >
                        View All Courses
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            price={course.price}
                        />
                    ))}
                </div>

                {/* Bottom CTA Section */}
                <div className="relative overflow-hidden bg-linear-to-r from-blue-600 via-blue-700 to-purple-600 rounded-3xl p-10 sm:p-12 text-center text-white shadow-2xl">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-6">
                            <TrendingUp className="w-4 h-4" />
                            Start Learning Today
                        </div>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4">
                            Can't Find What You're Looking For?
                        </h3>
                        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                            Explore our complete catalog of 200+ courses across 12+ categories
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                to="/courses"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-2xl group"
                            >
                                Browse All Courses
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all"
                            >
                                Contact Advisor
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CourseSection