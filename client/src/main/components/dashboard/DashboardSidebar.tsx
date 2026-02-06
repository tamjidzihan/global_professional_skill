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
    ChevronRight,
    Sparkles,
} from 'lucide-react'
import { useAuthContext } from '../../../context/AuthContext'
import { cn } from '../../../lib/utils'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

// Colorful gradient avatars based on user role
const getAvatarGradient = (role?: string, firstName?: string) => {
    const gradients = {
        ADMIN: 'from-purple-500 to-pink-500',
        INSTRUCTOR: 'from-blue-500 to-cyan-400',
        STUDENT: 'from-green-500 to-emerald-400',
        default: 'from-indigo-500 to-purple-500'
    }

    // Generate consistent color based on first letter of name
    if (firstName) {
        const firstLetter = firstName.charAt(0).toUpperCase()
        const letterCode = firstLetter.charCodeAt(0)
        const colors = [
            'from-rose-500 to-pink-500',
            'from-orange-500 to-amber-500',
            'from-yellow-500 to-lime-500',
            'from-emerald-500 to-teal-500',
            'from-cyan-500 to-blue-500',
            'from-indigo-500 to-violet-500',
            'from-purple-500 to-fuchsia-500'
        ]
        return colors[letterCode % colors.length]
    }

    return gradients[role as keyof typeof gradients] || gradients.default
}

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
    const { user, logout } = useAuthContext()
    const location = useLocation()

    const isActive = (path: string) => location.pathname.startsWith(path)

    const studentLinks = [
        {
            name: 'Dashboard',
            path: '/dashboard/student',
            icon: LayoutDashboard,
            badge: '✨'
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
            external: true
        },
        {
            name: 'Certificates',
            path: '/dashboard/student/certificates',
            icon: FileText,
            badge: 'New'
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
            badge: '📈'
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
            badge: <Sparkles className="w-3 h-3" />
        },
        {
            name: 'User Management',
            path: '/dashboard/admin/users',
            icon: Users,
        },
        {
            name: 'Course Catalog',
            path: '/dashboard/admin/courses',
            icon: BookOpen,
        },
        {
            name: 'Platform Analytics',
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
            {/* Modern Mobile Overlay with blur */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            {/* Modern Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full w-80 bg-linear-to-b from-white to-gray-50/50 border-r border-gray-100 z-50 transform transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:h-screen shadow-xl lg:shadow-none",
                    isOpen
                        ? "translate-x-0 shadow-2xl"
                        : "-translate-x-full",
                    "backdrop-blur-lg bg-white/95"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* User Info with Modern Design */}
                    <div className="p-6 border-b border-gray-100/50 bg-linear-to-r from-white to-gray-50/30">
                        <div className="flex items-center space-x-4">
                            {/* Colorful Avatar with Gradient */}
                            <div className="relative">
                                <div
                                    className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg",
                                        "bg-linear-to-br",
                                        getAvatarGradient(user?.role, user?.first_name)
                                    )}
                                >
                                    <span className="text-xl">
                                        {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                                    </span>
                                </div>
                                {/* Online Status Indicator */}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-semibold text-gray-900 truncate">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    {/* Role Badge with Modern Design */}
                                    <span className={cn(
                                        "inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full",
                                        user?.role === 'ADMIN' && "bg-linear-to-r from-purple-100 to-pink-100 text-purple-700",
                                        user?.role === 'INSTRUCTOR' && "bg-linear-to-r from-blue-100 to-cyan-100 text-blue-700",
                                        user?.role === 'STUDENT' && "bg-linear-to-r from-green-100 to-emerald-100 text-emerald-700"
                                    )}>
                                        {user?.role?.toLowerCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate mt-1">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-400">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation with Modern Design */}
                    <nav className="flex-1 overflow-y-auto p-5 space-y-1.5">
                        {links.map((link) => {
                            const Icon = link.icon
                            const active = isActive(link.path)
                            const isExternal = 'external' in link

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={onClose}
                                    target={isExternal ? "_blank" : undefined}
                                    rel={isExternal ? "noopener noreferrer" : undefined}
                                    className={cn(
                                        "group flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300",
                                        "hover:shadow-md hover:-translate-y-0.5",
                                        active
                                            ? "bg-linear-to-r from-blue-50 to-cyan-50/50 text-blue-600 border border-blue-100/50 shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
                                    )}
                                >
                                    <div className="flex items-center">
                                        <div className={cn(
                                            "p-2 rounded-lg mr-3 transition-colors",
                                            active
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                                        )}>
                                            <Icon className="w-4.5 h-4.5" />
                                        </div>
                                        {link.name}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {link.badge && (
                                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-linear-to-r from-blue-100 to-cyan-100 text-blue-600 rounded-full">
                                                {link.badge}
                                            </span>
                                        )}
                                        {isExternal ? (
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 rotate-45" />
                                        ) : (
                                            <ChevronRight className={cn(
                                                "w-4 h-4 transition-transform",
                                                active
                                                    ? "text-blue-400"
                                                    : "text-gray-300 group-hover:text-gray-400",
                                                active && "translate-x-0.5"
                                            )} />
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer with Modern Design */}
                    <div className="p-5 border-t border-gray-100/50 bg-white/50 backdrop-blur-sm">
                        <Link
                            to="/settings"
                            className="group flex items-center justify-between px-4 py-3.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-300"
                        >
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-3 bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600 transition-colors">
                                    <Settings className="w-4.5 h-4.5" />
                                </div>
                                Settings
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                        </Link>
                        <button
                            onClick={logout}
                            className="group w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-red-600 rounded-xl hover:bg-linear-to-r hover:from-red-50/80 hover:to-rose-50/80 transition-all duration-300 mt-1.5"
                        >
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-3 bg-red-100 text-red-400 group-hover:bg-red-200 group-hover:text-red-500 transition-colors">
                                    <LogOut className="w-4.5 h-4.5" />
                                </div>
                                Logout
                            </div>
                            <ChevronRight className="w-4 h-4 text-red-300 group-hover:text-red-400" />
                        </button>

                        {/* Version/Status Footer */}
                        <div className="mt-6 pt-5 border-t border-gray-100/50">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>v2.1.4 • Dashboard</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                    <span>System OK</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}