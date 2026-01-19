import {
    Facebook,
    Linkedin,
    Twitter,
    Youtube,
    MapPin,
    Phone,
    Mail,
} from 'lucide-react'
export function Footer() {
    return (
        <footer className="bg-[#0052CC] text-white pt-12 sm:pt-16 pb-6 sm:pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
                    {/* Column 1: About */}
                    <div>
                        <div className="mb-4 sm:mb-6 bg-white p-2 w-fit rounded">
                            <div className="h-6 sm:h-8 w-20 sm:w-24 flex items-center justify-center text-[#0066CC] font-bold text-lg sm:text-xl">
                                BITM
                            </div>
                        </div>
                        <div className="flex space-x-3 sm:space-x-4 mt-4 sm:mt-6">
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#0066CC] transition-colors"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#0066CC] transition-colors"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#0066CC] transition-colors"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#0066CC] transition-colors"
                            >
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Important Links */}
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                            Important Links
                        </h3>
                        <ul className="space-y-2 sm:space-y-3 text-sm text-blue-100">
                            <li>
                                <a href="#" className="hover:text-white flex items-center">
                                    <span className="mr-2">›</span> All Courses
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white flex items-center">
                                    <span className="mr-2">›</span> Upcoming Events
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white flex items-center">
                                    <span className="mr-2">›</span> About BITM
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white flex items-center">
                                    <span className="mr-2">›</span> Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Office Address */}
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                            Office Address
                        </h3>
                        <div className="flex items-start space-x-3 text-xs sm:text-sm text-blue-100 mb-4">
                            <MapPin className="w-4 sm:w-5 h-4 sm:h-5 mt-0.5 flex-shrink-0" />
                            <p>BDBL Bhaban (Level-3, East), 12 Karwan Bazar, Dhaka-1215</p>
                        </div>
                    </div>

                    {/* Column 4: Contact Us */}
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                            Contact Us
                        </h3>
                        <div className="flex items-center space-x-3 text-xs sm:text-sm text-blue-100 mb-3 sm:mb-4">
                            <Phone className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                            <p className="font-bold text-white text-base sm:text-lg">
                                +88 09638-016499
                            </p>
                        </div>
                        <div className="flex items-center space-x-3 text-xs sm:text-sm text-blue-100">
                            <Mail className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                            <p>info@bitm.org.bd</p>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="border-t border-blue-400/30 pt-6 sm:pt-8 mt-6 sm:mt-8">
                    <div className="flex flex-wrap justify-center gap-2 opacity-80">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                            <div
                                key={i}
                                className="h-6 sm:h-8 w-10 sm:w-12 bg-white rounded flex items-center justify-center text-[8px] text-gray-400"
                            >
                                PAY
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
