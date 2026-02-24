import { ChevronRight, Home, BookOpen, Folder, Layers } from 'lucide-react'
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

const Breadcrumb = ({ name, subtitle, icon: Icon }: BreadcrumbProps) => {
    const location = useLocation()

    const getDefaultIcon = (): React.ElementType => {
        const path = location.pathname.toLowerCase()
        if (path.includes('course')) return BookOpen
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
        <nav
            className="w-full bg-gray-50 border-y border-blue-100 md:border md:rounded-lg py-2 md:py-3 px-3 md:px-5"
            aria-label="Breadcrumb"
        >
            <div className="container mx-auto">
                {/* overflow-x-auto allows scrolling if the path is extremely long on mobile */}
                <ol className="flex items-center whitespace-nowrap overflow-x-auto no-scrollbar py-1">
                    {breadcrumbItems.map((item, index) => {
                        const isLast = index === breadcrumbItems.length - 1
                        const isFirst = index === 0
                        const ItemIcon = item.icon

                        return (
                            <li key={item.path} className="flex items-center shrink-0" aria-current={isLast ? 'page' : undefined}>
                                {index > 0 && (
                                    <ChevronRight className="w-4 h-4 mx-1 md:mx-2 text-blue-300 shrink-0" />
                                )}

                                <div className="flex items-center">
                                    {!isLast ? (
                                        <Link
                                            to={item.path}
                                            className="flex items-center text-[#0066CC] hover:text-[#004c99] transition-colors"
                                        >
                                            <ItemIcon className="w-4 h-4 md:w-5 md:h-5" />
                                            {/* Hide text on mobile for middle items, show on Home and Last */}
                                            <span className={`${isFirst ? 'ml-2' : 'hidden md:block md:ml-2'} text-sm md:text-base font-medium`}>
                                                {item.name}
                                            </span>
                                        </Link>
                                    ) : (
                                        <div className="flex items-center text-gray-600 min-w-0">
                                            <ItemIcon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                                            <div className="ml-2 flex flex-col md:flex-row md:items-center truncate">
                                                <span className="text-sm md:text-base font-semibold truncate max-w-30 md:max-w-full">
                                                    {item.name}
                                                </span>
                                                {subtitle && (
                                                    <span className="hidden sm:inline-block text-gray-400 text-sm ml-2">
                                                        <span className="hidden md:inline mr-2">|</span>
                                                        {subtitle}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ol>
            </div>
        </nav>
    )
}

export default Breadcrumb