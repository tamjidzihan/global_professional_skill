import {
    Target,
    Eye,
    Building,
    Users,
    Award,
    Monitor,
    CheckCircle,
    TrendingUp,
    Globe,
    Sparkles,
    Rocket,
    Shield,
    BookOpen,
    Zap,
    Heart,
    Star
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'

const AboutPage = () => {
    const features = [
        {
            icon: Building,
            title: "Modern Infrastructure",
            description: "State-of-the-art labs and classrooms equipped with latest technology",
            color: "blue"
        },
        {
            icon: Users,
            title: "Expert Trainers",
            description: "Industry experienced professionals as mentors and instructors",
            color: "green"
        },
        {
            icon: Award,
            title: "Industry Certification",
            description: "Globally recognized certificates upon successful course completion",
            color: "purple"
        },
        {
            icon: Monitor,
            title: "Hands-on Training",
            description: "Practical project-based learning approach for real-world skills",
            color: "orange"
        },
    ]

    const stats = [
        { number: "50,000+", label: "Students Trained", icon: Users },
        { number: "200+", label: "Courses Offered", icon: BookOpen },
        { number: "98%", label: "Success Rate", icon: TrendingUp },
        { number: "18+", label: "Years Experience", icon: Award },
    ]

    const achievements = [
        { text: "World Bank Supported Institute", icon: CheckCircle },
        { text: "BASIS Accredited Training Center", icon: CheckCircle },
        { text: "ISO 9001:2015 Certified", icon: CheckCircle },
        { text: "NTVQF Approved Programs", icon: CheckCircle },
        { text: "Industry-Leading Curriculum", icon: CheckCircle },
        { text: "Job Placement Assistance", icon: CheckCircle },
    ]

    return (
        <div className="bg-[#FCF8F1]">
            <Breadcrumb name="About Us" />

            {/* Hero Section */}
            <section className="relative py-16 sm:py-20 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    {/* Introduction */}
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold mb-6 shadow-lg">
                            <Sparkles className="w-4 h-4" />
                            Pioneering IT Education Since 2007
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                            Welcome to
                            <span className="block mt-2 bg-gradient-to-r from-[#0066CC] via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                GPIS-BD
                            </span>
                        </h1>
                        <div className="h-1 w-24 bg-gradient-to-r from-[#0066CC] to-[#76C043] mx-auto rounded-full mb-8"></div>
                        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                            To address the skill gap of HR in the industry, BASIS started its
                            own training activities in 2007. Later in 2012, BASIS
                            institutionalized its training activities and set up BASIS Institute
                            of Technology & Management Limited (GPIS-BD) with the support of <strong className="text-blue-600">World Bank</strong>.
                            GPIS-BD was established with a vision to be a <strong className="text-blue-600">world-class IT
                                institute</strong> in Bangladesh for the purpose of enhancing the
                            competitiveness of the IT Sector in Bangladesh by creating a pool of
                            qualified IT professionals and quality certified IT companies.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon
                            const colors = ['blue', 'green', 'purple', 'orange']
                            const colorClasses = {
                                blue: 'bg-blue-500',
                                green: 'bg-green-500',
                                purple: 'bg-purple-500',
                                orange: 'bg-orange-500',
                            }
                            const color = colors[index % colors.length]
                            return (
                                <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-transparent hover:-translate-y-2 group">
                                    <div className={`${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-xl inline-flex mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm sm:text-base font-semibold text-gray-600">
                                        {stat.label}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-gradient-to-b from-white to-[#F5EFE6]">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Mission Card */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                                <div className="relative bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-white">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                                            <Target className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Our Mission</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        To create a pool of <strong className="text-blue-600">qualified IT professionals</strong> and quality
                                        certified IT companies to enhance the competitiveness of the IT
                                        Sector in Bangladesh. We aim to bridge the gap between industry
                                        requirements and academic output through practical, hands-on
                                        training that prepares students for real-world challenges.
                                    </p>
                                    <div className="mt-6 flex items-center gap-2 text-blue-600">
                                        <Rocket className="w-5 h-5" />
                                        <span className="font-semibold text-sm">Driving Innovation & Excellence</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vision Card */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
                                <div className="relative bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-white">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                                            <Eye className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Our Vision</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mt-2"></div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        To be a <strong className="text-green-600">world-class IT institute</strong> in Bangladesh, recognized
                                        globally for excellence in technology education and professional
                                        development. We envision a digital Bangladesh where skilled
                                        professionals drive innovation, economic growth, and technological
                                        advancement.
                                    </p>
                                    <div className="mt-6 flex items-center gap-2 text-green-600">
                                        <Globe className="w-5 h-5" />
                                        <span className="font-semibold text-sm">Building Tomorrow's Leaders</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 border border-yellow-200 text-yellow-700 rounded-full text-sm font-semibold mb-4">
                                <Star className="w-4 h-4" />
                                Our Achievements
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                                Trusted & <span className="text-[#0066CC]">Accredited</span>
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Recognized by leading organizations worldwide for our commitment to quality education
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {achievements.map((achievement, index) => {
                                const Icon = achievement.icon
                                return (
                                    <div
                                        key={index}
                                        className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-5 border-2 border-green-200 hover:border-green-400 transition-all duration-300 group hover:shadow-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-500 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold text-gray-800">{achievement.text}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-gradient-to-b from-[#F5EFE6] to-[#FCF8F1]">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 text-blue-700 rounded-full text-sm font-semibold mb-4">
                                <Shield className="w-4 h-4" />
                                Why Choose Us
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                                What Makes Us <span className="text-[#0066CC]">Different</span>
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Discover the advantages that set GPIS-BD apart from other institutions
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => {
                                const Icon = feature.icon
                                const colorClasses = {
                                    blue: { bg: 'bg-blue-500', hover: 'hover:border-blue-400', glow: 'group-hover:bg-blue-400/20' },
                                    green: { bg: 'bg-green-500', hover: 'hover:border-green-400', glow: 'group-hover:bg-green-400/20' },
                                    purple: { bg: 'bg-purple-500', hover: 'hover:border-purple-400', glow: 'group-hover:bg-purple-400/20' },
                                    orange: { bg: 'bg-orange-500', hover: 'hover:border-orange-400', glow: 'group-hover:bg-orange-400/20' },
                                }
                                const colors = colorClasses[feature.color as keyof typeof colorClasses]

                                return (
                                    <div key={index} className="relative group">
                                        {/* Glow Effect */}
                                        <div className={`absolute inset-0 ${colors.glow} blur-2xl rounded-3xl transition-all duration-300 opacity-0 group-hover:opacity-100`}></div>

                                        {/* Card */}
                                        <div className={`relative bg-white rounded-2xl p-6 border-2 border-gray-200 ${colors.hover} transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}>
                                            <div className={`${colors.bg} p-4 rounded-2xl inline-flex mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="font-black text-lg text-gray-900 mb-3">{feature.title}</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="relative overflow-hidden bg-gradient-to-r from-[#0066CC] via-blue-600 to-purple-600 rounded-3xl p-10 sm:p-16 text-center text-white shadow-2xl">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-6">
                                    <Heart className="w-4 h-4" />
                                    Join Our Community
                                </div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                                    Ready to Start Your Journey?
                                </h2>
                                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                                    Join thousands of successful graduates who have transformed their
                                    careers with GPIS-BD. Explore our courses and find the right path for
                                    you today!
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link
                                        to="/courses"
                                        className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-2xl inline-flex items-center justify-center"
                                    >
                                        Browse Courses
                                        <Zap className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all inline-flex items-center justify-center"
                                    >
                                        Register Now
                                        <Rocket className="w-5 h-5 ml-2" />
                                    </Link>
                                </div>

                                {/* Trust Indicators */}
                                <div className="mt-10 pt-8 border-t border-white/20">
                                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>50,000+ Students Trained</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>98% Success Rate</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Industry Recognized</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AboutPage