/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { extractErrorMessage } from '../../../../lib/errorUtils';
import { api } from '../../../../lib/api';
import type { QuizSubmission } from '../../../../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StudentQuizResultsPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<any>(null);
    const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId) { loadData(); }
    }, [courseId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const courseRes = await api.get(`/courses/courses/${courseId}/`);
            if (courseRes.data.success) { setCourse(courseRes.data.data); }
            const submissionsRes = await api.get('/courses/my-quiz-submissions/');
            if (submissionsRes.data.success) {
                const courseSubmissions = (submissionsRes.data.data || []).filter(
                    (sub: QuizSubmission) => sub.course === courseId
                );
                setSubmissions(courseSubmissions);
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to load quiz results');
        } finally { setLoading(false); }
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
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('QUIZ RESULT REPORT', pageWidth / 2, 20, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, 30, { align: 'center' });
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
            doc.text(course?.instructor_name || 'N/A', margin + 25, yPos + 30);
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
            doc.text(`${submission.score}/${submission.total_questions}`, margin + 5, yPos + 25);
            doc.setFontSize(10);
            doc.text(`(${percentage}%)`, margin + 5, yPos + 32);

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
            doc.text(statusText, pageWidth / 2 + 10, yPos + 20);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(`Started: ${new Date(submission.started_at).toLocaleString()}`, pageWidth / 2 + 10, yPos + 28);
            if (submission.completed_at) {
                doc.text(`Completed: ${new Date(submission.completed_at).toLocaleString()}`, pageWidth / 2 + 10, yPos + 33);
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
                    if (isCorrect) prefix += '✓ ';
                    if (isSelected && !isCorrect) prefix += '✗ ';
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


    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/dashboard/student/my-courses/${courseId}`)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Quiz Results</h1>
                        <p className="text-sm text-gray-500 mt-1">Course: <span className="font-medium text-gray-700">{course?.title}</span></p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {submissions.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Quiz Results</h3>
                        <p className="text-gray-500 text-sm">You haven't taken any quizzes for this course yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Quiz</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Submitted</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">

                                {submissions.map((sub) => (
                                    <tr 
                                        key={sub.id} 
                                        onClick={() => navigate(`/dashboard/student/my-courses/${courseId}/quizzes/${sub.id}`)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{sub.quiz_title || 'Unknown Quiz'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.is_disqualified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                                                    <AlertTriangle className="w-3 h-3" /> Disqualified
                                                </span>
                                            ) : sub.completed_at ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                    <CheckCircle className="w-3 h-3" /> Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    In Progress
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.score !== null ? (
                                                <div className="font-bold text-gray-900">{sub.score} / {sub.total_questions || '?'}</div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {sub.completed_at ? new Date(sub.completed_at).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadResultPDF(sub);
                                                }}
                                                disabled={!sub.completed_at}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Download className="w-3.5 h-3.5" /> PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentQuizResultsPage;

