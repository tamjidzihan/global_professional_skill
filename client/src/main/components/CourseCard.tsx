import { Link } from 'react-router-dom'
import { Star} from 'lucide-react'

interface CourseCardProps {
    id: string
    title: string
    price: string
    originalPrice?: string
    rating?: string
    reviewCount?: number
    enrolled?: number
    category?: string
    instructor?: string
    description?: string
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    badge?: 'Bestseller' | 'Hot & New' | 'New' | string
    thumbnail?: string
    duration_hours?: number
    total_classes?: number
    delivery_mode?: 'ONLINE' | 'OFFLINE' | 'BOTH'
}

export function CourseCard({
    id,
    title,
    price,
    originalPrice,
    rating,
    instructor,
    description,
    level,
    thumbnail = '',
    duration_hours,
    total_classes,
    delivery_mode,
}: CourseCardProps) {
    const ratingNum = rating ? parseFloat(rating) : 0
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => {
            const filled = i < Math.floor(rating)
            const half = !filled && i < rating

            return (
                <span key={i} className="relative inline-block w-4 h-4">
                    {/* Background star (empty) */}
                    <Star className="w-4 h-4 text-gray-300 fill-current absolute inset-0" />
                    {/* Foreground star (filled or half) */}
                    {(filled || half) && (
                        <span
                            className="absolute inset-0 overflow-hidden"
                            style={{ width: filled ? '100%' : '50%' }}
                        >
                            <Star className="w-4 h-4 text-orange-400 fill-current" />
                        </span>
                    )}
                </span>
            )
        })
    }

    const levelStyles: Record<string, string> = {
        BEGINNER: 'bg-green-100 text-green-700 border-green-200',
        INTERMEDIATE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        ADVANCED: 'bg-red-100 text-red-700 border-red-200',
    }
    const levelClass = levelStyles[level] ?? 'bg-gray-100 text-gray-700 border-gray-200'

    // Delivery mode configuration
    const deliveryModeConfig = {
        ONLINE: { label: 'Online', color: 'bg-blue-500' },
        OFFLINE: { label: 'Offline', color: 'bg-purple-500' },
        BOTH: {  label: 'Both', color: 'bg-green-500' }
    }

    const getDeliveryModeBadge = () => {
        if (!delivery_mode) return null
        const config = deliveryModeConfig[delivery_mode]
        if (!config) return null

        return (
            <div className={`absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.color} bg-opacity-90 backdrop-blur-sm shadow-lg`}>
                              <span className="text-xs font-semibold text-white">{config.label}</span>
            </div>
        )
    }

    return (
        <div
            className="
                group bg-white rounded-2xl overflow-hidden flex flex-col
                border border-gray-200
                shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                transition-all duration-300 hover:-translate-y-1
            "
        >
            {/* ── Thumbnail ── */}
            <div className="relative overflow-hidden bg-gray-100 shrink-0 aspect-video">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
                        <span className="text-white/80 text-4xl font-black tracking-tighter select-none">
                            {title.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Delivery Mode Badge - Bottom Right Corner */}
                {getDeliveryModeBadge()}
            </div>

            {/* ── Body ── */}
            <div className="p-4 flex flex-col grow gap-2">
                {/* Title */}
                <Link
                    to={`/courses/${id}`}
                    className="font-semibold text-gray-900 text-[17px] leading-snug line-clamp-2 hover:text-violet-700 transition-colors"
                >
                    {title}
                </Link>

                {/* Instructor */}
                {instructor && (
                    <p className="text-xs text-[#6d9e4e] font-medium truncate">{instructor}</p>
                )}

                {/* Description */}
                {description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{description}</p>
                )}

                {/* Rating row */}
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm font-bold text-orange-500 leading-none">{rating}</span>
                    <div className="flex items-center gap-0.5">{renderStars(ratingNum)}</div>
                    <div className="flex items-center gap-2 ml-auto">
                        {duration_hours !== undefined && (
                            <span className="text-[10px] text-gray-400 font-medium">{duration_hours}h</span>
                        )}
                        {total_classes !== undefined && (
                            <span className="text-[10px] text-gray-400 font-medium">• {total_classes} classes</span>
                        )}
                    </div>
                </div>

                {/* Spacer */}
                <div className="grow" />

                {/* Price and Level row */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">
                            <span className='font-extrabold'>৳</span>{price}</span>
                        {originalPrice && (
                            <span className="text-sm text-gray-400 line-through font-medium">৳{originalPrice}</span>
                        )}
                    </div>

                    {/* Level Badge */}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${levelClass}`}>
                        {level}
                    </span>
                </div>

                {/* View Details CTA */}
                <Link
                    to={`/courses/${id}`}
                    className="
                        mt-1 w-full text-center text-sm font-semibold py-2.5 rounded-xl
                        bg-violet-600 text-white
                        hover:bg-violet-700 active:scale-[0.98]
                        transition-all duration-200
                    "
                >
                    View Details
                </Link>
            </div>
        </div>
    )
}