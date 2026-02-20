import { useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, PlayCircle, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEnrollments } from '../../../../hooks/useEnrollments';
import DashboardBreadcrumb from '../../../components/dashboard/DashboardBreadcrumb';

const MyEnrollmentsPage = () => {
    const { enrollments, getMyEnrollments, loading } = useEnrollments();

    useEffect(() => {
        getMyEnrollments();
    }, [getMyEnrollments]);

    const getStatusColor = (percentage: number) => {
        if (percentage === 100) return 'text-green-600 bg-green-50';
        if (percentage > 0) return 'text-blue-600 bg-blue-50';
        return 'text-gray-600 bg-gray-50';
    };

    const getStatusText = (percentage: number) => {
        if (percentage === 100) return 'Completed';
        if (percentage > 0) return 'In Progress';
        return 'Not Started';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <DashboardBreadcrumb
                name="My Learning"
                subtitle="Manage and track your enrolled courses"
                icon={BookOpen}
            />

            <div className="container mx-auto px-4 mt-8">
                {/* Search and Filter Header */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search your courses..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0066CC] bg-white text-gray-700">
                            <option value="all">All Courses</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl h-96 animate-pulse border border-gray-100 shadow-sm" />
                        ))}
                    </div>
                ) : enrollments && enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {enrollments.map((enrollment) => (
                            <div
                                key={enrollment.id}
                                className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
                            >
                                {/* Course Thumbnail Placeholder */}
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {enrollment.course.thumbnail ? (
                                        <img
                                            src={enrollment.course.thumbnail}
                                            alt={enrollment.course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-[#0066CC]/20 bg-[#0066CC]/5">
                                            <BookOpen className="w-16 h-16" />
                                        </div>
                                    )}
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(Number(enrollment.progress_percentage || 0))}`}>
                                        {getStatusText(Number(enrollment.progress_percentage || 0))}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[10px] font-bold tracking-wider text-[#76C043] uppercase bg-[#76C043]/10 px-2 py-0.5 rounded">
                                            {enrollment.course.category_name}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#0066CC] transition-colors">
                                        {enrollment.course.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 mb-6 flex items-center">
                                        <Clock className="w-4 h-4 mr-1.5" />
                                        {enrollment.course.duration_hours} hours total
                                    </p>

                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="font-medium text-gray-700">Progress</span>
                                            <span className="font-bold text-[#0066CC]">{Math.round(Number(enrollment.progress_percentage || 0))}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
                                            <div
                                                className="bg-linear-to-r from-[#0066CC] to-[#0099FF] h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                            />
                                        </div>

                                        <Link
                                            to={`/courses/${enrollment.course.id}`}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-[#0066CC] text-white rounded-xl font-bold hover:bg-[#004c99] transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                                        >
                                            {Number(enrollment.progress_percentage) === 100 ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    View Certificate
                                                </>
                                            ) : (
                                                <>
                                                    <PlayCircle className="w-5 h-5" />
                                                    {Number(enrollment.progress_percentage) > 0 ? 'Continue Learning' : 'Start Learning'}
                                                </>
                                            )}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm max-w-2xl mx-auto mt-12">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">You haven't enrolled in any courses yet</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Explore our catalog of professional courses and start your learning journey today.
                        </p>
                        <Link
                            to="/courses"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-[#76C043] text-white rounded-full font-bold hover:bg-[#65a838] transition-all shadow-lg shadow-green-100"
                        >
                            Browse All Courses
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEnrollmentsPage;
