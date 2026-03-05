/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminCourses } from '../../../../hooks/useAdminCourses';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    BookOpen,
    Users,
    DollarSign,
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
import PageTitle from '../../../components/PageTitle';

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
        if (id) {
            fetchCourseDetail(id);
        }
        return () => {
            clearSelectedCourse();
        };
    }, [id, fetchCourseDetail, clearSelectedCourse]);

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const expandAllSections = () => {
        if (selectedCourse?.sections) {
            setExpandedSections(new Set(selectedCourse.sections.map(s => s.id)));
        }
    };

    const collapseAllSections = () => {
        setExpandedSections(new Set());
    };

    const handleStatusChange = async () => {
        if (!statusAction || !id) return;

        setActionLoading(true);
        setActionError(null);

        try {
            await reviewCourseAction(id, {
                status: statusAction,
                feedback: feedback.trim() || undefined
            });
            setShowStatusModal(false);
            setStatusAction(null);
            setFeedback('');
        } catch (err: any) {
            setActionError(err.response?.data?.error?.message || 'Failed to update course status');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'DRAFT': { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock, label: 'Draft' },
            'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending Review' },
            'APPROVED': { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle, label: 'Approved' },
            'REJECTED': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' },
            'PUBLISHED': { bg: 'bg-green-100', text: 'text-green-800', icon: Eye, label: 'Published' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['DRAFT'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        );
    };

    const getDifficultyColor = (level: string) => {
        switch (level) {
            case 'BEGINNER': return 'bg-green-100 text-green-800';
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
            case 'ADVANCED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getLessonIcon = (type: string) => {
        switch (type) {
            case 'VIDEO': return <Video className="w-4 h-4 text-blue-600" />;
            case 'TEXT': return <FileText className="w-4 h-4 text-green-600" />;
            case 'QUIZ': return <HelpCircle className="w-4 h-4 text-purple-600" />;
            case 'ASSIGNMENT': return <Briefcase className="w-4 h-4 text-orange-600" />;
            case 'RESOURCE': return <Link2 className="w-4 h-4 text-indigo-600" />;
            default: return <FileText className="w-4 h-4 text-gray-600" />;
        }
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    if (loading) {
        return <LoadingSpinner fullscreen text="Loading course details..." />;
    }

    if (error || !selectedCourse) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <PageTitle title={`Course Details | ${selectedCourse?.title || 'Unknown Course'}`} />
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate('/dashboard/admin/courses')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Courses</span>
                    </button>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {error || 'Course not found'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                The course you're looking for doesn't exist or you don't have permission to view it.
                            </p>
                            <button
                                onClick={() => navigate('/dashboard/admin/courses')}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Return to Courses List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const totalLessons = selectedCourse.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0;
    const totalVideoDuration = selectedCourse.sections?.reduce((acc, section) =>
        acc + (section.lessons?.reduce((sum, lesson) =>
            sum + (lesson.video_duration || 0), 0) || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Status Change Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {statusAction === 'APPROVED' && 'Approve Course'}
                                {statusAction === 'REJECTED' && 'Reject Course'}
                                {statusAction === 'PUBLISHED' && 'Publish Course'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {statusAction === 'APPROVED' && 'This course will be marked as approved and ready for publishing.'}
                                {statusAction === 'REJECTED' && 'Please provide feedback explaining why this course is being rejected.'}
                                {statusAction === 'PUBLISHED' && 'This course will be published and made available to students.'}
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Feedback (Optional)
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Add any notes or feedback for the instructor..."
                                />
                            </div>

                            {actionError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{actionError}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleStatusChange}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {actionLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Confirm</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setStatusAction(null);
                                        setFeedback('');
                                        setActionError(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto p-6">
                {/* Header with Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <button
                        onClick={() => navigate('/dashboard/admin/courses')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors w-fit cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Courses</span>
                    </button>

                    <div className="flex items-center gap-3">
                        {getStatusBadge(selectedCourse.status)}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Course Title and Basic Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedCourse.title}</h1>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Price</p>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <span className="text-lg font-semibold text-gray-900">
                                            {selectedCourse.is_free ? 'Free' : `$${selectedCourse.price}`}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                                    <div className="flex items-center gap-1">
                                        <Timer className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">{selectedCourse.duration_hours} hours</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Difficulty</p>
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedCourse.difficulty_level)}`}>
                                        {selectedCourse.difficulty_level}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Category</p>
                                    <div className="flex items-center gap-1">
                                        <Tag className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">{selectedCourse.category?.name || 'Uncategorized'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs text-gray-600">Enrollments</span>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-900">{selectedCourse.enrollment_count || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <BookOpen className="w-4 h-4 text-purple-600" />
                                        <span className="text-xs text-gray-600">Sections</span>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-900">{selectedCourse.sections?.length || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText className="w-4 h-4 text-green-600" />
                                        <span className="text-xs text-gray-600">Lessons</span>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-900">{totalLessons}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Star className="w-4 h-4 text-yellow-600" />
                                        <span className="text-xs text-gray-600">Rating</span>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-900">
                                        {selectedCourse.average_rating || '0'}
                                        <span className="text-sm text-gray-500 ml-1">({selectedCourse.total_reviews})</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Course Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-gray-500" />
                                Course Description
                            </h2>
                            <p className="text-gray-700 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: selectedCourse.description || '' }} />

                            {selectedCourse.short_description && (
                                <>
                                    <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Short Description</h3>
                                    <p className="text-gray-600">{selectedCourse.short_description}</p>
                                </>
                            )}
                        </div>

                        {/* Learning Outcomes */}
                        {selectedCourse.learning_outcomes && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-gray-500" />
                                    What Students Will Learn
                                </h2>
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: selectedCourse.learning_outcomes }}
                                />
                            </div>
                        )}

                        {/* Requirements */}
                        {selectedCourse.requirements && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-gray-500" />
                                    Requirements
                                </h2>
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: selectedCourse.requirements }}
                                />
                            </div>
                        )}

                        {/* Target Audience */}
                        {selectedCourse.target_audience && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users2 className="w-5 h-5 text-gray-500" />
                                    Target Audience
                                </h2>
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: selectedCourse.target_audience }}
                                />
                            </div>
                        )}

                        {/* Who Can Join */}
                        {selectedCourse.who_can_join && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Who Can Join</h2>
                                <p className="text-gray-700">{selectedCourse.who_can_join}</p>
                            </div>
                        )}

                        {/* Schedule and Venue */}
                        {(selectedCourse.schedule || selectedCourse.venue || selectedCourse.class_starts) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <CalendarDays className="w-5 h-5 text-gray-500" />
                                    Schedule & Venue
                                </h2>
                                <div className="space-y-4">
                                    {selectedCourse.schedule && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Schedule</p>
                                            <p className="text-gray-900">{selectedCourse.schedule}</p>
                                        </div>
                                    )}
                                    {selectedCourse.venue && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" /> Venue
                                            </p>
                                            <p className="text-gray-900">{selectedCourse.venue}</p>
                                        </div>
                                    )}
                                    {selectedCourse.class_starts && (
                                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Class Starts</p>
                                                <p className="text-gray-900 font-medium">
                                                    {new Date(selectedCourse.class_starts).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            {selectedCourse.admission_deadline && (
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Admission Deadline</p>
                                                    <p className="text-gray-900 font-medium">
                                                        {new Date(selectedCourse.admission_deadline).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Curriculum - Sections and Lessons */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-gray-500" />
                                    Course Curriculum
                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                        ({selectedCourse.sections?.length || 0} sections, {totalLessons} lessons)
                                    </span>
                                </h2>
                                {selectedCourse.sections && selectedCourse.sections.length > 0 && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={expandAllSections}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1 bg-blue-50 rounded-full cursor-pointer"
                                        >
                                            Expand All
                                        </button>
                                        <button
                                            onClick={collapseAllSections}
                                            className="text-xs text-gray-600 hover:text-gray-700 font-medium px-3 py-1 bg-gray-50 rounded-full cursor-pointer"
                                        >
                                            Collapse All
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!selectedCourse.sections || selectedCourse.sections.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">No sections added to this course yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedCourse.sections
                                        .sort((a, b) => a.order - b.order)
                                        .map((section, sectionIndex) => (
                                            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                {/* Section Header */}
                                                <button
                                                    onClick={() => toggleSection(section.id)}
                                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {expandedSections.has(section.id) ? (
                                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                                        )}
                                                        <div className="text-left">
                                                            <h3 className="font-semibold text-gray-900">
                                                                Section {sectionIndex + 1}: {section.title}
                                                            </h3>
                                                            {section.description && (
                                                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                                                    {section.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span>{section.lesson_count} lessons</span>
                                                        <span className="text-xs text-gray-400">
                                                            Created: {new Date(section.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </button>

                                                {/* Lessons List */}
                                                {expandedSections.has(section.id) && (
                                                    <div className="divide-y divide-gray-100">
                                                        {section.lessons && section.lessons.length > 0 ? (
                                                            section.lessons
                                                                .sort((a, b) => a.order - b.order)
                                                                .map((lesson, lessonIndex) => (
                                                                    <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                                        <div className="flex items-start gap-3">
                                                                            <span className="text-sm text-gray-400 font-mono w-6">
                                                                                {lessonIndex + 1}.
                                                                            </span>
                                                                            {getLessonIcon(lesson.lesson_type)}
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <h4 className="font-medium text-gray-900">
                                                                                        {lesson.title}
                                                                                    </h4>
                                                                                    {lesson.is_preview && (
                                                                                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                                                            Preview
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
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
                                                                    </div>
                                                                ))
                                                        ) : (
                                                            <div className="p-8 text-center">
                                                                <p className="text-sm text-gray-500">No lessons in this section</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Curriculum Stats */}
                            {selectedCourse.sections && selectedCourse.sections.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Total Video Content</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatDuration(totalVideoDuration)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Avg Lessons/Section</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {Math.round(totalLessons / selectedCourse.sections.length)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Preview Lessons</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedCourse.sections.reduce((acc, section) =>
                                                    acc + (section.lessons?.filter(l => l.is_preview).length || 0), 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(selectedCourse.updated_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reviews Section */}
                        {selectedCourse.reviews && selectedCourse.reviews.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-gray-500" />
                                    Reviews ({selectedCourse.total_reviews})
                                </h2>
                                <div className="space-y-4">
                                    {selectedCourse.reviews.slice(0, 5).map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-medium text-gray-900">{review.student_name}</p>
                                                    <p className="text-xs text-gray-500">{review.student_email}</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-medium text-gray-700">{review.rating}</span>
                                                </div>
                                            </div>
                                            {review.review_text && (
                                                <p className="text-sm text-gray-700">{review.review_text}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Status Actions Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Status</h2>

                            <div className="space-y-3">
                                {selectedCourse.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setStatusAction('APPROVED');
                                                setShowStatusModal(true);
                                            }}
                                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve Course
                                        </button>
                                        <button
                                            onClick={() => {
                                                setStatusAction('REJECTED');
                                                setShowStatusModal(true);
                                            }}
                                            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject Course
                                        </button>
                                    </>
                                )}

                                {selectedCourse.status === 'APPROVED' && (
                                    <button
                                        onClick={() => {
                                            setStatusAction('PUBLISHED');
                                            setShowStatusModal(true);
                                        }}
                                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Publish Course
                                    </button>
                                )}

                                {(selectedCourse.status === 'PUBLISHED' || selectedCourse.status === 'APPROVED') && (
                                    <button
                                        onClick={() => {
                                            setStatusAction('REJECTED');
                                            setShowStatusModal(true);
                                        }}
                                        className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        {selectedCourse.status === 'PUBLISHED' ? 'Unpublish' : 'Reject'} Course
                                    </button>
                                )}
                            </div>

                            {/* Status Info */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Current Status:</span>{' '}
                                    {selectedCourse.status}
                                </p>
                                {selectedCourse.published_at && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Published: {new Date(selectedCourse.published_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Instructor Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-500" />
                                Instructor
                            </h2>

                            <div className="flex items-start gap-4">
                                {selectedCourse.instructor?.profile_picture ? (
                                    <img
                                        src={selectedCourse.instructor.profile_picture}
                                        alt={selectedCourse.instructor.full_name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                                        {selectedCourse.instructor?.full_name?.charAt(0) || 'I'}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {selectedCourse.instructor?.full_name || 'Unknown Instructor'}
                                    </p>
                                    <div className="space-y-2 mt-2">
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {selectedCourse.instructor?.email}
                                        </p>
                                        {selectedCourse.instructor?.phone_number && (
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {selectedCourse.instructor.phone_number}
                                            </p>
                                        )}
                                        {selectedCourse.instructor?.role && (
                                            <p className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full inline-flex items-center gap-1">
                                                <Award className="w-3 h-3" />
                                                {selectedCourse.instructor.role}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedCourse.instructor?.bio && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-700 line-clamp-3">{selectedCourse.instructor.bio}</p>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Preview */}
                        {selectedCourse.thumbnail && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Thumbnail</h2>
                                <img
                                    src={selectedCourse.thumbnail}
                                    alt={selectedCourse.title}
                                    className="w-full rounded-lg border border-gray-200"
                                />
                            </div>
                        )}

                        {/* Course Meta Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Course ID</p>
                                    <p className="text-sm font-mono text-gray-900 break-all">{selectedCourse.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Slug</p>
                                    <p className="text-sm text-gray-900 break-all">{selectedCourse.slug}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Created</p>
                                    <p className="text-sm text-gray-900">
                                        {new Date(selectedCourse.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                    <p className="text-sm text-gray-900">
                                        {new Date(selectedCourse.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Category Details */}
                            {selectedCourse.category && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Category Details</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-900">{selectedCourse.category.name}</p>
                                        {selectedCourse.category.description && (
                                            <p className="text-xs text-gray-600">{selectedCourse.category.description}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Slug: {selectedCourse.category.slug}
                                        </p>
                                        {selectedCourse.category.course_count > 0 && (
                                            <p className="text-xs text-blue-600">
                                                {selectedCourse.category.course_count} courses in this category
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Seats Info */}
                            {(selectedCourse.total_seats || selectedCourse.available_seats) && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Capacity</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Total Seats</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedCourse.total_seats}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Available Seats</span>
                                            <span className="text-sm font-semibold text-green-600">{selectedCourse.available_seats}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Occupancy Rate</span>
                                            <span className="text-sm font-semibold text-blue-600">
                                                {selectedCourse.total_seats
                                                    ? Math.round(((selectedCourse.total_seats - (selectedCourse.available_seats || 0)) / selectedCourse.total_seats) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                        {selectedCourse.is_full && (
                                            <div className="mt-2 p-2 bg-orange-50 rounded-lg flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                                <span className="text-xs text-orange-700 font-medium">Course is full</span>
                                            </div>
                                        )}
                                        {selectedCourse.is_admission_open && (
                                            <div className="p-2 bg-green-50 rounded-lg flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-xs text-green-700 font-medium">Admission is open</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>



                        {/* Export Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <button disabled className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" />
                                Export Course Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCourseDetailPage;