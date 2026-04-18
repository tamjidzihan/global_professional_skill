import { useEffect, useState } from 'react';
import {
    BookOpen,
    CheckCircle,
    Clock,
    Search,
    PlayCircle,
    Layers,
    AlertCircle
} from 'lucide-react';
import { useCourses } from '../../../../hooks/useCourses';
import { useMyCourses } from '../../../../hooks/useMyCourses';
import SEO from '../../../components/SEO';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function CourseProgressPage() {
    const { course, fetchCourseDetail, toggleLessonProgress } = useCourses();
    const { courses, fetchMyCourses, loading: coursesLoading } = useMyCourses();
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fetch ONLY instructor's courses
        fetchMyCourses({ status: 'PUBLISHED' });
    }, [fetchMyCourses]);

    useEffect(() => {
        if (selectedCourseId) {
            fetchCourseDetail(selectedCourseId);
        }
    }, [selectedCourseId, fetchCourseDetail]);

    // Filter online courses
    const onlineCourses = courses.filter(c => c.delivery_mode === 'ONLINE' || c.delivery_mode === 'BOTH');

    const handleToggle = async (sectionId: string, lessonId: string) => {
        if (selectedCourseId) {
            await toggleLessonProgress(selectedCourseId, sectionId, lessonId);
            // Re-fetch detail to get updated total progress calculation from server
            fetchCourseDetail(selectedCourseId);
        }
    };

    if (coursesLoading && !selectedCourseId) {
        return (
            <div className="min-h-100 flex items-center justify-center">
                <LoadingSpinner size={40} />
            </div>
        );
    }

    return (
        <div className="py-6 px-4 md:px-6 space-y-6">
            <SEO title="Course Progress Management" noindex />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Course Progress</h1>
                    <p className="text-sm text-gray-500">Update completion status for online classes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Course List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5" /> Select Course
                            </h2>
                        </div>
                        <div className="max-h-125 overflow-y-auto scrollbar-hide">
                            {onlineCourses.length > 0 ? (
                                onlineCourses.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCourseId(c.id)}
                                        className={`w-full text-left p-4 border-b last:border-b-0 border-gray-50 transition-colors ${selectedCourseId === c.id
                                            ? 'bg-violet-50 border-l-4 border-l-violet-600'
                                            : 'hover:bg-gray-50 cursor-pointer'
                                            }`}
                                    >
                                        <p className={`text-sm font-bold truncate ${selectedCourseId === c.id ? 'text-violet-700' : 'text-gray-700'}`}>
                                            {c.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-gray-400">{c.total_classes} Classes</span>
                                            <span className="text-[10px] text-gray-400">•</span>
                                            <span className="text-[10px] text-gray-400">{c.enrollment_count} Students</span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                    <p className="text-xs text-gray-400">No active online courses found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Table */}
                <div className="lg:col-span-3">
                    {selectedCourseId && course ? (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{course.title}</h2>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                        <Layers className="w-3.5 h-3.5" /> {course.sections.length} Sections • {course.total_classes} Total Classes
                                    </p>
                                </div>
                                <div className="relative shrink-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search lessons..."
                                        className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none w-full md:w-64"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                            <th className="px-6 py-4">#</th>
                                            <th className="px-6 py-4">Class / Lesson Title</th>
                                            <th className="px-6 py-4">Section</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {course.sections.flatMap((section) =>
                                            section.lessons
                                                .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .map((lesson, lIdx) => (
                                                    <tr key={lesson.id} className="hover:bg-gray-50/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-mono text-gray-400">{lIdx + 1}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${lesson.is_completed ? 'bg-emerald-50 text-emerald-600' : 'bg-violet-50 text-violet-600'}`}>
                                                                    <PlayCircle className="w-4 h-4" />
                                                                </div>
                                                                <span className="text-sm font-semibold text-gray-700">{lesson.title}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase truncate block max-w-30">
                                                                {section.title}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {lesson.is_completed ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                                                    <CheckCircle className="w-3 h-3" /> COMPLETED
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                                                                    <Clock className="w-3 h-3" /> PENDING
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    className="sr-only peer"
                                                                    checked={lesson.is_completed}
                                                                    onChange={() => handleToggle(section.id, lesson.id)}
                                                                />
                                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Footer */}
                            <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-6">
                                        {(() => {
                                            const totalLessons = course.sections.reduce((a, s) => a + (s.lessons?.length || 0), 0) || 0;
                                            const completedLessons = course.sections.reduce(
                                                (acc, s) => acc + s.lessons.filter(l => l.is_completed).length,
                                                0
                                            );
                                            const progressPercent = totalLessons > 0
                                                ? Math.round((completedLessons / totalLessons) * 100)
                                                : 0;

                                            return (
                                                <>
                                                    <div className="text-center md:text-left">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed</p>
                                                        <p className="text-lg font-bold text-emerald-600">
                                                            {completedLessons} / {totalLessons} Lessons
                                                        </p>
                                                    </div>
                                                    <div className="h-8 w-px bg-gray-200" />
                                                    <div className="text-center md:text-left">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overall Progress</p>
                                                        <p className="text-lg font-bold text-violet-600">
                                                            {progressPercent}%
                                                        </p>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <p className="text-[10px] text-gray-400 max-w-xs md:text-right">
                                        Note: Progress is calculated based on the total number of completed lessons.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-100">
                            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-400 mb-4">
                                <PlayCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No Course Selected</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                                Please select an online course from the sidebar to manage its class progress.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
