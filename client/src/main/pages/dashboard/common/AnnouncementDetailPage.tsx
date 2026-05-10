import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, User, Clock, Bell, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getAnnouncementDetail } from '../../../../lib/api';
import type { Announcement } from '../../../../types';
import SEO from '../../../components/SEO';
import { useAuthContext } from '../../../../context/AuthContext';

const AnnouncementDetailPage: React.FC = () => {
    const { user } = useAuthContext();
    const { id } = useParams<{ id: string }>();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                const response = await getAnnouncementDetail(id);
                if (response.data.success) {
                    setAnnouncement(response.data.data);
                } else {
                    setError('Announcement not found');
                }
            } catch (err) {
                console.error('Error fetching announcement:', err);
                setError('Failed to load announcement details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="py-6 px-4 md:px-6">
                <SEO title="Announcement Details" noindex={true} />
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <div className="animate-pulse h-5 w-32 bg-gray-100 rounded" />
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="animate-pulse space-y-3">
                            <div className="h-7 w-3/4 bg-gray-100 rounded" />
                            <div className="flex gap-4">
                                <div className="h-4 w-32 bg-gray-100 rounded" />
                                <div className="h-4 w-40 bg-gray-100 rounded" />
                            </div>
                            <div className="space-y-2 pt-4">
                                <div className="h-3 w-full bg-gray-100 rounded" />
                                <div className="h-3 w-full bg-gray-100 rounded" />
                                <div className="h-3 w-2/3 bg-gray-100 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !announcement) {
        return (
            <div className="py-6 px-4 md:px-6">
                <SEO title="Announcement Not Found" noindex={true} />
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{error || 'Announcement not found'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">The announcement you're looking for doesn't exist or has been removed.</p>
                    <Link
                        to="/dashboard/announcements"
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to {user?.role === 'ADMIN' ? ' Announcements Management' : 'Announcements'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title={announcement.title} noindex={true} />

            {/* Back Button */}
            <Link
                to={user?.role === 'ADMIN' ? '/dashboard/admin/announcements' : '/dashboard/announcements'}
                className="inline-flex items-center gap-1.5 mb-4 text-xs font-semibold text-gray-400 hover:text-violet-600 transition-colors"
            >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to {user?.role === 'ADMIN' ? ' Announcements Management' : 'Announcements'}
            </Link>

            {/* Main Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header Section */}
                <div className="border-b border-gray-100 px-6 py-5 sm:px-8 sm:py-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center">
                            <Bell className="w-3.5 h-3.5 text-violet-500" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                            Announcement
                        </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight mb-4">
                        {announcement.title}
                    </h1>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Posted on {format(parseISO(announcement.created_at), 'MMMM dd, yyyy')}</span>
                        </div>
                        {announcement.created_by_detail && (
                            <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                <span>By {announcement.created_by_detail.full_name || announcement.created_by_detail.email}</span>
                            </div>
                        )}
                        {announcement.start_date && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Event Date: {format(parseISO(announcement.start_date), 'MMMM dd, yyyy')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="px-6 py-8 sm:px-8 sm:py-10">
                    <div
                        className="prose prose-sm prose-violet max-w-none text-gray-600 leading-relaxed announcement-content"
                        dangerouslySetInnerHTML={{ __html: announcement.content }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetailPage;