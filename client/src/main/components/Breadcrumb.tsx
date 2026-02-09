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
        <section className="relative overflow-hidden bg-[#FCF8F1]">
            {/* Soft Decorative Shapes */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-200/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-10 w-40 h-40 bg-yellow-200/20 rounded-full blur-2xl translate-y-1/3" />

            <div className="relative container mx-auto px-4 py-14">
                <div className="max-w-5xl">

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3">
                        {name}
                    </h1>

                    {/* Subtitle */}
                    {subtitle && (
                        <p className="text-base sm:text-lg text-gray-700 max-w-2xl mb-6 leading-relaxed">
                            {subtitle}
                        </p>
                    )}

                    {/* Breadcrumb Pills */}
                    <nav className="flex flex-wrap items-center gap-2 mt-4" aria-label="Breadcrumb">
                        {breadcrumbItems.map((item, index) => {
                            const isLast = index === breadcrumbItems.length - 1
                            const ItemIcon = item.icon

                            return (
                                <div key={item.path} className="flex items-center">
                                    {index > 0 && (
                                        <ChevronRight className="w-4 h-4 mx-1 text-yellow-800/60" />
                                    )}

                                    {isLast ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-300/40 rounded-full shadow-sm backdrop-blur-md">
                                            <ItemIcon className="w-4 h-4 text-yellow-900" />
                                            <span className="text-yellow-900 font-semibold text-sm">
                                                {item.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full
                    bg-white/50 text-yellow-900 font-medium text-sm shadow-sm backdrop-blur-md
                    hover:bg-yellow-300/30 hover:shadow transition-all"
                                        >
                                            <ItemIcon className="w-4 h-4 text-yellow-700" />
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            )
                        })}
                    </nav>
                </div>
            </div>
        </section>
    )

}

export default Breadcrumb
