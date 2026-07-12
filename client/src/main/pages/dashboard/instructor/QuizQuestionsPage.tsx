import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Edit2, Trash2, HelpCircle, AlertCircle, CheckCircle2, ChevronRight
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

const QuizQuestionsPage: React.FC = () => {
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form states
    const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
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
        setEditingQuestion(q);
        setQuestionText(q.question_text);
        setOptionA(q.option_a);
        setOptionB(q.option_b);
        setOptionC(q.option_c);
        setOptionD(q.option_d);
        setCorrectOption(q.correct_option);
    };

    const handleResetForm = () => {
        setEditingQuestion(null);
        setQuestionText('');
        setOptionA('');
        setOptionB('');
        setOptionC('');
        setOptionD('');
        setCorrectOption('A');
    };

    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId || !quizId) return;

        if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
            toast.error('All fields are required');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                question_text: questionText.trim(),
                option_a: optionA.trim(),
                option_b: optionB.trim(),
                option_c: optionC.trim(),
                option_d: optionD.trim(),
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
            <div className="flex items-center justify-center min-h-[400px]">
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
            <SEO title={`Quiz Questions Setup - ${quiz.title}`} description="Manage multiple choice questions for quiz" />

            {/* Top Navigation */}
            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={() => navigate(`/dashboard/instructor/my-courses/${courseId}/quizzes`)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                        <span>Quizzes</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{quiz.title}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>Questions Setup</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">Setup Questions</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column - 5 Cols */}
                <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden p-6 sticky top-8">
                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3 mb-4">
                        {editingQuestion ? 'Edit Question' : 'Add New Question'}
                    </h3>

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

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correct Answer Option</label>
                            <select
                                value={correctOption}
                                onChange={(e) => setCorrectOption(e.target.value as 'A' | 'B' | 'C' | 'D')}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all cursor-pointer font-medium"
                            >
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
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
                    <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex items-center justify-between">
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
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                Use the form on the left to add your first Multiple Choice Question (MCQ) for this quiz.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, index) => (
                                <div
                                    key={q.id}
                                    className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                                        editingQuestion?.id === q.id
                                            ? 'border-violet-500 ring-2 ring-violet-500/10'
                                            : 'border-gray-150 hover:border-gray-200'
                                    }`}
                                >
                                    {/* Question Text */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex gap-2.5">
                                            <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-bold rounded-lg mt-0.5">
                                                {index + 1}
                                            </span>
                                            <p className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-line">
                                                {q.question_text}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => handleSelectQuestionForEdit(q)}
                                                className="p-1.5 text-gray-550 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                                        {[
                                            { label: 'A', text: q.option_a },
                                            { label: 'B', text: q.option_b },
                                            { label: 'C', text: q.option_c },
                                            { label: 'D', text: q.option_d }
                                        ].map((opt) => {
                                            const isCorrect = q.correct_option === opt.label;
                                            return (
                                                <div
                                                    key={opt.label}
                                                    className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-medium transition-colors ${
                                                        isCorrect
                                                            ? 'border-emerald-250 bg-emerald-50/50 text-emerald-800'
                                                            : 'border-gray-150 bg-white text-gray-600'
                                                    }`}
                                                >
                                                    <span className={`w-5 h-5 flex items-center justify-center font-bold text-[10px] rounded-lg shrink-0 ${
                                                        isCorrect
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {opt.label}
                                                    </span>
                                                    <span className="truncate">{opt.text}</span>
                                                    {isCorrect && (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizQuestionsPage;
