import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';
import type { QuizSubmission } from '../types';

// ==========================================
// Type Definitions
// ==========================================

export interface QuizQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

export interface StudentAnswer {
  question_id: string;
  selected_option: string | null;
}

export interface QuizSubmissionDetail {
  shuffled_question_ids?: string[];
  student_answers?: StudentAnswer[];
  [key: string]: unknown;
}

export interface ApiClient {
  get: <T = { success: boolean; data: QuizSubmissionDetail }>(url: string) => Promise<{ data: T }>;
}

export interface DownloadPDFOptions {
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
 * Preloads image assets to prevent blank rendered nodes in html2canvas.
 */
const preloadImage = (imgElement: HTMLImageElement | null): Promise<void> => {
  if (!imgElement) return Promise.resolve();
  if (imgElement.complete && imgElement.naturalWidth !== 0) return Promise.resolve();

  return new Promise((resolve) => {
    imgElement.onload = () => resolve();
    imgElement.onerror = () => {
      console.warn('Image failed to load, proceeding without asset:', imgElement.src);
      resolve();
    };
  });
};

// ==========================================
// Main PDF Generator Function
// ==========================================

export const downloadResultPDF = async ({ submission, course, api }: DownloadPDFOptions): Promise<void> => {
  const toastId = toast.loading('Generating PDF ...');
  let container: HTMLDivElement | null = null;

  try {
    // 1. Fetch complete submission details
    const submissionRes = await api.get<{ success: boolean; data: QuizSubmissionDetail }>(
      `/courses/my-quiz-submissions/${submission.id}/`
    );

    if (!submissionRes.data?.success) {
      toast.error('Failed to load submission details', { id: toastId });
      return;
    }

    const submissionDetail = submissionRes.data.data;

    // 2. Derive Score Metrics
    const totalQuestions = submission.total_questions || 0;
    const score = submission.score || 0;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // 3. Setup Shuffled/Standard Question IDs
    const questionsList: QuizQuestion[] = submission.questions || [];
    const questionIds: string[] =
      submissionDetail.shuffled_question_ids && submissionDetail.shuffled_question_ids.length > 0
        ? submissionDetail.shuffled_question_ids
        : questionsList.map((q) => q.id);

    // 4. Create Off-Screen DOM Container
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

    // 5. Construct HTML Content safely with escapeHtml
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
        ];

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
            badgeHtml = `<span style="background: #a7f3d0; color: #065f46; padding: 0 8px 10px; border-radius: 4px; font-size: 11px; margin-left: auto; font-weight: 600;">Your Answer ✓</span>`;
          } else if (isSelected && !isCorrectOption) {
            badgeHtml = `<span style="background: #fecaca; color: #991b1b; padding: 0 8px 10px; border-radius: 4px; font-size: 11px; margin-left: auto; font-weight: 600;">Your Answer ✗</span>`;
          } else if (isCorrectOption && !isSelected) {
            badgeHtml = `<span style="background: #a7f3d0; color: #065f46; padding: 0 8px 10px; border-radius: 4px; font-size: 11px; margin-left: auto; font-weight: 600;">Correct Option</span>`;
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
                <span style="display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; background: #ede9fe; color: #7c3aed; border-radius: 50%; font-size: 13px; font-weight: bold; padding-bottom: 10px;">${index + 1}</span>
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
      <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 4px 30px; padding-bottom: 30px; color: #ffffff; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 20px;">
         <div style="flex: 1; text-align: center;">
          <h1 style="font-size: 20px; margin: 0; font-weight: bold; letter-spacing: 1px;">QUIZ RESULT REPORT</h1>
          <h2 style="font-size: 24px; margin: 4px 0 0; font-weight: bold;">Global Professional Institute</h2>
          <p style="font-size: 13px; margin: 4px 0 0; opacity: 0.95;">Generated on ${escapeHtml(formattedDate)}</p>
        </div>
      </div>

      <!-- Info Block -->
      <div style="background: #f8fafc; border-radius: 10px; padding: 18px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; font-size: 13px;">
          <div><strong>Course:</strong> ${escapeHtml(submission.course_title || 'N/A')}</div>
          <div><strong>Quiz:</strong> ${escapeHtml(submission.quiz_title || 'N/A')}</div>
          <div><strong>Instructor:</strong> ${escapeHtml(course?.instructor?.full_name || 'N/A')}</div>
          <div><strong>Student:</strong> ${escapeHtml(submission.student_name || 'N/A')}</div>
        </div>
      </div>

      <!-- Score Metrics -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div style="background: #ede9fe; border-radius: 10px; padding-bottom: 20px; text-align: center; border: 1px solid #c4b5fd;">
          <div style="font-size: 26px; font-weight: bold; color: #7c3aed;">${score}</div>
          <div style="font-size: 12px; color: #5b21b6; font-weight: 600;">Correct Answers</div>
        </div>
        <div style="background: #dbeafe; border-radius: 10px; padding-bottom: 20px; text-align: center; border: 1px solid #93c5fd;">
          <div style="font-size: 26px; font-weight: bold; color: #2563eb;">${totalQuestions}</div>
          <div style="font-size: 12px; color: #1d4ed8; font-weight: 600;">Total Questions</div>
        </div>
        <div style="background: #d1fae5; border-radius: 10px; padding-bottom: 20px; text-align: center; border: 1px solid #6ee7b7;">
          <div style="font-size: 26px; font-weight: bold; color: #059669;">${percentage}%</div>
          <div style="font-size: 12px; color: #047857; font-weight: 600;">Percentage</div>
        </div>
      </div>

      <!-- Disqualification / Warning Status -->
      ${submission.is_disqualified
        ? `
            <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">⚠️</span>
              <div>
                <strong style="color: #991b1b; font-size: 14px;">Disqualified</strong>
                <p style="margin: 2px 0 0; color: #7f1d1d; font-size: 13px;">
                  ${escapeHtml(submission.disqualification_reason || 'You have been disqualified from this quiz.')}
                </p>
              </div>
            </div>
          `
        : (submission.warnings_count ?? 0) > 0
          ? `
            <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 10px 16px; margin-bottom: 20px;">
              <span style="font-size: 13px; color: #92400e; font-weight: 600;">⚠️ Warnings Issued: ${submission.warnings_count}</span>
            </div>
          `
          : ''
      }

      <!-- Time Information -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 24px;">
        <div style="background: #f8fafc; border-radius: 10px; padding: 14px; border: 1px solid #e2e8f0;">
          <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 2px;">Started At</div>
          <div style="font-size: 13px; font-weight: 600;">
            ${submission.started_at ? escapeHtml(new Date(submission.started_at).toLocaleString()) : 'N/A'}
          </div>
        </div>
        <div style="background: #f8fafc; border-radius: 10px; padding: 14px; border: 1px solid #e2e8f0;">
          <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 2px;">Completed At</div>
          <div style="font-size: 13px; font-weight: 600;">
            ${submission.completed_at ? escapeHtml(new Date(submission.completed_at).toLocaleString()) : 'Incomplete'}
          </div>
        </div>
      </div>

      <!-- Detailed Breakdown -->
      <div style="margin-top: 24px; border-top: 2px solid #e2e8f0; padding-top: 20px;">
        <h3 style="font-size: 17px; font-weight: bold; color: #1e293b; margin: 0 0 16px; display: flex; align-items: center; gap: 8px;">
          <span>📝</span> DETAILED ANSWERS
        </h3>
        ${detailedAnswersHtml}
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8;">
        <p style="margin: 0;">Generated by Global Professional Skills Platform</p>
        <p style="margin: 2px 0 0;">Document ID: ${escapeHtml(String(submission.id))}</p>
      </div>
    `;

    document.body.appendChild(container);

    // 6. Pre-load dependencies (Fonts & Images)
    if ('fonts' in document) {
      await document.fonts.load('16px "Noto Sans Bengali"').catch(() => {
        console.warn('Custom font load bypassed');
      });
    }

    const logoImg = container.querySelector<HTMLImageElement>('#pdf-header-logo');
    await preloadImage(logoImg);

    // 7. Render Canvas via html2canvas
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

    // 8. Generate A4 PDF with jsPDF
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

    // Canvas Height slicing calculation per page
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

    // 9. Save Generated PDF File
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedTitle = (submission.quiz_title || 'quiz')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const filename = `${sanitizedTitle}_result_${timestamp}.pdf`;
    pdf.save(filename);

    toast.success('PDF downloaded successfully', { id: toastId });
  } catch (error) {
    console.error('PDF generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error(`Failed to generate PDF: ${errorMessage}`, { id: toastId });
  } finally {
    // 10. Clean DOM Node safely
    if (container && document.body.contains(container)) {
      container.remove();
    }
  }
};