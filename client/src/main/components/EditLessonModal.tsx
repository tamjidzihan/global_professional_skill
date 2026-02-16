/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import type { LessonCreateUpdateData } from '../../types';

interface EditLessonModalProps {
    courseId: string;
    sectionId: string;
    lesson: { id: string; title: string; lesson_type: string; content: string };
    onClose: () => void;
}

const EditLessonModal: React.FC<EditLessonModalProps> = ({ courseId, sectionId, lesson, onClose }) => {
    const [title, setTitle] = useState(lesson.title);
    const [lessonType, setLessonType] = useState(lesson.lesson_type);
    const [content, setContent] = useState(lesson.content);
    const { editLesson, loading } = useCourses();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const lessonData: Partial<LessonCreateUpdateData> = {
            title,
            lesson_type: lessonType as any, // Cast to any because lessonType from state is string, but LessonCreateUpdateData expects LessonType enum. This might need a more robust solution.
            content: content.trim() === '' ? undefined : content,
            section: sectionId, // Ensure sectionId is passed
            is_preview: (lesson as any).is_preview, // Assuming lesson from props has is_preview
            order: (lesson as any).order, // Assuming lesson from props has order
        };
        await editLesson(courseId, sectionId, lesson.id, lessonData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Edit Lesson</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Lesson Title"
                        className="border rounded px-2 py-1 w-full mb-4"
                    />
                    <select
                        value={lessonType}
                        onChange={(e) => setLessonType(e.target.value)}
                        className="border rounded px-2 py-1 w-full mb-4"
                    >
                        <option value="VIDEO">Video</option>
                        <option value="TEXT">Text</option>
                        {/* Add other lesson types as needed */}
                    </select>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Lesson Content (e.g., video URL or text content)"
                        rows={5}
                        className="border rounded px-2 py-1 w-full mb-4"
                    />
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-1 rounded">Cancel</button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLessonModal;
