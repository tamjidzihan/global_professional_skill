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

const STATUS_TABS: FilterStatus[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

const tabColors: Record<FilterStatus, string> = {
    ALL: 'bg-gray-900 text-white',
    PENDING: 'bg-amber-500 text-white',
    APPROVED: 'bg-emerald-500 text-white',
    REJECTED: 'bg-rose-500 text-white',
}

const tabActiveRing: Record<FilterStatus, string> = {
    ALL: 'ring-gray-200',
    PENDING: 'ring-amber-200',
    APPROVED: 'ring-emerald-200',
    REJECTED: 'ring-rose-200',
}

export function InstructorRequestFilters({
    filterStatus,
    searchQuery,
    totalCount,
    pendingCount,
    onFilterChange,
    onSearchChange,
}: InstructorRequestFiltersProps): JSX.Element {
    return (
        <div className="mb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-gray-900">Instructor Requests</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {totalCount} total request{totalCount !== 1 ? 's' : ''}
                    </p>
                </div>
                {pendingCount && pendingCount > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-600 rounded-md">
                        {pendingCount} pending
                    </span>
                ) : null}
            </div>

            {/* Search + dropdown row */}
            <div className="flex gap-2 mb-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
                    />
                </div>

                {/* Status dropdown */}
                <div className="relative shrink-0">
                    <select
                        value={filterStatus}
                        onChange={(e) => onFilterChange(e.target.value as FilterStatus)}
                        className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                    >
                        <option value="ALL">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                    <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Status tab pills */}
            <div className="flex items-center gap-1.5">
                {STATUS_TABS.map((status) => {
                    const active = filterStatus === status
                    return (
                        <button
                            key={status}
                            onClick={() => onFilterChange(status)}
                            className={`
                                relative inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg
                                transition-all duration-150 cursor-pointer
                                ${active
                                    ? `${tabColors[status]} ring-2 ${tabActiveRing[status]} shadow-sm`
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100'
                                }
                            `}
                        >
                            {status}
                            {status === 'PENDING' && pendingCount && pendingCount > 0 && (
                                <span className={`
                                    inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full
                                    ${active ? 'bg-white/30 text-white' : 'bg-amber-500 text-white'}
                                `}>
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}