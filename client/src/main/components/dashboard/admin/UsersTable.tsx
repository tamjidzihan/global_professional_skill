
import { useEffect, useState, type JSX } from 'react';
import {
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    User as UserIcon,
    MoreVertical,
    CheckCircle,
    Shield,
    Book,
    XCircle,
} from 'lucide-react';
import { useUsers } from '../../../../hooks/useUsers';
import type { User } from '../../../../types';

type FilterRole = 'ALL' | 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export function UsersTable(): JSX.Element {
    const {
        users,
        fetchUsers,
        loading,
        totalCount,
        nextPage,
        prevPage,
        loadNextPage,
        loadPrevPage,
    } = useUsers();

    const [filterRole, setFilterRole] = useState<FilterRole>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleFilter = (role: FilterRole): void => {
        setFilterRole(role);
        // Implement role filtering in useUsers hook
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Implement search functionality in useUsers hook
        console.log('Search query:', searchQuery);
    };

    const getRoleIcon = (role: string): JSX.Element => {
        switch (role) {
            case 'ADMIN':
                return <Shield className="w-4 h-4 text-red-500" />;
            case 'INSTRUCTOR':
                return <Book className="w-4 h-4 text-blue-500" />;
            case 'STUDENT':
            default:
                return <UserIcon className="w-4 h-4 text-green-500" />;
        }
    };

    const getRoleColor = (role: string): string => {
        switch (role) {
            case 'ADMIN': return 'bg-red-50 text-red-800 border-red-200';
            case 'INSTRUCTOR': return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'STUDENT':
            default:
                return 'bg-green-50 text-green-800 border-green-200';
        }
    };

    const getRoleBadge = (role: string): JSX.Element => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role)} border`}>
            {getRoleIcon(role)}
            <span className="ml-1.5">{role}</span>
        </span>
    );

    const filteredUsers = users.filter((user: User) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                user.full_name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query)
            );
        }
        if (filterRole !== 'ALL' && user.role !== filterRole) {
            return false;
        }
        return true;
    });

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">User List</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage all users in the system.</p>
                </div>
                <div className="flex items-center gap-2">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
                        />
                    </form>
                    <div className="relative">
                        <select
                            value={filterRole}
                            onChange={(e) => handleRoleFilter(e.target.value as FilterRole)}
                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="STUDENT">Student</option>
                            <option value="INSTRUCTOR">Instructor</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Verified</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10"><div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mx-auto"></div></td></tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.profile_picture || '/placeholder.svg'} alt={user.full_name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.email_verified ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                    </td>
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
                                    <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">No users found.</p>
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
                        Showing {filteredUsers.length} of {totalCount}
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
