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
                handleModalClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.body.style.overflow = originalOverflow || 'unset';
            };
        }
    }, [isOpen, onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleModalClose();
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
                <div
                    ref={modalRef}
                    className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300 border-2 border-green-200 my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto"
                >
                    <div className="relative">
                        {/* Decorative circle */}
                        <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl opacity-50 scale-150 pointer-events-none"></div>
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Application Received! 🎉</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                        Thank you for applying for the <strong className="text-blue-600">{jobTitle}</strong> position.
                        Our team will review your application and get back to you within 5-7 business days.
                    </p>
                    <div className="bg-blue-50 rounded-xl p-3.5 sm:p-4 mb-5 sm:mb-6 text-left">
                        <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
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
                        className="w-full py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
            <div
                ref={modalRef}
                className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border-2 border-gray-200 my-auto flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)]"
            >
                {/* Modal Header */}
                <div className="relative px-4 py-4 sm:px-6 sm:py-5 bg-linear-to-r from-blue-600 to-purple-600 shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 pointer-events-none"></div>

                    <div className="relative flex justify-between items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-[11px] sm:text-xs font-bold text-white mb-1.5 sm:mb-2">
                                <Heart className="w-3 h-3 shrink-0" />
                                Join Our Team
                            </div>
                            <h2 className="text-xs sm:text-sm text-white/90 font-medium">Apply for Position</h2>
                            <p className="text-blue-100 font-bold text-base sm:text-xl mt-0.5 truncate" title={jobTitle}>{jobTitle}</p>
                        </div>
                        <button
                            onClick={handleModalClose}
                            className="p-1.5 sm:p-2 cursor-pointer hover:bg-white/20 rounded-full transition-colors text-white shrink-0 self-start sm:self-center"
                            aria-label="Close modal"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body & Form */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#FCF8F1]">
                    {/* Scrollable Fields */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                        {/* File Upload */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                                Resume/CV <span className="text-red-500">*</span>
                                <span className="text-xs font-normal text-gray-500 ml-1.5 sm:ml-2">(PDF only, max 5MB)</span>
                            </label>
                            <div
                                className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all duration-200 ${file
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
                                        <div className="bg-green-100 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3">
                                            <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold text-gray-800 break-all max-w-full px-2">{file.name}</span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFile(null)}
                                            className="mt-2.5 text-xs text-red-500 hover:text-red-700 font-semibold underline transition-colors cursor-pointer"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="bg-gray-100 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 group-hover:bg-blue-100 transition-colors">
                                            <Upload className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-gray-700">Click to upload your CV</span>
                                        <span className="text-[11px] sm:text-xs text-gray-400 mt-1">or drag and drop</span>
                                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-400">
                                            <AlertCircle className="h-3 w-3 shrink-0" />
                                            <span>PDF format required</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                                Cover Letter <span className="text-xs font-normal text-gray-400 ml-1">(Optional)</span>
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y min-h-[90px] max-h-[220px] bg-white"
                                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                            />
                            <p className="text-[11px] sm:text-xs text-gray-500 mt-1.5 text-right">
                                {coverLetter.length} characters
                            </p>
                        </div>

                        {/* Application Tips */}
                        <div className="bg-blue-50 rounded-xl p-3.5 sm:p-4 border border-blue-200">
                            <div className="flex items-start gap-2.5 sm:gap-3">
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-blue-900">Application Tips</p>
                                    <ul className="text-[11px] sm:text-xs text-blue-800 mt-1.5 space-y-1">
                                        <li>• Ensure your CV highlights relevant experience for this role</li>
                                        <li>• Personalize your cover letter to showcase your passion</li>
                                        <li>• Double-check your contact information is correct</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#FCF8F1] border-t border-gray-200/80 shrink-0">
                        <div className="flex gap-2.5 sm:gap-4">
                            <button
                                type="button"
                                onClick={handleModalClose}
                                className="flex-1 cursor-pointer py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-white hover:border-gray-400 transition-all text-xs sm:text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !file}
                                className={`flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${submitting || !file
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-linear-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer'
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        <span>Submit Application</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Privacy Note */}
                        <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-2.5">
                            By submitting this application, you agree to our privacy policy. Your information will be kept confidential.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobApplicationModal;