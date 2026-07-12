import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../../../../hooks/useCourses';
import { LoaderButton } from '../../../components/ui/LoaderButton';
import {
    Plus, Edit, Trash2, ArrowLeft, Key, Clock, HelpCircle,
    Copy, Check, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    getQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz
} from '../../../../lib/api';
import type { Quiz } from '../../../../types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { extractErrorMessage } from '../../../../lib/errorUtils';
import SEO from '../../../components/SEO';

const QuizListPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { course, fetchCourseDetail, loading: courseLoading } = useCourses();

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDuration, setFormDuration] = useState(30);
    const [formPinCode, setFormPinCode] = useState('');

    // Shared Link state
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const loadQuizzes = async () => {
        if (!courseId) return;
        setLoadingQuizzes(true);
        try {
            const res = await getQuizzes(courseId);
            if (res.data.success && Array.isArray(res.data.data)) {
                setQuizzes(res.data.data);
            } else {
                setQuizzes([]);
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to load quizzes');
        } finally {
            setLoadingQuizzes(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchCourseDetail(courseId).catch(() => {
                toast.error('Failed to load course details');
            });
            loadQuizzes();
        }
    }, [courseId]);

    const handleOpenCreateModal = () => {
        setEditingQuiz(null);
        setFormTitle('');
        setFormDuration(30);
        // Generate random 4-digit PIN for convenience
        const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
        setFormPinCode(randomPin);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (quiz: Quiz) => {
        setEditingQuiz(quiz);
        setFormTitle(quiz.title);
        setFormDuration(quiz.duration_minutes);
        setFormPinCode(quiz.pin_code);
        setIsModalOpen(true);
    };

    const handleSaveQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId) return;
        if (!formTitle.trim()) {
            toast.error('Title is required');
            return;
        }
        if (formDuration <= 0) {
            toast.error('Duration must be greater than 0');
            return;
        }
        if (!formPinCode.trim()) {
            toast.error('PIN code is required');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                title: formTitle.trim(),
                pin_code: formPinCode.trim(),
                duration_minutes: formDuration
            };

            if (editingQuiz) {
                await updateQuiz(courseId, editingQuiz.id, payload);
                toast.success('Quiz updated successfully');
            } else {
                await createQuiz(courseId, payload);
                toast.success('Quiz created successfully');
            }
            setIsModalOpen(false);
            loadQuizzes();
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to save quiz');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (!courseId) return;
        if (!window.confirm('Are you sure you want to delete this quiz? This will delete all questions and submissions for this quiz.')) {
            return;
        }

        setDeletingId(quizId);
        try {
            await deleteQuiz(courseId, quizId);
            toast.success('Quiz deleted successfully');
            loadQuizzes();
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to delete quiz');
        } finally {
            setDeletingId(null);
        }
    };

    const handleCopyLink = (quizId: string) => {
        const url = `${window.location.origin}/quiz/${quizId}/take`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(quizId);
            toast.success('Quiz link copied to clipboard!');
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    if (courseLoading || (loadingQuizzes && quizzes.length === 0)) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <LoadingSpinner />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>Course not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SEO title={`Manage Quizzes - ${course.title}`} description="Create and manage course quizzes" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/dashboard/instructor/my-courses/${course.id}/curriculum`)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Course Quizzes</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage quizzes for: <span className="font-medium text-gray-700">{course.title}</span></p>
                    </div>
                </div>

                <button
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow cursor-pointer text-sm"
                >
                    <Plus className="w-4.5 h-4.5" />
                    Add New Quiz
                </button>
            </div>

            {/* Quizzes List */}
            {quizzes.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                    <HelpCircle className="w-12 h-12 text-violet-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No Quizzes Created Yet</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                        Quizzes are standalone exams. Create a quiz, add questions, and share the generated link with your students.
                    </p>
                    <button
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Create First Quiz
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => {
                        const quizUrl = `${window.location.origin}/quiz/${quiz.id}/take`;
                        return (
                            <div key={quiz.id} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                                            {quiz.title}
                                        </h3>
                                        <span className="shrink-0 inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-violet-50 text-violet-700">
                                            {quiz.question_count} {quiz.question_count === 1 ? 'Question' : 'Questions'}
                                        </span>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                                            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-gray-400 leading-none">Duration</div>
                                                <div className="font-semibold text-gray-800 mt-0.5">{quiz.duration_minutes} min</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                                            <Key className="w-4 h-4 text-gray-400 shrink-0" />
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-gray-400 leading-none">PIN Code</div>
                                                <div className="font-semibold text-gray-800 mt-0.5 tracking-wider">{quiz.pin_code}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Share Link Input / Button */}
                                    <div className="mb-6">
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Shareable Link</label>
                                        <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-205 rounded-xl">
                                            <input
                                                type="text"
                                                readOnly
                                                value={quizUrl}
                                                className="bg-transparent border-none text-xs text-gray-500 flex-1 pl-2 outline-none select-all truncate"
                                            />
                                            <button
                                                onClick={() => handleCopyLink(quiz.id)}
                                                className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-500 hover:text-violet-600 transition-all cursor-pointer"
                                                title="Copy Link"
                                            >
                                                {copiedId === quiz.id ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                            <a
                                                href={quizUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-500 hover:text-violet-600 transition-all cursor-pointer"
                                                title="Open in new tab"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-2 mt-auto">
                                    <button
                                        onClick={() => navigate(`/dashboard/instructor/my-courses/${courseId}/quizzes/${quiz.id}/questions`)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Questions &amp; Setup
                                    </button>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => handleOpenEditModal(quiz)}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                                            title="Edit Quiz details"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            disabled={deletingId === quiz.id}
                                            onClick={() => handleDeleteQuiz(quiz.id)}
                                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                                            title="Delete Quiz"
                                        >
                                            {deletingId === quiz.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingQuiz ? 'Edit Quiz Details' : 'Create New Quiz'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSaveQuiz} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quiz Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="e.g. Midterm Examination, Weekly Quiz 1"
                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (mins)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formDuration}
                                        onChange={(e) => setFormDuration(parseInt(e.target.value) || 0)}
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">PIN Access Code</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={10}
                                        value={formPinCode}
                                        onChange={(e) => setFormPinCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. 1234"
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 font-mono tracking-wider transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <LoaderButton
                                    type="submit"
                                    loading={isSaving}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
                                >
                                    {editingQuiz ? 'Save Changes' : 'Create Quiz'}
                                </LoaderButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizListPage;
