import { User, Mail, Clock, GraduationCap, ChevronRight } from 'lucide-react'
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
            className="group flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-white transition-all duration-150 cursor-pointer shadow-2xs"
        >
            {/* Avatar icon */}
            <div className="w-9 h-9 rounded-xl bg-violet-100/80 flex items-center justify-center shrink-0 mt-0.5 border border-violet-100 text-violet-700 font-black text-xs">
                {request.user_name ? request.user_name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-violet-600" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Top row: name + badge */}
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-xs font-bold text-gray-900 truncate leading-tight group-hover:text-violet-700 transition-colors">
                            {request.user_name || 'Anonymous User'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                            <p className="text-[11px] text-gray-400 truncate">{request.user_email}</p>
                        </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                        {getStatusBadge(request.status)}
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-violet-600 transition-colors" />
                    </div>
                </div>

                {/* Qualifications & Teaching interests */}
                {(request.qualifications || request.teaching_interests) && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {request.qualifications && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
                                <GraduationCap className="w-2.5 h-2.5 text-violet-500" />
                                {request.qualifications}
                            </span>
                        )}
                        {request.teaching_interests && (
                            <span className="text-[10px] font-medium text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-[200px]">
                                {request.teaching_interests}
                            </span>
                        )}
                    </div>
                )}

                {/* Reason snippet */}
                {request.reason && (
                    <p className="mt-1.5 text-[11px] text-gray-500 line-clamp-1 italic">
                        "{request.reason}"
                    </p>
                )}

                {/* Footer meta */}
                <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-300 shrink-0" />
                        <span>Submitted {format(new Date(request.created_at), 'MMM d, yyyy')}</span>
                    </div>

                    {request.status === 'PENDING' ? (
                        <span className="text-violet-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to Review →
                        </span>
                    ) : request.reviewed_at ? (
                        <span>Reviewed {format(new Date(request.reviewed_at), 'MMM d')}</span>
                    ) : null}
                </div>
            </div>
        </div>
    )
}