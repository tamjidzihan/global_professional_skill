import type { JSX } from 'react/jsx-runtime';
import { UsersTable } from '../../../components/dashboard/admin/UsersTable';
import SEO from '../../../components/SEO';

export function UserManagementPage(): JSX.Element {
    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title="User Management" noindex={true} />
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">User Management</h1>
                <p className="text-sm text-gray-400 mt-0.5">View, manage and moderate all platform users.</p>
            </div>
            <UsersTable />
        </div>
    );
}