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
        {
            id: "1",
            title: "Certified Course on Full Stack Web Development with ASP.Net Core MVC",
            price: "21,000",
            originalPrice: "25,000",
        },
        {
            id: "2",
            title: "Certified Course on Advanced Excel for Professionals",
            price: "5,000",
            originalPrice: "8,000",
        },
        {
            id: "3",
            title: "IT Support Service, Level-3 NTVQF",
            price: "3,000",
            originalPrice: "",
        },
        {
            id: "4",
            title: "Certified Course on Cisco Certified Network Associate (CCNA)",
            price: "17,000",
            originalPrice: "19,000",
        },
        {
            id: "5",
            title: "Certificate Course on Software Testing & Quality Assurance",
            price: "21,000",
            originalPrice: "23,000",
        },
        {
            id: "6",
            title: "Certified Training on Professional IT Support Technical",
            price: "10,000",
            originalPrice: "12,000",
        },
        {
            id: "7",
            title: "Certified Course on Master of Cyber Security for Professionals",
            price: "21,000",
            originalPrice: "25,000",
        },
        {
            id: "8",
            title: "Competency Based Training & Assessment Methodology (CBT&A)",
            price: "12,000",
            originalPrice: "",
        },
    ]

    const coursesCategory = [
        { id: "1", category: "Graphics & Multimedia" },
        { id: "2", category: "Web & Software" },
        { id: "3", category: "Digital Marketing" },
        { id: "4", category: "Networking & IT Support" },
        { id: "5", category: "Cyber Security" },
        { id: "6", category: "Quality Assurance" },
        { id: "7", category: "Database Management" },
        { id: "8", category: "Cloud Computing" },
        { id: "9", category: "DevOps" },
        { id: "10", category: "AI & ML" },
        { id: "11", category: "Blockchain" },
        { id: "12", category: "Data Science" },
    ]

    return (
        <section className="py-12 sm:py-16 container mx-auto px-4">
            {/* Heading */}
            <div className="mb-8 sm:mb-10">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0066CC] mb-2">
                    Find all of Our Courses
                </h2>
                <div className="h-1 w-16 sm:w-20 bg-[#76C043]" />
            </div>

            {/* Category Scroll */}
            <div className="relative mb-8">
                {/* Left Arrow */}
                <button
                    onClick={() => scrollByAmount(-250)}
                    className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 cursor-pointer"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* Scroll Area */}
                <div
                    ref={scrollRef}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={stopDragging}
                    onMouseLeave={stopDragging}
                    className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide px-10 cursor-grab active:cursor-grabbing select-none"
                >
                    <button className="px-4 py-2 bg-[#76C043] text-white rounded-full text-sm font-medium whitespace-nowrap cursor-pointer">
                        All Courses
                    </button>

                    {coursesCategory.map((item) => (
                        <button
                            key={item.id}
                            className="px-4 py-2 bg-white cursor-pointer border border-gray-200 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 whitespace-nowrap"
                        >
                            {item.category}
                        </button>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scrollByAmount(250)}
                    className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {courses.map((course) => (
                    <CourseCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        price={course.price}
                        originalPrice={course.originalPrice}
                    />
                ))}
            </div>

            {/* View All */}
            <div className="mt-10 text-center">
                <Link
                    to="/courses"
                    className="inline-block px-8 py-3 bg-[#0066CC] text-white rounded font-semibold hover:bg-blue-800 transition"
                >
                    View All Courses
                </Link>
            </div>
        </section>
    )
}

export default CourseSection
