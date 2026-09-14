// pdfUtilsInstructor.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';
import gpiLogo from '../assets/gpilogo_1.png';

let cachedLogoDataUrl: string | null = null;

export const getLogoDataUrl = async (): Promise<string | null> => {
    if (cachedLogoDataUrl) return cachedLogoDataUrl;
    try {
        const response = await fetch(gpiLogo);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                cachedLogoDataUrl = reader.result as string;
                resolve(cachedLogoDataUrl);
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};
export const addWatermarkToPdf = (doc: jsPDF, logoDataUrl: string | null): void => {
    if (!logoDataUrl) return;
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Target 75% of the smaller page dimension so it fits either orientation
        const targetSize = Math.min(pageWidth, pageHeight) * 0.75;
        const aspectRatio = 0.68; // height / width of the logo

        let wmWidth = targetSize;
        let wmHeight = wmWidth * aspectRatio;

        // If the height exceeds 75% of page height, constrain by height instead
        if (wmHeight > pageHeight * 0.75) {
            wmHeight = pageHeight * 0.75;
            wmWidth = wmHeight / aspectRatio;
        }

        const x = (pageWidth - wmWidth) / 2;
        const y = (pageHeight - wmHeight) / 2;

        try {
            doc.saveGraphicsState();
            if ((doc as any).GState) {
                doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
            }
            doc.addImage(logoDataUrl, 'PNG', x, y, wmWidth, wmHeight, undefined, 'FAST');
            doc.restoreGraphicsState();
        } catch {
            // Ignore if transparency not supported
        }
    }
};
// ==========================================
// Type Definitions
// ==========================================

export interface QuizQuestion {
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c?: string;
    option_d?: string;
    correct_option: string;
}

export interface StudentAnswer {
    question_id: string;
    selected_option: string | null;
}

export interface QuizSubmission {
    id: string | number;
    student_name: string;
    student_email?: string;
    student_organization_name?: string;
    student_employee_id?: string;
    score: number | null;
    total_questions: number;
    started_at: string;
    completed_at: string | null;
    is_disqualified: boolean;
    disqualification_reason?: string;
    warnings_count?: number;
    course_title?: string;
    quiz_title?: string;
    questions?: QuizQuestion[];
}

export interface QuizSubmissionDetail {
    shuffled_question_ids?: string[];
    student_answers?: StudentAnswer[];
    [key: string]: unknown;
}

export interface AnswerSheetData {
    course_title: string;
    quiz_title: string;
    student_name: string;
    student_email: string;
    student_organization_name?: string;
    student_employee_id?: string;
    score: number;
    total_questions: number;
    warnings_count: number;
    is_disqualified: boolean;
    started_at: string;
    completed_at: string;
    answer_sheet: AnswerSheetItem[];
}

export interface AnswerSheetItem {
    index: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    selected_option: string | null;
    is_skipped: boolean;
}

export interface ApiClient {
    get: <T = { success: boolean; data: QuizSubmissionDetail }>(url: string) => Promise<{ data: T }>;
}

export interface DownloadDetailedResultOptions {
    submission: QuizSubmission;
    course?: {
        instructor?: {
            full_name?: string;
        };
    };
    api: ApiClient;
}

// ==========================================
// Helper Utilities
// ==========================================

/**
 * Escapes HTML characters to prevent XSS and layout breakage.
 */
const escapeHtml = (str: string | null | undefined): string => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Sanitizes a string for use in filenames.
 */
const sanitizeFilename = (str: string): string => {
    if (!str) return 'unknown';
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'unknown';
};

/**
 * Formats a date string for display.
 */
export const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleString();
    } catch {
        return 'N/A';
    }
};

/**
 * Formats a date for filename.
 */
const formatDateForFilename = (): string => {
    return new Date().toISOString().split('T')[0];
};

// ==========================================
// Submissions List PDF Generator
// ==========================================

export interface DownloadSubmissionsListOptions {
    quizTitle: string;
    courseTitle: string;
    submissions: QuizSubmission[];
    passPercentage?: number;
    totalQuestions?: number;
}

/**
 * Generates and downloads a PDF containing a list of quiz submissions.
 */
