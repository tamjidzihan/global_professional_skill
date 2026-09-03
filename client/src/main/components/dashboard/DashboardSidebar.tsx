import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    BookOpen,
    Users,
    User,
    FileText,
    GraduationCap,
    LogOut,
    ChevronRight,
    ChevronDown,
    CreditCard,
    Settings,
    TrendingUp,
    Briefcase,
    Bell,
    Megaphone,
    Tag,
    Video,
    Images,
} from 'lucide-react'
import { useAuthContext } from '../../../context/AuthContext'
import { useMyProfile } from '../../../hooks/useMyProfile'
import { cn } from '../../../lib/utils'
import { useState } from 'react'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

const getAvatarGradient = (role?: string, firstName?: string) => {
    const gradients = {
        ADMIN: 'from-violet-600 to-fuchsia-600',
        INSTRUCTOR: 'from-blue-600 to-cyan-500',
        STUDENT: 'from-emerald-500 to-teal-500',
        default: 'from-indigo-600 to-purple-600',
    }
    if (firstName) {
        const letterCode = firstName.charAt(0).toUpperCase().charCodeAt(0)
        const colors = [
            'from-rose-500 to-pink-600',
            'from-orange-500 to-amber-600',
            'from-yellow-500 to-lime-600',
            'from-emerald-500 to-teal-600',
            'from-cyan-500 to-blue-600',
            'from-indigo-500 to-violet-600',
            'from-purple-500 to-fuchsia-600',
        ]
        return colors[letterCode % colors.length]
    }
    return gradients[role as keyof typeof gradients] || gradients.default
}

// ── Types ────────────────────────────────────────────────────────────────────
interface NavLink {
    name: string
    path: string
    icon: React.ElementType
    badge?: string
    exact?: boolean
    external?: boolean
}

interface NavGroup {
    key: string
    name: string
    icon: React.ElementType
    children: NavLink[]
}

type NavItem = NavLink | NavGroup

