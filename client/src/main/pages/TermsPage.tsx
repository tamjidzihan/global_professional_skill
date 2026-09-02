import React from 'react';
import {
    FileText,
    AlertTriangle,
    Scale,
    CheckCircle2,
    Briefcase,
    Mail,
} from 'lucide-react';
import { LegalLayout, type TocItem } from '../components/LegalLayout';

const tocItems: TocItem[] = [
    { id: 'acceptance', title: '1. Acceptance of Terms & Eligibility' },
    { id: 'accounts', title: '2. User Accounts, Mobile Verification & Security' },
    { id: 'enrollment-license', title: '3. Course Enrollment & License Grant' },
    { id: 'pricing-payment', title: '4. Pricing, Payments & Taxes' },
    { id: 'code-of-conduct', title: '5. Student Code of Conduct & Academic Integrity' },
    { id: 'instructor-terms', title: '6. Instructor Terms & Content Submission' },
    { id: 'certificates', title: '7. Certificates, Badges & Verification' },
    { id: 'intellectual-property', title: '8. Intellectual Property Rights' },
    { id: 'termination', title: '9. Account Suspension & Termination' },
    { id: 'disclaimers', title: '10. Disclaimers of Warranties' },
    { id: 'limitation-liability', title: '11. Limitation of Liability & Indemnification' },
    { id: 'governing-law', title: '12. Governing Law & Dispute Resolution' },
    { id: 'modifications', title: '13. Changes to These Terms' },
    { id: 'contact', title: '14. Contact Information' },
];

