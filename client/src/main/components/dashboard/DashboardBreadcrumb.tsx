import { ChevronRight, Home, BookOpen, Folder, Layers, GraduationCap } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface BreadcrumbProps {
    name: string
    subtitle?: string
    icon?: React.ElementType
}

interface BreadcrumbItem {
    name: string
    path: string
    icon: React.ElementType
    current?: boolean
}

const DashboardBreadcrumb = ({ name, subtitle, icon: Icon }: BreadcrumbProps) => {
    const location = useLocation()

    const getDefaultIcon = (): React.ElementType => {
        const path = location.pathname.toLowerCase()
        if (path.includes('course')) return BookOpen
        if (path.includes('dashboard')) return GraduationCap
        if (path.includes('about')) return Folder
        if (path.includes('blog')) return Layers
        return Folder
    }

    const DefaultIcon = getDefaultIcon()
    const BreadcrumbIcon = Icon || DefaultIcon

    const getBreadcrumbItems = (): BreadcrumbItem[] => {
        const path = location.pathname
        const parts = path.split('/').filter(Boolean)

        const items: BreadcrumbItem[] = [{ name: 'Home', path: '/', icon: Home }]

        let currentPath = ''
        for (let i = 0; i < parts.length; i++) {
            currentPath += '/' + parts[i]
            const isLast = i === parts.length - 1

            let formattedName = parts[i]
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')

            // Special case for dashboard
            if (parts[i].toLowerCase() === 'dashboard') {
                formattedName = 'Dashboard'
            }

            if (isLast) formattedName = name || formattedName

            items.push({
                name: formattedName,
                path: currentPath,
                icon: isLast ? BreadcrumbIcon : Folder,
                current: isLast
            })
        }

        return items
    }

    const breadcrumbItems = getBreadcrumbItems()

    return (
        <nav className="px-4 sm:px-6 lg:px-8" aria-label="Breadcrumb">
            <div className="max-w-7xl">
                <div className="flex items-center">
                    <ol className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
                        {breadcrumbItems.map((item, index) => {
                            const isLast = index === breadcrumbItems.length - 1
                            const ItemIcon = item.icon

                            return (
                                <li key={item.path} className="flex items-center">
                                    {index > 0 && (
                                        <ChevronRight className="shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mx-1 sm:mx-2" />
                                    )}

                                    <div className="flex items-center">
                                        {!isLast ? (
                                            <Link
                                                to={item.path}
                                                className="text-sm font-medium text-gray-500 hover:text-[#0066CC] transition-colors duration-200 flex items-center gap-1.5"
                                            >
                                                <ItemIcon className="h-4 w-4 shrink-0" />
                                                <span className="hidden sm:inline">{item.name}</span>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <div className="flex items-center text-sm font-semibold text-gray-900">
                                                    <ItemIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 text-[#0066CC]" />
                                                    <span className="truncate max-w-37.5 sm:max-w-xs">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                {subtitle && (
                                                    <>
                                                        <span className="text-gray-300 mx-2 hidden sm:inline">|</span>
                                                        <span className="text-xs sm:text-sm text-gray-500 font-normal hidden sm:inline">
                                                            {subtitle}
                                                        </span>
                                                        {/* Mobile subtitle */}
                                                        <span className="text-xs text-gray-500 font-normal sm:hidden block w-full mt-1">
                                                            {subtitle}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                </div>
            </div>
        </nav>
    )
}

export default DashboardBreadcrumb