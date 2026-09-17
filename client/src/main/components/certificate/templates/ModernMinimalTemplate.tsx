import React from 'react';
import { type CertificateData, GPI_CERTIFICATE_CONSTANTS } from '../types';
import { CertificateQRCode } from '../CertificateQRCode';

interface TemplateProps {
    data: CertificateData;
}

export const ModernMinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
    const logoSrc = data.logoUrl || '/gpilogo_icon.png';
    const serial = data.certificateNumber || 'GPI-SJO-4484-487641';
    const orgName = data.organizationName || GPI_CERTIFICATE_CONSTANTS.ORGANIZATION_NAME;
    const website = GPI_CERTIFICATE_CONSTANTS.WEBSITE;
    const email = GPI_CERTIFICATE_CONSTANTS.EMAIL;
    const mobile = GPI_CERTIFICATE_CONSTANTS.MOBILE;
    const poweredBy = GPI_CERTIFICATE_CONSTANTS.POWERED_BY;

    const logoScale = Math.max(0.4, Math.min(2.0, (data.logoSize || 100) / 100));
    const signatureScale = Math.max(0.4, Math.min(2.0, (data.signatureSize || 100) / 100));
    const isDualAuthorizer = Boolean(data.enableAdditionalAuthorizer);
    const additionalSignatureScale = Math.max(0.4, Math.min(2.0, (data.additionalSignatureSize || 100) / 100));

    const formatDateStr = (d?: string) => {
        if (!d) return 'September 16, 2026';
        const parsed = new Date(d);
        return Number.isNaN(parsed.getTime())
            ? d
            : parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div
            id="certificate-render-canvas"
            className="w-[1120px] h-[792px] relative bg-white select-none overflow-hidden text-slate-900 font-sans"
            style={{ width: '1120px', height: '792px' }}
        >
            {/* Minimalist modern geometric background accents */}
            <div className="absolute top-0 left-0 right-0 h-[8px] bg-linear-to-r from-emerald-600 via-teal-500 to-indigo-600" />
            <div className="absolute top-[8px] left-[40px] right-[40px] bottom-[30px] border border-slate-200 rounded-xl overflow-hidden p-8 flex flex-col justify-between shadow-xs bg-white">
                
                {/* Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] flex justify-center items-center pointer-events-none z-[1]">
                    <img src={logoSrc} alt="Watermark" className="w-full h-full object-contain opacity-[0.04]" />
                </div>

                {/* Top Bar: Organization Branding & Credential Badge */}
                <header className="relative z-[2] flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-4">
                        <div
                            style={{
                                width: `${Math.round(56 * logoScale)}px`,
                                height: `${Math.round(56 * logoScale)}px`,
                            }}
                            className="rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 transition-all duration-200"
                        >
                            <img src={logoSrc} alt="Logo" className="w-full h-full object-contain" crossOrigin="anonymous" />
                        </div>
                        <div>
                            <h1 className="text-[20px] font-extrabold tracking-tight text-slate-900 uppercase">
                                {orgName}
                            </h1>
                            <p className="text-[11px] font-medium text-emerald-600 tracking-wide">
                                Verified Academic Credential
                            </p>
                        </div>
                    </div>

                    {isDualAuthorizer ? (
                        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-100">
                            {data.verificationUrl && (
                                <CertificateQRCode value={data.verificationUrl} size={38} color={{ dark: '#0f172a' }} />
                            )}
                            <div className="text-left leading-tight">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider">
                                        VERIFIED CREDENTIAL
                                    </span>
                                </div>
                                <p className="text-[10.5px] font-mono font-bold text-emerald-600 leading-none">{serial}</p>
                                <p className="text-[9px] text-slate-400 font-medium mt-0.5">Issued: {formatDateStr(data.issueDate)}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-semibold text-slate-700 tracking-wider">
                                VERIFIED & AUTHENTICATED
                            </span>
                        </div>
                    )}
                </header>

                {/* Main Content Area */}
                <main className="relative z-[2] text-center my-auto py-2">
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10.5px] rounded-full uppercase tracking-widest mb-3">
                        Certificate of Achievement
                    </span>

                    <h2 className="text-[13px] text-slate-400 font-medium uppercase tracking-[3px] mb-1">
                        This is proudly presented to
                    </h2>

                    <div className="text-[36px] font-extrabold text-slate-900 tracking-tight mb-2">
                        {data.studentName || 'Student Name'}
                    </div>

                    <p className="text-[14.5px] text-slate-500 max-w-[680px] mx-auto leading-relaxed mb-2.5">
                        for successfully completing all syllabus criteria, practical examinations, and demonstrations of professional competency in
                    </p>

                    <div className="inline-block px-6 py-2 bg-slate-900 text-white font-bold text-[19px] rounded-xl tracking-wide shadow-xs mb-3">
                        {data.courseName || 'Course Title'}
                    </div>
                </main>

                {/* Footer Information & Signatures */}
                <div className="relative z-[2] border-t border-slate-100 pt-4 grid grid-cols-3 items-end">
                    {/* Left: Additional Authorizer (Dual Mode) OR Metadata (Single Mode) */}
                    {isDualAuthorizer ? (
                        <div className="flex flex-col items-start">
                            {data.additionalSignatureUrl ? (
                                <div
                                    style={{ height: `${Math.round(42 * additionalSignatureScale)}px` }}
                                    className="w-[180px] flex items-end justify-center mb-1 transition-all duration-200"
                                >
                                    <img
                                        src={data.additionalSignatureUrl}
                                        alt="Additional Signature"
                                        style={{
                                            maxHeight: `${Math.round(40 * additionalSignatureScale)}px`,
                                            maxWidth: `${Math.round(170 * additionalSignatureScale)}px`,
                                        }}
                                        className="object-contain"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            ) : (
                                <div
                                    style={{ height: `${Math.round(42 * additionalSignatureScale)}px` }}
                                    className="w-[180px] flex items-end justify-center mb-1 font-serif italic text-slate-700 transition-all duration-200"
                                >
                                    <span style={{ fontSize: `${Math.round(15 * additionalSignatureScale)}px` }}>
                                        {data.additionalAuthorizerName || 'Authorized Signatory'}
                                    </span>
                                </div>
                            )}
                            <div className="w-[190px] h-[1.5px] bg-slate-300" />
                            <div className="w-[190px] text-center mt-0.5">
                                <p className="text-[11.5px] font-bold text-slate-900">{data.additionalAuthorizerName || 'Academic Head'}</p>
                                <p className="text-[9.5px] text-slate-400 font-medium">{data.additionalAuthorizerPosition || 'Executive Board'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Issued:</span>
                                <span className="text-[12px] font-bold text-slate-800">{formatDateStr(data.issueDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cert ID:</span>
                                <span className="text-[12px] font-mono font-bold text-emerald-600">{serial}</span>
                            </div>
                        </div>
                    )}

                    {/* Center: Minimal Medallion (Dual Mode) OR QR Code block (Single Mode) */}
                    <div className="flex flex-col items-center justify-center">
                        {isDualAuthorizer ? (
                            <div className="flex items-center gap-2 bg-emerald-50/60 px-3 py-1.5 rounded-full border border-emerald-100">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase">
                                    Official Credential
                                </span>
                            </div>
                        ) : (
                            data.verificationUrl && (
                                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                    <CertificateQRCode value={data.verificationUrl} size={46} color={{ dark: '#0f172a' }} />
                                    <div className="text-left text-[9.5px] text-slate-500 leading-tight">
                                        <p className="font-bold text-slate-800">Scan to Verify</p>
                                        <p className="text-[8.5px] text-slate-400">Authentic Credential</p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Right: Signature */}
                    <div className="flex flex-col items-end">
                        {data.signatureUrl ? (
                            <div
                                style={{ height: `${Math.round(42 * signatureScale)}px` }}
                                className="w-[180px] flex items-end justify-center mb-1 transition-all duration-200"
                            >
                                <img
                                    src={data.signatureUrl}
                                    alt="Signature"
                                    style={{
                                        maxHeight: `${Math.round(40 * signatureScale)}px`,
                                        maxWidth: `${Math.round(170 * signatureScale)}px`,
                                    }}
                                    className="object-contain"
                                    crossOrigin="anonymous"
                                />
                            </div>
                        ) : (
                            <div
                                style={{ height: `${Math.round(42 * signatureScale)}px` }}
                                className="w-[180px] flex items-end justify-center mb-1 font-serif italic text-slate-700 transition-all duration-200"
                            >
                                <span style={{ fontSize: `${Math.round(15 * signatureScale)}px` }}>
                                    {data.authorizerName || 'Authorized Signatory'}
                                </span>
                            </div>
                        )}
                        <div className="w-[190px] h-[1.5px] bg-slate-300" />
                        <div className="w-[190px] text-center mt-0.5">
                            <p className="text-[11.5px] font-bold text-slate-900">{data.authorizerName || 'Academic Director'}</p>
                            <p className="text-[9.5px] text-slate-400 font-medium">{data.authorizerPosition || 'Executive Board'}</p>
                        </div>
                    </div>
                </div>

                {/* Constant Footer Contact & Powered By */}
                <footer className="relative z-[2] pt-2 border-t border-slate-100 flex flex-col items-center justify-center gap-0.5">
                    <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 font-sans">
                        <span>Website: {website}</span>
                        <span className="text-slate-300">•</span>
                        <span>Email: {email}</span>
                        <span className="text-slate-300">•</span>
                        <span>Mobile: {mobile}</span>
                    </div>
                    <p className="m-0 text-[8.5px] text-slate-400 font-sans tracking-wider">
                        {poweredBy}
                    </p>
                </footer>
            </div>
        </div>
    );
};

