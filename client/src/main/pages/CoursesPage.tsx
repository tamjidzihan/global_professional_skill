import { Filter, Search } from "lucide-react"
import { useState } from "react"
import { CourseCard } from "../components/CourseCard"
import Breadcrumb from "../components/Breadcrumb"

const CoursesPage = () => {


    const allCourses = [
        {
            id: '1',
            title:
                'Certified Course on Full Stack Web Development with ASP.Net Core MVC',
            category: 'Web Development',
            price: '21,000',
            originalPrice: '25,000',
            duration: '3 Months',
            rating: 5,
        },
        {
            id: '2',
            title: 'Certified Course on Advanced Excel for Professionals',
            category: 'Office Applications',
            price: '5,000',
            originalPrice: '8,000',
            duration: '1 Month',
            rating: 4,
        },
        {
            id: '3',
            title: 'IT Support Service, Level-3 NTVQF',
            category: 'Networking',
            price: '3,000',
            originalPrice: '',
            duration: '3 Months',
            rating: 5,
        },
        {
            id: '4',
            title: 'Certified Course on Cisco Certified Network Associate (CCNA)',
            category: 'Networking',
            price: '17,000',
            originalPrice: '19,000',
            duration: '3 Months',
            rating: 5,
        },
        {
            id: '5',
            title: 'Certificate Course on Software Testing & Quality Assurance',
            category: 'Web Development',
            price: '21,000',
            originalPrice: '23,000',
            duration: '3 Months',
            rating: 4,
        },
        {
            id: '6',
            title: 'Certified Training on Professional IT Support Technical',
            category: 'Networking',
            price: '10,000',
            originalPrice: '12,000',
            duration: '2 Months',
            rating: 5,
        },
        {
            id: '7',
            title: 'Certified Course on Master of Cyber Security for Professionals',
            category: 'Cyber Security',
            price: '21,000',
            originalPrice: '25,000',
            duration: '4 Months',
            rating: 5,
        },
        {
            id: '8',
            title: 'Competency Based Training & Assessment Methodology (CBT&A)',
            category: 'Professional',
            price: '12,000',
            originalPrice: '',
            duration: '1 Month',
            rating: 4,
        },
        {
            id: '9',
            title: 'Graphics Design & Multimedia',
            category: 'Graphics Design',
            price: '15,000',
            originalPrice: '18,000',
            duration: '3 Months',
            rating: 5,
        },
        {
            id: '10',
            title: 'Digital Marketing for Freelancing',
            category: 'Digital Marketing',
            price: '12,000',
            originalPrice: '15,000',
            duration: '2 Months',
            rating: 4,
        },
        {
            id: '11',
            title: 'MERN Stack Web Development',
            category: 'Web Development',
            price: '25,000',
            originalPrice: '30,000',
            duration: '4 Months',
            rating: 5,
        },
        {
            id: '12',
            title: 'Python for Data Science',
            category: 'Data Science',
            price: '20,000',
            originalPrice: '24,000',
            duration: '3 Months',
            rating: 5,
        },
    ]
    const categories = [
        'All Courses',
        'Web Development',
        'Networking',
        'Graphics Design',
        'Digital Marketing',
        'Cyber Security',
        'Office Applications',
        'Data Science',
    ]

    const [activeCategory, setActiveCategory] = useState('All Courses')
    const [searchQuery, setSearchQuery] = useState('')
    // Filter logic
    const filteredCourses = allCourses.filter((course) => {
        const matchesCategory =
            activeCategory === 'All Courses' || course.category === activeCategory
        const matchesSearch = course.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })
    return (
        <>
            <Breadcrumb name="Courses" />
            < div className="container mx-auto px-4 py-12" >
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-sm"
                                />
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <Filter className="w-4 h-4 mr-2 text-[#0066CC]" />
                                    Categories
                                </h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setActiveCategory(category)}
                                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${activeCategory === category ? 'bg-[#0066CC] text-white font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-[#0066CC]'}`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Grid */}
                    <div className="w-full lg:w-3/4">
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                {activeCategory}
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({filteredCourses.length} courses found)
                                </span>
                            </h2>
                        </div>

                        {filteredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCourses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        id={course.id}
                                        title={course.title}
                                        price={course.price}
                                        originalPrice={course.originalPrice}
                                        duration={course.duration}
                                        rating={course.rating}
                                    />
                                ))}
                            </div>
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
                                    onClick={() => {
                                        setActiveCategory('All Courses')
                                        setSearchQuery('')
                                    }}
                                    className="mt-4 text-[#0066CC] font-medium hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </ div>
        </>
    )
}

export default CoursesPage