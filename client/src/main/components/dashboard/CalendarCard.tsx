import React, { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import { CalendarDays, Bell, ChevronRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import 'react-calendar/dist/Calendar.css'
import './CalendarCard.css'
import { getAnnouncements } from '../../../lib/api'
import type { Announcement } from '../../../types'
import { format, isSameDay, parseISO } from 'date-fns'
import { cn } from '../../../lib/utils'
import { useAuthContext } from '../../../context/AuthContext'

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

const CalendarCard: React.FC = () => {
    const { user } = useAuthContext()
    const isAdmin = user?.role === 'ADMIN'
    const [value, onChange] = useState<Value>(new Date())
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await getAnnouncements()
                if (response.data.success) {
                    setAnnouncements(response.data.data)
                }
            } catch (error) {
                console.error('Error fetching announcements:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchAnnouncements()
    }, [])

    const getAnnouncementsForDate = (date: Date) => {
        return announcements.filter(ann => {
            if (!ann.start_date) return false
            const startDate = parseISO(ann.start_date)
            return isSameDay(date, startDate)
        })
    }

    const tileClassName = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            const dayAnnouncements = getAnnouncementsForDate(date)
            if (dayAnnouncements.length > 0) {
                return 'highlight-announcement'
            }
        }
        return null
    }

    const selectedDate = value instanceof Date ? value : Array.isArray(value) ? value[0] : null

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Announcements & Calendar</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="p-4 border-b border-gray-50 shrink-0">
                <Calendar
                    onChange={onChange}
                    value={value}
                    tileClassName={tileClassName}
                />
            </div>

            {/* Announcements List */}
            <div className="px-5 py-4 bg-gray-50/50 flex-1 overflow-y-auto min-h-0 max-h-100">
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50/50 py-1 z-10 backdrop-blur-sm">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5" />
                        All Announcements
                    </h4>
                    <Link to={user?.role === 'ADMIN' ? "/dashboard/admin/announcements" : "/dashboard/announcements"} className="text-xs text-violet-600 font-medium hover:underline">
                        View All
                    </Link>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <p className="text-xs text-gray-400 text-center py-4">Loading...</p>
                    ) : announcements.length > 0 ? (
                        announcements.map(ann => {
                            const isForSelectedDate = selectedDate && ann.start_date && isSameDay(selectedDate, parseISO(ann.start_date));
                            return (
                                <Link
                                    key={ann.id}
                                    to={`/dashboard/announcements/${ann.id}`}
                                    className={cn(
                                        "block p-3 rounded-lg border transition-all shadow-sm group",
                                        isForSelectedDate
                                            ? "bg-violet-50 border-violet-200 ring-1 ring-violet-200"
                                            : "bg-white border-gray-100 hover:border-violet-200"
                                    )}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className={cn(
                                                    "text-xs font-semibold truncate group-hover:text-violet-600",
                                                    isForSelectedDate ? "text-violet-700" : "text-gray-900"
                                                )}>
                                                    {ann.title}
                                                </h5>
                                                {ann.start_date && (
                                                    <span className="text-[9px] font-medium text-gray-400 whitespace-nowrap">
                                                        {format(parseISO(ann.start_date), 'MMM dd')}
                                                    </span>
                                                )}
                                                {isAdmin && !ann.is_visible && (
                                                    <span className="text-[8px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded uppercase ml-auto shrink-0">Hidden</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 line-clamp-1">
                                                {ann.content.replace(/<[^>]*>/g, '')}
                                            </p>
                                        </div>
                                        <ChevronRight className={cn(
                                            "w-3.5 h-3.5 mt-0.5 transition-colors",
                                            isForSelectedDate ? "text-violet-400" : "text-gray-300 group-hover:text-violet-400"
                                        )} />
                                    </div>
                                </Link>
                            )
                        })
                    ) : (
                        <p className="text-xs text-gray-400 italic text-center py-4 bg-white rounded-lg border border-dashed border-gray-200">
                            No announcements available.
                        </p>
                    )}
                </div>
            </div>

            {/* Admin Create Link */}
            {isAdmin && (
                <div className="px-5 py-3 border-t border-gray-100 bg-white shrink-0">
                    <Link
                        to="/dashboard/admin/announcements"
                        className="flex items-center justify-between text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors group"
                    >
                        Create New Announcement
                        <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    </Link>
                </div>
            )}
        </div>
    )
}

export default CalendarCard
