
// Skeleton Components
const CourseDetailSkeleton = () => {
    return (
        <>
            {/* Breadcrumb Skeleton */}
            <div className="bg-[#f5f5dc] border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-2 animate-pulse">
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        <div className="w-32 h-4 bg-gray-300 rounded"></div>
                        <div className="w-4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-40 h-4 bg-gray-300 rounded"></div>
                    </div>
                    <div className="mt-2">
                        <div className="w-64 h-6 bg-gray-300 rounded animate-pulse"></div>
                        <div className="w-48 h-4 mt-2 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Course Header Skeleton */}
            <div className="bg-[#f5f5dc] py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Left: Course Info Skeleton */}
                        <div className="flex-1">
                            {/* Status Badges Skeleton */}
                            <div className="flex items-center gap-3 mb-3 animate-pulse">
                                <div className="w-24 h-8 bg-gray-300 rounded-full"></div>
                                <div className="w-32 h-8 bg-gray-300 rounded-full"></div>
                            </div>

                            {/* Title Skeleton */}
                            <div className="animate-pulse">
                                <div className="w-3/4 h-10 bg-gray-300 rounded mb-2"></div>
                                <div className="w-2/3 h-10 bg-gray-300 rounded mb-4"></div>
                            </div>

                            {/* Rating and Meta Skeleton */}
                            <div className="flex items-center gap-4 mb-4 animate-pulse">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                    <div className="w-16 h-4 ml-1 bg-gray-300 rounded"></div>
                                </div>
                                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                <div className="w-20 h-4 bg-gray-300 rounded"></div>
                            </div>

                            {/* Description Skeleton */}
                            <div className="animate-pulse mb-6">
                                <div className="w-full h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="w-5/6 h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="w-4/6 h-4 bg-gray-300 rounded"></div>
                            </div>

                            {/* Info Cards Skeleton */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-gray-300 px-4 py-3 rounded-lg animate-pulse">
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 bg-gray-400 rounded mr-3"></div>
                                            <div className="flex flex-row items-center gap-2">
                                                <div className="w-24 h-4 bg-gray-400 rounded"></div>
                                                <div className="w-8 h-8 bg-gray-400 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Details Row Skeleton */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-gray-200 border-l-4 border-gray-400 p-4 rounded animate-pulse">
                                        <div className="flex items-start">
                                            <div className="w-5 h-5 bg-gray-400 rounded mr-2"></div>
                                            <div className="flex-1">
                                                <div className="w-32 h-4 bg-gray-400 rounded mb-2"></div>
                                                <div className="w-24 h-4 bg-gray-400 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pricing Skeleton */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-20 h-4 bg-gray-300 rounded"></div>
                                            <div className="w-32 h-8 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="w-48 h-4 bg-gray-300 rounded"></div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-32 h-12 bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Course Banner Skeleton */}
                        <div className="w-full lg:w-120 shrink-0 animate-pulse">
                            <div className="bg-gray-300 rounded-lg shadow-xl h-64 w-full"></div>

                            {/* Share and Save Buttons Skeleton */}
                            <div className="mt-4 flex gap-2">
                                <div className="flex-1 h-10 bg-gray-300 rounded-lg"></div>
                                <div className="flex-1 h-10 bg-gray-300 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Course Details Skeleton */}
                    <div className="flex-1">
                        <div className="w-48 h-8 bg-gray-300 rounded animate-pulse mb-6"></div>

                        {/* Tabs Skeleton */}
                        <div className="flex border-b border-gray-200 mb-6 animate-pulse">
                            <div className="px-6 py-3 w-32 h-12 bg-gray-300 rounded-t-lg mr-2"></div>
                            <div className="px-6 py-3 w-32 h-12 bg-gray-300 rounded-t-lg"></div>
                        </div>

                        {/* Tab Content Skeleton */}
                        <div className="bg-white h-180 overflow-y-scroll rounded-lg px-10 py-6 border border-gray-200 shadow-sm">
                            <div className="space-y-6 animate-pulse">
                                <div className="space-y-3">
                                    <div className="w-48 h-6 bg-gray-300 rounded"></div>
                                    <div className="w-full h-4 bg-gray-300 rounded"></div>
                                    <div className="w-full h-4 bg-gray-300 rounded"></div>
                                    <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                                    <div className="w-4/6 h-4 bg-gray-300 rounded"></div>
                                </div>

                                <div className="space-y-3">
                                    <div className="w-40 h-6 bg-gray-300 rounded"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                                                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                                                <div className="w-16 h-4 bg-gray-300 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="w-40 h-6 bg-gray-300 rounded"></div>
                                    <div className="w-full h-20 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar Skeleton */}
                    <div className="w-full lg:w-100 space-y-6">
                        {/* Instructor Skeleton */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm animate-pulse">
                            <div className="flex items-center mb-4">
                                <div className="w-5 h-5 bg-gray-300 rounded mr-2"></div>
                                <div className="w-24 h-6 bg-gray-300 rounded"></div>
                            </div>
                            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                <div className="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
                                <div className="flex-1">
                                    <div className="w-32 h-5 bg-gray-300 rounded mb-2"></div>
                                    <div className="w-20 h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="w-full h-4 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* Who can Join Skeleton */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm animate-pulse">
                            <div className="flex items-center mb-4">
                                <div className="w-5 h-5 bg-gray-300 rounded mr-2"></div>
                                <div className="w-32 h-6 bg-gray-300 rounded"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="w-full h-4 bg-gray-300 rounded"></div>
                                <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                                <div className="w-4/6 h-4 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Reviews Skeleton */}
                <div className="mt-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="w-48 h-8 bg-gray-300 rounded animate-pulse"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Rating Summary Skeleton */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm animate-pulse">
                            <div className="w-40 h-6 bg-gray-300 rounded mb-4"></div>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center mb-2">
                                    <div className="flex w-20">
                                        {[...Array(5)].map((_, j) => (
                                            <div key={j} className="w-4 h-4 bg-gray-300 rounded mr-0.5"></div>
                                        ))}
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full mx-3">
                                        <div className="h-full w-3/4 bg-gray-300 rounded-full"></div>
                                    </div>
                                    <div className="w-10 h-4 bg-gray-300 rounded"></div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Reviews Skeleton */}
                        <div className="md:col-span-2 bg-white rounded-lg p-6 border border-gray-200 shadow-sm animate-pulse">
                            <div className="w-32 h-6 bg-gray-300 rounded mb-4"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center mb-2">
                                            <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                            <div className="flex-1">
                                                <div className="w-24 h-4 bg-gray-300 rounded mb-2"></div>
                                                <div className="flex items-center">
                                                    <div className="flex gap-1 mr-2">
                                                        {[...Array(5)].map((_, j) => (
                                                            <div key={j} className="w-3 h-3 bg-gray-300 rounded"></div>
                                                        ))}
                                                    </div>
                                                    <div className="w-16 h-3 bg-gray-300 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-8 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


export default CourseDetailSkeleton;