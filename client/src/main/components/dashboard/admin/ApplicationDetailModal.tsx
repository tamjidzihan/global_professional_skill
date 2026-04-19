import { X, FileText, Briefcase, Clock, ExternalLink, Phone } from 'lucide-react';
import { format } from 'date-fns';
import type { JobApplication, JobApplicationStatus } from '../../../../types';
import StatusBadge from './StatusBadge';

interface ApplicationDetailModalProps {
    application: JobApplication | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate: (id: string, status: JobApplicationStatus) => void;
}

const ApplicationDetailModal = ({
    application,
    isOpen,
    onClose,
    onStatusUpdate
}: ApplicationDetailModalProps) => {
    if (!isOpen || !application) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Review candidate's full application</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Candidate Header */}
                        <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-sm overflow-hidden shrink-0 border border-gray-100">
                                {application.user_picture ? (
                                    <img src={application.user_picture} alt={application.user_full_name} className="w-full h-full object-cover" />
                                ) : (
                                    (application.user_full_name || application.user_email).charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-gray-900 truncate">
                                    {application.user_full_name || 'No Name Provided'}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">{application.user_email} {application.user_phone && `• ${application.user_phone}`}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        Applied {format(new Date(application.applied_at), 'MMMM d, yyyy h:mm a')}
                                    </span>
                                    <StatusBadge status={application.status} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Job Info */}
                            {application.job_title && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        Position Applied For
                                    </h4>
                                    <p className="text-gray-900 font-semibold">{application.job_title}</p>
                                </div>
                            )}

                            {/* Contact Info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5" />
                                    Contact Number
                                </h4>
                                <p className="text-gray-900 font-semibold">{application.user_phone || 'Not provided'}</p>
                            </div>
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Cover Letter
                            </h4>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {application.cover_letter || "No cover letter provided."}
                                </p>
                            </div>
                        </div>

                        {/* CV / Resume */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                CV / Resume
                            </h4>
                            <a
                                href={application.cv_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors text-sm font-medium"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Full CV
                            </a>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Update Application Status</h4>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        onStatusUpdate(application.id, 'REVIEWED');
                                        onClose();
                                    }}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                >
                                    Mark as Reviewed
                                </button>
                                <button
                                    onClick={() => {
                                        onStatusUpdate(application.id, 'ACCEPTED');
                                        onClose();
                                    }}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                >
                                    Accept Application
                                </button>
                                <button
                                    onClick={() => {
                                        onStatusUpdate(application.id, 'REJECTED');
                                        onClose();
                                    }}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                                >
                                    Reject Application
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailModal;