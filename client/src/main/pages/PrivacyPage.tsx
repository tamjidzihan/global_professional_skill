import React from 'react';
import {
    Shield,
    ShieldCheck,
    Database,
    Mail,
    Phone,
    MapPin,
    UserCheck,
    Globe,
} from 'lucide-react';
import { LegalLayout, type TocItem } from '../components/LegalLayout';

const tocItems: TocItem[] = [
    { id: 'introduction', title: '1. Introduction & Overview' },
    { id: 'data-controller', title: '2. Data Controller Information' },
    { id: 'data-we-collect', title: '3. Information We Collect' },
    { id: 'how-we-collect', title: '4. How We Collect Information' },
    { id: 'purpose-processing', title: '5. Purpose & Legal Basis of Processing' },
    { id: 'sms-communication', title: '6. Mobile Phone & SMS Notifications' },
    { id: 'data-sharing', title: '7. Information Sharing & Third Parties' },
    { id: 'data-storage', title: '8. Data Storage, Security & Encryption' },
    { id: 'retention-policy', title: '9. Data Retention Policy' },
    { id: 'user-rights', title: '10. Your Privacy Rights' },
    { id: 'children-privacy', title: '11. Children’s Privacy' },
    { id: 'international-transfers', title: '12. International Data Transfers' },
    { id: 'policy-updates', title: '13. Changes to this Privacy Policy' },
    { id: 'contact-dpo', title: '14. Contact Our Data Protection Officer' },
];