export const downloadSubmissionsListPDF = async ({
    quizTitle,
    courseTitle,
    submissions,
    passPercentage = 50,
    totalQuestions,
}: DownloadSubmissionsListOptions): Promise<void> => {
    try {
        const thresholdPct = Number(passPercentage) || 50;
        const derivedTotalQuestions = totalQuestions || submissions.reduce((max, s) => Math.max(max, s.total_questions || 0), 0) || 0;
        const globalPassMark = derivedTotalQuestions > 0 ? Math.ceil((derivedTotalQuestions * thresholdPct) / 100) : 0;

        // ---------- Document setup (Landscape A4) ----------
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();   // ~297mm
        const pageHeight = doc.internal.pageSize.getHeight(); // ~210mm
        const marginX = 8;                                    // tight side margins
        const contentWidth = pageWidth - marginX * 2;         // ~281mm

        // ---------- Header ----------
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(`Quiz Submissions: ${quizTitle || 'Unknown Quiz'}`, marginX, 14);

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(90, 90, 100);
        const passMarkHeader = derivedTotalQuestions > 0
            ? `Pass Mark: ${globalPassMark}/${derivedTotalQuestions} (${thresholdPct}%)`
            : `Passing Threshold: ${thresholdPct}%`;
        doc.text(`Course: ${courseTitle || '—'}    |    ${passMarkHeader}`, marginX, 21);

        // Separator line (full width)
        doc.setDrawColor(225, 225, 230);
        doc.setLineWidth(0.3);
        doc.line(marginX, 25, pageWidth - marginX, 25);

        // ---------- Table data ----------
        const tableColumn = [
            'Student',
            'Email',
            'Organization',
            'Employee ID',
            'Score',
            'Passing Mark',
            'Percentage',
            'Result',
            'Status',
        ];

        const tableRows: string[][] = [];

        submissions.forEach((sub) => {
            let status = 'Completed';
            if (sub.is_disqualified) status = 'Disqualified';
            else if (!sub.completed_at) status = 'In Progress';

            const totalQ = sub.total_questions || derivedTotalQuestions;
            const subScore = sub.score ?? 0;
            const pct = totalQ > 0 ? ((subScore / totalQ) * 100).toFixed(1) : '0';
            const passMark = totalQ > 0 ? Math.ceil((totalQ * thresholdPct) / 100) : 0;

            const scoreDisplay =
                sub.score !== null && sub.score !== undefined && totalQ > 0
                    ? `${sub.score}/${totalQ}`
                    : '-';

            const passMarkDisplay = totalQ > 0 ? `${passMark} (${thresholdPct}%)` : `${thresholdPct}%`;

            let result = 'Fail';
            if (sub.is_disqualified) {
                result = 'Disqualified';
            } else if (!sub.completed_at) {
                result = 'In Progress';
            } else if (Number(pct) >= thresholdPct) {
                result = 'Pass';
            }

            tableRows.push([
                sub.student_name || 'N/A',
                sub.student_email || '—',
                sub.student_organization_name || 'N/A',
                sub.student_employee_id || 'N/A',
                scoreDisplay,
                passMarkDisplay,
                totalQ > 0 ? `${pct}%` : '—',
                result,
                status,
            ]);
        });

        // ---------- Column widths (sum = contentWidth ≈ 281mm) ----------
        const colWidths = [
            36,   // Student
            54,   // Email
            44,   // Organization
            26,   // Employee ID
            20,   // Score
            26,   // Passing Mark
            22,   // Percentage
            23,   // Result
            30,   // Status
        ]; // total = 281mm

        // ---------- Generate table ----------
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 29,
            theme: 'grid',
            tableWidth: contentWidth,           // <-- force full page width
            margin: {
                top: 29,
                right: marginX,
                bottom: 16,
                left: marginX,
            },
            styles: {
                fontSize: 8.2,
                cellPadding: { top: 2.2, right: 2.5, bottom: 2.2, left: 2.5 },
                overflow: 'linebreak',
                valign: 'middle',
                lineColor: [228, 230, 238],
                lineWidth: 0.1,
                textColor: [35, 40, 50],
                halign: 'left',
            },
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: [255, 255, 255],
                fontSize: 8.8,
                fontStyle: 'bold',
                halign: 'left',
                valign: 'middle',
                cellPadding: { top: 3, right: 2.5, bottom: 3, left: 2.5 },
                lineColor: [79, 70, 229],
                lineWidth: 0.1,
            },
            alternateRowStyles: {
                fillColor: [249, 250, 253],
            },
            columnStyles: {
                0: { cellWidth: colWidths[0] },
                1: { cellWidth: colWidths[1] },
                2: { cellWidth: colWidths[2] },
                3: { cellWidth: colWidths[3] },
                4: { cellWidth: colWidths[4], halign: 'center', fontStyle: 'bold' },
                5: { cellWidth: colWidths[5], halign: 'center' },
                6: { cellWidth: colWidths[6], halign: 'center' },
                7: { cellWidth: colWidths[7], halign: 'center', fontStyle: 'bold' },
                8: { cellWidth: colWidths[8], halign: 'center', fontStyle: 'bold' },
            },
            didParseCell: (data) => {
                // Color-code the Result column
                if (data.section === 'body' && data.column.index === 7) {
                    const res = String(data.cell.raw || '').toLowerCase();
                    if (res === 'pass') {
                        data.cell.styles.textColor = [21, 128, 61];
                    } else if (res === 'fail' || res === 'disqualified') {
                        data.cell.styles.textColor = [185, 28, 28];
                    } else if (res === 'in progress') {
                        data.cell.styles.textColor = [180, 120, 20];
                    }
                }
                // Color-code the Status column
                if (data.section === 'body' && data.column.index === 8) {
                    const status = String(data.cell.raw || '').toLowerCase();
                    if (status === 'completed') {
                        data.cell.styles.textColor = [21, 128, 61];
                    } else if (status === 'disqualified') {
                        data.cell.styles.textColor = [185, 28, 28];
                    } else if (status === 'in progress') {
                        data.cell.styles.textColor = [180, 120, 20];
                    }
                }
            },
            didDrawPage: () => {
                const pageCount = doc.getNumberOfPages();
                const currentPage = doc.getCurrentPageInfo().pageNumber || 1;

                // Footer divider (full width)
                doc.setDrawColor(230, 232, 238);
                doc.setLineWidth(0.3);
                doc.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);

                doc.setFontSize(7.8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(140, 145, 155);

                // Left: brand
                doc.text(
                    'Generated by Global Professional Institute Platform',
                    marginX,
                    pageHeight - 6
                );

                // Right: page indicator
                doc.text(
                    `Page ${currentPage} of ${pageCount}`,
                    pageWidth - marginX,
                    pageHeight - 6,
                    { align: 'right' }
                );
            },
        });

        // Add Watermark to each page
        const logoDataUrl = await getLogoDataUrl();
        addWatermarkToPdf(doc, logoDataUrl);

        // ---------- Save ----------
        const sanitizedTitle = sanitizeFilename(quizTitle || 'quiz');
        const dateStr = formatDateForFilename();
        const filename = `quiz_submissions_${sanitizedTitle}_${dateStr}.pdf`;
        doc.save(filename);

        toast.success('Submissions list downloaded successfully');
    } catch (error) {
        console.error('Error generating submissions list PDF:', error);
        toast.error('Failed to generate submissions list PDF');
        throw error;
    }
};
// ==========================================
// Student Answer Sheet PDF Generator (FIXED - Using html2canvas)
// ==========================================

/**
 * Generates and downloads a PDF containing a student's answer sheet.
 * Uses html2canvas for proper Unicode/Bangla support.
 */
export const generateAnswerSheetPDF = async (data: AnswerSheetData, studentName: string): Promise<void> => {
    const toastId = toast.loading('Generating answer sheet...');
    let container: HTMLDivElement | null = null;

    try {
        // Calculate percentage
        const percentage = data.total_questions > 0
            ? ((data.score / data.total_questions) * 100).toFixed(1)
            : '0.0';

        // Create off-screen container
        container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 800px;
            padding: 40px 50px;
            font-family: 'Noto Sans Bengali', 'Bangla', 'Segoe UI', Arial, sans-serif;
            background: #ffffff;
            color: #1e293b;
            line-height: 1.8;
            box-sizing: border-box;
        `;

        // Build HTML content with proper Bangla rendering
        const formattedDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // Generate questions HTML with proper formatting
        const questionsHtml = (data.answer_sheet || []).map((item: AnswerSheetItem) => {
            const options = [
                { label: 'A', text: item.option_a || '' },
                { label: 'B', text: item.option_b || '' },
                { label: 'C', text: item.option_c || '' },
                { label: 'D', text: item.option_d || '' },
            ].filter((opt) => !!opt.text?.trim());

            const optionsHtml = options.map((opt) => {
                const isCorrect = opt.label === item.correct_option;
                const isSelected = opt.label === item.selected_option;

                let bgColor = '#f8fafc';
                let borderColor = '#e2e8f0';
                let textColor = '#475569';
                let statusIcon = '';
                let badgeHtml = '';

                if (isCorrect) {
                    bgColor = '#d1fae5';
                    borderColor = '#6ee7b7';
                    textColor = '#065f46';
                    statusIcon = '✅';
                }
                if (isSelected && !isCorrect) {
                    bgColor = '#fee2e2';
                    borderColor = '#fca5a5';
                    textColor = '#991b1b';
                    statusIcon = '❌';
                }

                if (isSelected && isCorrect) {
                    badgeHtml = `<span style="background: #a7f3d0; color: #065f46; padding: 0 10px; border-radius: 4px; font-size: 11px; margin-left: auto; font-weight: 600;">✓ Your Answer</span>`;
                } else if (isSelected && !isCorrect) {
                    badgeHtml = `<span style="background: #fecaca; color: #991b1b; padding: 0 10px; border-radius: 4px; font-size: 11px; margin-left: auto; font-weight: 600;">✗ Your Answer</span>`;
                } else if (isCorrect && !isSelected) {
                    badgeHtml = `<span style="background: #a7f3d0; color: #065f46; padding: 0 10px; border-radius: 4px; font-size: 11px; margin-left: auto; font-weight: 600;">Correct Answer</span>`;
                }

                return `
                    <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; background: ${bgColor}; border: 1px solid ${borderColor}; margin-bottom: 6px;">
                        <span style="font-weight: bold; font-size: 13px; color: ${textColor}; min-width: 20px;">${opt.label}.</span>
                        <span style="font-size: 13px; color: ${textColor}; flex: 1;">${escapeHtml(opt.text)}</span>
                        ${statusIcon ? `<span style="font-size: 14px;">${statusIcon}</span>` : ''}
                        ${badgeHtml}
                    </div>
                `;
            }).join('');

            // Result badge
            let resultHtml = '';
            if (item.selected_option) {
                const isCorrect = item.selected_option === item.correct_option;
                resultHtml = `
                    <div style="margin-top: 8px; font-size: 12px; font-weight: 600;">
                        ${isCorrect
                        ? `<span style="color: #059669;">✅ Result: Correct</span>`
                        : `<span style="color: #dc2626;">❌ Result: Incorrect</span>`
                    }
                    </div>
                `;
            } else if (item.is_skipped) {
                resultHtml = `
                    <div style="margin-top: 8px; font-size: 12px; font-weight: 600;">
                        <span style="color: #d97706;">⏭️ Skipped</span>
                    </div>
                `;
            }

            return `
                <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 16px; background: #ffffff; page-break-inside: avoid;">
                    <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;">
                        <span style="display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; background: #ede9fe; color: #7c3aed; border-radius: 50%; font-size: 13px; font-weight: bold; flex-shrink: 0;">${item.index}</span>
                        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b; flex: 1;">${escapeHtml(item.question_text || 'Question text unavailable')}</p>
                    </div>
                    <div style="margin-left: 38px;">
                        ${optionsHtml}
                        ${resultHtml}
                    </div>
                </div>
            `;
        }).join('');

        // Build full HTML
        container.innerHTML = `
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 20px 30px; color: #ffffff; border-radius: 12px; margin-bottom: 24px; text-align: center;">
                <h1 style="font-size: 22px; margin: 0; font-weight: bold; letter-spacing: 1px;">QUIZ ANSWER SHEET</h1>
                <h2 style="font-size: 24px; margin: 4px 0 0; font-weight: bold;">Global Professional Institute</h2>
                <p style="font-size: 12px; margin: 4px 0 0; opacity: 0.95;">Generated on ${escapeHtml(formattedDate)}</p>
            </div>

            <!-- Student & Quiz Info -->
            <div style="background: #f8fafc; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; font-size: 13px;">
                    <div><strong>Course:</strong> ${escapeHtml(data.course_title || 'N/A')}</div>
                    <div><strong>Quiz:</strong> ${escapeHtml(data.quiz_title || 'N/A')}</div>
                    <div><strong>Student:</strong> ${escapeHtml(data.student_name || 'N/A')}</div>
                    <div><strong>Email:</strong> ${escapeHtml(data.student_email || 'N/A')}</div>
                    <div><strong>Organization:</strong> ${escapeHtml(data.student_organization_name || 'N/A')}</div>
                    <div><strong>Employee ID:</strong> ${escapeHtml(data.student_employee_id || 'N/A')}</div>
                </div>
            </div>

            <!-- Score Summary -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background: #ede9fe; border-radius: 10px; padding: 12px; text-align: center; border: 1px solid #c4b5fd;">
                    <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">${data.score || 0}</div>
                    <div style="font-size: 11px; color: #5b21b6; font-weight: 600;">Correct</div>
                </div>
                <div style="background: #dbeafe; border-radius: 10px; padding: 12px; text-align: center; border: 1px solid #93c5fd;">
                    <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${data.total_questions || 0}</div>
                    <div style="font-size: 11px; color: #1d4ed8; font-weight: 600;">Total Questions</div>
                </div>
                <div style="background: #d1fae5; border-radius: 10px; padding: 12px; text-align: center; border: 1px solid #6ee7b7;">
                    <div style="font-size: 24px; font-weight: bold; color: #059669;">${percentage}%</div>
                    <div style="font-size: 11px; color: #047857; font-weight: 600;">Percentage</div>
                </div>
            </div>

            <!-- Status & Warnings -->
            ${data.is_disqualified ? `
                <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;">
                    <span style="font-size: 14px; color: #991b1b; font-weight: 700;">🚫 STATUS: DISQUALIFIED</span>
                </div>
            ` : data.warnings_count > 0 ? `
                <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 10px 16px; margin-bottom: 20px;">
                    <span style="font-size: 13px; color: #92400e; font-weight: 600;">⚠️ Warnings Issued: ${data.warnings_count}</span>
                </div>
            ` : ''}

            <!-- Questions Section -->
            <div style="margin-top: 20px; border-top: 2px solid #e2e8f0; padding-top: 20px;">
                <h3 style="font-size: 17px; font-weight: bold; color: #1e293b; margin: 0 0 16px; display: flex; align-items: center; gap: 8px;">
                    <span>📝</span> QUESTIONS &amp; ANSWERS
                </h3>
                ${questionsHtml || '<p style="text-align: center; color: #64748b; padding: 20px;">No questions available.</p>'}
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8;">
                <p style="margin: 0;">Generated by Global Professional Institute Platform</p>
                <p style="margin: 2px 0 0;">Document ID: ${escapeHtml(String(data.student_email || 'unknown'))}</p>
            </div>
        `;

        document.body.appendChild(container);

        // Wait for fonts to load
        if ('fonts' in document) {
            try {
                await document.fonts.load('16px "Noto Sans Bengali"');
            } catch {
                console.warn('Custom font load bypassed');
            }
        }

        // Small delay for font rendering
        await new Promise(resolve => setTimeout(resolve, 300));

        // Render with html2canvas
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false,
            imageTimeout: 15000,
            width: 800,
            height: container.scrollHeight,
            windowHeight: container.scrollHeight,
        });

        // Generate PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;

        const printableWidth = pageWidth - margin * 2;
        const printableHeight = pageHeight - margin * 2;

        let sourceY = 0;
        let remainingHeightPx = canvas.height;
        let pageCount = 0;
        const pxPerPage = (printableHeight * canvas.width) / printableWidth;

        while (remainingHeightPx > 0) {
            if (pageCount > 0) {
                pdf.addPage();
            }

            const chunkHeightPx = Math.min(remainingHeightPx, pxPerPage);
            const chunkPdfHeight = (chunkHeightPx * printableWidth) / canvas.width;

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = chunkHeightPx;

            const ctx = pageCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(
                    canvas,
                    0,
                    sourceY,
                    canvas.width,
                    chunkHeightPx,
                    0,
                    0,
                    canvas.width,
                    chunkHeightPx
                );

                const pageImgData = pageCanvas.toDataURL('image/png');
                pdf.addImage(
                    pageImgData,
                    'PNG',
                    margin,
                    margin,
                    printableWidth,
                    chunkPdfHeight,
                    undefined,
                    'FAST'
                );
            }

            remainingHeightPx -= chunkHeightPx;
            sourceY += chunkHeightPx;
            pageCount++;
        }

        // Add Watermark to each page
        const logoDataUrl = await getLogoDataUrl();
        addWatermarkToPdf(pdf, logoDataUrl);

        // Save file
        const sanitizedStudent = sanitizeFilename(studentName || 'student');
        const sanitizedQuiz = sanitizeFilename(data.quiz_title || 'quiz');
        const dateStr = formatDateForFilename();
        const filename = `answer_sheet_${sanitizedStudent}_${sanitizedQuiz}_${dateStr}.pdf`;
        pdf.save(filename);

        toast.success('Answer sheet downloaded successfully', { id: toastId });

    } catch (error) {
        console.error('Error generating answer sheet PDF:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Failed to generate answer sheet: ${errorMessage}`, { id: toastId });
        throw error;
    } finally {
        if (container && document.body.contains(container)) {
            container.remove();
        }
    }
};

// ==========================================
// Detailed Result PDF Generator
// ==========================================

/**
 * Generates and downloads a detailed result PDF using HTML rendering with html2canvas.
 */
export const downloadDetailedResultPDF = async ({
    submission,
    course,
    api,
}: DownloadDetailedResultOptions): Promise<void> => {
    const toastId = toast.loading('Generating detailed PDF...');
    let container: HTMLDivElement | null = null;

    try {
        const submissionRes = await api.get<{ success: boolean; data: QuizSubmissionDetail }>(
            `/courses/my-quiz-submissions/${submission.id}/`
        );

        if (!submissionRes.data?.success) {
            toast.error('Failed to load submission details', { id: toastId });
            return;
        }

        const submissionDetail = submissionRes.data.data;

        const totalQuestions = submission.total_questions || 0;
        const score = submission.score || 0;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        const questionsList: QuizQuestion[] = submission.questions || [];
        const questionIds: string[] =
            submissionDetail.shuffled_question_ids && submissionDetail.shuffled_question_ids.length > 0
                ? submissionDetail.shuffled_question_ids
                : questionsList.map((q) => q.id);

        container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 800px;
            padding: 40px 50px;
            font-family: 'Noto Sans Bengali', 'Bangla', 'Segoe UI', Arial, sans-serif;
            background: #ffffff;
            color: #1e293b;
            line-height: 1.6;
            box-sizing: border-box;
        `;

        const formattedDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const detailedAnswersHtml = questionIds.length > 0
            ? questionIds.map((questionId, index) => {
                const question = questionsList.find((q) => q.id === questionId);
                if (!question) return '';

                const studentAns = (submissionDetail.student_answers || []).find(
                    (ans) => ans.question_id === question.id
                );
                const selectedOption = studentAns?.selected_option || null;
                const correctOption = question.correct_option;
                const isCorrect = selectedOption === correctOption;

                const options = [
                    { label: 'A', text: question.option_a || '' },
                    { label: 'B', text: question.option_b || '' },
                    { label: 'C', text: question.option_c || '' },
                    { label: 'D', text: question.option_d || '' },
                ].filter((opt) => !!opt.text?.trim());

                const optionsHtml = options.map((opt) => {
                    const isSelected = opt.label === selectedOption;
                    const isCorrectOption = opt.label === correctOption;

                    let bgColor = '#f8fafc';
                    let borderColor = '#e2e8f0';
                    let textColor = '#475569';
                    let statusIcon = '';

                    if (isCorrectOption) {
                        bgColor = '#d1fae5';
                        borderColor = '#6ee7b7';
                        textColor = '#065f46';
                        statusIcon = '✅';
                    } else if (isSelected && !isCorrectOption) {
                        bgColor = '#fee2e2';
                        borderColor = '#fca5a5';
                        textColor = '#991b1b';
                        statusIcon = '❌';
                    }

                    let badgeHtml = '';
                    if (isSelected && isCorrectOption) {
                        badgeHtml = `<span style="background: #a7f3d0; color: #065f46; padding: 0 8px; border-radius: 4px; font-size: 11px; margin-left: auto; font-weight: 600;">Your Answer ✓</span>`;
                    } else if (isSelected && !isCorrectOption) {
                        badgeHtml = `<span style="background: #fecaca; color: #991b1b; padding: 0 8px; border-radius: 4px; font-size: 11px; margin-left: auto; font-weight: 600;">Your Answer ✗</span>`;
                    } else if (isCorrectOption && !isSelected) {
                        badgeHtml = `<span style="background: #a7f3d0; color: #065f46; padding: 0 8px; border-radius: 4px; font-size: 11px; margin-left: auto; font-weight: 600;">Correct Option</span>`;
                    }

                    return `
                        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; background: ${bgColor}; border: 1px solid ${borderColor}; margin-bottom: 6px;">
                            <span style="font-weight: bold; font-size: 13px; color: ${textColor}; min-width: 20px;">${opt.label}.</span>
                            <span style="font-size: 13px; color: ${textColor}; flex: 1;">${escapeHtml(opt.text)}</span>
                            ${statusIcon ? `<span style="font-size: 14px;">${statusIcon}</span>` : ''}
                            ${badgeHtml}
                        </div>
                    `;
                }).join('');

                return `
                    <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 16px; background: #ffffff; page-break-inside: avoid;">
                        <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;">
                            <span style="display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; background: #ede9fe; color: #7c3aed; border-radius: 50%; font-size: 13px; font-weight: bold;">${index + 1}</span>
                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b; flex: 1;">${escapeHtml(question.question_text || 'Question text unavailable')}</p>
                        </div>
                        <div style="margin-left: 36px;">
                            ${optionsHtml}
                            <div style="margin-top: 8px; font-size: 12px; font-weight: 600;">
                                ${selectedOption
                        ? isCorrect
                            ? `<span style="color: #059669;">Result: Correct</span>`
                            : `<span style="color: #dc2626;">Result: Incorrect</span>`
                        : `<span style="color: #d97706;">Result: Unanswered</span>`
                    }
                            </div>
                        </div>
                    </div>
                `;
            }).join('')
            : '<p style="text-align: center; color: #64748b; padding: 20px;">No detailed questions available.</p>';

        container.innerHTML = `
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 20px 30px; color: #ffffff; border-radius: 12px; margin-bottom: 24px; text-align: center;">
                <h1 style="font-size: 20px; margin: 0; font-weight: bold; letter-spacing: 1px;">QUIZ RESULT REPORT</h1>
                <h2 style="font-size: 24px; margin: 4px 0 0; font-weight: bold;">Global Professional Institute</h2>
                <p style="font-size: 13px; margin: 4px 0 0; opacity: 0.95;">Generated on ${escapeHtml(formattedDate)}</p>
            </div>

            <!-- Info Block -->
            <div style="background: #f8fafc; border-radius: 10px; padding: 18px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; font-size: 13px;">
                    <div><strong>Course:</strong> ${escapeHtml(submission.course_title || 'N/A')}</div>
                    <div><strong>Quiz:</strong> ${escapeHtml(submission.quiz_title || 'N/A')}</div>
                    <div><strong>Instructor:</strong> ${escapeHtml(course?.instructor?.full_name || 'N/A')}</div>
                    <div><strong>Student:</strong> ${escapeHtml(submission.student_name || 'N/A')}</div>
                    <div><strong>Organization:</strong> ${escapeHtml(submission.student_organization_name || 'N/A')}</div>
                    <div><strong>Employee ID:</strong> ${escapeHtml(submission.student_employee_id || 'N/A')}</div>
                </div>
            </div>

            <!-- Score Metrics -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background: #ede9fe; border-radius: 10px; padding: 12px; text-align: center; border: 1px solid #c4b5fd;">
                    <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">${score}</div>
                    <div style="font-size: 11px; color: #5b21b6; font-weight: 600;">Correct Answers</div>
                </div>
                <div style="background: #dbeafe; border-radius: 10px; padding: 12px; text-align: center; border: 1px solid #93c5fd;">
                    <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${totalQuestions}</div>
                    <div style="font-size: 11px; color: #1d4ed8; font-weight: 600;">Total Questions</div>
                </div>
                <div style="background: #d1fae5; border-radius: 10px; padding: 12px; text-align: center; border: 1px solid #6ee7b7;">
                    <div style="font-size: 24px; font-weight: bold; color: #059669;">${percentage}%</div>
                    <div style="font-size: 11px; color: #047857; font-weight: 600;">Percentage</div>
                </div>
            </div>

            ${submission.is_disqualified ? `
                <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">⚠️</span>
                    <div>
                        <strong style="color: #991b1b; font-size: 14px;">Disqualified</strong>
                        <p style="margin: 2px 0 0; color: #7f1d1d; font-size: 13px;">
                            ${escapeHtml(submission.disqualification_reason || 'You have been disqualified from this quiz.')}
                        </p>
                    </div>
                </div>
            ` : (submission.warnings_count ?? 0) > 0 ? `
                <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 10px 16px; margin-bottom: 20px;">
                    <span style="font-size: 13px; color: #92400e; font-weight: 600;">⚠️ Warnings Issued: ${submission.warnings_count}</span>
                </div>
            ` : ''}

            <!-- Detailed Breakdown -->
            <div style="margin-top: 24px; border-top: 2px solid #e2e8f0; padding-top: 20px;">
                <h3 style="font-size: 17px; font-weight: bold; color: #1e293b; margin: 0 0 16px; display: flex; align-items: center; gap: 8px;">
                    <span>📝</span> DETAILED ANSWERS
                </h3>
                ${detailedAnswersHtml}
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8;">
                <p style="margin: 0;">Generated by Global Professional Institute Platform</p>
                <p style="margin: 2px 0 0;">Document ID: ${escapeHtml(String(submission.id))}</p>
            </div>
        `;

        document.body.appendChild(container);

        if ('fonts' in document) {
            try {
                await document.fonts.load('16px "Noto Sans Bengali"');
            } catch {
                console.warn('Custom font load bypassed');
            }
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false,
            imageTimeout: 15000,
            width: 800,
            height: container.scrollHeight,
            windowHeight: container.scrollHeight,
        });

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;

        const printableWidth = pageWidth - margin * 2;
        const printableHeight = pageHeight - margin * 2;

        let sourceY = 0;
        let remainingHeightPx = canvas.height;
        let pageCount = 0;
        const pxPerPage = (printableHeight * canvas.width) / printableWidth;

        while (remainingHeightPx > 0) {
            if (pageCount > 0) {
                pdf.addPage();
            }

            const chunkHeightPx = Math.min(remainingHeightPx, pxPerPage);
            const chunkPdfHeight = (chunkHeightPx * printableWidth) / canvas.width;

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = chunkHeightPx;

            const ctx = pageCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(
                    canvas,
                    0,
                    sourceY,
                    canvas.width,
                    chunkHeightPx,
                    0,
                    0,
                    canvas.width,
                    chunkHeightPx
                );

                const pageImgData = pageCanvas.toDataURL('image/png');
                pdf.addImage(
                    pageImgData,
                    'PNG',
                    margin,
                    margin,
                    printableWidth,
                    chunkPdfHeight,
                    undefined,
                    'FAST'
                );
            }

            remainingHeightPx -= chunkHeightPx;
            sourceY += chunkHeightPx;
            pageCount++;
        }

        // Add Watermark to each page
        const logoDataUrl = await getLogoDataUrl();
        addWatermarkToPdf(pdf, logoDataUrl);

        const timestamp = formatDateForFilename();
        const sanitizedTitle = sanitizeFilename(submission.quiz_title || 'quiz');
        const filename = `${sanitizedTitle}_result_${timestamp}.pdf`;
        pdf.save(filename);

        toast.success('Detailed PDF downloaded successfully', { id: toastId });
    } catch (error) {
        console.error('PDF generation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Failed to generate PDF: ${errorMessage}`, { id: toastId });
    } finally {
        if (container && document.body.contains(container)) {
            container.remove();
        }
    }
};

// ==========================================
// Combined Utility Functions
// ==========================================

export const getSubmissionStatus = (submission: QuizSubmission): {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
} => {
    if (submission.is_disqualified) {
        return {
            label: 'Disqualified',
            color: '#be123c',
            bgColor: '#fecdd3',
            icon: '🚫',
        };
    }
    if (submission.completed_at) {
        return {
            label: 'Completed',
            color: '#065f46',
            bgColor: '#d1fae5',
            icon: '✅',
        };
    }
    return {
        label: 'In Progress',
        color: '#92400e',
        bgColor: '#fef3c7',
        icon: '⏳',
    };
};

export const getSafeFilename = (title: string, prefix: string = '', suffix: string = ''): string => {
    const sanitized = sanitizeFilename(title);
    const dateStr = formatDateForFilename();
    const parts = [];
    if (prefix) parts.push(prefix);
    if (sanitized) parts.push(sanitized);
    if (suffix) parts.push(suffix);
    parts.push(dateStr);
    return `${parts.join('_')}.pdf`;
};

export default {
    downloadSubmissionsListPDF,
    generateAnswerSheetPDF,
    downloadDetailedResultPDF,
    getSubmissionStatus,
    getSafeFilename,
};