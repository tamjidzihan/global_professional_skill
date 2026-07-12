import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../../../../hooks/useCourses';
import { LoaderButton } from '../../../components/ui/LoaderButton';
import AddLessonForm from '../../../components/AddLessonForm';
import EditSectionModal from '../../../components/EditSectionModal';
import EditLessonModal from '../../../components/EditLessonModal';
import {
    Edit, Trash2, BookOpen, ChevronDown, ChevronRight,
    Plus, FolderPlus, Layers, AlertCircle, CheckCircle,
    X, Video, FileText, MonitorPlay, ArrowLeft,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { LessonSummary, Section } from '../../../../types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { extractErrorMessage } from '../../../../lib/errorUtils';
import SEO from '../../../components/SEO';

interface SectionToEdit { id: string; title: string; description?: string; order: number }
interface LessonToEdit {
    id: string; title: string; lesson_type: string;
    content?: string; video_url?: string; video_duration?: number;
    is_preview: boolean; order: number;
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        PUBLISHED: 'bg-blue-50 text-blue-700',
        DRAFT: 'bg-gray-50 text-gray-600',
        PENDING: 'bg-amber-50 text-amber-700',
        APPROVED: 'bg-emerald-50 text-emerald-700',
        REJECTED: 'bg-rose-50 text-rose-700',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-md ${map[status] || map['DRAFT']}`}>
            {status}
        </span>
    );
}

// ── Lesson type icon ──────────────────────────────────────────────────────────
function LessonIcon({ type }: { type: string }) {
    if (type === 'VIDEO') return <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    if (type === 'TEXT') return <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    return <MonitorPlay className="w-3.5 h-3.5 text-violet-500 shrink-0" />;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const CurriculumPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { course, fetchCourseDetail, addSection, removeSection, removeLesson, loading } = useCourses();

    const [openSection, setOpenSection] = useState<string | null>(null);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
    const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showAddSection, setShowAddSection] = useState(false);

    const [newSection, setNewSection] = useState({ title: '', description: '', order: 0 });
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
            return;
        }
        setIsAddingSection(true);
        try {
            await addSection(courseId, { course: courseId, title: newSection.title.trim(), description: newSection.description.trim() || undefined, order: newSection.order });
            setNewSection({ title: '', description: '', order: 0 });
            setShowAddSection(false);
            await fetchCourseDetail(courseId);
            toast.success('Section added!');
        } catch (error) {
            const msg = extractErrorMessage(error);
            const friendly = msg.includes('unique set') || msg.includes('already exists')
                ? 'A section with this order already exists. Please choose a different order.'
                : msg;
            setServerError(friendly);
            toast.error(friendly);
        } finally {
            setIsAddingSection(false);
        }
    };

    const handleEditSectionClick = (e: React.MouseEvent, section: Section) => {
        e.stopPropagation();
        setSectionToEdit({ id: section.id, title: section.title, description: section.description, order: section.order });
        setIsEditSectionModalOpen(true);
    };

    const handleCloseEditSectionModal = useCallback(async () => {
        setIsEditSectionModalOpen(false);
        setSectionToEdit(null);
        if (courseId) {
            try { await fetchCourseDetail(courseId); toast.success('Section updated!'); }
            catch { toast.error('Failed to refresh'); }
        }
    }, [courseId, fetchCourseDetail]);

    const handleEditLessonClick = (lesson: LessonSummary, sectionId: string) => {
        setLessonToEdit({ id: lesson.id, title: lesson.title, lesson_type: lesson.lesson_type, video_duration: lesson.video_duration, is_preview: lesson.is_preview, order: lesson.order, content: '', video_url: '' });
        setCurrentSectionIdForLesson(sectionId);
        setIsEditLessonModalOpen(true);
    };

    const handleCloseEditLessonModal = useCallback(async () => {
        setIsEditLessonModalOpen(false);
        setLessonToEdit(null);
        setCurrentSectionIdForLesson(null);
        if (courseId) {
            try { await fetchCourseDetail(courseId); toast.success('Lesson updated!'); }
            catch { toast.error('Failed to refresh'); }
        }
    }, [courseId, fetchCourseDetail]);

    const handleDeleteSection = async (e: React.MouseEvent, sectionId: string) => {
        e.stopPropagation();
        if (!courseId) return;
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-900">Delete this section?</p>
                <p className="text-xs text-gray-500">All lessons inside will be permanently deleted.</p>
                <div className="flex gap-2 mt-1">
                    <button onClick={() => toast.dismiss(t.id)} className="flex-1 px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Cancel</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        setDeletingSectionId(sectionId);
                        try { await removeSection(courseId, sectionId); await fetchCourseDetail(courseId); toast.success('Section deleted'); }
                        catch { toast.error('Failed to delete section'); }
                        finally { setDeletingSectionId(null); }
                    }} className="flex-1 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors">Delete</button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
        if (!courseId) return;
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-900">Delete this lesson?</p>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
                <div className="flex gap-2 mt-1">
                    <button onClick={() => toast.dismiss(t.id)} className="flex-1 px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Cancel</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        setDeletingLessonId(lessonId);
                        try { await removeLesson(courseId, sectionId, lessonId); await fetchCourseDetail(courseId); toast.success('Lesson deleted'); }
                        catch { toast.error('Failed to delete lesson'); }
                        finally { setDeletingLessonId(null); }
                    }} className="flex-1 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors">Delete</button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    // ── shared tokens ───────────────────────────────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm';
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100';
    const inputCls = 'w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all';
    const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5';

    if (loading && !course) return <LoadingSpinner fullscreen text="Loading curriculum..." />;

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
                <div className={`${card} p-10 text-center max-w-sm`}>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Error Loading Course</p>
                    <p className="text-xs text-gray-400 mb-5">The course doesn't exist or an error occurred.</p>
                    <LoaderButton variant="primary" size="md" onClick={() => navigate('/dashboard/instructor/my-courses')}>
                        Back to My Courses
                    </LoaderButton>
                </div>
            </div>
        );
    }

    const totalLessons = course.sections.reduce((a, s) => a + (s.lessons?.length || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50/50">
            <SEO title={`Manage Curriculum | ${course.title}`} noindex />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

                {/* ── Page header ── */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/dashboard/instructor/my-courses/${course.id}`)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Course Curriculum</h1>
                            <p className="text-sm text-gray-400 mt-0.5 truncate max-w-sm">{course.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(`/dashboard/instructor/my-courses/${course.id}/quizzes`)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-100 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                            Manage Course Quizzes
                        </button>
                        <StatusBadge status={course.status} />
                    </div>
                </div>

                {/* Error banner */}
                {serverError && (
                    <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="flex-1 text-xs">{serverError}</span>
                        <button onClick={() => setServerError(null)} className="text-rose-400 hover:text-rose-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    </div>
                )}

                {/* ── Stats row ── */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label: 'Sections', value: course.sections.length, iconBg: 'bg-violet-50', iconText: 'text-violet-600', icon: Layers },
                        { label: 'Lessons', value: totalLessons, iconBg: 'bg-blue-50', iconText: 'text-blue-600', icon: BookOpen },
                        { label: 'Status', value: null, iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', icon: CheckCircle },
                    ].map(({ label, value, iconBg, iconText, icon: Icon }) => (
                        <div key={label} className={`${card} p-4 flex items-center gap-3`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                                <Icon className={`w-4 h-4 ${iconText}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                                {value !== null
                                    ? <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{value}</p>
                                    : <StatusBadge status={course.status} />
                                }
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Add Section Card ── */}
                <div className={`${card} mb-5`}>
                    <button
                        onClick={() => setShowAddSection(!showAddSection)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/60 transition-colors rounded-xl cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                                <FolderPlus className="w-4 h-4 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Add New Section</p>
                                <p className="text-xs text-gray-400 mt-0.5">Create a new section to group your lessons</p>
                            </div>
                        </div>
                        {showAddSection
                            ? <ChevronDown className="w-4 h-4 text-gray-400" />
                            : <ChevronRight className="w-4 h-4 text-gray-400" />
                        }
                    </button>

                    {showAddSection && (
                        <div className="px-5 pb-5 border-t border-gray-100">
                            <form onSubmit={handleAddSection} className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className={labelCls}>Section Title <span className="text-rose-400 normal-case">*</span></label>
                                        <input
                                            type="text"
                                            value={newSection.title}
                                            onChange={e => setNewSection(p => ({ ...p, title: e.target.value }))}
                                            placeholder="e.g., Introduction to the Course"
                                            className={inputCls}
                                            disabled={isAddingSection}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Order</label>
                                        <input
                                            type="number"
                                            value={newSection.order}
                                            onChange={e => setNewSection(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                                            min="0"
                                            className={inputCls}
                                            disabled={isAddingSection}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Description <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                                    <textarea
                                        value={newSection.description}
                                        onChange={e => setNewSection(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Brief description of this section..."
                                        rows={3}
                                        className={`${inputCls} resize-none`}
                                        disabled={isAddingSection}
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2.5">
                                    <LoaderButton
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => { setNewSection({ title: '', description: '', order: 0 }); setShowAddSection(false); }}
                                        disabled={isAddingSection}
                                    >
                                        Cancel
                                    </LoaderButton>
                                    <LoaderButton
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                        icon={<Plus className="w-3.5 h-3.5" />}
                                        loading={isAddingSection}
                                        loadingText="Adding..."
                                        disabled={!newSection.title.trim()}
                                    >
                                        Add Section
                                    </LoaderButton>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* ── Sections List ── */}
                <div className={card}>
                    <div className={cardHeader}>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Course Sections</p>
                            <p className="text-xs text-gray-400 mt-0.5">{course.sections.length} section{course.sections.length !== 1 ? 's' : ''} · {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Layers className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>

                    <div className="p-4">
                        {course.sections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                                    <FolderPlus className="w-5 h-5 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-500">No sections yet</p>
                                <p className="text-xs text-gray-400 mt-0.5 mb-4">Add your first section to get started</p>
                                <LoaderButton variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAddSection(true)}>
                                    Add Section
                                </LoaderButton>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {course.sections.map((section, index) => (
                                    <div key={section.id} className="border border-gray-100 rounded-lg overflow-hidden">

                                        {/* Section header row */}
                                        <div
                                            className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                            onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                                        >
                                            {/* Index */}
                                            <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                                                {index + 1}
                                            </div>

                                            {/* Title */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{section.title}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {section.lesson_count} lesson{section.lesson_count !== 1 ? 's' : ''} · Order: {section.order}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                                <LoaderButton
                                                    size="sm"
                                                    variant="secondary"
                                                    icon={<Edit className="w-3 h-3" />}
                                                    onClick={(e) => handleEditSectionClick(e, section)}
                                                    disabled={deletingSectionId === section.id}
                                                    className="px-2.5 py-1.5"
                                                >
                                                    Edit
                                                </LoaderButton>
                                                <LoaderButton
                                                    size="sm"
                                                    variant="danger"
                                                    icon={<Trash2 className="w-3 h-3" />}
                                                    onClick={(e) => handleDeleteSection(e, section.id)}
                                                    loading={deletingSectionId === section.id}
                                                    loadingText="..."
                                                    className="px-2.5 py-1.5"
                                                >
                                                    Delete
                                                </LoaderButton>
                                            </div>

                                            {/* Chevron */}
                                            {openSection === section.id
                                                ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                                : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                                            }
                                        </div>

                                        {/* Expanded: lessons + add form */}
                                        {openSection === section.id && (
                                            <div className="bg-white px-4 py-4">
                                                {/* Lessons */}
                                                {section.lessons.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-6 text-center mb-4">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-2">
                                                            <BookOpen className="w-4 h-4 text-gray-300" />
                                                        </div>
                                                        <p className="text-xs text-gray-400">No lessons yet — add your first one below</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1.5 mb-4">
                                                        {section.lessons.map((lesson, lIdx) => (
                                                            <div
                                                                key={lesson.id}
                                                                className="group flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-white transition-all duration-150"
                                                            >
                                                                {/* Lesson number */}
                                                                <span className="text-[11px] text-gray-300 font-mono w-5 shrink-0">{lIdx + 1}.</span>

                                                                {/* Icon */}
                                                                <LessonIcon type={lesson.lesson_type} />

                                                                {/* Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 truncate">{lesson.title}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{lesson.lesson_type}</span>
                                                                        {lesson.is_preview && (
                                                                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md">Free Preview</span>
                                                                        )}
                                                                        {lesson.video_duration && (
                                                                            <span className="text-[11px] text-gray-400">{Math.floor(lesson.video_duration / 60)} min</span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                                    <LoaderButton
                                                                        size="sm"
                                                                        variant="secondary"
                                                                        icon={<Edit className="w-3 h-3" />}
                                                                        onClick={() => handleEditLessonClick(lesson, section.id)}
                                                                        disabled={deletingLessonId === lesson.id}
                                                                        className="px-2 py-1"
                                                                    >
                                                                        Edit
                                                                    </LoaderButton>
                                                                    <LoaderButton
                                                                        size="sm"
                                                                        variant="danger"
                                                                        icon={<Trash2 className="w-3 h-3" />}
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

                                                {/* Add lesson */}
                                                <div className="border-t border-gray-100 pt-4">
                                                    <AddLessonForm
                                                        courseId={course.id}
                                                        sectionId={section.id}
                                                        onSuccess={() => {
                                                            fetchCourseDetail(courseId!);
                                                            toast.success('Lesson added!');
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
                <EditSectionModal courseId={courseId} section={sectionToEdit} onClose={handleCloseEditSectionModal} />
            )}
            {isEditLessonModalOpen && lessonToEdit && currentSectionIdForLesson && courseId && (
                <EditLessonModal courseId={courseId} sectionId={currentSectionIdForLesson} lesson={lessonToEdit} onClose={handleCloseEditLessonModal} />
            )}
        </div>
    );
};

export default CurriculumPage;