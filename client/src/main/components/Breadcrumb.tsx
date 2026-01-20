import { ChevronRight, Home, BookOpen, Folder, Layers } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface BreadcrumbProps {
    name: string
    subtitle?: string
    icon?: React.ElementType
}

const Breadcrumb = ({ name, subtitle, icon: Icon }: BreadcrumbProps) => {
    const location = useLocation()

    // Default icon based on path
    const getDefaultIcon = () => {
        const path = location.pathname.toLowerCase()
        if (path.includes('course')) return BookOpen
        if (path.includes('about')) return Folder
        if (path.includes('blog')) return Layers
        return Folder
    }

    const DefaultIcon = getDefaultIcon()
    const BreadcrumbIcon = Icon || DefaultIcon

    // Calculate breadcrumb items based on current path
    const getBreadcrumbItems = () => {
        const path = location.pathname
        const parts = path.split('/').filter(Boolean)

        const items = []
        let currentPath = ''

        // Always start with home
        items.push({ name: 'Home', path: '/', icon: Home })

        // Build paths for each segment
        for (let i = 0; i < parts.length; i++) {
            currentPath += '/' + parts[i]
            const isLast = i === parts.length - 1

            // Format name for display
            let formattedName = parts[i]
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')

            // Special handling for current page
            if (isLast) {
                formattedName = name || formattedName
            }

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
        <div className="relative overflow-hidden bg-linear-to-r from-gray-900 via-[#0052CC] to-blue-800">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[20px_20px]" />
            </div>

            {/* Animated Gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

            <div className="relative container mx-auto px-4 py-16 md:py-20">
                <div className="max-w-4xl">

                    {/* Main Title */}
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
                        {name}
                    </h1>

                    {/* Subtitle */}
                    {subtitle && (
                        <p className="text-lg text-blue-100 mb-8 max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}

                    {/* Breadcrumb Navigation */}
                    <nav className="flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
                        {breadcrumbItems.map((item, index) => {
                            const isLast = index === breadcrumbItems.length - 1
                            const ItemIcon = item.icon

                            return (
                                <div key={item.path} className="flex items-center">
                                    {index > 0 && (
                                        <ChevronRight className="w-4 h-4 mx-2 text-blue-300/60" />
                                    )}

                                    {isLast ? (
                                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 rounded-lg">
                                            <ItemIcon className="w-4 h-4 text-white" />
                                            <span className="text-white font-medium text-sm">
                                                {item.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className="flex items-center space-x-2 px-3 py-1.5 text-blue-100 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 group"
                                        >
                                            <ItemIcon className="w-4 h-4 text-blue-200 group-hover:text-white transition-colors" />
                                            <span className="text-sm font-medium">
                                                {item.name}
                                            </span>
                                        </Link>
                                    )}
                                </div>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-10 w-32 h-32 bg-white/10 rounded-full transform translate-y-1/2"></div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-gray-900 to-transparent pointer-events-none" />
        </div>
    )
}

export default Breadcrumb