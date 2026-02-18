import { CheckCircle, XCircle, Clock } from 'lucide-react'
import type { JSX } from 'react'

export function getStatusIcon(status: string): JSX.Element {
    switch (status) {
        case 'APPROVED':
            return <CheckCircle className="w-4 h-4 text-green-500" />
        case 'REJECTED':
            return <XCircle className="w-4 h-4 text-red-500" />
        case 'PENDING':
        default:
            return <Clock className="w-4 h-4 text-yellow-500" />
    }
}

export function getStatusColor(status: string): string {
    switch (status) {
        case 'APPROVED':
            return 'bg-green-50 text-green-800 border-green-200'
        case 'REJECTED':
            return 'bg-red-50 text-red-800 border-red-200'
        case 'PENDING':
            return 'bg-yellow-50 text-yellow-800 border-yellow-200'
        default:
            return 'bg-gray-50 text-gray-800 border-gray-200'
    }
}

export function getStatusBadge(status: string): JSX.Element {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)} border`}>
            {getStatusIcon(status)}
            <span className="ml-1.5">{status}</span>
        </span>
    )
}