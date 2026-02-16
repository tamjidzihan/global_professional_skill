import CategoryFilterSkeleton from "./CategoryFilterSkeleton"

const MobileFilterSkeleton = () => {
    return (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
            <div className="flex flex-col h-full">
                {/* Header Skeleton */}
                <div className="bg-gray-200 p-4 flex justify-between items-center animate-pulse">
                    <div className="flex items-center">
                        <div className="w-5 h-5 bg-gray-300 rounded mr-2"></div>
                        <div className="w-32 h-5 bg-gray-300 rounded"></div>
                    </div>
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>

                {/* Content Skeleton */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-6">
                        <div className="flex items-center mb-4">
                            <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
                            <div className="w-24 h-5 bg-gray-200 rounded"></div>
                        </div>
                        <CategoryFilterSkeleton />
                    </div>
                </div>

                {/* Footer Skeleton */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="w-full h-11 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

export default MobileFilterSkeleton