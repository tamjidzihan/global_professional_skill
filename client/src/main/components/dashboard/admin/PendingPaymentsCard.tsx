import { CreditCard, CheckCircle2, ChevronRight, Hash, Phone, Tag, Copy, Check, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, type JSX } from 'react'
import { toast } from 'react-hot-toast'
import type { Payment } from '../../../../types'

interface PendingPaymentsCardProps {
    payments: Payment[]
    loading: boolean
}

export function PendingPaymentsCard({ payments, loading }: PendingPaymentsCardProps): JSX.Element {
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const pendingPayments = payments.filter(p => p.status === 'PENDING').slice(0, 4)
    const totalPendingCount = payments.filter(p => p.status === 'PENDING').length

    const handleCopyTxId = (txId: string) => {
        navigator.clipboard.writeText(txId)
        setCopiedId(txId)
        toast.success(`Copied TxID: ${txId}`, { id: 'copy-txid' })
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Pending Payments</h3>
                        <p className="text-[11px] text-gray-400">bKash manual verification queue</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
                        {totalPendingCount} pending
                    </span>
                    <Link
                        to="/dashboard/admin/payments"
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition-colors"
                    >
                        All
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-4">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : pendingPayments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-xs font-bold text-gray-800">All payments verified!</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">No pending bKash transactions in queue.</p>
                        <Link
                            to="/dashboard/admin/payments"
                            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                            <Sparkles className="w-3 h-3" />
                            View Transaction History
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
                        {pendingPayments.map((payment) => (
                            <div
                                key={payment.id}
                                className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-white transition-all duration-150 shadow-2xs group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-violet-100/80 flex items-center justify-center text-[10px] font-black text-violet-700 border border-violet-100">
                                            {payment.user_email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-900 truncate max-w-[140px]" title={payment.user_email}>
                                                {payment.user_email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {payment.metadata?.promo_code && (payment.metadata?.original_price || payment.course_price) && (
                                            <span className="text-[10px] text-gray-400 line-through font-medium mr-1.5">
                                                ৳{parseFloat(String(payment.metadata.original_price || payment.course_price)).toLocaleString()}
                                            </span>
                                        )}
                                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                            ৳{parseFloat(payment.amount).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {payment.metadata?.promo_code && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                            <Tag className="w-2.5 h-2.5 text-amber-600" />
                                            {payment.metadata.promo_code}
                                        </div>
                                    )}
                                    {payment.transaction_id && (
                                        <button
                                            onClick={() => handleCopyTxId(payment.transaction_id || '')}
                                            className="flex items-center gap-1 text-[10px] font-mono font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded border border-pink-100 transition-colors cursor-pointer"
                                            title="Click to copy Transaction ID"
                                        >
                                            <Hash className="w-2.5 h-2.5 text-pink-500" />
                                            <span>{payment.transaction_id}</span>
                                            {copiedId === payment.transaction_id ? (
                                                <Check className="w-2.5 h-2.5 text-emerald-600 ml-0.5" />
                                            ) : (
                                                <Copy className="w-2.5 h-2.5 text-pink-400 ml-0.5 opacity-60 group-hover:opacity-100" />
                                            )}
                                        </button>
                                    )}
                                    <div className="flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                        <Phone className="w-2.5 h-2.5 text-gray-400" />
                                        {payment.sender_number}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {totalPendingCount > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-100">
                    <Link
                        to="/dashboard/admin/payments"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        Verify Payments ({totalPendingCount}) →
                    </Link>
                </div>
            )}
        </div>
    )
}

