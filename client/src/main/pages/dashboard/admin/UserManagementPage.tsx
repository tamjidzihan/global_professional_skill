
import type { JSX } from 'react/jsx-runtime';
import { UsersTable } from '../../../components/dashboard/admin/UsersTable';

export function UserManagementPage(): JSX.Element {
    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                User Management
            </h1>
            <UsersTable />
        </div>
    );
}
