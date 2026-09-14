import React, { useState, useRef } from 'react';
import {
    UploadCloud, FileSpreadsheet, FileText, AlertCircle, CheckCircle2,
    X, AlertTriangle, Check, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { validateBulkQuizQuestions, bulkImportQuizQuestions } from '../../../lib/api';
import { extractErrorMessage } from '../../../lib/errorUtils';
import { downloadQuizCsvTemplate, downloadQuizExcelTemplate } from '../../../utils/quizTemplate';
import { LoaderButton } from '../ui/LoaderButton';

interface ValidationRowError {
    row: number;
    question_text: string;
    errors: string[];
    question_type?: string;
}

export interface ValidQuestionItem {
    row: number;
    question_type: 'MCQ' | 'TRUE_FALSE';
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: 'A' | 'B' | 'C' | 'D';
}

interface ValidationResponse {
    success: boolean;
    filename: string;
    total_rows: number;
    valid_count: number;
    error_count: number;
    has_errors: boolean;
    errors: ValidationRowError[];
    valid_questions: ValidQuestionItem[];
    message?: string;
}

interface QuizBulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    quizId: string;
    quizTitle?: string;
    onSuccess: () => void;
}

export const QuizBulkImportModal: React.FC<QuizBulkImportModalProps> = ({
    isOpen,
    onClose,
    courseId,
    quizId,
    quizTitle,
    onSuccess,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
    const [activeTab, setActiveTab] = useState<'preview' | 'errors'>('preview');

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (file: File) => {
        const validExtensions = ['.xlsx', '.xls', '.csv', '.tsv', '.txt'];
        const isExtensionValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!isExtensionValid) {
            toast.error('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size exceeds the 10MB limit.');
            return;
        }

        setSelectedFile(file);
        runValidation(file);
    };

    const runValidation = async (file: File) => {
        setIsValidating(true);
        setValidationResult(null);

        try {
            const res = await validateBulkQuizQuestions(courseId, quizId, file);
            if (res.data) {
                setValidationResult(res.data);
                if (res.data.has_errors && res.data.valid_count === 0) {
                    setActiveTab('errors');
                } else {
                    setActiveTab('preview');
                }
            }
        } catch (error) {
            const msg = extractErrorMessage(error) || 'Failed to validate questions file';
            toast.error(msg);
            setSelectedFile(null);
            setValidationResult(null);
        } finally {
            setIsValidating(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleReset = () => {
        setSelectedFile(null);
        setValidationResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleConfirmImport = async () => {
        if (!validationResult || validationResult.valid_count === 0) {
            toast.error('There are no valid questions to import.');
            return;
        }

        setIsImporting(true);
        try {
            const payload = {
                questions: validationResult.valid_questions,
            };
            const res = await bulkImportQuizQuestions(courseId, quizId, payload);
            if (res.data.success) {
                toast.success(res.data.message || `Successfully imported ${validationResult.valid_count} questions!`);
                onSuccess();
                onClose();
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to import questions');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={() => !isImporting && onClose()}
        >
            <div
                className="bg-white rounded-2xl max-w-4xl w-full border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                            <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Bulk Import Questions</h3>
                            <p className="text-xs text-gray-500">
                                {quizTitle ? `Quiz: ${quizTitle}` : 'Upload questions via Excel or CSV spreadsheet'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">

                    {/* Step 1: Upload Zone (if no file is validating or validated) */}
                    {!validationResult && !isValidating && (
                        <div className="space-y-5">
                            {/* Drag & Drop Box */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                                    isDragging
                                        ? 'border-violet-500 bg-violet-50/50 ring-4 ring-violet-500/10'
                                        : 'border-gray-200 hover:border-violet-400 hover:bg-gray-50/60'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv,.tsv"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            handleFileSelect(e.target.files[0]);
                                        }
                                    }}
                                    className="hidden"
                                />
                                <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3.5 shadow-2xs">
                                    <UploadCloud className="w-7 h-7" />
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">
                                    Click or Drag & Drop your spreadsheet here
                                </h4>
                                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                                    Supports Microsoft Excel (<code className="font-semibold text-gray-600">.xlsx, .xls</code>) and universal Comma-Separated Values (<code className="font-semibold text-gray-600">.csv</code>).
                                </p>
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-colors">
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    Browse Files on Device
                                </span>
                            </div>

                            {/* Download Template Banner */}
                            <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <FileSpreadsheet className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-xs">Don't have the formatted spreadsheet?</h5>
                                        <p className="text-[11px] text-gray-500">Download our standard question template with sample MCQ and True/False rows.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => downloadQuizExcelTemplate()}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
                                    >
                                        <FileSpreadsheet className="w-3.5 h-3.5" />
                                        Excel Template
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => downloadQuizCsvTemplate()}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer shadow-2xs"
                                    >
                                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                                        CSV Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Validating State */}
                    {isValidating && (
                        <div className="py-16 text-center space-y-3">
                            <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto" />
                            <h4 className="text-sm font-bold text-gray-900">Validating questions file...</h4>
                            <p className="text-xs text-gray-400">Checking row structure, MCQ choices, True/False format, and answer keys.</p>
                        </div>
                    )}

                    {/* Step 2: Validation Results & Error Preview */}
                    {validationResult && (
                        <div className="space-y-5">
                            {/* File Name Tag */}
                            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50/70 border border-gray-100 rounded-xl px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 text-violet-600" />
                                    <span className="font-semibold text-gray-700">{validationResult.filename || selectedFile?.name || 'Uploaded File'}</span>
                                </div>
                                <span className="text-[11px] text-gray-400">Ready to Review</span>
                            </div>

                            {/* Summary Metrics Banner */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-200/80 flex items-center justify-center text-gray-700 shrink-0">
                                        <FileText className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Rows</span>
                                        <p className="text-lg font-bold text-gray-900">{validationResult.total_rows}</p>
                                    </div>
                                </div>

                                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Valid Questions</span>
                                        <p className="text-lg font-bold text-emerald-800">{validationResult.valid_count}</p>
                                    </div>
                                </div>

                                <div className={`rounded-xl p-3.5 flex items-center gap-3 border ${
                                    validationResult.error_count > 0
                                        ? 'bg-rose-50/70 border-rose-100'
                                        : 'bg-gray-50/50 border-gray-100'
                                }`}>
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                        validationResult.error_count > 0
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        <AlertCircle className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                            validationResult.error_count > 0 ? 'text-rose-600' : 'text-gray-400'
                                        }`}>
                                            Errors Found
                                        </span>
                                        <p className={`text-lg font-bold ${
                                            validationResult.error_count > 0 ? 'text-rose-800' : 'text-gray-600'
                                        }`}>
                                            {validationResult.error_count}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Alert Banner if Errors exist */}
                            {validationResult.has_errors && (
                                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-amber-900">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <p className="font-semibold text-xs text-amber-950">
                                            {validationResult.error_count} {validationResult.error_count === 1 ? 'row contains errors' : 'rows contain errors'}
                                        </p>
                                        <p className="text-[11px] text-amber-800">
                                            You can either import the <strong>{validationResult.valid_count} valid questions</strong> right away, or click "Re-upload File" after fixing the spreadsheet.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tab Switcher: Valid Preview vs Errors */}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('preview')}
                                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                                            activeTab === 'preview'
                                                ? 'bg-violet-600 text-white shadow-2xs'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        Valid Questions ({validationResult.valid_count})
                                    </button>
                                    {validationResult.error_count > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('errors')}
                                            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                activeTab === 'errors'
                                                    ? 'bg-rose-600 text-white shadow-2xs'
                                                    : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                                            }`}
                                        >
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Errors to Fix ({validationResult.error_count})
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs text-gray-500 hover:text-violet-600 font-semibold cursor-pointer transition-colors"
                                >
                                    Upload Different File
                                </button>
                            </div>

                            {/* Tab 1: Valid Questions List */}
                            {activeTab === 'preview' && (
                                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                                    {validationResult.valid_count === 0 ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
                                            <p className="font-semibold text-gray-700">No valid questions found in this file.</p>
                                            <p className="text-[11px] mt-1">Please check the Errors tab to see required fixes.</p>
                                        </div>
                                    ) : (
                                        validationResult.valid_questions.map((q, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 transition-all shadow-2xs space-y-2.5"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                                                            {idx + 1}
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                                            q.question_type === 'MCQ' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            {q.question_type}
                                                        </span>
                                                        <span className="font-semibold text-gray-900 line-clamp-1">{q.question_text}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-mono shrink-0">Row {q.row}</span>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                                    <div className={`px-2 py-1 rounded-lg border ${
                                                        q.correct_option === 'A'
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                                            : 'bg-gray-50 border-gray-100 text-gray-600'
                                                    }`}>
                                                        A: {q.option_a}
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-lg border ${
                                                        q.correct_option === 'B'
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                                            : 'bg-gray-50 border-gray-100 text-gray-600'
                                                    }`}>
                                                        B: {q.option_b}
                                                    </div>
                                                    {q.question_type === 'MCQ' && (
                                                        <>
                                                            <div className={`px-2 py-1 rounded-lg border ${
                                                                q.correct_option === 'C'
                                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                                                    : 'bg-gray-50 border-gray-100 text-gray-600'
                                                            }`}>
                                                                C: {q.option_c}
                                                            </div>
                                                            <div className={`px-2 py-1 rounded-lg border ${
                                                                q.correct_option === 'D'
                                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                                                    : 'bg-gray-50 border-gray-100 text-gray-600'
                                                            }`}>
                                                                D: {q.option_d}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Tab 2: Error Rows List */}
                            {activeTab === 'errors' && (
                                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                                    {validationResult.errors.map((err, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-rose-50/50 border border-rose-200/70 rounded-xl p-3.5 space-y-2"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 font-bold text-[10px]">
                                                        Row {err.row}
                                                    </span>
                                                    <span className="font-semibold text-gray-900 line-clamp-1">
                                                        {err.question_text}
                                                    </span>
                                                </div>
                                            </div>
                                            <ul className="list-disc list-inside space-y-0.5 text-rose-800 text-[11px] font-medium pl-1">
                                                {err.errors.map((e, eIdx) => (
                                                    <li key={eIdx}>{e}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                        Cancel
                    </button>

                    <div className="flex items-center gap-2">
                        {validationResult && validationResult.valid_count > 0 && (
                            <LoaderButton
                                type="button"
                                loading={isImporting}
                                onClick={handleConfirmImport}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Import {validationResult.valid_count} Valid {validationResult.valid_count === 1 ? 'Question' : 'Questions'}
                            </LoaderButton>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizBulkImportModal;
