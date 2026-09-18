/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
    Award,
    Download,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    ArrowLeft,
    Search,
    RefreshCw,
    Eye,
    X,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../../components/SEO';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { getMyCertificates, getMediaUrl } from '../../../../lib/api';
import { downloadCertificatePDF } from '../../../components/certificate/pdfExport';
import { CertificatePreview } from '../../../components/certificate/CertificatePreview';
import {
    type StudentCertificateEnrollment,
    type CertificateData,
    GPI_CERTIFICATE_CONSTANTS,
} from '../../../components/certificate/types';

export const CertificatesPage: React.FC = () => {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState<StudentCertificateEnrollment[]>([]);
    const [summary, setSummary] = useState({
        total_enrolled: 0,
        earned_certificates: 0,
        in_progress: 0,
        awaiting_setup: 0,
        quiz_failed: 0,
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'ISSUED' | 'ELIGIBLE' | 'QUIZ_NOT_PASSED' | 'NOT_COMPLETED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal for previewing certificate
    const [previewingCertificate, setPreviewingCertificate] = useState<StudentCertificateEnrollment | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const res = await getMyCertificates();
            if (res.data.success) {
                setEnrollments(res.data.data || []);
                const responseData = res.data as any;
                setSummary(responseData.summary || {
                    total_enrolled: 0,
                    earned_certificates: 0,
                    in_progress: 0,
                    awaiting_setup: 0,
                    quiz_failed: 0,
                });
            }
        } catch (error) {
            console.error('Failed to load student certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const handleDownload = async (item: StudentCertificateEnrollment) => {
        if (!item.certificate) return;
        setDownloadingId(item.enrollment_id);
        try {
            // First open preview internally if needed or render canvas
            setPreviewingCertificate(item);
            await new Promise((r) => setTimeout(r, 400));
            await downloadCertificatePDF(
                'certificate-render-canvas',
                item.certificate.student_name,
                item.certificate.certificate_number
            );
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredList = enrollments.filter((item) => {
        if (filter !== 'ALL' && item.eligibility_status !== filter) {
            return false;
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return (
                item.course.title.toLowerCase().includes(query) ||
                (item.certificate?.certificate_number && item.certificate.certificate_number.toLowerCase().includes(query))
            );
        }
        return true;
    });

    const getCertificateDataFromItem = (item: StudentCertificateEnrollment): CertificateData => {
        const cert = item.certificate;
        if (!cert) {
            return {
                studentName: 'Student',
                courseName: item.course.title,
                organizationName: GPI_CERTIFICATE_CONSTANTS.ORGANIZATION_NAME,
                certificateNumber: 'GPI-SJO-4484-487641',
                issueDate: new Date().toISOString().split('T')[0],
                templateId: 'template_1',
                authorizerName: 'Director',
                authorizerPosition: 'Academic Head',
                website: GPI_CERTIFICATE_CONSTANTS.WEBSITE,
                email: GPI_CERTIFICATE_CONSTANTS.EMAIL,
                mobile: GPI_CERTIFICATE_CONSTANTS.MOBILE,
            };
        }
        return {
            studentName: cert.student_name,
            courseName: cert.course_name,
            organizationName: cert.organization_name || GPI_CERTIFICATE_CONSTANTS.ORGANIZATION_NAME,
            certificateNumber: cert.certificate_number,
            issueDate: cert.issue_date,
            templateId: cert.template_id,
            authorizerName: cert.authorizer_name,
            authorizerPosition: cert.authorizer_position,
            logoUrl: getMediaUrl(cert.logo_url) || '/gpilogo_icon.png',
            logoSize: cert.logo_size || 100,
            signatureUrl: getMediaUrl(cert.signature_url),
            signatureSize: cert.signature_size || 100,
            enableAdditionalAuthorizer: Boolean(cert.enable_additional_authorizer),
            additionalAuthorizerName: cert.additional_authorizer_name || undefined,
            additionalAuthorizerPosition: cert.additional_authorizer_position || undefined,
            additionalSignatureUrl: getMediaUrl(cert.additional_signature_url) || null,
            additionalSignatureSize: cert.additional_signature_size || 100,
            verificationUrl: cert.verification_url,
            website: GPI_CERTIFICATE_CONSTANTS.WEBSITE,
            email: GPI_CERTIFICATE_CONSTANTS.EMAIL,
            mobile: GPI_CERTIFICATE_CONSTANTS.MOBILE,
        };
    };

    if (loading) {
        return (
            <div className="py-12 px-4 min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="py-6 px-4 md:px-6 space-y-5">
            <SEO title="My Certificates & Credentials" noindex />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-1.5 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                        <Award className="w-5 h-5 text-violet-600" />
                        Certificates & Verified Credentials
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">Your official course completion achievements and verifiable credentials</p>
                </div>

                <button
                    onClick={fetchCertificates}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer self-start sm:self-auto"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Earned Certificates</p>
                        <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{summary.earned_certificates}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">In Progress</p>
                        <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{summary.in_progress}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Eligible</p>
                        <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{summary.awaiting_setup}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Total Enrolled</p>
                        <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{summary.total_enrolled}</p>
                    </div>
                </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                        { key: 'ALL', label: `All (${enrollments.length})` },
                        { key: 'ISSUED', label: `Earned (${summary.earned_certificates})` },
                        { key: 'ELIGIBLE', label: `Eligible (${summary.awaiting_setup})` },
                        { key: 'NOT_COMPLETED', label: `In Progress (${summary.in_progress})` },
                        { key: 'QUIZ_NOT_PASSED', label: `Needs Retake (${summary.quiz_failed})` },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${filter === f.key
                                    ? 'bg-gray-900 text-white shadow-xs'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-300 font-medium text-gray-800"
                    />
                </div>
            </div>

            {/* Course Certificate Cards Grid */}
            {filteredList.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
                        <Award className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No Certificates Found</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                        Enroll in courses, complete all lessons, and pass the quizzes to earn official verifiable certificates.
                    </p>
                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 transition-colors mt-2"
                    >
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredList.map((item) => {
                        const isIssued = item.eligibility_status === 'ISSUED';
                        const isEligible = item.eligibility_status === 'ELIGIBLE';
                        const isQuizFailed = item.eligibility_status === 'QUIZ_NOT_PASSED';

                        return (
                            <div
                                key={item.enrollment_id}
                                className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between shadow-xs ${isIssued
                                        ? 'border-emerald-200 bg-linear-to-b from-white to-emerald-50/10'
                                        : 'border-gray-100'
                                    }`}
                            >
                                <div className="space-y-3">
                                    {/* Top status header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 leading-snug">
                                                {item.course.title}
                                            </h3>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                Instructor: {item.course.instructor_name || 'GPI Instructor'}
                                            </p>
                                        </div>

                                        {isIssued && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-md border border-emerald-100 shrink-0">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Issued
                                            </span>
                                        )}

                                        {isEligible && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[11px] rounded-md border border-blue-100 shrink-0">
                                                <Sparkles className="w-3.5 h-3.5" /> Ready
                                            </span>
                                        )}

                                        {isQuizFailed && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 font-bold text-[11px] rounded-md border border-rose-100 shrink-0">
                                                <AlertCircle className="w-3.5 h-3.5" /> Quiz Score Low
                                            </span>
                                        )}

                                        {!isIssued && !isEligible && !isQuizFailed && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 font-bold text-[11px] rounded-md shrink-0">
                                                In Progress
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress & Diagnostics bar */}
                                    <div className="bg-gray-50/70 p-3 rounded-lg space-y-2 border border-gray-100 text-xs">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-gray-500 font-medium">Course Progress:</span>
                                            <span className="font-bold text-gray-800">
                                                {item.progress_percentage.toFixed(0)}% Complete
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${item.progress_percentage >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                                    }`}
                                                style={{ width: `${Math.min(item.progress_percentage, 100)}%` }}
                                            />
                                        </div>

                                        {item.average_quiz_score !== undefined && (
                                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
                                                <span className="text-gray-500 font-medium">Quiz Average:</span>
                                                <span
                                                    className={`font-bold ${item.quiz_passed ? 'text-emerald-600' : 'text-rose-600'
                                                        }`}
                                                >
                                                    {item.average_quiz_score}%{' '}
                                                    <span className="text-[10px] text-gray-400 font-normal">
                                                        (Required: {item.quiz_pass_threshold}%)
                                                    </span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Informational explanation */}
                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                        {item.status_message}
                                    </p>

                                    {/* Certificate details if issued */}
                                    {isIssued && item.certificate && (
                                        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">
                                                    Certificate ID
                                                </p>
                                                <p className="font-mono text-xs font-extrabold text-emerald-900">
                                                    {item.certificate.certificate_number}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">
                                                    Issue Date
                                                </p>
                                                <p className="text-xs font-semibold text-emerald-900">
                                                    {item.certificate.issue_date}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Footer */}
                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                                    {isIssued && item.certificate ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setPreviewingCertificate(item)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-200"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-gray-500" /> Preview
                                                </button>
                                                <Link
                                                    to={`/certificate-verify/${item.certificate.certificate_number}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" /> Verify
                                                </Link>
                                            </div>

                                            <button
                                                onClick={() => handleDownload(item)}
                                                disabled={downloadingId === item.enrollment_id}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                {downloadingId === item.enrollment_id ? 'Generating...' : 'Download PDF'}
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            to={`/dashboard/student/my-courses/${item.course.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors w-full justify-center"
                                        >
                                            <BookOpen className="w-3.5 h-3.5" /> Continue Course
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Hidden / Rendered Modal for Preview & High-Res PDF Export */}
            {previewingCertificate && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-violet-600" />
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        Certificate of Achievement
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {previewingCertificate.course.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPreviewingCertificate(null)}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Certificate Canvas */}
                        <div className="p-2 bg-slate-100 rounded-xl flex justify-center border border-slate-200">
                            <CertificatePreview
                                data={getCertificateDataFromItem(previewingCertificate)}
                                templateId={previewingCertificate.certificate?.template_id || 'template_1'}
                            />
                        </div>

                        {/* Modal Action Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="text-xs font-mono text-gray-500">
                                ID: {previewingCertificate.certificate?.certificate_number}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownload(previewingCertificate)}
                                    disabled={downloadingId === previewingCertificate.enrollment_id}
                                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                    <Download className="w-4 h-4" /> Download PDF
                                </button>
                                <button
                                    onClick={() => setPreviewingCertificate(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificatesPage;