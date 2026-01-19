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
    Users,
    ChevronRight
} from 'lucide-react'

export function Footer() {


    const importantLinks = [
        { label: 'All Courses', path: '/courses', badge: 'New' },
        { label: 'Admission Process', path: '/admission' },
        { label: 'Career Support', path: '/career' },
        { label: 'Industry Partners', path: '/partners' },
        { label: 'Success Stories', path: '/success' },
        { label: 'Blog & News', path: '/blog' },
    ]

    const quickLinks = [
        { label: 'About BITM', path: '/about' },
        { label: 'Faculty Team', path: '/faculty' },
        { label: 'Training Labs', path: '/labs' },
        { label: 'Events & Workshops', path: '/events' },
        { label: 'Contact Us', path: '/contact' },
        { label: 'Privacy Policy', path: '/privacy' },
    ]

    const socialLinks = [
        { icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600', path: '#' },
        { icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-700', path: '#' },
        { icon: Twitter, label: 'Twitter', color: 'hover:bg-blue-400', path: '#' },
        { icon: Youtube, label: 'YouTube', color: 'hover:bg-red-600', path: '#' },
        { icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-600', path: '#' },
    ]

    const certifications = [
        'ISO Certified',
        'World Bank Supported',
        'BASIS Accredited',
        'NTVQF Approved',
    ]

    return (
        <footer className="bg-[#0052CC] text-white">

            {/* Main Footer Content */}
            <div className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                        {/* Logo & About */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="bg-white p-2 rounded-lg">
                                    <div className="px-4 py-2 bg-linear-to-r from-[#0066CC] to-blue-600 text-white font-bold text-xl">
                                        GPISBD
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-100 mb-6 leading-relaxed">
                                BASIS Institute of Technology & Management (BITM) is a premier IT training
                                institute dedicated to creating world-class IT professionals through
                                industry-relevant programs and hands-on training.
                            </p>

                            {/* Certifications */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3 text-gray-200">Certifications</h4>
                                <div className="flex flex-wrap gap-2">
                                    {certifications.map((cert, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-100 border border-white/10"
                                        >
                                            {cert}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Important Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center">
                                <span className="p-2 bg-white/10 rounded-lg mr-3">
                                    <Award className="w-4 h-4" />
                                </span>
                                Programs
                            </h3>
                            <ul className="space-y-3">
                                {importantLinks.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.path}
                                            className="flex items-center text-gray-100 hover:text-white transition-colors group"
                                        >
                                            <ChevronRight className="w-4 h-4 mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span>{link.label}</span>
                                            {link.badge && (
                                                <span className="ml-2 px-2 py-0.5 bg-green-500 text-xs rounded-full">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center">
                                <span className="p-2 bg-white/10 rounded-lg mr-3">
                                    <Users className="w-4 h-4" />
                                </span>
                                Resources
                            </h3>
                            <ul className="space-y-3">
                                {quickLinks.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.path}
                                            className="flex items-center text-gray-100 hover:text-white transition-colors group"
                                        >
                                            <ChevronRight className="w-4 h-4 mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span>{link.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center">
                                <span className="p-2 bg-white/10 rounded-lg mr-3">
                                    <Phone className="w-4 h-4" />
                                </span>
                                Contact
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                                    <p className="text-gray-100">
                                        BDBL Bhaban (Level-3, East),<br />
                                        12 Karwan Bazar,<br />
                                        Dhaka-1215, Bangladesh
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                                    <a href="tel:+8809638016499" className="text-white font-medium hover:text-blue-300">
                                        +88 09638-016499
                                    </a>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                                    <a href="mailto:info@gpsibd.org.bd" className="text-gray-100 hover:text-white">
                                        info@gpsibd.org.bd
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social & Bottom Section */}
            <div className=" py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Social Links */}
                        <div className="flex items-center space-x-4">
                            {socialLinks.map((social, index) => {
                                const Icon = social.icon
                                return (
                                    <a
                                        href="#"
                                        key={index}
                                        className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#0066CC] transition-colors"
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                )
                            })}
                        </div>

                        {/* Copyright */}
                        <div className="text-center lg:text-right">
                            <p className="text-gray-200 text-sm">
                                © {new Date().getFullYear()} GPISBD. All rights reserved.
                            </p>
                            <p className="text-gray-200 text-xs mt-1">
                                Part of BASIS Institute of Technology & Management (BITM)
                            </p>
                        </div>
                    </div>
                </div>
            </div>


        </footer>
    )
}