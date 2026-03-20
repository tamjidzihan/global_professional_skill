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
    getStatusBadge,
}: InstructorRequestsListProps): JSX.Element {

    if (loading) {
        return (
            <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-16 bg-gray-50 rounded-lg border border-gray-100" />
                ))}
            </div>
        )
    }

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                    <User className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                    {searchQuery
                        ? 'No matching requests'
                        : filterStatus === 'ALL'
                            ? 'No instructor requests yet'
                            : `No ${filterStatus.toLowerCase()} requests`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                    {searchQuery
                        ? 'Try a different search term'
                        : 'Requests will appear here when submitted'}
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-2 max-h-65 overflow-y-auto pr-0.5">
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