import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { type CertificateData, GPI_CERTIFICATE_CONSTANTS } from '../types';
import { CertificateQRCode } from '../CertificateQRCode';

interface TemplateProps {
    data: CertificateData;
}

export const GpiAcademicTemplate: React.FC<TemplateProps> = ({ data }) => {
    const barcodeRef = useRef<SVGSVGElement | null>(null);
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

    useEffect(() => {
        if (!barcodeRef.current || !serial) return;
        try {
            JsBarcode(barcodeRef.current, serial, {
                format: 'CODE128',
                width: isDualAuthorizer ? 1.4 : 1.8,
                height: isDualAuthorizer ? 26 : 48,
                displayValue: false,
                margin: 0,
                background: 'transparent',
                lineColor: '#111111',
            });
        } catch (error) {
            console.error('Barcode rendering error:', error);
        }
    }, [serial, isDualAuthorizer]);

    const formatDay = (d?: string) => {
        if (!d) return '__';
        const parsed = new Date(d);
        return Number.isNaN(parsed.getTime()) ? '__' : String(parsed.getDate()).padStart(2, '0');
    };

    const formatMonth = (d?: string) => {
        if (!d) return '________';
        const parsed = new Date(d);
        return Number.isNaN(parsed.getTime()) ? '________' : parsed.toLocaleDateString('en-US', { month: 'long' });
    };

    const formatYear = (d?: string) => {
        if (!d) return '____';
        const parsed = new Date(d);
        return Number.isNaN(parsed.getTime()) ? '____' : String(parsed.getFullYear());
    };

    return (
        <div
            id="certificate-render-canvas"
            className="w-[1120px] h-[792px] relative bg-white select-none overflow-hidden text-slate-900 font-serif"
            style={{ width: '1120px', height: '792px' }}
        >
            {/* 1. WATERMARK */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] flex justify-center items-center pointer-events-none z-[1]">
                <img
                    src={logoSrc}
                    alt="Watermark"
                    className="w-full h-full object-contain opacity-[0.08]"
                />
            </div>

            {/* 2. OUTER DECORATIVE BORDER */}
            <div className="absolute inset-0 p-[10px] bg-[#102f52] border border-[#0b2038] before:content-[''] before:absolute before:inset-[4px] before:border-2 before:border-[#c99b3d] before:pointer-events-none">
                {/* 3. INNER BORDER */}
                <div className="w-full h-full relative p-[13px] bg-white border-2 border-[#c79b43] before:content-[''] before:absolute before:inset-[5px] before:border before:border-[#172e4e] before:pointer-events-none">
                    {/* 4. PARCHMENT CONTENT CANVAS */}
                    <div className="w-full h-full relative overflow-hidden bg-[radial-gradient(circle_at_center,rgba(224,218,198,0.09),transparent_50%),#ffffff]">
                        {/* CORNER ORNAMENTS */}
                        <div className="w-[70px] h-[70px] absolute z-[5] text-[#b48a43] text-[65px] leading-none pointer-events-none top-[7px] left-[8px]">
                            <span className="block -rotate-[10deg]">❧</span>
                        </div>
                        <div className="w-[70px] h-[70px] absolute z-[5] text-[#b48a43] text-[65px] leading-none pointer-events-none top-[7px] right-[8px] scale-x-[-1]">
                            <span className="block">❧</span>
                        </div>
                        <div className="w-[70px] h-[70px] absolute z-[5] text-[#b48a43] text-[65px] leading-none pointer-events-none bottom-[7px] left-[8px] scale-y-[-1]">
                            <span className="block">❧</span>
                        </div>
                        <div className="w-[70px] h-[70px] absolute z-[5] text-[#b48a43] text-[65px] leading-none pointer-events-none right-[8px] bottom-[7px] rotate-180">
                            <span className="block">❧</span>
                        </div>

                        {/* QR CODE & SERIAL (Top Right Corner inside border) */}
                        {isDualAuthorizer ? (
                            <div className="absolute top-[14px] right-[9px] z-[6] flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-lg border border-[#c79b43]/50 shadow-xs">
                                {data.verificationUrl && (
                                    <div className="flex flex-col items-center">
                                        <CertificateQRCode value={data.verificationUrl} size={46} color={{ dark: '#102f52' }} />
                                    </div>
                                )}
                                <div className="text-left font-sans border-l border-gray-200 pl-2.5">
                                    <p className="text-[8.5px] font-bold text-[#102f52] tracking-wider uppercase">Certificate Serial</p>
                                    <p className="text-[10.5px] font-mono font-bold text-gray-900 leading-tight">{serial}</p>
                                    <div className="w-[135px] h-[22px] overflow-hidden mt-0.5">
                                        <svg ref={barcodeRef} className="w-[135px] h-[22px]" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            data.verificationUrl && (
                                <div className="absolute top-[15px] right-[9px] z-[6] flex flex-col items-center bg-white p-1.5 rounded border border-[#c79b43]/40 shadow-xs">
                                    <CertificateQRCode value={data.verificationUrl} size={54} color={{ dark: '#102f52' }} />
                                    <span className="text-[8px] font-sans font-semibold tracking-wider text-[#102f52] mt-0.5 uppercase">
                                        Verify
                                    </span>
                                </div>
                            )
                        )}

                        {/* HEADER */}
                        <header className="relative text-center pt-[18px] z-[2]">
                            {/* Fixed-height slot — layout never changes */}
                            <div
                                className="mx-auto mb-[4px] w-[105px] h-[105px] flex justify-center items-center relative"
                                style={{ overflow: 'visible' }}
                            >
                                <img
                                    src={logoSrc}
                                    alt="Logo"
                                    className="max-w-full max-h-full object-contain"
                                    crossOrigin="anonymous"
                                    style={{
                                        transform: `scale(${logoScale})`,
                                        transformOrigin: 'center center',
                                        transition: 'transform 0.2s ease',
                                    }}
                                />
                            </div>

                            <h1 className="mt-[2px] mb-0 text-[26px] font-bold tracking-[0.6px] text-[#102e57] uppercase">
                                {orgName}
                            </h1>

                            <h2 className="mt-[14px] mb-[2px] text-[40px] leading-[1.1] font-normal tracking-[1.5px] text-[#a87929]">
                                CERTIFICATE OF ACHIEVEMENT
                            </h2>

                            <div className="w-[180px] mx-auto mt-[4px] flex items-center justify-center gap-[7px]">
                                <span className="h-[1px] flex-1 bg-[#bd9144]" />
                                <b className="text-[#bd9144] text-[13px]">✦</b>
                                <span className="h-[1px] flex-1 bg-[#bd9144]" />
                            </div>
                        </header>

                        {/* MAIN CONTENT */}
                        <main className="relative z-[2] text-center mt-[14px]">
                            <p className="m-0 text-[18px] text-[#292929]">This is to certify that</p>

                            <div className="min-h-[44px] my-[6px_2px] mx-auto w-[68%] px-[12px] pb-[4px] text-[28px] font-bold text-[#17243a] whitespace-nowrap overflow-hidden text-ellipsis">
                                {data.studentName || 'Student Name'}
                            </div>

                            <div className="w-[66%] h-[1px] mx-auto mb-[12px] bg-[#1b1b1b]" />

                            <p className="m-0 text-[16px] text-[#282828]">has successfully passed the examination in</p>

                            <div className="w-[60%] min-h-[32px] mt-1 mx-auto pb-[2px] border-b border-[#222] text-[20px] font-semibold text-[#202020] whitespace-nowrap overflow-hidden text-ellipsis">
                                {data.courseName || 'Examination Name'}
                            </div>

                            <p className="mt-2 mb-0 text-[16px] text-[#282828]">
                                conducted by {orgName}.
                            </p>

                            <p className="mt-[8px] mb-0 text-[16px] text-[#282828]">
                                We commend the dedication and hard work demonstrated.
                            </p>

                            <p className="mt-[12px] mb-0 text-[15px] text-[#282828]">
                                Awarded on this{' '}
                                <span className="inline-block min-w-[36px] px-[4px] pb-[1px] border-b border-[#444] font-semibold">
                                    {formatDay(data.issueDate)}
                                </span>{' '}
                                day of{' '}
                                <span className="inline-block min-w-[70px] px-[4px] pb-[1px] border-b border-[#444] font-semibold">
                                    {formatMonth(data.issueDate)}
                                </span>
                                ,{' '}
                                <span className="inline-block min-w-[45px] px-[4px] pb-[1px] border-b border-[#444] font-semibold">
                                    {formatYear(data.issueDate)}
                                </span>
                                .
                            </p>
                        </main>

                        {/* BOTTOM SECTION */}
                        <section className="absolute left-[48px] right-[48px] bottom-[72px] h-[105px] grid grid-cols-[1fr_150px_1fr] items-center z-[3]">
                            {/* LEFT: ADDITIONAL AUTHORIZER (If enabled) or SERIAL & BARCODE */}
                            {isDualAuthorizer ? (
                                <div className="self-end text-center pr-[20px] flex flex-col items-start">
                                    <div className="w-[220px] h-[46px] mb-1 flex items-end justify-center relative overflow-visible">
                                        {data.additionalSignatureUrl ? (
                                            <img
                                                src={data.additionalSignatureUrl}
                                                alt="Additional Signature"
                                                className="max-h-[44px] max-w-[200px] object-contain"
                                                crossOrigin="anonymous"
                                                style={{
                                                    transform: `scale(${additionalSignatureScale})`,
                                                    transformOrigin: 'bottom center',
                                                    transition: 'transform 0.2s ease',
                                                }}
                                            />
                                        ) : (
                                            <span
                                                className="font-serif italic text-gray-700"
                                                style={{
                                                    fontSize: '16px',
                                                    transform: `scale(${additionalSignatureScale})`,
                                                    transformOrigin: 'bottom center',
                                                }}
                                            >
                                                {data.additionalAuthorizerName || 'Authorized Signatory'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-[240px] h-[1px] bg-[#1b1b1b]" />
                                    <div className="w-[240px] mt-[5px] text-center">
                                        <p className="m-0 text-[13px] font-semibold text-[#111]">
                                            {data.additionalAuthorizerName || 'Authorized Signatory'}
                                        </p>
                                        <p className="m-0 text-[11px] text-[#555]">
                                            {data.additionalAuthorizerPosition || 'Academic Head'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="self-end text-left">
                                    <div className="mb-[4px] font-sans text-[12px] font-medium text-[#161616]">
                                        <strong className="font-[750]">Serial Number:</strong> {serial}
                                    </div>

                                    <div className="w-[240px] h-[48px] overflow-hidden">
                                        <svg ref={barcodeRef} className="w-[240px] h-[48px]" />
                                    </div>

                                    <div className="w-[240px] text-center mt-0.5 font-sans text-[10px] text-[#333] tracking-wider">
                                        {serial}
                                    </div>
                                </div>
                            )}

                            {/* CENTER: SCALLOPED GOLD SEAL */}
                            <div className="flex items-center justify-center">
                                <div className="w-[105px] h-[105px] relative flex items-center justify-center bg-[repeating-conic-gradient(from_0deg,#a87513_0deg_5deg,#e0b64f_5deg_10deg)] [clip-path:polygon(50%_0%,57%_8%,66%_4%,71%_13%,81%_12%,84%_22%,94%_25%,92%_35%,100%_42%,94%_50%,100%_59%,92%_66%,94%_76%,84%_79%,81%_89%,71%_87%,66%_96%,57%_92%,50%_100%,43%_92%,34%_96%,29%_87%,19%_89%,16%_79%,6%_76%,8%_66%,0%_59%,6%_50%,0%_42%,8%_35%,6%_25%,16%_22%,19%_12%,29%_13%,34%_4%,43%_8%)]">
                                    <div className="w-[84px] h-[84px] flex items-center justify-center rounded-full bg-[#c69625] shadow-[inset_0_0_0_2px_#f2d681,inset_0_0_0_5px_#a8730c]">
                                        <div className="w-[66px] h-[66px] rounded-full flex flex-col items-center justify-center border border-[#f0d178] text-[#fff3bc] text-center">
                                            <div className="text-[14px] leading-none">🎓</div>
                                            <div className="mt-[1px] font-sans text-[19px] font-extrabold tracking-tight">GPI</div>
                                            <div className="mt-[0.5px] text-[11px]">★</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: PRIMARY AUTHORIZER SIGNATURE */}
                            <div className="self-end text-center pl-[20px] flex flex-col items-end">
                                <div className="w-[220px] h-[46px] mb-1 flex items-end justify-center relative overflow-visible">
                                    {data.signatureUrl ? (
                                        <img
                                            src={data.signatureUrl}
                                            alt="Signature"
                                            className="max-h-[44px] max-w-[200px] object-contain"
                                            crossOrigin="anonymous"
                                            style={{
                                                transform: `scale(${signatureScale})`,
                                                transformOrigin: 'bottom center',
                                                transition: 'transform 0.2s ease',
                                            }}
                                        />
                                    ) : (
                                        <span
                                            className="font-serif italic text-gray-700"
                                            style={{
                                                fontSize: '16px',
                                                transform: `scale(${signatureScale})`,
                                                transformOrigin: 'bottom center',
                                            }}
                                        >
                                            {data.authorizerName || 'Authorized Signatory'}
                                        </span>
                                    )}
                                </div>
                                <div className="w-[240px] h-[1px] bg-[#1b1b1b]" />
                                <div className="w-[240px] mt-[5px] text-center">
                                    <p className="m-0 text-[13px] font-semibold text-[#111]">
                                        {data.authorizerName || 'Authorized Signatory'}
                                    </p>
                                    <p className="m-0 text-[11px] text-[#555]">
                                        {data.authorizerPosition || 'Director'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* FOOTER METADATA */}
                        <footer className="absolute left-[58px] right-[58px] bottom-[14px] flex flex-col items-center justify-center gap-1 z-[4] text-[11px] text-[#233450]">
                            <div className="flex items-center justify-center gap-4 text-[11px] text-[#233450]">
                                <div className="flex items-center gap-[5px] whitespace-nowrap">
                                    <span className="text-[12px] text-[#172f55]">●</span>
                                    <span>Website: {website}</span>
                                </div>

                                <div className="w-[1px] h-[12px] bg-[#a9a9a9]" />

                                <div className="flex items-center gap-[5px] whitespace-nowrap">
                                    <span className="text-[12px] text-[#172f55]">✉</span>
                                    <span>Email: {email}</span>
                                </div>

                                <div className="w-[1px] h-[12px] bg-[#a9a9a9]" />

                                <div className="flex items-center gap-[5px] whitespace-nowrap">
                                    <span className="text-[12px] text-[#172f55]">☎</span>
                                    <span>Mobile: {mobile}</span>
                                </div>
                            </div>

                            <p className="m-0 text-[9px] text-[#556987] font-sans tracking-wide">
                                {poweredBy}
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

