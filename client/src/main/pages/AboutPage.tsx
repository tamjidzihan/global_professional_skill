import { Target, Eye, Building, Users, Award, Monitor } from 'lucide-react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'

const AboutPage = () => {
    return (
        <>
            <Breadcrumb name="About Us" />
            <div className="container mx-auto px-4 py-16">
                {/* Introduction */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold text-[#0066CC] mb-6">
                        Welcome to GPISBD
                    </h2>
                    <div className="h-1 w-20 bg-[#76C043] mx-auto mb-8"></div>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        To address the skill gap of HR in the industry, BASIS started its
                        own training activities in 2007. Later in 2012, BASIS
                        institutionalized its training activities and set up BASIS Institute
                        of Technology & Management Limited (GPISBD) with the support of World
                        Bank. GPISBD was established with a vision to be a world-class IT
                        institute in Bangladesh for the purpose of enhancing the
                        competitiveness of the IT Sector in Bangladesh by creating a pool of
                        qualified IT professionals and quality certified IT companies.
                    </p>
                </div>

                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-[#0066CC] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                <Target className="w-6 h-6 text-[#0066CC]" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Our Mission</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            To create a pool of qualified IT professionals and quality
                            certified IT companies to enhance the competitiveness of the IT
                            Sector in Bangladesh. We aim to bridge the gap between industry
                            requirements and academic output through practical, hands-on
                            training.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-[#76C043] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                <Eye className="w-6 h-6 text-[#76C043]" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Our Vision</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            To be a world-class IT institute in Bangladesh, recognized
                            globally for excellence in technology education and professional
                            development. We envision a digital Bangladesh where skilled
                            professionals drive innovation and economic growth.
                        </p>
                    </div>
                </div>

                {/* Why Choose Us / Infrastructure */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-[#0066CC] mb-8 text-center">
                        Why Choose GPISBD?
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-6 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                            <Building className="w-12 h-12 text-[#0066CC] mx-auto mb-4" />
                            <h4 className="font-bold text-lg mb-2">Modern Infrastructure</h4>
                            <p className="text-sm text-gray-500">
                                State-of-the-art labs and classrooms equipped with latest
                                technology.
                            </p>
                        </div>
                        <div className="text-center p-6 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                            <Users className="w-12 h-12 text-[#0066CC] mx-auto mb-4" />
                            <h4 className="font-bold text-lg mb-2">Expert Trainers</h4>
                            <p className="text-sm text-gray-500">
                                Industry experienced professionals as mentors and instructors.
                            </p>
                        </div>
                        <div className="text-center p-6 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                            <Award className="w-12 h-12 text-[#0066CC] mx-auto mb-4" />
                            <h4 className="font-bold text-lg mb-2">Industry Certification</h4>
                            <p className="text-sm text-gray-500">
                                Globally recognized certificates upon successful course
                                completion.
                            </p>
                        </div>
                        <div className="text-center p-6 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                            <Monitor className="w-12 h-12 text-[#0066CC] mx-auto mb-4" />
                            <h4 className="font-bold text-lg mb-2">Hands-on Training</h4>
                            <p className="text-sm text-gray-500">
                                Practical project-based learning approach for real-world skills.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="bg-linear-to-r from-[#0066CC] to-[#0052CC] rounded-2xl p-8 md:p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of successful graduates who have transformed their
                        careers with GPISBD. Explore our courses and find the right path for
                        you.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/courses"
                            className="px-8 py-3 bg-[#76C043] text-white rounded-full font-bold hover:bg-[#65a838] transition-colors"
                        >
                            Browse Courses
                        </Link>
                        <Link
                            to="/register"
                            className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-[#0066CC] transition-colors"
                        >
                            Register Now
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AboutPage