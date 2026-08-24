/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../../../../hooks/useCourses';
import { getQuizDetail, getQuizSubmissionsForInstructor } from '../../../../lib/api';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { extractErrorMessage } from '../../../../lib/errorUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const QuizSubmissionsListPage: React.FC = () => {
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
    const navigate = useNavigate();
    const { course, fetchCourseDetail, loading: courseLoading } = useCourses();

    const [quiz, setQuiz] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId) {
            fetchCourseDetail(courseId).catch((err) => console.log('Course load err', err));
        }
        if (courseId && quizId) {
            loadData();
        }
    }, [courseId, quizId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const quizRes = await getQuizDetail(courseId!, quizId!);
            if (quizRes.data.success) {
                setQuiz(quizRes.data.data);
            }
            const subRes = await getQuizSubmissionsForInstructor(courseId!, quizId!);
            if (subRes.data.success) {
                setSubmissions(subRes.data.data || []);
            }
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };


    const downloadListPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Quiz Submissions: ${quiz?.title || 'Unknown Quiz'}`, 14, 20);
        doc.setFontSize(12);
        doc.text(`Course: ${course?.title || ''}`, 14, 28);

        const tableColumn = ["Student", "Email", "Score", "Started At", "Completed At", "Status"];
        const tableRows: any[] = [];

        submissions.forEach(sub => {
            const studentData = sub.student || {};
            const stName = studentData.first_name ? `${studentData.first_name} ${studentData.last_name}` : studentData.username;
            const completed = sub.completed_at ? new Date(sub.completed_at).toLocaleString() : 'In Progress';
            let status = 'Completed';
            if (sub.is_disqualified) status = 'Disqualified';
            else if (!sub.completed_at) status = 'Ongoing';

            tableRows.push([
                stName,
                studentData.email || '',
                sub.score !== null ? `${sub.score}/${sub.total_questions || '?'}` : '-',
                sub.started_at ? new Date(sub.started_at).toLocaleString() : '',
                completed,
                status
            ]);
        });

        // Use autoTable as a function call
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid'
        });

        doc.save(`quiz_submissions_${quiz?.title?.replace(/[^a-z0-9]/gi, '_') || 'quiz'}.pdf`);
    };

    if (courseLoading || loading) return <LoadingSpinner />;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/dashboard/instructor/my-courses/${course?.id}/quizzes`)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quiz Submissions</h1>
                        <p className="text-sm text-gray-500 mt-1">Quiz: <span className="font-medium text-gray-700">{quiz?.title}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={downloadListPDF}
                        disabled={submissions.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold rounded-xl text-sm transition-colors border border-rose-100 cursor-pointer disabled:opacity-50"
                    >
                        <FileText className="w-4 h-4" />
                        Download List (PDF)
                    </button>
                </div>
            </div>


            <div className="bg-white border flex flex-col border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-100">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Started</th>
                                <th className="px-6 py-4">Completed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No submissions found for this quiz.
                                    </td>
                                </tr>
                            ) : (
                                submissions.map((sub) => {
                                    const studentName = sub.student?.first_name ? `${sub.student.first_name} ${sub.student.last_name}` : sub.student?.username || 'Unknown';
                                    return (
                                        <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{studentName}</div>
                                                <div className="text-xs text-gray-500">{sub.student?.email}</div>
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
                                                {new Date(sub.started_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {sub.completed_at ? new Date(sub.completed_at).toLocaleString() : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QuizSubmissionsListPage;
