import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createJob, updateJob } from '../../../../lib/api';
import type { Job, JobCreateUpdateData, JobType } from '../../../../types';
import { toast } from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    job?: Job | null;
}

const JobFormModal = ({ isOpen, onClose, onSuccess, job }: Props) => {
    const [formData, setFormData] = useState<JobCreateUpdateData>({
        title: '',
        description: '',
        requirements: '',
        location: 'Remote',
        job_type: 'FULL_TIME',
        salary_range: '',
        closing_date: '',
        is_active: true,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title,
                description: job.description,
                requirements: job.requirements,
                location: job.location,
                job_type: job.job_type,
                salary_range: job.salary_range || '',
                closing_date: job.closing_date || '',
                is_active: job.is_active,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                requirements: '',
                location: 'Remote',
                job_type: 'FULL_TIME',
                salary_range: '',
                closing_date: '',
                is_active: true,
            });
        }
    }, [job, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (job) {
                await updateJob(job.id, formData);
                toast.success('Job updated successfully');
            } else {
                await createJob(formData);
                toast.success('Job created successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Job operation failed:', error);
            toast.error('Failed to save job posting.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">{job ? 'Edit Job' : 'Create New Job'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Job Title *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Job Type *</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.job_type}
                                onChange={(e) => setFormData({ ...formData, job_type: e.target.value as JobType })}
                            >
                                <option value="FULL_TIME">Full-time</option>
                                <option value="PART_TIME">Part-time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="INTERNSHIP">Internship</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Location *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Salary Range</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. $50k - $70k"
                                value={formData.salary_range}
                                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Closing Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.closing_date || ''}
                                onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Job Description *</label>
                            <textarea
                                required
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Requirements *</label>
                            <textarea
                                required
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                value={formData.requirements}
                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="is_active" className="text-sm font-bold text-gray-700">Active / Published</label>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg disabled:bg-gray-400"
                        >
                            {submitting ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobFormModal;
