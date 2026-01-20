import { Star, Plus } from 'lucide-react'

export function CourseReviews() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Reviews</h2>
                    <div className="flex items-center">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                            ))}
                        </div>
                        <span className="ml-2 text-gray-600">0 ratings</span>
                    </div>
                </div>
                <button className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Review
                </button>
            </div>

            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-500">Be the first to share your experience with this course!</p>
            </div>
        </div>
    )
}