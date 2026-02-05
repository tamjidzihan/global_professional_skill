import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarCard.css';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarCard: React.FC = () => {
    const [value, onChange] = useState<Value>(new Date());

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
            <div className="react-calendar-container">
                <Calendar onChange={onChange} value={value} />
            </div>
        </div>
    );
};

export default CalendarCard;