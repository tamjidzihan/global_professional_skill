import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Briefcase,
    MapPin,
    Clock,
    Calendar,
    ArrowLeft,
    Send,
    CheckCircle,
    Heart,
    Award
} from 'lucide-react';
import { getJobDetail } from '../../lib/api';
import type { Job } from '../../types';
import { formatDate } from 'date-fns';
import { toast } from 'react-hot-toast';
import JobApplicationModal from '../components/JobApplicationModal';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from '../components/Breadcrumb';
import SEO from '../components/SEO';

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
            <div className="bg-[#FCF8F1] min-h-screen flex justify-center items-center">
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
        <div className="bg-[#FCF8F1]">
            <SEO
                title={`${job.title} | Careers at GPI`}
                description={`Apply for ${job.title} position at GPI. ${job.description?.substring(0, 150)}`}
                keywords={`${job.title}, career, job, GPI careers`}
            />
            <Breadcrumb name={job.title} />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/careers')}
                        className="flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors group font-medium"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to All Jobs
                    </button>

                    {/* Job Header Card */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border-2 border-gray-200 hover:border-blue-400 transition-all duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                                    {job.title}
                                </h1>
                                <div className="flex flex-wrap gap-3 text-gray-600">
                                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                                        <Briefcase className="h-4 w-4 text-blue-600" />
                                        <span className="font-semibold">{getJobTypeLabel(job.job_type)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        <span className="font-semibold">{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <span className="font-semibold">Posted {formatDate(new Date(job.created_at), 'PPP')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-auto">
                                {user ? (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        disabled={job.is_expired}
                                        className={`w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg cursor-pointer ${job.is_expired
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-linear-to-r from-blue-600 to-purple-600 hover:shadow-2xl hover:scale-105 active:scale-95'
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
                            <div className="mt-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl w-fit border border-red-200">
                                <Calendar className="h-4 w-4" />
                                <span className="font-semibold">
                                    Application Deadline: {formatDate(new Date(job.closing_date), 'PPP')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Job Content */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-200">
                        <div className="prose prose-blue max-w-none">
                            <section className="mb-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200 inline-block">
                                    About the Role
                                </h2>
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mt-4">
                                    {job.description}
                                </div>
                            </section>

                            <section className="mb-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-200 inline-block">
                                    Requirements
                                </h2>
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mt-4">
                                    {job.requirements}
                                </div>
                            </section>
                        </div>

                        {/* Salary & Benefits */}
                        {job.salary_range && (
                            <div className="mt-10 p-6 bg-linear-to-br from-green-50 to-white rounded-2xl border-2 border-green-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Award className="h-6 w-6 text-green-600" />
                                    <h3 className="text-lg font-bold text-green-800">Compensation</h3>
                                </div>
                                <p className="text-2xl font-extrabold text-green-600">{job.salary_range}</p>
                            </div>
                        )}

                        {/* Why Join GPI */}
                        <div className="mt-10 p-6 bg-linear-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-200">
                            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Why Join GPI?
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-gray-700">Competitive Salary Package</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-gray-700">Health & Wellness Benefits</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-gray-700">Professional Development</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-gray-700">Flexible Work Environment</span>
                                </div>
                            </div>
                        </div>
                    </div>
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