import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, HelpCircle, ChevronDown, X } from 'lucide-react';
import { downloadQuizCsvTemplate, downloadQuizExcelTemplate, SAMPLE_TEMPLATE_DATA } from '../../../utils/quizTemplate';

interface QuizTemplateDownloadButtonProps {
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md';
}

export const QuizTemplateDownloadButton: React.FC<QuizTemplateDownloadButtonProps> = ({
    className = '',
    size = 'sm',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDownloadCsv = () => {
        downloadQuizCsvTemplate();
        setIsOpen(false);
    };

    const handleDownloadExcel = () => {
        downloadQuizExcelTemplate();
        setIsOpen(false);
    };

    return (
        <>
            <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`inline-flex items-center justify-center gap-2 font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-violet-300 hover:text-violet-700 transition-all shadow-xs hover:shadow-sm cursor-pointer shrink-0 ${
                        size === 'sm' ? 'px-3.5 py-2 text-xs' : 'px-4 py-2.5 text-sm'
                    }`}
                    title="Download template for uploading quiz questions"
                >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Download Question Template</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-600' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-gray-100 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3.5 py-2 border-b border-gray-100 mb-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Question Templates</p>
                            <p className="text-xs text-gray-500 mt-0.5">Choose file format to download</p>
                        </div>

                        <button
                            type="button"
                            onClick={handleDownloadExcel}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-violet-50/70 hover:text-violet-700 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 group-hover:text-violet-700">Excel Format</div>
                                    <div className="text-[11px] text-gray-400">Microsoft Excel (.xlsx)</div>
                                </div>
                            </div>
                            <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-600" />
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadCsv}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-violet-50/70 hover:text-violet-700 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 group-hover:text-violet-700">CSV Format</div>
                                    <div className="text-[11px] text-gray-400">Universal comma-separated (.csv)</div>
                                </div>
                            </div>
                            <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-600" />
                        </button>

                        <div className="border-t border-gray-100 mt-1 pt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    setShowGuideModal(true);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-[11px] font-semibold text-violet-600 hover:bg-violet-50 transition-colors cursor-pointer"
                            >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>View Format Guidelines & Columns</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Template Guidelines Modal */}
            {showGuideModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
                    onClick={() => setShowGuideModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-2xl w-full border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Quiz Questions Template Guidelines</h3>
                                    <p className="text-xs text-gray-500">Standard columns and formatting rules</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowGuideModal(false)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-4 text-xs">
                            <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-3.5 text-violet-900">
                                <p className="font-semibold mb-1">Supported Question Types:</p>
                                <ul className="list-disc list-inside space-y-1 text-violet-800">
                                    <li><strong className="font-semibold text-violet-950">MCQ</strong>: Multiple Choice with 4 options (A, B, C, D). All 4 options are required. Correct option must be <code className="bg-violet-100 px-1 rounded font-mono font-bold">A</code>, <code className="bg-violet-100 px-1 rounded font-mono font-bold">B</code>, <code className="bg-violet-100 px-1 rounded font-mono font-bold">C</code>, or <code className="bg-violet-100 px-1 rounded font-mono font-bold">D</code>.</li>
                                    <li><strong className="font-semibold text-violet-950">TRUE_FALSE</strong>: True/False question. Option A is <code className="bg-violet-100 px-1 rounded font-mono font-bold">True</code> and Option B is <code className="bg-violet-100 px-1 rounded font-mono font-bold">False</code>. Option C and Option D can be left empty. Correct option must be <code className="bg-violet-100 px-1 rounded font-mono font-bold">A</code> or <code className="bg-violet-100 px-1 rounded font-mono font-bold">B</code>.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-[11px] text-gray-400">Column Structure</h4>
                                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
                                    <table className="w-full text-left text-[11px]">
                                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px]">
                                            <tr>
                                                <th className="px-3 py-2">Column Name</th>
                                                <th className="px-3 py-2">Required?</th>
                                                <th className="px-3 py-2">Allowed Values / Format</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                            <tr>
                                                <td className="px-3 py-2 font-mono font-semibold text-violet-700">Question Type</td>
                                                <td className="px-3 py-2 text-emerald-600 font-bold">Yes</td>
                                                <td className="px-3 py-2"><code>MCQ</code> or <code>TRUE_FALSE</code></td>
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2 font-mono font-semibold text-violet-700">Question Text</td>
                                                <td className="px-3 py-2 text-emerald-600 font-bold">Yes</td>
                                                <td className="px-3 py-2">Any text / question prompt</td>
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2 font-mono font-semibold text-violet-700">Option A</td>
                                                <td className="px-3 py-2 text-emerald-600 font-bold">Yes</td>
                                                <td className="px-3 py-2">Text for Option A (or "True" for True/False)</td>
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2 font-mono font-semibold text-violet-700">Option B</td>
                                                <td className="px-3 py-2 text-emerald-600 font-bold">Yes</td>
                                                <td className="px-3 py-2">Text for Option B (or "False" for True/False)</td>
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2 font-mono font-semibold text-violet-700">Option C</td>
                                                <td className="px-3 py-2 text-gray-400 font-bold">MCQ only</td>
                                                <td className="px-3 py-2">Required for MCQ, leave blank for True/False</td>
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2 font-mono font-semibold text-violet-700">Option D</td>
                                                <td className="px-3 py-2 text-gray-400 font-bold">MCQ only</td>
                                                <td className="px-3 py-2">Required for MCQ, leave blank for True/False</td>
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2 font-mono font-semibold text-violet-700">Correct Option</td>
                                                <td className="px-3 py-2 text-emerald-600 font-bold">Yes</td>
                                                <td className="px-3 py-2"><code>A</code>, <code>B</code>, <code>C</code>, or <code>D</code></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-[11px] text-gray-400">Sample Preview</h4>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 overflow-x-auto">
                                    <div className="space-y-2">
                                        {SAMPLE_TEMPLATE_DATA.slice(0, 2).map((item, idx) => (
                                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-200/70">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                        item.question_type === 'MCQ' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {item.question_type}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">{item.question_text}</span>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-gray-600 mt-2">
                                                    <div className={`px-2 py-1 rounded ${item.correct_option === 'A' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'bg-gray-50'}`}>A: {item.option_a}</div>
                                                    <div className={`px-2 py-1 rounded ${item.correct_option === 'B' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'bg-gray-50'}`}>B: {item.option_b}</div>
                                                    {item.option_c && <div className={`px-2 py-1 rounded ${item.correct_option === 'C' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'bg-gray-50'}`}>C: {item.option_c}</div>}
                                                    {item.option_d && <div className={`px-2 py-1 rounded ${item.correct_option === 'D' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'bg-gray-50'}`}>D: {item.option_d}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <button
                                type="button"
                                onClick={() => setShowGuideModal(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                            >
                                Close
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleDownloadCsv}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer shadow-2xs"
                                >
                                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                                    Download CSV
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownloadExcel}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    Download Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuizTemplateDownloadButton;
