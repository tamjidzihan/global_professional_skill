import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    BookOpen,
    Users,
    FileText,
    BarChart,
    GraduationCap,
    LogOut,
    ChevronRight,
    Sparkles,
    ChevronLeft,
} from 'lucide-react'
import { useAuthContext } from '../../../context/AuthContext'
import { useMyProfile } from '../../../hooks/useMyProfile'
import { cn } from '../../../lib/utils'
import { useState } from 'react'
import ProfileSkeleton from '../loadingSkeleton/ProfileSkeleton'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

// Enhanced gradient avatars with more vibrant colors
const getAvatarGradient = (role?: string, firstName?: string) => {
    const gradients = {
        ADMIN: 'from-violet-600 via-purple-600 to-fuchsia-600',
        INSTRUCTOR: 'from-blue-600 via-cyan-500 to-teal-500',
        STUDENT: 'from-emerald-500 via-green-500 to-lime-500',
        default: 'from-indigo-600 via-purple-600 to-pink-600'
    }

    if (firstName) {
        const firstLetter = firstName.charAt(0).toUpperCase()
        const letterCode = firstLetter.charCodeAt(0)
        const colors = [
            'from-rose-600 via-pink-600 to-fuchsia-600',
            'from-orange-600 via-amber-500 to-yellow-500',
            'from-yellow-500 via-lime-500 to-green-500',
            'from-emerald-600 via-teal-600 to-cyan-600',
            'from-cyan-600 via-blue-600 to-indigo-600',
            'from-indigo-600 via-violet-600 to-purple-600',
            'from-purple-600 via-fuchsia-600 to-pink-600'
        ]
        return colors[letterCode % colors.length]
    }

    return gradients[role as keyof typeof gradients] || gradients.default
}

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
    const { logout } = useAuthContext()
    const { profile, isLoading } = useMyProfile()
    const location = useLocation()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const isActive = (path: string, exact?: boolean) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    }

    const initials =
        (profile?.first_name?.[0] || '') +
        (profile?.last_name?.[0] || '') ||
        profile?.email?.[0]?.toUpperCase() ||
        '?'

    const studentLinks = [
        {
            name: 'Dashboard',
            path: '/dashboard/student',
            icon: LayoutDashboard,
            gradient: 'from-blue-500 to-cyan-500',
            exact: true
        },
        {
            name: 'My Enrollments',
            path: '/dashboard/student/enrollments',
            icon: BookOpen,
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            name: 'Browse Courses',
            path: '/courses',
            icon: GraduationCap,
            gradient: 'from-emerald-500 to-teal-500',
            external: true
        },
        {
            name: 'Certificates',
            path: '/dashboard/student/certificates',
            icon: FileText,
            gradient: 'from-orange-500 to-amber-500',
            badge: 'New'
        },
    ]

    const instructorLinks = [
        {
            name: 'Dashboard',
            path: '/dashboard/instructor',
            icon: LayoutDashboard,
            gradient: 'from-blue-500 to-cyan-500',
            exact: true
        },
        {
            name: 'My Courses',
            path: '/dashboard/instructor/my-courses',
            icon: BookOpen,
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            name: 'Analytics',
            // path: '/dashboard/instructor/analytics',
            path: '#',
            icon: BarChart,
            gradient: 'from-emerald-500 to-teal-500',
            badge: '📈'
        },
        {
            name: 'Reviews',
            // path: '/dashboard/instructor/reviews',
            path: '#',
            icon: Users,
            gradient: 'from-orange-500 to-amber-500',
        },
    ]

    const adminLinks = [
        {
            name: 'Dashboard',
            path: '/dashboard/admin',
            icon: LayoutDashboard,
            gradient: 'from-blue-500 to-cyan-500',
            badge: <Sparkles className="w-3 h-3" />,
            exact: true
        },
        {
            name: 'User Management',
            path: '/dashboard/admin/users',
            icon: Users,
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            name: 'Course Catalog',
            path: '/dashboard/admin/courses',
            icon: BookOpen,
            gradient: 'from-emerald-500 to-teal-500',
        },
        {
            name: 'Course Reviews',
            path: '/dashboard/admin/course-reviews',
            icon: FileText,
            gradient: 'from-red-500 to-rose-500',
        },
        {
            name: 'Platform Analytics',
            path: '/dashboard/admin/analytics',
            icon: BarChart,
            gradient: 'from-orange-500 to-amber-500',
        },

    ]

    const links =
        profile?.role === 'ADMIN'
            ? adminLinks
            : profile?.role === 'INSTRUCTOR'
                ? instructorLinks
                : studentLinks

    return (
        <div className="h-full min-h-screen bg-gray-50 flex">
            {/* Enhanced Mobile Overlay with stronger blur */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-linear-to-br from-black/50 via-black/40 to-black/50 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            {/* Modern Glass Morphism Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full bg-white/80 backdrop-blur-2xl border-r border-white/20 z-50 transform transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:h-screen",
                    isOpen
                        ? "translate-x-0 shadow-2xl shadow-black/10"
                        : "-translate-x-full lg:translate-x-0",
                    isCollapsed ? "w-20" : "w-80",
                    "before:absolute before:inset-0 before:bg-linear-to-br before:from-blue-50/50 before:via-purple-50/30 before:to-pink-50/50 before:-z-10"
                )}
            >
                <div className="flex flex-col h-full relative z-10">
                    {/* Collapse Toggle Button - Desktop Only */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn(
                            "hidden cursor-pointer lg:flex absolute -right-3 top-8 w-6 h-6 items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 hover:scale-110",
                            "bg-linear-to-br from-blue-500 to-purple-600 text-white"
                        )}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronLeft className="w-3.5 h-3.5" />
                        )}
                    </button>

                    {/* User Info with Glass Effect */}
                    <div className={cn(
                        "p-6 border-b border-white/20",
                        "bg-linear-to-br from-white/40 to-white/20 backdrop-blur-xl",
                        isCollapsed && "p-3"
                    )}>
                        <Link
                            to={'/dashboard/my-profile'}
                            className={cn(
                                "flex items-center gap-4 rounded-2xl p-3 transition-all duration-300",
                                "bg-white/60 backdrop-blur-xl border border-white/40",
                                "hover:bg-white/80 hover:shadow-lg hover:scale-[1.02]",
                                "shadow-lg shadow-blue-500/10",
                                isCollapsed && "flex-col gap-2 p-2"
                            )}
                        >
                            {isLoading ? (
                                <ProfileSkeleton isCollapsed={isCollapsed} />
                            ) : (
                                <>
                                    {/* Enhanced Avatar with Glow */}
                                    <div className="relative group">
                                        {profile?.profile_picture ? (
                                            <img
                                                src={profile?.profile_picture || ''}
                                                alt={profile?.first_name || profile?.email || "Profile Picture"}
                                                className={cn(
                                                    "rounded-2xl object-cover shadow-xl ring-2 ring-white/50",
                                                    isCollapsed ? "w-12 h-12" : "w-16 h-16"
                                                )}
                                            />
                                        ) : (
                                            <div
                                                className={cn(
                                                    "rounded-2xl flex items-center justify-center font-bold text-white shadow-xl",
                                                    "bg-linear-to-br ring-2 ring-white/50",
                                                    getAvatarGradient(profile?.role, profile?.first_name),
                                                    "relative overflow-hidden",
                                                    isCollapsed ? "w-12 h-12" : "w-16 h-16"
                                                )}
                                            >
                                                {/* Animated shine effect */}
                                                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                                <span className={cn("text-xl relative z-10", isCollapsed && "text-lg")}>
                                                    {initials}
                                                </span>
                                            </div>
                                        )}
                                        {/* Enhanced Online Status with Pulse */}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-linear-to-br from-green-400 to-emerald-500 border-3 border-white rounded-full shadow-lg">
                                            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                                        </div>
                                    </div>

                                    {!isCollapsed && (
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-bold truncate bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                                {profile?.first_name} {profile?.last_name}
                                            </p>
                                            <p className="text-xs text-gray-600 truncate mt-0.5">
                                                {profile?.email}
                                            </p>
                                            {/* Enhanced Role Badge with Gradient */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={cn(
                                                    "inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-md",
                                                    "bg-linear-to-r backdrop-blur-xl border border-white/40",
                                                    profile?.role === 'ADMIN' && "from-violet-500 to-fuchsia-500 text-white",
                                                    profile?.role === 'INSTRUCTOR' && "from-blue-500 to-cyan-500 text-white",
                                                    profile?.role === 'STUDENT' && "from-emerald-500 to-teal-500 text-white"
                                                )}>
                                                    {profile?.role?.toLowerCase()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </Link>
                    </div>

                    {/* Navigation with Modern Glass Cards */}
                    <nav className={cn("flex-1 overflow-y-auto p-4 space-y-2", isCollapsed && "p-2")}>
                        {links.map((link) => {
                            const Icon = link.icon
                            const active = isActive(link.path, link.exact)
                            const isExternal = 'external' in link

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={onClose}
                                    target={isExternal ? "_blank" : undefined}
                                    rel={isExternal ? "noopener noreferrer" : undefined}
                                    className={cn(
                                        "group relative flex items-center justify-between px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300",
                                        " active:scale-[0.98]",
                                        active
                                            ? "bg-linear-to-r text-white shadow-lg"
                                            : "text-gray-700 hover:bg-white/60 backdrop-blur-xl",
                                        active && link.gradient,
                                        isCollapsed && "justify-center px-2"
                                    )}
                                >
                                    {/* Animated background glow for active state */}
                                    {active && (
                                        <div className={cn(
                                            "absolute inset-0 bg-linear-to-r rounded-xl opacity-50 blur-xl -z-10",
                                            link.gradient
                                        )}></div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2.5 rounded-lg transition-all duration-300 relative overflow-hidden group-hover:scale-110",
                                            active
                                                ? "bg-white/20 text-white shadow-lg"
                                                : "bg-gray-100 text-gray-500 group-hover:bg-linear-to-br group-hover:from-white/80 group-hover:to-white/60"
                                        )}>
                                            {/* Icon glow effect on hover */}
                                            <div className={cn(
                                                "absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                                link.gradient
                                            )}></div>
                                            <Icon className="w-5 h-5 relative z-10" />
                                        </div>
                                        {!isCollapsed && (
                                            <span className="relative">
                                                {link.name}
                                                {/* Underline animation on hover */}
                                                <span className={cn(
                                                    "absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 rounded-full",
                                                    active ? "bg-white" : "bg-linear-to-r " + link.gradient,
                                                    "group-hover:w-full"
                                                )}></span>
                                            </span>
                                        )}
                                    </div>

                                    {!isCollapsed && (
                                        <div className="flex items-center gap-2">
                                            {link.badge && (
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full shadow-md",
                                                    "bg-linear-to-r from-yellow-400 to-orange-500 text-white",
                                                    "animate-pulse"
                                                )}>
                                                    {link.badge}
                                                </span>
                                            )}
                                            <ChevronRight className={cn(
                                                "w-4 h-4 transition-all duration-300",
                                                active
                                                    ? "text-white translate-x-1"
                                                    : "text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1",
                                                isExternal && "rotate-45"
                                            )} />
                                        </div>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl z-50">
                                            {link.name}
                                            {link.badge && (
                                                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-400 text-gray-900 rounded-full">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer with Glass Effect */}
                    <div className={cn(
                        "p-4 border-t border-white/20",
                        "bg-linear-to-br from-white/40 to-white/20 backdrop-blur-xl",
                        isCollapsed && "p-2"
                    )}>
                        <button
                            onClick={logout}
                            className={cn(
                                "group w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300",
                                "text-red-600 hover:bg-linear-to-r hover:from-red-500 hover:to-rose-500 hover:text-white",
                                "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                                "bg-white/60 backdrop-blur-xl border border-red-200/40",
                                isCollapsed && "justify-center px-2"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-red-100 text-red-500 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                {!isCollapsed && <span>Logout</span>}
                            </div>
                            {!isCollapsed && (
                                <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl z-50">
                                    Logout
                                </div>
                            )}
                        </button>

                        {/* Enhanced Version/Status Footer */}
                        {!isCollapsed && (
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-gray-500">
                                        v2.1.4 • Dashboard
                                    </span>
                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                                        <div className="relative w-2 h-2">
                                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                                            <div className="relative w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                        <span className="font-semibold text-green-600">
                                            System OK
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    )
}