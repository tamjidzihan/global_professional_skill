/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    Shield,
    Upload,
    Sparkles,
    RefreshCw,
    AlertCircle,
    Eye,
    Save,
    Search,
    Users,
    Edit3,
    ExternalLink,
    X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SEO from '../../../components/SEO';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import {
    getCourseCertificateConfig,
    saveCourseCertificateConfig,
    getCourseCertificateCandidates,
    manualIssueCertificate,
    adminUpdateCertificate,
} from '../../../../lib/api';
import { CertificatePreview } from '../../../components/certificate/CertificatePreview';
import { CertificateTemplateSelector } from '../../../components/certificate/CertificateTemplateSelector';
import {
    type CertificateTemplateId,
    type CertificateCandidate,
    type CertificateData,
    GPI_CERTIFICATE_CONSTANTS,
} from '../../../components/certificate/types';

export const AdminCourseCertificatePage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'config' | 'candidates'>(
        searchParams.get('tab') === 'candidates' ? 'candidates' : 'config'
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Course & Config data
    const [courseTitle, setCourseTitle] = useState('');
    const [templateId, setTemplateId] = useState<CertificateTemplateId>('template_1');
    const [organizationName, setOrganizationName] = useState('Global Professional Institute');
    const [authorizerName, setAuthorizerName] = useState('Dr. Academic Director');
    const [authorizerPosition, setAuthorizerPosition] = useState('Director & Academic Head');
    const [isActive, setIsActive] = useState(true);

    // Image previews & files
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoSize, setLogoSize] = useState<number>(100);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [signatureSize, setSignatureSize] = useState<number>(100);

    // Candidate list data
    const [candidates, setCandidates] = useState<CertificateCandidate[]>([]);
    const [passThreshold, setPassThreshold] = useState<number>(50);
    const [candidateSummary, setCandidateSummary] = useState({
        total_candidates: 0,
        issued_count: 0,
        eligible_count: 0,
        not_eligible_count: 0,
    });
    const [candidateFilter, setCandidateFilter] = useState<'ALL' | 'ISSUED' | 'ELIGIBLE' | 'NOT_ELIGIBLE'>('ALL');
    const [candidateSearch, setCandidateSearch] = useState('');

    // Student customization modal
    const [editingCandidate, setEditingCandidate] = useState<CertificateCandidate | null>(null);
    const [customStudentName, setCustomStudentName] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Confirmation dialog before saving
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const logoInputRef = useRef<HTMLInputElement | null>(null);
    const signatureInputRef = useRef<HTMLInputElement | null>(null);

    const loadData = async () => {
        if (!courseId) return;
        setLoading(true);
        try {
            const [configRes, candidatesRes] = await Promise.all([
                getCourseCertificateConfig(courseId),
                getCourseCertificateCandidates(courseId),
            ]);

            if (configRes.data.success && configRes.data.data) {
                const conf = configRes.data.data;
                setCourseTitle(conf.course_title || 'Course');
                setTemplateId(conf.template_id || 'template_1');
                setOrganizationName(conf.organization_name || 'Global Professional Institute');
                setAuthorizerName(conf.authorizer_name || '');
                setAuthorizerPosition(conf.authorizer_position || 'Director');
                setIsActive(conf.is_active !== undefined ? conf.is_active : true);
                if (conf.logo_url) setLogoPreview(conf.logo_url);
                if (conf.logo_size) setLogoSize(conf.logo_size);
                if (conf.signature_url) setSignaturePreview(conf.signature_url);
                if (conf.signature_size) setSignatureSize(conf.signature_size);
            }

            if (candidatesRes.data.success && candidatesRes.data.data) {
                const candData = candidatesRes.data.data;
                setCourseTitle(candData.course_title || courseTitle);
                setCandidates(candData.candidates || []);
                setCandidateSummary(candData.summary || {
                    total_candidates: 0,
                    issued_count: 0,
                    eligible_count: 0,
                    not_eligible_count: 0,
                });
                if (candData.pass_percentage_threshold) {
                    setPassThreshold(candData.pass_percentage_threshold);
                }
            }
        } catch (error: any) {
            console.error('Error loading certificate data:', error);
            toast.error(error.response?.data?.error?.message || 'Failed to load certificate settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [courseId]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSignatureFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setSignaturePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveConfig = async () => {
        if (!courseId) return;
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('template_id', templateId);
            formData.append('organization_name', organizationName.trim() || 'Global Professional Institute');
            formData.append('authorizer_name', authorizerName.trim());
            formData.append('authorizer_position', authorizerPosition.trim() || 'Director');
            formData.append('is_active', String(isActive));
            formData.append('logo_size', String(logoSize));
            formData.append('signature_size', String(signatureSize));

            if (logoFile) formData.append('logo_image', logoFile);
            if (signatureFile) formData.append('signature_image', signatureFile);

            const res = await saveCourseCertificateConfig(courseId, formData);
            if (res.data.success) {
                toast.success(res.data.message || 'Certificate configuration saved successfully!');
                setShowConfirmModal(false);
                await loadData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to save certificate configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleManualIssue = async () => {
        if (!editingCandidate) return;
        setActionLoading(true);
        try {
            if (editingCandidate.certificate) {
                // Update existing certificate display name
                const res = await adminUpdateCertificate(editingCandidate.certificate.id, {
                    student_name: customStudentName.trim() || editingCandidate.student_name,
                });
                if (res.data.success) {
                    toast.success('Certificate display name updated!');
                    setEditingCandidate(null);
                    await loadData();
                }
            } else {
                // Issue certificate manually
                const res = await manualIssueCertificate(
                    editingCandidate.enrollment_id,
                    customStudentName.trim() || undefined
                );
                if (res.data.success) {
                    toast.success('Certificate officially issued for student!');
                    setEditingCandidate(null);
                    await loadData();
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to update / issue certificate');
        } finally {
            setActionLoading(false);
        }
    };

    // Live preview data
    const previewData: CertificateData = {
        studentName: 'Md. Tamzid Islam',
        courseName: courseTitle || 'Professional Python Development',
        organizationName: organizationName || GPI_CERTIFICATE_CONSTANTS.ORGANIZATION_NAME,
        certificateNumber: 'GPI-SJO-4484-487641',
        issueDate: new Date().toISOString().split('T')[0],
        templateId,
        authorizerName: authorizerName || 'Authorized Signatory',
        authorizerPosition: authorizerPosition || 'Director',
        logoUrl: logoPreview || '/gpilogo_icon.png',
        logoSize,
        signatureUrl: signaturePreview,
        signatureSize,
        verificationUrl: `${window.location.origin}/certificate-verify/GPI-SJO-4484-487641`,
        website: GPI_CERTIFICATE_CONSTANTS.WEBSITE,
        email: GPI_CERTIFICATE_CONSTANTS.EMAIL,
        mobile: GPI_CERTIFICATE_CONSTANTS.MOBILE,
    };

    const filteredCandidates = candidates.filter((c) => {
        if (candidateFilter !== 'ALL' && c.eligibility_status !== candidateFilter) {
            return false;
        }
        if (candidateSearch.trim()) {
            const query = candidateSearch.toLowerCase();
            return (
                c.student_name.toLowerCase().includes(query) ||
                c.student_email.toLowerCase().includes(query) ||
                (c.certificate?.certificate_number && c.certificate.certificate_number.toLowerCase().includes(query))
            );
        }
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="py-6 px-4 md:px-6 space-y-5 bg-gray-50/50 min-h-screen">
            <SEO title={`Certificate Settings | ${courseTitle}`} noindex />

            {/* Top Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                    <button
                        onClick={() => navigate(`/dashboard/admin/courses/${courseId}`)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-1.5 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Course Detail
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                        <Award className="w-5 h-5 text-violet-600" />
                        Course Certificate Settings
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">{courseTitle}</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        <Save className="w-3.5 h-3.5" /> Save & Activate
                    </button>
                </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Enrolled</p>
                        <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{candidateSummary.total_candidates}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Issued</p>
                        <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{candidateSummary.issued_count}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Eligible</p>
                        <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{candidateSummary.eligible_count}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Pass Mark</p>
                        <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{passThreshold}%</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 gap-2">
                <button
                    onClick={() => setActiveTab('config')}
                    className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'config'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <Award className="w-4 h-4" /> Certificate Setup & Templates
                </button>

                <button
                    onClick={() => setActiveTab('candidates')}
                    className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'candidates'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <Users className="w-4 h-4" /> Certified Students & Candidates ({candidates.length})
                </button>
            </div>

            {/* TAB 1: Certificate Configuration & Live Preview */}
            {activeTab === 'config' && (
                <div className="space-y-6">
                    {/* 1. Template Selection */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">1. Select Certificate Design</h2>
                                <p className="text-xs text-gray-400">Choose from 4 institutional templates</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-violet-50 text-violet-700 rounded-md">
                                Selected: {templateId.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                        <CertificateTemplateSelector
                            selectedTemplate={templateId}
                            onSelect={(id) => setTemplateId(id)}
                        />
                    </div>

                    {/* 2. Customization Controls + Live Preview Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Left: Branding & Signatory Inputs */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Branding Card */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                                    Branding & Organization
                                </h3>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        value={organizationName}
                                        onChange={(e) => setOrganizationName(e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 font-medium text-gray-800"
                                        placeholder="Global Professional Institute"
                                    />
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Certificate Logo
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-[10px] text-gray-400">Default</span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <input
                                                ref={logoInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLogoChange}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => logoInputRef.current?.click()}
                                                className="px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer w-full text-center flex items-center justify-center gap-1.5"
                                            >
                                                <Upload className="w-3 h-3" /> Upload Custom Logo
                                            </button>
                                            {logoFile && (
                                                <p className="text-[10px] text-gray-400 truncate">{logoFile.name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Logo Size Slider */}
                                <div className="pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                            Logo Size Scale
                                            <span className="text-[11px] font-mono text-violet-600 font-bold">({logoSize}%)</span>
                                        </label>
                                        {logoSize !== 100 && (
                                            <button
                                                type="button"
                                                onClick={() => setLogoSize(100)}
                                                className="text-[10px] font-medium text-gray-400 hover:text-violet-600 transition-colors cursor-pointer"
                                            >
                                                Reset (100%)
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400 font-medium">50%</span>
                                        <input
                                            type="range"
                                            min="50"
                                            max="180"
                                            step="5"
                                            value={logoSize}
                                            onChange={(e) => setLogoSize(Number(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                        />
                                        <span className="text-[10px] text-gray-400 font-medium">180%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Authorizer / Signatory Card */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-violet-600" />
                                    Authorizer & Signature
                                </h3>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Signatory Name
                                    </label>
                                    <input
                                        type="text"
                                        value={authorizerName}
                                        onChange={(e) => setAuthorizerName(e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 font-medium text-gray-800"
                                        placeholder="e.g. Dr. John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Signatory Position / Title
                                    </label>
                                    <input
                                        type="text"
                                        value={authorizerPosition}
                                        onChange={(e) => setAuthorizerPosition(e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 font-medium text-gray-800"
                                        placeholder="e.g. Director & Academic Head"
                                    />
                                </div>

                                {/* Signature Upload */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Signature Image
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                            {signaturePreview ? (
                                                <img src={signaturePreview} alt="Signature" className="max-h-full object-contain" />
                                            ) : (
                                                <span className="text-[10px] italic text-gray-400">None</span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <input
                                                ref={signatureInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleSignatureChange}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => signatureInputRef.current?.click()}
                                                className="px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer w-full text-center flex items-center justify-center gap-1.5"
                                            >
                                                <Upload className="w-3 h-3" /> Upload Signature
                                            </button>
                                            {signatureFile && (
                                                <p className="text-[10px] text-gray-400 truncate">{signatureFile.name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Signature Size Slider */}
                                <div className="pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                            Signature Size Scale
                                            <span className="text-[11px] font-mono text-violet-600 font-bold">({signatureSize}%)</span>
                                        </label>
                                        {signatureSize !== 100 && (
                                            <button
                                                type="button"
                                                onClick={() => setSignatureSize(100)}
                                                className="text-[10px] font-medium text-gray-400 hover:text-violet-600 transition-colors cursor-pointer"
                                            >
                                                Reset (100%)
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400 font-medium">50%</span>
                                        <input
                                            type="range"
                                            min="50"
                                            max="180"
                                            step="5"
                                            value={signatureSize}
                                            onChange={(e) => setSignatureSize(Number(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                        />
                                        <span className="text-[10px] text-gray-400 font-medium">180%</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Auto-Issue Enabled</p>
                                        <p className="text-[10px] text-gray-400">Issue immediately when student completes course & quiz</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right: Live Real-Time Preview */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-violet-600" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                                            Live Real-Time Certificate Preview
                                        </h3>
                                    </div>
                                    <span className="text-[11px] text-gray-400 font-mono">
                                        A4 Landscape (1120 × 792)
                                    </span>
                                </div>

                                <div className="p-2 bg-slate-100/60 rounded-xl overflow-hidden flex justify-center border border-slate-200/60">
                                    <CertificatePreview data={previewData} templateId={templateId} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Certified Students & Candidates */}
            {activeTab === 'candidates' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
                    {/* Filter & Search Bar */}
                    <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            {[
                                { key: 'ALL', label: `All (${candidates.length})` },
                                { key: 'ISSUED', label: `Issued (${candidateSummary.issued_count})` },
                                { key: 'ELIGIBLE', label: `Eligible (${candidateSummary.eligible_count})` },
                                { key: 'NOT_ELIGIBLE', label: `Not Eligible (${candidateSummary.not_eligible_count})` },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setCandidateFilter(f.key as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                                        candidateFilter === f.key
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
                                value={candidateSearch}
                                onChange={(e) => setCandidateSearch(e.target.value)}
                                placeholder="Search by student name or ID..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-300 font-medium text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Student</th>
                                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Progress</th>
                                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Quiz Average</th>
                                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Certificate Status</th>
                                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Cert Number</th>
                                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-xs">
                                {filteredCandidates.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                                            No student candidates found matching the selected filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCandidates.map((c) => {
                                        const isIssued = c.eligibility_status === 'ISSUED';
                                        const isEligible = c.eligibility_status === 'ELIGIBLE';
                                        return (
                                            <tr key={c.enrollment_id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <p className="font-bold text-gray-900">{c.student_name}</p>
                                                    <p className="text-[11px] text-gray-400">{c.student_email}</p>
                                                    {c.organization_name && (
                                                        <p className="text-[10px] text-violet-600">{c.organization_name}</p>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <div className="w-24 space-y-1">
                                                        <div className="flex justify-between text-[10px] font-semibold text-gray-600">
                                                            <span>{c.progress_percentage.toFixed(0)}%</span>
                                                            <span>{c.course_completed ? '✓' : ''}</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${
                                                                    c.progress_percentage >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                                                }`}
                                                                style={{ width: `${Math.min(c.progress_percentage, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    {c.total_quizzes === 0 ? (
                                                        <span className="text-[11px] text-gray-400">No quizzes</span>
                                                    ) : (
                                                        <div>
                                                            <p className={`font-bold ${c.quiz_passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                {c.average_quiz_score}%{' '}
                                                                <span className="text-[10px] text-gray-400 font-normal">
                                                                    (Req: {c.quiz_pass_threshold}%)
                                                                </span>
                                                            </p>
                                                            <p className="text-[10px] text-gray-400">
                                                                {c.completed_quizzes} of {c.total_quizzes} taken
                                                            </p>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    {isIssued && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                                                            <CheckCircle2 className="w-3 h-3" /> Issued
                                                        </span>
                                                    )}
                                                    {isEligible && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                                                            <Sparkles className="w-3 h-3" /> Eligible
                                                        </span>
                                                    )}
                                                    {!isIssued && !isEligible && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-gray-50 text-gray-500 rounded-md">
                                                            <AlertCircle className="w-3 h-3" /> Incomplete
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5 font-mono text-[11px] text-gray-700">
                                                    {c.certificate?.certificate_number ? (
                                                        <Link
                                                            to={`/certificate/verify/${c.certificate.certificate_number}`}
                                                            target="_blank"
                                                            className="text-violet-600 hover:underline flex items-center gap-1"
                                                        >
                                                            {c.certificate.certificate_number}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCandidate(c);
                                                            setCustomStudentName(c.certificate?.student_name || c.student_name);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                        {isIssued ? 'Edit Name' : 'Issue / Customize'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Confirmation Modal before Saving Course Config */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center gap-3 text-violet-600">
                            <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Activate Course Certificate?</h3>
                                <p className="text-xs text-gray-400">{courseTitle}</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                            Saving will activate the certificate configuration for this course. Any enrolled student who has completed 100% of the lessons and passed the required quizzes will automatically receive an official verifiable certificate.
                        </p>

                        <div className="flex gap-2.5 pt-2">
                            <button
                                onClick={handleSaveConfig}
                                disabled={saving}
                                className="flex-1 py-2 bg-violet-600 text-white font-semibold text-xs rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Confirm & Save'}
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-2 bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customize / Issue Candidate Modal */}
            {editingCandidate && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                    {editingCandidate.certificate ? 'Customize Issued Certificate Name' : 'Manually Issue Certificate'}
                                </h3>
                                <p className="text-xs text-gray-400">Registered Student: {editingCandidate.student_name}</p>
                            </div>
                            <button
                                onClick={() => setEditingCandidate(null)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Certificate Display Name
                                </label>
                                <input
                                    type="text"
                                    value={customStudentName}
                                    onChange={(e) => setCustomStudentName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-300 font-medium text-gray-900"
                                    placeholder="Enter exact name to display on certificate"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">
                                    This only changes the name snapshot printed on the certificate and does not alter the user's account profile name.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
                                <p><strong>Progress:</strong> {editingCandidate.progress_percentage}%</p>
                                <p><strong>Quiz Average:</strong> {editingCandidate.average_quiz_score}% (Pass threshold: {editingCandidate.quiz_pass_threshold}%)</p>
                                <p><strong>Current Status:</strong> {editingCandidate.eligibility_status}</p>
                            </div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                            <button
                                onClick={handleManualIssue}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 bg-violet-600 text-white font-semibold text-xs rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : editingCandidate.certificate ? 'Update Name' : 'Issue Certificate'}
                            </button>
                            <button
                                onClick={() => setEditingCandidate(null)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourseCertificatePage;
