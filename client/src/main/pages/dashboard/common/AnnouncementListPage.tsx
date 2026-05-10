import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, ChevronRight, Search, Megaphone } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getAnnouncements } from '../../../../lib/api';
import type { Announcement } from '../../../../types';
import SEO from '../../../components/SEO';

const AnnouncementListPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await getAnnouncements();
                if (response.data.success) {
                    setAnnouncements(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching announcements:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    const filteredAnnouncements = announcements.filter(ann =>
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats for header
    const stats = [
        {
            label: 'Total Announcements',
            value: announcements.length,
            icon: Megaphone,
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-500',
        },
        {
            label: 'Showing',
            value: filteredAnnouncements.length,
            icon: Bell,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
        },
    ];

    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title="Announcements" noindex={true} />

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-5 h-5 text-violet-500" />
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Announcements</h1>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">Stay updated with the latest news and events from the platform.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-medium">{label}</p>
                                <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
                            </div>
                            <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                                <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                {/* Card Header with Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">All Announcements</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {filteredAnnouncements.length} of {announcements.length} announcements
                        </p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search announcements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44 md:w-64"
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="py-20">
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="px-5 py-4 border-b border-gray-50">
                                    <div className="animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-32 bg-gray-100 rounded" />
                                                <div className="h-4 w-3/4 bg-gray-100 rounded" />
                                                <div className="h-3 w-full bg-gray-100 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : filteredAnnouncements.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {filteredAnnouncements.map((ann) => (
                            <Link
                                key={ann.id}
                                to={`/dashboard/announcements/${ann.id}`}
                                className="group block px-5 py-4 hover:bg-gray-50/60 transition-colors duration-100"
                            >
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    {/* Date Badge */}
                                    <div className="shrink-0 w-14 h-14 bg-violet-50 rounded-xl flex flex-col items-center justify-center group-hover:bg-violet-100 transition-colors">
                                        <span className="text-[10px] font-bold uppercase text-violet-600">
                                            {format(parseISO(ann.created_at), 'MMM')}
                                        </span>
                                        <span className="text-base font-extrabold text-violet-600">
                                            {format(parseISO(ann.created_at), 'dd')}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            <span className="text-[11px] font-medium text-gray-400">
                                                Posted on {format(parseISO(ann.created_at), 'MMMM dd, yyyy')}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-800 group-hover:text-violet-600 transition-colors mb-1.5">
                                            {ann.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                            {ann.content.replace(/<[^>]*>/g, '')}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <div className="self-center hidden sm:block">
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-5 h-5 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">No announcements found</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {searchTerm ? 'Try adjusting your search' : 'No announcements available at this time'}
                        </p>
                    </div>
                )}

                {/* Footer (only if there are filtered results) */}
                {filteredAnnouncements.length > 0 && !loading && (
                    <div className="px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Showing {filteredAnnouncements.length} of {announcements.length} announcements
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementListPage;