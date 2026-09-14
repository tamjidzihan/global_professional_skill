/**
 * Standard Quiz Question Template Generator and Downloader.
 * Supports both CSV and modern Microsoft Excel (.xlsx) formats for MCQ and True/False questions.
 */
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

export interface TemplateRow {
    question_type: 'MCQ' | 'TRUE_FALSE';
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: 'A' | 'B' | 'C' | 'D';
}

export const SAMPLE_TEMPLATE_DATA: TemplateRow[] = [
    {
        question_type: 'MCQ',
        question_text: 'What is the default port number for HTTP protocol?',
        option_a: '80',
        option_b: '443',
        option_c: '8080',
        option_d: '21',
        correct_option: 'A',
    },
    {
        question_type: 'TRUE_FALSE',
        question_text: 'Python is a statically typed and compiled language.',
        option_a: 'True',
        option_b: 'False',
        option_c: '',
        option_d: '',
        correct_option: 'B',
    },
    {
        question_type: 'MCQ',
        question_text: 'Which data structure follows the Last In First Out (LIFO) principle?',
        option_a: 'Queue',
        option_b: 'Array',
        option_c: 'Stack',
        option_d: 'Tree',
        correct_option: 'C',
    },
    {
        question_type: 'TRUE_FALSE',
        question_text: 'Django is an open-source Python-based web framework.',
        option_a: 'True',
        option_b: 'False',
        option_c: '',
        option_d: '',
        correct_option: 'A',
    },
    {
        question_type: 'MCQ',
        question_text: 'Which of the following is NOT a JavaScript primitive data type?',
        option_a: 'String',
        option_b: 'Boolean',
        option_c: 'Number',
        option_d: 'Array',
        correct_option: 'D',
    },
];

const CSV_HEADERS = [
    'Question Type',
    'Question Text',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Correct Option'
];

/**
 * Escapes a cell value for standard RFC-4180 CSV.
 */
function escapeCsvValue(val: string | undefined): string {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
}

/**
 * Downloads a standard CSV template for bulk quiz question creation (.csv).
 */
export function downloadQuizCsvTemplate(filename = 'quiz_questions_template.csv'): void {
    try {
        const headerRow = CSV_HEADERS.map(escapeCsvValue).join(',');
        const dataRows = SAMPLE_TEMPLATE_DATA.map((row) => [
            escapeCsvValue(row.question_type),
            escapeCsvValue(row.question_text),
            escapeCsvValue(row.option_a),
            escapeCsvValue(row.option_b),
            escapeCsvValue(row.option_c),
            escapeCsvValue(row.option_d),
            escapeCsvValue(row.correct_option),
        ].join(','));

        const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('CSV question template (.csv) downloaded successfully!');
    } catch (error) {
        console.error('Failed to download CSV template:', error);
        toast.error('Failed to generate CSV template. Please try again.');
    }
}

/**
 * Downloads a native Microsoft Excel spreadsheet template (.xlsx).
 */
export function downloadQuizExcelTemplate(filename = 'quiz_questions_template.xlsx'): void {
    try {
        const rows = SAMPLE_TEMPLATE_DATA.map((row) => [
            row.question_type,
            row.question_text,
            row.option_a,
            row.option_b,
            row.option_c,
            row.option_d,
            row.correct_option,
        ]);

        const worksheetData = [CSV_HEADERS, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Auto-fit column widths
        worksheet['!cols'] = [
            { wch: 15 }, // Question Type
            { wch: 45 }, // Question Text
            { wch: 20 }, // Option A
            { wch: 20 }, // Option B
            { wch: 20 }, // Option C
            { wch: 20 }, // Option D
            { wch: 15 }, // Correct Option
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions Template');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Excel question template (.xlsx) downloaded successfully!');
    } catch (error) {
        console.error('Failed to download Excel template:', error);
        toast.error('Failed to generate Excel template. Please try again.');
    }
}