export const TermsPage: React.FC = () => {
    return (
        <LegalLayout
            title="Terms of Service"
            subtitle="The legally binding agreement governing your access to and use of Global Professional Skill courses, platforms, assessments, and certifications."
            lastUpdated="September 2026"
            effectiveDate="January 1, 2026"
            version="3.2"
            readTime="9 min read"
            icon={FileText}
            tocItems={tocItems}
        >
            {/* Quick Summary Banner */}
            <div className="not-prose bg-linear-to-r from-blue-50/80 via-slate-50 to-blue-50/80 border border-blue-200/80 rounded-2xl p-5 mb-8">
                <div className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-[#0066CC] shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">
                            Important Agreement Summary
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            By creating an account or enrolling in a course on Global Professional Skill (GPI), you agree to these Terms of Service. Please read them thoroughly before using our educational services.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 1 */}
            <section id="acceptance" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    1. Acceptance of Terms & Eligibility
                </h2>
                <p>
                    These Terms of Service (<em>"Terms"</em>) constitute a binding legal agreement between you (<em>"User," "Student," "Instructor,"</em> or <em>"you"</em>) and <strong>Global Professional Institute (GPI)</strong> (<em>"we," "our,"</em> or <em>"us"</em>).
                </p>
                <p>
                    By registering, browsing, enrolling in courses, or purchasing any educational services through our website (<code>gpibd.com</code>) or related portals, you agree to comply with and be bound by these Terms and our associated <a href="/privacy">Privacy Policy</a>, <a href="/refund">Refund Policy</a>, and <a href="/cookies">Cookie Policy</a>.
                </p>
                <div className="not-prose bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 my-3 text-xs text-amber-900">
                    <strong>Age Requirement:</strong> You must be at least 18 years old, or the age of legal majority in your jurisdiction, or have verifiable parental/guardian consent if you are between 13 and 18 years of age.
                </div>
            </section>

            {/* Section 2 */}
            <section id="accounts" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    2. User Accounts, Mobile Verification & Security
                </h2>
                <p>
                    To access our course materials, live sessions, quizzes, and certificates, you must create a verified student or instructor account.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                    <li><strong>Accurate Information:</strong> You agree to provide true, accurate, current, and complete information, including your full legal name, valid email address, and a functional Bangladesh mobile number.</li>
                    <li><strong>Mandatory Mobile Verification:</strong> All accounts require mobile phone verification via SMS. GPI reserves the right to suspend unverified accounts.</li>
                    <li><strong>Credential Confidentiality:</strong> You are solely responsible for safeguarding your login credentials. You may not share, sell, transfer, or rent your account credentials to any third party.</li>
                    <li><strong>Account Responsibility:</strong> You are fully responsible for all activities, enrollments, and communications that occur under your account.</li>
                </ul>
            </section>

            {/* Section 3 */}
            <section id="enrollment-license" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    3. Course Enrollment & License Grant
                </h2>
                <p>
                    When you enroll in a course, GPI grants you a limited, personal, non-exclusive, non-transferable, revocable license to access and view the course content for which all required fees have been paid.
                </p>
                <h3 className="text-base font-bold text-gray-800 mt-4 mb-2">Scope of Use & Prohibitions</h3>
                <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 text-xs">
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Permitted Uses
                        </span>
                        <p className="text-emerald-800">
                            Streaming videos, downloading instructor-provided study notes and worksheets for your personal study, submitting quizzes, and earning verifiable certificates.
                        </p>
                    </div>
                    <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
                        <span className="font-bold text-rose-900 flex items-center gap-1.5 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Strictly Prohibited
                        </span>
                        <p className="text-rose-800">
                            Screen-recording, mass downloading videos, redistributing lecture recordings on YouTube/social media, torrenting, reverse engineering, or commercial reselling.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 4 */}
            <section id="pricing-payment" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    4. Pricing, Payments & Taxes
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                    <li><strong>Pricing:</strong> Course prices are listed in Bangladeshi Taka (BDT) or USD and are subject to change. Promotional discounts and coupon codes are valid only for the stated duration and terms.</li>
                    <li><strong>Payment Gateways:</strong> We support payments through recognized channels including bKash, Nagad, Rocket, Credit/Debit cards (Visa/Mastercard), and bank transfers.</li>
                    <li><strong>Taxes:</strong> All applicable value-added taxes (VAT) or government levies are calculated and presented at checkout in accordance with local regulations.</li>
                    <li><strong>Refunds:</strong> All purchases are subject to our dedicated <a href="/refund">Refund Policy</a>.</li>
                </ul>
            </section>

            {/* Section 5 */}
            <section id="code-of-conduct" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    5. Student Code of Conduct & Academic Integrity
                </h2>
                <p>
                    GPI is a community of ambitious learners and professionals. We maintain high standards of academic honesty, mutual respect, and ethical conduct.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong>Quiz & Exam Honesty:</strong> Quizzes, exams, and practical assignments must reflect your own original work. Using automated bots, sharing answer keys, or impersonating another student is strictly forbidden.</li>
                    <li><strong>Zero Harassment:</strong> We enforce zero tolerance for hate speech, discriminatory remarks, harassment of instructors or peers, spamming discussion boards, or disruptive behavior.</li>
                    <li><strong>Sanctions:</strong> Violations will result in immediate disqualification from course completion, forfeiture of certificates, and potential termination of account without refund.</li>
                </ul>
            </section>

            {/* Section 6 */}
            <section id="instructor-terms" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    6. Instructor Terms & Content Submission
                </h2>
                <p>
                    Instructors who apply and are approved to teach on GPI agree to our Instructor Agreement:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Instructors warrant that they own or have licensed all intellectual property rights for content they upload.</li>
                    <li>Content must be accurate, high-definition, professionally presented, and free from infringing materials.</li>
                    <li>Revenue payouts and royalty calculations are executed in accordance with agreed instructor tier schedules.</li>
                </ul>
            </section>

            {/* Section 7 */}
            <section id="certificates" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    7. Certificates, Badges & Verification
                </h2>
                <p>
                    Upon successful completion of all required lessons, practical assignments, and achieving the required passing score on all course quizzes (typically 70% or higher), students are awarded a verifiable digital Certificate of Completion.
                </p>
                <p>
                    Each certificate includes a unique verification identifier and QR code accessible via the GPI verification portal. GPI reserves the right to revoke any certificate obtained through fraudulent activity or policy breach.
                </p>
            </section>

            {/* Section 8 */}
            <section id="intellectual-property" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    8. Intellectual Property Rights
                </h2>
                <p>
                    All platform software, algorithms, UI design, course curriculums, branding logos, trade names, graphics, and video presentations are the exclusive property of Global Professional Institute or its licensors.
                </p>
                <p>
                    Nothing in these Terms conveys any ownership interest, trademark license, or proprietary rights to you, except for the limited personal viewing license explicitly set forth.
                </p>
            </section>

            {/* Section 9 */}
            <section id="termination" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    9. Account Suspension & Termination
                </h2>
                <p>
                    GPI reserves the right to immediately suspend or permanently terminate your account and access to courses if you:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Breach any provision of these Terms of Service.</li>
                    <li>Engage in payment fraud, unauthorized chargebacks, or credential sharing.</li>
                    <li>Attempt to hack, scrape, DDOS, or reverse engineer platform code.</li>
                </ul>
            </section>

            {/* Section 10 */}
            <section id="disclaimers" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    10. Disclaimers of Warranties
                </h2>
                <p>
                    The platform and all course materials are provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, whether express or implied.
                </p>
                <p>
                    While we strive for excellence, GPI does not guarantee uninterrupted or error-free platform uptime, specific salary outcomes, or guaranteed job placements unless explicitly specified under a formal corporate recruitment partnership.
                </p>
            </section>

            {/* Section 11 */}
            <section id="limitation-liability" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    11. Limitation of Liability & Indemnification
                </h2>
                <p>
                    To the maximum extent permitted by applicable law, GPI, its directors, employees, instructors, and affiliates shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from your use of the platform.
                </p>
                <p>
                    Our total aggregate liability for all claims related to the platform shall not exceed the total amount paid by you to GPI for the specific course giving rise to the claim during the six (6) months preceding the event.
                </p>
            </section>

            {/* Section 12 */}
            <section id="governing-law" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    12. Governing Law & Dispute Resolution
                </h2>
                <p>
                    These Terms shall be governed by and construed in accordance with the laws of the <strong>People's Republic of Bangladesh</strong>. Any dispute, controversy, or claim arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts in Dhaka, Bangladesh.
                </p>
            </section>

            {/* Section 13 */}
            <section id="modifications" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    13. Changes to These Terms
                </h2>
                <p>
                    We reserve the right to revise these Terms at any time. When updates are published, we will revise the <em>"Last Updated"</em> date at the top of this page. Your continued use of the platform after any such modification constitutes your binding acceptance of the revised Terms.
                </p>
            </section>

            {/* Section 14 */}
            <section id="contact" className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    14. Contact Information
                </h2>
                <p>
                    If you have questions or inquiries concerning our Terms of Service, please contact our legal counsel:
                </p>
                <div className="not-prose bg-linear-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-2xl p-5 text-xs text-gray-700 space-y-2">
                    <p className="font-bold text-sm text-gray-900">Global Professional Institute — Legal & Compliance</p>
                    <p className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-[#0066CC]" />
                        <span>Email: <a href="mailto:legal@gpibd.com" className="text-[#0066CC] font-semibold hover:underline">legal@gpibd.com</a></span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4 text-[#0066CC]" />
                        <span>Corporate Queries: <a href="mailto:info@gpibd.com" className="text-[#0066CC] font-semibold hover:underline">info@gpibd.com</a></span>
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
};

export default TermsPage;
