/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Video, FileText, HelpCircle, ClipboardList, FolderOpen } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import { toast } from 'react-hot-toast';
import type { LessonType } from '../../types';
import { LoaderButton } from './ui/LoaderButton';

interface EditLessonModalProps {
    courseId: string;
    sectionId: string;
    lesson: {
        id: string;
        title: string;
        lesson_type: string;
        content?: string;
        video_url?: string;
        video_duration?: number;
        is_preview: boolean;
        order: number;
    };
    onClose: () => void;
}

const LESSON_TYPES: { value: LessonType; label: string; icon: React.ReactNode }[] = [
    { value: 'VIDEO', label: 'Video Lesson', icon: <Video size={16} /> },
    { value: 'TEXT', label: 'Text Lesson', icon: <FileText size={16} /> },
    { value: 'QUIZ', label: 'Quiz', icon: <HelpCircle size={16} /> },
    { value: 'ASSIGNMENT', label: 'Assignment', icon: <ClipboardList size={16} /> },
    { value: 'RESOURCE', label: 'Resource', icon: <FolderOpen size={16} /> },
];

const EditLessonModal: React.FC<EditLessonModalProps> = ({
    courseId,
    sectionId,
    lesson,
    onClose
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lessonData, setLessonData] = useState({
        title: lesson.title,
        lesson_type: lesson.lesson_type as LessonType,
        content: lesson.content || '',
        video_url: lesson.video_url || '',
        video_duration: lesson.video_duration || 0,
        is_preview: lesson.is_preview,
        order: lesson.order
    });

    const { editLesson } = useCourses();

    // Handle escape key press
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setLessonData(prev => ({ ...prev, [name]: checkbox.checked }));
        } else if (name === 'video_duration') {
            setLessonData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else if (name === 'lesson_type') {
            setLessonData(prev => ({ ...prev, [name]: value as LessonType }));
        } else {
            setLessonData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!lessonData.title.trim()) {
            toast.error('Please enter a lesson title');
            return;
        }

        // Validation for video lessons
        if (lessonData.lesson_type === 'VIDEO' && lessonData.video_url && !isValidVideoUrl(lessonData.video_url)) {
            toast.error('Please enter a valid YouTube or Vimeo URL');
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
                order: lessonData.order
            });

            toast.success('Lesson updated successfully!');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update lesson');
            console.error("Failed to update lesson", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValidVideoUrl = (url: string): boolean => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/;
        return youtubeRegex.test(url) || vimeoRegex.test(url);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Helper functions for content field
    const shouldShowContent = (type: LessonType): boolean => {
        return type === 'TEXT' || type === 'QUIZ';
    };

    const getContentLabel = (type: LessonType): string => {
        switch (type) {
            case 'TEXT':
                return 'Content';
            case 'QUIZ':
                return 'Quiz Description';
            default:
                return 'Content';
        }
    };

    const getContentPlaceholder = (type: LessonType): string => {
        switch (type) {
            case 'TEXT':
                return 'Enter your lesson content here...';
            case 'QUIZ':
                return 'Describe the quiz...';
            default:
                return '';
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Lesson</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Lesson Title */}
                    <div>
                        <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700 mb-1">
                            Lesson Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="lesson-title"
                            type="text"
                            name="title"
                            value={lessonData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Introduction to the Course"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                            disabled={isSubmitting}
                            required
                            autoFocus
                        />
                    </div>

                    {/* Lesson Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lesson Type
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {LESSON_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setLessonData(prev => ({ ...prev, lesson_type: type.value }))}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                                        transition-all duration-200
                                        ${lessonData.lesson_type === type.value
                                            ? 'bg-[#0066CC] text-white shadow-md scale-[1.02]'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }
                                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                    disabled={isSubmitting}
                                >
                                    {type.icon}
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Order */}
                    <div>
                        <label htmlFor="lesson-order" className="block text-sm font-medium text-gray-700 mb-1">
                            Order
                        </label>
                        <input
                            id="lesson-order"
                            type="number"
                            name="order"
                            value={lessonData.order}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Video URL - Only show for VIDEO type */}
                    {lessonData.lesson_type === 'VIDEO' && (
                        <div>
                            <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-1">
                                Video URL
                            </label>
                            <input
                                id="video-url"
                                type="url"
                                name="video_url"
                                value={lessonData.video_url}
                                onChange={handleInputChange}
                                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Supports YouTube and Vimeo URLs
                            </p>
                        </div>
                    )}

                    {/* Video Duration - Only show for VIDEO type */}
                    {lessonData.lesson_type === 'VIDEO' && (
                        <div>
                            <label htmlFor="video-duration" className="block text-sm font-medium text-gray-700 mb-1">
                                Video Duration (seconds)
                            </label>
                            <input
                                id="video-duration"
                                type="number"
                                name="video_duration"
                                value={lessonData.video_duration}
                                onChange={handleInputChange}
                                min="0"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                                disabled={isSubmitting}
                            />
                        </div>
                    )}

                    {/* Content - Show for TEXT and QUIZ types */}
                    {shouldShowContent(lessonData.lesson_type) && (
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                                {getContentLabel(lessonData.lesson_type)}
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                value={lessonData.content}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder={getContentPlaceholder(lessonData.lesson_type)}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                                disabled={isSubmitting}
                            />
                        </div>
                    )}

                    {/* Preview Toggle */}
                    <div className="flex items-center gap-2">
                        <input
                            id="is-preview"
                            type="checkbox"
                            name="is_preview"
                            checked={lessonData.is_preview}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-[#0066CC] focus:ring-[#0066CC] border-gray-300 rounded"
                            disabled={isSubmitting}
                        />
                        <label htmlFor="is-preview" className="text-sm text-gray-700">
                            Make this lesson available as a free preview
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <LoaderButton
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </LoaderButton>
                        <LoaderButton
                            type="submit"
                            variant="primary"
                            size="md"
                            loading={isSubmitting}
                            loadingText="Saving..."
                            disabled={!lessonData.title.trim()}
                        >
                            Save Changes
                        </LoaderButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLessonModal;
