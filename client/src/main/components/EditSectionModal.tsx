/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle, Save } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import { toast } from 'react-hot-toast';
import { LoaderButton } from './ui/LoaderButton';

interface EditSectionModalProps {
    courseId: string;
    section: { id: string; title: string; description?: string; order: number };
    onClose: () => void;
}

const EditSectionModal: React.FC<EditSectionModalProps> = ({ courseId, section, onClose }) => {
    const [title, setTitle] = useState(section.title);
    const [description, setDescription] = useState(section.description || '');
    const [order, setOrder] = useState(section.order);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const { editSection } = useCourses();

    const inputCls = 'w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all';
    const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5';

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isSubmitting) onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose, isSubmitting]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);
        if (!title.trim()) { setValidationError('Please enter a section title'); return; }
        setIsSubmitting(true);
        try {
            await editSection(courseId, section.id, { course: courseId, title: title.trim(), description: description.trim() || undefined, order });
            toast.success('Section updated!');
            onClose();
        } catch (error: any) {
            setValidationError(error.message || 'Failed to update section');
            toast.error(error.message || 'Failed to update section');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => !isSubmitting && onClose()} />
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                            <Layers className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Edit Section</p>
                            <p className="text-xs text-gray-400 mt-0.5">Update section information</p>
                        </div>
                    </div>
                    <button onClick={() => !isSubmitting && onClose()} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">

                        {validationError && (
                            <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {validationError}
                            </div>
                        )}

                        <div>
                            <label className={labelCls}>Section Title <span className="text-rose-400 normal-case">*</span></label>
                            <input
                                type="text" value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g., Introduction to the Course"
                                className={inputCls} disabled={isSubmitting} autoFocus required
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Choose a clear, descriptive title</p>
                        </div>

                        <div>
                            <label className={labelCls}>Description <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Brief description of what students will learn..."
                                rows={4}
                                className={`${inputCls} resize-none`}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Display Order</label>
                            <input
                                type="number" value={order}
                                onChange={e => setOrder(parseInt(e.target.value) || 0)}
                                min="0" className={inputCls} disabled={isSubmitting}
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Determines position in the curriculum (0 = first)</p>
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
                            disabled={!title.trim()}
                        >
                            Save Changes
                        </LoaderButton>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditSectionModal;