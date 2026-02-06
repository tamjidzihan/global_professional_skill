import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, User, UserPlus, Phone, Mail, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useAuthContext } from '../../context/AuthContext'

const Navbar = () => {
    const location = useLocation()
    const { isAuthenticated, user } = useAuthContext()
    const { logout } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
    const [isClosing, setIsClosing] = useState(false)
    const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false)

    const isActive = (path: string) => {
        return location.pathname === path
            ? 'text-white font-semibold border-b-2 border-white'
            : 'text-white/90 hover:text-white transition-colors duration-300'
    }

    const closeMobileMenu = () => {
        setIsClosing(true)
        setTimeout(() => {
            setMobileMenuOpen(false)
            setIsClosing(false)
        })
    }

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [mobileMenuOpen])

    const navItems = [
        { path: '/', label: 'Home' },
        {
            path: '/courses',
            label: 'Our Courses',
            dropdown: [
                { label: 'All Courses', path: '/courses' },
                { label: 'Web Development', path: '#' },
                { label: 'Cyber Security', path: '#' },
                { label: 'Digital Marketing', path: '#' },
                { label: 'Graphics Design', path: '#' },
            ]
        },
        { path: '#', label: 'PGD' },
        { path: '#', label: 'RPL' },
        { path: '/about', label: 'About Us' }
    ]

    return (
        <header className=' z-40'>
            {/* Top Bar */}
            <div className="py-2 text-sm bg-white/70 backdrop-blur border-b border-gray-200">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="hidden lg:flex items-center space-x-6 text-gray-600">
                        <div className="flex items-center">
                            <Phone className="w-4 h-4 text-[#76C043] mr-2" />
                            <span>+88 09638-016499</span>
                        </div>
                        <div className="flex items-center">
                            <Mail className="w-4 h-4 text-[#76C043] mr-2" />
                            <span>info@gpis.org.bd</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={`/dashboard/${user?.role.toLowerCase()}`}
                                    className="flex items-center gap-2 text-gray-700 hover:text-[#0066CC] transition"
                                >
                                    <User className="w-4 h-4 text-[#76C043]" />
                                    <span className="font-semibold">
                                        {user?.first_name} {user?.last_name}
                                    </span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition"
                                >
                                    <LogOut className="w-4 h-4 text-[#76C043]" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 text-gray-700 hover:text-[#0066CC] transition"
                                >
                                    <User className="w-4 h-4 text-[#76C043]" />
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 text-gray-700 hover:text-[#0066CC] transition"
                                >
                                    <UserPlus className="w-4 h-4 text-[#76C043]" />
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div>
                <div className="bg-white/80 backdrop-blur-xl shadow-[0_6px_30px_rgba(0,0,0,0.06)] border-b border-gray-200">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <Link to="/" className="flex items-center space-x-3">
                                <div className="px-4 py-2 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg shadow">
                                    GPIS-BD
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden lg:flex items-center space-x-1">
                                {navItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="relative"
                                        onMouseEnter={() => item.dropdown && setDropdownOpen(item.path)}
                                        onMouseLeave={() => setDropdownOpen(null)}
                                    >
                                        <Link
                                            to={item.path}
                                            className={`
                                    flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200
                                    ${isActive(item.path).includes('font-semibold')
                                                    ? 'text-[#0066CC] bg-blue-50 font-semibold'
                                                    : 'text-gray-700 hover:text-[#0066CC] hover:bg-blue-50'
                                                }
                                `}
                                        >
                                            <span>{item.label}</span>
                                            {item.dropdown && (
                                                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen === item.path ? 'rotate-180' : ''}`} />
                                            )}
                                        </Link>

                                        {/* Dropdown Menu */}
                                        {item.dropdown && dropdownOpen === item.path && (
                                            <div className="absolute top-full left-0 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                                {item.dropdown.map((subItem) => (
                                                    <Link
                                                        key={subItem.path}
                                                        to={subItem.path}
                                                        className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-[#0066CC] transition"
                                                        onClick={() => setDropdownOpen(null)}
                                                    >
                                                        <span className="font-medium">{subItem.label}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </nav>

                            {/* Right Side Actions */}
                            <div className="hidden lg:flex items-center space-x-3">
                                {isAuthenticated && (
                                    <Link
                                        to="/apply-as-instructor"
                                        className="ml-2 px-5 py-2 rounded-xl bg-linear-to-r from-[#76C043] to-green-500 text-white font-semibold shadow hover:shadow-lg transition-all duration-300 hover:scale-105"
                                    >
                                        Join as Instructor
                                    </Link>
                                )}
                            </div>

                            {/* Mobile Menu Button (UNCHANGED) */}
                            <button
                                className="lg:hidden p-2 rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6 text-gray-700" />
                                ) : (
                                    <Menu className="w-6 h-6 text-gray-700" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {(mobileMenuOpen || isClosing) && (
                    <div
                        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${mobileMenuOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}
                        onClick={closeMobileMenu}
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                    </div>
                )}
                {/* Mobile Menu Sidebar */}
                <div
                    className={`lg:hidden fixed top-0 left-0 h-full w-64 md:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="flex flex-col h-full">
                        {/* Mobile Menu Header */}
                        <div className="bg-linear-to-r from-[#0066CC] to-blue-600 text-white p-4 flex justify-between items-center">
                            <span className="font-bold text-lg">Menu</span>
                            <button
                                onClick={closeMobileMenu}
                                className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110"
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile Menu Links */}
                        <nav className="flex-1 overflow-y-auto py-4">
                            {navItems.map((item, index) => (
                                <div key={index}>
                                    {item.dropdown ? (
                                        <div className="border-b border-gray-100 last:border-b-0">
                                            <button
                                                type="button"
                                                onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}
                                                className={`flex items-center justify-between w-full px-6 py-3 text-gray-800 hover:bg-blue-50 transition-all duration-200 ${location.pathname.startsWith(item.path) ? 'bg-blue-50 text-[#0066CC] font-semibold border-l-4 border-[#0066CC]' : ''}`}
                                            >
                                                <span>{item.label}</span>
                                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${mobileCoursesOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {mobileCoursesOpen && (
                                                <div className="pl-8 pr-4 pb-2">
                                                    {item.dropdown.map((subItem) => (
                                                        <Link
                                                            key={subItem.path}
                                                            to={subItem.path}
                                                            className={`block py-2 px-4 text-sm text-gray-600 hover:text-[#0066CC] hover:bg-blue-50 rounded transition-colors duration-200 ${location.pathname === subItem.path ? 'text-[#0066CC] font-medium bg-blue-50' : ''}`}
                                                            onClick={closeMobileMenu}
                                                        >
                                                            • {subItem.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className={`block px-6 py-3 text-gray-800 hover:bg-blue-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 ${location.pathname === item.path ? 'bg-blue-50 text-[#0066CC] font-semibold border-l-4 border-[#0066CC]' : ''}`}
                                            onClick={closeMobileMenu}
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </div>
                            ))}

                            <div className="border-t border-gray-200 mt-4 pt-4 px-4">
                                {isAuthenticated ? (
                                    <div className="space-y-2">
                                        <Link
                                            to={`/dashboard/${user?.role.toLowerCase()}`}
                                            className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                            onClick={closeMobileMenu}
                                        >
                                            <User className="w-4 h-4 mr-3 text-[#76C043]" />
                                            {user?.first_name} {user?.last_name}
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout()
                                                closeMobileMenu()
                                            }}
                                            className="flex items-center w-full px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 text-[#76C043]" />
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Link
                                            to="/login"
                                            className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                            onClick={closeMobileMenu}
                                        >
                                            <User className="w-4 h-4 mr-3 text-[#76C043]" />
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                            onClick={closeMobileMenu}
                                        >
                                            <UserPlus className="w-4 h-4 mr-3 text-[#76C043]" />
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </nav>
                        {/* Mobile Menu Footer */}
                        <div className="border-t border-gray-200 p-4 bg-linear-to-b from-gray-50 to-white">
                            <div className="text-sm text-gray-600 space-y-3">
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 text-[#76C043] mr-2 shrink-0" />
                                    <span className="font-medium">+88 09638-016499</span>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 text-[#76C043] mr-2 shrink-0" />
                                    <span className="font-medium">info@gpis.org.bd</span>
                                </div>
                                <div className="pt-2 text-xs text-gray-500">
                                    <p>© {new Date().getFullYear()} GPISBD. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar