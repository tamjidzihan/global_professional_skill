
import type { JSX } from 'react';
import { AdminCourseCatalog } from '../../../components/dashboard/admin/AdminCourseCatalog';
import PageTitle from '../../../components/PageTitle';

export function CourseManagementPage(): JSX.Element {
    return (
        <div className="p-4 md:p-6">
            <PageTitle title="Course Management" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Course Management
            </h1>
            <AdminCourseCatalog />
        </div>
    );
}
