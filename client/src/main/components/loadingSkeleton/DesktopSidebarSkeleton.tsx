import CategoryFilterSkeleton from "./CategoryFilterSkeleton"

const DesktopSidebarSkeleton = () => {
    return (
        <div className="hidden lg:block w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-4">
                <div className="mb-6">
                    <div className="flex items-center mb-4 animate-pulse">
                        <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
                        <div className="w-24 h-5 bg-gray-200 rounded"></div>
                    </div>
                    <CategoryFilterSkeleton />
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <div className="w-24 h-5 bg-gray-200 rounded mb-3 animate-pulse"></div>
                    <div className="space-y-2 animate-pulse">
                        <div className="flex justify-between">
                            <div className="w-20 h-4 bg-gray-200 rounded"></div>
                            <div className="w-8 h-4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex justify-between">
                            <div className="w-24 h-4 bg-gray-200 rounded"></div>
                            <div className="w-6 h-4 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DesktopSidebarSkeleton