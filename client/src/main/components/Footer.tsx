import {
    Facebook,
    Linkedin,
    Twitter,
    Youtube,
    Instagram,
    MapPin,
    Phone,
    Mail,
    Award,
    BookOpen,
    ChevronRight,
    Heart,
    Globe,
    Clock,
    Send,
    GraduationCap,
    Building2,
    Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import gpiLogo from '../../assets/gpilogo_1.png' // Import your logo
import { useCategories } from '../../hooks/useCategories'

export function Footer() {
    const { categories, fetchCategories, loading } = useCategories()
    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    // Get first 6 categories
    const courseCategories = categories.slice(0, 6).map(cat => ({
        label: cat.name,
        path: `/courses?category=${cat.id}`
    }))

    const quickLinks = [
        { label: 'About GPI', path: '/about', icon: Building2 },
        { label: 'All Courses', path: '/courses', icon: BookOpen },
        { label: 'Become an Instructor', path: '/apply-as-instructor', icon: GraduationCap },
        { label: 'Student Portal', path: '/dashboard/student', icon: Users },
        { label: 'Career Support', path: '/career', icon: Award },
        { label: 'Contact Us', path: '/contact', icon: Mail },
    ]

    const legalLinks = [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Refund Policy', path: '/refund' },
        { label: 'Cookie Policy', path: '/cookies' },
    ]

    const socialLinks = [
        { icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600', path: 'https://facebook.com' },
        { icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-700', path: 'https://linkedin.com' },
        { icon: Twitter, label: 'Twitter', color: 'hover:bg-sky-500', path: 'https://twitter.com' },
        { icon: Youtube, label: 'YouTube', color: 'hover:bg-red-600', path: 'https://youtube.com' },
        { icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-600', path: 'https://instagram.com' },
    ]

    return (
        <footer className="bg-[#FCF8F1] text-gray-800">
            {/* Main Footer Content */}
            <div className="py-16 bg-[#F5EFE6]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Brand Section - Spans 4 columns */}
                        <div className="lg:col-span-4">
                            {/* Logo - Updated with image */}
                            <Link to="/" className="inline-block mb-6">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={gpiLogo}
                                        alt="Global Professional Institute - GPI"
                                        className="h-26 w-auto" // Adjust height as needed
                                    />
                                </div>
                            </Link>

                            <p className="text-gray-700 mb-6 leading-relaxed">
                                Empowering individuals with world-class education and skills for the digital age.
                                Join thousands of students transforming their careers through our comprehensive courses.
                            </p>

                            {/* Newsletter */}
                            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                <h4 className="font-semibold mb-3 flex items-center text-gray-900">
                                    <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                    Subscribe to Newsletter
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Get the latest updates on new courses and offers
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                    <button className="px-4 py-2.5 bg-linear-to-r from-[#76C043] to-green-500 rounded-lg hover:from-green-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl">
                                        <Send className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Certifications */}
                            <div className="mt-6">
                                <h4 className="font-semibold mb-3 text-gray-700 text-sm">Accredited & Certified By</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['ISO Certified', 'BASIS Accredited', 'NTVQF Approved'].map((cert, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-white rounded-lg text-xs text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm"
                                        >
                                            {cert}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Popular Courses - Spans 3 columns */}
                        <div className="lg:col-span-3">
                            <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                                <div className="w-1 h-6 bg-linear-to-b from-blue-500 to-green-500 rounded-full mr-3"></div>
                                Popular Courses
                            </h3>
                            {loading ? (
                                <div className="text-gray-500">Loading courses...</div>
                            ) : (
                                <ul className="space-y-3">
                                    {courseCategories.map((link, index) => (
                                        <li key={index}>
                                            <Link
                                                to={link.path}
                                                className="flex items-center text-gray-700 hover:text-[#0066CC] transition-all group py-1"
                                            >
                                                <ChevronRight className="w-4 h-4 mr-2 text-blue-500 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                                <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Quick Links - Spans 2 columns */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                                <div className="w-1 h-6 bg-linear-to-b from-blue-500 to-green-500 rounded-full mr-3"></div>
                                Quick Links
                            </h3>
                            <ul className="space-y-3">
                                {quickLinks.map((link, index) => {
                                    const Icon = link.icon
                                    return (
                                        <li key={index}>
                                            <Link
                                                to={link.path}
                                                className="flex items-center text-gray-700 hover:text-[#0066CC] transition-all group py-1"
                                            >
                                                <Icon className="w-4 h-4 mr-3 text-blue-500 group-hover:text-green-500 transition-colors" />
                                                <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>

                        {/* Contact Info - Spans 3 columns - Updated with new info */}
                        <div className="lg:col-span-3">
                            <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                                <div className="w-1 h-6 bg-linear-to-b from-blue-500 to-green-500 rounded-full mr-3"></div>
                                Contact Us
                            </h3>
                            <div className="space-y-4">
                                {/* Address - Updated */}
                                <div className="flex items-start space-x-3 group">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                                        <MapPin className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-1">Head Office</p>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            House-5, Kolotan School Road, Notunbazar <br />
                                            Vatara, Dhaka-1212, Bangladesh
                                        </p>
                                    </div>
                                </div>

                                {/* Phone - Updated */}
                                <div className="flex items-start space-x-3 group">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-green-600 transition-colors">
                                        <Phone className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-1">Call Us</p>
                                        <a href="tel:+8801978100105" className="text-gray-700 hover:text-[#0066CC] font-medium text-sm transition-colors">
                                            +88 01978-100105
                                        </a>
                                    </div>
                                </div>

                                {/* Email - Updated */}
                                <div className="flex items-start space-x-3 group">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-600 transition-colors">
                                        <Mail className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-1">Email Us</p>
                                        <a href="mailto:info@gpibd.com" className="text-gray-700 hover:text-[#0066CC] text-sm transition-colors">
                                            info@gpibd.com
                                        </a>
                                    </div>
                                </div>

                                {/* Working Hours */}
                                <div className="flex items-start space-x-3 group">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-yellow-600 transition-colors">
                                        <Clock className="w-5 h-5 text-yellow-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-1">Working Hours</p>
                                        <p className="text-gray-600 text-sm">
                                            Sun - Thu: 9:00 AM - 6:00 PM<br />
                                            Friday: Closed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-300 bg-[#EDE4D3]">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Copyright - Updated from GPISBD to GPI */}
                        <div className="text-center lg:text-left">
                            <p className="text-gray-700 text-sm flex items-center justify-center lg:justify-start gap-1">
                                Made with <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> by GPI Team
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                                © {new Date().getFullYear()} Global Professional Institute - GPI. All rights reserved.
                            </p>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            <span className="text-gray-600 text-sm mr-2 hidden sm:block">Follow us:</span>
                            {socialLinks.map((social, index) => {
                                const Icon = social.icon
                                return (
                                    <a
                                        href={social.path}
                                        key={index}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-10 h-10 rounded-xl bg-white border border-gray-300 flex items-center justify-center hover:bg-white hover:border-blue-500 transition-all hover:scale-110 group shadow-sm ${social.color}`}
                                        aria-label={social.label}
                                    >
                                        <Icon className="w-5 h-5 text-gray-700 transition-colors" />
                                    </a>
                                )
                            })}
                        </div>

                        {/* Legal Links */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                            {legalLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.path}
                                    className="text-gray-600 hover:text-[#0066CC] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-[#E5DBCC] border-t border-gray-300">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600 text-xs">
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-600" />
                            <span>Trusted by 50,000+ Students</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <span>Available in 25+ Countries</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-green-600" />
                            <span>Industry-Recognized Certificates</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}