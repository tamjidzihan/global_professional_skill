import { Link } from "react-router-dom"
import { Award, Target, Users, TrendingUp, BookOpen, Globe } from "lucide-react"

const AboutSection = () => {
    return (
        <section className="py-16 sm:py-24 bg-linear-to-b from-white to-blue-50/30">
            <div className="container mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <span className="inline-block px-4 py-1.5 bg-blue-100 text-[#0066CC] rounded-full text-sm font-semibold mb-4">
                        Our Story & Mission
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Empowering Bangladesh's <span className="text-[#0066CC]">Digital Future</span>
                    </h2>
                    <div className="w-24 h-1 bg-linear-to-r from-[#0066CC] to-[#76C043] mx-auto rounded-full mb-6"></div>
                    <p className="text-lg text-gray-600">
                        Transforming IT education since 2007 with world-class training programs
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Column - Visual Elements */}
                    <div className="relative">
                        {/* Main Image/Video Container */}
                        <div className="rounded-2xl overflow-hidden shadow-2xl group">
                            <div className="relative bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 h-64 sm:h-80 lg:h-96 flex items-center justify-center">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-500"></div>

                                {/* Play Button Overlay */}
                                <button className="absolute inset-0 flex items-center justify-center group/play">
                                    <div className="relative w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <div className="absolute inset-0 bg-linear-to-r from-[#0066CC] to-[#76C043] rounded-full opacity-0 group-hover/play:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative bg-white w-16 h-16 rounded-full flex items-center justify-center group-hover/play:scale-110 transition-transform duration-300">
                                            <div className="ml-1">
                                                <svg className="w-8 h-8 text-[#0066CC]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                <div className="text-center p-6 relative z-10">
                                    <Globe className="w-16 h-16 mx-auto mb-4 text-white/40" />
                                    <span className="text-white font-bold text-xl sm:text-2xl">
                                        GPIS-BD Campus Tour
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Stats Cards */}
                        <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100 w-40">
                            <div className="flex items-center space-x-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Award className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">15+</div>
                                    <div className="text-xs text-gray-500">Years Experience</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100 w-44">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">50K+</div>
                                    <div className="text-xs text-gray-500">Students Trained</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div>
                        {/* Timeline/Milestones */}
                        <div className="mb-8">
                            <div className="flex items-center mb-6">
                                <div className="bg-linear-to-r from-[#0066CC] to-blue-500 p-2 rounded-lg mr-4">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Our Vision & Mission</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-3 h-3 bg-[#76C043] rounded-full"></div>
                                    <p className="text-gray-700 leading-relaxed">
                                        To be a world-class IT institute in Bangladesh for enhancing
                                        the competitiveness of the IT Sector by creating qualified
                                        IT professionals and certified IT companies.
                                    </p>
                                </div>

                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-3 h-3 bg-[#0066CC] rounded-full"></div>
                                    <p className="text-gray-700 leading-relaxed">
                                        Established in 2012 with support from the World Bank,
                                        GPIS-BD continues BASIS's training initiatives started in 2007
                                        to address industry skill gaps.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-linear-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                                <TrendingUp className="w-8 h-8 text-[#0066CC] mb-3" />
                                <h4 className="font-semibold text-gray-900 mb-1">Industry Ready</h4>
                                <p className="text-sm text-gray-600">Skills matching industry demands</p>
                            </div>
                            <div className="bg-linear-to-br from-green-50 to-white p-4 rounded-xl border border-green-100">
                                <BookOpen className="w-8 h-8 text-[#76C043] mb-3" />
                                <h4 className="font-semibold text-gray-900 mb-1">Certified Programs</h4>
                                <p className="text-sm text-gray-600">Globally recognized certifications</p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Link
                                to="/about"
                                className="group relative px-6 py-3 bg-linear-to-r from-[#0066CC] to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] inline-flex items-center justify-center"
                            >
                                <span className="relative z-10 flex items-center">
                                    Discover More
                                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-linear-to-r from-blue-700 to-blue-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </Link>

                            <Link
                                to="/contact"
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 inline-flex items-center justify-center"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default AboutSection