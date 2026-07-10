import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import type { QuizQuestionData } from '../../types';

interface QuizLessonViewerProps {
    courseId: string;
    sectionId: string;
    lesson: {
        id: string;
        title: string;
        lesson_type: string;
        content?: string;
        quiz_questions?: QuizQuestionData[];
    };
}

export default function QuizLessonViewer({ courseId, sectionId, lesson }: QuizLessonViewerProps) {
    const { submitQuiz } = useCourses();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number; total_questions: number } | null>(null);

    const questions = useMemo(() => lesson.quiz_questions || [], [lesson.quiz_questions]);

    const selectOption = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = Object.entries(answers).map(([question_id, option_id]) => ({ question_id, option_id }));
            const response = await submitQuiz(courseId, sectionId, lesson.id, payload);
            setResult({ score: response?.data?.score || 0, total_questions: response?.data?.total_questions || questions.length });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 space-y-4">
            <div>
                <p className="text-sm font-semibold text-gray-900">{lesson.title}</p>
                {lesson.content ? <p className="text-sm text-gray-600 mt-1">{lesson.content}</p> : null}
            </div>

            {questions.length === 0 ? (
                <p className="text-sm text-gray-500">No questions have been added yet.</p>
            ) : (
                <div className="space-y-3">
                    {questions.map((question, index) => (
                        <div key={question.id || index} className="rounded-lg border border-white bg-white p-3">
                            <p className="text-sm font-semibold text-gray-800">{index + 1}. {question.prompt}</p>
                            <div className="mt-2 space-y-2">
                                {question.options.map((option, optionIndex) => {
                                    const optionId = option.id || `${question.id || index}-${optionIndex}`;
                                    const selected = answers[question.id || `${index}`] === optionId;
                                    return (
                                        <button
                                            key={optionId}
                                            type="button"
                                            onClick={() => selectOption(question.id || `${index}`, optionId)}
                                            className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${selected ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 bg-gray-50 text-gray-700'}`}
                                        >
                                            {selected ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                            <span>{option.text}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Choose one answer for each question.</p>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || questions.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Submit Quiz
                </button>
            </div>

            {result ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    You scored {result.score} out of {result.total_questions}.
                </div>
            ) : null}
        </div>
    );
}
