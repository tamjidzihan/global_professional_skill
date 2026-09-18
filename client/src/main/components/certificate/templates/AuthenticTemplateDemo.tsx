import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { type CertificateData, GPI_CERTIFICATE_CONSTANTS } from '../types';
import { CertificateQRCode } from '../CertificateQRCode';
import { getMediaUrl } from '../../../../lib/api';

interface TemplateProps {
    data: CertificateData;
}

/* ── Engraved corner filigree ─────────────────────────────────────────────── */
const CornerFiligree: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg viewBox="0 0 96 96" className={className} fill="none" aria-hidden="true">
        <path
            d="M2 42C2 20 20 2 42 2"
            stroke="#A67C1F"
            strokeWidth="1.1"
            strokeLinecap="round"
        />
        <path
            d="M9 46C9 25 25 9 46 9"
            stroke="#A67C1F"
            strokeWidth="0.6"
            strokeLinecap="round"
            opacity="0.75"
        />
        <path
            d="M14 20c8-4 16-4 22 1M20 14c-4 8-4 16 1 22"
            stroke="#A67C1F"
            strokeWidth="0.9"
            strokeLinecap="round"
        />
        <path
            d="M27 27c6-7 15-8 21-3-7 1-12 4-14 9-5 2-8 7-9 14-5-6-4-15 2-20Z"
            fill="#C09A3E"
            opacity="0.55"
        />
        <circle cx="41" cy="41" r="2.4" fill="#A67C1F" />
        <circle cx="62" cy="10" r="1.5" fill="#A67C1F" opacity="0.8" />
        <circle cx="10" cy="62" r="1.5" fill="#A67C1F" opacity="0.8" />
    </svg>
);

/* ── Guilloche rosette field (banknote-style security engraving) ──────────── */
const GuillocheField: React.FC = () => (
    <svg
        viewBox="0 0 1120 792"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
    >
        <defs>
            <pattern id="gpi-guilloche" width="72" height="72" patternUnits="userSpaceOnUse">
                <g stroke="#0D2240" strokeWidth="0.35" fill="none" opacity="0.13">
                    <circle cx="36" cy="36" r="30" />
                    <ellipse cx="36" cy="36" rx="30" ry="12" />
                    <ellipse cx="36" cy="36" rx="30" ry="12" transform="rotate(45 36 36)" />
                    <ellipse cx="36" cy="36" rx="30" ry="12" transform="rotate(90 36 36)" />
                    <ellipse cx="36" cy="36" rx="30" ry="12" transform="rotate(135 36 36)" />
                </g>
            </pattern>
            <radialGradient id="gpi-guilloche-fade" cx="50%" cy="50%" r="62%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
                <stop offset="58%" stopColor="#fff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="gpi-guilloche-mask">
                <rect width="1120" height="792" fill="url(#gpi-guilloche-fade)" />
            </mask>
        </defs>
        <rect width="1120" height="792" fill="url(#gpi-guilloche)" mask="url(#gpi-guilloche-mask)" />
    </svg>
);

