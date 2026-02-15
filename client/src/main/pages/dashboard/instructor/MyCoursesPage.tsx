import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMyCourses } from '../../../../hooks/useMyCourses';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Trash2, Edit, PlusCircle } from 'lucide-react';

const MyCoursesPage = () => {
    const { courses, loading, error, fetchMyCourses, removeCourse } = useMyCourses();

    useEffect(() => {
        fetchMyCourses();
    }, [fetchMyCourses]);

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            removeCourse(id);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Courses</h1>
                <Link to="/dashboard/instructor/create-course">
                    <button className="group w-full flex items-center gap-3 px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer">
                        <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-200">
                            <PlusCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="font-semibold">Create New Course</div>
                        </div>
                        <span className="text-blue-200 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </button>
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {courses.map((course) => (
                            <tr key={course.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{course.category_name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">${course.price}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {course.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/dashboard/edit-course/${course.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <Edit size={18} />
                                    </Link>
                                    <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyCoursesPage;
