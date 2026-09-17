import React from 'react';
import { type CertificateData, GPI_CERTIFICATE_CONSTANTS } from '../types';
import { CertificateQRCode } from '../CertificateQRCode';

interface TemplateProps {
    data: CertificateData;
}

export const PremiumCorporateTemplate: React.FC<TemplateProps> = ({ data }) => {
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
            : parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div
            id="certificate-render-canvas"
            className="w-[1120px] h-[792px] relative bg-[#fdfefe] select-none overflow-hidden text-slate-900 font-sans"
            style={{ width: '1120px', height: '792px' }}
        >
            {/* Left Geometric Corporate Color Ribbons */}
            <div className="absolute top-0 bottom-0 left-0 w-[24px] bg-[#0c1e38]" />
            <div className="absolute top-0 bottom-0 left-[24px] w-[8px] bg-linear-to-b from-[#e5b853] via-[#b8860b] to-[#c99b3d]" />
            <div className="absolute top-0 right-0 w-[220px] h-[220px] bg-linear-to-bl from-[#0c1e38]/10 via-[#e5b853]/15 to-transparent pointer-events-none" />

            {/* Inner Border Frame */}
            <div className="absolute top-[20px] bottom-[20px] left-[48px] right-[20px] border border-slate-200 p-7 flex flex-col justify-between bg-white/95 shadow-sm">
                
                {/* Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] flex justify-center items-center pointer-events-none z-[1]">
                    <img src={logoSrc} alt="Watermark" className="w-full h-full object-contain opacity-[0.05]" />
                </div>

                {/* Top Header */}
                <header className="relative z-[2] flex items-center justify-between border-b-2 border-[#b8860b]/30 pb-3.5">
                    <div className="flex items-center gap-4">
                        <div
                            style={{
                                width: `${Math.round(60 * logoScale)}px`,
                                height: `${Math.round(60 * logoScale)}px`,
                            }}
                            className="flex items-center justify-center transition-all duration-200"
                        >
                            <img src={logoSrc} alt="Logo" className="w-full h-full object-contain" crossOrigin="anonymous" />
                        </div>
                        <div>
                            <h1 className="text-[21px] font-black tracking-tight text-[#0c1e38] uppercase">
                                {orgName}
                            </h1>
                            <p className="text-[10.5px] font-semibold text-[#b8860b] tracking-[2px] uppercase">
                                Center for Executive & Professional Development
                            </p>
                        </div>
                    </div>

                    {isDualAuthorizer ? (
                        <div className="flex items-center gap-3">
                            {data.verificationUrl && (
                                <div className="p-1 bg-white border border-slate-200 rounded shrink-0 shadow-2xs">
                                    <CertificateQRCode value={data.verificationUrl} size={42} color={{ dark: '#0c1e38' }} />
                                </div>
                            )}
                            <div className="text-right leading-tight">
                                <span className="text-[16px] font-black text-[#0c1e38] tracking-widest uppercase block">
                                    PROFESSIONAL CREDENTIAL
                                </span>
                                <span className="text-[10.5px] font-mono font-bold text-slate-500 block mt-0.5">
                                    ID: {serial}
                                </span>
                                <span className="text-[8.5px] font-semibold text-[#b8860b] uppercase">
                                    Verified Record
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-right">
                            <span className="text-[19px] font-black text-[#0c1e38] tracking-widest uppercase block">
                                PROFESSIONAL CREDENTIAL
                            </span>
                            <span className="text-[11px] font-mono font-bold text-slate-500">
                                ID: {serial}
                            </span>
                        </div>
                    )}
                </header>

                {/* Main Body */}
                <main className="relative z-[2] text-center my-auto py-2">
                    <p className="text-[12.5px] font-bold text-[#b8860b] uppercase tracking-[3px] mb-1.5">
                        OFFICIAL CERTIFICATION OF MERIT
                    </p>

                    <h2 className="text-[13.5px] text-slate-500 font-medium uppercase tracking-[2px] mb-2.5">
                        This is to certify that
                    </h2>

                    <div className="inline-block px-10 py-1 border-b-2 border-[#0c1e38] min-w-[460px] max-w-[800px]">
                        <span className="text-[33px] font-bold text-[#0c1e38] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis block">
                            {data.studentName || 'Student Name'}
                        </span>
                    </div>

                    <p className="text-[14.5px] text-slate-600 max-w-[700px] mx-auto leading-relaxed mt-3 mb-1.5">
                        has satisfactorily demonstrated the requisite knowledge, practical skills, and standards of excellence in
                    </p>

                    <div className="text-[23px] font-extrabold text-[#0c1e38] tracking-wide mt-1 mb-1.5">
                        {data.courseName || 'Professional Course Title'}
                    </div>

                    <p className="text-[12.5px] text-slate-400 font-medium">
                        Awarded and verified on <span className="font-bold text-slate-700">{formatDateStr(data.issueDate)}</span>
                    </p>
                </main>

                {/* Bottom Corporate Signature & Security Seal */}
                <div className="relative z-[2] border-t border-slate-100 pt-3.5 grid grid-cols-3 items-end">
                    {/* Left: Additional Authorizer (Dual Mode) OR Security QR (Single Mode) */}
                    {isDualAuthorizer ? (
                        <div className="flex flex-col items-start">
                            {data.additionalSignatureUrl ? (
                                <div
                                    style={{ height: `${Math.round(42 * additionalSignatureScale)}px` }}
                                    className="w-[190px] flex items-end justify-center mb-1 transition-all duration-200"
                                >
                                    <img
                                        src={data.additionalSignatureUrl}
                                        alt="Additional Signature"
                                        style={{
                                            maxHeight: `${Math.round(40 * additionalSignatureScale)}px`,
                                            maxWidth: `${Math.round(180 * additionalSignatureScale)}px`,
                                        }}
                                        className="object-contain"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            ) : (
                                <div
                                    style={{ height: `${Math.round(42 * additionalSignatureScale)}px` }}
                                    className="w-[190px] flex items-end justify-center mb-1 font-serif italic text-slate-700 transition-all duration-200"
                                >
                                    <span style={{ fontSize: `${Math.round(15 * additionalSignatureScale)}px` }}>
                                        {data.additionalAuthorizerName || 'Authorized Signatory'}
                                    </span>
                                </div>
                            )}
                            <div className="w-[200px] h-[1.5px] bg-[#0c1e38]" />
                            <div className="w-[200px] text-center mt-0.5">
                                <p className="text-[11.5px] font-bold text-[#0c1e38]">{data.additionalAuthorizerName || 'Academic Head'}</p>
                                <p className="text-[9.5px] text-slate-500">{data.additionalAuthorizerPosition || 'Executive Board'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            {data.verificationUrl && (
                                <div className="p-1.5 bg-white border border-slate-200 rounded shadow-xs shrink-0">
                                    <CertificateQRCode value={data.verificationUrl} size={50} color={{ dark: '#0c1e38' }} />
                                </div>
                            )}
                            <div className="text-left text-[9.5px] text-slate-500 leading-tight">
                                <p className="font-bold text-[#0c1e38] text-[10.5px]">AUTHENTICITY VERIFIED</p>
                                <p className="mt-0.5">Scan to view the official online record.</p>
                                <p className="text-[#b8860b] font-semibold mt-0.5">GPI Verified Credential</p>
                            </div>
                        </div>
                    )}

                    {/* Center: Corporate Gold Emblem */}
                    <div className="flex justify-center">
                        <div className="w-[80px] h-[80px] rounded-full border-2 border-[#b8860b] p-1 flex items-center justify-center bg-linear-to-b from-amber-50 to-amber-100/60 shadow-xs">
                            <div className="w-full h-full rounded-full border border-dashed border-[#b8860b] flex flex-col items-center justify-center text-[#0c1e38] text-center">
                                <span className="text-[11.5px] font-black leading-none">GPI</span>
                                <span className="text-[6.5px] font-bold tracking-widest text-[#b8860b] uppercase mt-0.5">CERTIFIED</span>
                                <span className="text-[8.5px] text-[#b8860b]">★★★★★</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Signature */}
                    <div className="flex flex-col items-end">
                        {data.signatureUrl ? (
                            <div
                                style={{ height: `${Math.round(42 * signatureScale)}px` }}
                                className="w-[190px] flex items-end justify-center mb-1 transition-all duration-200"
                            >
                                <img
                                    src={data.signatureUrl}
                                    alt="Signature"
                                    style={{
                                        maxHeight: `${Math.round(40 * signatureScale)}px`,
                                        maxWidth: `${Math.round(180 * signatureScale)}px`,
                                    }}
                                    className="object-contain"
                                    crossOrigin="anonymous"
                                />
                            </div>
                        ) : (
                            <div
                                style={{ height: `${Math.round(42 * signatureScale)}px` }}
                                className="w-[190px] flex items-end justify-center mb-1 font-serif italic text-slate-700 transition-all duration-200"
                            >
                                <span style={{ fontSize: `${Math.round(15 * signatureScale)}px` }}>
                                    {data.authorizerName || 'Authorized Signatory'}
                                </span>
                            </div>
                        )}
                        <div className="w-[200px] h-[1.5px] bg-[#0c1e38]" />
                        <div className="w-[200px] text-center mt-0.5">
                            <p className="text-[11.5px] font-bold text-[#0c1e38]">{data.authorizerName || 'Executive Director'}</p>
                            <p className="text-[9.5px] text-slate-500">{data.authorizerPosition || 'Global Professional Institute'}</p>
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