/* ── Intaglio seal ───────────────────────────────────────────────────────── */
const InstitutionalSeal: React.FC<{ size?: number }> = ({ size = 118 }) => (
    <svg
        viewBox="0 0 118 118"
        style={{ width: size, height: size }}
        aria-hidden="true"
    >
        <defs>
            <path
                id="gpi-seal-arc-top"
                d="M59 59 m -44 0 a 44 44 0 1 1 88 0"
                transform="rotate(-2 59 59)"
            />
            <path
                id="gpi-seal-arc-bottom"
                d="M59 59 m 40 0 a 40 40 0 1 1 -80 0"
            />
            <radialGradient id="gpi-seal-metal" cx="36%" cy="30%" r="76%">
                <stop offset="0%" stopColor="#F6E6B4" />
                <stop offset="45%" stopColor="#D2AE55" />
                <stop offset="78%" stopColor="#A67C1F" />
                <stop offset="100%" stopColor="#77560D" />
            </radialGradient>
        </defs>

        {/* milled rim */}
        <circle cx="59" cy="59" r="57" fill="url(#gpi-seal-metal)" />
        {Array.from({ length: 72 }).map((_, i) => (
            <rect
                key={i}
                x="58.4"
                y="1"
                width="1.2"
                height="6"
                fill="#8A6410"
                opacity="0.55"
                transform={`rotate(${i * 5} 59 59)`}
            />
        ))}

        <circle cx="59" cy="59" r="50" fill="#FBF3DC" />
        <circle cx="59" cy="59" r="50" fill="none" stroke="#8A6410" strokeWidth="1.1" />
        <circle cx="59" cy="59" r="46" fill="none" stroke="#A67C1F" strokeWidth="0.5" />
        <circle cx="59" cy="59" r="34" fill="none" stroke="#A67C1F" strokeWidth="0.7" />
        <circle
            cx="59"
            cy="59"
            r="31"
            fill="none"
            stroke="#8A6410"
            strokeWidth="0.8"
            strokeDasharray="1 3.2"
            strokeLinecap="round"
        />

        <text
            fill="#6E4F0B"
            fontSize="7.6"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="700"
            letterSpacing="2.1"
        >
            <textPath href="#gpi-seal-arc-top" startOffset="50%" textAnchor="middle">
                GLOBAL PROFESSIONAL INSTITUTE
            </textPath>
        </text>
        <text
            fill="#6E4F0B"
            fontSize="6.4"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="600"
            letterSpacing="2.4"
        >
            <textPath href="#gpi-seal-arc-bottom" startOffset="50%" textAnchor="middle">
                OFFICIAL SEAL OF EXAMINATION
            </textPath>
        </text>

        {/* monogram */}
        <text
            x="59"
            y="63"
            textAnchor="middle"
            fill="#0D2240"
            fontSize="23"
            fontFamily="ui-serif, Georgia, serif"
            fontWeight="700"
            letterSpacing="1.4"
        >
            GPI
        </text>
        <path d="M44 71h30" stroke="#A67C1F" strokeWidth="0.9" />
        <text
            x="59"
            y="80"
            textAnchor="middle"
            fill="#6E4F0B"
            fontSize="6"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="700"
            letterSpacing="1.6"
        >
            EST. 2019
        </text>

        {/* laurel sprigs */}
        <g stroke="#A67C1F" strokeWidth="0.9" fill="none" opacity="0.9">
            <path d="M34 46c-4 6-5 14-2 21" />
            <path d="M84 46c4 6 5 14 2 21" />
        </g>
        <g fill="#C09A3E" opacity="0.75">
            {[0, 1, 2, 3].map((i) => (
                <ellipse key={`l${i}`} cx={31.5 - i * 0.4} cy={50 + i * 5} rx="2.6" ry="1.5" transform={`rotate(${-35 + i * 6} ${31.5} ${50 + i * 5})`} />
            ))}
            {[0, 1, 2, 3].map((i) => (
                <ellipse key={`r${i}`} cx={86.5 + i * 0.4} cy={50 + i * 5} rx="2.6" ry="1.5" transform={`rotate(${35 - i * 6} ${86.5} ${50 + i * 5})`} />
            ))}
        </g>
    </svg>
);