function isGroup(item: NavItem): item is NavGroup {
    return 'children' in item
}

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
    const { logout } = useAuthContext()
    const { profile, isLoading } = useMyProfile()
    const location = useLocation()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [openGroups, setOpenGroups] = useState<string[]>(['courses', 'users', 'settings'])

    const isActive = (path: string, exact?: boolean) => {
        if (exact) return location.pathname === path
        return location.pathname.startsWith(path)
    }

    const toggleGroup = (key: string) => {
        setOpenGroups(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        )
    }

    const initials =
        (profile?.first_name?.[0] || '') +
        (profile?.last_name?.[0] || '') ||
        profile?.email?.[0]?.toUpperCase() ||
        '?'

    const studentLinks: NavItem[] = [
        { name: 'Dashboard', path: '/dashboard/student', icon: LayoutDashboard, exact: true },
        { name: 'My Enrollments', path: '/dashboard/student/my-courses', icon: BookOpen },
        { name: 'Certificates', path: '/dashboard/student/certificates', icon: FileText, badge: 'New' },
        { name: 'Announcements', path: '/dashboard/announcements', icon: Bell },
    ]

    const instructorLinks: NavItem[] = [
        { name: 'Dashboard', path: '/dashboard/instructor', icon: LayoutDashboard, exact: true },
        { name: 'My Courses', path: '/dashboard/instructor/my-courses', icon: BookOpen },
        { name: 'Course Progress', path: '/dashboard/instructor/course-progress', icon: TrendingUp },
        { name: 'Reports', path: '/dashboard/instructor/reports', icon: FileText, badge: 'New' },
        { name: 'Announcements', path: '/dashboard/announcements', icon: Bell },
    ]

    const adminLinks: NavItem[] = [
        { name: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard, exact: true },

        // ── Users group ──
        {
            key: 'users',
            name: 'Users',
            icon: Users,
            children: [
                { name: 'User Management', path: '/dashboard/admin/users', icon: Users },
                { name: 'Career Management', path: '/dashboard/admin/careers', icon: Briefcase },
                { name: 'Announcements', path: '/dashboard/admin/announcements', icon: Bell },
                { name: 'News Ticker', path: '/dashboard/admin/news-ticker', icon: Megaphone },
            ],
        },
        {
            key: 'courses',
            name: 'Courses',
            icon: BookOpen,
            children: [
                { name: 'Course Catalog', path: '/dashboard/admin/courses', icon: BookOpen },
                { name: 'Category Management', path: '/dashboard/admin/categories', icon: Tag },
                { name: 'Course Announcements', path: '/dashboard/admin/course-announcements', icon: Bell },
            ],
        },

        { name: 'Payment Management', path: '/dashboard/admin/payments', icon: CreditCard, badge: 'Review' },
        { name: 'Promo Codes', path: '/dashboard/admin/promo-codes', icon: Tag, badge: 'New' },

        // ── Platform Settings group ──
        {
            key: 'settings',
            name: 'Platform Settings',
            icon: Settings,
            children: [
                { name: 'Overview', path: '/dashboard/admin/settings', icon: Settings, exact: true },
                { name: 'Homepage Video', path: '/dashboard/admin/settings/video', icon: Video },
                { name: 'Photo Album', path: '/dashboard/admin/settings/album', icon: Images },
                { name: 'Payment Details', path: '/dashboard/admin/settings/payment', icon: CreditCard },
                { name: 'Quiz & Notifications', path: '/dashboard/admin/settings/notifications', icon: Bell },
            ],
        },
    ]

    const links: NavItem[] = profile?.role === 'ADMIN'
        ? adminLinks
        : profile?.role === 'INSTRUCTOR'
            ? instructorLinks
            : studentLinks

    const myLinks: NavLink[] = [
        { name: 'My Profile', path: '/dashboard/my-profile', icon: User },
    ]

    const CollapsedTooltip = ({ label, badge }: { label: string; badge?: string | number }) => (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none z-50
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap">
                {label}
                {badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 rounded-sm leading-none">{badge}</span>
                )}
            </div>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
    )

    // ── Render a single flat link ─────────────────────────────────────────────
    const renderLink = (link: NavLink) => {
        const Icon = link.icon
        const active = isActive(link.path, link.exact)
        return (
            <div key={link.path} className="relative group">
                <Link
                    to={link.path}
                    onClick={onClose}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className={cn(
                        'flex items-center rounded-lg text-sm transition-all duration-150',
                        isCollapsed ? 'w-10 h-10 justify-center' : 'gap-3 px-3 py-2.25 justify-between',
                        active ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Icon className={cn('w-4.5 h-4.5 shrink-0', active ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600')} />
                        {!isCollapsed && (
                            <span className={cn('font-medium leading-none', active && 'font-semibold text-violet-700')}>
                                {link.name}
                            </span>
                        )}
                    </div>
                    {!isCollapsed && link.badge && (
                        <span className={cn(
                            'inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-md shrink-0 leading-none',
                            link.badge === 'New' ? 'bg-violet-600 text-white' : 'bg-amber-500 text-white'
                        )}>
                            {link.badge}
                        </span>
                    )}
                </Link>
                {isCollapsed && <CollapsedTooltip label={link.name} badge={link.badge} />}
            </div>
        )
    }

    // ── Render a group dropdown ───────────────────────────────────────────────
    const renderGroup = (group: NavGroup) => {
        const GroupIcon = group.icon
        const isOpen_ = openGroups.includes(group.key)
        const isAnyChildActive = group.children.some(c => isActive(c.path))

        return (
            <div key={group.key}>
                {/* Group header */}
                <div className="relative group">
                    <button
                        onClick={() => !isCollapsed && toggleGroup(group.key)}
                        className={cn(
                            'w-full flex items-center rounded-lg text-sm transition-all duration-150 cursor-pointer',
                            isCollapsed ? 'w-10 h-10 justify-center' : 'gap-3 px-3 py-2.25',
                            isAnyChildActive ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <GroupIcon className={cn(
                                'w-4.5 h-4.5 shrink-0 transition-colors',
                                isAnyChildActive ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600'
                            )} />
                            {!isCollapsed && (
                                <span className={cn('font-medium leading-none', isAnyChildActive && 'font-semibold text-violet-700')}>
                                    {group.name}
                                </span>
                            )}
                        </div>
                        {!isCollapsed && (
                            <ChevronDown className={cn(
                                'w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform duration-200',
                                isOpen_ && 'rotate-180 text-violet-500'
                            )} />
                        )}
                    </button>
                    {isCollapsed && <CollapsedTooltip label={group.name} />}
                </div>

                {/* Children */}
                {!isCollapsed && isOpen_ && (
                    <div className="mt-0.5 ml-3 pl-3.5 border-l-2 border-gray-100 space-y-0.5">
                        {group.children.map(child => {
                            const ChildIcon = child.icon
                            const childActive = isActive(child.path)
                            return (
                                <Link
                                    key={child.path}
                                    to={child.path}
                                    onClick={onClose}
                                    className={cn(
                                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                                        childActive
                                            ? 'bg-violet-50 text-violet-700 font-semibold'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                    )}
                                >
                                    <ChildIcon className={cn('w-3.5 h-3.5 shrink-0', childActive ? 'text-violet-500' : 'text-gray-400')} />
                                    <span className="text-xs font-medium">{child.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden" onClick={onClose} />
            )}

            <aside className={cn(
                'fixed top-0 left-0 z-20 flex flex-col',
                'transform transition-all duration-300 ease-in-out',
                'bg-white border-r border-gray-100',
                'lg:static lg:translate-x-0',
                isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0',
                isCollapsed ? 'w-17' : 'w-[256px]'
            )}>

                {/* ── Header ── */}
                <div className={cn(
                    'relative flex items-center h-15 border-b border-gray-100 shrink-0',
                    isCollapsed ? 'justify-center' : 'px-5 justify-between'
                )}>
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shrink-0">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        {!isCollapsed && (
                            <span className="text-[15px] font-semibold text-gray-900 tracking-tight truncate leading-none">
                                {profile?.role === 'ADMIN' ? 'AdminPortal'
                                    : profile?.role === 'INSTRUCTOR' ? 'Instruct Hub'
                                        : profile?.role === 'STUDENT' ? 'EduPortal'
                                            : 'Loading...'}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn(
                            'absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:flex',
                            'w-6 h-6 items-center justify-center',
                            'rounded-full bg-white border border-gray-200 shadow-sm text-gray-400',
                            'hover:border-violet-400 hover:text-violet-600 transition-all duration-200 cursor-pointer z-50'
                        )}
                    >
                        <ChevronRight className={cn('w-3.5 h-3.5 transition-transform duration-300', !isCollapsed && 'rotate-180')} />
                    </button>
                </div>

                {/* ── Nav ── */}
                <nav className={cn('flex-1 overflow-y-auto py-3 space-y-4', isCollapsed ? 'px-3.5' : 'px-3')}>

                    {/* Role section */}
                    <div>
                        {!isCollapsed ? (
                            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none">
                                {profile?.role === 'ADMIN' ? 'Admin' : profile?.role === 'INSTRUCTOR' ? 'Instructor' : 'General'}
                            </p>
                        ) : (
                            <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-gray-300 text-center select-none">
                                {profile?.role === 'ADMIN' ? 'ADM' : profile?.role === 'INSTRUCTOR' ? 'INS' : 'GEN'}
                            </p>
                        )}

                        <div className="space-y-0.5">
                            {links.map(item =>
                                isGroup(item) ? renderGroup(item) : renderLink(item)
                            )}
                        </div>
                    </div>

                    {/* My section */}
                    <div>
                        {!isCollapsed ? (
                            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none">My</p>
                        ) : (
                            <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-gray-300 text-center select-none">MY</p>
                        )}

                        <div className="space-y-0.5">
                            {myLinks.map(renderLink)}

                            {/* Logout */}
                            <div className="relative group">
                                <button
                                    onClick={logout}
                                    className={cn(
                                        'w-full flex items-center gap-3 rounded-lg text-sm transition-all duration-150 cursor-pointer',
                                        isCollapsed ? 'w-10 h-10 justify-center' : 'px-3 py-2.25',
                                        'text-gray-600 hover:bg-red-50 hover:text-red-600'
                                    )}
                                >
                                    <LogOut className="w-4.5 h-4.5 shrink-0 text-gray-400 group-hover:text-red-500" />
                                    {!isCollapsed && <span className="font-medium">Logout</span>}
                                </button>
                                {isCollapsed && (
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none z-50
                                                    opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                                        <div className="px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap">
                                            Logout
                                        </div>
                                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ── Footer: Profile ── */}
                <div className={cn('border-t border-gray-100 shrink-0', isCollapsed ? 'px-3.5 py-3' : 'px-4 py-3')}>
                    <Link
                        to="/dashboard/my-profile"
                        className={cn(
                            'flex items-center rounded-xl hover:bg-gray-50 transition-colors group',
                            isCollapsed ? 'justify-center p-1' : 'gap-3 px-2 py-2'
                        )}
                    >
                        <div className="relative shrink-0">
                            {isLoading ? (
                                <div className={cn('rounded-full bg-gray-200 animate-pulse', isCollapsed ? 'w-9 h-9' : 'w-8 h-8')} />
                            ) : profile?.profile_picture ? (
                                <img
                                    src={profile.profile_picture}
                                    alt={profile.first_name || 'Profile'}
                                    className={cn('rounded-full object-cover ring-2 ring-white shadow-sm', isCollapsed ? 'w-9 h-9' : 'w-8 h-8')}
                                />
                            ) : (
                                <div className={cn(
                                    'rounded-full flex items-center justify-center font-bold text-white bg-linear-to-br',
                                    isCollapsed ? 'w-9 h-9 text-sm' : 'w-8 h-8 text-xs',
                                    getAvatarGradient(profile?.role, profile?.first_name)
                                )}>
                                    {initials}
                                </div>
                            )}
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                        </div>

                        {!isCollapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                                        {profile?.first_name} {profile?.last_name}
                                    </p>
                                    <p className="text-[11px] text-gray-400 truncate leading-tight capitalize">
                                        {profile?.role?.toLowerCase()}
                                    </p>
                                </div>
                                <div className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 group-hover:border-violet-400 transition-colors shrink-0">
                                    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-violet-500 transition-colors" />
                                </div>
                            </>
                        )}
                    </Link>
                </div>
            </aside>
        </>
    )
}