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
        <div className="relative overflow-hidden bg-[#FCF8F1]">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[20px_20px]" />
            </div>

            <div className="relative container mx-auto px-4 py-10">
                <div className="max-w-4xl">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-3 leading-tight">
                        {name}
                    </h1>

                    {subtitle && (
                        <p className="text-lg text-gray-800 mb-8 max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}

                    <nav className="flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
                        {breadcrumbItems.map((item, index) => {
                            const isLast = index === breadcrumbItems.length - 1
                            const ItemIcon = item.icon

                            return (
                                <div key={item.path} className="flex items-center">
                                    {index > 0 && (
                                        <ChevronRight className="w-4 h-4 mx-2 text-yellow-800/70" />
                                    )}

                                    {isLast ? (
                                        <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-300/30 rounded-xl shadow-md backdrop-blur-sm">
                                            <ItemIcon className="w-4 h-4 text-yellow-800" />
                                            <span className="text-yellow-900 font-medium text-sm">
                                                {item.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className="flex items-center space-x-2 px-4 py-2 text-yellow-900 hover:text-yellow-700 hover:bg-yellow-400/30 rounded-xl transition-all duration-200 shadow-sm backdrop-blur-sm group"
                                        >
                                            <ItemIcon className="w-4 h-4 text-yellow-700 group-hover:text-yellow-700 transition-colors" />
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </Link>
                                    )}
                                </div>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Decorative floating circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/30 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-10 w-32 h-32 bg-yellow-200/30 rounded-full transform translate-y-1/2"></div>
        </div>
    )
}

export default Breadcrumb
