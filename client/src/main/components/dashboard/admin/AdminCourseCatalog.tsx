
import { useEffect, useState, type JSX } from 'react';
import {
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    CheckCircle,
    XCircle,
    Clock,
    Edit,
    MoreVertical
} from 'lucide-react';
import { useAdminCourses } from '../../../../hooks/useAdminCourses';
import type { CoursesSummary } from '../../../../types';
import { Link } from 'react-router-dom';

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'DRAFT';

export function AdminCourseCatalog(): JSX.Element {
    const {
        courses,
        fetchCourses,
        loading,
        totalCount,
        nextPage,
        prevPage,
        loadNextPage,
        loadPrevPage,
    } = useAdminCourses();

    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        fetchCourses(filterStatus);
    }, [fetchCourses, filterStatus]);

    const handleStatusFilter = (status: FilterStatus): void => {
        setFilterStatus(status);
        fetchCourses(status);
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Implement search functionality
        console.log('Search query:', searchQuery);
    };

    const getStatusIcon = (status: string): JSX.Element => {
        switch (status) {
            case 'APPROVED':
            case 'PUBLISHED':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'REJECTED':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'PENDING':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            default: // DRAFT
                return <Edit className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'APPROVED': return 'bg-green-50 text-green-800 border-green-200';
            case 'PUBLISHED': return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'REJECTED': return 'bg-red-50 text-red-800 border-red-200';
            case 'PENDING': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            case 'DRAFT':
            default:
                return 'bg-gray-50 text-gray-800 border-gray-200';
        }
    };

    const getStatusBadge = (status: string): JSX.Element => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} border`}>
            {getStatusIcon(status)}
            <span className="ml-1.5">{status}</span>
        </span>
    );

    const filteredCourses = courses.filter((course: CoursesSummary) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                course.title?.toLowerCase().includes(query) ||
                course.instructor_name?.toLowerCase().includes(query) ||
                course.category_name?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Course Catalog</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage all courses in the system.</p>
                </div>
                <div className="flex items-center gap-2">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
                        />
                    </form>
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => handleStatusFilter(e.target.value as FilterStatus)}
                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10"><div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mx-auto"></div></td></tr>
                        ) : filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 h-12 w-12 ">
                                                {course.thumbnail ? (
                                                    <img className="h-12 w-12 rounded-full object-cover" src={course.thumbnail} alt={course.title} />
                                                ) : (
                                                    <div className="text-center rounded-full text-white relative z-10 bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 ">
                                                        <div className="h-12 w-12 rounded-full  bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform ">
                                                            <BookOpen className="w-8 h-8" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4 cursor-pointer ">
                                                <Link to={`/dashboard/admin/courses/${course.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">{course.title}</Link>
                                                <div className="text-sm text-gray-500 hover:text-blue-600">{course.category_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.instructor_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(course.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">                                            <span className='font-extrabold'>৳</span> {course.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="relative inline-block text-left">
                                            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                            {/* Dropdown for actions */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10">
                                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">No courses found for the selected filter.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {(nextPage || prevPage) && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={loadPrevPage}
                        disabled={!prevPage}
                        className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Showing {filteredCourses.length} of {totalCount}
                    </span>
                    <button
                        onClick={loadNextPage}
                        disabled={!nextPage}
                        className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            )}
        </div>
    );
}
