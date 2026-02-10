import { useEffect } from 'react'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { BookOpen, CheckCircle, Clock, Award, Briefcase, Sparkles, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../../context/AuthContext'
import { useEnrollments } from '../../../hooks/useEnrollments'
import { useInstructorRequests } from '../../../hooks/useInstructorRequests'
import CalendarCard from '../../components/dashboard/CalendarCard'

export function StudentDashboard() {
    const { user } = useAuthContext()
    const { enrollments, getMyEnrollments, loading } = useEnrollments()
    const { requests, loading: requestsLoading, error: requestsError } = useInstructorRequests()

    useEffect(() => {
        getMyEnrollments()
    }, [getMyEnrollments])

    // Safely calculate stats
    const totalEnrolled = enrollments?.length || 0
    const completed = enrollments?.filter(
        (e) => e?.progress_percentage === 100,
    ).length || 0
    const inProgress = totalEnrolled - completed

    return (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-6"> {/* Added grid layout */}
            <div className="lg:col-span-3"> {/* Main content takes 2/3 width on large screens */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.first_name || 'Student'}!
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Here's an overview of your learning progress.
                    </p>
                </div>


                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
                    <StatsCard
                        title="Enrolled Courses"
                        value={totalEnrolled}
                        icon={BookOpen}
                        color="blue"
                    />
                    <StatsCard
                        title="In Progress"
                        value={inProgress}
                        icon={Clock}
                        color="orange"
                    />
                    <StatsCard
                        title="Completed"
                        value={completed}
                        icon={CheckCircle}
                        color="green"
                    />
                    <StatsCard
                        title="Certificates"
                        value={completed} // Assuming 1 cert per completed course
                        icon={Award}
                        color="blue"
                    />
                </div>

                {/* Recent Enrollments */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent Courses</h2>
                        <Link
                            to="/courses"
                            className="text-sm text-[#0066CC] hover:underline"
                        >
                            Browse All Courses
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                            <p className="text-gray-500">Loading your courses...</p>
                        </div>
                    ) : enrollments && enrollments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.slice(0, 3).map((enrollment) => (
                                <div
                                    key={enrollment?.id}
                                    className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="h-32 bg-gray-200 relative">
                                        {/* Placeholder for course image */}
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <BookOpen className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
                                            {enrollment?.course?.title || 'Course Title'}
                                        </h3>
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                            <span>Progress</span>
                                            <span>{Math.round(enrollment?.progress_percentage || 0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                            <div
                                                className="bg-[#76C043] h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${enrollment?.progress_percentage || 0}%`,
                                                }}
                                            />
                                        </div>
                                        <button className="w-full py-2 bg-[#0066CC] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                            Continue Learning
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">
                                No courses yet
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Start your learning journey today!
                            </p>
                            <Link
                                to="/courses"
                                className="inline-block px-6 py-2 bg-[#76C043] text-white rounded-full font-medium hover:bg-[#65a838] transition-colors"
                            >
                                Browse Courses
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <div className="lg:col-span-1"> {/* Calendar takes 1/3 width on large screens */}
                <div className=' pb-4' >
                    <CalendarCard />
                </div>
                {/* Instructor Application Status Section */}
                <div className="mb-8 p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-gray-600" /> Instructor Application Status
                        </h2>
                    </div>

                    {requestsLoading ? (
                        <p className="text-gray-600">Loading your application status...</p>
                    ) : requestsError ? (
                        <p className="text-red-600">Error: {requestsError}</p>
                    ) : (
                        (function () { // Correctly wrapped IIFE in curly braces
                            const latestRequest = requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                            if (latestRequest) {
                                let statusColor = '';
                                let statusText = '';
                                let statusIcon = null;

                                switch (latestRequest.status) {
                                    case 'PENDING':
                                        statusColor = 'bg-yellow-100 text-yellow-800';
                                        statusText = 'Pending Review';
                                        statusIcon = <Clock className="w-4 h-4" />;
                                        break;
                                    case 'APPROVED':
                                        statusColor = 'bg-green-100 text-green-800';
                                        statusText = 'Approved!';
                                        statusIcon = <CheckCircle className="w-4 h-4" />;
                                        break;
                                    case 'REJECTED':
                                        statusColor = 'bg-red-100 text-red-800';
                                        statusText = 'Rejected';
                                        statusIcon = <AlertCircle className="w-4 h-4" />;
                                        break;
                                    default:
                                        statusColor = 'bg-gray-100 text-gray-800';
                                        statusText = 'Unknown Status';
                                        break;
                                }

                                return (
                                    <div>
                                        <p className="text-gray-600 mb-2">
                                            Your latest instructor application is:
                                        </p>
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                                            {statusIcon}
                                            <span className="ml-2">{statusText}</span>
                                        </div>
                                        {latestRequest.status === 'REJECTED' && (
                                            <div className="mt-2 text-sm text-gray-500">
                                                <p>Reason: {latestRequest.review_notes || 'N/A'}</p>
                                                <Link to="/apply-as-instructor" className="text-[#0066CC] hover:underline mt-1 block">
                                                    Re-apply as Instructor
                                                </Link>
                                            </div>
                                        )}
                                        {/* More details about the request could be added here */}
                                        <p className="text-sm text-gray-500 mt-2">
                                            Submitted on: {new Date(latestRequest.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="text-center">
                                        <Sparkles className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Become an Instructor
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            Share your knowledge and earn by teaching.
                                        </p>
                                        <Link
                                            to="/apply-as-instructor"
                                            className="inline-block px-6 py-2 bg-[#0066CC] text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Apply as Instructor
                                        </Link>
                                    </div>
                                );
                            }
                        })() // Correctly wrapped IIFE closing
                    )}
                </div>


            </div>
        </div>
    )
}