export const GpiAcademicTemplate: React.FC<TemplateProps> = ({ data }) => {
    const barcodeRef = useRef<SVGSVGElement | null>(null);

    const logoSrc = getMediaUrl(data.logoUrl) || '/gpilogo_icon.png';
    const serial = data.certificateNumber || 'GPI-SJO-4484-487641';
    const orgName = data.organizationName || GPI_CERTIFICATE_CONSTANTS.ORGANIZATION_NAME;
    const website = GPI_CERTIFICATE_CONSTANTS.WEBSITE;
    const email = GPI_CERTIFICATE_CONSTANTS.EMAIL;
    const mobile = GPI_CERTIFICATE_CONSTANTS.MOBILE;
    const poweredBy = GPI_CERTIFICATE_CONSTANTS.POWERED_BY;

    const logoScale = Math.max(0.4, Math.min(2.0, (data.logoSize || 100) / 100));
    const signatureScale = Math.max(0.4, Math.min(2.0, (data.signatureSize || 100) / 100));
    const signatureSrc = getMediaUrl(data.signatureUrl);

    useEffect(() => {
        if (!barcodeRef.current || !serial) return;
        try {
            JsBarcode(barcodeRef.current, serial, {
                format: 'CODE128',
                width: 1.55,
                height: 40,
                displayValue: false,
                margin: 0,
                background: 'transparent',
                lineColor: '#0D2240',
            });
        } catch (error) {
            console.error('Barcode rendering error:', error);
        }
    }, [serial]);

    const parse = (d?: string) => {
        if (!d) return null;
        const parsed = new Date(d);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };
    const issued = parse(data.issueDate);
    const day = issued ? String(issued.getDate()).padStart(2, '0') : '__';
    const month = issued ? issued.toLocaleDateString('en-US', { month: 'long' }) : '________';
    const year = issued ? String(issued.getFullYear()) : '____';

    const microtext = `${orgName} · VERIFIED CREDENTIAL · ${serial} · `.toUpperCase().repeat(14);

    return (
        <div
            id="certificate-render-canvas"
            className="relative select-none overflow-hidden font-serif text-[#1C1C1C]"
            style={{ width: '1120px', height: '792px', backgroundColor: '#FCFBF7' }}
        >
            {/* Security engraving field */}
            <GuillocheField />

            {/* Watermark */}
            <div className="absolute top-[300px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] flex items-center justify-center pointer-events-none z-[1]">
                <img src={logoSrc} alt="" className="w-full h-full object-contain opacity-[0.045]" />
            </div>

            {/* Frame: navy hairline → gold rule → navy hairline */}
            <div className="absolute inset-[14px] border border-[#0D2240] z-[2] pointer-events-none" />
            <div className="absolute inset-[19px] border-[3px] border-[#A67C1F] z-[2] pointer-events-none" />
            <div className="absolute inset-[26px] border-[0.5px] border-[#0D2240]/55 z-[2] pointer-events-none" />

            {/* Corner filigree */}
            <CornerFiligree className="absolute top-[30px] left-[30px] w-[78px] h-[78px] z-[3]" />
            <CornerFiligree className="absolute top-[30px] right-[30px] w-[78px] h-[78px] z-[3] -scale-x-100" />
            <CornerFiligree className="absolute bottom-[30px] left-[30px] w-[78px] h-[78px] z-[3] -scale-y-100" />
            <CornerFiligree className="absolute bottom-[30px] right-[30px] w-[78px] h-[78px] z-[3] -scale-x-100 -scale-y-100" />

            {/* Verification QR */}
            {data.verificationUrl && (
                <div className="absolute top-[44px] right-[52px] z-[6] flex flex-col items-center">
                    <div className="p-[5px] bg-white border border-[#A67C1F]/60">
                        <CertificateQRCode value={data.verificationUrl} size={56} color={{ dark: '#0D2240' }} />
                    </div>
                    <span className="mt-[3px] font-sans text-[7.5px] font-semibold tracking-[1.6px] text-[#0D2240]">
                        SCAN TO VERIFY
                    </span>
                </div>
            )}

            {/* ── Masthead ── */}
            <header className="absolute top-[52px] left-[150px] right-[150px] z-[4] text-center">
                {/* Fixed slot: image scales, layout never moves */}
                <div className="mx-auto w-[92px] h-[92px] flex items-center justify-center relative">
                    <img
                        src={logoSrc}
                        alt="Institution logo"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== window.location.origin + '/gpilogo_icon.png') {
                                target.src = '/gpilogo_icon.png';
                            }
                        }}
                        className="max-w-full max-h-full object-contain"
                        style={{
                            transform: `scale(${logoScale})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.2s ease',
                        }}
                    />
                </div>

                <h1 className="mt-[10px] text-[23px] font-semibold uppercase tracking-[3.4px] text-[#0D2240] leading-none">
                    {orgName}
                </h1>

                <div className="mt-[9px] mx-auto w-[300px] flex items-center gap-[9px]">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#A67C1F]" />
                    <span className="w-[5px] h-[5px] rotate-45 bg-[#A67C1F]" />
                    <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#A67C1F]" />
                </div>
            </header>

            {/* ── Award statement ── */}
            <main className="absolute top-[232px] left-[130px] right-[130px] z-[4] text-center">
                <h2 className="text-[42px] leading-none tracking-[7px] text-[#0D2240] uppercase">
                    Certificate
                </h2>
                <p className="mt-[8px] font-sans text-[10.5px] tracking-[5.4px] text-[#A67C1F] uppercase">
                    of Achievement
                </p>

                <p className="mt-[26px] text-[15.5px] italic text-[#3A3A3A]">
                    This is to certify that
                </p>

                <div className="mt-[6px] mx-auto w-[660px] px-[16px] text-[33px] font-semibold tracking-[0.4px] text-[#0D2240] whitespace-nowrap overflow-hidden text-ellipsis leading-[1.25]">
                    {data.studentName || 'Student Name'}
                </div>
                <div className="mx-auto w-[600px] h-px bg-[#0D2240]/70" />

                <p className="mt-[16px] text-[15.5px] text-[#2A2A2A]">
                    has successfully completed the prescribed course of study and passed
                    <br />
                    the qualifying examination in
                </p>

                <div className="mt-[10px] mx-auto w-[620px] text-[21px] font-semibold tracking-[0.6px] text-[#0D2240] whitespace-nowrap overflow-hidden text-ellipsis">
                    {data.courseName || 'Examination Name'}
                </div>
                <div className="mt-[4px] mx-auto w-[420px] h-px bg-[#A67C1F]" />

                <p className="mt-[18px] text-[14.5px] text-[#2A2A2A] leading-[1.7]">
                    conducted under the academic authority of {orgName}, in recognition of the
                    <br />
                    diligence, competence and professional standard demonstrated throughout.
                </p>

                <p className="mt-[16px] text-[13.5px] text-[#2A2A2A]">
                    Given this{' '}
                    <span className="font-semibold text-[#0D2240]">{day}</span>
                    {' '}day of{' '}
                    <span className="font-semibold text-[#0D2240]">{month}</span>
                    ,{' '}
                    <span className="font-semibold text-[#0D2240]">{year}</span>.
                </p>
            </main>

            {/* ── Attestation row ── */}
            <section className="absolute left-[72px] right-[72px] bottom-[86px] h-[118px] grid grid-cols-[1fr_140px_1fr] items-end z-[5]">
                {/* Register entry */}
                <div className="text-left">
                    <p className="font-sans text-[8px] font-bold tracking-[2.2px] text-[#A67C1F] uppercase">
                        Register Entry
                    </p>
                    <p className="mt-[3px] font-sans text-[11.5px] font-semibold tracking-[0.8px] text-[#0D2240]">
                        {serial}
                    </p>
                    <div className="mt-[5px] w-[228px] h-[40px] overflow-hidden">
                        <svg ref={barcodeRef} className="w-[228px] h-[40px]" />
                    </div>
                    <p className="mt-[3px] font-sans text-[8px] tracking-[1.4px] text-[#5A5A5A]">
                        Recorded in the institutional register
                    </p>
                </div>

                {/* Seal */}
                <div className="flex items-end justify-center pb-[6px]">
                    <InstitutionalSeal size={118} />
                </div>

                {/* Signature */}
                <div className="flex flex-col items-end">
                    <div className="w-[248px] h-[48px] flex items-end justify-center relative">
                        {signatureSrc ? (
                            <img
                                src={signatureSrc}
                                alt="Authorised signature"
                                className="object-contain max-h-[46px] max-w-[220px]"
                                style={{
                                    transform: `scale(${signatureScale})`,
                                    transformOrigin: 'bottom center',
                                    transition: 'transform 0.2s ease',
                                }}
                            />
                        ) : (
                            <span
                                className="italic text-[#1C1C1C] text-[17px]"
                                style={{
                                    transform: `scale(${signatureScale})`,
                                    transformOrigin: 'bottom center',
                                }}
                            >
                                {data.authorizerName || 'Authorised Signatory'}
                            </span>
                        )}
                    </div>
                    <div className="w-[248px] h-px bg-[#0D2240]" />
                    <div className="w-[248px] text-center mt-[6px]">
                        <p className="text-[13px] font-semibold text-[#0D2240] leading-tight">
                            {data.authorizerName || 'Authorised Signatory'}
                        </p>
                        <p className="mt-[1px] font-sans text-[9.5px] tracking-[0.6px] text-[#5A5A5A]">
                            {data.authorizerPosition || 'Director'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Microtext security line */}
            <div className="absolute left-[72px] right-[72px] bottom-[70px] h-[7px] overflow-hidden z-[4]">
                <p className="font-sans text-[3.6px] leading-[7px] tracking-[0.5px] text-[#0D2240]/45 whitespace-nowrap">
                    {microtext}
                </p>
            </div>

            {/* ── Footer ── */}
            <footer className="absolute left-[72px] right-[72px] bottom-[34px] z-[5]">
                <div className="h-px bg-[#0D2240]/25" />
                <div className="mt-[7px] flex items-center justify-center gap-[18px] font-sans text-[9.5px] text-[#0D2240]">
                    <span>{website}</span>
                    <span className="w-px h-[9px] bg-[#A67C1F]" />
                    <span>{email}</span>
                    <span className="w-px h-[9px] bg-[#A67C1F]" />
                    <span>{mobile}</span>
                </div>
                <p className="mt-[4px] text-center font-sans text-[8px] tracking-[1.1px] text-[#7A7A7A]">
                    {poweredBy}
                </p>
            </footer>
        </div>
    );
};

export default GpiAcademicTemplate;