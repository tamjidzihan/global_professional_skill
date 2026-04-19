import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Calendar, ArrowLeft, Send } from 'lucide-react';
import { getJobDetail } from '../../lib/api';
import type { Job } from '../../types';
import { formatDate } from 'date-fns';
import { toast } from 'react-hot-toast';
import JobApplicationModal from '../components/JobApplicationModal';
import { useAuth } from '../../hooks/useAuth';

const JobDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await getJobDetail(id);
                setJob(response.data);
            } catch (error) {
                console.error('Failed to fetch job details:', error);
                toast.error('Failed to load job details.');
                navigate('/careers');
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!job) return null;

    const getJobTypeLabel = (type: string) => {
        switch (type) {
            case 'FULL_TIME': return 'Full-time';
            case 'PART_TIME': return 'Part-time';
            case 'CONTRACT': return 'Contract';
            case 'INTERNSHIP': return 'Internship';
            default: return type;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/careers')}
                    className="flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors group"
                >
                    <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to All Jobs
                </button>

                {/* Job Header Card */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{job.title}</h1>
                            <div className="flex flex-wrap gap-6 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium">{getJobTypeLabel(job.job_type)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium">{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium">Posted {formatDate(new Date(job.created_at), 'PPP')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            {user ? (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={job.is_expired}
                                    className={`w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                                        job.is_expired 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'
                                    }`}
                                >
                                    <Send className="h-5 w-5" />
                                    {job.is_expired ? 'Application Closed' : 'Apply Now'}
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    state={{ from: `/careers/${job.id}` }}
                                    className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                                >
                                    Login to Apply
                                </Link>
                            )}
                        </div>
                    </div>

                    {job.closing_date && (
                        <div className="mt-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg w-fit">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-semibold">
                                Application Deadline: {formatDate(new Date(job.closing_date), 'PPP')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Job Content */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <div className="prose prose-blue max-w-none">
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">About the Role</h2>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Requirements</h2>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {job.requirements}
                            </div>
                        </section>
                    </div>

                    {/* Salary & Benefits (Optional) */}
                    {job.salary_range && (
                        <div className="mt-10 p-6 bg-green-50 rounded-xl border border-green-100">
                            <h3 className="text-lg font-bold text-green-800 mb-2">Compensation</h3>
                            <p className="text-2xl font-extrabold text-green-600">{job.salary_range}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Modal */}
            <JobApplicationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                jobId={job.id}
                jobTitle={job.title}
            />
        </div>
    );
};

export default JobDetailPage;
