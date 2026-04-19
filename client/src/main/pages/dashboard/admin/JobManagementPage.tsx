import { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Edit, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs, deleteJob } from '../../../../lib/api';
import type { Job } from '../../../../types';
import { formatDate } from 'date-fns';
import { toast } from 'react-hot-toast';
import JobFormModal from '../../../../main/components/dashboard/admin/JobFormModal';

const JobManagementPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await getJobs({
                search: searchTerm,
                job_type: selectedType,
            });
            setJobs(response.data.results);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            toast.error('Failed to load job postings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchJobs, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedType]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this job posting?')) return;

        try {
            await deleteJob(id);
            toast.success('Job posting deleted successfully.');
            fetchJobs();
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete job posting.');
        }
    };

    const handleEdit = (job: Job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedJob(null);
        setIsModalOpen(true);
    };

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
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
                    <p className="text-gray-600">Post and manage career opportunities.</p>
                </div>
                <button 
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="h-5 w-5" />
                    Create New Job
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="FULL_TIME">Full-time</option>
                        <option value="PART_TIME">Part-time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                    </select>
                </div>
            </div>

            {/* Job Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Job Title</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{job.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                <span>{job.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600">{getJobTypeLabel(job.job_type)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600">{formatDate(new Date(job.created_at), 'MMM d, yyyy')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {job.is_active ? (
                                                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">Inactive</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link 
                                                    to={`/dashboard/admin/careers/${job.id}/applications`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                                    title="View Applications"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </Link>
                                                <button 
                                                    onClick={() => handleEdit(job)}
                                                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" 
                                                    title="Edit Job"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(job.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                                    title="Delete Job"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No job postings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <JobFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchJobs}
                job={selectedJob}
            />
        </div>
    );
};

export default JobManagementPage;
