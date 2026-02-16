import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';

interface AddLessonFormProps {
    courseId: string;
    sectionId: string;
}

const AddLessonForm: React.FC<AddLessonFormProps> = ({ courseId, sectionId }) => {
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const { addLesson } = useCourses();

    const handleAddLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLessonTitle.trim()) return;

        setIsAddingLesson(true);
        try {
            await addLesson(courseId, sectionId, {
                section: sectionId,
                title: newLessonTitle,
                lesson_type: 'VIDEO',
                content: '',
                is_preview: false,
                order: 0,
            });
            setNewLessonTitle('');
        } catch (error) {
            console.error("Failed to add lesson", error);
        } finally {
            setIsAddingLesson(false);
        }
    };

    return (
        <form onSubmit={handleAddLesson} className="mt-2 flex items-center space-x-2">
            <input
                type="text"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="New Lesson Title"
                className="border rounded px-2 py-1 flex-grow"
                disabled={isAddingLesson}
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:bg-blue-300" disabled={isAddingLesson}>
                {isAddingLesson ? 'Adding...' : <PlusCircle size={18} />}
            </button>
        </form>
    );
};

export default AddLessonForm;
