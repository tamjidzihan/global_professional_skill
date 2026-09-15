import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ShieldCheck,
    AlertCircle,
    Search,
    Download,
    XCircle,
    Award,
    Calendar,
    User,
    BookOpen,
    Building2,
    ExternalLink,
    Printer,
    Copy,
    Check,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { verifyCertificate } from '../../lib/api';
import { CertificatePreview } from '../components/certificate/CertificatePreview';
import { downloadCertificatePDF } from '../components/certificate/pdfExport';
import {
    type PublicVerificationResult,
    type CertificateData,
    GPI_CERTIFICATE_CONSTANTS,
} from '../components/certificate/types';

export const CertificateVerificationPage: React.FC = () => {
    const { certificateNumber: paramCertNum } = useParams<{ certificateNumber?: string }>();
    const navigate = useNavigate();

    const [searchInput, setSearchInput] = useState(paramCertNum || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PublicVerificationResult | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isRevoked, setIsRevoked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const certificateContainerRef = useRef<HTMLDivElement | null>(null);

    const performVerification = async (certNum: string) => {
        const cleaned = certNum.trim().toUpperCase();
        if (!cleaned) {
            toast.error('Please enter a certificate number to verify');
            return;
        }

        setLoading(true);
        setHasSearched(true);
        try {
            const res = await verifyCertificate(cleaned);
            if (res.data.success && res.data.data) {
                const data: PublicVerificationResult = res.data.data;
                setResult(data);
                setIsRevoked(data.status === 'REVOKED');
            } else {
                setResult(null);
                setIsRevoked(false);
            }
        } catch (error: any) {
            setResult(null);
            setIsRevoked(false);
            if (error.response?.status === 404) {
                // Expected for invalid cert
            } else {
                toast.error(error.response?.data?.error?.message || 'Verification service temporarily unavailable');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (paramCertNum) {
            setSearchInput(paramCertNum);
            performVerification(paramCertNum);
        }
    }, [paramCertNum]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchInput.trim()) return;
        navigate(`/certificate-verify/${encodeURIComponent(searchInput.trim().toUpperCase())}`);
    };

    const handleCopyLink = async () => {
        if (!result) return;
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('Verification link copied to clipboard!');
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const handleDownloadPdf = async () => {
        if (!result) return;
        setDownloading(true);
        try {
            await downloadCertificatePDF(
                'public-verified-cert-root',
                result.student_name,
                result.certificate_number
            );
            toast.success('Certificate PDF downloaded successfully!');
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Failed to generate PDF. Please try printing directly.');
        } finally {
            setDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Prepare certificate data for preview rendering
    const previewData: CertificateData | null = result
        ? {
              studentName: result.student_name,
              courseName: result.course_name,
              organizationName: result.organization_name || GPI_CERTIFICATE_CONSTANTS.ORGANIZATION_NAME,
              certificateNumber: result.certificate_number,
              issueDate: result.issue_date,
              templateId: result.template_id || 'template_1',
              authorizerName: result.authorizer_name || 'Authorized Signatory',
              authorizerPosition: result.authorizer_position || 'Academic Director',
              signatureUrl: result.signature_url,
              signatureSize: result.signature_size || 100,
              logoUrl: result.logo_url || '/gpilogo_icon.png',
              logoSize: result.logo_size || 100,
              verificationUrl: result.verification_url || window.location.href,
              website: GPI_CERTIFICATE_CONSTANTS.WEBSITE,
              email: GPI_CERTIFICATE_CONSTANTS.EMAIL,
              mobile: GPI_CERTIFICATE_CONSTANTS.MOBILE,
          }
        : null;

    return (
        <div className="bg-[#FCF8F1] min-h-screen">
            <SEO
                title={
                    result
                        ? `Certificate Verified: ${result.certificate_number} | GPI`
                        : 'Official Certificate Verification | Global Professional Institute'
                }
                description="Verify the authenticity of credentials, certificates, and diplomas issued by Global Professional Institute (GPI)."
            />
            <Breadcrumb name="Verify Certificate" />

            {/* Hero & Search Header */}
            <section className="relative py-12 sm:py-16 bg-linear-to-b from-[#0A192F] via-[#0F284E] to-[#0A192F] text-white overflow-hidden print:hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '32px 32px',
                        }}
                    />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-linear-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            Official Credential Verification Registry
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                            Verify GPI <span className="bg-linear-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">Certificates</span>
                        </h1>

                        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                            Authenticate credentials issued by Global Professional Institute. Enter the unique serial number printed on the certificate or scanned from the QR code.
                        </p>

                        {/* Search Bar Form */}
                        <form onSubmit={handleSearchSubmit} className="pt-4 max-w-2xl mx-auto">
                            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl">
                                <div className="relative flex-1 w-full">
                                    <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="e.g. GPI-SJO-4484-487641"
                                        className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 font-mono text-sm sm:text-base font-semibold rounded-xl outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? (
                                        <LoadingSpinner size={18} />
                                    ) : (
                                        <>
                                            <span>Verify Credential</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2">
                                Format: <span className="font-mono text-slate-300">GPI-XXX-XXXX-XXXXXX</span> (e.g. <span className="font-mono text-amber-300">GPI-SJO-4484-487641</span>)
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <main className="container mx-auto px-4 py-10 max-w-5xl">
                {loading && (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
                        <LoadingSpinner size={48} />
                        <p className="text-sm text-slate-600 font-medium">Validating credential against the institutional registry...</p>
                    </div>
                )}

                {/* State 1: VALID Certificate Found */}
                {!loading && hasSearched && result && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Status Alert Banner */}
                        <div
                            className={`p-6 rounded-2xl border shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                                isRevoked
                                    ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                                    : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                                        isRevoked ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                                    }`}
                                >
                                    {isRevoked ? <XCircle className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold tracking-tight">
                                            {isRevoked ? 'Certificate Revoked' : 'Authentic & Officially Verified'}
                                        </h2>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                                isRevoked
                                                    ? 'bg-rose-200 text-rose-800'
                                                    : 'bg-emerald-200 text-emerald-900'
                                            }`}
                                        >
                                            {result.status}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm mt-1 opacity-85">
                                        {isRevoked
                                            ? 'This certificate was revoked by the issuing institution and is no longer recognized as valid.'
                                            : `This certificate was issued by ${result.organization_name} and is recorded in the official registry.`}
                                    </p>
                                </div>
                            </div>

                            {/* Verification Actions (Desktop / Mobile) */}
                            {!isRevoked && (
                                <div className="flex items-center gap-2 w-full md:w-auto print:hidden">
                                    <button
                                        onClick={handleCopyLink}
                                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                                        title="Copy verification link"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copied ? 'Copied' : 'Share Link'}</span>
                                    </button>

                                    <button
                                        onClick={handlePrint}
                                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                                        title="Print certificate"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Print</span>
                                    </button>

                                    <button
                                        onClick={handleDownloadPdf}
                                        disabled={downloading}
                                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>{downloading ? 'Exporting...' : 'Download PDF'}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Credential Metadata Breakdown Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Awarded To</p>
                                    <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{result.student_name}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Course / Program</p>
                                    <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{result.course_name}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Date of Issue</p>
                                    <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{result.issue_date}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Certificate Serial</p>
                                    <p className="text-xs font-mono font-bold text-slate-900 truncate mt-0.5">{result.certificate_number}</p>
                                </div>
                            </div>
                        </div>

                        {/* Live Rendered Certificate Visual Preview */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-amber-500" />
                                        Official Digital Certificate Render
                                    </h3>
                                    <p className="text-xs text-slate-400">Exact replica of the institutional credential</p>
                                </div>
                                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                    ID: {result.certificate_number}
                                </span>
                            </div>

                            {previewData && (
                                <div
                                    id="public-verified-cert-root"
                                    ref={certificateContainerRef}
                                    className="p-3 sm:p-6 bg-slate-100/70 rounded-xl overflow-hidden flex justify-center border border-slate-200"
                                >
                                    <CertificatePreview data={previewData} templateId={result.template_id} />
                                </div>
                            )}
                        </div>

                        {/* Additional Institution Details & Trust Footer */}
                        <div className="bg-linear-to-br from-slate-900 to-[#0A192F] text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 p-2 flex items-center justify-center shrink-0">
                                    <img src="/gpilogo_icon.png" alt="GPI Logo" className="max-h-full object-contain" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-white">{result.organization_name}</h4>
                                    <p className="text-xs text-slate-300 mt-0.5">
                                        Authorizer: {result.authorizer_name} ({result.authorizer_position})
                                    </p>
                                    <p className="text-[11px] text-amber-300 font-mono mt-1">Registry Ref: {result.certificate_number}</p>
                                </div>
                            </div>

                            <Link
                                to="/courses"
                                className="px-5 py-2.5 bg-white text-slate-900 hover:bg-amber-400 font-bold text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
                            >
                                <span>Explore Certified Courses</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* State 2: NOT FOUND / Invalid Certificate */}
                {!loading && hasSearched && !result && (
                    <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-5 animate-fadeIn">
                        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                            <AlertCircle className="w-9 h-9" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900">Certificate Not Found</h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                No verified certificate was found matching the identifier{' '}
                                <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                    {searchInput}
                                </span>
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-600 border border-slate-100">
                            <p className="font-bold text-slate-800">Verification Tips:</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-500">
                                <li>Double-check for typographical errors in the serial number.</li>
                                <li>Ensure the format resembles <code className="font-mono text-slate-700">GPI-XXX-XXXX-XXXXXX</code> (e.g. <code className="font-mono text-slate-700">GPI-SJO-4484-487641</code>).</li>
                                <li>If you scanned a QR code, ensure the full URL or serial was submitted.</li>
                                <li>Contact the institution or student if you suspect the credential was issued under a different registry.</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setSearchInput('');
                                    navigate('/certificate-verify');
                                }}
                                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                                Try Another Search
                            </button>
                            <Link
                                to="/contact"
                                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all text-center"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                )}

                {/* State 3: Default Initial Landing State (before search) */}
                {!loading && !hasSearched && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Anti-Fraud Protection</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Every certificate issued contains a cryptographically secure serial and instant QR code verification recorded directly on GPI servers.
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Employer Verification</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Corporate hiring managers and institutions can immediately confirm the validity, course mastery, and date of completion without contacting support.
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">100% Digital & Printable</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Certified students can download vector-sharp, high-resolution A4 landscape PDF certificates ready for professional portfolios and LinkedIn.
                                </p>
                            </div>
                        </div>

                        <div className="bg-linear-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl text-center space-y-4">
                            <h3 className="text-xl font-bold">Are you an Employer or Academic Partner?</h3>
                            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                                For bulk candidate verification or academic transcript inquiries, our compliance office provides direct verification assistance.
                            </p>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
                            >
                                Contact Institutional Office
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CertificateVerificationPage;
