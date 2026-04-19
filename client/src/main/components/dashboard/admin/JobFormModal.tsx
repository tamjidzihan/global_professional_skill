import React, { useState, useEffect } from 'react';
import { X, Briefcase, Save } from 'lucide-react';
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
        title: '', description: '', requirements: '',
        location: 'Remote', job_type: 'FULL_TIME',
        salary_range: '', closing_date: '', is_active: true,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title, description: job.description,
                requirements: job.requirements, location: job.location,
                job_type: job.job_type, salary_range: job.salary_range || '',
                closing_date: job.closing_date || '', is_active: job.is_active,
            });
        } else {
            setFormData({ title: '', description: '', requirements: '', location: 'Remote', job_type: 'FULL_TIME', salary_range: '', closing_date: '', is_active: true });
        }
    }, [job, isOpen]);

    // Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose, submitting]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (job) { await updateJob(job.id, formData); toast.success('Job updated!'); }
            else { await createJob(formData); toast.success('Job created!'); }
            onSuccess();
            onClose();
        } catch {
            toast.error('Failed to save job posting.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = 'w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all';
    const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5';

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => !submitting && onClose()} />

            {/* Centered modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-2xl rounded-xl border border-gray-100 shadow-2xl flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{job ? 'Edit Job' : 'Create New Job'}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{job ? 'Update job posting details' : 'Fill in the details for the new position'}</p>
                            </div>
                        </div>
                        <button onClick={() => !submitting && onClose()} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Form body */}
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">

                            {/* Row 1: title */}
                            <div>
                                <label className={labelCls}>Job Title <span className="text-rose-400 normal-case">*</span></label>
                                <input
                                    type="text" required value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Senior Software Engineer"
                                    className={inputCls} disabled={submitting} autoFocus
                                />
                            </div>

                            {/* Row 2: type + location */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Job Type <span className="text-rose-400 normal-case">*</span></label>
                                    <select
                                        value={formData.job_type}
                                        onChange={e => setFormData({ ...formData, job_type: e.target.value as JobType })}
                                        className={`${inputCls} appearance-none cursor-pointer`}
                                        disabled={submitting}
                                    >
                                        <option value="FULL_TIME">Full-time</option>
                                        <option value="PART_TIME">Part-time</option>
                                        <option value="CONTRACT">Contract</option>
                                        <option value="INTERNSHIP">Internship</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Location <span className="text-rose-400 normal-case">*</span></label>
                                    <input
                                        type="text" required value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Remote / Dhaka"
                                        className={inputCls} disabled={submitting}
                                    />
                                </div>
                            </div>

                            {/* Row 3: salary + closing date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Salary Range</label>
                                    <input
                                        type="text" value={formData.salary_range}
                                        onChange={e => setFormData({ ...formData, salary_range: e.target.value })}
                                        placeholder="e.g. ৳50k–70k / month"
                                        className={inputCls} disabled={submitting}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Closing Date</label>
                                    <input
                                        type="date" value={formData.closing_date || ''}
                                        onChange={e => setFormData({ ...formData, closing_date: e.target.value })}
                                        className={inputCls} disabled={submitting}
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-100" />

                            {/* Description */}
                            <div>
                                <label className={labelCls}>Job Description <span className="text-rose-400 normal-case">*</span></label>
                                <textarea
                                    required rows={4} value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                                    className={`${inputCls} resize-none`} disabled={submitting}
                                />
                            </div>

                            {/* Requirements */}
                            <div>
                                <label className={labelCls}>Requirements <span className="text-rose-400 normal-case">*</span></label>
                                <textarea
                                    required rows={4} value={formData.requirements}
                                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                    placeholder="List the skills, experience, and qualifications required..."
                                    className={`${inputCls} resize-none`} disabled={submitting}
                                />
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <input
                                    id="is_active" type="checkbox"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 mt-0.5 text-violet-600 border-gray-300 rounded cursor-pointer" disabled={submitting}
                                />
                                <div>
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-800 cursor-pointer">Active / Published</label>
                                    <p className="text-xs text-gray-400 mt-0.5">Make this job visible to applicants on the careers page</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2.5">
                            <button
                                type="button" onClick={onClose} disabled={submitting}
                                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit" disabled={submitting}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                            >
                                {submitting ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4" />{job ? 'Update Job' : 'Create Job'}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default JobFormModal;