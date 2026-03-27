import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../../../../hooks/useCourses';
import { LoaderButton } from '../../../components/ui/LoaderButton';
import AddLessonForm from '../../../components/AddLessonForm';
import EditSectionModal from '../../../components/EditSectionModal';
import EditLessonModal from '../../../components/EditLessonModal';
import {
    Edit,
    Trash2,
    BookOpen,
    ChevronDown,
    ChevronUp,
    Plus,
    FolderPlus,
    Layers,
    AlertCircle,
    CheckCircle,
    X,
    Video,
    FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { LessonSummary, Section } from '../../../../types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import DashboardBreadcrumb from '../../../components/dashboard/DashboardBreadcrumb';
import { extractErrorMessage } from '../../../../lib/errorUtils';
import PageTitle from '../../../components/PageTitle';

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
    const navigate = useNavigate();
    const {
        course,
        fetchCourseDetail,
        addSection,
        removeSection,
        removeLesson,
        loading,
    } = useCourses();

    // UI State
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
    const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

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
                setServerError('Failed to load course curriculum');
                toast.error('Failed to load course curriculum');
            });
        }
    }, [courseId, fetchCourseDetail]);

    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!courseId || !newSection.title.trim()) {
            setServerError('Please enter a section title');
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

            setNewSection({ title: '', description: '', order: 0 });
            await fetchCourseDetail(courseId);
            toast.success('Section added successfully!');
        } catch (error) {
            // Use the updated extractErrorMessage
            const errorMessage = extractErrorMessage(error);

            // Check if it's the unique constraint error
            if (errorMessage.includes('unique set') || errorMessage.includes('already exists')) {
                const friendlyMessage = 'A section with this order number already exists. Please choose a different order.';
                setServerError(friendlyMessage);
                toast.error(friendlyMessage);
            } else {
                setServerError(errorMessage);
                toast.error(errorMessage);
            }

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
        setLessonToEdit({
            id: lesson.id,
            title: lesson.title,
            lesson_type: lesson.lesson_type,
            video_duration: lesson.video_duration,
            is_preview: lesson.is_preview,
            order: lesson.order,
            content: '',
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

    const inputClassName = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-shadow";
    const labelClassName = "block text-sm font-medium text-gray-600 mb-1.5";

    if (loading && !course) {
        return <LoadingSpinner fullscreen text="Loading curriculum..." />;
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Course</h2>
                    <p className="text-gray-600 mb-4">{'The course you are looking for does not exist or an error occurred.'}</p>
                    <button
                        onClick={() => navigate('/dashboard/instructor/my-courses')}
                        className="inline-block bg-[#0066CC] text-white px-6 py-3 rounded-lg hover:bg-[#004c99] transition-colors"
                    >
                        Back to My Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <PageTitle title={`Manage Curriculum | ${course.title} `} />
            {/* Breadcrumb */}
            <DashboardBreadcrumb
                name="Manage Curriculum"
                icon={Layers}
            />


            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto mt-8">
                    {/* Error Alert */}
                    {serverError && (
                        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {serverError}
                        </div>
                    )}

                    {/* Header Card */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Course Curriculum</h1>
                                <p className="text-sm text-gray-500 mt-1">Build and organize your course content with sections and lessons</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate(`/dashboard/instructor/my-courses/${course.id}`)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Curriculum Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Total Sections</p>
                                    <p className="text-3xl font-bold text-gray-900">{course.sections.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Layers className="w-6 h-6 text-[#0066CC]" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Total Lessons</p>
                                    <p className="text-3xl font-bold text-gray-900">{course.total_classes}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Course Status</p>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1
                                        ${course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                            course.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {course.status}
                                    </span>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Section Form */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-8">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <FolderPlus className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Add New Section</h2>
                                <p className="text-sm text-gray-500">Create a new section to organize your lessons</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddSection} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="md:col-span-2">
                                    <label htmlFor="section-title" className={labelClassName}>
                                        Section Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="section-title"
                                        type="text"
                                        value={newSection.title}
                                        onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Introduction to the Course"
                                        className={inputClassName}
                                        disabled={isAddingSection}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="section-order" className={labelClassName}>
                                        Order
                                    </label>
                                    <input
                                        id="section-order"
                                        type="number"
                                        value={newSection.order}
                                        onChange={(e) => setNewSection(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                        placeholder="0"
                                        min="0"
                                        className={inputClassName}
                                        disabled={isAddingSection}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="section-description" className={labelClassName}>
                                    Description (Optional)
                                </label>
                                <textarea
                                    id="section-description"
                                    value={newSection.description}
                                    onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief description of this section..."
                                    rows={3}
                                    className={inputClassName}
                                    disabled={isAddingSection}
                                />
                                <p className="mt-1.5 text-xs text-gray-500">
                                    Provide context about what students will learn in this section
                                </p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <LoaderButton
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    onClick={() => setNewSection({ title: '', description: '', order: 0 })}
                                    disabled={isAddingSection || !newSection.title}
                                >
                                    Clear
                                </LoaderButton>
                                <LoaderButton
                                    type="submit"
                                    variant="success"
                                    size="md"
                                    icon={<Plus size={18} />}
                                    loading={isAddingSection}
                                    loadingText="Adding Section..."
                                    disabled={!newSection.title.trim()}
                                >
                                    Add Section
                                </LoaderButton>
                            </div>
                        </form>
                    </div>

                    {/* Sections List */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Layers className="w-5 h-5 text-[#0066CC]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Course Sections</h2>
                                <p className="text-sm text-gray-500">Organize your lessons into logical sections</p>
                            </div>
                        </div>

                        {course.sections.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <FolderPlus className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-3 text-sm font-medium text-gray-900">No sections yet</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by creating your first section below
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {course.sections.map((section, index) => (
                                    <div
                                        key={section.id}
                                        className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* Section Header */}
                                        <div
                                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors rounded-t-lg"
                                            onClick={() => toggleSection(section.id)}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center w-8 h-8 bg-[#0066CC] text-white rounded-lg text-sm font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <h3 className="text-base font-semibold text-gray-900">
                                                            {section.title}
                                                        </h3>
                                                        {section.description && (
                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                                                {section.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 ml-11 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <BookOpen size={16} className="text-gray-400" />
                                                        {section.lesson_count} {section.lesson_count === 1 ? 'lesson' : 'lessons'}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                                        Order: {section.order}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <LoaderButton
                                                    size="sm"
                                                    variant="secondary"
                                                    icon={<Edit size={16} />}
                                                    onClick={(e) => handleEditSectionClick(e, section)}
                                                    disabled={deletingSectionId === section.id}
                                                    className="px-3 py-1.5"
                                                >
                                                    Edit
                                                </LoaderButton>
                                                <LoaderButton
                                                    size="sm"
                                                    variant="danger"
                                                    icon={<Trash2 size={16} />}
                                                    onClick={(e) => handleDeleteSection(e, section.id)}
                                                    loading={deletingSectionId === section.id}
                                                    loadingText="..."
                                                    className="px-3 py-1.5"
                                                >
                                                    Delete
                                                </LoaderButton>
                                                {openSection === section.id ? (
                                                    <ChevronUp size={20} className="text-gray-500 ml-2" />
                                                ) : (
                                                    <ChevronDown size={20} className="text-gray-500 ml-2" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Section Content (Lessons) */}
                                        {openSection === section.id && (
                                            <div className="border-t border-gray-200 bg-white p-5 rounded-b-lg">
                                                {section.lessons.length === 0 ? (
                                                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                                        <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-500">
                                                            No lessons yet. Add your first lesson below.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3 mb-5">
                                                        {section.lessons.map((lesson, lessonIndex) => (
                                                            <div
                                                                key={lesson.id}
                                                                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-[#0066CC] transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    <span className="flex items-center justify-center w-7 h-7 bg-white border-2 border-gray-300 rounded-lg text-xs font-semibold text-gray-600">
                                                                        {lessonIndex + 1}
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        {lesson.lesson_type === 'VIDEO' ? (
                                                                            <Video size={16} className="text-[#0066CC]" />
                                                                        ) : (
                                                                            <FileText size={16} className="text-[#0066CC]" />
                                                                        )}
                                                                        <div>
                                                                            <span className="font-medium text-gray-900 text-sm">
                                                                                {lesson.title}
                                                                            </span>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">
                                                                                    {lesson.lesson_type}
                                                                                </span>
                                                                                {lesson.is_preview && (
                                                                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
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
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <LoaderButton
                                                                        size="sm"
                                                                        variant="secondary"
                                                                        icon={<Edit size={14} />}
                                                                        onClick={() => handleEditLessonClick(lesson, section.id)}
                                                                        disabled={deletingLessonId === lesson.id}
                                                                        className="px-2 py-1"
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
                                                                        className="px-2 py-1"
                                                                    >
                                                                        Delete
                                                                    </LoaderButton>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Add Lesson Form */}
                                                <div className="mt-5 pt-5 border-t border-gray-200">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                        <Plus size={16} className="text-[#0066CC]" />
                                                        Add New Lesson
                                                    </h4>
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
                    </div>
                </div>
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