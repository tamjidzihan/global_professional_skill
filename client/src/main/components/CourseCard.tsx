import { Link } from 'react-router-dom'
import { Clock, Star, Users, TrendingUp, BookOpen, Award, ChevronRight, Sparkles, Zap } from 'lucide-react'

interface CourseCardProps {
    id: string
    title: string
    price: string
    duration?: number
    rating?: string
    enrolled?: number
    category?: string
    instructor?: string
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    badge?: string
    thumbnail?: string
}

export function CourseCard({
    id,
    title,
    price,
    duration,
    rating = '4.8',
    enrolled = 1250,
    category,
    instructor,
    level,
    badge = 'Admission Going On',
    thumbnail = ''
}: CourseCardProps) {

    const levelConfig = {
        BEGINNER: { color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50', border: 'border-green-200' },
        INTERMEDIATE: { color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', border: 'border-yellow-200' },
        ADVANCED: { color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', border: 'border-red-200' }
    }

    const config = levelConfig[level]

    return (
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col h-full hover:-translate-y-2 hover:border-blue-400">
            {/* Thumbnail Container */}
            <div className="relative h-48 overflow-hidden bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 relative">
                        {/* Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0"
                                style={{
                                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                                    backgroundSize: '20px 20px'
                                }}>
                            </div>
                        </div>

                        <div className="text-center text-white relative z-10">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-lg">GPIS-BD Course</span>
                            <p className="text-sm opacity-80 mt-1">{category}</p>
                        </div>
                    </div>
                )}

                {/* Top Badge */}
                {badge && (
                    <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1.5 bg-linear-to-r from-emerald-500 to-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                            <Sparkles className="w-3 h-3" />
                            {badge}
                        </div>
                    </div>
                )}

                {/* Rating Badge - Top Right */}
                <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                        <span className="text-xs font-bold text-gray-900">{rating}</span>
                    </div>
                </div>

                {/* Level Indicator - Bottom Left */}
                <div className="absolute bottom-3 left-3">
                    <div className={`${config.color} text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg`}>
                        {level}
                    </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col grow">
                {/* Category & Enrolled */}
                <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                        <TrendingUp className="w-3 h-3" />
                        {category}
                    </span>
                    <div className="flex items-center text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                        <Users className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                        {enrolled.toLocaleString()}
                    </div>
                </div>

                {/* Title */}
                <Link
                    to={`/courses/${id}`}
                    className="font-bold text-gray-900 text-base mb-3 line-clamp-2 min-h-12 leading-tight group-hover:text-blue-600 transition-colors"
                >
                    {title}
                </Link>

                {/* Instructor, Duration & Rating - Redesigned */}
                <div className="flex items-center gap-2 mb-2 pb-2">
                    <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500">Instructor</p>
                        <p className="text-sm font-semibold text-gray-900">{instructor}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200">
                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-600">Duration: {duration}h</span>
                        </div>
                        <div className="flex items-center gap-0.5 bg-yellow-50 px-2.5 py-1.5 rounded-lg border border-yellow-200">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-2.5 h-2.5 ${i < Math.floor(parseFloat(rating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                            ))}
                            <span className="text-xs font-bold text-gray-700 ml-0.5">{rating}</span>
                        </div>
                    </div>
                </div>

                {/* Spacer */}
                <div className="grow"></div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t-2 border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400">Course Fee</p>
                        <span className="text-2xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ৳{price}
                        </span>
                    </div>

                    <Link
                        to={`/courses/${id}`}
                        className="group/btn relative overflow-hidden bg-linear-to-r from-[#0066CC] to-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-1.5 hover:scale-105"
                    >
                        <span className="relative z-10">View Course</span>
                        <ChevronRight className="w-3.5 h-3.5 relative z-10 group-hover/btn:translate-x-0.5 transition-transform" />
                        <div className="absolute inset-0 bg-linear-to-r from-blue-700 to-blue-800 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"></div>
                        <Zap className="absolute -right-1 -bottom-1 w-10 h-10 text-white/10 rotate-12" />
                    </Link>
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </div>
    )
}