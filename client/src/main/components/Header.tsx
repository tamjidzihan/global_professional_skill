import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Phone, Mail, User, UserPlus, Menu, X } from 'lucide-react'
export function Header() {
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const isActive = (path: string) => {
        return location.pathname === path
            ? 'text-white font-bold'
            : 'text-blue-100 hover:text-white transition-colors'
    }
    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
    }
    return (
        <header className="w-full relative">
            {/* Top Bar */}
            <div className="bg-white py-2 border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-2">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-gray-600">
                            <div className="flex items-center">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-[#76C043] mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">+88 09638-016499</span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-[#76C043] mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">info@bitm.org.bd</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Link
                                to="/login"
                                className="flex items-center text-gray-600 hover:text-[#0066CC] transition-colors text-xs sm:text-sm"
                            >
                                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-[#76C043]" />
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center text-gray-600 hover:text-[#0066CC] transition-colors text-xs sm:text-sm"
                            >
                                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-[#76C043]" />
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="bg-[#0066CC] text-white py-3 sm:py-4 shadow-md">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    {/* Logo Area */}
                    <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
                        <div className="bg-white p-1 rounded">
                            <div className="h-8 w-24 sm:h-10 sm:w-32 flex items-center justify-center bg-white text-[#0066CC] font-bold text-lg sm:text-xl">
                                BITM
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center space-x-8 font-medium">
                        <Link to="/" className={isActive('/')}>
                            Home
                        </Link>
                        <Link to="/courses" className={isActive('/courses')}>
                            Our Courses
                        </Link>
                        <Link
                            to="#"
                            className="text-blue-100 hover:text-white transition-colors"
                        >
                            PGD
                        </Link>
                        <Link
                            to="#"
                            className="text-blue-100 hover:text-white transition-colors"
                        >
                            RPL
                        </Link>
                        <Link to="/about" className={isActive('/about')}>
                            About Us
                        </Link>
                    </nav>

                    {/* BASIS Logo Area */}
                    <div className="hidden md:block">
                        <div className="bg-white/10 p-1 rounded">
                            <div className="text-white text-xs font-bold px-2 py-1 border border-white/30 rounded">
                                BASIS
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2 hover:bg-white/10 rounded transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Mobile Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="bg-[#0066CC] text-white p-4 flex justify-between items-center">
                        <span className="font-bold text-lg">Menu</span>
                        <button
                            onClick={closeMobileMenu}
                            className="p-2 hover:bg-white/10 rounded transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mobile Menu Links */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <Link
                            to="/"
                            className={`block px-6 py-3 text-gray-800 hover:bg-gray-100 transition-colors ${location.pathname === '/' ? 'bg-blue-50 text-[#0066CC] font-semibold border-l-4 border-[#0066CC]' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            Home
                        </Link>
                        <Link
                            to="/courses"
                            className={`block px-6 py-3 text-gray-800 hover:bg-gray-100 transition-colors ${location.pathname === '/courses' ? 'bg-blue-50 text-[#0066CC] font-semibold border-l-4 border-[#0066CC]' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            Our Courses
                        </Link>
                        <Link
                            to="#"
                            className="block px-6 py-3 text-gray-800 hover:bg-gray-100 transition-colors"
                            onClick={closeMobileMenu}
                        >
                            PGD
                        </Link>
                        <Link
                            to="#"
                            className="block px-6 py-3 text-gray-800 hover:bg-gray-100 transition-colors"
                            onClick={closeMobileMenu}
                        >
                            RPL
                        </Link>
                        <Link
                            to="/about"
                            className={`block px-6 py-3 text-gray-800 hover:bg-gray-100 transition-colors ${location.pathname === '/about' ? 'bg-blue-50 text-[#0066CC] font-semibold border-l-4 border-[#0066CC]' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            About Us
                        </Link>

                        <div className="border-t border-gray-200 mt-4 pt-4">
                            <Link
                                to="/login"
                                className="flex items-center px-6 py-3 text-gray-800 hover:bg-gray-100 transition-colors"
                                onClick={closeMobileMenu}
                            >
                                <User className="w-4 h-4 mr-2 text-[#76C043]" />
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center px-6 py-3 text-gray-800 hover:bg-gray-100 transition-colors"
                                onClick={closeMobileMenu}
                            >
                                <UserPlus className="w-4 h-4 mr-2 text-[#76C043]" />
                                Register
                            </Link>
                        </div>
                    </nav>

                    {/* Mobile Menu Footer */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center">
                                <Phone className="w-3 h-3 text-[#76C043] mr-2" />
                                <span>+88 09638-016499</span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="w-3 h-3 text-[#76C043] mr-2" />
                                <span>info@bitm.org.bd</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
