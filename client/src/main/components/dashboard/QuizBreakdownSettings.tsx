import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getQuizzes, updateQuiz } from '../../../lib/api'
import { extractErrorMessage } from '../../../lib/errorUtils'
import type { Quiz } from '../../../types'

interface QuizBreakdownSettingsProps {
    courseId: string
}

export default function QuizBreakdownSettings({ courseId }: QuizBreakdownSettingsProps) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)

    const loadQuizzes = useCallback(async () => {
        setLoading(true)
        setLoadError(null)
        try {
            const response = await getQuizzes(courseId)
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to load quiz breakdown settings')
            }
            setQuizzes(response.data.data)
        } catch (error) {
            const message = extractErrorMessage(error) || 'Failed to load quiz breakdown settings'
            setLoadError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }, [courseId])

    useEffect(() => {
        void loadQuizzes()
    }, [loadQuizzes])

    const toggleVisibility = async (quiz: Quiz) => {
        setSavingId(quiz.id)
        try {
            const response = await updateQuiz(courseId, quiz.id, {
                show_question_breakdown: !quiz.show_question_breakdown,
            })
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update question breakdown setting')
            }
            const updatedQuiz = response.data.data
            setQuizzes(current => current.map(item => (
                item.id === quiz.id ? { ...item, show_question_breakdown: updatedQuiz.show_question_breakdown } : item
            )))
            toast.success(updatedQuiz.show_question_breakdown
                ? 'Question breakdown is now visible to students'
                : 'Question breakdown is now hidden from students')
        } catch (error) {
            toast.error(extractErrorMessage(error) || 'Failed to update question breakdown setting')
        } finally {
            setSavingId(null)
        }
    }

    return (
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-gray-900">Student Question Breakdown</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Control whether students can review their answers and correct answers after each quiz.
                    </p>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {loading ? (
                    <div className="px-5 py-4 flex items-center gap-2 text-xs text-gray-400">
                        <LoaderCircle className="w-4 h-4 animate-spin" /> Loading quizzes...
                    </div>
                ) : loadError ? (
                    <div className="px-5 py-4 flex items-center justify-between gap-3">
                        <p role="alert" className="text-xs text-rose-600">{loadError}</p>
                        <button
                            type="button"
                            onClick={() => void loadQuizzes()}
                            className="text-xs font-semibold text-violet-600 hover:text-violet-700 cursor-pointer shrink-0"
                        >
                            Retry
                        </button>
                    </div>
                ) : quizzes.length === 0 ? (
                    <p className="px-5 py-4 text-xs text-gray-400">No quizzes have been created for this course yet.</p>
                ) : quizzes.map(quiz => (
                    <div key={quiz.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{quiz.title}</p>
                            <p className={`text-xs mt-0.5 ${quiz.show_question_breakdown ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {quiz.show_question_breakdown ? 'Visible to students' : 'Hidden from students'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => void toggleVisibility(quiz)}
                            disabled={savingId === quiz.id}
                            aria-pressed={quiz.show_question_breakdown}
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-wait ${
                                quiz.show_question_breakdown
                                    ? 'text-rose-700 bg-rose-50 border-rose-100 hover:bg-rose-100'
                                    : 'text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                            }`}
                        >
                            {savingId === quiz.id ? (
                                <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                            ) : quiz.show_question_breakdown ? (
                                <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                                <Eye className="w-3.5 h-3.5" />
                            )}
                            {quiz.show_question_breakdown ? 'Hide from students' : 'Show to students'}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    )
}
