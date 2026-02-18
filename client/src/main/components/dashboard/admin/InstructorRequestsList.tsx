// components/admin/dashboard/InstructorRequestsList.tsx
import { User } from 'lucide-react'
import { InstructorRequestItem } from './InstructorRequestItem'
import type { JSX } from 'react'
import type { InstructorRequest } from '../../../../types'
import { RequestsPagination } from './RequestsPagination'

interface InstructorRequestsListProps {
    requests: InstructorRequest[]
    loading: boolean
    filterStatus: string
    searchQuery: string
    totalCount: number
    nextPage: string | null
    prevPage: string | null
    onViewDetails: (id: string) => void
    onNextPage: () => void
    onPrevPage: () => void
    getStatusBadge: (status: string) => JSX.Element
}

export function InstructorRequestsList({
    requests,
    loading,
    filterStatus,
    searchQuery,
    totalCount,
    nextPage,
    prevPage,
    onViewDetails,
    onNextPage,
    onPrevPage,
    getStatusBadge
}: InstructorRequestsListProps): JSX.Element {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-200">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">
                    {searchQuery
                        ? 'No matching requests found'
                        : filterStatus === 'ALL'
                            ? 'No instructor requests yet'
                            : `No ${filterStatus.toLowerCase()} requests`
                    }
                </p>
                <p className="text-gray-400 text-sm">
                    {searchQuery
                        ? 'Try a different search term'
                        : 'Requests will appear here when submitted'
                    }
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
                {requests.map((request) => (
                    <InstructorRequestItem
                        key={request.id}
                        request={request}
                        onClick={onViewDetails}
                        getStatusBadge={getStatusBadge}
                    />
                ))}
            </div>

            <RequestsPagination
                nextPage={nextPage}
                prevPage={prevPage}
                onNextPage={onNextPage}
                onPrevPage={onPrevPage}
                currentCount={requests.length}
                totalCount={totalCount}
            />
        </>
    )
}