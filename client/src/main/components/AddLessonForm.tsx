/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { PlusCircle, Video, FileText, HelpCircle, ClipboardList, FolderOpen, MonitorPlay } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import { toast } from 'react-hot-toast';
import type { LessonType } from '../../types';
import { LoaderButton } from './ui/LoaderButton';
import { formatFieldErrors, parseError } from '../../lib/errorUtils';

interface AddLessonFormProps {
    courseId: string;
    sectionId: string;
    onSuccess?: () => void;
}

const LESSON_TYPES: { value: LessonType; label: string; icon: React.ReactNode }[] = [
    { value: 'VIDEO', label: 'Video', icon: <Video className="w-3.5 h-3.5" /> },
    { value: 'LIVE', label: 'Live', icon: <MonitorPlay className="w-3.5 h-3.5" /> },
    { value: 'TEXT', label: 'Text', icon: <FileText className="w-3.5 h-3.5" /> },
    { value: 'QUIZ', label: 'Quiz', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { value: 'ASSIGNMENT', label: 'Assignment', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { value: 'RESOURCE', label: 'Resource', icon: <FolderOpen className="w-3.5 h-3.5" /> },
];

const AddLessonForm: React.FC<AddLessonFormProps> = ({ courseId, sectionId, onSuccess }) => {
    const [showForm, setShowForm] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [lessonData, setLessonData] = useState({
        title: '', lesson_type: 'VIDEO' as LessonType,
        content: '', video_url: '', video_duration: 0,
        is_preview: false, order: 0,
    });

    const { addLesson } = useCourses();

    const inputCls = 'w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all';
    const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setLessonData(p => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
        } else if (name === 'video_duration') {
            setLessonData(p => ({ ...p, [name]: parseInt(value) || 0 }));
        } else {
            setLessonData(p => ({ ...p, [name]: value }));
        }
    };

    const isValidVideoUrl = (url: string) => {
        return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/.test(url) || url === '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lessonData.title.trim()) { toast.error('Please enter a lesson title'); return; }
        if (lessonData.lesson_type === 'VIDEO' && lessonData.video_url && !isValidVideoUrl(lessonData.video_url)) {
            toast.error('Please enter a valid YouTube or Vimeo URL');
            return;
        }
        setIsAdding(true);
        try {
            await addLesson(courseId, sectionId, {
                section: sectionId,
                title: lessonData.title.trim(),
                lesson_type: lessonData.lesson_type,
                content: lessonData.content.trim() || undefined,
                video_url: lessonData.video_url || undefined,
                video_duration: lessonData.video_duration || undefined,
                is_preview: lessonData.is_preview,
                order: lessonData.order,
            });
            setLessonData({ title: '', lesson_type: 'VIDEO', content: '', video_url: '', video_duration: 0, is_preview: false, order: 0 });
            setShowForm(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            const parsed = parseError(error);
            if (parsed.validationErrors) {
                const fe = formatFieldErrors(parsed.validationErrors);
                if (fe.non_field_errors?.includes('unique set') || fe.non_field_errors?.includes('already exists')) {
                    toast.error('A lesson with this order already exists.');
                } else if (fe.order) {
                    toast.error(`Order: ${fe.order}`);
                }
            } else {
                toast.error(parsed.message || 'Failed to add lesson.');
            }
        } finally {
            setIsAdding(false);
        }
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 border border-dashed border-gray-200 text-gray-500 hover:border-violet-300 hover:bg-violet-50/30 hover:text-violet-600 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer"
            >
                <PlusCircle className="w-3.5 h-3.5" /> Add New Lesson
            </button>
        );
    }

    return (
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-700 mb-3">New Lesson</p>
            <form onSubmit={handleSubmit} className="space-y-3">

                {/* Title */}
                <div>
                    <label className={labelCls}>Lesson Title <span className="text-rose-400 normal-case">*</span></label>
                    <input
                        type="text" name="title" value={lessonData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Introduction to React"
                        className={inputCls} disabled={isAdding} required autoFocus
                    />
                </div>

                {/* Type selector */}
                <div>
                    <label className={labelCls}>Lesson Type</label>
                    <div className="flex flex-wrap gap-1.5">
                        {LESSON_TYPES.map(t => (
                            <button
                                key={t.value} type="button"
                                onClick={() => setLessonData(p => ({ ...p, lesson_type: t.value }))}
                                disabled={isAdding}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 cursor-pointer ${lessonData.lesson_type === t.value
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-200 hover:text-violet-600'
                                    }`}
                            >
                                {t.icon}{t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Order */}
                <div>
                    <label className={labelCls}>Order</label>
                    <input type="number" name="order" value={lessonData.order} onChange={handleInputChange}
                        min="0" className={inputCls} disabled={isAdding} />
                </div>

                {/* Video fields */}
                {lessonData.lesson_type === 'VIDEO' && (
                    <>
                        <div>
                            <label className={labelCls}>Video URL</label>
                            <input type="url" name="video_url" value={lessonData.video_url} onChange={handleInputChange}
                                placeholder="https://youtube.com/watch?v=..." className={inputCls} disabled={isAdding} />
                            <p className="text-[11px] text-gray-400 mt-1">Supports YouTube and Vimeo</p>
                        </div>
                        <div>
                            <label className={labelCls}>Duration (seconds)</label>
                            <input type="number" name="video_duration" value={lessonData.video_duration}
                                onChange={handleInputChange} min="0" className={inputCls} disabled={isAdding} />
                        </div>
                    </>
                )}

                {/* Content */}
                {(lessonData.lesson_type === 'TEXT' || lessonData.lesson_type === 'QUIZ') && (
                    <div>
                        <label className={labelCls}>{lessonData.lesson_type === 'TEXT' ? 'Content' : 'Quiz Description'}</label>
                        <textarea name="content" value={lessonData.content} onChange={handleInputChange}
                            rows={3} placeholder={lessonData.lesson_type === 'TEXT' ? 'Lesson content...' : 'Describe the quiz...'}
                            className={`${inputCls} resize-none`} disabled={isAdding} />
                    </div>
                )}

                {/* Preview toggle */}
                <div className="flex items-center gap-2.5 p-3 bg-white rounded-lg border border-gray-100">
                    <input id={`preview-${sectionId}`} type="checkbox" name="is_preview"
                        checked={lessonData.is_preview} onChange={handleInputChange}
                        className="w-4 h-4 text-violet-600 border-gray-300 rounded cursor-pointer" disabled={isAdding}
                    />
                    <label htmlFor={`preview-${sectionId}`} className="text-xs font-medium text-gray-700 cursor-pointer">
                        Free preview lesson
                    </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                    <LoaderButton type="button" variant="secondary" size="sm"
                        onClick={() => { setShowForm(false); setLessonData({ title: '', lesson_type: 'VIDEO', content: '', video_url: '', video_duration: 0, is_preview: false, order: 0 }); }}
                        disabled={isAdding}
                    >Cancel</LoaderButton>
                    <LoaderButton type="submit" variant="primary" size="sm"
                        icon={<PlusCircle className="w-3.5 h-3.5" />}
                        loading={isAdding} loadingText="Adding..."
                        disabled={!lessonData.title.trim()}
                    >Add Lesson</LoaderButton>
                </div>
            </form>
        </div>
    );
};

export default AddLessonForm;