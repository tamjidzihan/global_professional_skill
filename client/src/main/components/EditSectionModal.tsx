import React, { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';

interface EditSectionModalProps {
    courseId: string;
    section: { id: string; title: string };
    onClose: () => void;
}

const EditSectionModal: React.FC<EditSectionModalProps> = ({ courseId, section, onClose }) => {
    const [title, setTitle] = useState(section.title);
    const { editSection, loading } = useCourses();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        await updateSection(courseId, section.id, { title });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Edit Section</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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

export default EditSectionModal;
