/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Video, FileText, HelpCircle, ClipboardList, FolderOpen, AlertCircle, Save, BookOpen, Layers } from 'lucide-react';
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

const LESSON_TYPES: { value: LessonType; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'VIDEO', label: 'Video', icon: <Video size={16} />, description: 'Video lesson with URL' },
    { value: 'TEXT', label: 'Text', icon: <FileText size={16} />, description: 'Written content' },
    { value: 'QUIZ', label: 'Quiz', icon: <HelpCircle size={16} />, description: 'Assessment questions' },
    { value: 'ASSIGNMENT', label: 'Assignment', icon: <ClipboardList size={16} />, description: 'Student task' },
    { value: 'RESOURCE', label: 'Resource', icon: <FolderOpen size={16} />, description: 'Downloadable files' },
];

const EditLessonModal: React.FC<EditLessonModalProps> = ({
    courseId,
    sectionId,
    lesson,
    onClose
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
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

    const inputClassName = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-shadow";
    const labelClassName = "block text-sm font-medium text-gray-600 mb-1.5";
    const errorClassName = "mt-1.5 text-sm text-red-600 flex items-center gap-1";

    // Handle escape key press
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isSubmitting) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, isSubmitting]);

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
        setValidationError(null);

        if (!lessonData.title.trim()) {
            setValidationError('Please enter a lesson title');
            toast.error('Please enter a lesson title');
            return;
        }

        // Validation for video lessons
        if (lessonData.lesson_type === 'VIDEO' && lessonData.video_url && !isValidVideoUrl(lessonData.video_url)) {
            setValidationError('Please enter a valid YouTube or Vimeo URL');
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
            setValidationError(error.message || 'Failed to update lesson');
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
        if (e.target === e.currentTarget && !isSubmitting) {
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
                return 'Lesson Content';
            case 'QUIZ':
                return 'Quiz Instructions';
            default:
                return 'Content';
        }
    };

    const getContentPlaceholder = (type: LessonType): string => {
        switch (type) {
            case 'TEXT':
                return 'Enter your lesson content here...';
            case 'QUIZ':
                return 'Describe the quiz and provide instructions for students...';
            default:
                return '';
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl transform transition-all max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-[#0066CC]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Edit Lesson</h2>
                            <p className="text-sm text-gray-500">Update lesson details and content</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                        disabled={isSubmitting}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Error Alert */}
                {validationError && (
                    <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {validationError}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Basic Information Section */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                    <FileText className="w-3.5 h-3.5 text-[#0066CC]" />
                                </div>
                                Basic Information
                            </h3>

                            <div className="space-y-4">
                                {/* Lesson Title */}
                                <div>
                                    <label htmlFor="lesson-title" className={labelClassName}>
                                        Lesson Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="lesson-title"
                                        type="text"
                                        name="title"
                                        value={lessonData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Introduction to React Hooks"
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                        required
                                        autoFocus
                                    />
                                    {!lessonData.title.trim() && (
                                        <p className={errorClassName}>
                                            <AlertCircle className="w-4 h-4" />
                                            Lesson title is required
                                        </p>
                                    )}
                                </div>

                                {/* Order */}
                                <div>
                                    <label htmlFor="lesson-order" className={labelClassName}>
                                        Display Order
                                    </label>
                                    <input
                                        id="lesson-order"
                                        type="number"
                                        name="order"
                                        value={lessonData.order}
                                        onChange={handleInputChange}
                                        min="0"
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Determines the order in which lessons appear (0 = first)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lesson Type Section */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                                </div>
                                Lesson Type
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                {LESSON_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setLessonData(prev => ({ ...prev, lesson_type: type.value }))}
                                        className={`
                                            flex flex-col items-center gap-2 p-3 rounded-lg text-xs font-medium
                                            transition-all duration-200 border-2
                                            ${lessonData.lesson_type === type.value
                                                ? 'bg-[#0066CC] text-white border-[#0066CC] shadow-md scale-[1.02]'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#0066CC] hover:bg-blue-50'
                                            }
                                            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                        disabled={isSubmitting}
                                        title={type.description}
                                    >
                                        <div className={`${lessonData.lesson_type === type.value ? 'text-white' : 'text-[#0066CC]'}`}>
                                            {type.icon}
                                        </div>
                                        <span className="text-center">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Section - Conditional based on lesson type */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                                    <Video className="w-3.5 h-3.5 text-green-600" />
                                </div>
                                Lesson Content
                            </h3>

                            <div className="space-y-4">
                                {/* Video URL - Only show for VIDEO type */}
                                {lessonData.lesson_type === 'VIDEO' && (
                                    <>
                                        <div>
                                            <label htmlFor="video-url" className={labelClassName}>
                                                Video URL
                                            </label>
                                            <input
                                                id="video-url"
                                                type="url"
                                                name="video_url"
                                                value={lessonData.video_url}
                                                onChange={handleInputChange}
                                                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                                className={inputClassName}
                                                disabled={isSubmitting}
                                            />
                                            <p className="mt-1.5 text-xs text-gray-500">
                                                Supports YouTube and Vimeo URLs
                                            </p>
                                        </div>

                                        <div>
                                            <label htmlFor="video-duration" className={labelClassName}>
                                                Video Duration (seconds)
                                            </label>
                                            <input
                                                id="video-duration"
                                                type="number"
                                                name="video_duration"
                                                value={lessonData.video_duration}
                                                onChange={handleInputChange}
                                                min="0"
                                                placeholder="e.g., 300 (5 minutes)"
                                                className={inputClassName}
                                                disabled={isSubmitting}
                                            />
                                            <p className="mt-1.5 text-xs text-gray-500">
                                                Duration in seconds (e.g., 300 for 5 minutes)
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Content - Show for TEXT and QUIZ types */}
                                {shouldShowContent(lessonData.lesson_type) && (
                                    <div>
                                        <label htmlFor="content" className={labelClassName}>
                                            {getContentLabel(lessonData.lesson_type)}
                                        </label>
                                        <textarea
                                            id="content"
                                            name="content"
                                            value={lessonData.content}
                                            onChange={handleInputChange}
                                            rows={6}
                                            placeholder={getContentPlaceholder(lessonData.lesson_type)}
                                            className={inputClassName}
                                            disabled={isSubmitting}
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">
                                            {lessonData.lesson_type === 'TEXT'
                                                ? 'Provide the main content for this text lesson'
                                                : 'Describe the quiz and provide instructions'
                                            }
                                        </p>
                                    </div>
                                )}

                                {/* Message for other types */}
                                {!shouldShowContent(lessonData.lesson_type) && lessonData.lesson_type !== 'VIDEO' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            {lessonData.lesson_type === 'ASSIGNMENT' && 'Assignment details can be configured after creation.'}
                                            {lessonData.lesson_type === 'RESOURCE' && 'Resources can be uploaded after creation.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                                    <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
                                </div>
                                Lesson Settings
                            </h3>

                            {/* Preview Toggle */}
                            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                                <input
                                    id="is-preview"
                                    type="checkbox"
                                    name="is_preview"
                                    checked={lessonData.is_preview}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 mt-0.5 text-[#0066CC] focus:ring-[#0066CC] border-gray-300 rounded cursor-pointer"
                                    disabled={isSubmitting}
                                />
                                <div className="flex-1">
                                    <label htmlFor="is-preview" className="text-sm font-medium text-gray-900 cursor-pointer">
                                        Free Preview Lesson
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Make this lesson available as a free preview to potential students before they enroll
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                        <LoaderButton
                            type="button"
                            variant="secondary"
                            size="md"
                            icon={<X className="w-4 h-4" />}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </LoaderButton>
                        <LoaderButton
                            type="submit"
                            variant="success"
                            size="md"
                            elevation="lg"
                            icon={<Save className="w-4 h-4" />}
                            loading={isSubmitting}
                            loadingText="Saving Changes..."
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