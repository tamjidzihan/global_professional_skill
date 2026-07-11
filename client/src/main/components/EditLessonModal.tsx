/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
    X, Video, FileText, HelpCircle, ClipboardList,
    FolderOpen, AlertCircle, Save, BookOpen, MonitorPlay,
} from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import { toast } from 'react-hot-toast';
import type { LessonType } from '../../types';
import { LoaderButton } from './ui/LoaderButton';

interface EditLessonModalProps {
    courseId: string;
    sectionId: string;
    lesson: {
        id: string; title: string; lesson_type: string;
        content?: string; video_url?: string; video_duration?: number;
        is_preview: boolean; order: number;
    };
    onClose: () => void;
}

const LESSON_TYPES: { value: LessonType; label: string; icon: React.ReactNode }[] = [
    { value: 'VIDEO', label: 'Video', icon: <Video className="w-3.5 h-3.5" /> },
    { value: 'LIVE', label: 'Live', icon: <MonitorPlay className="w-3.5 h-3.5" /> },
    { value: 'TEXT', label: 'Text', icon: <FileText className="w-3.5 h-3.5" /> },
    { value: 'QUIZ', label: 'Quiz', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { value: 'ASSIGNMENT', label: 'Assignment', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { value: 'RESOURCE', label: 'Resource', icon: <FolderOpen className="w-3.5 h-3.5" /> },
];

const EditLessonModal: React.FC<EditLessonModalProps> = ({ courseId, sectionId, lesson, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [lessonData, setLessonData] = useState({
        title: lesson.title,
        lesson_type: lesson.lesson_type as LessonType,
        content: lesson.content || '',
        video_url: lesson.video_url || '',
        video_duration: lesson.video_duration || 0,
        is_preview: lesson.is_preview,
        order: lesson.order,
    });

    const { editLesson } = useCourses();

    const inputCls = 'w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all';
    const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5';

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isSubmitting) onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose, isSubmitting]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setLessonData(p => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
        } else if (name === 'video_duration') {
            setLessonData(p => ({ ...p, [name]: parseInt(value) || 0 }));
        } else if (name === 'lesson_type') {
            setLessonData(p => ({ ...p, [name]: value as LessonType }));
        } else {
            setLessonData(p => ({ ...p, [name]: value }));
        }
    };

    const isValidVideoUrl = (url: string) =>
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/.test(url);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);
        if (!lessonData.title.trim()) { setValidationError('Please enter a lesson title'); return; }
        if (lessonData.lesson_type === 'VIDEO' && lessonData.video_url && !isValidVideoUrl(lessonData.video_url)) {
            setValidationError('Please enter a valid YouTube or Vimeo URL');
            return;
        }
        setIsSubmitting(true);
        try {
            await editLesson(courseId, sectionId, lesson.id, {
                section: sectionId,
                title: lessonData.title.trim(),
                lesson_type: lessonData.lesson_type,
                content: lessonData.content.trim() || undefined,
                video_url: lessonData.video_url || undefined,
                video_duration: lessonData.video_duration || undefined,
                is_preview: lessonData.is_preview,
                order: lessonData.order,
            });
            toast.success('Lesson updated!');
            onClose();
        } catch (error: any) {
            const data = error.response?.data;
            let msg = 'Failed to update lesson.';
            if (data?.error?.details?.non_field_errors?.[0]) {
                const nfe = data.error.details.non_field_errors[0];
                msg = nfe.includes('unique') ? 'A lesson with this order already exists.' : nfe;
            } else if (data?.error?.message) {
                msg = data.error.message;
            }
            setValidationError(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const showContent = lessonData.lesson_type === 'TEXT' || lessonData.lesson_type === 'QUIZ';

    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => !isSubmitting && onClose()} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-lg rounded-xl border border-gray-100 shadow-2xl flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Edit Lesson</p>
                                <p className="text-xs text-gray-400 mt-0.5">Update lesson details and content</p>
                            </div>
                        </div>
                        <button onClick={() => !isSubmitting && onClose()} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">

                            {validationError && (
                                <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {validationError}
                                </div>
                            )}

                            {/* Basic info */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Basic Information</p>

                                <div>
                                    <label className={labelCls}>Lesson Title <span className="text-rose-400 normal-case">*</span></label>
                                    <input
                                        type="text" name="title" value={lessonData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Introduction to React Hooks"
                                        className={inputCls} disabled={isSubmitting} required autoFocus
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Display Order</label>
                                    <input
                                        type="number" name="order" value={lessonData.order}
                                        onChange={handleInputChange} min="0"
                                        className={inputCls} disabled={isSubmitting}
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">Position in the section (0 = first)</p>
                                </div>
                            </div>

                            {/* Lesson type */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Lesson Type</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {LESSON_TYPES.map(type => (
                                        <button
                                            key={type.value} type="button"
                                            onClick={() => setLessonData(p => ({ ...p, lesson_type: type.value }))}
                                            disabled={isSubmitting}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 cursor-pointer ${lessonData.lesson_type === type.value
                                                    ? 'bg-violet-600 text-white'
                                                    : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-violet-200 hover:text-violet-600'
                                                } disabled:opacity-50`}
                                        >
                                            {type.icon}{type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Content</p>

                                {lessonData.lesson_type === 'VIDEO' && (
                                    <>
                                        <div>
                                            <label className={labelCls}>Video URL</label>
                                            <input type="url" name="video_url" value={lessonData.video_url}
                                                onChange={handleInputChange}
                                                placeholder="https://youtube.com/watch?v=..."
                                                className={inputCls} disabled={isSubmitting}
                                            />
                                            <p className="text-[11px] text-gray-400 mt-1">Supports YouTube and Vimeo</p>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Duration (seconds)</label>
                                            <input type="number" name="video_duration" value={lessonData.video_duration}
                                                onChange={handleInputChange} min="0"
                                                placeholder="e.g., 300 for 5 minutes"
                                                className={inputCls} disabled={isSubmitting}
                                            />
                                        </div>
                                    </>
                                )}

                                {showContent && (
                                    <div>
                                        <label className={labelCls}>{lessonData.lesson_type === 'TEXT' ? 'Lesson Content' : 'Quiz Instructions'}</label>
                                        <textarea name="content" value={lessonData.content}
                                            onChange={handleInputChange} rows={6}
                                            placeholder={lessonData.lesson_type === 'TEXT' ? 'Enter lesson content...' : 'Describe the quiz...'}
                                            className={`${inputCls} resize-none`} disabled={isSubmitting}
                                        />
                                    </div>
                                )}

                                {!showContent && lessonData.lesson_type !== 'VIDEO' && (
                                    <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
                                        <p className="text-xs text-blue-700">
                                            {lessonData.lesson_type === 'ASSIGNMENT' && 'Assignment details can be configured after saving.'}
                                            {lessonData.lesson_type === 'RESOURCE' && 'Resources can be uploaded after saving.'}
                                            {lessonData.lesson_type === 'LIVE' && 'Live session settings can be configured after saving.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Settings */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Settings</p>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <input id="is-preview" type="checkbox" name="is_preview"
                                        checked={lessonData.is_preview} onChange={handleInputChange}
                                        className="w-4 h-4 mt-0.5 text-violet-600 border-gray-300 rounded cursor-pointer" disabled={isSubmitting}
                                    />
                                    <div>
                                        <label htmlFor="is-preview" className="text-sm font-medium text-gray-800 cursor-pointer">Free Preview</label>
                                        <p className="text-xs text-gray-400 mt-0.5">Make available to non-enrolled students</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2.5">
                            <LoaderButton type="button" variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </LoaderButton>
                            <LoaderButton
                                type="submit" variant="primary" size="md"
                                icon={<Save className="w-3.5 h-3.5" />}
                                loading={isSubmitting} loadingText="Saving..."
                                disabled={!lessonData.title.trim()}
                            >
                                Save Changes
                            </LoaderButton>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditLessonModal;