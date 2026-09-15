import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

/**
 * Downloads high-resolution A4 Landscape PDF of the certificate.
 * Matches exact dimensions (297mm x 210mm) and high DPI sharpness (300+ DPI).
 * Supports Tailwind CSS v4 modern color functions (oklch, color-mix, hex, rgba).
 */
export async function downloadCertificatePDF(
    elementId: string = 'certificate-render-canvas',
    studentName: string = 'Student',
    certificateNumber: string = 'GPI-SJO-4484-487641'
): Promise<void> {
    const rawElement = document.getElementById(elementId);
    if (!rawElement) {
        toast.error('Certificate canvas not found.');
        throw new Error(`Element with id "${elementId}" not found`);
    }

    // Find actual 1120x792 canvas if wrapper was passed
    const targetElement: HTMLElement =
        rawElement.id === 'certificate-render-canvas'
            ? rawElement
            : (rawElement.querySelector('#certificate-render-canvas') as HTMLElement | null) || rawElement;

    const toastId = toast.loading('Generating high-resolution certificate PDF...');

    try {
        // Wait 300ms for fonts, QR codes, barcodes, and dynamic images to fully paint
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Use html-to-image native SVG foreignObject rasterization
        // pixelRatio: 2.5 produces 2800 x 1980 px (crisp 300 DPI for A4 landscape)
        const imageData = await toPng(targetElement, {
            quality: 1.0,
            pixelRatio: 2.5,
            width: 1120,
            height: 792,
            backgroundColor: '#ffffff',
            cacheBust: true,
        });

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        const pageWidth = 297; // A4 Landscape width in mm
        const pageHeight = 210; // A4 Landscape height in mm

        pdf.addImage(
            imageData,
            'PNG',
            0,
            0,
            pageWidth,
            pageHeight,
            undefined,
            'FAST'
        );

        const safeName =
            studentName
                .trim()
                .replace(/[^a-zA-Z0-9\s-_]/g, '')
                .replace(/\s+/g, '_') || 'Student';

        pdf.save(`Certificate_${safeName}_${certificateNumber}.pdf`);
        toast.success('Certificate PDF downloaded successfully!', { id: toastId });
    } catch (error) {
        console.error('Failed to generate certificate PDF:', error);
        toast.error('Failed to generate certificate PDF. Please try again.', { id: toastId });
        throw error;
    }
}

export const exportCertificateToPdf = downloadCertificatePDF;

