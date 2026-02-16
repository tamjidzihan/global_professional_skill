import CourseCardSkeleton from "./CourseCardSkeleton"
import DesktopSidebarSkeleton from "./DesktopSidebarSkeleton"

const CoursesPageSkeleton = () => {
    return (
        <>
            {/* Breadcrumb Skeleton */}
            <nav className="flex bg-gray-50 border border-blue-200 py-3 px-5 rounded-lg" aria-label="Breadcrumb">
                <div className="container mx-auto px-4 py-1">
                    <div className="flex items-center gap-2 animate-pulse">
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        <div className="w-32 h-4 bg-gray-300 rounded"></div>
                        <div className="w-4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-40 h-4 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </nav>

            {/* Top Search Bar Skeleton */}
            <div className="container mx-auto px-4 py-2 mb-4">
                <div className="relative rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl">
                    <div className="absolute -inset-px rounded-2xl bg-gray-200/50"></div>
                    <div className="relative px-6 py-2">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                            {/* Left Heading Skeleton */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-200 animate-pulse">
                                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                                </div>
                                <div>
                                    <div className="w-48 h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
                                    <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>

                            {/* Search Input Skeleton */}
                            <div className="flex-1">
                                <div className="relative animate-pulse">
                                    <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded"></div>
                                </div>
                            </div>

                            {/* Mobile Filter Button Skeleton */}
                            <div className="lg:hidden w-24 h-11 bg-gray-200 rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="container mx-auto px-4 pb-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar Skeleton */}
                    <DesktopSidebarSkeleton />

                    {/* Course Grid Skeleton */}
                    <div className="w-full lg:w-3/4">
                        {/* Header Skeleton */}
                        <div className="mb-6 animate-pulse">
                            <div className="w-48 h-7 bg-gray-200 rounded mb-2"></div>
                            <div className="w-64 h-5 bg-gray-200 rounded"></div>
                        </div>

                        {/* Mobile Filter Info Skeleton */}
                        <div className="lg:hidden mb-4 p-3 bg-gray-100 rounded-lg border border-gray-200 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                                    <div className="w-32 h-4 bg-gray-300 rounded"></div>
                                </div>
                                <div className="w-16 h-4 bg-gray-300 rounded"></div>
                            </div>
                        </div>

                        {/* Course Cards Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <CourseCardSkeleton key={i} />
                            ))}
                        </div>

                        {/* Pagination Skeleton */}
                        <div className="flex justify-center mt-8 space-x-4 animate-pulse">
                            <div className="w-24 h-9 bg-gray-200 rounded-lg"></div>
                            <div className="w-24 h-9 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


export default CoursesPageSkeleton