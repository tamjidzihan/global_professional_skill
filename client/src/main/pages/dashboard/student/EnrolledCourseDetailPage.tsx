/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    CheckCircle,
    PlayCircle,
    Calendar,
    Award,
    MessageSquare,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    Layers,
    MapPin,
    Star,
    AlertCircle,
    FileText,
    Download,
    Megaphone,
    Link2,
} from 'lucide-react';
import { useEnrollments } from '../../../../hooks/useEnrollments';
import { useCourses } from '../../../../hooks/useCourses';
import { useCourseAnnouncements } from '../../../../hooks/useCourseAnnouncements';
import SEO from '../../../components/SEO';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function EnrolledCourseDetailPage() {
    const { id } = useParams<{ id: string }>(); // This is the COURSE ID
    const { enrollments, getMyEnrollments, loading: enrollmentsLoading } = useEnrollments();
    const { course, fetchCourseDetail, loading: courseLoading } = useCourses();
    const { announcements, fetchCourseAnnouncementsByCourse, loading: announcementsLoading } = useCourseAnnouncements();
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    useEffect(() => {
        getMyEnrollments();
        if (id) {
            fetchCourseDetail(id);
            fetchCourseAnnouncementsByCourse(id);
        }
    }, [id, getMyEnrollments, fetchCourseDetail, fetchCourseAnnouncementsByCourse]);

    // Initialize expanded sections when course data is loaded
    useEffect(() => {
        if (course?.sections && expandedSections.length === 0) {
            setExpandedSections([course.sections[0].id]);
        }
    }, [course]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    // Find the enrollment for this specific course
    const enrollment = enrollments.find(e => e.course.id === id);

    const loading = enrollmentsLoading || courseLoading;

    // Helper to truncate URL for display
    const truncateUrl = (url: string) => {
        if (!url) return '';
        return url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!course || !enrollment) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                    You are not enrolled in this course or the course does not exist.
                </p>
                <Link
                    to="/dashboard/student/my-courses"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to My Courses
                </Link>
            </div>
        );
    }

    const progress = Math.round(Number(enrollment.progress_percentage || 0));

    return (
        <div className="py-6 px-4 md:px-6 space-y-6">
            <SEO title={`Learning: ${course.title}`} noindex />

            {/* Breadcrumbs & Back */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/dashboard/student/my-courses" className="hover:text-violet-600 transition-colors">My Courses</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium truncate max-w-50 md:max-w-none">{course.title}</span>
                </div>
                <Link
                    to="/dashboard/student/my-courses"
                    className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1.5"
                >
                    <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">All Courses</span>
                </Link>
            </div>

            {/* Header Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Thumbnail */}
                    <div className="lg:w-72 h-48 lg:h-auto bg-gray-50 shrink-0">
                        {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-violet-50 text-violet-200">
                                <BookOpen className="w-16 h-16" />
                            </div>
                        )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                    {course.category?.name || 'Professional'}
                                </span>
                                {progress === 100 && (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                                        <Award className="w-3 h-3" /> Completed
                                    </span>
                                )}
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" /> {course.duration_hours}h total
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Layers className="w-4 h-4" /> {course.total_classes} classes
                                </div>
                                <div className="flex items-center gap-1.5 text-yellow-600">
                                    <Star className="w-4 h-4 fill-current" /> {parseFloat(course.average_rating).toFixed(1)} ({course.total_reviews} reviews)
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar Area */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">Course Progress</span>
                                <span className="text-sm font-bold text-violet-600">{progress}% Complete</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-violet-600 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Tabs and Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tab Navigation */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-hide">
                        {['overview', 'curriculum', 'materials', 'reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all  ${activeTab === tab
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Panels */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">About this course</h3>
                                    <div
                                        className="text-gray-600 text-sm leading-relaxed prose prose-violet max-w-none"
                                        dangerouslySetInnerHTML={{ __html: course.description }}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" /> What you'll learn
                                        </h4>
                                        <div
                                            className="text-xs text-gray-600 space-y-1 prose prose-sm"
                                            dangerouslySetInnerHTML={{ __html: course.learning_outcomes }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-amber-500" /> Requirements
                                        </h4>
                                        <div
                                            className="text-xs text-gray-600 prose prose-sm"
                                            dangerouslySetInnerHTML={{ __html: course.requirements }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'curriculum' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">Course Content</h3>
                                    <span className="text-xs text-gray-500">{course.sections.length} Modules • {course.total_classes} Lessons</span>
                                </div>

                                {course.sections.map((section, idx) => {
                                    const isExpanded = expandedSections.includes(section.id);
                                    return (
                                        <div key={section.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => toggleSection(section.id)}
                                                className="w-full bg-gray-50 px-4 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="font-bold text-sm text-gray-800 text-left line-clamp-1">{section.title}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="hidden sm:inline text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                        {section.lessons.length} Lessons
                                                    </span>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>
                                            </button>

                                            {isExpanded && (
                                                <div className="p-0 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    {section.lessons.length > 0 ? (
                                                        section.lessons.map((lesson) => (
                                                            <div key={lesson.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-50 group">
                                                                <div className="flex items-center gap-3">
                                                                    <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors shrink-0" />
                                                                    <span className="text-sm text-gray-700">{lesson.title}</span>
                                                                </div>
                                                                <button className="p-1 rounded-full hover:bg-violet-50 text-gray-300 hover:text-violet-600 transition-all shrink-0">
                                                                    <CheckCircle className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center text-sm text-gray-400">
                                                            No lessons added to this section yet.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'materials' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Course Materials</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Resources uploaded by your instructor</p>
                                    </div>
                                    <Link
                                        to={`/dashboard/student/my-courses/${course.id}/materials`}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors"
                                    >
                                        <FileText className="w-3.5 h-3.5" /> Open Materials Viewer
                                    </Link>
                                </div>

                                {course.materials && course.materials.length > 0 ? (
                                    <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                        {course.materials.map((mat) => (
                                            <div key={mat.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors bg-white">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                                                    <div className="min-w-0">
                                                        <span className="text-sm font-semibold text-gray-800 truncate block">{mat.title}</span>
                                                        <span className="text-[10px] text-gray-400 font-semibold uppercase">{mat.file_type} · {mat.file_size_formatted}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/dashboard/student/my-courses/${course.id}/materials?id=${mat.id}`}
                                                        className="text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline px-2.5 py-1 hover:bg-violet-50 rounded"
                                                    >
                                                        Preview
                                                    </Link>
                                                    {mat.file && (
                                                        <a
                                                            href={mat.file}
                                                            download
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 text-gray-400 hover:text-violet-600 rounded-full hover:bg-violet-50"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 border border-dashed border-gray-100 rounded-xl bg-gray-50/20">
                                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400 font-medium">No study materials uploaded for this course yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900">Student Reviews</h3>
                                    <button className="text-sm font-bold text-violet-600 hover:underline">Write a Review</button>
                                </div>
                                <div className="space-y-4">
                                    {course.reviews && course.reviews.length > 0 ? (
                                        course.reviews.map((rev: any) => (
                                            <div key={rev.id} className="p-4 bg-gray-50/50 rounded-xl border border-gray-50">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                                                        {rev.student_name?.[0] || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{rev.student_name}</p>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-600 italic">"{rev.review_text}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400 font-medium">No reviews yet for this course.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Sidebar */}
                <div className="space-y-6">
                    {/* Schedule & Venue Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-violet-500" /> Class Schedule
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starts On</p>
                                    <p className="text-sm font-bold text-gray-800">
                                        {course.class_starts ? new Date(course.class_starts).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'To Be Announced'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time & Routine</p>
                                    <p className="text-sm font-bold text-gray-800">{course.schedule || 'Schedule not set'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location / Venue</p>
                                    <p className="text-sm font-bold text-gray-800">{course.venue || 'Online / Link will be shared'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex flex-col gap-2">
                            <button className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" /> Contact Support
                            </button>
                        </div>
                    </div>

                    {/* ── Course Announcements ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-violet-500" /> Course Notifications
                            </h3>
                            {announcements && announcements.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-violet-50 text-violet-600 rounded-md border border-violet-100">
                                    {announcements.length} new
                                </span>
                            )}
                        </div>

                        {announcementsLoading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="animate-pulse h-16 bg-gray-50 rounded-lg border border-gray-100" />
                                ))}
                            </div>
                        ) : announcements && announcements.length > 0 ? (
                            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                {announcements.slice(0, 5).map((announcement) => (
                                    <div key={announcement.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 hover:border-violet-200 hover:bg-violet-50/20 transition-all duration-150">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{announcement.title}</p>

                                                {/* Link */}
                                                {announcement.content && (
                                                    <div className="mt-1">
                                                        <a
                                                            href={announcement.content}
                                                            target={announcement.content.startsWith('/') ? undefined : '_blank'}
                                                            rel={announcement.content.startsWith('/') ? undefined : 'noreferrer'}
                                                            className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 hover:underline transition-colors truncate max-w-full"
                                                        >
                                                            <Link2 className="w-3 h-3 shrink-0" />
                                                            <span className="truncate">{truncateUrl(announcement.content)}</span>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap shrink-0">
                                                {announcement.start_date ? new Date(announcement.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Now'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <Megaphone className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                <p className="text-xs text-gray-400 font-medium">No Course Notifications yet</p>
                                <p className="text-[10px] text-gray-300 mt-0.5">Check back for updates</p>
                            </div>
                        )}

                        {announcements && announcements.length > 5 && (
                            <Link
                                to={`/dashboard/student/announcements?course=${course.id}`}
                                className="mt-2 text-[11px] font-semibold text-violet-600 hover:text-violet-700 flex items-center justify-center gap-1 pt-2 border-t border-gray-100"
                            >
                                View all announcements <ChevronRight className="w-3 h-3" />
                            </Link>
                        )}
                    </div>

                    {/* Instructor Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Award className="w-4 h-4 text-violet-500" /> Instructor
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 border-violet-50">
                                {course.instructor.profile_picture ? (
                                    <img src={course.instructor.profile_picture} alt={course.instructor.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-lg">
                                        {course.instructor.full_name?.[0] || 'I'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm leading-tight">{course.instructor.full_name}</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Course Mentor</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 italic">
                            {course.instructor.bio || "Industry professional dedicated to sharing practical knowledge with students."}
                        </p>
                    </div>

                    {/* Support Card */}
                    <div className="bg-linear-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-violet-100">
                        <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Need Help?
                        </h3>
                        <p className="text-xs text-white/80 leading-relaxed mb-4">
                            If you have any issues with course content or technical difficulties, feel free to reach out to our academic team.
                        </p>
                        <a
                            href="mailto:support@gpibd.com"
                            className="inline-flex items-center justify-center w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all border border-white/20"
                        >
                            Email Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}