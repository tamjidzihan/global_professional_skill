import React from 'react';

import { type CertificateData, GPI_CERTIFICATE_CONSTANTS } from '../types';

import { getMediaUrl } from '../../../../lib/api';

interface TemplateProps {
    data: CertificateData;
}

interface SignatoryProps {
    name: string;
    position: string;
    signatureUrl?: string | null;
    signatureSize?: number;
}

const Signatory: React.FC<SignatoryProps> = ({
    name,
    position,
    signatureUrl,
    signatureSize = 100,
}) => {
    const signatureSrc = getMediaUrl(signatureUrl);
    const scale = Math.max(0.4, Math.min(2, signatureSize / 100));
    return (
        <div className="flex min-w-0 flex-col items-center text-center">
            <div
                className="mb-1 flex h-[52px] w-[240px] max-w-full items-end justify-center"
                style={{ height: `${Math.round(52 * scale)}px` }}
            >
                {signatureSrc && (
                    <img
                        src={signatureSrc}
                        alt={`${name} signature`}
                        style={{
                            maxHeight: `${Math.round(48 * scale)}px`,
                            maxWidth: `${Math.round(220 * scale)}px`,
                        }}
                        className="object-contain"
                    />
                )}
            </div>
            <div className="w-[260px] max-w-full border-t border-slate-500 pt-1.5">
                <p className="text-[17px] font-bold leading-tight text-[#172d4b]">{name}</p>
                <p className="mt-0.5 text-[13px] leading-tight text-slate-700">{position}</p>
            </div>
        </div>
    );
};

