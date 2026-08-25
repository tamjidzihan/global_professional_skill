/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, AlertTriangle, Clock, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { extractErrorMessage } from '../../../../lib/errorUtils';
import { api } from '../../../../lib/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { CourseDetail, QuizSubmission } from '../../../../types';

const QuizResultDetailPage: React.FC = () => {
    const { courseId, submissionId } = useParams<{ courseId: string; submissionId: string }>();
    const navigate = useNavigate();

    const [course, setCourse] = useState<CourseDetail>();
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (submissionId) {
            loadSubmissionDetail();
        }
    }, [submissionId]);


    useEffect(() => {
        if (courseId) { loadData(); }
    }, [courseId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const courseRes = await api.get(`/courses/courses/${courseId}/`);
            if (courseRes.data.success) { setCourse(courseRes.data.data); }

        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to load quiz results');
        } finally { setLoading(false); }
    };

    const loadSubmissionDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/courses/my-quiz-submissions/${submissionId}/`);
            if (res.data.success) {
                setSubmission(res.data.data);
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to load quiz result');
        } finally {
            setLoading(false);
        }
    };



    const downloadResultPDF = async (submission: QuizSubmission) => {
        try {
            toast.loading('Generating PDF...');
            // Fetch submission details with questions included
            const submissionRes = await api.get(`/courses/my-quiz-submissions/${submission.id}/`);
            if (!submissionRes.data.success) {
                toast.dismiss();
                toast.error('Failed to load submission details');
                return;
            }
            const submissionDetail = submissionRes.data.data;
            const questions = submissionDetail.questions || [];
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 14;
            const contentWidth = pageWidth - (margin * 2);
            let yPos = 20;

            doc.setFillColor(139, 92, 246);
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'normal');
            doc.text('QUIZ RESULT REPORT', pageWidth / 2, 13, { align: 'center' });
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Global Professional Institute', pageWidth / 2, 25, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, 34, { align: 'center' });
            yPos = 55;

            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F');
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Course:', margin + 5, yPos + 10);
            doc.setFont('helvetica', 'normal');
            const courseText = doc.splitTextToSize(submission.course_title || 'N/A', contentWidth - 30);
            doc.text(courseText[0], margin + 25, yPos + 10);
            doc.setFont('helvetica', 'bold');
            doc.text('Quiz:', margin + 5, yPos + 20);
            doc.setFont('helvetica', 'normal');
            doc.text(submission.quiz_title || 'N/A', margin + 25, yPos + 20);
            doc.setFont('helvetica', 'bold');
            doc.text('Instructor:', margin + 5, yPos + 30);
            doc.setFont('helvetica', 'normal');
            doc.text(course?.instructor.full_name || 'N/A', margin + 25, yPos + 30);
            doc.setFont('helvetica', 'bold');
            doc.text('Student:', margin + 5, yPos + 40);
            doc.setFont('helvetica', 'normal');
            doc.text(submission.student_name || 'N/A', margin + 25, yPos + 40);
            yPos += 60;

            const percentage = submission.total_questions > 0 ? Math.round((submission.score / submission.total_questions) * 100) : 0;
            doc.setFillColor(220, 252, 231);
            doc.roundedRect(margin, yPos, contentWidth / 2 - 5, 35, 3, 3, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(21, 128, 61);
            doc.text('SCORE', margin + 5, yPos + 10);
            doc.setFontSize(20);
            doc.text(`${submission.score}/${submission.total_questions}`, margin + 5, yPos + 20);
            doc.setFontSize(10);
            doc.text(`(${percentage}%)`, margin + 5, yPos + 29);

            doc.setFillColor(254, 243, 199);
            doc.roundedRect(pageWidth / 2 + 5, yPos, contentWidth / 2 - 5, 35, 3, 3, 'F');
            doc.setTextColor(146, 64, 14);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('STATUS', pageWidth / 2 + 10, yPos + 10);
            let statusText = 'Completed';
            if (submission.is_disqualified) statusText = 'DISQUALIFIED';
            else if (!submission.completed_at) statusText = 'In Progress';
            doc.setFontSize(11);
            doc.text(statusText, pageWidth / 2 + 10, yPos + 18);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(`Started: ${new Date(submission.started_at).toLocaleString()}`, pageWidth / 2 + 10, yPos + 26);
            if (submission.completed_at) {
                doc.text(`Completed: ${new Date(submission.completed_at).toLocaleString()}`, pageWidth / 2 + 10, yPos + 31);
            }
            yPos += 45;

            if (submission.warnings_count > 0 || submission.is_disqualified) {
                doc.setFillColor(254, 226, 226);
                doc.roundedRect(margin, yPos, contentWidth, 15, 3, 3, 'F');
                doc.setTextColor(185, 28, 28);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text(`⚠ Warnings: ${submission.warnings_count}`, margin + 5, yPos + 10);
                if (submission.is_disqualified) {
                    doc.text(`| Reason: ${submission.disqualification_reason || 'N/A'}`, margin + 50, yPos + 10);
                }
                yPos += 20;
            }

            doc.setTextColor(30, 41, 59);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('DETAILED ANSWERS', margin, yPos);
            yPos += 10;

            const orderedQuestions = submissionDetail.shuffled_question_ids.map((qId: string) => questions.find((q: any) => q.id === qId)).filter((q: any) => q);


            orderedQuestions.forEach((question: any, index: number) => {
                if (yPos > pageHeight - 60) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.setFillColor(249, 250, 251);
                const questionHeight = 15 + (Math.ceil(doc.getTextWidth(question.question_text) / (contentWidth - 10)) * 5);
                doc.roundedRect(margin, yPos, contentWidth, questionHeight, 2, 2, 'F');
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(30, 41, 59);
                doc.text(`Q${index + 1}.`, margin + 5, yPos + 8);
                doc.setFont('helvetica', 'normal');
                const splitQuestion = doc.splitTextToSize(question.question_text, contentWidth - 20);
                doc.text(splitQuestion, margin + 15, yPos + 8);
                yPos += questionHeight + 3;

                const studentAnswer = submissionDetail.student_answers.find((ans: any) => ans.question_id === question.id);
                const selectedOption = studentAnswer?.selected_option || null;
                const correctOption = question.correct_option;
                const options = [
                    { label: 'A', text: question.option_a },
                    { label: 'B', text: question.option_b },
                    { label: 'C', text: question.option_c },
                    { label: 'D', text: question.option_d },
                ];

                options.forEach((opt) => {
                    if (yPos > pageHeight - 20) {
                        doc.addPage();
                        yPos = 20;
                    }
                    const isCorrect = opt.label === correctOption;
                    const isSelected = opt.label === selectedOption;
                    if (isCorrect) {
                        doc.setFillColor(220, 252, 231);
                        doc.setTextColor(21, 128, 61);
                    } else if (isSelected && !isCorrect) {
                        doc.setFillColor(254, 226, 226);
                        doc.setTextColor(185, 28, 28);
                    } else {
                        doc.setFillColor(255, 255, 255);
                        doc.setTextColor(100, 116, 139);
                    }
                    doc.roundedRect(margin + 5, yPos, contentWidth - 10, 10, 2, 2, 'FD');
                    doc.setFontSize(9);
                    doc.setFont('helvetica', isCorrect || isSelected ? 'bold' : 'normal');
                    let prefix = `${opt.label}. `;
                    if (isCorrect) prefix += '(correct) ';
                    if (isSelected && !isCorrect) prefix += '(your answer) ';
                    const optionText = doc.splitTextToSize(opt.text, contentWidth - 30);
                    doc.text(prefix + optionText[0], margin + 8, yPos + 7);
                    yPos += 12;
                });
                yPos += 5;
            });

            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            doc.setFont('helvetica', 'italic');
            const footerY = pageHeight - 10;
            doc.text('Generated by Global Professional Skills Platform', pageWidth / 2, footerY, { align: 'center' });
            doc.text(`Document ID: ${submission.id}`, pageWidth / 2, footerY + 4, { align: 'center' });
            const filename = `${submission.quiz_title?.replace(/[^a-z0-9]/gi, '_') || 'quiz'}_result_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            toast.dismiss();
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.dismiss();
            toast.error('Failed to generate PDF');
        }
    };


    if (loading) return <LoadingSpinner />;

    if (!submission) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
                    <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Result Not Found</h3>
                    <button
                        onClick={() => navigate(`/dashboard/student/my-courses/${courseId}/quizzes`)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Quiz Results
                    </button>
                </div>
            </div>
        );
    }

    const percentage = submission.total_questions > 0
        ? ((submission.score / submission.total_questions) * 100).toFixed(1)
        : 0;


    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/dashboard/student/my-courses/${courseId}/quizzes`)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quiz Result</h1>
                        <p className="text-sm text-gray-500 mt-1">{submission.quiz?.title || submission.quiz_title}</p>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        downloadResultPDF(submission);
                    }}
                    disabled={!submission.completed_at}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <Download className="w-4 h-4" /> Download PDF
                </button>
            </div>

            {submission.is_disqualified && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-rose-900 text-sm mb-1">Disqualified</h3>
                        <p className="text-xs text-rose-700">
                            {submission.disqualification_reason || 'You have been disqualified from this quiz.'}
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Score Summary</h2>
                    {submission.completed_at ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-4 h-4" /> Completed
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                            <Clock className="w-4 h-4" /> In Progress
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-violet-50 rounded-xl border border-violet-100">
                        <div className="text-3xl font-bold text-violet-600 mb-1">{submission.score || 0}</div>
                        <div className="text-xs text-violet-700 font-medium">Correct Answers</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{submission.total_questions || 0}</div>
                        <div className="text-xs text-blue-700 font-medium">Total Questions</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="text-3xl font-bold text-emerald-600 mb-1">{percentage}%</div>
                        <div className="text-xs text-emerald-700 font-medium">Percentage</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-violet-600" /> Time Information
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-xs text-gray-500 font-medium mb-1">Started At</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {submission.started_at ? new Date(submission.started_at).toLocaleString() : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-medium mb-1">Completed At</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {submission.completed_at ? new Date(submission.completed_at).toLocaleString() : 'Not completed yet'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-violet-600" /> Additional Details
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-xs text-gray-500 font-medium mb-1">Warnings</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {submission.warnings_count || 0} warning(s)
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-medium mb-1">Status</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {submission.is_disqualified ? 'Disqualified' : submission.completed_at ? 'Completed' : 'In Progress'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAILED ANSWERS SECTION - ADD THIS */}
            {submission.questions && submission.questions.length > 0 && (
                <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-violet-600" />
                        Detailed Answers
                    </h2>

                    <div className="space-y-6">
                        {(submission.shuffled_question_ids || submission.questions.map((q: any) => q.id)).map((questionId: string, index: number) => {
                            const question = submission.questions.find((q: any) => q.id === questionId);
                            if (!question) return null;

                            const studentAnswer = submission.student_answers?.find(
                                (ans: any) => ans.question_id === question.id
                            );
                            const selectedOption = studentAnswer?.selected_option || null;
                            const correctOption = question.correct_option;
                            const isCorrect = selectedOption === correctOption;

                            const options = [
                                { label: 'A', text: question.option_a },
                                { label: 'B', text: question.option_b },
                                { label: 'C', text: question.option_c },
                                { label: 'D', text: question.option_d },
                            ];

                            return (
                                <div
                                    key={question.id}
                                    className="border border-gray-200 rounded-xl p-4 hover:border-violet-200 transition-colors"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold shrink-0">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm font-medium text-gray-900">
                                            {question.question_text}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5 ml-9">
                                        {options.map((opt) => {
                                            const isSelected = opt.label === selectedOption;
                                            const isCorrectOption = opt.label === correctOption;

                                            let bgColor = 'bg-gray-50';
                                            let borderColor = 'border-gray-200';
                                            let textColor = 'text-gray-700';
                                            let icon = null;

                                            if (isCorrectOption) {
                                                bgColor = 'bg-emerald-50';
                                                borderColor = 'border-emerald-300';
                                                textColor = 'text-emerald-700';
                                                icon = <CheckCircle className="w-4 h-4 text-emerald-600" />;
                                            } else if (isSelected && !isCorrectOption) {
                                                bgColor = 'bg-rose-50';
                                                borderColor = 'border-rose-300';
                                                textColor = 'text-rose-700';
                                                icon = <AlertTriangle className="w-4 h-4 text-rose-600" />;
                                            }

                                            return (
                                                <div
                                                    key={opt.label}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColor} ${borderColor}`}
                                                >
                                                    <span className={`text-xs font-bold ${textColor}`}>
                                                        {opt.label}.
                                                    </span>
                                                    <span className={`text-sm ${textColor}`}>
                                                        {opt.text}
                                                    </span>
                                                    {icon && (
                                                        <span className="ml-auto">{icon}</span>
                                                    )}
                                                    {isSelected && (
                                                        <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded bg-white/60">
                                                            Your Answer
                                                        </span>
                                                    )}
                                                    {isCorrectOption && isSelected && (
                                                        <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                                                            ✓ Correct
                                                        </span>
                                                    )}
                                                    {isCorrectOption && !isSelected && (
                                                        <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                                                            Correct Answer
                                                        </span>
                                                    )}
                                                    {isSelected && !isCorrectOption && (
                                                        <span className="ml-auto text-xs font-medium text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                                                            ✗ Incorrect
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {selectedOption && (
                                        <div className="mt-2 ml-9">
                                            {isCorrect ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Correct Answer
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    Incorrect Answer
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizResultDetailPage;
