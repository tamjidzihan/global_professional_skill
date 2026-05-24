import React from 'react';
import { X, Calendar, User, Clock, Eye, EyeOff, Megaphone } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Announcement } from '../../../../types';
import { Link } from 'react-router-dom';

interface AnnouncementDetailModalProps {
    announcement: Announcement;
    onClose: () => void;
    onEdit?: (announcement: Announcement) => void; // Add optional onEdit prop
}

const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
    announcement,
    onClose,
    onEdit // Receive onEdit from parent
}) => {
    const handleEditClick = () => {
        if (onEdit) {
            onEdit(announcement); // Pass the announcement to the parent's handleOpenModal
            onClose(); // Close the detail modal
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Announcement Details</h2>
                        <p className="text-xs text-gray-400 mt-0.5">View complete announcement information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className='flex flex-wrap gap-2'>
                            {announcement.is_visible ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700">
                                    <Eye className="w-3.5 h-3.5" /> Visible
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-600">
                                    <EyeOff className="w-3.5 h-3.5" /> Hidden
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-violet-50 text-violet-700">
                                <Megaphone className="w-3.5 h-3.5" /> Site-wide
                            </span>
                        </div>

                        {/* Action Buttons - Separated with better styling */}
                        <div className='flex flex-wrap gap-2'>
                            <Link
                                to={`/dashboard/announcements/${announcement.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                                View Details
                            </Link>
                            <button
                                onClick={handleEditClick}
                                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer"
                            >
                                Edit Announcement
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight leading-tight">
                            {announcement.title}
                        </h3>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-y border-gray-100">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Created By</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <User className="w-3 h-3 text-gray-400" />
                                <span>{announcement.created_by_detail?.full_name || announcement.created_by_detail?.email || 'System Admin'}</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Created Date</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span>{format(parseISO(announcement.created_at), 'MMM dd, yyyy HH:mm')}</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Start Date</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Clock className="w-3 h-3 text-violet-400" />
                                <span>{announcement.start_date ? format(parseISO(announcement.start_date), 'MMM dd, yyyy HH:mm') : 'Immediate'}</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">End Date</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Clock className="w-3 h-3 text-rose-400" />
                                <span>{announcement.end_date ? format(parseISO(announcement.end_date), 'MMM dd, yyyy HH:mm') : 'Never'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Announcement Content</p>
                        <div
                            className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-100 prose prose-sm prose-violet max-w-none"
                            dangerouslySetInnerHTML={{ __html: announcement.content }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetailModal;