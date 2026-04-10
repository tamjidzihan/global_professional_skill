import { CreditCard, Clock, ChevronRight, Hash, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { JSX } from 'react'
import type { Payment } from '../../../../types'

interface PendingPaymentsCardProps {
    payments: Payment[]
    loading: boolean
}

export function PendingPaymentsCard({ payments, loading }: PendingPaymentsCardProps): JSX.Element {
    const pendingPayments = payments.filter(p => p.status === 'PENDING').slice(0, 3)

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 rounded-lg">
                        <CreditCard className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Pending Payments</h3>
                        <p className="text-[10px] text-gray-400 font-medium">Verify bKash transactions</p>
                    </div>
                </div>
                <Link
                    to="/dashboard/admin/payments"
                    className="text-[11px] font-bold text-[#0066CC] hover:text-[#004c99] flex items-center gap-0.5 transition-colors"
                >
                    View All
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="flex-1 p-4">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : pendingPayments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-6">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                            <Clock className="w-5 h-5 text-gray-300" />
                        </div>
                        <p className="text-xs font-bold text-gray-500">All caught up!</p>
                        <p className="text-[10px] text-gray-400">No pending payments to verify.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingPayments.map((payment) => (
                            <div
                                key={payment.id}
                                className="p-3 bg-gray-50 rounded-xl border border-transparent hover:border-amber-200 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-100 shadow-xs">
                                            {payment.user_email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold text-gray-800 truncate max-w-30">
                                                {payment.user_email}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-black text-gray-900">
                                        TK. {parseFloat(payment.amount).toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-pink-600 bg-white px-1.5 py-0.5 rounded border border-pink-50">
                                        <Hash className="w-2.5 h-2.5" />
                                        {payment.transaction_id}
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                                        <Phone className="w-2.5 h-2.5" />
                                        {payment.sender_number}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {pendingPayments.length > 0 && (
                <div className="p-4 pt-0">
                    <Link
                        to="/dashboard/admin/payments"
                        className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        Verify Payments ({payments.filter(p => p.status === 'PENDING').length})
                    </Link>
                </div>
            )}
        </div>
    )
}