export const PrivacyPage: React.FC = () => {
    return (
        <LegalLayout
            title="Privacy Policy"
            subtitle="Learn how Global Professional Skill collects, uses, protects, and manages your personal information across our LMS platform and learning services."
            lastUpdated="September 2026"
            effectiveDate="January 1, 2026"
            version="3.1"
            readTime="7 min read"
            icon={Shield}
            tocItems={tocItems}
        >
            {/* Quick Highlights / Callout Card */}
            <div className="not-prose bg-linear-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 border border-blue-200/80 rounded-2xl p-5 mb-8">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#0066CC] shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">
                            Our Core Privacy Commitment
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Global Professional Skill (GPI) values your trust. We do not sell your personal data to advertisers or third parties. We collect only what is strictly necessary to deliver high-quality professional education, secure account access, course progress tracking, and verifiable certificates.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 1 */}
            <section id="introduction" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    1. Introduction & Overview
                </h2>
                <p>
                    Welcome to <strong>Global Professional Skill</strong> (referred to as <em>"GPI," "we," "our,"</em> or <em>"us"</em>). We provide online courses, professional certifications, career counseling, assessments, and corporate training programs through our Learning Management System (LMS) at <code>gpibd.com</code>.
                </p>
                <p>
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you access our website, mobile interface, APIs, or interact with our learning services. By creating an account, enrolling in a course, or using our platform, you acknowledge that you have read and understood the practices described herein.
                </p>
            </section>

            {/* Section 2 */}
            <section id="data-controller" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    2. Data Controller Information
                </h2>
                <p>
                    The data controller responsible for your personal data is:
                </p>
                <div className="not-prose bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-1.5 text-gray-700">
                    <p className="font-bold text-gray-900">Global Professional Institute (GPI)</p>
                    <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>Dhaka, Bangladesh</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>privacy@gpibd.com / support@gpibd.com</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <span>https://gpibd.com</span>
                    </p>
                </div>
            </section>

            {/* Section 3 */}
            <section id="data-we-collect" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    3. Information We Collect
                </h2>
                <p>
                    We collect several types of information to provide, personalize, and improve your learning experience:
                </p>

                <h3 className="text-base font-bold text-gray-800 mt-4 mb-2">A. Personal Identification & Profile Data</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong>Account Information:</strong> First name, last name, email address, password hash (one-way encrypted).</li>
                    <li><strong>Mobile Number:</strong> Mandatory Bangladesh mobile number for account security, multi-factor verification, and instant SMS updates.</li>
                    <li><strong>Professional & Institutional Details:</strong> Organization name and Employee ID (optional, provided for corporate learning tracks or institutional verification).</li>
                    <li><strong>Profile Information:</strong> Biography, profile avatar/photo, social links, resume/qualifications (for instructor applicants).</li>
                </ul>

                <h3 className="text-base font-bold text-gray-800 mt-4 mb-2">B. Learning, Assessment & Academic Data</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Course enrollment history, lesson completion status, video watch time, quiz submissions, scores, and instructor feedback.</li>
                    <li>Certificate issuance records, unique certificate verification IDs, and completion timestamps.</li>
                    <li>Discussion forum posts, questions submitted to instructors, and course reviews.</li>
                </ul>

                <h3 className="text-base font-bold text-gray-800 mt-4 mb-2">C. Financial & Payment Information</h3>
                <p className="text-sm">
                    When you purchase courses or subscriptions, payments are securely processed through authorized payment gateway partners (such as bKash, Nagad, Rocket, or SSLCommerz). <strong>We do not store complete credit card numbers, CVVs, or mobile banking PINs on our servers.</strong> We receive only payment confirmation tokens, transaction reference IDs, and billing summaries.
                </p>

                <h3 className="text-base font-bold text-gray-800 mt-4 mb-2">D. Technical, Device & Log Information</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>IP address, browser type and version, operating system, device identifiers, language preferences.</li>
                    <li>Access timestamps, pages viewed, referring URLs, performance error logs, and session duration.</li>
                </ul>
            </section>

            {/* Section 4 */}
            <section id="how-we-collect" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    4. How We Collect Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose mt-4">
                    <div className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-1.5 font-bold text-sm text-gray-900">
                            <UserCheck className="w-4 h-4 text-[#0066CC]" />
                            <span>Direct Interactions</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            When you sign up, complete forms, submit quiz answers, upload profile photos, or contact our support team.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-1.5 font-bold text-sm text-gray-900">
                            <Database className="w-4 h-4 text-emerald-600" />
                            <span>Automated Telemetry</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Through cookies, server logs, and analytics scripts that track lesson completion and platform performance.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 5 */}
            <section id="purpose-processing" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    5. Purpose & Legal Basis of Processing
                </h2>
                <p>We process your data strictly under recognized legal bases:</p>
                <div className="overflow-x-auto not-prose my-4">
                    <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                        <thead className="bg-gray-100 text-gray-800 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="p-3 border-b">Processing Purpose</th>
                                <th className="p-3 border-b">Data Categories Used</th>
                                <th className="p-3 border-b">Legal Basis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-600">
                            <tr>
                                <td className="p-3 font-medium text-gray-900">Course delivery & progress tracking</td>
                                <td className="p-3">Identity, email, course enrollment, quiz scores</td>
                                <td className="p-3 font-semibold text-blue-700">Contractual Necessity</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium text-gray-900">Account verification via SMS & Email</td>
                                <td className="p-3">Email, Bangladesh mobile number, verification tokens</td>
                                <td className="p-3 font-semibold text-blue-700">Contractual & Security</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium text-gray-900">Certificate generation & public verification</td>
                                <td className="p-3">Full name, course completion record, issue date</td>
                                <td className="p-3 font-semibold text-emerald-700">Legitimate Interest</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium text-gray-900">Payment receipt & tax compliance</td>
                                <td className="p-3">Transaction ID, billing details, amount paid</td>
                                <td className="p-3 font-semibold text-amber-700">Legal Obligation</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Section 6 */}
            <section id="sms-communication" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    6. Mobile Phone & SMS Notifications
                </h2>
                <p>
                    Because account integrity is paramount, <strong>Global Professional Skill requires a valid mobile number during registration</strong>. We use your mobile number for:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Instant account verification links sent in Bangla via Unicode SMS.</li>
                    <li>Password reset authorization and two-factor authentication prompts.</li>
                    <li>Critical course updates, class rescheduling alerts, or emergency platform notices.</li>
                </ul>
                <div className="not-prose bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 my-3 text-xs text-emerald-900">
                    <p className="font-semibold mb-0.5">Spam-Free Policy:</p>
                    <p className="text-emerald-800">
                        We never send unsolicited third-party marketing SMS. You can adjust optional promotional notification preferences within your account settings at any time.
                    </p>
                </div>
            </section>

            {/* Section 7 */}
            <section id="data-sharing" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    7. Information Sharing & Third Parties
                </h2>
                <p>
                    We never sell or rent your personal information. We share data only with vetted service providers who are contractually bound to maintain rigorous confidentiality and security standards:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                    <li><strong>Instructors:</strong> Course instructors can view your enrolled name, quiz scores, and course progress to facilitate teaching and grading.</li>
                    <li><strong>SMS Gateways (Greenweb BD):</strong> Securely transmit verification tokens and essential service alerts to your phone.</li>
                    <li><strong>Payment Processors:</strong> Authorized financial institutions and gateways to complete transactions safely.</li>
                    <li><strong>Cloud & Hosting Infrastructure:</strong> High-security cloud hosting providers with encrypted databases and automated backups.</li>
                    <li><strong>Legal Compliance:</strong> If required by law, subpoena, court order, or governmental regulation to protect the rights, safety, or property of GPI and our users.</li>
                </ul>
            </section>

            {/* Section 8 */}
            <section id="data-storage" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    8. Data Storage, Security & Encryption
                </h2>
                <p>
                    We employ industry-leading security practices to protect your data from unauthorized access, loss, or misuse:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong>Encryption in Transit:</strong> TLS 1.3 / HTTPS encryption for all web and API traffic.</li>
                    <li><strong>Encryption at Rest:</strong> Sensitive credentials, tokens, and database snapshots are stored with AES-256 encryption.</li>
                    <li><strong>Password Hashing:</strong> Passwords are protected using secure PBKDF2/Argon2 one-way cryptographic hashing algorithms.</li>
                    <li><strong>Role-Based Access:</strong> Strict principle of least privilege for our administrative and technical staff.</li>
                </ul>
            </section>

            {/* Section 9 */}
            <section id="retention-policy" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    9. Data Retention Policy
                </h2>
                <p>
                    We retain your personal data for as long as your account remains active or as needed to provide you with educational services. If you delete your account, we will erase or anonymize your personal information, except where retention is required to satisfy statutory financial, audit, or legal dispute obligations (typically up to 6 years for financial transaction records).
                </p>
            </section>

            {/* Section 10 */}
            <section id="user-rights" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    10. Your Privacy Rights
                </h2>
                <p>
                    Depending on your jurisdiction and applicable data protection regulations, you have the following rights:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose my-4 text-xs">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <strong className="block text-gray-900 mb-1">Right to Access & Copy</strong>
                        <p className="text-gray-600">Request a complete copy of the personal information we hold about you.</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <strong className="block text-gray-900 mb-1">Right to Rectification</strong>
                        <p className="text-gray-600">Update inaccurate or incomplete information directly via your Profile settings.</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <strong className="block text-gray-900 mb-1">Right to Erasure ("To Be Forgotten")</strong>
                        <p className="text-gray-600">Request account deletion and removal of personal identifiers from our systems.</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <strong className="block text-gray-900 mb-1">Right to Withdraw Consent</strong>
                        <p className="text-gray-600">Opt-out of non-essential marketing emails and notifications at any time.</p>
                    </div>
                </div>
                <p className="text-xs text-gray-500">
                    To exercise any of these rights, please contact our Data Protection team at <a href="mailto:privacy@gpibd.com">privacy@gpibd.com</a>. We respond to all verified requests within 30 calendar days.
                </p>
            </section>

            {/* Section 11 */}
            <section id="children-privacy" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    11. Children’s Privacy
                </h2>
                <p>
                    Our platform is designed for adult learners, university students, and working professionals. We do not knowingly collect or solicit personal information from children under the age of 13. If we become aware that a child under 13 has provided us with personal data without verifiable parental consent, we will promptly delete such information.
                </p>
            </section>

            {/* Section 12 */}
            <section id="international-transfers" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    12. International Data Transfers
                </h2>
                <p>
                    Your data may be processed on servers located outside Bangladesh by our trusted cloud infrastructure providers. Whenever we transfer data internationally, we ensure adequate protection through standard contractual clauses and rigorous technical encryption standards.
                </p>
            </section>

            {/* Section 13 */}
            <section id="policy-updates" className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    13. Changes to this Privacy Policy
                </h2>
                <p>
                    We may periodically update this policy to reflect new platform features, legal requirements, or security enhancements. When material changes occur, we will notify you through an announcement banner on the LMS, an email notification, or an updated <em>"Last Updated"</em> timestamp at the top of this document.
                </p>
            </section>

            {/* Section 14 */}
            <section id="contact-dpo" className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    14. Contact Our Data Protection Officer
                </h2>
                <p>
                    If you have questions, feedback, or concerns regarding this Privacy Policy or our data handling practices, please reach out to us:
                </p>
                <div className="not-prose bg-linear-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-2xl p-5 text-xs text-gray-700 space-y-2">
                    <p className="font-bold text-sm text-gray-900">Global Professional Institute — Data Protection Office</p>
                    <p className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-[#0066CC]" />
                        <span>Email: <a href="mailto:privacy@gpibd.com" className="text-[#0066CC] font-semibold hover:underline">privacy@gpibd.com</a></span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-[#0066CC]" />
                        <span>Support Line: +880 1712-345678</span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-[#0066CC]" />
                        <span>Location: Dhaka, Bangladesh</span>
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
};

export default PrivacyPage;
