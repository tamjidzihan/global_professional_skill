/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle, Save } from 'lucide-react';
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
    const [validationError, setValidationError] = useState<string | null>(null);
    const { editSection } = useCourses();

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        if (!title.trim()) {
            setValidationError('Please enter a section title');
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
            setValidationError(error.message || 'Failed to update section');
            toast.error(error.message || 'Failed to update section');
            console.error("Failed to update section", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Layers className="w-5 h-5 text-[#0066CC]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Edit Section</h2>
                            <p className="text-sm text-gray-500">Update section information</p>
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
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title Field */}
                    <div>
                        <label htmlFor="section-title" className={labelClassName}>
                            Section Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="section-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Introduction to the Course"
                            className={inputClassName}
                            disabled={isSubmitting}
                            autoFocus
                            required
                        />
                        <p className="mt-1.5 text-xs text-gray-500">
                            Choose a clear, descriptive title for your section
                        </p>
                        {!title.trim() && (
                            <p className={errorClassName}>
                                <AlertCircle className="w-4 h-4" />
                                Section title is required
                            </p>
                        )}
                    </div>

                    {/* Description Field */}
                    <div>
                        <label htmlFor="section-description" className={labelClassName}>
                            Description (Optional)
                        </label>
                        <textarea
                            id="section-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of what students will learn in this section..."
                            rows={4}
                            className={inputClassName}
                            disabled={isSubmitting}
                        />
                        <p className="mt-1.5 text-xs text-gray-500">
                            Provide context about the topics covered in this section
                        </p>
                    </div>

                    {/* Order Field */}
                    <div>
                        <label htmlFor="section-order" className={labelClassName}>
                            Display Order
                        </label>
                        <input
                            id="section-order"
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                            min="0"
                            className={inputClassName}
                            disabled={isSubmitting}
                        />
                        <p className="mt-1.5 text-xs text-gray-500">
                            Determines the order in which sections appear in the curriculum (0 = first)
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-200">
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
                            icon={<Save className="w-4 h-4" />}
                            loading={isSubmitting}
                            loadingText="Saving Changes..."
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