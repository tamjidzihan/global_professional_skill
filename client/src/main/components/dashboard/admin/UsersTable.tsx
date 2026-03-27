import { useEffect, useState, useRef, type JSX } from 'react';
import {
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    User as UserIcon,
    CheckCircle,
    Shield,
    BookOpen,
    XCircle,
    MoreVertical,
    Eye,
    UserCheck,
    UserX,
    Trash2,
    X,
    Mail,
    Phone,
    Calendar,
    Clock
} from 'lucide-react';
import { useUsers } from '../../../../hooks/useUsers';
import type { User } from '../../../../types';
import { api } from '../../../../lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

type FilterRole = 'ALL' | 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

const roleConfig: Record<string, { badge: string; iconColor: string; iconBg: string; icon: typeof UserIcon }> = {
    ADMIN: { badge: 'bg-violet-50 text-violet-700', iconColor: 'text-violet-600', iconBg: 'bg-violet-50', icon: Shield },
    INSTRUCTOR: { badge: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-600', iconBg: 'bg-blue-50', icon: BookOpen },
    STUDENT: { badge: 'bg-emerald-50 text-emerald-700', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', icon: UserIcon },
};

function getInitials(user: User) {
    return ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
}

function AvatarCircle({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
    const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-14 h-14 text-lg' };
    const cls = sizeMap[size];
    if (user.profile_picture) {
        return <img className={`${cls} rounded-xl object-cover border border-gray-100 shrink-0`} src={user.profile_picture} alt={user.full_name} />;
    }
    return (
        <div className={`${cls} rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center font-bold shrink-0`}>
            {getInitials(user)}
        </div>
    );
}

function RoleBadge({ role }: { role: string }) {
    const cfg = roleConfig[role] || roleConfig['STUDENT'];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md ${cfg.badge}`}>
            <Icon className={`w-3 h-3 ${cfg.iconColor}`} />
            {role}
        </span>
    );
}

// ── User Profile Drawer ──────────────────────────────────────────────────────
function UserProfileDrawer({ user, onClose, onDeactivate, onActivate, onDelete }: {
    user: User;
    onClose: () => void;
    onDeactivate: (id: string) => void;
    onActivate: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const formatDate = (d?: string | null) =>
        d ? format(new Date(d), 'MMM d, yyyy') : '—';
    const formatDateTime = (d?: string | null) =>
        d ? format(new Date(d), 'MMM d, yyyy · h:mm a') : '—';

    const meta = [
        { icon: Mail, label: 'Email', value: user.email },
        { icon: Phone, label: 'Phone', value: user.phone_number || '—' },
        { icon: Calendar, label: 'Joined', value: formatDate(user.date_joined) },
        { icon: Clock, label: 'Last Login', value: formatDateTime(user.last_login) },
    ];

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <p className="text-sm font-semibold text-gray-900">User Profile</p>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">

                    {/* Identity card */}
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                        <AvatarCircle user={user} size="lg" />
                        <div className="min-w-0">
                            <p className="text-base font-semibold text-gray-900 truncate">{user.full_name}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <RoleBadge role={user.role} />
                                {user.is_active ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md">
                                        <CheckCircle className="w-3 h-3" /> Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 text-[11px] font-bold rounded-md">
                                        <XCircle className="w-3 h-3" /> Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
                        {meta.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                                    <p className="text-xs font-medium text-gray-700 truncate mt-0.5">{value}</p>
                                </div>
                            </div>
                        ))}

                        {/* Email verified */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Email Verified</p>
                                <div className="mt-0.5">
                                    {user.email_verified ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                            <CheckCircle className="w-3 h-3" /> Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                                            <XCircle className="w-3 h-3" /> Not verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Bio</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{user.bio}</p>
                        </div>
                    )}

                    {/* Account ID */}
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">User ID</p>
                        <p className="text-[11px] font-mono text-gray-500 break-all">{user.id}</p>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="px-5 py-4 border-t border-gray-100 shrink-0 space-y-2">
                    {user.is_active ? (
                        <button
                            onClick={() => { onDeactivate(user.id); onClose(); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-100 text-sm font-semibold rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                            <UserX className="w-4 h-4" /> Deactivate User
                        </button>
                    ) : (
                        <button
                            onClick={() => { onActivate(user.id); onClose(); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                            <UserCheck className="w-4 h-4" /> Activate User
                        </button>
                    )}
                    <button
                        onClick={() => { onDelete(user.id); onClose(); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-100 text-sm font-semibold rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" /> Delete User
                    </button>
                </div>
            </div>
        </>
    );
}

// ── Action Dropdown ──────────────────────────────────────────────────────────
function ActionDropdown({ user, onViewProfile, onDeactivate, onActivate, onDelete }: {
    user: User;
    onViewProfile: () => void;
    onDeactivate: (id: string) => void;
    onActivate: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const items = [
        {
            label: 'View Profile',
            icon: Eye,
            onClick: () => { onViewProfile(); setOpen(false); },
            cls: 'text-gray-700 hover:bg-gray-50',
        },
        user.is_active
            ? { label: 'Deactivate', icon: UserX, onClick: () => { onDeactivate(user.id); setOpen(false); }, cls: 'text-amber-700 hover:bg-amber-50' }
            : { label: 'Activate', icon: UserCheck, onClick: () => { onActivate(user.id); setOpen(false); }, cls: 'text-emerald-700 hover:bg-emerald-50' },
        {
            label: 'Delete User',
            icon: Trash2,
            onClick: () => { onDelete(user.id); setOpen(false); },
            cls: 'text-rose-600 hover:bg-rose-50',
        },
    ];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-xl z-30 overflow-hidden py-1">
                    {items.map(({ label, icon: Icon, onClick, cls }) => (
                        <button
                            key={label}
                            onClick={onClick}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${cls}`}
                        >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Table ───────────────────────────────────────────────────────────────
export function UsersTable(): JSX.Element {
    const { users, fetchUsers, loading, totalCount, nextPage, prevPage, loadNextPage, loadPrevPage } = useUsers();
    const [filterRole, setFilterRole] = useState<FilterRole>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleDeactivate = async (userId: string) => {
        if (!window.confirm('Deactivate this user?')) return;
        try { await api.post(`/accounts/users/${userId}/deactivate/`); toast.success('User deactivated'); fetchUsers(); }
        catch { toast.error('Failed to deactivate user'); }
    };

    const handleActivate = async (userId: string) => {
        if (!window.confirm('Activate this user?')) return;
        try { await api.post(`/accounts/users/${userId}/activate/`); toast.success('User activated'); fetchUsers(); }
        catch { toast.error('Failed to activate user'); }
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm('Permanently delete this user?')) return;
        try { await api.delete(`/accounts/users/${userId}/`); toast.success('User deleted'); fetchUsers(); }
        catch { toast.error('Failed to delete user'); }
    };

    const filteredUsers = users.filter((user: User) => {
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        const matchesSearch = !searchQuery || [user.full_name, user.email].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesRole && matchesSearch;
    });

    const ROLE_TABS: FilterRole[] = ['ALL', 'STUDENT', 'INSTRUCTOR', 'ADMIN'];

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

                {/* ── Card header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">User List</p>
                        <p className="text-xs text-gray-400 mt-0.5">{totalCount} total users</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44"
                            />
                        </div>

                        {/* Role filter */}
                        <div className="relative">
                            <select
                                value={filterRole}
                                onChange={e => setFilterRole(e.target.value as FilterRole)}
                                className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                            >
                                {ROLE_TABS.map(r => <option key={r} value={r}>{r === 'ALL' ? 'All Roles' : r}</option>)}
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* ── Role tab pills ── */}
                <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-100 overflow-x-auto">
                    {ROLE_TABS.map(role => {
                        const active = filterRole === role;
                        const cfg = role === 'ALL' ? null : roleConfig[role];
                        return (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${active
                                    ? role === 'ALL'
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : `${cfg?.badge} ring-2 ring-offset-0 shadow-sm`
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100'
                                    }`}
                            >
                                {cfg && <cfg.icon className={`w-3 h-3 ${active ? cfg.iconColor : 'text-gray-400'}`} />}
                                {role}
                            </button>
                        );
                    })}
                </div>

                {/* ── Table ── */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {['User', 'Phone', 'Role', 'Verified', 'Status', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-5 py-3">
                                            <div className="animate-pulse h-10 bg-gray-50 rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr
                                        key={user.id}
                                        className="group hover:bg-gray-50/60 transition-colors duration-100"
                                    >
                                        {/* User */}
                                        <td
                                            className="px-5 py-3 whitespace-nowrap"
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <div className="flex items-center gap-3 cursor-pointer ">
                                                <AvatarCircle user={user} size="md" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{user.full_name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Phone */}
                                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {user.phone_number || '—'}
                                        </td>

                                        {/* Role */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <RoleBadge role={user.role} />
                                        </td>

                                        {/* Email verified */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            {user.email_verified ? (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                    </div>
                                                    <span className="text-xs font-medium text-emerald-700">Verified</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
                                                        <XCircle className="w-3.5 h-3.5 text-amber-500" />
                                                    </div>
                                                    <span className="text-xs font-medium text-amber-600">Pending</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Active status */}
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md ${user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3 whitespace-nowrap text-right">
                                            <ActionDropdown
                                                user={user}
                                                onViewProfile={() => setSelectedUser(user)}
                                                onDeactivate={handleDeactivate}
                                                onActivate={handleActivate}
                                                onDelete={handleDelete}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-14 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <UserIcon className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No users found</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Try adjusting your search or filter</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {(nextPage || prevPage) && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <button
                            onClick={loadPrevPage}
                            disabled={!prevPage}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" /> Previous
                        </button>
                        <span className="text-xs text-gray-400">
                            {filteredUsers.length} of {totalCount} users
                        </span>
                        <button
                            onClick={loadNextPage}
                            disabled={!nextPage}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* ── Profile drawer ── */}
            {selectedUser && (
                <UserProfileDrawer
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onDeactivate={handleDeactivate}
                    onActivate={handleActivate}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
}