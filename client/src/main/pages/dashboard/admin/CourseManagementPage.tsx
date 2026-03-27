import type { JSX } from 'react';
import { AdminCourseCatalog } from '../../../components/dashboard/admin/AdminCourseCatalog';
import PageTitle from '../../../components/PageTitle';

export function CourseManagementPage(): JSX.Element {
    return (
        <div className="py-6 px-4 md:px-6">
            <PageTitle title="Course Management" />
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Course Management</h1>
                <p className="text-sm text-gray-400 mt-0.5">Review, approve and manage all platform courses.</p>
            </div>
            <AdminCourseCatalog />
        </div>
    );
}