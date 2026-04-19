import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FileText, 
    Download, 
    ExternalLink, 
    User, 
    Mail, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Loader2,
    ArrowLeft,
    Filter
} from 'lucide-react';
import { getApplications, updateApplicationStatus, getJobDetail } from '../../../../lib/api';
import type { JobApplication, Job, JobApplicationStatus } from '../../../../types';
import { formatDate } from 'date-fns';
import { toast } from 'react-hot-toast';

const JobApplicationsPage = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (jobId) params.job = jobId;
            if (statusFilter) params.status = statusFilter;

            const [appsResponse, jobResponse] = await Promise.all([
                getApplications(params),
                jobId ? getJobDetail(jobId) : Promise.resolve(null)
            ]);

            setApplications(appsResponse.data.results);
            if (jobResponse) setJob(jobResponse.data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            toast.error('Failed to load applications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [jobId, statusFilter]);

    const handleStatusUpdate = async (id: string, newStatus: JobApplicationStatus) => {
        try {
            await updateApplicationStatus(id, newStatus);
            toast.success(`Application marked as ${newStatus.toLowerCase()}`);
            fetchData();
        } catch (error) {
            console.error('Status update failed:', error);
            toast.error('Failed to update application status.');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
            case 'REVIEWED':
                return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">Reviewed</span>;
            case 'ACCEPTED':
                return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Accepted</span>;
            case 'REJECTED':
                return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>;
            default:
                return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/dashboard/admin/careers')}
                        className="flex items-center text-sm text-gray-600 hover:text-blue-600 mb-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Jobs
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {job ? `Applications for ${job.title}` : 'All Job Applications'}
                    </h1>
                    <p className="text-gray-600">Review and manage candidate submissions.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Filter className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <select
                            className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm min-w-[150px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWED">Reviewed</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Application Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
            ) : applications.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {applications.map((app) => (
                        <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-blue-200 transition-colors">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    {/* Applicant Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                {app.user_email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{app.user_email}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Clock className="h-4 w-4" />
                                                    Applied on {formatDate(new Date(app.applied_at), 'PPP')}
                                                </div>
                                            </div>
                                        </div>

                                        {!jobId && (
                                            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-100">
                                                <FileText className="h-4 w-4" />
                                                Applied for: {app.job_title}
                                            </div>
                                        )}

                                        {app.cover_letter && (
                                            <div className="mt-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cover Letter</h4>
                                                <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-3 hover:line-clamp-none transition-all">
                                                    {app.cover_letter}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex flex-col sm:flex-row lg:flex-col justify-between gap-4 sm:items-center lg:items-end lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                                        <div className="space-y-2 text-right w-full sm:w-auto lg:w-full">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
                                            {getStatusBadge(app.status)}
                                        </div>

                                        <div className="flex flex-wrap gap-2 justify-end w-full">
                                            <a
                                                href={app.cv_file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-bold"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download CV
                                            </a>
                                            
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Accept"
                                                >
                                                    <CheckCircle className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Reject"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(app.id, 'REVIEWED')}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Mark as Reviewed"
                                                >
                                                    <ExternalLink className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <User className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">No applications found</h3>
                    <p className="text-gray-500 mt-2">There are currently no submissions for this criteria.</p>
                </div>
            )}
        </div>
    );
};

export default JobApplicationsPage;
