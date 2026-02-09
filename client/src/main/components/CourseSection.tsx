import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CourseCard } from "./CourseCard"

const CourseSection = () => {
    const scrollRef = useRef<HTMLDivElement>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

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
        "Graphics & Multimedia", "Web & Software", "Digital Marketing", "Networking & IT Support",
        "Cyber Security", "Quality Assurance", "Database Management", "Cloud Computing",
        "DevOps", "AI & ML", "Blockchain", "Data Science",
    ]

    return (
        <section className="py-16 sm:py-20 bg-white-1/30">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Explore Our Courses
                        </h2>
                        <p className="text-gray-600 mt-2 max-w-xl">
                            Choose from a wide range of industry-ready professional courses.
                        </p>
                    </div>

                    <Link
                        to="/courses"
                        className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
                    >
                        View All
                        <ChevronRight size={18} />
                    </Link>
                </div>

                {/* Category Scroll */}
                <div className="relative mb-12">

                    {/* Left Arrow */}
                    <button
                        onClick={() => scrollByAmount(-300)}
                        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl rounded-full p-2 transition"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {/* Scroll Container */}
                    <div
                        ref={scrollRef}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={stopDragging}
                        onMouseLeave={stopDragging}
                        className="flex gap-3 overflow-x-auto scrollbar-hide px-12 cursor-grab active:cursor-grabbing select-none"
                    >
                        <button className="px-5 py-2 bg-black text-white rounded-full text-sm font-semibold shadow-sm whitespace-nowrap">
                            All Courses
                        </button>

                        {coursesCategory.map((category) => (
                            <button
                                key={category}
                                className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition whitespace-nowrap"
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scrollByAmount(300)}
                        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl rounded-full p-2 transition"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            price={course.price}
                        />
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-12 text-center sm:hidden">
                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
                    >
                        View All Courses
                        <ChevronRight size={18} />
                    </Link>
                </div>

            </div>
        </section>
    )
}

export default CourseSection
