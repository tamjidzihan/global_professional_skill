/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminCourses } from '../../../../hooks/useAdminCourses';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { TbCurrencyTaka } from "react-icons/tb";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    BookOpen,
    Users,
    Tag,
    AlertCircle,
    Download,
    Send,
    ChevronDown,
    ChevronRight,
    Video,
    FileText,
    HelpCircle,
    Briefcase,
    Link2,
    Star,
    MessageSquare,
    User,
    Mail,
    Phone,
    CalendarDays,
    Target,
    Users2,
    MapPin,
    Timer,
    Award,
} from 'lucide-react';
import SEO from '../../../components/SEO';

const AdminCourseDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        selectedCourse,
        loading,
        error,
        fetchCourseDetail,
        reviewCourseAction,
        clearSelectedCourse
    } = useAdminCourses();

    const [statusAction, setStatusAction] = useState<'APPROVED' | 'REJECTED' | 'PUBLISHED' | null>(null);
    const [feedback, setFeedback] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (id) fetchCourseDetail(id);
        return () => clearSelectedCourse();
    }, [id, fetchCourseDetail, clearSelectedCourse]);

    const toggleSection = (sectionId: string) => {
        const next = new Set(expandedSections);
        if (next.has(sectionId)) {
            next.delete(sectionId);
        } else {
            next.add(sectionId);
        }
        setExpandedSections(next);
    };

    const expandAllSections = () => {
        if (selectedCourse?.sections) setExpandedSections(new Set(selectedCourse.sections.map(s => s.id)));
    };

    const collapseAllSections = () => setExpandedSections(new Set());

    const handleStatusChange = async () => {
        if (!statusAction || !id) return;
        setActionLoading(true);
        setActionError(null);
        try {
            await reviewCourseAction(id, { status: statusAction, feedback: feedback.trim() || undefined });
            setShowStatusModal(false);
            setStatusAction(null);
            setFeedback('');
        } catch (err: any) {
            setActionError(err.response?.data?.error?.message || 'Failed to update course status');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        const map: Record<string, { bg: string; text: string; icon: any; label: string }> = {
            DRAFT: { bg: 'bg-gray-50', text: 'text-gray-600', icon: Clock, label: 'Draft' },
            PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'Pending Review' },
            APPROVED: { bg: 'bg-blue-50', text: 'text-blue-700', icon: CheckCircle, label: 'Approved' },
            REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', icon: XCircle, label: 'Rejected' },
            PUBLISHED: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Eye, label: 'Published' },
        };
        return map[status] || map['DRAFT'];
    };

    const getStatusBadge = (status: string) => {
        const c = getStatusConfig(status);
        const Icon = c.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${c.bg} ${c.text}`}>
                <Icon className="w-3.5 h-3.5" />
                {c.label}
            </span>
        );
    };

    const getDifficultyBadge = (level: string) => {
        const map: Record<string, string> = {
            BEGINNER: 'bg-emerald-50 text-emerald-700',
            INTERMEDIATE: 'bg-amber-50 text-amber-700',
            ADVANCED: 'bg-rose-50 text-rose-700',
        };
        return (
            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${map[level] || 'bg-gray-50 text-gray-600'}`}>
                {level}
            </span>
        );
    };

    const getLessonIcon = (type: string) => {
        const map: Record<string, JSX.Element> = {
            VIDEO: <Video className="w-4 h-4 text-blue-500" />,
            TEXT: <FileText className="w-4 h-4 text-emerald-500" />,
            QUIZ: <HelpCircle className="w-4 h-4 text-violet-500" />,
            ASSIGNMENT: <Briefcase className="w-4 h-4 text-amber-500" />,
            RESOURCE: <Link2 className="w-4 h-4 text-indigo-500" />,
        };
        return map[type] || <FileText className="w-4 h-4 text-gray-400" />;
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'N/A';
        const h = Math.floor(minutes / 60), m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    // ── Shared card styles ───────────────────────────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm';
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100';
    const cardBody = 'p-5';
    const sectionTitle = 'text-sm font-semibold text-gray-900';
    const sectionSub = 'text-xs text-gray-400 mt-0.5';
    const iconBox = (color: string) => `w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`;

    if (loading) return <LoadingSpinner fullscreen text="Loading course details..." />;

    if (error || !selectedCourse) {
        return (
            <div className="min-h-screen bg-gray-50/50 p-6">
                <SEO title="Course Details" noindex={true} />
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate('/dashboard/admin/courses')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Courses
                    </button>
                    <div className={`${card} p-12`}>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-6 h-6 text-rose-500" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">{error || 'Course not found'}</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                The course doesn't exist or you don't have permission to view it.
                            </p>
                            <button
                                onClick={() => navigate('/dashboard/admin/courses')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Return to Courses
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const totalLessons = selectedCourse.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0;
    const totalVideoDuration = selectedCourse.sections?.reduce((acc, s) =>
        acc + (s.lessons?.reduce((sum, l) => sum + (l.video_duration || 0), 0) || 0), 0) || 0;

    const statusModalConfig = {
        APPROVED: { title: 'Approve Course', desc: 'This course will be marked as approved and ready for publishing.' },
        REJECTED: { title: 'Reject Course', desc: 'Please provide feedback explaining why this course is being rejected.' },
        PUBLISHED: { title: 'Publish Course', desc: 'This course will be published and made available to students.' },
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <SEO title={`Course Details | ${selectedCourse.title}`} noindex={true} />

            {/* ── Status Modal ── */}
            {showStatusModal && statusAction && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`${card} max-w-md w-full`}>
                        <div className={cardHeader}>
                            <div>
                                <p className={sectionTitle}>{statusModalConfig[statusAction].title}</p>
                                <p className={sectionSub}>{statusModalConfig[statusAction].desc}</p>
                            </div>
                        </div>
                        <div className={cardBody}>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                                Feedback <span className="normal-case font-normal text-gray-400">(optional)</span>
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all resize-none"
                                placeholder="Add any notes or feedback for the instructor..."
                            />

                            {actionError && (
                                <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-rose-700">{actionError}</p>
                                </div>
                            )}

                            <div className="flex gap-2.5 mt-4">
                                <button
                                    onClick={handleStatusChange}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {actionLoading ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Updating...</span></>
                                    ) : (
                                        <><Send className="w-4 h-4" /><span>Confirm</span></>
                                    )}
                                </button>
                                <button
                                    onClick={() => { setShowStatusModal(false); setStatusAction(null); setFeedback(''); setActionError(null); }}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto p-4 md:p-6">

                {/* ── Top nav bar ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <button
                        onClick={() => navigate('/dashboard/admin/courses')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Courses
                    </button>
                    {getStatusBadge(selectedCourse.status)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* ════════════════════════════
                        LEFT COLUMN
                    ════════════════════════════ */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Course title + stats */}
                        <div className={card}>
                            <div className={cardHeader}>
                                <div>
                                    <h1 className="text-base font-semibold text-gray-900 leading-snug">{selectedCourse.title}</h1>
                                    <p className={sectionSub}>Course Overview</p>
                                </div>
                                {getDifficultyBadge(selectedCourse.difficulty_level)}
                            </div>
                            <div className={cardBody}>
                                {/* Quick meta row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                                    {[
                                        { label: 'Price', icon: TbCurrencyTaka, value: selectedCourse.is_free ? 'Free' : `৳${selectedCourse.price}`, iconColor: 'bg-emerald-50 text-emerald-600' },
                                        { label: 'Duration', icon: Timer, value: `${selectedCourse.duration_hours}h`, iconColor: 'bg-blue-50 text-blue-600' },
                                        { label: 'Category', icon: Tag, value: selectedCourse.category?.name || 'N/A', iconColor: 'bg-violet-50 text-violet-600' },
                                    ].map(({ label, icon: Icon, value, iconColor }) => (
                                        <div key={label} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                                                <p className="text-sm font-semibold text-gray-800 text-nowrap">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                                    {[
                                        { label: 'Enrollments', icon: Users, value: selectedCourse.enrollment_count || 0, iconColor: 'bg-blue-50 text-blue-600' },
                                        { label: 'Sections', icon: BookOpen, value: selectedCourse.sections?.length || 0, iconColor: 'bg-violet-50 text-violet-600' },
                                        { label: 'Lessons', icon: FileText, value: totalLessons, iconColor: 'bg-emerald-50 text-emerald-600' },
                                        { label: 'Rating', icon: Star, value: selectedCourse.average_rating || '0', iconColor: 'bg-amber-50 text-amber-600' },
                                    ].map(({ label, icon: Icon, value, iconColor }) => (
                                        <div key={label} className="bg-gray-50 rounded-lg p-3">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${iconColor}`}>
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                            <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-1">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className={card}>
                            <div className={cardHeader}>
                                <div>
                                    <p className={sectionTitle}>Course Description</p>
                                    {selectedCourse.short_description && (
                                        <p className={`${sectionSub} line-clamp-1`}>{selectedCourse.short_description}</p>
                                    )}
                                </div>
                                <div className={iconBox('bg-violet-50')}>
                                    <BookOpen className="w-4 h-4 text-violet-600" />
                                </div>
                            </div>
                            <div className={cardBody}>
                                <div className="prose prose-sm max-w-none text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: selectedCourse.description || '' }} />
                            </div>
                        </div>

                        {/* Learning outcomes */}
                        {selectedCourse.learning_outcomes && (
                            <div className={card}>
                                <div className={cardHeader}>
                                    <p className={sectionTitle}>What Students Will Learn</p>
                                    <div className={iconBox('bg-emerald-50')}>
                                        <Target className="w-4 h-4 text-emerald-600" />
                                    </div>
                                </div>
                                <div className={`${cardBody} prose prose-sm max-w-none`}
                                    dangerouslySetInnerHTML={{ __html: selectedCourse.learning_outcomes }} />
                            </div>
                        )}

                        {/* Requirements */}
                        {selectedCourse.requirements && (
                            <div className={card}>
                                <div className={cardHeader}>
                                    <p className={sectionTitle}>Requirements</p>
                                    <div className={iconBox('bg-amber-50')}>
                                        <Award className="w-4 h-4 text-amber-600" />
                                    </div>
                                </div>
                                <div className={`${cardBody} prose prose-sm max-w-none`}
                                    dangerouslySetInnerHTML={{ __html: selectedCourse.requirements }} />
                            </div>
                        )}

                        {/* Target audience */}
                        {selectedCourse.target_audience && (
                            <div className={card}>
                                <div className={cardHeader}>
                                    <p className={sectionTitle}>Target Audience</p>
                                    <div className={iconBox('bg-blue-50')}>
                                        <Users2 className="w-4 h-4 text-blue-600" />
                                    </div>
                                </div>
                                <div className={`${cardBody} prose prose-sm max-w-none`}
                                    dangerouslySetInnerHTML={{ __html: selectedCourse.target_audience }} />
                            </div>
                        )}

                        {/* Who can join */}
                        {selectedCourse.who_can_join && (
                            <div className={card}>
                                <div className={cardHeader}>
                                    <p className={sectionTitle}>Who Can Join</p>
                                </div>
                                <div className={cardBody}>
                                    <p className="text-sm text-gray-700">{selectedCourse.who_can_join}</p>
                                </div>
                            </div>
                        )}

                        {/* Schedule & venue */}
                        {(selectedCourse.schedule || selectedCourse.venue || selectedCourse.class_starts) && (
                            <div className={card}>
                                <div className={cardHeader}>
                                    <p className={sectionTitle}>Schedule & Venue</p>
                                    <div className={iconBox('bg-blue-50')}>
                                        <CalendarDays className="w-4 h-4 text-blue-600" />
                                    </div>
                                </div>
                                <div className={cardBody}>
                                    <div className="space-y-4">
                                        {selectedCourse.schedule && (
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Schedule</p>
                                                <p className="text-sm text-gray-800">{selectedCourse.schedule}</p>
                                            </div>
                                        )}
                                        {selectedCourse.venue && (
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> Venue
                                                </p>
                                                <p className="text-sm text-gray-800">{selectedCourse.venue}</p>
                                            </div>
                                        )}
                                        {selectedCourse.class_starts && (
                                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Starts</p>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {new Date(selectedCourse.class_starts).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </p>
                                                </div>
                                                {selectedCourse.admission_deadline && (
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Deadline</p>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {new Date(selectedCourse.admission_deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Curriculum */}
                        <div className={card}>
                            <div className={cardHeader}>
                                <div>
                                    <p className={sectionTitle}>Course Curriculum</p>
                                    <p className={sectionSub}>
                                        {selectedCourse.sections?.length || 0} sections · {totalLessons} lessons
                                    </p>
                                </div>
                                {selectedCourse.sections && selectedCourse.sections.length > 0 && (
                                    <div className="flex gap-2">
                                        <button onClick={expandAllSections} className="text-xs font-semibold text-violet-600 hover:text-violet-700 px-2.5 py-1 bg-violet-50 rounded-lg transition-colors cursor-pointer">
                                            Expand All
                                        </button>
                                        <button onClick={collapseAllSections} className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2.5 py-1 bg-gray-100 rounded-lg transition-colors cursor-pointer">
                                            Collapse
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className={cardBody}>
                                {!selectedCourse.sections || selectedCourse.sections.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                                            <BookOpen className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No sections added yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedCourse.sections.sort((a, b) => a.order - b.order).map((section, sIdx) => (
                                            <div key={section.id} className="border border-gray-100 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => toggleSection(section.id)}
                                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        {expandedSections.has(section.id)
                                                            ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                                            : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                                                        <div className="text-left min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                                <span className="text-gray-400 font-normal mr-1">{sIdx + 1}.</span>
                                                                {section.title}
                                                            </p>
                                                            {section.description && (
                                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{section.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-medium shrink-0 ml-3">
                                                        {section.lesson_count} lessons
                                                    </span>
                                                </button>

                                                {expandedSections.has(section.id) && (
                                                    <div className="divide-y divide-gray-100">
                                                        {section.lessons && section.lessons.length > 0
                                                            ? section.lessons.sort((a, b) => a.order - b.order).map((lesson, lIdx) => (
                                                                <div key={lesson.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                                                    <span className="text-xs text-gray-300 font-mono w-5 shrink-0 mt-0.5">{lIdx + 1}.</span>
                                                                    {getLessonIcon(lesson.lesson_type)}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-sm font-medium text-gray-800 truncate">{lesson.title}</p>
                                                                            {lesson.is_preview && (
                                                                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold shrink-0">Preview</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                                                                            <span className="capitalize">{lesson.lesson_type.toLowerCase()}</span>
                                                                            {lesson.video_duration && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Clock className="w-3 h-3" />
                                                                                    {formatDuration(lesson.video_duration)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                            : <div className="px-4 py-6 text-center text-sm text-gray-400">No lessons in this section</div>
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedCourse.sections && selectedCourse.sections.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { label: 'Total Video', value: formatDuration(totalVideoDuration) },
                                            { label: 'Avg Lessons', value: Math.round(totalLessons / selectedCourse.sections.length) },
                                            { label: 'Preview', value: selectedCourse.sections.reduce((a, s) => a + (s.lessons?.filter(l => l.is_preview).length || 0), 0) },
                                            { label: 'Last Updated', value: new Date(selectedCourse.updated_at).toLocaleDateString() },
                                        ].map(({ label, value }) => (
                                            <div key={label}>
                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                                                <p className="text-sm font-semibold text-gray-800">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reviews */}
                        {selectedCourse.reviews && selectedCourse.reviews.length > 0 && (
                            <div className={card}>
                                <div className={cardHeader}>
                                    <div>
                                        <p className={sectionTitle}>Reviews</p>
                                        <p className={sectionSub}>{selectedCourse.total_reviews} total</p>
                                    </div>
                                    <div className={iconBox('bg-amber-50')}>
                                        <MessageSquare className="w-4 h-4 text-amber-600" />
                                    </div>
                                </div>
                                <div className={cardBody}>
                                    <div className="space-y-4">
                                        {selectedCourse.reviews.slice(0, 5).map((review) => (
                                            <div key={review.id} className="group flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-bold text-gray-600">
                                                    {review.student_name?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{review.student_name}</p>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                            <span className="text-xs font-semibold text-gray-700">{review.rating}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5">{review.student_email}</p>
                                                    {review.review_text && (
                                                        <p className="text-sm text-gray-600 mt-1.5">{review.review_text}</p>
                                                    )}
                                                    <p className="text-[11px] text-gray-400 mt-1.5">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ════════════════════════════
                        RIGHT COLUMN
                    ════════════════════════════ */}
                    <div className="space-y-5">

                        {/* Status Actions */}
                        <div className={card}>
                            <div className={cardHeader}>
                                <div>
                                    <p className={sectionTitle}>Course Status</p>
                                    <p className={sectionSub}>Review and manage this course</p>
                                </div>
                                {getStatusBadge(selectedCourse.status)}
                            </div>
                            <div className={cardBody}>
                                <div className="space-y-2.5">
                                    {selectedCourse.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => { setStatusAction('APPROVED'); setShowStatusModal(true); }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Approve Course
                                            </button>
                                            <button
                                                onClick={() => { setStatusAction('REJECTED'); setShowStatusModal(true); }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-100 text-sm font-semibold rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject Course
                                            </button>
                                        </>
                                    )}
                                    {selectedCourse.status === 'APPROVED' && (
                                        <button
                                            onClick={() => { setStatusAction('PUBLISHED'); setShowStatusModal(true); }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" /> Publish Course
                                        </button>
                                    )}
                                    {(selectedCourse.status === 'PUBLISHED' || selectedCourse.status === 'APPROVED') && (
                                        <button
                                            onClick={() => { setStatusAction('REJECTED'); setShowStatusModal(true); }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {selectedCourse.status === 'PUBLISHED' ? 'Unpublish' : 'Reject'} Course
                                        </button>
                                    )}
                                </div>

                                {selectedCourse.published_at && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Published</p>
                                        <p className="text-xs text-gray-700">{new Date(selectedCourse.published_at).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instructor */}
                        <div className={card}>
                            <div className={cardHeader}>
                                <p className={sectionTitle}>Instructor</p>
                                <div className={iconBox('bg-violet-50')}>
                                    <User className="w-4 h-4 text-violet-600" />
                                </div>
                            </div>
                            <div className={cardBody}>
                                <div className="flex items-center gap-3 mb-4">
                                    {selectedCourse.instructor?.profile_picture ? (
                                        <img
                                            src={selectedCourse.instructor.profile_picture}
                                            alt={selectedCourse.instructor.full_name}
                                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                            {selectedCourse.instructor?.full_name?.charAt(0) || 'I'}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {selectedCourse.instructor?.full_name || 'Unknown Instructor'}
                                        </p>
                                        {selectedCourse.instructor?.role && (
                                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                                                <Award className="w-3 h-3" />
                                                {selectedCourse.instructor.role}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Mail className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                        <span className="truncate">{selectedCourse.instructor?.email}</span>
                                    </div>
                                    {selectedCourse.instructor?.phone_number && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Phone className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                            <span>{selectedCourse.instructor.phone_number}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedCourse.instructor?.bio && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 line-clamp-3">{selectedCourse.instructor.bio}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail */}
                        {selectedCourse.thumbnail && (
                            <div className={card}>
                                <div className={cardHeader}>
                                    <p className={sectionTitle}>Thumbnail</p>
                                </div>
                                <div className={cardBody}>
                                    <img
                                        src={selectedCourse.thumbnail}
                                        alt={selectedCourse.title}
                                        className="w-full rounded-lg border border-gray-100"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Course meta */}
                        <div className={card}>
                            <div className={cardHeader}>
                                <p className={sectionTitle}>Course Information</p>
                            </div>
                            <div className={cardBody}>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Course ID', value: selectedCourse.id, mono: true },
                                        { label: 'Slug', value: selectedCourse.slug },
                                        {
                                            label: 'Created',
                                            value: new Date(selectedCourse.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                        },
                                        {
                                            label: 'Last Updated',
                                            value: new Date(selectedCourse.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                        },
                                    ].map(({ label, value, mono }) => (
                                        <div key={label}>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                                            <p className={`text-xs text-gray-700 break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Category */}
                                {selectedCourse.category && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Category</p>
                                        <p className="text-sm font-semibold text-gray-800">{selectedCourse.category.name}</p>
                                        {selectedCourse.category.description && (
                                            <p className="text-xs text-gray-500 mt-0.5">{selectedCourse.category.description}</p>
                                        )}
                                        {selectedCourse.category.course_count > 0 && (
                                            <p className="text-xs text-violet-600 mt-1 font-medium">
                                                {selectedCourse.category.course_count} courses in category
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Capacity */}
                                {(selectedCourse.total_seats || selectedCourse.available_seats) && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Capacity</p>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Total Seats', value: selectedCourse.total_seats, color: 'text-gray-800' },
                                                { label: 'Available', value: selectedCourse.available_seats, color: 'text-emerald-700' },
                                                {
                                                    label: 'Occupancy',
                                                    value: selectedCourse.total_seats
                                                        ? `${Math.round(((selectedCourse.total_seats - (selectedCourse.available_seats || 0)) / selectedCourse.total_seats) * 100)}%`
                                                        : '0%',
                                                    color: 'text-violet-700'
                                                },
                                            ].map(({ label, value, color }) => (
                                                <div key={label} className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">{label}</span>
                                                    <span className={`text-xs font-semibold ${color}`}>{value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-3 space-y-1.5">
                                            {selectedCourse.is_full && (
                                                <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg">
                                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                    <span className="text-xs font-semibold text-amber-700">Course is full</span>
                                                </div>
                                            )}
                                            {selectedCourse.is_admission_open && (
                                                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg">
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                    <span className="text-xs font-semibold text-emerald-700">Admission is open</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Export */}
                        <div className={card}>
                            <div className={cardBody}>
                                <button
                                    disabled
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-400 text-sm font-semibold rounded-lg border border-gray-100 cursor-not-allowed"
                                >
                                    <Download className="w-4 h-4" /> Export Course Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCourseDetailPage;