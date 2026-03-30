import type { JSX } from 'react';
import { CategoryTable } from '../../../components/dashboard/admin/CategoryTable';
import SEO from '../../../components/SEO';

export function CategoryManagementPage(): JSX.Element {
    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title="Category Management" noindex={true} />
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Category Management</h1>
                <p className="text-sm text-gray-400 mt-0.5">Create, update and manage course categories.</p>
            </div>
            <CategoryTable />
        </div>
    );
}
