import { BookOpen, Clock, Tag } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

// ── Pending Payment Card ──────────────────────────────────────────────────────
function PendingPaymentCard({ payment }: { payment: any }) {
    const promoCode = payment.metadata?.promo_code;
    const originalPrice = payment.metadata?.original_price || payment.course_price;
    const discountPercentage = payment.metadata?.discount_percentage;

    return (
        <div className="bg-white rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group relative">
            {/* Thumbnail */}
            <div className="h-40 bg-gray-50 relative overflow-hidden shrink-0">
                {payment.course_thumbnail ? (
                    <img
                        src={payment.course_thumbnail}
                        alt={payment.course_title}
                        className="w-full h-full object-cover opacity-60 grayscale-50"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-yellow-50">
                        <BookOpen className="w-10 h-10 text-yellow-200" />
                    </div>
                )}
                {/* Status badge overlay */}
                <div className="absolute top-3 left-3">
                    <StatusBadge status="PENDING" />
                </div>
                <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                    <Clock className="w-12 h-12 text-yellow-600 opacity-40 animate-pulse" />
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-yellow-600">
                    Payment Verification
                </span>

                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                    {payment.course_title}
                </h3>

                <div className="space-y-2 py-2 border-y border-gray-50 my-1">
                    {promoCode && (
                        <div className="flex items-center justify-between text-[11px] text-amber-800 bg-amber-50/80 px-2 py-1 rounded-md border border-amber-100">
                            <span className="font-semibold flex items-center gap-1">
                                <Tag className="w-3 h-3 text-amber-600" /> Promo Code:
                            </span>
                            <span className="font-bold font-mono">
                                {promoCode} {discountPercentage ? `(-${parseFloat(String(discountPercentage))}%)` : ''}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Amount Paid:</span>
                        <div className="flex items-center gap-1.5">
                            {promoCode && originalPrice && (
                                <span className="line-through text-gray-400 text-[10px]">
                                    TK. {parseFloat(String(originalPrice)).toLocaleString()}
                                </span>
                            )}
                            <span className="font-bold text-gray-700">{payment.currency} {parseFloat(payment.amount).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Method:</span>
                        <span className="text-gray-700">{payment.payment_method}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>TrxID:</span>
                        <span className="font-mono text-gray-700">{payment.transaction_id}</span>
                    </div>
                </div>

                <div className="p-2.5 bg-yellow-50/50 rounded-lg text-[10px] text-yellow-800 border border-yellow-100/50 leading-relaxed italic">
                    Our team is currently verifying your payment details. You will gain full access to the course content as soon as the verification is complete.
                </div>

                <button
                    disabled
                    className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                    <Clock className="w-3.5 h-3.5" /> Awaiting Approval
                </button>
            </div>
        </div>
    );
}


export default PendingPaymentCard;
