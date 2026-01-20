/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Layers,
    Clock,
    Users,
    Calendar,
    MapPin,
    Star,
    Plus,
    ChevronDown,
    ChevronUp,
    Home,
    ChevronRight,
} from 'lucide-react'


// Mock course data
const courseData: Record<string, any> = {
    '1': {
        id: '1',
        title: 'Certified Course on Advanced Excel for Professionals',
        batch: '4th Batch',
        category: 'Business & Technology',
        subcategory: 'Data Analysis',
        description:
            'Advanced Excel for Professionals equips you with advanced skills to analyze data, automate workflows, and make smarter decisions—essential for careers in finance, marketing, accounting, and beyond.',
        totalClasses: 12,
        totalHours: 30,
        availableSeats: 15,
        classStarts: '24 Jan, 2026',
        deadline: '22 Jan, 2026',
        schedule: 'Saturday, Monday, Wednesday - 6:30PM to 9:00PM',
        venue: 'BDBL Bhaban (Level-3, East), 12 Karwan Bazar, Dhaka-1215',
        price: 6000,
        originalPrice: 8000,
        discount: 25, // Percentage discount
        instructor: {
            id: 1,
            name: 'Rafat Rajib',
            role: 'INSTRUCTOR',
            avatar:
                'https://ui-avatars.com/api/?name=Rafat+Rajib&background=0066CC&color=fff',
        },
        fullDescription: `Advanced Excel for Professionals is a comprehensive skill set designed for individuals who already have a basic understanding of Excel and want to harness its full potential to solve complex business problems, analyze large datasets, and automate tasks. This expertise is crucial for professionals working in fields such as finance, accounting, data analysis, project management, marketing, and operations, where advanced Excel capabilities can drive better decision-making, improve efficiency, and enhance overall productivity.`,
        whoCanJoin:
            "Anyone who works with data or uses Excel in their professional role can benefit from learning advanced Excel skills. Whether you're an analyst, accountant, manager, or business owner, mastering advanced Excel tools can drastically improve your productivity, help you make better data-driven decisions, and provide a competitive edge in the workplace.",
        paymentDetails: [
            'Course Fee: BDT 8,000',
            'One Time Full Payment: BDT 6,000',
            'Installment 1: BDT 3,000 (At the time of admission)',
            'Installment 2: BDT 3,000 (After first month)',
            '2,000 off for paying full course fees at the time of admission (Total BDT 6,000)',
        ],
        additionalInfo: [
            'This Training program has been organized by BITM LTD',
            'Training will be held on BITM LTD Head Office',
        ],
        curriculum: [
            {
                id: 1,
                title: 'Introduction & Excel Basics',
                topics: [
                    'Excel Interface Overview',
                    'Workbook and Worksheet Management',
                    'Cell Formatting and Styles',
                    'Basic Formulas and Functions',
                    'Data Entry Best Practices',
                    'Keyboard Shortcuts',
                ],
            },
            {
                id: 2,
                title: 'Advanced Formulas & Functions',
                topics: [
                    'VLOOKUP and HLOOKUP',
                    'INDEX and MATCH Functions',
                    'IF, AND, OR Logical Functions',
                    'SUMIF, COUNTIF, AVERAGEIF',
                    'Text Functions (CONCATENATE, LEFT, RIGHT, MID)',
                    'Date and Time Functions',
                ],
            },
            {
                id: 3,
                title: 'Data Analysis & Visualization',
                topics: [
                    'Pivot Tables and Pivot Charts',
                    'Data Sorting and Filtering',
                    'Conditional Formatting',
                    'Charts and Graphs',
                    'Sparklines',
                    'Data Validation',
                ],
            },
            {
                id: 4,
                title: 'Automation with Macros',
                topics: [
                    'Introduction to Macros',
                    'Recording Macros',
                    'Editing Macros in VBA',
                    'Macro Security',
                    'Automating Repetitive Tasks',
                    'Custom Functions',
                ],
            },
            {
                id: 5,
                title: 'Advanced Data Management',
                topics: [
                    'Power Query Basics',
                    'Data Cleaning and Transformation',
                    'Importing External Data',
                    'Data Consolidation',
                    'What-If Analysis',
                    'Goal Seek and Solver',
                ],
            },
            {
                id: 6,
                title: 'Reporting & Dashboard Creation',
                topics: [
                    'Dashboard Design Principles',
                    'Interactive Charts',
                    'Slicers and Timelines',
                    'Dynamic Named Ranges',
                    'Professional Report Templates',
                    'Print Settings and Page Layout',
                ],
            },
        ],
    },
}