export const ParticipationTemplate: React.FC<TemplateProps> = ({ data }) => {
    const logoSrc = getMediaUrl(data.logoUrl) || '/gpilogo_icon.png';
    const issueDate = data.issueDate
        ? new Date(`${data.issueDate}T00:00:00`)
        : null;
    const formattedDate = issueDate && !Number.isNaN(issueDate.getTime())
        ? issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : data.issueDate || '';

    const signatories: SignatoryProps[] = [
        ...(data.enableAdditionalAuthorizer
            ? [{
                name: data.additionalAuthorizerName || 'Additional Authorizer',
                position: data.additionalAuthorizerPosition || 'Authorized Signatory',
                signatureUrl: data.additionalSignatureUrl,
                signatureSize: data.additionalSignatureSize,
            }]
            : []),
        {
            name: data.authorizerName || 'Authorized Signatory',
            position: data.authorizerPosition || 'Director',
            signatureUrl: data.signatureUrl,
            signatureSize: data.signatureSize,
        },
    ];

    return (
        <div
            id="certificate-render-canvas"
            className="relative h-[792px] w-[1120px] select-none overflow-hidden bg-white font-sans text-slate-900"
            style={{ width: '1120px', height: '792px' }}
        >
            <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1000 600"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
            >
                <defs>
                    <filter id="drop-shadow" x="-10%" y="-10%" width="130%" height="130%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.18" />
                    </filter>
                </defs>

                <rect width="1000" height="600" fill="#FFFFFF" />

                <g stroke="#EFEFEF" strokeWidth="1" opacity="0.4">
                    <line x1="-200" y1="0" x2="1000" y2="1200" />
                    <line x1="-150" y1="0" x2="1050" y2="1200" />
                    <line x1="-100" y1="0" x2="1100" y2="1200" />
                    <line x1="-50" y1="0" x2="1150" y2="1200" />
                    <line x1="0" y1="0" x2="1200" y2="1200" />
                    <line x1="50" y1="0" x2="1250" y2="1200" />
                    <line x1="100" y1="0" x2="1300" y2="1200" />
                    <line x1="150" y1="0" x2="1350" y2="1200" />
                    <line x1="200" y1="0" x2="1400" y2="1200" />
                    <line x1="250" y1="0" x2="1450" y2="1200" />
                    <line x1="300" y1="0" x2="1500" y2="1200" />
                    <line x1="350" y1="0" x2="1550" y2="1200" />
                    <line x1="400" y1="0" x2="1600" y2="1200" />
                    <line x1="450" y1="0" x2="1650" y2="1200" />
                    <line x1="500" y1="0" x2="1700" y2="1200" />
                    <line x1="550" y1="0" x2="1750" y2="1200" />
                    <line x1="600" y1="0" x2="1800" y2="1200" />
                    <line x1="650" y1="0" x2="1850" y2="1200" />
                    <line x1="700" y1="0" x2="1900" y2="1200" />
                    <line x1="750" y1="0" x2="1950" y2="1200" />
                    <line x1="800" y1="0" x2="2000" y2="1200" />
                </g>

                <g filter="url(#drop-shadow)">
                    <path
                        d="M 0,0 L 0,130 C 50,80 100,40 180,45 C 280,50 360,70 450,30 C 490,12 520,2 540,0 Z"
                        fill="#F6C344"
                    />
                    <path
                        d="M 0,0 L 0,80 C 60,35 120,20 200,32 C 270,42 340,48 420,12 C 440,3 450,0 460,0 Z"
                        fill="#1A3352"
                    />
                </g>

                <line x1="986" y1="0" x2="986" y2="600" stroke="#F6C344" strokeWidth="6" />

                <g filter="url(#drop-shadow)">
                    <path
                        d="M 120,600 C 250,520 400,525 520,560 C 570,575 600,585 630,600 Z"
                        fill="#F6C344"
                    />
                    <path
                        d="M 100,600 C 240,550 420,560 550,582 C 720,610 850,570 1000,470 L 1000,600 Z"
                        fill="#1A3352"
                    />
                </g>

            </svg>



            <header className="absolute right-[42px] top-[22px] z-[2] flex h-[102px] w-[310px] items-center justify-end">
                <img
                    src={logoSrc}
                    alt={data.organizationName || GPI_CERTIFICATE_CONSTANTS.ORGANIZATION_NAME}
                    onError={(event) => {
                        const image = event.currentTarget;
                        if (image.src !== `${window.location.origin}/gpilogo_icon.png`) {
                            image.src = '/gpilogo_icon.png';
                        }
                    }}
                    style={{
                        maxWidth: `${Math.round(290 * Math.max(0.4, Math.min(2, (data.logoSize || 100) / 100)))}px`,
                        maxHeight: `${Math.round(92 * Math.max(0.4, Math.min(2, (data.logoSize || 100) / 100)))}px`,
                    }}
                    className="object-contain"
                />
            </header>
            <main className="absolute left-[90px] right-[90px] top-[180px] z-[2] text-center">
                <h1 className="text-[65px] font-bold leading-tight tracking-[-1.5px] text-black">
                    Certificate of Participation
                </h1>
                <p className="mt-2 text-[19px] text-slate-800">Awarded to</p>
                <p className="mt-1 text-[24px] font-bold leading-tight text-black">
                    {data.studentName || 'Student Name'}
                </p>
                <p className="mt-2 text-[19px] text-slate-800">
                    Employee ID: <span className="ml-3 font-bold">{data.employeeId || '—'}</span>
                </p>
                <p className="mt-3 text-[19px] text-slate-800">
                    for participating in the training on
                </p>
                <p className="mx-auto mt-2 max-w-[940px] text-[20px] font-bold leading-snug text-black">
                    {data.courseName || 'Professional Training'}
                </p>
                {formattedDate && (
                    <p className="mt-2 text-[19px] text-slate-800">Dhaka, {formattedDate}</p>
                )}
            </main>
            <div
                className={`absolute bottom-[126px] left-[120px] right-[120px] z-[2] grid items-end gap-10 ${signatories.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                    }`}
            >
                {signatories.map((signatory, index) => (
                    <Signatory key={`${signatory.name}-${index}`} {...signatory} />
                ))}
            </div>
        </div>
    );
};