import React, { useRef, useState, useEffect } from 'react';
import type { CertificateData, CertificateTemplateId } from './types';
import { GpiAcademicTemplate } from './templates/GpiAcademicTemplate';
import { ProfessionalClassicTemplate } from './templates/ProfessionalClassicTemplate';
import { ModernMinimalTemplate } from './templates/ModernMinimalTemplate';
import { PremiumCorporateTemplate } from './templates/PremiumCorporateTemplate';

interface CertificatePreviewProps {
    data: CertificateData;
    templateId?: CertificateTemplateId;
    className?: string;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
    data,
    templateId = 'template_1',
    className = '',
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [scale, setScale] = useState<number>(1);

    const activeTemplate = templateId || data.templateId || 'template_1';

    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth;
            const baseWidth = 1120;
            const computedScale = Math.min(containerWidth / baseWidth, 1);
            setScale(computedScale);
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const renderTemplate = () => {
        switch (activeTemplate) {
            case 'template_2':
                return <ProfessionalClassicTemplate data={data} />;
            case 'template_3':
                return <ModernMinimalTemplate data={data} />;
            case 'template_4':
                return <PremiumCorporateTemplate data={data} />;
            case 'template_1':
            default:
                return <GpiAcademicTemplate data={data} />;
        }
    };

    return (
        <div ref={containerRef} className={`w-full overflow-hidden flex justify-center ${className}`}>
            <div
                style={{
                    width: `${1120 * scale}px`,
                    height: `${792 * scale}px`,
                }}
                className="relative shrink-0 shadow-lg rounded-md overflow-hidden bg-white"
            >
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        width: '1120px',
                        height: '792px',
                    }}
                >
                    {renderTemplate()}
                </div>
            </div>
        </div>
    );
};
