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
            onClick={() => onClick(request.id)}
            className="group flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-white transition-all duration-150 cursor-pointer"
        >
            {/* Avatar icon */}
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-violet-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Top row: name + badge */}
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                        {request.user_name || 'No Name'}
                    </p>
                    <div className="shrink-0">
                        {getStatusBadge(request.status)}
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 text-gray-300 shrink-0" />
                    <p className="text-xs text-gray-400 truncate">{request.user_email}</p>
                </div>

                {/* Reason */}
                {request.reason && (
                    <p className="mt-1.5 text-xs text-gray-500 line-clamp-1">
                        {request.reason}
                    </p>
                )}

                {/* Footer meta */}
                <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{format(new Date(request.created_at), 'MMM d, yyyy')}</span>

                    {request.reviewed_at && (
                        <>
                            <span className="text-gray-200">•</span>
                            <span>Reviewed {format(new Date(request.reviewed_at), 'MMM d')}</span>
                        </>
                    )}

                    {request.reviewed_by_email && (
                        <>
                            <span className="text-gray-200">•</span>
                            <span className="truncate max-w-25">{request.reviewed_by_email}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}