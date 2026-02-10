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
        <nav className="flex bg-gray-50 border-b border-blue-200 py-3 px-5 rounded-lg mb-4" aria-label="Breadcrumb">
            <div className="container mx-auto px-4" >
                <ol className="inline-flex max-w-4xl items-center space-x-1 md:space-x-3">
                    {breadcrumbItems.map((item, index) => {
                        const isLast = index === breadcrumbItems.length - 1
                        const ItemIcon = item.icon
                        return (
                            <li key={item.path} className="inline-flex items-center" aria-current={isLast ? 'page' : undefined}>
                                {index > 0 && (
                                    <div className="flex items-center">
                                        <ChevronRight className="w-5 h-5 text-blue-400" />
                                    </div>
                                )}
                                <div className={`flex items-center ${index > 0 ? 'ml-1 md:ml-2' : ''}`}>
                                    {index === 0 && !isLast ? (
                                        <Link to={item.path} className="text-[#0066CC] hover:text-[#004c99] text-md font-medium inline-flex items-center">
                                            <ItemIcon className="w-5 h-5 mr-2.5" />
                                            {item.name}
                                        </Link>
                                    ) : isLast ? (
                                        <>
                                            <span className="text-blue-700 ml-1 md:ml-2 text-sm font-medium inline-flex items-center">
                                                <ItemIcon className="w-4 h-4 mr-1.5" />
                                                {item.name}
                                            </span>
                                            {subtitle && (
                                                <span className="text-blue-500 text-sm ml-2">| {subtitle}</span>
                                            )}
                                        </>
                                    ) : (
                                        <Link to={item.path} className="text-[#0066CC] hover:text-[#004c99] ml-1 md:ml-2 text-md font-medium inline-flex items-center">
                                            <ItemIcon className="w-4 h-4 mr-1.5" />
                                            {item.name}
                                        </Link>
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