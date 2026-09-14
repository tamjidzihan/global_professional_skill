/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit2, Trash2, HelpCircle, AlertCircle, CheckCircle2, ChevronRight, UploadCloud
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    getQuizDetail,
    getQuizQuestions,
    createQuizQuestion,
    updateQuizQuestion,
    deleteQuizQuestion
} from '../../../../lib/api';
import type { Quiz, QuizQuestion } from '../../../../types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { extractErrorMessage } from '../../../../lib/errorUtils';
import { LoaderButton } from '../../../components/ui/LoaderButton';
import SEO from '../../../components/SEO';
import QuizTemplateDownloadButton from '../../../components/ui/QuizTemplateDownloadButton';
import QuizBulkImportModal from '../../../components/courses/QuizBulkImportModal';

const QuizQuestionsPage: React.FC = () => {
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Form states
    const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
    const [questionType, setQuestionType] = useState<'MCQ' | 'TRUE_FALSE'>('MCQ');
    const [questionText, setQuestionText] = useState('');
    const [optionA, setOptionA] = useState('');
    const [optionB, setOptionB] = useState('');
    const [optionC, setOptionC] = useState('');
    const [optionD, setOptionD] = useState('');
    const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');

    const loadData = async () => {
        if (!courseId || !quizId) return;
        setLoadingData(true);
        try {
            const [quizRes, questionsRes] = await Promise.all([
                getQuizDetail(courseId, quizId),
                getQuizQuestions(courseId, quizId)
            ]);

            if (quizRes.data.success) {
                setQuiz(quizRes.data.data);
            }
            if (questionsRes.data.success && Array.isArray(questionsRes.data.data)) {
                setQuestions(questionsRes.data.data);
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to load quiz setup');
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [courseId, quizId]);

    const handleSelectQuestionForEdit = (q: QuizQuestion) => {
        const isTF = q.question_type === 'TRUE_FALSE' || (!q.option_c?.trim() && !q.option_d?.trim());
        setEditingQuestion(q);
        setQuestionType(isTF ? 'TRUE_FALSE' : 'MCQ');
        setQuestionText(q.question_text);
        setOptionA(q.option_a);
        setOptionB(q.option_b);
        setOptionC(q.option_c || '');
        setOptionD(q.option_d || '');
        setCorrectOption(q.correct_option);
    };

    const handleResetForm = () => {
        setEditingQuestion(null);
        setQuestionType('MCQ');
        setQuestionText('');
        setOptionA('');
        setOptionB('');
        setOptionC('');
        setOptionD('');
        setCorrectOption('A');
    };

    const handleQuestionTypeChange = (type: 'MCQ' | 'TRUE_FALSE') => {
        setQuestionType(type);
        if (type === 'TRUE_FALSE') {
            setOptionA('True');
            setOptionB('False');
            setOptionC('');
            setOptionD('');
            if (correctOption !== 'A' && correctOption !== 'B') {
                setCorrectOption('A');
            }
        } else {
            if (optionA === 'True') setOptionA('');
            if (optionB === 'False') setOptionB('');
        }
    };

    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId || !quizId) return;

        if (!questionText.trim()) {
            toast.error('Question text is required');
            return;
        }

        if (questionType === 'TRUE_FALSE') {
            if (!optionA.trim() || !optionB.trim()) {
                toast.error('True and False option texts are required');
                return;
            }
            if (correctOption !== 'A' && correctOption !== 'B') {
                toast.error('Correct option must be True or False');
                return;
            }
        } else {
            if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
                toast.error('All 4 options (A, B, C, D) are required for Multiple Choice questions');
                return;
            }
        }

        setIsSaving(true);
        try {
            const payload = {
                question_type: questionType,
                question_text: questionText.trim(),
                option_a: optionA.trim(),
                option_b: optionB.trim(),
                option_c: questionType === 'TRUE_FALSE' ? '' : optionC.trim(),
                option_d: questionType === 'TRUE_FALSE' ? '' : optionD.trim(),
                correct_option: correctOption
            };

            if (editingQuestion) {
                await updateQuizQuestion(courseId, quizId, editingQuestion.id, payload);
                toast.success('Question updated successfully');
            } else {
                await createQuizQuestion(courseId, quizId, payload);
                toast.success('Question added successfully');
            }
            handleResetForm();
            // Reload question list and quiz info (updates question count)
            const [qRes, qzRes] = await Promise.all([
                getQuizQuestions(courseId, quizId),
                getQuizDetail(courseId, quizId)
            ]);
            if (qRes.data.success) setQuestions(qRes.data.data);
            if (qzRes.data.success) setQuiz(qzRes.data.data);
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to save question');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!courseId || !quizId) return;
        if (!window.confirm('Are you sure you want to delete this question?')) {
            return;
        }

        setDeletingId(questionId);
        try {
            await deleteQuizQuestion(courseId, quizId, questionId);
            toast.success('Question deleted successfully');
            if (editingQuestion?.id === questionId) {
                handleResetForm();
            }
            // Reload question list and quiz info
            const [qRes, qzRes] = await Promise.all([
                getQuizQuestions(courseId, quizId),
                getQuizDetail(courseId, quizId)
            ]);
            if (qRes.data.success) setQuestions(qRes.data.data);
            if (qzRes.data.success) setQuiz(qzRes.data.data);
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to delete question');
        } finally {
            setDeletingId(null);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <LoadingSpinner />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>Quiz not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SEO title={`Quiz Questions Setup - ${quiz.title}`} description="Manage multiple choice & true/false questions for quiz" />

            {/* Top Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1 flex-wrap">
                        <button
                            onClick={() => navigate(`/dashboard/instructor/my-courses/${courseId}/quizzes`)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-violet-600 transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Quizzes
                        </button>
                        <ChevronRight className="w-3 h-3" />
                        <span className="truncate max-w-50">{quiz.title}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>Questions Setup</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">Setup Questions</h1>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                    <QuizTemplateDownloadButton />
                    <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer shrink-0"
                    >
                        <UploadCloud className="w-4 h-4" />
                        Import Questions
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column - 5 Cols */}
                <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-6 sticky top-8">
                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3 mb-4">
                        {editingQuestion ? 'Edit Question' : 'Add New Question'}
                    </h3>

                    {/* Question Format Selector */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Question Format</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200/70">
                            <button
                                type="button"
                                onClick={() => handleQuestionTypeChange('MCQ')}
                                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${questionType === 'MCQ'
                                        ? 'bg-white text-violet-700 shadow-xs border border-violet-200/50'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Multiple Choice (4)
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuestionTypeChange('TRUE_FALSE')}
                                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${questionType === 'TRUE_FALSE'
                                        ? 'bg-white text-violet-700 shadow-xs border border-violet-200/50'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                True / False (2)
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSaveQuestion} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question Text</label>
                            <textarea
                                required
                                rows={3}
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                placeholder="Enter the question text here..."
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all resize-none"
                            />
                        </div>

                        {questionType === 'TRUE_FALSE' ? (
                            <div className="grid grid-cols-2 gap-4 bg-violet-50/40 p-3.5 rounded-xl border border-violet-100">
                                <div>
                                    <label className="block text-[11px] font-bold text-violet-700 uppercase mb-1">Option A</label>
                                    <input
                                        type="text"
                                        required
                                        value={optionA}
                                        onChange={(e) => setOptionA(e.target.value)}
                                        placeholder="True"
                                        className="w-full px-3 py-2 text-sm bg-white border border-violet-200 rounded-lg focus:outline-none focus:border-violet-500 font-semibold text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-violet-700 uppercase mb-1">Option B</label>
                                    <input
                                        type="text"
                                        required
                                        value={optionB}
                                        onChange={(e) => setOptionB(e.target.value)}
                                        placeholder="False"
                                        className="w-full px-3 py-2 text-sm bg-white border border-violet-200 rounded-lg focus:outline-none focus:border-violet-500 font-semibold text-gray-800"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Option A</label>
                                    <input
                                        type="text"
                                        required
                                        value={optionA}
                                        onChange={(e) => setOptionA(e.target.value)}
                                        placeholder="Option A"
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Option B</label>
                                    <input
                                        type="text"
                                        required
                                        value={optionB}
                                        onChange={(e) => setOptionB(e.target.value)}
                                        placeholder="Option B"
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Option C</label>
                                    <input
                                        type="text"
                                        required
                                        value={optionC}
                                        onChange={(e) => setOptionC(e.target.value)}
                                        placeholder="Option C"
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Option D</label>
                                    <input
                                        type="text"
                                        required
                                        value={optionD}
                                        onChange={(e) => setOptionD(e.target.value)}
                                        placeholder="Option D"
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correct Answer Option</label>
                            <select
                                value={correctOption}
                                onChange={(e) => setCorrectOption(e.target.value as 'A' | 'B' | 'C' | 'D')}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all cursor-pointer font-medium"
                            >
                                <option value="A">Option A {questionType === 'TRUE_FALSE' ? `(${optionA || 'True'})` : ''}</option>
                                <option value="B">Option B {questionType === 'TRUE_FALSE' ? `(${optionB || 'False'})` : ''}</option>
                                {questionType === 'MCQ' && (
                                    <>
                                        <option value="C">Option C</option>
                                        <option value="D">Option D</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="flex items-center justify-end gap-2.5 pt-3">
                            {editingQuestion && (
                                <button
                                    type="button"
                                    onClick={handleResetForm}
                                    className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                            )}
                            <LoaderButton
                                type="submit"
                                loading={isSaving}
                                className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
                            >
                                {editingQuestion ? 'Update Question' : 'Add Question'}
                            </LoaderButton>
                        </div>
                    </form>
                </div>

                {/* Question List Column - 7 Cols */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">
                            Questions Pool
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-50 text-violet-700">
                            {questions.length} Total
                        </span>
                    </div>

                    {questions.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h4 className="text-base font-semibold text-gray-900 mb-1">No Questions Added</h4>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-5">
                                Use the form on the left to add your first question, or upload an Excel / CSV spreadsheet to import in bulk.
                            </p>
                            <div className="flex items-center justify-center gap-2.5 flex-wrap">
                                <QuizTemplateDownloadButton />
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer"
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    Import Questions (Excel / CSV)
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, index) => {
                                const isTF = q.question_type === 'TRUE_FALSE' || (!q.option_c?.trim() && !q.option_d?.trim());
                                const activeOptions = [
                                    { label: 'A', text: q.option_a },
                                    { label: 'B', text: q.option_b },
                                    ...(isTF ? [] : [
                                        { label: 'C', text: q.option_c || '' },
                                        { label: 'D', text: q.option_d || '' }
                                    ])
                                ].filter(opt => !!opt.text?.trim());

                                return (
                                    <div
                                        key={q.id}
                                        className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${editingQuestion?.id === q.id
                                            ? 'border-violet-500 ring-2 ring-violet-500/10'
                                            : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        {/* Question Text & Badges */}
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex gap-2.5">
                                                <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-bold rounded-lg mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${isTF
                                                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                : 'bg-violet-50 text-violet-700 border border-violet-100'
                                                            }`}>
                                                            {isTF ? 'True / False' : 'MCQ (4 Options)'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-line">
                                                        {q.question_text}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => handleSelectQuestionForEdit(q)}
                                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                                                    title="Edit Question"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    disabled={deletingId === q.id}
                                                    onClick={() => handleDeleteQuestion(q.id)}
                                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                                                    title="Delete Question"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Options Details */}
                                        <div className={`grid gap-3 pl-8 ${isTF ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                                            {activeOptions.map((opt) => {
                                                const isCorrect = q.correct_option === opt.label;
                                                return (
                                                    <div
                                                        key={opt.label}
                                                        className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-medium transition-colors ${isCorrect
                                                            ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                                                            : 'border-gray-100 bg-white text-gray-600'
                                                            }`}
                                                    >
                                                        <span className={`w-5 h-5 flex items-center justify-center font-bold text-[10px] rounded-lg shrink-0 ${isCorrect
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-gray-100 text-gray-500'
                                                            }`}>
                                                            {opt.label}
                                                        </span>
                                                        <span className="truncate font-semibold">{opt.text}</span>
                                                        {isCorrect && (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bulk Import Modal */}
            {courseId && quizId && (
                <QuizBulkImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    courseId={courseId}
                    quizId={quizId}
                    quizTitle={quiz?.title}
                    onSuccess={() => {
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

export default QuizQuestionsPage;
