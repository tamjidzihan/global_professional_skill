import { User, Mail, Clock } from 'lucide-react'
import { format } from 'date-fns'
import type { JSX } from 'react'
import type { InstructorRequest } from '../../../../types'

interface InstructorRequestItemProps {
    request: InstructorRequest
    onClick: (id: string) => void
    getStatusBadge: (status: string) => JSX.Element
}

export function InstructorRequestItem({ request, onClick, getStatusBadge }: InstructorRequestItemProps): JSX.Element {
    return (
        <div
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer group"
            onClick={() => onClick(request.id)}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate">
                                    {request.user_name || 'No Name'}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                    <p className="text-sm text-gray-500 truncate">
                                        {request.user_email}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0">
                            {getStatusBadge(request.status)}
                        </div>
                    </div>

                    {request.reason && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            <span className="font-medium">Reason:</span> {request.reason}
                        </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </span>
                        {request.reviewed_at && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span>
                                    Reviewed: {format(new Date(request.reviewed_at), 'MMM d')}
                                </span>
                            </>
                        )}
                        {request.reviewed_by_email && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="truncate max-w-30">
                                    By: {request.reviewed_by_email}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}