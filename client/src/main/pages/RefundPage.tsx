import React from 'react';
import {
    RefreshCw,
    CheckCircle2,
    CreditCard,
    Smartphone,
    HelpCircle,
    Mail,
    ShieldCheck,
    Percent,
} from 'lucide-react';
import { LegalLayout, type TocItem } from '../components/LegalLayout';

const tocItems: TocItem[] = [
    { id: 'guarantee', title: '1. 7-Day Money-Back Guarantee Overview' },
    { id: 'eligibility', title: '2. Refund Eligibility Conditions' },
    { id: 'course-types', title: '3. Policies by Course & Program Type' },
    { id: 'non-refundable', title: '4. Non-Refundable Circumstances' },
    { id: 'exchange-option', title: '5. Course Exchange & Wallet Credits' },
    { id: 'how-to-request', title: '6. Step-by-Step: How to Request a Refund' },
    { id: 'timelines-methods', title: '7. Processing Timelines & Payout Methods' },
    { id: 'payment-gateway-fees', title: '8. Payment Gateway Fees & Deductions' },
    { id: 'abuse-prevention', title: '9. Anti-Abuse & Chargeback Policy' },
    { id: 'contact-billing', title: '10. Contact Billing & Support' },
];

export const RefundPage: React.FC = () => {
    return (
        <LegalLayout
            title="Refund Policy"
            subtitle="Transparent guidelines regarding our 7-day course satisfaction guarantee, eligibility rules, processing timelines, and payout methods."
            lastUpdated="September 2026"
            effectiveDate="January 1, 2026"
            version="2.3"
            readTime="6 min read"
            icon={RefreshCw}
            tocItems={tocItems}
        >
            {/* Guarantee Highlight Banner */}
            <div className="not-prose bg-linear-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Percent className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-emerald-950 mb-1">
                            100% Student Satisfaction Guarantee (7 Days)
                        </h4>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                            We stand behind the quality of our curriculum. If a recorded self-paced course doesn't meet your learning expectations, you can request a full refund within <strong>7 calendar days</strong> of purchase, provided you have watched less than 20% of the lessons.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 1 */}
            <section id="guarantee" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    1. 7-Day Money-Back Guarantee Overview
                </h2>
                <p>
                    At <strong>Global Professional Skill (GPI)</strong>, we want to ensure you are thoroughly satisfied with your learning investment. We provide a straightforward, transparent refund policy for all qualifying digital course enrollments.
                </p>
                <p>
                    All refund requests are evaluated fairly in accordance with the objective progress tracking criteria detailed below.
                </p>
            </section>

            {/* Section 2 */}
            <section id="eligibility" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    2. Refund Eligibility Conditions
                </h2>
                <p>
                    To qualify for a refund on a standard self-paced online course, all of the following conditions must be satisfied:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose my-4 text-xs">
                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-emerald-950 block mb-0.5">Timeframe Limit</strong>
                            <p className="text-emerald-800">Submitted within 7 calendar days (168 hours) from the exact purchase timestamp.</p>
                        </div>
                    </div>

                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-emerald-950 block mb-0.5">Progress Limit</strong>
                            <p className="text-emerald-800">Total course video watch progress is less than 20% of the full curriculum.</p>
                        </div>
                    </div>

                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-emerald-950 block mb-0.5">No Certificate Issued</strong>
                            <p className="text-emerald-800">No course completion certificate has been claimed or generated.</p>
                        </div>
                    </div>

                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-emerald-950 block mb-0.5">Original Purchase</strong>
                            <p className="text-emerald-800">The course was purchased directly via gpibd.com through our official checkout.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3 */}
            <section id="course-types" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    3. Policies by Course & Program Type
                </h2>
                <div className="space-y-4 not-prose my-4 text-xs">
                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
                        <h4 className="font-bold text-sm text-gray-900 mb-1">A. Self-Paced Video Courses</h4>
                        <p className="text-gray-600 leading-relaxed">
                            Eligible for 100% refund within 7 days if &lt;20% consumed and no certificate generated.
                        </p>
                    </div>

                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
                        <h4 className="font-bold text-sm text-gray-900 mb-1">B. Live Interactive Bootcamps & Workshops</h4>
                        <p className="text-gray-600 leading-relaxed">
                            Due to seat limitations and instructor reservations, full refunds are available up to <strong>48 hours before the first scheduled live class</strong>. Once the cohort commences, only prorated wallet credit transfers to future batches may be granted at management discretion.
                        </p>
                    </div>

                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
                        <h4 className="font-bold text-sm text-gray-900 mb-1">C. Standalone Downloadable Resources & Source Code</h4>
                        <p className="text-gray-600 leading-relaxed">
                            Individual digital assets, downloadable project files, templates, or e-books are non-refundable once the download link has been accessed.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 4 */}
            <section id="non-refundable" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    4. Non-Refundable Circumstances
                </h2>
                <p>A refund request will be declined under the following circumstances:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                    <li>The request is submitted after the 7-day guarantee window has elapsed.</li>
                    <li>More than 20% of the course lectures have been streamed or marked completed.</li>
                    <li>The student has attempted quizzes or earned a verifiable certificate of completion.</li>
                    <li>The user account has been banned or suspended for violating our <a href="/terms">Terms of Service</a> or academic integrity rules.</li>
                    <li>Repetitive refund abuse (e.g. enrolling in and refunding multiple courses in succession).</li>
                </ul>
            </section>

            {/* Section 5 */}
            <section id="exchange-option" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    5. Course Exchange & Wallet Credits
                </h2>
                <p>
                    If a course wasn't the right fit for your career goals, you may choose a <strong>100% Course Exchange Credit</strong> instead of a bank/gateway refund.
                </p>
                <div className="not-prose bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#0066CC]" />
                        Instant Course Switch
                    </p>
                    <p className="text-blue-800">
                        Course exchange credits are issued instantly to your student account without waiting for bank clearance, allowing you to immediately enroll in any alternative course of equal or lesser value.
                    </p>
                </div>
            </section>

            {/* Section 6 */}
            <section id="how-to-request" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    6. Step-by-Step: How to Request a Refund
                </h2>
                <div className="space-y-3 not-prose my-4 text-xs">
                    <div className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="w-6 h-6 rounded-full bg-[#0066CC] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                        <div>
                            <strong className="text-gray-900 block mb-0.5">Locate Your Order Information</strong>
                            <p className="text-gray-600">Find your Order Reference ID from your purchase confirmation email or student dashboard billing history.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="w-6 h-6 rounded-full bg-[#0066CC] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                        <div>
                            <strong className="text-gray-900 block mb-0.5">Email Billing Support</strong>
                            <p className="text-gray-600">
                                Send an email to <a href="mailto:billing@gpibd.com" className="text-[#0066CC] font-semibold underline">billing@gpibd.com</a> with the subject line <code>"Refund Request - [Order ID]"</code>.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="w-6 h-6 rounded-full bg-[#0066CC] text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                        <div>
                            <strong className="text-gray-900 block mb-0.5">Verification & Approval</strong>
                            <p className="text-gray-600">Our support team will verify your course progress and respond within 24 to 48 business hours with the status of your request.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 7 */}
            <section id="timelines-methods" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    7. Processing Timelines & Payout Methods
                </h2>
                <p>
                    Once approved, refunds are credited back to the original payment source used during checkout:
                </p>

                <div className="overflow-x-auto not-prose my-4">
                    <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                        <thead className="bg-gray-100 text-gray-800 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="p-3 border-b">Payment Method</th>
                                <th className="p-3 border-b">Gateway / Provider</th>
                                <th className="p-3 border-b">Estimated Processing Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-600">
                            <tr>
                                <td className="p-3 font-medium text-gray-900 flex items-center gap-1.5">
                                    <Smartphone className="w-3.5 h-3.5 text-pink-600" />
                                    <span>Mobile Financial Services</span>
                                </td>
                                <td className="p-3">bKash, Nagad, Rocket</td>
                                <td className="p-3 font-semibold text-emerald-700">3 to 7 business days</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium text-gray-900 flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Credit / Debit Cards</span>
                                </td>
                                <td className="p-3">Visa, MasterCard, Amex via SSLCommerz</td>
                                <td className="p-3 font-semibold text-blue-700">7 to 14 business days</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium text-gray-900 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>GPI Course Credit</span>
                                </td>
                                <td className="p-3">Student Portal Wallet</td>
                                <td className="p-3 font-semibold text-purple-700">Instant (within 2 hours)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Section 8 */}
            <section id="payment-gateway-fees" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    8. Payment Gateway Fees & Deductions
                </h2>
                <p>
                    Depending on the third-party payment gateway used, non-refundable transaction processing charges (typically 1.5% to 2.5% charged by the card network or mobile wallet operator) may be deducted from the gross refunded amount as per banking regulations.
                </p>
            </section>

            {/* Section 9 */}
            <section id="abuse-prevention" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    9. Anti-Abuse & Chargeback Policy
                </h2>
                <p>
                    GPI monitors enrollment and refund patterns to protect our instructors and intellectual property. If we detect fraudulent chargeback attempts or bad-faith refund exploitation, we reserve the right to ban associated payment methods, phone numbers, and email domains permanently.
                </p>
            </section>

            {/* Section 10 */}
            <section id="contact-billing" className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    10. Contact Billing & Support
                </h2>
                <p>
                    Need assistance with an ongoing refund request or payment inquiry? Reach out directly to our finance and student billing desk:
                </p>
                <div className="not-prose bg-linear-to-r from-emerald-50/70 to-slate-50 border border-emerald-200 rounded-2xl p-5 text-xs text-gray-700 space-y-2">
                    <p className="font-bold text-sm text-gray-900">Global Professional Skill — Student Billing Office</p>
                    <p className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <span>Billing Email: <a href="mailto:billing@gpibd.com" className="text-emerald-700 font-semibold hover:underline">billing@gpibd.com</a></span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                        <HelpCircle className="w-4 h-4 text-emerald-600" />
                        <span>General Support: <a href="mailto:support@gpibd.com" className="text-emerald-700 font-semibold hover:underline">support@gpibd.com</a></span>
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
};

export default RefundPage;
