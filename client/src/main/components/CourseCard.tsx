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
        <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col h-full hover:-translate-y-1.5 hover:border-blue-400/50">
            {/* Thumbnail Container - Adjusted height for mobile */}
            <div className="relative h-44 sm:h-48 overflow-hidden bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 shrink-0">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 relative">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0"
                                style={{
                                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                                    backgroundSize: '20px 20px'
                                }}>
                            </div>
                        </div>

                        <div className="text-center text-white relative z-10">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <span className="font-bold text-base sm:text-lg">GPIS-BD Course</span>
                            <p className="text-[10px] sm:text-sm opacity-80 mt-1 uppercase tracking-wider">{category}</p>
                        </div>
                    </div>
                )}

                {/* Badges - Scaled for mobile */}
                {badge && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                        <div className="flex items-center gap-1 bg-linear-to-r from-emerald-500 to-green-500 text-white px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                            <Sparkles className="w-2.5 h-2.5" />
                            {badge}
                        </div>
                    </div>
                )}

                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-0.5 sm:py-1 rounded-full shadow-md">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-[10px] sm:text-xs font-black text-gray-900">{rating}</span>
                    </div>
                </div>

                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                    <div className={`${config.color} text-white px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black shadow-lg uppercase tracking-tight`}>
                        {level}
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-3 sm:p-4 flex flex-col grow">
                {/* Category & Enrolled */}
                <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate max-w-20 sm:max-w-none">{category}</span>
                    </span>
                    <div className="flex items-center text-[10px] sm:text-xs font-semibold text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        {enrolled.toLocaleString()}
                    </div>
                </div>

                {/* Title - Smaller text on mobile */}
                <Link
                    to={`/courses/${id}`}
                    className="font-bold text-gray-900 text-sm sm:text-base mb-3 line-clamp-2 min-h-10 sm:min-h-12 leading-snug group-hover:text-blue-600 transition-colors"
                >
                    {title}
                </Link>

                {/* Metadata Grid - Redesigned for mobile responsiveness */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="col-span-2 flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shrink-0">
                            <Award className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 leading-none mb-0.5">Instructor</p>
                            <p className="text-xs font-semibold text-gray-800 truncate">{instructor}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-purple-50 px-2 py-1.5 rounded-lg border border-purple-100">
                        <Clock className="w-3 h-3 text-purple-600 shrink-0" />
                        <span className="text-[10px] sm:text-xs font-semibold text-purple-600 truncate">{duration}h</span>
                    </div>

                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1.5 rounded-lg border border-yellow-100">
                        <div className="flex shrink-0">
                            <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-700">{rating} Rating</span>
                    </div>
                </div>

                <div className="grow"></div>

                {/* Footer Section - Optimized CTA */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <div className="shrink-0">
                        <p className="text-[10px] text-gray-400 font-medium">Course Fee</p>
                        <span className="text-lg sm:text-xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ৳{price}
                        </span>
                    </div>

                    <Link
                        to={`/courses/${id}`}
                        className="group/btn relative overflow-hidden bg-linear-to-r from-[#0066CC] to-blue-600 text-white font-semibold text-[10px] sm:text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:shadow-lg transition-all active:scale-95 flex items-center gap-1 shrink-0"
                    >
                        <span className="relative z-10">Enroll</span>
                        <ChevronRight className="w-3 h-3 relative z-10 group-hover/btn:translate-x-0.5 transition-transform" />
                        <div className="absolute inset-0 bg-linear-to-r from-blue-700 to-blue-800 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"></div>
                        <Zap className="absolute -right-1 -bottom-1 w-8 h-8 text-white/10 rotate-12" />
                    </Link>
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </div>
    )
}