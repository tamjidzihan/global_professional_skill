/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import { toast } from 'react-hot-toast';
import { LoaderButton } from './ui/LoaderButton';

interface EditSectionModalProps {
    courseId: string;
    section: {
        id: string;
        title: string;
        description?: string;
        order: number;
    };
    onClose: () => void;
}

const EditSectionModal: React.FC<EditSectionModalProps> = ({ courseId, section, onClose }) => {
    const [title, setTitle] = useState(section.title);
    const [description, setDescription] = useState(section.description || '');
    const [order, setOrder] = useState(section.order);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { editSection } = useCourses();

    // Handle escape key press
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('Please enter a section title');
            return;
        }

        setIsSubmitting(true);

        try {
            await editSection(courseId, section.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                order
            });

            toast.success('Section updated successfully!');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update section');
            console.error("Failed to update section", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Section</h2>
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
                    {/* Title Field */}
                    <div>
                        <label htmlFor="section-title" className="block text-sm font-medium text-gray-700 mb-1">
                            Section Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="section-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Introduction to the Course"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                            disabled={isSubmitting}
                            autoFocus
                            required
                        />
                    </div>

                    {/* Description Field */}
                    <div>
                        <label htmlFor="section-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            id="section-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this section..."
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Order Field */}
                    <div>
                        <label htmlFor="section-order" className="block text-sm font-medium text-gray-700 mb-1">
                            Order
                        </label>
                        <input
                            id="section-order"
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Determines the display order of sections
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
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
                            disabled={!title.trim()}
                        >
                            Save Changes
                        </LoaderButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSectionModal;