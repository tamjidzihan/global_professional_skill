import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    FileText,
    BarChart,
    GraduationCap,
    LogOut,
    X,
} from 'lucide-react'
import { useAuthContext } from '../../../context/AuthContext'
interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}
export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
    const { user, logout } = useAuthContext()
    const location = useLocation()
    const isActive = (path: string) => location.pathname === path
    const studentLinks = [
        {
            name: 'Dashboard',
            path: '/dashboard/student',
            icon: LayoutDashboard,
        },
        {
            name: 'My Enrollments',
            path: '/dashboard/student/enrollments',
            icon: BookOpen,
        },
        {
            name: 'Browse Courses',
            path: '/courses',
            icon: GraduationCap,
        },
        {
            name: 'Certificates',
            path: '/dashboard/student/certificates',
            icon: FileText,
        },
    ]
    const instructorLinks = [
        {
            name: 'Dashboard',
            path: '/dashboard/instructor',
            icon: LayoutDashboard,
        },
        {
            name: 'My Courses',
            path: '/dashboard/instructor/courses',
            icon: BookOpen,
        },
        {
            name: 'Analytics',
            path: '/dashboard/instructor/analytics',
            icon: BarChart,
        },
        {
            name: 'Reviews',
            path: '/dashboard/instructor/reviews',
            icon: Users,
        },
    ]
    const adminLinks = [
        {
            name: 'Dashboard',
            path: '/dashboard/admin',
            icon: LayoutDashboard,
        },
        {
            name: 'Users',
            path: '/dashboard/admin/users',
            icon: Users,
        },
        {
            name: 'Courses',
            path: '/dashboard/admin/courses',
            icon: BookOpen,
        },
        {
            name: 'Analytics',
            path: '/dashboard/admin/analytics',
            icon: BarChart,
        },
    ]
    const links =
        user?.role === 'ADMIN'
            ? adminLinks
            : user?.role === 'INSTRUCTOR'
                ? instructorLinks
                : studentLinks
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                        <Link to="/" className="text-2xl font-bold text-[#0066CC]">
                            BITM
                        </Link>
                        <button onClick={onClose} className="lg:hidden text-gray-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-[#0066CC] text-white flex items-center justify-center font-bold">
                                {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-bold text-[#0066CC] bg-blue-100 rounded-full">
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon
                            const active = isActive(link.path)
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={onClose}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-blue-50 text-[#0066CC]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Icon
                                        className={`w-5 h-5 mr-3 ${active ? 'text-[#0066CC]' : 'text-gray-400'}`}
                                    />
                                    {link.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100">
                        <Link
                            to="/settings"
                            className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            <Settings className="w-5 h-5 mr-3 text-gray-400" />
                            Settings
                        </Link>
                        <button
                            onClick={logout}
                            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}