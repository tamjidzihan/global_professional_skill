import React from 'react';
import { type CertificateData, GPI_CERTIFICATE_CONSTANTS } from '../types';
import { CertificateQRCode } from '../CertificateQRCode';

interface TemplateProps {
    data: CertificateData;
}

export const ProfessionalClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
    const logoSrc = data.logoUrl || '/gpilogo_icon.png';
    const serial = data.certificateNumber || 'GPI-SJO-4484-487641';
    const orgName =
        data.organizationName || GPI_CERTIFICATE_CONSTANTS.ORGANIZATION_NAME;
    const website = GPI_CERTIFICATE_CONSTANTS.WEBSITE;
    const email = GPI_CERTIFICATE_CONSTANTS.EMAIL;
    const mobile = GPI_CERTIFICATE_CONSTANTS.MOBILE;
    const poweredBy = GPI_CERTIFICATE_CONSTANTS.POWERED_BY;

    const logoScale = Math.max(
        0.4,
        Math.min(2.0, (data.logoSize || 100) / 100)
    );

    const signatureScale = Math.max(
        0.4,
        Math.min(2.0, (data.signatureSize || 100) / 100)
    );

    const isDualAuthorizer = Boolean(data.enableAdditionalAuthorizer);

    const additionalSignatureScale = Math.max(
        0.4,
        Math.min(2.0, (data.additionalSignatureSize || 100) / 100)
    );

    const formatDateStr = (d?: string) => {
        if (!d) return 'September 16, 2026';

        const parsed = new Date(d);

        return Number.isNaN(parsed.getTime())
            ? d
            : parsed.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
              });
    };

    return (
        <div
            id="certificate-render-canvas"
            className="w-280 h-198 relative bg-[#fdfbf7] select-none overflow-hidden text-slate-900 font-serif"
            style={{
                width: '1120px',
                height: '792px',
            }}
        >
            {/* =========================================================
                WATERMARK
            ========================================================= */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] h-[65%] flex justify-center items-center pointer-events-none z-1">
                <img
                    src={logoSrc}
                    alt="Watermark"
                    className="w-full h-full object-contain opacity-[0.06]"
                />
            </div>

            {/* =========================================================
                CLASSIC MULTI-LINE ORNATE BORDER
            ========================================================= */}
            <div className="absolute inset-0 p-3.5 bg-[#f8f5ee] border-12 border-[#1a2e4c]">
                <div className="w-full h-full relative p-2 border-2 border-[#b8860b] before:content-[''] before:absolute before:inset-1 before:border before:border-[#8b1e1e]/40">
                    <div className="w-full h-full relative p-3 border border-[#b8860b]/60 bg-radial from-amber-50/40 via-white to-[#fdfbf7]">

                        {/* =================================================
                            ORNATE CORNER ACCENTS
                        ================================================= */}
                        <div className="absolute top-2 left-2 text-[#b8860b] text-[32px] leading-none pointer-events-none select-none">
                            ❖
                        </div>

                        <div className="absolute top-2 right-2 text-[#b8860b] text-[32px] leading-none pointer-events-none select-none">
                            ❖
                        </div>

                        <div className="absolute bottom-2 left-2 text-[#b8860b] text-[32px] leading-none pointer-events-none select-none">
                            ❖
                        </div>

                        <div className="absolute bottom-2 right-2 text-[#b8860b] text-[32px] leading-none pointer-events-none select-none">
                            ❖
                        </div>

                        {/* =================================================
                            TOP HEADER
                        ================================================= */}
                        <header className="relative text-center pt-6 z-2">
                            <div className="flex items-center justify-center gap-4 mb-2">
                                {/* Logo */}
                                <div className="w-35 h-25 flex items-center justify-center shrink-0 relative mr-4">
                                    <img
                                        src={logoSrc}
                                        alt="Logo"
                                        crossOrigin="anonymous"
                                        className="object-contain absolute left-1/2 top-1/2"
                                        style={{
                                            width: `${Math.round(
                                                90 * logoScale
                                            )}px`,
                                            height: `${Math.round(
                                                90 * logoScale
                                            )}px`,
                                            transform:
                                                'translate(-50%, -50%)',
                                            transition:
                                                'width 0.2s ease, height 0.2s ease',
                                        }}
                                    />
                                </div>

                                {/* Organization */}
                                <div className="text-left">
                                    <h1 className="font-serif text-[24px] font-extrabold tracking-[1px] text-[#1a2e4c] leading-tight uppercase">
                                        {orgName}
                                    </h1>

                                    <p className="text-[12px] tracking-[2px] text-[#b8860b] font-sans font-bold uppercase mt-0.5">
                                        Excellence in Professional Education
                                    </p>
                                </div>
                            </div>

                            {/* Decorative divider */}
                            <div className="w-125 mx-auto flex items-center justify-center gap-3">
                                <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-[#b8860b] to-[#b8860b]" />

                                <span className="text-[#8b1e1e] text-[18px]">
                                    ✦ ✤ ✦
                                </span>

                                <div className="h-0.5 flex-1 bg-linear-to-l from-transparent via-[#b8860b] to-[#b8860b]" />
                            </div>

                            {/* Certificate title */}
                            <h2 className="text-[36px] font-normal tracking-[2px] text-[#8b1e1e] uppercase">
                                Certificate of Completion
                            </h2>

                            <p className="text-[14px] font-sans tracking-[3px] text-[#555] uppercase mt-1">
                                THIS IS PROUDLY PRESENTED TO
                            </p>
                        </header>

                        {/* =================================================
                            RECIPIENT SECTION
                        ================================================= */}
                        <main className="relative z-2 text-center">
                            <div className="min-h-12.5 mx-auto w-[75%] px-6 pt-3 text-[34px] font-bold text-[#1a2e4c] whitespace-nowrap overflow-hidden text-ellipsis italic">
                                {data.studentName || 'Recipient Name'}
                            </div>

                            <div className="w-[60%] h-0.5 mx-auto bg-linear-to-r from-transparent via-[#b8860b] to-transparent mb-6" />

                            <p className="text-[15px] text-[#444] max-w-180 mx-auto leading-relaxed">
                                for successfully fulfilling all academic
                                requirements, curriculum coursework, and
                                assessments for the program
                            </p>

                            <div className="min-h-9 mt-2 mb-1 text-[27px] font-bold text-[#1a2e4c] tracking-wide">
                                "{data.courseName || 'Course Title'}"
                            </div>

                            <p className="text-[14px] text-[#666] mt-2">
                                Conferred on{' '}
                                <strong className="text-[#222]">
                                    {formatDateStr(data.issueDate)}
                                </strong>
                            </p>
                        </main>

                        {/* =================================================
                            BOTTOM METADATA & SIGNATURES GRID
                        ================================================= */}
                        <div className="absolute left-9 right-9 bottom-8.5 grid grid-cols-3 items-end z-3">

                            {/* =================================================
                                LEFT COLUMN
                                DUAL MODE:
                                Additional Authorizer Signature

                                SINGLE MODE:
                                QR + Certificate ID
                            ================================================= */}
                            {isDualAuthorizer ? (
                                <div className="text-left flex flex-col items-start">

                                    {/* Additional Authorizer Signature */}
                                    {data.additionalSignatureUrl ? (
                                        <div
                                            style={{
                                                height: `${Math.round(
                                                    44 *
                                                        additionalSignatureScale
                                                )}px`,
                                            }}
                                            className="w-50 mb-1 flex items-end justify-center transition-all duration-200"
                                        >
                                            <img
                                                src={
                                                    data.additionalSignatureUrl
                                                }
                                                alt="Additional Signature"
                                                style={{
                                                    maxHeight: `${Math.round(
                                                        42 *
                                                            additionalSignatureScale
                                                    )}px`,
                                                    maxWidth: `${Math.round(
                                                        190 *
                                                            additionalSignatureScale
                                                    )}px`,
                                                }}
                                                className="object-contain"
                                                crossOrigin="anonymous"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                height: `${Math.round(
                                                    44 *
                                                        additionalSignatureScale
                                                )}px`,
                                            }}
                                            className="w-50 mb-1 flex items-end justify-center font-serif italic text-gray-700 transition-all duration-200"
                                        >
                                            <span
                                                style={{
                                                    fontSize: `${Math.round(
                                                        16 *
                                                            additionalSignatureScale
                                                    )}px`,
                                                }}
                                            >
                                                {data.additionalAuthorizerName ||
                                                    'Authorized Signatory'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Signature line */}
                                    <div className="w-55 h-[1.5px] bg-[#1a2e4c]" />

                                    {/* Authorizer information */}
                                    <div className="w-55 text-center mt-1">
                                        <p className="text-[12px] font-bold text-[#1a2e4c]">
                                            {data.additionalAuthorizerName ||
                                                'Academic Head'}
                                        </p>

                                        <p className="text-[10px] text-gray-500 font-sans">
                                            {data.additionalAuthorizerPosition ||
                                                'Global Professional Institute'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* =================================================
                                   SINGLE AUTHORISER QR / SERIAL
                                ================================================= */
                                <div className="flex items-center gap-3">
                                    {data.verificationUrl ? (
                                        <div className="p-1.5 bg-white border border-[#b8860b]/40 rounded shadow-xs shrink-0">
                                            <CertificateQRCode
                                                value={
                                                    data.verificationUrl
                                                }
                                                size={54}
                                                color={{
                                                    dark: '#1a2e4c',
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-13.5 h-13.5 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                                            QR
                                        </div>
                                    )}

                                    <div className="text-left text-[11px] font-sans text-gray-700">
                                        <p className="font-bold text-[#1a2e4c]">
                                            CERTIFICATE ID
                                        </p>

                                        <p className="font-mono text-[11px] text-gray-800">
                                            {serial}
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            Scan to verify authenticity
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                CENTER COLUMN
                                AUTHENTIC EMBOSSED GOLD MEDALLION SEAL
                            ================================================= */}
                            <div className="flex flex-col items-center justify-center relative -top-16 z-5">

                                {/* Classic Draped Ribbon Tails */}
                                <div className="absolute top-16 flex justify-center items-center pointer-events-none z-1">

                                    {/* Left Ribbon */}
                                    <div className="w-6.5 h-13.5 bg-linear-to-b from-[#8b1e1e] via-[#6e1414] to-[#450a0a] -rotate-22 origin-top-right shadow-md [clip-path:polygon(0%_0%,100%_0%,100%_100%,50%_80%,0%_100%)] border-l border-r border-[#d4af37]/60" />

                                    {/* Right Ribbon */}
                                    <div className="w-6.5 h-13.5 bg-linear-to-b from-[#8b1e1e] via-[#6e1414] to-[#450a0a] rotate-22 origin-top-left shadow-md [clip-path:polygon(0%_0%,100%_0%,100%_100%,50%_80%,0%_100%)] border-l border-r border-[#d4af37]/60" />
                                </div>

                                {/* Embossed Gold Medallion */}
                                <div className="relative z-2 w-25 h-25 drop-shadow-[0_5px_10px_rgba(0,0,0,0.3)] flex items-center justify-center">

                                    {/* Outer 24-point Scalloped Starburst */}
                                    <div className="w-25 h-25 absolute inset-0 flex items-center justify-center bg-[repeating-conic-gradient(from_0deg,#d4af37_0deg_7.5deg,#f3e5ab_7.5deg_15deg)] [clip-path:polygon(50%_0%,57%_8%,66%_4%,71%_13%,81%_12%,84%_22%,94%_25%,92%_35%,100%_42%,94%_50%,100%_59%,92%_66%,94%_76%,84%_79%,81%_89%,71%_87%,66%_96%,57%_92%,50%_100%,43%_92%,34%_96%,29%_87%,19%_89%,16%_79%,6%_76%,8%_66%,0%_59%,6%_50%,0%_42%,8%_35%,6%_25%,16%_22%,19%_12%,29%_13%,34%_4%,43%_8%)]" />

                                    {/* Inner Metallic Gold Rim */}
                                    <div className="w-20.5 h-20.5 relative z-3 rounded-full bg-linear-to-br from-[#fff2b2] via-[#d4af37] to-[#8b6508] p-0.75 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center">

                                        {/* Rope / Beaded Security Ring */}
                                        <div className="w-full h-full rounded-full border-[1.5px] border-dashed border-[#5a3e02]/70 bg-linear-to-b from-[#f9e8a2] via-[#e5be54] to-[#b8860b] p-0.5 flex items-center justify-center shadow-inner">

                                            {/* Core Gold Center */}
                                            <div className="w-full h-full rounded-full border border-[#ffeaa7] bg-[radial-gradient(circle_at_35%_30%,#fff9db_0%,#e0be53_40%,#b8860b_75%,#7a5203_100%)] flex flex-col items-center justify-center text-center select-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.4)]">

                                                <span className="text-[6.5px] font-sans font-black tracking-[1.5px] text-[#3d2703] drop-shadow-[0_0.5px_0_rgba(255,255,255,0.7)] uppercase leading-none">
                                                    ★ OFFICIAL ★
                                                </span>

                                                <span className="text-[16px] leading-tight text-[#3d2703] my-0.2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
                                                    ⚜
                                                </span>

                                                <span className="text-[9px] font-serif font-black tracking-widest text-[#2c1b01] drop-shadow-[0_0.5px_0_rgba(255,255,255,0.8)] uppercase leading-none">
                                                    GPI
                                                </span>

                                                <span className="text-[5.5px] font-sans font-extrabold tracking-[1px] text-[#422b04] uppercase mt-0.5 leading-none">
                                                    AUTHENTIC
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* =================================================
                                RIGHT COLUMN
                                DUAL MODE:
                                QR + SERIAL ABOVE MAIN SIGNATURE

                                SINGLE MODE:
                                MAIN SIGNATURE ONLY
                            ================================================= */}
                            <div className="text-right flex flex-col items-end">

                                {/* =================================================
                                    QR & SERIAL BADGE
                                    ONLY VISIBLE IN DUAL-AUTHORIZER MODE
                                ================================================= */}
                                {isDualAuthorizer && (
                                    <div className="w-full flex justify-end mb-2">
                                        <div className="flex items-center gap-2.5 bg-white px-2.5 py-1.5 rounded border border-[#b8860b]/25 shadow-xs">

                                            {/* QR Code */}
                                            {data.verificationUrl ? (
                                                <div className="p-1 bg-white border border-[#b8860b]/40 rounded shrink-0">
                                                    <CertificateQRCode
                                                        value={
                                                            data.verificationUrl
                                                        }
                                                        size={42}
                                                        color={{
                                                            dark: '#1a2e4c',
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-11 h-11 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[9px] text-gray-400">
                                                    QR
                                                </div>
                                            )}

                                            {/* Certificate ID */}
                                            <div className="text-left font-sans min-w-0">
                                                <p className="font-bold text-[#1a2e4c] text-[8.5px] tracking-[1px] uppercase">
                                                    CERTIFICATE ID
                                                </p>

                                                <p className="font-mono text-[9.5px] font-bold text-gray-800 leading-tight max-w-[150px] truncate">
                                                    {serial}
                                                </p>

                                                <p className="text-[8px] text-[#b8860b] font-medium mt-0.5">
                                                    Scan to verify
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* MAIN AUTHORISER SIGNATURE */}
                                {data.signatureUrl ? (
                                    <div
                                        style={{
                                            height: `${Math.round(
                                                44 * signatureScale
                                            )}px`,
                                        }}
                                        className="w-50 mb-1 flex items-end justify-center transition-all duration-200"
                                    >
                                        <img
                                            src={data.signatureUrl}
                                            alt="Signature"
                                            style={{
                                                maxHeight: `${Math.round(
                                                    42 * signatureScale
                                                )}px`,
                                                maxWidth: `${Math.round(
                                                    190 * signatureScale
                                                )}px`,
                                            }}
                                            className="object-contain"
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            height: `${Math.round(
                                                44 * signatureScale
                                            )}px`,
                                        }}
                                        className="w-50 mb-1 flex items-end justify-center font-serif italic text-gray-700 transition-all duration-200"
                                    >
                                        <span
                                            style={{
                                                fontSize: `${Math.round(
                                                    16 * signatureScale
                                                )}px`,
                                            }}
                                        >
                                            {data.authorizerName ||
                                                'Authorized Signatory'}
                                        </span>
                                    </div>
                                )}

                                {/* Signature Line */}
                                <div className="w-55 h-[1.5px] bg-[#1a2e4c]" />

                                {/* Authorizer Details */}
                                <div className="w-55 text-center mt-1">
                                    <p className="text-[12px] font-bold text-[#1a2e4c]">
                                        {data.authorizerName ||
                                            'Academic Director'}
                                    </p>

                                    <p className="text-[10px] text-gray-500 font-sans">
                                        {data.authorizerPosition ||
                                            'Global Professional Institute'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CONSTANT FOOTER */}
                        <footer className="absolute left-9 right-9 bottom-2.5 flex flex-col items-center justify-center gap-0.5 z-4">
                            <div className="flex items-center justify-center gap-4 text-[10px] text-[#1a2e4c] font-sans">
                                <span>
                                    Website: {website}
                                </span>

                                <span className="text-gray-400">
                                    •
                                </span>

                                <span>
                                    Email: {email}
                                </span>

                                <span className="text-gray-400">
                                    •
                                </span>

                                <span>
                                    Mobile: {mobile}
                                </span>
                            </div>

                            <p className="pt-2 text-[8.5px] text-gray-500 font-sans tracking-wider">
                                {poweredBy}
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};