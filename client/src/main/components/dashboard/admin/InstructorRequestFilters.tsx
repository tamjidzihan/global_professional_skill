import { Search, Filter } from 'lucide-react'
import type { JSX } from 'react'

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

interface InstructorRequestFiltersProps {
    filterStatus: FilterStatus
    searchQuery: string
    totalCount: number
    pendingCount?: number
    onFilterChange: (status: FilterStatus) => void
    onSearchChange: (query: string) => void
}

export function InstructorRequestFilters({
    filterStatus,
    searchQuery,
    totalCount,
    pendingCount,
    onFilterChange,
    onSearchChange
}: InstructorRequestFiltersProps): JSX.Element {
    return (
        <div className="mb-5">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                    Instructor Requests
                </h2>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                    {totalCount}
                </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => onFilterChange(e.target.value as FilterStatus)}
                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex space-x-1 border-b border-gray-200">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as FilterStatus[]).map((status) => (
                    <button
                        key={status}
                        onClick={() => onFilterChange(status)}
                        className={`px-3 py-2 text-xs font-medium transition-colors relative ${filterStatus === status
                            ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {status}
                        {status === 'PENDING' && pendingCount && pendingCount > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}