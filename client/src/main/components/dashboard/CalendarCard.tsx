import React, { useState } from 'react'
import Calendar from 'react-calendar'
import { CalendarDays } from 'lucide-react'
import 'react-calendar/dist/Calendar.css'
import './CalendarCard.css'

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

const CalendarCard: React.FC = () => {
    const [value, onChange] = useState<Value>(new Date())

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Calendar</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-violet-600" />
                </div>
            </div>

            {/* Calendar */}
            <div className="p-4">
                <Calendar onChange={onChange} value={value} />
            </div>
        </div>
    )
}

export default CalendarCard