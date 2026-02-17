/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { PlusCircle, Video, FileText, HelpCircle, ClipboardList, FolderOpen } from 'lucide-react';
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
    { value: 'VIDEO', label: 'Video Lesson', icon: <Video size={16} /> },
    { value: 'TEXT', label: 'Text Lesson', icon: <FileText size={16} /> },
    { value: 'QUIZ', label: 'Quiz', icon: <HelpCircle size={16} /> },
    { value: 'ASSIGNMENT', label: 'Assignment', icon: <ClipboardList size={16} /> },
    { value: 'RESOURCE', label: 'Resource', icon: <FolderOpen size={16} /> },
];

const AddLessonForm: React.FC<AddLessonFormProps> = ({ courseId, sectionId, onSuccess }) => {
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [lessonData, setLessonData] = useState({
        title: '',
        lesson_type: 'VIDEO' as LessonType,
        content: '',
        video_url: '',
        video_duration: 0,
        is_preview: false,
        order: 0
    });

    const { addLesson } = useCourses();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setLessonData(prev => ({ ...prev, [name]: checkbox.checked }));
        } else if (name === 'video_duration') {
            setLessonData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
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

        setIsAddingLesson(true);

        try {
            await addLesson(courseId, sectionId, {
                section: sectionId,
                title: lessonData.title.trim(),
                lesson_type: lessonData.lesson_type,
                content: lessonData.content.trim() || undefined,
                video_url: lessonData.video_url || undefined,
                video_duration: lessonData.video_duration || undefined,
                is_preview: lessonData.is_preview,
                order: lessonData.order
            });

            // Reset form
            setLessonData({
                title: '',
                lesson_type: 'VIDEO',
                content: '',
                video_url: '',
                video_duration: 0,
                is_preview: false,
                order: 0
            });

            setShowForm(false);
            toast.success('Lesson added successfully!');

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            // Parse the error using the utility
            const parsedError = parseError(error);

            console.error("Failed to add lesson", {
                originalError: error,
                parsedError,
                courseId,
                sectionId,
                lessonData
            });

            // Handle validation errors (like duplicate order)
            if (parsedError.validationErrors) {
                const fieldErrors = formatFieldErrors(parsedError.validationErrors);

                // Check for non_field_errors (like unique constraint)
                if (fieldErrors.non_field_errors) {
                    if (fieldErrors.non_field_errors.includes('unique set') ||
                        fieldErrors.non_field_errors.includes('already exists')) {
                        toast.error('A lesson with this order number already exists. Please choose a different order.');
                    } else {
                        toast.error(fieldErrors.non_field_errors);
                    }
                }
                // Check for order field errors
                else if (fieldErrors.order) {
                    if (fieldErrors.order.includes('unique') || fieldErrors.order.includes('already exists')) {
                        toast.error('A lesson with this order number already exists. Please choose a different order.');
                    } else {
                        toast.error(`Order error: ${fieldErrors.order}`);
                    }
                }
            }

            // Handle duplicate order (specific message check)
            else if (parsedError.message.includes('order') &&
                (parsedError.message.includes('unique') || parsedError.message.includes('already exists'))) {
                toast.error('A lesson with this order number already exists. Please choose a different order.');
            }
            // Handle all other errors
            else {
                toast.error(parsedError.message || 'Failed to add lesson. Please try again.');
            }
        } finally {
            setIsAddingLesson(false);
        }
    };

    const isValidVideoUrl = (url: string): boolean => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/;
        return youtubeRegex.test(url) || vimeoRegex.test(url) || url === '';
    };

    const handleCancel = () => {
        setShowForm(false);
        setLessonData({
            title: '',
            lesson_type: 'VIDEO',
            content: '',
            video_url: '',
            video_duration: 0,
            is_preview: false,
            order: 0
        });
    };

    if (!showForm) {
        return (
            <LoaderButton
                variant="secondary"
                size="sm"
                icon={<PlusCircle size={16} />}
                onClick={() => setShowForm(true)}
                className="w-full"
            >
                Add New Lesson
            </LoaderButton>
        );
    }

    return (
        <div className="bg-white rounded-lg border p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Add New Lesson</h4>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Lesson Title */}
                <div>
                    <label htmlFor="lesson-title" className="block text-xs font-medium text-gray-600 mb-1">
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
                        disabled={isAddingLesson}
                        required
                        autoFocus
                    />
                </div>

                {/* Lesson Type */}
                <div>
                    <label htmlFor="lesson-type" className="block text-xs font-medium text-gray-600 mb-1">
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
                                `}
                                disabled={isAddingLesson}
                            >
                                {type.icon}
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Order */}
                <div>
                    <label htmlFor="lesson-order" className="block text-xs font-medium text-gray-600 mb-1">
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
                        disabled={isAddingLesson}
                    />
                </div>

                {/* Video URL - Only show for VIDEO type */}
                {lessonData.lesson_type === 'VIDEO' && (
                    <div>
                        <label htmlFor="video-url" className="block text-xs font-medium text-gray-600 mb-1">
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
                            disabled={isAddingLesson}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Supports YouTube and Vimeo URLs
                        </p>
                    </div>
                )}

                {/* Video Duration - Only show for VIDEO type */}
                {lessonData.lesson_type === 'VIDEO' && (
                    <div>
                        <label htmlFor="video-duration" className="block text-xs font-medium text-gray-600 mb-1">
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
                            disabled={isAddingLesson}
                        />
                    </div>
                )}

                {/* Content - Show for TEXT and QUIZ types */}
                {(lessonData.lesson_type === 'TEXT' || lessonData.lesson_type === 'QUIZ') && (
                    <div>
                        <label htmlFor="content" className="block text-xs font-medium text-gray-600 mb-1">
                            {lessonData.lesson_type === 'TEXT' ? 'Content' : 'Quiz Description'}
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={lessonData.content}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder={lessonData.lesson_type === 'TEXT'
                                ? 'Enter your lesson content here...'
                                : 'Describe the quiz...'}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                            disabled={isAddingLesson}
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
                        disabled={isAddingLesson}
                    />
                    <label htmlFor="is-preview" className="text-sm text-gray-700">
                        Make this lesson available as a free preview
                    </label>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                    <LoaderButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isAddingLesson}
                    >
                        Cancel
                    </LoaderButton>
                    <LoaderButton
                        type="submit"
                        variant="primary"
                        size="sm"
                        icon={<PlusCircle size={16} />}
                        loading={isAddingLesson}
                        loadingText="Adding..."
                        disabled={!lessonData.title.trim()}
                    >
                        Add Lesson
                    </LoaderButton>
                </div>
            </form>
        </div>
    );
};

export default AddLessonForm;