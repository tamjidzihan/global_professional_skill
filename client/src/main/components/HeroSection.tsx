import { Search, Briefcase, UserCheck, Monitor, CalendarCheck } from "lucide-react"
import studentImage from "../../assets/image/student-graduation.jpg"

const HeroSection = () => {
    return (
        <section className="bg-linear-to-r from-[#0041a3] to-[#0066CC] pt-12 sm:pt-16 pb-16 sm:pb-24 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-1/2 text-white text-center md:text-left">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                            Find Your Preferred Course
                        </h1>

                        <div className="relative max-w-lg mx-auto md:mx-0">
                            <input
                                type="text"
                                placeholder="Search a course..."
                                className="w-full py-2 sm:py-3 px-4 sm:px-5 pr-10 sm:pr-12 rounded-full bg-white text-gray-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <button className="absolute right-1 top-1 bottom-1 bg-[#0052CC] text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-800 transition-colors">
                                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto md:mx-0">
                            <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded border border-white/20 text-center hover:bg-white/20 transition-colors cursor-pointer">
                                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2" />
                                <span className="text-[10px] sm:text-xs font-bold">JOB</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded border border-white/20 text-center hover:bg-white/20 transition-colors cursor-pointer">
                                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2" />
                                <span className="text-[10px] sm:text-xs font-bold">
                                    SELF BUSINESS
                                </span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded border border-white/20 text-center hover:bg-white/20 transition-colors cursor-pointer col-span-2 sm:col-span-1">
                                <Monitor className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2" />
                                <span className="text-[10px] sm:text-xs font-bold">
                                    FREELANCING
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden w-full md:w-1/2 md:flex justify-center relative mt-8 md:mt-0">
                        {/* Illustration elements */}
                        <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
                            {/* Animated background circles */}
                            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-pulse"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-blue-300/30 rounded-full animate-spin-slow"></div>

                            {/* Animated floating orb */}
                            <div className="absolute top-4 right-4 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full animate-bounce"></div>
                            <div className="absolute bottom-8 left-6 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-bounce delay-300"></div>

                            {/* Floating Labels with enhanced animations */}
                            <div className="absolute top-0 right-0 bg-white text-[#0066CC] px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold shadow-lg transform rotate-6 animate-float">
                                DEVELOP YOUR SKILL
                            </div>
                            <div className="absolute bottom-10 left-0 bg-white text-[#0066CC] px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold shadow-lg transform -rotate-6 animate-float-delayed">
                                SELF DEVELOPMENT
                            </div>

                            {/* Animated floating element */}
                            <div className="absolute top-1/4 left-2 bg-white/20 backdrop-blur-sm p-1.5 rounded-full animate-ping-slow">
                                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                            {/* Animated floating element */}
                            <div className="absolute bottom-1/4 right-3 bg-white/20 backdrop-blur-sm p-1.5 rounded-full animate-ping-slow2">
                                <CalendarCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>

                            {/* Main Image Container with animations */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative w-36 h-36 sm:w-48 sm:h-48 lg:w-66 lg:h-66 rounded-full overflow-hidden border-4 border-white shadow-2xl animate-float-subtle">
                                    {/* Main image */}
                                    <img
                                        src={studentImage}
                                        alt="Student with graduation cap"
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                    />
                                </div>

                                {/* Floating small elements around the image */}
                                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center animate-spin-slow">
                                    <Monitor className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center animate-spin-slow-reverse">
                                    <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background decorative shapes */}
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/5 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        </section>
    )
}

export default HeroSection