export function CourseDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [activeTab, setActiveTab] = useState('description')
    const [expandedModules, setExpandedModules] = useState<number[]>([1]) // First module expanded by default
    const course = courseData[id || '1'] || courseData['1']

    const toggleModule = (moduleId: number) => {
        setExpandedModules((prev) =>
            prev.includes(moduleId)
                ? prev.filter((id) => id !== moduleId)
                : [...prev, moduleId],
        )
    }

    const breadcrumbItems = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Courses', href: '/courses' },
        { label: course.category, href: `/courses/${course.category.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-')}` },
        { label: course.subcategory, href: `/courses/${course.category.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-')}/${course.subcategory.toLowerCase().replace(/\s+/g, '-')}` },
        { label: course.title, href: '#', current: true },
    ]

    return (
        <>
            {/* Breadcrumb Navigation */}
            <div className="bg-gray-50 border-b border-gray-200 py-3">
                <div className="container mx-auto px-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-1 md:space-x-2">
                            {breadcrumbItems.map((item, index) => {
                                const IconComponent = item.icon
                                return (
                                    <li key={index} className="flex items-center">
                                        {index > 0 && (
                                            <ChevronRight className="w-4 h-4 text-gray-400 mx-1 md:mx-2" />
                                        )}
                                        {item.current ? (
                                            <span className="text-sm font-medium text-gray-500 truncate max-w-37.5 md:max-w-none">
                                                {IconComponent && <IconComponent className="inline-block w-3 h-3 mr-1" />}
                                                {item.label}
                                            </span>
                                        ) : (
                                            <Link
                                                to={item.href}
                                                className="flex items-center text-sm font-medium text-[#0066CC] hover:text-[#004c99] transition-colors truncate max-w-37.5 md:max-w-none"
                                            >
                                                {IconComponent && <IconComponent className="inline-block w-3 h-3 mr-1" />}
                                                {item.label}
                                            </Link>
                                        )}
                                    </li>
                                )
                            })}
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Course Header */}
            <div className="bg-[#f5f5dc] py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Left: Course Info */}
                        <div className="flex-1">
                            {/* Batch Badge */}
                            {course.batch && (
                                <div className="inline-block bg-[#0066CC] text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                                    {course.batch}
                                </div>
                            )}

                            <h1 className="text-3xl md:text-4xl font-bold text-[#0066CC] mb-2">
                                {course.title}
                            </h1>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="ml-1 text-gray-600">4.8</span>
                                    <span className="ml-1 text-gray-400">(128 reviews)</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600">{course.category}</span>
                            </div>

                            <p className="text-gray-600 mb-6">{course.description}</p>

                            {/* Info Cards Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div className="bg-[#0066CC] text-white p-4 rounded-lg flex items-center transition-transform hover:scale-[1.02]">
                                    <Layers className="w-8 h-8 mr-3" />
                                    <div>
                                        <div className="text-sm opacity-90">Total Class</div>
                                        <div className="text-2xl font-bold">
                                            {course.totalClasses}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#0066CC] text-white p-4 rounded-lg flex items-center transition-transform hover:scale-[1.02]">
                                    <Clock className="w-8 h-8 mr-3" />
                                    <div>
                                        <div className="text-sm opacity-90">Total Hours</div>
                                        <div className="text-2xl font-bold">
                                            {course.totalHours}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#0066CC] text-white p-4 rounded-lg flex items-center transition-transform hover:scale-[1.02]">
                                    <Users className="w-8 h-8 mr-3" />
                                    <div>
                                        <div className="text-sm opacity-90">Available Seats</div>
                                        <div className="text-2xl font-bold">
                                            {course.availableSeats}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div className="bg-[#e8f5e9] border-l-4 border-[#76C043] p-4 rounded transition-colors hover:bg-[#dff0d8]">
                                    <div className="flex items-start">
                                        <Calendar className="w-5 h-5 text-[#76C043] mr-2 mt-0.5" />
                                        <div className="text-sm">
                                            <div className="font-semibold text-gray-800">
                                                Class Starts: {course.classStarts}
                                            </div>
                                            <div className="text-gray-600">
                                                Deadline: {course.deadline}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#e8f5e9] border-l-4 border-[#76C043] p-4 rounded transition-colors hover:bg-[#dff0d8]">
                                    <div className="flex items-start">
                                        <Clock className="w-5 h-5 text-[#76C043] mr-2 mt-0.5" />
                                        <div className="text-sm">
                                            <div className="font-semibold text-gray-800">
                                                Schedule:
                                            </div>
                                            <div className="text-gray-600">{course.schedule}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#e8f5e9] border-l-4 border-[#76C043] p-4 rounded transition-colors hover:bg-[#dff0d8]">
                                    <div className="flex items-start">
                                        <MapPin className="w-5 h-5 text-[#76C043] mr-2 mt-0.5" />
                                        <div className="text-sm">
                                            <div className="font-semibold text-gray-800">Venue:</div>
                                            <div className="text-gray-600">{course.venue}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-gray-600">Course Fee:</span>
                                        <div className="flex items-baseline">
                                            <span className="text-2xl md:text-3xl font-bold text-gray-800">
                                                TK. {course.price.toLocaleString()}
                                            </span>
                                            {course.originalPrice && (
                                                <>
                                                    <span className="text-red-500 line-through ml-2">
                                                        TK. {course.originalPrice.toLocaleString()}
                                                    </span>
                                                    <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                                                        {course.discount}% OFF
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Pay once, get lifetime access
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="bg-white text-[#0066CC] border-2 border-[#0066CC] px-6 py-3 rounded font-bold hover:bg-[#0066CC] hover:text-white transition-colors">
                                        Add to Cart
                                    </button>
                                    <button className="bg-[#76C043] text-white px-8 py-3 rounded font-bold hover:bg-[#65a838] transition-colors shadow-md hover:shadow-lg">
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Course Banner */}
                        <div className="w-full lg:w-96 shrink-0">
                            <div className="bg-linear-to-br from-[#1a237e] to-[#0d47a1] rounded-lg p-8 text-white relative overflow-hidden shadow-xl">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded">
                                            BASIS
                                        </div>
                                        <div className="text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded">
                                            BITM
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        Certified Training on
                                    </h3>
                                    <h2 className="text-4xl font-bold text-[#ffd700] mb-2">
                                        ADVANCED EXCEL
                                    </h2>
                                    <p className="text-xl">for Professionals</p>

                                    {/* Decorative elements */}
                                    <div className="absolute top-20 right-4 w-20 h-20 bg-white/10 rounded-lg backdrop-blur-sm"></div>
                                    <div className="absolute bottom-10 right-8 w-24 h-16 bg-white/10 rounded backdrop-blur-sm"></div>
                                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
                                </div>
                            </div>

                            {/* Share and Save Buttons */}
                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                                    </svg>
                                    Share
                                </button>
                                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Course Details */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Course Details
                        </h2>

                        {/* Tabs */}
                        <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'description' ? 'border-b-2 border-[#76C043] text-[#76C043]' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setActiveTab('curriculum')}
                                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'curriculum' ? 'border-b-2 border-[#76C043] text-[#76C043]' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                Curriculum
                            </button>
                            <button
                                onClick={() => setActiveTab('faqs')}
                                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'faqs' ? 'border-b-2 border-[#76C043] text-[#76C043]' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                FAQs
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                            {activeTab === 'description' && (
                                <div className="space-y-6 text-gray-700">
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-800">Course Overview</h3>
                                        <p className="text-justify leading-relaxed">
                                            {course.fullDescription}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-800">Key Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="font-medium">Total Classes</span>
                                                <span className="text-[#0066CC] font-bold">{course.totalClasses}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="font-medium">Total Hours</span>
                                                <span className="text-[#0066CC] font-bold">{course.totalHours}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="font-medium">Course Fee</span>
                                                <span className="font-bold">BDT {course.originalPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="font-medium">Full Payment</span>
                                                <span className="font-bold">BDT {course.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-800">Payment Details</h3>
                                        <ul className="space-y-2">
                                            {course.paymentDetails.map(
                                                (detail: string, index: number) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="inline-block w-2 h-2 bg-[#76C043] rounded-full mt-2 mr-3"></span>
                                                        <span>{detail}</span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-800">Additional Information</h3>
                                        <div className="space-y-2 text-sm">
                                            {course.additionalInfo.map(
                                                (info: string, index: number) => (
                                                    <p key={index} className="font-medium bg-gray-50 p-3 rounded">
                                                        {info}
                                                    </p>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'curriculum' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Course Curriculum ({course.curriculum.length} Modules)
                                        </h3>
                                        <button
                                            onClick={() => setExpandedModules(
                                                expandedModules.length === course.curriculum.length
                                                    ? []
                                                    : course.curriculum.map((m: any) => m.id)
                                            )}
                                            className="text-sm text-[#0066CC] hover:text-[#004c99] font-medium"
                                        >
                                            {expandedModules.length === course.curriculum.length
                                                ? 'Collapse All'
                                                : 'Expand All'
                                            }
                                        </button>
                                    </div>
                                    {course.curriculum.map((module: any) => (
                                        <div
                                            key={module.id}
                                            className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-[#76C043]"
                                        >
                                            {/* Module Header */}
                                            <button
                                                onClick={() => toggleModule(module.id)}
                                                className={`w-full flex items-center justify-between p-4 transition-all ${expandedModules.includes(module.id) ? 'bg-[#e8f5e9]' : 'bg-gray-50 hover:bg-gray-100'}`}
                                            >
                                                <div className="flex items-center">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0066CC] text-white font-bold mr-4">
                                                        {module.id}
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="block font-medium text-gray-800">
                                                            {module.title}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {module.topics.length} topics
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-500 hidden md:inline">
                                                        {expandedModules.includes(module.id) ? 'Hide' : 'Show'}
                                                    </span>
                                                    {expandedModules.includes(module.id) ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-600" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Module Content */}
                                            {expandedModules.includes(module.id) && (
                                                <div className="p-6 bg-white">
                                                    <ul className="space-y-3">
                                                        {module.topics.map(
                                                            (topic: string, index: number) => (
                                                                <li
                                                                    key={index}
                                                                    className="flex items-start group"
                                                                >
                                                                    <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 text-sm mr-3 group-hover:bg-[#76C043] group-hover:text-white transition-colors">
                                                                        {index + 1}
                                                                    </span>
                                                                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                                                                        {topic}
                                                                    </span>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'faqs' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
                                    <div className="space-y-4">
                                        <div className="border border-gray-200 rounded-lg p-6 hover:border-[#76C043] transition-colors">
                                            <h4 className="font-bold text-gray-800 mb-2">When does the course start and finish?</h4>
                                            <p className="text-gray-600">
                                                The course starts on {course.classStarts} and consists of {course.totalClasses} classes over {course.totalHours} hours. You'll have lifetime access to the course materials.
                                            </p>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-6 hover:border-[#76C043] transition-colors">
                                            <h4 className="font-bold text-gray-800 mb-2">What are the prerequisites for this course?</h4>
                                            <p className="text-gray-600">
                                                Basic knowledge of Excel is recommended. You should be familiar with creating simple formulas, basic formatting, and data entry in Excel.
                                            </p>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-6 hover:border-[#76C043] transition-colors">
                                            <h4 className="font-bold text-gray-800 mb-2">Will I receive a certificate?</h4>
                                            <p className="text-gray-600">
                                                Yes, upon successful completion of the course, you will receive a certified certificate from BASIS & BITM that you can share with your professional network.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="w-full lg:w-100">

                        {/* Instructors */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                Instructors
                            </h3>
                            <div className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <img
                                    src={course.instructor.avatar}
                                    alt={course.instructor.name}
                                    className="w-16 h-16 rounded-full mr-4 border-2 border-[#0066CC]"
                                />
                                <div>
                                    <p className="font-bold text-gray-800">
                                        {course.instructor.name}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-1">
                                        {course.instructor.role}
                                    </p>
                                    <div className="flex items-center text-sm">
                                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                        <span className="text-gray-600">4.9 Instructor Rating</span>
                                    </div>
                                </div>
                            </div>
                            <Link to={`/instructor/${course.instructor.id}`} className=" block w-full mt-4 text-center text-[#0066CC] font-medium hover:text-[#004c99] transition-colors">
                                View Profile →
                            </Link>
                        </div>

                        {/* Who can Join */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-[#0066CC]" />
                                Who can Join ?
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                {course.whoCanJoin}
                            </p>
                            <ul className="space-y-2">
                                {['Data Analysts', 'Accountants', 'Managers', 'Business Owners', 'Marketing Professionals', 'Students'].map((role, index) => (
                                    <li key={index} className="flex items-center text-sm">
                                        <span className="inline-block w-1.5 h-1.5 bg-[#76C043] rounded-full mr-2"></span>
                                        {role}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Course Review */}
                <div className="mt-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-gray-800">Course Reviews</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <span className="ml-2 text-gray-800 font-bold">4.8</span>
                                <span className="ml-1 text-gray-600">(128 ratings)</span>
                            </div>
                            <button className="bg-[#76C043] text-white px-6 py-2 rounded-lg flex items-center hover:bg-[#65a838] transition-colors shadow-md hover:shadow-lg">
                                <Plus className="w-4 h-4 mr-1" />
                                Add Review
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Rating Summary */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4">Rating Breakdown</h3>
                            {[5, 4, 3, 2, 1].map((stars) => (
                                <div key={stars} className="flex items-center mb-2">
                                    <div className="flex w-20">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mx-3">
                                        <div
                                            className="h-full bg-yellow-400"
                                            style={{ width: `${stars === 5 ? '85' : stars === 4 ? '10' : '5'}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-10 text-right">
                                        {stars === 5 ? '85%' : stars === 4 ? '10%' : '5%'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Recent Reviews */}
                        <div className="md:col-span-2 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4">Recent Reviews</h3>
                            <div className="space-y-4">
                                <div className="pb-4 border-b border-gray-100">
                                    <div className="flex items-center mb-2">
                                        <img
                                            src="https://ui-avatars.com/api/?name=John+Doe&background=0066CC&color=fff"
                                            alt="Reviewer"
                                            className="w-10 h-10 rounded-full mr-3"
                                        />
                                        <div>
                                            <p className="font-medium">John Doe</p>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                                ))}
                                                <span className="text-sm text-gray-500 ml-2">2 days ago</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600">Excellent course! The instructor explained complex topics in a very simple way.</p>
                                </div>
                                <div className="text-center py-8">
                                    <p className="text-red-500 mb-2">No more reviews to show</p>
                                    <button className="text-[#0066CC] hover:text-[#004c99] font-medium">
                                        View all reviews →
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