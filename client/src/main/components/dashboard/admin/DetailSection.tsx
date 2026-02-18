// components/admin/dashboard/DetailSection.tsx
import type { JSX } from 'react'

interface DetailSectionProps {
    title: string
    content: string
}

export function DetailSection({ title, content }: DetailSectionProps): JSX.Element | null {
    if (!content || content.trim() === '') return null

    return (
        <div>
            <h4 className="font-medium text-gray-700 mb-2">{title}</h4>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-line">
                {content}
            </div>
        </div>
    )
}