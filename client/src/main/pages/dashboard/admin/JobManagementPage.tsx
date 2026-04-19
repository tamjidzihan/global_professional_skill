/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Edit, Trash2, Eye, Filter, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getJobs, deleteJob } from '../../../../lib/api';
import type { Job } from '../../../../types';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import JobFormModal from '../../../../main/components/dashboard/admin/JobFormModal';
import SEO from '../../../components/SEO';

const JOB_TYPES: { value: string; label: string }[] = [
    { value: '', label: 'All Types' },
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
];

const jobTypeBadge: Record<string, string> = {
    FULL_TIME: 'bg-blue-50 text-blue-700',
    PART_TIME: 'bg-violet-50 text-violet-700',
    CONTRACT: 'bg-amber-50 text-amber-700',
    INTERNSHIP: 'bg-emerald-50 text-emerald-700',
};

function getJobTypeLabel(type: string) {
    return JOB_TYPES.find(t => t.value === type)?.label || type;
}

const JobManagementPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await getJobs({ search: searchTerm, job_type: selectedType });
            setJobs(response.data.results);
        } catch {
            toast.error('Failed to load job postings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchJobs, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedType]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this job posting?')) return;
        try {
            await deleteJob(id);
            toast.success('Job deleted.');
            fetchJobs();
        } catch {
            toast.error('Failed to delete.');
        }
    };

    // ── shared tokens ──────────────────────────────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm';
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100';

    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title="Job Management" />

            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Job Management</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Post and manage career opportunities</p>
                </div>
                <button
                    onClick={() => { setSelectedJob(null); setIsModalOpen(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors cursor-pointer shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Create Job
                </button>
            </div>

            {/* Table card */}
            <div className={card}>
                {/* Header */}
                <div className={`${cardHeader} flex-col sm:flex-row gap-3`}>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Job Postings</p>
                        <p className="text-xs text-gray-400 mt-0.5">{jobs.length} total</p>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44"
                            />
                        </div>
                        {/* Type filter */}
                        <div className="relative">
                            <select
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                            >
                                {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {['Job Title', 'Location', 'Type', 'Created', 'Status', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-5 py-3">
                                            <div className="animate-pulse h-10 bg-gray-50 rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : jobs.length > 0 ? (
                                jobs.map(job => (
                                    <tr key={job.id} className="group hover:bg-gray-50/60 transition-colors duration-100">

                                        {/* Title */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <Link
                                                to={`/dashboard/admin/careers/${job.id}/applications`}
                                                title="View Applications">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                                                        <Briefcase className="w-4 h-4 text-violet-600" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-800">{job.title}</p>
                                                </div>
                                            </Link>
                                        </td>

                                        {/* Location */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                                {job.location}
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded-md ${jobTypeBadge[job.job_type] || 'bg-gray-50 text-gray-600'}`}>
                                                {getJobTypeLabel(job.job_type)}
                                            </span>
                                        </td>

                                        {/* Created */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <p className="text-xs text-gray-500">{format(new Date(job.created_at), 'MMM d, yyyy')}</p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md ${job.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${job.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                {job.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/dashboard/admin/careers/${job.id}/applications`}
                                                    title="View Applications"
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    onClick={() => { setSelectedJob(job); setIsModalOpen(true); }}
                                                    title="Edit"
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors cursor-pointer"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    title="Delete"
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-14 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <Briefcase className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No job postings found</p>
                                        <p className="text-xs text-gray-400 mt-0.5 mb-4">Create your first job posting to get started</p>
                                        <button
                                            onClick={() => { setSelectedJob(null); setIsModalOpen(true); }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Create Job
                                        </button>
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