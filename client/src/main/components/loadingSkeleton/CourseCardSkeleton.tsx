
const CourseCardSkeleton = () => {
    return (
        <div className="group bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
            <div className="relative h-48 overflow-hidden bg-gray-200">
                <div className="w-full h-full bg-gray-300"></div>
                <div className="absolute top-3 left-3">
                    <div className="w-32 h-6 bg-gray-400 rounded-full"></div>
                </div>
                <div className="absolute bottom-3 left-3">
                    <div className="w-16 h-5 bg-gray-400 rounded-md"></div>
                </div>
            </div>
            <div className="p-5 grow flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-20 h-5 bg-gray-200 rounded"></div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
                        <div className="w-12 h-3 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="space-y-2 mb-3">
                    <div className="w-full h-4 bg-gray-200 rounded"></div>
                    <div className="w-4/5 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center mb-4">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <div className="w-32 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-3 mb-4">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                        <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center mr-2 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                        <div className="w-8 h-3 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="w-24 h-6 bg-gray-200 rounded mb-1"></div>
                            <div className="w-36 h-3 bg-gray-200 rounded"></div>
                        </div>
                        <div className="w-28 h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
            <div className="h-1 bg-gray-200"></div>
        </div>
    )
}

export default CourseCardSkeleton




