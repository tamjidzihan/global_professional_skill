import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    lookupQuiz,
    startQuiz,
    submitQuiz
} from '../../lib/api';
import type { QuizQuestion } from '../../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { extractErrorMessage } from '../../lib/errorUtils';
import { toast } from 'react-hot-toast';
import {
    Clock, ShieldAlert, AlertTriangle, ArrowRight, ArrowLeft,
    CheckCircle, ShieldCheck, XCircle, Lock
} from 'lucide-react';
import SEO from '../components/SEO';

const TakeQuizPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    // Setup state
    const [quizInfo, setQuizInfo] = useState<{ id: string; course: string; title: string; duration_minutes: number; question_count: number } | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(true);

    // PIN Gate state
    const [pinCode, setPinCode] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    // Active Quiz state
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any | null>(null);

    // Proctoring & Anti-Cheat State
    const [warningsCount, setWarningsCount] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const lastWarningTime = useRef<number>(0);

    // Fetch basic quiz info to unlock
    useEffect(() => {
        const fetchQuizInfo = async () => {
            if (!quizId) return;
            try {
                const res = await lookupQuiz(quizId);
                if (res.data.success) {
                    setQuizInfo(res.data.data);
                }
            } catch (error) {
                toast.error(extractErrorMessage(error) || 'Failed to load quiz metadata');
            } finally {
                setLoadingInfo(false);
            }
        };

        fetchQuizInfo();
    }, [quizId]);

    // Timer countdown
    useEffect(() => {
        if (!isUnlocked || remainingSeconds <= 0 || submissionResult) return;

        const interval = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    // Trigger auto submit
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isUnlocked, remainingSeconds, submissionResult]);

    // Anti-cheat: blur and visibility change handlers
    useEffect(() => {
        if (!isUnlocked || submissionResult) return;

        const handleViolation = () => {
            const now = Date.now();
            // Prevent duplicate warnings within 2 seconds
            if (now - lastWarningTime.current < 2000) return;
            lastWarningTime.current = now;

            setWarningsCount((prev) => {
                const next = prev + 1;
                setShowWarningModal(true);
                toast.error(`Anti-Cheat Warning: Tab/Window switch detected! Warning ${next}`, {
                    duration: 4000,
                    icon: '⚠️'
                });
                return next;
            });
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleViolation();
            }
        };

        const handleWindowBlur = () => {
            handleViolation();
        };

        // Prevent Right Click, Copy, and Cut events
        const preventDefaultActions = (e: Event) => {
            e.preventDefault();
            toast.error('Copy/Paste is disabled during the exam.');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('contextmenu', preventDefaultActions);
        document.addEventListener('copy', preventDefaultActions);
        document.addEventListener('cut', preventDefaultActions);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('contextmenu', preventDefaultActions);
            document.removeEventListener('copy', preventDefaultActions);
            document.removeEventListener('cut', preventDefaultActions);
        };
    }, [isUnlocked, submissionResult]);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quizId || !quizInfo) return;
        if (!pinCode.trim()) {
            toast.error('PIN code is required');
            return;
        }

        setIsStarting(true);
        try {
            const res = await startQuiz(quizInfo.course, quizId, { pin_code: pinCode.trim() });
            if (res.data.success) {
                const data = res.data.data;
                setQuestions(data.questions);
                setRemainingSeconds(data.remaining_seconds);
                setIsUnlocked(true);
                toast.success('Quiz unlocked and started successfully!');
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Incorrect PIN code or enrollment issue');
        } finally {
            setIsStarting(false);
        }
    };

    const handleAnswerSelect = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: option
        }));
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const getSubmissionPayload = () => {
        const answersList = Object.entries(selectedAnswers).map(([qId, val]) => ({
            question_id: qId,
            selected_option: val
        }));
        return {
            answers: answersList,
            warnings_count: warningsCount
        };
    };

    const handleManualSubmit = async () => {
        if (!window.confirm('Are you sure you want to submit your answers?')) {
            return;
        }
        await executeSubmit();
    };

    const handleAutoSubmit = async () => {
        toast.error('Time is up! Your answers are being submitted automatically.', { duration: 5000 });
        await executeSubmit(true);
    };

    const executeSubmit = async (isAuto = false) => {
        if (!quizId || !quizInfo) return;
        setIsSubmitting(true);
        try {
            const payload = getSubmissionPayload();
            const res = await submitQuiz(quizInfo.course, quizId, payload);
            if (res.data.success) {
                setSubmissionResult(res.data.data);
                toast.success(isAuto ? 'Auto-submitted successfully!' : 'Submitted successfully!');
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to submit quiz');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingInfo) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <LoadingSpinner />
            </div>
        );
    }

    if (!quizInfo) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <div className="bg-rose-50 text-rose-800 p-6 rounded-2xl border border-rose-100 mb-6 flex flex-col items-center">
                    <XCircle className="w-12 h-12 text-rose-500 mb-3" />
                    <h3 className="text-lg font-bold">Quiz Session Error</h3>
                    <p className="text-sm text-rose-600 mt-2">
                        Unable to find the quiz you are looking for. Please verify the URL or ensure you are enrolled in the course.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // 1. Completion & Result Screen
    if (submissionResult) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center animate-in fade-in duration-200">
                <SEO title={`Quiz Result - ${quizInfo.title}`} description="Quiz attempt completed" />
                <div className="bg-white border border-gray-150 rounded-3xl p-8 shadow-md">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-emerald-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                    <p className="text-sm text-gray-400 mb-8">{quizInfo.title}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <div className="text-xs font-bold text-gray-400 uppercase">Your Score</div>
                            <div className="text-3xl font-extrabold text-violet-600 mt-1">
                                {submissionResult.score} <span className="text-sm text-gray-450 font-normal">/ {submissionResult.total_questions}</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <div className="text-xs font-bold text-gray-400 uppercase">Cheat Warnings</div>
                            <div className={`text-3xl font-extrabold mt-1 ${submissionResult.warnings_count > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {submissionResult.warnings_count}
                            </div>
                        </div>
                    </div>

                    {submissionResult.warnings_count > 2 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left mb-8 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-amber-800">Multiple Warnings Logged</h4>
                                <p className="text-xs text-amber-700 mt-1">
                                    You triggered several tab/window change warnings during this attempt. The instructor has been notified.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-2xl transition-all shadow-sm cursor-pointer"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. PIN Unlock Screen
    if (!isUnlocked) {
        return (
            <div className="max-w-md mx-auto px-4 py-20 animate-in fade-in duration-200">
                <SEO title={`Unlock Quiz - ${quizInfo.title}`} description="Enter PIN to start quiz" />
                <div className="bg-white border border-gray-150 rounded-3xl p-8 shadow-md text-center">
                    <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Lock className="w-6 h-6" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-1">{quizInfo.title}</h2>
                    <p className="text-xs text-gray-450 mb-6">Course Quiz Access Gate</p>

                    <div className="space-y-4 text-left mb-6 text-sm text-gray-650 bg-gray-50 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>Duration: <strong>{quizInfo.duration_minutes} minutes</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-gray-400" />
                            <span>Proctored Exam: <strong>Tab-switching is forbidden!</strong></span>
                        </div>
                    </div>

                    <form onSubmit={handleUnlock} className="space-y-4 text-left">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 text-center">Enter Access PIN</label>
                            <input
                                type="text"
                                required
                                value={pinCode}
                                onChange={(e) => setPinCode(e.target.value.toUpperCase())}
                                placeholder="PIN CODE"
                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-center text-lg font-mono tracking-widest focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isStarting}
                            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-2xl transition-all shadow-sm cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2"
                        >
                            {isStarting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Validating PIN...
                                </>
                            ) : (
                                'Unlock & Start Quiz'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // 3. Main Active Quiz Taking Interface
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 select-none animate-in fade-in duration-200">
            <SEO title={`Attempt Quiz - ${quizInfo.title}`} description="Quiz application in progress" />

            {/* Header: Timer and Progress */}
            <div className="flex items-center justify-between gap-4 mb-6 bg-white border border-gray-150 p-4 rounded-2xl shadow-sm">
                <div>
                    <h2 className="text-base font-bold text-gray-900 line-clamp-1">{quizInfo.title}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {warningsCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Warnings: {warningsCount}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-700">
                        <Clock className={`w-4 h-4 ${remainingSeconds < 60 ? 'text-rose-500 animate-pulse' : 'text-gray-400'}`} />
                        <span className={remainingSeconds < 60 ? 'text-rose-600 font-bold' : ''}>
                            {formatTime(remainingSeconds)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-6">
                <div
                    className="bg-violet-600 h-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            {currentQuestion && (
                <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 shadow-sm mb-6 min-h-[300px] flex flex-col justify-between">
                    <div>
                        <div className="text-[10px] uppercase font-bold text-violet-600 tracking-wider mb-2">Question {currentQuestionIndex + 1}</div>
                        <h3 className="text-lg font-semibold text-gray-800 leading-relaxed whitespace-pre-line mb-8">
                            {currentQuestion.question_text}
                        </h3>

                        {/* Options */}
                        <div className="space-y-3.5">
                            {[
                                { label: 'A', text: currentQuestion.option_a },
                                { label: 'B', text: currentQuestion.option_b },
                                { label: 'C', text: currentQuestion.option_c },
                                { label: 'D', text: currentQuestion.option_d }
                            ].map((opt) => {
                                const isSelected = selectedAnswers[currentQuestion.id] === opt.label;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleAnswerSelect(currentQuestion.id, opt.label as 'A' | 'B' | 'C' | 'D')}
                                        className={`w-full text-left px-5 py-4 border rounded-2xl transition-all cursor-pointer flex items-center gap-3.5 ${isSelected
                                                ? 'border-violet-600 bg-violet-50/50 ring-2 ring-violet-600/10'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/30'
                                            }`}
                                    >
                                        <span className={`w-6 h-6 flex items-center justify-center font-bold text-xs rounded-lg shrink-0 ${isSelected
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {opt.label}
                                        </span>
                                        <span className={`text-sm font-medium ${isSelected ? 'text-violet-900 font-semibold' : 'text-gray-700'}`}>
                                            {opt.text}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between gap-4 mt-12 pt-6 border-t border-gray-100">
                        <button
                            disabled={isFirstQuestion}
                            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Previous
                        </button>

                        {isLastQuestion ? (
                            <button
                                onClick={handleManualSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Exam
                                        <CheckCircle className="w-4.5 h-4.5" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-2xl transition-all shadow-sm hover:shadow cursor-pointer"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Warning Alert Modal */}
            {showWarningModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6 animate-bounce" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Anti-Cheat Triggered</h3>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            You switched away from the active exam screen. Navigating to other tabs/windows is forbidden during this test.
                        </p>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-800 text-sm font-semibold mt-4">
                            Active Violations: {warningsCount}
                        </div>
                        <button
                            onClick={() => setShowWarningModal(false)}
                            className="mt-6 w-full py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 cursor-pointer transition-all"
                        >
                            I Understand &amp; Resume Quiz
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TakeQuizPage;
