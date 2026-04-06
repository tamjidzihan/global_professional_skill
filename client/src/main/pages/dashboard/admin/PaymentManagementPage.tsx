import React, { useEffect, useState } from 'react';
import { 
    CreditCard, 
    Search, 
    Filter, 
    CheckCircle, 
    XCircle, 
    Clock, 
    AlertCircle,
    User,
    BookOpen,
    Phone,
    Hash,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    Calendar,
    DollarSign,
    Info,
    ShieldCheck
} from 'lucide-react';
import { usePayments } from '../../../../hooks/usePayments';
import Breadcrumb from '../../../components/Breadcrumb';
import type { Payment } from '../../../../types';
import { cn } from '../../../../lib/utils';

const PaymentManagementPage: React.FC = () => {
    const { payments, loading, pagination, fetchPayments, approvePayment, rejectPayment } = usePayments();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchPayments({ status: statusFilter });
    }, [fetchPayments, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPayments({ search: searchTerm, status: statusFilter });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            fetchPayments({}, url);
        }
    };

    const handleApprove = async (id: string) => {
        if (window.confirm('Are you sure you want to approve this payment? The student will be automatically enrolled.')) {
            const result = await approvePayment(id);
            if (result) {
                setIsModalOpen(false);
                fetchPayments({ status: statusFilter });
            }
        }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt('Please enter a reason for rejection:');
        if (reason !== null) {
            const result = await rejectPayment(id, reason);
            if (result) {
                setIsModalOpen(false);
                fetchPayments({ status: statusFilter });
            }
        }
    };

    const openModal = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-4 h-4 mr-1.5" />;
            case 'PENDING': return <Clock className="w-4 h-4 mr-1.5" />;
            case 'FAILED': return <XCircle className="w-4 h-4 mr-1.5" />;
            default: return null;
        }
    };

    return (
        <div className="pb-10">
            <Breadcrumb 
                name="Payment Management" 
                subtitle="Verify and manage student course payments"
                icon={CreditCard}
            />

            <div className="mt-8 space-y-6">
                {/* Stats Overview (Quick Glance) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pending Verification</p>
                            <p className="text-2xl font-black text-gray-800">{statusFilter === 'PENDING' ? pagination.count : '-'}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Approved Today</p>
                            <p className="text-2xl font-black text-gray-800">DRF List</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                            <p className="text-2xl font-black text-gray-800">Stats</p>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by TrxID, Email, or Course..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none transition-all"
                        />
                    </form>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Filter className="text-gray-400 w-5 h-5" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 md:w-56 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0066CC] outline-none transition-all cursor-pointer font-medium text-gray-700"
                        >
                            <option value="PENDING">Pending Verification</option>
                            <option value="COMPLETED">Completed/Approved</option>
                            <option value="FAILED">Failed/Rejected</option>
                            <option value="">All Transactions</option>
                        </select>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Student & Course</th>
                                    <th className="px-6 py-4">Transaction Info</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC] mx-auto"></div>
                                            <p className="mt-4 text-gray-500 font-medium tracking-wide">Fetching transactions...</p>
                                        </td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <AlertCircle className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <p className="text-lg font-bold text-gray-700">No Transactions Found</p>
                                            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search term.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment: Payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0066CC] shrink-0 font-bold border border-blue-100">
                                                        {payment.user_email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-800 truncate">{payment.user_email}</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                                                            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                                                            <span className="truncate">{payment.course_title}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1.5">
                                                    <p className="text-sm font-black text-gray-900">TK. {parseFloat(payment.amount).toLocaleString()}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="inline-flex items-center text-[10px] font-bold bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded border border-pink-100">
                                                            <Hash className="w-2.5 h-2.5 mr-1" />
                                                            {payment.transaction_id}
                                                        </span>
                                                        <span className="inline-flex items-center text-[10px] font-bold bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-100">
                                                            <Phone className="w-2.5 h-2.5 mr-1 text-gray-400" />
                                                            {payment.sender_number}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border",
                                                    getStatusColor(payment.status)
                                                )}>
                                                    {getStatusIcon(payment.status)}
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-xs text-gray-500 font-medium space-y-1">
                                                    <p className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-gray-400" />
                                                        {new Date(payment.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-gray-400" />
                                                        {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openModal(payment)}
                                                        className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-[#0066CC] transition-all shadow-sm title='View Details'"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    {payment.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(payment.id)}
                                                                className="p-2.5 bg-white border border-green-100 text-green-600 rounded-xl hover:bg-green-50 transition-all shadow-sm title='Approve'"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(payment.id)}
                                                                className="p-2.5 bg-white border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-all shadow-sm title='Reject'"
                                                            >
                                                                <XCircle className="w-5 h-5" />
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

                    {/* Pagination Controls */}
                    {!loading && payments.length > 0 && (
                        <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500 font-medium">
                                Showing <span className="text-gray-900">{payments.length}</span> of <span className="text-gray-900">{pagination.count}</span> transactions
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.previous)}
                                    disabled={!pagination.previous}
                                    className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.next)}
                                    disabled={!pagination.next}
                                    className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Detail Modal */}
            {isModalOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-black text-gray-800">Transaction Details</h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide uppercase">ID: {selectedPayment.id}</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            {/* Status Banner */}
                            <div className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl border",
                                getStatusColor(selectedPayment.status)
                            )}>
                                {getStatusIcon(selectedPayment.status)}
                                <span className="font-black tracking-wide uppercase">Current Status: {selectedPayment.status}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Student Section */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        Student Information
                                    </h4>
                                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                        <p className="font-bold text-gray-800 text-lg">{selectedPayment.user_email}</p>
                                        <p className="text-xs text-gray-400 mt-1">Registered Student</p>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Sender Number</span>
                                                <span className="font-bold text-pink-600">{selectedPayment.sender_number}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Payment Method</span>
                                                <span className="font-bold text-gray-700">{selectedPayment.payment_method}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Section */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        Course Details
                                    </h4>
                                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                        <p className="font-bold text-gray-800 leading-tight">{selectedPayment.course_title}</p>
                                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Amount</span>
                                                <span className="text-xl font-black text-[#0066CC]">TK. {parseFloat(selectedPayment.amount).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Currency</span>
                                                <span className="font-bold text-gray-700">{selectedPayment.currency}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Data */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Verification Data
                                </h4>
                                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                        <div>
                                            <p className="text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">Submitted TrxID</p>
                                            <p className="text-3xl font-black text-blue-900 font-mono tracking-widest">{selectedPayment.transaction_id}</p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">Submission Date</p>
                                            <p className="font-bold text-blue-900">{new Date(selectedPayment.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason (if any) */}
                            {selectedPayment.status === 'FAILED' && selectedPayment.metadata?.rejection_reason && (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-red-800">Rejection Reason</p>
                                        <p className="text-sm text-red-700 mt-1">{selectedPayment.metadata.rejection_reason}</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-start gap-4">
                                <Info className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-900 leading-relaxed">
                                    <p className="font-bold underline decoration-amber-300 underline-offset-4 mb-2">Instructions for Admin Agent:</p>
                                    <ol className="list-decimal list-inside space-y-1 opacity-80 font-medium">
                                        <li>Login to bKash Merchant Panel / Check SMS.</li>
                                        <li>Verify the <strong>TrxID</strong> and <strong>Amount</strong> match exactly.</li>
                                        <li>Check if <strong>Sender Number</strong> matches the statement.</li>
                                        <li>Approve only if everything is 100% correct.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                            {selectedPayment.status === 'PENDING' ? (
                                <>
                                    <button
                                        onClick={() => handleApprove(selectedPayment.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        APPROVE & ENROLL
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedPayment.id)}
                                        className="flex-1 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 font-black py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        REJECT PAYMENT
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all"
                                >
                                    CLOSE VIEW
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagementPage;
