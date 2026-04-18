import React, { useEffect, useState } from 'react';
import {
    CreditCard,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    BookOpen,
    Phone,
    Hash,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    DollarSign,
    Info,
} from 'lucide-react';
import { usePayments } from '../../../../hooks/usePayments';
import type { Payment } from '../../../../types';
import SEO from '../../../components/SEO';

// ── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<string, { badge: string; iconBg: string; iconText: string; icon: typeof Clock }> = {
    COMPLETED: { badge: 'bg-emerald-50 text-emerald-700', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', icon: CheckCircle },
    PENDING: { badge: 'bg-amber-50 text-amber-700', iconBg: 'bg-amber-50', iconText: 'text-amber-500', icon: Clock },
    FAILED: { badge: 'bg-rose-50 text-rose-700', iconBg: 'bg-rose-50', iconText: 'text-rose-500', icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] || statusConfig['PENDING'];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md ${cfg.badge}`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    );
}

// ── Transaction Detail Drawer ────────────────────────────────────────────────
function PaymentDrawer({
    payment,
    onClose,
    onApprove,
    onReject,
}: {
    payment: Payment;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}) {
    const cfg = statusConfig[payment.status] || statusConfig['PENDING'];
    const Icon = cfg.icon;

    const rows = [
        { label: 'Student Email', value: payment.user_email },
        { label: 'Sender Number', value: payment.sender_number },
        { label: 'Payment Method', value: payment.payment_method },
        { label: 'Course', value: payment.course_title },
        { label: 'Amount', value: `TK. ${parseFloat(payment.amount).toLocaleString()}` },
        { label: 'Currency', value: payment.currency },
        { label: 'Submitted', value: new Date(payment.created_at).toLocaleString() },
    ];

    return (
        <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Transaction Details</p>
                        <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate max-w-60">ID: {payment.id}</p>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">

                    {/* Status */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${cfg.badge}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                            <Icon className={`w-4 h-4 ${cfg.iconText}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60">Status</p>
                            <p className="text-sm font-bold">{payment.status}</p>
                        </div>
                    </div>

                    {/* TrxID highlight */}
                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-500 mb-1">Transaction ID</p>
                        <p className="text-2xl font-black text-violet-900 font-mono tracking-widest">{payment.transaction_id}</p>
                    </div>

                    {/* Details list */}
                    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                        {rows.map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between px-4 py-3 gap-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 shrink-0">{label}</p>
                                <p className="text-xs font-semibold text-gray-700 text-right truncate">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Admin instructions */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                <Info className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-800 mb-2">Verification Instructions</p>
                                <ol className="space-y-1.5 list-decimal list-inside">
                                    {[
                                        'Login to bKash Merchant Panel / Check SMS.',
                                        'Verify the TrxID and Amount match exactly.',
                                        'Check that Sender Number matches the statement.',
                                        'Approve only if everything is 100% correct.',
                                    ].map(step => (
                                        <li key={step} className="text-xs text-amber-700 leading-snug">{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Rejection reason */}
                    {payment.status === 'FAILED' && payment.metadata?.rejection_reason && (
                        <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-rose-800">Rejection Reason</p>
                                <p className="text-xs text-rose-600 mt-0.5">{payment.metadata.rejection_reason}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="px-5 py-4 border-t border-gray-100 shrink-0 space-y-2">
                    {payment.status === 'PENDING' ? (
                        <>
                            <button
                                onClick={() => { onApprove(payment.id); onClose(); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                                <CheckCircle className="w-4 h-4" /> Approve & Enroll
                            </button>
                            <button
                                onClick={() => { onReject(payment.id); onClose(); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-100 text-sm font-semibold rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                                <XCircle className="w-4 h-4" /> Reject Payment
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
const PaymentManagementPage: React.FC = () => {
    const { payments, loading, pagination, fetchPayments, approvePayment, rejectPayment } = usePayments();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    useEffect(() => {
        fetchPayments({ status: statusFilter });
    }, [fetchPayments, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPayments({ search: searchTerm, status: statusFilter });
    };

    const handlePageChange = (url: string | null) => {
        if (url) fetchPayments({}, url);
    };

    const handleApprove = async (id: string) => {
        if (!window.confirm('Approve this payment? The student will be automatically enrolled.')) return;
        const result = await approvePayment(id);
        if (result) { setSelectedPayment(null); fetchPayments({ status: statusFilter }); }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt('Please enter a reason for rejection:');
        if (reason !== null) {
            const result = await rejectPayment(id, reason);
            if (result) { setSelectedPayment(null); fetchPayments({ status: statusFilter }); }
        }
    };

    const STATUS_TABS = [
        { value: 'PENDING', label: 'Pending' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'FAILED', label: 'Failed' },
        { value: '', label: 'All' },
    ];

    // ── shared tokens ──────────────────────────────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm';
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100';

    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title="Payment Management" />

            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Payment Management</h1>
                <p className="text-sm text-gray-400 mt-0.5">Verify and manage student course payments</p>
            </div>

            <div className="space-y-5">

                {/* ── Stats ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: Clock, label: 'Pending Verification', value: statusFilter === 'PENDING' ? pagination.count : '—', iconBg: 'bg-amber-50', iconText: 'text-amber-500' },
                        { icon: CheckCircle, label: 'Approved Today', value: '—', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
                        { icon: DollarSign, label: 'Total Revenue', value: '—', iconBg: 'bg-violet-50', iconText: 'text-violet-600' },
                    ].map(({ icon: Icon, label, value, iconBg, iconText }) => (
                        <div key={label} className={`${card} p-5 flex items-center gap-3`}>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                                <Icon className={`w-4 h-4 ${iconText}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                                <p className="text-xl font-bold text-gray-900 mt-0.5 leading-none">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Table card ── */}
                <div className={card}>

                    {/* Card header: search + filter */}
                    <div className={`${cardHeader} flex-col sm:flex-row gap-3`}>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Transactions</p>
                            <p className="text-xs text-gray-400 mt-0.5">{pagination.count ?? 0} total records</p>
                        </div>
                        <div className="flex items-center gap-2 sm:ml-auto">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="TrxID, email, course..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all w-44"
                                />
                            </form>
                            {/* Dropdown filter */}
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all cursor-pointer"
                                >
                                    {STATUS_TABS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Status tab pills */}
                    <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-100 overflow-x-auto">
                        {STATUS_TABS.map(({ value, label }) => {
                            const active = statusFilter === value;
                            const cfg = value ? statusConfig[value] : null;
                            return (
                                <button
                                    key={value}
                                    onClick={() => setStatusFilter(value)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${active
                                        ? value === ''
                                            ? 'bg-gray-900 text-white shadow-sm'
                                            : `${cfg?.badge} ring-2 ring-offset-0 shadow-sm`
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                        }`}
                                >
                                    {cfg && <cfg.icon className={`w-3 h-3 ${active ? cfg.iconText : 'text-gray-400'}`} />}
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {['Student & Course', 'Transaction', 'Status', 'Date', ''].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
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
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-14 text-center">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                                <CreditCard className="w-5 h-5 text-gray-300" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-500">No transactions found</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Try adjusting your filters or search</p>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment: Payment) => (
                                        <tr key={payment.id} className="group hover:bg-gray-50/60 transition-colors duration-100">

                                            {/* Student + Course */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div onClick={() => setSelectedPayment(payment)} className="w-9 h-9 cursor-pointer rounded-xl hover:bg-violet-100 bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0">
                                                        {payment.user_email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div onClick={() => setSelectedPayment(payment)} className="min-w-0 cursor-pointer">
                                                        <p className="text-sm font-semibold text-gray-700 hover:text-gray-900 truncate">{payment.user_email}</p>
                                                        <p className="text-xs text-gray-400 hover:text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                                                            <BookOpen className="w-3 h-3 shrink-0" />
                                                            {payment.course_title}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Transaction info */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <p className="text-sm font-bold text-gray-900">TK. {parseFloat(payment.amount).toLocaleString()}</p>
                                                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-md">
                                                        <Hash className="w-2.5 h-2.5" />{payment.transaction_id}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-md border border-gray-100">
                                                        <Phone className="w-2.5 h-2.5" />{payment.sender_number}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <StatusBadge status={payment.status} />
                                            </td>

                                            {/* Date */}
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <p className="text-xs font-medium text-gray-700">
                                                    {new Date(payment.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setSelectedPayment(payment)}
                                                        title="View Details"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    {payment.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(payment.id)}
                                                                title="Approve"
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(payment.id)}
                                                                title="Reject"
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && payments.length > 0 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                            <span className="text-xs text-gray-400">
                                {payments.length} of {pagination.count} transactions
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => handlePageChange(pagination.previous)}
                                    disabled={!pagination.previous}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.next)}
                                    disabled={!pagination.next}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Drawer */}
            {selectedPayment && (
                <PaymentDrawer
                    payment={selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
};

export default PaymentManagementPage;