import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../../../../hooks/useCourses';
import { LoaderButton } from '../../../components/ui/LoaderButton';
import AddLessonForm from '../../../components/AddLessonForm';
import EditSectionModal from '../../../components/EditSectionModal';
import EditLessonModal from '../../../components/EditLessonModal';
import { Edit, Trash2, BookOpen, ChevronDown, ChevronUp, Plus, FolderPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { LessonSummary, Section } from '../../../../types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface SectionToEdit {
    id: string;
    title: string;
    description?: string;
    order: number;
}

interface LessonToEdit {
    id: string;
    title: string;
    lesson_type: string;
    content?: string;
    video_url?: string;
    video_duration?: number;
    is_preview: boolean;
    order: number;
}

const CurriculumPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const {
        course,
        fetchCourseDetail,
        addSection,
        removeSection,
        removeLesson,
        loading,
        error
    } = useCourses();

    // UI State
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
    const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

    // Section Form State
    const [newSection, setNewSection] = useState({
        title: '',
        description: '',
        order: 0
    });

    // Modal States
    const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
    const [sectionToEdit, setSectionToEdit] = useState<SectionToEdit | null>(null);
    const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
    const [lessonToEdit, setLessonToEdit] = useState<LessonToEdit | null>(null);
    const [currentSectionIdForLesson, setCurrentSectionIdForLesson] = useState<string | null>(null);

    useEffect(() => {
        if (courseId) {
            fetchCourseDetail(courseId).catch(() => {
                toast.error('Failed to load course curriculum');
            });
        }
    }, [courseId, fetchCourseDetail]);

    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId || !newSection.title.trim()) {
            toast.error('Please enter a section title');
            return;
        }

        setIsAddingSection(true);

        try {
            await addSection(courseId, {
                course: courseId,
                title: newSection.title.trim(),
                description: newSection.description.trim() || undefined,
                order: newSection.order
            });

            // Reset form
            setNewSection({ title: '', description: '', order: 0 });

            // Refresh course data
            await fetchCourseDetail(courseId);
            toast.success('Section added successfully!');
        } catch (error) {
            toast.error('Failed to add section. Please try again.');
            console.error("Failed to add section", error);
        } finally {
            setIsAddingSection(false);
        }
    };

    const handleEditSectionClick = (e: React.MouseEvent, section: Section) => {
        e.stopPropagation();
        setSectionToEdit({
            id: section.id,
            title: section.title,
            description: section.description,
            order: section.order
        });
        setIsEditSectionModalOpen(true);
    };

    const handleCloseEditSectionModal = useCallback(async () => {
        setIsEditSectionModalOpen(false);
        setSectionToEdit(null);
        if (courseId) {
            try {
                await fetchCourseDetail(courseId);
                toast.success('Section updated successfully!');
            } catch {
                toast.error('Failed to refresh sections');
            }
        }
    }, [courseId, fetchCourseDetail]);

    const handleEditLessonClick = (lesson: LessonSummary, sectionId: string) => {
        // Convert LessonSummary to LessonToEdit format
        setLessonToEdit({
            id: lesson.id,
            title: lesson.title,
            lesson_type: lesson.lesson_type,
            video_duration: lesson.video_duration,
            is_preview: lesson.is_preview,
            order: lesson.order,
            content: '', // Default values for missing fields
            video_url: ''
        });
        setCurrentSectionIdForLesson(sectionId);
        setIsEditLessonModalOpen(true);
    };

    const handleCloseEditLessonModal = useCallback(async () => {
        setIsEditLessonModalOpen(false);
        setLessonToEdit(null);
        setCurrentSectionIdForLesson(null);
        if (courseId) {
            try {
                await fetchCourseDetail(courseId);
                toast.success('Lesson updated successfully!');
            } catch {
                toast.error('Failed to refresh lessons');
            }
        }
    }, [courseId, fetchCourseDetail]);

    const handleDeleteSection = async (e: React.MouseEvent, sectionId: string) => {
        e.stopPropagation();
        if (!courseId) return;

        // Show confirmation toast
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Delete Section?</p>
                <p className="text-sm text-gray-600">This will permanently delete this section and all its lessons. This action cannot be undone.</p>
                <div className="flex gap-2 justify-end mt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            setDeletingSectionId(sectionId);
                            try {
                                await removeSection(courseId, sectionId);
                                await fetchCourseDetail(courseId);
                                toast.success('Section deleted successfully');
                            } catch (error) {
                                toast.error('Failed to delete section');
                                console.error("Failed to delete section", error);
                            } finally {
                                setDeletingSectionId(null);
                            }
                        }}
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
        if (!courseId) return;

        // Show confirmation toast
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Delete Lesson?</p>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
                <div className="flex gap-2 justify-end mt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            setDeletingLessonId(lessonId);
                            try {
                                await removeLesson(courseId, sectionId, lessonId);
                                await fetchCourseDetail(courseId);
                                toast.success('Lesson deleted successfully');
                            } catch (error) {
                                toast.error('Failed to delete lesson');
                                console.error("Failed to delete lesson", error);
                            } finally {
                                setDeletingLessonId(null);
                            }
                        }}
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const toggleSection = (sectionId: string) => {
        setOpenSection(openSection === sectionId ? null : sectionId);
    };

    if (loading && !course) {
        return <LoadingSpinner fullscreen text="Loading curriculum..." />;
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    Error: {error}
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Course not found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        The course you're looking for doesn't exist or you don't have access.
                    </p>
                    <Link
                        to="/dashboard/instructor/my-courses"
                        className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← Back to My Courses
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Manage Curriculum
                    </h1>
                    <p className="text-gray-600 mt-1">{course.title}</p>
                </div>
                <Link
                    to="/dashboard/instructor/my-courses"
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                >
                    ← Back to My Courses
                </Link>
            </div>

            {/* Curriculum Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Total Sections</p>
                    <p className="text-2xl font-bold text-gray-900">{course.sections.length}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Total Lessons</p>
                    <p className="text-2xl font-bold text-gray-900">{course.total_classes}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Course Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                        ${course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                            course.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                        {course.status}
                    </span>
                </div>
            </div>

            {/* Sections List */}
            {course.sections.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                    <FolderPlus className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No sections yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by creating your first section below
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {course.sections.map((section) => (
                        <div
                            key={section.id}
                            className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Section Header */}
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer"
                                onClick={() => toggleSection(section.id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {section.title}
                                        </h2>
                                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                            Order {section.order}
                                        </span>
                                    </div>
                                    {section.description && (
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                            {section.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                        <BookOpen size={16} className="text-gray-400" />
                                        <span>{section.lesson_count} {section.lesson_count === 1 ? 'lesson' : 'lessons'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <LoaderButton
                                        size="sm"
                                        variant="secondary"
                                        icon={<Edit size={16} />}
                                        onClick={(e) => handleEditSectionClick(e, section)}
                                        disabled={deletingSectionId === section.id}
                                        className="px-3! py-1.5!"
                                    >
                                        Edit
                                    </LoaderButton>
                                    <LoaderButton
                                        size="sm"
                                        variant="danger"
                                        icon={<Trash2 size={16} />}
                                        onClick={(e) => handleDeleteSection(e, section.id)}
                                        loading={deletingSectionId === section.id}
                                        loadingText="Deleting..."
                                        className="px-3! py-1.5!"
                                    >
                                        Delete
                                    </LoaderButton>
                                    {openSection === section.id ? (
                                        <ChevronUp size={20} className="text-gray-500" />
                                    ) : (
                                        <ChevronDown size={20} className="text-gray-500" />
                                    )}
                                </div>
                            </div>

                            {/* Section Content (Lessons) */}
                            {openSection === section.id && (
                                <div className="border-t bg-gray-50 p-4">
                                    {section.lessons.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">
                                            No lessons yet. Add your first lesson below.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {section.lessons.map((lesson) => (
                                                <div
                                                    key={lesson.id}
                                                    className="flex items-center justify-between bg-white p-3 rounded-lg border"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <BookOpen size={16} className="text-gray-400" />
                                                        <div>
                                                            <span className="font-medium text-gray-900">
                                                                {lesson.title}
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                                                                    {lesson.lesson_type}
                                                                </span>
                                                                {lesson.is_preview && (
                                                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                                                        Free Preview
                                                                    </span>
                                                                )}
                                                                {lesson.video_duration && (
                                                                    <span className="text-xs text-gray-500">
                                                                        {Math.floor(lesson.video_duration / 60)} min
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <LoaderButton
                                                            size="sm"
                                                            variant="secondary"
                                                            icon={<Edit size={14} />}
                                                            onClick={() => handleEditLessonClick(lesson, section.id)}
                                                            disabled={deletingLessonId === lesson.id}
                                                            className="px-2! py-1!"
                                                        >
                                                            Edit
                                                        </LoaderButton>
                                                        <LoaderButton
                                                            size="sm"
                                                            variant="danger"
                                                            icon={<Trash2 size={14} />}
                                                            onClick={() => handleDeleteLesson(section.id, lesson.id)}
                                                            loading={deletingLessonId === lesson.id}
                                                            loadingText="..."
                                                            className="px-2! py-1!"
                                                        >
                                                            Delete
                                                        </LoaderButton>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Lesson Form */}
                                    <div className="mt-4">
                                        <AddLessonForm
                                            courseId={course.id}
                                            sectionId={section.id}
                                            onSuccess={() => {
                                                fetchCourseDetail(courseId!);
                                                toast.success('Lesson added successfully!');
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Section Form */}
            <div className="mt-8 bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Add New Section</h3>
                <form onSubmit={handleAddSection} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="section-title" className="block text-sm font-medium text-gray-700 mb-1">
                                Section Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="section-title"
                                type="text"
                                value={newSection.title}
                                onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Introduction to the Course"
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                                disabled={isAddingSection}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="section-order" className="block text-sm font-medium text-gray-700 mb-1">
                                Order
                            </label>
                            <input
                                id="section-order"
                                type="number"
                                value={newSection.order}
                                onChange={(e) => setNewSection(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                placeholder="0"
                                min="0"
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                                disabled={isAddingSection}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="section-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            id="section-description"
                            value={newSection.description}
                            onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of this section..."
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC]"
                            disabled={isAddingSection}
                        />
                    </div>

                    <div className="flex justify-end">
                        <LoaderButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            icon={<Plus size={18} />}
                            loading={isAddingSection}
                            loadingText="Adding Section..."
                            disabled={!newSection.title.trim()}
                            pulse={!newSection.title.trim()}
                        >
                            Add Section
                        </LoaderButton>
                    </div>
                </form>
            </div>

            {/* Modals */}
            {isEditSectionModalOpen && sectionToEdit && courseId && (
                <EditSectionModal
                    courseId={courseId}
                    section={sectionToEdit}
                    onClose={handleCloseEditSectionModal}
                />
            )}

            {isEditLessonModalOpen && lessonToEdit && currentSectionIdForLesson && courseId && (
                <EditLessonModal
                    courseId={courseId}
                    sectionId={currentSectionIdForLesson}
                    lesson={lessonToEdit}
                    onClose={handleCloseEditLessonModal}
                />
            )}
        </div>
    );
};

export default CurriculumPage;