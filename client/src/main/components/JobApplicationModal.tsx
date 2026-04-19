import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import { applyForJob } from '../../lib/api';
import { toast } from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    jobTitle: string;
}

const JobApplicationModal = ({ isOpen, onClose, jobId, jobTitle }: Props) => {
    const [file, setFile] = useState<File | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                toast.error('Only PDF files are allowed.');
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error('File size cannot exceed 5MB.');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please upload your CV.');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('job', jobId);
            formData.append('cv_file', file);
            formData.append('cover_letter', coverLetter);

            await applyForJob(formData);
            setSubmitted(true);
            toast.success('Application submitted successfully!');
        } catch (error: any) {
            console.error('Application failed:', error);
            const message = error.response?.data?.non_field_errors?.[0] || 'Failed to submit application.';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Received!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for applying for the <strong>{jobTitle}</strong> position. Our team will review your application and get back to you soon.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Apply for {jobTitle}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Resume/CV (PDF only, max 5MB) *
                            </label>
                            <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'}`}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <FileText className="h-10 w-10 text-green-600 mb-2" />
                                        <span className="text-sm font-medium text-green-800">{file.name}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setFile(null)}
                                            className="mt-2 text-xs text-red-500 hover:underline"
                                        >
                                            Remove and change
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">Click or drag and drop to upload your CV</span>
                                        <span className="text-xs text-gray-400 mt-1">PDF format required</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Cover Letter / Additional Information
                            </label>
                            <textarea
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Tell us why you're a great fit for this role..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="mt-8 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !file}
                            className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                                submitting || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobApplicationModal;
