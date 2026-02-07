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
        <div
            className="
                group relative overflow-hidden rounded-xl border border-gray-100
                bg-linear-to-br from-blue-50/50 to-indigo-50/30
                p-6 shadow-sm hover:shadow-lg"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <CalendarDays size={18} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                    Calendar
                </h3>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-xl p-3 border border-white/40 shadow-inner">
                <Calendar onChange={onChange} value={value} />
            </div>
        </div>
    )
}

export default CalendarCard
