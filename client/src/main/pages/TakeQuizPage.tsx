/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    lookupQuiz,
    startQuiz,
    submitQuiz,
    logWarning,
    getAnswerSheet,
    getQuestionSheet
} from '../../lib/api';
import type { QuizQuestion } from '../../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { extractErrorMessage } from '../../lib/errorUtils';
import { toast } from 'react-hot-toast';
import {
    Clock, ShieldAlert, AlertTriangle, ArrowRight,
    CheckCircle, ShieldCheck, XCircle, Lock, Download,
    RefreshCw, BookOpen, FileText
} from 'lucide-react';
import SEO from '../components/SEO';

const TakeQuizPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    // Setup state
    const [quizInfo, setQuizInfo] = useState<{ id: string; course: string; title: string; duration_minutes: number; question_count: number; expires_at: string | null; is_expired: boolean } | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [isQuizExpired, setIsQuizExpired] = useState(false);

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
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [warningsCount, setWarningsCount] = useState(0);
    const [isDisqualified, setIsDisqualified] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showDisqualificationModal, setShowDisqualificationModal] = useState(false);
    const [warningLevel, setWarningLevel] = useState<number>(0);
    const [disqualificationCountdown, setDisqualificationCountdown] = useState(5);
    const lastWarningTime = useRef<number>(0);

    // Reload warning state
    const [showReloadWarning, setShowReloadWarning] = useState(false);

    // Answer sheet & question sheet state
    const [answerSheet, setAnswerSheet] = useState<any | null>(null);
    const [loadingAnswerSheet, setLoadingAnswerSheet] = useState(false);
    const [loadingQuestionSheet, setLoadingQuestionSheet] = useState(false);
    const [showAnswerSheet, setShowAnswerSheet] = useState(false);

    // Fetch basic quiz info to unlock
    useEffect(() => {
        const fetchQuizInfo = async () => {
            if (!quizId) return;
            try {
                const res = await lookupQuiz(quizId);
                if (res.data.success) {
                    const data = res.data.data;
                    setQuizInfo(data);
                    if (data.is_expired) {
                        setIsQuizExpired(true);
                    }
                }
            } catch (error: any) {
                // 410 Gone = quiz expired
                if (error?.response?.status === 410 || error?.response?.data?.expired) {
                    setIsQuizExpired(true);
                } else {
                    toast.error(extractErrorMessage(error) || 'Failed to load quiz metadata');
                }
            } finally {
                setLoadingInfo(false);
            }
        };

        fetchQuizInfo();
    }, [quizId]);

    // Timer countdown
    useEffect(() => {
        if (!isUnlocked || remainingSeconds <= 0 || submissionResult || isDisqualified) return;

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
    }, [isUnlocked, remainingSeconds, submissionResult, isDisqualified]);

    // Disqualification countdown and redirect
    useEffect(() => {
        if (!isDisqualified || !showDisqualificationModal) return;

        const interval = setInterval(() => {
            setDisqualificationCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    navigate('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isDisqualified, showDisqualificationModal, navigate]);

    // Anti-cheat: blur and visibility change handlers
    useEffect(() => {
        if (!isUnlocked || submissionResult || isDisqualified) return;

        const handleViolation = async () => {
            const now = Date.now();
            // Prevent duplicate warnings within 2 seconds
            if (now - lastWarningTime.current < 2000) return;
            if (isSubmitting || submissionResult || isDisqualified) return;
            lastWarningTime.current = now;

            if (!submissionId) return;

            try {
                const res = await logWarning(submissionId);
                if (res.data.success) {
                    const data = res.data.data;
                    setWarningsCount(data.warnings_count);

                    if (data.status === 'disqualified') {
                        setIsDisqualified(true);
                        setShowDisqualificationModal(true);
                        setShowWarningModal(false);
                        toast.error('You have been disqualified from the quiz!', { duration: 5000 });
                    } else {
                        setWarningLevel(data.warnings_count);
                        setShowWarningModal(true);
                        const warningMsg = data.warnings_count === 1
                            ? "Warning 1/3 - Please stay on quiz tab"
                            : "Warning 2/3 - Final warning!";
                        toast.error(warningMsg, {
                            duration: 4000,
                            icon: '⚠️'
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to log warning', error);
            }
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
    }, [isUnlocked, submissionResult, isDisqualified, submissionId, isSubmitting]);

    // Feature 1: Reload warning — intercept page refresh during active quiz
    useEffect(() => {
        if (!isUnlocked || submissionResult || isDisqualified) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            // Show our custom in-page reload warning banner
            setShowReloadWarning(true);
            // Standard browser dialog
            e.returnValue = 'Refreshing the page may cause loss of your quiz progress or disqualification. Are you sure?';
            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isUnlocked, submissionResult, isDisqualified]);

    // Feature 2: Live expiry countdown — check if quiz has expired while student is on PIN gate
    useEffect(() => {
        if (!quizInfo?.expires_at || isUnlocked || isQuizExpired) return;

        const checkExpiry = () => {
            const now = new Date();
            const expiresAt = new Date(quizInfo.expires_at!);
            if (now >= expiresAt) {
                setIsQuizExpired(true);
            }
        };

        checkExpiry();
        const interval = setInterval(checkExpiry, 5000); // check every 5 seconds
        return () => clearInterval(interval);
    }, [quizInfo?.expires_at, isUnlocked, isQuizExpired]);

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
                setSubmissionId(data.submission_id);
                setWarningsCount(data.warnings_count || 0);

                // Handle answered questions on reload
                const answered = data.answered_questions || [];

                // Find first unanswered question index
                if (answered.length > 0 && data.questions.length > 0) {
                    const firstUnanswered = data.questions.findIndex((q: any) => !answered.includes(q.id));
                    if (firstUnanswered !== -1) {
                        setCurrentQuestionIndex(firstUnanswered);
                        toast(`Resuming from question ${firstUnanswered + 1}`, { duration: 3000, icon: '▶️' });
                    }
                }

                if (data.is_disqualified) {
                    setIsDisqualified(true);
                    setShowDisqualificationModal(true);
                } else {
                    setIsUnlocked(true);
                    toast.success('Quiz unlocked and started successfully!');
                }
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

    // Submits actual question IDs matched to options
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

    // Feature 3 & 4: Fetch answer sheet after quiz completion
    const handleViewAnswerSheet = useCallback(async () => {
        if (!submissionResult?.id) return;
        setLoadingAnswerSheet(true);
        try {
            const res = await getAnswerSheet(submissionResult.id);
            if (res.data.success) {
                setAnswerSheet(res.data.data);
                setShowAnswerSheet(true);
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to load answer sheet');
        } finally {
            setLoadingAnswerSheet(false);
        }
    }, [submissionResult]);

    // Feature 4: Download question sheet as PDF (client-side)
    const handleDownloadQuestionSheet = useCallback(async () => {
        if (!quizId) return;
        setLoadingQuestionSheet(true);
        try {
            const res = await getQuestionSheet(quizId);
            if (res.data.success) {
                downloadQuestionSheetPDF(res.data.data);
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to download question sheet');
        } finally {
            setLoadingQuestionSheet(false);
        }
    }, [quizId]);

    const downloadQuestionSheetPDF = (data: any) => {
        const lines: string[] = [];
        lines.push(`QUESTION PAPER`);
        lines.push(`Quiz: ${data.quiz_title}`);
        lines.push(`Course: ${data.course_title}`);
        lines.push(`Duration: ${data.duration_minutes} minutes`);
        lines.push(`Total Questions: ${data.total_questions}`);
        lines.push(`Generated: ${new Date().toLocaleString()}`);
        lines.push('');
        lines.push('='.repeat(60));
        lines.push('');

        data.questions.forEach((q: any) => {
            lines.push(`Q${q.index}. ${q.question_text}`);
            lines.push(`   A. ${q.option_a}`);
            lines.push(`   B. ${q.option_b}`);
            lines.push(`   C. ${q.option_c}`);
            lines.push(`   D. ${q.option_d}`);
            if (q.correct_option) {
                lines.push(`   ✓ Correct: ${q.correct_option}`);
            }
            lines.push('');
        });

        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.quiz_title.replace(/\s+/g, '_')}_Questions.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Question sheet downloaded!');
    };

    const downloadAnswerSheetPDF = (data: any) => {
        const lines: string[] = [];
        lines.push(`ANSWER SHEET`);
        lines.push(`Quiz: ${data.quiz_title}`);
        lines.push(`Course: ${data.course_title}`);
        lines.push(`Student: ${data.student_name} (${data.student_email})`);
        lines.push(`Score: ${data.score} / ${data.total_questions}`);
        lines.push(`Warnings: ${data.warnings_count}`);
        lines.push(`Disqualified: ${data.is_disqualified ? 'Yes' : 'No'}`);
        lines.push(`Completed: ${data.completed_at ? new Date(data.completed_at).toLocaleString() : 'N/A'}`);
        lines.push('');
        lines.push('='.repeat(60));
        lines.push('');

        data.answer_sheet.forEach((q: any) => {
            const status = q.is_skipped ? '⏭ SKIPPED' : q.is_correct ? '✓ CORRECT' : '✗ WRONG';
            lines.push(`Q${q.index}. ${q.question_text}`);
            lines.push(`   A. ${q.option_a}`);
            lines.push(`   B. ${q.option_b}`);
            lines.push(`   C. ${q.option_c}`);
            lines.push(`   D. ${q.option_d}`);
            lines.push(`   Your Answer: ${q.selected_option ?? 'Not answered'}  |  Correct: ${q.correct_option}  |  ${status}`);
            lines.push('');
        });

        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.quiz_title.replace(/\s+/g, '_')}_AnswerSheet.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Answer sheet downloaded!');
    };

    if (loadingInfo) {
        return (
            <div className="flex items-center justify-center min-h-125">
                <LoadingSpinner />
            </div>
        );
    }

    // Feature 2: Quiz Expired Screen
    if (isQuizExpired) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <SEO title="Quiz Expired" description="This quiz link has expired" />
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 shadow-md">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-9 h-9" />
                    </div>
                    <h2 className="text-2xl font-bold text-amber-900 mb-3">Quiz Window Closed</h2>
                    <p className="text-sm text-amber-700 leading-relaxed mb-2">
                        The exam window for this quiz has ended. This link is no longer active.
                    </p>
                    {quizInfo?.expires_at && (
                        <p className="text-xs text-amber-500 mb-8">
                            Expired at: {new Date(quizInfo.expires_at).toLocaleString()}
                        </p>
                    )}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 text-white text-sm font-semibold rounded-xl hover:bg-amber-800 transition-all cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                </div>
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
        const isDisq = submissionResult.is_disqualified;
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center animate-in fade-in duration-200">
                <SEO title={`Quiz Result - ${quizInfo.title}`} description="Quiz attempt completed" />
                <div className="bg-white border border-gray-150 rounded-3xl p-8 shadow-md">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {isDisq ? (
                            <XCircle className="w-10 h-10 text-rose-500 animate-pulse" />
                        ) : (
                            <ShieldCheck className="w-10 h-10 text-emerald-600" />
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isDisq ? 'Exam Disqualified' : 'Quiz Completed!'}
                    </h2>
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

                    {isDisq ? (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-left mb-8 flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-rose-800">Disqualification Active</h4>
                                <p className="text-xs text-rose-700 mt-1">
                                    This exam attempt was auto-disqualified due to exceeding the limit of 3 tab/window proctoring warnings. Score has been set to 0. <strong>Instructor notified.</strong>
                                </p>
                            </div>
                        </div>
                    ) : submissionResult.warnings_count > 2 ? (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left mb-8 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-amber-800">Multiple Warnings Logged</h4>
                                <p className="text-xs text-amber-700 mt-1">
                                    You triggered several tab/window change warnings during this attempt. The instructor has been notified.
                                </p>
                            </div>
                        </div>
                    ) : null}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleViewAnswerSheet}
                            disabled={loadingAnswerSheet}
                            className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-2xl transition-all shadow-sm cursor-pointer disabled:opacity-60"
                        >
                            <BookOpen className="w-4 h-4" />
                            {loadingAnswerSheet ? 'Loading...' : 'View Answer Sheet'}
                        </button>
                        <button
                            onClick={handleDownloadQuestionSheet}
                            disabled={loadingQuestionSheet}
                            className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all cursor-pointer disabled:opacity-60"
                        >
                            <Download className="w-4 h-4" />
                            {loadingQuestionSheet ? 'Downloading...' : 'Download Question Sheet'}
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center justify-center gap-2 w-full px-5 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold rounded-2xl transition-all cursor-pointer"
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
                    <p className="text-xs text-gray-455 mb-6">Course Quiz Access Gate</p>

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
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 select-none animate-in fade-in duration-200">
            <SEO title={`Attempt Quiz - ${quizInfo.title}`} description="Quiz application in progress" />

            {/* Feature 1: Reload Warning Banner */}
            {showReloadWarning && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 shrink-0 animate-spin" />
                        <div>
                            <p className="text-sm font-bold">⚠ Page Reload Detected!</p>
                            <p className="text-xs text-rose-200">Reloading during an active quiz may result in loss of progress or disqualification. Please do NOT refresh this page.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowReloadWarning(false)}
                        className="ml-4 text-rose-200 hover:text-white text-xs font-semibold underline cursor-pointer shrink-0"
                    >
                        Dismiss
                    </button>
                </div>
            )}

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
                <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 shadow-sm mb-6 min-h-75 flex flex-col justify-between">
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

                    {/* Navigation Buttons — Forward Only (Feature 5: No Previous) */}
                    <div className="flex items-center justify-end gap-4 mt-12 pt-6 border-t border-gray-100">
                        {/* Progress indicator showing forward-only flow */}
                        <p className="text-[11px] text-gray-400 mr-auto">
                            <Lock className="w-3 h-3 inline mr-1 -mt-0.5" />
                            Forward only — cannot revisit previous questions
                        </p>

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
                            {warningLevel === 1
                                ? "Warning 1/3 - Please stay on quiz tab"
                                : "Warning 2/3 - Final warning!"}
                        </p>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-800 text-sm font-semibold mt-4">
                            Active Violations: {warningsCount}/3
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

            {/* Disqualification Modal */}
            {showDisqualificationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-6 h-6 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-bold text-rose-950">Exam Disqualified</h3>
                        <p className="text-xs text-rose-600 mt-2 leading-relaxed font-semibold">
                            You have been auto-disqualified due to excessive proctoring violations (3 strikes).
                        </p>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-800 text-sm font-semibold mt-4">
                            Instructor Notified
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4">
                            Redirecting to dashboard in {disqualificationCountdown} seconds...
                        </p>
                    </div>
                </div>
            )}
            {/* Feature 3: Answer Sheet Modal */}
            {showAnswerSheet && answerSheet && (
                <AnswerSheetModal
                    answerSheet={answerSheet}
                    onClose={() => setShowAnswerSheet(false)}
                    onDownload={() => downloadAnswerSheetPDF(answerSheet)}
                />
            )}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// Answer Sheet Modal Component
// ──────────────────────────────────────────────────────────────────────────────
interface AnswerSheetModalProps {
    answerSheet: any;
    onClose: () => void;
    onDownload: () => void;
}

const AnswerSheetModal: React.FC<AnswerSheetModalProps> = ({ answerSheet, onClose, onDownload }) => (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-gray-900/70 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-violet-600" />
                            Answer Sheet
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{answerSheet.quiz_title} — {answerSheet.course_title}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold cursor-pointer leading-none">×</button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="bg-violet-50 rounded-2xl p-3 text-center">
                        <p className="text-xs text-violet-500 font-semibold">Score</p>
                        <p className="text-xl font-bold text-violet-700">{answerSheet.score}/{answerSheet.total_questions}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-3 text-center">
                        <p className="text-xs text-emerald-500 font-semibold">Correct</p>
                        <p className="text-xl font-bold text-emerald-700">{answerSheet.score}</p>
                    </div>
                    <div className="bg-rose-50 rounded-2xl p-3 text-center">
                        <p className="text-xs text-rose-500 font-semibold">Wrong / Skipped</p>
                        <p className="text-xl font-bold text-rose-700">{answerSheet.total_questions - answerSheet.score}</p>
                    </div>
                </div>
                <button onClick={onDownload} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all cursor-pointer">
                    <Download className="w-4 h-4" />
                    Download Answer Sheet
                </button>
            </div>
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                {answerSheet.answer_sheet.map((q: any) => (
                    <AnswerSheetQuestion key={q.question_id} q={q} />
                ))}
            </div>
        </div>
    </div>
);

const AnswerSheetQuestion: React.FC<{ q: any }> = ({ q }) => (
    <div className={`rounded-2xl border p-4 ${q.is_skipped ? 'border-gray-200 bg-gray-50' : q.is_correct ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'}`}>
        <p className="text-sm font-semibold text-gray-800 mb-3">
            <span className="text-gray-400 mr-2">Q{q.index}.</span>
            {q.question_text}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
            {(['a', 'b', 'c', 'd'] as const).map((letter) => {
                const optLabel = letter.toUpperCase();
                const isCorrect = q.correct_option === optLabel;
                const isSelected = q.selected_option === optLabel;
                return (
                    <div key={letter} className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-medium ${isCorrect && isSelected ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                        : isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : isSelected ? 'bg-rose-100 border-rose-400 text-rose-800'
                                : 'bg-white border-gray-200 text-gray-600'
                        }`}>
                        <span className="font-bold w-4">{optLabel}.</span>
                        <span className="truncate">{q[`option_${letter}`]}</span>
                        {isCorrect && <CheckCircle className="w-3.5 h-3.5 ml-auto text-emerald-600 shrink-0" />}
                        {isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 ml-auto text-rose-600 shrink-0" />}
                    </div>
                );
            })}
        </div>
        <p className={`mt-2 text-[10px] font-bold ${q.is_skipped ? 'text-gray-400' : q.is_correct ? 'text-emerald-600' : 'text-rose-600'}`}>
            {q.is_skipped ? '⏭ Skipped' : q.is_correct ? '✓ Correct' : `✗ Wrong — Correct answer: ${q.correct_option}`}
        </p>
    </div>
);

export default TakeQuizPage;
