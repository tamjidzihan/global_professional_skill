import { Link } from "react-router-dom"
import {
    Award,
    Target,
    Users,
    TrendingUp,
    BookOpen,
    Globe,
    Sparkles,
    Rocket,
    CheckCircle,
    ArrowUpRight,
    Zap,
    Heart,
    Shield
} from "lucide-react"

const AboutSection = () => {
    const achievements = [
        { number: "50,000+", label: "Happy Students", icon: Users, color: "bg-blue-500" },
        { number: "200+", label: "Expert Courses", icon: BookOpen, color: "bg-green-500" },
        { number: "98%", label: "Success Rate", icon: TrendingUp, color: "bg-purple-500" },
        { number: "18+", label: "Years Legacy", icon: Award, color: "bg-orange-500" },
    ]

    const highlights = [
        { text: "Industry-Aligned Curriculum", icon: CheckCircle },
        { text: "World Bank Supported", icon: CheckCircle },
        { text: "Hands-on Training Labs", icon: CheckCircle },
        { text: "Job Placement Support", icon: CheckCircle },
        { text: "Lifetime Access", icon: CheckCircle },
        { text: "Expert Mentorship", icon: CheckCircle },
    ]

    return (
        <section className="relative py-20 sm:py-28 overflow-hidden bg-[#FCF8F1]">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large Circle - Top Right */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
                {/* Medium Circle - Bottom Left */}
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-linear-to-tr from-green-200/30 to-yellow-200/30 rounded-full blur-3xl"></div>
                {/* Small Circles */}
                <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-purple-300/20 rounded-full blur-2xl"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                {/* Asymmetric Header */}
                <div className="max-w-6xl mx-auto mb-16">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        {/* Left Side - Main Title */}
                        <div className="lg:max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold mb-6 shadow-lg">
                                <Sparkles className="w-4 h-4" />
                                Pioneering Digital Education Since 2007
                            </div>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                                Building Bangladesh's
                                <span className="block mt-2 bg-linear-to-r from-[#0066CC] via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Tech Leaders
                                </span>
                            </h2>
                            <p className="text-xl text-gray-700 leading-relaxed">
                                We transform ambitious learners into industry-ready professionals through
                                cutting-edge curriculum and hands-on experience.
                            </p>
                        </div>

                        {/* Right Side - Quick Stats */}
                        <div className="flex gap-4">
                            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-200 min-w-35">
                                <div className="text-4xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    #1
                                </div>
                                <p className="text-sm font-semibold text-gray-700">IT Training Institute</p>
                            </div>
                            <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl text-white min-w-35">
                                <Rocket className="w-10 h-10 mb-3" />
                                <p className="text-sm font-bold">Fast-Track Career Growth</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid - Completely Different Layout */}
                <div className="grid lg:grid-cols-5 gap-8 mb-16">
                    {/* Left Column - 3/5 width */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Story Card with Diagonal Design */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-purple-600 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                            <div className="relative bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-white">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="bg-linear-to-br from-blue-500 to-purple-500 p-4 rounded-2xl shadow-lg">
                                        <Target className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-2">Our Mission</h3>
                                        <div className="h-1 w-20 bg-linear-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                    </div>
                                </div>

                                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                                    To be a <strong className="text-blue-600">world-class IT institute</strong> in Bangladesh,
                                    enhancing the competitiveness of the IT sector by creating qualified professionals
                                    and certified companies that drive digital transformation.
                                </p>

                                <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="w-6 h-6 text-blue-600" />
                                        <h4 className="font-bold text-gray-900">Our Foundation</h4>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        Established in <strong>2012 with World Bank support</strong>, building on BASIS's
                                        training legacy from 2007. We've trained over 50,000 students and continue to bridge
                                        the industry skill gap with innovative programs.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Highlights Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {highlights.map((item, index) => {
                                const Icon = item.icon
                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-green-400 transition-all duration-300 group hover:shadow-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-xl group-hover:bg-green-500 transition-colors">
                                                <Icon className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                                            </div>
                                            <span className="font-semibold text-gray-800 text-sm">{item.text}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Column - 2/5 width */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video/Image Card - Vertical */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-linear-to-br from-green-400 to-blue-500 rounded-3xl transform -rotate-2 group-hover:-rotate-3 transition-transform duration-300"></div>
                            <div className="relative bg-linear-to-br from-blue-900 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-100">
                                {/* Pattern Overlay */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0"
                                        style={{
                                            backgroundImage: `repeating-linear-gradient(45deg, white 0px, white 2px, transparent 2px, transparent 10px)`,
                                        }}>
                                    </div>
                                </div>

                                {/* Play Button */}
                                <button className="absolute inset-0 flex items-center justify-center group/play">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping"></div>
                                        <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover/play:scale-110 transition-transform">
                                            <svg className="w-10 h-10 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Globe className="w-5 h-5 text-white" />
                                        <span className="text-white font-bold text-lg">Virtual Campus Tour</span>
                                    </div>
                                    <p className="text-white/80 text-sm">Experience our state-of-the-art facilities</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Card */}
                        <div className="bg-linear-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                            <div className="relative">
                                <Heart className="w-12 h-12 mb-4" />
                                <h3 className="text-2xl font-black mb-3">Join 50,000+ Learners</h3>
                                <p className="text-white/90 mb-6 leading-relaxed">
                                    Start your journey to becoming a tech professional today.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Link
                                        to="/about"
                                        className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors inline-flex items-center justify-center group"
                                    >
                                        Learn More
                                        <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/courses"
                                        className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors inline-flex items-center justify-center"
                                    >
                                        Browse Courses
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievement Cards - Horizontal Scroll on Mobile, Grid on Desktop */}
                <div className="relative">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-linear-to-r from-yellow-400 to-orange-400 p-3 rounded-xl">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">Our Impact in Numbers</h3>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {achievements.map((achievement, index) => {
                            const Icon = achievement.icon
                            return (
                                <div
                                    key={index}
                                    className="relative group"
                                >
                                    {/* Background Glow */}
                                    <div className={`absolute inset-0 ${achievement.color} opacity-0 group-hover:opacity-20 blur-2xl rounded-3xl transition-opacity duration-300`}></div>

                                    {/* Card */}
                                    <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 group-hover:border-transparent group-hover:-translate-y-2">
                                        <div className={`${achievement.color} p-3 sm:p-4 rounded-xl sm:rounded-2xl inline-flex mb-4 shadow-lg`}>
                                            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                        <div className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                                            {achievement.number}
                                        </div>
                                        <div className="text-sm sm:text-base font-semibold text-gray-600">
                                            {achievement.label}
                                        </div>

                                        {/* Decorative Element */}
                                        <div className="absolute top-4 right-4 w-2 h-2 bg-gray-300 rounded-full group-hover:bg-green-400 transition-colors"></div>
                                        <div className="absolute top-4 right-8 w-2 h-2 bg-gray-200 rounded-full group-hover:bg-blue-400 transition-colors"></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Bottom Trust Bar */}
                <div className="mt-16 bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-linear-to-br from-blue-500 to-purple-500 p-4 rounded-2xl">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-lg mb-1">Trusted & Accredited</h4>
                                <p className="text-gray-600 text-sm">Recognized by leading organizations worldwide</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {['ISO 9001', 'World Bank', 'BASIS', 'NTVQF'].map((badge, index) => (
                                <div
                                    key={index}
                                    className="px-4 py-2 bg-linear-to-r from-gray-100 to-gray-200 rounded-xl font-bold text-gray-700 text-sm border-2 border-gray-300 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 transition-all"
                                >
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection