import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface CertificateQRCodeProps {
    value: string;
    size?: number;
    className?: string;
    color?: {
        dark?: string;
        light?: string;
    };
}

export const CertificateQRCode: React.FC<CertificateQRCodeProps> = ({
    value,
    size = 80,
    className = '',
    color = { dark: '#111827', light: '#ffffff00' },
}) => {
    const [dataUrl, setDataUrl] = useState<string>('');

    useEffect(() => {
        if (!value) return;

        QRCode.toDataURL(value, {
            width: size * 2, // High DPI render
            margin: 1,
            color: {
                dark: color.dark || '#111827',
                light: color.light || '#ffffff00',
            },
            errorCorrectionLevel: 'M',
        })
            .then((url) => setDataUrl(url))
            .catch((err) => console.error('QR generation error:', err));
    }, [value, size, color.dark, color.light]);

    if (!dataUrl) {
        return (
            <div
                style={{ width: size, height: size }}
                className={`flex items-center justify-center bg-gray-100 rounded text-[10px] text-gray-400 ${className}`}
            >
                QR
            </div>
        );
    }

    return (
        <img
            src={dataUrl}
            alt="Verification QR Code"
            style={{ width: size, height: size }}
            className={`object-contain block ${className}`}
        />
    );
};
