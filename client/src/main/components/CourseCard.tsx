import { Link } from 'react-router-dom'
import { Clock, Star, Users, TrendingUp, BookOpen, Award } from 'lucide-react'

interface CourseCardProps {
    id?: string
    title: string
    image?: string
    price: string
    originalPrice?: string
    duration?: number
    rating?: string
    enrolled?: number
    category?: string
    instructor?: string
    level?: 'Beginner' | 'Intermediate' | 'Advanced'
    badge?: string
}

export function CourseCard({
    id = '1',
    title,
    image,
    price,
    originalPrice,
    duration,
    rating,
    enrolled = 1250,
    category = 'Professional',
    instructor = 'GPISBD',
    level = 'Intermediate',
    badge = 'Admission Going On'
}: CourseCardProps) {
    // Calculate discount percentage
    const discountPercentage = originalPrice
        ? Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)
        : 0

    return (
        <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full hover:-translate-y-1">
            {/* Thumbnail Container */}
            <div className="relative h-48 overflow-hidden bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-6">
                        <div className="text-center text-white">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-90" />
                            <span className="font-bold text-lg opacity-90">GPISBD Course</span>
                            <p className="text-sm opacity-75 mt-1">{category}</p>
                        </div>
                    </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-3 left-3">
                    {badge && (
                        <div className="bg-linear-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            {badge}
                        </div>
                    )}
                </div>

                <div className="absolute top-3 right-3">
                    {discountPercentage > 0 && (
                        <div className="bg-linear-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            -{discountPercentage}%
                        </div>
                    )}
                </div>

                {/* Level Indicator */}
                <div className="absolute bottom-3 left-3">
                    <div className={`px-2 py-1 rounded-md text-xs font-bold text-white ${level === 'Beginner' ? 'bg-green-500' :
                        level === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                        {level}
                    </div>
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="p-5 grow flex flex-col">
                {/* Category & Instructor */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {category}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{enrolled.toLocaleString()}</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 min-h-14 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>

                {/* Instructor */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                    <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{instructor}</span>
                </div>

                {/* Course Details */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{duration} hr Program</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center">
                        <div className="flex items-center mr-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(parseInt(rating || '0')) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({enrolled}+)</span>
                    </div>
                </div>

                {/* Price & CTA */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-baseline">
                                <span className="text-2xl font-bold text-gray-900">Tk. {price}</span>
                                {originalPrice && (
                                    <span className="text-gray-400 text-sm line-through ml-2">
                                        Tk. {originalPrice}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Flexible payment options available</p>
                        </div>

                        <Link
                            to={`/course/${id}`}
                            className="group/btn relative overflow-hidden bg-linear-to-r from-[#0066CC] to-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5"
                        >
                            <span className="relative z-10">View Details</span>
                            <div className="absolute inset-0 bg-linear-to-r from-blue-700 to-blue-800 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                            <Award className="absolute -right-2 -bottom-2 w-8 h-8 text-white/10" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Hover effect line */}
            <div className="h-1 bg-linear-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </div>
    )
}