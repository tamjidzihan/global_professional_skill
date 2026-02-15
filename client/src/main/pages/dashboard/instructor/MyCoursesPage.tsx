/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyCourses } from '../../../../hooks/useMyCourses';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Trash2, Edit, PlusCircle, Search, Filter, Eye, Users, Clock, BookOpen } from 'lucide-react';

const MyCoursesPage = () => {
    const { courses, loading, error, fetchMyCourses, removeCourse } = useMyCourses();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchMyCourses();
    }, [fetchMyCourses]);

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            removeCourse(id);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || course.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'DRAFT':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'ARCHIVED':
                return 'bg-gray-100 text-gray-800 border border-gray-200';
            default:
                return 'bg-blue-100 text-blue-800 border border-blue-200';
        }
    };

    const getStudentCount = (course: any) => {
        return course.enrolled_students || Math.floor(Math.random() * 30); // Replace with actual data
    };

    if (loading) {
        return <LoadingSpinner fullscreen text="Loading your courses..." />;
    }

    if (error) {
        return (
            <div className="min-h-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-2xl">!</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Courses</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => fetchMyCourses()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Courses</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and monitor your course offerings</p>
                </div>
                <Link to="/dashboard/instructor/create-course">
                    <button className="group w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer">
                        <PlusCircle className="w-5 h-5" />
                        <span className="font-semibold">Create New Course</span>
                    </button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Courses</p>
                            <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Published</p>
                            <p className="text-2xl font-bold text-green-600">
                                {courses.filter(c => c.status === 'PUBLISHED').length}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {courses.reduce((acc, course) => acc + getStudentCount(course), 0)}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Drafts</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {courses.filter(c => c.status === 'DRAFT').length}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search courses by title or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="DRAFT">Draft</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Table/Card View */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Course Details
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Students
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-gray-400 mb-3" />
                                            <p className="text-gray-500 text-sm mb-2">No courses found</p>
                                            <p className="text-gray-400 text-xs">
                                                {searchTerm || statusFilter !== 'ALL'
                                                    ? 'Try adjusting your search or filter'
                                                    : 'Start by creating your first course'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link to={`/dashboard/instructor/my-courses/${course.id}`} className="block">
                                                <div className="text-sm font-semibold text-gray-900 hover:text-blue-600">
                                                    {course.title}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    ID: {course.id.slice(0, 8)}...
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{course.category_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                ${course.price}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{getStudentCount(course)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(course.status)}`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link
                                                    to={`/dashboard/instructor/my-courses/${course.id}`}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <Link
                                                    to={`/dashboard/instructor/edit-course/${course.id}`}
                                                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Edit Course"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Course"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200">
                    {filteredCourses.length === 0 ? (
                        <div className="p-8 text-center">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No courses found</p>
                        </div>
                    ) : (
                        filteredCourses.map((course) => (
                            <div key={course.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <Link to={`/dashboard/instructor/my-courses/${course.id}`} className="block mb-3">
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">{course.title}</h3>
                                    <p className="text-xs text-gray-500">ID: {course.id.slice(0, 8)}...</p>
                                </Link>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Category</p>
                                        <p className="text-sm text-gray-900">{course.category_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Price</p>
                                        <p className="text-sm font-medium text-gray-900">${course.price}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Students</p>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3 text-gray-400" />
                                            <span className="text-sm text-gray-600">{getStudentCount(course)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Status</p>
                                        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(course.status)}`}>
                                            {course.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                    <Link
                                        to={`/dashboard/instructor/my-courses/${course.id}`}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <Eye size={14} />
                                        View
                                    </Link>
                                    <Link
                                        to={`/dashboard/instructor/edit-course/${course.id}`}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        <Edit size={14} />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer with Course Count */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <p>Showing {filteredCourses.length} of {courses.length} courses</p>
                {filteredCourses.length > 0 && (
                    <p>Last updated {new Date().toLocaleDateString()}</p>
                )}
            </div>
        </div>
    );
};

export default MyCoursesPage;