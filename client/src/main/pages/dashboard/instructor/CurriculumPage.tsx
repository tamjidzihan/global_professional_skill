
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../../../../hooks/useCourses';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import AddLessonForm from '../../../components/AddLessonForm';
import EditSectionModal from '../../../components/EditSectionModal';
import EditLessonModal from '../../../components/EditLessonModal'; // Import the new modal
import { Edit, Trash2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { deleteLesson, deleteSection } from '../../../../lib/api';

const CurriculumPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const {
        course,
        fetchCourseDetail,
        loading,
        error,
        addSection,
    } = useCourses();


    const [openSection, setOpenSection] = useState<string | null>(null);
    const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
    const [sectionToEdit, setSectionToEdit] = useState<{ id: string; title: string } | null>(null);

    const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
    const [lessonToEdit, setLessonToEdit] = useState<{ id: string; title: string; lesson_type: string; content: string } | null>(null);
    const [currentSectionIdForLesson, setCurrentSectionIdForLesson] = useState<string | null>(null);


    useEffect(() => {
        if (courseId) {
            fetchCourseDetail(courseId);
        }
    }, [courseId, fetchCourseDetail]);

    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [newSectionDescription, setNewSectionDescription] = useState('');
    const [isAddingSection, setIsAddingSection] = useState(false);

    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId || !newSectionTitle.trim()) return;

        setIsAddingSection(true);
        try {
            await addSection(courseId, { course: courseId, title: newSectionTitle, description: newSectionDescription });
            setNewSectionTitle('');
            setNewSectionDescription('');
            fetchCourseDetail(courseId); // Refetch to get updated list
        } catch (error) {
            console.error("Failed to add section", error);
            // Handle error display to user
        } finally {
            setIsAddingSection(false);
        }
    };

    const handleEditSectionClick = (e: React.MouseEvent, section: { id: string; title: string }) => {
        e.stopPropagation();
        setSectionToEdit(section);
        setIsEditSectionModalOpen(true);
    };

    const handleCloseEditSectionModal = () => {
        setIsEditSectionModalOpen(false);
        setSectionToEdit(null);
        fetchCourseDetail(courseId!); // Refetch to get updated list
    };

    const handleEditLessonClick = (lesson: { id: string; title: string; lesson_type?: string; content?: string }, sectionId: string) => {
        setLessonToEdit(lesson as { id: string; title: string; lesson_type: string; content: string });
        setCurrentSectionIdForLesson(sectionId);
        setIsEditLessonModalOpen(true);
    };

    const handleCloseEditLessonModal = () => {
        setIsEditLessonModalOpen(false);
        setLessonToEdit(null);
        setCurrentSectionIdForLesson(null);
        fetchCourseDetail(courseId!); // Refetch to get updated list
    };

    const handleDeleteSection = async (e: React.MouseEvent, sectionId: string) => {
        e.stopPropagation();
        if (!courseId || !window.confirm('Are you sure you want to delete this section and all its lessons?')) return;
        try {
            await deleteSection(courseId, sectionId);
            fetchCourseDetail(courseId); // Refetch to get updated list
        } catch (error) {
            console.error("Failed to delete section", error);
            // Handle error display to user
        }
    };

    const handleDeleteLesson = async (courseId: string, sectionId: string, lessonId: string) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) return;
        try {
            await deleteLesson(courseId, sectionId, lessonId);
            fetchCourseDetail(courseId); // Refetch to get updated list
        } catch (error) {
            console.error("Failed to delete lesson", error);
        }
    };

    const toggleSection = (sectionId: string) => {
        setOpenSection(openSection === sectionId ? null : sectionId);
    };

    if (loading && !course) { // Show fullscreen loader only on initial load
        return <LoadingSpinner fullscreen text="Loading curriculum..." />;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Curriculum for {course?.title}</h1>
                <Link to={`/dashboard/instructor/my-courses`} className="text-blue-500 hover:underline">
                    Back to My Courses
                </Link>
            </div>

            <div className="space-y-4">
                {course?.sections.map(section => (
                    <div key={section.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection(section.id)}>
                            <h2 className="text-xl font-semibold">{section.title}</h2>
                            <div className="flex items-center space-x-2">
                                <button onClick={(e) => handleEditSectionClick(e, section)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                <button onClick={(e) => handleDeleteSection(e, section.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                {openSection === section.id ? <ChevronUp /> : <ChevronDown />}
                            </div>
                        </div>

                        {openSection === section.id && (
                            <div className="mt-4 space-y-2">
                                {section.lessons.map(lesson => (
                                    <div key={lesson.id} className="flex justify-between items-center border-t pt-2">
                                        <div className="flex items-center space-x-2">
                                            <BookOpen size={16} />
                                            <span>{lesson.title}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleEditLessonClick(lesson, section.id)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteLesson(course.id, section.id, lesson.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                <AddLessonForm courseId={course.id} sectionId={section.id} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <form onSubmit={handleAddSection} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="New Section Title"
                        className="border rounded px-2 py-1 flex-grow"
                        disabled={isAddingSection}
                    />
                    <input
                        type='text'
                        value={newSectionDescription}
                        onChange={(e) => setNewSectionDescription(e.target.value)}
                        placeholder="New Section Description"
                        className="border rounded px-2 py-1 flex-grow"
                        disabled={isAddingSection}
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:bg-blue-300" disabled={isAddingSection}>
                        {isAddingSection ? 'Adding...' : 'Add Section'}
                    </button>



                </form>
            </div>

            {isEditSectionModalOpen && sectionToEdit && (
                <EditSectionModal
                    courseId={courseId!}
                    section={sectionToEdit}
                    onClose={handleCloseEditSectionModal}
                />
            )}

            {isEditLessonModalOpen && lessonToEdit && currentSectionIdForLesson && (
                <EditLessonModal
                    courseId={courseId!}
                    sectionId={currentSectionIdForLesson}
                    lesson={lessonToEdit}
                    onClose={handleCloseEditLessonModal}
                />
            )}
        </div>
    );
};

export default CurriculumPage;
