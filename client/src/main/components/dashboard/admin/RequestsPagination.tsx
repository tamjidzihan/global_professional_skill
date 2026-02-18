import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { JSX } from 'react'

interface RequestsPaginationProps {
    nextPage: string | null
    prevPage: string | null
    onNextPage: () => void
    onPrevPage: () => void
    currentCount: number
    totalCount: number
}

export function RequestsPagination({
    nextPage,
    prevPage,
    onNextPage,
    onPrevPage,
    currentCount,
    totalCount
}: RequestsPaginationProps): JSX.Element | null {
    if (!nextPage && !prevPage) return null

    return (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <button
                onClick={onPrevPage}
                disabled={!prevPage}
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${prevPage
                    ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
                    }`}
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
            </button>

            <span className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded">
                Showing {currentCount} of {totalCount}
            </span>

            <button
                onClick={onNextPage}
                disabled={!nextPage}
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${nextPage
                    ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
                    }`}
            >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
            </button>
        </div>
    )
}