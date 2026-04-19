/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Clock, Filter, Briefcase, ArrowLeft
} from 'lucide-react';
import { getApplications, updateApplicationStatus, getJobDetail } from '../../../../lib/api';
import type { JobApplication, Job, JobApplicationStatus } from '../../../../types';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import SEO from '../../../components/SEO';
import StatusBadge from '../../../components/dashboard/admin/StatusBadge';
import ApplicationDetailModal from '../../../components/dashboard/admin/ApplicationDetailModal';

const STATUS_TABS: { value: string; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'REVIEWED', label: 'Reviewed' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
];

const JobApplicationsPage = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (jobId) params.job = jobId;
            if (statusFilter) params.status = statusFilter;
            const [appsRes, jobRes] = await Promise.all([
                getApplications(params),
                jobId ? getJobDetail(jobId) : Promise.resolve(null),
            ]);
            setApplications(appsRes.data.results);
            if (jobRes) setJob(jobRes.data);
        } catch {
            toast.error('Failed to load applications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [jobId, statusFilter]);

    const handleStatusUpdate = async (id: string, newStatus: JobApplicationStatus) => {
        try {
            await updateApplicationStatus(id, newStatus);
            toast.success(`Marked as ${newStatus.toLowerCase()}`);
            fetchData();
        } catch {
            toast.error('Failed to update status.');
        }
    };

    const openApplicationModal = (application: JobApplication) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedApplication(null);
    };

    // ── shared tokens ──────────────────────────────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm';
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100';

    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title="Job Applications" />

            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard/admin/careers')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                            {job ? `Applications: ${job.title}` : 'All Applications'}
                        </h1>
                        <p className="text-sm text-gray-400 mt-0.5">Review and manage candidate submissions</p>
                    </div>
                </div>
            </div>

            {/* Main card */}
            <div className={card}>
                {/* Header */}
                <div className={`${cardHeader} flex-col sm:flex-row gap-3`}>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Applications</p>
                        <p className="text-xs text-gray-400 mt-0.5">{applications.length} total</p>
                    </div>
                    <div className="relative sm:ml-auto">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                        >
                            {STATUS_TABS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Status tab pills */}
                <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-100 overflow-x-auto">
                    {STATUS_TABS.map(({ value, label }) => {
                        const active = statusFilter === value;
                        return (
                            <button
                                key={value}
                                onClick={() => setStatusFilter(value)}
                                className={`inline-flex items-center px-3 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${active
                                    ? value === ''
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'bg-gray-200 text-gray-900 shadow-sm'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="p-4">
                    {loading ? (
                        <div className="space-y-2.5">
                            {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-22 bg-gray-50 rounded-lg border border-gray-100" />)}
                        </div>
                    ) : applications.length > 0 ? (
                        <div className="space-y-2.5">
                            {applications.map(app => (
                                <div
                                    key={app.id}
                                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-white transition-all duration-150 cursor-pointer"
                                    onClick={() => openApplicationModal(app)}
                                >
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0">
                                        {app.user_email.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{app.user_email}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(app.applied_at), 'MMM d, yyyy')}
                                            </span>
                                            {!jobId && app.job_title && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                                                    <Briefcase className="w-2.5 h-2.5" /> {app.job_title}
                                                </span>
                                            )}
                                        </div>

                                        {app.cover_letter && (
                                            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{app.cover_letter}</p>
                                        )}
                                    </div>

                                    {/* Status + Actions */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <StatusBadge status={app.status} />

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            <a
                                                href={app.cv_file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2 py-1 text-[12px] font-medium rounded-lg bg-gray-100 border border-gray-200 text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Download CV
                                            </a>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openApplicationModal(app);
                                                }}
                                                className="px-2 py-1 text-[12px] font-medium rounded-lg bg-gray-100 border border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors cursor-pointer"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusUpdate(app.id, 'ACCEPTED');
                                                }}
                                                className="px-2 py-1 text-[12px] font-medium rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusUpdate(app.id, 'REJECTED');
                                                }}
                                                className="px-2 py-1 text-[12px] font-medium rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                                <User className="w-5 h-5 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">No applications found</p>
                            <p className="text-xs text-gray-400 mt-0.5">There are currently no submissions for this criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Detail Modal */}
            <ApplicationDetailModal
                application={selectedApplication}
                isOpen={isModalOpen}
                onClose={closeModal}
                onStatusUpdate={handleStatusUpdate}
            />
        </div>
    );
};

export default JobApplicationsPage;