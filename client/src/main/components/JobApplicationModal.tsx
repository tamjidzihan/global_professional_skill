/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, Send, Sparkles, Heart, AlertCircle } from 'lucide-react';
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
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

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

    const handleModalClose = () => {
        // Reset form state when closing
        setFile(null);
        setCoverLetter('');
        setSubmitted(false);
        onClose();
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div
                    ref={modalRef}
                    className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300 border-2 border-green-200"
                >
                    <div className="relative">
                        {/* Decorative circle */}
                        <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl opacity-50 scale-150"></div>
                        <div className="relative w-20 h-20 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <CheckCircle className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Received! 🎉</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Thank you for applying for the <strong className="text-blue-600">{jobTitle}</strong> position.
                        Our team will review your application and get back to you within 5-7 business days.
                    </p>
                    <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                        <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-blue-900">What's Next?</p>
                                <p className="text-xs text-blue-700 mt-1">
                                    You'll receive an email confirmation shortly. Our hiring team will review your application
                                    and contact you if your profile matches our requirements.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleModalClose}
                        className="w-full py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border-2 border-gray-200"
            >
                {/* Modal Header */}
                <div className="relative px-6 py-5 bg-linear-to-r from-blue-600 to-purple-600">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                    <div className="relative flex justify-between items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white mb-3">
                                <Heart className="w-3 h-3" />
                                Join Our Team
                            </div>
                            <h2 className="text-sm text-white">Apply for Position</h2>
                            <p className="text-blue-100 font-bold text-xl mt-1">{jobTitle}</p>
                        </div>
                        <button
                            onClick={handleModalClose}
                            className="p-2 cursor-pointer hover:bg-white/20 rounded-full transition-colors text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 bg-[#FCF8F1]">
                    <div className="space-y-6">
                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Resume/CV <span className="text-red-500">*</span>
                                <span className="text-xs font-normal text-gray-500 ml-2">(PDF only, max 5MB)</span>
                            </label>
                            <div
                                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${file
                                    ? 'border-green-400 bg-green-50/50'
                                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'
                                    }`}
                            >
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <div className="bg-green-100 p-3 rounded-full mb-3">
                                            <FileText className="h-8 w-8 text-green-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800">{file.name}</span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFile(null)}
                                            className="mt-3 text-xs text-red-500 hover:text-red-700 font-semibold underline transition-colors"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                                            <Upload className="h-8 w-8 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Click to upload your CV</span>
                                        <span className="text-xs text-gray-400 mt-1">or drag and drop</span>
                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>PDF format required</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Cover Letter
                            </label>
                            <textarea
                                rows={5}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-white"
                                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {coverLetter.length} characters
                            </p>
                        </div>

                        {/* Application Tips */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-start gap-3">
                                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-blue-900">Application Tips</p>
                                    <ul className="text-xs text-blue-800 mt-2 space-y-1">
                                        <li>• Ensure your CV highlights relevant experience for this role</li>
                                        <li>• Personalize your cover letter to showcase your passion</li>
                                        <li>• Double-check your contact information is correct</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="mt-8 flex gap-4">
                        <button
                            type="button"
                            onClick={handleModalClose}
                            className="flex-1 cursor-pointer py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all hover:border-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !file}
                            className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${submitting || !file
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-linear-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105 active:scale-95'
                                }`}
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Submit Application
                                </>
                            )}
                        </button>
                    </div>

                    {/* Privacy Note */}
                    <p className="text-center text-xs text-gray-500 mt-6">
                        By submitting this application, you agree to our privacy policy. Your information will be kept confidential.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default JobApplicationModal;